import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

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

const hasGroupImage = columns.some(
  (column) => column.name === "group_image"
);

if (!hasGroupImage) {
  db.exec(`
    ALTER TABLE study_groups
    ADD COLUMN group_image TEXT DEFAULT ''
  `);
}

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

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
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

    const { id } = await context.params;
    const groupId = Number(id);

    if (
      !Number.isInteger(groupId) ||
      groupId <= 0
    ) {
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
          owner_id,
          chat_enabled,
          COALESCE(group_image, '') AS group_image
        FROM study_groups
        WHERE id = ?
      `)
      .get(groupId) as
      | {
          owner_id: number;
          chat_enabled: number;
          group_image: string;
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

    if (group.owner_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the group owner can change group settings.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const hasChatSetting =
      typeof body.chatEnabled !== "undefined";

    const hasImageSetting =
      typeof body.groupImage !== "undefined";

    if (!hasChatSetting && !hasImageSetting) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No valid setting was provided.",
        },
        { status: 400 }
      );
    }

    // Update chat status if provided.
    if (hasChatSetting) {
      if (
        typeof body.chatEnabled !== "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "chatEnabled must be a boolean.",
          },
          { status: 400 }
        );
      }

      db.prepare(`
        UPDATE study_groups
        SET chat_enabled = ?
        WHERE id = ?
      `).run(
        body.chatEnabled ? 1 : 0,
        groupId
      );
    }

    // Update group image if provided.
    if (hasImageSetting) {
      if (
        body.groupImage !== "" &&
        (
          typeof body.groupImage !== "string" ||
          !body.groupImage.startsWith("data:image/")
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid group image.",
          },
          { status: 400 }
        );
      }

      // Prevent extremely large images.
      if (
        typeof body.groupImage === "string" &&
        body.groupImage.length > 3000000
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Group image is too large. Maximum size is 2MB.",
          },
          { status: 400 }
        );
      }

      db.prepare(`
        UPDATE study_groups
        SET group_image = ?
        WHERE id = ?
      `).run(
        body.groupImage,
        groupId
      );
    }

    const updatedGroup = db
      .prepare(`
        SELECT
          chat_enabled,
          COALESCE(group_image, '') AS group_image
        FROM study_groups
        WHERE id = ?
      `)
      .get(groupId) as {
        chat_enabled: number;
        group_image: string;
      };

    return NextResponse.json({
      success: true,
      chatEnabled:
        Boolean(updatedGroup.chat_enabled),
      groupImage:
        updatedGroup.group_image,
    });
  } catch (error) {
    console.error(
      "PATCH /api/groups/[id]/settings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update group settings.",
      },
      { status: 500 }
    );
  }
}