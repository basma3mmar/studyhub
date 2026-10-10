import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import crypto from "crypto";

const db = new Database("studyhub.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS study_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    owner_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    group_image TEXT DEFAULT '',
    chat_enabled INTEGER NOT NULL DEFAULT 1,
    visibility TEXT NOT NULL DEFAULT 'public',
    invite_code TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS study_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TEXT NOT NULL,
    UNIQUE(group_id, user_id)
  );
`);

function ensureColumn(
  table: string,
  column: string,
  definition: string
) {
  const columns = db
    .prepare(`PRAGMA table_info(${table})`)
    .all() as Array<{ name: string }>;

  if (!columns.some((item) => item.name === column)) {
    db.exec(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`
    );
  }
}

ensureColumn(
  "study_groups",
  "group_image",
  "TEXT DEFAULT ''"
);

ensureColumn(
  "study_groups",
  "chat_enabled",
  "INTEGER NOT NULL DEFAULT 1"
);

ensureColumn(
  "study_groups",
  "visibility",
  "TEXT NOT NULL DEFAULT 'public'"
);

ensureColumn(
  "study_groups",
  "invite_code",
  "TEXT DEFAULT ''"
);

function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("studyhub_session")?.value;

  if (!token) {
    return null;
  }

  return db
    .prepare(`
      SELECT
        users.id,
        users.username,
        users.email
      FROM users
      JOIN sessions
        ON sessions.user_id = users.id
      WHERE sessions.token = ?
    `)
    .get(token) as
    | {
        id: number;
        username: string;
        email: string;
      }
    | undefined;
}

function generateInviteCode() {
  let code = "";

  do {
    code = crypto
      .randomBytes(6)
      .toString("base64url")
      .slice(0, 8)
      .toUpperCase();
  } while (
    db
      .prepare(
        `
          SELECT study_groups.id
          FROM study_groups
          WHERE study_groups.invite_code = ?
        `
      )
      .get(code)
  );

  return code;
}

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const groups = db
      .prepare(`
        SELECT
          g.id,
          g.name,
          g.description,
          g.subject,
          g.owner_id,
          g.created_at,
          COALESCE(g.group_image, '') AS group_image,
          COALESCE(g.chat_enabled, 1) AS chat_enabled,
          COALESCE(g.visibility, 'public') AS visibility,

          CASE
            WHEN g.owner_id = ? THEN 1
            ELSE 0
          END AS is_owner,

          CASE
            WHEN EXISTS (
              SELECT 1
              FROM study_group_members m
              WHERE m.group_id = g.id
              AND m.user_id = ?
            ) THEN 1
            ELSE 0
          END AS is_member,

          u.username AS owner_username,

          (
            SELECT COUNT(*)
            FROM study_group_members m2
            WHERE m2.group_id = g.id
          ) AS member_count

        FROM study_groups g

        JOIN users u
          ON u.id = g.owner_id

        WHERE
          COALESCE(g.visibility, 'public') = 'public'

          OR g.owner_id = ?

          OR EXISTS (
            SELECT 1
            FROM study_group_members m3
            WHERE m3.group_id = g.id
            AND m3.user_id = ?
          )

        ORDER BY g.id DESC
      `)
      .all(
        user.id,
        user.id,
        user.id,
        user.id
      );

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error(
      "GET /api/groups error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load groups.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const visibility =
      body.visibility === "private"
        ? "private"
        : "public";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Group name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Group name cannot be longer than 100 characters.",
        },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();

    const inviteCode =
      visibility === "private"
        ? generateInviteCode()
        : "";

    const result = db
      .prepare(`
        INSERT INTO study_groups (
          name,
          description,
          subject,
          owner_id,
          created_at,
          group_image,
          chat_enabled,
          visibility,
          invite_code
        )
        VALUES (?, ?, ?, ?, ?, '', 1, ?, ?)
      `)
      .run(
        name,
        description,
        subject,
        user.id,
        createdAt,
        visibility,
        inviteCode
      );

    const groupId = Number(
      result.lastInsertRowid
    );

    db.prepare(`
      INSERT INTO study_group_members (
        group_id,
        user_id,
        joined_at
      )
      VALUES (?, ?, ?)
    `).run(
      groupId,
      user.id,
      createdAt
    );

    return NextResponse.json(
      {
        success: true,
        group: {
          id: groupId,
          name,
          description,
          subject,
          visibility,
          inviteCode,
          inviteLink:
            visibility === "private"
              ? `/groups/${groupId}?invite=${inviteCode}`
              : "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/groups error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create group.",
      },
      { status: 500 }
    );
  }
}