# 📊 Sistema de Detección de Estrés en Tiempo Real

Sistema inteligente de análisis emocional y detección de estrés mediante visión por computadora, utilizando DeepFace y OpenCV con aceleración GPU.

---

## 🚀 Características Principales

- ✅ **Detección de emociones en tiempo real** (7 emociones: enojo, disgusto, miedo, felicidad, tristeza, sorpresa, neutral)
- ✅ **Estimación de edad** automática
- ✅ **Análisis de estrés acumulativo** basado en 4 factores científicos
- ✅ **Visualización intuitiva** con código de colores y gráficos
- ✅ **Exportación automática de datos** a CSV para análisis posterior
- ✅ **Aceleración GPU** (Apple Metal para Mac M1/M2/M3, CUDA para NVIDIA)
- ✅ **Interfaz interactiva** con controles en vivo
- ✅ **Historial temporal** de emociones y estrés
- ✅ **Reportes detallados** al finalizar la sesión

---

## 📋 Requisitos del Sistema

### Hardware Mínimo
- **CPU:** Procesador dual-core 2.0 GHz o superior
- **RAM:** 4 GB mínimo, 8 GB recomendado
- **Cámara:** Webcam integrada o externa
- **GPU (Opcional):** 
  - Mac: Apple Silicon (M1/M2/M3) con Metal
  - Windows/Linux: NVIDIA GPU con CUDA

### Software
- **Python:** 3.8 - 3.10 (recomendado 3.10)
- **Sistema Operativo:** macOS, Windows 10/11, o Linux

---

## 🛠️ Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/ritmo.git
cd ritmo
```

### 2. Crea un entorno virtual (recomendado)

```bash
# En macOS/Linux
python3 -m venv ritmo_env
source ritmo_env/bin/activate

# En Windows
python -m venv ritmo_env
ritmo_env\Scripts\activate
```

### 3. Instala las dependencias

Edita el archivo `requirements.txt` según tu hardware:

**Para Mac con chip Apple (M1/M2/M3):**
```txt
opencv-python==4.8.1.78
deepface==0.0.95
numpy==1.26.4
pandas==2.2.3
tensorflow-macos==2.16.2
tensorflow-metal==1.1.0
```

**Para Windows/Linux con GPU NVIDIA:**
```txt
opencv-python==4.8.1.78
deepface==0.0.95
numpy==1.26.4
pandas==2.2.3
tensorflow==2.16.2
```

**Para solo CPU (sin GPU):**
```txt
opencv-python==4.8.1.78
deepface==0.0.95
numpy==1.26.4
pandas==2.2.3
tensorflow==2.16.2
```

Luego instala:

```bash
pip install -r requirements.txt
```

### 4. Verifica la instalación

```bash
python check_gpu.py  # Verifica si la GPU está disponible
python main.py       # Inicia el sistema
```

---

## 🎯 ¿Cómo funciona?

El sistema detecta estrés mediante **4 factores principales**:

### 1️⃣ **Emociones Negativas (40% del peso)**
- **Enojo** (peso: 1.5x) - Indica frustración/irritabilidad
- **Miedo** (peso: 1.3x) - Señal de ansiedad
- **Tristeza** (peso: 0.8x) - Puede indicar agotamiento
- **Disgusto** (peso: 1.0x) - Rechazo emocional

**Ejemplo:** Si estás enojado al 80%, esto contribuye 48% al nivel de estrés total.

### 2️⃣ **Ausencia de Emociones Positivas (20% del peso)**
- Si tienes menos del 50% de emociones positivas (feliz + neutral)
- **Mayor déficit = Mayor estrés**

**Ejemplo:** 10% feliz + 20% neutral = 30% positivo → 20% de déficit → contribuye al estrés

### 3️⃣ **Variabilidad Emocional (20% del peso)**
- Analiza los últimos 5 análisis
- Cuenta cuántas veces cambia tu emoción dominante
- **Más cambios = Más inestabilidad = Más estrés**

**Ejemplo:** Si cambias de "neutral" → "enojado" → "triste" → "feliz" → "neutral" en 30 segundos, esto indica alta variabilidad emocional.

### 4️⃣ **Tendencia Temporal (20% del peso)**
- Compara emociones negativas en los últimos 3 análisis
- Si las emociones negativas **aumentan**, el estrés sube
- Si disminuyen, el estrés baja

**Ejemplo:** Enojo en últimos 3 análisis: 20% → 40% → 60% = tendencia ascendente = estrés aumentando

---

## 🎨 Código de Colores

| Color | Rango | Estado | Significado |
|-------|-------|--------|-------------|
| 🟢 Verde | 0-30% | **Tranquilo** | Estado emocional estable y positivo |
| 🟡 Amarillo | 30-50% | **Alerta Leve** | Inicio de tensión emocional |
| 🟠 Naranja | 50-75% | **Estrés Moderado** | Necesitas tomar un descanso |
| 🔴 Rojo | 75-100% | **ESTRÉS ALTO** | ⚠️ Estado crítico - descanso urgente |

---

## 🎮 Controles del Sistema

| Tecla | Función |
|-------|---------|
| **Q** | Salir del programa y exportar datos automáticamente |
| **F** | Mostrar/ocultar indicador de FPS |
| **S** | Mostrar/ocultar gráfico de historial de estrés |
| **E** | Exportar datos a CSV manualmente |

---

## 📊 Elementos de la Interfaz

### Panel Superior
- **FPS** - Rendimiento en tiempo real del sistema
- **Tiempo desde último análisis** - Latencia de procesamiento
- **Barra de Estrés** - Visualización del nivel actual (0-100%)
- **Estado de Estrés** - Etiqueta con código de color (Tranquilo/Alerta/Moderado/Alto)
- **Contador de Registros** - Número de análisis guardados

### Sobre el Rostro
- **Emoción actual** + nivel de confianza (%)
- **Edad estimada** en años
- **Nivel de estrés** con color de fondo según nivel
- **Rectángulo de color** que cambia según estrés:
  - Verde: Tranquilo
  - Amarillo: Alerta
  - Naranja: Estrés moderado
  - Rojo: Estrés alto (con grosor más grueso para mayor visibilidad)

### Gráfico de Historial (Tecla 'S')
- Línea temporal de los últimos 40 análisis
- Visualiza tendencias: ¿está subiendo o bajando tu estrés?
- Útil para ver patrones durante sesiones largas

---

## 📁 Exportación de Datos (CSV)

El sistema guarda automáticamente cada análisis en un archivo CSV con el formato:

```
emotion_data_YYYYMMDD_HHMMSS.csv
```

### Estructura del CSV

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `timestamp` | Fecha y hora del análisis | 2025-10-16 14:30:45 |
| `emotion` | Emoción dominante | happy |
| `confidence` | Confianza de la emoción (%) | 85.5 |
| `age` | Edad estimada | 28 |
| `stress_level` | Nivel de estrés (0-100) | 45.2 |
| `stress_status` | Estado (Tranquilo/Alerta/Moderado/Alto) | Alerta Leve |
| `angry` | % de enojo | 5.2 |
| `disgust` | % de disgusto | 1.3 |
| `fear` | % de miedo | 3.1 |
| `happy` | % de felicidad | 85.5 |
| `sad` | % de tristeza | 2.0 |
| `surprise` | % de sorpresa | 1.5 |
| `neutral` | % de neutralidad | 1.4 |

### Exportación Manual

Presiona **'E'** durante la ejecución para exportar los datos sin cerrar el programa.

### Exportación Automática

Al presionar **'Q'** para salir, los datos se exportan automáticamente.

---

## ⚙️ Ajuste de Parámetros

Puedes modificar la sensibilidad del sistema editando `main.py`:

```python
# Parámetros para detección de estrés ACUMULATIVO
STRESS_HISTORY_SIZE = 40         # Número de análisis para historial (↑ = más estable)
STRESS_INCREMENT_RATE = 0.3      # Velocidad de aumento (↓ = menos sensible)
STRESS_DECREMENT_RATE = 1.5      # Velocidad de reducción (↑ = baja más rápido)
STRESS_DECAY_RATE = 0.7          # Relajación natural (↑ = más rápido)
MAX_STRESS_CHANGE = 1.5          # Cambio máximo por frame (↓ = más suave)

# Umbral de estrés alto
HIGH_STRESS_THRESHOLD = 80.0     # % para considerar estrés alto (↑ = menos sensible)
```

### Recomendaciones según tu uso:

**Sistema muy sensible (reacciona rápido):**
```python
STRESS_INCREMENT_RATE = 0.5
STRESS_DECREMENT_RATE = 1.0
MAX_STRESS_CHANGE = 3.0
```

**Sistema equilibrado (recomendado):**
```python
STRESS_INCREMENT_RATE = 0.3
STRESS_DECREMENT_RATE = 1.5
MAX_STRESS_CHANGE = 1.5
```

**Sistema poco sensible (muy estable):**
```python
STRESS_INCREMENT_RATE = 0.2
STRESS_DECREMENT_RATE = 2.0
MAX_STRESS_CHANGE = 1.0
```

---

## 🖥️ Uso de GPU

### Verificar si la GPU está activa

```bash
python check_gpu.py
```

**Salida esperada en Mac M1/M2/M3:**
```
Metal device set to: Apple M1 Max
GPU disponible: True
```

**Salida esperada en NVIDIA GPU:**
```
GPU 0: NVIDIA GeForce RTX 3080
GPU disponible: True
```

### Solución de Problemas GPU

**Mac:** Si `tensorflow-metal` no se detecta:
```bash
pip uninstall tensorflow-metal
pip install tensorflow-metal==1.1.0
```

**NVIDIA:** Si CUDA no se detecta:
```bash
# Verifica versión de CUDA
nvidia-smi

# Instala TensorFlow compatible
pip install tensorflow==2.16.2
```

---

## 🔧 Explicación del Código (`main.py`)

### Arquitectura del Sistema

El sistema utiliza **programación multihilo** para no bloquear el video:

1. **Hilo Principal (Main Thread)**
   - Captura frames de la webcam a 30+ FPS
   - Renderiza la interfaz con OpenCV
   - Maneja controles de teclado
   - Actualiza visualizaciones

2. **Hilo de Análisis (Worker Thread)**
   - Procesa frames con DeepFace en segundo plano
   - Detecta rostros y analiza emociones
   - Calcula edad estimada
   - Envía resultados al hilo principal via `queue`

### Flujo de Procesamiento

```
1. Captura frame de webcam
   ↓
2. Cada N frames → envía a cola de análisis
   ↓
3. Worker thread analiza con DeepFace
   ↓
4. Calcula nivel de estrés (4 factores)
   ↓
5. Actualiza historial y acumula estrés
   ↓
6. Renderiza resultados en pantalla
   ↓
7. Guarda datos en memoria para CSV
   ↓
8. Repite desde paso 1
```

### Funciones Clave

**`calculate_stress_change(emotion_data)`**
- Calcula cuánto debe cambiar el estrés basado en emociones actuales
- Retorna valor positivo (aumenta) o negativo (disminuye)

**`calculate_stress_level(emotion_data, emotion_history)`**
- Combina los 4 factores de estrés
- Retorna puntuación 0-100

**`get_stress_color(stress_level)`**
- Retorna color BGR según nivel de estrés

**`draw_stress_bar(img, stress_level, x, y)`**
- Dibuja barra de progreso con gradiente de color

**`save_to_csv(data_row)`**
- Guarda análisis en memoria para exportación posterior

**`export_csv()`**
- Escribe todos los datos en archivo CSV

---

## 📈 Casos de Uso

### 1. **Trabajo/Estudio**
Monitorea tu nivel de estrés durante sesiones largas:
- Si llega a **naranja/rojo**: Toma un descanso de 5-10 minutos
- Objetivo: Mantener el nivel en **verde/amarillo**
- Revisa el CSV después para ver picos de estrés

### 2. **Meditación/Relajación**
Verifica que tus técnicas funcionen:
- Antes: Posiblemente naranja/rojo
- Durante/Después: Debería bajar a amarillo/verde
- Usa el gráfico de historial para ver la reducción en tiempo real

### 3. **Reuniones/Presentaciones**
Analiza tu respuesta emocional en situaciones estresantes:
- Identifica qué momentos generan más estrés
- Revisa el reporte final para ver picos máximos
- Analiza el CSV para correlacionar eventos con emociones

### 4. **Gaming/Competitivo**
Monitorea tu estado emocional durante juegos:
- Identifica momentos de frustración (rojo/naranja)
- Detecta flow state óptimo (verde/amarillo)
- Analiza patrones de tilting en el CSV

### 5. **Desarrollo de Software**
Monitorea burnout durante sesiones de código:
- Establece alertas cuando llegue a naranja
- Toma descansos proactivos
- Correlaciona bugs/errores con nivel de estrés

---

## 📊 Reporte Final

Al cerrar el programa (presionar 'Q'), verás un resumen completo:

```
📊 Resumen de la sesión:
  • Estrés promedio: 45.3%
  • Estrés máximo: 78.2%
  • Muestras analizadas: 156

💾 Datos exportados a: emotion_data_20251016_143045.csv
   Total de registros: 156
```

**Interpretación:**
- **Promedio bajo (<40%)**: Sesión tranquila ✅
- **Promedio medio (40-60%)**: Sesión con tensión moderada ⚠️
- **Promedio alto (>60%)**: Sesión muy estresante 🚨

---

## 🔬 Interpretación Científica

### ¿Por qué funciona?

El estrés no es una emoción única, sino un **patrón complejo** que incluye:

1. **Emociones negativas persistentes** (enojo, miedo, tristeza)
2. **Falta de emociones positivas** (no estar feliz/neutral)
3. **Inestabilidad emocional** (cambios rápidos)
4. **Tendencia negativa** (emociones empeorando)

Este algoritmo combina estos 4 factores para dar una **puntuación de estrés holística**.

### Base Científica

- **Modelo de Emociones de Ekman**: 7 emociones universales
- **Teoría del Estrés de Lazarus**: Evaluación cognitiva de amenazas
- **Análisis de Series Temporales**: Patrones y tendencias
- **Psicología Afectiva**: Combinación de estados emocionales

### Limitaciones

⚠️ **Este sistema NO es diagnóstico médico**. Es una herramienta de **bienestar** que:
- Ayuda a **tomar conciencia** de tu estado emocional
- Sugiere **pausas proactivas**
- Monitorea **tendencias** en tiempo real
- Proporciona datos para autoanálisis

**No reemplaza:**
- Consulta médica profesional
- Diagnóstico clínico de trastornos de ansiedad
- Terapia psicológica
- Evaluación de salud mental

Para problemas de salud mental, consulta un profesional certificado.

---

## 🚀 Mejoras Futuras

Funcionalidades que podrías implementar:

### ✅ Ya Implementadas
- ✅ Exportación de datos a CSV
- ✅ Análisis temporal con historial
- ✅ Aceleración GPU (Metal/CUDA)
- ✅ Visualización en tiempo real
- ✅ Sistema de estrés acumulativo

### 🔜 Por Implementar
1. **Alertas sonoras** cuando el estrés supere un umbral configurable
2. **Dashboard web** con Flask/Streamlit para análisis histórico
3. **Detección de parpadeo** para medir fatiga ocular
4. **Análisis de postura** usando MediaPipe Pose
5. **Integración con wearables** (Apple Watch, Fitbit) para frecuencia cardíaca
6. **Machine Learning personalizado** - modelo entrenado con tus datos
7. **Notificaciones push** a móvil cuando detecta estrés alto
8. **API REST** para integración con otras apps
9. **Modo servidor** para monitorear múltiples personas
10. **Análisis de voz** para detectar estrés por tono/ritmo

---

## 💡 Tips para Reducir Estrés

Si ves **naranja/rojo** frecuentemente:

### Técnicas Inmediatas (< 5 minutos)
1. ✅ **Respiración 4-7-8**: Inhala 4 seg, mantén 7 seg, exhala 8 seg (repite 4 veces)
2. ✅ **Regla 20-20-20**: Cada 20 min, mira algo a 20 pies (6m) por 20 seg
3. ✅ **Estiramiento rápido**: Brazos arriba, giro de cuello, estira la espalda
4. ✅ **Agua fría en la cara**: Activa el nervio vago, reduce estrés inmediatamente

### Técnicas de Sesión (5-30 minutos)
5. ✅ **Técnica Pomodoro**: 25 min trabajo + 5 min descanso obligatorio
6. ✅ **Caminata corta**: 5-10 minutos fuera de tu estación de trabajo
7. ✅ **Meditación guiada**: Apps como Calm, Headspace, o YouTube
8. ✅ **Música relajante**: Playlist de música ambiente o naturaleza

### Prevención a Largo Plazo
9. ✅ **Ejercicio regular**: 30 min al día, 5 días a la semana
10. ✅ **Sueño de calidad**: 7-9 horas por noche
11. ✅ **Alimentación saludable**: Reduce cafeína y azúcar
12. ✅ **Límites de trabajo**: No más de 50-60 horas semanales
13. ✅ **Desconexión digital**: 1 hora antes de dormir sin pantallas
14. ✅ **Hobby creativo**: Actividad que disfrutes sin presión

---

## 🐛 Solución de Problemas

### Error: "No se encontró ninguna cámara"
```bash
# Verifica permisos de cámara en Sistema
# Mac: Ajustes → Privacidad → Cámara → Terminal/PyCharm
# Windows: Configuración → Privacidad → Cámara
```

### Error: "AttributeError: _ARRAY_API not found"
```bash
# Incompatibilidad NumPy 1.x vs 2.x
pip uninstall numpy
pip install "numpy==1.26.4"
```

### Error: "No module named 'tensorflow'"
```bash
# Instala según tu sistema
# Mac M1/M2/M3:
pip install tensorflow-macos tensorflow-metal

# Windows/Linux:
pip install tensorflow
```

### El análisis es muy lento (< 5 FPS)
- Aumenta `SKIP_FRAMES` en `main.py` (línea 14): valor mayor = menos análisis
- Reduce `ANALYSIS_WIDTH` y `ANALYSIS_HEIGHT` (líneas 16-17)
- Verifica que la GPU esté activa con `check_gpu.py`

### La GPU no se detecta (Mac)
```bash
# Reinstala paquetes de Metal
pip uninstall tensorflow-metal tensorflow-macos
pip install tensorflow-macos==2.16.2 tensorflow-metal==1.1.0
```

### El estrés sube demasiado rápido
Edita en `main.py`:
```python
STRESS_INCREMENT_RATE = 0.2      # Baja este valor
STRESS_DECREMENT_RATE = 2.0      # Sube este valor
MAX_STRESS_CHANGE = 1.0          # Baja este valor
```

---

## 📚 Recursos Adicionales

### Documentación de Librerías
- [DeepFace](https://github.com/serengil/deepface) - Análisis facial
- [OpenCV](https://docs.opencv.org/) - Visión por computadora
- [TensorFlow](https://www.tensorflow.org/) - Machine Learning
- [NumPy](https://numpy.org/doc/) - Computación numérica

### Papers Científicos
- Ekman, P. (1992). "An argument for basic emotions"
- Lazarus, R. S. (1991). "Emotion and Adaptation"
- Picard, R. W. (1997). "Affective Computing"

### Tutoriales y Guías
- [Manejo de Estrés - Mayo Clinic](https://www.mayoclinic.org/healthy-lifestyle/stress-management)
- [Técnicas de Respiración - Harvard Health](https://www.health.harvard.edu/mind-and-mood/relaxation-techniques-breath-control-helps-quell-errant-stress-response)

---

## 🤝 Contribuciones

¿Quieres mejorar este proyecto? ¡Las contribuciones son bienvenidas!

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👤 Autor

**Gabriel S.**  
Proyecto: Ritmo - Sistema de Detección de Estrés  
Fecha: Octubre 2025

---

## 🙏 Agradecimientos

- [DeepFace](https://github.com/serengil/deepface) por el modelo de análisis facial
- [OpenCV](https://opencv.org/) por las herramientas de visión por computadora
- [TensorFlow](https://www.tensorflow.org/) por el framework de ML
- Comunidad de código abierto por su apoyo continuo

---

¡Feliz monitoreo de bienestar emocional! 🎉

**Recuerda:** La salud mental es tan importante como la salud física. Toma descansos, cuídate y busca ayuda profesional si lo necesitas.
