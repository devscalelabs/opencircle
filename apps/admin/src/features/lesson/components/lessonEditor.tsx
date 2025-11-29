import {
	FloppyDiskIcon,
	ViewIcon,
	ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { LessonCreate, LessonType, LessonUpdate } from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";

interface LessonEditorProps {
	lesson?: Partial<LessonCreate> & { id?: string };
	onSave: (data: LessonCreate | LessonUpdate) => Promise<void>;
	onCancel?: () => void;
	loading?: boolean;
	isEdit?: boolean;
}

export const LessonEditor = ({
	lesson,
	onSave,
	onCancel,
	loading,
	isEdit = false,
}: LessonEditorProps) => {
	const [title, setTitle] = useState(lesson?.title || "");
	const [content, setContent] = useState(lesson?.content || "");
	const [videoUrl, setVideoUrl] = useState(lesson?.video_url || "");
	const [type, setType] = useState<LessonType>(lesson?.type || "text");
	const [showPreview, setShowPreview] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			return;
		}

		if (isEdit && lesson?.id) {
			const updateData: LessonUpdate = {
				title: title.trim(),
				content: content.trim() || undefined,
				video_url: videoUrl.trim() || undefined,
				type,
			};
			await onSave(updateData);
		} else {
			const createData: LessonCreate = {
				title: title.trim(),
				content: content.trim() || undefined,
				video_url: videoUrl.trim() || undefined,
				order: 0,
				type,
				section_id: "", // Will be set by the parent component
			};
			await onSave(createData);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="flex items-center justify-between">
				<h4 className="font-bold text-3xl">
					{isEdit ? "Edit Lesson" : "Create New Lesson"}
				</h4>
				<div className="flex gap-2">
					{onCancel && (
						<Button type="button" onClick={onCancel}>
							Cancel
						</Button>
					)}
					<Button type="submit" disabled={loading || !title.trim()}>
						<HugeiconsIcon icon={FloppyDiskIcon} size={16} className="mr-2" />
						{loading ? "Saving..." : "Save Lesson"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<div>
						<label htmlFor="title" className="mb-2 block font-medium text-sm">
							Title *
						</label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter lesson title..."
							required
						/>
					</div>

					<div>
						<label htmlFor="type" className="mb-2 block font-medium text-sm">
							Lesson Type
						</label>
						<select
							value={type}
							onChange={(e) => setType(e.target.value as LessonType)}
							className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
						>
							<option value="text">Text</option>
							<option value="video">Video</option>
							<option value="quiz">Quiz</option>
							<option value="assignment">Assignment</option>
						</select>
					</div>

					<div>
						<label
							htmlFor="videoUrl"
							className="mb-2 block font-medium text-sm"
						>
							Video URL
						</label>
						<Input
							value={videoUrl}
							onChange={(e) => setVideoUrl(e.target.value)}
							placeholder="Enter video URL..."
						/>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between">
							<label htmlFor="content" className="block font-medium text-sm">
								Content
							</label>
							<Button
								type="button"
								size="sm"
								onClick={() => setShowPreview(!showPreview)}
							>
								{showPreview ? (
									<HugeiconsIcon
										icon={ViewOffSlashIcon}
										size={14}
										className="mr-1"
									/>
								) : (
									<HugeiconsIcon icon={ViewIcon} size={14} className="mr-1" />
								)}
								{showPreview ? "Edit" : "Preview"}
							</Button>
						</div>
						{showPreview ? (
							<div className="prose prose-invert min-h-[400px] max-w-none rounded-lg border border-border p-4">
								<MDEditor.Markdown source={content} />
							</div>
						) : (
							<div data-color-mode="dark">
								<MDEditor
									value={content}
									onChange={(val) => setContent(val || "")}
									height={400}
									preview="edit"
									hideToolbar={false}
									visibleDragbar={false}
								/>
							</div>
						)}
					</div>
				</div>

				<div className="space-y-6">
					{/* Sidebar content can be added here */}
				</div>
			</div>
		</form>
	);
};
