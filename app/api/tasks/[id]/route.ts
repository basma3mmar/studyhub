import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";

const dbPath = path.join(process.cwd(), "studyhub.db");
const db = new Database(dbPath);

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

  if (!token) {
    return null;
  }

  const user = db
    .prepare(
      `
      SELECT users.id, users.username, users.email
      FROM sessions
      INNER JOIN users
        ON users.id = sessions.user_id
      WHERE sessions.token = ?
      LIMIT 1
      `
    )
    .get(token) as
    | {
        id: number;
        username: string;
        email: string;
      }
    | undefined;

  return user || null;
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const taskId = Number(id);

    if (!Number.isInteger(taskId)) {
      return NextResponse.json(
        {
          message: "Invalid task ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (typeof body.completed !== "boolean") {
      return NextResponse.json(
        {
          message: "Invalid completed value.",
        },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `
        UPDATE tasks
        SET completed = ?
        WHERE id = ?
          AND user_id = ?
        `
      )
      .run(
        body.completed ? 1 : 0,
        taskId,
        user.id
      );

    if (result.changes === 0) {
      return NextResponse.json(
        {
          message: "Task not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Task updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while updating the task.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const taskId = Number(id);

    if (!Number.isInteger(taskId)) {
      return NextResponse.json(
        {
          message: "Invalid task ID.",
        },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `
        DELETE FROM tasks
        WHERE id = ?
          AND user_id = ?
        `
      )
      .run(taskId, user.id);

    if (result.changes === 0) {
      return NextResponse.json(
        {
          message: "Task not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while deleting the task.",
      },
      { status: 500 }
    );
  }
}