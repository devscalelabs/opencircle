import { Link } from "@tanstack/react-router";

interface MenuItemProps {
	icon: React.ReactNode;
	label: string;
	to?: string;
}

export const MenuItem = ({ icon, label, to }: MenuItemProps) => {
	const content = (
		<>
			{icon}
			<span className="ml-3">{label}</span>
		</>
	);

	if (to) {
		return (
			<Link
				to={to}
				className="flex cursor-pointer items-center rounded-lg p-2 text-sm transition duration-150 hover:bg-primary"
			>
				{content}
			</Link>
		);
	}

	return (
		<div className="flex cursor-pointer items-center rounded-lg p-2 text-sm transition duration-150 hover:bg-primary">
			{content}
		</div>
	);
};
