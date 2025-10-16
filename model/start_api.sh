#!/bin/bash
# Setup script for DeepFace local model

echo "🎭 Setting up DeepFace Emotion Detection"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "   Please install Python 3.8-3.10 from https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Python $PYTHON_VERSION found"
echo ""

# Navigate to model directory
cd model

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Detect hardware and set requirements
echo "🔍 Detecting hardware..."
ARCH=$(uname -m)
OS=$(uname -s)

if [[ "$OS" == "Darwin" && "$ARCH" == "arm64" ]]; then
    echo "🍎 Detected: Mac with Apple Silicon (M1/M2/M3)"
    REQUIREMENTS_TYPE="Apple Silicon"
    elif command -v nvidia-smi &> /dev/null; then
    echo "🚀 Detected: NVIDIA GPU"
    REQUIREMENTS_TYPE="NVIDIA GPU"
else
    echo "💻 Detected: CPU only"
    REQUIREMENTS_TYPE="CPU"
fi
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements_api.txt

echo ""
echo "✅ Installation complete!"
echo ""
echo "========================================"
echo "🚀 Quick Start"
echo "========================================"
echo ""
echo "1. Start the API server:"
echo "   cd model && ./start_api.sh"
echo "   (Or: cd model && python api_server.py)"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more info, see DEEPFACE_INTEGRATION.md"
echo ""

# Make start script executable
chmod +x start_api.sh

# Create .env if it doesn't exist
cd ..
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created with DeepFace configuration"
    echo ""
fi

echo "✨ Setup complete! You're ready to go!"

echo "🔍 Detecting hardware..."
ARCH=$(uname -m)
OS=$(uname -s)

if [[ "$OS" == "Darwin" && "$ARCH" == "arm64" ]]; then
    echo "🍎 Detected: Mac with Apple Silicon (M1/M2/M3)"
    REQUIREMENTS_TYPE="Apple Silicon"
    elif command -v nvidia-smi &> /dev/null; then
    echo "🚀 Detected: NVIDIA GPU"
    REQUIREMENTS_TYPE="NVIDIA GPU"
else
    echo "💻 Detected: CPU only"
    REQUIREMENTS_TYPE="CPU"
fi
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements_api.txt

echo ""
echo "✅ Installation complete!"
echo ""
echo "========================================"
echo "🚀 Quick Start"
echo "========================================"
echo ""
echo "1. Start the API server:"
echo "   cd model && ./start_api.sh"
echo "   (Or: cd model && python api_server.py)"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more info, see DEEPFACE_INTEGRATION.md"
echo ""

# Make start script executable
chmod +x start_api.sh

# Create .env if it doesn't exist
cd ..
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created with DeepFace configuration"
    echo ""
fi

echo "✨ Setup complete! You're ready to go!"

