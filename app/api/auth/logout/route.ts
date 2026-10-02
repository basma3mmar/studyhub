import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Database from "better-sqlite3";

const db = new Database("studyhub.db");

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("studyhub_session")?.value;

    if (token) {
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    response.cookies.set("studyhub_session", "", {
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to logout.",
      },
      { status: 500 }
    );
  }
}