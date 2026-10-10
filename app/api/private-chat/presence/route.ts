import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const dbPath = path.join(
  process.cwd(),
  "studyhub.db"
);

const ONLINE_WINDOW_MS = 20 * 1000;

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

  const sessionToken =
    cookieStore.get("studyhub_session")?.value;

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
      .get(sessionToken) as
      | SessionUser
      | undefined;

    return user ?? null;
  } finally {
    db.close();
  }
}

function ensurePresenceTable(
  db: Database.Database
) {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS private_chat_presence (
      user_id INTEGER PRIMARY KEY,
      last_seen TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
    `
  ).run();

  db.prepare(
    `
    CREATE INDEX IF NOT EXISTS idx_private_chat_presence_last_seen
    ON private_chat_presence(last_seen)
    `
  ).run();
}

export async function GET() {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const db = getDatabase();

    try {
      ensurePresenceTable(db);

      const cutoff =
        new Date(
          Date.now() - ONLINE_WINDOW_MS
        ).toISOString();

      const rows = db
        .prepare(
          `
          SELECT
            user_id,
            last_seen
          FROM private_chat_presence
          WHERE last_seen >= ?
          `
        )
        .all(cutoff) as Array<{
        user_id: number;
        last_seen: string;
      }>;

      const presence: Record<
        number,
        boolean
      > = {};

      for (const row of rows) {
        presence[row.user_id] = true;
      }

      presence[currentUser.id] = true;

      return NextResponse.json({
        currentUser,
        presence,
      });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error(
      "PRIVATE CHAT PRESENCE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load presence.",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const db = getDatabase();

    try {
      ensurePresenceTable(db);

      const lastSeen =
        new Date().toISOString();

      db.prepare(
        `
        INSERT INTO private_chat_presence (
          user_id,
          last_seen
        )
        VALUES (?, ?)
        ON CONFLICT(user_id)
        DO UPDATE SET last_seen = excluded.last_seen
        `
      ).run(
        currentUser.id,
        lastSeen
      );

      return NextResponse.json({
        success: true,
        online: true,
        lastSeen,
      });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error(
      "PRIVATE CHAT PRESENCE POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update presence.",
      },
      { status: 500 }
    );
  }
}