import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { WebSocketProvider } from "./contexts/webSocketContext";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const queryClient = new QueryClient();

const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<QueryClientProvider client={queryClient}>
		<WebSocketProvider>
			<RouterProvider router={router} />
		</WebSocketProvider>
	</QueryClientProvider>,
);
