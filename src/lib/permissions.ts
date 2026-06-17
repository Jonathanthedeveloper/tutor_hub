import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
	course: ["create", "list", "get", "update", "delete"],
	class_session: ["create", "list", "get", "update", "delete"],
	enrollment: ["create", "list", "get", "delete"],
	session_resource: ["create", "list", "get", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
	...adminAc.statements,
	course: ["create", "list", "get", "update", "delete"],
	class_session: ["create", "list", "get", "update", "delete"],
	enrollment: ["create", "list", "get", "delete"],
	session_resource: ["create", "list", "get", "delete"],
});

export const tutor = ac.newRole({
	course: ["list", "get", "update"],
	class_session: ["create", "list", "get", "update", "delete"],
	enrollment: ["list", "get"],
	session_resource: ["create", "list", "get", "delete"],
});

export const student = ac.newRole({
	course: ["list", "get"],
	class_session: ["list", "get"],
	enrollment: ["create", "list", "get"],
	session_resource: ["list", "get"],
});
