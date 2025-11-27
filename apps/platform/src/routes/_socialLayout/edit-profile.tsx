import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Bell, Shield, User } from "lucide-react";
import { useState } from "react";
import { METADATA } from "../../constants/metadata";
import { SessionsTab } from "../../features/auth/components/sessionsTab";
import { NotificationPreferencesTab } from "../../features/notifications/components/notificationPreferencesTab";
import { ProfileTab } from "../../features/user/components/profileTab";

export const Route = createFileRoute("/_socialLayout/edit-profile")({
	head: () => ({
		meta: [
			{
				title: "Settings - OpenCircle",
			},
			{
				name: "description",
				content: "Manage your OpenCircle account settings",
			},
		],
		links: [
			{
				rel: "icon",
				href: METADATA.favicon,
			},
		],
	}),
	component: EditProfile,
});

type Tab = "profile" | "notifications" | "sessions";

function EditProfile() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<Tab>("profile");

	return (
		<main>
			<div className="sticky top-0 z-10 flex h-14 items-center justify-between border-border border-b bg-background px-4">
				<button
					type="button"
					onClick={() => router.history.back()}
					className="font-medium text-sm"
				>
					Back
				</button>
				<div className="flex gap-1">
					<button
						type="button"
						onClick={() => setActiveTab("profile")}
						className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
							activeTab === "profile"
								? "bg-primary text-primary-foreground"
								: "text-foreground/50 hover:bg-background-secondary hover:text-foreground"
						}`}
					>
						<User className="h-3.5 w-3.5" />
						Profile
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("notifications")}
						className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
							activeTab === "notifications"
								? "bg-primary text-primary-foreground"
								: "text-foreground/50 hover:bg-background-secondary hover:text-foreground"
						}`}
					>
						<Bell className="h-3.5 w-3.5" />
						Notifications
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("sessions")}
						className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
							activeTab === "sessions"
								? "bg-primary text-primary-foreground"
								: "text-foreground/50 hover:bg-background-secondary hover:text-foreground"
						}`}
					>
						<Shield className="h-3.5 w-3.5" />
						Sessions
					</button>
				</div>
			</div>
			<section className="py-6">
				<div className="mx-auto max-w-2xl px-4">
					{activeTab === "profile" && <ProfileTab />}
					{activeTab === "notifications" && <NotificationPreferencesTab />}
					{activeTab === "sessions" && <SessionsTab />}
				</div>
			</section>
		</main>
	);
}
