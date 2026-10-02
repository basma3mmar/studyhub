import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import crypto from "crypto";

const dbPath = path.join(process.cwd(), "studyhub.db");

const db = new Database(dbPath);

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

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    if (!email.endsWith("@studyhub.com")) {
      return NextResponse.json(
        {
          message: "Please use your StudyHub email.",
        },
        { status: 400 }
      );
    }

    const user = db
      .prepare(
        `
        SELECT id, username, email, password
        FROM users
        WHERE LOWER(email) = LOWER(?)
        LIMIT 1
        `
      )
      .get(email) as
      | {
          id: number;
          username: string;
          email: string;
          password: string;
        }
      | undefined;

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    db.prepare(
      `
      INSERT INTO sessions (
        token,
        user_id
      )
      VALUES (?, ?)
      `
    ).run(token, user.id);

    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 200 }
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
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}