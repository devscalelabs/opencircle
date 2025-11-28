import { Button } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { BroadcastList } from "../../../features/broadcast/components/broadcastList";
import { useBroadcasts } from "../../../features/broadcast/hooks/useBroadcasts";

export const Route = createFileRoute("/_dashboardLayout/broadcast/")({
	head: () => ({
		meta: [
			{
				title: "Broadcasts - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Manage broadcast emails on OpenCircle",
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
	const { data: broadcasts, isLoading } = useBroadcasts();

	return (
		<main>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-2xl">Broadcasts</h1>
				<Link to="/broadcast/new">
					<Button size="sm">Create Broadcast</Button>
				</Link>
			</div>
			<BroadcastList broadcasts={broadcasts || []} loading={isLoading} />
		</main>
	);
}
