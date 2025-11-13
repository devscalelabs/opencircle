import type { InviteCode } from "@opencircle/core";
import { Button } from "@opencircle/ui";
import { useRouter } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Ban, Edit, Trash2 } from "lucide-react";

interface InviteCodeListProps {
	inviteCodes: InviteCode[];
	onDelete?: (id: string) => void;
	onDeactivate?: (id: string) => void;
	loading?: boolean;
}

export const InviteCodeList = ({
	inviteCodes,
	onDelete,
	onDeactivate,
	loading,
}: InviteCodeListProps) => {
	const router = useRouter();
	const columns: ColumnDef<InviteCode>[] = [
		{
			accessorKey: "code",
			header: "Code",
			cell: ({ row }) => (
				<div className="max-w-xs truncate font-medium font-mono text-sm">
					{row.getValue("code")}
				</div>
			),
		},
		{
			accessorKey: "max_uses",
			header: "Max Uses",
			cell: ({ row }) => {
				const maxUses = row.getValue("max_uses") as number;
				return (
					<div className="text-sm">
						{maxUses === 0 ? "Unlimited" : maxUses.toString()}
					</div>
				);
			},
		},
		{
			accessorKey: "used_count",
			header: "Used",
			cell: ({ row }) => {
				const usedCount = row.getValue("used_count") as number;
				const maxUses = row.original.max_uses;
				const remaining =
					maxUses === 0 ? "∞" : (maxUses - usedCount).toString();
				return (
					<div className="text-center text-sm">
						{usedCount} / {remaining}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				const statusColors = {
					active: "text-green-600",
					used: "text-red-600",
					expired: "text-gray-600",
				};
				return (
					<div
						className={`text-sm capitalize ${statusColors[status as keyof typeof statusColors]}`}
					>
						{status}
					</div>
				);
			},
		},
		{
			accessorKey: "expires_at",
			header: "Expires",
			cell: ({ row }) => {
				const expiresAt = row.getValue("expires_at") as string;
				if (!expiresAt) return <div className="text-sm">Never</div>;
				const date = new Date(expiresAt);
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
			accessorKey: "auto_join_channel_id",
			header: "Auto Join Channel",
			cell: ({ row }) => {
				const channelId = row.getValue("auto_join_channel_id") as string;
				return channelId ? (
					<div className="max-w-xs truncate font-mono text-sm">{channelId}</div>
				) : (
					<div className="text-gray-500 text-sm">None</div>
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
				const inviteCode = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							onClick={() => {
								router.navigate({ to: `/invite-codes/edit/${inviteCode.id}` });
							}}
						>
							<Edit size={14} />
							Edit
						</Button>
						{inviteCode.status === "active" && onDeactivate && (
							<Button
								size="sm"
								variant="secondary"
								onClick={() => onDeactivate(inviteCode.id)}
							>
								<Ban size={14} />
								Deactivate
							</Button>
						)}
						{onDelete && (
							<Button
								size="sm"
								variant="secondary"
								onClick={() => onDelete(inviteCode.id)}
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
		data: inviteCodes,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (loading) {
		return <div className="p-4">Loading invite codes...</div>;
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
								No invite codes found.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
