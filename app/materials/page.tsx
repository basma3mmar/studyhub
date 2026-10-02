"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

type Material = {
  id: number;
  name: string;
  subject: string;
  type: "PDF" | "Link" | "Video" | "Document";
  size: string;
  date: string;
};

const initialMaterials: Material[] = [
  {
    id: 1,
    name: "Mathematics Chapter 4",
    subject: "Mathematics",
    type: "PDF",
    size: "2.4 MB",
    date: "Sep 27, 2026",
  },
  {
    id: 2,
    name: "JavaScript Fundamentals",
    subject: "Programming",
    type: "Video",
    size: "1h 25m",
    date: "Sep 26, 2026",
  },
  {
    id: 3,
    name: "Physics Revision Notes",
    subject: "Physics",
    type: "Document",
    size: "856 KB",
    date: "Sep 25, 2026",
  },
  {
    id: 4,
    name: "React Documentation",
    subject: "Programming",
    type: "Link",
    size: "Website",
    date: "Sep 24, 2026",
  },
];

const subjects = [
  "All",
  "Mathematics",
  "Programming",
  "Physics",
  "Chemistry",
  "Biology",
];

export default function MaterialsPage() {
  const [materials, setMaterials] =
    useState<Material[]>(initialMaterials);

  const [selectedSubject, setSelectedSubject] =
    useState("All");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newType, setNewType] =
    useState<Material["type"]>("PDF");
  const [newSize, setNewSize] = useState("");

  const filteredMaterials = materials.filter((material) => {
    const matchesSubject =
      selectedSubject === "All" ||
      material.subject === selectedSubject;

    const query = search.toLowerCase();

    const matchesSearch =
      material.name.toLowerCase().includes(query) ||
      material.subject.toLowerCase().includes(query);

    return matchesSubject && matchesSearch;
  });

  function addMaterial() {
    if (!newName.trim()) {
      return;
    }

    const material: Material = {
      id: Date.now(),
      name: newName.trim(),
      subject: newSubject,
      type: newType,
      size: newSize || "New resource",
      date: "Sep 27, 2026",
    };

    setMaterials((current) => [material, ...current]);

    setNewName("");
    setNewSubject("Mathematics");
    setNewType("PDF");
    setNewSize("");
    setShowModal(false);
  }

  function deleteMaterial(id: number) {
    setMaterials((current) =>
      current.filter((material) => material.id !== id)
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">
                Materials
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Keep all your study resources in one place.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + Add Material
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <MaterialStat
              label="Total Materials"
              value={materials.length.toString()}
              icon="◫"
            />

            <MaterialStat
              label="Subjects"
              value={new Set(
                materials.map((material) => material.subject)
              ).size.toString()}
              icon="▣"
            />

            <MaterialStat
              label="PDFs"
              value={materials
                .filter((material) => material.type === "PDF")
                .length.toString()}
              icon="▤"
            />
          </div>

          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search materials..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    selectedSubject === subject
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
                ◫
              </div>

              <h2 className="mt-5 text-lg font-bold">
                No materials found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Try another search or add a new study resource.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Add Material
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="hidden border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid md:grid-cols-[1fr_160px_120px_120px_40px] md:items-center md:gap-4">
                <span>Material</span>
                <span>Subject</span>
                <span>Type</span>
                <span>Date</span>
                <span />
              </div>

              <div className="divide-y divide-slate-100">
                {filteredMaterials.map((material) => (
                  <MaterialRow
                    key={material.id}
                    material={material}
                    onDelete={() => deleteMaterial(material.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                💡
              </div>

              <div>
                <h3 className="font-bold text-indigo-900">
                  Keep your resources organized
                </h3>

                <p className="mt-1 text-sm leading-6 text-indigo-700">
                  Later, StudyHub can connect this section to real
                  file uploads, cloud storage, and shared study
                  resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold">
                  Add Material
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a study resource to your collection.
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
                  Material name
                </label>

                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Database Systems Notes"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>

                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {subjects
                      .filter((subject) => subject !== "All")
                      .map((subject) => (
                        <option key={subject}>
                          {subject}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Type
                  </label>

                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(
                        e.target.value as Material["type"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>PDF</option>
                    <option>Document</option>
                    <option>Video</option>
                    <option>Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Size / Duration
                </label>

                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="e.g. 2.5 MB or 45 min"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  This is currently a frontend demo. Real file
                  uploading and storage will be connected later when
                  we build the backend.
                </p>
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
                onClick={addMaterial}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialStat({
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

function MaterialRow({
  material,
  onDelete,
}: {
  material: Material;
  onDelete: () => void;
}) {
  const typeStyles = {
    PDF: "bg-red-50 text-red-600",
    Link: "bg-blue-50 text-blue-600",
    Video: "bg-purple-50 text-purple-600",
    Document: "bg-emerald-50 text-emerald-600",
  };

  const typeIcons = {
    PDF: "PDF",
    Link: "↗",
    Video: "▶",
    Document: "DOC",
  };

  return (
    <div className="group px-6 py-5 transition hover:bg-slate-50">
      <div className="grid gap-4 md:grid-cols-[1fr_160px_120px_120px_40px] md:items-center md:gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${typeStyles[material.type]}`}
          >
            {typeIcons[material.type]}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900">
              {material.name}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {material.size}
            </p>
          </div>
        </div>

        <div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {material.subject}
          </span>
        </div>

        <div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[material.type]}`}
          >
            {material.type}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500">
            {material.date}
          </span>
        </div>

        <div>
          <button
            onClick={onDelete}
            className="rounded-lg px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}