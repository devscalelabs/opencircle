import type { Post } from "@opencircle/core";
import { Avatar } from "@opencircle/ui";
import { Link, useNavigate } from "@tanstack/react-router";
import { EllipsisVertical, MessageCircle, PinIcon } from "lucide-react";
import moment from "moment";
import { DropdownMenu } from "radix-ui";
import { useId } from "react";
import { getInitials } from "../../../utils/common";
import { useAccount } from "../../auth/hooks/useAccount";
import { UrlPreview } from "../../extras/components/UrlPreview";
import { MediaGallery } from "../../media/components/media";
import { usePostDelete } from "../hooks/usePostDelete";
import { renderContent } from "../utils";
import { PostCardReactions } from "./postCardReactions";
import { PostCommentSummary } from "./postCommentSummary";

interface PostCardProps {
	post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
	const initials = getInitials(post.user.username);
	const { account } = useAccount();
	const { deletePost } = usePostDelete();
	const gradientId = useId();

	const navigate = useNavigate();

	return (
		<main className="relative border-b border-border p-4 space-y-2 max-w-2xl">
			<div className="absolute top-4 right-4 flex justify-center items-center gap-2">
				{post.is_pinned && <PinIcon className="fill-foreground w-3 h-3 " />}
				{post.user_id === account?.id && (
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<div className="w-6 h-6 bg-background-secondary flex justify-center items-center rounded-lg">
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
			</div>
			<section className="flex gap-2 items-center">
				<Avatar initials={initials} image_url={post.user.avatar_url || ""} />
				<Link
					to="/$username"
					params={{ username: post.user.username }}
					className="group"
				>
					<div className="space-y-0.5">
						<div className="flex gap-1 items-center group-hover:underline">
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
			<section className="ml-10 space-y-4">
				<div
					className="block cursor-pointer"
					onClick={() =>
						navigate({ to: "/posts/$id", params: { id: post.id } })
					}
				>
					<p className="whitespace-pre-line">{renderContent(post.content)}</p>
					<UrlPreview content={post.content} />
				</div>
				<MediaGallery media={post.medias} />
				<div className="flex gap-2 items-center mt-4 -ml-1">
					{post.channel && (
						<div className="flex px-2 py-1 rounded-full text-xs font-medium bg-background-secondary w-fit ">
							{post.channel.emoji} {post.channel.name}
						</div>
					)}
					<div className="text-xs text-foreground/50">
						{moment.utc(post.created_at).fromNow()}
					</div>
				</div>
				<section className="flex gap-4 items-center">
					<PostCardReactions post={post} />
					<div className="flex items-center gap-2 text-sm">
						<MessageCircle size={18} />
						<div>{post.comment_count}</div>
					</div>
					{post.comment_summary?.names && (
						<PostCommentSummary names={post.comment_summary.names} />
					)}
				</section>
			</section>
		</main>
	);
};
