import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";

const dbPath = path.join(process.cwd(), "studyhub.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS planner_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Study',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

  if (!token) {
    return null;
  }

  const user = db
    .prepare(`
      SELECT
        users.id,
        users.username,
        users.email
      FROM sessions
      INNER JOIN users
        ON users.id = sessions.user_id
      WHERE sessions.token = ?
      LIMIT 1
    `)
    .get(token) as
    | {
        id: number;
        username: string;
        email: string;
      }
    | undefined;

  return user || null;
}

function formatSession(session: {
  id: number;
  day: string;
  time: string;
  subject: string;
  title: string;
  type: string;
}) {
  return {
    id: session.id,
    day: session.day,
    time: session.time,
    subject: session.subject,
    title: session.title,
    type: session.type,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const sessions = db
      .prepare(`
        SELECT
          id,
          day,
          time,
          subject,
          title,
          type
        FROM planner_sessions
        WHERE user_id = ?
        ORDER BY id ASC
      `)
      .all(user.id) as {
      id: number;
      day: string;
      time: string;
      subject: string;
      title: string;
      type: string;
    }[];

    return NextResponse.json({
      sessions: sessions.map(formatSession),
    });
  } catch (error) {
    console.error("GET PLANNER ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while loading your planner.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const day = String(body.day || "").trim();
    const time = String(body.time || "").trim();
    const subject = String(body.subject || "").trim();
    const title = String(body.title || "").trim();
    const type = String(body.type || "").trim();

    const validDays = [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
    ];

    const validTypes = [
      "Study",
      "Lecture",
      "Review",
    ];

    if (!day || !time || !subject || !title || !type) {
      return NextResponse.json(
        { message: "All session fields are required." },
        { status: 400 }
      );
    }

    if (!validDays.includes(day)) {
      return NextResponse.json(
        { message: "Invalid planner day." },
        { status: 400 }
      );
    }

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid session type." },
        { status: 400 }
      );
    }

    // Create planner session
    const result = db
      .prepare(`
        INSERT INTO planner_sessions (
          user_id,
          day,
          time,
          subject,
          title,
          type
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        user.id,
        day,
        time,
        subject,
        title,
        type
      );

    const session = db
      .prepare(`
        SELECT
          id,
          day,
          time,
          subject,
          title,
          type
        FROM planner_sessions
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
      `)
      .get(
        result.lastInsertRowid,
        user.id
      ) as {
      id: number;
      day: string;
      time: string;
      subject: string;
      title: string;
      type: string;
    };

    // Create notification
    db.prepare(`
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link,
        is_read,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `).run(
      user.id,
      "planner",
      "Study session added",
      `"${title}" was added to your planner.`,
      "/planner"
    );

    console.log(
      "PLANNER NOTIFICATION CREATED SUCCESSFULLY"
    );

    return NextResponse.json(
      {
        message: "Study session created successfully.",
        session: formatSession(session),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE PLANNER SESSION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Something went wrong while creating the session.",
      },
      { status: 500 }
    );
  }
}