"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
};

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [profileImage, setProfileImage] = useState("");
  const [pendingProfileImage, setPendingProfileImage] =
    useState("");

  const [notifications, setNotifications] = useState(true);
  const [pendingNotifications, setPendingNotifications] =
    useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const [pendingDarkMode, setPendingDarkMode] = useState(false);

  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();

          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Ignore.
      }
    }

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/profile", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.success) {
          const image = data.profileImage || "";

          setProfileImage(image);
          setPendingProfileImage(image);

          if (image) {
            localStorage.setItem(
              "studyhubProfileImage",
              image
            );
          }
        }
      } catch {
        const savedImage =
          localStorage.getItem(
            "studyhubProfileImage"
          ) || "";

        setProfileImage(savedImage);
        setPendingProfileImage(savedImage);
      }
    }

    loadUser();
    loadProfile();

    const savedNotifications =
      localStorage.getItem("studyhubNotifications");

    const savedDarkMode =
      localStorage.getItem("studyhubDarkMode");

    if (savedNotifications !== null) {
      const value =
        savedNotifications === "true";

      setNotifications(value);
      setPendingNotifications(value);
    }

    if (savedDarkMode !== null) {
      const value = savedDarkMode === "true";

      setDarkMode(value);
      setPendingDarkMode(value);
    }
  }, []);

  useEffect(() => {
    if (pendingDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [pendingDarkMode]);

  const username = user?.username || "Student";
  const email =
    user?.email || "student@example.com";

  const avatarLetter =
    username.charAt(0).toUpperCase();

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = String(reader.result);

      setPendingProfileImage(image);
    };

    reader.readAsDataURL(file);
  }

  function toggleNotifications() {
    setPendingNotifications(
      (current) => !current
    );
  }

  function toggleAppearance() {
    setPendingDarkMode(
      (current) => !current
    );
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/auth/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileImage: pendingProfileImage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save profile."
        );
      }

      localStorage.setItem(
        "studyhubProfileImage",
        pendingProfileImage
      );

      localStorage.setItem(
        "studyhubNotifications",
        String(pendingNotifications)
      );

      localStorage.setItem(
        "studyhubDarkMode",
        String(pendingDarkMode)
      );

      setProfileImage(pendingProfileImage);
      setNotifications(
        pendingNotifications
      );
      setDarkMode(pendingDarkMode);

      window.dispatchEvent(
        new Event(
          "studyhub-profile-image-updated"
        )
      );

      window.dispatchEvent(
        new Event(
          "studyhub-dark-mode-updated"
        )
      );

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      className={`min-h-screen transition-colors ${
        pendingDarkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      } lg:pl-64`}
    >
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">

        {/* Header */}

        <div className="mb-8">
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${
              pendingDarkMode
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-5 text-3xl font-bold">
            Settings
          </h1>

          <p
            className={`mt-2 ${
              pendingDarkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Manage your StudyHub account and
            preferences.
          </p>
        </div>

        {/* Profile */}

        <section
          className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${
            pendingDarkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              {pendingProfileImage ? (
                <img
                  src={pendingProfileImage}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-100"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600 ring-4 ring-indigo-50">
                  {avatarLetter}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-sm text-white shadow-md transition hover:bg-indigo-700"
                title="Change profile picture"
              >
                📷
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {username}
              </h2>

              <p
                className={`mt-1 text-sm ${
                  pendingDarkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {email}
              </p>

              <div className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                Active account
              </div>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-4 block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Change profile picture
              </button>
            </div>
          </div>
        </section>

        {/* Account Information */}

        <section
          className={`mt-6 rounded-2xl border p-6 shadow-sm sm:p-8 ${
            pendingDarkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <h2 className="text-lg font-bold">
            Account Information
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Username
              </p>

              <div
                className={`mt-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                  pendingDarkMode
                    ? "border-slate-700 bg-slate-800 text-slate-200"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {username}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                StudyHub Email
              </p>

              <div
                className={`mt-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                  pendingDarkMode
                    ? "border-slate-700 bg-slate-800 text-slate-200"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {email}
              </div>
            </div>

          </div>
        </section>

        {/* Preferences */}

        <section
          className={`mt-6 rounded-2xl border p-6 shadow-sm sm:p-8 ${
            pendingDarkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <h2 className="text-lg font-bold">
            Preferences
          </h2>

          <div className="mt-5 divide-y divide-slate-200/10">

            {/* Notifications */}

            <div className="flex items-center justify-between gap-6 py-5">
              <div>
                <p className="text-sm font-semibold">
                  Notifications
                </p>

                <p
                  className={`mt-1 text-xs ${
                    pendingDarkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Manage your study reminders and
                  notifications.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleNotifications}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  pendingNotifications
                    ? "bg-indigo-600"
                    : "bg-slate-300"
                }`}
                aria-label="Toggle notifications"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    pendingNotifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Appearance */}

            <div className="flex items-center justify-between gap-6 py-5">
              <div>
                <p className="text-sm font-semibold">
                  Appearance
                </p>

                <p
                  className={`mt-1 text-xs ${
                    pendingDarkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Choose between light and dark mode.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleAppearance}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  pendingDarkMode
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {pendingDarkMode
                  ? "Dark"
                  : "Light"}
              </button>
            </div>

          </div>
        </section>

        {/* Save */}

        <div className="mt-6 flex justify-end pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>

      </div>
    </main>
  );
}