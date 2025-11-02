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
		<main className="max-w-sm m-auto">
			<div className="flex flex-col gap-10 h-screen justify-center">
				<section className="text-center space-y-8">
					<section className="flex gap-2 justify-center items-center ml-2">
						<div className="w-6 h-6 bg-foreground text-background rounded-lg flex justify-center items-center">
							<Zap size={12} fill="currentColor" />
						</div>
						<h2 className="font-medium">Opencircle</h2>
					</section>
					<div className="space-y-2">
						<h1 className="text-2xl font-medium">Join OpenCircle</h1>
						<p className="text-foreground/50">Create your account</p>
					</div>
				</section>
				<div className="space-y-6 border-border border p-8 rounded-xl shadow-2xl">
					<section className="space-y-3">
						<section className="space-y-2">
							<label
								htmlFor={usernameId}
								className="text-sm block ml-1 text-foreground/70"
							>
								Username
							</label>
							<Input
								id={usernameId}
								placeholder="Username"
								value={username}
								onChange={(v) => setUsername(v.target.value)}
							/>
						</section>
						<section className="space-y-2">
							<label
								htmlFor={nameId}
								className="text-sm block ml-1 text-foreground/70"
							>
								Fullname
							</label>
							<Input
								id={nameId}
								placeholder="Fullname"
								value={name}
								onChange={(v) => setName(v.target.value)}
							/>
						</section>
						<section className="space-y-2">
							<label
								htmlFor={emailId}
								className="text-sm block ml-1 text-foreground/70"
							>
								Email
							</label>
							<Input
								id={emailId}
								placeholder="Email"
								type="email"
								value={email}
								onChange={(v) => setEmail(v.target.value)}
							/>
						</section>
						<section className="space-y-2">
							<label
								htmlFor={passwordId}
								className="text-sm block ml-1 text-foreground/70"
							>
								Password
							</label>
							<Input
								id={passwordId}
								placeholder="Password"
								type="password"
								value={password}
								onChange={(v) => setPassword(v.target.value)}
							/>
						</section>
						<section className="space-y-2">
							<label
								htmlFor={inviteCodeId}
								className="text-sm block ml-1 text-foreground/70"
							>
								Invite Code (Optional)
							</label>
							<Input
								id={inviteCodeId}
								placeholder="Enter invite code"
								value={inviteCode}
								onChange={(v) => setInviteCode(v.target.value)}
							/>
						</section>
						<Button
							radius="xl"
							className="w-full mt-2"
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
				<div className="text-balance text-center bg-linear-210 rounded-lg border border-border tracking-tight p-4 text-xs font-medium from-primary to-transparent">
					Opensource Community Platform for Creators built by Devscalelabs
				</div>
			</div>
		</main>
	);
}
