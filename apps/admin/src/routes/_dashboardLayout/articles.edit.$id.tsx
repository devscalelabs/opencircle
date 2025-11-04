import { createFileRoute, useRouter } from "@tanstack/react-router";
import { METADATA } from "../../constants/metadata";
import { ArticleEditor } from "../../features/articles/components/ArticleEditor";
import { useArticle } from "../../features/articles/hooks/useArticle";
import { useArticleSubmission } from "../../features/articles/hooks/useArticleSubmission";
import type {
	CreateArticleRequest,
	UpdateArticleRequest,
} from "../../features/articles/utils/types";

export const Route = createFileRoute("/_dashboardLayout/articles/edit/$id")({
	head: () => ({
		meta: [
			{
				title: "Edit Article - OpenCircle Admin",
			},
			{
				name: "description",
				content: "Edit an article on OpenCircle",
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
	const { updateArticle, isSubmitting } = useArticleSubmission();

	const handleSave = async (
		data: CreateArticleRequest | UpdateArticleRequest,
	) => {
		try {
			await updateArticle({ id, ...data });
			// Redirect to article view
			router.navigate({ to: `/articles/${id}` });
		} catch (error) {
			console.error("Failed to update article:", error);
		}
	};

	const handleCancel = () => {
		router.navigate({ to: `/articles/${id}` });
	};

	if (isArticleLoading || !article) {
		return <div>Loading...</div>;
	}

	return (
		<ArticleEditor
			article={article}
			onSave={handleSave}
			onCancel={handleCancel}
			loading={isSubmitting}
			isEdit={true}
		/>
	);
}
