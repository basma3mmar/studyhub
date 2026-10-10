"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type User = {
  id: number;
  username: string;
  profileImage: string;
  profileVisibility?: string;
};

type Friend = {
  id: number;
  user_id: number;
  username: string;
  profile_image: string | null;
  created_at: string;
};

type FriendRequest = {
  id: number;
  sender_id?: number;
  receiver_id?: number;
  username: string;
  profile_image: string | null;
  status: string;
  created_at: string;
};

type BlockedUser = {
  id: number;
  user_id: number;
  username: string;
  profile_image: string | null;
  created_at: string;
};

type PrivacySettings = {
  profileVisibility: "public" | "hidden";
  allowFriendRequests:
    | "everyone"
    | "friends_only"
    | "none";
  allowMessages:
    | "everyone"
    | "friends_only"
    | "none";
  allowCalls:
    | "everyone"
    | "friends_only"
    | "none";
};

type Tab =
  | "search"
  | "requests"
  | "friends"
  | "blocked"
  | "privacy";

export default function FriendsPage() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [activeTab, setActiveTab] =
    useState<Tab>("search");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] =
    useState<User[]>([]);

  const [friends, setFriends] =
    useState<Friend[]>([]);

  const [receivedRequests, setReceivedRequests] =
    useState<FriendRequest[]>([]);

  const [sentRequests, setSentRequests] =
    useState<FriendRequest[]>([]);

  const [blockedUsers, setBlockedUsers] =
    useState<BlockedUser[]>([]);

  const [privacy, setPrivacy] =
    useState<PrivacySettings>({
      profileVisibility: "public",
      allowFriendRequests: "everyone",
      allowMessages: "everyone",
      allowCalls: "friends_only",
    });

  const [loading, setLoading] =
    useState(false);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [privacyLoading, setPrivacyLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadFriendsData();
    loadPrivacy();
  }, []);

  async function loadFriendsData() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/friends/requests",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل تحميل بيانات الأصدقاء."
              : "Failed to load friends.")
        );
      }

      setReceivedRequests(
        data.receivedRequests || []
      );

      setSentRequests(
        data.sentRequests || []
      );

      setFriends(data.friends || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "فشل تحميل بيانات الأصدقاء."
            : "Failed to load friends."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadBlockedUsers() {
    try {
      const response = await fetch(
        "/api/friends/block",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل تحميل المستخدمين المحظورين."
              : "Failed to load blocked users.")
        );
      }

      setBlockedUsers(
        data.blockedUsers || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "فشل تحميل المستخدمين المحظورين."
            : "Failed to load blocked users."
      );
    }
  }

  async function loadPrivacy() {
    try {
      const response = await fetch(
        "/api/privacy",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل تحميل إعدادات الخصوصية."
              : "Failed to load privacy settings.")
        );
      }

      if (data.settings) {
        setPrivacy({
          profileVisibility:
            data.settings.profileVisibility ===
            "hidden"
              ? "hidden"
              : "public",

          allowFriendRequests:
            data.settings.allowFriendRequests ===
              "friends_only" ||
            data.settings.allowFriendRequests ===
              "none"
              ? data.settings.allowFriendRequests
              : "everyone",

          allowMessages:
            data.settings.allowMessages ===
              "friends_only" ||
            data.settings.allowMessages ===
              "none"
              ? data.settings.allowMessages
              : "everyone",

          allowCalls:
            data.settings.allowCalls ===
              "friends_only" ||
            data.settings.allowCalls === "none"
              ? data.settings.allowCalls
              : "everyone",
        });
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "فشل تحميل إعدادات الخصوصية."
            : "Failed to load privacy settings."
      );
    }
  }

  async function handleSearch() {
    const query = search.trim();

    if (query.length < 2) {
      setSearchResults([]);

      setMessage(
        isArabic
          ? "اكتبي حرفين على الأقل للبحث."
          : "Enter at least 2 characters to search."
      );

      return;
    }

    setSearchLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/friends/search?q=${encodeURIComponent(
          query
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل البحث عن المستخدمين."
              : "Failed to search users.")
        );
      }

      setSearchResults(
        data.users || []
      );

      if (
        (data.users || []).length === 0
      ) {
        setMessage(
          isArabic
            ? "لا يوجد مستخدمون مطابقون."
            : "No matching users found."
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "حدث خطأ أثناء البحث."
            : "An error occurred while searching."
      );
    } finally {
      setSearchLoading(false);
    }
  }

  async function sendFriendRequest(
    userId: number
  ) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/friends/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل إرسال طلب الصداقة."
              : "Failed to send friend request.")
        );
      }

      setMessage(
        data.message ||
          (isArabic
            ? "تم إرسال طلب الصداقة بنجاح."
            : "Friend request sent successfully.")
      );

      await loadFriendsData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "حدث خطأ أثناء إرسال الطلب."
            : "An error occurred while sending the request."
      );
    }
  }

  async function handleRequestAction(
    requestId: number,
    action:
      | "accept"
      | "reject"
      | "cancel"
  ) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/friends/requests/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل تنفيذ الطلب."
              : "Failed to process request.")
        );
      }

      setMessage(
        data.message ||
          (isArabic
            ? "تم تنفيذ العملية بنجاح."
            : "Operation completed successfully.")
      );

      await loadFriendsData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "حدث خطأ أثناء تنفيذ العملية."
            : "An error occurred while processing the request."
      );
    }
  }

  async function removeFriend(
    userId: number
  ) {
    if (
      !window.confirm(
        isArabic
          ? "هل أنتِ متأكدة أنك تريدين حذف هذا الصديق؟"
          : "Are you sure you want to remove this friend?"
      )
    ) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/friends",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل حذف الصديق."
              : "Failed to remove friend.")
        );
      }

      setMessage(
        isArabic
          ? "تم حذف الصديق بنجاح."
          : "Friend removed successfully."
      );

      await loadFriendsData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "حدث خطأ أثناء حذف الصديق."
            : "An error occurred while removing the friend."
      );
    }
  }

  async function blockUser(
    userId: number
  ) {
    if (
      !window.confirm(
        isArabic
          ? "هل أنتِ متأكدة أنك تريدين حظر هذا المستخدم؟"
          : "Are you sure you want to block this user?"
      )
    ) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/friends/block",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل حظر المستخدم."
              : "Failed to block user.")
        );
      }

      setMessage(
        isArabic
          ? "تم حظر المستخدم بنجاح."
          : "User blocked successfully."
      );

      await loadFriendsData();
      await loadBlockedUsers();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "حدث خطأ أثناء حظر المستخدم."
            : "An error occurred while blocking the user."
      );
    }
  }

  async function unblockUser(
    userId: number
  ) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/friends/block",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل إلغاء حظر المستخدم."
              : "Failed to unblock user.")
        );
      }

      setMessage(
        isArabic
          ? "تم إلغاء حظر المستخدم."
          : "User unblocked successfully."
      );

      await loadBlockedUsers();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "حدث خطأ أثناء إلغاء الحظر."
            : "An error occurred while unblocking the user."
      );
    }
  }

  async function updatePrivacy(
    updates: Partial<PrivacySettings>
  ) {
    const newSettings = {
      ...privacy,
      ...updates,
    };

    setPrivacy(newSettings);
    setPrivacyLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/privacy",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            newSettings
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل حفظ إعدادات الخصوصية."
              : "Failed to update privacy settings.")
        );
      }

      if (data.settings) {
        setPrivacy({
          profileVisibility:
            data.settings.profileVisibility ===
            "hidden"
              ? "hidden"
              : "public",

          allowFriendRequests:
            data.settings.allowFriendRequests ===
              "friends_only" ||
            data.settings.allowFriendRequests ===
              "none"
              ? data.settings.allowFriendRequests
              : "everyone",

          allowMessages:
            data.settings.allowMessages ===
              "friends_only" ||
            data.settings.allowMessages ===
              "none"
              ? data.settings.allowMessages
              : "everyone",

          allowCalls:
            data.settings.allowCalls ===
              "friends_only" ||
            data.settings.allowCalls === "none"
              ? data.settings.allowCalls
              : "everyone",
        });
      }

      setMessage(
        isArabic
          ? "تم حفظ إعدادات الخصوصية."
          : "Privacy settings saved."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? "حدث خطأ أثناء حفظ الخصوصية."
            : "An error occurred while saving privacy settings."
      );

      await loadPrivacy();
    } finally {
      setPrivacyLoading(false);
    }
  }

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setMessage("");
    setError("");

    if (tab === "blocked") {
      loadBlockedUsers();
    }
  }

  function getInitial(
    username: string
  ) {
    return (
      username
        .charAt(0)
        .toUpperCase() || "U"
    );
  }

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
    >
      <Sidebar />

      <main
        className={`min-h-screen ${
          isArabic ? "lg:mr-72" : "lg:ml-72"
        }`}
      >
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {isArabic
                ? "الأصدقاء والخصوصية"
                : "Friends & Privacy"}
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {isArabic
                ? "ابحثي عن الطلاب، أضيفي أصدقاء، وتحكمي في إعدادات الخصوصية."
                : "Find students, add friends, and manage your privacy settings."}
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex min-w-max gap-2 rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900">
              <TabButton
                active={
                  activeTab === "search"
                }
                onClick={() =>
                  switchTab("search")
                }
              >
                🔎{" "}
                {isArabic
                  ? "البحث"
                  : "Search"}
              </TabButton>

              <TabButton
                active={
                  activeTab === "requests"
                }
                onClick={() =>
                  switchTab("requests")
                }
              >
                📨{" "}
                {isArabic
                  ? "الطلبات"
                  : "Requests"}

                {receivedRequests.length >
                  0 && (
                  <span className="mr-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">
                    {
                      receivedRequests.length
                    }
                  </span>
                )}
              </TabButton>

              <TabButton
                active={
                  activeTab === "friends"
                }
                onClick={() =>
                  switchTab("friends")
                }
              >
                👥{" "}
                {isArabic
                  ? "أصدقائي"
                  : "My Friends"}

                {friends.length > 0 && (
                  <span className="mr-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {friends.length}
                  </span>
                )}
              </TabButton>

              <TabButton
                active={
                  activeTab === "blocked"
                }
                onClick={() =>
                  switchTab("blocked")
                }
              >
                🚫{" "}
                {isArabic
                  ? "المحظورون"
                  : "Blocked"}
              </TabButton>

              <TabButton
                active={
                  activeTab === "privacy"
                }
                onClick={() =>
                  switchTab("privacy")
                }
              >
                ⚙️{" "}
                {isArabic
                  ? "الخصوصية"
                  : "Privacy"}
              </TabButton>
            </div>
          </div>

          {/* Search */}
          {activeTab === "search" && (
            <section className="space-y-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <h2 className="mb-1 text-xl font-bold">
                  {isArabic
                    ? "البحث عن مستخدم"
                    : "Search for a User"}
                </h2>

                <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                  {isArabic
                    ? "ابحثي باستخدام اسم المستخدم."
                    : "Search using a username."}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        handleSearch();
                      }
                    }}
                    placeholder={
                      isArabic
                        ? "اكتبي username..."
                        : "Enter username..."
                    }
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
                  />

                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {searchLoading
                      ? isArabic
                        ? "جاري البحث..."
                        : "Searching..."
                      : isArabic
                        ? "بحث"
                        : "Search"}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {searchResults.map(
                    (user) => (
                      <UserCard
                        key={user.id}
                        username={
                          user.username
                        }
                        profileImage={
                          user.profileImage
                        }
                        getInitial={
                          getInitial
                        }
                        actions={
                          <>
                            <button
                              onClick={() =>
                                sendFriendRequest(
                                  user.id
                                )
                              }
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                              ➕{" "}
                              {isArabic
                                ? "إضافة صديق"
                                : "Add Friend"}
                            </button>

                            <button
                              onClick={() =>
                                blockUser(
                                  user.id
                                )
                              }
                              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              🚫{" "}
                              {isArabic
                                ? "حظر"
                                : "Block"}
                            </button>
                          </>
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* Requests */}
          {activeTab === "requests" && (
            <section className="space-y-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <h2 className="mb-1 text-xl font-bold">
                  {isArabic
                    ? "طلبات الصداقة"
                    : "Friend Requests"}
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic
                    ? "الطلبات الواردة والمرسلة."
                    : "Incoming and outgoing friend requests."}
                </p>
              </div>

              {/* Received */}
              <div>
                <h3 className="mb-3 text-lg font-bold">
                  {isArabic
                    ? "الطلبات الواردة"
                    : "Incoming Requests"}
                </h3>

                {loading ? (
                  <EmptyState
                    text={
                      isArabic
                        ? "جاري التحميل..."
                        : "Loading..."
                    }
                  />
                ) : receivedRequests.length ===
                  0 ? (
                  <EmptyState
                    text={
                      isArabic
                        ? "لا توجد طلبات واردة."
                        : "No incoming requests."
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {receivedRequests.map(
                      (request) => (
                        <div
                          key={request.id}
                          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900"
                        >
                          <UserIdentity
                            username={
                              request.username
                            }
                            profileImage={
                              request.profile_image
                            }
                            getInitial={
                              getInitial
                            }
                            isArabic={
                              isArabic
                            }
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleRequestAction(
                                  request.id,
                                  "accept"
                                )
                              }
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                              {isArabic
                                ? "قبول"
                                : "Accept"}
                            </button>

                            <button
                              onClick={() =>
                                handleRequestAction(
                                  request.id,
                                  "reject"
                                )
                              }
                              className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300"
                            >
                              {isArabic
                                ? "رفض"
                                : "Reject"}
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Sent */}
              <div>
                <h3 className="mb-3 text-lg font-bold">
                  {isArabic
                    ? "الطلبات المرسلة"
                    : "Sent Requests"}
                </h3>

                {sentRequests.length ===
                0 ? (
                  <EmptyState
                    text={
                      isArabic
                        ? "لا توجد طلبات مرسلة."
                        : "No sent requests."
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {sentRequests.map(
                      (request) => (
                        <div
                          key={request.id}
                          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900"
                        >
                          <UserIdentity
                            username={
                              request.username
                            }
                            profileImage={
                              request.profile_image
                            }
                            getInitial={
                              getInitial
                            }
                            isArabic={
                              isArabic
                            }
                          />

                          <button
                            onClick={() =>
                              handleRequestAction(
                                request.id,
                                "cancel"
                              )
                            }
                            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {isArabic
                              ? "إلغاء الطلب"
                              : "Cancel Request"}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Friends */}
          {activeTab === "friends" && (
            <section>
              <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <h2 className="text-xl font-bold">
                  {isArabic
                    ? "أصدقائي"
                    : "My Friends"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {isArabic
                    ? "الأشخاص الموجودون في قائمة أصدقائك."
                    : "People in your friends list."}
                </p>
              </div>

              {loading ? (
                <EmptyState
                  text={
                    isArabic
                      ? "جاري التحميل..."
                      : "Loading..."
                  }
                />
              ) : friends.length === 0 ? (
                <EmptyState
                  text={
                    isArabic
                      ? "لسه مفيش أصدقاء. ابدئي بالبحث عن مستخدم."
                      : "You don't have any friends yet. Start by searching for a user."
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {friends.map((friend) => (
                    <UserCard
                      key={friend.id}
                      username={
                        friend.username
                      }
                      profileImage={
                        friend.profile_image
                      }
                      getInitial={
                        getInitial
                      }
                      isArabic={
                        isArabic
                      }
                      actions={
                        <>
                          <button
                            onClick={() =>
                              removeFriend(
                                friend.user_id
                              )
                            }
                            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            {isArabic
                              ? "حذف الصديق"
                              : "Remove Friend"}
                          </button>

                          <button
                            onClick={() =>
                              blockUser(
                                friend.user_id
                              )
                            }
                            className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300"
                          >
                            🚫{" "}
                            {isArabic
                              ? "حظر"
                              : "Block"}
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Blocked */}
          {activeTab === "blocked" && (
            <section>
              <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <h2 className="text-xl font-bold">
                  {isArabic
                    ? "المحظورون"
                    : "Blocked Users"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {isArabic
                    ? "المستخدمون الذين قمتِ بحظرهم."
                    : "Users you have blocked."}
                </p>
              </div>

              {blockedUsers.length === 0 ? (
                <EmptyState
                  text={
                    isArabic
                      ? "لا يوجد مستخدمون محظورون."
                      : "No blocked users."
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {blockedUsers.map(
                    (user) => (
                      <UserCard
                        key={user.id}
                        username={
                          user.username
                        }
                        profileImage={
                          user.profile_image
                        }
                        getInitial={
                          getInitial
                        }
                        isArabic={
                          isArabic
                        }
                        actions={
                          <button
                            onClick={() =>
                              unblockUser(
                                user.user_id
                              )
                            }
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            🔓{" "}
                            {isArabic
                              ? "فك الحظر"
                              : "Unblock"}
                          </button>
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* Privacy */}
          {activeTab === "privacy" && (
            <section>
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold">
                    {isArabic
                      ? "إعدادات الخصوصية"
                      : "Privacy Settings"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {isArabic
                      ? "تحكمي في من يستطيع العثور عليك والتواصل معك."
                      : "Control who can find and contact you."}
                  </p>
                </div>

                <div className="space-y-5">
                  <PrivacyOption
                    title={
                      isArabic
                        ? "ظهور الملف الشخصي"
                        : "Profile Visibility"
                    }
                    description={
                      isArabic
                        ? "هل يمكن للمستخدمين العثور عليك من خلال البحث؟"
                        : "Can users find you through search?"
                    }
                    value={
                      privacy.profileVisibility
                    }
                    options={[
                      {
                        value: "public",
                        label: isArabic
                          ? "عام"
                          : "Public",
                      },
                      {
                        value: "hidden",
                        label: isArabic
                          ? "مخفي"
                          : "Hidden",
                      },
                    ]}
                    disabled={
                      privacyLoading
                    }
                    onChange={(value) =>
                      updatePrivacy({
                        profileVisibility:
                          value as
                            | "public"
                            | "hidden",
                      })
                    }
                  />

                  <PrivacyOption
                    title={
                      isArabic
                        ? "طلبات الصداقة"
                        : "Friend Requests"
                    }
                    description={
                      isArabic
                        ? "من يستطيع إرسال طلب صداقة لك؟"
                        : "Who can send you friend requests?"
                    }
                    value={
                      privacy.allowFriendRequests
                    }
                    options={[
                      {
                        value: "everyone",
                        label: isArabic
                          ? "الجميع"
                          : "Everyone",
                      },
                      {
                        value: "friends_only",
                        label: isArabic
                          ? "الأصدقاء فقط"
                          : "Friends Only",
                      },
                      {
                        value: "none",
                        label: isArabic
                          ? "لا أحد"
                          : "No One",
                      },
                    ]}
                    disabled={
                      privacyLoading
                    }
                    onChange={(value) =>
                      updatePrivacy({
                        allowFriendRequests:
                          value as
                            | "everyone"
                            | "friends_only"
                            | "none",
                      })
                    }
                  />

                  <PrivacyOption
                    title={
                      isArabic
                        ? "الرسائل"
                        : "Messages"
                    }
                    description={
                      isArabic
                        ? "من يستطيع مراسلتك؟"
                        : "Who can message you?"
                    }
                    value={
                      privacy.allowMessages
                    }
                    options={[
                      {
                        value: "everyone",
                        label: isArabic
                          ? "الجميع"
                          : "Everyone",
                      },
                      {
                        value: "friends_only",
                        label: isArabic
                          ? "الأصدقاء فقط"
                          : "Friends Only",
                      },
                      {
                        value: "none",
                        label: isArabic
                          ? "لا أحد"
                          : "No One",
                      },
                    ]}
                    disabled={
                      privacyLoading
                    }
                    onChange={(value) =>
                      updatePrivacy({
                        allowMessages:
                          value as
                            | "everyone"
                            | "friends_only"
                            | "none",
                      })
                    }
                  />

                  <PrivacyOption
                    title={
                      isArabic
                        ? "المكالمات"
                        : "Calls"
                    }
                    description={
                      isArabic
                        ? "من يستطيع الاتصال بك؟"
                        : "Who can call you?"
                    }
                    value={
                      privacy.allowCalls
                    }
                    options={[
                      {
                        value: "everyone",
                        label: isArabic
                          ? "الجميع"
                          : "Everyone",
                      },
                      {
                        value: "friends_only",
                        label: isArabic
                          ? "الأصدقاء فقط"
                          : "Friends Only",
                      },
                      {
                        value: "none",
                        label: isArabic
                          ? "لا أحد"
                          : "No One",
                      },
                    ]}
                    disabled={
                      privacyLoading
                    }
                    onChange={(value) =>
                      updatePrivacy({
                        allowCalls:
                          value as
                            | "everyone"
                            | "friends_only"
                            | "none",
                      })
                    }
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-emerald-600 text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function UserIdentity({
  username,
  profileImage,
  getInitial,
  isArabic,
}: {
  username: string;
  profileImage: string | null;
  getInitial: (username: string) => string;
  isArabic: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {profileImage ? (
        <img
          src={profileImage}
          alt={username}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
          {getInitial(username)}
        </div>
      )}

      <div>
        <p className="font-semibold">
          {username}
        </p>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isArabic
            ? "مستخدم في StudyHub"
            : "StudyHub user"}
        </p>
      </div>
    </div>
  );
}

function UserCard({
  username,
  profileImage,
  getInitial,
  isArabic = false,
  actions,
}: {
  username: string;
  profileImage: string | null;
  getInitial: (username: string) => string;
  isArabic?: boolean;
  actions: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
      <UserIdentity
        username={username}
        profileImage={profileImage}
        getInitial={getInitial}
        isArabic={isArabic}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {actions}
      </div>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      <div className="mb-3 text-3xl">
        👥
      </div>

      <p>{text}</p>
    </div>
  );
}

function PrivacyOption({
  title,
  description,
  value,
  options,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <div className="mb-3">
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}