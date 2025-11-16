import { Button } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { useAccount } from "../../../features/auth/hooks/useAccount";
import { CreateResourceDialog } from "../../../features/resources/components/createResourceDialog";
import { ResourcesList } from "../../../features/resources/components/resourcesList";
import { useResourceCreation } from "../../../features/resources/hooks/useResourceCreation";
import { useResources } from "../../../features/resources/hooks/useResources";

export const Route = createFileRoute("/_dashboardLayout/resources/")({
	head: () => ({
		meta: [
			{
				title: "Resources - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Manage resources on OpenCircle",
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
	const { account } = useAccount();
	const { resources, isResourcesLoading } = useResources();
	const { deleteResource } = useResourceCreation();

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this resource?")) {
			try {
				deleteResource(id);
			} catch (error) {
				console.error("Failed to delete resource:", error);
			}
		}
	};

	return (
		<main>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-2xl">Resources</h1>
				{account && (
					<CreateResourceDialog userId={account.id}>
						<Button size="sm">Add Resource</Button>
					</CreateResourceDialog>
				)}
			</div>

			<ResourcesList
				resources={resources}
				onDelete={handleDelete}
				loading={isResourcesLoading}
			/>
		</main>
	);
}
