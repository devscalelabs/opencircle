import type { PostUpdate } from "@opencircle/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const usePostUpdate = () => {
	const queryClient = useQueryClient();

	const { mutate: updatePost, isPending } = useMutation({
		mutationFn: async (data: { id: string; content: string }) => {
			const postData: PostUpdate = {
				content: data.content,
			};
			const response = await api.posts.update(data.id, postData);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	return {
		updatePost,
		isUpdating: isPending,
	};
};
