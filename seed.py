#!/usr/bin/env python3
"""
Development Seed Script for SecureChain
Creates demo users and sample data for development/testing.

Usage:
    python seed.py

⚠️  FOR DEVELOPMENT ONLY - DO NOT RUN IN PRODUCTION
"""

import asyncio
import os
import sys
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.auth import get_password_hash
from app.models import (
    User, UserRole, DID, Asset, AssetStatus, 
    Transfer, TransferStatus, AuditLog, AuditAction
)

# Demo passwords (DEVELOPMENT ONLY)
DEMO_PASSWORD = "Demo@123"
OWNER_PASSWORD = "Owner@123"
MANAGER_PASSWORD = "Manager@123"
USER_PASSWORD = "User@123"

async def seed_database():
    """Seed the database with demo data."""
    
    # Use main database URL
    database_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session_maker() as db:
        print("[SEED] Starting database seeding...")
        
        # Check if already seeded
        existing_admin = await db.execute(
            User.__table__.select().where(User.email == "devavardhan.test@gmail.com")
        )
        if existing_admin.scalar_one_or_none():
            print("[SEED] Database already seeded. Skipping...")
            return
        
        # Create demo users
        print("[SEED] Creating demo users...")
        
        # Test Admin (ADMIN role)
        admin = User(
            email="devavardhan.test@gmail.com",
            hashed_password=get_password_hash(OWNER_PASSWORD),
            full_name="Test Admin",
            wallet_address="0x1234567890123456789012345678901234567890",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        
        # Asset Manager (MANAGER role)
        manager = User(
            email="recipient@test.com",
            hashed_password=get_password_hash(MANAGER_PASSWORD),
            full_name="Asset Manager",
            wallet_address="0x2234567890123456789012345678901234567890",
            role=UserRole.MANAGER,
            is_active=True,
            is_verified=True,
        )
        db.add(manager)
        
        # User One (USER role)
        user1 = User(
            email="user1@securechain.com",
            hashed_password=get_password_hash(USER_PASSWORD),
            full_name="User One",
            wallet_address="0x3234567890123456789012345678901234567890",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        db.add(user1)
        
        # User Two (USER role)
        user2 = User(
            email="user2@securechain.com",
            hashed_password=get_password_hash(USER_PASSWORD),
            full_name="User Two",
            wallet_address="0x4234567890123456789012345678901234567890",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        db.add(user2)
        
        await db.commit()
        await db.refresh(admin)
        await db.refresh(manager)
        await db.refresh(user1)
        await db.refresh(user2)
        
        print(f"[SEED] Created 4 users")
        
        # Create DIDs for all users
        print("[SEED] Creating DIDs...")
        import hashlib
        import secrets
        
        all_users = [admin, manager, user1, user2]
        for user in all_users:
            did_str = f"did:securechain:{secrets.token_hex(16)}"
            wallet = user.wallet_address or "0x" + "0" * 40
            identity_hash = "0x" + hashlib.sha256(f"{wallet.lower()}{did_str}{secrets.token_hex(32)}".encode()).hexdigest()
            
            did = DID(
                did=did_str,
                user_id=user.id,
                wallet_address=wallet,
                identity_hash=identity_hash,
                verified=False,
            )
            db.add(did)
        
        await db.commit()
        print(f"[SEED] Created {len(all_users)} DIDs")
        
        # Verify admin's DID
        admin_did = await db.execute(
            DID.__table__.select().where(DID.user_id == admin.id)
        )
        admin_did = admin_did.scalar_one()
        admin_did.verified = True
        admin_did.verified_at = datetime.utcnow()
        admin_did.verification_tx_hash = "0x" + "a" * 64
        admin_did.blockchain_tx_hash = "0x" + "a" * 64
        admin_did.blockchain_block_number = 1
        
        # Create audit log for admin DID verification
        audit_log = AuditLog(
            actor_id=admin.id,
            actor_address=admin.wallet_address,
            action=AuditAction.IDENTITY_VERIFIED,
            resource_type="DID",
            resource_id=admin_did.did,
            role=UserRole.ADMIN.value,
            blockchain_tx_hash="0x" + "a" * 64,
            blockchain_block_number=1,
            blockchain_verified=True,
            details="Admin verified own DID on blockchain",
        )
        db.add(audit_log)
        
        await db.commit()
        print("[SEED] Verified admin DID")
        
        # Create sample assets
        print("[SEED] Creating sample assets...")
        
        asset_data = [
            {
                "asset_id": "SC-LAP-001",
                "name": "Dell Latitude 5440",
                "description": "Dell Latitude 5440 Laptop",
                "category": "Laptop",
                "metadata_uri": "ipfs://QmLaptopMetadata123",
                "creator_id": admin.id,
                "owner_id": user1.id,
            },
            {
                "asset_id": "SC-LAP-002",
                "name": "HP EliteBook 840",
                "description": "HP EliteBook 840 Laptop",
                "category": "Laptop",
                "metadata_uri": "ipfs://QmVehicleMetadata456",
                "creator_id": admin.id,
                "owner_id": user2.id,
            },
            {
                "asset_id": "SC-SRV-001",
                "name": "SecureChain Core Server",
                "description": "Core Server Infrastructure",
                "category": "Server",
                "metadata_uri": "ipfs://QmDocumentMetadata789",
                "creator_id": admin.id,
                "owner_id": None,  # Protected/unassigned asset
            },
        ]
        
        for i, asset_info in enumerate(asset_data):
            asset = Asset(
                token_id=i + 1,
                asset_id=asset_info["asset_id"],
                name=asset_info["name"],
                description=asset_info["description"],
                category=asset_info["category"],
                metadata_uri=asset_info["metadata_uri"],
                creator_id=asset_info["creator_id"],
                owner_id=asset_info["owner_id"],
                status=AssetStatus.ACTIVE,
                blockchain_tx_hash="0x" + "b" * 64,
                blockchain_block_number=2 + i,
            )
            db.add(asset)
            
            # Audit log for asset minting
            owner_str = str(asset_info["owner_id"]) if asset_info["owner_id"] else "unassigned"
            audit_log = AuditLog(
                actor_id=admin.id,
                actor_address=admin.wallet_address,
                action=AuditAction.ASSET_MINTED,
                resource_type="ASSET",
                resource_id=str(i + 1),
                role=UserRole.ADMIN.value,
                blockchain_tx_hash="0x" + "b" * 64,
                blockchain_block_number=2 + i,
                blockchain_verified=True,
                details=f"Minted asset {asset_info['name']} for {owner_str}",
            )
            db.add(audit_log)
        
        await db.commit()
        print(f"[SEED] Created {len(asset_data)} assets")
        
        # Create a sample transfer (from user1 to user2)
        print("[SEED] Creating sample transfer...")
        
        # Get first asset (user1's laptop)
        asset1 = await db.execute(
            Asset.__table__.select().where(Asset.token_id == 1)
        )
        asset1 = asset1.scalar_one()
        
        transfer = Transfer(
            asset_id=asset1.id,
            initiator_id=user1.id,
            recipient_id=user2.id,
            from_address=user1.wallet_address,
            to_address=user2.wallet_address,
            status=TransferStatus.COMPLETED,
            blockchain_tx_hash="0x" + "c" * 64,
            blockchain_block_number=10,
            completed_at=datetime.utcnow(),
        )
        db.add(transfer)
        
        # Update asset ownership
        asset1.owner_id = user2.id
        asset1.status = AssetStatus.TRANSFERRED
        asset1.blockchain_tx_hash = "0x" + "c" * 64
        asset1.blockchain_block_number = 10
        
        # Audit logs
        audit_log = AuditLog(
            actor_id=user1.id,
            actor_address=user1.wallet_address,
            action=AuditAction.ASSET_TRANSFERRED,
            resource_type="ASSET",
            resource_id="1",
            role=UserRole.USER.value,
            blockchain_tx_hash="0x" + "c" * 64,
            blockchain_block_number=10,
            blockchain_verified=True,
            details=f"Transferred asset {asset1.name} to User 2",
        )
        db.add(audit_log)
        
        await db.commit()
        print("[SEED] Created sample transfer")
        
        # Create additional audit logs
        print("[SEED] Creating audit logs...")
        
        audit_entries = [
            {
                "actor_id": admin.id,
                "actor_address": admin.wallet_address,
                "action": AuditAction.USER_CREATED,
                "resource_type": "USER",
                "resource_id": str(manager.id),
                "role": UserRole.ADMIN.value,
                "details": "Created Manager user",
            },
            {
                "actor_id": admin.id,
                "actor_address": admin.wallet_address,
                "action": AuditAction.ROLE_ASSIGNED,
                "resource_type": "USER",
                "resource_id": str(manager.id),
                "role": UserRole.ADMIN.value,
                "details": "Assigned MANAGER role",
            },
            {
                "actor_id": admin.id,
                "actor_address": admin.wallet_address,
                "action": AuditAction.ROLE_ASSIGNED,
                "resource_type": "USER",
                "resource_id": str(user1.id),
                "role": UserRole.ADMIN.value,
                "details": "Assigned USER role",
            },
            {
                "actor_id": admin.id,
                "actor_address": admin.wallet_address,
                "action": AuditAction.ROLE_ASSIGNED,
                "resource_type": "USER",
                "resource_id": str(user2.id),
                "role": UserRole.ADMIN.value,
                "details": "Assigned USER role",
            },
            {
                "actor_id": user1.id,
                "actor_address": user1.wallet_address,
                "action": AuditAction.LOGIN,
                "resource_type": "USER",
                "resource_id": str(user1.id),
                "role": UserRole.USER.value,
                "details": "User 1 logged in",
            },
        ]
        
        for entry in audit_entries:
            audit_log = AuditLog(**entry)
            db.add(audit_log)
        
        await db.commit()
        print("[SEED] Created audit logs")
        
        print("\n" + "="*50)
        print("[SEED] Database seeding completed successfully!")
        print("="*50)
        print("\n[SEED] Demo Credentials (DEVELOPMENT ONLY):")
        print(f"  Test Admin:     devavardhan.test@gmail.com     / {OWNER_PASSWORD}")
        print(f"  Asset Manager:  recipient@test.com              / {MANAGER_PASSWORD}")
        print(f"  User One:       user1@securechain.com          / {USER_PASSWORD}")
        print(f"  User Two:       user2@securechain.com          / {USER_PASSWORD}")
        print("\n[SEED] NEVER USE THESE IN PRODUCTION!")
        print("="*50)

if __name__ == "__main__":
    asyncio.run(seed_database())