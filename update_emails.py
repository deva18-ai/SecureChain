import asyncio
import sys
sys.path.insert(0, 'backend')

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def update_emails():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/securechain')
    
    try:
        async with engine.begin() as conn:
            # Check existing emails
            result = await conn.execute(text('SELECT email FROM users LIMIT 5'))
            print("Existing users:")
            for row in result:
                print(f"  - {row[0]}")
            
            # Update emails from .local to .dev
            await conn.execute(text("""
                UPDATE users 
                SET email = REPLACE(email, '@securechain.local', '@securechain.dev')
                WHERE email LIKE '%@securechain.local'
            """))
            
            # Verify updates
            result = await conn.execute(text('SELECT email FROM users LIMIT 5'))
            print("\nUpdated users:")
            for row in result:
                print(f"  - {row[0]}")
            
            print("\n✅ Email domains updated successfully!")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(update_emails())
