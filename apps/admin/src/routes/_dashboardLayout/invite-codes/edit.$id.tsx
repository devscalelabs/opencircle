import type { InviteCodeUpdate } from "@opencircle/core";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { useAccount } from "../../../features/auth/hooks/useAccount";
import { CreateInviteCode } from "../../../features/inviteCode/components/CreateInviteCode";
import { useInviteCode } from "../../../features/inviteCode/hooks/useInviteCode";
import { useInviteCodeSubmission } from "../../../features/inviteCode/hooks/useInviteCodeSubmission";

export const Route = createFileRoute("/_dashboardLayout/invite-codes/edit/$id")(
	{
		head: () => ({
			meta: [
				{
					title: "Edit Invite Code - OpenCircle Admin",
				},
				{
					name: "description",
					content: "Edit an invite code on OpenCircle",
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
	},
);

function RouteComponent() {
	const { id } = Route.useParams();
	const router = useRouter();
	const { inviteCode, isLoading } = useInviteCode(id);
	const { updateInviteCode, isSubmitting } = useInviteCodeSubmission();
	const { account } = useAccount();

	const handleSave = async (data: InviteCodeUpdate) => {
		if (!account?.id) {
			console.error("User not authenticated");
			return;
		}

		try {
			await updateInviteCode({
				id,
				data,
			});
			// Redirect to invite codes list
			router.navigate({ to: "/invite-codes" });
		} catch (error) {
			console.error("Failed to update invite code:", error);
		}
	};

	const handleCancel = () => {
		router.navigate({ to: "/invite-codes" });
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<CreateInviteCode
			onCreate={handleSave}
			onCancel={handleCancel}
			isLoading={isSubmitting}
			initialData={inviteCode || undefined}
			isEdit={true}
		/>
	);
}
