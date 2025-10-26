import type React from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const input = tv({
	base: "w-full block border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all",
	variants: {
		size: {
			sm: "px-2 py-1 text-xs",
			md: "px-3 py-2 text-sm",
			lg: "px-4 py-3 text-base",
		},
		variant: {
			outline: "border-border bg-background",
			filled: "border-border bg-gray-50",
		},
	},
	defaultVariants: {
		size: "md",
		variant: "outline",
	},
});

type InputProps = VariantProps<typeof input> &
	React.InputHTMLAttributes<HTMLInputElement>;

export const Input = (props: InputProps) => {
	return (
		<input
			{...props}
			className={twMerge(input({ ...props }), props.className)}
		/>
	);
};
