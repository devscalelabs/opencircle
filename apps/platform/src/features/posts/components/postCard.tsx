import {
	Cancel01Icon,
	Comment01Icon,
	MoreVerticalIcon,
	PinIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Post } from "@opencircle/core";
import { Avatar, Button } from "@opencircle/ui";
import { Link, useNavigate } from "@tanstack/react-router";
import moment from "moment";
import { DropdownMenu } from "radix-ui";
import { useId, useState } from "react";
import { getInitials } from "../../../utils/common";
import { useAccount } from "../../auth/hooks/useAccount";
import { UrlPreview } from "../../extras/components/urlPreview";
import { MediaGallery } from "../../media/components/media";
import { usePostDelete } from "../hooks/usePostDelete";
import { usePostUpdate } from "../hooks/usePostUpdate";
import { renderTruncatedContent } from "../utils/contentRendering";
import { PostCardReactions } from "./postCardReactions";
import { PostCommentSummary } from "./postCommentSummary";

interface PostCardProps {
	post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
	const initials = getInitials(post.user.username);
	const { account } = useAccount();
	const { deletePost } = usePostDelete();
	const { updatePost, isUpdating } = usePostUpdate();
	const gradientId = useId();
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(post.content);

	const navigate = useNavigate();

	const handleEditSubmit = () => {
		if (!editContent.trim()) return;
		updatePost({ id: post.id, content: editContent });
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditContent(post.content);
		setIsEditing(false);
	};

	return (
		<main className="relative max-w-2xl space-y-2 border-border border-b p-4">
			<div className="absolute top-4 right-4 flex items-center justify-center gap-2">
				{post.is_pinned && (
					<HugeiconsIcon icon={PinIcon} size={12} fill="currentColor" />
				)}
				{(post.user_id === account?.id || account?.role === "admin") && (
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-background-secondary">
								<HugeiconsIcon icon={MoreVerticalIcon} size={12} />
							</div>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							sideOffset={10}
							align="end"
							className="min-w-[80px] overflow-hidden rounded-lg border border-border bg-background-secondary font-medium text-xs shadow-2xl"
						>
							{post.user_id === account?.id && (
								<DropdownMenu.Item
									className="p-3 focus-within:outline-none hover:bg-primary"
									onClick={() => setIsEditing(true)}
								>
									Edit
								</DropdownMenu.Item>
							)}
							<DropdownMenu.Item
								className="p-3 focus-within:outline-none hover:bg-primary"
								onClick={() => deletePost(post.id)}
							>
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				)}
			</div>
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
			<section className="ml-10 space-y-4">
				{isEditing ? (
					<div className="space-y-4">
						<textarea
							value={editContent}
							onChange={(e) => setEditContent(e.target.value)}
							rows={4}
							placeholder="Edit your post"
							className="block w-full resize-none rounded-lg border border-border bg-background p-3 focus-within:outline-none"
						/>
						<div className="flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={handleCancelEdit}
								className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-background-secondary"
							>
								<HugeiconsIcon icon={Cancel01Icon} size={16} />
								Cancel
							</button>
							<Button
								onClick={handleEditSubmit}
								disabled={!editContent.trim() || isUpdating}
							>
								{isUpdating ? "Updating..." : "Update"}
							</Button>
						</div>
					</div>
				) : (
					<>
						<div
							className="block cursor-pointer"
							onClick={() =>
								navigate({ to: "/posts/$id", params: { id: post.id } })
							}
						>
							<p className="whitespace-pre-line">
								{renderTruncatedContent(post.content, 300, () =>
									navigate({ to: "/posts/$id", params: { id: post.id } }),
								)}
							</p>
						</div>
						<UrlPreview content={post.content} />
						<MediaGallery media={post.medias} />
					</>
				)}
				{!isEditing && (
					<>
						<div className="-ml-1 mt-4 flex items-center gap-2">
							{post.channel && (
								<div className="flex w-fit rounded-full bg-background-secondary px-2 py-1 font-medium text-xs">
									{post.channel.emoji} {post.channel.name}
								</div>
							)}
							<div className="text-foreground/50 text-xs">
								{moment.utc(post.created_at).fromNow()}
							</div>
						</div>
						<section className="flex items-center gap-4">
							<PostCardReactions post={post} />
							<div className="flex items-center gap-2 text-sm">
								<HugeiconsIcon
									icon={Comment01Icon}
									size={18}
									onClick={() =>
										navigate({ to: "/posts/$id", params: { id: post.id } })
									}
									className="cursor-pointer"
								/>
								<div>{post.comment_count}</div>
							</div>
							{post.comment_summary?.names && (
								<PostCommentSummary names={post.comment_summary.names} />
							)}
						</section>
					</>
				)}
			</section>
		</main>
	);
};
