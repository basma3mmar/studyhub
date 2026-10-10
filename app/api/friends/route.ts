import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "studyhub.db");

function getDatabase() {
  return new Database(dbPath);
}

async function getCurrentUserId(
  db: Database.Database
): Promise<number | null> {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(
    "studyhub_session"
  )?.value;

  if (!sessionToken) {
    return null;
  }

  const session = db
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

  return session?.user_id ?? null;
}

/**
 * GET
 *
 * Return current user's friends.
 */
export async function GET() {
  const db = getDatabase();

  try {
    const currentUserId =
      await getCurrentUserId(db);

    if (!currentUserId) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const friends = db
      .prepare(
        `
        SELECT
          friends.id,
          users.id AS user_id,
          users.username,
          users.profile_image,
          friends.created_at
        FROM friends

        INNER JOIN users
          ON users.id = friends.friend_id

        WHERE friends.user_id = ?

        ORDER BY users.username ASC
        `
      )
      .all(currentUserId);

    return NextResponse.json(
      {
        friends,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET FRIENDS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while loading friends.",
      },
      {
        status: 500,
      }
    );
  } finally {
    db.close();
  }
}

/**
 * DELETE
 *
 * Remove a friend.
 *
 * Body:
 * {
 *   "userId": 2
 * }
 */
export async function DELETE(
  request: Request
) {
  const db = getDatabase();

  try {
    const currentUserId =
      await getCurrentUserId(db);

    if (!currentUserId) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    let body: {
      userId?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const targetUserId = Number(
      body.userId
    );

    if (
      !Number.isInteger(targetUserId) ||
      targetUserId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "A valid userId is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      targetUserId === currentUserId
    ) {
      return NextResponse.json(
        {
          message:
            "You cannot remove yourself as a friend.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Make sure the target user exists.
     */
    const targetUser = db
      .prepare(
        `
        SELECT id
        FROM users
        WHERE id = ?
        LIMIT 1
        `
      )
      .get(targetUserId);

    if (!targetUser) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * Check whether a friendship exists
     * in either direction.
     */
    const friendship = db
      .prepare(
        `
        SELECT id
        FROM friends
        WHERE
          (
            user_id = ?
            AND friend_id = ?
          )
          OR
          (
            user_id = ?
            AND friend_id = ?
          )
        LIMIT 1
        `
      )
      .get(
        currentUserId,
        targetUserId,
        targetUserId,
        currentUserId
      );

    if (!friendship) {
      return NextResponse.json(
        {
          message:
            "This user is not your friend.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * Remove both friendship rows
     * atomically.
     */
    const transaction = db.transaction(
      () => {
        db.prepare(
          `
          DELETE FROM friends
          WHERE
            (
              user_id = ?
              AND friend_id = ?
            )
            OR
            (
              user_id = ?
              AND friend_id = ?
            )
          `
        ).run(
          currentUserId,
          targetUserId,
          targetUserId,
          currentUserId
        );

        /**
         * Remove old friend requests between
         * both users.
         *
         * This prevents an old accepted request
         * from remaining after the friendship
         * is removed.
         */
        db.prepare(
          `
          DELETE FROM friend_requests
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
          `
        ).run(
          currentUserId,
          targetUserId,
          targetUserId,
          currentUserId
        );
      }
    );

    transaction();

    return NextResponse.json(
      {
        message:
          "Friend removed successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "REMOVE FRIEND ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while removing the friend.",
      },
      {
        status: 500,
      }
    );
  } finally {
    db.close();
  }
}