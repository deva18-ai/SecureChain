"""
SecureChain Realistic Demo Data Seed Script
===========================================

Creates realistic demo data for hackathon presentation including:
- Owner, Manager, and Employee users  
- Realistic assets (laptops, security tokens, devices)
- Audit logs
- Security events

Run AFTER database migration is complete.
"""

import asyncio
import sys
from pathlib import Path
import hashlib
import time

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from app.database import async_session_maker
from app.models import (
    User, DID, Asset, AuditLog, SecurityEvent,
    UserRole, AssetStatus, AuditAction, SecurityEventType, 
    SecurityEventSeverity, BlockchainTxStatus
)
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Demo credentials as specified by user
DEMO_USERS = [
    {
        "full_name": "Devavardhan MI",
        "email": "devavardhan.test@gmail.com",
        "password": "Owner@123",
        "role": UserRole.ADMIN,
        "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    },
    {
        "full_name": "Recipient Manager",
        "email": "recipient@test.com",
        "password": "Manager@123",
        "role": UserRole.MANAGER,
        "wallet_address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    },
    {
        "full_name": "Employee User",
        "email": "user1@securechain.com",
        "password": "User@123",
        "role": UserRole.USER,
        "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    },
    {
        "full_name": "Priya Sharma",
        "email": "priya@securechain.local",
        "password": "User@123",
        "role": UserRole.USER,
        "wallet_address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    },
    {
        "full_name": "Rahul Kumar",
        "email": "rahul@securechain.local",
        "password": "User@123",
        "role": UserRole.USER,
        "wallet_address": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    },
]

# Realistic demo assets
DEMO_ASSETS = [
    {
        "token_id": 1001,
        "asset_id": "SC-LAP-001",
        "name": "Company Laptop - Dell XPS 15",
        "description": "High-performance laptop for software development",
        "category": "IT Equipment",
        "metadata_uri": "ipfs://QmDemo1234LaptopMetadata",
        "status": AssetStatus.ACTIVE,
        "assign_to_email": "user1@securechain.com",
    },
    {
        "token_id": 1002,
        "asset_id": "SC-TOK-002",
        "name": "Security Access Token",
        "description": "Hardware security key for system access",
        "category": "Security",
        "metadata_uri": "ipfs://QmDemo5678TokenMetadata",
        "status": AssetStatus.ACTIVE,
        "assign_to_email": "priya@securechain.local",
    },
    {
        "token_id": 1003,
        "asset_id": "SC-DEV-003",
        "name": "Developer Workstation",
        "description": "MacBook Pro 16-inch for development",
        "category": "IT Equipment",
        "metadata_uri": "ipfs://QmDemoAbcdWorkstationMeta",
        "status": AssetStatus.ACTIVE,
        "assign_to_email": "rahul@securechain.local",
    },
    {
        "token_id": 1004,
        "asset_id": "SC-CARD-004",
        "name": "Building Access Card",
        "description": "RFID access card for main office building",
        "category": "Access Control",
        "metadata_uri": "ipfs://QmDemoXyzAccessCardMeta",
        "status": AssetStatus.ACTIVE,
        "assign_to_email": "user1@securechain.com",
    },
    {
        "token_id": 1005,
        "asset_id": "SC-BKP-005",
        "name": "Encrypted Backup Device",
        "description": "Portable encrypted SSD for secure backups",
        "category": "Data Security",
        "metadata_uri": "ipfs://QmDemoQrstuBackupMeta",
        "status": AssetStatus.ACTIVE,
        "assign_to_email": None,  # Unassigned
    },
]

async def seed_database():
    """Seed the database with realistic demo data."""
    
    print("\n" + "="*60)
    print("SecureChain Demo Data Seeding")
    print("="*60 + "\n")
    
    async with async_session_maker() as db:
        try:
            # 1. Create/Update Demo Users
            print("[1/5] Creating demo users...")
            user_map = {}
            
            for user_data in DEMO_USERS:
                result = await db.execute(
                    select(User).where(User.email == user_data["email"])
                )
                user = result.scalar_one_or_none()
                
                if user:
                    # Update existing user
                    user.hashed_password = pwd_context.hash(user_data["password"])
                    user.role = user_data["role"]
                    user.is_active = True
                    user.is_verified = True
                    print(f"  [OK] Updated user: {user_data['email']}")
                else:
                    # Create new user
                    user = User(
                        email=user_data["email"],
                        full_name=user_data["full_name"],
                        hashed_password=pwd_context.hash(user_data["password"]),
                        role=user_data["role"],
                        wallet_address=user_data.get("wallet_address"),
                        is_active=True,
                        is_verified=True,
                    )
                    db.add(user)
                    await db.flush()
                    print(f"  [OK] Created user: {user_data['email']}")
                
                user_map[user_data["email"]] = user
            
            await db.commit()
            
            # 2. Create DIDs for users
            print("\n[2/5] Creating DIDs...")
            for email, user in user_map.items():
                result = await db.execute(
                    select(DID).where(DID.user_id == user.id)
                )
                did = result.scalar_one_or_none()
                
                if not did:
                    timestamp = int(time.time() * 1000)
                    did_identifier = f"did:securechain:user:{user.id}:{timestamp}"
                    identity_data = f"{user.email}{user.wallet_address}{user.full_name}{timestamp}"
                    identity_hash = "0x" + hashlib.sha256(identity_data.encode()).hexdigest()
                    
                    did = DID(
                        user_id=user.id,
                        did=did_identifier,
                        wallet_address=user.wallet_address or "0x0000000000000000000000000000000000000000",
                        identity_hash=identity_hash,
                        verified=True,
                        verified_at=datetime.utcnow(),
                        blockchain_tx_status=BlockchainTxStatus.PENDING,
                    )
                    db.add(did)
                    print(f"  [OK] Created DID for: {email}")
            
            await db.commit()
            
            # 3. Create Demo Assets
            print("\n[3/5] Creating demo assets...")
            admin_user = user_map["devavardhan.test@gmail.com"]
            
            for asset_data in DEMO_ASSETS:
                result = await db.execute(
                    select(Asset).where(Asset.asset_id == asset_data["asset_id"])
                )
                asset = result.scalar_one_or_none()
                
                if not asset:
                    owner = None
                    if asset_data.get("assign_to_email"):
                        owner = user_map.get(asset_data["assign_to_email"])
                    
                    asset = Asset(
                        token_id=asset_data["token_id"],
                        asset_id=asset_data["asset_id"],
                        name=asset_data["name"],
                        description=asset_data["description"],
                        category=asset_data["category"],
                        metadata_uri=asset_data["metadata_uri"],
                        creator_id=admin_user.id,
                        owner_id=owner.id if owner else None,
                        status=asset_data["status"],
                        blockchain_tx_status=BlockchainTxStatus.PENDING,
                        contract_address="0x5FbDB2315678afecb367f032d93F642f64180aa3",
                    )
                    db.add(asset)
                    assigned_to = asset_data.get("assign_to_email") or "Unassigned"
                    print(f"  [OK] Created asset: {asset_data['asset_id']} -> {assigned_to}")
            
            await db.commit()
            
            # 4. Create Audit Logs
            print("\n[4/5] Creating audit logs...")
            audit_count = 0
            
            # Log user creation
            for email, user in user_map.items():
                audit = AuditLog(
                    actor_id=admin_user.id,
                    actor_address=admin_user.wallet_address,
                    action=AuditAction.USER_CREATED,
                    resource_type="USER",
                    resource_id=str(user.id),
                    role=admin_user.role.value,
                    details=f"User {user.full_name} created with role {user.role.value}",
                    created_at=datetime.utcnow() - timedelta(hours=24),
                )
                db.add(audit)
                audit_count += 1
            
            # Log asset creation
            for asset_data in DEMO_ASSETS:
                audit = AuditLog(
                    actor_id=admin_user.id,
                    actor_address=admin_user.wallet_address,
                    action=AuditAction.ASSET_MINTED,
                    resource_type="ASSET",
                    resource_id=asset_data["asset_id"],
                    role=admin_user.role.value,
                    details=f"Asset {asset_data['name']} minted",
                    created_at=datetime.utcnow() - timedelta(hours=12),
                )
                db.add(audit)
                audit_count += 1
            
            print(f"  [OK] Created {audit_count} audit log entries")
            await db.commit()
            
            print("\n" + "="*60)
            print("Demo Data Seeding Completed Successfully!")
            print("="*60)
            print("\nDemo Credentials:")
            print("-"*60)
            for user_data in DEMO_USERS:
                print(f"  {user_data['role'].value:8} | {user_data['email']:35} | {user_data['password']}")
            print("-"*60)
            print("\n[OK] You can now login and test the complete workflow!\n")
            
        except Exception as e:
            await db.rollback()
            print(f"\n[ERROR] Seeding failed: {e}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == "__main__":
    asyncio.run(seed_database())
