import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { cookies } from "next/headers";

const dbPath = path.join(process.cwd(), "studyhub.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyhub_session")?.value;

  if (!token) {
    return null;
  }

  const user = db
    .prepare(`
      SELECT
        users.id,
        users.username,
        users.email
      FROM sessions
      INNER JOIN users
        ON users.id = sessions.user_id
      WHERE sessions.token = ?
      LIMIT 1
    `)
    .get(token) as
    | {
        id: number;
        username: string;
        email: string;
      }
    | undefined;

  return user || null;
}

function calculateStreak(userId: number) {
  const rows = db
    .prepare(`
      SELECT DISTINCT
        date(completed_at, 'localtime') AS study_date
      FROM pomodoro_sessions
      WHERE user_id = ?
      ORDER BY study_date DESC
    `)
    .all(userId) as {
    study_date: string;
  }[];

  if (rows.length === 0) {
    return 0;
  }

  const dates = rows.map((row) => row.study_date);

  const today = new Date();

  const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(yesterday);

  // لو آخر مذاكرة كانت قبل النهارده وأول امبارح،
  // يبقى مفيش Streak حالي.
  if (dates[0] !== todayKey && dates[0] !== yesterdayKey) {
    return 0;
  }

  let streak = 0;

  const firstDate = new Date(`${dates[0]}T00:00:00`);

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(firstDate);
    expectedDate.setDate(firstDate.getDate() - i);

    const expectedKey = toDateKey(expectedDate);

    if (dates[i] === expectedKey) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
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

    const total = db
      .prepare(`
        SELECT
          COUNT(*) as sessions,
          COALESCE(SUM(duration), 0) as totalMinutes
        FROM pomodoro_sessions
        WHERE user_id = ?
      `)
      .get(user.id) as {
      sessions: number;
      totalMinutes: number;
    };

    const today = db
      .prepare(`
        SELECT
          COUNT(*) as sessions,
          COALESCE(SUM(duration), 0) as totalMinutes
        FROM pomodoro_sessions
        WHERE user_id = ?
          AND date(completed_at, 'localtime') =
              date('now', 'localtime')
      `)
      .get(user.id) as {
      sessions: number;
      totalMinutes: number;
    };

    const weekly = db
      .prepare(`
        SELECT
          COALESCE(SUM(duration), 0) as totalMinutes
        FROM pomodoro_sessions
        WHERE user_id = ?
          AND datetime(completed_at, 'localtime') >=
              datetime('now', 'localtime', '-6 days', 'start of day')
      `)
      .get(user.id) as {
      totalMinutes: number;
    };

    const currentStreak = calculateStreak(user.id);

    return NextResponse.json({
      sessions: total.sessions,
      totalMinutes: total.totalMinutes,
      todaySessions: today.sessions,
      todayMinutes: today.totalMinutes,
      weeklyMinutes: weekly.totalMinutes,
      currentStreak,
    });
  } catch (error) {
    console.error("GET POMODORO ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while loading Pomodoro data.",
      },
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

    const duration = Number(body.duration);

    if (!Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json(
        {
          message: "Invalid Pomodoro duration.",
        },
        { status: 400 }
      );
    }

    if (![25, 5, 15].includes(duration)) {
      return NextResponse.json(
        {
          message: "Invalid Pomodoro session.",
        },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        INSERT INTO pomodoro_sessions (
          user_id,
          duration
        )
        VALUES (?, ?)
      `)
      .run(user.id, duration);

    return NextResponse.json(
      {
        message: "Pomodoro session saved successfully.",
        session: {
          id: result.lastInsertRowid,
          duration,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE POMODORO ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while saving Pomodoro session.",
      },
      { status: 500 }
    );
  }
}