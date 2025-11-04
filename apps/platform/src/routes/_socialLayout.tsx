import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LeftSidebar } from "../components/leftSidebar";
import { MobileBottomNav } from "../components/mobileBottomNav";
import { RightSidebar } from "../components/rightSidebar";
import { METADATA } from "../constants/metadata";

export const Route = createFileRoute("/_socialLayout")({
	head: () => ({
		meta: [
			{
				title: "Timeline - OpenCircle",
			},
			{
				name: "description",
				content:
					"Connect with creators and explore amazing content on OpenCircle",
			},
			{
				property: "og:title",
				content: "Timeline - OpenCircle",
			},
			{
				property: "og:description",
				content:
					"Connect with creators and explore amazing content on OpenCircle",
			},
			{
				property: "og:image",
				content: METADATA.ogImage,
			},
		],
		links: [
			{
				rel: "icon",
				href: METADATA.favicon,
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="relative m-auto flex min-h-screen w-full md:w-[1150px]">
			<aside className="hidden w-58 border-border border-r md:block">
				<LeftSidebar />
			</aside>
			<main className="w-full pb-16 md:flex-1 md:pb-0">
				<Outlet />
			</main>
			<aside className="hidden w-80 border-border border-x md:block">
				<RightSidebar />
			</aside>
			<MobileBottomNav />
		</main>
	);
}
