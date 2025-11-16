import type { Course } from "@opencircle/core";
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
import { ArrowDown, ArrowUp, ArrowUpDown, Edit, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TableSkeleton } from "./tableSkeleton";

interface CourseTableProps {
	courses: Course[];
	isLoading?: boolean;
}

export const CourseTable = ({ courses, isLoading }: CourseTableProps) => {
	const [rowSelection, setRowSelection] = useState({});
	const [sorting, setSorting] = useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();

	const columns: ColumnDef<Course>[] = [
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
				<div className="font-medium">{row.getValue("title")}</div>
			),
		},
		{
			accessorKey: "instructor",
			header: "Instructor",
			cell: ({ row }) => {
				const instructor = row.getValue("instructor") as Course["instructor"];
				return (
					<div className="text-sm">
						{instructor?.name || instructor?.username || "-"}
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
			cell: ({ row }) => (
				<div className="text-sm capitalize">
					<span
						className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
							row.getValue("status") === "published"
								? "bg-green-100 text-green-800"
								: row.getValue("status") === "draft"
									? "bg-yellow-100 text-yellow-800"
									: "bg-gray-100 text-gray-800"
						}`}
					>
						{row.getValue("status")}
					</span>
				</div>
			),
		},
		{
			accessorKey: "price",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Price
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
				const price = row.getValue("price") as number;
				return (
					<div className="text-sm">
						{price !== null && price !== undefined ? `$${price}` : "Free"}
					</div>
				);
			},
		},
		{
			accessorKey: "sections",
			header: "Sections",
			cell: ({ row }) => {
				const sections = row.getValue("sections") as Course["sections"];
				return (
					<div className="text-center text-sm">{sections?.length || 0}</div>
				);
			},
		},
		{
			accessorKey: "enrollments",
			header: "Enrollments",
			cell: ({ row }) => {
				const enrollments = row.getValue(
					"enrollments",
				) as Course["enrollments"];
				return (
					<div className="text-center text-sm">{enrollments?.length || 0}</div>
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
				const date = new Date(row.getValue("created_at"));
				return <div className="text-sm">{date.toLocaleDateString()}</div>;
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						onClick={() => {
							router.navigate({ to: `/courses/edit/${row.original.id}` });
						}}
					>
						<Edit size={14} />
						Edit
					</Button>
				</div>
			),
			enableSorting: false,
		},
	];

	// Filter courses based on search query
	const filteredCourses = useMemo(() => {
		if (!searchQuery.trim()) return courses;

		const query = searchQuery.toLowerCase();
		return courses.filter((course) => {
			return (
				course.title?.toLowerCase().includes(query) ||
				course.instructor?.name?.toLowerCase().includes(query) ||
				course.instructor?.username?.toLowerCase().includes(query) ||
				course.status?.toLowerCase().includes(query)
			);
		});
	}, [courses, searchQuery]);

	const table = useReactTable({
		data: filteredCourses,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		state: {
			rowSelection,
			sorting,
		},
	});

	if (isLoading) {
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
					placeholder="Search by title, instructor, or status..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Results count */}
			{searchQuery && (
				<div className="text-foreground/60 text-sm">
					Showing {filteredCourses.length} of {courses.length} courses
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
										No courses found.
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
