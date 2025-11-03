import type {
	LessonCreate,
	LessonUpdate,
	SectionCreate,
	SectionUpdate,
} from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import { useRouter } from "@tanstack/react-router";
import { Edit2, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useLessons } from "../../../features/lesson/hooks/useLessons";
import { LessonEditor } from "../../lesson/components/lessonEditor";

interface SectionEditorProps {
	section?: Partial<SectionCreate> & { id?: string };
	courseId: string;
	onSave: (data: SectionCreate | SectionUpdate) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
	onCancel?: () => void;
	loading?: boolean;
	isEdit?: boolean;
}

export const SectionEditor = ({
	section,
	courseId,
	onSave,
	onCancel,
	loading,
	isEdit = false,
}: SectionEditorProps) => {
	const [title, setTitle] = useState(section?.title || "");
	const [description, setDescription] = useState(section?.description || "");
	const [order, setOrder] = useState(section?.order?.toString() || "0");
	const [isExpanded, setIsExpanded] = useState(!isEdit);
	const [showLessonForm, setShowLessonForm] = useState(false);
	const router = useRouter();

	const {
		lessons,
		isLessonsLoading,
		createLesson,
		deleteLesson,
		isCreatingLesson,
		isDeletingLesson,
	} = useLessons(section?.id || "");

	const handleSubmit = async () => {
		if (!title.trim()) {
			return;
		}

		try {
			if (isEdit && section?.id) {
				const updateData: SectionUpdate = {
					title: title.trim(),
					description: description.trim() || undefined,
					order: parseInt(order, 10) || 0,
				};
				await onSave(updateData);
			} else {
				const createData: SectionCreate = {
					title: title.trim(),
					description: description.trim() || undefined,
					order: parseInt(order, 10) || 0,
					course_id: courseId,
				};
				await onSave(createData);
			}
		} catch (error) {
			console.error("Error during form submission:", error);
		}
	};

	const handleCreateLesson = async (
		lessonData: LessonCreate | LessonUpdate,
	) => {
		if (!section?.id) return;

		const lessonCreateData: LessonCreate = {
			...lessonData,
			order: lessons.length,
			section_id: section.id,
		} as LessonCreate;

		await createLesson(lessonCreateData);
		setShowLessonForm(false);
	};

	const handleDeleteLesson = async (lessonId: string) => {
		await deleteLesson(lessonId);
	};

	if (isEdit) {
		return (
			<div className="space-y-4 rounded-lg border border-border p-6">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<GripVertical className="h-5 w-5 cursor-move text-muted-foreground" />
							<h3 className="font-semibold text-lg">Section Editor</h3>
						</div>
						<div className="flex gap-2">
							{onCancel && (
								<Button type="button" onClick={onCancel}>
									<X size={16} className="mr-2" />
									Cancel
								</Button>
							)}
							<Button
								type="button"
								onClick={handleSubmit}
								disabled={loading || !title.trim()}
							>
								<Save size={16} className="mr-2" />
								{loading ? "Saving..." : "Save"}
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label htmlFor="title" className="mb-2 block font-medium text-sm">
								Title *
							</label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter section title..."
								required
							/>
						</div>

						<div>
							<label htmlFor="order" className="mb-2 block font-medium text-sm">
								Order
							</label>
							<Input
								type="number"
								value={order}
								onChange={(e) => setOrder(e.target.value)}
								placeholder="0"
								min="0"
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="description"
							className="mb-2 block font-medium text-sm"
						>
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Enter section description..."
							rows={3}
							className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				</div>

				{section?.id && (
					<div className="border-t pt-4">
						<div className="mb-4 flex items-center justify-between">
							<h4 className="font-medium">Lessons</h4>
							<Button
								type="button"
								size="sm"
								onClick={() => setShowLessonForm(true)}
							>
								<Plus size={14} className="mr-2" />
								Add Lesson
							</Button>
						</div>

						{showLessonForm && (
							<div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
								<LessonEditor
									onSave={handleCreateLesson}
									onCancel={() => setShowLessonForm(false)}
									loading={isCreatingLesson}
								/>
							</div>
						)}

						{isLessonsLoading ? (
							<div className="py-4 text-center text-muted-foreground">
								Loading lessons...
							</div>
						) : lessons.length === 0 ? (
							<div className="rounded-lg border-2 border-border border-dashed py-8 text-center text-muted-foreground">
								No lessons yet. Click "Add Lesson" to create your first lesson.
							</div>
						) : (
							<div className="space-y-2">
								{lessons.map((lesson) => (
									<div
										key={lesson.id}
										className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
									>
										<div className="flex items-center gap-3">
											<GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
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
														to: `/courses/lessons/edit/${lesson.id}`,
													})
												}
											>
												<Edit2 size={14} />
											</Button>
											<Button
												type="button"
												size="sm"
												onClick={() => handleDeleteLesson(lesson.id)}
												disabled={isDeletingLesson}
											>
												<Trash2 size={14} />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-lg border border-border">
			<div
				className="cursor-pointer bg-muted/30 p-4 transition-colors hover:bg-muted/50"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<GripVertical className="h-5 w-5 text-muted-foreground" />
						<h3 className="font-medium">{title || "New Section"}</h3>
						{description && (
							<p className="line-clamp-1 text-muted-foreground text-sm">
								{description}
							</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						{section?.id && (
							<span className="text-muted-foreground text-sm">
								{lessons.length} lessons
							</span>
						)}
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
						>
							<title>Title</title>
							<path
								d="M4 6L8 10L12 6"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>
			</div>

			{isExpanded && (
				<div className="border-border border-t p-4">
					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label
									htmlFor="title"
									className="mb-2 block font-medium text-sm"
								>
									Title *
								</label>
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Enter section title..."
									required
								/>
							</div>

							<div>
								<label
									htmlFor="order"
									className="mb-2 block font-medium text-sm"
								>
									Order
								</label>
								<Input
									type="number"
									value={order}
									onChange={(e) => setOrder(e.target.value)}
									placeholder="0"
									min="0"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="description"
								className="mb-2 block font-medium text-sm"
							>
								Description
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Enter section description..."
								rows={3}
								className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div className="flex gap-2">
							{onCancel && (
								<Button type="button" onClick={onCancel}>
									<X size={16} className="mr-2" />
									Cancel
								</Button>
							)}
							<Button
								type="button"
								onClick={handleSubmit}
								disabled={loading || !title.trim()}
							>
								<Save size={16} className="mr-2" />
								{loading ? "Saving..." : "Save Section"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
