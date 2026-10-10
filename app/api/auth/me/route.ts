import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "studyhub.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    profile_image TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'User'
  )
`);

const userColumns = db
  .prepare("PRAGMA table_info(users)")
  .all() as Array<{ name: string }>;

const hasRoleColumn = userColumns.some(
  (column) => column.name === "role"
);

if (!hasRoleColumn) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN role TEXT NOT NULL DEFAULT 'User'
  `);
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get(
      "studyhub_session"
    )?.value;

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
          profileImage: session.profile_image || "",
          role: session.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("AUTH CHECK ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while checking authentication.",
      },
      { status: 500 }
    );
  }
}