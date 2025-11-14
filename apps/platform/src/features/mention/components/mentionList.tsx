import type { User } from "@opencircle/core";
import { Avatar } from "@opencircle/ui";
import { Check } from "lucide-react";
import { getInitials } from "../../../utils/common";

interface MentionListProps {
	users: User[];
	onSelect: (user: User) => void;
	selectedIndex: number;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	cursorPosition: number;
}

export const MentionList = ({
	users,
	onSelect,
	selectedIndex,
	textareaRef,
	cursorPosition,
}: MentionListProps) => {
	if (users.length === 0) return null;

	// Calculate position relative to textarea
	const getPosition = () => {
		if (!textareaRef.current) return { top: 0, left: 0 };

		const textarea = textareaRef.current;
		const text = textarea.value.substring(0, cursorPosition);
		const lines = text.split("\n");
		const currentLine = lines.length - 1;
		const currentLineText = lines[currentLine];

		// Create a hidden div to measure text width
		const measuringDiv = document.createElement("div");
		const computedStyle = window.getComputedStyle(textarea);
		measuringDiv.style.position = "absolute";
		measuringDiv.style.visibility = "hidden";
		measuringDiv.style.whiteSpace = "pre";
		measuringDiv.style.font = computedStyle.font;
		measuringDiv.style.letterSpacing = computedStyle.letterSpacing;
		measuringDiv.style.textTransform = computedStyle.textTransform;
		measuringDiv.textContent = currentLineText;
		document.body.appendChild(measuringDiv);

		const textWidth = measuringDiv.offsetWidth;
		document.body.removeChild(measuringDiv);

		const rect = textarea.getBoundingClientRect();
		const lineHeight = parseInt(computedStyle.lineHeight, 10) || 24;
		const scrollTop = textarea.scrollTop;
		const scrollLeft = textarea.scrollLeft;

		return {
			top:
				rect.top +
				window.scrollY +
				(currentLine + 1) * lineHeight -
				scrollTop +
				5,
			left: rect.left + window.scrollX + textWidth - scrollLeft,
		};
	};

	const position = getPosition();

	return (
		<div
			className="fixed z-50 max-h-48 min-w-[250px] overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
			}}
		>
			{users.map((user, index) => (
				<button
					key={user.id}
					type="button"
					onClick={() => onSelect(user)}
					className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted ${
						index === selectedIndex ? "bg-muted" : ""
					}`}
				>
					<Avatar
						image_url={user.avatar_url || ""}
						initials={getInitials(user.name)}
					/>
					<div className="flex-1">
						<div className="font-medium text-sm">{user.name}</div>
						<div className="text-muted-foreground text-xs">
							@{user.username}
						</div>
					</div>
					{index === selectedIndex && (
						<Check size={16} className="text-muted-foreground" />
					)}
				</button>
			))}
		</div>
	);
};
