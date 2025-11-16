import { useQuery } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useInviteCodeStats = (inviteCodeId: string) => {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["inviteCodeStats", inviteCodeId],
		queryFn: async () => {
			const response = await api.inviteCodes.getUsageStats(inviteCodeId);
			return response;
		},
		enabled: !!inviteCodeId,
	});

	return {
		inviteCodeStats: data,
		isInviteCodeStatsLoading: isLoading,
		isInviteCodeStatsError: isError,
		inviteCodeStatsError: error,
	};
};
