import type { User } from "@opencircle/core";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";

interface UserTableProps {
	users: User[];
	isLoading?: boolean;
}

export const UserTable = ({ users, isLoading }: UserTableProps) => {
	const [rowSelection, setRowSelection] = useState({});

	const columns: ColumnDef<User>[] = [
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
			accessorKey: "username",
			header: "User",
			cell: ({ row }) => {
				const username = row.getValue("username") as string;
				const name = row.original.name;
				return (
					<div>
						{name && <div className="text-muted-foreground">{name}</div>}
						<div className="font-medium text-foreground/50 text-xs">
							{username}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => row.getValue("email") as string,
		},
		{
			accessorKey: "is_active",
			header: "Active",
			cell: ({ row }) => (
				<div className="text-center">
					{(row.getValue("is_active") as boolean) ? "✓" : "✗"}
				</div>
			),
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => (
				<div className="capitalize">{row.getValue("role") as string}</div>
			),
		},
		{
			accessorKey: "created_at",
			header: "Created",
			cell: ({ row }) => {
				const date = new Date(row.getValue("created_at") as string);
				return date.toLocaleDateString();
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => {
								console.log("View details for:", user);
							}}
							className="rounded p-1 hover:bg-gray-100"
							title="View Details"
						>
							<Eye size={16} />
						</button>
						<button
							type="button"
							onClick={() => {
								console.log("Ban user:", user);
							}}
							className="rounded p-1 text-red-600 hover:bg-red-100"
							title="Ban"
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
		data: users,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	});

	if (isLoading) {
		return <div className="p-4">Loading users...</div>;
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
								No users found.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
