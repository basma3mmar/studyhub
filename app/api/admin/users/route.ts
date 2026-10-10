import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import {
  canManageRole,
  isValidRole,
  type Role,
} from "@/lib/roles";
import { requirePermission } from "@/lib/auth";

const dbPath = path.join(
  process.cwd(),
  "studyhub.db"
);

type UserRow = {
  id: number;
  username: string;
  email: string;
  profile_image: string | null;
  role: string;
  created_at: string;
  is_primary_owner: number;
};

type CurrentUserOwnerRow = {
  is_primary_owner: number;
};

type TargetUserRow = {
  id: number;
  username: string;
  email: string;
  role: string;
  is_primary_owner: number;
};

function getDatabase() {
  return new Database(dbPath);
}

export async function GET() {
  let db: Database.Database | null = null;

  try {
    await requirePermission("manage_users");

    db = getDatabase();

    const users = db
      .prepare(
        `
        SELECT
          id,
          username,
          email,
          profile_image,
          role,
          created_at,
          is_primary_owner
        FROM users
        ORDER BY id ASC
        `
      )
      .all() as UserRow[];

    return NextResponse.json(
      {
        success: true,
        users: users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          profileImage: user.profile_image || "",
          role: user.role,
          createdAt: user.created_at,
          isPrimaryOwner:
            user.is_primary_owner === 1,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to manage users.",
        },
        { status: 403 }
      );
    }

    console.error(
      "ADMIN USERS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load users.",
      },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}

export async function PATCH(
  request: Request
) {
  let db: Database.Database | null = null;

  try {
    const currentUser =
      await requirePermission("manage_roles");

    const body = await request.json();

    const targetUserId = Number(
      body.userId
    );

    const newRole = body.role;

    if (
      !Number.isInteger(targetUserId) ||
      targetUserId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        { status: 400 }
      );
    }

    if (!isValidRole(newRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role.",
        },
        { status: 400 }
      );
    }

    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot change your own role.",
        },
        { status: 403 }
      );
    }

    db = getDatabase();

    const targetUser = db
      .prepare(
        `
        SELECT
          id,
          username,
          email,
          role,
          is_primary_owner
        FROM users
        WHERE id = ?
        LIMIT 1
        `
      )
      .get(targetUserId) as
      | TargetUserRow
      | undefined;

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    if (!isValidRole(targetUser.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Target user has an invalid role.",
        },
        { status: 500 }
      );
    }

    const targetRole =
      targetUser.role as Role;

    const currentUserOwnerRow = db
      .prepare(
        `
        SELECT is_primary_owner
        FROM users
        WHERE id = ?
        LIMIT 1
        `
      )
      .get(currentUser.id) as
      | CurrentUserOwnerRow
      | undefined;

    const isPrimaryOwner =
      currentUser.role === "Owner" &&
      currentUserOwnerRow?.is_primary_owner === 1;

    // حماية Original Owner.
    if (
      targetUser.is_primary_owner === 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The Original Owner cannot be modified.",
        },
        { status: 403 }
      );
    }

    // منع أي شخص من تعديل Super Owner
    // إلا Original Owner.
    if (
      targetRole === "Super Owner" &&
      !isPrimaryOwner
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the Original Owner can manage a Super Owner.",
        },
        { status: 403 }
      );
    }

    if (
      !canManageRole(
        currentUser.role as Role,
        newRole,
        isPrimaryOwner
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot assign this role.",
        },
        { status: 403 }
      );
    }

    db.prepare(
      `
      UPDATE users
      SET role = ?
      WHERE id = ?
      `
    ).run(
      newRole,
      targetUserId
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "User role updated successfully.",
        user: {
          id: targetUser.id,
          username: targetUser.username,
          email: targetUser.email,
          previousRole: targetRole,
          role: newRole,
          isPrimaryOwner: false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to manage roles.",
        },
        { status: 403 }
      );
    }

    console.error(
      "ADMIN USERS PATCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update user role.",
      },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}