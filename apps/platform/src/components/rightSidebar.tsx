import { Button } from "@opencircle/ui";
import { Link } from "@tanstack/react-router";
import { useAccount } from "../features/auth/hooks/useAccount";
import { UserCard } from "../features/user/components/userCard";

export const RightSidebar = () => {
	const { account } = useAccount();

	return (
		<div className="sticky top-0 h-screen">
			{account ? (
				<UserCard account={account} />
			) : (
				<section className="flex h-14 items-center justify-between px-4">
					<div />
					<div className="flex items-center gap-4">
						<Link to="/register">
							<div className="font-medium text-xs">Sign up</div>
						</Link>
						<Link to="/login">
							<Button size="sm">Login</Button>
						</Link>
					</div>
				</section>
			)}
			<main className="space-y-8 p-4"></main>
		</div>
	);
};
