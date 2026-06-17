import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	listSessions,
	getSession,
	createSession,
	updateSession,
	deleteSession,
	getMeetingToken,
} from "./server";

export function useSessions(courseId?: string) {
	return useQuery({
		queryKey: ["sessions", courseId],
		queryFn: () => listSessions({ data: { courseId } }),
	});
}

export function useSession(id: string) {
	return useQuery({
		queryKey: ["sessions", id],
		queryFn: () => getSession({ data: { id } }),
		enabled: !!id,
	});
}

export function useMeetingToken(classId: string) {
	return useQuery({
		queryKey: ["sessions", classId, "meeting-token"],
		queryFn: () => getMeetingToken({ data: { classId } }),
		enabled: !!classId,
	});
}

export function useCreateSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: {
			courseId: string;
			startTime: string;
			endTime: string;
			title?: string;
			description?: string;
			meetingLink?: string;
		}) => createSession({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
}

export function useUpdateSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { id: string } & Record<string, unknown>) => updateSession({ data: input }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
}

export function useDeleteSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteSession({ data: { id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
}
