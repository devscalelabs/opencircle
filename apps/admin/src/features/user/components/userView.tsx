import {
	ArrowLeft01Icon,
	Calendar01Icon,
	Clock01Icon,
	Mail01Icon,
	SecurityCheckIcon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { User } from "@opencircle/core";
import { Button } from "@opencircle/ui";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

interface UserViewProps {
	user: User;
	onBan?: () => void;
}

export const UserView = ({ user, onBan }: UserViewProps) => {
	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Header Actions */}
			<div className="flex items-center justify-between">
				<Link to="/users">
					<Button size="sm">
						<HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-2" />
						Back to Users
					</Button>
				</Link>
				<div className="flex gap-2">
					{onBan && (
						<Button onClick={onBan} variant="secondary">
							Ban User
						</Button>
					)}
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
						<HugeiconsIcon icon={UserIcon} size={16} />
						<span>@{user.username}</span>
					</div>
					<div className="flex items-center gap-2">
						<HugeiconsIcon icon={Mail01Icon} size={16} />
						<span>{user.email}</span>
					</div>
					<div className="flex items-center gap-2">
						<HugeiconsIcon icon={Calendar01Icon} size={16} />
						<span>
							Joined {format(new Date(user.created_at), "MMM dd, yyyy")}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<HugeiconsIcon icon={Clock01Icon} size={16} />
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
								<HugeiconsIcon icon={SecurityCheckIcon} size={14} />
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
		</div>
	);
};
