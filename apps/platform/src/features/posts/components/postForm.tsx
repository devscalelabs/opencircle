import { Button } from "@opencircle/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { ChevronDown, Hash, Image, Smile, X } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useAccount } from "../../auth/hooks/useAccount";
import { useChannels } from "../../channels/hooks/useChannels";
import { MentionList } from "../../mention/components/MentionList";
import { usePostMention } from "../hooks/usePostMention";
import { usePostSubmission } from "../hooks/usePostSubmission";

// Define the search schema for type safety
const searchSchema = z.object({
	channel: z.string().optional(),
});

// Create a route type for the PostForm to use
const PostFormRoute = createFileRoute("/_socialLayout/")({
	validateSearch: zodValidator(searchSchema),
});

export const PostForm = () => {
	const [content, setContent] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<string>("");
	const { createPost, isSubmitting } = usePostSubmission();
	const { account } = useAccount();
	const { channels, isChannelsLoading } = useChannels();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const search = PostFormRoute.useSearch();
	const navigate = useNavigate();

	// Auto-select channel from URL parameter or first available channel
	useEffect(() => {
		if (channels.length === 0) return;

		let channelToSelect = "";

		// If channel slug is provided in URL, find the channel by slug
		if (search.channel) {
			const channelFromSlug = channels.find((c) => c.slug === search.channel);
			if (channelFromSlug) {
				channelToSelect = channelFromSlug.id;
			}
		}

		// If no channel from URL or no channel is currently selected, select the first one
		if (!channelToSelect && !selectedChannel) {
			channelToSelect = channels[0].id;
		}

		if (channelToSelect) {
			setSelectedChannel(channelToSelect);
		}
	}, [channels, selectedChannel, search.channel]);

	// Get selected channel name for display
	const selectedChannelName = channels.find(
		(c) => c.id === selectedChannel,
	)?.name;

	const {
		textareaRef,
		showMentions,
		users,
		isLoading,
		selectedIndex,
		cursorPosition,
		handleContentChange,
		handleMentionSelect,
		handleKeyDown,
	} = usePostMention(content, setContent);

	const handleSubmit = () => {
		if ((!content.trim() && files.length === 0) || !account?.id) return;

		createPost({
			content,
			userId: account.id,
			files,
			channelId: selectedChannel || undefined,
		});
		setContent("");
		setFiles([]);
		setSelectedChannel("");
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		setFiles((prev) => [...prev, ...selectedFiles]);
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="relative space-y-4 border-border border-b p-4">
			<textarea
				ref={textareaRef}
				value={content}
				onChange={handleContentChange}
				onKeyDown={handleKeyDown}
				rows={4}
				placeholder="Write your post here"
				className="block w-full resize-none focus-within:outline-none"
			></textarea>

			{showMentions && !isLoading && (
				<MentionList
					users={users}
					onSelect={handleMentionSelect}
					selectedIndex={selectedIndex}
					textareaRef={textareaRef}
					cursorPosition={cursorPosition}
				/>
			)}

			{files.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{files.map((file, index) => (
						<div
							key={`file-${file.name}`}
							className="relative flex items-center gap-2 rounded-lg bg-muted p-2"
						>
							<span className="max-w-[200px] truncate text-muted-foreground text-sm">
								{file.name}
							</span>
							<button
								type="button"
								onClick={() => removeFile(index)}
								className="text-muted-foreground hover:text-foreground"
							>
								<X size={16} />
							</button>
						</div>
					))}
				</div>
			)}

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<input
						ref={fileInputRef}
						type="file"
						multiple
						onChange={handleFileSelect}
						className="hidden"
						accept="image/*,video/*"
					/>
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="text-muted-foreground hover:text-foreground"
					>
						<Image strokeWidth={1.5} size={18} />
					</button>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Smile strokeWidth={1.5} size={18} />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="right">
							<EmojiPicker
								theme={Theme.DARK}
								emojiStyle={EmojiStyle.TWITTER}
								reactionsDefaultOpen
								skinTonesDisabled
								onEmojiClick={(emojiData) => {
									setContent((prev) => prev + emojiData.emoji);
								}}
							/>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
							<Hash strokeWidth={1.5} size={18} />
							<span className="text-sm">
								{selectedChannelName || "No channel"}
							</span>
							<ChevronDown strokeWidth={1.5} size={14} />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							sideOffset={10}
							align="start"
							className="z-50 min-w-[120px] overflow-hidden rounded-lg border border-border bg-background-secondary font-medium text-xs shadow-2xl"
						>
							{!isChannelsLoading &&
								channels.map((channel) => (
									<DropdownMenu.Item
										key={channel.id}
										onClick={() => {
											setSelectedChannel(channel.id);
											navigate({
												to: "/",
												search: { channel: channel.slug },
											});
										}}
										className="flex items-center gap-2 p-3 focus-within:outline-none hover:bg-primary"
									>
										<span>{channel.emoji}</span>
										<span>{channel.name}</span>
									</DropdownMenu.Item>
								))}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<Button
					onClick={handleSubmit}
					disabled={
						(!content.trim() && files.length === 0) || isSubmitting || !account
					}
				>
					{isSubmitting ? "Creating..." : "Create Post"}
				</Button>
			</div>
		</div>
	);
};
