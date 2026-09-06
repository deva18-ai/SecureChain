from datetime import datetime
from typing import List, Optional, TypeVar
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, Asset, AssetStatus, Asset as AssetModel, AIAssetProposal, AIAssetProposalStatus
from app.schemas import (
    AssetCreate,
    AssetUpdate,
    AssetResponse,
    AssetWithDetails,
    PaginatedResponse,
    AIAssetProposalCreate,
    AIAssetProposalUpdate,
    AIAssetProposalReview,
    AIAssetProposalResponse,
    AIAssetProposalWithDetails,
)
from app.auth import get_current_active_user, require_admin, require_admin_or_manager
from app.services.audit import AuditService
from app.services.blockchain import BlockchainService

router = APIRouter(prefix="/assets", tags=["Digital Assets (NFTs)"])

AssetListResponse = PaginatedResponse[AssetWithDetails]


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
    asset.blockchain_tx_status = "PENDING"
    try:
        blockchain_service = BlockchainService()
        token_id = await blockchain_service.mint_asset(
            asset_id=asset.asset_id,
            name=asset.name,
            description=asset.description or "",
            category=asset.category,
            metadata_uri=asset.metadata_uri,
            initial_assignee=owner.wallet_address or "0x" + "0" * 40,
        )
        if token_id:
            asset.token_id = token_id
            receipt = await blockchain_service.get_transaction_receipt_by_event(
                "AssetMinted", token_id
            )
            if receipt:
                blockchain_tx_hash = receipt.transactionHash.hex()
                blockchain_block_number = receipt.blockNumber
                asset.blockchain_tx_status = "CONFIRMED"
                asset.blockchain_network = "Ethereum Sepolia"
                asset.contract_address = blockchain_service.contract_address
    except Exception as e:
        asset.blockchain_tx_status = "FAILED"

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


@router.get("", response_model=AssetListResponse)
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
        selectinload(Asset.creator), selectinload(Asset.owner), selectinload(Asset.transfers)
    )

    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        query = query.where(Asset.owner_id == current_user.id)

    if status:
        query = query.where(Asset.status == status)
    if category:
        query = query.where(Asset.category == category)
    if owner_id and current_user.role in [UserRole.ADMIN, UserRole.MANAGER]:
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

    return AssetListResponse(
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

    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and asset.owner_id != current_user.id:
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
        action="ASSET_UPDATED",
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
    asset.blockchain_tx_status = "PENDING"
    try:
        blockchain_service = BlockchainService()
        tx_hash = await blockchain_service.assign_asset(
            token_id=asset.token_id,
            to_address=new_owner.wallet_address,
        )
        blockchain_tx_hash = tx_hash
        if tx_hash:
            receipt = await blockchain_service.get_transaction_receipt(tx_hash)
            if receipt:
                blockchain_block_number = receipt.blockNumber
                asset.blockchain_tx_status = "CONFIRMED"
                asset.blockchain_network = "Ethereum Sepolia"
                asset.contract_address = blockchain_service.contract_address
    except Exception as e:
        asset.blockchain_tx_status = "FAILED"
        raise HTTPException(status_code=500, detail=f"Blockchain assignment failed: {str(e)}")

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


@router.post("/{asset_id}/revoke", response_model=AssetResponse)
async def revoke_assignment(
    asset_id: int,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.status in [AssetStatus.BURNED, AssetStatus.FROZEN]:
        raise HTTPException(status_code=400, detail="Asset cannot be revoked in current state")

    if asset.owner_id is None:
        raise HTTPException(status_code=400, detail="Asset is not currently assigned")

    old_owner_id = asset.owner_id
    old_owner_address = None
    if old_owner_id:
        old_owner = await db.execute(select(User).where(User.id == old_owner_id))
        old_owner = old_owner.scalar_one_or_none()
        if old_owner:
            old_owner_address = old_owner.wallet_address

    blockchain_tx_hash = None
    blockchain_block_number = None
    asset.blockchain_tx_status = "PENDING"
    try:
        blockchain_service = BlockchainService()
        tx_hash = await blockchain_service.revoke_assignment(
            token_id=asset.token_id,
        )
        blockchain_tx_hash = tx_hash
        if tx_hash:
            receipt = await blockchain_service.get_transaction_receipt(tx_hash)
            if receipt:
                blockchain_block_number = receipt.blockNumber
                asset.blockchain_tx_status = "CONFIRMED"
                asset.blockchain_network = "Ethereum Sepolia"
                asset.contract_address = blockchain_service.contract_address
    except Exception as e:
        asset.blockchain_tx_status = "FAILED"
        raise HTTPException(status_code=500, detail=f"Blockchain revocation failed: {str(e)}")

    asset.owner_id = None
    asset.status = AssetStatus.ACTIVE
    asset.blockchain_tx_hash = blockchain_tx_hash
    asset.blockchain_block_number = blockchain_block_number
    await db.commit()
    await db.refresh(asset)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_REVOKED",
        resource_type="ASSET",
        resource_id=str(asset.token_id),
        role=current_user.role.value,
        blockchain_tx_hash=blockchain_tx_hash,
        blockchain_block_number=blockchain_block_number,
        details=f"Revoked asset {asset.name} from user {old_owner_id}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return asset


AIAssetProposalListResponse = PaginatedResponse[AIAssetProposalWithDetails]


@router.get("/proposals", response_model=AIAssetProposalListResponse)
async def list_ai_proposals(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[AIAssetProposalStatus] = None,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
):
    query = select(AIAssetProposal).options(
        selectinload(AIAssetProposal.proposer),
        selectinload(AIAssetProposal.reviewer),
        selectinload(AIAssetProposal.suggested_owner),
        selectinload(AIAssetProposal.minted_asset),
    )

    if status:
        query = query.where(AIAssetProposal.status == status)

    query = query.order_by(desc(AIAssetProposal.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    proposals = result.scalars().all()

    items = []
    for proposal in proposals:
        items.append(
            AIAssetProposalWithDetails(
                id=proposal.id,
                proposed_by=proposal.proposed_by,
                asset_name=proposal.asset_name,
                description=proposal.description,
                category=proposal.category,
                metadata_uri=proposal.metadata_uri,
                suggested_initial_owner_id=proposal.suggested_initial_owner_id,
                ai_model=proposal.ai_model,
                ai_prompt=proposal.ai_prompt,
                ai_response=proposal.ai_response,
                status=proposal.status,
                reviewed_by=proposal.reviewed_by,
                reviewed_at=proposal.reviewed_at,
                review_notes=proposal.review_notes,
                minted_asset_id=proposal.minted_asset_id,
                created_at=proposal.created_at,
                updated_at=proposal.updated_at,
                proposer=proposal.proposer,
                reviewer=proposal.reviewer,
                suggested_owner=proposal.suggested_owner,
                minted_asset=proposal.minted_asset,
            )
        )

    return AIAssetProposalListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.post("/proposals", response_model=AIAssetProposalResponse, status_code=status.HTTP_201_CREATED)
async def create_ai_proposal(
    request: AIAssetProposalCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    proposal = AIAssetProposal(
        proposed_by=current_user.id,
        asset_name=request.asset_name,
        description=request.description,
        category=request.category,
        metadata_uri=request.metadata_uri,
        suggested_initial_owner_id=request.suggested_initial_owner_id,
        ai_model=request.ai_model,
        ai_prompt=request.ai_prompt,
        ai_response=request.ai_response,
        status=AIAssetProposalStatus.PROPOSED,
    )
    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="AI_ASSET_PROPOSED",
        resource_type="AI_ASSET_PROPOSAL",
        resource_id=str(proposal.id),
        role=current_user.role.value,
        details=f"AI proposed asset: {proposal.asset_name}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return proposal


@router.get("/proposals/{proposal_id}", response_model=AIAssetProposalWithDetails)
async def get_ai_proposal(
    proposal_id: int,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIAssetProposal)
        .options(
            selectinload(AIAssetProposal.proposer),
            selectinload(AIAssetProposal.reviewer),
            selectinload(AIAssetProposal.suggested_owner),
            selectinload(AIAssetProposal.minted_asset),
        )
        .where(AIAssetProposal.id == proposal_id)
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    return AIAssetProposalWithDetails(
        id=proposal.id,
        proposed_by=proposal.proposed_by,
        asset_name=proposal.asset_name,
        description=proposal.description,
        category=proposal.category,
        metadata_uri=proposal.metadata_uri,
        suggested_initial_owner_id=proposal.suggested_initial_owner_id,
        ai_model=proposal.ai_model,
        ai_prompt=proposal.ai_prompt,
        ai_response=proposal.ai_response,
        status=proposal.status,
        reviewed_by=proposal.reviewed_by,
        reviewed_at=proposal.reviewed_at,
        review_notes=proposal.review_notes,
        minted_asset_id=proposal.minted_asset_id,
        created_at=proposal.created_at,
        updated_at=proposal.updated_at,
        proposer=proposal.proposer,
        reviewer=proposal.reviewer,
        suggested_owner=proposal.suggested_owner,
        minted_asset=proposal.minted_asset,
    )


@router.patch("/proposals/{proposal_id}", response_model=AIAssetProposalResponse)
async def update_ai_proposal(
    proposal_id: int,
    request: AIAssetProposalUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(AIAssetProposal).where(AIAssetProposal.id == proposal_id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if request.asset_name is not None:
        proposal.asset_name = request.asset_name
    if request.description is not None:
        proposal.description = request.description
    if request.category is not None:
        proposal.category = request.category
    if request.metadata_uri is not None:
        proposal.metadata_uri = request.metadata_uri
    if request.suggested_initial_owner_id is not None:
        proposal.suggested_initial_owner_id = request.suggested_initial_owner_id
    if request.status is not None:
        proposal.status = request.status
    if request.review_notes is not None:
        proposal.review_notes = request.review_notes

    await db.commit()
    await db.refresh(proposal)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="AI_ASSET_PROPOSAL_UPDATED",
        resource_type="AI_ASSET_PROPOSAL",
        resource_id=str(proposal.id),
        role=current_user.role.value,
        details=f"Updated AI asset proposal",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return proposal


@router.post("/proposals/{proposal_id}/review", response_model=AIAssetProposalResponse)
async def review_ai_proposal(
    proposal_id: int,
    request: AIAssetProposalReview,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(AIAssetProposal).where(AIAssetProposal.id == proposal_id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal.status not in [AIAssetProposalStatus.PROPOSED, AIAssetProposalStatus.DRAFT]:
        raise HTTPException(status_code=400, detail="Proposal cannot be reviewed in current state")

    if request.action == "approve":
        proposal.status = AIAssetProposalStatus.APPROVED
        
        # If approved, mint the asset
        if proposal.suggested_initial_owner_id:
            owner_result = await db.execute(select(User).where(User.id == proposal.suggested_initial_owner_id))
            owner = owner_result.scalar_one_or_none()
            if not owner or not owner.wallet_address:
                raise HTTPException(status_code=400, detail="Suggested owner not found or has no wallet")

            try:
                blockchain_service = BlockchainService()
                token_id = await blockchain_service.mint_asset(
                    asset_id=f"AI-{proposal.id}",
                    name=proposal.asset_name,
                    description=proposal.description or "",
                    category=proposal.category or "AI Generated",
                    metadata_uri=proposal.metadata_uri or "",
                    initial_assignee=owner.wallet_address,
                )
                if token_id:
                    asset = Asset(
                        token_id=token_id,
                        asset_id=f"AI-{proposal.id}",
                        name=proposal.asset_name,
                        description=proposal.description,
                        category=proposal.category,
                        metadata_uri=proposal.metadata_uri,
                        creator_id=current_user.id,
                        owner_id=proposal.suggested_initial_owner_id,
                        status=AssetStatus.ACTIVE,
                    )
                    db.add(asset)
                    await db.commit()
                    await db.refresh(asset)
                    
                    receipt = await blockchain_service.get_transaction_receipt_by_event("AssetMinted", token_id)
                    if receipt:
                        asset.blockchain_tx_hash = receipt.transactionHash.hex()
                        asset.blockchain_block_number = receipt.blockNumber
                        asset.blockchain_tx_status = "CONFIRMED"
                        asset.blockchain_network = "Ethereum Sepolia"
                        asset.contract_address = blockchain_service.contract_address
                        await db.commit()
                        await db.refresh(asset)
                    
                    proposal.minted_asset_id = asset.id
                    proposal.status = AIAssetProposalStatus.MINTED
            except Exception as e:
                proposal.status = AIAssetProposalStatus.REJECTED
                proposal.review_notes = f"Minting failed: {str(e)}"
                await db.commit()
                raise HTTPException(status_code=500, detail=f"Failed to mint asset from proposal: {str(e)}")
    elif request.action == "reject":
        proposal.status = AIAssetProposalStatus.REJECTED

    proposal.reviewed_by = current_user.id
    proposal.reviewed_at = datetime.utcnow()
    if request.review_notes:
        proposal.review_notes = request.review_notes

    await db.commit()
    await db.refresh(proposal)

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="AI_ASSET_PROPOSAL_REVIEWED",
        resource_type="AI_ASSET_PROPOSAL",
        resource_id=str(proposal.id),
        role=current_user.role.value,
        details=f"Reviewed AI proposal: {request.action}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return proposal