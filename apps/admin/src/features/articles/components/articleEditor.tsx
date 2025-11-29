import {
	FloppyDiskIcon,
	ViewIcon,
	ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input } from "@opencircle/ui";
import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import type {
	CreateArticleRequest,
	UpdateArticleRequest,
} from "../utils/types";

interface ArticleEditorProps {
	article?: Partial<CreateArticleRequest> & { id?: string };
	onSave: (data: CreateArticleRequest | UpdateArticleRequest) => Promise<void>;
	onCancel?: () => void;
	loading?: boolean;
	isEdit?: boolean;
}

export const ArticleEditor = ({
	article,
	onSave,
	onCancel,
	loading,
	isEdit = false,
}: ArticleEditorProps) => {
	const [title, setTitle] = useState(article?.title || "");
	const [content, setContent] = useState(article?.content || "");
	const [showPreview, setShowPreview] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim() || !content.trim()) {
			return;
		}

		if (isEdit && article?.id) {
			const updateData: UpdateArticleRequest = {
				id: article.id,
				title: title.trim(),
				content: content.trim(),
			};
			onSave(updateData);
		} else {
			const createData: CreateArticleRequest = {
				title: title.trim(),
				content: content.trim(),
				user_id: "", // Will be set in the route component
			};
			onSave(createData);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">
					{isEdit ? "Edit Article" : "Create New Article"}
				</h1>
				<div className="flex gap-2">
					{onCancel && (
						<Button type="button" onClick={onCancel}>
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						disabled={loading || !title.trim() || !content.trim()}
					>
						<HugeiconsIcon icon={FloppyDiskIcon} size={16} className="mr-2" />
						{loading ? "Saving..." : "Save"}
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
							placeholder="Enter article title..."
							required
						/>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between">
							<label htmlFor="content" className="block font-medium text-sm">
								Content *
							</label>
							<Button
								type="button"
								size="sm"
								onClick={() => setShowPreview(!showPreview)}
							>
								{showPreview ? (
									<HugeiconsIcon
										icon={ViewOffIcon}
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
			</div>
		</form>
	);
};
