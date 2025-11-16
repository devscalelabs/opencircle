import { Button } from "@opencircle/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Hash, Trash2, Type } from "lucide-react";
import { useState } from "react";
import { useChannel } from "../../../features/channels/hooks/useChannel";
import { useDeleteChannel } from "../../../features/channels/hooks/useDeleteChannel";

export const Route = createFileRoute("/_dashboardLayout/channels/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const { channel, isChannelLoading } = useChannel(id);
	const { deleteChannel, isDeleting } = useDeleteChannel();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	if (isChannelLoading) {
		return <div>Loading...</div>;
	}

	if (!channel) {
		return <div>Channel not found</div>;
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Header Actions */}
			<div className="flex items-center justify-between">
				<Link to="/channels">
					<Button size="sm">
						<ArrowLeft size={16} className="mr-2" />
						Back to Channels
					</Button>
				</Link>
				<div className="flex gap-2">
					<Button
						variant="destructive"
						onClick={() => setShowDeleteConfirm(true)}
						disabled={isDeleting}
					>
						<Trash2 size={16} className="mr-2" />
						{isDeleting ? "Deleting..." : "Delete Channel"}
					</Button>
				</div>
			</div>

			{/* Channel Header */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<span
						className={`rounded-full px-3 py-1 font-medium text-sm ${
							channel.type === "public"
								? "bg-green-100 text-green-800"
								: "bg-blue-100 text-blue-800"
						}`}
					>
						{channel.type}
					</span>
				</div>

				<div className="flex items-center gap-4">
					<span className="text-4xl">{channel.emoji}</span>
					<h1 className="font-bold text-4xl">{channel.name}</h1>
				</div>

				{/* Channel Meta */}
				<div className="flex flex-wrap items-center gap-6 text-sm">
					<div className="flex items-center gap-2">
						<Hash size={16} />
						<span>{channel.slug}</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar size={16} />
						<span>
							Created {format(new Date(channel.created_at), "MMM dd, yyyy")}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Clock size={16} />
						<span>
							Updated {format(new Date(channel.updated_at), "MMM dd, yyyy")}
						</span>
					</div>
				</div>
			</div>

			{/* Channel Details */}
			<div className="rounded-lg border border-border bg-background shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="font-semibold text-lg">Channel Information</h2>
				</div>
				<div className="space-y-4 p-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Channel ID
							</label>
							<p className="mt-1 text-sm">{channel.id}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Name
							</label>
							<p className="mt-1 text-sm">{channel.name}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Slug
							</label>
							<p className="mt-1 text-sm">{channel.slug}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Type
							</label>
							<p className="mt-1 flex items-center gap-2 text-sm capitalize">
								<Type size={14} />
								{channel.type}
							</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Emoji
							</label>
							<p className="mt-1 text-2xl">{channel.emoji}</p>
						</div>
					</div>

					{channel.description && (
						<div className="pt-4">
							<label className="block font-medium text-foreground/60 text-sm">
								Description
							</label>
							<p className="mt-1 text-sm">{channel.description}</p>
						</div>
					)}
				</div>
			</div>

			{/* Channel Footer */}
			<div className="border-t pt-6">
				<div className="flex items-center justify-between">
					<div className="text-sm">
						Channel created on {format(new Date(channel.created_at), "PPP")}
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
						<h3 className="mb-4 font-semibold text-lg text-red-600">
							Delete Channel
						</h3>
						<p className="mb-6 text-foreground/80 text-sm">
							Are you sure you want to permanently delete{" "}
							<span className="font-semibold">{channel.name}</span>? This action
							cannot be undone and will remove the channel from the system.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="secondary"
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isDeleting}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									deleteChannel(id, {
										onSuccess: () => {
											navigate({ to: "/channels" });
										},
									});
								}}
								disabled={isDeleting}
							>
								{isDeleting ? "Deleting..." : "Delete Channel"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
