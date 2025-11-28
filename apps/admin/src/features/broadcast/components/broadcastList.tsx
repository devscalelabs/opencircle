import { Badge, Button, Input } from "@opencircle/ui";
import { Link } from "@tanstack/react-router";
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
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Edit,
	Eye,
	Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Broadcast, BroadcastStatus } from "../utils/types";
import { TableSkeleton } from "./tableSkeleton";

interface BroadcastListProps {
	broadcasts: Broadcast[];
	loading?: boolean;
}

const statusColors: Record<BroadcastStatus, string> = {
	draft: "bg-yellow-500/20 text-yellow-500",
	sending: "bg-blue-500/20 text-blue-500",
	sent: "bg-green-500/20 text-green-500",
	failed: "bg-red-500/20 text-red-500",
};

export const BroadcastList = ({ broadcasts, loading }: BroadcastListProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = useState("");

	const columns: ColumnDef<Broadcast>[] = [
		{
			accessorKey: "subject",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Subject
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
				<div className="max-w-xs truncate font-medium">
					{row.getValue("subject")}
				</div>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as BroadcastStatus;
				return (
					<Badge className={statusColors[status]}>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</Badge>
				);
			},
		},
		{
			accessorKey: "recipient_type",
			header: "Recipients",
			cell: ({ row }) => {
				const broadcast = row.original;
				const type = broadcast.recipient_type;
				if (type === "channel_members") {
					return (
						<div className="text-sm">
							{broadcast.channel?.emoji} {broadcast.channel?.name || "Channel"}
						</div>
					);
				}
				return (
					<div className="text-sm">
						{type === "all_users" ? "All Users" : "Test Email"}
					</div>
				);
			},
		},
		{
			accessorKey: "sent_count",
			header: "Sent",
			cell: ({ row }) => {
				const broadcast = row.original;
				return (
					<div className="text-sm">
						{broadcast.sent_count > 0 || broadcast.failed_count > 0 ? (
							<span>
								{broadcast.sent_count} /{" "}
								{broadcast.sent_count + broadcast.failed_count}
							</span>
						) : (
							"-"
						)}
					</div>
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
				const broadcast = row.original;
				return (
					<div className="flex items-center gap-2">
						<Link to="/broadcast/$id" params={{ id: broadcast.id }}>
							<Button size="sm">
								<Eye size={14} />
								View
							</Button>
						</Link>
						{broadcast.status === "draft" && (
							<Link to="/broadcast/edit/$id" params={{ id: broadcast.id }}>
								<Button size="sm" variant="secondary">
									<Edit size={14} />
									Edit
								</Button>
							</Link>
						)}
					</div>
				);
			},
		},
	];

	const filteredBroadcasts = useMemo(() => {
		if (!searchQuery.trim()) return broadcasts;

		const query = searchQuery.toLowerCase();
		return broadcasts.filter((broadcast) => {
			return broadcast.subject?.toLowerCase().includes(query);
		});
	}, [broadcasts, searchQuery]);

	const table = useReactTable({
		data: filteredBroadcasts,
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
		return <TableSkeleton rowCount={5} />;
	}

	return (
		<div className="space-y-4">
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Search size={16} className="text-foreground/40" />
				</div>
				<Input
					type="text"
					placeholder="Search by subject..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{searchQuery && (
				<div className="text-foreground/60 text-sm">
					Showing {filteredBroadcasts.length} of {broadcasts.length} broadcasts
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
										No broadcasts found.
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
