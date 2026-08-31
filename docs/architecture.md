# SecureChain Architecture

## Overview

SecureChain is a full-stack blockchain application implementing decentralized identity (DID), NFT-based digital asset ownership, and immutable audit trails. The system follows a hybrid architecture with clear separation between on-chain and off-chain data.

## System Components

### 1. Frontend (React + TypeScript)
- **Framework**: React 18 with Vite
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Blockchain**: Ethers.js v6
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

### 2. Backend (FastAPI + Python)
- **Framework**: FastAPI with async support
- **Database**: PostgreSQL with SQLAlchemy 2.0 (async)
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt via passlib
- **Blockchain**: Web3.py v6
- **Validation**: Pydantic v2

### 3. Blockchain (Solidity + Hardhat)
- **Language**: Solidity 0.8.24
- **Framework**: Hardhat with TypeScript
- **Libraries**: OpenZeppelin Contracts v5
- **Testing**: Chai + Mocha + Hardhat Toolbox
- **Type Generation**: TypeChain for ethers-v6

### 4. Database (PostgreSQL)
- **Tables**: users, dids, assets, transfers, audit_logs, blockchain_transactions, permissions, role_permissions
- **Indexes**: Optimized for common query patterns
- **Constraints**: Foreign keys, check constraints, unique constraints

## Data Flow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────►│   Backend   │────►│  Blockchain │
│  (Browser)  │     │   (FastAPI) │     │  (EVM)      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                    │
│  • User accounts & authentication                  │
│  • DID records (off-chain metadata)                │
│  • Asset metadata & ownership                      │
│  • Transfer requests & status                      │
│  • Audit logs (indexed for querying)               │
│  • Blockchain transaction cache                    │
└─────────────────────────────────────────────────────┘
```

## On-Chain vs Off-Chain Data Model

### On-Chain (Blockchain)
- DID identifiers and wallet mappings
- Identity verification status
- NFT ownership (ERC-721)
- Role assignments (AccessControl)
- Critical state transitions
- Event emissions for audit trail

### Off-Chain (PostgreSQL)
- User profiles and credentials
- Password hashes (bcrypt)
- Asset descriptions and metadata
- Search indexes and pagination
- UI preferences
- Audit log cache with verification status
- Non-sensitive application data

## Smart Contract Architecture

### SecureChain.sol
```
SecureChain
├── ERC721 (OpenZeppelin)
├── ERC721URIStorage (OpenZeppelin)
├── AccessControl (OpenZeppelin)
└── Custom Logic
    ├── Identity Management
    │   ├── createIdentity()
    │   ├── verifyIdentity()
    │   └── getIdentity()
    ├── Asset Management (ERC-721)
    │   ├── mintAsset()
    │   ├── allocateAsset()
    │   ├── transferAsset()
    │   ├── burnAsset()
    │   └── freezeAsset()
    ├── Role Management
    │   ├── assignRole()
    │   └── revokeRole()
    └── Audit Trail
        ├── _recordAudit()
        ├── getAuditRecord()
        └── getAuditCount()
```

### Roles (AccessControl)
- `DEFAULT_ADMIN_ROLE` - Contract admin
- `ADMIN_ROLE` - Platform admin
- `MANAGER_ROLE` - Asset allocation
- `AUDITOR_ROLE` - Audit access
- `MINTER_ROLE` - Asset minting
- `IDENTITY_VERIFIER_ROLE` - Identity verification

### Events
- `IdentityCreated(did, wallet, identityHash, timestamp)`
- `IdentityVerified(did, verifier, timestamp)`
- `AssetMinted(tokenId, assetId, creator, owner, name, timestamp)`
- `AssetAllocated(tokenId, from, to, timestamp)`
- `AssetTransferred(tokenId, from, to, timestamp)`
- `RoleAssigned(account, role, assigner, timestamp)`
- `RoleRevoked(account, role, revoker, timestamp)`
- `AuditRecorded(auditId, actor, action, resourceType, resourceId, role, blockNumber, timestamp)`

## API Architecture

### REST Endpoints Structure
```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── GET  /me
│   └── POST /logout
├── /users (Admin/Manager)
│   ├── GET    /
│   ├── GET    /{id}
│   ├── PATCH  /{id}
│   ├── PATCH  /{id}/role
│   └── DELETE /{id}
├── /dids
│   ├── POST   /
│   ├── GET    /me
│   ├── GET    /
│   ├── GET    /{id}
│   └── POST   /{id}/verify
├── /assets
│   ├── POST   /
│   ├── GET    /
│   ├── GET    /{id}
│   ├── PATCH  /{id}
│   ├── POST   /{id}/allocate
│   └── POST   /{id}/transfer
├── /transfers
│   ├── POST   /
│   ├── GET    /
│   ├── GET    /{id}
│   ├── POST   /{id}/approve
│   ├── POST   /{id}/reject
│   └── POST   /{id}/cancel
├── /audit (Auditor)
│   ├── GET  /
│   ├── GET  /{id}
│   └── POST /verify
├── /blockchain
│   ├── GET /status
│   ├── GET /transaction/{hash}
│   ├── GET /assets/{tokenId}
│   └── GET /transactions
└── /dashboard
    └── GET /stats
```

### Authentication Flow
```
1. Client → POST /auth/login (email, password)
2. Server → Verify password (bcrypt)
3. Server → Generate JWT (user_id, email, role, exp)
4. Server → Return { access_token, token_type, expires_in }
5. Client → Store token in localStorage
6. Client → Include Authorization: Bearer <token> in requests
7. Server → Validate JWT → Extract user_id → Query DB → Return user
```

### Authorization Model
- **Frontend**: Route guards based on user role
- **Backend**: Dependency injection with role checkers
- **Blockchain**: AccessControl modifiers on contract functions

## Database Schema

### Core Tables

#### users
```sql
id, email, hashed_password, full_name, wallet_address, 
role, is_active, is_verified, created_at, updated_at, last_login
```

#### dids
```sql
id, did, user_id, wallet_address, identity_hash, 
verified, verification_tx_hash, created_at, verified_at,
blockchain_tx_hash, blockchain_block_number
```

#### assets
```sql
id, token_id, asset_id, name, description, category,
metadata_uri, creator_id, owner_id, status,
created_at, updated_at, blockchain_tx_hash, blockchain_block_number
```

#### transfers
```sql
id, asset_id, initiator_id, recipient_id, from_address,
to_address, status, blockchain_tx_hash, blockchain_block_number,
error_message, created_at, updated_at, completed_at
```

#### audit_logs
```sql
id, actor_id, actor_address, action, resource_type,
resource_id, role, blockchain_tx_hash, blockchain_block_number,
blockchain_verified, details, ip_address, user_agent, created_at
```

#### blockchain_transactions
```sql
id, tx_hash, block_number, block_hash, from_address,
to_address, value, gas_used, gas_price, status,
contract_address, method_name, event_data, created_at
```

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── layout/          # Header, Sidebar, MainLayout
│   └── ui/              # Button, Input, Card, Table, Modal, Badge, Toast
├── pages/               # Route-level components
├── layouts/             # AuthLayout, LandingLayout, MainLayout
├── context/             # AuthContext, WalletContext, ThemeContext
├── hooks/               # useApi (TanStack Query), useMediaQuery
├── services/            # API client (axios)
├── types/               # TypeScript interfaces
└── utils/               # Helpers (formatting, classnames)
```

### State Management
- **Server State**: TanStack Query (caching, background refetch)
- **Client State**: React Context (auth, wallet, theme)
- **Form State**: React Hook Form

### Wallet Integration
- MetaMask detection via `window.ethereum`
- Ethers.js BrowserProvider
- Account/chain change listeners
- Transaction signing support

## Deployment Architecture

### Development
```
Local Machine
├── PostgreSQL (Docker)
├── Redis (Docker)
├── Hardhat Node (localhost:8545)
├── Backend (localhost:8000)
└── Frontend (localhost:5173)
```

### Production (Recommended)
```
Load Balancer
├── Frontend (CDN + Nginx)
├── Backend (Kubernetes/Docker Swarm)
│   ├── Multiple replicas
│   ├── Health checks
│   └── Auto-scaling
├── PostgreSQL (Managed - AWS RDS/Cloud SQL)
├── Redis (Managed - ElastiCache/Cloud Memorystore)
└── Blockchain (Infura/Alchemy/Self-hosted)
```

## Security Architecture

### Defense in Depth
1. **Network**: HTTPS, CORS, rate limiting
2. **Application**: JWT auth, role-based authorization, input validation
3. **Database**: Parameterized queries, least privilege
4. **Blockchain**: AccessControl, reentrancy protection, event logging
5. **Operations**: Audit logs, monitoring, secrets management

### Threat Model
- **Authentication**: JWT theft → Short expiry, secure storage
- **Authorization**: Role escalation → Backend + frontend checks
- **Injection**: SQL/XSS → ORM, output encoding
- **Blockchain**: Reentrancy → OpenZeppelin ReentrancyGuard
- **Data**: PII exposure → No sensitive data on-chain

## Scalability Considerations

### Backend
- Async database operations
- Connection pooling
- Redis caching for frequent queries
- Horizontal scaling with stateless design

### Blockchain
- Event indexing for fast queries
- Batch operations where possible
- Layer 2 consideration for production

### Frontend
- Code splitting by route
- TanStack Query caching
- Optimistic updates for better UX

## Monitoring & Observability

### Health Checks
- `/health` endpoint (database + blockchain)
- Structured logging
- Error tracking ready for Sentry

### Metrics
- API response times
- Database query performance
- Blockchain connection status
- Transaction success rates