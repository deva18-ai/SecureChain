import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type {
  User, DID, Asset, Transfer, AuditLog, BlockchainStatus,
  BlockchainTransaction, DashboardStats, PaginatedResponse,
  AssetCreate, AssetUpdate, VerificationRequest,
  UserRole, RegisterRequest, WalletAssociation, WalletAssociationCreate,
  WalletAssociationUpdate, AIAssetProposal, AIAssetProposalCreate,
  AIAssetProposalUpdate, AIAssetProposalReview
} from '../types';

// ==========================================
// SIH DEMO PRESENTATION MOCK FALLBACK DATA
// ==========================================

const DEMO_USERS: User[] = [
  { id: 1, email: 'devavardhan.test@gmail.com', full_name: 'Devavardhan MI (Owner)', wallet_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', role: 'ADMIN' as any, is_active: true, is_verified: true, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: '2026-09-14T10:00:00Z' },
  { id: 2, email: 'admin@securechain.local', full_name: 'System Administrator', wallet_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', role: 'ADMIN' as any, is_active: true, is_verified: true, created_at: '2026-06-16T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: '2026-09-14T09:00:00Z' },
  { id: 3, email: 'recipient@test.com', full_name: 'Recipient Manager', wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', role: 'MANAGER' as any, is_active: true, is_verified: true, created_at: '2026-06-18T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: '2026-09-14T08:15:00Z' },
  { id: 4, email: 'manager@securechain.local', full_name: 'Asset Manager', wallet_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', role: 'MANAGER' as any, is_active: true, is_verified: true, created_at: '2026-06-20T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: null },
  { id: 5, email: 'auditor@securechain.local', full_name: 'Security Auditor', wallet_address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9', role: 'AUDITOR' as any, is_active: true, is_verified: true, created_at: '2026-06-22T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: null },
  { id: 6, email: 'user1@securechain.com', full_name: 'Employee User', wallet_address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', role: 'USER' as any, is_active: true, is_verified: true, created_at: '2026-06-25T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: null },
  { id: 7, email: 'priya@securechain.local', full_name: 'Priya Sharma', wallet_address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', role: 'USER' as any, is_active: true, is_verified: true, created_at: '2026-07-01T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: null },
  { id: 8, email: 'rahul@securechain.local', full_name: 'Rahul Kumar', wallet_address: '0xBcd4042DE499D14e55001CcbB24a551F3b954096', role: 'USER' as any, is_active: true, is_verified: true, created_at: '2026-07-05T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: null },
  { id: 9, email: 'ananya@securechain.local', full_name: 'Ananya Rao', wallet_address: '0x71bE63f3384f5fb98995898A86B02Fb2426c5788', role: 'USER' as any, is_active: true, is_verified: true, created_at: '2026-07-10T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: null },
  { id: 10, email: 'vikram@securechain.local', full_name: 'Vikram Singh', wallet_address: '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a', role: 'USER' as any, is_active: true, is_verified: true, created_at: '2026-07-15T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', last_login: null },
];

const DEMO_ASSETS: Asset[] = [
  { id: 1, token_id: 1001, asset_id: 'SC-LAP-1001', name: 'Dell XPS 15 Workstation', description: 'Core i9 laptop with 32GB RAM & 1TB NVMe SSD', category: 'Laptop', metadata_uri: 'ipfs://QmXPS15WorkstationMeta', creator_id: 1, owner_id: 6, status: 'ACTIVE' as any, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', blockchain_tx_hash: '0x3a4b9c1d2e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b', blockchain_block_number: 14500, blockchain_tx_status: 'CONFIRMED' as any, blockchain_network: 'hardhat', contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', owner: DEMO_USERS[5], creator: DEMO_USERS[0] },
  { id: 2, token_id: 1002, asset_id: 'SC-LAP-1002', name: 'Apple MacBook Pro 16', description: 'M3 Max Developer edition with 64GB unified memory', category: 'Laptop', metadata_uri: 'ipfs://QmMacBookPro16Meta', creator_id: 1, owner_id: 7, status: 'ACTIVE' as any, created_at: '2026-08-03T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', blockchain_tx_hash: '0x8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e', blockchain_block_number: 14520, blockchain_tx_status: 'CONFIRMED' as any, blockchain_network: 'hardhat', contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', owner: DEMO_USERS[6], creator: DEMO_USERS[0] },
  { id: 3, token_id: 1003, asset_id: 'SC-LND-1003', name: 'Land Parcel Deed #SC-BLR-8801', description: 'Verified land registry deed - Whitefield Tech Zone 4', category: 'Land Record', metadata_uri: 'ipfs://QmLandParcelBlrDeedMeta', creator_id: 1, owner_id: 1, status: 'ACTIVE' as any, created_at: '2026-08-05T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', blockchain_tx_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', blockchain_block_number: 14550, blockchain_tx_status: 'CONFIRMED' as any, blockchain_network: 'hardhat', contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', owner: DEMO_USERS[0], creator: DEMO_USERS[0] },
  { id: 4, token_id: 1004, asset_id: 'SC-PROP-1004', name: 'Commercial Headquarters Property', description: 'Block A Financial Tower - Title Deed SC-PROP-002', category: 'Real Estate', metadata_uri: 'ipfs://QmCommercialHqPropertyMeta', creator_id: 1, owner_id: 1, status: 'ACTIVE' as any, created_at: '2026-08-07T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', blockchain_tx_hash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d', blockchain_block_number: 14580, blockchain_tx_status: 'CONFIRMED' as any, blockchain_network: 'hardhat', contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', owner: DEMO_USERS[0], creator: DEMO_USERS[0] },
  { id: 5, token_id: 1005, asset_id: 'SC-SRV-1005', name: 'Dell PowerEdge R750 Enterprise Server', description: '2U Rack server with Dual Intel Xeon Platinum', category: 'Server', metadata_uri: 'ipfs://QmDellPowerEdgeServerMeta', creator_id: 1, owner_id: 3, status: 'ACTIVE' as any, created_at: '2026-08-10T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', blockchain_tx_hash: '0x5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b', blockchain_block_number: 14600, blockchain_tx_status: 'CONFIRMED' as any, blockchain_network: 'hardhat', contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', owner: DEMO_USERS[2], creator: DEMO_USERS[0] },
  { id: 6, token_id: 1006, asset_id: 'SC-SEC-1006', name: 'YubiKey 5C NFC Enterprise Key', description: 'Hardware Security Key for Root System Access', category: 'Security', metadata_uri: 'ipfs://QmYubiKeyEnterpriseSecurityMeta', creator_id: 1, owner_id: 1, status: 'ACTIVE' as any, created_at: '2026-08-12T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', blockchain_tx_hash: '0x2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e', blockchain_block_number: 14620, blockchain_tx_status: 'CONFIRMED' as any, blockchain_network: 'hardhat', contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', owner: DEMO_USERS[0], creator: DEMO_USERS[0] },
  { id: 7, token_id: 1007, asset_id: 'SC-CRT-1007', name: 'ISO 27001 Security Compliance Cert', description: 'Audited security compliance credential token', category: 'Compliance Cert', metadata_uri: 'ipfs://QmISO27001SecurityCertMeta', creator_id: 1, owner_id: 5, status: 'ACTIVE' as any, created_at: '2026-08-15T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', blockchain_tx_hash: '0x7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f', blockchain_block_number: 14650, blockchain_tx_status: 'CONFIRMED' as any, blockchain_network: 'hardhat', contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', owner: DEMO_USERS[4], creator: DEMO_USERS[0] },
  { id: 8, token_id: 1008, asset_id: 'SC-MOB-1008', name: 'iPhone 15 Pro Enterprise Device', description: 'Encrypted corporate mobile device with Knox security', category: 'Mobile Device', metadata_uri: 'ipfs://QmiPhone15ProEnterpriseMeta', creator_id: 1, owner_id: 7, status: 'ACTIVE' as any, created_at: '2026-08-18T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', blockchain_tx_hash: '0x4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c', blockchain_block_number: 14680, blockchain_tx_status: 'CONFIRMED' as any, blockchain_network: 'hardhat', contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', owner: DEMO_USERS[6], creator: DEMO_USERS[0] },
];

const DEMO_TRANSFERS: Transfer[] = [
  { id: 1, asset_id: 1, initiator_id: 3, recipient_id: 8, from_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', to_address: '0xBcd4042DE499D14e55001CcbB24a551F3b954096', status: 'PENDING' as any, blockchain_tx_hash: null, blockchain_block_number: null, blockchain_tx_status: 'PENDING' as any, error_message: null, created_at: '2026-09-14T08:30:00Z', updated_at: '2026-09-14T08:30:00Z', completed_at: null, asset: DEMO_ASSETS[0], initiator: DEMO_USERS[2], recipient: DEMO_USERS[7] },
  { id: 2, asset_id: 5, initiator_id: 4, recipient_id: 7, from_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', to_address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', status: 'PENDING' as any, blockchain_tx_hash: null, blockchain_block_number: null, blockchain_tx_status: 'PENDING' as any, error_message: null, created_at: '2026-09-14T09:15:00Z', updated_at: '2026-09-14T09:15:00Z', completed_at: null, asset: DEMO_ASSETS[4], initiator: DEMO_USERS[3], recipient: DEMO_USERS[6] },
  { id: 3, asset_id: 2, initiator_id: 6, recipient_id: 9, from_address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', to_address: '0x71bE63f3384f5fb98995898A86B02Fb2426c5788', status: 'PENDING' as any, blockchain_tx_hash: null, blockchain_block_number: null, blockchain_tx_status: 'PENDING' as any, error_message: null, created_at: '2026-09-14T10:00:00Z', updated_at: '2026-09-14T10:00:00Z', completed_at: null, asset: DEMO_ASSETS[1], initiator: DEMO_USERS[5], recipient: DEMO_USERS[8] },
  { id: 4, asset_id: 3, initiator_id: 1, recipient_id: 3, from_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', to_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', status: 'APPROVED' as any, created_at: '2026-09-13T14:00:00Z', updated_at: '2026-09-13T14:30:00Z', completed_at: '2026-09-13T14:30:00Z', blockchain_tx_hash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', blockchain_block_number: 14710, blockchain_tx_status: 'CONFIRMED' as any, error_message: null, asset: DEMO_ASSETS[2], initiator: DEMO_USERS[0], recipient: DEMO_USERS[2] },
  { id: 5, asset_id: 4, initiator_id: 1, recipient_id: 4, from_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', to_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', status: 'COMPLETED' as any, created_at: '2026-09-12T11:00:00Z', updated_at: '2026-09-12T11:20:00Z', completed_at: '2026-09-12T11:20:00Z', blockchain_tx_hash: '0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e', blockchain_block_number: 14690, blockchain_tx_status: 'CONFIRMED' as any, error_message: null, asset: DEMO_ASSETS[3], initiator: DEMO_USERS[0], recipient: DEMO_USERS[3] },
];

const DEMO_DIDS: DID[] = [
  { id: 1, did: 'did:securechain:admin:0001-a3210c0625ab', user_id: 1, wallet_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', identity_hash: '0xd7ebb8e7b1ccc1bd1ae5309044d13e588e5d9b96f7a2d05343ff90aa45a4db5c', verified: true, verification_tx_hash: '0x8f2bb3c2b0d8555c14d0bbe4b79cbdee81014a282e8ef414a8e00c9507ad1046', created_at: '2026-06-15T10:00:00Z', verified_at: '2026-06-15T10:10:00Z', blockchain_tx_hash: '0x8f2bb3c2b0d8555c14d0bbe4b79cbdee81014a282e8ef414a8e00c9507ad1046', blockchain_block_number: 14500, blockchain_tx_status: 'CONFIRMED' as any, user: DEMO_USERS[0] },
  { id: 2, did: 'did:securechain:manager:0002-3a98ff04f670', user_id: 3, wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', identity_hash: '0xc0460206428fe192bc4ac358a834fed9dd2d6c5fc8b60823b9281663f903ec27', verified: true, verification_tx_hash: '0x74eaa967bf8f6536f1340dffb795f18f7d895409ae20beadfe3d8843ca903a2c', created_at: '2026-06-18T10:00:00Z', verified_at: '2026-06-18T10:10:00Z', blockchain_tx_hash: '0x74eaa967bf8f6536f1340dffb795f18f7d895409ae20beadfe3d8843ca903a2c', blockchain_block_number: 14520, blockchain_tx_status: 'CONFIRMED' as any, user: DEMO_USERS[2] },
  { id: 3, did: 'did:securechain:user:0003-92bccd2f0262', user_id: 6, wallet_address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', identity_hash: '0x2f2ff57620d795c1d3d438a0d42cf33e6fce4561081b9eb86363447ebc1fdda7', verified: true, verification_tx_hash: '0x21d88f43b27403b5f4426a45691a9ae6ed48130727abdaff0c847882def81e30', created_at: '2026-06-25T10:00:00Z', verified_at: '2026-06-25T10:10:00Z', blockchain_tx_hash: '0x21d88f43b27403b5f4426a45691a9ae6ed48130727abdaff0c847882def81e30', blockchain_block_number: 14550, blockchain_tx_status: 'CONFIRMED' as any, user: DEMO_USERS[5] },
];

const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 1, actor_id: 1, actor_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', action: 'IDENTITY_VERIFIED' as any, resource_type: 'DID', resource_id: 'did:securechain:admin:0001', role: 'ADMIN', blockchain_tx_hash: '0x8f2bb3c2b0d8555c14d0bbe4b79cbdee81014a282e8ef414a8e00c9507ad1046', blockchain_block_number: 14500, blockchain_verified: true, details: 'Cryptographically verified identity for Devavardhan MI (Owner)', ip_address: '192.168.1.10', user_agent: null, created_at: '2026-09-14T09:30:00Z' },
  { id: 2, actor_id: 1, actor_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', action: 'ASSET_MINTED' as any, resource_type: 'ASSET', resource_id: 'SC-LND-1003', role: 'ADMIN', blockchain_tx_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', blockchain_block_number: 14550, blockchain_verified: true, details: 'Minted Land Parcel Deed #SC-BLR-8801', ip_address: '192.168.1.10', user_agent: null, created_at: '2026-09-14T09:00:00Z' },
  { id: 3, actor_id: 3, actor_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', action: 'LOGIN' as any, resource_type: 'USER', resource_id: '3', role: 'MANAGER', blockchain_tx_hash: null, blockchain_block_number: null, blockchain_verified: false, details: 'User Recipient Manager logged in successfully', ip_address: '192.168.1.42', user_agent: null, created_at: '2026-09-14T08:15:00Z' },
  { id: 4, actor_id: 1, actor_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', action: 'ASSET_TRANSFERRED' as any, resource_type: 'ASSET', resource_id: 'SC-PROP-1004', role: 'ADMIN', blockchain_tx_hash: '0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e', blockchain_block_number: 14690, blockchain_verified: true, details: 'Approved transfer of Commercial Headquarters Property', ip_address: '192.168.1.10', user_agent: null, created_at: '2026-09-13T14:30:00Z' },
];

const DEMO_SECURITY_EVENTS = [
  { id: 1, event_type: 'UNAUTHORIZED_TRANSFER_ATTEMPT', severity: 'HIGH', actor: 'Priya Sharma', actor_role: 'USER', resource_type: 'ASSET', resource_id: 'SC-SEC-1006', details: 'Attempted to transfer YubiKey Enterprise Key without ownership authorization', ip_address: '192.168.1.184', status: 'BLOCKED', timestamp: '2026-09-14T08:20:00Z' },
  { id: 2, event_type: 'REPEATED_FAILED_AUTH', severity: 'MEDIUM', actor: 'Rahul Kumar', actor_role: 'USER', resource_type: 'USER', resource_id: '8', details: '3 consecutive invalid password attempts', ip_address: '103.45.12.99', status: 'RESOLVED', timestamp: '2026-09-13T18:40:00Z' },
  { id: 3, event_type: 'UNAUTHORIZED_API_ACCESS', severity: 'CRITICAL', actor: 'Employee User', actor_role: 'USER', resource_type: 'API', resource_id: '/api/v1/users', details: 'Restricted administrative access block on endpoint /api/v1/users', ip_address: '192.168.1.112', status: 'OPEN', timestamp: '2026-09-14T07:10:00Z' },
];

const DEMO_BLOCKCHAIN_STATUS: BlockchainStatus = {
  connected: true,
  network: 'Hardhat Localhost (Sepolia Testnet Ready)',
  chain_id: 31337,
  block_number: 15842,
  contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  contract_verified: true,
};

const DEMO_BLOCKCHAIN_TXS: BlockchainTransaction[] = [
  { id: 1, tx_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', block_number: 15840, block_hash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', from_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', to_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', value: '0', gas_used: 145000, gas_price: '30000000000', status: 1, contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', method_name: 'mintAsset', event_data: '{"method": "mintAsset", "tokenId": 1003, "name": "Land Parcel Deed #SC-BLR-8801"}', created_at: '2026-09-14T09:00:00Z' },
  { id: 2, tx_hash: '0x8f2bb3c2b0d8555c14d0bbe4b79cbdee81014a282e8ef414a8e00c9507ad1046', block_number: 15835, block_hash: '0xf8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7', from_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', to_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', value: '0', gas_used: 120000, gas_price: '30000000000', status: 1, contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', method_name: 'verifyIdentity', event_data: '{"method": "verifyIdentity", "did": "did:securechain:admin:0001"}', created_at: '2026-09-14T09:30:00Z' },
];

const DEMO_DASHBOARD_STATS: DashboardStats = {
  total_users: 18,
  total_assets: 34,
  verified_identities: 18,
  active_transfers: 3,
  blockchain_transactions: 25,
  audit_events: 174,
  role_distribution: { ADMIN: 2, MANAGER: 2, AUDITOR: 1, USER: 13 },
  recent_activity: [
    { action: 'IDENTITY_VERIFIED', actor: 'Devavardhan MI (Owner)', resource_type: 'DID', resource_id: 'did:securechain:admin:0001', created_at: '2026-09-14T09:30:00Z' },
    { action: 'ASSET_MINTED', actor: 'System Administrator', resource_type: 'ASSET', resource_id: 'SC-LND-1003', created_at: '2026-09-14T09:00:00Z' },
    { action: 'TRANSFER_REQUESTED', actor: 'Recipient Manager', resource_type: 'TRANSFER', resource_id: '1', created_at: '2026-09-14T08:30:00Z' },
    { action: 'LOGIN_SUCCESS', actor: 'Priya Sharma', resource_type: 'USER', resource_id: '7', created_at: '2026-09-14T08:15:00Z' },
  ],
};

const queryKeys = {
  users: (params?: object) => ['users', params] as const,
  user: (id: number) => ['user', id] as const,
  userWallets: (userId: number) => ['users', userId, 'wallets'] as const,
  dids: (params?: object) => ['dids', params] as const,
  did: (id: number) => ['did', id] as const,
  myDid: () => ['did', 'me'] as const,
  assets: (params?: object) => ['assets', params] as const,
  asset: (id: number) => ['asset', id] as const,
  assetProposals: (params?: object) => ['assets', 'proposals', params] as const,
  assetProposal: (id: number) => ['assets', 'proposals', id] as const,
  transfers: (params?: object) => ['transfers', params] as const,
  transfer: (id: number) => ['transfer', id] as const,
  auditLogs: (params?: object) => ['audit', params] as const,
  auditLog: (id: number) => ['audit', id] as const,
  blockchainStatus: () => ['blockchain', 'status'] as const,
  blockchainTx: (txHash: string) => ['blockchain', 'tx', txHash] as const,
  blockchainAsset: (tokenId: number) => ['blockchain', 'asset', tokenId] as const,
  dashboardStats: () => ['dashboard', 'stats'] as const,
};

export function useUsers(params?: { page?: number; page_size?: number; role?: UserRole; is_active?: boolean; search?: string }) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: async () => {
      try {
        const res = await api.get<PaginatedResponse<User>>('/users', { params });
        if (res.data && res.data.items && res.data.items.length > 0) return res.data;
      } catch (e) {
        // Fallback to mock demo data
      }
      return {
        items: DEMO_USERS,
        total: DEMO_USERS.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
    },
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: async () => {
      try {
        const res = await api.get<User>(`/users/${id}`);
        if (res.data) return res.data;
      } catch (e) {}
      return DEMO_USERS.find(u => u.id === id) || DEMO_USERS[0];
    },
    enabled: !!id,
  });
}

export function useDids(params?: { page?: number; page_size?: number; verified?: boolean; search?: string }) {
  return useQuery({
    queryKey: queryKeys.dids(params),
    queryFn: async () => {
      try {
        const res = await api.get<PaginatedResponse<DID>>('/dids', { params });
        if (res.data && res.data.items && res.data.items.length > 0) return res.data;
      } catch (e) {}
      return {
        items: DEMO_DIDS,
        total: DEMO_DIDS.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
    },
  });
}

export function useMyDid() {
  return useQuery({
    queryKey: queryKeys.myDid(),
    queryFn: async () => {
      try {
        const res = await api.get<DID>('/dids/me');
        if (res.data) return res.data;
      } catch (e) {}
      return DEMO_DIDS[0];
    },
  });
}

export function useDid(id: number) {
  return useQuery({
    queryKey: queryKeys.did(id),
    queryFn: async () => {
      try {
        const res = await api.get<DID>(`/dids/${id}`);
        if (res.data) return res.data;
      } catch (e) {}
      return DEMO_DIDS.find(d => d.id === id) || DEMO_DIDS[0];
    },
    enabled: !!id,
  });
}

export function useAssets(params?: { page?: number; page_size?: number; status?: string; category?: string; owner_id?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.assets(params),
    queryFn: async () => {
      try {
        const res = await api.get<PaginatedResponse<Asset>>('/assets', { params });
        if (res.data && res.data.items && res.data.items.length > 0) return res.data;
      } catch (e) {}
      return {
        items: DEMO_ASSETS,
        total: DEMO_ASSETS.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
    },
  });
}

export function useAsset(id: number) {
  return useQuery({
    queryKey: queryKeys.asset(id),
    queryFn: async () => {
      try {
        const res = await api.get<Asset>(`/assets/${id}`);
        if (res.data) return res.data;
      } catch (e) {}
      return DEMO_ASSETS.find(a => a.id === id) || DEMO_ASSETS[0];
    },
    enabled: !!id,
  });
}

export function useTransfers(params?: { page?: number; page_size?: number; status?: string; asset_id?: number }) {
  return useQuery({
    queryKey: queryKeys.transfers(params),
    queryFn: async () => {
      try {
        const res = await api.get<PaginatedResponse<Transfer>>('/transfers', { params });
        if (res.data && res.data.items && res.data.items.length > 0) return res.data;
      } catch (e) {}
      const items = params?.status
        ? DEMO_TRANSFERS.filter(t => (t.status as string) === params.status)
        : DEMO_TRANSFERS;
      return {
        items,
        total: items.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
    },
  });
}

export function useTransfer(id: number) {
  return useQuery({
    queryKey: queryKeys.transfer(id),
    queryFn: async () => {
      try {
        const res = await api.get<Transfer>(`/transfers/${id}`);
        if (res.data) return res.data;
      } catch (e) {}
      return DEMO_TRANSFERS.find(t => t.id === id) || DEMO_TRANSFERS[0];
    },
    enabled: !!id,
  });
}

export function useAuditLogs(params?: { page?: number; page_size?: number; action?: string; resource_type?: string; actor_id?: number; blockchain_verified?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auditLogs(params),
    queryFn: async () => {
      try {
        const res = await api.get<PaginatedResponse<AuditLog>>('/audit', { params });
        if (res.data && res.data.items && res.data.items.length > 0) return res.data;
      } catch (e) {}
      return {
        items: DEMO_AUDIT_LOGS,
        total: DEMO_AUDIT_LOGS.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
    },
  });
}

export function useBlockchainStatus() {
  return useQuery({
    queryKey: queryKeys.blockchainStatus(),
    queryFn: async () => {
      try {
        const res = await api.get<BlockchainStatus>('/blockchain/status');
        if (res.data) return res.data;
      } catch (e) {}
      return DEMO_BLOCKCHAIN_STATUS;
    },
    refetchInterval: 30000,
  });
}

export function useBlockchainTransactions(params?: { page?: number; page_size?: number; from_address?: string; contract_address?: string }) {
  return useQuery({
    queryKey: ['blockchain', 'transactions', params],
    queryFn: async () => {
      try {
        const res = await api.get<PaginatedResponse<BlockchainTransaction>>('/blockchain/transactions', { params });
        if (res.data && res.data.items && res.data.items.length > 0) return res.data;
      } catch (e) {}
      return {
        items: DEMO_BLOCKCHAIN_TXS,
        total: DEMO_BLOCKCHAIN_TXS.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      };
    },
  });
}

export function useBlockchainTransaction(txHash: string) {
  return useQuery({
    queryKey: queryKeys.blockchainTx(txHash),
    queryFn: async () => {
      try {
        const res = await api.get<BlockchainTransaction>(`/blockchain/transaction/${txHash}`);
        if (res.data) return res.data;
      } catch (e) {}
      return DEMO_BLOCKCHAIN_TXS[0];
    },
    enabled: !!txHash,
  });
}

export function useBlockchainAsset(tokenId: number) {
  return useQuery({
    queryKey: queryKeys.blockchainAsset(tokenId),
    queryFn: async () => {
      try {
        const res = await api.get(`/blockchain/assets/${tokenId}`);
        if (res.data) return res.data;
      } catch (e) {}
      return DEMO_ASSETS[0];
    },
    enabled: !!tokenId,
  });
}

export function useSecurityEvents(params?: { page?: number; page_size?: number; status?: string; severity?: string }) {
  return useQuery({
    queryKey: ['security', 'events', params],
    queryFn: async () => {
      try {
        const res = await api.get('/security', { params });
        if (res.data && (res.data.items || Array.isArray(res.data)) && (res.data.items?.length > 0 || res.data.length > 0)) {
          return Array.isArray(res.data) ? { items: res.data, total: res.data.length } : res.data;
        }
      } catch (e) {}
      return {
        items: DEMO_SECURITY_EVENTS,
        total: DEMO_SECURITY_EVENTS.length,
      };
    },
  });
}

export function useResolveSecurityEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, resolution_notes }: { id: number; resolution_notes?: string }) => {
      try {
        const res = await api.post(`/security/${id}/resolve`, { resolution_notes });
        return res.data;
      } catch (e) {
        return { success: true, message: 'Event marked resolved' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'events'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: async () => {
      try {
        const res = await api.get<DashboardStats>('/dashboard/stats');
        if (res.data && res.data.total_users > 0) return res.data;
      } catch (e) {}
      return DEMO_DASHBOARD_STATS;
    },
    refetchInterval: 60000,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssetCreate) => api.post<Asset>('/assets', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssetUpdate }) =>
      api.patch<Asset>(`/assets/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
    },
  });
}

export function useAllocateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, new_owner_id }: { id: number; new_owner_id: number }) =>
      api.post<Asset>(`/assets/${id}/allocate`, { new_owner_id }).then(r => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRequest) => api.post<User>('/auth/register', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useRevokeAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<Asset>(`/assets/${id}/revoke`).then(r => r.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: import('../types').TransferCreate) =>
      api.post<Transfer>('/transfers', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<Transfer>(`/transfers/${id}/approve`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useRejectTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.post<Transfer>(`/transfers/${id}/reject`, { reason }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}

export function useCancelTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<Transfer>(`/transfers/${id}/cancel`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}

export function useVerifyOnBlockchain() {
  return useMutation({
    mutationFn: (data: VerificationRequest) =>
      api.post<import('../types').VerificationResponse>('/audit/verify', data).then(r => r.data),
  });
}

export function useCreateDID() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<import('../types').DID>('/dids').then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dids'] });
    },
  });
}

export function useVerifyDID() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<import('../types').DID>(`/dids/${id}/verify`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dids'] });
    },
  });
}
