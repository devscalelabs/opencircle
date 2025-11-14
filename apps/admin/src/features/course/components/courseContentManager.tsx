import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SectionCreate, SectionUpdate } from "@opencircle/core";
import { Button } from "@opencircle/ui";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SectionEditor } from "../../../features/section/components/sectionEditor";
import { SectionListItem } from "../../../features/section/components/sectionListItem";
import { useSections } from "../../../features/section/hooks/useSections";

interface CourseContentManagerProps {
	courseId: string;
}

export const CourseContentManager = ({
	courseId,
}: CourseContentManagerProps) => {
	const [showSectionForm, setShowSectionForm] = useState(false);
	const [optimisticSections, setOptimisticSections] = useState<typeof sections>(
		[],
	);

	const {
		sections,
		isSectionsLoading,
		createSection,
		deleteSection,
		reorderSections,
		isCreatingSection,
		isDeletingSection,
		isReorderingSections,
	} = useSections(courseId);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Use optimistic sections if available, otherwise use actual sections
	const displaySections =
		optimisticSections.length > 0 ? optimisticSections : sections;

	const handleCreateSection = async (
		sectionData: SectionCreate | SectionUpdate,
	) => {
		try {
			await createSection({
				...sectionData,
				course_id: courseId,
			} as SectionCreate);
			setShowSectionForm(false);
		} catch (error) {
			console.error("Failed to create section in CourseContentManager:", error);
		}
	};

	const handleDeleteSection = async (sectionId: string) => {
		if (
			window.confirm(
				"Are you sure you want to delete this section and all its lessons?",
			)
		) {
			try {
				await deleteSection(sectionId);
			} catch (error) {
				console.error(
					"Failed to delete section in CourseContentManager:",
					error,
				);
			}
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const oldIndex = sections.findIndex((s) => s.id === active.id);
		const newIndex = sections.findIndex((s) => s.id === over.id);

		if (oldIndex === -1 || newIndex === -1) {
			return;
		}

		// Optimistically update the UI immediately
		const reorderedSections = arrayMove(sections, oldIndex, newIndex);
		setOptimisticSections(reorderedSections);

		// Update order values
		const updates = reorderedSections.map((section, index) => ({
			id: section.id,
			order: index,
		}));

		try {
			await reorderSections(updates);
			// Clear optimistic state on success - real data will come from query
			setOptimisticSections([]);
		} catch (error) {
			console.error("Failed to reorder sections:", error);
			// Revert optimistic update on error
			setOptimisticSections([]);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-2xl">Course Content</h2>
				<Button
					onClick={() => setShowSectionForm(true)}
					disabled={showSectionForm}
				>
					<Plus size={16} className="mr-2" />
					Add Section
				</Button>
			</div>

			{showSectionForm && (
				<div className="rounded-lg border border-border bg-muted/30 p-6">
					<SectionEditor
						courseId={courseId}
						onSave={handleCreateSection}
						onCancel={() => setShowSectionForm(false)}
						loading={isCreatingSection}
					/>
				</div>
			)}

			{isSectionsLoading ? (
				<div className="py-12 text-center text-muted-foreground">
					Loading course content...
				</div>
			) : displaySections.length === 0 && !showSectionForm ? (
				<div className="rounded-lg border-2 border-border border-dashed py-12 text-center">
					<h3 className="mb-2 font-medium text-lg">No sections yet</h3>
					<p className="mb-4 text-muted-foreground">
						Start building your course by adding your first section.
					</p>
					<Button onClick={() => setShowSectionForm(true)}>
						<Plus size={16} className="mr-2" />
						Create First Section
					</Button>
				</div>
			) : (
				<div className="relative">
					{isReorderingSections && (
						<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
							<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 shadow-lg">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
								<span className="text-sm">Reordering sections...</span>
							</div>
						</div>
					)}
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={displaySections.map((s) => s.id)}
							strategy={verticalListSortingStrategy}
						>
							<div className="space-y-4">
								{displaySections.map((section) => (
									<SectionListItem
										key={section.id}
										section={section}
										onDelete={handleDeleteSection}
										isDeleting={isDeletingSection}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>
				</div>
			)}
		</div>
	);
};
