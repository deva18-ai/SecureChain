from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, BlockchainTransaction
from app.schemas import (
    BlockchainStatus,
    BlockchainTransactionResponse,
    PaginatedResponse,
)
from app.auth import get_current_active_user, require_auditor
from app.services.blockchain import BlockchainService

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])


@router.get("/status", response_model=BlockchainStatus)
async def get_blockchain_status(
    current_user: User = Depends(get_current_active_user),
):
    blockchain_service = BlockchainService()
    return await blockchain_service.get_status()


@router.get("/transaction/{tx_hash}", response_model=BlockchainTransactionResponse)
async def get_blockchain_transaction(
    tx_hash: str,
    current_user: User = Depends(require_auditor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BlockchainTransaction).where(BlockchainTransaction.tx_hash == tx_hash)
    )
    tx = result.scalar_one_or_none()

    if not tx:
        blockchain_service = BlockchainService()
        try:
            receipt = await blockchain_service.get_transaction_receipt(tx_hash)
            if receipt:
                tx_data = await blockchain_service.get_transaction(tx_hash)
                return BlockchainTransactionResponse(
                    id=0,
                    tx_hash=tx_hash,
                    block_number=receipt.blockNumber,
                    block_hash=receipt.blockHash.hex() if hasattr(receipt.blockHash, 'hex') else str(receipt.blockHash),
                    from_address=tx_data.get("from", "") if tx_data else "",
                    to_address=tx_data.get("to", "") if tx_data else "",
                    value=str(tx_data.get("value", 0)) if tx_data else "0",
                    gas_used=receipt.gasUsed if hasattr(receipt, 'gasUsed') else None,
                    gas_price=str(tx_data.get("gasPrice", 0)) if tx_data else None,
                    status=1 if receipt.status == 1 else 0,
                    contract_address=tx_data.get("to", "") if tx_data else None,
                    method_name=None,
                    event_data=None,
                    created_at=None,
                )
        except Exception:
            pass
        raise HTTPException(status_code=404, detail="Transaction not found")

    return tx


@router.get("/assets/{token_id}")
async def get_blockchain_asset(
    token_id: int,
    current_user: User = Depends(get_current_active_user),
):
    blockchain_service = BlockchainService()
    asset = await blockchain_service.get_asset(token_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found on blockchain")
    return asset


@router.get("/transactions", response_model=PaginatedResponse)
async def list_blockchain_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    from_address: str = Query(None),
    contract_address: str = Query(None),
    current_user: User = Depends(require_auditor),
    db: AsyncSession = Depends(get_db),
):
    query = select(BlockchainTransaction)

    if from_address:
        query = query.where(BlockchainTransaction.from_address == from_address)
    if contract_address:
        query = query.where(BlockchainTransaction.contract_address == contract_address)

    query = query.order_by(desc(BlockchainTransaction.created_at))

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    transactions = result.scalars().all()

    return PaginatedResponse(
        items=transactions,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )