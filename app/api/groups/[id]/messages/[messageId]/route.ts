import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("studyhub_session")?.value;

  if (!token) {
    return null;
  }

  return (
    db
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

// EDIT MESSAGE
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
          message
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
            "You can only edit your own messages.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

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

    const updatedMessage = db
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
      .get(messageId);

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
        message: "Failed to edit message.",
      },
      { status: 500 }
    );
  }
}

// DELETE MESSAGE
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
    `).run(messageId, groupId);

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully.",
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