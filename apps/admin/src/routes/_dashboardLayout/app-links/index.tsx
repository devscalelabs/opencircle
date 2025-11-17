import { Button } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { METADATA } from "../../../constants/metadata";
import { AppLinksList } from "../../../features/app-links/components/appLinksList";
import { CreateAppLinkDialog } from "../../../features/app-links/components/createAppLinkDialog";
import { useAppLinks } from "../../../features/app-links/hooks/useAppLinks";
import { useAppLinksCreation } from "../../../features/app-links/hooks/useAppLinksCreation";
import { useAccount } from "../../../features/auth/hooks/useAccount";

export const Route = createFileRoute("/_dashboardLayout/app-links/")({
	head: () => ({
		meta: [
			{
				title: "App Links - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Manage app links on OpenCircle",
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
	const { appLinks, isAppLinksLoading } = useAppLinks();
	const { deleteAppLink } = useAppLinksCreation();

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this app link?")) {
			try {
				deleteAppLink(id);
			} catch (error) {
				console.error("Failed to delete app link:", error);
			}
		}
	};

	return (
		<main>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-2xl">App Links</h1>
				{account && (
					<CreateAppLinkDialog>
						<Button size="sm">Add App Link</Button>
					</CreateAppLinkDialog>
				)}
			</div>

			<AppLinksList
				appLinks={appLinks}
				onDelete={handleDelete}
				loading={isAppLinksLoading}
			/>
		</main>
	);
}
