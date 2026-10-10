"use client";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Sidebar from "../../components/Sidebar";

import { useLanguage } from "../../language-provider";

import EmojiPicker, {
  EmojiClickData,
  Theme,
} from "emoji-picker-react";

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
  media_url?: string | null;
  media_type?: "image" | "video" | "audio" | null;
  is_pinned?: number | boolean;
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

const translations = {

  en: {

    backToGroups: "← Back to Study Groups",

    studyGroups: "← Study Groups",

    loadingGroup: "Loading group...",

    groupNotFound: "Group not found",

    groupDoesNotExist: "This group does not exist.",

    member: "Member",

    notMember: "Not a member",

    uploading: "Uploading...",

    change: "Change",

    clickImage: "Click the image to change it",

    updating: "Updating...",

    closeChat: "🔒 Close Chat",

    openChat: "🔓 Open Chat",

    aboutGroup: "About this group",

    readyToLearn:

      "This study group is ready for students to learn and study together.",

    members: "Members",

    owner: "Owner",

    created: "Created",

    studentsInGroup: "Students in this group.",

    remove: "Remove",

    groupWorkspace: "Group Workspace",

    workspaceDescription:

      "Everything your study group needs in one place.",

    sharedNotes: "Shared Notes",

    sharedNotesDescription:

      "Create and share notes with your study group.",

    note: "note",

    notes: "notes",

    materials: "Materials",

    materialsDescription:

      "Share study materials, resources, and useful files.",

    material: "material",

    materialsPlural: "materials",

    studySessions: "Study Sessions",

    studySessionsDescription:

      "Plan and organize study sessions with your group.",

    manageSessions: "Manage sessions →",

    studyFiles: "Study files shared with the group.",

    uploadMaterial: "+ Upload Material",

    joinToViewMaterials:

      "Join the group to view materials",

    membersOnlyMaterials:

      "Only group members can access shared materials.",

    uploadMaterialTitle: "Upload Material",

    uploadMaterialDescription:

      "Upload a study file for your group members.",

    cancel: "Cancel",

    materialTitlePlaceholder: "Material title...",

    materialDescriptionPlaceholder:

      "Short description (optional)...",

    chooseFile: "Choose a file",

    maximumSize: "Maximum size: 5MB",

    chooseFileButton: "Choose File",

    uploadingMaterial: "Uploading...",

    uploadMaterialButton: "Upload Material",

    loadingMaterials: "Loading materials...",

    noMaterials: "No materials yet",

    firstMaterial:

      "Upload the first study material for your group.",

    uploadFirstMaterial: "+ Upload First Material",

    opening: "Opening...",

    openDownload: "📥 Open / Download",

    deleting: "Deleting...",

    delete: "Delete",

    newNote: "+ New Note",

    notesForEveryone:

      "Notes shared with everyone in the group.",

    joinToViewNotes:

      "Join the group to view shared notes",

    membersOnlyNotes:

      "Only group members can access shared notes.",

    editNote: "Edit Note",

    createNote: "Create Note",

    noteVisible:

      "This note will be visible to all group members.",

    noteTitlePlaceholder: "Note title...",

    noteContentPlaceholder: "Write your note here...",

    saving: "Saving...",

    saveChanges: "Save Changes",

    loadingNotes: "Loading notes...",

    noSharedNotes: "No shared notes yet",

    firstNote:

      "Create the first note for your study group.",

    createFirstNote: "+ Create First Note",

    noContent: "No content added to this note.",

    groupChat: "Group Chat",

    open: "Open",

    closed: "Closed",

    chatDescription:

      "Discuss with your study partners.",

    close: "Close",

    joinToChat: "Join the group to chat",

    membersOnlyChat:

      "Only group members can access the chat.",

    chatClosed: "Chat is currently closed",

    chatClosedDescription:

      "The group owner has temporarily disabled new messages.",

    previousMessages:

      "Previous messages are still available when the chat is reopened.",

    loadingMessages: "Loading messages...",

    noMessages: "No messages yet",

    startConversation: "Start the conversation!",

    edit: "Edit",

    save: "Save",

    writeMessage: "Write a message...",

    send: "Send",

    unknownSize: "Unknown size",

    deleteMaterialConfirm: 'Delete "{title}"?',

    deleteMessageConfirm:

      "Are you sure you want to delete this message?",

    removeMemberConfirm:

      "Remove {username} from this group?",

    deleteNoteConfirm:

      "Are you sure you want to delete this note?",

    failedLoadGroup: "Failed to load group.",

    failedLoadMessages: "Failed to load messages.",

    failedLoadNotes: "Failed to load notes.",

    failedLoadMaterials: "Failed to load materials.",

    selectImage: "Please select an image file.",

    imageSize: "Image must be smaller than 2MB.",

    readImage: "Failed to read the image.",

    uploadImage: "Failed to upload group image.",

    fileSize: "File is too large. Maximum size is 5MB.",

    unsupportedFile: "This file type is not supported.",

    materialTitleRequired:

      "Please enter a material title.",

    selectFile: "Please select a file first.",

    uploadMaterialFailed: "Failed to upload material.",

    readFile: "Failed to read the file.",

    openMaterialFailed: "Failed to open material.",

    unavailableFile: "The file data is unavailable.",

    deleteMaterialFailed:

      "Failed to delete material.",

    sendMessageFailed: "Failed to send message.",

    editMessageFailed: "Failed to edit message.",

    deleteMessageFailed:

      "Failed to delete message.",

    removeMemberFailed:

      "Failed to remove member.",

    chatSettingsFailed:

      "Failed to update chat settings.",

    saveNoteFailed: "Failed to save note.",

    deleteNoteFailed: "Failed to delete note.",

  },

  ar: {

    backToGroups: "← العودة إلى مجموعات الدراسة",

    studyGroups: "← مجموعات الدراسة",

    loadingGroup: "جارٍ تحميل المجموعة...",

    groupNotFound: "المجموعة غير موجودة",

    groupDoesNotExist: "هذه المجموعة غير موجودة.",

    member: "عضو",

    notMember: "لست عضوًا",

    uploading: "جارٍ الرفع...",

    change: "تغيير",

    clickImage: "اضغط على الصورة لتغييرها",

    updating: "جارٍ التحديث...",

    closeChat: "🔒 إغلاق الدردشة",

    openChat: "🔓 فتح الدردشة",

    aboutGroup: "عن هذه المجموعة",

    readyToLearn:

      "هذه المجموعة جاهزة للطلاب للتعلم والدراسة معًا.",

    members: "الأعضاء",

    owner: "المالك",

    created: "تاريخ الإنشاء",

    studentsInGroup: "الطلاب الموجودون في هذه المجموعة.",

    remove: "إزالة",

    groupWorkspace: "مساحة عمل المجموعة",

    workspaceDescription:

      "كل ما تحتاجه مجموعتك الدراسية في مكان واحد.",

    sharedNotes: "الملاحظات المشتركة",

    sharedNotesDescription:

      "أنشئ وشارك الملاحظات مع مجموعتك الدراسية.",

    note: "ملاحظة",

    notes: "ملاحظات",

    materials: "المواد",

    materialsDescription:

      "شارك المواد الدراسية والمصادر والملفات المفيدة.",

    material: "مادة",

    materialsPlural: "مواد",

    studySessions: "جلسات الدراسة",

    studySessionsDescription:

      "خطط ونظم جلسات الدراسة مع مجموعتك.",

    manageSessions: "إدارة الجلسات ←",

    studyFiles: "الملفات الدراسية التي تمت مشاركتها مع المجموعة.",

    uploadMaterial: "+ رفع مادة",

    joinToViewMaterials:

      "انضم إلى المجموعة لعرض المواد",

    membersOnlyMaterials:

      "يمكن لأعضاء المجموعة فقط الوصول إلى المواد المشتركة.",

    uploadMaterialTitle: "رفع مادة",

    uploadMaterialDescription:

      "ارفع ملفًا دراسيًا لأعضاء مجموعتك.",

    cancel: "إلغاء",

    materialTitlePlaceholder: "عنوان المادة...",

    materialDescriptionPlaceholder:

      "وصف قصير (اختياري)...",

    chooseFile: "اختر ملفًا",

    maximumSize: "الحجم الأقصى: 5 ميجابايت",

    chooseFileButton: "اختيار ملف",

    uploadingMaterial: "جارٍ الرفع...",

    uploadMaterialButton: "رفع المادة",

    loadingMaterials: "جارٍ تحميل المواد...",

    noMaterials: "لا توجد مواد بعد",

    firstMaterial:

      "ارفع أول مادة دراسية لمجموعتك.",

    uploadFirstMaterial: "+ رفع أول مادة",

    opening: "جارٍ الفتح...",

    openDownload: "📥 فتح / تنزيل",

    deleting: "جارٍ الحذف...",

    delete: "حذف",

    newNote: "+ ملاحظة جديدة",

    notesForEveryone:

      "ملاحظات مشتركة مع جميع أعضاء المجموعة.",

    joinToViewNotes:

      "انضم إلى المجموعة لعرض الملاحظات المشتركة",

    membersOnlyNotes:

      "يمكن لأعضاء المجموعة فقط الوصول إلى الملاحظات المشتركة.",

    editNote: "تعديل الملاحظة",

    createNote: "إنشاء ملاحظة",

    noteVisible:

      "ستكون هذه الملاحظة مرئية لجميع أعضاء المجموعة.",

    noteTitlePlaceholder: "عنوان الملاحظة...",

    noteContentPlaceholder: "اكتب ملاحظتك هنا...",

    saving: "جارٍ الحفظ...",

    saveChanges: "حفظ التغييرات",

    loadingNotes: "جارٍ تحميل الملاحظات...",

    noSharedNotes: "لا توجد ملاحظات مشتركة بعد",

    firstNote:

      "أنشئ أول ملاحظة لمجموعتك الدراسية.",

    createFirstNote: "+ إنشاء أول ملاحظة",

    noContent: "لم تتم إضافة محتوى لهذه الملاحظة.",

    groupChat: "دردشة المجموعة",

    open: "مفتوحة",

    closed: "مغلقة",

    chatDescription:

      "ناقش دراستك مع زملائك في المجموعة.",

    close: "إغلاق",

    joinToChat: "انضم إلى المجموعة للدردشة",

    membersOnlyChat:

      "يمكن لأعضاء المجموعة فقط الوصول إلى الدردشة.",

    chatClosed: "الدردشة مغلقة حاليًا",

    chatClosedDescription:

      "قام مالك المجموعة بتعطيل الرسائل الجديدة مؤقتًا.",

    previousMessages:

      "لا تزال الرسائل السابقة متاحة عند إعادة فتح الدردشة.",

    loadingMessages: "جارٍ تحميل الرسائل...",

    noMessages: "لا توجد رسائل بعد",

    startConversation: "ابدأ المحادثة!",

    edit: "تعديل",

    save: "حفظ",

    writeMessage: "اكتب رسالة...",

    send: "إرسال",

    unknownSize: "حجم غير معروف",

    deleteMaterialConfirm: 'حذف "{title}"؟',

    deleteMessageConfirm:

      "هل أنت متأكد أنك تريد حذف هذه الرسالة؟",

    removeMemberConfirm:

      "إزالة {username} من هذه المجموعة؟",

    deleteNoteConfirm:

      "هل أنت متأكد أنك تريد حذف هذه الملاحظة؟",

    failedLoadGroup: "فشل تحميل المجموعة.",

    failedLoadMessages: "فشل تحميل الرسائل.",

    failedLoadNotes: "فشل تحميل الملاحظات.",

    failedLoadMaterials: "فشل تحميل المواد.",

    selectImage: "يرجى اختيار ملف صورة.",

    imageSize: "يجب أن تكون الصورة أصغر من 2 ميجابايت.",

    readImage: "فشل قراءة الصورة.",

    uploadImage: "فشل رفع صورة المجموعة.",

    fileSize: "الملف كبير جدًا. الحد الأقصى 5 ميجابايت.",

    unsupportedFile: "نوع الملف غير مدعوم.",

    materialTitleRequired: "يرجى إدخال عنوان المادة.",

    selectFile: "يرجى اختيار ملف أولًا.",

    uploadMaterialFailed: "فشل رفع المادة.",

    readFile: "فشل قراءة الملف.",

    openMaterialFailed: "فشل فتح المادة.",

    unavailableFile: "بيانات الملف غير متاحة.",

    deleteMaterialFailed: "فشل حذف المادة.",

    sendMessageFailed: "فشل إرسال الرسالة.",

    editMessageFailed: "فشل تعديل الرسالة.",

    deleteMessageFailed: "فشل حذف الرسالة.",

    removeMemberFailed: "فشل إزالة العضو.",

    chatSettingsFailed: "فشل تحديث إعدادات الدردشة.",

    saveNoteFailed: "فشل حفظ الملاحظة.",

    deleteNoteFailed: "فشل حذف الملاحظة.",

  },

  es: {

    backToGroups: "← Volver a grupos de estudio",

    studyGroups: "← Grupos de estudio",

    loadingGroup: "Cargando grupo...",

    groupNotFound: "Grupo no encontrado",

    groupDoesNotExist: "Este grupo no existe.",

    member: "Miembro",

    notMember: "No eres miembro",

    uploading: "Subiendo...",

    change: "Cambiar",

    clickImage: "Haz clic en la imagen para cambiarla",

    updating: "Actualizando...",

    closeChat: "🔒 Cerrar chat",

    openChat: "🔓 Abrir chat",

    aboutGroup: "Sobre este grupo",

    readyToLearn:

      "Este grupo está listo para que los estudiantes aprendan y estudien juntos.",

    members: "Miembros",

    owner: "Propietario",

    created: "Creado",

    studentsInGroup: "Estudiantes en este grupo.",

    remove: "Eliminar",

    groupWorkspace: "Espacio de trabajo del grupo",

    workspaceDescription:

      "Todo lo que tu grupo necesita para estudiar en un solo lugar.",

    sharedNotes: "Notas compartidas",

    sharedNotesDescription:

      "Crea y comparte notas con tu grupo de estudio.",

    note: "nota",

    notes: "notas",

    materials: "Materiales",

    materialsDescription:

      "Comparte materiales, recursos y archivos útiles.",

    material: "material",

    materialsPlural: "materiales",

    studySessions: "Sesiones de estudio",

    studySessionsDescription:

      "Planifica y organiza sesiones de estudio con tu grupo.",

    manageSessions: "Gestionar sesiones →",

    studyFiles: "Archivos de estudio compartidos con el grupo.",

    uploadMaterial: "+ Subir material",

    joinToViewMaterials: "Únete al grupo para ver los materiales",

    membersOnlyMaterials:

      "Solo los miembros del grupo pueden acceder a los materiales.",

    uploadMaterialTitle: "Subir material",

    uploadMaterialDescription:

      "Sube un archivo de estudio para los miembros de tu grupo.",

    cancel: "Cancelar",

    materialTitlePlaceholder: "Título del material...",

    materialDescriptionPlaceholder:

      "Descripción breve (opcional)...",

    chooseFile: "Elegir un archivo",

    maximumSize: "Tamaño máximo: 5 MB",

    chooseFileButton: "Elegir archivo",

    uploadingMaterial: "Subiendo...",

    uploadMaterialButton: "Subir material",

    loadingMaterials: "Cargando materiales...",

    noMaterials: "No hay materiales todavía",

    firstMaterial: "Sube el primer material de estudio para tu grupo.",

    uploadFirstMaterial: "+ Subir primer material",

    opening: "Abriendo...",

    openDownload: "📥 Abrir / Descargar",

    deleting: "Eliminando...",

    delete: "Eliminar",

    newNote: "+ Nueva nota",

    notesForEveryone: "Notas compartidas con todos los miembros.",

    joinToViewNotes: "Únete al grupo para ver las notas compartidas",

    membersOnlyNotes:

      "Solo los miembros del grupo pueden acceder a las notas.",

    editNote: "Editar nota",

    createNote: "Crear nota",

    noteVisible: "Esta nota será visible para todos los miembros.",

    noteTitlePlaceholder: "Título de la nota...",

    noteContentPlaceholder: "Escribe tu nota aquí...",

    saving: "Guardando...",

    saveChanges: "Guardar cambios",

    loadingNotes: "Cargando notas...",

    noSharedNotes: "No hay notas compartidas todavía",

    firstNote: "Crea la primera nota para tu grupo.",

    createFirstNote: "+ Crear primera nota",

    noContent: "No se ha añadido contenido a esta nota.",

    groupChat: "Chat del grupo",

    open: "Abierto",

    closed: "Cerrado",

    chatDescription: "Habla con tus compañeros de estudio.",

    close: "Cerrar",

    joinToChat: "Únete al grupo para chatear",

    membersOnlyChat:

      "Solo los miembros del grupo pueden acceder al chat.",

    chatClosed: "El chat está cerrado actualmente",

    chatClosedDescription:

      "El propietario del grupo ha desactivado temporalmente los mensajes.",

    previousMessages:

      "Los mensajes anteriores estarán disponibles cuando se reabra el chat.",

    loadingMessages: "Cargando mensajes...",

    noMessages: "No hay mensajes todavía",

    startConversation: "¡Inicia la conversación!",

    edit: "Editar",

    save: "Guardar",

    writeMessage: "Escribe un mensaje...",

    send: "Enviar",

    unknownSize: "Tamaño desconocido",

    deleteMaterialConfirm: '¿Eliminar "{title}"?',

    deleteMessageConfirm:

      "¿Seguro que quieres eliminar este mensaje?",

    removeMemberConfirm: "¿Eliminar a {username} del grupo?",

    deleteNoteConfirm: "¿Seguro que quieres eliminar esta nota?",

    failedLoadGroup: "No se pudo cargar el grupo.",

    failedLoadMessages: "No se pudieron cargar los mensajes.",

    failedLoadNotes: "No se pudieron cargar las notas.",

    failedLoadMaterials: "No se pudieron cargar los materiales.",

    selectImage: "Selecciona un archivo de imagen.",

    imageSize: "La imagen debe ser menor de 2 MB.",

    readImage: "No se pudo leer la imagen.",

    uploadImage: "No se pudo subir la imagen del grupo.",

    fileSize: "El archivo es demasiado grande. Máximo 5 MB.",

    unsupportedFile: "Este tipo de archivo no es compatible.",

    materialTitleRequired: "Introduce un título para el material.",

    selectFile: "Selecciona un archivo primero.",

    uploadMaterialFailed: "No se pudo subir el material.",

    readFile: "No se pudo leer el archivo.",

    openMaterialFailed: "No se pudo abrir el material.",

    unavailableFile: "Los datos del archivo no están disponibles.",

    deleteMaterialFailed: "No se pudo eliminar el material.",

    sendMessageFailed: "No se pudo enviar el mensaje.",

    editMessageFailed: "No se pudo editar el mensaje.",

    deleteMessageFailed: "No se pudo eliminar el mensaje.",

    removeMemberFailed: "No se pudo eliminar al miembro.",

    chatSettingsFailed: "No se pudo actualizar el chat.",

    saveNoteFailed: "No se pudo guardar la nota.",

    deleteNoteFailed: "No se pudo eliminar la nota.",

  },

  fr: {

    backToGroups: "← Retour aux groupes d'étude",

    studyGroups: "← Groupes d'étude",

    loadingGroup: "Chargement du groupe...",

    groupNotFound: "Groupe introuvable",

    groupDoesNotExist: "Ce groupe n'existe pas.",

    member: "Membre",

    notMember: "Pas membre",

    uploading: "Téléchargement...",

    change: "Modifier",

    clickImage: "Cliquez sur l'image pour la modifier",

    updating: "Mise à jour...",

    closeChat: "🔒 Fermer le chat",

    openChat: "🔓 Ouvrir le chat",

    aboutGroup: "À propos de ce groupe",

    readyToLearn:

      "Ce groupe est prêt pour apprendre et étudier ensemble.",

    members: "Membres",

    owner: "Propriétaire",

    created: "Créé",

    studentsInGroup: "Étudiants de ce groupe.",

    remove: "Supprimer",

    groupWorkspace: "Espace de travail du groupe",

    workspaceDescription:

      "Tout ce dont votre groupe a besoin pour étudier au même endroit.",

    sharedNotes: "Notes partagées",

    sharedNotesDescription:

      "Créez et partagez des notes avec votre groupe.",

    note: "note",

    notes: "notes",

    materials: "Ressources",

    materialsDescription:

      "Partagez des ressources, documents et fichiers utiles.",

    material: "ressource",

    materialsPlural: "ressources",

    studySessions: "Sessions d'étude",

    studySessionsDescription:

      "Planifiez et organisez des sessions d'étude avec votre groupe.",

    manageSessions: "Gérer les sessions →",

    studyFiles: "Fichiers d'étude partagés avec le groupe.",

    uploadMaterial: "+ Ajouter une ressource",

    joinToViewMaterials: "Rejoignez le groupe pour voir les ressources",

    membersOnlyMaterials:

      "Seuls les membres du groupe peuvent accéder aux ressources.",

    uploadMaterialTitle: "Ajouter une ressource",

    uploadMaterialDescription:

      "Ajoutez un fichier d'étude pour les membres du groupe.",

    cancel: "Annuler",

    materialTitlePlaceholder: "Titre de la ressource...",

    materialDescriptionPlaceholder:

      "Description courte (facultatif)...",

    chooseFile: "Choisir un fichier",

    maximumSize: "Taille maximale : 5 Mo",

    chooseFileButton: "Choisir un fichier",

    uploadingMaterial: "Téléchargement...",

    uploadMaterialButton: "Ajouter",

    loadingMaterials: "Chargement des ressources...",

    noMaterials: "Aucune ressource",

    firstMaterial: "Ajoutez la première ressource du groupe.",

    uploadFirstMaterial: "+ Ajouter la première ressource",

    opening: "Ouverture...",

    openDownload: "📥 Ouvrir / Télécharger",

    deleting: "Suppression...",

    delete: "Supprimer",

    newNote: "+ Nouvelle note",

    notesForEveryone: "Notes partagées avec tous les membres.",

    joinToViewNotes: "Rejoignez le groupe pour voir les notes",

    membersOnlyNotes:

      "Seuls les membres peuvent accéder aux notes.",

    editNote: "Modifier la note",

    createNote: "Créer une note",

    noteVisible: "Cette note sera visible par tous les membres.",

    noteTitlePlaceholder: "Titre de la note...",

    noteContentPlaceholder: "Écrivez votre note ici...",

    saving: "Enregistrement...",

    saveChanges: "Enregistrer",

    loadingNotes: "Chargement des notes...",

    noSharedNotes: "Aucune note partagée",

    firstNote: "Créez la première note du groupe.",

    createFirstNote: "+ Créer la première note",

    noContent: "Aucun contenu ajouté à cette note.",

    groupChat: "Chat du groupe",

    open: "Ouvert",

    closed: "Fermé",

    chatDescription: "Discutez avec vos partenaires d'étude.",

    close: "Fermer",

    joinToChat: "Rejoignez le groupe pour discuter",

    membersOnlyChat:

      "Seuls les membres peuvent accéder au chat.",

    chatClosed: "Le chat est actuellement fermé",

    chatClosedDescription:

      "Le propriétaire a temporairement désactivé les nouveaux messages.",

    previousMessages:

      "Les anciens messages seront disponibles lorsque le chat sera rouvert.",

    loadingMessages: "Chargement des messages...",

    noMessages: "Aucun message",

    startConversation: "Commencez la conversation !",

    edit: "Modifier",

    save: "Enregistrer",

    writeMessage: "Écrivez un message...",

    send: "Envoyer",

    unknownSize: "Taille inconnue",

    deleteMaterialConfirm: 'Supprimer "{title}" ?',

    deleteMessageConfirm:

      "Voulez-vous vraiment supprimer ce message ?",

    removeMemberConfirm:

      "Supprimer {username} du groupe ?",

    deleteNoteConfirm:

      "Voulez-vous vraiment supprimer cette note ?",

    failedLoadGroup: "Impossible de charger le groupe.",

    failedLoadMessages: "Impossible de charger les messages.",

    failedLoadNotes: "Impossible de charger les notes.",

    failedLoadMaterials: "Impossible de charger les ressources.",

    selectImage: "Sélectionnez une image.",

    imageSize: "L'image doit faire moins de 2 Mo.",

    readImage: "Impossible de lire l'image.",

    uploadImage: "Impossible de télécharger l'image.",

    fileSize: "Fichier trop volumineux. Maximum 5 Mo.",

    unsupportedFile: "Ce type de fichier n'est pas pris en charge.",

    materialTitleRequired: "Entrez un titre.",

    selectFile: "Sélectionnez d'abord un fichier.",

    uploadMaterialFailed: "Impossible d'ajouter la ressource.",

    readFile: "Impossible de lire le fichier.",

    openMaterialFailed: "Impossible d'ouvrir la ressource.",

    unavailableFile: "Les données du fichier sont indisponibles.",

    deleteMaterialFailed: "Impossible de supprimer la ressource.",

    sendMessageFailed: "Impossible d'envoyer le message.",

    editMessageFailed: "Impossible de modifier le message.",

    deleteMessageFailed: "Impossible de supprimer le message.",

    removeMemberFailed: "Impossible de supprimer le membre.",

    chatSettingsFailed: "Impossible de mettre à jour le chat.",

    saveNoteFailed: "Impossible d'enregistrer la note.",

    deleteNoteFailed: "Impossible de supprimer la note.",

  },

  pt: {

    backToGroups: "← Voltar para grupos de estudo",

    studyGroups: "← Grupos de estudo",

    loadingGroup: "Carregando grupo...",

    groupNotFound: "Grupo não encontrado",

    groupDoesNotExist: "Este grupo não existe.",

    member: "Membro",

    notMember: "Não é membro",

    uploading: "Enviando...",

    change: "Alterar",

    clickImage: "Clique na imagem para alterá-la",

    updating: "Atualizando...",

    closeChat: "🔒 Fechar chat",

    openChat: "🔓 Abrir chat",

    aboutGroup: "Sobre este grupo",

    readyToLearn:

      "Este grupo está pronto para os alunos aprenderem e estudarem juntos.",

    members: "Membros",

    owner: "Proprietário",

    created: "Criado",

    studentsInGroup: "Estudantes deste grupo.",

    remove: "Remover",

    groupWorkspace: "Espaço de trabalho do grupo",

    workspaceDescription:

      "Tudo que seu grupo precisa para estudar em um só lugar.",

    sharedNotes: "Notas compartilhadas",

    sharedNotesDescription:

      "Crie e compartilhe notas com seu grupo de estudo.",

    note: "nota",

    notes: "notas",

    materials: "Materiais",

    materialsDescription:

      "Compartilhe materiais, recursos e arquivos úteis.",

    material: "material",

    materialsPlural: "materiais",

    studySessions: "Sessões de estudo",

    studySessionsDescription:

      "Planeje e organize sessões de estudo com seu grupo.",

    manageSessions: "Gerenciar sessões →",

    studyFiles: "Arquivos de estudo compartilhados com o grupo.",

    uploadMaterial: "+ Enviar material",

    joinToViewMaterials: "Entre no grupo para ver os materiais",

    membersOnlyMaterials:

      "Somente membros do grupo podem acessar os materiais.",

    uploadMaterialTitle: "Enviar material",

    uploadMaterialDescription:

      "Envie um arquivo de estudo para os membros do grupo.",

    cancel: "Cancelar",

    materialTitlePlaceholder: "Título do material...",

    materialDescriptionPlaceholder:

      "Descrição curta (opcional)...",

    chooseFile: "Escolher arquivo",

    maximumSize: "Tamanho máximo: 5 MB",

    chooseFileButton: "Escolher arquivo",

    uploadingMaterial: "Enviando...",

    uploadMaterialButton: "Enviar material",

    loadingMaterials: "Carregando materiais...",

    noMaterials: "Nenhum material ainda",

    firstMaterial: "Envie o primeiro material de estudo para seu grupo.",

    uploadFirstMaterial: "+ Enviar primeiro material",

    opening: "Abrindo...",

    openDownload: "📥 Abrir / Baixar",

    deleting: "Excluindo...",

    delete: "Excluir",

    newNote: "+ Nova nota",

    notesForEveryone: "Notas compartilhadas com todos os membros.",

    joinToViewNotes: "Entre no grupo para ver as notas compartilhadas",

    membersOnlyNotes:

      "Somente membros do grupo podem acessar as notas.",

    editNote: "Editar nota",

    createNote: "Criar nota",

    noteVisible: "Esta nota ficará visível para todos os membros.",

    noteTitlePlaceholder: "Título da nota...",

    noteContentPlaceholder: "Escreva sua nota aqui...",

    saving: "Salvando...",

    saveChanges: "Salvar alterações",

    loadingNotes: "Carregando notas...",

    noSharedNotes: "Nenhuma nota compartilhada ainda",

    firstNote: "Crie a primeira nota para seu grupo.",

    createFirstNote: "+ Criar primeira nota",

    noContent: "Nenhum conteúdo foi adicionado a esta nota.",

    groupChat: "Chat do grupo",

    open: "Aberto",

    closed: "Fechado",

    chatDescription: "Converse com seus parceiros de estudo.",

    close: "Fechar",

    joinToChat: "Entre no grupo para conversar",

    membersOnlyChat:

      "Somente membros do grupo podem acessar o chat.",

    chatClosed: "O chat está fechado no momento",

    chatClosedDescription:

      "O proprietário do grupo desativou temporariamente novas mensagens.",

    previousMessages:

      "As mensagens anteriores estarão disponíveis quando o chat for reaberto.",

    loadingMessages: "Carregando mensagens...",

    noMessages: "Nenhuma mensagem ainda",

    startConversation: "Comece a conversa!",

    edit: "Editar",

    save: "Salvar",

    writeMessage: "Escreva uma mensagem...",

    send: "Enviar",

    unknownSize: "Tamanho desconhecido",

    deleteMaterialConfirm: 'Excluir "{title}"?',

    deleteMessageConfirm:

      "Tem certeza de que deseja excluir esta mensagem?",

    removeMemberConfirm:

      "Remover {username} deste grupo?",

    deleteNoteConfirm:

      "Tem certeza de que deseja excluir esta nota?",

    failedLoadGroup: "Falha ao carregar o grupo.",

    failedLoadMessages: "Falha ao carregar as mensagens.",

    failedLoadNotes: "Falha ao carregar as notas.",

    failedLoadMaterials: "Falha ao carregar os materiais.",

    selectImage: "Selecione um arquivo de imagem.",

    imageSize: "A imagem deve ter menos de 2 MB.",

    readImage: "Falha ao ler a imagem.",

    uploadImage: "Falha ao enviar a imagem do grupo.",

    fileSize: "O arquivo é muito grande. Máximo de 5 MB.",

    unsupportedFile: "Este tipo de arquivo não é compatível.",

    materialTitleRequired: "Digite um título para o material.",

    selectFile: "Selecione um arquivo primeiro.",

    uploadMaterialFailed: "Falha ao enviar o material.",

    readFile: "Falha ao ler o arquivo.",

    openMaterialFailed: "Falha ao abrir o material.",

    unavailableFile: "Os dados do arquivo não estão disponíveis.",

    deleteMaterialFailed: "Falha ao excluir o material.",

    sendMessageFailed: "Falha ao enviar a mensagem.",

    editMessageFailed: "Falha ao editar a mensagem.",

    deleteMessageFailed: "Falha ao excluir a mensagem.",

    removeMemberFailed: "Falha ao remover o membro.",

    chatSettingsFailed: "Falha ao atualizar o chat.",

    saveNoteFailed: "Falha ao salvar a nota.",

    deleteNoteFailed: "Falha ao excluir a nota.",

  },

  it: {

    backToGroups: "← Torna ai gruppi di studio",

    studyGroups: "← Gruppi di studio",

    loadingGroup: "Caricamento gruppo...",

    groupNotFound: "Gruppo non trovato",

    groupDoesNotExist: "Questo gruppo non esiste.",

    member: "Membro",

    notMember: "Non membro",

    uploading: "Caricamento...",

    change: "Cambia",

    clickImage: "Clicca sull'immagine per cambiarla",

    updating: "Aggiornamento...",

    closeChat: "🔒 Chiudi chat",

    openChat: "🔓 Apri chat",

    aboutGroup: "Informazioni sul gruppo",

    readyToLearn:

      "Questo gruppo è pronto per studiare e imparare insieme.",

    members: "Membri",

    owner: "Proprietario",

    created: "Creato",

    studentsInGroup: "Studenti in questo gruppo.",

    remove: "Rimuovi",

    groupWorkspace: "Spazio di lavoro del gruppo",

    workspaceDescription:

      "Tutto ciò che serve al tuo gruppo per studiare in un unico posto.",

    sharedNotes: "Note condivise",

    sharedNotesDescription:

      "Crea e condividi note con il tuo gruppo.",

    note: "nota",

    notes: "note",

    materials: "Materiali",

    materialsDescription:

      "Condividi materiali, risorse e file utili.",

    material: "materiale",

    materialsPlural: "materiali",

    studySessions: "Sessioni di studio",

    studySessionsDescription:

      "Pianifica e organizza sessioni di studio con il gruppo.",

    manageSessions: "Gestisci sessioni →",

    studyFiles: "File di studio condivisi con il gruppo.",

    uploadMaterial: "+ Carica materiale",

    joinToViewMaterials: "Unisciti al gruppo per vedere i materiali",

    membersOnlyMaterials:

      "Solo i membri del gruppo possono accedere ai materiali.",

    uploadMaterialTitle: "Carica materiale",

    uploadMaterialDescription:

      "Carica un file di studio per i membri del gruppo.",

    cancel: "Annulla",

    materialTitlePlaceholder: "Titolo del materiale...",

    materialDescriptionPlaceholder:

      "Breve descrizione (facoltativa)...",

    chooseFile: "Scegli un file",

    maximumSize: "Dimensione massima: 5 MB",

    chooseFileButton: "Scegli file",

    uploadingMaterial: "Caricamento...",

    uploadMaterialButton: "Carica materiale",

    loadingMaterials: "Caricamento materiali...",

    noMaterials: "Nessun materiale",

    firstMaterial: "Carica il primo materiale di studio.",

    uploadFirstMaterial: "+ Carica il primo materiale",

    opening: "Apertura...",

    openDownload: "📥 Apri / Scarica",

    deleting: "Eliminazione...",

    delete: "Elimina",

    newNote: "+ Nuova nota",

    notesForEveryone: "Note condivise con tutti i membri.",

    joinToViewNotes: "Unisciti al gruppo per vedere le note condivise",

    membersOnlyNotes:

      "Solo i membri possono accedere alle note.",

    editNote: "Modifica nota",

    createNote: "Crea nota",

    noteVisible: "Questa nota sarà visibile a tutti i membri.",

    noteTitlePlaceholder: "Titolo della nota...",

    noteContentPlaceholder: "Scrivi qui la tua nota...",

    saving: "Salvataggio...",

    saveChanges: "Salva modifiche",

    loadingNotes: "Caricamento note...",

    noSharedNotes: "Nessuna nota condivisa",

    firstNote: "Crea la prima nota per il gruppo.",

    createFirstNote: "+ Crea prima nota",

    noContent: "Nessun contenuto aggiunto a questa nota.",

    groupChat: "Chat del gruppo",

    open: "Aperta",

    closed: "Chiusa",

    chatDescription: "Parla con i tuoi compagni di studio.",

    close: "Chiudi",

    joinToChat: "Unisciti al gruppo per chattare",

    membersOnlyChat:

      "Solo i membri possono accedere alla chat.",

    chatClosed: "La chat è attualmente chiusa",

    chatClosedDescription:

      "Il proprietario ha temporaneamente disabilitato i nuovi messaggi.",

    previousMessages:

      "I messaggi precedenti saranno disponibili quando la chat verrà riaperta.",

    loadingMessages: "Caricamento messaggi...",

    noMessages: "Nessun messaggio",

    startConversation: "Inizia la conversazione!",

    edit: "Modifica",

    save: "Salva",

    writeMessage: "Scrivi un messaggio...",

    send: "Invia",

    unknownSize: "Dimensione sconosciuta",

    deleteMaterialConfirm: 'Eliminare "{title}"?',

    deleteMessageConfirm:

      "Sei sicuro di voler eliminare questo messaggio?",

    removeMemberConfirm:

      "Rimuovere {username} dal gruppo?",

    deleteNoteConfirm:

      "Sei sicuro di voler eliminare questa nota?",

    failedLoadGroup: "Impossibile caricare il gruppo.",

    failedLoadMessages: "Impossibile caricare i messaggi.",

    failedLoadNotes: "Impossibile caricare le note.",

    failedLoadMaterials: "Impossibile caricare i materiali.",

    selectImage: "Seleziona un'immagine.",

    imageSize: "L'immagine deve essere inferiore a 2 MB.",

    readImage: "Impossibile leggere l'immagine.",

    uploadImage: "Impossibile caricare l'immagine.",

    fileSize: "File troppo grande. Massimo 5 MB.",

    unsupportedFile: "Questo tipo di file non è supportato.",

    materialTitleRequired: "Inserisci un titolo.",

    selectFile: "Seleziona prima un file.",

    uploadMaterialFailed: "Impossibile caricare il materiale.",

    readFile: "Impossibile leggere il file.",

    openMaterialFailed: "Impossibile aprire il materiale.",

    unavailableFile: "I dati del file non sono disponibili.",

    deleteMaterialFailed: "Impossibile eliminare il materiale.",

    sendMessageFailed: "Impossibile inviare il messaggio.",

    editMessageFailed: "Impossibile modificare il messaggio.",

    deleteMessageFailed: "Impossibile eliminare il messaggio.",

    removeMemberFailed: "Impossibile rimuovere il membro.",

    chatSettingsFailed: "Impossibile aggiornare la chat.",

    saveNoteFailed: "Impossibile salvare la nota.",

    deleteNoteFailed: "Impossibile eliminare la nota.",

  },

  de: {

    backToGroups: "← Zurück zu Lerngruppen",

    studyGroups: "← Lerngruppen",

    loadingGroup: "Gruppe wird geladen...",

    groupNotFound: "Gruppe nicht gefunden",

    groupDoesNotExist: "Diese Gruppe existiert nicht.",

    member: "Mitglied",

    notMember: "Kein Mitglied",

    uploading: "Wird hochgeladen...",

    change: "Ändern",

    clickImage: "Klicke auf das Bild, um es zu ändern",

    updating: "Wird aktualisiert...",

    closeChat: "🔒 Chat schließen",

    openChat: "🔓 Chat öffnen",

    aboutGroup: "Über diese Gruppe",

    readyToLearn:

      "Diese Lerngruppe ist bereit, gemeinsam zu lernen.",

    members: "Mitglieder",

    owner: "Besitzer",

    created: "Erstellt",

    studentsInGroup: "Studierende in dieser Gruppe.",

    remove: "Entfernen",

    groupWorkspace: "Gruppenarbeitsbereich",

    workspaceDescription:

      "Alles, was deine Lerngruppe braucht, an einem Ort.",

    sharedNotes: "Geteilte Notizen",

    sharedNotesDescription:

      "Erstelle und teile Notizen mit deiner Lerngruppe.",

    note: "Notiz",

    notes: "Notizen",

    materials: "Materialien",

    materialsDescription:

      "Teile Lernmaterialien, Ressourcen und nützliche Dateien.",

    material: "Material",

    materialsPlural: "Materialien",

    studySessions: "Lernsitzungen",

    studySessionsDescription:

      "Plane und organisiere Lernsitzungen mit deiner Gruppe.",

    manageSessions: "Sitzungen verwalten →",

    studyFiles: "Mit der Gruppe geteilte Lerndateien.",

    uploadMaterial: "+ Material hochladen",

    joinToViewMaterials: "Tritt der Gruppe bei, um Materialien zu sehen",

    membersOnlyMaterials:

      "Nur Gruppenmitglieder können auf Materialien zugreifen.",

    uploadMaterialTitle: "Material hochladen",

    uploadMaterialDescription:

      "Lade eine Lerndatei für deine Gruppenmitglieder hoch.",

    cancel: "Abbrechen",

    materialTitlePlaceholder: "Materialtitel...",

    materialDescriptionPlaceholder:

      "Kurze Beschreibung (optional)...",

    chooseFile: "Datei auswählen",

    maximumSize: "Maximale Größe: 5 MB",

    chooseFileButton: "Datei auswählen",

    uploadingMaterial: "Wird hochgeladen...",

    uploadMaterialButton: "Material hochladen",

    loadingMaterials: "Materialien werden geladen...",

    noMaterials: "Noch keine Materialien",

    firstMaterial: "Lade das erste Lernmaterial hoch.",

    uploadFirstMaterial: "+ Erstes Material hochladen",

    opening: "Wird geöffnet...",

    openDownload: "📥 Öffnen / Herunterladen",

    deleting: "Wird gelöscht...",

    delete: "Löschen",

    newNote: "+ Neue Notiz",

    notesForEveryone: "Notizen, die mit allen Mitgliedern geteilt werden.",

    joinToViewNotes: "Tritt der Gruppe bei, um Notizen zu sehen",

    membersOnlyNotes:

      "Nur Gruppenmitglieder können auf Notizen zugreifen.",

    editNote: "Notiz bearbeiten",

    createNote: "Notiz erstellen",

    noteVisible: "Diese Notiz ist für alle Mitglieder sichtbar.",

    noteTitlePlaceholder: "Notiztitel...",

    noteContentPlaceholder: "Schreibe deine Notiz hier...",

    saving: "Wird gespeichert...",

    saveChanges: "Änderungen speichern",

    loadingNotes: "Notizen werden geladen...",

    noSharedNotes: "Noch keine geteilten Notizen",

    firstNote: "Erstelle die erste Notiz für deine Gruppe.",

    createFirstNote: "+ Erste Notiz erstellen",

    noContent: "Kein Inhalt zu dieser Notiz hinzugefügt.",

    groupChat: "Gruppenchat",

    open: "Offen",

    closed: "Geschlossen",

    chatDescription: "Sprich mit deinen Lernpartnern.",

    close: "Schließen",

    joinToChat: "Tritt der Gruppe bei, um zu chatten",

    membersOnlyChat:

      "Nur Gruppenmitglieder können auf den Chat zugreifen.",

    chatClosed: "Der Chat ist derzeit geschlossen",

    chatClosedDescription:

      "Der Gruppenbesitzer hat neue Nachrichten vorübergehend deaktiviert.",

    previousMessages:

      "Vorherige Nachrichten sind verfügbar, wenn der Chat wieder geöffnet wird.",

    loadingMessages: "Nachrichten werden geladen...",

    noMessages: "Noch keine Nachrichten",

    startConversation: "Starte die Unterhaltung!",

    edit: "Bearbeiten",

    save: "Speichern",

    writeMessage: "Nachricht schreiben...",

    send: "Senden",

    unknownSize: "Unbekannte Größe",

    deleteMaterialConfirm: '"{title}" löschen?',

    deleteMessageConfirm:

      "Möchtest du diese Nachricht wirklich löschen?",

    removeMemberConfirm:

      "{username} aus dieser Gruppe entfernen?",

    deleteNoteConfirm:
      "Möchtest du diese Notiz wirklich löschen?",
    failedLoadGroup: "Gruppe konnte nicht geladen werden.",
    failedLoadMessages: "Nachrichten konnten nicht geladen werden.",
    failedLoadNotes: "Notizen konnten nicht geladen werden.",
    failedLoadMaterials: "Materialien konnten nicht geladen werden.",
    selectImage: "Bitte wähle eine Bilddatei.",
    imageSize: "Das Bild muss kleiner als 2 MB sein.",
    readImage: "Bild konnte nicht gelesen werden.",
    uploadImage: "Gruppenbild konnte nicht hochgeladen werden.",
    fileSize: "Datei zu groß. Maximal 5 MB.",
    unsupportedFile: "Dieser Dateityp wird nicht unterstützt.",
    materialTitleRequired: "Bitte gib einen Materialtitel ein.",
    selectFile: "Bitte wähle zuerst eine Datei.",
    uploadMaterialFailed: "Material konnte nicht hochgeladen werden.",
    readFile: "Datei konnte nicht gelesen werden.",
    openMaterialFailed: "Material konnte nicht geöffnet werden.",
    unavailableFile: "Dateidaten sind nicht verfügbar.",
    deleteMaterialFailed: "Material konnte nicht gelöscht werden.",
    sendMessageFailed: "Nachricht konnte nicht gesendet werden.",
    editMessageFailed: "Nachricht konnte nicht bearbeitet werden.",
    deleteMessageFailed: "Nachricht konnte nicht gelöscht werden.",
    removeMemberFailed: "Mitglied konnte nicht entfernt werden.",
    chatSettingsFailed: "Chat konnte nicht aktualisiert werden.",
    saveNoteFailed: "Notiz konnte nicht gespeichert werden.",
    deleteNoteFailed: "Notiz konnte nicht gelöscht werden.",
  },

  zh: {
    backToGroups: "← 返回学习小组",
    studyGroups: "← 学习小组",
    loadingGroup: "正在加载小组...",
    groupNotFound: "找不到小组",
    groupDoesNotExist: "该小组不存在。",
    member: "成员",
    notMember: "不是成员",
    uploading: "正在上传...",
    change: "更换",
    clickImage: "点击图片进行更换",
    updating: "正在更新...",
    closeChat: "🔒 关闭聊天",
    openChat: "🔓 开启聊天",
    aboutGroup: "关于这个小组",
    readyToLearn: "这个学习小组已经准备好一起学习。",
    members: "成员",
    owner: "所有者",
    created: "创建时间",
    studentsInGroup: "小组中的学生。",
    remove: "移除",
    groupWorkspace: "小组工作区",
    workspaceDescription: "学习小组所需的一切都在这里。",
    sharedNotes: "共享笔记",
    sharedNotesDescription: "创建并与学习小组共享笔记。",
    note: "笔记",
    notes: "笔记",
    materials: "学习资料",
    materialsDescription: "分享学习资料、资源和有用文件。",
    material: "资料",
    materialsPlural: "资料",
    studySessions: "学习课程",
    studySessionsDescription: "计划并组织小组学习课程。",
    manageSessions: "管理课程 →",
    studyFiles: "与小组共享的学习文件。",
    uploadMaterial: "+ 上传资料",
    joinToViewMaterials: "加入小组后查看资料",
    membersOnlyMaterials: "只有小组成员可以访问共享资料。",
    uploadMaterialTitle: "上传资料",
    uploadMaterialDescription: "为小组成员上传学习文件。",
    cancel: "取消",
    materialTitlePlaceholder: "资料标题...",
    materialDescriptionPlaceholder: "简短描述（可选）...",
    chooseFile: "选择文件",
    maximumSize: "最大大小：5MB",
    chooseFileButton: "选择文件",
    uploadingMaterial: "正在上传...",
    uploadMaterialButton: "上传资料",
    loadingMaterials: "正在加载资料...",
    noMaterials: "还没有资料",
    firstMaterial: "上传第一份学习资料。",
    uploadFirstMaterial: "+ 上传第一份资料",
    opening: "正在打开...",
    openDownload: "📥 打开 / 下载",
    deleting: "正在删除...",
    delete: "删除",
    newNote: "+ 新建笔记",
    notesForEveryone: "与所有小组成员共享的笔记。",
    joinToViewNotes: "加入小组后查看共享笔记",
    membersOnlyNotes: "只有小组成员可以访问笔记。",
    editNote: "编辑笔记",
    createNote: "创建笔记",
    noteVisible: "此笔记对所有小组成员可见。",
    noteTitlePlaceholder: "笔记标题...",
    noteContentPlaceholder: "在这里写下你的笔记...",
    saving: "正在保存...",
    saveChanges: "保存更改",
    loadingNotes: "正在加载笔记...",
    noSharedNotes: "还没有共享笔记",
    firstNote: "为学习小组创建第一份笔记。",
    createFirstNote: "+ 创建第一份笔记",
    noContent: "此笔记没有内容。",
    groupChat: "小组聊天",
    open: "开放",
    closed: "关闭",
    chatDescription: "与学习伙伴讨论。",
    close: "关闭",
    joinToChat: "加入小组后聊天",
    membersOnlyChat: "只有小组成员可以访问聊天。",
    chatClosed: "聊天当前已关闭",
    chatClosedDescription: "小组所有者暂时禁用了新消息。",
    previousMessages: "重新开启聊天后仍可查看之前的消息。",
    loadingMessages: "正在加载消息...",
    noMessages: "还没有消息",
    startConversation: "开始聊天吧！",
    edit: "编辑",
    save: "保存",
    writeMessage: "输入消息...",
    send: "发送",
    unknownSize: "未知大小",
    deleteMaterialConfirm: '删除“{title}”？',
    deleteMessageConfirm: "确定要删除这条消息吗？",
    removeMemberConfirm: "将 {username} 从小组中移除？",
    deleteNoteConfirm: "确定要删除这份笔记吗？",
    failedLoadGroup: "加载小组失败。",
    failedLoadMessages: "加载消息失败。",
    failedLoadNotes: "加载笔记失败。",
    failedLoadMaterials: "加载资料失败。",
    selectImage: "请选择图片文件。",
    imageSize: "图片必须小于2MB。",
    readImage: "读取图片失败。",
    uploadImage: "上传小组图片失败。",
    fileSize: "文件太大。最大5MB。",
    unsupportedFile: "不支持此文件类型。",
    materialTitleRequired: "请输入资料标题。",
    selectFile: "请先选择文件。",
    uploadMaterialFailed: "上传资料失败。",
    readFile: "读取文件失败。",
    openMaterialFailed: "打开资料失败。",
    unavailableFile: "文件数据不可用。",
    deleteMaterialFailed: "删除资料失败。",
    sendMessageFailed: "发送消息失败。",
    editMessageFailed: "编辑消息失败。",
    deleteMessageFailed: "删除消息失败。",
    removeMemberFailed: "移除成员失败。",
    chatSettingsFailed: "更新聊天设置失败。",
    saveNoteFailed: "保存笔记失败。",
    deleteNoteFailed: "删除笔记失败。",
  },

  ja: {
    backToGroups: "← 学習グループに戻る",
    studyGroups: "← 学習グループ",
    loadingGroup: "グループを読み込み中...",
    groupNotFound: "グループが見つかりません",
    groupDoesNotExist: "このグループは存在しません。",
    member: "メンバー",
    notMember: "メンバーではありません",
    uploading: "アップロード中...",
    change: "変更",
    clickImage: "画像をクリックして変更",
    updating: "更新中...",
    closeChat: "🔒 チャットを閉じる",
    openChat: "🔓 チャットを開く",
    aboutGroup: "このグループについて",
    readyToLearn: "この学習グループで一緒に学習できます。",
    members: "メンバー",
    owner: "オーナー",
    created: "作成日",
    studentsInGroup: "このグループの学生。",
    remove: "削除",
    groupWorkspace: "グループワークスペース",
    workspaceDescription: "学習に必要なものを一か所で管理できます。",
    sharedNotes: "共有ノート",
    sharedNotesDescription: "グループでノートを作成・共有できます。",
    note: "ノート",
    notes: "ノート",
    materials: "教材",
    materialsDescription: "教材、リソース、便利なファイルを共有できます。",
    material: "教材",
    materialsPlural: "教材",
    studySessions: "学習セッション",
    studySessionsDescription: "グループで学習セッションを計画できます。",
    manageSessions: "セッションを管理 →",
    studyFiles: "グループで共有された学習ファイル。",
    uploadMaterial: "+ 教材をアップロード",
    joinToViewMaterials: "参加して教材を見る",
    membersOnlyMaterials: "教材はグループメンバーのみ利用できます。",
    uploadMaterialTitle: "教材をアップロード",
    uploadMaterialDescription: "グループメンバー向けの学習ファイルをアップロードします。",
    cancel: "キャンセル",
    materialTitlePlaceholder: "教材タイトル...",
    materialDescriptionPlaceholder: "短い説明（任意）...",
    chooseFile: "ファイルを選択",
    maximumSize: "最大サイズ：5MB",
    chooseFileButton: "ファイルを選択",
    uploadingMaterial: "アップロード中...",
    uploadMaterialButton: "教材をアップロード",
    loadingMaterials: "教材を読み込み中...",
    noMaterials: "教材はまだありません",
    firstMaterial: "最初の教材をアップロードしましょう。",
    uploadFirstMaterial: "+ 最初の教材をアップロード",
    opening: "開いています...",
    openDownload: "📥 開く / ダウンロード",
    deleting: "削除中...",
    delete: "削除",
    newNote: "+ 新しいノート",
    notesForEveryone: "全メンバーと共有されるノート。",
    joinToViewNotes: "参加して共有ノートを見る",
    membersOnlyNotes: "ノートはグループメンバーのみ利用できます。",
    editNote: "ノートを編集",
    createNote: "ノートを作成",
    noteVisible: "このノートは全メンバーに表示されます。",
    noteTitlePlaceholder: "ノートタイトル...",
    noteContentPlaceholder: "ここにノートを書いてください...",
    saving: "保存中...",
    saveChanges: "変更を保存",
    loadingNotes: "ノートを読み込み中...",
    noSharedNotes: "共有ノートはまだありません",
    firstNote: "グループの最初のノートを作成しましょう。",
    createFirstNote: "+ 最初のノートを作成",
    noContent: "このノートには内容がありません。",
    groupChat: "グループチャット",
    open: "開いています",
    closed: "閉じています",
    chatDescription: "学習仲間と話しましょう。",
    close: "閉じる",
    joinToChat: "参加してチャットする",
    membersOnlyChat: "チャットはグループメンバーのみ利用できます。",
    chatClosed: "チャットは現在閉じています",
    chatClosedDescription: "オーナーが新しいメッセージを一時的に無効にしています。",
    previousMessages: "チャットを再開すると以前のメッセージを確認できます。",
    loadingMessages: "メッセージを読み込み中...",
    noMessages: "メッセージはまだありません",
    startConversation: "会話を始めましょう！",
    edit: "編集",
    save: "保存",
    writeMessage: "メッセージを書く...",
    send: "送信",
    unknownSize: "サイズ不明",
    deleteMaterialConfirm: '「{title}」を削除しますか？',
    deleteMessageConfirm: "このメッセージを削除しますか？",
    removeMemberConfirm: "{username} をグループから削除しますか？",
    deleteNoteConfirm: "このノートを削除しますか？",
    failedLoadGroup: "グループの読み込みに失敗しました。",
    failedLoadMessages: "メッセージの読み込みに失敗しました。",
    failedLoadNotes: "ノートの読み込みに失敗しました。",
    failedLoadMaterials: "教材の読み込みに失敗しました。",
    selectImage: "画像ファイルを選択してください。",
    imageSize: "画像は2MB未満にしてください。",
    readImage: "画像の読み込みに失敗しました。",
    uploadImage: "グループ画像のアップロードに失敗しました。",
    fileSize: "ファイルが大きすぎます。最大5MBです。",
    unsupportedFile: "このファイル形式はサポートされていません。",
    materialTitleRequired: "教材タイトルを入力してください。",
    selectFile: "先にファイルを選択してください。",
    uploadMaterialFailed: "教材のアップロードに失敗しました。",
    readFile: "ファイルの読み込みに失敗しました。",
    openMaterialFailed: "教材を開けませんでした。",
    unavailableFile: "ファイルデータを利用できません。",
    deleteMaterialFailed: "教材の削除に失敗しました。",
    sendMessageFailed: "メッセージの送信に失敗しました。",
    editMessageFailed: "メッセージの編集に失敗しました。",
    deleteMessageFailed: "メッセージの削除に失敗しました。",
    removeMemberFailed: "メンバーの削除に失敗しました。",
    chatSettingsFailed: "チャット設定の更新に失敗しました。",
    saveNoteFailed: "ノートの保存に失敗しました。",
    deleteNoteFailed: "ノートの削除に失敗しました。",
  },

  ko: {
    backToGroups: "← 스터디 그룹으로 돌아가기",
    studyGroups: "← 스터디 그룹",
    loadingGroup: "그룹을 불러오는 중...",
    groupNotFound: "그룹을 찾을 수 없습니다",
    groupDoesNotExist: "이 그룹은 존재하지 않습니다.",
    member: "회원",
    notMember: "회원이 아님",
    uploading: "업로드 중...",
    change: "변경",
    clickImage: "이미지를 클릭하여 변경",
    updating: "업데이트 중...",
    closeChat: "🔒 채팅 닫기",
    openChat: "🔓 채팅 열기",
    aboutGroup: "그룹 정보",
    readyToLearn: "학생들이 함께 배우고 공부할 수 있는 스터디 그룹입니다.",
    members: "회원",
    owner: "소유자",
    created: "생성일",
    studentsInGroup: "이 그룹의 학생들입니다.",
    remove: "제거",
    groupWorkspace: "그룹 작업 공간",
    workspaceDescription: "스터디 그룹에 필요한 모든 것을 한곳에서 관리하세요.",
    sharedNotes: "공유 노트",
    sharedNotesDescription: "스터디 그룹과 노트를 만들고 공유하세요.",
    note: "노트",
    notes: "노트",
    materials: "자료",
    materialsDescription: "학습 자료, 리소스 및 유용한 파일을 공유하세요.",
    material: "자료",
    materialsPlural: "자료",
    studySessions: "스터디 세션",
    studySessionsDescription: "그룹과 함께 스터디 세션을 계획하고 관리하세요.",
    manageSessions: "세션 관리 →",
    studyFiles: "그룹과 공유된 학습 파일입니다.",
    uploadMaterial: "+ 자료 업로드",
    joinToViewMaterials: "그룹에 가입하여 자료 보기",
    membersOnlyMaterials: "그룹 회원만 공유 자료에 접근할 수 있습니다.",
    uploadMaterialTitle: "자료 업로드",
    uploadMaterialDescription: "그룹 회원을 위한 학습 파일을 업로드하세요.",
    cancel: "취소",
    materialTitlePlaceholder: "자료 제목...",
    materialDescriptionPlaceholder: "간단한 설명 (선택사항)...",
    chooseFile: "파일 선택",
    maximumSize: "최대 크기: 5MB",
    chooseFileButton: "파일 선택",
    uploadingMaterial: "업로드 중...",
    uploadMaterialButton: "자료 업로드",
    loadingMaterials: "자료를 불러오는 중...",
    noMaterials: "아직 자료가 없습니다",
    firstMaterial: "그룹의 첫 학습 자료를 업로드하세요.",
    uploadFirstMaterial: "+ 첫 자료 업로드",
    opening: "여는 중...",
    openDownload: "📥 열기 / 다운로드",
    deleting: "삭제 중...",
    delete: "삭제",
    newNote: "+ 새 노트",
    notesForEveryone: "모든 그룹 회원과 공유되는 노트입니다.",
    joinToViewNotes: "그룹에 가입하여 공유 노트 보기",
    membersOnlyNotes: "그룹 회원만 노트에 접근할 수 있습니다.",
    editNote: "노트 편집",
    createNote: "노트 만들기",
    noteVisible: "이 노트는 모든 회원에게 표시됩니다.",
    noteTitlePlaceholder: "노트 제목...",
    noteContentPlaceholder: "여기에 노트를 작성하세요...",
    saving: "저장 중...",
    saveChanges: "변경 사항 저장",
    loadingNotes: "노트를 불러오는 중...",
    noSharedNotes: "아직 공유 노트가 없습니다",
    firstNote: "스터디 그룹의 첫 노트를 만들어 보세요.",
    createFirstNote: "+ 첫 노트 만들기",
    noContent: "이 노트에는 내용이 없습니다.",
    groupChat: "그룹 채팅",
    open: "열림",
    closed: "닫힘",
    chatDescription: "스터디 파트너와 이야기하세요.",
    close: "닫기",
    joinToChat: "그룹에 가입하여 채팅하기",
    membersOnlyChat: "그룹 회원만 채팅에 접근할 수 있습니다.",
    chatClosed: "현재 채팅이 닫혀 있습니다",
    chatClosedDescription: "그룹 소유자가 새 메시지를 일시적으로 비활성화했습니다.",
    previousMessages: "채팅을 다시 열면 이전 메시지를 확인할 수 있습니다.",
    loadingMessages: "메시지를 불러오는 중...",
    noMessages: "아직 메시지가 없습니다",
    startConversation: "대화를 시작하세요!",
    edit: "편집",
    save: "저장",
    writeMessage: "메시지를 작성하세요...",
    send: "보내기",
    unknownSize: "알 수 없는 크기",
    deleteMaterialConfirm: '"{title}"을(를) 삭제하시겠습니까?',
    deleteMessageConfirm: "이 메시지를 삭제하시겠습니까?",
    removeMemberConfirm: "{username}을(를) 그룹에서 제거하시겠습니까?",
    deleteNoteConfirm: "이 노트를 삭제하시겠습니까?",
    failedLoadGroup: "그룹을 불러오지 못했습니다.",
    failedLoadMessages: "메시지를 불러오지 못했습니다.",
    failedLoadNotes: "노트를 불러오지 못했습니다.",
    failedLoadMaterials: "자료를 불러오지 못했습니다.",
    selectImage: "이미지 파일을 선택하세요.",
    imageSize: "이미지는 2MB보다 작아야 합니다.",
    readImage: "이미지를 읽지 못했습니다.",
    uploadImage: "그룹 이미지를 업로드하지 못했습니다.",
    fileSize: "파일이 너무 큽니다. 최대 5MB입니다.",
    unsupportedFile: "지원되지 않는 파일 형식입니다.",
    materialTitleRequired: "자료 제목을 입력하세요.",
    selectFile: "먼저 파일을 선택하세요.",
    uploadMaterialFailed: "자료를 업로드하지 못했습니다.",
    readFile: "파일을 읽지 못했습니다.",
    openMaterialFailed: "자료를 열지 못했습니다.",
    unavailableFile: "파일 데이터를 사용할 수 없습니다.",
    deleteMaterialFailed: "자료를 삭제하지 못했습니다.",
    sendMessageFailed: "메시지를 보내지 못했습니다.",
    editMessageFailed: "메시지를 수정하지 못했습니다.",
    deleteMessageFailed: "메시지를 삭제하지 못했습니다.",
    removeMemberFailed: "회원을 제거하지 못했습니다.",
    chatSettingsFailed: "채팅 설정을 업데이트하지 못했습니다.",
    saveNoteFailed: "노트를 저장하지 못했습니다.",
    deleteNoteFailed: "노트를 삭제하지 못했습니다.",
  },

  ru: {
    backToGroups: "← Назад к учебным группам",
    studyGroups: "← Учебные группы",
    loadingGroup: "Загрузка группы...",
    groupNotFound: "Группа не найдена",
    groupDoesNotExist: "Этой группы не существует.",
    member: "Участник",
    notMember: "Не участник",
    uploading: "Загрузка...",
    change: "Изменить",
    clickImage: "Нажмите на изображение, чтобы изменить его",
    updating: "Обновление...",
    closeChat: "🔒 Закрыть чат",
    openChat: "🔓 Открыть чат",
    aboutGroup: "О группе",
    readyToLearn: "Эта учебная группа готова учиться вместе.",
    members: "Участники",
    owner: "Владелец",
    created: "Создано",
    studentsInGroup: "Студенты этой группы.",
    remove: "Удалить",
    groupWorkspace: "Рабочее пространство группы",
    workspaceDescription: "Всё необходимое для учебной группы в одном месте.",
    sharedNotes: "Общие заметки",
    sharedNotesDescription: "Создавайте и делитесь заметками с группой.",
    note: "заметка",
    notes: "заметки",
    materials: "Материалы",
    materialsDescription: "Делитесь учебными материалами, ресурсами и файлами.",
    material: "материал",
    materialsPlural: "материалы",
    studySessions: "Учебные сессии",
    studySessionsDescription: "Планируйте учебные сессии вместе с группой.",
    manageSessions: "Управление сессиями →",
    studyFiles: "Учебные файлы, которыми поделились с группой.",
    uploadMaterial: "+ Загрузить материал",
    joinToViewMaterials: "Вступите в группу, чтобы видеть материалы",
    membersOnlyMaterials: "Только участники группы могут просматривать материалы.",
    uploadMaterialTitle: "Загрузить материал",
    uploadMaterialDescription: "Загрузите учебный файл для участников группы.",
    cancel: "Отмена",
    materialTitlePlaceholder: "Название материала...",
    materialDescriptionPlaceholder: "Краткое описание (необязательно)...",
    chooseFile: "Выберите файл",
    maximumSize: "Максимальный размер: 5 МБ",
    chooseFileButton: "Выбрать файл",
    uploadingMaterial: "Загрузка...",
    uploadMaterialButton: "Загрузить материал",
    loadingMaterials: "Загрузка материалов...",
    noMaterials: "Материалов пока нет",
    firstMaterial: "Загрузите первый учебный материал.",
    uploadFirstMaterial: "+ Загрузить первый материал",
    opening: "Открытие...",
    openDownload: "📥 Открыть / Скачать",
    deleting: "Удаление...",
    delete: "Удалить",
    newNote: "+ Новая заметка",
    notesForEveryone: "Заметки, доступные всем участникам.",
    joinToViewNotes: "Вступите в группу, чтобы видеть заметки",
    membersOnlyNotes: "Только участники группы могут просматривать заметки.",
    editNote: "Редактировать заметку",
    createNote: "Создать заметку",
    noteVisible: "Эта заметка будет видна всем участникам.",
    noteTitlePlaceholder: "Название заметки...",
    noteContentPlaceholder: "Напишите заметку здесь...",
    saving: "Сохранение...",
    saveChanges: "Сохранить изменения",
    loadingNotes: "Загрузка заметок...",
    noSharedNotes: "Общих заметок пока нет",
    firstNote: "Создайте первую заметку для группы.",
    createFirstNote: "+ Создать первую заметку",
    noContent: "В этой заметке нет содержимого.",
    groupChat: "Чат группы",
    open: "Открыт",
    closed: "Закрыт",
    chatDescription: "Общайтесь с участниками группы.",
    close: "Закрыть",
    joinToChat: "Вступите в группу, чтобы общаться",
    membersOnlyChat: "Только участники группы могут использовать чат.",
    chatClosed: "Чат сейчас закрыт",
    chatClosedDescription: "Владелец группы временно отключил новые сообщения.",
    previousMessages: "Предыдущие сообщения будут доступны после открытия чата.",
    loadingMessages: "Загрузка сообщений...",
    noMessages: "Сообщений пока нет",
    startConversation: "Начните разговор!",
    edit: "Изменить",
    save: "Сохранить",
    writeMessage: "Напишите сообщение...",
    send: "Отправить",
    unknownSize: "Неизвестный размер",
    deleteMaterialConfirm: 'Удалить "{title}"?',
    deleteMessageConfirm: "Вы уверены, что хотите удалить это сообщение?",
    removeMemberConfirm: "Удалить {username} из группы?",
    deleteNoteConfirm: "Вы уверены, что хотите удалить эту заметку?",
    failedLoadGroup: "Не удалось загрузить группу.",
    failedLoadMessages: "Не удалось загрузить сообщения.",
    failedLoadNotes: "Не удалось загрузить заметки.",
    failedLoadMaterials: "Не удалось загрузить материалы.",
    selectImage: "Выберите файл изображения.",
    imageSize: "Изображение должно быть меньше 2 МБ.",
    readImage: "Не удалось прочитать изображение.",
    uploadImage: "Не удалось загрузить изображение группы.",
    fileSize: "Файл слишком большой. Максимум 5 МБ.",
    unsupportedFile: "Этот тип файла не поддерживается.",
    materialTitleRequired: "Введите название материала.",
    selectFile: "Сначала выберите файл.",
    uploadMaterialFailed: "Не удалось загрузить материал.",
    readFile: "Не удалось прочитать файл.",
    openMaterialFailed: "Не удалось открыть материал.",
    unavailableFile: "Данные файла недоступны.",
    deleteMaterialFailed: "Не удалось удалить материал.",
    sendMessageFailed: "Не удалось отправить сообщение.",
    editMessageFailed: "Не удалось изменить сообщение.",
    deleteMessageFailed: "Не удалось удалить сообщение.",
    removeMemberFailed: "Не удалось удалить участника.",
    chatSettingsFailed: "Не удалось обновить настройки чата.",
    saveNoteFailed: "Не удалось сохранить заметку.",
    deleteNoteFailed: "Не удалось удалить заметку.",
  },

  tr: {
    backToGroups: "← Çalışma Gruplarına Dön",
    studyGroups: "← Çalışma Grupları",
    loadingGroup: "Grup yükleniyor...",
    groupNotFound: "Grup bulunamadı",
    groupDoesNotExist: "Bu grup mevcut değil.",
    member: "Üye",
    notMember: "Üye değil",
    uploading: "Yükleniyor...",
    change: "Değiştir",
    clickImage: "Değiştirmek için görsele tıklayın",
    updating: "Güncelleniyor...",
    closeChat: "🔒 Sohbeti Kapat",
    openChat: "🔓 Sohbeti Aç",
    aboutGroup: "Bu grup hakkında",
    readyToLearn: "Bu çalışma grubu birlikte öğrenmeye hazır.",
    members: "Üyeler",
    owner: "Sahip",
    created: "Oluşturuldu",
    studentsInGroup: "Bu gruptaki öğrenciler.",
    remove: "Kaldır",
    groupWorkspace: "Grup Çalışma Alanı",
    workspaceDescription:
      "Çalışma grubunuzun ihtiyaç duyduğu her şey tek bir yerde.",
    sharedNotes: "Paylaşılan Notlar",
    sharedNotesDescription:
      "Çalışma grubunuzla notlar oluşturun ve paylaşın.",
    note: "not",
    notes: "not",
    materials: "Materyaller",
    materialsDescription:
      "Çalışma materyallerini, kaynakları ve dosyaları paylaşın.",
    material: "materyal",
    materialsPlural: "materyal",
    studySessions: "Çalışma Oturumları",
    studySessionsDescription:
      "Grubunuzla çalışma oturumları planlayın ve düzenleyin.",
    manageSessions: "Oturumları yönet →",
    studyFiles: "Grupla paylaşılan çalışma dosyaları.",
    uploadMaterial: "+ Materyal Yükle",
    joinToViewMaterials: "Materyalleri görmek için gruba katılın",
    membersOnlyMaterials:
      "Paylaşılan materyallere yalnızca grup üyeleri erişebilir.",
    uploadMaterialTitle: "Materyal Yükle",
    uploadMaterialDescription:
      "Grup üyeleri için bir çalışma dosyası yükleyin.",
    cancel: "İptal",
    materialTitlePlaceholder: "Materyal başlığı...",
    materialDescriptionPlaceholder:
      "Kısa açıklama (isteğe bağlı)...",
    chooseFile: "Dosya seç",
    maximumSize: "Maksimum boyut: 5 MB",
    chooseFileButton: "Dosya Seç",
    uploadingMaterial: "Yükleniyor...",
    uploadMaterialButton: "Materyal Yükle",
    loadingMaterials: "Materyaller yükleniyor...",
    noMaterials: "Henüz materyal yok",
    firstMaterial: "İlk çalışma materyalini yükleyin.",
    uploadFirstMaterial: "+ İlk Materyali Yükle",
    opening: "Açılıyor...",
    openDownload: "📥 Aç / İndir",
    deleting: "Siliniyor...",
    delete: "Sil",
    newNote: "+ Yeni Not",
    notesForEveryone: "Tüm grup üyeleriyle paylaşılan notlar.",
    joinToViewNotes: "Paylaşılan notları görmek için gruba katılın",
    membersOnlyNotes:
      "Notlara yalnızca grup üyeleri erişebilir.",
    editNote: "Notu Düzenle",
    createNote: "Not Oluştur",
    noteVisible: "Bu not tüm üyeler tarafından görülebilir.",
    noteTitlePlaceholder: "Not başlığı...",
    noteContentPlaceholder: "Notunuzu buraya yazın...",
    saving: "Kaydediliyor...",
    saveChanges: "Değişiklikleri Kaydet",
    loadingNotes: "Notlar yükleniyor...",
    noSharedNotes: "Henüz paylaşılan not yok",
    firstNote: "Çalışma grubunuz için ilk notu oluşturun.",
    createFirstNote: "+ İlk Notu Oluştur",
    noContent: "Bu nota içerik eklenmemiş.",
    groupChat: "Grup Sohbeti",
    open: "Açık",
    closed: "Kapalı",
    chatDescription: "Çalışma arkadaşlarınızla konuşun.",
    close: "Kapat",
    joinToChat: "Sohbet etmek için gruba katılın",
    membersOnlyChat:
      "Sohbete yalnızca grup üyeleri erişebilir.",
    chatClosed: "Sohbet şu anda kapalı",
    chatClosedDescription:
      "Grup sahibi yeni mesajları geçici olarak devre dışı bıraktı.",
    previousMessages:
      "Sohbet yeniden açıldığında önceki mesajlar kullanılabilir.",
    loadingMessages: "Mesajlar yükleniyor...",
    noMessages: "Henüz mesaj yok",
    startConversation: "Sohbeti başlatın!",
    edit: "Düzenle",
    save: "Kaydet",
    writeMessage: "Mesaj yazın...",
    send: "Gönder",
    unknownSize: "Bilinmeyen boyut",
    deleteMaterialConfirm: '"{title}" silinsin mi?',
    deleteMessageConfirm:
      "Bu mesajı silmek istediğinizden emin misiniz?",
    removeMemberConfirm:
      "{username} gruptan kaldırılsın mı?",
    deleteNoteConfirm:
      "Bu notu silmek istediğinizden emin misiniz?",
    failedLoadGroup: "Grup yüklenemedi.",
    failedLoadMessages: "Mesajlar yüklenemedi.",
    failedLoadNotes: "Notlar yüklenemedi.",
    failedLoadMaterials: "Materyaller yüklenemedi.",
    selectImage: "Bir görsel dosyası seçin.",
    imageSize: "Görsel 2 MB'den küçük olmalıdır.",
    readImage: "Görsel okunamadı.",
    uploadImage: "Grup görseli yüklenemedi.",
    fileSize: "Dosya çok büyük. Maksimum 5 MB.",
    unsupportedFile: "Bu dosya türü desteklenmiyor.",
    materialTitleRequired: "Materyal başlığını girin.",
    selectFile: "Önce bir dosya seçin.",
    uploadMaterialFailed: "Materyal yüklenemedi.",
    readFile: "Dosya okunamadı.",
    openMaterialFailed: "Materyal açılamadı.",
    unavailableFile: "Dosya verileri kullanılamıyor.",
    deleteMaterialFailed: "Materyal silinemedi.",
    sendMessageFailed: "Mesaj gönderilemedi.",
    editMessageFailed: "Mesaj düzenlenemedi.",
    deleteMessageFailed: "Mesaj silinemedi.",
    removeMemberFailed: "Üye kaldırılamadı.",
    chatSettingsFailed: "Sohbet ayarları güncellenemedi.",
    saveNoteFailed: "Not kaydedilemedi.",
    deleteNoteFailed: "Not silinemedi.",
  },

  hi: {
    backToGroups: "← स्टडी ग्रुप्स पर वापस जाएँ",
    studyGroups: "← स्टडी ग्रुप्स",
    loadingGroup: "ग्रुप लोड हो रहा है...",
    groupNotFound: "ग्रुप नहीं मिला",
    groupDoesNotExist: "यह ग्रुप मौजूद नहीं है।",
    member: "सदस्य",
    notMember: "सदस्य नहीं",
    uploading: "अपलोड हो रहा है...",
    change: "बदलें",
    clickImage: "बदलने के लिए तस्वीर पर क्लिक करें",
    updating: "अपडेट हो रहा है...",
    closeChat: "🔒 चैट बंद करें",
    openChat: "🔓 चैट खोलें",
    aboutGroup: "इस ग्रुप के बारे में",
    readyToLearn: "यह स्टडी ग्रुप साथ मिलकर पढ़ने के लिए तैयार है।",
    members: "सदस्य",
    owner: "मालिक",
    created: "बनाया गया",
    studentsInGroup: "इस ग्रुप के छात्र।",
    remove: "हटाएँ",
    groupWorkspace: "ग्रुप वर्कस्पेस",
    workspaceDescription: "आपके स्टडी ग्रुप की सभी जरूरतें एक जगह।",
    sharedNotes: "शेयर्ड नोट्स",
    sharedNotesDescription: "अपने स्टडी ग्रुप के साथ नोट्स बनाएँ और शेयर करें।",
    note: "नोट",
    notes: "नोट्स",
    materials: "सामग्री",
    materialsDescription: "स्टडी सामग्री, संसाधन और उपयोगी फाइलें शेयर करें।",
    material: "सामग्री",
    materialsPlural: "सामग्री",
    studySessions: "स्टडी सेशन",
    studySessionsDescription: "अपने ग्रुप के साथ स्टडी सेशन प्लान करें।",
    manageSessions: "सेशन मैनेज करें →",
    studyFiles: "ग्रुप के साथ शेयर की गई स्टडी फाइलें।",
    uploadMaterial: "+ सामग्री अपलोड करें",
    joinToViewMaterials: "सामग्री देखने के लिए ग्रुप में शामिल हों",
    membersOnlyMaterials:
      "शेयर्ड सामग्री केवल ग्रुप सदस्य देख सकते हैं।",
    uploadMaterialTitle: "सामग्री अपलोड करें",
    uploadMaterialDescription:
      "अपने ग्रुप सदस्यों के लिए स्टडी फाइल अपलोड करें।",
    cancel: "रद्द करें",
    materialTitlePlaceholder: "सामग्री का शीर्षक...",
    materialDescriptionPlaceholder:
      "छोटा विवरण (वैकल्पिक)...",
    chooseFile: "फाइल चुनें",
    maximumSize: "अधिकतम आकार: 5MB",
    chooseFileButton: "फाइल चुनें",
    uploadingMaterial: "अपलोड हो रहा है...",
    uploadMaterialButton: "सामग्री अपलोड करें",
    loadingMaterials: "सामग्री लोड हो रही है...",
    noMaterials: "अभी कोई सामग्री नहीं",
    firstMaterial: "अपने ग्रुप की पहली स्टडी सामग्री अपलोड करें।",
    uploadFirstMaterial: "+ पहली सामग्री अपलोड करें",
    opening: "खोला जा रहा है...",
    openDownload: "📥 खोलें / डाउनलोड करें",
    deleting: "हटाया जा रहा है...",
    delete: "हटाएँ",
    newNote: "+ नया नोट",
    notesForEveryone: "सभी ग्रुप सदस्यों के साथ शेयर किए गए नोट्स।",
    joinToViewNotes: "शेयर्ड नोट्स देखने के लिए ग्रुप में शामिल हों",
    membersOnlyNotes:
      "नोट्स केवल ग्रुप सदस्य देख सकते हैं।",
    editNote: "नोट संपादित करें",
    createNote: "नोट बनाएँ",
    noteVisible: "यह नोट सभी सदस्यों को दिखाई देगा।",
    noteTitlePlaceholder: "नोट का शीर्षक...",
    noteContentPlaceholder: "अपना नोट यहाँ लिखें...",
    saving: "सेव हो रहा है...",
    saveChanges: "बदलाव सेव करें",
    loadingNotes: "नोट्स लोड हो रहे हैं...",
    noSharedNotes: "अभी कोई शेयर्ड नोट नहीं",
    firstNote: "अपने स्टडी ग्रुप के लिए पहला नोट बनाएँ।",
    createFirstNote: "+ पहला नोट बनाएँ",
    noContent: "इस नोट में कोई सामग्री नहीं है।",
    groupChat: "ग्रुप चैट",
    open: "खुली",
    closed: "बंद",
    chatDescription: "अपने स्टडी पार्टनर्स से बात करें।",
    close: "बंद करें",
    joinToChat: "चैट करने के लिए ग्रुप में शामिल हों",
    membersOnlyChat:
      "चैट केवल ग्रुप सदस्य इस्तेमाल कर सकते हैं।",
    chatClosed: "चैट अभी बंद है",
    chatClosedDescription:
      "ग्रुप मालिक ने नए संदेशों को अस्थायी रूप से बंद किया है।",
    previousMessages:
      "चैट दोबारा खुलने पर पुराने संदेश उपलब्ध रहेंगे।",
    loadingMessages: "संदेश लोड हो रहे हैं...",
    noMessages: "अभी कोई संदेश नहीं",
    startConversation: "बातचीत शुरू करें!",
    edit: "संपादित करें",
    save: "सेव करें",
    writeMessage: "संदेश लिखें...",
    send: "भेजें",
    unknownSize: "अज्ञात आकार",
    deleteMaterialConfirm: '"{title}" हटाएँ?',
    deleteMessageConfirm:
      "क्या आप इस संदेश को हटाना चाहते हैं?",
    removeMemberConfirm:
      "{username} को इस ग्रुप से हटाएँ?",
    deleteNoteConfirm:
      "क्या आप इस नोट को हटाना चाहते हैं?",
    failedLoadGroup: "ग्रुप लोड नहीं हो सका।",
    failedLoadMessages: "संदेश लोड नहीं हो सके।",
    failedLoadNotes: "नोट्स लोड नहीं हो सके।",
    failedLoadMaterials: "सामग्री लोड नहीं हो सकी।",
    selectImage: "कृपया एक इमेज फाइल चुनें।",
    imageSize: "इमेज 2MB से छोटी होनी चाहिए।",
    readImage: "इमेज पढ़ी नहीं जा सकी।",
    uploadImage: "ग्रुप इमेज अपलोड नहीं हो सकी।",
    fileSize: "फाइल बहुत बड़ी है। अधिकतम 5MB।",
    unsupportedFile: "यह फाइल प्रकार समर्थित नहीं है।",
    materialTitleRequired: "कृपया सामग्री का शीर्षक डालें।",
    selectFile: "पहले एक फाइल चुनें।",
    uploadMaterialFailed: "सामग्री अपलोड नहीं हो सकी।",
    readFile: "फाइल पढ़ी नहीं जा सकी।",
    openMaterialFailed: "सामग्री खोली नहीं जा सकी।",
    unavailableFile: "फाइल डेटा उपलब्ध नहीं है।",
    deleteMaterialFailed: "सामग्री हटाई नहीं जा सकी।",
    sendMessageFailed: "संदेश भेजा नहीं जा सका।",
    editMessageFailed: "संदेश संपादित नहीं किया जा सका।",
    deleteMessageFailed: "संदेश हटाया नहीं जा सका।",
    removeMemberFailed: "सदस्य हटाया नहीं जा सका।",
    chatSettingsFailed: "चैट सेटिंग अपडेट नहीं हो सकी।",
    saveNoteFailed: "नोट सेव नहीं हो सका।",
    deleteNoteFailed: "नोट हटाया नहीं जा सका।",
  },
} as const;

type TranslationSet = {
  [K in keyof typeof translations.en]: string;
};

export default function GroupPage() {
  const params = useParams();
  const id = params.id;

  const { language } = useLanguage();
  const isArabic = language === "ar";

  const t: TranslationSet =
    translations[language as keyof typeof translations] ||
    translations.en;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [pinnedMessageIndex, setPinnedMessageIndex] = useState(0);
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

  const [messageText, setMessageText] =
  useState<string>("");

  const [selectedChatFile, setSelectedChatFile] =
  useState<File | null>(null);

  const [isRecording, setIsRecording] =
  useState(false);

const [recordingTime, setRecordingTime] =
  useState(0);

const mediaRecorderRef =
  useRef<MediaRecorder | null>(null);

const audioChunksRef =
  useRef<Blob[]>([]);

const recordingTimerRef =
  useRef<ReturnType<typeof setInterval> | null>(
    null
  );

const startRecording = async () => {
  try {
    setChatError("");

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setChatError(
        "Voice recording is not supported in this browser."
      );
      return;
    }

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    const recorder =
      new MediaRecorder(stream);

    audioChunksRef.current = [];

    recorder.ondataavailable = (
      event
    ) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(
          event.data
        );
      }
    };

    recorder.onstop = () => {
      const audioBlob =
        new Blob(
          audioChunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

      const audioFile =
        new File(
          [audioBlob],
          `voice-${Date.now()}.webm`,
          {
            type:
              audioBlob.type ||
              "audio/webm",
          }
        );

      setSelectedChatFile(
        audioFile
      );

      stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    };

    recorder.start();

    mediaRecorderRef.current =
      recorder;

    setIsRecording(true);
    setRecordingTime(0);

    recordingTimerRef.current =
      setInterval(() => {
        setRecordingTime(
          (current) => current + 1
        );
      }, 1000);
  } catch (error) {
    console.error(
      "Voice recording error:",
      error
    );

    setChatError(
      "Microphone permission is required to record voice."
    );
  }
};

const stopRecording = () => {
  if (
    mediaRecorderRef.current &&
    mediaRecorderRef.current.state !==
      "inactive"
  ) {
    mediaRecorderRef.current.stop();
  }

  setIsRecording(false);

  if (recordingTimerRef.current) {
    clearInterval(
      recordingTimerRef.current
    );

    recordingTimerRef.current = null;
  }
};  



  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef =
   useRef<HTMLDivElement | null>(null);

  const [editingMessageId, setEditingMessageId] =
    useState<number | null>(null);

  const [editText, setEditText] =
  useState<string>("");

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

  const messagesEndRef =
  useRef<HTMLDivElement | null>(null);  

  const chatFileInputRef =
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
  if (!group?.is_member) {
    return;
  }

  loadMessages();
  loadNotes();
  loadMaterials();

  let active = true;

  async function loadMessagesAutomatically() {
    try {
      const response = await fetch(
        `/api/groups/${params.id}/messages`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      console.log("SENT MESSAGE RESPONSE:", JSON.stringify(data, null, 2));
console.log("MESSAGE OBJECT:", data?.message);
console.log("MEDIA URL:", data?.message?.media_url);
console.log("MEDIA TYPE:", data?.message?.media_type);

      if (!active || !response.ok || !data.success) {
        return;
      }

      setMessages((current) => {
  const incomingMessages = data.messages || [];

  if (!incomingMessages.length) {
    return current;
  }

  return incomingMessages;
});

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
    } catch {
      // Ignore temporary polling errors.
    }
  }

  loadMessagesAutomatically();

  const interval = window.setInterval(
    loadMessagesAutomatically,
    1500
  );

  return () => {
    active = false;
    window.clearInterval(interval);
  };
}, [group?.is_member, params.id]);

useEffect(() => {
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as Node;

    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(target) &&
      !(target as HTMLElement).closest(
        '[data-emoji-button="true"]'
      )
    ) {
      setShowEmojiPicker(false);
    }
  }

  if (showEmojiPicker) {
    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );
  }

  return () => {
    document.removeEventListener(
      "mousedown",
      handleOutsideClick
    );
  };
}, [showEmojiPicker]);

  async function loadCurrentUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!response.ok) return;

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
          data.message ||
          data.error ||
          t.failedLoadGroup
        );
      }

      setGroup(data.group);
      setMembers(data.members || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t.failedLoadGroup
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
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          t.failedLoadMessages
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
          : t.failedLoadMessages
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
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          t.failedLoadNotes
        );
      }

      setNotes(data.notes || []);
    } catch (error) {
      setNotesError(
        error instanceof Error
          ? error.message
          : t.failedLoadNotes
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
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          t.failedLoadMaterials
        );
      }

      setMaterials(data.materials || []);
    } catch (error) {
      setMaterialsError(
        error instanceof Error
          ? error.message
          : t.failedLoadMaterials
      );
    } finally {
      setMaterialsLoading(false);
    }
  }

  async function handleGroupImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !group) return;

    if (!file.type.startsWith("image/")) {
      setError(t.selectImage);
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(t.imageSize);
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
            throw new Error(t.readImage);
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
              t.uploadImage
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
              : t.uploadImage
          );
        } finally {
          setUploadingImage(false);
          event.target.value = "";
        }
      };

      reader.onerror = () => {
        setError(t.readImage);
        setUploadingImage(false);
        event.target.value = "";
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t.uploadImage
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
      setMaterialsError(t.fileSize);
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
      setMaterialsError(t.unsupportedFile);
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

    if (uploadingMaterial) return;

    const title = materialTitle.trim();
    const description = materialDescription.trim();

    if (!title) {
      setMaterialsError(t.materialTitleRequired);
      return;
    }

    if (!selectedMaterialFile) {
      setMaterialsError(t.selectFile);
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
          t.uploadMaterialFailed
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
          : t.uploadMaterialFailed
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
          reject(new Error(t.readFile));
        }
      };

      reader.onerror = () => {
        reject(new Error(t.readFile));
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
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          t.openMaterialFailed
        );
      }

      const fileData = data.material?.file_data;

      if (
        typeof fileData !== "string" ||
        !fileData.startsWith("data:")
      ) {
        throw new Error(t.unavailableFile);
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
          : t.openMaterialFailed
      );
    } finally {
      setDownloadingMaterialId(null);
    }
  }

  async function deleteMaterial(
    material: GroupMaterial
  ) {
    const confirmed = window.confirm(
      t.deleteMaterialConfirm.replace(
        "{title}",
        material.title
      )
    );

    if (!confirmed) return;

    try {
      setDeletingMaterialId(material.id);
      setMaterialsError("");

      const response = await fetch(
        `/api/groups/${id}/materials/${material.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          t.deleteMaterialFailed
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
          : t.deleteMaterialFailed
      );
    } finally {
      setDeletingMaterialId(null);
    }
  }

  function formatFileSize(size: number) {
    if (!size || size <= 0) {
      return t.unknownSize;
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

    if (extension === "pdf") return "📕";

    if (
      extension === "doc" ||
      extension === "docx"
    )
      return "📘";

    if (
      extension === "ppt" ||
      extension === "pptx"
    )
      return "📙";

    if (
      extension === "xls" ||
      extension === "xlsx" ||
      extension === "csv"
    )
      return "📗";

    if (
      extension === "png" ||
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "webp"
    )
      return "🖼️";

    if (
      extension === "txt" ||
      extension === "md"
    )
      return "📄";

    return "📎";
  }

  async function sendMessage(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const text = messageText.trim();

  if ((!text && !selectedChatFile) || sending) {
    return;
  }

  try {
    setSending(true);
    setChatError("");

    const formData = new FormData();

    if (text) {
      formData.append("message", text);
    }

    if (selectedChatFile) {
      formData.append("file", selectedChatFile);
    }

    const response = await fetch(
      `/api/groups/${id}/messages`,
      {
        method: "POST",
        body: formData,
      }
    );

    // نقرأ الـ response كنص أولاً عشان نعرف السيرفر رجّع إيه بالضبط
    const responseText = await response.text();

    console.log(
      "SENT MESSAGE STATUS:",
      response.status
    );

    console.log(
      "SENT MESSAGE RAW RESPONSE:",
      responseText
    );

    let data: {
      success?: boolean;
      message?: {
        id: number;
        group_id: number;
        user_id: number;
        message: string;
        media_url?: string | null;
        media_type?:
          | "image"
          | "video"
          | "audio"
          | null;
        created_at: string;
        username: string;
      };
      error?: string;
    };

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        "Server returned an invalid response."
      );
    }

    console.log(
      "SENT MESSAGE PARSED DATA:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.message && typeof data.message === "string"
          ? data.message
          : data.error ||
              t.sendMessageFailed
      );
    }

    if (!data.message) {
      console.error(
        "SERVER DID NOT RETURN MESSAGE OBJECT:",
        data
      );

      throw new Error(
        "Message was sent, but the server did not return the message data."
      );
    }

    console.log(
      "MESSAGE TO ADD:",
      data.message
    );

    setMessages((current) => [
      ...current,
      data.message!,
    ]);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);

    setMessageText("");
    setSelectedChatFile(null);

    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = "";
    }
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    setChatError(
      error instanceof Error
        ? error.message
        : t.sendMessageFailed
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

    if (!text || savingEdit) return;

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
          t.editMessageFailed
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
          : t.editMessageFailed
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteMessage(messageId: number) {
    const confirmed = window.confirm(
      t.deleteMessageConfirm
    );

    if (!confirmed) return;

    try {
      setChatError("");

      const response = await fetch(
        `/api/groups/${id}/messages/${messageId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          t.deleteMessageFailed
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
          : t.deleteMessageFailed
      );
    }
  }

  async function togglePinMessage(
  messageId: number,
  isPinned: boolean
) {
  try {
    setChatError("");

    const response = await fetch(
      `/api/groups/${id}/messages/${messageId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "pin",
          isPinned: !isPinned,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to update pinned message."
      );
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === messageId
          ? {
              ...item,
              is_pinned: data.message.is_pinned,
            }
          : item
      )
    );

    if (isPinned) {
      setPinnedMessageIndex((currentIndex) =>
        Math.max(0, currentIndex - 1)
      );
    }
  } catch (error) {
    setChatError(
      error instanceof Error
        ? error.message
        : "Failed to update pinned message."
    );
  }
}

function scrollToMessage(messageId: number) {
  const messageElement = document.getElementById(
    `group-message-${messageId}`
  );

  if (!messageElement) return;

  messageElement.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  messageElement.classList.add(
    "ring-2",
    "ring-amber-400",
    "rounded-xl"
  );

  window.setTimeout(() => {
    messageElement.classList.remove(
      "ring-2",
      "ring-amber-400",
      "rounded-xl"
    );
  }, 1800);
}

  async function removeMember(memberId: number) {
    const member = members.find(
      (item) => item.id === memberId
    );

    if (!member) return;

    const confirmed = window.confirm(
      t.removeMemberConfirm.replace(
        "{username}",
        member.username
      )
    );

    if (!confirmed) return;

    try {
      setRemovingMemberId(memberId);
      setError("");

      const response = await fetch(
        `/api/groups/${id}/members/${memberId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          t.removeMemberFailed
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
          : t.removeMemberFailed
      );
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function toggleChat() {
    if (!group || changingChat) return;

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
          t.chatSettingsFailed
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
          : t.chatSettingsFailed
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

    if (!title || savingNote) return;

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
          t.saveNoteFailed
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
          : t.saveNoteFailed
      );
    } finally {
      setSavingNote(false);
    }
  }

  async function deleteNote(noteId: number) {
    const confirmed = window.confirm(
      t.deleteNoteConfirm
    );

    if (!confirmed) return;

    try {
      setDeletingNoteId(noteId);
      setNotesError("");

      const response = await fetch(
        `/api/groups/${id}/notes/${noteId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          t.deleteNoteFailed
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
          : t.deleteNoteFailed
      );
    } finally {
      setDeletingNoteId(null);
    }
  }

  function formatMessageTime(date: string) {
    return new Date(date).toLocaleTimeString(
      language,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function formatNoteDate(date: string) {
    return new Date(date).toLocaleDateString(
      language,
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
        dir={isArabic ? "rtl" : "ltr"}
        className={`min-h-screen ${darkMode
            ? "bg-slate-950 text-white"
            : "bg-slate-50 text-slate-900"
          }`}
      >
        <Sidebar />

        <div
          className={
            isArabic ? "lg:pr-64" : "lg:pl-64"
          }
        >
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="text-3xl">⏳</div>

              <p
                className={`mt-3 text-sm ${darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                  }`}
              >
                {t.loadingGroup}
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
        dir={isArabic ? "rtl" : "ltr"}
        className={`min-h-screen ${darkMode
            ? "bg-slate-950 text-white"
            : "bg-slate-50 text-slate-900"
          }`}
      >
        <Sidebar />

        <div
          className={
            isArabic ? "lg:pr-64" : "lg:pl-64"
          }
        >
          <div className="p-6 lg:p-8">
            <Link
              href="/groups"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {t.backToGroups}
            </Link>

            <div
              className={`mt-6 rounded-2xl border p-10 text-center ${darkMode
                  ? "border-red-900 bg-slate-900"
                  : "border-red-200 bg-white"
                }`}
            >
              <div className="text-4xl">⚠️</div>

              <h1 className="mt-4 text-xl font-bold">
                {t.groupNotFound}
              </h1>

              <p
                className={`mt-2 text-sm ${darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                  }`}
              >
                {error || t.groupDoesNotExist}
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
  ).toLocaleDateString(language, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className={`min-h-screen transition-colors ${darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
        }`}
    >
      <Sidebar />

      <div
        className={
          isArabic ? "lg:pr-64" : "lg:pl-64"
        }
      >
        <header
          className={`border-b ${darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
            }`}
        >
          <div className="px-6 py-5 lg:px-8">
            <Link
              href="/groups"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {t.studyGroups}
            </Link>

            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    data-emoji-button="true"
                    onClick={() => {
                      if (isGroupOwner) {
                        imageInputRef.current?.click();
                      }
                    }}
                    disabled={
                      !isGroupOwner || uploadingImage
                    }
                    className={`group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-2xl ${darkMode
                        ? "bg-indigo-950 text-indigo-300"
                        : "bg-indigo-50 text-indigo-600"
                      } ${isGroupOwner
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
                        className={`absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white transition ${uploadingImage
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                          }`}
                      >
                        {uploadingImage
                          ? t.uploading
                          : t.change}
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
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${darkMode
                          ? "bg-green-950 text-green-300"
                          : "bg-green-50 text-green-600"
                        }`}
                    >
                      {group.is_member
                        ? t.member
                        : t.notMember}
                    </span>
                  </div>

                  {group.subject && (
                    <p className="mt-1 text-sm font-medium text-indigo-600">
                      {group.subject}
                    </p>
                  )}

                  {isGroupOwner && (
                    <p
                      className={`mt-1 text-[11px] ${darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                        }`}
                    >
                      {t.clickImage}
                    </p>
                  )}
                </div>
              </div>

              {isGroupOwner && (
                <button
                  type="button"
                  onClick={toggleChat}
                  disabled={changingChat}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${group.chat_enabled
                      ? darkMode
                        ? "border-red-900 bg-red-950/40 text-red-300 hover:bg-red-950"
                        : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : darkMode
                        ? "border-green-900 bg-green-950/40 text-green-300 hover:bg-green-950"
                        : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                >
                  {changingChat
                    ? t.updating
                    : group.chat_enabled
                      ? t.closeChat
                      : t.openChat}
                </button>
              )}
            </div>

            {error && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${darkMode
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
              className={`rounded-2xl border p-6 ${darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
                }`}
            >
              <h2 className="text-lg font-bold">
                {t.aboutGroup}
              </h2>

              <p
                className={`mt-4 text-sm leading-7 ${darkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                  }`}
              >
                {group.description ||
                  t.readyToLearn}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InfoCard
                  icon="👥"
                  label={t.members}
                  value={String(group.member_count)}
                  darkMode={darkMode}
                />

                <InfoCard
                  icon="👑"
                  label={t.owner}
                  value={group.owner_username}
                  darkMode={darkMode}
                />

                <InfoCard
                  icon="📅"
                  label={t.created}
                  value={createdDate}
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div
              className={`rounded-2xl border ${darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
                }`}
            >
              <div
                className={`border-b p-5 ${darkMode
                    ? "border-slate-800"
                    : "border-slate-200"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">
                      {t.members}
                    </h2>

                    <p
                      className={`mt-1 text-sm ${darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                        }`}
                    >
                      {t.studentsInGroup}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${darkMode
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
                      className={`flex items-center gap-3 border-b p-4 last:border-b-0 ${darkMode
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
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${darkMode
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
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${darkMode
                                  ? "bg-yellow-950 text-yellow-300"
                                  : "bg-yellow-50 text-yellow-600"
                                }`}
                            >
                              {t.owner}
                            </span>
                          )}
                        </div>

                        <p
                          className={`truncate text-xs ${darkMode
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
                          className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${darkMode
                              ? "text-red-400 hover:bg-red-950/50"
                              : "text-red-500 hover:bg-red-50"
                            }`}
                        >
                          {removingMemberId ===
                            member.id
                            ? "..."
                            : t.remove}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                {t.groupWorkspace}
              </h2>

              <p
                className={`mt-1 text-sm ${darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                  }`}
              >
                {t.workspaceDescription}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="#shared-notes"
                className={`rounded-2xl border p-5 transition ${darkMode
                    ? "border-indigo-900 bg-slate-900 hover:border-indigo-700"
                    : "border-indigo-100 bg-white hover:border-indigo-300"
                  }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                    }`}
                >
                  📝
                </div>

                <h3 className="mt-4 font-bold">
                  {t.sharedNotes}
                </h3>

                <p
                  className={`mt-1 text-sm leading-6 ${darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                    }`}
                >
                  {t.sharedNotesDescription}
                </p>

                <p className="mt-3 text-xs font-semibold text-indigo-600">
                  {notes.length}{" "}
                  {notes.length === 1
                    ? t.note
                    : t.notes}{" "}
                  →
                </p>
              </a>

              <button
                type="button"
                onClick={openMaterialForm}
                className={`rounded-2xl border p-5 text-left transition ${darkMode
                    ? "border-slate-800 bg-slate-900 hover:border-indigo-700"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                    }`}
                >
                  📚
                </div>

                <h3 className="mt-4 font-bold">
                  {t.materials}
                </h3>

                <p
                  className={`mt-1 text-sm leading-6 ${darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                    }`}
                >
                  {t.materialsDescription}
                </p>

                <p className="mt-3 text-xs font-semibold text-indigo-600">
                  {materials.length}{" "}
                  {materials.length === 1
                    ? t.material
                    : t.materialsPlural}{" "}
                  →
                </p>
              </button>

              <Link
                href={`/groups/${id}/sessions`}
                className={`block rounded-2xl border p-5 text-left transition ${darkMode
                    ? "border-slate-800 bg-slate-900 hover:border-indigo-700 hover:bg-slate-800"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                  }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                    }`}
                >
                  📅
                </div>

                <h3 className="mt-4 font-bold">
                  {t.studySessions}
                </h3>

                <p
                  className={`mt-1 text-sm leading-6 ${darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                    }`}
                >
                  {t.studySessionsDescription}
                </p>

                <p className="mt-3 text-xs font-semibold text-indigo-600">
                  {t.manageSessions}
                </p>
              </Link>
            </div>
          </section>

          <section
            id="materials-section"
            className={`mt-8 overflow-hidden rounded-2xl border ${darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
              }`}
          >
            <div
              className={`flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${darkMode
                  ? "border-slate-800"
                  : "border-slate-200"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                    }`}
                >
                  📚
                </div>

                <div>
                  <h2 className="font-bold">
                    {t.materials}
                  </h2>

                  <p
                    className={`mt-0.5 text-xs ${darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                      }`}
                  >
                    {t.studyFiles}
                  </p>
                </div>
              </div>

              {group.is_member ? (
                <button
                  type="button"
                  onClick={openMaterialForm}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {t.uploadMaterial}
                </button>
              ) : null}
            </div>

            {!group.is_member ? (
              <div className="p-10 text-center">
                <div className="text-3xl">🔒</div>

                <h3 className="mt-3 font-bold">
                  {t.joinToViewMaterials}
                </h3>

                <p
                  className={`mt-2 text-sm ${darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                    }`}
                >
                  {t.membersOnlyMaterials}
                </p>
              </div>
            ) : (
              <>
                {showMaterialForm && (
                  <div
                    className={`border-b p-5 ${darkMode
                        ? "border-slate-800 bg-slate-950/40"
                        : "border-slate-200 bg-slate-50/70"
                      }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">
                          {t.uploadMaterialTitle}
                        </h3>

                        <p
                          className={`mt-1 text-xs ${darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                            }`}
                        >
                          {t.uploadMaterialDescription}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={cancelMaterialUpload}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${darkMode
                            ? "text-slate-400 hover:bg-slate-800"
                            : "text-slate-500 hover:bg-slate-200"
                          }`}
                      >
                        {t.cancel}
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
                        placeholder={
                          t.materialTitlePlaceholder
                        }
                        maxLength={200}
                        className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${darkMode
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
                        placeholder={
                          t.materialDescriptionPlaceholder
                        }
                        maxLength={1000}
                        rows={3}
                        className={`w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${darkMode
                            ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-indigo-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                          }`}
                      />

                      <div
                        className={`rounded-xl border-2 border-dashed p-5 text-center ${darkMode
                            ? "border-slate-700 bg-slate-900"
                            : "border-slate-200 bg-white"
                          }`}
                      >
                        <div className="text-3xl">📎</div>

                        <p className="mt-2 text-sm font-semibold">
                          {selectedMaterialFile
                            ? selectedMaterialFile.name
                            : t.chooseFile}
                        </p>

                        <p
                          className={`mt-1 text-xs ${darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                            }`}
                        >
                          {t.maximumSize}
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
                          className={`mt-3 rounded-lg border px-4 py-2 text-xs font-semibold transition ${darkMode
                              ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {t.chooseFileButton}
                        </button>
                      </div>

                      {materialsError && (
                        <div
                          className={`rounded-xl border px-4 py-3 text-xs ${darkMode
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
                            ? t.uploadingMaterial
                            : t.uploadMaterialButton}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {!showMaterialForm &&
                  materialsError && (
                    <div
                      className={`border-b px-5 py-3 text-xs ${darkMode
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
                        <div className="text-2xl">⏳</div>

                        <p
                          className={`mt-2 text-sm ${darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                            }`}
                        >
                          {t.loadingMaterials}
                        </p>
                      </div>
                    </div>
                  ) : materials.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="text-4xl">📚</div>

                      <h3 className="mt-3 font-bold">
                        {t.noMaterials}
                      </h3>

                      <p
                        className={`mt-2 text-sm ${darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                          }`}
                      >
                        {t.firstMaterial}
                      </p>

                      <button
                        type="button"
                        onClick={openMaterialForm}
                        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        {t.uploadFirstMaterial}
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
                            className={`rounded-2xl border p-5 transition ${darkMode
                                ? "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                                : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${darkMode
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
                                  className={`mt-1 break-all text-xs ${darkMode
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
                                className={`mt-4 text-sm leading-6 ${darkMode
                                    ? "text-slate-300"
                                    : "text-slate-600"
                                  }`}
                              >
                                {material.description}
                              </p>
                            )}

                            <div
                              className={`mt-4 flex flex-wrap items-center gap-2 text-[10px] ${darkMode
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
                              className={`mt-5 flex items-center gap-3 border-t pt-3 ${darkMode
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
                                  ? t.opening
                                  : t.openDownload}
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
                                  className={`text-xs font-semibold ${darkMode
                                      ? "text-red-400 hover:text-red-300"
                                      : "text-red-500 hover:text-red-600"
                                    } disabled:opacity-50`}
                                >
                                  {deletingMaterialId ===
                                    material.id
                                    ? t.deleting
                                    : t.delete}
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

          <section
            id="shared-notes"
            className={`mt-8 overflow-hidden rounded-2xl border ${darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
              }`}
          >
            <div
              className={`flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${darkMode
                  ? "border-slate-800"
                  : "border-slate-200"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                    }`}
                >
                  📝
                </div>

                <div>
                  <h2 className="font-bold">
                    {t.sharedNotes}
                  </h2>

                  <p
                    className={`mt-0.5 text-xs ${darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                      }`}
                  >
                    {t.notesForEveryone}
                  </p>
                </div>
              </div>

              {group.is_member ? (
                <button
                  type="button"
                  onClick={startCreatingNote}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {t.newNote}
                </button>
              ) : null}
            </div>

            {!group.is_member ? (
              <div className="p-10 text-center">
                <div className="text-3xl">🔒</div>

                <h3 className="mt-3 font-bold">
                  {t.joinToViewNotes}
                </h3>

                <p
                  className={`mt-2 text-sm ${darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                    }`}
                >
                  {t.membersOnlyNotes}
                </p>
              </div>
            ) : (
              <>
                {showNoteEditor && (
                  <div
                    id="shared-notes-editor"
                    className={`border-b p-5 ${darkMode
                        ? "border-slate-800 bg-slate-950/40"
                        : "border-slate-200 bg-slate-50/70"
                      }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">
                          {editingNoteId !== null
                            ? t.editNote
                            : t.createNote}
                        </h3>

                        <p
                          className={`mt-1 text-xs ${darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                            }`}
                        >
                          {t.noteVisible}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={cancelNoteEditing}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${darkMode
                            ? "text-slate-400 hover:bg-slate-800"
                            : "text-slate-500 hover:bg-slate-200"
                          }`}
                      >
                        {t.cancel}
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
                        placeholder={
                          t.noteTitlePlaceholder
                        }
                        maxLength={200}
                        autoFocus
                        className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${darkMode
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
                        placeholder={
                          t.noteContentPlaceholder
                        }
                        maxLength={10000}
                        rows={6}
                        className={`w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${darkMode
                            ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-indigo-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                          }`}
                      />

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={`text-[10px] ${darkMode
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
                            ? t.saving
                            : editingNoteId !== null
                              ? t.saveChanges
                              : t.createNote}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {notesError && (
                  <div
                    className={`border-b px-5 py-3 text-xs ${darkMode
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
                        <div className="text-2xl">⏳</div>

                        <p
                          className={`mt-2 text-sm ${darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                            }`}
                        >
                          {t.loadingNotes}
                        </p>
                      </div>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="text-4xl">📝</div>

                      <h3 className="mt-3 font-bold">
                        {t.noSharedNotes}
                      </h3>

                      <p
                        className={`mt-2 text-sm ${darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                          }`}
                      >
                        {t.firstNote}
                      </p>

                      <button
                        type="button"
                        onClick={startCreatingNote}
                        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        {t.createFirstNote}
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
                            className={`rounded-2xl border p-5 transition ${darkMode
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
                                  className={`mt-2 flex flex-wrap items-center gap-2 text-[10px] ${darkMode
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
                              className={`mt-4 whitespace-pre-wrap break-words text-sm leading-7 ${darkMode
                                  ? "text-slate-300"
                                  : "text-slate-600"
                                }`}
                            >
                              {note.content ||
                                t.noContent}
                            </div>

                            {(canEdit ||
                              canDelete) && (
                                <div
                                  className={`mt-5 flex items-center gap-3 border-t pt-3 ${darkMode
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
                                      className={`text-xs font-semibold ${darkMode
                                          ? "text-slate-400 hover:text-white"
                                          : "text-slate-500 hover:text-slate-900"
                                        }`}
                                    >
                                      {t.edit}
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
                                      className={`text-xs font-semibold ${darkMode
                                          ? "text-red-400 hover:text-red-300"
                                          : "text-red-500 hover:text-red-600"
                                        } disabled:opacity-50`}
                                    >
                                      {deletingNoteId ===
                                        note.id
                                        ? t.deleting
                                        : t.delete}
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

          <section
            className={`mt-8 overflow-hidden rounded-2xl border ${darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
              }`}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${darkMode
                  ? "border-slate-800"
                  : "border-slate-200"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${darkMode
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                    }`}
                >
                  💬
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold">
                      {t.groupChat}
                    </h2>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${group.chat_enabled
                          ? darkMode
                            ? "bg-green-950 text-green-300"
                            : "bg-green-50 text-green-600"
                          : darkMode
                            ? "bg-red-950 text-red-300"
                            : "bg-red-50 text-red-600"
                        }`}
                    >
                      {group.chat_enabled
                        ? t.open
                        : t.closed}
                    </span>
                  </div>

                  <p
                    className={`mt-0.5 text-xs ${darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                      }`}
                  >
                    {t.chatDescription}
                  </p>
                </div>
              </div>

              {isGroupOwner && (
                <button
                  type="button"
                  onClick={toggleChat}
                  disabled={changingChat}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${group.chat_enabled
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
                      ? t.close
                      : t.open}
                </button>
              )}
            </div>

            {!group.is_member ? (
              <div className="p-8 text-center">
                <div className="text-3xl">🔒</div>

                <h3 className="mt-3 font-bold">
                  {t.joinToChat}
                </h3>

                <p
                  className={`mt-2 text-sm ${darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                    }`}
                >
                  {t.membersOnlyChat}
                </p>
              </div>
            ) : !group.chat_enabled ? (
              <div
                className={`p-8 text-center ${darkMode
                    ? "bg-slate-950/40"
                    : "bg-slate-50/70"
                  }`}
              >
                <div className="text-3xl">🔒</div>

                <h3 className="mt-3 font-bold">
                  {t.chatClosed}
                </h3>

                <p
                  className={`mt-2 text-sm ${darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                    }`}
                >
                  {t.chatClosedDescription}
                </p>

                {messages.length > 0 && (
                  <p
                    className={`mt-1 text-xs ${darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                      }`}
                  >
                    {t.previousMessages}
                  </p>
                )}
              </div>
            ) : (
              <>

              {(() => {
  const pinnedMessages = messages.filter(
    (item) => Boolean(item.is_pinned)
  );

  if (pinnedMessages.length === 0) {
    return null;
  }

  const currentPinnedIndex = Math.min(
    pinnedMessageIndex,
    pinnedMessages.length - 1
  );

  const pinnedMessage =
    pinnedMessages[currentPinnedIndex];

  return (
    <div
      className={`border-b px-4 py-3 ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-amber-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pinnedMessages.length <= 1}
          onClick={() =>
            setPinnedMessageIndex(
              currentPinnedIndex === 0
                ? pinnedMessages.length - 1
                : currentPinnedIndex - 1
            )
          }
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${
            pinnedMessages.length <= 1
              ? "cursor-not-allowed opacity-40"
              : darkMode
                ? "text-slate-200 hover:bg-slate-800"
                : "text-slate-700 hover:bg-amber-100"
          }`}
        >
          ←
        </button>

        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() =>
            scrollToMessage(pinnedMessage.id)
          }
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base">
              📌
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-[11px] font-bold ${
                  darkMode
                    ? "text-amber-300"
                    : "text-amber-700"
                }`}
              >
                Pinned message
              </p>

              <p
                className={`truncate text-xs ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                <span className="font-semibold">
                  {pinnedMessage.username}:
                </span>{" "}
                {pinnedMessage.message ||
                  (pinnedMessage.media_type === "image"
                    ? "📷 Image"
                    : pinnedMessage.media_type === "video"
                      ? "🎥 Video"
                      : pinnedMessage.media_type === "audio"
                        ? "🎙️ Voice message"
                        : "Pinned message")}
              </p>
            </div>
          </div>
        </div>

        <span
          className={`shrink-0 text-[10px] font-semibold ${
            darkMode
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          {currentPinnedIndex + 1}/
          {pinnedMessages.length}
        </span>

        <button
          type="button"
          disabled={pinnedMessages.length <= 1}
          onClick={() =>
            setPinnedMessageIndex(
              currentPinnedIndex ===
                pinnedMessages.length - 1
                ? 0
                : currentPinnedIndex + 1
            )
          }
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${
            pinnedMessages.length <= 1
              ? "cursor-not-allowed opacity-40"
              : darkMode
                ? "text-slate-200 hover:bg-slate-800"
                : "text-slate-700 hover:bg-amber-100"
          }`}
        >
          →
        </button>

        {(pinnedMessage.user_id === currentUserId ||
          isGroupOwner) && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              togglePinMessage(
                pinnedMessage.id,
                true
              );
            }}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${
              darkMode
                ? "text-amber-300 hover:bg-slate-800"
                : "text-amber-700 hover:bg-amber-100"
            }`}
          >
            Unpin
          </button>
        )}
      </div>
    </div>
  );
})()}
                <div
                  className={`h-[280px] overflow-y-auto p-4 ${darkMode
                      ? "bg-slate-950/50"
                      : "bg-slate-50/70"
                    }`}
                >
                  {messagesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl">⏳</div>

                        <p
                          className={`mt-2 text-sm ${darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                            }`}
                        >
                          {t.loadingMessages}
                        </p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl">💬</div>

                        <h3 className="mt-2 font-bold">
                          {t.noMessages}
                        </h3>

                        <p
                          className={`mt-1 text-sm ${darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                            }`}
                        >
                          {t.startConversation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((item) => {
  const mine =
    item.user_id === currentUserId;

  const canEdit =
    mine || isGroupOwner;

  const canDelete =
  mine || isGroupOwner;

const canPin =
  mine || isGroupOwner;

const isEditing =
  editingMessageId === item.id;

  const mediaUrl = (
  item as typeof item & {
    media_url?: string | null;
    media_type?: "image" | "video" | "audio" | null;
  }
).media_url;

const mediaType = (
  item as typeof item & {
    media_url?: string | null;
    media_type?: "image" | "video" | "audio" | null;
  }
).media_type;

  return (
    <div
  id={`group-message-${item.id}`}
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
              {t.owner}
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
                onClick={cancelEditing}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={() =>
                  saveEdit(item.id)
                }
                disabled={
                  savingEdit ||
                  !editText.trim()
                }
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {savingEdit
                  ? t.saving
                  : t.save}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-2xl ${
              mine
                ? "rounded-br-md bg-indigo-600 text-white"
                : darkMode
                  ? "rounded-bl-md bg-slate-800 text-slate-200"
                  : "rounded-bl-md bg-white text-slate-800"
            }`}
          >
            {mediaUrl && mediaType === "image" && (
              <img
                src={mediaUrl}
                alt="Shared image"
                className="max-h-[350px] max-w-[350px] rounded-xl object-contain"
              />
            )}

            {mediaUrl && mediaType === "video" && (
              <video
                src={mediaUrl}
                controls
                preload="metadata"
                className="max-h-[350px] max-w-[400px] rounded-xl"
              />
            )}

            {mediaUrl && mediaType === "audio" && (
  <div className="flex min-w-[280px] items-center gap-3 px-3 py-3">
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        mine
          ? "bg-indigo-500"
          : darkMode
            ? "bg-slate-700"
            : "bg-slate-100"
      }`}
    >
      🎙️
    </div>

    <audio
      src={mediaUrl}
      controls
      preload="metadata"
      className="h-10 w-full max-w-[300px]"
    />
  </div>
)}

{item.message && (
  <p className="whitespace-pre-wrap break-words px-4 py-2.5 text-sm">
    {item.message}
  </p>
)}

            {item.message && (
              <p
                className={`whitespace-pre-wrap break-words text-sm ${
                  mediaUrl
                    ? "px-4 py-2.5"
                    : "px-4 py-2.5"
                }`}
              >
                {item.message}
              </p>
            )}
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
            (canEdit || canDelete) && (
              <>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() =>
                      startEditing(item)
                    }
                    className={`text-[10px] font-semibold ${
                      darkMode
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {t.edit}
                  </button>
                )}

{canPin && (
  <button
    type="button"
    onClick={() =>
      togglePinMessage(
        item.id,
        Boolean(item.is_pinned)
      )
    }
    className={`text-[10px] font-semibold ${
      item.is_pinned
        ? darkMode
          ? "text-amber-300 hover:text-amber-200"
          : "text-amber-600 hover:text-amber-700"
        : darkMode
          ? "text-slate-400 hover:text-slate-300"
          : "text-slate-500 hover:text-slate-600"
    }`}
  >
    {item.is_pinned
      ? "📌 Unpin"
      : "📌 Pin"}
  </button>
)}

                {canDelete && (
                  <button
                    type="button"
                    onClick={() =>
                      deleteMessage(item.id)
                    }
                    className={`text-[10px] font-semibold ${
                      darkMode
                        ? "text-red-400 hover:text-red-300"
                        : "text-red-500 hover:text-red-600"
                    }`}
                  >
                    {t.delete}
                  </button>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
})}

<div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {chatError && (
                  <div
                    className={`border-t px-5 py-2.5 text-xs ${darkMode
                        ? "border-slate-800 bg-red-950/30 text-red-300"
                        : "border-slate-200 bg-red-50 text-red-600"
                      }`}
                  >
                    {chatError}
                  </div>
                )}

                <form
  onSubmit={sendMessage}
  className={`relative border-t p-3 ${
    darkMode
      ? "border-slate-800"
      : "border-slate-200"
  }`}
>
  {selectedChatFile && (
    <div
      className={`mb-2 flex items-center gap-3 rounded-xl border p-2 ${
        darkMode
          ? "border-slate-700 bg-slate-800"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      {selectedChatFile.type.startsWith("image/") ? (
        <img
          src={URL.createObjectURL(selectedChatFile)}
          alt="Selected"
          className="h-16 w-16 rounded-lg object-cover"
        />
      ) : selectedChatFile.type.startsWith("audio/") ? (
        <>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
              darkMode
                ? "bg-slate-700"
                : "bg-slate-200"
            }`}
          >
            🎙️
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-semibold ${
                darkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Voice message
            </p>

            <audio
              src={URL.createObjectURL(selectedChatFile)}
              controls
              className="mt-1 w-full max-w-[300px]"
            />
          </div>
        </>
      ) : (
        <>
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-2xl ${
              darkMode
                ? "bg-slate-700"
                : "bg-slate-200"
            }`}
          >
            🎥
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-semibold ${
                darkMode
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              Video selected
            </p>

            <p
              className={`truncate text-[11px] ${
                darkMode
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              {selectedChatFile.name}
            </p>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => {
          setSelectedChatFile(null);

          if (chatFileInputRef.current) {
            chatFileInputRef.current.value = "";
          }
        }}
        className={`rounded-lg px-2 py-1 text-lg ${
          darkMode
            ? "text-slate-400 hover:bg-slate-700 hover:text-white"
            : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
        }`}
        title="Remove file"
      >
        ✕
      </button>
    </div>
  )}

  {showEmojiPicker && (
    <div
      ref={emojiPickerRef}
      className="absolute bottom-full left-0 z-50 mb-2"
    >
      <EmojiPicker
        onEmojiClick={(emojiData: EmojiClickData) => {
          setMessageText(
            (current) =>
              current + emojiData.emoji
          );
        }}
        theme={
          darkMode
            ? Theme.DARK
            : Theme.LIGHT
        }
        width={350}
        height={400}
        searchDisabled={false}
        previewConfig={{
          showPreview: false,
        }}
      />
    </div>
  )}

  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => {
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }}
      className={`rounded-xl border px-3 py-2.5 text-xl transition ${
        isRecording
          ? "border-red-500 bg-red-500 text-white"
          : darkMode
            ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
            : "border-slate-200 bg-white hover:bg-slate-100"
      }`}
      title={
        isRecording
          ? "Stop recording"
          : "Record voice"
      }
    >
      {isRecording ? "⏹️" : "🎙️"}
    </button>

    {isRecording && (
      <div
        className={`flex items-center rounded-xl px-2 text-xs font-semibold ${
          darkMode
            ? "text-red-400"
            : "text-red-500"
        }`}
      >
        🔴{" "}
        {String(
          Math.floor(recordingTime / 60)
        ).padStart(2, "0")}
        :
        {String(
          recordingTime % 60
        ).padStart(2, "0")}
      </div>
    )}

    <input
      ref={chatFileInputRef}
      type="file"
      accept="image/*,video/*"
      className="hidden"
      onChange={(event) => {
        const file =
          event.target.files?.[0];

        if (!file) return;

        if (
          file.size >
          20 * 1024 * 1024
        ) {
          setChatError(
            "File size cannot be larger than 20 MB."
          );
          event.target.value = "";
          return;
        }

        if (
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/")
        ) {
          setChatError(
            "Only images and videos are allowed."
          );
          event.target.value = "";
          return;
        }

        setChatError("");
        setSelectedChatFile(file);
      }}
    />

    <button
      type="button"
      onClick={() => {
        chatFileInputRef.current?.click();
      }}
      className={`rounded-xl border px-3 py-2.5 text-xl ${
        darkMode
          ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
          : "border-slate-200 bg-white hover:bg-slate-100"
      }`}
      title="Add image or video"
    >
      +
    </button>

    <input
      value={messageText}
      onChange={(event) =>
        setMessageText(event.target.value)
      }
      placeholder={t.writeMessage}
      maxLength={2000}
      className={`min-w-0 flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none ${
        darkMode
          ? "border-slate-700 bg-slate-800 text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    />

    <button
      type="button"
      onClick={() =>
        setShowEmojiPicker(
          (current) => !current
        )
      }
      className={`rounded-xl border px-3 py-2.5 text-xl ${
        darkMode
          ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
          : "border-slate-200 bg-white hover:bg-slate-100"
      }`}
      title="Emoji"
    >
      😊
    </button>

    <button
      type="submit"
      disabled={
        sending ||
        (!messageText.trim() &&
          !selectedChatFile)
      }
      className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
    >
      {sending ? "..." : t.send}
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
      className={`rounded-xl p-4 ${darkMode
          ? "bg-slate-800"
          : "bg-slate-50"
        }`}
    >
      <div className="text-lg">{icon}</div>

      <p
        className={`mt-3 text-xs ${darkMode
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
