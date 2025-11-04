import type { Channel } from "@opencircle/core";
import { Button } from "@opencircle/ui";
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
			header: "Type",
			cell: ({ row }) => (
				<div className="text-sm capitalize">{row.getValue("type")}</div>
			),
		},
		{
			accessorKey: "created_at",
			header: "Created",
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
								console.log("Edit channel:", channel);
							}}
						>
							<Edit size={14} />
							Edit
						</Button>
						<Button
							size="sm"
							variant="secondary"
							onClick={() => {
								console.log("Delete channel:", channel);
							}}
						>
							<Trash2 size={14} />
							Delete
						</Button>
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
