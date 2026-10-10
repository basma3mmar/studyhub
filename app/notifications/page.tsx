"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: number;
  created_at: string;
};

const notificationTranslations = {
  en: {
    back: "Back to Dashboard",
    title: "Notifications",
    description:
      "Stay updated with everything happening in your StudyHub.",
    markAll: "Mark all as read",
    total: "Total Notifications",
    unread: "Unread",
    loading: "Loading notifications...",
    tryAgain: "Try Again",
    emptyTitle: "No notifications yet",
    emptyDescription:
      "When something important happens in your StudyHub account, your notifications will appear here.",
    markRead: "Mark as read",
    session: "Session",
    group: "Group",
    note: "Note",
    material: "Material",
    task: "Task",
    notification: "Notification",
    locale: "en-US",
  },

  ar: {
    back: "العودة إلى لوحة التحكم",
    title: "الإشعارات",
    description:
      "ابقَ على اطلاع بكل ما يحدث في حسابك على StudyHub.",
    markAll: "تحديد الكل كمقروء",
    total: "إجمالي الإشعارات",
    unread: "غير مقروء",
    loading: "جاري تحميل الإشعارات...",
    tryAgain: "حاول مرة أخرى",
    emptyTitle: "لا توجد إشعارات بعد",
    emptyDescription:
      "عندما يحدث شيء مهم في حسابك على StudyHub، ستظهر إشعاراتك هنا.",
    markRead: "تحديد كمقروء",
    session: "جلسة",
    group: "مجموعة",
    note: "ملاحظة",
    material: "مادة",
    task: "مهمة",
    notification: "إشعار",
    locale: "ar-EG",
  },

  es: {
    back: "Volver al panel",
    title: "Notificaciones",
    description:
      "Mantente al día con todo lo que sucede en tu StudyHub.",
    markAll: "Marcar todo como leído",
    total: "Notificaciones totales",
    unread: "No leídas",
    loading: "Cargando notificaciones...",
    tryAgain: "Intentar de nuevo",
    emptyTitle: "Aún no hay notificaciones",
    emptyDescription:
      "Cuando ocurra algo importante en tu cuenta de StudyHub, tus notificaciones aparecerán aquí.",
    markRead: "Marcar como leído",
    session: "Sesión",
    group: "Grupo",
    note: "Nota",
    material: "Material",
    task: "Tarea",
    notification: "Notificación",
    locale: "es-ES",
  },

  fr: {
    back: "Retour au tableau de bord",
    title: "Notifications",
    description:
      "Restez informé de tout ce qui se passe sur votre StudyHub.",
    markAll: "Tout marquer comme lu",
    total: "Total des notifications",
    unread: "Non lues",
    loading: "Chargement des notifications...",
    tryAgain: "Réessayer",
    emptyTitle: "Aucune notification",
    emptyDescription:
      "Lorsqu'un événement important se produit sur votre compte StudyHub, vos notifications apparaîtront ici.",
    markRead: "Marquer comme lu",
    session: "Session",
    group: "Groupe",
    note: "Note",
    material: "Matériel",
    task: "Tâche",
    notification: "Notification",
    locale: "fr-FR",
  },

  pt: {
    back: "Voltar ao painel",
    title: "Notificações",
    description:
      "Fique por dentro de tudo o que acontece no seu StudyHub.",
    markAll: "Marcar tudo como lido",
    total: "Total de notificações",
    unread: "Não lidas",
    loading: "Carregando notificações...",
    tryAgain: "Tentar novamente",
    emptyTitle: "Nenhuma notificação ainda",
    emptyDescription:
      "Quando algo importante acontecer na sua conta StudyHub, suas notificações aparecerão aqui.",
    markRead: "Marcar como lida",
    session: "Sessão",
    group: "Grupo",
    note: "Nota",
    material: "Material",
    task: "Tarefa",
    notification: "Notificação",
    locale: "pt-BR",
  },

  it: {
    back: "Torna alla dashboard",
    title: "Notifiche",
    description:
      "Rimani aggiornato su tutto ciò che accade nel tuo StudyHub.",
    markAll: "Segna tutto come letto",
    total: "Notifiche totali",
    unread: "Non lette",
    loading: "Caricamento delle notifiche...",
    tryAgain: "Riprova",
    emptyTitle: "Nessuna notifica",
    emptyDescription:
      "Quando accadrà qualcosa di importante nel tuo account StudyHub, le notifiche appariranno qui.",
    markRead: "Segna come letto",
    session: "Sessione",
    group: "Gruppo",
    note: "Nota",
    material: "Materiale",
    task: "Attività",
    notification: "Notifica",
    locale: "it-IT",
  },

  de: {
    back: "Zurück zum Dashboard",
    title: "Benachrichtigungen",
    description:
      "Bleibe über alles auf dem Laufenden, was in deinem StudyHub passiert.",
    markAll: "Alle als gelesen markieren",
    total: "Benachrichtigungen insgesamt",
    unread: "Ungelesen",
    loading: "Benachrichtigungen werden geladen...",
    tryAgain: "Erneut versuchen",
    emptyTitle: "Noch keine Benachrichtigungen",
    emptyDescription:
      "Wenn etwas Wichtiges in deinem StudyHub-Konto passiert, werden deine Benachrichtigungen hier angezeigt.",
    markRead: "Als gelesen markieren",
    session: "Sitzung",
    group: "Gruppe",
    note: "Notiz",
    material: "Material",
    task: "Aufgabe",
    notification: "Benachrichtigung",
    locale: "de-DE",
  },

  zh: {
    back: "返回仪表板",
    title: "通知",
    description: "及时了解 StudyHub 中发生的一切。",
    markAll: "全部标记为已读",
    total: "通知总数",
    unread: "未读",
    loading: "正在加载通知...",
    tryAgain: "重试",
    emptyTitle: "暂无通知",
    emptyDescription:
      "当你的 StudyHub 账户发生重要事件时，通知会显示在这里。",
    markRead: "标记为已读",
    session: "学习会话",
    group: "小组",
    note: "笔记",
    material: "资料",
    task: "任务",
    notification: "通知",
    locale: "zh-CN",
  },

  ja: {
    back: "ダッシュボードに戻る",
    title: "通知",
    description:
      "StudyHub で起きているすべてのことを確認しましょう。",
    markAll: "すべて既読にする",
    total: "通知総数",
    unread: "未読",
    loading: "通知を読み込んでいます...",
    tryAgain: "もう一度試す",
    emptyTitle: "通知はまだありません",
    emptyDescription:
      "StudyHub アカウントで重要なことが起きると、ここに通知が表示されます。",
    markRead: "既読にする",
    session: "セッション",
    group: "グループ",
    note: "ノート",
    material: "教材",
    task: "タスク",
    notification: "通知",
    locale: "ja-JP",
  },

  ko: {
    back: "대시보드로 돌아가기",
    title: "알림",
    description:
      "StudyHub에서 일어나는 모든 일을 확인하세요.",
    markAll: "모두 읽음으로 표시",
    total: "전체 알림",
    unread: "읽지 않음",
    loading: "알림을 불러오는 중...",
    tryAgain: "다시 시도",
    emptyTitle: "아직 알림이 없습니다",
    emptyDescription:
      "StudyHub 계정에서 중요한 일이 발생하면 알림이 여기에 표시됩니다.",
    markRead: "읽음으로 표시",
    session: "세션",
    group: "그룹",
    note: "노트",
    material: "자료",
    task: "작업",
    notification: "알림",
    locale: "ko-KR",
  },

  ru: {
    back: "Вернуться на панель",
    title: "Уведомления",
    description:
      "Будьте в курсе всего, что происходит в вашем StudyHub.",
    markAll: "Отметить все как прочитанные",
    total: "Всего уведомлений",
    unread: "Непрочитанные",
    loading: "Загрузка уведомлений...",
    tryAgain: "Попробовать снова",
    emptyTitle: "Уведомлений пока нет",
    emptyDescription:
      "Когда в вашем аккаунте StudyHub произойдет что-то важное, уведомления появятся здесь.",
    markRead: "Отметить как прочитанное",
    session: "Сессия",
    group: "Группа",
    note: "Заметка",
    material: "Материал",
    task: "Задача",
    notification: "Уведомление",
    locale: "ru-RU",
  },

  tr: {
    back: "Kontrol Paneline Dön",
    title: "Bildirimler",
    description:
      "StudyHub'da gerçekleşen her şeyden haberdar olun.",
    markAll: "Tümünü okundu olarak işaretle",
    total: "Toplam Bildirim",
    unread: "Okunmamış",
    loading: "Bildirimler yükleniyor...",
    tryAgain: "Tekrar Dene",
    emptyTitle: "Henüz bildirim yok",
    emptyDescription:
      "StudyHub hesabınızda önemli bir şey olduğunda bildirimleriniz burada görünecek.",
    markRead: "Okundu olarak işaretle",
    session: "Oturum",
    group: "Grup",
    note: "Not",
    material: "Materyal",
    task: "Görev",
    notification: "Bildirim",
    locale: "tr-TR",
  },

  hi: {
    back: "डैशबोर्ड पर वापस जाएँ",
    title: "सूचनाएँ",
    description:
      "अपने StudyHub में होने वाली हर गतिविधि से अपडेट रहें।",
    markAll: "सभी को पढ़ा हुआ चिह्नित करें",
    total: "कुल सूचनाएँ",
    unread: "अपठित",
    loading: "सूचनाएँ लोड हो रही हैं...",
    tryAgain: "फिर से प्रयास करें",
    emptyTitle: "अभी कोई सूचना नहीं",
    emptyDescription:
      "जब आपके StudyHub खाते में कुछ महत्वपूर्ण होगा, तो आपकी सूचनाएँ यहाँ दिखाई देंगी।",
    markRead: "पढ़ा हुआ चिह्नित करें",
    session: "सत्र",
    group: "समूह",
    note: "नोट",
    material: "सामग्री",
    task: "कार्य",
    notification: "सूचना",
    locale: "hi-IN",
  },
} as const;

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

function getNotificationTypeLabel(
  type: string,
  t: (typeof notificationTranslations)[keyof typeof notificationTranslations]
) {
  switch (type) {
    case "session":
      return t.session;
    case "group":
      return t.group;
    case "note":
      return t.note;
    case "material":
      return t.material;
    case "task":
      return t.task;
    default:
      return t.notification;
  }
}

function formatDate(
  date: string,
  locale: string
) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const { language } = useLanguage();

  const t =
    notificationTranslations[
      language as keyof typeof notificationTranslations
    ] || notificationTranslations.en;

  const isArabic = language === "ar";

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
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
          data.message || t.loading
        );
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : t.loading
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

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
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

  async function handleNotificationClick(
    notification: Notification
  ) {
    if (notification.is_read === 0) {
      await markAsRead(notification.id);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#faf7f8] text-gray-900 dark:bg-[#0f1117] dark:text-white"
    >
      <Sidebar />

      <main
        className={`min-h-screen px-5 py-8 sm:px-8 ${
          isArabic ? "lg:pr-72 lg:pl-8" : "lg:pl-72 lg:pr-8"
        }`}
      >
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-pink-500 dark:text-gray-400"
              >
                {isArabic ? "→" : "←"} {t.back}
              </Link>

              <h1 className="text-3xl font-bold">
                {t.title}
              </h1>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t.description}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="shrink-0 rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50 dark:border-pink-900/40 dark:bg-[#171a22] dark:text-pink-400 dark:hover:bg-pink-950/20"
              >
                {t.markAll}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#171a22]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.total}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {notifications.length}
              </p>
            </div>

            <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5 shadow-sm dark:border-pink-900/30 dark:bg-pink-950/10">
              <p className="text-sm text-pink-600 dark:text-pink-400">
                {t.unread}
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
                {t.loading}
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
                {t.tryAgain}
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
                  {t.emptyTitle}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                  {t.emptyDescription}
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
                                notification.created_at,
                                t.locale
                              )}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {getNotificationTypeLabel(
                                notification.type,
                                t
                              )}
                            </span>

                            {notification.is_read === 0 && (
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  markAsRead(
                                    notification.id
                                  );
                                }}
                                className="text-xs font-semibold text-pink-600 transition hover:text-pink-700 dark:text-pink-400"
                              >
                                {t.markRead}
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