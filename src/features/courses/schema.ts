import { z } from "zod";

export const createCourseSchema = z.object({
	title: z.string().min(1).max(255),
	description: z.string().optional(),
	code: z.string().min(1).max(50),
	tutorId: z.string().min(1),
});

export const updateCourseSchema = z.object({
	title: z.string().min(1).max(255).optional(),
	description: z.string().optional(),
	code: z.string().min(1).max(50).optional(),
	tutorId: z.string().min(1).optional(),
});
