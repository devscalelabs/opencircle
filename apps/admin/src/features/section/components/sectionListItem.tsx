import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Section } from "@opencircle/core";
import { Button } from "@opencircle/ui";
import { useRouter } from "@tanstack/react-router";

interface SectionListItemProps {
	section: Section;
	onDelete: (sectionId: string) => void;
	isDeleting: boolean;
}

export const SectionListItem = ({
	section,
	onDelete,
	isDeleting,
}: SectionListItemProps) => {
	const router = useRouter();

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: section.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<button
						type="button"
						className="cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
						{...attributes}
						{...listeners}
					>
						<HugeiconsIcon icon={DragDropVerticalIcon} size={20} />
					</button>
					<div>
						<h3 className="font-medium">{section.title}</h3>
						{section.description && (
							<p className="line-clamp-1 text-muted-foreground text-sm">
								{section.description}
							</p>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground text-sm">
						{section.lessons?.length || 0} lessons
					</span>
					<Button
						type="button"
						size="sm"
						onClick={() =>
							router.navigate({
								to: `/courses/sections/${section.id}/edit`,
							})
						}
					>
						Edit
					</Button>
					<Button
						type="button"
						size="sm"
						variant="destructive"
						onClick={() => onDelete(section.id)}
						disabled={isDeleting}
					>
						Delete
					</Button>
				</div>
			</div>
		</div>
	);
};
