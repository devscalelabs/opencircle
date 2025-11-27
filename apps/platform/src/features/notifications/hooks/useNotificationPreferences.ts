import type {
	NotificationFrequency,
	NotificationPreferences,
	NotificationPreferencesUpdate,
} from "@opencircle/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import toast from "react-hot-toast";
import { api } from "../../../utils/api";

export const useNotificationPreferences = () => {
	const queryClient = useQueryClient();

	const {
		data: preferences,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<NotificationPreferences>({
		queryKey: ["notificationPreferences"],
		queryFn: () => api.notifications.getPreferences(),
		retry: (failureCount, error) => {
			if (error instanceof HTTPError && error.response.status === 401) {
				return false;
			}
			return failureCount < 3;
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: NotificationPreferencesUpdate) =>
			api.notifications.updatePreferences(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
			toast.success("Notification preferences updated");
		},
		onError: () => {
			toast.error("Failed to update preferences");
		},
	});

	const updatePreference = (
		type: "mention_email" | "like_email" | "reply_email",
		value: NotificationFrequency,
	) => {
		updateMutation.mutate({ [type]: value });
	};

	return {
		preferences,
		isLoading,
		isError,
		error,
		refetch,
		updatePreference,
		isUpdating: updateMutation.isPending,
	};
};
