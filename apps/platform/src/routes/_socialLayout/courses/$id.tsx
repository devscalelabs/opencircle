import { Avatar } from "@opencircle/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../../../components/header";
import { METADATA } from "../../../constants/metadata";
import { CourseDetailSkeleton } from "../../../features/courses/components/courseDetailSkeleton";
import { useCourse } from "../../../features/courses/hooks/useCourse";
import { useCheckEnrollment } from "../../../features/enrollment/hooks/useCheckEnrollment";
import { useEnrollCourse } from "../../../features/enrollment/hooks/useEnrollCourse";
import { getInitials } from "../../../utils/common";

export const Route = createFileRoute("/_socialLayout/courses/$id")({
	head: (): {
		meta: Array<Record<string, any>>;
		links: Array<Record<string, any>>;
	} => {
		return {
			meta: [
				{
					title: "Course - OpenCircle",
				},
				{
					name: "description",
					content: "Check out this course on OpenCircle",
				},
				{
					property: "og:title",
					content: "Course - OpenCircle",
				},
				{
					property: "og:description",
					content: "Check out this course on OpenCircle",
				},
				{
					property: "og:image",
					content: METADATA.ogImage,
				},
			],
			links: [
				{
					rel: "icon",
					href: METADATA.favicon,
				},
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { course, isLoading } = useCourse(id);
	const { isEnrolled, isLoading: isEnrollmentLoading } = useCheckEnrollment(id);
	const { enroll, isPending: isEnrolling } = useEnrollCourse();

	if (isLoading) {
		return <CourseDetailSkeleton />;
	}

	if (!course) return <div>Course not found</div>;

	const handleEnroll = () => {
		enroll(id);
	};

	const initials = getInitials(course.instructor.name);

	return (
		<>
			<Header label="Back" />
			{course.thumbnail_url && (
				<img
					src={course.thumbnail_url}
					alt={course.title}
					className="h-48 w-full border-border border-b object-cover"
				/>
			)}
			<main className="space-y-6 p-4">
				<div className="space-y-4">
					<div className="space-y-2">
						<h1 className="font-bold text-2xl text-foreground">
							{course.title}
						</h1>
						{course.description && (
							<p className="text-foreground/70">{course.description}</p>
						)}
						<div className="flex items-center gap-4 text-foreground/50 text-sm">
							<span className="capitalize">Status: {course.status}</span>
							{course.price !== undefined && (
								<span>{course.price === 0 ? "Free" : `$${course.price}`}</span>
							)}
							<span>{course.sections?.length || 0} sections</span>
							<span>{course.enrollments?.length || 0} enrolled</span>
						</div>
					</div>
				</div>

				<section className="flex items-center gap-2 rounded-lg bg-background/50">
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
							<div className="font-medium group-hover:underline">
								{course.instructor.name || course.instructor.email}
							</div>
							<p className="text-foreground/50 text-xs">Instructor</p>
						</div>
					</Link>
				</section>

				<div className="mt-4">
					{isEnrolled ? (
						<div className="rounded-md border border-border bg-background-secondary p-2 text-center">
							Enrolled
						</div>
					) : (
						<button
							type="button"
							onClick={handleEnroll}
							disabled={isEnrolling || isEnrollmentLoading}
							className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isEnrolling ? "Enrolling..." : "Enroll Now"}
						</button>
					)}
				</div>

				{course.sections && course.sections.length > 0 && (
					<div className="space-y-4">
						<h2 className="font-semibold text-foreground text-lg">
							Course Content
						</h2>
						<div className="space-y-4">
							{course.sections.map((section) => (
								<div key={section.id} className="space-y-3">
									<h3 className="font-medium text-foreground">
										{section.title}
									</h3>
									{section.description && (
										<p className="text-foreground/70 text-sm">
											{section.description}
										</p>
									)}
									<div className="text-foreground/50 text-xs">
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
															className="block space-y-1 rounded-md border border-border bg-background/30 p-3 transition-colors hover:bg-background/50"
														>
															<div className="flex items-center gap-2">
																{lesson.order + 1}. {lesson.title}
															</div>
															{lesson.content && (
																<p className="line-clamp-2 text-foreground/60 text-xs">
																	{lesson.content}
																</p>
															)}
															{lesson.video_url && (
																<div className="text-foreground/50 text-xs">
																	📹 Video lesson
																</div>
															)}
														</Link>
													) : (
														<div className="space-y-1 rounded-md bg-background/30 p-3 opacity-60">
															<div className="flex items-center gap-2">
																<span className="font-medium text-foreground text-sm">
																	{lesson.order + 1}. {lesson.title}
																</span>
																<span className="rounded-full bg-primary/10 px-2 py-1 text-primary text-xs capitalize">
																	{lesson.type}
																</span>
															</div>
															{lesson.content && (
																<p className="line-clamp-2 text-foreground/60 text-xs">
																	{lesson.content}
																</p>
															)}
															{lesson.video_url && (
																<div className="text-foreground/50 text-xs">
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
