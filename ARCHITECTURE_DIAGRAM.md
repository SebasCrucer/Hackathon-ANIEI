# 🏗️ Arquitectura del Sistema - Diagrama Completo

## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                        http://localhost:3000                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ getUserMedia
                                 ▼
                        ┌────────────────┐
                        │    Webcam      │
                        │  (640x360px)   │
                        └────────────────┘
                                 │
                                 │ Video frames
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ CameraView │  │EmotionHUD  │  │  Controls  │  │PiPWindow │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│         │                │                │              │      │
│         └────────────────┴────────────────┴──────────────┘      │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │  emotionStore     │  (Zustand)             │
│                    └─────────┬─────────┘                        │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ useEmotionPipeline
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              EmotionPipeline.ts                           │  │
│  │  • Orchestrates capture loop                             │  │
│  │  • Manages worker communication                          │  │
│  │  • Updates store with metrics                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              QualityMonitor.ts                            │  │
│  │  • Tracks FPS                                             │  │
│  │  • Measures latency                                       │  │
│  │  • Monitors face detection ratio                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               │ postMessage(FRAME)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                          │
│                     (Web Worker Thread)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              emotion-worker.ts                            │  │
│  │                                                            │  │
│  │  • Receives frames from main thread                       │  │
│  │  • Decides: DeepFace or OpenAI?                          │  │
│  │  • Calls emotion detector                                │  │
│  │  • Applies EWMA smoothing                                │  │
│  │  • Sends metrics back                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              │                         │                        │
│              ▼                         ▼                        │
│  ┌───────────────────────┐  ┌──────────────────────┐          │
│  │DeepFaceEmotionService │  │OpenAIEmotionService  │          │
│  │  (IEmotionDetector)   │  │  (IEmotionDetector)  │          │
│  └───────────────────────┘  └──────────────────────┘          │
│              │                         │                        │
│              │                         │                        │
└──────────────┼─────────────────────────┼────────────────────────┘
               │                         │
               │ fetch()                 │ fetch()
               ▼                         ▼
┌────────────────────────┐    ┌─────────────────────────┐
│   DeepFace API         │    │   Vercel Serverless     │
│   (FastAPI/Python)     │    │   /api/analyze-emotion  │
│   localhost:8000       │    │                         │
│                        │    │  ┌──────────────────┐   │
│  ┌──────────────────┐ │    │  │ Proxy to OpenAI  │   │
│  │ DeepFace Model   │ │    │  │ Hides API key    │   │
│  │ • 7 emotions     │ │    │  └──────────────────┘   │
│  │ • TensorFlow     │ │    └─────────┬───────────────┘
│  │ • GPU support    │ │              │
│  └──────────────────┘ │              │ HTTPS
└────────────────────────┘              ▼
                              ┌─────────────────────┐
                              │   OpenAI API        │
                              │   GPT-4 Vision      │
                              └─────────────────────┘
```

---

## 🎯 Domain-Driven Design (DDD)

### Capas de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│                     (Pure TypeScript)                        │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │    ENTITIES      │  │     INTERFACES    │                │
│  ├──────────────────┤  ├──────────────────┤                │
│  │ EmotionMetrics   │  │ IEmotionDetector │                │
│  │ VideoFrameData   │  │ ICameraService   │                │
│  │ CameraState      │  │ ITemporalSmoother│                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────┐                                       │
│  │  VALUE OBJECTS   │                                       │
│  ├──────────────────┤                                       │
│  │ DetectionQuality │                                       │
│  │ WorkerMessage    │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │ Depends on
                         │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   USE CASES      │  │    SERVICES      │                │
│  ├──────────────────┤  ├──────────────────┤                │
│  │ StartCamera      │  │ EmotionPipeline  │                │
│  │ StopCamera       │  │ QualityMonitor   │                │
│  │ ProcessFrame     │  └──────────────────┘                │
│  │ TogglePiP        │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │ Depends on
                         │
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │              IMPLEMENTATIONS                    │         │
│  ├────────────────────────────────────────────────┤         │
│  │ OpenAIEmotionService  implements IEmotionDetector       │
│  │ DeepFaceEmotionService implements IEmotionDetector      │
│  │ CameraService      implements ICameraService   │         │
│  │ EWMASmoother       implements ITemporalSmoother│         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │                  WORKERS                        │         │
│  ├────────────────────────────────────────────────┤         │
│  │ emotion-worker.ts                              │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │ Depends on
                         │
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                          │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   COMPONENTS     │  │      HOOKS       │                │
│  ├──────────────────┤  ├──────────────────┤                │
│  │ App              │  │ useEmotionPipeline               │
│  │ CameraView       │  │ usePiP           │                │
│  │ EmotionHUD       │  │ useAutoPiP       │                │
│  │ PiPContent       │  │ useCameraPermissions             │
│  │ Controls         │  └──────────────────┘                │
│  └──────────────────┘                                       │
│                                                              │
│  ┌──────────────────┐                                       │
│  │     STORES       │                                       │
│  ├──────────────────┤                                       │
│  │ emotionStore     │  (Zustand)                           │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

**Principio clave**: Las capas superiores dependen de las inferiores, pero las inferiores NO conocen las superiores (Inversión de Dependencias).

---

## 🔄 Flujo de Datos: Frame a Métricas

### 1. Captura de Frame

```
┌──────────┐     requestAnimationFrame()     ┌──────────────┐
│ Browser  │ ─────────────────────────────▶ │ CameraView   │
└──────────┘                                  └──────────────┘
                                                     │
                                                     │ Every ~66ms (15 FPS)
                                                     ▼
                                           ┌──────────────────┐
                                           │ Canvas.getContext│
                                           │ .getImageData()  │
                                           └──────────────────┘
                                                     │
                                                     │ ImageData
                                                     ▼
                                           ┌──────────────────┐
                                           │ EmotionPipeline  │
                                           │ .processFrame()  │
                                           └──────────────────┘
```

### 2. Procesamiento en Worker

```
┌──────────────────┐                      ┌──────────────────┐
│  Main Thread     │  postMessage(FRAME) │  Worker Thread   │
│                  │ ─────────────────▶  │                  │
│ EmotionPipeline  │                      │ emotion-worker   │
│                  │ ◀─────────────────  │                  │
│                  │  postMessage(METRICS)└──────────────────┘
└──────────────────┘                              │
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │ Check endpoint URL    │
                                      │ localhost:8000?       │
                                      └───────────────────────┘
                                            │           │
                              Yes ◀─────────┘           └────────▶ No
                               │                                   │
                               ▼                                   ▼
                   ┌────────────────────────┐        ┌─────────────────────────┐
                   │DeepFaceEmotionService  │        │OpenAIEmotionService     │
                   └────────────────────────┘        └─────────────────────────┘
                               │                                   │
                               │                                   │
                               ▼                                   ▼
                   ┌────────────────────────┐        ┌─────────────────────────┐
                   │  fetch() to            │        │  fetch() to             │
                   │  localhost:8000        │        │  /api/analyze-emotion   │
                   └────────────────────────┘        └─────────────────────────┘
```

### 3. Respuesta del Modelo

```
┌──────────────────┐              ┌──────────────────┐
│  API Response    │              │  emotion-worker  │
│                  │              │                  │
│  {               │              │  Raw Metrics     │
│   valence: 0.7,  │ ─────────▶  │                  │
│   arousal: 0.6,  │              │       │          │
│   confidence: 0.9│              │       ▼          │
│  }               │              │  EWMASmoother    │
└──────────────────┘              │  (temporal)      │
                                  │       │          │
                                  │       ▼          │
                                  │  Smoothed Metrics│
                                  └──────────────────┘
                                           │
                                           │ postMessage
                                           ▼
                                  ┌──────────────────┐
                                  │  Main Thread     │
                                  │                  │
                                  │  emotionStore    │
                                  │  .setMetrics()   │
                                  └──────────────────┘
                                           │
                                           │ React re-render
                                           ▼
                                  ┌──────────────────┐
                                  │  UI Components   │
                                  │  • EmotionHUD    │
                                  │  • PiPContent    │
                                  └──────────────────┘
```

---

## 🎭 Comparación de Backends

### Opción A: DeepFace (Local)

```
┌─────────────────────────────────────────────────────────┐
│                  Tu Computadora                          │
│                                                          │
│  ┌────────────┐          ┌────────────────────────┐    │
│  │  Frontend  │  fetch() │  Python API Server     │    │
│  │  :3000     │ ───────▶ │  :8000                 │    │
│  │            │          │                        │    │
│  │            │ ◀─────── │  ┌──────────────────┐ │    │
│  │            │  JSON    │  │  DeepFace Model  │ │    │
│  │            │          │  │  TensorFlow      │ │    │
│  └────────────┘          │  │  GPU accelerated │ │    │
│                          │  └──────────────────┘ │    │
│                          └────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
        ▲                                    │
        │         No Internet Required       │
        └────────────────────────────────────┘

Latency: 50-200ms
Privacy: 100% local
Cost: $0
```

### Opción B: OpenAI (Remoto)

```
┌──────────────────┐                  ┌────────────────────┐
│  Tu Computadora  │                  │   Vercel Cloud     │
│                  │                  │                    │
│  ┌────────────┐  │    fetch()       │  ┌──────────────┐ │
│  │  Frontend  │  │ ──────────────▶ │  │  Serverless  │ │
│  │  :3000     │  │                  │  │  Function    │ │
│  │            │  │ ◀────────────── │  │              │ │
│  └────────────┘  │    JSON          │  └──────────────┘ │
└──────────────────┘                  └────────────────────┘
                                               │
                                               │ HTTPS + API Key
                                               │
                                               ▼
                                      ┌────────────────────┐
                                      │    OpenAI API      │
                                      │                    │
                                      │  ┌──────────────┐ │
                                      │  │  GPT-4 Vision│ │
                                      │  └──────────────┘ │
                                      └────────────────────┘

Latency: 500-2000ms
Privacy: Sent to OpenAI
Cost: ~$0.01/image
```

---

## 🔌 Picture-in-Picture (PiP) Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Main Window                             │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              App Component                       │    │
│  │                                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐            │    │
│  │  │ CameraView   │  │ EmotionHUD   │            │    │
│  │  └──────────────┘  └──────────────┘            │    │
│  │                                                  │    │
│  │  emotionStore ────────┐                         │    │
│  │  (metrics)            │                         │    │
│  └───────────────────────┼──────────────────────────┘    │
│                          │                               │
│  [Toggle PiP Button]     │                               │
│         │                │                               │
│         │ click          │                               │
│         ▼                │                               │
│   usePiP.enterPiP()      │                               │
│         │                │                               │
└─────────┼────────────────┼───────────────────────────────┘
          │                │
          │                │ React state subscription
          │                │
          ▼                │
┌──────────────────────────┼───────────────────────────────┐
│   Document PiP Window    │                               │
│   (Floating, Always on Top)                              │
│                          │                               │
│  ┌────────────────────────▼──────────────────────────┐  │
│  │         PiPContent Component                       │  │
│  │         (via React Portal)                         │  │
│  │                                                    │  │
│  │  emotionStore ────▶ Live metrics                  │  │
│  │                                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │ 😊 Valencia  │  │ ⚡ Arousal    │              │  │
│  │  │ Bar: ████    │  │ Bar: ███     │              │  │
│  │  │ 0.75         │  │ 0.60         │              │  │
│  │  └──────────────┘  └──────────────┘              │  │
│  │                                                    │  │
│  │  ┌──────────────┐                                 │  │
│  │  │ 🎯 Confidence│                                 │  │
│  │  │ Bar: █████   │                                 │  │
│  │  │ 90%          │                                 │  │
│  │  └──────────────┘                                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Size: 320x280px                                          │
│  Position: Draggable                                      │
│  Style: Glassmorphism + Gradients                         │
└───────────────────────────────────────────────────────────┘
```

### Auto-PiP con User Gesture

```
┌─────────────────────────────────────────────────────────┐
│  Initial State: User hasn't activated PiP yet           │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  AutoPiPBanner                                  │    │
│  │  "Activa PiP para seguir las métricas..."      │    │
│  │  [Activar PiP Ahora]  ◀───── User clicks here  │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                       │
                       │ User gesture detected
                       ▼
┌─────────────────────────────────────────────────────────┐
│  localStorage.setItem('autoPiPEnabled', 'true')         │
│  userHasActivatedPiPRef.current = true                  │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Future: User switches tabs (document.hidden = true)    │
│                                                          │
│  visibilitychange event ───▶ if (userHasActivatedPiP) { │
│                                enterPiP()               │
│                              }                           │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
              PiP activates automatically
              (no user gesture needed, already granted)
```

---

## 📦 File Structure

```
ANIEI/
├── src/
│   ├── domain/                          # 🎯 Pure business logic
│   │   ├── entities/
│   │   │   ├── EmotionMetrics.ts       # valence, arousal, confidence
│   │   │   ├── VideoFrameData.ts       # frame + timestamp
│   │   │   └── CameraState.ts          # idle, running, pip-active
│   │   ├── repositories/
│   │   │   ├── IEmotionDetector.ts     # 📝 Interface for emotion services
│   │   │   ├── ICameraService.ts
│   │   │   └── ITemporalSmoother.ts
│   │   └── value-objects/
│   │       ├── DetectionQuality.ts
│   │       └── WorkerMessage.ts
│   │
│   ├── application/                     # 🎮 Use cases & orchestration
│   │   └── services/
│   │       ├── EmotionPipeline.ts      # Main orchestrator
│   │       └── QualityMonitor.ts       # FPS, latency tracking
│   │
│   ├── infrastructure/                  # 🔧 Implementations
│   │   ├── services/
│   │   │   ├── OpenAIEmotionService.ts     # ☁️ Remote
│   │   │   ├── DeepFaceEmotionService.ts   # 🏠 Local
│   │   │   ├── CameraService.ts
│   │   │   └── EWMASmoother.ts
│   │   └── workers/
│   │       └── emotion-worker.ts       # Web Worker
│   │
│   └── presentation/                    # 🎨 UI components
│       ├── components/
│       │   ├── App.tsx
│       │   ├── CameraView.tsx
│       │   ├── EmotionHUD.tsx
│       │   ├── PiPContent.tsx          # React Portal to PiP window
│       │   ├── Controls.tsx
│       │   ├── AutoPiPBanner.tsx
│       │   └── ...
│       ├── hooks/
│       │   ├── useEmotionPipeline.ts
│       │   ├── usePiP.ts
│       │   └── useAutoPiP.ts
│       └── stores/
│           └── emotionStore.ts         # Zustand global state
│
├── model/                               # 🎭 DeepFace backend
│   ├── api_server.py                   # FastAPI server
│   ├── main.py                         # Original CLI script
│   ├── requirements_api.txt
│   ├── start_api.sh
│   ├── start_api.bat
│   └── README.md
│
├── api/                                 # ☁️ Vercel serverless functions
│   └── analyze-emotion.ts              # Proxy to OpenAI
│
└── Documentation/
    ├── DEEPFACE_INTEGRATION.md         # How to use DeepFace
    ├── MODELS_COMPARISON.md            # DeepFace vs OpenAI
    ├── QUICKSTART_GUIDE.md             # Beginner's guide
    ├── ARCHITECTURE_DIAGRAM.md         # This file
    └── ...
```

---

## 🔐 Security & Privacy

### DeepFace (Local)

```
┌──────────────────────────────────────────┐
│   User's Computer (100% Local)          │
│                                          │
│   Webcam ──▶ Browser ──▶ Worker ──▶ API │
│                                    │     │
│                                    ▼     │
│                            DeepFace Model│
│                                          │
│   No data leaves your computer ✅        │
└──────────────────────────────────────────┘
```

### OpenAI (Remote)

```
┌────────────┐     ┌───────────┐     ┌─────────┐
│  Browser   │────▶│  Vercel   │────▶│ OpenAI  │
│  (Image)   │     │  (Proxy)  │     │  (API)  │
│            │     │           │     │         │
│            │     │ API Key   │     │ GPT-4   │
│            │     │ Hidden ✅  │     │ Vision  │
└────────────┘     └───────────┘     └─────────┘

Image sent to OpenAI ⚠️
API key secure on serverless ✅
```

---

## 🚀 Performance Optimizations

### 1. Web Worker Thread Separation

```
Main Thread (UI)            Worker Thread (Processing)
─────────────────           ──────────────────────────
React rendering             Emotion detection
User interactions           Image processing
DOM updates                 API calls
PiP management              Smoothing algorithms

    │                              │
    │   postMessage(frame)         │
    │ ──────────────────────────▶ │
    │                              │ ← Offloaded heavy work
    │                              │
    │ ◀────────────────────────── │
    │   postMessage(metrics)       │

Result: UI stays responsive at 60 FPS while processing at 15 FPS
```

### 2. Frame Skipping

```
Camera: 30 FPS ──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──
                 │  │  │  │  │  │  │  │  │  │  │  │
Target: 15 FPS   ▼  X  ▼  X  ▼  X  ▼  X  ▼  X  ▼  X
                 
Process every other frame → Reduce API calls by 50%
```

### 3. EWMA Smoothing

```
Raw values (jittery):
  t0: 0.8  t1: 0.3  t2: 0.9  t3: 0.2  t4: 0.7
  
Smoothed values (stable):
  t0: 0.8  t1: 0.7  t2: 0.75 t3: 0.65 t4: 0.67
  
Formula: smoothed = α × raw + (1-α) × previous
         where α = 2 / (window + 1)
```

---

## 🎓 Design Patterns Used

### Strategy Pattern
```typescript
interface IEmotionDetector {
  detect(frame: VideoFrameData): Promise<EmotionMetrics>;
}

class OpenAIEmotionService implements IEmotionDetector { ... }
class DeepFaceEmotionService implements IEmotionDetector { ... }

// Switch strategies at runtime
let detector: IEmotionDetector;
if (useLocal) {
  detector = new DeepFaceEmotionService();
} else {
  detector = new OpenAIEmotionService();
}
```

### Repository Pattern
```typescript
interface ICameraService {
  startCapture(): Promise<MediaStream>;
  stopCapture(): void;
  getFrame(): ImageData;
}

class CameraService implements ICameraService { ... }
```

### Observer Pattern (Pub/Sub)
```typescript
// Zustand store = Observable
const emotionStore = create((set) => ({
  metrics: null,
  setMetrics: (m) => set({ metrics: m })
}));

// Components = Observers
function EmotionHUD() {
  const metrics = useEmotionStore(s => s.metrics); // Auto-updates
  return <div>{metrics.valence}</div>;
}
```

### Factory Pattern
```typescript
export function createEmotionMetrics(
  valence: number,
  arousal: number,
  confidence: number
): EmotionMetrics {
  return {
    valence: clamp(valence, -1, 1),
    arousal: clamp(arousal, 0, 1),
    confidence: clamp(confidence, 0, 1),
    timestamp: Date.now()
  };
}
```

---

## ✨ Conclusión

Esta arquitectura combina:

✅ **Clean Architecture** (DDD + SOLID)
✅ **Performance** (Web Workers + GPU)
✅ **Flexibility** (Strategy pattern for models)
✅ **Privacy** (Local processing option)
✅ **UX** (PiP + Auto-activation)
✅ **Type Safety** (TypeScript everywhere)
✅ **Scalability** (Stateless serverless)

**Resultado**: Sistema robusto, mantenible y production-ready. 🚀

