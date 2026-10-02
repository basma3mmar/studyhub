import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";
import crypto from "crypto";

const db = new Database(path.join(process.cwd(), "studyhub.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS study_group_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    file_name TEXT NOT NULL,
    file_type TEXT DEFAULT '',
    file_size INTEGER DEFAULT 0,
    file_data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES study_groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

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

function getGroup(groupId: number) {
  return db
    .prepare(
      `
      SELECT
        id,
        name,
        owner_id
      FROM study_groups
      WHERE id = ?
      LIMIT 1
      `
    )
    .get(groupId) as
    | {
        id: number;
        name: string;
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

function parseGroupId(value: string) {
  const groupId = Number(value);

  if (!Number.isInteger(groupId) || groupId <= 0) {
    return null;
  }

  return groupId;
}

// GET /api/groups/:id/materials
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const groupId = parseGroupId(id);

    if (!groupId) {
      return NextResponse.json(
        { error: "Invalid group ID." },
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

    const materials = db
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
          m.created_at,
          u.username
        FROM study_group_materials m
        JOIN users u ON u.id = m.user_id
        WHERE m.group_id = ?
        ORDER BY m.created_at DESC
        `
      )
      .all(groupId);

    return NextResponse.json({
      success: true,
      materials,
    });
  } catch (error) {
    console.error("GET materials error:", error);

    return NextResponse.json(
      { error: "Failed to load materials." },
      { status: 500 }
    );
  }
}

// POST /api/groups/:id/materials
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const groupId = parseGroupId(id);

    if (!groupId) {
      return NextResponse.json(
        { error: "Invalid group ID." },
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

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const fileName =
      typeof body.fileName === "string"
        ? body.fileName.trim()
        : "";

    const fileType =
      typeof body.fileType === "string"
        ? body.fileType.trim()
        : "";

    const fileData =
      typeof body.fileData === "string"
        ? body.fileData
        : "";

    const fileSize =
      typeof body.fileSize === "number" && body.fileSize >= 0
        ? body.fileSize
        : 0;

    if (!title) {
      return NextResponse.json(
        { error: "Material title is required." },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: "Material title must be 200 characters or less." },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { error: "Description must be 1000 characters or less." },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required." },
        { status: 400 }
      );
    }

    if (!fileData.startsWith("data:")) {
      return NextResponse.json(
        { error: "Invalid file data." },
        { status: 400 }
      );
    }

    if (fileData.length > 7_000_000) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (fileType && !allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "This file type is not supported." },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();

    const result = db
      .prepare(
        `
        INSERT INTO study_group_materials (
          group_id,
          user_id,
          title,
          description,
          file_name,
          file_type,
          file_size,
          file_data,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        groupId,
        user.id,
        title,
        description,
        fileName,
        fileType,
        fileSize,
        fileData,
        createdAt
      );

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
          m.created_at,
          u.username
        FROM study_group_materials m
        JOIN users u ON u.id = m.user_id
        WHERE m.id = ?
        LIMIT 1
        `
      )
      .get(result.lastInsertRowid);

    return NextResponse.json(
      {
        success: true,
        material,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST material error:", error);

    return NextResponse.json(
      { error: "Failed to upload material." },
      { status: 500 }
    );
  }
}