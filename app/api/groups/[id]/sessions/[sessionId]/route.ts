import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { cookies } from "next/headers";

const db = new Database("studyhub.db");

async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

  if (!token) return null;

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

function getSession(sessionId: number, groupId: number) {
  return db
    .prepare(`
      SELECT
        s.id,
        s.group_id,
        s.user_id,
        s.title,
        s.subject,
        s.description,
        s.session_date,
        s.session_time,
        s.duration,
        s.created_at,
        u.username
      FROM study_group_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
        AND s.group_id = ?
    `)
    .get(sessionId, groupId) as
    | {
        id: number;
        group_id: number;
        user_id: number;
        title: string;
        subject: string;
        description: string;
        session_date: string;
        session_time: string;
        duration: number;
        created_at: string;
        username: string;
      }
    | undefined;
}

function getGroup(groupId: number) {
  return db
    .prepare(`
      SELECT id, name, owner_id
      FROM study_groups
      WHERE id = ?
    `)
    .get(groupId) as
    | {
        id: number;
        name: string;
        owner_id: number;
      }
    | undefined;
}

function createNotifications(
  groupId: number,
  creatorId: number,
  groupName: string,
  title: string,
  message: string
) {
  const members = db
    .prepare(`
      SELECT user_id
      FROM study_group_members
      WHERE group_id = ?
        AND user_id != ?
    `)
    .all(groupId, creatorId) as { user_id: number }[];

  if (members.length === 0) return;

  const createdAt = new Date().toISOString();

  const insert = db.prepare(`
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
  `);

  const transaction = db.transaction(() => {
    for (const member of members) {
      insert.run(
        member.user_id,
        "session",
        title,
        message,
        `/groups/${groupId}/sessions`,
        createdAt
      );
    }
  });

  transaction();
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      sessionId: string;
    }>;
  }
) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id, sessionId } = await params;

    const groupId = Number(id);
    const sessionIdNumber = Number(sessionId);

    if (
      !Number.isInteger(groupId) ||
      groupId <= 0 ||
      !Number.isInteger(sessionIdNumber) ||
      sessionIdNumber <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid ID." },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);

    if (!group) {
      return NextResponse.json(
        { message: "Group not found." },
        { status: 404 }
      );
    }

    const session = getSession(
      sessionIdNumber,
      groupId
    );

    if (!session) {
      return NextResponse.json(
        { message: "Session not found." },
        { status: 404 }
      );
    }

    const isCreator = session.user_id === user.id;
    const isGroupOwner = group.owner_id === user.id;

    if (!isCreator && !isGroupOwner) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to edit this session.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const subject = String(body.subject || "").trim();
    const description = String(
      body.description || ""
    ).trim();

    const sessionDate = String(
      body.sessionDate || ""
    ).trim();

    const sessionTime = String(
      body.sessionTime || ""
    ).trim();

    const duration = Number(body.duration);

    if (!title) {
      return NextResponse.json(
        { message: "Session title is required." },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { message: "Session title is too long." },
        { status: 400 }
      );
    }

    if (subject.length > 100) {
      return NextResponse.json(
        { message: "Subject is too long." },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { message: "Description is too long." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
      return NextResponse.json(
        { message: "Please select a valid date." },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(sessionTime)) {
      return NextResponse.json(
        { message: "Please select a valid time." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(duration) ||
      duration < 15 ||
      duration > 480
    ) {
      return NextResponse.json(
        {
          message:
            "Duration must be between 15 and 480 minutes.",
        },
        { status: 400 }
      );
    }

    db.prepare(`
      UPDATE study_group_sessions
      SET
        title = ?,
        subject = ?,
        description = ?,
        session_date = ?,
        session_time = ?,
        duration = ?
      WHERE id = ?
        AND group_id = ?
    `).run(
      title,
      subject,
      description,
      sessionDate,
      sessionTime,
      duration,
      sessionIdNumber,
      groupId
    );

    const updatedSession = getSession(
      sessionIdNumber,
      groupId
    );

    createNotifications(
      groupId,
      user.id,
      group.name,
      "Study Session Updated",
      `The study session "${title}" in ${group.name} was updated.`
    );

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error(
      "Failed to update study session:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to update study session.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      sessionId: string;
    }>;
  }
) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id, sessionId } = await params;

    const groupId = Number(id);
    const sessionIdNumber = Number(sessionId);

    if (
      !Number.isInteger(groupId) ||
      groupId <= 0 ||
      !Number.isInteger(sessionIdNumber) ||
      sessionIdNumber <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid ID." },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);

    if (!group) {
      return NextResponse.json(
        { message: "Group not found." },
        { status: 404 }
      );
    }

    const session = getSession(
      sessionIdNumber,
      groupId
    );

    if (!session) {
      return NextResponse.json(
        { message: "Session not found." },
        { status: 404 }
      );
    }

    const isCreator = session.user_id === user.id;
    const isGroupOwner = group.owner_id === user.id;

    if (!isCreator && !isGroupOwner) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to delete this session.",
        },
        { status: 403 }
      );
    }

    db.prepare(`
      DELETE FROM study_group_sessions
      WHERE id = ?
        AND group_id = ?
    `).run(
      sessionIdNumber,
      groupId
    );

    createNotifications(
      groupId,
      user.id,
      group.name,
      "Study Session Deleted",
      `The study session "${session.title}" was deleted from ${group.name}.`
    );

    return NextResponse.json({
      success: true,
      message: "Study session deleted.",
    });
  } catch (error) {
    console.error(
      "Failed to delete study session:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to delete study session.",
      },
      { status: 500 }
    );
  }
}