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

  // ==== CALENDAR PAGE ====

  // Hero
  booking_calendar_step_badge: string;
  booking_calendar_hero_title: string;
  booking_calendar_hero_subtitle: string;

  // Master Selection
  booking_calendar_master_select_label: string;
  booking_calendar_master_label: string;
  booking_calendar_master_loading: string;

  // Calendar Section
  booking_calendar_select_day_hint: string;
  booking_calendar_today_slots: string;
  booking_calendar_slot_singular: string;
  booking_calendar_slot_few: string;
  booking_calendar_slot_many: string;
  booking_calendar_slots_tooltip: string;
  booking_calendar_weekend: string;
  booking_calendar_no_slots: string;

  // Legend
  booking_calendar_legend_title: string;
  booking_calendar_legend_loading: string;
  booking_calendar_legend_subtitle: string;

  // Smart Tips
  booking_calendar_smart_tip_label: string;
  booking_calendar_smart_tip_morning: string;
  booking_calendar_smart_tip_evening: string;
  booking_calendar_smart_tip_many: string;
  booking_calendar_smart_tip_few: string;

  // Selected Date
  booking_calendar_selected_date_label: string;

  // Time Section
  booking_calendar_time_title: string;
  booking_calendar_duration_label: string;
  booking_calendar_nearest_slot: string;
  booking_calendar_minutes_label: string;
  booking_calendar_error_prefix: string;
  booking_calendar_no_slots_message: string;
  booking_calendar_try_another_day: string;
  booking_calendar_vip_badge: string;
  booking_calendar_available_slots: string;
  // ======= BOOKING - CLIENT CHOICE PAGE =======
  booking_client_choice_title: string;
  booking_client_choice_subtitle: string;
  booking_client_choice_recommended: string;
  
  booking_client_google_title: string;
  booking_client_google_description: string;
  booking_client_google_benefit_1: string;
  booking_client_google_benefit_2: string;
  booking_client_google_benefit_3: string;
  booking_client_google_benefit_4: string;
  booking_client_google_button: string;
  booking_client_google_security: string;
  booking_client_google_connecting: string;
  
  booking_client_form_title: string;
  booking_client_form_description: string;
  booking_client_form_benefit_1: string;
  booking_client_form_benefit_2: string;
  booking_client_form_benefit_3: string;
  booking_client_form_benefit_4: string;
  booking_client_form_button: string;
  booking_client_form_security: string;
  
  booking_client_choice_footer: string;
  booking_client_choice_footer_highlight: string;
  
  booking_client_popup_blocked: string;
  booking_client_google_error_init: string;
  booking_client_auth_error: string;
  booking_client_auth_waiting: string;
  
  // ======= BOOKING - CLIENT FORM PAGE =======
  booking_client_form_badge: string;
  booking_client_form_hero_title: string;
  booking_client_form_hero_subtitle: string;
  
  booking_client_form_label_name: string;
  booking_client_form_label_phone: string;
  booking_client_form_label_email: string;
  booking_client_form_label_birth: string;
  booking_client_form_label_referral: string;
  booking_client_form_label_comment: string;
  booking_client_form_label_optional: string;
  
  booking_client_form_placeholder_name: string;
  booking_client_form_placeholder_phone: string;
  booking_client_form_placeholder_email: string;
  booking_client_form_placeholder_comment: string;
  booking_client_form_placeholder_referral_other: string;
  
  booking_client_form_referral_select: string;
  booking_client_form_referral_google: string;
  booking_client_form_referral_facebook: string;
  booking_client_form_referral_instagram: string;
  booking_client_form_referral_friends: string;
  booking_client_form_referral_other: string;
  
  booking_client_form_error_name: string;
  booking_client_form_error_phone: string;
  booking_client_form_error_email_required: string;
  booking_client_form_error_email_invalid: string;
  booking_client_form_error_email_not_verified: string;
  booking_client_form_error_birth_required: string;
  booking_client_form_error_birth_future: string;
  booking_client_form_error_birth_underage: string;
  booking_client_form_error_referral: string;
  booking_client_form_error_referral_other: string;
  
  booking_client_form_email_checking: string;
  booking_client_form_email_verified: string;
  
  booking_client_form_age_requirement: string;
  booking_client_form_email_error_note: string;
  
  booking_client_form_button_back: string;
  booking_client_form_button_submit: string;
  booking_client_form_button_submitting: string;
  
  booking_client_form_info_title: string;
  booking_client_form_info_point_1: string;
  booking_client_form_info_point_1_highlight: string;
  booking_client_form_info_point_2: string;
  booking_client_form_info_point_2_highlight: string;
  booking_client_form_info_point_3: string;
  
  booking_client_form_invalid_params: string;
  booking_client_form_invalid_return: string;
  
  // ======= BOOKING - VERIFY PAGE =======
  booking_verify_badge: string;
  booking_verify_hero_title: string;
  booking_verify_hero_subtitle: string;
  booking_verify_method_title: string;
  booking_verify_code_on_email: string;
  
  booking_verify_method_email_title: string;
  booking_verify_method_email_desc: string;
  booking_verify_method_google_title: string;
  booking_verify_method_google_desc: string;
  booking_verify_method_telegram_title: string;
  booking_verify_method_telegram_desc: string;
  booking_verify_method_whatsapp_title: string;
  booking_verify_method_whatsapp_desc: string;
  
  booking_verify_email_confirm_title: string;
  booking_verify_email_confirm_desc: string;
  booking_verify_email_label: string;
  booking_verify_email_wrong_hint: string;
  booking_verify_email_send_code: string;
  booking_verify_email_sending: string;
  booking_verify_email_arrives_hint: string;
  booking_verify_email_enter_code: string;
  booking_verify_email_code_valid: string;
  booking_verify_email_confirm_code: string;
  booking_verify_email_checking: string;
  booking_verify_email_resend: string;
  
  booking_verify_info_title: string;
  booking_verify_info_desc: string;
  booking_verify_info_arrives: string;
  booking_verify_info_check_spam: string;
  booking_verify_info_check_email: string;
  booking_verify_info_resend_if_needed: string;
  booking_verify_info_progress_title: string;
  booking_verify_info_progress_1: string;
  booking_verify_info_progress_2: string;
  booking_verify_info_progress_3: string;
  booking_verify_info_progress_4: string;
  booking_verify_info_progress_5: string;
  booking_verify_info_support: string;
  
  booking_verify_invalid_params: string;
  booking_verify_invalid_return: string;
  
  booking_verify_google_title: string;
  booking_verify_google_desc: string;
  booking_verify_google_preparing: string;
  booking_verify_google_open_button: string;
  booking_verify_google_reopen_button: string;
  booking_verify_google_waiting: string;
  booking_verify_google_how_title: string;
  booking_verify_google_how_step_1: string;
  booking_verify_google_how_step_2: string;
  booking_verify_google_how_step_3: string;
  booking_verify_google_how_step_4: string;
  booking_verify_google_security_title: string;
  booking_verify_google_security_desc: string;
  booking_verify_google_success: string;
  booking_verify_google_preparing_window: string;
  booking_verify_google_allow_popups: string;
  
  booking_verify_telegram_title: string;
  booking_verify_telegram_desc_registered: string;
  booking_verify_telegram_desc_unregistered: string;
  booking_verify_telegram_sending_code: string;
  booking_verify_telegram_open_button: string;
  booking_verify_telegram_reopen_button: string;
  booking_verify_telegram_waiting_bot: string;
  booking_verify_telegram_waiting: string;
  booking_verify_telegram_divider: string;
  booking_verify_telegram_enter_code: string;
  booking_verify_telegram_code_placeholder: string;
  booking_verify_telegram_code_valid: string;
  booking_verify_telegram_confirm_button: string;
  booking_verify_telegram_checking: string;
  booking_verify_telegram_code_sent: string;
  booking_verify_telegram_opening: string;
  booking_verify_telegram_click_button: string;
  booking_verify_telegram_success: string;
  
  booking_verify_error_enter_code: string;
  booking_verify_success_redirect: string;

  // ======= BOOKING - PAYMENT PAGE =======
  booking_payment_badge: string;
  booking_payment_hero_title: string;
  booking_payment_hero_subtitle: string;
  booking_payment_appointment_id: string;
  booking_payment_method_title: string;
  
  booking_payment_onsite_title: string;
  booking_payment_onsite_desc: string;
  booking_payment_onsite_benefit_1: string;
  booking_payment_onsite_benefit_2: string;
  booking_payment_onsite_benefit_3: string;
  
  booking_payment_online_title: string;
  booking_payment_online_desc: string;
  booking_payment_online_benefit_1: string;
  booking_payment_online_benefit_2: string;
  booking_payment_online_benefit_3: string;
  
  booking_payment_info_title: string;
  booking_payment_info_desc: string;
  booking_payment_confirm_button: string;
  booking_payment_confirm_terms: string;
  
  booking_payment_summary_title: string;
  booking_payment_summary_visit: string;
  booking_payment_summary_service: string;
  booking_payment_summary_master: string;
  booking_payment_summary_datetime: string;
  booking_payment_summary_address: string;
  booking_payment_summary_cancellation_title: string;
  booking_payment_summary_cancellation_desc: string;
  booking_payment_summary_future_note: string;
  
  booking_payment_success_title: string;
  booking_payment_success_desc: string;
  booking_payment_success_home: string;
  booking_payment_success_calendar: string;
  booking_payment_success_new: string;
  
  booking_payment_error_title: string;
  booking_payment_error_desc: string;
  booking_payment_error_return: string;
  booking_payment_error_missing: string;
  
  // ======= BOOKING - SUCCESS PAGE =======
  booking_success_page_title: string;
  booking_success_page_subtitle: string;
  booking_success_loading: string;
  booking_success_loading_data: string;
  booking_success_error_title: string;
  booking_success_error_not_found: string;
  booking_success_error_load_failed: string;
  booking_success_error_return: string;
  booking_success_title: string;
  booking_success_desc: string;
  booking_success_details_title: string;
  booking_success_details_name: string;
  booking_success_details_email: string;
  booking_success_details_phone: string;
  booking_success_details_datetime: string;
  booking_success_button_new: string;
  booking_success_button_home: string;




  // Navigation
  booking_calendar_back_to_master: string;

  // Months
  month_january: string;
  month_february: string;
  month_march: string;
  month_april: string;
  month_may: string;
  month_june: string;
  month_july: string;
  month_august: string;
  month_september: string;
  month_october: string;
  month_november: string;
  month_december: string;

  // Weekdays (short)
  weekday_mon: string;
  weekday_tue: string;
  weekday_wed: string;
  weekday_thu: string;
  weekday_fri: string;
  weekday_sat: string;
  weekday_sun: string;

  // Weekdays (full, for smart tips)
  weekday_full_monday: string;
  weekday_full_tuesday: string;
  weekday_full_wednesday: string;
  weekday_full_thursday: string;
  weekday_full_friday: string;
  weekday_full_saturday: string;
  weekday_full_sunday: string;
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

  // CALENDAR PAGE – Hero
  booking_calendar_step_badge: "Шаг 3 — Выбор даты и времени",
  booking_calendar_hero_title: "Волшебное время для красоты",
  booking_calendar_hero_subtitle:
    "Выберите удобную дату и время, а мы позаботимся обо всём остальном",

  // CALENDAR PAGE – Master Selection
  booking_calendar_master_select_label: "Выберите",
  booking_calendar_master_label: "Мастер",
  booking_calendar_master_loading: "Загрузка мастеров...",

  // CALENDAR PAGE – Calendar Section
  booking_calendar_select_day_hint: "Выберите удобный день для записи",
  booking_calendar_today_slots: "Сегодня:",
  booking_calendar_slot_singular: "свободный слот",
  booking_calendar_slot_few: "свободных слота",
  booking_calendar_slot_many: "свободных слотов",
  booking_calendar_slots_tooltip: "слотов",
  booking_calendar_weekend: "Выходной",
  booking_calendar_no_slots: "Нет слотов",

  // CALENDAR PAGE – Legend
  booking_calendar_legend_title: "Золотая заливка показывает занятость дня",
  booking_calendar_legend_loading: "Загрузка данных...",
  booking_calendar_legend_subtitle: "Чем выше заливка — тем больше записей",

  // CALENDAR PAGE – Smart Tips
  booking_calendar_smart_tip_label: "💡 Умный совет",
  booking_calendar_smart_tip_morning:
    "больше свободных слотов утром (09:00-12:00)",
  booking_calendar_smart_tip_evening:
    "больше свободных слотов вечером (17:00-19:00)",
  booking_calendar_smart_tip_many: "Отличный выбор! Много свободного времени",
  booking_calendar_smart_tip_few: "Успейте забронировать — слотов немного",

  // CALENDAR PAGE – Selected Date
  booking_calendar_selected_date_label: "Выбранная дата:",

  // CALENDAR PAGE – Time Section
  booking_calendar_time_title: "Доступное время",
  booking_calendar_duration_label: "Длительность записи:",
  booking_calendar_nearest_slot: "Ближайший слот:",
  booking_calendar_minutes_label: "минут",
  booking_calendar_error_prefix: "⚠️ Ошибка:",
  booking_calendar_no_slots_message: "На эту дату нет свободных слотов.",
  booking_calendar_try_another_day: "Попробуйте выбрать соседний день.",
  booking_calendar_vip_badge: "VIP",
  booking_calendar_available_slots: "Доступно слотов:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
  booking_client_choice_title: "Как вы хотите продолжить?",
  booking_client_choice_subtitle: "Выберите удобный способ регистрации",
  booking_client_choice_recommended: "Рекомендуем",
  
  booking_client_google_title: "Быстрая регистрация",
  booking_client_google_description: "Войдите через Google и сразу перейдите к оплате",
  booking_client_google_benefit_1: "Один клик до оплаты",
  booking_client_google_benefit_2: "Автозаполнение данных",
  booking_client_google_benefit_3: "Безопасно и надёжно",
  booking_client_google_benefit_4: "Экономия времени",
  booking_client_google_button: "Начать за 1 клик",
  booking_client_google_security: "Защищено Google OAuth 2.0",
  booking_client_google_connecting: "Подключение...",
  
  booking_client_form_title: "Заполнить форму",
  booking_client_form_description: "Традиционный способ с полным контролем над данными",
  booking_client_form_benefit_1: "Полный контроль данных",
  booking_client_form_benefit_2: "Без Google аккаунта",
  booking_client_form_benefit_3: "Привычный процесс",
  booking_client_form_benefit_4: "Верификация через Telegram",
  booking_client_form_button: "Заполнить форму",
  booking_client_form_security: "Подтверждение через Telegram Bot",
  
  booking_client_choice_footer: "Оба способа безопасны и надёжны.",
  booking_client_choice_footer_highlight: "Выберите тот, который вам удобнее.",
  
  booking_client_popup_blocked: "Не удалось открыть окно. Разрешите всплывающие окна в браузере.",
  booking_client_google_error_init: "Ошибка инициализации Google OAuth",
  booking_client_auth_error: "Ошибка авторизации",
  booking_client_auth_waiting: "Ожидаем подтверждение через Google...",
  
  // ======= BOOKING - CLIENT FORM PAGE =======
  booking_client_form_badge: "Шаг 4 — Ваши контактные данные",
  booking_client_form_hero_title: "Онлайн-запись",
  booking_client_form_hero_subtitle: "Укажите ваши данные, чтобы мы подтвердили бронь",
  
  booking_client_form_label_name: "Имя",
  booking_client_form_label_phone: "Телефон",
  booking_client_form_label_email: "E-mail",
  booking_client_form_label_birth: "Дата рождения",
  booking_client_form_label_referral: "Как вы узнали о нас?",
  booking_client_form_label_comment: "Комментарий",
  booking_client_form_label_optional: "(необязательно)",
  
  booking_client_form_placeholder_name: "Ваше полное имя",
  booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
  booking_client_form_placeholder_email: "your@email.com",
  booking_client_form_placeholder_comment: "Дополнительная информация или пожелания",
  booking_client_form_placeholder_referral_other: "Уточните источник",
  
  booking_client_form_referral_select: "Выберите вариант",
  booking_client_form_referral_google: "Google",
  booking_client_form_referral_facebook: "Facebook",
  booking_client_form_referral_instagram: "Instagram",
  booking_client_form_referral_friends: "Рекомендация друзей",
  booking_client_form_referral_other: "Другое",
  
  booking_client_form_error_name: "Укажите имя полностью",
  booking_client_form_error_phone: "Укажите корректный номер телефона",
  booking_client_form_error_email_required: "E-mail обязателен",
  booking_client_form_error_email_invalid: "Некорректный e-mail",
  booking_client_form_error_email_not_verified: "E-mail не подтверждён",
  booking_client_form_error_birth_required: "Дата рождения обязательна",
  booking_client_form_error_birth_future: "Дата в будущем недопустима",
  booking_client_form_error_birth_underage: "Для онлайн-записи требуется возраст 16+",
  booking_client_form_error_referral: "Выберите вариант",
  booking_client_form_error_referral_other: "Уточните источник",
  
  booking_client_form_email_checking: "Проверка e-mail…",
  booking_client_form_email_verified: "E-mail подтверждён",
  
  booking_client_form_age_requirement: "Для онлайн-записи требуется возраст 16+",
  booking_client_form_email_error_note: "Если вы допустите ошибку в адресе, вы всё равно сможете прийти на приём, но не получите напоминания и подтверждения.",
  
  booking_client_form_button_back: "Назад",
  booking_client_form_button_submit: "Забронировать",
  booking_client_form_button_submitting: "Проверка данных…",
  
  booking_client_form_info_title: "Почему мы просим e-mail?",
  booking_client_form_info_point_1: "На ваш e-mail мы отправим",
  booking_client_form_info_point_1_highlight: "подтверждение брони и все детали записи",
  booking_client_form_info_point_2: "Вы получите",
  booking_client_form_info_point_2_highlight: "напоминание перед визитом",
  booking_client_form_info_point_3: "Мы бережно относимся к персональным данным и используем ваш e-mail только для обслуживания вашей записи",
  
  booking_client_form_invalid_params: "Некорректные параметры. Пожалуйста, начните запись заново.",
  booking_client_form_invalid_return: "Вернуться к выбору услуг",

  booking_verify_badge: "Шаг 5 — Подтверждение email",
  booking_verify_hero_title: "Подтверждение записи",
  booking_verify_hero_subtitle: "Проверьте почту и введите код",
  booking_verify_method_title: "Способ подтверждения",
  booking_verify_code_on_email: "Код на",
  booking_verify_method_email_title: "Email",
  booking_verify_method_email_desc: "Получить код на почту",
  booking_verify_method_google_title: "Google",
  booking_verify_method_google_desc: "Быстрая верификация",
  booking_verify_method_telegram_title: "Telegram",
  booking_verify_method_telegram_desc: "Код в Telegram",
  booking_verify_method_whatsapp_title: "WhatsApp",
  booking_verify_method_whatsapp_desc: "Скоро будет доступно",
  booking_verify_email_confirm_title: "Подтвердите ваш email",
  booking_verify_email_confirm_desc: "Мы отправим одноразовый 6-значный код на",
  booking_verify_email_label: "Почта для подтверждения",
  booking_verify_email_wrong_hint: "Если email неверный, вернитесь на предыдущий шаг",
  booking_verify_email_send_code: "Отправить код",
  booking_verify_email_sending: "Отправка…",
  booking_verify_email_arrives_hint: "Код приходит в течение нескольких секунд",
  booking_verify_email_enter_code: "Введите 6-значный код",
  booking_verify_email_code_valid: "Код действителен ограниченное время",
  booking_verify_email_confirm_code: "Подтвердить код",
  booking_verify_email_checking: "Проверка…",
  booking_verify_email_resend: "Отправить код повторно",
  booking_verify_info_title: "Безопасное подтверждение",
  booking_verify_info_desc: "Мы используем одноразовый код для защиты ваших данных и расписания салона",
  booking_verify_info_arrives: "Код приходит за 1–2 минуты",
  booking_verify_info_check_spam: "Проверьте папку «Спам»",
  booking_verify_info_check_email: "Убедитесь в правильности email",
  booking_verify_info_resend_if_needed: "Запросите код повторно при необходимости",
  booking_verify_info_progress_title: "Ваш прогресс",
  booking_verify_info_progress_1: "Выбрали услугу и мастера",
  booking_verify_info_progress_2: "Указали дату и время",
  booking_verify_info_progress_3: "Заполнили контактные данные",
  booking_verify_info_progress_4: "Сейчас — подтверждение email",
  booking_verify_info_progress_5: "Далее — оплата",
  booking_verify_info_support: "При возникновении сложностей свяжитесь с нами — мы поможем завершить запись",
  booking_verify_invalid_params: "Некорректные параметры. Пожалуйста, начните запись заново.",
  booking_verify_invalid_return: "Вернуться к выбору услуг",
  booking_verify_google_title: "Подтвердите через Google",
  booking_verify_google_desc: "Войдите через свой Google аккаунт для быстрого и безопасного подтверждения бронирования.",
  booking_verify_google_preparing: "Подготовка авторизации...",
  booking_verify_google_open_button: "Войти через Google",
  booking_verify_google_reopen_button: "Открыть Google повторно",
  booking_verify_google_waiting: "Ожидание подтверждения из Google...",
  booking_verify_google_how_title: "Как это работает:",
  booking_verify_google_how_step_1: "Откроется окно входа в Google",
  booking_verify_google_how_step_2: "Выберите свой аккаунт Google",
  booking_verify_google_how_step_3: "Разрешите доступ к email",
  booking_verify_google_how_step_4: "Автоматически вернётесь к оплате",
  booking_verify_google_security_title: "Безопасно и надёжно",
  booking_verify_google_security_desc: "Мы не получаем доступ к вашему паролю Google. Используется официальный OAuth протокол.",
  booking_verify_google_success: "✅ Подтверждено через Google! Переход к оплате...",
  booking_verify_google_preparing_window: "🔐 Google откроется в новом окне...",
  booking_verify_google_allow_popups: "⚠️ Разрешите всплывающие окна и нажмите кнопку ниже.",
  booking_verify_telegram_title: "Подтвердите через Telegram",
  booking_verify_telegram_desc_registered: "Код отправлен в Telegram бот. Проверьте сообщения и нажмите кнопку подтверждения.",
  booking_verify_telegram_desc_unregistered: "Telegram откроется автоматически. Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте.",
  booking_verify_telegram_sending_code: "Отправка кода...",
  booking_verify_telegram_open_button: "Открыть Telegram",
  booking_verify_telegram_reopen_button: "Открыть Telegram повторно",
  booking_verify_telegram_waiting_bot: "Ожидание подтверждения в Telegram боте...",
  booking_verify_telegram_waiting: "Ожидание подтверждения...",
  booking_verify_telegram_divider: "или",
  booking_verify_telegram_enter_code: "Введите 6-значный код из Telegram",
  booking_verify_telegram_code_placeholder: "000000",
  booking_verify_telegram_code_valid: "Код действителен 10 минут.",
  booking_verify_telegram_confirm_button: "Подтвердить код",
  booking_verify_telegram_checking: "Проверка...",
  booking_verify_telegram_code_sent: "✈️ Код отправлен в Telegram! Проверьте бота и нажмите кнопку подтверждения.",
  booking_verify_telegram_opening: "✈️ Telegram открывается... Ожидание подтверждения.",
  booking_verify_telegram_click_button: "⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.",
  booking_verify_telegram_success: "✅ Подтверждено через Telegram! Переход к оплате...",
  booking_verify_error_enter_code: "Введите 6-значный код",
  booking_verify_success_redirect: "Верификация успешна! Переход к оплате...",

  booking_payment_badge: "Шаг 6 — Оплата и финальное подтверждение",
  booking_payment_hero_title: "Завершение записи",
  booking_payment_hero_subtitle: "Выберите способ оплаты и подтвердите бронь",
  booking_payment_appointment_id: "Номер записи:",
  booking_payment_method_title: "Способ оплаты",
  booking_payment_onsite_title: "Оплата в салоне",
  booking_payment_onsite_desc: "На месте",
  booking_payment_onsite_benefit_1: "Наличные или карта в салоне",
  booking_payment_onsite_benefit_2: "Без предоплаты",
  booking_payment_onsite_benefit_3: "Оплата после услуги",
  booking_payment_online_title: "Онлайн-оплата",
  booking_payment_online_desc: "Скоро",
  booking_payment_online_benefit_1: "Карта, Apple Pay, Google Pay",
  booking_payment_online_benefit_2: "В разработке",
  booking_payment_online_benefit_3: "Запись всё равно будет подтверждена",
  booking_payment_info_title: "Как это работает?",
  booking_payment_info_desc: "Система уже создала запись в расписании салона. Оплата фиксируется на стороне салона. Онлайн-оплата будет добавлена позже.",
  booking_payment_confirm_button: "Подтвердить запись",
  booking_payment_confirm_terms: "Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона",
  booking_payment_summary_title: "Резюме записи",
  booking_payment_summary_visit: "Ваш визит в SalonElen",
  booking_payment_summary_service: "Услуга из записи (Appointment)",
  booking_payment_summary_master: "Мастер из записи",
  booking_payment_summary_datetime: "Дата и время по ID:",
  booking_payment_summary_address: "Адрес салона",
  booking_payment_summary_cancellation_title: "Политика отмены",
  booking_payment_summary_cancellation_desc: "Если вы не сможете прийти, пожалуйста, отмените запись заранее — это позволит освободить время для других гостей салона.",
  booking_payment_summary_future_note: "После запуска онлайн-оплаты здесь появится блок выбора платёжного метода и статус платежа",
  booking_payment_success_title: "Запись подтверждена!",
  booking_payment_success_desc: "Ваша запись успешно подтверждена. Оплата будет произведена в салоне.",
  booking_payment_success_home: "На главную страницу",
  booking_payment_success_calendar: "Добавить в Google Calendar",
  booking_payment_success_new: "Сделать новую запись",
  booking_payment_error_title: "Ошибка при переходе к оплате",
  booking_payment_error_desc: "Мы не смогли найти идентификатор записи. Возможно, ссылка устарела или шаг подтверждения email был пропущен.",
  booking_payment_error_return: "Вернуться к записи",
  booking_payment_error_missing: "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
  booking_success_page_title: "Онлайн-запись",
  booking_success_page_subtitle: "Успех",
  booking_success_loading: "Загрузка...",
  booking_success_loading_data: "Загружаем данные…",
  booking_success_error_title: "Ошибка",
  booking_success_error_not_found: "ID записи не найден",
  booking_success_error_load_failed: "Не удалось загрузить данные записи",
  booking_success_error_return: "Вернуться к бронированию",
  booking_success_title: "Запись подтверждена!",
  booking_success_desc: "Ваша запись успешно создана. Мы отправили подтверждение на вашу почту.",
  booking_success_details_title: "Детали записи:",
  booking_success_details_name: "Имя",
  booking_success_details_email: "Email",
  booking_success_details_phone: "Телефон",
  booking_success_details_datetime: "Дата и время",
  booking_success_button_new: "Создать новую запись",
  booking_success_button_home: "На главную",


  // CALENDAR PAGE – Navigation
  booking_calendar_back_to_master: "Вернуться к выбору мастера",

  // Months
  month_january: "Январь",
  month_february: "Февраль",
  month_march: "Март",
  month_april: "Апрель",
  month_may: "Май",
  month_june: "Июнь",
  month_july: "Июль",
  month_august: "Август",
  month_september: "Сентябрь",
  month_october: "Октябрь",
  month_november: "Ноябрь",
  month_december: "Декабрь",

  // Weekdays (short)
  weekday_mon: "Пн",
  weekday_tue: "Вт",
  weekday_wed: "Ср",
  weekday_thu: "Чт",
  weekday_fri: "Пт",
  weekday_sat: "Сб",
  weekday_sun: "Вс",

  // Weekdays (full)
  weekday_full_monday: "понедельник",
  weekday_full_tuesday: "вторник",
  weekday_full_wednesday: "среду",
  weekday_full_thursday: "четверг",
  weekday_full_friday: "пятницу",
  weekday_full_saturday: "субботу",
  weekday_full_sunday: "воскресенье",
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

  // CALENDAR PAGE – Hero
  booking_calendar_step_badge: "Schritt 3 — Datum und Uhrzeit wählen",
  booking_calendar_hero_title: "Magische Zeit für Schönheit",
  booking_calendar_hero_subtitle:
    "Wählen Sie ein passendes Datum und eine Uhrzeit – wir kümmern uns um alles andere",

  // CALENDAR PAGE – Master Selection
  booking_calendar_master_select_label: "Wählen Sie",
  booking_calendar_master_label: "Meister",
  booking_calendar_master_loading: "Meister werden geladen...",

  // CALENDAR PAGE – Calendar Section
  booking_calendar_select_day_hint: "Wählen Sie einen passenden Tag",
  booking_calendar_today_slots: "Heute:",
  booking_calendar_slot_singular: "freier Termin",
  booking_calendar_slot_few: "freie Termine",
  booking_calendar_slot_many: "freie Termine",
  booking_calendar_slots_tooltip: "Termine",
  booking_calendar_weekend: "Geschlossen",
  booking_calendar_no_slots: "Keine Termine",

  // CALENDAR PAGE – Legend
  booking_calendar_legend_title: "Goldene Füllung zeigt die Auslastung des Tages",
  booking_calendar_legend_loading: "Daten werden geladen...",
  booking_calendar_legend_subtitle:
    "Je höher die Füllung, desto mehr Buchungen",

  // CALENDAR PAGE – Smart Tips
  booking_calendar_smart_tip_label: "💡 Intelligenter Tipp",
  booking_calendar_smart_tip_morning:
    "mehr freie Termine am Morgen (09:00-12:00)",
  booking_calendar_smart_tip_evening:
    "mehr freie Termine am Abend (17:00-19:00)",
  booking_calendar_smart_tip_many: "Ausgezeichnete Wahl! Viel freie Zeit",
  booking_calendar_smart_tip_few:
    "Beeilen Sie sich mit der Buchung — wenige Termine",

  // CALENDAR PAGE – Selected Date
  booking_calendar_selected_date_label: "Gewähltes Datum:",

  // CALENDAR PAGE – Time Section
  booking_calendar_time_title: "Verfügbare Zeit",
  booking_calendar_duration_label: "Buchungsdauer:",
  booking_calendar_nearest_slot: "Nächster Termin:",
  booking_calendar_minutes_label: "Minuten",
  booking_calendar_error_prefix: "⚠️ Fehler:",
  booking_calendar_no_slots_message:
    "Für dieses Datum sind keine Termine verfügbar.",
  booking_calendar_try_another_day: "Versuchen Sie einen anderen Tag.",
  booking_calendar_vip_badge: "VIP",
  booking_calendar_available_slots: "Verfügbare Termine:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
  booking_client_choice_title: "Wie möchten Sie fortfahren?",
  booking_client_choice_subtitle: "Wählen Sie eine bequeme Registrierungsmethode",
  booking_client_choice_recommended: "Empfohlen",
  
  booking_client_google_title: "Schnelle Registrierung",
  booking_client_google_description: "Melden Sie sich über Google an und gehen Sie direkt zur Zahlung",
  booking_client_google_benefit_1: "Ein Klick zur Zahlung",
  booking_client_google_benefit_2: "Automatisches Ausfüllen",
  booking_client_google_benefit_3: "Sicher und zuverlässig",
  booking_client_google_benefit_4: "Zeitersparnis",
  booking_client_google_button: "Mit 1 Klick starten",
  booking_client_google_security: "Geschützt durch Google OAuth 2.0",
  booking_client_google_connecting: "Verbindung wird hergestellt...",
  
  booking_client_form_title: "Formular ausfüllen",
  booking_client_form_description: "Traditionelle Methode mit voller Kontrolle über Ihre Daten",
  booking_client_form_benefit_1: "Volle Datenkontrolle",
  booking_client_form_benefit_2: "Kein Google-Konto erforderlich",
  booking_client_form_benefit_3: "Gewohnter Prozess",
  booking_client_form_benefit_4: "Verifizierung über Telegram",
  booking_client_form_button: "Formular ausfüllen",
  booking_client_form_security: "Bestätigung über Telegram Bot",
  
  booking_client_choice_footer: "Beide Methoden sind sicher und zuverlässig.",
  booking_client_choice_footer_highlight: "Wählen Sie die für Sie bequemste.",
  
  booking_client_popup_blocked: "Fenster konnte nicht geöffnet werden. Erlauben Sie Pop-ups in Ihrem Browser.",
  booking_client_google_error_init: "Fehler bei der Google OAuth-Initialisierung",
  booking_client_auth_error: "Autorisierungsfehler",
  booking_client_auth_waiting: "Warten auf Bestätigung über Google...",
  
  // ======= BOOKING - CLIENT FORM PAGE =======
  booking_client_form_badge: "Schritt 4 — Ihre Kontaktdaten",
  booking_client_form_hero_title: "Online-Terminbuchung",
  booking_client_form_hero_subtitle: "Geben Sie Ihre Daten an, damit wir Ihre Buchung bestätigen können",
  
  booking_client_form_label_name: "Name",
  booking_client_form_label_phone: "Telefon",
  booking_client_form_label_email: "E-Mail",
  booking_client_form_label_birth: "Geburtsdatum",
  booking_client_form_label_referral: "Wie haben Sie von uns erfahren?",
  booking_client_form_label_comment: "Kommentar",
  booking_client_form_label_optional: "(optional)",
  
  booking_client_form_placeholder_name: "Ihr vollständiger Name",
  booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
  booking_client_form_placeholder_email: "ihre@email.de",
  booking_client_form_placeholder_comment: "Zusätzliche Informationen oder Wünsche",
  booking_client_form_placeholder_referral_other: "Bitte angeben",
  
  booking_client_form_referral_select: "Wählen Sie eine Option",
  booking_client_form_referral_google: "Google",
  booking_client_form_referral_facebook: "Facebook",
  booking_client_form_referral_instagram: "Instagram",
  booking_client_form_referral_friends: "Empfehlung von Freunden",
  booking_client_form_referral_other: "Andere",
  
  booking_client_form_error_name: "Bitte geben Sie Ihren vollständigen Namen an",
  booking_client_form_error_phone: "Bitte geben Sie eine gültige Telefonnummer an",
  booking_client_form_error_email_required: "E-Mail ist erforderlich",
  booking_client_form_error_email_invalid: "Ungültige E-Mail",
  booking_client_form_error_email_not_verified: "E-Mail nicht bestätigt",
  booking_client_form_error_birth_required: "Geburtsdatum ist erforderlich",
  booking_client_form_error_birth_future: "Zukünftiges Datum ist nicht zulässig",
  booking_client_form_error_birth_underage: "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
  booking_client_form_error_referral: "Wählen Sie eine Option",
  booking_client_form_error_referral_other: "Bitte angeben",
  
  booking_client_form_email_checking: "E-Mail wird überprüft…",
  booking_client_form_email_verified: "E-Mail bestätigt",
  
  booking_client_form_age_requirement: "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
  booking_client_form_email_error_note: "Wenn Sie einen Fehler in der Adresse machen, können Sie trotzdem zum Termin kommen, erhalten aber keine Erinnerungen und Bestätigungen.",
  
  booking_client_form_button_back: "Zurück",
  booking_client_form_button_submit: "Buchen",
  booking_client_form_button_submitting: "Daten werden überprüft…",
  
  booking_client_form_info_title: "Warum benötigen wir Ihre E-Mail?",
  booking_client_form_info_point_1: "An Ihre E-Mail senden wir",
  booking_client_form_info_point_1_highlight: "die Buchungsbestätigung und alle Details",
  booking_client_form_info_point_2: "Sie erhalten",
  booking_client_form_info_point_2_highlight: "eine Erinnerung vor Ihrem Besuch",
  booking_client_form_info_point_3: "Wir behandeln personenbezogene Daten sorgfältig und verwenden Ihre E-Mail nur für die Bearbeitung Ihrer Buchung",
  
  booking_client_form_invalid_params: "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
  booking_client_form_invalid_return: "Zurück zur Dienstleistungsauswahl",

  booking_verify_badge: "Schritt 5 — E-Mail-Bestätigung",
  booking_verify_hero_title: "Buchungsbestätigung",
  booking_verify_hero_subtitle: "Überprüfen Sie Ihre E-Mail und geben Sie den Code ein",
  booking_verify_method_title: "Bestätigungsmethode",
  booking_verify_code_on_email: "Code an",
  booking_verify_method_email_title: "E-Mail",
  booking_verify_method_email_desc: "Code per E-Mail erhalten",
  booking_verify_method_google_title: "Google",
  booking_verify_method_google_desc: "Schnelle Verifizierung",
  booking_verify_method_telegram_title: "Telegram",
  booking_verify_method_telegram_desc: "Code in Telegram",
  booking_verify_method_whatsapp_title: "WhatsApp",
  booking_verify_method_whatsapp_desc: "Bald verfügbar",
  booking_verify_email_confirm_title: "Bestätigen Sie Ihre E-Mail",
  booking_verify_email_confirm_desc: "Wir senden einen einmaligen 6-stelligen Code an",
  booking_verify_email_label: "E-Mail zur Bestätigung",
  booking_verify_email_wrong_hint: "Falls die E-Mail falsch ist, gehen Sie zum vorherigen Schritt zurück",
  booking_verify_email_send_code: "Code senden",
  booking_verify_email_sending: "Wird gesendet…",
  booking_verify_email_arrives_hint: "Der Code kommt innerhalb weniger Sekunden an",
  booking_verify_email_enter_code: "Geben Sie den 6-stelligen Code ein",
  booking_verify_email_code_valid: "Der Code ist begrenzt gültig",
  booking_verify_email_confirm_code: "Code bestätigen",
  booking_verify_email_checking: "Wird überprüft…",
  booking_verify_email_resend: "Code erneut senden",
  booking_verify_info_title: "Sichere Bestätigung",
  booking_verify_info_desc: "Wir verwenden einen Einmalcode zum Schutz Ihrer Daten und des Salon-Zeitplans",
  booking_verify_info_arrives: "Der Code kommt in 1-2 Minuten an",
  booking_verify_info_check_spam: "Prüfen Sie den Spam-Ordner",
  booking_verify_info_check_email: "Vergewissern Sie sich, dass die E-Mail korrekt ist",
  booking_verify_info_resend_if_needed: "Fordern Sie bei Bedarf einen neuen Code an",
  booking_verify_info_progress_title: "Ihr Fortschritt",
  booking_verify_info_progress_1: "Dienstleistung und Meister ausgewählt",
  booking_verify_info_progress_2: "Datum und Uhrzeit angegeben",
  booking_verify_info_progress_3: "Kontaktdaten ausgefüllt",
  booking_verify_info_progress_4: "Jetzt — E-Mail-Bestätigung",
  booking_verify_info_progress_5: "Als nächstes — Zahlung",
  booking_verify_info_support: "Bei Schwierigkeiten kontaktieren Sie uns — wir helfen Ihnen, die Buchung abzuschließen",
  booking_verify_invalid_params: "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
  booking_verify_invalid_return: "Zurück zur Dienstleistungsauswahl",
  booking_verify_google_title: "Über Google bestätigen",
  booking_verify_google_desc: "Melden Sie sich mit Ihrem Google-Konto an für eine schnelle und sichere Bestätigung Ihrer Buchung.",
  booking_verify_google_preparing: "Autorisierung wird vorbereitet...",
  booking_verify_google_open_button: "Mit Google anmelden",
  booking_verify_google_reopen_button: "Google erneut öffnen",
  booking_verify_google_waiting: "Warten auf Bestätigung von Google...",
  booking_verify_google_how_title: "So funktioniert es:",
  booking_verify_google_how_step_1: "Ein Google-Anmeldefenster öffnet sich",
  booking_verify_google_how_step_2: "Wählen Sie Ihr Google-Konto",
  booking_verify_google_how_step_3: "Erlauben Sie Zugriff auf E-Mail",
  booking_verify_google_how_step_4: "Automatische Weiterleitung zur Zahlung",
  booking_verify_google_security_title: "Sicher und zuverlässig",
  booking_verify_google_security_desc: "Wir erhalten keinen Zugriff auf Ihr Google-Passwort. Es wird das offizielle OAuth-Protokoll verwendet.",
  booking_verify_google_success: "✅ Über Google bestätigt! Weiterleitung zur Zahlung...",
  booking_verify_google_preparing_window: "🔐 Google öffnet sich in einem neuen Fenster...",
  booking_verify_google_allow_popups: "⚠️ Erlauben Sie Pop-ups und klicken Sie auf die Schaltfläche unten.",
  booking_verify_telegram_title: "Über Telegram bestätigen",
  booking_verify_telegram_desc_registered: "Code wurde an Telegram Bot gesendet. Prüfen Sie Nachrichten und klicken Sie auf die Bestätigungsschaltfläche.",
  booking_verify_telegram_desc_unregistered: "Telegram öffnet sich automatisch. Sie erhalten einen Code zum Eingeben oder können direkt mit einer Schaltfläche im Bot bestätigen.",
  booking_verify_telegram_sending_code: "Code wird gesendet...",
  booking_verify_telegram_open_button: "Telegram öffnen",
  booking_verify_telegram_reopen_button: "Telegram erneut öffnen",
  booking_verify_telegram_waiting_bot: "Warten auf Bestätigung im Telegram Bot...",
  booking_verify_telegram_waiting: "Warten auf Bestätigung...",
  booking_verify_telegram_divider: "oder",
  booking_verify_telegram_enter_code: "Geben Sie den 6-stelligen Code aus Telegram ein",
  booking_verify_telegram_code_placeholder: "000000",
  booking_verify_telegram_code_valid: "Der Code ist 10 Minuten gültig.",
  booking_verify_telegram_confirm_button: "Code bestätigen",
  booking_verify_telegram_checking: "Wird überprüft...",
  booking_verify_telegram_code_sent: "✈️ Code an Telegram gesendet! Prüfen Sie den Bot und klicken Sie auf die Bestätigungsschaltfläche.",
  booking_verify_telegram_opening: "✈️ Telegram öffnet sich... Warten auf Bestätigung.",
  booking_verify_telegram_click_button: "⚠️ Klicken Sie auf die Schaltfläche unten, um Telegram zu öffnen.",
  booking_verify_telegram_success: "✅ Über Telegram bestätigt! Weiterleitung zur Zahlung...",
  booking_verify_error_enter_code: "Geben Sie den 6-stelligen Code ein",
  booking_verify_success_redirect: "Verifizierung erfolgreich! Weiterleitung zur Zahlung...",

  booking_payment_badge: "Schritt 6 — Zahlung und endgültige Bestätigung",
  booking_payment_hero_title: "Buchung abschließen",
  booking_payment_hero_subtitle: "Wählen Sie die Zahlungsmethode und bestätigen Sie die Buchung",
  booking_payment_appointment_id: "Buchungsnummer:",
  booking_payment_method_title: "Zahlungsmethode",
  booking_payment_onsite_title: "Zahlung im Salon",
  booking_payment_onsite_desc: "Vor Ort",
  booking_payment_onsite_benefit_1: "Bar oder Karte im Salon",
  booking_payment_onsite_benefit_2: "Keine Vorauszahlung",
  booking_payment_onsite_benefit_3: "Zahlung nach der Dienstleistung",
  booking_payment_online_title: "Online-Zahlung",
  booking_payment_online_desc: "Bald verfügbar",
  booking_payment_online_benefit_1: "Karte, Apple Pay, Google Pay",
  booking_payment_online_benefit_2: "In Entwicklung",
  booking_payment_online_benefit_3: "Buchung wird trotzdem bestätigt",
  booking_payment_info_title: "Wie funktioniert das?",
  booking_payment_info_desc: "Das System hat bereits einen Termin im Salon-Zeitplan erstellt. Die Zahlung wird auf der Seite des Salons erfasst. Online-Zahlung wird später hinzugefügt.",
  booking_payment_confirm_button: "Buchung bestätigen",
  booking_payment_confirm_terms: "Durch Klicken auf \"Buchung bestätigen\" stimmen Sie den Salon-Bedingungen zu",
  booking_payment_summary_title: "Buchungszusammenfassung",
  booking_payment_summary_visit: "Ihr Besuch bei SalonElen",
  booking_payment_summary_service: "Dienstleistung aus der Buchung",
  booking_payment_summary_master: "Meister aus der Buchung",
  booking_payment_summary_datetime: "Datum und Uhrzeit nach ID:",
  booking_payment_summary_address: "Salon-Adresse",
  booking_payment_summary_cancellation_title: "Stornierungsbedingungen",
  booking_payment_summary_cancellation_desc: "Wenn Sie nicht kommen können, stornieren Sie bitte im Voraus — dies ermöglicht es, die Zeit für andere Salon-Gäste freizugeben.",
  booking_payment_summary_future_note: "Nach dem Start der Online-Zahlung erscheint hier ein Block zur Auswahl der Zahlungsmethode und des Zahlungsstatus",
  booking_payment_success_title: "Buchung bestätigt!",
  booking_payment_success_desc: "Ihre Buchung wurde erfolgreich bestätigt. Die Zahlung erfolgt im Salon.",
  booking_payment_success_home: "Zur Startseite",
  booking_payment_success_calendar: "Zu Google Calendar hinzufügen",
  booking_payment_success_new: "Neue Buchung erstellen",
  booking_payment_error_title: "Fehler beim Übergang zur Zahlung",
  booking_payment_error_desc: "Wir konnten die Buchungs-ID nicht finden. Möglicherweise ist der Link veraltet oder der E-Mail-Bestätigungsschritt wurde übersprungen.",
  booking_payment_error_return: "Zurück zur Buchung",
  booking_payment_error_missing: "Buchungs-ID fehlt. Bitte beginnen Sie die Buchung erneut.",
  booking_success_page_title: "Online-Buchung",
  booking_success_page_subtitle: "Erfolg",
  booking_success_loading: "Wird geladen...",
  booking_success_loading_data: "Daten werden geladen…",
  booking_success_error_title: "Fehler",
  booking_success_error_not_found: "Buchungs-ID nicht gefunden",
  booking_success_error_load_failed: "Buchungsdaten konnten nicht geladen werden",
  booking_success_error_return: "Zurück zur Buchung",
  booking_success_title: "Buchung bestätigt!",
  booking_success_desc: "Ihre Buchung wurde erfolgreich erstellt. Wir haben eine Bestätigung an Ihre E-Mail gesendet.",
  booking_success_details_title: "Buchungsdetails:",
  booking_success_details_name: "Name",
  booking_success_details_email: "E-Mail",
  booking_success_details_phone: "Telefon",
  booking_success_details_datetime: "Datum und Uhrzeit",
  booking_success_button_new: "Neue Buchung erstellen",
  booking_success_button_home: "Zur Startseite",


  // CALENDAR PAGE – Navigation
  booking_calendar_back_to_master: "Zurück zur Meisterauswahl",

  // Months
  month_january: "Januar",
  month_february: "Februar",
  month_march: "März",
  month_april: "April",
  month_may: "Mai",
  month_june: "Juni",
  month_july: "Juli",
  month_august: "August",
  month_september: "September",
  month_october: "Oktober",
  month_november: "November",
  month_december: "Dezember",

  // Weekdays (short)
  weekday_mon: "Mo",
  weekday_tue: "Di",
  weekday_wed: "Mi",
  weekday_thu: "Do",
  weekday_fri: "Fr",
  weekday_sat: "Sa",
  weekday_sun: "So",

  // Weekdays (full)
  weekday_full_monday: "Montag",
  weekday_full_tuesday: "Dienstag",
  weekday_full_wednesday: "Mittwoch",
  weekday_full_thursday: "Donnerstag",
  weekday_full_friday: "Freitag",
  weekday_full_saturday: "Samstag",
  weekday_full_sunday: "Sonntag",
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
  home_services_card1_title: "Women's haircut",
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
    "Book your appointment online – we'll find the perfect care and style for you.",
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
    "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we'll discuss cooperation.",

  footer_top_title:
    "Your beauty salon with online booking and attention to detail",
  footer_top_text:
    "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
  footer_top_chip_online: "Online booking 24/7",
  footer_top_chip_premium: "Premium service",

  footer_quick_title: "Book your visit in a few clicks",
  footer_quick_text:
    "Online booking is available 24/7 – we'll confirm your appointment as quickly as possible.",
  footer_quick_step1: "Choose a service",
  footer_quick_step2: "Choose a stylist",
  footer_quick_step3: "Confirm the time",
  footer_quick_adv1: "Premium-level online booking",
  footer_quick_adv2: "Convenient time slots for your schedule",

  footer_socials_instagram_hint: "Open the salon's Instagram",
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

  // CALENDAR PAGE – Hero
  booking_calendar_step_badge: "Step 3 — Choose Date and Time",
  booking_calendar_hero_title: "Magic Time for Beauty",
  booking_calendar_hero_subtitle:
    "Choose a convenient date and time – we'll take care of everything else",

  // CALENDAR PAGE – Master Selection
  booking_calendar_master_select_label: "Select",
  booking_calendar_master_label: "Master",
  booking_calendar_master_loading: "Loading masters...",

  // CALENDAR PAGE – Calendar Section
  booking_calendar_select_day_hint: "Choose a convenient day for booking",
  booking_calendar_today_slots: "Today:",
  booking_calendar_slot_singular: "available slot",
  booking_calendar_slot_few: "available slots",
  booking_calendar_slot_many: "available slots",
  booking_calendar_slots_tooltip: "slots",
  booking_calendar_weekend: "Closed",
  booking_calendar_no_slots: "No slots",

  // CALENDAR PAGE – Legend
  booking_calendar_legend_title: "Golden fill shows day availability",
  booking_calendar_legend_loading: "Loading data...",
  booking_calendar_legend_subtitle:
    "The higher the fill, the more bookings",

  // CALENDAR PAGE – Smart Tips
  booking_calendar_smart_tip_label: "💡 Smart Tip",
  booking_calendar_smart_tip_morning:
    "more available slots in the morning (09:00-12:00)",
  booking_calendar_smart_tip_evening:
    "more available slots in the evening (17:00-19:00)",
  booking_calendar_smart_tip_many: "Great choice! Plenty of free time",
  booking_calendar_smart_tip_few: "Book soon — limited slots",

  // CALENDAR PAGE – Selected Date
  booking_calendar_selected_date_label: "Selected date:",

  // CALENDAR PAGE – Time Section
  booking_calendar_time_title: "Available Time",
  booking_calendar_duration_label: "Booking duration:",
  booking_calendar_nearest_slot: "Nearest slot:",
  booking_calendar_minutes_label: "minutes",
  booking_calendar_error_prefix: "⚠️ Error:",
  booking_calendar_no_slots_message: "No available slots for this date.",
  booking_calendar_try_another_day: "Try selecting a nearby day.",
  booking_calendar_vip_badge: "VIP",
  booking_calendar_available_slots: "Available slots:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
  booking_client_choice_title: "How would you like to proceed?",
  booking_client_choice_subtitle: "Choose your preferred registration method",
  booking_client_choice_recommended: "Recommended",
  
  booking_client_google_title: "Quick Registration",
  booking_client_google_description: "Sign in with Google and go straight to payment",
  booking_client_google_benefit_1: "One click to payment",
  booking_client_google_benefit_2: "Auto-fill data",
  booking_client_google_benefit_3: "Safe and secure",
  booking_client_google_benefit_4: "Save time",
  booking_client_google_button: "Start with 1 click",
  booking_client_google_security: "Protected by Google OAuth 2.0",
  booking_client_google_connecting: "Connecting...",
  
  booking_client_form_title: "Fill out form",
  booking_client_form_description: "Traditional method with full control over your data",
  booking_client_form_benefit_1: "Full data control",
  booking_client_form_benefit_2: "No Google account needed",
  booking_client_form_benefit_3: "Familiar process",
  booking_client_form_benefit_4: "Verification via Telegram",
  booking_client_form_button: "Fill out form",
  booking_client_form_security: "Confirmation via Telegram Bot",
  
  booking_client_choice_footer: "Both methods are safe and reliable.",
  booking_client_choice_footer_highlight: "Choose the one that's more convenient for you.",
  
  booking_client_popup_blocked: "Could not open window. Please allow pop-ups in your browser.",
  booking_client_google_error_init: "Google OAuth initialization error",
  booking_client_auth_error: "Authorization error",
  booking_client_auth_waiting: "Waiting for confirmation via Google...",
  
  // ======= BOOKING - CLIENT FORM PAGE =======
  booking_client_form_badge: "Step 4 — Your contact information",
  booking_client_form_hero_title: "Online Booking",
  booking_client_form_hero_subtitle: "Provide your details so we can confirm your booking",
  
  booking_client_form_label_name: "Name",
  booking_client_form_label_phone: "Phone",
  booking_client_form_label_email: "E-mail",
  booking_client_form_label_birth: "Date of birth",
  booking_client_form_label_referral: "How did you hear about us?",
  booking_client_form_label_comment: "Comment",
  booking_client_form_label_optional: "(optional)",
  
  booking_client_form_placeholder_name: "Your full name",
  booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
  booking_client_form_placeholder_email: "your@email.com",
  booking_client_form_placeholder_comment: "Additional information or requests",
  booking_client_form_placeholder_referral_other: "Please specify",
  
  booking_client_form_referral_select: "Select an option",
  booking_client_form_referral_google: "Google",
  booking_client_form_referral_facebook: "Facebook",
  booking_client_form_referral_instagram: "Instagram",
  booking_client_form_referral_friends: "Friend's recommendation",
  booking_client_form_referral_other: "Other",
  
  booking_client_form_error_name: "Please provide your full name",
  booking_client_form_error_phone: "Please provide a valid phone number",
  booking_client_form_error_email_required: "E-mail is required",
  booking_client_form_error_email_invalid: "Invalid e-mail",
  booking_client_form_error_email_not_verified: "E-mail not verified",
  booking_client_form_error_birth_required: "Date of birth is required",
  booking_client_form_error_birth_future: "Future date is not allowed",
  booking_client_form_error_birth_underage: "Online booking requires age 16+",
  booking_client_form_error_referral: "Select an option",
  booking_client_form_error_referral_other: "Please specify",
  
  booking_client_form_email_checking: "Verifying e-mail…",
  booking_client_form_email_verified: "E-mail verified",
  
  booking_client_form_age_requirement: "Online booking requires age 16+",
  booking_client_form_email_error_note: "If you make a mistake in the address, you can still come to the appointment, but you won't receive reminders and confirmations.",
  
  booking_client_form_button_back: "Back",
  booking_client_form_button_submit: "Book",
  booking_client_form_button_submitting: "Verifying data…",
  
  booking_client_form_info_title: "Why do we ask for your e-mail?",
  booking_client_form_info_point_1: "We will send to your e-mail",
  booking_client_form_info_point_1_highlight: "booking confirmation and all details",
  booking_client_form_info_point_2: "You will receive",
  booking_client_form_info_point_2_highlight: "a reminder before your visit",
  booking_client_form_info_point_3: "We carefully handle personal data and use your e-mail only for your booking service",
  
  booking_client_form_invalid_params: "Invalid parameters. Please start the booking again.",
  booking_client_form_invalid_return: "Return to service selection",

  booking_verify_badge: "Step 5 — Email Confirmation",
  booking_verify_hero_title: "Booking Confirmation",
  booking_verify_hero_subtitle: "Check your email and enter the code",
  booking_verify_method_title: "Confirmation method",
  booking_verify_code_on_email: "Code to",
  booking_verify_method_email_title: "Email",
  booking_verify_method_email_desc: "Get code by email",
  booking_verify_method_google_title: "Google",
  booking_verify_method_google_desc: "Quick verification",
  booking_verify_method_telegram_title: "Telegram",
  booking_verify_method_telegram_desc: "Code in Telegram",
  booking_verify_method_whatsapp_title: "WhatsApp",
  booking_verify_method_whatsapp_desc: "Coming soon",
  booking_verify_email_confirm_title: "Confirm your email",
  booking_verify_email_confirm_desc: "We'll send a one-time 6-digit code to",
  booking_verify_email_label: "Email for confirmation",
  booking_verify_email_wrong_hint: "If email is incorrect, go back to the previous step",
  booking_verify_email_send_code: "Send code",
  booking_verify_email_sending: "Sending…",
  booking_verify_email_arrives_hint: "Code arrives within a few seconds",
  booking_verify_email_enter_code: "Enter 6-digit code",
  booking_verify_email_code_valid: "Code is valid for limited time",
  booking_verify_email_confirm_code: "Confirm code",
  booking_verify_email_checking: "Checking…",
  booking_verify_email_resend: "Resend code",
  booking_verify_info_title: "Secure Confirmation",
  booking_verify_info_desc: "We use a one-time code to protect your data and salon schedule",
  booking_verify_info_arrives: "Code arrives in 1-2 minutes",
  booking_verify_info_check_spam: "Check spam folder",
  booking_verify_info_check_email: "Make sure email is correct",
  booking_verify_info_resend_if_needed: "Request a new code if needed",
  booking_verify_info_progress_title: "Your Progress",
  booking_verify_info_progress_1: "Selected service and master",
  booking_verify_info_progress_2: "Specified date and time",
  booking_verify_info_progress_3: "Filled contact details",
  booking_verify_info_progress_4: "Now — email confirmation",
  booking_verify_info_progress_5: "Next — payment",
  booking_verify_info_support: "If you have difficulties, contact us — we'll help complete the booking",
  booking_verify_invalid_params: "Invalid parameters. Please start the booking again.",
  booking_verify_invalid_return: "Return to service selection",
  booking_verify_google_title: "Confirm via Google",
  booking_verify_google_desc: "Sign in with your Google account for quick and secure booking confirmation.",
  booking_verify_google_preparing: "Preparing authorization...",
  booking_verify_google_open_button: "Sign in with Google",
  booking_verify_google_reopen_button: "Reopen Google",
  booking_verify_google_waiting: "Waiting for confirmation from Google...",
  booking_verify_google_how_title: "How it works:",
  booking_verify_google_how_step_1: "Google sign-in window will open",
  booking_verify_google_how_step_2: "Select your Google account",
  booking_verify_google_how_step_3: "Allow email access",
  booking_verify_google_how_step_4: "Automatic redirect to payment",
  booking_verify_google_security_title: "Safe and secure",
  booking_verify_google_security_desc: "We don't get access to your Google password. Official OAuth protocol is used.",
  booking_verify_google_success: "✅ Confirmed via Google! Redirecting to payment...",
  booking_verify_google_preparing_window: "🔐 Google will open in a new window...",
  booking_verify_google_allow_popups: "⚠️ Allow pop-ups and click the button below.",
  booking_verify_telegram_title: "Confirm via Telegram",
  booking_verify_telegram_desc_registered: "Code sent to Telegram bot. Check messages and click the confirmation button.",
  booking_verify_telegram_desc_unregistered: "Telegram will open automatically. You'll get a code to enter or can confirm directly with a button in the bot.",
  booking_verify_telegram_sending_code: "Sending code...",
  booking_verify_telegram_open_button: "Open Telegram",
  booking_verify_telegram_reopen_button: "Reopen Telegram",
  booking_verify_telegram_waiting_bot: "Waiting for confirmation in Telegram bot...",
  booking_verify_telegram_waiting: "Waiting for confirmation...",
  booking_verify_telegram_divider: "or",
  booking_verify_telegram_enter_code: "Enter 6-digit code from Telegram",
  booking_verify_telegram_code_placeholder: "000000",
  booking_verify_telegram_code_valid: "Code is valid for 10 minutes.",
  booking_verify_telegram_confirm_button: "Confirm code",
  booking_verify_telegram_checking: "Checking...",
  booking_verify_telegram_code_sent: "✈️ Code sent to Telegram! Check the bot and click the confirmation button.",
  booking_verify_telegram_opening: "✈️ Telegram is opening... Waiting for confirmation.",
  booking_verify_telegram_click_button: "⚠️ Click the button below to open Telegram.",
  booking_verify_telegram_success: "✅ Confirmed via Telegram! Redirecting to payment...",
  booking_verify_error_enter_code: "Enter 6-digit code",
  booking_verify_success_redirect: "Verification successful! Redirecting to payment...",

  booking_payment_badge: "Step 6 — Payment and Final Confirmation",
  booking_payment_hero_title: "Complete Booking",
  booking_payment_hero_subtitle: "Choose payment method and confirm your booking",
  booking_payment_appointment_id: "Booking number:",
  booking_payment_method_title: "Payment Method",
  booking_payment_onsite_title: "Pay at Salon",
  booking_payment_onsite_desc: "On-site",
  booking_payment_onsite_benefit_1: "Cash or card at salon",
  booking_payment_onsite_benefit_2: "No prepayment",
  booking_payment_onsite_benefit_3: "Pay after service",
  booking_payment_online_title: "Online Payment",
  booking_payment_online_desc: "Coming soon",
  booking_payment_online_benefit_1: "Card, Apple Pay, Google Pay",
  booking_payment_online_benefit_2: "In development",
  booking_payment_online_benefit_3: "Booking will be confirmed anyway",
  booking_payment_info_title: "How it works?",
  booking_payment_info_desc: "The system has already created an appointment in the salon schedule. Payment is recorded on the salon side. Online payment will be added later.",
  booking_payment_confirm_button: "Confirm Booking",
  booking_payment_confirm_terms: "By clicking \"Confirm Booking\", you agree to the salon terms",
  booking_payment_summary_title: "Booking Summary",
  booking_payment_summary_visit: "Your visit to SalonElen",
  booking_payment_summary_service: "Service from booking",
  booking_payment_summary_master: "Master from booking",
  booking_payment_summary_datetime: "Date and time by ID:",
  booking_payment_summary_address: "Salon address",
  booking_payment_summary_cancellation_title: "Cancellation Policy",
  booking_payment_summary_cancellation_desc: "If you cannot make it, please cancel in advance — this will free up time for other salon guests.",
  booking_payment_summary_future_note: "After launching online payment, a payment method selection block and payment status will appear here",
  booking_payment_success_title: "Booking Confirmed!",
  booking_payment_success_desc: "Your booking has been successfully confirmed. Payment will be made at the salon.",
  booking_payment_success_home: "Go to Home",
  booking_payment_success_calendar: "Add to Google Calendar",
  booking_payment_success_new: "Make New Booking",
  booking_payment_error_title: "Error Proceeding to Payment",
  booking_payment_error_desc: "We couldn't find the booking ID. Perhaps the link is outdated or the email confirmation step was skipped.",
  booking_payment_error_return: "Return to Booking",
  booking_payment_error_missing: "Booking ID is missing. Please start the booking again.",
  booking_success_page_title: "Online Booking",
  booking_success_page_subtitle: "Success",
  booking_success_loading: "Loading...",
  booking_success_loading_data: "Loading data…",
  booking_success_error_title: "Error",
  booking_success_error_not_found: "Booking ID not found",
  booking_success_error_load_failed: "Failed to load booking data",
  booking_success_error_return: "Return to Booking",
  booking_success_title: "Booking Confirmed!",
  booking_success_desc: "Your booking has been successfully created. We've sent a confirmation to your email.",
  booking_success_details_title: "Booking Details:",
  booking_success_details_name: "Name",
  booking_success_details_email: "Email",
  booking_success_details_phone: "Phone",
  booking_success_details_datetime: "Date and Time",
  booking_success_button_new: "Create New Booking",
  booking_success_button_home: "Go to Home",


  // CALENDAR PAGE – Navigation
  booking_calendar_back_to_master: "Back to Master Selection",

  // Months
  month_january: "January",
  month_february: "February",
  month_march: "March",
  month_april: "April",
  month_may: "May",
  month_june: "June",
  month_july: "July",
  month_august: "August",
  month_september: "September",
  month_october: "October",
  month_november: "November",
  month_december: "December",

  // Weekdays (short)
  weekday_mon: "Mon",
  weekday_tue: "Tue",
  weekday_wed: "Wed",
  weekday_thu: "Thu",
  weekday_fri: "Fri",
  weekday_sat: "Sat",
  weekday_sun: "Sun",

  // Weekdays (full)
  weekday_full_monday: "Monday",
  weekday_full_tuesday: "Tuesday",
  weekday_full_wednesday: "Wednesday",
  weekday_full_thursday: "Thursday",
  weekday_full_friday: "Friday",
  weekday_full_saturday: "Saturday",
  weekday_full_sunday: "Sunday",
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




//------------добовляем словарь для оплаты------
// // src/i18n/messages.ts
// import type { Locale } from "./locales";

// // Все текстовые ключи проекта
// export type BaseMessages = {
//   // ======= Навигация =======
//   nav_home: string;
//   nav_services: string;
//   nav_prices: string;
//   nav_contacts: string;
//   nav_news: string;
//   nav_about: string;
//   nav_admin: string;

//   // ======= HERO (главная) =======
//   hero_tagline: string;
//   hero_subtitle: string;
//   hero_cta_book: string;
//   hero_cta_services: string;
//   hero_badge: string;

//   // ======= Главная – «Популярные услуги» =======
//   home_services_title: string;
//   home_services_subtitle: string;
//   home_services_card1_title: string;
//   home_services_card1_text: string;
//   home_services_card2_title: string;
//   home_services_card2_text: string;
//   home_services_card3_title: string;
//   home_services_card3_text: string;

//   // ======= Главная – «Новости и статьи» =======
//   home_news_title: string;
//   home_news_subtitle: string;
//   home_news_empty: string;

//   // ======= Главная – нижний CTA =======
//   home_cta_title: string;
//   home_cta_text: string;
//   home_cta_button: string;

//   // ======= Авторизация =======
//   auth_login: string;
//   auth_logout: string;

//   // ======= Футер – общий блок салона =======
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования (progress bar)
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_date: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;

//   // Загрузка / ошибки (общие)
//   booking_loading_text: string;
//   booking_error_loading: string;
//   booking_error_retry: string;

//   // SERVICES PAGE – Hero блока выбора услуги
//   booking_hero_badge: string;
//   booking_hero_title: string;
//   booking_hero_subtitle: string;

//   // SERVICES PAGE – категории и карточки
//   booking_category_all: string;
//   booking_price_on_request: string;
//   booking_minutes: string;
//   booking_bar_selected_label: string;
//   booking_minutes_short: string;

//   // Кнопки / общий UI
//   booking_continue: string;

//   // ==== MASTER PAGE ====

//   // Карточка мастера
//   booking_master_vip_badge: string;
//   booking_master_default_bio: string;
//   booking_master_online_booking: string;
//   booking_master_premium: string;

//   // Ошибки и состояния
//   booking_master_no_services: string;
//   booking_master_load_error: string;
//   booking_master_no_available: string;
//   booking_master_different_masters: string;
//   booking_master_choose_same_specialist: string;
//   booking_master_back_to_services: string;

//   // Hero мастера
//   booking_master_step_title: string;
//   booking_master_hero_title: string;
//   booking_master_hero_subtitle: string;
//   booking_master_back_button: string;

//   // Общий заголовок ошибок
//   booking_error_title: string;

//   // ==== CALENDAR PAGE ====

//   // Hero
//   booking_calendar_step_badge: string;
//   booking_calendar_hero_title: string;
//   booking_calendar_hero_subtitle: string;

//   // Master Selection
//   booking_calendar_master_select_label: string;
//   booking_calendar_master_label: string;
//   booking_calendar_master_loading: string;

//   // Calendar Section
//   booking_calendar_select_day_hint: string;
//   booking_calendar_today_slots: string;
//   booking_calendar_slot_singular: string;
//   booking_calendar_slot_few: string;
//   booking_calendar_slot_many: string;
//   booking_calendar_slots_tooltip: string;
//   booking_calendar_weekend: string;
//   booking_calendar_no_slots: string;

//   // Legend
//   booking_calendar_legend_title: string;
//   booking_calendar_legend_loading: string;
//   booking_calendar_legend_subtitle: string;

//   // Smart Tips
//   booking_calendar_smart_tip_label: string;
//   booking_calendar_smart_tip_morning: string;
//   booking_calendar_smart_tip_evening: string;
//   booking_calendar_smart_tip_many: string;
//   booking_calendar_smart_tip_few: string;

//   // Selected Date
//   booking_calendar_selected_date_label: string;

//   // Time Section
//   booking_calendar_time_title: string;
//   booking_calendar_duration_label: string;
//   booking_calendar_nearest_slot: string;
//   booking_calendar_minutes_label: string;
//   booking_calendar_error_prefix: string;
//   booking_calendar_no_slots_message: string;
//   booking_calendar_try_another_day: string;
//   booking_calendar_vip_badge: string;
//   booking_calendar_available_slots: string;
//   // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: string;
//   booking_client_choice_subtitle: string;
//   booking_client_choice_recommended: string;
  
//   booking_client_google_title: string;
//   booking_client_google_description: string;
//   booking_client_google_benefit_1: string;
//   booking_client_google_benefit_2: string;
//   booking_client_google_benefit_3: string;
//   booking_client_google_benefit_4: string;
//   booking_client_google_button: string;
//   booking_client_google_security: string;
//   booking_client_google_connecting: string;
  
//   booking_client_form_title: string;
//   booking_client_form_description: string;
//   booking_client_form_benefit_1: string;
//   booking_client_form_benefit_2: string;
//   booking_client_form_benefit_3: string;
//   booking_client_form_benefit_4: string;
//   booking_client_form_button: string;
//   booking_client_form_security: string;
  
//   booking_client_choice_footer: string;
//   booking_client_choice_footer_highlight: string;
  
//   booking_client_popup_blocked: string;
//   booking_client_google_error_init: string;
//   booking_client_auth_error: string;
//   booking_client_auth_waiting: string;
  
//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: string;
//   booking_client_form_hero_title: string;
//   booking_client_form_hero_subtitle: string;
  
//   booking_client_form_label_name: string;
//   booking_client_form_label_phone: string;
//   booking_client_form_label_email: string;
//   booking_client_form_label_birth: string;
//   booking_client_form_label_referral: string;
//   booking_client_form_label_comment: string;
//   booking_client_form_label_optional: string;
  
//   booking_client_form_placeholder_name: string;
//   booking_client_form_placeholder_phone: string;
//   booking_client_form_placeholder_email: string;
//   booking_client_form_placeholder_comment: string;
//   booking_client_form_placeholder_referral_other: string;
  
//   booking_client_form_referral_select: string;
//   booking_client_form_referral_google: string;
//   booking_client_form_referral_facebook: string;
//   booking_client_form_referral_instagram: string;
//   booking_client_form_referral_friends: string;
//   booking_client_form_referral_other: string;
  
//   booking_client_form_error_name: string;
//   booking_client_form_error_phone: string;
//   booking_client_form_error_email_required: string;
//   booking_client_form_error_email_invalid: string;
//   booking_client_form_error_email_not_verified: string;
//   booking_client_form_error_birth_required: string;
//   booking_client_form_error_birth_future: string;
//   booking_client_form_error_birth_underage: string;
//   booking_client_form_error_referral: string;
//   booking_client_form_error_referral_other: string;
  
//   booking_client_form_email_checking: string;
//   booking_client_form_email_verified: string;
  
//   booking_client_form_age_requirement: string;
//   booking_client_form_email_error_note: string;
  
//   booking_client_form_button_back: string;
//   booking_client_form_button_submit: string;
//   booking_client_form_button_submitting: string;
  
//   booking_client_form_info_title: string;
//   booking_client_form_info_point_1: string;
//   booking_client_form_info_point_1_highlight: string;
//   booking_client_form_info_point_2: string;
//   booking_client_form_info_point_2_highlight: string;
//   booking_client_form_info_point_3: string;
  
//   booking_client_form_invalid_params: string;
//   booking_client_form_invalid_return: string;
  
//   // ======= BOOKING - VERIFY PAGE =======
//   booking_verify_badge: string;
//   booking_verify_hero_title: string;
//   booking_verify_hero_subtitle: string;
//   booking_verify_method_title: string;
//   booking_verify_code_on_email: string;
  
//   booking_verify_method_email_title: string;
//   booking_verify_method_email_desc: string;
//   booking_verify_method_google_title: string;
//   booking_verify_method_google_desc: string;
//   booking_verify_method_telegram_title: string;
//   booking_verify_method_telegram_desc: string;
//   booking_verify_method_whatsapp_title: string;
//   booking_verify_method_whatsapp_desc: string;
  
//   booking_verify_email_confirm_title: string;
//   booking_verify_email_confirm_desc: string;
//   booking_verify_email_label: string;
//   booking_verify_email_wrong_hint: string;
//   booking_verify_email_send_code: string;
//   booking_verify_email_sending: string;
//   booking_verify_email_arrives_hint: string;
//   booking_verify_email_enter_code: string;
//   booking_verify_email_code_valid: string;
//   booking_verify_email_confirm_code: string;
//   booking_verify_email_checking: string;
//   booking_verify_email_resend: string;
  
//   booking_verify_info_title: string;
//   booking_verify_info_desc: string;
//   booking_verify_info_arrives: string;
//   booking_verify_info_check_spam: string;
//   booking_verify_info_check_email: string;
//   booking_verify_info_resend_if_needed: string;
//   booking_verify_info_progress_title: string;
//   booking_verify_info_progress_1: string;
//   booking_verify_info_progress_2: string;
//   booking_verify_info_progress_3: string;
//   booking_verify_info_progress_4: string;
//   booking_verify_info_progress_5: string;
//   booking_verify_info_support: string;
  
//   booking_verify_invalid_params: string;
//   booking_verify_invalid_return: string;
  
//   booking_verify_google_title: string;
//   booking_verify_google_desc: string;
//   booking_verify_google_preparing: string;
//   booking_verify_google_open_button: string;
//   booking_verify_google_reopen_button: string;
//   booking_verify_google_waiting: string;
//   booking_verify_google_how_title: string;
//   booking_verify_google_how_step_1: string;
//   booking_verify_google_how_step_2: string;
//   booking_verify_google_how_step_3: string;
//   booking_verify_google_how_step_4: string;
//   booking_verify_google_security_title: string;
//   booking_verify_google_security_desc: string;
//   booking_verify_google_success: string;
//   booking_verify_google_preparing_window: string;
//   booking_verify_google_allow_popups: string;
  
//   booking_verify_telegram_title: string;
//   booking_verify_telegram_desc_registered: string;
//   booking_verify_telegram_desc_unregistered: string;
//   booking_verify_telegram_sending_code: string;
//   booking_verify_telegram_open_button: string;
//   booking_verify_telegram_reopen_button: string;
//   booking_verify_telegram_waiting_bot: string;
//   booking_verify_telegram_waiting: string;
//   booking_verify_telegram_divider: string;
//   booking_verify_telegram_enter_code: string;
//   booking_verify_telegram_code_placeholder: string;
//   booking_verify_telegram_code_valid: string;
//   booking_verify_telegram_confirm_button: string;
//   booking_verify_telegram_checking: string;
//   booking_verify_telegram_code_sent: string;
//   booking_verify_telegram_opening: string;
//   booking_verify_telegram_click_button: string;
//   booking_verify_telegram_success: string;
  
//   booking_verify_error_enter_code: string;
//   booking_verify_success_redirect: string;



//   // Navigation
//   booking_calendar_back_to_master: string;

//   // Months
//   month_january: string;
//   month_february: string;
//   month_march: string;
//   month_april: string;
//   month_may: string;
//   month_june: string;
//   month_july: string;
//   month_august: string;
//   month_september: string;
//   month_october: string;
//   month_november: string;
//   month_december: string;

//   // Weekdays (short)
//   weekday_mon: string;
//   weekday_tue: string;
//   weekday_wed: string;
//   weekday_thu: string;
//   weekday_fri: string;
//   weekday_sat: string;
//   weekday_sun: string;

//   // Weekdays (full, for smart tips)
//   weekday_full_monday: string;
//   weekday_full_tuesday: string;
//   weekday_full_wednesday: string;
//   weekday_full_thursday: string;
//   weekday_full_friday: string;
//   weekday_full_saturday: string;
//   weekday_full_sunday: string;
// };

// export type MessageKey = keyof BaseMessages;

// /* ==================== RUSSIAN (RU) ==================== */

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

//   // Главная – «Популярные услуги»
//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   // Главная – «Новости и статьи»
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования
//   booking_step_services: "Услуга",
//   booking_step_master: "Мастер",
//   booking_step_date: "Дата",
//   booking_step_client: "Данные",
//   booking_step_verify: "Проверка",
//   booking_step_payment: "Оплата",

//   // SERVICES PAGE – hero (обновлённый вариант «Шаг 1»)
//   booking_hero_badge: "Шаг 1 — Выберите Ваши Услуги",
//   booking_hero_title: "Онлайн-запись",
//   booking_hero_subtitle: "Выберите услуги, которые вам нужны",

//   // Категории и карточки
//   booking_category_all: "Все",
//   booking_price_on_request: "По запросу",
//   booking_minutes: "минут",
//   booking_bar_selected_label: "Выбрано:",
//   booking_minutes_short: "мин",

//   // Кнопки / UI
//   booking_continue: "Продолжить",

//   // Загрузка / ошибки
//   booking_loading_text: "Загружаем услуги…",
//   booking_error_loading: "Ошибка загрузки",
//   booking_error_retry: "Попробовать снова",

//   // MASTER PAGE – карточка мастера
//   booking_master_vip_badge: "VIP Мастер",
//   booking_master_default_bio: "Премиальный мастер салона красоты",
//   booking_master_online_booking: "Онлайн-запись",
//   booking_master_premium: "Премиум мастер",

//   // MASTER PAGE – ошибки и состояния
//   booking_master_no_services: "Услуги не выбраны",
//   booking_master_load_error: "Не удалось загрузить мастеров",
//   booking_master_no_available: "Нет подходящего мастера",
//   booking_master_different_masters: "Выбранные услуги выполняют разные мастера",
//   booking_master_choose_same_specialist:
//     "Выберите набор услуг одного специалиста или вернитесь к выбору",
//   booking_master_back_to_services: "Вернуться к услугам",

//   // MASTER PAGE – hero
//   booking_master_step_title: "Шаг 2 — Выбор Премиум Мастера",
//   booking_master_hero_title: "Выбор мастера",
//   booking_master_hero_subtitle: "Наши эксперты создадут для вас идеальный образ",
//   booking_master_back_button: "Вернуться к выбору услуг",

//   // Общий заголовок ошибок
//   booking_error_title: "Ошибка",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Шаг 3 — Выбор даты и времени",
//   booking_calendar_hero_title: "Волшебное время для красоты",
//   booking_calendar_hero_subtitle:
//     "Выберите удобную дату и время, а мы позаботимся обо всём остальном",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Выберите",
//   booking_calendar_master_label: "Мастер",
//   booking_calendar_master_loading: "Загрузка мастеров...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Выберите удобный день для записи",
//   booking_calendar_today_slots: "Сегодня:",
//   booking_calendar_slot_singular: "свободный слот",
//   booking_calendar_slot_few: "свободных слота",
//   booking_calendar_slot_many: "свободных слотов",
//   booking_calendar_slots_tooltip: "слотов",
//   booking_calendar_weekend: "Выходной",
//   booking_calendar_no_slots: "Нет слотов",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Золотая заливка показывает занятость дня",
//   booking_calendar_legend_loading: "Загрузка данных...",
//   booking_calendar_legend_subtitle: "Чем выше заливка — тем больше записей",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Умный совет",
//   booking_calendar_smart_tip_morning:
//     "больше свободных слотов утром (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "больше свободных слотов вечером (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Отличный выбор! Много свободного времени",
//   booking_calendar_smart_tip_few: "Успейте забронировать — слотов немного",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Выбранная дата:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Доступное время",
//   booking_calendar_duration_label: "Длительность записи:",
//   booking_calendar_nearest_slot: "Ближайший слот:",
//   booking_calendar_minutes_label: "минут",
//   booking_calendar_error_prefix: "⚠️ Ошибка:",
//   booking_calendar_no_slots_message: "На эту дату нет свободных слотов.",
//   booking_calendar_try_another_day: "Попробуйте выбрать соседний день.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Доступно слотов:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "Как вы хотите продолжить?",
//   booking_client_choice_subtitle: "Выберите удобный способ регистрации",
//   booking_client_choice_recommended: "Рекомендуем",
  
//   booking_client_google_title: "Быстрая регистрация",
//   booking_client_google_description: "Войдите через Google и сразу перейдите к оплате",
//   booking_client_google_benefit_1: "Один клик до оплаты",
//   booking_client_google_benefit_2: "Автозаполнение данных",
//   booking_client_google_benefit_3: "Безопасно и надёжно",
//   booking_client_google_benefit_4: "Экономия времени",
//   booking_client_google_button: "Начать за 1 клик",
//   booking_client_google_security: "Защищено Google OAuth 2.0",
//   booking_client_google_connecting: "Подключение...",
  
//   booking_client_form_title: "Заполнить форму",
//   booking_client_form_description: "Традиционный способ с полным контролем над данными",
//   booking_client_form_benefit_1: "Полный контроль данных",
//   booking_client_form_benefit_2: "Без Google аккаунта",
//   booking_client_form_benefit_3: "Привычный процесс",
//   booking_client_form_benefit_4: "Верификация через Telegram",
//   booking_client_form_button: "Заполнить форму",
//   booking_client_form_security: "Подтверждение через Telegram Bot",
  
//   booking_client_choice_footer: "Оба способа безопасны и надёжны.",
//   booking_client_choice_footer_highlight: "Выберите тот, который вам удобнее.",
  
//   booking_client_popup_blocked: "Не удалось открыть окно. Разрешите всплывающие окна в браузере.",
//   booking_client_google_error_init: "Ошибка инициализации Google OAuth",
//   booking_client_auth_error: "Ошибка авторизации",
//   booking_client_auth_waiting: "Ожидаем подтверждение через Google...",
  
//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Шаг 4 — Ваши контактные данные",
//   booking_client_form_hero_title: "Онлайн-запись",
//   booking_client_form_hero_subtitle: "Укажите ваши данные, чтобы мы подтвердили бронь",
  
//   booking_client_form_label_name: "Имя",
//   booking_client_form_label_phone: "Телефон",
//   booking_client_form_label_email: "E-mail",
//   booking_client_form_label_birth: "Дата рождения",
//   booking_client_form_label_referral: "Как вы узнали о нас?",
//   booking_client_form_label_comment: "Комментарий",
//   booking_client_form_label_optional: "(необязательно)",
  
//   booking_client_form_placeholder_name: "Ваше полное имя",
//   booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
//   booking_client_form_placeholder_email: "your@email.com",
//   booking_client_form_placeholder_comment: "Дополнительная информация или пожелания",
//   booking_client_form_placeholder_referral_other: "Уточните источник",
  
//   booking_client_form_referral_select: "Выберите вариант",
//   booking_client_form_referral_google: "Google",
//   booking_client_form_referral_facebook: "Facebook",
//   booking_client_form_referral_instagram: "Instagram",
//   booking_client_form_referral_friends: "Рекомендация друзей",
//   booking_client_form_referral_other: "Другое",
  
//   booking_client_form_error_name: "Укажите имя полностью",
//   booking_client_form_error_phone: "Укажите корректный номер телефона",
//   booking_client_form_error_email_required: "E-mail обязателен",
//   booking_client_form_error_email_invalid: "Некорректный e-mail",
//   booking_client_form_error_email_not_verified: "E-mail не подтверждён",
//   booking_client_form_error_birth_required: "Дата рождения обязательна",
//   booking_client_form_error_birth_future: "Дата в будущем недопустима",
//   booking_client_form_error_birth_underage: "Для онлайн-записи требуется возраст 16+",
//   booking_client_form_error_referral: "Выберите вариант",
//   booking_client_form_error_referral_other: "Уточните источник",
  
//   booking_client_form_email_checking: "Проверка e-mail…",
//   booking_client_form_email_verified: "E-mail подтверждён",
  
//   booking_client_form_age_requirement: "Для онлайн-записи требуется возраст 16+",
//   booking_client_form_email_error_note: "Если вы допустите ошибку в адресе, вы всё равно сможете прийти на приём, но не получите напоминания и подтверждения.",
  
//   booking_client_form_button_back: "Назад",
//   booking_client_form_button_submit: "Забронировать",
//   booking_client_form_button_submitting: "Проверка данных…",
  
//   booking_client_form_info_title: "Почему мы просим e-mail?",
//   booking_client_form_info_point_1: "На ваш e-mail мы отправим",
//   booking_client_form_info_point_1_highlight: "подтверждение брони и все детали записи",
//   booking_client_form_info_point_2: "Вы получите",
//   booking_client_form_info_point_2_highlight: "напоминание перед визитом",
//   booking_client_form_info_point_3: "Мы бережно относимся к персональным данным и используем ваш e-mail только для обслуживания вашей записи",
  
//   booking_client_form_invalid_params: "Некорректные параметры. Пожалуйста, начните запись заново.",
//   booking_client_form_invalid_return: "Вернуться к выбору услуг",

//   booking_verify_badge: "Шаг 5 — Подтверждение email",
//   booking_verify_hero_title: "Подтверждение записи",
//   booking_verify_hero_subtitle: "Проверьте почту и введите код",
//   booking_verify_method_title: "Способ подтверждения",
//   booking_verify_code_on_email: "Код на",
//   booking_verify_method_email_title: "Email",
//   booking_verify_method_email_desc: "Получить код на почту",
//   booking_verify_method_google_title: "Google",
//   booking_verify_method_google_desc: "Быстрая верификация",
//   booking_verify_method_telegram_title: "Telegram",
//   booking_verify_method_telegram_desc: "Код в Telegram",
//   booking_verify_method_whatsapp_title: "WhatsApp",
//   booking_verify_method_whatsapp_desc: "Скоро будет доступно",
//   booking_verify_email_confirm_title: "Подтвердите ваш email",
//   booking_verify_email_confirm_desc: "Мы отправим одноразовый 6-значный код на",
//   booking_verify_email_label: "Почта для подтверждения",
//   booking_verify_email_wrong_hint: "Если email неверный, вернитесь на предыдущий шаг",
//   booking_verify_email_send_code: "Отправить код",
//   booking_verify_email_sending: "Отправка…",
//   booking_verify_email_arrives_hint: "Код приходит в течение нескольких секунд",
//   booking_verify_email_enter_code: "Введите 6-значный код",
//   booking_verify_email_code_valid: "Код действителен ограниченное время",
//   booking_verify_email_confirm_code: "Подтвердить код",
//   booking_verify_email_checking: "Проверка…",
//   booking_verify_email_resend: "Отправить код повторно",
//   booking_verify_info_title: "Безопасное подтверждение",
//   booking_verify_info_desc: "Мы используем одноразовый код для защиты ваших данных и расписания салона",
//   booking_verify_info_arrives: "Код приходит за 1–2 минуты",
//   booking_verify_info_check_spam: "Проверьте папку «Спам»",
//   booking_verify_info_check_email: "Убедитесь в правильности email",
//   booking_verify_info_resend_if_needed: "Запросите код повторно при необходимости",
//   booking_verify_info_progress_title: "Ваш прогресс",
//   booking_verify_info_progress_1: "Выбрали услугу и мастера",
//   booking_verify_info_progress_2: "Указали дату и время",
//   booking_verify_info_progress_3: "Заполнили контактные данные",
//   booking_verify_info_progress_4: "Сейчас — подтверждение email",
//   booking_verify_info_progress_5: "Далее — оплата",
//   booking_verify_info_support: "При возникновении сложностей свяжитесь с нами — мы поможем завершить запись",
//   booking_verify_invalid_params: "Некорректные параметры. Пожалуйста, начните запись заново.",
//   booking_verify_invalid_return: "Вернуться к выбору услуг",
//   booking_verify_google_title: "Подтвердите через Google",
//   booking_verify_google_desc: "Войдите через свой Google аккаунт для быстрого и безопасного подтверждения бронирования.",
//   booking_verify_google_preparing: "Подготовка авторизации...",
//   booking_verify_google_open_button: "Войти через Google",
//   booking_verify_google_reopen_button: "Открыть Google повторно",
//   booking_verify_google_waiting: "Ожидание подтверждения из Google...",
//   booking_verify_google_how_title: "Как это работает:",
//   booking_verify_google_how_step_1: "Откроется окно входа в Google",
//   booking_verify_google_how_step_2: "Выберите свой аккаунт Google",
//   booking_verify_google_how_step_3: "Разрешите доступ к email",
//   booking_verify_google_how_step_4: "Автоматически вернётесь к оплате",
//   booking_verify_google_security_title: "Безопасно и надёжно",
//   booking_verify_google_security_desc: "Мы не получаем доступ к вашему паролю Google. Используется официальный OAuth протокол.",
//   booking_verify_google_success: "✅ Подтверждено через Google! Переход к оплате...",
//   booking_verify_google_preparing_window: "🔐 Google откроется в новом окне...",
//   booking_verify_google_allow_popups: "⚠️ Разрешите всплывающие окна и нажмите кнопку ниже.",
//   booking_verify_telegram_title: "Подтвердите через Telegram",
//   booking_verify_telegram_desc_registered: "Код отправлен в Telegram бот. Проверьте сообщения и нажмите кнопку подтверждения.",
//   booking_verify_telegram_desc_unregistered: "Telegram откроется автоматически. Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте.",
//   booking_verify_telegram_sending_code: "Отправка кода...",
//   booking_verify_telegram_open_button: "Открыть Telegram",
//   booking_verify_telegram_reopen_button: "Открыть Telegram повторно",
//   booking_verify_telegram_waiting_bot: "Ожидание подтверждения в Telegram боте...",
//   booking_verify_telegram_waiting: "Ожидание подтверждения...",
//   booking_verify_telegram_divider: "или",
//   booking_verify_telegram_enter_code: "Введите 6-значный код из Telegram",
//   booking_verify_telegram_code_placeholder: "000000",
//   booking_verify_telegram_code_valid: "Код действителен 10 минут.",
//   booking_verify_telegram_confirm_button: "Подтвердить код",
//   booking_verify_telegram_checking: "Проверка...",
//   booking_verify_telegram_code_sent: "✈️ Код отправлен в Telegram! Проверьте бота и нажмите кнопку подтверждения.",
//   booking_verify_telegram_opening: "✈️ Telegram открывается... Ожидание подтверждения.",
//   booking_verify_telegram_click_button: "⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.",
//   booking_verify_telegram_success: "✅ Подтверждено через Telegram! Переход к оплате...",
//   booking_verify_error_enter_code: "Введите 6-значный код",
//   booking_verify_success_redirect: "Верификация успешна! Переход к оплате...",


//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Вернуться к выбору мастера",

//   // Months
//   month_january: "Январь",
//   month_february: "Февраль",
//   month_march: "Март",
//   month_april: "Апрель",
//   month_may: "Май",
//   month_june: "Июнь",
//   month_july: "Июль",
//   month_august: "Август",
//   month_september: "Сентябрь",
//   month_october: "Октябрь",
//   month_november: "Ноябрь",
//   month_december: "Декабрь",

//   // Weekdays (short)
//   weekday_mon: "Пн",
//   weekday_tue: "Вт",
//   weekday_wed: "Ср",
//   weekday_thu: "Чт",
//   weekday_fri: "Пт",
//   weekday_sat: "Сб",
//   weekday_sun: "Вс",

//   // Weekdays (full)
//   weekday_full_monday: "понедельник",
//   weekday_full_tuesday: "вторник",
//   weekday_full_wednesday: "среду",
//   weekday_full_thursday: "четверг",
//   weekday_full_friday: "пятницу",
//   weekday_full_saturday: "субботу",
//   weekday_full_sunday: "воскресенье",
// };

// /* ==================== GERMAN (DE) ==================== */

// const deMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Startseite",
//   nav_services: "Leistungen",
//   nav_prices: "Preise",
//   nav_contacts: "Kontakt",
//   nav_news: "Neuigkeiten",
//   nav_about: "Über uns",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//   hero_subtitle:
//     "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//   hero_cta_book: "Termin buchen",
//   hero_cta_services: "Alle Leistungen",
//   hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

//   // Home – Popular services
//   home_services_title: "Beliebte Leistungen",
//   home_services_subtitle: "Was wir besonders gut können",
//   home_services_card1_title: "Damenhaarschnitt",
//   home_services_card1_text:
//     "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
//   home_services_card2_title: "Maniküre",
//   home_services_card2_text:
//     "Ästhetik, Hygiene und langanhaltende Beschichtung.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "Wir kreieren ein passendes Make-up für jeden Anlass.",

//   // Home – News
//   home_news_title: "News & Artikel",
//   home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//   home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//   // Home – bottom CTA
//   home_cta_title: "Bereit für eine Veränderung?",
//   home_cta_text:
//     "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//   home_cta_button: "Termin buchen",

//   // Auth
//   auth_login: "Anmelden",
//   auth_logout: "Abmelden",

//   // Footer – salon
//   footer_about_section: "Salon & Standort",
//   footer_about_description:
//     "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

//   footer_location_section: "Unsere Adresse",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Öffnungszeiten",
//   footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
//   footer_hours_saturday: "Sa: 10:00 – 16:00",
//   footer_hours_sunday: "So: geschlossen",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "Für Kunden und Stylisten",

//   footer_socials_section: "Soziale Netzwerke & Messenger",

//   footer_privacy: "Datenschutz",
//   footer_terms: "Nutzungsbedingungen",
//   footer_back_to_top: "Nach oben",

//   footer_copyright: "Alle Rechte vorbehalten.",

//   footer_contacts_title: "Kontaktdaten",

//   footer_client_booking: "Online-Termin",
//   footer_client_cabinet: "Kundenbereich für Buchungen",
//   footer_client_admin: "Kooperation mit Stylisten",
//   footer_client_partnership_title: "Partnerschaft mit Stylisten",
//   footer_client_partnership_text:
//     "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

//   footer_top_title:
//     "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
//   footer_top_text:
//     "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
//   footer_top_chip_online: "Online-Termin 24/7",
//   footer_top_chip_premium: "Premium-Service",

//   footer_quick_title: "In wenigen Klicks zum Termin",
//   footer_quick_text:
//     "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
//   footer_quick_step1: "Leistung wählen",
//   footer_quick_step2: "Stylisten wählen",
//   footer_quick_step3: "Uhrzeit bestätigen",
//   footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
//   footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

//   footer_socials_instagram_hint: "Instagram des Salons öffnen",
//   footer_socials_facebook_hint: "Facebook-Seite öffnen",
//   footer_socials_youtube_hint: "YouTube-Kanal öffnen",

//   footer_messenger_email: "E-Mail schreiben",
//   footer_messenger_call: "Anrufen",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Dienstleistung",
//   booking_step_master: "Meister",
//   booking_step_date: "Datum",
//   booking_step_client: "Daten",
//   booking_step_verify: "Prüfung",
//   booking_step_payment: "Zahlung",

//   booking_loading_text: "Dienstleistungen werden geladen…",
//   booking_error_loading: "Fehler beim Laden",
//   booking_error_retry: "Erneut versuchen",

//   // SERVICES PAGE – hero (step-based)
//   booking_hero_badge: "Schritt 1 — Wählen Sie Ihre Dienstleistungen",
//   booking_hero_title: "Online-Buchung",
//   booking_hero_subtitle: "Wählen Sie die Dienstleistungen, die Sie benötigen",

//   booking_category_all: "Alle",
//   booking_price_on_request: "Auf Anfrage",
//   booking_minutes: "Minuten",
//   booking_bar_selected_label: "Ausgewählt:",
//   booking_minutes_short: "Min",

//   booking_continue: "Weiter",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Meister",
//   booking_master_default_bio: "Premium-Meister des Schönheitssalons",
//   booking_master_online_booking: "Online-Buchung",
//   booking_master_premium: "Premium-Meister",

//   booking_master_no_services: "Keine Dienstleistungen ausgewählt",
//   booking_master_load_error: "Meister konnten nicht geladen werden",
//   booking_master_no_available: "Kein passender Meister",
//   booking_master_different_masters:
//     "Die ausgewählten Dienstleistungen werden von verschiedenen Meistern durchgeführt",
//   booking_master_choose_same_specialist:
//     "Wählen Sie ein Set von Dienstleistungen eines Spezialisten oder kehren Sie zur Auswahl zurück",
//   booking_master_back_to_services: "Zurück zu Dienstleistungen",

//   booking_master_step_title: "Schritt 2 — Auswahl des Premium-Meisters",
//   booking_master_hero_title: "Meisterauswahl",
//   booking_master_hero_subtitle:
//     "Unsere Experten schaffen für Sie das perfekte Bild",
//   booking_master_back_button: "Zurück zur Dienstleistungsauswahl",

//   booking_error_title: "Fehler",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Schritt 3 — Datum und Uhrzeit wählen",
//   booking_calendar_hero_title: "Magische Zeit für Schönheit",
//   booking_calendar_hero_subtitle:
//     "Wählen Sie ein passendes Datum und eine Uhrzeit – wir kümmern uns um alles andere",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Wählen Sie",
//   booking_calendar_master_label: "Meister",
//   booking_calendar_master_loading: "Meister werden geladen...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Wählen Sie einen passenden Tag",
//   booking_calendar_today_slots: "Heute:",
//   booking_calendar_slot_singular: "freier Termin",
//   booking_calendar_slot_few: "freie Termine",
//   booking_calendar_slot_many: "freie Termine",
//   booking_calendar_slots_tooltip: "Termine",
//   booking_calendar_weekend: "Geschlossen",
//   booking_calendar_no_slots: "Keine Termine",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Goldene Füllung zeigt die Auslastung des Tages",
//   booking_calendar_legend_loading: "Daten werden geladen...",
//   booking_calendar_legend_subtitle:
//     "Je höher die Füllung, desto mehr Buchungen",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Intelligenter Tipp",
//   booking_calendar_smart_tip_morning:
//     "mehr freie Termine am Morgen (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "mehr freie Termine am Abend (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Ausgezeichnete Wahl! Viel freie Zeit",
//   booking_calendar_smart_tip_few:
//     "Beeilen Sie sich mit der Buchung — wenige Termine",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Gewähltes Datum:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Verfügbare Zeit",
//   booking_calendar_duration_label: "Buchungsdauer:",
//   booking_calendar_nearest_slot: "Nächster Termin:",
//   booking_calendar_minutes_label: "Minuten",
//   booking_calendar_error_prefix: "⚠️ Fehler:",
//   booking_calendar_no_slots_message:
//     "Für dieses Datum sind keine Termine verfügbar.",
//   booking_calendar_try_another_day: "Versuchen Sie einen anderen Tag.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Verfügbare Termine:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "Wie möchten Sie fortfahren?",
//   booking_client_choice_subtitle: "Wählen Sie eine bequeme Registrierungsmethode",
//   booking_client_choice_recommended: "Empfohlen",
  
//   booking_client_google_title: "Schnelle Registrierung",
//   booking_client_google_description: "Melden Sie sich über Google an und gehen Sie direkt zur Zahlung",
//   booking_client_google_benefit_1: "Ein Klick zur Zahlung",
//   booking_client_google_benefit_2: "Automatisches Ausfüllen",
//   booking_client_google_benefit_3: "Sicher und zuverlässig",
//   booking_client_google_benefit_4: "Zeitersparnis",
//   booking_client_google_button: "Mit 1 Klick starten",
//   booking_client_google_security: "Geschützt durch Google OAuth 2.0",
//   booking_client_google_connecting: "Verbindung wird hergestellt...",
  
//   booking_client_form_title: "Formular ausfüllen",
//   booking_client_form_description: "Traditionelle Methode mit voller Kontrolle über Ihre Daten",
//   booking_client_form_benefit_1: "Volle Datenkontrolle",
//   booking_client_form_benefit_2: "Kein Google-Konto erforderlich",
//   booking_client_form_benefit_3: "Gewohnter Prozess",
//   booking_client_form_benefit_4: "Verifizierung über Telegram",
//   booking_client_form_button: "Formular ausfüllen",
//   booking_client_form_security: "Bestätigung über Telegram Bot",
  
//   booking_client_choice_footer: "Beide Methoden sind sicher und zuverlässig.",
//   booking_client_choice_footer_highlight: "Wählen Sie die für Sie bequemste.",
  
//   booking_client_popup_blocked: "Fenster konnte nicht geöffnet werden. Erlauben Sie Pop-ups in Ihrem Browser.",
//   booking_client_google_error_init: "Fehler bei der Google OAuth-Initialisierung",
//   booking_client_auth_error: "Autorisierungsfehler",
//   booking_client_auth_waiting: "Warten auf Bestätigung über Google...",
  
//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Schritt 4 — Ihre Kontaktdaten",
//   booking_client_form_hero_title: "Online-Terminbuchung",
//   booking_client_form_hero_subtitle: "Geben Sie Ihre Daten an, damit wir Ihre Buchung bestätigen können",
  
//   booking_client_form_label_name: "Name",
//   booking_client_form_label_phone: "Telefon",
//   booking_client_form_label_email: "E-Mail",
//   booking_client_form_label_birth: "Geburtsdatum",
//   booking_client_form_label_referral: "Wie haben Sie von uns erfahren?",
//   booking_client_form_label_comment: "Kommentar",
//   booking_client_form_label_optional: "(optional)",
  
//   booking_client_form_placeholder_name: "Ihr vollständiger Name",
//   booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
//   booking_client_form_placeholder_email: "ihre@email.de",
//   booking_client_form_placeholder_comment: "Zusätzliche Informationen oder Wünsche",
//   booking_client_form_placeholder_referral_other: "Bitte angeben",
  
//   booking_client_form_referral_select: "Wählen Sie eine Option",
//   booking_client_form_referral_google: "Google",
//   booking_client_form_referral_facebook: "Facebook",
//   booking_client_form_referral_instagram: "Instagram",
//   booking_client_form_referral_friends: "Empfehlung von Freunden",
//   booking_client_form_referral_other: "Andere",
  
//   booking_client_form_error_name: "Bitte geben Sie Ihren vollständigen Namen an",
//   booking_client_form_error_phone: "Bitte geben Sie eine gültige Telefonnummer an",
//   booking_client_form_error_email_required: "E-Mail ist erforderlich",
//   booking_client_form_error_email_invalid: "Ungültige E-Mail",
//   booking_client_form_error_email_not_verified: "E-Mail nicht bestätigt",
//   booking_client_form_error_birth_required: "Geburtsdatum ist erforderlich",
//   booking_client_form_error_birth_future: "Zukünftiges Datum ist nicht zulässig",
//   booking_client_form_error_birth_underage: "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
//   booking_client_form_error_referral: "Wählen Sie eine Option",
//   booking_client_form_error_referral_other: "Bitte angeben",
  
//   booking_client_form_email_checking: "E-Mail wird überprüft…",
//   booking_client_form_email_verified: "E-Mail bestätigt",
  
//   booking_client_form_age_requirement: "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
//   booking_client_form_email_error_note: "Wenn Sie einen Fehler in der Adresse machen, können Sie trotzdem zum Termin kommen, erhalten aber keine Erinnerungen und Bestätigungen.",
  
//   booking_client_form_button_back: "Zurück",
//   booking_client_form_button_submit: "Buchen",
//   booking_client_form_button_submitting: "Daten werden überprüft…",
  
//   booking_client_form_info_title: "Warum benötigen wir Ihre E-Mail?",
//   booking_client_form_info_point_1: "An Ihre E-Mail senden wir",
//   booking_client_form_info_point_1_highlight: "die Buchungsbestätigung und alle Details",
//   booking_client_form_info_point_2: "Sie erhalten",
//   booking_client_form_info_point_2_highlight: "eine Erinnerung vor Ihrem Besuch",
//   booking_client_form_info_point_3: "Wir behandeln personenbezogene Daten sorgfältig und verwenden Ihre E-Mail nur für die Bearbeitung Ihrer Buchung",
  
//   booking_client_form_invalid_params: "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
//   booking_client_form_invalid_return: "Zurück zur Dienstleistungsauswahl",

//   booking_verify_badge: "Schritt 5 — E-Mail-Bestätigung",
//   booking_verify_hero_title: "Buchungsbestätigung",
//   booking_verify_hero_subtitle: "Überprüfen Sie Ihre E-Mail und geben Sie den Code ein",
//   booking_verify_method_title: "Bestätigungsmethode",
//   booking_verify_code_on_email: "Code an",
//   booking_verify_method_email_title: "E-Mail",
//   booking_verify_method_email_desc: "Code per E-Mail erhalten",
//   booking_verify_method_google_title: "Google",
//   booking_verify_method_google_desc: "Schnelle Verifizierung",
//   booking_verify_method_telegram_title: "Telegram",
//   booking_verify_method_telegram_desc: "Code in Telegram",
//   booking_verify_method_whatsapp_title: "WhatsApp",
//   booking_verify_method_whatsapp_desc: "Bald verfügbar",
//   booking_verify_email_confirm_title: "Bestätigen Sie Ihre E-Mail",
//   booking_verify_email_confirm_desc: "Wir senden einen einmaligen 6-stelligen Code an",
//   booking_verify_email_label: "E-Mail zur Bestätigung",
//   booking_verify_email_wrong_hint: "Falls die E-Mail falsch ist, gehen Sie zum vorherigen Schritt zurück",
//   booking_verify_email_send_code: "Code senden",
//   booking_verify_email_sending: "Wird gesendet…",
//   booking_verify_email_arrives_hint: "Der Code kommt innerhalb weniger Sekunden an",
//   booking_verify_email_enter_code: "Geben Sie den 6-stelligen Code ein",
//   booking_verify_email_code_valid: "Der Code ist begrenzt gültig",
//   booking_verify_email_confirm_code: "Code bestätigen",
//   booking_verify_email_checking: "Wird überprüft…",
//   booking_verify_email_resend: "Code erneut senden",
//   booking_verify_info_title: "Sichere Bestätigung",
//   booking_verify_info_desc: "Wir verwenden einen Einmalcode zum Schutz Ihrer Daten und des Salon-Zeitplans",
//   booking_verify_info_arrives: "Der Code kommt in 1-2 Minuten an",
//   booking_verify_info_check_spam: "Prüfen Sie den Spam-Ordner",
//   booking_verify_info_check_email: "Vergewissern Sie sich, dass die E-Mail korrekt ist",
//   booking_verify_info_resend_if_needed: "Fordern Sie bei Bedarf einen neuen Code an",
//   booking_verify_info_progress_title: "Ihr Fortschritt",
//   booking_verify_info_progress_1: "Dienstleistung und Meister ausgewählt",
//   booking_verify_info_progress_2: "Datum und Uhrzeit angegeben",
//   booking_verify_info_progress_3: "Kontaktdaten ausgefüllt",
//   booking_verify_info_progress_4: "Jetzt — E-Mail-Bestätigung",
//   booking_verify_info_progress_5: "Als nächstes — Zahlung",
//   booking_verify_info_support: "Bei Schwierigkeiten kontaktieren Sie uns — wir helfen Ihnen, die Buchung abzuschließen",
//   booking_verify_invalid_params: "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
//   booking_verify_invalid_return: "Zurück zur Dienstleistungsauswahl",
//   booking_verify_google_title: "Über Google bestätigen",
//   booking_verify_google_desc: "Melden Sie sich mit Ihrem Google-Konto an für eine schnelle und sichere Bestätigung Ihrer Buchung.",
//   booking_verify_google_preparing: "Autorisierung wird vorbereitet...",
//   booking_verify_google_open_button: "Mit Google anmelden",
//   booking_verify_google_reopen_button: "Google erneut öffnen",
//   booking_verify_google_waiting: "Warten auf Bestätigung von Google...",
//   booking_verify_google_how_title: "So funktioniert es:",
//   booking_verify_google_how_step_1: "Ein Google-Anmeldefenster öffnet sich",
//   booking_verify_google_how_step_2: "Wählen Sie Ihr Google-Konto",
//   booking_verify_google_how_step_3: "Erlauben Sie Zugriff auf E-Mail",
//   booking_verify_google_how_step_4: "Automatische Weiterleitung zur Zahlung",
//   booking_verify_google_security_title: "Sicher und zuverlässig",
//   booking_verify_google_security_desc: "Wir erhalten keinen Zugriff auf Ihr Google-Passwort. Es wird das offizielle OAuth-Protokoll verwendet.",
//   booking_verify_google_success: "✅ Über Google bestätigt! Weiterleitung zur Zahlung...",
//   booking_verify_google_preparing_window: "🔐 Google öffnet sich in einem neuen Fenster...",
//   booking_verify_google_allow_popups: "⚠️ Erlauben Sie Pop-ups und klicken Sie auf die Schaltfläche unten.",
//   booking_verify_telegram_title: "Über Telegram bestätigen",
//   booking_verify_telegram_desc_registered: "Code wurde an Telegram Bot gesendet. Prüfen Sie Nachrichten und klicken Sie auf die Bestätigungsschaltfläche.",
//   booking_verify_telegram_desc_unregistered: "Telegram öffnet sich automatisch. Sie erhalten einen Code zum Eingeben oder können direkt mit einer Schaltfläche im Bot bestätigen.",
//   booking_verify_telegram_sending_code: "Code wird gesendet...",
//   booking_verify_telegram_open_button: "Telegram öffnen",
//   booking_verify_telegram_reopen_button: "Telegram erneut öffnen",
//   booking_verify_telegram_waiting_bot: "Warten auf Bestätigung im Telegram Bot...",
//   booking_verify_telegram_waiting: "Warten auf Bestätigung...",
//   booking_verify_telegram_divider: "oder",
//   booking_verify_telegram_enter_code: "Geben Sie den 6-stelligen Code aus Telegram ein",
//   booking_verify_telegram_code_placeholder: "000000",
//   booking_verify_telegram_code_valid: "Der Code ist 10 Minuten gültig.",
//   booking_verify_telegram_confirm_button: "Code bestätigen",
//   booking_verify_telegram_checking: "Wird überprüft...",
//   booking_verify_telegram_code_sent: "✈️ Code an Telegram gesendet! Prüfen Sie den Bot und klicken Sie auf die Bestätigungsschaltfläche.",
//   booking_verify_telegram_opening: "✈️ Telegram öffnet sich... Warten auf Bestätigung.",
//   booking_verify_telegram_click_button: "⚠️ Klicken Sie auf die Schaltfläche unten, um Telegram zu öffnen.",
//   booking_verify_telegram_success: "✅ Über Telegram bestätigt! Weiterleitung zur Zahlung...",
//   booking_verify_error_enter_code: "Geben Sie den 6-stelligen Code ein",
//   booking_verify_success_redirect: "Verifizierung erfolgreich! Weiterleitung zur Zahlung...",


//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Zurück zur Meisterauswahl",

//   // Months
//   month_january: "Januar",
//   month_february: "Februar",
//   month_march: "März",
//   month_april: "April",
//   month_may: "Mai",
//   month_june: "Juni",
//   month_july: "Juli",
//   month_august: "August",
//   month_september: "September",
//   month_october: "Oktober",
//   month_november: "November",
//   month_december: "Dezember",

//   // Weekdays (short)
//   weekday_mon: "Mo",
//   weekday_tue: "Di",
//   weekday_wed: "Mi",
//   weekday_thu: "Do",
//   weekday_fri: "Fr",
//   weekday_sat: "Sa",
//   weekday_sun: "So",

//   // Weekdays (full)
//   weekday_full_monday: "Montag",
//   weekday_full_tuesday: "Dienstag",
//   weekday_full_wednesday: "Mittwoch",
//   weekday_full_thursday: "Donnerstag",
//   weekday_full_friday: "Freitag",
//   weekday_full_saturday: "Samstag",
//   weekday_full_sunday: "Sonntag",
// };

// /* ==================== ENGLISH (EN) ==================== */

// const enMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Home",
//   nav_services: "Services",
//   nav_prices: "Prices",
//   nav_contacts: "Contacts",
//   nav_news: "News",
//   nav_about: "About us",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – beauty and care in Halle",
//   hero_subtitle:
//     "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//   hero_cta_book: "Book now",
//   hero_cta_services: "All services",
//   hero_badge: "Online booking 24/7 • In the center of Halle",

//   // Home – popular services
//   home_services_title: "Popular services",
//   home_services_subtitle: "What we do best",
//   home_services_card1_title: "Women's haircut",
//   home_services_card1_text: "We highlight your style and individuality.",
//   home_services_card2_title: "Manicure",
//   home_services_card2_text:
//     "Aesthetics, hygiene and long-lasting coating.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "We create the right look for any occasion.",

//   // Home – news
//   home_news_title: "News & articles",
//   home_news_subtitle: "Fresh updates and useful tips",
//   home_news_empty: "No posts have been published yet.",

//   // Home – bottom CTA
//   home_cta_title: "Ready for a change?",
//   home_cta_text:
//     "Book your appointment online – we'll find the perfect care and style for you.",
//   home_cta_button: "Book now",

//   // Auth
//   auth_login: "Sign in",
//   auth_logout: "Sign out",

//   // Footer – salon
//   footer_about_section: "Salon & Location",
//   footer_about_description:
//     "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

//   footer_location_section: "Our address",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Opening hours",
//   footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
//   footer_hours_saturday: "Sat: 10:00 – 16:00",
//   footer_hours_sunday: "Sun: closed",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "For clients and stylists",

//   footer_socials_section: "Social Media & Messengers",

//   footer_privacy: "Privacy Policy",
//   footer_terms: "Terms of Use",
//   footer_back_to_top: "Back to top",

//   footer_copyright: "All rights reserved.",

//   footer_contacts_title: "Contacts",

//   footer_client_booking: "Online booking",
//   footer_client_cabinet: "Client booking account",
//   footer_client_admin: "Stylist cooperation",
//   footer_client_partnership_title: "Partnership with stylists",
//   footer_client_partnership_text:
//     "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we'll discuss cooperation.",

//   footer_top_title:
//     "Your beauty salon with online booking and attention to detail",
//   footer_top_text:
//     "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
//   footer_top_chip_online: "Online booking 24/7",
//   footer_top_chip_premium: "Premium service",

//   footer_quick_title: "Book your visit in a few clicks",
//   footer_quick_text:
//     "Online booking is available 24/7 – we'll confirm your appointment as quickly as possible.",
//   footer_quick_step1: "Choose a service",
//   footer_quick_step2: "Choose a stylist",
//   footer_quick_step3: "Confirm the time",
//   footer_quick_adv1: "Premium-level online booking",
//   footer_quick_adv2: "Convenient time slots for your schedule",

//   footer_socials_instagram_hint: "Open the salon's Instagram",
//   footer_socials_facebook_hint: "Open the Facebook page",
//   footer_socials_youtube_hint: "Open the YouTube channel",

//   footer_messenger_email: "Send an email",
//   footer_messenger_call: "Call us",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Service",
//   booking_step_master: "Master",
//   booking_step_date: "Date",
//   booking_step_client: "Details",
//   booking_step_verify: "Verify",
//   booking_step_payment: "Payment",

//   booking_loading_text: "Loading services…",
//   booking_error_loading: "Loading error",
//   booking_error_retry: "Try Again",

//   // SERVICES PAGE – hero
//   booking_hero_badge: "Step 1 — Choose Your Services",
//   booking_hero_title: "Online Booking",
//   booking_hero_subtitle: "Select the services you need",

//   booking_category_all: "All",
//   booking_price_on_request: "On Request",
//   booking_minutes: "minutes",
//   booking_bar_selected_label: "Selected:",
//   booking_minutes_short: "min",

//   booking_continue: "Continue",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Master",
//   booking_master_default_bio: "Premium beauty salon master",
//   booking_master_online_booking: "Online Booking",
//   booking_master_premium: "Premium Master",

//   booking_master_no_services: "No services selected",
//   booking_master_load_error: "Failed to load masters",
//   booking_master_no_available: "No suitable master",
//   booking_master_different_masters:
//     "Selected services are performed by different masters",
//   booking_master_choose_same_specialist:
//     "Choose a set of services from one specialist or return to selection",
//   booking_master_back_to_services: "Back to Services",

//   booking_master_step_title: "Step 2 — Premium Master Selection",
//   booking_master_hero_title: "Master Selection",
//   booking_master_hero_subtitle: "Our experts will create the perfect look for you",
//   booking_master_back_button: "Back to Service Selection",

//   booking_error_title: "Error",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Step 3 — Choose Date and Time",
//   booking_calendar_hero_title: "Magic Time for Beauty",
//   booking_calendar_hero_subtitle:
//     "Choose a convenient date and time – we'll take care of everything else",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Select",
//   booking_calendar_master_label: "Master",
//   booking_calendar_master_loading: "Loading masters...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Choose a convenient day for booking",
//   booking_calendar_today_slots: "Today:",
//   booking_calendar_slot_singular: "available slot",
//   booking_calendar_slot_few: "available slots",
//   booking_calendar_slot_many: "available slots",
//   booking_calendar_slots_tooltip: "slots",
//   booking_calendar_weekend: "Closed",
//   booking_calendar_no_slots: "No slots",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Golden fill shows day availability",
//   booking_calendar_legend_loading: "Loading data...",
//   booking_calendar_legend_subtitle:
//     "The higher the fill, the more bookings",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Smart Tip",
//   booking_calendar_smart_tip_morning:
//     "more available slots in the morning (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "more available slots in the evening (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Great choice! Plenty of free time",
//   booking_calendar_smart_tip_few: "Book soon — limited slots",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Selected date:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Available Time",
//   booking_calendar_duration_label: "Booking duration:",
//   booking_calendar_nearest_slot: "Nearest slot:",
//   booking_calendar_minutes_label: "minutes",
//   booking_calendar_error_prefix: "⚠️ Error:",
//   booking_calendar_no_slots_message: "No available slots for this date.",
//   booking_calendar_try_another_day: "Try selecting a nearby day.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Available slots:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "How would you like to proceed?",
//   booking_client_choice_subtitle: "Choose your preferred registration method",
//   booking_client_choice_recommended: "Recommended",
  
//   booking_client_google_title: "Quick Registration",
//   booking_client_google_description: "Sign in with Google and go straight to payment",
//   booking_client_google_benefit_1: "One click to payment",
//   booking_client_google_benefit_2: "Auto-fill data",
//   booking_client_google_benefit_3: "Safe and secure",
//   booking_client_google_benefit_4: "Save time",
//   booking_client_google_button: "Start with 1 click",
//   booking_client_google_security: "Protected by Google OAuth 2.0",
//   booking_client_google_connecting: "Connecting...",
  
//   booking_client_form_title: "Fill out form",
//   booking_client_form_description: "Traditional method with full control over your data",
//   booking_client_form_benefit_1: "Full data control",
//   booking_client_form_benefit_2: "No Google account needed",
//   booking_client_form_benefit_3: "Familiar process",
//   booking_client_form_benefit_4: "Verification via Telegram",
//   booking_client_form_button: "Fill out form",
//   booking_client_form_security: "Confirmation via Telegram Bot",
  
//   booking_client_choice_footer: "Both methods are safe and reliable.",
//   booking_client_choice_footer_highlight: "Choose the one that's more convenient for you.",
  
//   booking_client_popup_blocked: "Could not open window. Please allow pop-ups in your browser.",
//   booking_client_google_error_init: "Google OAuth initialization error",
//   booking_client_auth_error: "Authorization error",
//   booking_client_auth_waiting: "Waiting for confirmation via Google...",
  
//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Step 4 — Your contact information",
//   booking_client_form_hero_title: "Online Booking",
//   booking_client_form_hero_subtitle: "Provide your details so we can confirm your booking",
  
//   booking_client_form_label_name: "Name",
//   booking_client_form_label_phone: "Phone",
//   booking_client_form_label_email: "E-mail",
//   booking_client_form_label_birth: "Date of birth",
//   booking_client_form_label_referral: "How did you hear about us?",
//   booking_client_form_label_comment: "Comment",
//   booking_client_form_label_optional: "(optional)",
  
//   booking_client_form_placeholder_name: "Your full name",
//   booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
//   booking_client_form_placeholder_email: "your@email.com",
//   booking_client_form_placeholder_comment: "Additional information or requests",
//   booking_client_form_placeholder_referral_other: "Please specify",
  
//   booking_client_form_referral_select: "Select an option",
//   booking_client_form_referral_google: "Google",
//   booking_client_form_referral_facebook: "Facebook",
//   booking_client_form_referral_instagram: "Instagram",
//   booking_client_form_referral_friends: "Friend's recommendation",
//   booking_client_form_referral_other: "Other",
  
//   booking_client_form_error_name: "Please provide your full name",
//   booking_client_form_error_phone: "Please provide a valid phone number",
//   booking_client_form_error_email_required: "E-mail is required",
//   booking_client_form_error_email_invalid: "Invalid e-mail",
//   booking_client_form_error_email_not_verified: "E-mail not verified",
//   booking_client_form_error_birth_required: "Date of birth is required",
//   booking_client_form_error_birth_future: "Future date is not allowed",
//   booking_client_form_error_birth_underage: "Online booking requires age 16+",
//   booking_client_form_error_referral: "Select an option",
//   booking_client_form_error_referral_other: "Please specify",
  
//   booking_client_form_email_checking: "Verifying e-mail…",
//   booking_client_form_email_verified: "E-mail verified",
  
//   booking_client_form_age_requirement: "Online booking requires age 16+",
//   booking_client_form_email_error_note: "If you make a mistake in the address, you can still come to the appointment, but you won't receive reminders and confirmations.",
  
//   booking_client_form_button_back: "Back",
//   booking_client_form_button_submit: "Book",
//   booking_client_form_button_submitting: "Verifying data…",
  
//   booking_client_form_info_title: "Why do we ask for your e-mail?",
//   booking_client_form_info_point_1: "We will send to your e-mail",
//   booking_client_form_info_point_1_highlight: "booking confirmation and all details",
//   booking_client_form_info_point_2: "You will receive",
//   booking_client_form_info_point_2_highlight: "a reminder before your visit",
//   booking_client_form_info_point_3: "We carefully handle personal data and use your e-mail only for your booking service",
  
//   booking_client_form_invalid_params: "Invalid parameters. Please start the booking again.",
//   booking_client_form_invalid_return: "Return to service selection",

//   booking_verify_badge: "Step 5 — Email Confirmation",
//   booking_verify_hero_title: "Booking Confirmation",
//   booking_verify_hero_subtitle: "Check your email and enter the code",
//   booking_verify_method_title: "Confirmation method",
//   booking_verify_code_on_email: "Code to",
//   booking_verify_method_email_title: "Email",
//   booking_verify_method_email_desc: "Get code by email",
//   booking_verify_method_google_title: "Google",
//   booking_verify_method_google_desc: "Quick verification",
//   booking_verify_method_telegram_title: "Telegram",
//   booking_verify_method_telegram_desc: "Code in Telegram",
//   booking_verify_method_whatsapp_title: "WhatsApp",
//   booking_verify_method_whatsapp_desc: "Coming soon",
//   booking_verify_email_confirm_title: "Confirm your email",
//   booking_verify_email_confirm_desc: "We'll send a one-time 6-digit code to",
//   booking_verify_email_label: "Email for confirmation",
//   booking_verify_email_wrong_hint: "If email is incorrect, go back to the previous step",
//   booking_verify_email_send_code: "Send code",
//   booking_verify_email_sending: "Sending…",
//   booking_verify_email_arrives_hint: "Code arrives within a few seconds",
//   booking_verify_email_enter_code: "Enter 6-digit code",
//   booking_verify_email_code_valid: "Code is valid for limited time",
//   booking_verify_email_confirm_code: "Confirm code",
//   booking_verify_email_checking: "Checking…",
//   booking_verify_email_resend: "Resend code",
//   booking_verify_info_title: "Secure Confirmation",
//   booking_verify_info_desc: "We use a one-time code to protect your data and salon schedule",
//   booking_verify_info_arrives: "Code arrives in 1-2 minutes",
//   booking_verify_info_check_spam: "Check spam folder",
//   booking_verify_info_check_email: "Make sure email is correct",
//   booking_verify_info_resend_if_needed: "Request a new code if needed",
//   booking_verify_info_progress_title: "Your Progress",
//   booking_verify_info_progress_1: "Selected service and master",
//   booking_verify_info_progress_2: "Specified date and time",
//   booking_verify_info_progress_3: "Filled contact details",
//   booking_verify_info_progress_4: "Now — email confirmation",
//   booking_verify_info_progress_5: "Next — payment",
//   booking_verify_info_support: "If you have difficulties, contact us — we'll help complete the booking",
//   booking_verify_invalid_params: "Invalid parameters. Please start the booking again.",
//   booking_verify_invalid_return: "Return to service selection",
//   booking_verify_google_title: "Confirm via Google",
//   booking_verify_google_desc: "Sign in with your Google account for quick and secure booking confirmation.",
//   booking_verify_google_preparing: "Preparing authorization...",
//   booking_verify_google_open_button: "Sign in with Google",
//   booking_verify_google_reopen_button: "Reopen Google",
//   booking_verify_google_waiting: "Waiting for confirmation from Google...",
//   booking_verify_google_how_title: "How it works:",
//   booking_verify_google_how_step_1: "Google sign-in window will open",
//   booking_verify_google_how_step_2: "Select your Google account",
//   booking_verify_google_how_step_3: "Allow email access",
//   booking_verify_google_how_step_4: "Automatic redirect to payment",
//   booking_verify_google_security_title: "Safe and secure",
//   booking_verify_google_security_desc: "We don't get access to your Google password. Official OAuth protocol is used.",
//   booking_verify_google_success: "✅ Confirmed via Google! Redirecting to payment...",
//   booking_verify_google_preparing_window: "🔐 Google will open in a new window...",
//   booking_verify_google_allow_popups: "⚠️ Allow pop-ups and click the button below.",
//   booking_verify_telegram_title: "Confirm via Telegram",
//   booking_verify_telegram_desc_registered: "Code sent to Telegram bot. Check messages and click the confirmation button.",
//   booking_verify_telegram_desc_unregistered: "Telegram will open automatically. You'll get a code to enter or can confirm directly with a button in the bot.",
//   booking_verify_telegram_sending_code: "Sending code...",
//   booking_verify_telegram_open_button: "Open Telegram",
//   booking_verify_telegram_reopen_button: "Reopen Telegram",
//   booking_verify_telegram_waiting_bot: "Waiting for confirmation in Telegram bot...",
//   booking_verify_telegram_waiting: "Waiting for confirmation...",
//   booking_verify_telegram_divider: "or",
//   booking_verify_telegram_enter_code: "Enter 6-digit code from Telegram",
//   booking_verify_telegram_code_placeholder: "000000",
//   booking_verify_telegram_code_valid: "Code is valid for 10 minutes.",
//   booking_verify_telegram_confirm_button: "Confirm code",
//   booking_verify_telegram_checking: "Checking...",
//   booking_verify_telegram_code_sent: "✈️ Code sent to Telegram! Check the bot and click the confirmation button.",
//   booking_verify_telegram_opening: "✈️ Telegram is opening... Waiting for confirmation.",
//   booking_verify_telegram_click_button: "⚠️ Click the button below to open Telegram.",
//   booking_verify_telegram_success: "✅ Confirmed via Telegram! Redirecting to payment...",
//   booking_verify_error_enter_code: "Enter 6-digit code",
//   booking_verify_success_redirect: "Verification successful! Redirecting to payment...",


//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Back to Master Selection",

//   // Months
//   month_january: "January",
//   month_february: "February",
//   month_march: "March",
//   month_april: "April",
//   month_may: "May",
//   month_june: "June",
//   month_july: "July",
//   month_august: "August",
//   month_september: "September",
//   month_october: "October",
//   month_november: "November",
//   month_december: "December",

//   // Weekdays (short)
//   weekday_mon: "Mon",
//   weekday_tue: "Tue",
//   weekday_wed: "Wed",
//   weekday_thu: "Thu",
//   weekday_fri: "Fri",
//   weekday_sat: "Sat",
//   weekday_sun: "Sun",

//   // Weekdays (full)
//   weekday_full_monday: "Monday",
//   weekday_full_tuesday: "Tuesday",
//   weekday_full_wednesday: "Wednesday",
//   weekday_full_thursday: "Thursday",
//   weekday_full_friday: "Friday",
//   weekday_full_saturday: "Saturday",
//   weekday_full_sunday: "Sunday",
// };

// /* ==================== EXPORT ==================== */

// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,
//   de: deMessages,
//   en: enMessages,
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key] ?? key;
// }





//---------добавляю перевод верифкации------
// // src/i18n/messages.ts
// import type { Locale } from "./locales";

// // Все текстовые ключи проекта
// export type BaseMessages = {
//   // ======= Навигация =======
//   nav_home: string;
//   nav_services: string;
//   nav_prices: string;
//   nav_contacts: string;
//   nav_news: string;
//   nav_about: string;
//   nav_admin: string;

//   // ======= HERO (главная) =======
//   hero_tagline: string;
//   hero_subtitle: string;
//   hero_cta_book: string;
//   hero_cta_services: string;
//   hero_badge: string;

//   // ======= Главная – «Популярные услуги» =======
//   home_services_title: string;
//   home_services_subtitle: string;
//   home_services_card1_title: string;
//   home_services_card1_text: string;
//   home_services_card2_title: string;
//   home_services_card2_text: string;
//   home_services_card3_title: string;
//   home_services_card3_text: string;

//   // ======= Главная – «Новости и статьи» =======
//   home_news_title: string;
//   home_news_subtitle: string;
//   home_news_empty: string;

//   // ======= Главная – нижний CTA =======
//   home_cta_title: string;
//   home_cta_text: string;
//   home_cta_button: string;

//   // ======= Авторизация =======
//   auth_login: string;
//   auth_logout: string;

//   // ======= Футер – общий блок салона =======
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования (progress bar)
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_date: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;

//   // Загрузка / ошибки (общие)
//   booking_loading_text: string;
//   booking_error_loading: string;
//   booking_error_retry: string;

//   // SERVICES PAGE – Hero блока выбора услуги
//   booking_hero_badge: string;
//   booking_hero_title: string;
//   booking_hero_subtitle: string;

//   // SERVICES PAGE – категории и карточки
//   booking_category_all: string;
//   booking_price_on_request: string;
//   booking_minutes: string;
//   booking_bar_selected_label: string;
//   booking_minutes_short: string;

//   // Кнопки / общий UI
//   booking_continue: string;

//   // ==== MASTER PAGE ====

//   // Карточка мастера
//   booking_master_vip_badge: string;
//   booking_master_default_bio: string;
//   booking_master_online_booking: string;
//   booking_master_premium: string;

//   // Ошибки и состояния
//   booking_master_no_services: string;
//   booking_master_load_error: string;
//   booking_master_no_available: string;
//   booking_master_different_masters: string;
//   booking_master_choose_same_specialist: string;
//   booking_master_back_to_services: string;

//   // Hero мастера
//   booking_master_step_title: string;
//   booking_master_hero_title: string;
//   booking_master_hero_subtitle: string;
//   booking_master_back_button: string;

//   // Общий заголовок ошибок
//   booking_error_title: string;

//   // ==== CALENDAR PAGE ====

//   // Hero
//   booking_calendar_step_badge: string;
//   booking_calendar_hero_title: string;
//   booking_calendar_hero_subtitle: string;

//   // Master Selection
//   booking_calendar_master_select_label: string;
//   booking_calendar_master_label: string;
//   booking_calendar_master_loading: string;

//   // Calendar Section
//   booking_calendar_select_day_hint: string;
//   booking_calendar_today_slots: string;
//   booking_calendar_slot_singular: string;
//   booking_calendar_slot_few: string;
//   booking_calendar_slot_many: string;
//   booking_calendar_slots_tooltip: string;
//   booking_calendar_weekend: string;
//   booking_calendar_no_slots: string;

//   // Legend
//   booking_calendar_legend_title: string;
//   booking_calendar_legend_loading: string;
//   booking_calendar_legend_subtitle: string;

//   // Smart Tips
//   booking_calendar_smart_tip_label: string;
//   booking_calendar_smart_tip_morning: string;
//   booking_calendar_smart_tip_evening: string;
//   booking_calendar_smart_tip_many: string;
//   booking_calendar_smart_tip_few: string;

//   // Selected Date
//   booking_calendar_selected_date_label: string;

//   // Time Section
//   booking_calendar_time_title: string;
//   booking_calendar_duration_label: string;
//   booking_calendar_nearest_slot: string;
//   booking_calendar_minutes_label: string;
//   booking_calendar_error_prefix: string;
//   booking_calendar_no_slots_message: string;
//   booking_calendar_try_another_day: string;
//   booking_calendar_vip_badge: string;
//   booking_calendar_available_slots: string;
//   // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: string;
//   booking_client_choice_subtitle: string;
//   booking_client_choice_recommended: string;
  
//   booking_client_google_title: string;
//   booking_client_google_description: string;
//   booking_client_google_benefit_1: string;
//   booking_client_google_benefit_2: string;
//   booking_client_google_benefit_3: string;
//   booking_client_google_benefit_4: string;
//   booking_client_google_button: string;
//   booking_client_google_security: string;
//   booking_client_google_connecting: string;
  
//   booking_client_form_title: string;
//   booking_client_form_description: string;
//   booking_client_form_benefit_1: string;
//   booking_client_form_benefit_2: string;
//   booking_client_form_benefit_3: string;
//   booking_client_form_benefit_4: string;
//   booking_client_form_button: string;
//   booking_client_form_security: string;
  
//   booking_client_choice_footer: string;
//   booking_client_choice_footer_highlight: string;
  
//   booking_client_popup_blocked: string;
//   booking_client_google_error_init: string;
//   booking_client_auth_error: string;
//   booking_client_auth_waiting: string;
  
//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: string;
//   booking_client_form_hero_title: string;
//   booking_client_form_hero_subtitle: string;
  
//   booking_client_form_label_name: string;
//   booking_client_form_label_phone: string;
//   booking_client_form_label_email: string;
//   booking_client_form_label_birth: string;
//   booking_client_form_label_referral: string;
//   booking_client_form_label_comment: string;
//   booking_client_form_label_optional: string;
  
//   booking_client_form_placeholder_name: string;
//   booking_client_form_placeholder_phone: string;
//   booking_client_form_placeholder_email: string;
//   booking_client_form_placeholder_comment: string;
//   booking_client_form_placeholder_referral_other: string;
  
//   booking_client_form_referral_select: string;
//   booking_client_form_referral_google: string;
//   booking_client_form_referral_facebook: string;
//   booking_client_form_referral_instagram: string;
//   booking_client_form_referral_friends: string;
//   booking_client_form_referral_other: string;
  
//   booking_client_form_error_name: string;
//   booking_client_form_error_phone: string;
//   booking_client_form_error_email_required: string;
//   booking_client_form_error_email_invalid: string;
//   booking_client_form_error_email_not_verified: string;
//   booking_client_form_error_birth_required: string;
//   booking_client_form_error_birth_future: string;
//   booking_client_form_error_birth_underage: string;
//   booking_client_form_error_referral: string;
//   booking_client_form_error_referral_other: string;
  
//   booking_client_form_email_checking: string;
//   booking_client_form_email_verified: string;
  
//   booking_client_form_age_requirement: string;
//   booking_client_form_email_error_note: string;
  
//   booking_client_form_button_back: string;
//   booking_client_form_button_submit: string;
//   booking_client_form_button_submitting: string;
  
//   booking_client_form_info_title: string;
//   booking_client_form_info_point_1: string;
//   booking_client_form_info_point_1_highlight: string;
//   booking_client_form_info_point_2: string;
//   booking_client_form_info_point_2_highlight: string;
//   booking_client_form_info_point_3: string;
  
//   booking_client_form_invalid_params: string;
//   booking_client_form_invalid_return: string;


//   // Navigation
//   booking_calendar_back_to_master: string;

//   // Months
//   month_january: string;
//   month_february: string;
//   month_march: string;
//   month_april: string;
//   month_may: string;
//   month_june: string;
//   month_july: string;
//   month_august: string;
//   month_september: string;
//   month_october: string;
//   month_november: string;
//   month_december: string;

//   // Weekdays (short)
//   weekday_mon: string;
//   weekday_tue: string;
//   weekday_wed: string;
//   weekday_thu: string;
//   weekday_fri: string;
//   weekday_sat: string;
//   weekday_sun: string;

//   // Weekdays (full, for smart tips)
//   weekday_full_monday: string;
//   weekday_full_tuesday: string;
//   weekday_full_wednesday: string;
//   weekday_full_thursday: string;
//   weekday_full_friday: string;
//   weekday_full_saturday: string;
//   weekday_full_sunday: string;
// };

// export type MessageKey = keyof BaseMessages;

// /* ==================== RUSSIAN (RU) ==================== */

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

//   // Главная – «Популярные услуги»
//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   // Главная – «Новости и статьи»
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования
//   booking_step_services: "Услуга",
//   booking_step_master: "Мастер",
//   booking_step_date: "Дата",
//   booking_step_client: "Данные",
//   booking_step_verify: "Проверка",
//   booking_step_payment: "Оплата",

//   // SERVICES PAGE – hero (обновлённый вариант «Шаг 1»)
//   booking_hero_badge: "Шаг 1 — Выберите Ваши Услуги",
//   booking_hero_title: "Онлайн-запись",
//   booking_hero_subtitle: "Выберите услуги, которые вам нужны",

//   // Категории и карточки
//   booking_category_all: "Все",
//   booking_price_on_request: "По запросу",
//   booking_minutes: "минут",
//   booking_bar_selected_label: "Выбрано:",
//   booking_minutes_short: "мин",

//   // Кнопки / UI
//   booking_continue: "Продолжить",

//   // Загрузка / ошибки
//   booking_loading_text: "Загружаем услуги…",
//   booking_error_loading: "Ошибка загрузки",
//   booking_error_retry: "Попробовать снова",

//   // MASTER PAGE – карточка мастера
//   booking_master_vip_badge: "VIP Мастер",
//   booking_master_default_bio: "Премиальный мастер салона красоты",
//   booking_master_online_booking: "Онлайн-запись",
//   booking_master_premium: "Премиум мастер",

//   // MASTER PAGE – ошибки и состояния
//   booking_master_no_services: "Услуги не выбраны",
//   booking_master_load_error: "Не удалось загрузить мастеров",
//   booking_master_no_available: "Нет подходящего мастера",
//   booking_master_different_masters: "Выбранные услуги выполняют разные мастера",
//   booking_master_choose_same_specialist:
//     "Выберите набор услуг одного специалиста или вернитесь к выбору",
//   booking_master_back_to_services: "Вернуться к услугам",

//   // MASTER PAGE – hero
//   booking_master_step_title: "Шаг 2 — Выбор Премиум Мастера",
//   booking_master_hero_title: "Выбор мастера",
//   booking_master_hero_subtitle: "Наши эксперты создадут для вас идеальный образ",
//   booking_master_back_button: "Вернуться к выбору услуг",

//   // Общий заголовок ошибок
//   booking_error_title: "Ошибка",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Шаг 3 — Выбор даты и времени",
//   booking_calendar_hero_title: "Волшебное время для красоты",
//   booking_calendar_hero_subtitle:
//     "Выберите удобную дату и время, а мы позаботимся обо всём остальном",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Выберите",
//   booking_calendar_master_label: "Мастер",
//   booking_calendar_master_loading: "Загрузка мастеров...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Выберите удобный день для записи",
//   booking_calendar_today_slots: "Сегодня:",
//   booking_calendar_slot_singular: "свободный слот",
//   booking_calendar_slot_few: "свободных слота",
//   booking_calendar_slot_many: "свободных слотов",
//   booking_calendar_slots_tooltip: "слотов",
//   booking_calendar_weekend: "Выходной",
//   booking_calendar_no_slots: "Нет слотов",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Золотая заливка показывает занятость дня",
//   booking_calendar_legend_loading: "Загрузка данных...",
//   booking_calendar_legend_subtitle: "Чем выше заливка — тем больше записей",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Умный совет",
//   booking_calendar_smart_tip_morning:
//     "больше свободных слотов утром (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "больше свободных слотов вечером (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Отличный выбор! Много свободного времени",
//   booking_calendar_smart_tip_few: "Успейте забронировать — слотов немного",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Выбранная дата:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Доступное время",
//   booking_calendar_duration_label: "Длительность записи:",
//   booking_calendar_nearest_slot: "Ближайший слот:",
//   booking_calendar_minutes_label: "минут",
//   booking_calendar_error_prefix: "⚠️ Ошибка:",
//   booking_calendar_no_slots_message: "На эту дату нет свободных слотов.",
//   booking_calendar_try_another_day: "Попробуйте выбрать соседний день.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Доступно слотов:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "Как вы хотите продолжить?",
//   booking_client_choice_subtitle: "Выберите удобный способ регистрации",
//   booking_client_choice_recommended: "Рекомендуем",
  
//   booking_client_google_title: "Быстрая регистрация",
//   booking_client_google_description: "Войдите через Google и сразу перейдите к оплате",
//   booking_client_google_benefit_1: "Один клик до оплаты",
//   booking_client_google_benefit_2: "Автозаполнение данных",
//   booking_client_google_benefit_3: "Безопасно и надёжно",
//   booking_client_google_benefit_4: "Экономия времени",
//   booking_client_google_button: "Начать за 1 клик",
//   booking_client_google_security: "Защищено Google OAuth 2.0",
//   booking_client_google_connecting: "Подключение...",
  
//   booking_client_form_title: "Заполнить форму",
//   booking_client_form_description: "Традиционный способ с полным контролем над данными",
//   booking_client_form_benefit_1: "Полный контроль данных",
//   booking_client_form_benefit_2: "Без Google аккаунта",
//   booking_client_form_benefit_3: "Привычный процесс",
//   booking_client_form_benefit_4: "Верификация через Telegram",
//   booking_client_form_button: "Заполнить форму",
//   booking_client_form_security: "Подтверждение через Telegram Bot",
  
//   booking_client_choice_footer: "Оба способа безопасны и надёжны.",
//   booking_client_choice_footer_highlight: "Выберите тот, который вам удобнее.",
  
//   booking_client_popup_blocked: "Не удалось открыть окно. Разрешите всплывающие окна в браузере.",
//   booking_client_google_error_init: "Ошибка инициализации Google OAuth",
//   booking_client_auth_error: "Ошибка авторизации",
//   booking_client_auth_waiting: "Ожидаем подтверждение через Google...",
  
//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Шаг 4 — Ваши контактные данные",
//   booking_client_form_hero_title: "Онлайн-запись",
//   booking_client_form_hero_subtitle: "Укажите ваши данные, чтобы мы подтвердили бронь",
  
//   booking_client_form_label_name: "Имя",
//   booking_client_form_label_phone: "Телефон",
//   booking_client_form_label_email: "E-mail",
//   booking_client_form_label_birth: "Дата рождения",
//   booking_client_form_label_referral: "Как вы узнали о нас?",
//   booking_client_form_label_comment: "Комментарий",
//   booking_client_form_label_optional: "(необязательно)",
  
//   booking_client_form_placeholder_name: "Ваше полное имя",
//   booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
//   booking_client_form_placeholder_email: "your@email.com",
//   booking_client_form_placeholder_comment: "Дополнительная информация или пожелания",
//   booking_client_form_placeholder_referral_other: "Уточните источник",
  
//   booking_client_form_referral_select: "Выберите вариант",
//   booking_client_form_referral_google: "Google",
//   booking_client_form_referral_facebook: "Facebook",
//   booking_client_form_referral_instagram: "Instagram",
//   booking_client_form_referral_friends: "Рекомендация друзей",
//   booking_client_form_referral_other: "Другое",
  
//   booking_client_form_error_name: "Укажите имя полностью",
//   booking_client_form_error_phone: "Укажите корректный номер телефона",
//   booking_client_form_error_email_required: "E-mail обязателен",
//   booking_client_form_error_email_invalid: "Некорректный e-mail",
//   booking_client_form_error_email_not_verified: "E-mail не подтверждён",
//   booking_client_form_error_birth_required: "Дата рождения обязательна",
//   booking_client_form_error_birth_future: "Дата в будущем недопустима",
//   booking_client_form_error_birth_underage: "Для онлайн-записи требуется возраст 16+",
//   booking_client_form_error_referral: "Выберите вариант",
//   booking_client_form_error_referral_other: "Уточните источник",
  
//   booking_client_form_email_checking: "Проверка e-mail…",
//   booking_client_form_email_verified: "E-mail подтверждён",
  
//   booking_client_form_age_requirement: "Для онлайн-записи требуется возраст 16+",
//   booking_client_form_email_error_note: "Если вы допустите ошибку в адресе, вы всё равно сможете прийти на приём, но не получите напоминания и подтверждения.",
  
//   booking_client_form_button_back: "Назад",
//   booking_client_form_button_submit: "Забронировать",
//   booking_client_form_button_submitting: "Проверка данных…",
  
//   booking_client_form_info_title: "Почему мы просим e-mail?",
//   booking_client_form_info_point_1: "На ваш e-mail мы отправим",
//   booking_client_form_info_point_1_highlight: "подтверждение брони и все детали записи",
//   booking_client_form_info_point_2: "Вы получите",
//   booking_client_form_info_point_2_highlight: "напоминание перед визитом",
//   booking_client_form_info_point_3: "Мы бережно относимся к персональным данным и используем ваш e-mail только для обслуживания вашей записи",
  
//   booking_client_form_invalid_params: "Некорректные параметры. Пожалуйста, начните запись заново.",
//   booking_client_form_invalid_return: "Вернуться к выбору услуг",


//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Вернуться к выбору мастера",

//   // Months
//   month_january: "Январь",
//   month_february: "Февраль",
//   month_march: "Март",
//   month_april: "Апрель",
//   month_may: "Май",
//   month_june: "Июнь",
//   month_july: "Июль",
//   month_august: "Август",
//   month_september: "Сентябрь",
//   month_october: "Октябрь",
//   month_november: "Ноябрь",
//   month_december: "Декабрь",

//   // Weekdays (short)
//   weekday_mon: "Пн",
//   weekday_tue: "Вт",
//   weekday_wed: "Ср",
//   weekday_thu: "Чт",
//   weekday_fri: "Пт",
//   weekday_sat: "Сб",
//   weekday_sun: "Вс",

//   // Weekdays (full)
//   weekday_full_monday: "понедельник",
//   weekday_full_tuesday: "вторник",
//   weekday_full_wednesday: "среду",
//   weekday_full_thursday: "четверг",
//   weekday_full_friday: "пятницу",
//   weekday_full_saturday: "субботу",
//   weekday_full_sunday: "воскресенье",
// };

// /* ==================== GERMAN (DE) ==================== */

// const deMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Startseite",
//   nav_services: "Leistungen",
//   nav_prices: "Preise",
//   nav_contacts: "Kontakt",
//   nav_news: "Neuigkeiten",
//   nav_about: "Über uns",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//   hero_subtitle:
//     "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//   hero_cta_book: "Termin buchen",
//   hero_cta_services: "Alle Leistungen",
//   hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

//   // Home – Popular services
//   home_services_title: "Beliebte Leistungen",
//   home_services_subtitle: "Was wir besonders gut können",
//   home_services_card1_title: "Damenhaarschnitt",
//   home_services_card1_text:
//     "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
//   home_services_card2_title: "Maniküre",
//   home_services_card2_text:
//     "Ästhetik, Hygiene und langanhaltende Beschichtung.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "Wir kreieren ein passendes Make-up für jeden Anlass.",

//   // Home – News
//   home_news_title: "News & Artikel",
//   home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//   home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//   // Home – bottom CTA
//   home_cta_title: "Bereit für eine Veränderung?",
//   home_cta_text:
//     "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//   home_cta_button: "Termin buchen",

//   // Auth
//   auth_login: "Anmelden",
//   auth_logout: "Abmelden",

//   // Footer – salon
//   footer_about_section: "Salon & Standort",
//   footer_about_description:
//     "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

//   footer_location_section: "Unsere Adresse",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Öffnungszeiten",
//   footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
//   footer_hours_saturday: "Sa: 10:00 – 16:00",
//   footer_hours_sunday: "So: geschlossen",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "Für Kunden und Stylisten",

//   footer_socials_section: "Soziale Netzwerke & Messenger",

//   footer_privacy: "Datenschutz",
//   footer_terms: "Nutzungsbedingungen",
//   footer_back_to_top: "Nach oben",

//   footer_copyright: "Alle Rechte vorbehalten.",

//   footer_contacts_title: "Kontaktdaten",

//   footer_client_booking: "Online-Termin",
//   footer_client_cabinet: "Kundenbereich für Buchungen",
//   footer_client_admin: "Kooperation mit Stylisten",
//   footer_client_partnership_title: "Partnerschaft mit Stylisten",
//   footer_client_partnership_text:
//     "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

//   footer_top_title:
//     "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
//   footer_top_text:
//     "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
//   footer_top_chip_online: "Online-Termin 24/7",
//   footer_top_chip_premium: "Premium-Service",

//   footer_quick_title: "In wenigen Klicks zum Termin",
//   footer_quick_text:
//     "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
//   footer_quick_step1: "Leistung wählen",
//   footer_quick_step2: "Stylisten wählen",
//   footer_quick_step3: "Uhrzeit bestätigen",
//   footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
//   footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

//   footer_socials_instagram_hint: "Instagram des Salons öffnen",
//   footer_socials_facebook_hint: "Facebook-Seite öffnen",
//   footer_socials_youtube_hint: "YouTube-Kanal öffnen",

//   footer_messenger_email: "E-Mail schreiben",
//   footer_messenger_call: "Anrufen",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Dienstleistung",
//   booking_step_master: "Meister",
//   booking_step_date: "Datum",
//   booking_step_client: "Daten",
//   booking_step_verify: "Prüfung",
//   booking_step_payment: "Zahlung",

//   booking_loading_text: "Dienstleistungen werden geladen…",
//   booking_error_loading: "Fehler beim Laden",
//   booking_error_retry: "Erneut versuchen",

//   // SERVICES PAGE – hero (step-based)
//   booking_hero_badge: "Schritt 1 — Wählen Sie Ihre Dienstleistungen",
//   booking_hero_title: "Online-Buchung",
//   booking_hero_subtitle: "Wählen Sie die Dienstleistungen, die Sie benötigen",

//   booking_category_all: "Alle",
//   booking_price_on_request: "Auf Anfrage",
//   booking_minutes: "Minuten",
//   booking_bar_selected_label: "Ausgewählt:",
//   booking_minutes_short: "Min",

//   booking_continue: "Weiter",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Meister",
//   booking_master_default_bio: "Premium-Meister des Schönheitssalons",
//   booking_master_online_booking: "Online-Buchung",
//   booking_master_premium: "Premium-Meister",

//   booking_master_no_services: "Keine Dienstleistungen ausgewählt",
//   booking_master_load_error: "Meister konnten nicht geladen werden",
//   booking_master_no_available: "Kein passender Meister",
//   booking_master_different_masters:
//     "Die ausgewählten Dienstleistungen werden von verschiedenen Meistern durchgeführt",
//   booking_master_choose_same_specialist:
//     "Wählen Sie ein Set von Dienstleistungen eines Spezialisten oder kehren Sie zur Auswahl zurück",
//   booking_master_back_to_services: "Zurück zu Dienstleistungen",

//   booking_master_step_title: "Schritt 2 — Auswahl des Premium-Meisters",
//   booking_master_hero_title: "Meisterauswahl",
//   booking_master_hero_subtitle:
//     "Unsere Experten schaffen für Sie das perfekte Bild",
//   booking_master_back_button: "Zurück zur Dienstleistungsauswahl",

//   booking_error_title: "Fehler",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Schritt 3 — Datum und Uhrzeit wählen",
//   booking_calendar_hero_title: "Magische Zeit für Schönheit",
//   booking_calendar_hero_subtitle:
//     "Wählen Sie ein passendes Datum und eine Uhrzeit – wir kümmern uns um alles andere",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Wählen Sie",
//   booking_calendar_master_label: "Meister",
//   booking_calendar_master_loading: "Meister werden geladen...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Wählen Sie einen passenden Tag",
//   booking_calendar_today_slots: "Heute:",
//   booking_calendar_slot_singular: "freier Termin",
//   booking_calendar_slot_few: "freie Termine",
//   booking_calendar_slot_many: "freie Termine",
//   booking_calendar_slots_tooltip: "Termine",
//   booking_calendar_weekend: "Geschlossen",
//   booking_calendar_no_slots: "Keine Termine",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Goldene Füllung zeigt die Auslastung des Tages",
//   booking_calendar_legend_loading: "Daten werden geladen...",
//   booking_calendar_legend_subtitle:
//     "Je höher die Füllung, desto mehr Buchungen",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Intelligenter Tipp",
//   booking_calendar_smart_tip_morning:
//     "mehr freie Termine am Morgen (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "mehr freie Termine am Abend (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Ausgezeichnete Wahl! Viel freie Zeit",
//   booking_calendar_smart_tip_few:
//     "Beeilen Sie sich mit der Buchung — wenige Termine",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Gewähltes Datum:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Verfügbare Zeit",
//   booking_calendar_duration_label: "Buchungsdauer:",
//   booking_calendar_nearest_slot: "Nächster Termin:",
//   booking_calendar_minutes_label: "Minuten",
//   booking_calendar_error_prefix: "⚠️ Fehler:",
//   booking_calendar_no_slots_message:
//     "Für dieses Datum sind keine Termine verfügbar.",
//   booking_calendar_try_another_day: "Versuchen Sie einen anderen Tag.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Verfügbare Termine:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "Wie möchten Sie fortfahren?",
//   booking_client_choice_subtitle: "Wählen Sie eine bequeme Registrierungsmethode",
//   booking_client_choice_recommended: "Empfohlen",
  
//   booking_client_google_title: "Schnelle Registrierung",
//   booking_client_google_description: "Melden Sie sich über Google an und gehen Sie direkt zur Zahlung",
//   booking_client_google_benefit_1: "Ein Klick zur Zahlung",
//   booking_client_google_benefit_2: "Automatisches Ausfüllen",
//   booking_client_google_benefit_3: "Sicher und zuverlässig",
//   booking_client_google_benefit_4: "Zeitersparnis",
//   booking_client_google_button: "Mit 1 Klick starten",
//   booking_client_google_security: "Geschützt durch Google OAuth 2.0",
//   booking_client_google_connecting: "Verbindung wird hergestellt...",
  
//   booking_client_form_title: "Formular ausfüllen",
//   booking_client_form_description: "Traditionelle Methode mit voller Kontrolle über Ihre Daten",
//   booking_client_form_benefit_1: "Volle Datenkontrolle",
//   booking_client_form_benefit_2: "Kein Google-Konto erforderlich",
//   booking_client_form_benefit_3: "Gewohnter Prozess",
//   booking_client_form_benefit_4: "Verifizierung über Telegram",
//   booking_client_form_button: "Formular ausfüllen",
//   booking_client_form_security: "Bestätigung über Telegram Bot",
  
//   booking_client_choice_footer: "Beide Methoden sind sicher und zuverlässig.",
//   booking_client_choice_footer_highlight: "Wählen Sie die für Sie bequemste.",
  
//   booking_client_popup_blocked: "Fenster konnte nicht geöffnet werden. Erlauben Sie Pop-ups in Ihrem Browser.",
//   booking_client_google_error_init: "Fehler bei der Google OAuth-Initialisierung",
//   booking_client_auth_error: "Autorisierungsfehler",
//   booking_client_auth_waiting: "Warten auf Bestätigung über Google...",
  
//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Schritt 4 — Ihre Kontaktdaten",
//   booking_client_form_hero_title: "Online-Terminbuchung",
//   booking_client_form_hero_subtitle: "Geben Sie Ihre Daten an, damit wir Ihre Buchung bestätigen können",
  
//   booking_client_form_label_name: "Name",
//   booking_client_form_label_phone: "Telefon",
//   booking_client_form_label_email: "E-Mail",
//   booking_client_form_label_birth: "Geburtsdatum",
//   booking_client_form_label_referral: "Wie haben Sie von uns erfahren?",
//   booking_client_form_label_comment: "Kommentar",
//   booking_client_form_label_optional: "(optional)",
  
//   booking_client_form_placeholder_name: "Ihr vollständiger Name",
//   booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
//   booking_client_form_placeholder_email: "ihre@email.de",
//   booking_client_form_placeholder_comment: "Zusätzliche Informationen oder Wünsche",
//   booking_client_form_placeholder_referral_other: "Bitte angeben",
  
//   booking_client_form_referral_select: "Wählen Sie eine Option",
//   booking_client_form_referral_google: "Google",
//   booking_client_form_referral_facebook: "Facebook",
//   booking_client_form_referral_instagram: "Instagram",
//   booking_client_form_referral_friends: "Empfehlung von Freunden",
//   booking_client_form_referral_other: "Andere",
  
//   booking_client_form_error_name: "Bitte geben Sie Ihren vollständigen Namen an",
//   booking_client_form_error_phone: "Bitte geben Sie eine gültige Telefonnummer an",
//   booking_client_form_error_email_required: "E-Mail ist erforderlich",
//   booking_client_form_error_email_invalid: "Ungültige E-Mail",
//   booking_client_form_error_email_not_verified: "E-Mail nicht bestätigt",
//   booking_client_form_error_birth_required: "Geburtsdatum ist erforderlich",
//   booking_client_form_error_birth_future: "Zukünftiges Datum ist nicht zulässig",
//   booking_client_form_error_birth_underage: "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
//   booking_client_form_error_referral: "Wählen Sie eine Option",
//   booking_client_form_error_referral_other: "Bitte angeben",
  
//   booking_client_form_email_checking: "E-Mail wird überprüft…",
//   booking_client_form_email_verified: "E-Mail bestätigt",
  
//   booking_client_form_age_requirement: "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
//   booking_client_form_email_error_note: "Wenn Sie einen Fehler in der Adresse machen, können Sie trotzdem zum Termin kommen, erhalten aber keine Erinnerungen und Bestätigungen.",
  
//   booking_client_form_button_back: "Zurück",
//   booking_client_form_button_submit: "Buchen",
//   booking_client_form_button_submitting: "Daten werden überprüft…",
  
//   booking_client_form_info_title: "Warum benötigen wir Ihre E-Mail?",
//   booking_client_form_info_point_1: "An Ihre E-Mail senden wir",
//   booking_client_form_info_point_1_highlight: "die Buchungsbestätigung und alle Details",
//   booking_client_form_info_point_2: "Sie erhalten",
//   booking_client_form_info_point_2_highlight: "eine Erinnerung vor Ihrem Besuch",
//   booking_client_form_info_point_3: "Wir behandeln personenbezogene Daten sorgfältig und verwenden Ihre E-Mail nur für die Bearbeitung Ihrer Buchung",
  
//   booking_client_form_invalid_params: "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
//   booking_client_form_invalid_return: "Zurück zur Dienstleistungsauswahl",


//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Zurück zur Meisterauswahl",

//   // Months
//   month_january: "Januar",
//   month_february: "Februar",
//   month_march: "März",
//   month_april: "April",
//   month_may: "Mai",
//   month_june: "Juni",
//   month_july: "Juli",
//   month_august: "August",
//   month_september: "September",
//   month_october: "Oktober",
//   month_november: "November",
//   month_december: "Dezember",

//   // Weekdays (short)
//   weekday_mon: "Mo",
//   weekday_tue: "Di",
//   weekday_wed: "Mi",
//   weekday_thu: "Do",
//   weekday_fri: "Fr",
//   weekday_sat: "Sa",
//   weekday_sun: "So",

//   // Weekdays (full)
//   weekday_full_monday: "Montag",
//   weekday_full_tuesday: "Dienstag",
//   weekday_full_wednesday: "Mittwoch",
//   weekday_full_thursday: "Donnerstag",
//   weekday_full_friday: "Freitag",
//   weekday_full_saturday: "Samstag",
//   weekday_full_sunday: "Sonntag",
// };

// /* ==================== ENGLISH (EN) ==================== */

// const enMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Home",
//   nav_services: "Services",
//   nav_prices: "Prices",
//   nav_contacts: "Contacts",
//   nav_news: "News",
//   nav_about: "About us",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – beauty and care in Halle",
//   hero_subtitle:
//     "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//   hero_cta_book: "Book now",
//   hero_cta_services: "All services",
//   hero_badge: "Online booking 24/7 • In the center of Halle",

//   // Home – popular services
//   home_services_title: "Popular services",
//   home_services_subtitle: "What we do best",
//   home_services_card1_title: "Women's haircut",
//   home_services_card1_text: "We highlight your style and individuality.",
//   home_services_card2_title: "Manicure",
//   home_services_card2_text:
//     "Aesthetics, hygiene and long-lasting coating.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "We create the right look for any occasion.",

//   // Home – news
//   home_news_title: "News & articles",
//   home_news_subtitle: "Fresh updates and useful tips",
//   home_news_empty: "No posts have been published yet.",

//   // Home – bottom CTA
//   home_cta_title: "Ready for a change?",
//   home_cta_text:
//     "Book your appointment online – we'll find the perfect care and style for you.",
//   home_cta_button: "Book now",

//   // Auth
//   auth_login: "Sign in",
//   auth_logout: "Sign out",

//   // Footer – salon
//   footer_about_section: "Salon & Location",
//   footer_about_description:
//     "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

//   footer_location_section: "Our address",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Opening hours",
//   footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
//   footer_hours_saturday: "Sat: 10:00 – 16:00",
//   footer_hours_sunday: "Sun: closed",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "For clients and stylists",

//   footer_socials_section: "Social Media & Messengers",

//   footer_privacy: "Privacy Policy",
//   footer_terms: "Terms of Use",
//   footer_back_to_top: "Back to top",

//   footer_copyright: "All rights reserved.",

//   footer_contacts_title: "Contacts",

//   footer_client_booking: "Online booking",
//   footer_client_cabinet: "Client booking account",
//   footer_client_admin: "Stylist cooperation",
//   footer_client_partnership_title: "Partnership with stylists",
//   footer_client_partnership_text:
//     "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we'll discuss cooperation.",

//   footer_top_title:
//     "Your beauty salon with online booking and attention to detail",
//   footer_top_text:
//     "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
//   footer_top_chip_online: "Online booking 24/7",
//   footer_top_chip_premium: "Premium service",

//   footer_quick_title: "Book your visit in a few clicks",
//   footer_quick_text:
//     "Online booking is available 24/7 – we'll confirm your appointment as quickly as possible.",
//   footer_quick_step1: "Choose a service",
//   footer_quick_step2: "Choose a stylist",
//   footer_quick_step3: "Confirm the time",
//   footer_quick_adv1: "Premium-level online booking",
//   footer_quick_adv2: "Convenient time slots for your schedule",

//   footer_socials_instagram_hint: "Open the salon's Instagram",
//   footer_socials_facebook_hint: "Open the Facebook page",
//   footer_socials_youtube_hint: "Open the YouTube channel",

//   footer_messenger_email: "Send an email",
//   footer_messenger_call: "Call us",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Service",
//   booking_step_master: "Master",
//   booking_step_date: "Date",
//   booking_step_client: "Details",
//   booking_step_verify: "Verify",
//   booking_step_payment: "Payment",

//   booking_loading_text: "Loading services…",
//   booking_error_loading: "Loading error",
//   booking_error_retry: "Try Again",

//   // SERVICES PAGE – hero
//   booking_hero_badge: "Step 1 — Choose Your Services",
//   booking_hero_title: "Online Booking",
//   booking_hero_subtitle: "Select the services you need",

//   booking_category_all: "All",
//   booking_price_on_request: "On Request",
//   booking_minutes: "minutes",
//   booking_bar_selected_label: "Selected:",
//   booking_minutes_short: "min",

//   booking_continue: "Continue",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Master",
//   booking_master_default_bio: "Premium beauty salon master",
//   booking_master_online_booking: "Online Booking",
//   booking_master_premium: "Premium Master",

//   booking_master_no_services: "No services selected",
//   booking_master_load_error: "Failed to load masters",
//   booking_master_no_available: "No suitable master",
//   booking_master_different_masters:
//     "Selected services are performed by different masters",
//   booking_master_choose_same_specialist:
//     "Choose a set of services from one specialist or return to selection",
//   booking_master_back_to_services: "Back to Services",

//   booking_master_step_title: "Step 2 — Premium Master Selection",
//   booking_master_hero_title: "Master Selection",
//   booking_master_hero_subtitle: "Our experts will create the perfect look for you",
//   booking_master_back_button: "Back to Service Selection",

//   booking_error_title: "Error",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Step 3 — Choose Date and Time",
//   booking_calendar_hero_title: "Magic Time for Beauty",
//   booking_calendar_hero_subtitle:
//     "Choose a convenient date and time – we'll take care of everything else",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Select",
//   booking_calendar_master_label: "Master",
//   booking_calendar_master_loading: "Loading masters...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Choose a convenient day for booking",
//   booking_calendar_today_slots: "Today:",
//   booking_calendar_slot_singular: "available slot",
//   booking_calendar_slot_few: "available slots",
//   booking_calendar_slot_many: "available slots",
//   booking_calendar_slots_tooltip: "slots",
//   booking_calendar_weekend: "Closed",
//   booking_calendar_no_slots: "No slots",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Golden fill shows day availability",
//   booking_calendar_legend_loading: "Loading data...",
//   booking_calendar_legend_subtitle:
//     "The higher the fill, the more bookings",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Smart Tip",
//   booking_calendar_smart_tip_morning:
//     "more available slots in the morning (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "more available slots in the evening (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Great choice! Plenty of free time",
//   booking_calendar_smart_tip_few: "Book soon — limited slots",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Selected date:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Available Time",
//   booking_calendar_duration_label: "Booking duration:",
//   booking_calendar_nearest_slot: "Nearest slot:",
//   booking_calendar_minutes_label: "minutes",
//   booking_calendar_error_prefix: "⚠️ Error:",
//   booking_calendar_no_slots_message: "No available slots for this date.",
//   booking_calendar_try_another_day: "Try selecting a nearby day.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Available slots:",  // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "How would you like to proceed?",
//   booking_client_choice_subtitle: "Choose your preferred registration method",
//   booking_client_choice_recommended: "Recommended",
  
//   booking_client_google_title: "Quick Registration",
//   booking_client_google_description: "Sign in with Google and go straight to payment",
//   booking_client_google_benefit_1: "One click to payment",
//   booking_client_google_benefit_2: "Auto-fill data",
//   booking_client_google_benefit_3: "Safe and secure",
//   booking_client_google_benefit_4: "Save time",
//   booking_client_google_button: "Start with 1 click",
//   booking_client_google_security: "Protected by Google OAuth 2.0",
//   booking_client_google_connecting: "Connecting...",
  
//   booking_client_form_title: "Fill out form",
//   booking_client_form_description: "Traditional method with full control over your data",
//   booking_client_form_benefit_1: "Full data control",
//   booking_client_form_benefit_2: "No Google account needed",
//   booking_client_form_benefit_3: "Familiar process",
//   booking_client_form_benefit_4: "Verification via Telegram",
//   booking_client_form_button: "Fill out form",
//   booking_client_form_security: "Confirmation via Telegram Bot",
  
//   booking_client_choice_footer: "Both methods are safe and reliable.",
//   booking_client_choice_footer_highlight: "Choose the one that's more convenient for you.",
  
//   booking_client_popup_blocked: "Could not open window. Please allow pop-ups in your browser.",
//   booking_client_google_error_init: "Google OAuth initialization error",
//   booking_client_auth_error: "Authorization error",
//   booking_client_auth_waiting: "Waiting for confirmation via Google...",
  
//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Step 4 — Your contact information",
//   booking_client_form_hero_title: "Online Booking",
//   booking_client_form_hero_subtitle: "Provide your details so we can confirm your booking",
  
//   booking_client_form_label_name: "Name",
//   booking_client_form_label_phone: "Phone",
//   booking_client_form_label_email: "E-mail",
//   booking_client_form_label_birth: "Date of birth",
//   booking_client_form_label_referral: "How did you hear about us?",
//   booking_client_form_label_comment: "Comment",
//   booking_client_form_label_optional: "(optional)",
  
//   booking_client_form_placeholder_name: "Your full name",
//   booking_client_form_placeholder_phone: "+49 (xxx) xxx-xx-xx",
//   booking_client_form_placeholder_email: "your@email.com",
//   booking_client_form_placeholder_comment: "Additional information or requests",
//   booking_client_form_placeholder_referral_other: "Please specify",
  
//   booking_client_form_referral_select: "Select an option",
//   booking_client_form_referral_google: "Google",
//   booking_client_form_referral_facebook: "Facebook",
//   booking_client_form_referral_instagram: "Instagram",
//   booking_client_form_referral_friends: "Friend's recommendation",
//   booking_client_form_referral_other: "Other",
  
//   booking_client_form_error_name: "Please provide your full name",
//   booking_client_form_error_phone: "Please provide a valid phone number",
//   booking_client_form_error_email_required: "E-mail is required",
//   booking_client_form_error_email_invalid: "Invalid e-mail",
//   booking_client_form_error_email_not_verified: "E-mail not verified",
//   booking_client_form_error_birth_required: "Date of birth is required",
//   booking_client_form_error_birth_future: "Future date is not allowed",
//   booking_client_form_error_birth_underage: "Online booking requires age 16+",
//   booking_client_form_error_referral: "Select an option",
//   booking_client_form_error_referral_other: "Please specify",
  
//   booking_client_form_email_checking: "Verifying e-mail…",
//   booking_client_form_email_verified: "E-mail verified",
  
//   booking_client_form_age_requirement: "Online booking requires age 16+",
//   booking_client_form_email_error_note: "If you make a mistake in the address, you can still come to the appointment, but you won't receive reminders and confirmations.",
  
//   booking_client_form_button_back: "Back",
//   booking_client_form_button_submit: "Book",
//   booking_client_form_button_submitting: "Verifying data…",
  
//   booking_client_form_info_title: "Why do we ask for your e-mail?",
//   booking_client_form_info_point_1: "We will send to your e-mail",
//   booking_client_form_info_point_1_highlight: "booking confirmation and all details",
//   booking_client_form_info_point_2: "You will receive",
//   booking_client_form_info_point_2_highlight: "a reminder before your visit",
//   booking_client_form_info_point_3: "We carefully handle personal data and use your e-mail only for your booking service",
  
//   booking_client_form_invalid_params: "Invalid parameters. Please start the booking again.",
//   booking_client_form_invalid_return: "Return to service selection",


//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Back to Master Selection",

//   // Months
//   month_january: "January",
//   month_february: "February",
//   month_march: "March",
//   month_april: "April",
//   month_may: "May",
//   month_june: "June",
//   month_july: "July",
//   month_august: "August",
//   month_september: "September",
//   month_october: "October",
//   month_november: "November",
//   month_december: "December",

//   // Weekdays (short)
//   weekday_mon: "Mon",
//   weekday_tue: "Tue",
//   weekday_wed: "Wed",
//   weekday_thu: "Thu",
//   weekday_fri: "Fri",
//   weekday_sat: "Sat",
//   weekday_sun: "Sun",

//   // Weekdays (full)
//   weekday_full_monday: "Monday",
//   weekday_full_tuesday: "Tuesday",
//   weekday_full_wednesday: "Wednesday",
//   weekday_full_thursday: "Thursday",
//   weekday_full_friday: "Friday",
//   weekday_full_saturday: "Saturday",
//   weekday_full_sunday: "Sunday",
// };

// /* ==================== EXPORT ==================== */

// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,
//   de: deMessages,
//   en: enMessages,
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key] ?? key;
// }





//--------добовляем словарь клиента-------
// // src/i18n/messages.ts
// import type { Locale } from "./locales";

// // Все текстовые ключи проекта
// export type BaseMessages = {
//   // ======= Навигация =======
//   nav_home: string;
//   nav_services: string;
//   nav_prices: string;
//   nav_contacts: string;
//   nav_news: string;
//   nav_about: string;
//   nav_admin: string;

//   // ======= HERO (главная) =======
//   hero_tagline: string;
//   hero_subtitle: string;
//   hero_cta_book: string;
//   hero_cta_services: string;
//   hero_badge: string;

//   // ======= Главная – «Популярные услуги» =======
//   home_services_title: string;
//   home_services_subtitle: string;
//   home_services_card1_title: string;
//   home_services_card1_text: string;
//   home_services_card2_title: string;
//   home_services_card2_text: string;
//   home_services_card3_title: string;
//   home_services_card3_text: string;

//   // ======= Главная – «Новости и статьи» =======
//   home_news_title: string;
//   home_news_subtitle: string;
//   home_news_empty: string;

//   // ======= Главная – нижний CTA =======
//   home_cta_title: string;
//   home_cta_text: string;
//   home_cta_button: string;

//   // ======= Авторизация =======
//   auth_login: string;
//   auth_logout: string;

//   // ======= Футер – общий блок салона =======
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования (progress bar)
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_date: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;

//   // Загрузка / ошибки (общие)
//   booking_loading_text: string;
//   booking_error_loading: string;
//   booking_error_retry: string;

//   // SERVICES PAGE – Hero блока выбора услуги
//   booking_hero_badge: string;
//   booking_hero_title: string;
//   booking_hero_subtitle: string;

//   // SERVICES PAGE – категории и карточки
//   booking_category_all: string;
//   booking_price_on_request: string;
//   booking_minutes: string;
//   booking_bar_selected_label: string;
//   booking_minutes_short: string;

//   // Кнопки / общий UI
//   booking_continue: string;

//   // ==== MASTER PAGE ====

//   // Карточка мастера
//   booking_master_vip_badge: string;
//   booking_master_default_bio: string;
//   booking_master_online_booking: string;
//   booking_master_premium: string;

//   // Ошибки и состояния
//   booking_master_no_services: string;
//   booking_master_load_error: string;
//   booking_master_no_available: string;
//   booking_master_different_masters: string;
//   booking_master_choose_same_specialist: string;
//   booking_master_back_to_services: string;

//   // Hero мастера
//   booking_master_step_title: string;
//   booking_master_hero_title: string;
//   booking_master_hero_subtitle: string;
//   booking_master_back_button: string;

//   // Общий заголовок ошибок
//   booking_error_title: string;

//   // ==== CALENDAR PAGE ====

//   // Hero
//   booking_calendar_step_badge: string;
//   booking_calendar_hero_title: string;
//   booking_calendar_hero_subtitle: string;

//   // Master Selection
//   booking_calendar_master_select_label: string;
//   booking_calendar_master_label: string;
//   booking_calendar_master_loading: string;

//   // Calendar Section
//   booking_calendar_select_day_hint: string;
//   booking_calendar_today_slots: string;
//   booking_calendar_slot_singular: string;
//   booking_calendar_slot_few: string;
//   booking_calendar_slot_many: string;
//   booking_calendar_slots_tooltip: string;
//   booking_calendar_weekend: string;
//   booking_calendar_no_slots: string;

//   // Legend
//   booking_calendar_legend_title: string;
//   booking_calendar_legend_loading: string;
//   booking_calendar_legend_subtitle: string;

//   // Smart Tips
//   booking_calendar_smart_tip_label: string;
//   booking_calendar_smart_tip_morning: string;
//   booking_calendar_smart_tip_evening: string;
//   booking_calendar_smart_tip_many: string;
//   booking_calendar_smart_tip_few: string;

//   // Selected Date
//   booking_calendar_selected_date_label: string;

//   // Time Section
//   booking_calendar_time_title: string;
//   booking_calendar_duration_label: string;
//   booking_calendar_nearest_slot: string;
//   booking_calendar_minutes_label: string;
//   booking_calendar_error_prefix: string;
//   booking_calendar_no_slots_message: string;
//   booking_calendar_try_another_day: string;
//   booking_calendar_vip_badge: string;
//   booking_calendar_available_slots: string;

//   // Navigation
//   booking_calendar_back_to_master: string;

//   // Months
//   month_january: string;
//   month_february: string;
//   month_march: string;
//   month_april: string;
//   month_may: string;
//   month_june: string;
//   month_july: string;
//   month_august: string;
//   month_september: string;
//   month_october: string;
//   month_november: string;
//   month_december: string;

//   // Weekdays (short)
//   weekday_mon: string;
//   weekday_tue: string;
//   weekday_wed: string;
//   weekday_thu: string;
//   weekday_fri: string;
//   weekday_sat: string;
//   weekday_sun: string;

//   // Weekdays (full, for smart tips)
//   weekday_full_monday: string;
//   weekday_full_tuesday: string;
//   weekday_full_wednesday: string;
//   weekday_full_thursday: string;
//   weekday_full_friday: string;
//   weekday_full_saturday: string;
//   weekday_full_sunday: string;
// };

// export type MessageKey = keyof BaseMessages;

// /* ==================== RUSSIAN (RU) ==================== */

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

//   // Главная – «Популярные услуги»
//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   // Главная – «Новости и статьи»
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования
//   booking_step_services: "Услуга",
//   booking_step_master: "Мастер",
//   booking_step_date: "Дата",
//   booking_step_client: "Данные",
//   booking_step_verify: "Проверка",
//   booking_step_payment: "Оплата",

//   // SERVICES PAGE – hero (обновлённый вариант «Шаг 1»)
//   booking_hero_badge: "Шаг 1 — Выберите Ваши Услуги",
//   booking_hero_title: "Онлайн-запись",
//   booking_hero_subtitle: "Выберите услуги, которые вам нужны",

//   // Категории и карточки
//   booking_category_all: "Все",
//   booking_price_on_request: "По запросу",
//   booking_minutes: "минут",
//   booking_bar_selected_label: "Выбрано:",
//   booking_minutes_short: "мин",

//   // Кнопки / UI
//   booking_continue: "Продолжить",

//   // Загрузка / ошибки
//   booking_loading_text: "Загружаем услуги…",
//   booking_error_loading: "Ошибка загрузки",
//   booking_error_retry: "Попробовать снова",

//   // MASTER PAGE – карточка мастера
//   booking_master_vip_badge: "VIP Мастер",
//   booking_master_default_bio: "Премиальный мастер салона красоты",
//   booking_master_online_booking: "Онлайн-запись",
//   booking_master_premium: "Премиум мастер",

//   // MASTER PAGE – ошибки и состояния
//   booking_master_no_services: "Услуги не выбраны",
//   booking_master_load_error: "Не удалось загрузить мастеров",
//   booking_master_no_available: "Нет подходящего мастера",
//   booking_master_different_masters: "Выбранные услуги выполняют разные мастера",
//   booking_master_choose_same_specialist:
//     "Выберите набор услуг одного специалиста или вернитесь к выбору",
//   booking_master_back_to_services: "Вернуться к услугам",

//   // MASTER PAGE – hero
//   booking_master_step_title: "Шаг 2 — Выбор Премиум Мастера",
//   booking_master_hero_title: "Выбор мастера",
//   booking_master_hero_subtitle: "Наши эксперты создадут для вас идеальный образ",
//   booking_master_back_button: "Вернуться к выбору услуг",

//   // Общий заголовок ошибок
//   booking_error_title: "Ошибка",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Шаг 3 — Выбор даты и времени",
//   booking_calendar_hero_title: "Волшебное время для красоты",
//   booking_calendar_hero_subtitle:
//     "Выберите удобную дату и время, а мы позаботимся обо всём остальном",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Выберите",
//   booking_calendar_master_label: "Мастер",
//   booking_calendar_master_loading: "Загрузка мастеров...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Выберите удобный день для записи",
//   booking_calendar_today_slots: "Сегодня:",
//   booking_calendar_slot_singular: "свободный слот",
//   booking_calendar_slot_few: "свободных слота",
//   booking_calendar_slot_many: "свободных слотов",
//   booking_calendar_slots_tooltip: "слотов",
//   booking_calendar_weekend: "Выходной",
//   booking_calendar_no_slots: "Нет слотов",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Золотая заливка показывает занятость дня",
//   booking_calendar_legend_loading: "Загрузка данных...",
//   booking_calendar_legend_subtitle: "Чем выше заливка — тем больше записей",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Умный совет",
//   booking_calendar_smart_tip_morning:
//     "больше свободных слотов утром (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "больше свободных слотов вечером (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Отличный выбор! Много свободного времени",
//   booking_calendar_smart_tip_few: "Успейте забронировать — слотов немного",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Выбранная дата:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Доступное время",
//   booking_calendar_duration_label: "Длительность записи:",
//   booking_calendar_nearest_slot: "Ближайший слот:",
//   booking_calendar_minutes_label: "минут",
//   booking_calendar_error_prefix: "⚠️ Ошибка:",
//   booking_calendar_no_slots_message: "На эту дату нет свободных слотов.",
//   booking_calendar_try_another_day: "Попробуйте выбрать соседний день.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Доступно слотов:",

//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Вернуться к выбору мастера",

//   // Months
//   month_january: "Январь",
//   month_february: "Февраль",
//   month_march: "Март",
//   month_april: "Апрель",
//   month_may: "Май",
//   month_june: "Июнь",
//   month_july: "Июль",
//   month_august: "Август",
//   month_september: "Сентябрь",
//   month_october: "Октябрь",
//   month_november: "Ноябрь",
//   month_december: "Декабрь",

//   // Weekdays (short)
//   weekday_mon: "Пн",
//   weekday_tue: "Вт",
//   weekday_wed: "Ср",
//   weekday_thu: "Чт",
//   weekday_fri: "Пт",
//   weekday_sat: "Сб",
//   weekday_sun: "Вс",

//   // Weekdays (full)
//   weekday_full_monday: "понедельник",
//   weekday_full_tuesday: "вторник",
//   weekday_full_wednesday: "среду",
//   weekday_full_thursday: "четверг",
//   weekday_full_friday: "пятницу",
//   weekday_full_saturday: "субботу",
//   weekday_full_sunday: "воскресенье",
// };

// /* ==================== GERMAN (DE) ==================== */

// const deMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Startseite",
//   nav_services: "Leistungen",
//   nav_prices: "Preise",
//   nav_contacts: "Kontakt",
//   nav_news: "Neuigkeiten",
//   nav_about: "Über uns",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//   hero_subtitle:
//     "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//   hero_cta_book: "Termin buchen",
//   hero_cta_services: "Alle Leistungen",
//   hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

//   // Home – Popular services
//   home_services_title: "Beliebte Leistungen",
//   home_services_subtitle: "Was wir besonders gut können",
//   home_services_card1_title: "Damenhaarschnitt",
//   home_services_card1_text:
//     "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
//   home_services_card2_title: "Maniküre",
//   home_services_card2_text:
//     "Ästhetik, Hygiene und langanhaltende Beschichtung.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "Wir kreieren ein passendes Make-up für jeden Anlass.",

//   // Home – News
//   home_news_title: "News & Artikel",
//   home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//   home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//   // Home – bottom CTA
//   home_cta_title: "Bereit für eine Veränderung?",
//   home_cta_text:
//     "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//   home_cta_button: "Termin buchen",

//   // Auth
//   auth_login: "Anmelden",
//   auth_logout: "Abmelden",

//   // Footer – salon
//   footer_about_section: "Salon & Standort",
//   footer_about_description:
//     "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

//   footer_location_section: "Unsere Adresse",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Öffnungszeiten",
//   footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
//   footer_hours_saturday: "Sa: 10:00 – 16:00",
//   footer_hours_sunday: "So: geschlossen",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "Für Kunden und Stylisten",

//   footer_socials_section: "Soziale Netzwerke & Messenger",

//   footer_privacy: "Datenschutz",
//   footer_terms: "Nutzungsbedingungen",
//   footer_back_to_top: "Nach oben",

//   footer_copyright: "Alle Rechte vorbehalten.",

//   footer_contacts_title: "Kontaktdaten",

//   footer_client_booking: "Online-Termin",
//   footer_client_cabinet: "Kundenbereich für Buchungen",
//   footer_client_admin: "Kooperation mit Stylisten",
//   footer_client_partnership_title: "Partnerschaft mit Stylisten",
//   footer_client_partnership_text:
//     "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

//   footer_top_title:
//     "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
//   footer_top_text:
//     "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
//   footer_top_chip_online: "Online-Termin 24/7",
//   footer_top_chip_premium: "Premium-Service",

//   footer_quick_title: "In wenigen Klicks zum Termin",
//   footer_quick_text:
//     "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
//   footer_quick_step1: "Leistung wählen",
//   footer_quick_step2: "Stylisten wählen",
//   footer_quick_step3: "Uhrzeit bestätigen",
//   footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
//   footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

//   footer_socials_instagram_hint: "Instagram des Salons öffnen",
//   footer_socials_facebook_hint: "Facebook-Seite öffnen",
//   footer_socials_youtube_hint: "YouTube-Kanal öffnen",

//   footer_messenger_email: "E-Mail schreiben",
//   footer_messenger_call: "Anrufen",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Dienstleistung",
//   booking_step_master: "Meister",
//   booking_step_date: "Datum",
//   booking_step_client: "Daten",
//   booking_step_verify: "Prüfung",
//   booking_step_payment: "Zahlung",

//   booking_loading_text: "Dienstleistungen werden geladen…",
//   booking_error_loading: "Fehler beim Laden",
//   booking_error_retry: "Erneut versuchen",

//   // SERVICES PAGE – hero (step-based)
//   booking_hero_badge: "Schritt 1 — Wählen Sie Ihre Dienstleistungen",
//   booking_hero_title: "Online-Buchung",
//   booking_hero_subtitle: "Wählen Sie die Dienstleistungen, die Sie benötigen",

//   booking_category_all: "Alle",
//   booking_price_on_request: "Auf Anfrage",
//   booking_minutes: "Minuten",
//   booking_bar_selected_label: "Ausgewählt:",
//   booking_minutes_short: "Min",

//   booking_continue: "Weiter",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Meister",
//   booking_master_default_bio: "Premium-Meister des Schönheitssalons",
//   booking_master_online_booking: "Online-Buchung",
//   booking_master_premium: "Premium-Meister",

//   booking_master_no_services: "Keine Dienstleistungen ausgewählt",
//   booking_master_load_error: "Meister konnten nicht geladen werden",
//   booking_master_no_available: "Kein passender Meister",
//   booking_master_different_masters:
//     "Die ausgewählten Dienstleistungen werden von verschiedenen Meistern durchgeführt",
//   booking_master_choose_same_specialist:
//     "Wählen Sie ein Set von Dienstleistungen eines Spezialisten oder kehren Sie zur Auswahl zurück",
//   booking_master_back_to_services: "Zurück zu Dienstleistungen",

//   booking_master_step_title: "Schritt 2 — Auswahl des Premium-Meisters",
//   booking_master_hero_title: "Meisterauswahl",
//   booking_master_hero_subtitle:
//     "Unsere Experten schaffen für Sie das perfekte Bild",
//   booking_master_back_button: "Zurück zur Dienstleistungsauswahl",

//   booking_error_title: "Fehler",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Schritt 3 — Datum und Uhrzeit wählen",
//   booking_calendar_hero_title: "Magische Zeit für Schönheit",
//   booking_calendar_hero_subtitle:
//     "Wählen Sie ein passendes Datum und eine Uhrzeit – wir kümmern uns um alles andere",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Wählen Sie",
//   booking_calendar_master_label: "Meister",
//   booking_calendar_master_loading: "Meister werden geladen...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Wählen Sie einen passenden Tag",
//   booking_calendar_today_slots: "Heute:",
//   booking_calendar_slot_singular: "freier Termin",
//   booking_calendar_slot_few: "freie Termine",
//   booking_calendar_slot_many: "freie Termine",
//   booking_calendar_slots_tooltip: "Termine",
//   booking_calendar_weekend: "Geschlossen",
//   booking_calendar_no_slots: "Keine Termine",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Goldene Füllung zeigt die Auslastung des Tages",
//   booking_calendar_legend_loading: "Daten werden geladen...",
//   booking_calendar_legend_subtitle:
//     "Je höher die Füllung, desto mehr Buchungen",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Intelligenter Tipp",
//   booking_calendar_smart_tip_morning:
//     "mehr freie Termine am Morgen (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "mehr freie Termine am Abend (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Ausgezeichnete Wahl! Viel freie Zeit",
//   booking_calendar_smart_tip_few:
//     "Beeilen Sie sich mit der Buchung — wenige Termine",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Gewähltes Datum:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Verfügbare Zeit",
//   booking_calendar_duration_label: "Buchungsdauer:",
//   booking_calendar_nearest_slot: "Nächster Termin:",
//   booking_calendar_minutes_label: "Minuten",
//   booking_calendar_error_prefix: "⚠️ Fehler:",
//   booking_calendar_no_slots_message:
//     "Für dieses Datum sind keine Termine verfügbar.",
//   booking_calendar_try_another_day: "Versuchen Sie einen anderen Tag.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Verfügbare Termine:",

//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Zurück zur Meisterauswahl",

//   // Months
//   month_january: "Januar",
//   month_february: "Februar",
//   month_march: "März",
//   month_april: "April",
//   month_may: "Mai",
//   month_june: "Juni",
//   month_july: "Juli",
//   month_august: "August",
//   month_september: "September",
//   month_october: "Oktober",
//   month_november: "November",
//   month_december: "Dezember",

//   // Weekdays (short)
//   weekday_mon: "Mo",
//   weekday_tue: "Di",
//   weekday_wed: "Mi",
//   weekday_thu: "Do",
//   weekday_fri: "Fr",
//   weekday_sat: "Sa",
//   weekday_sun: "So",

//   // Weekdays (full)
//   weekday_full_monday: "Montag",
//   weekday_full_tuesday: "Dienstag",
//   weekday_full_wednesday: "Mittwoch",
//   weekday_full_thursday: "Donnerstag",
//   weekday_full_friday: "Freitag",
//   weekday_full_saturday: "Samstag",
//   weekday_full_sunday: "Sonntag",
// };

// /* ==================== ENGLISH (EN) ==================== */

// const enMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Home",
//   nav_services: "Services",
//   nav_prices: "Prices",
//   nav_contacts: "Contacts",
//   nav_news: "News",
//   nav_about: "About us",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – beauty and care in Halle",
//   hero_subtitle:
//     "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//   hero_cta_book: "Book now",
//   hero_cta_services: "All services",
//   hero_badge: "Online booking 24/7 • In the center of Halle",

//   // Home – popular services
//   home_services_title: "Popular services",
//   home_services_subtitle: "What we do best",
//   home_services_card1_title: "Women's haircut",
//   home_services_card1_text: "We highlight your style and individuality.",
//   home_services_card2_title: "Manicure",
//   home_services_card2_text:
//     "Aesthetics, hygiene and long-lasting coating.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "We create the right look for any occasion.",

//   // Home – news
//   home_news_title: "News & articles",
//   home_news_subtitle: "Fresh updates and useful tips",
//   home_news_empty: "No posts have been published yet.",

//   // Home – bottom CTA
//   home_cta_title: "Ready for a change?",
//   home_cta_text:
//     "Book your appointment online – we'll find the perfect care and style for you.",
//   home_cta_button: "Book now",

//   // Auth
//   auth_login: "Sign in",
//   auth_logout: "Sign out",

//   // Footer – salon
//   footer_about_section: "Salon & Location",
//   footer_about_description:
//     "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

//   footer_location_section: "Our address",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Opening hours",
//   footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
//   footer_hours_saturday: "Sat: 10:00 – 16:00",
//   footer_hours_sunday: "Sun: closed",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "For clients and stylists",

//   footer_socials_section: "Social Media & Messengers",

//   footer_privacy: "Privacy Policy",
//   footer_terms: "Terms of Use",
//   footer_back_to_top: "Back to top",

//   footer_copyright: "All rights reserved.",

//   footer_contacts_title: "Contacts",

//   footer_client_booking: "Online booking",
//   footer_client_cabinet: "Client booking account",
//   footer_client_admin: "Stylist cooperation",
//   footer_client_partnership_title: "Partnership with stylists",
//   footer_client_partnership_text:
//     "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we'll discuss cooperation.",

//   footer_top_title:
//     "Your beauty salon with online booking and attention to detail",
//   footer_top_text:
//     "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
//   footer_top_chip_online: "Online booking 24/7",
//   footer_top_chip_premium: "Premium service",

//   footer_quick_title: "Book your visit in a few clicks",
//   footer_quick_text:
//     "Online booking is available 24/7 – we'll confirm your appointment as quickly as possible.",
//   footer_quick_step1: "Choose a service",
//   footer_quick_step2: "Choose a stylist",
//   footer_quick_step3: "Confirm the time",
//   footer_quick_adv1: "Premium-level online booking",
//   footer_quick_adv2: "Convenient time slots for your schedule",

//   footer_socials_instagram_hint: "Open the salon's Instagram",
//   footer_socials_facebook_hint: "Open the Facebook page",
//   footer_socials_youtube_hint: "Open the YouTube channel",

//   footer_messenger_email: "Send an email",
//   footer_messenger_call: "Call us",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Service",
//   booking_step_master: "Master",
//   booking_step_date: "Date",
//   booking_step_client: "Details",
//   booking_step_verify: "Verify",
//   booking_step_payment: "Payment",

//   booking_loading_text: "Loading services…",
//   booking_error_loading: "Loading error",
//   booking_error_retry: "Try Again",

//   // SERVICES PAGE – hero
//   booking_hero_badge: "Step 1 — Choose Your Services",
//   booking_hero_title: "Online Booking",
//   booking_hero_subtitle: "Select the services you need",

//   booking_category_all: "All",
//   booking_price_on_request: "On Request",
//   booking_minutes: "minutes",
//   booking_bar_selected_label: "Selected:",
//   booking_minutes_short: "min",

//   booking_continue: "Continue",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Master",
//   booking_master_default_bio: "Premium beauty salon master",
//   booking_master_online_booking: "Online Booking",
//   booking_master_premium: "Premium Master",

//   booking_master_no_services: "No services selected",
//   booking_master_load_error: "Failed to load masters",
//   booking_master_no_available: "No suitable master",
//   booking_master_different_masters:
//     "Selected services are performed by different masters",
//   booking_master_choose_same_specialist:
//     "Choose a set of services from one specialist or return to selection",
//   booking_master_back_to_services: "Back to Services",

//   booking_master_step_title: "Step 2 — Premium Master Selection",
//   booking_master_hero_title: "Master Selection",
//   booking_master_hero_subtitle: "Our experts will create the perfect look for you",
//   booking_master_back_button: "Back to Service Selection",

//   booking_error_title: "Error",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Step 3 — Choose Date and Time",
//   booking_calendar_hero_title: "Magic Time for Beauty",
//   booking_calendar_hero_subtitle:
//     "Choose a convenient date and time – we'll take care of everything else",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Select",
//   booking_calendar_master_label: "Master",
//   booking_calendar_master_loading: "Loading masters...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Choose a convenient day for booking",
//   booking_calendar_today_slots: "Today:",
//   booking_calendar_slot_singular: "available slot",
//   booking_calendar_slot_few: "available slots",
//   booking_calendar_slot_many: "available slots",
//   booking_calendar_slots_tooltip: "slots",
//   booking_calendar_weekend: "Closed",
//   booking_calendar_no_slots: "No slots",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Golden fill shows day availability",
//   booking_calendar_legend_loading: "Loading data...",
//   booking_calendar_legend_subtitle:
//     "The higher the fill, the more bookings",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Smart Tip",
//   booking_calendar_smart_tip_morning:
//     "more available slots in the morning (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "more available slots in the evening (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Great choice! Plenty of free time",
//   booking_calendar_smart_tip_few: "Book soon — limited slots",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Selected date:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Available Time",
//   booking_calendar_duration_label: "Booking duration:",
//   booking_calendar_nearest_slot: "Nearest slot:",
//   booking_calendar_minutes_label: "minutes",
//   booking_calendar_error_prefix: "⚠️ Error:",
//   booking_calendar_no_slots_message: "No available slots for this date.",
//   booking_calendar_try_another_day: "Try selecting a nearby day.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Available slots:",

//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Back to Master Selection",

//   // Months
//   month_january: "January",
//   month_february: "February",
//   month_march: "March",
//   month_april: "April",
//   month_may: "May",
//   month_june: "June",
//   month_july: "July",
//   month_august: "August",
//   month_september: "September",
//   month_october: "October",
//   month_november: "November",
//   month_december: "December",

//   // Weekdays (short)
//   weekday_mon: "Mon",
//   weekday_tue: "Tue",
//   weekday_wed: "Wed",
//   weekday_thu: "Thu",
//   weekday_fri: "Fri",
//   weekday_sat: "Sat",
//   weekday_sun: "Sun",

//   // Weekdays (full)
//   weekday_full_monday: "Monday",
//   weekday_full_tuesday: "Tuesday",
//   weekday_full_wednesday: "Wednesday",
//   weekday_full_thursday: "Thursday",
//   weekday_full_friday: "Friday",
//   weekday_full_saturday: "Saturday",
//   weekday_full_sunday: "Sunday",
// };

// /* ==================== EXPORT ==================== */

// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,
//   de: deMessages,
//   en: enMessages,
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key] ?? key;
// }





// // src/i18n/messages.ts
// import type { Locale } from "./locales";

// // Все текстовые ключи проекта
// export type BaseMessages = {
//   // ======= Навигация =======
//   nav_home: string;
//   nav_services: string;
//   nav_prices: string;
//   nav_contacts: string;
//   nav_news: string;
//   nav_about: string;
//   nav_admin: string;

//   // ======= HERO (главная) =======
//   hero_tagline: string;
//   hero_subtitle: string;
//   hero_cta_book: string;
//   hero_cta_services: string;
//   hero_badge: string;

//   // ======= Главная – «Популярные услуги» =======
//   home_services_title: string;
//   home_services_subtitle: string;
//   home_services_card1_title: string;
//   home_services_card1_text: string;
//   home_services_card2_title: string;
//   home_services_card2_text: string;
//   home_services_card3_title: string;
//   home_services_card3_text: string;

//   // ======= Главная – «Новости и статьи» =======
//   home_news_title: string;
//   home_news_subtitle: string;
//   home_news_empty: string;

//   // ======= Главная – нижний CTA =======
//   home_cta_title: string;
//   home_cta_text: string;
//   home_cta_button: string;

//   // ======= Авторизация =======
//   auth_login: string;
//   auth_logout: string;

//   // ======= Футер – общий блок салона =======
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования (progress bar)
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_date: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;

//   // Загрузка / ошибки (общие)
//   booking_loading_text: string;
//   booking_error_loading: string;
//   booking_error_retry: string;

//   // SERVICES PAGE – Hero блока выбора услуги
//   booking_hero_badge: string;
//   booking_hero_title: string;
//   booking_hero_subtitle: string;

//   // SERVICES PAGE – категории и карточки
//   booking_category_all: string;
//   booking_price_on_request: string;
//   booking_minutes: string;
//   booking_bar_selected_label: string;
//   booking_minutes_short: string;

//   // Кнопки / общий UI
//   booking_continue: string;

//   // ==== MASTER PAGE ====

//   // Карточка мастера
//   booking_master_vip_badge: string;
//   booking_master_default_bio: string;
//   booking_master_online_booking: string;
//   booking_master_premium: string;

//   // Ошибки и состояния
//   booking_master_no_services: string;
//   booking_master_load_error: string;
//   booking_master_no_available: string;
//   booking_master_different_masters: string;
//   booking_master_choose_same_specialist: string;
//   booking_master_back_to_services: string;

//   // Hero мастера
//   booking_master_step_title: string;
//   booking_master_hero_title: string;
//   booking_master_hero_subtitle: string;
//   booking_master_back_button: string;

//   // Общий заголовок ошибок
//   booking_error_title: string;

//   // ==== CALENDAR PAGE ====

//   // Hero
//   booking_calendar_step_badge: string;
//   booking_calendar_hero_title: string;
//   booking_calendar_hero_subtitle: string;

//   // Master Selection
//   booking_calendar_master_select_label: string;
//   booking_calendar_master_label: string;
//   booking_calendar_master_loading: string;

//   // Calendar Section
//   booking_calendar_select_day_hint: string;
//   booking_calendar_today_slots: string;
//   booking_calendar_slot_singular: string;
//   booking_calendar_slot_few: string;
//   booking_calendar_slot_many: string;
//   booking_calendar_slots_tooltip: string;
//   booking_calendar_weekend: string;
//   booking_calendar_no_slots: string;

//   // Legend
//   booking_calendar_legend_title: string;
//   booking_calendar_legend_loading: string;
//   booking_calendar_legend_subtitle: string;

//   // Smart Tips
//   booking_calendar_smart_tip_label: string;
//   booking_calendar_smart_tip_morning: string;
//   booking_calendar_smart_tip_evening: string;
//   booking_calendar_smart_tip_many: string;
//   booking_calendar_smart_tip_few: string;

//   // Selected Date
//   booking_calendar_selected_date_label: string;

//   // Time Section
//   booking_calendar_time_title: string;
//   booking_calendar_duration_label: string;
//   booking_calendar_nearest_slot: string;
//   booking_calendar_minutes_label: string;
//   booking_calendar_error_prefix: string;
//   booking_calendar_no_slots_message: string;
//   booking_calendar_try_another_day: string;
//   booking_calendar_vip_badge: string;
//   booking_calendar_available_slots: string;

//   // Navigation
//   booking_calendar_back_to_master: string;

//   // Months
//   month_january: string;
//   month_february: string;
//   month_march: string;
//   month_april: string;
//   month_may: string;
//   month_june: string;
//   month_july: string;
//   month_august: string;
//   month_september: string;
//   month_october: string;
//   month_november: string;
//   month_december: string;

//   // Weekdays (short)
//   weekday_mon: string;
//   weekday_tue: string;
//   weekday_wed: string;
//   weekday_thu: string;
//   weekday_fri: string;
//   weekday_sat: string;
//   weekday_sun: string;

//   // Weekdays (full, for smart tips)
//   weekday_full_monday: string;
//   weekday_full_tuesday: string;
//   weekday_full_wednesday: string;
//   weekday_full_thursday: string;
//   weekday_full_friday: string;
//   weekday_full_saturday: string;
//   weekday_full_sunday: string;
// };

// export type MessageKey = keyof BaseMessages;

// /* ==================== RUSSIAN (RU) ==================== */

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

//   // Главная – «Популярные услуги»
//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   // Главная – «Новости и статьи»
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования
//   booking_step_services: "Услуга",
//   booking_step_master: "Мастер",
//   booking_step_date: "Дата",
//   booking_step_client: "Данные",
//   booking_step_verify: "Проверка",
//   booking_step_payment: "Оплата",

//   // SERVICES PAGE – hero (обновлённый вариант «Шаг 1»)
//   booking_hero_badge: "Шаг 1 — Выберите Ваши Услуги",
//   booking_hero_title: "Онлайн-запись",
//   booking_hero_subtitle: "Выберите услуги, которые вам нужны",

//   // Категории и карточки
//   booking_category_all: "Все",
//   booking_price_on_request: "По запросу",
//   booking_minutes: "минут",
//   booking_bar_selected_label: "Выбрано:",
//   booking_minutes_short: "мин",

//   // Кнопки / UI
//   booking_continue: "Продолжить",

//   // Загрузка / ошибки
//   booking_loading_text: "Загружаем услуги…",
//   booking_error_loading: "Ошибка загрузки",
//   booking_error_retry: "Попробовать снова",

//   // MASTER PAGE – карточка мастера
//   booking_master_vip_badge: "VIP Мастер",
//   booking_master_default_bio: "Премиальный мастер салона красоты",
//   booking_master_online_booking: "Онлайн-запись",
//   booking_master_premium: "Премиум мастер",

//   // MASTER PAGE – ошибки и состояния
//   booking_master_no_services: "Услуги не выбраны",
//   booking_master_load_error: "Не удалось загрузить мастеров",
//   booking_master_no_available: "Нет подходящего мастера",
//   booking_master_different_masters: "Выбранные услуги выполняют разные мастера",
//   booking_master_choose_same_specialist:
//     "Выберите набор услуг одного специалиста или вернитесь к выбору",
//   booking_master_back_to_services: "Вернуться к услугам",

//   // MASTER PAGE – hero
//   booking_master_step_title: "Шаг 2 — Выбор Премиум Мастера",
//   booking_master_hero_title: "Выбор мастера",
//   booking_master_hero_subtitle: "Наши эксперты создадут для вас идеальный образ",
//   booking_master_back_button: "Вернуться к выбору услуг",

//   // Общий заголовок ошибок
//   booking_error_title: "Ошибка",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Шаг 3 — Выбор даты и времени",
//   booking_calendar_hero_title: "Волшебное время для красоты",
//   booking_calendar_hero_subtitle:
//     "Выберите удобную дату и время, а мы позаботимся обо всём остальном",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Выберите",
//   booking_calendar_master_label: "Мастер",
//   booking_calendar_master_loading: "Загрузка мастеров...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Выберите удобный день для записи",
//   booking_calendar_today_slots: "Сегодня:",
//   booking_calendar_slot_singular: "свободный слот",
//   booking_calendar_slot_few: "свободных слота",
//   booking_calendar_slot_many: "свободных слотов",
//   booking_calendar_slots_tooltip: "слотов",
//   booking_calendar_weekend: "Выходной",
//   booking_calendar_no_slots: "Нет слотов",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Золотая заливка показывает занятость дня",
//   booking_calendar_legend_loading: "Загрузка данных...",
//   booking_calendar_legend_subtitle: "Чем выше заливка — тем больше записей",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Умный совет",
//   booking_calendar_smart_tip_morning:
//     "больше свободных слотов утром (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "больше свободных слотов вечером (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Отличный выбор! Много свободного времени",
//   booking_calendar_smart_tip_few: "Успейте забронировать — слотов немного",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Выбранная дата:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Доступное время",
//   booking_calendar_duration_label: "Длительность записи:",
//   booking_calendar_nearest_slot: "Ближайший слот:",
//   booking_calendar_minutes_label: "минут",
//   booking_calendar_error_prefix: "⚠️ Ошибка:",
//   booking_calendar_no_slots_message: "На эту дату нет свободных слотов.",
//   booking_calendar_try_another_day: "Попробуйте выбрать соседний день.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Доступно слотов:",

//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Вернуться к выбору мастера",

//   // Months
//   month_january: "Январь",
//   month_february: "Февраль",
//   month_march: "Март",
//   month_april: "Апрель",
//   month_may: "Май",
//   month_june: "Июнь",
//   month_july: "Июль",
//   month_august: "Август",
//   month_september: "Сентябрь",
//   month_october: "Октябрь",
//   month_november: "Ноябрь",
//   month_december: "Декабрь",

//   // Weekdays (short)
//   weekday_mon: "Пн",
//   weekday_tue: "Вт",
//   weekday_wed: "Ср",
//   weekday_thu: "Чт",
//   weekday_fri: "Пт",
//   weekday_sat: "Сб",
//   weekday_sun: "Вс",

//   // Weekdays (full)
//   weekday_full_monday: "понедельник",
//   weekday_full_tuesday: "вторник",
//   weekday_full_wednesday: "среду",
//   weekday_full_thursday: "четверг",
//   weekday_full_friday: "пятницу",
//   weekday_full_saturday: "субботу",
//   weekday_full_sunday: "воскресенье",
// };

// /* ==================== GERMAN (DE) ==================== */

// const deMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Startseite",
//   nav_services: "Leistungen",
//   nav_prices: "Preise",
//   nav_contacts: "Kontakt",
//   nav_news: "Neuigkeiten",
//   nav_about: "Über uns",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//   hero_subtitle:
//     "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//   hero_cta_book: "Termin buchen",
//   hero_cta_services: "Alle Leistungen",
//   hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

//   // Home – Popular services
//   home_services_title: "Beliebte Leistungen",
//   home_services_subtitle: "Was wir besonders gut können",
//   home_services_card1_title: "Damenhaarschnitt",
//   home_services_card1_text:
//     "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
//   home_services_card2_title: "Maniküre",
//   home_services_card2_text:
//     "Ästhetik, Hygiene und langanhaltende Beschichtung.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "Wir kreieren ein passendes Make-up für jeden Anlass.",

//   // Home – News
//   home_news_title: "News & Artikel",
//   home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//   home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//   // Home – bottom CTA
//   home_cta_title: "Bereit für eine Veränderung?",
//   home_cta_text:
//     "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//   home_cta_button: "Termin buchen",

//   // Auth
//   auth_login: "Anmelden",
//   auth_logout: "Abmelden",

//   // Footer – salon
//   footer_about_section: "Salon & Standort",
//   footer_about_description:
//     "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

//   footer_location_section: "Unsere Adresse",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Öffnungszeiten",
//   footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
//   footer_hours_saturday: "Sa: 10:00 – 16:00",
//   footer_hours_sunday: "So: geschlossen",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "Für Kunden und Stylisten",

//   footer_socials_section: "Soziale Netzwerke & Messenger",

//   footer_privacy: "Datenschutz",
//   footer_terms: "Nutzungsbedingungen",
//   footer_back_to_top: "Nach oben",

//   footer_copyright: "Alle Rechte vorbehalten.",

//   footer_contacts_title: "Kontaktdaten",

//   footer_client_booking: "Online-Termin",
//   footer_client_cabinet: "Kundenbereich für Buchungen",
//   footer_client_admin: "Kooperation mit Stylisten",
//   footer_client_partnership_title: "Partnerschaft mit Stylisten",
//   footer_client_partnership_text:
//     "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

//   footer_top_title:
//     "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
//   footer_top_text:
//     "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
//   footer_top_chip_online: "Online-Termin 24/7",
//   footer_top_chip_premium: "Premium-Service",

//   footer_quick_title: "In wenigen Klicks zum Termin",
//   footer_quick_text:
//     "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
//   footer_quick_step1: "Leistung wählen",
//   footer_quick_step2: "Stylisten wählen",
//   footer_quick_step3: "Uhrzeit bestätigen",
//   footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
//   footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

//   footer_socials_instagram_hint: "Instagram des Salons öffnen",
//   footer_socials_facebook_hint: "Facebook-Seite öffnen",
//   footer_socials_youtube_hint: "YouTube-Kanal öffnen",

//   footer_messenger_email: "E-Mail schreiben",
//   footer_messenger_call: "Anrufen",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Dienstleistung",
//   booking_step_master: "Meister",
//   booking_step_date: "Datum",
//   booking_step_client: "Daten",
//   booking_step_verify: "Prüfung",
//   booking_step_payment: "Zahlung",

//   booking_loading_text: "Dienstleistungen werden geladen…",
//   booking_error_loading: "Fehler beim Laden",
//   booking_error_retry: "Erneut versuchen",

//   // SERVICES PAGE – hero (step-based)
//   booking_hero_badge: "Schritt 1 — Wählen Sie Ihre Dienstleistungen",
//   booking_hero_title: "Online-Buchung",
//   booking_hero_subtitle: "Wählen Sie die Dienstleistungen, die Sie benötigen",

//   booking_category_all: "Alle",
//   booking_price_on_request: "Auf Anfrage",
//   booking_minutes: "Minuten",
//   booking_bar_selected_label: "Ausgewählt:",
//   booking_minutes_short: "Min",

//   booking_continue: "Weiter",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Meister",
//   booking_master_default_bio: "Premium-Meister des Schönheitssalons",
//   booking_master_online_booking: "Online-Buchung",
//   booking_master_premium: "Premium-Meister",

//   booking_master_no_services: "Keine Dienstleistungen ausgewählt",
//   booking_master_load_error: "Meister konnten nicht geladen werden",
//   booking_master_no_available: "Kein passender Meister",
//   booking_master_different_masters:
//     "Die ausgewählten Dienstleistungen werden von verschiedenen Meistern durchgeführt",
//   booking_master_choose_same_specialist:
//     "Wählen Sie ein Set von Dienstleistungen eines Spezialisten oder kehren Sie zur Auswahl zurück",
//   booking_master_back_to_services: "Zurück zu Dienstleistungen",

//   booking_master_step_title: "Schritt 2 — Auswahl des Premium-Meisters",
//   booking_master_hero_title: "Meisterauswahl",
//   booking_master_hero_subtitle:
//     "Unsere Experten schaffen für Sie das perfekte Bild",
//   booking_master_back_button: "Zurück zur Dienstleistungsauswahl",

//   booking_error_title: "Fehler",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Schritt 3 — Datum und Uhrzeit wählen",
//   booking_calendar_hero_title: "Magische Zeit für Schönheit",
//   booking_calendar_hero_subtitle:
//     "Wählen Sie ein passendes Datum und eine Uhrzeit – wir kümmern uns um alles andere",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Wählen Sie",
//   booking_calendar_master_label: "Meister",
//   booking_calendar_master_loading: "Meister werden geladen...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Wählen Sie einen passenden Tag",
//   booking_calendar_today_slots: "Heute:",
//   booking_calendar_slot_singular: "freier Termin",
//   booking_calendar_slot_few: "freie Termine",
//   booking_calendar_slot_many: "freie Termine",
//   booking_calendar_slots_tooltip: "Termine",
//   booking_calendar_weekend: "Geschlossen",
//   booking_calendar_no_slots: "Keine Termine",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Goldene Füllung zeigt die Auslastung des Tages",
//   booking_calendar_legend_loading: "Daten werden geladen...",
//   booking_calendar_legend_subtitle:
//     "Je höher die Füllung, desto mehr Buchungen",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Intelligenter Tipp",
//   booking_calendar_smart_tip_morning:
//     "mehr freie Termine am Morgen (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "mehr freie Termine am Abend (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Ausgezeichnete Wahl! Viel freie Zeit",
//   booking_calendar_smart_tip_few:
//     "Beeilen Sie sich mit der Buchung — wenige Termine",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Gewähltes Datum:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Verfügbare Zeit",
//   booking_calendar_duration_label: "Buchungsdauer:",
//   booking_calendar_nearest_slot: "Nächster Termin:",
//   booking_calendar_minutes_label: "Minuten",
//   booking_calendar_error_prefix: "⚠️ Fehler:",
//   booking_calendar_no_slots_message:
//     "Für dieses Datum sind keine Termine verfügbar.",
//   booking_calendar_try_another_day: "Versuchen Sie einen anderen Tag.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Verfügbare Termine:",

//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Zurück zur Meisterauswahl",

//   // Months
//   month_january: "Januar",
//   month_february: "Februar",
//   month_march: "März",
//   month_april: "April",
//   month_may: "Mai",
//   month_june: "Juni",
//   month_july: "Juli",
//   month_august: "August",
//   month_september: "September",
//   month_october: "Oktober",
//   month_november: "November",
//   month_december: "Dezember",

//   // Weekdays (short)
//   weekday_mon: "Mo",
//   weekday_tue: "Di",
//   weekday_wed: "Mi",
//   weekday_thu: "Do",
//   weekday_fri: "Fr",
//   weekday_sat: "Sa",
//   weekday_sun: "So",

//   // Weekdays (full)
//   weekday_full_monday: "Montag",
//   weekday_full_tuesday: "Dienstag",
//   weekday_full_wednesday: "Mittwoch",
//   weekday_full_thursday: "Donnerstag",
//   weekday_full_friday: "Freitag",
//   weekday_full_saturday: "Samstag",
//   weekday_full_sunday: "Sonntag",
// };

// /* ==================== ENGLISH (EN) ==================== */

// const enMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Home",
//   nav_services: "Services",
//   nav_prices: "Prices",
//   nav_contacts: "Contacts",
//   nav_news: "News",
//   nav_about: "About us",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – beauty and care in Halle",
//   hero_subtitle:
//     "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//   hero_cta_book: "Book now",
//   hero_cta_services: "All services",
//   hero_badge: "Online booking 24/7 • In the center of Halle",

//   // Home – popular services
//   home_services_title: "Popular services",
//   home_services_subtitle: "What we do best",
//   home_services_card1_title: "Women's haircut",
//   home_services_card1_text: "We highlight your style and individuality.",
//   home_services_card2_title: "Manicure",
//   home_services_card2_text:
//     "Aesthetics, hygiene and long-lasting coating.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "We create the right look for any occasion.",

//   // Home – news
//   home_news_title: "News & articles",
//   home_news_subtitle: "Fresh updates and useful tips",
//   home_news_empty: "No posts have been published yet.",

//   // Home – bottom CTA
//   home_cta_title: "Ready for a change?",
//   home_cta_text:
//     "Book your appointment online – we'll find the perfect care and style for you.",
//   home_cta_button: "Book now",

//   // Auth
//   auth_login: "Sign in",
//   auth_logout: "Sign out",

//   // Footer – salon
//   footer_about_section: "Salon & Location",
//   footer_about_description:
//     "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

//   footer_location_section: "Our address",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Opening hours",
//   footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
//   footer_hours_saturday: "Sat: 10:00 – 16:00",
//   footer_hours_sunday: "Sun: closed",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "For clients and stylists",

//   footer_socials_section: "Social Media & Messengers",

//   footer_privacy: "Privacy Policy",
//   footer_terms: "Terms of Use",
//   footer_back_to_top: "Back to top",

//   footer_copyright: "All rights reserved.",

//   footer_contacts_title: "Contacts",

//   footer_client_booking: "Online booking",
//   footer_client_cabinet: "Client booking account",
//   footer_client_admin: "Stylist cooperation",
//   footer_client_partnership_title: "Partnership with stylists",
//   footer_client_partnership_text:
//     "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we'll discuss cooperation.",

//   footer_top_title:
//     "Your beauty salon with online booking and attention to detail",
//   footer_top_text:
//     "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
//   footer_top_chip_online: "Online booking 24/7",
//   footer_top_chip_premium: "Premium service",

//   footer_quick_title: "Book your visit in a few clicks",
//   footer_quick_text:
//     "Online booking is available 24/7 – we'll confirm your appointment as quickly as possible.",
//   footer_quick_step1: "Choose a service",
//   footer_quick_step2: "Choose a stylist",
//   footer_quick_step3: "Confirm the time",
//   footer_quick_adv1: "Premium-level online booking",
//   footer_quick_adv2: "Convenient time slots for your schedule",

//   footer_socials_instagram_hint: "Open the salon's Instagram",
//   footer_socials_facebook_hint: "Open the Facebook page",
//   footer_socials_youtube_hint: "Open the YouTube channel",

//   footer_messenger_email: "Send an email",
//   footer_messenger_call: "Call us",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Service",
//   booking_step_master: "Master",
//   booking_step_date: "Date",
//   booking_step_client: "Details",
//   booking_step_verify: "Verify",
//   booking_step_payment: "Payment",

//   booking_loading_text: "Loading services…",
//   booking_error_loading: "Loading error",
//   booking_error_retry: "Try Again",

//   // SERVICES PAGE – hero
//   booking_hero_badge: "Step 1 — Choose Your Services",
//   booking_hero_title: "Online Booking",
//   booking_hero_subtitle: "Select the services you need",

//   booking_category_all: "All",
//   booking_price_on_request: "On Request",
//   booking_minutes: "minutes",
//   booking_bar_selected_label: "Selected:",
//   booking_minutes_short: "min",

//   booking_continue: "Continue",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Master",
//   booking_master_default_bio: "Premium beauty salon master",
//   booking_master_online_booking: "Online Booking",
//   booking_master_premium: "Premium Master",

//   booking_master_no_services: "No services selected",
//   booking_master_load_error: "Failed to load masters",
//   booking_master_no_available: "No suitable master",
//   booking_master_different_masters:
//     "Selected services are performed by different masters",
//   booking_master_choose_same_specialist:
//     "Choose a set of services from one specialist or return to selection",
//   booking_master_back_to_services: "Back to Services",

//   booking_master_step_title: "Step 2 — Premium Master Selection",
//   booking_master_hero_title: "Master Selection",
//   booking_master_hero_subtitle: "Our experts will create the perfect look for you",
//   booking_master_back_button: "Back to Service Selection",

//   booking_error_title: "Error",

//   // CALENDAR PAGE – Hero
//   booking_calendar_step_badge: "Step 3 — Choose Date and Time",
//   booking_calendar_hero_title: "Magic Time for Beauty",
//   booking_calendar_hero_subtitle:
//     "Choose a convenient date and time – we'll take care of everything else",

//   // CALENDAR PAGE – Master Selection
//   booking_calendar_master_select_label: "Select",
//   booking_calendar_master_label: "Master",
//   booking_calendar_master_loading: "Loading masters...",

//   // CALENDAR PAGE – Calendar Section
//   booking_calendar_select_day_hint: "Choose a convenient day for booking",
//   booking_calendar_today_slots: "Today:",
//   booking_calendar_slot_singular: "available slot",
//   booking_calendar_slot_few: "available slots",
//   booking_calendar_slot_many: "available slots",
//   booking_calendar_slots_tooltip: "slots",
//   booking_calendar_weekend: "Closed",
//   booking_calendar_no_slots: "No slots",

//   // CALENDAR PAGE – Legend
//   booking_calendar_legend_title: "Golden fill shows day availability",
//   booking_calendar_legend_loading: "Loading data...",
//   booking_calendar_legend_subtitle:
//     "The higher the fill, the more bookings",

//   // CALENDAR PAGE – Smart Tips
//   booking_calendar_smart_tip_label: "💡 Smart Tip",
//   booking_calendar_smart_tip_morning:
//     "more available slots in the morning (09:00-12:00)",
//   booking_calendar_smart_tip_evening:
//     "more available slots in the evening (17:00-19:00)",
//   booking_calendar_smart_tip_many: "Great choice! Plenty of free time",
//   booking_calendar_smart_tip_few: "Book soon — limited slots",

//   // CALENDAR PAGE – Selected Date
//   booking_calendar_selected_date_label: "Selected date:",

//   // CALENDAR PAGE – Time Section
//   booking_calendar_time_title: "Available Time",
//   booking_calendar_duration_label: "Booking duration:",
//   booking_calendar_nearest_slot: "Nearest slot:",
//   booking_calendar_minutes_label: "minutes",
//   booking_calendar_error_prefix: "⚠️ Error:",
//   booking_calendar_no_slots_message: "No available slots for this date.",
//   booking_calendar_try_another_day: "Try selecting a nearby day.",
//   booking_calendar_vip_badge: "VIP",
//   booking_calendar_available_slots: "Available slots:",

//   // CALENDAR PAGE – Navigation
//   booking_calendar_back_to_master: "Back to Master Selection",

//   // Months
//   month_january: "January",
//   month_february: "February",
//   month_march: "March",
//   month_april: "April",
//   month_may: "May",
//   month_june: "June",
//   month_july: "July",
//   month_august: "August",
//   month_september: "September",
//   month_october: "October",
//   month_november: "November",
//   month_december: "December",

//   // Weekdays (short)
//   weekday_mon: "Mon",
//   weekday_tue: "Tue",
//   weekday_wed: "Wed",
//   weekday_thu: "Thu",
//   weekday_fri: "Fri",
//   weekday_sat: "Sat",
//   weekday_sun: "Sun",

//   // Weekdays (full)
//   weekday_full_monday: "Monday",
//   weekday_full_tuesday: "Tuesday",
//   weekday_full_wednesday: "Wednesday",
//   weekday_full_thursday: "Thursday",
//   weekday_full_friday: "Friday",
//   weekday_full_saturday: "Saturday",
//   weekday_full_sunday: "Sunday",
// };

// /* ==================== EXPORT ==================== */

// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,
//   de: deMessages,
//   en: enMessages,
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key] ?? key;
// }




//----------добовляю файлы для календаря---------
// // src/i18n/messages.ts
// import type { Locale } from "./locales";

// // Все текстовые ключи проекта
// export type BaseMessages = {
//   // ======= Навигация =======
//   nav_home: string;
//   nav_services: string;
//   nav_prices: string;
//   nav_contacts: string;
//   nav_news: string;
//   nav_about: string;
//   nav_admin: string;

//   // ======= HERO (главная) =======
//   hero_tagline: string;
//   hero_subtitle: string;
//   hero_cta_book: string;
//   hero_cta_services: string;
//   hero_badge: string;

//   // ======= Главная – «Популярные услуги» =======
//   home_services_title: string;
//   home_services_subtitle: string;
//   home_services_card1_title: string;
//   home_services_card1_text: string;
//   home_services_card2_title: string;
//   home_services_card2_text: string;
//   home_services_card3_title: string;
//   home_services_card3_text: string;

//   // ======= Главная – «Новости и статьи» =======
//   home_news_title: string;
//   home_news_subtitle: string;
//   home_news_empty: string;

//   // ======= Главная – нижний CTA =======
//   home_cta_title: string;
//   home_cta_text: string;
//   home_cta_button: string;

//   // ======= Авторизация =======
//   auth_login: string;
//   auth_logout: string;

//   // ======= Футер – общий блок салона =======
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования (progress bar)
//   booking_step_services: string;
//   booking_step_master: string;
//   booking_step_date: string;
//   booking_step_client: string;
//   booking_step_verify: string;
//   booking_step_payment: string;

//   // Загрузка / ошибки (общие)
//   booking_loading_text: string;
//   booking_error_loading: string;
//   booking_error_retry: string;

//   // SERVICES PAGE – Hero блока выбора услуги
//   booking_hero_badge: string;
//   booking_hero_title: string;
//   booking_hero_subtitle: string;

//   // SERVICES PAGE – категории и карточки
//   booking_category_all: string;
//   booking_price_on_request: string;
//   booking_minutes: string;
//   booking_bar_selected_label: string;
//   booking_minutes_short: string;

//   // Кнопки / общий UI
//   booking_continue: string;

//   // ==== MASTER PAGE ====

//   // Карточка мастера
//   booking_master_vip_badge: string;
//   booking_master_default_bio: string;
//   booking_master_online_booking: string;
//   booking_master_premium: string;

//   // Ошибки и состояния
//   booking_master_no_services: string;
//   booking_master_load_error: string;
//   booking_master_no_available: string;
//   booking_master_different_masters: string;
//   booking_master_choose_same_specialist: string;
//   booking_master_back_to_services: string;

//   // Hero мастера
//   booking_master_step_title: string;
//   booking_master_hero_title: string;
//   booking_master_hero_subtitle: string;
//   booking_master_back_button: string;

//   // Общий заголовок ошибок
//   booking_error_title: string;
// };

// export type MessageKey = keyof BaseMessages;

// /* ==================== RUSSIAN (RU) ==================== */

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

//   // Главная – «Популярные услуги»
//   home_services_title: "Популярные услуги",
//   home_services_subtitle: "Что мы делаем лучше всего",
//   home_services_card1_title: "Женская стрижка",
//   home_services_card1_text: "Подчеркнём ваш стиль и индивидуальность.",
//   home_services_card2_title: "Маникюр",
//   home_services_card2_text: "Эстетика, стерильность и стойкое покрытие.",
//   home_services_card3_title: "Макияж",
//   home_services_card3_text: "Создадим образ под любое событие и настроение.",

//   // Главная – «Новости и статьи»
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

//   /* ========= BOOKING ========= */

//   // Шаги бронирования
//   booking_step_services: "Услуга",
//   booking_step_master: "Мастер",
//   booking_step_date: "Дата",
//   booking_step_client: "Данные",
//   booking_step_verify: "Проверка",
//   booking_step_payment: "Оплата",

//   // SERVICES PAGE – hero (обновлённый вариант «Шаг 1»)
//   booking_hero_badge: "Шаг 1 — Выберите Ваши Услуги",
//   booking_hero_title: "Онлайн-запись",
//   booking_hero_subtitle: "Выберите услуги, которые вам нужны",

//   // Категории и карточки
//   booking_category_all: "Все",
//   booking_price_on_request: "По запросу",
//   booking_minutes: "минут",
//   booking_bar_selected_label: "Выбрано:",
//   booking_minutes_short: "мин",

//   // Кнопки / UI
//   booking_continue: "Продолжить",

//   // Загрузка / ошибки
//   booking_loading_text: "Загружаем услуги…",
//   booking_error_loading: "Ошибка загрузки",
//   booking_error_retry: "Попробовать снова",

//   // MASTER PAGE – карточка мастера
//   booking_master_vip_badge: "VIP Мастер",
//   booking_master_default_bio: "Премиальный мастер салона красоты",
//   booking_master_online_booking: "Онлайн-запись",
//   booking_master_premium: "Премиум мастер",

//   // MASTER PAGE – ошибки и состояния
//   booking_master_no_services: "Услуги не выбраны",
//   booking_master_load_error: "Не удалось загрузить мастеров",
//   booking_master_no_available: "Нет подходящего мастера",
//   booking_master_different_masters: "Выбранные услуги выполняют разные мастера",
//   booking_master_choose_same_specialist:
//     "Выберите набор услуг одного специалиста или вернитесь к выбору",
//   booking_master_back_to_services: "Вернуться к услугам",

//   // MASTER PAGE – hero
//   booking_master_step_title: "Шаг 2 — Выбор Премиум Мастера",
//   booking_master_hero_title: "Выбор мастера",
//   booking_master_hero_subtitle: "Наши эксперты создадут для вас идеальный образ",
//   booking_master_back_button: "Вернуться к выбору услуг",

//   // Общий заголовок ошибок
//   booking_error_title: "Ошибка",
// };

// /* ==================== GERMAN (DE) ==================== */

// const deMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Startseite",
//   nav_services: "Leistungen",
//   nav_prices: "Preise",
//   nav_contacts: "Kontakt",
//   nav_news: "Neuigkeiten",
//   nav_about: "Über uns",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – Schönheit und Pflege in Halle",
//   hero_subtitle:
//     "Friseurleistungen, Maniküre, Hautpflege und Make-up. Buchen Sie online – schnell und bequem.",
//   hero_cta_book: "Termin buchen",
//   hero_cta_services: "Alle Leistungen",
//   hero_badge: "Online-Termin 24/7 • Im Zentrum von Halle",

//   // Home – Popular services
//   home_services_title: "Beliebte Leistungen",
//   home_services_subtitle: "Was wir besonders gut können",
//   home_services_card1_title: "Damenhaarschnitt",
//   home_services_card1_text:
//     "Wir unterstreichen Ihren Stil und Ihre Persönlichkeit.",
//   home_services_card2_title: "Maniküre",
//   home_services_card2_text:
//     "Ästhetik, Hygiene und langanhaltende Beschichtung.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "Wir kreieren ein passendes Make-up für jeden Anlass.",

//   // Home – News
//   home_news_title: "News & Artikel",
//   home_news_subtitle: "Aktuelle Neuigkeiten und nützliche Tipps",
//   home_news_empty: "Es sind noch keine Beiträge veröffentlicht.",

//   // Home – bottom CTA
//   home_cta_title: "Bereit für eine Veränderung?",
//   home_cta_text:
//     "Buchen Sie Ihren Termin online – wir finden die passende Pflege und den perfekten Look für Sie.",
//   home_cta_button: "Termin buchen",

//   // Auth
//   auth_login: "Anmelden",
//   auth_logout: "Abmelden",

//   // Footer – salon
//   footer_about_section: "Salon & Standort",
//   footer_about_description:
//     "Wir schaffen eine entspannte Atmosphäre und bieten professionelle Pflege mit hochwertigen Produkten und modernen Techniken.",

//   footer_location_section: "Unsere Adresse",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Öffnungszeiten",
//   footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
//   footer_hours_saturday: "Sa: 10:00 – 16:00",
//   footer_hours_sunday: "So: geschlossen",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "Für Kunden und Stylisten",

//   footer_socials_section: "Soziale Netzwerke & Messenger",

//   footer_privacy: "Datenschutz",
//   footer_terms: "Nutzungsbedingungen",
//   footer_back_to_top: "Nach oben",

//   footer_copyright: "Alle Rechte vorbehalten.",

//   footer_contacts_title: "Kontaktdaten",

//   footer_client_booking: "Online-Termin",
//   footer_client_cabinet: "Kundenbereich für Buchungen",
//   footer_client_admin: "Kooperation mit Stylisten",
//   footer_client_partnership_title: "Partnerschaft mit Stylisten",
//   footer_client_partnership_text:
//     "Suchen Sie einen modernen Salon mit transparentem Online-Kalender und fairen Konditionen? Schreiben Sie uns – wir besprechen gern die Zusammenarbeit.",

//   footer_top_title:
//     "Ihr Schönheitssalon mit Online-Termin und Liebe zum Detail",
//   footer_top_text:
//     "Professionelle Stylisten, moderne Techniken und eine wohltuende Atmosphäre – wir helfen Ihnen, sich jeden Tag sicher und wohl zu fühlen. Die Buchung dauert nur wenige Minuten, der Effekt hält lange an.",
//   footer_top_chip_online: "Online-Termin 24/7",
//   footer_top_chip_premium: "Premium-Service",

//   footer_quick_title: "In wenigen Klicks zum Termin",
//   footer_quick_text:
//     "Die Online-Buchung ist rund um die Uhr verfügbar – wir bestätigen Ihren Besuch so schnell wie möglich.",
//   footer_quick_step1: "Leistung wählen",
//   footer_quick_step2: "Stylisten wählen",
//   footer_quick_step3: "Uhrzeit bestätigen",
//   footer_quick_adv1: "Online-Terminservice der Premium-Klasse",
//   footer_quick_adv2: "Flexible Zeiten passend zu Ihrem Alltag",

//   footer_socials_instagram_hint: "Instagram des Salons öffnen",
//   footer_socials_facebook_hint: "Facebook-Seite öffnen",
//   footer_socials_youtube_hint: "YouTube-Kanal öffnen",

//   footer_messenger_email: "E-Mail schreiben",
//   footer_messenger_call: "Anrufen",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Dienstleistung",
//   booking_step_master: "Meister",
//   booking_step_date: "Datum",
//   booking_step_client: "Daten",
//   booking_step_verify: "Prüfung",
//   booking_step_payment: "Zahlung",

//   booking_loading_text: "Dienstleistungen werden geladen…",
//   booking_error_loading: "Fehler beim Laden",
//   booking_error_retry: "Erneut versuchen",

//   // SERVICES PAGE – hero (step-based)
//   booking_hero_badge: "Schritt 1 — Wählen Sie Ihre Dienstleistungen",
//   booking_hero_title: "Online-Buchung",
//   booking_hero_subtitle: "Wählen Sie die Dienstleistungen, die Sie benötigen",

//   booking_category_all: "Alle",
//   booking_price_on_request: "Auf Anfrage",
//   booking_minutes: "Minuten",
//   booking_bar_selected_label: "Ausgewählt:",
//   booking_minutes_short: "Min",

//   booking_continue: "Weiter",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Meister",
//   booking_master_default_bio: "Premium-Meister des Schönheitssalons",
//   booking_master_online_booking: "Online-Buchung",
//   booking_master_premium: "Premium-Meister",

//   booking_master_no_services: "Keine Dienstleistungen ausgewählt",
//   booking_master_load_error: "Meister konnten nicht geladen werden",
//   booking_master_no_available: "Kein passender Meister",
//   booking_master_different_masters:
//     "Die ausgewählten Dienstleistungen werden von verschiedenen Meistern durchgeführt",
//   booking_master_choose_same_specialist:
//     "Wählen Sie ein Set von Dienstleistungen eines Spezialisten oder kehren Sie zur Auswahl zurück",
//   booking_master_back_to_services: "Zurück zu Dienstleistungen",

//   booking_master_step_title: "Schritt 2 — Auswahl des Premium-Meisters",
//   booking_master_hero_title: "Meisterauswahl",
//   booking_master_hero_subtitle:
//     "Unsere Experten schaffen für Sie das perfekte Bild",
//   booking_master_back_button: "Zurück zur Dienstleistungsauswahl",

//   booking_error_title: "Fehler",
// };

// /* ==================== ENGLISH (EN) ==================== */

// const enMessages: BaseMessages = {
//   // Navigation
//   nav_home: "Home",
//   nav_services: "Services",
//   nav_prices: "Prices",
//   nav_contacts: "Contacts",
//   nav_news: "News",
//   nav_about: "About us",
//   nav_admin: "Admin",

//   // Hero
//   hero_tagline: "Salon Elen – beauty and care in Halle",
//   hero_subtitle:
//     "Hairdressing, manicure, skin care and make-up. Book online – fast and convenient.",
//   hero_cta_book: "Book now",
//   hero_cta_services: "All services",
//   hero_badge: "Online booking 24/7 • In the center of Halle",

//   // Home – popular services
//   home_services_title: "Popular services",
//   home_services_subtitle: "What we do best",
//   home_services_card1_title: "Women’s haircut",
//   home_services_card1_text: "We highlight your style and individuality.",
//   home_services_card2_title: "Manicure",
//   home_services_card2_text:
//     "Aesthetics, hygiene and long-lasting coating.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text:
//     "We create the right look for any occasion.",

//   // Home – news
//   home_news_title: "News & articles",
//   home_news_subtitle: "Fresh updates and useful tips",
//   home_news_empty: "No posts have been published yet.",

//   // Home – bottom CTA
//   home_cta_title: "Ready for a change?",
//   home_cta_text:
//     "Book your appointment online – we’ll find the perfect care and style for you.",
//   home_cta_button: "Book now",

//   // Auth
//   auth_login: "Sign in",
//   auth_logout: "Sign out",

//   // Footer – salon
//   footer_about_section: "Salon & Location",
//   footer_about_description:
//     "We create an atmosphere of comfort and beauty using professional cosmetics and modern care techniques.",

//   footer_location_section: "Our address",
//   footer_address_label: "Leipziger Straße 70, Halle (Saale)",

//   footer_hours_label: "Opening hours",
//   footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
//   footer_hours_saturday: "Sat: 10:00 – 16:00",
//   footer_hours_sunday: "Sun: closed",

//   footer_navigation_section: "Navigation",

//   footer_clients_section: "For clients and stylists",

//   footer_socials_section: "Social Media & Messengers",

//   footer_privacy: "Privacy Policy",
//   footer_terms: "Terms of Use",
//   footer_back_to_top: "Back to top",

//   footer_copyright: "All rights reserved.",

//   footer_contacts_title: "Contacts",

//   footer_client_booking: "Online booking",
//   footer_client_cabinet: "Client booking account",
//   footer_client_admin: "Stylist cooperation",
//   footer_client_partnership_title: "Partnership with stylists",
//   footer_client_partnership_text:
//     "Looking for a modern salon with a transparent online schedule and comfortable conditions? Contact us and we’ll discuss cooperation.",

//   footer_top_title:
//     "Your beauty salon with online booking and attention to detail",
//   footer_top_text:
//     "Professional stylists, modern techniques and a truly warm atmosphere – we help you feel confident every day. Booking takes just a few minutes, while the effect lasts much longer.",
//   footer_top_chip_online: "Online booking 24/7",
//   footer_top_chip_premium: "Premium service",

//   footer_quick_title: "Book your visit in a few clicks",
//   footer_quick_text:
//     "Online booking is available 24/7 – we’ll confirm your appointment as quickly as possible.",
//   footer_quick_step1: "Choose a service",
//   footer_quick_step2: "Choose a stylist",
//   footer_quick_step3: "Confirm the time",
//   footer_quick_adv1: "Premium-level online booking",
//   footer_quick_adv2: "Convenient time slots for your schedule",

//   footer_socials_instagram_hint: "Open the salon’s Instagram",
//   footer_socials_facebook_hint: "Open the Facebook page",
//   footer_socials_youtube_hint: "Open the YouTube channel",

//   footer_messenger_email: "Send an email",
//   footer_messenger_call: "Call us",

//   /* ========= BOOKING ========= */

//   booking_step_services: "Service",
//   booking_step_master: "Master",
//   booking_step_date: "Date",
//   booking_step_client: "Details",
//   booking_step_verify: "Verify",
//   booking_step_payment: "Payment",

//   booking_loading_text: "Loading services…",
//   booking_error_loading: "Loading error",
//   booking_error_retry: "Try Again",

//   // SERVICES PAGE – hero
//   booking_hero_badge: "Step 1 — Choose Your Services",
//   booking_hero_title: "Online Booking",
//   booking_hero_subtitle: "Select the services you need",

//   booking_category_all: "All",
//   booking_price_on_request: "On Request",
//   booking_minutes: "minutes",
//   booking_bar_selected_label: "Selected:",
//   booking_minutes_short: "min",

//   booking_continue: "Continue",

//   // MASTER PAGE
//   booking_master_vip_badge: "VIP Master",
//   booking_master_default_bio: "Premium beauty salon master",
//   booking_master_online_booking: "Online Booking",
//   booking_master_premium: "Premium Master",

//   booking_master_no_services: "No services selected",
//   booking_master_load_error: "Failed to load masters",
//   booking_master_no_available: "No suitable master",
//   booking_master_different_masters:
//     "Selected services are performed by different masters",
//   booking_master_choose_same_specialist:
//     "Choose a set of services from one specialist or return to selection",
//   booking_master_back_to_services: "Back to Services",

//   booking_master_step_title: "Step 2 — Premium Master Selection",
//   booking_master_hero_title: "Master Selection",
//   booking_master_hero_subtitle: "Our experts will create the perfect look for you",
//   booking_master_back_button: "Back to Service Selection",

//   booking_error_title: "Error",
// };

// /* ==================== EXPORT ==================== */

// export const messages: Record<Locale, BaseMessages> = {
//   ru: ruMessages,
//   de: deMessages,
//   en: enMessages,
// };

// export function translate(locale: Locale, key: MessageKey): string {
//   const dict = messages[locale] ?? messages.ru;
//   return dict[key] ?? key;
// }





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







