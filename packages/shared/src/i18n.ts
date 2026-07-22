/**
 * i18n translation dictionaries for ahoj supported languages
 * Languages: cs, en, de, sk, pl, uk, ru, zh, ja
 */

export type SupportedLanguage = "cs" | "en" | "de" | "sk" | "pl" | "uk" | "ru" | "zh" | "ja";

export interface TranslationDictionary {
  nav: {
    home: string;
    about: string;
    signIn: string;
    register: string;
    dashboard: string;
    signOut: string;
  };
  feed: {
    title: string;
    grid: string;
    radar: string;
    radius: string;
    activeUsers: string;
    noUsers: string;
    distance: string;
    viewProfile: string;
  };
  sparks: {
    title: string;
    create: string;
    category: string;
    expiresIn: string;
    join: string;
    noSparks: string;
  };
  chats: {
    title: string;
    e2eeNotice: string;
    typeMessage: string;
    send: string;
    noChats: string;
  };
  requests: {
    title: string;
    approve: string;
    deny: string;
    noRequests: string;
  };
  settings: {
    title: string;
    saved: string;
    saving: string;
    profile: string;
    username: string;
    bio: string;
    statusMessage: string;
    avatarUrl: string;
    privacy: string;
    privacyPublic: string;
    privacyPublicDesc: string;
    privacyPrivate: string;
    privacyPrivateDesc: string;
    privacyGhost: string;
    privacyGhostDesc: string;
    ghostFuzz: string;
    ghostFuzzDesc: string;
    dmPermission: string;
    dmEveryone: string;
    dmApproved: string;
    dmNobody: string;
    showDistance: string;
    showDistanceDesc: string;
    notifications: string;
    pushEnabled: string;
    nearbyAlert: string;
    sparksAlert: string;
    messagesAlert: string;
    soundEnabled: string;
    appPreferences: string;
    language: string;
    distanceUnit: string;
    metric: string;
    imperial: string;
    saveChanges: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  cs: {
    nav: {
      home: "Domů",
      about: "O aplikaci",
      signIn: "Přihlásit se",
      register: "Registrace",
      dashboard: "Aplikace",
      signOut: "Odhlásit se",
    },
    feed: {
      title: "Radar v okolí",
      grid: "Mřížka",
      radar: "Radar kmit",
      radius: "Okruh radaru",
      activeUsers: "Aktivní v okolí",
      noUsers: "Nenalezeni žádní uživatelé v okruhu.",
      distance: "vzdálenost",
      viewProfile: "Zobrazit profil",
    },
    sparks: {
      title: "Sparks setkání",
      create: "Vytvořit Spark",
      category: "Kategorie",
      expiresIn: "Vyprší za",
      join: "Připojit se",
      noSparks: "Žádná aktivní setkání v okolí.",
    },
    chats: {
      title: "Šifrované zprávy",
      e2eeNotice: "Koncové šifrování E2EE aktivní",
      typeMessage: "Napište zprávu...",
      send: "Odeslat",
      noChats: "Žádné aktivní konverzace.",
    },
    requests: {
      title: "Žádosti o přístup",
      approve: "Schválit",
      deny: "Odmítnout",
      noRequests: "Žádné čekající žádosti.",
    },
    settings: {
      title: "Nastavení a profil",
      saved: "Změny okamžitě uloženy!",
      saving: "Ukládám...",
      profile: "Uživatelský profil",
      username: "Uživatelské jméno",
      bio: "O mně / Bio",
      statusMessage: "Stavová zpráva",
      avatarUrl: "URL profilové fotky",
      privacy: "Soukromí a viditelnost",
      privacyPublic: "Verejný",
      privacyPublicDesc: "Viditelný pro všechny uživatele v okolí.",
      privacyPrivate: "Soukromý",
      privacyPrivateDesc: "Fotky a bio vidí jen schválení uživatelé.",
      privacyGhost: "Ghost Mode",
      privacyGhostDesc: "Jsi neviditelný na radaru a mapě.",
      ghostFuzz: "Rozptyl polohy v Ghost módu",
      ghostFuzzDesc: "Náhodné zkreslení souřadnic v metrech.",
      dmPermission: "Kdo ti může psát",
      dmEveryone: "Kdo koliv v okolí",
      dmApproved: "Jen schválení přátelé",
      dmNobody: "Nikdo",
      showDistance: "Zobrazovat vzdálenost",
      showDistanceDesc: "Ukazovat ostatním tvou vzdálenost (např. ~300m).",
      notifications: "Upozornění a notifikace",
      pushEnabled: "Push notifikace",
      nearbyAlert: "Upozornění na lidi v okolí",
      sparksAlert: "Upozornění na nové Sparks",
      messagesAlert: "Nové zprávy",
      soundEnabled: "Zvukové efekty",
      appPreferences: "Předvolby aplikace",
      language: "Jazyk rozhraní",
      distanceUnit: "Jednotky vzdálenosti",
      metric: "Metrické (m / km)",
      imperial: "Imperiální (ft / mi)",
      saveChanges: "Uložit změny",
    },
  },

  en: {
    nav: {
      home: "Home",
      about: "About",
      signIn: "Sign In",
      register: "Register",
      dashboard: "Dashboard",
      signOut: "Sign Out",
    },
    feed: {
      title: "Nearby Radar",
      grid: "Grid",
      radar: "Radar Ring",
      radius: "Radar Radius",
      activeUsers: "Active Nearby",
      noUsers: "No nearby users found in radius.",
      distance: "distance",
      viewProfile: "View Profile",
    },
    sparks: {
      title: "Sparks Meetups",
      create: "Create Spark",
      category: "Category",
      expiresIn: "Expires in",
      join: "Join Meetup",
      noSparks: "No active meetups nearby.",
    },
    chats: {
      title: "E2EE Messages",
      e2eeNotice: "End-to-End Encryption active",
      typeMessage: "Type a message...",
      send: "Send",
      noChats: "No active conversations.",
    },
    requests: {
      title: "Access Requests",
      approve: "Approve",
      deny: "Deny",
      noRequests: "No pending requests.",
    },
    settings: {
      title: "Settings & Profile",
      saved: "Settings updated instantly!",
      saving: "Saving...",
      profile: "User Profile",
      username: "Username",
      bio: "Bio",
      statusMessage: "Status Message",
      avatarUrl: "Profile Avatar URL",
      privacy: "Privacy & Visibility",
      privacyPublic: "Public",
      privacyPublicDesc: "Visible to all nearby users.",
      privacyPrivate: "Private",
      privacyPrivateDesc: "Photos & bio require access approval.",
      privacyGhost: "Ghost Mode",
      privacyGhostDesc: "Hidden from radar feed and maps.",
      ghostFuzz: "Ghost Position Fuzzing",
      ghostFuzzDesc: "Random coordinate offset in meters.",
      dmPermission: "Direct Messaging",
      dmEveryone: "Everyone nearby",
      dmApproved: "Approved contacts only",
      dmNobody: "Nobody",
      showDistance: "Show Distance",
      showDistanceDesc: "Display your distance (e.g. ~300m) to others.",
      notifications: "Notifications",
      pushEnabled: "Push Notifications",
      nearbyAlert: "Nearby User Alerts",
      sparksAlert: "New Sparks Alerts",
      messagesAlert: "New Messages",
      soundEnabled: "Sound Effects",
      appPreferences: "App Preferences",
      language: "Interface Language",
      distanceUnit: "Distance Unit",
      metric: "Metric (m / km)",
      imperial: "Imperial (ft / mi)",
      saveChanges: "Save Settings",
    },
  },

  de: {
    nav: {
      home: "Startseite",
      about: "Über uns",
      signIn: "Anmelden",
      register: "Registrieren",
      dashboard: "Dashboard",
      signOut: "Abmelden",
    },
    feed: {
      title: "Radar in der Nähe",
      grid: "Raster",
      radar: "Radar-Ring",
      radius: "Radar-Radius",
      activeUsers: "Aktiv in der Nähe",
      noUsers: "Keine Benutzer im Radius gefunden.",
      distance: "Entfernung",
      viewProfile: "Profil ansehen",
    },
    sparks: {
      title: "Sparks Treffen",
      create: "Spark erstellen",
      category: "Kategorie",
      expiresIn: "Läuft ab in",
      join: "Teilnehmen",
      noSparks: "Keine aktiven Treffen in der Nähe.",
    },
    chats: {
      title: "Verschlüsselte Chats",
      e2eeNotice: "Ende-zu-Ende-Verschlüsselung aktiv",
      typeMessage: "Nachricht schreiben...",
      send: "Senden",
      noChats: "Keine aktiven Gespräche.",
    },
    requests: {
      title: "Zugriffsanfragen",
      approve: "Bestätigen",
      deny: "Ablehnen",
      noRequests: "Keine ausstehenden Anfragen.",
    },
    settings: {
      title: "Einstellungen & Profil",
      saved: "Einstellungen sofort gespeichert!",
      saving: "Speichere...",
      profile: "Benutzerprofil",
      username: "Benutzername",
      bio: "Biografie",
      statusMessage: "Statusnachricht",
      avatarUrl: "Profilbild-URL",
      privacy: "Datenschutz & Sichtbarkeit",
      privacyPublic: "Öffentlich",
      privacyPublicDesc: "Für alle Benutzer in der Nähe sichtbar.",
      privacyPrivate: "Privat",
      privacyPrivateDesc: "Fotos & Bio erfordern Zugriffserlaubnis.",
      privacyGhost: "Geist-Modus",
      privacyGhostDesc: "Auf dem Radar und der Karte verborgen.",
      ghostFuzz: "Positionsverzerrung im Geist-Modus",
      ghostFuzzDesc: "Zufälliger Koordinatenversatz in Metern.",
      dmPermission: "Direktnachrichten",
      dmEveryone: "Jeder in der Nähe",
      dmApproved: "Nur bestätigte Kontakte",
      dmNobody: "Niemand",
      showDistance: "Entfernung anzeigen",
      showDistanceDesc: "Zeige anderen deine Entfernung (z. B. ~300m).",
      notifications: "Benachrichtigungen",
      pushEnabled: "Push-Benachrichtigungen",
      nearbyAlert: "Benutzer in der Nähe",
      sparksAlert: "Neue Sparks",
      messagesAlert: "Neue Nachrichten",
      soundEnabled: "Soundeffekte",
      appPreferences: "App-Einstellungen",
      language: "Sprache",
      distanceUnit: "Entfernungseinheit",
      metric: "Metrisch (m / km)",
      imperial: "Imperial (ft / mi)",
      saveChanges: "Änderungen speichern",
    },
  },

  sk: {
    nav: {
      home: "Domov",
      about: "O aplikácii",
      signIn: "Prihlásiť sa",
      register: "Registrácia",
      dashboard: "Aplikácia",
      signOut: "Odhlásiť sa",
    },
    feed: {
      title: "Radar v okolí",
      grid: "Mriežka",
      radar: "Radarový kruh",
      radius: "Okruh radaru",
      activeUsers: "Aktívni v okolí",
      noUsers: "Nenašli sa žiadni používatelia v okruhu.",
      distance: "vzdialenosť",
      viewProfile: "Zobraziť profil",
    },
    sparks: {
      title: "Sparks stretnutia",
      create: "Vytvoriť Spark",
      category: "Kategória",
      expiresIn: "Vyprší o",
      join: "Pripojiť sa",
      noSparks: "Žiadne aktívne stretnutia v okolí.",
    },
    chats: {
      title: "Šifrované správy",
      e2eeNotice: "Koncové šifrovanie E2EE aktívne",
      typeMessage: "Napíšte správu...",
      send: "Odoslať",
      noChats: "Žiadne aktívne konverzácie.",
    },
    requests: {
      title: "Žiadosti o prístup",
      approve: "Schváliť",
      deny: "Odmietnuť",
      noRequests: "Žiadne čakajúce žiadosti.",
    },
    settings: {
      title: "Nastavenia a profil",
      saved: "Zmeny okamžite uložené!",
      saving: "Ukladám...",
      profile: "Používateľský profil",
      username: "Používateľské meno",
      bio: "O mne / Bio",
      statusMessage: "Stavová správa",
      avatarUrl: "URL profilovej fotky",
      privacy: "Súkromie a viditeľnosť",
      privacyPublic: "Verejný",
      privacyPublicDesc: "Viditeľný pre všetkých v okolí.",
      privacyPrivate: "Súkromný",
      privacyPrivateDesc: "Fotky a bio vidia len schválení používatelia.",
      privacyGhost: "Ghost Mode",
      privacyGhostDesc: "Neviditeľný na radare a mape.",
      ghostFuzz: "Rozptyl polohy v Ghost móde",
      ghostFuzzDesc: "Náhodné skreslenie súradníc v metroch.",
      dmPermission: "Kto vám môže písať",
      dmEveryone: "Ktokoľvek v okolí",
      dmApproved: "Iba schválení priatelia",
      dmNobody: "Nikto",
      showDistance: "Zobrazovať vzdialenosť",
      showDistanceDesc: "Ukazovať ostatným vašu vzdialenosť (napr. ~300m).",
      notifications: "Upozornenia",
      pushEnabled: "Push notifikácie",
      nearbyAlert: "Ludia v okolí",
      sparksAlert: "Nové Sparks",
      messagesAlert: "Nové správy",
      soundEnabled: "Zvukové efekty",
      appPreferences: "Predvoľby aplikácie",
      language: "Jazyk rozhrania",
      distanceUnit: "Jednotky vzdialenosti",
      metric: "Metrické (m / km)",
      imperial: "Imperiálne (ft / mi)",
      saveChanges: "Uložiť zmeny",
    },
  },

  pl: {
    nav: {
      home: "Strona główna",
      about: "O nas",
      signIn: "Zaloguj się",
      register: "Zarejestruj się",
      dashboard: "Aplikacja",
      signOut: "Wyloguj się",
    },
    feed: {
      title: "Radar w pobliżu",
      grid: "Siatka",
      radar: "Pierścień radaru",
      radius: "Zasięg radaru",
      activeUsers: "Aktywni w pobliżu",
      noUsers: "Brak użytkowników w promieniu radaru.",
      distance: "odległość",
      viewProfile: "Zobacz profil",
    },
    sparks: {
      title: "Spotkania Sparks",
      create: "Utwórz Spark",
      category: "Kategoria",
      expiresIn: "Wygasa za",
      join: "Dołącz",
      noSparks: "Brak aktywnych spotkań w pobliżu.",
    },
    chats: {
      title: "Wiadomości E2EE",
      e2eeNotice: "Szyfrowanie end-to-end aktywne",
      typeMessage: "Napisz wiadomość...",
      send: "Wyślij",
      noChats: "Brak aktywnych rozmów.",
    },
    requests: {
      title: "Prośby o dostęp",
      approve: "Zatwierdź",
      deny: "Odrzuć",
      noRequests: "Brak oczekujących próśb.",
    },
    settings: {
      title: "Ustawienia i profil",
      saved: "Ustawienia zapisane natychmiast!",
      saving: "Zapisywanie...",
      profile: "Profil użytkownika",
      username: "Nazwa użytkownika",
      bio: "Biogram",
      statusMessage: "Wiadomość statusowa",
      avatarUrl: "URL zdjęcia profilowego",
      privacy: "Prywatność i widoczność",
      privacyPublic: "Publiczny",
      privacyPublicDesc: "Widoczny dla wszystkich w pobliżu.",
      privacyPrivate: "Prywatny",
      privacyPrivateDesc: "Zdjęcia i bio wymagają akceptacji.",
      privacyGhost: "Tryb Ducha (Ghost)",
      privacyGhostDesc: "Ukryty na radarze i mapie.",
      ghostFuzz: "Rozmycie lokalizacji w Trybie Ducha",
      ghostFuzzDesc: "Losowe przesunięcie współrzędnych w metrach.",
      dmPermission: "Wiadomości prywatne",
      dmEveryone: "Wszyscy w pobliżu",
      dmApproved: "Tylko zaakceptowani",
      dmNobody: "Nikt",
      showDistance: "Pokaż odległość",
      showDistanceDesc: "Wyświetlaj innym swoją odległość (np. ~300m).",
      notifications: "Powiadomienia",
      pushEnabled: "Powiadomienia Push",
      nearbyAlert: "Osoby w pobliżu",
      sparksAlert: "Nowe spotkania Sparks",
      messagesAlert: "Nowe wiadomości",
      soundEnabled: "Efekty dźwiękowe",
      appPreferences: "Preferencje aplikacji",
      language: "Język interfejsu",
      distanceUnit: "Jednostka odległości",
      metric: "Metryczne (m / km)",
      imperial: "Imperialne (ft / mi)",
      saveChanges: "Zapisz zmiany",
    },
  },

  uk: {
    nav: {
      home: "Головна",
      about: "Про нас",
      signIn: "Увійти",
      register: "Реєстрація",
      dashboard: "Дашборд",
      signOut: "Вийти",
    },
    feed: {
      title: "Радар поблизу",
      grid: "Сітка",
      radar: "Коло радара",
      radius: "Радіус радара",
      activeUsers: "Активні поблизу",
      noUsers: "Користувачів у радіусі не знайдено.",
      distance: "відстань",
      viewProfile: "Переглянути профіль",
    },
    sparks: {
      title: "Зустрічі Sparks",
      create: "Створити Spark",
      category: "Категорія",
      expiresIn: "Завершується через",
      join: "Приєднатися",
      noSparks: "Немає активних зустрічей поблизу.",
    },
    chats: {
      title: "Шифровані чати",
      e2eeNotice: "Наскрізне шифрування E2EE активне",
      typeMessage: "Напишіть повідомлення...",
      send: "Надіслати",
      noChats: "Немає активних чатів.",
    },
    requests: {
      title: "Запити доступу",
      approve: "Схвалити",
      deny: "Відхилити",
      noRequests: "Немає запитів.",
    },
    settings: {
      title: "Налаштування та профіль",
      saved: "Зміни збережено миттєво!",
      saving: "Збереження...",
      profile: "Профіль користувача",
      username: "Ім'я користувача",
      bio: "Про себе",
      statusMessage: "Статусне повідомлення",
      avatarUrl: "URL фото профілю",
      privacy: "Приватність та видимість",
      privacyPublic: "Публічний",
      privacyPublicDesc: "Видно усім поблизу.",
      privacyPrivate: "Приватний",
      privacyPrivateDesc: "Фото та біо за підтвердженням.",
      privacyGhost: "Режим Привида (Ghost)",
      privacyGhostDesc: "Сховано з радара та карти.",
      ghostFuzz: "Зміщення координат",
      ghostFuzzDesc: "Випадковий зсув у метрах.",
      dmPermission: "Особисті повідомлення",
      dmEveryone: "Усі поблизу",
      dmApproved: "Лише підтверджені",
      dmNobody: "Ніхто",
      showDistance: "Показувати відстань",
      showDistanceDesc: "Відображати відстань (напр. ~300м).",
      notifications: "Сповіщення",
      pushEnabled: "Push-сповіщення",
      nearbyAlert: "Люди поблизу",
      sparksAlert: "Нові Sparks",
      messagesAlert: "Нові повідомлення",
      soundEnabled: "Звукові ефекти",
      appPreferences: "Налаштування додатку",
      language: "Мова інтерфейсу",
      distanceUnit: "Одиниці відстані",
      metric: "Метричні (м / км)",
      imperial: "Імперські (фути / милі)",
      saveChanges: "Зберегти зміни",
    },
  },

  ru: {
    nav: {
      home: "Главная",
      about: "О нас",
      signIn: "Войти",
      register: "Регистрация",
      dashboard: "Дашборд",
      signOut: "Выйти",
    },
    feed: {
      title: "Радар поблизости",
      grid: "Сетка",
      radar: "Круг радара",
      radius: "Радиус радара",
      activeUsers: "Активные рядом",
      noUsers: "Пользователей в радиусе не найдено.",
      distance: "расстояние",
      viewProfile: "Смотреть профиль",
    },
    sparks: {
      title: "Встречи Sparks",
      create: "Создать Spark",
      category: "Категория",
      expiresIn: "Истекает через",
      join: "Присоединиться",
      noSparks: "Нет активных встреч поблизости.",
    },
    chats: {
      title: "Шифрованные чаты",
      e2eeNotice: "Сквозное шифрование E2EE активно",
      typeMessage: "Напишите сообщение...",
      send: "Отправить",
      noChats: "Нет активных чатов.",
    },
    requests: {
      title: "Запросы доступа",
      approve: "Одобрить",
      deny: "Отклонить",
      noRequests: "Нет запросов.",
    },
    settings: {
      title: "Настройки и профиль",
      saved: "Изменения сохранены мгновенно!",
      saving: "Сохранение...",
      profile: "Профиль пользователя",
      username: "Имя пользователя",
      bio: "О себе",
      statusMessage: "Статусное сообщение",
      avatarUrl: "URL фото профиля",
      privacy: "Приватность и видимость",
      privacyPublic: "Публичный",
      privacyPublicDesc: "Виден всем поблизости.",
      privacyPrivate: "Приватный",
      privacyPrivateDesc: "Фото и био по запросу.",
      privacyGhost: "Режим Призрака (Ghost)",
      privacyGhostDesc: "Скрыт с радара и карты.",
      ghostFuzz: "Смещение координат",
      ghostFuzzDesc: "Случайный сдвиг в метрах.",
      dmPermission: "Личные сообщения",
      dmEveryone: "Все рядом",
      dmApproved: "Только одобренные",
      dmNobody: "Никто",
      showDistance: "Показывать расстояние",
      showDistanceDesc: "Отображать расстояние (напр. ~300м).",
      notifications: "Уведомления",
      pushEnabled: "Push-уведомления",
      nearbyAlert: "Люди поблизости",
      sparksAlert: "Новые Sparks",
      messagesAlert: "Новые сообщения",
      soundEnabled: "Звуковые эффекты",
      appPreferences: "Настройки приложения",
      language: "Язык интерфейса",
      distanceUnit: "Единицы расстояния",
      metric: "Метрические (м / км)",
      imperial: "Имперские (футы / мили)",
      saveChanges: "Сохранить изменения",
    },
  },

  zh: {
    nav: {
      home: "首页",
      about: "关于",
      signIn: "登录",
      register: "注册",
      dashboard: "控制台",
      signOut: "退出",
    },
    feed: {
      title: "附近雷达",
      grid: "网格",
      radar: "雷达圈",
      radius: "雷达半径",
      activeUsers: "附近活跃",
      noUsers: "半径范围内未找到用户。",
      distance: "距离",
      viewProfile: "查看个人资料",
    },
    sparks: {
      title: "Sparks 聚会",
      create: "发起 Spark",
      category: "分类",
      expiresIn: "剩余时间",
      join: "加入聚会",
      noSparks: "附近没有活跃的聚会。",
    },
    chats: {
      title: "加密消息",
      e2eeNotice: "端到端加密 E2EE 已启用",
      typeMessage: "输入消息...",
      send: "发送",
      noChats: "暂无活动对话。",
    },
    requests: {
      title: "访问请求",
      approve: "批准",
      deny: "拒绝",
      noRequests: "暂无待处理请求。",
    },
    settings: {
      title: "设置与个人资料",
      saved: "设置已即时保存！",
      saving: "保存中...",
      profile: "个人资料",
      username: "用户名",
      bio: "个人简介",
      statusMessage: "状态消息",
      avatarUrl: "头像 URL",
      privacy: "隐私与可见性",
      privacyPublic: "公开",
      privacyPublicDesc: "附近所有人可见。",
      privacyPrivate: "私密",
      privacyPrivateDesc: "照片与简介需要批准。",
      privacyGhost: "隐身模式 (Ghost)",
      privacyGhostDesc: "在雷达与地图上隐藏。",
      ghostFuzz: "隐身位置偏移",
      ghostFuzzDesc: "随机坐标偏移米数。",
      dmPermission: "私信权限",
      dmEveryone: "附近的任何人",
      dmApproved: "仅批准的人",
      dmNobody: "任何人都不行",
      showDistance: "显示距离",
      showDistanceDesc: "向他人显示你的距离 (如 ~300m)。",
      notifications: "通知设置",
      pushEnabled: "推送通知",
      nearbyAlert: "附近用户提醒",
      sparksAlert: "新 Sparks 提醒",
      messagesAlert: "新消息提醒",
      soundEnabled: "声音效果",
      appPreferences: "应用偏好",
      language: "界面语言",
      distanceUnit: "距离单位",
      metric: "公制 (米 / 公里)",
      imperial: "英制 (英尺 / 英里)",
      saveChanges: "保存更改",
    },
  },

  ja: {
    nav: {
      home: "ホーム",
      about: "概要",
      signIn: "ログイン",
      register: "登録",
      dashboard: "ダッシュボード",
      signOut: "ログアウト",
    },
    feed: {
      title: "周辺レーダー",
      grid: "グリッド",
      radar: "レーダーリング",
      radius: "レーダー半径",
      activeUsers: "周辺のアクティブ",
      noUsers: "範囲内にユーザーが見つかりません。",
      distance: "距離",
      viewProfile: "プロフィールを見る",
    },
    sparks: {
      title: "Sparks ミートアップ",
      create: "Spark 作成",
      category: "カテゴリ",
      expiresIn: "残り時間",
      join: "参加する",
      noSparks: "周辺にアクティブなミートアップはありません。",
    },
    chats: {
      title: "暗号化メッセージ",
      e2eeNotice: "エンドツーエンド暗号化 (E2EE) 有効",
      typeMessage: "メッセージを入力...",
      send: "送信",
      noChats: "アクティブな会話はありません。",
    },
    requests: {
      title: "アクセスリクエスト",
      approve: "承認",
      deny: "拒否",
      noRequests: "保留中のリクエストはありません。",
    },
    settings: {
      title: "設定とプロフィール",
      saved: "設定が即座に保存されました！",
      saving: "保存中...",
      profile: "ユーザープロフィール",
      username: "ユーザー名",
      bio: "自己紹介",
      statusMessage: "ステータスメッセージ",
      avatarUrl: "アバター URL",
      privacy: "プライバシーと公開設定",
      privacyPublic: "公開",
      privacyPublicDesc: "周辺のすべてのユーザーに表示されます。",
      privacyPrivate: "非公開",
      privacyPrivateDesc: "写真と自己紹介には承認が必要です。",
      privacyGhost: "ゴーストモード",
      privacyGhostDesc: "レーダーとマップから非表示になります。",
      ghostFuzz: "位置情報の曖昧化",
      ghostFuzzDesc: "ランダムな座標オフセット（メートル単位）。",
      dmPermission: "ダイレクトメッセージ",
      dmEveryone: "周辺の全員",
      dmApproved: "承認済みのみ",
      dmNobody: "許可しない",
      showDistance: "距離を表示",
      showDistanceDesc: "他人にあなたの距離（例：~300m）を表示します。",
      notifications: "通知設定",
      pushEnabled: "プッシュ通知",
      nearbyAlert: "周辺ユーザーのアラート",
      sparksAlert: "新しい Sparks アラート",
      messagesAlert: "新着メッセージ",
      soundEnabled: "効果音",
      appPreferences: "アプリの環境設定",
      language: "表示言語",
      distanceUnit: "距離単位",
      metric: "メートル法 (m / km)",
      imperial: "ヤード・ポンド法 (ft / mi)",
      saveChanges: "変更を保存",
    },
  },
};
