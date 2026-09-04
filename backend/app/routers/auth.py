from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, UserRole
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    Token,
    UserResponse,
    UserCreate,
    UserRoleUpdate,
)
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user,
    require_owner,
)
from app.services.audit import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if request.wallet_address:
        result = await db.execute(
            select(User).where(User.wallet_address == request.wallet_address)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wallet address already registered",
            )

    if request.role == UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot register as owner",
        )

    hashed_password = get_password_hash(request.password)
    user = User(
        email=request.email,
        full_name=request.full_name,
        wallet_address=request.wallet_address,
        hashed_password=hashed_password,
        role=request.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    await AuditService.log_action(
        db=db,
        actor_id=user.id,
        actor_address=request.wallet_address,
        action="USER_CREATED",
        resource_type="USER",
        resource_id=str(user.id),
        role=request.role.value,
        details=f"User registered with role {request.role.value}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return user


@router.post("/login", response_model=Token)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    user.last_login = datetime.utcnow()
    await db.commit()

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value
        }
    )

    await AuditService.log_action(
        db=db,
        actor_id=user.id,
        actor_address=user.wallet_address,
        action="LOGIN",
        resource_type="USER",
        resource_id=str(user.id),
        role=user.role.value,
        details="User logged in",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=60 * 24 * 7,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="LOGOUT",
        resource_type="USER",
        resource_id=str(current_user.id),
        role=current_user.role.value,
        details="User logged out",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )
    return {"message": "Successfully logged out"}