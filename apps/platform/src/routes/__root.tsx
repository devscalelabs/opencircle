import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "react-hot-toast";
import { METADATA } from "../constants/metadata";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: METADATA.appName,
			},
			{
				name: "description",
				content: METADATA.appDescription,
			},
			{
				property: "og:title",
				content: METADATA.appName,
			},
			{
				property: "og:description",
				content: METADATA.appDescription,
			},
			{
				property: "og:image",
				content: METADATA.ogImage,
			},
			{
				property: "og:type",
				content: "website",
			},
		],
		links: [
			{
				rel: "icon",
				href: METADATA.favicon,
			},
		],
	}),
	component: RootComponent,
	notFoundComponent: () => {
		return (
			<div>
				<p>This is the notFoundComponent configured on root route</p>
				<Link to="/">Start Over</Link>
			</div>
		);
	},
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<Outlet />
			<Toaster
				toastOptions={{
					style: {
						fontSize: "14px",
					},
				}}
			/>
			<ReactQueryDevtools buttonPosition="bottom-left" />
			<TanStackRouterDevtools position="bottom-right" />
		</>
	);
}
