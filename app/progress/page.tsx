"use client";

import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

type Subject = {
  name: string;
  completed: number;
  total: number;
  hours: number;
  color: string;
};

type Activity = {
  day: string;
  hours: number;
};

const subjects: Subject[] = [
  {
    name: "Programming",
    completed: 18,
    total: 24,
    hours: 14.5,
    color: "blue",
  },
  {
    name: "Database",
    completed: 12,
    total: 16,
    hours: 9,
    color: "purple",
  },
  {
    name: "Mathematics",
    completed: 15,
    total: 20,
    hours: 11.5,
    color: "green",
  },
  {
    name: "English",
    completed: 10,
    total: 12,
    hours: 7,
    color: "orange",
  },
];

const activityData: Activity[] = [
  { day: "Sat", hours: 2.5 },
  { day: "Sun", hours: 3.5 },
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 4 },
  { day: "Wed", hours: 3 },
  { day: "Thu", hours: 2 },
  { day: "Fri", hours: 1 },
];

export default function ProgressPage() {
  const [period, setPeriod] = useState("This Week");

  const totalCompleted = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.completed, 0),
    []
  );

  const totalTasks = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.total, 0),
    []
  );

  const totalHours = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.hours, 0),
    []
  );

  const completionRate = Math.round(
    (totalCompleted / totalTasks) * 100
  );

  const studyHours = activityData.reduce(
    (sum, item) => sum + item.hours,
    0
  );

  const maxHours = Math.max(...activityData.map((item) => item.hours));

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div>
              <p className="text-sm text-slate-400">Analytics</p>

              <h1 className="text-2xl font-bold text-slate-900">
                My Progress
              </h1>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              {["This Week", "This Month"].map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                    period === item
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProgressStat
              label="Completion Rate"
              value={`${completionRate}%`}
              detail="+8% from last week"
              icon="↗"
            />

            <ProgressStat
              label="Tasks Completed"
              value={totalCompleted}
              detail={`${totalTasks} total tasks`}
              icon="✓"
            />

            <ProgressStat
              label="Study Hours"
              value={`${totalHours}h`}
              detail={`${studyHours}h this week`}
              icon="◷"
            />

            <ProgressStat
              label="Current Streak"
              value="7 days"
              detail="Keep it going!"
              icon="★"
            />
          </section>

          <section className="mb-7 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Study Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Hours studied during {period.toLowerCase()}
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">
                  {studyHours}h
                </div>
              </div>

              <div className="mt-8 flex h-64 items-end gap-2 sm:gap-4">
                {activityData.map((item) => {
                  const height =
                    maxHours === 0
                      ? 0
                      : Math.max(8, (item.hours / maxHours) * 100);

                  return (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold text-slate-500">
                        {item.hours}h
                      </span>

                      <div className="flex h-44 w-full items-end justify-center">
                        <div
                          className="w-full max-w-10 rounded-t-xl bg-indigo-500 transition-all duration-500 hover:bg-indigo-600"
                          style={{ height: `${height}%` }}
                        />
                      </div>

                      <span className="text-xs font-medium text-slate-400">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Overall Progress
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your study completion
                </p>
              </div>

              <div className="mt-7 flex items-center justify-center">
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-slate-100">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#4f46e5 ${
                        completionRate * 3.6
                      }deg, #e2e8f0 0deg)`,
                    }}
                  />

                  <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-bold text-slate-900">
                      {completionRate}%
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <ProgressLegend
                  label="Completed"
                  value={totalCompleted}
                  percentage={completionRate}
                  dot="bg-indigo-500"
                />

                <ProgressLegend
                  label="Remaining"
                  value={totalTasks - totalCompleted}
                  percentage={100 - completionRate}
                  dot="bg-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Progress by Subject
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                See how you're doing across your subjects
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {subjects.map((subject) => (
                <SubjectProgress
                  key={subject.name}
                  subject={subject}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Achievements
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Keep building your study habits
                </p>
              </div>

              <div className="space-y-3">
                <Achievement
                  icon="🔥"
                  title="7 Day Streak"
                  description="Studied for 7 days in a row"
                />

                <Achievement
                  icon="✓"
                  title="Task Master"
                  description="Completed 50 study tasks"
                />

                <Achievement
                  icon="◷"
                  title="10 Hour Week"
                  description="Studied more than 10 hours this week"
                />

                <Achievement
                  icon="★"
                  title="Early Bird"
                  description="Completed 5 morning study sessions"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm sm:p-6">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    🎯
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    Keep going!
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    You're making steady progress. Complete a few more tasks
                    today to keep your streak and move closer to your goals.
                  </p>
                </div>

                <a
                  href="/tasks"
                  className="mt-7 inline-flex w-fit rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  View My Tasks
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ProgressStat({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-emerald-600">
            {detail}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressLegend({
  label,
  value,
  percentage,
  dot,
}: {
  label: string;
  value: number;
  percentage: number;
  dot: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${dot}`} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-800">
          {value}
        </span>

        <span className="text-xs text-slate-400">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function SubjectProgress({ subject }: { subject: Subject }) {
  const percentage = Math.round(
    (subject.completed / subject.total) * 100
  );

  const colorClasses: Record<
    string,
    { bg: string; text: string; bar: string }
  > = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      bar: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      bar: "bg-purple-500",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      bar: "bg-emerald-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      bar: "bg-orange-500",
    },
  };

  const colors = colorClasses[subject.color];

  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}
          >
            <span className={`text-sm font-bold ${colors.text}`}>
              {subject.name.charAt(0)}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {subject.name}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {subject.hours} hours studied
            </p>
          </div>
        </div>

        <span className={`text-sm font-bold ${colors.text}`}>
          {percentage}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {subject.completed} of {subject.total} tasks completed
      </p>
    </div>
  );
}

function Achievement({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}