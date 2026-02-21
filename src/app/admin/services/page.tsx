// src/app/admin/services/page.tsx
import { prisma } from '@/lib/prisma';
import { createService, updateCategory, updateSubservice, deleteService } from './actions';
import ServiceCreateForm from './ServiceCreateForm';
import SubservicesPanel from './SubservicesPanel';
import { TranslationButton } from './ServicesPageClient';
import { CategoryEditButton } from './EditButtons';
import {
  type SeoLocale,
  type SearchParamsPromise,
} from '@/lib/seo-locale';
import { resolveContentLocale } from '@/lib/seo-locale-server';

type ServicesPageCopy = {
  title: string;
  subtitle: string;
  addTitle: string;
  categoriesTitle: string;
  nameCol: string;
  slugCol: string;
  statusCol: string;
  descriptionCol: string;
  yes: string;
  no: string;
  noCategories: string;
  pieces: string;
  activeShort: string;
  offShort: string;
};

const SERVICES_PAGE_COPY: Record<SeoLocale, ServicesPageCopy> = {
  de: {
    title: 'Leistungen',
    subtitle: 'Kategorien und Unterleistungen verwalten',
    addTitle: 'Hinzufuegen',
    categoriesTitle: 'Kategorien',
    nameCol: 'Name',
    slugCol: 'Slug',
    statusCol: 'Status',
    descriptionCol: 'Beschreibung',
    yes: 'Ja',
    no: 'Nein',
    noCategories: 'Noch keine Kategorien',
    pieces: 'Stk.',
    activeShort: 'aktiv',
    offShort: 'aus',
  },
  ru: {
    title: 'Услуги',
    subtitle: 'Управление категориями и подуслугами',
    addTitle: 'Добавить',
    categoriesTitle: 'Категории',
    nameCol: 'Название',
    slugCol: 'Slug',
    statusCol: 'Статус',
    descriptionCol: 'Описание',
    yes: 'Да',
    no: 'Нет',
    noCategories: 'Категорий пока нет',
    pieces: 'шт.',
    activeShort: 'активна',
    offShort: 'выкл',
  },
  en: {
    title: 'Services',
    subtitle: 'Manage categories and subservices',
    addTitle: 'Add',
    categoriesTitle: 'Categories',
    nameCol: 'Name',
    slugCol: 'Slug',
    statusCol: 'Status',
    descriptionCol: 'Description',
    yes: 'Yes',
    no: 'No',
    noCategories: 'No categories yet',
    pieces: 'pcs.',
    activeShort: 'active',
    offShort: 'off',
  },
};

type PageProps = {
  searchParams?: SearchParamsPromise;
};

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage({ searchParams }: PageProps) {
  const locale = await resolveContentLocale(searchParams);
  const t = SERVICES_PAGE_COPY[locale];

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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">{t.title}</h1>
          <p className="mt-1 text-xs sm:text-sm text-white/70">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Create */}
      <section className="admin-section">
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">{t.addTitle}</h2>
        <ServiceCreateForm parentOptions={parentOptions} action={createService} locale={locale} />
      </section>

      {/* Categories Table (Desktop lg+) */}
      <section className="admin-section hidden lg:block">
        <h2 className="text-lg font-medium mb-4">{t.categoriesTitle}</h2>
        <table className="w-full text-sm table-fixed">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '18%' }}>{t.nameCol}</th>
              <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '14%' }}>{t.slugCol}</th>
              <th className="px-3 py-2.5 text-center text-amber-500/85 font-semibold tracking-wide" style={{ width: '8%' }}>{t.statusCol}</th>
              <th className="px-3 py-2.5 text-left text-amber-500/85 font-semibold tracking-wide" style={{ width: '38%' }}>{t.descriptionCol}</th>
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
                    <span className="tag-active text-[11px]">{t.yes}</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/15 px-1.5 py-0.5 text-[11px] text-white/50">
                      {t.no}
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
                    <TranslationButton service={c} locale={locale} />
                    <CategoryEditButton
                      category={c}
                      locale={locale}
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
                  {t.noCategories}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Categories Mobile (до lg) */}
      <section className="lg:hidden space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-medium">{t.categoriesTitle}</h2>
          <span className="text-xs text-white/50">{categories.length} {t.pieces}</span>
        </div>

        {categories.length === 0 && (
          <div className="admin-card p-4 text-sm text-white/50 text-center">
            {t.noCategories}
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
                  <span className="tag-active shrink-0 text-[10px]">{t.activeShort}</span>
                ) : (
                  <span className="inline-flex shrink-0 items-center rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] text-white/60">
                    {t.offShort}
                  </span>
                )}
              </div>

              {/* Description */}
              {c.description && (
                <p className="text-xs sm:text-sm text-white/60 line-clamp-2">{c.description}</p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                <TranslationButton service={c} locale={locale} />
                <CategoryEditButton
                  category={c}
                  locale={locale}
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
        locale={locale}
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
