"use client";

import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type Subject = {
  name: string;
  completed: number;
  total: number;
  hours: number;
  color: string;
};

type Activity = {
  day: string;
  hours: number;
};

const subjects: Subject[] = [
  {
    name: "Programming",
    completed: 18,
    total: 24,
    hours: 14.5,
    color: "blue",
  },
  {
    name: "Database",
    completed: 12,
    total: 16,
    hours: 9,
    color: "purple",
  },
  {
    name: "Mathematics",
    completed: 15,
    total: 20,
    hours: 11.5,
    color: "green",
  },
  {
    name: "English",
    completed: 10,
    total: 12,
    hours: 7,
    color: "orange",
  },
];

const activityData: Activity[] = [
  { day: "Sat", hours: 2.5 },
  { day: "Sun", hours: 3.5 },
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 4 },
  { day: "Wed", hours: 3 },
  { day: "Thu", hours: 2 },
  { day: "Fri", hours: 1 },
];

const progressTranslations = {
  en: {
    analytics: "Analytics",
    myProgress: "My Progress",
    thisWeek: "This Week",
    thisMonth: "This Month",
    completionRate: "Completion Rate",
    fromLastWeek: "+8% from last week",
    tasksCompleted: "Tasks Completed",
    totalTasks: "total tasks",
    studyHours: "Study Hours",
    thisWeekHours: "this week",
    currentStreak: "Current Streak",
    keepItGoing: "Keep it going!",
    studyActivity: "Study Activity",
    hoursStudiedDuring: "Hours studied during",
    overallProgress: "Overall Progress",
    studyCompletion: "Your study completion",
    completed: "Completed",
    remaining: "Remaining",
    progressBySubject: "Progress by Subject",
    subjectDescription: "See how you're doing across your subjects",
    hoursStudied: "hours studied",
    tasksCompletedOf: "tasks completed",
    recentAchievements: "Recent Achievements",
    achievementsDescription: "Keep building your study habits",
    sevenDayStreak: "7 Day Streak",
    sevenDayStreakDescription: "Studied for 7 days in a row",
    taskMaster: "Task Master",
    taskMasterDescription: "Completed 50 study tasks",
    tenHourWeek: "10 Hour Week",
    tenHourWeekDescription: "Studied more than 10 hours this week",
    earlyBird: "Early Bird",
    earlyBirdDescription: "Completed 5 morning study sessions",
    keepGoing: "Keep going!",
    keepGoingDescription:
      "You're making steady progress. Complete a few more tasks today to keep your streak and move closer to your goals.",
    viewMyTasks: "View My Tasks",
    programming: "Programming",
    database: "Database",
    mathematics: "Mathematics",
    english: "English",
    sat: "Sat",
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
  },

  ar: {
    analytics: "الإحصائيات",
    myProgress: "تقدمي",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
    completionRate: "نسبة الإنجاز",
    fromLastWeek: "+8% مقارنة بالأسبوع الماضي",
    tasksCompleted: "المهام المكتملة",
    totalTasks: "إجمالي المهام",
    studyHours: "ساعات الدراسة",
    thisWeekHours: "هذا الأسبوع",
    currentStreak: "سلسلة الاستمرارية",
    keepItGoing: "استمر هكذا!",
    studyActivity: "نشاط الدراسة",
    hoursStudiedDuring: "ساعات الدراسة خلال",
    overallProgress: "التقدم الإجمالي",
    studyCompletion: "نسبة إكمال دراستك",
    completed: "مكتمل",
    remaining: "متبقي",
    progressBySubject: "التقدم حسب المادة",
    subjectDescription: "شاهد مدى تقدمك في المواد الدراسية",
    hoursStudied: "ساعة دراسة",
    tasksCompletedOf: "من المهام مكتملة",
    recentAchievements: "الإنجازات الأخيرة",
    achievementsDescription: "استمر في بناء عاداتك الدراسية",
    sevenDayStreak: "استمرارية 7 أيام",
    sevenDayStreakDescription: "درست لمدة 7 أيام متتالية",
    taskMaster: "خبير المهام",
    taskMasterDescription: "أكملت 50 مهمة دراسية",
    tenHourWeek: "أسبوع 10 ساعات",
    tenHourWeekDescription: "درست أكثر من 10 ساعات هذا الأسبوع",
    earlyBird: "الطالب المبكر",
    earlyBirdDescription: "أكملت 5 جلسات دراسية صباحية",
    keepGoing: "استمر!",
    keepGoingDescription:
      "أنت تحقق تقدمًا ثابتًا. أنجز بعض المهام الإضافية اليوم للحفاظ على سلسلة الاستمرارية والاقتراب من أهدافك.",
    viewMyTasks: "عرض مهامي",
    programming: "البرمجة",
    database: "قواعد البيانات",
    mathematics: "الرياضيات",
    english: "اللغة الإنجليزية",
    sat: "السبت",
    sun: "الأحد",
    mon: "الاثنين",
    tue: "الثلاثاء",
    wed: "الأربعاء",
    thu: "الخميس",
    fri: "الجمعة",
  },

  es: {
    analytics: "Estadísticas",
    myProgress: "Mi progreso",
    thisWeek: "Esta semana",
    thisMonth: "Este mes",
    completionRate: "Tasa de finalización",
    fromLastWeek: "+8% desde la semana pasada",
    tasksCompleted: "Tareas completadas",
    totalTasks: "tareas en total",
    studyHours: "Horas de estudio",
    thisWeekHours: "esta semana",
    currentStreak: "Racha actual",
    keepItGoing: "¡Sigue así!",
    studyActivity: "Actividad de estudio",
    hoursStudiedDuring: "Horas estudiadas durante",
    overallProgress: "Progreso general",
    studyCompletion: "Tu progreso de estudio",
    completed: "Completado",
    remaining: "Restante",
    progressBySubject: "Progreso por materia",
    subjectDescription: "Mira cómo avanzas en tus materias",
    hoursStudied: "horas estudiadas",
    tasksCompletedOf: "tareas completadas",
    recentAchievements: "Logros recientes",
    achievementsDescription: "Sigue construyendo tus hábitos de estudio",
    sevenDayStreak: "Racha de 7 días",
    sevenDayStreakDescription: "Estudiaste durante 7 días seguidos",
    taskMaster: "Maestro de tareas",
    taskMasterDescription: "Completaste 50 tareas de estudio",
    tenHourWeek: "Semana de 10 horas",
    tenHourWeekDescription: "Estudiaste más de 10 horas esta semana",
    earlyBird: "Madrugador",
    earlyBirdDescription: "Completaste 5 sesiones de estudio matutinas",
    keepGoing: "¡Sigue adelante!",
    keepGoingDescription:
      "Estás progresando de forma constante. Completa algunas tareas más hoy para mantener tu racha y acercarte a tus objetivos.",
    viewMyTasks: "Ver mis tareas",
    programming: "Programación",
    database: "Base de datos",
    mathematics: "Matemáticas",
    english: "Inglés",
    sat: "Sáb",
    sun: "Dom",
    mon: "Lun",
    tue: "Mar",
    wed: "Mié",
    thu: "Jue",
    fri: "Vie",
  },

  fr: {
    analytics: "Statistiques",
    myProgress: "Ma progression",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois-ci",
    completionRate: "Taux de réussite",
    fromLastWeek: "+8% depuis la semaine dernière",
    tasksCompleted: "Tâches terminées",
    totalTasks: "tâches au total",
    studyHours: "Heures d'étude",
    thisWeekHours: "cette semaine",
    currentStreak: "Série actuelle",
    keepItGoing: "Continuez ainsi !",
    studyActivity: "Activité d'étude",
    hoursStudiedDuring: "Heures étudiées pendant",
    overallProgress: "Progression globale",
    studyCompletion: "Votre progression d'étude",
    completed: "Terminé",
    remaining: "Restant",
    progressBySubject: "Progression par matière",
    subjectDescription: "Voyez vos progrès dans vos matières",
    hoursStudied: "heures étudiées",
    tasksCompletedOf: "tâches terminées",
    recentAchievements: "Réalisations récentes",
    achievementsDescription: "Continuez à développer vos habitudes d'étude",
    sevenDayStreak: "Série de 7 jours",
    sevenDayStreakDescription: "Vous avez étudié 7 jours consécutifs",
    taskMaster: "Maître des tâches",
    taskMasterDescription: "Vous avez terminé 50 tâches d'étude",
    tenHourWeek: "Semaine de 10 heures",
    tenHourWeekDescription: "Vous avez étudié plus de 10 heures cette semaine",
    earlyBird: "Lève-tôt",
    earlyBirdDescription: "Vous avez terminé 5 séances d'étude matinales",
    keepGoing: "Continuez !",
    keepGoingDescription:
      "Vous progressez régulièrement. Terminez quelques tâches supplémentaires aujourd'hui pour maintenir votre série et vous rapprocher de vos objectifs.",
    viewMyTasks: "Voir mes tâches",
    programming: "Programmation",
    database: "Base de données",
    mathematics: "Mathématiques",
    english: "Anglais",
    sat: "Sam",
    sun: "Dim",
    mon: "Lun",
    tue: "Mar",
    wed: "Mer",
    thu: "Jeu",
    fri: "Ven",
  },

  pt: {
    analytics: "Análises",
    myProgress: "Meu progresso",
    thisWeek: "Esta semana",
    thisMonth: "Este mês",
    completionRate: "Taxa de conclusão",
    fromLastWeek: "+8% em relação à semana passada",
    tasksCompleted: "Tarefas concluídas",
    totalTasks: "tarefas no total",
    studyHours: "Horas de estudo",
    thisWeekHours: "esta semana",
    currentStreak: "Sequência atual",
    keepItGoing: "Continue assim!",
    studyActivity: "Atividade de estudo",
    hoursStudiedDuring: "Horas estudadas durante",
    overallProgress: "Progresso geral",
    studyCompletion: "Seu progresso de estudo",
    completed: "Concluído",
    remaining: "Restante",
    progressBySubject: "Progresso por matéria",
    subjectDescription: "Veja como você está indo em suas matérias",
    hoursStudied: "horas estudadas",
    tasksCompletedOf: "tarefas concluídas",
    recentAchievements: "Conquistas recentes",
    achievementsDescription: "Continue construindo seus hábitos de estudo",
    sevenDayStreak: "Sequência de 7 dias",
    sevenDayStreakDescription: "Você estudou por 7 dias seguidos",
    taskMaster: "Mestre das tarefas",
    taskMasterDescription: "Você concluiu 50 tarefas de estudo",
    tenHourWeek: "Semana de 10 horas",
    tenHourWeekDescription: "Você estudou mais de 10 horas esta semana",
    earlyBird: "Madrugador",
    earlyBirdDescription: "Você concluiu 5 sessões de estudo pela manhã",
    keepGoing: "Continue!",
    keepGoingDescription:
      "Você está fazendo um progresso constante. Conclua mais algumas tarefas hoje para manter sua sequência e se aproximar dos seus objetivos.",
    viewMyTasks: "Ver minhas tarefas",
    programming: "Programação",
    database: "Banco de dados",
    mathematics: "Matemática",
    english: "Inglês",
    sat: "Sáb",
    sun: "Dom",
    mon: "Seg",
    tue: "Ter",
    wed: "Qua",
    thu: "Qui",
    fri: "Sex",
  },

  it: {
    analytics: "Statistiche",
    myProgress: "I miei progressi",
    thisWeek: "Questa settimana",
    thisMonth: "Questo mese",
    completionRate: "Tasso di completamento",
    fromLastWeek: "+8% rispetto alla settimana scorsa",
    tasksCompleted: "Attività completate",
    totalTasks: "attività totali",
    studyHours: "Ore di studio",
    thisWeekHours: "questa settimana",
    currentStreak: "Serie attuale",
    keepItGoing: "Continua così!",
    studyActivity: "Attività di studio",
    hoursStudiedDuring: "Ore studiate durante",
    overallProgress: "Progresso complessivo",
    studyCompletion: "Il tuo completamento dello studio",
    completed: "Completato",
    remaining: "Rimanente",
    progressBySubject: "Progresso per materia",
    subjectDescription: "Scopri come stai andando nelle tue materie",
    hoursStudied: "ore studiate",
    tasksCompletedOf: "attività completate",
    recentAchievements: "Risultati recenti",
    achievementsDescription: "Continua a costruire le tue abitudini di studio",
    sevenDayStreak: "Serie di 7 giorni",
    sevenDayStreakDescription: "Hai studiato per 7 giorni consecutivi",
    taskMaster: "Maestro delle attività",
    taskMasterDescription: "Hai completato 50 attività di studio",
    tenHourWeek: "Settimana da 10 ore",
    tenHourWeekDescription: "Hai studiato più di 10 ore questa settimana",
    earlyBird: "Mattiniero",
    earlyBirdDescription: "Hai completato 5 sessioni di studio mattutine",
    keepGoing: "Continua!",
    keepGoingDescription:
      "Stai facendo progressi costanti. Completa qualche altra attività oggi per mantenere la tua serie e avvicinarti ai tuoi obiettivi.",
    viewMyTasks: "Visualizza le mie attività",
    programming: "Programmazione",
    database: "Database",
    mathematics: "Matematica",
    english: "Inglese",
    sat: "Sab",
    sun: "Dom",
    mon: "Lun",
    tue: "Mar",
    wed: "Mer",
    thu: "Gio",
    fri: "Ven",
  },

  de: {
    analytics: "Statistiken",
    myProgress: "Mein Fortschritt",
    thisWeek: "Diese Woche",
    thisMonth: "Dieser Monat",
    completionRate: "Abschlussrate",
    fromLastWeek: "+8% gegenüber letzter Woche",
    tasksCompleted: "Erledigte Aufgaben",
    totalTasks: "Aufgaben insgesamt",
    studyHours: "Lernstunden",
    thisWeekHours: "diese Woche",
    currentStreak: "Aktuelle Serie",
    keepItGoing: "Weiter so!",
    studyActivity: "Lernaktivität",
    hoursStudiedDuring: "Gelernte Stunden während",
    overallProgress: "Gesamtfortschritt",
    studyCompletion: "Dein Lernfortschritt",
    completed: "Abgeschlossen",
    remaining: "Verbleibend",
    progressBySubject: "Fortschritt nach Fach",
    subjectDescription: "Sieh dir deinen Fortschritt in deinen Fächern an",
    hoursStudied: "Lernstunden",
    tasksCompletedOf: "Aufgaben abgeschlossen",
    recentAchievements: "Letzte Erfolge",
    achievementsDescription: "Baue deine Lerngewohnheiten weiter aus",
    sevenDayStreak: "7-Tage-Serie",
    sevenDayStreakDescription: "Du hast 7 Tage hintereinander gelernt",
    taskMaster: "Aufgabenmeister",
    taskMasterDescription: "Du hast 50 Lernaufgaben abgeschlossen",
    tenHourWeek: "10-Stunden-Woche",
    tenHourWeekDescription: "Du hast diese Woche mehr als 10 Stunden gelernt",
    earlyBird: "Frühaufsteher",
    earlyBirdDescription: "Du hast 5 morgendliche Lerneinheiten abgeschlossen",
    keepGoing: "Weiter so!",
    keepGoingDescription:
      "Du machst stetige Fortschritte. Erledige heute noch ein paar Aufgaben, um deine Serie zu halten und deinen Zielen näher zu kommen.",
    viewMyTasks: "Meine Aufgaben anzeigen",
    programming: "Programmierung",
    database: "Datenbank",
    mathematics: "Mathematik",
    english: "Englisch",
    sat: "Sa",
    sun: "So",
    mon: "Mo",
    tue: "Di",
    wed: "Mi",
    thu: "Do",
    fri: "Fr",
  },

  zh: {
    analytics: "数据分析",
    myProgress: "我的进度",
    thisWeek: "本周",
    thisMonth: "本月",
    completionRate: "完成率",
    fromLastWeek: "比上周高 8%",
    tasksCompleted: "已完成任务",
    totalTasks: "任务总数",
    studyHours: "学习时长",
    thisWeekHours: "本周",
    currentStreak: "当前连续学习",
    keepItGoing: "继续保持！",
    studyActivity: "学习活动",
    hoursStudiedDuring: "期间学习时长",
    overallProgress: "总体进度",
    studyCompletion: "你的学习完成情况",
    completed: "已完成",
    remaining: "剩余",
    progressBySubject: "按科目查看进度",
    subjectDescription: "查看你在各科目中的学习进度",
    hoursStudied: "学习小时",
    tasksCompletedOf: "个任务已完成",
    recentAchievements: "最近成就",
    achievementsDescription: "继续培养你的学习习惯",
    sevenDayStreak: "连续学习 7 天",
    sevenDayStreakDescription: "你已经连续学习了 7 天",
    taskMaster: "任务达人",
    taskMasterDescription: "完成了 50 个学习任务",
    tenHourWeek: "10 小时学习周",
    tenHourWeekDescription: "本周学习超过 10 小时",
    earlyBird: "早起学习者",
    earlyBirdDescription: "完成了 5 次早晨学习",
    keepGoing: "继续加油！",
    keepGoingDescription:
      "你正在稳定进步。今天再完成几个任务，保持连续学习并更接近你的目标。",
    viewMyTasks: "查看我的任务",
    programming: "编程",
    database: "数据库",
    mathematics: "数学",
    english: "英语",
    sat: "周六",
    sun: "周日",
    mon: "周一",
    tue: "周二",
    wed: "周三",
    thu: "周四",
    fri: "周五",
  },

  ja: {
    analytics: "分析",
    myProgress: "学習の進捗",
    thisWeek: "今週",
    thisMonth: "今月",
    completionRate: "完了率",
    fromLastWeek: "先週より +8%",
    tasksCompleted: "完了したタスク",
    totalTasks: "合計タスク",
    studyHours: "学習時間",
    thisWeekHours: "今週",
    currentStreak: "現在の連続記録",
    keepItGoing: "この調子で！",
    studyActivity: "学習アクティビティ",
    hoursStudiedDuring: "期間中の学習時間",
    overallProgress: "全体の進捗",
    studyCompletion: "学習の完了状況",
    completed: "完了",
    remaining: "残り",
    progressBySubject: "科目別の進捗",
    subjectDescription: "各科目の進捗を確認しましょう",
    hoursStudied: "学習時間",
    tasksCompletedOf: "件のタスクを完了",
    recentAchievements: "最近の成果",
    achievementsDescription: "学習習慣をさらに伸ばしましょう",
    sevenDayStreak: "7日間連続学習",
    sevenDayStreakDescription: "7日間連続で学習しました",
    taskMaster: "タスクマスター",
    taskMasterDescription: "50個の学習タスクを完了しました",
    tenHourWeek: "10時間学習週間",
    tenHourWeekDescription: "今週10時間以上学習しました",
    earlyBird: "早起き学習者",
    earlyBirdDescription: "朝の学習セッションを5回完了しました",
    keepGoing: "頑張りましょう！",
    keepGoingDescription:
      "着実に進歩しています。今日さらにいくつかのタスクを完了して、連続記録を維持し目標に近づきましょう。",
    viewMyTasks: "タスクを見る",
    programming: "プログラミング",
    database: "データベース",
    mathematics: "数学",
    english: "英語",
    sat: "土",
    sun: "日",
    mon: "月",
    tue: "火",
    wed: "水",
    thu: "木",
    fri: "金",
  },

  ko: {
    analytics: "분석",
    myProgress: "내 학습 진행률",
    thisWeek: "이번 주",
    thisMonth: "이번 달",
    completionRate: "완료율",
    fromLastWeek: "지난주보다 +8%",
    tasksCompleted: "완료한 작업",
    totalTasks: "전체 작업",
    studyHours: "학습 시간",
    thisWeekHours: "이번 주",
    currentStreak: "현재 연속 기록",
    keepItGoing: "계속 이렇게 하세요!",
    studyActivity: "학습 활동",
    hoursStudiedDuring: "학습 시간",
    overallProgress: "전체 진행률",
    studyCompletion: "학습 완료 현황",
    completed: "완료",
    remaining: "남음",
    progressBySubject: "과목별 진행률",
    subjectDescription: "각 과목의 학습 진행 상황을 확인하세요",
    hoursStudied: "시간 학습",
    tasksCompletedOf: "개 작업 완료",
    recentAchievements: "최근 성과",
    achievementsDescription: "학습 습관을 계속 만들어 보세요",
    sevenDayStreak: "7일 연속 학습",
    sevenDayStreakDescription: "7일 동안 연속으로 공부했습니다",
    taskMaster: "작업 마스터",
    taskMasterDescription: "학습 작업 50개를 완료했습니다",
    tenHourWeek: "10시간 학습 주간",
    tenHourWeekDescription: "이번 주에 10시간 이상 공부했습니다",
    earlyBird: "얼리버드",
    earlyBirdDescription: "아침 학습 세션 5회를 완료했습니다",
    keepGoing: "계속 힘내세요!",
    keepGoingDescription:
      "꾸준히 발전하고 있습니다. 오늘 몇 가지 작업을 더 완료하여 연속 기록을 유지하고 목표에 가까워지세요.",
    viewMyTasks: "내 작업 보기",
    programming: "프로그래밍",
    database: "데이터베이스",
    mathematics: "수학",
    english: "영어",
    sat: "토",
    sun: "일",
    mon: "월",
    tue: "화",
    wed: "수",
    thu: "목",
    fri: "금",
  },

  ru: {
    analytics: "Аналитика",
    myProgress: "Мой прогресс",
    thisWeek: "Эта неделя",
    thisMonth: "Этот месяц",
    completionRate: "Процент выполнения",
    fromLastWeek: "+8% по сравнению с прошлой неделей",
    tasksCompleted: "Выполненные задачи",
    totalTasks: "всего задач",
    studyHours: "Часы учебы",
    thisWeekHours: "на этой неделе",
    currentStreak: "Текущая серия",
    keepItGoing: "Так держать!",
    studyActivity: "Учебная активность",
    hoursStudiedDuring: "Часы учебы за",
    overallProgress: "Общий прогресс",
    studyCompletion: "Ваш учебный прогресс",
    completed: "Выполнено",
    remaining: "Осталось",
    progressBySubject: "Прогресс по предметам",
    subjectDescription: "Посмотрите свой прогресс по предметам",
    hoursStudied: "часов учебы",
    tasksCompletedOf: "задач выполнено",
    recentAchievements: "Последние достижения",
    achievementsDescription: "Продолжайте формировать свои учебные привычки",
    sevenDayStreak: "Серия из 7 дней",
    sevenDayStreakDescription: "Вы учились 7 дней подряд",
    taskMaster: "Мастер задач",
    taskMasterDescription: "Вы выполнили 50 учебных задач",
    tenHourWeek: "Неделя на 10 часов",
    tenHourWeekDescription: "Вы учились более 10 часов на этой неделе",
    earlyBird: "Ранняя пташка",
    earlyBirdDescription: "Вы завершили 5 утренних учебных сессий",
    keepGoing: "Продолжайте!",
    keepGoingDescription:
      "Вы стабильно прогрессируете. Выполните еще несколько задач сегодня, чтобы сохранить серию и приблизиться к своим целям.",
    viewMyTasks: "Мои задачи",
    programming: "Программирование",
    database: "Базы данных",
    mathematics: "Математика",
    english: "Английский",
    sat: "Сб",
    sun: "Вс",
    mon: "Пн",
    tue: "Вт",
    wed: "Ср",
    thu: "Чт",
    fri: "Пт",
  },

  tr: {
    analytics: "Analizler",
    myProgress: "İlerlemem",
    thisWeek: "Bu Hafta",
    thisMonth: "Bu Ay",
    completionRate: "Tamamlama Oranı",
    fromLastWeek: "Geçen haftaya göre +8%",
    tasksCompleted: "Tamamlanan Görevler",
    totalTasks: "toplam görev",
    studyHours: "Çalışma Saatleri",
    thisWeekHours: "bu hafta",
    currentStreak: "Mevcut Seri",
    keepItGoing: "Böyle devam et!",
    studyActivity: "Çalışma Aktivitesi",
    hoursStudiedDuring: "Çalışılan saatler:",
    overallProgress: "Genel İlerleme",
    studyCompletion: "Çalışma tamamlanma durumun",
    completed: "Tamamlandı",
    remaining: "Kalan",
    progressBySubject: "Derse Göre İlerleme",
    subjectDescription: "Derslerindeki ilerlemeni gör",
    hoursStudied: "saat çalışıldı",
    tasksCompletedOf: "görev tamamlandı",
    recentAchievements: "Son Başarılar",
    achievementsDescription: "Çalışma alışkanlıklarını geliştirmeye devam et",
    sevenDayStreak: "7 Günlük Seri",
    sevenDayStreakDescription: "7 gün üst üste çalıştın",
    taskMaster: "Görev Ustası",
    taskMasterDescription: "50 çalışma görevi tamamladın",
    tenHourWeek: "10 Saatlik Hafta",
    tenHourWeekDescription: "Bu hafta 10 saatten fazla çalıştın",
    earlyBird: "Erken Başlayan",
    earlyBirdDescription: "5 sabah çalışma oturumu tamamladın",
    keepGoing: "Devam et!",
    keepGoingDescription:
      "Düzenli ilerleme kaydediyorsun. Serini korumak ve hedeflerine yaklaşmak için bugün birkaç görev daha tamamla.",
    viewMyTasks: "Görevlerimi Gör",
    programming: "Programlama",
    database: "Veritabanı",
    mathematics: "Matematik",
    english: "İngilizce",
    sat: "Cmt",
    sun: "Paz",
    mon: "Pzt",
    tue: "Sal",
    wed: "Çar",
    thu: "Per",
    fri: "Cum",
  },

  hi: {
    analytics: "विश्लेषण",
    myProgress: "मेरी प्रगति",
    thisWeek: "इस सप्ताह",
    thisMonth: "इस महीने",
    completionRate: "पूर्णता दर",
    fromLastWeek: "पिछले सप्ताह से +8%",
    tasksCompleted: "पूर्ण किए गए कार्य",
    totalTasks: "कुल कार्य",
    studyHours: "पढ़ाई के घंटे",
    thisWeekHours: "इस सप्ताह",
    currentStreak: "वर्तमान स्ट्रीक",
    keepItGoing: "इसे जारी रखें!",
    studyActivity: "अध्ययन गतिविधि",
    hoursStudiedDuring: "इस अवधि में पढ़ाई के घंटे",
    overallProgress: "कुल प्रगति",
    studyCompletion: "आपकी अध्ययन पूर्णता",
    completed: "पूर्ण",
    remaining: "शेष",
    progressBySubject: "विषय के अनुसार प्रगति",
    subjectDescription: "अपने विषयों में अपनी प्रगति देखें",
    hoursStudied: "घंटे पढ़ाई",
    tasksCompletedOf: "कार्य पूर्ण",
    recentAchievements: "हाल की उपलब्धियाँ",
    achievementsDescription: "अपनी अध्ययन आदतों को बेहतर बनाते रहें",
    sevenDayStreak: "7 दिन की स्ट्रीक",
    sevenDayStreakDescription: "आपने लगातार 7 दिनों तक पढ़ाई की",
    taskMaster: "टास्क मास्टर",
    taskMasterDescription: "आपने 50 अध्ययन कार्य पूरे किए",
    tenHourWeek: "10 घंटे का सप्ताह",
    tenHourWeekDescription: "आपने इस सप्ताह 10 घंटे से अधिक पढ़ाई की",
    earlyBird: "अर्ली बर्ड",
    earlyBirdDescription: "आपने सुबह के 5 अध्ययन सत्र पूरे किए",
    keepGoing: "आगे बढ़ते रहें!",
    keepGoingDescription:
      "आप लगातार प्रगति कर रहे हैं। अपनी स्ट्रीक बनाए रखने और लक्ष्यों के करीब पहुंचने के लिए आज कुछ और कार्य पूरे करें।",
    viewMyTasks: "मेरे कार्य देखें",
    programming: "प्रोग्रामिंग",
    database: "डेटाबेस",
    mathematics: "गणित",
    english: "अंग्रेज़ी",
    sat: "शनि",
    sun: "रवि",
    mon: "सोम",
    tue: "मंगल",
    wed: "बुध",
    thu: "गुरु",
    fri: "शुक्र",
  },
} as const;

export default function ProgressPage() {
  const { language } = useLanguage();

  const t =
    progressTranslations[
      language as keyof typeof progressTranslations
    ] || progressTranslations.en;

  const isArabic = language === "ar";

  const [period, setPeriod] = useState<string>(t.thisWeek);

  const totalCompleted = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.completed, 0),
    []
  );

  const totalTasks = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.total, 0),
    []
  );

  const totalHours = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.hours, 0),
    []
  );

  const completionRate = Math.round(
    (totalCompleted / totalTasks) * 100
  );

  const studyHours = activityData.reduce(
    (sum, item) => sum + item.hours,
    0
  );

  const maxHours = Math.max(
    ...activityData.map((item) => item.hours)
  );

  const periodIsWeek = period === t.thisWeek;

  const translatedSubjects = subjects.map((subject) => ({
    ...subject,
    name:
      subject.name === "Programming"
        ? t.programming
        : subject.name === "Database"
        ? t.database
        : subject.name === "Mathematics"
        ? t.mathematics
        : t.english,
  }));

  const translatedActivity = activityData.map((item) => ({
    ...item,
    day:
      item.day === "Sat"
        ? t.sat
        : item.day === "Sun"
        ? t.sun
        : item.day === "Mon"
        ? t.mon
        : item.day === "Tue"
        ? t.tue
        : item.day === "Wed"
        ? t.wed
        : item.day === "Thu"
        ? t.thu
        : t.fri,
  }));

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50"
    >
      <Sidebar />

      <main className={isArabic ? "lg:pr-64" : "lg:pl-64"}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div>
              <p className="text-sm text-slate-400">
                {t.analytics}
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                {t.myProgress}
              </h1>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              {[t.thisWeek, t.thisMonth].map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                    period === item
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProgressStat
              label={t.completionRate}
              value={`${completionRate}%`}
              detail={t.fromLastWeek}
              icon="↗"
            />

            <ProgressStat
              label={t.tasksCompleted}
              value={totalCompleted}
              detail={`${totalTasks} ${t.totalTasks}`}
              icon="✓"
            />

            <ProgressStat
              label={t.studyHours}
              value={`${totalHours}h`}
              detail={`${studyHours}h ${t.thisWeekHours}`}
              icon="◷"
            />

            <ProgressStat
              label={t.currentStreak}
              value="7 days"
              detail={t.keepItGoing}
              icon="★"
            />
          </section>

          <section className="mb-7 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {t.studyActivity}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {t.hoursStudiedDuring}{" "}
                    {periodIsWeek
                      ? t.thisWeek.toLowerCase()
                      : t.thisMonth.toLowerCase()}
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">
                  {studyHours}h
                </div>
              </div>

              <div className="mt-8 flex h-64 items-end gap-2 sm:gap-4">
                {translatedActivity.map((item) => {
                  const originalItem = activityData.find(
                    (activity) => {
                      const dayMap: Record<string, string> = {
                        [t.sat]: "Sat",
                        [t.sun]: "Sun",
                        [t.mon]: "Mon",
                        [t.tue]: "Tue",
                        [t.wed]: "Wed",
                        [t.thu]: "Thu",
                        [t.fri]: "Fri",
                      };

                      return (
                        dayMap[item.day] === activity.day
                      );
                    }
                  );

                  const hours =
                    originalItem?.hours ?? item.hours;

                  const height =
                    maxHours === 0
                      ? 0
                      : Math.max(
                          8,
                          (hours / maxHours) * 100
                        );

                  return (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold text-slate-500">
                        {hours}h
                      </span>

                      <div className="flex h-44 w-full items-end justify-center">
                        <div
                          className="w-full max-w-10 rounded-t-xl bg-indigo-500 transition-all duration-500 hover:bg-indigo-600"
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs font-medium text-slate-400">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t.overallProgress}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {t.studyCompletion}
                </p>
              </div>

              <div className="mt-7 flex items-center justify-center">
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-slate-100">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#4f46e5 ${
                        completionRate * 3.6
                      }deg, #e2e8f0 0deg)`,
                    }}
                  />

                  <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-bold text-slate-900">
                      {completionRate}%
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                      {t.completed}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <ProgressLegend
                  label={t.completed}
                  value={totalCompleted}
                  percentage={completionRate}
                  dot="bg-indigo-500"
                />

                <ProgressLegend
                  label={t.remaining}
                  value={totalTasks - totalCompleted}
                  percentage={100 - completionRate}
                  dot="bg-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {t.progressBySubject}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {t.subjectDescription}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {translatedSubjects.map((subject) => (
                <SubjectProgress
                  key={subject.name}
                  subject={subject}
                  labels={{
                    hoursStudied: t.hoursStudied,
                    tasksCompletedOf: t.tasksCompletedOf,
                  }}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  {t.recentAchievements}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {t.achievementsDescription}
                </p>
              </div>

              <div className="space-y-3">
                <Achievement
                  icon="🔥"
                  title={t.sevenDayStreak}
                  description={t.sevenDayStreakDescription}
                />

                <Achievement
                  icon="✓"
                  title={t.taskMaster}
                  description={t.taskMasterDescription}
                />

                <Achievement
                  icon="◷"
                  title={t.tenHourWeek}
                  description={t.tenHourWeekDescription}
                />

                <Achievement
                  icon="★"
                  title={t.earlyBird}
                  description={t.earlyBirdDescription}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm sm:p-6">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    🎯
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    {t.keepGoing}
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    {t.keepGoingDescription}
                  </p>
                </div>

                <a
                  href="/tasks"
                  className="mt-7 inline-flex w-fit rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {t.viewMyTasks}
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ProgressStat({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-emerald-600">
            {detail}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressLegend({
  label,
  value,
  percentage,
  dot,
}: {
  label: string;
  value: number;
  percentage: number;
  dot: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`h-3 w-3 rounded-full ${dot}`}
        />

        <span className="text-sm text-slate-600">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-800">
          {value}
        </span>

        <span className="text-xs text-slate-400">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function SubjectProgress({
  subject,
  labels,
}: {
  subject: Subject;
  labels: {
    hoursStudied: string;
    tasksCompletedOf: string;
  };
}) {
  const percentage = Math.round(
    (subject.completed / subject.total) * 100
  );

  const colorClasses: Record<
    string,
    { bg: string; text: string; bar: string }
  > = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      bar: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      bar: "bg-purple-500",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      bar: "bg-emerald-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      bar: "bg-orange-500",
    },
  };

  const colors = colorClasses[subject.color];

  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}
          >
            <span
              className={`text-sm font-bold ${colors.text}`}
            >
              {subject.name.charAt(0)}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {subject.name}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {subject.hours} {labels.hoursStudied}
            </p>
          </div>
        </div>

        <span
          className={`text-sm font-bold ${colors.text}`}
        >
          {percentage}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {subject.completed} {labels.tasksCompletedOf}{" "}
        {subject.total}
      </p>
    </div>
  );
}

function Achievement({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}