import { Button, Input } from "@opencircle/ui";
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
import type { Article } from "../utils/types";
import { TableSkeleton } from "./tableSkeleton";

interface ArticleListProps {
	articles: Article[];
	onDelete?: (id: string) => void;
	loading?: boolean;
}

export const ArticleList = ({ articles, loading }: ArticleListProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const columns: ColumnDef<Article>[] = [
		{
			accessorKey: "title",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Title
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
					{row.getValue("title")}
				</div>
			),
		},
		{
			accessorKey: "user",
			header: "Author",
			cell: ({ row }) => {
				const user = row.getValue("user") as Article["user"];
				return (
					<div className="text-sm">
						{user?.name || user?.username || "Unknown"}
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
			accessorKey: "updated_at",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Updated
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
				const dateValue = row.getValue("updated_at") as string;
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
				const article = row.original;
				return (
					<div className="flex items-center gap-2">
						<Link to="/articles/$id" params={{ id: article.id }}>
							<Button
								size="sm"
								onClick={() => {
									console.log("View article:", article);
								}}
							>
								<Eye size={14} />
								View
							</Button>
						</Link>
						<Link to="/articles/edit/$id" params={{ id: article.id }}>
							<Button size="sm" variant="secondary">
								<Edit size={14} />
								Edit
							</Button>
						</Link>
					</div>
				);
			},
		},
	];

	// Filter articles based on search query
	const filteredArticles = useMemo(() => {
		if (!searchQuery.trim()) return articles;

		const query = searchQuery.toLowerCase();
		return articles.filter((article) => {
			return (
				article.title?.toLowerCase().includes(query) ||
				article.user?.name?.toLowerCase().includes(query) ||
				article.user?.username?.toLowerCase().includes(query)
			);
		});
	}, [articles, searchQuery]);

	const table = useReactTable({
		data: filteredArticles,
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
			{/* Search Input */}
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Search size={16} className="text-foreground/40" />
				</div>
				<Input
					type="text"
					placeholder="Search by title or author..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Results count */}
			{searchQuery && (
				<div className="text-foreground/60 text-sm">
					Showing {filteredArticles.length} of {articles.length} articles
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
										No articles found.
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
