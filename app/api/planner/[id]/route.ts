import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";

const dbPath = path.join(process.cwd(), "studyhub.db");
const db = new Database(dbPath);

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

  if (!token) {
    return null;
  }

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
    .get(token) as
    | {
        id: number;
        username: string;
        email: string;
      }
    | undefined;

  return user || null;
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId)) {
      return NextResponse.json(
        { message: "Invalid session ID." },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `
        DELETE FROM planner_sessions
        WHERE id = ?
          AND user_id = ?
        `
      )
      .run(sessionId, user.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Session not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Study session deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PLANNER SESSION ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while deleting the session.",
      },
      { status: 500 }
    );
  }
}