import { z } from "zod";

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

export const registerSchema = z.object({
	name: z.string().min(1).max(255),
	email: z.email(),
	password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
	email: z.email(),
});

export const resetPasswordSchema = z.object({
	email: z.email(),
	otp: z.string().length(6),
	newPassword: z.string().min(8),
});
