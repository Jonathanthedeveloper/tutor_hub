import { createServerFn } from "@tanstack/react-start";
import { eq, and, inArray, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { enrollment, course } from "@/db/schema";
import { enrollSchema } from "./schema";
import { ensureSession } from "../auth";


export const listEnrollments = createServerFn({ method: "GET" })
	.validator(z.object({ courseId: z.string().optional() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();

		if (user.role === "admin") {
			const conditions: ReturnType<typeof eq>[] = [];
			if (ctx.data.courseId) conditions.push(eq(enrollment.courseId, ctx.data.courseId));
			if (conditions.length > 0) return db.select().from(enrollment).where(and(...conditions)).orderBy(desc(enrollment.enrolledAt));
			return db.select().from(enrollment).orderBy(desc(enrollment.enrolledAt));
		}

		if (user.role === "tutor") {
			const tutorCourses = await db
				.select({ id: course.id })
				.from(course)
				.where(eq(course.tutorId, user.id));

			if (tutorCourses.length === 0) return [];
			const courseIds = tutorCourses.map((c) => c.id);

			const conditions = [inArray(enrollment.courseId, courseIds)];
			if (ctx.data.courseId) conditions.push(eq(enrollment.courseId, ctx.data.courseId));
			return db
				.select()
				.from(enrollment)
				.where(and(...conditions))
				.orderBy(desc(enrollment.enrolledAt));
		}

		const studentConditions = [eq(enrollment.studentId, user.id)];
		if (ctx.data.courseId) studentConditions.push(eq(enrollment.courseId, ctx.data.courseId));
		return db
			.select()
			.from(enrollment)
			.where(and(...studentConditions))
			.orderBy(desc(enrollment.enrolledAt));
	});

export const enroll = createServerFn({ method: "POST" })
	.validator(enrollSchema)
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "student") throw new Error("Forbidden: only students can enroll");

		const existing = await db
			.select()
			.from(enrollment)
			.where(
				and(eq(enrollment.studentId, user.id), eq(enrollment.courseId, ctx.data.courseId)),
			)
			.limit(1);

		if (existing.length > 0) throw new Error("Already enrolled");

		await db.insert(enrollment).values({
			studentId: user.id,
			courseId: ctx.data.courseId,
		});
		return { success: true };
	});

export const unenroll = createServerFn({ method: "POST" })
	.validator(z.object({ courseId: z.string() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();

		await db
			.delete(enrollment)
			.where(
				and(eq(enrollment.studentId, user.id), eq(enrollment.courseId, ctx.data.courseId)),
			);

		return { success: true };
	});

export const isEnrolled = createServerFn({ method: "GET" })
	.validator(z.object({ courseId: z.string() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();

		const result = await db
			.select()
			.from(enrollment)
			.where(
				and(eq(enrollment.studentId, user.id), eq(enrollment.courseId, ctx.data.courseId)),
			)
			.limit(1);

		return result.length > 0;
	});
