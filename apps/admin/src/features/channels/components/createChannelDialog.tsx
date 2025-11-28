import type { ChannelCreate } from "@opencircle/core";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@opencircle/ui";
import { useState } from "react";
import { useChannelCreation } from "../hooks/useChannelCreation";
import { ChannelForm } from "./channelForm";

interface CreateChannelDialogProps {
	children: React.ReactNode;
}

export const CreateChannelDialog = ({ children }: CreateChannelDialogProps) => {
	const [open, setOpen] = useState(false);
	const { createChannel, isSubmitting } = useChannelCreation();

	const handleSubmit = (data: ChannelCreate) => {
		createChannel(data, {
			onSuccess: () => {
				setOpen(false);
			},
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
				<ChannelForm
					onSubmit={handleSubmit}
					onCancel={() => setOpen(false)}
					isSubmitting={isSubmitting}
					submitLabel="Create Channel"
				/>
			</DialogContent>
		</Dialog>
	);
};
