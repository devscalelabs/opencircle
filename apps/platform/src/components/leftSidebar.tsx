import { Link } from "@tanstack/react-router";
import { Bell, Github, List, Paperclip, Video, Zap } from "lucide-react";
import { useAppSettings } from "../features/appSettings/hooks/useAppSettings";
import { ChannelList } from "../features/channels/components/ChannelList";
import { NotificationNumbers } from "../features/notifications/components/notificatioNumbers";
import { MenuItem } from "./menuItem";

export const LeftSidebar = () => {
	const { appSettings } = useAppSettings();

	return (
		<div className="sticky top-0 flex h-screen flex-col justify-between py-4 pr-4">
			<div className="space-y-4">
				<Link to="/" className="block">
					{appSettings?.app_logo_url ? (
						<img
							src={appSettings.app_logo_url}
							alt={appSettings.app_name}
							className="ml-2 w-[60%]"
						/>
					) : (
						<section className="relative ml-2 flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-background">
								<Zap size={12} fill="currentColor" />
							</div>
							<h2 className="font-medium">Opencircle</h2>
							<div className="-ml-1 rounded-lg bg-foreground px-1 py-0.5 font-medium text-[10px] text-background tracking-tight">
								alpha
							</div>
						</section>
					)}
				</Link>
				<section className="font-medium">
					<MenuItem icon={<List size={16} />} label="Timeline" to="/" />
					<MenuItem
						icon={<Paperclip size={16} />}
						label="Articles"
						to="/articles"
					/>
					<MenuItem icon={<Video size={16} />} label="Courses" to="/courses" />
					<Link
						to="/notifications"
						className="flex cursor-pointer items-center rounded-lg p-2 text-sm transition duration-150 hover:bg-primary"
					>
						<Bell size={16} />
						<span className="ml-3">Notifications</span>
						<NotificationNumbers />
					</Link>
				</section>
				<section className="space-y-3 p-2">
					<div className="space-y-2 text-sm">
						<div>Channels</div>
						<div className="h-0.5 w-8 bg-foreground/20" />
					</div>
					<ChannelList />
				</section>
			</div>
			<div>
				<section className="flex flex-wrap space-x-4 space-y-2 px-4 py-2 font-semibold text-xs">
					<a
						href="https://devscale.id"
						target="_blank"
						rel="noopener noreferrer"
						className="transition duration-150 hover:text-primary"
					>
						devscale.id
					</a>
					<a
						href="https://devscale.id/programs"
						target="_blank"
						rel="noopener noreferrer"
						className="transition duration-150 hover:text-primary"
					>
						programs
					</a>
					<span className="text-foreground/50">help</span>
					<span className="text-foreground/50">contact</span>
				</section>
				<div className="space-y-5 rounded-lg border border-border bg-linear-210 from-background-secondary to-40% to-transparent p-4 font-medium text-sm tracking-tight">
					<div>
						Opensource Community Platform for Creators built by Devscalelabs.
					</div>
					<a
						href="https://github.com/devscalelabs/opencircle"
						target="_blank"
						rel="noopener noreferrer"
						className="flex w-fit items-center gap-1 rounded-lg bg-white px-2 py-1 font-medium text-black text-xs"
					>
						<Github size={12} />
						Opencircle
					</a>
				</div>
			</div>
		</div>
	);
};
