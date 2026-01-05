// src/app/booking/success/SuccessClient.tsx
// страница успешного бронирования - клиентский компонент
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from '@/i18n/useTranslations';

interface AppointmentDetails {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  startAt: string;
  endAt: string;
  status: string;
  notes?: string | null;
}

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

  const draftId = searchParams.get('id');

  useEffect(() => {
    async function loadAppointment() {
      if (!draftId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/appointments/${encodeURIComponent(draftId)}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(t("booking_success_error_load_failed"));
        }

        const data = await res.json();
        setAppointment(data);
      } catch (error) {
        console.error('[Success] Error loading appointment:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [draftId, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("booking_success_loading")}</p>
        </div>
      </div>
    );
  }

  if (!draftId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t("booking_success_error_title")}</h1>
          <p className="text-gray-600 mb-6">{t("booking_success_error_not_found")}</p>
          <button
            onClick={() => router.push('/booking')}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            {t("booking_success_error_return")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Иконка успеха */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t("booking_success_title")}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {t("booking_success_desc")}
        </p>

        {appointment && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">{t("booking_success_details_title")}</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">{t("booking_success_details_name")}</p>
                <p className="font-medium">{appointment.customerName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{t("booking_success_details_email")}</p>
                <p className="font-medium">{appointment.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{t("booking_success_details_phone")}</p>
                <p className="font-medium">{appointment.phone}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{t("booking_success_details_datetime")}</p>
                <p className="font-medium">
                  {new Date(appointment.startAt).toLocaleString('ru-RU', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/booking')}
            className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            {t("booking_success_button_new")}
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("booking_success_button_home")}
          </button>
        </div>
      </div>
    </div>
  );
}





//---------добавляем словарь---------
// // src/app/booking/success/SuccessClient.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';

// interface AppointmentDetails {
//   id: string;
//   customerName: string;
//   email: string;
//   phone: string;
//   startAt: string;
//   endAt: string;
//   status: string;
//   notes?: string | null;
// }

// export default function SuccessClient() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

//   const draftId = searchParams.get('id');

//   useEffect(() => {
//     async function loadAppointment() {
//       // ✅ ИСПРАВЛЕНО: проверка draftId внутри async функции
//       if (!draftId) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await fetch(`/api/appointments/${encodeURIComponent(draftId)}`, {
//           cache: 'no-store',
//         });

//         if (!res.ok) {
//           throw new Error('Не удалось загрузить данные записи');
//         }

//         const data = await res.json();
//         setAppointment(data);
//       } catch (error) {
//         console.error('[Success] Error loading appointment:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadAppointment();
//   }, [draftId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Загрузка...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!draftId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
//           <p className="text-gray-600 mb-6">ID записи не найден</p>
//           <button
//             onClick={() => router.push('/booking')}
//             className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
//           >
//             Вернуться к бронированию
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
//         {/* Иконка успеха */}
//         <div className="mb-6">
//           <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//             <svg
//               className="w-10 h-10 text-green-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>
//         </div>

//         <h1 className="text-3xl font-bold text-gray-900 mb-4">
//           Запись подтверждена!
//         </h1>
        
//         <p className="text-gray-600 mb-8">
//           Ваша запись успешно создана. Мы отправили подтверждение на вашу почту.
//         </p>

//         {appointment && (
//           <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
//             <h2 className="font-semibold text-gray-900 mb-4">Детали записи:</h2>
            
//             <div className="space-y-3">
//               <div>
//                 <p className="text-sm text-gray-500">Имя</p>
//                 <p className="font-medium">{appointment.customerName}</p>
//               </div>
              
//               <div>
//                 <p className="text-sm text-gray-500">Email</p>
//                 <p className="font-medium">{appointment.email}</p>
//               </div>
              
//               <div>
//                 <p className="text-sm text-gray-500">Телефон</p>
//                 <p className="font-medium">{appointment.phone}</p>
//               </div>
              
//               <div>
//                 <p className="text-sm text-gray-500">Дата и время</p>
//                 <p className="font-medium">
//                   {new Date(appointment.startAt).toLocaleString('ru-RU', {
//                     dateStyle: 'long',
//                     timeStyle: 'short',
//                   })}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="space-y-3">
//           <button
//             onClick={() => router.push('/booking')}
//             className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
//           >
//             Создать новую запись
//           </button>
          
//           <button
//             onClick={() => router.push('/')}
//             className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             На главную
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }