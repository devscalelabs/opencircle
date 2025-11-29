import {
	AttachmentIcon,
	Menu01Icon,
	Notification03Icon,
	UserIcon,
	Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "../features/auth/hooks/useAccount";

interface MobileNavItem {
	icon: React.ReactNode;
	label: string;
	to: string;
}

const mobileNavItems: MobileNavItem[] = [
	{
		icon: <HugeiconsIcon icon={Menu01Icon} size={20} />,
		label: "Timeline",
		to: "/",
	},
	{
		icon: <HugeiconsIcon icon={AttachmentIcon} size={20} />,
		label: "Articles",
		to: "/articles",
	},
	{
		icon: <HugeiconsIcon icon={Video01Icon} size={20} />,
		label: "Courses",
		to: "/courses",
	},
	{
		icon: <HugeiconsIcon icon={Notification03Icon} size={20} />,
		label: "Notifications",
		to: "/notifications",
	},
];

export const MobileBottomNav = () => {
	const { account } = useAccount();

	const profileItem = account
		? {
				icon: <HugeiconsIcon icon={UserIcon} size={20} />,
				label: "Profile",
				to: `/${account.username}`,
			}
		: null;

	const allItems = [...mobileNavItems, profileItem].filter(
		Boolean,
	) as MobileNavItem[];

	return (
		<nav className="fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-background md:hidden">
			<div className="flex h-16 items-center justify-around px-2">
				{allItems.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-muted-foreground text-xs transition-colors duration-150 hover:bg-primary/10 hover:text-foreground"
						activeProps={{
							className: "text-foreground bg-primary/10",
						}}
					>
						{item.icon}
						<span className="max-w-[60px] truncate">{item.label}</span>
					</Link>
				))}
			</div>
		</nav>
	);
};
