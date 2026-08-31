# SecureChain — Decentralized Identity, NFT Asset Ownership & Immutable Audit Platform

[![SIH26125](https://img.shields.io/badge/SIH-26125-blue)](https://sih.gov.in)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)]()

A production-ready platform for **decentralized identity management**, **NFT-based digital asset ownership**, and **immutable audit trails** powered by blockchain technology. Built for Smart India Hackathon 2026 (SIH26125).

## 🎯 Problem Statement

Organizations need a secure, tamper-resistant way to manage:
- **Digital identities** with cryptographic proofs
- **Decentralized identifiers (DIDs)** following W3C standards
- **Role-based access control** (Admin, Manager, Auditor, User)
- **Digital asset ownership** via ERC-721 NFTs
- **Authorized asset allocation** and **ownership transfers**
- **Immutable audit trails** for all critical operations

The blockchain provides trust and tamper resistance for critical operations.

## ✨ Features

### 🔐 Decentralized Identity (DID)
- W3C-compliant `did:securechain:` identifiers
- Cryptographic identity hashes (SHA-256)
- Wallet address linking
- On-chain identity verification
- Identity creation and verification events

### 🎨 NFT Digital Assets (ERC-721)
- Mint assets with metadata (IPFS URIs)
- Asset categories and descriptions
- Ownership tracking on-chain
- Transfer history immutable on blockchain
- Asset status management (Active, Transferred, Burned, Frozen)

### 🛡️ Role-Based Access Control (RBAC)
| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, user management, role assignment, identity creation, asset minting, system config |
| **MANAGER** | Asset management, allocation, transfer approval, audit viewing |
| **AUDITOR** | Read-only audit access, blockchain verification, ownership history, identity proofs |
| **USER** | Own identity, own assets, transfer requests, activity view |

### 📋 Immutable Audit Trail
- Every critical operation logged
- Blockchain transaction hashes stored
- Real-time blockchain verification
- Tamper-evident records
- Auditor verification interface

### ⛓️ Blockchain Integration
- Hardhat local development network
- OpenZeppelin secure contracts
- MetaMask wallet integration
- Real-time transaction monitoring
- Event parsing and indexing

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend       │     │   Blockchain    │
│   (React/Vite)  │◄───►│   (FastAPI)     │◄───►│   (Hardhat)     │
│                 │     │                 │     │                 │
│ • Dashboard     │     │ • REST API      │     │ • ERC-721 NFTs  │
│ • Wallet Conn.  │     │ • JWT Auth      │     │ • AccessControl │
│ • Real-time UI  │     │ • PostgreSQL    │     │ • Events        │
│ • Charts        │     │ • Audit Logs    │     │ • Verification  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                        │
│  users • dids • assets • transfers • audit_logs • blockchain_txs │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **TanStack Query** for server state
- **Ethers.js** for blockchain interaction
- **Recharts** for data visualization
- **React Hook Form** + **Zod** for forms
- **Lucide React** for icons

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy 2.0** (Async)
- **PostgreSQL** (AsyncPG)
- **Pydantic v2** for validation
- **JWT** authentication (python-jose)
- **bcrypt** password hashing (passlib)
- **Web3.py** for blockchain interaction

### Blockchain
- **Solidity 0.8.24**
- **Hardhat** development framework
- **OpenZeppelin Contracts v5**
- **TypeChain** for type-safe contracts
- **Chai/Mocha** for testing

### Infrastructure
- **Docker** + **Docker Compose**
- **PostgreSQL 16**
- **Redis 7** (optional)

## 📁 Project Structure

```
securechain/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── context/          # React context providers
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   └── assets/           # Static assets
│   ├── package.json
│   └── .env.example
│
├── backend/                  # FastAPI + Python
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database setup
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   ├── services/         # Business logic
│   │   ├── auth/             # Authentication
│   │   ├── blockchain/       # Blockchain service
│   │   ├── did/              # DID service
│   │   └── audit/            # Audit service
│   ├── requirements.txt
│   ├── .env.example
│   └── tests/                # Pytest tests
│
├── blockchain/               # Smart contracts
│   ├── contracts/
│   │   └── SecureChain.sol   # Main contract
│   ├── scripts/
│   │   └── deploy.ts         # Deployment script
│   ├── test/
│   │   └── SecureChain.test.ts # Contract tests
│   ├── hardhat.config.ts
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── schema.sql            # PostgreSQL schema
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── blockchain.md
│   └── security.md
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🌐 Essential Services & URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **PostgreSQL** | `localhost:5432` | Primary database |
| **Hardhat Node** | `http://127.0.0.1:8545` | Local EVM blockchain |
| **Backend API** | `http://localhost:8000` | FastAPI REST API |
| **API Docs (Swagger)** | `http://localhost:8000/docs` | Interactive API documentation |
| **API Docs (ReDoc)** | `http://localhost:8000/redoc` | Alternative API docs |
| **Health Check** | `http://localhost:8000/health` | Service health status |
| **Frontend** | `http://localhost:5173` | React application |
| **MetaMask RPC** | `http://127.0.0.1:8545` | Wallet connection |

## 🔧 Required Environment Variables

### Backend (`.env` in `/backend`)
```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/securechain

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET=your-256-bit-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...  # From hardhat deployment
DEPLOYER_PRIVATE_KEY=0x...  # Hardhat account #0 private key

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
```

### Frontend (`.env` in `/frontend`)
```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
VITE_CONTRACT_ADDRESS=0x...  # Same as backend
VITE_CHAIN_ID=31337
VITE_NETWORK_NAME=Hardhat Localhost
```

### Blockchain (`.env` in `/blockchain`)
```bash
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=  # Filled after deployment
```

## 🔑 Hardhat Default Accounts (for MetaMask)

| Account | Address | Private Key | Balance |
|---------|---------|-------------|---------|
| #0 (Deployer) | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` | 10000 ETH |
| #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` | 10000 ETH |
| #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` | 10000 ETH |

**Import to MetaMask**: Settings → Networks → Add Network → Import Account (paste private key)

## 🚀 Quick Start — Complete Commands

### Prerequisites
- **Node.js 20+** and **npm**
- **Python 3.11+** and **pip**
- **PostgreSQL 16+** (or Docker)
- **Docker** (optional, for containerized setup)
- **MetaMask** browser extension

### Option 1: Manual Setup (Recommended for Development)

```bash
# 1. Clone repository
git clone <repository-url>
cd securechain

# 2. Start PostgreSQL (via Docker)
docker-compose up -d postgres redis

# 3. Setup Backend
cd backend
cp .env.example .env
# Edit .env with your settings (add JWT_SECRET, etc.)

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# 4. Setup Blockchain (in new terminal)
cd ../blockchain
cp .env.example .env
# Edit .env if needed (default PRIVATE_KEY works for Hardhat)

# Install dependencies
npm install

# 5. Start Hardhat Node (Terminal 1 - keep running)
npm run node

# 6. Deploy Contract (Terminal 2)
npm run deploy
# Copy the CONTRACT_ADDRESS output to:
# - backend/.env (CONTRACT_ADDRESS=0x...)
# - frontend/.env (VITE_CONTRACT_ADDRESS=0x...)

# 7. Start Backend (Terminal 3)
cd ../backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 8. Start Frontend (Terminal 4)
cd ../frontend
cp .env.example .env
# Edit .env with VITE_CONTRACT_ADDRESS from step 6
npm install
npm run dev
```

### Option 2: Docker Compose (Production-like)

```bash
# 1. Start all services
docker-compose up -d --build

# 2. Start Hardhat Node (separate terminal - not in docker)
cd blockchain && npm run node

# 3. Deploy Contract (separate terminal)
cd blockchain && npm run deploy
# Copy CONTRACT_ADDRESS to .env files

# 4. Restart backend with contract address
docker-compose restart backend
```

### Access Points After Startup
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Hardhat Node**: http://localhost:8545

## 🔐 Demo Credentials (Development Only)

Run the seed script to create demo users:
```bash
cd backend
python ../seed.py
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@securechain.local | Admin@123 |
| Manager | manager@securechain.local | Manager@123 |
| Auditor | auditor@securechain.local | Auditor@123 |
| User | user1@securechain.local | User@123 |

> ⚠️ **Never use these credentials in production!**

## 📋 Complete Demo Workflow

1. **Start PostgreSQL**: `docker-compose up -d postgres`
2. **Start Hardhat**: `cd blockchain && npm run node`
3. **Deploy Contract**: `cd blockchain && npm run deploy`
4. **Update .env files** with contract address
5. **Start Backend**: `cd backend && uvicorn app.main:app --reload`
6. **Start Frontend**: `cd frontend && npm run dev`
7. **Login as Admin** (admin@securechain.local / Admin@123)
8. **Create DID** for a user
9. **Verify Identity** on blockchain
10. **Assign Manager role** to a user
11. **Mint NFT Asset** with metadata
12. **Allocate Asset** to user
13. **Login as User** to view asset
14. **Initiate Transfer** to another user
15. **Login as Manager** to approve transfer
16. **Login as Auditor** to verify transaction on blockchain
17. **View Immutable Audit Trail** with blockchain verification

## 🔌 Key API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login and get JWT |
| GET | `/api/v1/auth/me` | JWT | Get current user |
| POST | `/api/v1/auth/logout` | JWT | Logout |

### Users (Admin/Manager)
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/v1/users` | JWT | Admin/Manager |
| GET | `/api/v1/users/{id}` | JWT | Admin/Manager |
| PATCH | `/api/v1/users/{id}` | JWT | Admin/Manager |
| PATCH | `/api/v1/users/{id}/role` | JWT | Admin |

### DIDs (Decentralized Identifiers)
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/v1/dids` | JWT | Admin |
| GET | `/api/v1/dids/me` | JWT | Any |
| GET | `/api/v1/dids` | JWT | Admin/Manager/Auditor |
| GET | `/api/v1/dids/{id}` | JWT | Admin/Manager/Auditor |
| POST | `/api/v1/dids/{id}/verify` | JWT | Admin |

### Assets (NFTs)
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/v1/assets` | JWT | Admin |
| GET | `/api/v1/assets` | JWT | Any |
| GET | `/api/v1/assets/{id}` | JWT | Any |
| POST | `/api/v1/assets/{id}/allocate` | JWT | Admin/Manager |
| POST | `/api/v1/assets/{id}/transfer` | JWT | Owner/Admin/Manager |

### Transfers
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/v1/transfers` | JWT | User |
| GET | `/api/v1/transfers` | JWT | Any |
| POST | `/api/v1/transfers/{id}/approve` | JWT | Admin/Manager |
| POST | `/api/v1/transfers/{id}/reject` | JWT | Admin/Manager |
| POST | `/api/v1/transfers/{id}/cancel` | JWT | Initiator/Admin |

### Audit Trail (Auditor)
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/v1/audit` | JWT | Admin/Auditor |
| POST | `/api/v1/audit/verify` | JWT | Admin/Auditor |

### Blockchain
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/v1/blockchain/status` | JWT | Any |
| GET | `/api/v1/blockchain/transaction/{hash}` | JWT | Auditor |
| GET | `/api/v1/blockchain/assets/{tokenId}` | JWT | Any |

### Dashboard
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/v1/dashboard/stats` | JWT | Any |

## 🔗 Blockchain Contract Methods (Direct Interaction)

```solidity
// Identity
createIdentity(did, wallet, identityHash)     // Admin
verifyIdentity(did)                            // Identity Verifier
getIdentity(did)                               // View

// Assets (ERC-721)
mintAsset(assetId, name, desc, category, uri, owner)  // Minter
allocateAsset(tokenId, to)                       // Manager
transferAsset(tokenId, to)                       // Owner/Manager/Admin
burnAsset(tokenId)                               // Owner/Admin
freezeAsset(tokenId)                             // Admin

// Roles
assignRole(account, role)                        // Admin
revokeRole(account, role)                        // Admin

// Audit
getAuditRecord(auditId)                          // Auditor
getAuditCount()                                  // Auditor
```

## 📦 Smart Contract Events (for Indexing)

```solidity
IdentityCreated(did, wallet, identityHash, timestamp)
IdentityVerified(did, verifier, timestamp)
AssetMinted(tokenId, assetId, creator, owner, name, timestamp)
AssetAllocated(tokenId, from, to, timestamp)
AssetTransferred(tokenId, from, to, timestamp)
RoleAssigned(account, role, assigner, timestamp)
RoleRevoked(account, role, revoker, timestamp)
AuditRecorded(auditId, actor, action, resourceType, resourceId, role, blockNumber, timestamp)
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pip install -r requirements-test.txt
pytest tests/ -v
```

### Blockchain Tests
```bash
cd blockchain
npm test
npm run coverage  # With coverage report
REPORT_GAS=true npm test  # With gas reporting
```

### Frontend Type Check
```bash
cd frontend
npm run build
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart specific service
docker-compose restart backend
```

## 🔒 Security Checklist

- [ ] All `.env` files use strong, unique secrets
- [ ] JWT secret is 256-bit random string (`openssl rand -hex 32`)
- [ ] Database passwords are strong
- [ ] Blockchain private keys from hardware wallet/HSM (production)
- [ ] HTTPS enabled with valid certificates (production)
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting configured
- [ ] Security headers implemented
- [ ] Dependency vulnerability scan passed (`npm audit`, `safety check`)
- [ ] Smart contract audit completed (if mainnet)

## 📚 Documentation

- [Architecture](docs/architecture.md) - System architecture details
- [API Reference](docs/api.md) - Complete API documentation
- [Blockchain](docs/blockchain.md) - Smart contract documentation
- [Security](docs/security.md) - Security architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Smart India Hackathon 2026** for the problem statement (SIH26125)
- **OpenZeppelin** for secure smart contract libraries
- **FastAPI** for the excellent Python framework
- **React Team** for the frontend framework
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the API docs at `/docs` endpoint

---

**Built with ❤️ for SIH26125 — Secure Digital Ownership. Verified Identity. Immutable Trust.**