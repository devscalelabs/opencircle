import type React from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const badge = tv({
	base: "inline-flex items-center justify-center font-medium transition-colors",
	variants: {
		variant: {
			primary: "bg-primary text-primary-foreground",
			secondary: "bg-secondary text-secondary-foreground",
			destructive: "bg-destructive text-destructive-foreground",
			outline:
				"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
		},
		size: {
			sm: "px-2 py-0.5 text-xs",
			md: "px-2.5 py-0.5 text-sm",
			lg: "px-3 py-1 text-base",
		},
		radius: {
			sm: "rounded-sm",
			md: "rounded-md",
			lg: "rounded-lg",
			full: "rounded-full",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
		radius: "full",
	},
});

type BadgeProps = VariantProps<typeof badge> &
	React.HTMLAttributes<HTMLSpanElement>;

export const Badge = (props: BadgeProps) => {
	return (
		<span {...props} className={twMerge(badge({ ...props }), props.className)}>
			{props.children}
		</span>
	);
};
