import { useQuery } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useBroadcasts = () => {
	return useQuery({
		queryKey: ["broadcasts"],
		queryFn: async () => {
			const response = await api.broadcasts.getAll();
			return response;
		},
	});
};

export const useBroadcast = (id: string) => {
	return useQuery({
		queryKey: ["broadcast", id],
		queryFn: async () => {
			const response = await api.broadcasts.getById(id);
			return response;
		},
		enabled: !!id,
	});
};
