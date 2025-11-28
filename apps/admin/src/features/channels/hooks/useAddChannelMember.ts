import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useAddChannelMember = () => {
	const queryClient = useQueryClient();

	const { mutate: addMember, isPending } = useMutation({
		mutationFn: async (data: { channelId: string; userId: string }) => {
			const response = await api.channels.addMember(
				data.channelId,
				data.userId,
			);
			return response;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["channelMembers", variables.channelId],
			});
		},
	});

	return {
		addMember,
		isAdding: isPending,
	};
};
