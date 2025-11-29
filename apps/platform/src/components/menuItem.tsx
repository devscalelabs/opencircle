import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

interface MenuItemProps {
	icon: IconSvgElement;
	label: string;
	to?: string;
}

export const MenuItem = ({ icon, label, to }: MenuItemProps) => {
	const content = (
		<>
			<HugeiconsIcon icon={icon} size={16} />
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
