import { Avatar } from "@opencircle/ui";
import { Link } from "@tanstack/react-router";
import {
	Activity,
	BookOpen,
	ExternalLink,
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
						icon={<ExternalLink size={20} />}
						label="App Links"
						to="/app-links"
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

			<section className="space-y-4">
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
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="1.5em"
							height="1.5em"
							viewBox="0 0 24 24"
						>
							<title>Github</title>
							<path
								fill="currentColor"
								d="M12 .999c-6.074 0-11 5.05-11 11.278c0 4.983 3.152 9.21 7.523 10.702c.55.104.727-.246.727-.543v-2.1c-3.06.683-3.697-1.33-3.697-1.33c-.5-1.304-1.222-1.65-1.222-1.65c-.998-.7.076-.686.076-.686c1.105.08 1.686 1.163 1.686 1.163c.98 1.724 2.573 1.226 3.201.937c.098-.728.383-1.226.698-1.508c-2.442-.286-5.01-1.253-5.01-5.574c0-1.232.429-2.237 1.132-3.027c-.114-.285-.49-1.432.107-2.985c0 0 .924-.303 3.026 1.156c.877-.25 1.818-.375 2.753-.38c.935.005 1.876.13 2.755.38c2.1-1.459 3.023-1.156 3.023-1.156c.598 1.554.222 2.701.108 2.985c.706.79 1.132 1.796 1.132 3.027c0 4.332-2.573 5.286-5.022 5.565c.394.35.754 1.036.754 2.088v3.095c0 .3.176.652.734.542C19.852 21.484 23 17.258 23 12.277C23 6.048 18.075.999 12 .999"
							/>
						</svg>
						<div>Support Opencircle</div>
					</a>
				</div>
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
