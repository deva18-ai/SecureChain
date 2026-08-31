import hashlib
import secrets
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import DID, User
from app.services.blockchain import BlockchainService


class DIDService:
    @staticmethod
    def generate_did() -> str:
        identifier = secrets.token_hex(16)
        return f"did:securechain:{identifier}"

    @staticmethod
    def generate_identity_hash(wallet_address: str, did: str, extra_entropy: Optional[str] = None) -> str:
        if extra_entropy is None:
            extra_entropy = secrets.token_hex(32)
        data = f"{wallet_address.lower()}{did}{extra_entropy}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()

    @staticmethod
    async def create_did(
        db: AsyncSession,
        user: User,
        wallet_address: Optional[str] = None,
    ) -> DID:
        did_str = DIDService.generate_did()
        wallet = wallet_address or user.wallet_address or "0x" + "0" * 40
        identity_hash = DIDService.generate_identity_hash(wallet, did_str)

        existing = await db.execute(select(DID).where(DID.did == did_str))
        if existing.scalar_one_or_none():
            raise ValueError("DID already exists")

        existing = await db.execute(select(DID).where(DID.wallet_address == wallet))
        if existing.scalar_one_or_none():
            raise ValueError("Wallet already has a DID")

        did = DID(
            did=did_str,
            user_id=user.id,
            wallet_address=wallet,
            identity_hash=identity_hash,
            verified=False,
        )
        db.add(did)
        await db.commit()
        await db.refresh(did)

        if wallet != "0x" + "0" * 40:
            try:
                blockchain_service = BlockchainService()
                tx_hash = await blockchain_service.create_identity(did.did, did.wallet_address, did.identity_hash)
                if tx_hash:
                    did.blockchain_tx_hash = tx_hash
                    receipt = await blockchain_service.get_transaction_receipt(tx_hash)
                    if receipt:
                        did.blockchain_block_number = receipt.blockNumber
                    await db.commit()
                    await db.refresh(did)
            except Exception as e:
                pass

        return did

    @staticmethod
    async def verify_did(db: AsyncSession, did: DID) -> DID:
        if did.verified:
            raise ValueError("DID already verified")

        blockchain_service = BlockchainService()
        tx_hash = await blockchain_service.verify_identity(did.did)

        if tx_hash:
            did.verified = True
            did.verification_tx_hash = tx_hash
            did.blockchain_tx_hash = tx_hash
            receipt = await blockchain_service.get_transaction_receipt(tx_hash)
            if receipt:
                did.blockchain_block_number = receipt.blockNumber
            from datetime import datetime
            did.verified_at = datetime.utcnow()
            await db.commit()
            await db.refresh(did)

        return did

    @staticmethod
    async def get_user_did(db: AsyncSession, user_id: int) -> Optional[DID]:
        result = await db.execute(select(DID).where(DID.user_id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_did_by_id(db: AsyncSession, did_id: int) -> Optional[DID]:
        result = await db.execute(select(DID).where(DID.id == did_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_did_by_did_string(db: AsyncSession, did_str: str) -> Optional[DID]:
        result = await db.execute(select(DID).where(DID.did == did_str))
        return result.scalar_one_or_none()