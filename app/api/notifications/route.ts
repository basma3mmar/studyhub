import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { cookies } from "next/headers";

const db = new Database("studyhub.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT DEFAULT '',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);

async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

  if (!token) {
    return null;
  }

  const user = db
    .prepare(`
      SELECT users.id, users.username, users.email
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = ?
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

// GET NOTIFICATIONS
export async function GET() {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const notifications = db
      .prepare(`
        SELECT
          id,
          type,
          title,
          message,
          link,
          is_read,
          created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 100
      `)
      .all(user.id);

    const unreadCount = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = ?
        AND is_read = 0
      `)
      .get(user.id) as { count: number };

    return NextResponse.json({
      notifications,
      unreadCount: unreadCount.count,
    });
  } catch (error) {
    console.error("Failed to load notifications:", error);

    return NextResponse.json(
      {
        message: "Failed to load notifications.",
      },
      { status: 500 }
    );
  }
}

// CREATE NOTIFICATION
export async function POST(request: Request) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const type = String(body.type || "general").trim();
    const title = String(body.title || "").trim();
    const message = String(body.message || "").trim();
    const link = String(body.link || "").trim();

    if (!title) {
      return NextResponse.json(
        {
          message: "Notification title is required.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          message: "Notification message is required.",
        },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          link,
          is_read,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `)
      .run(
        user.id,
        type,
        title,
        message,
        link,
        new Date().toISOString()
      );

    return NextResponse.json({
      success: true,
      notification: {
        id: result.lastInsertRowid,
        user_id: user.id,
        type,
        title,
        message,
        link,
        is_read: 0,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);

    return NextResponse.json(
      {
        message: "Failed to create notification.",
      },
      { status: 500 }
    );
  }
}

// MARK AS READ
export async function PATCH(request: Request) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Mark all as read
    if (body.markAll === true) {
      db.prepare(`
        UPDATE notifications
        SET is_read = 1
        WHERE user_id = ?
      `).run(user.id);

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    const notificationId = Number(body.id);

    if (!Number.isInteger(notificationId)) {
      return NextResponse.json(
        {
          message: "Notification id is required.",
        },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        UPDATE notifications
        SET is_read = 1
        WHERE id = ?
        AND user_id = ?
      `)
      .run(notificationId, user.id);

    if (result.changes === 0) {
      return NextResponse.json(
        {
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to update notification:", error);

    return NextResponse.json(
      {
        message: "Failed to update notification.",
      },
      { status: 500 }
    );
  }
}