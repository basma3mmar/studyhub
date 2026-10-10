"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../language-provider";

type Group = {
  id: number;
  name: string;
  description: string;
  subject: string;
  owner_id: number;
  owner_username: string;
  group_image: string;
  member_count: number;
  is_member: number;
  created_at: string;
};

type GroupTranslations = {
  learnTogether: string;
  title: string;
  createGroup: string;
  myGroups: string;
  myGroupsDescription: string;
  groups: string;
  noGroups: string;
  noGroupsDescription: string;
  discoverGroups: string;
  discoverGroupsDescription: string;
  noAvailableGroups: string;
  beFirst: string;
  loading: string;
  createStudyGroup: string;
  createStudyGroupDescription: string;
  groupName: string;
  groupNamePlaceholder: string;
  subject: string;
  subjectPlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  cancel: string;
  creating: string;
  joined: string;
  owner: string;
  openGroup: string;
  joining: string;
  joinGroup: string;
  defaultDescription: string;
  createSuccess: string;
  createError: string;
  loadError: string;
  joinError: string;
  enterGroupName: string;
};

const translations: Record<string, GroupTranslations> = {
  en: {
    learnTogether: "Learn together",
    title: "Study Groups",
    createGroup: "Create Group",
    myGroups: "My Groups",
    myGroupsDescription:
      "Groups you are currently part of.",
    groups: "groups",
    noGroups: "No groups yet",
    noGroupsDescription:
      "Create your own study group or join one below to start studying together.",
    discoverGroups: "Discover Groups",
    discoverGroupsDescription:
      "Find a group and study with other students.",
    noAvailableGroups: "No available groups",
    beFirst: "Be the first to create one.",
    loading: "Loading groups...",
    createStudyGroup: "Create Study Group",
    createStudyGroupDescription:
      "Create a group and invite other students to study with you.",
    groupName: "Group Name",
    groupNamePlaceholder: "e.g. React Study Group",
    subject: "Subject",
    subjectPlaceholder: "e.g. Programming",
    description: "Description",
    descriptionPlaceholder:
      "What will your group study?",
    cancel: "Cancel",
    creating: "Creating...",
    joined: "Joined",
    owner: "Owner",
    openGroup: "Open Group",
    joining: "Joining...",
    joinGroup: "Join Group",
    defaultDescription:
      "A study group for students.",
    createSuccess: "Group created successfully.",
    createError: "Failed to create group.",
    loadError: "Failed to load groups.",
    joinError: "Failed to join group.",
    enterGroupName: "Please enter a group name.",
  },

  ar: {
    learnTogether: "تعلّم معًا",
    title: "مجموعات الدراسة",
    createGroup: "إنشاء مجموعة",
    myGroups: "مجموعاتي",
    myGroupsDescription:
      "المجموعات التي أنت عضو فيها حاليًا.",
    groups: "مجموعات",
    noGroups: "لا توجد مجموعات بعد",
    noGroupsDescription:
      "أنشئ مجموعة دراسة خاصة بك أو انضم إلى إحدى المجموعات الموجودة بالأسفل لبدء الدراسة معًا.",
    discoverGroups: "اكتشف المجموعات",
    discoverGroupsDescription:
      "اعثر على مجموعة وادرس مع الطلاب الآخرين.",
    noAvailableGroups: "لا توجد مجموعات متاحة",
    beFirst: "كن أول من ينشئ مجموعة.",
    loading: "جاري تحميل المجموعات...",
    createStudyGroup: "إنشاء مجموعة دراسة",
    createStudyGroupDescription:
      "أنشئ مجموعة وادعُ الطلاب الآخرين للدراسة معك.",
    groupName: "اسم المجموعة",
    groupNamePlaceholder: "مثال: مجموعة دراسة React",
    subject: "المادة",
    subjectPlaceholder: "مثال: البرمجة",
    description: "الوصف",
    descriptionPlaceholder:
      "ماذا ستدرس مجموعتك؟",
    cancel: "إلغاء",
    creating: "جاري الإنشاء...",
    joined: "منضم",
    owner: "المالك",
    openGroup: "فتح المجموعة",
    joining: "جاري الانضمام...",
    joinGroup: "انضم للمجموعة",
    defaultDescription:
      "مجموعة دراسة للطلاب.",
    createSuccess: "تم إنشاء المجموعة بنجاح.",
    createError: "فشل إنشاء المجموعة.",
    loadError: "فشل تحميل المجموعات.",
    joinError: "فشل الانضمام إلى المجموعة.",
    enterGroupName: "من فضلك أدخل اسم المجموعة.",
  },

  es: {
    learnTogether: "Aprende juntos",
    title: "Grupos de estudio",
    createGroup: "Crear grupo",
    myGroups: "Mis grupos",
    myGroupsDescription:
      "Grupos de los que formas parte actualmente.",
    groups: "grupos",
    noGroups: "Aún no hay grupos",
    noGroupsDescription:
      "Crea tu propio grupo de estudio o únete a uno para empezar a estudiar juntos.",
    discoverGroups: "Descubrir grupos",
    discoverGroupsDescription:
      "Encuentra un grupo y estudia con otros estudiantes.",
    noAvailableGroups: "No hay grupos disponibles",
    beFirst: "Sé el primero en crear uno.",
    loading: "Cargando grupos...",
    createStudyGroup: "Crear grupo de estudio",
    createStudyGroupDescription:
      "Crea un grupo e invita a otros estudiantes a estudiar contigo.",
    groupName: "Nombre del grupo",
    groupNamePlaceholder: "Ej.: Grupo de estudio de React",
    subject: "Materia",
    subjectPlaceholder: "Ej.: Programación",
    description: "Descripción",
    descriptionPlaceholder:
      "¿Qué estudiará tu grupo?",
    cancel: "Cancelar",
    creating: "Creando...",
    joined: "Unido",
    owner: "Propietario",
    openGroup: "Abrir grupo",
    joining: "Uniéndose...",
    joinGroup: "Unirse al grupo",
    defaultDescription:
      "Un grupo de estudio para estudiantes.",
    createSuccess: "Grupo creado correctamente.",
    createError: "No se pudo crear el grupo.",
    loadError: "No se pudieron cargar los grupos.",
    joinError: "No se pudo unir al grupo.",
    enterGroupName: "Introduce un nombre para el grupo.",
  },

  fr: {
    learnTogether: "Apprenez ensemble",
    title: "Groupes d'étude",
    createGroup: "Créer un groupe",
    myGroups: "Mes groupes",
    myGroupsDescription:
      "Groupes dont vous faites actuellement partie.",
    groups: "groupes",
    noGroups: "Aucun groupe pour le moment",
    noGroupsDescription:
      "Créez votre propre groupe d'étude ou rejoignez-en un pour commencer à étudier ensemble.",
    discoverGroups: "Découvrir les groupes",
    discoverGroupsDescription:
      "Trouvez un groupe et étudiez avec d'autres étudiants.",
    noAvailableGroups: "Aucun groupe disponible",
    beFirst: "Soyez le premier à en créer un.",
    loading: "Chargement des groupes...",
    createStudyGroup: "Créer un groupe d'étude",
    createStudyGroupDescription:
      "Créez un groupe et invitez d'autres étudiants à étudier avec vous.",
    groupName: "Nom du groupe",
    groupNamePlaceholder:
      "Ex. : Groupe d'étude React",
    subject: "Matière",
    subjectPlaceholder: "Ex. : Programmation",
    description: "Description",
    descriptionPlaceholder:
      "Qu'allez-vous étudier dans votre groupe ?",
    cancel: "Annuler",
    creating: "Création...",
    joined: "Rejoint",
    owner: "Propriétaire",
    openGroup: "Ouvrir le groupe",
    joining: "Connexion...",
    joinGroup: "Rejoindre le groupe",
    defaultDescription:
      "Un groupe d'étude pour les étudiants.",
    createSuccess: "Groupe créé avec succès.",
    createError: "Échec de la création du groupe.",
    loadError: "Échec du chargement des groupes.",
    joinError: "Échec de la connexion au groupe.",
    enterGroupName:
      "Veuillez saisir un nom de groupe.",
  },

  pt: {
    learnTogether: "Aprenda junto",
    title: "Grupos de estudo",
    createGroup: "Criar grupo",
    myGroups: "Meus grupos",
    myGroupsDescription:
      "Grupos dos quais você participa atualmente.",
    groups: "grupos",
    noGroups: "Nenhum grupo ainda",
    noGroupsDescription:
      "Crie seu próprio grupo de estudo ou entre em um abaixo para começar a estudar juntos.",
    discoverGroups: "Descobrir grupos",
    discoverGroupsDescription:
      "Encontre um grupo e estude com outros alunos.",
    noAvailableGroups: "Nenhum grupo disponível",
    beFirst: "Seja o primeiro a criar um.",
    loading: "Carregando grupos...",
    createStudyGroup: "Criar grupo de estudo",
    createStudyGroupDescription:
      "Crie um grupo e convide outros alunos para estudar com você.",
    groupName: "Nome do grupo",
    groupNamePlaceholder:
      "Ex.: Grupo de estudo de React",
    subject: "Disciplina",
    subjectPlaceholder: "Ex.: Programação",
    description: "Descrição",
    descriptionPlaceholder:
      "O que seu grupo vai estudar?",
    cancel: "Cancelar",
    creating: "Criando...",
    joined: "Participando",
    owner: "Proprietário",
    openGroup: "Abrir grupo",
    joining: "Entrando...",
    joinGroup: "Entrar no grupo",
    defaultDescription:
      "Um grupo de estudo para alunos.",
    createSuccess: "Grupo criado com sucesso.",
    createError: "Falha ao criar o grupo.",
    loadError: "Falha ao carregar os grupos.",
    joinError: "Falha ao entrar no grupo.",
    enterGroupName:
      "Digite o nome do grupo.",
  },

  it: {
    learnTogether: "Impara insieme",
    title: "Gruppi di studio",
    createGroup: "Crea gruppo",
    myGroups: "I miei gruppi",
    myGroupsDescription:
      "Gruppi di cui fai attualmente parte.",
    groups: "gruppi",
    noGroups: "Nessun gruppo ancora",
    noGroupsDescription:
      "Crea il tuo gruppo di studio o unisciti a uno per iniziare a studiare insieme.",
    discoverGroups: "Scopri i gruppi",
    discoverGroupsDescription:
      "Trova un gruppo e studia con altri studenti.",
    noAvailableGroups: "Nessun gruppo disponibile",
    beFirst: "Sii il primo a crearne uno.",
    loading: "Caricamento gruppi...",
    createStudyGroup: "Crea gruppo di studio",
    createStudyGroupDescription:
      "Crea un gruppo e invita altri studenti a studiare con te.",
    groupName: "Nome del gruppo",
    groupNamePlaceholder:
      "Es.: Gruppo di studio React",
    subject: "Materia",
    subjectPlaceholder: "Es.: Programmazione",
    description: "Descrizione",
    descriptionPlaceholder:
      "Cosa studierà il tuo gruppo?",
    cancel: "Annulla",
    creating: "Creazione...",
    joined: "Iscritto",
    owner: "Proprietario",
    openGroup: "Apri gruppo",
    joining: "Accesso...",
    joinGroup: "Unisciti al gruppo",
    defaultDescription:
      "Un gruppo di studio per studenti.",
    createSuccess: "Gruppo creato con successo.",
    createError: "Impossibile creare il gruppo.",
    loadError: "Impossibile caricare i gruppi.",
    joinError: "Impossibile unirsi al gruppo.",
    enterGroupName:
      "Inserisci il nome del gruppo.",
  },

  de: {
    learnTogether: "Gemeinsam lernen",
    title: "Lerngruppen",
    createGroup: "Gruppe erstellen",
    myGroups: "Meine Gruppen",
    myGroupsDescription:
      "Gruppen, in denen du derzeit Mitglied bist.",
    groups: "Gruppen",
    noGroups: "Noch keine Gruppen",
    noGroupsDescription:
      "Erstelle deine eigene Lerngruppe oder tritt einer Gruppe bei, um gemeinsam zu lernen.",
    discoverGroups: "Gruppen entdecken",
    discoverGroupsDescription:
      "Finde eine Gruppe und lerne mit anderen Studenten.",
    noAvailableGroups: "Keine verfügbaren Gruppen",
    beFirst: "Sei der Erste, der eine erstellt.",
    loading: "Gruppen werden geladen...",
    createStudyGroup: "Lerngruppe erstellen",
    createStudyGroupDescription:
      "Erstelle eine Gruppe und lade andere Studenten zum gemeinsamen Lernen ein.",
    groupName: "Gruppenname",
    groupNamePlaceholder:
      "z. B. React-Lerngruppe",
    subject: "Fach",
    subjectPlaceholder:
      "z. B. Programmierung",
    description: "Beschreibung",
    descriptionPlaceholder:
      "Was wird deine Gruppe lernen?",
    cancel: "Abbrechen",
    creating: "Wird erstellt...",
    joined: "Beigetreten",
    owner: "Besitzer",
    openGroup: "Gruppe öffnen",
    joining: "Beitritt...",
    joinGroup: "Gruppe beitreten",
    defaultDescription:
      "Eine Lerngruppe für Studenten.",
    createSuccess: "Gruppe erfolgreich erstellt.",
    createError: "Gruppe konnte nicht erstellt werden.",
    loadError: "Gruppen konnten nicht geladen werden.",
    joinError: "Beitritt zur Gruppe fehlgeschlagen.",
    enterGroupName:
      "Bitte gib einen Gruppennamen ein.",
  },

  zh: {
    learnTogether: "一起学习",
    title: "学习小组",
    createGroup: "创建小组",
    myGroups: "我的小组",
    myGroupsDescription:
      "你目前加入的小组。",
    groups: "个小组",
    noGroups: "还没有小组",
    noGroupsDescription:
      "创建自己的学习小组或加入下面的小组，一起开始学习。",
    discoverGroups: "发现小组",
    discoverGroupsDescription:
      "寻找一个小组，与其他学生一起学习。",
    noAvailableGroups: "没有可用的小组",
    beFirst: "成为第一个创建小组的人。",
    loading: "正在加载小组...",
    createStudyGroup: "创建学习小组",
    createStudyGroupDescription:
      "创建一个小组并邀请其他学生与你一起学习。",
    groupName: "小组名称",
    groupNamePlaceholder:
      "例如：React 学习小组",
    subject: "科目",
    subjectPlaceholder:
      "例如：编程",
    description: "描述",
    descriptionPlaceholder:
      "你的小组将学习什么？",
    cancel: "取消",
    creating: "正在创建...",
    joined: "已加入",
    owner: "创建者",
    openGroup: "打开小组",
    joining: "正在加入...",
    joinGroup: "加入小组",
    defaultDescription:
      "学生学习小组。",
    createSuccess: "小组创建成功。",
    createError: "创建小组失败。",
    loadError: "加载小组失败。",
    joinError: "加入小组失败。",
    enterGroupName:
      "请输入小组名称。",
  },

  ja: {
    learnTogether: "一緒に学ぼう",
    title: "学習グループ",
    createGroup: "グループを作成",
    myGroups: "参加中のグループ",
    myGroupsDescription:
      "現在参加しているグループです。",
    groups: "グループ",
    noGroups: "まだグループがありません",
    noGroupsDescription:
      "自分の学習グループを作るか、下のグループに参加して一緒に勉強しましょう。",
    discoverGroups: "グループを探す",
    discoverGroupsDescription:
      "グループを見つけて他の学生と学習しましょう。",
    noAvailableGroups:
      "利用可能なグループがありません",
    beFirst:
      "最初のグループを作成しましょう。",
    loading: "グループを読み込んでいます...",
    createStudyGroup: "学習グループを作成",
    createStudyGroupDescription:
      "グループを作成して、他の学生を招待しましょう。",
    groupName: "グループ名",
    groupNamePlaceholder:
      "例：React 学習グループ",
    subject: "科目",
    subjectPlaceholder:
      "例：プログラミング",
    description: "説明",
    descriptionPlaceholder:
      "グループでは何を勉強しますか？",
    cancel: "キャンセル",
    creating: "作成中...",
    joined: "参加済み",
    owner: "オーナー",
    openGroup: "グループを開く",
    joining: "参加中...",
    joinGroup: "グループに参加",
    defaultDescription:
      "学生向けの学習グループです。",
    createSuccess:
      "グループが正常に作成されました。",
    createError:
      "グループの作成に失敗しました。",
    loadError:
      "グループの読み込みに失敗しました。",
    joinError:
      "グループへの参加に失敗しました。",
    enterGroupName:
      "グループ名を入力してください。",
  },

  ko: {
    learnTogether: "함께 공부하세요",
    title: "스터디 그룹",
    createGroup: "그룹 만들기",
    myGroups: "내 그룹",
    myGroupsDescription:
      "현재 참여하고 있는 그룹입니다.",
    groups: "그룹",
    noGroups: "아직 그룹이 없습니다",
    noGroupsDescription:
      "나만의 스터디 그룹을 만들거나 아래 그룹에 참여하여 함께 공부하세요.",
    discoverGroups: "그룹 찾기",
    discoverGroupsDescription:
      "그룹을 찾아 다른 학생들과 함께 공부하세요.",
    noAvailableGroups:
      "사용 가능한 그룹이 없습니다",
    beFirst:
      "첫 번째 그룹을 만들어 보세요.",
    loading: "그룹을 불러오는 중...",
    createStudyGroup: "스터디 그룹 만들기",
    createStudyGroupDescription:
      "그룹을 만들고 다른 학생들을 초대하여 함께 공부하세요.",
    groupName: "그룹 이름",
    groupNamePlaceholder:
      "예: React 스터디 그룹",
    subject: "과목",
    subjectPlaceholder:
      "예: 프로그래밍",
    description: "설명",
    descriptionPlaceholder:
      "그룹에서 무엇을 공부할까요?",
    cancel: "취소",
    creating: "생성 중...",
    joined: "참여 중",
    owner: "소유자",
    openGroup: "그룹 열기",
    joining: "참여 중...",
    joinGroup: "그룹 참여",
    defaultDescription:
      "학생들을 위한 스터디 그룹입니다.",
    createSuccess:
      "그룹이 성공적으로 생성되었습니다.",
    createError:
      "그룹 생성에 실패했습니다.",
    loadError:
      "그룹을 불러오지 못했습니다.",
    joinError:
      "그룹 참여에 실패했습니다.",
    enterGroupName:
      "그룹 이름을 입력하세요.",
  },

  ru: {
    learnTogether: "Учитесь вместе",
    title: "Учебные группы",
    createGroup: "Создать группу",
    myGroups: "Мои группы",
    myGroupsDescription:
      "Группы, в которых вы сейчас состоите.",
    groups: "групп",
    noGroups: "Групп пока нет",
    noGroupsDescription:
      "Создайте свою учебную группу или присоединитесь к одной из групп ниже.",
    discoverGroups: "Найти группы",
    discoverGroupsDescription:
      "Найдите группу и учитесь вместе с другими студентами.",
    noAvailableGroups:
      "Нет доступных групп",
    beFirst:
      "Будьте первым, кто создаст группу.",
    loading: "Загрузка групп...",
    createStudyGroup:
      "Создать учебную группу",
    createStudyGroupDescription:
      "Создайте группу и пригласите других студентов учиться вместе.",
    groupName: "Название группы",
    groupNamePlaceholder:
      "Например: Учебная группа React",
    subject: "Предмет",
    subjectPlaceholder:
      "Например: Программирование",
    description: "Описание",
    descriptionPlaceholder:
      "Что будет изучать ваша группа?",
    cancel: "Отмена",
    creating: "Создание...",
    joined: "Вы участник",
    owner: "Владелец",
    openGroup: "Открыть группу",
    joining: "Вступление...",
    joinGroup: "Вступить в группу",
    defaultDescription:
      "Учебная группа для студентов.",
    createSuccess:
      "Группа успешно создана.",
    createError:
      "Не удалось создать группу.",
    loadError:
      "Не удалось загрузить группы.",
    joinError:
      "Не удалось вступить в группу.",
    enterGroupName:
      "Введите название группы.",
  },

  tr: {
    learnTogether: "Birlikte öğren",
    title: "Çalışma Grupları",
    createGroup: "Grup Oluştur",
    myGroups: "Gruplarım",
    myGroupsDescription:
      "Şu anda üyesi olduğun gruplar.",
    groups: "grup",
    noGroups: "Henüz grup yok",
    noGroupsDescription:
      "Kendi çalışma grubunu oluştur veya aşağıdaki gruplardan birine katıl.",
    discoverGroups: "Grupları Keşfet",
    discoverGroupsDescription:
      "Bir grup bul ve diğer öğrencilerle birlikte çalış.",
    noAvailableGroups:
      "Kullanılabilir grup yok",
    beFirst:
      "İlk grubu sen oluştur.",
    loading: "Gruplar yükleniyor...",
    createStudyGroup:
      "Çalışma Grubu Oluştur",
    createStudyGroupDescription:
      "Bir grup oluştur ve diğer öğrencileri birlikte çalışmaya davet et.",
    groupName: "Grup Adı",
    groupNamePlaceholder:
      "Örn. React Çalışma Grubu",
    subject: "Ders",
    subjectPlaceholder:
      "Örn. Programlama",
    description: "Açıklama",
    descriptionPlaceholder:
      "Grubunuz ne çalışacak?",
    cancel: "İptal",
    creating: "Oluşturuluyor...",
    joined: "Katıldın",
    owner: "Sahip",
    openGroup: "Grubu Aç",
    joining: "Katılınıyor...",
    joinGroup: "Gruba Katıl",
    defaultDescription:
      "Öğrenciler için bir çalışma grubu.",
    createSuccess:
      "Grup başarıyla oluşturuldu.",
    createError:
      "Grup oluşturulamadı.",
    loadError:
      "Gruplar yüklenemedi.",
    joinError:
      "Gruba katılınamadı.",
    enterGroupName:
      "Lütfen grup adını gir.",
  },

  hi: {
    learnTogether: "साथ मिलकर सीखें",
    title: "अध्ययन समूह",
    createGroup: "समूह बनाएँ",
    myGroups: "मेरे समूह",
    myGroupsDescription:
      "वे समूह जिनका आप वर्तमान में हिस्सा हैं।",
    groups: "समूह",
    noGroups: "अभी कोई समूह नहीं है",
    noGroupsDescription:
      "अपना अध्ययन समूह बनाएँ या नीचे दिए गए किसी समूह में शामिल हों।",
    discoverGroups: "समूह खोजें",
    discoverGroupsDescription:
      "कोई समूह खोजें और अन्य छात्रों के साथ अध्ययन करें।",
    noAvailableGroups:
      "कोई उपलब्ध समूह नहीं है",
    beFirst:
      "सबसे पहले आप एक समूह बनाएँ।",
    loading: "समूह लोड हो रहे हैं...",
    createStudyGroup:
      "अध्ययन समूह बनाएँ",
    createStudyGroupDescription:
      "एक समूह बनाएँ और अन्य छात्रों को साथ अध्ययन करने के लिए आमंत्रित करें।",
    groupName: "समूह का नाम",
    groupNamePlaceholder:
      "उदाहरण: React अध्ययन समूह",
    subject: "विषय",
    subjectPlaceholder:
      "उदाहरण: प्रोग्रामिंग",
    description: "विवरण",
    descriptionPlaceholder:
      "आपका समूह क्या पढ़ेगा?",
    cancel: "रद्द करें",
    creating: "बनाया जा रहा है...",
    joined: "शामिल हैं",
    owner: "मालिक",
    openGroup: "समूह खोलें",
    joining: "शामिल हो रहे हैं...",
    joinGroup: "समूह में शामिल हों",
    defaultDescription:
      "छात्रों के लिए एक अध्ययन समूह।",
    createSuccess:
      "समूह सफलतापूर्वक बनाया गया।",
    createError:
      "समूह बनाने में विफल।",
    loadError:
      "समूह लोड करने में विफल।",
    joinError:
      "समूह में शामिल होने में विफल।",
    enterGroupName:
      "कृपया समूह का नाम दर्ज करें।",
  },
};

export default function GroupsPage() {
  const { language } = useLanguage();

  const t =
    translations[language] || translations.en;

  const isArabic = language === "ar";

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(
    null
  );

  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode =
      localStorage.getItem("studyhubDarkMode") === "true";

    setDarkMode(savedDarkMode);

    function updateDarkMode() {
      setDarkMode(
        localStorage.getItem("studyhubDarkMode") ===
          "true"
      );
    }

    window.addEventListener(
      "studyhub-dark-mode-updated",
      updateDarkMode
    );

    window.addEventListener(
      "storage",
      updateDarkMode
    );

    loadGroups();

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
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/groups", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t.loadError
        );
      }

      setGroups(data.groups || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t.loadError
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(t.enterGroupName);
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          subject,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t.createError
        );
      }

      setGroups((current) => [
        data.group,
        ...current,
      ]);

      setName("");
      setSubject("");
      setDescription("");

      setShowCreate(false);

      setSuccess(
        data.message || t.createSuccess
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t.createError
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinGroup(groupId: number) {
    setError("");
    setSuccess("");
    setJoiningId(groupId);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/join`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t.joinError
        );
      }

      setGroups((current) =>
        current.map((group) =>
          group.id === groupId
            ? {
                ...group,
                is_member: 1,
                member_count:
                  data.memberCount,
              }
            : group
        )
      );

      setSuccess(
        data.message || t.joinGroup
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t.joinError
      );
    } finally {
      setJoiningId(null);
    }
  }

  const myGroups = groups.filter(
    (group) => group.is_member
  );

  const availableGroups = groups.filter(
    (group) => !group.is_member
  );

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
          className={`border-b ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex min-h-20 items-center justify-between gap-4 px-6 py-4 lg:px-8">
            <div>
              <p
                className={`text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {t.learnTogether}
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                {t.title}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreate(true);
                setError("");
                setSuccess("");
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + {t.createGroup}
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {error && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                darkMode
                  ? "border-red-900 bg-red-950/40 text-red-300"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                darkMode
                  ? "border-green-900 bg-green-950/40 text-green-300"
                  : "border-green-200 bg-green-50 text-green-600"
              }`}
            >
              {success}
            </div>
          )}

          {loading ? (
            <div
              className={`rounded-2xl border p-10 text-center ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="text-2xl">
                ⏳
              </div>

              <p
                className={`mt-3 text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {t.loading}
              </p>
            </div>
          ) : (
            <>
              <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">
                      {t.myGroups}
                    </h2>

                    <p
                      className={`mt-1 text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {t.myGroupsDescription}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      darkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {myGroups.length} {t.groups}
                  </span>
                </div>

                {myGroups.length === 0 ? (
                  <div
                    className={`rounded-2xl border border-dashed p-10 text-center ${
                      darkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <div className="text-4xl">
                      👥
                    </div>

                    <h3 className="mt-3 font-bold">
                      {t.noGroups}
                    </h3>

                    <p
                      className={`mx-auto mt-2 max-w-md text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {t.noGroupsDescription}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {myGroups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        darkMode={darkMode}
                        joined
                        joining={false}
                        onJoin={() => {}}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-10">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    {t.discoverGroups}
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {t.discoverGroupsDescription}
                  </p>
                </div>

                {availableGroups.length === 0 ? (
                  <div
                    className={`rounded-2xl border p-10 text-center ${
                      darkMode
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="text-3xl">
                      🔎
                    </div>

                    <h3 className="mt-3 font-bold">
                      {t.noAvailableGroups}
                    </h3>

                    <p
                      className={`mt-2 text-sm ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {t.beFirst}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {availableGroups.map(
                      (group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          darkMode={darkMode}
                          joined={false}
                          joining={
                            joiningId === group.id
                          }
                          onJoin={() =>
                            handleJoinGroup(
                              group.id
                            )
                          }
                          t={t}
                        />
                      )
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {showCreate && (
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              darkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {t.createStudyGroup}
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {t.createStudyGroupDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className={`rounded-lg px-2 py-1 text-xl ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-800"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateGroup}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  {t.groupName}
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder={
                    t.groupNamePlaceholder
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  {t.subject}
                </label>

                <input
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder={
                    t.subjectPlaceholder
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  {t.description}
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.descriptionPlaceholder
                  }
                  rows={4}
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    darkMode
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating
                    ? t.creating
                    : t.createGroup}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function GroupCard({
  group,
  darkMode,
  joined,
  joining,
  onJoin,
  t,
}: {
  group: Group;
  darkMode: boolean;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
  t: GroupTranslations;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition ${
        darkMode
          ? "border-slate-800 bg-slate-900 hover:border-slate-700"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className={`h-2 ${
          darkMode
            ? "bg-indigo-500"
            : "bg-indigo-600"
        }`}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl text-2xl ${
              darkMode
                ? "bg-indigo-950 text-indigo-300"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            {group.group_image ? (
              <img
                src={group.group_image}
                alt={`${group.name} group`}
                className="h-full w-full object-cover"
              />
            ) : (
              "👥"
            )}
          </div>

          {joined && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                darkMode
                  ? "bg-green-950 text-green-300"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {t.joined}
            </span>
          )}
        </div>

        <h3 className="mt-4 text-lg font-bold">
          {group.name}
        </h3>

        {group.subject && (
          <p className="mt-1 text-sm font-medium text-indigo-600">
            {group.subject}
          </p>
        )}

        <p
          className={`mt-3 line-clamp-2 text-sm ${
            darkMode
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          {group.description ||
            t.defaultDescription}
        </p>

        <div
          className={`mt-5 flex items-center justify-between border-t pt-4 ${
            darkMode
              ? "border-slate-800"
              : "border-slate-100"
          }`}
        >
          <div
            className={`text-xs ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            <span className="font-semibold">
              👤 {group.member_count}
            </span>

            <span className="mx-2">•</span>

            <span>
              {t.owner}: {group.owner_username}
            </span>
          </div>
        </div>

        {joined ? (
          <Link
            href={`/groups/${group.id}`}
            className="mt-4 block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {t.openGroup}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onJoin}
            disabled={joining}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {joining
              ? t.joining
              : t.joinGroup}
          </button>
        )}
      </div>
    </div>
  );
}