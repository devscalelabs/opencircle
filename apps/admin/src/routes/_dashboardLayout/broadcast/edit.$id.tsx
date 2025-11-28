import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { BroadcastEditor } from "../../../features/broadcast/components/broadcastEditor";
import { useBroadcastSubmission } from "../../../features/broadcast/hooks/useBroadcastSubmission";
import { useBroadcast } from "../../../features/broadcast/hooks/useBroadcasts";
import type { BroadcastUpdate } from "../../../features/broadcast/utils/types";

export const Route = createFileRoute("/_dashboardLayout/broadcast/edit/$id")({
	head: () => ({
		meta: [
			{
				title: "Edit Broadcast - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Edit broadcast email",
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
	const navigate = useNavigate();
	const { data: broadcast, isLoading } = useBroadcast(id);
	const { updateBroadcast, isUpdating } = useBroadcastSubmission();

	const handleSave = async (data: BroadcastUpdate) => {
		updateBroadcast(
			{ id, data },
			{
				onSuccess: () => {
					navigate({ to: "/broadcast/$id", params: { id } });
				},
			},
		);
	};

	const handleCancel = () => {
		navigate({ to: "/broadcast/$id", params: { id } });
	};

	if (isLoading) {
		return (
			<main>
				<div className="flex items-center justify-center py-12">
					<div className="text-foreground/60">Loading...</div>
				</div>
			</main>
		);
	}

	if (!broadcast) {
		return (
			<main>
				<div className="flex items-center justify-center py-12">
					<div className="text-foreground/60">Broadcast not found</div>
				</div>
			</main>
		);
	}

	return (
		<main>
			<BroadcastEditor
				broadcast={broadcast}
				onSave={handleSave}
				onCancel={handleCancel}
				loading={isUpdating}
				isEdit
			/>
		</main>
	);
}
