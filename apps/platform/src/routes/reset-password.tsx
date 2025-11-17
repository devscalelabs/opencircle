import { Button, Input } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useId } from "react";
import { Brand } from "../components/brand";
import { METADATA } from "../constants/metadata";

import { useResetPassword } from "../features/auth/hooks/useResetPassword";

export const Route = createFileRoute("/reset-password")({
	head: () => ({
		meta: [
			{
				title: "Reset Password - OpenCircle",
			},
			{
				name: "description",
				content: "Reset your OpenCircle password",
			},
			{
				property: "og:title",
				content: "Reset Password - OpenCircle",
			},
			{
				property: "og:description",
				content: "Reset your OpenCircle password",
			},
			{
				property: "og:image",
				content: METADATA.ogImage,
			},
		],
		links: [
			{
				rel: "icon",
				href: METADATA.favicon,
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const emailId = useId();

	const { email, setEmail, resetPassword, isPending, validationErrors } =
		useResetPassword();

	return (
		<main className="m-auto max-w-sm">
			<div className="flex h-screen flex-col justify-center gap-10">
				<section className="space-y-8 text-center">
					<Brand as="section" className="ml-2 justify-center" />
					<div className="space-y-2">
						<h1 className="font-medium text-2xl">Reset Password</h1>
						<p className="text-foreground/50">
							Enter your email to receive a password reset link
						</p>
					</div>
				</section>
				<div className="space-y-6 rounded-xl border border-border p-8 shadow-2xl">
					<section className="space-y-3">
						<section className="space-y-2">
							<Input
								id={emailId}
								placeholder="Email"
								type="email"
								value={email}
								onChange={(v) => setEmail(v.target.value)}
								className={validationErrors.email ? "border-red-500" : ""}
							/>
							{validationErrors.email && (
								<p className="text-red-500 text-xs">{validationErrors.email}</p>
							)}
						</section>
						<Button
							radius="xl"
							className="mt-2 w-full"
							onClick={() => resetPassword()}
							disabled={isPending}
						>
							{isPending ? "Sending..." : "Send Reset Email"}
						</Button>
					</section>
					<section className="h-0.25 bg-foreground/10" />
					<section className="px-4 text-center">
						<p className="text-sm">
							Remember your password?{" "}
							<Link to="/login" className="font-medium text-primary">
								Back to Login
							</Link>
						</p>
					</section>
				</div>
				<div className="text-balance rounded-lg border border-border bg-linear-210 from-primary to-transparent p-4 text-center font-medium text-xs tracking-tight">
					Opensource Community Platform for Creators built by Devscalelabs
				</div>
			</div>
		</main>
	);
}
