import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { api } from "../../../utils/api";

export const useResources = (channelId?: string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["resources", { channelId }],
		queryFn: async () => {
			if (channelId) {
				return await api.resources.getByChannel(channelId);
			}
			return await api.resources.getAll();
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
		resources: data,
		isResourcesLoading: isLoading,
		error,
	};
};
