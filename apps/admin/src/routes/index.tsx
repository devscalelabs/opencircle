import { Button, Input } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { METADATA } from "../constants/metadata";
import { useAppSettings } from "../features/appSettings/hooks/useAppSettings";
import { useLogin } from "../features/auth/hooks/useLogin";
import { useRegister } from "../features/auth/hooks/useRegister";

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
	const { installationStatus, isInstallationLoading } = useAppSettings();
	const { username, setUsername, password, setPassword, login } = useLogin();
	const {
		name,
		setName,
		username: regUsername,
		setUsername: setRegUsername,
		email,
		setEmail,
		password: regPassword,
		setPassword: setRegPassword,
		register,
		validationErrors,
	} = useRegister();

	const showRegisterForm = !installationStatus?.is_installed;

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (showRegisterForm) {
			register();
		} else {
			login();
		}
	};

	if (isInstallationLoading) {
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
							<p className="text-foreground/50">Loading...</p>
						</div>
					</section>
				</div>
			</main>
		);
	}

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
						{showRegisterForm ? (
							<>
								<h1 className="font-medium text-2xl">Setup Admin Account</h1>
								<p className="text-foreground/50">
									Create your admin account to get started
								</p>
								<p className="font-medium text-amber-600 text-sm dark:text-amber-400">
									⚠️ This registration form appears only once - save your
									credentials!
								</p>
							</>
						) : (
							<p className="text-foreground/50">Sign in to Admin account</p>
						)}
					</div>
				</section>
				<form
					onSubmit={handleFormSubmit}
					className="space-y-6 rounded-xl border border-border p-8 shadow-2xl"
				>
					<section className="space-y-3">
						{showRegisterForm ? (
							<>
								<section className="space-y-2">
									<Input
										placeholder="Full Name"
										value={name}
										onChange={(v) => setName(v.target.value)}
									/>
									{validationErrors.name && (
										<p className="text-red-500 text-xs">
											{validationErrors.name}
										</p>
									)}
								</section>
								<section className="space-y-2">
									<Input
										placeholder="Username"
										value={regUsername}
										onChange={(v) =>
											setRegUsername(
												v.target.value.toLowerCase().replace(/\s/g, ""),
											)
										}
									/>
									{validationErrors.username && (
										<p className="text-red-500 text-xs">
											{validationErrors.username}
										</p>
									)}
								</section>
								<section className="space-y-2">
									<Input
										placeholder="Email"
										type="email"
										value={email}
										onChange={(v) => setEmail(v.target.value)}
									/>
									{validationErrors.email && (
										<p className="text-red-500 text-xs">
											{validationErrors.email}
										</p>
									)}
								</section>
								<section className="space-y-2">
									<Input
										placeholder="Password"
										type="password"
										value={regPassword}
										onChange={(v) => setRegPassword(v.target.value)}
									/>
									{validationErrors.password && (
										<p className="text-red-500 text-xs">
											{validationErrors.password}
										</p>
									)}
								</section>
								<Button type="submit" radius="xl" className="mt-2 w-full">
									Create Admin Account
								</Button>
							</>
						) : (
							<>
								<section className="space-y-2">
									<Input
										placeholder="Username"
										value={username}
										onChange={(v) => setUsername(v.target.value)}
									/>
								</section>
								<section className="space-y-2">
									<Input
										placeholder="Password"
										type="password"
										value={password}
										onChange={(v) => setPassword(v.target.value)}
									/>
								</section>
								<Button type="submit" radius="xl" className="mt-2 w-full">
									Login
								</Button>
							</>
						)}
					</section>
				</form>
			</div>
		</main>
	);
}
