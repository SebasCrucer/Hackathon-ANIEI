# Quick Setup Guide

## 1. Configure Environment

Create a `.env` file in the project root:

```bash
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
VITE_TARGET_FPS=15
VITE_SMOOTHING_WINDOW=2.5
```

**Important**: You must have an OpenAI API key with GPT-4 Vision access. Get one at: https://platform.openai.com/api-keys

## 2. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install
```

## 3. Run Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

## 4. Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Iniciar Cámara" (Start Camera)
3. Allow camera permissions when prompted
4. Your emotions will be analyzed in real-time!
5. Click "Modo PiP" to enable Picture-in-Picture

## Browser Requirements

- **Chrome/Edge 111+**: Best experience with Document PiP
- **Firefox/Safari**: Works with Video PiP fallback
- **HTTPS or localhost**: Required for camera access

## Expected Performance

- **Processing Speed**: 15 FPS target
- **API Latency**: 200-1000ms per OpenAI call (depends on network)
- **Smoothing**: 2.5 second EWMA window for stable metrics

## Troubleshooting

### "OpenAI API key not configured"
- Ensure `.env` file exists with valid `VITE_OPENAI_API_KEY`
- Restart dev server: `Ctrl+C` then `npm run dev`

### Camera not working
- Check browser permissions (click lock icon in address bar)
- Use HTTPS or localhost
- Try a different browser

### Build errors
- Run `npm run lint` to check for TypeScript errors
- Run `npm install` to ensure all dependencies are installed

## API Costs

Each frame sent to OpenAI costs approximately:
- **GPT-4 Vision (low detail)**: ~$0.001 per image
- At 15 FPS, this can add up quickly
- Consider implementing local ONNX models for production use

## Next Steps

To swap to local ONNX models (future enhancement):

1. Create `ONNXEmotionService.ts` implementing `IEmotionDetector`
2. Load face detection models (BlazeFace/FaceMesh)
3. Implement emotion inference
4. Update dependency injection in `useEmotionPipeline.ts`

See README.md for full documentation.

