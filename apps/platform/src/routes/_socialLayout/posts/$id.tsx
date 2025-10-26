import { Avatar, Button } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EllipsisVertical } from "lucide-react";
import moment from "moment";
import { DropdownMenu } from "radix-ui";
import { useState } from "react";
import { Header } from "../../../components/header";
import { useAccount } from "../../../features/auth/hooks/useAccount";
import { UrlPreview } from "../../../features/extras/components/UrlPreview";
import { MediaGallery } from "../../../features/media/components/media";
import { PostCardReactions } from "../../../features/posts/components/postCardReactions";
import { RepliesList } from "../../../features/posts/components/RepliesList";
import { ReplyForm } from "../../../features/posts/components/replyForm";
import { usePost } from "../../../features/posts/hooks/usePost";
import { usePostDelete } from "../../../features/posts/hooks/usePostDelete";
import { usePosts } from "../../../features/posts/hooks/usePosts";
import { renderContent } from "../../../features/posts/utils";
import { getInitials } from "../../../utils/common";

export const Route = createFileRoute("/_socialLayout/posts/$id")({
	component: PostDetail,
});

function PostDetail() {
	const { id } = Route.useParams();
	const { post } = usePost(id);
	const { posts } = usePosts({ parentId: id });
	const { account } = useAccount();
	const { deletePost } = usePostDelete();
	const [showReplyForm, setShowReplyForm] = useState(false);

	if (!post) {
		return <div>Post not found</div>;
	}

	const initials = getInitials(post.user.username);

	return (
		<main>
			<Header label="Back" />
			<main className="relative border-b border-border space-y-2 max-w-2xl p-6">
				{post.user_id === account?.id && (
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<div className="w-6 h-6 bg-background-secondary absolute top-4 right-4 flex justify-center items-center rounded-lg">
								<EllipsisVertical size={12} className="" />
							</div>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							sideOffset={10}
							align="end"
							className="rounded-lg overflow-hidden bg-background-secondary border border-border min-w-[80px] shadow-2xl text-xs font-medium"
						>
							<DropdownMenu.Item
								className="p-3 hover:bg-primary focus-within:outline-none"
								onClick={() => deletePost(post.id)}
							>
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				)}
				<section className="flex gap-2 items-center">
					<Avatar initials={initials} image_url={post.user.avatar_url || ""} />
					<Link
						to="/$username"
						params={{ username: post.user.username }}
						className="group"
					>
						<div className="space-y-0.5">
							<div className="group-hover:underline">
								{post.user.name || post.user.email}
							</div>
							<p className="text-foreground/50 text-xs">
								{post.user.bio || post.user.username}
							</p>
						</div>
					</Link>
				</section>
				<p className="whitespace-pre-line">{renderContent(post.content)}</p>
				<UrlPreview content={post.content} />
				<MediaGallery media={post.medias} />
				<div className="flex gap-2 items-center mt-8">
					{post.channel && (
						<div className="flex px-2 py-1 rounded-full text-xs font-medium bg-background-secondary w-fit ">
							{post.channel.emoji} {post.channel.name}
						</div>
					)}
					<div className="text-xs text-foreground/50">
						{moment.utc(post.created_at).fromNow()}
					</div>
				</div>
				<section className="flex gap-4 items-center pt-4">
					<Button
						variant="secondary"
						onClick={() => setShowReplyForm(!showReplyForm)}
						disabled={!account}
					>
						Reply
					</Button>
					<PostCardReactions post={post} />
				</section>
			</main>
			{showReplyForm && (
				<ReplyForm parentId={id} onReply={() => setShowReplyForm(false)} />
			)}
			<RepliesList posts={posts} />
		</main>
	);
}
