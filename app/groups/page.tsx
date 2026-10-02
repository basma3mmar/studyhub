"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

type Group = {
  id: number;
  name: string;
  description: string;
  subject: string;
  owner_id: number;
  owner_username: string;
  group_image: string;
  member_count: number;
  is_member: number;
  created_at: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode =
      localStorage.getItem("studyhubDarkMode") === "true";

    setDarkMode(savedDarkMode);

    function updateDarkMode() {
      setDarkMode(
        localStorage.getItem("studyhubDarkMode") === "true"
      );
    }

    window.addEventListener(
      "studyhub-dark-mode-updated",
      updateDarkMode
    );

    window.addEventListener("storage", updateDarkMode);

    loadGroups();

    return () => {
      window.removeEventListener(
        "studyhub-dark-mode-updated",
        updateDarkMode
      );

      window.removeEventListener(
        "storage",
        updateDarkMode
      );
    };
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/groups", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load groups."
        );
      }

      setGroups(data.groups || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load groups."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter a group name.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          subject,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create group."
        );
      }

      setGroups((current) => [
        data.group,
        ...current,
      ]);

      setName("");
      setSubject("");
      setDescription("");

      setShowCreate(false);

      setSuccess("Group created successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create group."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinGroup(groupId: number) {
    setError("");
    setSuccess("");
    setJoiningId(groupId);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/join`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to join group."
        );
      }

      setGroups((current) =>
        current.map((group) =>
          group.id === groupId
            ? {
                ...group,
                is_member: 1,
                member_count: data.memberCount,
              }
            : group
        )
      );

      setSuccess(data.message);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to join group."
      );
    } finally {
      setJoiningId(null);
    }
  }

  const myGroups = groups.filter(
    (group) => group.is_member
  );

  const availableGroups = groups.filter(
    (group) => !group.is_member
  );

  return (
    <main
      className={`min-h-screen transition-colors ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Sidebar />

      <div className="lg:pl-64">
        <header
          className={`border-b ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex min-h-20 items-center justify-between gap-4 px-6 py-4 lg:px-8">
            <div>
              <p
                className={`text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Learn together
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                Study Groups
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreate(true);
                setError("");
                setSuccess("");
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Create Group
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {error && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                darkMode
                  ? "border-red-900 bg-red-950/40 text-red-300"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                darkMode
                  ? "border-green-900 bg-green-950/40 text-green-300"
                  : "border-green-200 bg-green-50 text-green-600"
              }`}
            >
              {success}
            </div>
          )}

          {loading ? (
            <div
              className={`rounded-2xl border p-10 text-center ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="text-2xl">⏳</div>

              <p
                className={`mt-3 text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Loading groups...
              </p>
            </div>
          ) : (
            <>
              {/* My Groups */}

              <section>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-lg font-bold">
                      My Groups
                    </h2>

                    <p
                      className={`mt-1 text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Groups you are currently part of.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      darkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {myGroups.length} groups
                  </span>
                </div>

                {myGroups.length === 0 ? (
                  <div
                    className={`rounded-2xl border border-dashed p-10 text-center ${
                      darkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <div className="text-4xl">
                      👥
                    </div>

                    <h3 className="mt-3 font-bold">
                      No groups yet
                    </h3>

                    <p
                      className={`mx-auto mt-2 max-w-md text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Create your own study group or join
                      one below to start studying together.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {myGroups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        darkMode={darkMode}
                        joined
                        joining={false}
                        onJoin={() => {}}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Available Groups */}

              <section className="mt-10">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    Discover Groups
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Find a group and study with other
                    students.
                  </p>
                </div>

                {availableGroups.length === 0 ? (
                  <div
                    className={`rounded-2xl border p-10 text-center ${
                      darkMode
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="text-3xl">
                      🔎
                    </div>

                    <h3 className="mt-3 font-bold">
                      No available groups
                    </h3>

                    <p
                      className={`mt-2 text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Be the first to create one.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {availableGroups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        darkMode={darkMode}
                        joined={false}
                        joining={joiningId === group.id}
                        onJoin={() =>
                          handleJoinGroup(group.id)
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* Create Group Modal */}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              darkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Create Study Group
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Create a group and invite other students
                  to study with you.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className={`rounded-lg px-2 py-1 text-xl ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-800"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateGroup}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Group Name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="e.g. React Study Group"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Subject
                </label>

                <input
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder="e.g. Programming"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="What will your group study?"
                  rows={4}
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    darkMode
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating
                    ? "Creating..."
                    : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function GroupCard({
  group,
  darkMode,
  joined,
  joining,
  onJoin,
}: {
  group: Group;
  darkMode: boolean;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition ${
        darkMode
          ? "border-slate-800 bg-slate-900 hover:border-slate-700"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className={`h-2 ${
          darkMode
            ? "bg-indigo-500"
            : "bg-indigo-600"
        }`}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl text-2xl ${
              darkMode
                ? "bg-indigo-950 text-indigo-300"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            {group.group_image ? (
              <img
                src={group.group_image}
                alt={`${group.name} group`}
                className="h-full w-full object-cover"
              />
            ) : (
              "👥"
            )}
          </div>

          {joined && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                darkMode
                  ? "bg-green-950 text-green-300"
                  : "bg-green-50 text-green-600"
              }`}
            >
              Joined
            </span>
          )}
        </div>

        <h3 className="mt-4 text-lg font-bold">
          {group.name}
        </h3>

        {group.subject && (
          <p className="mt-1 text-sm font-medium text-indigo-600">
            {group.subject}
          </p>
        )}

        <p
          className={`mt-3 line-clamp-2 text-sm ${
            darkMode
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          {group.description ||
            "A study group for students."}
        </p>

        <div
          className={`mt-5 flex items-center justify-between border-t pt-4 ${
            darkMode
              ? "border-slate-800"
              : "border-slate-100"
          }`}
        >
          <div
            className={`text-xs ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            <span className="font-semibold">
              👤 {group.member_count}
            </span>

            <span className="mx-2">•</span>

            <span>
              Owner: {group.owner_username}
            </span>
          </div>
        </div>

        {joined ? (
          <Link
            href={`/groups/${group.id}`}
            className="mt-4 block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Open Group
          </Link>
        ) : (
          <button
            type="button"
            onClick={onJoin}
            disabled={joining}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {joining ? "Joining..." : "Join Group"}
          </button>
        )}
      </div>
    </div>
  );
}