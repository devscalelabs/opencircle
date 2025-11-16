import { useQuery } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useChannel = (channelId: string) => {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["channel", channelId],
		queryFn: async () => {
			const response = await api.channels.getById(channelId);
			return response;
		},
		enabled: !!channelId,
	});

	return {
		channel: data,
		isChannelLoading: isLoading,
		isChannelError: isError,
		channelError: error,
	};
};
