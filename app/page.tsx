"use client";

import Link from "next/link";

export default function Home() {
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
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-indigo-600"
            >
              How it works
            </a>

            <a
              href="#about"
              className="transition hover:text-indigo-600"
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Log in */}
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Log in
            </Link>

            {/* Get Started */}
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Space for fixed navbar */}
      <div className="h-[81px]" />

      {/* Hero */}
      <section className="px-6 pb-24 pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              Your smarter way to study
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
              Organize your study.
              <br />
              <span className="text-indigo-600">Achieve more.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              StudyHub brings your tasks, notes, schedule, focus sessions,
              materials, and study groups together in one simple workspace.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              {/* Start Studying */}
              <Link
                href="/register"
                className="rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Start Studying
              </Link>

              {/* Explore Features */}
              <a
                href="#features"
                className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Explore Features
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
                    Study<span className="text-indigo-600">Hub</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="rounded-lg bg-indigo-100 px-3 py-2 font-semibold text-indigo-700">
                      Dashboard
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      Planner
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      Tasks
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      Notes
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      Pomodoro
                    </div>

                    <div className="px-3 py-2 text-slate-500">
                      Study Groups
                    </div>
                  </div>
                </aside>

                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-slate-500">
                      Good morning 👋
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Ready to study?
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">
                        Tasks
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        8/12
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">
                        Study time
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        2.5h
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">
                        Streak
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        7 days 🔥
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">
                        Today's tasks
                      </h3>

                      <Link
                        href="/tasks"
                        className="text-sm text-indigo-600 transition hover:text-indigo-700"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded border-2 border-indigo-500" />

                        <span className="text-sm text-slate-600">
                          Study Mathematics - Chapter 4
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded border-2 border-indigo-500" />

                        <span className="text-sm text-slate-600">
                          Finish Programming Assignment
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded border-2 border-slate-300" />

                        <span className="text-sm text-slate-600">
                          Review Physics Notes
                        </span>
                      </div>
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
              Everything you need
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              One place for your entire study life
            </h2>

            <p className="mt-4 text-slate-600">
              Stop switching between different apps. StudyHub keeps everything
              organized in one workspace.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon="✓"
              title="Tasks"
              description="Organize assignments, deadlines, priorities, and daily goals."
            />

            <Feature
              icon="◷"
              title="Pomodoro"
              description="Stay focused with simple study and break sessions."
            />

            <Feature
              icon="✎"
              title="Notes"
              description="Keep your important study notes organized and easy to find."
            />

            <Feature
              icon="👥"
              title="Study Groups"
              description="Study together, share materials, and collaborate with others."
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
              How StudyHub works
            </h2>

            <p className="mt-4 text-slate-600">
              A simple workflow designed to help you stay consistent.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              title="Plan"
              description="Create your schedule, subjects, tasks, and study goals."
            />

            <Step
              number="02"
              title="Focus"
              description="Use Pomodoro sessions and organized notes to stay focused."
            />

            <Step
              number="03"
              title="Achieve"
              description="Track your progress and study together with your groups."
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
            Ready to make studying easier?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
            Build better study habits, stay organized, and make progress every
            day with StudyHub.
          </p>

          {/* Bottom Get Started */}
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p>
            © 2026 Study<span className="text-indigo-400">Hub</span>. All
            rights reserved.
          </p>

          <p>Built for better studying.</p>
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