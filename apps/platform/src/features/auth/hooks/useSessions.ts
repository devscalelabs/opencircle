import type { Session } from "@opencircle/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { api, clearTokens } from "../../../utils/api";

export const useSessions = () => {
	const navigate = useNavigate();

	const {
		data: sessions,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<Session[]>({
		queryKey: ["sessions"],
		queryFn: () => api.account.getSessions(),
	});

	const revokeMutation = useMutation({
		mutationFn: (sessionId: string) =>
			api.account.revokeSession({ session_id: sessionId }),
		onSuccess: async () => {
			const result = await refetch();
			const remainingSessions = result.data || [];

			if (remainingSessions.length === 0) {
				toast.success("All sessions revoked. Logging out...");
				clearTokens();
				navigate({ to: "/login" });
			} else {
				toast.success("Session revoked successfully");
			}
		},
		onError: () => {
			toast.error("Failed to revoke session");
		},
	});

	const revokeSession = (sessionId: string) => {
		revokeMutation.mutate(sessionId);
	};

	return {
		sessions,
		isLoading,
		isError,
		error,
		revokeSession,
		isRevoking: revokeMutation.isPending,
	};
};
