import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def add_missing_columns():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # Add missing columns to assets table
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'assets' AND column_name = 'blockchain_network'
        """))
        if not result.fetchone():
            print('Adding blockchain_network column to assets table...')
            await conn.execute(text("""
                ALTER TABLE assets ADD COLUMN blockchain_network VARCHAR(50)
            """))
        else:
            print('blockchain_network column already exists')
        
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'assets' AND column_name = 'contract_address'
        """))
        if not result.fetchone():
            print('Adding contract_address column to assets table...')
            await conn.execute(text("""
                ALTER TABLE assets ADD COLUMN contract_address VARCHAR(42)
            """))
        else:
            print('contract_address column already exists')
        
        # Check transfers table for blockchain_network and contract_address
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'transfers' AND column_name = 'blockchain_network'
        """))
        if not result.fetchone():
            print('Adding blockchain_network column to transfers table...')
            await conn.execute(text("""
                ALTER TABLE transfers ADD COLUMN blockchain_network VARCHAR(50)
            """))
        else:
            print('blockchain_network column already exists')
        
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'transfers' AND column_name = 'contract_address'
        """))
        if not result.fetchone():
            print('Adding contract_address column to transfers table...')
            await conn.execute(text("""
                ALTER TABLE transfers ADD COLUMN contract_address VARCHAR(42)
            """))
        else:
            print('contract_address column already exists')
        
        # Check audit_logs for blockchain_block_number
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'audit_logs' AND column_name = 'blockchain_block_number'
        """))
        if not result.fetchone():
            print('Adding blockchain_block_number column to audit_logs table...')
            await conn.execute(text("""
                ALTER TABLE audit_logs ADD COLUMN blockchain_block_number BIGINT
            """))
        else:
            print('blockchain_block_number column already exists')
            
    await engine.dispose()
    print('Done!')

asyncio.run(add_missing_columns())