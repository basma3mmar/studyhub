"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type Task = {
  id: number;
  title: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  completed: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<
    "All" | "Active" | "Completed"
  >("All");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [newPriority, setNewPriority] =
    useState<Task["priority"]>("Medium");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/tasks", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load tasks.");
        return;
      }

      setTasks(data.tasks || []);
    } catch (error) {
      console.error("LOAD TASKS ERROR:", error);
      setError("Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const newCompleted = !task.completed;

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: newCompleted,
            }
          : item
      )
    );

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: newCompleted,
        }),
      });

      if (!response.ok) {
        setTasks((currentTasks) =>
          currentTasks.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completed: task.completed,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("TOGGLE TASK ERROR:", error);

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === id
            ? {
                ...item,
                completed: task.completed,
              }
            : item
        )
      );
    }
  }

  async function deleteTask(id: number) {
    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setTasks(previousTasks);
      }
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);
      setTasks(previousTasks);
    }
  }

  async function addTask() {
    if (!newTitle.trim()) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          subject: newSubject,
          priority: newPriority,
          dueDate: "Today",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create task.");
        return;
      }

      if (data.task) {
        setTasks((currentTasks) => [
          data.task,
          ...currentTasks,
        ]);
      }

      setNewTitle("");
      setNewSubject("General");
      setNewPriority("Medium");
      setShowModal(false);
    } catch (error) {
      console.error("ADD TASK ERROR:", error);
      setError("Unable to create task.");
    } finally {
      setSaving(false);
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Active") return !task.completed;
    if (filter === "Completed") return task.completed;

    return true;
  });

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const activeCount = tasks.length - completedCount;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <div className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <p className="text-sm text-slate-500">
                StudyHub
              </p>

              <h1 className="mt-1 text-xl font-bold">
                Tasks
              </h1>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + New Task
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              Your Tasks
            </h2>

            <p className="mt-2 text-slate-500">
              Keep track of everything you need to accomplish.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <TaskStat
              label="Total Tasks"
              value={tasks.length}
              icon="✓"
            />

            <TaskStat
              label="Active"
              value={activeCount}
              icon="◷"
            />

            <TaskStat
              label="Completed"
              value={completedCount}
              icon="✓"
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold">
                  All Tasks
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your study tasks.
                </p>
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1">
                {(["All", "Active", "Completed"] as const).map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        filter === item
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-slate-500">
                  Loading tasks...
                </p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                  ✓
                </div>

                <h3 className="mt-4 font-bold">
                  No tasks here
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Add a new task or change the filter.
                </p>
              </div>
            )}

            <div className="border-t border-slate-200 p-5">
              <button
                onClick={() => setShowModal(true)}
                className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"
              >
                + Add another task
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Create New Task
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add something you want to accomplish.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Task title
                </label>

                <input
                  value={newTitle}
                  onChange={(event) =>
                    setNewTitle(event.target.value)
                  }
                  placeholder="e.g. Study Chapter 5"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Subject
                </label>

                <select
                  value={newSubject}
                  onChange={(event) =>
                    setNewSubject(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                >
                  <option>General</option>
                  <option>Mathematics</option>
                  <option>Programming</option>
                  <option>Physics</option>
                  <option>Biology</option>
                  <option>English</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Priority
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(["Low", "Medium", "High"] as const).map(
                    (priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() =>
                          setNewPriority(priority)
                        }
                        disabled={saving}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          newPriority === priority
                            ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {priority}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={addTask}
                disabled={saving}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TaskStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-4 p-5 transition hover:bg-slate-50">
      <button
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
          task.completed
            ? "border-indigo-600 bg-indigo-600 text-xs text-white"
            : "border-slate-300 hover:border-indigo-500"
        }`}
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={`text-sm font-semibold ${
            task.completed
              ? "text-slate-400 line-through"
              : "text-slate-800"
          }`}
        >
          {task.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
            {task.subject}
          </span>

          <span className="text-xs text-slate-400">
            •
          </span>

          <span className="text-xs text-slate-500">
            Due {task.dueDate}
          </span>
        </div>
      </div>

      <span
        className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:block ${
          task.priority === "High"
            ? "bg-red-50 text-red-600"
            : task.priority === "Medium"
              ? "bg-yellow-50 text-yellow-600"
              : "bg-green-50 text-green-600"
        }`}
      >
        {task.priority}
      </span>

      <button
        onClick={onDelete}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title="Delete task"
      >
        🗑
      </button>
    </div>
  );
}