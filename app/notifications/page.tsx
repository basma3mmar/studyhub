"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: number;
  created_at: string;
};

function getNotificationIcon(type: string) {
  switch (type) {
    case "session":
      return "📚";
    case "group":
      return "👥";
    case "note":
      return "📝";
    case "material":
      return "📎";
    case "task":
      return "✅";
    default:
      return "🔔";
  }
}

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications."
        );
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: number) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      if (!response.ok) {
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: 1,
              }
            : notification
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAll: true,
        }),
      });

      if (!response.ok) {
        return;
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: 1,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (notification.is_read === 0) {
      await markAsRead(notification.id);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f8] text-gray-900 dark:bg-[#0f1117] dark:text-white">
      <Sidebar />

      <main className="ml-64 min-h-screen px-8 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-pink-500 dark:text-gray-400"
              >
                ← Back to Dashboard
              </Link>

              <h1 className="text-3xl font-bold">
                Notifications
              </h1>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Stay updated with everything happening in
                your StudyHub.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50 dark:border-pink-900/40 dark:bg-[#171a22] dark:text-pink-400 dark:hover:bg-pink-950/20"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#171a22]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Notifications
              </p>

              <p className="mt-2 text-3xl font-bold">
                {notifications.length}
              </p>
            </div>

            <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5 shadow-sm dark:border-pink-900/30 dark:bg-pink-950/10">
              <p className="text-sm text-pink-600 dark:text-pink-400">
                Unread
              </p>

              <p className="mt-2 text-3xl font-bold text-pink-600 dark:text-pink-400">
                {unreadCount}
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-[#171a22]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-pink-500" />

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading notifications...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
              <p className="font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>

              <button
                onClick={loadNotifications}
                className="mt-4 rounded-xl bg-pink-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            notifications.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm dark:border-gray-800 dark:bg-[#171a22]">
                <div className="mb-4 text-5xl">🔔</div>

                <h2 className="text-xl font-bold">
                  No notifications yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                  When something important happens in your
                  StudyHub account, your notifications will
                  appear here.
                </p>
              </div>
            )}

          {/* Notifications */}
          {!loading &&
            !error &&
            notifications.length > 0 && (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const content = (
                    <div
                      className={`group relative rounded-2xl border p-5 transition ${
                        notification.is_read === 0
                          ? "border-pink-200 bg-pink-50/70 shadow-sm dark:border-pink-900/40 dark:bg-pink-950/10"
                          : "border-gray-200 bg-white hover:border-pink-200 hover:shadow-sm dark:border-gray-800 dark:bg-[#171a22] dark:hover:border-pink-900/40"
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                            notification.is_read === 0
                              ? "bg-pink-100 dark:bg-pink-900/30"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          {getNotificationIcon(
                            notification.type
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold">
                                  {notification.title}
                                </h3>

                                {notification.is_read ===
                                  0 && (
                                  <span className="h-2 w-2 rounded-full bg-pink-500" />
                                )}
                              </div>

                              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                {notification.message}
                              </p>
                            </div>

                            <span className="shrink-0 text-xs text-gray-400">
                              {formatDate(
                                notification.created_at
                              )}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {notification.type}
                            </span>

                            {notification.is_read === 0 && (
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs font-semibold text-pink-600 transition hover:text-pink-700 dark:text-pink-400"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                  if (notification.link) {
                    return (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className="block"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={notification.id}
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      className="cursor-pointer"
                    >
                      {content}
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