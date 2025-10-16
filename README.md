# Emotion Detection MVP

A real-time emotion detection web application using OpenAI GPT-4 Vision API with DDD (Domain-Driven Design) architecture.

## Features

- 🎥 Real-time camera capture and emotion analysis
- 😊 Valencia and Arousal emotion metrics
- 🎯 Confidence scoring
- 📊 Live telemetry (FPS, face detection ratio)
- 🪟 Picture-in-Picture mode support
- 🏗️ Clean DDD architecture (easy to swap OpenAI for ONNX later)

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Emotion Detection**: OpenAI GPT-4 Vision API
- **Architecture**: Domain-Driven Design (DDD)

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key with GPT-4 Vision access
- Modern browser with camera support (Chrome/Edge recommended for full PiP support)
- Vercel or Netlify account (for deployment)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```bash
   # API endpoint (default for Vercel)
   VITE_API_ENDPOINT=/api/analyze-emotion
   
   # Performance
   VITE_TARGET_FPS=15
   VITE_SMOOTHING_WINDOW=2.5
   ```
   
   **Note**: The OpenAI API key is now configured on the server (Vercel/Netlify), not in the frontend.

3. **Run development server with serverless functions**:
   
   For Vercel:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Create .env.local with your OpenAI key
   echo "OPENAI_API_KEY=sk-your-key-here" > .env.local
   
   # Run with Vercel dev (includes serverless functions)
   vercel dev
   ```
   
   For Netlify:
   ```bash
   # Install Netlify CLI
   npm i -g netlify-cli
   
   # Create .env with your OpenAI key
   echo "OPENAI_API_KEY=sk-your-key-here" > .env.local
   
   # Run with Netlify dev
   netlify dev
   ```

4. **Open in browser**:
   Navigate to the URL shown by `vercel dev` or `netlify dev` (usually `http://localhost:3000`)

## Usage

1. Click **"Iniciar Cámara"** to start
2. Allow camera permissions when prompted
3. Your face will be analyzed in real-time
4. View Valencia (positivity), Arousal (intensity), and Confidence metrics
5. Click **"Modo PiP"** to enable Picture-in-Picture mode

## Architecture

### DDD Layers

```
src/
├── domain/              # Core business logic
│   ├── entities/        # EmotionMetrics, VideoFrameData, CameraState
│   ├── repositories/    # Interfaces (IEmotionDetector, ICameraService)
│   └── value-objects/   # DetectionQuality, WorkerMessage
│
├── application/         # Use cases and orchestration
│   └── services/        # EmotionPipeline, QualityMonitor
│
├── infrastructure/      # External implementations
│   ├── services/        # OpenAIEmotionService, CameraService, EWMASmoother
│   └── workers/         # emotion-worker (Web Worker)
│
└── presentation/        # UI layer
    ├── components/      # React components
    ├── hooks/           # React hooks
    └── stores/          # Zustand stores
```

### Key Design Patterns

- **Repository Pattern**: Clean interfaces for emotion detection
- **Dependency Injection**: Easy to swap implementations
- **Web Workers**: Non-blocking emotion processing
- **EWMA Smoothing**: Temporal smoothing for stable metrics

## Swapping to ONNX (Future)

Thanks to DDD architecture, switching from OpenAI to local ONNX is straightforward:

1. Create `ONNXEmotionService.ts` implementing `IEmotionDetector`
2. Load face detection models (BlazeFace/FaceMesh)
3. Implement emotion inference logic
4. Update dependency injection in hooks
5. Remove OpenAI dependency

## Performance

- **Target**: 15 FPS processing
- **Latency**: ~200-1000ms per OpenAI API call (depends on network)
- **Smoothing**: 2.5 second EWMA window

## Browser Support

- ✅ Chrome/Edge 111+ (Full Document PiP support)
- ✅ Firefox/Safari (Video PiP fallback)
- ⚠️ Requires HTTPS or localhost for camera access

## Privacy & Security

- ✅ API key stored securely on server (never exposed to browser)
- ✅ Frames processed through secure serverless function
- ✅ No data is stored permanently
- 📡 Requires internet connection
- ℹ️ This is not a medical diagnostic tool

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Vercel or Netlify.

Quick deploy:

**Vercel:**
```bash
vercel env add OPENAI_API_KEY  # Add your API key
vercel                          # Deploy
```

**Netlify:**
```bash
netlify env:set OPENAI_API_KEY sk-your-key
netlify deploy --prod
```

## Troubleshooting

### "API error" or "Failed to analyze emotion"
- Ensure `OPENAI_API_KEY` is configured in Vercel/Netlify environment variables
- Check serverless function logs in dashboard

### Camera not working
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser

### Low FPS
- OpenAI API latency is normal (200-1000ms)
- Future ONNX implementation will be faster (<50ms)

### Local development not working
- Use `vercel dev` or `netlify dev` instead of `npm run dev`
- These run the serverless functions locally

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Type check with TypeScript
```

## License

ISC

## Credits

Built with ❤️ using DDD principles for the ANIEI Hackathon.

