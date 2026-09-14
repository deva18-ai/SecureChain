"""
Add blockchain_tx_status column to dids table
"""
import asyncio
import asyncpg
from sqlalchemy import text
from app.database import engine

async def migrate():
    """Add blockchain_tx_status column if it doesn't exist"""
    
    async with engine.begin() as conn:
        # Check if column exists
        check_sql = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'dids' AND column_name = 'blockchain_tx_status';
        """
        result = await conn.execute(text(check_sql))
        column_exists = result.fetchone() is not None
        
        if column_exists:
            print("Column 'blockchain_tx_status' already exists in 'dids' table")
            return
        
        print("Adding 'blockchain_tx_status' column to 'dids' table...")
        
        # Create enum type if it doesn't exist
        create_enum_sql = """
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blockchaintxstatus') THEN
                CREATE TYPE blockchaintxstatus AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
            END IF;
        END $$;
        """
        await conn.execute(text(create_enum_sql))
        print("Enum type 'blockchaintxstatus' ensured")
        
        # Add the column with default value
        add_column_sql = """
        ALTER TABLE dids 
        ADD COLUMN blockchain_tx_status blockchaintxstatus NOT NULL DEFAULT 'PENDING';
        """
        await conn.execute(text(add_column_sql))
        print("Added 'blockchain_tx_status' column to 'dids' table")
        
        # Update existing rows based on verification status
        update_sql = """
        UPDATE dids 
        SET blockchain_tx_status = CASE 
            WHEN verified = true AND blockchain_tx_hash IS NOT NULL THEN 'CONFIRMED'::blockchaintxstatus
            WHEN blockchain_tx_hash IS NOT NULL THEN 'PENDING'::blockchaintxstatus
            ELSE 'PENDING'::blockchaintxstatus
        END;
        """
        await conn.execute(text(update_sql))
        print("Updated existing rows with appropriate status")
        
        await conn.commit()
        print("Migration completed successfully!")

if __name__ == "__main__":
    print("Starting migration: Add blockchain_tx_status to dids table")
    asyncio.run(migrate())
    print("Migration script finished")
