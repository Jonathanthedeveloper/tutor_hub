import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq, inArray, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { course, enrollment } from "@/db/schema";
import { createCourseSchema, updateCourseSchema } from "./schema";

async function ensureSession() {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	if (!session?.user) throw new Error("Unauthorized");
	return { user: session.user, headers };
}

export const listCourses = createServerFn({ method: "GET" }).handler(async () => {
	const { user } = await ensureSession();

	if (user.role === "admin") {
		return db.select().from(course).orderBy(desc(course.createdAt));
	}

	if (user.role === "tutor") {
		return db
			.select()
			.from(course)
			.where(eq(course.tutorId, user.id))
			.orderBy(desc(course.createdAt));
	}

	const enrollments = await db
		.select({ courseId: enrollment.courseId })
		.from(enrollment)
		.where(eq(enrollment.studentId, user.id));

	if (enrollments.length === 0) return [];

	const courseIds = enrollments.map((e) => e.courseId);
	return db
		.select()
		.from(course)
		.where(inArray(course.id, courseIds))
		.orderBy(desc(course.createdAt));
});

export const getCourse = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.string() }))
	.handler(async (ctx) => {
		await ensureSession();
		const result = await db
			.select()
			.from(course)
			.where(eq(course.id, ctx.data.id))
			.limit(1);

		if (result.length === 0) throw new Error("Course not found");
		return result[0];
	});

export const createCourse = createServerFn({ method: "POST" })
	.validator(createCourseSchema)
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin") throw new Error("Forbidden");

		await db.insert(course).values(ctx.data);
		return { success: true };
	});

export const updateCourse = createServerFn({ method: "POST" })
	.validator(updateCourseSchema.extend({ id: z.string() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin") throw new Error("Forbidden");

		const { id, ...data } = ctx.data;
		await db.update(course).set(data).where(eq(course.id, id));
		return { success: true };
	});

export const deleteCourse = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin") throw new Error("Forbidden");

		await db.delete(course).where(eq(course.id, ctx.data.id));
		return { success: true };
	});

export const listAllCourses = createServerFn({ method: "GET" }).handler(async () => {
	await ensureSession();
	return db.select().from(course).orderBy(desc(course.createdAt));
});
