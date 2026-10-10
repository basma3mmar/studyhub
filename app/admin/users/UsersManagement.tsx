"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

type User = {
  id: number;
  username: string;
  email: string;
  role: "Super Owner" | "Owner" | "Admin" | "User";
  isPrimaryOwner?: boolean;
  isActive?: boolean;
};

type CurrentUser = {
  id: number;
  username: string;
  role: User["role"];
};

const roles: User["role"][] = [
  "Super Owner",
  "Owner",
  "Admin",
  "User",
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCurrentUserPrimaryOwner, setIsCurrentUserPrimaryOwner] =
    useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, currentUserResponse] =
        await Promise.all([
          fetch("/api/admin/users", {
            cache: "no-store",
          }),
          fetch("/api/auth/me", {
            cache: "no-store",
          }),
        ]);

      const usersData = await usersResponse.json();
      const currentUserData = await currentUserResponse.json();

      if (!usersResponse.ok) {
        throw new Error(
          usersData.message ||
            usersData.error ||
            "Failed to load users"
        );
      }

      if (!currentUserResponse.ok || !currentUserData.user) {
        throw new Error(
          currentUserData.message ||
            "Failed to identify the current user"
        );
      }

      const loadedUsers: User[] = usersData.users || [];
      const currentUser: CurrentUser = currentUserData.user;

      const currentUserRecord = loadedUsers.find(
        (user) => user.id === currentUser.id
      );

      setUsers(loadedUsers);

      setIsCurrentUserPrimaryOwner(
        currentUser.role === "Owner" &&
          currentUserRecord?.isPrimaryOwner === true
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateRole(
    userId: number,
    role: User["role"]
  ) {
    const targetUser = users.find(
      (user) => user.id === userId
    );

    if (targetUser?.isPrimaryOwner) {
      setError("The Original Owner cannot be modified.");
      return;
    }

    // Only the Original Owner can assign Owner or Super Owner.
    if (
      !isCurrentUserPrimaryOwner &&
      (role === "Owner" || role === "Super Owner")
    ) {
      setError(
        "Only the Original Owner can assign Owner or Super Owner."
      );
      return;
    }

    try {
      setSavingId(userId);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update role"
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role,
              }
            : user
        )
      );

      setSuccess("User role updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update role"
      );
    } finally {
      setSavingId(null);
    }
  }

  function getRoleBadgeClass(role: User["role"]) {
    switch (role) {
      case "Super Owner":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";

      case "Owner":
        return "bg-green-500/15 text-green-400 border-green-500/30";

      case "Admin":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";

      default:
        return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15 text-2xl">
                👥
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  User Management
                </h1>

                <p className="mt-1 text-slate-400">
                  Manage users and their permissions.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-400">
              {success}
            </div>
          )}

          {/* Stats */}
          {!loading && (
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Total Users
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {users.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Owners
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  {
                    users.filter(
                      (user) =>
                        user.role === "Owner" ||
                        user.role === "Super Owner"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Admins
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-400">
                  {
                    users.filter(
                      (user) => user.role === "Admin"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Regular Users
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-300">
                  {
                    users.filter(
                      (user) => user.role === "User"
                    ).length
                  }
                </p>
              </div>
            </div>
          )}

          {/* Users table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="border-b border-slate-800 px-6 py-5">
              <h2 className="text-xl font-semibold">
                All Users
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Change user roles and manage access.
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-slate-400">
                  Loading users...
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center text-slate-400">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-left">
                      <th className="px-6 py-4 text-sm font-medium text-slate-400">
                        Username
                      </th>

                      <th className="px-6 py-4 text-sm font-medium text-slate-400">
                        Email
                      </th>

                      <th className="px-6 py-4 text-sm font-medium text-slate-400">
                        Current Role
                      </th>

                      <th className="px-6 py-4 text-sm font-medium text-slate-400">
                        Change Role
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15 font-semibold text-green-400">
                              {user.username
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white">
                                  {user.username}
                                </p>

                                {user.isPrimaryOwner && (
                                  <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                                    Original Owner
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500">
                                ID: {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {user.email}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {user.isPrimaryOwner ? (
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
                                Protected
                              </span>

                              <span className="text-xs text-slate-500">
                                Cannot be modified
                              </span>
                            </div>
                          ) : (
                            <>
                              <select
                                value={user.role}
                                disabled={savingId === user.id}
                                onChange={(event) =>
                                  updateRole(
                                    user.id,
                                    event.target.value as User["role"]
                                  )
                                }
                                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {roles
                                  .filter(
                                    (role) =>
                                      isCurrentUserPrimaryOwner ||
                                      role === "Admin" ||
                                      role === "User" ||
                                      role === user.role
                                  )
                                  .map((role) => (
                                    <option
                                      key={role}
                                      value={role}
                                      disabled={
                                        !isCurrentUserPrimaryOwner &&
                                        role !== "Admin" &&
                                        role !== "User"
                                      }
                                    >
                                      {role}
                                    </option>
                                  ))}
                              </select>

                              {savingId === user.id && (
                                <span className="ml-3 text-xs text-slate-400">
                                  Saving...
                                </span>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
