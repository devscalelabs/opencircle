import type { Channel } from "@opencircle/core";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface ChannelTableProps {
	channels: Channel[];
	isLoading?: boolean;
}

export const ChannelTable = ({ channels, isLoading }: ChannelTableProps) => {
	const [rowSelection, setRowSelection] = useState({});

	const columns: ColumnDef<Channel>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<input
					type="checkbox"
					checked={table.getIsAllPageRowsSelected()}
					onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
					aria-label="Select all"
					className="rounded border-gray-300"
				/>
			),
			cell: ({ row }) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={(e) => row.toggleSelected(!!e.target.checked)}
					aria-label="Select row"
					className="rounded border-gray-300"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "emoji",
			header: "Emoji",
			cell: ({ row }) => <div className="text-lg">{row.getValue("emoji")}</div>,
		},
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "slug",
			header: "Slug",
			cell: ({ row }) => row.getValue("slug"),
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => row.getValue("description") || "-",
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<div className="capitalize">{row.getValue("type")}</div>
			),
		},
		{
			accessorKey: "created_at",
			header: "Created",
			cell: ({ row }) => {
				const date = new Date(row.getValue("created_at"));
				return date.toLocaleDateString();
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const channel = row.original;
				return (
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => {
								console.log("Edit channel:", channel);
							}}
							className="rounded p-1 hover:bg-gray-100"
							title="Edit"
						>
							<Edit size={16} />
						</button>
						<button
							type="button"
							onClick={() => {
								console.log("Delete channel:", channel);
							}}
							className="rounded p-1 text-red-600 hover:bg-red-100"
							title="Delete"
						>
							<Trash2 size={16} />
						</button>
					</div>
				);
			},
			enableSorting: false,
		},
	];

	const table = useReactTable({
		data: channels,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	});

	if (isLoading) {
		return <div className="p-4">Loading channels...</div>;
	}

	return (
		<div className="rounded-md border border-border">
			<table className="w-full">
				<thead className="bg-muted/50">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
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
				<tbody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								className="border-border border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
							>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="p-4 align-middle">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td colSpan={columns.length} className="h-24 text-center">
								No channels found.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
