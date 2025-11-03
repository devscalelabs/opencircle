import { Button, Input } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { useId } from "react";
import { useGitHubAuth } from "../features/auth/hooks/useGitHubAuth";
import { useLogin } from "../features/auth/hooks/useLogin";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const usernameId = useId();
	const passwordId = useId();

	const { username, setUsername, password, setPassword, login } = useLogin();
	const { loginWithGitHub, isCallbackLoading } = useGitHubAuth();

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
								onChange={(v) => setUsername(v.target.value)}
							/>
						</section>
						<section className="space-y-2">
							<Input
								id={passwordId}
								placeholder="Password"
								type="password"
								value={password}
								onChange={(v) => setPassword(v.target.value)}
							/>
						</section>
						<Button radius="xl" className="mt-2 w-full" onClick={() => login()}>
							Login
						</Button>
					</section>
					<section className="h-0.25 bg-foreground/10" />
					<section className="space-y-4">
						<Button
							radius="xl"
							variant="secondary"
							className="w-full"
							onClick={loginWithGitHub}
							disabled={isCallbackLoading}
						>
							{isCallbackLoading ? "Loading..." : "Continue with Github"}
						</Button>
					</section>
				</div>
				<div className="text-balance rounded-lg border border-border bg-linear-210 from-primary to-transparent p-4 text-center font-medium text-xs tracking-tight">
					Opensource Community Platform for Creators built by Devscalelabs
				</div>
			</div>
		</main>
	);
}
