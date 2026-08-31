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
ADMIN_PASSWORD = "Admin@123"
MANAGER_PASSWORD = "Manager@123"
AUDITOR_PASSWORD = "Auditor@123"
USER_PASSWORD = "User@123"

async def seed_database():
    """Seed the database with demo data."""
    
    # Use test database URL or default
    database_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    if "test" not in database_url:
        database_url = database_url.replace("securechain", "securechain_test")
    
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session_maker() as db:
        print("🌱 Starting database seeding...")
        
        # Check if already seeded
        existing_admin = await db.execute(
            User.__table__.select().where(User.email == "admin@securechain.local")
        )
        if existing_admin.scalar_one_or_none():
            print("⚠️  Database already seeded. Skipping...")
            return
        
        # Create demo users
        print("👥 Creating demo users...")
        
        # Admin user
        admin = User(
            email="admin@securechain.local",
            hashed_password=get_password_hash(ADMIN_PASSWORD),
            full_name="System Administrator",
            wallet_address="0x1234567890123456789012345678901234567890",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        
        # Manager user
        manager = User(
            email="manager@securechain.local",
            hashed_password=get_password_hash(MANAGER_PASSWORD),
            full_name="Asset Manager",
            wallet_address="0x2234567890123456789012345678901234567890",
            role=UserRole.MANAGER,
            is_active=True,
            is_verified=True,
        )
        db.add(manager)
        
        # Auditor user
        auditor = User(
            email="auditor@securechain.local",
            hashed_password=get_password_hash(AUDITOR_PASSWORD),
            full_name="Compliance Auditor",
            wallet_address="0x3234567890123456789012345678901234567890",
            role=UserRole.AUDITOR,
            is_active=True,
            is_verified=True,
        )
        db.add(auditor)
        
        # Regular users
        users = []
        for i in range(1, 6):
            user = User(
                email=f"user{i}@securechain.local",
                hashed_password=get_password_hash(USER_PASSWORD),
                full_name=f"Demo User {i}",
                wallet_address=f"0x{str(i+3).zfill(2)}34567890123456789012345678901234567890",
                role=UserRole.USER,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            users.append(user)
        
        await db.commit()
        await db.refresh(admin)
        await db.refresh(manager)
        await db.refresh(auditor)
        for user in users:
            await db.refresh(user)
        
        print(f"✅ Created {len(users) + 3} users")
        
        # Create DIDs for all users
        print("🔑 Creating DIDs...")
        import hashlib
        import secrets
        
        all_users = [admin, manager, auditor] + users
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
        print(f"✅ Created {len(all_users)} DIDs")
        
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
        print("✅ Verified admin DID")
        
        # Create sample assets
        print("📦 Creating sample assets...")
        
        asset_data = [
            {
                "asset_id": "LAPTOP-001",
                "name": "MacBook Pro 16 M3",
                "description": "Apple MacBook Pro 16-inch with M3 Max chip, 64GB RAM, 2TB SSD",
                "category": "Equipment",
                "metadata_uri": "ipfs://QmLaptopMetadata123",
                "creator_id": admin.id,
                "owner_id": users[0].id,
            },
            {
                "asset_id": "VEHICLE-001",
                "name": "Tesla Model S Plaid",
                "description": "2024 Tesla Model S Plaid, 1020 HP, 390 mile range",
                "category": "Vehicle",
                "metadata_uri": "ipfs://QmVehicleMetadata456",
                "creator_id": admin.id,
                "owner_id": users[1].id,
            },
            {
                "asset_id": "DOC-001",
                "name": "Property Deed - 123 Main St",
                "description": "Legal property deed for commercial building",
                "category": "Document",
                "metadata_uri": "ipfs://QmDocumentMetadata789",
                "creator_id": admin.id,
                "owner_id": users[2].id,
            },
            {
                "asset_id": "ART-001",
                "name": "Digital Artwork #42",
                "description": "Generative art piece from Algorithm Series",
                "category": "Art",
                "metadata_uri": "ipfs://QmArtMetadata999",
                "creator_id": admin.id,
                "owner_id": users[3].id,
            },
            {
                "asset_id": "EQUIP-001",
                "name": "Industrial 3D Printer",
                "description": "Stratasys F900 Industrial 3D Printer",
                "category": "Equipment",
                "metadata_uri": "ipfs://QmEquipMetadata111",
                "creator_id": admin.id,
                "owner_id": users[4].id,
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
                details=f"Minted asset {asset_info['name']} for {asset_info['owner_id']}",
            )
            db.add(audit_log)
        
        await db.commit()
        print(f"✅ Created {len(asset_data)} assets")
        
        # Create a sample transfer
        print("🔄 Creating sample transfer...")
        
        # Get first asset
        asset1 = await db.execute(
            Asset.__table__.select().where(Asset.token_id == 1)
        )
        asset1 = asset1.scalar_one()
        
        transfer = Transfer(
            asset_id=asset1.id,
            initiator_id=users[0].id,
            recipient_id=users[1].id,
            from_address=users[0].wallet_address,
            to_address=users[1].wallet_address,
            status=TransferStatus.COMPLETED,
            blockchain_tx_hash="0x" + "c" * 64,
            blockchain_block_number=10,
            completed_at=datetime.utcnow(),
        )
        db.add(transfer)
        
        # Update asset ownership
        asset1.owner_id = users[1].id
        asset1.status = AssetStatus.TRANSFERRED
        asset1.blockchain_tx_hash = "0x" + "c" * 64
        asset1.blockchain_block_number = 10
        
        # Audit logs
        audit_log = AuditLog(
            actor_id=users[0].id,
            actor_address=users[0].wallet_address,
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
        print("✅ Created sample transfer")
        
        # Create additional audit logs
        print("📋 Creating audit logs...")
        
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
                "resource_id": str(auditor.id),
                "role": UserRole.ADMIN.value,
                "details": "Assigned AUDITOR role",
            },
            {
                "actor_id": users[0].id,
                "actor_address": users[0].wallet_address,
                "action": AuditAction.LOGIN,
                "resource_type": "USER",
                "resource_id": str(users[0].id),
                "role": UserRole.USER.value,
                "details": "User logged in",
            },
        ]
        
        for entry in audit_entries:
            audit_log = AuditLog(**entry)
            db.add(audit_log)
        
        await db.commit()
        print("✅ Created audit logs")
        
        print("\n" + "="*50)
        print("🎉 Database seeding completed successfully!")
        print("="*50)
        print("\n📋 Demo Credentials (DEVELOPMENT ONLY):")
        print(f"  Admin:    admin@securechain.local    / {ADMIN_PASSWORD}")
        print(f"  Manager:  manager@securechain.local  / {MANAGER_PASSWORD}")
        print(f"  Auditor:  auditor@securechain.local  / {AUDITOR_PASSWORD}")
        print(f"  Users:    user1-5@securechain.local  / {USER_PASSWORD}")
        print("\n⚠️  NEVER USE THESE IN PRODUCTION!")
        print("="*50)

if __name__ == "__main__":
    asyncio.run(seed_database())