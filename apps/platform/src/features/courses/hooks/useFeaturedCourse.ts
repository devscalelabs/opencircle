import { useQuery } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useFeaturedCourse = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["featured-course"],
		queryFn: async () => {
			const response = await api.courses.getFeaturedCourses(0, 3);
			// Return up to 3 featured courses
			return response || [];
		},
	});

	return {
		courses: data,
		error: null,
		isLoading,
	};
};
