#!/usr/bin/env python3
"""
Master Seed Script for SecureChain - SIH Demo Edition
Clears existing database tables and seeds complete, rich, verified demo data for all roles and pages.

Usage:
    python seed.py

 FOR DEVELOPMENT & SIH DEMO PRESENTATION ONLY
"""

import asyncio
import os
import sys
import hashlib
import secrets
import random
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from passlib.context import CryptContext

from app.config import settings
from app.auth import get_password_hash
from app.models import (
    User, UserRole, DID, WalletAssociation, WalletType,
    Asset, AssetStatus, Transfer, TransferStatus,
    AuditLog, AuditAction, SecurityEvent, SecurityEventType, SecurityEventSeverity,
    BlockchainTransaction, BlockchainTxStatus, AIAssetProposal, AIAssetProposalStatus
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_PASSWORD = "Admin@123"
OWNER_PASSWORD = "Owner@123"
MANAGER_PASSWORD = "Manager@123"
AUDITOR_PASSWORD = "Auditor@123"
USER_PASSWORD = "User@123"

CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

async def clear_database_tables(db):
    print("[1/10] Truncating database tables for fresh SIH demo seed...")
    tables = [
        "blockchain_transactions",
        "security_events",
        "audit_logs",
        "transfers",
        "ai_asset_proposals",
        "assets",
        "wallet_associations",
        "dids",
        "users"
    ]
    for table in tables:
        try:
            await db.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
            print(f"   Cleared {table}")
        except Exception as e:
            print(f"  ! Warning clearing {table}: {e}")
    await db.commit()

async def seed_master_database():
    database_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session_maker() as db:
        print("\n======================================================================")
        print("[SEED] SECURECHAIN SIH DEMO MASTER SEEDING PROCESS")
        print("======================================================================\n")

        # 1. Clear database
        await clear_database_tables(db)

        # 2. Seed Users
        print("\n[2/10] Seeding demo users across all roles...")
        users_data = [
            # Admins / Owners
            {
                "email": "devavardhan.test@gmail.com",
                "password": OWNER_PASSWORD,
                "full_name": "Devavardhan MI (Owner)",
                "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "role": UserRole.ADMIN,
            },
            {
                "email": "admin@securechain.local",
                "password": ADMIN_PASSWORD,
                "full_name": "System Administrator",
                "wallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                "role": UserRole.ADMIN,
            },
            {
                "email": "devavardhan.admin@securechain.local",
                "password": ADMIN_PASSWORD,
                "full_name": "Devavardhan Admin",
                "wallet": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
                "role": UserRole.ADMIN,
            },
            # Managers
            {
                "email": "recipient@test.com",
                "password": MANAGER_PASSWORD,
                "full_name": "Recipient Manager",
                "wallet": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
                "role": UserRole.MANAGER,
            },
            {
                "email": "manager@securechain.local",
                "password": MANAGER_PASSWORD,
                "full_name": "Asset Manager",
                "wallet": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
                "role": UserRole.MANAGER,
            },
            {
                "email": "manager2@securechain.local",
                "password": MANAGER_PASSWORD,
                "full_name": "Operations Manager",
                "wallet": "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
                "role": UserRole.MANAGER,
            },
            # Auditors
            {
                "email": "auditor@securechain.local",
                "password": AUDITOR_PASSWORD,
                "full_name": "Security Auditor",
                "wallet": "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
                "role": UserRole.AUDITOR,
            },
            {
                "email": "auditor2@securechain.local",
                "password": AUDITOR_PASSWORD,
                "full_name": "Compliance Auditor",
                "wallet": "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
                "role": UserRole.AUDITOR,
            },
            # Employees & Regular Users
            {
                "email": "user1@securechain.com",
                "password": USER_PASSWORD,
                "full_name": "Employee User",
                "wallet": "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
                "role": UserRole.USER,
            },
            {
                "email": "priya@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Priya Sharma",
                "wallet": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
                "role": UserRole.USER,
            },
            {
                "email": "rahul@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Rahul Kumar",
                "wallet": "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
                "role": UserRole.USER,
            },
            {
                "email": "ananya@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Ananya Rao",
                "wallet": "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
                "role": UserRole.USER,
            },
            {
                "email": "vikram@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Vikram Singh",
                "wallet": "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
                "role": UserRole.USER,
            },
            {
                "email": "user1@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Rajesh Kumar",
                "wallet": "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
                "role": UserRole.USER,
            },
            {
                "email": "user2@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Amit Patel",
                "wallet": "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
                "role": UserRole.USER,
            },
            {
                "email": "user3@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Sneha Reddy",
                "wallet": "0x8626f69A737373D158015586588256439C802287",
                "role": UserRole.USER,
            },
            {
                "email": "user4@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Anjali Desai",
                "wallet": "0x525540306F74D9c5f87b8d4E6b539B6F30064284",
                "role": UserRole.USER,
            },
            {
                "email": "user5@securechain.local",
                "password": USER_PASSWORD,
                "full_name": "Karthik Menon",
                "wallet": "0x408A56a8A11019C338F1409f9f83C7c6BFF24A1a",
                "role": UserRole.USER,
            },
        ]

        users = []
        user_map = {}
        for uinfo in users_data:
            user = User(
                email=uinfo["email"],
                hashed_password=get_password_hash(uinfo["password"]),
                full_name=uinfo["full_name"],
                wallet_address=uinfo["wallet"],
                role=uinfo["role"],
                is_active=True,
                is_verified=True,
                last_login=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                created_at=datetime.utcnow() - timedelta(days=random.randint(30, 90)),
            )
            db.add(user)
            users.append(user)

        await db.commit()
        for user in users:
            await db.refresh(user)
            user_map[user.email] = user

        print(f"   Created {len(users)} users across ADMIN, MANAGER, AUDITOR, and USER roles")

        # 3. Seed DIDs
        print("\n[3/10] Generating Digital Identities (DIDs) for all users...")
        dids = []
        for user in users:
            did_str = f"did:securechain:{user.role.value.lower()}:{user.id:04d}-{secrets.token_hex(6)}"
            id_hash = "0x" + hashlib.sha256(f"{user.wallet_address.lower()}:{did_str}".encode()).hexdigest()
            tx_hash = "0x" + secrets.token_hex(32)
            ver_tx_hash = "0x" + secrets.token_hex(32)
            block_num = random.randint(10200, 15800)

            did = DID(
                did=did_str,
                user_id=user.id,
                wallet_address=user.wallet_address,
                identity_hash=id_hash,
                verified=True,
                verification_tx_hash=ver_tx_hash,
                blockchain_tx_hash=tx_hash,
                blockchain_block_number=block_num,
                blockchain_tx_status=BlockchainTxStatus.CONFIRMED,
                created_at=user.created_at + timedelta(minutes=5),
                verified_at=user.created_at + timedelta(minutes=10),
            )
            db.add(did)
            dids.append(did)

        await db.commit()
        for did in dids:
            await db.refresh(did)

        print(f"   Created {len(dids)} verified DIDs")

        # 4. Seed Wallet Associations
        print("\n[4/10] Creating Wallet Associations...")
        wallet_assocs = []
        for user in users:
            did_obj = next(d for d in dids if d.user_id == user.id)
            w_assoc = WalletAssociation(
                user_id=user.id,
                wallet_address=user.wallet_address,
                wallet_type=WalletType(user.role.value),
                did=did_obj.did,
                blockchain_identity_tx_hash=did_obj.verification_tx_hash,
                blockchain_identity_block_number=did_obj.blockchain_block_number,
                blockchain_identity_status=BlockchainTxStatus.CONFIRMED,
                is_primary=True,
                created_at=user.created_at,
            )
            db.add(w_assoc)
            wallet_assocs.append(w_assoc)

        await db.commit()
        print(f"   Created {len(wallet_assocs)} Wallet Associations")

        # 5. Seed Assets
        print("\n[5/10] Seeding Digital Assets across categories (Laptops, Servers, Real Estate, Certificates)...")
        asset_templates = [
            # IT Equipment & Laptops
            ("Dell XPS 15 Workstation", "High-performance Core i9 laptop with 32GB RAM", "Laptop", "user1@securechain.com", AssetStatus.ACTIVE),
            ("Apple MacBook Pro 16", "M3 Max Developer edition with 64GB unified memory", "Laptop", "priya@securechain.local", AssetStatus.ACTIVE),
            ("Lenovo ThinkPad X1 Carbon", "Ultra-portable business notebook for operations", "Laptop", "rahul@securechain.local", AssetStatus.ACTIVE),
            ("HP EliteBook 840 G10", "Enterprise security laptop with smartcard reader", "Laptop", "ananya@securechain.local", AssetStatus.ACTIVE),
            ("ASUS ROG Zephyrus G16", "AI Compute & Graphics testing workstation", "Laptop", "vikram@securechain.local", AssetStatus.ACTIVE),
            ("Dell Latitude 5440", "Standard deployment laptop for staff", "Laptop", "user1@securechain.local", AssetStatus.ACTIVE),
            ("Microsoft Surface Laptop Studio", "Touchscreen development device", "Laptop", "user2@securechain.local", AssetStatus.ACTIVE),
            ("System 76 Oryx Pro", "Linux workstation for blockchain development", "Laptop", None, AssetStatus.ACTIVE),
            
            # Servers & Infrastructure
            ("Dell PowerEdge R750 Enterprise Server", "2U Rack server with Dual Intel Xeon Platinum", "Server", "recipient@test.com", AssetStatus.ACTIVE),
            ("HP ProLiant DL380 Gen11", "High availability cluster node", "Server", "manager@securechain.local", AssetStatus.ACTIVE),
            ("Supermicro GPU Server SYS-420GP", "Quad-NVIDIA A100 AI inference node", "Server", "manager2@securechain.local", AssetStatus.ACTIVE),
            ("Cisco UCS C240 M6 Rack Server", "Database primary host", "Server", None, AssetStatus.ACTIVE),
            
            # Real Estate & Physical Property (SIH Demo Spotlight)
            ("Land Parcel Deed #SC-BLR-8801", "Verified land registry deed - Whitefield Tech Zone 4", "Land Record", "devavardhan.test@gmail.com", AssetStatus.ACTIVE),
            ("Commercial Headquarters Property", "Block A Financial Tower - Title Deed SC-PROP-002", "Real Estate", "devavardhan.test@gmail.com", AssetStatus.ACTIVE),
            ("Secure Logistics Warehouse Hub", "Plot 42 Logistics Park - Deed SC-LAND-004", "Real Estate", "recipient@test.com", AssetStatus.ACTIVE),
            ("Regional Data Center Facility", "Solar-powered data facility title deed SC-PROP-009", "Real Estate", "manager@securechain.local", AssetStatus.ACTIVE),

            # Security & Access Control
            ("YubiKey 5C NFC Enterprise Key", "Hardware Security Key for Root Access", "Security", "devavardhan.test@gmail.com", AssetStatus.ACTIVE),
            ("Hardware Security Module (HSM) Vault", "FIPS 140-2 Level 3 Key Management Appliance", "Security", "admin@securechain.local", AssetStatus.ACTIVE),
            ("Biometric Access Badge Hub-01", "Encrypted RFID RFID/NFC identity card", "Access Control", "priya@securechain.local", AssetStatus.ACTIVE),
            ("Encrypted NVMe Backup Device", "4TB Rugged Hardware Encrypted Drive", "Storage", "auditor@securechain.local", AssetStatus.ACTIVE),

            # Credentials & Digital Certificates
            ("Root SSL/TLS Wildcard Certificate", "DigiCert High-Assurance EV Certificate 2026", "Digital Certificate", "admin@securechain.local", AssetStatus.ACTIVE),
            ("ISO 27001 Security Compliance Cert", "Audited security compliance credential", "Compliance Cert", "auditor@securechain.local", AssetStatus.ACTIVE),
            ("SOC 2 Type II Verification Badge", "System and Organization Controls Attestation", "Compliance Cert", "auditor2@securechain.local", AssetStatus.ACTIVE),
            ("Smart Contract Audit Certificate", "CertiK Verified Security Audit Token #SC-AUDIT-99", "Digital Certificate", "devavardhan.test@gmail.com", AssetStatus.ACTIVE),

            # Mobile & Network
            ("iPhone 15 Pro Enterprise", "Encrypted corporate communication mobile", "Mobile Device", "priya@securechain.local", AssetStatus.ACTIVE),
            ("Samsung Galaxy S24 Ultra", "Secure Knox container device", "Mobile Device", "rahul@securechain.local", AssetStatus.ACTIVE),
            ("Google Pixel 8 Pro Test Device", "Android security testing device", "Mobile Device", "user3@securechain.local", AssetStatus.ACTIVE),
            ("Cisco Catalyst 9300 Switch", "48-Port PoE+ Core Network Switch", "Network", None, AssetStatus.ACTIVE),
            ("Fortinet FortiGate 200F Firewall", "Next-Gen Enterprise Edge Firewall", "Network", "manager2@securechain.local", AssetStatus.ACTIVE),
            ("Synology RackStation RS3621xs+", "12-Bay NAS with 120TB SAN storage", "Storage", None, AssetStatus.ACTIVE),
            ("iPad Pro 12.9 M2 Tablet", "Executive dashboard & approval tablet", "Tablet", "devavardhan.test@gmail.com", AssetStatus.ACTIVE),
            ("Dell UltraSharp 32 4K Monitor", "Color-calibrated developer display", "Monitor", "user4@securechain.local", AssetStatus.ACTIVE),
            ("LG 38 UltraWide Curved Display", "Operations monitoring screen", "Monitor", "user5@securechain.local", AssetStatus.ACTIVE),
            ("Legacy Server R720", "Decommissioned backup server", "Server", None, AssetStatus.FROZEN),
        ]

        creator = user_map["devavardhan.test@gmail.com"]
        assets = []
        token_id = 1001
        block_num = 10500

        for name, desc, category, owner_email, status in asset_templates:
            owner = user_map[owner_email] if owner_email and owner_email in user_map else None
            asset_code = f"SC-{category[:3].upper()}-{token_id}"
            tx_hash = "0x" + secrets.token_hex(32)

            asset = Asset(
                token_id=token_id,
                asset_id=asset_code,
                name=name,
                description=desc,
                category=category,
                metadata_uri=f"ipfs://Qm{secrets.token_hex(22)}",
                creator_id=creator.id,
                owner_id=owner.id if owner else None,
                status=status,
                blockchain_tx_hash=tx_hash,
                blockchain_block_number=block_num,
                blockchain_tx_status=BlockchainTxStatus.CONFIRMED,
                blockchain_network="Hardhat Localhost (Chain ID: 31337)",
                contract_address=CONTRACT_ADDRESS,
                created_at=datetime.utcnow() - timedelta(days=random.randint(5, 60)),
            )
            db.add(asset)
            assets.append(asset)
            token_id += 1
            block_num += 3

        await db.commit()
        for asset in assets:
            await db.refresh(asset)

        print(f"   Created {len(assets)} digital & physical assets")

        # 6. Seed Transfers
        print("\n[6/10] Creating asset transfer requests (PENDING, APPROVED, COMPLETED)...")
        assigned_assets = [a for a in assets if a.owner_id]
        transfers = []

        # Create 3 PENDING requests for Owner review on Requests Page
        pending_combos = [
            (assigned_assets[0], user_map["devavardhan.test@gmail.com"], user_map["recipient@test.com"]),
            (assigned_assets[1], user_map["recipient@test.com"], user_map["priya@securechain.local"]),
            (assigned_assets[2], user_map["manager@securechain.local"], user_map["rahul@securechain.local"]),
        ]

        for asset, init_user, recip_user in pending_combos:
            trans = Transfer(
                asset_id=asset.id,
                initiator_id=init_user.id,
                recipient_id=recip_user.id,
                from_address=init_user.wallet_address,
                to_address=recip_user.wallet_address,
                status=TransferStatus.PENDING,
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 12)),
            )
            db.add(trans)
            transfers.append(trans)

        # Create APPROVED / COMPLETED / REJECTED transfers
        for i in range(12):
            asset = random.choice(assigned_assets)
            init_user = next(u for u in users if u.id == asset.owner_id)
            recip_user = random.choice([u for u in users if u.id != init_user.id])
            status_choice = random.choice([TransferStatus.COMPLETED, TransferStatus.APPROVED, TransferStatus.REJECTED])
            tx_h = "0x" + secrets.token_hex(32) if status_choice in [TransferStatus.COMPLETED, TransferStatus.APPROVED] else None
            blk_n = random.randint(12000, 16000) if tx_h else None

            trans = Transfer(
                asset_id=asset.id,
                initiator_id=init_user.id,
                recipient_id=recip_user.id,
                from_address=init_user.wallet_address,
                to_address=recip_user.wallet_address,
                status=status_choice,
                blockchain_tx_hash=tx_h,
                blockchain_block_number=blk_n,
                blockchain_tx_status=BlockchainTxStatus.CONFIRMED if tx_h else BlockchainTxStatus.PENDING,
                error_message="Recipient verification failed" if status_choice == TransferStatus.REJECTED else None,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 25)),
                completed_at=datetime.utcnow() - timedelta(days=random.randint(1, 20)) if status_choice == TransferStatus.COMPLETED else None,
            )
            db.add(trans)
            transfers.append(trans)

        await db.commit()
        for t in transfers:
            await db.refresh(t)

        print(f"   Created {len(transfers)} transfer requests (3 PENDING ready for live Owner approval)")

        # 7. Seed AI Asset Proposals
        print("\n[7/10] Creating AI Asset Proposals...")
        proposals_data = [
            ("Quantum-Resistant HSM Cluster", "Automated AI specification for next-gen crypto vault", "Security", user_map["recipient@test.com"], AIAssetProposalStatus.PROPOSED),
            ("Autonomous Fleet Telemetry Unit", "IoT tracking sensor payload for transport vehicle 12", "Hardware", user_map["manager@securechain.local"], AIAssetProposalStatus.APPROVED),
            ("Decentralized Storage Node Node-09", "30TB Distributed IPFS pin node", "Storage", user_map["devavardhan.test@gmail.com"], AIAssetProposalStatus.MINTED),
            ("5G Edge Compute Gateway", "Ruggedized outdoor edge unit for site alpha", "Network", user_map["user1@securechain.com"], AIAssetProposalStatus.DRAFT),
        ]

        for p_name, p_desc, p_cat, p_user, p_status in proposals_data:
            prop = AIAssetProposal(
                proposed_by=p_user.id,
                asset_name=p_name,
                description=p_desc,
                category=p_cat,
                metadata_uri=f"ipfs://QmAI{secrets.token_hex(18)}",
                suggested_initial_owner_id=p_user.id,
                ai_model="Gemini 1.5 Flash (Antigravity Core)",
                ai_prompt=f"Generate optimum asset parameters for {p_name} in category {p_cat}",
                ai_response=f"Asset spec verified: Cryptographic integrity 99.8%. Recommended status: {p_status.value}",
                status=p_status,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
            )
            db.add(prop)

        await db.commit()
        print("   Created AI Asset Proposals")

        # 8. Seed Audit Logs
        print("\n[8/10] Generating 150+ Immutable Audit Logs with Blockchain Tx Verifications...")
        audit_logs = []
        admin_u = user_map["devavardhan.test@gmail.com"]

        # User logons & activity
        for user in users:
            # Login logs
            for _ in range(random.randint(3, 7)):
                audit_logs.append(AuditLog(
                    actor_id=user.id,
                    actor_address=user.wallet_address,
                    action=AuditAction.LOGIN,
                    resource_type="USER",
                    resource_id=str(user.id),
                    role=user.role.value,
                    details=f"User {user.full_name} ({user.email}) successfully authenticated",
                    ip_address=f"192.168.1.{random.randint(10, 250)}",
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) SecureChain Client",
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(1, 23)),
                ))

            # Identity verification log
            audit_logs.append(AuditLog(
                actor_id=admin_u.id,
                actor_address=admin_u.wallet_address,
                action=AuditAction.IDENTITY_VERIFIED,
                resource_type="DID",
                resource_id=f"did:securechain:{user.role.value.lower()}:{user.id}",
                role=UserRole.ADMIN.value,
                blockchain_tx_hash="0x" + secrets.token_hex(32),
                blockchain_block_number=random.randint(10500, 15000),
                blockchain_verified=True,
                details=f"Cryptographically verified DID identity for {user.full_name}",
                created_at=user.created_at + timedelta(minutes=10),
            ))

        # Asset minting & transfer audit logs
        for asset in assets:
            audit_logs.append(AuditLog(
                actor_id=creator.id,
                actor_address=creator.wallet_address,
                action=AuditAction.ASSET_MINTED,
                resource_type="ASSET",
                resource_id=asset.asset_id,
                role=creator.role.value,
                blockchain_tx_hash=asset.blockchain_tx_hash,
                blockchain_block_number=asset.blockchain_block_number,
                blockchain_verified=True,
                details=f"Minted asset '{asset.name}' (Token ID: #{asset.token_id})",
                created_at=asset.created_at,
            ))
            if asset.owner_id:
                owner_user = next(u for u in users if u.id == asset.owner_id)
                audit_logs.append(AuditLog(
                    actor_id=creator.id,
                    actor_address=creator.wallet_address,
                    action=AuditAction.ASSET_ASSIGNED,
                    resource_type="ASSET",
                    resource_id=asset.asset_id,
                    role=creator.role.value,
                    blockchain_tx_hash="0x" + secrets.token_hex(32),
                    blockchain_block_number=asset.blockchain_block_number + 1,
                    blockchain_verified=True,
                    details=f"Assigned ownership of '{asset.name}' to {owner_user.full_name}",
                    created_at=asset.created_at + timedelta(minutes=15),
                ))

        for log in audit_logs:
            db.add(log)

        await db.commit()
        print(f"   Generated {len(audit_logs)} audit log records with blockchain hash verifications")

        # 9. Seed Security Events
        print("\n[9/10] Generating Security Center Events & Threat Alerts...")
        security_events = []
        regular_users = [u for u in users if u.role == UserRole.USER]

        # 1. Unauthorized Transfer Attempts
        for _ in range(4):
            u = random.choice(regular_users)
            a = random.choice(assets)
            ev = SecurityEvent(
                event_type=SecurityEventType.UNAUTHORIZED_TRANSFER_ATTEMPT,
                severity=SecurityEventSeverity.HIGH,
                actor_id=u.id,
                actor_address=u.wallet_address,
                actor_role=u.role.value,
                resource_type="ASSET",
                resource_id=a.asset_id,
                reason=f"User {u.full_name} attempted to initiate transfer for unowned asset '{a.name}'",
                blockchain_tx_hash="0x" + secrets.token_hex(32),
                blockchain_block_number=random.randint(11000, 15500),
                ip_address=f"192.168.1.{random.randint(15, 200)}",
                request_path="/api/v1/transfers",
                request_method="POST",
                resolved=False,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
            )
            security_events.append(ev)

        # 2. Failed Auth Attempts
        for _ in range(6):
            u = random.choice(users)
            ev = SecurityEvent(
                event_type=SecurityEventType.REPEATED_FAILED_AUTH,
                severity=SecurityEventSeverity.MEDIUM,
                actor_id=u.id,
                actor_address=u.wallet_address,
                actor_role=u.role.value,
                resource_type="USER",
                resource_id=str(u.id),
                reason=f"Multiple failed password login attempts for account {u.email}",
                ip_address=f"103.{random.randint(10, 200)}.{random.randint(1, 254)}.42",
                request_path="/api/v1/auth/login",
                request_method="POST",
                resolved=True,
                resolved_by=admin_u.id,
                resolved_at=datetime.utcnow() - timedelta(days=1),
                resolution_notes="Verified user identity via 2FA & restored access.",
                created_at=datetime.utcnow() - timedelta(days=random.randint(2, 14)),
            )
            security_events.append(ev)

        # 3. Unauthorized API Access
        for _ in range(4):
            u = random.choice(regular_users)
            ev = SecurityEvent(
                event_type=SecurityEventType.UNAUTHORIZED_API_ACCESS,
                severity=SecurityEventSeverity.CRITICAL,
                actor_id=u.id,
                actor_address=u.wallet_address,
                actor_role=u.role.value,
                resource_type="API",
                resource_id="/api/v1/users",
                reason=f"Employee account attempted restricted administrative access to /api/v1/users",
                ip_address=f"192.168.1.{random.randint(100, 220)}",
                request_path="/api/v1/users",
                request_method="DELETE",
                resolved=False,
                created_at=datetime.utcnow() - timedelta(hours=random.randint(2, 48)),
            )
            security_events.append(ev)

        for sev in security_events:
            db.add(sev)

        await db.commit()
        print(f"   Generated {len(security_events)} Security Center Events (High & Critical threats logged)")

        # 10. Seed Blockchain Transactions
        print("\n[10/10] Creating Blockchain Transaction Explorer Ledger...")
        bc_txs = []
        methods = [
            ("mintAsset", '{"method": "mintAsset", "contract": "' + CONTRACT_ADDRESS + '", "status": "SUCCESS"}'),
            ("transferAsset", '{"method": "transferAsset", "approvedByOwner": true, "status": "CONFIRMED"}'),
            ("verifyIdentity", '{"method": "verifyIdentity", "didVerified": true, "status": "CONFIRMED"}'),
            ("revokeAsset", '{"method": "revokeAsset", "status": "EXECUTED"}'),
        ]

        blk_num = 14200
        for i in range(25):
            m_name, m_data = random.choice(methods)
            tx_h = "0x" + secrets.token_hex(32)
            blk_h = "0x" + secrets.token_hex(32)
            u = random.choice(users)

            tx = BlockchainTransaction(
                tx_hash=tx_h,
                block_number=blk_num,
                block_hash=blk_h,
                from_address=u.wallet_address,
                to_address=CONTRACT_ADDRESS,
                value="0",
                gas_used=random.randint(120000, 280000),
                gas_price="30000000000",
                status=1,
                contract_address=CONTRACT_ADDRESS,
                method_name=m_name,
                event_data=m_data,
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(1, 23)),
            )
            bc_txs.append(tx)
            blk_num += random.randint(1, 5)

        for tx in bc_txs:
            db.add(tx)

        await db.commit()
        print(f"   Created {len(bc_txs)} Blockchain Transaction Explorer records")

        print("\n======================================================================")
        print(" SECURECHAIN SIH DEMO DATABASE SEEDING FINISHED SUCCESSFULLY!")
        print("======================================================================\n")

        print(" QUICK LOGINS FOR SIH PRESENTATION:")
        print("----------------------------------------------------------------------")
        print("   OWNER / ADMIN LOGIN (Quick Access Button 1):")
        print("     Email:    devavardhan.test@gmail.com")
        print("     Password: Owner@123")
        print("     Role:     ADMIN (Full system access & request approvals)")
        print("----------------------------------------------------------------------")
        print("   MANAGER LOGIN (Quick Access Button 2):")
        print("     Email:    recipient@test.com")
        print("     Password: Manager@123")
        print("     Role:     MANAGER (Asset management & transfer creation)")
        print("----------------------------------------------------------------------")
        print("   EMPLOYEE / USER LOGIN (Quick Access Button 3):")
        print("     Email:    user1@securechain.com")
        print("     Password: User@123")
        print("     Role:     USER (View personal assets & identity)")
        print("----------------------------------------------------------------------\n")

if __name__ == "__main__":
    asyncio.run(seed_master_database())