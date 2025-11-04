import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";
import { UserTable } from "../../features/user/components/userTable";
import { useUsers } from "../../features/user/hooks/useUsers";

export const Route = createFileRoute("/_dashboardLayout/users")({
	head: () => ({
		meta: [
			{
				title: "Users - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Manage users on OpenCircle",
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
	const { users, isUsersLoading } = useUsers();

	return (
		<main>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-2xl">Users</h1>
			</div>
			<UserTable users={users} isLoading={isUsersLoading} />
		</main>
	);
}
