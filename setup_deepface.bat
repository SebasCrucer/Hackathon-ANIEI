@echo off
REM Setup script for DeepFace local model (Windows)

echo 🎭 Setting up DeepFace Emotion Detection
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 is not installed
    echo    Please install Python 3.8-3.10 from https://www.python.org/
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% found
echo.

REM Navigate to model directory
cd model

REM Create virtual environment
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)
echo.

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements_api.txt

echo.
echo ✅ Installation complete!
echo.
echo ========================================
echo 🚀 Quick Start
echo ========================================
echo.
echo 1. Start the API server:
echo    cd model ^&^& start_api.bat
echo    (Or: cd model ^&^& python api_server.py)
echo.
echo 2. In another terminal, start the frontend:
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo 📚 For more info, see DEEPFACE_INTEGRATION.md
echo.

REM Create .env if it doesn't exist
cd ..
if not exist ".env" (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ✅ .env file created with DeepFace configuration
    echo.
)

echo ✨ Setup complete! You're ready to go!

