// src/i18n/messages.ts
import type { Locale } from "./locales";

// Все текстовые ключи проекта
export type BaseMessages = {
  // Навигация
  nav_home: string;
  nav_services: string;
  nav_prices: string;
  nav_contacts: string;
  nav_news: string;
  nav_about: string;
  nav_admin: string;

  // Hero
  hero_tagline: string;
  hero_subtitle: string;
  hero_cta_book: string;
  hero_cta_services: string;
  hero_badge: string;

  // Главная – блок «Популярные услуги»
  home_services_title: string;
  home_services_subtitle: string;
  home_services_card1_title: string;
  home_services_card1_text: string;
  home_services_card2_title: string;
  home_services_card2_text: string;
  home_services_card3_title: string;
  home_services_card3_text: string;

  // Главная – блок «Новости и статьи»
  home_news_title: string;
  home_news_subtitle: string;
  home_news_empty: string;

  // Главная – нижний CTA
  home_cta_title: string;
  home_cta_text: string;
  home_cta_button: string;

  // Авторизация
  auth_login: string;
  auth_logout: string;

  // Футер – общий блок салона
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
};

export type MessageKey = keyof BaseMessages;

// Русская версия (базовая)
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

  // Главная – блок «Популярные услуги»
  home_services_title: "Популярные услуги",
  home_services_subtitle: "Что мы делаем лучше всего",
  home_services_card1_title: "Женская стрижка",
  home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
  home_services_card2_title: "Маникюр",
  home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
  home_services_card3_title: "Макияж",
  home_services_card3_text: "Создадим образ под любое событие и настроение.",

  // Главная – блок «Новости и статьи»
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
};

// Все локали
export const messages: Record<Locale, BaseMessages> = {
  ru: ruMessages,

  de: {
    // Навигация
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

    // Главная – блок «Популярные услуги»
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

    // Главная – блок «Новости и статьи»
    home_news_title: "News & Artikel",
    home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
    home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

    // Главная – нижний CTA
    home_cta_title: "Bereit für eine Veränderung?",
    home_cta_text:
      "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
    home_cta_button: "Termin buchen",

    // Авторизация
    auth_login: "Anmelden",
    auth_logout: "Abmelden",

    // Футер – салон
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
  },

  en: {
    // Навигация
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

    // Главная – блок «Популярные услуги»
    home_services_title: "Popular services",
    home_services_subtitle: "What we do best",
    home_services_card1_title: "Women’s haircut",
    home_services_card1_text:
      "We highlight your style and individuality.",
    home_services_card2_title: "Manicure",
    home_services_card2_text:
      "Aesthetics, hygiene and long-lasting coating.",
    home_services_card3_title: "Make-up",
    home_services_card3_text:
      "We create the right look for any occasion.",

    // Главная – блок «Новости и статьи»
    home_news_title: "News & articles",
    home_news_subtitle: "Fresh updates and useful tips",
    home_news_empty: "No posts have been published yet.",

    // Главная – нижний CTA
    home_cta_title: "Ready for a change?",
    home_cta_text:
      "Book your appointment online – we’ll find the perfect care and style for you.",
    home_cta_button: "Book now",

    // Авторизация
    auth_login: "Sign in",
    auth_logout: "Sign out",

    // Футер – салон
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
  },
};

export function translate(locale: Locale, key: MessageKey): string {
  const dict = messages[locale] ?? messages.ru;
  return dict[key];
}







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

//   // Футер
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

//   // Футер
//   footer_about_section: "Салон & Локация",
//   footer_about_description:
//     "Мы создаём атмосферу расслабления и красоты, используя профессиональную косметику и современные методики ухода.",

//   footer_location_section: "Наш адрес",
//   footer_address_label: "ул. Leipziger Straße 70, Halle (Saale)",

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

//     // Футер
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
//     home_services_card1_text:
//       "We highlight your style and individuality.",
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

//     // Футер
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
// };

// export type MessageKey = keyof BaseMessages;

// // Русская версия (базовая)
// const ruMessages: BaseMessages = {
//   nav_home: "Главная",
//   nav_services: "Услуги",
//   nav_prices: "Цены",
//   nav_contacts: "Контакты",
//   nav_news: "Новости",
//   nav_about: "О нас",
//   nav_admin: "Админ",

//   hero_tagline: "Salon Elen — красота и уход в Halle",
//   hero_subtitle:
//     "Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.",
//   hero_cta_book: "Записаться",
//   hero_cta_services: "Все услуги",
//   hero_badge: "Онлайн-запись 24/7 • В центре Halle",

//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   home_news_title: "Новости и статьи",
//   home_news_subtitle: "Свежие обновления и полезные советы",
//   home_news_empty: "Пока нет опубликованных материалов.",

//   home_cta_title: "Готовы к обновлению?",
//   home_cta_text:
//     "Запишитесь онлайн и мы подберём для вас идеальный уход и стиль.",
//   home_cta_button: "Записаться",

//   auth_login: "Войти",
//   auth_logout: "Выйти",
// };

// // Все локали
// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,

//   de: {
//     nav_home: "Startseite",
//     nav_services: "Leistungen",
//     nav_prices: "Preise",
//     nav_contacts: "Kontakt",
//     nav_news: "Neuigkeiten",
//     nav_about: "Über uns",
//     nav_admin: "Admin",

//     hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//     hero_subtitle:
//       "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//     hero_cta_book: "Termin buchen",
//     hero_cta_services: "Alle Leistungen",
//     hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

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

//     home_news_title: "News & Artikel",
//     home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//     home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//     home_cta_title: "Bereit für eine Veränderung?",
//     home_cta_text:
//       "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//     home_cta_button: "Termin buchen",

//     auth_login: "Anmelden",
//     auth_logout: "Abmelden",
//   },

//   en: {
//     nav_home: "Home",
//     nav_services: "Services",
//     nav_prices: "Prices",
//     nav_contacts: "Contacts",
//     nav_news: "News",
//     nav_about: "About us",
//     nav_admin: "Admin",

//     hero_tagline: "Salon Elen – beauty and care in Halle",
//     hero_subtitle:
//       "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//     hero_cta_book: "Book now",
//     hero_cta_services: "All services",
//     hero_badge: "Online booking 24/7 • In the center of Halle",

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

//     home_news_title: "News & articles",
//     home_news_subtitle: "Fresh updates and useful tips",
//     home_news_empty: "No posts have been published yet.",

//     home_cta_title: "Ready for a change?",
//     home_cta_text:
//       "Book your appointment online – we’ll find the perfect care and style for you.",
//     home_cta_button: "Book now",

//     auth_login: "Sign in",
//     auth_logout: "Sign out",
//   },
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key];
// }




// // src/i18n/messages.ts
// import type { Locale } from './locales';

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
// };

// export type MessageKey = keyof BaseMessages;

// // Русская версия (базовая)
// const ruMessages: BaseMessages = {
//   nav_home: 'Главная',
//   nav_services: 'Услуги',
//   nav_prices: 'Цены',
//   nav_contacts: 'Контакты',
//   nav_news: 'Новости',
//   nav_about: 'О нас',
//   nav_admin: 'Админ',

//   hero_tagline: 'Salon Elen — красота и уход в Halle',
//   hero_subtitle:
//     'Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.',
//   hero_cta_book: 'Записаться',
//   hero_cta_services: 'Все услуги',
//   hero_badge: 'Онлайн-запись 24/7 • В центре Halle',

//   home_services_title: 'Популярные услуги',
//   home_services_subtitle: 'Что мы делаем лучше всего',
//   home_services_card1_title: 'Женская стрижка',
//   home_services_card1_text: 'Подчеркнём ваш стиль и индивидуальность.',
//   home_services_card2_title: 'Маникюр',
//   home_services_card2_text:
//     'Эстетика, стерильность и стойкое покрытие.',
//   home_services_card3_title: 'Макияж',
//   home_services_card3_text: 'Создадим образ под любое событие и настроение.',

//   home_news_title: 'Новости и статьи',
//   home_news_subtitle: 'Свежие обновления и полезные советы',
//   home_news_empty: 'Пока нет опубликованных материалов.',

//   home_cta_title: 'Готовы к обновлению?',
//   home_cta_text:
//     'Запишитесь онлайн и мы подберём для вас идеальный уход и стиль.',
//   home_cta_button: 'Записаться',
// };

// // Все локали
// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,

//   de: {
//     nav_home: 'Startseite',
//     nav_services: 'Leistungen',
//     nav_prices: 'Preise',
//     nav_contacts: 'Kontakt',
//     nav_news: 'Neuigkeiten',
//     nav_about: 'Über uns',
//     nav_admin: 'Admin',

//     hero_tagline: 'Salon Elen – Schönheit und Pflege in Halle',
//     hero_subtitle:
//       'Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.',
//     hero_cta_book: 'Termin buchen',
//     hero_cta_services: 'Alle Leistungen',
//     hero_badge: 'Online-Termin 24/7 • Im Zentrum von Halle',

//     home_services_title: 'Beliebte Leistungen',
//     home_services_subtitle: 'Was wir besonders gut können',
//     home_services_card1_title: 'Damenhaarschnitt',
//     home_services_card1_text:
//       'Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.',
//     home_services_card2_title: 'Maniküre',
//     home_services_card2_text:
//       'Ästhetik, Hygiene und langanhaltende Beschichtung.',
//     home_services_card3_title: 'Make-up',
//     home_services_card3_text:
//       'Wir kreieren ein passendes Make-up für jeden Anlass.',

//     home_news_title: 'News & Artikel',
//     home_news_subtitle: 'Aktuelle Neuigkeiten und nützliche Tipps',
//     home_news_empty: 'Es sind noch keine Beiträge veröffentlicht.',

//     home_cta_title: 'Bereit für eine Veränderung?',
//     home_cta_text:
//       'Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.',
//     home_cta_button: 'Termin buchen',
//   },

//   en: {
//     nav_home: 'Home',
//     nav_services: 'Services',
//     nav_prices: 'Prices',
//     nav_contacts: 'Contacts',
//     nav_news: 'News',
//     nav_about: 'About us',
//     nav_admin: 'Admin',

//     hero_tagline: 'Salon Elen – beauty and care in Halle',
//     hero_subtitle:
//       'Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.',
//     hero_cta_book: 'Book now',
//     hero_cta_services: 'All services',
//     hero_badge: 'Online booking 24/7 • In the center of Halle',

//     home_services_title: 'Popular services',
//     home_services_subtitle: 'What we do best',
//     home_services_card1_title: 'Women’s haircut',
//     home_services_card1_text:
//       'We highlight your style and individuality.',
//     home_services_card2_title: 'Manicure',
//     home_services_card2_text:
//       'Aesthetics, hygiene and long-lasting coating.',
//     home_services_card3_title: 'Make-up',
//     home_services_card3_text:
//       'We create the right look for any occasion.',

//     home_news_title: 'News & articles',
//     home_news_subtitle: 'Fresh updates and useful tips',
//     home_news_empty: 'No posts have been published yet.',

//     home_cta_title: 'Ready for a change?',
//     home_cta_text:
//       'Book your appointment online – we’ll find the perfect care and style for you.',
//     home_cta_button: 'Book now',
//   },
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key];
// }



// // src/i18n/messages.ts
// import type { Locale } from './locales';

// // Структура всех сообщений
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
// };

// export type MessageKey = keyof BaseMessages;

// // Базовые (русские) сообщения
// const ruMessages: BaseMessages = {
//   nav_home: 'Главная',
//   nav_services: 'Услуги',
//   nav_prices: 'Цены',
//   nav_contacts: 'Контакты',
//   nav_news: 'Новости',
//   nav_about: 'О нас',
//   nav_admin: 'Админ',

//   hero_tagline: 'Salon Elen — красота и уход в Halle',
//   hero_subtitle:
//     'Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.',
//   hero_cta_book: 'Записаться',
//   hero_cta_services: 'Все услуги',
//   hero_badge: 'Онлайн-запись 24/7 • В центре Halle',
// };

// // Все локали
// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,
//   de: {
//     nav_home: 'Startseite',
//     nav_services: 'Leistungen',
//     nav_prices: 'Preise',
//     nav_contacts: 'Kontakt',
//     nav_news: 'Neuigkeiten',
//     nav_about: 'Über uns',
//     nav_admin: 'Admin',

//     hero_tagline: 'Salon Elen – Schönheit und Pflege in Halle',
//     hero_subtitle:
//       'Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.',
//     hero_cta_book: 'Termin buchen',
//     hero_cta_services: 'Alle Leistungen',
//     hero_badge: 'Online-Termin 24/7 • Im Zentrum von Halle',
//   },
//   en: {
//     nav_home: 'Home',
//     nav_services: 'Services',
//     nav_prices: 'Prices',
//     nav_contacts: 'Contacts',
//     nav_news: 'News',
//     nav_about: 'About us',
//     nav_admin: 'Admin',

//     hero_tagline: 'Salon Elen – beauty and care in Halle',
//     hero_subtitle:
//       'Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.',
//     hero_cta_book: 'Book now',
//     hero_cta_services: 'All services',
//     hero_badge: 'Online booking 24/7 • In the center of Halle',
//   },
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key];
// }
