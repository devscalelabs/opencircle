import type React from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
	base: "border flex gap-2 justify-center items-center font-medium rounded-md active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed",
	variants: {
		variant: {
			primary: "bg-primary border-primary",
			secondary: "bg-secondary border-foreground/10",
		},
		size: {
			sm: "px-3 py-1 text-xs",
			md: "px-4 py-2 text-sm",
			lg: "px-6 py-3 text-base",
		},
		radius: {
			sm: "rounded-sm",
			md: "rounded-md",
			lg: "rounded-xl",
			xl: "rounded-2xl",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
		radius: "md",
	},
});

type ButtonProps = VariantProps<typeof button> &
	React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = (props: ButtonProps) => {
	return (
		<button
			{...props}
			className={twMerge(button({ ...props }), props.className)}
		>
			{props.children}
		</button>
	);
};
