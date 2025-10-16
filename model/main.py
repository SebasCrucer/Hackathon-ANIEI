import cv2
from deepface import DeepFace
import time
import threading
import queue
import numpy as np
from collections import deque
import csv
from datetime import datetime
import os

# Parámetros
CAM_INDEX = 0           # cambia si tu webcam no es la 0
SKIP_FRAMES = 10        # analiza cada N fotogramas (aumentado para actualización más lenta)
DETECTOR = "opencv"     # "opencv" es más rápido para tiempo real que "retinaface"
ANALYSIS_WIDTH = 640    # Reduce resolución para análisis (más rápido)
ANALYSIS_HEIGHT = 480

# Parámetros para detección de estrés ACUMULATIVO
STRESS_HISTORY_SIZE = 60  # Más historial para mayor estabilidad
STRESS_INCREMENT_RATE = 0.3  # Menos sensible al aumento
STRESS_DECREMENT_RATE = 1.5  # Baja más rápido con emociones positivas
STRESS_DECAY_RATE = 0.7      # Relajación más rápida
MAX_STRESS_CHANGE = 1.5      # Cambios más suaves por frame

# Umbral de estrés alto (modificable)
HIGH_STRESS_THRESHOLD = 80.0  # Puedes ajustar este valor según tu preferencia


# Parámetros para suavizado de resultados
SMOOTHING_FACTOR = 0.8    # 0-1, mayor = más suave (0.8 = 80% anterior + 20% nuevo)

# Colas para comunicación entre hilos
frame_queue = queue.Queue(maxsize=2)
result_queue = queue.Queue(maxsize=1)
stop_event = threading.Event()

# Historial para análisis temporal
emotion_history = deque(maxlen=STRESS_HISTORY_SIZE)
stress_history = deque(maxlen=STRESS_HISTORY_SIZE)

# Variables para suavizado y ACUMULACIÓN DE ESTRÉS
accumulated_stress_level = 50.0  # Comienza en nivel neutro (50%)
previous_stress_level = 50.0

# Variables para CSV
csv_data = []
csv_filename = f"emotion_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

def calculate_stress_change(emotion_data):
    """
    Calcula cuánto debe CAMBIAR el nivel de estrés (positivo = sube, negativo = baja)
    basado en las emociones actuales
    """
    # Emociones que AUMENTAN el estrés
    angry = emotion_data.get('angry', 0)
    fear = emotion_data.get('fear', 0)
    sad = emotion_data.get('sad', 0)
    disgust = emotion_data.get('disgust', 0)

    # Emociones que DISMINUYEN el estrés
    happy = emotion_data.get('happy', 0)
    neutral = emotion_data.get('neutral', 0)
    surprise = emotion_data.get('surprise', 0)

    # Calcula "presión de estrés" (emociones negativas ponderadas)
    stress_pressure = (
        angry * 1.5 +      # Enojo aumenta mucho el estrés
        fear * 1.3 +       # Miedo aumenta el estrés
        sad * 0.8 +        # Tristeza aumenta moderadamente
        disgust * 1.0      # Disgusto aumenta el estrés
    ) / 100.0  # Normaliza a 0-1

    # Calcula "alivio de estrés" (emociones positivas ponderadas)
    stress_relief = (
        happy * 2.0 +      # Felicidad reduce mucho el estrés
        neutral * 0.5 +    # Neutralidad reduce un poco
        surprise * 0.3     # Sorpresa reduce levemente
    ) / 100.0  # Normaliza a 0-1

    # Cambio neto de estrés
    stress_change = (stress_pressure * STRESS_INCREMENT_RATE) - (stress_relief * STRESS_DECREMENT_RATE)

    # Si no hay emociones dominantes, aplica decaimiento natural (relajación)
    if stress_pressure < 0.1 and stress_relief < 0.1:
        stress_change -= STRESS_DECAY_RATE * 0.5

    # Limita el cambio máximo por frame
    stress_change = max(-MAX_STRESS_CHANGE, min(MAX_STRESS_CHANGE, stress_change))

    return stress_change

def calculate_stress_level(emotion_data, emotion_history_data):
    """
    Calcula nivel de estrés basado en múltiples factores:
    1. Emociones negativas (enojo, miedo, tristeza)
    2. Ausencia de emociones positivas
    3. Variabilidad emocional
    4. Tendencia temporal
    """
    stress_score = 0.0

    # Factor 1: Emociones negativas directas (40% del peso)
    angry = emotion_data.get('angry', 0)
    fear = emotion_data.get('fear', 0)
    sad = emotion_data.get('sad', 0)
    disgust = emotion_data.get('disgust', 0)

    negative_emotions = angry * 1.5 + fear * 1.3 + sad * 0.8 + disgust * 1.0
    stress_score += (negative_emotions / 4) * 0.4

    # Factor 2: Ausencia de emociones positivas (20% del peso)
    happy = emotion_data.get('happy', 0)
    neutral = emotion_data.get('neutral', 0)
    positive_deficit = max(0, 50 - (happy + neutral * 0.5))
    stress_score += positive_deficit * 0.4

    # Factor 3: Variabilidad emocional (indica inestabilidad) (20% del peso)
    if len(emotion_history_data) >= 5:
        recent_emotions = list(emotion_history_data)[-5:]
        dominant_emotions = [e.get('dominant_emotion', '') for e in recent_emotions]
        # Más cambios = más estrés
        changes = sum(1 for i in range(len(dominant_emotions)-1)
                     if dominant_emotions[i] != dominant_emotions[i+1])
        variability_score = (changes / 4) * 100
        stress_score += variability_score * 0.2

    # Factor 4: Tendencia temporal (20% del peso)
    if len(emotion_history_data) >= 3:
        recent_stress = [
            e.get('angry', 0) + e.get('fear', 0) + e.get('sad', 0)
            for e in list(emotion_history_data)[-3:]
        ]
        if len(recent_stress) >= 2:
            trend = recent_stress[-1] - recent_stress[0]
            if trend > 0:  # Emociones negativas aumentando
                stress_score += min(trend, 50) * 0.2

    # Normaliza a 0-100
    stress_score = min(100, max(0, stress_score))

    return stress_score

def get_stress_color(stress_level):
    """Retorna color BGR basado en nivel de estrés"""
    if stress_level < 30:
        return (0, 255, 0)  # Verde - Tranquilo
    elif stress_level < 50:
        return (0, 255, 255)  # Amarillo - Alerta leve
    elif stress_level < 75:
        return (0, 165, 255)  # Naranja - Estrés moderado
    else:
        return (0, 0, 255)  # Rojo - Estrés alto

def get_text_color_for_background(bg_color):
    """Retorna color de texto óptimo (negro o blanco) según el fondo"""
    # Calcula luminosidad del fondo usando fórmula estándar
    b, g, r = bg_color
    luminance = (0.299 * r + 0.587 * g + 0.114 * b)

    # Si el fondo es claro (amarillo, verde claro), usa texto negro
    if luminance > 160:
        return (0, 0, 0)  # Negro
    else:
        return (255, 255, 255)  # Blanco

def get_stress_label(stress_level):
    """Retorna etiqueta de estrés en español"""
    if stress_level < 30:
        return "Tranquilo"
    elif stress_level < 50:
        return "Alerta Leve"
    elif stress_level < 75:
        return "Estres Moderado"
    else:
        return "ESTRES ALTO"

def save_to_csv(data_row):
    """Guarda una fila de datos en el CSV"""
    global csv_data
    csv_data.append(data_row)

def export_csv():
    """Exporta todos los datos recolectados a un archivo CSV"""
    if not csv_data:
        print("⚠️  No hay datos para exportar")
        return

    try:
        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = [
                'timestamp', 'emotion', 'confidence', 'age',
                'stress_level', 'stress_status',
                'angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for row in csv_data:
                writer.writerow(row)

        print(f"\n✅ Datos exportados a: {csv_filename}")
        print(f"   Total de registros: {len(csv_data)}")
    except Exception as e:
        print(f"\n❌ Error al exportar CSV: {e}")

def analyze_worker():
    """Hilo de análisis en segundo plano para no bloquear el video"""
    print("🔄 Hilo de análisis iniciado...")
    while not stop_event.is_set():
        try:
            frame = frame_queue.get(timeout=1.0)
            if frame is None:
                break

            # Análisis de emociones y edad
            results = DeepFace.analyze(
                frame,
                actions=["emotion", "age"],
                detector_backend=DETECTOR,
                enforce_detection=False
            )

            # Normaliza resultados a lista
            if isinstance(results, dict):
                results = [results]

            # Actualiza resultados si la cola no está llena
            if not result_queue.full():
                result_queue.put(results)
        except queue.Empty:
            continue
        except Exception as e:
            # Silenciosamente ignora errores de análisis
            pass

    print("🛑 Hilo de análisis detenido")

def get_camera(max_tries=5):
    """Auto-detecta la cámara disponible"""
    print("📷 Buscando cámara disponible...")
    for i in range(max_tries):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            print(f"✅ Cámara encontrada en índice {i}")
            return cap
        cap.release()
    print("❌ No se encontró ninguna cámara")
    return None

def draw_label(img, text, x, y, bg_color=(0, 0, 0), text_color=None):
    """Dibuja etiqueta con fondo personalizable y texto legible"""
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.6
    thickness = 2

    # Si no se especifica color de texto, elige automáticamente según el fondo
    if text_color is None:
        text_color = get_text_color_for_background(bg_color)

    (w, h), _ = cv2.getTextSize(text, font, scale, thickness)
    cv2.rectangle(img, (x, y - h - 8), (x + w + 6, y), bg_color, -1)
    cv2.putText(img, text, (x + 3, y - 4), font, scale, text_color, thickness, cv2.LINE_AA)

def draw_stress_bar(img, stress_level, x, y, width=200, height=20):
    """Dibuja barra de estrés con gradiente de color"""
    # Fondo gris
    cv2.rectangle(img, (x, y), (x + width, y + height), (50, 50, 50), -1)

    # Barra de progreso con color según nivel
    fill_width = int((stress_level / 100) * width)
    color = get_stress_color(stress_level)
    cv2.rectangle(img, (x, y), (x + fill_width, y + height), color, -1)

    # Borde
    cv2.rectangle(img, (x, y), (x + width, y + height), (200, 200, 200), 2)

    # Texto del porcentaje
    text = f"{stress_level:.0f}%"
    font = cv2.FONT_HERSHEY_SIMPLEX
    (tw, th), _ = cv2.getTextSize(text, font, 0.5, 1)
    cv2.putText(img, text, (x + width + 10, y + height - 5),
                font, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

def main():
    global previous_stress_level

    # Precarga modelos para reducir latencia inicial
    print("⏳ Precargando modelos de DeepFace...")
    try:
        DeepFace.build_model("Emotion")
        print("✅ Modelos cargados")
    except Exception as e:
        print(f"⚠️  Error al precargar modelos: {e}")

    # Auto-detecta cámara
    cap = get_camera()
    if cap is None:
        print("❌ No se pudo abrir ninguna cámara. Verifica tu hardware.")
        return

    # Inicia hilo de análisis en segundo plano
    analysis_thread = threading.Thread(target=analyze_worker, daemon=True)
    analysis_thread.start()

    frame_count = 0
    last_results = []   # guardamos último análisis para suavizar visualización
    last_analysis_time = time.time()
    fps_list = []       # Para calcular FPS promedio
    current_stress_level = 0

    print("\n" + "="*60)
    print("🎥 Sistema de análisis de emociones y estrés en tiempo real")
    print("="*60)
    print("Controles:")
    print("  - Presiona 'q' para salir")
    print("  - Presiona 'f' para toggle FPS en pantalla")
    print("  - Presiona 's' para ver historial de estrés")
    print("  - Presiona 'e' para exportar datos a CSV manualmente")
    print("="*60)
    print("\n📊 Indicadores de estrés:")
    print("  🟢 Verde:   0-30%  - Tranquilo")
    print("  🟡 Amarillo: 30-50% - Alerta Leve")
    print("  🟠 Naranja: 50-70% - Estrés Moderado")
    print("  🔴 Rojo:    70-100% - Estrés Alto")
    print("="*60)
    print(f"\n💾 Los datos se guardarán automáticamente en: {csv_filename}")
    print("="*60 + "\n")

    show_fps = True
    show_stress_history = False

    try:
        while True:
            frame_start = time.time()
            ret, frame = cap.read()
            if not ret:
                print("⚠️  No se pudo leer frame de la cámara")
                break

            frame_count += 1

            # Analiza cada SKIP_FRAMES frames (para desempeño)
            if frame_count % SKIP_FRAMES == 0:
                # Reduce resolución para análisis (mantiene visualización original)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                analysis_frame = cv2.resize(rgb, (ANALYSIS_WIDTH, ANALYSIS_HEIGHT))

                # Envía frame a analizar sin bloquear
                if not frame_queue.full():
                    frame_queue.put(analysis_frame)

            # Obtiene resultados sin bloquear
            try:
                new_results = result_queue.get_nowait()
                last_results = new_results
                last_analysis_time = time.time()

                # Actualiza historial de emociones para análisis de estrés
                if new_results and len(new_results) > 0:
                    emotion_history.append(new_results[0].get('emotion', {}))
            except queue.Empty:
                pass

            # Dibuja resultados más recientes sobre el frame actual
            if last_results:
                # Obtiene dimensiones del frame original
                orig_h, orig_w = frame.shape[:2]
                scale_x = orig_w / ANALYSIS_WIDTH
                scale_y = orig_h / ANALYSIS_HEIGHT

                for r in last_results:
                    # Caja de cara (si el detector la provee)
                    region = r.get("region", {})
                    x = int(region.get("x", 0) * scale_x)
                    y = int(region.get("y", 0) * scale_y)
                    w = int(region.get("w", 0) * scale_x)
                    h = int(region.get("h", 0) * scale_y)

                    # Calcula nivel de estrés ACUMULATIVO
                    emotion_data = r.get("emotion", {})
                    if emotion_data:
                        # Calcula cuánto debe cambiar el estrés
                        stress_change = calculate_stress_change(emotion_data)

                        # Actualiza el nivel de estrés acumulado
                        global accumulated_stress_level
                        accumulated_stress_level += stress_change

                        # Limita entre 0 y 100
                        accumulated_stress_level = max(0.0, min(100.0, accumulated_stress_level))

                        # Aplica suavizado para transiciones más graduales
                        stress_level = (SMOOTHING_FACTOR * previous_stress_level +
                                      (1 - SMOOTHING_FACTOR) * accumulated_stress_level)
                        previous_stress_level = stress_level

                        stress_history.append(stress_level)
                        current_stress_level = stress_level

                        # Color del rectángulo según estrés
                        box_color = get_stress_color(stress_level)

                        # Guarda datos en CSV
                        emotion = r.get("dominant_emotion", "unknown")
                        age = r.get("age", None)
                        em_probs = r.get("emotion", {})
                        confidence = em_probs.get(emotion, 0)

                        data_row = {
                            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            'emotion': emotion,
                            'confidence': f"{confidence:.2f}",
                            'age': int(round(age)) if age is not None else 'N/A',
                            'stress_level': f"{stress_level:.2f}",
                            'stress_status': get_stress_label(stress_level),
                            'angry': f"{emotion_data.get('angry', 0):.2f}",
                            'disgust': f"{emotion_data.get('disgust', 0):.2f}",
                            'fear': f"{emotion_data.get('fear', 0):.2f}",
                            'happy': f"{emotion_data.get('happy', 0):.2f}",
                            'sad': f"{emotion_data.get('sad', 0):.2f}",
                            'surprise': f"{emotion_data.get('surprise', 0):.2f}",
                            'neutral': f"{emotion_data.get('neutral', 0):.2f}"
                        }
                        save_to_csv(data_row)
                    else:
                        box_color = (0, 255, 0)
                        stress_level = current_stress_level  # Mantiene el nivel actual

                    if w > 0 and h > 0:
                        # Dibuja rectángulo con grosor variable según estrés
                        thickness = 2 if stress_level < 70 else 4
                        cv2.rectangle(frame, (x, y), (x + w, y + h), box_color, thickness)

                    # Emoción dominante y edad estimada
                    emotion = r.get("dominant_emotion", "unknown")
                    age = r.get("age", None)

                    # Traduce emociones al español
                    emotion_translation = {
                        "angry": "Enojado",
                        "disgust": "Disgustado",
                        "fear": "Miedo",
                        "happy": "Feliz",
                        "sad": "Triste",
                        "surprise": "Sorprendido",
                        "neutral": "Neutral"
                    }
                    emotion_es = emotion_translation.get(emotion, emotion)

                    label_lines = []
                    if emotion:
                        # Obtiene confianza de la emoción
                        em_probs = r.get("emotion", {})
                        confidence = em_probs.get(emotion, 0)
                        label_lines.append(f"Emocion: {emotion_es} ({confidence:.1f}%)")

                    if age is not None:
                        try:
                            label_lines.append(f"Edad: {int(round(age))} anos")
                        except Exception:
                            label_lines.append("Edad: desconocida")

                    # Añade nivel de estrés
                    stress_label = get_stress_label(stress_level)
                    label_lines.append(f"Estres: {stress_label}")

                    # Posición texto
                    tx = x if w > 0 else 10
                    ty = y - 10 if y - 10 > 15 else (15 if h == 0 else y + h + 25)

                    # Dibuja cada línea
                    for i, line in enumerate(label_lines):
                        # Color de fondo según si es línea de estrés
                        if "Estres:" in line:
                            bg_color = get_stress_color(stress_level)
                            # Texto legible automático según fondo
                            text_color = get_text_color_for_background(bg_color)
                            draw_label(frame, line, tx, ty + i * 24, bg_color, text_color)
                        else:
                            draw_label(frame, line, tx, ty + i * 24)

            # Panel de información en la parte superior
            panel_height = 120
            panel = np.zeros((panel_height, frame.shape[1], 3), dtype=np.uint8)
            panel[:] = (40, 40, 40)  # Fondo gris oscuro

            # Calcula y muestra FPS
            frame_time = time.time() - frame_start
            if frame_time > 0:
                current_fps = 1.0 / frame_time
                fps_list.append(current_fps)
                if len(fps_list) > 30:  # Promedio de últimos 30 frames
                    fps_list.pop(0)
                avg_fps = sum(fps_list) / len(fps_list)

                if show_fps:
                    draw_label(panel, f"FPS: {avg_fps:.1f}", 10, 25)

                    # Muestra tiempo desde último análisis
                    time_since_analysis = time.time() - last_analysis_time
                    if time_since_analysis < 2.0:  # Solo si es reciente
                        draw_label(panel, f"Analisis: {time_since_analysis:.1f}s", 10, 55)

            # Barra de estrés en el panel
            draw_label(panel, "Nivel de Estres:", 10, 90)
            draw_stress_bar(panel, current_stress_level, 140, 70, 300, 25)

            # Etiqueta de estado
            stress_status = get_stress_label(current_stress_level)
            status_color = get_stress_color(current_stress_level)
            text_color = get_text_color_for_background(status_color)
            draw_label(panel, stress_status, 460, 90, status_color, text_color)

            # Muestra contador de registros guardados
            draw_label(panel, f"Registros: {len(csv_data)}", frame.shape[1] - 150, 25)

            # Combina panel con frame
            combined = np.vstack([panel, frame])

            # Muestra historial de estrés si está activado
            if show_stress_history and len(stress_history) > 1:
                # Dibuja gráfico de historial
                graph_height = 100
                graph_width = min(400, len(stress_history) * 20)
                graph = np.zeros((graph_height, graph_width, 3), dtype=np.uint8)
                graph[:] = (20, 20, 20)

                # Dibuja línea de historial
                points = []
                for i, stress in enumerate(stress_history):
                    x = int((i / len(stress_history)) * graph_width)
                    y = graph_height - int((stress / 100) * graph_height)
                    points.append((x, y))

                if len(points) > 1:
                    for i in range(len(points) - 1):
                        cv2.line(graph, points[i], points[i+1], (0, 255, 255), 2)

                # Overlay del gráfico
                x_offset = combined.shape[1] - graph_width - 10
                y_offset = panel_height + 10
                combined[y_offset:y_offset+graph_height, x_offset:x_offset+graph_width] = graph

            cv2.imshow("Detector de Emociones y Estres (GPU Acelerada)", combined)

            # Manejo de teclas
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("\n👋 Saliendo...")
                break
            elif key == ord('f'):
                show_fps = not show_fps
                print(f"FPS display: {'ON' if show_fps else 'OFF'}")
            elif key == ord('s'):
                show_stress_history = not show_stress_history
                print(f"Historial de estrés: {'ON' if show_stress_history else 'OFF'}")
            elif key == ord('e'):
                print("\n💾 Exportando datos manualmente...")
                export_csv()

    except KeyboardInterrupt:
        print("\n⚠️  Interrupción del usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Limpieza de recursos
        print("🧹 Liberando recursos...")
        stop_event.set()
        frame_queue.put(None)  # Señal de stop al hilo
        analysis_thread.join(timeout=2.0)
        cap.release()
        cv2.destroyAllWindows()
        print("✅ Recursos liberados correctamente")

        # Exporta datos automáticamente al cerrar
        print("\n💾 Exportando datos automáticamente...")
        export_csv()

        # Reporte final de estrés
        if len(stress_history) > 0:
            avg_stress = sum(stress_history) / len(stress_history)
            max_stress = max(stress_history)
            print("\n📊 Resumen de la sesión:")
            print(f"  • Estrés promedio: {avg_stress:.1f}%")
            print(f"  • Estrés máximo: {max_stress:.1f}%")
            print(f"  • Muestras analizadas: {len(stress_history)}")

if __name__ == "__main__":
    main()
