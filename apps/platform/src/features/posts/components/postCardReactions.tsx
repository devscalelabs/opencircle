import { SmileIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Post, ReactionsByEmoji } from "@opencircle/core";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { DropdownMenu, HoverCard, ScrollArea } from "radix-ui";
import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useReactionSubmission } from "../../reactions/hooks/useReactionSubmission";

interface PostCardReactionsProps {
	post: Post;
}

export const PostCardReactions = ({ post }: PostCardReactionsProps) => {
	const { submitReaction } = useReactionSubmission();
	const [reactionDetails, setReactionDetails] = useState<ReactionsByEmoji[]>(
		[],
	);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchReactions = async () => {
			try {
				setLoading(true);
				const data = await api.reactions.getByPostId(post.id);
				setReactionDetails(data);
			} catch (error) {
				console.error("Failed to fetch reactions:", error);
			} finally {
				setLoading(false);
			}
		};

		if (post.reactions?.summary && post.reactions.summary.length > 0) {
			fetchReactions();
		}
	}, [post.id, post.reactions?.summary]);

	const totalReactions =
		post.reactions?.summary?.reduce((sum, r) => sum + r.count, 0) || 0;

	return (
		<div className="flex items-center gap-1 text-sm">
			{post.reactions?.summary && post.reactions.summary.length > 0 ? (
				<HoverCard.Root openDelay={200}>
					<HoverCard.Trigger asChild>
						<div className="flex items-center gap-1">
							{post.reactions.summary.map((reaction) => (
								<div
									key={reaction.emoji}
									className={`flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 text-sm ${
										reaction.me
											? "border border-primary/30 bg-primary/20"
											: "bg-background-secondary hover:bg-background-tertiary"
									}`}
									onClick={() => {
										submitReaction({
											post_id: post.id,
											emoji: reaction.emoji,
										});
									}}
								>
									<span>{reaction.emoji}</span>
									<span>{reaction.count}</span>
								</div>
							))}
							{!post.reactions.summary.some((reaction) => reaction.me) && (
								<DropdownMenu.Root>
									<DropdownMenu.Trigger className="ml-1">
										<HugeiconsIcon
											icon={SmileIcon}
											strokeWidth={1.5}
											size={16}
										/>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="start" side="bottom">
										<EmojiPicker
											theme={Theme.DARK}
											emojiStyle={EmojiStyle.TWITTER}
											reactionsDefaultOpen
											skinTonesDisabled
											onEmojiClick={(emojiData) => {
												submitReaction({
													post_id: post.id,
													emoji: emojiData.emoji,
												});
											}}
											className="z-[999999] bg-background"
										/>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							)}
						</div>
					</HoverCard.Trigger>
					<HoverCard.Portal>
						<HoverCard.Content
							className="z-[999999] w-[280px] rounded-md border border-border bg-background shadow-2xl shadow-black"
							sideOffset={5}
						>
							<ScrollArea.Root className="h-[225px] w-[280px] overflow-hidden rounded">
								<ScrollArea.Viewport className="size-full p-4">
									<div className="flex flex-col gap-2">
										<div className="mb-1 font-semibold text-muted-foreground text-xs">
											{totalReactions}{" "}
											{totalReactions === 1 ? "reaction" : "reactions"}
										</div>

										{loading ? (
											<div className="text-muted-foreground text-xs">
												Loading...
											</div>
										) : (
											<div className="flex flex-col gap-1">
												{reactionDetails.map((reactionGroup) =>
													reactionGroup.users.map((reaction_user) => (
														<div
															key={`${reaction_user.user_id}-${reactionGroup.emoji}`}
															className="flex items-center justify-between gap-2 py-1"
														>
															<div className="min-w-0 flex-1">
																<div className="truncate font-medium text-xs">
																	{reaction_user.user.name}
																</div>
															</div>
															<span className="flex-shrink-0 text-sm">
																{reactionGroup.emoji}
															</span>
														</div>
													)),
												)}
											</div>
										)}
									</div>
								</ScrollArea.Viewport>
								<ScrollArea.Scrollbar
									orientation="vertical"
									className="flex touch-none select-none bg-border/50 p-0.5"
								>
									<ScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
								</ScrollArea.Scrollbar>
							</ScrollArea.Root>
							<HoverCard.Arrow className="fill-background" />
						</HoverCard.Content>
					</HoverCard.Portal>
				</HoverCard.Root>
			) : (
				<div className="flex items-center gap-2">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<HugeiconsIcon icon={SmileIcon} strokeWidth={1.5} size={18} />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="start" side="bottom">
							<EmojiPicker
								theme={Theme.DARK}
								emojiStyle={EmojiStyle.TWITTER}
								reactionsDefaultOpen
								skinTonesDisabled
								onEmojiClick={(emojiData) => {
									submitReaction({
										post_id: post.id,
										emoji: emojiData.emoji,
									});
								}}
								className="z-[999999] bg-background"
							/>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			)}
		</div>
	);
};
