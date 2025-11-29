import {
	Cancel01Icon,
	Image01Icon,
	SmileIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@opencircle/ui";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { DropdownMenu } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "../../auth/hooks/useAccount";
import { MentionList } from "../../mention/components/mentionList";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";
import { usePost } from "../hooks/usePost";
import { usePostMention } from "../hooks/usePostMention";
import { useReplySubmission } from "../hooks/useReplySubmission";
import { extractMentions } from "../utils/contentParsing";

interface ReplyFormProps {
	parentId: string;
	onReply?: () => void;
}

export const ReplyForm = ({ parentId, onReply }: ReplyFormProps) => {
	const [content, setContent] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [fixedMentions, setFixedMentions] = useState("");
	const { createReply, isSubmitting } = useReplySubmission();
	const { account } = useAccount();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { post: parentPost } = usePost(parentId);

	const {
		textareaRef,
		showMentions,
		users,
		isLoading,
		selectedIndex,
		cursorPosition,
		handleMentionSelect,
		handleKeyDown,
		setShowMentions,
		setMentionQuery,
		setSelectedIndex,
		setCursorPosition,
	} = usePostMention(content, setContent);

	useAutoResizeTextarea(textareaRef, 7);

	useEffect(() => {
		if (parentPost) {
			const mentions = extractMentions(parentPost.content);
			const allMentions = [parentPost.user.username, ...mentions];
			const uniqueMentions = [...new Set(allMentions)];
			const fixed = `${uniqueMentions.map((u) => `@${u}`).join(" ")} `;
			setFixedMentions(fixed);
			setContent(fixed);
		}
	}, [parentPost]);

	const hanleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newContent = e.target.value;
		if (newContent.length < content.length) {
			if (newContent.startsWith(fixedMentions)) {
				setContent(newContent);
			} else {
				setContent(content);
			}
		} else {
			setContent(newContent);
		}
		const cursorPos = e.target.selectionStart;
		setCursorPosition(cursorPos);
		const beforeCursor = newContent.substring(0, cursorPos);
		const mentionMatch = beforeCursor.match(/@(\w*)$/);
		if (mentionMatch) {
			setMentionQuery(mentionMatch[1]);
			setShowMentions(true);
			setSelectedIndex(0);
		} else {
			setShowMentions(false);
			setMentionQuery("");
		}
	};

	const handleSubmit = () => {
		if ((!content.trim() && files.length === 0) || !account?.id) return;

		createReply({ content, userId: account.id, files, parentId });
		setContent("");
		setFiles([]);
		onReply?.();
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		setFiles((prev) => [...prev, ...selectedFiles]);
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="space-y-4 border-border border-b p-4">
			<textarea
				ref={textareaRef}
				value={content}
				onChange={hanleContentChange}
				onKeyDown={handleKeyDown}
				rows={3}
				placeholder="Write your reply here"
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
								<HugeiconsIcon icon={Cancel01Icon} size={16} />
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
						<HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} size={18} />
					</button>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<HugeiconsIcon icon={SmileIcon} strokeWidth={1.5} size={18} />
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
				</div>
				<Button
					onClick={handleSubmit}
					disabled={(!content.trim() && files.length === 0) || isSubmitting}
				>
					{isSubmitting ? "Replying..." : "Reply"}
				</Button>
			</div>
		</div>
	);
};
