import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

/* =========================
   Create Notes Table
========================= */

db.exec(`
  CREATE TABLE IF NOT EXISTS study_group_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

/* =========================
   Current User
========================= */

function getCurrentUser(request: NextRequest) {
  const token =
    request.cookies.get("studyhub_session")?.value;

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
      JOIN users
        ON users.id = sessions.user_id
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

/* =========================
   Get Group
========================= */

function getGroup(groupId: number) {
  return db
    .prepare(`
      SELECT
        id,
        owner_id
      FROM study_groups
      WHERE id = ?
    `)
    .get(groupId) as
    | {
        id: number;
        owner_id: number;
      }
    | undefined;
}

/* =========================
   Check Membership
========================= */

function isMember(
  groupId: number,
  userId: number
) {
  return Boolean(
    db
      .prepare(`
        SELECT 1
        FROM study_group_members
        WHERE group_id = ?
          AND user_id = ?
      `)
      .get(groupId, userId)
  );
}

/* =========================
   GET /api/groups/[id]/notes
========================= */

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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

    const { id } = await context.params;
    const groupId = Number(id);

    if (
      !Number.isInteger(groupId) ||
      groupId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid group ID.",
        },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          message: "Group not found.",
        },
        { status: 404 }
      );
    }

    if (!isMember(groupId, user.id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be a member of this group.",
        },
        { status: 403 }
      );
    }

    const notes = db
      .prepare(`
        SELECT
          n.id,
          n.group_id,
          n.user_id,
          n.title,
          n.content,
          n.created_at,
          n.updated_at,
          u.username
        FROM study_group_notes n
        JOIN users u
          ON u.id = n.user_id
        WHERE n.group_id = ?
        ORDER BY n.updated_at DESC
      `)
      .all(groupId);

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error(
      "GET /api/groups/[id]/notes error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load notes.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   POST /api/groups/[id]/notes
========================= */

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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

    const { id } = await context.params;
    const groupId = Number(id);

    if (
      !Number.isInteger(groupId) ||
      groupId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid group ID.",
        },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          message: "Group not found.",
        },
        { status: 404 }
      );
    }

    if (!isMember(groupId, user.id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be a member of this group.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Note title is required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Note title cannot exceed 200 characters.",
        },
        { status: 400 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Note content cannot exceed 10000 characters.",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const result = db
      .prepare(`
        INSERT INTO study_group_notes (
          group_id,
          user_id,
          title,
          content,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        groupId,
        user.id,
        title,
        content,
        now,
        now
      );

    const noteId = Number(
      result.lastInsertRowid
    );

    const note = db
      .prepare(`
        SELECT
          n.id,
          n.group_id,
          n.user_id,
          n.title,
          n.content,
          n.created_at,
          n.updated_at,
          u.username
        FROM study_group_notes n
        JOIN users u
          ON u.id = n.user_id
        WHERE n.id = ?
      `)
      .get(noteId);

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully.",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/groups/[id]/notes error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create note.",
      },
      { status: 500 }
    );
  }
}