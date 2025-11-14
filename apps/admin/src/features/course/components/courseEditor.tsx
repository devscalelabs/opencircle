import type {
	CourseCreate,
	CourseStatus,
	CourseUpdate,
} from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import { Save } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useState } from "react";
import { CourseContentManager } from "./courseContentManager";

interface CourseEditorProps {
	course?: Partial<CourseCreate> & { id?: string };
	onSave: (data: CourseCreate | CourseUpdate) => Promise<void>;
	onCancel?: () => void;
	loading?: boolean;
	isEdit?: boolean;
}

export const CourseEditor = ({
	course,
	onSave,
	onCancel,
	loading,
	isEdit = false,
}: CourseEditorProps) => {
	const [title, setTitle] = useState(course?.title || "");
	const [description, setDescription] = useState(course?.description || "");
	const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url || "");
	const [status, setStatus] = useState<CourseStatus>(course?.status || "draft");
	const [price, setPrice] = useState(course?.price?.toString() || "");
	const [isFeatured, setIsFeatured] = useState(course?.is_featured || false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			return;
		}

		if (isEdit && course?.id) {
			const updateData: CourseUpdate = {
				title: title.trim(),
				description: description.trim() || undefined,
				thumbnail_url: thumbnailUrl.trim() || undefined,
				status,
				price: price ? parseFloat(price) : undefined,
				is_featured: isFeatured,
			};
			onSave(updateData);
		} else {
			const createData: CourseCreate = {
				title: title.trim(),
				description: description.trim() || undefined,
				thumbnail_url: thumbnailUrl.trim() || undefined,
				status,
				instructor_id: "", // Will be set in the route component
				price: price ? parseFloat(price) : undefined,
				is_featured: isFeatured,
			};
			onSave(createData);
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="font-bold text-3xl">
						{isEdit ? "Edit Course" : "Create New Course"}
					</h1>
					<div className="flex gap-2">
						{onCancel && (
							<Button type="button" onClick={onCancel}>
								Cancel
							</Button>
						)}
						<Button type="submit" disabled={loading || !title.trim()}>
							<Save size={16} className="mr-2" />
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
								placeholder="Enter course title..."
								required
							/>
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
								placeholder="Enter course description..."
								rows={4}
								className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div>
							<label
								htmlFor="thumbnailUrl"
								className="mb-2 block font-medium text-sm"
							>
								Thumbnail URL
							</label>
							<Input
								value={thumbnailUrl}
								onChange={(e) => setThumbnailUrl(e.target.value)}
								placeholder="Enter thumbnail URL..."
							/>
						</div>

						<div>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={isFeatured}
									onChange={(e) => setIsFeatured(e.target.checked)}
									className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
								/>
								<span className="font-medium text-sm">Featured Course</span>
							</label>
							<p className="mt-1 text-muted-foreground text-xs">
								Show this course in the featured section
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="status"
									className="mb-2 block font-medium text-sm"
								>
									Status
								</label>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger asChild>
										<button
											type="button"
											className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
										>
											<span className="capitalize">{status}</span>
											<svg
												width="12"
												height="12"
												viewBox="0 0 12 12"
												fill="none"
											>
												<title>test</title>
												<path
													d="M3 4.5L6 7.5L9 4.5"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content
										sideOffset={5}
										align="start"
										className="z-50 min-w-[200px] overflow-hidden rounded-lg border border-border bg-background shadow-lg"
									>
										<DropdownMenu.Item
											className="cursor-pointer px-3 py-2 text-sm capitalize focus-within:outline-none hover:bg-muted"
											onClick={() => setStatus("draft")}
										>
											Draft
										</DropdownMenu.Item>
										<DropdownMenu.Item
											className="cursor-pointer px-3 py-2 text-sm capitalize focus-within:outline-none hover:bg-muted"
											onClick={() => setStatus("published")}
										>
											Published
										</DropdownMenu.Item>
										<DropdownMenu.Item
											className="cursor-pointer px-3 py-2 text-sm capitalize focus-within:outline-none hover:bg-muted"
											onClick={() => setStatus("archived")}
										>
											Archived
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>

							<div>
								<label
									htmlFor="price"
									className="mb-2 block font-medium text-sm"
								>
									Price ($)
								</label>
								<Input
									type="number"
									step="0.01"
									min="0"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									placeholder="0.00"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<div className="rounded-lg bg-muted/50 p-6">
							<h3 className="mb-4 font-medium">Course Preview</h3>
							<div className="space-y-3">
								{thumbnailUrl && (
									<img
										src={thumbnailUrl}
										alt="Course thumbnail"
										className="h-32 w-full rounded-md object-cover"
										onError={(e) => {
											e.currentTarget.style.display = "none";
										}}
									/>
								)}
								<h4 className="font-semibold text-lg">
									{title || "Course Title"}
								</h4>
								{description && (
									<p className="line-clamp-3 text-muted-foreground text-sm">
										{description}
									</p>
								)}
								<div className="flex items-center justify-between pt-2">
									<div className="flex items-center gap-2">
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
												status === "published"
													? "bg-green-100 text-green-800"
													: status === "draft"
														? "bg-yellow-100 text-yellow-800"
														: "bg-gray-100 text-gray-800"
											}`}
										>
											{status}
										</span>
										{isFeatured && (
											<span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs">
												⭐ Featured
											</span>
										)}
									</div>
									<span className="font-medium">
										{price ? `$${price}` : "Free"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</form>
			{course?.id && (
				<div className="mt-6 border-t pt-6">
					<CourseContentManager courseId={course.id} />
				</div>
			)}
		</>
	);
};
