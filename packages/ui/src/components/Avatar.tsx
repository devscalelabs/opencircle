import { Avatar as RawAvatar } from "radix-ui";
import { tv, type VariantProps } from "tailwind-variants";

const avatarStyles = tv({
	base: "bg-foreground text-xs font-semibold text-background w-8 h-8 flex justify-center items-center rounded-lg",
	variants: {
		size: {
			sm: "w-6 h-6",
			md: "w-8 h-8",
			lg: "w-10 h-10",
			xl: "w-24 h-24 text-2xl rounded-2xl",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

interface AvatarProps extends VariantProps<typeof avatarStyles> {
	initials: string;
	image_url: string;
}

export const Avatar = ({ ...props }: AvatarProps) => {
	return (
		<RawAvatar.Root>
			<RawAvatar.Image
				src={props.image_url}
				alt={props.initials}
				className={avatarStyles({ ...props })}
			/>
			<RawAvatar.Fallback className={avatarStyles({ ...props })}>
				{props.initials}
			</RawAvatar.Fallback>
		</RawAvatar.Root>
	);
};
