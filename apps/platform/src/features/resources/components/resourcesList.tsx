import { LockIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input } from "@opencircle/ui";
import { useState } from "react";
import { useAccount } from "../../../features/auth/hooks/useAccount";
import { api } from "../../../utils/api";
import { useResources } from "../hooks/useResources";
import { ResourceCard } from "./resourceCard";
import { ResourcesListSkeleton } from "./resourcesListSkeleton";

interface ResourcesListProps {
	channelId?: string;
}

export const ResourcesList = ({ channelId }: ResourcesListProps) => {
	const { resources, isResourcesLoading, error } = useResources(channelId);
	const [inviteCode, setInviteCode] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { account } = useAccount();

	const handleRequestAccess = async () => {
		if (!inviteCode.trim()) return;

		setIsSubmitting(true);
		try {
			if (!account?.id) {
				alert("Please log in to request access");
				return;
			}

			const response = await api.inviteCodes.validate({
				code: inviteCode,
				user_id: account.id,
			});

			if (response.valid) {
				// Successfully validated - refresh resources to show content
				window.location.reload();
			} else {
				alert(response.message || "Failed to validate invite code");
			}
		} catch (err) {
			console.error("Error validating invite code:", err);
			alert("An error occurred while validating the invite code");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isResourcesLoading) {
		return <ResourcesListSkeleton />;
	}

	if (error) {
		return (
			<div className="flex h-90 flex-col items-center justify-center gap-4">
				<div className="rounded-xl bg-background-secondary p-4">
					<HugeiconsIcon icon={LockIcon} className="text-foreground" />
				</div>
				<div className="text-balance">
					You are not eligible to access this content.
				</div>
				{account?.id && (
					<div className="space-y-2">
						<Input
							placeholder="Invite Code"
							className="w-full"
							value={inviteCode}
							onChange={(e) => setInviteCode(e.target.value)}
						/>
						<Button
							className="w-full"
							onClick={handleRequestAccess}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Processing..." : "Request Access"}
						</Button>
					</div>
				)}
			</div>
		);
	}

	if (!resources || resources.length === 0) {
		return (
			<div className="p-8 text-center text-foreground/50">
				<p>No resources found</p>
			</div>
		);
	}

	return (
		<div className="space-y-4 p-4">
			{resources.map((resource) => (
				<ResourceCard key={resource.id} resource={resource} />
			))}
		</div>
	);
};
