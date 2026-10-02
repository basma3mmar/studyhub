"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";

type StudySession = {
  id: number;
  group_id: number;
  user_id: number;
  title: string;
  subject: string;
  description: string;
  session_date: string;
  session_time: string;
  duration: number;
  created_at: string;
  username: string;
};

type Group = {
  id: number;
  name: string;
  owner_id: number;
};

type CurrentUser = {
  id: number;
  username: string;
  email: string;
};

export default function StudySessionsPage() {
  const params = useParams();
  const router = useRouter();

  const groupId = String(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [duration, setDuration] = useState("60");

  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode =
      localStorage.getItem("studyhubDarkMode") === "true";

    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    loadData();
  }, [groupId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        groupResponse,
        sessionsResponse,
        userResponse,
      ] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/sessions`),
        fetch("/api/auth/me"),
      ]);

      if (
        groupResponse.status === 401 ||
        sessionsResponse.status === 401 ||
        userResponse.status === 401
      ) {
        router.push("/login");
        return;
      }

      if (!groupResponse.ok) {
        throw new Error("Failed to load group.");
      }

      if (!sessionsResponse.ok) {
        const data =
          await sessionsResponse.json().catch(() => null);

        throw new Error(
          data?.message ||
            "Failed to load study sessions."
        );
      }

      const groupData = await groupResponse.json();
      const sessionsData =
        await sessionsResponse.json();

      const userData =
        await userResponse.json().catch(() => null);

      setGroup(groupData.group ?? groupData);
      setSessions(sessionsData.sessions ?? []);

      if (userData?.user) {
        setCurrentUser(userData.user);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setSubject("");
    setDescription("");
    setSessionDate("");
    setSessionTime("");
    setDuration("60");
    setEditingId(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
    setError("");
  }

  function openEditForm(session: StudySession) {
    setEditingId(session.id);
    setTitle(session.title);
    setSubject(session.subject);
    setDescription(session.description);
    setSessionDate(session.session_date);
    setSessionTime(session.session_time);
    setDuration(String(session.duration));
    setShowForm(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveSession(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a session title.");
      return;
    }

    if (!sessionDate) {
      setError("Please select a date.");
      return;
    }

    if (!sessionTime) {
      setError("Please select a time.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const isEditing = editingId !== null;

      const url = isEditing
        ? `/api/groups/${groupId}/sessions/${editingId}`
        : `/api/groups/${groupId}/sessions`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim(),
          sessionDate,
          sessionTime,
          duration: Number(duration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to ${
              isEditing ? "update" : "create"
            } session.`
        );
      }

      if (isEditing) {
        setSessions((current) =>
          current
            .map((session) =>
              session.id === editingId
                ? data.session
                : session
            )
            .sort((a, b) => {
              const first = new Date(
                `${a.session_date}T${a.session_time}`
              ).getTime();

              const second = new Date(
                `${b.session_date}T${b.session_time}`
              ).getTime();

              return first - second;
            })
        );
      } else {
        setSessions((current) =>
          [...current, data.session].sort(
            (a, b) => {
              const first = new Date(
                `${a.session_date}T${a.session_time}`
              ).getTime();

              const second = new Date(
                `${b.session_date}T${b.session_time}`
              ).getTime();

              return first - second;
            }
          )
        );
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save session."
      );
    } finally {
      setCreating(false);
    }
  }

  async function deleteSession(session: StudySession) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${session.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(session.id);
      setError("");

      const response = await fetch(
        `/api/groups/${groupId}/sessions/${session.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete session."
        );
      }

      setSessions((current) =>
        current.filter(
          (item) => item.id !== session.id
        )
      );

      if (editingId === session.id) {
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete session."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date: string) {
    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(time: string) {
    const [hours, minutes] =
      time.split(":").map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return time;
    }

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function isUpcoming(session: StudySession) {
    const sessionDateTime = new Date(
      `${session.session_date}T${session.session_time}`
    );

    return sessionDateTime.getTime() >= Date.now();
  }

  function startSession(session: StudySession) {
    router.push(
      `/pomodoro?duration=${session.duration}&session=${encodeURIComponent(
        session.title
      )}`
    );
  }

  function canManageSession(session: StudySession) {
    if (!currentUser || !group) {
      return false;
    }

    return (
      session.user_id === currentUser.id ||
      group.owner_id === currentUser.id
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Sidebar />

      <main className="ml-0 min-h-screen lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href={`/groups/${groupId}`}
              className={`mb-4 inline-flex items-center gap-2 text-sm font-semibold transition ${
                darkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ← Back to group
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className={`mb-2 text-sm font-semibold ${
                    darkMode
                      ? "text-indigo-400"
                      : "text-indigo-600"
                  }`}
                >
                  {group?.name || "Study Group"}
                </p>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Study Sessions
                </h1>

                <p
                  className={`mt-2 max-w-2xl text-sm leading-6 ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Schedule focused study sessions and
                  study together with your group members.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (showForm) {
                    resetForm();
                    setShowForm(false);
                  } else {
                    openCreateForm();
                  }

                  setError("");
                }}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                {showForm
                  ? "Cancel"
                  : "+ Create Session"}
              </button>
            </div>
          </div>

          {error && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                darkMode
                  ? "border-red-900 bg-red-950/40 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={saveSession}
              className={`mb-8 rounded-2xl border p-5 shadow-sm sm:p-6 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  {editingId !== null
                    ? "Edit Study Session"
                    : "Create Study Session"}
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {editingId !== null
                    ? "Update the session details."
                    : "Create a session that all group members can see."}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Session title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. Mathematics Revision"
                    maxLength={200}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Subject
                  </label>

                  <input
                    type="text"
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    placeholder="e.g. Mathematics"
                    maxLength={100}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Duration
                  </label>

                  <select
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-white focus:border-indigo-500"
                        : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500"
                    }`}
                  >
                    <option value="15">15 minutes</option>
                    <option value="25">25 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                    <option value="240">4 hours</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Date
                  </label>

                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(event) =>
                      setSessionDate(event.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-white focus:border-indigo-500"
                        : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Time
                  </label>

                  <input
                    type="time"
                    value={sessionTime}
                    onChange={(event) =>
                      setSessionTime(event.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-white focus:border-indigo-500"
                        : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500"
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="What are you going to study?"
                    maxLength={2000}
                    rows={4}
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                    }`}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className={`rounded-xl border px-6 py-3 text-sm font-bold transition ${
                      darkMode
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating
                    ? "Saving..."
                    : editingId !== null
                    ? "Save Changes"
                    : "Create Session"}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div
              className={`rounded-2xl border p-10 text-center ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />

              <p
                className={`text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Loading study sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div
              className={`rounded-2xl border p-10 text-center ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                  darkMode
                    ? "bg-indigo-950"
                    : "bg-indigo-50"
                }`}
              >
                📅
              </div>

              <h2 className="mt-5 text-xl font-bold">
                No study sessions yet
              </h2>

              <p
                className={`mx-auto mt-2 max-w-md text-sm leading-6 ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Create the first study session and invite
                your group members to study together.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Create First Session
              </button>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {sessions.map((session) => {
                const upcoming = isUpcoming(session);
                const canManage =
                  canManageSession(session);

                return (
                  <div
                    key={session.id}
                    className={`rounded-2xl border p-5 shadow-sm transition ${
                      darkMode
                        ? "border-slate-800 bg-slate-900 hover:border-slate-700"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {session.subject && (
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                darkMode
                                  ? "bg-indigo-950 text-indigo-300"
                                  : "bg-indigo-50 text-indigo-700"
                              }`}
                            >
                              {session.subject}
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              upcoming
                                ? darkMode
                                  ? "bg-emerald-950 text-emerald-300"
                                  : "bg-emerald-50 text-emerald-700"
                                : darkMode
                                ? "bg-slate-800 text-slate-400"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {upcoming
                              ? "Upcoming"
                              : "Past"}
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-bold">
                          {session.title}
                        </h2>
                      </div>

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
                        📚
                      </div>
                    </div>

                    {session.description && (
                      <p
                        className={`mt-4 text-sm leading-6 ${
                          darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        {session.description}
                      </p>
                    )}

                    <div
                      className={`mt-5 grid grid-cols-2 gap-3 rounded-xl p-3 ${
                        darkMode
                          ? "bg-slate-950"
                          : "bg-slate-50"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          DATE
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {formatDate(
                            session.session_date
                          )}
                        </p>
                      </div>

                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          TIME
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {formatTime(
                            session.session_time
                          )}
                        </p>
                      </div>

                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          DURATION
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {session.duration} min
                        </p>
                      </div>

                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          CREATED BY
                        </p>

                        <p className="mt-1 truncate text-sm font-bold">
                          {session.username}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {upcoming ? (
                        <button
                          type="button"
                          onClick={() =>
                            startSession(session)
                          }
                          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                        >
                          ▶ Start Session
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            startSession(session)
                          }
                          className={`flex-1 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                            darkMode
                              ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          ▶ Open Pomodoro
                        </button>
                      )}

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(session)
                            }
                            className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                              darkMode
                                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId === session.id
                            }
                            onClick={() =>
                              deleteSession(session)
                            }
                            className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            {deletingId === session.id
                              ? "Deleting..."
                              : "🗑️ Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}