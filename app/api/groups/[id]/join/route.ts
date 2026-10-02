import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS study_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TEXT NOT NULL,
    UNIQUE(group_id, user_id)
  );
`);

function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("studyhub_session")?.value;

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

    if (!Number.isInteger(groupId) || groupId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid group ID.",
        },
        { status: 400 }
      );
    }

    const group = db
      .prepare(`
        SELECT id, name
        FROM study_groups
        WHERE id = ?
      `)
      .get(groupId) as
      | {
          id: number;
          name: string;
        }
      | undefined;

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          message: "Group not found.",
        },
        { status: 404 }
      );
    }

    const existingMember = db
      .prepare(`
        SELECT id
        FROM study_group_members
        WHERE group_id = ?
        AND user_id = ?
      `)
      .get(groupId, user.id);

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already a member of this group.",
        },
        { status: 409 }
      );
    }

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
      new Date().toISOString()
    );

    const memberCount = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM study_group_members
        WHERE group_id = ?
      `)
      .get(groupId) as {
        count: number;
      };

    return NextResponse.json({
      success: true,
      message: `You joined ${group.name}.`,
      memberCount: memberCount.count,
    });
  } catch (error) {
    console.error("POST /api/groups/[id]/join error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to join group.",
      },
      { status: 500 }
    );
  }
}