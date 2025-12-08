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
};

export type MessageKey = keyof BaseMessages;

// Русская версия (базовая)
const ruMessages: BaseMessages = {
  nav_home: "Главная",
  nav_services: "Услуги",
  nav_prices: "Цены",
  nav_contacts: "Контакты",
  nav_news: "Новости",
  nav_about: "О нас",
  nav_admin: "Админ",

  hero_tagline: "Salon Elen — красота и уход в Halle",
  hero_subtitle:
    "Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.",
  hero_cta_book: "Записаться",
  hero_cta_services: "Все услуги",
  hero_badge: "Онлайн-запись 24/7 • В центре Halle",

  home_services_title: "Популярные услуги",
  home_services_subtitle: "Что мы делаем лучше всего",
  home_services_card1_title: "Женская стрижка",
  home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
  home_services_card2_title: "Маникюр",
  home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
  home_services_card3_title: "Макияж",
  home_services_card3_text: "Создадим образ под любое событие и настроение.",

  home_news_title: "Новости и статьи",
  home_news_subtitle: "Свежие обновления и полезные советы",
  home_news_empty: "Пока нет опубликованных материалов.",

  home_cta_title: "Готовы к обновлению?",
  home_cta_text:
    "Запишитесь онлайн и мы подберём для вас идеальный уход и стиль.",
  home_cta_button: "Записаться",

  auth_login: "Войти",
  auth_logout: "Выйти",
};

// Все локали
export const messages: Record<Locale, BaseMessages> = {
  ru: ruMessages,

  de: {
    nav_home: "Startseite",
    nav_services: "Leistungen",
    nav_prices: "Preise",
    nav_contacts: "Kontakt",
    nav_news: "Neuigkeiten",
    nav_about: "Über uns",
    nav_admin: "Admin",

    hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
    hero_subtitle:
      "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
    hero_cta_book: "Termin buchen",
    hero_cta_services: "Alle Leistungen",
    hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

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

    home_news_title: "News & Artikel",
    home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
    home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

    home_cta_title: "Bereit für eine Veränderung?",
    home_cta_text:
      "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
    home_cta_button: "Termin buchen",

    auth_login: "Anmelden",
    auth_logout: "Abmelden",
  },

  en: {
    nav_home: "Home",
    nav_services: "Services",
    nav_prices: "Prices",
    nav_contacts: "Contacts",
    nav_news: "News",
    nav_about: "About us",
    nav_admin: "Admin",

    hero_tagline: "Salon Elen – beauty and care in Halle",
    hero_subtitle:
      "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
    hero_cta_book: "Book now",
    hero_cta_services: "All services",
    hero_badge: "Online booking 24/7 • In the center of Halle",

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

    home_news_title: "News & articles",
    home_news_subtitle: "Fresh updates and useful tips",
    home_news_empty: "No posts have been published yet.",

    home_cta_title: "Ready for a change?",
    home_cta_text:
      "Book your appointment online – we’ll find the perfect care and style for you.",
    home_cta_button: "Book now",

    auth_login: "Sign in",
    auth_logout: "Sign out",
  },
};

export function translate(locale: Locale, key: MessageKey): string {
  const dict = messages[locale] ?? messages.ru;
  return dict[key];
}




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
