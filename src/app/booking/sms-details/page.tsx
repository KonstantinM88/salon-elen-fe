// src/app/booking/sms-details/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SmsDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registrationId = searchParams.get('registrationId');

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!registrationId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">⚠️ Ошибка</h1>
          <p className="text-gray-400 mb-6">
            Отсутствует ID регистрации. Пожалуйста, начните запись заново.
          </p>
          <button
            onClick={() => router.push('/booking/client')}
            className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-xl hover:bg-[#FFD700] transition-all"
          >
            Вернуться к записи
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Имя обязательно для заполнения');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/booking/client/sms-phone/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId,
          customerName: customerName.trim(),
          email: email.trim() || undefined,
          birthDate: birthDate || undefined,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Ошибка при завершении регистрации');
      }

      console.log('✅ Registration completed:', data.appointmentId);
      router.push(`/booking/payment?appointment=${data.appointmentId}`);
    } catch (err) {
      console.error('Error completing registration:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
      <div className="max-w-md w-full">
        <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-[#10B981]/20">
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(16,185,129,0.6)",
                  "0 0 35px rgba(16,185,129,1)",
                  "0 0 20px rgba(16,185,129,0.6)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-[#0A0A0A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </motion.div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#10B981] mb-3">Ваши данные</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Пожалуйста, укажите ваше имя и дополнительную информацию
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-[#10B981] mb-2">
                Ваше имя <span className="text-red-400">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Иван Иванов"
                required
                className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#10B981] mb-2">
                Email <span className="text-gray-500 text-xs">(необязательно)</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan@example.com"
                className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                disabled={loading}
                autoComplete="email"
              />
              <p className="mt-2 text-xs text-gray-500">
                Для отправки подтверждения и напоминаний
              </p>
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-[#10B981] mb-2">
                Дата рождения <span className="text-gray-500 text-xs">(необязательно)</span>
              </label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                disabled={loading}
                autoComplete="bday"
              />
              <p className="mt-2 text-xs text-gray-500">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
                  </svg>
                  Нам нужна Ваша дата рождения, чтобы мы могли в будущем предоставить Вам индивидуальную скидку к Вашему празднику!
                </span>
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#10B981] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#10B981]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Сохранение...
                </div>
              ) : (
                'Продолжить к оплате'
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              🔒 Ваши данные защищены и не передаются третьим лицам
            </p>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Возникли вопросы? Свяжитесь с нами: +49 177 899 5106
          </p>
        </div>
      </div>
    </div>
  );
}