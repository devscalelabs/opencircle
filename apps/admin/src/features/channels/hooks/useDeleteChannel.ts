import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useDeleteChannel = () => {
	const queryClient = useQueryClient();

	const { mutate: deleteChannel, isPending: isDeleting } = useMutation({
		mutationFn: async (channelId: string) => {
			const response = await api.channels.delete(channelId);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["channels"] });
			queryClient.invalidateQueries({ queryKey: ["channel"] });
		},
	});

	return {
		deleteChannel,
		isDeleting,
	};
};
