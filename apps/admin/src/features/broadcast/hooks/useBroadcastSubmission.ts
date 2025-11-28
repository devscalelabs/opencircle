import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";
import type { BroadcastCreate, BroadcastUpdate } from "../utils/types";

export const useBroadcastSubmission = () => {
	const queryClient = useQueryClient();

	const { mutate: createBroadcast, isPending: isCreating } = useMutation({
		mutationFn: async (data: BroadcastCreate) => {
			const response = await api.broadcasts.create(data);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
		},
	});

	const { mutate: updateBroadcast, isPending: isUpdating } = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: BroadcastUpdate }) => {
			const response = await api.broadcasts.update(id, data);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
			queryClient.invalidateQueries({ queryKey: ["broadcast"] });
		},
	});

	const { mutate: deleteBroadcast, isPending: isDeleting } = useMutation({
		mutationFn: async (broadcastId: string) => {
			const response = await api.broadcasts.delete(broadcastId);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
		},
	});

	const { mutate: sendTestBroadcast, isPending: isSendingTest } = useMutation({
		mutationFn: async ({
			id,
			testEmail,
		}: {
			id: string;
			testEmail: string;
		}) => {
			const response = await api.broadcasts.sendTest(id, {
				test_email: testEmail,
			});
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
			queryClient.invalidateQueries({ queryKey: ["broadcast"] });
		},
	});

	const { mutate: sendBroadcast, isPending: isSending } = useMutation({
		mutationFn: async (broadcastId: string) => {
			const response = await api.broadcasts.send(broadcastId);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
			queryClient.invalidateQueries({ queryKey: ["broadcast"] });
		},
	});

	return {
		createBroadcast,
		updateBroadcast,
		deleteBroadcast,
		sendTestBroadcast,
		sendBroadcast,
		isSubmitting:
			isCreating || isUpdating || isDeleting || isSendingTest || isSending,
		isCreating,
		isUpdating,
		isDeleting,
		isSendingTest,
		isSending,
	};
};
