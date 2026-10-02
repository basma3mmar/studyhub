"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";

type Group = {
  id: number;
  name: string;
  description: string;
  subject: string;
  owner_id: number;
  owner_username: string;
  owner_profile_image: string;
  group_image: string;
  created_at: string;
  is_member: number;
  member_count: number;
  chat_enabled: boolean;
};

type Member = {
  id: number;
  username: string;
  email: string;
  profile_image: string;
  joined_at: string;
};

type GroupMessage = {
  id: number;
  group_id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: string;
};

type GroupNote = {
  id: number;
  group_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  username: string;
};

type GroupMaterial = {
  id: number;
  group_id: number;
  user_id: number;
  title: string;
  description: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  username: string;
};

export default function GroupPage() {
  const params = useParams();
  const id = params.id;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [notes, setNotes] = useState<GroupNote[]>([]);
  const [materials, setMaterials] = useState<GroupMaterial[]>([]);

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  const [sending, setSending] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  const [savingNote, setSavingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] =
    useState<number | null>(null);

  const [deletingMaterialId, setDeletingMaterialId] =
    useState<number | null>(null);

  const [downloadingMaterialId, setDownloadingMaterialId] =
    useState<number | null>(null);

  const [messageText, setMessageText] = useState("");

  const [editingMessageId, setEditingMessageId] =
    useState<number | null>(null);

  const [editText, setEditText] = useState("");

  const [removingMemberId, setRemovingMemberId] =
    useState<number | null>(null);

  const [changingChat, setChangingChat] = useState(false);

  const [editingNoteId, setEditingNoteId] =
    useState<number | null>(null);

  const [showNoteEditor, setShowNoteEditor] =
    useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [showMaterialForm, setShowMaterialForm] =
    useState(false);

  const [materialTitle, setMaterialTitle] =
    useState("");

  const [materialDescription, setMaterialDescription] =
    useState("");

  const [selectedMaterialFile, setSelectedMaterialFile] =
    useState<File | null>(null);

  const [error, setError] = useState("");
  const [chatError, setChatError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [materialsError, setMaterialsError] =
    useState("");

  const [darkMode, setDarkMode] = useState(false);

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  const imageInputRef =
    useRef<HTMLInputElement | null>(null);

  const materialInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDarkMode(
      localStorage.getItem("studyhubDarkMode") === "true"
    );

    function updateDarkMode() {
      setDarkMode(
        localStorage.getItem("studyhubDarkMode") === "true"
      );
    }

    window.addEventListener(
      "studyhub-dark-mode-updated",
      updateDarkMode
    );

    window.addEventListener("storage", updateDarkMode);

    loadGroup();
    loadCurrentUser();

    return () => {
      window.removeEventListener(
        "studyhub-dark-mode-updated",
        updateDarkMode
      );

      window.removeEventListener(
        "storage",
        updateDarkMode
      );
    };
  }, [id]);

  useEffect(() => {
    if (group?.is_member) {
      loadMessages();
      loadNotes();
      loadMaterials();
    }
  }, [group?.is_member]);

  async function loadCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.authenticated && data.user) {
        setCurrentUserId(data.user.id);
      }
    } catch {
      // Ignore.
    }
  }

  async function loadGroup() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/groups/${id}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load group."
        );
      }

      setGroup(data.group);
      setMembers(data.members || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load group."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    try {
      setMessagesLoading(true);
      setChatError("");

      const response = await fetch(
        `/api/groups/${id}/messages`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load messages."
        );
      }

      setMessages(data.messages || []);

      if (typeof data.chatEnabled === "boolean") {
        setGroup((current) =>
          current
            ? {
                ...current,
                chat_enabled: data.chatEnabled,
              }
            : current
        );
      }
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Failed to load messages."
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  async function loadNotes() {
    try {
      setNotesLoading(true);
      setNotesError("");

      const response = await fetch(
        `/api/groups/${id}/notes`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load notes."
        );
      }

      setNotes(data.notes || []);
    } catch (error) {
      setNotesError(
        error instanceof Error
          ? error.message
          : "Failed to load notes."
      );
    } finally {
      setNotesLoading(false);
    }
  }

  async function loadMaterials() {
    try {
      setMaterialsLoading(true);
      setMaterialsError("");

      const response = await fetch(
        `/api/groups/${id}/materials`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load materials."
        );
      }

      setMaterials(data.materials || []);
    } catch (error) {
      setMaterialsError(
        error instanceof Error
          ? error.message
          : "Failed to load materials."
      );
    } finally {
      setMaterialsLoading(false);
    }
  }

  async function handleGroupImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !group) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const image = reader.result;

          if (typeof image !== "string") {
            throw new Error(
              "Failed to read the image."
            );
          }

          const response = await fetch(
            `/api/groups/${id}/settings`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                groupImage: image,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                data.error ||
                "Failed to upload group image."
            );
          }

          setGroup((current) =>
            current
              ? {
                  ...current,
                  group_image:
                    data.groupImage || "",
                }
              : current
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to upload group image."
          );
        } finally {
          setUploadingImage(false);
          event.target.value = "";
        }
      };

      reader.onerror = () => {
        setError("Failed to read the image.");
        setUploadingImage(false);
        event.target.value = "";
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload group image."
      );
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function openMaterialForm() {
    setShowMaterialForm(true);
    setMaterialsError("");

    setTimeout(() => {
      document
        .getElementById("materials-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  function cancelMaterialUpload() {
    setShowMaterialForm(false);
    setMaterialTitle("");
    setMaterialDescription("");
    setSelectedMaterialFile(null);

    if (materialInputRef.current) {
      materialInputRef.current.value = "";
    }
  }

  function handleMaterialFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedMaterialFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMaterialsError(
        "File is too large. Maximum size is 5MB."
      );

      event.target.value = "";
      setSelectedMaterialFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      file.type &&
      !allowedTypes.includes(file.type)
    ) {
      setMaterialsError(
        "This file type is not supported."
      );

      event.target.value = "";
      setSelectedMaterialFile(null);
      return;
    }

    setMaterialsError("");
    setSelectedMaterialFile(file);
  }

  async function uploadMaterial(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (uploadingMaterial) {
      return;
    }

    const title = materialTitle.trim();
    const description = materialDescription.trim();

    if (!title) {
      setMaterialsError(
        "Please enter a material title."
      );
      return;
    }

    if (!selectedMaterialFile) {
      setMaterialsError(
        "Please select a file first."
      );
      return;
    }

    try {
      setUploadingMaterial(true);
      setMaterialsError("");

      const fileData = await readFileAsDataURL(
        selectedMaterialFile
      );

      const response = await fetch(
        `/api/groups/${id}/materials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            fileName: selectedMaterialFile.name,
            fileType: selectedMaterialFile.type,
            fileSize: selectedMaterialFile.size,
            fileData,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to upload material."
        );
      }

      if (data.material) {
        setMaterials((current) => [
          data.material,
          ...current,
        ]);
      } else {
        await loadMaterials();
      }

      cancelMaterialUpload();
    } catch (error) {
      setMaterialsError(
        error instanceof Error
          ? error.message
          : "Failed to upload material."
      );
    } finally {
      setUploadingMaterial(false);
    }
  }

  function readFileAsDataURL(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(
            new Error("Failed to read the file.")
          );
        }
      };

      reader.onerror = () => {
        reject(
          new Error("Failed to read the file.")
        );
      };

      reader.readAsDataURL(file);
    });
  }

  async function downloadMaterial(
    material: GroupMaterial
  ) {
    try {
      setDownloadingMaterialId(material.id);
      setMaterialsError("");

      const response = await fetch(
        `/api/groups/${id}/materials/${material.id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to open material."
        );
      }

      const fileData = data.material?.file_data;

      if (
        typeof fileData !== "string" ||
        !fileData.startsWith("data:")
      ) {
        throw new Error(
          "The file data is unavailable."
        );
      }

      const link = document.createElement("a");

      link.href = fileData;
      link.download =
        data.material.file_name ||
        material.file_name;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMaterialsError(
        error instanceof Error
          ? error.message
          : "Failed to open material."
      );
    } finally {
      setDownloadingMaterialId(null);
    }
  }

  async function deleteMaterial(
    material: GroupMaterial
  ) {
    const confirmed = window.confirm(
      `Delete "${material.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingMaterialId(material.id);
      setMaterialsError("");

      const response = await fetch(
        `/api/groups/${id}/materials/${material.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete material."
        );
      }

      setMaterials((current) =>
        current.filter(
          (item) => item.id !== material.id
        )
      );
    } catch (error) {
      setMaterialsError(
        error instanceof Error
          ? error.message
          : "Failed to delete material."
      );
    } finally {
      setDeletingMaterialId(null);
    }
  }

  function formatFileSize(size: number) {
    if (!size || size <= 0) {
      return "Unknown size";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getMaterialIcon(fileName: string) {
    const extension =
      fileName.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
      return "📕";
    }

    if (
      extension === "doc" ||
      extension === "docx"
    ) {
      return "📘";
    }

    if (
      extension === "ppt" ||
      extension === "pptx"
    ) {
      return "📙";
    }

    if (
      extension === "xls" ||
      extension === "xlsx" ||
      extension === "csv"
    ) {
      return "📗";
    }

    if (
      extension === "png" ||
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "webp"
    ) {
      return "🖼️";
    }

    if (
      extension === "txt" ||
      extension === "md"
    ) {
      return "📄";
    }

    return "📎";
  }

  async function sendMessage(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || sending) {
      return;
    }

    try {
      setSending(true);
      setChatError("");

      const response = await fetch(
        `/api/groups/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to send message."
        );
      }

      setMessages((current) => [
        ...current,
        data.message,
      ]);

      setMessageText("");
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  }

  function startEditing(message: GroupMessage) {
    setEditingMessageId(message.id);
    setEditText(message.message);
    setChatError("");
  }

  function cancelEditing() {
    setEditingMessageId(null);
    setEditText("");
  }

  async function saveEdit(messageId: number) {
    const text = editText.trim();

    if (!text || savingEdit) {
      return;
    }

    try {
      setSavingEdit(true);
      setChatError("");

      const response = await fetch(
        `/api/groups/${id}/messages/${messageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to edit message."
        );
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? data.message
            : item
        )
      );

      cancelEditing();
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Failed to edit message."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteMessage(messageId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setChatError("");

      const response = await fetch(
        `/api/groups/${id}/messages/${messageId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete message."
        );
      }

      setMessages((current) =>
        current.filter(
          (item) => item.id !== messageId
        )
      );

      if (editingMessageId === messageId) {
        cancelEditing();
      }
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Failed to delete message."
      );
    }
  }

  async function removeMember(memberId: number) {
    const member = members.find(
      (item) => item.id === memberId
    );

    if (!member) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${member.username} from this group?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMemberId(memberId);
      setError("");

      const response = await fetch(
        `/api/groups/${id}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to remove member."
        );
      }

      setMembers((current) =>
        current.filter(
          (item) => item.id !== memberId
        )
      );

      setGroup((current) =>
        current
          ? {
              ...current,
              member_count: Math.max(
                0,
                current.member_count - 1
              ),
            }
          : current
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove member."
      );
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function toggleChat() {
    if (!group || changingChat) {
      return;
    }

    try {
      setChangingChat(true);
      setChatError("");

      const newValue = !group.chat_enabled;

      const response = await fetch(
        `/api/groups/${id}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatEnabled: newValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update chat settings."
        );
      }

      setGroup((current) =>
        current
          ? {
              ...current,
              chat_enabled: Boolean(
                data.chatEnabled
              ),
            }
          : current
      );

      if (!newValue) {
        setMessageText("");
      }
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Failed to update chat settings."
      );
    } finally {
      setChangingChat(false);
    }
  }

  function startCreatingNote() {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNotesError("");
    setShowNoteEditor(true);

    setTimeout(() => {
      document
        .getElementById("shared-notes-editor")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  }

  function startEditingNote(note: GroupNote) {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNotesError("");
    setShowNoteEditor(true);

    setTimeout(() => {
      document
        .getElementById("shared-notes-editor")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  }

  function cancelNoteEditing() {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNotesError("");
    setShowNoteEditor(false);
  }

  async function saveNote(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const title = noteTitle.trim();
    const content = noteContent.trim();

    if (!title || savingNote) {
      return;
    }

    try {
      setSavingNote(true);
      setNotesError("");

      const isEditing = editingNoteId !== null;

      const response = await fetch(
        isEditing
          ? `/api/groups/${id}/notes/${editingNoteId}`
          : `/api/groups/${id}/notes`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to save note."
        );
      }

      if (isEditing) {
        setNotes((current) =>
          current.map((note) =>
            note.id === editingNoteId
              ? data.note
              : note
          )
        );
      } else {
        setNotes((current) => [
          data.note,
          ...current,
        ]);
      }

      cancelNoteEditing();
    } catch (error) {
      setNotesError(
        error instanceof Error
          ? error.message
          : "Failed to save note."
      );
    } finally {
      setSavingNote(false);
    }
  }

  async function deleteNote(noteId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingNoteId(noteId);
      setNotesError("");

      const response = await fetch(
        `/api/groups/${id}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete note."
        );
      }

      setNotes((current) =>
        current.filter((note) => note.id !== noteId)
      );

      if (editingNoteId === noteId) {
        cancelNoteEditing();
      }
    } catch (error) {
      setNotesError(
        error instanceof Error
          ? error.message
          : "Failed to delete note."
      );
    } finally {
      setDeletingNoteId(null);
    }
  }

  function formatMessageTime(date: string) {
    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function formatNoteDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <main
        className={`min-h-screen ${
          darkMode
            ? "bg-slate-950 text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <Sidebar />

        <div className="lg:pl-64">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="text-3xl">⏳</div>

              <p
                className={`mt-3 text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Loading group...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !group) {
    return (
      <main
        className={`min-h-screen ${
          darkMode
            ? "bg-slate-950 text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <Sidebar />

        <div className="lg:pl-64">
          <div className="p-6 lg:p-8">
            <Link
              href="/groups"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              ← Back to Study Groups
            </Link>

            <div
              className={`mt-6 rounded-2xl border p-10 text-center ${
                darkMode
                  ? "border-red-900 bg-slate-900"
                  : "border-red-200 bg-white"
              }`}
            >
              <div className="text-4xl">⚠️</div>

              <h1 className="mt-4 text-xl font-bold">
                Group not found
              </h1>

              <p
                className={`mt-2 text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {error ||
                  "This group does not exist."}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isGroupOwner =
    currentUserId === group.owner_id;

  const createdDate = new Date(
    group.created_at
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main
      className={`min-h-screen transition-colors ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Sidebar />

      <div className="lg:pl-64">
        <header
          className={`border-b ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="px-6 py-5 lg:px-8">
            <Link
              href="/groups"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              ← Study Groups
            </Link>

            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isGroupOwner) {
                        imageInputRef.current?.click();
                      }
                    }}
                    disabled={
                      !isGroupOwner || uploadingImage
                    }
                    className={`group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-2xl ${
                      darkMode
                        ? "bg-indigo-950 text-indigo-300"
                        : "bg-indigo-50 text-indigo-600"
                    } ${
                      isGroupOwner
                        ? "cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    {group.group_image ? (
                      <img
                        src={group.group_image}
                        alt={`${group.name} group image`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>👥</span>
                    )}

                    {isGroupOwner && (
                      <span
                        className={`absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white transition ${
                          uploadingImage
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {uploadingImage
                          ? "Uploading..."
                          : "Change"}
                      </span>
                    )}
                  </button>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleGroupImageChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      {group.name}
                    </h1>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        darkMode
                          ? "bg-green-950 text-green-300"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {group.is_member
                        ? "Member"
                        : "Not a member"}
                    </span>
                  </div>

                  {group.subject && (
                    <p className="mt-1 text-sm font-medium text-indigo-600">
                      {group.subject}
                    </p>
                  )}

                  {isGroupOwner && (
                    <p
                      className={`mt-1 text-[11px] ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      Click the image to change it
                    </p>
                  )}
                </div>
              </div>

              {isGroupOwner && (
                <button
                  type="button"
                  onClick={toggleChat}
                  disabled={changingChat}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    group.chat_enabled
                      ? darkMode
                        ? "border-red-900 bg-red-950/40 text-red-300 hover:bg-red-950"
                        : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : darkMode
                        ? "border-green-900 bg-green-950/40 text-green-300 hover:bg-green-950"
                        : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {changingChat
                    ? "Updating..."
                    : group.chat_enabled
                      ? "🔒 Close Chat"
                      : "🔓 Open Chat"}
                </button>
              )}
            </div>

            {error && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  darkMode
                    ? "border-red-900 bg-red-950/30 text-red-300"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {error}
              </div>
            )}
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div
              className={`rounded-2xl border p-6 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="text-lg font-bold">
                About this group
              </h2>

              <p
                className={`mt-4 text-sm leading-7 ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                {group.description ||
                  "This study group is ready for students to learn and study together."}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InfoCard
                  icon="👥"
                  label="Members"
                  value={String(group.member_count)}
                  darkMode={darkMode}
                />

                <InfoCard
                  icon="👑"
                  label="Owner"
                  value={group.owner_username}
                  darkMode={darkMode}
                />

                <InfoCard
                  icon="📅"
                  label="Created"
                  value={createdDate}
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div
              className={`rounded-2xl border ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`border-b p-5 ${
                  darkMode
                    ? "border-slate-800"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">
                      Members
                    </h2>

                    <p
                      className={`mt-1 text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Students in this group.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      darkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {members.length}
                  </span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {members.map((member) => {
                  const isOwner =
                    member.id === group.owner_id;

                  const letter =
                    member.username
                      .charAt(0)
                      .toUpperCase();

                  const canRemove =
                    isGroupOwner && !isOwner;

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 border-b p-4 last:border-b-0 ${
                        darkMode
                          ? "border-slate-800 hover:bg-slate-800"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      {member.profile_image ? (
                        <img
                          src={member.profile_image}
                          alt={`${member.username}'s profile`}
                          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${
                            darkMode
                              ? "bg-indigo-950 text-indigo-300"
                              : "bg-indigo-100 text-indigo-600"
                          }`}
                        >
                          {letter}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {member.username}
                          </p>

                          {isOwner && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                darkMode
                                  ? "bg-yellow-950 text-yellow-300"
                                  : "bg-yellow-50 text-yellow-600"
                              }`}
                            >
                              Owner
                            </span>
                          )}
                        </div>

                        <p
                          className={`truncate text-xs ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          {member.email}
                        </p>
                      </div>

                      {canRemove && (
                        <button
                          type="button"
                          onClick={() =>
                            removeMember(member.id)
                          }
                          disabled={
                            removingMemberId ===
                            member.id
                          }
                          className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                            darkMode
                              ? "text-red-400 hover:bg-red-950/50"
                              : "text-red-500 hover:bg-red-50"
                          }`}
                        >
                          {removingMemberId ===
                          member.id
                            ? "..."
                            : "Remove"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* WORKSPACE */}
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Group Workspace
              </h2>

              <p
                className={`mt-1 text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Everything your study group needs in
                one place.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="#shared-notes"
                className={`rounded-2xl border p-5 transition ${
                  darkMode
                    ? "border-indigo-900 bg-slate-900 hover:border-indigo-700"
                    : "border-indigo-100 bg-white hover:border-indigo-300"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  📝
                </div>

                <h3 className="mt-4 font-bold">
                  Shared Notes
                </h3>

                <p
                  className={`mt-1 text-sm leading-6 ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Create and share notes with your
                  study group.
                </p>

                <p className="mt-3 text-xs font-semibold text-indigo-600">
                  {notes.length}{" "}
                  {notes.length === 1
                    ? "note"
                    : "notes"}{" "}
                  →
                </p>
              </a>

              <button
                type="button"
                onClick={openMaterialForm}
                className={`rounded-2xl border p-5 text-left transition ${
                  darkMode
                    ? "border-slate-800 bg-slate-900 hover:border-indigo-700"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  📚
                </div>

                <h3 className="mt-4 font-bold">
                  Materials
                </h3>

                <p
                  className={`mt-1 text-sm leading-6 ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Share study materials, resources,
                  and useful files.
                </p>

                <p className="mt-3 text-xs font-semibold text-indigo-600">
                  {materials.length}{" "}
                  {materials.length === 1
                    ? "material"
                    : "materials"}{" "}
                  →
                </p>
              </button>

              {/* STUDY SESSIONS */}
              <Link
                href={`/groups/${id}/sessions`}
                className={`block rounded-2xl border p-5 text-left transition ${
                  darkMode
                    ? "border-slate-800 bg-slate-900 hover:border-indigo-700 hover:bg-slate-800"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  📅
                </div>

                <h3 className="mt-4 font-bold">
                  Study Sessions
                </h3>

                <p
                  className={`mt-1 text-sm leading-6 ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Plan and organize study sessions with
                  your group.
                </p>

                <p className="mt-3 text-xs font-semibold text-indigo-600">
                  Manage sessions →
                </p>
              </Link>
            </div>
          </section>

          {/* MATERIALS */}
          <section
            id="materials-section"
            className={`mt-8 overflow-hidden rounded-2xl border ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                darkMode
                  ? "border-slate-800"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  📚
                </div>

                <div>
                  <h2 className="font-bold">
                    Materials
                  </h2>

                  <p
                    className={`mt-0.5 text-xs ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    Study files shared with the group.
                  </p>
                </div>
              </div>

              {group.is_member ? (
                <button
                  type="button"
                  onClick={openMaterialForm}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  + Upload Material
                </button>
              ) : null}
            </div>

            {!group.is_member ? (
              <div className="p-10 text-center">
                <div className="text-3xl">🔒</div>

                <h3 className="mt-3 font-bold">
                  Join the group to view materials
                </h3>

                <p
                  className={`mt-2 text-sm ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Only group members can access
                  shared materials.
                </p>
              </div>
            ) : (
              <>
                {showMaterialForm && (
                  <div
                    className={`border-b p-5 ${
                      darkMode
                        ? "border-slate-800 bg-slate-950/40"
                        : "border-slate-200 bg-slate-50/70"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">
                          Upload Material
                        </h3>

                        <p
                          className={`mt-1 text-xs ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          Upload a study file for your
                          group members.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={cancelMaterialUpload}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          darkMode
                            ? "text-slate-400 hover:bg-slate-800"
                            : "text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>

                    <form
                      onSubmit={uploadMaterial}
                      className="space-y-3"
                    >
                      <input
                        value={materialTitle}
                        onChange={(event) =>
                          setMaterialTitle(
                            event.target.value
                          )
                        }
                        placeholder="Material title..."
                        maxLength={200}
                        className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                          darkMode
                            ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-indigo-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                        }`}
                      />

                      <textarea
                        value={materialDescription}
                        onChange={(event) =>
                          setMaterialDescription(
                            event.target.value
                          )
                        }
                        placeholder="Short description (optional)..."
                        maxLength={1000}
                        rows={3}
                        className={`w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${
                          darkMode
                            ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-indigo-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                        }`}
                      />

                      <div
                        className={`rounded-xl border-2 border-dashed p-5 text-center ${
                          darkMode
                            ? "border-slate-700 bg-slate-900"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="text-3xl">
                          📎
                        </div>

                        <p className="mt-2 text-sm font-semibold">
                          {selectedMaterialFile
                            ? selectedMaterialFile.name
                            : "Choose a file"}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          Maximum size: 5MB
                        </p>

                        <input
                          ref={materialInputRef}
                          type="file"
                          onChange={
                            handleMaterialFileChange
                          }
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            materialInputRef.current?.click()
                          }
                          className={`mt-3 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                            darkMode
                              ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Choose File
                        </button>
                      </div>

                      {materialsError && (
                        <div
                          className={`rounded-xl border px-4 py-3 text-xs ${
                            darkMode
                              ? "border-red-900 bg-red-950/30 text-red-300"
                              : "border-red-200 bg-red-50 text-red-600"
                          }`}
                        >
                          {materialsError}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={
                            uploadingMaterial ||
                            !materialTitle.trim() ||
                            !selectedMaterialFile
                          }
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {uploadingMaterial
                            ? "Uploading..."
                            : "Upload Material"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {!showMaterialForm &&
                  materialsError && (
                    <div
                      className={`border-b px-5 py-3 text-xs ${
                        darkMode
                          ? "border-slate-800 bg-red-950/30 text-red-300"
                          : "border-slate-200 bg-red-50 text-red-600"
                      }`}
                    >
                      {materialsError}
                    </div>
                  )}

                <div className="p-5">
                  {materialsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="text-2xl">
                          ⏳
                        </div>

                        <p
                          className={`mt-2 text-sm ${
                            darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Loading materials...
                        </p>
                      </div>
                    </div>
                  ) : materials.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="text-4xl">
                        📚
                      </div>

                      <h3 className="mt-3 font-bold">
                        No materials yet
                      </h3>

                      <p
                        className={`mt-2 text-sm ${
                          darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        Upload the first study material
                        for your group.
                      </p>

                      <button
                        type="button"
                        onClick={openMaterialForm}
                        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        + Upload First Material
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {materials.map((material) => {
                        const canDelete =
                          material.user_id ===
                            currentUserId ||
                          isGroupOwner;

                        return (
                          <article
                            key={material.id}
                            className={`rounded-2xl border p-5 transition ${
                              darkMode
                                ? "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                                  darkMode
                                    ? "bg-slate-800"
                                    : "bg-slate-50"
                                }`}
                              >
                                {getMaterialIcon(
                                  material.file_name
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="break-words font-bold">
                                  {material.title}
                                </h3>

                                <p
                                  className={`mt-1 break-all text-xs ${
                                    darkMode
                                      ? "text-slate-500"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {material.file_name}
                                </p>
                              </div>
                            </div>

                            {material.description && (
                              <p
                                className={`mt-4 text-sm leading-6 ${
                                  darkMode
                                    ? "text-slate-300"
                                    : "text-slate-600"
                                }`}
                              >
                                {material.description}
                              </p>
                            )}

                            <div
                              className={`mt-4 flex flex-wrap items-center gap-2 text-[10px] ${
                                darkMode
                                  ? "text-slate-500"
                                  : "text-slate-400"
                              }`}
                            >
                              <span className="font-semibold">
                                @{material.username}
                              </span>

                              <span>•</span>

                              <span>
                                {formatFileSize(
                                  material.file_size
                                )}
                              </span>

                              <span>•</span>

                              <span>
                                {formatNoteDate(
                                  material.created_at
                                )}
                              </span>
                            </div>

                            <div
                              className={`mt-5 flex items-center gap-3 border-t pt-3 ${
                                darkMode
                                  ? "border-slate-800"
                                  : "border-slate-100"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  downloadMaterial(
                                    material
                                  )
                                }
                                disabled={
                                  downloadingMaterialId ===
                                  material.id
                                }
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {downloadingMaterialId ===
                                material.id
                                  ? "Opening..."
                                  : "📥 Open / Download"}
                              </button>

                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteMaterial(
                                      material
                                    )
                                  }
                                  disabled={
                                    deletingMaterialId ===
                                    material.id
                                  }
                                  className={`text-xs font-semibold ${
                                    darkMode
                                      ? "text-red-400 hover:text-red-300"
                                      : "text-red-500 hover:text-red-600"
                                  } disabled:opacity-50`}
                                >
                                  {deletingMaterialId ===
                                  material.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* SHARED NOTES */}
          <section
            id="shared-notes"
            className={`mt-8 overflow-hidden rounded-2xl border ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                darkMode
                  ? "border-slate-800"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  📝
                </div>

                <div>
                  <h2 className="font-bold">
                    Shared Notes
                  </h2>

                  <p
                    className={`mt-0.5 text-xs ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    Notes shared with everyone in the
                    group.
                  </p>
                </div>
              </div>

              {group.is_member ? (
                <button
                  type="button"
                  onClick={startCreatingNote}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  + New Note
                </button>
              ) : null}
            </div>

            {!group.is_member ? (
              <div className="p-10 text-center">
                <div className="text-3xl">🔒</div>

                <h3 className="mt-3 font-bold">
                  Join the group to view shared notes
                </h3>

                <p
                  className={`mt-2 text-sm ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Only group members can access shared
                  notes.
                </p>
              </div>
            ) : (
              <>
                {showNoteEditor && (
                  <div
                    id="shared-notes-editor"
                    className={`border-b p-5 ${
                      darkMode
                        ? "border-slate-800 bg-slate-950/40"
                        : "border-slate-200 bg-slate-50/70"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">
                          {editingNoteId !== null
                            ? "Edit Note"
                            : "Create Note"}
                        </h3>

                        <p
                          className={`mt-1 text-xs ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          This note will be visible to
                          all group members.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={cancelNoteEditing}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          darkMode
                            ? "text-slate-400 hover:bg-slate-800"
                            : "text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>

                    <form
                      onSubmit={saveNote}
                      className="space-y-3"
                    >
                      <input
                        value={noteTitle}
                        onChange={(event) =>
                          setNoteTitle(
                            event.target.value
                          )
                        }
                        placeholder="Note title..."
                        maxLength={200}
                        autoFocus
                        className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                          darkMode
                            ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-indigo-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                        }`}
                      />

                      <textarea
                        value={noteContent}
                        onChange={(event) =>
                          setNoteContent(
                            event.target.value
                          )
                        }
                        placeholder="Write your note here..."
                        maxLength={10000}
                        rows={6}
                        className={`w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${
                          darkMode
                            ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-indigo-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                        }`}
                      />

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={`text-[10px] ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          {noteContent.length}/10000
                        </span>

                        <button
                          type="submit"
                          disabled={
                            savingNote ||
                            !noteTitle.trim()
                          }
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingNote
                            ? "Saving..."
                            : editingNoteId !== null
                              ? "Save Changes"
                              : "Create Note"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {notesError && (
                  <div
                    className={`border-b px-5 py-3 text-xs ${
                      darkMode
                        ? "border-slate-800 bg-red-950/30 text-red-300"
                        : "border-slate-200 bg-red-50 text-red-600"
                    }`}
                  >
                    {notesError}
                  </div>
                )}

                <div className="p-5">
                  {notesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="text-2xl">
                          ⏳
                        </div>

                        <p
                          className={`mt-2 text-sm ${
                            darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Loading notes...
                        </p>
                      </div>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="text-4xl">📝</div>

                      <h3 className="mt-3 font-bold">
                        No shared notes yet
                      </h3>

                      <p
                        className={`mt-2 text-sm ${
                          darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        Create the first note for your
                        study group.
                      </p>

                      <button
                        type="button"
                        onClick={startCreatingNote}
                        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        + Create First Note
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {notes.map((note) => {
                        const canEdit =
                          note.user_id ===
                            currentUserId ||
                          isGroupOwner;

                        const canDelete =
                          note.user_id ===
                            currentUserId ||
                          isGroupOwner;

                        return (
                          <article
                            key={note.id}
                            className={`rounded-2xl border p-5 transition ${
                              darkMode
                                ? "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="break-words font-bold">
                                  {note.title}
                                </h3>

                                <div
                                  className={`mt-2 flex flex-wrap items-center gap-2 text-[10px] ${
                                    darkMode
                                      ? "text-slate-500"
                                      : "text-slate-400"
                                  }`}
                                >
                                  <span className="font-semibold">
                                    @{note.username}
                                  </span>

                                  <span>•</span>

                                  <span>
                                    {formatNoteDate(
                                      note.updated_at
                                    )}
                                  </span>
                                </div>
                              </div>

                              <span className="shrink-0 text-xl">
                                📄
                              </span>
                            </div>

                            <div
                              className={`mt-4 whitespace-pre-wrap break-words text-sm leading-7 ${
                                darkMode
                                  ? "text-slate-300"
                                  : "text-slate-600"
                              }`}
                            >
                              {note.content ||
                                "No content added to this note."}
                            </div>

                            {(canEdit ||
                              canDelete) && (
                              <div
                                className={`mt-5 flex items-center gap-3 border-t pt-3 ${
                                  darkMode
                                    ? "border-slate-800"
                                    : "border-slate-100"
                                }`}
                              >
                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditingNote(
                                        note
                                      )
                                    }
                                    className={`text-xs font-semibold ${
                                      darkMode
                                        ? "text-slate-400 hover:text-white"
                                        : "text-slate-500 hover:text-slate-900"
                                    }`}
                                  >
                                    Edit
                                  </button>
                                )}

                                {canDelete && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteNote(
                                        note.id
                                      )
                                    }
                                    disabled={
                                      deletingNoteId ===
                                      note.id
                                    }
                                    className={`text-xs font-semibold ${
                                      darkMode
                                        ? "text-red-400 hover:text-red-300"
                                        : "text-red-500 hover:text-red-600"
                                    } disabled:opacity-50`}
                                  >
                                    {deletingNoteId ===
                                    note.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>
                                )}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* GROUP CHAT */}
          <section
            className={`mt-8 overflow-hidden rounded-2xl border ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${
                darkMode
                  ? "border-slate-800"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  💬
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold">
                      Group Chat
                    </h2>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        group.chat_enabled
                          ? darkMode
                            ? "bg-green-950 text-green-300"
                            : "bg-green-50 text-green-600"
                          : darkMode
                            ? "bg-red-950 text-red-300"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      {group.chat_enabled
                        ? "Open"
                        : "Closed"}
                    </span>
                  </div>

                  <p
                    className={`mt-0.5 text-xs ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    Discuss with your study partners.
                  </p>
                </div>
              </div>

              {isGroupOwner && (
                <button
                  type="button"
                  onClick={toggleChat}
                  disabled={changingChat}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                    group.chat_enabled
                      ? darkMode
                        ? "text-red-400 hover:bg-red-950/40"
                        : "text-red-500 hover:bg-red-50"
                      : darkMode
                        ? "text-green-400 hover:bg-green-950/40"
                        : "text-green-600 hover:bg-green-50"
                  }`}
                >
                  {changingChat
                    ? "..."
                    : group.chat_enabled
                      ? "Close"
                      : "Open"}
                </button>
              )}
            </div>

            {!group.is_member ? (
              <div className="p-8 text-center">
                <div className="text-3xl">🔒</div>

                <h3 className="mt-3 font-bold">
                  Join the group to chat
                </h3>

                <p
                  className={`mt-2 text-sm ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Only group members can access the
                  chat.
                </p>
              </div>
            ) : !group.chat_enabled ? (
              <div
                className={`p-8 text-center ${
                  darkMode
                    ? "bg-slate-950/40"
                    : "bg-slate-50/70"
                }`}
              >
                <div className="text-3xl">🔒</div>

                <h3 className="mt-3 font-bold">
                  Chat is currently closed
                </h3>

                <p
                  className={`mt-2 text-sm ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  The group owner has temporarily
                  disabled new messages.
                </p>

                {messages.length > 0 && (
                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    Previous messages are still
                    available when the chat is reopened.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div
                  className={`h-[280px] overflow-y-auto p-4 ${
                    darkMode
                      ? "bg-slate-950/50"
                      : "bg-slate-50/70"
                  }`}
                >
                  {messagesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl">
                          ⏳
                        </div>

                        <p
                          className={`mt-2 text-sm ${
                            darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Loading messages...
                        </p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl">
                          💬
                        </div>

                        <h3 className="mt-2 font-bold">
                          No messages yet
                        </h3>

                        <p
                          className={`mt-1 text-sm ${
                            darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((item) => {
                        const mine =
                          item.user_id ===
                          currentUserId;

                        const canEdit =
                          mine || isGroupOwner;

                        const canDelete =
                          mine || isGroupOwner;

                        const isEditing =
                          editingMessageId ===
                          item.id;

                        return (
                          <div
                            key={item.id}
                            className={`flex ${
                              mine
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] ${
                                mine
                                  ? "items-end"
                                  : "items-start"
                              } flex flex-col`}
                            >
                              <div
                                className={`mb-1 flex items-center gap-2 px-1 ${
                                  mine
                                    ? "flex-row-reverse"
                                    : "flex-row"
                                }`}
                              >
                                <p
                                  className={`text-xs font-semibold ${
                                    mine
                                      ? darkMode
                                        ? "text-indigo-300"
                                        : "text-indigo-600"
                                      : darkMode
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                  }`}
                                >
                                  {item.username}
                                </p>

                                {item.user_id ===
                                  group.owner_id && (
                                  <span
                                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                                      darkMode
                                        ? "bg-yellow-950 text-yellow-300"
                                        : "bg-yellow-50 text-yellow-600"
                                    }`}
                                  >
                                    Owner
                                  </span>
                                )}
                              </div>

                              {isEditing ? (
                                <div
                                  className={`w-full min-w-[260px] rounded-2xl border p-3 ${
                                    darkMode
                                      ? "border-slate-700 bg-slate-800"
                                      : "border-slate-200 bg-white"
                                  }`}
                                >
                                  <textarea
                                    value={editText}
                                    onChange={(event) =>
                                      setEditText(
                                        event.target.value
                                      )
                                    }
                                    maxLength={2000}
                                    rows={3}
                                    autoFocus
                                    className={`w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none ${
                                      darkMode
                                        ? "border-slate-700 bg-slate-900 text-white"
                                        : "border-slate-200 bg-white text-slate-900"
                                    }`}
                                  />

                                  <div className="mt-2 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={
                                        cancelEditing
                                      }
                                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                        darkMode
                                          ? "text-slate-400 hover:bg-slate-700"
                                          : "text-slate-500 hover:bg-slate-100"
                                      }`}
                                    >
                                      Cancel
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        saveEdit(
                                          item.id
                                        )
                                      }
                                      disabled={
                                        savingEdit ||
                                        !editText.trim()
                                      }
                                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                    >
                                      {savingEdit
                                        ? "Saving..."
                                        : "Save"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`rounded-2xl px-4 py-2.5 ${
                                    mine
                                      ? "rounded-br-md bg-indigo-600 text-white"
                                      : darkMode
                                        ? "rounded-bl-md bg-slate-800 text-slate-200"
                                        : "rounded-bl-md bg-white text-slate-800"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words text-sm">
                                    {item.message}
                                  </p>
                                </div>
                              )}

                              <div
                                className={`mt-1 flex items-center gap-2 px-1 ${
                                  mine
                                    ? "flex-row-reverse"
                                    : "flex-row"
                                }`}
                              >
                                <p
                                  className={`text-[10px] ${
                                    darkMode
                                      ? "text-slate-500"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {formatMessageTime(
                                    item.created_at
                                  )}
                                </p>

                                {!isEditing &&
                                  (canEdit ||
                                    canDelete) && (
                                    <>
                                      {canEdit && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            startEditing(
                                              item
                                            )
                                          }
                                          className={`text-[10px] font-semibold ${
                                            darkMode
                                              ? "text-slate-400 hover:text-white"
                                              : "text-slate-400 hover:text-slate-700"
                                          }`}
                                        >
                                          Edit
                                        </button>
                                      )}

                                      {canDelete && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteMessage(
                                              item.id
                                            )
                                          }
                                          className={`text-[10px] font-semibold ${
                                            darkMode
                                              ? "text-red-400 hover:text-red-300"
                                              : "text-red-500 hover:text-red-600"
                                          }`}
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {chatError && (
                  <div
                    className={`border-t px-5 py-2.5 text-xs ${
                      darkMode
                        ? "border-slate-800 bg-red-950/30 text-red-300"
                        : "border-slate-200 bg-red-50 text-red-600"
                    }`}
                  >
                    {chatError}
                  </div>
                )}

                <form
                  onSubmit={sendMessage}
                  className={`border-t p-3 ${
                    darkMode
                      ? "border-slate-800"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex gap-2">
                    <input
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(
                          event.target.value
                        )
                      }
                      placeholder="Write a message..."
                      maxLength={2000}
                      className={`min-w-0 flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition ${
                        darkMode
                          ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                          : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                      }`}
                    />

                    <button
                      type="submit"
                      disabled={
                        sending ||
                        !messageText.trim()
                      }
                      className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending ? "..." : "Send"}
                    </button>
                  </div>

                  <div
                    className={`mt-1.5 text-right text-[10px] ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    {messageText.length}/2000
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
  darkMode,
}: {
  icon: string;
  label: string;
  value: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        darkMode
          ? "bg-slate-800"
          : "bg-slate-50"
      }`}
    >
      <div className="text-lg">{icon}</div>

      <p
        className={`mt-3 text-xs ${
          darkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold">
        {value}
      </p>
    </div>
  );
}