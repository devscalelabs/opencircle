import { Avatar } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../../../components/header";
import { useCourse } from "../../../features/courses/hooks/useCourse";
import { useCheckEnrollment } from "../../../features/enrollment/hooks/useCheckEnrollment";
import { useEnrollCourse } from "../../../features/enrollment/hooks/useEnrollCourse";
import { getInitials } from "../../../utils/common";

export const Route = createFileRoute("/_socialLayout/courses/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { course, isLoading } = useCourse(id);
	const { isEnrolled, isLoading: isEnrollmentLoading } = useCheckEnrollment(id);
	const { enroll, isPending: isEnrolling } = useEnrollCourse();

	if (isLoading) return <div>Loading...</div>;

	if (!course) return <div>Course not found</div>;

	const handleEnroll = () => {
		enroll(id);
	};

	const initials = getInitials(course.instructor.name);

	return (
		<>
			<Header label="Back" />
			<main className="p-4 space-y-6">
				<div className="space-y-4">
					{course.thumbnail_url && (
						<img
							src={course.thumbnail_url}
							alt={course.title}
							className="w-full h-48 object-cover rounded-lg"
						/>
					)}
					<div className="space-y-2">
						<h1 className="text-2xl font-bold text-foreground">
							{course.title}
						</h1>
						{course.description && (
							<p className="text-foreground/70">{course.description}</p>
						)}
						<div className="flex items-center gap-4 text-sm text-foreground/50">
							<span className="capitalize">Status: {course.status}</span>
							{course.price !== undefined && (
								<span>{course.price === 0 ? "Free" : `$${course.price}`}</span>
							)}
							<span>{course.sections?.length || 0} sections</span>
							<span>{course.enrollments?.length || 0} enrolled</span>
						</div>

						<div className="mt-4">
							{isEnrolled ? (
								<div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-medium">
									✓ Enrolled
								</div>
							) : (
								<button
									type="button"
									onClick={handleEnroll}
									disabled={isEnrolling || isEnrollmentLoading}
									className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{isEnrolling ? "Enrolling..." : "Enroll Now"}
								</button>
							)}
						</div>
					</div>
				</div>

				<section className="flex gap-2 items-center p-4 bg-background/50 rounded-lg">
					<Avatar
						initials={initials}
						image_url={course.instructor.avatar_url || ""}
					/>
					<Link
						to="/$username"
						params={{ username: course.instructor.username }}
						className="group"
					>
						<div className="space-y-0.5">
							<div className="group-hover:underline font-medium">
								{course.instructor.name || course.instructor.email}
							</div>
							<p className="text-foreground/50 text-xs">Instructor</p>
						</div>
					</Link>
				</section>

				{course.sections && course.sections.length > 0 && (
					<div className="space-y-4">
						<h2 className="text-lg font-semibold text-foreground">
							Course Content
						</h2>
						<div className="space-y-4">
							{course.sections.map((section) => (
								<div
									key={section.id}
									className="p-4 bg-background/50 rounded-lg space-y-3 border border-border"
								>
									<h3 className="font-medium text-foreground">
										{section.title}
									</h3>
									{section.description && (
										<p className="text-sm text-foreground/70">
											{section.description}
										</p>
									)}
									<div className="text-xs text-foreground/50">
										{section.lessons?.length || 0} lesson
										{(section.lessons?.length || 0) !== 1 ? "s" : ""}
									</div>
									{section.lessons && section.lessons.length > 0 && (
										<div className="space-y-2">
											{section.lessons.map((lesson) => (
												<div key={lesson.id}>
													{isEnrolled ? (
														<Link
															to="/lessons/$id"
															params={{ id: lesson.id }}
															className="border border-border block p-3 bg-background/30 rounded-md space-y-1 hover:bg-background/50 transition-colors"
														>
															<div className="flex items-center gap-2">
																{lesson.order + 1}. {lesson.title}
															</div>
															{lesson.content && (
																<p className="text-xs text-foreground/60 line-clamp-2">
																	{lesson.content}
																</p>
															)}
															{lesson.video_url && (
																<div className="text-xs text-foreground/50">
																	📹 Video lesson
																</div>
															)}
														</Link>
													) : (
														<div className="p-3 bg-background/30 rounded-md space-y-1 opacity-60">
															<div className="flex items-center gap-2">
																<span className="text-sm font-medium text-foreground">
																	{lesson.order}. {lesson.title}
																</span>
																<span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
																	{lesson.type}
																</span>
															</div>
															{lesson.content && (
																<p className="text-xs text-foreground/60 line-clamp-2">
																	{lesson.content}
																</p>
															)}
															{lesson.video_url && (
																<div className="text-xs text-foreground/50">
																	📹 Video lesson
																</div>
															)}
														</div>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</main>
		</>
	);
}
