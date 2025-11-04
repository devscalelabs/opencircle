import type { RefObject } from "react";
import { useEffect } from "react";

export const useAutoResizeTextarea = (
	ref: RefObject<HTMLTextAreaElement | null>,
	maxRows = 7,
) => {
	useEffect(() => {
		const textarea = ref.current;
		if (!textarea) return;

		const resize = () => {
			textarea.style.height = "auto";
			const lineHeight = parseFloat(
				window.getComputedStyle(textarea).lineHeight,
			);
			const maxHeight = lineHeight * maxRows;
			const newHeight = Math.min(textarea.scrollHeight, maxHeight);
			textarea.style.height = `${newHeight}px`;
		};

		textarea.addEventListener("input", resize);
		resize();

		return () => textarea.removeEventListener("input", resize);
	}, [ref, maxRows]);
};
