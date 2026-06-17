import { z } from "zod";

export const createResourceSchema = z.object({
	sessionId: z.string().min(1),
	title: z.string().min(1).max(255),
	type: z.string().min(1).max(50),
	url: z.string().min(1),
});
