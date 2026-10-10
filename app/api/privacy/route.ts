import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "studyhub.db");

const DEFAULT_SETTINGS = {
  profile_visibility: "public",
  allow_friend_requests: "everyone",
  allow_messages: "everyone",
  allow_calls: "friends_only",
} as const;

const VALID_PROFILE_VISIBILITY = [
  "public",
  "hidden",
] as const;

const VALID_FRIEND_REQUEST_SETTINGS = [
  "everyone",
  "friends_only",
  "none",
] as const;

const VALID_MESSAGE_SETTINGS = [
  "everyone",
  "friends_only",
  "none",
] as const;

const VALID_CALL_SETTINGS = [
  "everyone",
  "friends_only",
  "none",
] as const;

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
 * Convert old database values to the
 * current privacy setting names.
 *
 * Older database:
 * allow_calls = "friends"
 *
 * Current application:
 * allowCalls = "friends_only"
 */
function normalizeCallSetting(
  value: string | null | undefined
): "everyone" | "friends_only" | "none" {
  if (value === "friends") {
    return "friends_only";
  }

  if (
    value === "everyone" ||
    value === "friends_only" ||
    value === "none"
  ) {
    return value;
  }

  return DEFAULT_SETTINGS.allow_calls;
}

/**
 * Make sure the current user has a
 * privacy settings row.
 */
function ensurePrivacySettings(
  db: Database.Database,
  userId: number
) {
  db.prepare(
    `
    INSERT OR IGNORE INTO user_privacy_settings (
      user_id,
      profile_visibility,
      allow_friend_requests,
      allow_messages,
      allow_calls
    )
    VALUES (?, ?, ?, ?, ?)
    `
  ).run(
    userId,
    DEFAULT_SETTINGS.profile_visibility,
    DEFAULT_SETTINGS.allow_friend_requests,
    DEFAULT_SETTINGS.allow_messages,
    DEFAULT_SETTINGS.allow_calls
  );

  /**
   * Automatically migrate the old
   * "friends" value to "friends_only".
   */
  db.prepare(
    `
    UPDATE user_privacy_settings
    SET allow_calls = 'friends_only'
    WHERE user_id = ?
      AND allow_calls = 'friends'
    `
  ).run(userId);
}

type PrivacyRow = {
  profile_visibility: string;
  allow_friend_requests: string;
  allow_messages: string;
  allow_calls: string;
};

function getPrivacySettings(
  db: Database.Database,
  userId: number
): PrivacyRow {
  const settings = db
    .prepare(
      `
      SELECT
        profile_visibility,
        allow_friend_requests,
        allow_messages,
        allow_calls
      FROM user_privacy_settings
      WHERE user_id = ?
      LIMIT 1
      `
    )
    .get(userId) as PrivacyRow | undefined;

  if (!settings) {
    throw new Error(
      "PRIVACY_SETTINGS_NOT_FOUND"
    );
  }

  return settings;
}

export async function GET() {
  const db = getDatabase();

  try {
    const userId =
      await getCurrentUserId(db);

    if (!userId) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    ensurePrivacySettings(
      db,
      userId
    );

    const settings =
      getPrivacySettings(
        db,
        userId
      );

    return NextResponse.json(
      {
        settings: {
          profileVisibility:
            settings.profile_visibility,

          allowFriendRequests:
            settings.allow_friend_requests,

          allowMessages:
            settings.allow_messages,

          allowCalls:
            normalizeCallSetting(
              settings.allow_calls
            ),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET PRIVACY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while loading privacy settings.",
      },
      {
        status: 500,
      }
    );
  } finally {
    db.close();
  }
}

export async function PATCH(
  request: Request
) {
  const db = getDatabase();

  try {
    const userId =
      await getCurrentUserId(db);

    if (!userId) {
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
      profileVisibility?: unknown;
      allowFriendRequests?: unknown;
      allowMessages?: unknown;
      allowCalls?: unknown;
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

    const profileVisibility =
      body.profileVisibility;

    const allowFriendRequests =
      body.allowFriendRequests;

    const allowMessages =
      body.allowMessages;

    const allowCalls =
      body.allowCalls;

    /**
     * Validate profile visibility.
     */
    if (
      profileVisibility !== undefined &&
      (
        typeof profileVisibility !==
          "string" ||
        !VALID_PROFILE_VISIBILITY.includes(
          profileVisibility as
            (typeof VALID_PROFILE_VISIBILITY)[number]
        )
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid profile visibility.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Validate friend request setting.
     */
    if (
      allowFriendRequests !==
        undefined &&
      (
        typeof allowFriendRequests !==
          "string" ||
        !VALID_FRIEND_REQUEST_SETTINGS.includes(
          allowFriendRequests as
            (typeof VALID_FRIEND_REQUEST_SETTINGS)[number]
        )
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid friend request setting.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Validate message setting.
     */
    if (
      allowMessages !== undefined &&
      (
        typeof allowMessages !==
          "string" ||
        !VALID_MESSAGE_SETTINGS.includes(
          allowMessages as
            (typeof VALID_MESSAGE_SETTINGS)[number]
        )
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid message setting.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Validate call setting.
     */
    if (
      allowCalls !== undefined &&
      (
        typeof allowCalls !==
          "string" ||
        !VALID_CALL_SETTINGS.includes(
          allowCalls as
            (typeof VALID_CALL_SETTINGS)[number]
        )
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid call setting.",
        },
        {
          status: 400,
        }
      );
    }

    ensurePrivacySettings(
      db,
      userId
    );

    const current =
      getPrivacySettings(
        db,
        userId
      );

    /**
     * Normalize the old database value
     * before using it.
     */
    const currentAllowCalls =
      normalizeCallSetting(
        current.allow_calls
      );

    const newProfileVisibility =
      profileVisibility ??
      current.profile_visibility;

    const newAllowFriendRequests =
      allowFriendRequests ??
      current.allow_friend_requests;

    const newAllowMessages =
      allowMessages ??
      current.allow_messages;

    const newAllowCalls =
      allowCalls ??
      currentAllowCalls;

    /**
     * Update all settings together.
     */
    db.prepare(
      `
      UPDATE user_privacy_settings
      SET
        profile_visibility = ?,
        allow_friend_requests = ?,
        allow_messages = ?,
        allow_calls = ?
      WHERE user_id = ?
      `
    ).run(
      newProfileVisibility,
      newAllowFriendRequests,
      newAllowMessages,
      newAllowCalls,
      userId
    );

    const updated =
      getPrivacySettings(
        db,
        userId
      );

    return NextResponse.json(
      {
        message:
          "Privacy settings updated successfully.",

        settings: {
          profileVisibility:
            updated.profile_visibility,

          allowFriendRequests:
            updated.allow_friend_requests,

          allowMessages:
            updated.allow_messages,

          allowCalls:
            normalizeCallSetting(
              updated.allow_calls
            ),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "UPDATE PRIVACY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while updating privacy settings.",
      },
      {
        status: 500,
      }
    );
  } finally {
    db.close();
  }
}