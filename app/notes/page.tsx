"use client";

import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type Note = {
  id: number;
  title: string;
  subject: string;
  content: string;
  date: string;
};

const notesTranslations = {
  en: {
    title: "Notes",
    description: "Keep your study notes organized and easy to find.",
    newNote: "New Note",
    search: "Search your notes...",
    totalNotes: "Total Notes",
    subjects: "Subjects",
    thisWeek: "This Week",
    noNotes: "No notes found",
    noNotesDescription:
      "Try another search or create a new note to start organizing your study material.",
    createNote: "Create Note",
    createNewNote: "Create New Note",
    addNoteDescription: "Add a note for your studies.",
    noteTitle: "Note title",
    titlePlaceholder: "e.g. Biology Chapter 3",
    subject: "Subject",
    content: "Content",
    contentPlaceholder: "Write your study notes here...",
    cancel: "Cancel",
    close: "Close",
    delete: "Delete",
    openNote: "Open note →",
    created: "Created",
    subjectNames: {
      General: "General",
      Mathematics: "Mathematics",
      Programming: "Programming",
      Physics: "Physics",
      Chemistry: "Chemistry",
      Biology: "Biology",
      English: "English",
    },
    sampleNotes: [
      {
        title: "Mathematics - Chapter 4",
        subject: "Mathematics",
        content:
          "Important formulas and notes about equations, functions, and problem solving.",
      },
      {
        title: "JavaScript Basics",
        subject: "Programming",
        content:
          "Variables, functions, arrays, objects, loops, and basic DOM concepts.",
      },
      {
        title: "Physics Revision",
        subject: "Physics",
        content:
          "Review the main laws, definitions, and examples before the upcoming exam.",
      },
    ],
  },

  ar: {
    title: "الملاحظات",
    description: "نظّم ملاحظاتك الدراسية واجعلها سهلة الوصول.",
    newNote: "ملاحظة جديدة",
    search: "ابحث في ملاحظاتك...",
    totalNotes: "إجمالي الملاحظات",
    subjects: "المواد",
    thisWeek: "هذا الأسبوع",
    noNotes: "لا توجد ملاحظات",
    noNotesDescription:
      "جرّب بحثًا آخر أو أنشئ ملاحظة جديدة لبدء تنظيم موادك الدراسية.",
    createNote: "إنشاء ملاحظة",
    createNewNote: "إنشاء ملاحظة جديدة",
    addNoteDescription: "أضف ملاحظة لدراستك.",
    noteTitle: "عنوان الملاحظة",
    titlePlaceholder: "مثال: الفصل الثالث في الأحياء",
    subject: "المادة",
    content: "المحتوى",
    contentPlaceholder: "اكتب ملاحظاتك الدراسية هنا...",
    cancel: "إلغاء",
    close: "إغلاق",
    delete: "حذف",
    openNote: "فتح الملاحظة ←",
    created: "تم الإنشاء",
    subjectNames: {
      General: "عام",
      Mathematics: "الرياضيات",
      Programming: "البرمجة",
      Physics: "الفيزياء",
      Chemistry: "الكيمياء",
      Biology: "الأحياء",
      English: "اللغة الإنجليزية",
    },
    sampleNotes: [
      {
        title: "الرياضيات - الفصل الرابع",
        subject: "Mathematics",
        content:
          "أهم القوانين والملاحظات المتعلقة بالمعادلات والدوال وحل المسائل.",
      },
      {
        title: "أساسيات JavaScript",
        subject: "Programming",
        content:
          "المتغيرات والدوال والمصفوفات والكائنات والحلقات ومفاهيم DOM الأساسية.",
      },
      {
        title: "مراجعة الفيزياء",
        subject: "Physics",
        content:
          "مراجعة أهم القوانين والتعريفات والأمثلة قبل الامتحان القادم.",
      },
    ],
  },

  es: {
    title: "Notas",
    description: "Mantén tus notas de estudio organizadas y fáciles de encontrar.",
    newNote: "Nueva nota",
    search: "Buscar en tus notas...",
    totalNotes: "Notas totales",
    subjects: "Materias",
    thisWeek: "Esta semana",
    noNotes: "No se encontraron notas",
    noNotesDescription:
      "Prueba otra búsqueda o crea una nueva nota para organizar tu material de estudio.",
    createNote: "Crear nota",
    createNewNote: "Crear nueva nota",
    addNoteDescription: "Añade una nota para tus estudios.",
    noteTitle: "Título de la nota",
    titlePlaceholder: "ej. Capítulo 3 de Biología",
    subject: "Materia",
    content: "Contenido",
    contentPlaceholder: "Escribe tus notas de estudio aquí...",
    cancel: "Cancelar",
    close: "Cerrar",
    delete: "Eliminar",
    openNote: "Abrir nota →",
    created: "Creada",
    subjectNames: {
      General: "General",
      Mathematics: "Matemáticas",
      Programming: "Programación",
      Physics: "Física",
      Chemistry: "Química",
      Biology: "Biología",
      English: "Inglés",
    },
    sampleNotes: [
      {
        title: "Matemáticas - Capítulo 4",
        subject: "Mathematics",
        content:
          "Fórmulas importantes y notas sobre ecuaciones, funciones y resolución de problemas.",
      },
      {
        title: "Fundamentos de JavaScript",
        subject: "Programming",
        content:
          "Variables, funciones, arrays, objetos, bucles y conceptos básicos del DOM.",
      },
      {
        title: "Repaso de Física",
        subject: "Physics",
        content:
          "Repasa las leyes, definiciones y ejemplos principales antes del próximo examen.",
      },
    ],
  },

  fr: {
    title: "Notes",
    description: "Gardez vos notes d'étude organisées et faciles à retrouver.",
    newNote: "Nouvelle note",
    search: "Rechercher dans vos notes...",
    totalNotes: "Notes totales",
    subjects: "Matières",
    thisWeek: "Cette semaine",
    noNotes: "Aucune note trouvée",
    noNotesDescription:
      "Essayez une autre recherche ou créez une nouvelle note pour organiser vos études.",
    createNote: "Créer une note",
    createNewNote: "Créer une nouvelle note",
    addNoteDescription: "Ajoutez une note pour vos études.",
    noteTitle: "Titre de la note",
    titlePlaceholder: "ex. Chapitre 3 de biologie",
    subject: "Matière",
    content: "Contenu",
    contentPlaceholder: "Écrivez vos notes d'étude ici...",
    cancel: "Annuler",
    close: "Fermer",
    delete: "Supprimer",
    openNote: "Ouvrir la note →",
    created: "Créée",
    subjectNames: {
      General: "Général",
      Mathematics: "Mathématiques",
      Programming: "Programmation",
      Physics: "Physique",
      Chemistry: "Chimie",
      Biology: "Biologie",
      English: "Anglais",
    },
    sampleNotes: [
      {
        title: "Mathématiques - Chapitre 4",
        subject: "Mathematics",
        content:
          "Formules importantes et notes sur les équations, fonctions et résolution de problèmes.",
      },
      {
        title: "Bases de JavaScript",
        subject: "Programming",
        content:
          "Variables, fonctions, tableaux, objets, boucles et concepts de base du DOM.",
      },
      {
        title: "Révision de physique",
        subject: "Physics",
        content:
          "Révisez les principales lois, définitions et exemples avant le prochain examen.",
      },
    ],
  },

  pt: {
    title: "Notas",
    description: "Mantenha suas anotações de estudo organizadas e fáceis de encontrar.",
    newNote: "Nova nota",
    search: "Pesquisar suas notas...",
    totalNotes: "Total de notas",
    subjects: "Matérias",
    thisWeek: "Esta semana",
    noNotes: "Nenhuma nota encontrada",
    noNotesDescription:
      "Tente outra pesquisa ou crie uma nova nota para organizar seu material de estudo.",
    createNote: "Criar nota",
    createNewNote: "Criar nova nota",
    addNoteDescription: "Adicione uma nota para seus estudos.",
    noteTitle: "Título da nota",
    titlePlaceholder: "ex. Capítulo 3 de Biologia",
    subject: "Matéria",
    content: "Conteúdo",
    contentPlaceholder: "Escreva suas anotações aqui...",
    cancel: "Cancelar",
    close: "Fechar",
    delete: "Excluir",
    openNote: "Abrir nota →",
    created: "Criada",
    subjectNames: {
      General: "Geral",
      Mathematics: "Matemática",
      Programming: "Programação",
      Physics: "Física",
      Chemistry: "Química",
      Biology: "Biologia",
      English: "Inglês",
    },
    sampleNotes: [
      {
        title: "Matemática - Capítulo 4",
        subject: "Mathematics",
        content:
          "Fórmulas importantes e anotações sobre equações, funções e resolução de problemas.",
      },
      {
        title: "Fundamentos de JavaScript",
        subject: "Programming",
        content:
          "Variáveis, funções, arrays, objetos, loops e conceitos básicos do DOM.",
      },
      {
        title: "Revisão de Física",
        subject: "Physics",
        content:
          "Revise as principais leis, definições e exemplos antes da próxima prova.",
      },
    ],
  },

  it: {
    title: "Note",
    description: "Mantieni i tuoi appunti di studio organizzati e facili da trovare.",
    newNote: "Nuova nota",
    search: "Cerca nelle tue note...",
    totalNotes: "Note totali",
    subjects: "Materie",
    thisWeek: "Questa settimana",
    noNotes: "Nessuna nota trovata",
    noNotesDescription:
      "Prova un'altra ricerca o crea una nuova nota per organizzare il materiale di studio.",
    createNote: "Crea nota",
    createNewNote: "Crea nuova nota",
    addNoteDescription: "Aggiungi una nota per i tuoi studi.",
    noteTitle: "Titolo della nota",
    titlePlaceholder: "es. Capitolo 3 di biologia",
    subject: "Materia",
    content: "Contenuto",
    contentPlaceholder: "Scrivi qui i tuoi appunti...",
    cancel: "Annulla",
    close: "Chiudi",
    delete: "Elimina",
    openNote: "Apri nota →",
    created: "Creata",
    subjectNames: {
      General: "Generale",
      Mathematics: "Matematica",
      Programming: "Programmazione",
      Physics: "Fisica",
      Chemistry: "Chimica",
      Biology: "Biologia",
      English: "Inglese",
    },
    sampleNotes: [
      {
        title: "Matematica - Capitolo 4",
        subject: "Mathematics",
        content:
          "Formule importanti e appunti su equazioni, funzioni e risoluzione dei problemi.",
      },
      {
        title: "Basi di JavaScript",
        subject: "Programming",
        content:
          "Variabili, funzioni, array, oggetti, cicli e concetti base del DOM.",
      },
      {
        title: "Ripasso di fisica",
        subject: "Physics",
        content:
          "Ripassa le principali leggi, definizioni ed esempi prima del prossimo esame.",
      },
    ],
  },

  de: {
    title: "Notizen",
    description: "Halte deine Lernnotizen organisiert und leicht auffindbar.",
    newNote: "Neue Notiz",
    search: "Notizen durchsuchen...",
    totalNotes: "Notizen insgesamt",
    subjects: "Fächer",
    thisWeek: "Diese Woche",
    noNotes: "Keine Notizen gefunden",
    noNotesDescription:
      "Versuche eine andere Suche oder erstelle eine neue Notiz, um dein Lernmaterial zu organisieren.",
    createNote: "Notiz erstellen",
    createNewNote: "Neue Notiz erstellen",
    addNoteDescription: "Füge eine Notiz für dein Studium hinzu.",
    noteTitle: "Notiztitel",
    titlePlaceholder: "z. B. Biologie Kapitel 3",
    subject: "Fach",
    content: "Inhalt",
    contentPlaceholder: "Schreibe hier deine Lernnotizen...",
    cancel: "Abbrechen",
    close: "Schließen",
    delete: "Löschen",
    openNote: "Notiz öffnen →",
    created: "Erstellt",
    subjectNames: {
      General: "Allgemein",
      Mathematics: "Mathematik",
      Programming: "Programmierung",
      Physics: "Physik",
      Chemistry: "Chemie",
      Biology: "Biologie",
      English: "Englisch",
    },
    sampleNotes: [
      {
        title: "Mathematik - Kapitel 4",
        subject: "Mathematics",
        content:
          "Wichtige Formeln und Notizen zu Gleichungen, Funktionen und Problemlösungen.",
      },
      {
        title: "JavaScript-Grundlagen",
        subject: "Programming",
        content:
          "Variablen, Funktionen, Arrays, Objekte, Schleifen und grundlegende DOM-Konzepte.",
      },
      {
        title: "Physik-Wiederholung",
        subject: "Physics",
        content:
          "Wiederhole die wichtigsten Gesetze, Definitionen und Beispiele vor der nächsten Prüfung.",
      },
    ],
  },

  zh: {
    title: "笔记",
    description: "整理你的学习笔记，让它们更容易找到。",
    newNote: "新建笔记",
    search: "搜索你的笔记...",
    totalNotes: "笔记总数",
    subjects: "科目",
    thisWeek: "本周",
    noNotes: "未找到笔记",
    noNotesDescription:
      "尝试其他搜索内容，或者创建一条新笔记来整理你的学习资料。",
    createNote: "创建笔记",
    createNewNote: "创建新笔记",
    addNoteDescription: "添加一条学习笔记。",
    noteTitle: "笔记标题",
    titlePlaceholder: "例如：生物学第三章",
    subject: "科目",
    content: "内容",
    contentPlaceholder: "在这里写下你的学习笔记...",
    cancel: "取消",
    close: "关闭",
    delete: "删除",
    openNote: "打开笔记 →",
    created: "创建于",
    subjectNames: {
      General: "综合",
      Mathematics: "数学",
      Programming: "编程",
      Physics: "物理",
      Chemistry: "化学",
      Biology: "生物",
      English: "英语",
    },
    sampleNotes: [
      {
        title: "数学 - 第四章",
        subject: "Mathematics",
        content: "关于方程、函数和问题解决的重要公式和笔记。",
      },
      {
        title: "JavaScript 基础",
        subject: "Programming",
        content: "变量、函数、数组、对象、循环和基本 DOM 概念。",
      },
      {
        title: "物理复习",
        subject: "Physics",
        content: "在即将到来的考试前复习主要定律、定义和例题。",
      },
    ],
  },

  ja: {
    title: "ノート",
    description: "勉強ノートを整理して、簡単に見つけられるようにしましょう。",
    newNote: "新しいノート",
    search: "ノートを検索...",
    totalNotes: "ノート総数",
    subjects: "科目",
    thisWeek: "今週",
    noNotes: "ノートが見つかりません",
    noNotesDescription:
      "別の検索を試すか、新しいノートを作成して学習資料を整理しましょう。",
    createNote: "ノートを作成",
    createNewNote: "新しいノートを作成",
    addNoteDescription: "勉強用のノートを追加します。",
    noteTitle: "ノートのタイトル",
    titlePlaceholder: "例：生物 第3章",
    subject: "科目",
    content: "内容",
    contentPlaceholder: "ここに学習ノートを書いてください...",
    cancel: "キャンセル",
    close: "閉じる",
    delete: "削除",
    openNote: "ノートを開く →",
    created: "作成日",
    subjectNames: {
      General: "一般",
      Mathematics: "数学",
      Programming: "プログラミング",
      Physics: "物理",
      Chemistry: "化学",
      Biology: "生物",
      English: "英語",
    },
    sampleNotes: [
      {
        title: "数学 - 第4章",
        subject: "Mathematics",
        content:
          "方程式、関数、問題解決に関する重要な公式とノート。",
      },
      {
        title: "JavaScript の基礎",
        subject: "Programming",
        content:
          "変数、関数、配列、オブジェクト、ループ、基本的な DOM の概念。",
      },
      {
        title: "物理の復習",
        subject: "Physics",
        content:
          "次の試験の前に、主な法則、定義、例を復習しましょう。",
      },
    ],
  },

  ko: {
    title: "노트",
    description: "학습 노트를 정리하고 쉽게 찾을 수 있도록 관리하세요.",
    newNote: "새 노트",
    search: "노트 검색...",
    totalNotes: "전체 노트",
    subjects: "과목",
    thisWeek: "이번 주",
    noNotes: "노트를 찾을 수 없습니다",
    noNotesDescription:
      "다른 검색어를 입력하거나 새 노트를 만들어 학습 자료를 정리하세요.",
    createNote: "노트 만들기",
    createNewNote: "새 노트 만들기",
    addNoteDescription: "학습을 위한 노트를 추가하세요.",
    noteTitle: "노트 제목",
    titlePlaceholder: "예: 생물학 3장",
    subject: "과목",
    content: "내용",
    contentPlaceholder: "여기에 학습 노트를 작성하세요...",
    cancel: "취소",
    close: "닫기",
    delete: "삭제",
    openNote: "노트 열기 →",
    created: "생성일",
    subjectNames: {
      General: "일반",
      Mathematics: "수학",
      Programming: "프로그래밍",
      Physics: "물리학",
      Chemistry: "화학",
      Biology: "생물학",
      English: "영어",
    },
    sampleNotes: [
      {
        title: "수학 - 4장",
        subject: "Mathematics",
        content:
          "방정식, 함수 및 문제 해결에 관한 중요한 공식과 노트입니다.",
      },
      {
        title: "JavaScript 기초",
        subject: "Programming",
        content:
          "변수, 함수, 배열, 객체, 반복문 및 기본 DOM 개념입니다.",
      },
      {
        title: "물리학 복습",
        subject: "Physics",
        content:
          "다가오는 시험 전에 주요 법칙, 정의 및 예제를 복습하세요.",
      },
    ],
  },

  ru: {
    title: "Заметки",
    description: "Организуйте учебные заметки и легко находите нужную информацию.",
    newNote: "Новая заметка",
    search: "Поиск по заметкам...",
    totalNotes: "Всего заметок",
    subjects: "Предметы",
    thisWeek: "На этой неделе",
    noNotes: "Заметки не найдены",
    noNotesDescription:
      "Попробуйте другой поиск или создайте новую заметку, чтобы организовать учебные материалы.",
    createNote: "Создать заметку",
    createNewNote: "Создать новую заметку",
    addNoteDescription: "Добавьте заметку для учебы.",
    noteTitle: "Название заметки",
    titlePlaceholder: "например, Биология — глава 3",
    subject: "Предмет",
    content: "Содержание",
    contentPlaceholder: "Напишите здесь свои учебные заметки...",
    cancel: "Отмена",
    close: "Закрыть",
    delete: "Удалить",
    openNote: "Открыть заметку →",
    created: "Создано",
    subjectNames: {
      General: "Общее",
      Mathematics: "Математика",
      Programming: "Программирование",
      Physics: "Физика",
      Chemistry: "Химия",
      Biology: "Биология",
      English: "Английский",
    },
    sampleNotes: [
      {
        title: "Математика — глава 4",
        subject: "Mathematics",
        content:
          "Важные формулы и заметки об уравнениях, функциях и решении задач.",
      },
      {
        title: "Основы JavaScript",
        subject: "Programming",
        content:
          "Переменные, функции, массивы, объекты, циклы и основные концепции DOM.",
      },
      {
        title: "Повторение физики",
        subject: "Physics",
        content:
          "Повторите основные законы, определения и примеры перед предстоящим экзаменом.",
      },
    ],
  },

  tr: {
    title: "Notlar",
    description: "Ders notlarını düzenli tut ve kolayca bul.",
    newNote: "Yeni Not",
    search: "Notlarında ara...",
    totalNotes: "Toplam Not",
    subjects: "Dersler",
    thisWeek: "Bu Hafta",
    noNotes: "Not bulunamadı",
    noNotesDescription:
      "Başka bir arama deneyin veya çalışma materyallerinizi düzenlemek için yeni bir not oluşturun.",
    createNote: "Not Oluştur",
    createNewNote: "Yeni Not Oluştur",
    addNoteDescription: "Çalışmaların için bir not ekle.",
    noteTitle: "Not başlığı",
    titlePlaceholder: "ör. Biyoloji 3. Bölüm",
    subject: "Ders",
    content: "İçerik",
    contentPlaceholder: "Çalışma notlarını buraya yaz...",
    cancel: "İptal",
    close: "Kapat",
    delete: "Sil",
    openNote: "Notu aç →",
    created: "Oluşturuldu",
    subjectNames: {
      General: "Genel",
      Mathematics: "Matematik",
      Programming: "Programlama",
      Physics: "Fizik",
      Chemistry: "Kimya",
      Biology: "Biyoloji",
      English: "İngilizce",
    },
    sampleNotes: [
      {
        title: "Matematik - 4. Bölüm",
        subject: "Mathematics",
        content:
          "Denklemler, fonksiyonlar ve problem çözme ile ilgili önemli formüller ve notlar.",
      },
      {
        title: "JavaScript Temelleri",
        subject: "Programming",
        content:
          "Değişkenler, fonksiyonlar, diziler, nesneler, döngüler ve temel DOM kavramları.",
      },
      {
        title: "Fizik Tekrarı",
        subject: "Physics",
        content:
          "Yaklaşan sınavdan önce temel yasaları, tanımları ve örnekleri gözden geçir.",
      },
    ],
  },

  hi: {
    title: "नोट्स",
    description: "अपने अध्ययन नोट्स को व्यवस्थित रखें और आसानी से खोजें।",
    newNote: "नया नोट",
    search: "अपने नोट्स खोजें...",
    totalNotes: "कुल नोट्स",
    subjects: "विषय",
    thisWeek: "इस सप्ताह",
    noNotes: "कोई नोट नहीं मिला",
    noNotesDescription:
      "कोई दूसरी खोज आज़माएँ या अपनी अध्ययन सामग्री को व्यवस्थित करने के लिए नया नोट बनाएँ।",
    createNote: "नोट बनाएँ",
    createNewNote: "नया नोट बनाएँ",
    addNoteDescription: "अपनी पढ़ाई के लिए एक नोट जोड़ें।",
    noteTitle: "नोट का शीर्षक",
    titlePlaceholder: "उदाहरण: जीव विज्ञान अध्याय 3",
    subject: "विषय",
    content: "सामग्री",
    contentPlaceholder: "अपने अध्ययन नोट्स यहाँ लिखें...",
    cancel: "रद्द करें",
    close: "बंद करें",
    delete: "हटाएँ",
    openNote: "नोट खोलें →",
    created: "बनाया गया",
    subjectNames: {
      General: "सामान्य",
      Mathematics: "गणित",
      Programming: "प्रोग्रामिंग",
      Physics: "भौतिकी",
      Chemistry: "रसायन विज्ञान",
      Biology: "जीव विज्ञान",
      English: "अंग्रेज़ी",
    },
    sampleNotes: [
      {
        title: "गणित - अध्याय 4",
        subject: "Mathematics",
        content:
          "समीकरणों, फलनों और समस्या समाधान से संबंधित महत्वपूर्ण सूत्र और नोट्स।",
      },
      {
        title: "JavaScript की मूल बातें",
        subject: "Programming",
        content:
          "वेरिएबल्स, फ़ंक्शन, ऐरे, ऑब्जेक्ट्स, लूप्स और DOM की मूल अवधारणाएँ।",
      },
      {
        title: "भौतिकी की समीक्षा",
        subject: "Physics",
        content:
          "आगामी परीक्षा से पहले मुख्य नियमों, परिभाषाओं और उदाहरणों की समीक्षा करें।",
      },
    ],
  },
} as const;

type LanguageKey = keyof typeof notesTranslations;

export default function NotesPage() {
  const { language } = useLanguage();

  const currentLanguage = (
    notesTranslations[language as LanguageKey]
      ? language
      : "en"
  ) as LanguageKey;

  const t = notesTranslations[currentLanguage];
  const isArabic = language === "ar";

  const initialNotes = useMemo<Note[]>(
    () =>
      t.sampleNotes.map((note, index) => ({
        id: index + 1,
        title: note.title,
        subject: note.subject,
        content: note.content,
        date:
          index === 0
            ? "Sep 27, 2026"
            : index === 1
              ? "Sep 26, 2026"
              : "Sep 25, 2026",
      })),
    [t]
  );

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [newContent, setNewContent] = useState("");

  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();

    const translatedSubject =
      t.subjectNames[note.subject as keyof typeof t.subjectNames] || note.subject;

    return (
      note.title.toLowerCase().includes(query) ||
      note.subject.toLowerCase().includes(query) ||
      translatedSubject.toLowerCase().includes(query) ||
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

  function subjectLabel(subject: string) {
    return (
      t.subjectNames[subject as keyof typeof t.subjectNames] || subject
    );
  }

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <Sidebar />

      <main className={isArabic ? "lg:pr-64" : "lg:pl-64"}>
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>

              <p className="mt-1 text-sm text-slate-500">
                {t.description}
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + {t.newNote}
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-xl">
              <span
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                  isArabic ? "right-4" : "left-4"
                }`}
              >
                ⌕
              </span>

              <input
                type="text"
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                  isArabic ? "pr-11 pl-4" : "pl-11 pr-4"
                }`}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <NoteStat
              label={t.totalNotes}
              value={notes.length.toString()}
              icon="✎"
            />

            <NoteStat
              label={t.subjects}
              value={new Set(notes.map((note) => note.subject)).size.toString()}
              icon="▣"
            />

            <NoteStat
              label={t.thisWeek}
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

              <h2 className="mt-5 text-lg font-bold">{t.noNotes}</h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {t.noNotesDescription}
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                {t.createNote}
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  subjectLabel={subjectLabel}
                  deleteLabel={t.delete}
                  openLabel={t.openNote}
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
                <h2 className="text-lg font-bold">{t.createNewNote}</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t.addNoteDescription}
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
                  {t.noteTitle}
                </label>

                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {t.subject}
                </label>

                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="General">
                    {t.subjectNames.General}
                  </option>

                  <option value="Mathematics">
                    {t.subjectNames.Mathematics}
                  </option>

                  <option value="Programming">
                    {t.subjectNames.Programming}
                  </option>

                  <option value="Physics">
                    {t.subjectNames.Physics}
                  </option>

                  <option value="Chemistry">
                    {t.subjectNames.Chemistry}
                  </option>

                  <option value="Biology">
                    {t.subjectNames.Biology}
                  </option>

                  <option value="English">
                    {t.subjectNames.English}
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {t.content}
                </label>

                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={t.contentPlaceholder}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div
              className={`flex gap-3 border-t border-slate-200 px-6 py-4 ${
                isArabic ? "justify-start" : "justify-end"
              }`}
            >
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                {t.cancel}
              </button>

              <button
                onClick={addNote}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                {t.createNote}
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
                  {subjectLabel(selectedNote.subject)}
                </div>

                <h2 className="text-xl font-bold">
                  {selectedNote.title}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {t.created} {selectedNote.date}
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

            <div
              className={`flex border-t border-slate-200 px-6 py-4 ${
                isArabic ? "justify-start" : "justify-end"
              }`}
            >
              <button
                onClick={() => setSelectedNote(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {t.close}
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
        <p className="text-sm text-slate-500">{label}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold">{value}</p>
    </div>
  );
}

function NoteCard({
  note,
  onOpen,
  onDelete,
  subjectLabel,
  deleteLabel,
  openLabel,
}: {
  note: Note;
  onOpen: () => void;
  onDelete: () => void;
  subjectLabel: (subject: string) => string;
  deleteLabel: string;
  openLabel: string;
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
              {subjectLabel(note.subject)}
            </p>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          {deleteLabel}
        </button>
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
        {note.content}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400">{note.date}</span>

        <button
          onClick={onOpen}
          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          {openLabel}
        </button>
      </div>
    </div>
  );
}