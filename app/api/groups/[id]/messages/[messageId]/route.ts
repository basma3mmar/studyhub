import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

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

ensureMessagePinColumn();

function getCurrentUser(request: NextRequest) {
  const token =
    request.cookies.get("studyhub_session")?.value;

  if (!token) {
    return null;
  }

  return (
    db
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
      | undefined
  );
}

async function getIds(
  context: {
    params: Promise<{
      id: string;
      messageId: string;
    }>;
  }
) {
  const params = await context.params;

  const groupId = Number(params.id);
  const messageId = Number(params.messageId);

  if (
    !Number.isInteger(groupId) ||
    groupId <= 0 ||
    !Number.isInteger(messageId) ||
    messageId <= 0
  ) {
    return null;
  }

  return {
    groupId,
    messageId,
  };
}

function isGroupOwner(
  groupId: number,
  userId: number
) {
  const group = db
    .prepare(`
      SELECT owner_id
      FROM study_groups
      WHERE id = ?
    `)
    .get(groupId) as
    | {
        owner_id: number;
      }
    | undefined;

  return group?.owner_id === userId;
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

function getFullMessage(
  groupId: number,
  messageId: number
) {
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
      WHERE study_group_messages.id = ?
      AND study_group_messages.group_id = ?
    `)
    .get(messageId, groupId);
}

// ======================================================
// PATCH MESSAGE
// EDIT / PIN / UNPIN
// ======================================================

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      messageId: string;
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

    const ids = await getIds(context);

    if (!ids) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid message.",
        },
        { status: 400 }
      );
    }

    const { groupId, messageId } = ids;

    const message = db
      .prepare(`
        SELECT
          id,
          group_id,
          user_id,
          message,
          is_pinned
        FROM study_group_messages
        WHERE id = ?
        AND group_id = ?
      `)
      .get(messageId, groupId) as
      | {
          id: number;
          group_id: number;
          user_id: number;
          message: string;
          is_pinned: number;
        }
      | undefined;

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const action =
      typeof body.action === "string"
        ? body.action
        : "edit";

    const owner = isGroupOwner(
      groupId,
      user.id
    );

    // ==================================================
    // PIN / UNPIN MESSAGE
    // ==================================================

    if (action === "pin") {
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

      const canPin =
        message.user_id === user.id ||
        owner;

      if (!canPin) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You can only pin your own messages.",
          },
          { status: 403 }
        );
      }

      const requestedPinned =
        typeof body.isPinned === "boolean"
          ? body.isPinned
          : !Boolean(message.is_pinned);

      // ================================================
      // MAXIMUM 5 PINNED MESSAGES PER GROUP
      // ================================================

      if (
        requestedPinned &&
        !Boolean(message.is_pinned)
      ) {
        const pinnedCount = db
          .prepare(`
            SELECT COUNT(*) as count
            FROM study_group_messages
            WHERE group_id = ?
            AND is_pinned = 1
          `)
          .get(groupId) as {
            count: number;
          };

        if (pinnedCount.count >= 5) {
          return NextResponse.json(
            {
              success: false,
              message:
                "You can pin up to 5 messages only.",
            },
            { status: 400 }
          );
        }
      }

      db.prepare(`
        UPDATE study_group_messages
        SET is_pinned = ?
        WHERE id = ?
        AND group_id = ?
      `).run(
        requestedPinned ? 1 : 0,
        messageId,
        groupId
      );

      const updatedMessage =
        getFullMessage(
          groupId,
          messageId
        );

      return NextResponse.json({
        success: true,
        message: updatedMessage,
      });
    }

    // ==================================================
    // EDIT MESSAGE
    // ==================================================

    if (action !== "edit") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid message action.",
        },
        { status: 400 }
      );
    }

    if (
      message.user_id !== user.id &&
      !owner
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only edit your own messages.",
        },
        { status: 403 }
      );
    }

    const newMessage =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!newMessage) {
      return NextResponse.json(
        {
          success: false,
          message: "Message cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (newMessage.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message cannot be longer than 2000 characters.",
        },
        { status: 400 }
      );
    }

    db.prepare(`
      UPDATE study_group_messages
      SET message = ?
      WHERE id = ?
      AND group_id = ?
    `).run(
      newMessage,
      messageId,
      groupId
    );

    const updatedMessage =
      getFullMessage(
        groupId,
        messageId
      );

    return NextResponse.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error(
      "PATCH message error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update message.",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// DELETE MESSAGE
// ======================================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      messageId: string;
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

    const ids = await getIds(context);

    if (!ids) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid message.",
        },
        { status: 400 }
      );
    }

    const { groupId, messageId } = ids;

    const message = db
      .prepare(`
        SELECT
          id,
          user_id
        FROM study_group_messages
        WHERE id = ?
        AND group_id = ?
      `)
      .get(messageId, groupId) as
      | {
          id: number;
          user_id: number;
        }
      | undefined;

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found.",
        },
        { status: 404 }
      );
    }

    const owner = isGroupOwner(
      groupId,
      user.id
    );

    if (
      message.user_id !== user.id &&
      !owner
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only delete your own messages.",
        },
        { status: 403 }
      );
    }

    db.prepare(`
      DELETE FROM study_group_messages
      WHERE id = ?
      AND group_id = ?
    `).run(
      messageId,
      groupId
    );

    return NextResponse.json({
      success: true,
      message:
        "Message deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE message error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete message.",
      },
      { status: 500 }
    );
  }
}