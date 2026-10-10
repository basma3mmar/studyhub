"use client";

import Link from "next/link";
import { useState } from "react";
import {
  languages,
  useLanguage,
} from "./language-provider";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);

  const currentLanguage =
    languages.find((item) => item.code === language) ||
    languages.find((item) => item.code === "en") ||
    languages[0];

  const navTranslations: Record<
    string,
    {
      features: string;
      howItWorks: string;
      about: string;
    }
  > = {
    en: {
      features: "Features",
      howItWorks: "How it works",
      about: "About",
    },
    ar: {
      features: "المميزات",
      howItWorks: "كيف يعمل",
      about: "عن المنصة",
    },
    es: {
      features: "Funciones",
      howItWorks: "Cómo funciona",
      about: "Acerca de",
    },
    fr: {
      features: "Fonctionnalités",
      howItWorks: "Comment ça marche",
      about: "À propos",
    },
    pt: {
      features: "Recursos",
      howItWorks: "Como funciona",
      about: "Sobre",
    },
    it: {
      features: "Funzionalità",
      howItWorks: "Come funziona",
      about: "Chi siamo",
    },
    de: {
      features: "Funktionen",
      howItWorks: "So funktioniert es",
      about: "Über uns",
    },
    zh: {
      features: "功能",
      howItWorks: "工作方式",
      about: "关于我们",
    },
    ja: {
      features: "機能",
      howItWorks: "使い方",
      about: "概要",
    },
    ko: {
      features: "기능",
      howItWorks: "사용 방법",
      about: "소개",
    },
    ru: {
      features: "Возможности",
      howItWorks: "Как это работает",
      about: "О нас",
    },
    tr: {
      features: "Özellikler",
      howItWorks: "Nasıl çalışır",
      about: "Hakkımızda",
    },
    hi: {
      features: "विशेषताएँ",
      howItWorks: "यह कैसे काम करता है",
      about: "हमारे बारे में",
    },
  };

  const navText =
    navTranslations[language] || navTranslations.en;

  const previewTasks: Record<string, string[]> = {
    en: [
      "Study Mathematics - Chapter 4",
      "Finish Programming Assignment",
      "Review Physics Notes",
    ],
    ar: [
      "دراسة الرياضيات - الفصل الرابع",
      "إنهاء واجب البرمجة",
      "مراجعة ملاحظات الفيزياء",
    ],
    es: [
      "Estudiar Matemáticas - Capítulo 4",
      "Terminar la tarea de programación",
      "Revisar apuntes de Física",
    ],
    fr: [
      "Étudier les mathématiques - Chapitre 4",
      "Terminer le devoir de programmation",
      "Réviser les notes de physique",
    ],
    pt: [
      "Estudar Matemática - Capítulo 4",
      "Concluir a atividade de programação",
      "Revisar as anotações de Física",
    ],
    it: [
      "Studiare matematica - Capitolo 4",
      "Terminare l'esercizio di programmazione",
      "Ripassare gli appunti di fisica",
    ],
    de: [
      "Mathematik lernen - Kapitel 4",
      "Programmieraufgabe abschließen",
      "Physiknotizen wiederholen",
    ],
    zh: [
      "学习数学 - 第4章",
      "完成编程作业",
      "复习物理笔记",
    ],
    ja: [
      "数学を勉強する - 第4章",
      "プログラミング課題を終える",
      "物理のノートを復習する",
    ],
    ko: [
      "수학 공부 - 4장",
      "프로그래밍 과제 완료",
      "물리 노트 복습",
    ],
    ru: [
      "Изучить математику — глава 4",
      "Закончить задание по программированию",
      "Повторить конспект по физике",
    ],
    tr: [
      "Matematik Çalış - Bölüm 4",
      "Programlama ödevini tamamla",
      "Fizik notlarını gözden geçir",
    ],
    hi: [
      "गणित पढ़ें - अध्याय 4",
      "प्रोग्रामिंग असाइनमेंट पूरा करें",
      "भौतिकी के नोट्स दोहराएँ",
    ],
  };

  const tasks =
    previewTasks[language] || previewTasks.en;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Study<span className="text-indigo-600">Hub</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#features"
              className="transition hover:text-indigo-600"
            >
              {navText.features}
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-indigo-600"
            >
              {navText.howItWorks}
            </a>

            <a
              href="#about"
              className="transition hover:text-indigo-600"
            >
              {navText.about}
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setLanguageOpen((current) => !current)
                }
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                aria-label={t.common.selectLanguage}
                aria-expanded={languageOpen}
              >
                <span className="text-base">🌐</span>

                <span className="hidden sm:inline">
                  {currentLanguage.nativeName}
                </span>

                <span className="text-xs">▾</span>
              </button>

              {languageOpen && (
                <>
                  <button
                    type="button"
                    aria-label={t.common.selectLanguage}
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() =>
                      setLanguageOpen(false)
                    }
                  />

                  <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <span className="text-base">🌐</span>

                      <span>
                        {t.common.selectLanguage}
                      </span>
                    </div>

                    {languages.map((item) => {
                      const selected =
                        item.code === language;

                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setLanguage(item.code);
                            setLanguageOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            selected
                              ? "bg-indigo-50 font-semibold text-indigo-600"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-lg">
                            {item.flag}
                          </span>

                          <span className="flex-1">
                            {item.nativeName}
                          </span>

                          {selected && (
                            <span className="font-bold text-indigo-600">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Log in */}
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              {t.common.login}
            </Link>

            {/* Get Started */}
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {t.common.getStarted}
            </Link>
          </div>
        </div>
      </nav>

      <div className="h-[81px]" />

      {/* Hero */}
      <section className="px-6 pb-24 pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              {t.landing.badge}
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
              {t.landing.title}
              <br />
              <span className="text-indigo-600">
                {t.landing.titleHighlight}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {t.landing.description}
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                {t.landing.startStudying}
              </Link>

              <a
                href="#features"
                className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t.landing.exploreFeatures}
              </a>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>

              <div className="grid min-h-[360px] grid-cols-1 md:grid-cols-[210px_1fr]">
                <aside className="hidden border-r border-slate-200 bg-slate-50 p-5 md:block">
                  <div className="mb-8 text-lg font-bold">
                    Study
                    <span className="text-indigo-600">
                      Hub
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="rounded-lg bg-indigo-100 px-3 py-2 font-semibold text-indigo-700">
                      {t.nav.dashboard}
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      {t.nav.planner}
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      {t.nav.tasks}
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      {t.nav.notes}
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      {t.nav.pomodoro}
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      {t.nav.groups}
                    </div>
                  </div>
                </aside>

                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-slate-500">
                      {t.dashboard.goodMorning} 👋
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {t.dashboard.readyToStudy}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">
                        {t.dashboard.tasks}
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        8/12
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">
                        {t.dashboard.studyTime}
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        2.5h
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">
                        {t.dashboard.streak}
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        7 days 🔥
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">
                        {t.dashboard.todaysTasks}
                      </h3>

                      <Link
                        href="/tasks"
                        className="text-sm text-indigo-600 transition hover:text-indigo-700"
                      >
                        {t.dashboard.viewAll}
                      </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                      {tasks.map((task, index) => (
                        <div
                          key={task}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`h-5 w-5 rounded border-2 ${
                              index < 2
                                ? "border-indigo-500"
                                : "border-slate-300"
                            }`}
                          />

                          <span className="text-sm text-slate-600">
                            {task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="scroll-mt-24 border-t border-slate-200 bg-white px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              {t.landing.featuresLabel}
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {t.landing.featuresTitle}
            </h2>

            <p className="mt-4 text-slate-600">
              {t.landing.featuresDescription}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon="✓"
              title={t.features.tasks}
              description={t.features.tasksDescription}
            />

            <Feature
              icon="◷"
              title={t.features.pomodoro}
              description={t.features.pomodoroDescription}
            />

            <Feature
              icon="✎"
              title={t.features.notes}
              description={t.features.notesDescription}
            />

            <Feature
              icon="👥"
              title={t.features.groups}
              description={t.features.groupsDescription}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-slate-50 px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t.landing.howItWorks}
            </h2>

            <p className="mt-4 text-slate-600">
              {t.landing.howDescription}
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              title={t.landing.plan}
              description={t.landing.planDescription}
            />

            <Step
              number="02"
              title={t.landing.focus}
              description={t.landing.focusDescription}
            />

            <Step
              number="03"
              title={t.landing.achieve}
              description={t.landing.achieveDescription}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="about"
        className="scroll-mt-24 bg-indigo-600 px-6 py-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            {t.landing.ctaTitle}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
            {t.landing.ctaDescription}
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            {t.common.getStarted}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p>
            © 2026 Study
            <span className="text-indigo-400">
              Hub
            </span>
            . {t.landing.allRights}
          </p>

          <p>{t.landing.footer}</p>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-600">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-5 text-xl font-bold">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}