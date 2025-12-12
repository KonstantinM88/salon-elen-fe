// src/i18n/messages.ts
import type { Locale } from "./locales";

// Все текстовые ключи проекта
export type BaseMessages = {
  // ======= Навигация =======
  nav_home: string;
  nav_services: string;
  nav_prices: string;
  nav_contacts: string;
  nav_news: string;
  nav_about: string;
  nav_admin: string;

  // ======= HERO (главная) =======
  hero_tagline: string;
  hero_subtitle: string;
  hero_cta_book: string;
  hero_cta_services: string;
  hero_badge: string;

  // ======= Главная – «Популярные услуги» =======
  home_services_title: string;
  home_services_subtitle: string;
  home_services_card1_title: string;
  home_services_card1_text: string;
  home_services_card2_title: string;
  home_services_card2_text: string;
  home_services_card3_title: string;
  home_services_card3_text: string;

  // ======= Главная – «Новости и статьи» =======
  home_news_title: string;
  home_news_subtitle: string;
  home_news_empty: string;

  // ======= Главная – нижний CTA =======
  home_cta_title: string;
  home_cta_text: string;
  home_cta_button: string;

  // ======= Авторизация =======
  auth_login: string;
  auth_logout: string;

  // ======= Футер – общий блок салона =======
  footer_about_section: string;
  footer_about_description: string;

  footer_location_section: string;
  footer_address_label: string;

  footer_hours_label: string;
  footer_hours_weekdays: string;
  footer_hours_saturday: string;
  footer_hours_sunday: string;

  footer_navigation_section: string;

  footer_clients_section: string;

  footer_socials_section: string;

  footer_privacy: string;
  footer_terms: string;
  footer_back_to_top: string;

  footer_copyright: string;

  // Футер – контакты заголовок
  footer_contacts_title: string;

  // Футер – блок для клиентов и мастеров
  footer_client_booking: string;
  footer_client_cabinet: string;
  footer_client_admin: string;
  footer_client_partnership_title: string;
  footer_client_partnership_text: string;

  // Футер – верхний блок (текст)
  footer_top_title: string;
  footer_top_text: string;
  footer_top_chip_online: string;
  footer_top_chip_premium: string;

  footer_quick_title: string;
  footer_quick_text: string;
  footer_quick_step1: string;
  footer_quick_step2: string;
  footer_quick_step3: string;
  footer_quick_adv1: string;
  footer_quick_adv2: string;

  // Футер – соцсети (подсказки)
  footer_socials_instagram_hint: string;
  footer_socials_facebook_hint: string;
  footer_socials_youtube_hint: string;

  // Футер – мессенджеры (подписи)
  footer_messenger_email: string;
  footer_messenger_call: string;

  /* ========= BOOKING ========= */

  // Шаги бронирования (progress bar)
  booking_step_services: string;
  booking_step_master: string;
  booking_step_date: string;
  booking_step_client: string;
  booking_step_verify: string;
  booking_step_payment: string;

  // Загрузка / ошибки (общие)
  booking_loading_text: string;
  booking_error_loading: string;
  booking_error_retry: string;

  // SERVICES PAGE – Hero блока выбора услуги
  booking_hero_badge: string;
  booking_hero_title: string;
  booking_hero_subtitle: string;

  // SERVICES PAGE – категории и карточки
  booking_category_all: string;
  booking_price_on_request: string;
  booking_minutes: string;
  booking_bar_selected_label: string;
  booking_minutes_short: string;

  // Кнопки / общий UI
  booking_continue: string;

  // ==== MASTER PAGE ====

  // Карточка мастера
  booking_master_vip_badge: string;
  booking_master_default_bio: string;
  booking_master_online_booking: string;
  booking_master_premium: string;

  // Ошибки и состояния
  booking_master_no_services: string;
  booking_master_load_error: string;
  booking_master_no_available: string;
  booking_master_different_masters: string;
  booking_master_choose_same_specialist: string;
  booking_master_back_to_services: string;

  // Hero мастера
  booking_master_step_title: string;
  booking_master_hero_title: string;
  booking_master_hero_subtitle: string;
  booking_master_back_button: string;

  // Общий заголовок ошибок
  booking_error_title: string;
};

export type MessageKey = keyof BaseMessages;

/* ==================== RUSSIAN (RU) ==================== */

const ruMessages: BaseMessages = {
  // Навигация
  nav_home: "Главная",
  nav_services: "Услуги",
  nav_prices: "Цены",
  nav_contacts: "Контакты",
  nav_news: "Новости",
  nav_about: "О нас",
  nav_admin: "Админ",

  // Hero
  hero_tagline: "Salon Elen — красота и уход в Halle",
  hero_subtitle:
    "Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.",
  hero_cta_book: "Записаться",
  hero_cta_services: "Все услуги",
  hero_badge: "Онлайн-запись 24/7 • В центре Halle",

  // Главная – «Популярные услуги»
  home_services_title: "Популярные услуги",
  home_services_subtitle: "Что мы делаем лучше всего",
  home_services_card1_title: "Женская стрижка",
  home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
  home_services_card2_title: "Маникюр",
  home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
  home_services_card3_title: "Макияж",
  home_services_card3_text: "Создадим образ под любое событие и настроение.",

  // Главная – «Новости и статьи»
  home_news_title: "Новости и статьи",
  home_news_subtitle: "Свежие обновления и полезные советы",
  home_news_empty: "Пока нет опубликованных материалов.",

  // Главная – нижний CTA
  home_cta_title: "Готовы к обновлению?",
  home_cta_text:
    "Запишитесь онлайн и мы подберём для вас идеальный уход и стиль.",
  home_cta_button: "Записаться",

  // Авторизация
  auth_login: "Войти",
  auth_logout: "Выйти",

  // Футер – салон
  footer_about_section: "Салон & Локация",
  footer_about_description:
    "Мы создаём атмосферу расслабления и красоты, используя профессиональную косметику и современные методики ухода.",

  footer_location_section: "Наш адрес",
  footer_address_label: "Leipziger Straße 70, Halle (Saale)",

  footer_hours_label: "График работы",
  footer_hours_weekdays: "Пн–Пт: 10:00 – 19:00",
  footer_hours_saturday: "Сб: 10:00 – 16:00",
  footer_hours_sunday: "Вс: выходной",

  footer_navigation_section: "Навигация",

  footer_clients_section: "Для клиентов и мастеров",

  footer_socials_section: "Соцсети & Мессенджеры",

  footer_privacy: "Политика конфиденциальности",
  footer_terms: "Условия использования",
  footer_back_to_top: "Наверх",

  footer_copyright: "Все права защищены.",

  footer_contacts_title: "Контакты",

  // Футер – клиенты и мастера
  footer_client_booking: "Онлайн-запись",
  footer_client_cabinet: "Личный кабинет записи",
  footer_client_admin: "Сотрудничество с мастерами",
  footer_client_partnership_title: "Партнёрство с мастерами",
  footer_client_partnership_text:
    "Ищете комфортные условия работы и атмосферу, где ценят качество? Напишите нам — обсудим сотрудничество.",

  // Футер – верхний блок
  footer_top_title: "Ваш салон красоты с онлайн-записью и заботой о деталях",
  footer_top_text:
    "Профессиональные мастера, современные техники и по-настоящему тёплая атмосфера — мы помогаем чувствовать себя уверенно каждый день. Запись занимает пару минут, а эффект — надолго.",
  footer_top_chip_online: "Онлайн-запись 24/7",
  footer_top_chip_premium: "Премиальный подход к сервису",

  footer_quick_title: "Записаться можно в пару кликов",
  footer_quick_text:
    "Онлайн-запись работает круглосуточно, а мы подтвердим ваш визит максимально быстро.",
  footer_quick_step1: "Выберите услугу",
  footer_quick_step2: "Выберите мастера",
  footer_quick_step3: "Подтвердите время",
  footer_quick_adv1: "Онлайн-запись премиум-класса",
  footer_quick_adv2: "Удобные слоты под ваш график",

  // Футер – соцсети
  footer_socials_instagram_hint: "Открыть Instagram салона",
  footer_socials_facebook_hint: "Открыть страницу в Facebook",
  footer_socials_youtube_hint: "Открыть YouTube канал",

  // Футер – мессенджеры
  footer_messenger_email: "Написать на email",
  footer_messenger_call: "Позвонить",

  /* ========= BOOKING ========= */

  // Шаги бронирования
  booking_step_services: "Услуга",
  booking_step_master: "Мастер",
  booking_step_date: "Дата",
  booking_step_client: "Данные",
  booking_step_verify: "Проверка",
  booking_step_payment: "Оплата",

  // SERVICES PAGE – hero (обновлённый вариант «Шаг 1»)
  booking_hero_badge: "Шаг 1 — Выберите Ваши Услуги",
  booking_hero_title: "Онлайн-запись",
  booking_hero_subtitle: "Выберите услуги, которые вам нужны",

  // Категории и карточки
  booking_category_all: "Все",
  booking_price_on_request: "По запросу",
  booking_minutes: "минут",
  booking_bar_selected_label: "Выбрано:",
  booking_minutes_short: "мин",

  // Кнопки / UI
  booking_continue: "Продолжить",

  // Загрузка / ошибки
  booking_loading_text: "Загружаем услуги…",
  booking_error_loading: "Ошибка загрузки",
  booking_error_retry: "Попробовать снова",

  // MASTER PAGE – карточка мастера
  booking_master_vip_badge: "VIP Мастер",
  booking_master_default_bio: "Премиальный мастер салона красоты",
  booking_master_online_booking: "Онлайн-запись",
  booking_master_premium: "Премиум мастер",

  // MASTER PAGE – ошибки и состояния
  booking_master_no_services: "Услуги не выбраны",
  booking_master_load_error: "Не удалось загрузить мастеров",
  booking_master_no_available: "Нет подходящего мастера",
  booking_master_different_masters: "Выбранные услуги выполняют разные мастера",
  booking_master_choose_same_specialist:
    "Выберите набор услуг одного специалиста или вернитесь к выбору",
  booking_master_back_to_services: "Вернуться к услугам",

  // MASTER PAGE – hero
  booking_master_step_title: "Шаг 2 — Выбор Премиум Мастера",
  booking_master_hero_title: "Выбор мастера",
  booking_master_hero_subtitle: "Наши эксперты создадут для вас идеальный образ",
  booking_master_back_button: "Вернуться к выбору услуг",

  // Общий заголовок ошибок
  booking_error_title: "Ошибка",
};

/* ==================== GERMAN (DE) ==================== */

const deMessages: BaseMessages = {
  // Navigation
  nav_home: "Startseite",
  nav_services: "Leistungen",
  nav_prices: "Preise",
  nav_contacts: "Kontakt",
  nav_news: "Neuigkeiten",
  nav_about: "Über uns",
  nav_admin: "Admin",

  // Hero
  hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
  hero_subtitle:
    "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
  hero_cta_book: "Termin buchen",
  hero_cta_services: "Alle Leistungen",
  hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

  // Home – Popular services
  home_services_title: "Beliebte Leistungen",
  home_services_subtitle: "Was wir besonders gut können",
  home_services_card1_title: "Damenhaarschnitt",
  home_services_card1_text:
    "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
  home_services_card2_title: "Maniküre",
  home_services_card2_text:
    "Ästhetik, Hygiene und langanhaltende Beschichtung.",
  home_services_card3_title: "Make-up",
  home_services_card3_text:
    "Wir kreieren ein passendes Make-up für jeden Anlass.",

  // Home – News
  home_news_title: "News & Artikel",
  home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
  home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

  // Home – bottom CTA
  home_cta_title: "Bereit für eine Veränderung?",
  home_cta_text:
    "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
  home_cta_button: "Termin buchen",

  // Auth
  auth_login: "Anmelden",
  auth_logout: "Abmelden",

  // Footer – salon
  footer_about_section: "Salon & Standort",
  footer_about_description:
    "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

  footer_location_section: "Unsere Adresse",
  footer_address_label: "Leipziger Straße 70, Halle (Saale)",

  footer_hours_label: "Öffnungszeiten",
  footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
  footer_hours_saturday: "Sa: 10:00 – 16:00",
  footer_hours_sunday: "So: geschlossen",

  footer_navigation_section: "Navigation",

  footer_clients_section: "Für Kunden und Stylisten",

  footer_socials_section: "Soziale Netzwerke & Messenger",

  footer_privacy: "Datenschutz",
  footer_terms: "Nutzungsbedingungen",
  footer_back_to_top: "Nach oben",

  footer_copyright: "Alle Rechte vorbehalten.",

  footer_contacts_title: "Kontaktdaten",

  footer_client_booking: "Online-Termin",
  footer_client_cabinet: "Kundenbereich für Buchungen",
  footer_client_admin: "Kooperation mit Stylisten",
  footer_client_partnership_title: "Partnerschaft mit Stylisten",
  footer_client_partnership_text:
    "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

  footer_top_title:
    "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
  footer_top_text:
    "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
  footer_top_chip_online: "Online-Termin 24/7",
  footer_top_chip_premium: "Premium-Service",

  footer_quick_title: "In wenigen Klicks zum Termin",
  footer_quick_text:
    "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
  footer_quick_step1: "Leistung wählen",
  footer_quick_step2: "Stylisten wählen",
  footer_quick_step3: "Uhrzeit bestätigen",
  footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
  footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

  footer_socials_instagram_hint: "Instagram des Salons öffnen",
  footer_socials_facebook_hint: "Facebook-Seite öffnen",
  footer_socials_youtube_hint: "YouTube-Kanal öffnen",

  footer_messenger_email: "E-Mail schreiben",
  footer_messenger_call: "Anrufen",

  /* ========= BOOKING ========= */

  booking_step_services: "Dienstleistung",
  booking_step_master: "Meister",
  booking_step_date: "Datum",
  booking_step_client: "Daten",
  booking_step_verify: "Prüfung",
  booking_step_payment: "Zahlung",

  booking_loading_text: "Dienstleistungen werden geladen…",
  booking_error_loading: "Fehler beim Laden",
  booking_error_retry: "Erneut versuchen",

  // SERVICES PAGE – hero (step-based)
  booking_hero_badge: "Schritt 1 — Wählen Sie Ihre Dienstleistungen",
  booking_hero_title: "Online-Buchung",
  booking_hero_subtitle: "Wählen Sie die Dienstleistungen, die Sie benötigen",

  booking_category_all: "Alle",
  booking_price_on_request: "Auf Anfrage",
  booking_minutes: "Minuten",
  booking_bar_selected_label: "Ausgewählt:",
  booking_minutes_short: "Min",

  booking_continue: "Weiter",

  // MASTER PAGE
  booking_master_vip_badge: "VIP Meister",
  booking_master_default_bio: "Premium-Meister des Schönheitssalons",
  booking_master_online_booking: "Online-Buchung",
  booking_master_premium: "Premium-Meister",

  booking_master_no_services: "Keine Dienstleistungen ausgewählt",
  booking_master_load_error: "Meister konnten nicht geladen werden",
  booking_master_no_available: "Kein passender Meister",
  booking_master_different_masters:
    "Die ausgewählten Dienstleistungen werden von verschiedenen Meistern durchgeführt",
  booking_master_choose_same_specialist:
    "Wählen Sie ein Set von Dienstleistungen eines Spezialisten oder kehren Sie zur Auswahl zurück",
  booking_master_back_to_services: "Zurück zu Dienstleistungen",

  booking_master_step_title: "Schritt 2 — Auswahl des Premium-Meisters",
  booking_master_hero_title: "Meisterauswahl",
  booking_master_hero_subtitle:
    "Unsere Experten schaffen für Sie das perfekte Bild",
  booking_master_back_button: "Zurück zur Dienstleistungsauswahl",

  booking_error_title: "Fehler",
};

/* ==================== ENGLISH (EN) ==================== */

const enMessages: BaseMessages = {
  // Navigation
  nav_home: "Home",
  nav_services: "Services",
  nav_prices: "Prices",
  nav_contacts: "Contacts",
  nav_news: "News",
  nav_about: "About us",
  nav_admin: "Admin",

  // Hero
  hero_tagline: "Salon Elen – beauty and care in Halle",
  hero_subtitle:
    "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
  hero_cta_book: "Book now",
  hero_cta_services: "All services",
  hero_badge: "Online booking 24/7 • In the center of Halle",

  // Home – popular services
  home_services_title: "Popular services",
  home_services_subtitle: "What we do best",
  home_services_card1_title: "Women’s haircut",
  home_services_card1_text: "We highlight your style and individuality.",
  home_services_card2_title: "Manicure",
  home_services_card2_text:
    "Aesthetics, hygiene and long-lasting coating.",
  home_services_card3_title: "Make-up",
  home_services_card3_text:
    "We create the right look for any occasion.",

  // Home – news
  home_news_title: "News & articles",
  home_news_subtitle: "Fresh updates and useful tips",
  home_news_empty: "No posts have been published yet.",

  // Home – bottom CTA
  home_cta_title: "Ready for a change?",
  home_cta_text:
    "Book your appointment online – we’ll find the perfect care and style for you.",
  home_cta_button: "Book now",

  // Auth
  auth_login: "Sign in",
  auth_logout: "Sign out",

  // Footer – salon
  footer_about_section: "Salon & Location",
  footer_about_description:
    "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

  footer_location_section: "Our address",
  footer_address_label: "Leipziger Straße 70, Halle (Saale)",

  footer_hours_label: "Opening hours",
  footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
  footer_hours_saturday: "Sat: 10:00 – 16:00",
  footer_hours_sunday: "Sun: closed",

  footer_navigation_section: "Navigation",

  footer_clients_section: "For clients and stylists",

  footer_socials_section: "Social Media & Messengers",

  footer_privacy: "Privacy Policy",
  footer_terms: "Terms of Use",
  footer_back_to_top: "Back to top",

  footer_copyright: "All rights reserved.",

  footer_contacts_title: "Contacts",

  footer_client_booking: "Online booking",
  footer_client_cabinet: "Client booking account",
  footer_client_admin: "Stylist cooperation",
  footer_client_partnership_title: "Partnership with stylists",
  footer_client_partnership_text:
    "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we’ll discuss cooperation.",

  footer_top_title:
    "Your beauty salon with online booking and attention to detail",
  footer_top_text:
    "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
  footer_top_chip_online: "Online booking 24/7",
  footer_top_chip_premium: "Premium service",

  footer_quick_title: "Book your visit in a few clicks",
  footer_quick_text:
    "Online booking is available 24/7 – we’ll confirm your appointment as quickly as possible.",
  footer_quick_step1: "Choose a service",
  footer_quick_step2: "Choose a stylist",
  footer_quick_step3: "Confirm the time",
  footer_quick_adv1: "Premium-level online booking",
  footer_quick_adv2: "Convenient time slots for your schedule",

  footer_socials_instagram_hint: "Open the salon’s Instagram",
  footer_socials_facebook_hint: "Open the Facebook page",
  footer_socials_youtube_hint: "Open the YouTube channel",

  footer_messenger_email: "Send an email",
  footer_messenger_call: "Call us",

  /* ========= BOOKING ========= */

  booking_step_services: "Service",
  booking_step_master: "Master",
  booking_step_date: "Date",
  booking_step_client: "Details",
  booking_step_verify: "Verify",
  booking_step_payment: "Payment",

  booking_loading_text: "Loading services…",
  booking_error_loading: "Loading error",
  booking_error_retry: "Try Again",

  // SERVICES PAGE – hero
  booking_hero_badge: "Step 1 — Choose Your Services",
  booking_hero_title: "Online Booking",
  booking_hero_subtitle: "Select the services you need",

  booking_category_all: "All",
  booking_price_on_request: "On Request",
  booking_minutes: "minutes",
  booking_bar_selected_label: "Selected:",
  booking_minutes_short: "min",

  booking_continue: "Continue",

  // MASTER PAGE
  booking_master_vip_badge: "VIP Master",
  booking_master_default_bio: "Premium beauty salon master",
  booking_master_online_booking: "Online Booking",
  booking_master_premium: "Premium Master",

  booking_master_no_services: "No services selected",
  booking_master_load_error: "Failed to load masters",
  booking_master_no_available: "No suitable master",
  booking_master_different_masters:
    "Selected services are performed by different masters",
  booking_master_choose_same_specialist:
    "Choose a set of services from one specialist or return to selection",
  booking_master_back_to_services: "Back to Services",

  booking_master_step_title: "Step 2 — Premium Master Selection",
  booking_master_hero_title: "Master Selection",
  booking_master_hero_subtitle: "Our experts will create the perfect look for you",
  booking_master_back_button: "Back to Service Selection",

  booking_error_title: "Error",
};

/* ==================== EXPORT ==================== */

export const messages: Record<Locale, BaseMessages> = {
  ru: ruMessages,
  de: deMessages,
  en: enMessages,
};

export function translate(locale: Locale, key: MessageKey): string {
  const dict = messages[locale] ?? messages.ru;
  return dict[key] ?? key;
}





// // src/i18n/messages.ts

// import type { Locale } from "./locales";

// export type BaseMessages = {
//   // ==================== BOOKING FLOW ====================
  
//   // Progress Bar Steps
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_date: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;
  
//   // ==================== SERVICES PAGE ====================
  
//   // Hero Section
//   booking_hero_badge: string;
//   booking_hero_title: string;
//   booking_hero_subtitle: string;
  
//   // Categories
//   booking_category_all: string;
  
//   // Service Card
//   booking_price_on_request: string;
//   booking_minutes: string;
//   booking_minutes_short: string;
  
//   // Bottom Bar
//   booking_bar_selected_label: string;
//   booking_continue: string;
  
//   // Loading & Errors
//   booking_loading_text: string;
//   booking_error_loading: string;
//   booking_error_retry: string;
  
//   // ==================== MASTER PAGE ====================
  
//   // Master Card
//   booking_master_vip_badge: string;
//   booking_master_default_bio: string;
//   booking_master_online_booking: string;
//   booking_master_premium: string;
  
//   // Errors & States
//   booking_master_no_services: string;
//   booking_master_load_error: string;
//   booking_master_no_available: string;
//   booking_master_different_masters: string;
//   booking_master_choose_same_specialist: string;
//   booking_master_back_to_services: string;
  
//   // Hero Section
//   booking_master_step_title: string;
//   booking_master_hero_title: string;
//   booking_master_hero_subtitle: string;
//   booking_master_back_button: string;
  
//   // General Errors
//   booking_error_title: string;
// };

// export const messages: Record<Locale, BaseMessages> = {
//   // ==================== GERMAN (DE) ====================
//   de: {
//     // Progress Bar Steps
//     booking_step_services: "Dienstleistung",
//     booking_step_master: "Meister",
//     booking_step_date: "Datum",
//     booking_step_client: "Daten",
//     booking_step_verify: "Prüfung",
//     booking_step_payment: "Zahlung",
    
//     // ==================== SERVICES PAGE ====================
    
//     // Hero Section
//     booking_hero_badge: "Schritt 1 — Wählen Sie Ihre Dienstleistungen",
//     booking_hero_title: "Online-Buchung",
//     booking_hero_subtitle: "Wählen Sie die Dienstleistungen, die Sie benötigen",
    
//     // Categories
//     booking_category_all: "Alle",
    
//     // Service Card
//     booking_price_on_request: "Auf Anfrage",
//     booking_minutes: "Minuten",
//     booking_minutes_short: "Min",
    
//     // Bottom Bar
//     booking_bar_selected_label: "Ausgewählt:",
//     booking_continue: "Weiter",
    
//     // Loading & Errors
//     booking_loading_text: "Dienstleistungen werden geladen…",
//     booking_error_loading: "Fehler beim Laden",
//     booking_error_retry: "Erneut versuchen",
    
//     // ==================== MASTER PAGE ====================
    
//     // Master Card
//     booking_master_vip_badge: "VIP Meister",
//     booking_master_default_bio: "Premium-Meister des Schönheitssalons",
//     booking_master_online_booking: "Online-Buchung",
//     booking_master_premium: "Premium-Meister",
    
//     // Errors & States
//     booking_master_no_services: "Keine Dienstleistungen ausgewählt",
//     booking_master_load_error: "Meister konnten nicht geladen werden",
//     booking_master_no_available: "Kein passender Meister",
//     booking_master_different_masters: "Die ausgewählten Dienstleistungen werden von verschiedenen Meistern durchgeführt",
//     booking_master_choose_same_specialist: "Wählen Sie ein Set von Dienstleistungen eines Spezialisten oder kehren Sie zur Auswahl zurück",
//     booking_master_back_to_services: "Zurück zu Dienstleistungen",
    
//     // Hero Section
//     booking_master_step_title: "Schritt 2 — Auswahl des Premium-Meisters",
//     booking_master_hero_title: "Meisterauswahl",
//     booking_master_hero_subtitle: "Unsere Experten schaffen für Sie das perfekte Bild",
//     booking_master_back_button: "Zurück zur Dienstleistungsauswahl",
    
//     // General Errors
//     booking_error_title: "Fehler",
//   },
  
//   // ==================== RUSSIAN (RU) ====================
//   ru: {
//     // Progress Bar Steps
//     booking_step_services: "Услуга",
//     booking_step_master: "Мастер",
//     booking_step_date: "Дата",
//     booking_step_client: "Данные",
//     booking_step_verify: "Проверка",
//     booking_step_payment: "Оплата",
    
//     // ==================== SERVICES PAGE ====================
    
//     // Hero Section
//     booking_hero_badge: "Шаг 1 — Выберите Ваши Услуги",
//     booking_hero_title: "Онлайн-запись",
//     booking_hero_subtitle: "Выберите услуги, которые вам нужны",
    
//     // Categories
//     booking_category_all: "Все",
    
//     // Service Card
//     booking_price_on_request: "По запросу",
//     booking_minutes: "минут",
//     booking_minutes_short: "мин",
    
//     // Bottom Bar
//     booking_bar_selected_label: "Выбрано:",
//     booking_continue: "Продолжить",
    
//     // Loading & Errors
//     booking_loading_text: "Загружаем услуги…",
//     booking_error_loading: "Ошибка загрузки",
//     booking_error_retry: "Попробовать снова",
    
//     // ==================== MASTER PAGE ====================
    
//     // Master Card
//     booking_master_vip_badge: "VIP Мастер",
//     booking_master_default_bio: "Премиальный мастер салона красоты",
//     booking_master_online_booking: "Онлайн-запись",
//     booking_master_premium: "Премиум мастер",
    
//     // Errors & States
//     booking_master_no_services: "Услуги не выбраны",
//     booking_master_load_error: "Не удалось загрузить мастеров",
//     booking_master_no_available: "Нет подходящего мастера",
//     booking_master_different_masters: "Выбранные услуги выполняют разные мастера",
//     booking_master_choose_same_specialist: "Выберите набор услуг одного специалиста или вернитесь к выбору",
//     booking_master_back_to_services: "Вернуться к услугам",
    
//     // Hero Section
//     booking_master_step_title: "Шаг 2 — Выбор Премиум Мастера",
//     booking_master_hero_title: "Выбор мастера",
//     booking_master_hero_subtitle: "Наши эксперты создадут для вас идеальный образ",
//     booking_master_back_button: "Вернуться к выбору услуг",
    
//     // General Errors
//     booking_error_title: "Ошибка",
//   },
  
//   // ==================== ENGLISH (EN) ====================
//   en: {
//     // Progress Bar Steps
//     booking_step_services: "Service",
//     booking_step_master: "Master",
//     booking_step_date: "Date",
//     booking_step_client: "Details",
//     booking_step_verify: "Verify",
//     booking_step_payment: "Payment",
    
//     // ==================== SERVICES PAGE ====================
    
//     // Hero Section
//     booking_hero_badge: "Step 1 — Choose Your Services",
//     booking_hero_title: "Online Booking",
//     booking_hero_subtitle: "Select the services you need",
    
//     // Categories
//     booking_category_all: "All",
    
//     // Service Card
//     booking_price_on_request: "On Request",
//     booking_minutes: "minutes",
//     booking_minutes_short: "min",
    
//     // Bottom Bar
//     booking_bar_selected_label: "Selected:",
//     booking_continue: "Continue",
    
//     // Loading & Errors
//     booking_loading_text: "Loading services…",
//     booking_error_loading: "Loading error",
//     booking_error_retry: "Try Again",
    
//     // ==================== MASTER PAGE ====================
    
//     // Master Card
//     booking_master_vip_badge: "VIP Master",
//     booking_master_default_bio: "Premium beauty salon master",
//     booking_master_online_booking: "Online Booking",
//     booking_master_premium: "Premium Master",
    
//     // Errors & States
//     booking_master_no_services: "No services selected",
//     booking_master_load_error: "Failed to load masters",
//     booking_master_no_available: "No suitable master",
//     booking_master_different_masters: "Selected services are performed by different masters",
//     booking_master_choose_same_specialist: "Choose a set of services from one specialist or return to selection",
//     booking_master_back_to_services: "Back to Services",
    
//     // Hero Section
//     booking_master_step_title: "Step 2 — Premium Master Selection",
//     booking_master_hero_title: "Master Selection",
//     booking_master_hero_subtitle: "Our experts will create the perfect look for you",
//     booking_master_back_button: "Back to Service Selection",
    
//     // General Errors
//     booking_error_title: "Error",
//   },
// };

// export type MessageKey = keyof BaseMessages;

// export function translate(locale: Locale, key: MessageKey): string {
//   return messages[locale][key] || messages.de[key] || key;
// }





// // src/i18n/messages.ts
// import type { Locale } from "./locales";

// // Все текстовые ключи проекта
// export type BaseMessages = {
//   // Навигация
//   nav_home: string;
//   nav_services: string;
//   nav_prices: string;
//   nav_contacts: string;
//   nav_news: string;
//   nav_about: string;
//   nav_admin: string;

//   // Hero
//   hero_tagline: string;
//   hero_subtitle: string;
//   hero_cta_book: string;
//   hero_cta_services: string;
//   hero_badge: string;

//   // Главная – блок «Популярные услуги»
//   home_services_title: string;
//   home_services_subtitle: string;
//   home_services_card1_title: string;
//   home_services_card1_text: string;
//   home_services_card2_title: string;
//   home_services_card2_text: string;
//   home_services_card3_title: string;
//   home_services_card3_text: string;

//   // Главная – блок «Новости и статьи»
//   home_news_title: string;
//   home_news_subtitle: string;
//   home_news_empty: string;

//   // Главная – нижний CTA
//   home_cta_title: string;
//   home_cta_text: string;
//   home_cta_button: string;

//   // Авторизация
//   auth_login: string;
//   auth_logout: string;

//   // Футер – общий блок салона
//   footer_about_section: string;
//   footer_about_description: string;

//   footer_location_section: string;
//   footer_address_label: string;

//   footer_hours_label: string;
//   footer_hours_weekdays: string;
//   footer_hours_saturday: string;
//   footer_hours_sunday: string;

//   footer_navigation_section: string;

//   footer_clients_section: string;

//   footer_socials_section: string;

//   footer_privacy: string;
//   footer_terms: string;
//   footer_back_to_top: string;

//   footer_copyright: string;

//   // Футер – контакты заголовок
//   footer_contacts_title: string;

//   // Футер – блок для клиентов и мастеров
//   footer_client_booking: string;
//   footer_client_cabinet: string;
//   footer_client_admin: string;
//   footer_client_partnership_title: string;
//   footer_client_partnership_text: string;

//   // Футер – верхний блок (текст)
//   footer_top_title: string;
//   footer_top_text: string;
//   footer_top_chip_online: string;
//   footer_top_chip_premium: string;

//   footer_quick_title: string;
//   footer_quick_text: string;
//   footer_quick_step1: string;
//   footer_quick_step2: string;
//   footer_quick_step3: string;
//   footer_quick_adv1: string;
//   footer_quick_adv2: string;

//   // Футер – соцсети (подсказки)
//   footer_socials_instagram_hint: string;
//   footer_socials_facebook_hint: string;
//   footer_socials_youtube_hint: string;

//   // Футер – мессенджеры (подписи)
//   footer_messenger_email: string;
//   footer_messenger_call: string;

//   /* ========= BOOKING / SERVICES ========= */

//   // Шаги бронирования
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_date: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;

//   // Загрузка / ошибки
//   booking_loading_text: string;
//   booking_error_loading: string;
//   booking_error_retry: string;

//   // Hero блока выбора услуги
//   booking_hero_badge: string;
//   booking_hero_title: string;
//   booking_hero_subtitle: string;

//   // Категории и карточки
//   booking_category_all: string;
//   booking_price_on_request: string;
//   booking_minutes: string;
//   booking_bar_selected_label: string;
//   booking_minutes_short: string;

//   // Кнопки / общий UI
//   booking_continue: string;
// };

// export type MessageKey = keyof BaseMessages;

// // Русская версия (базовая)
// const ruMessages: BaseMessages = {
//   // Навигация
//   nav_home: "Главная",
//   nav_services: "Услуги",
//   nav_prices: "Цены",
//   nav_contacts: "Контакты",
//   nav_news: "Новости",
//   nav_about: "О нас",
//   nav_admin: "Админ",

//   // Hero
//   hero_tagline: "Salon Elen — красота и уход в Halle",
//   hero_subtitle:
//     "Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.",
//   hero_cta_book: "Записаться",
//   hero_cta_services: "Все услуги",
//   hero_badge: "Онлайн-запись 24/7 • В центре Halle",

//   // Главная – блок «Популярные услуги»
//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   // Главная – блок «Новости и статьи»
//   home_news_title: "Новости и статьи",
//   home_news_subtitle: "Свежие обновления и полезные советы",
//   home_news_empty: "Пока нет опубликованных материалов.",

//   // Главная – нижний CTA
//   home_cta_title: "Готовы к обновлению?",
//   home_cta_text:
//     "Запишитесь онлайн и мы подберём для вас идеальный уход и стиль.",
//   home_cta_button: "Записаться",

//   // Авторизация
//   auth_login: "Войти",
//   auth_logout: "Выйти",

//   // Футер – салон
//   footer_about_section: "Салон & Локация",
//   footer_about_description:
//     "Мы создаём атмосферу расслабления и красоты, используя профессиональную косметику и современные методики ухода.",

//   footer_location_section: "Наш адрес",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "График работы",
//   footer_hours_weekdays: "Пн–Пт: 10:00 – 19:00",
//   footer_hours_saturday: "Сб: 10:00 – 16:00",
//   footer_hours_sunday: "Вс: выходной",

//   footer_navigation_section: "Навигация",

//   footer_clients_section: "Для клиентов и мастеров",

//   footer_socials_section: "Соцсети & Мессенджеры",

//   footer_privacy: "Политика конфиденциальности",
//   footer_terms: "Условия использования",
//   footer_back_to_top: "Наверх",

//   footer_copyright: "Все права защищены.",

//   footer_contacts_title: "Контакты",

//   // Футер – клиенты и мастера
//   footer_client_booking: "Онлайн-запись",
//   footer_client_cabinet: "Личный кабинет записи",
//   footer_client_admin: "Сотрудничество с мастерами",
//   footer_client_partnership_title: "Партнёрство с мастерами",
//   footer_client_partnership_text:
//     "Ищете комфортные условия работы и атмосферу, где ценят качество? Напишите нам — обсудим сотрудничество.",

//   // Футер – верхний блок
//   footer_top_title: "Ваш салон красоты с онлайн-записью и заботой о деталях",
//   footer_top_text:
//     "Профессиональные мастера, современные техники и по-настоящему тёплая атмосфера — мы помогаем чувствовать себя уверенно каждый день. Запись занимает пару минут, а эффект — надолго.",
//   footer_top_chip_online: "Онлайн-запись 24/7",
//   footer_top_chip_premium: "Премиальный подход к сервису",

//   footer_quick_title: "Записаться можно в пару кликов",
//   footer_quick_text:
//     "Онлайн-запись работает круглосуточно, а мы подтвердим ваш визит максимально быстро.",
//   footer_quick_step1: "Выберите услугу",
//   footer_quick_step2: "Выберите мастера",
//   footer_quick_step3: "Подтвердите время",
//   footer_quick_adv1: "Онлайн-запись премиум-класса",
//   footer_quick_adv2: "Удобные слоты под ваш график",

//   // Футер – соцсети
//   footer_socials_instagram_hint: "Открыть Instagram салона",
//   footer_socials_facebook_hint: "Открыть страницу в Facebook",
//   footer_socials_youtube_hint: "Открыть YouTube канал",

//   // Футер – мессенджеры
//   footer_messenger_email: "Написать на email",
//   footer_messenger_call: "Позвонить",

//   /* ========= BOOKING / SERVICES ========= */

//   booking_step_services: "Услуга",
//   booking_step_master: "Мастер",
//   booking_step_date: "Дата",
//   booking_step_client: "Данные",
//   booking_step_verify: "Проверка",
//   booking_step_payment: "Оплата",

//   booking_loading_text: "Загружаем премиальные услуги…",
//   booking_error_loading: "Не удалось загрузить услуги",
//   booking_error_retry: "Попробовать снова",

//   booking_hero_badge: "Premium Beauty Menu",
//   booking_hero_title: "Выберите услугу",
//   booking_hero_subtitle:
//     "Создайте свой уникальный образ с нашими эксклюзивными премиум-услугами",

//   booking_category_all: "Все",
//   booking_price_on_request: "По запросу",
//   booking_minutes: "минут",
//   booking_bar_selected_label: "Выбрано услуг",
//   booking_minutes_short: "мин",

//   booking_continue: "Продолжить",
// };

// // Все локали
// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,

//   de: {
//     // Навигация
//     nav_home: "Startseite",
//     nav_services: "Leistungen",
//     nav_prices: "Preise",
//     nav_contacts: "Kontakt",
//     nav_news: "Neuigkeiten",
//     nav_about: "Über uns",
//     nav_admin: "Admin",

//     // Hero
//     hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//     hero_subtitle:
//       "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//     hero_cta_book: "Termin buchen",
//     hero_cta_services: "Alle Leistungen",
//     hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

//     // Главная – блок «Популярные услуги»
//     home_services_title: "Beliebte Leistungen",
//     home_services_subtitle: "Was wir besonders gut können",
//     home_services_card1_title: "Damenhaarschnitt",
//     home_services_card1_text:
//       "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
//     home_services_card2_title: "Maniküre",
//     home_services_card2_text:
//       "Ästhetik, Hygiene und langanhaltende Beschichtung.",
//     home_services_card3_title: "Make-up",
//     home_services_card3_text:
//       "Wir kreieren ein passendes Make-up für jeden Anlass.",

//     // Главная – блок «Новости и статьи»
//     home_news_title: "News & Artikel",
//     home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//     home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//     // Главная – нижний CTA
//     home_cta_title: "Bereit für eine Veränderung?",
//     home_cta_text:
//       "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//     home_cta_button: "Termin buchen",

//     // Авторизация
//     auth_login: "Anmelden",
//     auth_logout: "Abmelden",

//     // Футер – салон
//     footer_about_section: "Salon & Standort",
//     footer_about_description:
//       "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

//     footer_location_section: "Unsere Adresse",
//     footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//     footer_hours_label: "Öffnungszeiten",
//     footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
//     footer_hours_saturday: "Sa: 10:00 – 16:00",
//     footer_hours_sunday: "So: geschlossen",

//     footer_navigation_section: "Navigation",

//     footer_clients_section: "Für Kunden und Stylisten",

//     footer_socials_section: "Soziale Netzwerke & Messenger",

//     footer_privacy: "Datenschutz",
//     footer_terms: "Nutzungsbedingungen",
//     footer_back_to_top: "Nach oben",

//     footer_copyright: "Alle Rechte vorbehalten.",

//     footer_contacts_title: "Kontaktdaten",

//     footer_client_booking: "Online-Termin",
//     footer_client_cabinet: "Kundenbereich für Buchungen",
//     footer_client_admin: "Kooperation mit Stylisten",
//     footer_client_partnership_title: "Partnerschaft mit Stylisten",
//     footer_client_partnership_text:
//       "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

//     footer_top_title:
//       "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
//     footer_top_text:
//       "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
//     footer_top_chip_online: "Online-Termin 24/7",
//     footer_top_chip_premium: "Premium-Service",

//     footer_quick_title: "In wenigen Klicks zum Termin",
//     footer_quick_text:
//       "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
//     footer_quick_step1: "Leistung wählen",
//     footer_quick_step2: "Stylisten wählen",
//     footer_quick_step3: "Uhrzeit bestätigen",
//     footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
//     footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

//     footer_socials_instagram_hint: "Instagram des Salons öffnen",
//     footer_socials_facebook_hint: "Facebook-Seite öffnen",
//     footer_socials_youtube_hint: "YouTube-Kanal öffnen",

//     footer_messenger_email: "E-Mail schreiben",
//     footer_messenger_call: "Anrufen",

//     /* ========= BOOKING / SERVICES ========= */

//     booking_step_services: "Leistung",
//     booking_step_master: "Stylist",
//     booking_step_date: "Datum",
//     booking_step_client: "Daten",
//     booking_step_verify: "Prüfen",
//     booking_step_payment: "Zahlung",

//     booking_loading_text: "Premium-Leistungen werden geladen…",
//     booking_error_loading: "Leistungen konnten nicht geladen werden",
//     booking_error_retry: "Erneut versuchen",

//     booking_hero_badge: "Premium Beauty Menu",
//     booking_hero_title: "Wählen Sie eine Leistung",
//     booking_hero_subtitle:
//       "Kreieren Sie Ihren individuellen Look mit unseren exklusiven Premium-Behandlungen",

//     booking_category_all: "Alle",
//     booking_price_on_request: "Auf Anfrage",
//     booking_minutes: "Minuten",
//     booking_bar_selected_label: "Ausgewählte Leistungen",
//     booking_minutes_short: "Min",

//     booking_continue: "Weiter",
//   },

//   en: {
//     // Навигация
//     nav_home: "Home",
//     nav_services: "Services",
//     nav_prices: "Prices",
//     nav_contacts: "Contacts",
//     nav_news: "News",
//     nav_about: "About us",
//     nav_admin: "Admin",

//     // Hero
//     hero_tagline: "Salon Elen – beauty and care in Halle",
//     hero_subtitle:
//       "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//     hero_cta_book: "Book now",
//     hero_cta_services: "All services",
//     hero_badge: "Online booking 24/7 • In the center of Halle",

//     // Главная – блок «Популярные услуги»
//     home_services_title: "Popular services",
//     home_services_subtitle: "What we do best",
//     home_services_card1_title: "Women’s haircut",
//     home_services_card1_text: "We highlight your style and individuality.",
//     home_services_card2_title: "Manicure",
//     home_services_card2_text:
//       "Aesthetics, hygiene and long-lasting coating.",
//     home_services_card3_title: "Make-up",
//     home_services_card3_text:
//       "We create the right look for any occasion.",

//     // Главная – блок «Новости и статьи»
//     home_news_title: "News & articles",
//     home_news_subtitle: "Fresh updates and useful tips",
//     home_news_empty: "No posts have been published yet.",

//     // Главная – нижний CTA
//     home_cta_title: "Ready for a change?",
//     home_cta_text:
//       "Book your appointment online – we’ll find the perfect care and style for you.",
//     home_cta_button: "Book now",

//     // Авторизация
//     auth_login: "Sign in",
//     auth_logout: "Sign out",

//     // Футер – салон
//     footer_about_section: "Salon & Location",
//     footer_about_description:
//       "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

//     footer_location_section: "Our address",
//     footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//     footer_hours_label: "Opening hours",
//     footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
//     footer_hours_saturday: "Sat: 10:00 – 16:00",
//     footer_hours_sunday: "Sun: closed",

//     footer_navigation_section: "Navigation",

//     footer_clients_section: "For clients and stylists",

//     footer_socials_section: "Social Media & Messengers",

//     footer_privacy: "Privacy Policy",
//     footer_terms: "Terms of Use",
//     footer_back_to_top: "Back to top",

//     footer_copyright: "All rights reserved.",

//     footer_contacts_title: "Contacts",

//     footer_client_booking: "Online booking",
//     footer_client_cabinet: "Client booking account",
//     footer_client_admin: "Stylist cooperation",
//     footer_client_partnership_title: "Partnership with stylists",
//     footer_client_partnership_text:
//       "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we’ll discuss cooperation.",

//     footer_top_title:
//       "Your beauty salon with online booking and attention to detail",
//     footer_top_text:
//       "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
//     footer_top_chip_online: "Online booking 24/7",
//     footer_top_chip_premium: "Premium service",

//     footer_quick_title: "Book your visit in a few clicks",
//     footer_quick_text:
//       "Online booking is available 24/7 – we’ll confirm your appointment as quickly as possible.",
//     footer_quick_step1: "Choose a service",
//     footer_quick_step2: "Choose a stylist",
//     footer_quick_step3: "Confirm the time",
//     footer_quick_adv1: "Premium-level online booking",
//     footer_quick_adv2: "Convenient time slots for your schedule",

//     footer_socials_instagram_hint: "Open the salon’s Instagram",
//     footer_socials_facebook_hint: "Open the Facebook page",
//     footer_socials_youtube_hint: "Open the YouTube channel",

//     footer_messenger_email: "Send an email",
//     footer_messenger_call: "Call us",

//     /* ========= BOOKING / SERVICES ========= */

//     booking_step_services: "Service",
//     booking_step_master: "Stylist",
//     booking_step_date: "Date",
//     booking_step_client: "Details",
//     booking_step_verify: "Review",
//     booking_step_payment: "Payment",

//     booking_loading_text: "Loading premium services…",
//     booking_error_loading: "Failed to load services",
//     booking_error_retry: "Try again",

//     booking_hero_badge: "Premium Beauty Menu",
//     booking_hero_title: "Choose a service",
//     booking_hero_subtitle:
//       "Create your unique look with our exclusive premium services",

//     booking_category_all: "All",
//     booking_price_on_request: "On request",
//     booking_minutes: "minutes",
//     booking_bar_selected_label: "Selected services",
//     booking_minutes_short: "min",

//     booking_continue: "Continue",
//   },
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key];
// }






// import type { Locale } from "./locales";

// // Все текстовые ключи проекта
// export type BaseMessages = {
//   // Навигация
//   nav_home: string;
//   nav_services: string;
//   nav_prices: string;
//   nav_contacts: string;
//   nav_news: string;
//   nav_about: string;
//   nav_admin: string;

//   // Hero
//   hero_tagline: string;
//   hero_subtitle: string;
//   hero_cta_book: string;
//   hero_cta_services: string;
//   hero_badge: string;

//   // Главная – блок «Популярные услуги»
//   home_services_title: string;
//   home_services_subtitle: string;
//   home_services_card1_title: string;
//   home_services_card1_text: string;
//   home_services_card2_title: string;
//   home_services_card2_text: string;
//   home_services_card3_title: string;
//   home_services_card3_text: string;

//   // Главная – блок «Новости и статьи»
//   home_news_title: string;
//   home_news_subtitle: string;
//   home_news_empty: string;

//   // Главная – нижний CTA
//   home_cta_title: string;
//   home_cta_text: string;
//   home_cta_button: string;

//   // Авторизация
//   auth_login: string;
//   auth_logout: string;

//   // Футер – общий блок салона
//   footer_about_section: string;
//   footer_about_description: string;

//   footer_location_section: string;
//   footer_address_label: string;

//   footer_hours_label: string;
//   footer_hours_weekdays: string;
//   footer_hours_saturday: string;
//   footer_hours_sunday: string;

//   footer_navigation_section: string;

//   footer_clients_section: string;

//   footer_socials_section: string;

//   footer_privacy: string;
//   footer_terms: string;
//   footer_back_to_top: string;

//   footer_copyright: string;

//   // Футер – контакты заголовок
//   footer_contacts_title: string;

//   // Футер – блок для клиентов и мастеров
//   footer_client_booking: string;
//   footer_client_cabinet: string;
//   footer_client_admin: string;
//   footer_client_partnership_title: string;
//   footer_client_partnership_text: string;

//   // Футер – верхний блок (текст)
//   footer_top_title: string;
//   footer_top_text: string;
//   footer_top_chip_online: string;
//   footer_top_chip_premium: string;

//   footer_quick_title: string;
//   footer_quick_text: string;
//   footer_quick_step1: string;
//   footer_quick_step2: string;
//   footer_quick_step3: string;
//   footer_quick_adv1: string;
//   footer_quick_adv2: string;

//   // Футер – соцсети (подсказки)
//   footer_socials_instagram_hint: string;
//   footer_socials_facebook_hint: string;
//   footer_socials_youtube_hint: string;

//   // Футер – мессенджеры (подписи)
//   footer_messenger_email: string;
//   footer_messenger_call: string;

//   /* ========= BOOKING / SERVICES ========= */

//   // Шаги бронирования
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_date: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;

//   // Загрузка / ошибки
//   booking_loading_text: string;
//   booking_error_loading: string;
//   booking_error_retry: string;

//   // Hero блока выбора услуги
//   booking_hero_badge: string;
//   booking_hero_title: string;
//   booking_hero_subtitle: string;

//   // Категории и карточки
//   booking_category_all: string;
//   booking_price_on_request: string;
//   booking_minutes: string;
//   booking_bar_selected_label: string;
//   booking_minutes_short: string;
// };

// export type MessageKey = keyof BaseMessages;

// // Русская версия (базовая)
// const ruMessages: BaseMessages = {
//   // Навигация
//   nav_home: "Главная",
//   nav_services: "Услуги",
//   nav_prices: "Цены",
//   nav_contacts: "Контакты",
//   nav_news: "Новости",
//   nav_about: "О нас",
//   nav_admin: "Админ",

//   // Hero
//   hero_tagline: "Salon Elen — красота и уход в Halle",
//   hero_subtitle:
//     "Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.",
//   hero_cta_book: "Записаться",
//   hero_cta_services: "Все услуги",
//   hero_badge: "Онлайн-запись 24/7 • В центре Halle",

//   // Главная – блок «Популярные услуги»
//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   // Главная – блок «Новости и статьи»
//   home_news_title: "Новости и статьи",
//   home_news_subtitle: "Свежие обновления и полезные советы",
//   home_news_empty: "Пока нет опубликованных материалов.",

//   // Главная – нижний CTA
//   home_cta_title: "Готовы к обновлению?",
//   home_cta_text:
//     "Запишитесь онлайн и мы подберём для вас идеальный уход и стиль.",
//   home_cta_button: "Записаться",

//   // Авторизация
//   auth_login: "Войти",
//   auth_logout: "Выйти",

//   // Футер – салон
//   footer_about_section: "Салон & Локация",
//   footer_about_description:
//     "Мы создаём атмосферу расслабления и красоты, используя профессиональную косметику и современные методики ухода.",

//   footer_location_section: "Наш адрес",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "График работы",
//   footer_hours_weekdays: "Пн–Пт: 10:00 – 19:00",
//   footer_hours_saturday: "Сб: 10:00 – 16:00",
//   footer_hours_sunday: "Вс: выходной",

//   footer_navigation_section: "Навигация",

//   footer_clients_section: "Для клиентов и мастеров",

//   footer_socials_section: "Соцсети & Мессенджеры",

//   footer_privacy: "Политика конфиденциальности",
//   footer_terms: "Условия использования",
//   footer_back_to_top: "Наверх",

//   footer_copyright: "Все права защищены.",

//   footer_contacts_title: "Контакты",

//   // Футер – клиенты и мастера
//   footer_client_booking: "Онлайн-запись",
//   footer_client_cabinet: "Личный кабинет записи",
//   footer_client_admin: "Сотрудничество с мастерами",
//   footer_client_partnership_title: "Партнёрство с мастерами",
//   footer_client_partnership_text:
//     "Ищете комфортные условия работы и атмосферу, где ценят качество? Напишите нам — обсудим сотрудничество.",

//   // Футер – верхний блок
//   footer_top_title: "Ваш салон красоты с онлайн-записью и заботой о деталях",
//   footer_top_text:
//     "Профессиональные мастера, современные техники и по-настоящему тёплая атмосфера — мы помогаем чувствовать себя уверенно каждый день. Запись занимает пару минут, а эффект — надолго.",
//   footer_top_chip_online: "Онлайн-запись 24/7",
//   footer_top_chip_premium: "Премиальный подход к сервису",

//   footer_quick_title: "Записаться можно в пару кликов",
//   footer_quick_text:
//     "Онлайн-запись работает круглосуточно, а мы подтвердим ваш визит максимально быстро.",
//   footer_quick_step1: "Выберите услугу",
//   footer_quick_step2: "Выберите мастера",
//   footer_quick_step3: "Подтвердите время",
//   footer_quick_adv1: "Онлайн-запись премиум-класса",
//   footer_quick_adv2: "Удобные слоты под ваш график",

//   // Футер – соцсети
//   footer_socials_instagram_hint: "Открыть Instagram салона",
//   footer_socials_facebook_hint: "Открыть страницу в Facebook",
//   footer_socials_youtube_hint: "Открыть YouTube канал",

//   // Футер – мессенджеры
//   footer_messenger_email: "Написать на email",
//   footer_messenger_call: "Позвонить",

//   /* ========= BOOKING / SERVICES ========= */

//   booking_step_services: "Услуга",
//   booking_step_master: "Мастер",
//   booking_step_date: "Дата",
//   booking_step_client: "Данные",
//   booking_step_verify: "Проверка",
//   booking_step_payment: "Оплата",

//   booking_loading_text: "Загружаем премиальные услуги…",
//   booking_error_loading: "Не удалось загрузить услуги",
//   booking_error_retry: "Попробовать снова",

//   booking_hero_badge: "Premium Beauty Menu",
//   booking_hero_title: "Выберите услугу",
//   booking_hero_subtitle:
//     "Создайте свой уникальный образ с нашими эксклюзивными премиум-услугами",

//   booking_category_all: "Все",
//   booking_price_on_request: "По запросу",
//   booking_minutes: "минут",
//   booking_bar_selected_label: "Выбрано услуг",
//   booking_minutes_short: "мин",
  
// };

// // Все локали
// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,

//   de: {
//     // Навигация
//     nav_home: "Startseite",
//     nav_services: "Leistungen",
//     nav_prices: "Preise",
//     nav_contacts: "Kontakt",
//     nav_news: "Neuigkeiten",
//     nav_about: "Über uns",
//     nav_admin: "Admin",

//     // Hero
//     hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//     hero_subtitle:
//       "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//     hero_cta_book: "Termin buchen",
//     hero_cta_services: "Alle Leistungen",
//     hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

//     // Главная – блок «Популярные услуги»
//     home_services_title: "Beliebte Leistungen",
//     home_services_subtitle: "Was wir besonders gut können",
//     home_services_card1_title: "Damenhaarschnitt",
//     home_services_card1_text:
//       "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
//     home_services_card2_title: "Maniküre",
//     home_services_card2_text:
//       "Ästhetik, Hygiene und langanhaltende Beschichtung.",
//     home_services_card3_title: "Make-up",
//     home_services_card3_text:
//       "Wir kreieren ein passendes Make-up für jeden Anlass.",

//     // Главная – блок «Новости и статьи»
//     home_news_title: "News & Artikel",
//     home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//     home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//     // Главная – нижний CTA
//     home_cta_title: "Bereit für eine Veränderung?",
//     home_cta_text:
//       "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//     home_cta_button: "Termin buchen",

//     // Авторизация
//     auth_login: "Anmelden",
//     auth_logout: "Abmelden",

//     // Футер – салон
//     footer_about_section: "Salon & Standort",
//     footer_about_description:
//       "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

//     footer_location_section: "Unsere Adresse",
//     footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//     footer_hours_label: "Öffnungszeiten",
//     footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
//     footer_hours_saturday: "Sa: 10:00 – 16:00",
//     footer_hours_sunday: "So: geschlossen",

//     footer_navigation_section: "Navigation",

//     footer_clients_section: "Für Kunden und Stylisten",

//     footer_socials_section: "Soziale Netzwerke & Messenger",

//     footer_privacy: "Datenschutz",
//     footer_terms: "Nutzungsbedingungen",
//     footer_back_to_top: "Nach oben",

//     footer_copyright: "Alle Rechte vorbehalten.",

//     footer_contacts_title: "Kontaktdaten",

//     footer_client_booking: "Online-Termin",
//     footer_client_cabinet: "Kundenbereich für Buchungen",
//     footer_client_admin: "Kooperation mit Stylisten",
//     footer_client_partnership_title: "Partnerschaft mit Stylisten",
//     footer_client_partnership_text:
//       "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

//     footer_top_title:
//       "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
//     footer_top_text:
//       "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
//     footer_top_chip_online: "Online-Termin 24/7",
//     footer_top_chip_premium: "Premium-Service",

//     footer_quick_title: "In wenigen Klicks zum Termin",
//     footer_quick_text:
//       "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
//     footer_quick_step1: "Leistung wählen",
//     footer_quick_step2: "Stylisten wählen",
//     footer_quick_step3: "Uhrzeit bestätigen",
//     footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
//     footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

//     footer_socials_instagram_hint: "Instagram des Salons öffnen",
//     footer_socials_facebook_hint: "Facebook-Seite öffnen",
//     footer_socials_youtube_hint: "YouTube-Kanal öffnen",

//     footer_messenger_email: "E-Mail schreiben",
//     footer_messenger_call: "Anrufen",

//     /* ========= BOOKING / SERVICES ========= */

//     booking_step_services: "Leistung",
//     booking_step_master: "Stylist",
//     booking_step_date: "Datum",
//     booking_step_client: "Daten",
//     booking_step_verify: "Prüfen",
//     booking_step_payment: "Zahlung",

//     booking_loading_text: "Premium-Leistungen werden geladen…",
//     booking_error_loading: "Leistungen konnten nicht geladen werden",
//     booking_error_retry: "Erneut versuchen",

//     booking_hero_badge: "Premium Beauty Menu",
//     booking_hero_title: "Wählen Sie eine Leistung",
//     booking_hero_subtitle:
//       "Kreieren Sie Ihren individuellen Look mit unseren exklusiven Premium-Behandlungen",

//     booking_category_all: "Alle",
//     booking_price_on_request: "Auf Anfrage",
//     booking_minutes: "Minuten",
//     booking_bar_selected_label: "Ausgewählte Leistungen",
//     booking_minutes_short: "Min",
//   },

//   en: {
//     // Навигация
//     nav_home: "Home",
//     nav_services: "Services",
//     nav_prices: "Prices",
//     nav_contacts: "Contacts",
//     nav_news: "News",
//     nav_about: "About us",
//     nav_admin: "Admin",

//     // Hero
//     hero_tagline: "Salon Elen – beauty and care in Halle",
//     hero_subtitle:
//       "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//     hero_cta_book: "Book now",
//     hero_cta_services: "All services",
//     hero_badge: "Online booking 24/7 • In the center of Halle",

//     // Главная – блок «Популярные услуги»
//     home_services_title: "Popular services",
//     home_services_subtitle: "What we do best",
//     home_services_card1_title: "Women’s haircut",
//     home_services_card1_text: "We highlight your style and individuality.",
//     home_services_card2_title: "Manicure",
//     home_services_card2_text:
//       "Aesthetics, hygiene and long-lasting coating.",
//     home_services_card3_title: "Make-up",
//     home_services_card3_text:
//       "We create the right look for any occasion.",

//     // Главная – блок «Новости и статьи»
//     home_news_title: "News & articles",
//     home_news_subtitle: "Fresh updates and useful tips",
//     home_news_empty: "No posts have been published yet.",

//     // Главная – нижний CTA
//     home_cta_title: "Ready for a change?",
//     home_cta_text:
//       "Book your appointment online – we’ll find the perfect care and style for you.",
//     home_cta_button: "Book now",

//     // Авторизация
//     auth_login: "Sign in",
//     auth_logout: "Sign out",

//     // Футер – салон
//     footer_about_section: "Salon & Location",
//     footer_about_description:
//       "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

//     footer_location_section: "Our address",
//     footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//     footer_hours_label: "Opening hours",
//     footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
//     footer_hours_saturday: "Sat: 10:00 – 16:00",
//     footer_hours_sunday: "Sun: closed",

//     footer_navigation_section: "Navigation",

//     footer_clients_section: "For clients and stylists",

//     footer_socials_section: "Social Media & Messengers",

//     footer_privacy: "Privacy Policy",
//     footer_terms: "Terms of Use",
//     footer_back_to_top: "Back to top",

//     footer_copyright: "All rights reserved.",

//     footer_contacts_title: "Contacts",

//     footer_client_booking: "Online booking",
//     footer_client_cabinet: "Client booking account",
//     footer_client_admin: "Stylist cooperation",
//     footer_client_partnership_title: "Partnership with stylists",
//     footer_client_partnership_text:
//       "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we’ll discuss cooperation.",

//     footer_top_title:
//       "Your beauty salon with online booking and attention to detail",
//     footer_top_text:
//       "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
//     footer_top_chip_online: "Online booking 24/7",
//     footer_top_chip_premium: "Premium service",

//     footer_quick_title: "Book your visit in a few clicks",
//     footer_quick_text:
//       "Online booking is available 24/7 – we’ll confirm your appointment as quickly as possible.",
//     footer_quick_step1: "Choose a service",
//     footer_quick_step2: "Choose a stylist",
//     footer_quick_step3: "Confirm the time",
//     footer_quick_adv1: "Premium-level online booking",
//     footer_quick_adv2: "Convenient time slots for your schedule",

//     footer_socials_instagram_hint: "Open the salon’s Instagram",
//     footer_socials_facebook_hint: "Open the Facebook page",
//     footer_socials_youtube_hint: "Open the YouTube channel",

//     footer_messenger_email: "Send an email",
//     footer_messenger_call: "Call us",

//     /* ========= BOOKING / SERVICES ========= */

//     booking_step_services: "Service",
//     booking_step_master: "Stylist",
//     booking_step_date: "Date",
//     booking_step_client: "Details",
//     booking_step_verify: "Review",
//     booking_step_payment: "Payment",

//     booking_loading_text: "Loading premium services…",
//     booking_error_loading: "Failed to load services",
//     booking_error_retry: "Try again",

//     booking_hero_badge: "Premium Beauty Menu",
//     booking_hero_title: "Choose a service",
//     booking_hero_subtitle:
//       "Create your unique look with our exclusive premium services",

//     booking_category_all: "All",
//     booking_price_on_request: "On request",
//     booking_minutes: "minutes",
//     booking_bar_selected_label: "Selected services",
//     booking_minutes_short: "min",
//   },
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key];
// }





// // src/i18n/messages.ts
// import type { Locale } from "./locales";

// // Все текстовые ключи проекта
// export type BaseMessages = {
//   // Навигация
//   nav_home: string;
//   nav_services: string;
//   nav_prices: string;
//   nav_contacts: string;
//   nav_news: string;
//   nav_about: string;
//   nav_admin: string;

//   // Hero
//   hero_tagline: string;
//   hero_subtitle: string;
//   hero_cta_book: string;
//   hero_cta_services: string;
//   hero_badge: string;

//   // Главная – блок «Популярные услуги»
//   home_services_title: string;
//   home_services_subtitle: string;
//   home_services_card1_title: string;
//   home_services_card1_text: string;
//   home_services_card2_title: string;
//   home_services_card2_text: string;
//   home_services_card3_title: string;
//   home_services_card3_text: string;

//   // Главная – блок «Новости и статьи»
//   home_news_title: string;
//   home_news_subtitle: string;
//   home_news_empty: string;

//   // Главная – нижний CTA
//   home_cta_title: string;
//   home_cta_text: string;
//   home_cta_button: string;

//   // Авторизация
//   auth_login: string;
//   auth_logout: string;

//   // Booking – шаги
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_calendar: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;

//   // Booking – общие тексты (можно использовать на других шагах)
//   booking_title: string;
//   booking_subtitle: string;
//   booking_next: string;
//   booking_back: string;
//   booking_confirm: string;
//   booking_cancel: string;

//   // Booking – выбор услуг
//   booking_services_loading: string;
//   booking_services_error_message: string;
//   booking_services_error_retry: string;
//   booking_services_hero_badge: string;
//   booking_services_hero_title: string;
//   booking_services_hero_subtitle: string;
//   booking_services_category_all: string;
//   booking_services_price_on_request: string;
//   booking_services_duration_full: string;
//   booking_services_duration_short: string;
//   booking_services_selected_label: string;
//   booking_services_cta_continue: string;

//   // Футер – общий блок салона
//   footer_about_section: string;
//   footer_about_description: string;

//   footer_location_section: string;
//   footer_address_label: string;

//   footer_hours_label: string;
//   footer_hours_weekdays: string;
//   footer_hours_saturday: string;
//   footer_hours_sunday: string;

//   footer_navigation_section: string;

//   footer_clients_section: string;

//   footer_socials_section: string;

//   footer_privacy: string;
//   footer_terms: string;
//   footer_back_to_top: string;

//   footer_copyright: string;

//   // Футер – контакты заголовок
//   footer_contacts_title: string;

//   // Футер – блок для клиентов и мастеров
//   footer_client_booking: string;
//   footer_client_cabinet: string;
//   footer_client_admin: string;
//   footer_client_partnership_title: string;
//   footer_client_partnership_text: string;

//   // Футер – верхний блок (текст)
//   footer_top_title: string;
//   footer_top_text: string;
//   footer_top_chip_online: string;
//   footer_top_chip_premium: string;

//   footer_quick_title: string;
//   footer_quick_text: string;
//   footer_quick_step1: string;
//   footer_quick_step2: string;
//   footer_quick_step3: string;
//   footer_quick_adv1: string;
//   footer_quick_adv2: string;

//   // Футер – соцсети (подсказки)
//   footer_socials_instagram_hint: string;
//   footer_socials_facebook_hint: string;
//   footer_socials_youtube_hint: string;

//   // Футер – мессенджеры (подписи)
//   footer_messenger_email: string;
//   footer_messenger_call: string;
// };

// export type MessageKey = keyof BaseMessages;

// // Русская версия (базовая)
// const ruMessages: BaseMessages = {
//   // Навигация
//   nav_home: "Главная",
//   nav_services: "Услуги",
//   nav_prices: "Цены",
//   nav_contacts: "Контакты",
//   nav_news: "Новости",
//   nav_about: "О нас",
//   nav_admin: "Админ",

//   // Hero
//   hero_tagline: "Salon Elen — красота и уход в Halle",
//   hero_subtitle:
//     "Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.",
//   hero_cta_book: "Записаться",
//   hero_cta_services: "Все услуги",
//   hero_badge: "Онлайн-запись 24/7 • В центре Halle",

//   // Главная – блок «Популярные услуги»
//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   // Главная – блок «Новости и статьи»
//   home_news_title: "Новости и статьи",
//   home_news_subtitle: "Свежие обновления и полезные советы",
//   home_news_empty: "Пока нет опубликованных материалов.",

//   // Главная – нижний CTA
//   home_cta_title: "Готовы к обновлению?",
//   home_cta_text:
//     "Запишитесь онлайн и мы подберём для вас идеальный уход и стиль.",
//   home_cta_button: "Записаться",

//   // Авторизация
//   auth_login: "Войти",
//   auth_logout: "Выйти",

//   // Booking – шаги
//   booking_step_services: "Услуга",
//   booking_step_master: "Мастер",
//   booking_step_calendar: "Дата",
//   booking_step_client: "Данные",
//   booking_step_verify: "Проверка",
//   booking_step_payment: "Оплата",

//   // Booking – общие тексты
//   booking_title: "Онлайн-запись",
//   booking_subtitle:
//     "Выберите услугу, удобное время и мастера — всё в пару кликов.",
//   booking_next: "Далее",
//   booking_back: "Назад",
//   booking_confirm: "Подтвердить",
//   booking_cancel: "Отменить",

//   // Booking – выбор услуг
//   booking_services_loading: "Загружаем премиальные услуги…",
//   booking_services_error_message: "Не удалось загрузить услуги",
//   booking_services_error_retry: "Попробовать снова",
//   booking_services_hero_badge: "Premium Beauty Menu",
//   booking_services_hero_title: "Выберите услугу",
//   booking_services_hero_subtitle:
//     "Создайте свой уникальный образ с нашими эксклюзивными премиум-услугами.",
//   booking_services_category_all: "Все",
//   booking_services_price_on_request: "По запросу",
//   booking_services_duration_full: "минут",
//   booking_services_duration_short: "мин",
//   booking_services_selected_label: "Выбрано услуг:",
//   booking_services_cta_continue: "Продолжить",

//   // Футер – салон
//   footer_about_section: "Салон & Локация",
//   footer_about_description:
//     "Мы создаём атмосферу расслабления и красоты, используя профессиональную косметику и современные методики ухода.",

//   footer_location_section: "Наш адрес",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "График работы",
//   footer_hours_weekdays: "Пн–Пт: 10:00 – 19:00",
//   footer_hours_saturday: "Сб: 10:00 – 16:00",
//   footer_hours_sunday: "Вс: выходной",

//   footer_navigation_section: "Навигация",

//   footer_clients_section: "Для клиентов и мастеров",

//   footer_socials_section: "Соцсети & Мессенджеры",

//   footer_privacy: "Политика конфиденциальности",
//   footer_terms: "Условия использования",
//   footer_back_to_top: "Наверх",

//   footer_copyright: "Все права защищены.",

//   footer_contacts_title: "Контакты",

//   // Футер – клиенты и мастера
//   footer_client_booking: "Онлайн-запись",
//   footer_client_cabinet: "Личный кабинет записи",
//   footer_client_admin: "Сотрудничество с мастерами",
//   footer_client_partnership_title: "Партнёрство с мастерами",
//   footer_client_partnership_text:
//     "Ищете комфортные условия работы и атмосферу, где ценят качество? Напишите нам — обсудим сотрудничество.",

//   // Футер – верхний блок
//   footer_top_title: "Ваш салон красоты с онлайн-записью и заботой о деталях",
//   footer_top_text:
//     "Профессиональные мастера, современные техники и по-настоящему тёплая атмосфера — мы помогаем чувствовать себя уверенно каждый день. Запись занимает пару минут, а эффект — надолго.",
//   footer_top_chip_online: "Онлайн-запись 24/7",
//   footer_top_chip_premium: "Премиальный подход к сервису",

//   footer_quick_title: "Записаться можно в пару кликов",
//   footer_quick_text:
//     "Онлайн-запись работает круглосуточно, а мы подтвердим ваш визит максимально быстро.",
//   footer_quick_step1: "Выберите услугу",
//   footer_quick_step2: "Выберите мастера",
//   footer_quick_step3: "Подтвердите время",
//   footer_quick_adv1: "Онлайн-запись премиум-класса",
//   footer_quick_adv2: "Удобные слоты под ваш график",

//   // Футер – соцсети
//   footer_socials_instagram_hint: "Открыть Instagram салона",
//   footer_socials_facebook_hint: "Открыть страницу в Facebook",
//   footer_socials_youtube_hint: "Открыть YouTube канал",

//   // Футер – мессенджеры
//   footer_messenger_email: "Написать на email",
//   footer_messenger_call: "Позвонить",
// };

// // Все локали
// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,

//   de: {
//     // Навигация
//     nav_home: "Startseite",
//     nav_services: "Leistungen",
//     nav_prices: "Preise",
//     nav_contacts: "Kontakt",
//     nav_news: "Neuigkeiten",
//     nav_about: "Über uns",
//     nav_admin: "Admin",

//     // Hero
//     hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//     hero_subtitle:
//       "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//     hero_cta_book: "Termin buchen",
//     hero_cta_services: "Alle Leistungen",
//     hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

//     // Главная – блок «Популярные услуги»
//     home_services_title: "Beliebte Leistungen",
//     home_services_subtitle: "Was wir besonders gut können",
//     home_services_card1_title: "Damenhaarschnitt",
//     home_services_card1_text:
//       "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
//     home_services_card2_title: "Maniküre",
//     home_services_card2_text:
//       "Ästhetik, Hygiene und langanhaltende Beschichtung.",
//     home_services_card3_title: "Make-up",
//     home_services_card3_text:
//       "Wir kreieren ein passendes Make-up für jeden Anlass.",

//     // Главная – блок «Новости и статьи»
//     home_news_title: "News & Artikel",
//     home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//     home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//     // Главная – нижний CTA
//     home_cta_title: "Bereit für eine Veränderung?",
//     home_cta_text:
//       "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//     home_cta_button: "Termin buchen",

//     // Авторизация
//     auth_login: "Anmelden",
//     auth_logout: "Abmelden",

//     // Booking – шаги
//     booking_step_services: "Leistung",
//     booking_step_master: "Stylist",
//     booking_step_calendar: "Datum",
//     booking_step_client: "Daten",
//     booking_step_verify: "Prüfung",
//     booking_step_payment: "Zahlung",

//     // Booking – общие тексты
//     booking_title: "Online-Termin",
//     booking_subtitle:
//       "Wählen Sie Leistung, Uhrzeit und Stylisten – in nur wenigen Klicks.",
//     booking_next: "Weiter",
//     booking_back: "Zurück",
//     booking_confirm: "Bestätigen",
//     booking_cancel: "Abbrechen",

//     // Booking – выбор услуг
//     booking_services_loading: "Premium-Leistungen werden geladen…",
//     booking_services_error_message:
//       "Leistungen konnten nicht geladen werden",
//     booking_services_error_retry: "Erneut versuchen",
//     booking_services_hero_badge: "Premium Beauty Menü",
//     booking_services_hero_title: "Leistung wählen",
//     booking_services_hero_subtitle:
//       "Kreieren Sie Ihren persönlichen Look mit unseren exklusiven Premium-Behandlungen.",
//     booking_services_category_all: "Alle",
//     booking_services_price_on_request: "Auf Anfrage",
//     booking_services_duration_full: "Minuten",
//     booking_services_duration_short: "Min",
//     booking_services_selected_label: "Ausgewählte Leistungen:",
//     booking_services_cta_continue: "Weiter",

//     // Футер – салон
//     footer_about_section: "Salon & Standort",
//     footer_about_description:
//       "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

//     footer_location_section: "Unsere Adresse",
//     footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//     footer_hours_label: "Öffnungszeiten",
//     footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
//     footer_hours_saturday: "Sa: 10:00 – 16:00",
//     footer_hours_sunday: "So: geschlossen",

//     footer_navigation_section: "Navigation",

//     footer_clients_section: "Für Kunden und Stylisten",

//     footer_socials_section: "Soziale Netzwerke & Messenger",

//     footer_privacy: "Datenschutz",
//     footer_terms: "Nutzungsbedingungen",
//     footer_back_to_top: "Nach oben",

//     footer_copyright: "Alle Rechte vorbehalten.",

//     footer_contacts_title: "Kontaktdaten",

//     footer_client_booking: "Online-Termin",
//     footer_client_cabinet: "Kundenbereich für Buchungen",
//     footer_client_admin: "Kooperation mit Stylisten",
//     footer_client_partnership_title: "Partnerschaft mit Stylisten",
//     footer_client_partnership_text:
//       "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

//     footer_top_title:
//       "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
//     footer_top_text:
//       "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
//     footer_top_chip_online: "Online-Termin 24/7",
//     footer_top_chip_premium: "Premium-Service",

//     footer_quick_title: "In wenigen Klicks zum Termin",
//     footer_quick_text:
//       "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
//     footer_quick_step1: "Leistung wählen",
//     footer_quick_step2: "Stylisten wählen",
//     footer_quick_step3: "Uhrzeit bestätigen",
//     footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
//     footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

//     footer_socials_instagram_hint: "Instagram des Salons öffnen",
//     footer_socials_facebook_hint: "Facebook-Seite öffnen",
//     footer_socials_youtube_hint: "YouTube-Kanal öffnen",

//     footer_messenger_email: "E-Mail schreiben",
//     footer_messenger_call: "Anrufen",
//   },

//   en: {
//     // Навигация
//     nav_home: "Home",
//     nav_services: "Services",
//     nav_prices: "Prices",
//     nav_contacts: "Contacts",
//     nav_news: "News",
//     nav_about: "About us",
//     nav_admin: "Admin",

//     // Hero
//     hero_tagline: "Salon Elen – beauty and care in Halle",
//     hero_subtitle:
//       "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//     hero_cta_book: "Book now",
//     hero_cta_services: "All services",
//     hero_badge: "Online booking 24/7 • In the center of Halle",

//     // Главная – блок «Популярные услуги»
//     home_services_title: "Popular services",
//     home_services_subtitle: "What we do best",
//     home_services_card1_title: "Women’s haircut",
//     home_services_card1_text: "We highlight your style and individuality.",
//     home_services_card2_title: "Manicure",
//     home_services_card2_text:
//       "Aesthetics, hygiene and long-lasting coating.",
//     home_services_card3_title: "Make-up",
//     home_services_card3_text:
//       "We create the right look for any occasion.",

//     // Главная – блок «Новости и статьи»
//     home_news_title: "News & articles",
//     home_news_subtitle: "Fresh updates and useful tips",
//     home_news_empty: "No posts have been published yet.",

//     // Главная – нижний CTA
//     home_cta_title: "Ready for a change?",
//     home_cta_text:
//       "Book your appointment online – we’ll find the perfect care and style for you.",
//     home_cta_button: "Book now",

//     // Авторизация
//     auth_login: "Sign in",
//     auth_logout: "Sign out",

//     // Booking – шаги
//     booking_step_services: "Service",
//     booking_step_master: "Stylist",
//     booking_step_calendar: "Date",
//     booking_step_client: "Details",
//     booking_step_verify: "Review",
//     booking_step_payment: "Payment",

//     // Booking – общие тексты
//     booking_title: "Online booking",
//     booking_subtitle:
//       "Choose a service, time and stylist – all in a few clicks.",
//     booking_next: "Next",
//     booking_back: "Back",
//     booking_confirm: "Confirm",
//     booking_cancel: "Cancel",

//     // Booking – выбор услуг
//     booking_services_loading: "Loading premium services…",
//     booking_services_error_message: "Failed to load services",
//     booking_services_error_retry: "Try again",
//     booking_services_hero_badge: "Premium beauty menu",
//     booking_services_hero_title: "Choose a service",
//     booking_services_hero_subtitle:
//       "Create your unique look with our exclusive premium services.",
//     booking_services_category_all: "All",
//     booking_services_price_on_request: "On request",
//     booking_services_duration_full: "minutes",
//     booking_services_duration_short: "min",
//     booking_services_selected_label: "Selected services:",
//     booking_services_cta_continue: "Continue",

//     // Футер – салон
//     footer_about_section: "Salon & Location",
//     footer_about_description:
//       "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

//     footer_location_section: "Our address",
//     footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//     footer_hours_label: "Opening hours",
//     footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
//     footer_hours_saturday: "Sat: 10:00 – 16:00",
//     footer_hours_sunday: "Sun: closed",

//     footer_navigation_section: "Navigation",

//     footer_clients_section: "For clients and stylists",

//     footer_socials_section: "Social Media & Messengers",

//     footer_privacy: "Privacy Policy",
//     footer_terms: "Terms of Use",
//     footer_back_to_top: "Back to top",

//     footer_copyright: "All rights reserved.",

//     footer_contacts_title: "Contacts",

//     footer_client_booking: "Online booking",
//     footer_client_cabinet: "Client booking account",
//     footer_client_admin: "Stylist cooperation",
//     footer_client_partnership_title: "Partnership with stylists",
//     footer_client_partnership_text:
//       "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we’ll discuss cooperation.",

//     footer_top_title:
//       "Your beauty salon with online booking and attention to detail",
//     footer_top_text:
//       "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
//     footer_top_chip_online: "Online booking 24/7",
//     footer_top_chip_premium: "Premium service",

//     footer_quick_title: "Book your visit in a few clicks",
//     footer_quick_text:
//       "Online booking is available 24/7 – we’ll confirm your appointment as quickly as possible.",
//     footer_quick_step1: "Choose a service",
//     footer_quick_step2: "Choose a stylist",
//     footer_quick_step3: "Confirm the time",
//     footer_quick_adv1: "Premium-level online booking",
//     footer_quick_adv2: "Convenient time slots for your schedule",

//     footer_socials_instagram_hint: "Open the salon’s Instagram",
//     footer_socials_facebook_hint: "Open the Facebook page",
//     footer_socials_youtube_hint: "Open the YouTube channel",

//     footer_messenger_email: "Send an email",
//     footer_messenger_call: "Call us",
//   },
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key];
// }







