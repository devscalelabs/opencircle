import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../utils/api";

export const useEmailVerification = () => {
	const navigate = useNavigate();
	const [verificationCode, setVerificationCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	const {
		mutate: verifyEmail,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationKey: ["verifyEmail"],
		mutationFn: async (code: string) => {
			const res = await api.auth.verifyEmail({ code: code.toUpperCase() });
			return res;
		},
		onSuccess: () => {
			toast.success("Email verified successfully! Redirecting to login...");
			setIsVerifying(false);
			navigate({ to: "/login" });
		},
		onError: async (error) => {
			if (error instanceof HTTPError) {
				try {
					const errorData = (await error.response.json()) as {
						detail?: string;
					};
					if (errorData.detail) {
						toast.error(errorData.detail);
						return;
					}
				} catch {
					// Continue to default error message
				}
				toast.error("Email verification failed");
			}
		},
	});

	const handleVerify = (code: string) => {
		if (!code || code.length !== 6) {
			toast.error("Please enter a valid 6-digit verification code");
			return;
		}
		verifyEmail(code);
	};

	return {
		verificationCode,
		setVerificationCode,
		isVerifying,
		setIsVerifying,
		verifyEmail: handleVerify,
		isPending,
		isError,
		error,
	};
};
