import type {
	CourseCreate,
	CourseStatus,
	CourseUpdate,
} from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import { Save } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useId, useState } from "react";
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
	const titleId = useId();
	const descriptionId = useId();
	const thumbnailUrlId = useId();
	const statusId = useId();
	const priceId = useId();

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
		<div className="mx-auto max-w-7xl">
			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Header Section */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">
							{isEdit ? "Edit Course" : "Create New Course"}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							{isEdit
								? "Update your course details and content"
								: "Fill in the details to create a new course"}
						</p>
					</div>
					<div className="flex gap-3">
						{onCancel && (
							<Button
								type="button"
								onClick={onCancel}
								variant="secondary"
								className="min-w-[100px]"
							>
								Cancel
							</Button>
						)}
						<Button
							type="submit"
							disabled={loading || !title.trim()}
							className="min-w-[100px]"
						>
							<Save size={16} className="mr-2" />
							{loading ? "Saving..." : "Save Course"}
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					{/* Main Content Section */}
					<div className="space-y-6 lg:col-span-2">
						{/* Basic Information Card */}
						<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
							<h2 className="mb-6 font-semibold text-lg">Basic Information</h2>
							<div className="space-y-5">
								<div>
									<label
										htmlFor={titleId}
										className="mb-2 block font-medium text-sm"
									>
										Course Title <span className="text-destructive">*</span>
									</label>
									<Input
										id={titleId}
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="e.g., Introduction to Web Development"
										required
										className="h-11"
									/>
								</div>

								<div>
									<label
										htmlFor={descriptionId}
										className="mb-2 block font-medium text-sm"
									>
										Description
									</label>
									<textarea
										id={descriptionId}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Provide a detailed description of what students will learn..."
										rows={5}
										className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-foreground text-sm transition-colors placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
									/>
									<p className="mt-1.5 text-foreground/50 text-xs">
										A compelling description helps students understand the value
										of your course
									</p>
								</div>

								<div>
									<label
										htmlFor={thumbnailUrlId}
										className="mb-2 block font-medium text-sm"
									>
										Thumbnail Image URL
									</label>
									<Input
										id={thumbnailUrlId}
										value={thumbnailUrl}
										onChange={(e) => setThumbnailUrl(e.target.value)}
										placeholder="https://example.com/image.jpg"
										className="h-11"
									/>
									<p className="mt-1.5 text-foreground/50 text-xs">
										Recommended size: 1280x720px (16:9 aspect ratio)
									</p>
								</div>
							</div>
						</div>

						{/* Settings Card */}
						<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
							<h2 className="mb-6 font-semibold text-lg">Course Settings</h2>
							<div className="space-y-5">
								<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
									<div>
										<label
											htmlFor={statusId}
											className="mb-2 block font-medium text-sm"
										>
											Status
										</label>
										<DropdownMenu.Root>
											<DropdownMenu.Trigger asChild>
												<button
													type="button"
													className="flex h-11 w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
												>
													<span className="capitalize">{status}</span>
													<svg
														width="14"
														height="14"
														viewBox="0 0 12 12"
														fill="none"
														className="opacity-50"
													>
														<title>Select status</title>
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
													className="cursor-pointer px-4 py-2.5 text-sm capitalize transition-colors focus-within:outline-none hover:bg-accent"
													onClick={() => setStatus("draft")}
												>
													Draft
												</DropdownMenu.Item>
												<DropdownMenu.Item
													className="cursor-pointer px-4 py-2.5 text-sm capitalize transition-colors focus-within:outline-none hover:bg-accent"
													onClick={() => setStatus("published")}
												>
													Published
												</DropdownMenu.Item>
												<DropdownMenu.Item
													className="cursor-pointer px-4 py-2.5 text-sm capitalize transition-colors focus-within:outline-none hover:bg-accent"
													onClick={() => setStatus("archived")}
												>
													Archived
												</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</div>

									<div>
										<label
											htmlFor={priceId}
											className="mb-2 block font-medium text-sm"
										>
											Price (USD)
										</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground text-sm">
												$
											</span>
											<Input
												id={priceId}
												type="number"
												step="0.01"
												min="0"
												value={price}
												onChange={(e) => setPrice(e.target.value)}
												placeholder="0.00"
												className="h-11 pl-7"
											/>
										</div>
									</div>
								</div>

								<div className="rounded-lg border border-border bg-muted/30 p-4">
									<label className="flex cursor-pointer items-start gap-3">
										<input
											type="checkbox"
											checked={isFeatured}
											onChange={(e) => setIsFeatured(e.target.checked)}
											className="mt-0.5 h-5 w-5 rounded border-input text-primary transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
										/>
										<div className="flex-1">
											<span className="font-medium text-sm">
												Feature this course
											</span>
											<p className="mt-0.5 text-foreground/50 text-xs">
												Featured courses appear prominently on the homepage and
												get more visibility
											</p>
										</div>
									</label>
								</div>
							</div>
						</div>
					</div>

					{/* Preview Sidebar */}
					<div className="lg:col-span-1">
						<div className="sticky top-6 space-y-6">
							<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="font-semibold text-base">Live Preview</h3>
									<span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary text-xs">
										Preview
									</span>
								</div>
								<div className="space-y-4">
									<div className="overflow-hidden rounded-lg border border-border bg-muted/30">
										{thumbnailUrl ? (
											<img
												src={thumbnailUrl}
												alt="Course thumbnail preview"
												className="aspect-video h-30 w-full object-cover"
												onError={(e) => {
													e.currentTarget.src =
														"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23f3f4f6' width='400' height='225'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
												}}
											/>
										) : (
											<div className="flex aspect-video w-full items-center justify-center bg-muted/50">
												<div className="text-center">
													<svg
														className="mx-auto h-12 w-12 text-muted-foreground/40"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<title>Image placeholder</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={1.5}
															d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
														/>
													</svg>
													<p className="mt-2 text-muted-foreground text-xs">
														No thumbnail
													</p>
												</div>
											</div>
										)}
									</div>

									<div>
										<h4 className="line-clamp-2 font-semibold text-base leading-tight">
											{title || "Untitled Course"}
										</h4>
										{description && (
											<p className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
												{description}
											</p>
										)}
									</div>

									<div className="flex flex-wrap items-center gap-2 border-border border-t pt-4">
										<span
											className={`inline-flex items-center rounded-full px-3 py-1 font-medium text-xs ${
												status === "published"
													? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
													: status === "draft"
														? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
														: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
											}`}
										>
											{status}
										</span>
										{isFeatured && (
											<span className="inline-flex items-center rounded-full bg-primary px-3 py-1 font-medium text-foreground text-xs">
												Featured
											</span>
										)}
										<span className="ml-auto font-semibold text-base">
											{price ? `$${price}` : "Free"}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</form>

			{/* Course Content Section */}
			{course?.id && (
				<div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
					<CourseContentManager courseId={course.id} />
				</div>
			)}
		</div>
	);
};
