import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { BroadcastEditor } from "../../../features/broadcast/components/broadcastEditor";
import { useBroadcastSubmission } from "../../../features/broadcast/hooks/useBroadcastSubmission";
import type {
	BroadcastCreate,
	BroadcastUpdate,
} from "../../../features/broadcast/utils/types";

export const Route = createFileRoute("/_dashboardLayout/broadcast/new")({
	head: () => ({
		meta: [
			{
				title: "Create Broadcast - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Create a new broadcast email",
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
	const navigate = useNavigate();
	const { createBroadcast, isCreating } = useBroadcastSubmission();

	const handleSave = async (data: BroadcastCreate | BroadcastUpdate) => {
		createBroadcast(data as BroadcastCreate, {
			onSuccess: (broadcast) => {
				navigate({ to: "/broadcast/$id", params: { id: broadcast.id } });
			},
		});
	};

	const handleCancel = () => {
		navigate({ to: "/broadcast" });
	};

	return (
		<main>
			<BroadcastEditor
				onSave={handleSave}
				onCancel={handleCancel}
				loading={isCreating}
			/>
		</main>
	);
}
