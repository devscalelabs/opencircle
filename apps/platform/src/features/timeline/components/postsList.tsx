import { Button, Input } from "@opencircle/ui";
import { LockIcon } from "lucide-react";
import { useState } from "react";
import { useAccount } from "../../../features/auth/hooks/useAccount";
import { api } from "../../../utils/api";
import { PostCard } from "../../posts/components/postCard";
import { usePosts } from "../../posts/hooks/usePosts";

export const PostsList = () => {
	const { posts, isPostLoading, error } = usePosts();
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
				// Successfully validated - refresh posts to show content
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

	if (isPostLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center gap-4 h-90">
				<div className="bg-background-secondary p-4 rounded-xl">
					<LockIcon className="text-foreground" />
				</div>
				<div className="text-balance">
					You are not eligible to access this content.
				</div>
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
			</div>
		);
	}

	return (
		<>
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
		</>
	);
};
