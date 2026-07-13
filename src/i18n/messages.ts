// src/i18n/messages.ts
import type { Locale } from "./locales";

// Все текстовые ключи проекта
export type BaseMessages = {
  // ======= Навигация =======
  nav_home: string;
  nav_services: string;
  nav_prices: string;
  nav_gallery: string;
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
  footer_cookie_settings: string;
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
  site_name: string;
  booking_header_subtitle: string;
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
  booking_calendar_slot_taken: string;
  booking_calendar_reserve_error: string;

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

  // ======= BOOKING - PHONE & BIRTHDAY PAGE (NEW) =======
  phone_title: string;
  phone_subtitle: string;
  phone_label: string;
  phone_hint: string;
  phone_required: string;
  phone_submit: string;
  phone_submitting: string;
  phone_privacy: string;
  birthday_label: string;
  birthday_hint: string;

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
  booking_verify_email_sent_message: string;
  booking_verify_email_api_missing_params: string;
  booking_verify_email_api_draft_not_found: string;
  booking_verify_email_api_email_mismatch: string;
  booking_verify_email_api_send_failed: string;
  booking_verify_email_api_error: string;

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
  booking_email_otp_subject: string;
  booking_email_otp_title: string;
  booking_email_otp_header_subtitle: string;
  booking_email_otp_greeting: string;
  booking_email_otp_code_intro: string;
  booking_email_otp_expires_label: string;
  booking_email_otp_expires_text: string;
  booking_email_otp_ignore: string;
  booking_email_otp_footer_tagline: string;
  booking_email_otp_footer_contact: string;
  booking_email_otp_footer_note: string;

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
  // booking_payment_online_benefit_1: string;
  // booking_payment_online_benefit_2: string;
  // booking_payment_online_benefit_3: string;

  booking_payment_info_title: string;
  booking_payment_info_desc: string;
  booking_payment_confirm_button: string;
  booking_payment_confirm_terms: string;
  booking_payment_info_how_works_title: string;
  booking_payment_info_how_works_desc: string;

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
  booking_payment_success_apple_calendar: string;
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

  // ======= GOOGLE CALENDAR =======
  calendar_title_appointment_in: string;
  calendar_description_title: string;
  calendar_service: string;
  calendar_master: string;
  calendar_date: string;
  calendar_time: string;
  calendar_duration: string;
  calendar_duration_minutes: string;
  calendar_appointment_id: string;
  calendar_address: string;
  calendar_contacts: string;
  calendar_phone: string;
  calendar_reschedule_notice: string;
  calendar_see_you: string;
  calendar_location: string;

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

  // SMS VERIFICATION PAGE
  booking_sms_verify_title: string;
  booking_sms_verify_subtitle: string;
  booking_sms_verify_phone_label: string;
  booking_sms_verify_phone_placeholder: string;
  booking_sms_verify_phone_hint: string;
  booking_sms_verify_phone_required: string;
  booking_sms_verify_send_pin: string;
  booking_sms_verify_sending: string;
  booking_sms_verify_pin_validity: string;

  booking_sms_verify_pin_title: string;
  booking_sms_verify_pin_subtitle: string;
  booking_sms_verify_pin_label: string;
  booking_sms_verify_pin_placeholder: string;
  booking_sms_verify_pin_hint: string;
  booking_sms_verify_confirm: string;
  booking_sms_verify_checking: string;
  booking_sms_verify_resend: string;
  booking_sms_verify_change_phone: string;
  booking_sms_verify_pin_validity_note: string;

  booking_sms_verify_error_title: string;
  booking_sms_verify_error_missing_params: string;
  booking_sms_verify_error_return: string;

  booking_sms_verify_contact: string;

  // SMS DETAILS PAGE
  booking_sms_details_title: string;
  booking_sms_details_subtitle: string;
  booking_sms_details_name_label: string;
  booking_sms_details_name_placeholder: string;
  booking_sms_details_name_required: string;
  booking_sms_details_email_label: string;
  booking_sms_details_email_placeholder: string;
  booking_sms_details_email_hint: string;
  booking_sms_details_birth_label: string;
  booking_sms_details_birth_hint: string;
  booking_sms_details_submit: string;
  booking_sms_details_submitting: string;
  booking_sms_details_privacy: string;

  booking_sms_details_error_title: string;
  booking_sms_details_error_missing_id: string;
  booking_sms_details_error_return: string;

  booking_sms_details_contact: string;

  // SMS CARD (CLIENT CHOICE PAGE)
  booking_client_sms_title: string;
  booking_client_sms_description: string;
  booking_client_sms_benefit_1: string;
  booking_client_sms_benefit_2: string;
  booking_client_sms_benefit_3: string;
  booking_client_sms_benefit_4: string;
  booking_client_sms_button: string;
  booking_client_sms_security: string;

  // STRIPE PAYMENT
booking_payment_stripe_title: string;
booking_payment_stripe_desc: string;
booking_payment_stripe_benefit_1: string;
booking_payment_stripe_benefit_2: string;
booking_payment_stripe_benefit_3: string;
booking_payment_stripe_amount: string;
booking_payment_stripe_secure: string;
booking_payment_stripe_processing: string;
booking_payment_stripe_pay: string;
booking_payment_stripe_note: string;

// PAYPAL PAYMENT
booking_payment_paypal_title: string;
booking_payment_paypal_desc: string;
booking_payment_paypal_benefit_1: string;
booking_payment_paypal_benefit_2: string;
booking_payment_paypal_benefit_3: string;
booking_payment_paypal_amount: string;
booking_payment_paypal_secure: string;
booking_payment_paypal_note: string;
booking_payment_paypal_footer: string;

// ======= BOOKING - TELEGRAM CARD =======
  booking_client_telegram_title: string;
  booking_client_telegram_description: string;
  booking_client_telegram_benefit_1: string;
  booking_client_telegram_benefit_2: string;
  booking_client_telegram_benefit_3: string;
  booking_client_telegram_benefit_4: string;
  booking_client_telegram_button: string;
  booking_client_telegram_security: string;

  // ======= BOOKING - TELEGRAM VERIFICATION PAGE =======
  booking_telegram_verify_title: string;
  booking_telegram_verify_subtitle: string;

  booking_telegram_verify_step1_title: string;
  booking_telegram_verify_step1_subtitle: string;
  booking_telegram_verify_phone_label: string;
  booking_telegram_verify_phone_placeholder: string;
  booking_telegram_verify_phone_hint: string;
  booking_telegram_verify_phone_required: string;
  booking_telegram_verify_send_code: string;
  booking_telegram_verify_sending: string;

  booking_telegram_verify_step2_title: string;
  booking_telegram_verify_step2_subtitle: string;
  booking_telegram_verify_code_label: string;
  booking_telegram_verify_code_placeholder: string;
  booking_telegram_verify_code_hint: string;
  booking_telegram_verify_code_required: string;
  booking_telegram_verify_check_code: string;
  booking_telegram_verify_checking: string;
  booking_telegram_verify_resend: string;

  booking_telegram_verify_step3_title: string;
  booking_telegram_verify_step3_subtitle: string;
  booking_telegram_verify_email_label: string;
  booking_telegram_verify_email_placeholder: string;
  booking_telegram_verify_email_hint: string;
  booking_telegram_verify_birth_label: string;
  booking_telegram_verify_birth_hint: string;
  booking_telegram_verify_complete: string;
  booking_telegram_verify_completing: string;

  booking_telegram_verify_privacy: string;
  booking_telegram_verify_error_title: string;
  booking_telegram_verify_error_missing: string;
  booking_telegram_verify_error_return: string;

  // ======= BOOKING - TELEGRAM REGISTRATION MODAL =======
  booking_telegram_modal_title: string;
  booking_telegram_modal_subtitle: string;
  booking_telegram_modal_phone_label: string;
  booking_telegram_modal_how_title: string;
  booking_telegram_modal_step_open_bot: string;
  booking_telegram_modal_step_register: string;
  booking_telegram_modal_step_done: string;
  booking_telegram_modal_button_open: string;
  booking_telegram_modal_button_done: string;
  booking_telegram_modal_note: string;

  // ======= BOOKING - TELEGRAM VERIFY MESSAGES =======
  booking_telegram_verify_error_send: string;
  booking_telegram_verify_error_expired: string;
  booking_telegram_verify_error_invalid_code: string;
  booking_telegram_verify_error_session: string;
  booking_telegram_verify_error_create: string;
  booking_telegram_verify_error_complete: string;
  booking_telegram_verify_error_check: string;
  booking_telegram_verify_success_sent: string;
  booking_telegram_verify_success_verified: string;
  booking_telegram_verify_success_creating: string;
  booking_telegram_verify_back: string;

  // ======= BOOKING - CONFIRMATION PAGE =======
  booking_confirmation_error_title: string;
  booking_confirmation_error_missing_id: string;
  booking_confirmation_error_cta: string;
  booking_confirmation_title: string;
  booking_confirmation_subtitle: string;
  booking_confirmation_details_number_label: string;
  booking_confirmation_details_status_label: string;
  booking_confirmation_status_pending: string;
  booking_confirmation_action_home: string;
  booking_confirmation_action_new: string;
  booking_confirmation_notice_title: string;
  booking_confirmation_notice_body: string;
  booking_confirmation_loading: string;

  // ======= BOOKING - CLIENT PAGE =======
  booking_client_page_title: string;
  booking_client_page_description: string;
  booking_client_params_error_title: string;
  booking_client_params_error_text: string;
  booking_client_params_error_return: string;

  // ======= BOOKING - CLIENT STEP =======
  booking_client_step_start_label: string;
  booking_client_step_end_label: string;
  booking_client_step_name_label: string;
  booking_client_step_name_placeholder: string;
  booking_client_step_phone_label: string;
  booking_client_step_phone_placeholder: string;
  booking_client_step_email_label: string;
  booking_client_step_email_placeholder: string;
  booking_client_step_notes_label: string;
  booking_client_step_notes_placeholder: string;
  booking_client_step_back: string;
  booking_client_step_continue: string;

  // ======= EMAIL NOTIFICATIONS =======
  email_service_not_configured: string;
  email_send_unknown_error: string;
  email_status_subject_pending: string;
  email_status_subject_confirmed: string;
  email_status_subject_done: string;
  email_status_subject_canceled: string;
  email_status_text_pending: string;
  email_status_text_confirmed: string;
  email_status_text_done: string;
  email_status_text_canceled: string;
  email_status_message_pending: string;
  email_status_message_confirmed_intro: string;
  email_status_message_confirmed_wait: string;
  email_status_message_confirmed_notice_title: string;
  email_status_message_confirmed_notice_text: string;
  email_status_message_done_intro: string;
  email_status_message_done_outro: string;
  email_status_message_done_tip_title: string;
  email_status_message_done_tip_text: string;
  email_status_review_title: string;
  email_status_review_text: string;
  email_status_review_button: string;
  review_prompt_label: string;
  review_prompt_1: string;
  review_prompt_2: string;
  review_prompt_3: string;
  review_prompt_4: string;
  review_prompt_5: string;
  email_status_loyalty_title: string;
  email_status_loyalty_text: string;
  email_status_message_canceled_intro: string;
  email_status_message_canceled_contact_intro: string;
  email_status_message_canceled_contact: string;
  email_status_html_title: string;
  email_status_header_subtitle: string;
  email_status_greeting: string;
  email_status_details_title: string;
  email_status_details_status_label: string;
  email_status_details_service_label: string;
  email_status_details_master_label: string;
  email_status_details_datetime_label: string;
  email_status_cta_button: string;
  email_status_footer_tagline: string;
  email_status_footer_address: string;
  email_status_footer_contacts: string;
  email_status_footer_note: string;
  email_test_subject: string;
  email_test_title: string;
  email_test_body: string;
  email_test_footer: string;

  // ======= TELEGRAM BOT =======
  telegram_code_title: string;
  telegram_code_intro: string;
  telegram_code_expires: string;
  telegram_payment_status_paid: string;
  telegram_payment_status_pending: string;
  telegram_payment_status_failed: string;
  telegram_payment_status_refunded: string;
  telegram_payment_status_unknown: string;
  telegram_admin_new_title: string;
  telegram_admin_label_date: string;
  telegram_admin_label_time: string;
  telegram_admin_label_client: string;
  telegram_admin_label_phone: string;
  telegram_admin_label_email: string;
  telegram_admin_label_service: string;
  telegram_admin_label_master: string;
  telegram_admin_label_payment: string;
  telegram_admin_label_id: string;
  telegram_admin_open_button: string;
  telegram_client_status_title_pending: string;
  telegram_client_status_title_confirmed: string;
  telegram_client_status_title_done: string;
  telegram_client_status_title_canceled: string;
  telegram_client_status_text_pending: string;
  telegram_client_status_text_confirmed: string;
  telegram_client_status_text_done: string;
  telegram_client_status_text_canceled: string;
  telegram_client_status_message_pending: string;
  telegram_client_status_message_confirmed: string;
  telegram_client_status_message_done: string;
  telegram_client_status_message_canceled: string;
  telegram_client_review_text: string;
  telegram_client_review_discount: string;
  telegram_client_review_button: string;
  telegram_client_greeting: string;
  telegram_client_label_date: string;
  telegram_client_label_time: string;
  telegram_client_label_service: string;
  telegram_client_label_master: string;
  telegram_client_label_status: string;
  telegram_start_title: string;
  telegram_start_prompt: string;
  telegram_start_after: string;
  telegram_button_send_phone: string;
  telegram_contact_saved_title: string;
  telegram_contact_saved_phone: string;
  telegram_contact_saved_ready: string;
  telegram_request_contact_prompt: string;

  // ======= API MESSAGES =======
  api_telegram_send_to_registered_missing_params: string;
  api_telegram_send_to_registered_user_not_found: string;
  api_telegram_send_to_registered_code_not_found: string;
  api_telegram_send_to_registered_success: string;
  api_telegram_send_to_registered_error: string;
  api_email_check_missing: string;
  api_email_check_invalid: string;
  api_email_check_too_long: string;
  api_email_check_error: string;
  api_google_oauth_not_configured: string;
  api_google_oauth_missing_params: string;
  api_google_oauth_draft_not_found: string;
  api_google_oauth_email_mismatch: string;
  api_google_oauth_generated: string;
  api_google_oauth_error: string;
  api_google_status_missing_params: string;
  api_google_status_error: string;
  api_google_callback_access_denied: string;
  api_google_callback_invalid_params: string;
  api_google_callback_invalid_state: string;
  api_google_callback_expired: string;
  api_google_callback_already_verified: string;
  api_google_callback_missing_email: string;
  api_google_callback_email_mismatch: string;
  api_google_callback_draft_not_found: string;
  api_google_callback_slot_taken: string;
  api_google_callback_error: string;
  api_email_confirm_missing_fields: string;
  api_email_confirm_invalid_code: string;
  api_email_confirm_draft_not_found: string;
  api_email_confirm_success: string;
  api_email_confirm_slot_taken: string;
  api_email_confirm_error: string;
  api_payment_missing_params: string;
  api_payment_invalid_method: string;
  api_payment_not_found: string;
  api_payment_unknown_service: string;
  api_payment_note_prefix: string;
  api_payment_card_redirect: string;
  api_payment_paypal_redirect: string;
  api_payment_cash: string;
  api_payment_unknown_method: string;
  api_payment_error: string;
  api_admin_clients_unauthorized: string;
  api_admin_clients_missing_fields: string;
  api_admin_clients_duplicate_active: string;
  api_admin_clients_duplicate_deleted: string;
  api_admin_clients_duplicate_suggestion: string;
  api_admin_clients_created: string;
  api_admin_clients_error: string;

    // ======= CONTACTS (NEW) =======
  contacts_seo_description: string;

  contacts_subtitle: string;
  contacts_title: string;
  contacts_intro: string;

  contacts_quick_title: string;

  contacts_quick_call: string;
  contacts_quick_book: string;
  contacts_quick_route: string;

  contacts_details_title: string;

  contacts_open_maps: string;

  contacts_map_title: string;
  contacts_map_caption: string;
  contacts_show_map: string;
  contacts_map_privacy: string;

  contacts_address_label: string;
  contacts_phone_label: string;
  contacts_email_label: string;
  contacts_hours_label: string;
  contacts_hours_value: string;

  contacts_form_title: string;
  contacts_form_name: string;
  contacts_form_phone: string;
  contacts_form_message: string;
  contacts_form_send: string;
  contacts_form_note: string;



};

export type MessageKey = keyof BaseMessages;

/* ==================== RUSSIAN (RU) ==================== */

const ruMessages: BaseMessages = {
  booking_verify_email_sent_message: "Код отправлен на email",
  booking_verify_email_api_missing_params: "Email и draftId обязательны",
  booking_verify_email_api_draft_not_found: "Черновик записи не найден",
  booking_verify_email_api_email_mismatch: "E-mail не совпадает с данными черновика",
  booking_verify_email_api_send_failed: "Ошибка отправки кода на email",
  booking_verify_email_api_error: "Ошибка отправки кода",
  booking_email_otp_subject: "Код подтверждения записи - Salon Elen",
  booking_email_otp_title: "Код подтверждения",
  booking_email_otp_header_subtitle: "Подтверждение записи",
  booking_email_otp_greeting: "Здравствуйте!",
  booking_email_otp_code_intro: "Ваш код подтверждения для завершения записи:",
  booking_email_otp_expires_label: "Важно:",
  booking_email_otp_expires_text: "Код действителен в течение {minutes} минут.",
  booking_email_otp_ignore:
    "Если вы не оформляли запись в Salon Elen, просто проигнорируйте это письмо.",
  booking_email_otp_footer_tagline: "Salon Elen - Ваша красота, наша забота 💖",
  booking_email_otp_footer_contact: "📧 booking@news.permanent-halle.de",
  booking_email_otp_footer_note: "Это автоматическое письмо. Пожалуйста, не отвечайте на него.",
  // Навигация
  nav_home: "Главная",
  nav_services: "Услуги",
  nav_prices: "Цены",
  nav_gallery: "Галерея",
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
  footer_address_label: "Lessingstrasse 37, Halle (Saale)",

  footer_hours_label: "График работы",
  footer_hours_weekdays: "Пн–Пт: 10:00 – 19:00",
  footer_hours_saturday: "Сб: 10:00 – 16:00",
  footer_hours_sunday: "Вс: выходной",

  footer_navigation_section: "Навигация",

  footer_clients_section: "Для клиентов и мастеров",

  footer_socials_section: "Соцсети & Мессенджеры",

  footer_privacy: "Политика конфиденциальности",
  footer_cookie_settings: "Настройки cookies",
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
  site_name: "Salon Elen",
  booking_header_subtitle: "Премиальный букинг",
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
  booking_master_hero_subtitle:
    "Наши эксперты создадут для вас идеальный образ",
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
  booking_calendar_available_slots: "Доступно слотов:",
  booking_calendar_slot_taken: "Этот слот только что забронировал другой клиент. Пожалуйста, выберите другое время.",
  booking_calendar_reserve_error: "Ошибка резервирования. Попробуйте еще раз.",

  // ======= BOOKING - CLIENT CHOICE PAGE =======
  booking_client_choice_title: "Как вы хотите продолжить?",
  booking_client_choice_subtitle: "Выберите удобный способ регистрации",
  booking_client_choice_recommended: "Рекомендуем",

  booking_client_google_title: "Быстрая регистрация",
  booking_client_google_description:
    "Войдите через Google и сразу перейдите к оплате",
  booking_client_google_benefit_1: "Один клик до оплаты",
  booking_client_google_benefit_2: "Автозаполнение данных",
  booking_client_google_benefit_3: "Безопасно и надёжно",
  booking_client_google_benefit_4: "Экономия времени",
  booking_client_google_button: "Начать за 1 клик",
  booking_client_google_security: "Защищено Google OAuth 2.0",
  booking_client_google_connecting: "Подключение...",

  booking_client_form_title: "Заполнить форму",
  booking_client_form_description:
    "Традиционный способ с полным контролем над данными",
  booking_client_form_benefit_1: "Полный контроль данных",
  booking_client_form_benefit_2: "Без Google аккаунта",
  booking_client_form_benefit_3: "Привычный процесс",
  booking_client_form_benefit_4: "Верификация через Telegram",
  booking_client_form_button: "Заполнить форму",
  booking_client_form_security: "Подтверждение через Telegram Bot",

  booking_client_choice_footer: "Все способы безопасны и надёжны.",
  booking_client_choice_footer_highlight: "Выберите тот, который вам удобнее.",

  booking_client_popup_blocked:
    "Не удалось открыть окно. Разрешите всплывающие окна в браузере.",
  booking_client_google_error_init: "Ошибка инициализации Google OAuth",
  booking_client_auth_error: "Ошибка авторизации",
  booking_client_auth_waiting: "Ожидаем подтверждение через Google...",

  // ======= BOOKING - CLIENT FORM PAGE =======
  booking_client_form_badge: "Шаг 4 — Ваши контактные данные",
  booking_client_form_hero_title: "Онлайн-запись",
  booking_client_form_hero_subtitle:
    "Укажите ваши данные, чтобы мы подтвердили бронь",

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
  booking_client_form_placeholder_comment:
    "Дополнительная информация или пожелания",
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
  booking_client_form_error_birth_underage:
    "Для онлайн-записи требуется возраст 16+",
  booking_client_form_error_referral: "Выберите вариант",
  booking_client_form_error_referral_other: "Уточните источник",

  booking_client_form_email_checking: "Проверка e-mail…",
  booking_client_form_email_verified: "E-mail подтверждён",

  booking_client_form_age_requirement:
    "Для онлайн-записи требуется возраст 16+",
  booking_client_form_email_error_note:
    "Если вы допустите ошибку в адресе, вы всё равно сможете прийти на приём, но не получите напоминания и подтверждения.",

  booking_client_form_button_back: "Назад",
  booking_client_form_button_submit: "Забронировать",
  booking_client_form_button_submitting: "Проверка данных…",

  booking_client_form_info_title: "Почему мы просим e-mail?",
  booking_client_form_info_point_1: "На ваш e-mail мы отправим",
  booking_client_form_info_point_1_highlight:
    "подтверждение брони и все детали записи",
  booking_client_form_info_point_2: "Вы получите",
  booking_client_form_info_point_2_highlight: "напоминание перед визитом",
  booking_client_form_info_point_3:
    "Мы бережно относимся к персональным данным и используем ваш e-mail только для обслуживания вашей записи",

  booking_client_form_invalid_params:
    "Некорректные параметры. Пожалуйста, начните запись заново.",
  booking_client_form_invalid_return: "Вернуться к выбору услуг",

  // ======= BOOKING - PHONE & BIRTHDAY PAGE (NEW) =======
  phone_title: "Контактная информация",
  phone_subtitle: "Укажите ваши контактные данные для связи",
  phone_label: "Телефон",
  phone_hint: "Мы свяжемся с вами для подтверждения записи",
  phone_required: "Номер телефона обязателен",
  phone_submit: "Продолжить",
  phone_submitting: "Отправка...",
  phone_privacy: "Ваши данные защищены и не передаются третьим лицам",
  birthday_label: "Дата рождения",
  birthday_hint:
    "Нам нужна Ваша дата рождения, чтобы мы могли в будущем предоставить Вам индивидуальную скидку к Вашему празднику!",

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
  booking_verify_email_wrong_hint:
    "Если email неверный, вернитесь на предыдущий шаг",
  booking_verify_email_send_code: "Отправить код",
  booking_verify_email_sending: "Отправка…",
  booking_verify_email_arrives_hint: "Код приходит в течение нескольких секунд",
  booking_verify_email_enter_code: "Введите 6-значный код",
  booking_verify_email_code_valid: "Код действителен ограниченное время",
  booking_verify_email_confirm_code: "Подтвердить код",
  booking_verify_email_checking: "Проверка…",
  booking_verify_email_resend: "Отправить код повторно",
  booking_verify_info_title: "Безопасное подтверждение",
  booking_verify_info_desc:
    "Мы используем одноразовый код для защиты ваших данных и расписания салона",
  booking_verify_info_arrives: "Код приходит за 1–2 минуты",
  booking_verify_info_check_spam: "Проверьте папку «Спам»",
  booking_verify_info_check_email: "Убедитесь в правильности email",
  booking_verify_info_resend_if_needed:
    "Запросите код повторно при необходимости",
  booking_verify_info_progress_title: "Ваш прогресс",
  booking_verify_info_progress_1: "Выбрали услугу и мастера",
  booking_verify_info_progress_2: "Указали дату и время",
  booking_verify_info_progress_3: "Заполнили контактные данные",
  booking_verify_info_progress_4: "Сейчас — подтверждение email",
  booking_verify_info_progress_5: "Далее — оплата",
  booking_verify_info_support:
    "При возникновении сложностей свяжитесь с нами — мы поможем завершить запись",
  booking_verify_invalid_params:
    "Некорректные параметры. Пожалуйста, начните запись заново.",
  booking_verify_invalid_return: "Вернуться к выбору услуг",
  booking_verify_google_title: "Подтвердите через Google",
  booking_verify_google_desc:
    "Войдите через свой Google аккаунт для быстрого и безопасного подтверждения бронирования.",
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
  booking_verify_google_security_desc:
    "Мы не получаем доступ к вашему паролю Google. Используется официальный OAuth протокол.",
  booking_verify_google_success:
    "✅ Подтверждено через Google! Переход к оплате...",
  booking_verify_google_preparing_window: "🔐 Google откроется в новом окне...",
  booking_verify_google_allow_popups:
    "⚠️ Разрешите всплывающие окна и нажмите кнопку ниже.",
  booking_verify_telegram_title: "Подтвердите через Telegram",
  booking_verify_telegram_desc_registered:
    "Код отправлен в Telegram бот. Проверьте сообщения и нажмите кнопку подтверждения.",
  booking_verify_telegram_desc_unregistered:
    "Telegram откроется автоматически. Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте.",
  booking_verify_telegram_sending_code: "Отправка кода...",
  booking_verify_telegram_open_button: "Открыть Telegram",
  booking_verify_telegram_reopen_button: "Открыть Telegram повторно",
  booking_verify_telegram_waiting_bot:
    "Ожидание подтверждения в Telegram боте...",
  booking_verify_telegram_waiting: "Ожидание подтверждения...",
  booking_verify_telegram_divider: "или",
  booking_verify_telegram_enter_code: "Введите 6-значный код из Telegram",
  booking_verify_telegram_code_placeholder: "000000",
  booking_verify_telegram_code_valid: "Код действителен 10 минут.",
  booking_verify_telegram_confirm_button: "Подтвердить код",
  booking_verify_telegram_checking: "Проверка...",
  booking_verify_telegram_code_sent:
    "✈️ Код отправлен в Telegram! Проверьте бота и нажмите кнопку подтверждения.",
  booking_verify_telegram_opening:
    "✈️ Telegram открывается... Ожидание подтверждения.",
  booking_verify_telegram_click_button:
    "⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.",
  booking_verify_telegram_success:
    "✅ Подтверждено через Telegram! Переход к оплате...",
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
  // booking_payment_online_benefit_1: "Карта, Apple Pay, Google Pay",
  // booking_payment_online_benefit_2: "В разработке",
  // booking_payment_online_benefit_3: "Запись всё равно будет подтверждена",
  booking_payment_info_title: "Как это работает?",
  booking_payment_info_desc:
    "Система уже создала запись в расписании салона. Оплата фиксируется на стороне салона. Онлайн-оплата будет добавлена позже.",
  // Инфо блок - АКТУАЛЬНЫЙ текст
booking_payment_info_how_works_title: "Как это работает?",
booking_payment_info_how_works_desc: "Система уже создала запись в расписании салона. Вы можете оплатить онлайн картой (Stripe) или через PayPal, либо оплатить наличными/картой в салоне после услуги.",
  booking_payment_confirm_button: "Подтвердить запись",
  booking_payment_confirm_terms:
    "Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона",
  booking_payment_summary_title: "Резюме записи",
  booking_payment_summary_visit: "Ваш визит в SalonElen",
  booking_payment_summary_service: "Услуга из записи (Appointment)",
  booking_payment_summary_master: "Мастер из записи",
  booking_payment_summary_datetime: "Дата и время по ID:",
  booking_payment_summary_address: "Адрес салона",
  booking_payment_summary_cancellation_title: "Политика отмены",
  booking_payment_summary_cancellation_desc:
    "Если вы не сможете прийти, пожалуйста, отмените запись заранее — это позволит освободить время для других гостей салона.",
  booking_payment_summary_future_note:
    "После запуска онлайн-оплаты здесь появится блок выбора платёжного метода и статус платежа",
  booking_payment_success_title: "Запись подтверждена!",
  booking_payment_success_desc:
    "Ваша запись успешно подтверждена. Оплата будет произведена в салоне.",
  booking_payment_success_home: "На главную страницу",
  booking_payment_success_calendar: "Добавить в Google Calendar",
  booking_payment_success_apple_calendar: "Добавить в Apple Calendar",
  booking_payment_success_new: "Сделать новую запись",
  booking_payment_error_title: "Ошибка при переходе к оплате",
  booking_payment_error_desc:
    "Мы не смогли найти идентификатор записи. Возможно, ссылка устарела или шаг подтверждения email был пропущен.",
  booking_payment_error_return: "Вернуться к записи",
  booking_payment_error_missing:
    "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
  booking_success_page_title: "Онлайн-запись",
  booking_success_page_subtitle: "Успех",
  booking_success_loading: "Загрузка...",
  booking_success_loading_data: "Загружаем данные…",
  booking_success_error_title: "Ошибка",
  booking_success_error_not_found: "ID записи не найден",
  booking_success_error_load_failed: "Не удалось загрузить данные записи",
  booking_success_error_return: "Вернуться к бронированию",
  booking_success_title: "Запись подтверждена!",
  booking_success_desc:
    "Ваша запись успешно создана. Мы отправили подтверждение на вашу почту.",
  booking_success_details_title: "Детали записи:",
  booking_success_details_name: "Имя",
  booking_success_details_email: "Email",
  booking_success_details_phone: "Телефон",
  booking_success_details_datetime: "Дата и время",
  booking_success_button_new: "Создать новую запись",
  booking_success_button_home: "На главную",

  calendar_title_appointment_in: "в SalonElen",
  calendar_description_title: "Запись в салон красоты SalonElen",
  calendar_service: "Услуга:",
  calendar_master: "Мастер:",
  calendar_date: "Дата:",
  calendar_time: "Время:",
  calendar_duration: "Продолжительность:",
  calendar_duration_minutes: "минут",
  calendar_appointment_id: "Номер записи:",
  calendar_address: "Адрес:",
  calendar_contacts: "Контакты:",
  calendar_phone: "Telefon:",
  calendar_reschedule_notice:
    "Если вам необходимо перенести или отменить запись, пожалуйста, свяжитесь с нами заранее.",
  calendar_see_you: "До встречи! ✨",
  calendar_location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",

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

  // SMS VERIFICATION PAGE
  booking_sms_verify_title: "Подтверждение телефона",
  booking_sms_verify_subtitle: "Мы отправим вам 4-значный PIN код по SMS",
  booking_sms_verify_phone_label: "Номер телефона",
  booking_sms_verify_phone_placeholder: "+49 177 899 5106",
  booking_sms_verify_phone_hint:
    "Формат: +[код страны][номер] (например: +4917789951064)",
  booking_sms_verify_phone_required: "Введите номер телефона",
  booking_sms_verify_send_pin: "Отправить PIN код",
  booking_sms_verify_sending: "Отправка...",
  booking_sms_verify_pin_validity: "PIN код будет действителен 10 минут",

  booking_sms_verify_pin_title: "Введите PIN код",
  booking_sms_verify_pin_subtitle: "PIN код отправлен на",
  booking_sms_verify_pin_label: "PIN код",
  booking_sms_verify_pin_placeholder: "0000",
  booking_sms_verify_pin_hint: "Введите 4-значный PIN код из SMS",
  booking_sms_verify_confirm: "Подтвердить",
  booking_sms_verify_checking: "Проверка...",
  booking_sms_verify_resend: "Отправить PIN повторно",
  booking_sms_verify_change_phone: "Изменить номер телефона",
  booking_sms_verify_pin_validity_note:
    "PIN код действителен 10 минут • Максимум 3 попытки",

  booking_sms_verify_error_title: "⚠️ Ошибка",
  booking_sms_verify_error_missing_params:
    "Недостаточно параметров. Пожалуйста, начните запись заново.",
  booking_sms_verify_error_return: "Вернуться к записи",

  booking_sms_verify_contact:
    "Возникли вопросы? Свяжитесь с нами: +49 177 899 5106",

  // SMS DETAILS PAGE
  booking_sms_details_title: "Ваши данные",
  booking_sms_details_subtitle:
    "Пожалуйста, укажите ваше имя и дополнительную информацию",
  booking_sms_details_name_label: "Ваше имя",
  booking_sms_details_name_placeholder: "Иван Иванов",
  booking_sms_details_name_required: "Имя обязательно для заполнения",
  booking_sms_details_email_label: "Email",
  booking_sms_details_email_placeholder: "ivan@example.com",
  booking_sms_details_email_hint: "Для отправки подтверждения и напоминаний",
  booking_sms_details_birth_label: "Дата рождения",
  booking_sms_details_birth_hint:
    "Нам нужна Ваша дата рождения, чтобы мы могли в будущем предоставить Вам индивидуальную скидку к Вашему празднику!",
  booking_sms_details_submit: "Продолжить к оплате",
  booking_sms_details_submitting: "Сохранение...",
  booking_sms_details_privacy:
    "Ваши данные защищены и не передаются третьим лицам",

  booking_sms_details_error_title: "⚠️ Ошибка",
  booking_sms_details_error_missing_id:
    "Отсутствует ID регистрации. Пожалуйста, начните запись заново.",
  booking_sms_details_error_return: "Вернуться к записи",

  booking_sms_details_contact:
    "Возникли вопросы? Свяжитесь с нами: +49 177 899 5106",

  // SMS CARD
  booking_client_sms_title: "По телефону (SMS)",
  booking_client_sms_description: "Получите PIN код через SMS",
  booking_client_sms_benefit_1: "PIN код по SMS",
  booking_client_sms_benefit_2: "Без email регистрации",
  booking_client_sms_benefit_3: "Быстро и безопасно",
  booking_client_sms_benefit_4: "4-значный код",
  booking_client_sms_button: "Войти по SMS",
  booking_client_sms_security: "Infobip SMS",

  // STRIPE PAYMENT
booking_payment_stripe_title: "Оплата картой",
booking_payment_stripe_desc: "Безопасная оплата через Stripe",
booking_payment_stripe_benefit_1: "Все карты: Visa, MasterCard, AmEx",
booking_payment_stripe_benefit_2: "Мгновенное подтверждение",
booking_payment_stripe_benefit_3: "3D Secure защита",
booking_payment_stripe_amount: "Сумма к оплате",
booking_payment_stripe_secure: "Безопасно",
booking_payment_stripe_processing: "Обработка платежа...",
booking_payment_stripe_pay: "Оплатить",
booking_payment_stripe_note: "Ваши платёжные данные защищены 256-битным шифрованием",

// PAYPAL PAYMENT
booking_payment_paypal_title: "PayPal",
booking_payment_paypal_desc: "Оплата через PayPal аккаунт",
booking_payment_paypal_benefit_1: "Быстрая оплата через PayPal",
booking_payment_paypal_benefit_2: "Защита покупателя",
booking_payment_paypal_benefit_3: "Без комиссий",
booking_payment_paypal_amount: "Сумма к оплате",
booking_payment_paypal_secure: "Безопасно",
booking_payment_paypal_note: "После нажатия кнопки вы будете перенаправлены на безопасную страницу PayPal",
booking_payment_paypal_footer: "Платежи обрабатываются через PayPal. Ваши данные защищены.",

// ======= BOOKING - TELEGRAM CARD =======
  booking_client_telegram_title: "Telegram",
  booking_client_telegram_description: "Быстрая регистрация через Telegram бота",
  booking_client_telegram_benefit_1: "Код в Telegram",
  booking_client_telegram_benefit_2: "Без email регистрации",
  booking_client_telegram_benefit_3: "Быстро и безопасно",
  booking_client_telegram_benefit_4: "6-значный код",
  booking_client_telegram_button: "Войти через Telegram",
  booking_client_telegram_security: "Telegram Bot верификация",

  // ======= BOOKING - TELEGRAM VERIFICATION PAGE =======
  booking_telegram_verify_title: "Регистрация через Telegram",
  booking_telegram_verify_subtitle: "Пройдите 3 простых шага",

  booking_telegram_verify_step1_title: "Шаг 1: Номер телефона",
  booking_telegram_verify_step1_subtitle: "Укажите ваш номер телефона",
  booking_telegram_verify_phone_label: "Номер телефона",
  booking_telegram_verify_phone_placeholder: "+49 177 899 5106",
  booking_telegram_verify_phone_hint: "Формат: +[код страны][номер]",
  booking_telegram_verify_phone_required: "Введите номер телефона",
  booking_telegram_verify_send_code: "Отправить код",
  booking_telegram_verify_sending: "Отправка...",

  booking_telegram_verify_step2_title: "Шаг 2: Код из Telegram",
  booking_telegram_verify_step2_subtitle: "Введите код, который мы отправили в Telegram",
  booking_telegram_verify_code_label: "Код подтверждения",
  booking_telegram_verify_code_placeholder: "000000",
  booking_telegram_verify_code_hint: "6-значный код из Telegram бота",
  booking_telegram_verify_code_required: "Введите 6-значный код",
  booking_telegram_verify_check_code: "Подтвердить код",
  booking_telegram_verify_checking: "Проверка...",
  booking_telegram_verify_resend: "Отправить код повторно",

  booking_telegram_verify_step3_title: "Шаг 3: Дополнительная информация",
  booking_telegram_verify_step3_subtitle: "Заполните ваши данные (необязательно)",
  booking_telegram_verify_email_label: "Email",
  booking_telegram_verify_email_placeholder: "your@email.com",
  booking_telegram_verify_email_hint: "Для подтверждения и напоминаний",
  booking_telegram_verify_birth_label: "Дата рождения",
  booking_telegram_verify_birth_hint: "Для персональных скидок к вашему празднику",
  booking_telegram_verify_complete: "Завершить регистрацию",
  booking_telegram_verify_completing: "Сохранение...",

  booking_telegram_verify_privacy: "Ваши данные защищены и не передаются третьим лицам",
  booking_telegram_verify_error_title: "⚠️ Ошибка",
  booking_telegram_verify_error_missing: "Недостаточно параметров. Пожалуйста, начните запись заново.",
  booking_telegram_verify_error_return: "Вернуться к записи",

  booking_telegram_modal_title: "Регистрация в Telegram боте",
  booking_telegram_modal_subtitle:
    "Для получения кодов подтверждения необходимо зарегистрироваться в нашем Telegram боте",
  booking_telegram_modal_phone_label: "Ваш номер:",
  booking_telegram_modal_how_title: "Как зарегистрироваться:",
  booking_telegram_modal_step_open_bot:
    "Нажмите кнопку ниже, чтобы открыть Telegram бота",
  booking_telegram_modal_step_register:
    "Бот автоматически зарегистрирует ваш номер",
  booking_telegram_modal_step_done: "Вернитесь сюда и нажмите",
  booking_telegram_modal_button_open: "Открыть Telegram бота",
  booking_telegram_modal_button_done: "Я зарегистрировался",
  booking_telegram_modal_note:
    "Код подтверждения придёт в Telegram бот в течение нескольких секунд",

  booking_telegram_verify_error_send: "Ошибка отправки кода",
  booking_telegram_verify_error_expired: "Код истёк. Запросите новый код.",
  booking_telegram_verify_error_invalid_code:
    "Неверный код. Проверьте код в Telegram и попробуйте снова.",
  booking_telegram_verify_error_session: "Сессия не найдена. Начните заново.",
  booking_telegram_verify_error_create: "Ошибка создания записи",
  booking_telegram_verify_error_complete: "Ошибка завершения регистрации",
  booking_telegram_verify_error_check: "Ошибка проверки кода",
  booking_telegram_verify_success_sent: "Код отправлен в Telegram!",
  booking_telegram_verify_success_verified: "Код подтверждён!",
  booking_telegram_verify_success_creating: "Создание записи...",
  booking_telegram_verify_back: "Назад",

  booking_confirmation_error_title: "Ошибка",
  booking_confirmation_error_missing_id: "ID записи не указан",
  booking_confirmation_error_cta: "Создать новую запись",
  booking_confirmation_title: "Запись создана!",
  booking_confirmation_subtitle:
    "Ваша запись успешно создана. Мы свяжемся с вами для подтверждения.",
  booking_confirmation_details_number_label: "Номер записи",
  booking_confirmation_details_status_label: "Статус",
  booking_confirmation_status_pending: "Ожидает подтверждения",
  booking_confirmation_action_home: "Вернуться на главную",
  booking_confirmation_action_new: "Создать новую запись",
  booking_confirmation_notice_title: "Обратите внимание:",
  booking_confirmation_notice_body:
    "Мы свяжемся с вами в ближайшее время для подтверждения записи. Если у вас возникнут вопросы, пожалуйста, позвоните нам или напишите на электронную почту.",
  booking_confirmation_loading: "Загрузка...",

  booking_client_page_title: "Выбор регистрации | Salon Elen",
  booking_client_page_description:
    "Выберите способ регистрации для завершения бронирования",
  booking_client_params_error_title: "Ошибка параметров",
  booking_client_params_error_text: "Отсутствуют необходимые параметры бронирования",
  booking_client_params_error_return: "Вернуться к началу",

  booking_client_step_start_label: "Начало:",
  booking_client_step_end_label: "Окончание:",
  booking_client_step_name_label: "Ваше имя",
  booking_client_step_name_placeholder: "Например, Анна",
  booking_client_step_phone_label: "Телефон",
  booking_client_step_phone_placeholder: "+49…",
  booking_client_step_email_label: "E-mail (необязательно)",
  booking_client_step_email_placeholder: "name@example.com",
  booking_client_step_notes_label: "Пожелания (необязательно)",
  booking_client_step_notes_placeholder: "Комментарий к записи",
  booking_client_step_back: "Назад",
  booking_client_step_continue: "Продолжить",

  email_service_not_configured: "Сервис email не настроен",
  email_send_unknown_error: "Неизвестная ошибка отправки email",
  email_status_subject_pending: "🔔 Новая запись - Ожидает подтверждения",
  email_status_subject_confirmed: "✅ Запись подтверждена - Salon Elen",
  email_status_subject_done: "🎉 Спасибо за визит - Salon Elen",
  email_status_subject_canceled: "❌ Запись отменена - Salon Elen",
  email_status_text_pending: "В ожидании подтверждения",
  email_status_text_confirmed: "Подтверждена",
  email_status_text_done: "Выполнена",
  email_status_text_canceled: "Отменена",
  email_status_message_pending:
    "Мы получили вашу заявку на запись. Наш администратор свяжется с вами в ближайшее время для подтверждения.",
  email_status_message_confirmed_intro:
    "Отличные новости! Ваша запись подтверждена.",
  email_status_message_confirmed_wait:
    "Ждём вас <strong>{date}</strong>",
  email_status_message_confirmed_notice_title: "✨ Важно:",
  email_status_message_confirmed_notice_text:
    "Пожалуйста, приходите за 5 минут до начала записи.",
  email_status_message_done_intro:
    "Спасибо, что выбрали Salon Elen! 💖",
  email_status_message_done_outro:
    "Надеемся, вам понравился результат. Будем рады видеть вас снова!",
  email_status_message_done_tip_title: "📅 Совет:",
  email_status_message_done_tip_text:
    "Для поддержания результата рекомендуем записаться через 3-4 недели.",
  email_status_review_title: "Поделитесь впечатлением — это займёт всего минуту",
  email_status_review_text:
    "Ваш честный отзыв помогает будущим клиентам увереннее выбрать процедуру, а нам — становиться лучше. Расскажите своими словами, как прошёл ваш визит.",
  email_status_review_button: "Поделиться впечатлением в Google",
  review_prompt_label: "Вопрос, который поможет начать:",
  review_prompt_1: "Что вам запомнилось во время процедуры?",
  review_prompt_2: "Как вы оцените результат, консультацию и атмосферу?",
  review_prompt_3: "Что другим клиентам важно знать о вашем визите?",
  review_prompt_4: "Как вы оцените результат и заботу мастера?",
  review_prompt_5: "Как прошёл ваш визит в Salon Elen?",
  email_status_loyalty_title: "Ваш подарок за визит: скидка 10%",
  email_status_loyalty_text:
    "На следующую процедуру в Salon Elen для вас действует скидка 10%. Она предоставляется независимо от того, оставите ли вы отзыв и каким он будет. Покажите это письмо при следующем визите.",
  email_status_message_canceled_intro:
    "К сожалению, ваша запись была отменена.",
  email_status_message_canceled_contact_intro:
    "Если это произошло по ошибке или вы хотите записаться на другое время, свяжитесь с нами:",
  email_status_message_canceled_contact:
    "📞 <strong>Телефон:</strong> +38 (000) 000-00-00<br>💬 <strong>Telegram:</strong> @salon_elen",
  email_status_html_title: "Salon Elen - Уведомление",
  email_status_header_subtitle: "Уведомление о записи",
  email_status_greeting: "Здравствуйте, <strong>{name}</strong>!",
  email_status_details_title: "📋 Детали записи",
  email_status_details_status_label: "Статус:",
  email_status_details_service_label: "Услуга:",
  email_status_details_master_label: "Мастер:",
  email_status_details_datetime_label: "Дата и время:",
  email_status_cta_button: "📅 Записаться снова",
  email_status_footer_tagline: "Salon Elen - Ваша красота, наша забота 💖",
  email_status_footer_address: "Lessingstrasse 37, 06114 Halle Saale",
  email_status_footer_contacts: "📞 +49 177 899 51 06 | 📧 elen69@web.de",
  email_status_footer_note:
    "Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.",
  email_test_subject: "🧪 Тестовое письмо - Salon Elen",
  email_test_title: "✅ Email настроен правильно!",
  email_test_body:
    "Если вы видите это письмо, значит Resend работает корректно.",
  email_test_footer: "Отправлено из Salon Elen",

  telegram_code_title: "Salon Elen - Код верификации",
  telegram_code_intro: "Ваш код подтверждения:",
  telegram_code_expires: "Код действителен {minutes} минут.",
  telegram_payment_status_paid: "Оплачено",
  telegram_payment_status_pending: "Ожидает оплаты",
  telegram_payment_status_failed: "Ошибка оплаты",
  telegram_payment_status_refunded: "Возврат средств",
  telegram_payment_status_unknown: "Неизвестно",
  telegram_admin_new_title: "НОВАЯ ЗАПИСЬ!",
  telegram_admin_label_date: "Дата",
  telegram_admin_label_time: "Время",
  telegram_admin_label_client: "Клиент",
  telegram_admin_label_phone: "Телефон",
  telegram_admin_label_email: "Email",
  telegram_admin_label_service: "Услуга",
  telegram_admin_label_master: "Мастер",
  telegram_admin_label_payment: "Оплата",
  telegram_admin_label_id: "ID записи",
  telegram_admin_open_button: "📊 Открыть в админке",
  telegram_client_status_title_pending: "🔔 Заявка принята",
  telegram_client_status_title_confirmed: "✅ Запись подтверждена",
  telegram_client_status_title_done: "🎉 Спасибо за визит",
  telegram_client_status_title_canceled: "❌ Запись отменена",
  telegram_client_status_text_pending: "Ожидает подтверждения",
  telegram_client_status_text_confirmed: "Подтверждена",
  telegram_client_status_text_done: "Выполнена",
  telegram_client_status_text_canceled: "Отменена",
  telegram_client_status_message_pending:
    "Мы получили вашу заявку. Администратор свяжется с вами в ближайшее время.",
  telegram_client_status_message_confirmed:
    "Ждём вас! Пожалуйста, приходите за 5 минут до записи.",
  telegram_client_status_message_done:
    "Спасибо, что выбрали Salon Elen! Будем рады видеть вас снова.",
  telegram_client_status_message_canceled:
    "Если хотите перенести запись, пожалуйста, свяжитесь с нами.",
  telegram_client_review_text:
    "Ваш честный отзыв и рекомендация помогут другим клиентам сделать уверенный выбор. Поделитесь впечатлением — это займёт всего минуту.",
  telegram_client_review_discount:
    "🎁 Ваш подарок за визит: скидка 10% на следующую процедуру. Скидка действует независимо от публикации и содержания отзыва. Покажите это сообщение при следующем визите.",
  telegram_client_review_button: "⭐ Поделиться впечатлением",
  telegram_client_greeting: "Здравствуйте, {name}!",
  telegram_client_label_date: "Дата",
  telegram_client_label_time: "Время",
  telegram_client_label_service: "Услуга",
  telegram_client_label_master: "Мастер",
  telegram_client_label_status: "Статус",
  telegram_start_title: "Добро пожаловать в Salon Elen!",
  telegram_start_prompt:
    "Для использования бота отправьте ваш номер телефона, нажав кнопку ниже.",
  telegram_start_after:
    "После этого вы сможете получать коды подтверждения для онлайн-записи.",
  telegram_button_send_phone: "📱 Отправить номер телефона",
  telegram_contact_saved_title: "Номер телефона сохранён!",
  telegram_contact_saved_phone: "Ваш номер: {phone}",
  telegram_contact_saved_ready:
    "Теперь вы можете использовать Telegram для подтверждения записей на сайте.",
  telegram_request_contact_prompt: "Пожалуйста, отправьте ваш номер телефона:",

  api_telegram_send_to_registered_missing_params: "Email и draftId обязательны",
  api_telegram_send_to_registered_user_not_found: "Пользователь не найден",
  api_telegram_send_to_registered_code_not_found: "Код не найден",
  api_telegram_send_to_registered_success: "Код отправлен",
  api_telegram_send_to_registered_error: "Ошибка отправки кода",
  api_email_check_missing: "Email не указан",
  api_email_check_invalid: "Некорректный формат email",
  api_email_check_too_long: "Email слишком длинный",
  api_email_check_error: "Ошибка проверки email",
  api_google_oauth_not_configured:
    "Google OAuth не настроен. Обратитесь к администратору.",
  api_google_oauth_missing_params: "Email и draftId обязательны",
  api_google_oauth_draft_not_found: "Черновик бронирования не найден",
  api_google_oauth_email_mismatch: "Email не совпадает с email в черновике",
  api_google_oauth_generated: "OAuth URL сгенерирован",
  api_google_oauth_error: "Ошибка генерации OAuth URL",
  api_google_status_missing_params: "Email и draftId обязательны",
  api_google_status_error: "Ошибка проверки статуса",
  api_google_callback_access_denied: "Доступ отклонён",
  api_google_callback_invalid_params: "Некорректные параметры",
  api_google_callback_invalid_state: "Неверный токен верификации",
  api_google_callback_expired: "Запрос истёк, попробуйте снова",
  api_google_callback_already_verified: "Уже подтверждено",
  api_google_callback_missing_email: "Google не вернул e-mail",
  api_google_callback_email_mismatch: "Email не совпадает с email бронирования",
  api_google_callback_draft_not_found: "Черновик бронирования не найден",
  api_google_callback_slot_taken: "Выбранное время уже занято",
  api_google_callback_error: "Ошибка обработки callback",
  api_email_confirm_missing_fields: "Все поля обязательны",
  api_email_confirm_invalid_code: "Неверный код или email",
  api_email_confirm_draft_not_found: "Черновик не найден",
  api_email_confirm_success: "Запись подтверждена",
  api_email_confirm_slot_taken:
    "Выбранное время уже занято. Пожалуйста, выберите другое время.",
  api_email_confirm_error: "Ошибка подтверждения кода",
  api_payment_missing_params: "appointmentId и paymentMethod обязательны",
  api_payment_invalid_method: "Некорректный способ оплаты",
  api_payment_not_found: "Запись не найдена",
  api_payment_unknown_service: "неизвестная услуга",
  api_payment_note_prefix: "Способ оплаты",
  api_payment_card_redirect: "Переход к оплате картой",
  api_payment_paypal_redirect: "Переход к оплате через PayPal",
  api_payment_cash: "Оплата наличными в салоне",
  api_payment_unknown_method: "Неизвестный способ оплаты",
  api_payment_error: "Ошибка обработки оплаты",
  api_admin_clients_unauthorized: "Недостаточно прав",
  api_admin_clients_missing_fields: "Заполните обязательные поля",
  api_admin_clients_duplicate_active:
    "Клиент с таким телефоном или email уже существует",
  api_admin_clients_duplicate_deleted:
    "Найден удалённый клиент с таким телефоном или email",
  api_admin_clients_duplicate_suggestion:
    "Вы можете восстановить удалённого клиента вместо создания нового",
  api_admin_clients_created: "Клиент успешно создан",
  api_admin_clients_error: "Ошибка создания клиента",

  // ======= CONTACTS (NEW) =======
  contacts_seo_description:
    "Адрес, телефон, часы работы и как нас найти. Онлайн-запись в Salon Elen в Halle (Saale).",

  contacts_subtitle: "Свяжитесь с нами • Быстро и удобно",
  contacts_title: "Контакты",
  contacts_intro:
    "Поможем с услугами, временем и записью. Можно позвонить, написать на email или открыть маршрут.",

  contacts_quick_title: "Карта и сообщение",

  contacts_quick_call: "Позвонить",
  contacts_quick_book: "Онлайн-запись",
  contacts_quick_route: "Маршрут",

  contacts_details_title: "Данные салона",

  contacts_open_maps: "Открыть в Google Maps",

  contacts_map_title: "Как нас найти",
  contacts_map_caption: "Откройте карту и проложите маршрут в один клик.",
  contacts_show_map: "Показать интерактивную карту",
  contacts_map_privacy:
    "Карта загрузится только после клика. Google может установить cookies и обработать данные согласно своей политике.",

  contacts_address_label: "Адрес",
  contacts_phone_label: "Телефон",
  contacts_email_label: "Email",
  contacts_hours_label: "Часы работы",
  contacts_hours_value: "Пн–Пт 10:00–19:00, Сб 10:00–16:00",

  contacts_form_title: "Написать сообщение",
  contacts_form_name: "Ваше имя",
  contacts_form_phone: "Телефон (необязательно)",
  contacts_form_message: "Сообщение",
  contacts_form_send: "Отправить",
  contacts_form_note:
    "Сообщение откроется в вашем почтовом приложении. Если не открылось — напишите напрямую на elen69@web.de",



};

/* ==================== GERMAN (DE) ==================== */

const deMessages: BaseMessages = {
  booking_verify_email_sent_message: "Code wurde per E-Mail gesendet",
  booking_verify_email_api_missing_params: "E-Mail und draftId sind erforderlich",
  booking_verify_email_api_draft_not_found: "Buchungsentwurf nicht gefunden",
  booking_verify_email_api_email_mismatch: "E-Mail stimmt nicht mit dem Entwurf überein",
  booking_verify_email_api_send_failed: "Fehler beim Senden des Codes per E-Mail",
  booking_verify_email_api_error: "Fehler beim Senden des Codes",
  booking_email_otp_subject: "Bestätigungscode für die Buchung - Salon Elen",
  booking_email_otp_title: "Bestätigungscode",
  booking_email_otp_header_subtitle: "Buchungsbestätigung",
  booking_email_otp_greeting: "Hallo!",
  booking_email_otp_code_intro: "Ihr Bestätigungscode zum Abschließen der Buchung:",
  booking_email_otp_expires_label: "Wichtig:",
  booking_email_otp_expires_text: "Der Code ist {minutes} Minuten gültig.",
  booking_email_otp_ignore:
    "Wenn Sie keine Buchung bei Salon Elen vorgenommen haben, ignorieren Sie diese E-Mail.",
  booking_email_otp_footer_tagline: "Salon Elen – Ihre Schönheit, unser Anliegen 💖",
  booking_email_otp_footer_contact: "📧 booking@news.permanent-halle.de",
  booking_email_otp_footer_note: "Dies ist eine automatische E-Mail. Bitte nicht antworten.",
  // Navigation
  nav_home: "Startseite",
  nav_services: "Leistungen",
  nav_prices: "Preise",
  nav_gallery: "Galerie",
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
  footer_address_label: "Lessingstrasse 37, Halle (Saale)",

  footer_hours_label: "Öffnungszeiten",
  footer_hours_weekdays: "Mo–Fr: 10:00 – 19:00",
  footer_hours_saturday: "Sa: 10:00 – 16:00",
  footer_hours_sunday: "So: geschlossen",

  footer_navigation_section: "Navigation",

  footer_clients_section: "Für Kunden und Stylisten",

  footer_socials_section: "Soziale Netzwerke & Messenger",

  footer_privacy: "Datenschutz",
  footer_cookie_settings: "Cookie-Einstellungen",
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

  site_name: "Salon Elen",
  booking_header_subtitle: "Premium-Buchung",
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
  booking_calendar_legend_title:
    "Goldene Füllung zeigt die Auslastung des Tages",
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
  booking_calendar_available_slots: "Verfügbare Termine:",
  booking_calendar_slot_taken: "Dieser Termin wurde gerade von einem anderen Kunden gebucht. Bitte wählen Sie eine andere Zeit.",
  booking_calendar_reserve_error: "Reservierungsfehler. Bitte versuchen Sie es erneut.",

  // ======= BOOKING - CLIENT CHOICE PAGE =======
  booking_client_choice_title: "Wie möchten Sie fortfahren?",
  booking_client_choice_subtitle:
    "Wählen Sie eine bequeme Registrierungsmethode",
  booking_client_choice_recommended: "Empfohlen",

  booking_client_google_title: "Schnelle Registrierung",
  booking_client_google_description:
    "Melden Sie sich über Google an und gehen Sie direkt zur Zahlung",
  booking_client_google_benefit_1: "Ein Klick zur Zahlung",
  booking_client_google_benefit_2: "Automatisches Ausfüllen",
  booking_client_google_benefit_3: "Sicher und zuverlässig",
  booking_client_google_benefit_4: "Zeitersparnis",
  booking_client_google_button: "Mit 1 Klick starten",
  booking_client_google_security: "Geschützt durch Google OAuth 2.0",
  booking_client_google_connecting: "Verbindung wird hergestellt...",

  booking_client_form_title: "Formular ausfüllen",
  booking_client_form_description:
    "Traditionelle Methode mit voller Kontrolle über Ihre Daten",
  booking_client_form_benefit_1: "Volle Datenkontrolle",
  booking_client_form_benefit_2: "Kein Google-Konto erforderlich",
  booking_client_form_benefit_3: "Gewohnter Prozess",
  booking_client_form_benefit_4: "Verifizierung über Telegram",
  booking_client_form_button: "Formular ausfüllen",
  booking_client_form_security: "Bestätigung über Telegram Bot",

  booking_client_choice_footer: "Alle Methoden sind sicher und zuverlässig.",
  booking_client_choice_footer_highlight: "Wählen Sie die für Sie bequemste.",

  booking_client_popup_blocked:
    "Fenster konnte nicht geöffnet werden. Erlauben Sie Pop-ups in Ihrem Browser.",
  booking_client_google_error_init:
    "Fehler bei der Google OAuth-Initialisierung",
  booking_client_auth_error: "Autorisierungsfehler",
  booking_client_auth_waiting: "Warten auf Bestätigung über Google...",

  // ======= BOOKING - CLIENT FORM PAGE =======
  booking_client_form_badge: "Schritt 4 — Ihre Kontaktdaten",
  booking_client_form_hero_title: "Online-Terminbuchung",
  booking_client_form_hero_subtitle:
    "Geben Sie Ihre Daten an, damit wir Ihre Buchung bestätigen können",

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
  booking_client_form_placeholder_comment:
    "Zusätzliche Informationen oder Wünsche",
  booking_client_form_placeholder_referral_other: "Bitte angeben",

  booking_client_form_referral_select: "Wählen Sie eine Option",
  booking_client_form_referral_google: "Google",
  booking_client_form_referral_facebook: "Facebook",
  booking_client_form_referral_instagram: "Instagram",
  booking_client_form_referral_friends: "Empfehlung von Freunden",
  booking_client_form_referral_other: "Andere",

  booking_client_form_error_name:
    "Bitte geben Sie Ihren vollständigen Namen an",
  booking_client_form_error_phone:
    "Bitte geben Sie eine gültige Telefonnummer an",
  booking_client_form_error_email_required: "E-Mail ist erforderlich",
  booking_client_form_error_email_invalid: "Ungültige E-Mail",
  booking_client_form_error_email_not_verified: "E-Mail nicht bestätigt",
  booking_client_form_error_birth_required: "Geburtsdatum ist erforderlich",
  booking_client_form_error_birth_future:
    "Zukünftiges Datum ist nicht zulässig",
  booking_client_form_error_birth_underage:
    "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
  booking_client_form_error_referral: "Wählen Sie eine Option",
  booking_client_form_error_referral_other: "Bitte angeben",

  booking_client_form_email_checking: "E-Mail wird überprüft…",
  booking_client_form_email_verified: "E-Mail bestätigt",

  booking_client_form_age_requirement:
    "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
  booking_client_form_email_error_note:
    "Wenn Sie einen Fehler in der Adresse machen, können Sie trotzdem zum Termin kommen, erhalten aber keine Erinnerungen und Bestätigungen.",

  booking_client_form_button_back: "Zurück",
  booking_client_form_button_submit: "Buchen",
  booking_client_form_button_submitting: "Daten werden überprüft…",

  booking_client_form_info_title: "Warum benötigen wir Ihre E-Mail?",
  booking_client_form_info_point_1: "An Ihre E-Mail senden wir",
  booking_client_form_info_point_1_highlight:
    "die Buchungsbestätigung und alle Details",
  booking_client_form_info_point_2: "Sie erhalten",
  booking_client_form_info_point_2_highlight:
    "eine Erinnerung vor Ihrem Besuch",
  booking_client_form_info_point_3:
    "Wir behandeln personenbezogene Daten sorgfältig und verwenden Ihre E-Mail nur für die Bearbeitung Ihrer Buchung",

  booking_client_form_invalid_params:
    "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
  booking_client_form_invalid_return: "Zurück zur Dienstleistungsauswahl",

  // ======= BOOKING - PHONE & BIRTHDAY PAGE (NEW) =======
  phone_title: "Kontaktinformationen",
  phone_subtitle: "Geben Sie Ihre Kontaktdaten an",
  phone_label: "Telefon",
  phone_hint: "Wir kontaktieren Sie zur Bestätigung des Termins",
  phone_required: "Telefonnummer ist erforderlich",
  phone_submit: "Weiter",
  phone_submitting: "Senden...",
  phone_privacy:
    "Ihre Daten sind geschützt und werden nicht an Dritte weitergegeben",
  birthday_label: "Geburtsdatum",
  birthday_hint:
    "Wir benötigen Ihr Geburtsdatum, damit wir Ihnen in Zukunft einen individuellen Rabatt zu Ihrem Fest anbieten können!",

  booking_verify_badge: "Schritt 5 — E-Mail-Bestätigung",
  booking_verify_hero_title: "Buchungsbestätigung",
  booking_verify_hero_subtitle:
    "Überprüfen Sie Ihre E-Mail und geben Sie den Code ein",
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
  booking_verify_email_confirm_desc:
    "Wir senden einen einmaligen 6-stelligen Code an",
  booking_verify_email_label: "E-Mail zur Bestätigung",
  booking_verify_email_wrong_hint:
    "Falls die E-Mail falsch ist, gehen Sie zum vorherigen Schritt zurück",
  booking_verify_email_send_code: "Code senden",
  booking_verify_email_sending: "Wird gesendet…",
  booking_verify_email_arrives_hint:
    "Der Code kommt innerhalb weniger Sekunden an",
  booking_verify_email_enter_code: "Geben Sie den 6-stelligen Code ein",
  booking_verify_email_code_valid: "Der Code ist begrenzt gültig",
  booking_verify_email_confirm_code: "Code bestätigen",
  booking_verify_email_checking: "Wird überprüft…",
  booking_verify_email_resend: "Code erneut senden",
  booking_verify_info_title: "Sichere Bestätigung",
  booking_verify_info_desc:
    "Wir verwenden einen Einmalcode zum Schutz Ihrer Daten und des Salon-Zeitplans",
  booking_verify_info_arrives: "Der Code kommt in 1-2 Minuten an",
  booking_verify_info_check_spam: "Prüfen Sie den Spam-Ordner",
  booking_verify_info_check_email:
    "Vergewissern Sie sich, dass die E-Mail korrekt ist",
  booking_verify_info_resend_if_needed:
    "Fordern Sie bei Bedarf einen neuen Code an",
  booking_verify_info_progress_title: "Ihr Fortschritt",
  booking_verify_info_progress_1: "Dienstleistung und Meister ausgewählt",
  booking_verify_info_progress_2: "Datum und Uhrzeit angegeben",
  booking_verify_info_progress_3: "Kontaktdaten ausgefüllt",
  booking_verify_info_progress_4: "Jetzt — E-Mail-Bestätigung",
  booking_verify_info_progress_5: "Als nächstes — Zahlung",
  booking_verify_info_support:
    "Bei Schwierigkeiten kontaktieren Sie uns — wir helfen Ihnen, die Buchung abzuschließen",
  booking_verify_invalid_params:
    "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
  booking_verify_invalid_return: "Zurück zur Dienstleistungsauswahl",
  booking_verify_google_title: "Über Google bestätigen",
  booking_verify_google_desc:
    "Melden Sie sich mit Ihrem Google-Konto an für eine schnelle und sichere Bestätigung Ihrer Buchung.",
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
  booking_verify_google_security_desc:
    "Wir erhalten keinen Zugriff auf Ihr Google-Passwort. Es wird das offizielle OAuth-Protokoll verwendet.",
  booking_verify_google_success:
    "✅ Über Google bestätigt! Weiterleitung zur Zahlung...",
  booking_verify_google_preparing_window:
    "🔐 Google öffnet sich in einem neuen Fenster...",
  booking_verify_google_allow_popups:
    "⚠️ Erlauben Sie Pop-ups und klicken Sie auf die Schaltfläche unten.",
  booking_verify_telegram_title: "Über Telegram bestätigen",
  booking_verify_telegram_desc_registered:
    "Code wurde an Telegram Bot gesendet. Prüfen Sie Nachrichten und klicken Sie auf die Bestätigungsschaltfläche.",
  booking_verify_telegram_desc_unregistered:
    "Telegram öffnet sich automatisch. Sie erhalten einen Code zum Eingeben oder können direkt mit einer Schaltfläche im Bot bestätigen.",
  booking_verify_telegram_sending_code: "Code wird gesendet...",
  booking_verify_telegram_open_button: "Telegram öffnen",
  booking_verify_telegram_reopen_button: "Telegram erneut öffnen",
  booking_verify_telegram_waiting_bot:
    "Warten auf Bestätigung im Telegram Bot...",
  booking_verify_telegram_waiting: "Warten auf Bestätigung...",
  booking_verify_telegram_divider: "oder",
  booking_verify_telegram_enter_code:
    "Geben Sie den 6-stelligen Code aus Telegram ein",
  booking_verify_telegram_code_placeholder: "000000",
  booking_verify_telegram_code_valid: "Der Code ist 10 Minuten gültig.",
  booking_verify_telegram_confirm_button: "Code bestätigen",
  booking_verify_telegram_checking: "Wird überprüft...",
  booking_verify_telegram_code_sent:
    "✈️ Code an Telegram gesendet! Prüfen Sie den Bot und klicken Sie auf die Bestätigungsschaltfläche.",
  booking_verify_telegram_opening:
    "✈️ Telegram öffnet sich... Warten auf Bestätigung.",
  booking_verify_telegram_click_button:
    "⚠️ Klicken Sie auf die Schaltfläche unten, um Telegram zu öffnen.",
  booking_verify_telegram_success:
    "✅ Über Telegram bestätigt! Weiterleitung zur Zahlung...",
  booking_verify_error_enter_code: "Geben Sie den 6-stelligen Code ein",
  booking_verify_success_redirect:
    "Verifizierung erfolgreich! Weiterleitung zur Zahlung...",

  booking_payment_badge: "Schritt 6 — Zahlung und endgültige Bestätigung",
  booking_payment_hero_title: "Buchung abschließen",
  booking_payment_hero_subtitle:
    "Wählen Sie die Zahlungsmethode und bestätigen Sie die Buchung",
  booking_payment_appointment_id: "Buchungsnummer:",
  booking_payment_method_title: "Zahlungsmethode",
  booking_payment_onsite_title: "Zahlung im Salon",
  booking_payment_onsite_desc: "Vor Ort",
  booking_payment_onsite_benefit_1: "Bar oder Karte im Salon",
  booking_payment_onsite_benefit_2: "Keine Vorauszahlung",
  booking_payment_onsite_benefit_3: "Zahlung nach der Dienstleistung",
  booking_payment_online_title: "Online-Zahlung",
  booking_payment_online_desc: "Bald verfügbar",
  // booking_payment_online_benefit_1: "Karte, Apple Pay, Google Pay",
  // booking_payment_online_benefit_2: "In Entwicklung",
  // booking_payment_online_benefit_3: "Buchung wird trotzdem bestätigt",
  // Infoblock - AKTUELLER Text
  booking_payment_info_how_works_title: "Wie funktioniert das?",
  booking_payment_info_how_works_desc: "Das System hat bereits einen Termin im Salon-Zeitplan erstellt. Sie können online mit Karte (Stripe) oder über PayPal bezahlen, oder bar/mit Karte im Salon nach der Dienstleistung.",
  booking_payment_info_title: "Wie funktioniert das?",
  booking_payment_info_desc:
    "Das System hat bereits einen Termin im Salon-Zeitplan erstellt. Die Zahlung wird auf der Seite des Salons erfasst. Online-Zahlung wird später hinzugefügt.",
  booking_payment_confirm_button: "Buchung bestätigen",
  booking_payment_confirm_terms:
    'Durch Klicken auf "Buchung bestätigen" stimmen Sie den Salon-Bedingungen zu',
  booking_payment_summary_title: "Buchungszusammenfassung",
  booking_payment_summary_visit: "Ihr Besuch bei SalonElen",
  booking_payment_summary_service: "Dienstleistung aus der Buchung",
  booking_payment_summary_master: "Meister aus der Buchung",
  booking_payment_summary_datetime: "Datum und Uhrzeit nach ID:",
  booking_payment_summary_address: "Salon-Adresse",
  booking_payment_summary_cancellation_title: "Stornierungsbedingungen",
  booking_payment_summary_cancellation_desc:
    "Wenn Sie nicht kommen können, stornieren Sie bitte im Voraus — dies ermöglicht es, die Zeit für andere Salon-Gäste freizugeben.",
  booking_payment_summary_future_note:
    "Nach dem Start der Online-Zahlung erscheint hier ein Block zur Auswahl der Zahlungsmethode und des Zahlungsstatus",
  booking_payment_success_title: "Buchung bestätigt!",
  booking_payment_success_desc:
    "Ihre Buchung wurde erfolgreich bestätigt. Die Zahlung erfolgt im Salon.",
  booking_payment_success_home: "Zur Startseite",
  booking_payment_success_calendar: "Zu Google Calendar hinzufügen",
  booking_payment_success_apple_calendar: "Zu Apple Calendar hinzufügen",
  booking_payment_success_new: "Neue Buchung erstellen",
  booking_payment_error_title: "Fehler beim Übergang zur Zahlung",
  booking_payment_error_desc:
    "Wir konnten die Buchungs-ID nicht finden. Möglicherweise ist der Link veraltet oder der E-Mail-Bestätigungsschritt wurde übersprungen.",
  booking_payment_error_return: "Zurück zur Buchung",
  booking_payment_error_missing:
    "Buchungs-ID fehlt. Bitte beginnen Sie die Buchung erneut.",
  booking_success_page_title: "Online-Buchung",
  booking_success_page_subtitle: "Erfolg",
  booking_success_loading: "Wird geladen...",
  booking_success_loading_data: "Daten werden geladen…",
  booking_success_error_title: "Fehler",
  booking_success_error_not_found: "Buchungs-ID nicht gefunden",
  booking_success_error_load_failed:
    "Buchungsdaten konnten nicht geladen werden",
  booking_success_error_return: "Zurück zur Buchung",
  booking_success_title: "Buchung bestätigt!",
  booking_success_desc:
    "Ihre Buchung wurde erfolgreich erstellt. Wir haben eine Bestätigung an Ihre E-Mail gesendet.",
  booking_success_details_title: "Buchungsdetails:",
  booking_success_details_name: "Name",
  booking_success_details_email: "E-Mail",
  booking_success_details_phone: "Telefon",
  booking_success_details_datetime: "Datum und Uhrzeit",
  booking_success_button_new: "Neue Buchung erstellen",
  booking_success_button_home: "Zur Startseite",

  calendar_title_appointment_in: "bei SalonElen",
  calendar_description_title: "Termin im Schönheitssalon SalonElen",
  calendar_service: "Dienstleistung:",
  calendar_master: "Meister:",
  calendar_date: "Datum:",
  calendar_time: "Uhrzeit:",
  calendar_duration: "Dauer:",
  calendar_duration_minutes: "Minuten",
  calendar_appointment_id: "Terminnummer:",
  calendar_address: "Adresse:",
  calendar_contacts: "Kontakte:",
  calendar_phone: "Telefon:",
  calendar_reschedule_notice:
    "Wenn Sie Ihren Termin verschieben oder absagen müssen, kontaktieren Sie uns bitte im Voraus.",
  calendar_see_you: "Bis bald! ✨",
  calendar_location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",

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

  // SMS VERIFICATION PAGE
  booking_sms_verify_title: "Telefonbestätigung",
  booking_sms_verify_subtitle:
    "Wir senden Ihnen einen 4-stelligen PIN-Code per SMS",
  booking_sms_verify_phone_label: "Telefonnummer",
  booking_sms_verify_phone_placeholder: "+49 177 899 5106",
  booking_sms_verify_phone_hint:
    "Format: +[Ländercode][Nummer] (z.B.: +4917789951064)",
  booking_sms_verify_phone_required: "Telefonnummer eingeben",
  booking_sms_verify_send_pin: "PIN-Code senden",
  booking_sms_verify_sending: "Wird gesendet...",
  booking_sms_verify_pin_validity: "PIN-Code ist 10 Minuten gültig",

  booking_sms_verify_pin_title: "PIN-Code eingeben",
  booking_sms_verify_pin_subtitle: "PIN-Code gesendet an",
  booking_sms_verify_pin_label: "PIN-Code",
  booking_sms_verify_pin_placeholder: "0000",
  booking_sms_verify_pin_hint: "4-stelligen PIN-Code aus SMS eingeben",
  booking_sms_verify_confirm: "Bestätigen",
  booking_sms_verify_checking: "Wird überprüft...",
  booking_sms_verify_resend: "PIN-Code erneut senden",
  booking_sms_verify_change_phone: "Telefonnummer ändern",
  booking_sms_verify_pin_validity_note:
    "PIN-Code ist 10 Minuten gültig • Maximal 3 Versuche",

  booking_sms_verify_error_title: "⚠️ Fehler",
  booking_sms_verify_error_missing_params:
    "Unzureichende Parameter. Bitte beginnen Sie die Buchung erneut.",
  booking_sms_verify_error_return: "Zurück zur Buchung",

  booking_sms_verify_contact: "Fragen? Kontaktieren Sie uns: +49 177 899 5106",

  // SMS DETAILS PAGE
  booking_sms_details_title: "Ihre Daten",
  booking_sms_details_subtitle:
    "Bitte geben Sie Ihren Namen und zusätzliche Informationen an",
  booking_sms_details_name_label: "Ihr Name",
  booking_sms_details_name_placeholder: "Max Mustermann",
  booking_sms_details_name_required: "Name ist erforderlich",
  booking_sms_details_email_label: "E-Mail",
  booking_sms_details_email_placeholder: "max@example.com",
  booking_sms_details_email_hint: "Für Bestätigung und Erinnerungen",
  booking_sms_details_birth_label: "Geburtsdatum",
  booking_sms_details_birth_hint:
    "Wir benötigen Ihr Geburtsdatum, damit wir Ihnen in Zukunft einen individuellen Rabatt zu Ihrem Fest anbieten können!",
  booking_sms_details_submit: "Zur Zahlung fortfahren",
  booking_sms_details_submitting: "Speichern...",
  booking_sms_details_privacy:
    "Ihre Daten sind geschützt und werden nicht an Dritte weitergegeben",

  booking_sms_details_error_title: "⚠️ Fehler",
  booking_sms_details_error_missing_id:
    "Registrierungs-ID fehlt. Bitte beginnen Sie die Buchung erneut.",
  booking_sms_details_error_return: "Zurück zur Buchung",

  booking_sms_details_contact: "Fragen? Kontaktieren Sie uns: +49 177 899 5106",

  // SMS CARD
  booking_client_sms_title: "Per Telefon (SMS)",
  booking_client_sms_description: "PIN-Code per SMS erhalten",
  booking_client_sms_benefit_1: "PIN-Code per SMS",
  booking_client_sms_benefit_2: "Keine E-Mail-Registrierung",
  booking_client_sms_benefit_3: "Schnell und sicher",
  booking_client_sms_benefit_4: "4-stelliger Code",
  booking_client_sms_button: "Per SMS anmelden",
  booking_client_sms_security: "Infobip SMS",

  // STRIPE PAYMENT
  booking_payment_stripe_title: "Kartenzahlung",
  booking_payment_stripe_desc: "Sichere Zahlung über Stripe",
  booking_payment_stripe_benefit_1: "Alle Karten: Visa, MasterCard, AmEx",
  booking_payment_stripe_benefit_2: "Sofortige Bestätigung",
  booking_payment_stripe_benefit_3: "3D Secure Schutz",
  booking_payment_stripe_amount: "Zu zahlender Betrag",
  booking_payment_stripe_secure: "Sicher",
  booking_payment_stripe_processing: "Zahlung wird verarbeitet...",
  booking_payment_stripe_pay: "Bezahlen",
  booking_payment_stripe_note: "Ihre Zahlungsdaten sind durch 256-Bit-Verschlüsselung geschützt",

  // PAYPAL PAYMENT
  booking_payment_paypal_title: "PayPal",
  booking_payment_paypal_desc: "Zahlung über PayPal-Konto",
  booking_payment_paypal_benefit_1: "Schnelle Zahlung über PayPal",
  booking_payment_paypal_benefit_2: "Käuferschutz",
  booking_payment_paypal_benefit_3: "Keine Gebühren",
  booking_payment_paypal_amount: "Zu zahlender Betrag",
  booking_payment_paypal_secure: "Sicher",
  booking_payment_paypal_note: "Nach dem Klicken werden Sie zur sicheren PayPal-Seite weitergeleitet",
  booking_payment_paypal_footer: "Zahlungen werden über PayPal verarbeitet. Ihre Daten sind geschützt.",

   // ======= BOOKING - TELEGRAM CARD =======
  booking_client_telegram_title: "Telegram",
  booking_client_telegram_description: "Schnelle Registrierung über Telegram Bot",
  booking_client_telegram_benefit_1: "Code in Telegram",
  booking_client_telegram_benefit_2: "Keine E-Mail-Registrierung",
  booking_client_telegram_benefit_3: "Schnell und sicher",
  booking_client_telegram_benefit_4: "6-stelliger Code",
  booking_client_telegram_button: "Über Telegram anmelden",
  booking_client_telegram_security: "Telegram Bot Verifizierung",

  // ======= BOOKING - TELEGRAM VERIFICATION PAGE =======
  booking_telegram_verify_title: "Registrierung über Telegram",
  booking_telegram_verify_subtitle: "Folgen Sie 3 einfachen Schritten",

  booking_telegram_verify_step1_title: "Schritt 1: Telefonnummer",
  booking_telegram_verify_step1_subtitle: "Geben Sie Ihre Telefonnummer an",
  booking_telegram_verify_phone_label: "Telefonnummer",
  booking_telegram_verify_phone_placeholder: "+49 177 899 5106",
  booking_telegram_verify_phone_hint: "Format: +[Ländercode][Nummer]",
  booking_telegram_verify_phone_required: "Telefonnummer eingeben",
  booking_telegram_verify_send_code: "Code senden",
  booking_telegram_verify_sending: "Wird gesendet...",

  booking_telegram_verify_step2_title: "Schritt 2: Code aus Telegram",
  booking_telegram_verify_step2_subtitle: "Geben Sie den Code ein, den wir Ihnen in Telegram gesendet haben",
  booking_telegram_verify_code_label: "Bestätigungscode",
  booking_telegram_verify_code_placeholder: "000000",
  booking_telegram_verify_code_hint: "6-stelliger Code aus Telegram Bot",
  booking_telegram_verify_code_required: "6-stelligen Code eingeben",
  booking_telegram_verify_check_code: "Code bestätigen",
  booking_telegram_verify_checking: "Wird überprüft...",
  booking_telegram_verify_resend: "Code erneut senden",

  booking_telegram_verify_step3_title: "Schritt 3: Zusätzliche Informationen",
  booking_telegram_verify_step3_subtitle: "Füllen Sie Ihre Daten aus (optional)",
  booking_telegram_verify_email_label: "E-Mail",
  booking_telegram_verify_email_placeholder: "ihre@email.de",
  booking_telegram_verify_email_hint: "Für Bestätigung und Erinnerungen",
  booking_telegram_verify_birth_label: "Geburtsdatum",
  booking_telegram_verify_birth_hint: "Für personalisierte Rabatte zu Ihrem Fest",
  booking_telegram_verify_complete: "Registrierung abschließen",
  booking_telegram_verify_completing: "Speichern...",

  booking_telegram_verify_privacy: "Ihre Daten sind geschützt und werden nicht an Dritte weitergegeben",
  booking_telegram_verify_error_title: "⚠️ Fehler",
  booking_telegram_verify_error_missing: "Unzureichende Parameter. Bitte beginnen Sie die Buchung erneut.",
  booking_telegram_verify_error_return: "Zurück zur Buchung",

  booking_telegram_modal_title: "Registrierung im Telegram-Bot",
  booking_telegram_modal_subtitle:
    "Um Bestätigungscodes zu erhalten, müssen Sie sich in unserem Telegram-Bot registrieren",
  booking_telegram_modal_phone_label: "Ihre Nummer:",
  booking_telegram_modal_how_title: "So registrieren Sie sich:",
  booking_telegram_modal_step_open_bot:
    "Klicken Sie unten, um den Telegram-Bot zu öffnen",
  booking_telegram_modal_step_register:
    "Der Bot registriert automatisch Ihre Nummer",
  booking_telegram_modal_step_done: "Kehren Sie hierher zurück und klicken Sie",
  booking_telegram_modal_button_open: "Telegram-Bot öffnen",
  booking_telegram_modal_button_done: "Ich bin registriert",
  booking_telegram_modal_note:
    "Der Bestätigungscode kommt innerhalb weniger Sekunden im Telegram-Bot an",

  booking_telegram_verify_error_send: "Fehler beim Senden des Codes",
  booking_telegram_verify_error_expired:
    "Code abgelaufen. Fordern Sie einen neuen Code an.",
  booking_telegram_verify_error_invalid_code:
    "Ungültiger Code. Prüfen Sie den Code in Telegram und versuchen Sie es erneut.",
  booking_telegram_verify_error_session:
    "Sitzung nicht gefunden. Bitte starten Sie erneut.",
  booking_telegram_verify_error_create: "Fehler beim Erstellen der Buchung",
  booking_telegram_verify_error_complete:
    "Fehler beim Abschluss der Registrierung",
  booking_telegram_verify_error_check: "Fehler bei der Codeprüfung",
  booking_telegram_verify_success_sent: "Code an Telegram gesendet!",
  booking_telegram_verify_success_verified: "Code bestätigt!",
  booking_telegram_verify_success_creating: "Buchung wird erstellt...",
  booking_telegram_verify_back: "Zurück",

  booking_confirmation_error_title: "Fehler",
  booking_confirmation_error_missing_id: "Buchungs-ID fehlt",
  booking_confirmation_error_cta: "Neue Buchung erstellen",
  booking_confirmation_title: "Buchung erstellt!",
  booking_confirmation_subtitle:
    "Ihre Buchung wurde erfolgreich erstellt. Wir kontaktieren Sie zur Bestätigung.",
  booking_confirmation_details_number_label: "Buchungsnummer",
  booking_confirmation_details_status_label: "Status",
  booking_confirmation_status_pending: "Wartet auf Bestätigung",
  booking_confirmation_action_home: "Zur Startseite",
  booking_confirmation_action_new: "Neue Buchung erstellen",
  booking_confirmation_notice_title: "Bitte beachten:",
  booking_confirmation_notice_body:
    "Wir werden Sie in Kürze kontaktieren, um die Buchung zu bestätigen. Wenn Sie Fragen haben, rufen Sie uns an oder schreiben Sie uns eine E-Mail.",
  booking_confirmation_loading: "Laden...",

  booking_client_page_title: "Registrierung wählen | Salon Elen",
  booking_client_page_description:
    "Wählen Sie die Registrierungsmethode, um die Buchung abzuschließen",
  booking_client_params_error_title: "Parameterfehler",
  booking_client_params_error_text: "Erforderliche Buchungsparameter fehlen",
  booking_client_params_error_return: "Zum Anfang zurück",

  booking_client_step_start_label: "Beginn:",
  booking_client_step_end_label: "Ende:",
  booking_client_step_name_label: "Ihr Name",
  booking_client_step_name_placeholder: "Zum Beispiel Anna",
  booking_client_step_phone_label: "Telefon",
  booking_client_step_phone_placeholder: "+49…",
  booking_client_step_email_label: "E-Mail (optional)",
  booking_client_step_email_placeholder: "name@example.com",
  booking_client_step_notes_label: "Wünsche (optional)",
  booking_client_step_notes_placeholder: "Kommentar zur Buchung",
  booking_client_step_back: "Zurück",
  booking_client_step_continue: "Weiter",

  email_service_not_configured: "E-Mail-Dienst ist nicht konfiguriert",
  email_send_unknown_error: "Unbekannter E-Mail-Fehler",
  email_status_subject_pending: "🔔 Neue Buchung - Wartet auf Bestätigung",
  email_status_subject_confirmed: "✅ Buchung bestätigt - Salon Elen",
  email_status_subject_done: "🎉 Danke für Ihren Besuch - Salon Elen",
  email_status_subject_canceled: "❌ Buchung storniert - Salon Elen",
  email_status_text_pending: "Wartet auf Bestätigung",
  email_status_text_confirmed: "Bestätigt",
  email_status_text_done: "Abgeschlossen",
  email_status_text_canceled: "Storniert",
  email_status_message_pending:
    "Wir haben Ihre Buchungsanfrage erhalten. Unser Administrator wird Sie in Kürze zur Bestätigung kontaktieren.",
  email_status_message_confirmed_intro:
    "Gute Nachrichten! Ihre Buchung ist bestätigt.",
  email_status_message_confirmed_wait:
    "Wir erwarten Sie <strong>{date}</strong>",
  email_status_message_confirmed_notice_title: "✨ Wichtig:",
  email_status_message_confirmed_notice_text:
    "Bitte kommen Sie 5 Minuten vor Beginn.",
  email_status_message_done_intro:
    "Danke, dass Sie Salon Elen gewählt haben! 💖",
  email_status_message_done_outro:
    "Wir hoffen, Ihnen hat das Ergebnis gefallen. Wir freuen uns, Sie wiederzusehen!",
  email_status_message_done_tip_title: "📅 Tipp:",
  email_status_message_done_tip_text:
    "Für ein dauerhaftes Ergebnis empfehlen wir eine neue Buchung in 3-4 Wochen.",
  email_status_review_title: "Teilen Sie Ihre Erfahrung – es dauert nur eine Minute",
  email_status_review_text:
    "Ihre ehrliche Bewertung hilft zukünftigen Kundinnen, sich sicherer für eine Behandlung zu entscheiden, und hilft uns, noch besser zu werden. Beschreiben Sie mit eigenen Worten, wie Sie Ihren Besuch erlebt haben.",
  email_status_review_button: "Erfahrung auf Google teilen",
  review_prompt_label: "Eine Frage als kleine Formulierungshilfe:",
  review_prompt_1: "Was ist Ihnen während der Behandlung besonders aufgefallen?",
  review_prompt_2: "Wie haben Sie Ergebnis, Beratung und Atmosphäre erlebt?",
  review_prompt_3: "Was sollten andere Kundinnen über Ihren Besuch wissen?",
  review_prompt_4: "Wie bewerten Sie Ergebnis und Betreuung?",
  review_prompt_5: "Wie haben Sie Ihren Besuch bei Salon Elen erlebt?",
  email_status_loyalty_title: "Ihr Dankeschön: 10 % Rabatt",
  email_status_loyalty_text:
    "Für Ihre nächste Behandlung bei Salon Elen erhalten Sie 10 % Rabatt. Dieser gilt unabhängig davon, ob Sie eine Bewertung abgeben oder welchen Inhalt sie hat. Zeigen Sie diese E-Mail bei Ihrem nächsten Besuch vor.",
  email_status_message_canceled_intro:
    "Leider wurde Ihre Buchung storniert.",
  email_status_message_canceled_contact_intro:
    "Wenn dies ein Fehler war oder Sie einen neuen Termin möchten, kontaktieren Sie uns:",
  email_status_message_canceled_contact:
    "📞 <strong>Telefon:</strong> +38 (000) 000-00-00<br>💬 <strong>Telegram:</strong> @salon_elen",
  email_status_html_title: "Salon Elen - Benachrichtigung",
  email_status_header_subtitle: "Buchungsbenachrichtigung",
  email_status_greeting: "Hallo, <strong>{name}</strong>!",
  email_status_details_title: "📋 Buchungsdetails",
  email_status_details_status_label: "Status:",
  email_status_details_service_label: "Leistung:",
  email_status_details_master_label: "Spezialist:",
  email_status_details_datetime_label: "Datum und Uhrzeit:",
  email_status_cta_button: "📅 Erneut buchen",
  email_status_footer_tagline: "Salon Elen - Ihre Schönheit, unsere Fürsorge 💖",
  email_status_footer_address: "Lessingstrasse 37, 06114 Halle Saale",
  email_status_footer_contacts: "📞 +49 177 899 51 06 | 📧 elen69@web.de",
  email_status_footer_note:
    "Dies ist eine automatische Benachrichtigung. Bitte antworten Sie nicht auf diese E-Mail.",
  email_test_subject: "🧪 Test-E-Mail - Salon Elen",
  email_test_title: "✅ E-Mail ist korrekt eingerichtet!",
  email_test_body:
    "Wenn Sie diese E-Mail sehen, funktioniert Resend korrekt.",
  email_test_footer: "Gesendet von Salon Elen",

  telegram_code_title: "Salon Elen - Verifizierungscode",
  telegram_code_intro: "Ihr Bestätigungscode:",
  telegram_code_expires: "Der Code ist {minutes} Minuten gültig.",
  telegram_payment_status_paid: "Bezahlt",
  telegram_payment_status_pending: "Zahlung ausstehend",
  telegram_payment_status_failed: "Zahlungsfehler",
  telegram_payment_status_refunded: "Erstattung",
  telegram_payment_status_unknown: "Unbekannt",
  telegram_admin_new_title: "NEUE BUCHUNG!",
  telegram_admin_label_date: "Datum",
  telegram_admin_label_time: "Uhrzeit",
  telegram_admin_label_client: "Kunde",
  telegram_admin_label_phone: "Telefon",
  telegram_admin_label_email: "E-Mail",
  telegram_admin_label_service: "Leistung",
  telegram_admin_label_master: "Spezialist",
  telegram_admin_label_payment: "Zahlung",
  telegram_admin_label_id: "Buchungs-ID",
  telegram_admin_open_button: "📊 In Admin öffnen",
  telegram_client_status_title_pending: "🔔 Anfrage erhalten",
  telegram_client_status_title_confirmed: "✅ Buchung bestätigt",
  telegram_client_status_title_done: "🎉 Danke für Ihren Besuch",
  telegram_client_status_title_canceled: "❌ Buchung storniert",
  telegram_client_status_text_pending: "Wartet auf Bestätigung",
  telegram_client_status_text_confirmed: "Bestätigt",
  telegram_client_status_text_done: "Abgeschlossen",
  telegram_client_status_text_canceled: "Storniert",
  telegram_client_status_message_pending:
    "Wir haben Ihre Anfrage erhalten. Ein Administrator wird Sie in Kürze kontaktieren.",
  telegram_client_status_message_confirmed:
    "Wir erwarten Sie! Bitte kommen Sie 5 Minuten vor dem Termin.",
  telegram_client_status_message_done:
    "Danke, dass Sie Salon Elen gewählt haben! Wir freuen uns auf Ihren nächsten Besuch.",
  telegram_client_status_message_canceled:
    "Wenn Sie den Termin verschieben möchten, kontaktieren Sie uns bitte.",
  telegram_client_review_text:
    "Ihre ehrliche Bewertung und Empfehlung helfen anderen Kundinnen bei ihrer Entscheidung. Teilen Sie Ihre Erfahrung – es dauert nur eine Minute.",
  telegram_client_review_discount:
    "🎁 Ihr Dankeschön: 10 % Rabatt auf Ihre nächste Behandlung. Der Rabatt gilt unabhängig von der Veröffentlichung oder dem Inhalt einer Bewertung. Zeigen Sie diese Nachricht bei Ihrem nächsten Besuch vor.",
  telegram_client_review_button: "⭐ Erfahrung teilen",
  telegram_client_greeting: "Hallo, {name}!",
  telegram_client_label_date: "Datum",
  telegram_client_label_time: "Uhrzeit",
  telegram_client_label_service: "Leistung",
  telegram_client_label_master: "Spezialist",
  telegram_client_label_status: "Status",
  telegram_start_title: "Willkommen bei Salon Elen!",
  telegram_start_prompt:
    "Um den Bot zu nutzen, senden Sie Ihre Telefonnummer, indem Sie die Schaltfläche unten drücken.",
  telegram_start_after:
    "Danach erhalten Sie Bestätigungscodes für die Online-Buchung.",
  telegram_button_send_phone: "📱 Telefonnummer senden",
  telegram_contact_saved_title: "Telefonnummer gespeichert!",
  telegram_contact_saved_phone: "Ihre Nummer: {phone}",
  telegram_contact_saved_ready:
    "Jetzt können Sie Telegram zur Bestätigung von Buchungen verwenden.",
  telegram_request_contact_prompt: "Bitte senden Sie Ihre Telefonnummer:",

  api_telegram_send_to_registered_missing_params:
    "E-Mail und draftId sind erforderlich",
  api_telegram_send_to_registered_user_not_found: "Benutzer nicht gefunden",
  api_telegram_send_to_registered_code_not_found: "Code nicht gefunden",
  api_telegram_send_to_registered_success: "Code gesendet",
  api_telegram_send_to_registered_error: "Fehler beim Senden des Codes",
  api_email_check_missing: "E-Mail fehlt",
  api_email_check_invalid: "Ungültiges E-Mail-Format",
  api_email_check_too_long: "E-Mail ist zu lang",
  api_email_check_error: "Fehler bei der E-Mail-Prüfung",
  api_google_oauth_not_configured:
    "Google OAuth ist nicht konfiguriert. Bitte kontaktieren Sie den Administrator.",
  api_google_oauth_missing_params: "E-Mail und draftId sind erforderlich",
  api_google_oauth_draft_not_found: "Buchungsentwurf nicht gefunden",
  api_google_oauth_email_mismatch:
    "E-Mail stimmt nicht mit dem Entwurf überein",
  api_google_oauth_generated: "OAuth-URL generiert",
  api_google_oauth_error: "Fehler beim Generieren der OAuth-URL",
  api_google_status_missing_params: "E-Mail und draftId sind erforderlich",
  api_google_status_error: "Fehler beim Prüfen des Status",
  api_google_callback_access_denied: "Zugriff abgelehnt",
  api_google_callback_invalid_params: "Ungültige Parameter",
  api_google_callback_invalid_state: "Ungültiger Verifizierungstoken",
  api_google_callback_expired:
    "Anfrage ist abgelaufen, bitte erneut versuchen",
  api_google_callback_already_verified: "Bereits bestätigt",
  api_google_callback_missing_email: "Google hat keine E-Mail zurückgegeben",
  api_google_callback_email_mismatch:
    "E-Mail stimmt nicht mit der Buchung überein",
  api_google_callback_draft_not_found: "Buchungsentwurf nicht gefunden",
  api_google_callback_slot_taken: "Die gewählte Zeit ist bereits belegt",
  api_google_callback_error: "Fehler bei der Callback-Verarbeitung",
  api_email_confirm_missing_fields: "Alle Felder sind erforderlich",
  api_email_confirm_invalid_code: "Ungültiger Code oder E-Mail",
  api_email_confirm_draft_not_found: "Entwurf nicht gefunden",
  api_email_confirm_success: "Buchung bestätigt",
  api_email_confirm_slot_taken:
    "Die gewählte Zeit ist bereits belegt. Bitte wählen Sie eine andere Zeit.",
  api_email_confirm_error: "Fehler bei der Codebestätigung",
  api_payment_missing_params: "appointmentId und paymentMethod sind erforderlich",
  api_payment_invalid_method: "Ungültige Zahlungsmethode",
  api_payment_not_found: "Buchung nicht gefunden",
  api_payment_unknown_service: "unbekannte Leistung",
  api_payment_note_prefix: "Zahlungsmethode",
  api_payment_card_redirect: "Weiterleitung zur Kartenzahlung",
  api_payment_paypal_redirect: "Weiterleitung zu PayPal",
  api_payment_cash: "Barzahlung im Salon",
  api_payment_unknown_method: "Unbekannte Zahlungsmethode",
  api_payment_error: "Fehler bei der Zahlungsabwicklung",
  api_admin_clients_unauthorized: "Keine Berechtigung",
  api_admin_clients_missing_fields: "Pflichtfelder fehlen",
  api_admin_clients_duplicate_active:
    "Ein Kunde mit dieser Telefonnummer oder E-Mail existiert bereits",
  api_admin_clients_duplicate_deleted:
    "Ein gelöschter Kunde mit dieser Telefonnummer oder E-Mail wurde gefunden",
  api_admin_clients_duplicate_suggestion:
    "Sie können den gelöschten Kunden wiederherstellen, statt einen neuen zu erstellen",
  api_admin_clients_created: "Kunde erfolgreich erstellt",
  api_admin_clients_error: "Fehler beim Erstellen des Kunden",

  // ======= CONTACTS (NEW) =======
  contacts_seo_description:
    "Adresse, Telefon, Öffnungszeiten und Anfahrt. Online-Termin bei Salon Elen in Halle (Saale).",

  contacts_subtitle: "Kontakt • Schnell & bequem",
  contacts_title: "Kontakt",
  contacts_intro:
    "Wir helfen gern bei Fragen zu Leistungen, Zeiten und Terminen. Anrufen, E-Mail schreiben oder Route öffnen.",

  contacts_quick_title: "Karte & Nachricht",

  contacts_quick_call: "Anrufen",
  contacts_quick_book: "Online-Termin",
  contacts_quick_route: "Route",

  contacts_details_title: "Salon-Daten",

  contacts_open_maps: "In Google Maps öffnen",

  contacts_map_title: "So finden Sie uns",
  contacts_map_caption: "Karte öffnen und Route mit einem Klick starten.",
  contacts_show_map: "Interaktive Karte anzeigen",
  contacts_map_privacy:
    "Die Karte wird erst nach Klick geladen. Google kann Cookies setzen und Daten gemäß eigener Richtlinien verarbeiten.",

  contacts_address_label: "Adresse",
  contacts_phone_label: "Telefon",
  contacts_email_label: "E-Mail",
  contacts_hours_label: "Öffnungszeiten",
  contacts_hours_value: "Mo–Fr 10:00–19:00, Sa 10:00–16:00",

  contacts_form_title: "Nachricht senden",
  contacts_form_name: "Ihr Name",
  contacts_form_phone: "Telefon (optional)",
  contacts_form_message: "Nachricht",
  contacts_form_send: "Senden",
  contacts_form_note:
    "Die Nachricht öffnet sich in Ihrem Mail-Programm. Falls nicht, schreiben Sie bitte direkt an elen69@web.de",



};

/* ==================== ENGLISH (EN) ==================== */

const enMessages: BaseMessages = {
  // Navigation
  nav_home: "Home",
  nav_services: "Services",
  nav_prices: "Prices",
  nav_gallery: "Gallery",
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
  home_services_card2_text: "Aesthetics, hygiene and long-lasting coating.",
  home_services_card3_title: "Make-up",
  home_services_card3_text: "We create the right look for any occasion.",

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
  footer_address_label: "Lessingstrasse 37, Halle (Saale)",

  footer_hours_label: "Opening hours",
  footer_hours_weekdays: "Mon–Fri: 10:00 – 19:00",
  footer_hours_saturday: "Sat: 10:00 – 16:00",
  footer_hours_sunday: "Sun: closed",

  footer_navigation_section: "Navigation",

  footer_clients_section: "For clients and stylists",

  footer_socials_section: "Social Media & Messengers",

  footer_privacy: "Privacy Policy",
  footer_cookie_settings: "Cookie settings",
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

  site_name: "Salon Elen",
  booking_header_subtitle: "Premium Booking",
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
  booking_master_hero_subtitle:
    "Our experts will create the perfect look for you",
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
  booking_calendar_legend_subtitle: "The higher the fill, the more bookings",

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
  booking_calendar_available_slots: "Available slots:",
  booking_calendar_slot_taken: "This slot was just booked by another client. Please select a different time.",
  booking_calendar_reserve_error: "Reservation error. Please try again.",

  // ======= BOOKING - CLIENT CHOICE PAGE =======
  booking_client_choice_title: "How would you like to proceed?",
  booking_client_choice_subtitle: "Choose your preferred registration method",
  booking_client_choice_recommended: "Recommended",

  booking_client_google_title: "Quick Registration",
  booking_client_google_description:
    "Sign in with Google and go straight to payment",
  booking_client_google_benefit_1: "One click to payment",
  booking_client_google_benefit_2: "Auto-fill data",
  booking_client_google_benefit_3: "Safe and secure",
  booking_client_google_benefit_4: "Save time",
  booking_client_google_button: "Start with 1 click",
  booking_client_google_security: "Protected by Google OAuth 2.0",
  booking_client_google_connecting: "Connecting...",

  booking_client_form_title: "Fill out form",
  booking_client_form_description:
    "Traditional method with full control over your data",
  booking_client_form_benefit_1: "Full data control",
  booking_client_form_benefit_2: "No Google account needed",
  booking_client_form_benefit_3: "Familiar process",
  booking_client_form_benefit_4: "Verification via Telegram",
  booking_client_form_button: "Fill out form",
  booking_client_form_security: "Confirmation via Telegram Bot",

  booking_client_choice_footer: "All methods are safe and reliable.",
  booking_client_choice_footer_highlight:
    "Choose the one that's more convenient for you.",

  booking_client_popup_blocked:
    "Could not open window. Please allow pop-ups in your browser.",
  booking_client_google_error_init: "Google OAuth initialization error",
  booking_client_auth_error: "Authorization error",
  booking_client_auth_waiting: "Waiting for confirmation via Google...",

  // ======= BOOKING - CLIENT FORM PAGE =======
  booking_client_form_badge: "Step 4 — Your contact information",
  booking_client_form_hero_title: "Online Booking",
  booking_client_form_hero_subtitle:
    "Provide your details so we can confirm your booking",

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
  booking_client_form_email_error_note:
    "If you make a mistake in the address, you can still come to the appointment, but you won't receive reminders and confirmations.",

  booking_client_form_button_back: "Back",
  booking_client_form_button_submit: "Book",
  booking_client_form_button_submitting: "Verifying data…",

  booking_client_form_info_title: "Why do we ask for your e-mail?",
  booking_client_form_info_point_1: "We will send to your e-mail",
  booking_client_form_info_point_1_highlight:
    "booking confirmation and all details",
  booking_client_form_info_point_2: "You will receive",
  booking_client_form_info_point_2_highlight: "a reminder before your visit",
  booking_client_form_info_point_3:
    "We carefully handle personal data and use your e-mail only for your booking service",

  booking_client_form_invalid_params:
    "Invalid parameters. Please start the booking again.",
  booking_client_form_invalid_return: "Return to service selection",

  // ======= BOOKING - PHONE & BIRTHDAY PAGE (NEW) =======
  phone_title: "Contact Information",
  phone_subtitle: "Provide your contact details",
  phone_label: "Phone",
  phone_hint: "We will contact you to confirm the appointment",
  phone_required: "Phone number is required",
  phone_submit: "Continue",
  phone_submitting: "Submitting...",
  phone_privacy: "Your data is protected and not shared with third parties",
  birthday_label: "Date of Birth",
  birthday_hint:
    "We need your date of birth so we can offer you a personalized discount for your celebration in the future!",

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
  booking_verify_email_wrong_hint:
    "If email is incorrect, go back to the previous step",
  booking_verify_email_send_code: "Send code",
  booking_verify_email_sending: "Sending…",
  booking_verify_email_arrives_hint: "Code arrives within a few seconds",
  booking_verify_email_enter_code: "Enter 6-digit code",
  booking_verify_email_code_valid: "Code is valid for limited time",
  booking_verify_email_confirm_code: "Confirm code",
  booking_verify_email_checking: "Checking…",
  booking_verify_email_resend: "Resend code",
  booking_verify_email_sent_message: "Code sent to email",
  booking_verify_email_api_missing_params: "Email and draftId are required",
  booking_verify_email_api_draft_not_found: "Booking draft not found",
  booking_verify_email_api_email_mismatch: "Email does not match the draft",
  booking_verify_email_api_send_failed: "Failed to send code to email",
  booking_verify_email_api_error: "Failed to send code",
  booking_verify_info_title: "Secure Confirmation",
  booking_verify_info_desc:
    "We use a one-time code to protect your data and salon schedule",
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
  booking_verify_info_support:
    "If you have difficulties, contact us — we'll help complete the booking",
  booking_verify_invalid_params:
    "Invalid parameters. Please start the booking again.",
  booking_verify_invalid_return: "Return to service selection",
  booking_verify_google_title: "Confirm via Google",
  booking_verify_google_desc:
    "Sign in with your Google account for quick and secure booking confirmation.",
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
  booking_verify_google_security_desc:
    "We don't get access to your Google password. Official OAuth protocol is used.",
  booking_verify_google_success:
    "✅ Confirmed via Google! Redirecting to payment...",
  booking_verify_google_preparing_window:
    "🔐 Google will open in a new window...",
  booking_verify_google_allow_popups:
    "⚠️ Allow pop-ups and click the button below.",
  booking_verify_telegram_title: "Confirm via Telegram",
  booking_verify_telegram_desc_registered:
    "Code sent to Telegram bot. Check messages and click the confirmation button.",
  booking_verify_telegram_desc_unregistered:
    "Telegram will open automatically. You'll get a code to enter or can confirm directly with a button in the bot.",
  booking_verify_telegram_sending_code: "Sending code...",
  booking_verify_telegram_open_button: "Open Telegram",
  booking_verify_telegram_reopen_button: "Reopen Telegram",
  booking_verify_telegram_waiting_bot:
    "Waiting for confirmation in Telegram bot...",
  booking_verify_telegram_waiting: "Waiting for confirmation...",
  booking_verify_telegram_divider: "or",
  booking_verify_telegram_enter_code: "Enter 6-digit code from Telegram",
  booking_verify_telegram_code_placeholder: "000000",
  booking_verify_telegram_code_valid: "Code is valid for 10 minutes.",
  booking_verify_telegram_confirm_button: "Confirm code",
  booking_verify_telegram_checking: "Checking...",
  booking_verify_telegram_code_sent:
    "✈️ Code sent to Telegram! Check the bot and click the confirmation button.",
  booking_verify_telegram_opening:
    "✈️ Telegram is opening... Waiting for confirmation.",
  booking_verify_telegram_click_button:
    "⚠️ Click the button below to open Telegram.",
  booking_verify_telegram_success:
    "✅ Confirmed via Telegram! Redirecting to payment...",
  booking_verify_error_enter_code: "Enter 6-digit code",
  booking_verify_success_redirect:
    "Verification successful! Redirecting to payment...",
  booking_email_otp_subject: "Booking confirmation code - Salon Elen",
  booking_email_otp_title: "Confirmation code",
  booking_email_otp_header_subtitle: "Booking confirmation",
  booking_email_otp_greeting: "Hello!",
  booking_email_otp_code_intro: "Your confirmation code to complete the booking:",
  booking_email_otp_expires_label: "Important:",
  booking_email_otp_expires_text: "The code is valid for {minutes} minutes.",
  booking_email_otp_ignore:
    "If you did not make a booking at Salon Elen, please ignore this email.",
  booking_email_otp_footer_tagline: "Salon Elen - Your beauty, our care 💖",
  booking_email_otp_footer_contact: "📧 booking@news.permanent-halle.de",
  booking_email_otp_footer_note:
    "This is an automated email. Please do not reply.",

  booking_payment_badge: "Step 6 — Payment and Final Confirmation",
  booking_payment_hero_title: "Complete Booking",
  booking_payment_hero_subtitle:
    "Choose payment method and confirm your booking",
  booking_payment_appointment_id: "Booking number:",
  booking_payment_method_title: "Payment Method",
  booking_payment_onsite_title: "Pay at Salon",
  booking_payment_onsite_desc: "On-site",
  booking_payment_onsite_benefit_1: "Cash or card at salon",
  booking_payment_onsite_benefit_2: "No prepayment",
  booking_payment_onsite_benefit_3: "Pay after service",
  booking_payment_online_title: "Online Payment",
  booking_payment_online_desc: "Coming soon",
  // booking_payment_online_benefit_1: "Card, Apple Pay, Google Pay",
  // booking_payment_online_benefit_2: "In development",
  // booking_payment_online_benefit_3: "Booking will be confirmed anyway",
  // Info block - CURRENT text
  booking_payment_info_how_works_title: "How does it work?",
  booking_payment_info_how_works_desc: "The system has already created an appointment in the salon schedule. You can pay online with card (Stripe) or via PayPal, or pay cash/card at the salon after the service.",
  booking_payment_info_title: "How it works?",
  booking_payment_info_desc:
    "The system has already created an appointment in the salon schedule. Payment is recorded on the salon side. Online payment will be added later.",
  booking_payment_confirm_button: "Confirm Booking",
  booking_payment_confirm_terms:
    'By clicking "Confirm Booking", you agree to the salon terms',
  booking_payment_summary_title: "Booking Summary",
  booking_payment_summary_visit: "Your visit to SalonElen",
  booking_payment_summary_service: "Service from booking",
  booking_payment_summary_master: "Master from booking",
  booking_payment_summary_datetime: "Date and time by ID:",
  booking_payment_summary_address: "Salon address",
  booking_payment_summary_cancellation_title: "Cancellation Policy",
  booking_payment_summary_cancellation_desc:
    "If you cannot make it, please cancel in advance — this will free up time for other salon guests.",
  booking_payment_summary_future_note:
    "After launching online payment, a payment method selection block and payment status will appear here",
  booking_payment_success_title: "Booking Confirmed!",
  booking_payment_success_desc:
    "Your booking has been successfully confirmed. Payment will be made at the salon.",
  booking_payment_success_home: "Go to Home",
  booking_payment_success_calendar: "Add to Google Calendar",
  booking_payment_success_apple_calendar: "Add to Apple Calendar",
  booking_payment_success_new: "Make New Booking",
  booking_payment_error_title: "Error Proceeding to Payment",
  booking_payment_error_desc:
    "We couldn't find the booking ID. Perhaps the link is outdated or the email confirmation step was skipped.",
  booking_payment_error_return: "Return to Booking",
  booking_payment_error_missing:
    "Booking ID is missing. Please start the booking again.",
  booking_success_page_title: "Online Booking",
  booking_success_page_subtitle: "Success",
  booking_success_loading: "Loading...",
  booking_success_loading_data: "Loading data…",
  booking_success_error_title: "Error",
  booking_success_error_not_found: "Booking ID not found",
  booking_success_error_load_failed: "Failed to load booking data",
  booking_success_error_return: "Return to Booking",
  booking_success_title: "Booking Confirmed!",
  booking_success_desc:
    "Your booking has been successfully created. We've sent a confirmation to your email.",
  booking_success_details_title: "Booking Details:",
  booking_success_details_name: "Name",
  booking_success_details_email: "Email",
  booking_success_details_phone: "Phone",
  booking_success_details_datetime: "Date and Time",
  booking_success_button_new: "Create New Booking",
  booking_success_button_home: "Go to Home",

  calendar_title_appointment_in: "at SalonElen",
  calendar_description_title: "Appointment at SalonElen Beauty Salon",
  calendar_service: "Service:",
  calendar_master: "Master:",
  calendar_date: "Date:",
  calendar_time: "Time:",
  calendar_duration: "Duration:",
  calendar_duration_minutes: "minutes",
  calendar_appointment_id: "Appointment ID:",
  calendar_address: "Address:",
  calendar_contacts: "Contacts:",
  calendar_phone: "Phone:",
  calendar_reschedule_notice:
    "If you need to reschedule or cancel your appointment, please contact us in advance.",
  calendar_see_you: "See you soon! ✨",
  calendar_location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",

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

  // SMS VERIFICATION PAGE
  booking_sms_verify_title: "Phone Verification",
  booking_sms_verify_subtitle: "We'll send you a 4-digit PIN code via SMS",
  booking_sms_verify_phone_label: "Phone Number",
  booking_sms_verify_phone_placeholder: "+49 177 899 5106",
  booking_sms_verify_phone_hint:
    "Format: +[country code][number] (e.g.: +4917789951064)",
  booking_sms_verify_phone_required: "Enter phone number",
  booking_sms_verify_send_pin: "Send PIN Code",
  booking_sms_verify_sending: "Sending...",
  booking_sms_verify_pin_validity: "PIN code is valid for 10 minutes",

  booking_sms_verify_pin_title: "Enter PIN Code",
  booking_sms_verify_pin_subtitle: "PIN code sent to",
  booking_sms_verify_pin_label: "PIN Code",
  booking_sms_verify_pin_placeholder: "0000",
  booking_sms_verify_pin_hint: "Enter 4-digit PIN code from SMS",
  booking_sms_verify_confirm: "Confirm",
  booking_sms_verify_checking: "Checking...",
  booking_sms_verify_resend: "Resend PIN Code",
  booking_sms_verify_change_phone: "Change Phone Number",
  booking_sms_verify_pin_validity_note:
    "PIN code is valid for 10 minutes • Maximum 3 attempts",

  booking_sms_verify_error_title: "⚠️ Error",
  booking_sms_verify_error_missing_params:
    "Insufficient parameters. Please start the booking again.",
  booking_sms_verify_error_return: "Return to Booking",

  booking_sms_verify_contact: "Questions? Contact us: +49 177 899 5106",

  // SMS DETAILS PAGE
  booking_sms_details_title: "Your Details",
  booking_sms_details_subtitle:
    "Please provide your name and additional information",
  booking_sms_details_name_label: "Your Name",
  booking_sms_details_name_placeholder: "John Doe",
  booking_sms_details_name_required: "Name is required",
  booking_sms_details_email_label: "Email",
  booking_sms_details_email_placeholder: "john@example.com",
  booking_sms_details_email_hint: "For confirmation and reminders",
  booking_sms_details_birth_label: "Date of Birth",
  booking_sms_details_birth_hint:
    "We need your date of birth so we can offer you a personalized discount for your celebration in the future!",
  booking_sms_details_submit: "Continue to Payment",
  booking_sms_details_submitting: "Saving...",
  booking_sms_details_privacy:
    "Your data is protected and not shared with third parties",

  booking_sms_details_error_title: "⚠️ Error",
  booking_sms_details_error_missing_id:
    "Registration ID is missing. Please start the booking again.",
  booking_sms_details_error_return: "Return to Booking",

  booking_sms_details_contact: "Questions? Contact us: +49 177 899 5106",

  // SMS CARD
  booking_client_sms_title: "By Phone (SMS)",
  booking_client_sms_description: "Get PIN code via SMS",
  booking_client_sms_benefit_1: "PIN code via SMS",
  booking_client_sms_benefit_2: "No email registration",
  booking_client_sms_benefit_3: "Fast and secure",
  booking_client_sms_benefit_4: "4-digit code",
  booking_client_sms_button: "Sign in via SMS",
  booking_client_sms_security: "Infobip SMS",

  // STRIPE PAYMENT
  booking_payment_stripe_title: "Card Payment",
  booking_payment_stripe_desc: "Secure payment via Stripe",
  booking_payment_stripe_benefit_1: "All cards: Visa, MasterCard, AmEx",
  booking_payment_stripe_benefit_2: "Instant confirmation",
  booking_payment_stripe_benefit_3: "3D Secure protection",
  booking_payment_stripe_amount: "Amount to pay",
  booking_payment_stripe_secure: "Secure",
  booking_payment_stripe_processing: "Processing payment...",
  booking_payment_stripe_pay: "Pay",
  booking_payment_stripe_note: "Your payment data is protected by 256-bit encryption",

  // PAYPAL PAYMENT
  booking_payment_paypal_title: "PayPal",
  booking_payment_paypal_desc: "Pay with PayPal account",
  booking_payment_paypal_benefit_1: "Fast payment via PayPal",
  booking_payment_paypal_benefit_2: "Buyer protection",
  booking_payment_paypal_benefit_3: "No fees",
  booking_payment_paypal_amount: "Amount to pay",
  booking_payment_paypal_secure: "Secure",
  booking_payment_paypal_note: "After clicking, you will be redirected to the secure PayPal page",
  booking_payment_paypal_footer: "Payments are processed through PayPal. Your data is protected.",

  // ======= BOOKING - TELEGRAM CARD =======
  booking_client_telegram_title: "Telegram",
  booking_client_telegram_description: "Quick registration via Telegram bot",
  booking_client_telegram_benefit_1: "Code in Telegram",
  booking_client_telegram_benefit_2: "No email registration",
  booking_client_telegram_benefit_3: "Fast and secure",
  booking_client_telegram_benefit_4: "6-digit code",
  booking_client_telegram_button: "Sign in via Telegram",
  booking_client_telegram_security: "Telegram Bot verification",

  // ======= BOOKING - TELEGRAM VERIFICATION PAGE =======
  booking_telegram_verify_title: "Registration via Telegram",
  booking_telegram_verify_subtitle: "Follow 3 simple steps",

  booking_telegram_verify_step1_title: "Step 1: Phone number",
  booking_telegram_verify_step1_subtitle: "Enter your phone number",
  booking_telegram_verify_phone_label: "Phone number",
  booking_telegram_verify_phone_placeholder: "+49 177 899 5106",
  booking_telegram_verify_phone_hint: "Format: +[country code][number]",
  booking_telegram_verify_phone_required: "Enter phone number",
  booking_telegram_verify_send_code: "Send code",
  booking_telegram_verify_sending: "Sending...",

  booking_telegram_verify_step2_title: "Step 2: Code from Telegram",
  booking_telegram_verify_step2_subtitle: "Enter the code we sent you in Telegram",
  booking_telegram_verify_code_label: "Confirmation code",
  booking_telegram_verify_code_placeholder: "000000",
  booking_telegram_verify_code_hint: "6-digit code from Telegram bot",
  booking_telegram_verify_code_required: "Enter 6-digit code",
  booking_telegram_verify_check_code: "Confirm code",
  booking_telegram_verify_checking: "Checking...",
  booking_telegram_verify_resend: "Resend code",

  booking_telegram_verify_step3_title: "Step 3: Additional information",
  booking_telegram_verify_step3_subtitle: "Fill in your details (optional)",
  booking_telegram_verify_email_label: "Email",
  booking_telegram_verify_email_placeholder: "your@email.com",
  booking_telegram_verify_email_hint: "For confirmation and reminders",
  booking_telegram_verify_birth_label: "Date of birth",
  booking_telegram_verify_birth_hint: "For personalized discounts for your celebration",
  booking_telegram_verify_complete: "Complete registration",
  booking_telegram_verify_completing: "Saving...",

  booking_telegram_verify_privacy: "Your data is protected and not shared with third parties",
  booking_telegram_verify_error_title: "⚠️ Error",
  booking_telegram_verify_error_missing: "Insufficient parameters. Please start the booking again.",
  booking_telegram_verify_error_return: "Return to booking",

  booking_telegram_modal_title: "Telegram bot registration",
  booking_telegram_modal_subtitle:
    "To receive verification codes, you need to register in our Telegram bot",
  booking_telegram_modal_phone_label: "Your number:",
  booking_telegram_modal_how_title: "How to register:",
  booking_telegram_modal_step_open_bot:
    "Click the button below to open the Telegram bot",
  booking_telegram_modal_step_register:
    "The bot will automatically register your number",
  booking_telegram_modal_step_done: "Return here and click",
  booking_telegram_modal_button_open: "Open Telegram bot",
  booking_telegram_modal_button_done: "I'm registered",
  booking_telegram_modal_note:
    "The verification code will arrive in the Telegram bot within a few seconds",

  booking_telegram_verify_error_send: "Failed to send code",
  booking_telegram_verify_error_expired: "Code expired. Request a new code.",
  booking_telegram_verify_error_invalid_code:
    "Invalid code. Check the code in Telegram and try again.",
  booking_telegram_verify_error_session: "Session not found. Please start over.",
  booking_telegram_verify_error_create: "Failed to create booking",
  booking_telegram_verify_error_complete: "Failed to complete registration",
  booking_telegram_verify_error_check: "Failed to verify code",
  booking_telegram_verify_success_sent: "Code sent to Telegram!",
  booking_telegram_verify_success_verified: "Code verified!",
  booking_telegram_verify_success_creating: "Creating booking...",
  booking_telegram_verify_back: "Back",

  booking_confirmation_error_title: "Error",
  booking_confirmation_error_missing_id: "Booking ID is missing",
  booking_confirmation_error_cta: "Create a new booking",
  booking_confirmation_title: "Booking created!",
  booking_confirmation_subtitle:
    "Your booking was created successfully. We'll contact you to confirm.",
  booking_confirmation_details_number_label: "Booking number",
  booking_confirmation_details_status_label: "Status",
  booking_confirmation_status_pending: "Pending confirmation",
  booking_confirmation_action_home: "Back to home",
  booking_confirmation_action_new: "Create a new booking",
  booking_confirmation_notice_title: "Please note:",
  booking_confirmation_notice_body:
    "We will contact you shortly to confirm the booking. If you have questions, please call us or email us.",
  booking_confirmation_loading: "Loading...",

  booking_client_page_title: "Choose registration | Salon Elen",
  booking_client_page_description:
    "Choose a registration method to complete booking",
  booking_client_params_error_title: "Parameter error",
  booking_client_params_error_text: "Required booking parameters are missing",
  booking_client_params_error_return: "Back to start",

  booking_client_step_start_label: "Start:",
  booking_client_step_end_label: "End:",
  booking_client_step_name_label: "Your name",
  booking_client_step_name_placeholder: "For example, Anna",
  booking_client_step_phone_label: "Phone",
  booking_client_step_phone_placeholder: "+49…",
  booking_client_step_email_label: "Email (optional)",
  booking_client_step_email_placeholder: "name@example.com",
  booking_client_step_notes_label: "Notes (optional)",
  booking_client_step_notes_placeholder: "Booking comment",
  booking_client_step_back: "Back",
  booking_client_step_continue: "Continue",

  email_service_not_configured: "Email service is not configured",
  email_send_unknown_error: "Unknown email error",
  email_status_subject_pending: "🔔 New booking - Pending confirmation",
  email_status_subject_confirmed: "✅ Booking confirmed - Salon Elen",
  email_status_subject_done: "🎉 Thank you for your visit - Salon Elen",
  email_status_subject_canceled: "❌ Booking canceled - Salon Elen",
  email_status_text_pending: "Pending confirmation",
  email_status_text_confirmed: "Confirmed",
  email_status_text_done: "Completed",
  email_status_text_canceled: "Canceled",
  email_status_message_pending:
    "We received your booking request. Our administrator will contact you shortly to confirm.",
  email_status_message_confirmed_intro:
    "Great news! Your booking is confirmed.",
  email_status_message_confirmed_wait:
    "We look forward to seeing you on <strong>{date}</strong>",
  email_status_message_confirmed_notice_title: "✨ Important:",
  email_status_message_confirmed_notice_text:
    "Please arrive 5 minutes before your appointment.",
  email_status_message_done_intro:
    "Thank you for choosing Salon Elen! 💖",
  email_status_message_done_outro:
    "We hope you loved the result. We'd be happy to see you again!",
  email_status_message_done_tip_title: "📅 Tip:",
  email_status_message_done_tip_text:
    "To maintain results, we recommend booking again in 3-4 weeks.",
  email_status_review_title: "Share your experience — it only takes a minute",
  email_status_review_text:
    "Your honest review helps future clients choose their treatment with confidence and helps us keep improving. Describe your visit in your own words.",
  email_status_review_button: "Share your experience on Google",
  review_prompt_label: "A question to help you get started:",
  review_prompt_1: "What stood out to you during your treatment?",
  review_prompt_2: "How was your result, consultation, and salon experience?",
  review_prompt_3: "What should other clients know about your visit?",
  review_prompt_4: "How would you rate the result and care?",
  review_prompt_5: "How did you experience your visit to Salon Elen?",
  email_status_loyalty_title: "A thank-you gift: 10% off",
  email_status_loyalty_text:
    "You will receive 10% off your next treatment at Salon Elen. The discount applies whether or not you leave a review and regardless of its content. Show this email at your next visit.",
  email_status_message_canceled_intro:
    "Unfortunately, your booking was canceled.",
  email_status_message_canceled_contact_intro:
    "If this was a mistake or you want to reschedule, please contact us:",
  email_status_message_canceled_contact:
    "📞 <strong>Phone:</strong> +38 (000) 000-00-00<br>💬 <strong>Telegram:</strong> @salon_elen",
  email_status_html_title: "Salon Elen - Notification",
  email_status_header_subtitle: "Booking notification",
  email_status_greeting: "Hello, <strong>{name}</strong>!",
  email_status_details_title: "📋 Booking details",
  email_status_details_status_label: "Status:",
  email_status_details_service_label: "Service:",
  email_status_details_master_label: "Master:",
  email_status_details_datetime_label: "Date and time:",
  email_status_cta_button: "📅 Book again",
  email_status_footer_tagline: "Salon Elen - Your beauty, our care 💖",
  email_status_footer_address: "Lessingstrasse 37, 06114 Halle Saale",
  email_status_footer_contacts: "📞 +49 177 899 51 06 | 📧 elen69@web.de",
  email_status_footer_note:
    "This is an automated notification. Please do not reply to this email.",
  email_test_subject: "🧪 Test email - Salon Elen",
  email_test_title: "✅ Email is set up correctly!",
  email_test_body:
    "If you can see this email, Resend is working correctly.",
  email_test_footer: "Sent from Salon Elen",

  telegram_code_title: "Salon Elen - Verification code",
  telegram_code_intro: "Your confirmation code:",
  telegram_code_expires: "The code is valid for {minutes} minutes.",
  telegram_payment_status_paid: "Paid",
  telegram_payment_status_pending: "Payment pending",
  telegram_payment_status_failed: "Payment failed",
  telegram_payment_status_refunded: "Refunded",
  telegram_payment_status_unknown: "Unknown",
  telegram_admin_new_title: "NEW BOOKING!",
  telegram_admin_label_date: "Date",
  telegram_admin_label_time: "Time",
  telegram_admin_label_client: "Client",
  telegram_admin_label_phone: "Phone",
  telegram_admin_label_email: "Email",
  telegram_admin_label_service: "Service",
  telegram_admin_label_master: "Master",
  telegram_admin_label_payment: "Payment",
  telegram_admin_label_id: "Booking ID",
  telegram_admin_open_button: "📊 Open in admin",
  telegram_client_status_title_pending: "🔔 Request received",
  telegram_client_status_title_confirmed: "✅ Booking confirmed",
  telegram_client_status_title_done: "🎉 Thank you for your visit",
  telegram_client_status_title_canceled: "❌ Booking canceled",
  telegram_client_status_text_pending: "Pending confirmation",
  telegram_client_status_text_confirmed: "Confirmed",
  telegram_client_status_text_done: "Completed",
  telegram_client_status_text_canceled: "Canceled",
  telegram_client_status_message_pending:
    "We received your request. An administrator will contact you shortly.",
  telegram_client_status_message_confirmed:
    "We look forward to seeing you! Please arrive 5 minutes early.",
  telegram_client_status_message_done:
    "Thank you for choosing Salon Elen! We'd love to see you again.",
  telegram_client_status_message_canceled:
    "If you'd like to reschedule, please contact us.",
  telegram_client_review_text:
    "Your honest review and recommendation help other clients choose with confidence. Share your experience — it only takes a minute.",
  telegram_client_review_discount:
    "🎁 A thank-you gift: 10% off your next treatment. The discount applies regardless of whether you publish a review or what it says. Show this message at your next visit.",
  telegram_client_review_button: "⭐ Share your experience",
  telegram_client_greeting: "Hello, {name}!",
  telegram_client_label_date: "Date",
  telegram_client_label_time: "Time",
  telegram_client_label_service: "Service",
  telegram_client_label_master: "Master",
  telegram_client_label_status: "Status",
  telegram_start_title: "Welcome to Salon Elen!",
  telegram_start_prompt:
    "To use the bot, send your phone number using the button below.",
  telegram_start_after:
    "After that, you will receive confirmation codes for online booking.",
  telegram_button_send_phone: "📱 Send phone number",
  telegram_contact_saved_title: "Phone number saved!",
  telegram_contact_saved_phone: "Your number: {phone}",
  telegram_contact_saved_ready:
    "Now you can use Telegram to confirm bookings on the website.",
  telegram_request_contact_prompt: "Please send your phone number:",

  api_telegram_send_to_registered_missing_params:
    "Email and draftId are required",
  api_telegram_send_to_registered_user_not_found: "User not found",
  api_telegram_send_to_registered_code_not_found: "Code not found",
  api_telegram_send_to_registered_success: "Code sent",
  api_telegram_send_to_registered_error: "Failed to send code",
  api_email_check_missing: "Email is missing",
  api_email_check_invalid: "Invalid email format",
  api_email_check_too_long: "Email is too long",
  api_email_check_error: "Email validation error",
  api_google_oauth_not_configured:
    "Google OAuth is not configured. Please contact the administrator.",
  api_google_oauth_missing_params: "Email and draftId are required",
  api_google_oauth_draft_not_found: "Booking draft not found",
  api_google_oauth_email_mismatch: "Email does not match the draft",
  api_google_oauth_generated: "OAuth URL generated",
  api_google_oauth_error: "Failed to generate OAuth URL",
  api_google_status_missing_params: "Email and draftId are required",
  api_google_status_error: "Failed to check status",
  api_google_callback_access_denied: "Access denied",
  api_google_callback_invalid_params: "Invalid parameters",
  api_google_callback_invalid_state: "Invalid verification token",
  api_google_callback_expired: "Request expired, please try again",
  api_google_callback_already_verified: "Already verified",
  api_google_callback_missing_email: "Google did not return an email",
  api_google_callback_email_mismatch: "Email does not match the booking",
  api_google_callback_draft_not_found: "Booking draft not found",
  api_google_callback_slot_taken: "Selected time is already taken",
  api_google_callback_error: "Callback processing error",
  api_email_confirm_missing_fields: "All fields are required",
  api_email_confirm_invalid_code: "Invalid code or email",
  api_email_confirm_draft_not_found: "Draft not found",
  api_email_confirm_success: "Booking confirmed",
  api_email_confirm_slot_taken:
    "Selected time is already taken. Please choose another time.",
  api_email_confirm_error: "Code confirmation error",
  api_payment_missing_params: "appointmentId and paymentMethod are required",
  api_payment_invalid_method: "Invalid payment method",
  api_payment_not_found: "Booking not found",
  api_payment_unknown_service: "unknown service",
  api_payment_note_prefix: "Payment method",
  api_payment_card_redirect: "Redirecting to card payment",
  api_payment_paypal_redirect: "Redirecting to PayPal",
  api_payment_cash: "Cash payment at the salon",
  api_payment_unknown_method: "Unknown payment method",
  api_payment_error: "Payment processing error",
  api_admin_clients_unauthorized: "Unauthorized",
  api_admin_clients_missing_fields: "Missing required fields",
  api_admin_clients_duplicate_active:
    "A client with this phone or email already exists",
  api_admin_clients_duplicate_deleted:
    "A deleted client with this phone or email was found",
  api_admin_clients_duplicate_suggestion:
    "You can restore the deleted client instead of creating a new one",
  api_admin_clients_created: "Client created successfully",
  api_admin_clients_error: "Failed to create client",

  // ======= CONTACTS (NEW) =======
  contacts_seo_description:
    "Address, phone, opening hours and directions. Book online with Salon Elen in Halle (Saale).",

  contacts_subtitle: "Contact • Fast & easy",
  contacts_title: "Contact",
  contacts_intro:
    "We can help with services, timing and booking. Call, email us, or open directions instantly.",

  contacts_quick_title: "Map & message",

  contacts_quick_call: "Call",
  contacts_quick_book: "Book online",
  contacts_quick_route: "Directions",

  contacts_details_title: "Salon details",

  contacts_open_maps: "Open in Google Maps",

  contacts_map_title: "How to find us",
  contacts_map_caption: "Open the map and start navigation in one click.",
  contacts_show_map: "Show interactive map",
  contacts_map_privacy:
    "The map loads only after you click. Google may set cookies and process data under its policies.",

  contacts_address_label: "Address",
  contacts_phone_label: "Phone",
  contacts_email_label: "Email",
  contacts_hours_label: "Opening hours",
  contacts_hours_value: "Mon–Fri 10:00–19:00, Sat 10:00–16:00",

  contacts_form_title: "Send a message",
  contacts_form_name: "Your name",
  contacts_form_phone: "Phone (optional)",
  contacts_form_message: "Message",
  contacts_form_send: "Send",
  contacts_form_note:
    "Your email app will open with a draft. If it doesn’t, email us directly at elen69@web.de",




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


//-------добавляем переводы для галереи
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
//   site_name: string;
//   booking_header_subtitle: string;
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
//   booking_calendar_slot_taken: string;
//   booking_calendar_reserve_error: string;

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

//   // ======= BOOKING - PHONE & BIRTHDAY PAGE (NEW) =======
//   phone_title: string;
//   phone_subtitle: string;
//   phone_label: string;
//   phone_hint: string;
//   phone_required: string;
//   phone_submit: string;
//   phone_submitting: string;
//   phone_privacy: string;
//   birthday_label: string;
//   birthday_hint: string;

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
//   booking_verify_email_sent_message: string;
//   booking_verify_email_api_missing_params: string;
//   booking_verify_email_api_draft_not_found: string;
//   booking_verify_email_api_email_mismatch: string;
//   booking_verify_email_api_send_failed: string;
//   booking_verify_email_api_error: string;

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
//   booking_email_otp_subject: string;
//   booking_email_otp_title: string;
//   booking_email_otp_header_subtitle: string;
//   booking_email_otp_greeting: string;
//   booking_email_otp_code_intro: string;
//   booking_email_otp_expires_label: string;
//   booking_email_otp_expires_text: string;
//   booking_email_otp_ignore: string;
//   booking_email_otp_footer_tagline: string;
//   booking_email_otp_footer_contact: string;
//   booking_email_otp_footer_note: string;

//   // ======= BOOKING - PAYMENT PAGE =======
//   booking_payment_badge: string;
//   booking_payment_hero_title: string;
//   booking_payment_hero_subtitle: string;
//   booking_payment_appointment_id: string;
//   booking_payment_method_title: string;

//   booking_payment_onsite_title: string;
//   booking_payment_onsite_desc: string;
//   booking_payment_onsite_benefit_1: string;
//   booking_payment_onsite_benefit_2: string;
//   booking_payment_onsite_benefit_3: string;

//   booking_payment_online_title: string;
//   booking_payment_online_desc: string;
//   // booking_payment_online_benefit_1: string;
//   // booking_payment_online_benefit_2: string;
//   // booking_payment_online_benefit_3: string;

//   booking_payment_info_title: string;
//   booking_payment_info_desc: string;
//   booking_payment_confirm_button: string;
//   booking_payment_confirm_terms: string;
//   booking_payment_info_how_works_title: string;
//   booking_payment_info_how_works_desc: string;

//   booking_payment_summary_title: string;
//   booking_payment_summary_visit: string;
//   booking_payment_summary_service: string;
//   booking_payment_summary_master: string;
//   booking_payment_summary_datetime: string;
//   booking_payment_summary_address: string;
//   booking_payment_summary_cancellation_title: string;
//   booking_payment_summary_cancellation_desc: string;
//   booking_payment_summary_future_note: string;

//   booking_payment_success_title: string;
//   booking_payment_success_desc: string;
//   booking_payment_success_home: string;
//   booking_payment_success_calendar: string;
//   booking_payment_success_apple_calendar: string;
//   booking_payment_success_new: string;

//   booking_payment_error_title: string;
//   booking_payment_error_desc: string;
//   booking_payment_error_return: string;
//   booking_payment_error_missing: string;

//   // ======= BOOKING - SUCCESS PAGE =======
//   booking_success_page_title: string;
//   booking_success_page_subtitle: string;
//   booking_success_loading: string;
//   booking_success_loading_data: string;
//   booking_success_error_title: string;
//   booking_success_error_not_found: string;
//   booking_success_error_load_failed: string;
//   booking_success_error_return: string;
//   booking_success_title: string;
//   booking_success_desc: string;
//   booking_success_details_title: string;
//   booking_success_details_name: string;
//   booking_success_details_email: string;
//   booking_success_details_phone: string;
//   booking_success_details_datetime: string;
//   booking_success_button_new: string;
//   booking_success_button_home: string;

//   // ======= GOOGLE CALENDAR =======
//   calendar_title_appointment_in: string;
//   calendar_description_title: string;
//   calendar_service: string;
//   calendar_master: string;
//   calendar_date: string;
//   calendar_time: string;
//   calendar_duration: string;
//   calendar_duration_minutes: string;
//   calendar_appointment_id: string;
//   calendar_address: string;
//   calendar_contacts: string;
//   calendar_phone: string;
//   calendar_reschedule_notice: string;
//   calendar_see_you: string;
//   calendar_location: string;

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

//   // SMS VERIFICATION PAGE
//   booking_sms_verify_title: string;
//   booking_sms_verify_subtitle: string;
//   booking_sms_verify_phone_label: string;
//   booking_sms_verify_phone_placeholder: string;
//   booking_sms_verify_phone_hint: string;
//   booking_sms_verify_phone_required: string;
//   booking_sms_verify_send_pin: string;
//   booking_sms_verify_sending: string;
//   booking_sms_verify_pin_validity: string;

//   booking_sms_verify_pin_title: string;
//   booking_sms_verify_pin_subtitle: string;
//   booking_sms_verify_pin_label: string;
//   booking_sms_verify_pin_placeholder: string;
//   booking_sms_verify_pin_hint: string;
//   booking_sms_verify_confirm: string;
//   booking_sms_verify_checking: string;
//   booking_sms_verify_resend: string;
//   booking_sms_verify_change_phone: string;
//   booking_sms_verify_pin_validity_note: string;

//   booking_sms_verify_error_title: string;
//   booking_sms_verify_error_missing_params: string;
//   booking_sms_verify_error_return: string;

//   booking_sms_verify_contact: string;

//   // SMS DETAILS PAGE
//   booking_sms_details_title: string;
//   booking_sms_details_subtitle: string;
//   booking_sms_details_name_label: string;
//   booking_sms_details_name_placeholder: string;
//   booking_sms_details_name_required: string;
//   booking_sms_details_email_label: string;
//   booking_sms_details_email_placeholder: string;
//   booking_sms_details_email_hint: string;
//   booking_sms_details_birth_label: string;
//   booking_sms_details_birth_hint: string;
//   booking_sms_details_submit: string;
//   booking_sms_details_submitting: string;
//   booking_sms_details_privacy: string;

//   booking_sms_details_error_title: string;
//   booking_sms_details_error_missing_id: string;
//   booking_sms_details_error_return: string;

//   booking_sms_details_contact: string;

//   // SMS CARD (CLIENT CHOICE PAGE)
//   booking_client_sms_title: string;
//   booking_client_sms_description: string;
//   booking_client_sms_benefit_1: string;
//   booking_client_sms_benefit_2: string;
//   booking_client_sms_benefit_3: string;
//   booking_client_sms_benefit_4: string;
//   booking_client_sms_button: string;
//   booking_client_sms_security: string;

//   // STRIPE PAYMENT
// booking_payment_stripe_title: string;
// booking_payment_stripe_desc: string;
// booking_payment_stripe_benefit_1: string;
// booking_payment_stripe_benefit_2: string;
// booking_payment_stripe_benefit_3: string;
// booking_payment_stripe_amount: string;
// booking_payment_stripe_secure: string;
// booking_payment_stripe_processing: string;
// booking_payment_stripe_pay: string;
// booking_payment_stripe_note: string;

// // PAYPAL PAYMENT
// booking_payment_paypal_title: string;
// booking_payment_paypal_desc: string;
// booking_payment_paypal_benefit_1: string;
// booking_payment_paypal_benefit_2: string;
// booking_payment_paypal_benefit_3: string;
// booking_payment_paypal_amount: string;
// booking_payment_paypal_secure: string;
// booking_payment_paypal_note: string;
// booking_payment_paypal_footer: string;

// // ======= BOOKING - TELEGRAM CARD =======
//   booking_client_telegram_title: string;
//   booking_client_telegram_description: string;
//   booking_client_telegram_benefit_1: string;
//   booking_client_telegram_benefit_2: string;
//   booking_client_telegram_benefit_3: string;
//   booking_client_telegram_benefit_4: string;
//   booking_client_telegram_button: string;
//   booking_client_telegram_security: string;

//   // ======= BOOKING - TELEGRAM VERIFICATION PAGE =======
//   booking_telegram_verify_title: string;
//   booking_telegram_verify_subtitle: string;

//   booking_telegram_verify_step1_title: string;
//   booking_telegram_verify_step1_subtitle: string;
//   booking_telegram_verify_phone_label: string;
//   booking_telegram_verify_phone_placeholder: string;
//   booking_telegram_verify_phone_hint: string;
//   booking_telegram_verify_phone_required: string;
//   booking_telegram_verify_send_code: string;
//   booking_telegram_verify_sending: string;

//   booking_telegram_verify_step2_title: string;
//   booking_telegram_verify_step2_subtitle: string;
//   booking_telegram_verify_code_label: string;
//   booking_telegram_verify_code_placeholder: string;
//   booking_telegram_verify_code_hint: string;
//   booking_telegram_verify_code_required: string;
//   booking_telegram_verify_check_code: string;
//   booking_telegram_verify_checking: string;
//   booking_telegram_verify_resend: string;

//   booking_telegram_verify_step3_title: string;
//   booking_telegram_verify_step3_subtitle: string;
//   booking_telegram_verify_email_label: string;
//   booking_telegram_verify_email_placeholder: string;
//   booking_telegram_verify_email_hint: string;
//   booking_telegram_verify_birth_label: string;
//   booking_telegram_verify_birth_hint: string;
//   booking_telegram_verify_complete: string;
//   booking_telegram_verify_completing: string;

//   booking_telegram_verify_privacy: string;
//   booking_telegram_verify_error_title: string;
//   booking_telegram_verify_error_missing: string;
//   booking_telegram_verify_error_return: string;

//   // ======= BOOKING - TELEGRAM REGISTRATION MODAL =======
//   booking_telegram_modal_title: string;
//   booking_telegram_modal_subtitle: string;
//   booking_telegram_modal_phone_label: string;
//   booking_telegram_modal_how_title: string;
//   booking_telegram_modal_step_open_bot: string;
//   booking_telegram_modal_step_register: string;
//   booking_telegram_modal_step_done: string;
//   booking_telegram_modal_button_open: string;
//   booking_telegram_modal_button_done: string;
//   booking_telegram_modal_note: string;

//   // ======= BOOKING - TELEGRAM VERIFY MESSAGES =======
//   booking_telegram_verify_error_send: string;
//   booking_telegram_verify_error_expired: string;
//   booking_telegram_verify_error_invalid_code: string;
//   booking_telegram_verify_error_session: string;
//   booking_telegram_verify_error_create: string;
//   booking_telegram_verify_error_complete: string;
//   booking_telegram_verify_error_check: string;
//   booking_telegram_verify_success_sent: string;
//   booking_telegram_verify_success_verified: string;
//   booking_telegram_verify_success_creating: string;
//   booking_telegram_verify_back: string;

//   // ======= BOOKING - CONFIRMATION PAGE =======
//   booking_confirmation_error_title: string;
//   booking_confirmation_error_missing_id: string;
//   booking_confirmation_error_cta: string;
//   booking_confirmation_title: string;
//   booking_confirmation_subtitle: string;
//   booking_confirmation_details_number_label: string;
//   booking_confirmation_details_status_label: string;
//   booking_confirmation_status_pending: string;
//   booking_confirmation_action_home: string;
//   booking_confirmation_action_new: string;
//   booking_confirmation_notice_title: string;
//   booking_confirmation_notice_body: string;
//   booking_confirmation_loading: string;

//   // ======= BOOKING - CLIENT PAGE =======
//   booking_client_page_title: string;
//   booking_client_page_description: string;
//   booking_client_params_error_title: string;
//   booking_client_params_error_text: string;
//   booking_client_params_error_return: string;

//   // ======= BOOKING - CLIENT STEP =======
//   booking_client_step_start_label: string;
//   booking_client_step_end_label: string;
//   booking_client_step_name_label: string;
//   booking_client_step_name_placeholder: string;
//   booking_client_step_phone_label: string;
//   booking_client_step_phone_placeholder: string;
//   booking_client_step_email_label: string;
//   booking_client_step_email_placeholder: string;
//   booking_client_step_notes_label: string;
//   booking_client_step_notes_placeholder: string;
//   booking_client_step_back: string;
//   booking_client_step_continue: string;

//   // ======= EMAIL NOTIFICATIONS =======
//   email_service_not_configured: string;
//   email_send_unknown_error: string;
//   email_status_subject_pending: string;
//   email_status_subject_confirmed: string;
//   email_status_subject_done: string;
//   email_status_subject_canceled: string;
//   email_status_text_pending: string;
//   email_status_text_confirmed: string;
//   email_status_text_done: string;
//   email_status_text_canceled: string;
//   email_status_message_pending: string;
//   email_status_message_confirmed_intro: string;
//   email_status_message_confirmed_wait: string;
//   email_status_message_confirmed_notice_title: string;
//   email_status_message_confirmed_notice_text: string;
//   email_status_message_done_intro: string;
//   email_status_message_done_outro: string;
//   email_status_message_done_tip_title: string;
//   email_status_message_done_tip_text: string;
//   email_status_message_canceled_intro: string;
//   email_status_message_canceled_contact_intro: string;
//   email_status_message_canceled_contact: string;
//   email_status_html_title: string;
//   email_status_header_subtitle: string;
//   email_status_greeting: string;
//   email_status_details_title: string;
//   email_status_details_status_label: string;
//   email_status_details_service_label: string;
//   email_status_details_master_label: string;
//   email_status_details_datetime_label: string;
//   email_status_cta_button: string;
//   email_status_footer_tagline: string;
//   email_status_footer_address: string;
//   email_status_footer_contacts: string;
//   email_status_footer_note: string;
//   email_test_subject: string;
//   email_test_title: string;
//   email_test_body: string;
//   email_test_footer: string;

//   // ======= TELEGRAM BOT =======
//   telegram_code_title: string;
//   telegram_code_intro: string;
//   telegram_code_expires: string;
//   telegram_payment_status_paid: string;
//   telegram_payment_status_pending: string;
//   telegram_payment_status_failed: string;
//   telegram_payment_status_refunded: string;
//   telegram_payment_status_unknown: string;
//   telegram_admin_new_title: string;
//   telegram_admin_label_date: string;
//   telegram_admin_label_time: string;
//   telegram_admin_label_client: string;
//   telegram_admin_label_phone: string;
//   telegram_admin_label_email: string;
//   telegram_admin_label_service: string;
//   telegram_admin_label_master: string;
//   telegram_admin_label_payment: string;
//   telegram_admin_label_id: string;
//   telegram_admin_open_button: string;
//   telegram_client_status_title_pending: string;
//   telegram_client_status_title_confirmed: string;
//   telegram_client_status_title_done: string;
//   telegram_client_status_title_canceled: string;
//   telegram_client_status_text_pending: string;
//   telegram_client_status_text_confirmed: string;
//   telegram_client_status_text_done: string;
//   telegram_client_status_text_canceled: string;
//   telegram_client_status_message_pending: string;
//   telegram_client_status_message_confirmed: string;
//   telegram_client_status_message_done: string;
//   telegram_client_status_message_canceled: string;
//   telegram_client_greeting: string;
//   telegram_client_label_date: string;
//   telegram_client_label_time: string;
//   telegram_client_label_service: string;
//   telegram_client_label_master: string;
//   telegram_client_label_status: string;
//   telegram_start_title: string;
//   telegram_start_prompt: string;
//   telegram_start_after: string;
//   telegram_button_send_phone: string;
//   telegram_contact_saved_title: string;
//   telegram_contact_saved_phone: string;
//   telegram_contact_saved_ready: string;
//   telegram_request_contact_prompt: string;

//   // ======= API MESSAGES =======
//   api_telegram_send_to_registered_missing_params: string;
//   api_telegram_send_to_registered_user_not_found: string;
//   api_telegram_send_to_registered_code_not_found: string;
//   api_telegram_send_to_registered_success: string;
//   api_telegram_send_to_registered_error: string;
//   api_email_check_missing: string;
//   api_email_check_invalid: string;
//   api_email_check_too_long: string;
//   api_email_check_error: string;
//   api_google_oauth_not_configured: string;
//   api_google_oauth_missing_params: string;
//   api_google_oauth_draft_not_found: string;
//   api_google_oauth_email_mismatch: string;
//   api_google_oauth_generated: string;
//   api_google_oauth_error: string;
//   api_google_status_missing_params: string;
//   api_google_status_error: string;
//   api_google_callback_access_denied: string;
//   api_google_callback_invalid_params: string;
//   api_google_callback_invalid_state: string;
//   api_google_callback_expired: string;
//   api_google_callback_already_verified: string;
//   api_google_callback_missing_email: string;
//   api_google_callback_email_mismatch: string;
//   api_google_callback_draft_not_found: string;
//   api_google_callback_slot_taken: string;
//   api_google_callback_error: string;
//   api_email_confirm_missing_fields: string;
//   api_email_confirm_invalid_code: string;
//   api_email_confirm_draft_not_found: string;
//   api_email_confirm_success: string;
//   api_email_confirm_slot_taken: string;
//   api_email_confirm_error: string;
//   api_payment_missing_params: string;
//   api_payment_invalid_method: string;
//   api_payment_not_found: string;
//   api_payment_unknown_service: string;
//   api_payment_note_prefix: string;
//   api_payment_card_redirect: string;
//   api_payment_paypal_redirect: string;
//   api_payment_cash: string;
//   api_payment_unknown_method: string;
//   api_payment_error: string;
//   api_admin_clients_unauthorized: string;
//   api_admin_clients_missing_fields: string;
//   api_admin_clients_duplicate_active: string;
//   api_admin_clients_duplicate_deleted: string;
//   api_admin_clients_duplicate_suggestion: string;
//   api_admin_clients_created: string;
//   api_admin_clients_error: string;

//     // ======= CONTACTS (NEW) =======
//   contacts_seo_description: string;

//   contacts_subtitle: string;
//   contacts_title: string;
//   contacts_intro: string;

//   contacts_quick_title: string;

//   contacts_quick_call: string;
//   contacts_quick_book: string;
//   contacts_quick_route: string;

//   contacts_details_title: string;

//   contacts_open_maps: string;

//   contacts_map_title: string;
//   contacts_map_caption: string;
//   contacts_show_map: string;
//   contacts_map_privacy: string;

//   contacts_address_label: string;
//   contacts_phone_label: string;
//   contacts_email_label: string;
//   contacts_hours_label: string;
//   contacts_hours_value: string;

//   contacts_form_title: string;
//   contacts_form_name: string;
//   contacts_form_phone: string;
//   contacts_form_message: string;
//   contacts_form_send: string;
//   contacts_form_note: string;



// };

// export type MessageKey = keyof BaseMessages;

// /* ==================== RUSSIAN (RU) ==================== */

// const ruMessages: BaseMessages = {
//   booking_verify_email_sent_message: "Код отправлен на email",
//   booking_verify_email_api_missing_params: "Email и draftId обязательны",
//   booking_verify_email_api_draft_not_found: "Черновик записи не найден",
//   booking_verify_email_api_email_mismatch: "E-mail не совпадает с данными черновика",
//   booking_verify_email_api_send_failed: "Ошибка отправки кода на email",
//   booking_verify_email_api_error: "Ошибка отправки кода",
//   booking_email_otp_subject: "Код подтверждения записи - Salon Elen",
//   booking_email_otp_title: "Код подтверждения",
//   booking_email_otp_header_subtitle: "Подтверждение записи",
//   booking_email_otp_greeting: "Здравствуйте!",
//   booking_email_otp_code_intro: "Ваш код подтверждения для завершения записи:",
//   booking_email_otp_expires_label: "Важно:",
//   booking_email_otp_expires_text: "Код действителен в течение {minutes} минут.",
//   booking_email_otp_ignore:
//     "Если вы не оформляли запись в Salon Elen, просто проигнорируйте это письмо.",
//   booking_email_otp_footer_tagline: "Salon Elen - Ваша красота, наша забота 💖",
//   booking_email_otp_footer_contact: "📧 booking@news.permanent-halle.de",
//   booking_email_otp_footer_note: "Это автоматическое письмо. Пожалуйста, не отвечайте на него.",
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
//   footer_address_label: "Lessingstrasse 37, Halle (Saale)",

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
//   site_name: "Salon Elen",
//   booking_header_subtitle: "Премиальный букинг",
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
//   booking_master_hero_subtitle:
//     "Наши эксперты создадут для вас идеальный образ",
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
//   booking_calendar_slot_taken: "Этот слот только что забронировал другой клиент. Пожалуйста, выберите другое время.",
//   booking_calendar_reserve_error: "Ошибка резервирования. Попробуйте еще раз.",

//   // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "Как вы хотите продолжить?",
//   booking_client_choice_subtitle: "Выберите удобный способ регистрации",
//   booking_client_choice_recommended: "Рекомендуем",

//   booking_client_google_title: "Быстрая регистрация",
//   booking_client_google_description:
//     "Войдите через Google и сразу перейдите к оплате",
//   booking_client_google_benefit_1: "Один клик до оплаты",
//   booking_client_google_benefit_2: "Автозаполнение данных",
//   booking_client_google_benefit_3: "Безопасно и надёжно",
//   booking_client_google_benefit_4: "Экономия времени",
//   booking_client_google_button: "Начать за 1 клик",
//   booking_client_google_security: "Защищено Google OAuth 2.0",
//   booking_client_google_connecting: "Подключение...",

//   booking_client_form_title: "Заполнить форму",
//   booking_client_form_description:
//     "Традиционный способ с полным контролем над данными",
//   booking_client_form_benefit_1: "Полный контроль данных",
//   booking_client_form_benefit_2: "Без Google аккаунта",
//   booking_client_form_benefit_3: "Привычный процесс",
//   booking_client_form_benefit_4: "Верификация через Telegram",
//   booking_client_form_button: "Заполнить форму",
//   booking_client_form_security: "Подтверждение через Telegram Bot",

//   booking_client_choice_footer: "Оба способа безопасны и надёжны.",
//   booking_client_choice_footer_highlight: "Выберите тот, который вам удобнее.",

//   booking_client_popup_blocked:
//     "Не удалось открыть окно. Разрешите всплывающие окна в браузере.",
//   booking_client_google_error_init: "Ошибка инициализации Google OAuth",
//   booking_client_auth_error: "Ошибка авторизации",
//   booking_client_auth_waiting: "Ожидаем подтверждение через Google...",

//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Шаг 4 — Ваши контактные данные",
//   booking_client_form_hero_title: "Онлайн-запись",
//   booking_client_form_hero_subtitle:
//     "Укажите ваши данные, чтобы мы подтвердили бронь",

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
//   booking_client_form_placeholder_comment:
//     "Дополнительная информация или пожелания",
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
//   booking_client_form_error_birth_underage:
//     "Для онлайн-записи требуется возраст 16+",
//   booking_client_form_error_referral: "Выберите вариант",
//   booking_client_form_error_referral_other: "Уточните источник",

//   booking_client_form_email_checking: "Проверка e-mail…",
//   booking_client_form_email_verified: "E-mail подтверждён",

//   booking_client_form_age_requirement:
//     "Для онлайн-записи требуется возраст 16+",
//   booking_client_form_email_error_note:
//     "Если вы допустите ошибку в адресе, вы всё равно сможете прийти на приём, но не получите напоминания и подтверждения.",

//   booking_client_form_button_back: "Назад",
//   booking_client_form_button_submit: "Забронировать",
//   booking_client_form_button_submitting: "Проверка данных…",

//   booking_client_form_info_title: "Почему мы просим e-mail?",
//   booking_client_form_info_point_1: "На ваш e-mail мы отправим",
//   booking_client_form_info_point_1_highlight:
//     "подтверждение брони и все детали записи",
//   booking_client_form_info_point_2: "Вы получите",
//   booking_client_form_info_point_2_highlight: "напоминание перед визитом",
//   booking_client_form_info_point_3:
//     "Мы бережно относимся к персональным данным и используем ваш e-mail только для обслуживания вашей записи",

//   booking_client_form_invalid_params:
//     "Некорректные параметры. Пожалуйста, начните запись заново.",
//   booking_client_form_invalid_return: "Вернуться к выбору услуг",

//   // ======= BOOKING - PHONE & BIRTHDAY PAGE (NEW) =======
//   phone_title: "Контактная информация",
//   phone_subtitle: "Укажите ваши контактные данные для связи",
//   phone_label: "Телефон",
//   phone_hint: "Мы свяжемся с вами для подтверждения записи",
//   phone_required: "Номер телефона обязателен",
//   phone_submit: "Продолжить",
//   phone_submitting: "Отправка...",
//   phone_privacy: "Ваши данные защищены и не передаются третьим лицам",
//   birthday_label: "Дата рождения",
//   birthday_hint:
//     "Нам нужна Ваша дата рождения, чтобы мы могли в будущем предоставить Вам индивидуальную скидку к Вашему празднику!",

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
//   booking_verify_email_wrong_hint:
//     "Если email неверный, вернитесь на предыдущий шаг",
//   booking_verify_email_send_code: "Отправить код",
//   booking_verify_email_sending: "Отправка…",
//   booking_verify_email_arrives_hint: "Код приходит в течение нескольких секунд",
//   booking_verify_email_enter_code: "Введите 6-значный код",
//   booking_verify_email_code_valid: "Код действителен ограниченное время",
//   booking_verify_email_confirm_code: "Подтвердить код",
//   booking_verify_email_checking: "Проверка…",
//   booking_verify_email_resend: "Отправить код повторно",
//   booking_verify_info_title: "Безопасное подтверждение",
//   booking_verify_info_desc:
//     "Мы используем одноразовый код для защиты ваших данных и расписания салона",
//   booking_verify_info_arrives: "Код приходит за 1–2 минуты",
//   booking_verify_info_check_spam: "Проверьте папку «Спам»",
//   booking_verify_info_check_email: "Убедитесь в правильности email",
//   booking_verify_info_resend_if_needed:
//     "Запросите код повторно при необходимости",
//   booking_verify_info_progress_title: "Ваш прогресс",
//   booking_verify_info_progress_1: "Выбрали услугу и мастера",
//   booking_verify_info_progress_2: "Указали дату и время",
//   booking_verify_info_progress_3: "Заполнили контактные данные",
//   booking_verify_info_progress_4: "Сейчас — подтверждение email",
//   booking_verify_info_progress_5: "Далее — оплата",
//   booking_verify_info_support:
//     "При возникновении сложностей свяжитесь с нами — мы поможем завершить запись",
//   booking_verify_invalid_params:
//     "Некорректные параметры. Пожалуйста, начните запись заново.",
//   booking_verify_invalid_return: "Вернуться к выбору услуг",
//   booking_verify_google_title: "Подтвердите через Google",
//   booking_verify_google_desc:
//     "Войдите через свой Google аккаунт для быстрого и безопасного подтверждения бронирования.",
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
//   booking_verify_google_security_desc:
//     "Мы не получаем доступ к вашему паролю Google. Используется официальный OAuth протокол.",
//   booking_verify_google_success:
//     "✅ Подтверждено через Google! Переход к оплате...",
//   booking_verify_google_preparing_window: "🔐 Google откроется в новом окне...",
//   booking_verify_google_allow_popups:
//     "⚠️ Разрешите всплывающие окна и нажмите кнопку ниже.",
//   booking_verify_telegram_title: "Подтвердите через Telegram",
//   booking_verify_telegram_desc_registered:
//     "Код отправлен в Telegram бот. Проверьте сообщения и нажмите кнопку подтверждения.",
//   booking_verify_telegram_desc_unregistered:
//     "Telegram откроется автоматически. Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте.",
//   booking_verify_telegram_sending_code: "Отправка кода...",
//   booking_verify_telegram_open_button: "Открыть Telegram",
//   booking_verify_telegram_reopen_button: "Открыть Telegram повторно",
//   booking_verify_telegram_waiting_bot:
//     "Ожидание подтверждения в Telegram боте...",
//   booking_verify_telegram_waiting: "Ожидание подтверждения...",
//   booking_verify_telegram_divider: "или",
//   booking_verify_telegram_enter_code: "Введите 6-значный код из Telegram",
//   booking_verify_telegram_code_placeholder: "000000",
//   booking_verify_telegram_code_valid: "Код действителен 10 минут.",
//   booking_verify_telegram_confirm_button: "Подтвердить код",
//   booking_verify_telegram_checking: "Проверка...",
//   booking_verify_telegram_code_sent:
//     "✈️ Код отправлен в Telegram! Проверьте бота и нажмите кнопку подтверждения.",
//   booking_verify_telegram_opening:
//     "✈️ Telegram открывается... Ожидание подтверждения.",
//   booking_verify_telegram_click_button:
//     "⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.",
//   booking_verify_telegram_success:
//     "✅ Подтверждено через Telegram! Переход к оплате...",
//   booking_verify_error_enter_code: "Введите 6-значный код",
//   booking_verify_success_redirect: "Верификация успешна! Переход к оплате...",

//   booking_payment_badge: "Шаг 6 — Оплата и финальное подтверждение",
//   booking_payment_hero_title: "Завершение записи",
//   booking_payment_hero_subtitle: "Выберите способ оплаты и подтвердите бронь",
//   booking_payment_appointment_id: "Номер записи:",
//   booking_payment_method_title: "Способ оплаты",
//   booking_payment_onsite_title: "Оплата в салоне",
//   booking_payment_onsite_desc: "На месте",
//   booking_payment_onsite_benefit_1: "Наличные или карта в салоне",
//   booking_payment_onsite_benefit_2: "Без предоплаты",
//   booking_payment_onsite_benefit_3: "Оплата после услуги",
//   booking_payment_online_title: "Онлайн-оплата",
//   booking_payment_online_desc: "Скоро",
//   // booking_payment_online_benefit_1: "Карта, Apple Pay, Google Pay",
//   // booking_payment_online_benefit_2: "В разработке",
//   // booking_payment_online_benefit_3: "Запись всё равно будет подтверждена",
//   booking_payment_info_title: "Как это работает?",
//   booking_payment_info_desc:
//     "Система уже создала запись в расписании салона. Оплата фиксируется на стороне салона. Онлайн-оплата будет добавлена позже.",
//   // Инфо блок - АКТУАЛЬНЫЙ текст
// booking_payment_info_how_works_title: "Как это работает?",
// booking_payment_info_how_works_desc: "Система уже создала запись в расписании салона. Вы можете оплатить онлайн картой (Stripe) или через PayPal, либо оплатить наличными/картой в салоне после услуги.",
//   booking_payment_confirm_button: "Подтвердить запись",
//   booking_payment_confirm_terms:
//     "Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона",
//   booking_payment_summary_title: "Резюме записи",
//   booking_payment_summary_visit: "Ваш визит в SalonElen",
//   booking_payment_summary_service: "Услуга из записи (Appointment)",
//   booking_payment_summary_master: "Мастер из записи",
//   booking_payment_summary_datetime: "Дата и время по ID:",
//   booking_payment_summary_address: "Адрес салона",
//   booking_payment_summary_cancellation_title: "Политика отмены",
//   booking_payment_summary_cancellation_desc:
//     "Если вы не сможете прийти, пожалуйста, отмените запись заранее — это позволит освободить время для других гостей салона.",
//   booking_payment_summary_future_note:
//     "После запуска онлайн-оплаты здесь появится блок выбора платёжного метода и статус платежа",
//   booking_payment_success_title: "Запись подтверждена!",
//   booking_payment_success_desc:
//     "Ваша запись успешно подтверждена. Оплата будет произведена в салоне.",
//   booking_payment_success_home: "На главную страницу",
//   booking_payment_success_calendar: "Добавить в Google Calendar",
//   booking_payment_success_apple_calendar: "Добавить в Apple Calendar",
//   booking_payment_success_new: "Сделать новую запись",
//   booking_payment_error_title: "Ошибка при переходе к оплате",
//   booking_payment_error_desc:
//     "Мы не смогли найти идентификатор записи. Возможно, ссылка устарела или шаг подтверждения email был пропущен.",
//   booking_payment_error_return: "Вернуться к записи",
//   booking_payment_error_missing:
//     "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//   booking_success_page_title: "Онлайн-запись",
//   booking_success_page_subtitle: "Успех",
//   booking_success_loading: "Загрузка...",
//   booking_success_loading_data: "Загружаем данные…",
//   booking_success_error_title: "Ошибка",
//   booking_success_error_not_found: "ID записи не найден",
//   booking_success_error_load_failed: "Не удалось загрузить данные записи",
//   booking_success_error_return: "Вернуться к бронированию",
//   booking_success_title: "Запись подтверждена!",
//   booking_success_desc:
//     "Ваша запись успешно создана. Мы отправили подтверждение на вашу почту.",
//   booking_success_details_title: "Детали записи:",
//   booking_success_details_name: "Имя",
//   booking_success_details_email: "Email",
//   booking_success_details_phone: "Телефон",
//   booking_success_details_datetime: "Дата и время",
//   booking_success_button_new: "Создать новую запись",
//   booking_success_button_home: "На главную",

//   calendar_title_appointment_in: "в SalonElen",
//   calendar_description_title: "Запись в салон красоты SalonElen",
//   calendar_service: "Услуга:",
//   calendar_master: "Мастер:",
//   calendar_date: "Дата:",
//   calendar_time: "Время:",
//   calendar_duration: "Продолжительность:",
//   calendar_duration_minutes: "минут",
//   calendar_appointment_id: "Номер записи:",
//   calendar_address: "Адрес:",
//   calendar_contacts: "Контакты:",
//   calendar_phone: "Telefon:",
//   calendar_reschedule_notice:
//     "Если вам необходимо перенести или отменить запись, пожалуйста, свяжитесь с нами заранее.",
//   calendar_see_you: "До встречи! ✨",
//   calendar_location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",

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

//   // SMS VERIFICATION PAGE
//   booking_sms_verify_title: "Подтверждение телефона",
//   booking_sms_verify_subtitle: "Мы отправим вам 4-значный PIN код по SMS",
//   booking_sms_verify_phone_label: "Номер телефона",
//   booking_sms_verify_phone_placeholder: "+49 177 899 5106",
//   booking_sms_verify_phone_hint:
//     "Формат: +[код страны][номер] (например: +4917789951064)",
//   booking_sms_verify_phone_required: "Введите номер телефона",
//   booking_sms_verify_send_pin: "Отправить PIN код",
//   booking_sms_verify_sending: "Отправка...",
//   booking_sms_verify_pin_validity: "PIN код будет действителен 10 минут",

//   booking_sms_verify_pin_title: "Введите PIN код",
//   booking_sms_verify_pin_subtitle: "PIN код отправлен на",
//   booking_sms_verify_pin_label: "PIN код",
//   booking_sms_verify_pin_placeholder: "0000",
//   booking_sms_verify_pin_hint: "Введите 4-значный PIN код из SMS",
//   booking_sms_verify_confirm: "Подтвердить",
//   booking_sms_verify_checking: "Проверка...",
//   booking_sms_verify_resend: "Отправить PIN повторно",
//   booking_sms_verify_change_phone: "Изменить номер телефона",
//   booking_sms_verify_pin_validity_note:
//     "PIN код действителен 10 минут • Максимум 3 попытки",

//   booking_sms_verify_error_title: "⚠️ Ошибка",
//   booking_sms_verify_error_missing_params:
//     "Недостаточно параметров. Пожалуйста, начните запись заново.",
//   booking_sms_verify_error_return: "Вернуться к записи",

//   booking_sms_verify_contact:
//     "Возникли вопросы? Свяжитесь с нами: +49 177 899 5106",

//   // SMS DETAILS PAGE
//   booking_sms_details_title: "Ваши данные",
//   booking_sms_details_subtitle:
//     "Пожалуйста, укажите ваше имя и дополнительную информацию",
//   booking_sms_details_name_label: "Ваше имя",
//   booking_sms_details_name_placeholder: "Иван Иванов",
//   booking_sms_details_name_required: "Имя обязательно для заполнения",
//   booking_sms_details_email_label: "Email",
//   booking_sms_details_email_placeholder: "ivan@example.com",
//   booking_sms_details_email_hint: "Для отправки подтверждения и напоминаний",
//   booking_sms_details_birth_label: "Дата рождения",
//   booking_sms_details_birth_hint:
//     "Нам нужна Ваша дата рождения, чтобы мы могли в будущем предоставить Вам индивидуальную скидку к Вашему празднику!",
//   booking_sms_details_submit: "Продолжить к оплате",
//   booking_sms_details_submitting: "Сохранение...",
//   booking_sms_details_privacy:
//     "Ваши данные защищены и не передаются третьим лицам",

//   booking_sms_details_error_title: "⚠️ Ошибка",
//   booking_sms_details_error_missing_id:
//     "Отсутствует ID регистрации. Пожалуйста, начните запись заново.",
//   booking_sms_details_error_return: "Вернуться к записи",

//   booking_sms_details_contact:
//     "Возникли вопросы? Свяжитесь с нами: +49 177 899 5106",

//   // SMS CARD
//   booking_client_sms_title: "По телефону (SMS)",
//   booking_client_sms_description: "Получите PIN код через SMS",
//   booking_client_sms_benefit_1: "PIN код по SMS",
//   booking_client_sms_benefit_2: "Без email регистрации",
//   booking_client_sms_benefit_3: "Быстро и безопасно",
//   booking_client_sms_benefit_4: "4-значный код",
//   booking_client_sms_button: "Войти по SMS",
//   booking_client_sms_security: "Infobip SMS",

//   // STRIPE PAYMENT
// booking_payment_stripe_title: "Оплата картой",
// booking_payment_stripe_desc: "Безопасная оплата через Stripe",
// booking_payment_stripe_benefit_1: "Все карты: Visa, MasterCard, AmEx",
// booking_payment_stripe_benefit_2: "Мгновенное подтверждение",
// booking_payment_stripe_benefit_3: "3D Secure защита",
// booking_payment_stripe_amount: "Сумма к оплате",
// booking_payment_stripe_secure: "Безопасно",
// booking_payment_stripe_processing: "Обработка платежа...",
// booking_payment_stripe_pay: "Оплатить",
// booking_payment_stripe_note: "Ваши платёжные данные защищены 256-битным шифрованием",

// // PAYPAL PAYMENT
// booking_payment_paypal_title: "PayPal",
// booking_payment_paypal_desc: "Оплата через PayPal аккаунт",
// booking_payment_paypal_benefit_1: "Быстрая оплата через PayPal",
// booking_payment_paypal_benefit_2: "Защита покупателя",
// booking_payment_paypal_benefit_3: "Без комиссий",
// booking_payment_paypal_amount: "Сумма к оплате",
// booking_payment_paypal_secure: "Безопасно",
// booking_payment_paypal_note: "После нажатия кнопки вы будете перенаправлены на безопасную страницу PayPal",
// booking_payment_paypal_footer: "Платежи обрабатываются через PayPal. Ваши данные защищены.",

// // ======= BOOKING - TELEGRAM CARD =======
//   booking_client_telegram_title: "Telegram",
//   booking_client_telegram_description: "Быстрая регистрация через Telegram бота",
//   booking_client_telegram_benefit_1: "Код в Telegram",
//   booking_client_telegram_benefit_2: "Без email регистрации",
//   booking_client_telegram_benefit_3: "Быстро и безопасно",
//   booking_client_telegram_benefit_4: "6-значный код",
//   booking_client_telegram_button: "Войти через Telegram",
//   booking_client_telegram_security: "Telegram Bot верификация",

//   // ======= BOOKING - TELEGRAM VERIFICATION PAGE =======
//   booking_telegram_verify_title: "Регистрация через Telegram",
//   booking_telegram_verify_subtitle: "Пройдите 3 простых шага",

//   booking_telegram_verify_step1_title: "Шаг 1: Номер телефона",
//   booking_telegram_verify_step1_subtitle: "Укажите ваш номер телефона",
//   booking_telegram_verify_phone_label: "Номер телефона",
//   booking_telegram_verify_phone_placeholder: "+49 177 899 5106",
//   booking_telegram_verify_phone_hint: "Формат: +[код страны][номер]",
//   booking_telegram_verify_phone_required: "Введите номер телефона",
//   booking_telegram_verify_send_code: "Отправить код",
//   booking_telegram_verify_sending: "Отправка...",

//   booking_telegram_verify_step2_title: "Шаг 2: Код из Telegram",
//   booking_telegram_verify_step2_subtitle: "Введите код, который мы отправили в Telegram",
//   booking_telegram_verify_code_label: "Код подтверждения",
//   booking_telegram_verify_code_placeholder: "000000",
//   booking_telegram_verify_code_hint: "6-значный код из Telegram бота",
//   booking_telegram_verify_code_required: "Введите 6-значный код",
//   booking_telegram_verify_check_code: "Подтвердить код",
//   booking_telegram_verify_checking: "Проверка...",
//   booking_telegram_verify_resend: "Отправить код повторно",

//   booking_telegram_verify_step3_title: "Шаг 3: Дополнительная информация",
//   booking_telegram_verify_step3_subtitle: "Заполните ваши данные (необязательно)",
//   booking_telegram_verify_email_label: "Email",
//   booking_telegram_verify_email_placeholder: "your@email.com",
//   booking_telegram_verify_email_hint: "Для подтверждения и напоминаний",
//   booking_telegram_verify_birth_label: "Дата рождения",
//   booking_telegram_verify_birth_hint: "Для персональных скидок к вашему празднику",
//   booking_telegram_verify_complete: "Завершить регистрацию",
//   booking_telegram_verify_completing: "Сохранение...",

//   booking_telegram_verify_privacy: "Ваши данные защищены и не передаются третьим лицам",
//   booking_telegram_verify_error_title: "⚠️ Ошибка",
//   booking_telegram_verify_error_missing: "Недостаточно параметров. Пожалуйста, начните запись заново.",
//   booking_telegram_verify_error_return: "Вернуться к записи",

//   booking_telegram_modal_title: "Регистрация в Telegram боте",
//   booking_telegram_modal_subtitle:
//     "Для получения кодов подтверждения необходимо зарегистрироваться в нашем Telegram боте",
//   booking_telegram_modal_phone_label: "Ваш номер:",
//   booking_telegram_modal_how_title: "Как зарегистрироваться:",
//   booking_telegram_modal_step_open_bot:
//     "Нажмите кнопку ниже, чтобы открыть Telegram бота",
//   booking_telegram_modal_step_register:
//     "Бот автоматически зарегистрирует ваш номер",
//   booking_telegram_modal_step_done: "Вернитесь сюда и нажмите",
//   booking_telegram_modal_button_open: "Открыть Telegram бота",
//   booking_telegram_modal_button_done: "Я зарегистрировался",
//   booking_telegram_modal_note:
//     "Код подтверждения придёт в Telegram бот в течение нескольких секунд",

//   booking_telegram_verify_error_send: "Ошибка отправки кода",
//   booking_telegram_verify_error_expired: "Код истёк. Запросите новый код.",
//   booking_telegram_verify_error_invalid_code:
//     "Неверный код. Проверьте код в Telegram и попробуйте снова.",
//   booking_telegram_verify_error_session: "Сессия не найдена. Начните заново.",
//   booking_telegram_verify_error_create: "Ошибка создания записи",
//   booking_telegram_verify_error_complete: "Ошибка завершения регистрации",
//   booking_telegram_verify_error_check: "Ошибка проверки кода",
//   booking_telegram_verify_success_sent: "Код отправлен в Telegram!",
//   booking_telegram_verify_success_verified: "Код подтверждён!",
//   booking_telegram_verify_success_creating: "Создание записи...",
//   booking_telegram_verify_back: "Назад",

//   booking_confirmation_error_title: "Ошибка",
//   booking_confirmation_error_missing_id: "ID записи не указан",
//   booking_confirmation_error_cta: "Создать новую запись",
//   booking_confirmation_title: "Запись создана!",
//   booking_confirmation_subtitle:
//     "Ваша запись успешно создана. Мы свяжемся с вами для подтверждения.",
//   booking_confirmation_details_number_label: "Номер записи",
//   booking_confirmation_details_status_label: "Статус",
//   booking_confirmation_status_pending: "Ожидает подтверждения",
//   booking_confirmation_action_home: "Вернуться на главную",
//   booking_confirmation_action_new: "Создать новую запись",
//   booking_confirmation_notice_title: "Обратите внимание:",
//   booking_confirmation_notice_body:
//     "Мы свяжемся с вами в ближайшее время для подтверждения записи. Если у вас возникнут вопросы, пожалуйста, позвоните нам или напишите на электронную почту.",
//   booking_confirmation_loading: "Загрузка...",

//   booking_client_page_title: "Выбор регистрации | Salon Elen",
//   booking_client_page_description:
//     "Выберите способ регистрации для завершения бронирования",
//   booking_client_params_error_title: "Ошибка параметров",
//   booking_client_params_error_text: "Отсутствуют необходимые параметры бронирования",
//   booking_client_params_error_return: "Вернуться к началу",

//   booking_client_step_start_label: "Начало:",
//   booking_client_step_end_label: "Окончание:",
//   booking_client_step_name_label: "Ваше имя",
//   booking_client_step_name_placeholder: "Например, Анна",
//   booking_client_step_phone_label: "Телефон",
//   booking_client_step_phone_placeholder: "+49…",
//   booking_client_step_email_label: "E-mail (необязательно)",
//   booking_client_step_email_placeholder: "name@example.com",
//   booking_client_step_notes_label: "Пожелания (необязательно)",
//   booking_client_step_notes_placeholder: "Комментарий к записи",
//   booking_client_step_back: "Назад",
//   booking_client_step_continue: "Продолжить",

//   email_service_not_configured: "Сервис email не настроен",
//   email_send_unknown_error: "Неизвестная ошибка отправки email",
//   email_status_subject_pending: "🔔 Новая запись - Ожидает подтверждения",
//   email_status_subject_confirmed: "✅ Запись подтверждена - Salon Elen",
//   email_status_subject_done: "🎉 Спасибо за визит - Salon Elen",
//   email_status_subject_canceled: "❌ Запись отменена - Salon Elen",
//   email_status_text_pending: "В ожидании подтверждения",
//   email_status_text_confirmed: "Подтверждена",
//   email_status_text_done: "Выполнена",
//   email_status_text_canceled: "Отменена",
//   email_status_message_pending:
//     "Мы получили вашу заявку на запись. Наш администратор свяжется с вами в ближайшее время для подтверждения.",
//   email_status_message_confirmed_intro:
//     "Отличные новости! Ваша запись подтверждена.",
//   email_status_message_confirmed_wait:
//     "Ждём вас <strong>{date}</strong>",
//   email_status_message_confirmed_notice_title: "✨ Важно:",
//   email_status_message_confirmed_notice_text:
//     "Пожалуйста, приходите за 5 минут до начала записи.",
//   email_status_message_done_intro:
//     "Спасибо, что выбрали Salon Elen! 💖",
//   email_status_message_done_outro:
//     "Надеемся, вам понравился результат. Будем рады видеть вас снова!",
//   email_status_message_done_tip_title: "📅 Совет:",
//   email_status_message_done_tip_text:
//     "Для поддержания результата рекомендуем записаться через 3-4 недели.",
//   email_status_message_canceled_intro:
//     "К сожалению, ваша запись была отменена.",
//   email_status_message_canceled_contact_intro:
//     "Если это произошло по ошибке или вы хотите записаться на другое время, свяжитесь с нами:",
//   email_status_message_canceled_contact:
//     "📞 <strong>Телефон:</strong> +38 (000) 000-00-00<br>💬 <strong>Telegram:</strong> @salon_elen",
//   email_status_html_title: "Salon Elen - Уведомление",
//   email_status_header_subtitle: "Уведомление о записи",
//   email_status_greeting: "Здравствуйте, <strong>{name}</strong>!",
//   email_status_details_title: "📋 Детали записи",
//   email_status_details_status_label: "Статус:",
//   email_status_details_service_label: "Услуга:",
//   email_status_details_master_label: "Мастер:",
//   email_status_details_datetime_label: "Дата и время:",
//   email_status_cta_button: "📅 Записаться снова",
//   email_status_footer_tagline: "Salon Elen - Ваша красота, наша забота 💖",
//   email_status_footer_address: "Lessingstrasse 37, 06114 Halle Saale",
//   email_status_footer_contacts: "📞 +49 177 899 51 06 | 📧 elen69@web.de",
//   email_status_footer_note:
//     "Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.",
//   email_test_subject: "🧪 Тестовое письмо - Salon Elen",
//   email_test_title: "✅ Email настроен правильно!",
//   email_test_body:
//     "Если вы видите это письмо, значит Resend работает корректно.",
//   email_test_footer: "Отправлено из Salon Elen",

//   telegram_code_title: "Salon Elen - Код верификации",
//   telegram_code_intro: "Ваш код подтверждения:",
//   telegram_code_expires: "Код действителен {minutes} минут.",
//   telegram_payment_status_paid: "Оплачено",
//   telegram_payment_status_pending: "Ожидает оплаты",
//   telegram_payment_status_failed: "Ошибка оплаты",
//   telegram_payment_status_refunded: "Возврат средств",
//   telegram_payment_status_unknown: "Неизвестно",
//   telegram_admin_new_title: "НОВАЯ ЗАПИСЬ!",
//   telegram_admin_label_date: "Дата",
//   telegram_admin_label_time: "Время",
//   telegram_admin_label_client: "Клиент",
//   telegram_admin_label_phone: "Телефон",
//   telegram_admin_label_email: "Email",
//   telegram_admin_label_service: "Услуга",
//   telegram_admin_label_master: "Мастер",
//   telegram_admin_label_payment: "Оплата",
//   telegram_admin_label_id: "ID записи",
//   telegram_admin_open_button: "📊 Открыть в админке",
//   telegram_client_status_title_pending: "🔔 Заявка принята",
//   telegram_client_status_title_confirmed: "✅ Запись подтверждена",
//   telegram_client_status_title_done: "🎉 Спасибо за визит",
//   telegram_client_status_title_canceled: "❌ Запись отменена",
//   telegram_client_status_text_pending: "Ожидает подтверждения",
//   telegram_client_status_text_confirmed: "Подтверждена",
//   telegram_client_status_text_done: "Выполнена",
//   telegram_client_status_text_canceled: "Отменена",
//   telegram_client_status_message_pending:
//     "Мы получили вашу заявку. Администратор свяжется с вами в ближайшее время.",
//   telegram_client_status_message_confirmed:
//     "Ждём вас! Пожалуйста, приходите за 5 минут до записи.",
//   telegram_client_status_message_done:
//     "Спасибо, что выбрали Salon Elen! Будем рады видеть вас снова.",
//   telegram_client_status_message_canceled:
//     "Если хотите перенести запись, пожалуйста, свяжитесь с нами.",
//   telegram_client_greeting: "Здравствуйте, {name}!",
//   telegram_client_label_date: "Дата",
//   telegram_client_label_time: "Время",
//   telegram_client_label_service: "Услуга",
//   telegram_client_label_master: "Мастер",
//   telegram_client_label_status: "Статус",
//   telegram_start_title: "Добро пожаловать в Salon Elen!",
//   telegram_start_prompt:
//     "Для использования бота отправьте ваш номер телефона, нажав кнопку ниже.",
//   telegram_start_after:
//     "После этого вы сможете получать коды подтверждения для онлайн-записи.",
//   telegram_button_send_phone: "📱 Отправить номер телефона",
//   telegram_contact_saved_title: "Номер телефона сохранён!",
//   telegram_contact_saved_phone: "Ваш номер: {phone}",
//   telegram_contact_saved_ready:
//     "Теперь вы можете использовать Telegram для подтверждения записей на сайте.",
//   telegram_request_contact_prompt: "Пожалуйста, отправьте ваш номер телефона:",

//   api_telegram_send_to_registered_missing_params: "Email и draftId обязательны",
//   api_telegram_send_to_registered_user_not_found: "Пользователь не найден",
//   api_telegram_send_to_registered_code_not_found: "Код не найден",
//   api_telegram_send_to_registered_success: "Код отправлен",
//   api_telegram_send_to_registered_error: "Ошибка отправки кода",
//   api_email_check_missing: "Email не указан",
//   api_email_check_invalid: "Некорректный формат email",
//   api_email_check_too_long: "Email слишком длинный",
//   api_email_check_error: "Ошибка проверки email",
//   api_google_oauth_not_configured:
//     "Google OAuth не настроен. Обратитесь к администратору.",
//   api_google_oauth_missing_params: "Email и draftId обязательны",
//   api_google_oauth_draft_not_found: "Черновик бронирования не найден",
//   api_google_oauth_email_mismatch: "Email не совпадает с email в черновике",
//   api_google_oauth_generated: "OAuth URL сгенерирован",
//   api_google_oauth_error: "Ошибка генерации OAuth URL",
//   api_google_status_missing_params: "Email и draftId обязательны",
//   api_google_status_error: "Ошибка проверки статуса",
//   api_google_callback_access_denied: "Доступ отклонён",
//   api_google_callback_invalid_params: "Некорректные параметры",
//   api_google_callback_invalid_state: "Неверный токен верификации",
//   api_google_callback_expired: "Запрос истёк, попробуйте снова",
//   api_google_callback_already_verified: "Уже подтверждено",
//   api_google_callback_missing_email: "Google не вернул e-mail",
//   api_google_callback_email_mismatch: "Email не совпадает с email бронирования",
//   api_google_callback_draft_not_found: "Черновик бронирования не найден",
//   api_google_callback_slot_taken: "Выбранное время уже занято",
//   api_google_callback_error: "Ошибка обработки callback",
//   api_email_confirm_missing_fields: "Все поля обязательны",
//   api_email_confirm_invalid_code: "Неверный код или email",
//   api_email_confirm_draft_not_found: "Черновик не найден",
//   api_email_confirm_success: "Запись подтверждена",
//   api_email_confirm_slot_taken:
//     "Выбранное время уже занято. Пожалуйста, выберите другое время.",
//   api_email_confirm_error: "Ошибка подтверждения кода",
//   api_payment_missing_params: "appointmentId и paymentMethod обязательны",
//   api_payment_invalid_method: "Некорректный способ оплаты",
//   api_payment_not_found: "Запись не найдена",
//   api_payment_unknown_service: "неизвестная услуга",
//   api_payment_note_prefix: "Способ оплаты",
//   api_payment_card_redirect: "Переход к оплате картой",
//   api_payment_paypal_redirect: "Переход к оплате через PayPal",
//   api_payment_cash: "Оплата наличными в салоне",
//   api_payment_unknown_method: "Неизвестный способ оплаты",
//   api_payment_error: "Ошибка обработки оплаты",
//   api_admin_clients_unauthorized: "Недостаточно прав",
//   api_admin_clients_missing_fields: "Заполните обязательные поля",
//   api_admin_clients_duplicate_active:
//     "Клиент с таким телефоном или email уже существует",
//   api_admin_clients_duplicate_deleted:
//     "Найден удалённый клиент с таким телефоном или email",
//   api_admin_clients_duplicate_suggestion:
//     "Вы можете восстановить удалённого клиента вместо создания нового",
//   api_admin_clients_created: "Клиент успешно создан",
//   api_admin_clients_error: "Ошибка создания клиента",

//   // ======= CONTACTS (NEW) =======
//   contacts_seo_description:
//     "Адрес, телефон, часы работы и как нас найти. Онлайн-запись в Salon Elen в Halle (Saale).",

//   contacts_subtitle: "Свяжитесь с нами • Быстро и удобно",
//   contacts_title: "Контакты",
//   contacts_intro:
//     "Поможем с услугами, временем и записью. Можно позвонить, написать на email или открыть маршрут.",

//   contacts_quick_title: "Карта и сообщение",

//   contacts_quick_call: "Позвонить",
//   contacts_quick_book: "Онлайн-запись",
//   contacts_quick_route: "Маршрут",

//   contacts_details_title: "Данные салона",

//   contacts_open_maps: "Открыть в Google Maps",

//   contacts_map_title: "Как нас найти",
//   contacts_map_caption: "Откройте карту и проложите маршрут в один клик.",
//   contacts_show_map: "Показать интерактивную карту",
//   contacts_map_privacy:
//     "Карта загрузится только после клика. Google может установить cookies и обработать данные согласно своей политике.",

//   contacts_address_label: "Адрес",
//   contacts_phone_label: "Телефон",
//   contacts_email_label: "Email",
//   contacts_hours_label: "Часы работы",
//   contacts_hours_value: "Пн–Пт 10:00–19:00, Сб 10:00–16:00",

//   contacts_form_title: "Написать сообщение",
//   contacts_form_name: "Ваше имя",
//   contacts_form_phone: "Телефон (необязательно)",
//   contacts_form_message: "Сообщение",
//   contacts_form_send: "Отправить",
//   contacts_form_note:
//     "Сообщение откроется в вашем почтовом приложении. Если не открылось — напишите напрямую на elen69@web.de",



// };

// /* ==================== GERMAN (DE) ==================== */

// const deMessages: BaseMessages = {
//   booking_verify_email_sent_message: "Code wurde per E-Mail gesendet",
//   booking_verify_email_api_missing_params: "E-Mail und draftId sind erforderlich",
//   booking_verify_email_api_draft_not_found: "Buchungsentwurf nicht gefunden",
//   booking_verify_email_api_email_mismatch: "E-Mail stimmt nicht mit dem Entwurf überein",
//   booking_verify_email_api_send_failed: "Fehler beim Senden des Codes per E-Mail",
//   booking_verify_email_api_error: "Fehler beim Senden des Codes",
//   booking_email_otp_subject: "Bestätigungscode für die Buchung - Salon Elen",
//   booking_email_otp_title: "Bestätigungscode",
//   booking_email_otp_header_subtitle: "Buchungsbestätigung",
//   booking_email_otp_greeting: "Hallo!",
//   booking_email_otp_code_intro: "Ihr Bestätigungscode zum Abschließen der Buchung:",
//   booking_email_otp_expires_label: "Wichtig:",
//   booking_email_otp_expires_text: "Der Code ist {minutes} Minuten gültig.",
//   booking_email_otp_ignore:
//     "Wenn Sie keine Buchung bei Salon Elen vorgenommen haben, ignorieren Sie diese E-Mail.",
//   booking_email_otp_footer_tagline: "Salon Elen – Ihre Schönheit, unser Anliegen 💖",
//   booking_email_otp_footer_contact: "📧 booking@news.permanent-halle.de",
//   booking_email_otp_footer_note: "Dies ist eine automatische E-Mail. Bitte nicht antworten.",
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
//   footer_address_label: "Lessingstrasse 37, Halle (Saale)",

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

//   site_name: "Salon Elen",
//   booking_header_subtitle: "Premium-Buchung",
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
//   booking_calendar_legend_title:
//     "Goldene Füllung zeigt die Auslastung des Tages",
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
//   booking_calendar_slot_taken: "Dieser Termin wurde gerade von einem anderen Kunden gebucht. Bitte wählen Sie eine andere Zeit.",
//   booking_calendar_reserve_error: "Reservierungsfehler. Bitte versuchen Sie es erneut.",

//   // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "Wie möchten Sie fortfahren?",
//   booking_client_choice_subtitle:
//     "Wählen Sie eine bequeme Registrierungsmethode",
//   booking_client_choice_recommended: "Empfohlen",

//   booking_client_google_title: "Schnelle Registrierung",
//   booking_client_google_description:
//     "Melden Sie sich über Google an und gehen Sie direkt zur Zahlung",
//   booking_client_google_benefit_1: "Ein Klick zur Zahlung",
//   booking_client_google_benefit_2: "Automatisches Ausfüllen",
//   booking_client_google_benefit_3: "Sicher und zuverlässig",
//   booking_client_google_benefit_4: "Zeitersparnis",
//   booking_client_google_button: "Mit 1 Klick starten",
//   booking_client_google_security: "Geschützt durch Google OAuth 2.0",
//   booking_client_google_connecting: "Verbindung wird hergestellt...",

//   booking_client_form_title: "Formular ausfüllen",
//   booking_client_form_description:
//     "Traditionelle Methode mit voller Kontrolle über Ihre Daten",
//   booking_client_form_benefit_1: "Volle Datenkontrolle",
//   booking_client_form_benefit_2: "Kein Google-Konto erforderlich",
//   booking_client_form_benefit_3: "Gewohnter Prozess",
//   booking_client_form_benefit_4: "Verifizierung über Telegram",
//   booking_client_form_button: "Formular ausfüllen",
//   booking_client_form_security: "Bestätigung über Telegram Bot",

//   booking_client_choice_footer: "Beide Methoden sind sicher und zuverlässig.",
//   booking_client_choice_footer_highlight: "Wählen Sie die für Sie bequemste.",

//   booking_client_popup_blocked:
//     "Fenster konnte nicht geöffnet werden. Erlauben Sie Pop-ups in Ihrem Browser.",
//   booking_client_google_error_init:
//     "Fehler bei der Google OAuth-Initialisierung",
//   booking_client_auth_error: "Autorisierungsfehler",
//   booking_client_auth_waiting: "Warten auf Bestätigung über Google...",

//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Schritt 4 — Ihre Kontaktdaten",
//   booking_client_form_hero_title: "Online-Terminbuchung",
//   booking_client_form_hero_subtitle:
//     "Geben Sie Ihre Daten an, damit wir Ihre Buchung bestätigen können",

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
//   booking_client_form_placeholder_comment:
//     "Zusätzliche Informationen oder Wünsche",
//   booking_client_form_placeholder_referral_other: "Bitte angeben",

//   booking_client_form_referral_select: "Wählen Sie eine Option",
//   booking_client_form_referral_google: "Google",
//   booking_client_form_referral_facebook: "Facebook",
//   booking_client_form_referral_instagram: "Instagram",
//   booking_client_form_referral_friends: "Empfehlung von Freunden",
//   booking_client_form_referral_other: "Andere",

//   booking_client_form_error_name:
//     "Bitte geben Sie Ihren vollständigen Namen an",
//   booking_client_form_error_phone:
//     "Bitte geben Sie eine gültige Telefonnummer an",
//   booking_client_form_error_email_required: "E-Mail ist erforderlich",
//   booking_client_form_error_email_invalid: "Ungültige E-Mail",
//   booking_client_form_error_email_not_verified: "E-Mail nicht bestätigt",
//   booking_client_form_error_birth_required: "Geburtsdatum ist erforderlich",
//   booking_client_form_error_birth_future:
//     "Zukünftiges Datum ist nicht zulässig",
//   booking_client_form_error_birth_underage:
//     "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
//   booking_client_form_error_referral: "Wählen Sie eine Option",
//   booking_client_form_error_referral_other: "Bitte angeben",

//   booking_client_form_email_checking: "E-Mail wird überprüft…",
//   booking_client_form_email_verified: "E-Mail bestätigt",

//   booking_client_form_age_requirement:
//     "Für Online-Buchungen ist ein Mindestalter von 16 Jahren erforderlich",
//   booking_client_form_email_error_note:
//     "Wenn Sie einen Fehler in der Adresse machen, können Sie trotzdem zum Termin kommen, erhalten aber keine Erinnerungen und Bestätigungen.",

//   booking_client_form_button_back: "Zurück",
//   booking_client_form_button_submit: "Buchen",
//   booking_client_form_button_submitting: "Daten werden überprüft…",

//   booking_client_form_info_title: "Warum benötigen wir Ihre E-Mail?",
//   booking_client_form_info_point_1: "An Ihre E-Mail senden wir",
//   booking_client_form_info_point_1_highlight:
//     "die Buchungsbestätigung und alle Details",
//   booking_client_form_info_point_2: "Sie erhalten",
//   booking_client_form_info_point_2_highlight:
//     "eine Erinnerung vor Ihrem Besuch",
//   booking_client_form_info_point_3:
//     "Wir behandeln personenbezogene Daten sorgfältig und verwenden Ihre E-Mail nur für die Bearbeitung Ihrer Buchung",

//   booking_client_form_invalid_params:
//     "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
//   booking_client_form_invalid_return: "Zurück zur Dienstleistungsauswahl",

//   // ======= BOOKING - PHONE & BIRTHDAY PAGE (NEW) =======
//   phone_title: "Kontaktinformationen",
//   phone_subtitle: "Geben Sie Ihre Kontaktdaten an",
//   phone_label: "Telefon",
//   phone_hint: "Wir kontaktieren Sie zur Bestätigung des Termins",
//   phone_required: "Telefonnummer ist erforderlich",
//   phone_submit: "Weiter",
//   phone_submitting: "Senden...",
//   phone_privacy:
//     "Ihre Daten sind geschützt und werden nicht an Dritte weitergegeben",
//   birthday_label: "Geburtsdatum",
//   birthday_hint:
//     "Wir benötigen Ihr Geburtsdatum, damit wir Ihnen in Zukunft einen individuellen Rabatt zu Ihrem Fest anbieten können!",

//   booking_verify_badge: "Schritt 5 — E-Mail-Bestätigung",
//   booking_verify_hero_title: "Buchungsbestätigung",
//   booking_verify_hero_subtitle:
//     "Überprüfen Sie Ihre E-Mail und geben Sie den Code ein",
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
//   booking_verify_email_confirm_desc:
//     "Wir senden einen einmaligen 6-stelligen Code an",
//   booking_verify_email_label: "E-Mail zur Bestätigung",
//   booking_verify_email_wrong_hint:
//     "Falls die E-Mail falsch ist, gehen Sie zum vorherigen Schritt zurück",
//   booking_verify_email_send_code: "Code senden",
//   booking_verify_email_sending: "Wird gesendet…",
//   booking_verify_email_arrives_hint:
//     "Der Code kommt innerhalb weniger Sekunden an",
//   booking_verify_email_enter_code: "Geben Sie den 6-stelligen Code ein",
//   booking_verify_email_code_valid: "Der Code ist begrenzt gültig",
//   booking_verify_email_confirm_code: "Code bestätigen",
//   booking_verify_email_checking: "Wird überprüft…",
//   booking_verify_email_resend: "Code erneut senden",
//   booking_verify_info_title: "Sichere Bestätigung",
//   booking_verify_info_desc:
//     "Wir verwenden einen Einmalcode zum Schutz Ihrer Daten und des Salon-Zeitplans",
//   booking_verify_info_arrives: "Der Code kommt in 1-2 Minuten an",
//   booking_verify_info_check_spam: "Prüfen Sie den Spam-Ordner",
//   booking_verify_info_check_email:
//     "Vergewissern Sie sich, dass die E-Mail korrekt ist",
//   booking_verify_info_resend_if_needed:
//     "Fordern Sie bei Bedarf einen neuen Code an",
//   booking_verify_info_progress_title: "Ihr Fortschritt",
//   booking_verify_info_progress_1: "Dienstleistung und Meister ausgewählt",
//   booking_verify_info_progress_2: "Datum und Uhrzeit angegeben",
//   booking_verify_info_progress_3: "Kontaktdaten ausgefüllt",
//   booking_verify_info_progress_4: "Jetzt — E-Mail-Bestätigung",
//   booking_verify_info_progress_5: "Als nächstes — Zahlung",
//   booking_verify_info_support:
//     "Bei Schwierigkeiten kontaktieren Sie uns — wir helfen Ihnen, die Buchung abzuschließen",
//   booking_verify_invalid_params:
//     "Ungültige Parameter. Bitte beginnen Sie die Buchung erneut.",
//   booking_verify_invalid_return: "Zurück zur Dienstleistungsauswahl",
//   booking_verify_google_title: "Über Google bestätigen",
//   booking_verify_google_desc:
//     "Melden Sie sich mit Ihrem Google-Konto an für eine schnelle und sichere Bestätigung Ihrer Buchung.",
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
//   booking_verify_google_security_desc:
//     "Wir erhalten keinen Zugriff auf Ihr Google-Passwort. Es wird das offizielle OAuth-Protokoll verwendet.",
//   booking_verify_google_success:
//     "✅ Über Google bestätigt! Weiterleitung zur Zahlung...",
//   booking_verify_google_preparing_window:
//     "🔐 Google öffnet sich in einem neuen Fenster...",
//   booking_verify_google_allow_popups:
//     "⚠️ Erlauben Sie Pop-ups und klicken Sie auf die Schaltfläche unten.",
//   booking_verify_telegram_title: "Über Telegram bestätigen",
//   booking_verify_telegram_desc_registered:
//     "Code wurde an Telegram Bot gesendet. Prüfen Sie Nachrichten und klicken Sie auf die Bestätigungsschaltfläche.",
//   booking_verify_telegram_desc_unregistered:
//     "Telegram öffnet sich automatisch. Sie erhalten einen Code zum Eingeben oder können direkt mit einer Schaltfläche im Bot bestätigen.",
//   booking_verify_telegram_sending_code: "Code wird gesendet...",
//   booking_verify_telegram_open_button: "Telegram öffnen",
//   booking_verify_telegram_reopen_button: "Telegram erneut öffnen",
//   booking_verify_telegram_waiting_bot:
//     "Warten auf Bestätigung im Telegram Bot...",
//   booking_verify_telegram_waiting: "Warten auf Bestätigung...",
//   booking_verify_telegram_divider: "oder",
//   booking_verify_telegram_enter_code:
//     "Geben Sie den 6-stelligen Code aus Telegram ein",
//   booking_verify_telegram_code_placeholder: "000000",
//   booking_verify_telegram_code_valid: "Der Code ist 10 Minuten gültig.",
//   booking_verify_telegram_confirm_button: "Code bestätigen",
//   booking_verify_telegram_checking: "Wird überprüft...",
//   booking_verify_telegram_code_sent:
//     "✈️ Code an Telegram gesendet! Prüfen Sie den Bot und klicken Sie auf die Bestätigungsschaltfläche.",
//   booking_verify_telegram_opening:
//     "✈️ Telegram öffnet sich... Warten auf Bestätigung.",
//   booking_verify_telegram_click_button:
//     "⚠️ Klicken Sie auf die Schaltfläche unten, um Telegram zu öffnen.",
//   booking_verify_telegram_success:
//     "✅ Über Telegram bestätigt! Weiterleitung zur Zahlung...",
//   booking_verify_error_enter_code: "Geben Sie den 6-stelligen Code ein",
//   booking_verify_success_redirect:
//     "Verifizierung erfolgreich! Weiterleitung zur Zahlung...",

//   booking_payment_badge: "Schritt 6 — Zahlung und endgültige Bestätigung",
//   booking_payment_hero_title: "Buchung abschließen",
//   booking_payment_hero_subtitle:
//     "Wählen Sie die Zahlungsmethode und bestätigen Sie die Buchung",
//   booking_payment_appointment_id: "Buchungsnummer:",
//   booking_payment_method_title: "Zahlungsmethode",
//   booking_payment_onsite_title: "Zahlung im Salon",
//   booking_payment_onsite_desc: "Vor Ort",
//   booking_payment_onsite_benefit_1: "Bar oder Karte im Salon",
//   booking_payment_onsite_benefit_2: "Keine Vorauszahlung",
//   booking_payment_onsite_benefit_3: "Zahlung nach der Dienstleistung",
//   booking_payment_online_title: "Online-Zahlung",
//   booking_payment_online_desc: "Bald verfügbar",
//   // booking_payment_online_benefit_1: "Karte, Apple Pay, Google Pay",
//   // booking_payment_online_benefit_2: "In Entwicklung",
//   // booking_payment_online_benefit_3: "Buchung wird trotzdem bestätigt",
//   // Infoblock - AKTUELLER Text
//   booking_payment_info_how_works_title: "Wie funktioniert das?",
//   booking_payment_info_how_works_desc: "Das System hat bereits einen Termin im Salon-Zeitplan erstellt. Sie können online mit Karte (Stripe) oder über PayPal bezahlen, oder bar/mit Karte im Salon nach der Dienstleistung.",
//   booking_payment_info_title: "Wie funktioniert das?",
//   booking_payment_info_desc:
//     "Das System hat bereits einen Termin im Salon-Zeitplan erstellt. Die Zahlung wird auf der Seite des Salons erfasst. Online-Zahlung wird später hinzugefügt.",
//   booking_payment_confirm_button: "Buchung bestätigen",
//   booking_payment_confirm_terms:
//     'Durch Klicken auf "Buchung bestätigen" stimmen Sie den Salon-Bedingungen zu',
//   booking_payment_summary_title: "Buchungszusammenfassung",
//   booking_payment_summary_visit: "Ihr Besuch bei SalonElen",
//   booking_payment_summary_service: "Dienstleistung aus der Buchung",
//   booking_payment_summary_master: "Meister aus der Buchung",
//   booking_payment_summary_datetime: "Datum und Uhrzeit nach ID:",
//   booking_payment_summary_address: "Salon-Adresse",
//   booking_payment_summary_cancellation_title: "Stornierungsbedingungen",
//   booking_payment_summary_cancellation_desc:
//     "Wenn Sie nicht kommen können, stornieren Sie bitte im Voraus — dies ermöglicht es, die Zeit für andere Salon-Gäste freizugeben.",
//   booking_payment_summary_future_note:
//     "Nach dem Start der Online-Zahlung erscheint hier ein Block zur Auswahl der Zahlungsmethode und des Zahlungsstatus",
//   booking_payment_success_title: "Buchung bestätigt!",
//   booking_payment_success_desc:
//     "Ihre Buchung wurde erfolgreich bestätigt. Die Zahlung erfolgt im Salon.",
//   booking_payment_success_home: "Zur Startseite",
//   booking_payment_success_calendar: "Zu Google Calendar hinzufügen",
//   booking_payment_success_apple_calendar: "Zu Apple Calendar hinzufügen",
//   booking_payment_success_new: "Neue Buchung erstellen",
//   booking_payment_error_title: "Fehler beim Übergang zur Zahlung",
//   booking_payment_error_desc:
//     "Wir konnten die Buchungs-ID nicht finden. Möglicherweise ist der Link veraltet oder der E-Mail-Bestätigungsschritt wurde übersprungen.",
//   booking_payment_error_return: "Zurück zur Buchung",
//   booking_payment_error_missing:
//     "Buchungs-ID fehlt. Bitte beginnen Sie die Buchung erneut.",
//   booking_success_page_title: "Online-Buchung",
//   booking_success_page_subtitle: "Erfolg",
//   booking_success_loading: "Wird geladen...",
//   booking_success_loading_data: "Daten werden geladen…",
//   booking_success_error_title: "Fehler",
//   booking_success_error_not_found: "Buchungs-ID nicht gefunden",
//   booking_success_error_load_failed:
//     "Buchungsdaten konnten nicht geladen werden",
//   booking_success_error_return: "Zurück zur Buchung",
//   booking_success_title: "Buchung bestätigt!",
//   booking_success_desc:
//     "Ihre Buchung wurde erfolgreich erstellt. Wir haben eine Bestätigung an Ihre E-Mail gesendet.",
//   booking_success_details_title: "Buchungsdetails:",
//   booking_success_details_name: "Name",
//   booking_success_details_email: "E-Mail",
//   booking_success_details_phone: "Telefon",
//   booking_success_details_datetime: "Datum und Uhrzeit",
//   booking_success_button_new: "Neue Buchung erstellen",
//   booking_success_button_home: "Zur Startseite",

//   calendar_title_appointment_in: "bei SalonElen",
//   calendar_description_title: "Termin im Schönheitssalon SalonElen",
//   calendar_service: "Dienstleistung:",
//   calendar_master: "Meister:",
//   calendar_date: "Datum:",
//   calendar_time: "Uhrzeit:",
//   calendar_duration: "Dauer:",
//   calendar_duration_minutes: "Minuten",
//   calendar_appointment_id: "Terminnummer:",
//   calendar_address: "Adresse:",
//   calendar_contacts: "Kontakte:",
//   calendar_phone: "Telefon:",
//   calendar_reschedule_notice:
//     "Wenn Sie Ihren Termin verschieben oder absagen müssen, kontaktieren Sie uns bitte im Voraus.",
//   calendar_see_you: "Bis bald! ✨",
//   calendar_location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",

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

//   // SMS VERIFICATION PAGE
//   booking_sms_verify_title: "Telefonbestätigung",
//   booking_sms_verify_subtitle:
//     "Wir senden Ihnen einen 4-stelligen PIN-Code per SMS",
//   booking_sms_verify_phone_label: "Telefonnummer",
//   booking_sms_verify_phone_placeholder: "+49 177 899 5106",
//   booking_sms_verify_phone_hint:
//     "Format: +[Ländercode][Nummer] (z.B.: +4917789951064)",
//   booking_sms_verify_phone_required: "Telefonnummer eingeben",
//   booking_sms_verify_send_pin: "PIN-Code senden",
//   booking_sms_verify_sending: "Wird gesendet...",
//   booking_sms_verify_pin_validity: "PIN-Code ist 10 Minuten gültig",

//   booking_sms_verify_pin_title: "PIN-Code eingeben",
//   booking_sms_verify_pin_subtitle: "PIN-Code gesendet an",
//   booking_sms_verify_pin_label: "PIN-Code",
//   booking_sms_verify_pin_placeholder: "0000",
//   booking_sms_verify_pin_hint: "4-stelligen PIN-Code aus SMS eingeben",
//   booking_sms_verify_confirm: "Bestätigen",
//   booking_sms_verify_checking: "Wird überprüft...",
//   booking_sms_verify_resend: "PIN-Code erneut senden",
//   booking_sms_verify_change_phone: "Telefonnummer ändern",
//   booking_sms_verify_pin_validity_note:
//     "PIN-Code ist 10 Minuten gültig • Maximal 3 Versuche",

//   booking_sms_verify_error_title: "⚠️ Fehler",
//   booking_sms_verify_error_missing_params:
//     "Unzureichende Parameter. Bitte beginnen Sie die Buchung erneut.",
//   booking_sms_verify_error_return: "Zurück zur Buchung",

//   booking_sms_verify_contact: "Fragen? Kontaktieren Sie uns: +49 177 899 5106",

//   // SMS DETAILS PAGE
//   booking_sms_details_title: "Ihre Daten",
//   booking_sms_details_subtitle:
//     "Bitte geben Sie Ihren Namen und zusätzliche Informationen an",
//   booking_sms_details_name_label: "Ihr Name",
//   booking_sms_details_name_placeholder: "Max Mustermann",
//   booking_sms_details_name_required: "Name ist erforderlich",
//   booking_sms_details_email_label: "E-Mail",
//   booking_sms_details_email_placeholder: "max@example.com",
//   booking_sms_details_email_hint: "Für Bestätigung und Erinnerungen",
//   booking_sms_details_birth_label: "Geburtsdatum",
//   booking_sms_details_birth_hint:
//     "Wir benötigen Ihr Geburtsdatum, damit wir Ihnen in Zukunft einen individuellen Rabatt zu Ihrem Fest anbieten können!",
//   booking_sms_details_submit: "Zur Zahlung fortfahren",
//   booking_sms_details_submitting: "Speichern...",
//   booking_sms_details_privacy:
//     "Ihre Daten sind geschützt und werden nicht an Dritte weitergegeben",

//   booking_sms_details_error_title: "⚠️ Fehler",
//   booking_sms_details_error_missing_id:
//     "Registrierungs-ID fehlt. Bitte beginnen Sie die Buchung erneut.",
//   booking_sms_details_error_return: "Zurück zur Buchung",

//   booking_sms_details_contact: "Fragen? Kontaktieren Sie uns: +49 177 899 5106",

//   // SMS CARD
//   booking_client_sms_title: "Per Telefon (SMS)",
//   booking_client_sms_description: "PIN-Code per SMS erhalten",
//   booking_client_sms_benefit_1: "PIN-Code per SMS",
//   booking_client_sms_benefit_2: "Keine E-Mail-Registrierung",
//   booking_client_sms_benefit_3: "Schnell und sicher",
//   booking_client_sms_benefit_4: "4-stelliger Code",
//   booking_client_sms_button: "Per SMS anmelden",
//   booking_client_sms_security: "Infobip SMS",

//   // STRIPE PAYMENT
//   booking_payment_stripe_title: "Kartenzahlung",
//   booking_payment_stripe_desc: "Sichere Zahlung über Stripe",
//   booking_payment_stripe_benefit_1: "Alle Karten: Visa, MasterCard, AmEx",
//   booking_payment_stripe_benefit_2: "Sofortige Bestätigung",
//   booking_payment_stripe_benefit_3: "3D Secure Schutz",
//   booking_payment_stripe_amount: "Zu zahlender Betrag",
//   booking_payment_stripe_secure: "Sicher",
//   booking_payment_stripe_processing: "Zahlung wird verarbeitet...",
//   booking_payment_stripe_pay: "Bezahlen",
//   booking_payment_stripe_note: "Ihre Zahlungsdaten sind durch 256-Bit-Verschlüsselung geschützt",

//   // PAYPAL PAYMENT
//   booking_payment_paypal_title: "PayPal",
//   booking_payment_paypal_desc: "Zahlung über PayPal-Konto",
//   booking_payment_paypal_benefit_1: "Schnelle Zahlung über PayPal",
//   booking_payment_paypal_benefit_2: "Käuferschutz",
//   booking_payment_paypal_benefit_3: "Keine Gebühren",
//   booking_payment_paypal_amount: "Zu zahlender Betrag",
//   booking_payment_paypal_secure: "Sicher",
//   booking_payment_paypal_note: "Nach dem Klicken werden Sie zur sicheren PayPal-Seite weitergeleitet",
//   booking_payment_paypal_footer: "Zahlungen werden über PayPal verarbeitet. Ihre Daten sind geschützt.",

//    // ======= BOOKING - TELEGRAM CARD =======
//   booking_client_telegram_title: "Telegram",
//   booking_client_telegram_description: "Schnelle Registrierung über Telegram Bot",
//   booking_client_telegram_benefit_1: "Code in Telegram",
//   booking_client_telegram_benefit_2: "Keine E-Mail-Registrierung",
//   booking_client_telegram_benefit_3: "Schnell und sicher",
//   booking_client_telegram_benefit_4: "6-stelliger Code",
//   booking_client_telegram_button: "Über Telegram anmelden",
//   booking_client_telegram_security: "Telegram Bot Verifizierung",

//   // ======= BOOKING - TELEGRAM VERIFICATION PAGE =======
//   booking_telegram_verify_title: "Registrierung über Telegram",
//   booking_telegram_verify_subtitle: "Folgen Sie 3 einfachen Schritten",

//   booking_telegram_verify_step1_title: "Schritt 1: Telefonnummer",
//   booking_telegram_verify_step1_subtitle: "Geben Sie Ihre Telefonnummer an",
//   booking_telegram_verify_phone_label: "Telefonnummer",
//   booking_telegram_verify_phone_placeholder: "+49 177 899 5106",
//   booking_telegram_verify_phone_hint: "Format: +[Ländercode][Nummer]",
//   booking_telegram_verify_phone_required: "Telefonnummer eingeben",
//   booking_telegram_verify_send_code: "Code senden",
//   booking_telegram_verify_sending: "Wird gesendet...",

//   booking_telegram_verify_step2_title: "Schritt 2: Code aus Telegram",
//   booking_telegram_verify_step2_subtitle: "Geben Sie den Code ein, den wir Ihnen in Telegram gesendet haben",
//   booking_telegram_verify_code_label: "Bestätigungscode",
//   booking_telegram_verify_code_placeholder: "000000",
//   booking_telegram_verify_code_hint: "6-stelliger Code aus Telegram Bot",
//   booking_telegram_verify_code_required: "6-stelligen Code eingeben",
//   booking_telegram_verify_check_code: "Code bestätigen",
//   booking_telegram_verify_checking: "Wird überprüft...",
//   booking_telegram_verify_resend: "Code erneut senden",

//   booking_telegram_verify_step3_title: "Schritt 3: Zusätzliche Informationen",
//   booking_telegram_verify_step3_subtitle: "Füllen Sie Ihre Daten aus (optional)",
//   booking_telegram_verify_email_label: "E-Mail",
//   booking_telegram_verify_email_placeholder: "ihre@email.de",
//   booking_telegram_verify_email_hint: "Für Bestätigung und Erinnerungen",
//   booking_telegram_verify_birth_label: "Geburtsdatum",
//   booking_telegram_verify_birth_hint: "Für personalisierte Rabatte zu Ihrem Fest",
//   booking_telegram_verify_complete: "Registrierung abschließen",
//   booking_telegram_verify_completing: "Speichern...",

//   booking_telegram_verify_privacy: "Ihre Daten sind geschützt und werden nicht an Dritte weitergegeben",
//   booking_telegram_verify_error_title: "⚠️ Fehler",
//   booking_telegram_verify_error_missing: "Unzureichende Parameter. Bitte beginnen Sie die Buchung erneut.",
//   booking_telegram_verify_error_return: "Zurück zur Buchung",

//   booking_telegram_modal_title: "Registrierung im Telegram-Bot",
//   booking_telegram_modal_subtitle:
//     "Um Bestätigungscodes zu erhalten, müssen Sie sich in unserem Telegram-Bot registrieren",
//   booking_telegram_modal_phone_label: "Ihre Nummer:",
//   booking_telegram_modal_how_title: "So registrieren Sie sich:",
//   booking_telegram_modal_step_open_bot:
//     "Klicken Sie unten, um den Telegram-Bot zu öffnen",
//   booking_telegram_modal_step_register:
//     "Der Bot registriert automatisch Ihre Nummer",
//   booking_telegram_modal_step_done: "Kehren Sie hierher zurück und klicken Sie",
//   booking_telegram_modal_button_open: "Telegram-Bot öffnen",
//   booking_telegram_modal_button_done: "Ich bin registriert",
//   booking_telegram_modal_note:
//     "Der Bestätigungscode kommt innerhalb weniger Sekunden im Telegram-Bot an",

//   booking_telegram_verify_error_send: "Fehler beim Senden des Codes",
//   booking_telegram_verify_error_expired:
//     "Code abgelaufen. Fordern Sie einen neuen Code an.",
//   booking_telegram_verify_error_invalid_code:
//     "Ungültiger Code. Prüfen Sie den Code in Telegram und versuchen Sie es erneut.",
//   booking_telegram_verify_error_session:
//     "Sitzung nicht gefunden. Bitte starten Sie erneut.",
//   booking_telegram_verify_error_create: "Fehler beim Erstellen der Buchung",
//   booking_telegram_verify_error_complete:
//     "Fehler beim Abschluss der Registrierung",
//   booking_telegram_verify_error_check: "Fehler bei der Codeprüfung",
//   booking_telegram_verify_success_sent: "Code an Telegram gesendet!",
//   booking_telegram_verify_success_verified: "Code bestätigt!",
//   booking_telegram_verify_success_creating: "Buchung wird erstellt...",
//   booking_telegram_verify_back: "Zurück",

//   booking_confirmation_error_title: "Fehler",
//   booking_confirmation_error_missing_id: "Buchungs-ID fehlt",
//   booking_confirmation_error_cta: "Neue Buchung erstellen",
//   booking_confirmation_title: "Buchung erstellt!",
//   booking_confirmation_subtitle:
//     "Ihre Buchung wurde erfolgreich erstellt. Wir kontaktieren Sie zur Bestätigung.",
//   booking_confirmation_details_number_label: "Buchungsnummer",
//   booking_confirmation_details_status_label: "Status",
//   booking_confirmation_status_pending: "Wartet auf Bestätigung",
//   booking_confirmation_action_home: "Zur Startseite",
//   booking_confirmation_action_new: "Neue Buchung erstellen",
//   booking_confirmation_notice_title: "Bitte beachten:",
//   booking_confirmation_notice_body:
//     "Wir werden Sie in Kürze kontaktieren, um die Buchung zu bestätigen. Wenn Sie Fragen haben, rufen Sie uns an oder schreiben Sie uns eine E-Mail.",
//   booking_confirmation_loading: "Laden...",

//   booking_client_page_title: "Registrierung wählen | Salon Elen",
//   booking_client_page_description:
//     "Wählen Sie die Registrierungsmethode, um die Buchung abzuschließen",
//   booking_client_params_error_title: "Parameterfehler",
//   booking_client_params_error_text: "Erforderliche Buchungsparameter fehlen",
//   booking_client_params_error_return: "Zum Anfang zurück",

//   booking_client_step_start_label: "Beginn:",
//   booking_client_step_end_label: "Ende:",
//   booking_client_step_name_label: "Ihr Name",
//   booking_client_step_name_placeholder: "Zum Beispiel Anna",
//   booking_client_step_phone_label: "Telefon",
//   booking_client_step_phone_placeholder: "+49…",
//   booking_client_step_email_label: "E-Mail (optional)",
//   booking_client_step_email_placeholder: "name@example.com",
//   booking_client_step_notes_label: "Wünsche (optional)",
//   booking_client_step_notes_placeholder: "Kommentar zur Buchung",
//   booking_client_step_back: "Zurück",
//   booking_client_step_continue: "Weiter",

//   email_service_not_configured: "E-Mail-Dienst ist nicht konfiguriert",
//   email_send_unknown_error: "Unbekannter E-Mail-Fehler",
//   email_status_subject_pending: "🔔 Neue Buchung - Wartet auf Bestätigung",
//   email_status_subject_confirmed: "✅ Buchung bestätigt - Salon Elen",
//   email_status_subject_done: "🎉 Danke für Ihren Besuch - Salon Elen",
//   email_status_subject_canceled: "❌ Buchung storniert - Salon Elen",
//   email_status_text_pending: "Wartet auf Bestätigung",
//   email_status_text_confirmed: "Bestätigt",
//   email_status_text_done: "Abgeschlossen",
//   email_status_text_canceled: "Storniert",
//   email_status_message_pending:
//     "Wir haben Ihre Buchungsanfrage erhalten. Unser Administrator wird Sie in Kürze zur Bestätigung kontaktieren.",
//   email_status_message_confirmed_intro:
//     "Gute Nachrichten! Ihre Buchung ist bestätigt.",
//   email_status_message_confirmed_wait:
//     "Wir erwarten Sie <strong>{date}</strong>",
//   email_status_message_confirmed_notice_title: "✨ Wichtig:",
//   email_status_message_confirmed_notice_text:
//     "Bitte kommen Sie 5 Minuten vor Beginn.",
//   email_status_message_done_intro:
//     "Danke, dass Sie Salon Elen gewählt haben! 💖",
//   email_status_message_done_outro:
//     "Wir hoffen, Ihnen hat das Ergebnis gefallen. Wir freuen uns, Sie wiederzusehen!",
//   email_status_message_done_tip_title: "📅 Tipp:",
//   email_status_message_done_tip_text:
//     "Für ein dauerhaftes Ergebnis empfehlen wir eine neue Buchung in 3-4 Wochen.",
//   email_status_message_canceled_intro:
//     "Leider wurde Ihre Buchung storniert.",
//   email_status_message_canceled_contact_intro:
//     "Wenn dies ein Fehler war oder Sie einen neuen Termin möchten, kontaktieren Sie uns:",
//   email_status_message_canceled_contact:
//     "📞 <strong>Telefon:</strong> +38 (000) 000-00-00<br>💬 <strong>Telegram:</strong> @salon_elen",
//   email_status_html_title: "Salon Elen - Benachrichtigung",
//   email_status_header_subtitle: "Buchungsbenachrichtigung",
//   email_status_greeting: "Hallo, <strong>{name}</strong>!",
//   email_status_details_title: "📋 Buchungsdetails",
//   email_status_details_status_label: "Status:",
//   email_status_details_service_label: "Leistung:",
//   email_status_details_master_label: "Spezialist:",
//   email_status_details_datetime_label: "Datum und Uhrzeit:",
//   email_status_cta_button: "📅 Erneut buchen",
//   email_status_footer_tagline: "Salon Elen - Ihre Schönheit, unsere Fürsorge 💖",
//   email_status_footer_address: "Lessingstrasse 37, 06114 Halle Saale",
//   email_status_footer_contacts: "📞 +49 177 899 51 06 | 📧 elen69@web.de",
//   email_status_footer_note:
//     "Dies ist eine automatische Benachrichtigung. Bitte antworten Sie nicht auf diese E-Mail.",
//   email_test_subject: "🧪 Test-E-Mail - Salon Elen",
//   email_test_title: "✅ E-Mail ist korrekt eingerichtet!",
//   email_test_body:
//     "Wenn Sie diese E-Mail sehen, funktioniert Resend korrekt.",
//   email_test_footer: "Gesendet von Salon Elen",

//   telegram_code_title: "Salon Elen - Verifizierungscode",
//   telegram_code_intro: "Ihr Bestätigungscode:",
//   telegram_code_expires: "Der Code ist {minutes} Minuten gültig.",
//   telegram_payment_status_paid: "Bezahlt",
//   telegram_payment_status_pending: "Zahlung ausstehend",
//   telegram_payment_status_failed: "Zahlungsfehler",
//   telegram_payment_status_refunded: "Erstattung",
//   telegram_payment_status_unknown: "Unbekannt",
//   telegram_admin_new_title: "NEUE BUCHUNG!",
//   telegram_admin_label_date: "Datum",
//   telegram_admin_label_time: "Uhrzeit",
//   telegram_admin_label_client: "Kunde",
//   telegram_admin_label_phone: "Telefon",
//   telegram_admin_label_email: "E-Mail",
//   telegram_admin_label_service: "Leistung",
//   telegram_admin_label_master: "Spezialist",
//   telegram_admin_label_payment: "Zahlung",
//   telegram_admin_label_id: "Buchungs-ID",
//   telegram_admin_open_button: "📊 In Admin öffnen",
//   telegram_client_status_title_pending: "🔔 Anfrage erhalten",
//   telegram_client_status_title_confirmed: "✅ Buchung bestätigt",
//   telegram_client_status_title_done: "🎉 Danke für Ihren Besuch",
//   telegram_client_status_title_canceled: "❌ Buchung storniert",
//   telegram_client_status_text_pending: "Wartet auf Bestätigung",
//   telegram_client_status_text_confirmed: "Bestätigt",
//   telegram_client_status_text_done: "Abgeschlossen",
//   telegram_client_status_text_canceled: "Storniert",
//   telegram_client_status_message_pending:
//     "Wir haben Ihre Anfrage erhalten. Ein Administrator wird Sie in Kürze kontaktieren.",
//   telegram_client_status_message_confirmed:
//     "Wir erwarten Sie! Bitte kommen Sie 5 Minuten vor dem Termin.",
//   telegram_client_status_message_done:
//     "Danke, dass Sie Salon Elen gewählt haben! Wir freuen uns auf Ihren nächsten Besuch.",
//   telegram_client_status_message_canceled:
//     "Wenn Sie den Termin verschieben möchten, kontaktieren Sie uns bitte.",
//   telegram_client_greeting: "Hallo, {name}!",
//   telegram_client_label_date: "Datum",
//   telegram_client_label_time: "Uhrzeit",
//   telegram_client_label_service: "Leistung",
//   telegram_client_label_master: "Spezialist",
//   telegram_client_label_status: "Status",
//   telegram_start_title: "Willkommen bei Salon Elen!",
//   telegram_start_prompt:
//     "Um den Bot zu nutzen, senden Sie Ihre Telefonnummer, indem Sie die Schaltfläche unten drücken.",
//   telegram_start_after:
//     "Danach erhalten Sie Bestätigungscodes für die Online-Buchung.",
//   telegram_button_send_phone: "📱 Telefonnummer senden",
//   telegram_contact_saved_title: "Telefonnummer gespeichert!",
//   telegram_contact_saved_phone: "Ihre Nummer: {phone}",
//   telegram_contact_saved_ready:
//     "Jetzt können Sie Telegram zur Bestätigung von Buchungen verwenden.",
//   telegram_request_contact_prompt: "Bitte senden Sie Ihre Telefonnummer:",

//   api_telegram_send_to_registered_missing_params:
//     "E-Mail und draftId sind erforderlich",
//   api_telegram_send_to_registered_user_not_found: "Benutzer nicht gefunden",
//   api_telegram_send_to_registered_code_not_found: "Code nicht gefunden",
//   api_telegram_send_to_registered_success: "Code gesendet",
//   api_telegram_send_to_registered_error: "Fehler beim Senden des Codes",
//   api_email_check_missing: "E-Mail fehlt",
//   api_email_check_invalid: "Ungültiges E-Mail-Format",
//   api_email_check_too_long: "E-Mail ist zu lang",
//   api_email_check_error: "Fehler bei der E-Mail-Prüfung",
//   api_google_oauth_not_configured:
//     "Google OAuth ist nicht konfiguriert. Bitte kontaktieren Sie den Administrator.",
//   api_google_oauth_missing_params: "E-Mail und draftId sind erforderlich",
//   api_google_oauth_draft_not_found: "Buchungsentwurf nicht gefunden",
//   api_google_oauth_email_mismatch:
//     "E-Mail stimmt nicht mit dem Entwurf überein",
//   api_google_oauth_generated: "OAuth-URL generiert",
//   api_google_oauth_error: "Fehler beim Generieren der OAuth-URL",
//   api_google_status_missing_params: "E-Mail und draftId sind erforderlich",
//   api_google_status_error: "Fehler beim Prüfen des Status",
//   api_google_callback_access_denied: "Zugriff abgelehnt",
//   api_google_callback_invalid_params: "Ungültige Parameter",
//   api_google_callback_invalid_state: "Ungültiger Verifizierungstoken",
//   api_google_callback_expired:
//     "Anfrage ist abgelaufen, bitte erneut versuchen",
//   api_google_callback_already_verified: "Bereits bestätigt",
//   api_google_callback_missing_email: "Google hat keine E-Mail zurückgegeben",
//   api_google_callback_email_mismatch:
//     "E-Mail stimmt nicht mit der Buchung überein",
//   api_google_callback_draft_not_found: "Buchungsentwurf nicht gefunden",
//   api_google_callback_slot_taken: "Die gewählte Zeit ist bereits belegt",
//   api_google_callback_error: "Fehler bei der Callback-Verarbeitung",
//   api_email_confirm_missing_fields: "Alle Felder sind erforderlich",
//   api_email_confirm_invalid_code: "Ungültiger Code oder E-Mail",
//   api_email_confirm_draft_not_found: "Entwurf nicht gefunden",
//   api_email_confirm_success: "Buchung bestätigt",
//   api_email_confirm_slot_taken:
//     "Die gewählte Zeit ist bereits belegt. Bitte wählen Sie eine andere Zeit.",
//   api_email_confirm_error: "Fehler bei der Codebestätigung",
//   api_payment_missing_params: "appointmentId und paymentMethod sind erforderlich",
//   api_payment_invalid_method: "Ungültige Zahlungsmethode",
//   api_payment_not_found: "Buchung nicht gefunden",
//   api_payment_unknown_service: "unbekannte Leistung",
//   api_payment_note_prefix: "Zahlungsmethode",
//   api_payment_card_redirect: "Weiterleitung zur Kartenzahlung",
//   api_payment_paypal_redirect: "Weiterleitung zu PayPal",
//   api_payment_cash: "Barzahlung im Salon",
//   api_payment_unknown_method: "Unbekannte Zahlungsmethode",
//   api_payment_error: "Fehler bei der Zahlungsabwicklung",
//   api_admin_clients_unauthorized: "Keine Berechtigung",
//   api_admin_clients_missing_fields: "Pflichtfelder fehlen",
//   api_admin_clients_duplicate_active:
//     "Ein Kunde mit dieser Telefonnummer oder E-Mail existiert bereits",
//   api_admin_clients_duplicate_deleted:
//     "Ein gelöschter Kunde mit dieser Telefonnummer oder E-Mail wurde gefunden",
//   api_admin_clients_duplicate_suggestion:
//     "Sie können den gelöschten Kunden wiederherstellen, statt einen neuen zu erstellen",
//   api_admin_clients_created: "Kunde erfolgreich erstellt",
//   api_admin_clients_error: "Fehler beim Erstellen des Kunden",

//   // ======= CONTACTS (NEW) =======
//   contacts_seo_description:
//     "Adresse, Telefon, Öffnungszeiten und Anfahrt. Online-Termin bei Salon Elen in Halle (Saale).",

//   contacts_subtitle: "Kontakt • Schnell & bequem",
//   contacts_title: "Kontakt",
//   contacts_intro:
//     "Wir helfen gern bei Fragen zu Leistungen, Zeiten und Terminen. Anrufen, E-Mail schreiben oder Route öffnen.",

//   contacts_quick_title: "Karte & Nachricht",

//   contacts_quick_call: "Anrufen",
//   contacts_quick_book: "Online-Termin",
//   contacts_quick_route: "Route",

//   contacts_details_title: "Salon-Daten",

//   contacts_open_maps: "In Google Maps öffnen",

//   contacts_map_title: "So finden Sie uns",
//   contacts_map_caption: "Karte öffnen und Route mit einem Klick starten.",
//   contacts_show_map: "Interaktive Karte anzeigen",
//   contacts_map_privacy:
//     "Die Karte wird erst nach Klick geladen. Google kann Cookies setzen und Daten gemäß eigener Richtlinien verarbeiten.",

//   contacts_address_label: "Adresse",
//   contacts_phone_label: "Telefon",
//   contacts_email_label: "E-Mail",
//   contacts_hours_label: "Öffnungszeiten",
//   contacts_hours_value: "Mo–Fr 10:00–19:00, Sa 10:00–16:00",

//   contacts_form_title: "Nachricht senden",
//   contacts_form_name: "Ihr Name",
//   contacts_form_phone: "Telefon (optional)",
//   contacts_form_message: "Nachricht",
//   contacts_form_send: "Senden",
//   contacts_form_note:
//     "Die Nachricht öffnet sich in Ihrem Mail-Programm. Falls nicht, schreiben Sie bitte direkt an elen69@web.de",



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
//   home_services_card2_text: "Aesthetics, hygiene and long-lasting coating.",
//   home_services_card3_title: "Make-up",
//   home_services_card3_text: "We create the right look for any occasion.",

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
//   footer_address_label: "Lessingstrasse 37, Halle (Saale)",

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

//   site_name: "Salon Elen",
//   booking_header_subtitle: "Premium Booking",
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
//   booking_master_hero_subtitle:
//     "Our experts will create the perfect look for you",
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
//   booking_calendar_legend_subtitle: "The higher the fill, the more bookings",

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
//   booking_calendar_slot_taken: "This slot was just booked by another client. Please select a different time.",
//   booking_calendar_reserve_error: "Reservation error. Please try again.",

//   // ======= BOOKING - CLIENT CHOICE PAGE =======
//   booking_client_choice_title: "How would you like to proceed?",
//   booking_client_choice_subtitle: "Choose your preferred registration method",
//   booking_client_choice_recommended: "Recommended",

//   booking_client_google_title: "Quick Registration",
//   booking_client_google_description:
//     "Sign in with Google and go straight to payment",
//   booking_client_google_benefit_1: "One click to payment",
//   booking_client_google_benefit_2: "Auto-fill data",
//   booking_client_google_benefit_3: "Safe and secure",
//   booking_client_google_benefit_4: "Save time",
//   booking_client_google_button: "Start with 1 click",
//   booking_client_google_security: "Protected by Google OAuth 2.0",
//   booking_client_google_connecting: "Connecting...",

//   booking_client_form_title: "Fill out form",
//   booking_client_form_description:
//     "Traditional method with full control over your data",
//   booking_client_form_benefit_1: "Full data control",
//   booking_client_form_benefit_2: "No Google account needed",
//   booking_client_form_benefit_3: "Familiar process",
//   booking_client_form_benefit_4: "Verification via Telegram",
//   booking_client_form_button: "Fill out form",
//   booking_client_form_security: "Confirmation via Telegram Bot",

//   booking_client_choice_footer: "Both methods are safe and reliable.",
//   booking_client_choice_footer_highlight:
//     "Choose the one that's more convenient for you.",

//   booking_client_popup_blocked:
//     "Could not open window. Please allow pop-ups in your browser.",
//   booking_client_google_error_init: "Google OAuth initialization error",
//   booking_client_auth_error: "Authorization error",
//   booking_client_auth_waiting: "Waiting for confirmation via Google...",

//   // ======= BOOKING - CLIENT FORM PAGE =======
//   booking_client_form_badge: "Step 4 — Your contact information",
//   booking_client_form_hero_title: "Online Booking",
//   booking_client_form_hero_subtitle:
//     "Provide your details so we can confirm your booking",

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
//   booking_client_form_email_error_note:
//     "If you make a mistake in the address, you can still come to the appointment, but you won't receive reminders and confirmations.",

//   booking_client_form_button_back: "Back",
//   booking_client_form_button_submit: "Book",
//   booking_client_form_button_submitting: "Verifying data…",

//   booking_client_form_info_title: "Why do we ask for your e-mail?",
//   booking_client_form_info_point_1: "We will send to your e-mail",
//   booking_client_form_info_point_1_highlight:
//     "booking confirmation and all details",
//   booking_client_form_info_point_2: "You will receive",
//   booking_client_form_info_point_2_highlight: "a reminder before your visit",
//   booking_client_form_info_point_3:
//     "We carefully handle personal data and use your e-mail only for your booking service",

//   booking_client_form_invalid_params:
//     "Invalid parameters. Please start the booking again.",
//   booking_client_form_invalid_return: "Return to service selection",

//   // ======= BOOKING - PHONE & BIRTHDAY PAGE (NEW) =======
//   phone_title: "Contact Information",
//   phone_subtitle: "Provide your contact details",
//   phone_label: "Phone",
//   phone_hint: "We will contact you to confirm the appointment",
//   phone_required: "Phone number is required",
//   phone_submit: "Continue",
//   phone_submitting: "Submitting...",
//   phone_privacy: "Your data is protected and not shared with third parties",
//   birthday_label: "Date of Birth",
//   birthday_hint:
//     "We need your date of birth so we can offer you a personalized discount for your celebration in the future!",

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
//   booking_verify_email_wrong_hint:
//     "If email is incorrect, go back to the previous step",
//   booking_verify_email_send_code: "Send code",
//   booking_verify_email_sending: "Sending…",
//   booking_verify_email_arrives_hint: "Code arrives within a few seconds",
//   booking_verify_email_enter_code: "Enter 6-digit code",
//   booking_verify_email_code_valid: "Code is valid for limited time",
//   booking_verify_email_confirm_code: "Confirm code",
//   booking_verify_email_checking: "Checking…",
//   booking_verify_email_resend: "Resend code",
//   booking_verify_email_sent_message: "Code sent to email",
//   booking_verify_email_api_missing_params: "Email and draftId are required",
//   booking_verify_email_api_draft_not_found: "Booking draft not found",
//   booking_verify_email_api_email_mismatch: "Email does not match the draft",
//   booking_verify_email_api_send_failed: "Failed to send code to email",
//   booking_verify_email_api_error: "Failed to send code",
//   booking_verify_info_title: "Secure Confirmation",
//   booking_verify_info_desc:
//     "We use a one-time code to protect your data and salon schedule",
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
//   booking_verify_info_support:
//     "If you have difficulties, contact us — we'll help complete the booking",
//   booking_verify_invalid_params:
//     "Invalid parameters. Please start the booking again.",
//   booking_verify_invalid_return: "Return to service selection",
//   booking_verify_google_title: "Confirm via Google",
//   booking_verify_google_desc:
//     "Sign in with your Google account for quick and secure booking confirmation.",
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
//   booking_verify_google_security_desc:
//     "We don't get access to your Google password. Official OAuth protocol is used.",
//   booking_verify_google_success:
//     "✅ Confirmed via Google! Redirecting to payment...",
//   booking_verify_google_preparing_window:
//     "🔐 Google will open in a new window...",
//   booking_verify_google_allow_popups:
//     "⚠️ Allow pop-ups and click the button below.",
//   booking_verify_telegram_title: "Confirm via Telegram",
//   booking_verify_telegram_desc_registered:
//     "Code sent to Telegram bot. Check messages and click the confirmation button.",
//   booking_verify_telegram_desc_unregistered:
//     "Telegram will open automatically. You'll get a code to enter or can confirm directly with a button in the bot.",
//   booking_verify_telegram_sending_code: "Sending code...",
//   booking_verify_telegram_open_button: "Open Telegram",
//   booking_verify_telegram_reopen_button: "Reopen Telegram",
//   booking_verify_telegram_waiting_bot:
//     "Waiting for confirmation in Telegram bot...",
//   booking_verify_telegram_waiting: "Waiting for confirmation...",
//   booking_verify_telegram_divider: "or",
//   booking_verify_telegram_enter_code: "Enter 6-digit code from Telegram",
//   booking_verify_telegram_code_placeholder: "000000",
//   booking_verify_telegram_code_valid: "Code is valid for 10 minutes.",
//   booking_verify_telegram_confirm_button: "Confirm code",
//   booking_verify_telegram_checking: "Checking...",
//   booking_verify_telegram_code_sent:
//     "✈️ Code sent to Telegram! Check the bot and click the confirmation button.",
//   booking_verify_telegram_opening:
//     "✈️ Telegram is opening... Waiting for confirmation.",
//   booking_verify_telegram_click_button:
//     "⚠️ Click the button below to open Telegram.",
//   booking_verify_telegram_success:
//     "✅ Confirmed via Telegram! Redirecting to payment...",
//   booking_verify_error_enter_code: "Enter 6-digit code",
//   booking_verify_success_redirect:
//     "Verification successful! Redirecting to payment...",
//   booking_email_otp_subject: "Booking confirmation code - Salon Elen",
//   booking_email_otp_title: "Confirmation code",
//   booking_email_otp_header_subtitle: "Booking confirmation",
//   booking_email_otp_greeting: "Hello!",
//   booking_email_otp_code_intro: "Your confirmation code to complete the booking:",
//   booking_email_otp_expires_label: "Important:",
//   booking_email_otp_expires_text: "The code is valid for {minutes} minutes.",
//   booking_email_otp_ignore:
//     "If you did not make a booking at Salon Elen, please ignore this email.",
//   booking_email_otp_footer_tagline: "Salon Elen - Your beauty, our care 💖",
//   booking_email_otp_footer_contact: "📧 booking@news.permanent-halle.de",
//   booking_email_otp_footer_note:
//     "This is an automated email. Please do not reply.",

//   booking_payment_badge: "Step 6 — Payment and Final Confirmation",
//   booking_payment_hero_title: "Complete Booking",
//   booking_payment_hero_subtitle:
//     "Choose payment method and confirm your booking",
//   booking_payment_appointment_id: "Booking number:",
//   booking_payment_method_title: "Payment Method",
//   booking_payment_onsite_title: "Pay at Salon",
//   booking_payment_onsite_desc: "On-site",
//   booking_payment_onsite_benefit_1: "Cash or card at salon",
//   booking_payment_onsite_benefit_2: "No prepayment",
//   booking_payment_onsite_benefit_3: "Pay after service",
//   booking_payment_online_title: "Online Payment",
//   booking_payment_online_desc: "Coming soon",
//   // booking_payment_online_benefit_1: "Card, Apple Pay, Google Pay",
//   // booking_payment_online_benefit_2: "In development",
//   // booking_payment_online_benefit_3: "Booking will be confirmed anyway",
//   // Info block - CURRENT text
//   booking_payment_info_how_works_title: "How does it work?",
//   booking_payment_info_how_works_desc: "The system has already created an appointment in the salon schedule. You can pay online with card (Stripe) or via PayPal, or pay cash/card at the salon after the service.",
//   booking_payment_info_title: "How it works?",
//   booking_payment_info_desc:
//     "The system has already created an appointment in the salon schedule. Payment is recorded on the salon side. Online payment will be added later.",
//   booking_payment_confirm_button: "Confirm Booking",
//   booking_payment_confirm_terms:
//     'By clicking "Confirm Booking", you agree to the salon terms',
//   booking_payment_summary_title: "Booking Summary",
//   booking_payment_summary_visit: "Your visit to SalonElen",
//   booking_payment_summary_service: "Service from booking",
//   booking_payment_summary_master: "Master from booking",
//   booking_payment_summary_datetime: "Date and time by ID:",
//   booking_payment_summary_address: "Salon address",
//   booking_payment_summary_cancellation_title: "Cancellation Policy",
//   booking_payment_summary_cancellation_desc:
//     "If you cannot make it, please cancel in advance — this will free up time for other salon guests.",
//   booking_payment_summary_future_note:
//     "After launching online payment, a payment method selection block and payment status will appear here",
//   booking_payment_success_title: "Booking Confirmed!",
//   booking_payment_success_desc:
//     "Your booking has been successfully confirmed. Payment will be made at the salon.",
//   booking_payment_success_home: "Go to Home",
//   booking_payment_success_calendar: "Add to Google Calendar",
//   booking_payment_success_apple_calendar: "Add to Apple Calendar",
//   booking_payment_success_new: "Make New Booking",
//   booking_payment_error_title: "Error Proceeding to Payment",
//   booking_payment_error_desc:
//     "We couldn't find the booking ID. Perhaps the link is outdated or the email confirmation step was skipped.",
//   booking_payment_error_return: "Return to Booking",
//   booking_payment_error_missing:
//     "Booking ID is missing. Please start the booking again.",
//   booking_success_page_title: "Online Booking",
//   booking_success_page_subtitle: "Success",
//   booking_success_loading: "Loading...",
//   booking_success_loading_data: "Loading data…",
//   booking_success_error_title: "Error",
//   booking_success_error_not_found: "Booking ID not found",
//   booking_success_error_load_failed: "Failed to load booking data",
//   booking_success_error_return: "Return to Booking",
//   booking_success_title: "Booking Confirmed!",
//   booking_success_desc:
//     "Your booking has been successfully created. We've sent a confirmation to your email.",
//   booking_success_details_title: "Booking Details:",
//   booking_success_details_name: "Name",
//   booking_success_details_email: "Email",
//   booking_success_details_phone: "Phone",
//   booking_success_details_datetime: "Date and Time",
//   booking_success_button_new: "Create New Booking",
//   booking_success_button_home: "Go to Home",

//   calendar_title_appointment_in: "at SalonElen",
//   calendar_description_title: "Appointment at SalonElen Beauty Salon",
//   calendar_service: "Service:",
//   calendar_master: "Master:",
//   calendar_date: "Date:",
//   calendar_time: "Time:",
//   calendar_duration: "Duration:",
//   calendar_duration_minutes: "minutes",
//   calendar_appointment_id: "Appointment ID:",
//   calendar_address: "Address:",
//   calendar_contacts: "Contacts:",
//   calendar_phone: "Phone:",
//   calendar_reschedule_notice:
//     "If you need to reschedule or cancel your appointment, please contact us in advance.",
//   calendar_see_you: "See you soon! ✨",
//   calendar_location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",

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

//   // SMS VERIFICATION PAGE
//   booking_sms_verify_title: "Phone Verification",
//   booking_sms_verify_subtitle: "We'll send you a 4-digit PIN code via SMS",
//   booking_sms_verify_phone_label: "Phone Number",
//   booking_sms_verify_phone_placeholder: "+49 177 899 5106",
//   booking_sms_verify_phone_hint:
//     "Format: +[country code][number] (e.g.: +4917789951064)",
//   booking_sms_verify_phone_required: "Enter phone number",
//   booking_sms_verify_send_pin: "Send PIN Code",
//   booking_sms_verify_sending: "Sending...",
//   booking_sms_verify_pin_validity: "PIN code is valid for 10 minutes",

//   booking_sms_verify_pin_title: "Enter PIN Code",
//   booking_sms_verify_pin_subtitle: "PIN code sent to",
//   booking_sms_verify_pin_label: "PIN Code",
//   booking_sms_verify_pin_placeholder: "0000",
//   booking_sms_verify_pin_hint: "Enter 4-digit PIN code from SMS",
//   booking_sms_verify_confirm: "Confirm",
//   booking_sms_verify_checking: "Checking...",
//   booking_sms_verify_resend: "Resend PIN Code",
//   booking_sms_verify_change_phone: "Change Phone Number",
//   booking_sms_verify_pin_validity_note:
//     "PIN code is valid for 10 minutes • Maximum 3 attempts",

//   booking_sms_verify_error_title: "⚠️ Error",
//   booking_sms_verify_error_missing_params:
//     "Insufficient parameters. Please start the booking again.",
//   booking_sms_verify_error_return: "Return to Booking",

//   booking_sms_verify_contact: "Questions? Contact us: +49 177 899 5106",

//   // SMS DETAILS PAGE
//   booking_sms_details_title: "Your Details",
//   booking_sms_details_subtitle:
//     "Please provide your name and additional information",
//   booking_sms_details_name_label: "Your Name",
//   booking_sms_details_name_placeholder: "John Doe",
//   booking_sms_details_name_required: "Name is required",
//   booking_sms_details_email_label: "Email",
//   booking_sms_details_email_placeholder: "john@example.com",
//   booking_sms_details_email_hint: "For confirmation and reminders",
//   booking_sms_details_birth_label: "Date of Birth",
//   booking_sms_details_birth_hint:
//     "We need your date of birth so we can offer you a personalized discount for your celebration in the future!",
//   booking_sms_details_submit: "Continue to Payment",
//   booking_sms_details_submitting: "Saving...",
//   booking_sms_details_privacy:
//     "Your data is protected and not shared with third parties",

//   booking_sms_details_error_title: "⚠️ Error",
//   booking_sms_details_error_missing_id:
//     "Registration ID is missing. Please start the booking again.",
//   booking_sms_details_error_return: "Return to Booking",

//   booking_sms_details_contact: "Questions? Contact us: +49 177 899 5106",

//   // SMS CARD
//   booking_client_sms_title: "By Phone (SMS)",
//   booking_client_sms_description: "Get PIN code via SMS",
//   booking_client_sms_benefit_1: "PIN code via SMS",
//   booking_client_sms_benefit_2: "No email registration",
//   booking_client_sms_benefit_3: "Fast and secure",
//   booking_client_sms_benefit_4: "4-digit code",
//   booking_client_sms_button: "Sign in via SMS",
//   booking_client_sms_security: "Infobip SMS",

//   // STRIPE PAYMENT
//   booking_payment_stripe_title: "Card Payment",
//   booking_payment_stripe_desc: "Secure payment via Stripe",
//   booking_payment_stripe_benefit_1: "All cards: Visa, MasterCard, AmEx",
//   booking_payment_stripe_benefit_2: "Instant confirmation",
//   booking_payment_stripe_benefit_3: "3D Secure protection",
//   booking_payment_stripe_amount: "Amount to pay",
//   booking_payment_stripe_secure: "Secure",
//   booking_payment_stripe_processing: "Processing payment...",
//   booking_payment_stripe_pay: "Pay",
//   booking_payment_stripe_note: "Your payment data is protected by 256-bit encryption",

//   // PAYPAL PAYMENT
//   booking_payment_paypal_title: "PayPal",
//   booking_payment_paypal_desc: "Pay with PayPal account",
//   booking_payment_paypal_benefit_1: "Fast payment via PayPal",
//   booking_payment_paypal_benefit_2: "Buyer protection",
//   booking_payment_paypal_benefit_3: "No fees",
//   booking_payment_paypal_amount: "Amount to pay",
//   booking_payment_paypal_secure: "Secure",
//   booking_payment_paypal_note: "After clicking, you will be redirected to the secure PayPal page",
//   booking_payment_paypal_footer: "Payments are processed through PayPal. Your data is protected.",

//   // ======= BOOKING - TELEGRAM CARD =======
//   booking_client_telegram_title: "Telegram",
//   booking_client_telegram_description: "Quick registration via Telegram bot",
//   booking_client_telegram_benefit_1: "Code in Telegram",
//   booking_client_telegram_benefit_2: "No email registration",
//   booking_client_telegram_benefit_3: "Fast and secure",
//   booking_client_telegram_benefit_4: "6-digit code",
//   booking_client_telegram_button: "Sign in via Telegram",
//   booking_client_telegram_security: "Telegram Bot verification",

//   // ======= BOOKING - TELEGRAM VERIFICATION PAGE =======
//   booking_telegram_verify_title: "Registration via Telegram",
//   booking_telegram_verify_subtitle: "Follow 3 simple steps",

//   booking_telegram_verify_step1_title: "Step 1: Phone number",
//   booking_telegram_verify_step1_subtitle: "Enter your phone number",
//   booking_telegram_verify_phone_label: "Phone number",
//   booking_telegram_verify_phone_placeholder: "+49 177 899 5106",
//   booking_telegram_verify_phone_hint: "Format: +[country code][number]",
//   booking_telegram_verify_phone_required: "Enter phone number",
//   booking_telegram_verify_send_code: "Send code",
//   booking_telegram_verify_sending: "Sending...",

//   booking_telegram_verify_step2_title: "Step 2: Code from Telegram",
//   booking_telegram_verify_step2_subtitle: "Enter the code we sent you in Telegram",
//   booking_telegram_verify_code_label: "Confirmation code",
//   booking_telegram_verify_code_placeholder: "000000",
//   booking_telegram_verify_code_hint: "6-digit code from Telegram bot",
//   booking_telegram_verify_code_required: "Enter 6-digit code",
//   booking_telegram_verify_check_code: "Confirm code",
//   booking_telegram_verify_checking: "Checking...",
//   booking_telegram_verify_resend: "Resend code",

//   booking_telegram_verify_step3_title: "Step 3: Additional information",
//   booking_telegram_verify_step3_subtitle: "Fill in your details (optional)",
//   booking_telegram_verify_email_label: "Email",
//   booking_telegram_verify_email_placeholder: "your@email.com",
//   booking_telegram_verify_email_hint: "For confirmation and reminders",
//   booking_telegram_verify_birth_label: "Date of birth",
//   booking_telegram_verify_birth_hint: "For personalized discounts for your celebration",
//   booking_telegram_verify_complete: "Complete registration",
//   booking_telegram_verify_completing: "Saving...",

//   booking_telegram_verify_privacy: "Your data is protected and not shared with third parties",
//   booking_telegram_verify_error_title: "⚠️ Error",
//   booking_telegram_verify_error_missing: "Insufficient parameters. Please start the booking again.",
//   booking_telegram_verify_error_return: "Return to booking",

//   booking_telegram_modal_title: "Telegram bot registration",
//   booking_telegram_modal_subtitle:
//     "To receive verification codes, you need to register in our Telegram bot",
//   booking_telegram_modal_phone_label: "Your number:",
//   booking_telegram_modal_how_title: "How to register:",
//   booking_telegram_modal_step_open_bot:
//     "Click the button below to open the Telegram bot",
//   booking_telegram_modal_step_register:
//     "The bot will automatically register your number",
//   booking_telegram_modal_step_done: "Return here and click",
//   booking_telegram_modal_button_open: "Open Telegram bot",
//   booking_telegram_modal_button_done: "I'm registered",
//   booking_telegram_modal_note:
//     "The verification code will arrive in the Telegram bot within a few seconds",

//   booking_telegram_verify_error_send: "Failed to send code",
//   booking_telegram_verify_error_expired: "Code expired. Request a new code.",
//   booking_telegram_verify_error_invalid_code:
//     "Invalid code. Check the code in Telegram and try again.",
//   booking_telegram_verify_error_session: "Session not found. Please start over.",
//   booking_telegram_verify_error_create: "Failed to create booking",
//   booking_telegram_verify_error_complete: "Failed to complete registration",
//   booking_telegram_verify_error_check: "Failed to verify code",
//   booking_telegram_verify_success_sent: "Code sent to Telegram!",
//   booking_telegram_verify_success_verified: "Code verified!",
//   booking_telegram_verify_success_creating: "Creating booking...",
//   booking_telegram_verify_back: "Back",

//   booking_confirmation_error_title: "Error",
//   booking_confirmation_error_missing_id: "Booking ID is missing",
//   booking_confirmation_error_cta: "Create a new booking",
//   booking_confirmation_title: "Booking created!",
//   booking_confirmation_subtitle:
//     "Your booking was created successfully. We'll contact you to confirm.",
//   booking_confirmation_details_number_label: "Booking number",
//   booking_confirmation_details_status_label: "Status",
//   booking_confirmation_status_pending: "Pending confirmation",
//   booking_confirmation_action_home: "Back to home",
//   booking_confirmation_action_new: "Create a new booking",
//   booking_confirmation_notice_title: "Please note:",
//   booking_confirmation_notice_body:
//     "We will contact you shortly to confirm the booking. If you have questions, please call us or email us.",
//   booking_confirmation_loading: "Loading...",

//   booking_client_page_title: "Choose registration | Salon Elen",
//   booking_client_page_description:
//     "Choose a registration method to complete booking",
//   booking_client_params_error_title: "Parameter error",
//   booking_client_params_error_text: "Required booking parameters are missing",
//   booking_client_params_error_return: "Back to start",

//   booking_client_step_start_label: "Start:",
//   booking_client_step_end_label: "End:",
//   booking_client_step_name_label: "Your name",
//   booking_client_step_name_placeholder: "For example, Anna",
//   booking_client_step_phone_label: "Phone",
//   booking_client_step_phone_placeholder: "+49…",
//   booking_client_step_email_label: "Email (optional)",
//   booking_client_step_email_placeholder: "name@example.com",
//   booking_client_step_notes_label: "Notes (optional)",
//   booking_client_step_notes_placeholder: "Booking comment",
//   booking_client_step_back: "Back",
//   booking_client_step_continue: "Continue",

//   email_service_not_configured: "Email service is not configured",
//   email_send_unknown_error: "Unknown email error",
//   email_status_subject_pending: "🔔 New booking - Pending confirmation",
//   email_status_subject_confirmed: "✅ Booking confirmed - Salon Elen",
//   email_status_subject_done: "🎉 Thank you for your visit - Salon Elen",
//   email_status_subject_canceled: "❌ Booking canceled - Salon Elen",
//   email_status_text_pending: "Pending confirmation",
//   email_status_text_confirmed: "Confirmed",
//   email_status_text_done: "Completed",
//   email_status_text_canceled: "Canceled",
//   email_status_message_pending:
//     "We received your booking request. Our administrator will contact you shortly to confirm.",
//   email_status_message_confirmed_intro:
//     "Great news! Your booking is confirmed.",
//   email_status_message_confirmed_wait:
//     "We look forward to seeing you on <strong>{date}</strong>",
//   email_status_message_confirmed_notice_title: "✨ Important:",
//   email_status_message_confirmed_notice_text:
//     "Please arrive 5 minutes before your appointment.",
//   email_status_message_done_intro:
//     "Thank you for choosing Salon Elen! 💖",
//   email_status_message_done_outro:
//     "We hope you loved the result. We'd be happy to see you again!",
//   email_status_message_done_tip_title: "📅 Tip:",
//   email_status_message_done_tip_text:
//     "To maintain results, we recommend booking again in 3-4 weeks.",
//   email_status_message_canceled_intro:
//     "Unfortunately, your booking was canceled.",
//   email_status_message_canceled_contact_intro:
//     "If this was a mistake or you want to reschedule, please contact us:",
//   email_status_message_canceled_contact:
//     "📞 <strong>Phone:</strong> +38 (000) 000-00-00<br>💬 <strong>Telegram:</strong> @salon_elen",
//   email_status_html_title: "Salon Elen - Notification",
//   email_status_header_subtitle: "Booking notification",
//   email_status_greeting: "Hello, <strong>{name}</strong>!",
//   email_status_details_title: "📋 Booking details",
//   email_status_details_status_label: "Status:",
//   email_status_details_service_label: "Service:",
//   email_status_details_master_label: "Master:",
//   email_status_details_datetime_label: "Date and time:",
//   email_status_cta_button: "📅 Book again",
//   email_status_footer_tagline: "Salon Elen - Your beauty, our care 💖",
//   email_status_footer_address: "Lessingstrasse 37, 06114 Halle Saale",
//   email_status_footer_contacts: "📞 +49 177 899 51 06 | 📧 elen69@web.de",
//   email_status_footer_note:
//     "This is an automated notification. Please do not reply to this email.",
//   email_test_subject: "🧪 Test email - Salon Elen",
//   email_test_title: "✅ Email is set up correctly!",
//   email_test_body:
//     "If you can see this email, Resend is working correctly.",
//   email_test_footer: "Sent from Salon Elen",

//   telegram_code_title: "Salon Elen - Verification code",
//   telegram_code_intro: "Your confirmation code:",
//   telegram_code_expires: "The code is valid for {minutes} minutes.",
//   telegram_payment_status_paid: "Paid",
//   telegram_payment_status_pending: "Payment pending",
//   telegram_payment_status_failed: "Payment failed",
//   telegram_payment_status_refunded: "Refunded",
//   telegram_payment_status_unknown: "Unknown",
//   telegram_admin_new_title: "NEW BOOKING!",
//   telegram_admin_label_date: "Date",
//   telegram_admin_label_time: "Time",
//   telegram_admin_label_client: "Client",
//   telegram_admin_label_phone: "Phone",
//   telegram_admin_label_email: "Email",
//   telegram_admin_label_service: "Service",
//   telegram_admin_label_master: "Master",
//   telegram_admin_label_payment: "Payment",
//   telegram_admin_label_id: "Booking ID",
//   telegram_admin_open_button: "📊 Open in admin",
//   telegram_client_status_title_pending: "🔔 Request received",
//   telegram_client_status_title_confirmed: "✅ Booking confirmed",
//   telegram_client_status_title_done: "🎉 Thank you for your visit",
//   telegram_client_status_title_canceled: "❌ Booking canceled",
//   telegram_client_status_text_pending: "Pending confirmation",
//   telegram_client_status_text_confirmed: "Confirmed",
//   telegram_client_status_text_done: "Completed",
//   telegram_client_status_text_canceled: "Canceled",
//   telegram_client_status_message_pending:
//     "We received your request. An administrator will contact you shortly.",
//   telegram_client_status_message_confirmed:
//     "We look forward to seeing you! Please arrive 5 minutes early.",
//   telegram_client_status_message_done:
//     "Thank you for choosing Salon Elen! We'd love to see you again.",
//   telegram_client_status_message_canceled:
//     "If you'd like to reschedule, please contact us.",
//   telegram_client_greeting: "Hello, {name}!",
//   telegram_client_label_date: "Date",
//   telegram_client_label_time: "Time",
//   telegram_client_label_service: "Service",
//   telegram_client_label_master: "Master",
//   telegram_client_label_status: "Status",
//   telegram_start_title: "Welcome to Salon Elen!",
//   telegram_start_prompt:
//     "To use the bot, send your phone number using the button below.",
//   telegram_start_after:
//     "After that, you will receive confirmation codes for online booking.",
//   telegram_button_send_phone: "📱 Send phone number",
//   telegram_contact_saved_title: "Phone number saved!",
//   telegram_contact_saved_phone: "Your number: {phone}",
//   telegram_contact_saved_ready:
//     "Now you can use Telegram to confirm bookings on the website.",
//   telegram_request_contact_prompt: "Please send your phone number:",

//   api_telegram_send_to_registered_missing_params:
//     "Email and draftId are required",
//   api_telegram_send_to_registered_user_not_found: "User not found",
//   api_telegram_send_to_registered_code_not_found: "Code not found",
//   api_telegram_send_to_registered_success: "Code sent",
//   api_telegram_send_to_registered_error: "Failed to send code",
//   api_email_check_missing: "Email is missing",
//   api_email_check_invalid: "Invalid email format",
//   api_email_check_too_long: "Email is too long",
//   api_email_check_error: "Email validation error",
//   api_google_oauth_not_configured:
//     "Google OAuth is not configured. Please contact the administrator.",
//   api_google_oauth_missing_params: "Email and draftId are required",
//   api_google_oauth_draft_not_found: "Booking draft not found",
//   api_google_oauth_email_mismatch: "Email does not match the draft",
//   api_google_oauth_generated: "OAuth URL generated",
//   api_google_oauth_error: "Failed to generate OAuth URL",
//   api_google_status_missing_params: "Email and draftId are required",
//   api_google_status_error: "Failed to check status",
//   api_google_callback_access_denied: "Access denied",
//   api_google_callback_invalid_params: "Invalid parameters",
//   api_google_callback_invalid_state: "Invalid verification token",
//   api_google_callback_expired: "Request expired, please try again",
//   api_google_callback_already_verified: "Already verified",
//   api_google_callback_missing_email: "Google did not return an email",
//   api_google_callback_email_mismatch: "Email does not match the booking",
//   api_google_callback_draft_not_found: "Booking draft not found",
//   api_google_callback_slot_taken: "Selected time is already taken",
//   api_google_callback_error: "Callback processing error",
//   api_email_confirm_missing_fields: "All fields are required",
//   api_email_confirm_invalid_code: "Invalid code or email",
//   api_email_confirm_draft_not_found: "Draft not found",
//   api_email_confirm_success: "Booking confirmed",
//   api_email_confirm_slot_taken:
//     "Selected time is already taken. Please choose another time.",
//   api_email_confirm_error: "Code confirmation error",
//   api_payment_missing_params: "appointmentId and paymentMethod are required",
//   api_payment_invalid_method: "Invalid payment method",
//   api_payment_not_found: "Booking not found",
//   api_payment_unknown_service: "unknown service",
//   api_payment_note_prefix: "Payment method",
//   api_payment_card_redirect: "Redirecting to card payment",
//   api_payment_paypal_redirect: "Redirecting to PayPal",
//   api_payment_cash: "Cash payment at the salon",
//   api_payment_unknown_method: "Unknown payment method",
//   api_payment_error: "Payment processing error",
//   api_admin_clients_unauthorized: "Unauthorized",
//   api_admin_clients_missing_fields: "Missing required fields",
//   api_admin_clients_duplicate_active:
//     "A client with this phone or email already exists",
//   api_admin_clients_duplicate_deleted:
//     "A deleted client with this phone or email was found",
//   api_admin_clients_duplicate_suggestion:
//     "You can restore the deleted client instead of creating a new one",
//   api_admin_clients_created: "Client created successfully",
//   api_admin_clients_error: "Failed to create client",

//   // ======= CONTACTS (NEW) =======
//   contacts_seo_description:
//     "Address, phone, opening hours and directions. Book online with Salon Elen in Halle (Saale).",

//   contacts_subtitle: "Contact • Fast & easy",
//   contacts_title: "Contact",
//   contacts_intro:
//     "We can help with services, timing and booking. Call, email us, or open directions instantly.",

//   contacts_quick_title: "Map & message",

//   contacts_quick_call: "Call",
//   contacts_quick_book: "Book online",
//   contacts_quick_route: "Directions",

//   contacts_details_title: "Salon details",

//   contacts_open_maps: "Open in Google Maps",

//   contacts_map_title: "How to find us",
//   contacts_map_caption: "Open the map and start navigation in one click.",
//   contacts_show_map: "Show interactive map",
//   contacts_map_privacy:
//     "The map loads only after you click. Google may set cookies and process data under its policies.",

//   contacts_address_label: "Address",
//   contacts_phone_label: "Phone",
//   contacts_email_label: "Email",
//   contacts_hours_label: "Opening hours",
//   contacts_hours_value: "Mon–Fri 10:00–19:00, Sat 10:00–16:00",

//   contacts_form_title: "Send a message",
//   contacts_form_name: "Your name",
//   contacts_form_phone: "Phone (optional)",
//   contacts_form_message: "Message",
//   contacts_form_send: "Send",
//   contacts_form_note:
//     "Your email app will open with a draft. If it doesn’t, email us directly at elen69@web.de",




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



