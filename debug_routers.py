import traceback
import asyncio
import sys
sys.path.insert(0, 'backend')

from app.database import async_session_maker
from app.routers.assets import list_assets
from app.routers.users import list_users
from app.models import User, UserRole

async def test():
    async with async_session_maker() as db:
        admin_user = User(id=1, email="devavardhan.test@gmail.com", role=UserRole.ADMIN, full_name="Admin")
        print("Testing list_assets...")
        try:
            res = await list_assets(page=1, page_size=20, status=None, category=None, owner_id=None, search=None, current_user=admin_user, db=db)
            print("Assets success:", res)
        except Exception as e:
            print("Assets ERROR:")
            traceback.print_exc()

        print("\nTesting list_users...")
        try:
            res = await list_users(page=1, page_size=20, role=None, is_active=None, search=None, current_user=admin_user, db=db)
            print("Users success:", res)
        except Exception as e:
            print("Users ERROR:")
            traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test())
