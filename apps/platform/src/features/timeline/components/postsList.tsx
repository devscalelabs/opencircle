import { Button, Input } from "@opencircle/ui";
import { LockIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "../../../features/auth/hooks/useAccount";
import { api } from "../../../utils/api";
import { PostCard } from "../../posts/components/postCard";
import { usePosts } from "../../posts/hooks/usePosts";
import { PostsListSkeleton } from "./postsListSkeleton";

export const PostsList = () => {
	const {
		posts,
		isPostLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePosts();
	const [inviteCode, setInviteCode] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { account } = useAccount();
	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 1.0 },
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
		return <PostsListSkeleton />;
	}

	if (error) {
		return (
			<div className="flex h-90 flex-col items-center justify-center gap-4">
				<div className="rounded-xl bg-background-secondary p-4">
					<LockIcon className="text-foreground" />
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

	return (
		<>
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
			{hasNextPage && (
				<div ref={observerTarget} className="p-4 text-center">
					{isFetchingNextPage ? (
						<div className="text-muted-foreground text-sm">Loading more...</div>
					) : (
						<div className="h-4" />
					)}
				</div>
			)}
		</>
	);
};
