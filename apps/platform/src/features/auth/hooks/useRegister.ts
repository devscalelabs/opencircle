import { useMutation } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "../../../utils/api";

export const registerSchema = z.object({
	name: z
		.string()
		.min(1, "Full name is required")
		.min(2, "Full name must be at least 2 characters"),
	username: z
		.string()
		.min(1, "Username is required")
		.refine((val) => val === val.toLowerCase(), "Username must be lowercase")
		.refine((val) => !/\s/.test(val), "Username cannot contain spaces"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
	email: z
		.string()
		.min(1, "Email is required")
		.refine(
			(val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
			"Invalid email format",
		),
	inviteCode: z.string().optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const useRegister = () => {
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [inviteCode, setInviteCode] = useState("");
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	const {
		mutate: register,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationKey: ["register"],
		mutationFn: async () => {
			const result = registerSchema.safeParse({
				name,
				username,
				password,
				email,
				inviteCode,
			});
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
			const res = await api.auth.register({
				name,
				username,
				password,
				email,
				invite_code: inviteCode || undefined,
			});
			return res;
		},
		onSuccess: () => {
			toast.success("Registration successful! Please verify your email.");
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
				toast.error("Registration failed");
			}
		},
	});

	return {
		name,
		setName,
		username,
		setUsername,
		password,
		setPassword,
		email,
		setEmail,
		inviteCode,
		setInviteCode,
		register,
		isPending,
		isError,
		error,
		validationErrors,
	};
};
