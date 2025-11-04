import { Button, Input } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { useId } from "react";
import { METADATA } from "../constants/metadata";
import { useLogin } from "../features/auth/hooks/useLogin";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title: "Admin Login - OpenCircle",
			},
			{
				name: "description",
				content: "Sign in to OpenCircle Admin Dashboard",
			},
			{
				property: "og:title",
				content: "Admin Login - OpenCircle",
			},
			{
				property: "og:description",
				content: "Sign in to OpenCircle Admin Dashboard",
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

	const { username, setUsername, password, setPassword, login } = useLogin();

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
						<p className="text-foreground/50">Sign in to Admin account</p>
					</div>
				</section>
				<div className="space-y-6 rounded-xl border border-border p-8 shadow-2xl">
					<section className="space-y-3">
						<section className="space-y-2">
							<label
								htmlFor={usernameId}
								className="ml-1 block text-foreground/70 text-sm"
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
								htmlFor={passwordId}
								className="ml-1 block text-foreground/70 text-sm"
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
						<Button radius="xl" className="mt-2 w-full" onClick={() => login()}>
							Login
						</Button>
					</section>
				</div>
			</div>
		</main>
	);
}
