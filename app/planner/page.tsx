"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type ScheduleItem = {
  id: number;
  day: string;
  time: string;
  subject: string;
  title: string;
  type: "Study" | "Lecture" | "Review";
};

const days = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
];

export default function PlannerPage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [selectedDay, setSelectedDay] = useState("Saturday");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [newDay, setNewDay] = useState("Saturday");
  const [newTime, setNewTime] = useState("09:00 AM");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] =
    useState<ScheduleItem["type"]>("Study");

  useEffect(() => {
    loadPlanner();
  }, []);

  async function loadPlanner() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/planner", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load planner."
        );
      }

      setSchedule(data.sessions || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load planner."
      );
    } finally {
      setLoading(false);
    }
  }

  async function addScheduleItem() {
    if (!newTitle.trim()) {
      setError("Please enter a session title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: newDay,
          time: newTime,
          subject: newSubject,
          title: newTitle.trim(),
          type: newType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create session."
        );
      }

      setSchedule((current) => [
        ...current,
        data.session,
      ]);

      setSelectedDay(newDay);

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create session."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: number) {
    try {
      setError("");

      const response = await fetch(
        `/api/planner/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete session."
        );
      }

      setSchedule((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete session."
      );
    }
  }

  function resetForm() {
    setNewDay("Saturday");
    setNewTime("09:00 AM");
    setNewSubject("Mathematics");
    setNewTitle("");
    setNewType("Study");
  }

  const selectedItems = schedule
    .filter((item) => item.day === selectedDay)
    .sort((a, b) => {
      return (
        convertToTimeInput(a.time).localeCompare(
          convertToTimeInput(b.time)
        )
      );
    });

  const studyDays = new Set(
    schedule.map((item) => item.day)
  ).size;

  const subjects = new Set(
    schedule.map((item) => item.subject)
  ).size;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">
                Study Planner
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Plan your study sessions and stay organized.
              </p>
            </div>

            <button
              onClick={() => {
                setError("");
                setNewDay(selectedDay);
                setShowModal(true);
              }}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + Add Session
            </button>
          </div>
        </header>

        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Week Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <PlannerStat
              label="Study Sessions"
              value={schedule.length.toString()}
              icon="▣"
            />

            <PlannerStat
              label="Study Days"
              value={studyDays.toString()}
              icon="◷"
            />

            <PlannerStat
              label="Subjects"
              value={subjects.toString()}
              icon="✎"
            />
          </div>

          {/* Day Selector */}
          <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
            <div className="flex min-w-max gap-2">
              {days.map((day) => {
                const active = selectedDay === day;

                const count = schedule.filter(
                  (item) => item.day === day
                ).length;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{day}</span>

                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm text-slate-500">
                  Schedule for
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {selectedDay}
                </h2>
              </div>

              <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
                {selectedItems.length}{" "}
                {selectedItems.length === 1
                  ? "session"
                  : "sessions"}
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading your planner...
                </p>
              </div>
            ) : selectedItems.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                  ▣
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  Nothing planned yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Add a study session to start building your
                  schedule.
                </p>

                <button
                  onClick={() => {
                    setError("");
                    setNewDay(selectedDay);
                    setShowModal(true);
                  }}
                  className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Add Session
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedItems.map((item) => (
                  <ScheduleRow
                    key={item.id}
                    item={item}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Weekly Overview */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Weekly Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your planned study sessions this week.
                </p>
              </div>

              <span className="text-sm font-semibold text-indigo-600">
                {schedule.length} total
              </span>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {days.map((day) => {
                const count = schedule.filter(
                  (item) => item.day === day
                ).length;

                const percentage = Math.min(
                  count * 25,
                  100
                );

                return (
                  <div
                    key={day}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        {day.slice(0, 3)}
                      </span>

                      <span className="text-xs font-bold text-slate-700">
                        {count}
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Add Session Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold">
                  Add Study Session
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new session to your planner.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Day
                  </label>

                  <select
                    value={newDay}
                    onChange={(e) =>
                      setNewDay(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {days.map((day) => (
                      <option key={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Time
                  </label>

                  <input
                    type="time"
                    value={convertToTimeInput(newTime)}
                    onChange={(e) =>
                      setNewTime(
                        formatTime(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Session title
                </label>

                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) =>
                    setNewTitle(e.target.value)
                  }
                  placeholder="e.g. Study Chapter 5"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>

                  <select
                    value={newSubject}
                    onChange={(e) =>
                      setNewSubject(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>Mathematics</option>
                    <option>Programming</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                    <option>English</option>
                    <option>General</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Type
                  </label>

                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(
                        e.target.value as ScheduleItem["type"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>Study</option>
                    <option>Lecture</option>
                    <option>Review</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={addScheduleItem}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlannerStat({
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

function ScheduleRow({
  item,
  onDelete,
}: {
  item: ScheduleItem;
  onDelete: () => void;
}) {
  const typeStyles = {
    Study: "bg-indigo-50 text-indigo-600",
    Lecture: "bg-emerald-50 text-emerald-600",
    Review: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="group flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center">
      <div className="w-24 shrink-0">
        <p className="text-sm font-bold text-slate-900">
          {item.time}
        </p>
      </div>

      <div className="hidden h-10 w-px bg-slate-200 sm:block" />

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {item.type === "Study"
            ? "📚"
            : item.type === "Lecture"
              ? "🎓"
              : "↻"}
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-bold">
            {item.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {item.subject}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[item.type]}`}
        >
          {item.type}
        </span>

        <button
          onClick={onDelete}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function convertToTimeInput(time: string) {
  const [value, modifier] = time.split(" ");

  let [hours, minutes] = value
    .split(":")
    .map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function formatTime(time: string) {
  const [hoursString, minutes] = time.split(":");

  let hours = Number(hoursString);

  const modifier = hours >= 12 ? "PM" : "AM";

  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  return `${hours}:${minutes} ${modifier}`;
}