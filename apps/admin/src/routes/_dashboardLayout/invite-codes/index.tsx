import { Button } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { InviteCodeList } from "../../../features/inviteCode/components/inviteCodeList";

import { useInviteCodes } from "../../../features/inviteCode/hooks/useInviteCodes";

export const Route = createFileRoute("/_dashboardLayout/invite-codes/")({
	head: () => ({
		meta: [
			{
				title: "Invite Codes - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Manage invite codes on OpenCircle",
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
	const { inviteCodes, isInviteCodesLoading } = useInviteCodes();

	return (
		<main>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-2xl">Invite Codes</h1>
				<Link to="/invite-codes/new">
					<Button size="sm">Create Invite Code</Button>
				</Link>
			</div>
			<InviteCodeList
				inviteCodes={inviteCodes || []}
				loading={isInviteCodesLoading}
			/>
		</main>
	);
}
