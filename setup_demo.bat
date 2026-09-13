@echo off
REM SecureChain Demo Quick Start Script
REM ====================================

echo.
echo ============================================================
echo        SecureChain Demo Setup - Quick Start
echo ============================================================
echo.

REM Check if we're in the correct directory
if not exist "backend\seed_demo.py" (
    echo ERROR: Please run this script from the SecureChain root directory
    echo.
    pause
    exit /b 1
)

echo [1/5] Checking Services...
echo.

REM Check if PostgreSQL is running
echo Checking PostgreSQL...
netstat -an | find ":5432" >nul
if %errorlevel% neq 0 (
    echo   WARNING: PostgreSQL not detected on port 5432
    echo   Please start PostgreSQL with: docker-compose up -d postgres
    echo.
) else (
    echo   OK: PostgreSQL is running
)

REM Check if Hardhat is running
echo Checking Hardhat Node...
curl -s http://127.0.0.1:8545 >nul 2>&1
if %errorlevel% neq 0 (
    echo   WARNING: Hardhat node not running on port 8545
    echo   Please start with: cd blockchain ^&^& npm run node
    echo.
) else (
    echo   OK: Hardhat node is running
)

REM Check if Backend is running
echo Checking Backend API...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo   WARNING: Backend API not running on port 8000
    echo   Please start with: cd backend ^&^& uvicorn app.main:app --reload
    echo.
) else (
    echo   OK: Backend API is running
)

REM Check if Frontend is running
echo Checking Frontend...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo   WARNING: Frontend not running on port 5173
    echo   Please start with: cd frontend ^&^& npm run dev
    echo.
) else (
    echo   OK: Frontend is running
)

echo.
echo [2/5] Setting up Backend Environment...
cd backend

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo   Creating virtual environment...
    python -m venv venv
    echo   OK: Virtual environment created
) else (
    echo   OK: Virtual environment exists
)

echo.
echo [3/5] Activating Virtual Environment...
call venv\Scripts\activate.bat

echo.
echo [4/5] Installing Dependencies...
pip install -q -r requirements.txt
if %errorlevel% neq 0 (
    echo   ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo   OK: Dependencies installed

echo.
echo [5/5] Seeding Demo Data...
echo.
python seed_demo.py

if %errorlevel% neq 0 (
    echo.
    echo   ERROR: Failed to seed demo data
    echo   Please check the error messages above
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================================
echo                Demo Setup Complete!
echo ============================================================
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo Quick Test Login:
echo   Owner:    admin@securechain.local / Admin@123
echo   Manager:  manager@securechain.local / Manager@123
echo.
echo Full guide: See DEMO_GUIDE.md
echo ============================================================
echo.

pause
