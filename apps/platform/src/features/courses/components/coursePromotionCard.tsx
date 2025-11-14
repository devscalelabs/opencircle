import { useNavigate } from "@tanstack/react-router";
import { useFeaturedCourse } from "../hooks/useFeaturedCourse";

export const CoursePromotionCard = () => {
	const navigate = useNavigate();
	const { courses, isLoading } = useFeaturedCourse();

	if (isLoading || !courses || courses.length === 0) {
		return null;
	}

	return (
		<section>
			<div className="rounded-t-lg border border-border bg-background-secondary p-4 font-semibold text-foreground text-sm">
				Featured Courses
			</div>
			<div className="">
				{courses.map((course) => (
					<div
						key={course.id}
						onClick={() => navigate({ to: `/courses/${course.id}` })}
						className="cursor-pointer space-y-3 border border-border bg-background p-3 transition duration-150 hover:bg-primary"
					>
						<div className="space-y-2">
							<h3 className="font-medium text-foreground text-sm leading-tight">
								{course.title}
							</h3>
							{course.description && (
								<p className="line-clamp-2 text-foreground/70 text-xs">
									{course.description}
								</p>
							)}
						</div>
						<div className="flex items-center justify-between text-foreground/50 text-xs">
							<span className="capitalize">{course.status}</span>
							{course.price !== undefined && (
								<span>
									{course.price === 0 || !course.price
										? "Free"
										: `$${course.price}`}
								</span>
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
};
