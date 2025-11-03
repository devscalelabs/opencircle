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
			<div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-center font-medium">
				Checking enrollment...
			</div>
		);
	}

	if (isEnrolled) {
		return (
			<div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-medium">
				✓ Enrolled
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={handleEnroll}
			disabled={isEnrolling}
			className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			{isEnrolling ? "Enrolling..." : "Enroll Now"}
		</button>
	);
};
