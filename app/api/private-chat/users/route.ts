import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const dbPath = path.join(process.cwd(), "studyhub.db");

type SessionUser = {
  id: number;
  username: string;
  email: string;
};

function getDatabase() {
  return new Database(dbPath);
}

async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("studyhub_session")?.value;

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
          users.email
        FROM sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        WHERE sessions.token = ?
        LIMIT 1
        `
      )
      .get(sessionToken) as SessionUser | undefined;

    return user ?? null;
  } finally {
    db.close();
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();

    const db = getDatabase();

    try {
      let users: Array<{
        id: number;
        username: string;
        email: string;
      }>;

      if (search) {
        users = db
          .prepare(
            `
            SELECT
              id,
              username,
              email
            FROM users
            WHERE id != ?
              AND (
                LOWER(username) LIKE LOWER(?)
                OR LOWER(email) LIKE LOWER(?)
              )
            ORDER BY username COLLATE NOCASE ASC
            LIMIT 50
            `
          )
          .all(
            currentUser.id,
            `%${search}%`,
            `%${search}%`
          ) as Array<{
          id: number;
          username: string;
          email: string;
        }>;
      } else {
        users = db
          .prepare(
            `
            SELECT
              id,
              username,
              email
            FROM users
            WHERE id != ?
            ORDER BY username COLLATE NOCASE ASC
            LIMIT 50
            `
          )
          .all(currentUser.id) as Array<{
          id: number;
          username: string;
          email: string;
        }>;
      }

      return NextResponse.json({
        currentUser,
        users,
      });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("PRIVATE CHAT USERS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load users.",
      },
      { status: 500 }
    );
  }
}