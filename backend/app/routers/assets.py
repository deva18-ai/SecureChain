from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, Asset, AssetStatus
from app.schemas import (
    AssetCreate,
    AssetUpdate,
    AssetResponse,
    AssetWithDetails,
    PaginatedResponse,
)
from app.auth import get_current_active_user, require_admin, require_admin_or_manager
from app.services.audit import AuditService
from app.services.blockchain import BlockchainService

router = APIRouter(prefix="/assets", tags=["Digital Assets (NFTs)"])


@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    request: AssetCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(User).where(User.id == request.initial_owner_id))
    owner = result.scalar_one_or_none()
    if not owner:
        raise HTTPException(status_code=404, detail="Initial owner not found")

    existing = await db.execute(select(Asset).where(Asset.asset_id == request.asset_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Asset ID already exists")

    asset = Asset(
        token_id=0,
        asset_id=request.asset_id,
        name=request.name,
        description=request.description,
        category=request.category,
        metadata_uri=request.metadata_uri,
        creator_id=current_user.id,
        owner_id=request.initial_owner_id,
        status=AssetStatus.ACTIVE,
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    blockchain_tx_hash = None
    blockchain_block_number = None
    token_id = None
    try:
        blockchain_service = BlockchainService()
        token_id = await blockchain_service.mint_asset(
            asset_id=asset.asset_id,
            name=asset.name,
            description=asset.description or "",
            category=asset.category,
            metadata_uri=asset.metadata_uri,
            initial_owner=owner.wallet_address or "0x" + "0" * 40,
        )
        if token_id:
            asset.token_id = token_id
            receipt = await blockchain_service.get_transaction_receipt_by_event(
                "AssetMinted", token_id
            )
            if receipt:
                blockchain_tx_hash = receipt.transactionHash.hex()
                blockchain_block_number = receipt.blockNumber
    except Exception as e:
        pass

    if blockchain_tx_hash:
        asset.blockchain_tx_hash = blockchain_tx_hash
        asset.blockchain_block_number = blockchain_block_number
        await db.commit()
        await db.refresh(asset)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_MINTED",
        resource_type="ASSET",
        resource_id=str(asset.token_id or asset.id),
        role=current_user.role.value,
        blockchain_tx_hash=blockchain_tx_hash,
        blockchain_block_number=blockchain_block_number,
        details=f"Minted asset {asset.name} (ID: {asset.asset_id}) for {owner.email}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return asset


@router.get("", response_model=PaginatedResponse)
async def list_assets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[AssetStatus] = None,
    category: Optional[str] = None,
    owner_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Asset).options(
        selectinload(Asset.creator), selectinload(Asset.owner)
    )

    if current_user.role not in [UserRole.ADMIN, UserRole.AUDITOR, UserRole.MANAGER]:
        query = query.where(Asset.owner_id == current_user.id)

    if status:
        query = query.where(Asset.status == status)
    if category:
        query = query.where(Asset.category == category)
    if owner_id and current_user.role in [UserRole.ADMIN, UserRole.AUDITOR, UserRole.MANAGER]:
        query = query.where(Asset.owner_id == owner_id)
    if search:
        query = query.where(
            (Asset.name.ilike(f"%{search}%"))
            | (Asset.asset_id.ilike(f"%{search}%"))
            | (Asset.category.ilike(f"%{search}%"))
        )

    query = query.order_by(desc(Asset.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    assets = result.scalars().all()

    items = []
    for asset in assets:
        items.append(
            AssetWithDetails(
                id=asset.id,
                token_id=asset.token_id,
                asset_id=asset.asset_id,
                name=asset.name,
                description=asset.description,
                category=asset.category,
                metadata_uri=asset.metadata_uri,
                creator_id=asset.creator_id,
                owner_id=asset.owner_id,
                status=asset.status,
                created_at=asset.created_at,
                updated_at=asset.updated_at,
                blockchain_tx_hash=asset.blockchain_tx_hash,
                blockchain_block_number=asset.blockchain_block_number,
                creator=asset.creator,
                owner=asset.owner,
                transfers_count=len(asset.transfers),
            )
        )

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{asset_id}", response_model=AssetWithDetails)
async def get_asset(
    asset_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Asset)
        .options(selectinload(Asset.creator), selectinload(Asset.owner), selectinload(Asset.transfers))
        .where(Asset.id == asset_id)
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if current_user.role not in [UserRole.ADMIN, UserRole.AUDITOR, UserRole.MANAGER] and asset.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this asset")

    return AssetWithDetails(
        id=asset.id,
        token_id=asset.token_id,
        asset_id=asset.asset_id,
        name=asset.name,
        description=asset.description,
        category=asset.category,
        metadata_uri=asset.metadata_uri,
        creator_id=asset.creator_id,
        owner_id=asset.owner_id,
        status=asset.status,
        created_at=asset.created_at,
        updated_at=asset.updated_at,
        blockchain_tx_hash=asset.blockchain_tx_hash,
        blockchain_block_number=asset.blockchain_block_number,
        creator=asset.creator,
        owner=asset.owner,
        transfers_count=len(asset.transfers),
    )


@router.patch("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: int,
    request: AssetUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if request.name is not None:
        asset.name = request.name
    if request.description is not None:
        asset.description = request.description
    if request.category is not None:
        asset.category = request.category
    if request.metadata_uri is not None:
        asset.metadata_uri = request.metadata_uri
    if request.status is not None:
        asset.status = request.status

    await db.commit()
    await db.refresh(asset)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_ALLOCATED",
        resource_type="ASSET",
        resource_id=str(asset.token_id),
        role=current_user.role.value,
        details=f"Updated asset metadata",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return asset


@router.post("/{asset_id}/allocate", response_model=AssetResponse)
async def allocate_asset(
    asset_id: int,
    new_owner_id: int,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.status != AssetStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Asset not available for allocation")

    result = await db.execute(select(User).where(User.id == new_owner_id))
    new_owner = result.scalar_one_or_none()
    if not new_owner:
        raise HTTPException(status_code=404, detail="New owner not found")

    if not new_owner.wallet_address:
        raise HTTPException(status_code=400, detail="New owner has no wallet address")

    old_owner_id = asset.owner_id
    old_owner_address = None
    if old_owner_id:
        old_owner = await db.execute(select(User).where(User.id == old_owner_id))
        old_owner = old_owner.scalar_one_or_none()
        if old_owner:
            old_owner_address = old_owner.wallet_address

    blockchain_tx_hash = None
    blockchain_block_number = None
    try:
        blockchain_service = BlockchainService()
        tx_hash = await blockchain_service.allocate_asset(
            token_id=asset.token_id,
            to_address=new_owner.wallet_address,
        )
        blockchain_tx_hash = tx_hash
        if tx_hash:
            receipt = await blockchain_service.get_transaction_receipt(tx_hash)
            if receipt:
                blockchain_block_number = receipt.blockNumber
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain allocation failed: {str(e)}")

    asset.owner_id = new_owner_id
    asset.status = AssetStatus.TRANSFERRED
    asset.blockchain_tx_hash = blockchain_tx_hash
    asset.blockchain_block_number = blockchain_block_number
    await db.commit()
    await db.refresh(asset)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_ALLOCATED",
        resource_type="ASSET",
        resource_id=str(asset.token_id),
        role=current_user.role.value,
        blockchain_tx_hash=blockchain_tx_hash,
        blockchain_block_number=blockchain_block_number,
        details=f"Allocated asset {asset.name} from user {old_owner_id} to {new_owner_id}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return asset


@router.post("/{asset_id}/transfer", response_model=AssetResponse)
async def transfer_asset(
    asset_id: int,
    new_owner_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.owner_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to transfer this asset")

    if asset.status in [AssetStatus.BURNED, AssetStatus.FROZEN]:
        raise HTTPException(status_code=400, detail="Asset cannot be transferred in current state")

    result = await db.execute(select(User).where(User.id == new_owner_id))
    new_owner = result.scalar_one_or_none()
    if not new_owner:
        raise HTTPException(status_code=404, detail="Recipient not found")

    if not new_owner.wallet_address:
        raise HTTPException(status_code=400, detail="Recipient has no wallet address")

    if not current_user.wallet_address:
        raise HTTPException(status_code=400, detail="You have no wallet address")

    old_owner_address = current_user.wallet_address

    blockchain_tx_hash = None
    blockchain_block_number = None
    try:
        blockchain_service = BlockchainService()
        tx_hash = await blockchain_service.transfer_asset(
            token_id=asset.token_id,
            from_address=current_user.wallet_address,
            to_address=new_owner.wallet_address,
        )
        blockchain_tx_hash = tx_hash
        if tx_hash:
            receipt = await blockchain_service.get_transaction_receipt(tx_hash)
            if receipt:
                blockchain_block_number = receipt.blockNumber
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain transfer failed: {str(e)}")

    asset.owner_id = new_owner_id
    asset.status = AssetStatus.TRANSFERRED
    asset.blockchain_tx_hash = blockchain_tx_hash
    asset.blockchain_block_number = blockchain_block_number
    await db.commit()
    await db.refresh(asset)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_TRANSFERRED",
        resource_type="ASSET",
        resource_id=str(asset.token_id),
        role=current_user.role.value,
        blockchain_tx_hash=blockchain_tx_hash,
        blockchain_block_number=blockchain_block_number,
        details=f"Transferred asset {asset.name} to {new_owner.email}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return asset