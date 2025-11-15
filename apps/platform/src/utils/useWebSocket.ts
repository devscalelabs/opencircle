import { useCallback, useEffect, useRef, useState } from "react";

interface WebSocketMessage {
	type: string;
	data: Record<string, any>;
}

interface UseWebSocketOptions {
	userId: string;
	onMessage?: (message: WebSocketMessage) => void;
	onConnect?: () => void;
	onDisconnect?: () => void;
	onError?: (error: Event) => void;
	heartbeatInterval?: number; // in milliseconds
	reconnectInterval?: number; // in milliseconds
	maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
	isConnected: boolean;
	connectionDuration: number | null;
	lastHeartbeat: string | null;
	subscribe: (type: "user" | "event", targetId: string) => void;
	unsubscribe: (type: "user" | "event", targetId: string) => void;
	sendMessage: (type: string, data: Record<string, any>) => void;
	disconnect: () => void;
	reconnect: () => void;
}

export const useWebSocket = ({
	userId,
	onMessage,
	onConnect,
	onDisconnect,
	onError,
	heartbeatInterval = 30000, // 30 seconds
	reconnectInterval = 3000, // 3 seconds
	maxReconnectAttempts = 5,
}: UseWebSocketOptions): UseWebSocketReturn => {
	const [isConnected, setIsConnected] = useState(false);
	const [connectionDuration, setConnectionDuration] = useState<number | null>(
		null,
	);
	const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

	const wsRef = useRef<WebSocket | null>(null);
	const heartbeatTimerRef = useRef<number | null>(null);
	const reconnectTimerRef = useRef<number | null>(null);
	const reconnectAttemptsRef = useRef(0);
	const shouldReconnectRef = useRef(true);
	const userIdRef = useRef(userId);

	// Update ref when userId changes
	useEffect(() => {
		userIdRef.current = userId;
	}, [userId]);

	const getWebSocketUrl = useCallback(() => {
		const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
		const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
		const wsUrl = apiUrl.replace(/^https?/, wsProtocol);
		return `${wsUrl}/ws?user_id=${userIdRef.current}`;
	}, []);

	const startHeartbeat = useCallback(() => {
		if (heartbeatTimerRef.current) {
			clearInterval(heartbeatTimerRef.current);
		}

		heartbeatTimerRef.current = setInterval(() => {
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.send(
					JSON.stringify({
						type: "heartbeat",
						data: {},
					}),
				);
			}
		}, heartbeatInterval);
	}, [heartbeatInterval]);

	const stopHeartbeat = useCallback(() => {
		if (heartbeatTimerRef.current) {
			clearInterval(heartbeatTimerRef.current);
			heartbeatTimerRef.current = null;
		}
	}, []);

	const connect = useCallback(() => {
		try {
			const wsUrl = getWebSocketUrl();
			const ws = new WebSocket(wsUrl);

			ws.onopen = () => {
				setIsConnected(true);
				reconnectAttemptsRef.current = 0;
				startHeartbeat();
				onConnect?.();
			};

			ws.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);

					// Handle heartbeat acknowledgment
					if (message.type === "heartbeat_ack") {
						setConnectionDuration(message.data.duration_seconds);
						setLastHeartbeat(message.data.timestamp);
					}

					// Call user-provided message handler
					onMessage?.(message);
				} catch (error) {
					console.error("Error parsing WebSocket message:", error);
				}
			};

			ws.onerror = (error) => {
				console.error("WebSocket error:", error);
				onError?.(error);
			};

			ws.onclose = () => {
				setIsConnected(false);
				stopHeartbeat();
				onDisconnect?.();

				// Attempt to reconnect if enabled
				if (
					shouldReconnectRef.current &&
					reconnectAttemptsRef.current < maxReconnectAttempts
				) {
					reconnectAttemptsRef.current++;

					reconnectTimerRef.current = setTimeout(() => {
						connect();
					}, reconnectInterval);
				}
			};

			wsRef.current = ws;
		} catch (error) {
			console.error("Error creating WebSocket connection:", error);
		}
	}, [
		getWebSocketUrl,
		startHeartbeat,
		stopHeartbeat,
		onConnect,
		onMessage,
		onError,
		onDisconnect,
		reconnectInterval,
		maxReconnectAttempts,
	]);

	const disconnect = useCallback(() => {
		shouldReconnectRef.current = false;
		stopHeartbeat();

		if (reconnectTimerRef.current) {
			clearTimeout(reconnectTimerRef.current);
			reconnectTimerRef.current = null;
		}

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}
	}, [stopHeartbeat]);

	const reconnect = useCallback(() => {
		disconnect();
		shouldReconnectRef.current = true;
		reconnectAttemptsRef.current = 0;
		connect();
	}, [disconnect, connect]);

	const sendMessage = useCallback((type: string, data: Record<string, any>) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify({ type, data }));
		} else {
			console.warn("WebSocket is not connected. Cannot send message.");
		}
	}, []);

	const subscribe = useCallback(
		(type: "user" | "event", targetId: string) => {
			sendMessage("subscribe", {
				subscription_type: type,
				target_id: targetId,
			});
		},
		[sendMessage],
	);

	const unsubscribe = useCallback(
		(type: "user" | "event", targetId: string) => {
			sendMessage("unsubscribe", {
				subscription_type: type,
				target_id: targetId,
			});
		},
		[sendMessage],
	);

	// Connect when userId becomes available
	useEffect(() => {
		// Only connect if we have a valid user ID and not already connected
		if (userId && userId.trim() !== "" && !wsRef.current) {
			connect();

			// Cleanup on unmount
			return () => {
				shouldReconnectRef.current = false;
				disconnect();
			};
		}

		// Disconnect if user logs out (userId becomes empty)
		if ((!userId || userId.trim() === "") && wsRef.current) {
			shouldReconnectRef.current = false;
			disconnect();
		}
	}, [userId]); // Connect when userId changes from empty to a value, disconnect when it becomes empty

	return {
		isConnected,
		connectionDuration,
		lastHeartbeat,
		subscribe,
		unsubscribe,
		sendMessage,
		disconnect,
		reconnect,
	};
};
