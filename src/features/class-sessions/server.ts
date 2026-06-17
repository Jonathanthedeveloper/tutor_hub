import { createServerFn } from "@tanstack/react-start";
import { eq, and, desc, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { classSession, course, enrollment } from "@/db/schema";
import { createSessionSchema, updateSessionSchema } from "./schema";
import { ensureSession } from "../auth/server";
import jwt from "jsonwebtoken";



export const listSessions = createServerFn({ method: "GET" })
	.validator(z.object({ courseId: z.string().optional() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();

		if (user.role === "admin") {
			const conditions: ReturnType<typeof eq>[] = [];
			if (ctx.data.courseId) conditions.push(eq(classSession.courseId, ctx.data.courseId));
			if (conditions.length > 0) return db.select().from(classSession).where(and(...conditions)).orderBy(desc(classSession.startTime));
			return db.select().from(classSession).orderBy(desc(classSession.startTime));
		}

		if (user.role === "tutor") {
			const tutorCourses = await db
				.select({ id: course.id })
				.from(course)
				.where(eq(course.tutorId, user.id));

			const courseIds = tutorCourses.map((c) => c.id);
			if (courseIds.length === 0) return [];

			const conditions = [inArray(classSession.courseId, courseIds)];
			if (ctx.data.courseId) conditions.push(eq(classSession.courseId, ctx.data.courseId));
			return db
				.select()
				.from(classSession)
				.where(and(...conditions))
				.orderBy(desc(classSession.startTime));
		}

		if (ctx.data.courseId) {
			return db
				.select()
				.from(classSession)
				.where(eq(classSession.courseId, ctx.data.courseId))
				.orderBy(desc(classSession.startTime));
		}

		const enrolledCourses = await db
			.select({ courseId: enrollment.courseId })
			.from(enrollment)
			.where(eq(enrollment.studentId, user.id));

		const courseIds = enrolledCourses.map((e) => e.courseId);
		if (courseIds.length === 0) return [];

		return db
			.select()
			.from(classSession)
			.where(inArray(classSession.courseId, courseIds))
			.orderBy(desc(classSession.startTime));
	});

export const getSession = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.string() }))
	.handler(async (ctx) => {
		await ensureSession();
		const result = await db
			.select()
			.from(classSession)
			.where(eq(classSession.id, ctx.data.id))
			.limit(1);

		if (result.length === 0) throw new Error("Session not found");
		return result[0];
	});

export const createSession = createServerFn({ method: "POST" })
	.validator(createSessionSchema)
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin" && user.role !== "tutor") throw new Error("Forbidden");

		const courseResult = await db
			.select({ tutorId: course.tutorId })
			.from(course)
			.where(eq(course.id, ctx.data.courseId))
			.limit(1);

		if (courseResult.length === 0) throw new Error("Course not found");

		if (user.role === "tutor" && courseResult[0].tutorId !== user.id) {
			throw new Error("Forbidden: not your course");
		}

		await db.insert(classSession).values({
			courseId: ctx.data.courseId,
			tutorId: courseResult[0].tutorId,
			title: ctx.data.title,
			description: ctx.data.description,
			startTime: new Date(ctx.data.startTime),
			endTime: new Date(ctx.data.endTime),
			meetingLink: ctx.data.meetingLink,
		});
		return { success: true };
	});

export const updateSession = createServerFn({ method: "POST" })
	.validator(updateSessionSchema.extend({ id: z.string() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin" && user.role !== "tutor") throw new Error("Forbidden");

		const { id, ...updateData } = ctx.data;

		const sessionResult = await db
			.select({ tutorId: classSession.tutorId, courseId: classSession.courseId })
			.from(classSession)
			.where(eq(classSession.id, id))
			.limit(1);

		if (sessionResult.length === 0) throw new Error("Session not found");

		if (user.role === "tutor") {
			const courseResult = await db
				.select({ tutorId: course.tutorId })
				.from(course)
				.where(eq(course.id, sessionResult[0].courseId))
				.limit(1);

			if (courseResult.length === 0 || courseResult[0].tutorId !== user.id) {
				throw new Error("Forbidden: not your course");
			}
		}

		const dbUpdateData: Record<string, unknown> = { ...updateData }
		if (typeof dbUpdateData.startTime === "string") dbUpdateData.startTime = new Date(dbUpdateData.startTime)
		if (typeof dbUpdateData.endTime === "string") dbUpdateData.endTime = new Date(dbUpdateData.endTime)

		await db.update(classSession).set(dbUpdateData).where(eq(classSession.id, id));
		return { success: true };
	});

export const deleteSession = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		if (user.role !== "admin" && user.role !== "tutor") throw new Error("Forbidden");

		const sessionResult = await db
			.select({ tutorId: classSession.tutorId, courseId: classSession.courseId })
			.from(classSession)
			.where(eq(classSession.id, ctx.data.id))
			.limit(1);

		if (sessionResult.length === 0) throw new Error("Session not found");

		if (user.role === "tutor") {
			const courseResult = await db
				.select({ tutorId: course.tutorId })
				.from(course)
				.where(eq(course.id, sessionResult[0].courseId))
				.limit(1);

			if (courseResult.length === 0 || courseResult[0].tutorId !== user.id) {
				throw new Error("Forbidden: not your course");
			}
		}

		await db.delete(classSession).where(eq(classSession.id, ctx.data.id));
		return { success: true };
	});

function generateJitsiJwt(secret: string, appId: string, room: string, user: { name: string; email: string; id: string; role: string }) {
	const payload = {
		aud: appId,
		iss: appId,
		sub: "*",
		room: room,
		exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours
		nbf: Math.floor(Date.now() / 1000) - 10,
		context: {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: "",
				moderator: user.role === "tutor" || user.role === "admin"
			},
			features: {
				livestreaming: "true",
				recording: "true",
				transcription: "true",
				"outbound-call": "true"
			}
		}
	};

	return jwt.sign(payload, secret, { algorithm: "HS256" })
}

export const getMeetingToken = createServerFn({ method: "GET" })
	.validator(z.object({ classId: z.string() }))
	.handler(async (ctx) => {
		const { user } = await ensureSession();
		const jitsiSecret = process.env.JITSI_JWT_SECRET;
		const jitsiAppId = process.env.JITSI_APP_ID;
		const jitsiDomain = process.env.JITSI_DOMAIN;

		if (!jitsiDomain) {
			throw new Error("JITSI_DOMAIN environment variable is missing on the server.");
		}

		if (!jitsiSecret) {
			return { token: null, domain: jitsiDomain };
		}

		if (!jitsiAppId) {
			throw new Error("JITSI_APP_ID environment variable is missing on the server.");
		}

		const roomName = `tutor-hub-class-session-${ctx.data.classId}`;
		const token = generateJitsiJwt(jitsiSecret, jitsiAppId, roomName, {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role || "student"
		});

		return { token, domain: jitsiDomain };
	});

