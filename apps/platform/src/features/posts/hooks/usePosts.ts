import type { Post } from "@opencircle/core";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { api } from "../../../utils/api";

interface SearchParams {
	channel?: string;
}

interface usePostsProps {
	skip?: number;
	limit?: number;
	userId?: string;
	parentId?: string;
	postType?: "posts" | "comment" | "article";
	channelSlug?: string;
}

export const usePosts = (props?: usePostsProps) => {
	const search = useSearch({ strict: false }) as SearchParams;
	const channelSlug = props?.channelSlug || search?.channel;

	const { data, isLoading } = useQuery<Post[]>({
		initialData: [],
		queryKey: ["posts", props, channelSlug],
		queryFn: async () => {
			const response = await api.posts.getAll(
				props?.limit,
				props?.skip,
				props?.userId,
				props?.postType,
				props?.parentId,
				channelSlug,
			);
			return response;
		},
	});

	return {
		posts: data,
		isPostLoading: isLoading,
	};
};
