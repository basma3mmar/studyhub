"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/dashboard", icon: "⌂", label: "Dashboard" },
  { href: "/planner", icon: "▣", label: "Planner" },
  { href: "/tasks", icon: "✓", label: "Tasks" },
  { href: "/notes", icon: "✎", label: "Notes" },
  { href: "/pomodoro", icon: "◷", label: "Pomodoro" },
  { href: "/materials", icon: "▤", label: "Materials" },
  { href: "/groups", icon: "👥", label: "Study Groups" },
  { href: "/progress", icon: "▥", label: "Progress" },
  { href: "/notifications", icon: "🔔", label: "Notifications" },
];

type User = {
  id: number;
  username: string;
  email: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem("studyhubUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("studyhubUser");
      }
    }

    const savedImage =
      localStorage.getItem("studyhubProfileImage");

    if (savedImage) {
      setProfileImage(savedImage);
    }

    const savedDarkMode =
      localStorage.getItem("studyhubDarkMode");

    setDarkMode(savedDarkMode === "true");

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.authenticated && data.user) {
          setUser(data.user);

          localStorage.setItem(
            "studyhubUser",
            JSON.stringify(data.user)
          );
        }
      } catch {
        // Keep existing user data if request fails.
      }
    }

    async function loadUnreadNotifications() {
      try {
        const response = await fetch(
          "/api/notifications",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUnreadCount(
          Number(data.unreadCount || 0)
        );
      } catch {
        // Keep current notification count.
      }
    }

    loadUser();
    loadUnreadNotifications();

    const notificationInterval =
      window.setInterval(
        loadUnreadNotifications,
        30000
      );

    function updateProfileImage() {
      const image =
        localStorage.getItem(
          "studyhubProfileImage"
        );

      setProfileImage(image || "");
    }

    function updateDarkMode() {
      const value =
        localStorage.getItem(
          "studyhubDarkMode"
        ) === "true";

      setDarkMode(value);
    }

    function updateNotifications() {
      loadUnreadNotifications();
    }

    window.addEventListener(
      "studyhub-profile-image-updated",
      updateProfileImage
    );

    window.addEventListener(
      "studyhub-dark-mode-updated",
      updateDarkMode
    );

    window.addEventListener(
      "studyhub-notifications-updated",
      updateNotifications
    );

    window.addEventListener(
      "storage",
      updateProfileImage
    );

    window.addEventListener(
      "storage",
      updateDarkMode
    );

    return () => {
      window.clearInterval(
        notificationInterval
      );

      window.removeEventListener(
        "studyhub-profile-image-updated",
        updateProfileImage
      );

      window.removeEventListener(
        "studyhub-dark-mode-updated",
        updateDarkMode
      );

      window.removeEventListener(
        "studyhub-notifications-updated",
        updateNotifications
      );

      window.removeEventListener(
        "storage",
        updateProfileImage
      );

      window.removeEventListener(
        "storage",
        updateDarkMode
      );
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore logout errors.
    }

    localStorage.removeItem("studyhubUser");
    localStorage.removeItem(
      "studyhubProfileImage"
    );

    router.push("/login");
    router.refresh();
  }

  const username =
    user?.username || "Student";

  const email =
    user?.email || "student@example.com";

  const avatarLetter =
    username.charAt(0).toUpperCase();

  return (
    <aside
      className={`fixed left-0 top-0 hidden h-screen w-64 border-r lg:block ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div
          className={`border-b px-6 py-6 ${
            darkMode
              ? "border-slate-800"
              : "border-slate-200"
          }`}
        >
          <Link
            href="/dashboard"
            className="text-2xl font-bold tracking-tight"
          >
            Study
            <span className="text-indigo-600">
              Hub
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-700"
                    : darkMode
                      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="flex w-5 justify-center text-base">
                  {item.icon}
                </span>

                <span className="flex-1">
                  {item.label}
                </span>

                {item.href ===
                  "/notifications" &&
                  unreadCount > 0 && (
                    <span className="flex min-w-[22px] items-center justify-center rounded-full bg-pink-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          className={`border-t p-4 ${
            darkMode
              ? "border-slate-800"
              : "border-slate-200"
          }`}
        >
          {/* Settings */}
          <Link
            href="/settings"
            className={`mb-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/settings"
                ? darkMode
                  ? "bg-indigo-950 text-indigo-300"
                  : "bg-indigo-50 text-indigo-700"
                : darkMode
                  ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="flex w-5 justify-center text-base">
              ⚙
            </span>

            Settings
          </Link>

          {/* User profile */}
          <div
            className={`rounded-xl p-3 ${
              darkMode
                ? "bg-slate-800"
                : "bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Link
                href="/settings"
                className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold transition ${
                  darkMode
                    ? "bg-indigo-950 text-indigo-300 hover:bg-indigo-900"
                    : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                }`}
                title="Open profile"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${username} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </Link>

              {/* User information */}
              <Link
                href="/settings"
                className="min-w-0 flex-1"
              >
                <p
                  className={`truncate text-sm font-semibold ${
                    darkMode
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  {username}
                </p>

                <p
                  className={`truncate text-xs ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {email}
                </p>
              </Link>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                darkMode
                  ? "border-red-900/50 bg-red-950/40 text-red-400 hover:border-red-700 hover:bg-red-900/70 hover:text-red-300"
                  : "border-red-100 bg-red-50 text-red-600 hover:border-red-200 hover:bg-red-100 hover:text-red-700"
              }`}
            >
              <span className="text-base">
                ↪
              </span>

              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}