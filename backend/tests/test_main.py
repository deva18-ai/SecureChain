import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.config import settings
from app.auth import get_password_hash, create_access_token
from app.models import User, UserRole, DID, Asset, AssetStatus, Transfer, TransferStatus


TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/securechain_test"

engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
async_session_maker = sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with async_session_maker() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope="session")
async def setup_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session(setup_db):
    async with async_session_maker() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession):
    user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        wallet_address="0x1234567890123456789012345678901234567890",
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def manager_user(db_session: AsyncSession):
    user = User(
        email="manager@test.com",
        hashed_password=get_password_hash("manager123"),
        full_name="Manager User",
        wallet_address="0x2234567890123456789012345678901234567890",
        role=UserRole.MANAGER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auditor_user(db_session: AsyncSession):
    user = User(
        email="auditor@test.com",
        hashed_password=get_password_hash("auditor123"),
        full_name="Auditor User",
        wallet_address="0x3234567890123456789012345678901234567890",
        role=UserRole.AUDITOR,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def regular_user(db_session: AsyncSession):
    user = User(
        email="user@test.com",
        hashed_password=get_password_hash("user123"),
        full_name="Regular User",
        wallet_address="0x4234567890123456789012345678901234567890",
        role=UserRole.USER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_token(admin_user: User):
    return create_access_token(
        data={"sub": admin_user.id, "email": admin_user.email, "role": admin_user.role.value}
    )


@pytest_asyncio.fixture
async def user_token(regular_user: User):
    return create_access_token(
        data={"sub": regular_user.id, "email": regular_user.email, "role": regular_user.role.value}
    )


class TestAuth:
    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        response = await client.post("/api/v1/auth/register", json={
            "email": "newuser@test.com",
            "full_name": "New User",
            "password": "password123",
            "wallet_address": "0x5234567890123456789012345678901234567890",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@test.com"
        assert data["role"] == "USER"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, regular_user: User):
        response = await client.post("/api/v1/auth/register", json={
            "email": regular_user.email,
            "full_name": "Another User",
            "password": "password123",
        })
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_register_admin_forbidden(self, client: AsyncClient):
        response = await client.post("/api/v1/auth/register", json={
            "email": "admin2@test.com",
            "full_name": "Admin User",
            "password": "password123",
            "role": "ADMIN",
        })
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, regular_user: User):
        response = await client.post("/api/v1/auth/login", json={
            "email": regular_user.email,
            "password": "user123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_invalid_password(self, client: AsyncClient, regular_user: User):
        response = await client.post("/api/v1/auth/login", json={
            "email": regular_user.email,
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        response = await client.post("/api/v1/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "password123",
        })
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me(self, client: AsyncClient, user_token: str):
        response = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "user@test.com"

    @pytest.mark.asyncio
    async def test_logout(self, client: AsyncClient, user_token: str):
        response = await client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200


class TestUsers:
    @pytest.mark.asyncio
    async def test_list_users_admin(self, client: AsyncClient, admin_token: str):
        response = await client.get("/api/v1/users", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert data["total"] >= 1

    @pytest.mark.asyncio
    async def test_list_users_forbidden(self, client: AsyncClient, user_token: str):
        response = await client.get("/api/v1/users", headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_get_user(self, client: AsyncClient, admin_token: str, regular_user: User):
        response = await client.get(f"/api/v1/users/{regular_user.id}", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == regular_user.id

    @pytest.mark.asyncio
    async def test_update_user_role(self, client: AsyncClient, admin_token: str, regular_user: User):
        response = await client.patch(
            f"/api/v1/users/{regular_user.id}/role",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"role": "MANAGER"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "MANAGER"

    @pytest.mark.asyncio
    async def test_update_own_role_forbidden(self, client: AsyncClient, admin_token: str, admin_user: User):
        response = await client.patch(
            f"/api/v1/users/{admin_user.id}/role",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"role": "USER"},
        )
        assert response.status_code == 400


class TestDIDs:
    @pytest.mark.asyncio
    async def test_create_did(self, client: AsyncClient, admin_token: str, admin_user: User):
        response = await client.post("/api/v1/dids", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 201
        data = response.json()
        assert "did" in data
        assert data["did"].startswith("did:securechain:")
        assert data["wallet_address"] == admin_user.wallet_address
        assert data["verified"] is False

    @pytest.mark.asyncio
    async def test_get_my_did(self, client: AsyncClient, admin_token: str):
        await client.post("/api/v1/dids", headers={"Authorization": f"Bearer {admin_token}"})
        response = await client.get("/api/v1/dids/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "did" in data

    @pytest.mark.asyncio
    async def test_list_dids(self, client: AsyncClient, admin_token: str):
        response = await client.get("/api/v1/dids", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

    @pytest.mark.asyncio
    async def test_verify_did(self, client: AsyncClient, admin_token: str):
        create_resp = await client.post("/api/v1/dids", headers={"Authorization": f"Bearer {admin_token}"})
        did_id = create_resp.json()["id"]

        response = await client.post(f"/api/v1/dids/{did_id}/verify", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is True


class TestAssets:
    @pytest.mark.asyncio
    async def test_create_asset(self, client: AsyncClient, admin_token: str, regular_user: User):
        response = await client.post("/api/v1/assets", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "asset_id": "test-asset-001",
            "name": "Test Asset",
            "description": "A test asset",
            "category": "Equipment",
            "metadata_uri": "ipfs://QmTestHash",
            "initial_owner_id": regular_user.id,
        })
        assert response.status_code == 201
        data = response.json()
        assert data["asset_id"] == "test-asset-001"
        assert data["name"] == "Test Asset"
        assert data["owner_id"] == regular_user.id

    @pytest.mark.asyncio
    async def test_create_asset_unauthorized(self, client: AsyncClient, user_token: str, regular_user: User):
        response = await client.post("/api/v1/assets", headers={"Authorization": f"Bearer {user_token}"}, json={
            "asset_id": "test-asset-002",
            "name": "Test Asset 2",
            "description": "A test asset",
            "category": "Equipment",
            "metadata_uri": "ipfs://QmTestHash2",
            "initial_owner_id": regular_user.id,
        })
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_list_assets(self, client: AsyncClient, admin_token: str):
        response = await client.get("/api/v1/assets", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

    @pytest.mark.asyncio
    async def test_get_asset(self, client: AsyncClient, admin_token: str, regular_user: User):
        create_resp = await client.post("/api/v1/assets", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "asset_id": "test-asset-003",
            "name": "Test Asset 3",
            "description": "A test asset",
            "category": "Equipment",
            "metadata_uri": "ipfs://QmTestHash3",
            "initial_owner_id": regular_user.id,
        })
        asset_id = create_resp.json()["id"]

        response = await client.get(f"/api/v1/assets/{asset_id}", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == asset_id


class TestTransfers:
    @pytest.mark.asyncio
    async def test_create_transfer(self, client: AsyncClient, admin_token: str, regular_user: User):
        create_resp = await client.post("/api/v1/assets", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "asset_id": "test-asset-004",
            "name": "Test Asset 4",
            "description": "A test asset",
            "category": "Equipment",
            "metadata_uri": "ipfs://QmTestHash4",
            "initial_owner_id": regular_user.id,
        })
        asset_id = create_resp.json()["id"]

        response = await client.post("/api/v1/transfers", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "asset_id": asset_id,
            "to_address": "0x5234567890123456789012345678901234567890",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["asset_id"] == asset_id
        assert data["status"] == "PENDING"


class TestAudit:
    @pytest.mark.asyncio
    async def test_list_audit_logs(self, client: AsyncClient, admin_token: str):
        response = await client.get("/api/v1/audit", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

    @pytest.mark.asyncio
    async def test_verify_transaction(self, client: AsyncClient, admin_token: str):
        response = await client.post("/api/v1/audit/verify", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "tx_hash": "0x" + "0" * 64,
        })
        assert response.status_code == 200
        data = response.json()
        assert "verified" in data


class TestBlockchain:
    @pytest.mark.asyncio
    async def test_blockchain_status(self, client: AsyncClient, user_token: str):
        response = await client.get("/api/v1/blockchain/status", headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data