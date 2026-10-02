import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import crypto from "crypto";

const dbPath = path.join(process.cwd(), "studyhub.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        {
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          message:
            "Username can only contain lowercase letters, numbers, and underscores.",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          message: "Username must be at least 3 characters.",
        },
        { status: 400 }
      );
    }

    if (username.length > 30) {
      return NextResponse.json(
        {
          message: "Username must be 30 characters or less.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          message: "Passwords do not match.",
        },
        { status: 400 }
      );
    }

    const email = `${username}@studyhub.com`;

    const existingUser = db
      .prepare(
        `
        SELECT id, username, email
        FROM users
        WHERE LOWER(username) = LOWER(?)
           OR LOWER(email) = LOWER(?)
        LIMIT 1
        `
      )
      .get(username, email) as
      | {
          id: number;
          username: string;
          email: string;
        }
      | undefined;

    if (existingUser) {
      return NextResponse.json(
        {
          message: "This username is already taken.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let userId: number;

    try {
      const result = db
        .prepare(
          `
          INSERT INTO users (
            username,
            email,
            password
          )
          VALUES (?, ?, ?)
          `
        )
        .run(username, email, hashedPassword);

      userId = Number(result.lastInsertRowid);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        return NextResponse.json(
          {
            message: "This username is already taken.",
          },
          { status: 409 }
        );
      }

      throw error;
    }

    // Create login session automatically
    const token = crypto.randomBytes(32).toString("hex");

    db.prepare(
      `
      INSERT INTO sessions (
        token,
        user_id
      )
      VALUES (?, ?)
      `
    ).run(token, userId);

    // Return response and set authentication cookie
    const response = NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: userId,
          username,
          email,
        },
      },
      { status: 201 }
    );

    response.cookies.set("studyhub_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while creating the account.",
      },
      { status: 500 }
    );
  }
}