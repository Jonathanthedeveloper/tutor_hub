import { relations } from "drizzle-orm";
import {
    mysqlTable,
    varchar,
    text,
    timestamp,
    boolean,
    index,
} from "drizzle-orm/mysql-core";
import { v7 as uuidV7 } from "uuid";

export const user = mysqlTable(
    "user",
    {
        id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => uuidV7()),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        emailVerified: boolean("email_verified").default(false).notNull(),
        image: text("image"),
        createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
        role: varchar("role", { length: 50 }),
        banned: boolean("banned").default(false),
        banReason: text("ban_reason"),
        banExpires: timestamp("ban_expires", { fsp: 3 }),
    },
    (table) => [index("user_role_idx").on(table.role)],
);

export const session = mysqlTable(
    "session",
    {
        id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => uuidV7()),
        expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
        token: varchar("token", { length: 255 }).notNull().unique(),
        createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { fsp: 3 })
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: varchar("user_id", { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        impersonatedBy: text("impersonated_by"),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = mysqlTable(
    "account",
    {
        id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => uuidV7()),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: varchar("user_id", { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { fsp: 3 })
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = mysqlTable(
    "verification",
    {
        id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => uuidV7()),
        identifier: varchar("identifier", { length: 255 }).notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
        createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { fsp: 3 })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));
