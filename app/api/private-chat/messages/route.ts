import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const dbPath = path.join(process.cwd(), "studyhub.db");

const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "private-chat"
);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "pdf",
  "txt",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "rar",
  "webm",
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "mp4",
  "aac",
]);

type SessionUser = {
  id: number;
  username: string;
  email: string;
};

type MessageRow = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: number;
  is_pinned: number;
  created_at: string;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_url: string | null;
  attachment_size: number | null;
};

function getDatabase() {
  return new Database(dbPath);
}

async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get("studyhub_session")?.value;

  if (!sessionToken) {
    return null;
  }

  const db = getDatabase();

  try {
    const user = db
      .prepare(
        `
        SELECT
          users.id,
          users.username,
          users.email
        FROM sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        WHERE sessions.token = ?
        LIMIT 1
        `
      )
      .get(sessionToken) as
      | SessionUser
      | undefined;

    return user ?? null;
  } finally {
    db.close();
  }
}

function ensurePrivateMessagesTable(
  db: Database.Database
) {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS private_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      is_read INTEGER NOT NULL DEFAULT 0,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      attachment_name TEXT,
      attachment_type TEXT,
      attachment_url TEXT,
      attachment_size INTEGER,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
    `
  ).run();

  const columns = db
    .prepare(
      `
      PRAGMA table_info(private_messages)
      `
    )
    .all() as Array<{
    name: string;
  }>;

  const existingColumns = new Set(
    columns.map((column) => column.name)
  );

  if (!existingColumns.has("is_pinned")) {
    db.prepare(
      `
      ALTER TABLE private_messages
      ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0
      `
    ).run();
  }

  if (!existingColumns.has("attachment_name")) {
    db.prepare(
      `
      ALTER TABLE private_messages
      ADD COLUMN attachment_name TEXT
      `
    ).run();
  }

  if (!existingColumns.has("attachment_type")) {
    db.prepare(
      `
      ALTER TABLE private_messages
      ADD COLUMN attachment_type TEXT
      `
    ).run();
  }

  if (!existingColumns.has("attachment_url")) {
    db.prepare(
      `
      ALTER TABLE private_messages
      ADD COLUMN attachment_url TEXT
      `
    ).run();
  }

  if (!existingColumns.has("attachment_size")) {
    db.prepare(
      `
      ALTER TABLE private_messages
      ADD COLUMN attachment_size INTEGER
      `
    ).run();
  }

  db.prepare(
    `
    CREATE INDEX IF NOT EXISTS idx_private_messages_conversation
    ON private_messages(sender_id, receiver_id, created_at)
    `
  ).run();

  db.prepare(
    `
    CREATE INDEX IF NOT EXISTS idx_private_messages_receiver_read
    ON private_messages(receiver_id, is_read, created_at)
    `
  ).run();

  db.prepare(
    `
    CREATE INDEX IF NOT EXISTS idx_private_messages_pinned
    ON private_messages(is_pinned, created_at)
    `
  ).run();
}

function getFileExtension(
  fileName: string
) {
  const cleanName =
    fileName.split("?")[0];

  const parts =
    cleanName.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[
    parts.length - 1
  ].toLowerCase();
}

function sanitizeFileName(
  fileName: string
) {
  return fileName
    .replace(/[^\w.\-()\s]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 150);
}

function formatMessage(
  message: MessageRow
) {
  return {
    id: message.id,
    sender_id: message.sender_id,
    receiver_id: message.receiver_id,
    message: message.message,
    is_read: message.is_read,
    is_pinned: Boolean(message.is_pinned),
    created_at: message.created_at,
    attachment_name:
      message.attachment_name,
    attachment_type:
      message.attachment_type,
    attachment_url:
      message.attachment_url,
    attachment_size:
      message.attachment_size,
  };
}

export async function GET(
  request: Request
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message:
            "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const url = new URL(request.url);

    const userIdValue =
      url.searchParams.get(
        "userId"
      );

    const userId =
      Number(userIdValue);

    if (
      !userIdValue ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid user ID.",
        },
        { status: 400 }
      );
    }

    if (
      userId ===
      currentUser.id
    ) {
      return NextResponse.json(
        {
          message:
            "You cannot chat with yourself.",
        },
        { status: 400 }
      );
    }

    const db = getDatabase();

    try {
      ensurePrivateMessagesTable(db);

      const otherUser =
        db
          .prepare(
            `
            SELECT
              id,
              username,
              email
            FROM users
            WHERE id = ?
            LIMIT 1
            `
          )
          .get(userId) as
          | {
              id: number;
              username: string;
              email: string;
            }
          | undefined;

      if (!otherUser) {
        return NextResponse.json(
          {
            message:
              "User not found.",
          },
          { status: 404 }
        );
      }

      const rows =
        db
          .prepare(
            `
            SELECT
              id,
              sender_id,
              receiver_id,
              message,
              is_read,
              is_pinned,
              created_at,
              attachment_name,
              attachment_type,
              attachment_url,
              attachment_size
            FROM private_messages
            WHERE
              (
                sender_id = ?
                AND receiver_id = ?
              )
              OR
              (
                sender_id = ?
                AND receiver_id = ?
              )
            ORDER BY id ASC
            `
          )
          .all(
            currentUser.id,
            userId,
            userId,
            currentUser.id
          ) as MessageRow[];

      db.prepare(
        `
        UPDATE private_messages
        SET is_read = 1
        WHERE
          sender_id = ?
          AND receiver_id = ?
          AND is_read = 0
        `
      ).run(
        userId,
        currentUser.id
      );

      const messages =
        rows.map(formatMessage);

      return NextResponse.json({
        currentUser,
        user: otherUser,
        messages,
      });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error(
      "PRIVATE CHAT GET MESSAGES ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load messages.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  let uploadedFilePath = "";

  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message:
            "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const formData =
      await request.formData();

    const receiverIdValue =
      formData.get(
        "receiverId"
      );

    const messageValue =
      formData.get("message");

    const fileValue =
      formData.get("file");

    const receiverId =
      Number(receiverIdValue);

    if (
      !receiverIdValue ||
      !Number.isInteger(
        receiverId
      ) ||
      receiverId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid receiver ID.",
        },
        { status: 400 }
      );
    }

    if (
      receiverId ===
      currentUser.id
    ) {
      return NextResponse.json(
        {
          message:
            "You cannot send a message to yourself.",
        },
        { status: 400 }
      );
    }

    const message =
      typeof messageValue ===
      "string"
        ? messageValue.trim()
        : "";

    if (message.length > 5000) {
      return NextResponse.json(
        {
          message:
            "Message is too long. Maximum 5000 characters.",
        },
        { status: 400 }
      );
    }

    let fileName: string | null =
      null;

    let fileType: string | null =
      null;

    let fileUrl: string | null =
      null;

    let fileSize: number | null =
      null;

    if (
      fileValue instanceof File &&
      fileValue.size > 0
    ) {
      if (
        fileValue.size >
        MAX_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            message:
              "File is too large. Maximum size is 10 MB.",
          },
          { status: 400 }
        );
      }

      const originalName =
        fileValue.name ||
        "file";

      const extension =
        getFileExtension(
          originalName
        );

      if (
        !extension ||
        !allowedExtensions.has(
          extension
        )
      ) {
        return NextResponse.json(
          {
            message:
              "This file type is not supported.",
          },
          { status: 400 }
        );
      }

      await fs.mkdir(
        uploadDirectory,
        {
          recursive: true,
        }
      );

      const safeName =
        sanitizeFileName(
          originalName
        );

      const uniqueName =
        `${crypto.randomUUID()}-${safeName}`;

      uploadedFilePath =
        path.join(
          uploadDirectory,
          uniqueName
        );

      const fileBuffer =
        Buffer.from(
          await fileValue.arrayBuffer()
        );

      await fs.writeFile(
        uploadedFilePath,
        fileBuffer
      );

      fileName =
        originalName;

      fileType =
        fileValue.type ||
        "application/octet-stream";

      fileUrl =
        `/uploads/private-chat/${encodeURIComponent(
          uniqueName
        )}`;

      fileSize =
        fileValue.size;
    }

    if (
      !message &&
      !fileUrl
    ) {
      return NextResponse.json(
        {
          message:
            "Write a message or attach a file.",
        },
        { status: 400 }
      );
    }

    const db = getDatabase();

    try {
      ensurePrivateMessagesTable(db);

      const receiver =
        db
          .prepare(
            `
            SELECT id
            FROM users
            WHERE id = ?
            LIMIT 1
            `
          )
          .get(receiverId);

      if (!receiver) {
        if (uploadedFilePath) {
          await fs
            .unlink(
              uploadedFilePath
            )
            .catch(() => {});
        }

        return NextResponse.json(
          {
            message:
              "Receiver not found.",
          },
          { status: 404 }
        );
      }

      const createdAt =
        new Date().toISOString();

      const result =
        db
          .prepare(
            `
            INSERT INTO private_messages (
              sender_id,
              receiver_id,
              message,
              is_read,
              is_pinned,
              created_at,
              attachment_name,
              attachment_type,
              attachment_url,
              attachment_size
            )
            VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?, ?)
            `
          )
          .run(
            currentUser.id,
            receiverId,
            message,
            createdAt,
            fileName,
            fileType,
            fileUrl,
            fileSize
          );

      const insertedMessage =
        db
          .prepare(
            `
            SELECT
              id,
              sender_id,
              receiver_id,
              message,
              is_read,
              is_pinned,
              created_at,
              attachment_name,
              attachment_type,
              attachment_url,
              attachment_size
            FROM private_messages
            WHERE id = ?
            LIMIT 1
            `
          )
          .get(
            result.lastInsertRowid
          ) as MessageRow;

      return NextResponse.json(
        {
          success: true,
          message:
            formatMessage(
              insertedMessage
            ),
        },
        { status: 201 }
      );
    } finally {
      db.close();
    }
  } catch (error) {
    if (uploadedFilePath) {
      await fs
        .unlink(
          uploadedFilePath
        )
        .catch(() => {});
    }

    console.error(
      "PRIVATE CHAT SEND MESSAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to send message.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message:
            "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const messageId =
      Number(body?.messageId);

    if (
      !Number.isInteger(
        messageId
      ) ||
      messageId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid message ID.",
        },
        { status: 400 }
      );
    }

    const isPinned =
      body?.isPinned;

    if (
      typeof isPinned !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          message:
            "isPinned must be a boolean.",
        },
        { status: 400 }
      );
    }

    const db = getDatabase();

    try {
      ensurePrivateMessagesTable(db);

      const message =
        db
          .prepare(
            `
            SELECT
              id,
              sender_id,
              receiver_id,
              is_pinned
            FROM private_messages
            WHERE id = ?
            LIMIT 1
            `
          )
          .get(messageId) as
          | {
              id: number;
              sender_id: number;
              receiver_id: number;
              is_pinned: number;
            }
          | undefined;

      if (!message) {
        return NextResponse.json(
          {
            message:
              "Message not found.",
          },
          { status: 404 }
        );
      }

      const belongsToConversation =
        message.sender_id ===
          currentUser.id ||
        message.receiver_id ===
          currentUser.id;

      if (
        !belongsToConversation
      ) {
        return NextResponse.json(
          {
            message:
              "You are not allowed to modify this message.",
          },
          { status: 403 }
        );
      }

      const conversationUserId =
        message.sender_id ===
        currentUser.id
          ? message.receiver_id
          : message.sender_id;

      const updatePin =
        db.transaction(() => {
          if (
            isPinned &&
            !Boolean(
              message.is_pinned
            )
          ) {
            const pinnedCount =
              db
                .prepare(
                  `
                  SELECT COUNT(*) as count
                  FROM private_messages
                  WHERE
                    is_pinned = 1
                    AND (
                      (
                        sender_id = ?
                        AND receiver_id = ?
                      )
                      OR
                      (
                        sender_id = ?
                        AND receiver_id = ?
                      )
                    )
                  `
                )
                .get(
                  currentUser.id,
                  conversationUserId,
                  conversationUserId,
                  currentUser.id
                ) as {
                count: number;
              };

            if (
              pinnedCount.count >= 5
            ) {
              const oldestPinned =
                db
                  .prepare(
                    `
                    SELECT id
                    FROM private_messages
                    WHERE
                      is_pinned = 1
                      AND (
                        (
                          sender_id = ?
                          AND receiver_id = ?
                        )
                        OR
                        (
                          sender_id = ?
                          AND receiver_id = ?
                        )
                      )
                    ORDER BY id ASC
                    LIMIT 1
                    `
                  )
                  .get(
                    currentUser.id,
                    conversationUserId,
                    conversationUserId,
                    currentUser.id
                  ) as
                  | {
                      id: number;
                    }
                  | undefined;

              if (oldestPinned) {
                db.prepare(
                  `
                  UPDATE private_messages
                  SET is_pinned = 0
                  WHERE id = ?
                  `
                ).run(
                  oldestPinned.id
                );
              }
            }
          }

          db.prepare(
            `
            UPDATE private_messages
            SET is_pinned = ?
            WHERE id = ?
            `
          ).run(
            isPinned ? 1 : 0,
            messageId
          );
        });

      updatePin();

      const updatedMessage =
        db
          .prepare(
            `
            SELECT
              id,
              sender_id,
              receiver_id,
              message,
              is_read,
              is_pinned,
              created_at,
              attachment_name,
              attachment_type,
              attachment_url,
              attachment_size
            FROM private_messages
            WHERE id = ?
            LIMIT 1
            `
          )
          .get(messageId) as MessageRow;

      return NextResponse.json({
        success: true,
        message:
          formatMessage(
            updatedMessage
          ),
      });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error(
      "PRIVATE CHAT PIN MESSAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update pinned message.",
      },
      { status: 500 }
    );
  }
}
