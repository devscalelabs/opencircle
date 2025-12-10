import { useQuery } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useUsers = (
	skip: number = 0,
	limit: number = 500,
	query?: string,
) => {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["users", { skip, limit, query }],
		queryFn: async () => {
			const response = await api.users.getAll(skip, limit, query);
			return response;
		},
	});

	return {
		users: data || [],
		isUsersLoading: isLoading,
		isUsersError: isError,
		usersError: error,
	};
};
