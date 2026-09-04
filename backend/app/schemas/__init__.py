from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    AUDITOR = "AUDITOR"
    USER = "USER"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    wallet_address: Optional[str] = Field(None, pattern=r"^0x[a-fA-F0-9]{40}$")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole = UserRole.USER


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    wallet_address: Optional[str] = Field(None, pattern=r"^0x[a-fA-F0-9]{40}$")
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None


class UserWithDetails(UserResponse):
    dids_count: int = 0
    assets_count: int = 0
    transfers_count: int = 0


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(UserCreate):
    pass


class DIDBase(BaseModel):
    did: str = Field(..., min_length=1, max_length=255)
    wallet_address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    identity_hash: str = Field(..., pattern=r"^0x[a-fA-F0-9]{64}$")


class DIDCreate(DIDBase):
    pass


class DIDVerify(BaseModel):
    pass


class DIDResponse(DIDBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    verified: bool
    verification_tx_hash: Optional[str] = None
    created_at: datetime
    verified_at: Optional[datetime] = None
    blockchain_tx_hash: Optional[str] = None
    blockchain_block_number: Optional[int] = None


class DIDWithUser(DIDResponse):
    user: UserResponse


class AssetStatus(str, Enum):
    ACTIVE = "ACTIVE"
    TRANSFERRED = "TRANSFERRED"
    BURNED = "BURNED"
    FROZEN = "FROZEN"


class AssetBase(BaseModel):
    asset_id: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    metadata_uri: str = Field(..., min_length=1, max_length=500)


class AssetCreate(AssetBase):
    initial_owner_id: int


class AssetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    metadata_uri: Optional[str] = Field(None, min_length=1, max_length=500)
    status: Optional[AssetStatus] = None


class AssetResponse(AssetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    token_id: int
    creator_id: Optional[int] = None
    owner_id: Optional[int] = None
    status: AssetStatus
    created_at: datetime
    updated_at: datetime
    blockchain_tx_hash: Optional[str] = None
    blockchain_block_number: Optional[int] = None


class AssetWithDetails(AssetResponse):
    creator: Optional[UserResponse] = None
    owner: Optional[UserResponse] = None
    transfers_count: int = 0


class TransferStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class TransferBase(BaseModel):
    asset_id: int
    to_address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")


class TransferCreate(TransferBase):
    pass


class TransferApprove(BaseModel):
    pass


class TransferReject(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500)


class TransferResponse(TransferBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    initiator_id: Optional[int] = None
    recipient_id: Optional[int] = None
    from_address: str
    status: TransferStatus
    blockchain_tx_hash: Optional[str] = None
    blockchain_block_number: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class TransferWithDetails(TransferResponse):
    asset: AssetResponse
    initiator: Optional[UserResponse] = None
    recipient: Optional[UserResponse] = None


class AuditAction(str, Enum):
    IDENTITY_CREATED = "IDENTITY_CREATED"
    IDENTITY_VERIFIED = "IDENTITY_VERIFIED"
    ROLE_ASSIGNED = "ROLE_ASSIGNED"
    ROLE_REVOKED = "ROLE_REVOKED"
    ASSET_MINTED = "ASSET_MINTED"
    ASSET_ALLOCATED = "ASSET_ALLOCATED"
    ASSET_TRANSFERRED = "ASSET_TRANSFERRED"
    ASSET_BURNED = "ASSET_BURNED"
    ASSET_FROZEN = "ASSET_FROZEN"
    ASSET_UNFROZEN = "ASSET_UNFROZEN"
    USER_CREATED = "USER_CREATED"
    USER_UPDATED = "USER_UPDATED"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"


class AuditLogBase(BaseModel):
    action: AuditAction
    resource_type: str = Field(..., min_length=1, max_length=50)
    resource_id: str = Field(..., min_length=1, max_length=100)
    role: Optional[str] = None
    blockchain_tx_hash: Optional[str] = Field(None, pattern=r"^0x[a-fA-F0-9]{64}$")
    blockchain_block_number: Optional[int] = None
    blockchain_verified: bool = False
    details: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actor_id: Optional[int] = None
    actor_address: Optional[str] = None
    created_at: datetime


class AuditLogWithActor(AuditLogResponse):
    actor: Optional[UserResponse] = None


class BlockchainStatus(BaseModel):
    connected: bool
    network: Optional[str] = None
    chain_id: Optional[int] = None
    block_number: Optional[int] = None
    contract_address: Optional[str] = None
    contract_verified: bool = False


class BlockchainTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tx_hash: str
    block_number: int
    block_hash: str
    from_address: str
    to_address: Optional[str] = None
    value: str
    gas_used: Optional[int] = None
    gas_price: Optional[str] = None
    status: int
    contract_address: Optional[str] = None
    method_name: Optional[str] = None
    event_data: Optional[str] = None
    created_at: datetime


class VerificationRequest(BaseModel):
    tx_hash: Optional[str] = Field(None, pattern=r"^0x[a-fA-F0-9]{64}$")
    token_id: Optional[int] = None
    did: Optional[str] = None


class VerificationResponse(BaseModel):
    verified: bool
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    block_timestamp: Optional[int] = None
    contract_address: Optional[str] = None
    event_type: Optional[str] = None
    actor: Optional[str] = None
    token_id: Optional[int] = None
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    error_message: Optional[str] = None


class DashboardStats(BaseModel):
    total_users: int
    verified_identities: int
    total_assets: int
    active_transfers: int
    blockchain_transactions: int
    audit_events: int
    role_distribution: dict
    recent_activity: List[dict]


class PaginatedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[BaseModel]
    total: int
    page: int
    page_size: int
    total_pages: int


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    field: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime
    database: str
    blockchain: str


class SecurityEventType(str, Enum):
    UNAUTHORIZED_TRANSFER_ATTEMPT = "UNAUTHORIZED_TRANSFER_ATTEMPT"
    UNAUTHORIZED_APPROVE_ATTEMPT = "UNAUTHORIZED_APPROVE_ATTEMPT"
    UNAUTHORIZED_OPERATOR_ATTEMPT = "UNAUTHORIZED_OPERATOR_ATTEMPT"
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY"
    REPEATED_FAILED_AUTH = "REPEATED_FAILED_AUTH"
    UNAUTHORIZED_API_ACCESS = "UNAUTHORIZED_API_ACCESS"
    ASSET_ASSIGNMENT_CHANGED = "ASSET_ASSIGNMENT_CHANGED"
    ASSET_STATUS_CHANGED = "ASSET_STATUS_CHANGED"
    ROLE_ESCALATION_ATTEMPT = "ROLE_ESCALATION_ATTEMPT"


class SecurityEventSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SecurityEventBase(BaseModel):
    event_type: SecurityEventType
    severity: SecurityEventSeverity
    actor_id: Optional[int] = None
    actor_address: Optional[str] = None
    actor_role: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    reason: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None
    blockchain_block_number: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_path: Optional[str] = None
    request_method: Optional[str] = None


class SecurityEventCreate(SecurityEventBase):
    pass


class SecurityEventResponse(SecurityEventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resolved: bool
    resolved_by: Optional[int] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime


class SecurityEventWithDetails(SecurityEventResponse):
    actor: Optional[UserResponse] = None
    resolver: Optional[UserResponse] = None


class SecurityEventResolve(BaseModel):
    resolution_notes: Optional[str] = None