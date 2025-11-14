import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lesson } from "@opencircle/core";
import { Button } from "@opencircle/ui";
import { useRouter } from "@tanstack/react-router";
import { Edit2, GripVertical, Trash2 } from "lucide-react";

interface LessonListItemProps {
	lesson: Lesson;
	onDelete: (lessonId: string) => void;
	isDeleting: boolean;
}

export const LessonListItem = ({
	lesson,
	onDelete,
	isDeleting,
}: LessonListItemProps) => {
	const router = useRouter();

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: lesson.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-shadow hover:shadow-md"
		>
			<div className="flex items-center gap-3">
				<button
					type="button"
					className="cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
					{...attributes}
					{...listeners}
				>
					<GripVertical className="h-4 w-4" />
				</button>
				<div>
					<h5 className="font-medium">{lesson.title}</h5>
					<p className="text-muted-foreground text-sm capitalize">
						{lesson.type}
					</p>
				</div>
			</div>
			<div className="flex gap-2">
				<Button
					type="button"
					size="sm"
					onClick={() =>
						router.navigate({
							to: `/courses/lessons/${lesson.id}/edit`,
						})
					}
				>
					<Edit2 size={14} />
				</Button>
				<Button
					type="button"
					size="sm"
					variant="destructive"
					onClick={() => onDelete(lesson.id)}
					disabled={isDeleting}
				>
					<Trash2 size={14} />
				</Button>
			</div>
		</div>
	);
};
