import asyncio
import os
import sys
sys.path.insert(0, 'backend')
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.auth import verify_password
from app.models import User
from sqlalchemy import select

async def check_users():
    database_url = os.getenv('DATABASE_URL', settings.DATABASE_URL)
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session_maker() as db:
        result = await db.execute(select(User).where(User.email == 'devavardhan.test@gmail.com'))
        user = result.scalar_one_or_none()
        if user:
            print(f"User: {user.email}, Role: {user.role.value}, Name: {user.full_name}")
            print(f"Password check Owner@123: {verify_password('Owner@123', user.hashed_password)}")
        result = await db.execute(select(User).where(User.email == 'recipient@test.com'))
        user = result.scalar_one_or_none()
        if user:
            print(f"User: {user.email}, Role: {user.role.value}, Name: {user.full_name}")
            print(f"Password check Manager@123: {verify_password('Manager@123', user.hashed_password)}")
        result = await db.execute(select(User).where(User.email == 'user1@securechain.com'))
        user = result.scalar_one_or_none()
        if user:
            print(f"User: {user.email}, Role: {user.role.value}, Name: {user.full_name}")
            print(f"Password check User@123: {verify_password('User@123', user.hashed_password)}")
        result = await db.execute(select(User).where(User.email == 'user2@securechain.com'))
        user = result.scalar_one_or_none()
        if user:
            print(f"User: {user.email}, Role: {user.role.value}, Name: {user.full_name}")
            print(f"Password check User@123: {verify_password('User@123', user.hashed_password)}")

asyncio.run(check_users())