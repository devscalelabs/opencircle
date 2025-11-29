import {
	ArrowLeft01Icon,
	Calendar01Icon,
	Clock01Icon,
	Delete01Icon,
	GridIcon,
	PencilEdit01Icon,
	TextIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge, Button } from "@opencircle/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
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
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!channel) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center gap-4">
				<h2 className="font-bold text-2xl">Channel not found</h2>
				<Link to="/channels">
					<Button variant="outline">Back to Channels</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-8 p-6">
			{/* Header Section */}
			<div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
				<div className="space-y-4">
					<Link
						to="/channels"
						className="flex items-center text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-2" />
						Back to Channels
					</Link>
					<div className="flex items-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 text-4xl shadow-sm">
							{channel.emoji}
						</div>
						<div>
							<h1 className="font-bold text-3xl tracking-tight">
								{channel.name}
							</h1>
							<div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
								<span>#</span>
								<span className="font-mono">{channel.slug}</span>
								<span>•</span>
								<Badge
									variant={channel.type === "public" ? "primary" : "secondary"}
									className="capitalize"
								>
									{channel.type}
								</Badge>
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-3">
					<Link to="/channels/edit/$id" params={{ id }}>
						<Button variant="outline" className="gap-2">
							<HugeiconsIcon icon={PencilEdit01Icon} size={16} />
							Edit Channel
						</Button>
					</Link>
					<Button
						variant="destructive"
						onClick={() => setShowDeleteConfirm(true)}
						disabled={isDeleting}
						className="gap-2"
					>
						<HugeiconsIcon icon={Delete01Icon} size={16} />
						Delete
					</Button>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Main Content - Left Column */}
				<div className="space-y-6 md:col-span-2">
					{/* Overview Card */}
					<div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
						<div className="border-border border-b bg-muted/40 px-6 py-4">
							<h3 className="font-semibold">Overview</h3>
						</div>
						<div className="p-6">
							<div className="space-y-4">
								<div>
									<label className="font-medium text-muted-foreground text-xs uppercase">
										Description
									</label>
									<p className="mt-2 text-foreground/90 leading-relaxed">
										{channel.description || (
											<span className="text-muted-foreground italic">
												No description provided
											</span>
										)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* System Info Card */}
					<div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
						<div className="border-border border-b bg-muted/40 px-6 py-4">
							<h3 className="font-semibold">System Information</h3>
						</div>
						<div className="grid gap-6 p-6 sm:grid-cols-2">
							<div>
								<label className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase">
									<HugeiconsIcon icon={GridIcon} size={14} /> Channel ID
								</label>
								<p className="mt-2 font-mono text-sm">{channel.id}</p>
							</div>
							<div>
								<label className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase">
									<HugeiconsIcon icon={TextIcon} size={14} /> Type
								</label>
								<p className="mt-2 text-sm capitalize">{channel.type}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar - Right Column */}
				<div className="space-y-6">
					{/* Metadata Card */}
					<div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
						<div className="border-border border-b bg-muted/40 px-6 py-4">
							<h3 className="font-semibold">Metadata</h3>
						</div>
						<div className="space-y-4 p-6">
							<div>
								<label className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase">
									<HugeiconsIcon icon={Calendar01Icon} size={14} /> Created At
								</label>
								<p className="mt-1 text-sm">
									{format(new Date(channel.created_at), "PPP")}
								</p>
								<p className="text-muted-foreground text-xs">
									{format(new Date(channel.created_at), "p")}
								</p>
							</div>
							<div className="border-border border-t pt-4">
								<label className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase">
									<HugeiconsIcon icon={Clock01Icon} size={14} /> Last Updated
								</label>
								<p className="mt-1 text-sm">
									{format(new Date(channel.updated_at), "PPP")}
								</p>
								<p className="text-muted-foreground text-xs">
									{format(new Date(channel.updated_at), "p")}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="fade-in zoom-in-95 mx-4 w-full max-w-md animate-in overflow-hidden rounded-xl border border-border bg-background shadow-2xl duration-200">
						<div className="bg-destructive/10 p-6 pb-4">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
									<HugeiconsIcon icon={Delete01Icon} size={24} />
								</div>
								<div>
									<h3 className="font-semibold text-destructive text-lg">
										Delete Channel
									</h3>
									<p className="text-destructive/80 text-sm">
										This action cannot be undone.
									</p>
								</div>
							</div>
						</div>
						<div className="p-6 pt-4">
							<p className="mb-6 text-muted-foreground text-sm leading-relaxed">
								Are you sure you want to permanently delete{" "}
								<span className="font-semibold text-foreground">
									{channel.name}
								</span>
								? This will remove the channel and all associated data from the
								system immediately.
							</p>
							<div className="flex justify-end gap-3">
								<Button
									variant="outline"
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
				</div>
			)}
		</div>
	);
}
