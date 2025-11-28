import type { ChannelCreate } from "@opencircle/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useUpdateChannel = () => {
	const queryClient = useQueryClient();

	const { mutate: updateChannel, isPending } = useMutation({
		mutationFn: async (data: { id: string } & Partial<ChannelCreate>) => {
			const { id, ...updateData } = data;
			const response = await api.channels.update(id, updateData);
			return response;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["channels"] });
			queryClient.invalidateQueries({ queryKey: ["channel", data.id] });
		},
	});

	return {
		updateChannel,
		isUpdating: isPending,
	};
};
