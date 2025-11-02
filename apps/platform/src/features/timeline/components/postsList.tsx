import { Button, Input } from "@opencircle/ui";
import { LockIcon } from "lucide-react";
import { PostCard } from "../../posts/components/postCard";
import { usePosts } from "../../posts/hooks/usePosts";

export const PostsList = () => {
	const { posts, isPostLoading, error } = usePosts();

	if (isPostLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center gap-4 h-90">
				<div className="bg-background-secondary p-4 rounded-xl">
					<LockIcon className="text-foreground" />
				</div>
				<div className="text-balance">
					You are not eligible to access this content.
				</div>
				<div className="space-y-2">
					<Input placeholder="Invite Code" className="w-full" />
					<Button className="w-full">Request Access</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
		</>
	);
};
