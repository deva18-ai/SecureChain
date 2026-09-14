"""
SecureChain Demo Data Seed Script
==================================

This script populates the database with demo users, DIDs, and assets
for testing the complete workflow including transfers and approvals.

Run this script AFTER the database is set up and blockchain is running.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from app.database import async_session_maker
from app.models import User, DID, Asset, Transfer
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Demo Users Configuration
DEMO_USERS = [
    {
        "full_name": "Admin Owner",
        "email": "admin@securechain.local",
        "password": "Admin@123",
        "role": "ADMIN",
        "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",  # Hardhat account #0
    },
    {
        "full_name": "Sarah Manager",
        "email": "manager@securechain.local",
        "password": "Manager@123",
        "role": "MANAGER",
        "wallet_address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",  # Hardhat account #1
    },
    {
        "full_name": "Alex Auditor",
        "email": "auditor@securechain.local",
        "password": "Auditor@123",
        "role": "AUDITOR",
        "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",  # Hardhat account #2
    },
    {
        "full_name": "Priya Sharma",
        "email": "priya@securechain.local",
        "password": "User@123",
        "role": "USER",
        "wallet_address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",  # Hardhat account #3
    },
    {
        "full_name": "Rahul Kumar",
        "email": "rahul@securechain.local",
        "password": "User@123",
        "role": "USER",
        "wallet_address": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",  # Hardhat account #4
    },
    {
        "full_name": "Ananya Rao",
        "email": "ananya@securechain.local",
        "password": "User@123",
        "role": "USER",
        "wallet_address": "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",  # Hardhat account #5
    },
    {
        "full_name": "Vikram Singh",
        "email": "vikram@securechain.local",
        "password": "User@123",
        "role": "USER",
        "wallet_address": "0x976EA74026E726554dB657fA54763abd0C3a0aa9",  # Hardhat account #6
    },
]

# Demo DIDs Configuration
DEMO_DIDS = [
    {
        "user_email": "admin@securechain.local",
        "did": "did:securechain:admin:001",
        "identity_hash": "0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
        "is_verified": True,
    },
    {
        "user_email": "manager@securechain.local",
        "did": "did:securechain:manager:001",
        "identity_hash": "0xb2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1",
        "is_verified": True,
    },
    {
        "user_email": "auditor@securechain.local",
        "did": "did:securechain:auditor:001",
        "identity_hash": "0xc3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2",
        "is_verified": True,
    },
    {
        "user_email": "priya@securechain.local",
        "did": "did:securechain:user:priya001",
        "identity_hash": "0xd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3",
        "is_verified": True,
    },
    {
        "user_email": "rahul@securechain.local",
        "did": "did:securechain:user:rahul001",
        "identity_hash": "0xe5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4",
        "is_verified": True,
    },
    {
        "user_email": "ananya@securechain.local",
        "did": "did:securechain:user:ananya001",
        "identity_hash": "0xf6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5",
        "is_verified": True,
    },
    {
        "user_email": "vikram@securechain.local",
        "did": "did:securechain:user:vikram001",
        "identity_hash": "0xg7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6",
        "is_verified": True,
    },
]

# Demo Assets Configuration
DEMO_ASSETS = [
    {
        "asset_id": "SC-LAPTOP-001",
        "name": "Dell Latitude 5420",
        "category": "Laptop",
        "description": "Intel i7, 16GB RAM, 512GB SSD",
        "metadata_uri": "ipfs://QmLaptop001aaabbbcccddd",
        "owner_email": "priya@securechain.local",
        "status": "ACTIVE",
    },
    {
        "asset_id": "SC-LAPTOP-002",
        "name": "HP EliteBook 840",
        "category": "Laptop",
        "description": "Intel i5, 8GB RAM, 256GB SSD",
        "metadata_uri": "ipfs://QmLaptop002eeeffggghhhiii",
        "owner_email": "rahul@securechain.local",
        "status": "ACTIVE",
    },
    {
        "asset_id": "SC-MOBILE-001",
        "name": "iPhone 14 Pro",
        "category": "Mobile",
        "description": "256GB, Space Black",
        "metadata_uri": "ipfs://QmMobile001jjjkkklllmmmnnn",
        "owner_email": "ananya@securechain.local",
        "status": "ACTIVE",
    },
    {
        "asset_id": "SC-SERVER-001",
        "name": "Dell PowerEdge R740",
        "category": "Server",
        "description": "Dual Xeon, 128GB RAM, 2TB SSD",
        "metadata_uri": "ipfs://QmServer001ooopppqqqrrrsss",
        "owner_email": "vikram@securechain.local",
        "status": "ACTIVE",
    },
    {
        "asset_id": "SC-LAPTOP-003",
        "name": "Lenovo ThinkPad X1",
        "category": "Laptop",
        "description": "Intel i7, 32GB RAM, 1TB SSD",
        "metadata_uri": "ipfs://QmLaptop003tttuuuvvvwwwxxx",
        "owner_email": None,  # Unassigned
        "status": "ACTIVE",
    },
    {
        "asset_id": "SC-MOBILE-002",
        "name": "Samsung Galaxy S23",
        "category": "Mobile",
        "description": "512GB, Phantom Black",
        "metadata_uri": "ipfs://QmMobile002yyyzzz111222333",
        "owner_email": None,  # Unassigned
        "status": "ACTIVE",
    },
]


async def seed_demo_data():
    """Seed the database with demo data."""
    
    print("\n" + "="*60)
    print("🌱 SecureChain Demo Data Seeding")
    print("="*60 + "\n")
    
    async with async_session_maker() as session:
        try:
            # Step 1: Create Users
            print("👥 Creating demo users...")
            user_map = {}
            
            for user_data in DEMO_USERS:
                # Check if user exists
                from sqlalchemy import select
                result = await session.execute(
                    select(User).where(User.email == user_data["email"])
                )
                existing_user = result.scalar_one_or_none()
                
                if existing_user:
                    print(f"   🔄 Updating existing user: {user_data['email']}")

                    existing_user.full_name = user_data["full_name"]
                    existing_user.hashed_password = pwd_context.hash(user_data["password"])
                    existing_user.role = user_data["role"]
                    existing_user.wallet_address = user_data["wallet_address"]
                    existing_user.is_active = True

                    user_map[user_data["email"]] = existing_user
                    continue
                
                # Create new user
                user = User(
                    full_name=user_data["full_name"],
                    email=user_data["email"],
                    hashed_password=pwd_context.hash(user_data["password"]),
                    role=user_data["role"],
                    wallet_address=user_data["wallet_address"],
                    is_active=True,
                )
                session.add(user)
                await session.flush()
                user_map[user_data["email"]] = user
                print(f"   ✅ Created: {user_data['full_name']} ({user_data['role']})")
            
            await session.commit()
            print(f"\n✅ {len(user_map)} users ready\n")
            
            # Step 2: Create DIDs
            print("🔑 Creating digital identities (DIDs)...")
            
            for did_data in DEMO_DIDS:
                user = user_map.get(did_data["user_email"])
                if not user:
                    print(f"   ⚠️  User not found for {did_data['user_email']}")
                    continue
                
                # Check if DID exists
                result = await session.execute(
                    select(DID).where(DID.user_id == user.id)
                )
                existing_did = result.scalar_one_or_none()
                
                if existing_did:
                    print(f"   ⚠️  DID already exists for: {did_data['user_email']}")
                    continue
                
                # Create new DID
                did = DID(
                    user_id=user.id,
                    did=did_data["did"],
                    identity_hash=did_data["identity_hash"],
                    is_verified=did_data["is_verified"],
                    verified_at=datetime.utcnow() if did_data["is_verified"] else None,
                )
                session.add(did)
                print(f"   ✅ Created DID: {did_data['did']}")
            
            await session.commit()
            print(f"\n✅ DIDs created successfully\n")
            
            # Step 3: Create Assets
            print("📦 Creating demo assets...")
            
            for asset_data in DEMO_ASSETS:
                # Check if asset exists
                result = await session.execute(
                    select(Asset).where(Asset.asset_id == asset_data["asset_id"])
                )
                existing_asset = result.scalar_one_or_none()
                
                if existing_asset:
                    print(f"   ⚠️  Asset already exists: {asset_data['asset_id']}")
                    continue
                
                # Get owner if specified
                owner_id = None
                if asset_data["owner_email"]:
                    owner = user_map.get(asset_data["owner_email"])
                    if owner:
                        owner_id = owner.id
                
                # Create new asset
                asset = Asset(
                    asset_id=asset_data["asset_id"],
                    name=asset_data["name"],
                    category=asset_data["category"],
                    description=asset_data["description"],
                    metadata_uri=asset_data["metadata_uri"],
                    owner_id=owner_id,
                    status=asset_data["status"],
                    blockchain_tx_hash=f"0xdemo{asset_data['asset_id'].replace('-', '').lower()}abc123",
                )
                session.add(asset)
                owner_name = user_map.get(asset_data["owner_email"]).full_name if asset_data["owner_email"] else "Unassigned"
                print(f"   ✅ Created: {asset_data['name']} → {owner_name}")
            
            await session.commit()
            print(f"\n✅ Assets created successfully\n")
            
            print("="*60)
            print("🎉 Demo Data Seeded Successfully!")
            print("="*60 + "\n")
            
            # Print summary
            print("📊 DEMO ACCOUNTS SUMMARY")
            print("-" * 60)
            print("\n🔐 Login Credentials:")
            print("-" * 60)
            for user_data in DEMO_USERS:
                print(f"\n{user_data['role']:8} | {user_data['email']:30}")
                print(f"         | Password: {user_data['password']}")
                print(f"         | Name: {user_data['full_name']}")
            
            print("\n" + "-" * 60)
            print("\n📦 Assets Created:")
            print("-" * 60)
            for asset_data in DEMO_ASSETS:
                owner = asset_data["owner_email"] or "Unassigned"
                print(f"\n{asset_data['asset_id']:16} | {asset_data['name']}")
                print(f"{'':16} | Category: {asset_data['category']}")
                print(f"{'':16} | Assigned to: {owner}")
            
            print("\n" + "="*60)
            print("\n🚀 READY TO TEST!")
            print("="*60)
            print("\nTesting Workflow:")
            print("1. Login as: manager@securechain.local (Manager@123)")
            print("2. Go to Assets page")
            print("3. Click 'Request Transfer'")
            print("4. Select an asset and recipient")
            print("5. Submit request")
            print("6. Login as: admin@securechain.local (Admin@123)")
            print("7. Go to Requests page")
            print("8. Approve or Reject the pending request")
            print("9. View blockchain transaction and audit trail")
            print("\n" + "="*60 + "\n")
            
        except Exception as e:
            print(f"\n❌ Error seeding data: {str(e)}")
            import traceback
            traceback.print_exc()
            await session.rollback()
            raise


async def clear_demo_data():
    """Clear all demo data (for clean re-seeding)."""
    
    print("\n" + "="*60)
    print("🗑️  Clearing Demo Data")
    print("="*60 + "\n")
    
    async with async_session_maker() as session:
        try:
            from sqlalchemy import delete
            
            # Delete in reverse order of foreign keys
            print("Deleting transfers...")
            await session.execute(delete(Transfer))
            
            print("Deleting assets...")
            await session.execute(delete(Asset))
            
            print("Deleting DIDs...")
            await session.execute(delete(DID))
            
            print("Deleting users...")
            demo_emails = [u["email"] for u in DEMO_USERS]
            await session.execute(
                delete(User).where(User.email.in_(demo_emails))
            )
            
            await session.commit()
            print("\n✅ Demo data cleared successfully\n")
            
        except Exception as e:
            print(f"\n❌ Error clearing data: {str(e)}")
            await session.rollback()
            raise


async def main():
    """Main entry point."""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--clear":
        await clear_demo_data()
    else:
        await seed_demo_data()


if __name__ == "__main__":
    asyncio.run(main())
