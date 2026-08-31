from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, Asset, Transfer, TransferStatus
from app.schemas import (
    TransferCreate,
    TransferApprove,
    TransferReject,
    TransferResponse,
    TransferWithDetails,
    PaginatedResponse,
)
from app.auth import get_current_active_user, require_admin, require_admin_or_manager
from app.services.audit import AuditService
from app.services.blockchain import BlockchainService

router = APIRouter(prefix="/transfers", tags=["Asset Transfers"])


@router.post("", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
async def create_transfer(
    request: TransferCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(Asset).where(Asset.id == request.asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.owner_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to transfer this asset")

    if asset.status in [AssetStatus.BURNED, AssetStatus.FROZEN]:
        raise HTTPException(status_code=400, detail="Asset cannot be transferred in current state")

    result = await db.execute(select(User).where(User.wallet_address == request.to_address))
    recipient = result.scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    if not current_user.wallet_address:
        raise HTTPException(status_code=400, detail="You have no wallet address")

    transfer = Transfer(
        asset_id=asset.id,
        initiator_id=current_user.id,
        recipient_id=recipient.id,
        from_address=current_user.wallet_address,
        to_address=request.to_address,
        status=TransferStatus.PENDING,
    )
    db.add(transfer)
    await db.commit()
    await db.refresh(transfer)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_TRANSFERRED",
        resource_type="TRANSFER",
        resource_id=str(transfer.id),
        role=current_user.role.value,
        details=f"Initiated transfer of asset {asset.name} to {recipient.email}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return transfer


@router.get("", response_model=PaginatedResponse)
async def list_transfers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[TransferStatus] = None,
    asset_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Transfer).options(
        selectinload(Transfer.asset),
        selectinload(Transfer.initiator),
        selectinload(Transfer.recipient),
    )

    if current_user.role not in [UserRole.ADMIN, UserRole.AUDITOR, UserRole.MANAGER]:
        query = query.where(
            (Transfer.initiator_id == current_user.id)
            | (Transfer.recipient_id == current_user.id)
        )

    if status:
        query = query.where(Transfer.status == status)
    if asset_id:
        query = query.where(Transfer.asset_id == asset_id)

    query = query.order_by(desc(Transfer.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    transfers = result.scalars().all()

    return PaginatedResponse(
        items=transfers,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{transfer_id}", response_model=TransferWithDetails)
async def get_transfer(
    transfer_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transfer)
        .options(
            selectinload(Transfer.asset),
            selectinload(Transfer.initiator),
            selectinload(Transfer.recipient),
        )
        .where(Transfer.id == transfer_id)
    )
    transfer = result.scalar_one_or_none()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")

    if (
        current_user.role not in [UserRole.ADMIN, UserRole.AUDITOR, UserRole.MANAGER]
        and transfer.initiator_id != current_user.id
        and transfer.recipient_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not authorized to view this transfer")

    return transfer


@router.post("/{transfer_id}/approve", response_model=TransferResponse)
async def approve_transfer(
    transfer_id: int,
    request: TransferApprove,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(
        select(Transfer).where(Transfer.id == transfer_id)
    )
    transfer = result.scalar_one_or_none()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")

    if transfer.status != TransferStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transfer not pending")

    result = await db.execute(select(Asset).where(Asset.id == transfer.asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.status in [AssetStatus.BURNED, AssetStatus.FROZEN]:
        raise HTTPException(status_code=400, detail="Asset cannot be transferred in current state")

    blockchain_tx_hash = None
    blockchain_block_number = None
    try:
        blockchain_service = BlockchainService()
        tx_hash = await blockchain_service.transfer_asset(
            token_id=asset.token_id,
            from_address=transfer.from_address,
            to_address=transfer.to_address,
        )
        blockchain_tx_hash = tx_hash
        if tx_hash:
            receipt = await blockchain_service.get_transaction_receipt(tx_hash)
            if receipt:
                blockchain_block_number = receipt.blockNumber
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain transfer failed: {str(e)}")

    transfer.status = TransferStatus.COMPLETED
    transfer.blockchain_tx_hash = blockchain_tx_hash
    transfer.blockchain_block_number = blockchain_block_number
    from datetime import datetime
    transfer.completed_at = datetime.utcnow()

    asset.owner_id = transfer.recipient_id
    asset.status = AssetStatus.TRANSFERRED
    asset.blockchain_tx_hash = blockchain_tx_hash
    asset.blockchain_block_number = blockchain_block_number

    await db.commit()
    await db.refresh(transfer)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_TRANSFERRED",
        resource_type="TRANSFER",
        resource_id=str(transfer.id),
        role=current_user.role.value,
        blockchain_tx_hash=blockchain_tx_hash,
        blockchain_block_number=blockchain_block_number,
        details=f"Approved transfer of asset {asset.name}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return transfer


@router.post("/{transfer_id}/reject", response_model=TransferResponse)
async def reject_transfer(
    transfer_id: int,
    request: TransferReject,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(
        select(Transfer).where(Transfer.id == transfer_id)
    )
    transfer = result.scalar_one_or_none()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")

    if transfer.status != TransferStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transfer not pending")

    transfer.status = TransferStatus.REJECTED
    transfer.error_message = request.reason
    await db.commit()
    await db.refresh(transfer)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_TRANSFERRED",
        resource_type="TRANSFER",
        resource_id=str(transfer.id),
        role=current_user.role.value,
        details=f"Rejected transfer: {request.reason}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return transfer


@router.post("/{transfer_id}/cancel", response_model=TransferResponse)
async def cancel_transfer(
    transfer_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(
        select(Transfer).where(Transfer.id == transfer_id)
    )
    transfer = result.scalar_one_or_none()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")

    if transfer.initiator_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this transfer")

    if transfer.status != TransferStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transfer not pending")

    transfer.status = TransferStatus.CANCELLED
    await db.commit()
    await db.refresh(transfer)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_TRANSFERRED",
        resource_type="TRANSFER",
        resource_id=str(transfer.id),
        role=current_user.role.value,
        details="Cancelled transfer",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return transfer