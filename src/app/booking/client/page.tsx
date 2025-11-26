// src/app/booking/client/page.tsx
import { Metadata } from "next";
import ClientPageWithGoogleOption from "./ClientPageWithGoogleOption";

export const metadata: Metadata = {
  title: "Выбор регистрации | Salon Elen",
  description: "Выберите способ регистрации для завершения бронирования",
};

export default async function ClientPage({
  searchParams,
}: {
  searchParams: Promise<{
    s?: string;
    m?: string;
    start?: string;
    end?: string;
    d?: string;
  }>;
}) {
  const params = await searchParams;
  const serviceId = params.s;
  const masterId = params.m;
  const startAt = params.start;
  const endAt = params.end;
  const selectedDate = params.d;

  if (!serviceId || !masterId || !startAt || !endAt || !selectedDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#0F0F1E] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            Ошибка параметров
          </h1>
          <p className="text-gray-400 mb-8">
            Отсутствуют необходимые параметры бронирования
          </p>
          <a
            href="/booking"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold hover:shadow-lg transition-all"
          >
            Вернуться к началу
          </a>
        </div>
      </div>
    );
  }

  return (
    <ClientPageWithGoogleOption
      serviceId={serviceId}
      masterId={masterId}
      startAt={startAt}
      endAt={endAt}
      selectedDate={selectedDate}
    />
  );
}

//----------рабочий с старым гуглом без хедера-----------
// // src/app/booking/client/page.tsx
// import { Metadata } from "next";
// import ClientPageWithGoogleOption from "./ClientPageWithGoogleOption";

// export const metadata: Metadata = {
//   title: "Выбор регистрации | Salon Elen",
//   description: "Выберите способ регистрации для завершения бронирования",
// };

// // ✅ ДОБАВЬТЕ async и Promise<>
// export default async function ClientPage({
//   searchParams,
// }: {
//   searchParams: Promise<{  // ← Promise здесь!
//     s?: string;
//     m?: string;
//     start?: string;
//     end?: string;
//     d?: string;
//   }>;
// }) {
//   const params = await searchParams;  // ← await здесь!
//   const serviceId = params.s;          // ← params. вместо searchParams.
//   const masterId = params.m;
//   const startAt = params.start;
//   const endAt = params.end;
//   const selectedDate = params.d;

//   if (!serviceId || !masterId || !startAt || !endAt || !selectedDate) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#0F0F1E] flex items-center justify-center p-6">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold text-red-400 mb-4">
//             Ошибка параметров
//           </h1>
//           <p className="text-gray-400 mb-8">
//             Отсутствуют необходимые параметры бронирования
//           </p>
//           <a
//             href="/booking"
//             className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold hover:shadow-lg transition-all"
//           >
//             Вернуться к началу
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <ClientPageWithGoogleOption
//       serviceId={serviceId}
//       masterId={masterId}
//       startAt={startAt}
//       endAt={endAt}
//       selectedDate={selectedDate}
//     />
//   );
// }