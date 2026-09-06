import asyncio
import sys
sys.path.insert(0, 'backend')

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.auth import get_password_hash

async def reset_all_passwords():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/securechain')
    
    users_to_update = [
        ("devavardhan.test@gmail.com", "Owner@123"),
        ("recipient@test.com", "Manager@123"),
        ("user1@securechain.com", "User@123"),
        ("user2@securechain.com", "User@123"),
    ]
    
    async with engine.begin() as conn:
        for email, password in users_to_update:
            hashed_password = get_password_hash(password)
            await conn.execute(
                text("UPDATE users SET hashed_password = :password WHERE email = :email"),
                {"password": hashed_password, "email": email}
            )
            print(f"Updated {email} / {password}")
    
    await engine.dispose()
    print("\nAll passwords updated!")

asyncio.run(reset_all_passwords())
