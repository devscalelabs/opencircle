import {
	AtIcon,
	Comment01Icon,
	FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { NotificationFrequency } from "@opencircle/core";
import { Select, SelectItem } from "@opencircle/ui";
import { useNotificationPreferences } from "../hooks/useNotificationPreferences";

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string }[] = [
	{ value: "immediate", label: "Immediate" },
	{ value: "daily", label: "Daily digest" },
	{ value: "weekly", label: "Weekly digest" },
	{ value: "none", label: "None" },
];

interface PreferenceRowProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	value: NotificationFrequency;
	onChange: (value: NotificationFrequency) => void;
	disabled?: boolean;
}

const PreferenceRow = ({
	icon,
	title,
	description,
	value,
	onChange,
	disabled,
}: PreferenceRowProps) => {
	return (
		<div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background-secondary p-4">
			<div className="flex items-start gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
					{icon}
				</div>
				<div className="space-y-1">
					<div className="font-medium text-foreground text-sm">{title}</div>
					<div className="text-foreground/50 text-xs">{description}</div>
				</div>
			</div>
			<Select
				value={value}
				onValueChange={(val) => onChange(val as NotificationFrequency)}
				disabled={disabled}
			>
				{FREQUENCY_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</Select>
		</div>
	);
};

export const NotificationPreferencesTab = () => {
	const { preferences, isLoading, isError, updatePreference, isUpdating } =
		useNotificationPreferences();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-foreground/50">Loading preferences...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-red-500">Failed to load preferences</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<h3 className="font-medium text-foreground">Email Notifications</h3>
				<p className="text-foreground/50 text-sm">
					Choose how often you want to receive email notifications for different
					activities.
				</p>
			</div>

			<div className="space-y-3">
				<PreferenceRow
					icon={<HugeiconsIcon icon={AtIcon} size={20} />}
					title="Mentions"
					description="When someone mentions you in a post"
					value={preferences?.mention_email || "immediate"}
					onChange={(value) => updatePreference("mention_email", value)}
					disabled={isUpdating}
				/>

				<PreferenceRow
					icon={<HugeiconsIcon icon={Comment01Icon} size={20} />}
					title="Replies"
					description="When someone replies to your post"
					value={preferences?.reply_email || "immediate"}
					onChange={(value) => updatePreference("reply_email", value)}
					disabled={isUpdating}
				/>

				<PreferenceRow
					icon={<HugeiconsIcon icon={FavouriteIcon} size={20} />}
					title="Likes"
					description="When someone likes your post"
					value={preferences?.like_email || "daily"}
					onChange={(value) => updatePreference("like_email", value)}
					disabled={isUpdating}
				/>
			</div>

			<div className="rounded-lg border border-border bg-background-secondary/50 p-4">
				<p className="text-foreground/50 text-xs">
					<strong className="text-foreground">Note:</strong> Daily digests are
					sent at 8:00 AM UTC, and weekly digests are sent on Mondays at 8:00 AM
					UTC.
				</p>
			</div>
		</div>
	);
};
