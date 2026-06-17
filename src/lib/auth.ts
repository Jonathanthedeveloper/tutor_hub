import { count } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { admin, emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { v7 } from "uuid";
import { db } from "@/db";
import { ac, admin as adminRole, tutor, student } from "./permissions";
import AuthVerificationOtp from "@/features/email/auth-verification-otp";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "mysql", schema }),
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userCountResult = await db.select({ value: count() }).from(schema.user);
          const userCount = userCountResult[0]?.value ?? 0;
          if (userCount === 0) {
            return {
              data: {
                ...user,
                role: "admin",
              },
            };
          }
          return {
            data: user,
          };
        },
      },
    },
  },
  advanced: {
    database: {
      generateId() {
        return v7();
      },
    },
  },
  plugins: [
    admin({
      ac,
      roles: {
        admin: adminRole,
        tutor,
        student,
      },
      defaultRole: "student",
    }),
    emailOTP({
      changeEmail: {
        enabled: true,
      },
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        let subject = 'Verify your email'
        if (type === 'sign-in') {
          subject = 'Sign in to Tutor Hub'
        } else if (type === 'forget-password') {
          subject = 'Reset your password'
        }

        await sendEmail({
          to: email,
          subject,
          component: AuthVerificationOtp({ code: otp }),
        })
      },
    }),
  ],
});
