import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def add_missing_columns():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # Check security_events for actor_role
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'actor_role'
        """))
        if not result.fetchone():
            print('Adding actor_role column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN actor_role VARCHAR(20)
            """))
        else:
            print('actor_role column already exists')
        
        # Check security_events for resolved_by
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'resolved_by'
        """))
        if not result.fetchone():
            print('Adding resolved_by column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN resolved_by INTEGER
            """))
        else:
            print('resolved_by column already exists')
        
        # Check security_events for resolved_at
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'resolved_at'
        """))
        if not result.fetchone():
            print('Adding resolved_at column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN resolved_at TIMESTAMP
            """))
        else:
            print('resolved_at column already exists')
        
        # Check security_events for resolution_notes
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'resolution_notes'
        """))
        if not result.fetchone():
            print('Adding resolution_notes column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN resolution_notes TEXT
            """))
        else:
            print('resolution_notes column already exists')
        
        # Check security_events for ip_address
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'ip_address'
        """))
        if not result.fetchone():
            print('Adding ip_address column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN ip_address VARCHAR(45)
            """))
        else:
            print('ip_address column already exists')
        
        # Check security_events for user_agent
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'user_agent'
        """))
        if not result.fetchone():
            print('Adding user_agent column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN user_agent VARCHAR(500)
            """))
        else:
            print('user_agent column already exists')
        
        # Check security_events for request_path
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'request_path'
        """))
        if not result.fetchone():
            print('Adding request_path column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN request_path VARCHAR(500)
            """))
        else:
            print('request_path column already exists')
        
        # Check security_events for request_method
        result = await conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'security_events' AND column_name = 'request_method'
        """))
        if not result.fetchone():
            print('Adding request_method column to security_events table...')
            await conn.execute(text("""
                ALTER TABLE security_events ADD COLUMN request_method VARCHAR(10)
            """))
        else:
            print('request_method column already exists')
            
    await engine.dispose()
    print('Done!')

asyncio.run(add_missing_columns())