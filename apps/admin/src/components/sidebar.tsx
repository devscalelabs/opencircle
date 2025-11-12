import { Input } from "@opencircle/ui";
import { Link } from "@tanstack/react-router";
import {
	BookOpen,
	FileText,
	Hash,
	Key,
	Link as LinkIcon,
	Settings,
	Users,
	Zap,
} from "lucide-react";

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
	return (
		<aside className="sticky top-0 h-screen w-72 space-y-6 border-border border-r p-6">
			<section className="ml-2 flex gap-2">
				<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-background">
					<Zap size={12} fill="currentColor" />
				</div>
				<Link to="/dashboard">
					<h2 className="font-medium">Opencircle</h2>
				</Link>
			</section>
			<section>
				<Input placeholder="Search" />
			</section>
			<nav className="space-y-2">
				<MenuItem icon={<Users size={20} />} label="Users" to="/users" />
				<MenuItem icon={<Hash size={20} />} label="Channels" to="/channels" />
				<MenuItem
					icon={<Key size={20} />}
					label="Invite Codes"
					to="/invite-codes"
				/>
				<MenuItem icon={<BookOpen size={20} />} label="Courses" to="/courses" />
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
		</aside>
	);
};
