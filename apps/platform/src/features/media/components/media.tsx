import type { Media } from "@opencircle/core";
import { Dialog, DialogContent } from "@opencircle/ui";
import { useState } from "react";

interface MediaGalleryProps {
	media: Media[];
}

export const MediaGallery = ({ media }: MediaGalleryProps) => {
	const [showedMediaUrl, setShowedMediaUrl] = useState<string | null>(null);

	if (media.length === 0) return null;

	// Determine grid layout based on media count
	const getGridClass = () => {
		if (media.length === 1) return "grid-cols-1";
		return "grid-cols-2";
	};

	return (
		<>
			<Dialog
				open={showedMediaUrl !== null}
				onOpenChange={() => setShowedMediaUrl(null)}
			>
				<DialogContent className="max-w-4xl">
					<img
						src={showedMediaUrl || ""}
						alt="Media"
						className="h-full w-full rounded-lg object-contain"
					/>
				</DialogContent>
			</Dialog>
			<section className={`grid ${getGridClass()} gap-2`}>
				{media.map((mediaItem, index) => (
					<button
						key={mediaItem.id}
						type="button"
						onClick={() => setShowedMediaUrl(mediaItem.url)}
						className={media.length === 3 && index === 0 ? "col-span-2" : ""}
					>
						<img
							src={mediaItem.url}
							alt={`Post media ${mediaItem.id}`}
							className="rounded"
						/>
					</button>
				))}
			</section>
		</>
	);
};
