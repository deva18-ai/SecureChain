# SecureChain Blockchain Documentation

## Smart Contract: SecureChain.sol

### Overview
The SecureChain smart contract implements a comprehensive platform for decentralized identity management, ERC-721 NFT asset ownership with **non-transferable assignments**, role-based access control, and immutable audit trails. Built on OpenZeppelin contracts for security and standards compliance.

### Core Security Model
> **USERS ASSIGNED ASSETS CANNOT TRANSFER THEM.**
> 
> This is enforced at the **smart contract level** by:
> - Separating ERC-721 ownership from SecureChain assignment
> - Contract retains ERC-721 ownership (custodian model)
> - Overriding `_transfer`, `approve`, `setApprovalForAll` to BLOCK unauthorized operations
> - Only ADMIN/MANAGER can assign/reassign assets via `assignAsset`/`revokeAssignment`
> - Security alerts emitted on every unauthorized attempt

### Contract Details
- **Name**: SecureChain Asset
- **Symbol**: SCA
- **Standard**: ERC-721 (with overridden transfer functions)
- **Access Control**: OpenZeppelin AccessControl
- **Solidity Version**: ^0.8.24
- **License**: MIT

### Deployment
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat node          # Terminal 1: Start local node
npx hardhat run scripts/deploy.ts --network localhost  # Terminal 2: Deploy
```

### Contract Address
After deployment, the contract address is displayed and saved to `deployments/deployment-<chainId>.json`.

---

## Roles & Permissions

### Role Constants
```solidity
bytes32 ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 MANAGER_ROLE = keccak256("MANAGER_ROLE");
bytes32 AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
bytes32 MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 IDENTITY_VERIFIER_ROLE = keccak256("IDENTITY_VERIFIER_ROLE");
```

### Role Hierarchy
```
DEFAULT_ADMIN_ROLE (deployer)
    ├── ADMIN_ROLE
    ├── MINTER_ROLE
    ├── IDENTITY_VERIFIER_ROLE
    ├── MANAGER_ROLE
    └── AUDITOR_ROLE
```

### Role Capabilities

| Role | Functions |
|------|-----------|
| ADMIN | `createIdentity`, `assignRole`, `revokeRoleFromAccount`, `freezeAsset`, `unfreezeAsset`, `burnAsset`, `assignAsset`, `revokeAssignment`, `updateCustodian` |
| MANAGER | `assignAsset`, `revokeAssignment` |
| AUDITOR | `getAuditRecord`, `getAuditCount` |
| MINTER | `mintAsset` |
| IDENTITY_VERIFIER | `verifyIdentity` |
| USER | **No write functions** — can only view assigned assets |

---

## Data Structures

### Identity
```solidity
struct Identity {
    string did;                    // DID identifier
    address wallet;                // Wallet address
    bytes32 identityHash;          // Cryptographic hash
    bool verified;                 // Verification status
    uint256 createdAt;             // Creation timestamp
    uint256 verifiedAt;            // Verification timestamp
    string verificationTxHash;     // Verification transaction
}
```

### Asset — Assignment ≠ ERC-721 Ownership
```solidity
struct Asset {
    uint256 tokenId;               // ERC-721 token ID
    string assetId;                // Human-readable asset ID
    string name;                   // Asset name
    string description;            // Asset description
    string category;               // Asset category
    string metadataURI;            // IPFS/HTTPS metadata URI
    address creator;               // Minter address
    address assignedTo;            // **Assigned user (NOT ERC-721 owner)**
    uint256 createdAt;             // Mint timestamp
    uint8 status;                  // 0:Active, 1:Transferred/Reassigned, 2:Burned, 3:Frozen
    string mintTxHash;             // Mint transaction hash
    uint256 assignedAt;            // Assignment timestamp
    address assignedBy;            // Who assigned/reassigned
}
```

### AuditRecord
```solidity
struct AuditRecord {
    uint256 auditId;               // Sequential audit ID
    address actor;                 // Action performer
    string action;                 // Action type
    string resourceType;           // Resource type
    string resourceId;             // Resource identifier
    bytes32 role;                  // Actor's role
    string txHash;                 // Transaction hash
    uint256 blockNumber;           // Block number
    uint256 timestamp;             // Block timestamp
    bool verified;                 // Verification status
}
```

---

## Functions

### Identity Management

#### createIdentity
```solidity
function createIdentity(
    string calldata did,
    address wallet,
    bytes32 identityHash
) external onlyAdmin returns (bool)
```

**Description**: Creates a new decentralized identifier.

**Parameters:**
- `did`: DID string (format: `did:securechain:<identifier>`)
- `wallet`: Ethereum wallet address
- `identityHash`: SHA-256 hash of identity data

**Requirements:**
- Caller must have ADMIN_ROLE
- DID must not exist
- Wallet must not be zero address
- Identity hash must not be zero

**Events**: `IdentityCreated(did, wallet, identityHash, timestamp)`

#### verifyIdentity
```solidity
function verifyIdentity(string calldata did) external onlyIdentityVerifier returns (bool)
```

**Description**: Verifies an existing DID on-chain.

**Parameters:**
- `did`: DID to verify

**Requirements:**
- Caller must have IDENTITY_VERIFIER_ROLE
- DID must exist
- DID must not already be verified

**Events**: `IdentityVerified(did, verifier, timestamp)`

#### getIdentity
```solidity
function getIdentity(string calldata did) external view returns (Identity memory)
```

**Description**: Retrieves identity information.

**Returns**: Identity struct

#### getUserDIDs
```solidity
function getUserDIDs(address user) external view returns (string[] memory)
```

**Description**: Gets all DIDs associated with a wallet.

---

### Asset Management (ERC-721 with Non-Transferable Assignments)

#### mintAsset
```solidity
function mintAsset(
    string calldata assetId,
    string calldata name,
    string calldata description,
    string calldata category,
    string calldata metadataURI,
    address initialAssignee
) external onlyMinter returns (uint256)
```

**Description**: Mints a new ERC-721 asset. **Token is minted to custodian (contract), not the user.**

**Parameters:**
- `assetId`: Unique asset identifier
- `name`: Asset name
- `description`: Asset description
- `category`: Asset category
- `metadataURI`: IPFS/HTTPS URI for metadata
- `initialAssignee`: User to assign the asset to

**Returns**: `tokenId` of minted asset

**Requirements:**
- Caller must have MINTER_ROLE
- Asset ID must not be empty
- Name must not be empty
- Initial assignee must not be zero address

**Events**: `AssetMinted(tokenId, assetId, creator, assignedTo, name, timestamp)`

#### assignAsset — **Primary Assignment Function**
```solidity
function assignAsset(uint256 tokenId, address to) external onlyAuthorizedForAssignment(tokenId) returns (bool)
```

**Description**: Assigns/reassigns asset to a user. **Only ADMIN/MANAGER.** Does NOT transfer ERC-721 ownership.

**Parameters:**
- `tokenId`: Asset token ID
- `to`: User address to assign to

**Requirements:**
- Caller must have MANAGER_ROLE or ADMIN_ROLE
- Asset must exist
- Asset cannot be BURNED (2) or FROZEN (3)
- Recipient must not be zero address
- Cannot assign to self

**Events**: `AssetAssigned(tokenId, from, to, assignedBy, timestamp)`

#### revokeAssignment
```solidity
function revokeAssignment(uint256 tokenId) external onlyAuthorizedForAssignment(tokenId) returns (bool)
```

**Description**: Revokes assignment from current user. Asset becomes unassigned.

**Requirements:**
- Caller must have MANAGER_ROLE or ADMIN_ROLE
- Asset must exist
- Asset cannot be BURNED (2) or FROZEN (3)

**Events**: `AssetAssigned(tokenId, from, address(0), assignedBy, timestamp)`

#### burnAsset (Admin Only)
```solidity
function burnAsset(uint256 tokenId) external onlyAdmin returns (bool)
```

**Description**: Burns (destroys) an asset.

**Requirements:**
- Caller must have ADMIN_ROLE
- Asset must exist
- Asset must not already be burned

#### freezeAsset / unfreezeAsset (Admin Only)
```solidity
function freezeAsset(uint256 tokenId) external onlyAdmin returns (bool)
function unfreezeAsset(uint256 tokenId) external onlyAdmin returns (bool)
```

**Description**: Freezes/unfreezes asset assignments.

**Requirements:**
- Caller must have ADMIN_ROLE
- Asset must exist
- Freeze: Asset must not be frozen
- Unfreeze: Asset must be frozen

---

### Query Functions

#### getAsset
```solidity
function getAsset(uint256 tokenId) external view returns (Asset memory)
```

#### getUserAssignedAssets
```solidity
function getUserAssignedAssets(address user) external view returns (uint256[] memory)
```

#### getAssetAssignmentHistory
```solidity
function getAssetAssignmentHistory(uint256 tokenId) external view returns (address[] memory)
```

#### getCustodian
```solidity
function getCustodian() external view returns (address)
```

#### updateCustodian (Admin Only)
```solidity
function updateCustodian(address newCustodian) external onlyAdmin
```

---

### Role Management

#### assignRole
```solidity
function assignRole(address account, bytes32 role) external onlyAdmin returns (bool)
```

**Description**: Assigns a role to an account.

**Parameters:**
- `account`: Target address
- `role`: Role identifier (MANAGER_ROLE, AUDITOR_ROLE, MINTER_ROLE, IDENTITY_VERIFIER_ROLE)

**Requirements:**
- Caller must have ADMIN_ROLE
- Account must not be zero address
- Role must be valid (not ADMIN_ROLE)
- Account must not already have role

**Events**: `RoleAssigned(account, role, assigner, timestamp)`

#### revokeRoleFromAccount
```solidity
function revokeRoleFromAccount(address account, bytes32 role) external onlyAdmin returns (bool)
```

**Description**: Revokes a role from an account.

**Requirements:**
- Caller must have ADMIN_ROLE
- Account must have the role
- Cannot revoke ADMIN_ROLE

**Events**: `RoleRevokedCustom(account, role, revoker, timestamp)`

---

### Audit Trail

#### getAuditRecord
```solidity
function getAuditRecord(uint256 auditId) external view onlyAuditor returns (AuditRecord memory)
```

#### getAuditCount
```solidity
function getAuditCount() external view onlyAuditor returns (uint256)
```

---

## ERC-721 Overrides — CRITICAL SECURITY

### _transfer
```solidity
function _transfer(
    address from,
    address to,
    uint256 tokenId
) internal override
```

**Blocks all transfers except by:**
- Custodian (contract/admin)
- ADMIN_ROLE
- MANAGER_ROLE

Assigned users **cannot** transfer their assets via any ERC-721 method.

### approve
```solidity
function approve(address to, uint256 tokenId) public override
```

**Blocks approvals by assigned users.** Only custodian, ADMIN, or MANAGER can approve.

### setApprovalForAll
```solidity
function setApprovalForAll(address operator, bool approved) public override
```

**Blocks operator setting by assigned users.** Only custodian, ADMIN, or MANAGER can set operators.

### _mint / _burn
```solidity
function _mint(address to, uint256 tokenId) internal override
function _burn(uint256 tokenId) internal override
```

Track assignment state during mint/burn.

---

## Events

### IdentityCreated
```solidity
event IdentityCreated(
    string indexed did,
    address indexed wallet,
    bytes32 identityHash,
    uint256 timestamp
);
```

### IdentityVerified
```solidity
event IdentityVerified(
    string indexed did,
    address indexed verifier,
    uint256 timestamp
);
```

### AssetMinted
```solidity
event AssetMinted(
    uint256 indexed tokenId,
    string indexed assetId,
    address indexed creator,
    address assignedTo,
    string name,
    uint256 timestamp
);
```

### AssetAssigned
```solidity
event AssetAssigned(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    address assignedBy,
    uint256 timestamp
);
```

### RoleAssigned
```solidity
event RoleAssigned(
    address indexed account,
    bytes32 indexed role,
    address indexed assigner,
    uint256 timestamp
);
```

### RoleRevokedCustom
```solidity
event RoleRevokedCustom(
    address indexed account,
    bytes32 indexed role,
    address indexed revoker,
    uint256 timestamp
);
```

### AuditRecorded
```solidity
event AuditRecorded(
    uint256 indexed auditId,
    address indexed actor,
    string action,
    string resourceType,
    string resourceId,
    bytes32 role,
    uint256 blockNumber,
    uint256 timestamp
);
```

### SecurityAlert — **New: Security Event Logging**
```solidity
event SecurityAlert(
    uint256 indexed alertId,
    address indexed actor,
    string action,
    string resourceType,
    string resourceId,
    string reason,
    uint256 timestamp
);
```

### CustodianUpdated
```solidity
event CustodianUpdated(
    address indexed oldCustodian,
    address indexed newCustodian
);
```

---

## Error Messages

| Error | Cause |
|-------|-------|
| `NotAdmin` | Missing ADMIN_ROLE |
| `NotManager` | Missing MANAGER_ROLE |
| `NotAuditor` | Missing AUDITOR_ROLE |
| `NotMinter` | Missing MINTER_ROLE |
| `NotIdentityVerifier` | Missing IDENTITY_VERIFIER_ROLE |
| `NotAuthorized` | Not authorized for asset assignment |
| `TransferNotPermitted` | **User attempted ERC-721 transfer** |
| `ApprovalNotPermitted` | **User attempted approve()** |
| `OperatorNotPermitted` | **User attempted setApprovalForAll()** |
| `EmptyDID` | DID string empty |
| `ZeroAddress` | Zero address provided |
| `DIDAlreadyExists` | Duplicate DID |
| `DIDNotFound` | DID does not exist |
| `IdentityAlreadyVerified` | Double verification |
| `EmptyAssetId` | Asset ID empty |
| `EmptyName` | Name empty |
| `AssetNotFound` | Invalid tokenId |
| `AssetUnavailable` | Status != ACTIVE |
| `AssetBurned` | Asset is burned |
| `AssetFrozen` | Asset is frozen |
| `SelfTransfer` | Cannot assign to self |
| `AlreadyBurned` | Already burned |
| `AlreadyFrozen` | Already frozen |
| `NotFrozen` | Not frozen |
| `InvalidRole` | Invalid role |
| `RoleAlreadyAssigned` | Duplicate role |
| `RoleNotAssigned` | Role not present |
| `CannotRevokeAdmin` | Cannot revoke admin |

---

## Testing

### Run Tests
```bash
cd blockchain
npm test
```

### Test Coverage
```bash
npm run coverage
```

### Gas Report
```bash
REPORT_GAS=true npm test
```

### Key Security Test Cases (57 total)
- ✅ Identity creation and verification
- ✅ Asset minting with custodian ownership
- ✅ Asset assignment/reassignment by Manager/Admin
- ✅ **User CANNOT transferFrom()**
- ✅ **User CANNOT safeTransferFrom()**
- ✅ **User CANNOT approve()**
- ✅ **User CANNOT setApprovalForAll()**
- ✅ **User2 CANNOT transfer User1's asset**
- ✅ Unauthorized account CANNOT transfer
- ✅ Admin/Manager CAN assignAsset
- ✅ ERC-721 owner remains custodian
- ✅ SecurityAlert emitted on unauthorized attempts
- ✅ Role assignment and revocation
- ✅ Audit trail recording
- ✅ Asset lifecycle (burn, freeze, unfreeze)
- ✅ Assignment history tracking
- ✅ Custodian management

---

## Integration Guide

### Backend Integration (Web3.py)

```python
from web3 import Web3
from eth_account import Account

w3 = Web3(Web3.HTTPProvider("http://localhost:8545"))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
account = Account.from_key(PRIVATE_KEY)

# Create identity
tx = contract.functions.createIdentity(did, wallet, identity_hash).build_transaction({
    "from": account.address,
    "nonce": w3.eth.get_transaction_count(account.address),
    "gas": 300000,
    "gasPrice": w3.eth.gas_price,
})
signed = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)

# Mint asset (assigned to user, but ERC721 owned by custodian)
tx = contract.functions.mintAsset(
    asset_id, name, description, category, metadata_uri, initial_assignee
).build_transaction({...})

# Assign asset (Manager/Admin only)
tx = contract.functions.assignAsset(token_id, new_assignee).build_transaction({...})

# Get asset info
asset = contract.functions.getAsset(token_id).call()

# Get user's assigned assets
user_assets = contract.functions.getUserAssignedAssets(user_address).call()
```

### Frontend Integration (Ethers.js)

```javascript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Mint asset (requires minter)
const tx = await contract.mintAsset(assetId, name, description, category, metadataURI, initialAssignee);
const receipt = await tx.wait();
const tokenId = receipt.logs[0].args.tokenId;

// Assign asset (requires Manager/Admin)
const tx = await contract.assignAsset(tokenId, newAssignee);
await tx.wait();

// Read-only calls
const asset = await contract.getAsset(tokenId);
const identity = await contract.getIdentity(did);
const userAssets = await contract.getUserAssignedAssets(userAddress);
const assignmentHistory = await contract.getAssetAssignmentHistory(tokenId);
const custodian = await contract.getCustodian();
```

---

## Events Indexing

### TheGraph Subgraph (Recommended)

```graphql
type AssetMinted @entity {
  id: ID!
  tokenId: BigInt!
  assetId: String!
  creator: Bytes!
  assignedTo: Bytes!
  name: String!
  timestamp: BigInt!
}

type AssetAssigned @entity {
  id: ID!
  tokenId: BigInt!
  from: Bytes!
  to: Bytes!
  assignedBy: Bytes!
  timestamp: BigInt!
}

type SecurityAlert @entity {
  id: ID!
  alertId: BigInt!
  actor: Bytes!
  action: String!
  resourceType: String!
  resourceId: String!
  reason: String!
  timestamp: BigInt!
}
```

### Direct Event Filtering

```javascript
// Filter AssetMinted events
const filter = contract.filters.AssetMinted();
const events = await contract.queryFilter(filter, fromBlock, toBlock);

// Filter AssetAssigned for specific token
const filter = contract.filters.AssetAssigned(tokenId);
const events = await contract.queryFilter(filter, 0, 'latest');

// Filter SecurityAlert events
const filter = contract.filters.SecurityAlert();
const alerts = await contract.queryFilter(filter, 0, 'latest');
```

---

## Security Considerations

### Implemented Protections
- **AccessControl**: Role-based function restrictions
- **ERC-721 Override**: `_transfer`, `approve`, `setApprovalForAll` blocked for users
- **Custodian Model**: Contract retains ERC-721 ownership
- **Checks-Effects-Interactions**: State changes before external calls
- **Input Validation**: All parameters validated
- **Zero Address Checks**: Prevents zero address operations
- **SecurityAlert Events**: Every unauthorized attempt logged on-chain

### Attack Vectors Prevented
| Attack | Mitigation |
|--------|------------|
| User transfers assigned asset | `_transfer` override blocks |
| User approves spender | `approve` override blocks |
| User sets operator | `setApprovalForAll` override blocks |
| User transfers via proxy | `operator` check in `_transfer` |
| Front-running assignment | Checks-effects-interactions |
| Reentrancy | OpenZeppelin ERC721 (ReentrancyGuard not needed for view functions) |

### Audit Recommendations
- Formal verification for critical functions
- Bug bounty program for mainnet deployment
- Regular dependency updates (OpenZeppelin)
- Multi-signature for admin operations
- Time-locked role assignments

### Known Limitations
- String storage on-chain (gas costs)
- No batch operations
- Single admin for role management
- No upgradeability pattern (intentional for MVP)
- Contract size near EIP-170 limit (27KB) — mainnet deployment needs optimization

---

## Gas Estimates (Localhost)

| Function | Estimated Gas |
|----------|---------------|
| createIdentity | ~180,000 |
| verifyIdentity | ~120,000 |
| mintAsset | ~350,000 |
| assignAsset | ~150,000 |
| revokeAssignment | ~120,000 |
| assignRole | ~100,000 |
| revokeRoleFromAccount | ~80,000 |
| burnAsset | ~120,000 |
| freezeAsset | ~50,000 |

---

## Networks

### Localhost (Hardhat)
- **Chain ID**: 31337
- **RPC**: http://127.0.0.1:8545
- **Accounts**: 20 pre-funded accounts (10000 ETH each)

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: Configure via `SEPOLIA_RPC_URL`
- **Explorer**: https://sepolia.etherscan.io

### Mainnet (Not Recommended for MVP)
- Use audited contracts only
- Multi-signature admin
- Proper key management
- Contract optimization required (EIP-170 limit)