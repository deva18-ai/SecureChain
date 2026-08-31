from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, DID, Asset, AssetStatus, Transfer, TransferStatus, AuditLog, AuditAction
from app.auth import get_current_active_user
from app.schemas import DashboardStats
from app.services.blockchain import BlockchainService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # Total users
    total_users = await db.scalar(select(func.count(User.id))) or 0

    # Verified identities
    verified_identities = await db.scalar(select(func.count(DID.id)).where(DID.verified == True)) or 0

    # Total assets
    total_assets = await db.scalar(select(func.count(Asset.id))) or 0

    # Active transfers (pending)
    active_transfers = await db.scalar(
        select(func.count(Transfer.id)).where(Transfer.status == TransferStatus.PENDING)
    ) or 0

    # Blockchain transactions (from audit logs with tx hash)
    blockchain_transactions = await db.scalar(
        select(func.count(AuditLog.id)).where(AuditLog.blockchain_tx_hash.isnot(None))
    ) or 0

    # Total audit events
    audit_events = await db.scalar(select(func.count(AuditLog.id))) or 0

    # Role distribution
    role_dist_result = await db.execute(
        select(User.role, func.count(User.id)).group_by(User.role)
    )
    role_distribution = {row[0].value: row[1] for row in role_dist_result.all()}

    # Recent activity (last 10 audit logs)
    recent_activity_result = await db.execute(
        select(AuditLog)
        .options(selectinload(AuditLog.actor))
        .order_by(desc(AuditLog.created_at))
        .limit(10)
    )
    recent_logs = recent_activity_result.scalars().all()

    recent_activity = []
    for log in recent_logs:
        actor_name = log.actor.full_name if log.actor else (log.actor_address or "System")
        recent_activity.append({
            "action": log.action.value,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "actor": actor_name,
            "created_at": log.created_at.isoformat(),
        })

    # Blockchain status
    blockchain_service = BlockchainService()
    blockchain_status = await blockchain_service.get_status()

    return DashboardStats(
        total_users=total_users,
        verified_identities=verified_identities,
        total_assets=total_assets,
        active_transfers=active_transfers,
        blockchain_transactions=blockchain_transactions,
        audit_events=audit_events,
        role_distribution=role_distribution,
        recent_activity=recent_activity,
    )