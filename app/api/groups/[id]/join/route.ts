import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("studyhub_session")?.value;

  if (!token) return null;

  return db
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
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const body = await request.json().catch(() => ({}));

    const inviteCode =
      typeof body.inviteCode === "string"
        ? body.inviteCode.trim().toUpperCase()
        : "";

    const group = db
      .prepare(`
        SELECT
          id,
          name,
          owner_id,
          COALESCE(visibility, 'public') AS visibility,
          COALESCE(invite_code, '') AS invite_code
        FROM study_groups
        WHERE id = ?
      `)
      .get(groupId) as
      | {
          id: number;
          name: string;
          owner_id: number;
          visibility: string;
          invite_code: string;
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
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        message: "You are already a member of this group.",
      });
    }

    if (group.visibility === "private") {
      if (!inviteCode) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This is a private group. An invite code is required.",
          },
          { status: 403 }
        );
      }

      if (inviteCode !== group.invite_code) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid invite code.",
          },
          { status: 403 }
        );
      }
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
      .get(groupId) as { count: number };

    return NextResponse.json({
      success: true,
      message: "Joined group successfully.",
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