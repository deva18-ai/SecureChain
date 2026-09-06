import asyncio
import sys
sys.path.insert(0, 'backend')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.auth import get_password_hash
from app.models import User, UserRole

async def add_demo_users():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/securechain')
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session_maker() as db:
        print("🌱 Creating demo users...")
        
        # Define demo users
        demo_users = [
            {
                "email": "owner@securechain.dev",
                "password": "Owner@123",
                "full_name": "System Owner",
                "wallet_address": "0x1234567890123456789012345678901234567890",
                "role": UserRole.OWNER,
            },
            {
                "email": "manager@securechain.dev",
                "password": "Manager@123",
                "full_name": "Asset Manager",
                "wallet_address": "0x2234567890123456789012345678901234567890",
                "role": UserRole.MANAGER,
            },
            {
                "email": "employee1@securechain.dev",
                "password": "Employee@123",
                "full_name": "Employee One",
                "wallet_address": "0x3234567890123456789012345678901234567890",
                "role": UserRole.EMPLOYEE,
            },
            {
                "email": "employee2@securechain.dev",
                "password": "Employee@123",
                "full_name": "Employee Two",
                "wallet_address": "0x4234567890123456789012345678901234567890",
                "role": UserRole.EMPLOYEE,
            },
        ]
        
        for user_data in demo_users:
            # Check if user already exists
            result = await db.execute(select(User).where(User.email == user_data["email"]))
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print(f"  ⏭️  User {user_data['email']} already exists")
                continue
            
            # Create user
            user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                full_name=user_data["full_name"],
                wallet_address=user_data["wallet_address"],
                role=user_data["role"],
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            print(f"  ✅ Created {user_data['email']}")
        
        await db.commit()
        print("\n🎉 Demo users created successfully!")
        print("\n📋 Demo Credentials:")
        for user_data in demo_users:
            print(f"  {user_data['email']} / {user_data['password']}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_demo_users())
