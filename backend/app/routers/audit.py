from typing import List, Optional, TypeVar
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, AuditLog
from app.schemas import (
    AuditLogResponse,
    AuditLogWithActor,
    VerificationRequest,
    VerificationResponse,
    PaginatedResponse,
)
from app.auth import get_current_active_user, require_auditor, require_admin_or_manager
from app.services.audit import AuditService
from app.services.blockchain import BlockchainService

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

AuditLogListResponse = PaginatedResponse[AuditLogWithActor]


@router.get("", response_model=AuditLogListResponse)
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    actor_id: Optional[int] = None,
    blockchain_verified: Optional[bool] = None,
    current_user: User = Depends(require_auditor),
    db: AsyncSession = Depends(get_db),
):
    query = select(AuditLog).options(selectinload(AuditLog.actor))

    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    if actor_id:
        query = query.where(AuditLog.actor_id == actor_id)
    if blockchain_verified is not None:
        query = query.where(AuditLog.blockchain_verified == blockchain_verified)

    query = query.order_by(desc(AuditLog.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    logs = result.scalars().all()

    return AuditLogListResponse(
        items=logs,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{log_id}", response_model=AuditLogWithActor)
async def get_audit_log(
    log_id: int,
    current_user: User = Depends(require_auditor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AuditLog).options(selectinload(AuditLog.actor)).where(AuditLog.id == log_id)
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return log


@router.post("/verify", response_model=VerificationResponse)
async def verify_on_blockchain(
    request: VerificationRequest,
    current_user: User = Depends(require_auditor),
    db: AsyncSession = Depends(get_db),
):
    if not request.tx_hash and not request.token_id and not request.did:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one of: tx_hash, token_id, or did",
        )

    blockchain_service = BlockchainService()

    if request.tx_hash:
        return await _verify_by_tx_hash(blockchain_service, request.tx_hash, db)

    if request.token_id:
        return await _verify_by_token_id(blockchain_service, request.token_id, db)

    if request.did:
        return await _verify_by_did(blockchain_service, request.did, db)

    raise HTTPException(status_code=400, detail="Invalid verification request")


async def _verify_by_tx_hash(
    blockchain_service: BlockchainService, tx_hash: str, db: AsyncSession
) -> VerificationResponse:
    try:
        receipt = await blockchain_service.get_transaction_receipt(tx_hash)
        if not receipt:
            return VerificationResponse(
                verified=False,
                tx_hash=tx_hash,
                error_message="Transaction not found on blockchain",
            )

        tx = await blockchain_service.get_transaction(tx_hash)
        if not tx:
            return VerificationResponse(
                verified=False,
                tx_hash=tx_hash,
                error_message="Transaction details not found",
            )

        contract_address = tx.get("to")
        if not contract_address:
            return VerificationResponse(
                verified=False,
                tx_hash=tx_hash,
                error_message="No contract interaction found",
            )

        logs = await blockchain_service.get_transaction_logs(tx_hash)

        return VerificationResponse(
            verified=True,
            tx_hash=tx_hash,
            block_number=receipt.blockNumber,
            block_timestamp=int(receipt.get("timestamp", 0)) if receipt.get("timestamp") else None,
            contract_address=contract_address,
            event_type=logs[0].get("event") if logs else "Unknown",
            actor=tx.get("from"),
            token_id=None,
            from_address=None,
            to_address=None,
        )
    except Exception as e:
        return VerificationResponse(
            verified=False,
            tx_hash=tx_hash,
            error_message=str(e),
        )


async def _verify_by_token_id(
    blockchain_service: BlockchainService, token_id: int, db: AsyncSession
) -> VerificationResponse:
    try:
        asset = await blockchain_service.get_asset(token_id)
        if not asset:
            return VerificationResponse(
                verified=False,
                token_id=token_id,
                error_message="Asset not found on blockchain",
            )

        return VerificationResponse(
            verified=True,
            token_id=token_id,
            contract_address=blockchain_service.contract_address,
            event_type="AssetMinted",
            actor=asset.get("creator"),
            from_address=None,
            to_address=asset.get("currentOwner"),
        )
    except Exception as e:
        return VerificationResponse(
            verified=False,
            token_id=token_id,
            error_message=str(e),
        )


async def _verify_by_did(
    blockchain_service: BlockchainService, did: str, db: AsyncSession
) -> VerificationResponse:
    try:
        identity = await blockchain_service.get_identity(did)
        if not identity:
            return VerificationResponse(
                verified=False,
                error_message="DID not found on blockchain",
            )

        return VerificationResponse(
            verified=True,
            contract_address=blockchain_service.contract_address,
            event_type="IdentityCreated" if not identity.get("verified") else "IdentityVerified",
            actor=identity.get("wallet"),
        )
    except Exception as e:
        return VerificationResponse(
            verified=False,
            error_message=str(e),
        )