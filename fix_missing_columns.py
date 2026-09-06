import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def add_missing_columns():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # Check if column exists
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'dids' AND column_name = 'blockchain_tx_status'
        """))
        if not result.fetchone():
            print('Adding blockchain_tx_status column to dids table...')
            await conn.execute(text("""
                ALTER TABLE dids ADD COLUMN blockchain_tx_status VARCHAR(20) DEFAULT 'PENDING'
            """))
        else:
            print('blockchain_tx_status column already exists')
        
        # Check wallet_associations
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'wallet_associations' AND column_name = 'blockchain_identity_status'
        """))
        if not result.fetchone():
            print('Adding blockchain_identity_status column to wallet_associations table...')
            await conn.execute(text("""
                ALTER TABLE wallet_associations ADD COLUMN blockchain_identity_status VARCHAR(20) DEFAULT 'PENDING'
            """))
        else:
            print('blockchain_identity_status column already exists')
            
        # Check assets
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'assets' AND column_name = 'blockchain_tx_status'
        """))
        if not result.fetchone():
            print('Adding blockchain_tx_status column to assets table...')
            await conn.execute(text("""
                ALTER TABLE assets ADD COLUMN blockchain_tx_status VARCHAR(20) DEFAULT 'PENDING'
            """))
        else:
            print('blockchain_tx_status column already exists')
            
        # Check transfers
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'transfers' AND column_name = 'blockchain_tx_status'
        """))
        if not result.fetchone():
            print('Adding blockchain_tx_status column to transfers table...')
            await conn.execute(text("""
                ALTER TABLE transfers ADD COLUMN blockchain_tx_status VARCHAR(20) DEFAULT 'PENDING'
            """))
        else:
            print('blockchain_tx_status column already exists')
            
        # Check audit_logs
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'audit_logs' AND column_name = 'blockchain_verified'
        """))
        if not result.fetchone():
            print('Adding blockchain_verified column to audit_logs table...')
            await conn.execute(text("""
                ALTER TABLE audit_logs ADD COLUMN blockchain_verified BOOLEAN DEFAULT FALSE
            """))
        else:
            print('blockchain_verified column already exists')
            
        # Check security_events
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'resolved'
        """))
        if not result.fetchone():
            print('Adding resolved column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN resolved BOOLEAN DEFAULT FALSE
            """))
        else:
            print('resolved column already exists')
            
    await engine.dispose()
    print('Done!')

asyncio.run(add_missing_columns())