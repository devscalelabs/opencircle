import { Button } from "@opencircle/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
	ArrowLeft,
	Ban,
	Calendar,
	Clock,
	Mail,
	Shield,
	Trash2,
	User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useBanUser } from "../../../features/user/hooks/useBanUser";
import { useDeleteUser } from "../../../features/user/hooks/useDeleteUser";
import { usePromoteToAdmin } from "../../../features/user/hooks/usePromoteToAdmin";
import { useUnbanUser } from "../../../features/user/hooks/useUnbanUser";
import { useUser } from "../../../features/user/hooks/useUser";

export const Route = createFileRoute("/_dashboardLayout/users/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const { user, isUserLoading } = useUser(id);
	const { banUser, isBanning } = useBanUser();
	const { unbanUser, isUnbanning } = useUnbanUser();
	const { deleteUser, isDeleting } = useDeleteUser();
	const { promoteToAdmin, isPromoting } = usePromoteToAdmin();
	const [showBanConfirm, setShowBanConfirm] = useState(false);
	const [showUnbanConfirm, setShowUnbanConfirm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);

	if (isUserLoading) {
		return <div>Loading...</div>;
	}

	if (!user) {
		return <div>User not found</div>;
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Header Actions */}
			<div className="flex items-center justify-between">
				<Link to="/users">
					<Button size="sm">
						<ArrowLeft size={16} className="mr-2" />
						Back to Users
					</Button>
				</Link>
				<div className="flex gap-2">
					{user.role !== "admin" && (
						<Button
							variant="primary"
							onClick={() => setShowPromoteConfirm(true)}
							disabled={isPromoting}
						>
							<Shield size={16} className="mr-2" />
							{isPromoting ? "Promoting..." : "Raise to Admin"}
						</Button>
					)}
					{user.is_active ? (
						<Button
							variant="destructive"
							onClick={() => setShowBanConfirm(true)}
							disabled={isBanning}
						>
							<Ban size={16} className="mr-2" />
							{isBanning ? "Banning..." : "Ban User"}
						</Button>
					) : (
						<Button
							variant="secondary"
							onClick={() => setShowUnbanConfirm(true)}
							disabled={isUnbanning}
						>
							{isUnbanning ? "Unbanning..." : "Unban User"}
						</Button>
					)}
					<Button
						variant="destructive"
						onClick={() => setShowDeleteConfirm(true)}
						disabled={isDeleting}
					>
						<Trash2 size={16} className="mr-2" />
						{isDeleting ? "Deleting..." : "Delete User"}
					</Button>
				</div>
			</div>

			{/* User Header */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<span
						className={`rounded-full px-3 py-1 font-medium text-sm ${
							user.is_active
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{user.is_active ? "Active" : "Inactive"}
					</span>
					<span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-sm capitalize">
						{user.role}
					</span>
				</div>

				<h1 className="font-bold text-4xl">{user.name || user.username}</h1>

				{/* User Meta */}
				<div className="flex flex-wrap items-center gap-6 text-sm">
					<div className="flex items-center gap-2">
						<UserIcon size={16} />
						<span>@{user.username}</span>
					</div>
					<div className="flex items-center gap-2">
						<Mail size={16} />
						<span>{user.email}</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar size={16} />
						<span>
							Joined {format(new Date(user.created_at), "MMM dd, yyyy")}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Clock size={16} />
						<span>
							Updated {format(new Date(user.updated_at), "MMM dd, yyyy")}
						</span>
					</div>
				</div>
			</div>

			{/* User Details */}
			<div className="rounded-lg border border-border bg-background shadow-sm">
				<div className="border-border border-b px-6 py-4">
					<h2 className="font-semibold text-lg">User Information</h2>
				</div>
				<div className="space-y-4 p-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								User ID
							</label>
							<p className="mt-1 text-sm">{user.id}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Username
							</label>
							<p className="mt-1 text-sm">@{user.username}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Full Name
							</label>
							<p className="mt-1 text-sm">{user.name || "Not provided"}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Email
							</label>
							<p className="mt-1 text-sm">{user.email}</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Role
							</label>
							<p className="mt-1 flex items-center gap-2 text-sm capitalize">
								<Shield size={14} />
								{user.role}
							</p>
						</div>
						<div>
							<label className="block font-medium text-foreground/60 text-sm">
								Status
							</label>
							<p className="mt-1 text-sm">
								{user.is_active ? "Active" : "Inactive"}
							</p>
						</div>
					</div>

					{user.bio && (
						<div className="pt-4">
							<label className="block font-medium text-foreground/60 text-sm">
								Bio
							</label>
							<p className="mt-1 text-sm">{user.bio}</p>
						</div>
					)}
				</div>
			</div>

			{/* User Footer */}
			<div className="border-t pt-6">
				<div className="flex items-center justify-between">
					<div className="text-sm">
						Account created on {format(new Date(user.created_at), "PPP")}
					</div>
				</div>
			</div>

			{/* Ban Confirmation Dialog */}
			{showBanConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
						<h3 className="mb-4 font-semibold text-lg">Ban User</h3>
						<p className="mb-6 text-foreground/80 text-sm">
							Are you sure you want to ban{" "}
							<span className="font-semibold">
								{user.name || user.username}
							</span>
							? This will deactivate their account and they won't be able to
							access the platform.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="secondary"
								onClick={() => setShowBanConfirm(false)}
								disabled={isBanning}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									banUser(id, {
										onSuccess: () => {
											setShowBanConfirm(false);
										},
									});
								}}
								disabled={isBanning}
							>
								{isBanning ? "Banning..." : "Ban User"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Unban Confirmation Dialog */}
			{showUnbanConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
						<h3 className="mb-4 font-semibold text-lg">Unban User</h3>
						<p className="mb-6 text-foreground/80 text-sm">
							Are you sure you want to unban{" "}
							<span className="font-semibold">
								{user.name || user.username}
							</span>
							? This will reactivate their account and they will be able to
							access the platform again.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="secondary"
								onClick={() => setShowUnbanConfirm(false)}
								disabled={isUnbanning}
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									unbanUser(id, {
										onSuccess: () => {
											setShowUnbanConfirm(false);
										},
									});
								}}
								disabled={isUnbanning}
							>
								{isUnbanning ? "Unbanning..." : "Unban User"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
						<h3 className="mb-4 font-semibold text-lg text-red-600">
							Delete User
						</h3>
						<p className="mb-6 text-foreground/80 text-sm">
							Are you sure you want to permanently delete{" "}
							<span className="font-semibold">
								{user.name || user.username}
							</span>
							? This action cannot be undone and will remove all user data from
							the system.
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
									deleteUser(id, {
										onSuccess: () => {
											navigate({ to: "/users" });
										},
									});
								}}
								disabled={isDeleting}
							>
								{isDeleting ? "Deleting..." : "Delete User"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Promote to Admin Confirmation Dialog */}
			{showPromoteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
						<h3 className="mb-4 font-semibold text-lg">Promote to Admin</h3>
						<p className="mb-6 text-foreground/80 text-sm">
							Are you sure you want to promote{" "}
							<span className="font-semibold">
								{user.name || user.username}
							</span>{" "}
							to admin? This will grant them full administrative privileges
							including access to the admin dashboard and all management
							features.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="secondary"
								onClick={() => setShowPromoteConfirm(false)}
								disabled={isPromoting}
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									promoteToAdmin(id, {
										onSuccess: () => {
											setShowPromoteConfirm(false);
										},
									});
								}}
								disabled={isPromoting}
							>
								{isPromoting ? "Promoting..." : "Promote to Admin"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
