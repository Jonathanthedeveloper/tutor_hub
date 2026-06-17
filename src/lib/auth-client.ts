import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { ac, admin as adminRole, tutor, student } from "./permissions";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        tutor,
        student,
      },
    }),
    emailOTPClient(),
    tanstackStartCookies()
  ],
});
