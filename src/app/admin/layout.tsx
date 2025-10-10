// src/app/admin/layout.tsx
import type { ReactNode } from 'react';
import { prisma } from '@/lib/db';
import { AppointmentStatus } from '@prisma/client';
import AdminShellClient from './_components/AdminShellClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Бейдж для "Заявки" — количество PENDING
  const pendingBookings = await prisma.appointment.count({
    where: { status: AppointmentStatus.PENDING },
  });

  // Весь интерактив и адаптив — в клиентском шелле.
  // Передаём только сериализуемые пропсы (числа/строки/булевы).
  return (
    <AdminShellClient bookingsBadge={pendingBookings}>
      {children}
    </AdminShellClient>
  );
}



// import type { ReactNode } from 'react';
// import AdminNav from '@/components/admin/AdminNav';
// import AdminFooter from './_components/AdminFooter';
// import { prisma } from '@/lib/db'; // или '@/lib/prisma' — как у тебя в проекте
// import { AppointmentStatus } from '@prisma/client';

// export default async function AdminLayout({ children }: { children: ReactNode }) {
//   // бейдж для "Заявки": количество ожидающих
//   const pendingBookings = await prisma.appointment.count({
//     where: { status: AppointmentStatus.PENDING },
//   });

//   return (
//     <div className="container py-6">
//       <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
//         {/* Сайдбар */}
//         <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
//           <div className="mb-3 flex items-center justify-between">
//             <div className="text-xs uppercase tracking-wider text-slate-400">Admin</div>
//           </div>
//           <AdminNav bookingsBadge={pendingBookings} />
//         </aside>

//         {/* Контент */}
//         <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 lg:p-6">
//           {children}
//           <AdminFooter />
//         </section>
//       </div>
//     </div>
//   );
// }
