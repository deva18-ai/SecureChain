#!/bin/bash
# Quick Sepolia Configuration Script
# ==================================

echo "=================================================="
echo "  SecureChain - Sepolia Testnet Configuration"
echo "=================================================="
echo ""

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env 2>/dev/null || touch backend/.env
fi

echo "Please provide the following information:"
echo ""

# Get Sepolia RPC URL
echo "1. Sepolia RPC URL"
echo "   Get from: https://infura.io or https://alchemy.com"
echo "   Examples:"
echo "   - https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
echo "   - https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
echo "   - https://rpc.sepolia.org (public, less reliable)"
echo ""
read -p "Enter Sepolia RPC URL: " RPC_URL

# Get Contract Address
echo ""
echo "2. Contract Address"
echo "   Your deployed contract: 0x59164327930d3fF474159f21e7668669e7EB4398"
echo ""
read -p "Enter Contract Address [default: 0x59164327930d3fF474159f21e7668669e7EB4398]: " CONTRACT_ADDR
CONTRACT_ADDR=${CONTRACT_ADDR:-0x59164327930d3fF474159f21e7668669e7EB4398}

# Get Private Key
echo ""
echo "3. Deployer Private Key"
echo "   ⚠️  IMPORTANT: This account must have Sepolia ETH!"
echo "   Get Sepolia ETH from: https://sepoliafaucet.com/"
echo ""
read -sp "Enter Deployer Private Key (starts with 0x): " PRIVATE_KEY
echo ""

# Update .env file
echo ""
echo "Updating backend/.env..."

# Create or update .env
cat > backend/.env << EOF
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/securechain

# JWT
JWT_SECRET=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# Blockchain - SEPOLIA TESTNET
BLOCKCHAIN_RPC_URL=$RPC_URL
CONTRACT_ADDRESS=$CONTRACT_ADDR
DEPLOYER_PRIVATE_KEY=$PRIVATE_KEY

# CORS
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]
EOF

echo "✅ Configuration saved to backend/.env"
echo ""

# Verify configuration
echo "Verifying configuration..."
echo ""

# Check if deployer account has ETH
echo "Checking deployer account balance..."
DEPLOYER_ADDR=$(python3 -c "from eth_account import Account; print(Account.from_key('$PRIVATE_KEY').address)" 2>/dev/null)

if [ ! -z "$DEPLOYER_ADDR" ]; then
    echo "✅ Deployer Address: $DEPLOYER_ADDR"
    echo ""
    echo "Check balance on Sepolia Etherscan:"
    echo "https://sepolia.etherscan.io/address/$DEPLOYER_ADDR"
    echo ""
    echo "If balance is 0, get Sepolia ETH from:"
    echo "- https://sepoliafaucet.com/"
    echo "- https://faucet.quicknode.com/ethereum/sepolia"
else
    echo "⚠️  Could not verify deployer address"
    echo "   Make sure eth-account is installed: pip install eth-account"
fi

echo ""
echo "=================================================="
echo "  Configuration Complete!"
echo "=================================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Verify deployer has Sepolia ETH (see link above)"
echo ""
echo "2. Restart backend:"
echo "   cd backend"
echo "   uvicorn app.main:app --reload"
echo ""
echo "3. Check blockchain connection:"
echo "   curl http://localhost:8000/api/v1/blockchain/status"
echo ""
echo "4. Register a test user:"
echo "   - Go to: http://localhost:5173"
echo "   - Register with your MetaMask wallet address"
echo "   - Check transaction on Sepolia Etherscan"
echo ""
echo "5. View your contract:"
echo "   https://sepolia.etherscan.io/address/$CONTRACT_ADDR"
echo ""
echo "=================================================="
