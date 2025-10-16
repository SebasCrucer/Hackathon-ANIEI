# 🎭 Emotion Detection MVP

Sistema de detección de emociones en tiempo real usando DeepFace, con análisis de Valencia, Arousal y nivel de estrés.

## 🚀 Inicio Rápido con Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/SebasCrucer/Hackathon-ANIEI.git
cd Hackathon-ANIEI

# 2. Levantar los contenedores
docker-compose up -d

# 3. Acceder a la aplicación
# Frontend: http://localhost:3000
# API: http://localhost:8000
```

## 📋 Requisitos

- Docker Desktop
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## 🏗️ Arquitectura

### Frontend (React + TypeScript)
- **Framework**: React 19 + Vite 7
- **Estilos**: Tailwind CSS 4
- **Estado**: Zustand
- **Patrón**: Domain-Driven Design (DDD)

### Backend (Python)
- **Framework**: FastAPI
- **ML**: DeepFace + TensorFlow
- **Detección**: 7 emociones + nivel de estrés

## ✨ Funcionalidades

### 🎯 Detección Emocional
- **Valencia**: Positividad/Negatividad (-1 a 1)
- **Arousal**: Intensidad/Activación (0 a 1)
- **7 Emociones**: Feliz, Triste, Enojado, Miedo, Sorpresa, Disgusto, Neutral
- **Estrés**: Nivel calculado en tiempo real (0-100%)

### 📊 Visualización
- **Emociones**: Desglose completo con porcentajes
- **Métricas**: Gráficas de línea temporal (últimos 10 min)
- **Alertas**: Recomendaciones inteligentes basadas en patrones
- **Estadísticas**: Análisis diario con comparativas

### 🖼️ Picture-in-Picture (PiP)
- Vista simplificada flotante
- Emoji de emoción dominante
- Barra de estrés en tiempo real
- Última alerta activa
- Auto-activación al cambiar de pestaña

### 📱 Responsive Design
- Adaptado para móviles, tablets y desktop
- Interfaz optimizada para todos los tamaños

## 🛠️ Desarrollo Local

### Sin Docker (Desarrollo)

#### Backend
```bash
cd model
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python api_server.py
```

#### Frontend
```bash
npm install
npm run dev
```

## 🐳 Docker

### Comandos útiles
```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reconstruir
docker-compose build --no-cache
docker-compose up -d
```

## 📁 Estructura del Proyecto

```
Hackathon-ANIEI/
├── src/                          # Frontend React
│   ├── application/             # Casos de uso
│   ├── domain/                  # Entidades y lógica de negocio
│   ├── infrastructure/          # Servicios externos
│   └── presentation/            # Componentes UI
│       ├── components/          # Componentes React
│       ├── hooks/              # Custom hooks
│       └── stores/             # Estado global (Zustand)
├── model/                       # Backend Python
│   ├── api_server.py           # Servidor FastAPI
│   ├── requirements.txt        # Dependencias Python
│   └── Dockerfile              # Imagen Docker API
├── docker-compose.yml          # Orquestación de contenedores
├── Dockerfile                  # Imagen Docker Frontend
└── nginx.conf                  # Configuración Nginx
```

## 🔒 Privacidad

- **Procesamiento local**: Todo el análisis se realiza en tu dispositivo
- **Sin almacenamiento**: No se guardan imágenes ni videos
- **Sin transmisión**: Los datos no se envían a servidores externos
- **Historial local**: Guardado en localStorage del navegador

## 🎨 Tecnologías

### Frontend
- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 4
- Zustand (Estado)

### Backend
- Python 3.11+
- FastAPI
- DeepFace 0.0.95
- TensorFlow 2.16
- OpenCV

### DevOps
- Docker & Docker Compose
- Nginx
- Multi-stage builds

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

## 👥 Contribuidores

- [@SebasCrucer](https://github.com/SebasCrucer)

---

**Powered by DeepFace** • Built with ❤️ using DDD Architecture
