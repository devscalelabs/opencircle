import { Button } from "@opencircle/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { METADATA } from "../../../constants/metadata";
import { BroadcastView } from "../../../features/broadcast/components/broadcastView";
import { useBroadcastSubmission } from "../../../features/broadcast/hooks/useBroadcastSubmission";
import { useBroadcast } from "../../../features/broadcast/hooks/useBroadcasts";

export const Route = createFileRoute("/_dashboardLayout/broadcast/$id")({
	head: () => ({
		meta: [
			{
				title: "View Broadcast - OpenCircle Admin",
			},
			{
				name: "description",
				content: "View broadcast details",
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
	const { sendTestBroadcast, sendBroadcast, isSendingTest, isSending } =
		useBroadcastSubmission();

	const handleSendTest = async (testEmail: string) => {
		sendTestBroadcast(
			{ id, testEmail },
			{
				onSuccess: () => {
					alert("Test email queued successfully!");
				},
				onError: (error) => {
					alert(`Failed to send test: ${error.message}`);
				},
			},
		);
	};

	const handleSend = async () => {
		if (
			!window.confirm(
				"Are you sure you want to send this broadcast to all users?",
			)
		) {
			return;
		}

		sendBroadcast(id, {
			onSuccess: () => {
				alert("Broadcast queued successfully!");
				navigate({ to: "/broadcast" });
			},
			onError: (error) => {
				alert(`Failed to send broadcast: ${error.message}`);
			},
		});
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
				<div className="flex flex-col items-center justify-center py-12">
					<div className="mb-4 text-foreground/60">Broadcast not found</div>
					<Link to="/broadcast">
						<Button>Back to Broadcasts</Button>
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main>
			<div className="mb-6">
				<Link to="/broadcast">
					<Button variant="ghost" size="sm">
						<ArrowLeft size={16} className="mr-2" />
						Back to Broadcasts
					</Button>
				</Link>
			</div>
			<BroadcastView
				broadcast={broadcast}
				onSendTest={handleSendTest}
				onSend={handleSend}
				isSendingTest={isSendingTest}
				isSending={isSending}
			/>
		</main>
	);
}
