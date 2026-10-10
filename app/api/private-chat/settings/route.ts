import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const dbPath = path.join(process.cwd(), "studyhub.db");

type CallPermission = "everyone" | "friends" | "nobody";

type SettingsRow = {
  user_id: number;
  allow_calls: CallPermission;
  allow_voice_messages: number;
  allow_images: number;
  allow_videos: number;
};

function getDatabase() {
  return new Database(dbPath);
}

function ensureSettingsTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS private_chat_settings (
      user_id INTEGER PRIMARY KEY,
      allow_calls TEXT NOT NULL DEFAULT 'everyone'
        CHECK (allow_calls IN ('everyone', 'friends', 'nobody')),
      allow_voice_messages INTEGER NOT NULL DEFAULT 1
        CHECK (allow_voice_messages IN (0, 1)),
      allow_images INTEGER NOT NULL DEFAULT 1
        CHECK (allow_images IN (0, 1)),
      allow_videos INTEGER NOT NULL DEFAULT 1
        CHECK (allow_videos IN (0, 1)),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

  if (!token) return null;

  const db = getDatabase();

  try {
    const session = db.prepare(`
      SELECT user_id
      FROM sessions
      WHERE token = ?
      LIMIT 1
    `).get(token) as { user_id: number } | undefined;

    return session?.user_id ?? null;
  } finally {
    db.close();
  }
}

function getOrCreateSettings(
  db: Database.Database,
  userId: number
): SettingsRow {
  db.prepare(`
    INSERT OR IGNORE INTO private_chat_settings (user_id)
    VALUES (?)
  `).run(userId);

  return db.prepare(`
    SELECT
      user_id,
      allow_calls,
      allow_voice_messages,
      allow_images,
      allow_videos
    FROM private_chat_settings
    WHERE user_id = ?
    LIMIT 1
  `).get(userId) as SettingsRow;
}

function formatSettings(row: SettingsRow) {
  return {
    allowCalls: row.allow_calls,
    allowVoiceMessages: Boolean(row.allow_voice_messages),
    allowImages: Boolean(row.allow_images),
    allowVideos: Boolean(row.allow_videos),
  };
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const db = getDatabase();

    try {
      ensureSettingsTable(db);
      const settings = getOrCreateSettings(db, userId);

      return NextResponse.json({
        success: true,
        settings: formatSettings(settings),
      });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("PRIVATE CHAT SETTINGS GET ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load privacy settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const callOptions: CallPermission[] = [
      "everyone",
      "friends",
      "nobody",
    ];

    if (
      body.allowCalls !== undefined &&
      (typeof body.allowCalls !== "string" ||
        !callOptions.includes(body.allowCalls as CallPermission))
    ) {
      return NextResponse.json(
        { message: "Invalid call permission." },
        { status: 400 }
      );
    }

    const booleanFields = [
      "allowVoiceMessages",
      "allowImages",
      "allowVideos",
    ] as const;

    for (const field of booleanFields) {
      if (
        body[field] !== undefined &&
        typeof body[field] !== "boolean"
      ) {
        return NextResponse.json(
          { message: `${field} must be true or false.` },
          { status: 400 }
        );
      }
    }

    if (
      body.allowCalls === undefined &&
      body.allowVoiceMessages === undefined &&
      body.allowImages === undefined &&
      body.allowVideos === undefined
    ) {
      return NextResponse.json(
        { message: "No settings were provided." },
        { status: 400 }
      );
    }

    const db = getDatabase();

    try {
      ensureSettingsTable(db);
      getOrCreateSettings(db, userId);

      const updates: string[] = [];
      const values: Array<string | number> = [];

      if (body.allowCalls !== undefined) {
        updates.push("allow_calls = ?");
        values.push(body.allowCalls as CallPermission);
      }

      if (body.allowVoiceMessages !== undefined) {
        updates.push("allow_voice_messages = ?");
        values.push(body.allowVoiceMessages ? 1 : 0);
      }

      if (body.allowImages !== undefined) {
        updates.push("allow_images = ?");
        values.push(body.allowImages ? 1 : 0);
      }

      if (body.allowVideos !== undefined) {
        updates.push("allow_videos = ?");
        values.push(body.allowVideos ? 1 : 0);
      }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(userId);

      db.prepare(`
        UPDATE private_chat_settings
        SET ${updates.join(", ")}
        WHERE user_id = ?
      `).run(...values);

      const settings = getOrCreateSettings(db, userId);

      return NextResponse.json({
        success: true,
        message: "Privacy settings saved.",
        settings: formatSettings(settings),
      });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("PRIVATE CHAT SETTINGS PATCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to save privacy settings." },
      { status: 500 }
    );
  }
}
