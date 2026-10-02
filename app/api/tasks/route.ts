import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";

const dbPath = path.join(process.cwd(), "studyhub.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'General',
    priority TEXT NOT NULL DEFAULT 'Medium',
    due_date TEXT NOT NULL DEFAULT 'Today',
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

  if (!token) return null;

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

function formatTask(task: {
  id: number;
  title: string;
  subject: string;
  priority: string;
  due_date: string;
  completed: number;
}) {
  return {
    id: task.id,
    title: task.title,
    subject: task.subject,
    priority: task.priority,
    dueDate: task.due_date,
    completed: Boolean(task.completed),
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const tasks = db
      .prepare(
        `
        SELECT
          id,
          title,
          subject,
          priority,
          due_date,
          completed
        FROM tasks
        WHERE user_id = ?
        ORDER BY
          completed ASC,
          id DESC
        `
      )
      .all(user.id) as {
      id: number;
      title: string;
      subject: string;
      priority: string;
      due_date: string;
      completed: number;
    }[];

    return NextResponse.json({
      tasks: tasks.map(formatTask),
    });
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong while loading tasks." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const subject = String(body.subject || "General").trim();
    const priority = String(body.priority || "Medium").trim();
    const dueDate = String(body.dueDate || "Today").trim();

    if (!title) {
      return NextResponse.json(
        { message: "Task title is required." },
        { status: 400 }
      );
    }

    if (!["High", "Medium", "Low"].includes(priority)) {
      return NextResponse.json(
        { message: "Invalid task priority." },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `
        INSERT INTO tasks (
          user_id,
          title,
          subject,
          priority,
          due_date,
          completed
        )
        VALUES (?, ?, ?, ?, ?, 0)
        `
      )
      .run(
        user.id,
        title,
        subject || "General",
        priority,
        dueDate || "Today"
      );

    const task = db
      .prepare(
        `
        SELECT
          id,
          title,
          subject,
          priority,
          due_date,
          completed
        FROM tasks
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
        `
      )
      .get(result.lastInsertRowid, user.id) as {
      id: number;
      title: string;
      subject: string;
      priority: string;
      due_date: string;
      completed: number;
    };

    db.prepare(
      `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link,
        is_read
      )
      VALUES (?, ?, ?, ?, ?, 0)
      `
    ).run(
      user.id,
      "task",
      "New task added",
      `"${title}" was added to your tasks.`,
      "/tasks"
    );

    return NextResponse.json(
      {
        message: "Task created successfully.",
        task: formatTask(task),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong while creating the task." },
      { status: 500 }
    );
  }
}