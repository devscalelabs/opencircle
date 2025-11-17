import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
} from "@opencircle/ui";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { useAppLinksCreation } from "../hooks/useAppLinksCreation";
import type { AppLinksFormData } from "../utils/types";

interface CreateAppLinkDialogProps {
	children?: React.ReactNode;
}

export const CreateAppLinkDialog = ({ children }: CreateAppLinkDialogProps) => {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState<AppLinksFormData>({
		label: "",
		url: "",
	});
	const { createAppLink, isSubmitting } = useAppLinksCreation();

	const labelId = useId();
	const urlId = useId();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			createAppLink({
				label: formData.label,
				url: formData.url,
			});

			setFormData({ label: "", url: "" });
			setOpen(false);
		} catch (error) {
			console.error("Failed to create app link:", error);
		}
	};

	const handleInputChange = (field: keyof AppLinksFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add App Link
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create App Link</DialogTitle>
					<DialogDescription>
						Add a new app link that will appear in the platform navigation.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label htmlFor={labelId} className="font-medium text-sm">
								Label
							</label>
							<Input
								id={labelId}
								value={formData.label}
								onChange={(e) => handleInputChange("label", e.target.value)}
								placeholder="Enter link label"
								required
							/>
						</div>
						<div className="grid gap-2">
							<label htmlFor={urlId} className="font-medium text-sm">
								URL
							</label>
							<Input
								id={urlId}
								type="url"
								value={formData.url}
								onChange={(e) => handleInputChange("url", e.target.value)}
								placeholder="https://example.com"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="secondary"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create App Link"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
