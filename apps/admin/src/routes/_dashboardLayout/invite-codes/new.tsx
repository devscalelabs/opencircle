import type { InviteCodeCreate, InviteCodeUpdate } from "@opencircle/core";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { useAccount } from "../../../features/auth/hooks/useAccount";
import { CreateInviteCode } from "../../../features/inviteCode/components/CreateInviteCode";
import { useInviteCodeSubmission } from "../../../features/inviteCode/hooks/useInviteCodeSubmission";

export const Route = createFileRoute("/_dashboardLayout/invite-codes/new")({
	head: () => ({
		meta: [
			{
				title: "Create Invite Code - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Create a new invite code on OpenCircle",
			},
		],
		links: [
			{
				rel: "icon",
				href: METADATA.favicon,
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const { createInviteCode, isSubmitting } = useInviteCodeSubmission();
	const { account } = useAccount();

	const handleSave = async (data: InviteCodeCreate | InviteCodeUpdate) => {
		if (!account?.id) {
			console.error("User not authenticated");
			return;
		}

		try {
			// For create, we need to ensure created_by is included
			const createData =
				"created_by" in data ? data : { ...data, created_by: account.id };
			await createInviteCode(createData);
			// Redirect to invite codes list
			router.navigate({ to: "/invite-codes" });
		} catch (error) {
			console.error("Failed to create invite code:", error);
		}
	};

	const handleCancel = () => {
		router.navigate({ to: "/invite-codes" });
	};

	return (
		<CreateInviteCode
			onCreate={handleSave}
			onCancel={handleCancel}
			isLoading={isSubmitting}
		/>
	);
}
