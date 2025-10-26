import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LeftSidebar } from "../components/leftSidebar";
import { RightSidebar } from "../components/rightSidebar";

export const Route = createFileRoute("/_socialLayout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="relative flex w-full md:w-[1100px] m-auto min-h-screen">
			<aside className="hidden md:block w-52 border-r border-border">
				<LeftSidebar />
			</aside>
			<main className="w-full md:flex-1">
				<Outlet />
			</main>
			<aside className="hidden md:block w-80 border-x border-border">
				<RightSidebar />
			</aside>
		</main>
	);
}
