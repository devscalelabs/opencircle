import { Link } from "@tanstack/react-router";

interface ChannelItemProps {
	emoji: string;
	title: string;
	to?: string;
}

export const ChannelItem = ({ emoji, title, to }: ChannelItemProps) => {
	const content = (
		<div className="flex w-fit cursor-pointer items-center gap-3 text-foreground/80 text-sm transition duration-150 hover:text-foreground">
			<div>{emoji}</div>
			<div>{title}</div>
		</div>
	);

	if (to) {
		return (
			<Link to={to} className="block">
				{content}
			</Link>
		);
	}

	return content;
};
