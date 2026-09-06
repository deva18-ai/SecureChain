import asyncio
import sys
sys.path.insert(0, 'backend')

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.auth import get_password_hash

async def reset_password():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/securechain')
    
    email = "devavardhan.test@gmail.com"
    new_password = "Owner@123"
    hashed_password = get_password_hash(new_password)
    
    async with engine.begin() as conn:
        await conn.execute(
            text("UPDATE users SET hashed_password = :password WHERE email = :email"),
            {"password": hashed_password, "email": email}
        )
        print(f"Password reset for {email}")
        print(f"New credentials: {email} / {new_password}")
    
    await engine.dispose()

asyncio.run(reset_password())
