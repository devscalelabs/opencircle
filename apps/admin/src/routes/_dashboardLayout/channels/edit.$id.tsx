import type { ChannelCreate } from "@opencircle/core";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { ChannelForm } from "../../../features/channels/components/channelForm";
import { ChannelMembersManager } from "../../../features/channels/components/channelMembersManager";
import { useChannel } from "../../../features/channels/hooks/useChannel";
import { useUpdateChannel } from "../../../features/channels/hooks/useUpdateChannel";

export const Route = createFileRoute("/_dashboardLayout/channels/edit/$id")({
	head: () => ({
		meta: [
			{
				title: "Edit Channel - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Edit a channel on OpenCircle",
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
	const { id } = Route.useParams();
	const router = useRouter();
	const { channel, isChannelLoading } = useChannel(id);
	const { updateChannel, isUpdating } = useUpdateChannel();

	const handleSave = (data: ChannelCreate) => {
		updateChannel(
			{ id, ...data },
			{
				onSuccess: () => {
					router.navigate({ to: `/channels/${id}` });
				},
			},
		);
	};

	const handleCancel = () => {
		router.navigate({ to: `/channels/${id}` });
	};

	if (isChannelLoading || !channel) {
		return <div>Loading...</div>;
	}

	const isPrivateChannel = channel.type === "private";

	return (
		<div
			className={`mx-auto space-y-6 ${isPrivateChannel ? "max-w-6xl" : "max-w-2xl"}`}
		>
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">Edit Channel</h1>
			</div>
			<div className="rounded-lg border border-border bg-background p-6 shadow-sm">
				<ChannelForm
					initialValues={{
						name: channel.name,
						description: channel.description || "",
						slug: channel.slug,
						type: channel.type,
						emoji: channel.emoji,
					}}
					onSubmit={handleSave}
					onCancel={handleCancel}
					isSubmitting={isUpdating}
					submitLabel="Save Changes"
				/>
			</div>

			{isPrivateChannel && (
				<div className="rounded-lg border border-border bg-background p-6 shadow-sm">
					<h2 className="mb-4 font-semibold text-lg">Manage Members</h2>
					<ChannelMembersManager channelId={id} />
				</div>
			)}
		</div>
	);
}
