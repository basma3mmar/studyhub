import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

/* =========================
   Create Tables
========================= */

db.exec(`
  CREATE TABLE IF NOT EXISTS study_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    owner_id INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TEXT NOT NULL,
    UNIQUE(group_id, user_id)
  );
`);

/* =========================
   Add group_image if missing
========================= */

const columns = db
  .prepare(`PRAGMA table_info(study_groups)`)
  .all() as Array<{
    name: string;
  }>;

const hasGroupImage = columns.some(
  (column) => column.name === "group_image"
);

if (!hasGroupImage) {
  db.exec(`
    ALTER TABLE study_groups
    ADD COLUMN group_image TEXT DEFAULT ''
  `);
}

/* =========================
   Current User
========================= */

function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("studyhub_session")?.value;

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

/* =========================
   GET /api/groups
========================= */

export async function GET(request: NextRequest) {
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

    const groups = db
      .prepare(`
        SELECT
          g.id,
          g.name,
          g.description,
          g.subject,
          g.owner_id,
          g.created_at,

          COALESCE(g.group_image, '') AS group_image,

          u.username AS owner_username,

          COUNT(m.id) AS member_count,

          EXISTS (
            SELECT 1
            FROM study_group_members my_member
            WHERE my_member.group_id = g.id
              AND my_member.user_id = ?
          ) AS is_member

        FROM study_groups g

        JOIN users u
          ON u.id = g.owner_id

        LEFT JOIN study_group_members m
          ON m.group_id = g.id

        GROUP BY g.id

        ORDER BY g.id DESC
      `)
      .all(user.id);

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error("GET /api/groups error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load groups.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   POST /api/groups
========================= */

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Group name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Group name must be at least 3 characters.",
        },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();

    const createGroup = db.transaction(() => {
      const result = db
        .prepare(`
          INSERT INTO study_groups (
            name,
            description,
            subject,
            owner_id,
            created_at,
            group_image
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          name,
          description,
          subject,
          user.id,
          createdAt,
          ""
        );

      const groupId = Number(result.lastInsertRowid);

      db.prepare(`
        INSERT INTO study_group_members (
          group_id,
          user_id,
          joined_at
        )
        VALUES (?, ?, ?)
      `).run(
        groupId,
        user.id,
        createdAt
      );

      return groupId;
    });

    const groupId = createGroup();

    const group = db
      .prepare(`
        SELECT
          g.id,
          g.name,
          g.description,
          g.subject,
          g.owner_id,
          g.created_at,

          COALESCE(g.group_image, '') AS group_image,

          u.username AS owner_username,

          1 AS member_count,
          1 AS is_member

        FROM study_groups g

        JOIN users u
          ON u.id = g.owner_id

        WHERE g.id = ?
      `)
      .get(groupId);

    return NextResponse.json(
      {
        success: true,
        message: "Group created successfully.",
        group,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/groups error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create group.",
      },
      { status: 500 }
    );
  }
}