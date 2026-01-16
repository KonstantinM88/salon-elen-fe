// src/app/booking/sms-verify/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/useTranslations';

type SendPinResponse =
  | { ok: true; registrationId: string; phone: string; expiresIn: number; cooldownSeconds?: number }
  | { ok: false; error: string; cooldownSeconds?: number };

type VerifyPinResponse =
  | { ok: true; registrationId: string }
  | { ok: false; error: string };

type ResendResponse =
  | { ok: true; message: string; expiresIn: number; cooldownSeconds?: number }
  | { ok: false; error: string; cooldownSeconds?: number };

export default function SmsVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const serviceId = searchParams.get('s');
  const masterId = searchParams.get('m');
  const startAt = searchParams.get('start');
  const endAt = searchParams.get('end');
  const selectedDate = searchParams.get('d');

  const [step, setStep] = useState<'phone' | 'pin'>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NEW: cooldown timer for resend
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const id = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [cooldown]);

  // Валидация параметров
  if (!serviceId || !masterId || !startAt || !endAt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">{t('booking_sms_verify_error_title')}</h1>
          <p className="text-gray-400 mb-6">{t('booking_sms_verify_error_missing_params')}</p>
          <button
            onClick={() => router.push('/booking/client')}
            className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-xl hover:bg-[#FFD700] transition-all"
          >
            {t('booking_sms_verify_error_return')}
          </button>
        </div>
      </div>
    );
  }

  // Отправка телефона и запрос PIN
  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError(t('booking_sms_verify_phone_required'));
      return;
    }

    if (!phone.trim().startsWith('+')) {
      setError(t('booking_sms_verify_phone_hint'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/booking/client/sms-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          masterId,
          startAt,
          endAt,
          phone: phone.trim(),
        }),
      });

      const data = (await response.json()) as SendPinResponse;

      if (!data.ok) {
        // If server returned cooldown info, start timer
        if (data.cooldownSeconds && data.cooldownSeconds > 0) {
          setCooldown(data.cooldownSeconds);
        }
        throw new Error(data.error || t('booking_client_auth_error'));
      }

      setRegistrationId(data.registrationId);
      setStep('pin');

      // start cooldown after successful send
      setCooldown(data.cooldownSeconds ?? 60);
    } catch (err) {
      console.error('Error sending PIN:', err);
      setError(err instanceof Error ? err.message : t('booking_client_auth_error'));
    } finally {
      setLoading(false);
    }
  };

  // Верификация PIN
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin.trim() || pin.trim().length !== 4) {
      setError(t('booking_sms_verify_pin_hint'));
      return;
    }

    if (!registrationId) {
      setError(t('booking_sms_details_error_missing_id'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/booking/client/sms-phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId,
          pin: pin.trim(),
        }),
      });

      const data = (await response.json()) as VerifyPinResponse;

      if (!data.ok) {
        throw new Error(data.error || t('booking_client_auth_error'));
      }

      router.push(`/booking/sms-details?registrationId=${data.registrationId}`);
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setError(err instanceof Error ? err.message : t('booking_client_auth_error'));
      setLoading(false);
    }
  };

  // Повторная отправка PIN
  const handleResendPin = async () => {
    if (!registrationId) return;
    if (cooldown > 0) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/booking/client/sms-phone/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });

      const data = (await response.json()) as ResendResponse;

      if (!data.ok) {
        if (data.cooldownSeconds && data.cooldownSeconds > 0) {
          setCooldown(data.cooldownSeconds);
        }
        throw new Error(data.error || t('booking_client_auth_error'));
      }

      setPin('');
      setError('');

      // restart cooldown after resend
      setCooldown(data.cooldownSeconds ?? 60);
    } catch (err) {
      console.error('Error resending PIN:', err);
      setError(err instanceof Error ? err.message : t('booking_client_auth_error'));
    } finally {
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
                  '0 0 20px rgba(16,185,129,0.6)',
                  '0 0 35px rgba(16,185,129,1)',
                  '0 0 20px rgba(16,185,129,0.6)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-[#0A0A0A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    step === 'phone'
                      ? 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      : 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                  }
                />
              </svg>
            </motion.div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#10B981] mb-3">
              {step === 'phone' ? t('booking_sms_verify_title') : t('booking_sms_verify_pin_title')}
            </h1>

            <p className="text-gray-400 text-sm leading-relaxed">
              {step === 'phone'
                ? t('booking_sms_verify_subtitle')
                : `${t('booking_sms_verify_pin_subtitle')} ${phone}`}
            </p>
          </div>

          {/* PHONE FORM */}
          {step === 'phone' && (
            <form onSubmit={handleSendPin} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#10B981] mb-2">
                  {t('booking_sms_verify_phone_label')} <span className="text-red-400">*</span>
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('booking_sms_verify_phone_placeholder')}
                  required
                  className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                  disabled={loading}
                />

                <p className="mt-2 text-xs text-gray-500">{t('booking_sms_verify_phone_hint')}</p>
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
                    {t('booking_sms_verify_sending')}
                  </div>
                ) : (
                  t('booking_sms_verify_send_pin')
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">🔒 {t('booking_sms_verify_pin_validity')}</p>
            </form>
          )}

          {/* PIN FORM */}
          {step === 'pin' && (
            <form onSubmit={handleVerifyPin} className="space-y-6">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-[#10B981] mb-2">
                  {t('booking_sms_verify_pin_label')} <span className="text-red-400">*</span>
                </label>

                <input
                  id="pin"
                  type="text"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) setPin(value);
                  }}
                  placeholder={t('booking_sms_verify_pin_placeholder')}
                  maxLength={4}
                  required
                  className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                  disabled={loading}
                  autoComplete="one-time-code"
                />

                <p className="mt-2 text-xs text-gray-500 text-center">{t('booking_sms_verify_pin_hint')}</p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || pin.length !== 4}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#10B981] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#10B981]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('booking_sms_verify_checking')}
                    </div>
                  ) : (
                    t('booking_sms_verify_confirm')
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendPin}
                  disabled={loading || cooldown > 0}
                  className="w-full py-3 px-6 bg-transparent border border-[#10B981]/30 text-gray-300 hover:border-[#10B981] hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0
                    ? `${t('booking_sms_verify_resend')} (${cooldown}s)`
                    : t('booking_sms_verify_resend')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setPin('');
                    setError('');
                    setCooldown(0);
                  }}
                  disabled={loading}
                  className="w-full py-3 px-6 text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('booking_sms_verify_change_phone')}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">🔒 {t('booking_sms_verify_pin_validity_note')}</p>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">{t('booking_sms_verify_contact')}</p>
        </div>
      </div>
    </div>
  );
}






//-----------обновляем таймер--------
// // src/app/booking/sms-verify/page.tsx
// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useTranslations } from '@/i18n/useTranslations';

// export default function SmsVerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const t = useTranslations();

//   const serviceId = searchParams.get('s');
//   const masterId = searchParams.get('m');
//   const startAt = searchParams.get('start');
//   const endAt = searchParams.get('end');
//   const selectedDate = searchParams.get('d');

//   const [step, setStep] = useState<'phone' | 'pin'>('phone');
//   const [phone, setPhone] = useState('');
//   const [pin, setPin] = useState('');
//   const [registrationId, setRegistrationId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Валидация параметров
//   if (!serviceId || !masterId || !startAt || !endAt) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
//         <div className="max-w-md w-full text-center">
//           <h1 className="text-2xl font-bold text-red-400 mb-4">{t('booking_sms_verify_error_title')}</h1>
//           <p className="text-gray-400 mb-6">
//             {t('booking_sms_verify_error_missing_params')}
//           </p>
//           <button
//             onClick={() => router.push('/booking/client')}
//             className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-xl hover:bg-[#FFD700] transition-all"
//           >
//             {t('booking_sms_verify_error_return')}
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Отправка телефона и запрос PIN
//   const handleSendPin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!phone.trim()) {
//       setError(t('booking_sms_verify_phone_required'));
//       return;
//     }

//     if (!phone.trim().startsWith('+')) {
//       setError(t('booking_sms_verify_phone_hint'));
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/booking/client/sms-phone', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//           phone: phone.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (!data.ok) {
//         throw new Error(data.error || t('booking_client_auth_error'));
//       }

//       console.log('✅ PIN sent:', data);
//       setRegistrationId(data.registrationId);
//       setStep('pin');
//     } catch (err) {
//       console.error('Error sending PIN:', err);
//       setError(err instanceof Error ? err.message : t('booking_client_auth_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Верификация PIN
//   const handleVerifyPin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!pin.trim() || pin.trim().length !== 4) {
//       setError(t('booking_sms_verify_pin_hint'));
//       return;
//     }

//     if (!registrationId) {
//       setError(t('booking_sms_details_error_missing_id'));
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/booking/client/sms-phone/verify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           registrationId,
//           pin: pin.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (!data.ok) {
//         throw new Error(data.error || t('booking_client_auth_error'));
//       }

//       console.log('✅ PIN verified:', data.registrationId);

//       // Редирект на страницу ввода данных
//       router.push(`/booking/sms-details?registrationId=${data.registrationId}`);
//     } catch (err) {
//       console.error('Error verifying PIN:', err);
//       setError(err instanceof Error ? err.message : t('booking_client_auth_error'));
//       setLoading(false);
//     }
//   };

//   // Повторная отправка PIN
//   const handleResendPin = async () => {
//     if (!registrationId) return;

//     setError('');
//     setLoading(true);

//     try {
//       const response = await fetch('/api/booking/client/sms-phone/resend', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ registrationId }),
//       });

//       const data = await response.json();

//       if (!data.ok) {
//         throw new Error(data.error || t('booking_client_auth_error'));
//       }

//       console.log('✅ PIN resent');
//       setPin(''); // Очищаем поле
//       setError('');
//     } catch (err) {
//       console.error('Error resending PIN:', err);
//       setError(err instanceof Error ? err.message : t('booking_client_auth_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
//       <div className="max-w-md w-full">
//         <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-[#10B981]/20">
//           {/* Иконка */}
//           <div className="flex justify-center mb-6">
//             <motion.div
//               animate={{
//                 boxShadow: [
//                   "0 0 20px rgba(16,185,129,0.6)",
//                   "0 0 35px rgba(16,185,129,1)",
//                   "0 0 20px rgba(16,185,129,0.6)",
//                 ],
//               }}
//               transition={{ duration: 2, repeat: Infinity }}
//               className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center"
//             >
//               <svg
//                 className="w-10 h-10 text-[#0A0A0A]"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d={step === 'phone' 
//                     ? "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                     : "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
//                   }
//                 />
//               </svg>
//             </motion.div>
//           </div>

//           {/* Заголовок */}
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-[#10B981] mb-3">
//               {step === 'phone' ? t('booking_sms_verify_title') : t('booking_sms_verify_pin_title')}
//             </h1>
            
//             <p className="text-gray-400 text-sm leading-relaxed">
//               {step === 'phone' 
//                 ? t('booking_sms_verify_subtitle')
//                 : `${t('booking_sms_verify_pin_subtitle')} ${phone}`
//               }
//             </p>
//           </div>

//           {/* ФОРМА ТЕЛЕФОНА */}
//           {step === 'phone' && (
//             <form onSubmit={handleSendPin} className="space-y-6">
//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-[#10B981] mb-2">
//                   {t('booking_sms_verify_phone_label')} <span className="text-red-400">*</span>
//                 </label>
                
//                 <input
//                   id="phone"
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder={t('booking_sms_verify_phone_placeholder')}
//                   required
//                   className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
//                   disabled={loading}
//                   autoComplete="tel"
//                 />
                
//                 <p className="mt-2 text-xs text-gray-500">
//                   {t('booking_sms_verify_phone_hint')}
//                 </p>
//               </div>

//               {error && (
//                 <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
//                   <p className="text-red-400 text-sm text-center">{error}</p>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-4 px-6 bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#10B981] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#10B981]/50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center">
//                     <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                     </svg>
//                     {t('booking_sms_verify_sending')}
//                   </div>
//                 ) : (
//                   t('booking_sms_verify_send_pin')
//                 )}
//               </button>

//               <p className="text-center text-xs text-gray-500 mt-4">
//                 🔒 {t('booking_sms_verify_pin_validity')}
//               </p>
//             </form>
//           )}

//           {/* ФОРМА PIN */}
//           {step === 'pin' && (
//             <form onSubmit={handleVerifyPin} className="space-y-6">
//               <div>
//                 <label htmlFor="pin" className="block text-sm font-medium text-[#10B981] mb-2">
//                   {t('booking_sms_verify_pin_label')} <span className="text-red-400">*</span>
//                 </label>
                
//                 <input
//                   id="pin"
//                   type="text"
//                   value={pin}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '');
//                     if (value.length <= 4) setPin(value);
//                   }}
//                   placeholder={t('booking_sms_verify_pin_placeholder')}
//                   maxLength={4}
//                   required
//                   className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
//                   disabled={loading}
//                   autoComplete="one-time-code"
//                 />
                
//                 <p className="mt-2 text-xs text-gray-500 text-center">
//                   {t('booking_sms_verify_pin_hint')}
//                 </p>
//               </div>

//               {error && (
//                 <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
//                   <p className="text-red-400 text-sm text-center">{error}</p>
//                 </div>
//               )}

//               <div className="space-y-3">
//                 <button
//                   type="submit"
//                   disabled={loading || pin.length !== 4}
//                   className="w-full py-4 px-6 bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#10B981] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#10B981]/50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? (
//                     <div className="flex items-center justify-center">
//                       <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       {t('booking_sms_verify_checking')}
//                     </div>
//                   ) : (
//                     t('booking_sms_verify_confirm')
//                   )}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleResendPin}
//                   disabled={loading}
//                   className="w-full py-3 px-6 bg-transparent border border-[#10B981]/30 text-gray-300 hover:border-[#10B981] hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {t('booking_sms_verify_resend')}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setStep('phone');
//                     setPin('');
//                     setError('');
//                   }}
//                   disabled={loading}
//                   className="w-full py-3 px-6 text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {t('booking_sms_verify_change_phone')}
//                 </button>
//               </div>

//               <p className="text-center text-xs text-gray-500 mt-4">
//                 🔒 {t('booking_sms_verify_pin_validity_note')}
//               </p>
//             </form>
//           )}
//         </div>

//         <div className="mt-6 text-center">
//           <p className="text-gray-500 text-sm">
//             {t('booking_sms_verify_contact')}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }





//------добавляем перевод-----------
// // src/app/booking/sms-verify/page.tsx
// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useState } from 'react';
// import { motion } from 'framer-motion';

// export default function SmsVerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const serviceId = searchParams.get('s');
//   const masterId = searchParams.get('m');
//   const startAt = searchParams.get('start');
//   const endAt = searchParams.get('end');
//   const selectedDate = searchParams.get('d');

//   const [step, setStep] = useState<'phone' | 'pin'>('phone');
//   const [phone, setPhone] = useState('');
//   const [pin, setPin] = useState('');
//   const [registrationId, setRegistrationId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Валидация параметров
//   if (!serviceId || !masterId || !startAt || !endAt) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
//         <div className="max-w-md w-full text-center">
//           <h1 className="text-2xl font-bold text-red-400 mb-4">⚠️ Ошибка</h1>
//           <p className="text-gray-400 mb-6">
//             Недостаточно параметров. Пожалуйста, начните запись заново.
//           </p>
//           <button
//             onClick={() => router.push('/booking/client')}
//             className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-xl hover:bg-[#FFD700] transition-all"
//           >
//             Вернуться к записи
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Отправка телефона и запрос PIN
//   const handleSendPin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!phone.trim()) {
//       setError('Введите номер телефона');
//       return;
//     }

//     if (!phone.trim().startsWith('+')) {
//       setError('Номер должен начинаться с + и кода страны (например: +49177...)');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/booking/client/sms-phone', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//           phone: phone.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Ошибка при отправке PIN');
//       }

//       console.log('✅ PIN sent:', data);
//       setRegistrationId(data.registrationId);
//       setStep('pin');
//     } catch (err) {
//       console.error('Error sending PIN:', err);
//       setError(err instanceof Error ? err.message : 'Произошла ошибка');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Верификация PIN
//   const handleVerifyPin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!pin.trim() || pin.trim().length !== 4) {
//       setError('Введите 4-значный PIN');
//       return;
//     }

//     if (!registrationId) {
//       setError('Отсутствует ID регистрации');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/booking/client/sms-phone/verify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           registrationId,
//           pin: pin.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Ошибка при проверке PIN');
//       }

//       console.log('✅ PIN verified:', data.registrationId);

//       // Редирект на страницу ввода данных
//       router.push(`/booking/sms-details?registrationId=${data.registrationId}`);
//     } catch (err) {
//       console.error('Error verifying PIN:', err);
//       setError(err instanceof Error ? err.message : 'Произошла ошибка');
//       setLoading(false);
//     }
//   };

//   // Повторная отправка PIN
//   const handleResendPin = async () => {
//     if (!registrationId) return;

//     setError('');
//     setLoading(true);

//     try {
//       const response = await fetch('/api/booking/client/sms-phone/resend', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ registrationId }),
//       });

//       const data = await response.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Ошибка при повторной отправке');
//       }

//       console.log('✅ PIN resent');
//       setPin(''); // Очищаем поле
//       setError('');
//     } catch (err) {
//       console.error('Error resending PIN:', err);
//       setError(err instanceof Error ? err.message : 'Произошла ошибка');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
//       <div className="max-w-md w-full">
//         <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-[#10B981]/20">
//           {/* Иконка */}
//           <div className="flex justify-center mb-6">
//             <motion.div
//               animate={{
//                 boxShadow: [
//                   "0 0 20px rgba(16,185,129,0.6)",
//                   "0 0 35px rgba(16,185,129,1)",
//                   "0 0 20px rgba(16,185,129,0.6)",
//                 ],
//               }}
//               transition={{ duration: 2, repeat: Infinity }}
//               className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center"
//             >
//               <svg
//                 className="w-10 h-10 text-[#0A0A0A]"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d={step === 'phone' 
//                     ? "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                     : "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
//                   }
//                 />
//               </svg>
//             </motion.div>
//           </div>

//           {/* Заголовок */}
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-[#10B981] mb-3">
//               {step === 'phone' ? 'Подтверждение телефона' : 'Введите PIN код'}
//             </h1>
            
//             <p className="text-gray-400 text-sm leading-relaxed">
//               {step === 'phone' 
//                 ? 'Мы отправим вам 4-значный PIN код по SMS'
//                 : `PIN код отправлен на ${phone}`
//               }
//             </p>
//           </div>

//           {/* ФОРМА ТЕЛЕФОНА */}
//           {step === 'phone' && (
//             <form onSubmit={handleSendPin} className="space-y-6">
//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-[#10B981] mb-2">
//                   Номер телефона <span className="text-red-400">*</span>
//                 </label>
                
//                 <input
//                   id="phone"
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder="+49 177 899 5106"
//                   required
//                   className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
//                   disabled={loading}
//                   autoComplete="tel"
//                 />
                
//                 <p className="mt-2 text-xs text-gray-500">
//                   Формат: +[код страны][номер] (например: +4917789951064)
//                 </p>
//               </div>

//               {error && (
//                 <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
//                   <p className="text-red-400 text-sm text-center">{error}</p>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-4 px-6 bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#10B981] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#10B981]/50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center">
//                     <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                     </svg>
//                     Отправка...
//                   </div>
//                 ) : (
//                   'Отправить PIN код'
//                 )}
//               </button>

//               <p className="text-center text-xs text-gray-500 mt-4">
//                 🔒 PIN код будет действителен 10 минут
//               </p>
//             </form>
//           )}

//           {/* ФОРМА PIN */}
//           {step === 'pin' && (
//             <form onSubmit={handleVerifyPin} className="space-y-6">
//               <div>
//                 <label htmlFor="pin" className="block text-sm font-medium text-[#10B981] mb-2">
//                   PIN код <span className="text-red-400">*</span>
//                 </label>
                
//                 <input
//                   id="pin"
//                   type="text"
//                   value={pin}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '');
//                     if (value.length <= 4) setPin(value);
//                   }}
//                   placeholder="0000"
//                   maxLength={4}
//                   required
//                   className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#10B981]/30 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
//                   disabled={loading}
//                   autoComplete="one-time-code"
//                 />
                
//                 <p className="mt-2 text-xs text-gray-500 text-center">
//                   Введите 4-значный PIN код из SMS
//                 </p>
//               </div>

//               {error && (
//                 <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
//                   <p className="text-red-400 text-sm text-center">{error}</p>
//                 </div>
//               )}

//               <div className="space-y-3">
//                 <button
//                   type="submit"
//                   disabled={loading || pin.length !== 4}
//                   className="w-full py-4 px-6 bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#10B981] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#10B981]/50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? (
//                     <div className="flex items-center justify-center">
//                       <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Проверка...
//                     </div>
//                   ) : (
//                     'Подтвердить'
//                   )}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleResendPin}
//                   disabled={loading}
//                   className="w-full py-3 px-6 bg-transparent border border-[#10B981]/30 text-gray-300 hover:border-[#10B981] hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Отправить PIN повторно
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setStep('phone');
//                     setPin('');
//                     setError('');
//                   }}
//                   disabled={loading}
//                   className="w-full py-3 px-6 text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Изменить номер телефона
//                 </button>
//               </div>

//               <p className="text-center text-xs text-gray-500 mt-4">
//                 🔒 PIN код действителен 10 минут • Максимум 3 попытки
//               </p>
//             </form>
//           )}
//         </div>

//         <div className="mt-6 text-center">
//           <p className="text-gray-500 text-sm">
//             Возникли вопросы? Свяжитесь с нами: +49 177 899 5106
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }