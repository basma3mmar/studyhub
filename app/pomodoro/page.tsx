"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type Mode = "focus" | "short" | "long";

const modes = {
  focus: {
    minutes: 25,
  },
  short: {
    minutes: 5,
  },
  long: {
    minutes: 15,
  },
};

const pomodoroTranslations = {
  en: {
    title: "Pomodoro",
    description:
      "Focus on your work, take regular breaks, and build a better study habit.",
    completedSessions: "Completed Sessions",
    studyTime: "Study Time",
    todaysGoal: "Today's Goal",
    sessions: "sessions",
    focus: "Focus",
    shortBreak: "Short Break",
    longBreak: "Long Break",
    stayFocused: "Stay focused...",
    ready: "Ready when you are",
    pause: "Pause",
    startFocus: "Start Focus",
    startBreak: "Start Break",
    reset: "Reset",
    howWorks: "How Pomodoro works",
    focusTip: "Focus",
    focusTipText:
      "Work on one task without distractions for 25 minutes.",
    breakTip: "Take a break",
    breakTipText:
      "Rest for 5 minutes before starting another session.",
    repeatTip: "Repeat",
    repeatTipText:
      "After four focus sessions, take a longer break.",
    todaysProgress: "Today's progress",
    progressDescription: "Complete 4 focus sessions today.",
    dailyGoalCompleted: "🎉 Daily goal completed!",
    dailyGoalDescription:
      "You completed today's focus goal.",
    keepGoing: "Keep going!",
    sessionsRemaining: "more sessions to reach your goal.",
    sessionRemaining: "more session to reach your goal.",
    todaysStudyTime: "Today's study time",
    minutes: "min",
  },

  ar: {
    title: "بومودورو",
    description:
      "ركّز على عملك، وخذ فترات راحة منتظمة، وابنِ عادة دراسية أفضل.",
    completedSessions: "الجلسات المكتملة",
    studyTime: "وقت الدراسة",
    todaysGoal: "هدف اليوم",
    sessions: "جلسات",
    focus: "تركيز",
    shortBreak: "استراحة قصيرة",
    longBreak: "استراحة طويلة",
    stayFocused: "استمر في التركيز...",
    ready: "جاهز عندما تكون مستعدًا",
    pause: "إيقاف مؤقت",
    startFocus: "ابدأ التركيز",
    startBreak: "ابدأ الاستراحة",
    reset: "إعادة ضبط",
    howWorks: "كيف يعمل بومودورو",
    focusTip: "التركيز",
    focusTipText:
      "اعمل على مهمة واحدة بدون تشتيت لمدة 25 دقيقة.",
    breakTip: "خذ استراحة",
    breakTipText:
      "استرح لمدة 5 دقائق قبل بدء جلسة أخرى.",
    repeatTip: "التكرار",
    repeatTipText:
      "بعد أربع جلسات تركيز، خذ استراحة أطول.",
    todaysProgress: "تقدم اليوم",
    progressDescription: "أكمل 4 جلسات تركيز اليوم.",
    dailyGoalCompleted: "🎉 تم تحقيق هدف اليوم!",
    dailyGoalDescription:
      "لقد أكملت هدف التركيز الخاص باليوم.",
    keepGoing: "استمر!",
    sessionsRemaining: "جلسات أخرى للوصول إلى هدفك.",
    sessionRemaining: "جلسة أخرى للوصول إلى هدفك.",
    todaysStudyTime: "وقت الدراسة اليوم",
    minutes: "دقيقة",
  },

  es: {
    title: "Pomodoro",
    description:
      "Concéntrate en tu trabajo, toma descansos regulares y crea un mejor hábito de estudio.",
    completedSessions: "Sesiones completadas",
    studyTime: "Tiempo de estudio",
    todaysGoal: "Objetivo de hoy",
    sessions: "sesiones",
    focus: "Concentración",
    shortBreak: "Descanso corto",
    longBreak: "Descanso largo",
    stayFocused: "Sigue concentrado...",
    ready: "Listo cuando tú lo estés",
    pause: "Pausar",
    startFocus: "Iniciar concentración",
    startBreak: "Iniciar descanso",
    reset: "Reiniciar",
    howWorks: "Cómo funciona Pomodoro",
    focusTip: "Concentración",
    focusTipText:
      "Trabaja en una tarea sin distracciones durante 25 minutos.",
    breakTip: "Toma un descanso",
    breakTipText:
      "Descansa 5 minutos antes de comenzar otra sesión.",
    repeatTip: "Repetir",
    repeatTipText:
      "Después de cuatro sesiones de concentración, toma un descanso más largo.",
    todaysProgress: "Progreso de hoy",
    progressDescription: "Completa 4 sesiones de concentración hoy.",
    dailyGoalCompleted: "🎉 ¡Objetivo diario completado!",
    dailyGoalDescription:
      "Has completado tu objetivo de concentración de hoy.",
    keepGoing: "¡Sigue adelante!",
    sessionsRemaining: "sesiones más para alcanzar tu objetivo.",
    sessionRemaining: "sesión más para alcanzar tu objetivo.",
    todaysStudyTime: "Tiempo de estudio de hoy",
    minutes: "min",
  },

  fr: {
    title: "Pomodoro",
    description:
      "Concentrez-vous sur votre travail, faites des pauses régulières et créez une meilleure habitude d'étude.",
    completedSessions: "Sessions terminées",
    studyTime: "Temps d'étude",
    todaysGoal: "Objectif du jour",
    sessions: "sessions",
    focus: "Concentration",
    shortBreak: "Pause courte",
    longBreak: "Pause longue",
    stayFocused: "Restez concentré...",
    ready: "Prêt quand vous l'êtes",
    pause: "Pause",
    startFocus: "Commencer",
    startBreak: "Commencer la pause",
    reset: "Réinitialiser",
    howWorks: "Comment fonctionne Pomodoro",
    focusTip: "Concentration",
    focusTipText:
      "Travaillez sur une seule tâche sans distraction pendant 25 minutes.",
    breakTip: "Faites une pause",
    breakTipText:
      "Reposez-vous pendant 5 minutes avant de commencer une autre session.",
    repeatTip: "Répéter",
    repeatTipText:
      "Après quatre sessions de concentration, prenez une pause plus longue.",
    todaysProgress: "Progrès du jour",
    progressDescription:
      "Terminez 4 sessions de concentration aujourd'hui.",
    dailyGoalCompleted: "🎉 Objectif quotidien atteint !",
    dailyGoalDescription:
      "Vous avez atteint votre objectif de concentration aujourd'hui.",
    keepGoing: "Continuez !",
    sessionsRemaining:
      "sessions supplémentaires pour atteindre votre objectif.",
    sessionRemaining:
      "session supplémentaire pour atteindre votre objectif.",
    todaysStudyTime: "Temps d'étude aujourd'hui",
    minutes: "min",
  },

  pt: {
    title: "Pomodoro",
    description:
      "Concentre-se no trabalho, faça pausas regulares e desenvolva um melhor hábito de estudo.",
    completedSessions: "Sessões concluídas",
    studyTime: "Tempo de estudo",
    todaysGoal: "Meta de hoje",
    sessions: "sessões",
    focus: "Foco",
    shortBreak: "Pausa curta",
    longBreak: "Pausa longa",
    stayFocused: "Continue focado...",
    ready: "Pronto quando você estiver",
    pause: "Pausar",
    startFocus: "Iniciar foco",
    startBreak: "Iniciar pausa",
    reset: "Reiniciar",
    howWorks: "Como o Pomodoro funciona",
    focusTip: "Foco",
    focusTipText:
      "Trabalhe em uma tarefa sem distrações por 25 minutos.",
    breakTip: "Faça uma pausa",
    breakTipText:
      "Descanse por 5 minutos antes de iniciar outra sessão.",
    repeatTip: "Repetir",
    repeatTipText:
      "Depois de quatro sessões de foco, faça uma pausa mais longa.",
    todaysProgress: "Progresso de hoje",
    progressDescription: "Complete 4 sessões de foco hoje.",
    dailyGoalCompleted: "🎉 Meta diária concluída!",
    dailyGoalDescription:
      "Você concluiu sua meta de foco de hoje.",
    keepGoing: "Continue!",
    sessionsRemaining:
      "sessões restantes para alcançar sua meta.",
    sessionRemaining:
      "sessão restante para alcançar sua meta.",
    todaysStudyTime: "Tempo de estudo hoje",
    minutes: "min",
  },

  it: {
    title: "Pomodoro",
    description:
      "Concentrati sul lavoro, fai pause regolari e costruisci una migliore abitudine di studio.",
    completedSessions: "Sessioni completate",
    studyTime: "Tempo di studio",
    todaysGoal: "Obiettivo di oggi",
    sessions: "sessioni",
    focus: "Concentrazione",
    shortBreak: "Pausa breve",
    longBreak: "Pausa lunga",
    stayFocused: "Rimani concentrato...",
    ready: "Pronto quando vuoi",
    pause: "Pausa",
    startFocus: "Inizia concentrazione",
    startBreak: "Inizia pausa",
    reset: "Reimposta",
    howWorks: "Come funziona Pomodoro",
    focusTip: "Concentrazione",
    focusTipText:
      "Lavora su un'attività senza distrazioni per 25 minuti.",
    breakTip: "Fai una pausa",
    breakTipText:
      "Riposa per 5 minuti prima di iniziare un'altra sessione.",
    repeatTip: "Ripeti",
    repeatTipText:
      "Dopo quattro sessioni di concentrazione, fai una pausa più lunga.",
    todaysProgress: "Progresso di oggi",
    progressDescription:
      "Completa 4 sessioni di concentrazione oggi.",
    dailyGoalCompleted: "🎉 Obiettivo giornaliero completato!",
    dailyGoalDescription:
      "Hai completato il tuo obiettivo di concentrazione di oggi.",
    keepGoing: "Continua così!",
    sessionsRemaining:
      "sessioni in più per raggiungere il tuo obiettivo.",
    sessionRemaining:
      "sessione in più per raggiungere il tuo obiettivo.",
    todaysStudyTime: "Tempo di studio di oggi",
    minutes: "min",
  },

  de: {
    title: "Pomodoro",
    description:
      "Konzentriere dich auf deine Arbeit, mache regelmäßige Pausen und entwickle eine bessere Lerngewohnheit.",
    completedSessions: "Abgeschlossene Sitzungen",
    studyTime: "Lernzeit",
    todaysGoal: "Tagesziel",
    sessions: "Sitzungen",
    focus: "Fokus",
    shortBreak: "Kurze Pause",
    longBreak: "Lange Pause",
    stayFocused: "Bleib konzentriert...",
    ready: "Bereit, wenn du es bist",
    pause: "Pause",
    startFocus: "Fokus starten",
    startBreak: "Pause starten",
    reset: "Zurücksetzen",
    howWorks: "So funktioniert Pomodoro",
    focusTip: "Fokus",
    focusTipText:
      "Arbeite 25 Minuten ohne Ablenkungen an einer Aufgabe.",
    breakTip: "Mach eine Pause",
    breakTipText:
      "Erhole dich 5 Minuten, bevor du eine weitere Sitzung startest.",
    repeatTip: "Wiederholen",
    repeatTipText:
      "Nach vier Fokussitzungen solltest du eine längere Pause machen.",
    todaysProgress: "Heutiger Fortschritt",
    progressDescription:
      "Schließe heute 4 Fokussitzungen ab.",
    dailyGoalCompleted: "🎉 Tagesziel erreicht!",
    dailyGoalDescription:
      "Du hast dein heutiges Fokusziel erreicht.",
    keepGoing: "Weiter so!",
    sessionsRemaining:
      "weitere Sitzungen bis zu deinem Ziel.",
    sessionRemaining:
      "weitere Sitzung bis zu deinem Ziel.",
    todaysStudyTime: "Heutige Lernzeit",
    minutes: "Min.",
  },

  zh: {
    title: "番茄钟",
    description:
      "专注于学习，定期休息，培养更好的学习习惯。",
    completedSessions: "完成的专注次数",
    studyTime: "学习时间",
    todaysGoal: "今日目标",
    sessions: "次",
    focus: "专注",
    shortBreak: "短休息",
    longBreak: "长休息",
    stayFocused: "保持专注...",
    ready: "准备好后开始",
    pause: "暂停",
    startFocus: "开始专注",
    startBreak: "开始休息",
    reset: "重置",
    howWorks: "番茄钟如何工作",
    focusTip: "专注",
    focusTipText:
      "25分钟内专注完成一项任务，不受干扰。",
    breakTip: "休息一下",
    breakTipText:
      "开始下一次专注前休息5分钟。",
    repeatTip: "重复",
    repeatTipText:
      "完成四次专注后，进行一次较长的休息。",
    todaysProgress: "今日进度",
    progressDescription: "今天完成4次专注。",
    dailyGoalCompleted: "🎉 今日目标已完成！",
    dailyGoalDescription:
      "你已经完成今天的专注目标。",
    keepGoing: "继续加油！",
    sessionsRemaining: "次专注即可达到目标。",
    sessionRemaining: "次专注即可达到目标。",
    todaysStudyTime: "今日学习时间",
    minutes: "分钟",
  },

  ja: {
    title: "ポモドーロ",
    description:
      "集中して学習し、定期的に休憩して、より良い学習習慣を作りましょう。",
    completedSessions: "完了したセッション",
    studyTime: "学習時間",
    todaysGoal: "今日の目標",
    sessions: "セッション",
    focus: "集中",
    shortBreak: "短い休憩",
    longBreak: "長い休憩",
    stayFocused: "集中を続けましょう...",
    ready: "準備ができたら始めましょう",
    pause: "一時停止",
    startFocus: "集中を開始",
    startBreak: "休憩を開始",
    reset: "リセット",
    howWorks: "ポモドーロの仕組み",
    focusTip: "集中",
    focusTipText:
      "25分間、気を散らさずに1つのタスクに取り組みます。",
    breakTip: "休憩する",
    breakTipText:
      "次のセッションを始める前に5分休みましょう。",
    repeatTip: "繰り返す",
    repeatTipText:
      "4回の集中セッションの後、長めの休憩を取りましょう。",
    todaysProgress: "今日の進捗",
    progressDescription:
      "今日は4回の集中セッションを完了しましょう。",
    dailyGoalCompleted: "🎉 今日の目標を達成しました！",
    dailyGoalDescription:
      "今日の集中目標を達成しました。",
    keepGoing: "その調子！",
    sessionsRemaining:
      "回のセッションで目標を達成できます。",
    sessionRemaining:
      "回のセッションで目標を達成できます。",
    todaysStudyTime: "今日の学習時間",
    minutes: "分",
  },

  ko: {
    title: "포모도로",
    description:
      "공부에 집중하고 규칙적으로 휴식하며 더 좋은 학습 습관을 만들어 보세요.",
    completedSessions: "완료한 세션",
    studyTime: "학습 시간",
    todaysGoal: "오늘의 목표",
    sessions: "세션",
    focus: "집중",
    shortBreak: "짧은 휴식",
    longBreak: "긴 휴식",
    stayFocused: "집중을 유지하세요...",
    ready: "준비가 되면 시작하세요",
    pause: "일시정지",
    startFocus: "집중 시작",
    startBreak: "휴식 시작",
    reset: "초기화",
    howWorks: "포모도로 작동 방식",
    focusTip: "집중",
    focusTipText:
      "25분 동안 방해 없이 하나의 작업에 집중하세요.",
    breakTip: "휴식하기",
    breakTipText:
      "다음 세션을 시작하기 전에 5분 동안 쉬세요.",
    repeatTip: "반복",
    repeatTipText:
      "4번의 집중 세션 후에는 더 긴 휴식을 취하세요.",
    todaysProgress: "오늘의 진행 상황",
    progressDescription:
      "오늘 집중 세션 4회를 완료하세요.",
    dailyGoalCompleted: "🎉 오늘의 목표를 달성했습니다!",
    dailyGoalDescription:
      "오늘의 집중 목표를 완료했습니다.",
    keepGoing: "계속하세요!",
    sessionsRemaining:
      "세션을 더 완료하면 목표에 도달합니다.",
    sessionRemaining:
      "세션을 더 완료하면 목표에 도달합니다.",
    todaysStudyTime: "오늘의 학습 시간",
    minutes: "분",
  },

  ru: {
    title: "Помодоро",
    description:
      "Сосредоточьтесь на работе, регулярно отдыхайте и создавайте полезную привычку к учебе.",
    completedSessions: "Завершенные сессии",
    studyTime: "Время учебы",
    todaysGoal: "Цель на сегодня",
    sessions: "сессий",
    focus: "Фокус",
    shortBreak: "Короткий перерыв",
    longBreak: "Длинный перерыв",
    stayFocused: "Продолжайте концентрироваться...",
    ready: "Готовы начать",
    pause: "Пауза",
    startFocus: "Начать фокус",
    startBreak: "Начать перерыв",
    reset: "Сбросить",
    howWorks: "Как работает Помодоро",
    focusTip: "Фокус",
    focusTipText:
      "Работайте над одной задачей без отвлечений в течение 25 минут.",
    breakTip: "Сделайте перерыв",
    breakTipText:
      "Отдохните 5 минут перед началом следующей сессии.",
    repeatTip: "Повторить",
    repeatTipText:
      "После четырех фокус-сессий сделайте более длинный перерыв.",
    todaysProgress: "Прогресс за сегодня",
    progressDescription:
      "Завершите 4 фокус-сессии сегодня.",
    dailyGoalCompleted: "🎉 Дневная цель выполнена!",
    dailyGoalDescription:
      "Вы выполнили сегодняшнюю цель по концентрации.",
    keepGoing: "Продолжайте!",
    sessionsRemaining:
      "сессии до достижения цели.",
    sessionRemaining:
      "сессия до достижения цели.",
    todaysStudyTime: "Время учебы сегодня",
    minutes: "мин",
  },

  tr: {
    title: "Pomodoro",
    description:
      "Çalışmana odaklan, düzenli molalar ver ve daha iyi bir çalışma alışkanlığı oluştur.",
    completedSessions: "Tamamlanan Oturumlar",
    studyTime: "Çalışma Süresi",
    todaysGoal: "Bugünün Hedefi",
    sessions: "oturum",
    focus: "Odaklan",
    shortBreak: "Kısa Mola",
    longBreak: "Uzun Mola",
    stayFocused: "Odaklanmaya devam et...",
    ready: "Hazırsan başlayabilirsin",
    pause: "Duraklat",
    startFocus: "Odaklanmayı Başlat",
    startBreak: "Molayı Başlat",
    reset: "Sıfırla",
    howWorks: "Pomodoro nasıl çalışır",
    focusTip: "Odaklan",
    focusTipText:
      "25 dakika boyunca dikkat dağıtıcı olmadan tek bir göreve çalış.",
    breakTip: "Mola ver",
    breakTipText:
      "Başka bir oturuma başlamadan önce 5 dakika dinlen.",
    repeatTip: "Tekrarla",
    repeatTipText:
      "Dört odaklanma oturumundan sonra daha uzun bir mola ver.",
    todaysProgress: "Bugünün İlerlemesi",
    progressDescription:
      "Bugün 4 odaklanma oturumunu tamamla.",
    dailyGoalCompleted: "🎉 Günlük hedef tamamlandı!",
    dailyGoalDescription:
      "Bugünkü odaklanma hedefini tamamladın.",
    keepGoing: "Devam et!",
    sessionsRemaining:
      "oturum daha tamamlayarak hedefe ulaşabilirsin.",
    sessionRemaining:
      "oturum daha tamamlayarak hedefe ulaşabilirsin.",
    todaysStudyTime: "Bugünkü çalışma süresi",
    minutes: "dk",
  },

  hi: {
    title: "पोमोडोरो",
    description:
      "अपने काम पर ध्यान दें, नियमित ब्रेक लें और बेहतर अध्ययन आदत बनाएँ।",
    completedSessions: "पूर्ण सत्र",
    studyTime: "अध्ययन समय",
    todaysGoal: "आज का लक्ष्य",
    sessions: "सत्र",
    focus: "फोकस",
    shortBreak: "छोटा ब्रेक",
    longBreak: "लंबा ब्रेक",
    stayFocused: "ध्यान बनाए रखें...",
    ready: "जब आप तैयार हों तब शुरू करें",
    pause: "रोकें",
    startFocus: "फोकस शुरू करें",
    startBreak: "ब्रेक शुरू करें",
    reset: "रीसेट",
    howWorks: "पोमोडोरो कैसे काम करता है",
    focusTip: "फोकस",
    focusTipText:
      "25 मिनट तक बिना किसी रुकावट के एक काम पर ध्यान दें।",
    breakTip: "ब्रेक लें",
    breakTipText:
      "अगला सत्र शुरू करने से पहले 5 मिनट आराम करें।",
    repeatTip: "दोहराएँ",
    repeatTipText:
      "चार फोकस सत्रों के बाद एक लंबा ब्रेक लें।",
    todaysProgress: "आज की प्रगति",
    progressDescription:
      "आज 4 फोकस सत्र पूरे करें।",
    dailyGoalCompleted: "🎉 आज का लक्ष्य पूरा हो गया!",
    dailyGoalDescription:
      "आपने आज का फोकस लक्ष्य पूरा कर लिया है।",
    keepGoing: "जारी रखें!",
    sessionsRemaining:
      "सत्र और पूरे करके अपना लक्ष्य प्राप्त करें।",
    sessionRemaining:
      "सत्र और पूरा करके अपना लक्ष्य प्राप्त करें।",
    todaysStudyTime: "आज का अध्ययन समय",
    minutes: "मिनट",
  },
} as const;

type LanguageKey = keyof typeof pomodoroTranslations;

type PomodoroStats = {
  sessions: number;
  totalMinutes: number;
  todaySessions: number;
  todayMinutes: number;
};

export default function PomodoroPage() {
  const { language } = useLanguage();

  const currentLanguage = (
    pomodoroTranslations[language as LanguageKey]
      ? language
      : "en"
  ) as LanguageKey;

  const t = pomodoroTranslations[currentLanguage];
  const isArabic = language === "ar";

  const [mode, setMode] = useState<Mode>("focus");

  const [secondsLeft, setSecondsLeft] = useState(
    modes.focus.minutes * 60
  );

  const [isRunning, setIsRunning] = useState(false);

  const [stats, setStats] = useState<PomodoroStats>({
    sessions: 0,
    totalMinutes: 0,
    todaySessions: 0,
    todayMinutes: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  // Audio context for the timer alarm
  const audioContextRef =
    useRef<AudioContext | null>(null);

  /*
   * Creates/resumes the audio context after the user
   * interacts with the page. Browsers normally allow
   * audio after a user gesture such as clicking Start.
   */
  function prepareAudio() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current =
          new AudioContextClass();
      }

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch (error) {
      console.error("AUDIO INIT ERROR:", error);
    }
  }

  /*
   * Plays a clear timer/alarm-like sound.
   * The sound is repeated 3 times when the timer ends.
   */
  function playTimerSound() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      prepareAudio();

      const audioContext = audioContextRef.current;

      if (!audioContext) {
        return;
      }

      const playBeep = (
        startTime: number,
        frequency: number
      ) => {
        const oscillator =
          audioContext.createOscillator();

        const gainNode =
          audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
          frequency,
          startTime
        );

        gainNode.gain.setValueAtTime(
          0.0001,
          startTime
        );

        gainNode.gain.exponentialRampToValueAtTime(
          0.35,
          startTime + 0.03
        );

        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          startTime + 0.55
        );

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.6);
      };

      const startTime =
        audioContext.currentTime + 0.05;

      // Three alarm-like beeps
      playBeep(startTime, 880);
      playBeep(startTime + 0.7, 988);
      playBeep(startTime + 1.4, 880);
    } catch (error) {
      console.error("TIMER SOUND ERROR:", error);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false);

          // Play alarm sound when the timer reaches zero.
          playTimerSound();

          if (mode === "focus") {
            saveCompletedSession();
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  async function loadStats() {
    try {
      const response = await fetch("/api/pomodoro", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setStats({
        sessions: data.sessions || 0,
        totalMinutes: data.totalMinutes || 0,
        todaySessions: data.todaySessions || 0,
        todayMinutes: data.todayMinutes || 0,
      });
    } catch (error) {
      console.error(
        "LOAD POMODORO STATS ERROR:",
        error
      );
    } finally {
      setLoadingStats(false);
    }
  }

  async function saveCompletedSession() {
    try {
      const response = await fetch("/api/pomodoro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: modes.focus.minutes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        console.error(
          "POMODORO SAVE ERROR:",
          data.message
        );

        return;
      }

      await loadStats();
    } catch (error) {
      console.error(
        "SAVE POMODORO ERROR:",
        error
      );
    }
  }

  function changeMode(newMode: Mode) {
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(
      modes[newMode].minutes * 60
    );
  }

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(
      modes[mode].minutes * 60
    );
  }

  function toggleTimer() {
    // User interaction prepares audio permission.
    prepareAudio();

    if (secondsLeft === 0) {
      setSecondsLeft(
        modes[mode].minutes * 60
      );
    }

    setIsRunning((current) => !current);
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (secondsLeft % 60)
    .toString()
    .padStart(2, "0");

  const totalSeconds =
    modes[mode].minutes * 60;

  const progress =
    ((totalSeconds - secondsLeft) /
      totalSeconds) *
    100;

  const totalHours = Math.floor(
    stats.totalMinutes / 60
  );

  const remainingMinutes =
    stats.totalMinutes % 60;

  const studyTime =
    totalHours > 0
      ? `${totalHours}h ${remainingMinutes}m`
      : `${remainingMinutes}${t.minutes}`;

  const modeLabel = {
    focus: t.focus,
    short: t.shortBreak,
    long: t.longBreak,
  };

  const remainingSessions = Math.max(
    4 - stats.todaySessions,
    0
  );

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
        <header className="border-b border-slate-200 bg-white">
          <div className="px-6 py-5">
            <h1 className="text-2xl font-bold">
              {t.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {t.description}
            </p>
          </div>
        </header>

        <div className="p-6">
          <div className="mx-auto max-w-5xl">
            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <PomodoroStat
                label={t.completedSessions}
                value={
                  loadingStats
                    ? "..."
                    : stats.sessions.toString()
                }
                icon="✓"
              />

              <PomodoroStat
                label={t.studyTime}
                value={
                  loadingStats
                    ? "..."
                    : studyTime
                }
                icon="◷"
              />

              <PomodoroStat
                label={t.todaysGoal}
                value={`${Math.min(
                  stats.todaySessions,
                  4
                )}/4 ${t.sessions}`}
                icon="🎯"
              />
            </div>

            {/* Timer Card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {(Object.keys(modes) as Mode[]).map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() =>
                          changeMode(item)
                        }
                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                          mode === item
                            ? "bg-indigo-600 text-white"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {modeLabel[item]}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  {modeLabel[mode]}
                </p>

                <div className="relative mx-auto mt-8 flex h-72 w-72 items-center justify-center rounded-full border-[14px] border-slate-100 sm:h-80 sm:w-80">
                  <div
                    className="absolute inset-[-14px] rounded-full border-[14px] border-transparent"
                    style={{
                      background: `conic-gradient(#4f46e5 ${progress}%, transparent ${progress}%)`,
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude",
                    }}
                  />

                  <div>
                    <div className="text-6xl font-bold tracking-tight text-slate-900 sm:text-7xl">
                      {minutes}:{seconds}
                    </div>

                    <p className="mt-3 text-sm text-slate-400">
                      {isRunning
                        ? t.stayFocused
                        : t.ready}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    onClick={toggleTimer}
                    className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
                  >
                    {isRunning
                      ? t.pause
                      : mode === "focus"
                        ? t.startFocus
                        : t.startBreak}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    {t.reset}
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold">
                  {t.howWorks}
                </h2>

                <div className="mt-5 space-y-4">
                  <Tip
                    number="01"
                    title={t.focusTip}
                    text={t.focusTipText}
                  />

                  <Tip
                    number="02"
                    title={t.breakTip}
                    text={t.breakTipText}
                  />

                  <Tip
                    number="03"
                    title={t.repeatTip}
                    text={t.repeatTipText}
                  />
                </div>
              </div>

              {/* Today's Progress */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">
                      {t.todaysProgress}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {t.progressDescription}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-indigo-600">
                    {Math.min(
                      stats.todaySessions,
                      4
                    )}
                    /4
                  </span>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (stats.todaySessions / 4) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-6 grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(
                    (number) => (
                      <div
                        key={number}
                        className={`flex h-12 items-center justify-center rounded-xl text-sm font-bold ${
                          stats.todaySessions >=
                          number
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {stats.todaySessions >=
                        number
                          ? "✓"
                          : number}
                      </div>
                    )
                  )}
                </div>

                <div className="mt-6 rounded-xl bg-indigo-50 p-4">
                  <p className="text-sm font-semibold text-indigo-700">
                    {stats.todaySessions >= 4
                      ? t.dailyGoalCompleted
                      : t.keepGoing}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-600">
                    {stats.todaySessions >= 4
                      ? t.dailyGoalDescription
                      : `${remainingSessions} ${
                          remainingSessions === 1
                            ? t.sessionRemaining
                            : t.sessionsRemaining
                        }`}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    {t.todaysStudyTime}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {stats.todayMinutes}{" "}
                    {t.minutes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PomodoroStat({
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

function Tip({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-bold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}