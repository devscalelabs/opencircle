import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const usePromoteToAdmin = () => {
	const queryClient = useQueryClient();

	const { mutate: promoteToAdmin, isPending: isPromoting } = useMutation({
		mutationFn: async (userId: string) => {
			const response = await api.users.update(userId, { role: "admin" });
			return response;
		},
		onSuccess: (_, userId) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user", { id: userId }] });
		},
		onError: (error) => {
			console.error("Failed to promote user to admin:", error);
		},
	});

	return {
		promoteToAdmin,
		isPromoting,
	};
};
