import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "studyhub.db");

type UserRow = {
  id: number;
  username: string;
  profile_image: string | null;
  profile_visibility: string;
};

function getDatabase() {
  return new Database(dbPath);
}

export async function GET(request: Request) {
  const db = getDatabase();

  try {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get(
      "studyhub_session"
    )?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const currentUser = db
      .prepare(
        `
        SELECT user_id
        FROM sessions
        WHERE token = ?
        LIMIT 1
        `
      )
      .get(sessionToken) as
      | {
          user_id: number;
        }
      | undefined;

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Invalid or expired session.",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } = new URL(
      request.url
    );

    const query =
      searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json(
        {
          users: [],
          message:
            "Enter at least 2 characters.",
        },
        {
          status: 200,
        }
      );
    }

    const users = db
      .prepare(
        `
        SELECT
          users.id,
          users.username,
          users.profile_image,
          COALESCE(
            user_privacy_settings.profile_visibility,
            'public'
          ) AS profile_visibility
        FROM users

        LEFT JOIN user_privacy_settings
          ON user_privacy_settings.user_id = users.id

        WHERE users.id != ?

          AND LOWER(users.username)
            LIKE LOWER(?)

          AND COALESCE(
            user_privacy_settings.profile_visibility,
            'public'
          ) = 'public'

        ORDER BY users.username ASC

        LIMIT 20
        `
      )
      .all(
        currentUser.user_id,
        `%${query}%`
      ) as UserRow[];

    const visibleUsers = users.map(
      (user) => ({
        id: user.id,
        username: user.username,
        profileImage:
          user.profile_image || "",
        profileVisibility:
          user.profile_visibility,
      })
    );

    return NextResponse.json(
      {
        users: visibleUsers,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "FRIEND SEARCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while searching users.",
      },
      {
        status: 500,
      }
    );
  } finally {
    db.close();
  }
}