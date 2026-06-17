import { relations } from "drizzle-orm";
import {
	mysqlTable,
	varchar,
	text,
	timestamp,
	index,
	unique,
	mysqlEnum,
} from "drizzle-orm/mysql-core";
import { user } from "./auth";
import { v7 as uuidV7 } from "uuid";

export const course = mysqlTable(
	"course",
	{
		id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => uuidV7()),
		title: varchar("title", { length: 255 }).notNull(),
		description: text("description"),
		code: varchar("code", { length: 50 }).notNull().unique(),
		tutorId: varchar("tutor_id", { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 3 })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("course_tutor_id_idx").on(table.tutorId)],
);

export const classSession = mysqlTable(
	"class_session",
	{
		id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => uuidV7()),
		courseId: varchar("course_id", { length: 36 })
			.notNull()
			.references(() => course.id, { onDelete: "cascade" }),
		tutorId: varchar("tutor_id", { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 255 }),
		description: text("description"),
		startTime: timestamp("start_time", { fsp: 3 }).notNull(),
		endTime: timestamp("end_time", { fsp: 3 }).notNull(),
		meetingLink: varchar("meeting_link", { length: 255 }),
		status: mysqlEnum("status", [
			"scheduled",
			"live",
			"completed",
			"cancelled",
		])
			.default("scheduled")
			.notNull(),
		createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 3 })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("class_session_course_id_idx").on(table.courseId),
		index("class_session_tutor_id_idx").on(table.tutorId),
		index("class_session_start_time_idx").on(table.startTime),
	],
);

export const enrollment = mysqlTable(
	"enrollment",
	{
		id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => uuidV7()),
		studentId: varchar("student_id", { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		courseId: varchar("course_id", { length: 36 })
			.notNull()
			.references(() => course.id, { onDelete: "cascade" }),
		enrolledAt: timestamp("enrolled_at", { fsp: 3 }).defaultNow().notNull(),
	},
	(table) => [
		index("enrollment_student_id_idx").on(table.studentId),
		index("enrollment_course_id_idx").on(table.courseId),
		unique("enrollment_student_course_unique").on(
			table.studentId,
			table.courseId,
		),
	],
);

export const sessionResource = mysqlTable(
	"session_resource",
	{
		id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => uuidV7()),
		sessionId: varchar("session_id", { length: 36 })
			.notNull()
			.references(() => classSession.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 255 }).notNull(),
		type: varchar("type", { length: 50 }).notNull(),
		url: text("url").notNull(),
		createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
	},
	(table) => [
		index("session_resource_session_id_idx").on(table.sessionId),
	],
);

export const courseRelations = relations(course, ({ one, many }) => ({
	tutor: one(user, {
		fields: [course.tutorId],
		references: [user.id],
	}),
	classSessions: many(classSession),
	enrollments: many(enrollment),
}));

export const classSessionRelations = relations(classSession, ({ one, many }) => ({
	course: one(course, {
		fields: [classSession.courseId],
		references: [course.id],
	}),
	tutor: one(user, {
		fields: [classSession.tutorId],
		references: [user.id],
	}),
	resources: many(sessionResource),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
	student: one(user, {
		fields: [enrollment.studentId],
		references: [user.id],
	}),
	course: one(course, {
		fields: [enrollment.courseId],
		references: [course.id],
	}),
}));

export const sessionResourceRelations = relations(sessionResource, ({ one }) => ({
	session: one(classSession, {
		fields: [sessionResource.sessionId],
		references: [classSession.id],
	}),
}));
