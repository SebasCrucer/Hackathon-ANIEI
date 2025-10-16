@echo off
REM Script para iniciar el servidor API de DeepFace en Windows

echo 🚀 Starting DeepFace Emotion Detection API...
echo.

REM Verificar si el entorno virtual existe
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activar entorno virtual
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Instalar dependencias si es necesario
if not exist "venv\.dependencies_installed" (
    echo 📥 Installing dependencies...
    pip install -r requirements_api.txt
    type nul > venv\.dependencies_installed
)

REM Iniciar servidor
echo 🌐 Starting API server on http://localhost:8000
echo 📚 API docs available at http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop
echo.

python api_server.py

