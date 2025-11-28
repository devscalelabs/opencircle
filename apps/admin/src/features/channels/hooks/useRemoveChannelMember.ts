import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useRemoveChannelMember = () => {
	const queryClient = useQueryClient();

	const { mutate: removeMember, isPending } = useMutation({
		mutationFn: async (data: { channelId: string; userId: string }) => {
			const response = await api.channels.removeMember(
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
		removeMember,
		isRemoving: isPending,
	};
};
