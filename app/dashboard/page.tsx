"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type Task = {
  id: number;
  title: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  completed: boolean;
};

type User = {
  id: number;
  username: string;
  email: string;
};

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type PomodoroStats = {
  sessions: number;
  totalMinutes: number;
  todaySessions: number;
  todayMinutes: number;
  weeklyMinutes: number;
  currentStreak: number;
};

const dashboardTranslations = {
  en: {
    dashboard: "Dashboard",
    openNotifications: "Open notifications",
    notifications: "Notifications",
    unreadNotification: "unread notification",
    unreadNotifications: "unread notifications",
    caughtUp: "You're all caught up",
    markAllRead: "Mark all read",
    loadingNotifications: "Loading notifications...",
    noNotifications: "No notifications yet.",
    justNow: "Just now",
    minute: "minute",
    minutes: "minutes",
    hour: "hour",
    hours: "hours",
    day: "day",
    days: "days",
    goodMorning: "Good morning 👋",
    readyToStudy: "Ready to study",
    readyQuestion: "Ready to study, {name}?",
    stayFocused:
      "Stay focused, complete your tasks, and keep building your study streak.",
    startPomodoro: "Start Pomodoro",
    tasksCompleted: "Tasks completed",
    noTasksYet: "No tasks yet",
    activeTask: "active task",
    activeTasks: "active tasks",
    remaining: "remaining",
    studyTime: "Study time",
    loading: "Loading...",
    thisWeek: "this week",
    studyStreak: "Study streak",
    keepStreak: "Keep your study streak going!",
    buildStreak: "Start studying to build your streak",
    weeklyGoal: "Weekly goal",
    of10Hours: "of 10 hours",
    todaysTasks: "Today's Tasks",
    keepOrganized: "Keep your day organized.",
    viewAll: "View all",
    loadingTasks: "Loading tasks...",
    createFirstTask: "Create your first task to get started.",
    createTask: "Create Task",
    addNewTask: "+ Add new task",
    todaysSchedule: "Today's Schedule",
    plannedSessions: "Your planned study sessions.",
    planner: "Planner",
    plannerAvailable: "Planner sessions are available",
    openPlanner:
      "Open Planner to view and manage your study schedule.",
    openPlannerArrow: "Open Planner →",
    weeklyProgress: "Weekly Progress",
    studyActivity: "Your study activity.",
    studiedThisWeek: "studied this week.",
    detailedProgress: "View detailed progress →",
    quickActions: "Quick Actions",
    newNote: "New Note",
    newTask: "New Task",
    joinGroup: "Join Group",
    focusSession: "Focus Session",
    readyFocus: "Ready to focus?",
    start25: "Start a 25 minute session.",
    startFocus: "Start focus session",
    todaysFocus: "Today's focus time",
    high: "High",
    medium: "Medium",
    low: "Low",
    markCompleted: "Mark task as completed",
    markActive: "Mark task as active",
  },

  ar: {
    dashboard: "لوحة التحكم",
    openNotifications: "فتح الإشعارات",
    notifications: "الإشعارات",
    unreadNotification: "إشعار غير مقروء",
    unreadNotifications: "إشعارات غير مقروءة",
    caughtUp: "أنت على اطلاع بكل شيء",
    markAllRead: "تحديد الكل كمقروء",
    loadingNotifications: "جاري تحميل الإشعارات...",
    noNotifications: "لا توجد إشعارات حتى الآن.",
    justNow: "منذ لحظات",
    minute: "دقيقة",
    minutes: "دقائق",
    hour: "ساعة",
    hours: "ساعات",
    day: "يوم",
    days: "أيام",
    goodMorning: "صباح الخير 👋",
    readyToStudy: "جاهز للمذاكرة",
    readyQuestion: "جاهز للمذاكرة، {name}؟",
    stayFocused:
      "حافظ على تركيزك، وأنجز مهامك، واستمر في بناء سلسلة مذاكرتك.",
    startPomodoro: "ابدأ بومودورو",
    tasksCompleted: "المهام المكتملة",
    noTasksYet: "لا توجد مهام حتى الآن",
    activeTask: "مهمة نشطة",
    activeTasks: "مهام نشطة",
    remaining: "متبقية",
    studyTime: "وقت المذاكرة",
    loading: "جاري التحميل...",
    thisWeek: "هذا الأسبوع",
    studyStreak: "سلسلة المذاكرة",
    keepStreak: "استمر في سلسلة مذاكرتك!",
    buildStreak: "ابدأ المذاكرة لبناء سلسلتك",
    weeklyGoal: "الهدف الأسبوعي",
    of10Hours: "من 10 ساعات",
    todaysTasks: "مهام اليوم",
    keepOrganized: "نظّم يومك وأنجز مهامك.",
    viewAll: "عرض الكل",
    loadingTasks: "جاري تحميل المهام...",
    createFirstTask: "أنشئ أول مهمة لك للبدء.",
    createTask: "إنشاء مهمة",
    addNewTask: "+ إضافة مهمة جديدة",
    todaysSchedule: "جدول اليوم",
    plannedSessions: "جلسات المذاكرة المخطط لها.",
    planner: "الجدول",
    plannerAvailable: "جلسات الجدول متاحة",
    openPlanner:
      "افتح الجدول لعرض وإدارة خطة مذاكرتك.",
    openPlannerArrow: "فتح الجدول ←",
    weeklyProgress: "التقدم الأسبوعي",
    studyActivity: "نشاطك الدراسي.",
    studiedThisWeek: "من المذاكرة هذا الأسبوع.",
    detailedProgress: "عرض التقدم بالتفصيل ←",
    quickActions: "إجراءات سريعة",
    newNote: "ملاحظة جديدة",
    newTask: "مهمة جديدة",
    joinGroup: "انضم لمجموعة",
    focusSession: "جلسة التركيز",
    readyFocus: "جاهز للتركيز؟",
    start25: "ابدأ جلسة لمدة 25 دقيقة.",
    startFocus: "بدء جلسة التركيز",
    todaysFocus: "وقت التركيز اليوم",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
    markCompleted: "تحديد المهمة كمكتملة",
    markActive: "إلغاء إكمال المهمة",
  },

  es: {
    dashboard: "Panel",
    openNotifications: "Abrir notificaciones",
    notifications: "Notificaciones",
    unreadNotification: "notificación sin leer",
    unreadNotifications: "notificaciones sin leer",
    caughtUp: "Estás al día",
    markAllRead: "Marcar todo como leído",
    loadingNotifications: "Cargando notificaciones...",
    noNotifications: "Aún no hay notificaciones.",
    justNow: "Ahora mismo",
    minute: "minuto",
    minutes: "minutos",
    hour: "hora",
    hours: "horas",
    day: "día",
    days: "días",
    goodMorning: "Buenos días 👋",
    readyToStudy: "Listo para estudiar",
    readyQuestion: "¿Listo para estudiar, {name}?",
    stayFocused:
      "Mantén la concentración, completa tus tareas y sigue construyendo tu racha de estudio.",
    startPomodoro: "Iniciar Pomodoro",
    tasksCompleted: "Tareas completadas",
    noTasksYet: "Aún no hay tareas",
    activeTask: "tarea activa",
    activeTasks: "tareas activas",
    remaining: "restantes",
    studyTime: "Tiempo de estudio",
    loading: "Cargando...",
    thisWeek: "esta semana",
    studyStreak: "Racha de estudio",
    keepStreak: "¡Sigue con tu racha de estudio!",
    buildStreak: "Empieza a estudiar para crear tu racha",
    weeklyGoal: "Objetivo semanal",
    of10Hours: "de 10 horas",
    todaysTasks: "Tareas de hoy",
    keepOrganized: "Mantén tu día organizado.",
    viewAll: "Ver todo",
    loadingTasks: "Cargando tareas...",
    createFirstTask: "Crea tu primera tarea para comenzar.",
    createTask: "Crear tarea",
    addNewTask: "+ Añadir nueva tarea",
    todaysSchedule: "Horario de hoy",
    plannedSessions: "Tus sesiones de estudio planificadas.",
    planner: "Planificador",
    plannerAvailable: "Las sesiones del planificador están disponibles",
    openPlanner:
      "Abre el planificador para ver y gestionar tu horario de estudio.",
    openPlannerArrow: "Abrir planificador →",
    weeklyProgress: "Progreso semanal",
    studyActivity: "Tu actividad de estudio.",
    studiedThisWeek: "estudiado esta semana.",
    detailedProgress: "Ver progreso detallado →",
    quickActions: "Acciones rápidas",
    newNote: "Nueva nota",
    newTask: "Nueva tarea",
    joinGroup: "Unirse a un grupo",
    focusSession: "Sesión de concentración",
    readyFocus: "¿Listo para concentrarte?",
    start25: "Inicia una sesión de 25 minutos.",
    startFocus: "Iniciar sesión de concentración",
    todaysFocus: "Tiempo de concentración de hoy",
    high: "Alta",
    medium: "Media",
    low: "Baja",
    markCompleted: "Marcar tarea como completada",
    markActive: "Marcar tarea como activa",
  },

  fr: {
    dashboard: "Tableau de bord",
    openNotifications: "Ouvrir les notifications",
    notifications: "Notifications",
    unreadNotification: "notification non lue",
    unreadNotifications: "notifications non lues",
    caughtUp: "Vous êtes à jour",
    markAllRead: "Tout marquer comme lu",
    loadingNotifications: "Chargement des notifications...",
    noNotifications: "Aucune notification pour le moment.",
    justNow: "À l'instant",
    minute: "minute",
    minutes: "minutes",
    hour: "heure",
    hours: "heures",
    day: "jour",
    days: "jours",
    goodMorning: "Bonjour 👋",
    readyToStudy: "Prêt à étudier",
    readyQuestion: "Prêt à étudier, {name} ?",
    stayFocused:
      "Reste concentré, termine tes tâches et continue ta série d'étude.",
    startPomodoro: "Démarrer Pomodoro",
    tasksCompleted: "Tâches terminées",
    noTasksYet: "Aucune tâche pour le moment",
    activeTask: "tâche active",
    activeTasks: "tâches actives",
    remaining: "restantes",
    studyTime: "Temps d'étude",
    loading: "Chargement...",
    thisWeek: "cette semaine",
    studyStreak: "Série d'étude",
    keepStreak: "Continue ta série d'étude !",
    buildStreak: "Commence à étudier pour créer ta série",
    weeklyGoal: "Objectif hebdomadaire",
    of10Hours: "sur 10 heures",
    todaysTasks: "Tâches du jour",
    keepOrganized: "Garde ta journée organisée.",
    viewAll: "Voir tout",
    loadingTasks: "Chargement des tâches...",
    createFirstTask: "Crée ta première tâche pour commencer.",
    createTask: "Créer une tâche",
    addNewTask: "+ Ajouter une tâche",
    todaysSchedule: "Programme du jour",
    plannedSessions: "Tes sessions d'étude planifiées.",
    planner: "Planificateur",
    plannerAvailable: "Les sessions du planificateur sont disponibles",
    openPlanner:
      "Ouvre le planificateur pour gérer ton programme d'étude.",
    openPlannerArrow: "Ouvrir le planificateur →",
    weeklyProgress: "Progrès hebdomadaire",
    studyActivity: "Ton activité d'étude.",
    studiedThisWeek: "étudiées cette semaine.",
    detailedProgress: "Voir les progrès détaillés →",
    quickActions: "Actions rapides",
    newNote: "Nouvelle note",
    newTask: "Nouvelle tâche",
    joinGroup: "Rejoindre un groupe",
    focusSession: "Session de concentration",
    readyFocus: "Prêt à te concentrer ?",
    start25: "Commence une session de 25 minutes.",
    startFocus: "Démarrer la session",
    todaysFocus: "Temps de concentration aujourd'hui",
    high: "Élevée",
    medium: "Moyenne",
    low: "Faible",
    markCompleted: "Marquer comme terminée",
    markActive: "Marquer comme active",
  },

  pt: {
    dashboard: "Painel",
    openNotifications: "Abrir notificações",
    notifications: "Notificações",
    unreadNotification: "notificação não lida",
    unreadNotifications: "notificações não lidas",
    caughtUp: "Você está em dia",
    markAllRead: "Marcar tudo como lido",
    loadingNotifications: "Carregando notificações...",
    noNotifications: "Nenhuma notificação ainda.",
    justNow: "Agora mesmo",
    minute: "minuto",
    minutes: "minutos",
    hour: "hora",
    hours: "horas",
    day: "dia",
    days: "dias",
    goodMorning: "Bom dia 👋",
    readyToStudy: "Pronto para estudar",
    readyQuestion: "Pronto para estudar, {name}?",
    stayFocused:
      "Mantenha o foco, conclua suas tarefas e continue sua sequência de estudos.",
    startPomodoro: "Iniciar Pomodoro",
    tasksCompleted: "Tarefas concluídas",
    noTasksYet: "Nenhuma tarefa ainda",
    activeTask: "tarefa ativa",
    activeTasks: "tarefas ativas",
    remaining: "restantes",
    studyTime: "Tempo de estudo",
    loading: "Carregando...",
    thisWeek: "esta semana",
    studyStreak: "Sequência de estudos",
    keepStreak: "Continue sua sequência de estudos!",
    buildStreak: "Comece a estudar para criar sua sequência",
    weeklyGoal: "Meta semanal",
    of10Hours: "de 10 horas",
    todaysTasks: "Tarefas de hoje",
    keepOrganized: "Mantenha seu dia organizado.",
    viewAll: "Ver tudo",
    loadingTasks: "Carregando tarefas...",
    createFirstTask: "Crie sua primeira tarefa para começar.",
    createTask: "Criar tarefa",
    addNewTask: "+ Adicionar nova tarefa",
    todaysSchedule: "Agenda de hoje",
    plannedSessions: "Suas sessões de estudo planejadas.",
    planner: "Planejador",
    plannerAvailable: "As sessões do planejador estão disponíveis",
    openPlanner:
      "Abra o planejador para ver e gerenciar seu cronograma de estudos.",
    openPlannerArrow: "Abrir planejador →",
    weeklyProgress: "Progresso semanal",
    studyActivity: "Sua atividade de estudo.",
    studiedThisWeek: "estudadas esta semana.",
    detailedProgress: "Ver progresso detalhado →",
    quickActions: "Ações rápidas",
    newNote: "Nova nota",
    newTask: "Nova tarefa",
    joinGroup: "Entrar em um grupo",
    focusSession: "Sessão de foco",
    readyFocus: "Pronto para focar?",
    start25: "Inicie uma sessão de 25 minutos.",
    startFocus: "Iniciar sessão de foco",
    todaysFocus: "Tempo de foco hoje",
    high: "Alta",
    medium: "Média",
    low: "Baixa",
    markCompleted: "Marcar tarefa como concluída",
    markActive: "Marcar tarefa como ativa",
  },

  it: {
    dashboard: "Dashboard",
    openNotifications: "Apri notifiche",
    notifications: "Notifiche",
    unreadNotification: "notifica non letta",
    unreadNotifications: "notifiche non lette",
    caughtUp: "Sei aggiornato",
    markAllRead: "Segna tutto come letto",
    loadingNotifications: "Caricamento notifiche...",
    noNotifications: "Nessuna notifica ancora.",
    justNow: "Proprio ora",
    minute: "minuto",
    minutes: "minuti",
    hour: "ora",
    hours: "ore",
    day: "giorno",
    days: "giorni",
    goodMorning: "Buongiorno 👋",
    readyToStudy: "Pronto per studiare",
    readyQuestion: "Pronto per studiare, {name}?",
    stayFocused:
      "Rimani concentrato, completa le attività e continua la tua serie di studio.",
    startPomodoro: "Avvia Pomodoro",
    tasksCompleted: "Attività completate",
    noTasksYet: "Nessuna attività ancora",
    activeTask: "attività attiva",
    activeTasks: "attività attive",
    remaining: "rimanenti",
    studyTime: "Tempo di studio",
    loading: "Caricamento...",
    thisWeek: "questa settimana",
    studyStreak: "Serie di studio",
    keepStreak: "Continua la tua serie di studio!",
    buildStreak: "Inizia a studiare per creare la tua serie",
    weeklyGoal: "Obiettivo settimanale",
    of10Hours: "su 10 ore",
    todaysTasks: "Attività di oggi",
    keepOrganized: "Organizza bene la tua giornata.",
    viewAll: "Vedi tutto",
    loadingTasks: "Caricamento attività...",
    createFirstTask: "Crea la tua prima attività per iniziare.",
    createTask: "Crea attività",
    addNewTask: "+ Aggiungi attività",
    todaysSchedule: "Programma di oggi",
    plannedSessions: "Le tue sessioni di studio pianificate.",
    planner: "Pianificatore",
    plannerAvailable: "Le sessioni del pianificatore sono disponibili",
    openPlanner:
      "Apri il pianificatore per gestire il tuo programma di studio.",
    openPlannerArrow: "Apri pianificatore →",
    weeklyProgress: "Progresso settimanale",
    studyActivity: "La tua attività di studio.",
    studiedThisWeek: "studiato questa settimana.",
    detailedProgress: "Vedi progresso dettagliato →",
    quickActions: "Azioni rapide",
    newNote: "Nuova nota",
    newTask: "Nuova attività",
    joinGroup: "Unisciti a un gruppo",
    focusSession: "Sessione di concentrazione",
    readyFocus: "Pronto a concentrarti?",
    start25: "Inizia una sessione di 25 minuti.",
    startFocus: "Avvia sessione",
    todaysFocus: "Tempo di concentrazione di oggi",
    high: "Alta",
    medium: "Media",
    low: "Bassa",
    markCompleted: "Segna come completata",
    markActive: "Segna come attiva",
  },

  de: {
    dashboard: "Dashboard",
    openNotifications: "Benachrichtigungen öffnen",
    notifications: "Benachrichtigungen",
    unreadNotification: "ungelesene Benachrichtigung",
    unreadNotifications: "ungelesene Benachrichtigungen",
    caughtUp: "Du bist auf dem neuesten Stand",
    markAllRead: "Alle als gelesen markieren",
    loadingNotifications: "Benachrichtigungen werden geladen...",
    noNotifications: "Noch keine Benachrichtigungen.",
    justNow: "Gerade eben",
    minute: "Minute",
    minutes: "Minuten",
    hour: "Stunde",
    hours: "Stunden",
    day: "Tag",
    days: "Tage",
    goodMorning: "Guten Morgen 👋",
    readyToStudy: "Bereit zum Lernen",
    readyQuestion: "Bereit zum Lernen, {name}?",
    stayFocused:
      "Bleib konzentriert, erledige deine Aufgaben und baue deine Lernserie weiter aus.",
    startPomodoro: "Pomodoro starten",
    tasksCompleted: "Erledigte Aufgaben",
    noTasksYet: "Noch keine Aufgaben",
    activeTask: "aktive Aufgabe",
    activeTasks: "aktive Aufgaben",
    remaining: "übrig",
    studyTime: "Lernzeit",
    loading: "Wird geladen...",
    thisWeek: "diese Woche",
    studyStreak: "Lernserie",
    keepStreak: "Halte deine Lernserie aufrecht!",
    buildStreak: "Beginne zu lernen, um deine Serie aufzubauen",
    weeklyGoal: "Wochenziel",
    of10Hours: "von 10 Stunden",
    todaysTasks: "Aufgaben für heute",
    keepOrganized: "Organisiere deinen Tag.",
    viewAll: "Alle anzeigen",
    loadingTasks: "Aufgaben werden geladen...",
    createFirstTask: "Erstelle deine erste Aufgabe, um zu beginnen.",
    createTask: "Aufgabe erstellen",
    addNewTask: "+ Neue Aufgabe",
    todaysSchedule: "Heutiger Zeitplan",
    plannedSessions: "Deine geplanten Lernsitzungen.",
    planner: "Planer",
    plannerAvailable: "Planer-Sitzungen sind verfügbar",
    openPlanner:
      "Öffne den Planer, um deinen Lernplan zu verwalten.",
    openPlannerArrow: "Planer öffnen →",
    weeklyProgress: "Wöchentlicher Fortschritt",
    studyActivity: "Deine Lernaktivität.",
    studiedThisWeek: "diese Woche gelernt.",
    detailedProgress: "Detaillierten Fortschritt ansehen →",
    quickActions: "Schnellaktionen",
    newNote: "Neue Notiz",
    newTask: "Neue Aufgabe",
    joinGroup: "Gruppe beitreten",
    focusSession: "Fokus-Sitzung",
    readyFocus: "Bereit für den Fokus?",
    start25: "Starte eine 25-minütige Sitzung.",
    startFocus: "Fokus-Sitzung starten",
    todaysFocus: "Heutige Fokuszeit",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
    markCompleted: "Als erledigt markieren",
    markActive: "Als aktiv markieren",
  },

  zh: {
    dashboard: "控制面板",
    openNotifications: "打开通知",
    notifications: "通知",
    unreadNotification: "条未读通知",
    unreadNotifications: "条未读通知",
    caughtUp: "你已经查看了所有通知",
    markAllRead: "全部标记为已读",
    loadingNotifications: "正在加载通知...",
    noNotifications: "暂无通知。",
    justNow: "刚刚",
    minute: "分钟",
    minutes: "分钟",
    hour: "小时",
    hours: "小时",
    day: "天",
    days: "天",
    goodMorning: "早上好 👋",
    readyToStudy: "准备好学习了吗",
    readyQuestion: "{name}，准备好学习了吗？",
    stayFocused: "保持专注，完成任务，继续保持你的学习连续记录。",
    startPomodoro: "开始番茄钟",
    tasksCompleted: "已完成任务",
    noTasksYet: "暂无任务",
    activeTask: "个进行中任务",
    activeTasks: "个进行中任务",
    remaining: "剩余",
    studyTime: "学习时间",
    loading: "加载中...",
    thisWeek: "本周",
    studyStreak: "学习连续记录",
    keepStreak: "继续保持你的学习连续记录！",
    buildStreak: "开始学习来建立你的连续记录",
    weeklyGoal: "每周目标",
    of10Hours: "共10小时",
    todaysTasks: "今日任务",
    keepOrganized: "保持你的学习日程井然有序。",
    viewAll: "查看全部",
    loadingTasks: "正在加载任务...",
    createFirstTask: "创建你的第一个任务开始学习。",
    createTask: "创建任务",
    addNewTask: "+ 添加新任务",
    todaysSchedule: "今日安排",
    plannedSessions: "你计划的学习课程。",
    planner: "计划",
    plannerAvailable: "学习计划课程已准备好",
    openPlanner: "打开计划查看和管理你的学习安排。",
    openPlannerArrow: "打开计划 →",
    weeklyProgress: "每周进度",
    studyActivity: "你的学习活动。",
    studiedThisWeek: "本周学习时间。",
    detailedProgress: "查看详细进度 →",
    quickActions: "快捷操作",
    newNote: "新建笔记",
    newTask: "新建任务",
    joinGroup: "加入小组",
    focusSession: "专注学习",
    readyFocus: "准备好专注了吗？",
    start25: "开始25分钟学习课程。",
    startFocus: "开始专注课程",
    todaysFocus: "今日专注时间",
    high: "高",
    medium: "中",
    low: "低",
    markCompleted: "标记为已完成",
    markActive: "标记为进行中",
  },

  ja: {
    dashboard: "ダッシュボード",
    openNotifications: "通知を開く",
    notifications: "通知",
    unreadNotification: "件の未読通知",
    unreadNotifications: "件の未読通知",
    caughtUp: "すべて確認しました",
    markAllRead: "すべて既読にする",
    loadingNotifications: "通知を読み込んでいます...",
    noNotifications: "まだ通知はありません。",
    justNow: "たった今",
    minute: "分",
    minutes: "分",
    hour: "時間",
    hours: "時間",
    day: "日",
    days: "日",
    goodMorning: "おはようございます 👋",
    readyToStudy: "勉強する準備はできましたか",
    readyQuestion: "{name}さん、勉強する準備はできましたか？",
    stayFocused: "集中してタスクを完了し、学習記録を伸ばしましょう。",
    startPomodoro: "ポモドーロを開始",
    tasksCompleted: "完了したタスク",
    noTasksYet: "まだタスクはありません",
    activeTask: "件の進行中タスク",
    activeTasks: "件の進行中タスク",
    remaining: "残り",
    studyTime: "学習時間",
    loading: "読み込み中...",
    thisWeek: "今週",
    studyStreak: "学習連続記録",
    keepStreak: "学習記録を続けましょう！",
    buildStreak: "勉強を始めて記録を作りましょう",
    weeklyGoal: "週間目標",
    of10Hours: "10時間中",
    todaysTasks: "今日のタスク",
    keepOrganized: "一日を整理しましょう。",
    viewAll: "すべて見る",
    loadingTasks: "タスクを読み込んでいます...",
    createFirstTask: "最初のタスクを作成して始めましょう。",
    createTask: "タスクを作成",
    addNewTask: "+ 新しいタスク",
    todaysSchedule: "今日の予定",
    plannedSessions: "予定されている学習セッション。",
    planner: "プランナー",
    plannerAvailable: "プランナーのセッションを利用できます",
    openPlanner: "プランナーを開いて学習スケジュールを管理します。",
    openPlannerArrow: "プランナーを開く →",
    weeklyProgress: "週間進捗",
    studyActivity: "学習アクティビティ。",
    studiedThisWeek: "今週の学習時間。",
    detailedProgress: "詳細な進捗を見る →",
    quickActions: "クイックアクション",
    newNote: "新しいノート",
    newTask: "新しいタスク",
    joinGroup: "グループに参加",
    focusSession: "集中セッション",
    readyFocus: "集中する準備はできましたか？",
    start25: "25分間のセッションを開始します。",
    startFocus: "集中セッションを開始",
    todaysFocus: "今日の集中時間",
    high: "高",
    medium: "中",
    low: "低",
    markCompleted: "完了としてマーク",
    markActive: "進行中としてマーク",
  },

  ko: {
    dashboard: "대시보드",
    openNotifications: "알림 열기",
    notifications: "알림",
    unreadNotification: "개의 읽지 않은 알림",
    unreadNotifications: "개의 읽지 않은 알림",
    caughtUp: "모든 알림을 확인했습니다",
    markAllRead: "모두 읽음으로 표시",
    loadingNotifications: "알림을 불러오는 중...",
    noNotifications: "아직 알림이 없습니다.",
    justNow: "방금",
    minute: "분",
    minutes: "분",
    hour: "시간",
    hours: "시간",
    day: "일",
    days: "일",
    goodMorning: "좋은 아침이에요 👋",
    readyToStudy: "공부할 준비가 되셨나요",
    readyQuestion: "{name}님, 공부할 준비가 되셨나요?",
    stayFocused: "집중하고 할 일을 완료하며 공부 기록을 계속 이어가세요.",
    startPomodoro: "포모도로 시작",
    tasksCompleted: "완료한 작업",
    noTasksYet: "아직 작업이 없습니다",
    activeTask: "개의 진행 중 작업",
    activeTasks: "개의 진행 중 작업",
    remaining: "남음",
    studyTime: "공부 시간",
    loading: "로딩 중...",
    thisWeek: "이번 주",
    studyStreak: "공부 연속 기록",
    keepStreak: "공부 기록을 계속 이어가세요!",
    buildStreak: "공부를 시작해 기록을 만들어 보세요",
    weeklyGoal: "주간 목표",
    of10Hours: "10시간 중",
    todaysTasks: "오늘의 작업",
    keepOrganized: "하루를 체계적으로 관리하세요.",
    viewAll: "모두 보기",
    loadingTasks: "작업을 불러오는 중...",
    createFirstTask: "첫 번째 작업을 만들어 시작하세요.",
    createTask: "작업 만들기",
    addNewTask: "+ 새 작업 추가",
    todaysSchedule: "오늘의 일정",
    plannedSessions: "계획된 공부 세션입니다.",
    planner: "플래너",
    plannerAvailable: "플래너 세션을 이용할 수 있습니다",
    openPlanner: "플래너를 열어 공부 일정을 관리하세요.",
    openPlannerArrow: "플래너 열기 →",
    weeklyProgress: "주간 진행률",
    studyActivity: "공부 활동입니다.",
    studiedThisWeek: "이번 주 공부 시간입니다.",
    detailedProgress: "상세 진행률 보기 →",
    quickActions: "빠른 작업",
    newNote: "새 노트",
    newTask: "새 작업",
    joinGroup: "그룹 참여",
    focusSession: "집중 세션",
    readyFocus: "집중할 준비가 되셨나요?",
    start25: "25분 세션을 시작하세요.",
    startFocus: "집중 세션 시작",
    todaysFocus: "오늘의 집중 시간",
    high: "높음",
    medium: "보통",
    low: "낮음",
    markCompleted: "완료로 표시",
    markActive: "활성으로 표시",
  },

  ru: {
    dashboard: "Панель управления",
    openNotifications: "Открыть уведомления",
    notifications: "Уведомления",
    unreadNotification: "непрочитанное уведомление",
    unreadNotifications: "непрочитанных уведомлений",
    caughtUp: "Вы просмотрели все уведомления",
    markAllRead: "Отметить все как прочитанные",
    loadingNotifications: "Загрузка уведомлений...",
    noNotifications: "Уведомлений пока нет.",
    justNow: "Только что",
    minute: "минута",
    minutes: "минут",
    hour: "час",
    hours: "часов",
    day: "день",
    days: "дней",
    goodMorning: "Доброе утро 👋",
    readyToStudy: "Готовы учиться",
    readyQuestion: "{name}, готовы учиться?",
    stayFocused:
      "Сохраняйте концентрацию, выполняйте задания и продолжайте свою учебную серию.",
    startPomodoro: "Начать Помодоро",
    tasksCompleted: "Выполненные задания",
    noTasksYet: "Заданий пока нет",
    activeTask: "активное задание",
    activeTasks: "активных задания",
    remaining: "осталось",
    studyTime: "Время учебы",
    loading: "Загрузка...",
    thisWeek: "на этой неделе",
    studyStreak: "Учебная серия",
    keepStreak: "Продолжайте свою учебную серию!",
    buildStreak: "Начните учиться, чтобы создать серию",
    weeklyGoal: "Цель на неделю",
    of10Hours: "из 10 часов",
    todaysTasks: "Задания на сегодня",
    keepOrganized: "Организуйте свой день.",
    viewAll: "Посмотреть все",
    loadingTasks: "Загрузка заданий...",
    createFirstTask: "Создайте первое задание, чтобы начать.",
    createTask: "Создать задание",
    addNewTask: "+ Добавить задание",
    todaysSchedule: "Расписание на сегодня",
    plannedSessions: "Запланированные учебные сессии.",
    planner: "Планировщик",
    plannerAvailable: "Сессии планировщика доступны",
    openPlanner: "Откройте планировщик, чтобы управлять расписанием.",
    openPlannerArrow: "Открыть планировщик →",
    weeklyProgress: "Прогресс за неделю",
    studyActivity: "Ваша учебная активность.",
    studiedThisWeek: "учебы на этой неделе.",
    detailedProgress: "Подробный прогресс →",
    quickActions: "Быстрые действия",
    newNote: "Новая заметка",
    newTask: "Новое задание",
    joinGroup: "Вступить в группу",
    focusSession: "Сессия концентрации",
    readyFocus: "Готовы сосредоточиться?",
    start25: "Начните 25-минутную сессию.",
    startFocus: "Начать сессию",
    todaysFocus: "Время концентрации сегодня",
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
    markCompleted: "Отметить выполненным",
    markActive: "Отметить активным",
  },

  tr: {
    dashboard: "Kontrol Paneli",
    openNotifications: "Bildirimleri aç",
    notifications: "Bildirimler",
    unreadNotification: "okunmamış bildirim",
    unreadNotifications: "okunmamış bildirim",
    caughtUp: "Tüm bildirimleri gördün",
    markAllRead: "Tümünü okundu olarak işaretle",
    loadingNotifications: "Bildirimler yükleniyor...",
    noNotifications: "Henüz bildirim yok.",
    justNow: "Az önce",
    minute: "dakika",
    minutes: "dakika",
    hour: "saat",
    hours: "saat",
    day: "gün",
    days: "gün",
    goodMorning: "Günaydın 👋",
    readyToStudy: "Ders çalışmaya hazır mısın",
    readyQuestion: "{name}, ders çalışmaya hazır mısın?",
    stayFocused:
      "Odaklan, görevlerini tamamla ve çalışma serini sürdür.",
    startPomodoro: "Pomodoro Başlat",
    tasksCompleted: "Tamamlanan görevler",
    noTasksYet: "Henüz görev yok",
    activeTask: "aktif görev",
    activeTasks: "aktif görev",
    remaining: "kaldı",
    studyTime: "Çalışma süresi",
    loading: "Yükleniyor...",
    thisWeek: "bu hafta",
    studyStreak: "Çalışma serisi",
    keepStreak: "Çalışma serini devam ettir!",
    buildStreak: "Serini oluşturmak için çalışmaya başla",
    weeklyGoal: "Haftalık hedef",
    of10Hours: "10 saatin",
    todaysTasks: "Bugünün görevleri",
    keepOrganized: "Gününü düzenli tut.",
    viewAll: "Tümünü gör",
    loadingTasks: "Görevler yükleniyor...",
    createFirstTask: "Başlamak için ilk görevini oluştur.",
    createTask: "Görev oluştur",
    addNewTask: "+ Yeni görev ekle",
    todaysSchedule: "Bugünün programı",
    plannedSessions: "Planlanan çalışma oturumların.",
    planner: "Planlayıcı",
    plannerAvailable: "Planlayıcı oturumları hazır",
    openPlanner:
      "Çalışma programını görmek ve yönetmek için planlayıcıyı aç.",
    openPlannerArrow: "Planlayıcıyı aç →",
    weeklyProgress: "Haftalık ilerleme",
    studyActivity: "Çalışma etkinliğin.",
    studiedThisWeek: "bu hafta çalışıldı.",
    detailedProgress: "Detaylı ilerlemeyi gör →",
    quickActions: "Hızlı işlemler",
    newNote: "Yeni not",
    newTask: "Yeni görev",
    joinGroup: "Gruba katıl",
    focusSession: "Odaklanma oturumu",
    readyFocus: "Odaklanmaya hazır mısın?",
    start25: "25 dakikalık bir oturum başlat.",
    startFocus: "Odaklanma oturumunu başlat",
    todaysFocus: "Bugünün odaklanma süresi",
    high: "Yüksek",
    medium: "Orta",
    low: "Düşük",
    markCompleted: "Tamamlandı olarak işaretle",
    markActive: "Aktif olarak işaretle",
  },

  hi: {
    dashboard: "डैशबोर्ड",
    openNotifications: "सूचनाएँ खोलें",
    notifications: "सूचनाएँ",
    unreadNotification: "अपठित सूचना",
    unreadNotifications: "अपठित सूचनाएँ",
    caughtUp: "आप सभी सूचनाएँ देख चुके हैं",
    markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
    loadingNotifications: "सूचनाएँ लोड हो रही हैं...",
    noNotifications: "अभी कोई सूचना नहीं है।",
    justNow: "अभी",
    minute: "मिनट",
    minutes: "मिनट",
    hour: "घंटा",
    hours: "घंटे",
    day: "दिन",
    days: "दिन",
    goodMorning: "सुप्रभात 👋",
    readyToStudy: "पढ़ाई के लिए तैयार",
    readyQuestion: "{name}, पढ़ाई के लिए तैयार हैं?",
    stayFocused:
      "ध्यान केंद्रित रखें, अपने कार्य पूरे करें और अपनी पढ़ाई की स्ट्रीक जारी रखें।",
    startPomodoro: "पोमोडोरो शुरू करें",
    tasksCompleted: "पूरे किए गए कार्य",
    noTasksYet: "अभी कोई कार्य नहीं है",
    activeTask: "सक्रिय कार्य",
    activeTasks: "सक्रिय कार्य",
    remaining: "बाकी",
    studyTime: "पढ़ाई का समय",
    loading: "लोड हो रहा है...",
    thisWeek: "इस सप्ताह",
    studyStreak: "पढ़ाई की स्ट्रीक",
    keepStreak: "अपनी पढ़ाई की स्ट्रीक जारी रखें!",
    buildStreak: "अपनी स्ट्रीक बनाने के लिए पढ़ाई शुरू करें",
    weeklyGoal: "साप्ताहिक लक्ष्य",
    of10Hours: "10 घंटे में से",
    todaysTasks: "आज के कार्य",
    keepOrganized: "अपने दिन को व्यवस्थित रखें।",
    viewAll: "सभी देखें",
    loadingTasks: "कार्य लोड हो रहे हैं...",
    createFirstTask: "शुरू करने के लिए अपना पहला कार्य बनाएँ।",
    createTask: "कार्य बनाएँ",
    addNewTask: "+ नया कार्य जोड़ें",
    todaysSchedule: "आज का शेड्यूल",
    plannedSessions: "आपके नियोजित अध्ययन सत्र।",
    planner: "प्लानर",
    plannerAvailable: "प्लानर सत्र उपलब्ध हैं",
    openPlanner:
      "अपना अध्ययन शेड्यूल देखने और प्रबंधित करने के लिए प्लानर खोलें।",
    openPlannerArrow: "प्लानर खोलें →",
    weeklyProgress: "साप्ताहिक प्रगति",
    studyActivity: "आपकी अध्ययन गतिविधि।",
    studiedThisWeek: "इस सप्ताह पढ़ाई की गई।",
    detailedProgress: "विस्तृत प्रगति देखें →",
    quickActions: "त्वरित कार्य",
    newNote: "नया नोट",
    newTask: "नया कार्य",
    joinGroup: "समूह में शामिल हों",
    focusSession: "फोकस सत्र",
    readyFocus: "ध्यान केंद्रित करने के लिए तैयार हैं?",
    start25: "25 मिनट का सत्र शुरू करें।",
    startFocus: "फोकस सत्र शुरू करें",
    todaysFocus: "आज का फोकस समय",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
    markCompleted: "पूर्ण के रूप में चिह्नित करें",
    markActive: "सक्रिय के रूप में चिह्नित करें",
  },
} as const;

type DashboardLanguage = keyof typeof dashboardTranslations;

export default function Dashboard() {
  const { language } = useLanguage();

  const isArabic = language === "ar";

  const text =
    dashboardTranslations[
      language as DashboardLanguage
    ] || dashboardTranslations.en;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [notificationsLoading, setNotificationsLoading] =
    useState(true);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const [pomodoroStats, setPomodoroStats] =
    useState<PomodoroStats>({
      sessions: 0,
      totalMinutes: 0,
      todaySessions: 0,
      todayMinutes: 0,
      weeklyMinutes: 0,
      currentStreak: 0,
    });

  const [pomodoroLoading, setPomodoroLoading] =
    useState(true);

  useEffect(() => {
    function updateDate() {
      const today = new Date();

      const localeMap: Record<string, string> = {
        en: "en-US",
        ar: "ar-EG",
        es: "es-ES",
        fr: "fr-FR",
        pt: "pt-BR",
        it: "it-IT",
        de: "de-DE",
        zh: "zh-CN",
        ja: "ja-JP",
        ko: "ko-KR",
        ru: "ru-RU",
        tr: "tr-TR",
        hi: "hi-IN",
      };

      const formattedDate =
        today.toLocaleDateString(
          localeMap[language] || "en-US",
          {
            weekday: "long",
            month: "long",
            day: "numeric",
          }
        );

      setCurrentDate(formattedDate);
    }

    updateDate();

    const dateInterval = window.setInterval(
      updateDate,
      60 * 1000
    );

    const savedDarkMode =
      localStorage.getItem("studyhubDarkMode") === "true";

    setDarkMode(savedDarkMode);

    const savedImage =
      localStorage.getItem("studyhubProfileImage") || "";

    setProfileImage(savedImage);

    const savedUser =
      localStorage.getItem("studyhubUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("studyhubUser");
      }
    }

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.authenticated && data.user) {
          setUser(data.user);

          localStorage.setItem(
            "studyhubUser",
            JSON.stringify(data.user)
          );
        }
      } catch {
        // Keep local user data if request fails.
      }
    }

    async function loadTasks() {
      try {
        setTasksLoading(true);

        const response = await fetch("/api/tasks", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
      } catch (error) {
        console.error(
          "LOAD DASHBOARD TASKS ERROR:",
          error
        );
      } finally {
        setTasksLoading(false);
      }
    }

    async function loadNotifications() {
      try {
        setNotificationsLoading(true);

        const response = await fetch(
          "/api/notifications",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (Array.isArray(data.notifications)) {
          const formattedNotifications =
            data.notifications.map(
              (notification: {
                id: number;
                type?: string;
                title: string;
                message: string;
                link?: string | null;
                is_read?: number | boolean;
                created_at?: string;
              }) => ({
                id: notification.id,
                type:
                  notification.type || "general",
                title: notification.title,
                message: notification.message,
                link:
                  notification.link || null,
                isRead: Boolean(
                  notification.is_read
                ),
                createdAt:
                  notification.created_at ||
                  new Date().toISOString(),
              })
            );

          setNotifications(
            formattedNotifications
          );

          if (
            typeof data.unreadCount === "number"
          ) {
            setUnreadNotifications(
              data.unreadCount
            );
          } else {
            setUnreadNotifications(
              formattedNotifications.filter(
                (notification: Notification) =>
                  !notification.isRead
              ).length
            );
          }
        }
      } catch (error) {
        console.error(
          "LOAD DASHBOARD NOTIFICATIONS ERROR:",
          error
        );
      } finally {
        setNotificationsLoading(false);
      }
    }

    async function loadPomodoroStats() {
      try {
        setPomodoroLoading(true);

        const response = await fetch(
          "/api/pomodoro",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        setPomodoroStats({
          sessions: data.sessions || 0,
          totalMinutes:
            data.totalMinutes || 0,
          todaySessions:
            data.todaySessions || 0,
          todayMinutes:
            data.todayMinutes || 0,
          weeklyMinutes:
            data.weeklyMinutes || 0,
          currentStreak:
            data.currentStreak || 0,
        });
      } catch (error) {
        console.error(
          "LOAD DASHBOARD POMODORO ERROR:",
          error
        );
      } finally {
        setPomodoroLoading(false);
      }
    }

    loadUser();
    loadTasks();
    loadNotifications();
    loadPomodoroStats();

    function updateDarkMode() {
      const value =
        localStorage.getItem(
          "studyhubDarkMode"
        ) === "true";

      setDarkMode(value);
    }

    function updateProfileImage() {
      const image =
        localStorage.getItem(
          "studyhubProfileImage"
        ) || "";

      setProfileImage(image);
    }

    window.addEventListener(
      "studyhub-dark-mode-updated",
      updateDarkMode
    );

    window.addEventListener(
      "studyhub-profile-image-updated",
      updateProfileImage
    );

    window.addEventListener(
      "storage",
      updateDarkMode
    );

    window.addEventListener(
      "storage",
      updateProfileImage
    );

    return () => {
      window.clearInterval(dateInterval);

      window.removeEventListener(
        "studyhub-dark-mode-updated",
        updateDarkMode
      );

      window.removeEventListener(
        "studyhub-profile-image-updated",
        updateProfileImage
      );

      window.removeEventListener(
        "storage",
        updateDarkMode
      );

      window.removeEventListener(
        "storage",
        updateProfileImage
      );
    };
  }, [language]);

  async function toggleTask(id: number) {
    const task = tasks.find(
      (item) => item.id === id
    );

    if (!task) return;

    const newCompleted = !task.completed;

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: newCompleted,
            }
          : item
      )
    );

    try {
      const response = await fetch(
        `/api/tasks/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: newCompleted,
          }),
        }
      );

      if (!response.ok) {
        setTasks((currentTasks) =>
          currentTasks.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completed: task.completed,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "TOGGLE DASHBOARD TASK ERROR:",
        error
      );

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === id
            ? {
                ...item,
                completed: task.completed,
              }
            : item
        )
      );
    }
  }

  async function markNotificationAsRead(
    id: number
  ) {
    const notification =
      notifications.find(
        (item) => item.id === id
      );

    if (
      !notification ||
      notification.isRead
    ) {
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              isRead: true,
            }
          : item
      )
    );

    setUnreadNotifications((current) =>
      Math.max(0, current - 1)
    );

    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            isRead: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notification as read"
        );
      }
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                isRead: false,
              }
            : item
        )
      );

      setUnreadNotifications(
        (current) => current + 1
      );
    }
  }

  async function markAllNotificationsAsRead() {
    const previousNotifications =
      notifications;

    const previousUnread =
      unreadNotifications;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    setUnreadNotifications(0);

    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markAll: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark all notifications as read"
        );
      }
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS ERROR:",
        error
      );

      setNotifications(
        previousNotifications
      );

      setUnreadNotifications(
        previousUnread
      );
    }
  }

  function formatNotificationTime(
    createdAt: string
  ) {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return text.justNow;
    }

    if (minutes < 60) {
      if (language === "ar") {
        return `منذ ${minutes} ${
          minutes === 1
            ? "دقيقة"
            : minutes === 2
              ? "دقيقتين"
              : "دقائق"
        }`;
      }

      return `${minutes} ${
        minutes === 1
          ? text.minute
          : text.minutes
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      if (language === "ar") {
        return `منذ ${hours} ${
          hours === 1
            ? "ساعة"
            : hours === 2
              ? "ساعتين"
              : "ساعات"
        }`;
      }

      return `${hours} ${
        hours === 1
          ? text.hour
          : text.hours
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      if (language === "ar") {
        return `منذ ${days} ${
          days === 1
            ? "يوم"
            : days === 2
              ? "يومين"
              : "أيام"
        }`;
      }

      return `${days} ${
        days === 1
          ? text.day
          : text.days
      } ago`;
    }

    const localeMap: Record<string, string> = {
      en: "en-US",
      ar: "ar-EG",
      es: "es-ES",
      fr: "fr-FR",
      pt: "pt-BR",
      it: "it-IT",
      de: "de-DE",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      ru: "ru-RU",
      tr: "tr-TR",
      hi: "hi-IN",
    };

    return date.toLocaleDateString(
      localeMap[language] || "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  }

  function formatStudyTime(
    minutes: number
  ) {
    if (minutes < 60) {
      if (language === "ar") {
        return `${minutes}د`;
      }

      return `${minutes}m`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remainingMinutes =
      minutes % 60;

    if (remainingMinutes === 0) {
      if (language === "ar") {
        return `${hours}س`;
      }

      return `${hours}h`;
    }

    if (language === "ar") {
      return `${hours}س ${remainingMinutes}د`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  const username =
    user?.username ||
    (isArabic ? "طالب" : "Student");

  const avatarLetter =
    username.charAt(0).toUpperCase() ||
    "S";

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const activeTasks =
    tasks.filter(
      (task) => !task.completed
    ).length;

  const totalTasks = tasks.length;

  const weeklyGoalMinutes = 10 * 60;

  const weeklyProgress = Math.min(
    Math.round(
      (pomodoroStats.weeklyMinutes /
        weeklyGoalMinutes) *
        100
    ),
    100
  );

  function toggleNotifications() {
    setNotificationsOpen(
      (current) => !current
    );
  }

  const taskRemainingText =
    activeTasks === 1
      ? `${activeTasks} ${text.activeTask} ${text.remaining}`
      : `${activeTasks} ${text.activeTasks} ${text.remaining}`;

  const streakText =
    language === "ar"
      ? `${pomodoroStats.currentStreak} ${
          pomodoroStats.currentStreak === 1
            ? "يوم"
            : "أيام"
        }`
      : `${pomodoroStats.currentStreak} ${
          pomodoroStats.currentStreak === 1
            ? text.day
            : text.days
        }`;

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className={`min-h-screen transition-colors ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Sidebar />

      <div
        className={
          isArabic
            ? "lg:pr-64"
            : "lg:pl-64"
        }
      >
        <header
          className={`sticky top-0 z-20 border-b backdrop-blur ${
            darkMode
              ? "border-slate-800 bg-slate-900/95"
              : "border-slate-200 bg-white/95"
          }`}
        >
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <p
                className={`text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {currentDate}
              </p>

              <h1 className="mt-1 text-xl font-bold">
                {text.dashboard}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={
                    toggleNotifications
                  }
                  aria-label={
                    text.openNotifications
                  }
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">
                    🔔
                  </span>

                  {unreadNotifications >
                    0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {
                        unreadNotifications
                      }
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className={`absolute ${
                      isArabic
                        ? "left-0"
                        : "right-0"
                    } top-12 w-80 overflow-hidden rounded-2xl border shadow-xl ${
                      darkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between border-b px-4 py-4 ${
                        darkMode
                          ? "border-slate-800"
                          : "border-slate-200"
                      }`}
                    >
                      <div>
                        <h3 className="font-bold">
                          {text.notifications}
                        </h3>

                        <p
                          className={`mt-1 text-xs ${
                            darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {unreadNotifications >
                          0
                            ? `${unreadNotifications} ${
                                unreadNotifications ===
                                1
                                  ? text.unreadNotification
                                  : text.unreadNotifications
                              }`
                            : text.caughtUp}
                        </p>
                      </div>

                      {unreadNotifications >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsAsRead
                          }
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          {text.markAllRead}
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="px-4 py-8 text-center">
                          <p
                            className={`text-sm ${
                              darkMode
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            {
                              text.loadingNotifications
                            }
                          </p>
                        </div>
                      ) : notifications.length ===
                        0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-2xl">
                            🔔
                          </p>

                          <p
                            className={`mt-2 text-sm ${
                              darkMode
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            {
                              text.noNotifications
                            }
                          </p>
                        </div>
                      ) : (
                        notifications.map(
                          (
                            notification
                          ) => (
                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() =>
                                markNotificationAsRead(
                                  notification.id
                                )
                              }
                              className={`flex w-full gap-3 border-b p-4 text-start transition last:border-b-0 ${
                                darkMode
                                  ? notification.isRead
                                    ? "border-slate-800 hover:bg-slate-800"
                                    : "border-slate-800 bg-indigo-950/40 hover:bg-indigo-950"
                                  : notification.isRead
                                    ? "border-slate-100 hover:bg-slate-50"
                                    : "border-slate-100 bg-indigo-50/60 hover:bg-indigo-50"
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                  notification.isRead
                                    ? darkMode
                                      ? "bg-slate-800"
                                      : "bg-slate-100"
                                    : "bg-indigo-100"
                                }`}
                              >
                                🔔
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                                  )}
                                </div>

                                <p
                                  className={`mt-1 text-xs ${
                                    darkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {
                                    notification.message
                                  }
                                </p>

                                <p
                                  className={`mt-2 text-[10px] ${
                                    darkMode
                                      ? "text-slate-500"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {formatNotificationTime(
                                    notification.createdAt
                                  )}
                                </p>
                              </div>
                            </button>
                          )
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`hidden h-10 items-center gap-3 rounded-xl border px-3 sm:flex ${
                  darkMode
                    ? "border-slate-700 bg-slate-800"
                    : "border-slate-200 bg-white"
                }`}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${username} profile`}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {avatarLetter}
                  </div>
                )}

                <span className="max-w-32 truncate text-sm font-medium">
                  {username}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <section className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-100 lg:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-indigo-100">
                  {text.goodMorning}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {text.readyQuestion.replace(
                    "{name}",
                    username
                  )}
                </h2>

                <p className="mt-2 max-w-xl text-indigo-100">
                  {text.stayFocused}
                </p>
              </div>

              <a
                href="/pomodoro"
                className="w-fit rounded-xl bg-white px-5 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                {text.startPomodoro}
              </a>
            </div>
          </section>

          {/* Stats */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="✓"
              title={text.tasksCompleted}
              value={`${completedTasks}/${totalTasks}`}
              description={
                totalTasks === 0
                  ? text.noTasksYet
                  : taskRemainingText
              }
              darkMode={darkMode}
            />

            <StatCard
              icon="◷"
              title={text.studyTime}
              value={
                pomodoroLoading
                  ? "..."
                  : formatStudyTime(
                      pomodoroStats.totalMinutes
                    )
              }
              description={
                pomodoroLoading
                  ? text.loading
                  : `+${formatStudyTime(
                      pomodoroStats.weeklyMinutes
                    )} ${text.thisWeek}`
              }
              darkMode={darkMode}
            />

            <StatCard
              icon="🔥"
              title={text.studyStreak}
              value={
                pomodoroLoading
                  ? "..."
                  : streakText
              }
              description={
                pomodoroLoading
                  ? text.loading
                  : pomodoroStats.currentStreak >
                      0
                    ? text.keepStreak
                    : text.buildStreak
              }
              darkMode={darkMode}
            />

            <StatCard
              icon="◎"
              title={text.weeklyGoal}
              value={`${weeklyProgress}%`}
              description={`${formatStudyTime(
                pomodoroStats.weeklyMinutes
              )} ${text.of10Hours}`}
              darkMode={darkMode}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Tasks */}
            <div
              className={`rounded-2xl border ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b p-5 ${
                  darkMode
                    ? "border-slate-800"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <h2 className="font-bold">
                    {text.todaysTasks}
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {text.keepOrganized}
                  </p>
                </div>

                <a
                  href="/tasks"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {text.viewAll}
                </a>
              </div>

              <div
                className={`divide-y ${
                  darkMode
                    ? "divide-slate-800"
                    : "divide-slate-100"
                }`}
              >
                {tasksLoading ? (
                  <div className="p-8 text-center">
                    <p
                      className={`text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {text.loadingTasks}
                    </p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      ✓
                    </div>

                    <p className="mt-3 font-semibold">
                      {text.noTasksYet}
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {text.createFirstTask}
                    </p>

                    <a
                      href="/tasks"
                      className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      {text.createTask}
                    </a>
                  </div>
                ) : (
                  tasks
                    .slice(0, 5)
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onClick={() =>
                          toggleTask(task.id)
                        }
                        darkMode={darkMode}
                        text={text}
                      />
                    ))
                )}
              </div>

              <div className="p-5">
                <a
                  href="/tasks"
                  className={`block w-full rounded-xl border border-dashed py-3 text-center text-sm font-semibold transition ${
                    darkMode
                      ? "border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
                      : "border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {text.addNewTask}
                </a>
              </div>
            </div>

            {/* Schedule */}
            <div
              className={`rounded-2xl border ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b p-5 ${
                  darkMode
                    ? "border-slate-800"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <h2 className="font-bold">
                    {text.todaysSchedule}
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {text.plannedSessions}
                  </p>
                </div>

                <a
                  href="/planner"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {text.planner}
                </a>
              </div>

              <div className="space-y-1 p-5">
                <div
                  className={`rounded-xl p-4 ${
                    darkMode
                      ? "bg-slate-800"
                      : "bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {text.plannerAvailable}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {text.openPlanner}
                  </p>

                  <a
                    href="/planner"
                    className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {text.openPlannerArrow}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Cards */}
          <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* Weekly Progress */}
            <div
              className={`rounded-2xl border p-5 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    {text.weeklyProgress}
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {text.studyActivity}
                  </p>
                </div>

                <span className="text-sm font-semibold text-indigo-600">
                  {weeklyProgress}%
                </span>
              </div>

              <div
                className={`mt-6 h-3 overflow-hidden rounded-full ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-slate-100"
                }`}
              >
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${weeklyProgress}%`,
                  }}
                />
              </div>

              <div
                className={`mt-4 flex justify-between text-xs ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                <span>0h</span>
                <span>5h</span>
                <span>10h</span>
              </div>

              <p
                className={`mt-4 text-sm ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                {formatStudyTime(
                  pomodoroStats.weeklyMinutes
                )}{" "}
                {text.studiedThisWeek}
              </p>

              <a
                href="/progress"
                className="mt-5 block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {text.detailedProgress}
              </a>
            </div>

            {/* Quick Actions */}
            <div
              className={`rounded-2xl border p-5 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="font-bold">
                {text.quickActions}
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <QuickAction
                  href="/notes"
                  icon="✎"
                  label={text.newNote}
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/tasks"
                  icon="✓"
                  label={text.newTask}
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/pomodoro"
                  icon="◷"
                  label="Pomodoro"
                  darkMode={darkMode}
                />

                <QuickAction
                  href="/groups"
                  icon="👥"
                  label={text.joinGroup}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* Focus Session */}
            <div
              className={`rounded-2xl border p-5 md:col-span-2 xl:col-span-1 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="font-bold">
                {text.focusSession}
              </h2>

              <div
                className={`mt-5 flex items-center justify-between rounded-xl p-4 ${
                  darkMode
                    ? "bg-indigo-950"
                    : "bg-indigo-50"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      darkMode
                        ? "text-indigo-200"
                        : "text-indigo-900"
                    }`}
                  >
                    {text.readyFocus}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? "text-indigo-300"
                        : "text-indigo-600"
                    }`}
                  >
                    {text.start25}
                  </p>
                </div>

                <a
                  href="/pomodoro"
                  aria-label={
                    text.startFocus
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700"
                >
                  ▶
                </a>
              </div>

              <div
                className={`mt-4 rounded-xl p-4 ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {text.todaysFocus}
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatStudyTime(
                    pomodoroStats.todayMinutes
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type DashboardText =
  (typeof dashboardTranslations)[keyof typeof dashboardTranslations];

function StatCard({
  icon,
  title,
  value,
  description,
  darkMode,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            darkMode
              ? "bg-indigo-950 text-indigo-300"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`mt-3 text-xs ${
          darkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function TaskItem({
  task,
  onClick,
  darkMode,
  text,
}: {
  task: Task;
  onClick: () => void;
  darkMode: boolean;
 text: DashboardText;
}) {
  const priorityLabel =
    task.priority === "High"
      ? text.high
      : task.priority === "Medium"
        ? text.medium
        : text.low;

  return (
    <div
      className={`flex items-center gap-4 p-5 transition ${
        darkMode
          ? "hover:bg-slate-800"
          : "hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={
          task.completed
            ? text.markActive
            : text.markCompleted
        }
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          task.completed
            ? "border-indigo-600 bg-indigo-600 text-xs text-white"
            : darkMode
              ? "border-slate-600 hover:border-indigo-500"
              : "border-slate-300 hover:border-indigo-500"
        }`}
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            task.completed
              ? "text-slate-400 line-through"
              : darkMode
                ? "text-slate-200"
                : "text-slate-800"
          }`}
        >
          {task.title}
        </p>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          {task.subject}
        </p>
      </div>

      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          task.priority === "High"
            ? "bg-red-50 text-red-600"
            : task.priority === "Medium"
              ? "bg-yellow-50 text-yellow-600"
              : "bg-green-50 text-green-600"
        }`}
      >
        {priorityLabel}
      </span>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  darkMode,
}: {
  href: string;
  icon: string;
  label: string;
  darkMode: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
        darkMode
          ? "border-slate-700 text-slate-300 hover:border-indigo-700 hover:bg-indigo-950 hover:text-indigo-300"
          : "border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </a>
  );
}
