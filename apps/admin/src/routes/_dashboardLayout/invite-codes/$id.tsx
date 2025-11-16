import { Button } from "@opencircle/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useInviteCode } from "../../../features/inviteCode/hooks/useInviteCode";

export const Route = createFileRoute("/_dashboardLayout/invite-codes/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const { inviteCode, isLoading, deleteInviteCode, isDeleting } =
		useInviteCode(id);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!inviteCode) {
		return <div>Invite code not found</div>;
	}

	const statusColors = {
		active: "bg-green-100 text-green-800",
		used: "bg-red-100 text-red-800",
		expired: "bg-gray-100 text-gray-800",
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Header Actions */}
			<div className="flex items-center justify-between">
				<Link to="/invite-codes">
					<Button size="sm">
						<ArrowLeft size={16} className="mr-2" />
						Back to Invite Codes
					</Button>
				</Link>
				<div className="flex gap-2">
					<Button
						variant="destructive"
						onClick={() => setShowDeleteConfirm(true)}
						disabled={isDeleting}
					>
						<Trash2 size={16} className="mr-2" />
						{isDeleting ? "Deleting..." : "Delete Invite Code"}
					</Button>
				</div>
			</div>

			{/* Invite Code Header */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<span
						className={`rounded-full px-3 py-1 font-medium text-sm ${
							statusColors[inviteCode.status as keyof typeof statusColors]
						}`}
					>
						{inviteCode.status}
					</span>
				</div>

				<div className="flex items-center gap-4">
					<h1 className="font-bold font-mono text-4xl">{inviteCode.code}</h1>
				</div>

				{/* Invite Code Meta */}
				<div className="flex flex-wrap items-center gap-6 text-sm">
					<div className="flex items-center gap-2">
						<Users size={16} />
						<span>
							{inviteCode.used_count} /{" "}
							{inviteCode.max_uses === 0 ? "∞" : inviteCode.max_uses} uses
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar size={16} />
						<span>
							Created {format(new Date(inviteCode.created_at), "MMM dd, yyyy")}
						</span>
					</div>
					{inviteCode.expires_at && (
						<div className="flex items-center gap-2">
							<Clock size={16} />
							<span>
								Expires{" "}
								{format(new Date(inviteCode.expires_at), "MMM dd, yyyy")}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Invite Code Details */}
			<div className="rounded-lg border border-border bg-background shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="font-semibold text-lg">Invite Code Information</h2>
				</div>
				<div className="space-y-4 p-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Invite Code ID
							</label>
							<p className="mt-1 font-mono text-sm">{inviteCode.id}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Code
							</label>
							<p className="mt-1 font-mono text-sm">{inviteCode.code}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Max Uses
							</label>
							<p className="mt-1 text-sm">
								{inviteCode.max_uses === 0 ? "Unlimited" : inviteCode.max_uses}
							</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Used Count
							</label>
							<p className="mt-1 text-sm">{inviteCode.used_count}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Status
							</label>
							<p className="mt-1 text-sm capitalize">{inviteCode.status}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Created By
							</label>
							<p className="mt-1 font-mono text-sm">{inviteCode.created_by}</p>
						</div>
						{inviteCode.auto_join_channel_id && (
							<div>
								<label className="block font-medium text-foreground/60 text-sm">
									Auto Join Channel
								</label>
								<p className="mt-1 font-mono text-sm">
									{inviteCode.auto_join_channel_id}
								</p>
							</div>
						)}
						{inviteCode.expires_at && (
							<div>
								<label className="block font-medium text-foreground/60 text-sm">
									Expires At
								</label>
								<p className="mt-1 text-sm">
									{format(new Date(inviteCode.expires_at), "PPP")}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Usage Statistics */}

			{/* Invite Code Footer */}
			<div className="border-t pt-6">
				<div className="flex items-center justify-between">
					<div className="text-sm">
						Invite code created on{" "}
						{format(new Date(inviteCode.created_at), "PPP")}
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
						<h3 className="mb-4 font-semibold text-lg text-red-600">
							Delete Invite Code
						</h3>
						<p className="mb-6 text-foreground/80 text-sm">
							Are you sure you want to permanently delete the invite code{" "}
							<span className="font-mono font-semibold">{inviteCode.code}</span>
							? This action cannot be undone and will remove all usage data.
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
									deleteInviteCode(id, {
										onSuccess: () => {
											navigate({ to: "/invite-codes" });
										},
									});
								}}
								disabled={isDeleting}
							>
								{isDeleting ? "Deleting..." : "Delete Invite Code"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
