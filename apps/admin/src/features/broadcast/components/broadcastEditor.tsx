import {
	FloppyDiskIcon,
	ViewIcon,
	ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input } from "@opencircle/ui";
import { useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import { useId, useState } from "react";
import { api } from "../../../utils/api";
import type {
	BroadcastCreate,
	BroadcastRecipientType,
	BroadcastUpdate,
} from "../utils/types";

interface BroadcastEditorProps {
	broadcast?: Partial<BroadcastCreate> & { id?: string };
	onSave: (data: BroadcastCreate | BroadcastUpdate) => Promise<void>;
	onCancel?: () => void;
	loading?: boolean;
	isEdit?: boolean;
}

export const BroadcastEditor = ({
	broadcast,
	onSave,
	onCancel,
	loading,
	isEdit = false,
}: BroadcastEditorProps) => {
	const [subject, setSubject] = useState(broadcast?.subject || "");
	const [content, setContent] = useState(broadcast?.content || "");
	const [recipientType, setRecipientType] = useState<BroadcastRecipientType>(
		broadcast?.recipient_type || "all_users",
	);
	const [channelId, setChannelId] = useState(broadcast?.channel_id || "");
	const [showPreview, setShowPreview] = useState(false);
	const recipientTypeId = useId();
	const channelSelectId = useId();

	const { data: channels } = useQuery({
		queryKey: ["channels"],
		queryFn: () => api.channels.getAll(),
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!subject.trim() || !content.trim()) {
			return;
		}

		if (recipientType === "channel_members" && !channelId) {
			return;
		}

		if (isEdit && broadcast?.id) {
			const updateData: BroadcastUpdate = {
				subject: subject.trim(),
				content: content.trim(),
				recipient_type: recipientType,
				channel_id: recipientType === "channel_members" ? channelId : undefined,
			};
			await onSave(updateData);
		} else {
			const createData: BroadcastCreate = {
				subject: subject.trim(),
				content: content.trim(),
				recipient_type: recipientType,
				channel_id: recipientType === "channel_members" ? channelId : undefined,
			};
			await onSave(createData);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">
					{isEdit ? "Edit Broadcast" : "Create New Broadcast"}
				</h1>
				<div className="flex gap-2">
					{onCancel && (
						<Button type="button" onClick={onCancel}>
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						disabled={loading || !subject.trim() || !content.trim()}
					>
						<HugeiconsIcon icon={FloppyDiskIcon} size={16} className="mr-2" />
						{loading ? "Saving..." : "Save Draft"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<div>
						<label htmlFor="subject" className="mb-2 block font-medium text-sm">
							Subject *
						</label>
						<Input
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							placeholder="Enter email subject..."
							required
						/>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between">
							<label htmlFor="content" className="block font-medium text-sm">
								Content (Markdown/HTML) *
							</label>
							<Button
								type="button"
								size="sm"
								onClick={() => setShowPreview(!showPreview)}
							>
								{showPreview ? (
									<HugeiconsIcon
										icon={ViewOffSlashIcon}
										size={14}
										className="mr-1"
									/>
								) : (
									<HugeiconsIcon icon={ViewIcon} size={14} className="mr-1" />
								)}
								{showPreview ? "Edit" : "Preview"}
							</Button>
						</div>
						{showPreview ? (
							<div className="prose prose-invert min-h-[400px] max-w-none rounded-lg border border-border p-4">
								<MDEditor.Markdown source={content} />
							</div>
						) : (
							<div data-color-mode="dark">
								<MDEditor
									value={content}
									onChange={(val) => setContent(val || "")}
									height={400}
									preview="edit"
									hideToolbar={false}
									visibleDragbar={false}
								/>
							</div>
						)}
					</div>
				</div>

				<div className="space-y-4">
					<div className="rounded-lg border border-border bg-background-secondary/30 p-4">
						<h3 className="mb-3 font-semibold text-sm">Recipients</h3>
						<div className="space-y-3">
							<div>
								<label
									htmlFor={recipientTypeId}
									className="mb-1 block text-foreground/60 text-xs"
								>
									Send to
								</label>
								<select
									id={recipientTypeId}
									value={recipientType}
									onChange={(e) =>
										setRecipientType(e.target.value as BroadcastRecipientType)
									}
									className="w-full rounded-lg border border-border bg-background p-2 text-sm"
								>
									<option value="all_users">All Users</option>
									<option value="channel_members">Channel Members</option>
								</select>
							</div>

							{recipientType === "channel_members" && (
								<div>
									<label
										htmlFor={channelSelectId}
										className="mb-1 block text-foreground/60 text-xs"
									>
										Select Channel
									</label>
									<select
										id={channelSelectId}
										value={channelId}
										onChange={(e) => setChannelId(e.target.value)}
										className="w-full rounded-lg border border-border bg-background p-2 text-sm"
									>
										<option value="">Select a channel...</option>
										{channels?.map((channel) => (
											<option key={channel.id} value={channel.id}>
												{channel.emoji} {channel.name}
											</option>
										))}
									</select>
								</div>
							)}
						</div>
					</div>

					<div className="rounded-lg border border-border bg-background-secondary/30 p-4">
						<h3 className="mb-2 font-semibold text-sm">Tips</h3>
						<ul className="space-y-1 text-foreground/60 text-sm">
							<li>- Use Markdown for formatting</li>
							<li>- Preview before sending</li>
							<li>- Test with a single email first</li>
						</ul>
					</div>
				</div>
			</div>
		</form>
	);
};
