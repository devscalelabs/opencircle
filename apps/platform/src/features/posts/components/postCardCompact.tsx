import { Avatar } from "@opencircle/ui";

interface PostCardCompactProps {
	user: {
		initials: string;
		image_url: string;
		name: string;
	};
	content: string;
	media: string[];
}

export const PostCardCompact = ({ user, content }: PostCardCompactProps) => {
	return (
		<main className="max-w-2xl space-y-2">
			<section className="flex items-center gap-2">
				<Avatar size="sm" initials={user.initials} image_url={user.image_url} />
				<div>
					<div>{user.name}</div>
				</div>
			</section>
			<section>
				<p className="whitespace-pre-line text-sm">{content}</p>
			</section>
		</main>
	);
};
