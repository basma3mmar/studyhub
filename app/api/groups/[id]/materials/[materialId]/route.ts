import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";

const db = new Database(path.join(process.cwd(), "studyhub.db"));

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("studyhub_session")?.value;

  if (!sessionToken) {
    return null;
  }

  const user = db
    .prepare(
      `
      SELECT users.id, users.username, users.email
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = ?
      LIMIT 1
      `
    )
    .get(sessionToken) as
    | {
        id: number;
        username: string;
        email: string;
      }
    | undefined;

  return user ?? null;
}

function parsePositiveInteger(value: string) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function getGroup(groupId: number) {
  return db
    .prepare(
      `
      SELECT id, owner_id
      FROM study_groups
      WHERE id = ?
      LIMIT 1
      `
    )
    .get(groupId) as
    | {
        id: number;
        owner_id: number;
      }
    | undefined;
}

function isMember(groupId: number, userId: number) {
  const member = db
    .prepare(
      `
      SELECT id
      FROM study_group_members
      WHERE group_id = ? AND user_id = ?
      LIMIT 1
      `
    )
    .get(groupId, userId);

  return Boolean(member);
}

// GET /api/groups/:id/materials/:materialId
export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      materialId: string;
    }>;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id, materialId } = await context.params;

    const groupId = parsePositiveInteger(id);
    const materialIdNumber = parsePositiveInteger(materialId);

    if (!groupId || !materialIdNumber) {
      return NextResponse.json(
        { error: "Invalid ID." },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);

    if (!group) {
      return NextResponse.json(
        { error: "Group not found." },
        { status: 404 }
      );
    }

    if (!isMember(groupId, user.id)) {
      return NextResponse.json(
        { error: "You are not a member of this group." },
        { status: 403 }
      );
    }

    const material = db
      .prepare(
        `
        SELECT
          m.id,
          m.group_id,
          m.user_id,
          m.title,
          m.description,
          m.file_name,
          m.file_type,
          m.file_size,
          m.file_data,
          m.created_at,
          u.username
        FROM study_group_materials m
        JOIN users u ON u.id = m.user_id
        WHERE m.id = ? AND m.group_id = ?
        LIMIT 1
        `
      )
      .get(materialIdNumber, groupId) as
      | {
          id: number;
          group_id: number;
          user_id: number;
          title: string;
          description: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_data: string;
          created_at: string;
          username: string;
        }
      | undefined;

    if (!material) {
      return NextResponse.json(
        { error: "Material not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (error) {
    console.error("GET material error:", error);

    return NextResponse.json(
      { error: "Failed to load material." },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/:id/materials/:materialId
export async function DELETE(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      materialId: string;
    }>;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id, materialId } = await context.params;

    const groupId = parsePositiveInteger(id);
    const materialIdNumber = parsePositiveInteger(materialId);

    if (!groupId || !materialIdNumber) {
      return NextResponse.json(
        { error: "Invalid ID." },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);

    if (!group) {
      return NextResponse.json(
        { error: "Group not found." },
        { status: 404 }
      );
    }

    if (!isMember(groupId, user.id)) {
      return NextResponse.json(
        { error: "You are not a member of this group." },
        { status: 403 }
      );
    }

    const material = db
      .prepare(
        `
        SELECT
          id,
          user_id
        FROM study_group_materials
        WHERE id = ? AND group_id = ?
        LIMIT 1
        `
      )
      .get(materialIdNumber, groupId) as
      | {
          id: number;
          user_id: number;
        }
      | undefined;

    if (!material) {
      return NextResponse.json(
        { error: "Material not found." },
        { status: 404 }
      );
    }

    const canDelete =
      material.user_id === user.id || group.owner_id === user.id;

    if (!canDelete) {
      return NextResponse.json(
        {
          error:
            "Only the material owner or group owner can delete this material.",
        },
        { status: 403 }
      );
    }

    db.prepare(
      `
      DELETE FROM study_group_materials
      WHERE id = ? AND group_id = ?
      `
    ).run(materialIdNumber, groupId);

    return NextResponse.json({
      success: true,
      message: "Material deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE material error:", error);

    return NextResponse.json(
      { error: "Failed to delete material." },
      { status: 500 }
    );
  }
}