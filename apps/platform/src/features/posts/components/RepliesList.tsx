import type { Post } from "@opencircle/core";
import { Avatar, Button } from "@opencircle/ui";
import { Link } from "@tanstack/react-router";
import { EllipsisVertical } from "lucide-react";
import moment from "moment";
import { DropdownMenu } from "radix-ui";
import { useId, useState } from "react";
import { getInitials } from "../../../utils/common";
import { useAccount } from "../../auth/hooks/useAccount";
import { MediaGallery } from "../../media/components/media";
import { usePostDelete } from "../hooks/usePostDelete";
import { renderContent } from "../utils/contentRendering";
import { PostCardReactions } from "./postCardReactions";
import { ReplyForm } from "./replyForm";

interface RepliesListProps {
	posts: Post[];
}

export function RepliesList({ posts }: RepliesListProps) {
	const { account } = useAccount();
	const { deletePost } = usePostDelete();
	const [showReplyForm, setShowReplyForm] = useState<Record<string, boolean>>(
		{},
	);
	const gradientId = useId();

	const getDepth = (post: Post, currentDepth = 0): number => {
		if (!post.parent_id) return currentDepth;
		const parent = posts.find((p) => p.id === post.parent_id);
		return parent ? getDepth(parent, currentDepth + 1) : currentDepth;
	};

	return (
		<section className="border-border border-t">
			{posts.map((post) => {
				const replyInitials = getInitials(post.user.username);
				const depth = getDepth(post);

				return (
					<main
						key={post.id}
						className={`relative max-w-2xl border-border border-b p-4 ${depth > 0 ? "ml-8" : ""}`}
					>
						{/* Vertical line for nested replies */}
						{depth > 0 && (
							<div
								className="absolute top-0 bottom-0 left-0 w-px bg-border"
								style={{ left: "0" }}
							/>
						)}

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
							<Avatar
								initials={replyInitials}
								image_url={post.user.avatar_url || ""}
							/>
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
														id={`${gradientId}-${post.id}`}
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
													fill={`url(#${gradientId}-${post.id})`}
													d="m8.6 22.5l-1.9-3.2l-3.6-.8l.35-3.7L1 12l2.45-2.8l-.35-3.7l3.6-.8l1.9-3.2L12 2.95l3.4-1.45l1.9 3.2l3.6.8l-.35 3.7L23 12l-2.45 2.8l.35 3.7l-3.6.8l-1.9 3.2l-3.4-1.45zm2.35-6.95L16.6 9.9l-1.4-1.45l-4.25 4.25l-2.15-2.1L7.4 12z"
												/>
											</svg>
										)}
									</div>
									<p className="text-foreground/50 text-xs">
										{post.user.bio || post.user.username}
									</p>
								</div>
							</Link>
						</section>
						<section className="ml-10 space-y-4">
							<p className="whitespace-pre-line">
								{renderContent(post.content)}
							</p>
							<MediaGallery media={post.medias} />
							<div className="text-foreground/50 text-xs">
								{moment.utc(post.created_at).fromNow()}
							</div>
							<section className="flex items-center gap-4">
								<Button
									size="sm"
									variant="secondary"
									onClick={() =>
										setShowReplyForm((prev) => ({
											...prev,
											[post.id]: !prev[post.id],
										}))
									}
									disabled={!account}
								>
									Reply
								</Button>
								<PostCardReactions post={post} />
							</section>

							{showReplyForm[post.id] && (
								<ReplyForm
									parentId={post.id}
									onReply={() =>
										setShowReplyForm((prev) => ({ ...prev, [post.id]: false }))
									}
								/>
							)}
						</section>
					</main>
				);
			})}
		</section>
	);
}
