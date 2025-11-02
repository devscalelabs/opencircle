import type { Post } from "@opencircle/core";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { HTTPError } from "ky";
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

	const { data, isLoading, error } = useQuery<Post[]>({
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
		retry: (failureCount, error) => {
			if (error instanceof HTTPError && error.response.status === 403) {
				console.error("Not Eligible to access");
				return false;
			}
			return failureCount < 3;
		},
	});

	return {
		posts: data,
		isPostLoading: isLoading,
		error,
	};
};
