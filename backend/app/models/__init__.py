import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text, Index, BigInteger
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    AUDITOR = "AUDITOR"
    USER = "USER"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    wallet_address: Mapped[str] = mapped_column(String(42), unique=True, index=True, nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    dids: Mapped[list["DID"]] = relationship("DID", back_populates="user", cascade="all, delete-orphan")
    assets: Mapped[list["Asset"]] = relationship("Asset", back_populates="owner", foreign_keys="Asset.owner_id")
    created_assets: Mapped[list["Asset"]] = relationship("Asset", back_populates="creator", foreign_keys="Asset.creator_id")
    transfers_initiated: Mapped[list["Transfer"]] = relationship("Transfer", back_populates="initiator", foreign_keys="Transfer.initiator_id")
    transfers_received: Mapped[list["Transfer"]] = relationship("Transfer", back_populates="recipient", foreign_keys="Transfer.recipient_id")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="actor")

    __table_args__ = (
        Index("ix_users_email_active", "email", "is_active"),
        Index("ix_users_wallet_active", "wallet_address", "is_active"),
    )


class DID(Base):
    __tablename__ = "dids"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    did: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wallet_address: Mapped[str] = mapped_column(String(42), nullable=False)
    identity_hash: Mapped[str] = mapped_column(String(66), nullable=False)  # 0x + 64 hex chars
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_tx_hash: Mapped[str] = mapped_column(String(66), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    verified_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    blockchain_tx_hash: Mapped[str] = mapped_column(String(66), nullable=True)
    blockchain_block_number: Mapped[int] = mapped_column(BigInteger, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="dids")

    __table_args__ = (
        Index("ix_dids_user_verified", "user_id", "verified"),
        Index("ix_dids_wallet", "wallet_address"),
    )


class AssetStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    TRANSFERRED = "TRANSFERRED"
    BURNED = "BURNED"
    FROZEN = "FROZEN"


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    token_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True, nullable=False)
    asset_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    metadata_uri: Mapped[str] = mapped_column(String(500), nullable=False)
    creator_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[AssetStatus] = mapped_column(Enum(AssetStatus), default=AssetStatus.ACTIVE, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    blockchain_tx_hash: Mapped[str] = mapped_column(String(66), nullable=True)
    blockchain_block_number: Mapped[int] = mapped_column(BigInteger, nullable=True)

    creator: Mapped["User"] = relationship("User", back_populates="created_assets", foreign_keys=[creator_id])
    owner: Mapped["User"] = relationship("User", back_populates="assets", foreign_keys=[owner_id])
    transfers: Mapped[list["Transfer"]] = relationship("Transfer", back_populates="asset", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_assets_owner_status", "owner_id", "status"),
        Index("ix_assets_category_status", "category", "status"),
        Index("ix_assets_creator", "creator_id"),
    )


class TransferStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class Transfer(Base):
    __tablename__ = "transfers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id: Mapped[int] = mapped_column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    initiator_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    recipient_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    from_address: Mapped[str] = mapped_column(String(42), nullable=False)
    to_address: Mapped[str] = mapped_column(String(42), nullable=False)
    status: Mapped[TransferStatus] = mapped_column(Enum(TransferStatus), default=TransferStatus.PENDING, nullable=False)
    blockchain_tx_hash: Mapped[str] = mapped_column(String(66), nullable=True)
    blockchain_block_number: Mapped[int] = mapped_column(BigInteger, nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    asset: Mapped["Asset"] = relationship("Asset", back_populates="transfers")
    initiator: Mapped["User"] = relationship("User", back_populates="transfers_initiated", foreign_keys=[initiator_id])
    recipient: Mapped["User"] = relationship("User", back_populates="transfers_received", foreign_keys=[recipient_id])

    __table_args__ = (
        Index("ix_transfers_asset_status", "asset_id", "status"),
        Index("ix_transfers_initiator_status", "initiator_id", "status"),
        Index("ix_transfers_recipient_status", "recipient_id", "status"),
    )


class AuditAction(str, enum.Enum):
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


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    actor_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_address: Mapped[str] = mapped_column(String(42), nullable=True)
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=True)
    blockchain_tx_hash: Mapped[str] = mapped_column(String(66), nullable=True)
    blockchain_block_number: Mapped[int] = mapped_column(BigInteger, nullable=True)
    blockchain_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    actor: Mapped["User"] = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_logs_actor_created", "actor_id", "created_at"),
        Index("ix_audit_logs_action_created", "action", "created_at"),
        Index("ix_audit_logs_resource", "resource_type", "resource_id"),
        Index("ix_audit_logs_blockchain_verified", "blockchain_verified"),
    )


class BlockchainTransaction(Base):
    __tablename__ = "blockchain_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    tx_hash: Mapped[str] = mapped_column(String(66), unique=True, index=True, nullable=False)
    block_number: Mapped[int] = mapped_column(BigInteger, index=True, nullable=False)
    block_hash: Mapped[str] = mapped_column(String(66), nullable=False)
    from_address: Mapped[str] = mapped_column(String(42), index=True, nullable=False)
    to_address: Mapped[str] = mapped_column(String(42), index=True, nullable=True)
    value: Mapped[str] = mapped_column(String(100), default="0", nullable=False)
    gas_used: Mapped[int] = mapped_column(BigInteger, nullable=True)
    gas_price: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 = success, 0 = failed
    contract_address: Mapped[str] = mapped_column(String(42), index=True, nullable=True)
    method_name: Mapped[str] = mapped_column(String(100), nullable=True)
    event_data: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    __table_args__ = (
        Index("ix_blockchain_txs_from_created", "from_address", "created_at"),
        Index("ix_blockchain_txs_contract_created", "contract_address", "created_at"),
    )