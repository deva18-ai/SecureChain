# SecureChain API Reference

## Base URL
```
Development: http://localhost:8000/api/v1
Production:  https://api.securechain.example.com/api/v1
```

## Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

### Token Payload
```json
{
  "sub": 1,
  "email": "user@example.com",
  "role": "USER",
  "exp": 1699999999
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message",
  "error_code": "VALIDATION_ERROR",
  "field": "email"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials",
  "error_code": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "detail": "Operation requires one of: ['ADMIN', 'MANAGER']",
  "error_code": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found",
  "error_code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error",
  "error_code": "INTERNAL_ERROR"
}
```

## Pagination

List endpoints support pagination:
```
GET /api/v1/users?page=1&page_size=20
```

Response format:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "SecurePass123!",
  "wallet_address": "0x1234567890123456789012345678901234567890",
  "role": "USER"
}
```

**Response:** `201 Created` - User object

**Notes:**
- Role defaults to `USER`
- Cannot register as `ADMIN`
- Email must be unique
- Wallet address must be unique if provided
- Password: min 8 chars, uppercase, lowercase, number, special char

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK` - Token object

### Get Current User
```
GET /auth/me
```

**Response:** `200 OK` - User object

### Logout
```
POST /auth/logout
```

**Response:** `200 OK` - `{ "message": "Successfully logged out" }`

---

## User Endpoints (Admin/Manager)

### List Users
```
GET /users
```

**Query Parameters:**
- `page` (int, default: 1)
- `page_size` (int, default: 20, max: 100)
- `role` (enum: ADMIN, MANAGER, AUDITOR, USER)
- `is_active` (boolean)
- `search` (string - searches email and name)

**Response:** `200 OK` - Paginated User list

### Get User
```
GET /users/{id}
```

**Response:** `200 OK` - User with details (DIDs count, assets count)

### Update User
```
PATCH /users/{id}
```

**Request Body:**
```json
{
  "full_name": "Jane Doe",
  "wallet_address": "0x0987654321098765432109876543210987654321",
  "is_active": true,
  "is_verified": false
}
```

**Response:** `200 OK` - Updated user

### Update User Role (Admin Only)
```
PATCH /users/{id}/role
```

**Request Body:**
```json
{
  "role": "MANAGER"
}
```

**Response:** `200 OK` - Updated user

### Delete User (Admin Only)
```
DELETE /users/{id}
```

**Response:** `204 No Content`

---

## DID Endpoints

### Create DID (Admin)
```
POST /dids
```

**Request Body:** (Optional - auto-generates if omitted)
```json
{
  "did": "did:securechain:abcdef1234567890",
  "wallet_address": "0x1234567890123456789012345678901234567890",
  "identity_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Response:** `201 Created` - DID object

**Auto-generation:**
- DID: `did:securechain:<16-random-hex-bytes>`
- Identity Hash: SHA-256(wallet + did + entropy)

### Get My DID
```
GET /dids/me
```

**Response:** `200 OK` - Current user's DID

### List DIDs
```
GET /dids
```

**Query Parameters:**
- `page`, `page_size`
- `verified` (boolean)
- `search` (string - searches DID)

**Response:** `200 OK` - Paginated DID list

### Get DID
```
GET /dids/{id}
```

**Response:** `200 OK` - DID with user details

### Verify DID (Admin)
```
POST /dids/{id}/verify
```

**Response:** `200 OK` - Verified DID with blockchain transaction

---

## Asset Endpoints (NFTs)

### Mint Asset (Admin)
```
POST /assets
```

**Request Body:**
```json
{
  "asset_id": "asset-001",
  "name": "Laptop Pro 15",
  "description": "Company laptop for development",
  "category": "Equipment",
  "metadata_uri": "ipfs://QmHash123...",
  "initial_owner_id": 5
}
```

**Response:** `201 Created` - Asset object with token_id

### List Assets
```
GET /assets
```

**Query Parameters:**
- `page`, `page_size`
- `status` (ACTIVE, TRANSFERRED, BURNED, FROZEN)
- `category` (string)
- `owner_id` (int - Admin/Manager/Auditor only)
- `search` (string - searches name, asset_id, category)

**Response:** `200 OK` - Paginated Asset list with details

### Get Asset
```
GET /assets/{id}
```

**Response:** `200 OK` - Asset with creator, owner, transfer history

### Update Asset (Admin)
```
PATCH /assets/{id}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "category": "New Category",
  "metadata_uri": "ipfs://NewHash...",
  "status": "ACTIVE"
}
```

**Response:** `200 OK` - Updated asset

### Allocate Asset (Admin/Manager)
```
POST /assets/{id}/allocate
```

**Request Body:**
```json
{
  "new_owner_id": 7
}
```

**Response:** `200 OK` - Asset with new owner and blockchain transaction

**Requirements:**
- Asset status must be ACTIVE
- New owner must have wallet address
- Executes on-chain allocation

### Transfer Asset (Owner/Admin/Manager)
```
POST /assets/{id}/transfer
```

**Request Body:**
```json
{
  "new_owner_id": 8
}
```

**Response:** `200 OK` - Asset with new owner and blockchain transaction

**Requirements:**
- Requester must be owner or Admin/Manager
- Asset cannot be BURNED or FROZEN

---

## Transfer Endpoints

### Create Transfer Request
```
POST /transfers
```

**Request Body:**
```json
{
  "asset_id": 1,
  "to_address": "0x0987654321098765432109876543210987654321"
}
```

**Response:** `201 Created` - Transfer object (PENDING status)

**Requirements:**
- Requester must own the asset
- Asset must be ACTIVE
- Recipient must exist with wallet address

### List Transfers
```
GET /transfers
```

**Query Parameters:**
- `page`, `page_size`
- `status` (PENDING, APPROVED, REJECTED, COMPLETED, FAILED, CANCELLED)
- `asset_id` (int)

**Response:** `200 OK` - Paginated Transfer list

### Get Transfer
```
GET /transfers/{id}
```

**Response:** `200 OK` - Transfer with asset, initiator, recipient details

### Approve Transfer (Admin/Manager)
```
POST /transfers/{id}/approve
```

**Response:** `200 OK` - Completed transfer with blockchain transaction

**Requirements:**
- Transfer must be PENDING
- Asset must be transferable

### Reject Transfer (Admin/Manager)
```
POST /transfers/{id}/reject
```

**Request Body:**
```json
{
  "reason": "Insufficient authorization"
}
```

**Response:** `200 OK` - Rejected transfer

### Cancel Transfer (Initiator/Admin)
```
POST /transfers/{id}/cancel
```

**Response:** `200 OK` - Cancelled transfer

**Requirements:**
- Transfer must be PENDING
- Requester must be initiator or Admin

---

## Audit Endpoints (Auditor)

### List Audit Logs
```
GET /audit
```

**Query Parameters:**
- `page`, `page_size`
- `action` (enum - see AuditAction)
- `resource_type` (string)
- `actor_id` (int)
- `blockchain_verified` (boolean)

**Response:** `200 OK` - Paginated AuditLog list

### Get Audit Log
```
GET /audit/{id}
```

**Response:** `200 OK` - AuditLog with actor details

### Verify on Blockchain
```
POST /audit/verify
```

**Request Body:** (At least one required)
```json
{
  "tx_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "token_id": 1,
  "did": "did:securechain:abcdef1234567890"
}
```

**Response:** `200 OK` - VerificationResult
```json
{
  "verified": true,
  "tx_hash": "0xabcdef...",
  "block_number": 12345,
  "block_timestamp": 1699999999,
  "contract_address": "0x1234...",
  "event_type": "AssetTransferred",
  "actor": "0x1234...",
  "token_id": 1,
  "from_address": "0x1111...",
  "to_address": "0x2222..."
}
```

---

## Blockchain Endpoints

### Get Blockchain Status
```
GET /blockchain/status
```

**Response:** `200 OK` - BlockchainStatus
```json
{
  "connected": true,
  "network": "localhost",
  "chain_id": 31337,
  "block_number": 12345,
  "contract_address": "0x1234567890123456789012345678901234567890",
  "contract_verified": true
}
```

### Get Transaction
```
GET /blockchain/transaction/{tx_hash}
```

**Response:** `200 OK` - BlockchainTransaction

### Get On-Chain Asset
```
GET /blockchain/assets/{token_id}
```

**Response:** `200 OK` - On-chain asset data
```json
{
  "tokenId": 1,
  "assetId": "asset-001",
  "name": "Laptop Pro 15",
  "description": "Company laptop",
  "category": "Equipment",
  "metadataURI": "ipfs://QmHash...",
  "creator": "0x1234...",
  "currentOwner": "0x5678...",
  "createdAt": 1699999999,
  "status": 0,
  "mintTxHash": "0xabcdef..."
}
```

### List Blockchain Transactions
```
GET /blockchain/transactions
```

**Query Parameters:**
- `page`, `page_size`
- `from_address` (string)
- `contract_address` (string)

**Response:** `200 OK` - Paginated BlockchainTransaction list

---

## Dashboard Endpoints

### Get Dashboard Statistics
```
GET /dashboard/stats
```

**Response:** `200 OK` - DashboardStats
```json
{
  "total_users": 25,
  "verified_identities": 18,
  "total_assets": 42,
  "active_transfers": 3,
  "blockchain_transactions": 156,
  "audit_events": 289,
  "role_distribution": {
    "ADMIN": 2,
    "MANAGER": 5,
    "AUDITOR": 3,
    "USER": 15
  },
  "recent_activity": [
    {
      "action": "ASSET_MINTED",
      "resource_type": "ASSET",
      "resource_id": "5",
      "actor": "Admin User",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## WebSocket (Future)

Real-time updates for:
- New audit logs
- Transfer status changes
- Blockchain transaction confirmations
- Asset ownership changes

---

## Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Auth | 10 req/min |
| Read | 100 req/min |
| Write | 30 req/min |
| Blockchain | 20 req/min |

Headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Versioning

API version in URL path: `/api/v1/`
Breaking changes will increment version number.