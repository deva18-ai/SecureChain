#!/bin/bash
# SecureChain Demo Quick Start Script
# ====================================

echo ""
echo "============================================================"
echo "       SecureChain Demo Setup - Quick Start"
echo "============================================================"
echo ""

# Check if we're in the correct directory
if [ ! -f "backend/seed_demo.py" ]; then
    echo "ERROR: Please run this script from the SecureChain root directory"
    echo ""
    exit 1
fi

echo "[1/5] Checking Services..."
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL..."
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":5432 " ; then
    echo "  ✅ OK: PostgreSQL is running"
else
    echo "  ⚠️  WARNING: PostgreSQL not detected on port 5432"
    echo "  Please start PostgreSQL with: docker-compose up -d postgres"
    echo ""
fi

# Check if Hardhat is running
echo "Checking Hardhat Node..."
if curl -s http://127.0.0.1:8545 >/dev/null 2>&1 ; then
    echo "  ✅ OK: Hardhat node is running"
else
    echo "  ⚠️  WARNING: Hardhat node not running on port 8545"
    echo "  Please start with: cd blockchain && npm run node"
    echo ""
fi

# Check if Backend is running
echo "Checking Backend API..."
if curl -s http://localhost:8000/health >/dev/null 2>&1 ; then
    echo "  ✅ OK: Backend API is running"
else
    echo "  ⚠️  WARNING: Backend API not running on port 8000"
    echo "  Please start with: cd backend && uvicorn app.main:app --reload"
    echo ""
fi

# Check if Frontend is running
echo "Checking Frontend..."
if curl -s http://localhost:5173 >/dev/null 2>&1 ; then
    echo "  ✅ OK: Frontend is running"
else
    echo "  ⚠️  WARNING: Frontend not running on port 5173"
    echo "  Please start with: cd frontend && npm run dev"
    echo ""
fi

echo ""
echo "[2/5] Setting up Backend Environment..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "  Creating virtual environment..."
    python3 -m venv venv
    echo "  ✅ OK: Virtual environment created"
else
    echo "  ✅ OK: Virtual environment exists"
fi

echo ""
echo "[3/5] Activating Virtual Environment..."
source venv/bin/activate

echo ""
echo "[4/5] Installing Dependencies..."
pip install -q -r requirements.txt
if [ $? -ne 0 ]; then
    echo "  ❌ ERROR: Failed to install dependencies"
    exit 1
fi
echo "  ✅ OK: Dependencies installed"

echo ""
echo "[5/5] Seeding Demo Data..."
echo ""
python seed_demo.py

if [ $? -ne 0 ]; then
    echo ""
    echo "  ❌ ERROR: Failed to seed demo data"
    echo "  Please check the error messages above"
    exit 1
fi

cd ..

echo ""
echo "============================================================"
echo "               Demo Setup Complete!"
echo "============================================================"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "Quick Test Login:"
echo "  Owner:    admin@securechain.local / Admin@123"
echo "  Manager:  manager@securechain.local / Manager@123"
echo ""
echo "Full guide: See DEMO_GUIDE.md"
echo "============================================================"
echo ""
