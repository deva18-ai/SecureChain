@echo off
REM SecureChain Complete Demo Test Runner
REM =====================================

echo.
echo ============================================================
echo         SecureChain Demo - Complete Testing Suite
echo ============================================================
echo.

REM Check if we're in the correct directory
if not exist "backend\test_demo.py" (
    echo ERROR: Please run this script from the SecureChain root directory
    pause
    exit /b 1
)

echo [STEP 1] Checking Services...
echo.

REM Check services
echo Checking Backend API...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo   ERROR: Backend API not running
    echo   Please start with: cd backend ^&^& uvicorn app.main:app --reload
    echo.
    pause
    exit /b 1
) else (
    echo   OK: Backend API is running
)

echo.
echo [STEP 2] Installing Test Dependencies...
cd backend

REM Activate virtual environment if exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Install httpx for testing
pip install -q httpx

echo.
echo [STEP 3] Running Automated Tests...
echo.
echo ============================================================
echo                  AUTOMATED TEST RESULTS
echo ============================================================
echo.

python test_demo.py

set TEST_RESULT=%errorlevel%

cd ..

echo.
echo ============================================================
echo.

if %TEST_RESULT% equ 0 (
    echo.
    echo   SUCCESS: All automated tests passed!
    echo.
    echo   Next Steps:
    echo   1. Review test output above
    echo   2. Run manual tests using MANUAL_TEST_CHECKLIST.md
    echo   3. Test in browser: http://localhost:5173
    echo.
    echo   Quick Manual Test:
    echo   - Login: admin@securechain.local / Admin@123
    echo   - Check Dashboard statistics
    echo   - Create a test user
    echo   - Create a test asset
    echo   - Login as manager and request transfer
    echo   - Login as admin and approve request
    echo.
) else (
    echo.
    echo   WARNING: Some automated tests failed
    echo   Please review the output above for details
    echo.
    echo   Common Issues:
    echo   - Database not seeded (run: python backend\seed_demo.py)
    echo   - Services not running (check PostgreSQL, Hardhat, Backend)
    echo   - API endpoints changed (verify backend is latest version)
    echo.
)

echo ============================================================
echo.

pause
