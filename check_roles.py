import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_enum():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/securechain')
    async with engine.begin() as conn:
        # Check existing role values
        result = await conn.execute(text("SELECT DISTINCT role FROM users"))
        print("Existing role values in users table:")
        for row in result:
            print(f"  - {row[0]}")
    await engine.dispose()

asyncio.run(check_enum())
