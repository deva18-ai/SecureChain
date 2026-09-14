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
    require_admin,
)
from app.services.audit import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    # Validate email not already registered
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Validate wallet address if provided
    if request.wallet_address:
        # Validate wallet address format (Ethereum address)
        if not request.wallet_address.startswith("0x") or len(request.wallet_address) != 42:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Ethereum wallet address format",
            )

        result = await db.execute(
            select(User).where(User.wallet_address == request.wallet_address)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wallet address already registered",
            )

    # Prevent direct admin registration
    if request.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot register as admin",
        )

    # Create user
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

    # Log user creation
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

    # Auto-create DID on blockchain (if wallet provided and blockchain configured)
    try:
        from app.models import DID
        from app.services.blockchain import BlockchainService
        import hashlib
        import time
        
        # Generate unique DID
        timestamp = int(time.time() * 1000)
        did_identifier = f"did:securechain:user:{user.id}:{timestamp}"
        
        # Generate identity hash
        wallet_for_hash = user.wallet_address if user.wallet_address else f"pending:{user.id}"
        identity_data = f"{user.email}{wallet_for_hash}{user.full_name}{timestamp}"
        identity_hash = "0x" + hashlib.sha256(identity_data.encode()).hexdigest()
        
        # Try to create on blockchain ONLY if wallet address is provided
        blockchain = BlockchainService()
        tx_hash = None
        
        if user.wallet_address and blockchain.is_connected():
            try:
                tx_hash = await blockchain.create_identity(
                    did=did_identifier,
                    wallet=user.wallet_address,
                    identity_hash=identity_hash
                )
                print(f"✅ Blockchain DID created successfully: {tx_hash}")
            except Exception as blockchain_error:
                print(f"⚠️ Blockchain DID creation failed (non-fatal): {blockchain_error}")
                # Continue even if blockchain fails - DID still created in DB
        elif not user.wallet_address:
            print(f"ℹ️ No wallet address provided - DID created in DB only, blockchain creation pending")
        
        # Create DID in database
        did = DID(
            user_id=user.id,
            did=did_identifier,
            wallet_address=user.wallet_address if user.wallet_address else "0x0000000000000000000000000000000000000000",  # Placeholder
            identity_hash=identity_hash,
            blockchain_tx_hash=tx_hash,
            verified=bool(tx_hash),  # Auto-verify if blockchain TX succeeded
            verified_at=datetime.utcnow() if tx_hash else None,
        )
        db.add(did)
        await db.commit()
        await db.refresh(user)
        
        # Log DID creation
        status_message = ""
        if tx_hash:
            status_message = f" with blockchain TX: {tx_hash}"
        elif user.wallet_address:
            status_message = " (blockchain offline)"
        else:
            status_message = " (wallet pending - blockchain creation deferred)"
            
        await AuditService.log_action(
            db=db,
            actor_id=user.id,
            actor_address=user.wallet_address,
            action="IDENTITY_CREATED",
            resource_type="DID",
            resource_id=did_identifier,
            role=user.role.value,
            details=f"DID automatically created during registration{status_message}",
            blockchain_tx_hash=tx_hash,
            ip_address=http_request.client.host if http_request and http_request.client else None,
            user_agent=http_request.headers.get("user-agent") if http_request else None,
        )
        
    except Exception as did_error:
        # Log error but don't fail registration
        print(f"❌ Auto-DID creation failed (non-fatal): {did_error}")
        import traceback
        traceback.print_exc()
        # User still created successfully, DID can be created later

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