import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/securechain')
    async with engine.begin() as conn:
        tables = ['users', 'dids', 'assets', 'transfers', 'audit_logs', 'security_events', 'blockchain_transactions', 'ai_asset_proposals', 'wallet_associations']
        for t in tables:
            try:
                res = await conn.execute(text(f"SELECT COUNT(*) FROM {t}"))
                print(f"{t:25}: {res.scalar()}")
            except Exception as e:
                print(f"{t:25}: Error ({e})")
    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(check())
