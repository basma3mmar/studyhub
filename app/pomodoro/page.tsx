"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type Mode = "focus" | "short" | "long";

const modes = {
  focus: {
    label: "Focus",
    minutes: 25,
  },
  short: {
    label: "Short Break",
    minutes: 5,
  },
  long: {
    label: "Long Break",
    minutes: 15,
  },
};

type PomodoroStats = {
  sessions: number;
  totalMinutes: number;
  todaySessions: number;
  todayMinutes: number;
};

export default function PomodoroPage() {
  const [mode, setMode] = useState<Mode>("focus");

  const [secondsLeft, setSecondsLeft] = useState(
    modes.focus.minutes * 60
  );

  const [isRunning, setIsRunning] = useState(false);

  const [stats, setStats] = useState<PomodoroStats>({
    sessions: 0,
    totalMinutes: 0,
    todaySessions: 0,
    todayMinutes: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false);

          if (mode === "focus") {
            saveCompletedSession();
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  async function loadStats() {
    try {
      const response = await fetch("/api/pomodoro", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setStats({
        sessions: data.sessions || 0,
        totalMinutes: data.totalMinutes || 0,
        todaySessions: data.todaySessions || 0,
        todayMinutes: data.todayMinutes || 0,
      });
    } catch (error) {
      console.error("LOAD POMODORO STATS ERROR:", error);
    } finally {
      setLoadingStats(false);
    }
  }

  async function saveCompletedSession() {
    try {
      const response = await fetch("/api/pomodoro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: modes.focus.minutes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        console.error(
          "POMODORO SAVE ERROR:",
          data.message
        );

        return;
      }

      await loadStats();
    } catch (error) {
      console.error("SAVE POMODORO ERROR:", error);
    }
  }

  function changeMode(newMode: Mode) {
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(modes[newMode].minutes * 60);
  }

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(modes[mode].minutes * 60);
  }

  function toggleTimer() {
    if (secondsLeft === 0) {
      setSecondsLeft(modes[mode].minutes * 60);
    }

    setIsRunning((current) => !current);
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (secondsLeft % 60)
    .toString()
    .padStart(2, "0");

  const totalSeconds = modes[mode].minutes * 60;

  const progress =
    ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const totalHours = Math.floor(stats.totalMinutes / 60);
  const remainingMinutes = stats.totalMinutes % 60;

  const studyTime =
    totalHours > 0
      ? `${totalHours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <main className="lg:pl-64">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="px-6 py-5">
            <h1 className="text-2xl font-bold">
              Pomodoro
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Focus on your work, take regular breaks, and build a
              better study habit.
            </p>
          </div>
        </header>

        <div className="p-6">
          <div className="mx-auto max-w-5xl">
            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <PomodoroStat
                label="Completed Sessions"
                value={
                  loadingStats
                    ? "..."
                    : stats.sessions.toString()
                }
                icon="✓"
              />

              <PomodoroStat
                label="Study Time"
                value={loadingStats ? "..." : studyTime}
                icon="◷"
              />

              <PomodoroStat
                label="Today's Goal"
                value={`${Math.min(
                  stats.todaySessions,
                  4
                )}/4 sessions`}
                icon="🎯"
              />
            </div>

            {/* Timer Card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {(Object.keys(modes) as Mode[]).map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => changeMode(item)}
                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                          mode === item
                            ? "bg-indigo-600 text-white"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {modes[item].label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  {modes[mode].label}
                </p>

                <div className="relative mx-auto mt-8 flex h-72 w-72 items-center justify-center rounded-full border-[14px] border-slate-100 sm:h-80 sm:w-80">
                  <div
                    className="absolute inset-[-14px] rounded-full border-[14px] border-transparent"
                    style={{
                      background: `conic-gradient(#4f46e5 ${progress}%, transparent ${progress}%)`,
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude",
                    }}
                  />

                  <div>
                    <div className="text-6xl font-bold tracking-tight text-slate-900 sm:text-7xl">
                      {minutes}:{seconds}
                    </div>

                    <p className="mt-3 text-sm text-slate-400">
                      {isRunning
                        ? "Stay focused..."
                        : "Ready when you are"}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    onClick={toggleTimer}
                    className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
                  >
                    {isRunning
                      ? "Pause"
                      : "Start Focus"}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold">
                  How Pomodoro works
                </h2>

                <div className="mt-5 space-y-4">
                  <Tip
                    number="01"
                    title="Focus"
                    text="Work on one task without distractions for 25 minutes."
                  />

                  <Tip
                    number="02"
                    title="Take a break"
                    text="Rest for 5 minutes before starting another session."
                  />

                  <Tip
                    number="03"
                    title="Repeat"
                    text="After four focus sessions, take a longer break."
                  />
                </div>
              </div>

              {/* Today's Progress */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">
                      Today's progress
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Complete 4 focus sessions today.
                    </p>
                  </div>

                  <span className="text-sm font-bold text-indigo-600">
                    {Math.min(
                      stats.todaySessions,
                      4
                    )}
                    /4
                  </span>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (stats.todaySessions / 4) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-6 grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(
                    (number) => (
                      <div
                        key={number}
                        className={`flex h-12 items-center justify-center rounded-xl text-sm font-bold ${
                          stats.todaySessions >=
                          number
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {stats.todaySessions >=
                        number
                          ? "✓"
                          : number}
                      </div>
                    )
                  )}
                </div>

                <div className="mt-6 rounded-xl bg-indigo-50 p-4">
                  <p className="text-sm font-semibold text-indigo-700">
                    {stats.todaySessions >= 4
                      ? "🎉 Daily goal completed!"
                      : "Keep going!"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-600">
                    {stats.todaySessions >= 4
                      ? "You completed today's focus goal."
                      : `${
                          4 - stats.todaySessions
                        } more session${
                          4 - stats.todaySessions === 1
                            ? ""
                            : "s"
                        } to reach your goal.`}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Today's study time
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {stats.todayMinutes} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PomodoroStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Tip({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-bold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}