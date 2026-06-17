import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { uploadFile } from "@/lib/storage";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	return session;
});

export const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	if (!session) throw new Error("Unauthorized");
	return session;
});

export const requireRole = createServerFn({ method: "GET" })
	.validator(z.object({ role: z.union([z.string(), z.array(z.string())]) }))
	.handler(async (ctx) => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });
		if (!session?.user) throw new Error("Unauthorized");
		const roles = Array.isArray(ctx.data.role) ? ctx.data.role : [ctx.data.role];
		if (!session.user.role || !roles.includes(session.user.role)) {
			throw new Error("Forbidden: insufficient role");
		}
		return session.user;
	});

export const listUsers = createServerFn({ method: "GET" })
	.handler(async () => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });
		if (!session?.user) {
			throw new Error("Unauthorized");
		}


		if (session.user.role !== "admin") {
			return db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					image: user.image,
					createdAt: user.createdAt,
				})
				.from(user)
				.orderBy(desc(user.createdAt));
		}

		return db.select().from(user).orderBy(desc(user.createdAt));
	});

export const getUserDetail = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.string() }))
	.handler(async (ctx) => {
		await ensureSession()

		const result = await db.select().from(user).where(eq(user.id, ctx.data.id)).limit(1);
		if (result.length === 0) throw new Error("User not found");
		return result[0];
	});

export const updateUserRole = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), role: z.string() }))
	.handler(async (ctx) => {
		await ensureSession()

		await db.update(user).set({ role: ctx.data.role }).where(eq(user.id, ctx.data.id));
		return { success: true };
	});

export const uploadProfileImage = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (!(data instanceof FormData)) {
			throw new Error("Invalid FormData");
		}
		return data;
	})
	.handler(async (ctx) => {
		await ensureSession();
		const formData = ctx.data;
		const file = formData.get("file");
		if (!(file instanceof File)) {
			throw new Error("No file uploaded");
		}
		if (!file.type.startsWith("image/")) {
			throw new Error("Only image files are allowed");
		}

		const fileUrl = await uploadFile(file);

		return { success: true, url: fileUrl };
	});
