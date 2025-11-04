import type { Resource } from "@opencircle/core";
import { Button } from "@opencircle/ui";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink, Trash2 } from "lucide-react";

interface ResourcesListProps {
	resources?: Resource[];
	loading: boolean;
	onDelete?: (id: string) => void;
}

export const ResourcesList = ({
	resources = [],
	loading,
	onDelete,
}: ResourcesListProps) => {
	const columns: ColumnDef<Resource>[] = [
		{
			accessorKey: "url",
			header: "URL",
			cell: ({ row }) => {
				const url = row.getValue("url") as string;
				return (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 text-primary text-sm hover:underline"
					>
						<span className="max-w-xs truncate">{url}</span>
						<ExternalLink size={14} className="flex-shrink-0" />
					</a>
				);
			},
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => {
				const description = row.getValue("description") as string | null;
				return (
					<div className="max-w-xs truncate text-muted-foreground text-sm">
						{description || "-"}
					</div>
				);
			},
		},
		{
			accessorKey: "channel",
			header: "Channel",
			cell: ({ row }) => {
				const channel = row.getValue("channel") as Resource["channel"];
				return (
					<div className="flex items-center gap-2 text-sm">
						<span>{channel.emoji}</span>
						<span className="font-medium">{channel.name}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "user",
			header: "Creator",
			cell: ({ row }) => {
				const user = row.getValue("user") as Resource["user"];
				return (
					<div className="text-sm">
						{user?.name || user?.username || "Unknown"}
					</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Created",
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
				const resource = row.original;
				return (
					<div className="flex items-center gap-2">
						{onDelete && (
							<Button
								size="sm"
								variant="secondary"
								onClick={() => onDelete(resource.id)}
							>
								<Trash2 size={14} />
								Delete
							</Button>
						)}
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: resources,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (loading) {
		return <div className="p-4">Loading resources...</div>;
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
								No resources found.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
