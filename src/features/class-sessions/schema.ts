import { z } from "zod";

export const createSessionSchema = z.object({
	courseId: z.string().min(1),
	title: z.string().max(255).optional(),
	description: z.string().optional(),
	startTime: z.string().datetime(),
	endTime: z.string().datetime(),
	meetingLink: z.string().max(255).optional(),
});

export const updateSessionSchema = z.object({
	title: z.string().max(255).optional(),
	description: z.string().optional(),
	startTime: z.string().datetime().optional(),
	endTime: z.string().datetime().optional(),
	meetingLink: z.string().max(255).optional(),
	status: z.enum(["scheduled", "live", "completed", "cancelled"]).optional(),
});
