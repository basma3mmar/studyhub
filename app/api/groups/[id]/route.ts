import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

// Make sure profile_image exists.
const userColumns = db
  .prepare(`PRAGMA table_info(users)`)
  .all() as Array<{
    name: string;
  }>;

const hasProfileImage = userColumns.some(
  (column) => column.name === "profile_image"
);

if (!hasProfileImage) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN profile_image TEXT DEFAULT ''
  `);
}

// Make sure chat_enabled and group_image exist.
const groupColumns = db
  .prepare(`PRAGMA table_info(study_groups)`)
  .all() as Array<{
    name: string;
  }>;

const hasChatEnabled = groupColumns.some(
  (column) => column.name === "chat_enabled"
);

if (!hasChatEnabled) {
  db.exec(`
    ALTER TABLE study_groups
    ADD COLUMN chat_enabled INTEGER NOT NULL DEFAULT 1
  `);
}

const hasGroupImage = groupColumns.some(
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

  const user = db
    .prepare(`
      SELECT
        users.id,
        users.username,
        users.email,
        COALESCE(
          users.profile_image,
          ''
        ) AS profile_image
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
        profile_image: string;
      }
    | undefined;

  return user || null;
}

export async function GET(
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
          g.id,
          g.name,
          g.description,
          g.subject,
          g.owner_id,
          g.created_at,
          COALESCE(
            g.chat_enabled,
            1
          ) AS chat_enabled,
          COALESCE(
            g.group_image,
            ''
          ) AS group_image,
          u.username AS owner_username,
          COALESCE(
            u.profile_image,
            ''
          ) AS owner_profile_image,
          EXISTS (
            SELECT 1
            FROM study_group_members member
            WHERE member.group_id = g.id
            AND member.user_id = ?
          ) AS is_member
        FROM study_groups g
        JOIN users u
          ON u.id = g.owner_id
        WHERE g.id = ?
      `)
      .get(
        user.id,
        groupId
      ) as
      | {
          id: number;
          name: string;
          description: string;
          subject: string;
          owner_id: number;
          created_at: string;
          chat_enabled: number;
          group_image: string;
          owner_username: string;
          owner_profile_image: string;
          is_member: number;
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

    const members = db
      .prepare(`
        SELECT
          users.id,
          users.username,
          users.email,
          COALESCE(
            users.profile_image,
            ''
          ) AS profile_image,
          study_group_members.joined_at
        FROM study_group_members
        JOIN users
          ON users.id =
             study_group_members.user_id
        WHERE study_group_members.group_id = ?
        ORDER BY study_group_members.joined_at ASC
      `)
      .all(groupId);

    return NextResponse.json({
      success: true,

      group: {
        ...group,
        chat_enabled:
          Boolean(group.chat_enabled),
        member_count: members.length,
      },

      members,
    });
  } catch (error) {
    console.error(
      "GET /api/groups/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load group.",
      },
      { status: 500 }
    );
  }
}