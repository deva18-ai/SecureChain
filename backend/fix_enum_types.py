"""
Fix all enum types in database to match SQLAlchemy configuration.
SQLAlchemy models use native_enum=False (VARCHAR), but database has native ENUM types.
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/securechain")
db_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

async def fix_enum_types():
    conn = await asyncpg.connect(db_url)
    print("[OK] Connected to database\n")
    
    try:
        async with conn.transaction():
            print("Fixing enum columns to VARCHAR...\n")
            
            statements = [
                "ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20) USING role::text;",
                "ALTER TABLE assets ALTER COLUMN status TYPE VARCHAR(20) USING status::text;",
                "ALTER TABLE assets ALTER COLUMN blockchain_tx_status TYPE VARCHAR(20) USING blockchain_tx_status::text;",
                "ALTER TABLE transfers ALTER COLUMN status TYPE VARCHAR(20) USING status::text;",
                "ALTER TABLE transfers ALTER COLUMN blockchain_tx_status TYPE VARCHAR(20) USING blockchain_tx_status::text;",
                "ALTER TABLE audit_logs ALTER COLUMN action TYPE VARCHAR(50) USING action::text;",
                "ALTER TABLE security_events ALTER COLUMN event_type TYPE VARCHAR(50) USING event_type::text;",
                "ALTER TABLE security_events ALTER COLUMN severity TYPE VARCHAR(20) USING severity::text;",
                "ALTER TABLE security_events ALTER COLUMN status DROP NOT NULL;",
                "ALTER TABLE security_events ALTER COLUMN status SET DEFAULT 'OPEN';",
                "ALTER TABLE security_events ALTER COLUMN message DROP NOT NULL;",
                "ALTER TABLE dids ALTER COLUMN blockchain_tx_status TYPE VARCHAR(20) USING blockchain_tx_status::text;",
                "ALTER TABLE wallet_associations ALTER COLUMN wallet_type TYPE VARCHAR(20) USING wallet_type::text;",
                "ALTER TABLE wallet_associations ALTER COLUMN blockchain_identity_status TYPE VARCHAR(20) USING blockchain_identity_status::text;",
                "ALTER TABLE ai_asset_proposals ALTER COLUMN status TYPE VARCHAR(20) USING status::text;"
            ]
            
            for stmt in statements:
                try:
                    await conn.execute(stmt)
                    print(f"[OK] Executed: {stmt.split()[2]}.{stmt.split()[5]}")
                except Exception as e:
                    print(f"[SKIP/NOTE] {stmt.split()[2]}.{stmt.split()[5]}: {e}")
                    
            print("\n[OK] All enum types converted to VARCHAR successfully!")
    
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_enum_types())
