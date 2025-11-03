import type { SectionCreate, SectionUpdate } from "@opencircle/core";
import { Button } from "@opencircle/ui";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SectionEditor } from "../../../features/section/components/sectionEditor";
import { useSections } from "../../../features/section/hooks/useSections";

interface CourseContentManagerProps {
	courseId: string;
}

export const CourseContentManager = ({
	courseId,
}: CourseContentManagerProps) => {
	const [showSectionForm, setShowSectionForm] = useState(false);
	const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

	const {
		sections,
		isSectionsLoading,
		createSection,
		updateSection,
		deleteSection,
		isCreatingSection,
		isUpdatingSection,
		isDeletingSection,
	} = useSections(courseId);

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

	const handleUpdateSection = async (sectionData: SectionUpdate) => {
		if (!editingSectionId) return;
		try {
			await updateSection({ id: editingSectionId, data: sectionData });
			setEditingSectionId(null);
		} catch (error) {
			console.error("Failed to update section in CourseContentManager:", error);
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
			) : sections.length === 0 && !showSectionForm ? (
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
				<div className="space-y-4">
					{sections.map((section) => (
						<div key={section.id}>
							{editingSectionId === section.id ? (
								<SectionEditor
									section={section}
									courseId={courseId}
									onSave={handleUpdateSection}
									onCancel={() => setEditingSectionId(null)}
									onDelete={() => handleDeleteSection(section.id)}
									loading={isUpdatingSection}
									isEdit={true}
								/>
							) : (
								<div className="rounded-lg border border-border p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="h-5 w-5 text-muted-foreground">⋮⋮</div>
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
												onClick={() => setEditingSectionId(section.id)}
											>
												Edit
											</Button>
											<Button
												type="button"
												size="sm"
												onClick={() => handleDeleteSection(section.id)}
												disabled={isDeletingSection}
											>
												Delete
											</Button>
										</div>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
