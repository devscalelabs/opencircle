import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useDeleteInviteCode = () => {
	const queryClient = useQueryClient();

	const { mutate: deleteInviteCode, isPending: isDeleting } = useMutation({
		mutationFn: async (inviteCodeId: string) => {
			const response = await api.inviteCodes.delete(inviteCodeId);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["inviteCodes"] });
			queryClient.invalidateQueries({ queryKey: ["inviteCode"] });
			queryClient.invalidateQueries({ queryKey: ["inviteCodeStats"] });
		},
	});

	return {
		deleteInviteCode,
		isDeleting,
	};
};
