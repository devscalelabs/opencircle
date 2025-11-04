import { Avatar } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useId } from "react";
import { Header } from "../../components/header";
import { METADATA } from "../../constants/metadata";
import { usePosts } from "../../features/posts/hooks/usePosts";
import { UserTabs } from "../../features/user/components/userTabs";
import { useUser } from "../../features/user/hooks/useUser";
import { getInitials } from "../../utils/common";

export const Route = createFileRoute("/_socialLayout/$username")({
	head: (): {
		meta: Array<Record<string, any>>;
		links: Array<Record<string, any>>;
	} => {
		const username = Route.useParams().username;
		return {
			meta: [
				{
					title: `${username} - OpenCircle`,
				},
				{
					name: "description",
					content: `View ${username}'s profile on OpenCircle`,
				},
				{
					property: "og:title",
					content: `${username} - OpenCircle`,
				},
				{
					property: "og:description",
					content: `View ${username}'s profile on OpenCircle`,
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
		};
	},
	component: UserDetail,
});

function UserDetail() {
	const username = Route.useParams().username;
	const { user } = useUser(username);
	const { posts } = usePosts({ userId: user?.id });
	const gradientId = useId();

	if (!user) {
		return <div>User not found</div>;
	}

	const initials = getInitials(user.name);

	return (
		<main>
			<Header label="Back" />
			<section className="flex flex-col items-center space-y-4 py-12">
				<Avatar
					size="xl"
					initials={initials}
					image_url={user.avatar_url || ""}
				/>
				<main className="flex flex-col items-center gap-4">
					<div className="space-y-2 text-center">
						<div className="flex items-center justify-center gap-1 text-xl">
							<div>{user.name}</div>
							{user.role === "admin" && (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1.1em"
									height="1.1em"
									viewBox="0 0 24 24"
									className="mt-1"
								>
									<title>verified</title>
									<defs>
										<linearGradient
											id={gradientId}
											x1="0%"
											y1="0%"
											x2="100%"
											y2="0%"
										>
											<stop offset="0%" stopColor="rgb(234 125 8)" />
											<stop offset="100%" stopColor="rgb(234 179 8)" />
										</linearGradient>
									</defs>
									<path
										fill={`url(#${gradientId})`}
										d="m8.6 22.5l-1.9-3.2l-3.6-.8l.35-3.7L1 12l2.45-2.8l-.35-3.7l3.6-.8l1.9-3.2L12 2.95l3.4-1.45l1.9 3.2l3.6.8l-.35 3.7L23 12l-2.45 2.8l.35 3.7l-3.6.8l-1.9 3.2l-3.4-1.45zm2.35-6.95L16.6 9.9l-1.4-1.45l-4.25 4.25l-2.15-2.1L7.4 12z"
									/>
								</svg>
							)}
						</div>
						<div className="font-medium text-foreground/50 text-xs">
							{user.email}
						</div>
					</div>
					<div>{user.bio}</div>
				</main>
				<div className="flex items-center gap-4">
					{user.user_social?.twitter_url && (
						<a
							href={user.user_social.twitter_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground/70 transition-colors hover:text-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24"
							>
								<title>X Twitter</title>
								<g fill="currentColor">
									<path d="M1 2h2.5L3.5 2h-2.5zM5.5 2h2.5L7.2 2h-2.5z">
										<animate
											fill="freeze"
											attributeName="d"
											dur="0.4s"
											values="M1 2h2.5L3.5 2h-2.5zM5.5 2h2.5L7.2 2h-2.5z;M1 2h2.5L18.5 22h-2.5zM5.5 2h2.5L23 22h-2.5z"
										/>
									</path>
									<path d="M3 2h5v0h-5zM16 22h5v0h-5z">
										<animate
											fill="freeze"
											attributeName="d"
											begin="0.4s"
											dur="0.4s"
											values="M3 2h5v0h-5zM16 22h5v0h-5z;M3 2h5v2h-5zM16 22h5v-2h-5z"
										/>
									</path>
									<path d="M18.5 2h3.5L22 2h-3.5z">
										<animate
											fill="freeze"
											attributeName="d"
											begin="0.5s"
											dur="0.4s"
											values="M18.5 2h3.5L22 2h-3.5z;M18.5 2h3.5L5 22h-3.5z"
										/>
									</path>
								</g>
							</svg>
						</a>
					)}
					{user.user_social?.linkedin_url && (
						<a
							href={user.user_social.linkedin_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground/70 transition-colors hover:text-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24"
							>
								<title>Linkedin</title>
								<g
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
								>
									<path d="M21 8v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5M7 17v-7" />
									<path d="M11 17v-3.25M11 10v3.75m0 0c0-3.75 6-3.75 6 0V17M7 7.01l.01-.011" />
								</g>
							</svg>
						</a>
					)}
					{user.user_social?.github_url && (
						<a
							href={user.user_social.github_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground/70 transition-colors hover:text-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24"
							>
								<title>Github</title>
								<g
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								>
									<path
										stroke-dasharray="32"
										stroke-dashoffset="32"
										d="M12 4c1.67 0 2.61 0.4 3 0.5c0.53 -0.43 1.94 -1.5 3.5 -1.5c0.34 1 0.29 2.22 0 3c0.75 1 1 2 1 3.5c0 2.19 -0.48 3.58 -1.5 4.5c-1.02 0.92 -2.11 1.37 -3.5 1.5c0.65 0.54 0.5 1.87 0.5 2.5c0 0.73 0 3 0 3M12 4c-1.67 0 -2.61 0.4 -3 0.5c-0.53 -0.43 -1.94 -1.5 -3.5 -1.5c-0.34 1 -0.29 2.22 0 3c-0.75 1 -1 2 -1 3.5c0 2.19 0.48 3.58 1.5 4.5c1.02 0.92 2.11 1.37 3.5 1.5c-0.65 0.54 -0.5 1.87 -0.5 2.5c0 0.73 0 3 0 3"
									>
										<animate
											fill="freeze"
											attributeName="stroke-dashoffset"
											dur="0.7s"
											values="32;0"
										/>
									</path>
									<path
										stroke-dasharray="10"
										stroke-dashoffset="10"
										d="M9 19c-1.41 0 -2.84 -0.56 -3.69 -1.19c-0.84 -0.63 -1.09 -1.66 -2.31 -2.31"
									>
										<animate
											fill="freeze"
											attributeName="stroke-dashoffset"
											begin="0.8s"
											dur="0.2s"
											values="10;0"
										/>
									</path>
								</g>
							</svg>
						</a>
					)}
					{user.user_social?.website_url && (
						<a
							href={user.user_social.website_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground/70 transition-colors hover:text-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24"
							>
								<title>Website</title>
								<path
									fill="currentColor"
									d="M19.739 4.261a6.867 6.867 0 0 0-9.711 0l-.72.721a.75.75 0 0 0 1.06 1.06l.72-.72a5.367 5.367 0 1 1 7.59 7.59l-.72.72a.75.75 0 0 0 1.06 1.06l.72-.72a6.867 6.867 0 0 0 0-9.71M6.043 9.307a.75.75 0 0 1 0 1.06l-.721.722a5.367 5.367 0 1 0 7.59 7.59l.72-.722a.75.75 0 0 1 1.06 1.06l-.72.722a6.867 6.867 0 0 1-9.71-9.711l.72-.72a.75.75 0 0 1 1.06 0"
								/>
								<path
									fill="currentColor"
									d="M14.693 9.307a.75.75 0 0 1 0 1.06l-4.325 4.326a.75.75 0 1 1-1.06-1.06l4.324-4.326a.75.75 0 0 1 1.06 0"
								/>
							</svg>
						</a>
					)}
				</div>
			</section>
			<UserTabs posts={posts} />
		</main>
	);
}
