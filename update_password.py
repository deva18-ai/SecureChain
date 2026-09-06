#!/usr/bin/env python3
"""Update password for test user"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.config import settings
from app.models import User
from app.auth import get_password_hash

async def update_password():
    """Update password for test user."""
    
    database_url = settings.DATABASE_URL
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    email = "devavardhan.test@gmail.com"
    password = "Test@123"
    
    async with async_session_maker() as db:
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User {email} not found")
            return False
        
        print(f"Updating password for: {user.email}")
        print(f"Current role: {user.role}")
        
        user.hashed_password = get_password_hash(password)
        await db.commit()
        
        print("Password updated successfully")
        print(f"New password: {password}")
        return True

if __name__ == "__main__":
    try:
        result = asyncio.run(update_password())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
