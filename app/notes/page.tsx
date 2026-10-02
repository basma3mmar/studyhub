"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

type Note = {
  id: number;
  title: string;
  subject: string;
  content: string;
  date: string;
};

const initialNotes: Note[] = [
  {
    id: 1,
    title: "Mathematics - Chapter 4",
    subject: "Mathematics",
    content:
      "Important formulas and notes about equations, functions, and problem solving.",
    date: "Sep 27, 2026",
  },
  {
    id: 2,
    title: "JavaScript Basics",
    subject: "Programming",
    content:
      "Variables, functions, arrays, objects, loops, and basic DOM concepts.",
    date: "Sep 26, 2026",
  },
  {
    id: 3,
    title: "Physics Revision",
    subject: "Physics",
    content:
      "Review the main laws, definitions, and examples before the upcoming exam.",
    date: "Sep 25, 2026",
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [newContent, setNewContent] = useState("");

  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();

    return (
      note.title.toLowerCase().includes(query) ||
      note.subject.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  function addNote() {
    if (!newTitle.trim() || !newContent.trim()) {
      return;
    }

    const note: Note = {
      id: Date.now(),
      title: newTitle,
      subject: newSubject,
      content: newContent,
      date: "Sep 27, 2026",
    };

    setNotes((current) => [note, ...current]);

    setNewTitle("");
    setNewSubject("General");
    setNewContent("");
    setShowModal(false);
  }

  function deleteNote(id: number) {
    setNotes((current) => current.filter((note) => note.id !== id));

    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">Notes</h1>

              <p className="mt-1 text-sm text-slate-500">
                Keep your study notes organized and easy to find.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + New Note
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search your notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <NoteStat
              label="Total Notes"
              value={notes.length.toString()}
              icon="✎"
            />

            <NoteStat
              label="Subjects"
              value={new Set(notes.map((note) => note.subject)).size.toString()}
              icon="▣"
            />

            <NoteStat
              label="This Week"
              value={notes.length.toString()}
              icon="◷"
            />
          </div>

          {/* Notes */}
          {filteredNotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
                ✎
              </div>

              <h2 className="mt-5 text-lg font-bold">
                No notes found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Try another search or create a new note to start organizing
                your study material.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create Note
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={() => setSelectedNote(note)}
                  onDelete={() => deleteNote(note.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold">
                  Create New Note
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a note for your studies.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Note title
                </label>

                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Biology Chapter 3"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject
                </label>

                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option>General</option>
                  <option>Mathematics</option>
                  <option>Programming</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Biology</option>
                  <option>English</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Content
                </label>

                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your study notes here..."
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={addNote}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {selectedNote.subject}
                </div>

                <h2 className="text-xl font-bold">
                  {selectedNote.title}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Created {selectedNote.date}
                </p>
              </div>

              <button
                onClick={() => setSelectedNote(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {selectedNote.content}
              </p>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedNote(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function NoteCard({
  note,
  onOpen,
  onDelete,
}: {
  note: Note;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            ✎
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900">
              {note.title}
            </h3>

            <p className="mt-1 text-xs text-indigo-600">
              {note.subject}
            </p>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          Delete
        </button>
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
        {note.content}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400">
          {note.date}
        </span>

        <button
          onClick={onOpen}
          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          Open note →
        </button>
      </div>
    </div>
  );
}