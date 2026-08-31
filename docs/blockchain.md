# SecureChain Blockchain Documentation

## Smart Contract: SecureChain.sol

### Overview
The SecureChain smart contract implements a comprehensive platform for decentralized identity management, ERC-721 NFT asset ownership, role-based access control, and immutable audit trails. Built on OpenZeppelin contracts for security and standards compliance.

### Contract Details
- **Name**: SecureChain Asset
- **Symbol**: SCA
- **Standard**: ERC-721, ERC-721URIStorage
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
| ADMIN | `createIdentity`, `assignRole`, `revokeRole`, `freezeAsset`, `unfreezeAsset` |
| MANAGER | `allocateAsset` |
| AUDITOR | `getAuditRecord`, `getAuditCount` |
| MINTER | `mintAsset` |
| IDENTITY_VERIFIER | `verifyIdentity` |
| OWNER | `transferAsset` (own assets), `burnAsset` (own assets) |

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

### Asset
```solidity
struct Asset {
    uint256 tokenId;               // ERC-721 token ID
    string assetId;                // Human-readable asset ID
    string name;                   // Asset name
    string description;            // Asset description
    string category;               // Asset category
    string metadataURI;            // IPFS/HTTPS metadata URI
    address creator;               // Minter address
    address currentOwner;          // Current owner
    uint256 createdAt;             // Mint timestamp
    uint8 status;                  // 0:Active, 1:Transferred, 2:Burned, 3:Frozen
    string mintTxHash;             // Mint transaction hash
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

### Asset Management (ERC-721)

#### mintAsset
```solidity
function mintAsset(
    string calldata assetId,
    string calldata name,
    string calldata description,
    string calldata category,
    string calldata metadataURI,
    address initialOwner
) external onlyMinter returns (uint256)
```

**Description**: Mints a new ERC-721 asset.

**Parameters:**
- `assetId`: Unique asset identifier
- `name`: Asset name
- `description`: Asset description
- `category`: Asset category
- `metadataURI`: IPFS/HTTPS URI for metadata
- `initialOwner`: Initial owner address

**Returns**: `tokenId` of minted asset

**Requirements:**
- Caller must have MINTER_ROLE
- Asset ID must not be empty
- Name must not be empty
- Initial owner must not be zero address

**Events**: `AssetMinted(tokenId, assetId, creator, owner, name, timestamp)`

#### allocateAsset
```solidity
function allocateAsset(uint256 tokenId, address to) external onlyManager returns (bool)
```

**Description**: Allocates/transfers asset to new owner (Manager only).

**Parameters:**
- `tokenId`: Asset token ID
- `to`: Recipient address

**Requirements:**
- Caller must have MANAGER_ROLE
- Asset must exist
- Asset status must be ACTIVE (0)
- Recipient must not be zero address

**Events**: `AssetAllocated(tokenId, from, to, timestamp)`

#### transferAsset
```solidity
function transferAsset(uint256 tokenId, address to) external onlyAuthorizedForAsset(tokenId) returns (bool)
```

**Description**: Transfers asset ownership (Owner/Admin/Manager).

**Parameters:**
- `tokenId`: Asset token ID
- `to`: Recipient address

**Requirements:**
- Caller must be owner, Manager, or Admin
- Asset must exist
- Asset cannot be BURNED (2) or FROZEN (3)
- Cannot transfer to self

**Events**: `AssetTransferred(tokenId, from, to, timestamp)`

#### burnAsset
```solidity
function burnAsset(uint256 tokenId) external onlyAuthorizedForAsset(tokenId) returns (bool)
```

**Description**: Burns (destroys) an asset.

**Requirements:**
- Caller must be owner, Admin, or Manager
- Asset must exist
- Asset must not already be burned

#### freezeAsset / unfreezeAsset (Admin Only)
```solidity
function freezeAsset(uint256 tokenId) external onlyAdmin returns (bool)
function unfreezeAsset(uint256 tokenId) external onlyAdmin returns (bool)
```

**Description**: Freezes/unfreezes asset transfers.

**Requirements:**
- Caller must have ADMIN_ROLE
- Asset must exist
- Freeze: Asset must not be frozen
- Unfreeze: Asset must be frozen

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

#### revokeRole
```solidity
function revokeRole(address account, bytes32 role) external onlyAdmin returns (bool)
```

**Description**: Revokes a role from an account.

**Requirements:**
- Caller must have ADMIN_ROLE
- Account must have the role
- Cannot revoke ADMIN_ROLE

**Events**: `RoleRevoked(account, role, revoker, timestamp)`

---

### Query Functions

#### getAsset
```solidity
function getAsset(uint256 tokenId) external view returns (Asset memory)
```

#### getUserAssets
```solidity
function getUserAssets(address user) external view returns (uint256[] memory)
```

#### getAssetTransferHistory
```solidity
function getAssetTransferHistory(uint256 tokenId) external view returns (address[] memory)
```

#### getAssetsByCategory
```solidity
function getAssetsByCategory(string calldata category) external view returns (uint256[] memory)
```

#### getAuditRecord
```solidity
function getAuditRecord(uint256 auditId) external view onlyAuditor returns (AuditRecord memory)
```

#### getAuditCount
```solidity
function getAuditCount() external view onlyAuditor returns (uint256)
```

---

## Events

### IdentityCreated
```solidity
event IdentityCreated(
    string indexed did,
    address indexed wallet,
    bytes32 identityHash,
    uint256 timestamp,
    string txHash
);
```

### IdentityVerified
```solidity
event IdentityVerified(
    string indexed did,
    address indexed verifier,
    uint256 timestamp,
    string txHash
);
```

### AssetMinted
```solidity
event AssetMinted(
    uint256 indexed tokenId,
    string indexed assetId,
    address indexed creator,
    address indexed owner,
    string name,
    uint256 timestamp,
    string txHash
);
```

### AssetAllocated
```solidity
event AssetAllocated(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    uint256 timestamp,
    string txHash
);
```

### AssetTransferred
```solidity
event AssetTransferred(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    uint256 timestamp,
    string txHash
);
```

### RoleAssigned
```solidity
event RoleAssigned(
    address indexed account,
    bytes32 indexed role,
    address indexed assigner,
    uint256 timestamp,
    string txHash
);
```

### RoleRevoked
```solidity
event RoleRevoked(
    address indexed account,
    bytes32 indexed role,
    address indexed revoker,
    uint256 timestamp,
    string txHash
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
    string txHash,
    uint256 blockNumber,
    uint256 timestamp
);
```

---

## Error Messages

| Error | Cause |
|-------|-------|
| `SecureChain: caller is not admin` | Missing ADMIN_ROLE |
| `SecureChain: caller is not manager` | Missing MANAGER_ROLE |
| `SecureChain: caller is not auditor` | Missing AUDITOR_ROLE |
| `SecureChain: caller is not minter` | Missing MINTER_ROLE |
| `SecureChain: caller is not identity verifier` | Missing IDENTITY_VERIFIER_ROLE |
| `SecureChain: not authorized for this asset` | Not owner/manager/admin |
| `SecureChain: DID already exists` | Duplicate DID creation |
| `SecureChain: DID does not exist` | DID not found |
| `SecureChain: identity already verified` | Double verification |
| `SecureChain: asset does not exist` | Invalid tokenId |
| `SecureChain: asset not available for allocation` | Status != ACTIVE |
| `SecureChain: cannot transfer to self` | from == to |
| `SecureChain: asset is burned` | Status == 2 |
| `SecureChain: asset is frozen` | Status == 3 |
| `SecureChain: invalid role` | Role not in allowed list |
| `SecureChain: account already has role` | Duplicate role assignment |
| `SecureChain: account does not have role` | Revoking non-existent role |
| `SecureChain: cannot revoke admin role` | Attempting to revoke ADMIN_ROLE |

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

### Key Test Cases
- Identity creation and verification
- Asset minting, allocation, transfer
- Role assignment and revocation
- Unauthorized access prevention
- Audit trail recording
- Asset lifecycle (burn, freeze)
- Transfer history tracking

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

# Mint asset
tx = contract.functions.mintAsset(
    asset_id, name, description, category, metadata_uri, owner
).build_transaction({...})

# Get asset
asset = contract.functions.getAsset(token_id).call()
```

### Frontend Integration (Ethers.js)

```javascript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Create identity (requires admin)
const tx = await contract.createIdentity(did, wallet, identityHash);
const receipt = await tx.wait();

// Mint asset (requires minter)
const tx = await contract.mintAsset(assetId, name, description, category, metadataURI, owner);
const receipt = await tx.wait();
const tokenId = receipt.logs[0].args.tokenId;

// Transfer asset
const tx = await contract.transferAsset(tokenId, toAddress);
await tx.wait();

// Read-only calls
const asset = await contract.getAsset(tokenId);
const identity = await contract.getIdentity(did);
const userAssets = await contract.getUserAssets(userAddress);
```

---

## Events Indexing

### TheGraph Subgraph (Recommended)
```graphql
type IdentityCreated @entity {
  id: ID!
  did: String!
  wallet: Bytes!
  identityHash: Bytes!
  timestamp: BigInt!
  txHash: String!
}

type AssetMinted @entity {
  id: ID!
  tokenId: BigInt!
  assetId: String!
  creator: Bytes!
  owner: Bytes!
  name: String!
  timestamp: BigInt!
  txHash: String!
}
```

### Direct Event Filtering
```javascript
// Filter IdentityCreated events
const filter = contract.filters.IdentityCreated();
const events = await contract.queryFilter(filter, fromBlock, toBlock);

// Filter AssetMinted for specific token
const filter = contract.filters.AssetMinted(tokenId);
const events = await contract.queryFilter(filter, 0, 'latest');
```

---

## Security Considerations

### Implemented Protections
- **AccessControl**: Role-based function restrictions
- **ReentrancyGuard**: Inherited from ERC721 (OpenZeppelin)
- **Checks-Effects-Interactions**: State changes before external calls
- **Input Validation**: All parameters validated
- **Zero Address Checks**: Prevents zero address operations
- **Ownership Verification**: `onlyAuthorizedForAsset` modifier

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

---

## Gas Estimates (Localhost)

| Function | Estimated Gas |
|----------|---------------|
| createIdentity | ~180,000 |
| verifyIdentity | ~120,000 |
| mintAsset | ~350,000 |
| allocateAsset | ~150,000 |
| transferAsset | ~140,000 |
| assignRole | ~100,000 |
| revokeRole | ~80,000 |
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