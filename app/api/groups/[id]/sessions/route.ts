import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { cookies } from "next/headers";

const db = new Database("studyhub.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS study_group_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    subject TEXT DEFAULT '',
    description TEXT DEFAULT '',
    session_date TEXT NOT NULL,
    session_time TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT DEFAULT '',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);

async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

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

function getGroup(groupId: number) {
  return db
    .prepare(`
      SELECT
        id,
        name,
        owner_id
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

function isMember(groupId: number, userId: number) {
  const member = db
    .prepare(`
      SELECT id
      FROM study_group_members
      WHERE group_id = ?
        AND user_id = ?
    `)
    .get(groupId, userId);

  return Boolean(member);
}

function getSessions(groupId: number) {
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
      WHERE s.group_id = ?
      ORDER BY
        s.session_date ASC,
        s.session_time ASC
    `)
    .all(groupId);
}

function createSessionNotifications(
  groupId: number,
  creatorId: number,
  groupName: string,
  sessionTitle: string
) {
  const members = db
    .prepare(`
      SELECT user_id
      FROM study_group_members
      WHERE group_id = ?
        AND user_id != ?
    `)
    .all(groupId, creatorId) as { user_id: number }[];

  if (members.length === 0) {
    return;
  }

  const createdAt = new Date().toISOString();

  const insertNotification = db.prepare(`
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

  const insertMany = db.transaction(() => {
    for (const member of members) {
      insertNotification.run(
        member.user_id,
        "session",
        "New Study Session",
        `A new study session "${sessionTitle}" was created in ${groupName}.`,
        `/groups/${groupId}/sessions`,
        createdAt
      );
    }
  });

  insertMany();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        {
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const groupId = Number(id);

    if (!Number.isInteger(groupId) || groupId <= 0) {
      return NextResponse.json(
        {
          message: "Invalid group ID.",
        },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);

    if (!group) {
      return NextResponse.json(
        {
          message: "Group not found.",
        },
        { status: 404 }
      );
    }

    if (!isMember(groupId, user.id)) {
      return NextResponse.json(
        {
          message: "You must be a member of this group.",
        },
        { status: 403 }
      );
    }

    const sessions = getSessions(groupId);

    return NextResponse.json({
      sessions,
    });
  } catch (error) {
    console.error(
      "Failed to load study sessions:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load study sessions.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        {
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const groupId = Number(id);

    if (!Number.isInteger(groupId) || groupId <= 0) {
      return NextResponse.json(
        {
          message: "Invalid group ID.",
        },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);

    if (!group) {
      return NextResponse.json(
        {
          message: "Group not found.",
        },
        { status: 404 }
      );
    }

    if (!isMember(groupId, user.id)) {
      return NextResponse.json(
        {
          message: "You must be a member of this group.",
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
        {
          message: "Session title is required.",
        },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        {
          message: "Session title is too long.",
        },
        { status: 400 }
      );
    }

    if (subject.length > 100) {
      return NextResponse.json(
        {
          message: "Subject is too long.",
        },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        {
          message: "Description is too long.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
      return NextResponse.json(
        {
          message: "Please select a valid date.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(sessionTime)) {
      return NextResponse.json(
        {
          message: "Please select a valid time.",
        },
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

    const createdAt = new Date().toISOString();

    const result = db
      .prepare(`
        INSERT INTO study_group_sessions
        (
          group_id,
          user_id,
          title,
          subject,
          description,
          session_date,
          session_time,
          duration,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        groupId,
        user.id,
        title,
        subject,
        description,
        sessionDate,
        sessionTime,
        duration,
        createdAt
      );

    const session = db
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
      `)
      .get(result.lastInsertRowid);

    createSessionNotifications(
      groupId,
      user.id,
      group.name,
      title
    );

    return NextResponse.json(
      {
        success: true,
        session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Failed to create study session:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to create study session.",
      },
      { status: 500 }
    );
  }
}