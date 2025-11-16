import type { Channel } from "@opencircle/core";
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
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface ChannelTableProps {
	channels: Channel[];
	isLoading?: boolean;
}

export const ChannelTable = ({ channels, isLoading }: ChannelTableProps) => {
	const router = useRouter();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = useState("");

	const columns: ColumnDef<Channel>[] = [
		{
			accessorKey: "emoji",
			header: "Emoji",
			cell: ({ row }) => <div className="text-lg">{row.getValue("emoji")}</div>,
		},
		{
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Name
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
				<div className="font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "slug",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Slug
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
			cell: ({ row }) => <div className="text-sm">{row.getValue("slug")}</div>,
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => (
				<div className="text-sm">{row.getValue("description") || "-"}</div>
			),
		},
		{
			accessorKey: "type",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Type
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
				<div className="text-sm capitalize">{row.getValue("type")}</div>
			),
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
				const date = new Date(row.getValue("created_at"));
				return <div className="text-sm">{date.toLocaleDateString()}</div>;
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const channel = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							onClick={() => {
								router.navigate({ to: `/channels/${channel.id}` });
							}}
						>
							<Eye size={14} />
							View Details
						</Button>
					</div>
				);
			},
			enableSorting: false,
		},
	];

	// Filter channels based on search query
	const filteredChannels = useMemo(() => {
		if (!searchQuery.trim()) return channels;

		const query = searchQuery.toLowerCase();
		return channels.filter((channel) => {
			return (
				channel.name?.toLowerCase().includes(query) ||
				channel.slug?.toLowerCase().includes(query) ||
				channel.description?.toLowerCase().includes(query) ||
				channel.type?.toLowerCase().includes(query)
			);
		});
	}, [channels, searchQuery]);

	const table = useReactTable({
		data: filteredChannels,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	if (isLoading) {
		return (
			<div className="rounded-lg border border-border bg-background shadow-sm">
				<div className="p-6">
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<div
								key={`skeleton-channel-row-${i}`}
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
					placeholder="Search by name, slug, description, or type..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Results count */}
			{searchQuery && (
				<div className="text-foreground/60 text-sm">
					Showing {filteredChannels.length} of {channels.length} channels
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
										No channels found.
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
