import type {
	InviteCode,
	InviteCodeCreate,
	InviteCodeUpdate,
} from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import { DropdownMenu } from "radix-ui";
import { useEffect, useId, useState } from "react";
import { useAccount } from "../../auth/hooks/useAccount";
import { useChannels } from "../../channels/hooks/useChannels";

interface CreateInviteCodeProps {
	onCreate: (data: InviteCodeCreate | InviteCodeUpdate) => void;
	onCancel: () => void;
	isLoading?: boolean;
	initialData?: InviteCode;
	isEdit?: boolean;
}

export const CreateInviteCode = ({
	onCreate,
	onCancel,
	isLoading,
	initialData,
	isEdit = false,
}: CreateInviteCodeProps) => {
	const codeId = useId();
	const maxUsesId = useId();
	const expiresAtId = useId();
	const autoJoinChannelId = useId();
	const { account } = useAccount();
	const { channels, isChannelsLoading } = useChannels();

	const [formData, setFormData] = useState<InviteCodeCreate>({
		created_by: account?.id || "", // Get current user ID from account
	});

	useEffect(() => {
		if (initialData && isEdit) {
			setFormData({
				code: initialData.code,
				max_uses: initialData.max_uses,
				expires_at: initialData.expires_at,
				auto_join_channel_id: initialData.auto_join_channel_id,
				created_by: initialData.created_by,
			});
		}
	}, [initialData, isEdit]);

	// Update created_by when account changes
	useEffect(() => {
		if (account?.id && !isEdit) {
			setFormData((prev) => ({
				...prev,
				created_by: account.id,
			}));
		}
	}, [account, isEdit]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.created_by && !isEdit) {
			console.error("User ID is required");
			return;
		}

		if (isEdit) {
			// For edit, create InviteCodeUpdate
			const updateData: InviteCodeUpdate = {
				max_uses: formData.max_uses,
				expires_at: formData.expires_at,
				auto_join_channel_id: formData.auto_join_channel_id,
			};
			onCreate(updateData);
		} else {
			// For create, use InviteCodeCreate
			onCreate(formData);
		}
	};

	const handleChange = (
		field: keyof InviteCodeCreate,
		value: string | number,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<div className="mx-auto max-w-2xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-3xl">
					{isEdit ? "Edit Invite Code" : "Create New Invite Code"}
				</h1>
				<Button variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<label htmlFor={codeId} className="font-medium text-gray-700 text-sm">
						Code (optional)
					</label>
					<Input
						id={codeId}
						placeholder="Leave empty to generate automatically"
						value={formData.code || ""}
						onChange={(e) => handleChange("code", e.target.value)}
						disabled={isEdit} // Don't allow editing code in edit mode
					/>
				</div>

				<div className="space-y-2">
					<label
						htmlFor={maxUsesId}
						className="font-medium text-gray-700 text-sm"
					>
						Max Uses (0 for unlimited)
					</label>
					<Input
						id={maxUsesId}
						type="number"
						min="0"
						placeholder="0"
						value={formData.max_uses ?? ""}
						onChange={(e) =>
							handleChange("max_uses", parseInt(e.target.value, 10) || 0)
						}
					/>
				</div>

				<div className="space-y-2">
					<label
						htmlFor={expiresAtId}
						className="font-medium text-gray-700 text-sm"
					>
						Expires At (optional)
					</label>
					<Input
						id={expiresAtId}
						type="datetime-local"
						value={
							formData.expires_at
								? new Date(formData.expires_at).toISOString().slice(0, 16)
								: ""
						}
						onChange={(e) =>
							handleChange(
								"expires_at",
								e.target.value ? new Date(e.target.value).toISOString() : "",
							)
						}
					/>
				</div>

				<div className="space-y-2">
					<label
						htmlFor={autoJoinChannelId}
						className="font-medium text-gray-700 text-sm"
					>
						Auto Join Channel (optional)
					</label>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<Button
								variant="secondary"
								id={autoJoinChannelId}
								className="w-full justify-between"
								disabled={isChannelsLoading}
							>
								{formData.auto_join_channel_id
									? channels.find((c) => c.id === formData.auto_join_channel_id)
											?.name || "Select Channel"
									: "Select Channel"}
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Portal>
							<DropdownMenu.Content className="w-56 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
								<DropdownMenu.Item
									onClick={() => handleChange("auto_join_channel_id", "")}
									className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm hover:bg-gray-100"
								>
									None
								</DropdownMenu.Item>
								{channels.map((channel) => (
									<DropdownMenu.Item
										key={channel.id}
										onClick={() =>
											handleChange("auto_join_channel_id", channel.id)
										}
										className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm hover:bg-gray-100"
									>
										{channel.name}
									</DropdownMenu.Item>
								))}
							</DropdownMenu.Content>
						</DropdownMenu.Portal>
					</DropdownMenu.Root>
				</div>

				<div className="flex gap-4">
					<Button
						type="submit"
						variant="primary"
						disabled={isLoading}
						className="flex-1"
					>
						{isLoading
							? isEdit
								? "Updating..."
								: "Creating..."
							: isEdit
								? "Update Invite Code"
								: "Create Invite Code"}
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={onCancel}
						className="flex-1"
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
};
