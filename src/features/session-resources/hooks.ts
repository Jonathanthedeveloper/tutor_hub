import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listResources, createResource, deleteResource, uploadResourceFile } from "./server";

export function useResources(sessionId: string) {
	return useQuery({
		queryKey: ["sessions", sessionId, "resources"],
		queryFn: () => listResources({ data: { sessionId } }),
		enabled: !!sessionId,
	});
}

export function useCreateResource() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { sessionId: string; title: string; type: string; url: string }) =>
			createResource({ data }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["sessions", variables.sessionId, "resources"] });
		},
	});
}

export function useDeleteResource() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (variables: { id: string; sessionId: string }) => deleteResource({ data: { id: variables.id } }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["sessions", variables.sessionId, "resources"] });
		},
	});
}

export function useUploadResourceFile() {
	return useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append("file", file);
			return uploadResourceFile({ data: formData });
		},
	});
}
