import { Button } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";
import { ChannelTable } from "../../features/channels/components/channelTable";
import { CreateChannelDialog } from "../../features/channels/components/createChannelDialog";
import { useChannels } from "../../features/channels/hooks/useChannels";

export const Route = createFileRoute("/_dashboardLayout/channels")({
	head: () => ({
		meta: [
			{
				title: "Channels - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Manage channels on OpenCircle",
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
	const { channels, isChannelsLoading } = useChannels();

	return (
		<main>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-2xl">Channels</h1>
				<CreateChannelDialog>
					<Button size="sm">Create Channel</Button>
				</CreateChannelDialog>
			</div>
			<ChannelTable channels={channels} isLoading={isChannelsLoading} />
		</main>
	);
}
