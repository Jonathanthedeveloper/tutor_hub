import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getSession, listUsers, getUserDetail, updateUserRole, uploadProfileImage } from "./server";

export function useSession() {
	return useQuery({
		queryKey: ["session"],
		queryFn: () => getSession(),
	});
}

export function useUser() {
	const { data } = useSession();
	return data?.user ?? null;
}

export function useIsAdmin() {
	const user = useUser();
	return user?.role === "admin";
}

export function useIsTutor() {
	const user = useUser();
	return user?.role === "tutor";
}

export function useIsStudent() {
	const user = useUser();
	return user?.role === "student";
}

export function useSignOut() {
	return async () => {
		await authClient.signOut();
	};
}


export function useVerifyEmail() {
	return useMutation({
		mutationKey: ['verify-email'],
		mutationFn: async (
			data: Parameters<typeof authClient.emailOtp.verifyEmail>[0],
		) => {
			const { error } = await authClient.emailOtp.verifyEmail(data)
			if (error) throw error
		},
	})
}

export function useSendVerificationOtp() {
	return useMutation({
		mutationFn: async (
			data: Parameters<typeof authClient.emailOtp.sendVerificationOtp>[0],
		) => {
			const { error } = await authClient.emailOtp.sendVerificationOtp(data)
			if (error) throw error
		}
	})
} 

export function useUsers() {
	return useQuery({
		queryKey: ["users"],
		queryFn: () => listUsers(),
	});
}

export function useUserDetail(id: string) {
	return useQuery({
		queryKey: ["users", id],
		queryFn: () => getUserDetail({ data: { id } }),
		enabled: !!id,
	});
}

export function useUpdateUserRole() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: string; role: string }) => updateUserRole({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["session"] });
		},
	});
} 

export function useUploadProfileImage() {
	return useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append("file", file);
			return uploadProfileImage({ data: formData });
		},
	});
}