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

const taskTranslations: Record<
  string,
  {
    tasks: string;
    newTask: string;
    yourTasks: string;
    description: string;
    totalTasks: string;
    active: string;
    completed: string;
    allTasks: string;
    manageTasks: string;
    all: string;
    loading: string;
    noTasks: string;
    noTasksDescription: string;
    addAnother: string;
    createTask: string;
    createDescription: string;
    taskTitle: string;
    titlePlaceholder: string;
    subject: string;
    priority: string;
    low: string;
    medium: string;
    high: string;
    cancel: string;
    creating: string;
    deleteTask: string;
    due: string;
    general: string;
    mathematics: string;
    programming: string;
    physics: string;
    biology: string;
    english: string;
    loadError: string;
    createError: string;
    priorities: {
      High: string;
      Medium: string;
      Low: string;
    };
    subjects: Record<string, string>;
  }
> = {
  en: {
    tasks: "Tasks",
    newTask: "New Task",
    yourTasks: "Your Tasks",
    description:
      "Keep track of everything you need to accomplish.",
    totalTasks: "Total Tasks",
    active: "Active",
    completed: "Completed",
    allTasks: "All Tasks",
    manageTasks: "Manage your study tasks.",
    all: "All",
    loading: "Loading tasks...",
    noTasks: "No tasks here",
    noTasksDescription:
      "Add a new task or change the filter.",
    addAnother: "Add another task",
    createTask: "Create New Task",
    createDescription:
      "Add something you want to accomplish.",
    taskTitle: "Task title",
    titlePlaceholder:
      "e.g. Study Chapter 5",
    subject: "Subject",
    priority: "Priority",
    low: "Low",
    medium: "Medium",
    high: "High",
    cancel: "Cancel",
    creating: "Creating...",
    deleteTask: "Delete task",
    due: "Due",
    general: "General",
    mathematics: "Mathematics",
    programming: "Programming",
    physics: "Physics",
    biology: "Biology",
    english: "English",
    loadError: "Unable to load tasks.",
    createError: "Unable to create task.",
    priorities: {
      High: "High",
      Medium: "Medium",
      Low: "Low",
    },
    subjects: {
      General: "General",
      Mathematics: "Mathematics",
      Programming: "Programming",
      Physics: "Physics",
      Biology: "Biology",
      English: "English",
    },
  },

  ar: {
    tasks: "المهام",
    newTask: "مهمة جديدة",
    yourTasks: "مهامك",
    description:
      "تابع كل ما تحتاج إلى إنجازه.",
    totalTasks: "إجمالي المهام",
    active: "النشطة",
    completed: "المكتملة",
    allTasks: "كل المهام",
    manageTasks: "إدارة مهامك الدراسية.",
    all: "الكل",
    loading: "جاري تحميل المهام...",
    noTasks: "لا توجد مهام هنا",
    noTasksDescription:
      "أضف مهمة جديدة أو غيّر الفلتر.",
    addAnother: "إضافة مهمة أخرى",
    createTask: "إنشاء مهمة جديدة",
    createDescription:
      "أضف شيئًا تريد إنجازه.",
    taskTitle: "عنوان المهمة",
    titlePlaceholder:
      "مثال: مذاكرة الفصل الخامس",
    subject: "المادة",
    priority: "الأولوية",
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    cancel: "إلغاء",
    creating: "جاري الإنشاء...",
    deleteTask: "حذف المهمة",
    due: "موعد التسليم",
    general: "عام",
    mathematics: "الرياضيات",
    programming: "البرمجة",
    physics: "الفيزياء",
    biology: "الأحياء",
    english: "اللغة الإنجليزية",
    loadError: "تعذر تحميل المهام.",
    createError: "تعذر إنشاء المهمة.",
    priorities: {
      High: "عالية",
      Medium: "متوسطة",
      Low: "منخفضة",
    },
    subjects: {
      General: "عام",
      Mathematics: "الرياضيات",
      Programming: "البرمجة",
      Physics: "الفيزياء",
      Biology: "الأحياء",
      English: "اللغة الإنجليزية",
    },
  },

  es: {
    tasks: "Tareas",
    newTask: "Nueva tarea",
    yourTasks: "Tus tareas",
    description:
      "Lleva un registro de todo lo que necesitas completar.",
    totalTasks: "Total de tareas",
    active: "Activas",
    completed: "Completadas",
    allTasks: "Todas las tareas",
    manageTasks: "Gestiona tus tareas de estudio.",
    all: "Todas",
    loading: "Cargando tareas...",
    noTasks: "No hay tareas aquí",
    noTasksDescription:
      "Añade una nueva tarea o cambia el filtro.",
    addAnother: "Añadir otra tarea",
    createTask: "Crear nueva tarea",
    createDescription:
      "Añade algo que quieras completar.",
    taskTitle: "Título de la tarea",
    titlePlaceholder:
      "Ej.: Estudiar el capítulo 5",
    subject: "Materia",
    priority: "Prioridad",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    cancel: "Cancelar",
    creating: "Creando...",
    deleteTask: "Eliminar tarea",
    due: "Fecha límite",
    general: "General",
    mathematics: "Matemáticas",
    programming: "Programación",
    physics: "Física",
    biology: "Biología",
    english: "Inglés",
    loadError: "No se pudieron cargar las tareas.",
    createError: "No se pudo crear la tarea.",
    priorities: {
      High: "Alta",
      Medium: "Media",
      Low: "Baja",
    },
    subjects: {
      General: "General",
      Mathematics: "Matemáticas",
      Programming: "Programación",
      Physics: "Física",
      Biology: "Biología",
      English: "Inglés",
    },
  },

  fr: {
    tasks: "Tâches",
    newTask: "Nouvelle tâche",
    yourTasks: "Vos tâches",
    description:
      "Suivez tout ce que vous devez accomplir.",
    totalTasks: "Total des tâches",
    active: "Actives",
    completed: "Terminées",
    allTasks: "Toutes les tâches",
    manageTasks: "Gérez vos tâches d'étude.",
    all: "Toutes",
    loading: "Chargement des tâches...",
    noTasks: "Aucune tâche ici",
    noTasksDescription:
      "Ajoutez une tâche ou modifiez le filtre.",
    addAnother: "Ajouter une autre tâche",
    createTask: "Créer une nouvelle tâche",
    createDescription:
      "Ajoutez quelque chose que vous souhaitez accomplir.",
    taskTitle: "Titre de la tâche",
    titlePlaceholder:
      "Ex. : Étudier le chapitre 5",
    subject: "Matière",
    priority: "Priorité",
    low: "Faible",
    medium: "Moyenne",
    high: "Élevée",
    cancel: "Annuler",
    creating: "Création...",
    deleteTask: "Supprimer la tâche",
    due: "Échéance",
    general: "Général",
    mathematics: "Mathématiques",
    programming: "Programmation",
    physics: "Physique",
    biology: "Biologie",
    english: "Anglais",
    loadError: "Impossible de charger les tâches.",
    createError: "Impossible de créer la tâche.",
    priorities: {
      High: "Élevée",
      Medium: "Moyenne",
      Low: "Faible",
    },
    subjects: {
      General: "Général",
      Mathematics: "Mathématiques",
      Programming: "Programmation",
      Physics: "Physique",
      Biology: "Biologie",
      English: "Anglais",
    },
  },

  pt: {
    tasks: "Tarefas",
    newTask: "Nova tarefa",
    yourTasks: "Suas tarefas",
    description:
      "Acompanhe tudo o que você precisa realizar.",
    totalTasks: "Total de tarefas",
    active: "Ativas",
    completed: "Concluídas",
    allTasks: "Todas as tarefas",
    manageTasks: "Gerencie suas tarefas de estudo.",
    all: "Todas",
    loading: "Carregando tarefas...",
    noTasks: "Nenhuma tarefa aqui",
    noTasksDescription:
      "Adicione uma nova tarefa ou altere o filtro.",
    addAnother: "Adicionar outra tarefa",
    createTask: "Criar nova tarefa",
    createDescription:
      "Adicione algo que você deseja realizar.",
    taskTitle: "Título da tarefa",
    titlePlaceholder:
      "Ex.: Estudar o capítulo 5",
    subject: "Disciplina",
    priority: "Prioridade",
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    cancel: "Cancelar",
    creating: "Criando...",
    deleteTask: "Excluir tarefa",
    due: "Prazo",
    general: "Geral",
    mathematics: "Matemática",
    programming: "Programação",
    physics: "Física",
    biology: "Biologia",
    english: "Inglês",
    loadError: "Não foi possível carregar as tarefas.",
    createError: "Não foi possível criar a tarefa.",
    priorities: {
      High: "Alta",
      Medium: "Média",
      Low: "Baixa",
    },
    subjects: {
      General: "Geral",
      Mathematics: "Matemática",
      Programming: "Programação",
      Physics: "Física",
      Biology: "Biologia",
      English: "Inglês",
    },
  },

  it: {
    tasks: "Attività",
    newTask: "Nuova attività",
    yourTasks: "Le tue attività",
    description:
      "Tieni traccia di tutto ciò che devi completare.",
    totalTasks: "Attività totali",
    active: "Attive",
    completed: "Completate",
    allTasks: "Tutte le attività",
    manageTasks: "Gestisci le tue attività di studio.",
    all: "Tutte",
    loading: "Caricamento attività...",
    noTasks: "Nessuna attività qui",
    noTasksDescription:
      "Aggiungi una nuova attività o cambia il filtro.",
    addAnother: "Aggiungi un'altra attività",
    createTask: "Crea nuova attività",
    createDescription:
      "Aggiungi qualcosa che vuoi completare.",
    taskTitle: "Titolo dell'attività",
    titlePlaceholder:
      "Es.: Studiare il capitolo 5",
    subject: "Materia",
    priority: "Priorità",
    low: "Bassa",
    medium: "Media",
    high: "Alta",
    cancel: "Annulla",
    creating: "Creazione...",
    deleteTask: "Elimina attività",
    due: "Scadenza",
    general: "Generale",
    mathematics: "Matematica",
    programming: "Programmazione",
    physics: "Fisica",
    biology: "Biologia",
    english: "Inglese",
    loadError: "Impossibile caricare le attività.",
    createError: "Impossibile creare l'attività.",
    priorities: {
      High: "Alta",
      Medium: "Media",
      Low: "Bassa",
    },
    subjects: {
      General: "Generale",
      Mathematics: "Matematica",
      Programming: "Programmazione",
      Physics: "Fisica",
      Biology: "Biologia",
      English: "Inglese",
    },
  },

  de: {
    tasks: "Aufgaben",
    newTask: "Neue Aufgabe",
    yourTasks: "Deine Aufgaben",
    description:
      "Behalte den Überblick über alles, was du erledigen musst.",
    totalTasks: "Aufgaben insgesamt",
    active: "Aktiv",
    completed: "Erledigt",
    allTasks: "Alle Aufgaben",
    manageTasks: "Verwalte deine Lernaufgaben.",
    all: "Alle",
    loading: "Aufgaben werden geladen...",
    noTasks: "Keine Aufgaben hier",
    noTasksDescription:
      "Füge eine neue Aufgabe hinzu oder ändere den Filter.",
    addAnother: "Weitere Aufgabe hinzufügen",
    createTask: "Neue Aufgabe erstellen",
    createDescription:
      "Füge etwas hinzu, das du erledigen möchtest.",
    taskTitle: "Aufgabentitel",
    titlePlaceholder:
      "z. B. Kapitel 5 lernen",
    subject: "Fach",
    priority: "Priorität",
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    cancel: "Abbrechen",
    creating: "Wird erstellt...",
    deleteTask: "Aufgabe löschen",
    due: "Fällig",
    general: "Allgemein",
    mathematics: "Mathematik",
    programming: "Programmierung",
    physics: "Physik",
    biology: "Biologie",
    english: "Englisch",
    loadError:
      "Aufgaben konnten nicht geladen werden.",
    createError:
      "Aufgabe konnte nicht erstellt werden.",
    priorities: {
      High: "Hoch",
      Medium: "Mittel",
      Low: "Niedrig",
    },
    subjects: {
      General: "Allgemein",
      Mathematics: "Mathematik",
      Programming: "Programmierung",
      Physics: "Physik",
      Biology: "Biologie",
      English: "Englisch",
    },
  },

  zh: {
    tasks: "任务",
    newTask: "新任务",
    yourTasks: "你的任务",
    description: "跟踪所有需要完成的事情。",
    totalTasks: "任务总数",
    active: "进行中",
    completed: "已完成",
    allTasks: "所有任务",
    manageTasks: "管理你的学习任务。",
    all: "全部",
    loading: "正在加载任务...",
    noTasks: "这里没有任务",
    noTasksDescription:
      "添加新任务或更改筛选条件。",
    addAnother: "添加另一个任务",
    createTask: "创建新任务",
    createDescription:
      "添加你想要完成的事情。",
    taskTitle: "任务标题",
    titlePlaceholder: "例如：学习第五章",
    subject: "科目",
    priority: "优先级",
    low: "低",
    medium: "中",
    high: "高",
    cancel: "取消",
    creating: "创建中...",
    deleteTask: "删除任务",
    due: "截止日期",
    general: "综合",
    mathematics: "数学",
    programming: "编程",
    physics: "物理",
    biology: "生物",
    english: "英语",
    loadError: "无法加载任务。",
    createError: "无法创建任务。",
    priorities: {
      High: "高",
      Medium: "中",
      Low: "低",
    },
    subjects: {
      General: "综合",
      Mathematics: "数学",
      Programming: "编程",
      Physics: "物理",
      Biology: "生物",
      English: "英语",
    },
  },

  ja: {
    tasks: "タスク",
    newTask: "新しいタスク",
    yourTasks: "あなたのタスク",
    description:
      "やるべきことをすべて管理しましょう。",
    totalTasks: "タスク合計",
    active: "進行中",
    completed: "完了",
    allTasks: "すべてのタスク",
    manageTasks: "学習タスクを管理しましょう。",
    all: "すべて",
    loading: "タスクを読み込んでいます...",
    noTasks: "タスクがありません",
    noTasksDescription:
      "新しいタスクを追加するか、フィルターを変更してください。",
    addAnother: "別のタスクを追加",
    createTask: "新しいタスクを作成",
    createDescription:
      "達成したいことを追加してください。",
    taskTitle: "タスク名",
    titlePlaceholder:
      "例：第5章を勉強する",
    subject: "科目",
    priority: "優先度",
    low: "低",
    medium: "中",
    high: "高",
    cancel: "キャンセル",
    creating: "作成中...",
    deleteTask: "タスクを削除",
    due: "期限",
    general: "一般",
    mathematics: "数学",
    programming: "プログラミング",
    physics: "物理",
    biology: "生物",
    english: "英語",
    loadError:
      "タスクを読み込めませんでした。",
    createError:
      "タスクを作成できませんでした。",
    priorities: {
      High: "高",
      Medium: "中",
      Low: "低",
    },
    subjects: {
      General: "一般",
      Mathematics: "数学",
      Programming: "プログラミング",
      Physics: "物理",
      Biology: "生物",
      English: "英語",
    },
  },

  ko: {
    tasks: "할 일",
    newTask: "새 할 일",
    yourTasks: "내 할 일",
    description:
      "완료해야 할 모든 일을 관리하세요.",
    totalTasks: "전체 할 일",
    active: "진행 중",
    completed: "완료",
    allTasks: "모든 할 일",
    manageTasks: "학습 할 일을 관리하세요.",
    all: "전체",
    loading: "할 일을 불러오는 중...",
    noTasks: "할 일이 없습니다",
    noTasksDescription:
      "새 할 일을 추가하거나 필터를 변경하세요.",
    addAnother: "다른 할 일 추가",
    createTask: "새 할 일 만들기",
    createDescription:
      "완료하고 싶은 일을 추가하세요.",
    taskTitle: "할 일 제목",
    titlePlaceholder:
      "예: 5장 공부하기",
    subject: "과목",
    priority: "우선순위",
    low: "낮음",
    medium: "보통",
    high: "높음",
    cancel: "취소",
    creating: "생성 중...",
    deleteTask: "할 일 삭제",
    due: "마감",
    general: "일반",
    mathematics: "수학",
    programming: "프로그래밍",
    physics: "물리학",
    biology: "생물학",
    english: "영어",
    loadError:
      "할 일을 불러오지 못했습니다.",
    createError:
      "할 일을 만들지 못했습니다.",
    priorities: {
      High: "높음",
      Medium: "보통",
      Low: "낮음",
    },
    subjects: {
      General: "일반",
      Mathematics: "수학",
      Programming: "프로그래밍",
      Physics: "물리학",
      Biology: "생물학",
      English: "영어",
    },
  },

  ru: {
    tasks: "Задачи",
    newTask: "Новая задача",
    yourTasks: "Ваши задачи",
    description:
      "Следите за всем, что вам нужно выполнить.",
    totalTasks: "Всего задач",
    active: "Активные",
    completed: "Выполненные",
    allTasks: "Все задачи",
    manageTasks: "Управляйте учебными задачами.",
    all: "Все",
    loading: "Загрузка задач...",
    noTasks: "Здесь нет задач",
    noTasksDescription:
      "Добавьте новую задачу или измените фильтр.",
    addAnother: "Добавить еще задачу",
    createTask: "Создать новую задачу",
    createDescription:
      "Добавьте то, что хотите выполнить.",
    taskTitle: "Название задачи",
    titlePlaceholder:
      "Напр.: Изучить главу 5",
    subject: "Предмет",
    priority: "Приоритет",
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    cancel: "Отмена",
    creating: "Создание...",
    deleteTask: "Удалить задачу",
    due: "Срок",
    general: "Общее",
    mathematics: "Математика",
    programming: "Программирование",
    physics: "Физика",
    biology: "Биология",
    english: "Английский",
    loadError:
      "Не удалось загрузить задачи.",
    createError:
      "Не удалось создать задачу.",
    priorities: {
      High: "Высокий",
      Medium: "Средний",
      Low: "Низкий",
    },
    subjects: {
      General: "Общее",
      Mathematics: "Математика",
      Programming: "Программирование",
      Physics: "Физика",
      Biology: "Биология",
      English: "Английский",
    },
  },

  tr: {
    tasks: "Görevler",
    newTask: "Yeni Görev",
    yourTasks: "Görevlerin",
    description:
      "Tamamlaman gereken her şeyi takip et.",
    totalTasks: "Toplam Görev",
    active: "Aktif",
    completed: "Tamamlandı",
    allTasks: "Tüm Görevler",
    manageTasks: "Çalışma görevlerini yönet.",
    all: "Tümü",
    loading: "Görevler yükleniyor...",
    noTasks: "Burada görev yok",
    noTasksDescription:
      "Yeni bir görev ekle veya filtreyi değiştir.",
    addAnother: "Başka görev ekle",
    createTask: "Yeni Görev Oluştur",
    createDescription:
      "Tamamlamak istediğin bir şey ekle.",
    taskTitle: "Görev başlığı",
    titlePlaceholder:
      "Örn. 5. Bölümü çalış",
    subject: "Ders",
    priority: "Öncelik",
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
    cancel: "İptal",
    creating: "Oluşturuluyor...",
    deleteTask: "Görevi sil",
    due: "Son tarih",
    general: "Genel",
    mathematics: "Matematik",
    programming: "Programlama",
    physics: "Fizik",
    biology: "Biyoloji",
    english: "İngilizce",
    loadError: "Görevler yüklenemedi.",
    createError: "Görev oluşturulamadı.",
    priorities: {
      High: "Yüksek",
      Medium: "Orta",
      Low: "Düşük",
    },
    subjects: {
      General: "Genel",
      Mathematics: "Matematik",
      Programming: "Programlama",
      Physics: "Fizik",
      Biology: "Biyoloji",
      English: "İngilizce",
    },
  },

  hi: {
    tasks: "कार्य",
    newTask: "नया कार्य",
    yourTasks: "आपके कार्य",
    description:
      "आपको जो कुछ भी पूरा करना है उसका ध्यान रखें।",
    totalTasks: "कुल कार्य",
    active: "सक्रिय",
    completed: "पूर्ण",
    allTasks: "सभी कार्य",
    manageTasks:
      "अपने अध्ययन कार्यों को व्यवस्थित करें।",
    all: "सभी",
    loading: "कार्य लोड हो रहे हैं...",
    noTasks: "यहाँ कोई कार्य नहीं है",
    noTasksDescription:
      "नया कार्य जोड़ें या फ़िल्टर बदलें।",
    addAnother: "एक और कार्य जोड़ें",
    createTask: "नया कार्य बनाएं",
    createDescription:
      "वह चीज़ जोड़ें जिसे आप पूरा करना चाहते हैं।",
    taskTitle: "कार्य का शीर्षक",
    titlePlaceholder:
      "उदाहरण: अध्याय 5 पढ़ें",
    subject: "विषय",
    priority: "प्राथमिकता",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    cancel: "रद्द करें",
    creating: "बनाया जा रहा है...",
    deleteTask: "कार्य हटाएं",
    due: "समय सीमा",
    general: "सामान्य",
    mathematics: "गणित",
    programming: "प्रोग्रामिंग",
    physics: "भौतिकी",
    biology: "जीव विज्ञान",
    english: "अंग्रेज़ी",
    loadError: "कार्य लोड नहीं हो सके।",
    createError: "कार्य बनाया नहीं जा सका।",
    priorities: {
      High: "उच्च",
      Medium: "मध्यम",
      Low: "कम",
    },
    subjects: {
      General: "सामान्य",
      Mathematics: "गणित",
      Programming: "प्रोग्रामिंग",
      Physics: "भौतिकी",
      Biology: "जीव विज्ञान",
      English: "अंग्रेज़ी",
    },
  },
};

export default function TasksPage() {
  const { language } = useLanguage();

  const t =
    taskTranslations[language] ||
    taskTranslations.en;

  const isArabic = language === "ar";

  const [tasks, setTasks] = useState<Task[]>(
    []
  );

  const [filter, setFilter] = useState<
    "All" | "Active" | "Completed"
  >("All");

  const [showModal, setShowModal] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [newTitle, setNewTitle] =
    useState("");

  const [newSubject, setNewSubject] =
    useState("General");

  const [newPriority, setNewPriority] =
    useState<Task["priority"]>(
      "Medium"
    );

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/tasks",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            t.loadError
        );
        return;
      }

      setTasks(data.tasks || []);
    } catch (error) {
      console.error(
        "LOAD TASKS ERROR:",
        error
      );

      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(
    id: number
  ) {
    const task = tasks.find(
      (item) => item.id === id
    );

    if (!task) return;

    const newCompleted =
      !task.completed;

    setTasks(
      (currentTasks) =>
        currentTasks.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  completed:
                    newCompleted,
                }
              : item
        )
    );

    try {
      const response =
        await fetch(
          `/api/tasks/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              completed:
                newCompleted,
            }),
          }
        );

      if (!response.ok) {
        setTasks(
          (currentTasks) =>
            currentTasks.map(
              (item) =>
                item.id === id
                  ? {
                      ...item,
                      completed:
                        task.completed,
                    }
                  : item
            )
        );
      }
    } catch (error) {
      console.error(
        "TOGGLE TASK ERROR:",
        error
      );

      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    completed:
                      task.completed,
                  }
                : item
          )
      );
    }
  }

  async function deleteTask(
    id: number
  ) {
    const previousTasks =
      tasks;

    setTasks(
      (currentTasks) =>
        currentTasks.filter(
          (task) =>
            task.id !== id
        )
    );

    try {
      const response =
        await fetch(
          `/api/tasks/${id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        setTasks(previousTasks);
      }
    } catch (error) {
      console.error(
        "DELETE TASK ERROR:",
        error
      );

      setTasks(previousTasks);
    }
  }

  async function addTask() {
    if (!newTitle.trim()) return;

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch(
          "/api/tasks",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title:
                newTitle.trim(),
              subject:
                newSubject,
              priority:
                newPriority,
              dueDate: "Today",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            t.createError
        );
        return;
      }

      if (data.task) {
        setTasks(
          (currentTasks) => [
            data.task,
            ...currentTasks,
          ]
        );
      }

      setNewTitle("");
      setNewSubject(
        "General"
      );
      setNewPriority(
        "Medium"
      );
      setShowModal(false);
    } catch (error) {
      console.error(
        "ADD TASK ERROR:",
        error
      );

      setError(t.createError);
    } finally {
      setSaving(false);
    }
  }

  const filteredTasks =
    tasks.filter((task) => {
      if (
        filter === "Active"
      ) {
        return !task.completed;
      }

      if (
        filter === "Completed"
      ) {
        return task.completed;
      }

      return true;
    });

  const completedCount =
    tasks.filter(
      (task) =>
        task.completed
    ).length;

  const activeCount =
    tasks.length -
    completedCount;

  return (
    <main
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <Sidebar />

      <div
        className={
          isArabic
            ? "lg:pr-64"
            : "lg:pl-64"
        }
      >
        <header className="border-b border-slate-200 bg-white">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <p className="text-sm text-slate-500">
                StudyHub
              </p>

              <h1 className="mt-1 text-xl font-bold">
                {t.tasks}
              </h1>
            </div>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + {t.newTask}
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              {t.yourTasks}
            </h2>

            <p className="mt-2 text-slate-500">
              {t.description}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <TaskStat
              label={t.totalTasks}
              value={tasks.length}
              icon="✓"
            />

            <TaskStat
              label={t.active}
              value={activeCount}
              icon="◷"
            />

            <TaskStat
              label={t.completed}
              value={completedCount}
              icon="✓"
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold">
                  {t.allTasks}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {t.manageTasks}
                </p>
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1">
                {(
                  [
                    "All",
                    "Active",
                    "Completed",
                  ] as const
                ).map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      filter === item
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item ===
                    "All"
                      ? t.all
                      : item ===
                          "Active"
                        ? t.active
                        : t.completed}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-slate-500">
                  {t.loading}
                </p>
              </div>
            ) : filteredTasks.length >
              0 ? (
              <div className="divide-y divide-slate-100">
                {filteredTasks.map(
                  (task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() =>
                        toggleTask(
                          task.id
                        )
                      }
                      onDelete={() =>
                        deleteTask(
                          task.id
                        )
                      }
                      translations={t}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                  ✓
                </div>

                <h3 className="mt-4 font-bold">
                  {t.noTasks}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {
                    t.noTasksDescription
                  }
                </p>
              </div>
            )}

            <div className="border-t border-slate-200 p-5">
              <button
                onClick={() =>
                  setShowModal(true)
                }
                className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"
              >
                + {t.addAnother}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          dir={
            isArabic
              ? "rtl"
              : "ltr"
          }
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {t.createTask}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t.createDescription}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  {t.taskTitle}
                </label>

                <input
                  value={newTitle}
                  onChange={(event) =>
                    setNewTitle(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    t.titlePlaceholder
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  {t.subject}
                </label>

                <select
                  value={newSubject}
                  onChange={(event) =>
                    setNewSubject(
                      event.target
                        .value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                >
                  <option value="General">
                    {
                      t.subjects
                        .General
                    }
                  </option>

                  <option value="Mathematics">
                    {
                      t.subjects
                        .Mathematics
                    }
                  </option>

                  <option value="Programming">
                    {
                      t.subjects
                        .Programming
                    }
                  </option>

                  <option value="Physics">
                    {
                      t.subjects
                        .Physics
                    }
                  </option>

                  <option value="Biology">
                    {
                      t.subjects
                        .Biology
                    }
                  </option>

                  <option value="English">
                    {
                      t.subjects
                        .English
                    }
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  {t.priority}
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      "Low",
                      "Medium",
                      "High",
                    ] as const
                  ).map(
                    (priority) => (
                      <button
                        key={
                          priority
                        }
                        type="button"
                        onClick={() =>
                          setNewPriority(
                            priority
                          )
                        }
                        disabled={saving}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          newPriority ===
                          priority
                            ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {
                          t.priorities[
                            priority
                          ]
                        }
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() =>
                  setShowModal(false)
                }
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {t.cancel}
              </button>

              <button
                onClick={addTask}
                disabled={saving}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? t.creating
                  : t.createTask}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TaskStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  translations,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  translations: {
    deleteTask: string;
    due: string;
    priorities: {
      High: string;
      Medium: string;
      Low: string;
    };
    subjects: Record<
      string,
      string
    >;
  };
}) {
  return (
    <div className="group flex items-center gap-4 p-5 transition hover:bg-slate-50">
      <button
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
          task.completed
            ? "border-indigo-600 bg-indigo-600 text-xs text-white"
            : "border-slate-300 hover:border-indigo-500"
        }`}
      >
        {task.completed
          ? "✓"
          : ""}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={`text-sm font-semibold ${
            task.completed
              ? "text-slate-400 line-through"
              : "text-slate-800"
          }`}
        >
          {task.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
            {translations
              .subjects[
              task.subject
            ] ||
              task.subject}
          </span>

          <span className="text-xs text-slate-400">
            •
          </span>

          <span className="text-xs text-slate-500">
            {translations.due}{" "}
            {task.dueDate}
          </span>
        </div>
      </div>

      <span
        className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:block ${
          task.priority ===
          "High"
            ? "bg-red-50 text-red-600"
            : task.priority ===
                "Medium"
              ? "bg-yellow-50 text-yellow-600"
              : "bg-green-50 text-green-600"
        }`}
      >
        {
          translations.priorities[
            task.priority
          ]
        }
      </span>

      <button
        onClick={onDelete}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title={
          translations.deleteTask
        }
      >
        🗑
      </button>
    </div>
  );
}