import { Button, Input } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { useId } from "react";
import { useGitHubAuth } from "../features/auth/hooks/useGitHubAuth";
import { useRegister } from "../features/auth/hooks/useRegister";

export const Route = createFileRoute("/register")({
	component: RouteComponent,
});

function RouteComponent() {
	const nameId = useId();
	const usernameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const inviteCodeId = useId();

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
	} = useRegister();
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
						<h1 className="font-medium text-2xl">Join OpenCircle</h1>
						<p className="text-foreground/50">Create your account</p>
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
								id={nameId}
								placeholder="Fullname"
								value={name}
								onChange={(v) => setName(v.target.value)}
							/>
						</section>
						<section className="space-y-2">
							<Input
								id={emailId}
								placeholder="Email"
								type="email"
								value={email}
								onChange={(v) => setEmail(v.target.value)}
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
						<section className="space-y-2">
							<Input
								id={inviteCodeId}
								placeholder="Enter invite code (Optional)"
								value={inviteCode}
								onChange={(v) => setInviteCode(v.target.value)}
							/>
						</section>
						<Button
							radius="xl"
							className="mt-2 w-full"
							onClick={() => register()}
						>
							Register
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
