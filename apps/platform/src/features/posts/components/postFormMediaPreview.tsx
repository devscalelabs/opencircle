import { X } from "lucide-react";

interface PostFormMediaPreviewProps {
	files: File[];
	previewUrls: string[];
	onRemoveFile: (index: number) => void;
}

export const PostFormMediaPreview = ({
	files,
	previewUrls,
	onRemoveFile,
}: PostFormMediaPreviewProps) => {
	if (files.length === 0) return null;

	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
			{files.map((file, index) => (
				<div
					key={`file-${file.name}-${index}`}
					className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
				>
					<img
						src={previewUrls[index]}
						alt={file.name}
						className="h-full w-full object-cover"
					/>
					<button
						type="button"
						onClick={() => onRemoveFile(index)}
						className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-background group-hover:opacity-100"
					>
						<X size={14} />
					</button>
				</div>
			))}
		</div>
	);
};
