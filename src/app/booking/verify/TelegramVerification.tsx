// src/app/booking/verify/TelegramVerification.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTelegram } from 'react-icons/fa';
import { Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { TelegramRegistrationModal } from '@/components/TelegramRegistrationModal';

interface TelegramVerificationProps {
  email: string;
  draftId: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  success: string | null;
  setSuccess: (success: string | null) => void;
  code: string;
  setCode: (code: string) => void;
  onVerifySuccess: (appointmentId: string) => void;
}

export function TelegramVerification({
  email,
  draftId,
  loading,
  setLoading,
  error,
  setError,
  success,
  setSuccess,
  code,
  setCode,
  onVerifySuccess,
}: TelegramVerificationProps) {
  const [phone, setPhone] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [step, setStep] = useState(1); // 1: phone, 2: code
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Шаг 1: Отправка кода в Telegram
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Проверка регистрации в боте
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

      // Отправка кода (используем API с draftId)
      const res = await fetch('/api/telegram/send-code-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          email,
          draftId,
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
      console.error('[Telegram Verify] Send code error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2: Проверка кода
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Telegram Verify] Verifying code:', code);
      
      const res = await fetch('/api/telegram/verify-code-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          code,
          draftId,
        }),
      });

      const data = await res.json();
      console.log('[Telegram Verify] Verify response:', data);

      if (!res.ok) {
        if (data.error?.includes('expired')) {
          throw new Error('Код истёк. Запросите новый код.');
        }
        throw new Error(data.error || 'Неверный код');
      }

      setSuccess('✓ Код подтверждён!');

      // Редирект на оплату
      setTimeout(() => {
        if (data.appointmentId) {
          onVerifySuccess(data.appointmentId);
        }
      }, 1000);
    } catch (err) {
      console.error('[Telegram Verify] Verify error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка проверки кода');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-white/15 bg-slate-900/60 p-5 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 ring-1 ring-sky-400/40">
          <FaTelegram className="h-5 w-5 text-sky-300" />
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-bold text-white">
            Подтверждение через Telegram
          </p>
          <p className="text-slate-300">
            Получите код подтверждения в Telegram боте
          </p>
        </div>
      </div>

      {step === 1 ? (
        /* Шаг 1: Ввод телефона */
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-white">
              Номер телефона
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+380679014039"
              required
              className="w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            />
            <p className="text-xs text-slate-400">
              Используйте номер, зарегистрированный в нашем Telegram боте
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !phone}
            whileHover={!loading ? { scale: 1.02 } : undefined}
            whileTap={!loading ? { scale: 0.98 } : undefined}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3.5 text-base font-bold text-white shadow-[0_0_30px_rgba(56,189,248,0.7)] transition-all hover:shadow-[0_0_40px_rgba(56,189,248,0.9)] disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Отправить код в Telegram
              </>
            )}
          </motion.button>

          <p className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-4 w-4 text-sky-300" />
            Код придёт в Telegram бот в течение нескольких секунд
          </p>
        </form>
      ) : (
        /* Шаг 2: Ввод кода */
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-white">
              Введите код из Telegram
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full rounded-2xl border border-sky-400/50 bg-slate-900/90 px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              autoFocus
            />
            <p className="text-xs text-slate-400">
              Код действителен 10 минут
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={loading || code.length !== 6}
            whileHover={!(loading || code.length !== 6) ? { scale: 1.02 } : undefined}
            whileTap={!(loading || code.length !== 6) ? { scale: 0.98 } : undefined}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.9)] disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Проверка...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Подтвердить код
              </>
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setCode('');
              setError(null);
              setSuccess(null);
            }}
            disabled={loading}
            className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Изменить номер
          </button>
        </form>
      )}

      {/* Модальное окно регистрации в боте */}
      <TelegramRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          // После закрытия - повторить отправку кода
          handleSendCode({ preventDefault: () => {} } as React.FormEvent);
        }}
        botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'salon_elen_bot'}
        phone={phone}
      />
    </div>
  );
}