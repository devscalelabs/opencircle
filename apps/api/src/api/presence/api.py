from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, col, desc, func, select

from src.database.engine import get_session
from src.database.models import User, UserPresence

router = APIRouter()


@router.get("/stats")
async def get_presence_stats(
    session: Session = Depends(get_session),
):
    """
    Get overall presence statistics (filters out stale connections)
    """
    # Filter for recent activity to avoid counting stale connections
    stale_cutoff = datetime.now(timezone.utc) - timedelta(minutes=30)

    # Total sessions
    total_sessions = session.exec(select(func.count(col(UserPresence.id)))).one()

    # Active sessions (not disconnected yet and not stale)
    active_sessions = session.exec(
        select(func.count(col(UserPresence.id))).where(
            col(UserPresence.disconnected_at).is_(None),
            col(UserPresence.updated_at) >= stale_cutoff,
        )
    ).one()

    # Average session duration
    avg_duration = session.exec(
        select(func.avg(col(UserPresence.duration_seconds))).where(
            col(UserPresence.duration_seconds).is_not(None),
        )
    ).one()

    # Total unique users
    unique_users = session.exec(
        select(func.count(func.distinct(col(UserPresence.user_id))))
    ).one()

    return {
        "total_sessions": total_sessions,
        "active_sessions": active_sessions,
        "average_duration_seconds": round(avg_duration, 2) if avg_duration else 0,
        "unique_users": unique_users,
    }


@router.get("/user/{user_id}")
async def get_user_presence(
    user_id: str,
    limit: int = Query(default=100, le=1000),
    session: Session = Depends(get_session),
):
    """
    Get presence history for a specific user
    """
    statement = (
        select(UserPresence)
        .where(col(UserPresence.user_id) == user_id)
        .order_by(desc(col(UserPresence.connected_at)))
        .limit(limit)
    )
    presences = session.exec(statement).all()

    return {
        "user_id": user_id,
        "total_sessions": len(presences),
        "sessions": [
            {
                "id": p.id,
                "connection_id": p.connection_id,
                "connected_at": p.connected_at,
                "disconnected_at": p.disconnected_at,
                "duration_seconds": p.duration_seconds,
            }
            for p in presences
        ],
    }


@router.get("/timeseries")
async def get_presence_timeseries(
    start_date: str = Query(..., description="Start date in ISO format"),
    end_date: str = Query(..., description="End date in ISO format"),
    interval: str = Query(
        default="hour", description="Aggregation interval: hour, day, week"
    ),
    session: Session = Depends(get_session),
):
    """
    Get presence data aggregated by time intervals for visualization
    """
    # Parse dates
    start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
    end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

    # Query all presence records in the date range
    statement = select(UserPresence).where(
        col(UserPresence.connected_at) >= start.isoformat(),
        col(UserPresence.connected_at) <= end.isoformat(),
    )
    presences = session.exec(statement).all()

    # Aggregate by interval
    timeseries_data = {}

    for presence in presences:
        connected_at = datetime.fromisoformat(
            presence.connected_at.replace("Z", "+00:00")
        )

        # Determine bucket based on interval
        if interval == "hour":
            bucket = connected_at.replace(minute=0, second=0, microsecond=0)
        elif interval == "day":
            bucket = connected_at.replace(hour=0, minute=0, second=0, microsecond=0)
        elif interval == "week":
            # Start of week (Monday)
            days_since_monday = connected_at.weekday()
            bucket = (connected_at - timedelta(days=days_since_monday)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
        else:
            bucket = connected_at.replace(minute=0, second=0, microsecond=0)

        bucket_key = bucket.isoformat()

        if bucket_key not in timeseries_data:
            timeseries_data[bucket_key] = {
                "timestamp": bucket_key,
                "session_count": 0,
                "unique_users": set(),
                "total_duration": 0,
            }

        timeseries_data[bucket_key]["session_count"] += 1
        timeseries_data[bucket_key]["unique_users"].add(presence.user_id)
        if presence.duration_seconds:
            timeseries_data[bucket_key]["total_duration"] += presence.duration_seconds

    # Convert to list and format
    result = []
    for bucket_key in sorted(timeseries_data.keys()):
        data = timeseries_data[bucket_key]
        result.append(
            {
                "timestamp": data["timestamp"],
                "session_count": data["session_count"],
                "unique_users": len(data["unique_users"]),
                "total_duration_seconds": round(data["total_duration"], 2),
                "average_duration_seconds": (
                    round(data["total_duration"] / data["session_count"], 2)
                    if data["session_count"] > 0
                    else 0
                ),
            }
        )

    return {
        "start_date": start_date,
        "end_date": end_date,
        "interval": interval,
        "data": result,
    }


@router.post("/cleanup")
async def cleanup_stale_presence(
    session: Session = Depends(get_session),
):
    """
    Clean up stale presence records (connections older than 1 hour without disconnect)
    """
    stale_cutoff = datetime.now(timezone.utc) - timedelta(hours=1)

    # Find stale connections (no disconnect time and older than 1 hour)
    stale_statement = select(UserPresence).where(
        col(UserPresence.disconnected_at).is_(None),
        col(UserPresence.updated_at) < stale_cutoff,
    )
    stale_records = session.exec(stale_statement).all()

    # Mark them as disconnected
    for record in stale_records:
        record.disconnected_at = stale_cutoff.isoformat()
        record.duration_seconds = (
            datetime.fromisoformat(record.disconnected_at.replace("Z", "+00:00"))
            - datetime.fromisoformat(record.connected_at.replace("Z", "+00:00"))
        ).total_seconds()
        session.add(record)

    session.commit()

    return {
        "cleaned_up": len(stale_records),
        "message": f"Cleaned up {len(stale_records)} stale presence records",
    }


@router.get("/active-now")
async def get_active_users_now(
    session: Session = Depends(get_session),
):
    """
    Get currently active users (connections without disconnect time, filtered for recent activity)
    """
    # Filter for connections that are either very recent (within last 5 minutes)
    # or have been updated recently (within last 30 minutes)
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=30)

    statement = (
        select(UserPresence, User)
        .join(User, col(UserPresence.user_id) == col(User.id))
        .where(
            col(UserPresence.disconnected_at).is_(None),
            col(UserPresence.updated_at) >= cutoff_time,
        )
    )
    results = session.exec(statement).all()

    return {
        "active_count": len(results),
        "active_users": [
            {
                "user_id": presence.user_id,
                "username": user.username,
                "name": user.name,
                "connection_id": presence.connection_id,
                "connected_at": presence.connected_at,
                "duration_seconds": max(
                    0,
                    (
                        datetime.now(timezone.utc)
                        - datetime.fromisoformat(
                            presence.connected_at.replace("Z", "+00:00")
                        )
                    ).total_seconds(),
                ),
            }
            for presence, user in results
        ],
    }
