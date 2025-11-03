import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LeftSidebar } from "../components/leftSidebar";
import { MobileBottomNav } from "../components/mobileBottomNav";
import { RightSidebar } from "../components/rightSidebar";

export const Route = createFileRoute("/_socialLayout")({
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
