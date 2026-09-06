#!/usr/bin/env python3
"""Test login API"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.config import settings
from app.models import User
from app.auth import verify_password, create_access_token

async def test_login():
    """Test login flow."""
    
    database_url = settings.DATABASE_URL
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    email = "devavardhan.test@gmail.com"
    password = "Test@123"
    
    async with async_session_maker() as db:
        print(f"Testing login for: {email}")
        
        # Find user
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("ERROR: User not found")
            return False
        
        print(f"User found: {user.email}, Role: {user.role}")
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            print("ERROR: Invalid password")
            return False
        
        print("Password verified")
        
        # Check if active
        if not user.is_active:
            print("ERROR: User not active")
            return False
        
        print("User is active")
        
        # Create token
        try:
            token_data = {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value
            }
            token = create_access_token(token_data)
            print(f"Token created successfully")
            print(f"Token length: {len(token)}")
            
            print("\nLOGIN SUCCESS")
            print(f"  User ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Role: {user.role.value}")
            print(f"  Token: {token[:50]}...")
            
            return True
        except Exception as e:
            print(f"ERROR creating token: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    try:
        result = asyncio.run(test_login())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
