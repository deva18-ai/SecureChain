#!/bin/bash
# SecureChain Complete Demo Test Runner
# =====================================

echo ""
echo "============================================================"
echo "        SecureChain Demo - Complete Testing Suite"
echo "============================================================"
echo ""

# Check if we're in the correct directory
if [ ! -f "backend/test_demo.py" ]; then
    echo "ERROR: Please run this script from the SecureChain root directory"
    exit 1
fi

echo "[STEP 1] Checking Services..."
echo ""

# Check services
echo "Checking Backend API..."
if curl -s http://localhost:8000/health >/dev/null 2>&1 ; then
    echo "  ✅ OK: Backend API is running"
else
    echo "  ❌ ERROR: Backend API not running"
    echo "  Please start with: cd backend && uvicorn app.main:app --reload"
    echo ""
    exit 1
fi

echo ""
echo "[STEP 2] Installing Test Dependencies..."
cd backend

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install httpx for testing
pip install -q httpx

echo ""
echo "[STEP 3] Running Automated Tests..."
echo ""
echo "============================================================"
echo "                 AUTOMATED TEST RESULTS"
echo "============================================================"
echo ""

python test_demo.py

TEST_RESULT=$?

cd ..

echo ""
echo "============================================================"
echo ""

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "  ✅ SUCCESS: All automated tests passed!"
    echo ""
    echo "  Next Steps:"
    echo "  1. Review test output above"
    echo "  2. Run manual tests using MANUAL_TEST_CHECKLIST.md"
    echo "  3. Test in browser: http://localhost:5173"
    echo ""
    echo "  Quick Manual Test:"
    echo "  - Login: admin@securechain.local / Admin@123"
    echo "  - Check Dashboard statistics"
    echo "  - Create a test user"
    echo "  - Create a test asset"
    echo "  - Login as manager and request transfer"
    echo "  - Login as admin and approve request"
    echo ""
else
    echo ""
    echo "  ⚠️  WARNING: Some automated tests failed"
    echo "  Please review the output above for details"
    echo ""
    echo "  Common Issues:"
    echo "  - Database not seeded (run: python backend/seed_demo.py)"
    echo "  - Services not running (check PostgreSQL, Hardhat, Backend)"
    echo "  - API endpoints changed (verify backend is latest version)"
    echo ""
fi

echo "============================================================"
echo ""
