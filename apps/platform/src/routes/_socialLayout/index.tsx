import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Header } from "../../components/header";
import { METADATA } from "../../constants/metadata";
import { PostForm } from "../../features/posts/components/postForm";
import { PostsList } from "../../features/timeline/components/postsList";

const searchSchema = z.object({
	channel: z.string().optional(),
});

export const Route = createFileRoute("/_socialLayout/")({
	validateSearch: zodValidator(searchSchema),
	head: () => ({
		meta: [
			{
				title: "Timeline - OpenCircle",
			},
			{
				name: "description",
				content:
					"Connect with creators and explore amazing content on OpenCircle",
			},
			{
				property: "og:title",
				content: "Timeline - OpenCircle",
			},
			{
				property: "og:description",
				content:
					"Connect with creators and explore amazing content on OpenCircle",
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
	component: Index,
});

function Index() {
	return (
		<>
			<Header label="Timeline" />
			<main>
				<PostForm />
				<PostsList />
			</main>
		</>
	);
}
