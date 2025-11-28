import type { ChannelMember, User } from "@opencircle/core";
import { Input } from "@opencircle/ui";
import { Loader2, Search } from "lucide-react";
import { ScrollArea } from "radix-ui";
import { useMemo, useState } from "react";
import { useUsers } from "../../user/hooks/useUsers";
import { useAddChannelMember } from "../hooks/useAddChannelMember";
import { useChannelMembers } from "../hooks/useChannelMembers";
import { useRemoveChannelMember } from "../hooks/useRemoveChannelMember";

interface ChannelMembersManagerProps {
	channelId: string;
}

export const ChannelMembersManager = ({
	channelId,
}: ChannelMembersManagerProps) => {
	const { users, isUsersLoading } = useUsers(0, 1000);
	const { members, isMembersLoading } = useChannelMembers(channelId);
	const { addMember, isAdding } = useAddChannelMember();
	const { removeMember, isRemoving } = useRemoveChannelMember();

	const [pendingUserId, setPendingUserId] = useState<string | null>(null);
	const [availableSearch, setAvailableSearch] = useState("");
	const [memberSearch, setMemberSearch] = useState("");

	const memberUserIds = useMemo(
		() => new Set(members.map((m: ChannelMember) => m.user_id)),
		[members],
	);

	const availableUsers = useMemo(() => {
		const filtered = users.filter((user: User) => !memberUserIds.has(user.id));
		if (!availableSearch.trim()) return filtered;
		const search = availableSearch.toLowerCase();
		return filtered.filter(
			(user: User) =>
				user.name?.toLowerCase().includes(search) ||
				user.username.toLowerCase().includes(search),
		);
	}, [users, memberUserIds, availableSearch]);

	const memberUsers = useMemo(() => {
		const filtered = users.filter((user: User) => memberUserIds.has(user.id));
		if (!memberSearch.trim()) return filtered;
		const search = memberSearch.toLowerCase();
		return filtered.filter(
			(user: User) =>
				user.name?.toLowerCase().includes(search) ||
				user.username.toLowerCase().includes(search),
		);
	}, [users, memberUserIds, memberSearch]);

	const handleAddMember = (userId: string) => {
		setPendingUserId(userId);
		addMember(
			{ channelId, userId },
			{
				onSettled: () => setPendingUserId(null),
			},
		);
	};

	const handleRemoveMember = (userId: string) => {
		setPendingUserId(userId);
		removeMember(
			{ channelId, userId },
			{
				onSettled: () => setPendingUserId(null),
			},
		);
	};

	if (isUsersLoading || isMembersLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const isProcessing = isAdding || isRemoving;

	return (
		<div className="grid grid-cols-2 gap-4">
			{/* Available Users (Left) */}
			<div className="rounded-lg border border-border bg-background">
				<div className="border-border border-b bg-muted/40 px-4 py-3">
					<h4 className="font-medium text-sm">
						Available Users ({availableUsers.length})
					</h4>
				</div>
				<div className="border-border border-b p-2">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name or username..."
							value={availableSearch}
							onChange={(e) => setAvailableSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>
				<ScrollArea.Root className="h-64">
					<ScrollArea.Viewport className="h-full w-full p-2">
						{availableUsers.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No available users
							</p>
						) : (
							<div className="space-y-1">
								{availableUsers.map((user: User) => (
									<button
										type="button"
										key={user.id}
										onClick={() => handleAddMember(user.id)}
										disabled={isProcessing}
										className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
									>
										{pendingUserId === user.id ? (
											<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
										) : (
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-medium text-xs">
												{user.name?.[0]?.toUpperCase() ||
													user.username[0].toUpperCase()}
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium">
												{user.name || user.username}
											</p>
											<p className="truncate text-muted-foreground text-xs">
												@{user.username}
											</p>
										</div>
									</button>
								))}
							</div>
						)}
					</ScrollArea.Viewport>
					<ScrollArea.Scrollbar
						className="flex touch-none select-none bg-muted/50 p-0.5 transition-colors duration-150 ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
						orientation="vertical"
					>
						<ScrollArea.Thumb className="before:-translate-x-1/2 before:-translate-y-1/2 relative flex-1 rounded-full bg-border before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-11 before:w-full before:min-w-11" />
					</ScrollArea.Scrollbar>
				</ScrollArea.Root>
			</div>

			{/* Channel Members (Right) */}
			<div className="rounded-lg border border-border bg-background">
				<div className="border-border border-b bg-muted/40 px-4 py-3">
					<h4 className="font-medium text-sm">
						Channel Members ({memberUsers.length})
					</h4>
				</div>
				<div className="border-border border-b p-2">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name or username..."
							value={memberSearch}
							onChange={(e) => setMemberSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>
				<ScrollArea.Root className="h-64">
					<ScrollArea.Viewport className="h-full w-full p-2">
						{memberUsers.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No members yet
							</p>
						) : (
							<div className="space-y-1">
								{memberUsers.map((user: User) => (
									<button
										type="button"
										key={user.id}
										onClick={() => handleRemoveMember(user.id)}
										disabled={isProcessing}
										className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
									>
										{pendingUserId === user.id ? (
											<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
										) : (
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-medium text-xs">
												{user.name?.[0]?.toUpperCase() ||
													user.username[0].toUpperCase()}
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium">
												{user.name || user.username}
											</p>
											<p className="truncate text-muted-foreground text-xs">
												@{user.username}
											</p>
										</div>
									</button>
								))}
							</div>
						)}
					</ScrollArea.Viewport>
					<ScrollArea.Scrollbar
						className="flex touch-none select-none bg-muted/50 p-0.5 transition-colors duration-150 ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
						orientation="vertical"
					>
						<ScrollArea.Thumb className="before:-translate-x-1/2 before:-translate-y-1/2 relative flex-1 rounded-full bg-border before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-11 before:w-full before:min-w-11" />
					</ScrollArea.Scrollbar>
				</ScrollArea.Root>
			</div>
		</div>
	);
};
