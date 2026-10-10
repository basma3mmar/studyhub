"use client";

import Link from "next/link";
import { useLanguage } from "../language-provider";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
};

const settingsTranslations = {
  en: {
    back: "Back to Dashboard",
    title: "Settings",
    description:
      "Manage your StudyHub account and preferences.",
    profile: "Profile",
    profileAlt: "Profile",
    changePicture: "Change profile picture",
    activeAccount: "Active account",
    accountInfo: "Account Information",
    username: "Username",
    email: "StudyHub Email",
    preferences: "Preferences",
    notifications: "Notifications",
    notificationsDescription:
      "Manage your study reminders and notifications.",
    appearance: "Appearance",
    appearanceDescription:
      "Choose between light and dark mode.",
    dark: "Dark",
    light: "Light",
    save: "Save Changes",
    saving: "Saving...",
    imageError: "Please select an image file.",
    imageSizeError:
      "Image must be smaller than 2MB.",
    saveProfileError: "Failed to save profile.",
    saveChangesError: "Failed to save changes.",
  },

  ar: {
    back: "العودة إلى لوحة التحكم",
    title: "الإعدادات",
    description:
      "إدارة حسابك وتفضيلاتك في StudyHub.",
    profile: "الملف الشخصي",
    profileAlt: "الملف الشخصي",
    changePicture: "تغيير صورة الملف الشخصي",
    activeAccount: "حساب نشط",
    accountInfo: "معلومات الحساب",
    username: "اسم المستخدم",
    email: "بريد StudyHub الإلكتروني",
    preferences: "التفضيلات",
    notifications: "الإشعارات",
    notificationsDescription:
      "إدارة تذكيرات الدراسة والإشعارات الخاصة بك.",
    appearance: "المظهر",
    appearanceDescription:
      "اختر بين الوضع الفاتح والوضع الداكن.",
    dark: "داكن",
    light: "فاتح",
    save: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    imageError: "يرجى اختيار ملف صورة.",
    imageSizeError:
      "يجب أن يكون حجم الصورة أقل من 2 ميجابايت.",
    saveProfileError: "فشل حفظ الملف الشخصي.",
    saveChangesError: "فشل حفظ التغييرات.",
  },

  es: {
    back: "Volver al panel",
    title: "Configuración",
    description:
      "Administra tu cuenta y preferencias de StudyHub.",
    profile: "Perfil",
    profileAlt: "Perfil",
    changePicture: "Cambiar foto de perfil",
    activeAccount: "Cuenta activa",
    accountInfo: "Información de la cuenta",
    username: "Nombre de usuario",
    email: "Correo de StudyHub",
    preferences: "Preferencias",
    notifications: "Notificaciones",
    notificationsDescription:
      "Administra tus recordatorios de estudio y notificaciones.",
    appearance: "Apariencia",
    appearanceDescription:
      "Elige entre el modo claro y oscuro.",
    dark: "Oscuro",
    light: "Claro",
    save: "Guardar cambios",
    saving: "Guardando...",
    imageError: "Selecciona un archivo de imagen.",
    imageSizeError:
      "La imagen debe ser menor de 2 MB.",
    saveProfileError:
      "No se pudo guardar el perfil.",
    saveChangesError:
      "No se pudieron guardar los cambios.",
  },

  fr: {
    back: "Retour au tableau de bord",
    title: "Paramètres",
    description:
      "Gérez votre compte et vos préférences StudyHub.",
    profile: "Profil",
    profileAlt: "Profil",
    changePicture: "Modifier la photo de profil",
    activeAccount: "Compte actif",
    accountInfo: "Informations du compte",
    username: "Nom d'utilisateur",
    email: "E-mail StudyHub",
    preferences: "Préférences",
    notifications: "Notifications",
    notificationsDescription:
      "Gérez vos rappels d'étude et vos notifications.",
    appearance: "Apparence",
    appearanceDescription:
      "Choisissez entre le mode clair et le mode sombre.",
    dark: "Sombre",
    light: "Clair",
    save: "Enregistrer les modifications",
    saving: "Enregistrement...",
    imageError:
      "Veuillez sélectionner un fichier image.",
    imageSizeError:
      "L'image doit faire moins de 2 Mo.",
    saveProfileError:
      "Impossible d'enregistrer le profil.",
    saveChangesError:
      "Impossible d'enregistrer les modifications.",
  },

  pt: {
    back: "Voltar ao painel",
    title: "Configurações",
    description:
      "Gerencie sua conta e preferências do StudyHub.",
    profile: "Perfil",
    profileAlt: "Perfil",
    changePicture: "Alterar foto de perfil",
    activeAccount: "Conta ativa",
    accountInfo: "Informações da conta",
    username: "Nome de usuário",
    email: "E-mail do StudyHub",
    preferences: "Preferências",
    notifications: "Notificações",
    notificationsDescription:
      "Gerencie seus lembretes de estudo e notificações.",
    appearance: "Aparência",
    appearanceDescription:
      "Escolha entre o modo claro e escuro.",
    dark: "Escuro",
    light: "Claro",
    save: "Salvar alterações",
    saving: "Salvando...",
    imageError:
      "Selecione um arquivo de imagem.",
    imageSizeError:
      "A imagem deve ter menos de 2 MB.",
    saveProfileError:
      "Falha ao salvar o perfil.",
    saveChangesError:
      "Falha ao salvar as alterações.",
  },

  it: {
    back: "Torna alla dashboard",
    title: "Impostazioni",
    description:
      "Gestisci il tuo account e le preferenze di StudyHub.",
    profile: "Profilo",
    profileAlt: "Profilo",
    changePicture: "Cambia foto del profilo",
    activeAccount: "Account attivo",
    accountInfo: "Informazioni account",
    username: "Nome utente",
    email: "E-mail StudyHub",
    preferences: "Preferenze",
    notifications: "Notifiche",
    notificationsDescription:
      "Gestisci i promemoria di studio e le notifiche.",
    appearance: "Aspetto",
    appearanceDescription:
      "Scegli tra modalità chiara e scura.",
    dark: "Scuro",
    light: "Chiaro",
    save: "Salva modifiche",
    saving: "Salvataggio...",
    imageError:
      "Seleziona un file immagine.",
    imageSizeError:
      "L'immagine deve essere inferiore a 2 MB.",
    saveProfileError:
      "Impossibile salvare il profilo.",
    saveChangesError:
      "Impossibile salvare le modifiche.",
  },

  de: {
    back: "Zurück zum Dashboard",
    title: "Einstellungen",
    description:
      "Verwalte dein StudyHub-Konto und deine Einstellungen.",
    profile: "Profil",
    profileAlt: "Profil",
    changePicture: "Profilbild ändern",
    activeAccount: "Aktives Konto",
    accountInfo: "Kontoinformationen",
    username: "Benutzername",
    email: "StudyHub-E-Mail",
    preferences: "Einstellungen",
    notifications: "Benachrichtigungen",
    notificationsDescription:
      "Verwalte deine Lern-Erinnerungen und Benachrichtigungen.",
    appearance: "Darstellung",
    appearanceDescription:
      "Wähle zwischen hellem und dunklem Modus.",
    dark: "Dunkel",
    light: "Hell",
    save: "Änderungen speichern",
    saving: "Speichern...",
    imageError:
      "Bitte wähle eine Bilddatei aus.",
    imageSizeError:
      "Das Bild muss kleiner als 2 MB sein.",
    saveProfileError:
      "Profil konnte nicht gespeichert werden.",
    saveChangesError:
      "Änderungen konnten nicht gespeichert werden.",
  },

  zh: {
    back: "返回仪表板",
    title: "设置",
    description:
      "管理你的 StudyHub 账户和偏好设置。",
    profile: "个人资料",
    profileAlt: "个人资料",
    changePicture: "更改头像",
    activeAccount: "账户已激活",
    accountInfo: "账户信息",
    username: "用户名",
    email: "StudyHub 邮箱",
    preferences: "偏好设置",
    notifications: "通知",
    notificationsDescription:
      "管理你的学习提醒和通知。",
    appearance: "外观",
    appearanceDescription:
      "选择浅色或深色模式。",
    dark: "深色",
    light: "浅色",
    save: "保存更改",
    saving: "正在保存...",
    imageError: "请选择图片文件。",
    imageSizeError:
      "图片大小必须小于 2MB。",
    saveProfileError:
      "保存个人资料失败。",
    saveChangesError:
      "保存更改失败。",
  },

  ja: {
    back: "ダッシュボードに戻る",
    title: "設定",
    description:
      "StudyHub アカウントと設定を管理します。",
    profile: "プロフィール",
    profileAlt: "プロフィール",
    changePicture: "プロフィール画像を変更",
    activeAccount: "有効なアカウント",
    accountInfo: "アカウント情報",
    username: "ユーザー名",
    email: "StudyHub メール",
    preferences: "設定",
    notifications: "通知",
    notificationsDescription:
      "学習リマインダーと通知を管理します。",
    appearance: "外観",
    appearanceDescription:
      "ライトモードとダークモードから選択します。",
    dark: "ダーク",
    light: "ライト",
    save: "変更を保存",
    saving: "保存中...",
    imageError:
      "画像ファイルを選択してください。",
    imageSizeError:
      "画像は2MB未満である必要があります。",
    saveProfileError:
      "プロフィールの保存に失敗しました。",
    saveChangesError:
      "変更の保存に失敗しました。",
  },

  ko: {
    back: "대시보드로 돌아가기",
    title: "설정",
    description:
      "StudyHub 계정 및 환경설정을 관리하세요.",
    profile: "프로필",
    profileAlt: "프로필",
    changePicture: "프로필 사진 변경",
    activeAccount: "활성 계정",
    accountInfo: "계정 정보",
    username: "사용자 이름",
    email: "StudyHub 이메일",
    preferences: "환경설정",
    notifications: "알림",
    notificationsDescription:
      "학습 알림 및 알림 설정을 관리하세요.",
    appearance: "화면 설정",
    appearanceDescription:
      "라이트 모드와 다크 모드 중에서 선택하세요.",
    dark: "다크",
    light: "라이트",
    save: "변경 사항 저장",
    saving: "저장 중...",
    imageError:
      "이미지 파일을 선택해주세요.",
    imageSizeError:
      "이미지는 2MB보다 작아야 합니다.",
    saveProfileError:
      "프로필을 저장하지 못했습니다.",
    saveChangesError:
      "변경 사항을 저장하지 못했습니다.",
  },

  ru: {
    back: "Вернуться на панель",
    title: "Настройки",
    description:
      "Управляйте аккаунтом и настройками StudyHub.",
    profile: "Профиль",
    profileAlt: "Профиль",
    changePicture: "Изменить фото профиля",
    activeAccount: "Активный аккаунт",
    accountInfo: "Информация об аккаунте",
    username: "Имя пользователя",
    email: "Электронная почта StudyHub",
    preferences: "Настройки",
    notifications: "Уведомления",
    notificationsDescription:
      "Управляйте напоминаниями об учебе и уведомлениями.",
    appearance: "Внешний вид",
    appearanceDescription:
      "Выберите светлую или темную тему.",
    dark: "Темная",
    light: "Светлая",
    save: "Сохранить изменения",
    saving: "Сохранение...",
    imageError:
      "Выберите файл изображения.",
    imageSizeError:
      "Размер изображения должен быть меньше 2 МБ.",
    saveProfileError:
      "Не удалось сохранить профиль.",
    saveChangesError:
      "Не удалось сохранить изменения.",
  },

  tr: {
    back: "Kontrol Paneline Dön",
    title: "Ayarlar",
    description:
      "StudyHub hesabınızı ve tercihlerinizi yönetin.",
    profile: "Profil",
    profileAlt: "Profil",
    changePicture: "Profil fotoğrafını değiştir",
    activeAccount: "Aktif hesap",
    accountInfo: "Hesap Bilgileri",
    username: "Kullanıcı adı",
    email: "StudyHub E-postası",
    preferences: "Tercihler",
    notifications: "Bildirimler",
    notificationsDescription:
      "Çalışma hatırlatıcılarınızı ve bildirimlerinizi yönetin.",
    appearance: "Görünüm",
    appearanceDescription:
      "Açık ve koyu mod arasında seçim yapın.",
    dark: "Koyu",
    light: "Açık",
    save: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    imageError:
      "Lütfen bir resim dosyası seçin.",
    imageSizeError:
      "Resim 2 MB'dan küçük olmalıdır.",
    saveProfileError:
      "Profil kaydedilemedi.",
    saveChangesError:
      "Değişiklikler kaydedilemedi.",
  },

  hi: {
    back: "डैशबोर्ड पर वापस जाएँ",
    title: "सेटिंग्स",
    description:
      "अपने StudyHub खाते और प्राथमिकताओं को प्रबंधित करें।",
    profile: "प्रोफ़ाइल",
    profileAlt: "प्रोफ़ाइल",
    changePicture: "प्रोफ़ाइल तस्वीर बदलें",
    activeAccount: "सक्रिय खाता",
    accountInfo: "खाता जानकारी",
    username: "उपयोगकर्ता नाम",
    email: "StudyHub ईमेल",
    preferences: "प्राथमिकताएँ",
    notifications: "सूचनाएँ",
    notificationsDescription:
      "अपने अध्ययन रिमाइंडर और सूचनाएँ प्रबंधित करें।",
    appearance: "दिखावट",
    appearanceDescription:
      "लाइट और डार्क मोड में से चुनें।",
    dark: "डार्क",
    light: "लाइट",
    save: "परिवर्तन सहेजें",
    saving: "सहेजा जा रहा है...",
    imageError:
      "कृपया एक छवि फ़ाइल चुनें।",
    imageSizeError:
      "छवि 2MB से छोटी होनी चाहिए।",
    saveProfileError:
      "प्रोफ़ाइल सहेजने में विफल।",
    saveChangesError:
      "परिवर्तन सहेजने में विफल।",
  },
} as const;

export default function SettingsPage() {
  const { language } = useLanguage();

  const t =
    settingsTranslations[
      language as keyof typeof settingsTranslations
    ] || settingsTranslations.en;

  const isArabic = language === "ar";

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
        const response = await fetch(
          "/api/auth/profile",
          {
            cache: "no-store",
          }
        );

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
      localStorage.getItem(
        "studyhubNotifications"
      );

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
      alert(t.imageError);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(t.imageSizeError);
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
          data.message || t.saveProfileError
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
      setNotifications(pendingNotifications);
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
          : t.saveChangesError
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className={`min-h-screen transition-colors ${
        pendingDarkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      } ${
        isArabic
          ? "lg:pr-64 lg:pl-0"
          : "lg:pl-64 lg:pr-0"
      }`}
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
            {isArabic ? "→" : "←"} {t.back}
          </Link>

          <h1 className="mt-5 text-3xl font-bold">
            {t.title}
          </h1>

          <p
            className={`mt-2 ${
              pendingDarkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {t.description}
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
                  alt={t.profileAlt}
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
                className={`absolute -bottom-1 ${
                  isArabic ? "-left-1" : "-right-1"
                } flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-sm text-white shadow-md transition hover:bg-indigo-700`}
                title={t.changePicture}
                aria-label={t.changePicture}
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
                {t.activeAccount}
              </div>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-4 block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {t.changePicture}
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
            {t.accountInfo}
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.username}
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
                {t.email}
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
            {t.preferences}
          </h2>

          <div className="mt-5 divide-y divide-slate-200/10">

            {/* Notifications */}

            <div className="flex items-center justify-between gap-6 py-5">
              <div>
                <p className="text-sm font-semibold">
                  {t.notifications}
                </p>

                <p
                  className={`mt-1 text-xs ${
                    pendingDarkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {t.notificationsDescription}
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
                aria-label={t.notifications}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    pendingNotifications
                      ? isArabic
                        ? "right-1"
                        : "left-6"
                      : isArabic
                        ? "right-6"
                        : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Appearance */}

            <div className="flex items-center justify-between gap-6 py-5">
              <div>
                <p className="text-sm font-semibold">
                  {t.appearance}
                </p>

                <p
                  className={`mt-1 text-xs ${
                    pendingDarkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {t.appearanceDescription}
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
                  ? t.dark
                  : t.light}
              </button>
            </div>

          </div>
        </section>

        {/* Save */}

        <div
          className={`mt-6 flex pb-8 ${
            isArabic
              ? "justify-start"
              : "justify-end"
          }`}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? t.saving
              : t.save}
          </button>
        </div>

      </div>
    </main>
  );
}