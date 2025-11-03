import type { User } from "@opencircle/core";
import { Avatar } from "@opencircle/ui";
import { useNavigate } from "@tanstack/react-router";
import { DropdownMenu } from "radix-ui";
import { getInitials } from "../../../utils/common";

interface UserCardProps {
	account: User;
}

export const UserCard = ({ account }: UserCardProps) => {
	const navigate = useNavigate();

	function handleLogout() {
		localStorage.removeItem("token");
		navigate({ to: "/login" });
	}

	return (
		<section className="flex h-14 items-center justify-between border-border border-b px-4 font-semibold text-sm">
			<div>{account.name}</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Avatar
						image_url={account.avatar_url || ""}
						initials={getInitials(account.name)}
					/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					sideOffset={10}
					align="end"
					className="min-w-[200px] overflow-hidden rounded-lg border border-border bg-background-secondary font-medium text-xs shadow-2xl"
				>
					<DropdownMenu.Item
						className="p-3 focus-within:outline-none hover:bg-primary"
						onClick={() =>
							navigate({
								to: "/$username",
								params: { username: account.username },
							})
						}
					>
						Profile
					</DropdownMenu.Item>
					<DropdownMenu.Item
						className="p-3 focus-within:outline-none hover:bg-primary"
						onClick={() => navigate({ to: "/edit-profile" })}
					>
						Edit Profile
					</DropdownMenu.Item>
					<DropdownMenu.Separator className="h-0.5 bg-border" />
					<DropdownMenu.Item
						className="p-3 focus-within:outline-none hover:bg-primary"
						onClick={handleLogout}
					>
						Logout
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</section>
	);
};
