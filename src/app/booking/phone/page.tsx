// src/app/booking/phone/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';

export default function PhoneInputForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const registrationId = searchParams.get('registrationId');

  // Если нет registrationId - показываем ошибку
  if (!registrationId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            ⚠️ {t('booking_error_title')}
          </h1>
          <p className="text-gray-400 mb-6">
            {t('booking_client_form_invalid_params')}
          </p>
          <button
            onClick={() => router.push('/booking/client')}
            className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] font-semibold rounded-xl hover:bg-[#FFD700] transition-all"
          >
            {t('booking_client_form_invalid_return')}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация телефона (обязательное поле)
    if (!phone.trim()) {
      setError(t('phone_required'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/booking/client/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          phone: phone.trim(),
          birthday: birthday || undefined, // Отправляем только если заполнено
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || t('booking_error_title'));
      }

      console.log('✅ Registration completed:', data.appointmentId);

      // Если форма открыта во всплывающем окне — сообщаем основной вкладке и закрываемся
      if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
        window.opener.postMessage(
          { type: 'booking-complete', appointmentId: data.appointmentId },
          window.location.origin
        );
        window.close();
        return;
      }

      // Редирект на страницу оплаты (fallback)
      router.push(`/booking/payment?appointment=${data.appointmentId}`);
    } catch (err) {
      console.error('Error completing registration:', err);
      setError(err instanceof Error ? err.message : t('booking_error_title'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
      <div className="max-w-md w-full">
        {/* Карточка формы */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-[#D4AF37]/20">
          {/* Иконка */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#0A0A0A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
          </div>

          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#D4AF37] mb-3">
              {t('phone_title')}
            </h1>
            
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('phone_subtitle')}
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Поле телефона */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-[#D4AF37] mb-2"
              >
                {t('phone_label')} <span className="text-red-400">*</span>
              </label>
              
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 177 899 5106"
                required
                className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                disabled={loading}
              />
              
              <p className="mt-2 text-xs text-gray-500">
                {t('phone_hint')}
              </p>
            </div>

            {/* Поле даты рождения */}
            <div>
              <label 
                htmlFor="birthday" 
                className="block text-sm font-medium text-[#D4AF37] mb-2"
              >
                {t('birthday_label')} <span className="text-gray-500 text-xs">({t('booking_client_form_label_optional')})</span>
              </label>
              
              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Не позже сегодня
                className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                disabled={loading}
              />
              
              <p className="mt-2 text-xs text-gray-500">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
                  </svg>
                  {t('birthday_hint')}
                </span>
              </p>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] hover:from-[#FFD700] hover:to-[#D4AF37] text-[#0A0A0A] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('phone_submitting')}
                  </div>
                ) : (
                  t('phone_submit')
                )}
              </button>
            </div>

            {/* Приватность */}
            <p className="text-center text-xs text-gray-500 mt-4">
              🔒 {t('phone_privacy')}
            </p>
          </form>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Haben Sie Fragen? +49 177 899 5106
          </p>
        </div>
      </div>
    </div>
  );
}





//-------------работает, добавляю переводы и редирект на главную страницу после регистрации---
// // src/app/booking/phone/page.tsx
// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useState } from 'react';

// export default function PhoneInputForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [phone, setPhone] = useState('');
//   const [birthday, setBirthday] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const registrationId = searchParams.get('registrationId');

//   // Если нет registrationId - показываем ошибку
//   if (!registrationId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
//         <div className="max-w-md w-full text-center">
//           <h1 className="text-2xl font-bold text-red-400 mb-4">
//             ⚠️ Ошибка
//           </h1>
//           <p className="text-gray-400 mb-6">
//             Отсутствует ID регистрации. Пожалуйста, начните запись заново.
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

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     // Валидация телефона (ОБЯЗАТЕЛЬНОЕ ПОЛЕ!)
//     if (!phone.trim()) {
//       setError('Номер телефона обязателен');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/booking/client/complete', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           registrationId,
//           phone: phone.trim(),
//           birthday: birthday || undefined, // Отправляем только если заполнено
//         }),
//       });

//       const data = await response.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Ошибка при завершении регистрации');
//       }

//       console.log('✅ Registration completed:', data.appointmentId);

//       // Редирект на страницу payment
//       router.push(`/booking/payment?appointment=${data.appointmentId}`);
//     } catch (err) {
//       console.error('Error completing registration:', err);
//       setError(err instanceof Error ? err.message : 'Произошла ошибка');
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#0A0A0A]">
//       <div className="max-w-md w-full">
//         {/* Карточка формы */}
//         <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-[#D4AF37]/20">
//           {/* Иконка */}
//           <div className="flex justify-center mb-6">
//             <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center">
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
//                   d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                 />
//               </svg>
//             </div>
//           </div>

//           {/* Заголовок */}
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-[#D4AF37] mb-3">
//               Контактная информация
//             </h1>
            
//             <p className="text-gray-400 text-sm leading-relaxed">
//               Укажите ваши контактные данные для связи
//             </p>
//           </div>

//           {/* Форма */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Поле телефона */}
//             <div>
//               <label 
//                 htmlFor="phone" 
//                 className="block text-sm font-medium text-[#D4AF37] mb-2"
//               >
//                 Телефон <span className="text-red-400">*</span>
//               </label>
              
//               <input
//                 id="phone"
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 placeholder="+49 177 899 5106"
//                 required
//                 className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
//                 disabled={loading}
//               />
              
//               <p className="mt-2 text-xs text-gray-500">
//                 Мы свяжемся с вами для подтверждения записи
//               </p>
//             </div>

//             {/* Поле даты рождения */}
//             <div>
//               <label 
//                 htmlFor="birthday" 
//                 className="block text-sm font-medium text-[#D4AF37] mb-2"
//               >
//                 Дата рождения <span className="text-gray-500 text-xs">(необязательно)</span>
//               </label>
              
//               <input
//                 id="birthday"
//                 type="date"
//                 value={birthday}
//                 onChange={(e) => setBirthday(e.target.value)}
//                 max={new Date().toISOString().split('T')[0]} // Не позже сегодня
//                 className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
//                 disabled={loading}
//               />
              
//               <p className="mt-2 text-xs text-gray-500">
//                 <span className="inline-flex items-center">
//                   <svg className="w-4 h-4 mr-1 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
//                   </svg>
//                   Нам нужна Ваша дата рождения, чтобы мы могли в будущем предоставить Вам индивидуальную скидку к Вашему празднику!
//                 </span>
//               </p>
//             </div>

//             {/* Ошибка */}
//             {error && (
//               <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
//                 <p className="text-red-400 text-sm text-center">{error}</p>
//               </div>
//             )}

//             {/* Кнопки */}
//             <div className="space-y-3">
//               {/* Кнопка продолжить */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-4 px-6 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] hover:from-[#FFD700] hover:to-[#D4AF37] text-[#0A0A0A] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
//                   'Продолжить'
//                 )}
//               </button>
//             </div>

//             {/* Приватность */}
//             <p className="text-center text-xs text-gray-500 mt-4">
//               🔒 Ваши данные защищены и не передаются третьим лицам
//             </p>
//           </form>
//         </div>

//         {/* Дополнительная информация */}
//         <div className="mt-6 text-center">
//           <p className="text-gray-500 text-sm">
//             Возникли вопросы? Свяжитесь с нами: +49 177 899 5106
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }




//------------ошибка переводов-----
// // src/app/booking/phone/page.tsx
// 'use client';

// import { useState, useEffect, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useTranslations } from 'next-intl';

// function PhoneInputForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const t = useTranslations();
  
//   const [phone, setPhone] = useState('');
//   const [birthday, setBirthday] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   const registrationId = searchParams.get('registrationId');

//   useEffect(() => {
//     // Проверяем наличие registrationId
//     if (!registrationId) {
//       router.push('/booking/client?error=' + encodeURIComponent('Invalid session'));
//     }
//   }, [registrationId, router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     // Валидация телефона (ОБЯЗАТЕЛЬНОЕ ПОЛЕ!)
//     if (!phone.trim()) {
//       setError(t('phone_required') || 'Номер телефона обязателен');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/booking/client/complete', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           registrationId,
//           phone: phone.trim(),
//           birthday: birthday || undefined, // Отправляем только если заполнено
//         }),
//       });

//       const data = await response.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Ошибка при завершении регистрации');
//       }

//       console.log('✅ Registration completed:', data.appointmentId);

//       // Редирект на страницу payment
//       router.push(`/booking/payment?appointment=${data.appointmentId}`);
//     } catch (err) {
//       console.error('Error completing registration:', err);
//       setError(err instanceof Error ? err.message : 'Произошла ошибка');
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4"
//          style={{
//            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #0F0F1E 100%)'
//          }}>
//       <div className="w-full max-w-md">
//         {/* Карточка */}
//         <div className="bg-[#1A1A2E] rounded-3xl p-8 shadow-2xl border border-[#D4AF37]/20">
//           {/* Заголовок */}
//           <div className="text-center mb-8">
//             <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
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
//                   d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
//                 />
//               </svg>
//             </div>
            
//             <h1 className="text-3xl font-bold text-[#D4AF37] mb-3">
//               {t('phone_title') || 'Контактная информация'}
//             </h1>
            
//             <p className="text-gray-400 text-sm leading-relaxed">
//               {t('phone_subtitle') || 'Укажите ваши контактные данные для связи'}
//             </p>
//           </div>

//           {/* Форма */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Поле телефона */}
//             <div>
//               <label 
//                 htmlFor="phone" 
//                 className="block text-sm font-medium text-[#D4AF37] mb-2"
//               >
//                 {t('phone_label') || 'Телефон'} <span className="text-red-400">*</span>
//               </label>
              
//               <input
//                 id="phone"
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 placeholder="+49 177 899 5106"
//                 required
//                 className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
//                 disabled={loading}
//               />
              
//               <p className="mt-2 text-xs text-gray-500">
//                 {t('phone_hint') || 'Мы свяжемся с вами для подтверждения записи'}
//               </p>
//             </div>

//             {/* Поле даты рождения */}
//             <div>
//               <label 
//                 htmlFor="birthday" 
//                 className="block text-sm font-medium text-[#D4AF37] mb-2"
//               >
//                 {t('birthday_label') || 'Дата рождения'} <span className="text-gray-500 text-xs">(необязательно)</span>
//               </label>
              
//               <input
//                 id="birthday"
//                 type="date"
//                 value={birthday}
//                 onChange={(e) => setBirthday(e.target.value)}
//                 max={new Date().toISOString().split('T')[0]} // Не позже сегодня
//                 className="w-full px-4 py-3 bg-[#0F0F1E] border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
//                 disabled={loading}
//               />
              
//               <p className="mt-2 text-xs text-gray-500">
//                 <span className="inline-flex items-center">
//                   <svg className="w-4 h-4 mr-1 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
//                   </svg>
//                   {t('birthday_hint') || 'Нам нужна Ваша дата рождения, чтобы мы могли в будущем предоставить Вам индивидуальную скидку к Вашему празднику!'}
//                 </span>
//               </p>
//             </div>

//             {/* Ошибка */}
//             {error && (
//               <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
//                 <p className="text-red-400 text-sm">{error}</p>
//               </div>
//             )}

//             {/* Кнопки */}
//             <div className="space-y-3">
//               {/* Кнопка продолжить */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-4 px-6 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] hover:from-[#FFD700] hover:to-[#D4AF37] text-[#0A0A0A] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center">
//                     <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                     </svg>
//                     {t('phone_submitting') || 'Отправка...'}
//                   </div>
//                 ) : (
//                   t('phone_submit') || 'Продолжить'
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Информация внизу */}
//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-500">
//             {t('phone_privacy') || 'Ваши данные защищены и не передаются третьим лицам'}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function PhoneInputPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen flex items-center justify-center"
//            style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #0F0F1E 100%)' }}>
//         <div className="text-[#D4AF37]">Loading...</div>
//       </div>
//     }>
//       <PhoneInputForm />
//     </Suspense>
//   );
// }