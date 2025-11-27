import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { api, setTokens } from "../../../utils/api";

export const useGitHubAuth = () => {
	const navigate = useNavigate();

	const {
		data: authUrlData,
		refetch: getAuthUrl,
		isPending: isAuthUrlLoading,
		isError: isAuthUrlError,
		error: authUrlError,
	} = useQuery({
		queryKey: ["github-auth-url"],
		queryFn: async () => {
			const res = await api.auth.githubLogin();
			return res;
		},
		enabled: false, // Don't run automatically
	});

	const {
		mutate: handleGitHubCallback,
		isPending: isCallbackLoading,
		isError: isCallbackError,
		error: callbackError,
	} = useMutation({
		mutationKey: ["github-callback"],
		mutationFn: async (code: string) => {
			const res = await api.auth.githubCallback({ code });
			return res;
		},
		onSuccess: (data) => {
			setTokens(data.access_token, data.refresh_token);
			toast.success("Successfully logged in with GitHub!");
			navigate({ to: "/" });
		},
		onError: (error) => {
			if (error instanceof HTTPError) {
				if (error.response.status === 403) {
					toast.error("Your account has been banned. Please contact support.");
				} else if (error.response.status === 400) {
					toast.error("GitHub authentication failed. Please try again.");
				} else {
					toast.error("An error occurred during GitHub login.");
				}
			} else {
				toast.error("An error occurred during GitHub login.");
			}
		},
	});

	const loginWithGitHub = useCallback(() => {
		getAuthUrl()
			.then((result) => {
				if (result.data?.authorization_url) {
					// Redirect to GitHub for authentication
					window.location.href = result.data.authorization_url;
				}
			})
			.catch(() => {
				toast.error("Failed to initiate GitHub login");
			});
	}, [getAuthUrl]);

	// Handle GitHub callback (call this from your callback page/component)
	const handleCallback = useCallback(
		(code: string) => {
			handleGitHubCallback(code);
		},
		[handleGitHubCallback],
	);

	return {
		// Methods
		loginWithGitHub,
		handleCallback,
		// Auth URL state
		authUrlData,
		isAuthUrlLoading,
		isAuthUrlError,
		authUrlError,
		// Callback state
		isCallbackLoading,
		isCallbackError,
		callbackError,
	};
};
