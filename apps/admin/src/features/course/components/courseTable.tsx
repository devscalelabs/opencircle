import type { Course } from "@opencircle/core";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@opencircle/ui";
import { useRouter } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import { useCourseDelete } from "../hooks/useCourseDelete";

interface CourseTableProps {
	courses: Course[];
	isLoading?: boolean;
}

export const CourseTable = ({ courses, isLoading }: CourseTableProps) => {
	const [rowSelection, setRowSelection] = useState({});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
	const router = useRouter();

	const handleDeleteClick = (course: Course) => {
		setCourseToDelete(course);
		setDeleteDialogOpen(true);
	};

	const { deleteCourse, isDeleting } = useCourseDelete();

	const handleDeleteConfirm = () => {
		if (courseToDelete) {
			deleteCourse(courseToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setCourseToDelete(null);
				},
				onError: (error) => {
					console.error("Failed to delete course:", error);
					// Keep dialog open on error so user can try again
				},
			});
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setCourseToDelete(null);
	};

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
			header: "Title",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("title")}</div>
			),
		},
		{
			accessorKey: "instructor",
			header: "Instructor",
			cell: ({ row }) => {
				const instructor = row.getValue("instructor") as Course["instructor"];
				return instructor?.name || instructor?.username || "-";
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<div className="capitalize">
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
			header: "Price",
			cell: ({ row }) => {
				const price = row.getValue("price") as number;
				return price !== null && price !== undefined ? `$${price}` : "Free";
			},
		},
		{
			accessorKey: "sections",
			header: "Sections",
			cell: ({ row }) => {
				const sections = row.getValue("sections") as Course["sections"];
				return sections?.length || 0;
			},
		},
		{
			accessorKey: "enrollments",
			header: "Enrollments",
			cell: ({ row }) => {
				const enrollments = row.getValue(
					"enrollments",
				) as Course["enrollments"];
				return enrollments?.length || 0;
			},
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
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => {
							router.navigate({ to: `/courses/edit/${row.original.id}` });
						}}
						className="rounded p-1 hover:bg-gray-100"
						title="Edit"
					>
						<Edit size={16} />
					</button>
					<button
						type="button"
						onClick={() => handleDeleteClick(row.original)}
						className="rounded p-1 text-red-600 hover:bg-red-100"
						title="Delete"
					>
						<Trash size={16} />
					</button>
				</div>
			),
			enableSorting: false,
		},
	];

	const table = useReactTable({
		data: courses,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	});

	if (isLoading) {
		return <div className="p-4">Loading courses...</div>;
	}

	return (
		<>
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
								<td colSpan={columns.length} className="h-24 text-center">
									No courses found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Course</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{courseToDelete?.title}"? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="secondary" onClick={handleDeleteCancel}>
							Cancel
						</Button>
						<Button
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
							variant="primary"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
