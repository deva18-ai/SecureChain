export type UserRole = 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'USER';
export type WalletType = 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'USER';

export type BlockchainTxStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface User {
  id: number;
  email: string;
  full_name: string;
  wallet_address: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  did?: string;
  dids_count?: number;
  assets_count?: number;
  transfers_count?: number;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  wallet_address?: string;
  role?: UserRole;
}

export interface DID {
  id: number;
  did: string;
  user_id: number;
  wallet_address: string;
  identity_hash: string;
  verified: boolean;
  verification_tx_hash: string | null;
  created_at: string;
  verified_at: string | null;
  blockchain_tx_hash: string | null;
  blockchain_block_number: number | null;
  blockchain_tx_status: BlockchainTxStatus;
  user?: User;
}

export interface DIDCreate {
  did: string;
  wallet_address: string;
  identity_hash: string;
}

export type AssetStatus = 'ACTIVE' | 'TRANSFERRED' | 'BURNED' | 'FROZEN';

export interface Asset {
  id: number;
  token_id: number;
  asset_id: string;
  name: string;
  description: string | null;
  category: string;
  metadata_uri: string;
  creator_id: number | null;
  owner_id: number | null;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
  blockchain_tx_hash: string | null;
  blockchain_block_number: number | null;
  blockchain_tx_status: BlockchainTxStatus;
  blockchain_network: string | null;
  contract_address: string | null;
  creator?: User;
  owner?: User;
  transfers_count?: number;
}

export interface AssetCreate {
  asset_id: string;
  name: string;
  description?: string;
  category: string;
  metadata_uri: string;
  initial_owner_id: number;
}

export interface AssetUpdate {
  name?: string;
  description?: string;
  category?: string;
  metadata_uri?: string;
  status?: AssetStatus;
}

export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transfer {
  id: number;
  asset_id: number;
  initiator_id: number | null;
  recipient_id: number | null;
  from_address: string;
  to_address: string;
  status: TransferStatus;
  blockchain_tx_hash: string | null;
  blockchain_block_number: number | null;
  blockchain_tx_status: BlockchainTxStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  asset?: Asset;
  initiator?: User;
  recipient?: User;
}

export interface TransferCreate {
  asset_id: number;
  to_address: string;
}

export type AuditAction =
  | 'IDENTITY_CREATED'
  | 'IDENTITY_VERIFIED'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REVOKED'
  | 'ASSET_MINTED'
  | 'ASSET_ALLOCATED'
  | 'ASSET_TRANSFERRED'
  | 'ASSET_BURNED'
  | 'ASSET_FROZEN'
  | 'ASSET_UNFROZEN'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'LOGIN'
  | 'LOGOUT';

export interface AuditLog {
  id: number;
  actor_id: number | null;
  actor_address: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  role: string | null;
  blockchain_tx_hash: string | null;
  blockchain_block_number: number | null;
  blockchain_verified: boolean;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor?: User;
}

export interface BlockchainStatus {
  connected: boolean;
  network: string | null;
  chain_id: number | null;
  block_number: number | null;
  contract_address: string | null;
  contract_verified: boolean;
}

export interface BlockchainTransaction {
  id: number;
  tx_hash: string;
  block_number: number;
  block_hash: string;
  from_address: string;
  to_address: string | null;
  value: string;
  gas_used: number | null;
  gas_price: string | null;
  status: number;
  contract_address: string | null;
  method_name: string | null;
  event_data: string | null;
  created_at: string;
}

export interface VerificationRequest {
  tx_hash?: string;
  token_id?: number;
  did?: string;
}

export interface VerificationResponse {
  verified: boolean;
  tx_hash?: string;
  block_number?: number;
  block_timestamp?: number;
  contract_address?: string;
  event_type?: string;
  actor?: string;
  token_id?: number;
  from_address?: string;
  to_address?: string;
  error_message?: string;
}

export interface DashboardStats {
  total_users: number;
  verified_identities: number;
  total_assets: number;
  active_transfers: number;
  blockchain_transactions: number;
  audit_events: number;
  role_distribution: Record<string, number>;
  recent_activity: Array<{
    action: string;
    resource_type: string;
    resource_id: string;
    actor: string;
    created_at: string;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ErrorResponse {
  detail: string;
  error_code?: string;
  field?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  database: string;
  blockchain: string;
}

export interface WalletAssociation {
  id: number;
  user_id: number;
  wallet_address: string;
  wallet_type: WalletType;
  did: string | null;
  blockchain_identity_tx_hash: string | null;
  blockchain_identity_block_number: number | null;
  blockchain_identity_status: BlockchainTxStatus;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface WalletAssociationCreate {
  wallet_address: string;
  wallet_type?: WalletType;
  did?: string;
  is_primary?: boolean;
}

export interface WalletAssociationUpdate {
  wallet_type?: WalletType;
  did?: string;
  is_primary?: boolean;
}

export type AIAssetProposalStatus = 'DRAFT' | 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'MINTED';

export interface AIAssetProposal {
  id: number;
  proposed_by: number | null;
  asset_name: string;
  description: string | null;
  category: string | null;
  metadata_uri: string | null;
  suggested_initial_owner_id: number | null;
  ai_model: string | null;
  ai_prompt: string | null;
  ai_response: string | null;
  status: AIAssetProposalStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string | null;
  minted_asset_id: number | null;
  created_at: string;
  updated_at: string;
  proposer?: User;
  reviewer?: User;
  suggested_owner?: User;
  minted_asset?: Asset;
}

export interface AIAssetProposalCreate {
  asset_name: string;
  description?: string;
  category?: string;
  metadata_uri?: string;
  suggested_initial_owner_id?: number;
  ai_model?: string;
  ai_prompt?: string;
  ai_response?: string;
}

export interface AIAssetProposalUpdate {
  asset_name?: string;
  description?: string;
  category?: string;
  metadata_uri?: string;
  suggested_initial_owner_id?: number;
  status?: AIAssetProposalStatus;
  review_notes?: string;
}

export interface AIAssetProposalReview {
  action: 'approve' | 'reject';
  review_notes?: string;
}