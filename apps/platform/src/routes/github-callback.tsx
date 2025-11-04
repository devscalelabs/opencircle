import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { METADATA } from "../constants/metadata";
import { useGitHubAuth } from "../features/auth/hooks/useGitHubAuth";

export const Route = createFileRoute("/github-callback")({
	head: () => ({
		meta: [
			{
				title: "GitHub Callback - OpenCircle",
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
	const navigate = useNavigate();
	const { handleCallback } = useGitHubAuth();
	const hasProcessedCallback = useRef(false);

	useEffect(() => {
		// Prevent multiple executions (OAuth codes are single-use)
		if (hasProcessedCallback.current) {
			return;
		}

		// Extract code from URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const error = urlParams.get("error");
		const errorDescription = urlParams.get("error_description");

		if (error) {
			toast.error(`GitHub authentication failed: ${errorDescription || error}`);
			navigate({ to: "/login" });
			return;
		}

		if (!code) {
			toast.error("No authorization code received from GitHub");
			navigate({ to: "/login" });
			return;
		}

		// Mark as processed before making the request
		hasProcessedCallback.current = true;

		// Handle the GitHub callback
		handleCallback(code);
	}, [handleCallback, navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="space-y-4 text-center">
				<div className="mx-auto h-12 w-12 animate-spin rounded-full border-primary border-b-2"></div>
				<p className="text-foreground/70">Completing GitHub login...</p>
			</div>
		</div>
	);
}
