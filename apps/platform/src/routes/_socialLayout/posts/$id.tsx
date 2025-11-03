import { Avatar, Button } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EllipsisVertical } from "lucide-react";
import moment from "moment";
import { DropdownMenu } from "radix-ui";
import { useId, useState } from "react";
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
import { renderContent } from "../../../features/posts/utils/contentRendering";
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
	const gradientId = useId();

	if (!post) {
		return <div>Post not found</div>;
	}

	const initials = getInitials(post.user.username);

	return (
		<main>
			<Header label="Back" />
			<main className="relative max-w-2xl space-y-2 border-border border-b p-6">
				{post.user_id === account?.id && (
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-lg bg-background-secondary">
								<EllipsisVertical size={12} className="" />
							</div>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							sideOffset={10}
							align="end"
							className="min-w-[80px] overflow-hidden rounded-lg border border-border bg-background-secondary font-medium text-xs shadow-2xl"
						>
							<DropdownMenu.Item
								className="p-3 focus-within:outline-none hover:bg-primary"
								onClick={() => deletePost(post.id)}
							>
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				)}
				<section className="flex items-center gap-2">
					<Avatar initials={initials} image_url={post.user.avatar_url || ""} />
					<Link
						to="/$username"
						params={{ username: post.user.username }}
						className="group"
					>
						<div className="space-y-0.5">
							<div className="flex items-center gap-1 group-hover:underline">
								<div>{post.user.name || post.user.email}</div>
								{post.user.role === "admin" && (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="1.1em"
										height="1.1em"
										viewBox="0 0 24 24"
										className="mt-1"
									>
										<title>verified</title>
										<defs>
											<linearGradient
												id={gradientId}
												x1="0%"
												y1="0%"
												x2="100%"
												y2="0%"
											>
												<stop offset="0%" stopColor="rgb(234 125 8)" />
												<stop offset="100%" stopColor="rgb(234 179 8)" />
											</linearGradient>
										</defs>
										<path
											fill={`url(#${gradientId})`}
											d="m8.6 22.5l-1.9-3.2l-3.6-.8l.35-3.7L1 12l2.45-2.8l-.35-3.7l3.6-.8l1.9-3.2L12 2.95l3.4-1.45l1.9 3.2l3.6.8l-.35 3.7L23 12l-2.45 2.8l.35 3.7l-3.6.8l-1.9 3.2l-3.4-1.45zm2.35-6.95L16.6 9.9l-1.4-1.45l-4.25 4.25l-2.15-2.1L7.4 12z"
										/>
									</svg>
								)}
							</div>
							<p className="text-foreground/50 text-xs">
								{post.user.bio || `@${post.user.username}`}
							</p>
						</div>
					</Link>
				</section>
				<p className="whitespace-pre-line">{renderContent(post.content)}</p>
				<UrlPreview content={post.content} />
				<MediaGallery media={post.medias} />
				<div className="mt-8 flex items-center gap-2">
					{post.channel && (
						<div className="flex w-fit rounded-full bg-background-secondary px-2 py-1 font-medium text-xs">
							{post.channel.emoji} {post.channel.name}
						</div>
					)}
					<div className="text-foreground/50 text-xs">
						{moment.utc(post.created_at).fromNow()}
					</div>
				</div>
				<section className="flex items-center gap-4 pt-4">
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
