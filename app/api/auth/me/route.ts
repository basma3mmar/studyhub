import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "studyhub.db");

const db = new Database(dbPath);

export async function GET() {
  try {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get("studyhub_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const session = db
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
      .get(sessionToken) as
      | {
          id: number;
          username: string;
          email: string;
        }
      | undefined;

    if (!session) {
      return NextResponse.json(
        {
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.id,
          username: session.username,
          email: session.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("AUTH CHECK ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while checking authentication.",
      },
      { status: 500 }
    );
  }
}