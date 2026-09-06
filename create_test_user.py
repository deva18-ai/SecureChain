#!/usr/bin/env python3
"""
Create test user for login verification
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.auth import get_password_hash
from app.models import User, UserRole

async def create_user():
    """Create test admin user."""
    
    database_url = settings.DATABASE_URL
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session_maker() as db:
        print("Creating test user...")
        
        # Check if user exists
        from sqlalchemy import select
        result = await db.execute(
            select(User).where(User.email == "devavardhan.test@gmail.com")
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"User already exists with role: {existing.role}")
            return
        
        # Create admin user
        admin = User(
            email="devavardhan.test@gmail.com",
            hashed_password=get_password_hash("Test@123"),
            full_name="Test Admin User",
            wallet_address="0xABCDEF1234567890123456789012345678901234",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        
        print(f"✓ Created user: {admin.email}")
        print(f"  Role: {admin.role}")
        print(f"  ID: {admin.id}")
        print(f"  Password: Test@123")
        
        # Also create a manager for testing
        manager = User(
            email="manager.test@securechain.dev",
            hashed_password=get_password_hash("Manager@123"),
            full_name="Test Manager User",
            wallet_address="0xABCDEF1234567890123456789012345678901235",
            role=UserRole.MANAGER,
            is_active=True,
            is_verified=True,
        )
        db.add(manager)
        await db.commit()
        await db.refresh(manager)
        
        print(f"✓ Created user: {manager.email}")
        print(f"  Role: {manager.role}")
        print(f"  ID: {manager.id}")

if __name__ == "__main__":
    asyncio.run(create_user())
