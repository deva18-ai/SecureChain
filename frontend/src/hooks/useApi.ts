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
    queryFn: () => api.get<PaginatedResponse<User>>('/users', { params }).then(r => r.data),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => api.get<User>(`/users/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useDids(params?: { page?: number; page_size?: number; verified?: boolean; search?: string }) {
  return useQuery({
    queryKey: queryKeys.dids(params),
    queryFn: () => api.get<PaginatedResponse<DID>>('/dids', { params }).then(r => r.data),
  });
}

export function useMyDid() {
  return useQuery({
    queryKey: queryKeys.myDid(),
    queryFn: () => api.get<DID>('/dids/me').then(r => r.data),
  });
}

export function useDid(id: number) {
  return useQuery({
    queryKey: queryKeys.did(id),
    queryFn: () => api.get<DID>(`/dids/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useAssets(params?: { page?: number; page_size?: number; status?: string; category?: string; owner_id?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.assets(params),
    queryFn: () => api.get<PaginatedResponse<Asset>>('/assets', { params }).then(r => r.data),
  });
}

export function useAsset(id: number) {
  return useQuery({
    queryKey: queryKeys.asset(id),
    queryFn: () => api.get<Asset>(`/assets/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useTransfers(params?: { page?: number; page_size?: number; status?: string; asset_id?: number }) {
  return useQuery({
    queryKey: queryKeys.transfers(params),
    queryFn: () => api.get<PaginatedResponse<Transfer>>('/transfers', { params }).then(r => r.data),
  });
}

export function useTransfer(id: number) {
  return useQuery({
    queryKey: queryKeys.transfer(id),
    queryFn: () => api.get<Transfer>(`/transfers/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useAuditLogs(params?: { page?: number; page_size?: number; action?: string; resource_type?: string; actor_id?: number; blockchain_verified?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auditLogs(params),
    queryFn: () => api.get<PaginatedResponse<AuditLog>>('/audit', { params }).then(r => r.data),
  });
}

export function useBlockchainStatus() {
  return useQuery({
    queryKey: queryKeys.blockchainStatus(),
    queryFn: () => api.get<BlockchainStatus>('/blockchain/status').then(r => r.data),
    refetchInterval: 30000,
  });
}

export function useBlockchainTransactions(params?: { page?: number; page_size?: number; from_address?: string; contract_address?: string }) {
  return useQuery({
    queryKey: ['blockchain', 'transactions', params],
    queryFn: () => api.get<PaginatedResponse<BlockchainTransaction>>('/blockchain/transactions', { params }).then(r => r.data),
  });
}
export function useBlockchainTransaction(txHash: string) {
  return useQuery({
    queryKey: queryKeys.blockchainTx(txHash),
    queryFn: () => api.get<BlockchainTransaction>(`/blockchain/transaction/${txHash}`).then(r => r.data),
    enabled: !!txHash,
  });
}

export function useBlockchainAsset(tokenId: number) {
  return useQuery({
    queryKey: queryKeys.blockchainAsset(tokenId),
    queryFn: () => api.get(`/blockchain/assets/${tokenId}`).then(r => r.data),
    enabled: !!tokenId,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: () => api.get<DashboardStats>('/dashboard/stats').then(r => r.data),
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
    mutationFn: () => api.post<DID>('/dids').then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dids'] });
      queryClient.invalidateQueries({ queryKey: ['did', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useVerifyDID() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<DID>(`/dids/${id}/verify`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

// Wallet Association hooks
export function useUserWallets(userId: number) {
  return useQuery({
    queryKey: queryKeys.userWallets(userId),
    queryFn: () => api.get<PaginatedResponse<WalletAssociation>>(`/users/${userId}/wallets`).then(r => r.data),
    enabled: !!userId,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: WalletAssociationCreate }) =>
      api.post<WalletAssociation>(`/users/${userId}/wallets`, data).then(r => r.data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'wallets'] });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, walletId, data }: { userId: number; walletId: number; data: WalletAssociationUpdate }) =>
      api.patch<WalletAssociation>(`/users/${userId}/wallets/${walletId}`, data).then(r => r.data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'wallets'] });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, walletId }: { userId: number; walletId: number }) =>
      api.delete(`/users/${userId}/wallets/${walletId}`),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'wallets'] });
    },
  });
}

// AI Asset Proposal hooks
export function useAssetProposals(params?: { page?: number; page_size?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.assetProposals(params),
    queryFn: () => api.get<PaginatedResponse<AIAssetProposal>>('/assets/proposals', { params }).then(r => r.data),
  });
}

export function useAssetProposal(id: number) {
  return useQuery({
    queryKey: queryKeys.assetProposal(id),
    queryFn: () => api.get<AIAssetProposal>(`/assets/proposals/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateAssetProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AIAssetProposalCreate) => api.post<AIAssetProposal>('/assets/proposals', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', 'proposals'] });
    },
  });
}

export function useUpdateAssetProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AIAssetProposalUpdate }) =>
      api.patch<AIAssetProposal>(`/assets/proposals/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assets', 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['assets', 'proposals', id] });
    },
  });
}

export function useReviewAssetProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AIAssetProposalReview }) =>
      api.post<AIAssetProposal>(`/assets/proposals/${id}/review`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assets', 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['assets', 'proposals', id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

// Security Event hooks
export function useSecurityEvents(params?: { page?: number; page_size?: number; status?: string; severity?: string }) {
  return useQuery({
    queryKey: ['security', params],
    queryFn: () => api.get('/security', { params }).then(r => r.data),
  });
}

export function useResolveSecurityEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution_notes }: { id: number; resolution_notes?: string }) =>
      api.post(`/security/${id}/resolve`, { resolution_notes }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] });
    },
  });
}


