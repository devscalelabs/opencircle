import {
	ComputerIcon,
	Delete01Icon,
	GlobeIcon,
	LaptopIcon,
	SmartPhone01Icon,
	Tablet01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@opencircle/ui";
import { useSessions } from "../hooks/useSessions";

const getDeviceIcon = (deviceType?: string) => {
	switch (deviceType) {
		case "mobile":
			return <HugeiconsIcon icon={SmartPhone01Icon} size={20} />;
		case "tablet":
			return <HugeiconsIcon icon={Tablet01Icon} size={20} />;
		case "desktop":
			return <HugeiconsIcon icon={ComputerIcon} size={20} />;
		default:
			return <HugeiconsIcon icon={LaptopIcon} size={20} />;
	}
};

const formatDate = (dateString?: string) => {
	if (!dateString) return "Unknown";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const SessionsTab = () => {
	const { sessions, isLoading, isError, revokeSession, isRevoking } =
		useSessions();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-foreground/50">Loading sessions...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-red-500">Failed to load sessions</div>
			</div>
		);
	}

	if (!sessions || sessions.length === 0) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-foreground/50">No active sessions</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<h3 className="font-medium text-foreground">Active Sessions</h3>
				<p className="text-foreground/50 text-sm">
					These are devices that are currently logged into your account. You can
					revoke access to any session you don't recognize.
				</p>
			</div>

			<div className="space-y-3">
				{sessions.map((session) => (
					<div
						key={session.id}
						className="flex items-center justify-between rounded-lg border border-border bg-background-secondary p-4"
					>
						<div className="flex items-center gap-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
								{getDeviceIcon(session.device_type)}
							</div>
							<div className="space-y-1">
								<div className="font-medium text-foreground text-sm">
									{session.device_name || "Unknown Device"}
								</div>
								<div className="flex items-center gap-2 text-foreground/50 text-xs">
									{session.ip_address && (
										<span className="flex items-center gap-1">
											<HugeiconsIcon icon={GlobeIcon} size={12} />
											{session.ip_address}
										</span>
									)}
									{session.browser && session.os && (
										<span>
											{session.browser} • {session.os}
										</span>
									)}
								</div>
								<div className="text-foreground/40 text-xs">
									Last active: {formatDate(session.last_used_at)}
								</div>
							</div>
						</div>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => revokeSession(session.id)}
							disabled={isRevoking}
						>
							<HugeiconsIcon icon={Delete01Icon} size={16} className="mr-1" />
							Revoke
						</Button>
					</div>
				))}
			</div>
		</div>
	);
};
