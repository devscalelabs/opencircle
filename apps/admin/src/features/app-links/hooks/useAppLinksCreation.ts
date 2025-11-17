import type { AppLinkCreate, AppLinkUpdate } from "@opencircle/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useAppLinksCreation = () => {
	const queryClient = useQueryClient();

	const { mutate: createAppLink, isPending } = useMutation({
		mutationFn: async (data: AppLinkCreate) => {
			const response = await api.appLinks.create(data);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["app-links"] });
		},
	});

	const { mutate: deleteAppLink, isPending: isDeleting } = useMutation({
		mutationFn: async (id: string) => {
			const response = await api.appLinks.delete(id);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["app-links"] });
		},
	});

	const { mutate: updateAppLink, isPending: isUpdating } = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: AppLinkUpdate }) => {
			const response = await api.appLinks.update(id, data);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["app-links"] });
		},
	});

	return {
		createAppLink,
		deleteAppLink,
		updateAppLink,
		isSubmitting: isPending,
		isDeleting,
		isUpdating,
	};
};
