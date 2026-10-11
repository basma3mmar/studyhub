import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const db = new Database("studyhub.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS study_group_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    media_url TEXT,
    media_type TEXT,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

function ensureMessageMediaColumns() {
  const columns = db
    .prepare(`PRAGMA table_info(study_group_messages)`)
    .all() as Array<{ name: string }>;

  if (!columns.some((column) => column.name === "media_url")) {
    db.exec(`
      ALTER TABLE study_group_messages
      ADD COLUMN media_url TEXT
    `);
  }

  if (!columns.some((column) => column.name === "media_type")) {
    db.exec(`
      ALTER TABLE study_group_messages
      ADD COLUMN media_type TEXT
    `);
  }
}

function ensureMessagePinColumn() {
  const columns = db
    .prepare(`PRAGMA table_info(study_group_messages)`)
    .all() as Array<{ name: string }>;

  if (!columns.some((column) => column.name === "is_pinned")) {
    db.exec(`
      ALTER TABLE study_group_messages
      ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0
    `);
  }
}


function ensureChatColumn() {
  const table = db
    .prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name = 'study_groups'
    `)
    .get();

  // During build, the application database table may not exist yet.
  if (!table) {
    return;
  }

  const columns = db
    .prepare(`PRAGMA table_info(study_groups)`)
    .all() as Array<{ name: string }>;

  if (!columns.some((column) => column.name === "chat_enabled")) {
    db.exec(`
      ALTER TABLE study_groups
      ADD COLUMN chat_enabled INTEGER NOT NULL DEFAULT 1
    `);
  }
}


ensureMessageMediaColumns();
ensureMessagePinColumn();
ensureChatColumn();

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

async function getGroupId(
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const groupId = Number(id);

  if (!Number.isInteger(groupId) || groupId <= 0) {
    return null;
  }

  return groupId;
}

function isGroupMember(
  groupId: number,
  userId: number
) {
  return db
    .prepare(`
      SELECT id
      FROM study_group_members
      WHERE group_id = ?
      AND user_id = ?
    `)
    .get(groupId, userId);
}

function getMessages(groupId: number) {
  return db
    .prepare(`
      SELECT
        study_group_messages.id,
        study_group_messages.group_id,
        study_group_messages.user_id,
        study_group_messages.message,
        study_group_messages.media_url,
        study_group_messages.media_type,
        study_group_messages.is_pinned,
        study_group_messages.created_at,
        users.username
      FROM study_group_messages
      JOIN users
        ON users.id = study_group_messages.user_id
      WHERE study_group_messages.group_id = ?
      ORDER BY study_group_messages.id ASC
    `)
    .all(groupId);
}

// ======================================================
// GET MESSAGES
// ======================================================

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

    const member = isGroupMember(
      groupId,
      user.id
    );

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not a member of this group.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      chatEnabled: Boolean(group.chat_enabled),
      messages: getMessages(groupId),
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

// ======================================================
// POST MESSAGE
// ======================================================

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

    const member = isGroupMember(
      groupId,
      user.id
    );

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not a member of this group.",
        },
        { status: 403 }
      );
    }

    if (!group.chat_enabled) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Group chat is currently closed.",
        },
        { status: 403 }
      );
    }

    const contentType =
      request.headers.get("content-type") || "";

    let message = "";
    let mediaUrl: string | null = null;
    let mediaType:
      | "image"
      | "video"
      | "audio"
      | null = null;

    // ==================================================
    // MULTIPART MESSAGE
    // ==================================================

    if (
      contentType
        .toLowerCase()
        .includes("multipart/form-data")
    ) {
      const formData =
        await request.formData();

      const textValue =
        formData.get("message");

      if (typeof textValue === "string") {
        message = textValue.trim();
      }

      const fileValue =
        formData.get("file");

      if (
        !fileValue ||
        !(fileValue instanceof File)
      ) {
        if (!message) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Message or media file is required.",
            },
            { status: 400 }
          );
        }
      } else {
        const file = fileValue;

        if (file.size <= 0) {
          return NextResponse.json(
            {
              success: false,
              message: "The selected file is empty.",
            },
            { status: 400 }
          );
        }

        if (
          file.size >
          20 * 1024 * 1024
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "File size cannot be larger than 20 MB.",
            },
            { status: 400 }
          );
        }

        const fileType =
          (
            file.type ||
            ""
          ).toLowerCase();

        const fileName =
          (
            file.name ||
            ""
          ).toLowerCase();

        const isImage =
          fileType.startsWith("image/");

        const isVideo =
          fileType.startsWith("video/");

        const isAudio =
          fileType.startsWith("audio/") ||
          fileName.endsWith(".webm") ||
          fileName.endsWith(".wav") ||
          fileName.endsWith(".mp3") ||
          fileName.endsWith(".ogg") ||
          fileName.endsWith(".m4a");

        if (
          !isImage &&
          !isVideo &&
          !isAudio
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Only images, videos, and audio files are allowed.",
            },
            { status: 400 }
          );
        }

        mediaType = isImage
          ? "image"
          : isVideo
            ? "video"
            : "audio";

        const uploadDirectory =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "group-messages"
          );

        await fs.promises.mkdir(
          uploadDirectory,
          {
            recursive: true,
          }
        );

        let extension =
          path.extname(file.name);

        if (!extension) {
          if (isImage) {
            extension = ".jpg";
          } else if (isVideo) {
            extension = ".mp4";
          } else {
            extension = ".webm";
          }
        }

        const safeExtension =
          extension
            .toLowerCase()
            .replace(
              /[^a-z0-9.]/g,
              ""
            );

        const fileNameOnDisk =
          `${randomUUID()}${safeExtension}`;

        const filePath =
          path.join(
            uploadDirectory,
            fileNameOnDisk
          );

        const buffer =
          Buffer.from(
            await file.arrayBuffer()
          );

        await fs.promises.writeFile(
          filePath,
          buffer
        );

        mediaUrl =
          `/uploads/group-messages/${fileNameOnDisk}`;
      }
    } else {
      // ==================================================
      // NORMAL TEXT MESSAGE
      // ==================================================

      let body: {
        message?: unknown;
      };

      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid request body.",
          },
          { status: 400 }
        );
      }

      if (
        typeof body.message === "string"
      ) {
        message =
          body.message.trim();
      }
    }

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!message && !mediaUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message or media file is required.",
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

    // ==================================================
    // SAVE MESSAGE
    // ==================================================

    const createdAt =
      new Date().toISOString();

    const result = db
      .prepare(`
        INSERT INTO study_group_messages (
          group_id,
          user_id,
          message,
          media_url,
          media_type,
          is_pinned,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        groupId,
        user.id,
        message,
        mediaUrl,
        mediaType,
        0,
        createdAt
      );

    // ==================================================
    // GET CREATED MESSAGE
    // ==================================================

    const newMessage = db
      .prepare(`
        SELECT
          study_group_messages.id,
          study_group_messages.group_id,
          study_group_messages.user_id,
          study_group_messages.message,
          study_group_messages.media_url,
          study_group_messages.media_type,
          study_group_messages.is_pinned,
          study_group_messages.created_at,
          users.username
        FROM study_group_messages
        JOIN users
          ON users.id = study_group_messages.user_id
        WHERE study_group_messages.id = ?
      `)
      .get(
        result.lastInsertRowid
      ) as
      | {
          id: number;
          group_id: number;
          user_id: number;
          message: string;
          media_url: string | null;
          media_type:
            | "image"
            | "video"
            | "audio"
            | null;
          is_pinned: number;
          created_at: string;
          username: string;
        }
      | undefined;

    if (!newMessage) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message was saved but could not be loaded.",
        },
        { status: 500 }
      );
    }

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