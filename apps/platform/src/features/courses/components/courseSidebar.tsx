import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSections } from "../../sections/hooks/useSections";

interface CourseSidebarProps {
	courseId: string;
	currentLessonId: string;
}

export const CourseSidebar = ({
	courseId,
	currentLessonId,
}: CourseSidebarProps) => {
	const { sections, isLoading: sectionsLoading } = useSections(courseId);
	const [expandedSections, setExpandedSections] = useState<
		Record<string, boolean>
	>({});

	// Expand the section containing the current lesson by default
	useEffect(() => {
		if (sections && currentLessonId) {
			const sectionContainingLesson = sections.find((section) =>
				section.lessons?.some((lesson) => lesson.id === currentLessonId),
			);
			if (sectionContainingLesson) {
				setExpandedSections((prev) => ({
					...prev,
					[sectionContainingLesson.id]: true,
				}));
			}
		}
	}, [sections, currentLessonId]);

	const toggleSection = (sectionId: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[sectionId]: !prev[sectionId],
		}));
	};

	if (sectionsLoading) {
		return (
			<div className="space-y-4">
				<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
				<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
				<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
			</div>
		);
	}

	if (!sections) {
		return <div>No sections found</div>;
	}

	return (
		<div className="space-y-2">
			{sections.map((section) => {
				const isExpanded = expandedSections[section.id] ?? false;
				return (
					<div key={section.id} className="border-b border-border pb-2">
						<button
							type="button"
							className="flex justify-between items-center w-full py-2 text-left font-medium text-foreground hover:bg-background/50 rounded px-2"
							onClick={() => toggleSection(section.id)}
						>
							<span className="text-sm">{section.title}</span>
							<span className="text-xs text-foreground/50">
								{section.lessons?.length || 0} lessons
							</span>
						</button>

						{isExpanded && section.lessons && (
							<div className="ml-2 mt-1 space-y-1">
								{section.lessons.map((lesson) => {
									const isActive = lesson.id === currentLessonId;
									return (
										<Link
											key={lesson.id}
											to="/lessons/$id"
											params={{ id: lesson.id }}
											className={`block py-1.5 px-2 rounded text-sm transition-colors ${
												isActive
													? "bg-primary text-foreground font-medium"
													: "text-foreground/70 hover:bg-background/50"
											}`}
										>
											<div className="flex items-center gap-2">
												<span>{lesson.order + 1}.</span>
												<span className="truncate">{lesson.title}</span>
											</div>
										</Link>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};
