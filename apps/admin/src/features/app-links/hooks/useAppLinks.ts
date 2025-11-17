import { useQuery } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useAppLinks = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["app-links"],
		queryFn: async () => {
			return await api.appLinks.getAll();
		},
	});

	return {
		appLinks: data,
		isAppLinksLoading: isLoading,
	};
};
