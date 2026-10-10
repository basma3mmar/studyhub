import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const dbPath = path.join(process.cwd(), "studyhub.db");

type SessionUser = {
  id: number;
  username: string;
  email: string;
};

type ConversationUser = {
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
  created_at: string;
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
      .get(sessionToken) as SessionUser | undefined;

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
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
    `
  ).run();

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
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const db = getDatabase();

    try {
      ensurePrivateMessagesTable(db);

      const conversationUsers = db
        .prepare(
          `
          SELECT DISTINCT
            CASE
              WHEN sender_id = ?
              THEN receiver_id
              ELSE sender_id
            END AS user_id
          FROM private_messages
          WHERE
            sender_id = ?
            OR receiver_id = ?
          `
        )
        .all(
          currentUser.id,
          currentUser.id,
          currentUser.id
        ) as Array<{
        user_id: number;
      }>;

      const conversations = conversationUsers
        .map((row) => {
          const user = db
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
            .get(row.user_id) as
            | ConversationUser
            | undefined;

          if (!user) {
            return null;
          }

          const lastMessage = db
            .prepare(
              `
              SELECT
                id,
                sender_id,
                receiver_id,
                message,
                is_read,
                created_at
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
              ORDER BY id DESC
              LIMIT 1
              `
            )
            .get(
              currentUser.id,
              user.id,
              user.id,
              currentUser.id
            ) as MessageRow | undefined;

          const unreadResult = db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM private_messages
              WHERE
                sender_id = ?
                AND receiver_id = ?
                AND is_read = 0
              `
            )
            .get(
              user.id,
              currentUser.id
            ) as {
            count: number;
          };

          return {
            user,
            lastMessage: lastMessage ?? null,
            unreadCount:
              Number(unreadResult.count) || 0,
          };
        })
        .filter(
          (
            conversation
          ): conversation is {
            user: ConversationUser;
            lastMessage: MessageRow | null;
            unreadCount: number;
          } => conversation !== null
        );

      conversations.sort((a, b) => {
        const aTime = a.lastMessage
          ? new Date(
              a.lastMessage.created_at
            ).getTime()
          : 0;

        const bTime = b.lastMessage
          ? new Date(
              b.lastMessage.created_at
            ).getTime()
          : 0;

        return bTime - aTime;
      });

      return NextResponse.json({
        currentUser,
        conversations,
      });
    } finally {
      db.close();
    }
  } catch (error) {
    console.error(
      "PRIVATE CHAT CONVERSATIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load conversations.",
      },
      { status: 500 }
    );
  }
}