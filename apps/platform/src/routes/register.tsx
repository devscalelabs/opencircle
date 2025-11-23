import { Button, Input } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Brand } from "../components/brand";
import { METADATA } from "../constants/metadata";
import { useAppSettings } from "../features/appSettings/hooks/useAppSettings";
import { useEmailVerification } from "../features/auth/hooks/useEmailVerification";
import { useGitHubAuth } from "../features/auth/hooks/useGitHubAuth";
import { useGoogleAuth } from "../features/auth/hooks/useGoogleAuth";
import { useRegister } from "../features/auth/hooks/useRegister";

export const Route = createFileRoute("/register")({
	head: () => ({
		meta: [
			{
				title: "Register - OpenCircle",
			},
			{
				name: "description",
				content: "Create an account and join the OpenCircle community",
			},
			{
				property: "og:title",
				content: "Register - OpenCircle",
			},
			{
				property: "og:description",
				content: "Create an account and join the OpenCircle community",
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
	const nameId = useId();
	const usernameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const inviteCodeId = useId();

	const [showVerification, setShowVerification] = useState(false);
	const [verificationCode, setVerificationCode] = useState("");
	const { verifyEmail, isPending: isVerificationPending } =
		useEmailVerification();

	const {
		name,
		setName,
		username,
		setUsername,
		email,
		setEmail,
		password,
		setPassword,
		inviteCode,
		setInviteCode,
		register,
		validationErrors,
	} = useRegister();
	const { loginWithGitHub, isCallbackLoading } = useGitHubAuth();
	const { loginWithGoogle, isCallbackLoading: isGoogleCallbackLoading } =
		useGoogleAuth();
	const { appSettings, isAppSettingsLoading } = useAppSettings();

	const isRegistrationEnabled = appSettings?.enable_sign_up ?? true;

	const handleVerifyEmail = () => {
		verifyEmail(verificationCode);
	};

	return (
		<main className="m-auto max-w-sm">
			<div className="flex h-screen flex-col justify-center gap-10">
				<section className="space-y-8 text-center">
					<Brand as="section" className="ml-2 justify-center" />
					<div className="space-y-2">
						{showVerification ? (
							<>
								<h1 className="font-medium text-2xl">Verify Your Email</h1>
								<p className="text-foreground/50">Enter the 6-digit code</p>
							</>
						) : (
							<>
								<h1 className="font-medium text-2xl">Join OpenCircle</h1>
								<p className="text-foreground/50">Create your account</p>
							</>
						)}
					</div>
				</section>
				{!isRegistrationEnabled && !isAppSettingsLoading && (
					<div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-6 text-center">
						<p className="font-medium text-yellow-600 dark:text-yellow-400">
							Registration is currently disabled
						</p>
						<p className="mt-2 text-balance text-foreground/70 text-sm">
							Please contact the administrator for more information.
						</p>
					</div>
				)}
				<div className="space-y-6 rounded-xl border border-border p-8 shadow-2xl">
					{showVerification ? (
						<section className="space-y-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<Input
										placeholder="Enter verification code"
										value={verificationCode}
										onChange={(v) =>
											setVerificationCode(v.target.value.toUpperCase())
										}
										maxLength={6}
										className="text-center text-lg tracking-widest"
									/>
								</div>
								<Button
									radius="xl"
									className="w-full"
									onClick={handleVerifyEmail}
									disabled={
										!verificationCode ||
										verificationCode.length !== 6 ||
										isVerificationPending
									}
								>
									{isVerificationPending ? "Verifying..." : "Verify Email"}
								</Button>
							</div>
							<p className="text-center text-foreground/50 text-xs">
								Didn't receive the code? Check your spam folder.
							</p>
						</section>
					) : (
						<section className="space-y-3">
							<section className="space-y-2">
								<Input
									id={usernameId}
									placeholder="Username"
									value={username}
									onChange={(v) =>
										setUsername(v.target.value.toLowerCase().replace(/\s/g, ""))
									}
									className={validationErrors.username ? "border-red-500" : ""}
									disabled={!isRegistrationEnabled}
								/>
								{validationErrors.username && (
									<p className="text-red-500 text-xs">
										{validationErrors.username}
									</p>
								)}
							</section>
							<section className="space-y-2">
								<Input
									id={nameId}
									placeholder="Fullname"
									value={name}
									onChange={(v) => setName(v.target.value)}
									className={validationErrors.name ? "border-red-500" : ""}
									disabled={!isRegistrationEnabled}
								/>
								{validationErrors.name && (
									<p className="text-red-500 text-xs">
										{validationErrors.name}
									</p>
								)}
							</section>
							<section className="space-y-2">
								<Input
									id={emailId}
									placeholder="Email"
									type="email"
									value={email}
									onChange={(v) => setEmail(v.target.value)}
									className={validationErrors.email ? "border-red-500" : ""}
									disabled={!isRegistrationEnabled}
								/>
								{validationErrors.email && (
									<p className="text-red-500 text-xs">
										{validationErrors.email}
									</p>
								)}
							</section>
							<section className="space-y-2">
								<Input
									id={passwordId}
									placeholder="Password"
									type="password"
									value={password}
									onChange={(v) => setPassword(v.target.value)}
									className={validationErrors.password ? "border-red-500" : ""}
									disabled={!isRegistrationEnabled}
								/>
								{validationErrors.password && (
									<p className="text-red-500 text-xs">
										{validationErrors.password}
									</p>
								)}
							</section>
							<section className="space-y-2">
								<Input
									id={inviteCodeId}
									placeholder="Enter invite code (Optional)"
									value={inviteCode}
									onChange={(v) => setInviteCode(v.target.value)}
									className={
										validationErrors.inviteCode ? "border-red-500" : ""
									}
									disabled={!isRegistrationEnabled}
								/>
								{validationErrors.inviteCode && (
									<p className="text-red-500 text-xs">
										{validationErrors.inviteCode}
									</p>
								)}
							</section>
							<Button
								radius="xl"
								className="mt-2 w-full"
								onClick={() => {
									register(undefined, {
										onSuccess: () => {
											setShowVerification(true);
										},
									});
								}}
								disabled={!isRegistrationEnabled}
							>
								Register
							</Button>
						</section>
					)}
					{!showVerification && (
						<>
							<section className="h-0.25 bg-foreground/10" />
							<section className="space-y-4">
								{appSettings?.oauth_github_enabled && (
									<Button
										radius="xl"
										variant="secondary"
										className="w-full"
										onClick={loginWithGitHub}
										disabled={isCallbackLoading || !isRegistrationEnabled}
									>
										{isCallbackLoading ? "Loading..." : "Continue with Github"}
									</Button>
								)}
								{appSettings?.oauth_google_enabled && (
									<Button
										radius="xl"
										variant="secondary"
										className="w-full"
										onClick={loginWithGoogle}
										disabled={isGoogleCallbackLoading || !isRegistrationEnabled}
									>
										{isGoogleCallbackLoading
											? "Loading..."
											: "Continue with Google"}
									</Button>
								)}
							</section>
						</>
					)}
					{!showVerification && (
						<section className="px-4 text-center">
							<p className="text-sm">
								Have an account?{" "}
								<Link to="/login" className="font-medium text-primary">
									Login
								</Link>
							</p>
						</section>
					)}
				</div>
				{!showVerification && (
					<div className="text-balance rounded-lg border border-border bg-linear-210 from-primary to-transparent p-4 text-center font-medium text-xs tracking-tight">
						Opensource Community Platform for Creators built by Devscalelabs
					</div>
				)}
			</div>
		</main>
	);
}
