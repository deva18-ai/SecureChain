from typing import List, Optional, TypeVar
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, UserRole, SecurityEvent, SecurityEventType, SecurityEventSeverity
from app.schemas import (
    SecurityEventResponse,
    SecurityEventWithDetails,
    PaginatedResponse,
    SecurityEventResolve,
)
from app.auth import get_current_active_user, require_admin, require_admin_or_manager
from app.services.security import SecurityService
from app.services.audit import AuditService

router = APIRouter(prefix="/security", tags=["Security Events"])

SecurityEventListResponse = PaginatedResponse[SecurityEventWithDetails]


@router.get("", response_model=SecurityEventListResponse)
async def list_security_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    event_type: Optional[SecurityEventType] = None,
    severity: Optional[SecurityEventSeverity] = None,
    resolved: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    events, total = await SecurityService.get_security_events(
        db=db,
        page=page,
        page_size=page_size,
        event_type=event_type,
        severity=severity,
        resolved=resolved,
    )

    items = []
    for event in events:
        items.append(
            SecurityEventWithDetails(
                id=event.id,
                event_type=event.event_type,
                severity=event.severity,
                actor_id=event.actor_id,
                actor_address=event.actor_address,
                actor_role=event.actor_role,
                resource_type=event.resource_type,
                resource_id=event.resource_id,
                reason=event.reason,
                blockchain_tx_hash=event.blockchain_tx_hash,
                blockchain_block_number=event.blockchain_block_number,
                ip_address=event.ip_address,
                user_agent=event.user_agent,
                request_path=event.request_path,
                request_method=event.request_method,
                resolved=event.resolved,
                resolved_by=event.resolved_by,
                resolved_at=event.resolved_at,
                resolution_notes=event.resolution_notes,
                created_at=event.created_at,
                actor=event.actor,
                resolver=event.resolver,
            )
        )

    return SecurityEventListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/stats", response_model=dict)
async def get_security_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stats = await SecurityService.get_security_stats(db)
    return stats


@router.get("/unresolved-critical-count", response_model=int)
async def get_unresolved_critical_count(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    count = await SecurityService.get_unresolved_critical_count(db)
    return count


@router.get("/{event_id}", response_model=SecurityEventWithDetails)
async def get_security_event(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    event = await SecurityService.get_security_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Security event not found")

    return SecurityEventWithDetails(
        id=event.id,
        event_type=event.event_type,
        severity=event.severity,
        actor_id=event.actor_id,
        actor_address=event.actor_address,
        actor_role=event.actor_role,
        resource_type=event.resource_type,
        resource_id=event.resource_id,
        reason=event.reason,
        blockchain_tx_hash=event.blockchain_tx_hash,
        blockchain_block_number=event.blockchain_block_number,
        ip_address=event.ip_address,
        user_agent=event.user_agent,
        request_path=event.request_path,
        request_method=event.request_method,
        resolved=event.resolved,
        resolved_by=event.resolved_by,
        resolved_at=event.resolved_at,
        resolution_notes=event.resolution_notes,
        created_at=event.created_at,
        actor=event.actor,
        resolver=event.resolver,
    )


@router.post("/{event_id}/resolve", response_model=SecurityEventResponse)
async def resolve_security_event(
    event_id: int,
    request: SecurityEventResolve,
    current_user: User = Depends(require_admin_or_manager),
    db: AsyncSession = Depends(get_db),
    http_request: Request = None,
):
    event = await SecurityService.resolve_security_event(
        db=db,
        event_id=event_id,
        resolved_by=current_user.id,
        resolution_notes=request.resolution_notes,
    )
    if not event:
        raise HTTPException(status_code=404, detail="Security event not found")

    await AuditService.log_action(
        db=db,
        actor_id=current_user.id,
        actor_address=current_user.wallet_address,
        action="ASSET_STATUS_CHANGED",  # Reuse existing action
        resource_type="SECURITY_EVENT",
        resource_id=str(event_id),
        role=current_user.role.value,
        details=f"Resolved security event: {request.resolution_notes}",
        ip_address=http_request.client.host if http_request and http_request.client else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    return event