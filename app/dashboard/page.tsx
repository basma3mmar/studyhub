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

type User = {
  id: number;
  username: string;
  email: string;
};

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type PomodoroStats = {
  sessions: number;
  totalMinutes: number;
  todaySessions: number;
  todayMinutes: number;
  weeklyMinutes: number;
  currentStreak: number;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] =
    useState(true);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const [pomodoroStats, setPomodoroStats] =
    useState<PomodoroStats>({
      sessions: 0,
      totalMinutes: 0,
      todaySessions: 0,
      todayMinutes: 0,
      weeklyMinutes: 0,
      currentStreak: 0,
    });

  const [pomodoroLoading, setPomodoroLoading] =
    useState(true);

  useEffect(() => {
    function updateDate() {
      const today = new Date();

      const formattedDate = today.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
        }
      );

      setCurrentDate(formattedDate);
    }

    updateDate();

    const dateInterval = window.setInterval(
      updateDate,
      60 * 1000
    );

    const savedDarkMode =
      localStorage.getItem("studyhubDarkMode") === "true";

    setDarkMode(savedDarkMode);

    const savedImage =
      localStorage.getItem("studyhubProfileImage") || "";

    setProfileImage(savedImage);

    const savedUser =
      localStorage.getItem("studyhubUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("studyhubUser");
      }
    }

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.authenticated && data.user) {
          setUser(data.user);

          localStorage.setItem(
            "studyhubUser",
            JSON.stringify(data.user)
          );
        }
      } catch {
        // Keep local user data if request fails.
      }
    }

    async function loadTasks() {
      try {
        setTasksLoading(true);

        const response = await fetch("/api/tasks", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
      } catch (error) {
        console.error(
          "LOAD DASHBOARD TASKS ERROR:",
          error
        );
      } finally {
        setTasksLoading(false);
      }
    }

    async function loadNotifications() {
      try {
        setNotificationsLoading(true);

        const response = await fetch(
          "/api/notifications",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (Array.isArray(data.notifications)) {
          const formattedNotifications =
            data.notifications.map(
              (notification: {
                id: number;
                type?: string;
                title: string;
                message: string;
                link?: string | null;
                is_read?: number | boolean;
                created_at?: string;
              }) => ({
                id: notification.id,
                type:
                  notification.type || "general",
                title: notification.title,
                message: notification.message,
                link:
                  notification.link || null,
                isRead: Boolean(
                  notification.is_read
                ),
                createdAt:
                  notification.created_at ||
                  new Date().toISOString(),
              })
            );

          setNotifications(
            formattedNotifications
          );

          if (
            typeof data.unreadCount ===
            "number"
          ) {
            setUnreadNotifications(
              data.unreadCount
            );
          } else {
            setUnreadNotifications(
              formattedNotifications.filter(
                (notification: Notification) =>
                  !notification.isRead
              ).length
            );
          }
        }
      } catch (error) {
        console.error(
          "LOAD DASHBOARD NOTIFICATIONS ERROR:",
          error
        );
      } finally {
        setNotificationsLoading(false);
      }
    }

    async function loadPomodoroStats() {
      try {
        setPomodoroLoading(true);

        const response = await fetch(
          "/api/pomodoro",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        setPomodoroStats({
          sessions: data.sessions || 0,
          totalMinutes:
            data.totalMinutes || 0,
          todaySessions:
            data.todaySessions || 0,
          todayMinutes:
            data.todayMinutes || 0,
          weeklyMinutes:
            data.weeklyMinutes || 0,
          currentStreak:
            data.currentStreak || 0,
        });
      } catch (error) {
        console.error(
          "LOAD DASHBOARD POMODORO ERROR:",
          error
        );
      } finally {
        setPomodoroLoading(false);
      }
    }

    loadUser();
    loadTasks();
    loadNotifications();
    loadPomodoroStats();

    function updateDarkMode() {
      const value =
        localStorage.getItem(
          "studyhubDarkMode"
        ) === "true";

      setDarkMode(value);
    }

    function updateProfileImage() {
      const image =
        localStorage.getItem(
          "studyhubProfileImage"
        ) || "";

      setProfileImage(image);
    }

    window.addEventListener(
      "studyhub-dark-mode-updated",
      updateDarkMode
    );

    window.addEventListener(
      "studyhub-profile-image-updated",
      updateProfileImage
    );

    window.addEventListener(
      "storage",
      updateDarkMode
    );

    window.addEventListener(
      "storage",
      updateProfileImage
    );

    return () => {
      window.clearInterval(dateInterval);

      window.removeEventListener(
        "studyhub-dark-mode-updated",
        updateDarkMode
      );

      window.removeEventListener(
        "studyhub-profile-image-updated",
        updateProfileImage
      );

      window.removeEventListener(
        "storage",
        updateDarkMode
      );

      window.removeEventListener(
        "storage",
        updateProfileImage
      );
    };
  }, []);

  async function toggleTask(id: number) {
    const task = tasks.find(
      (item) => item.id === id
    );

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
      const response = await fetch(
        `/api/tasks/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: newCompleted,
          }),
        }
      );

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
      console.error(
        "TOGGLE DASHBOARD TASK ERROR:",
        error
      );

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

  async function markNotificationAsRead(
    id: number
  ) {
    const notification =
      notifications.find(
        (item) => item.id === id
      );

    if (
      !notification ||
      notification.isRead
    ) {
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              isRead: true,
            }
          : item
      )
    );

    setUnreadNotifications((current) =>
      Math.max(0, current - 1)
    );

    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            isRead: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notification as read"
        );
      }
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                isRead: false,
              }
            : item
        )
      );

      setUnreadNotifications(
        (current) => current + 1
      );
    }
  }

  async function markAllNotificationsAsRead() {
    const previousNotifications =
      notifications;

    const previousUnread =
      unreadNotifications;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    setUnreadNotifications(0);

    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markAll: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark all notifications as read"
        );
      }
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS ERROR:",
        error
      );

      setNotifications(
        previousNotifications
      );

      setUnreadNotifications(
        previousUnread
      );
    }
  }

  function formatNotificationTime(
    createdAt: string
  ) {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} minute${
        minutes === 1 ? "" : "s"
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  }

  function formatStudyTime(
    minutes: number
  ) {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remainingMinutes =
      minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  const username =
    user?.username || "Student";

  const avatarLetter =
    username.charAt(0).toUpperCase() ||
    "S";

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const activeTasks =
    tasks.filter(
      (task) => !task.completed
    ).length;

  const totalTasks = tasks.length;

  const weeklyGoalMinutes = 10 * 60;

  const weeklyProgress = Math.min(
    Math.round(
      (pomodoroStats.weeklyMinutes /
        weeklyGoalMinutes) *
        100
    ),
    100
  );

  function toggleNotifications() {
    setNotificationsOpen(
      (current) => !current
    );
  }

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
          className={`sticky top-0 z-20 border-b backdrop-blur ${
            darkMode
              ? "border-slate-800 bg-slate-900/95"
              : "border-slate-200 bg-white/95"
          }`}
        >
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <p
                className={`text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {currentDate}
              </p>

              <h1 className="mt-1 text-xl font-bold">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={
                    toggleNotifications
                  }
                  aria-label="Open notifications"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">
                    🔔
                  </span>

                  {unreadNotifications >
                    0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {
                        unreadNotifications
                      }
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className={`absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border shadow-xl ${
                      darkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between border-b px-4 py-4 ${
                        darkMode
                          ? "border-slate-800"
                          : "border-slate-200"
                      }`}
                    >
                      <div>
                        <h3 className="font-bold">
                          Notifications
                        </h3>

                        <p
                          className={`mt-1 text-xs ${
                            darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {unreadNotifications >
                          0
                            ? `${unreadNotifications} unread notification${
                                unreadNotifications >
                                1
                                  ? "s"
                                  : ""
                              }`
                            : "You're all caught up"}
                        </p>
                      </div>

                      {unreadNotifications >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsAsRead
                          }
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="px-4 py-8 text-center">
                          <p
                            className={`text-sm ${
                              darkMode
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            Loading notifications...
                          </p>
                        </div>
                      ) : notifications.length ===
                        0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-2xl">
                            🔔
                          </p>

                          <p
                            className={`mt-2 text-sm ${
                              darkMode
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            No notifications yet.
                          </p>
                        </div>
                      ) : (
                        notifications.map(
                          (
                            notification
                          ) => (
                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() =>
                                markNotificationAsRead(
                                  notification.id
                                )
                              }
                              className={`flex w-full gap-3 border-b p-4 text-left transition last:border-b-0 ${
                                darkMode
                                  ? notification.isRead
                                    ? "border-slate-800 hover:bg-slate-800"
                                    : "border-slate-800 bg-indigo-950/40 hover:bg-indigo-950"
                                  : notification.isRead
                                    ? "border-slate-100 hover:bg-slate-50"
                                    : "border-slate-100 bg-indigo-50/60 hover:bg-indigo-50"
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                  notification.isRead
                                    ? darkMode
                                      ? "bg-slate-800"
                                      : "bg-slate-100"
                                    : "bg-indigo-100"
                                }`}
                              >
                                🔔
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                                  )}
                                </div>

                                <p
                                  className={`mt-1 text-xs ${
                                    darkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {
                                    notification.message
                                  }
                                </p>

                                <p
                                  className={`mt-2 text-[10px] ${
                                    darkMode
                                      ? "text-slate-500"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {formatNotificationTime(
                                    notification.createdAt
                                  )}
                                </p>
                              </div>
                            </button>
                          )
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`hidden h-10 items-center gap-3 rounded-xl border px-3 sm:flex ${
                  darkMode
                    ? "border-slate-700 bg-slate-800"
                    : "border-slate-200 bg-white"
                }`}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${username} profile`}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {avatarLetter}
                  </div>
                )}

                <span className="max-w-32 truncate text-sm font-medium">
                  {username}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <section className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100 lg:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-indigo-100">
                  Good morning 👋
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Ready to study, {username}?
                </h2>

                <p className="mt-2 max-w-xl text-indigo-100">
                  Stay focused, complete your tasks,
                  and keep building your study
                  streak.
                </p>
              </div>

              <a
                href="/pomodoro"
                className="w-fit rounded-xl bg-white px-5 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                Start Pomodoro
              </a>
            </div>
          </section>

          {/* Stats */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="✓"
              title="Tasks completed"
              value={`${completedTasks}/${totalTasks}`}
              description={
                totalTasks === 0
                  ? "No tasks yet"
                  : `${activeTasks} active task${
                      activeTasks === 1
                        ? ""
                        : "s"
                    } remaining`
              }
              darkMode={darkMode}
            />

            <StatCard
              icon="◷"
              title="Study time"
              value={
                pomodoroLoading
                  ? "..."
                  : formatStudyTime(
                      pomodoroStats.totalMinutes
                    )
              }
              description={
                pomodoroLoading
                  ? "Loading..."
                  : `+${formatStudyTime(
                      pomodoroStats.weeklyMinutes
                    )} this week`
              }
              darkMode={darkMode}
            />

            <StatCard
              icon="🔥"
              title="Study streak"
              value={
                pomodoroLoading
                  ? "..."
                  : `${pomodoroStats.currentStreak} day${
                      pomodoroStats.currentStreak === 1
                        ? ""
                        : "s"
                    }`
              }
              description={
                pomodoroLoading
                  ? "Loading..."
                  : pomodoroStats.currentStreak > 0
                    ? "Keep your study streak going!"
                    : "Start studying to build your streak"
              }
              darkMode={darkMode}
            />

            <StatCard
              icon="◎"
              title="Weekly goal"
              value={`${weeklyProgress}%`}
              description={`${formatStudyTime(
                pomodoroStats.weeklyMinutes
              )} of 10 hours`}
              darkMode={darkMode}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Tasks */}
            <div
              className={`rounded-2xl border ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b p-5 ${
                  darkMode
                    ? "border-slate-800"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <h2 className="font-bold">
                    Today's Tasks
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Keep your day organized.
                  </p>
                </div>

                <a
                  href="/tasks"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all
                </a>
              </div>

              <div
                className={`divide-y ${
                  darkMode
                    ? "divide-slate-800"
                    : "divide-slate-100"
                }`}
              >
                {tasksLoading ? (
                  <div className="p-8 text-center">
                    <p
                      className={`text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Loading tasks...
                    </p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      ✓
                    </div>

                    <p className="mt-3 font-semibold">
                      No tasks yet
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Create your first task to
                      get started.
                    </p>

                    <a
                      href="/tasks"
                      className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Create Task
                    </a>
                  </div>
                ) : (
                  tasks
                    .slice(0, 5)
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onClick={() =>
                          toggleTask(task.id)
                        }
                        darkMode={darkMode}
                      />
                    ))
                )}
              </div>

              <div className="p-5">
                <a
                  href="/tasks"
                  className={`block w-full rounded-xl border border-dashed py-3 text-center text-sm font-semibold transition ${
                    darkMode
                      ? "border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
                      : "border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  + Add new task
                </a>
              </div>
            </div>

            {/* Schedule */}
            <div
              className={`rounded-2xl border ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b p-5 ${
                  darkMode
                    ? "border-slate-800"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <h2 className="font-bold">
                    Today's Schedule
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Your planned study sessions.
                  </p>
                </div>

                <a
                  href="/planner"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Planner
                </a>
              </div>

              <div className="space-y-1 p-5">
                <div
                  className={`rounded-xl p-4 ${
                    darkMode
                      ? "bg-slate-800"
                      : "bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    Planner sessions are available
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Open Planner to view and manage
                    your study schedule.
                  </p>

                  <a
                    href="/planner"
                    className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Open Planner →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Cards */}
          <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* Weekly Progress */}
            <div
              className={`rounded-2xl border p-5 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    Weekly Progress
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Your study activity.
                  </p>
                </div>

                <span className="text-sm font-semibold text-indigo-600">
                  {weeklyProgress}%
                </span>
              </div>

              <div
                className={`mt-6 h-3 overflow-hidden rounded-full ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-slate-100"
                }`}
              >
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${weeklyProgress}%`,
                  }}
                />
              </div>

              <div
                className={`mt-4 flex justify-between text-xs ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                <span>0h</span>
                <span>5h</span>
                <span>10h</span>
              </div>

              <p
                className={`mt-4 text-sm ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                {formatStudyTime(
                  pomodoroStats.weeklyMinutes
                )}{" "}
                studied this week.
              </p>

              <a
                href="/progress"
                className="mt-5 block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View detailed progress →
              </a>
            </div>

            {/* Quick Actions */}
            <div
              className={`rounded-2xl border p-5 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="font-bold">
                Quick Actions
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <QuickAction
                  href="/notes"
                  icon="✎"
                  label="New Note"
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/tasks"
                  icon="✓"
                  label="New Task"
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/pomodoro"
                  icon="◷"
                  label="Pomodoro"
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/groups"
                  icon="👥"
                  label="Join Group"
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* Focus Session */}
            <div
              className={`rounded-2xl border p-5 md:col-span-2 xl:col-span-1 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="font-bold">
                Focus Session
              </h2>

              <div
                className={`mt-5 flex items-center justify-between rounded-xl p-4 ${
                  darkMode
                    ? "bg-indigo-950"
                    : "bg-indigo-50"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      darkMode
                        ? "text-indigo-200"
                        : "text-indigo-900"
                    }`}
                  >
                    Ready to focus?
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? "text-indigo-300"
                        : "text-indigo-600"
                    }`}
                  >
                    Start a 25 minute session.
                  </p>
                </div>

                <a
                  href="/pomodoro"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700"
                >
                  ▶
                </a>
              </div>

              <div
                className={`mt-4 rounded-xl p-4 ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Today's focus time
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatStudyTime(
                    pomodoroStats.todayMinutes
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
  darkMode,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            darkMode
              ? "bg-indigo-950 text-indigo-300"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`mt-3 text-xs ${
          darkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function TaskItem({
  task,
  onClick,
  darkMode,
}: {
  task: Task;
  onClick: () => void;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-5 transition ${
        darkMode
          ? "hover:bg-slate-800"
          : "hover:bg-slate-50"
      }`}
    >
      <button
        onClick={onClick}
        aria-label={
          task.completed
            ? "Mark task as active"
            : "Mark task as completed"
        }
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          task.completed
            ? "border-indigo-600 bg-indigo-600 text-xs text-white"
            : darkMode
              ? "border-slate-600 hover:border-indigo-500"
              : "border-slate-300 hover:border-indigo-500"
        }`}
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            task.completed
              ? "text-slate-400 line-through"
              : darkMode
                ? "text-slate-200"
                : "text-slate-800"
          }`}
        >
          {task.title}
        </p>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          {task.subject}
        </p>
      </div>

      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          task.priority === "High"
            ? "bg-red-50 text-red-600"
            : task.priority === "Medium"
              ? "bg-yellow-50 text-yellow-600"
              : "bg-green-50 text-green-600"
        }`}
      >
        {task.priority}
      </span>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  darkMode,
}: {
  href: string;
  icon: string;
  label: string;
  darkMode: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
        darkMode
          ? "border-slate-700 text-slate-300 hover:border-indigo-700 hover:bg-indigo-950 hover:text-indigo-300"
          : "border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </a>
  );
}