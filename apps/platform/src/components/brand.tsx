import { ZapIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAppSettings } from "../features/appSettings/hooks/useAppSettings";

interface BrandProps {
	as?: "section" | "div";
	className?: string;
	showAppName?: boolean;
}

export const Brand = ({
	as = "section",
	className = "",
	showAppName = true,
}: BrandProps) => {
	const { appSettings } = useAppSettings();

	const Component = as;

	if (appSettings?.app_logo_url) {
		return (
			<img
				src={appSettings.app_logo_url}
				alt={appSettings.app_name}
				className={className}
			/>
		);
	}

	return (
		<Component className={`flex items-center gap-2 ${className}`}>
			<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-background">
				<HugeiconsIcon icon={ZapIcon} size={12} fill="currentColor" />
			</div>
			{showAppName && <h2 className="font-medium">Opencircle</h2>}
		</Component>
	);
};
