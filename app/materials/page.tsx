"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type Material = {
  id: number;
  name: string;
  subject: string;
  type: "PDF" | "Link" | "Video" | "Document";
  size: string;
  date: string;
};

type MaterialTranslation = {
  materials: string;
  description: string;
  addMaterial: string;
  totalMaterials: string;
  subjects: string;
  pdfs: string;
  searchPlaceholder: string;
  all: string;
  mathematics: string;
  programming: string;
  physics: string;
  chemistry: string;
  biology: string;
  noMaterials: string;
  noMaterialsDescription: string;
  keepOrganized: string;
  organizedDescription: string;
  createDescription: string;
  materialName: string;
  materialNamePlaceholder: string;
  subject: string;
  type: string;
  date?: string;
  sizeDuration: string;
  sizePlaceholder: string;
  frontendDemo: string;
  cancel: string;
  pdf: string;
  document: string;
  video: string;
  link: string;
  newResource: string;
  website: string;
  types: Record<Material["type"], string>;
  subjectNames: Record<string, string>;
};

const translations: Record<string, MaterialTranslation> = {
  en: {
    materials: "Materials",
    description: "Keep all your study resources in one place.",
    addMaterial: "Add Material",
    totalMaterials: "Total Materials",
    subjects: "Subjects",
    pdfs: "PDFs",
    searchPlaceholder: "Search materials...",
    all: "All",
    mathematics: "Mathematics",
    programming: "Programming",
    physics: "Physics",
    chemistry: "Chemistry",
    biology: "Biology",
    noMaterials: "No materials found",
    noMaterialsDescription:
      "Try another search or add a new study resource.",
    keepOrganized: "Keep your resources organized",
    organizedDescription:
      "Later, StudyHub can connect this section to real file uploads, cloud storage, and shared study resources.",
    createDescription: "Add a study resource to your collection.",
    materialName: "Material name",
    materialNamePlaceholder: "e.g. Database Systems Notes",
    subject: "Subject",
    type: "Type",
    sizeDuration: "Size / Duration",
    sizePlaceholder: "e.g. 2.5 MB or 45 min",
    frontendDemo:
      "This is currently a frontend demo. Real file uploading and storage will be connected later when we build the backend.",
    cancel: "Cancel",
    pdf: "PDF",
    document: "Document",
    video: "Video",
    link: "Link",
    newResource: "New resource",
    website: "Website",
    types: {
      PDF: "PDF",
      Link: "Link",
      Video: "Video",
      Document: "Document",
    },
    subjectNames: {
      All: "All",
      Mathematics: "Mathematics",
      Programming: "Programming",
      Physics: "Physics",
      Chemistry: "Chemistry",
      Biology: "Biology",
    },
  },

  ar: {
    materials: "المواد الدراسية",
    description: "احتفظ بكل مصادر دراستك في مكان واحد.",
    addMaterial: "إضافة مادة",
    totalMaterials: "إجمالي المواد",
    subjects: "المواد",
    pdfs: "ملفات PDF",
    searchPlaceholder: "ابحث في المواد...",
    all: "الكل",
    mathematics: "الرياضيات",
    programming: "البرمجة",
    physics: "الفيزياء",
    chemistry: "الكيمياء",
    biology: "الأحياء",
    noMaterials: "لم يتم العثور على مواد",
    noMaterialsDescription:
      "جرّب بحثًا آخر أو أضف مصدرًا دراسيًا جديدًا.",
    keepOrganized: "حافظ على تنظيم مصادر دراستك",
    organizedDescription:
      "لاحقًا يمكن لـ StudyHub ربط هذا القسم برفع الملفات الحقيقي والتخزين السحابي ومشاركة المصادر الدراسية.",
    createDescription: "أضف مصدرًا دراسيًا إلى مجموعتك.",
    materialName: "اسم المادة",
    materialNamePlaceholder: "مثال: ملاحظات نظم قواعد البيانات",
    subject: "المادة",
    type: "النوع",
    sizeDuration: "الحجم / المدة",
    sizePlaceholder: "مثال: 2.5 MB أو 45 دقيقة",
    frontendDemo:
      "هذا القسم حاليًا مجرد نموذج للواجهة. سيتم ربط رفع الملفات والتخزين الحقيقي لاحقًا عند بناء الـ Backend.",
    cancel: "إلغاء",
    pdf: "PDF",
    document: "مستند",
    video: "فيديو",
    link: "رابط",
    newResource: "مصدر جديد",
    website: "موقع",
    types: {
      PDF: "PDF",
      Link: "رابط",
      Video: "فيديو",
      Document: "مستند",
    },
    subjectNames: {
      All: "الكل",
      Mathematics: "الرياضيات",
      Programming: "البرمجة",
      Physics: "الفيزياء",
      Chemistry: "الكيمياء",
      Biology: "الأحياء",
    },
  },

  es: {
    materials: "Materiales",
    description: "Mantén todos tus recursos de estudio en un solo lugar.",
    addMaterial: "Añadir material",
    totalMaterials: "Total de materiales",
    subjects: "Materias",
    pdfs: "PDF",
    searchPlaceholder: "Buscar materiales...",
    all: "Todos",
    mathematics: "Matemáticas",
    programming: "Programación",
    physics: "Física",
    chemistry: "Química",
    biology: "Biología",
    noMaterials: "No se encontraron materiales",
    noMaterialsDescription:
      "Prueba otra búsqueda o añade un nuevo recurso de estudio.",
    keepOrganized: "Mantén tus recursos organizados",
    organizedDescription:
      "Más adelante, StudyHub podrá conectar esta sección con archivos reales, almacenamiento en la nube y recursos compartidos.",
    createDescription: "Añade un recurso de estudio a tu colección.",
    materialName: "Nombre del material",
    materialNamePlaceholder: "Ej.: Apuntes de sistemas de bases de datos",
    subject: "Materia",
    type: "Tipo",
    sizeDuration: "Tamaño / Duración",
    sizePlaceholder: "Ej.: 2.5 MB o 45 min",
    frontendDemo:
      "Actualmente esto es una demostración del frontend. La carga y el almacenamiento real se conectarán más adelante al crear el backend.",
    cancel: "Cancelar",
    pdf: "PDF",
    document: "Documento",
    video: "Vídeo",
    link: "Enlace",
    newResource: "Nuevo recurso",
    website: "Sitio web",
    types: {
      PDF: "PDF",
      Link: "Enlace",
      Video: "Vídeo",
      Document: "Documento",
    },
    subjectNames: {
      All: "Todos",
      Mathematics: "Matemáticas",
      Programming: "Programación",
      Physics: "Física",
      Chemistry: "Química",
      Biology: "Biología",
    },
  },

  fr: {
    materials: "Ressources",
    description:
      "Gardez toutes vos ressources d'étude au même endroit.",
    addMaterial: "Ajouter une ressource",
    totalMaterials: "Total des ressources",
    subjects: "Matières",
    pdfs: "PDF",
    searchPlaceholder: "Rechercher des ressources...",
    all: "Toutes",
    mathematics: "Mathématiques",
    programming: "Programmation",
    physics: "Physique",
    chemistry: "Chimie",
    biology: "Biologie",
    noMaterials: "Aucune ressource trouvée",
    noMaterialsDescription:
      "Essayez une autre recherche ou ajoutez une nouvelle ressource.",
    keepOrganized: "Gardez vos ressources organisées",
    organizedDescription:
      "Plus tard, StudyHub pourra connecter cette section aux fichiers réels, au stockage cloud et aux ressources partagées.",
    createDescription:
      "Ajoutez une ressource d'étude à votre collection.",
    materialName: "Nom de la ressource",
    materialNamePlaceholder: "Ex. : Notes sur les bases de données",
    subject: "Matière",
    type: "Type",
    sizeDuration: "Taille / Durée",
    sizePlaceholder: "Ex. : 2,5 Mo ou 45 min",
    frontendDemo:
      "Ceci est actuellement une démonstration frontend. Le téléchargement et le stockage réels seront ajoutés lors de la création du backend.",
    cancel: "Annuler",
    pdf: "PDF",
    document: "Document",
    video: "Vidéo",
    link: "Lien",
    newResource: "Nouvelle ressource",
    website: "Site web",
    types: {
      PDF: "PDF",
      Link: "Lien",
      Video: "Vidéo",
      Document: "Document",
    },
    subjectNames: {
      All: "Toutes",
      Mathematics: "Mathématiques",
      Programming: "Programmation",
      Physics: "Physique",
      Chemistry: "Chimie",
      Biology: "Biologie",
    },
  },

  pt: {
    materials: "Materiais",
    description:
      "Mantenha todos os seus recursos de estudo em um só lugar.",
    addMaterial: "Adicionar material",
    totalMaterials: "Total de materiais",
    subjects: "Disciplinas",
    pdfs: "PDFs",
    searchPlaceholder: "Pesquisar materiais...",
    all: "Todos",
    mathematics: "Matemática",
    programming: "Programação",
    physics: "Física",
    chemistry: "Química",
    biology: "Biologia",
    noMaterials: "Nenhum material encontrado",
    noMaterialsDescription:
      "Tente outra pesquisa ou adicione um novo recurso de estudo.",
    keepOrganized: "Mantenha seus recursos organizados",
    organizedDescription:
      "Mais tarde, o StudyHub poderá conectar esta seção a uploads reais, armazenamento em nuvem e recursos de estudo compartilhados.",
    createDescription:
      "Adicione um recurso de estudo à sua coleção.",
    materialName: "Nome do material",
    materialNamePlaceholder: "Ex.: Notas de sistemas de banco de dados",
    subject: "Disciplina",
    type: "Tipo",
    sizeDuration: "Tamanho / Duração",
    sizePlaceholder: "Ex.: 2,5 MB ou 45 min",
    frontendDemo:
      "Atualmente, isso é uma demonstração do frontend. O upload e o armazenamento reais serão conectados posteriormente quando criarmos o backend.",
    cancel: "Cancelar",
    pdf: "PDF",
    document: "Documento",
    video: "Vídeo",
    link: "Link",
    newResource: "Novo recurso",
    website: "Site",
    types: {
      PDF: "PDF",
      Link: "Link",
      Video: "Vídeo",
      Document: "Documento",
    },
    subjectNames: {
      All: "Todos",
      Mathematics: "Matemática",
      Programming: "Programação",
      Physics: "Física",
      Chemistry: "Química",
      Biology: "Biologia",
    },
  },

  it: {
    materials: "Materiali",
    description:
      "Conserva tutte le tue risorse di studio in un unico posto.",
    addMaterial: "Aggiungi materiale",
    totalMaterials: "Materiali totali",
    subjects: "Materie",
    pdfs: "PDF",
    searchPlaceholder: "Cerca materiali...",
    all: "Tutti",
    mathematics: "Matematica",
    programming: "Programmazione",
    physics: "Fisica",
    chemistry: "Chimica",
    biology: "Biologia",
    noMaterials: "Nessun materiale trovato",
    noMaterialsDescription:
      "Prova un'altra ricerca o aggiungi una nuova risorsa.",
    keepOrganized: "Mantieni organizzate le tue risorse",
    organizedDescription:
      "In futuro StudyHub potrà collegare questa sezione al caricamento di file, al cloud storage e alle risorse condivise.",
    createDescription:
      "Aggiungi una risorsa di studio alla tua raccolta.",
    materialName: "Nome del materiale",
    materialNamePlaceholder: "Es.: Appunti sui database",
    subject: "Materia",
    type: "Tipo",
    sizeDuration: "Dimensione / Durata",
    sizePlaceholder: "Es.: 2,5 MB o 45 min",
    frontendDemo:
      "Questa è attualmente una demo frontend. Il caricamento e l'archiviazione reali saranno collegati quando creeremo il backend.",
    cancel: "Annulla",
    pdf: "PDF",
    document: "Documento",
    video: "Video",
    link: "Link",
    newResource: "Nuova risorsa",
    website: "Sito web",
    types: {
      PDF: "PDF",
      Link: "Link",
      Video: "Video",
      Document: "Documento",
    },
    subjectNames: {
      All: "Tutti",
      Mathematics: "Matematica",
      Programming: "Programmazione",
      Physics: "Fisica",
      Chemistry: "Chimica",
      Biology: "Biologia",
    },
  },

  de: {
    materials: "Materialien",
    description:
      "Bewahre alle deine Lernressourcen an einem Ort auf.",
    addMaterial: "Material hinzufügen",
    totalMaterials: "Materialien insgesamt",
    subjects: "Fächer",
    pdfs: "PDFs",
    searchPlaceholder: "Materialien suchen...",
    all: "Alle",
    mathematics: "Mathematik",
    programming: "Programmierung",
    physics: "Physik",
    chemistry: "Chemie",
    biology: "Biologie",
    noMaterials: "Keine Materialien gefunden",
    noMaterialsDescription:
      "Versuche eine andere Suche oder füge eine neue Lernressource hinzu.",
    keepOrganized: "Halte deine Ressourcen organisiert",
    organizedDescription:
      "Später kann StudyHub diesen Bereich mit echtem Dateiupload, Cloud-Speicher und geteilten Lernressourcen verbinden.",
    createDescription:
      "Füge eine Lernressource zu deiner Sammlung hinzu.",
    materialName: "Materialname",
    materialNamePlaceholder: "z. B. Notizen zu Datenbanksystemen",
    subject: "Fach",
    type: "Typ",
    sizeDuration: "Größe / Dauer",
    sizePlaceholder: "z. B. 2,5 MB oder 45 Min.",
    frontendDemo:
      "Dies ist derzeit eine Frontend-Demo. Echter Datei-Upload und Speicherung werden später mit dem Backend verbunden.",
    cancel: "Abbrechen",
    pdf: "PDF",
    document: "Dokument",
    video: "Video",
    link: "Link",
    newResource: "Neue Ressource",
    website: "Webseite",
    types: {
      PDF: "PDF",
      Link: "Link",
      Video: "Video",
      Document: "Dokument",
    },
    subjectNames: {
      All: "Alle",
      Mathematics: "Mathematik",
      Programming: "Programmierung",
      Physics: "Physik",
      Chemistry: "Chemie",
      Biology: "Biologie",
    },
  },

  zh: {
    materials: "学习资料",
    description: "将所有学习资源集中在一个地方。",
    addMaterial: "添加资料",
    totalMaterials: "资料总数",
    subjects: "科目",
    pdfs: "PDF",
    searchPlaceholder: "搜索资料...",
    all: "全部",
    mathematics: "数学",
    programming: "编程",
    physics: "物理",
    chemistry: "化学",
    biology: "生物",
    noMaterials: "未找到资料",
    noMaterialsDescription:
      "尝试其他搜索或添加新的学习资源。",
    keepOrganized: "保持学习资源井然有序",
    organizedDescription:
      "以后，StudyHub 可以将此部分连接到真实文件上传、云存储和共享学习资源。",
    createDescription: "将学习资源添加到你的收藏中。",
    materialName: "资料名称",
    materialNamePlaceholder: "例如：数据库系统笔记",
    subject: "科目",
    type: "类型",
    sizeDuration: "大小 / 时长",
    sizePlaceholder: "例如：2.5 MB 或 45 分钟",
    frontendDemo:
      "目前这是一个前端演示。真实的文件上传和存储功能将在构建后端时连接。",
    cancel: "取消",
    pdf: "PDF",
    document: "文档",
    video: "视频",
    link: "链接",
    newResource: "新资源",
    website: "网站",
    types: {
      PDF: "PDF",
      Link: "链接",
      Video: "视频",
      Document: "文档",
    },
    subjectNames: {
      All: "全部",
      Mathematics: "数学",
      Programming: "编程",
      Physics: "物理",
      Chemistry: "化学",
      Biology: "生物",
    },
  },

  ja: {
    materials: "教材",
    description:
      "すべての学習リソースを一か所にまとめましょう。",
    addMaterial: "教材を追加",
    totalMaterials: "教材の合計",
    subjects: "科目",
    pdfs: "PDF",
    searchPlaceholder: "教材を検索...",
    all: "すべて",
    mathematics: "数学",
    programming: "プログラミング",
    physics: "物理",
    chemistry: "化学",
    biology: "生物",
    noMaterials: "教材が見つかりません",
    noMaterialsDescription:
      "別の検索を試すか、新しい学習リソースを追加してください。",
    keepOrganized: "学習リソースを整理しましょう",
    organizedDescription:
      "将来的にStudyHubは、このセクションを実際のファイルアップロード、クラウドストレージ、共有学習リソースに接続できます。",
    createDescription:
      "学習リソースをコレクションに追加してください。",
    materialName: "教材名",
    materialNamePlaceholder:
      "例：データベースシステムのノート",
    subject: "科目",
    type: "種類",
    sizeDuration: "サイズ / 時間",
    sizePlaceholder: "例：2.5 MB または 45分",
    frontendDemo:
      "現在はフロントエンドのデモです。実際のファイルアップロードと保存は、バックエンド構築時に接続されます。",
    cancel: "キャンセル",
    pdf: "PDF",
    document: "ドキュメント",
    video: "動画",
    link: "リンク",
    newResource: "新しいリソース",
    website: "ウェブサイト",
    types: {
      PDF: "PDF",
      Link: "リンク",
      Video: "動画",
      Document: "ドキュメント",
    },
    subjectNames: {
      All: "すべて",
      Mathematics: "数学",
      Programming: "プログラミング",
      Physics: "物理",
      Chemistry: "化学",
      Biology: "生物",
    },
  },

  ko: {
    materials: "자료",
    description:
      "모든 학습 자료를 한곳에서 관리하세요.",
    addMaterial: "자료 추가",
    totalMaterials: "전체 자료",
    subjects: "과목",
    pdfs: "PDF",
    searchPlaceholder: "자료 검색...",
    all: "전체",
    mathematics: "수학",
    programming: "프로그래밍",
    physics: "물리학",
    chemistry: "화학",
    biology: "생물학",
    noMaterials: "자료를 찾을 수 없습니다",
    noMaterialsDescription:
      "다른 검색어를 사용하거나 새로운 학습 자료를 추가하세요.",
    keepOrganized: "학습 자료를 정리하세요",
    organizedDescription:
      "나중에 StudyHub는 이 섹션을 실제 파일 업로드, 클라우드 저장소 및 공유 학습 자료와 연결할 수 있습니다.",
    createDescription:
      "학습 자료를 컬렉션에 추가하세요.",
    materialName: "자료 이름",
    materialNamePlaceholder:
      "예: 데이터베이스 시스템 노트",
    subject: "과목",
    type: "유형",
    sizeDuration: "크기 / 시간",
    sizePlaceholder: "예: 2.5 MB 또는 45분",
    frontendDemo:
      "현재는 프론트엔드 데모입니다. 실제 파일 업로드 및 저장 기능은 백엔드를 구축할 때 연결됩니다.",
    cancel: "취소",
    pdf: "PDF",
    document: "문서",
    video: "동영상",
    link: "링크",
    newResource: "새 리소스",
    website: "웹사이트",
    types: {
      PDF: "PDF",
      Link: "링크",
      Video: "동영상",
      Document: "문서",
    },
    subjectNames: {
      All: "전체",
      Mathematics: "수학",
      Programming: "프로그래밍",
      Physics: "물리학",
      Chemistry: "화학",
      Biology: "생물학",
    },
  },

  ru: {
    materials: "Материалы",
    description:
      "Храните все учебные материалы в одном месте.",
    addMaterial: "Добавить материал",
    totalMaterials: "Всего материалов",
    subjects: "Предметы",
    pdfs: "PDF",
    searchPlaceholder: "Поиск материалов...",
    all: "Все",
    mathematics: "Математика",
    programming: "Программирование",
    physics: "Физика",
    chemistry: "Химия",
    biology: "Биология",
    noMaterials: "Материалы не найдены",
    noMaterialsDescription:
      "Попробуйте другой поиск или добавьте новый учебный ресурс.",
    keepOrganized: "Организуйте свои ресурсы",
    organizedDescription:
      "В будущем StudyHub сможет подключить этот раздел к загрузке файлов, облачному хранилищу и общим учебным ресурсам.",
    createDescription:
      "Добавьте учебный ресурс в свою коллекцию.",
    materialName: "Название материала",
    materialNamePlaceholder:
      "Напр.: Конспект по базам данных",
    subject: "Предмет",
    type: "Тип",
    sizeDuration: "Размер / Длительность",
    sizePlaceholder: "Напр.: 2,5 МБ или 45 мин",
    frontendDemo:
      "Сейчас это демонстрация интерфейса. Реальная загрузка и хранение файлов будут подключены при создании backend.",
    cancel: "Отмена",
    pdf: "PDF",
    document: "Документ",
    video: "Видео",
    link: "Ссылка",
    newResource: "Новый ресурс",
    website: "Веб-сайт",
    types: {
      PDF: "PDF",
      Link: "Ссылка",
      Video: "Видео",
      Document: "Документ",
    },
    subjectNames: {
      All: "Все",
      Mathematics: "Математика",
      Programming: "Программирование",
      Physics: "Физика",
      Chemistry: "Химия",
      Biology: "Биология",
    },
  },

  tr: {
    materials: "Materyaller",
    description:
      "Tüm çalışma kaynaklarını tek bir yerde tut.",
    addMaterial: "Materyal Ekle",
    totalMaterials: "Toplam Materyal",
    subjects: "Dersler",
    pdfs: "PDF'ler",
    searchPlaceholder: "Materyal ara...",
    all: "Tümü",
    mathematics: "Matematik",
    programming: "Programlama",
    physics: "Fizik",
    chemistry: "Kimya",
    biology: "Biyoloji",
    noMaterials: "Materyal bulunamadı",
    noMaterialsDescription:
      "Başka bir arama dene veya yeni bir çalışma kaynağı ekle.",
    keepOrganized: "Kaynaklarını düzenli tut",
    organizedDescription:
      "İleride StudyHub bu bölümü gerçek dosya yükleme, bulut depolama ve paylaşılan çalışma kaynaklarına bağlayabilir.",
    createDescription:
      "Koleksiyonuna bir çalışma kaynağı ekle.",
    materialName: "Materyal adı",
    materialNamePlaceholder:
      "Örn. Veritabanı Sistemleri Notları",
    subject: "Ders",
    type: "Tür",
    sizeDuration: "Boyut / Süre",
    sizePlaceholder: "Örn. 2.5 MB veya 45 dk",
    frontendDemo:
      "Bu şu anda bir frontend demosudur. Gerçek dosya yükleme ve depolama backend oluşturulduğunda bağlanacaktır.",
    cancel: "İptal",
    pdf: "PDF",
    document: "Belge",
    video: "Video",
    link: "Bağlantı",
    newResource: "Yeni kaynak",
    website: "Web sitesi",
    types: {
      PDF: "PDF",
      Link: "Bağlantı",
      Video: "Video",
      Document: "Belge",
    },
    subjectNames: {
      All: "Tümü",
      Mathematics: "Matematik",
      Programming: "Programlama",
      Physics: "Fizik",
      Chemistry: "Kimya",
      Biology: "Biyoloji",
    },
  },

  hi: {
    materials: "सामग्री",
    description:
      "अपनी सभी अध्ययन सामग्री को एक जगह रखें।",
    addMaterial: "सामग्री जोड़ें",
    totalMaterials: "कुल सामग्री",
    subjects: "विषय",
    pdfs: "PDF",
    searchPlaceholder: "सामग्री खोजें...",
    all: "सभी",
    mathematics: "गणित",
    programming: "प्रोग्रामिंग",
    physics: "भौतिकी",
    chemistry: "रसायन विज्ञान",
    biology: "जीव विज्ञान",
    noMaterials: "कोई सामग्री नहीं मिली",
    noMaterialsDescription:
      "दूसरी खोज आज़माएँ या नई अध्ययन सामग्री जोड़ें।",
    keepOrganized: "अपनी सामग्री व्यवस्थित रखें",
    organizedDescription:
      "बाद में StudyHub इस सेक्शन को वास्तविक फ़ाइल अपलोड, क्लाउड स्टोरेज और साझा अध्ययन सामग्री से जोड़ सकता है।",
    createDescription:
      "अपने संग्रह में अध्ययन सामग्री जोड़ें।",
    materialName: "सामग्री का नाम",
    materialNamePlaceholder:
      "उदाहरण: डेटाबेस सिस्टम नोट्स",
    subject: "विषय",
    type: "प्रकार",
    sizeDuration: "आकार / अवधि",
    sizePlaceholder:
      "उदाहरण: 2.5 MB या 45 मिनट",
    frontendDemo:
      "यह वर्तमान में एक फ्रंटएंड डेमो है। वास्तविक फ़ाइल अपलोड और स्टोरेज बाद में बैकएंड बनाने पर जोड़े जाएंगे।",
    cancel: "रद्द करें",
    pdf: "PDF",
    document: "दस्तावेज़",
    video: "वीडियो",
    link: "लिंक",
    newResource: "नया संसाधन",
    website: "वेबसाइट",
    types: {
      PDF: "PDF",
      Link: "लिंक",
      Video: "वीडियो",
      Document: "दस्तावेज़",
    },
    subjectNames: {
      All: "सभी",
      Mathematics: "गणित",
      Programming: "प्रोग्रामिंग",
      Physics: "भौतिकी",
      Chemistry: "रसायन विज्ञान",
      Biology: "जीव विज्ञान",
    },
  },
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
  const { language } = useLanguage();

  const t =
    translations[language] || translations.en;

  const isArabic = language === "ar";

  const [materials, setMaterials] =
    useState<Material[]>(initialMaterials);

  const [selectedSubject, setSelectedSubject] =
    useState("All");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] =
    useState("Mathematics");
  const [newType, setNewType] =
    useState<Material["type"]>("PDF");
  const [newSize, setNewSize] = useState("");

  const filteredMaterials = materials.filter((material) => {
    const matchesSubject =
      selectedSubject === "All" ||
      material.subject === selectedSubject;

    const query = search.toLowerCase();

    const translatedSubject =
      t.subjectNames[material.subject] ||
      material.subject;

    const matchesSearch =
      material.name.toLowerCase().includes(query) ||
      material.subject.toLowerCase().includes(query) ||
      translatedSubject.toLowerCase().includes(query);

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
      size: newSize || t.newResource,
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
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">
                {t.materials}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {t.description}
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + {t.addMaterial}
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <MaterialStat
              label={t.totalMaterials}
              value={materials.length.toString()}
              icon="◫"
            />

            <MaterialStat
              label={t.subjects}
              value={new Set(
                materials.map(
                  (material) => material.subject
                )
              ).size.toString()}
              icon="▣"
            />

            <MaterialStat
              label={t.pdfs}
              value={materials
                .filter(
                  (material) =>
                    material.type === "PDF"
                )
                .length.toString()}
              icon="▤"
            />
          </div>

          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <span
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                  isArabic
                    ? "right-4"
                    : "left-4"
                }`}
              >
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder={t.searchPlaceholder}
                className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                  isArabic
                    ? "pl-4 pr-11"
                    : "pl-11 pr-4"
                }`}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() =>
                    setSelectedSubject(subject)
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    selectedSubject === subject
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {t.subjectNames[subject] ||
                    subject}
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
                {t.noMaterials}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {t.noMaterialsDescription}
              </p>

              <button
                onClick={() =>
                  setShowModal(true)
                }
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                {t.addMaterial}
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="hidden border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid md:grid-cols-[1fr_160px_120px_120px_40px] md:items-center md:gap-4">
                <span>{t.materials}</span>
                <span>{t.subject}</span>
                <span>{t.type}</span>
                <span>{t.date ?? "Date"}</span>
                <span />
              </div>

              <div className="divide-y divide-slate-100">
                {filteredMaterials.map(
                  (material) => (
                    <MaterialRow
                      key={material.id}
                      material={material}
                      onDelete={() =>
                        deleteMaterial(
                          material.id
                        )
                      }
                      translations={t}
                    />
                  )
                )}
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
                  {t.keepOrganized}
                </h3>

                <p className="mt-1 text-sm leading-6 text-indigo-700">
                  {t.organizedDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold">
                  {t.addMaterial}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t.createDescription}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {t.materialName}
                </label>

                <input
                  type="text"
                  value={newName}
                  onChange={(e) =>
                    setNewName(e.target.value)
                  }
                  placeholder={
                    t.materialNamePlaceholder
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
                    {subjects
                      .filter(
                        (subject) =>
                          subject !== "All"
                      )
                      .map((subject) => (
                        <option
                          key={subject}
                          value={subject}
                        >
                          {t.subjectNames[
                            subject
                          ] || subject}
                        </option>
                      ))}
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
                          .value as Material["type"]
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="PDF">
                      {t.types.PDF}
                    </option>

                    <option value="Document">
                      {t.types.Document}
                    </option>

                    <option value="Video">
                      {t.types.Video}
                    </option>

                    <option value="Link">
                      {t.types.Link}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {t.sizeDuration}
                </label>

                <input
                  type="text"
                  value={newSize}
                  onChange={(e) =>
                    setNewSize(
                      e.target.value
                    )
                  }
                  placeholder={
                    t.sizePlaceholder
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  {t.frontendDemo}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                {t.cancel}
              </button>

              <button
                onClick={addMaterial}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                {t.addMaterial}
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
  translations,
}: {
  material: Material;
  onDelete: () => void;
  translations: MaterialTranslation;
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
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
              typeStyles[material.type]
            }`}
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
            {translations.subjectNames[
              material.subject
            ] || material.subject}
          </span>
        </div>

        <div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              typeStyles[material.type]
            }`}
          >
            {translations.types[
              material.type
            ]}
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
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}