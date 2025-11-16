import type { InviteCode } from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import { useRouter } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface InviteCodeListProps {
	inviteCodes: InviteCode[];
	loading?: boolean;
}

export const InviteCodeList = ({
	inviteCodes,
	loading,
}: InviteCodeListProps) => {
	const router = useRouter();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const columns: ColumnDef<InviteCode>[] = [
		{
			accessorKey: "code",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Code
						{column.getIsSorted() === "asc" ? (
							<ArrowUp size={14} />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown size={14} />
						) : (
							<ArrowUpDown size={14} className="opacity-50" />
						)}
					</button>
				);
			},
			cell: ({ row }) => (
				<div className="max-w-xs truncate font-medium font-mono text-sm">
					{row.getValue("code")}
				</div>
			),
		},
		{
			accessorKey: "max_uses",
			header: "Max Uses",
			cell: ({ row }) => {
				const maxUses = row.getValue("max_uses") as number;
				return (
					<div className="text-sm">
						{maxUses === 0 ? "Unlimited" : maxUses.toString()}
					</div>
				);
			},
		},
		{
			accessorKey: "used_count",
			header: "Used",
			cell: ({ row }) => {
				const usedCount = row.getValue("used_count") as number;
				const maxUses = row.original.max_uses;
				const remaining =
					maxUses === 0 ? "∞" : (maxUses - usedCount).toString();
				return (
					<div className="text-center text-sm">
						{usedCount} / {remaining}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Status
						{column.getIsSorted() === "asc" ? (
							<ArrowUp size={14} />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown size={14} />
						) : (
							<ArrowUpDown size={14} className="opacity-50" />
						)}
					</button>
				);
			},
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				const statusColors = {
					active: "text-green-600",
					used: "text-red-600",
					expired: "text-gray-600",
				};
				return (
					<div
						className={`text-sm capitalize ${statusColors[status as keyof typeof statusColors]}`}
					>
						{status}
					</div>
				);
			},
		},
		{
			accessorKey: "expires_at",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Expires
						{column.getIsSorted() === "asc" ? (
							<ArrowUp size={14} />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown size={14} />
						) : (
							<ArrowUpDown size={14} className="opacity-50" />
						)}
					</button>
				);
			},
			cell: ({ row }) => {
				const expiresAt = row.getValue("expires_at") as string;
				if (!expiresAt) return <div className="text-sm">Never</div>;
				const date = new Date(expiresAt);
				return (
					<div className="text-sm">
						{Number.isNaN(date.getTime())
							? "Invalid date"
							: format(date, "MMM dd, yyyy")}
					</div>
				);
			},
		},
		{
			accessorKey: "auto_join_channel_id",
			header: "Auto Join Channel",
			cell: ({ row }) => {
				const channelId = row.getValue("auto_join_channel_id") as string;
				return channelId ? (
					<div className="max-w-xs truncate font-mono text-sm">{channelId}</div>
				) : (
					<div className="text-gray-500 text-sm">None</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Created
						{column.getIsSorted() === "asc" ? (
							<ArrowUp size={14} />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown size={14} />
						) : (
							<ArrowUpDown size={14} className="opacity-50" />
						)}
					</button>
				);
			},
			cell: ({ row }) => {
				const dateValue = row.getValue("created_at") as string;
				if (!dateValue) return <div className="text-sm">N/A</div>;
				const date = new Date(dateValue);
				return (
					<div className="text-sm">
						{Number.isNaN(date.getTime())
							? "Invalid date"
							: format(date, "MMM dd, yyyy")}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const inviteCode = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							onClick={() => {
								router.navigate({ to: `/invite-codes/${inviteCode.id}` });
							}}
						>
							<Eye size={14} />
							View Details
						</Button>
					</div>
				);
			},
		},
	];

	// Filter invite codes based on search query
	const filteredInviteCodes = useMemo(() => {
		if (!searchQuery.trim()) return inviteCodes;

		const query = searchQuery.toLowerCase();
		return inviteCodes.filter((inviteCode) => {
			return (
				inviteCode.code?.toLowerCase().includes(query) ||
				inviteCode.status?.toLowerCase().includes(query) ||
				inviteCode.auto_join_channel_id?.toLowerCase().includes(query)
			);
		});
	}, [inviteCodes, searchQuery]);

	const table = useReactTable({
		data: filteredInviteCodes,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	if (loading) {
		return (
			<div className="rounded-lg border border-border bg-background shadow-sm">
				<div className="p-6">
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<div
								key={`skeleton-invite-code-row-${i}`}
								className="animate-pulse border-border border-b pb-4 last:border-0"
							>
								<div className="flex items-center gap-4">
									<div className="flex-1 space-y-2">
										<div className="h-4 w-48 rounded bg-background-secondary"></div>
										<div className="h-3 w-32 rounded bg-background-secondary"></div>
									</div>
									<div className="h-6 w-20 rounded-full bg-background-secondary"></div>
									<div className="h-4 w-24 rounded bg-background-secondary"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Search Input */}
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Search size={16} className="text-foreground/40" />
				</div>
				<Input
					type="text"
					placeholder="Search by code, status, or channel..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Results count */}
			{searchQuery && (
				<div className="text-foreground/60 text-sm">
					Showing {filteredInviteCodes.length} of {inviteCodes.length} invite
					codes
				</div>
			)}

			<div className="rounded-lg border border-border bg-background shadow-sm">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-border">
						<thead className="bg-background-secondary/50">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="px-6 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody className="divide-y divide-border bg-background">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="transition-colors hover:bg-background-secondary/50"
									>
										{row.getVisibleCells().map((cell) => (
											<td key={cell.id} className="px-6 py-4">
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										))}
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={columns.length}
										className="px-6 py-12 text-center text-foreground/60 text-sm"
									>
										No invite codes found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
