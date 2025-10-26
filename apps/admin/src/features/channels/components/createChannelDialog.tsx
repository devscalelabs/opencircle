import type { ChannelCreate, ChannelType } from "@opencircle/core";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
} from "@opencircle/ui";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useId, useState } from "react";
import slugify from "slugify";
import { useChannelCreation } from "../hooks/useChannelCreation";

interface CreateChannelDialogProps {
	children: React.ReactNode;
}

export const CreateChannelDialog = ({ children }: CreateChannelDialogProps) => {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		slug: "",
		type: "public" as ChannelType,
		emoji: "😊",
	});
	const { createChannel, isSubmitting } = useChannelCreation();

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

		createChannel(channelData, {
			onSuccess: () => {
				setOpen(false);
				setFormData({
					name: "",
					description: "",
					slug: "",
					type: "public" as ChannelType,
					emoji: "😊",
				});
			},
		});
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="p-6">
				<DialogHeader>
					<DialogTitle>Create New Channel</DialogTitle>
					<DialogDescription>
						Create a new channel for your community.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label htmlFor={nameId} className="text-sm font-medium">
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
							<label htmlFor={descriptionId} className="text-sm font-medium">
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
							<label htmlFor={emojiId} className="text-sm font-medium">
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
											<Smile strokeWidth={1.5} size={18} />
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
							<label htmlFor={typeId} className="text-sm font-medium">
								Type
							</label>
							<select
								id={typeId}
								value={formData.type}
								onChange={handleInputChange("type")}
								className="w-full block border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
							>
								<option value="public">Public</option>
								<option value="private">Private</option>
							</select>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="secondary"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Channel"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
