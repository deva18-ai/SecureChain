from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import AuditLog, AuditAction, User
from app.services.blockchain import BlockchainService


class AuditService:
    @staticmethod
    async def log_action(
        db: AsyncSession,
        actor_id: Optional[int],
        actor_address: Optional[str],
        action: str,
        resource_type: str,
        resource_id: str,
        role: Optional[str] = None,
        blockchain_tx_hash: Optional[str] = None,
        blockchain_block_number: Optional[int] = None,
        blockchain_verified: bool = False,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        try:
            audit_action = AuditAction(action)
        except ValueError:
            audit_action = AuditAction.USER_UPDATED

        log = AuditLog(
            actor_id=actor_id,
            actor_address=actor_address,
            action=audit_action,
            resource_type=resource_type,
            resource_id=resource_id,
            role=role,
            blockchain_tx_hash=blockchain_tx_hash,
            blockchain_block_number=blockchain_block_number,
            blockchain_verified=blockchain_verified,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log

    @staticmethod
    async def verify_on_blockchain(
        db: AsyncSession,
        tx_hash: str,
    ) -> bool:
        blockchain_service = BlockchainService()
        receipt = await blockchain_service.get_transaction_receipt(tx_hash)
        if not receipt:
            return False

        if receipt.status != 1:
            return False

        result = await db.execute(select(AuditLog).where(AuditLog.blockchain_tx_hash == tx_hash))
        log = result.scalar_one_or_none()
        if log:
            log.blockchain_verified = True
            log.blockchain_block_number = receipt.blockNumber
            await db.commit()
        return True

    @staticmethod
    async def verify_asset_ownership(
        db: AsyncSession,
        token_id: int,
        expected_owner: str,
    ) -> bool:
        blockchain_service = BlockchainService()
        asset = await blockchain_service.get_asset(token_id)
        if not asset:
            return False
        return asset.get("currentOwner", "").lower() == expected_owner.lower()

    @staticmethod
    async def verify_did_on_blockchain(
        db: AsyncSession,
        did: str,
    ) -> bool:
        blockchain_service = BlockchainService()
        identity = await blockchain_service.get_identity(did)
        if not identity:
            return False
        return identity.get("verified", False)