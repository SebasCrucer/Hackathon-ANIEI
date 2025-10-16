#!/bin/bash
# Setup script for environment files

echo "🔧 Configurando archivos de entorno..."

# Create .env.local for serverless function
echo "📝 Creando .env.local (para la función serverless)"
cat > .env.local << 'ENVLOCAL'
# OpenAI API Key for serverless function
# Replace with your actual API key
OPENAI_API_KEY=sk-your-openai-api-key-here
ENVLOCAL

# Create .env for frontend
echo "📝 Creando .env (para el frontend)"
cat > .env << 'ENVFILE'
# Frontend configuration
VITE_API_ENDPOINT=/api/analyze-emotion
VITE_TARGET_FPS=15
VITE_SMOOTHING_WINDOW=2.5
ENVFILE

echo ""
echo "✅ Archivos creados:"
echo "   - .env.local (configura tu API key aquí)"
echo "   - .env (configuración del frontend)"
echo ""
echo "📝 Siguiente paso:"
echo "   1. Edita .env.local y agrega tu API key de OpenAI"
echo "   2. Ejecuta: vercel dev"
echo ""
