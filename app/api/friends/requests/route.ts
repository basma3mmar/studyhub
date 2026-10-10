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
 * Returns:
 * - received friend requests
 * - sent friend requests
 * - current friends
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

    const receivedRequests = db
      .prepare(
        `
        SELECT
          friend_requests.id,
          friend_requests.sender_id,
          users.username,
          users.profile_image,
          friend_requests.status,
          friend_requests.created_at
        FROM friend_requests

        INNER JOIN users
          ON users.id = friend_requests.sender_id

        WHERE friend_requests.receiver_id = ?
          AND friend_requests.status = 'pending'

        ORDER BY friend_requests.created_at DESC
        `
      )
      .all(currentUserId);

    const sentRequests = db
      .prepare(
        `
        SELECT
          friend_requests.id,
          friend_requests.receiver_id,
          users.username,
          users.profile_image,
          friend_requests.status,
          friend_requests.created_at
        FROM friend_requests

        INNER JOIN users
          ON users.id = friend_requests.receiver_id

        WHERE friend_requests.sender_id = ?
          AND friend_requests.status = 'pending'

        ORDER BY friend_requests.created_at DESC
        `
      )
      .all(currentUserId);

    const friends = db
      .prepare(
        `
        SELECT
          friends.id,
          friends.friend_id AS user_id,
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
        receivedRequests,
        sentRequests,
        friends,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET FRIEND REQUESTS ERROR:",
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
 * POST
 *
 * Send a friend request.
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
          message: "Invalid request body.",
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

    if (targetUserId === currentUserId) {
      return NextResponse.json(
        {
          message:
            "You cannot send a friend request to yourself.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Check that target user exists.
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
     * Check whether either user blocked
     * the other user.
     */
    const blocked = db
      .prepare(
        `
        SELECT id
        FROM blocked_users

        WHERE
          (
            blocker_id = ?
            AND blocked_id = ?
          )
          OR
          (
            blocker_id = ?
            AND blocked_id = ?
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

    if (blocked) {
      return NextResponse.json(
        {
          message:
            "You cannot send a friend request to this user.",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * Check target user's privacy settings.
     *
     * Default:
     * everyone
     */
    const privacy = db
      .prepare(
        `
        SELECT
          allow_friend_requests
        FROM user_privacy_settings

        WHERE user_id = ?

        LIMIT 1
        `
      )
      .get(targetUserId) as
      | {
          allow_friend_requests: string;
        }
      | undefined;

    const allowFriendRequests =
      privacy?.allow_friend_requests ||
      "everyone";

    /**
     * User does not accept requests.
     */
    if (
      allowFriendRequests === "none"
    ) {
      return NextResponse.json(
        {
          message:
            "This user does not accept friend requests.",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * Check if they are already friends.
     *
     * We check both directions because the
     * friends table should contain both rows,
     * but this makes the API safer if old data
     * is incomplete.
     */
    const alreadyFriends = db
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

    if (alreadyFriends) {
      return NextResponse.json(
        {
          message:
            "You are already friends.",
        },
        {
          status: 409,
        }
      );
    }

    /**
     * Check for an existing request
     * in either direction.
     */
    const existingRequest = db
      .prepare(
        `
        SELECT
          id,
          sender_id,
          receiver_id,
          status
        FROM friend_requests

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
        currentUserId,
        targetUserId,
        targetUserId,
        currentUserId
      ) as
      | {
          id: number;
          sender_id: number;
          receiver_id: number;
          status: string;
        }
      | undefined;

    /**
     * If there is already a pending request,
     * do not create another one.
     */
    if (
      existingRequest &&
      existingRequest.status === "pending"
    ) {
      /**
       * If the other user already sent us
       * a request, tell the current user to
       * accept it instead.
       */
      if (
        existingRequest.sender_id ===
          targetUserId &&
        existingRequest.receiver_id ===
          currentUserId
      ) {
        return NextResponse.json(
          {
            message:
              "This user has already sent you a friend request. Check your requests.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          message:
            "A friend request is already pending.",
        },
        {
          status: 409,
        }
      );
    }

    /**
     * For "friends_only":
     *
     * A new friendship cannot logically be
     * created from a completely unrelated user.
     *
     * We therefore allow the request here and
     * leave the final relationship decision to
     * the receiver when they accept it.
     *
     * This keeps the setting usable instead of
     * making new friendships impossible.
     */

    /**
     * Reuse an old rejected/cancelled request
     * instead of creating duplicate records.
     */
    if (existingRequest) {
      db.prepare(
        `
        UPDATE friend_requests

        SET
          sender_id = ?,
          receiver_id = ?,
          status = 'pending',
          created_at = CURRENT_TIMESTAMP,
          responded_at = NULL

        WHERE id = ?
        `
      ).run(
        currentUserId,
        targetUserId,
        existingRequest.id
      );
    } else {
      db.prepare(
        `
        INSERT INTO friend_requests (
          sender_id,
          receiver_id,
          status,
          created_at
        )

        VALUES (
          ?,
          ?,
          'pending',
          CURRENT_TIMESTAMP
        )
        `
      ).run(
        currentUserId,
        targetUserId
      );
    }

    return NextResponse.json(
      {
        message: `Friend request sent to ${targetUser.username}.`,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "SEND FRIEND REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while sending the friend request.",
      },
      {
        status: 500,
      }
    );
  } finally {
    db.close();
  }
}