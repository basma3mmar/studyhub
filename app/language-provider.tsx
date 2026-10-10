"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  translations,
  getTranslations,
} from "./translations";

export type Language =
  | "en"
  | "ar"
  | "es"
  | "fr"
  | "pt"
  | "it"
  | "de"
  | "zh"
  | "ja"
  | "ko"
  | "ru"
  | "tr"
  | "hi";

export const languages: {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
  },
];

type TranslationData = ReturnType<typeof getTranslations>;

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: TranslationData;
};

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

function applyLanguage(language: Language) {
  document.documentElement.lang = language;

  const rtlLanguages: Language[] = ["ar"];

  document.documentElement.dir =
    rtlLanguages.includes(language)
      ? "rtl"
      : "ltr";
}

function applyDarkMode(isDark: boolean) {
  document.documentElement.classList.toggle(
    "dark",
    isDark
  );
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("studyhubLanguage");

    const isValidLanguage = languages.some(
      (item) => item.code === savedLanguage
    );

    if (isValidLanguage) {
      const saved = savedLanguage as Language;

      setLanguageState(saved);
      applyLanguage(saved);
    } else {
      applyLanguage("en");
    }

    const savedDarkMode =
      localStorage.getItem("studyhubDarkMode");

    applyDarkMode(savedDarkMode === "true");

    const handleDarkModeUpdate = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<boolean>;

      if (
        typeof customEvent.detail ===
        "boolean"
      ) {
        applyDarkMode(customEvent.detail);
        return;
      }

      const currentDarkMode =
        localStorage.getItem(
          "studyhubDarkMode"
        ) === "true";

      applyDarkMode(currentDarkMode);
    };

    const handleStorage = (
      event: StorageEvent
    ) => {
      if (
        event.key ===
        "studyhubDarkMode"
      ) {
        applyDarkMode(
          event.newValue === "true"
        );
      }

      if (
        event.key ===
        "studyhubLanguage"
      ) {
        const nextLanguage =
          event.newValue;

        const isValid =
          languages.some(
            (item) =>
              item.code === nextLanguage
          );

        if (isValid) {
          const saved =
            nextLanguage as Language;

          setLanguageState(saved);
          applyLanguage(saved);
        }
      }
    };

    window.addEventListener(
      "studyhub-dark-mode-updated",
      handleDarkModeUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "studyhub-dark-mode-updated",
        handleDarkModeUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  const setLanguage = useCallback(
    (nextLanguage: Language) => {
      localStorage.setItem(
        "studyhubLanguage",
        nextLanguage
      );

      applyLanguage(nextLanguage);
      setLanguageState(nextLanguage);
    },
    []
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(
      language === "en" ? "ar" : "en"
    );
  }, [language, setLanguage]);

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
