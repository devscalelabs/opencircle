import { Avatar } from "@opencircle/ui";
import { Link } from "@tanstack/react-router";
import {
	Activity,
	BookOpen,
	FileText,
	Hash,
	Key,
	Link as LinkIcon,
	LogOut,
	Settings,
	UserCheck,
	Users,
	Zap,
} from "lucide-react";
import { useAccount } from "../features/auth/hooks/useAccount";

interface MenuItemProps {
	icon: React.ReactNode;
	label: string;
	to: string;
}

const MenuItem = ({ icon, label, to }: MenuItemProps) => {
	return (
		<Link
			to={to}
			className="flex cursor-pointer items-center rounded-lg p-2 text-sm transition duration-150 hover:bg-primary"
		>
			{icon}
			<span className="ml-3">{label}</span>
		</Link>
	);
};

export const Sidebar = () => {
	const { account } = useAccount();

	const handleLogout = () => {
		localStorage.removeItem("token");
		window.location.href = "/";
	};

	return (
		<aside className="sticky top-0 flex h-screen w-72 flex-col justify-between space-y-6 border-border border-r p-6">
			<div>
				<section className="ml-2 flex gap-2">
					<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-background">
						<Zap size={12} fill="currentColor" />
					</div>
					<Link to="/dashboard">
						<h2 className="font-medium">Opencircle</h2>
					</Link>
				</section>
				<nav className="mt-8 space-y-2">
					<MenuItem
						icon={<Activity size={20} />}
						label="Activity"
						to="/activity"
					/>
					<MenuItem icon={<Users size={20} />} label="Users" to="/users" />
					<MenuItem icon={<Hash size={20} />} label="Channels" to="/channels" />
					<MenuItem
						icon={<Key size={20} />}
						label="Invite Codes"
						to="/invite-codes"
					/>
					<MenuItem
						icon={<BookOpen size={20} />}
						label="Courses"
						to="/courses"
					/>
					<MenuItem
						icon={<UserCheck size={20} />}
						label="Enrollments"
						to="/enrollments"
					/>
					<MenuItem
						icon={<FileText size={20} />}
						label="Articles"
						to="/articles"
					/>
					<MenuItem
						icon={<LinkIcon size={20} />}
						label="Resources"
						to="/resources"
					/>
					<MenuItem
						icon={<Settings size={20} />}
						label="App Settings"
						to="/app-settings"
					/>
				</nav>
				<section className="mt-8 p-2">
					{account && (
						<div className="flex items-center gap-2">
							<Avatar
								initials={
									account.name
										? account.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()
										: account.email[0].toUpperCase()
								}
								image_url={account.avatar_url || ""}
								size="sm"
							/>
							<div className="min-w-0 flex-1">
								<div className="truncate font-medium text-sm">
									{account.name || account.email}
								</div>
								<div className="truncate text-foreground/50 text-xs">
									@{account.username}
								</div>
							</div>
						</div>
					)}
				</section>
			</div>
			<section>
				<button
					type="button"
					onClick={handleLogout}
					className="flex w-full items-center gap-2 rounded-lg p-2 text-foreground/70 text-sm hover:bg-primary hover:text-foreground"
				>
					<LogOut size={16} />
					<span>Logout</span>
				</button>
			</section>
		</aside>
	);
};
