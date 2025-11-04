import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../../../components/header";
import { METADATA } from "../../../constants/metadata";
import { ArticleList } from "../../../features/articles/components/articleList";

export const Route = createFileRoute("/_socialLayout/articles/")({
	head: () => ({
		meta: [
			{
				title: "Articles - OpenCircle",
			},
			{
				name: "description",
				content: "Read amazing articles from creators on OpenCircle",
			},
			{
				property: "og:title",
				content: "Articles - OpenCircle",
			},
			{
				property: "og:description",
				content: "Read amazing articles from creators on OpenCircle",
			},
			{
				property: "og:image",
				content: METADATA.ogImage,
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
	return (
		<>
			<Header label="Articles" />
			<ArticleList />
		</>
	);
}
