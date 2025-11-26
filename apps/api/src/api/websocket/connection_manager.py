from datetime import datetime, timezone
from typing import Dict, Set

from fastapi import WebSocket
from loguru import logger
from sqlmodel import Session, select

from src.database.models import UserPresence


class ConnectionManager:
    """Manages WebSocket connections and subscriptions"""

    def __init__(self):
        # Active connections: {connection_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}

        # User subscriptions: {user_id: Set[connection_id]}
        self.user_subscriptions: Dict[str, Set[str]] = {}

        # Event subscriptions: {event_id: Set[connection_id]}
        self.event_subscriptions: Dict[str, Set[str]] = {}

        # Connection metadata: {connection_id: {user_id, connected_at, last_heartbeat}}
        self.connection_metadata: Dict[str, dict] = {}

        # Database session (will be set from API endpoint)
        self.db_session: Session | None = None

    async def connect(self, websocket: WebSocket, connection_id: str, user_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        connected_at = datetime.now(timezone.utc)
        self.active_connections[connection_id] = websocket
        self.connection_metadata[connection_id] = {
            "user_id": user_id,
            "connected_at": connected_at,
            "last_heartbeat": connected_at,
        }
        logger.info(f"WebSocket connected: {connection_id} (user: {user_id})")
        logger.info(
            f"User {user_id} is now active - Total active connections: {len(self.active_connections)}"
        )

        # Save presence record to database
        if self.db_session:
            try:
                presence = UserPresence(
                    user_id=user_id,
                    connection_id=connection_id,
                    connected_at=connected_at.isoformat(),
                )
                self.db_session.add(presence)
                self.db_session.commit()
                logger.info(f"Saved presence record for connection {connection_id}")
            except Exception as e:
                logger.error(f"Error saving presence record: {e}")
                self.db_session.rollback()

    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection and clean up subscriptions"""
        duration = self.get_connection_duration(connection_id)

        if connection_id in self.active_connections:
            del self.active_connections[connection_id]

        # Remove from user subscriptions
        for user_id, connections in list(self.user_subscriptions.items()):
            if connection_id in connections:
                connections.remove(connection_id)
                if not connections:
                    del self.user_subscriptions[user_id]

        # Remove from event subscriptions
        for event_id, connections in list(self.event_subscriptions.items()):
            if connection_id in connections:
                connections.remove(connection_id)
                if not connections:
                    del self.event_subscriptions[event_id]

        # Update presence record in database
        if self.db_session and duration is not None:
            try:
                statement = select(UserPresence).where(
                    UserPresence.connection_id == connection_id
                )
                presence = self.db_session.exec(statement).first()
                if presence:
                    presence.disconnected_at = datetime.now(timezone.utc).isoformat()
                    presence.duration_seconds = duration
                    self.db_session.add(presence)
                    self.db_session.commit()
                    logger.info(
                        f"Updated presence record for connection {connection_id} - Duration: {duration:.2f}s"
                    )
            except Exception as e:
                logger.error(f"Error updating presence record: {e}")
                self.db_session.rollback()

        if connection_id in self.connection_metadata:
            del self.connection_metadata[connection_id]

        logger.info(f"WebSocket disconnected: {connection_id}")

    def subscribe_to_user(self, connection_id: str, user_id: str):
        """Subscribe a connection to user events"""
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()
        self.user_subscriptions[user_id].add(connection_id)
        logger.info(f"Connection {connection_id} subscribed to user {user_id}")

    def unsubscribe_from_user(self, connection_id: str, user_id: str):
        """Unsubscribe a connection from user events"""
        if user_id in self.user_subscriptions:
            self.user_subscriptions[user_id].discard(connection_id)
            if not self.user_subscriptions[user_id]:
                del self.user_subscriptions[user_id]
        logger.info(f"Connection {connection_id} unsubscribed from user {user_id}")

    def subscribe_to_event(self, connection_id: str, event_id: str):
        """Subscribe a connection to event updates"""
        if event_id not in self.event_subscriptions:
            self.event_subscriptions[event_id] = set()
        self.event_subscriptions[event_id].add(connection_id)
        logger.info(f"Connection {connection_id} subscribed to event {event_id}")

    def unsubscribe_from_event(self, connection_id: str, event_id: str):
        """Unsubscribe a connection from event updates"""
        if event_id in self.event_subscriptions:
            self.event_subscriptions[event_id].discard(connection_id)
            if not self.event_subscriptions[event_id]:
                del self.event_subscriptions[event_id]
        logger.info(f"Connection {connection_id} unsubscribed from event {event_id}")

    async def send_personal_message(self, message: dict, connection_id: str):
        """Send a message to a specific connection"""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                # Check if connection is still open
                if websocket.client_state.name == "CONNECTED":
                    await websocket.send_json(message)
                else:
                    logger.warning(
                        f"Connection {connection_id} is not in CONNECTED state"
                    )
                    self.disconnect(connection_id)
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                self.disconnect(connection_id)

    async def broadcast_to_user_subscribers(self, user_id: str, message: dict):
        """Broadcast a message to all connections subscribed to a user"""
        if user_id in self.user_subscriptions:
            disconnected = []
            for connection_id in self.user_subscriptions[user_id]:
                try:
                    await self.send_personal_message(message, connection_id)
                except Exception as e:
                    logger.error(f"Error broadcasting to {connection_id}: {e}")
                    disconnected.append(connection_id)

            # Clean up disconnected connections
            for connection_id in disconnected:
                self.disconnect(connection_id)

    async def broadcast_to_event_subscribers(self, event_id: str, message: dict):
        """Broadcast a message to all connections subscribed to an event"""
        if event_id in self.event_subscriptions:
            disconnected = []
            for connection_id in self.event_subscriptions[event_id]:
                try:
                    await self.send_personal_message(message, connection_id)
                except Exception as e:
                    logger.error(f"Error broadcasting to {connection_id}: {e}")
                    disconnected.append(connection_id)

            # Clean up disconnected connections
            for connection_id in disconnected:
                self.disconnect(connection_id)

    def update_heartbeat(self, connection_id: str):
        """Update the last heartbeat timestamp for a connection"""
        if connection_id in self.connection_metadata:
            self.connection_metadata[connection_id]["last_heartbeat"] = datetime.now(
                timezone.utc
            )
            user_id = self.connection_metadata[connection_id]["user_id"]
            duration = self.get_connection_duration(connection_id)
            logger.info(
                f"User {user_id} active - Connection duration: {duration:.2f}s (connection: {connection_id})"
            )

    def get_connection_duration(self, connection_id: str) -> float | None:
        """Get the duration (in seconds) a connection has been active"""
        if connection_id in self.connection_metadata:
            connected_at = self.connection_metadata[connection_id]["connected_at"]
            return (datetime.now(timezone.utc) - connected_at).total_seconds()
        return None

    def get_user_connections(self, user_id: str) -> list[str]:
        """Get all active connection IDs for a user"""
        return [
            conn_id
            for conn_id, metadata in self.connection_metadata.items()
            if metadata["user_id"] == user_id
        ]

    def get_active_users(self) -> Set[str]:
        """Get all currently active user IDs"""
        return {metadata["user_id"] for metadata in self.connection_metadata.values()}


# Global connection manager instance
manager = ConnectionManager()
