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
					<main key={course.id} className="border-border border-b p-6">
						<div
							onClick={() => navigate({ to: `/courses/${course.id}` })}
							className="cursor-pointer"
						>
							{course.thumbnail_url && (
								<img
									src={course.thumbnail_url}
									alt={course.title}
									className="h-46 w-full rounded-t object-cover"
								/>
							)}
							<section className="space-y-2 rounded-b border-border border-t bg-black/50 p-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<h3 className="font-medium text-foreground text-lg">
											{course.title}
										</h3>
										{course.is_featured && (
											<span className="rounded bg-primary px-2 py-0.5 font-medium text-white text-xs">
												Featured
											</span>
										)}
									</div>
									{course.description && (
										<p className="line-clamp-2 text-foreground/70 text-sm">
											{course.description}
										</p>
									)}
								</div>
								<div className="flex items-center justify-start gap-4 text-foreground/50 text-xs">
									<span className="capitalize">Status: {course.status}</span>
									{course.price !== undefined && (
										<span>
											{course.price === 0 || !course.price
												? "Free"
												: `$${course.price}`}
										</span>
									)}
									<span>{course.sections.length} sections</span>
								</div>
								<section className="flex items-center justify-start gap-2 pt-2">
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
							</section>
						</div>
					</main>
				);
			})}
		</div>
	);
};
