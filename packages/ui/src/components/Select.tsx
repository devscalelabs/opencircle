import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type React from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const selectTrigger = tv({
	base: "flex items-center justify-between gap-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:cursor-not-allowed disabled:opacity-50",
	variants: {
		size: {
			sm: "px-2 py-1 text-xs",
			md: "px-3 py-1.5 text-sm",
			lg: "px-4 py-2 text-base",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const selectContent = tv({
	base: "overflow-hidden rounded-md border border-border bg-background shadow-md",
});

const selectItem = tv({
	base: "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
});

type SelectProps = VariantProps<typeof selectTrigger> & {
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
};

export const Select = ({
	value,
	onValueChange,
	placeholder,
	disabled,
	children,
	size,
	className,
}: SelectProps) => {
	return (
		<SelectPrimitive.Root
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
		>
			<SelectPrimitive.Trigger
				className={twMerge(selectTrigger({ size }), className)}
			>
				<SelectPrimitive.Value placeholder={placeholder} />
				<SelectPrimitive.Icon>
					<ChevronDown className="h-4 w-4 opacity-50" />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>
			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					className={selectContent()}
					position="popper"
					sideOffset={4}
				>
					<SelectPrimitive.Viewport className="p-1">
						{children}
					</SelectPrimitive.Viewport>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
};

type SelectItemProps = {
	value: string;
	children: React.ReactNode;
	className?: string;
};

export const SelectItem = ({ value, children, className }: SelectItemProps) => {
	return (
		<SelectPrimitive.Item
			value={value}
			className={twMerge(selectItem(), className)}
		>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator className="absolute right-2">
				<Check className="h-4 w-4" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
};
