import { SmileIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ChannelCreate, ChannelType } from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { DropdownMenu } from "radix-ui";
import { useId, useState } from "react";
import slugify from "slugify";

interface ChannelFormProps {
	initialValues?: {
		name: string;
		description: string;
		slug: string;
		type: ChannelType;
		emoji: string;
	};
	onSubmit: (data: ChannelCreate) => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	submitLabel?: string;
}

export const ChannelForm = ({
	initialValues = {
		name: "",
		description: "",
		slug: "",
		type: "public" as ChannelType,
		emoji: "😊",
	},
	onSubmit,
	onCancel,
	isSubmitting = false,
	submitLabel = "Save",
}: ChannelFormProps) => {
	const [formData, setFormData] = useState(initialValues);

	// Generate unique IDs for form elements
	const nameId = useId();
	const descriptionId = useId();
	const emojiId = useId();
	const typeId = useId();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const channelData: ChannelCreate = {
			name: formData.name,
			description: formData.description || undefined,
			slug: formData.slug,
			type: formData.type,
			emoji: formData.emoji,
		};

		onSubmit(channelData);
	};

	const handleInputChange =
		(field: string) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const value = e.target.value;
			setFormData((prev) => {
				const updated = { ...prev, [field]: value };

				// Auto-generate slug when name changes
				if (field === "name") {
					updated.slug = slugify(value, { lower: true, strict: true });
				}

				return updated;
			});
		};

	return (
		<form onSubmit={handleSubmit}>
			<div className="grid gap-4 py-4">
				<div className="grid gap-2">
					<label htmlFor={nameId} className="font-medium text-sm">
						Name
					</label>
					<Input
						id={nameId}
						value={formData.name}
						onChange={handleInputChange("name")}
						placeholder="Enter channel name"
						required
					/>
				</div>
				<div className="grid gap-2">
					<label htmlFor={descriptionId} className="font-medium text-sm">
						Description
					</label>
					<Input
						id={descriptionId}
						value={formData.description}
						onChange={handleInputChange("description")}
						placeholder="Channel description (optional)"
					/>
				</div>
				<div className="grid gap-2">
					<label htmlFor={emojiId} className="font-medium text-sm">
						Emoji
					</label>
					<div className="flex gap-2">
						<Input
							id={emojiId}
							value={formData.emoji}
							onChange={handleInputChange("emoji")}
							placeholder="😊"
							className="flex-1"
						/>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<Button type="button" variant="secondary" size="md">
									<HugeiconsIcon icon={SmileIcon} strokeWidth={1.5} size={18} />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content side="right">
								<EmojiPicker
									theme={Theme.DARK}
									emojiStyle={EmojiStyle.TWITTER}
									reactionsDefaultOpen
									skinTonesDisabled
									onEmojiClick={(emojiData) => {
										setFormData((prev) => ({
											...prev,
											emoji: emojiData.emoji,
										}));
									}}
								/>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
				<div className="grid gap-2">
					<label htmlFor={typeId} className="font-medium text-sm">
						Type
					</label>
					<select
						id={typeId}
						value={formData.type}
						onChange={handleInputChange("type")}
						className="block w-full rounded-md border border-border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="public">Public</option>
						<option value="private">Private</option>
					</select>
				</div>
			</div>
			<div className="flex justify-end gap-2">
				{onCancel && (
					<Button
						type="button"
						variant="secondary"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				)}
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : submitLabel}
				</Button>
			</div>
		</form>
	);
};
