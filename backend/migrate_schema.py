"""
Migration script to add missing columns to existing database tables.
This script will NOT delete any existing data.
Run this after database is up and before starting the backend.
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Parse DATABASE_URL
database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/securechain")
# Remove the asyncpg prefix for asyncpg connection
db_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

async def migrate_database():
    """Add missing columns to existing tables."""
    
    try:
        # Connect to the database
        conn = await asyncpg.connect(db_url)
        print("[OK] Connected to database")
        
        # Start transaction
        async with conn.transaction():
            print("\n=== ADDING MISSING COLUMNS ===\n")
            
            # 1. Add blockchain_tx_status to dids table
            try:
                await conn.execute("""
                    ALTER TABLE dids 
                    ADD COLUMN IF NOT EXISTS blockchain_tx_status VARCHAR(20) 
                    NOT NULL DEFAULT 'PENDING' 
                    CHECK (blockchain_tx_status IN ('PENDING', 'CONFIRMED', 'FAILED'));
                """)
                print("[OK] Added blockchain_tx_status to dids table")
            except Exception as e:
                print(f"[ERROR] Error adding blockchain_tx_status to dids: {e}")
            
            # 2. Add blockchain_tx_status to assets table
            try:
                await conn.execute("""
                    ALTER TABLE assets 
                    ADD COLUMN IF NOT EXISTS blockchain_tx_status VARCHAR(20) 
                    NOT NULL DEFAULT 'PENDING' 
                    CHECK (blockchain_tx_status IN ('PENDING', 'CONFIRMED', 'FAILED'));
                """)
                print("[OK] Added blockchain_tx_status to assets table")
            except Exception as e:
                print(f"[ERROR] Error adding blockchain_tx_status to assets: {e}")
            
            # 3. Add blockchain_network to assets table
            try:
                await conn.execute("""
                    ALTER TABLE assets 
                    ADD COLUMN IF NOT EXISTS blockchain_network VARCHAR(50);
                """)
                print("[OK] Added blockchain_network to assets table")
            except Exception as e:
                print(f"[ERROR] Error adding blockchain_network to assets: {e}")
            
            # 4. Add contract_address to assets table
            try:
                await conn.execute("""
                    ALTER TABLE assets 
                    ADD COLUMN IF NOT EXISTS contract_address VARCHAR(42);
                """)
                print("[OK] Added contract_address to assets table")
            except Exception as e:
                print(f"[ERROR] Error adding contract_address to assets: {e}")
            
            # 5. Add blockchain_tx_status to transfers table
            try:
                await conn.execute("""
                    ALTER TABLE transfers 
                    ADD COLUMN IF NOT EXISTS blockchain_tx_status VARCHAR(20) 
                    NOT NULL DEFAULT 'PENDING' 
                    CHECK (blockchain_tx_status IN ('PENDING', 'CONFIRMED', 'FAILED'));
                """)
                print("[OK] Added blockchain_tx_status to transfers table")
            except Exception as e:
                print(f"[ERROR] Error adding blockchain_tx_status to transfers: {e}")
            
            # 6. Create wallet_associations table if it doesn't exist
            try:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS wallet_associations (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        wallet_address VARCHAR(42) UNIQUE NOT NULL,
                        wallet_type VARCHAR(20) NOT NULL CHECK (wallet_type IN ('ADMIN', 'MANAGER', 'AUDITOR', 'USER')),
                        did VARCHAR(255),
                        blockchain_identity_tx_hash VARCHAR(66),
                        blockchain_identity_block_number BIGINT,
                        blockchain_identity_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
                            CHECK (blockchain_identity_status IN ('PENDING', 'CONFIRMED', 'FAILED')),
                        is_primary BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                print("[OK] Created wallet_associations table (if not exists)")
                
                # Add indexes
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS ix_wallet_assoc_user_type 
                    ON wallet_associations (user_id, wallet_type);
                """)
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS ix_wallet_assoc_address 
                    ON wallet_associations (wallet_address);
                """)
                print("[OK] Created indexes for wallet_associations table")
            except Exception as e:
                print(f"[ERROR] Error creating wallet_associations table: {e}")
            
            # 7. Create ai_asset_proposals table if it doesn't exist
            try:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS ai_asset_proposals (
                        id SERIAL PRIMARY KEY,
                        proposed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                        asset_name VARCHAR(255) NOT NULL,
                        description TEXT,
                        category VARCHAR(100),
                        metadata_uri VARCHAR(500),
                        suggested_initial_owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                        ai_model VARCHAR(100),
                        ai_prompt TEXT,
                        ai_response TEXT,
                        status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
                            CHECK (status IN ('DRAFT', 'PROPOSED', 'APPROVED', 'REJECTED', 'MINTED')),
                        reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                        reviewed_at TIMESTAMP WITHOUT TIME ZONE,
                        review_notes TEXT,
                        minted_asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
                        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                print("[OK] Created ai_asset_proposals table (if not exists)")
                
                # Add indexes
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS ix_ai_proposals_status 
                    ON ai_asset_proposals (status);
                """)
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS ix_ai_proposals_proposer 
                    ON ai_asset_proposals (proposed_by);
                """)
                print("[OK] Created indexes for ai_asset_proposals table")
            except Exception as e:
                print(f"[ERROR] Error creating ai_asset_proposals table: {e}")
            
            print("\n=== MIGRATION COMPLETED SUCCESSFULLY ===\n")
            
        # Close connection
        await conn.close()
        print("[OK] Database connection closed")
        
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        raise

if __name__ == "__main__":
    print("\n=== SecureChain Database Migration ===")
    print("This will add missing columns without deleting data.\n")
    
    asyncio.run(migrate_database())
    
    print("\n[OK] Migration complete! You can now start the backend.")
