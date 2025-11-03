import type { Post } from "@opencircle/core";
import { useState } from "react";
import { PostCard } from "../../posts/components/postCard";

interface UserTabsProps {
	posts: Post[];
}

// TODO: Should be switch to ServerSide.
export const UserTabs = ({ posts }: UserTabsProps) => {
	const [activeTab, setActiveTab] = useState("posts");
	const userPosts = posts.filter((post) => post.type === "post");
	const userReplies = posts.filter((post) => post.type === "comment");

	return (
		<main>
			<section className="flex justify-center gap-8 border-border border-y p-4">
				<div
					onClick={() => setActiveTab("posts")}
					className={`cursor-pointer transition duration-75 hover:text-primary/50 ${
						activeTab === "posts" ? "text-primary" : ""
					}`}
				>
					Posts
				</div>
				<div
					onClick={() => setActiveTab("replies")}
					className={`cursor-pointer transition duration-75 hover:text-primary/50 ${
						activeTab === "replies" ? "text-primary" : ""
					}`}
				>
					Replies
				</div>
			</section>
			{activeTab === "posts" && (
				<section>
					{userPosts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</section>
			)}
			{activeTab === "replies" && (
				<section>
					{userReplies.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</section>
			)}
		</main>
	);
};
