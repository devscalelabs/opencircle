import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "../../../utils/api";

export const useGoogleAuth = () => {
	const navigate = useNavigate();

	const {
		data: authUrlData,
		refetch: getAuthUrl,
		isPending: isAuthUrlLoading,
		isError: isAuthUrlError,
		error: authUrlError,
	} = useQuery({
		queryKey: ["google-auth-url"],
		queryFn: async () => {
			const res = await api.auth.googleLogin();
			return res;
		},
		enabled: false, // Don't run automatically
	});

	const {
		mutate: handleGoogleCallback,
		isPending: isCallbackLoading,
		isError: isCallbackError,
		error: callbackError,
	} = useMutation({
		mutationKey: ["google-callback"],
		mutationFn: async (code: string) => {
			const res = await api.auth.googleCallback({ code });
			return res;
		},
		onSuccess: (data) => {
			localStorage.setItem("token", data.access_token);
			toast.success("Successfully logged in with Google!");
			navigate({ to: "/" });
		},
		onError: (error) => {
			if (error instanceof HTTPError && error.response.status === 400) {
				toast.error("Google authentication failed. Please try again.");
			} else {
				toast.error("An error occurred during Google login.");
			}
		},
	});

	const loginWithGoogle = useCallback(() => {
		getAuthUrl()
			.then((result) => {
				if (result.data?.authorization_url) {
					// Redirect to Google for authentication
					window.location.href = result.data.authorization_url;
				}
			})
			.catch(() => {
				toast.error("Failed to initiate Google login");
			});
	}, [getAuthUrl]);

	// Handle Google callback (call this from your callback page/component)
	const handleCallback = useCallback(
		(code: string) => {
			handleGoogleCallback(code);
		},
		[handleGoogleCallback],
	);

	return {
		// Methods
		loginWithGoogle,
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
