import type { LessonCreate, LessonType, LessonUpdate } from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import MDEditor from "@uiw/react-md-editor";
import { Eye, EyeOff, Save } from "lucide-react";
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
	const [order, setOrder] = useState(lesson?.order?.toString() || "0");
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
				order: parseInt(order, 10) || 0,
				type,
			};
			await onSave(updateData);
		} else {
			const createData: LessonCreate = {
				title: title.trim(),
				content: content.trim() || undefined,
				video_url: videoUrl.trim() || undefined,
				order: parseInt(order, 10) || 0,
				type,
				section_id: "", // Will be set by the parent component
			};
			await onSave(createData);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="flex justify-between items-center">
				<h4 className="text-3xl font-bold">
					{isEdit ? "Edit Lesson" : "Create New Lesson"}
				</h4>
				<div className="flex gap-2">
					{onCancel && (
						<Button type="button" onClick={onCancel}>
							Cancel
						</Button>
					)}
					<Button type="submit" disabled={loading || !title.trim()}>
						<Save size={16} className="mr-2" />
						{loading ? "Saving..." : "Save Lesson"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<div>
						<label htmlFor="title" className="block text-sm font-medium mb-2">
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
						<label htmlFor="type" className="block text-sm font-medium mb-2">
							Lesson Type
						</label>
						<select
							value={type}
							onChange={(e) => setType(e.target.value as LessonType)}
							className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
							className="block text-sm font-medium mb-2"
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
						<div className="flex justify-between items-center mb-2">
							<label htmlFor="content" className="block text-sm font-medium">
								Content
							</label>
							<Button
								type="button"
								size="sm"
								onClick={() => setShowPreview(!showPreview)}
							>
								{showPreview ? (
									<EyeOff size={14} className="mr-1" />
								) : (
									<Eye size={14} className="mr-1" />
								)}
								{showPreview ? "Edit" : "Preview"}
							</Button>
						</div>
						{showPreview ? (
							<div className="border border-border rounded-lg p-4 min-h-[400px] prose prose-invert max-w-none">
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
					{!isEdit && (
						<div>
							<label htmlFor="order" className="block text-sm font-medium mb-2">
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
					)}
				</div>
			</div>
		</form>
	);
};
