import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

/* =========================
   Current User
========================= */

function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("studyhub_session")?.value;

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
   Get Note
========================= */

function getNote(noteId: number, groupId: number) {
  return db
    .prepare(`
      SELECT
        id,
        group_id,
        user_id,
        title,
        content,
        created_at,
        updated_at
      FROM study_group_notes
      WHERE id = ?
        AND group_id = ?
    `)
    .get(noteId, groupId) as
    | {
        id: number;
        group_id: number;
        user_id: number;
        title: string;
        content: string;
        created_at: string;
        updated_at: string;
      }
    | undefined;
}

/* =========================
   Check Membership
========================= */

function isMember(groupId: number, userId: number) {
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
   PATCH - Edit Note
========================= */

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      noteId: string;
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

    const { id, noteId: noteIdParam } = await context.params;

    const groupId = Number(id);
    const noteId = Number(noteIdParam);

    if (
      !Number.isInteger(groupId) ||
      groupId <= 0 ||
      !Number.isInteger(noteId) ||
      noteId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid group or note ID.",
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

    const note = getNote(noteId, groupId);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found.",
        },
        { status: 404 }
      );
    }

    // Note owner OR group owner can edit
    const canEdit =
      note.user_id === user.id ||
      group.owner_id === user.id;

    if (!canEdit) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to edit this note.",
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

    db.prepare(`
      UPDATE study_group_notes
      SET
        title = ?,
        content = ?,
        updated_at = ?
      WHERE id = ?
        AND group_id = ?
    `).run(
      title,
      content,
      now,
      noteId,
      groupId
    );

    const updatedNote = db
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

    return NextResponse.json({
      success: true,
      message: "Note updated successfully.",
      note: updatedNote,
    });
  } catch (error) {
    console.error(
      "PATCH /api/groups/[id]/notes/[noteId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update note.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE - Delete Note
========================= */

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      noteId: string;
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

    const { id, noteId: noteIdParam } = await context.params;

    const groupId = Number(id);
    const noteId = Number(noteIdParam);

    if (
      !Number.isInteger(groupId) ||
      groupId <= 0 ||
      !Number.isInteger(noteId) ||
      noteId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid group or note ID.",
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

    const note = getNote(noteId, groupId);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found.",
        },
        { status: 404 }
      );
    }

    // Note owner OR group owner can delete
    const canDelete =
      note.user_id === user.id ||
      group.owner_id === user.id;

    if (!canDelete) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to delete this note.",
        },
        { status: 403 }
      );
    }

    db.prepare(`
      DELETE FROM study_group_notes
      WHERE id = ?
        AND group_id = ?
    `).run(noteId, groupId);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/groups/[id]/notes/[noteId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete note.",
      },
      { status: 500 }
    );
  }
}