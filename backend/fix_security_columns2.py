import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def add_missing_columns():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # Check security_events for resource_type
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'resource_type'
        """))
        if not result.fetchone():
            print('Adding resource_type column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN resource_type VARCHAR(50)
            """))
        else:
            print('resource_type column already exists')
        
        # Check security_events for resource_id
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'resource_id'
        """))
        if not result.fetchone():
            print('Adding resource_id column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN resource_id VARCHAR(100)
            """))
        else:
            print('resource_id column already exists')
        
        # Check security_events for reason
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'reason'
        """))
        if not result.fetchone():
            print('Adding reason column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN reason TEXT
            """))
        else:
            print('reason column already exists')
        
        # Check security_events for blockchain_tx_hash
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'blockchain_tx_hash'
        """))
        if not result.fetchone():
            print('Adding blockchain_tx_hash column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN blockchain_tx_hash VARCHAR(66)
            """))
        else:
            print('blockchain_tx_hash column already exists')
        
        # Check security_events for blockchain_block_number
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'blockchain_block_number'
        """))
        if not result.fetchone():
            print('Adding blockchain_block_number column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN blockchain_block_number BIGINT
            """))
        else:
            print('blockchain_block_number column already exists')
            
    await engine.dispose()
    print('Done!')

asyncio.run(add_missing_columns())