#!/usr/bin/env python3
"""
Clear Database Script
Removes all data from tables for fresh seeding.

⚠️  FOR DEVELOPMENT ONLY - DO NOT RUN IN PRODUCTION
"""

import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.config import settings

async def clear_database():
    """Clear all data from database tables."""
    
    database_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    
    engine = create_async_engine(database_url, echo=False)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session_maker() as db:
        print("[CLEAR] Clearing database tables...")
        
        # Disable foreign key checks temporarily and truncate tables
        tables = [
            "blockchain_transactions",
            "security_events",
            "audit_logs",
            "transfers",
            "assets",
            "dids",
            "wallet_associations",
            "ai_asset_proposals",
            "users"
        ]
        
        for table in tables:
            try:
                await db.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
                print(f"  [OK] Cleared {table}")
            except Exception as e:
                print(f"  [WARN] Failed to clear {table}: {e}")
        
        await db.commit()
        
        print("\n[CLEAR] Database cleared successfully!")

if __name__ == "__main__":
    asyncio.run(clear_database())
