import {
	ArrowDown01Icon,
	ArrowUp01Icon,
	ArrowUpDownIcon,
	Search01Icon,
	ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { User } from "@opencircle/core";
import { Badge, Button, Input } from "@opencircle/ui";
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
import moment from "moment";
import { useMemo, useState } from "react";
import { TableSkeleton } from "./tableSkeleton";

interface UserTableProps {
	users: User[];
	isLoading?: boolean;
}

export const UserTable = ({ users, isLoading }: UserTableProps) => {
	const router = useRouter();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = useState("");

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "username",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						User
						{column.getIsSorted() === "asc" ? (
							<HugeiconsIcon icon={ArrowUp01Icon} size={14} />
						) : column.getIsSorted() === "desc" ? (
							<HugeiconsIcon icon={ArrowDown01Icon} size={14} />
						) : (
							<HugeiconsIcon
								icon={ArrowUpDownIcon}
								size={14}
								className="opacity-50"
							/>
						)}
					</button>
				);
			},
			cell: ({ row }) => {
				const username = row.getValue("username") as string;
				const name = row.original.name;
				return (
					<div>
						{name && (
							<div className="text-muted-foreground text-sm">{name}</div>
						)}
						<div className="font-medium text-foreground/50 text-xs">
							{username}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "email",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Email
						{column.getIsSorted() === "asc" ? (
							<HugeiconsIcon icon={ArrowUp01Icon} size={14} />
						) : column.getIsSorted() === "desc" ? (
							<HugeiconsIcon icon={ArrowDown01Icon} size={14} />
						) : (
							<HugeiconsIcon
								icon={ArrowUpDownIcon}
								size={14}
								className="opacity-50"
							/>
						)}
					</button>
				);
			},
			cell: ({ row }) => (
				<div className="text-sm">{row.getValue("email") as string}</div>
			),
		},
		{
			accessorKey: "is_active",
			header: "Status",
			cell: ({ row }) => (
				<div className="text-sm">
					{(row.getValue("is_active") as boolean) ? (
						<Badge variant="primary" size="sm">
							Active
						</Badge>
					) : (
						<Badge variant="destructive" size="sm">
							Inactive
						</Badge>
					)}
				</div>
			),
		},
		{
			accessorKey: "role",
			header: ({ column }) => {
				return (
					<button
						type="button"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 transition-colors hover:text-foreground"
					>
						Role
						{column.getIsSorted() === "asc" ? (
							<HugeiconsIcon icon={ArrowUp01Icon} size={14} />
						) : column.getIsSorted() === "desc" ? (
							<HugeiconsIcon icon={ArrowDown01Icon} size={14} />
						) : (
							<HugeiconsIcon
								icon={ArrowUpDownIcon}
								size={14}
								className="opacity-50"
							/>
						)}
					</button>
				);
			},
			cell: ({ row }) => (
				<div className="text-sm capitalize">
					{row.getValue("role") as string}
				</div>
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
							<HugeiconsIcon icon={ArrowUp01Icon} size={14} />
						) : column.getIsSorted() === "desc" ? (
							<HugeiconsIcon icon={ArrowDown01Icon} size={14} />
						) : (
							<HugeiconsIcon
								icon={ArrowUpDownIcon}
								size={14}
								className="opacity-50"
							/>
						)}
					</button>
				);
			},
			cell: ({ row }) => {
				const date = new Date(row.getValue("created_at") as string);
				return (
					<div className="text-sm">{moment(date).format("DD MMM YYYY")}</div>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const user = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							onClick={() => {
								router.navigate({ to: `/users/${user.id}` });
							}}
						>
							<HugeiconsIcon icon={ViewIcon} size={14} />
							View Details
						</Button>
					</div>
				);
			},
			enableSorting: false,
		},
	];

	// Filter users based on search query
	const filteredUsers = useMemo(() => {
		if (!searchQuery.trim()) return users;

		const query = searchQuery.toLowerCase();
		return users.filter((user) => {
			return (
				user.username?.toLowerCase().includes(query) ||
				user.email?.toLowerCase().includes(query) ||
				user.name?.toLowerCase().includes(query) ||
				user.role?.toLowerCase().includes(query)
			);
		});
	}, [users, searchQuery]);

	const table = useReactTable({
		data: filteredUsers,
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
		return <TableSkeleton rowCount={5} />;
	}

	return (
		<div className="space-y-4">
			{/* Search Input */}
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<HugeiconsIcon
						icon={Search01Icon}
						size={16}
						className="text-foreground/40"
					/>
				</div>
				<Input
					type="text"
					placeholder="Search by username, email, name, or role..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Results count */}
			{searchQuery && (
				<div className="text-foreground/60 text-sm">
					Showing {filteredUsers.length} of {users.length} users
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
										No users found.
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
