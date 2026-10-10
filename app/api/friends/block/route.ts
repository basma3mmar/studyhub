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
 * Return users blocked by the current user.
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

    const blockedUsers = db
      .prepare(
        `
        SELECT
          blocked_users.id,
          users.id AS user_id,
          users.username,
          users.profile_image,
          blocked_users.created_at
        FROM blocked_users

        INNER JOIN users
          ON users.id = blocked_users.blocked_id

        WHERE blocked_users.blocker_id = ?

        ORDER BY users.username ASC
        `
      )
      .all(currentUserId);

    return NextResponse.json(
      {
        blockedUsers,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET BLOCKED USERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while loading blocked users.",
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
 * POST
 *
 * Block a user.
 *
 * Body:
 * {
 *   "userId": 2
 * }
 */
export async function POST(
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
            "You cannot block yourself.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Make sure target user exists.
     */
    const targetUser = db
      .prepare(
        `
        SELECT
          id,
          username
        FROM users
        WHERE id = ?
        LIMIT 1
        `
      )
      .get(targetUserId) as
      | {
          id: number;
          username: string;
        }
      | undefined;

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
     * Check whether the user is already blocked.
     */
    const existingBlock = db
      .prepare(
        `
        SELECT id
        FROM blocked_users
        WHERE
          blocker_id = ?
          AND blocked_id = ?
        LIMIT 1
        `
      )
      .get(
        currentUserId,
        targetUserId
      );

    if (existingBlock) {
      return NextResponse.json(
        {
          message:
            "This user is already blocked.",
        },
        {
          status: 409,
        }
      );
    }

    /**
     * Block + remove friendship + remove
     * pending requests atomically.
     */
    const transaction = db.transaction(
      () => {
        /**
         * Create block.
         */
        db.prepare(
          `
          INSERT INTO blocked_users (
            blocker_id,
            blocked_id,
            created_at
          )
          VALUES (
            ?,
            ?,
            CURRENT_TIMESTAMP
          )
          `
        ).run(
          currentUserId,
          targetUserId
        );

        /**
         * Remove friendship in both directions.
         */
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
         * Remove friend requests in both directions.
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
          `User ${targetUser.username} blocked successfully.`,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "BLOCK USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while blocking the user.",
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
 * Unblock a user.
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
            "You cannot unblock yourself.",
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
     * Remove only the block created by
     * the current user.
     */
    const result = db
      .prepare(
        `
        DELETE FROM blocked_users
        WHERE
          blocker_id = ?
          AND blocked_id = ?
        `
      )
      .run(
        currentUserId,
        targetUserId
      );

    if (result.changes === 0) {
      return NextResponse.json(
        {
          message:
            "This user is not blocked.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "User unblocked successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "UNBLOCK USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while unblocking the user.",
      },
      {
        status: 500,
      }
    );
  } finally {
    db.close();
  }
}