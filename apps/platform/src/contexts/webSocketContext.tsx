import { createContext, type ReactNode, useContext } from "react";
import { useAccount } from "../features/auth/hooks/useAccount";
import { useWebSocket } from "../utils/useWebSocket";

interface WebSocketContextType {
	isConnected: boolean;
	connectionDuration: number | null;
	subscribe: (type: "user" | "event", targetId: string) => void;
	unsubscribe: (type: "user" | "event", targetId: string) => void;
	sendMessage: (type: string, data: Record<string, any>) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
	const { account } = useAccount();

	// Use account.id directly - no intermediate state needed
	// WebSocket will only connect when user is logged in (account.id exists)
	const {
		isConnected,
		connectionDuration,
		subscribe,
		unsubscribe,
		sendMessage,
	} = useWebSocket({
		userId: account?.id || "",
		onMessage: () => {},
		onConnect: () => {},
		onDisconnect: () => {},
		onError: () => {
			console.warn("[WebSocket] Connection error");
		},
		heartbeatInterval: 30000,
		reconnectInterval: 5000,
		maxReconnectAttempts: 3,
	});

	return (
		<WebSocketContext.Provider
			value={{
				isConnected,
				connectionDuration,
				subscribe,
				unsubscribe,
				sendMessage,
			}}
		>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocketContext = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error(
			"useWebSocketContext must be used within WebSocketProvider",
		);
	}
	return context;
};
