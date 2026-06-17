import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listEnrollments, enroll, unenroll, isEnrolled } from "./server";

export function useEnrollments(courseId?: string) {
	return useQuery({
		queryKey: ["enrollments", courseId],
		queryFn: () => listEnrollments({ data: { courseId } }),
	});
}

export function useIsEnrolled(courseId: string) {
	return useQuery({
		queryKey: ["enrollments", "check", courseId],
		queryFn: () => isEnrolled({ data: { courseId } }),
		enabled: !!courseId,
	});
}

export function useEnroll() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (courseId: string) => enroll({ data: { courseId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["enrollments"] });
			queryClient.invalidateQueries({ queryKey: ["courses"] });
		},
	});
}

export function useUnenroll() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (courseId: string) => unenroll({ data: { courseId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["enrollments"] });
			queryClient.invalidateQueries({ queryKey: ["courses"] });
		},
	});
}
