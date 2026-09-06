import asyncio
import sys
sys.path.insert(0, 'backend')

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.auth import get_password_hash

async def add_demo_users():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/securechain')
    
    demo_users = [
        {
            "email": "owner@securechain.dev",
            "password": "Owner@123",
            "full_name": "System Owner",
            "wallet_address": "0xA111111111111111111111111111111111111111",
            "role": "ADMIN",
        },
        {
            "email": "manager@securechain.dev",
            "password": "Manager@123",
            "full_name": "Asset Manager",
            "wallet_address": "0xB222222222222222222222222222222222222222",
            "role": "MANAGER",
        },
        {
            "email": "employee1@securechain.dev",
            "password": "Employee@123",
            "full_name": "Employee One",
            "wallet_address": "0xC333333333333333333333333333333333333333",
            "role": "USER",
        },
        {
            "email": "employee2@securechain.dev",
            "password": "Employee@123",
            "full_name": "Employee Two",
            "wallet_address": "0xD444444444444444444444444444444444444444",
            "role": "USER",
        },
    ]
    
    async with engine.begin() as conn:
        print("Creating demo users...")
        
        for user_data in demo_users:
            # Check if user already exists
            result = await conn.execute(
                text("SELECT email FROM users WHERE email = :email"),
                {"email": user_data["email"]}
            )
            existing = result.fetchone()
            
            if existing:
                print(f"  User {user_data['email']} already exists")
                continue
            
            # Create user
            hashed_password = get_password_hash(user_data["password"])
            await conn.execute(
                text("""
                    INSERT INTO users (email, hashed_password, full_name, wallet_address, role, is_active, is_verified, created_at, updated_at)
                    VALUES (:email, :hashed_password, :full_name, :wallet_address, :role, :is_active, :is_verified, NOW(), NOW())
                """),
                {
                    "email": user_data["email"],
                    "hashed_password": hashed_password,
                    "full_name": user_data["full_name"],
                    "wallet_address": user_data["wallet_address"],
                    "role": user_data["role"],
                    "is_active": True,
                    "is_verified": True,
                }
            )
            print(f"  Created {user_data['email']}")
        
        print("\nDemo users created successfully!")
        print("\nDemo Credentials:")
        for user_data in demo_users:
            print(f"  {user_data['email']} / {user_data['password']}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_demo_users())
