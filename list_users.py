import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def list_users():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/securechain')
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT id, email, full_name, role, is_active FROM users ORDER BY id"))
        print("Existing users in database:")
        print(f"{'ID':<5} {'Email':<35} {'Full Name':<25} {'Role':<10} {'Active'}")
        print("-" * 90)
        for row in result:
            print(f"{row[0]:<5} {row[1]:<35} {row[2]:<25} {row[3]:<10} {row[4]}")
    await engine.dispose()

asyncio.run(list_users())
