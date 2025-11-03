import { Button } from "@opencircle/ui";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useInviteCode } from "../hooks/useInviteCode";

interface InviteCodeViewProps {
	id: string;
	onEdit?: () => void;
	onDelete?: () => void;
}

export const InviteCodeView = ({
	id,
	onEdit,
	onDelete,
}: InviteCodeViewProps) => {
	const { inviteCode, isLoading, deleteInviteCode, isDeleting } =
		useInviteCode(id);

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this invite code?")) {
			try {
				await deleteInviteCode(id);
				if (onDelete) onDelete();
			} catch (error) {
				console.error("Failed to delete invite code:", error);
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<div className="h-8 w-8 animate-spin rounded-full border-border border-b-2"></div>
			</div>
		);
	}

	if (!inviteCode) {
		return (
			<div className="py-12 text-center">
				<p className="mb-4 text-gray-500">Invite code not found</p>
				<Link to="/invite-codes">
					<Button>Back to Invite Codes</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link to="/invite-codes">
						<Button variant="secondary" size="sm">
							<ArrowLeft size={16} className="mr-2" />
							Back
						</Button>
					</Link>
					<h1 className="font-bold text-3xl">Invite Code Details</h1>
				</div>
				<div className="flex gap-2">
					{onEdit && (
						<Button variant="secondary" onClick={onEdit}>
							<Edit size={16} className="mr-2" />
							Edit
						</Button>
					)}
					{onDelete && (
						<Button
							variant="secondary"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							<Trash2 size={16} className="mr-2" />
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					)}
				</div>
			</div>

			<div className="space-y-6 rounded-lg border border-border bg-white p-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<h3 className="mb-2 font-medium text-gray-500 text-sm">Code</h3>
						<p className="rounded border bg-gray-50 p-3 font-mono text-lg">
							{inviteCode.code}
						</p>
					</div>

					<div>
						<h3 className="mb-2 font-medium text-gray-500 text-sm">Status</h3>
						<div className="flex items-center gap-2">
							<span
								className={`rounded-full px-3 py-1 font-medium text-sm capitalize ${
									inviteCode.status === "active"
										? "bg-green-100 text-green-800"
										: inviteCode.status === "used"
											? "bg-red-100 text-red-800"
											: "bg-gray-100 text-gray-800"
								}`}
							>
								{inviteCode.status}
							</span>
						</div>
					</div>

					<div>
						<h3 className="mb-2 font-medium text-gray-500 text-sm">Usage</h3>
						<p className="text-lg">
							{inviteCode.used_count} /{" "}
							{inviteCode.max_uses === 0 ? "Unlimited" : inviteCode.max_uses}
						</p>
						{inviteCode.max_uses > 0 && (
							<div className="mt-2 h-2 w-full rounded-full bg-gray-200">
								<div
									className="h-2 rounded-full bg-blue-600"
									style={{
										width: `${Math.min(
											(inviteCode.used_count / inviteCode.max_uses) * 100,
											100,
										)}%`,
									}}
								></div>
							</div>
						)}
					</div>

					<div>
						<h3 className="mb-2 font-medium text-gray-500 text-sm">
							Expires At
						</h3>
						<p className="text-lg">
							{inviteCode.expires_at
								? format(new Date(inviteCode.expires_at), "PPP p")
								: "Never"}
						</p>
					</div>

					<div>
						<h3 className="mb-2 font-medium text-gray-500 text-sm">
							Auto Join Channel
						</h3>
						<p className="text-lg">
							{inviteCode.auto_join_channel_id ? (
								<span className="rounded border bg-gray-50 px-3 py-1 font-mono">
									{inviteCode.auto_join_channel_id}
								</span>
							) : (
								<span className="text-gray-500">None</span>
							)}
						</p>
					</div>

					<div>
						<h3 className="mb-2 font-medium text-gray-500 text-sm">
							Created By
						</h3>
						<p className="font-mono text-lg">{inviteCode.created_by}</p>
					</div>

					<div>
						<h3 className="mb-2 font-medium text-gray-500 text-sm">
							Created At
						</h3>
						<p className="text-lg">
							{format(new Date(inviteCode.created_at), "PPP p")}
						</p>
					</div>

					<div>
						<h3 className="mb-2 font-medium text-gray-500 text-sm">
							Updated At
						</h3>
						<p className="text-lg">
							{format(new Date(inviteCode.updated_at), "PPP p")}
						</p>
					</div>
				</div>

				<div className="border-t pt-6">
					<h3 className="mb-4 font-medium text-lg">Usage Statistics</h3>
					<div className="rounded-lg bg-gray-50 p-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="text-center">
								<p className="font-bold text-2xl text-blue-600">
									{inviteCode.used_count}
								</p>
								<p className="text-gray-500 text-sm">Times Used</p>
							</div>
							<div className="text-center">
								<p className="font-bold text-2xl text-green-600">
									{inviteCode.max_uses === 0
										? "∞"
										: Math.max(0, inviteCode.max_uses - inviteCode.used_count)}
								</p>
								<p className="text-gray-500 text-sm">Remaining Uses</p>
							</div>
							<div className="text-center">
								<p className="font-bold text-2xl text-purple-600">
									{inviteCode.max_uses === 0
										? "N/A"
										: Math.round(
												(inviteCode.used_count / inviteCode.max_uses) * 100,
											)}
									%
								</p>
								<p className="text-gray-500 text-sm">Usage Rate</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
