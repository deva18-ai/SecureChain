"""
Seed demo data for SecureChain presentation
Creates realistic users, assets, audit logs, and security events
"""
import asyncio
import hashlib
import time
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker, init_db
from app.models import (
    User, UserRole, Asset, AssetStatus, AuditLog, AuditAction,
    SecurityEvent, SecurityEventType, SecurityEventSeverity,
    DID, BlockchainTxStatus
)
from app.auth import get_password_hash


async def seed_demo_data():
    """Seed comprehensive demo data"""
    print("Starting demo data seeding...")
    await init_db()
    
    async with async_session_maker() as db:
        # Check if demo users already exist
        result = await db.execute(
            select(User).where(User.email == "devavardhan.test@gmail.com")
        )
        owner_exists = result.scalar_one_or_none()
        
        if not owner_exists:
            print("Creating demo users...")
            # Create Owner
            owner = User(
                email="devavardhan.test@gmail.com",
                full_name="Devavardhan M I",
                hashed_password=get_password_hash("Owner@123"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
                wallet_address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            )
            db.add(owner)
            await db.flush()
            print(f"  Created Owner: {owner.email}")
        else:
            owner = owner_exists
            print(f"  Owner already exists: {owner.email}")
        
        # Check Manager
        result = await db.execute(
            select(User).where(User.email == "recipient@test.com")
        )
        manager_exists = result.scalar_one_or_none()
        
        if not manager_exists:
            manager = User(
                email="recipient@test.com",
                full_name="Priya Sharma",
                hashed_password=get_password_hash("Manager@123"),
                role=UserRole.MANAGER,
                is_active=True,
                is_verified=True,
                wallet_address="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
            )
            db.add(manager)
            await db.flush()
            print(f"  Created Manager: {manager.email}")
        else:
            manager = manager_exists
            print(f"  Manager already exists: {manager.email}")
        
        # Check Employee
        result = await db.execute(
            select(User).where(User.email == "user1@securechain.com")
        )
        employee_exists = result.scalar_one_or_none()
        
        if not employee_exists:
            employee = User(
                email="user1@securechain.com",
                full_name="Rahul Kumar",
                hashed_password=get_password_hash("User@123"),
                role=UserRole.USER,
                is_active=True,
                is_verified=True,
                wallet_address="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
            )
            db.add(employee)
            await db.flush()
            print(f"  Created Employee: {employee.email}")
        else:
            employee = employee_exists
            print(f"  Employee already exists: {employee.email}")
        
        # Create additional employees if they don't exist
        additional_employees = [
            ("ananya@securechain.local", "Ananya Rao", "0x90F79bf6EB2c4f870365E785982E1f101E93b906"),
            ("vikram@securechain.local", "Vikram Singh", "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"),
        ]
        
        employees = [employee]
        for email, name, wallet in additional_employees:
            result = await db.execute(select(User).where(User.email == email))
            existing = result.scalar_one_or_none()
            if not existing:
                emp = User(
                    email=email,
                    full_name=name,
                    hashed_password=get_password_hash("User@123"),
                    role=UserRole.USER,
                    is_active=True,
                    is_verified=True,
                    wallet_address=wallet
                )
                db.add(emp)
                await db.flush()
                employees.append(emp)
                print(f"  Created Employee: {email}")
            else:
                employees.append(existing)
        
        await db.commit()
        await db.refresh(owner)
        await db.refresh(manager)
        for emp in employees:
            await db.refresh(emp)
        
        # Create DIDs for users if they don't exist
        print("\nCreating DIDs...")
        for user in [owner, manager] + employees:
            result = await db.execute(
                select(DID).where(DID.user_id == user.id)
            )
            existing_did = result.scalar_one_or_none()
            
            if not existing_did:
                timestamp = int(time.time() * 1000)
                did_identifier = f"did:securechain:user:{user.id}:{timestamp}"
                identity_data = f"{user.email}{user.wallet_address}{user.full_name}{timestamp}"
                identity_hash = "0x" + hashlib.sha256(identity_data.encode()).hexdigest()
                
                did = DID(
                    user_id=user.id,
                    did=did_identifier,
                    wallet_address=user.wallet_address,
                    identity_hash=identity_hash,
                    verified=True,
                    verified_at=datetime.utcnow(),
                    blockchain_tx_hash=f"0x{''.join([format(i, '02x') for i in range(32)])}",
                    blockchain_block_number=1000 + user.id,
                    blockchain_tx_status=BlockchainTxStatus.CONFIRMED
                )
                db.add(did)
                print(f"  Created DID for {user.full_name}")
        
        await db.commit()
        
        # Create realistic assets
        print("\nCreating demo assets...")
        
        demo_assets = [
            {
                "asset_id": "SC-LAP-001",
                "name": "ThinkPad X1 Carbon",
                "description": "High-performance developer laptop with enhanced security features",
                "category": "IT Equipment",
                "owner": employees[0] if len(employees) > 0 else employee,
                "creator": owner,
            },
            {
                "asset_id": "SC-TOK-002",
                "name": "Security Access Token",
                "description": "Hardware security token for two-factor authentication",
                "category": "Security",
                "owner": manager,
                "creator": owner,
            },
            {
                "asset_id": "SC-DEV-003",
                "name": "Development Workstation",
                "description": "High-spec workstation for software development and testing",
                "category": "IT Equipment",
                "owner": employees[1] if len(employees) > 1 else employee,
                "creator": owner,
            },
            {
                "asset_id": "SC-CARD-004",
                "name": "Access Control Card",
                "description": "RFID access card for secure facility entry",
                "category": "Access Control",
                "owner": employees[2] if len(employees) > 2 else employee,
                "creator": owner,
            },
            {
                "asset_id": "SC-BKP-005",
                "name": "Encrypted Backup Drive",
                "description": "256-bit AES encrypted external drive for secure data backup",
                "category": "Data Security",
                "owner": manager,
                "creator": owner,
            },
        ]
        
        for idx, asset_data in enumerate(demo_assets):
            # Check if asset already exists
            result = await db.execute(
                select(Asset).where(Asset.asset_id == asset_data["asset_id"])
            )
            existing_asset = result.scalar_one_or_none()
            
            if not existing_asset:
                asset = Asset(
                    token_id=1000 + idx,
                    asset_id=asset_data["asset_id"],
                    name=asset_data["name"],
                    description=asset_data["description"],
                    category=asset_data["category"],
                    metadata_uri=f"ipfs://QmExample{idx}Hash/metadata.json",
                    creator_id=asset_data["creator"].id,
                    owner_id=asset_data["owner"].id,
                    status=AssetStatus.ACTIVE,
                    blockchain_tx_hash=f"0x{''.join([format((idx + 1) * 16 + i, '02x') for i in range(32)])}",
                    blockchain_block_number=2000 + idx,
                    blockchain_tx_status=BlockchainTxStatus.CONFIRMED,
                    blockchain_network="Hardhat Localhost",
                    contract_address="0x5FbDB2315678afecb367f032d93F642f64180aa3"
                )
                db.add(asset)
                print(f"  Created asset: {asset.name}")
        
        await db.commit()
        
        # Create audit logs
        print("\nCreating audit logs...")
        
        audit_actions = [
            {
                "actor": owner,
                "action": AuditAction.USER_CREATED,
                "resource_type": "USER",
                "resource_id": str(manager.id),
                "details": f"Manager user {manager.full_name} created",
                "hours_ago": 48
            },
            {
                "actor": owner,
                "action": AuditAction.USER_CREATED,
                "resource_type": "USER",
                "resource_id": str(employee.id),
                "details": f"Employee user {employee.full_name} created",
                "hours_ago": 36
            },
            {
                "actor": owner,
                "action": AuditAction.IDENTITY_CREATED,
                "resource_type": "DID",
                "resource_id": f"did:securechain:user:{employee.id}",
                "details": "Decentralized identifier created and verified on blockchain",
                "hours_ago": 36
            },
            {
                "actor": owner,
                "action": AuditAction.ASSET_MINTED,
                "resource_type": "ASSET",
                "resource_id": "SC-LAP-001",
                "details": "ThinkPad X1 Carbon laptop asset minted as NFT",
                "hours_ago": 24
            },
            {
                "actor": owner,
                "action": AuditAction.ASSET_ASSIGNED,
                "resource_type": "ASSET",
                "resource_id": "SC-LAP-001",
                "details": f"Asset assigned to {employees[0].full_name if len(employees) > 0 else employee.full_name}",
                "hours_ago": 24
            },
            {
                "actor": manager,
                "action": AuditAction.LOGIN,
                "resource_type": "USER",
                "resource_id": str(manager.id),
                "details": "Manager logged in",
                "hours_ago": 2
            },
            {
                "actor": employee,
                "action": AuditAction.LOGIN,
                "resource_type": "USER",
                "resource_id": str(employee.id),
                "details": "Employee logged in",
                "hours_ago": 1
            },
        ]
        
        for audit_data in audit_actions:
            created_at = datetime.utcnow() - timedelta(hours=audit_data["hours_ago"])
            
            audit = AuditLog(
                actor_id=audit_data["actor"].id,
                actor_address=audit_data["actor"].wallet_address,
                action=audit_data["action"],
                resource_type=audit_data["resource_type"],
                resource_id=audit_data["resource_id"],
                role=audit_data["actor"].role.value,
                details=audit_data["details"],
                blockchain_verified=True,
                created_at=created_at
            )
            db.add(audit)
        
        await db.commit()
        print("  Created audit log entries")
        
        # Create security events
        print("\nCreating security events...")
        
        security_events = [
            {
                "event_type": SecurityEventType.UNAUTHORIZED_API_ACCESS,
                "severity": SecurityEventSeverity.MEDIUM,
                "actor": employee,
                "resource_type": "API",
                "resource_id": "/api/v1/users",
                "reason": "Attempted to access admin-only user management endpoint",
                "hours_ago": 12,
                "resolved": True,
                "resolved_by": manager
            },
            {
                "event_type": SecurityEventType.REPEATED_FAILED_AUTH,
                "severity": SecurityEventSeverity.HIGH,
                "actor": None,
                "resource_type": "AUTH",
                "resource_id": "unknown@test.com",
                "reason": "5 failed login attempts from IP 192.168.1.100",
                "hours_ago": 8,
                "resolved": False,
                "resolved_by": None
            },
        ]
        
        for event_data in security_events:
            created_at = datetime.utcnow() - timedelta(hours=event_data["hours_ago"])
            
            event = SecurityEvent(
                event_type=event_data["event_type"],
                severity=event_data["severity"],
                actor_id=event_data["actor"].id if event_data["actor"] else None,
                actor_address=event_data["actor"].wallet_address if event_data["actor"] else None,
                actor_role=event_data["actor"].role.value if event_data["actor"] else None,
                resource_type=event_data["resource_type"],
                resource_id=event_data["resource_id"],
                reason=event_data["reason"],
                resolved=event_data["resolved"],
                resolved_by=event_data["resolved_by"].id if event_data["resolved_by"] else None,
                resolved_at=created_at + timedelta(hours=1) if event_data["resolved"] else None,
                resolution_notes="Reviewed and determined to be accidental access attempt" if event_data["resolved"] else None,
                created_at=created_at
            )
            db.add(event)
        
        await db.commit()
        print("  Created security event entries")
        
        print("\n" + "="*50)
        print("Demo data seeding completed successfully!")
        print("="*50)
        print("\nDemo Credentials:")
        print(f"  Owner:    devavardhan.test@gmail.com / Owner@123")
        print(f"  Manager:  recipient@test.com / Manager@123")
        print(f"  Employee: user1@securechain.com / User@123")
        print("="*50)


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
