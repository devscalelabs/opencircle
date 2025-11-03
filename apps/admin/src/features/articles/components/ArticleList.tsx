import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Eye, Trash2 } from "lucide-react";
import type { Article } from "../utils/types";

interface ArticleListProps {
	articles: Article[];
	onDelete?: (id: string) => void;
	loading?: boolean;
}

export const ArticleList = ({
	articles,
	onDelete,
	loading,
}: ArticleListProps) => {
	const columns: ColumnDef<Article>[] = [
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => (
				<div className="max-w-xs truncate font-medium">
					{row.getValue("title")}
				</div>
			),
		},
		{
			accessorKey: "user",
			header: "Author",
			cell: ({ row }) => {
				const user = row.getValue("user") as Article["user"];
				return user?.name || user?.username || "Unknown";
			},
		},
		{
			accessorKey: "created_at",
			header: "Created",
			cell: ({ row }) => {
				const dateValue = row.getValue("created_at") as string;
				if (!dateValue) return "N/A";
				const date = new Date(dateValue);
				return Number.isNaN(date.getTime())
					? "Invalid date"
					: format(date, "MMM dd, yyyy");
			},
		},
		{
			accessorKey: "updated_at",
			header: "Updated",
			cell: ({ row }) => {
				const dateValue = row.getValue("updated_at") as string;
				if (!dateValue) return "N/A";
				const date = new Date(dateValue);
				return Number.isNaN(date.getTime())
					? "Invalid date"
					: format(date, "MMM dd, yyyy");
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const article = row.original;
				return (
					<div className="flex items-center gap-2">
						<Link
							to="/articles/$id"
							params={{ id: article.id }}
							className="rounded p-1 hover:bg-gray-100"
							title="View"
						>
							<Eye size={16} />
						</Link>
						<Link
							to="/articles/edit/$id"
							params={{ id: article.id }}
							className="rounded p-1 hover:bg-gray-100"
							title="Edit"
						>
							<Edit size={16} />
						</Link>
						{onDelete && (
							<button
								type="button"
								onClick={() => onDelete(article.id)}
								className="rounded p-1 text-red-600 hover:bg-red-100"
								title="Delete"
							>
								<Trash2 size={16} />
							</button>
						)}
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: articles,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (loading) {
		return <div className="p-4">Loading articles...</div>;
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
								No articles found.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
