from typing import List, Optional, TypeVar
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, WalletAssociation, WalletType, BlockchainTxStatus
from app.schemas import (
    UserResponse,
    UserWithDetails,
    UserUpdate,
    UserRoleUpdate,
    PaginatedResponse,
    WalletAssociationCreate,
    WalletAssociationUpdate,
    WalletAssociationResponse,
    WalletAssociationWithUser,
)
from app.auth import get_current_active_user, require_admin, require_admin_or_manager
from app.services.audit import AuditService

router = APIRouter(prefix="/users", tags=["Users"])

UserListResponse = PaginatedResponse[UserWithDetails]


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).options(selectinload(User.dids), selectinload(User.assets))

    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%"))
        )

    query = query.order_by(desc(User.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()

    items = []
    for user in users:
        items.append(
            UserWithDetails(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                wallet_address=user.wallet_address,
                role=user.role,
                is_active=user.is_active,
                is_verified=user.is_verified,
                created_at=user.created_at,
                updated_at=user.updated_at,
                last_login=user.last_login,
                dids_count=len(user.dids),
                assets_count=len(user.assets),
                transfers_count=0,
            )
        )

    return UserListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{user_id}", response_model=UserWithDetails)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.dids), selectinload(User.assets))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserWithDetails(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        wallet_address=user.wallet_address,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login=user.last_login,
        dids_count=len(user.dids),
        assets_count=len(user.assets),
        transfers_count=0,
    )


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    request: UserUpdate,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    if current_user.id == user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Cannot modify own account unless admin")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_data = {
        "full_name": user.full_name,
        "wallet_address": user.wallet_address,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
    }

    if request.full_name is not None:
        user.full_name = request.full_name
    if request.wallet_address is not None:
        existing = await db.execute(
            select(User).where(
                User.wallet_address == request.wallet_address, User.id != user_id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Wallet address already in use")
        user.wallet_address = request.wallet_address
    if request.is_active is not None:
        user.is_active = request.is_active
    if request.is_verified is not None:
        user.is_verified = request.is_verified

    await db.commit()
    await db.refresh(user)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="USER_UPDATED",
        resource_type="USER",
        resource_id=str(user_id),
        role=current_user.role.value,
        details=f"Updated user: {old_data} -> {request.model_dump(exclude_unset=True)}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return user


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    request: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot change own role")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = user.role
    user.role = request.role
    await db.commit()
    await db.refresh(user)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ROLE_ASSIGNED",
        resource_type="USER",
        resource_id=str(user_id),
        role=current_user.role.value,
        details=f"Changed role from {old_role.value} to {request.role.value}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete own account")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="USER_UPDATED",
        resource_type="USER",
        resource_id=str(user_id),
        role=current_user.role.value,
        details="User deleted",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )


WalletAssociationListResponse = PaginatedResponse[WalletAssociationWithUser]


@router.get("/{user_id}/wallets", response_model=WalletAssociationListResponse)
async def list_user_wallets(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = select(WalletAssociation).where(WalletAssociation.user_id == user_id).order_by(desc(WalletAssociation.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    wallets = result.scalars().all()

    items = []
    for wallet in wallets:
        items.append(
            WalletAssociationWithUser(
                id=wallet.id,
                user_id=wallet.user_id,
                wallet_address=wallet.wallet_address,
                wallet_type=wallet.wallet_type,
                did=wallet.did,
                blockchain_identity_tx_hash=wallet.blockchain_identity_tx_hash,
                blockchain_identity_block_number=wallet.blockchain_identity_block_number,
                blockchain_identity_status=wallet.blockchain_identity_status,
                is_primary=wallet.is_primary,
                created_at=wallet.created_at,
                updated_at=wallet.updated_at,
                user=user,
            )
        )

    return WalletAssociationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.post("/{user_id}/wallets", response_model=WalletAssociationResponse, status_code=status.HTTP_201_CREATED)
async def create_user_wallet(
    user_id: int,
    request: WalletAssociationCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.execute(select(WalletAssociation).where(WalletAssociation.wallet_address == request.wallet_address))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Wallet address already associated with another user")

    # If this is the primary wallet, unset other primary wallets for this user
    if request.is_primary:
        await db.execute(
            WalletAssociation.__table__.update()
            .where(WalletAssociation.user_id == user_id)
            .values(is_primary=False)
        )

    wallet = WalletAssociation(
        user_id=user_id,
        wallet_address=request.wallet_address,
        wallet_type=request.wallet_type,
        did=request.did,
        is_primary=request.is_primary,
        blockchain_identity_status=BlockchainTxStatus.PENDING,
    )
    db.add(wallet)
    await db.commit()
    await db.refresh(wallet)

    # Also update user's main wallet_address if this is primary
    if request.is_primary:
        user.wallet_address = request.wallet_address
        await db.commit()

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="WALLET_ASSOCIATED",
        resource_type="WALLET",
        resource_id=str(wallet.id),
        role=current_user.role.value,
        details=f"Associated wallet {request.wallet_address} with user {user.email}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return wallet


@router.get("/{user_id}/wallets/{wallet_id}", response_model=WalletAssociationWithUser)
async def get_user_wallet(
    user_id: int,
    wallet_id: int,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WalletAssociation)
        .options(selectinload(WalletAssociation.user))
        .where(WalletAssociation.id == wallet_id, WalletAssociation.user_id == user_id)
    )
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet association not found")

    return WalletAssociationWithUser(
        id=wallet.id,
        user_id=wallet.user_id,
        wallet_address=wallet.wallet_address,
        wallet_type=wallet.wallet_type,
        did=wallet.did,
        blockchain_identity_tx_hash=wallet.blockchain_identity_tx_hash,
        blockchain_identity_block_number=wallet.blockchain_identity_block_number,
        blockchain_identity_status=wallet.blockchain_identity_status,
        is_primary=wallet.is_primary,
        created_at=wallet.created_at,
        updated_at=wallet.updated_at,
        user=wallet.user,
    )


@router.patch("/{user_id}/wallets/{wallet_id}", response_model=WalletAssociationResponse)
async def update_user_wallet(
    user_id: int,
    wallet_id: int,
    request: WalletAssociationUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(
        select(WalletAssociation).where(WalletAssociation.id == wallet_id, WalletAssociation.user_id == user_id)
    )
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet association not found")

    if request.wallet_address is not None:
        existing = await db.execute(
            select(WalletAssociation).where(
                WalletAssociation.wallet_address == request.wallet_address, WalletAssociation.id != wallet_id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Wallet address already in use")
        wallet.wallet_address = request.wallet_address
        # Update user's main wallet_address if this is primary
        if wallet.is_primary:
            user = await db.execute(select(User).where(User.id == user_id))
            user = user.scalar_one_or_none()
            if user:
                user.wallet_address = request.wallet_address

    if request.wallet_type is not None:
        wallet.wallet_type = request.wallet_type
    if request.did is not None:
        wallet.did = request.did
    if request.is_primary is not None:
        if request.is_primary:
            # Unset other primary wallets
            await db.execute(
                WalletAssociation.__table__.update()
                .where(WalletAssociation.user_id == user_id, WalletAssociation.id != wallet_id)
                .values(is_primary=False)
            )
            # Update user's main wallet_address
            user = await db.execute(select(User).where(User.id == user_id))
            user = user.scalar_one_or_none()
            if user:
                user.wallet_address = wallet.wallet_address
        wallet.is_primary = request.is_primary

    await db.commit()
    await db.refresh(wallet)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="WALLET_UPDATED",
        resource_type="WALLET",
        resource_id=str(wallet.id),
        role=current_user.role.value,
        details=f"Updated wallet association",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return wallet


@router.delete("/{user_id}/wallets/{wallet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_wallet(
    user_id: int,
    wallet_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(
        select(WalletAssociation).where(WalletAssociation.id == wallet_id, WalletAssociation.user_id == user_id)
    )
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet association not found")

    was_primary = wallet.is_primary
    await db.delete(wallet)
    await db.commit()

    # If we deleted the primary wallet, update user's main wallet_address
    if was_primary:
        user = await db.execute(select(User).where(User.id == user_id))
        user = user.scalar_one_or_none()
        if user:
            # Find another primary wallet or set to None
            remaining = await db.execute(
                select(WalletAssociation).where(WalletAssociation.user_id == user_id).limit(1)
            )
            remaining_wallet = remaining.scalar_one_or_none()
            user.wallet_address = remaining_wallet.wallet_address if remaining_wallet else None
            await db.commit()

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="WALLET_REMOVED",
        resource_type="WALLET",
        resource_id=str(wallet_id),
        role=current_user.role.value,
        details=f"Removed wallet association",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )