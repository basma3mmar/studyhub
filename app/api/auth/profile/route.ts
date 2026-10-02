import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

// Add profile_image to users if it doesn't exist yet.
const columns = db
  .prepare(`PRAGMA table_info(users)`)
  .all() as Array<{
    name: string;
  }>;

const hasProfileImage = columns.some(
  (column) => column.name === "profile_image"
);

if (!hasProfileImage) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN profile_image TEXT DEFAULT ''
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
        COALESCE(users.profile_image, '') AS profile_image
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
  request: NextRequest
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

    return NextResponse.json({
      success: true,
      profileImage: user.profile_image || "",
    });
  } catch (error) {
    console.error(
      "GET /api/auth/profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
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

    const body = await request.json();

    const profileImage =
      typeof body.profileImage === "string"
        ? body.profileImage
        : "";

    if (
      profileImage &&
      !profileImage.startsWith(
        "data:image/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid profile image.",
        },
        { status: 400 }
      );
    }

    if (
      profileImage &&
      profileImage.length > 3_000_000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Profile image is too large.",
        },
        { status: 400 }
      );
    }

    db.prepare(`
      UPDATE users
      SET profile_image = ?
      WHERE id = ?
    `).run(
      profileImage,
      user.id
    );

    return NextResponse.json({
      success: true,
      profileImage,
    });
  } catch (error) {
    console.error(
      "PATCH /api/auth/profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save profile image.",
      },
      { status: 500 }
    );
  }
}