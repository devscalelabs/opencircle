import { useRouter } from "@tanstack/react-router";

interface HeaderProps {
	label: string;
}

export const Header = ({ label }: HeaderProps) => {
	const router = useRouter();

	if (label === "Back") {
		return (
			<div className="sticky top-0 z-10 flex h-14 flex-col justify-center border-border border-b bg-background px-4 font-medium text-sm">
				<button
					type="button"
					onClick={() => router.history.back()}
					className="text-left"
				>
					Back
				</button>
			</div>
		);
	}

	return (
		<div className="sticky top-0 z-10 flex h-14 flex-col justify-center border-border border-b bg-background px-4 font-medium text-sm">
			{label}
		</div>
	);
};
