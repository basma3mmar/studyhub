"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type ScheduleItem = {
  id: number;
  day: string;
  time: string;
  subject: string;
  title: string;
  type: "Study" | "Lecture" | "Review";
};

const days = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
];

const subjects = [
  "Mathematics",
  "Programming",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "General",
];

const plannerTranslations: Record<
  string,
  {
    title: string;
    description: string;
    addSession: string;
    studySessions: string;
    studyDays: string;
    subjectsLabel: string;
    scheduleFor: string;
    session: string;
    sessions: string;
    loading: string;
    nothingPlanned: string;
    nothingDescription: string;
    weeklyOverview: string;
    weeklyDescription: string;
    total: string;
    addStudySession: string;
    addDescription: string;
    day: string;
    time: string;
    sessionTitle: string;
    titlePlaceholder: string;
    subject: string;
    type: string;
    cancel: string;
    adding: string;
    delete: string;
    loadError: string;
    createError: string;
    deleteError: string;
    enterTitle: string;
    types: {
      Study: string;
      Lecture: string;
      Review: string;
    };
    subjectNames: Record<string, string>;
    days: Record<string, string>;
  }
> = {
  en: {
    title: "Study Planner",
    description: "Plan your study sessions and stay organized.",
    addSession: "Add Session",
    studySessions: "Study Sessions",
    studyDays: "Study Days",
    subjectsLabel: "Subjects",
    scheduleFor: "Schedule for",
    session: "session",
    sessions: "sessions",
    loading: "Loading your planner...",
    nothingPlanned: "Nothing planned yet",
    nothingDescription:
      "Add a study session to start building your schedule.",
    weeklyOverview: "Weekly Overview",
    weeklyDescription:
      "Your planned study sessions this week.",
    total: "total",
    addStudySession: "Add Study Session",
    addDescription: "Add a new session to your planner.",
    day: "Day",
    time: "Time",
    sessionTitle: "Session title",
    titlePlaceholder: "e.g. Study Chapter 5",
    subject: "Subject",
    type: "Type",
    cancel: "Cancel",
    adding: "Adding...",
    delete: "Delete",
    loadError: "Failed to load planner.",
    createError: "Failed to create session.",
    deleteError: "Failed to delete session.",
    enterTitle: "Please enter a session title.",
    types: {
      Study: "Study",
      Lecture: "Lecture",
      Review: "Review",
    },
    subjectNames: {
      Mathematics: "Mathematics",
      Programming: "Programming",
      Physics: "Physics",
      Chemistry: "Chemistry",
      Biology: "Biology",
      English: "English",
      General: "General",
    },
    days: {
      Saturday: "Saturday",
      Sunday: "Sunday",
      Monday: "Monday",
      Tuesday: "Tuesday",
      Wednesday: "Wednesday",
    },
  },

  ar: {
    title: "مخطط الدراسة",
    description: "خطط لجلسات المذاكرة ونظم وقتك.",
    addSession: "إضافة جلسة",
    studySessions: "جلسات المذاكرة",
    studyDays: "أيام المذاكرة",
    subjectsLabel: "المواد",
    scheduleFor: "جدول يوم",
    session: "جلسة",
    sessions: "جلسات",
    loading: "جاري تحميل المخطط...",
    nothingPlanned: "لا توجد جلسات مخططة بعد",
    nothingDescription:
      "أضف جلسة مذاكرة لبدء بناء جدولك.",
    weeklyOverview: "نظرة أسبوعية",
    weeklyDescription:
      "جلسات المذاكرة المخططة لهذا الأسبوع.",
    total: "إجمالي",
    addStudySession: "إضافة جلسة مذاكرة",
    addDescription: "أضف جلسة جديدة إلى مخططك.",
    day: "اليوم",
    time: "الوقت",
    sessionTitle: "عنوان الجلسة",
    titlePlaceholder: "مثال: مذاكرة الفصل الخامس",
    subject: "المادة",
    type: "النوع",
    cancel: "إلغاء",
    adding: "جاري الإضافة...",
    delete: "حذف",
    loadError: "فشل تحميل المخطط.",
    createError: "فشل إنشاء الجلسة.",
    deleteError: "فشل حذف الجلسة.",
    enterTitle: "من فضلك أدخل عنوان الجلسة.",
    types: {
      Study: "مذاكرة",
      Lecture: "محاضرة",
      Review: "مراجعة",
    },
    subjectNames: {
      Mathematics: "الرياضيات",
      Programming: "البرمجة",
      Physics: "الفيزياء",
      Chemistry: "الكيمياء",
      Biology: "الأحياء",
      English: "اللغة الإنجليزية",
      General: "عام",
    },
    days: {
      Saturday: "السبت",
      Sunday: "الأحد",
      Monday: "الاثنين",
      Tuesday: "الثلاثاء",
      Wednesday: "الأربعاء",
    },
  },

  es: {
    title: "Planificador de estudio",
    description:
      "Planifica tus sesiones de estudio y mantente organizado.",
    addSession: "Añadir sesión",
    studySessions: "Sesiones de estudio",
    studyDays: "Días de estudio",
    subjectsLabel: "Materias",
    scheduleFor: "Horario para",
    session: "sesión",
    sessions: "sesiones",
    loading: "Cargando tu planificador...",
    nothingPlanned: "Nada planeado todavía",
    nothingDescription:
      "Añade una sesión para comenzar a crear tu horario.",
    weeklyOverview: "Resumen semanal",
    weeklyDescription:
      "Tus sesiones de estudio planificadas esta semana.",
    total: "total",
    addStudySession: "Añadir sesión de estudio",
    addDescription:
      "Añade una nueva sesión a tu planificador.",
    day: "Día",
    time: "Hora",
    sessionTitle: "Título de la sesión",
    titlePlaceholder: "Ej.: Estudiar el capítulo 5",
    subject: "Materia",
    type: "Tipo",
    cancel: "Cancelar",
    adding: "Añadiendo...",
    delete: "Eliminar",
    loadError: "No se pudo cargar el planificador.",
    createError: "No se pudo crear la sesión.",
    deleteError: "No se pudo eliminar la sesión.",
    enterTitle: "Introduce un título para la sesión.",
    types: {
      Study: "Estudio",
      Lecture: "Clase",
      Review: "Repaso",
    },
    subjectNames: {
      Mathematics: "Matemáticas",
      Programming: "Programación",
      Physics: "Física",
      Chemistry: "Química",
      Biology: "Biología",
      English: "Inglés",
      General: "General",
    },
    days: {
      Saturday: "Sábado",
      Sunday: "Domingo",
      Monday: "Lunes",
      Tuesday: "Martes",
      Wednesday: "Miércoles",
    },
  },

  fr: {
    title: "Planificateur d'étude",
    description:
      "Planifiez vos sessions d'étude et restez organisé.",
    addSession: "Ajouter une session",
    studySessions: "Sessions d'étude",
    studyDays: "Jours d'étude",
    subjectsLabel: "Matières",
    scheduleFor: "Programme du",
    session: "session",
    sessions: "sessions",
    loading: "Chargement de votre planning...",
    nothingPlanned: "Rien de prévu pour le moment",
    nothingDescription:
      "Ajoutez une session pour commencer votre planning.",
    weeklyOverview: "Aperçu hebdomadaire",
    weeklyDescription:
      "Vos sessions d'étude prévues cette semaine.",
    total: "total",
    addStudySession: "Ajouter une session d'étude",
    addDescription:
      "Ajoutez une nouvelle session à votre planning.",
    day: "Jour",
    time: "Heure",
    sessionTitle: "Titre de la session",
    titlePlaceholder: "Ex. : Étudier le chapitre 5",
    subject: "Matière",
    type: "Type",
    cancel: "Annuler",
    adding: "Ajout...",
    delete: "Supprimer",
    loadError: "Impossible de charger le planning.",
    createError: "Impossible de créer la session.",
    deleteError: "Impossible de supprimer la session.",
    enterTitle: "Veuillez saisir un titre de session.",
    types: {
      Study: "Étude",
      Lecture: "Cours",
      Review: "Révision",
    },
    subjectNames: {
      Mathematics: "Mathématiques",
      Programming: "Programmation",
      Physics: "Physique",
      Chemistry: "Chimie",
      Biology: "Biologie",
      English: "Anglais",
      General: "Général",
    },
    days: {
      Saturday: "Samedi",
      Sunday: "Dimanche",
      Monday: "Lundi",
      Tuesday: "Mardi",
      Wednesday: "Mercredi",
    },
  },

  pt: {
    title: "Planejador de estudos",
    description:
      "Planeje suas sessões de estudo e mantenha-se organizado.",
    addSession: "Adicionar sessão",
    studySessions: "Sessões de estudo",
    studyDays: "Dias de estudo",
    subjectsLabel: "Disciplinas",
    scheduleFor: "Agenda de",
    session: "sessão",
    sessions: "sessões",
    loading: "Carregando seu planejador...",
    nothingPlanned: "Nada planejado ainda",
    nothingDescription:
      "Adicione uma sessão para começar seu cronograma.",
    weeklyOverview: "Visão semanal",
    weeklyDescription:
      "Suas sessões de estudo planejadas nesta semana.",
    total: "total",
    addStudySession: "Adicionar sessão de estudo",
    addDescription:
      "Adicione uma nova sessão ao seu planejador.",
    day: "Dia",
    time: "Horário",
    sessionTitle: "Título da sessão",
    titlePlaceholder: "Ex.: Estudar capítulo 5",
    subject: "Disciplina",
    type: "Tipo",
    cancel: "Cancelar",
    adding: "Adicionando...",
    delete: "Excluir",
    loadError: "Falha ao carregar o planejador.",
    createError: "Falha ao criar a sessão.",
    deleteError: "Falha ao excluir a sessão.",
    enterTitle: "Digite um título para a sessão.",
    types: {
      Study: "Estudo",
      Lecture: "Aula",
      Review: "Revisão",
    },
    subjectNames: {
      Mathematics: "Matemática",
      Programming: "Programação",
      Physics: "Física",
      Chemistry: "Química",
      Biology: "Biologia",
      English: "Inglês",
      General: "Geral",
    },
    days: {
      Saturday: "Sábado",
      Sunday: "Domingo",
      Monday: "Segunda-feira",
      Tuesday: "Terça-feira",
      Wednesday: "Quarta-feira",
    },
  },

  it: {
    title: "Pianificatore di studio",
    description:
      "Pianifica le tue sessioni di studio e resta organizzato.",
    addSession: "Aggiungi sessione",
    studySessions: "Sessioni di studio",
    studyDays: "Giorni di studio",
    subjectsLabel: "Materie",
    scheduleFor: "Programma di",
    session: "sessione",
    sessions: "sessioni",
    loading: "Caricamento del pianificatore...",
    nothingPlanned: "Niente in programma",
    nothingDescription:
      "Aggiungi una sessione per iniziare a creare il tuo programma.",
    weeklyOverview: "Panoramica settimanale",
    weeklyDescription:
      "Le tue sessioni di studio programmate questa settimana.",
    total: "totale",
    addStudySession: "Aggiungi sessione di studio",
    addDescription:
      "Aggiungi una nuova sessione al tuo pianificatore.",
    day: "Giorno",
    time: "Ora",
    sessionTitle: "Titolo della sessione",
    titlePlaceholder: "Es.: Studiare il capitolo 5",
    subject: "Materia",
    type: "Tipo",
    cancel: "Annulla",
    adding: "Aggiunta...",
    delete: "Elimina",
    loadError:
      "Impossibile caricare il pianificatore.",
    createError:
      "Impossibile creare la sessione.",
    deleteError:
      "Impossibile eliminare la sessione.",
    enterTitle:
      "Inserisci un titolo per la sessione.",
    types: {
      Study: "Studio",
      Lecture: "Lezione",
      Review: "Ripasso",
    },
    subjectNames: {
      Mathematics: "Matematica",
      Programming: "Programmazione",
      Physics: "Fisica",
      Chemistry: "Chimica",
      Biology: "Biologia",
      English: "Inglese",
      General: "Generale",
    },
    days: {
      Saturday: "Sabato",
      Sunday: "Domenica",
      Monday: "Lunedì",
      Tuesday: "Martedì",
      Wednesday: "Mercoledì",
    },
  },

  de: {
    title: "Lernplaner",
    description:
      "Plane deine Lerneinheiten und bleibe organisiert.",
    addSession: "Sitzung hinzufügen",
    studySessions: "Lernsitzungen",
    studyDays: "Lerntage",
    subjectsLabel: "Fächer",
    scheduleFor: "Zeitplan für",
    session: "Sitzung",
    sessions: "Sitzungen",
    loading: "Dein Lernplan wird geladen...",
    nothingPlanned: "Noch nichts geplant",
    nothingDescription:
      "Füge eine Lerneinheit hinzu, um deinen Plan zu erstellen.",
    weeklyOverview: "Wochenübersicht",
    weeklyDescription:
      "Deine geplanten Lernsitzungen für diese Woche.",
    total: "gesamt",
    addStudySession: "Lernsitzung hinzufügen",
    addDescription:
      "Füge eine neue Sitzung zu deinem Lernplan hinzu.",
    day: "Tag",
    time: "Zeit",
    sessionTitle: "Titel der Sitzung",
    titlePlaceholder: "z. B. Kapitel 5 lernen",
    subject: "Fach",
    type: "Typ",
    cancel: "Abbrechen",
    adding: "Wird hinzugefügt...",
    delete: "Löschen",
    loadError:
      "Der Lernplan konnte nicht geladen werden.",
    createError:
      "Die Sitzung konnte nicht erstellt werden.",
    deleteError:
      "Die Sitzung konnte nicht gelöscht werden.",
    enterTitle:
      "Bitte gib einen Sitzungstitel ein.",
    types: {
      Study: "Lernen",
      Lecture: "Vorlesung",
      Review: "Wiederholung",
    },
    subjectNames: {
      Mathematics: "Mathematik",
      Programming: "Programmierung",
      Physics: "Physik",
      Chemistry: "Chemie",
      Biology: "Biologie",
      English: "Englisch",
      General: "Allgemein",
    },
    days: {
      Saturday: "Samstag",
      Sunday: "Sonntag",
      Monday: "Montag",
      Tuesday: "Dienstag",
      Wednesday: "Mittwoch",
    },
  },

  zh: {
    title: "学习计划",
    description: "规划学习时间，保持井然有序。",
    addSession: "添加学习计划",
    studySessions: "学习课程",
    studyDays: "学习天数",
    subjectsLabel: "科目",
    scheduleFor: "日程",
    session: "课程",
    sessions: "课程",
    loading: "正在加载学习计划...",
    nothingPlanned: "还没有计划",
    nothingDescription:
      "添加学习课程，开始创建你的学习计划。",
    weeklyOverview: "每周概览",
    weeklyDescription:
      "本周计划的学习课程。",
    total: "总计",
    addStudySession: "添加学习课程",
    addDescription:
      "向学习计划添加新的课程。",
    day: "日期",
    time: "时间",
    sessionTitle: "课程标题",
    titlePlaceholder: "例如：学习第五章",
    subject: "科目",
    type: "类型",
    cancel: "取消",
    adding: "添加中...",
    delete: "删除",
    loadError: "加载学习计划失败。",
    createError: "创建课程失败。",
    deleteError: "删除课程失败。",
    enterTitle: "请输入课程标题。",
    types: {
      Study: "学习",
      Lecture: "讲座",
      Review: "复习",
    },
    subjectNames: {
      Mathematics: "数学",
      Programming: "编程",
      Physics: "物理",
      Chemistry: "化学",
      Biology: "生物",
      English: "英语",
      General: "综合",
    },
    days: {
      Saturday: "星期六",
      Sunday: "星期日",
      Monday: "星期一",
      Tuesday: "星期二",
      Wednesday: "星期三",
    },
  },

  ja: {
    title: "学習プランナー",
    description:
      "学習セッションを計画して、整理整頓しましょう。",
    addSession: "セッションを追加",
    studySessions: "学習セッション",
    studyDays: "学習日数",
    subjectsLabel: "科目",
    scheduleFor: "スケジュール",
    session: "セッション",
    sessions: "セッション",
    loading: "プランナーを読み込んでいます...",
    nothingPlanned: "まだ予定がありません",
    nothingDescription:
      "学習セッションを追加して予定を作りましょう。",
    weeklyOverview: "週間概要",
    weeklyDescription:
      "今週予定されている学習セッションです。",
    total: "合計",
    addStudySession: "学習セッションを追加",
    addDescription:
      "新しいセッションをプランナーに追加します。",
    day: "曜日",
    time: "時間",
    sessionTitle: "セッション名",
    titlePlaceholder: "例：第5章を勉強する",
    subject: "科目",
    type: "種類",
    cancel: "キャンセル",
    adding: "追加中...",
    delete: "削除",
    loadError:
      "プランナーの読み込みに失敗しました。",
    createError:
      "セッションの作成に失敗しました。",
    deleteError:
      "セッションの削除に失敗しました。",
    enterTitle:
      "セッション名を入力してください。",
    types: {
      Study: "勉強",
      Lecture: "講義",
      Review: "復習",
    },
    subjectNames: {
      Mathematics: "数学",
      Programming: "プログラミング",
      Physics: "物理",
      Chemistry: "化学",
      Biology: "生物",
      English: "英語",
      General: "一般",
    },
    days: {
      Saturday: "土曜日",
      Sunday: "日曜日",
      Monday: "月曜日",
      Tuesday: "火曜日",
      Wednesday: "水曜日",
    },
  },

  ko: {
    title: "학습 플래너",
    description:
      "공부 시간을 계획하고 체계적으로 관리하세요.",
    addSession: "세션 추가",
    studySessions: "학습 세션",
    studyDays: "학습 일수",
    subjectsLabel: "과목",
    scheduleFor: "일정",
    session: "세션",
    sessions: "세션",
    loading: "플래너를 불러오는 중...",
    nothingPlanned: "아직 계획이 없습니다",
    nothingDescription:
      "학습 세션을 추가하여 일정을 만들어 보세요.",
    weeklyOverview: "주간 개요",
    weeklyDescription:
      "이번 주에 계획된 학습 세션입니다.",
    total: "총",
    addStudySession: "학습 세션 추가",
    addDescription:
      "플래너에 새로운 세션을 추가하세요.",
    day: "요일",
    time: "시간",
    sessionTitle: "세션 제목",
    titlePlaceholder: "예: 5장 공부하기",
    subject: "과목",
    type: "유형",
    cancel: "취소",
    adding: "추가 중...",
    delete: "삭제",
    loadError:
      "플래너를 불러오지 못했습니다.",
    createError:
      "세션을 생성하지 못했습니다.",
    deleteError:
      "세션을 삭제하지 못했습니다.",
    enterTitle:
      "세션 제목을 입력하세요.",
    types: {
      Study: "공부",
      Lecture: "강의",
      Review: "복습",
    },
    subjectNames: {
      Mathematics: "수학",
      Programming: "프로그래밍",
      Physics: "물리학",
      Chemistry: "화학",
      Biology: "생물학",
      English: "영어",
      General: "일반",
    },
    days: {
      Saturday: "토요일",
      Sunday: "일요일",
      Monday: "월요일",
      Tuesday: "화요일",
      Wednesday: "수요일",
    },
  },

  ru: {
    title: "Планировщик учебы",
    description:
      "Планируйте учебные занятия и оставайтесь организованными.",
    addSession: "Добавить занятие",
    studySessions: "Учебные занятия",
    studyDays: "Учебные дни",
    subjectsLabel: "Предметы",
    scheduleFor: "Расписание на",
    session: "занятие",
    sessions: "занятий",
    loading: "Загрузка планировщика...",
    nothingPlanned: "Пока ничего не запланировано",
    nothingDescription:
      "Добавьте учебное занятие, чтобы создать расписание.",
    weeklyOverview: "Обзор недели",
    weeklyDescription:
      "Ваши запланированные занятия на этой неделе.",
    total: "всего",
    addStudySession: "Добавить учебное занятие",
    addDescription:
      "Добавьте новое занятие в планировщик.",
    day: "День",
    time: "Время",
    sessionTitle: "Название занятия",
    titlePlaceholder: "Напр.: Изучить главу 5",
    subject: "Предмет",
    type: "Тип",
    cancel: "Отмена",
    adding: "Добавление...",
    delete: "Удалить",
    loadError:
      "Не удалось загрузить планировщик.",
    createError:
      "Не удалось создать занятие.",
    deleteError:
      "Не удалось удалить занятие.",
    enterTitle:
      "Введите название занятия.",
    types: {
      Study: "Учеба",
      Lecture: "Лекция",
      Review: "Повторение",
    },
    subjectNames: {
      Mathematics: "Математика",
      Programming: "Программирование",
      Physics: "Физика",
      Chemistry: "Химия",
      Biology: "Биология",
      English: "Английский",
      General: "Общее",
    },
    days: {
      Saturday: "Суббота",
      Sunday: "Воскресенье",
      Monday: "Понедельник",
      Tuesday: "Вторник",
      Wednesday: "Среда",
    },
  },

  tr: {
    title: "Çalışma Planlayıcı",
    description:
      "Çalışma oturumlarını planla ve düzenli kal.",
    addSession: "Oturum Ekle",
    studySessions: "Çalışma Oturumları",
    studyDays: "Çalışma Günleri",
    subjectsLabel: "Dersler",
    scheduleFor: "Program",
    session: "oturum",
    sessions: "oturum",
    loading: "Planlayıcın yükleniyor...",
    nothingPlanned: "Henüz plan yok",
    nothingDescription:
      "Programını oluşturmaya başlamak için bir çalışma oturumu ekle.",
    weeklyOverview: "Haftalık Genel Bakış",
    weeklyDescription:
      "Bu hafta planlanan çalışma oturumların.",
    total: "toplam",
    addStudySession: "Çalışma Oturumu Ekle",
    addDescription:
      "Planlayıcına yeni bir oturum ekle.",
    day: "Gün",
    time: "Saat",
    sessionTitle: "Oturum başlığı",
    titlePlaceholder: "Örn. 5. Bölümü çalış",
    subject: "Ders",
    type: "Tür",
    cancel: "İptal",
    adding: "Ekleniyor...",
    delete: "Sil",
    loadError: "Planlayıcı yüklenemedi.",
    createError:
      "Oturum oluşturulamadı.",
    deleteError:
      "Oturum silinemedi.",
    enterTitle:
      "Lütfen oturum başlığı gir.",
    types: {
      Study: "Çalışma",
      Lecture: "Ders",
      Review: "Tekrar",
    },
    subjectNames: {
      Mathematics: "Matematik",
      Programming: "Programlama",
      Physics: "Fizik",
      Chemistry: "Kimya",
      Biology: "Biyoloji",
      English: "İngilizce",
      General: "Genel",
    },
    days: {
      Saturday: "Cumartesi",
      Sunday: "Pazar",
      Monday: "Pazartesi",
      Tuesday: "Salı",
      Wednesday: "Çarşamba",
    },
  },

  hi: {
    title: "स्टडी प्लानर",
    description:
      "अपने अध्ययन सत्रों की योजना बनाएं और व्यवस्थित रहें।",
    addSession: "सत्र जोड़ें",
    studySessions: "अध्ययन सत्र",
    studyDays: "अध्ययन के दिन",
    subjectsLabel: "विषय",
    scheduleFor: "शेड्यूल",
    session: "सत्र",
    sessions: "सत्र",
    loading: "आपका प्लानर लोड हो रहा है...",
    nothingPlanned: "अभी कुछ योजनाबद्ध नहीं है",
    nothingDescription:
      "अपना शेड्यूल बनाना शुरू करने के लिए अध्ययन सत्र जोड़ें।",
    weeklyOverview: "साप्ताहिक अवलोकन",
    weeklyDescription:
      "इस सप्ताह के लिए आपके नियोजित अध्ययन सत्र।",
    total: "कुल",
    addStudySession: "अध्ययन सत्र जोड़ें",
    addDescription:
      "अपने प्लानर में नया सत्र जोड़ें।",
    day: "दिन",
    time: "समय",
    sessionTitle: "सत्र का शीर्षक",
    titlePlaceholder: "उदाहरण: अध्याय 5 पढ़ें",
    subject: "विषय",
    type: "प्रकार",
    cancel: "रद्द करें",
    adding: "जोड़ा जा रहा है...",
    delete: "हटाएं",
    loadError: "प्लानर लोड नहीं हो सका।",
    createError:
      "सत्र बनाया नहीं जा सका।",
    deleteError:
      "सत्र हटाया नहीं जा सका।",
    enterTitle:
      "कृपया सत्र का शीर्षक दर्ज करें।",
    types: {
      Study: "अध्ययन",
      Lecture: "व्याख्यान",
      Review: "पुनरावृत्ति",
    },
    subjectNames: {
      Mathematics: "गणित",
      Programming: "प्रोग्रामिंग",
      Physics: "भौतिकी",
      Chemistry: "रसायन विज्ञान",
      Biology: "जीव विज्ञान",
      English: "अंग्रेज़ी",
      General: "सामान्य",
    },
    days: {
      Saturday: "शनिवार",
      Sunday: "रविवार",
      Monday: "सोमवार",
      Tuesday: "मंगलवार",
      Wednesday: "बुधवार",
    },
  },
};

export default function PlannerPage() {
  const { language } = useLanguage();

  const t =
    plannerTranslations[language] ||
    plannerTranslations.en;

  const isArabic = language === "ar";

  const [schedule, setSchedule] = useState<
    ScheduleItem[]
  >([]);

  const [selectedDay, setSelectedDay] =
    useState("Saturday");

  const [showModal, setShowModal] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [newDay, setNewDay] =
    useState("Saturday");

  const [newTime, setNewTime] =
    useState("09:00 AM");

  const [newSubject, setNewSubject] =
    useState("Mathematics");

  const [newTitle, setNewTitle] =
    useState("");

  const [newType, setNewType] =
    useState<ScheduleItem["type"]>("Study");

  useEffect(() => {
    loadPlanner();
  }, []);

  async function loadPlanner() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/planner",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t.loadError
        );
      }

      setSchedule(
        data.sessions || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : t.loadError
      );
    } finally {
      setLoading(false);
    }
  }

  async function addScheduleItem() {
    if (!newTitle.trim()) {
      setError(t.enterTitle);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch("/api/planner", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            day: newDay,
            time: newTime,
            subject: newSubject,
            title: newTitle.trim(),
            type: newType,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            t.createError
        );
      }

      setSchedule(
        (current) => [
          ...current,
          data.session,
        ]
      );

      setSelectedDay(newDay);

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : t.createError
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(
    id: number
  ) {
    try {
      setError("");

      const response =
        await fetch(
          `/api/planner/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            t.deleteError
        );
      }

      setSchedule(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : t.deleteError
      );
    }
  }

  function resetForm() {
    setNewDay("Saturday");
    setNewTime("09:00 AM");
    setNewSubject("Mathematics");
    setNewTitle("");
    setNewType("Study");
  }

  const selectedItems =
    schedule
      .filter(
        (item) =>
          item.day === selectedDay
      )
      .sort((a, b) => {
        return convertToTimeInput(
          a.time
        ).localeCompare(
          convertToTimeInput(
            b.time
          )
        );
      });

  const studyDays =
    new Set(
      schedule.map(
        (item) => item.day
      )
    ).size;

  const subjectCount =
    new Set(
      schedule.map(
        (item) => item.subject
      )
    ).size;

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <Sidebar />

      <main
        className={
          isArabic
            ? "lg:pr-64"
            : "lg:pl-64"
        }
      >
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">
                {t.title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {t.description}
              </p>
            </div>

            <button
              onClick={() => {
                setError("");
                setNewDay(
                  selectedDay
                );
                setShowModal(true);
              }}
              className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + {t.addSession}
            </button>
          </div>
        </header>

        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Week Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <PlannerStat
              label={
                t.studySessions
              }
              value={schedule.length.toString()}
              icon="▣"
            />

            <PlannerStat
              label={t.studyDays}
              value={studyDays.toString()}
              icon="◷"
            />

            <PlannerStat
              label={
                t.subjectsLabel
              }
              value={subjectCount.toString()}
              icon="✎"
            />
          </div>

          {/* Day Selector */}
          <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
            <div className="flex min-w-max gap-2">
              {days.map((day) => {
                const active =
                  selectedDay ===
                  day;

                const count =
                  schedule.filter(
                    (item) =>
                      item.day ===
                      day
                  ).length;

                return (
                  <button
                    key={day}
                    onClick={() =>
                      setSelectedDay(
                        day
                      )
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>
                      {t.days[day]}
                    </span>

                    <span
                      className={`${
                        isArabic
                          ? "mr-2"
                          : "ml-2"
                      } rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm text-slate-500">
                  {t.scheduleFor}
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {t.days[
                    selectedDay
                  ]}
                </h2>
              </div>

              <div className="shrink-0 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
                {selectedItems.length}{" "}
                {selectedItems.length ===
                1
                  ? t.session
                  : t.sessions}
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                <p className="mt-4 text-sm text-slate-500">
                  {t.loading}
                </p>
              </div>
            ) : selectedItems.length ===
              0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                  ▣
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {t.nothingPlanned}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {
                    t.nothingDescription
                  }
                </p>

                <button
                  onClick={() => {
                    setError("");
                    setNewDay(
                      selectedDay
                    );
                    setShowModal(
                      true
                    );
                  }}
                  className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {t.addSession}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedItems.map(
                  (item) => (
                    <ScheduleRow
                      key={item.id}
                      item={item}
                      onDelete={() =>
                        deleteItem(
                          item.id
                        )
                      }
                      typeLabels={
                        t.types
                      }
                      deleteLabel={
                        t.delete
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* Weekly Overview */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  {t.weeklyOverview}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    t.weeklyDescription
                  }
                </p>
              </div>

              <span className="shrink-0 text-sm font-semibold text-indigo-600">
                {schedule.length}{" "}
                {t.total}
              </span>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {days.map((day) => {
                const count =
                  schedule.filter(
                    (item) =>
                      item.day ===
                      day
                  ).length;

                const percentage =
                  Math.min(
                    count * 25,
                    100
                  );

                return (
                  <div
                    key={day}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {t.days[
                          day
                        ].slice(
                          0,
                          3
                        )}
                      </span>

                      <span className="text-xs font-bold text-slate-700">
                        {count}
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Add Session Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          dir={
            isArabic
              ? "rtl"
              : "ltr"
          }
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold">
                  {t.addStudySession}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t.addDescription}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(
                    false
                  );
                  setError("");
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.day}
                  </label>

                  <select
                    value={newDay}
                    onChange={(e) =>
                      setNewDay(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {days.map(
                      (day) => (
                        <option
                          key={day}
                          value={day}
                        >
                          {
                            t.days[
                              day
                            ]
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.time}
                  </label>

                  <input
                    type="time"
                    value={convertToTimeInput(
                      newTime
                    )}
                    onChange={(e) =>
                      setNewTime(
                        formatTime(
                          e.target
                            .value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {t.sessionTitle}
                </label>

                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) =>
                    setNewTitle(
                      e.target.value
                    )
                  }
                  placeholder={
                    t.titlePlaceholder
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.subject}
                  </label>

                  <select
                    value={newSubject}
                    onChange={(e) =>
                      setNewSubject(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {subjects.map(
                      (subject) => (
                        <option
                          key={subject}
                          value={subject}
                        >
                          {
                            t.subjectNames[
                              subject
                            ]
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.type}
                  </label>

                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(
                        e.target
                          .value as ScheduleItem["type"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Study">
                      {t.types.Study}
                    </option>

                    <option value="Lecture">
                      {t.types.Lecture}
                    </option>

                    <option value="Review">
                      {t.types.Review}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(
                    false
                  );
                  setError("");
                }}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.cancel}
              </button>

              <button
                onClick={
                  addScheduleItem
                }
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? t.adding
                  : t.addSession}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlannerStat({
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

function ScheduleRow({
  item,
  onDelete,
  typeLabels,
  deleteLabel,
}: {
  item: ScheduleItem;
  onDelete: () => void;
  typeLabels: {
    Study: string;
    Lecture: string;
    Review: string;
  };
  deleteLabel: string;
}) {
  const typeStyles = {
    Study:
      "bg-indigo-50 text-indigo-600",
    Lecture:
      "bg-emerald-50 text-emerald-600",
    Review:
      "bg-amber-50 text-amber-600",
  };

  return (
    <div className="group flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center">
      <div className="w-24 shrink-0">
        <p className="text-sm font-bold text-slate-900">
          {item.time}
        </p>
      </div>

      <div className="hidden h-10 w-px bg-slate-200 sm:block" />

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {item.type ===
          "Study"
            ? "📚"
            : item.type ===
                "Lecture"
              ? "🎓"
              : "↻"}
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-bold">
            {item.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {item.subject}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[item.type]}`}
        >
          {
            typeLabels[
              item.type
            ]
          }
        </span>

        <button
          onClick={onDelete}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          {deleteLabel}
        </button>
      </div>
    </div>
  );
}

function convertToTimeInput(
  time: string
) {
  const [value, modifier] =
    time.split(" ");

  let [hours, minutes] =
    value
      .split(":")
      .map(Number);

  if (
    modifier === "PM" &&
    hours !== 12
  ) {
    hours += 12;
  }

  if (
    modifier === "AM" &&
    hours === 12
  ) {
    hours = 0;
  }

  return `${hours
    .toString()
    .padStart(
      2,
      "0"
    )}:${minutes
    .toString()
    .padStart(
      2,
      "0"
    )}`;
}

function formatTime(
  time: string
) {
  const [
    hoursString,
    minutes,
  ] = time.split(":");

  let hours =
    Number(hoursString);

  const modifier =
    hours >= 12
      ? "PM"
      : "AM";

  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  return `${hours}:${minutes} ${modifier}`;
}