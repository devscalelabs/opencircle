import { useCheckEnrollment } from "../hooks/useCheckEnrollment";
import { useEnrollCourse } from "../hooks/useEnrollCourse";

interface EnrollButtonProps {
	courseId: string;
	onEnrollSuccess?: () => void;
	onEnrollError?: (error: Error) => void;
}

export const EnrollButton = ({
	courseId,
	onEnrollSuccess,
	onEnrollError,
}: EnrollButtonProps) => {
	const { isEnrolled, isLoading: isEnrollmentLoading } =
		useCheckEnrollment(courseId);
	const { enroll, isPending: isEnrolling } = useEnrollCourse({
		onSuccess: onEnrollSuccess,
		onError: onEnrollError,
	});

	const handleEnroll = () => {
		enroll(courseId);
	};

	if (isEnrollmentLoading) {
		return (
			<div className="w-full rounded-lg bg-gray-100 px-4 py-2 text-center font-medium text-gray-500">
				Checking enrollment...
			</div>
		);
	}

	if (isEnrolled) {
		return (
			<div className="w-full rounded-lg bg-green-100 px-4 py-2 text-center font-medium text-green-800">
				✓ Enrolled
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={handleEnroll}
			disabled={isEnrolling}
			className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{isEnrolling ? "Enrolling..." : "Enroll Now"}
		</button>
	);
};
