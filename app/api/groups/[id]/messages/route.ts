import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS study_group_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

/*
  Make sure chat_enabled exists.
  Existing groups get chat enabled by default.
*/
const columns = db
  .prepare(`PRAGMA table_info(study_groups)`)
  .all() as Array<{
    name: string;
  }>;

const hasChatEnabled = columns.some(
  (column) => column.name === "chat_enabled"
);

if (!hasChatEnabled) {
  db.exec(`
    ALTER TABLE study_groups
    ADD COLUMN chat_enabled INTEGER NOT NULL DEFAULT 1
  `);
}

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

async function getGroupId(
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await context.params;
  const groupId = Number(id);

  if (!Number.isInteger(groupId) || groupId <= 0) {
    return null;
  }

  return groupId;
}

// GET messages
export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
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

    const groupId = await getGroupId(context);

    if (!groupId) {
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
          COALESCE(chat_enabled, 1) AS chat_enabled
        FROM study_groups
        WHERE id = ?
      `)
      .get(groupId) as
      | {
          id: number;
          chat_enabled: number;
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

    const member = db
      .prepare(`
        SELECT id
        FROM study_group_members
        WHERE group_id = ?
        AND user_id = ?
      `)
      .get(groupId, user.id);

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not a member of this group.",
        },
        { status: 403 }
      );
    }

    const messages = db
      .prepare(`
        SELECT
          study_group_messages.id,
          study_group_messages.group_id,
          study_group_messages.user_id,
          study_group_messages.message,
          study_group_messages.created_at,
          users.username
        FROM study_group_messages
        JOIN users
          ON users.id = study_group_messages.user_id
        WHERE study_group_messages.group_id = ?
        ORDER BY study_group_messages.id ASC
      `)
      .all(groupId);

    return NextResponse.json({
      success: true,
      chatEnabled: Boolean(group.chat_enabled),
      messages,
    });
  } catch (error) {
    console.error(
      "GET /api/groups/[id]/messages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load messages.",
      },
      { status: 500 }
    );
  }
}

// POST message
export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
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

    const groupId = await getGroupId(context);

    if (!groupId) {
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
          COALESCE(chat_enabled, 1) AS chat_enabled
        FROM study_groups
        WHERE id = ?
      `)
      .get(groupId) as
      | {
          id: number;
          chat_enabled: number;
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

    const member = db
      .prepare(`
        SELECT id
        FROM study_group_members
        WHERE group_id = ?
        AND user_id = ?
      `)
      .get(groupId, user.id);

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not a member of this group.",
        },
        { status: 403 }
      );
    }

    /*
      Chat is closed by the group owner.
      Members can still read old messages,
      but they cannot send new ones.
    */
    if (!group.chat_enabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Group chat is currently closed.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message cannot be longer than 2000 characters.",
        },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();

    const result = db
      .prepare(`
        INSERT INTO study_group_messages (
          group_id,
          user_id,
          message,
          created_at
        )
        VALUES (?, ?, ?, ?)
      `)
      .run(
        groupId,
        user.id,
        message,
        createdAt
      );

    const newMessage = db
      .prepare(`
        SELECT
          study_group_messages.id,
          study_group_messages.group_id,
          study_group_messages.user_id,
          study_group_messages.message,
          study_group_messages.created_at,
          users.username
        FROM study_group_messages
        JOIN users
          ON users.id = study_group_messages.user_id
        WHERE study_group_messages.id = ?
      `)
      .get(result.lastInsertRowid);

    return NextResponse.json(
      {
        success: true,
        message: newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/groups/[id]/messages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message.",
      },
      { status: 500 }
    );
  }
}