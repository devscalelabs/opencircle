import type { CourseCreate, CourseUpdate } from "@opencircle/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../utils/api";

export const useCourseSubmission = () => {
	const queryClient = useQueryClient();

	const { mutate: createCourse, isPending: isCreating } = useMutation({
		mutationFn: async (data: CourseCreate) => {
			const response = await api.courses.createCourse(data);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
		},
	});

	const { mutate: updateCourse, isPending: isUpdating } = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: CourseUpdate }) => {
			const response = await api.courses.updateCourse(id, data);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			queryClient.invalidateQueries({ queryKey: ["course"] });
			queryClient.invalidateQueries({ queryKey: ["featured-course"] });
		},
	});

	const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
		mutationFn: async (courseId: string) => {
			const response = await api.courses.deleteCourse(courseId);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
		},
	});

	return {
		createCourse,
		updateCourse,
		deleteCourse,
		isSubmitting: isCreating || isUpdating || isDeleting,
		isCreating,
		isUpdating,
		isDeleting,
	};
};
