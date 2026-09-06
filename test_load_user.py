#!/usr/bin/env python3
"""Test loading user from database"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.config import settings
from app.models import User, UserRole

async def test_load():
    """Test loading users from database."""
    
    database_url = settings.DATABASE_URL
    print(f"Database URL: {database_url}")
    
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session_maker() as db:
        print("\nLoading users from database...")
        
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        print(f"\nFound {len(users)} users:")
        for user in users:
            print(f"  - {user.email}")
            print(f"    Role: {user.role} (type: {type(user.role)})")
            print(f"    Active: {user.is_active}")
            print(f"    ID: {user.id}")
        
        # Test specific user
        result = await db.execute(
            select(User).where(User.email == "devavardhan.test@gmail.com")
        )
        admin_user = result.scalar_one_or_none()
        
        if admin_user:
            print(f"\n✓ Successfully loaded admin user")
            print(f"  Email: {admin_user.email}")
            print(f"  Role: {admin_user.role}")
            print(f"  Role value: {admin_user.role.value}")
            return True
        else:
            print("\n✗ Admin user not found")
            return False

if __name__ == "__main__":
    try:
        result = asyncio.run(test_load())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
