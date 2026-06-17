import { createServerFn } from "@tanstack/react-start";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sessionResource, classSession, course } from "@/db/schema";
import { createResourceSchema } from "./schema";
import { ensureSession } from "../auth/server";
import { uploadFile } from "@/lib/storage";


export const listResources = createServerFn({ method: "GET" })
	.validator(z.object({ sessionId: z.string() }))
	.handler(async (ctx) => {
		await ensureSession();

		return db
			.select()
			.from(sessionResource)
			.where(eq(sessionResource.sessionId, ctx.data.sessionId))
			.orderBy(desc(sessionResource.createdAt));
	});

export const createResource = createServerFn({ method: "POST" })
	.validator(createResourceSchema)
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin" && user.role !== "tutor") throw new Error("Forbidden");

		const sessionResult = await db
			.select({ tutorId: classSession.tutorId, courseId: classSession.courseId })
			.from(classSession)
			.where(eq(classSession.id, ctx.data.sessionId))
			.limit(1);

		if (sessionResult.length === 0) throw new Error("Session not found");

		if (user.role === "tutor" && sessionResult[0].tutorId !== user.id) {
			const courseResult = await db
				.select({ tutorId: course.tutorId })
				.from(course)
				.where(eq(course.id, sessionResult[0].courseId))
				.limit(1);

			if (courseResult.length === 0 || courseResult[0].tutorId !== user.id) {
				throw new Error("Forbidden: not your session");
			}
		}

		await db.insert(sessionResource).values(ctx.data);
		return { success: true };
	});

export const deleteResource = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin" && user.role !== "tutor") throw new Error("Forbidden");

		const resourceResult = await db
			.select({
				sessionId: sessionResource.sessionId,
			})
			.from(sessionResource)
			.where(eq(sessionResource.id, ctx.data.id))
			.limit(1);

		if (resourceResult.length === 0) throw new Error("Resource not found");

		if (user.role === "tutor") {
			const sessionResult = await db
				.select({ tutorId: classSession.tutorId })
				.from(classSession)
				.where(eq(classSession.id, resourceResult[0].sessionId))
				.limit(1);

			if (sessionResult.length === 0 || sessionResult[0].tutorId !== user.id) {
				throw new Error("Forbidden: not your session");
			}
		}

		await db.delete(sessionResource).where(eq(sessionResource.id, ctx.data.id));
		return { success: true };
	});

export const uploadResourceFile = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (!(data instanceof FormData)) {
			throw new Error("Invalid FormData");
		}
		return data;
	})
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin" && user.role !== "tutor") throw new Error("Forbidden");

		const formData = ctx.data;
		const file = formData.get("file");
		if (!(file instanceof File)) {
			throw new Error("No file uploaded");
		}

		const fileUrl = await uploadFile(file);

		return { success: true, url: fileUrl };
	});

