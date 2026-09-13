# 🚀 SecureChain - Sepolia Testnet Setup Guide

This guide will help you deploy your SecureChain smart contract to Sepolia testnet and configure the application to use it.

## ✅ Prerequisites

Before starting, make sure you have:

1. **MetaMask wallet** installed (https://metamask.io)
2. **Sepolia ETH** for gas fees (get from faucets below)
3. **Infura or Alchemy account** for RPC access (free tier works)

---

## 📋 Step 1: Get Sepolia Test ETH

You need Sepolia ETH to deploy your contract. Get free testnet ETH from these faucets:

### Option A: Alchemy Faucet (Recommended)
1. Go to https://sepoliafaucet.com/
2. Sign in with your Alchemy account (free)
3. Enter your MetaMask wallet address
4. Click "Send Me ETH"
5. Wait 1-2 minutes for ETH to arrive

### Option B: Infura Faucet
1. Go to https://www.infura.io/faucet/sepolia
2. Sign in with your Infura account
3. Enter your wallet address
4. Complete verification and request ETH

### Option C: Other Faucets
- https://sepolia-faucet.pk910.de/
- https://faucet.quicknode.com/ethereum/sepolia

**You need at least 0.05 Sepolia ETH for deployment**

---

## 📋 Step 2: Get RPC URL (Infura or Alchemy)

### Option A: Infura (Recommended)

1. **Create Account**
   - Go to https://infura.io
   - Click "Sign Up" (it's free)
   - Verify your email

2. **Create API Key**
   - Go to Dashboard → "Create New API Key"
   - Select "Web3 API (formerly Ethereum)"
   - Name it "SecureChain"
   - Click "Create"

3. **Get Your RPC URL**
   - Click on your API key
   - Find the **Sepolia** endpoint URL
   - It looks like: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
   - Copy this URL - you'll need it soon!

### Option B: Alchemy

1. Go to https://alchemy.com
2. Create free account
3. Create new app → Select "Ethereum" → "Sepolia"
4. Copy the HTTPS endpoint URL
5. It looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

---

## 📋 Step 3: Configure Blockchain Environment

### 1. Update `blockchain/.env`

Open `blockchain/.env` and add:

```bash
# Your MetaMask private key (KEEP THIS SECRET!)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Your Infura/Alchemy RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Etherscan API key (optional - for contract verification)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**How to get your MetaMask private key:**
1. Open MetaMask
2. Click the three dots → Account Details
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key (starts with 0x)

⚠️ **SECURITY WARNING**: 
- NEVER commit your real private key to git
- NEVER share your private key
- Use a TEST wallet for development, not your main wallet

---

## 📋 Step 4: Update Hardhat Config

Open `blockchain/hardhat.config.ts` and ensure it has Sepolia network configured:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
```

---

## 📋 Step 5: Deploy Contract to Sepolia

### 1. Install dependencies (if not already done)

```bash
cd blockchain
npm install
```

### 2. Compile the contract

```bash
npm run compile
# or
npx hardhat compile
```

### 3. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

You should see output like:

```
Deploying SecureChain contract...
SecureChain deployed to: 0xYourContractAddress123456789
Deployer address: 0xYourWalletAddress
Initial roles assigned successfully
```

**IMPORTANT**: Copy the contract address! You'll need it in the next steps.

### 4. Verify your contract on Etherscan (optional but recommended)

```bash
npx hardhat verify --network sepolia 0xYourContractAddress123456789
```

After verification, you can view your contract at:
https://sepolia.etherscan.io/address/0xYourContractAddress

---

## 📋 Step 6: Update Backend Configuration

### 1. Update `backend/.env`

Replace the blockchain section with your deployed contract details:

```bash
# BLOCKCHAIN - SEPOLIA TESTNET
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
CONTRACT_ADDRESS=0xYourDeployedContractAddress
DEPLOYER_PRIVATE_KEY=0xYourPrivateKey

# Keep local Hardhat commented out
# BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
# CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 2. Restart backend server

```bash
cd backend
# Stop the current server (Ctrl+C)
# Restart it
uvicorn app.main:app --reload
```

---

## 📋 Step 7: Update Frontend Configuration

### 1. Update `frontend/.env`

```bash
VITE_API_URL=http://localhost:8000/api/v1

# SEPOLIA TESTNET
VITE_BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=Sepolia

# Comment out Hardhat local
# VITE_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
# VITE_CHAIN_ID=31337
```

### 2. Restart frontend

```bash
cd frontend
# Stop current dev server (Ctrl+C)
npm run dev
```

---

## 📋 Step 8: Configure MetaMask for Sepolia

### 1. Add Sepolia Network to MetaMask

1. Open MetaMask
2. Click the network dropdown (top left)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:

```
Network Name: Sepolia
RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

5. Click "Save"

### 2. Switch to Sepolia Network

1. Click the network dropdown
2. Select "Sepolia"

---

## 📋 Step 9: Test Registration with Blockchain

### 1. Open the application

Go to http://localhost:5173

### 2. Register a new account

1. Click "Request Access" (or go to `/request-access`)
2. Fill in the form:
   - Full Name: Your name
   - Email: your@email.com
   - Organization: Test Company
   - Select a role: Employee or Manager
   - Set password: Min 8 chars with uppercase, number, special char
3. Click "Submit Access Request"

### 3. Check the backend logs

You should see:

```
✅ Blockchain DID created successfully: 0xTransactionHash123...
```

### 4. Verify on Sepolia Etherscan

1. Copy the transaction hash from logs
2. Go to https://sepolia.etherscan.io/tx/0xYourTransactionHash
3. You should see your transaction with:
   - Status: Success ✓
   - Method: createIdentity
   - From: Your deployer address
   - To: Your contract address

### 5. View your contract transactions

Go to: https://sepolia.etherscan.io/address/0xYourContractAddress

You'll see all transactions including:
- Contract deployment
- Identity creations (createIdentity)
- Asset minting (mintAsset)
- Asset assignments (assignAsset)

---

## 🎉 Success! What's Next?

Your SecureChain application is now running on Sepolia testnet. All blockchain transactions are now:

✅ **Visible on Sepolia Etherscan**  
✅ **Permanently recorded on blockchain**  
✅ **Verifiable by anyone**  
✅ **Immutable and tamper-proof**

### Features you can now test:

1. **Register users** → Creates DID on blockchain
2. **Mint assets** → Creates NFT on blockchain
3. **Assign assets** → Records assignment on blockchain
4. **View audit trail** → All transactions visible on Etherscan

---

## 🐛 Troubleshooting

### "Insufficient funds" error
- Get more Sepolia ETH from faucets (see Step 1)
- Each transaction costs ~0.001-0.01 ETH

### "Invalid RPC URL" error
- Check your Infura/Alchemy project ID
- Make sure you copied the full URL with `/v3/PROJECT_ID`

### "Contract not deployed" error
- Check CONTRACT_ADDRESS in both .env files
- Make sure deployment to Sepolia succeeded
- Verify contract address on Sepolia Etherscan

### "Transaction failed" error
- Check if you're on Sepolia network in MetaMask
- Verify you have enough Sepolia ETH
- Check gas price - sometimes network is congested

### Can't see transactions on Etherscan
- Wait 1-2 minutes for transaction to be mined
- Check you're using https://sepolia.etherscan.io (not mainnet)
- Verify your contract address is correct

### Backend logs show "Blockchain DID creation failed"
- Check BLOCKCHAIN_RPC_URL in backend/.env
- Verify CONTRACT_ADDRESS is correct
- Check DEPLOYER_PRIVATE_KEY has Sepolia ETH

---

## 📚 Useful Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Infura Dashboard**: https://infura.io/dashboard
- **Alchemy Dashboard**: https://dashboard.alchemy.com
- **Sepolia Faucet**: https://sepoliafaucet.com
- **MetaMask Support**: https://metamask.io/support

---

## 🔒 Security Best Practices

1. **Never commit private keys** to git
2. Use **test wallets only** for development
3. Use **environment variables** for sensitive data
4. Add `.env` to `.gitignore`
5. For production, use **hardware wallets** or **HSM**

---

## 💡 Next Steps

Once everything works on Sepolia:

1. Test all features (create users, mint assets, assign assets)
2. Verify transactions on Etherscan
3. For production deployment, consider:
   - Using **Ethereum mainnet** (requires real ETH)
   - Or **Polygon** (cheaper gas fees)
   - Or other EVM-compatible chains

---

Need help? Check the logs:
- Backend: Terminal where `uvicorn` is running
- Frontend: Browser console (F12)
- Blockchain: Transaction hash on Etherscan

Good luck! 🚀
