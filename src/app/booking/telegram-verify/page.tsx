// src/app/booking/telegram-verify/page.tsx
// ✅ С АВТОЗАПОЛНЕНИЕМ НОМЕРА ТЕЛЕФОНА из localStorage
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTelegram } from 'react-icons/fa';
import { Phone, Shield, Mail, Calendar, Send, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BookingAnimatedBackground } from '@/components/layout/BookingAnimatedBackground';
import PremiumProgressBar from '@/components/PremiumProgressBar';
import { useTranslations } from '@/i18n/useTranslations';
import { TelegramRegistrationModal } from '@/components/TelegramRegistrationModal';

export default function TelegramVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // Параметры бронирования
  const serviceId = searchParams.get('s') || '';
  const masterId = searchParams.get('m') || '';
  const startAt = searchParams.get('start') || '';
  const endAt = searchParams.get('end') || '';
  const selectedDate = searchParams.get('d') || '';

  // ✅ ВСЕ ХУКИ НАВЕРХУ
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sessionId, setSessionId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // ✅ АВТОЗАПОЛНЕНИЕ НОМЕРА ТЕЛЕФОНА ИЗ localStorage
  useEffect(() => {
    // Загружаем сохраненный номер при монтировании
    const savedPhone = localStorage.getItem('booking_phone');
    if (savedPhone) {
      console.log('[Phone Autofill] Loaded from localStorage:', savedPhone);
      setPhone(savedPhone);
    }
  }, []);

  // Проверка параметров
  const hasInvalidParams = !serviceId || !masterId || !startAt || !endAt || !selectedDate;

  if (hasInvalidParams) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-400">
            {t('booking_telegram_verify_error_title')}
          </h1>
          <p className="mb-6 text-slate-300">
            {t('booking_telegram_verify_error_missing')}
          </p>
          <Link
            href="/booking/services"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600"
          >
            {t('booking_telegram_verify_error_return')}
          </Link>
        </div>
      </div>
    );
  }

  const BOOKING_STEPS = [
    { id: 'services', label: t('booking_step_services'), icon: '✨' },
    { id: 'master', label: t('booking_step_master'), icon: '👤' },
    { id: 'calendar', label: t('booking_step_date'), icon: '📅' },
    { id: 'client', label: t('booking_step_client'), icon: '📝' },
    { id: 'verify', label: t('booking_step_verify'), icon: '✓' },
    { id: 'payment', label: t('booking_step_payment'), icon: '💳' },
  ];

  // Шаг 1: Отправка кода
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // ✅ СОХРАНЯЕМ НОМЕР В localStorage ПРИ ОТПРАВКЕ КОДА
      localStorage.setItem('booking_phone', phone);
      console.log('[Phone Autofill] Saved to localStorage:', phone);

      console.log('[Telegram Verify] Checking registration for:', phone);
      
      const checkRes = await fetch(`/api/telegram/check-registration?phone=${encodeURIComponent(phone)}`);
      const checkData = await checkRes.json();
      
      if (!checkData.registered) {
        console.log('[Telegram Verify] Phone not registered, showing modal');
        setShowRegistrationModal(true);
        setLoading(false);
        return;
      }
      
      console.log('[Telegram Verify] Phone registered, sending code');

      const res = await fetch('/api/telegram/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          serviceId,
          masterId,
          startAt,
          endAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка отправки кода');
      }

      setSessionId(data.sessionId);
      setSuccess('✓ Код отправлен в Telegram!');
      
      setTimeout(() => {
        setStep(2);
        setSuccess(null);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2: Проверка кода
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('[Frontend] Verifying code:', code);
      
      const res = await fetch('/api/telegram/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          code: code.trim(),
        }),
      });

      const data = await res.json();
      console.log('[Frontend] Verify response:', data);

      if (!res.ok) {
        if (data.error?.includes('expired')) {
          throw new Error('Код истёк. Запросите новый код.');
        }
        if (data.error?.includes('Invalid code')) {
          throw new Error('Неверный код. Проверьте код в Telegram и попробуйте снова.');
        }
        if (data.error?.includes('Session not found')) {
          throw new Error('Сессия не найдена. Начните заново.');
        }
        throw new Error(data.error || 'Неверный код');
      }

      setSuccess('✓ Код подтверждён!');

      if (data.userData && data.userData.email) {
        console.log('[Frontend] Existing user detected, auto-creating appointment');

        setTimeout(async () => {
          setSuccess('Создание записи...');
          
          try {
            const completeRes = await fetch('/api/telegram/complete-registration', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            });

            const completeData = await completeRes.json();

            if (!completeRes.ok) {
              throw new Error(completeData.error || 'Ошибка создания записи');
            }

            console.log('[Frontend] Redirecting to payment:', completeData.appointmentId);
            router.push(`/booking/payment?appointment=${completeData.appointmentId}`);
          } catch (err) {
            console.error('[Frontend] Auto-complete error:', err);
            setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
            setLoading(false);
          }
        }, 1000);
      } else {
        console.log('[Frontend] New user, showing step 3');
        setTimeout(() => {
          setStep(3);
          setSuccess(null);
          setLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error('[Frontend] Verify error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка проверки кода');
      setLoading(false);
    }
  };

  // Шаг 3: Завершение регистрации
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/telegram/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email: email || null,
          birthDate: birthDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка завершения регистрации');
      }

      router.push(`/booking/payment?appointment=${data.appointmentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
    } finally {
      setLoading(false);
    }
  };

  // Повторная отправка кода
  const handleResendCode = () => {
    setCode('');
    setStep(1);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

      <BookingAnimatedBackground />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
          <div className="mb-3 flex items-center gap-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg">
                <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
                  <span className="text-xl">💎</span>
                </div>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15]">
                  Salon Elen
                </span>
                <span className="block text-xs text-cyan-400/85">
                  Premium Beauty Experience
                </span>
              </div>
            </Link>
          </div>
          <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
        </div>
      </header>

      <div className="h-[120px]" />

      <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="relative rounded-[32px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(42,171,238,0.5)]">
            <div className="rounded-[30px] bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl">
              <div className="mb-8 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-4 flex justify-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-400/70 bg-gradient-to-br from-blue-400/25 to-slate-900">
                    <FaTelegram className="h-12 w-12 text-[#2AABEE]" />
                  </div>
                </motion.div>

                <h1 className="brand-script mb-2 text-3xl font-bold">
                  <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-cyan-200 bg-clip-text text-transparent">
                    {t('booking_telegram_verify_title')}
                  </span>
                </h1>
                <p className="text-sm text-slate-300">
                  {t('booking_telegram_verify_subtitle')}
                </p>
              </div>

              <div className="mb-8 flex items-center justify-center gap-3">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <motion.div
                      animate={{
                        scale: step >= s ? 1 : 0.8,
                        backgroundColor: step >= s ? '#2AABEE' : '#334155',
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
                    >
                      {step > s ? <CheckCircle className="h-6 w-6" /> : s}
                    </motion.div>
                    {s < 3 && (
                      <div
                        className={`h-1 w-12 rounded-full transition-colors ${
                          step > s ? 'bg-blue-400' : 'bg-slate-700'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200"
                  >
                    ✓ {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* STEP 1: PHONE */}
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSendCode}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="mb-2 font-bold text-blue-300">
                        {t('booking_telegram_verify_step1_title')}
                      </h3>
                      <p className="mb-4 text-sm text-slate-400">
                        {t('booking_telegram_verify_step1_subtitle')}
                      </p>

                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        {t('booking_telegram_verify_phone_label')}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setError(null);
                          }}
                          placeholder={t('booking_telegram_verify_phone_placeholder')}
                          required
                          className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {t('booking_telegram_verify_phone_hint')}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !phone}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          {t('booking_telegram_verify_sending')}
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          {t('booking_telegram_verify_send_code')}
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {/* STEP 2: CODE */}
                {step === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleVerifyCode}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="mb-2 font-bold text-blue-300">
                        {t('booking_telegram_verify_step2_title')}
                      </h3>
                      <p className="mb-4 text-sm text-slate-400">
                        {t('booking_telegram_verify_step2_subtitle')}
                      </p>

                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        {t('booking_telegram_verify_code_label')}
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setError(null);
                        }}
                        placeholder={t('booking_telegram_verify_code_placeholder')}
                        required
                        maxLength={6}
                        className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 px-4 text-center text-2xl font-bold tracking-widest text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
                      />
                      <p className="mt-2 text-xs text-slate-400">
                        {t('booking_telegram_verify_code_hint')}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
                      >
                        <ArrowLeft className="h-5 w-5" />
                        Назад
                      </button>

                      <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <>
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            {t('booking_telegram_verify_checking')}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            {t('booking_telegram_verify_check_code')}
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading}
                      className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:opacity-60"
                    >
                      {t('booking_telegram_verify_resend')}
                    </button>
                  </motion.form>
                )}

                {/* STEP 3: INFO */}
                {step === 3 && (
                  <motion.form
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleCompleteRegistration}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="mb-2 font-bold text-blue-300">
                        {t('booking_telegram_verify_step3_title')}
                      </h3>
                      <p className="mb-4 text-sm text-slate-400">
                        {t('booking_telegram_verify_step3_subtitle')}
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            {t('booking_telegram_verify_email_label')}
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder={t('booking_telegram_verify_email_placeholder')}
                              className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            {t('booking_telegram_verify_email_hint')}
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            {t('booking_telegram_verify_birth_label')}
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
                            <input
                              type="date"
                              value={birthDate}
                              onChange={(e) => setBirthDate(e.target.value)}
                              className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            {t('booking_telegram_verify_birth_hint')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
                      <p className="text-xs text-purple-200">
                        <Shield className="mr-2 inline-block h-3 w-3" />
                        {t('booking_telegram_verify_privacy')}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
                      >
                        <ArrowLeft className="h-5 w-5" />
                        Назад
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <>
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            {t('booking_telegram_verify_completing')}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            {t('booking_telegram_verify_complete')}
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>

      <TelegramRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          handleSendCode({ preventDefault: () => {} } as React.FormEvent);
        }}
        botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'salon_elen_bot'}
        phone={phone}
      />

      <style jsx global>{`
        .brand-script {
          font-family: 'Cormorant Infant', 'Playfair Display', serif;
          font-style: italic;
          font-weight: 600;
        }
        @keyframes bg-slide {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
        }
      `}</style>
    </div>
  );
}




//---------добавляю автозаполнение телефона--------
// // src/app/booking/telegram-verify/page.tsx
// // ✅ ФИНАЛЬНАЯ ВЕРСИЯ С ИСПРАВЛЕНИЯМИ:
// // 1. Проверка статуса ответа (показ ошибки при неправильном коде)
// // 2. Очистка ошибки при вводе
// // 3. Правильная обработка loading state
// 'use client';

// import React, { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaTelegram } from 'react-icons/fa';
// import { Phone, Shield, Mail, Calendar, Send, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';
// import { BookingAnimatedBackground } from '@/components/layout/BookingAnimatedBackground';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { useTranslations } from '@/i18n/useTranslations';
// import { TelegramRegistrationModal } from '@/components/TelegramRegistrationModal';

// export default function TelegramVerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const t = useTranslations();

//   // Параметры бронирования
//   const serviceId = searchParams.get('s') || '';
//   const masterId = searchParams.get('m') || '';
//   const startAt = searchParams.get('start') || '';
//   const endAt = searchParams.get('end') || '';
//   const selectedDate = searchParams.get('d') || '';

//   // ✅ ВСЕ ХУКИ НАВЕРХУ - ДО ЛЮБЫХ УСЛОВИЙ!
//   const [step, setStep] = useState(1); // 1: phone, 2: code, 3: info
//   const [phone, setPhone] = useState('');
//   const [code, setCode] = useState('');
//   const [email, setEmail] = useState('');
//   const [birthDate, setBirthDate] = useState('');
//   const [sessionId, setSessionId] = useState('');
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [showRegistrationModal, setShowRegistrationModal] = useState(false);

//   // Проверка параметров (ПОСЛЕ хуков!)
//   const hasInvalidParams = !serviceId || !masterId || !startAt || !endAt || !selectedDate;

//   // Если параметры невалидны, показываем ошибку (но хуки уже вызваны!)
//   if (hasInvalidParams) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
//         <div className="text-center">
//           <h1 className="mb-4 text-2xl font-bold text-red-400">
//             {t('booking_telegram_verify_error_title')}
//           </h1>
//           <p className="mb-6 text-slate-300">
//             {t('booking_telegram_verify_error_missing')}
//           </p>
//           <Link
//             href="/booking/services"
//             className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600"
//           >
//             {t('booking_telegram_verify_error_return')}
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const BOOKING_STEPS = [
//     { id: 'services', label: t('booking_step_services'), icon: '✨' },
//     { id: 'master', label: t('booking_step_master'), icon: '👤' },
//     { id: 'calendar', label: t('booking_step_date'), icon: '📅' },
//     { id: 'client', label: t('booking_step_client'), icon: '📝' },
//     { id: 'verify', label: t('booking_step_verify'), icon: '✓' },
//     { id: 'payment', label: t('booking_step_payment'), icon: '💳' },
//   ];

//   // Шаг 1: Отправка кода
//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       // ✅ ПРОВЕРКА РЕГИСТРАЦИИ В БОТЕ
//       console.log('[Telegram Verify] Checking registration for:', phone);
      
//       const checkRes = await fetch(`/api/telegram/check-registration?phone=${encodeURIComponent(phone)}`);
//       const checkData = await checkRes.json();
      
//       if (!checkData.registered) {
//         console.log('[Telegram Verify] Phone not registered, showing modal');
//         setShowRegistrationModal(true);
//         setLoading(false);
//         return;
//       }
      
//       console.log('[Telegram Verify] Phone registered, sending code');

//       // Отправка кода
//       const res = await fetch('/api/telegram/send-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone,
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка отправки кода');
//       }

//       setSessionId(data.sessionId);
//       setSuccess('✓ Код отправлен в Telegram!');
      
//       // Переход к шагу 2 через 1 секунду
//       setTimeout(() => {
//         setStep(2);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Шаг 2: Проверка кода - ✅ ИСПРАВЛЕНО
//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       console.log('[Frontend] Verifying code:', code);
      
//       const res = await fetch('/api/telegram/verify-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           code: code.trim(),
//         }),
//       });

//       const data = await res.json();
//       console.log('[Frontend] Verify response:', data);

//       // ✅ ПРОВЕРКА СТАТУСА ОТВЕТА - ГЛАВНОЕ ИСПРАВЛЕНИЕ!
//       if (!res.ok) {
//         // Обработка разных типов ошибок
//         if (data.error?.includes('expired')) {
//           throw new Error('Код истёк. Запросите новый код.');
//         }
//         if (data.error?.includes('Invalid code')) {
//           throw new Error('Неверный код. Проверьте код в Telegram и попробуйте снова.');
//         }
//         if (data.error?.includes('Session not found')) {
//           throw new Error('Сессия не найдена. Начните заново.');
//         }
//         throw new Error(data.error || 'Неверный код');
//       }

//       setSuccess('✓ Код подтверждён!');

//       // ✅ АВТОМАТИЧЕСКИЙ ПРОПУСК ШАГА 3 ДЛЯ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ
//       if (data.userData && data.userData.email) {
//         console.log('[Frontend] Existing user detected, auto-creating appointment');
//         console.log('[Frontend] User data:', data.userData);

//         setTimeout(async () => {
//           setSuccess('Создание записи...');
          
//           try {
//             console.log('[Frontend] Auto-completing registration with sessionId:', sessionId);
            
//             const completeRes = await fetch('/api/telegram/complete-registration', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ sessionId }),
//             });

//             const completeData = await completeRes.json();
//             console.log('[Frontend] Complete response:', completeData);

//             if (!completeRes.ok) {
//               throw new Error(completeData.error || 'Ошибка создания записи');
//             }

//             console.log('[Frontend] Redirecting to payment:', completeData.appointmentId);
//             router.push(`/booking/payment?appointment=${completeData.appointmentId}`);
//           } catch (err) {
//             console.error('[Frontend] Auto-complete error:', err);
//             setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
//             setLoading(false); // ✅ Всегда убираем loading при ошибке
//           }
//         }, 1000);
//       } else {
//         // Обычный переход к шагу 3 для новых пользователей
//         console.log('[Frontend] New user, showing step 3');
//         setTimeout(() => {
//           setStep(3);
//           setSuccess(null);
//           setLoading(false); // ✅ Убираем loading после перехода
//         }, 1000);
//       }
//     } catch (err) {
//       console.error('[Frontend] Verify error:', err);
//       setError(err instanceof Error ? err.message : 'Ошибка проверки кода');
//       setLoading(false); // ✅ Убираем loading при ошибке
//     }
//   };

//   // Шаг 3: Завершение регистрации
//   const handleCompleteRegistration = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('[Frontend] Manual registration called');
//     console.log('[Frontend] sessionId:', sessionId);
//     console.log('[Frontend] email:', email);
//     console.log('[Frontend] birthDate:', birthDate);
    
//     setLoading(true);
//     setError(null);

//     try {
//       const requestBody = {
//         sessionId,
//         email: email || null,
//         birthDate: birthDate || null,
//       };
      
//       console.log('[Frontend] Sending request:', requestBody);
      
//       const res = await fetch('/api/telegram/complete-registration', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
//       });

//       console.log('[Frontend] Response status:', res.status);
      
//       const data = await res.json();
//       console.log('[Frontend] Response data:', data);

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка завершения регистрации');
//       }

//       console.log('[Frontend] Redirecting to payment:', data.appointmentId);
//       router.push(`/booking/payment?appointment=${data.appointmentId}`);
//     } catch (err) {
//       console.error('[Frontend] Error:', err);
//       setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Повторная отправка кода
//   const handleResendCode = () => {
//     setCode('');
//     setStep(1);
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* Неоновая линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <BookingAnimatedBackground />

//       {/* Header */}
//       <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <div className="mb-3 flex items-center gap-4">
//             <Link href="/" className="group inline-flex items-center gap-3">
//               <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg">
//                 <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
//                 <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
//                   <span className="text-xl">💎</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15]">
//                   Salon Elen
//                 </span>
//                 <span className="block text-xs text-cyan-400/85">
//                   Premium Beauty Experience
//                 </span>
//               </div>
//             </Link>
//           </div>
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[120px]" />

//       {/* Main Content */}
//       <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           {/* Card */}
//           <div className="relative rounded-[32px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(42,171,238,0.5)]">
//             <div className="rounded-[30px] bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl">
//               {/* Header */}
//               <div className="mb-8 text-center">
//                 <motion.div
//                   animate={{
//                     scale: [1, 1.05, 1],
//                     rotate: [0, 5, 0],
//                   }}
//                   transition={{ duration: 3, repeat: Infinity }}
//                   className="mb-4 flex justify-center"
//                 >
//                   <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-400/70 bg-gradient-to-br from-blue-400/25 to-slate-900">
//                     <FaTelegram className="h-12 w-12 text-[#2AABEE]" />
//                   </div>
//                 </motion.div>

//                 <h1 className="brand-script mb-2 text-3xl font-bold">
//                   <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-cyan-200 bg-clip-text text-transparent">
//                     {t('booking_telegram_verify_title')}
//                   </span>
//                 </h1>
//                 <p className="text-sm text-slate-300">
//                   {t('booking_telegram_verify_subtitle')}
//                 </p>
//               </div>

//               {/* Progress Steps */}
//               <div className="mb-8 flex items-center justify-center gap-3">
//                 {[1, 2, 3].map((s) => (
//                   <React.Fragment key={s}>
//                     <motion.div
//                       animate={{
//                         scale: step >= s ? 1 : 0.8,
//                         backgroundColor: step >= s ? '#2AABEE' : '#334155',
//                       }}
//                       className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
//                     >
//                       {step > s ? <CheckCircle className="h-6 w-6" /> : s}
//                     </motion.div>
//                     {s < 3 && (
//                       <div
//                         className={`h-1 w-12 rounded-full transition-colors ${
//                           step > s ? 'bg-blue-400' : 'bg-slate-700'
//                         }`}
//                       />
//                     )}
//                   </React.Fragment>
//                 ))}
//               </div>

//               {/* Messages - ✅ ПОКАЗ ОШИБОК */}
//               <AnimatePresence mode="wait">
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
//                   >
//                     ⚠️ {error}
//                   </motion.div>
//                 )}

//                 {success && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200"
//                   >
//                     ✓ {success}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Forms */}
//               <AnimatePresence mode="wait">
//                 {/* STEP 1: PHONE */}
//                 {step === 1 && (
//                   <motion.form
//                     key="step1"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleSendCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step1_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step1_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_phone_label')}
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                         <input
//                           type="tel"
//                           value={phone}
//                           onChange={(e) => {
//                             setPhone(e.target.value);
//                             setError(null); // ✅ Очищаем ошибку при вводе
//                           }}
//                           placeholder={t('booking_telegram_verify_phone_placeholder')}
//                           required
//                           className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                         />
//                       </div>
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_phone_hint')}
//                       </p>
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={loading || !phone}
//                       className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {loading ? (
//                         <>
//                           <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                           {t('booking_telegram_verify_sending')}
//                         </>
//                       ) : (
//                         <>
//                           <Send className="h-5 w-5" />
//                           {t('booking_telegram_verify_send_code')}
//                           <ArrowRight className="h-5 w-5" />
//                         </>
//                       )}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 2: CODE - ✅ ИСПРАВЛЕНО */}
//                 {step === 2 && (
//                   <motion.form
//                     key="step2"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleVerifyCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step2_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step2_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_code_label')}
//                       </label>
//                       <input
//                         type="text"
//                         value={code}
//                         onChange={(e) => {
//                           setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
//                           setError(null); // ✅ Очищаем ошибку при вводе
//                         }}
//                         placeholder={t('booking_telegram_verify_code_placeholder')}
//                         required
//                         maxLength={6}
//                         className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 px-4 text-center text-2xl font-bold tracking-widest text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                       />
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_code_hint')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(1)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading || code.length !== 6}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_checking')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_check_code')}
//                           </>
//                         )}
//                       </button>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={handleResendCode}
//                       disabled={loading}
//                       className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:opacity-60"
//                     >
//                       {t('booking_telegram_verify_resend')}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 3: INFO */}
//                 {step === 3 && (
//                   <motion.form
//                     key="step3"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleCompleteRegistration}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step3_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step3_subtitle')}
//                       </p>

//                       <div className="space-y-4">
//                         {/* Email */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_email_label')}
//                           </label>
//                           <div className="relative">
//                             <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="email"
//                               value={email}
//                               onChange={(e) => setEmail(e.target.value)}
//                               placeholder={t('booking_telegram_verify_email_placeholder')}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_email_hint')}
//                           </p>
//                         </div>

//                         {/* Birth Date */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_birth_label')}
//                           </label>
//                           <div className="relative">
//                             <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="date"
//                               value={birthDate}
//                               onChange={(e) => setBirthDate(e.target.value)}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_birth_hint')}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
//                       <p className="text-xs text-purple-200">
//                         <Shield className="mr-2 inline-block h-3 w-3" />
//                         {t('booking_telegram_verify_privacy')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(2)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_completing')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_complete')}
//                             <ArrowRight className="h-5 w-5" />
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </motion.form>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       {/* Модальное окно регистрации в боте */}
//       <TelegramRegistrationModal
//         isOpen={showRegistrationModal}
//         onClose={() => {
//           setShowRegistrationModal(false);
//           // После закрытия - повторить отправку кода
//           handleSendCode({ preventDefault: () => {} } as React.FormEvent);
//         }}
//         botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'salon_elen_bot'}
//         phone={phone}
//       />

//       <style jsx global>{`
//         .brand-script {
//           font-family: 'Cormorant Infant', 'Playfair Display', serif;
//           font-style: italic;
//           font-weight: 600;
//         }
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }




//-------работало исправляем ошибку ввода кода---------
// // src/app/booking/telegram-verify/page.tsx
// // ИСПРАВЛЕНО: Убраны все `any`, обновлены i18n ключи
// // ДОБАВЛЕНО: Проверка регистрации + модальное окно
// 'use client';

// import React, { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaTelegram } from 'react-icons/fa';
// import { Phone, Shield, Mail, Calendar, Send, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';
// import { BookingAnimatedBackground } from '@/components/layout/BookingAnimatedBackground';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { useTranslations } from '@/i18n/useTranslations';
// import { TelegramRegistrationModal } from '@/components/TelegramRegistrationModal';

// export default function TelegramVerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const t = useTranslations();

//   // Параметры бронирования
//   const serviceId = searchParams.get('s') || '';
//   const masterId = searchParams.get('m') || '';
//   const startAt = searchParams.get('start') || '';
//   const endAt = searchParams.get('end') || '';
//   const selectedDate = searchParams.get('d') || '';

//   // ✅ ВСЕ ХУКИ НАВЕРХУ - ДО ЛЮБЫХ УСЛОВИЙ!
//   const [step, setStep] = useState(1); // 1: phone, 2: code, 3: info
//   const [phone, setPhone] = useState('');
//   const [code, setCode] = useState('');
//   const [email, setEmail] = useState('');
//   const [birthDate, setBirthDate] = useState('');
//   const [sessionId, setSessionId] = useState('');
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [showRegistrationModal, setShowRegistrationModal] = useState(false);

//   // Проверка параметров (ПОСЛЕ хуков!)
//   const hasInvalidParams = !serviceId || !masterId || !startAt || !endAt || !selectedDate;

//   // Если параметры невалидны, показываем ошибку (но хуки уже вызваны!)
//   if (hasInvalidParams) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
//         <div className="text-center">
//           <h1 className="mb-4 text-2xl font-bold text-red-400">
//             {t('booking_telegram_verify_error_title')}
//           </h1>
//           <p className="mb-6 text-slate-300">
//             {t('booking_telegram_verify_error_missing')}
//           </p>
//           <Link
//             href="/booking/services"
//             className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600"
//           >
//             {t('booking_telegram_verify_error_return')}
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const BOOKING_STEPS = [
//     { id: 'services', label: t('booking_step_services'), icon: '✨' },
//     { id: 'master', label: t('booking_step_master'), icon: '👤' },
//     { id: 'calendar', label: t('booking_step_date'), icon: '📅' },
//     { id: 'client', label: t('booking_step_client'), icon: '📝' },
//     { id: 'verify', label: t('booking_step_verify'), icon: '✓' },
//     { id: 'payment', label: t('booking_step_payment'), icon: '💳' },
//   ];

//   // Шаг 1: Отправка кода
//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       // ✅ ПРОВЕРКА РЕГИСТРАЦИИ В БОТЕ
//       console.log('[Telegram Verify] Checking registration for:', phone);
      
//       const checkRes = await fetch(`/api/telegram/check-registration?phone=${encodeURIComponent(phone)}`);
//       const checkData = await checkRes.json();
      
//       if (!checkData.registered) {
//         console.log('[Telegram Verify] Phone not registered, showing modal');
//         setShowRegistrationModal(true);
//         setLoading(false);
//         return;
//       }
      
//       console.log('[Telegram Verify] Phone registered, sending code');

//       // Отправка кода
//       const res = await fetch('/api/telegram/send-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone,
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка отправки кода');
//       }

//       setSessionId(data.sessionId);
//       setSuccess('✓ Код отправлен в Telegram!');
      
//       // Переход к шагу 2 через 1 секунду
//       setTimeout(() => {
//         setStep(2);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
//     } finally {
//       setLoading(false);
//     }
//   };


//   // Шаг 2: Проверка кода - ✅ ИСПРАВЛЕНО
//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       console.log('[Frontend] Verifying code:', code);
      
//       const res = await fetch('/api/telegram/verify-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           code,
//         }),
//       });

//       const data = await res.json();
//       console.log('[Frontend] Verify response:', data);

//       if (!res.ok) {
//         if (data.error?.includes('expired')) {
//           throw new Error('Код истёк. Запросите новый код.');
//         }
//         throw new Error(data.error || 'Неверный код');
//       }

//       setSuccess('✓ Код подтверждён!');

//       // ✅ АВТОМАТИЧЕСКИЙ ПРОПУСК ШАГА 3
//       if (data.userData && data.userData.email) {
//         console.log('[Frontend] Existing user detected, auto-creating appointment');
//         console.log('[Frontend] User data:', data.userData);

//         setTimeout(async () => {
//           setSuccess('Создание записи...');
          
//           try {
//             console.log('[Frontend] Auto-completing registration with sessionId:', sessionId);
            
//             const completeRes = await fetch('/api/telegram/complete-registration', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ sessionId }),
//             });

//             const completeData = await completeRes.json();
//             console.log('[Frontend] Complete response:', completeData);

//             if (!completeRes.ok) {
//               throw new Error(completeData.error || 'Ошибка создания записи');
//             }

//             console.log('[Frontend] Redirecting to payment:', completeData.appointmentId);
//             router.push(`/booking/payment?appointment=${completeData.appointmentId}`);
//           } catch (err) {
//             console.error('[Frontend] Auto-complete error:', err);
//             setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
//           } finally {
//             // ✅ ИСПРАВЛЕНИЕ: Всегда убираем loading
//             setLoading(false);
//           }
//         }, 1000);
//       } else {
//         // Обычный переход к шагу 3
//         console.log('[Frontend] New user, showing step 3');
//         setTimeout(() => {
//           setStep(3);
//           setSuccess(null);
//           setLoading(false); // ✅ ИСПРАВЛЕНИЕ
//         }, 1000);
//       }
//     } catch (err) {
//       console.error('[Frontend] Verify error:', err);
//       setError(err instanceof Error ? err.message : 'Ошибка проверки кода');
//       setLoading(false);
//     }
//   };

//   // Шаг 3: Завершение регистрации - ✅ ИСПРАВЛЕНО
//   const handleCompleteRegistration = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('[Frontend] Manual registration called');
//     console.log('[Frontend] sessionId:', sessionId);
//     console.log('[Frontend] email:', email);
//     console.log('[Frontend] birthDate:', birthDate);
    
//     setLoading(true);
//     setError(null);

//     try {
//       const requestBody = {
//         sessionId,
//         email: email || null,
//         birthDate: birthDate || null,
//       };
      
//       console.log('[Frontend] Sending request:', requestBody);
      
//       const res = await fetch('/api/telegram/complete-registration', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
//       });

//       console.log('[Frontend] Response status:', res.status);
      
//       const data = await res.json();
//       console.log('[Frontend] Response data:', data);

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка завершения регистрации');
//       }

//       console.log('[Frontend] Redirecting to payment:', data.appointmentId);
//       router.push(`/booking/payment?appointment=${data.appointmentId}`);
//     } catch (err) {
//       console.error('[Frontend] Error:', err);
//       setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Повторная отправка кода
//   const handleResendCode = () => {
//     setCode('');
//     setStep(1);
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* Неоновая линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <BookingAnimatedBackground />

//       {/* Header */}
//       <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <div className="mb-3 flex items-center gap-4">
//             <Link href="/" className="group inline-flex items-center gap-3">
//               <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg">
//                 <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
//                 <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
//                   <span className="text-xl">💎</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15]">
//                   Salon Elen
//                 </span>
//                 <span className="block text-xs text-cyan-400/85">
//                   Premium Beauty Experience
//                 </span>
//               </div>
//             </Link>
//           </div>
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[120px]" />

//       {/* Main Content */}
//       <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           {/* Card */}
//           <div className="relative rounded-[32px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(42,171,238,0.5)]">
//             <div className="rounded-[30px] bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl">
//               {/* Header */}
//               <div className="mb-8 text-center">
//                 <motion.div
//                   animate={{
//                     scale: [1, 1.05, 1],
//                     rotate: [0, 5, 0],
//                   }}
//                   transition={{ duration: 3, repeat: Infinity }}
//                   className="mb-4 flex justify-center"
//                 >
//                   <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-400/70 bg-gradient-to-br from-blue-400/25 to-slate-900">
//                     <FaTelegram className="h-12 w-12 text-[#2AABEE]" />
//                   </div>
//                 </motion.div>

//                 <h1 className="brand-script mb-2 text-3xl font-bold">
//                   <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-cyan-200 bg-clip-text text-transparent">
//                     {t('booking_telegram_verify_title')}
//                   </span>
//                 </h1>
//                 <p className="text-sm text-slate-300">
//                   {t('booking_telegram_verify_subtitle')}
//                 </p>
//               </div>

//               {/* Progress Steps */}
//               <div className="mb-8 flex items-center justify-center gap-3">
//                 {[1, 2, 3].map((s) => (
//                   <React.Fragment key={s}>
//                     <motion.div
//                       animate={{
//                         scale: step >= s ? 1 : 0.8,
//                         backgroundColor: step >= s ? '#2AABEE' : '#334155',
//                       }}
//                       className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
//                     >
//                       {step > s ? <CheckCircle className="h-6 w-6" /> : s}
//                     </motion.div>
//                     {s < 3 && (
//                       <div
//                         className={`h-1 w-12 rounded-full transition-colors ${
//                           step > s ? 'bg-blue-400' : 'bg-slate-700'
//                         }`}
//                       />
//                     )}
//                   </React.Fragment>
//                 ))}
//               </div>

//               {/* Messages */}
//               <AnimatePresence mode="wait">
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
//                   >
//                     ⚠️ {error}
//                   </motion.div>
//                 )}

//                 {success && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200"
//                   >
//                     ✓ {success}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Forms */}
//               <AnimatePresence mode="wait">
//                 {/* STEP 1: PHONE */}
//                 {step === 1 && (
//                   <motion.form
//                     key="step1"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleSendCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step1_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step1_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_phone_label')}
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                         <input
//                           type="tel"
//                           value={phone}
//                           onChange={(e) => setPhone(e.target.value)}
//                           placeholder={t('booking_telegram_verify_phone_placeholder')}
//                           required
//                           className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                         />
//                       </div>
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_phone_hint')}
//                       </p>
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={loading || !phone}
//                       className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {loading ? (
//                         <>
//                           <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                           {t('booking_telegram_verify_sending')}
//                         </>
//                       ) : (
//                         <>
//                           <Send className="h-5 w-5" />
//                           {t('booking_telegram_verify_send_code')}
//                           <ArrowRight className="h-5 w-5" />
//                         </>
//                       )}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 2: CODE */}
//                 {step === 2 && (
//                   <motion.form
//                     key="step2"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleVerifyCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step2_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step2_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_code_label')}
//                       </label>
//                       <input
//                         type="text"
//                         value={code}
//                         onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                         placeholder={t('booking_telegram_verify_code_placeholder')}
//                         required
//                         maxLength={6}
//                         className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 px-4 text-center text-2xl font-bold tracking-widest text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                       />
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_code_hint')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(1)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading || code.length !== 6}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_checking')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_check_code')}
//                           </>
//                         )}
//                       </button>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={handleResendCode}
//                       disabled={loading}
//                       className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:opacity-60"
//                     >
//                       {t('booking_telegram_verify_resend')}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 3: INFO */}
//                 {step === 3 && (
//                   <motion.form
//                     key="step3"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleCompleteRegistration}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step3_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step3_subtitle')}
//                       </p>

//                       <div className="space-y-4">
//                         {/* Email */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_email_label')}
//                           </label>
//                           <div className="relative">
//                             <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="email"
//                               value={email}
//                               onChange={(e) => setEmail(e.target.value)}
//                               placeholder={t('booking_telegram_verify_email_placeholder')}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_email_hint')}
//                           </p>
//                         </div>

//                         {/* Birth Date */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_birth_label')}
//                           </label>
//                           <div className="relative">
//                             <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="date"
//                               value={birthDate}
//                               onChange={(e) => setBirthDate(e.target.value)}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_birth_hint')}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
//                       <p className="text-xs text-purple-200">
//                         <Shield className="mr-2 inline-block h-3 w-3" />
//                         {t('booking_telegram_verify_privacy')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(2)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_completing')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_complete')}
//                             <ArrowRight className="h-5 w-5" />
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </motion.form>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       {/* Модальное окно регистрации в боте */}
//       <TelegramRegistrationModal
//         isOpen={showRegistrationModal}
//         onClose={() => {
//           setShowRegistrationModal(false);
//           // После закрытия - повторить отправку кода
//           handleSendCode({ preventDefault: () => {} } as React.FormEvent);
//         }}
//         botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'salon_elen_bot'}
//         phone={phone}
//       />

//       <style jsx global>{`
//         .brand-script {
//           font-family: 'Cormorant Infant', 'Playfair Display', serif;
//           font-style: italic;
//           font-weight: 600;
//         }
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }





//--------зависла кнопка после ввода кода--------
// // src/app/booking/telegram-verify/page.tsx
// // ИСПРАВЛЕНО: Убраны все `any`, обновлены i18n ключи
// // ДОБАВЛЕНО: Проверка регистрации + модальное окно
// 'use client';

// import React, { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaTelegram } from 'react-icons/fa';
// import { Phone, Shield, Mail, Calendar, Send, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';
// import { BookingAnimatedBackground } from '@/components/layout/BookingAnimatedBackground';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { useTranslations } from '@/i18n/useTranslations';
// import { TelegramRegistrationModal } from '@/components/TelegramRegistrationModal';

// export default function TelegramVerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const t = useTranslations();

//   // Параметры бронирования
//   const serviceId = searchParams.get('s') || '';
//   const masterId = searchParams.get('m') || '';
//   const startAt = searchParams.get('start') || '';
//   const endAt = searchParams.get('end') || '';
//   const selectedDate = searchParams.get('d') || '';

//   // ✅ ВСЕ ХУКИ НАВЕРХУ - ДО ЛЮБЫХ УСЛОВИЙ!
//   const [step, setStep] = useState(1); // 1: phone, 2: code, 3: info
//   const [phone, setPhone] = useState('');
//   const [code, setCode] = useState('');
//   const [email, setEmail] = useState('');
//   const [birthDate, setBirthDate] = useState('');
//   const [sessionId, setSessionId] = useState('');
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [showRegistrationModal, setShowRegistrationModal] = useState(false);

//   // Проверка параметров (ПОСЛЕ хуков!)
//   const hasInvalidParams = !serviceId || !masterId || !startAt || !endAt || !selectedDate;

//   // Если параметры невалидны, показываем ошибку (но хуки уже вызваны!)
//   if (hasInvalidParams) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
//         <div className="text-center">
//           <h1 className="mb-4 text-2xl font-bold text-red-400">
//             {t('booking_telegram_verify_error_title')}
//           </h1>
//           <p className="mb-6 text-slate-300">
//             {t('booking_telegram_verify_error_missing')}
//           </p>
//           <Link
//             href="/booking/services"
//             className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600"
//           >
//             {t('booking_telegram_verify_error_return')}
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const BOOKING_STEPS = [
//     { id: 'services', label: t('booking_step_services'), icon: '✨' },
//     { id: 'master', label: t('booking_step_master'), icon: '👤' },
//     { id: 'calendar', label: t('booking_step_date'), icon: '📅' },
//     { id: 'client', label: t('booking_step_client'), icon: '📝' },
//     { id: 'verify', label: t('booking_step_verify'), icon: '✓' },
//     { id: 'payment', label: t('booking_step_payment'), icon: '💳' },
//   ];

//   // Шаг 1: Отправка кода
//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       // ✅ ПРОВЕРКА РЕГИСТРАЦИИ В БОТЕ
//       console.log('[Telegram Verify] Checking registration for:', phone);
      
//       const checkRes = await fetch(`/api/telegram/check-registration?phone=${encodeURIComponent(phone)}`);
//       const checkData = await checkRes.json();
      
//       if (!checkData.registered) {
//         console.log('[Telegram Verify] Phone not registered, showing modal');
//         setShowRegistrationModal(true);
//         setLoading(false);
//         return;
//       }
      
//       console.log('[Telegram Verify] Phone registered, sending code');

//       // Отправка кода
//       const res = await fetch('/api/telegram/send-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone,
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка отправки кода');
//       }

//       setSessionId(data.sessionId);
//       setSuccess('✓ Код отправлен в Telegram!');
      
//       // Переход к шагу 2 через 1 секунду
//       setTimeout(() => {
//         setStep(2);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Шаг 2: Проверка кода
//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/telegram/verify-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           code,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (data.error?.includes('expired')) {
//           throw new Error('Код истёк. Запросите новый код.');
//         }
//         throw new Error(data.error || 'Неверный код');
//       }

//       setSuccess('✓ Код подтверждён!');

//       // ✅ АВТОМАТИЧЕСКИЙ ПРОПУСК ШАГА 3
//       // Если пользователь уже существует с email - сразу создать appointment
//       if (data.userData && data.userData.email) {
//         console.log('[Telegram Verify] Existing user detected, skipping step 3');
//         console.log('[Telegram Verify] User data:', data.userData);

//         // Автоматически завершить регистрацию
//         setTimeout(async () => {
//           setSuccess('Создание записи...');
          
//           try {
//             const completeRes = await fetch('/api/telegram/complete-registration', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 sessionId,
//                 // email и telegramUserId будут взяты из TelegramUser автоматически
//               }),
//             });

//             const completeData = await completeRes.json();

//             if (!completeRes.ok) {
//               throw new Error(completeData.error || 'Ошибка создания записи');
//             }

//             // Редирект на оплату
//             router.push(`/booking/payment?appointment=${completeData.appointmentId}`);
//           } catch (err) {
//             setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
//             setLoading(false);
//           }
//         }, 1000);
//       } else {
//         // Обычный переход к шагу 3 (для новых пользователей)
//         setTimeout(() => {
//           setStep(3);
//           setSuccess(null);
//         }, 1000);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка проверки кода');
//       setLoading(false);
//     }
//   };

//   // Шаг 3: Завершение регистрации
//   const handleCompleteRegistration = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/telegram/complete-registration', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           email: email || null,
//           birthDate: birthDate || null,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка завершения регистрации');
//       }

//       // Редирект на оплату
//       router.push(`/booking/payment?appointment=${data.appointmentId}`);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Повторная отправка кода
//   const handleResendCode = () => {
//     setCode('');
//     setStep(1);
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* Неоновая линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <BookingAnimatedBackground />

//       {/* Header */}
//       <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <div className="mb-3 flex items-center gap-4">
//             <Link href="/" className="group inline-flex items-center gap-3">
//               <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg">
//                 <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
//                 <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
//                   <span className="text-xl">💎</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15]">
//                   Salon Elen
//                 </span>
//                 <span className="block text-xs text-cyan-400/85">
//                   Premium Beauty Experience
//                 </span>
//               </div>
//             </Link>
//           </div>
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[120px]" />

//       {/* Main Content */}
//       <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           {/* Card */}
//           <div className="relative rounded-[32px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(42,171,238,0.5)]">
//             <div className="rounded-[30px] bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl">
//               {/* Header */}
//               <div className="mb-8 text-center">
//                 <motion.div
//                   animate={{
//                     scale: [1, 1.05, 1],
//                     rotate: [0, 5, 0],
//                   }}
//                   transition={{ duration: 3, repeat: Infinity }}
//                   className="mb-4 flex justify-center"
//                 >
//                   <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-400/70 bg-gradient-to-br from-blue-400/25 to-slate-900">
//                     <FaTelegram className="h-12 w-12 text-[#2AABEE]" />
//                   </div>
//                 </motion.div>

//                 <h1 className="brand-script mb-2 text-3xl font-bold">
//                   <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-cyan-200 bg-clip-text text-transparent">
//                     {t('booking_telegram_verify_title')}
//                   </span>
//                 </h1>
//                 <p className="text-sm text-slate-300">
//                   {t('booking_telegram_verify_subtitle')}
//                 </p>
//               </div>

//               {/* Progress Steps */}
//               <div className="mb-8 flex items-center justify-center gap-3">
//                 {[1, 2, 3].map((s) => (
//                   <React.Fragment key={s}>
//                     <motion.div
//                       animate={{
//                         scale: step >= s ? 1 : 0.8,
//                         backgroundColor: step >= s ? '#2AABEE' : '#334155',
//                       }}
//                       className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
//                     >
//                       {step > s ? <CheckCircle className="h-6 w-6" /> : s}
//                     </motion.div>
//                     {s < 3 && (
//                       <div
//                         className={`h-1 w-12 rounded-full transition-colors ${
//                           step > s ? 'bg-blue-400' : 'bg-slate-700'
//                         }`}
//                       />
//                     )}
//                   </React.Fragment>
//                 ))}
//               </div>

//               {/* Messages */}
//               <AnimatePresence mode="wait">
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
//                   >
//                     ⚠️ {error}
//                   </motion.div>
//                 )}

//                 {success && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200"
//                   >
//                     ✓ {success}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Forms */}
//               <AnimatePresence mode="wait">
//                 {/* STEP 1: PHONE */}
//                 {step === 1 && (
//                   <motion.form
//                     key="step1"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleSendCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step1_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step1_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_phone_label')}
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                         <input
//                           type="tel"
//                           value={phone}
//                           onChange={(e) => setPhone(e.target.value)}
//                           placeholder={t('booking_telegram_verify_phone_placeholder')}
//                           required
//                           className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                         />
//                       </div>
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_phone_hint')}
//                       </p>
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={loading || !phone}
//                       className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {loading ? (
//                         <>
//                           <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                           {t('booking_telegram_verify_sending')}
//                         </>
//                       ) : (
//                         <>
//                           <Send className="h-5 w-5" />
//                           {t('booking_telegram_verify_send_code')}
//                           <ArrowRight className="h-5 w-5" />
//                         </>
//                       )}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 2: CODE */}
//                 {step === 2 && (
//                   <motion.form
//                     key="step2"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleVerifyCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step2_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step2_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_code_label')}
//                       </label>
//                       <input
//                         type="text"
//                         value={code}
//                         onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                         placeholder={t('booking_telegram_verify_code_placeholder')}
//                         required
//                         maxLength={6}
//                         className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 px-4 text-center text-2xl font-bold tracking-widest text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                       />
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_code_hint')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(1)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading || code.length !== 6}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_checking')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_check_code')}
//                           </>
//                         )}
//                       </button>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={handleResendCode}
//                       disabled={loading}
//                       className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:opacity-60"
//                     >
//                       {t('booking_telegram_verify_resend')}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 3: INFO */}
//                 {step === 3 && (
//                   <motion.form
//                     key="step3"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleCompleteRegistration}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step3_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step3_subtitle')}
//                       </p>

//                       <div className="space-y-4">
//                         {/* Email */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_email_label')}
//                           </label>
//                           <div className="relative">
//                             <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="email"
//                               value={email}
//                               onChange={(e) => setEmail(e.target.value)}
//                               placeholder={t('booking_telegram_verify_email_placeholder')}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_email_hint')}
//                           </p>
//                         </div>

//                         {/* Birth Date */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_birth_label')}
//                           </label>
//                           <div className="relative">
//                             <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="date"
//                               value={birthDate}
//                               onChange={(e) => setBirthDate(e.target.value)}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_birth_hint')}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
//                       <p className="text-xs text-purple-200">
//                         <Shield className="mr-2 inline-block h-3 w-3" />
//                         {t('booking_telegram_verify_privacy')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(2)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_completing')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_complete')}
//                             <ArrowRight className="h-5 w-5" />
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </motion.form>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       {/* Модальное окно регистрации в боте */}
//       <TelegramRegistrationModal
//         isOpen={showRegistrationModal}
//         onClose={() => {
//           setShowRegistrationModal(false);
//           // После закрытия - повторить отправку кода
//           handleSendCode({ preventDefault: () => {} } as React.FormEvent);
//         }}
//         botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'salon_elen_bot'}
//         phone={phone}
//       />

//       <style jsx global>{`
//         .brand-script {
//           font-family: 'Cormorant Infant', 'Playfair Display', serif;
//           font-style: italic;
//           font-weight: 600;
//         }
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }




//---------всё работает, добовляем автоматизацию------
// // src/app/booking/telegram-verify/page.tsx
// // ИСПРАВЛЕНО: Убраны все `any`, обновлены i18n ключи
// // ДОБАВЛЕНО: Проверка регистрации + модальное окно
// 'use client';

// import React, { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaTelegram } from 'react-icons/fa';
// import { Phone, Shield, Mail, Calendar, Send, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';
// import { BookingAnimatedBackground } from '@/components/layout/BookingAnimatedBackground';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { useTranslations } from '@/i18n/useTranslations';
// import { TelegramRegistrationModal } from '@/components/TelegramRegistrationModal';

// export default function TelegramVerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const t = useTranslations();

//   // Параметры бронирования
//   const serviceId = searchParams.get('s') || '';
//   const masterId = searchParams.get('m') || '';
//   const startAt = searchParams.get('start') || '';
//   const endAt = searchParams.get('end') || '';
//   const selectedDate = searchParams.get('d') || '';

//   // ✅ ВСЕ ХУКИ НАВЕРХУ - ДО ЛЮБЫХ УСЛОВИЙ!
//   const [step, setStep] = useState(1); // 1: phone, 2: code, 3: info
//   const [phone, setPhone] = useState('');
//   const [code, setCode] = useState('');
//   const [email, setEmail] = useState('');
//   const [birthDate, setBirthDate] = useState('');
//   const [sessionId, setSessionId] = useState('');
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [showRegistrationModal, setShowRegistrationModal] = useState(false);

//   // Проверка параметров (ПОСЛЕ хуков!)
//   const hasInvalidParams = !serviceId || !masterId || !startAt || !endAt || !selectedDate;

//   // Если параметры невалидны, показываем ошибку (но хуки уже вызваны!)
//   if (hasInvalidParams) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
//         <div className="text-center">
//           <h1 className="mb-4 text-2xl font-bold text-red-400">
//             {t('booking_telegram_verify_error_title')}
//           </h1>
//           <p className="mb-6 text-slate-300">
//             {t('booking_telegram_verify_error_missing')}
//           </p>
//           <Link
//             href="/booking/services"
//             className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600"
//           >
//             {t('booking_telegram_verify_error_return')}
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const BOOKING_STEPS = [
//     { id: 'services', label: t('booking_step_services'), icon: '✨' },
//     { id: 'master', label: t('booking_step_master'), icon: '👤' },
//     { id: 'calendar', label: t('booking_step_date'), icon: '📅' },
//     { id: 'client', label: t('booking_step_client'), icon: '📝' },
//     { id: 'verify', label: t('booking_step_verify'), icon: '✓' },
//     { id: 'payment', label: t('booking_step_payment'), icon: '💳' },
//   ];

//   // Шаг 1: Отправка кода
//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       // ✅ ПРОВЕРКА РЕГИСТРАЦИИ В БОТЕ
//       console.log('[Telegram Verify] Checking registration for:', phone);
      
//       const checkRes = await fetch(`/api/telegram/check-registration?phone=${encodeURIComponent(phone)}`);
//       const checkData = await checkRes.json();
      
//       if (!checkData.registered) {
//         console.log('[Telegram Verify] Phone not registered, showing modal');
//         setShowRegistrationModal(true);
//         setLoading(false);
//         return;
//       }
      
//       console.log('[Telegram Verify] Phone registered, sending code');

//       // Отправка кода
//       const res = await fetch('/api/telegram/send-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone,
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка отправки кода');
//       }

//       setSessionId(data.sessionId);
//       setSuccess('✓ Код отправлен в Telegram!');
      
//       // Переход к шагу 2 через 1 секунду
//       setTimeout(() => {
//         setStep(2);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Шаг 2: Проверка кода
//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/telegram/verify-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           code,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (data.error?.includes('expired')) {
//           throw new Error('Код истёк. Запросите новый код.');
//         }
//         throw new Error(data.error || 'Неверный код');
//       }

//       setSuccess('✓ Код подтверждён!');
      
//       // Переход к шагу 3
//       setTimeout(() => {
//         setStep(3);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка проверки кода');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Шаг 3: Завершение регистрации
//   const handleCompleteRegistration = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/telegram/complete-registration', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           email: email || null,
//           birthDate: birthDate || null,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка завершения регистрации');
//       }

//       // Редирект на оплату
//       router.push(`/booking/payment?appointment=${data.appointmentId}`);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Повторная отправка кода
//   const handleResendCode = () => {
//     setCode('');
//     setStep(1);
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* Неоновая линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <BookingAnimatedBackground />

//       {/* Header */}
//       <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <div className="mb-3 flex items-center gap-4">
//             <Link href="/" className="group inline-flex items-center gap-3">
//               <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg">
//                 <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
//                 <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
//                   <span className="text-xl">💎</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15]">
//                   Salon Elen
//                 </span>
//                 <span className="block text-xs text-cyan-400/85">
//                   Premium Beauty Experience
//                 </span>
//               </div>
//             </Link>
//           </div>
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[120px]" />

//       {/* Main Content */}
//       <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           {/* Card */}
//           <div className="relative rounded-[32px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(42,171,238,0.5)]">
//             <div className="rounded-[30px] bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl">
//               {/* Header */}
//               <div className="mb-8 text-center">
//                 <motion.div
//                   animate={{
//                     scale: [1, 1.05, 1],
//                     rotate: [0, 5, 0],
//                   }}
//                   transition={{ duration: 3, repeat: Infinity }}
//                   className="mb-4 flex justify-center"
//                 >
//                   <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-400/70 bg-gradient-to-br from-blue-400/25 to-slate-900">
//                     <FaTelegram className="h-12 w-12 text-[#2AABEE]" />
//                   </div>
//                 </motion.div>

//                 <h1 className="brand-script mb-2 text-3xl font-bold">
//                   <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-cyan-200 bg-clip-text text-transparent">
//                     {t('booking_telegram_verify_title')}
//                   </span>
//                 </h1>
//                 <p className="text-sm text-slate-300">
//                   {t('booking_telegram_verify_subtitle')}
//                 </p>
//               </div>

//               {/* Progress Steps */}
//               <div className="mb-8 flex items-center justify-center gap-3">
//                 {[1, 2, 3].map((s) => (
//                   <React.Fragment key={s}>
//                     <motion.div
//                       animate={{
//                         scale: step >= s ? 1 : 0.8,
//                         backgroundColor: step >= s ? '#2AABEE' : '#334155',
//                       }}
//                       className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
//                     >
//                       {step > s ? <CheckCircle className="h-6 w-6" /> : s}
//                     </motion.div>
//                     {s < 3 && (
//                       <div
//                         className={`h-1 w-12 rounded-full transition-colors ${
//                           step > s ? 'bg-blue-400' : 'bg-slate-700'
//                         }`}
//                       />
//                     )}
//                   </React.Fragment>
//                 ))}
//               </div>

//               {/* Messages */}
//               <AnimatePresence mode="wait">
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
//                   >
//                     ⚠️ {error}
//                   </motion.div>
//                 )}

//                 {success && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200"
//                   >
//                     ✓ {success}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Forms */}
//               <AnimatePresence mode="wait">
//                 {/* STEP 1: PHONE */}
//                 {step === 1 && (
//                   <motion.form
//                     key="step1"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleSendCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step1_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step1_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_phone_label')}
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                         <input
//                           type="tel"
//                           value={phone}
//                           onChange={(e) => setPhone(e.target.value)}
//                           placeholder={t('booking_telegram_verify_phone_placeholder')}
//                           required
//                           className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                         />
//                       </div>
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_phone_hint')}
//                       </p>
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={loading || !phone}
//                       className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {loading ? (
//                         <>
//                           <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                           {t('booking_telegram_verify_sending')}
//                         </>
//                       ) : (
//                         <>
//                           <Send className="h-5 w-5" />
//                           {t('booking_telegram_verify_send_code')}
//                           <ArrowRight className="h-5 w-5" />
//                         </>
//                       )}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 2: CODE */}
//                 {step === 2 && (
//                   <motion.form
//                     key="step2"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleVerifyCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step2_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step2_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_code_label')}
//                       </label>
//                       <input
//                         type="text"
//                         value={code}
//                         onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                         placeholder={t('booking_telegram_verify_code_placeholder')}
//                         required
//                         maxLength={6}
//                         className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 px-4 text-center text-2xl font-bold tracking-widest text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                       />
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_code_hint')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(1)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading || code.length !== 6}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_checking')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_check_code')}
//                           </>
//                         )}
//                       </button>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={handleResendCode}
//                       disabled={loading}
//                       className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:opacity-60"
//                     >
//                       {t('booking_telegram_verify_resend')}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 3: INFO */}
//                 {step === 3 && (
//                   <motion.form
//                     key="step3"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleCompleteRegistration}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step3_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step3_subtitle')}
//                       </p>

//                       <div className="space-y-4">
//                         {/* Email */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_email_label')}
//                           </label>
//                           <div className="relative">
//                             <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="email"
//                               value={email}
//                               onChange={(e) => setEmail(e.target.value)}
//                               placeholder={t('booking_telegram_verify_email_placeholder')}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_email_hint')}
//                           </p>
//                         </div>

//                         {/* Birth Date */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_birth_label')}
//                           </label>
//                           <div className="relative">
//                             <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="date"
//                               value={birthDate}
//                               onChange={(e) => setBirthDate(e.target.value)}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_birth_hint')}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
//                       <p className="text-xs text-purple-200">
//                         <Shield className="mr-2 inline-block h-3 w-3" />
//                         {t('booking_telegram_verify_privacy')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(2)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_completing')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_complete')}
//                             <ArrowRight className="h-5 w-5" />
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </motion.form>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       {/* Модальное окно регистрации в боте */}
//       <TelegramRegistrationModal
//         isOpen={showRegistrationModal}
//         onClose={() => {
//           setShowRegistrationModal(false);
//           // После закрытия - повторить отправку кода
//           handleSendCode({ preventDefault: () => {} } as React.FormEvent);
//         }}
//         botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'salon_elen_bot'}
//         phone={phone}
//       />

//       <style jsx global>{`
//         .brand-script {
//           font-family: 'Cormorant Infant', 'Playfair Display', serif;
//           font-style: italic;
//           font-weight: 600;
//         }
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }





//------------обновляем переход для первой регистрации в телеге--------
// // src/app/booking/telegram-verify/page.tsx
// // ИСПРАВЛЕНО: Убраны все `any`, обновлены i18n ключи
// 'use client';

// import React, { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaTelegram } from 'react-icons/fa';
// import { Phone, Shield, Mail, Calendar, Send, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';
// import { BookingAnimatedBackground } from '@/components/layout/BookingAnimatedBackground';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { useTranslations } from '@/i18n/useTranslations';

// export default function TelegramVerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const t = useTranslations();

//   // Параметры бронирования
//   const serviceId = searchParams.get('s') || '';
//   const masterId = searchParams.get('m') || '';
//   const startAt = searchParams.get('start') || '';
//   const endAt = searchParams.get('end') || '';
//   const selectedDate = searchParams.get('d') || '';

//   // ✅ ВСЕ ХУКИ НАВЕРХУ - ДО ЛЮБЫХ УСЛОВИЙ!
//   const [step, setStep] = useState(1); // 1: phone, 2: code, 3: info
//   const [phone, setPhone] = useState('');
//   const [code, setCode] = useState('');
//   const [email, setEmail] = useState('');
//   const [birthDate, setBirthDate] = useState('');
//   const [sessionId, setSessionId] = useState('');
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   // Проверка параметров (ПОСЛЕ хуков!)
//   const hasInvalidParams = !serviceId || !masterId || !startAt || !endAt || !selectedDate;

//   // Если параметры невалидны, показываем ошибку (но хуки уже вызваны!)
//   if (hasInvalidParams) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
//         <div className="text-center">
//           <h1 className="mb-4 text-2xl font-bold text-red-400">
//             {t('booking_telegram_verify_error_title')}
//           </h1>
//           <p className="mb-6 text-slate-300">
//             {t('booking_telegram_verify_error_missing')}
//           </p>
//           <Link
//             href="/booking/services"
//             className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600"
//           >
//             {t('booking_telegram_verify_error_return')}
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const BOOKING_STEPS = [
//     { id: 'services', label: t('booking_step_services'), icon: '✨' },
//     { id: 'master', label: t('booking_step_master'), icon: '👤' },
//     { id: 'calendar', label: t('booking_step_date'), icon: '📅' },
//     { id: 'client', label: t('booking_step_client'), icon: '📝' },
//     { id: 'verify', label: t('booking_step_verify'), icon: '✓' },
//     { id: 'payment', label: t('booking_step_payment'), icon: '💳' },
//   ];

//   // Шаг 1: Отправка кода
//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch('/api/telegram/send-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone,
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка отправки кода');
//       }

//       setSessionId(data.sessionId);
//       setSuccess('✓ Код отправлен в Telegram!');
      
//       // Переход к шагу 2 через 1 секунду
//       setTimeout(() => {
//         setStep(2);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Шаг 2: Проверка кода
//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/telegram/verify-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           code,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (data.error?.includes('expired')) {
//           throw new Error('Код истёк. Запросите новый код.');
//         }
//         throw new Error(data.error || 'Неверный код');
//       }

//       setSuccess('✓ Код подтверждён!');
      
//       // Переход к шагу 3
//       setTimeout(() => {
//         setStep(3);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка проверки кода');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Шаг 3: Завершение регистрации
//   const handleCompleteRegistration = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/telegram/complete-registration', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           email: email || null,
//           birthDate: birthDate || null,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Ошибка завершения регистрации');
//       }

//       // Редирект на оплату
//       router.push(`/booking/payment?appointment=${data.appointmentId}`);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка завершения регистрации');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Повторная отправка кода
//   const handleResendCode = () => {
//     setCode('');
//     setStep(1);
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* Неоновая линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <BookingAnimatedBackground />

//       {/* Header */}
//       <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <div className="mb-3 flex items-center gap-4">
//             <Link href="/" className="group inline-flex items-center gap-3">
//               <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg">
//                 <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
//                 <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
//                   <span className="text-xl">💎</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15]">
//                   Salon Elen
//                 </span>
//                 <span className="block text-xs text-cyan-400/85">
//                   Premium Beauty Experience
//                 </span>
//               </div>
//             </Link>
//           </div>
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[120px]" />

//       {/* Main Content */}
//       <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           {/* Card */}
//           <div className="relative rounded-[32px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(42,171,238,0.5)]">
//             <div className="rounded-[30px] bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl">
//               {/* Header */}
//               <div className="mb-8 text-center">
//                 <motion.div
//                   animate={{
//                     scale: [1, 1.05, 1],
//                     rotate: [0, 5, 0],
//                   }}
//                   transition={{ duration: 3, repeat: Infinity }}
//                   className="mb-4 flex justify-center"
//                 >
//                   <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-400/70 bg-gradient-to-br from-blue-400/25 to-slate-900">
//                     <FaTelegram className="h-12 w-12 text-[#2AABEE]" />
//                   </div>
//                 </motion.div>

//                 <h1 className="brand-script mb-2 text-3xl font-bold">
//                   <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-cyan-200 bg-clip-text text-transparent">
//                     {t('booking_telegram_verify_title')}
//                   </span>
//                 </h1>
//                 <p className="text-sm text-slate-300">
//                   {t('booking_telegram_verify_subtitle')}
//                 </p>
//               </div>

//               {/* Progress Steps */}
//               <div className="mb-8 flex items-center justify-center gap-3">
//                 {[1, 2, 3].map((s) => (
//                   <React.Fragment key={s}>
//                     <motion.div
//                       animate={{
//                         scale: step >= s ? 1 : 0.8,
//                         backgroundColor: step >= s ? '#2AABEE' : '#334155',
//                       }}
//                       className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
//                     >
//                       {step > s ? <CheckCircle className="h-6 w-6" /> : s}
//                     </motion.div>
//                     {s < 3 && (
//                       <div
//                         className={`h-1 w-12 rounded-full transition-colors ${
//                           step > s ? 'bg-blue-400' : 'bg-slate-700'
//                         }`}
//                       />
//                     )}
//                   </React.Fragment>
//                 ))}
//               </div>

//               {/* Messages */}
//               <AnimatePresence mode="wait">
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
//                   >
//                     ⚠️ {error}
//                   </motion.div>
//                 )}

//                 {success && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200"
//                   >
//                     ✓ {success}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Forms */}
//               <AnimatePresence mode="wait">
//                 {/* STEP 1: PHONE */}
//                 {step === 1 && (
//                   <motion.form
//                     key="step1"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleSendCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step1_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step1_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_phone_label')}
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                         <input
//                           type="tel"
//                           value={phone}
//                           onChange={(e) => setPhone(e.target.value)}
//                           placeholder={t('booking_telegram_verify_phone_placeholder')}
//                           required
//                           className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                         />
//                       </div>
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_phone_hint')}
//                       </p>
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={loading || !phone}
//                       className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {loading ? (
//                         <>
//                           <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                           {t('booking_telegram_verify_sending')}
//                         </>
//                       ) : (
//                         <>
//                           <Send className="h-5 w-5" />
//                           {t('booking_telegram_verify_send_code')}
//                           <ArrowRight className="h-5 w-5" />
//                         </>
//                       )}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 2: CODE */}
//                 {step === 2 && (
//                   <motion.form
//                     key="step2"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleVerifyCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step2_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step2_subtitle')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_verify_code_label')}
//                       </label>
//                       <input
//                         type="text"
//                         value={code}
//                         onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                         placeholder={t('booking_telegram_verify_code_placeholder')}
//                         required
//                         maxLength={6}
//                         className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 px-4 text-center text-2xl font-bold tracking-widest text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                       />
//                       <p className="mt-2 text-xs text-slate-400">
//                         {t('booking_telegram_verify_code_hint')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(1)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading || code.length !== 6}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_checking')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_check_code')}
//                           </>
//                         )}
//                       </button>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={handleResendCode}
//                       disabled={loading}
//                       className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:opacity-60"
//                     >
//                       {t('booking_telegram_verify_resend')}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 3: INFO */}
//                 {step === 3 && (
//                   <motion.form
//                     key="step3"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleCompleteRegistration}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_verify_step3_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_verify_step3_subtitle')}
//                       </p>

//                       <div className="space-y-4">
//                         {/* Email */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_email_label')}
//                           </label>
//                           <div className="relative">
//                             <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="email"
//                               value={email}
//                               onChange={(e) => setEmail(e.target.value)}
//                               placeholder={t('booking_telegram_verify_email_placeholder')}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_email_hint')}
//                           </p>
//                         </div>

//                         {/* Birth Date */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_verify_birth_label')}
//                           </label>
//                           <div className="relative">
//                             <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="date"
//                               value={birthDate}
//                               onChange={(e) => setBirthDate(e.target.value)}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                           <p className="mt-2 text-xs text-slate-400">
//                             {t('booking_telegram_verify_birth_hint')}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
//                       <p className="text-xs text-purple-200">
//                         <Shield className="mr-2 inline-block h-3 w-3" />
//                         {t('booking_telegram_verify_privacy')}
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(2)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verify_completing')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_complete')}
//                             <ArrowRight className="h-5 w-5" />
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </motion.form>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       <style jsx global>{`
//         .brand-script {
//           font-family: 'Cormorant Infant', 'Playfair Display', serif;
//           font-style: italic;
//           font-weight: 600;
//         }
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }





// //src/app/booking/telegram-verify/page.tsx  
// 'use client';

// import React, { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaTelegram } from 'react-icons/fa';
// import { Phone, Shield, Mail, Calendar, Send, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';
// import { BookingAnimatedBackground } from '@/components/layout/BookingAnimatedBackground';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { useTranslations } from '@/i18n/useTranslations';

// export default function TelegramVerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const t = useTranslations();

//   // Параметры бронирования
//   const serviceId = searchParams.get('s') || '';
//   const masterId = searchParams.get('m') || '';
//   const startAt = searchParams.get('start') || '';
//   const endAt = searchParams.get('end') || '';
//   const selectedDate = searchParams.get('d') || '';

//   // Состояние
//   const [step, setStep] = useState(1); // 1: phone, 2: code, 3: info
//   const [phone, setPhone] = useState('');
//   const [code, setCode] = useState('');
//   const [email, setEmail] = useState('');
//   const [birthDate, setBirthDate] = useState('');
//   const [sessionId, setSessionId] = useState('');
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const BOOKING_STEPS = [
//     { id: 'services', label: t('booking_step_services'), icon: '✨' },
//     { id: 'master', label: t('booking_step_master'), icon: '👤' },
//     { id: 'calendar', label: t('booking_step_date'), icon: '📅' },
//     { id: 'client', label: t('booking_step_client'), icon: '📝' },
//     { id: 'verify', label: t('booking_step_verify'), icon: '✓' },
//     { id: 'payment', label: t('booking_step_payment'), icon: '💳' },
//   ];

//   // Шаг 1: Отправка кода
//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch('/api/telegram/send-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone,
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || t('booking_telegram_error'));
//       }

//       setSessionId(data.sessionId);
//       setSuccess(t('booking_telegram_code_sent'));
      
//       // Переход к шагу 2 через 1 секунду
//       setTimeout(() => {
//         setStep(2);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : t('booking_telegram_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Шаг 2: Проверка кода
//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/telegram/verify-code', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           code,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (data.error?.includes('expired')) {
//           throw new Error(t('booking_telegram_code_expired'));
//         }
//         throw new Error(data.error || t('booking_telegram_invalid_code'));
//       }

//       setSuccess('✓ Код подтверждён!');
      
//       // Переход к шагу 3
//       setTimeout(() => {
//         setStep(3);
//         setSuccess(null);
//       }, 1000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : t('booking_telegram_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Шаг 3: Завершение регистрации
//   const handleCompleteRegistration = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/telegram/complete-registration', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           email: email || null,
//           birthDate: birthDate || null,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || t('booking_telegram_error'));
//       }

//       // Редирект на оплату
//       router.push(`/booking/payment?appointment=${data.appointmentId}`);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : t('booking_telegram_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Повторная отправка кода
//   const handleResendCode = async () => {
//     setCode('');
//     await handleSendCode(new Event('submit') as any);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* Неоновая линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <BookingAnimatedBackground />

//       {/* Header */}
//       <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <div className="mb-3 flex items-center gap-4">
//             <Link href="/" className="group inline-flex items-center gap-3">
//               <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg">
//                 <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
//                 <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
//                   <span className="text-xl">💎</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15]">
//                   Salon Elen
//                 </span>
//                 <span className="block text-xs text-cyan-400/85">
//                   Premium Beauty Experience
//                 </span>
//               </div>
//             </Link>
//           </div>
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[120px]" />

//       {/* Main Content */}
//       <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           {/* Card */}
//           <div className="relative rounded-[32px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(42,171,238,0.5)]">
//             <div className="rounded-[30px] bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 backdrop-blur-xl">
//               {/* Header */}
//               <div className="mb-8 text-center">
//                 <motion.div
//                   animate={{
//                     scale: [1, 1.05, 1],
//                     rotate: [0, 5, 0],
//                   }}
//                   transition={{ duration: 3, repeat: Infinity }}
//                   className="mb-4 flex justify-center"
//                 >
//                   <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-400/70 bg-gradient-to-br from-blue-400/25 to-slate-900">
//                     <FaTelegram className="h-12 w-12 text-[#2AABEE]" />
//                   </div>
//                 </motion.div>

//                 <h1 className="brand-script mb-2 text-3xl font-bold">
//                   <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-cyan-200 bg-clip-text text-transparent">
//                     {t('booking_telegram_title')}
//                   </span>
//                 </h1>
//                 <p className="text-sm text-slate-300">
//                   {t('booking_telegram_subtitle')}
//                 </p>
//               </div>

//               {/* Progress Steps */}
//               <div className="mb-8 flex items-center justify-center gap-3">
//                 {[1, 2, 3].map((s) => (
//                   <React.Fragment key={s}>
//                     <motion.div
//                       animate={{
//                         scale: step >= s ? 1 : 0.8,
//                         backgroundColor: step >= s ? '#2AABEE' : '#334155',
//                       }}
//                       className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
//                     >
//                       {step > s ? <CheckCircle className="h-6 w-6" /> : s}
//                     </motion.div>
//                     {s < 3 && (
//                       <div
//                         className={`h-1 w-12 rounded-full transition-colors ${
//                           step > s ? 'bg-blue-400' : 'bg-slate-700'
//                         }`}
//                       />
//                     )}
//                   </React.Fragment>
//                 ))}
//               </div>

//               {/* Messages */}
//               <AnimatePresence mode="wait">
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
//                   >
//                     ⚠️ {error}
//                   </motion.div>
//                 )}

//                 {success && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="mb-4 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200"
//                   >
//                     ✓ {success}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Forms */}
//               <AnimatePresence mode="wait">
//                 {/* STEP 1: PHONE */}
//                 {step === 1 && (
//                   <motion.form
//                     key="step1"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleSendCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_step1_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_step1_desc')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_phone_label')}
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                         <input
//                           type="tel"
//                           value={phone}
//                           onChange={(e) => setPhone(e.target.value)}
//                           placeholder={t('booking_telegram_phone_placeholder')}
//                           required
//                           className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                         />
//                       </div>
//                     </div>

//                     {/* Telegram Bot Link */}
//                     <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-4">
//                       <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-300">
//                         <Shield className="h-4 w-4" />
//                         {t('booking_telegram_bot_info')}
//                       </div>
//                       <a
//                         href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
//                       >
//                         <FaTelegram className="h-4 w-4" />
//                         {t('booking_telegram_open_bot')}
//                       </a>
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={loading || !phone}
//                       className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {loading ? (
//                         <>
//                           <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                           {t('booking_telegram_sending')}
//                         </>
//                       ) : (
//                         <>
//                           <Send className="h-5 w-5" />
//                           {t('booking_telegram_send_code')}
//                           <ArrowRight className="h-5 w-5" />
//                         </>
//                       )}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 2: CODE */}
//                 {step === 2 && (
//                   <motion.form
//                     key="step2"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleVerifyCode}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_step2_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_step2_desc')}
//                       </p>

//                       <label className="mb-2 block text-sm font-medium text-slate-300">
//                         {t('booking_telegram_code_label')}
//                       </label>
//                       <input
//                         type="text"
//                         value={code}
//                         onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                         placeholder={t('booking_telegram_code_placeholder')}
//                         required
//                         maxLength={6}
//                         className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 px-4 text-center text-2xl font-bold tracking-widest text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                       />
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(1)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading || code.length !== 6}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_verifying')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_verify_code')}
//                           </>
//                         )}
//                       </button>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={handleResendCode}
//                       disabled={loading}
//                       className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:opacity-60"
//                     >
//                       {t('booking_telegram_resend_code')}
//                     </button>
//                   </motion.form>
//                 )}

//                 {/* STEP 3: INFO */}
//                 {step === 3 && (
//                   <motion.form
//                     key="step3"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: 20 }}
//                     onSubmit={handleCompleteRegistration}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="mb-2 font-bold text-blue-300">
//                         {t('booking_telegram_step3_title')}
//                       </h3>
//                       <p className="mb-4 text-sm text-slate-400">
//                         {t('booking_telegram_step3_desc')}
//                       </p>

//                       <div className="space-y-4">
//                         {/* Email */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_email_label')}
//                           </label>
//                           <div className="relative">
//                             <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="email"
//                               value={email}
//                               onChange={(e) => setEmail(e.target.value)}
//                               placeholder={t('booking_telegram_email_placeholder')}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                         </div>

//                         {/* Birth Date */}
//                         <div>
//                           <label className="mb-2 block text-sm font-medium text-slate-300">
//                             {t('booking_telegram_birthdate_label')}
//                           </label>
//                           <div className="relative">
//                             <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
//                             <input
//                               type="date"
//                               value={birthDate}
//                               onChange={(e) => setBirthDate(e.target.value)}
//                               className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-400 focus:outline-none"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setStep(2)}
//                         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 font-medium text-slate-300 transition-colors hover:border-slate-600"
//                       >
//                         <ArrowLeft className="h-5 w-5" />
//                         Назад
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={loading}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? (
//                           <>
//                             <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                             {t('booking_telegram_completing')}
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle className="h-5 w-5" />
//                             {t('booking_telegram_complete')}
//                             <ArrowRight className="h-5 w-5" />
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </motion.form>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       <style jsx global>{`
//         .brand-script {
//           font-family: 'Cormorant Infant', 'Playfair Display', serif;
//           font-style: italic;
//           font-weight: 600;
//         }
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }