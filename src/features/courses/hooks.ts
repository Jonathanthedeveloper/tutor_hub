import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listCourses, getCourse, createCourse, updateCourse, deleteCourse, listAllCourses } from "./server";

export function useCourses() {
	return useQuery({
		queryKey: ["courses"],
		queryFn: () => listCourses(),
	});
}

export function useCourse(id: string) {
	return useQuery({
		queryKey: ["courses", id],
		queryFn: () => getCourse({ data: { id } }),
		enabled: !!id,
	});
}

export function useCreateCourse() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { title: string; code: string; tutorId: string; description?: string }) =>
			createCourse({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			queryClient.invalidateQueries({ queryKey: ["all-courses"] });
		},
	});
}

export function useUpdateCourse() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { id: string } & Record<string, unknown>) => updateCourse({ data: input }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			queryClient.invalidateQueries({ queryKey: ["all-courses"] });
		},
	});
}

export function useDeleteCourse() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteCourse({ data: { id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			queryClient.invalidateQueries({ queryKey: ["all-courses"] });
		},
	});
}

export function useAllCourses() {
	return useQuery({
		queryKey: ["all-courses"],
		queryFn: () => listAllCourses(),
	});
}
