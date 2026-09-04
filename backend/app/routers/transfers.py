from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, Asset, AssetStatus, Transfer, TransferStatus
from app.schemas import (
    TransferApprove,
    TransferReject,
    TransferResponse,
    TransferWithDetails,
    PaginatedResponse,
)
from app.auth import get_current_active_user, require_owner, require_owner_or_manager
from app.services.audit import AuditService
from app.services.blockchain import BlockchainService

router = APIRouter(prefix="/transfers", tags=["Asset Transfers"])


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

    if current_user.role not in [UserRole.OWNER, UserRole.MANAGER]:
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
        current_user.role not in [UserRole.OWNER, UserRole.MANAGER]
        and transfer.initiator_id != current_user.id
        and transfer.recipient_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not authorized to view this transfer")

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

    if transfer.initiator_id != current_user.id and current_user.role != UserRole.OWNER:
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