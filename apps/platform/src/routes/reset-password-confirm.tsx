import { Button, Input } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useId } from "react";
import { Brand } from "../components/brand";
import { METADATA } from "../constants/metadata";
import { useConfirmResetPassword } from "../features/auth/hooks/useConfirmResetPassword";

export const Route = createFileRoute("/reset-password-confirm")({
	head: () => ({
		meta: [
			{
				title: "Confirm Reset Password - OpenCircle",
			},
			{
				name: "description",
				content: "Enter your reset code to reset your OpenCircle password",
			},
			{
				property: "og:title",
				content: "Confirm Reset Password - OpenCircle",
			},
			{
				property: "og:description",
				content: "Enter your reset code to reset your OpenCircle password",
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
	const codeId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();

	const {
		code,
		setCode,
		newPassword,
		setNewPassword,
		confirmPassword,
		setConfirmPassword,
		confirmResetPassword,
		isPending,
		validationErrors,
	} = useConfirmResetPassword();

	return (
		<main className="m-auto max-w-sm">
			<div className="flex h-screen flex-col justify-center gap-10">
				<section className="space-y-8 text-center">
					<Brand as="section" className="ml-2 justify-center" />
					<div className="space-y-2">
						<h1 className="font-medium text-2xl">Reset Password</h1>
						<p className="text-foreground/50">
							Enter the 6-letter code from your email and your new password
						</p>
						<p className="text-foreground/30 text-xs">
							⚠️ Codes expire in 1 hour and can only be used once
						</p>
					</div>
				</section>
				<div className="space-y-6 rounded-xl border border-border p-8 shadow-2xl">
					<section className="space-y-3">
						<section className="space-y-2">
							<Input
								id={codeId}
								placeholder="Reset Code (6 letters)"
								type="text"
								value={code}
								onChange={(v) => setCode(v.target.value.toUpperCase())}
								className={validationErrors.code ? "border-red-500" : ""}
								maxLength={6}
							/>
							{validationErrors.code && (
								<p className="text-red-500 text-xs">{validationErrors.code}</p>
							)}
						</section>
						<section className="space-y-2">
							<Input
								id={passwordId}
								placeholder="New Password"
								type="password"
								value={newPassword}
								onChange={(v) => setNewPassword(v.target.value)}
								className={validationErrors.newPassword ? "border-red-500" : ""}
							/>
							{validationErrors.newPassword && (
								<p className="text-red-500 text-xs">
									{validationErrors.newPassword}
								</p>
							)}
						</section>
						<section className="space-y-2">
							<Input
								id={confirmPasswordId}
								placeholder="Confirm New Password"
								type="password"
								value={confirmPassword}
								onChange={(v) => setConfirmPassword(v.target.value)}
								className={
									validationErrors.confirmPassword ? "border-red-500" : ""
								}
							/>
							{validationErrors.confirmPassword && (
								<p className="text-red-500 text-xs">
									{validationErrors.confirmPassword}
								</p>
							)}
						</section>
						<Button
							radius="xl"
							className="mt-2 w-full"
							onClick={() => confirmResetPassword()}
							disabled={isPending}
						>
							{isPending ? "Resetting..." : "Reset Password"}
						</Button>
					</section>
					<section className="h-0.25 bg-foreground/10" />
					<section className="px-4 text-center">
						<p className="text-sm">
							Didn't receive a code?{" "}
							<Link to="/reset-password" className="font-medium text-primary">
								Try Again
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
