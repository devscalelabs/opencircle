import { Avatar } from "@opencircle/ui";
import { Link, useNavigate } from "@tanstack/react-router";
import { getInitials } from "../../../utils/common";
import { useCourses } from "../hooks/useCourses";

export const CourseList = () => {
	const navigate = useNavigate();
	const { courses } = useCourses();

	return (
		<div>
			{courses.map((course) => {
				const initials = getInitials(course.instructor.name);

				return (
					<main
						key={course.id}
						className="space-y-4 border-border border-b p-4"
					>
						<div
							onClick={() => navigate({ to: `/courses/${course.id}` })}
							className="cursor-pointer"
						>
							<div className="space-y-2">
								{course.thumbnail_url && (
									<img
										src={course.thumbnail_url}
										alt={course.title}
										className="h-48 w-full rounded-lg object-cover"
									/>
								)}
								<h3 className="font-medium text-foreground text-lg">
									{course.title}
								</h3>
								{course.description && (
									<p className="line-clamp-2 text-foreground/70 text-sm">
										{course.description}
									</p>
								)}
								<div className="flex items-center gap-4 text-foreground/50 text-xs">
									<span className="capitalize">Status: {course.status}</span>
									{course.price !== undefined && (
										<span>
											{course.price === 0 ? "Free" : `$${course.price}`}
										</span>
									)}
									<span>{course.sections.length} sections</span>
								</div>
							</div>
						</div>
						<section className="mt-4 flex items-center gap-2">
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
									<div className="group-hover:underline">
										{course.instructor.name || course.instructor.email}
									</div>
									<p className="text-foreground/50 text-xs">Instructor</p>
								</div>
							</Link>
						</section>
					</main>
				);
			})}
		</div>
	);
};
