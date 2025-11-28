import { useQuery } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useChannelMembers = (channelId: string) => {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["channelMembers", channelId],
		queryFn: async () => {
			const response = await api.channels.getMembers(channelId);
			return response;
		},
		enabled: !!channelId,
	});

	return {
		members: data || [],
		isMembersLoading: isLoading,
		isMembersError: isError,
		membersError: error,
	};
};
