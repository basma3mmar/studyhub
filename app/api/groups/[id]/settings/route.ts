import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import crypto from "crypto";

const db = new Database("studyhub.db");

function ensureColumn(
  table: string,
  column: string,
  definition: string
) {
  const columns = db
    .prepare(`PRAGMA table_info(${table})`)
    .all() as Array<{ name: string }>;

  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn(
  "study_groups",
  "chat_enabled",
  "INTEGER NOT NULL DEFAULT 1"
);

ensureColumn(
  "study_groups",
  "group_image",
  "TEXT DEFAULT ''"
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

function generateInviteCode() {
  return crypto
    .randomBytes(6)
    .toString("base64url")
    .slice(0, 8)
    .toUpperCase();
}

export async function PATCH(
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

    const group = db
      .prepare(`
        SELECT
          id,
          owner_id,
          COALESCE(visibility, 'public') AS visibility,
          COALESCE(invite_code, '') AS invite_code
        FROM study_groups
        WHERE id = ?
      `)
      .get(groupId) as
      | {
          id: number;
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

    if (group.owner_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the group owner can change group settings.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updates: string[] = [];
    const values: unknown[] = [];

    if (typeof body.chatEnabled === "boolean") {
      updates.push("chat_enabled = ?");
      values.push(body.chatEnabled ? 1 : 0);
    }

    if (
      typeof body.groupImage === "string" &&
      body.groupImage.startsWith("data:image/")
    ) {
      if (body.groupImage.length > 3000000) {
        return NextResponse.json(
          {
            success: false,
            message: "Group image cannot be larger than 2MB.",
          },
          { status: 400 }
        );
      }

      updates.push("group_image = ?");
      values.push(body.groupImage);
    }

    let visibility = group.visibility;
    let inviteCode = group.invite_code;

    if (
      body.visibility === "public" ||
      body.visibility === "private"
    ) {
      visibility = body.visibility;

      if (visibility === "private" && !inviteCode) {
        inviteCode = generateInviteCode();
      }

      if (visibility === "public") {
        inviteCode = "";
      }

      updates.push("visibility = ?");
      values.push(visibility);

      updates.push("invite_code = ?");
      values.push(inviteCode);
    }

    if (updates.length > 0) {
      values.push(groupId);

      db.prepare(`
        UPDATE study_groups
        SET ${updates.join(", ")}
        WHERE id = ?
      `).run(...values);
    }

    return NextResponse.json({
      success: true,
      chatEnabled:
        typeof body.chatEnabled === "boolean"
          ? body.chatEnabled
          : undefined,
      visibility,
      inviteCode,
      inviteLink:
        visibility === "private"
          ? `/groups/${groupId}?invite=${inviteCode}`
          : "",
    });
  } catch (error) {
    console.error(
      "PATCH /api/groups/[id]/settings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update group settings.",
      },
      { status: 500 }
    );
  }
}