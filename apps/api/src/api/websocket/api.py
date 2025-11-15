import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from loguru import logger
from sqlmodel import Session

from src.database.engine import get_session

from .connection_manager import manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str = Query(..., description="User ID for the connection"),
    session: Session = Depends(get_session),
):
    """
    WebSocket endpoint for real-time communication.

    Clients can:
    - Subscribe to user events by user_id
    - Subscribe to event updates by event_id
    - Send heartbeat messages to track presence
    - Receive real-time updates

    Query Parameters:
    - user_id: The ID of the user establishing the connection

    Message Format:
    {
        "type": "subscribe" | "unsubscribe" | "heartbeat" | "message",
        "data": {
            "subscription_type": "user" | "event",  // for subscribe/unsubscribe
            "target_id": "user_id or event_id",     // for subscribe/unsubscribe
            "message": "..."                         // for message type
        }
    }
    """
    connection_id = str(uuid.uuid4())

    # Set database session for the connection manager
    manager.db_session = session

    try:
        await manager.connect(websocket, connection_id, user_id)

        # Send connection confirmation
        await manager.send_personal_message(
            {
                "type": "connected",
                "data": {
                    "connection_id": connection_id,
                    "user_id": user_id,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            },
            connection_id,
        )

        # Main message loop
        while True:
            try:
                # Receive message from client
                try:
                    data = await websocket.receive_text()
                except RuntimeError as e:
                    # Connection closed
                    logger.info(f"Connection closed for {connection_id}: {e}")
                    break

                message = json.loads(data)

                message_type = message.get("type")
                message_data = message.get("data", {})

                if message_type == "subscribe":
                    # Handle subscription request
                    subscription_type = message_data.get("subscription_type")
                    target_id = message_data.get("target_id")

                    if subscription_type == "user":
                        manager.subscribe_to_user(connection_id, target_id)
                        await manager.send_personal_message(
                            {
                                "type": "subscribed",
                                "data": {
                                    "subscription_type": "user",
                                    "target_id": target_id,
                                },
                            },
                            connection_id,
                        )
                    elif subscription_type == "event":
                        manager.subscribe_to_event(connection_id, target_id)
                        await manager.send_personal_message(
                            {
                                "type": "subscribed",
                                "data": {
                                    "subscription_type": "event",
                                    "target_id": target_id,
                                },
                            },
                            connection_id,
                        )

                elif message_type == "unsubscribe":
                    # Handle unsubscription request
                    subscription_type = message_data.get("subscription_type")
                    target_id = message_data.get("target_id")

                    if subscription_type == "user":
                        manager.unsubscribe_from_user(connection_id, target_id)
                    elif subscription_type == "event":
                        manager.unsubscribe_from_event(connection_id, target_id)

                    await manager.send_personal_message(
                        {
                            "type": "unsubscribed",
                            "data": {
                                "subscription_type": subscription_type,
                                "target_id": target_id,
                            },
                        },
                        connection_id,
                    )

                elif message_type == "heartbeat":
                    # Update heartbeat timestamp
                    manager.update_heartbeat(connection_id)

                    # Calculate and send connection duration
                    duration = manager.get_connection_duration(connection_id)
                    await manager.send_personal_message(
                        {
                            "type": "heartbeat_ack",
                            "data": {
                                "timestamp": datetime.utcnow().isoformat(),
                                "duration_seconds": duration,
                            },
                        },
                        connection_id,
                    )

                elif message_type == "ping":
                    # Simple ping/pong for connection health check
                    await manager.send_personal_message(
                        {
                            "type": "pong",
                            "data": {"timestamp": datetime.utcnow().isoformat()},
                        },
                        connection_id,
                    )

                else:
                    # Unknown message type
                    await manager.send_personal_message(
                        {
                            "type": "error",
                            "data": {
                                "message": f"Unknown message type: {message_type}"
                            },
                        },
                        connection_id,
                    )

            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON from {connection_id}: {e}")
                try:
                    await manager.send_personal_message(
                        {"type": "error", "data": {"message": "Invalid JSON format"}},
                        connection_id,
                    )
                except Exception:
                    # Connection might be closed, break the loop
                    break
            except Exception as e:
                # Check if it's a connection close error
                if "CloseCode" in str(e) or "disconnect" in str(e).lower():
                    logger.info(f"Connection closing for {connection_id}: {e}")
                    break

                logger.error(f"Error processing message: {e}")
                try:
                    await manager.send_personal_message(
                        {"type": "error", "data": {"message": str(e)}},
                        connection_id,
                    )
                except Exception:
                    # Connection might be closed, break the loop
                    break

    except WebSocketDisconnect:
        # Calculate total session duration
        duration = manager.get_connection_duration(connection_id)
        logger.info(
            f"User {user_id} disconnected after {duration:.2f} seconds (connection: {connection_id})"
        )
        manager.disconnect(connection_id)

    except Exception as e:
        logger.error(f"WebSocket error for connection {connection_id}: {e}")
        manager.disconnect(connection_id)


@router.get("/ws/stats")
async def get_websocket_stats():
    """Get current WebSocket connection statistics"""
    return {
        "active_connections": len(manager.active_connections),
        "active_users": len(manager.get_active_users()),
        "user_subscriptions": len(manager.user_subscriptions),
        "event_subscriptions": len(manager.event_subscriptions),
    }


@router.get("/ws/users/{user_id}/connections")
async def get_user_connections(user_id: str):
    """Get all active connections for a specific user"""
    connections = manager.get_user_connections(user_id)
    connection_details = []

    for conn_id in connections:
        if conn_id in manager.connection_metadata:
            metadata = manager.connection_metadata[conn_id]
            connection_details.append(
                {
                    "connection_id": conn_id,
                    "connected_at": metadata["connected_at"].isoformat(),
                    "last_heartbeat": metadata["last_heartbeat"].isoformat(),
                    "duration_seconds": manager.get_connection_duration(conn_id),
                }
            )

    return {
        "user_id": user_id,
        "connection_count": len(connections),
        "connections": connection_details,
    }
