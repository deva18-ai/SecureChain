import hashlib
import secrets
from typing import List, Optional, TypeVar
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, DID
from app.schemas import (
    DIDCreate,
    DIDVerify,
    DIDResponse,
    DIDWithUser,
    PaginatedResponse,
)
from app.auth import get_current_active_user, require_admin, require_admin_or_manager
from app.services.did import DIDService
from app.services.audit import AuditService
from app.services.blockchain import BlockchainService

router = APIRouter(prefix="/dids", tags=["Decentralized Identifiers"])

DIDListResponse = PaginatedResponse[DIDWithUser]


def generate_did() -> str:
    identifier = secrets.token_hex(16)
    return f"did:securechain:{identifier}"


def generate_identity_hash(wallet_address: str, did: str) -> str:
    data = f"{wallet_address.lower()}{did}{secrets.token_hex(32)}"
    return "0x" + hashlib.sha256(data.encode()).hexdigest()


@router.post("", response_model=DIDResponse, status_code=status.HTTP_201_CREATED)
async def create_did(
    request: DIDCreate = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    if request is None:
        request = DIDCreate(
            did=generate_did(),
            wallet_address=current_user.wallet_address or "0x" + "0" * 40,
            identity_hash=generate_identity_hash(
                current_user.wallet_address or "0x" + "0" * 40,
                generate_did(),
            ),
        )

    if request.wallet_address and not current_user.wallet_address:
        current_user.wallet_address = request.wallet_address
        await db.commit()

    existing = await db.execute(select(DID).where(DID.did == request.did))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="DID already exists")

    existing = await db.execute(
        select(DID).where(DID.wallet_address == request.wallet_address)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Wallet already has a DID")

    did = DID(
        did=request.did,
        user_id=current_user.id,
        wallet_address=request.wallet_address,
        identity_hash=request.identity_hash,
        verified=False,
    )
    db.add(did)
    await db.commit()
    await db.refresh(did)

    blockchain_tx_hash = None
    blockchain_block_number = None
    if current_user.wallet_address:
        try:
            blockchain_service = BlockchainService()
            tx_hash = await blockchain_service.create_identity(
                did=did.did,
                wallet=did.wallet_address,
                identity_hash=did.identity_hash,
            )
            blockchain_tx_hash = tx_hash
            if tx_hash:
                receipt = await blockchain_service.get_transaction_receipt(tx_hash)
                if receipt:
                    blockchain_block_number = receipt.blockNumber
        except Exception as e:
            pass

    if blockchain_tx_hash:
        did.blockchain_tx_hash = blockchain_tx_hash
        did.blockchain_block_number = blockchain_block_number
        await db.commit()
        await db.refresh(did)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="IDENTITY_CREATED",
        resource_type="DID",
        resource_id=did.did,
        role=current_user.role.value,
        blockchain_tx_hash=blockchain_tx_hash,
        blockchain_block_number=blockchain_block_number,
        details=f"Created DID for wallet {did.wallet_address}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return did


@router.get("/me", response_model=DIDResponse)
async def get_my_did(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DID).where(DID.user_id == current_user.id)
    )
    did = result.scalar_one_or_none()
    if not did:
        raise HTTPException(status_code=404, detail="No DID found for current user")
    return did


@router.get("", response_model=DIDListResponse)
async def list_dids(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    verified: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
):
    query = select(DID).options(selectinload(DID.user))

    if verified is not None:
        query = query.where(DID.verified == verified)
    if search:
        query = query.where(DID.did.ilike(f"%{search}%"))

    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        query = query.where(DID.user_id == current_user.id)

    query = query.order_by(desc(DID.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    dids = result.scalars().all()

    return DIDListResponse(
        items=dids,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{did_id}", response_model=DIDWithUser)
async def get_did(
    did_id: int,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DID).options(selectinload(DID.user)).where(DID.id == did_id)
    )
    did = result.scalar_one_or_none()
    if not did:
        raise HTTPException(status_code=404, detail="DID not found")

    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and did.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this DID")

    return DIDWithUser(
        id=did.id,
        did=did.did,
        wallet_address=did.wallet_address,
        identity_hash=did.identity_hash,
        verified=did.verified,
        verification_tx_hash=did.verification_tx_hash,
        created_at=did.created_at,
        verified_at=did.verified_at,
        blockchain_tx_hash=did.blockchain_tx_hash,
        blockchain_block_number=did.blockchain_block_number,
        user_id=did.user_id,
        user=did.user,
    )


@router.post("/{did_id}/verify", response_model=DIDResponse)
async def verify_did(
    did_id: int,
    request: DIDVerify,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(DID).where(DID.id == did_id))
    did = result.scalar_one_or_none()
    if not did:
        raise HTTPException(status_code=404, detail="DID not found")

    if did.verified:
        raise HTTPException(status_code=400, detail="DID already verified")

    blockchain_tx_hash = None
    blockchain_block_number = None
    try:
        blockchain_service = BlockchainService()
        tx_hash = await blockchain_service.verify_identity(did.did)
        blockchain_tx_hash = tx_hash
        if tx_hash:
            receipt = await blockchain_service.get_transaction_receipt(tx_hash)
            if receipt:
                blockchain_block_number = receipt.blockNumber
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain verification failed: {str(e)}")

    did.verified = True
    did.verification_tx_hash = blockchain_tx_hash
    did.blockchain_tx_hash = blockchain_tx_hash
    did.blockchain_block_number = blockchain_block_number
    from datetime import datetime
    did.verified_at = datetime.utcnow()
    await db.commit()
    await db.refresh(did)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="IDENTITY_VERIFIED",
        resource_type="DID",
        resource_id=did.did,
        role=current_user.role.value,
        blockchain_tx_hash=blockchain_tx_hash,
        blockchain_block_number=blockchain_block_number,
        details=f"Verified DID on blockchain",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return did