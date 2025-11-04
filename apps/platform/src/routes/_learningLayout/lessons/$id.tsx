import { createFileRoute, Link } from "@tanstack/react-router";
import MDEditor from "@uiw/react-md-editor";
import { ArrowLeft, Zap } from "lucide-react";
import { METADATA } from "../../../constants/metadata";
import { CourseSidebar } from "../../../features/courses/components/courseSidebar";
import { useCourse } from "../../../features/courses/hooks/useCourse";
import { useCheckEnrollment } from "../../../features/enrollment/hooks/useCheckEnrollment";
import { useLesson } from "../../../features/lessons/hooks/useLesson";

export const Route = createFileRoute("/_learningLayout/lessons/$id")({
	head: () => ({
		meta: [
			{
				title: "Lesson - OpenCircle",
			},
			{
				name: "description",
				content: "Learn from this lesson on OpenCircle",
			},
			{
				property: "og:title",
				content: "Lesson - OpenCircle",
			},
			{
				property: "og:description",
				content: "Learn from this lesson on OpenCircle",
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
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const { id } = Route.useParams();
	const { lesson, isLoading: lessonLoading } = useLesson(id);
	const { isEnrolled, isLoading: enrollmentLoading } = useCheckEnrollment(
		lesson?.section?.course_id || "",
	);
	const { course, isLoading: courseLoading } = useCourse(
		lesson?.section?.course_id || "",
	);

	if (lessonLoading || courseLoading || enrollmentLoading) {
		return <div>Loading...</div>;
	}

	if (!lesson) {
		return <div>Lesson not found</div>;
	}

	if (!course) {
		return <div>Course not found</div>;
	}

	if (!isEnrolled) {
		return (
			<div className="p-4">
				<div className="mt-8 text-center">
					<h1 className="mb-4 font-bold text-2xl text-foreground">
						Enrollment Required
					</h1>
					<p className="mb-6 text-foreground/70">
						You need to enroll in this course to access the lesson content.
					</p>
					<Link
						to="/courses/$id"
						params={{ id: course.id }}
						className="inline-block rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Enroll in Course
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex min-h-screen">
			{/* Sidebar */}
			<div className="sticky top-0 h-screen w-72 space-y-8 border-border border-r p-6">
				<div className="flex items-center justify-between">
					<section className="ml-2 flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-background">
							<Zap size={12} fill="currentColor" />
						</div>
						<h2 className="font-medium">Opencircle</h2>
					</section>
					<button
						type="button"
						onClick={() =>
							navigate({ to: "/courses/$id", params: { id: course.id } })
						}
						className="flex items-center gap-2 text-xs"
					>
						<ArrowLeft size={14} />
						<div>Back</div>
					</button>
				</div>
				<CourseSidebar courseId={course.id} currentLessonId={id} />
			</div>

			{/* Main Content */}
			<div className="flex-1 p-8">
				<main className="m-auto max-w-4xl space-y-6">
					{/* Lesson Header */}
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<h1 className="font-bold text-2xl text-foreground">
								{lesson.order + 1}. {lesson.title}
							</h1>
							<span className="rounded-full bg-primary/10 px-3 py-1 text-primary text-sm capitalize">
								{lesson.type}
							</span>
						</div>

						{lesson.section && (
							<div className="text-foreground/60 text-sm">
								Section: {lesson.section.title}
							</div>
						)}
					</div>

					{/* Lesson Content */}
					<div className="space-y-6">
						{/* Video Content */}
						{lesson.type === "video" && lesson.video_url && (
							<div className="aspect-video overflow-hidden rounded-lg bg-black">
								<iframe
									src={lesson.video_url}
									className="h-full w-full"
									title={lesson.title}
								/>
							</div>
						)}

						{/* Text Content */}
						{lesson.content && (
							<div className="prose prose-invert max-w-none prose-headings:font-medium">
								<div className="prose prose-invert max-w-none prose-headings:font-medium prose-headings:text-base prose-headings:text-foreground prose-p:text-foreground/70 prose-p:text-sm">
									<MDEditor.Markdown
										source={lesson?.content}
										className="!bg-transparent !max-w-none"
									/>
								</div>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
