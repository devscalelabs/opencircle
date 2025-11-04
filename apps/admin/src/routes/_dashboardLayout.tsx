import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashBoardLayout } from "../components/dashboardLayout";
import { METADATA } from "../constants/metadata";
import { useAccount } from "../features/auth/hooks/useAccount";

export const Route = createFileRoute("/_dashboardLayout")({
	head: () => ({
		meta: [
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
	const { isAccountLoading, isAccountError } = useAccount();

	if (isAccountLoading || isAccountError) {
		return null;
	}

	return (
		<DashBoardLayout>
			<Outlet />
		</DashBoardLayout>
	);
}
