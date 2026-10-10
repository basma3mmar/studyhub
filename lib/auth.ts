import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";
import {
  type Role,
  type Permission,
  isValidRole,
  hasPermission,
} from "./roles";

const dbPath = path.join(process.cwd(), "studyhub.db");

type SessionUser = {
  id: number;
  username: string;
  email: string;
  profileImage: string;
  role: Role;
};

function getDatabase() {
  return new Database(dbPath);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(
    "studyhub_session"
  )?.value;

  if (!sessionToken) {
    return null;
  }

  const db = getDatabase();

  try {
    const user = db
      .prepare(
        `
        SELECT
          users.id,
          users.username,
          users.email,
          users.profile_image,
          users.role
        FROM sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        WHERE sessions.token = ?
        LIMIT 1
        `
      )
      .get(sessionToken) as
      | {
          id: number;
          username: string;
          email: string;
          profile_image: string | null;
          role: string;
        }
      | undefined;

    if (!user || !isValidRole(user.role)) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profile_image || "",
      role: user.role,
    };
  } finally {
    db.close();
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireRole(
  allowedRoles: Role[]
): Promise<SessionUser> {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function requirePermission(
  permission: Permission
): Promise<SessionUser> {
  const user = await requireUser();

  if (!hasPermission(user.role, permission)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}