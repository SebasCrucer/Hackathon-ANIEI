#!/bin/bash
# Script simple para iniciar el servidor API de DeepFace
# Usa este script después de haber corrido setup_deepface.sh

echo "🚀 Starting DeepFace Emotion Detection API..."
echo ""

# Verificar si el entorno virtual existe
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "   Please run setup first:"
    echo "   cd .. && ./setup_deepface.sh"
    exit 1
fi

# Activar entorno virtual
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Verificar que las dependencias estén instaladas
if ! python -c "import fastapi" &> /dev/null; then
    echo "⚠️  Dependencies not installed. Installing now..."
    pip install -r requirements_api.txt
fi

# Iniciar servidor
echo "🌐 Starting API server on http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
echo ""
echo "✅ DeepFace model will load on first request (~10 seconds)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python api_server.py

