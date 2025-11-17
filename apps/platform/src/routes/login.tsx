import { Button, Input } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { useId } from "react";
import { METADATA } from "../constants/metadata";
import { useAppSettings } from "../features/appSettings/hooks/useAppSettings";
import { useGitHubAuth } from "../features/auth/hooks/useGitHubAuth";
import { useGoogleAuth } from "../features/auth/hooks/useGoogleAuth";
import { useLogin } from "../features/auth/hooks/useLogin";

export const Route = createFileRoute("/login")({
	head: () => ({
		meta: [
			{
				title: "Login - OpenCircle",
			},
			{
				name: "description",
				content: "Sign in to OpenCircle and join the community",
			},
			{
				property: "og:title",
				content: "Login - OpenCircle",
			},
			{
				property: "og:description",
				content: "Sign in to OpenCircle and join the community",
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
	const usernameId = useId();
	const passwordId = useId();

	const {
		username,
		setUsername,
		password,
		setPassword,
		login,
		validationErrors,
	} = useLogin();
	const { loginWithGitHub, isCallbackLoading } = useGitHubAuth();
	const { loginWithGoogle, isCallbackLoading: isGoogleCallbackLoading } =
		useGoogleAuth();

	const { appSettings } = useAppSettings();

	return (
		<main className="m-auto max-w-sm">
			<div className="flex h-screen flex-col justify-center gap-10">
				<section className="space-y-8 text-center">
					<section className="ml-2 flex items-center justify-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-background">
							<Zap size={12} fill="currentColor" />
						</div>
						<h2 className="font-medium">Opencircle</h2>
					</section>
					<div className="space-y-2">
						<h1 className="font-medium text-2xl">Welcome to OpenCircle</h1>
						<p className="text-foreground/50">Sign in to your account</p>
					</div>
				</section>
				<div className="space-y-6 rounded-xl border border-border p-8 shadow-2xl">
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
							/>
							{validationErrors.username && (
								<p className="text-red-500 text-xs">
									{validationErrors.username}
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
							/>
							{validationErrors.password && (
								<p className="text-red-500 text-xs">
									{validationErrors.password}
								</p>
							)}
						</section>
						<section className="px-4 text-center">
							<Link to="/reset-password" className="font-medium text-primary">
								Forgot password?
							</Link>
						</section>
						<Button radius="xl" className="mt-2 w-full" onClick={() => login()}>
							Login
						</Button>
					</section>
					<section className="h-0.25 bg-foreground/10" />
					<section className="space-y-4">
						{appSettings?.oauth_github_enabled && (
							<Button
								radius="xl"
								variant="secondary"
								className="w-full"
								onClick={loginWithGitHub}
								disabled={isCallbackLoading}
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
								disabled={isGoogleCallbackLoading}
							>
								{isGoogleCallbackLoading
									? "Loading..."
									: "Continue with Google"}
							</Button>
						)}
						<section className="px-4 text-center">
							<p className="text-sm">
								Don't have an account?{" "}
								<Link to="/register" className="font-medium text-primary">
									Register
								</Link>
							</p>
						</section>
					</section>
				</div>
				<div className="text-balance rounded-lg border border-border bg-linear-210 from-primary to-transparent p-4 text-center font-medium text-xs tracking-tight">
					Opensource Community Platform for Creators built by Devscalelabs
				</div>
			</div>
		</main>
	);
}
