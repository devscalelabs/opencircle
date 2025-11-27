import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { api, setTokens } from "../../../utils/api";

export const loginSchema = z.object({
	username: z
		.string()
		.min(1, "Username is required")
		.refine((val) => val === val.toLowerCase(), "Username must be lowercase")
		.refine((val) => !/\s/.test(val), "Username cannot contain spaces"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const useLogin = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	const {
		mutate: login,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationKey: ["login"],
		mutationFn: async () => {
			const result = loginSchema.safeParse({ username, password });
			if (!result.success) {
				const errors: Record<string, string> = {};
				result.error.issues.forEach((issue) => {
					const field = issue.path[0] as string;
					errors[field] = issue.message;
				});
				setValidationErrors(errors);
				throw new Error("Validation failed");
			}
			setValidationErrors({});
			const res = await api.auth.login({ username, password });
			return res;
		},
		onSuccess: (data) => {
			setTokens(data.access_token, data.refresh_token);
			navigate({ to: "/" });
		},
		onError: async (error) => {
			if (error instanceof HTTPError) {
				if (error.response.status === 403) {
					toast.error("Your account has been banned. Please contact support.");
				} else if (error.response.status === 401) {
					toast.error("Invalid username or password");
				} else {
					toast.error("An error occurred during login. Please try again.");
				}
			}
		},
	});

	return {
		username,
		setUsername,
		password,
		setPassword,
		login,
		isPending,
		isError,
		error,
		validationErrors,
	};
};
