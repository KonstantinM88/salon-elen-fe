// src/app/admin/services/page.tsx
import { prisma } from '@/lib/prisma';
import { createService, updateCategory, updateSubservice, deleteService } from './actions';
import ServiceCreateForm from './ServiceCreateForm';
import SubservicesPanel from './SubservicesPanel';
import { TranslationButton } from './ServicesPageClient';
import { CategoryEditButton } from './EditButtons';

function euro(cents: number | null): string {
  if (cents === null) return '—';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(
    (cents ?? 0) / 100,
  );
}

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  async function handleUpdateCategory(formData: FormData) {
    'use server';
    return await updateCategory(formData);
  }

  async function handleDeleteCategory(formData: FormData) {
    'use server';
    return await deleteService(formData);
  }

  async function handleUpdateSubservice(formData: FormData) {
    'use server';
    return await updateSubservice(formData);
  }

  async function handleDeleteSubservice(formData: FormData) {
    'use server';
    return await deleteService(formData);
  }

  const categories = await prisma.service.findMany({
    where: { parentId: null, isArchived: false },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      durationMin: true,
      priceCents: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      translations: {
        select: { locale: true, name: true, description: true },
      },
      children: {
        where: { isArchived: false },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          durationMin: true,
          priceCents: true,
          isActive: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
          translations: {
            select: { locale: true, name: true, description: true },
          },
        },
      },
    },
  });

  const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  const subservices = categories.flatMap((c) =>
    c.children.map((s) => ({
      ...s,
      parentName: c.name,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  );

  return (
    <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-4 sm:p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
          style={{
            background:
              'radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)',
          }}
        />
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">Услуги</h1>
          <p className="mt-1 text-xs sm:text-sm text-white/70">
            Управление категориями и подуслугами
          </p>
        </div>
      </div>

      {/* Create */}
      <section className="admin-section">
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Добавить</h2>
        <ServiceCreateForm parentOptions={parentOptions} action={createService} />
      </section>

      {/* Categories Table (Desktop lg+) */}
      <section className="admin-section hidden lg:block">
        <h2 className="text-lg font-medium mb-4">Категории</h2>
        <table className="w-full text-sm table-fixed">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '18%' }}>Название</th>
              <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '14%' }}>Slug</th>
              <th className="px-3 py-2.5 text-center text-amber-500/85 font-semibold tracking-wide" style={{ width: '8%' }}>Статус</th>
              <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '38%' }}>Описание</th>
              <th className="px-3 py-2.5 text-right" style={{ width: '22%' }} />
            </tr>
          </thead>

          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-white/10 align-middle hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5 font-medium truncate" title={c.name}>{c.name}</td>
                <td className="px-3 py-2.5">
                  <span className="font-mono text-white/60 text-xs truncate block" title={c.slug ?? ''}>{c.slug}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {c.isActive ? (
                    <span className="tag-active text-[11px]">Да</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/15 px-1.5 py-0.5 text-[11px] text-white/50">
                      Нет
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span 
                    className="block truncate text-white/50 text-sm" 
                    title={c.description ?? ''}
                  >
                    {c.description 
                      ? (c.description.length > 30 ? c.description.slice(0, 30) + '…' : c.description)
                      : '—'
                    }
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <TranslationButton service={c} />
                    <CategoryEditButton
                      category={c}
                      onUpdate={handleUpdateCategory}
                      onDelete={handleDeleteCategory}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-white/50" colSpan={5}>
                  Категорий пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Categories Mobile (до lg) */}
      <section className="lg:hidden space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-medium">Категории</h2>
          <span className="text-xs text-white/50">{categories.length} шт.</span>
        </div>

        {categories.length === 0 && (
          <div className="admin-card p-4 text-sm text-white/50 text-center">
            Категорий пока нет
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {categories.map((c) => (
            <div 
              key={c.id} 
              className="admin-card p-3 sm:p-4 space-y-2.5 sm:space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base truncate">{c.name}</div>
                  <div className="text-[10px] sm:text-xs text-white/50 font-mono mt-0.5 truncate">{c.slug}</div>
                </div>
                {c.isActive ? (
                  <span className="tag-active shrink-0 text-[10px]">активна</span>
                ) : (
                  <span className="inline-flex shrink-0 items-center rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] text-white/60">
                    выкл
                  </span>
                )}
              </div>

              {/* Description */}
              {c.description && (
                <p className="text-xs sm:text-sm text-white/60 line-clamp-2">{c.description}</p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                <TranslationButton service={c} />
                <CategoryEditButton
                  category={c}
                  onUpdate={handleUpdateCategory}
                  onDelete={handleDeleteCategory}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subservices Panel */}
      <SubservicesPanel
        parentOptions={parentOptions}
        subservices={subservices}
        updateSubservice={handleUpdateSubservice}
        deleteSubservice={handleDeleteSubservice}
      />
    </main>
  );
}




// // src/app/admin/services/page.tsx
// import { prisma } from '@/lib/prisma';
// import { createService, updateCategory, updateSubservice, deleteService } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';
// import { TranslationButton } from './ServicesPageClient';
// import { CategoryEditButton } from './EditButtons';

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(
//     (cents ?? 0) / 100,
//   );
// }

// export const dynamic = 'force-dynamic';

// export default async function AdminServicesPage() {
//   async function handleUpdateCategory(formData: FormData) {
//     'use server';
//     return await updateCategory(formData);
//   }

//   async function handleDeleteCategory(formData: FormData) {
//     'use server';
//     return await deleteService(formData);
//   }

//   async function handleUpdateSubservice(formData: FormData) {
//     'use server';
//     return await updateSubservice(formData);
//   }

//   async function handleDeleteSubservice(formData: FormData) {
//     'use server';
//     return await deleteService(formData);
//   }

//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isArchived: false },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       translations: {
//         select: { locale: true, name: true, description: true },
//       },
//       children: {
//         where: { isArchived: false },
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//           translations: {
//             select: { locale: true, name: true, description: true },
//           },
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     })),
//   );

//   return (
//     <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
//       {/* Header */}
//       <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-4 sm:p-6 md:p-8">
//         <div
//           className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
//           style={{
//             background:
//               'radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)',
//           }}
//         />
//         <div className="relative z-10">
//           <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">Услуги</h1>
//           <p className="mt-1 text-xs sm:text-sm text-white/70">
//             Управление категориями и подуслугами
//           </p>
//         </div>
//       </div>

//       {/* Create */}
//       <section className="admin-section">
//         <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Добавить</h2>
//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

//       {/* Categories Table (Desktop lg+) */}
//       <section className="admin-section hidden lg:block">
//         <h2 className="text-lg font-medium mb-4">Категории</h2>
//         <table className="w-full text-sm table-fixed">
//           <thead className="bg-white/5">
//             <tr>
//               <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '15%' }}>Название</th>
//               <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '12%' }}>Slug</th>
//               <th className="px-3 py-2.5 text-center text-amber-500/85 font-semibold tracking-wide" style={{ width: '8%' }}>Цена</th>
//               <th className="px-3 py-2.5 text-center text-amber-500/85 font-semibold tracking-wide" style={{ width: '6%' }}>Мин</th>
//               <th className="px-3 py-2.5 text-center text-amber-500/85 font-semibold tracking-wide" style={{ width: '7%' }}>Статус</th>
//               <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '30%' }}>Описание</th>
//               <th className="px-3 py-2.5 text-right" style={{ width: '22%' }} />
//             </tr>
//           </thead>

//           <tbody>
//             {categories.map((c) => (
//               <tr key={c.id} className="border-t border-white/10 align-middle hover:bg-white/[0.02] transition-colors">
//                 <td className="px-3 py-2.5 font-medium truncate" title={c.name}>{c.name}</td>
//                 <td className="px-3 py-2.5">
//                   <span className="font-mono text-white/60 text-xs truncate block" title={c.slug ?? ''}>{c.slug}</span>
//                 </td>
//                 <td className="px-3 py-2.5 text-center whitespace-nowrap text-white/70">{euro(c.priceCents)}</td>
//                 <td className="px-3 py-2.5 text-center whitespace-nowrap text-white/70">{c.durationMin ?? 0}</td>
//                 <td className="px-3 py-2.5 text-center">
//                   {c.isActive ? (
//                     <span className="tag-active text-[11px]">Да</span>
//                   ) : (
//                     <span className="inline-flex items-center rounded-full border border-white/15 px-1.5 py-0.5 text-[11px] text-white/50">
//                       Нет
//                     </span>
//                   )}
//                 </td>
//                 <td className="px-3 py-2.5">
//                   <span className="block truncate text-white/50 text-sm" title={c.description ?? ''}>
//                     {c.description ?? '—'}
//                   </span>
//                 </td>
//                 <td className="px-3 py-2.5 text-right">
//                   <div className="flex items-center justify-end gap-1.5">
//                     <TranslationButton service={c} />
//                     <CategoryEditButton
//                       category={c}
//                       onUpdate={handleUpdateCategory}
//                       onDelete={handleDeleteCategory}
//                     />
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {categories.length === 0 && (
//               <tr>
//                 <td className="px-3 py-8 text-center text-white/50" colSpan={7}>
//                   Категорий пока нет
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </section>

//       {/* Categories Mobile (до lg) */}
//       <section className="lg:hidden space-y-3 sm:space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-base sm:text-lg font-medium">Категории</h2>
//           <span className="text-xs text-white/50">{categories.length} шт.</span>
//         </div>

//         {categories.length === 0 && (
//           <div className="admin-card p-4 text-sm text-white/50 text-center">
//             Категорий пока нет
//           </div>
//         )}

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//           {categories.map((c) => (
//             <div 
//               key={c.id} 
//               className="admin-card p-3 sm:p-4 space-y-2.5 sm:space-y-3"
//             >
//               {/* Header */}
//               <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
//                 <div className="min-w-0 flex-1">
//                   <div className="font-medium text-sm sm:text-base truncate">{c.name}</div>
//                   <div className="text-[10px] sm:text-xs text-white/50 font-mono mt-0.5 truncate">{c.slug}</div>
//                 </div>
//                 {c.isActive ? (
//                   <span className="tag-active shrink-0 text-[10px]">активна</span>
//                 ) : (
//                   <span className="inline-flex shrink-0 items-center rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] text-white/60">
//                     выкл
//                   </span>
//                 )}
//               </div>

//               {/* Description */}
//               {c.description && (
//                 <p className="text-xs sm:text-sm text-white/60 line-clamp-2">{c.description}</p>
//               )}

//               {/* Actions */}
//               <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
//                 <TranslationButton service={c} />
//                 <CategoryEditButton
//                   category={c}
//                   onUpdate={handleUpdateCategory}
//                   onDelete={handleDeleteCategory}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Subservices Panel */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateSubservice={handleUpdateSubservice}
//         deleteSubservice={handleDeleteSubservice}
//       />
//     </main>
//   );
// }





// // src/app/admin/services/page.tsx
// import { prisma } from '@/lib/prisma';
// import { createService, updateCategory, updateSubservice, deleteService } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';
// import { TranslationButton } from './ServicesPageClient';
// import { CategoryEditButton } from './EditButtons';

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(
//     (cents ?? 0) / 100,
//   );
// }

// export const dynamic = 'force-dynamic';

// export default async function AdminServicesPage() {
//   async function handleUpdateCategory(formData: FormData) {
//     'use server';
//     return await updateCategory(formData);
//   }

//   async function handleDeleteCategory(formData: FormData) {
//     'use server';
//     return await deleteService(formData);
//   }

//   async function handleUpdateSubservice(formData: FormData) {
//     'use server';
//     return await updateSubservice(formData);
//   }

//   async function handleDeleteSubservice(formData: FormData) {
//     'use server';
//     return await deleteService(formData);
//   }

//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isArchived: false },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       translations: {
//         select: { locale: true, name: true, description: true },
//       },
//       children: {
//         where: { isArchived: false },
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//           translations: {
//             select: { locale: true, name: true, description: true },
//           },
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     })),
//   );

//   return (
//     <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
//       {/* Header */}
//       <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-4 sm:p-6 md:p-8">
//         <div
//           className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
//           style={{
//             background:
//               'radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)',
//           }}
//         />
//         <div className="relative z-10">
//           <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">Услуги</h1>
//           <p className="mt-1 text-xs sm:text-sm text-white/70">
//             Управление категориями и подуслугами
//           </p>
//         </div>
//       </div>

//       {/* Create */}
//       <section className="admin-section">
//         <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Добавить</h2>
//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

//       {/* Categories Table (Desktop xl+) */}
//       <section className="admin-section hidden xl:block overflow-x-auto">
//         <h2 className="text-lg font-medium mb-4">Категории</h2>
//         <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
//           <table className="w-full min-w-[900px] text-sm">
//             <thead className="bg-white/5">
//               <tr>
//                 <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide w-[180px]">Название</th>
//                 <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide w-[120px]">Slug</th>
//                 <th className="px-3 py-2.5 text-right text-amber-500/85 font-semibold tracking-wide w-[80px]">Цена</th>
//                 <th className="px-3 py-2.5 text-right text-amber-500/85 font-semibold tracking-wide w-[60px]">Мин</th>
//                 <th className="px-3 py-2.5 text-center text-amber-500/85 font-semibold tracking-wide w-[80px]">Активна</th>
//                 <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide">Описание</th>
//                 <th className="px-3 py-2.5 text-right w-[220px]" />
//               </tr>
//             </thead>

//             <tbody>
//               {categories.map((c) => (
//                 <tr key={c.id} className="border-t border-white/10 align-middle hover:bg-white/[0.02] transition-colors">
//                   <td className="px-3 py-3 font-medium">{c.name}</td>
//                   <td className="px-3 py-3">
//                     <span className="font-mono text-white/70 text-xs">{c.slug}</span>
//                   </td>
//                   <td className="px-3 py-3 text-right whitespace-nowrap">{euro(c.priceCents)}</td>
//                   <td className="px-3 py-3 text-right whitespace-nowrap">{c.durationMin ?? 0}</td>
//                   <td className="px-3 py-3 text-center">
//                     {c.isActive ? (
//                       <span className="tag-active">Да</span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                         Нет
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-3 py-3 max-w-[300px]">
//                     <span className="block truncate text-white/60 text-sm" title={c.description ?? ''}>
//                       {c.description ?? '—'}
//                     </span>
//                   </td>
//                   <td className="px-3 py-3 text-right">
//                     <div className="flex items-center justify-end gap-2 flex-wrap">
//                       <TranslationButton service={c} />
//                       <CategoryEditButton
//                         category={c}
//                         onUpdate={handleUpdateCategory}
//                         onDelete={handleDeleteCategory}
//                       />
//                     </div>
//                   </td>
//                 </tr>
//               ))}

//               {categories.length === 0 && (
//                 <tr>
//                   <td className="px-3 py-8 text-center text-white/50" colSpan={7}>
//                     Категорий пока нет
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </section>

//       {/* Categories Cards (Tablet lg-xl) */}
//       <section className="admin-section hidden lg:block xl:hidden">
//         <h2 className="text-lg font-medium mb-4">Категории</h2>
//         <div className="grid grid-cols-2 gap-4">
//           {categories.map((c) => (
//             <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3 hover:bg-white/[0.04] transition-colors">
//               {/* Header */}
//               <div className="flex items-start justify-between gap-3">
//                 <div className="min-w-0 flex-1">
//                   <div className="font-medium text-base truncate">{c.name}</div>
//                   <div className="text-xs text-white/50 font-mono mt-0.5 truncate">{c.slug}</div>
//                 </div>
//                 {c.isActive ? (
//                   <span className="tag-active shrink-0 text-[10px]">активна</span>
//                 ) : (
//                   <span className="inline-flex shrink-0 items-center rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/60">
//                     выкл
//                   </span>
//                 )}
//               </div>

//               {/* Description */}
//               {c.description && (
//                 <p className="text-sm text-white/60 line-clamp-2">{c.description}</p>
//               )}

//               {/* Meta info */}
//               <div className="flex items-center gap-4 text-xs text-white/50">
//                 <span>Цена: {euro(c.priceCents)}</span>
//                 <span>Мин: {c.durationMin ?? 0}</span>
//               </div>

//               {/* Actions */}
//               <div className="flex flex-wrap gap-2 pt-1">
//                 <TranslationButton service={c} />
//                 <CategoryEditButton
//                   category={c}
//                   onUpdate={handleUpdateCategory}
//                   onDelete={handleDeleteCategory}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//         {categories.length === 0 && (
//           <div className="text-center text-white/50 py-8">Категорий пока нет</div>
//         )}
//       </section>

//       {/* Categories Mobile (sm-lg) */}
//       <section className="lg:hidden space-y-3 sm:space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-base sm:text-lg font-medium">Категории</h2>
//           <span className="text-xs text-white/50">{categories.length} шт.</span>
//         </div>

//         {categories.length === 0 && (
//           <div className="admin-card p-4 text-sm text-white/50 text-center">
//             Категорий пока нет
//           </div>
//         )}

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//           {categories.map((c) => (
//             <div 
//               key={c.id} 
//               className="admin-card p-3 sm:p-4 space-y-2.5 sm:space-y-3"
//             >
//               {/* Header */}
//               <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
//                 <div className="min-w-0 flex-1">
//                   <div className="font-medium text-sm sm:text-base truncate">{c.name}</div>
//                   <div className="text-[10px] sm:text-xs text-white/50 font-mono mt-0.5 truncate">{c.slug}</div>
//                 </div>
//                 {c.isActive ? (
//                   <span className="tag-active shrink-0 text-[10px]">активна</span>
//                 ) : (
//                   <span className="inline-flex shrink-0 items-center rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] text-white/60">
//                     выкл
//                   </span>
//                 )}
//               </div>

//               {/* Description */}
//               {c.description && (
//                 <p className="text-xs sm:text-sm text-white/60 line-clamp-2">{c.description}</p>
//               )}

//               {/* Actions */}
//               <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
//                 <TranslationButton service={c} />
//                 <CategoryEditButton
//                   category={c}
//                   onUpdate={handleUpdateCategory}
//                   onDelete={handleDeleteCategory}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Subservices Panel */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateSubservice={handleUpdateSubservice}
//         deleteSubservice={handleDeleteSubservice}
//       />
//     </main>
//   );
// }




//--------всё работало, делаем адаптацию---------
// // src/app/admin/services/page.tsx
// import { prisma } from '@/lib/prisma';
// import { createService, updateCategory, updateSubservice, deleteService } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';
// import { TranslationButton } from './ServicesPageClient';
// import { CategoryEditButton } from './EditButtons';

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(
//     (cents ?? 0) / 100,
//   );
// }

// export const dynamic = 'force-dynamic';

// export default async function AdminServicesPage() {
//   async function handleUpdateCategory(formData: FormData) {
//     'use server';
//     return await updateCategory(formData);
//   }

//   async function handleDeleteCategory(formData: FormData) {
//     'use server';
//     return await deleteService(formData);
//   }

//   async function handleUpdateSubservice(formData: FormData) {
//     'use server';
//     return await updateSubservice(formData);
//   }

//   async function handleDeleteSubservice(formData: FormData) {
//     'use server';
//     return await deleteService(formData);
//   }

//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isArchived: false },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       translations: {
//         select: { locale: true, name: true, description: true },
//       },
//       children: {
//         where: { isArchived: false },
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//           translations: {
//             select: { locale: true, name: true, description: true },
//           },
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     })),
//   );

//   return (
//     <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
//       {/* Header */}
//       <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-5 sm:p-6 md:p-8">
//         <div
//           className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
//           style={{
//             background:
//               'radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)',
//           }}
//         />
//         <div className="relative z-10">
//           <h1 className="text-2xl md:text-3xl font-semibold">Услуги</h1>
//           <p className="mt-1 text-sm text-white/70">
//             Управление категориями и подуслугами. Быстрое редактирование и обновление цен.
//           </p>
//         </div>
//       </div>

//       {/* Create */}
//       <section className="admin-section">
//         <h2 className="text-lg font-medium mb-4">Добавить</h2>
//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

//       {/* Categories Table (Desktop) */}
//       <section className="admin-section hidden lg:block overflow-x-auto">
//         <table className="table table-fixed">
//           <colgroup>
//             <col style={{ width: '18rem' }} />
//             <col style={{ width: '12rem' }} />
//             <col style={{ width: '7rem' }} />
//             <col style={{ width: '6rem' }} />
//             <col style={{ width: '8rem' }} />
//             <col style={{ width: '12rem' }} />
//             <col style={{ width: 'auto' }} />
//             <col style={{ width: '20rem' }} />
//           </colgroup>

//           <thead className="thead">
//             <tr>
//               <th className="th text-left text-amber-500/85 font-semibold tracking-wide">Название</th>
//               <th className="th text-left text-amber-500/85 font-semibold tracking-wide">Slug</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wide">Цена</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wide">Мин</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Активна</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Категория</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Описание</th>
//               <th className="th text-right" />
//             </tr>
//           </thead>

//           <tbody>
//             {categories.map((c) => (
//               <tr key={c.id} className="row align-middle">
//                 <td className="td font-medium">{c.name}</td>

//                 <td className="td">
//                   <span className="font-mono text-white/70 whitespace-nowrap">{c.slug}</span>
//                 </td>

//                 <td className="td text-right whitespace-nowrap">{euro(c.priceCents)}</td>
//                 <td className="td text-right whitespace-nowrap">{c.durationMin ?? 0}</td>

//                 <td className="td text-center">
//                   {c.isActive ? (
//                     <span className="tag-active">Да</span>
//                   ) : (
//                     <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                       Нет
//                     </span>
//                   )}
//                 </td>

//                 <td className="td text-white/60 text-center">—</td>

//                 <td className="td max-w-[48rem]">
//                   <span className="block truncate" title={c.description ?? ''}>
//                     {c.description ?? '—'}
//                   </span>
//                 </td>

//                 <td className="td text-right">
//                   <div className="flex items-center justify-end gap-2 flex-wrap">
//                     <TranslationButton service={c} />
//                     <CategoryEditButton
//                       category={c}
//                       onUpdate={handleUpdateCategory}
//                       onDelete={handleDeleteCategory}
//                     />
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {categories.length === 0 && (
//               <tr>
//                 <td className="td py-6 text-center text-white/50" colSpan={8}>
//                   Услуг пока нет
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </section>

//       {/* Categories Mobile */}
//       <section className="lg:hidden space-y-4">
//         {categories.length === 0 && (
//           <div className="admin-section text-sm text-gray-400">Услуг пока нет</div>
//         )}

//         {categories.map((c) => (
//           <div key={c.id} className="admin-card p-4 space-y-3">
//             <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
//               <div className="min-w-0">
//                 <div className="font-medium text-lg truncate">{c.name}</div>
//                 <div className="text-xs text-white/50 font-mono mt-0.5 truncate">{c.slug}</div>
//               </div>

//               {c.isActive ? (
//                 <span className="tag-active shrink-0">активна</span>
//               ) : (
//                 <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                   выкл
//                 </span>
//               )}
//             </div>

//             {c.description && <p className="text-sm text-white/70">{c.description}</p>}

//             <div className="flex flex-wrap gap-2">
//               <TranslationButton service={c} />
//               <CategoryEditButton
//                 category={c}
//                 onUpdate={handleUpdateCategory}
//                 onDelete={handleDeleteCategory}
//               />
//             </div>
//           </div>
//         ))}
//       </section>

//       {/* Subservices Panel */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateSubservice={handleUpdateSubservice}
//         deleteSubservice={handleDeleteSubservice}
//       />
//     </main>
//   );
// }










//--------адаптив контейнера + перенос кнопок на мобиле-------
// import { prisma } from '@/lib/prisma';
// import {
//   createService,
//   updateCategory,
//   updateSubservice,
//   deleteService,
// } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';
// import { TranslationButton } from './ServicesPageClient';
// import { CategoryEditButton } from './EditButtons';

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' })
//     .format((cents ?? 0) / 100);
// }

// export const dynamic = 'force-dynamic';

// export default async function AdminServicesPage() {
//   // Inline server actions для передачи в клиентские компоненты
//   async function handleUpdateCategory(formData: FormData) {
//     'use server';
//     return await updateCategory(formData);
//   }

//   async function handleDeleteCategory(formData: FormData) {
//     'use server';
//     return await deleteService(formData);
//   }

//   async function handleUpdateSubservice(formData: FormData) {
//     'use server';
//     return await updateSubservice(formData);
//   }

//   async function handleDeleteSubservice(formData: FormData) {
//     'use server';
//     return await deleteService(formData);
//   }

//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isArchived: false },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       translations: {
//         select: {
//           locale: true,
//           name: true,
//           description: true,
//         },
//       },
//       children: {
//         where: { isArchived: false },
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//           translations: {
//             select: {
//               locale: true,
//               name: true,
//               description: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     })),
//   );

//   return (
//     <main className="container py-8 space-y-8">
//       {/* Header */}
//       <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-6 md:p-8">
//         <div
//           className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
//           style={{
//             background:
//               'radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)',
//           }}
//         />
//         <div className="relative z-10">
//           <h1 className="text-2xl md:text-3xl font-semibold">Услуги</h1>
//           <p className="mt-1 text-sm text-white/70">
//             Управление категориями и подуслугами. Быстрое редактирование и обновление цен.
//           </p>
//         </div>
//       </div>

//       {/* Create New Service/Category */}
//       <section className="admin-section">
//         <h2 className="text-lg font-medium mb-4">Добавить</h2>
//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

//       {/* Categories Table (Desktop) */}
//       <section className="admin-section hidden lg:block overflow-x-auto">
//         <table className="table table-fixed">
//           <colgroup>
//             <col style={{ width: '18rem' }} />
//             <col style={{ width: '12rem' }} />
//             <col style={{ width: '7rem' }} />
//             <col style={{ width: '6rem' }} />
//             <col style={{ width: '8rem' }} />
//             <col style={{ width: '12rem' }} />
//             <col style={{ width: 'auto' }} />
//             <col style={{ width: '20rem' }} />
//           </colgroup>
//           <thead className="thead">
//             <tr>
//               <th className="th text-left text-amber-500/85 font-semibold tracking-wide">Название</th>
//               <th className="th text-left text-amber-500/85 font-semibold tracking-wide">Slug</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wide">Цена</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wide">Мин</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Активна</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Категория</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Описание</th>
//               <th className="th text-right" />
//             </tr>
//           </thead>

//           <tbody>
//             {categories.map((c) => (
//               <tr key={c.id} className="row align-middle">
//                 <td className="td font-medium">{c.name}</td>

//                 <td className="td">
//                   <span className="font-mono text-white/70 whitespace-nowrap">{c.slug}</span>
//                 </td>

//                 <td className="td text-right whitespace-nowrap">{euro(c.priceCents)}</td>
//                 <td className="td text-right whitespace-nowrap">{c.durationMin ?? 0}</td>

//                 <td className="td text-center">
//                   {c.isActive ? (
//                     <span className="tag-active">Да</span>
//                   ) : (
//                     <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                       Нет
//                     </span>
//                   )}
//                 </td>

//                 <td className="td text-white/60 text-center">—</td>

//                 <td className="td max-w-[48rem]">
//                   <span className="block truncate" title={c.description ?? ''}>
//                     {c.description ?? '—'}
//                   </span>
//                 </td>

//                 <td className="td text-right">
//                   <div className="flex items-center justify-end gap-2">
//                     <TranslationButton service={c} />
//                     <CategoryEditButton
//                       category={c}
//                       onUpdate={handleUpdateCategory}
//                       onDelete={handleDeleteCategory}
//                     />
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {categories.length === 0 && (
//               <tr>
//                 <td className="td py-6 text-center text-white/50" colSpan={8}>
//                   Услуг пока нет
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </section>

//       {/* Categories Mobile */}
//       <section className="lg:hidden space-y-4">
//         {categories.length === 0 && (
//           <div className="admin-section text-sm text-gray-400">Услуг пока нет</div>
//         )}

//         {categories.map((c) => (
//           <div key={c.id} className="admin-card p-4 space-y-3">
//             <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
//               <div>
//                 <div className="font-medium text-lg">{c.name}</div>
//                 <div className="text-xs text-white/50 font-mono mt-0.5">{c.slug}</div>
//               </div>
//               {c.isActive ? (
//                 <span className="tag-active">активна</span>
//               ) : (
//                 <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                   выкл
//                 </span>
//               )}
//             </div>

//             {c.description && (
//               <p className="text-sm text-white/70">{c.description}</p>
//             )}

//             <div className="flex gap-2">
//               <TranslationButton service={c} />
//               <CategoryEditButton
//                 category={c}
//                 onUpdate={handleUpdateCategory}
//                 onDelete={handleDeleteCategory}
//               />
//             </div>
//           </div>
//         ))}
//       </section>

//       {/* Subservices Panel */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateSubservice={handleUpdateSubservice}
//         deleteSubservice={handleDeleteSubservice}
//       />
//     </main>
//   );
// }





// // src/app/admin/services/page.tsx
// import { prisma } from '@/lib/prisma';
// import {
//   createService,      // (fd) => Promise<ActionResult> — для ServiceCreateForm
//   updateCategory,     // (fd) => Promise<ActionResult> — редактирование категории
//   updateSubservice,   // (fd) => Promise<ActionResult> — редактирование подуслуги
//   deleteService,      // (fd) => Promise<ActionResult> — удаление/архив
// } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';
// import { TranslationButton } from './ServicesPageClient';  // ✅ ДОБАВЛЕНО

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' })
//     .format((cents ?? 0) / 100);
// }

// export const dynamic = 'force-dynamic';

// /** Next требует: <form action> => функция (fd)=>void|Promise<void>.
//  *  Делаем тонкие адаптеры поверх наших экшенов. */
// const updateCategoryVoid = async (formData: FormData): Promise<void> => {
//   'use server';
//   await updateCategory(formData);
// };
// const deleteCategoryVoid = async (formData: FormData): Promise<void> => {
//   'use server';
//   await deleteService(formData);
// };

// export default async function AdminServicesPage() {
//   // показываем только неархивные категории
//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isArchived: false },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       // ✅ ДОБАВЛЕНО: переводы для категорий
//       translations: {
//         select: {
//           locale: true,
//           name: true,
//           description: true,
//         },
//       },
//       children: {
//         where: { isArchived: false },
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//           // ✅ ДОБАВЛЕНО: переводы для подуслуг
//           translations: {
//             select: {
//               locale: true,
//               name: true,
//               description: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     })),
//   );

//   return (
//     <main className="container py-8 space-y-8">
//       {/* шапка */}
//       <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-6 md:p-8">
//         <div
//           className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
//           style={{
//             background:
//               'radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)',
//           }}
//         />
//         <div className="relative z-10">
//           <h1 className="text-2xl md:text-3xl font-semibold">Услуги</h1>
//           <p className="mt-1 text-sm text-white/70">
//             Управление категориями и подуслугами. Быстрое редактирование и обновление цен.
//           </p>
//         </div>
//       </div>

//       {/* Добавить */}
//       <section className="admin-section">
//         <h2 className="text-lg font-medium mb-4">Добавить</h2>
//         {/* Клиентский компонент ожидает (fd)=>Promise<ActionResult> */}
//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

//       {/* ======== КАТЕГОРИИ (десктоп) ======== */}
//       <section className="admin-section hidden lg:block overflow-x-auto">
//         <table className="table table-fixed">
//           <colgroup>
//             <col style={{ width: '18rem' }} />
//             <col style={{ width: '12rem' }} />
//             <col style={{ width: '7rem' }} />
//             <col style={{ width: '6rem' }} />
//             <col style={{ width: '8rem' }} />
//             <col style={{ width: '12rem' }} />
//             <col style={{ width: 'auto' }} />
//             <col style={{ width: '16rem' }} />
//           </colgroup>
//           <thead className="thead">
//             <tr>
//               <th className="th text-left  text-amber-500/85 font-semibold tracking-wid">Название</th>
//               <th className="th text-left  text-amber-500/85 font-semibold tracking-wid">Slug</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wid">Цена</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wid">Мин</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Активна</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wid">Категория</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wid">Описание</th>
//               <th className="th text-right" />
//             </tr>
//           </thead>

//           <tbody>
//             {categories.map((c) => (
//               <tr key={c.id} className="row align-middle">
//                 <td className="td font-medium">{c.name}</td>

//                 <td className="td">
//                   <span className="font-mono text-white/70 whitespace-nowrap">{c.slug}</span>
//                 </td>

//                 <td className="td text-right whitespace-nowrap">{euro(c.priceCents)}</td>
//                 <td className="td text-right whitespace-nowrap">{c.durationMin ?? 0}</td>

//                 <td className="td text-center">
//                   {c.isActive ? (
//                     <span className="tag-active">Да</span>
//                   ) : (
//                     <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                       Нет
//                     </span>
//                   )}
//                 </td>

//                 <td className="td text-white/60 text-center">—</td>

//                 <td className="td max-w-[48rem]">
//                   <span className="block truncate" title={c.description ?? ''}>
//                     {c.description ?? '—'}
//                   </span>
//                 </td>

//                 {/* ✅ ОБНОВЛЕНО: добавлена кнопка переводов */}
//                 <td className="td text-right">
//                   <div className="flex items-center justify-end gap-2">
//                     <TranslationButton service={c} />
                    
//                     <details className="relative inline-block">
//                       <summary
//                         className="btn-primary cta-boost btn-primary-sheen idle-aura cursor-pointer list-none"
//                         role="button"
//                       >
//                         Редактировать
//                       </summary>

//                       <div className="popover right-0">
//                         {/* форма редактирования категории — требуется Promise<void> */}
//                         <form action={updateCategoryVoid} className="grid grid-cols-2 gap-3">
//                           <input type="hidden" name="id" value={c.id} />
//                           <input type="hidden" name="kind" value="category" />

//                           <div className="col-span-2">
//                             <label className="mb-1 block text-xs opacity-70">Название</label>
//                             <input name="name" defaultValue={c.name} className="admin-input" />
//                           </div>

//                           <div>
//                             <label className="mb-1 block text-xs opacity-70">Slug</label>
//                             <input value={c.slug ?? ''} readOnly className="admin-input cursor-not-allowed text-white/70" />
//                           </div>

//                           <div className="flex items-center gap-2">
//                             <input
//                               id={`active-${c.id}`}
//                               name="isActive"
//                               type="checkbox"
//                               defaultChecked={c.isActive}
//                               className="admin-switch"
//                             />
//                             <label htmlFor={`active-${c.id}`} className="text-sm">
//                               Активна
//                             </label>
//                           </div>

//                           <div className="col-span-2">
//                             <label className="mb-1 block text-xs opacity-70">Описание</label>
//                             <textarea
//                               name="description"
//                               defaultValue={c.description ?? ''}
//                               rows={3}
//                               className="admin-textarea"
//                             />
//                           </div>

//                           <div className="col-span-2 mt-1 flex items-center justify-between gap-2">
//                             <button className="btn-primary">Сохранить</button>
//                           </div>
//                         </form>

//                         {/* удаление — тоже Promise<void> через обёртку */}
//                         <div className="my-3 border-t border-white/10" />
//                         <form action={deleteCategoryVoid} className="mt-1">
//                           <input type="hidden" name="id" value={c.id} />
//                           <button className="btn-danger w-full">Удалить категорию</button>
//                         </form>
//                       </div>
//                     </details>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {categories.length === 0 && (
//               <tr>
//                 <td className="td py-6 text-center text-white/50" colSpan={8}>
//                   Услуг пока нет
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </section>

//       {/* ======== КАТЕГОРИИ (мобайл) ======== */}
//       <section className="lg:hidden space-y-4">
//         {categories.length === 0 && <div className="admin-section text-sm text-gray-400">Услуг пока нет</div>}

//         {categories.map((c) => (
//           <details key={c.id} className="admin-card overflow-hidden">
//             <summary className="cursor-pointer select-none px-4 py-3 bg-white/5 flex items-center justify-between">
//               <span className="font-medium">{c.name}</span>
//               <span className="text-xs opacity-70">{c.isActive ? 'активна' : 'выкл'}</span>
//             </summary>

//             <div className="p-4 space-y-3">
//               {/* ✅ ДОБАВЛЕНО: кнопка переводов в mobile */}
//               <div className="mb-3">
//                 <TranslationButton service={c} />
//               </div>

//               <form action={updateCategoryVoid} className="grid grid-cols-1 gap-3">
//                 <input type="hidden" name="id" value={c.id} />
//                 <input type="hidden" name="kind" value="category" />

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Название</label>
//                   <input name="name" defaultValue={c.name} className="admin-input" />
//                 </div>

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Slug</label>
//                   <input defaultValue={c.slug ?? ''} className="admin-input" readOnly />
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <input
//                     id={`active-m-${c.id}`}
//                     name="isActive"
//                     type="checkbox"
//                     defaultChecked={c.isActive}
//                     className="admin-switch"
//                   />
//                   <label htmlFor={`active-m-${c.id}`} className="text-sm">
//                     Активна
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Описание</label>
//                   <textarea name="description" defaultValue={c.description ?? ''} rows={3} className="admin-textarea" />
//                 </div>

//                 <div>
//                   <button className="w-full btn-primary">Сохранить</button>
//                 </div>
//               </form>

//               <form action={deleteCategoryVoid}>
//                 <input type="hidden" name="id" value={c.id} />
//                 <button className="w-full btn-danger">Удалить категорию</button>
//               </form>
//             </div>
//           </details>
//         ))}
//       </section>

//       {/* ======== ПОДУСЛУГИ ======== */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateSubservice={updateSubservice}   // ✅ ИСПРАВЛЕНО: было updateAction
//         deleteSubservice={deleteService}      // ✅ ИСПРАВЛЕНО: было deleteAction
//       />
//     </main>
//   );
// }




//--------работал добавляем редактирование с тремя языками
// // src/app/admin/services/page.tsx
// import { prisma } from '@/lib/prisma';
// import {
//   createService,      // (fd) => Promise<ActionResult> — для ServiceCreateForm
//   updateCategory,     // (fd) => Promise<ActionResult> — редактирование категории
//   updateSubservice,   // (fd) => Promise<ActionResult> — редактирование подуслуги
//   deleteService,      // (fd) => Promise<ActionResult> — удаление/архив
// } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' })
//     .format((cents ?? 0) / 100);
// }

// export const dynamic = 'force-dynamic';

// /** Next требует: <form action> => функция (fd)=>void|Promise<void>.
//  *  Делаем тонкие адаптеры поверх наших экшенов. */
// const updateCategoryVoid = async (formData: FormData): Promise<void> => {
//   'use server';
//   await updateCategory(formData);
// };
// const deleteCategoryVoid = async (formData: FormData): Promise<void> => {
//   'use server';
//   await deleteService(formData);
// };

// export default async function AdminServicesPage() {
//   // показываем только неархивные категории
//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isArchived: false },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       children: {
//         where: { isArchived: false },
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     })),
//   );

//   return (
//     <main className="container py-8 space-y-8">
//       {/* шапка */}
//       <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-6 md:p-8">
//         <div
//           className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
//           style={{
//             background:
//               'radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)',
//           }}
//         />
//         <div className="relative z-10">
//           <h1 className="text-2xl md:text-3xl font-semibold">Услуги</h1>
//           <p className="mt-1 text-sm text-white/70">
//             Управление категориями и подуслугами. Быстрое редактирование и обновление цен.
//           </p>
//         </div>
//       </div>

//       {/* Добавить */}
//       <section className="admin-section">
//         <h2 className="text-lg font-medium mb-4">Добавить</h2>
//         {/* Клиентский компонент ожидает (fd)=>Promise<ActionResult> */}
//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

//       {/* ======== КАТЕГОРИИ (десктоп) ======== */}
//       <section className="admin-section hidden lg:block overflow-x-auto">
//         <table className="table table-fixed">
//           <colgroup>
//             <col style={{ width: '18rem' }} />
//             <col style={{ width: '12rem' }} />
//             <col style={{ width: '7rem' }} />
//             <col style={{ width: '6rem' }} />
//             <col style={{ width: '8rem' }} />
//             <col style={{ width: '12rem' }} />
//             <col style={{ width: 'auto' }} />
//             <col style={{ width: '11rem' }} />
//           </colgroup>
//           <thead className="thead">
//             <tr>
//               <th className="th text-left  text-amber-500/85 font-semibold tracking-wid">Название</th>
//               <th className="th text-left  text-amber-500/85 font-semibold tracking-wid">Slug</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wid">Цена</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wid">Мин</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Активна</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wid">Категория</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wid">Описание</th>
//               <th className="th text-right" />
//             </tr>
//           </thead>

//           <tbody>
//             {categories.map((c) => (
//               <tr key={c.id} className="row align-middle">
//                 <td className="td font-medium">{c.name}</td>

//                 <td className="td">
//                   <span className="font-mono text-white/70 whitespace-nowrap">{c.slug}</span>
//                 </td>

//                 <td className="td text-right whitespace-nowrap">{euro(c.priceCents)}</td>
//                 <td className="td text-right whitespace-nowrap">{c.durationMin ?? 0}</td>

//                 <td className="td text-center">
//                   {c.isActive ? (
//                     <span className="tag-active">Да</span>
//                   ) : (
//                     <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                       Нет
//                     </span>
//                   )}
//                 </td>

//                 <td className="td text-white/60 text-center">—</td>

//                 <td className="td max-w-[48rem]">
//                   <span className="block truncate" title={c.description ?? ''}>
//                     {c.description ?? '—'}
//                   </span>
//                 </td>

//                 <td className="td text-right">
//                   <details className="relative inline-block">
//                     <summary
//                       className="btn-primary cta-boost btn-primary-sheen idle-aura cursor-pointer list-none"
//                       role="button"
//                     >
//                       Редактировать
//                     </summary>

//                     <div className="popover right-0">
//                       {/* форма редактирования категории — требуется Promise<void> */}
//                       <form action={updateCategoryVoid} className="grid grid-cols-2 gap-3">
//                         <input type="hidden" name="id" value={c.id} />
//                         <input type="hidden" name="kind" value="category" />

//                         <div className="col-span-2">
//                           <label className="mb-1 block text-xs opacity-70">Название</label>
//                           <input name="name" defaultValue={c.name} className="admin-input" />
//                         </div>

//                         <div>
//                           <label className="mb-1 block text-xs opacity-70">Slug</label>
//                           <input value={c.slug ?? ''} readOnly className="admin-input cursor-not-allowed text-white/70" />
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <input
//                             id={`active-${c.id}`}
//                             name="isActive"
//                             type="checkbox"
//                             defaultChecked={c.isActive}
//                             className="admin-switch"
//                           />
//                           <label htmlFor={`active-${c.id}`} className="text-sm">
//                             Активна
//                           </label>
//                         </div>

//                         <div className="col-span-2">
//                           <label className="mb-1 block text-xs opacity-70">Описание</label>
//                           <textarea
//                             name="description"
//                             defaultValue={c.description ?? ''}
//                             rows={3}
//                             className="admin-textarea"
//                           />
//                         </div>

//                         <div className="col-span-2 mt-1 flex items-center justify-between gap-2">
//                           <button className="btn-primary">Сохранить</button>
//                         </div>
//                       </form>

//                       {/* удаление — тоже Promise<void> через обёртку */}
//                       <div className="my-3 border-t border-white/10" />
//                       <form action={deleteCategoryVoid} className="mt-1">
//                         <input type="hidden" name="id" value={c.id} />
//                         <button className="btn-danger w-full">Удалить категорию</button>
//                       </form>
//                     </div>
//                   </details>
//                 </td>
//               </tr>
//             ))}

//             {categories.length === 0 && (
//               <tr>
//                 <td className="td py-6 text-center text-white/50" colSpan={8}>
//                   Услуг пока нет
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </section>

//       {/* ======== КАТЕГОРИИ (мобайл) ======== */}
//       <section className="lg:hidden space-y-4">
//         {categories.length === 0 && <div className="admin-section text-sm text-gray-400">Услуг пока нет</div>}

//         {categories.map((c) => (
//           <details key={c.id} className="admin-card overflow-hidden">
//             <summary className="cursor-pointer select-none px-4 py-3 bg-white/5 flex items-center justify-between">
//               <span className="font-medium">{c.name}</span>
//               <span className="text-xs opacity-70">{c.isActive ? 'активна' : 'выкл'}</span>
//             </summary>

//             <div className="p-4 space-y-3">
//               <form action={updateCategoryVoid} className="grid grid-cols-1 gap-3">
//                 <input type="hidden" name="id" value={c.id} />
//                 <input type="hidden" name="kind" value="category" />

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Название</label>
//                   <input name="name" defaultValue={c.name} className="admin-input" />
//                 </div>

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Slug</label>
//                   <input defaultValue={c.slug ?? ''} className="admin-input" readOnly />
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <input
//                     id={`active-m-${c.id}`}
//                     name="isActive"
//                     type="checkbox"
//                     defaultChecked={c.isActive}
//                     className="admin-switch"
//                   />
//                   <label htmlFor={`active-m-${c.id}`} className="text-sm">
//                     Активна
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Описание</label>
//                   <textarea name="description" defaultValue={c.description ?? ''} rows={3} className="admin-textarea" />
//                 </div>

//                 <div>
//                   <button className="w-full btn-primary">Сохранить</button>
//                 </div>
//               </form>

//               <form action={deleteCategoryVoid}>
//                 <input type="hidden" name="id" value={c.id} />
//                 <button className="w-full btn-danger">Удалить категорию</button>
//               </form>
//             </div>
//           </details>
//         ))}
//       </section>

//       {/* ======== ПОДУСЛУГИ ======== */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateAction={updateSubservice}   // (fd)=>Promise<ActionResult>
//         deleteAction={deleteService}      // (fd)=>Promise<ActionResult>
//       />
//     </main>
//   );
// }








//----------работало но добавили удаление старых услуг
// // src/app/admin/services/page.tsx
// import { prisma } from '@/lib/db';
// import { createService, updateService, deleteService } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format((cents ?? 0) / 100);
// }

// export const dynamic = 'force-dynamic';

// /** Обёртки под <form action=...>, чтобы сигнатура была Promise<void> */
// const createServiceVoid = async (formData: FormData): Promise<void> => {
//   'use server';
//   await createService(formData);
// };

// const updateServiceVoid = async (formData: FormData): Promise<void> => {
//   'use server';
//   await updateService(formData);
// };

// const deleteServiceVoid = async (formData: FormData): Promise<void> => {
//   'use server';
//   await deleteService(formData);
// };

// export default async function AdminServicesPage() {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       children: {
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     })),
//   );

//   return (
//     <main className="container py-8 space-y-8">
//       {/* шапка */}
//       <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-6 md:p-8">
//         <div
//           className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
//           style={{
//             background:
//               'radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)',
//           }}
//         />
//         <div className="relative z-10">
//           <h1 className="text-2xl md:text-3xl font-semibold">Услуги</h1>
//           <p className="mt-1 text-sm text-white/70">
//             Управление категориями и подуслугами. Быстрое редактирование и обновление цен.
//           </p>
//         </div>
//       </div>

//       {/* Добавить */}
//       <section className="admin-section">
//         <h2 className="text-lg font-medium mb-4">Добавить</h2>
//         {/* ВАЖНО: action принимает Promise<void>, поэтому передаём createServiceVoid */}
//         <ServiceCreateForm parentOptions={parentOptions} action={createServiceVoid} />
//       </section>

//       {/* ======== КАТЕГОРИИ (десктоп, выровнено + стиль админки) ======== */}
//       <section className="admin-section hidden lg:block overflow-x-auto">
//         <table className="table table-fixed">
//           {/* colgroup одной строкой — без переносов/комментов, чтобы не было hydration warning */}
//           <colgroup><col style={{width:'18rem'}}/><col style={{width:'12rem'}}/><col style={{width:'7rem'}}/><col style={{width:'6rem'}}/><col style={{width:'8rem'}}/><col style={{width:'12rem'}}/><col style={{width:'auto'}}/><col style={{width:'11rem'}}/></colgroup>
//           <thead className="thead">
//             <tr>
//               <th className="th text-left  text-amber-500/85 font-semibold tracking-wid">Название</th>
//               <th className="th text-left  text-amber-500/85 font-semibold tracking-wid">Slug</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wid">Цена</th>
//               <th className="th text-right text-amber-500/85 font-semibold tracking-wid">Мин</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Активна</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wid">Категория</th>
//               <th className="th text-center text-amber-500/85 font-semibold tracking-wid">Описание</th>
//               <th className="th text-right" />
//             </tr>
//           </thead>

//           <tbody>
//             {categories.map((c) => (
//               <tr key={c.id} className="row align-middle">
//                 <td className="td font-medium">{c.name}</td>

//                 <td className="td">
//                   <span className="font-mono text-white/70 whitespace-nowrap">{c.slug}</span>
//                 </td>

//                 <td className="td text-right whitespace-nowrap">{euro(c.priceCents)}</td>
//                 <td className="td text-right whitespace-nowrap">{c.durationMin ?? 0}</td>

//                 <td className="td text-center">
//                   {c.isActive ? (
//                     <span className="tag-active">Да</span>
//                   ) : (
//                     <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                       Нет
//                     </span>
//                   )}
//                 </td>

//                 <td className="td text-white/60 text-center">—</td>

//                 <td className="td max-w-[48rem]">
//                   <span className="block truncate" title={c.description ?? ''}>
//                     {c.description ?? '—'}
//                   </span>
//                 </td>

//                 <td className="td text-right">
//                   <details className="relative inline-block">
//                     <summary
//                       className="btn-primary cta-boost btn-primary-sheen idle-aura cursor-pointer list-none"
//                       role="button"
//                     >
//                       Редактировать
//                     </summary>

//                     <div className="popover right-0">
//                       {/* форма редактирования */}
//                       <form action={updateServiceVoid} className="grid grid-cols-2 gap-3">
//                         <input type="hidden" name="id" value={c.id} />
//                         <input type="hidden" name="kind" value="category" />

//                         <div className="col-span-2">
//                           <label className="mb-1 block text-xs opacity-70">Название</label>
//                           <input name="name" defaultValue={c.name} className="admin-input" />
//                         </div>

//                         <div>
//                           <label className="mb-1 block text-xs opacity-70">Slug</label>
//                           <input value={c.slug} readOnly className="admin-input cursor-not-allowed text-white/70" />
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <input
//                             id={`active-${c.id}`}
//                             name="isActive"
//                             type="checkbox"
//                             defaultChecked={c.isActive}
//                             className="admin-switch"
//                           />
//                           <label htmlFor={`active-${c.id}`} className="text-sm">
//                             Активна
//                           </label>
//                         </div>

//                         <div className="col-span-2">
//                           <label className="mb-1 block text-xs opacity-70">Описание</label>
//                           <textarea
//                             name="description"
//                             defaultValue={c.description ?? ''}
//                             rows={3}
//                             className="admin-textarea"
//                           />
//                         </div>

//                         <div className="col-span-2 mt-1 flex items-center justify-between gap-2">
//                           <button className="btn-primary">Сохранить</button>
//                         </div>
//                       </form>

//                       {/* отдельная форма удаления */}
//                       <div className="my-3 border-t border-white/10" />
//                       <form action={deleteServiceVoid} className="mt-1">
//                         <input type="hidden" name="id" value={c.id} />
//                         <button className="btn-danger w-full">Удалить категорию</button>
//                       </form>
//                     </div>
//                   </details>
//                 </td>
//               </tr>
//             ))}

//             {categories.length === 0 && (
//               <tr>
//                 <td className="td py-6 text-center text-white/50" colSpan={8}>
//                   Услуг пока нет
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </section>

//       {/* ======== КАТЕГОРИИ (мобайл) ======== */}
//       <section className="lg:hidden space-y-4">
//         {categories.length === 0 && <div className="admin-section text-sm text-gray-400">Услуг пока нет</div>}

//         {categories.map((c) => (
//           <details key={c.id} className="admin-card overflow-hidden">
//             <summary className="cursor-pointer select-none px-4 py-3 bg-white/5 flex items-center justify-between">
//               <span className="font-medium">{c.name}</span>
//               <span className="text-xs opacity-70">{c.isActive ? 'активна' : 'выкл'}</span>
//             </summary>

//             <div className="p-4 space-y-3">
//               <form action={updateServiceVoid} className="grid grid-cols-1 gap-3">
//                 <input type="hidden" name="id" value={c.id} />
//                 <input type="hidden" name="kind" value="category" />

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Название</label>
//                   <input name="name" defaultValue={c.name} className="admin-input" />
//                 </div>

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Slug</label>
//                   <input defaultValue={c.slug} className="admin-input" readOnly />
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <input
//                     id={`active-m-${c.id}`}
//                     name="isActive"
//                     type="checkbox"
//                     defaultChecked={c.isActive}
//                     className="admin-switch"
//                   />
//                   <label htmlFor={`active-m-${c.id}`} className="text-sm">
//                     Активна
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Описание</label>
//                   <textarea name="description" defaultValue={c.description ?? ''} rows={3} className="admin-textarea" />
//                 </div>

//                 <div>
//                   <button className="w-full btn-primary">Сохранить</button>
//                 </div>
//               </form>

//               <form action={deleteServiceVoid}>
//                 <input type="hidden" name="id" value={c.id} />
//                 <button className="w-full btn-danger">Удалить категорию</button>
//               </form>
//             </div>
//           </details>
//         ))}
//       </section>

//       {/* ======== ПОДУСЛУГИ ======== */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateAction={updateService}
//         deleteAction={deleteService}
//       />
//     </main>
//   );
// }









//--------работало но ругалось на формс 
// import { prisma } from "@/lib/db";
// import { createService, updateService, deleteService } from "./actions";
// import ServiceCreateForm from "./ServiceCreateForm";
// import SubservicesPanel from "./SubservicesPanel";

// function euro(cents: number | null): string {
//   if (cents === null) return "—";
//   return new Intl.NumberFormat("ru-RU", {
//     style: "currency",
//     currency: "EUR",
//   }).format((cents ?? 0) / 100);
// }

// export const dynamic = "force-dynamic";

// export default async function AdminServicesPage() {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null },
//     orderBy: { name: "asc" },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       children: {
//         orderBy: { name: "asc" },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   // Плоский список подуслуг (для панели)
//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     }))
//   );

//   return (
//     <main className="container py-8 space-y-8">
//       {/* неоновая шапка как на дашборде */}
//       <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-700/30 via-indigo-700/20 to-cyan-600/20 p-6 md:p-8">
//         <div
//           className="pointer-events-none absolute inset-0 -translate-x-1/3 translate-y-6 blur-3xl"
//           style={{
//             background:
//               "radial-gradient(1200px 300px at 90% 25%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(600px 200px at 40% 10%, rgba(168,85,247,0.35), transparent 55%)",
//           }}
//         />
//         <div className="relative z-10">
//           <h1 className="text-2xl md:text-3xl font-semibold">Услуги</h1>
//           <p className="mt-1 text-sm text-white/70">
//             Управление категориями и подуслугами. Быстрое редактирование и
//             обновление цен.
//           </p>
//         </div>
//       </div>

//       {/* Добавить */}
//       <section className="admin-section">
//         <h2 className="text-lg font-medium mb-4">Добавить</h2>

//         <ServiceCreateForm
//           parentOptions={parentOptions}
//           action={createService}
//         />
//       </section>
// {/* ======== КАТЕГОРИИ (десктоп, выровнено + стиль админки) ======== */}
// <section className="admin-section hidden lg:block overflow-x-auto">
//   <table className="table table-fixed">
//     {/* ВАЖНО: ни переносов, ни комментариев внутри colgroup */}
//     <colgroup><col style={{width:'18rem'}}/><col style={{width:'12rem'}}/><col style={{width:'7rem'}}/><col style={{width:'6rem'}}/><col style={{width:'8rem'}}/><col style={{width:'12rem'}}/><col style={{width:'auto'}}/><col style={{width:'11rem'}}/></colgroup>

//     <thead className="thead">
//       <tr>
//         <th className="th text-left  text-amber-500/85 font-semibold tracking-wid">Название</th>
//         <th className="th text-left  text-amber-500/85 font-semibold tracking-wid">Slug</th>
//         <th className="th text-right text-amber-500/85 font-semibold tracking-wid">Цена</th>
//         <th className="th text-right text-amber-500/85 font-semibold tracking-wid">Мин</th>
//         <th className="th text-center text-amber-500/85 font-semibold tracking-wide">Активна</th>
//         <th className="th text-center text-amber-500/85 font-semibold tracking-wid">Категория</th>
//         <th className="th text-center text-amber-500/85 font-semibold tracking-wid">Описание</th>
//         <th className="th text-right"></th>
//       </tr>
//     </thead>

//     <tbody>
//       {categories.map((c) => (
//         <tr key={c.id} className="row align-middle">
//           <td className="td font-medium">{c.name}</td>

//           <td className="td">
//             <span className="font-mono text-white/70 whitespace-nowrap">{c.slug}</span>
//           </td>

//           <td className="td text-right whitespace-nowrap">{euro(c.priceCents)}</td>
//           <td className="td text-right whitespace-nowrap">{c.durationMin ?? 0}</td>

//           <td className="td text-center">
//             {c.isActive ? (
//               <span className="tag-active">Да</span>
//             ) : (
//               <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                 Нет
//               </span>
//             )}
//           </td>

//           <td className="td text-white/60 text-center">—</td>

//           <td className="td max-w-[48rem]">
//             <span className="block truncate" title={c.description ?? ''}>
//               {c.description ?? '—'}
//             </span>
//           </td>

//           <td className="td text-right">
//             <details className="relative inline-block">
//               <summary
//                 className="btn-primary cta-boost btn-primary-sheen idle-aura cursor-pointer list-none"
//                 role="button"
//               >
//                 Редактировать
//               </summary>

//               {/* Поповер — карточка редактирования категории */}
//               <div className="popover right-0">
//                 {/* ФОРМА РЕДАКТИРОВАНИЯ (отдельно) */}
//                 <form action={updateService} className="grid grid-cols-2 gap-3">
//                   <input type="hidden" name="id" value={c.id} />
//                   <input type="hidden" name="kind" value="category" />

//                   <div className="col-span-2">
//                     <label className="mb-1 block text-xs opacity-70">Название</label>
//                     <input name="name" defaultValue={c.name} className="admin-input" />
//                   </div>

//                   <div>
//                     <label className="mb-1 block text-xs opacity-70">Slug</label>
//                     <input
//                       value={c.slug}
//                       readOnly
//                       className="admin-input cursor-not-allowed text-white/70"
//                     />
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <input
//                       id={`active-${c.id}`}
//                       name="isActive"
//                       type="checkbox"
//                       defaultChecked={c.isActive}
//                       className="admin-switch"
//                     />
//                     <label htmlFor={`active-${c.id}`} className="text-sm">
//                       Активна
//                     </label>
//                   </div>

//                   <div className="col-span-2">
//                     <label className="mb-1 block text-xs opacity-70">Описание</label>
//                     <textarea
//                       name="description"
//                       defaultValue={c.description ?? ''}
//                       rows={3}
//                       className="admin-textarea"
//                     />
//                   </div>

//                   <div className="col-span-2 mt-1 flex items-center justify-between gap-2">
//                     <button className="btn-primary">Сохранить</button>
//                   </div>
//                 </form>

//                 {/* Разделитель и ОТДЕЛЬНАЯ форма удаления (не вложена) */}
//                 <div className="my-3 border-t border-white/10" />

//                 <form action={deleteService} className="mt-1">
//                   <input type="hidden" name="id" value={c.id} />
//                   <button className="btn-danger w-full">Удалить категорию</button>
//                 </form>
//               </div>
//             </details>
//           </td>
//         </tr>
//       ))}

//       {categories.length === 0 && (
//         <tr>
//           <td className="td py-6 text-center text-white/50" colSpan={8}>
//             Услуг пока нет
//           </td>
//         </tr>
//       )}
//     </tbody>
//   </table>
// </section>

//       {/* ======== КАТЕГОРИИ (мобайл) ======== */}
//       <section className="lg:hidden space-y-4">
//         {categories.length === 0 && (
//           <div className="admin-section text-sm text-gray-400">
//             Услуг пока нет
//           </div>
//         )}

//         {categories.map((c) => (
//           <details key={c.id} className="admin-card overflow-hidden">
//             <summary className="cursor-pointer select-none px-4 py-3 bg-white/5 flex items-center justify-between">
//               <span className="font-medium">{c.name}</span>
//               <span className="text-xs opacity-70">
//                 {c.isActive ? "активна" : "выкл"}
//               </span>
//             </summary>

//             <div className="p-4 space-y-3">
//               <form action={updateService} className="grid grid-cols-1 gap-3">
//                 <input type="hidden" name="id" value={c.id} />
//                 <input type="hidden" name="kind" value="category" />

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">
//                     Название
//                   </label>
//                   <input
//                     name="name"
//                     defaultValue={c.name}
//                     className="admin-input"
//                   />
//                 </div>

//                 {/* slug — только просмотр, без name */}
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Slug</label>
//                   <input
//                     defaultValue={c.slug}
//                     className="admin-input"
//                     readOnly
//                   />
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <input
//                     id={`active-m-${c.id}`}
//                     name="isActive"
//                     type="checkbox"
//                     defaultChecked={c.isActive}
//                     className="admin-switch"
//                   />
//                   <label htmlFor={`active-m-${c.id}`} className="text-sm">
//                     Активна
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">
//                     Описание
//                   </label>
//                   <textarea
//                     name="description"
//                     defaultValue={c.description ?? ""}
//                     rows={3}
//                     className="admin-textarea"
//                   />
//                 </div>

//                 <div>
//                   <button className="w-full btn-primary">Сохранить</button>
//                 </div>
//               </form>

//               <form action={deleteService}>
//                 <input type="hidden" name="id" value={c.id} />
//                 <button className="w-full btn-danger">Удалить категорию</button>
//               </form>
//             </div>
//           </details>
//         ))}
//       </section>

//       {/* ======== ПОДУСЛУГИ ======== */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateAction={updateService}
//         deleteAction={deleteService}
//       />
//     </main>
//   );
// }

// //--------уже есть шапка но порбуем улучшить дальше
// import { prisma } from '@/lib/db';
// import { createService, updateService, deleteService } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format((cents ?? 0) / 100);
// }

// export const dynamic = 'force-dynamic';

// export default async function AdminServicesPage() {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       children: {
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   // плоский список подуслуг для панели
//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     }))
//   );

//   return (
//     <main className="container py-8 space-y-8">
//       {/* <h1 className="text-2xl md:text-3xl font-semibold">Услуги</h1> */}
//       {/* ───────── Неоновая шапка раздела ───────── */}
// <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] p-6 md:p-8">
//   {/* мягкая радужная засветка под кнопкой справа */}
//   <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 blur-2xl opacity-40 md:opacity-50" />

//   {/* большой мягкий фон-градиент вверху */}
//   <div className="pointer-events-none absolute -top-28 left-1/3 h-56 w-96 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
//   <div className="pointer-events-none absolute -top-24 right-0 h-56 w-[28rem] rounded-full bg-cyan-400/20 blur-3xl" />

//   <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//     <div>
//       <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
//         Услуги <span className="align-super text-fuchsia-400/80 text-lg">✦</span>
//       </h1>
//       <p className="mt-1 text-sm text-white/60">
//         Управление категориями и подуслугами. Добавление, редактирование и быстрый поиск.
//       </p>
//     </div>

//     {/* опциональная «быстрая» кнопка — можешь навесить ссылку/действие позже */}
//     {/* <button
//       type="button"
//       className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2
//                  text-sm font-medium text-white
//                  bg-gradient-to-r from-fuchsia-600 to-violet-600
//                  hover:from-fuchsia-500 hover:to-cyan-500 transition"
//     >
//       <span className="i-lucide:wand-sparkles block h-4 w-4" aria-hidden />
//       Быстро добавить
//       <span className="absolute -z-10 inset-0 rounded-full bg-fuchsia-500/40 blur-xl opacity-40 group-hover:opacity-60 transition" />
//     </button> */}
//   </div>
// </section>

//       {/* Добавить */}
//       <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur px-4 py-5 md:px-6 md:py-6 shadow-lg shadow-black/5">
//         <h2 className="text-lg font-medium mb-3">Добавить</h2>
//         {/* client component with server action */}

//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

      // {/* ======== КАТЕГОРИИ (десктоп) ======== */}
      // <section className="rounded-2xl border border-white/10 overflow-x-auto hidden lg:block bg-white/[0.03] backdrop-blur shadow-lg shadow-black/5">
      //   <table className="min-w-[960px] w-full text-sm">
      //     <thead className="bg-white/5">
      //       <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
      //         <th>Название</th>
      //         <th>Slug</th>
      //         <th>Цена</th>
      //         <th>Мин</th>
      //         <th>Активна</th>
      //         <th>Категория</th>
      //         <th>Описание</th>
      //         <th style={{ width: 240 }}></th>
      //       </tr>
      //     </thead>
      //     <tbody>
      //       {categories.map((c) => (
      //         <tr key={c.id} className="[&>td]:px-3 [&>td]:py-2 align-top border-t border-white/10">
      //           <td className="font-medium">{c.name}</td>
      //           <td className="font-mono opacity-80">{c.slug}</td>
      //           <td>{euro(c.priceCents)}</td>
      //           <td>{c.durationMin}</td>
      //           <td>{c.isActive ? 'Да' : 'Нет'}</td>
      //           <td>—</td>
      //           <td className="max-w-[32rem]">{c.description ?? '—'}</td>
      //           <td>
      //             <details className="relative">
      //               <summary className="cursor-pointer rounded-full px-3 py-1.5 border border-white/20 hover:bg-white/10 transition list-none">
      //                 Редактировать
      //               </summary>

      //               {/* Поповер-редактор категории (slug убран из формы) */}
      //               <div className="absolute right-0 z-20 mt-2 w-[36rem] rounded-xl border border-white/10 bg-[#0b1220] p-3 shadow-xl">
      //                 <form action={updateService} className="grid grid-cols-2 gap-2">
      //                   <input type="hidden" name="id" value={c.id} />
      //                   <input type="hidden" name="kind" value="category" />
      //                   <input
      //                     name="name"
      //                     defaultValue={c.name}
      //                     className="rounded-lg border border-white/10 bg-transparent px-2 py-1 col-span-2"
      //                   />
      //                   <div className="text-xs col-span-2 opacity-70">
      //                     Slug: <span className="font-mono">{c.slug}</span>
      //                   </div>
      //                   <div className="flex items-center gap-2">
      //                     <input
      //                       id={`active-${c.id}`}
      //                       name="isActive"
      //                       type="checkbox"
      //                       defaultChecked={c.isActive}
      //                       className="rounded border-white/20"
      //                     />
      //                     <label htmlFor={`active-${c.id}`}>Активна</label>
      //                   </div>
      //                   <textarea
      //                     name="description"
      //                     defaultValue={c.description ?? ''}
      //                     rows={2}
      //                     className="rounded-lg border border-white/10 bg-transparent px-2 py-1 col-span-2"
      //                   />
      //                   <div className="col-span-2">
      //                     <button className="rounded-full px-3 py-1.5 border border-white/20 hover:bg-white/10 transition">
      //                       Сохранить
      //                     </button>
      //                   </div>
      //                 </form>

      //                 {/* отдельная форма удаления */}
      //                 <form action={deleteService} className="mt-2">
      //                   <input type="hidden" name="id" value={c.id} />
      //                   <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-400 hover:bg-rose-500/10 transition">
      //                     Удалить категорию
      //                   </button>
      //                 </form>
      //               </div>
      //             </details>
      //           </td>
      //         </tr>
      //       ))}

      //       {categories.length === 0 && (
      //         <tr>
      //           <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>
      //             Услуг пока нет
      //           </td>
      //         </tr>
      //       )}
      //     </tbody>
      //   </table>
      // </section>

      // {/* ======== КАТЕГОРИИ (мобайл) ======== */}
      // <section className="lg:hidden space-y-4">
      //   {categories.length === 0 && (
      //     <div className="rounded-2xl border border-white/10 p-4 text-sm text-gray-400 bg-white/[0.03] backdrop-blur">
      //       Услуг пока нет
      //     </div>
      //   )}

      //   {categories.map((c) => (
      //     <details key={c.id} className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03] backdrop-blur">
      //       <summary className="cursor-pointer select-none px-4 py-3 bg-white/5 flex items-center justify-between">
      //         <span className="font-medium">{c.name}</span>
      //         <span className="text-xs opacity-70">{c.isActive ? 'активна' : 'выкл'}</span>
      //       </summary>

      //       <div className="p-4 space-y-3">
      //         <form action={updateService} className="grid grid-cols-1 gap-3">
      //           <input type="hidden" name="id" value={c.id} />
      //           <input type="hidden" name="kind" value="category" />
      //           <div>
      //             <label className="block text-xs mb-1 opacity-80">Название</label>
      //             <input name="name" defaultValue={c.name} className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2" />
      //           </div>
      //           <div className="text-xs opacity-70">Slug: <span className="font-mono">{c.slug}</span></div>
      //           <div className="flex items-center gap-2">
      //             <input id={`active-m-${c.id}`} name="isActive" type="checkbox" defaultChecked={c.isActive} className="rounded border-white/20" />
      //             <label htmlFor={`active-m-${c.id}`} className="text-sm">Активна</label>
      //           </div>
      //           <div>
      //             <label className="block text-xs mb-1 opacity-80">Описание</label>
      //             <textarea name="description" defaultValue={c.description ?? ''} rows={3} className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2" />
      //           </div>
      //           <div>
      //             <button className="w-full rounded-full px-4 py-2 border border-white/20 hover:bg-white/10 transition">Сохранить</button>
      //           </div>
      //         </form>

      //         <form action={deleteService}>
      //           <input type="hidden" name="id" value={c.id} />
      //           <button className="w-full rounded-full px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
      //             Удалить категорию
      //           </button>
      //         </form>
      //       </div>
      //     </details>
      //   ))}
      // </section>

//       {/* ======== ПОДУСЛУГИ ======== */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateAction={updateService}
//         deleteAction={deleteService}
//       />
//     </main>
//   );
// }

//------------хорошо но нужно добавить дизайн
// // src/app/admin/services/page.tsx
// import { prisma } from '@/lib/db';
// import { createService, updateService, deleteService } from './actions';
// import ServiceCreateForm from './ServiceCreateForm';
// import SubservicesPanel from './SubservicesPanel';

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format((cents ?? 0) / 100);
// }

// export const dynamic = 'force-dynamic';

// export default async function AdminServicesPage() {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       children: {
//         orderBy: { name: 'asc' },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   // Плоский список подуслуг для панели (с именем категории)
//   const subservices = categories.flatMap((c) =>
//     c.children.map((s) => ({
//       ...s,
//       parentName: c.name,
//       createdAt: s.createdAt.toISOString(),
//       updatedAt: s.updatedAt.toISOString(),
//     }))
//   );

//   return (
//     <main className="container py-8 space-y-8">
//       <h1 className="text-2xl font-semibold">Услуги</h1>

//       {/* Добавить */}
//       <section className="rounded-xl border border-white/10 p-4">
//         <h2 className="text-lg font-medium mb-3">Добавить</h2>
//         {/* client component with server action */}

//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

//       {/* ======== КАТЕГОРИИ (десктоп) ======== */}
//       <section className="rounded-xl border border-white/10 overflow-x-auto hidden lg:block">
//         <table className="min-w-[960px] w-full text-sm">
//           <thead className="bg-white/5">
//             <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
//               <th>Название</th>
//               <th>Slug</th>
//               <th>Цена</th>
//               <th>Мин</th>
//               <th>Активна</th>
//               <th>Категория</th>
//               <th>Описание</th>
//               <th style={{ width: 240 }}></th>
//             </tr>
//           </thead>
//           <tbody>
//             {categories.map((c) => (
//               <tr key={c.id} className="[&>td]:px-3 [&>td]:py-2 align-top border-t border-white/10">
//                 <td className="font-medium">{c.name}</td>
//                 <td>{c.slug}</td>
//                 <td>{euro(c.priceCents)}</td>
//                 <td>{c.durationMin}</td>
//                 <td>{c.isActive ? 'Да' : 'Нет'}</td>
//                 <td>—</td>
//                 <td className="max-w-[32rem]">{c.description ?? '—'}</td>
//                 <td>
//                   <details className="relative">
//                     <summary className="cursor-pointer rounded-full px-3 py-1.5 border hover:bg-white/10 transition list-none">
//                       Редактировать
//                     </summary>

//                     {/* Поповер-редактор категории */}
//                     <div className="absolute right-0 z-20 mt-2 w-[36rem] rounded-xl border border-white/10 bg-[#0b1220] p-3 shadow-xl">
//                       <form action={updateService} className="grid grid-cols-2 gap-2">
//                         <input type="hidden" name="id" value={c.id} />
//                         <input type="hidden" name="kind" value="category" />
//                         <input
//                           name="name"
//                           defaultValue={c.name}
//                           className="rounded-lg border bg-transparent px-2 py-1 col-span-2"
//                         />
//                         <input
//                           name="slug"
//                           defaultValue={c.slug}
//                           className="rounded-lg border bg-transparent px-2 py-1"
//                         />
//                         <div className="flex items-center gap-2">
//                           <input
//                             id={`active-${c.id}`}
//                             name="isActive"
//                             type="checkbox"
//                             defaultChecked={c.isActive}
//                             className="rounded"
//                           />
//                           <label htmlFor={`active-${c.id}`}>Активна</label>
//                         </div>
//                         <textarea
//                           name="description"
//                           defaultValue={c.description ?? ''}
//                           rows={2}
//                           className="rounded-lg border bg-transparent px-2 py-1 col-span-2"
//                         />
//                         <div className="col-span-2">
//                           <button className="rounded-full px-3 py-1.5 border hover:bg-white/10 transition">
//                             Сохранить
//                           </button>
//                         </div>
//                       </form>

//                       {/* ОТДЕЛЬНАЯ форма удаления — НЕ внутри формы редактирования */}
//                       <form action={deleteService} className="mt-2">
//                         <input type="hidden" name="id" value={c.id} />
//                         <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-400 hover:bg-rose-500/10 transition">
//                           Удалить категорию
//                         </button>
//                       </form>
//                     </div>
//                   </details>
//                 </td>
//               </tr>
//             ))}

//             {categories.length === 0 && (
//               <tr>
//                 <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>
//                   Услуг пока нет
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </section>

//       {/* ======== КАТЕГОРИИ (мобайл) ======== */}
//       <section className="lg:hidden space-y-4">
//         {categories.length === 0 && (
//           <div className="rounded-xl border border-white/10 p-4 text-sm text-gray-400">Услуг пока нет</div>
//         )}

//         {categories.map((c) => (
//           <details key={c.id} className="rounded-xl border border-white/10 overflow-hidden">
//             <summary className="cursor-pointer select-none px-4 py-3 bg-white/5 flex items-center justify-between">
//               <span className="font-medium">{c.name}</span>
//               <span className="text-xs opacity-70">{c.isActive ? 'активна' : 'выкл'}</span>
//             </summary>

//             <div className="p-4 space-y-3">
//               <form action={updateService} className="grid grid-cols-1 gap-3">
//                 <input type="hidden" name="id" value={c.id} />
//                 <input type="hidden" name="kind" value="category" />
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Название</label>
//                   <input name="name" defaultValue={c.name} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                 </div>
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Slug</label>
//                   <input name="slug" defaultValue={c.slug} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <input id={`active-m-${c.id}`} name="isActive" type="checkbox" defaultChecked={c.isActive} className="rounded" />
//                   <label htmlFor={`active-m-${c.id}`} className="text-sm">Активна</label>
//                 </div>
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Описание</label>
//                   <textarea name="description" defaultValue={c.description ?? ''} rows={3} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                 </div>
//                 <div>
//                   <button className="w-full rounded-full px-4 py-2 border hover:bg-white/10 transition">Сохранить</button>
//                 </div>
//               </form>

//               {/* Отдельная форма удаления (не вложена в форму редактирования) */}
//               <form action={deleteService}>
//                 <input type="hidden" name="id" value={c.id} />
//                 <button className="w-full rounded-full px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
//                   Удалить категорию
//                 </button>
//               </form>
//             </div>
//           </details>
//         ))}
//       </section>

//       {/* ======== ПОДУСЛУГИ: фильтры + переключатель «карточки/таблица» ======== */}
//       <SubservicesPanel
//         parentOptions={parentOptions}
//         subservices={subservices}
//         updateAction={updateService}
//         deleteAction={deleteService}
//       />
//     </main>
//   );
// }

//--------------почти то что надо-----
// // src/app/admin/services/page.tsx
// import { prisma } from "@/lib/db";
// import { createService, updateService, deleteService } from "./actions";
// import ServiceCreateForm from "./ServiceCreateForm";

// function euro(cents: number | null): string {
//   if (cents === null) return "—";
//   return new Intl.NumberFormat("de-DE", {
//     style: "currency",
//     currency: "EUR",
//   }).format((cents ?? 0) / 100);
// }

// export const dynamic = "force-dynamic";

// export default async function AdminServicesPage() {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null },
//     orderBy: { name: "asc" },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       children: {
//         orderBy: { name: "asc" },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   return (
//     <main className="container py-6 md:py-8 space-y-8">
//       <header className="flex items-start md:items-center gap-3 flex-col md:flex-row">
//         <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
//           Услуги
//         </h1>
//         <p className="text-sm opacity-70">
//           Создание категорий и подуслуг, редактирование и удаление.
//         </p>
//       </header>

//       {/* Create */}
//       <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-6">
//         <h2 className="text-lg font-medium mb-4">Добавить новую запись</h2>
//         <ServiceCreateForm
//           parentOptions={parentOptions}
//           action={createService}
//         />
//       </section>

//       {/* ======== DESKTOP (>=lg): просторные карточки 2 колонки ======== */}
//       <section className="hidden lg:block space-y-6">
//         {categories.length === 0 && (
//           <div className="rounded-2xl border border-white/10 p-8 text-gray-400 text-center">
//             Услуг пока нет
//           </div>
//         )}

//         {categories.map((c) => (
//           <article
//             key={c.id}
//             className="rounded-2xl border border-white/10 bg-white/5 p-6 grid grid-cols-12 gap-8"
//           >
//             {/* LEFT: Category form */}
//             <div className="col-span-7">
//               <header className="mb-3 flex items-center justify-between gap-4">
//                 <div>
//                   <h3 className="text-xl font-semibold leading-tight">
//                     {c.name}
//                   </h3>
//                   <p className="text-xs opacity-60 break-all">{c.slug}</p>
//                 </div>
//                 <span
//                   className={`text-xs rounded-full px-3 py-1 border shrink-0 ${
//                     c.isActive
//                       ? "border-emerald-500 text-emerald-400"
//                       : "border-zinc-500 text-zinc-400"
//                   }`}
//                 >
//                   {c.isActive ? "Активна" : "Выключена"}
//                 </span>
//               </header>

//               <form action={updateService} className="grid grid-cols-12 gap-4">
//                 <input type="hidden" name="id" value={c.id} />
//                 <input type="hidden" name="kind" value="category" />

//                 <div className="col-span-12">
//                   <label className="block text-sm mb-1">
//                     Название категории
//                   </label>
//                   <input
//                     name="name"
//                     defaultValue={c.name}
//                     className="w-full rounded-xl border bg-transparent px-3 py-2"
//                   />
//                 </div>

//                 <div className="col-span-6">
//                   <label className="block text-sm mb-1">Slug</label>
//                   <input
//                     name="slug"
//                     defaultValue={c.slug}
//                     className="w-full rounded-xl border bg-transparent px-3 py-2 break-all"
//                   />
//                 </div>

//                 <div className="col-span-6 flex items-end">
//                   <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 cursor-pointer select-none">
//                     <input
//                       name="isActive"
//                       type="checkbox"
//                       defaultChecked={c.isActive}
//                       className="rounded"
//                     />
//                     <span className="text-sm">Активна</span>
//                   </label>
//                 </div>

//                 <div className="col-span-12">
//                   <label className="block text-sm mb-1">Описание</label>
//                   <textarea
//                     name="description"
//                     defaultValue={c.description ?? ""}
//                     rows={4}
//                     className="w-full rounded-xl border bg-transparent px-3 py-2"
//                     placeholder="Описание (опционально)"
//                   />
//                 </div>

//                 <div className="col-span-12 flex flex-wrap gap-3">
//                   <button className="rounded-full px-4 py-2 border hover:bg-white/10 transition">
//                     Сохранить категорию
//                   </button>

//                   <form action={deleteService}>
//                     <input type="hidden" name="id" value={c.id} />
//                     <button className="rounded-full px-4 py-2 border border-rose-500 text-rose-400 hover:bg-rose-500/10 transition">
//                       Удалить категорию
//                     </button>
//                   </form>
//                 </div>
//               </form>

//               {/* meta line */}
//               <div className="mt-4 text-xs opacity-50">
//                 Обновлено: {new Date(c.updatedAt).toLocaleString()} • Цена по
//                 категории: {euro(c.priceCents)} • Минуты: {c.durationMin}
//               </div>
//             </div>

//             {/* RIGHT: Children list */}
//             <aside className="col-span-5">
//               <div className="rounded-xl border border-white/10 overflow-hidden h-full flex flex-col">
//                 <div className="px-4 py-3 text-xs uppercase tracking-wide opacity-60 bg-white/5">
//                   Подуслуги
//                 </div>

//                 <div className="p-4 space-y-4 overflow-auto max-h-[540px]">
//                   {c.children.length === 0 && (
//                     <div className="text-sm opacity-60">Нет подуслуг</div>
//                   )}

//                   {c.children.map((s) => (
//                     <div
//                       key={s.id}
//                       className="rounded-lg border border-white/10 p-4"
//                     >
//                       <div className="font-medium mb-3">{s.name}</div>

//                       <form
//                         action={updateService}
//                         className="grid grid-cols-12 gap-3"
//                       >
//                         <input type="hidden" name="id" value={s.id} />
//                         <input type="hidden" name="kind" value="service" />

//                         <div className="col-span-12">
//                           <label className="block text-xs mb-1 opacity-80">
//                             Название
//                           </label>
//                           <input
//                             name="name"
//                             defaultValue={s.name}
//                             className="w-full rounded-lg border bg-transparent px-3 py-2"
//                           />
//                         </div>

//                         <div className="col-span-7">
//                           <label className="block text-xs mb-1 opacity-80">
//                             Slug
//                           </label>
//                           <input
//                             name="slug"
//                             defaultValue={s.slug}
//                             className="w-full rounded-lg border bg-transparent px-3 py-2 break-all"
//                           />
//                         </div>

//                         <div className="col-span-5 grid grid-cols-2 gap-3">
//                           <div>
//                             <label className="block text-xs mb-1 opacity-80">
//                               Минуты
//                             </label>
//                             <input
//                               name="durationMin"
//                               type="number"
//                               min={0}
//                               step={5}
//                               defaultValue={s.durationMin}
//                               className="w-full rounded-lg border bg-transparent px-3 py-2"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-xs mb-1 opacity-80">
//                               Цена (€)
//                             </label>
//                             <input
//                               name="price"
//                               inputMode="decimal"
//                               defaultValue={
//                                 s.priceCents
//                                   ? (s.priceCents / 100).toString()
//                                   : ""
//                               }
//                               className="w-full rounded-lg border bg-transparent px-3 py-2"
//                             />
//                           </div>
//                         </div>

//                         <div className="col-span-6">
//                           <label className="block text-xs mb-1 opacity-80">
//                             Категория
//                           </label>
//                           <select
//                             name="parentId"
//                             defaultValue={s.parentId ?? ""}
//                             className="w-full rounded-lg border bg-transparent px-3 py-2"
//                           >
//                             <option value="">— без категории —</option>
//                             {parentOptions.map((p) => (
//                               <option key={p.id} value={p.id}>
//                                 {p.name}
//                               </option>
//                             ))}
//                           </select>
//                         </div>

//                         <div className="col-span-6 flex items-end">
//                           <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 cursor-pointer select-none">
//                             <input
//                               name="isActive"
//                               type="checkbox"
//                               defaultChecked={s.isActive}
//                               className="rounded"
//                             />
//                             <span className="text-sm">Активна</span>
//                           </label>
//                         </div>

//                         <div className="col-span-12">
//                           <label className="block text-xs mb-1 opacity-80">
//                             Описание
//                           </label>
//                           <textarea
//                             name="description"
//                             defaultValue={s.description ?? ""}
//                             rows={3}
//                             className="w-full rounded-lg border bg-transparent px-3 py-2"
//                           />
//                         </div>

//                         <div className="col-span-12 flex flex-wrap gap-3">
//                           <button className="rounded-full px-4 py-2 border hover:bg-white/10 transition">
//                             Сохранить подуслугу
//                           </button>
//                           <form action={deleteService}>
//                             <input type="hidden" name="id" value={s.id} />
//                             <button className="rounded-full px-4 py-2 border border-rose-500 text-rose-400 hover:bg-rose-500/10 transition">
//                               Удалить
//                             </button>
//                           </form>
//                         </div>
//                       </form>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </aside>
//           </article>
//         ))}
//       </section>

//       {/* ======== MOBILE/TABLET (<=lg): как раньше, аккордеоны ======== */}
//       <section className="lg:hidden space-y-4">
//         {categories.length === 0 && (
//           <div className="rounded-xl border border-white/10 p-4 text-sm text-gray-400">
//             Услуг пока нет
//           </div>
//         )}

//         {categories.map((c) => (
//           <details
//             key={c.id}
//             className="group rounded-2xl border border-white/10 overflow-hidden bg-white/5"
//           >
//             <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between">
//               <div>
//                 <div className="font-medium">{c.name}</div>
//                 <div className="text-xs opacity-60 break-all">{c.slug}</div>
//               </div>
//               <span
//                 className={`text-xs rounded-full px-2 py-0.5 border ${
//                   c.isActive
//                     ? "border-emerald-500 text-emerald-400"
//                     : "border-zinc-500 text-zinc-400"
//                 }`}
//               >
//                 {c.isActive ? "активна" : "выкл"}
//               </span>
//             </summary>

//             {/* Категория — форма */}
//             <div className="p-4 space-y-3 border-t border-white/10">
//               <form action={updateService} className="grid grid-cols-1 gap-3">
//                 <input type="hidden" name="id" value={c.id} />
//                 <input type="hidden" name="kind" value="category" />
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">
//                     Название
//                   </label>
//                   <input
//                     name="name"
//                     defaultValue={c.name}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Slug</label>
//                   <input
//                     name="slug"
//                     defaultValue={c.slug}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2 break-all"
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <input
//                     id={`active-m-${c.id}`}
//                     name="isActive"
//                     type="checkbox"
//                     defaultChecked={c.isActive}
//                     className="rounded"
//                   />
//                   <label htmlFor={`active-m-${c.id}`} className="text-sm">
//                     Активна
//                   </label>
//                 </div>
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">
//                     Описание
//                   </label>
//                   <textarea
//                     name="description"
//                     defaultValue={c.description ?? ""}
//                     rows={3}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <button className="w-full rounded-full px-4 py-2 border hover:bg-white/10 transition">
//                     Сохранить категорию
//                   </button>
//                 </div>
//               </form>

//               {/* Отдельная форма удаления категории */}
//               <form action={deleteService}>
//                 <input type="hidden" name="id" value={c.id} />
//                 <button className="w-full rounded-full px-4 py-2 border border-rose-500 text-rose-400 hover:bg-rose-500/10 transition">
//                   Удалить категорию
//                 </button>
//               </form>

//               {/* Подуслуги */}
//               {c.children.length > 0 && (
//                 <div className="mt-2 space-y-3">
//                   <p className="text-xs uppercase tracking-wide opacity-60">
//                     Подуслуги
//                   </p>
//                   {c.children.map((s) => (
//                     <div
//                       key={s.id}
//                       className="rounded-lg border border-white/10 p-3 space-y-3"
//                     >
//                       <form
//                         action={updateService}
//                         className="grid grid-cols-1 gap-3"
//                       >
//                         <input type="hidden" name="id" value={s.id} />
//                         <input type="hidden" name="kind" value="service" />
//                         <div>
//                           <label className="block text-xs mb-1 opacity-80">
//                             Название
//                           </label>
//                           <input
//                             name="name"
//                             defaultValue={s.name}
//                             className="w-full rounded-lg border bg-transparent px-3 py-2"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-xs mb-1 opacity-80">
//                             Slug
//                           </label>
//                           <input
//                             name="slug"
//                             defaultValue={s.slug}
//                             className="w-full rounded-lg border bg-transparent px-3 py-2 break-all"
//                           />
//                         </div>
//                         <div className="grid grid-cols-2 gap-2">
//                           <div>
//                             <label className="block text-xs mb-1 opacity-80">
//                               Минуты
//                             </label>
//                             <input
//                               name="durationMin"
//                               type="number"
//                               min={0}
//                               step={5}
//                               defaultValue={s.durationMin}
//                               className="w-full rounded-lg border bg-transparent px-3 py-2"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-xs mb-1 opacity-80">
//                               Цена (€)
//                             </label>
//                             <input
//                               name="price"
//                               inputMode="decimal"
//                               defaultValue={
//                                 s.priceCents
//                                   ? (s.priceCents / 100).toString()
//                                   : ""
//                               }
//                               className="w-full rounded-lg border bg-transparent px-3 py-2"
//                             />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-1 gap-2">
//                           <div className="flex items-center gap-2">
//                             <input
//                               id={`active-s-${s.id}`}
//                               name="isActive"
//                               type="checkbox"
//                               defaultChecked={s.isActive}
//                               className="rounded"
//                             />
//                             <label
//                               htmlFor={`active-s-${s.id}`}
//                               className="text-sm"
//                             >
//                               Активна
//                             </label>
//                           </div>
//                           <div>
//                             <label className="block text-xs mb-1 opacity-80">
//                               Категория
//                             </label>
//                             <select
//                               name="parentId"
//                               defaultValue={s.parentId ?? ""}
//                               className="w-full rounded-lg border bg-transparent px-3 py-2"
//                             >
//                               <option value="">— без категории —</option>
//                               {parentOptions.map((p) => (
//                                 <option key={p.id} value={p.id}>
//                                   {p.name}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
//                         <div>
//                           <label className="block text-xs mb-1 opacity-80">
//                             Описание
//                           </label>
//                           <textarea
//                             name="description"
//                             defaultValue={s.description ?? ""}
//                             rows={3}
//                             className="w-full rounded-lg border bg-transparent px-3 py-2"
//                           />
//                         </div>
//                         <div>
//                           <button className="w-full rounded-full px-4 py-2 border hover:bg-white/10 transition">
//                             Сохранить подуслугу
//                           </button>
//                         </div>
//                       </form>

//                       {/* Отдельная форма удаления подуслуги */}
//                       <form action={deleteService}>
//                         <input type="hidden" name="id" value={s.id} />
//                         <button className="w-full rounded-full px-4 py-2 border border-rose-500 text-rose-400 hover:bg-rose-500/10 transition">
//                           Удалить
//                         </button>
//                       </form>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </details>
//         ))}
//       </section>
//     </main>
//   );
// }

//---------преведущий дизайн
// // src/app/admin/services/page.tsx
// import { prisma } from "@/lib/db";
// import { createService, updateService, deleteService } from "./actions";
// import ServiceCreateForm from "./ServiceCreateForm";

// function euro(cents: number | null): string {
//   if (cents === null) return "—";
//   return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format((cents ?? 0) / 100);
// }

// export const dynamic = "force-dynamic";

// export default async function AdminServicesPage() {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null },
//     orderBy: { name: "asc" },
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       isActive: true,
//       createdAt: true,
//       updatedAt: true,
//       children: {
//         orderBy: { name: "asc" },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           isActive: true,
//           parentId: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

//   return (
//     <main className="container py-8 space-y-8">
//       <h1 className="text-2xl font-semibold">Услуги</h1>

//       {/* Create */}
//       <section className="rounded-xl border border-white/10 p-4">
//         <h2 className="text-lg font-medium mb-3">Добавить</h2>
//         <ServiceCreateForm parentOptions={parentOptions} action={createService} />
//       </section>

//       {/* ======== DESKTOP (table) ======== */}
//       <section className="rounded-xl border border-white/10 overflow-x-auto hidden md:block">
//         <table className="min-w-full text-sm">
//           <thead className="bg-white/5">
//             <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
//               <th>Название</th>
//               <th>Slug</th>
//               <th>Цена</th>
//               <th>Мин</th>
//               <th>Активна</th>
//               <th>Категория</th>
//               <th>Описание</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {categories.map((c) => (
//               <tr key={c.id} className="[&>td]:px-3 [&>td]:py-2 align-top border-t border-white/10">
//                 <td className="font-medium">{c.name}</td>
//                 <td>{c.slug}</td>
//                 <td>{euro(c.priceCents)}</td>
//                 <td>{c.durationMin}</td>
//                 <td>{c.isActive ? "Да" : "Нет"}</td>
//                 <td>—</td>
//                 <td className="max-w-[32rem]">{c.description ?? "—"}</td>
//                 <td className="min-w-[22rem]">
//                   <div className="grid grid-cols-2 gap-2">
//                     {/* Update category */}
//                     <form action={updateService} className="grid grid-cols-2 gap-2 col-span-2">
//                       <input type="hidden" name="id" value={c.id} />
//                       <input type="hidden" name="kind" value="category" />
//                       <input name="name" defaultValue={c.name} className="rounded-lg border bg-transparent px-2 py-1 col-span-2" />
//                       <input name="slug" defaultValue={c.slug} className="rounded-lg border bg-transparent px-2 py-1" />
//                       <div className="flex items-center gap-2">
//                         <input id={`active-${c.id}`} name="isActive" type="checkbox" defaultChecked={c.isActive} className="rounded" />
//                         <label htmlFor={`active-${c.id}`}>Активна</label>
//                       </div>
//                       <textarea name="description" defaultValue={c.description ?? ""} rows={2} className="rounded-lg border bg-transparent px-2 py-1 col-span-2" />
//                       <div className="col-span-2">
//                         <button className="rounded-full px-3 py-1.5 border hover:bg-white/10 transition">Сохранить</button>
//                       </div>
//                     </form>

//                     {/* Children */}
//                     {c.children.map((s) => (
//                       <div key={s.id} className="col-span-2 border-t border-white/10 pt-3">
//                         <div className="pl-6 font-medium mb-2">{s.name}</div>
//                         <div className="grid grid-cols-2 gap-2">
//                           <form action={updateService} className="grid grid-cols-2 gap-2 col-span-2">
//                             <input type="hidden" name="id" value={s.id} />
//                             <input type="hidden" name="kind" value="service" />
//                             <input name="name" defaultValue={s.name} className="rounded-lg border bg-transparent px-2 py-1 col-span-2" />
//                             <input name="slug" defaultValue={s.slug} className="rounded-lg border bg-transparent px-2 py-1" />
//                             <input name="durationMin" type="number" min={0} step={5} defaultValue={s.durationMin} className="rounded-lg border bg-transparent px-2 py-1" />
//                             <input name="price" inputMode="decimal" defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ""} className="rounded-lg border bg-transparent px-2 py-1" />
//                             <div className="flex items-center gap-2">
//                               <input id={`active-${s.id}`} name="isActive" type="checkbox" defaultChecked={s.isActive} className="rounded" />
//                               <label htmlFor={`active-${s.id}`}>Активна</label>
//                             </div>
//                             <select name="parentId" defaultValue={s.parentId ?? ""} className="rounded-lg border bg-transparent px-2 py-1">
//                               <option value="">— без категории —</option>
//                               {parentOptions.map((p) => (
//                                 <option key={p.id} value={p.id}>{p.name}</option>
//                               ))}
//                             </select>
//                             <textarea name="description" defaultValue={s.description ?? ""} rows={2} className="rounded-lg border bg-transparent px-2 py-1 col-span-2" />
//                             <div className="col-span-2">
//                               <button className="rounded-full px-3 py-1.5 border hover:bg-white/10 transition">Сохранить</button>
//                             </div>
//                           </form>

//                           {/* Delete child (отдельная форма, НЕ внутри update-формы) */}
//                           <form action={deleteService} className="col-span-2">
//                             <input type="hidden" name="id" value={s.id} />
//                             <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
//                               Удалить
//                             </button>
//                           </form>
//                         </div>
//                       </div>
//                     ))}

//                     {/* Delete category (отдельная форма, НЕ внутри update-формы) */}
//                     <form action={deleteService} className="col-span-2 mt-2">
//                       <input type="hidden" name="id" value={c.id} />
//                       <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">Удалить категорию</button>
//                     </form>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//             {categories.length === 0 && (
//               <tr>
//                 <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>
//                   Услуг пока нет
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </section>

//       {/* ======== MOBILE (cards/accordions) ======== */}
//       <section className="md:hidden space-y-4">
//         {categories.length === 0 && (
//           <div className="rounded-xl border border-white/10 p-4 text-sm text-gray-400">Услуг пока нет</div>
//         )}

//         {categories.map((c) => (
//           <details key={c.id} className="rounded-xl border border-white/10 overflow-hidden">
//             <summary className="cursor-pointer select-none px-4 py-3 bg-white/5 flex items-center justify-between">
//               <span className="font-medium">{c.name}</span>
//               <span className="text-xs opacity-70">{c.isActive ? "активна" : "выкл"}</span>
//             </summary>

//             {/* Категория — форма */}
//             <div className="p-4 space-y-3">
//               <form action={updateService} className="grid grid-cols-1 gap-3">
//                 <input type="hidden" name="id" value={c.id} />
//                 <input type="hidden" name="kind" value="category" />
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Название</label>
//                   <input name="name" defaultValue={c.name} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                 </div>
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Slug</label>
//                   <input name="slug" defaultValue={c.slug} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <input id={`active-m-${c.id}`} name="isActive" type="checkbox" defaultChecked={c.isActive} className="rounded" />
//                   <label htmlFor={`active-m-${c.id}`} className="text-sm">Активна</label>
//                 </div>
//                 <div>
//                   <label className="block text-xs mb-1 opacity-80">Описание</label>
//                   <textarea name="description" defaultValue={c.description ?? ""} rows={3} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                 </div>
//                 <div>
//                   <button className="w-full rounded-full px-4 py-2 border hover:bg-white/10 transition">Сохранить</button>
//                 </div>
//               </form>

//               {/* Отдельная форма удаления категории */}
//               <form action={deleteService}>
//                 <input type="hidden" name="id" value={c.id} />
//                 <button className="w-full rounded-full px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
//                   Удалить категорию
//                 </button>
//               </form>

//               {/* Подуслуги */}
//               {c.children.length > 0 && (
//                 <div className="mt-2 space-y-3">
//                   <p className="text-xs uppercase tracking-wide opacity-60">Подуслуги</p>
//                   {c.children.map((s) => (
//                     <div key={s.id} className="rounded-lg border border-white/10 p-3 space-y-3">
//                       <form action={updateService} className="grid grid-cols-1 gap-3">
//                         <input type="hidden" name="id" value={s.id} />
//                         <input type="hidden" name="kind" value="service" />
//                         <div>
//                           <label className="block text-xs mb-1 opacity-80">Название</label>
//                           <input name="name" defaultValue={s.name} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                         </div>
//                         <div>
//                           <label className="block text-xs mb-1 opacity-80">Slug</label>
//                           <input name="slug" defaultValue={s.slug} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                         </div>
//                         <div className="grid grid-cols-2 gap-2">
//                           <div>
//                             <label className="block text-xs mb-1 opacity-80">Минуты</label>
//                             <input name="durationMin" type="number" min={0} step={5} defaultValue={s.durationMin} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                           </div>
//                           <div>
//                             <label className="block text-xs mb-1 opacity-80">Цена (€)</label>
//                             <input name="price" inputMode="decimal" defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ""} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-1 gap-2">
//                           <div className="flex items-center gap-2">
//                             <input id={`active-s-${s.id}`} name="isActive" type="checkbox" defaultChecked={s.isActive} className="rounded" />
//                             <label htmlFor={`active-s-${s.id}`} className="text-sm">Активна</label>
//                           </div>
//                           <div>
//                             <label className="block text-xs mb-1 opacity-80">Категория</label>
//                             <select name="parentId" defaultValue={s.parentId ?? ""} className="w-full rounded-lg border bg-transparent px-3 py-2">
//                               <option value="">— без категории —</option>
//                               {parentOptions.map((p) => (
//                                 <option key={p.id} value={p.id}>{p.name}</option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
//                         <div>
//                           <label className="block text-xs mb-1 opacity-80">Описание</label>
//                           <textarea name="description" defaultValue={s.description ?? ""} rows={3} className="w-full rounded-lg border bg-transparent px-3 py-2" />
//                         </div>
//                         <div>
//                           <button className="w-full rounded-full px-4 py-2 border hover:bg-white/10 transition">Сохранить</button>
//                         </div>
//                       </form>

//                       {/* Отдельная форма удаления подуслуги */}
//                       <form action={deleteService}>
//                         <input type="hidden" name="id" value={s.id} />
//                         <button className="w-full rounded-full px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
//                           Удалить
//                         </button>
//                       </form>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </details>
//         ))}
//       </section>
//     </main>
//   );
// }
