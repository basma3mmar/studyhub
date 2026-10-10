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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type FriendRequestRow = {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: string;
};

/**
 * PATCH
 *
 * Actions:
 * - accept
 * - reject
 * - cancel
 */
export async function PATCH(
  request: Request,
  context: RouteContext
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

    const { id } = await context.params;

    const requestId = Number(id);

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid friend request ID.",
        },
        {
          status: 400,
        }
      );
    }

    let body: {
      action?: unknown;
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

    const action = body.action;

    if (
      action !== "accept" &&
      action !== "reject" &&
      action !== "cancel"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid action. Use accept, reject, or cancel.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Find the friend request.
     */
    const friendRequest = db
      .prepare(
        `
        SELECT
          id,
          sender_id,
          receiver_id,
          status
        FROM friend_requests
        WHERE id = ?
        LIMIT 1
        `
      )
      .get(requestId) as
      | FriendRequestRow
      | undefined;

    if (!friendRequest) {
      return NextResponse.json(
        {
          message:
            "Friend request not found.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * The request must still be pending.
     */
    if (
      friendRequest.status !== "pending"
    ) {
      return NextResponse.json(
        {
          message:
            "This friend request is no longer pending.",
        },
        {
          status: 409,
        }
      );
    }

    /**
     * ACCEPT
     *
     * Only the receiver can accept.
     */
    if (action === "accept") {
      if (
        friendRequest.receiver_id !==
        currentUserId
      ) {
        return NextResponse.json(
          {
            message:
              "Only the receiver can accept this request.",
          },
          {
            status: 403,
          }
        );
      }

      /**
       * Make sure neither user blocked
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
          friendRequest.sender_id,
          friendRequest.receiver_id,
          friendRequest.receiver_id,
          friendRequest.sender_id
        );

      if (blocked) {
        return NextResponse.json(
          {
            message:
              "This friendship cannot be created because one of the users is blocked.",
          },
          {
            status: 403,
          }
        );
      }

      /**
       * Check if they are already friends.
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
          friendRequest.sender_id,
          friendRequest.receiver_id,
          friendRequest.receiver_id,
          friendRequest.sender_id
        );

      /**
       * Create both friendship rows
       * and update the request atomically.
       */
      const transaction = db.transaction(() => {
        if (!alreadyFriends) {
          db.prepare(
            `
            INSERT OR IGNORE INTO friends (
              user_id,
              friend_id,
              created_at
            )
            VALUES (
              ?,
              ?,
              CURRENT_TIMESTAMP
            )
            `
          ).run(
            friendRequest.sender_id,
            friendRequest.receiver_id
          );

          db.prepare(
            `
            INSERT OR IGNORE INTO friends (
              user_id,
              friend_id,
              created_at
            )
            VALUES (
              ?,
              ?,
              CURRENT_TIMESTAMP
            )
            `
          ).run(
            friendRequest.receiver_id,
            friendRequest.sender_id
          );
        }

        db.prepare(
          `
          UPDATE friend_requests
          SET
            status = 'accepted',
            responded_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND status = 'pending'
          `
        ).run(requestId);
      });

      transaction();

      return NextResponse.json(
        {
          message:
            alreadyFriends
              ? "You are already friends."
              : "Friend request accepted.",
        },
        {
          status: 200,
        }
      );
    }

    /**
     * REJECT
     *
     * Only the receiver can reject.
     */
    if (action === "reject") {
      if (
        friendRequest.receiver_id !==
        currentUserId
      ) {
        return NextResponse.json(
          {
            message:
              "Only the receiver can reject this request.",
          },
          {
            status: 403,
          }
        );
      }

      db.prepare(
        `
        UPDATE friend_requests
        SET
          status = 'rejected',
          responded_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND receiver_id = ?
          AND status = 'pending'
        `
      ).run(
        requestId,
        currentUserId
      );

      return NextResponse.json(
        {
          message:
            "Friend request rejected.",
        },
        {
          status: 200,
        }
      );
    }

    /**
     * CANCEL
     *
     * Only the sender can cancel.
     */
    if (action === "cancel") {
      if (
        friendRequest.sender_id !==
        currentUserId
      ) {
        return NextResponse.json(
          {
            message:
              "Only the sender can cancel this request.",
          },
          {
            status: 403,
          }
        );
      }

      db.prepare(
        `
        UPDATE friend_requests
        SET
          status = 'cancelled',
          responded_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND sender_id = ?
          AND status = 'pending'
        `
      ).run(
        requestId,
        currentUserId
      );

      return NextResponse.json(
        {
          message:
            "Friend request cancelled.",
        },
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Invalid action.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "FRIEND REQUEST ACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while processing the friend request.",
      },
      {
        status: 500,
      }
    );
  } finally {
    db.close();
  }
}