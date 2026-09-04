from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload
from app.models import (
    SecurityEvent, SecurityEventType, SecurityEventSeverity, User, UserRole
)


class SecurityService:
    @staticmethod
    async def log_security_event(
        db: AsyncSession,
        event_type: SecurityEventType,
        severity: SecurityEventSeverity = SecurityEventSeverity.MEDIUM,
        actor_id: Optional[int] = None,
        actor_address: Optional[str] = None,
        actor_role: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        reason: Optional[str] = None,
        blockchain_tx_hash: Optional[str] = None,
        blockchain_block_number: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_path: Optional[str] = None,
        request_method: Optional[str] = None,
    ) -> SecurityEvent:
        event = SecurityEvent(
            event_type=event_type,
            severity=severity,
            actor_id=actor_id,
            actor_address=actor_address,
            actor_role=actor_role,
            resource_type=resource_type,
            resource_id=resource_id,
            reason=reason,
            blockchain_tx_hash=blockchain_tx_hash,
            blockchain_block_number=blockchain_block_number,
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=request_path,
            request_method=request_method,
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)
        return event

    @staticmethod
    async def log_unauthorized_transfer_attempt(
        db: AsyncSession,
        actor_id: Optional[int],
        actor_address: Optional[str],
        actor_role: Optional[str],
        token_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_path: Optional[str] = None,
    ) -> SecurityEvent:
        return await SecurityService.log_security_event(
            db=db,
            event_type=SecurityEventType.UNAUTHORIZED_TRANSFER_ATTEMPT,
            severity=SecurityEventSeverity.HIGH,
            actor_id=actor_id,
            actor_address=actor_address,
            actor_role=actor_role,
            resource_type="ASSET",
            resource_id=str(token_id),
            reason="User attempted to transfer assigned asset via ERC721 transfer function",
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=request_path,
        )

    @staticmethod
    async def log_unauthorized_approve_attempt(
        db: AsyncSession,
        actor_id: Optional[int],
        actor_address: Optional[str],
        actor_role: Optional[str],
        token_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_path: Optional[str] = None,
    ) -> SecurityEvent:
        return await SecurityService.log_security_event(
            db=db,
            event_type=SecurityEventType.UNAUTHORIZED_APPROVE_ATTEMPT,
            severity=SecurityEventSeverity.HIGH,
            actor_id=actor_id,
            actor_address=actor_address,
            actor_role=actor_role,
            resource_type="ASSET",
            resource_id=str(token_id),
            reason="User attempted to approve transfer of assigned asset",
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=request_path,
        )

    @staticmethod
    async def log_unauthorized_operator_attempt(
        db: AsyncSession,
        actor_id: Optional[int],
        actor_address: Optional[str],
        actor_role: Optional[str],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_path: Optional[str] = None,
    ) -> SecurityEvent:
        return await SecurityService.log_security_event(
            db=db,
            event_type=SecurityEventType.UNAUTHORIZED_OPERATOR_ATTEMPT,
            severity=SecurityEventSeverity.HIGH,
            actor_id=actor_id,
            actor_address=actor_address,
            actor_role=actor_role,
            resource_type="ASSET",
            resource_id="MULTIPLE",
            reason="User attempted to set approval for all without authorization",
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=request_path,
        )

    @staticmethod
    async def log_unauthorized_api_access(
        db: AsyncSession,
        actor_id: Optional[int],
        actor_address: Optional[str],
        actor_role: Optional[str],
        endpoint: str,
        method: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> SecurityEvent:
        return await SecurityService.log_security_event(
            db=db,
            event_type=SecurityEventType.UNAUTHORIZED_API_ACCESS,
            severity=SecurityEventSeverity.MEDIUM,
            actor_id=actor_id,
            actor_address=actor_address,
            actor_role=actor_role,
            resource_type="API",
            resource_id=endpoint,
            reason=f"Unauthorized access attempt to {method} {endpoint}",
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=endpoint,
            request_method=method,
        )

    @staticmethod
    async def log_repeated_failed_auth(
        db: AsyncSession,
        actor_id: Optional[int],
        actor_address: Optional[str],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> SecurityEvent:
        return await SecurityService.log_security_event(
            db=db,
            event_type=SecurityEventType.REPEATED_FAILED_AUTH,
            severity=SecurityEventSeverity.CRITICAL,
            actor_id=actor_id,
            actor_address=actor_address,
            actor_role="UNKNOWN",
            resource_type="AUTH",
            resource_id="LOGIN",
            reason="Repeated failed authentication attempts detected",
            ip_address=ip_address,
            user_agent=user_agent,
            request_path="/api/v1/auth/login",
            request_method="POST",
        )

    @staticmethod
    async def get_security_events(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        event_type: Optional[SecurityEventType] = None,
        severity: Optional[SecurityEventSeverity] = None,
        resolved: Optional[bool] = None,
        actor_id: Optional[int] = None,
    ) -> tuple[List[SecurityEvent], int]:
        query = select(SecurityEvent).options(
            selectinload(SecurityEvent.actor),
            selectinload(SecurityEvent.resolver)
        )

        if event_type:
            query = query.where(SecurityEvent.event_type == event_type)
        if severity:
            query = query.where(SecurityEvent.severity == severity)
        if resolved is not None:
            query = query.where(SecurityEvent.resolved == resolved)
        if actor_id:
            query = query.where(SecurityEvent.actor_id == actor_id)

        query = query.order_by(desc(SecurityEvent.created_at))

        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query) or 0

        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        events = result.scalars().all()

        return list(events), total

    @staticmethod
    async def get_security_event(db: AsyncSession, event_id: int) -> Optional[SecurityEvent]:
        result = await db.execute(
            select(SecurityEvent)
            .options(
                selectinload(SecurityEvent.actor),
                selectinload(SecurityEvent.resolver)
            )
            .where(SecurityEvent.id == event_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def resolve_security_event(
        db: AsyncSession,
        event_id: int,
        resolved_by: int,
        resolution_notes: Optional[str] = None,
    ) -> Optional[SecurityEvent]:
        result = await db.execute(
            select(SecurityEvent).where(SecurityEvent.id == event_id)
        )
        event = result.scalar_one_or_none()
        if not event:
            return None

        event.resolved = True
        event.resolved_by = resolved_by
        event.resolved_at = datetime.utcnow()
        event.resolution_notes = resolution_notes

        await db.commit()
        await db.refresh(event)
        return event

    @staticmethod
    async def get_unresolved_critical_count(db: AsyncSession) -> int:
        result = await db.execute(
            select(func.count(SecurityEvent.id)).where(
                SecurityEvent.resolved == False,
                SecurityEvent.severity.in_([SecurityEventSeverity.HIGH, SecurityEventSeverity.CRITICAL])
            )
        )
        return result.scalar() or 0

    @staticmethod
    async def get_security_stats(db: AsyncSession) -> dict:
        total = await db.execute(select(func.count(SecurityEvent.id)))
        unresolved = await db.execute(
            select(func.count(SecurityEvent.id)).where(SecurityEvent.resolved == False)
        )
        critical = await db.execute(
            select(func.count(SecurityEvent.id)).where(
                SecurityEvent.resolved == False,
                SecurityEvent.severity == SecurityEventSeverity.CRITICAL
            )
        )
        high = await db.execute(
            select(func.count(SecurityEvent.id)).where(
                SecurityEvent.resolved == False,
                SecurityEvent.severity == SecurityEventSeverity.HIGH
            )
        )

        by_type = await db.execute(
            select(SecurityEvent.event_type, func.count(SecurityEvent.id))
            .where(SecurityEvent.resolved == False)
            .group_by(SecurityEvent.event_type)
        )

        return {
            "total_events": total.scalar() or 0,
            "unresolved_events": unresolved.scalar() or 0,
            "critical_unresolved": critical.scalar() or 0,
            "high_unresolved": high.scalar() or 0,
            "by_type": {str(row[0]): row[1] for row in by_type.all()},
        }


from datetime import datetime