import { createFileRoute, useRouter } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";
import { ArticleView } from "../../features/articles/components/ArticleView";
import { useArticle } from "../../features/articles/hooks/useArticle";
import { useArticleSubmission } from "../../features/articles/hooks/useArticleSubmission";

export const Route = createFileRoute("/_dashboardLayout/articles/$id")({
	head: () => ({
		meta: [
			{
				title: "Article View - OpenCircle Admin",
			},
			{
				name: "description",
				content: "View article details on OpenCircle",
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
	const { id } = Route.useParams();
	const router = useRouter();
	const { article, isArticleLoading } = useArticle(id);
	const { deleteArticle } = useArticleSubmission();

	const handleEdit = () => {
		router.navigate({ to: `/articles/edit/${id}` });
	};

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this article?")) {
			try {
				await deleteArticle(id);
				router.navigate({ to: "/articles" });
			} catch (error) {
				console.error("Failed to delete article:", error);
			}
		}
	};

	if (isArticleLoading || !article) {
		return <div>Loading...</div>;
	}

	return (
		<ArticleView
			article={article}
			onEdit={handleEdit}
			onDelete={handleDelete}
		/>
	);
}
