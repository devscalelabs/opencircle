import {
	ArrowLeft01Icon,
	BlockedIcon,
	Calendar01Icon,
	Clock01Icon,
	Delete01Icon,
	GridIcon,
	Mail01Icon,
	SecurityCheckIcon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge, Button } from "@opencircle/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
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
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center gap-4">
				<h2 className="font-bold text-2xl">User not found</h2>
				<Link to="/users">
					<Button variant="outline">Back to Users</Button>
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
						to="/users"
						className="flex items-center text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-2" />
						Back to Users
					</Link>
					<div className="flex items-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 text-4xl shadow-sm">
							<HugeiconsIcon
								icon={UserIcon}
								size={32}
								className="text-foreground/70"
							/>
						</div>
						<div>
							<h1 className="font-bold text-3xl tracking-tight">
								{user.name || user.username}
							</h1>
							<div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
								<HugeiconsIcon icon={UserIcon} size={14} />
								<span className="font-mono">@{user.username}</span>
								<span>•</span>
								<Badge
									variant={user.is_active ? "primary" : "destructive"}
									className="capitalize"
								>
									{user.is_active ? "Active" : "Inactive"}
								</Badge>
								{user.role === "admin" && (
									<Badge variant="secondary" className="capitalize">
										Admin
									</Badge>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap gap-3">
					{user.role !== "admin" && (
						<Button
							variant="outline"
							onClick={() => setShowPromoteConfirm(true)}
							disabled={isPromoting}
							className="gap-2"
						>
							<HugeiconsIcon icon={SecurityCheckIcon} size={16} />
							{isPromoting ? "Promoting..." : "Raise to Admin"}
						</Button>
					)}
					{user.is_active ? (
						<Button
							variant="destructive"
							onClick={() => setShowBanConfirm(true)}
							disabled={isBanning}
							className="gap-2"
						>
							<HugeiconsIcon icon={BlockedIcon} size={16} />
							{isBanning ? "Banning..." : "Ban User"}
						</Button>
					) : (
						<Button
							variant="secondary"
							onClick={() => setShowUnbanConfirm(true)}
							disabled={isUnbanning}
							className="gap-2"
						>
							<HugeiconsIcon icon={SecurityCheckIcon} size={16} />
							{isUnbanning ? "Unbanning..." : "Unban User"}
						</Button>
					)}
					<Button
						variant="destructive"
						onClick={() => setShowDeleteConfirm(true)}
						disabled={isDeleting}
						className="gap-2"
					>
						<HugeiconsIcon icon={Delete01Icon} size={16} />
						{isDeleting ? "Deleting..." : "Delete"}
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
										Bio
									</label>
									<p className="mt-2 text-foreground/90 leading-relaxed">
										{user.bio || (
											<span className="text-muted-foreground italic">
												No bio provided
											</span>
										)}
									</p>
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<label className="font-medium text-muted-foreground text-xs uppercase">
											Full Name
										</label>
										<p className="mt-1 text-sm">
											{user.name || "Not provided"}
										</p>
									</div>
									<div>
										<label className="font-medium text-muted-foreground text-xs uppercase">
											Email
										</label>
										<div className="mt-1 flex items-center gap-2 text-sm">
											<HugeiconsIcon
												icon={Mail01Icon}
												size={14}
												className="text-muted-foreground"
											/>
											{user.email}
										</div>
									</div>
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
									<HugeiconsIcon icon={GridIcon} size={14} /> User ID
								</label>
								<p className="mt-2 font-mono text-sm">{user.id}</p>
							</div>
							<div>
								<label className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase">
									<HugeiconsIcon icon={SecurityCheckIcon} size={14} /> Role
								</label>
								<p className="mt-2 text-sm capitalize">{user.role}</p>
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
									<HugeiconsIcon icon={Calendar01Icon} size={14} /> Joined At
								</label>
								<p className="mt-1 text-sm">
									{format(new Date(user.created_at), "PPP")}
								</p>
								<p className="text-muted-foreground text-xs">
									{format(new Date(user.created_at), "p")}
								</p>
							</div>
							<div className="border-border border-t pt-4">
								<label className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase">
									<HugeiconsIcon icon={Clock01Icon} size={14} /> Last Updated
								</label>
								<p className="mt-1 text-sm">
									{format(new Date(user.updated_at), "PPP")}
								</p>
								<p className="text-muted-foreground text-xs">
									{format(new Date(user.updated_at), "p")}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Ban Confirmation Dialog */}
			{showBanConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="fade-in zoom-in-95 mx-4 w-full max-w-md animate-in overflow-hidden rounded-xl border border-border bg-background shadow-2xl duration-200">
						<div className="bg-destructive/10 p-6 pb-4">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
									<HugeiconsIcon icon={BlockedIcon} size={24} />
								</div>
								<div>
									<h3 className="font-semibold text-destructive text-lg">
										Ban User
									</h3>
									<p className="text-destructive/80 text-sm">
										This will deactivate their account.
									</p>
								</div>
							</div>
						</div>
						<div className="p-6 pt-4">
							<p className="mb-6 text-muted-foreground text-sm leading-relaxed">
								Are you sure you want to ban{" "}
								<span className="font-semibold text-foreground">
									{user.name || user.username}
								</span>
								? They will not be able to access the platform until unbanned.
							</p>
							<div className="flex justify-end gap-3">
								<Button
									variant="outline"
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
				</div>
			)}

			{/* Unban Confirmation Dialog */}
			{showUnbanConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="fade-in zoom-in-95 mx-4 w-full max-w-md animate-in overflow-hidden rounded-xl border border-border bg-background shadow-2xl duration-200">
						<div className="bg-secondary/10 p-6 pb-4">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary-foreground">
									<HugeiconsIcon icon={SecurityCheckIcon} size={24} />
								</div>
								<div>
									<h3 className="font-semibold text-lg">Unban User</h3>
									<p className="text-muted-foreground text-sm">
										Reactivate their account.
									</p>
								</div>
							</div>
						</div>
						<div className="p-6 pt-4">
							<p className="mb-6 text-muted-foreground text-sm leading-relaxed">
								Are you sure you want to unban{" "}
								<span className="font-semibold text-foreground">
									{user.name || user.username}
								</span>
								? They will regain access to the platform.
							</p>
							<div className="flex justify-end gap-3">
								<Button
									variant="outline"
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
				</div>
			)}

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
										Delete User
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
									{user.name || user.username}
								</span>
								? This will remove all user data from the system immediately.
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
				</div>
			)}

			{/* Promote to Admin Confirmation Dialog */}
			{showPromoteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="fade-in zoom-in-95 mx-4 w-full max-w-md animate-in overflow-hidden rounded-xl border border-border bg-background shadow-2xl duration-200">
						<div className="bg-primary/10 p-6 pb-4">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
									<HugeiconsIcon icon={SecurityCheckIcon} size={24} />
								</div>
								<div>
									<h3 className="font-semibold text-lg text-primary">
										Promote to Admin
									</h3>
									<p className="text-primary/80 text-sm">
										Grant administrative privileges.
									</p>
								</div>
							</div>
						</div>
						<div className="p-6 pt-4">
							<p className="mb-6 text-muted-foreground text-sm leading-relaxed">
								Are you sure you want to promote{" "}
								<span className="font-semibold text-foreground">
									{user.name || user.username}
								</span>{" "}
								to admin? They will have full access to the admin dashboard.
							</p>
							<div className="flex justify-end gap-3">
								<Button
									variant="outline"
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
				</div>
			)}
		</div>
	);
}
