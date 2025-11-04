import { Button } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";
import { ArticleList } from "../../features/articles/components/ArticleList";
import { useArticleSubmission } from "../../features/articles/hooks/useArticleSubmission";
import { useArticles } from "../../features/articles/hooks/useArticles";

export const Route = createFileRoute("/_dashboardLayout/articles/")({
	head: () => ({
		meta: [
			{
				title: "Articles - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Manage articles on OpenCircle",
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
	const { articles, isArticlesLoading } = useArticles();
	const { deleteArticle } = useArticleSubmission();

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this article?")) {
			try {
				await deleteArticle(id);
			} catch (error) {
				console.error("Failed to delete article:", error);
			}
		}
	};

	return (
		<main>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-2xl">Articles</h1>
				<Link to="/articles/new">
					<Button size="sm">Create Article</Button>
				</Link>
			</div>
			<ArticleList
				articles={articles || []}
				onDelete={handleDelete}
				loading={isArticlesLoading}
			/>
		</main>
	);
}
