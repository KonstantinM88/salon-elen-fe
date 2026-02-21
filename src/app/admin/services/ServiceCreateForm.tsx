// src/app/admin/services/ServiceCreateForm.tsx
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import type { ActionResult } from './actions';
import type { SeoLocale } from '@/lib/seo-locale';

type ParentOption = { id: string; name: string };

type Props = {
  parentOptions: ParentOption[];
  /** серверный экшен создания */
  action: (formData: FormData) => Promise<ActionResult>;
  locale?: SeoLocale;
};

type CreateFormCopy = {
  collapse: string;
  expand: string;
  name: string;
  namePlaceholder: string;
  type: string;
  kindCategory: string;
  kindService: string;
  categoryForService: string;
  categoryMobile: string;
  noCategory: string;
  minutes: string;
  durationHint: string;
  price: string;
  priceHint: string;
  description: string;
  descriptionPlaceholder: string;
  active: string;
  save: string;
  done: string;
  unknownError: string;
};

const CREATE_FORM_COPY: Record<SeoLocale, CreateFormCopy> = {
  de: {
    collapse: 'Formular ausblenden',
    expand: 'Kategorie oder Leistung hinzufuegen',
    name: 'Name',
    namePlaceholder: 'Haarschnitt / Herren',
    type: 'Typ',
    kindCategory: 'Das ist eine Kategorie',
    kindService: 'Das ist eine Leistung',
    categoryForService: 'Kategorie (fuer Leistung)',
    categoryMobile: 'Kategorie',
    noCategory: '- ohne Kategorie -',
    minutes: 'Minuten',
    durationHint: 'Leistungsdauer',
    price: 'Preis (€)',
    priceHint: 'Zum Beispiel: 35',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Kurzbeschreibung (optional)',
    active: 'Aktiv',
    save: 'Speichern',
    done: 'Fertig',
    unknownError: 'Unbekannter Fehler',
  },
  ru: {
    collapse: 'Свернуть форму',
    expand: 'Добавить категорию или услугу',
    name: 'Название',
    namePlaceholder: 'Стрижка / Мужская',
    type: 'Тип',
    kindCategory: 'Это категория',
    kindService: 'Это услуга',
    categoryForService: 'Категория (для услуги)',
    categoryMobile: 'Категория',
    noCategory: '— без категории —',
    minutes: 'Минуты',
    durationHint: 'Длительность услуги',
    price: 'Цена (€)',
    priceHint: 'Например: 35',
    description: 'Описание',
    descriptionPlaceholder: 'Короткое описание (опционально)',
    active: 'Активна',
    save: 'Сохранить',
    done: 'Готово',
    unknownError: 'Неизвестная ошибка',
  },
  en: {
    collapse: 'Collapse form',
    expand: 'Add category or service',
    name: 'Name',
    namePlaceholder: 'Haircut / Men',
    type: 'Type',
    kindCategory: 'This is a category',
    kindService: 'This is a service',
    categoryForService: 'Category (for service)',
    categoryMobile: 'Category',
    noCategory: '- no category -',
    minutes: 'Minutes',
    durationHint: 'Service duration',
    price: 'Price (€)',
    priceHint: 'Example: 35',
    description: 'Description',
    descriptionPlaceholder: 'Short description (optional)',
    active: 'Active',
    save: 'Save',
    done: 'Done',
    unknownError: 'Unknown error',
  },
};

export default function ServiceCreateForm({ parentOptions, action, locale = 'de' }: Props) {
  const t = CREATE_FORM_COPY[locale];
  const [kind, setKind] = React.useState<'category' | 'service'>('category');
  const [parentId, setParentId] = React.useState<string>('');
  const [durationMin, setDurationMin] = React.useState<number>(0);
  const [price, setPrice] = React.useState<string>('');
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isCategory = kind === 'category';

  const pricePlaceholder = React.useMemo(() => (isCategory ? '—' : '45'), [isCategory]);
  const durPlaceholder = React.useMemo(() => (isCategory ? '0' : '60'), [isCategory]);

  // экшен-редьюсер для формы
  const [state, formAction] = useActionState(
    async (_prev: ActionResult, fd: FormData): Promise<ActionResult> => {
      try {
        // если это категория — подчистим поля, чтобы на сервер не пришёл мусор
        if (fd.get('kind') === 'category') {
          fd.set('parentId', '');
          fd.set('durationMin', '0');
          fd.set('price', '');
        }
        const res = await action(fd);
        return res ?? { ok: true, message: t.done };
      } catch (e) {
        const msg = e instanceof Error ? e.message : t.unknownError;
        return { ok: false, message: msg };
      }
    },
    { ok: true } as ActionResult,
  );

  return (
    <div className="space-y-3">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="sm:hidden w-full flex items-center justify-between p-3 rounded-lg border border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition"
      >
        <span className="text-sm font-medium">
          {isExpanded ? t.collapse : t.expand}
        </span>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Form - always visible on desktop, collapsible on mobile */}
      <form 
        action={formAction} 
        className={`
          grid gap-3 sm:gap-4 
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 
          items-end
          ${isExpanded ? 'block' : 'hidden sm:grid'}
        `}
      >
        <input type="hidden" name="locale" value={locale} />
        {/* Название - full width on mobile, 5 cols on desktop */}
        <div className="sm:col-span-2 lg:col-span-5">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">{t.name}</label>
          <input
            name="name"
            required
            className="admin-input text-sm"
            placeholder={t.namePlaceholder}
          />
        </div>

        {/* Тип */}
        <div className="sm:col-span-1 lg:col-span-4">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">{t.type}</label>
          <select
            name="kind"
            value={kind}
            onChange={(e) => {
              const v = e.target.value === 'service' ? 'service' : 'category';
              setKind(v);
              if (v === 'category') {
                setParentId('');
                setDurationMin(0);
                setPrice('');
              }
            }}
            className="admin-select text-sm"
          >
            <option value="category">{t.kindCategory}</option>
            <option value="service">{t.kindService}</option>
          </select>
        </div>

        {/* Категория (для услуги) */}
        <div className="sm:col-span-1 lg:col-span-3">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">
            <span className="hidden sm:inline">{t.categoryForService}</span>
            <span className="sm:hidden">{t.categoryMobile}</span>
          </label>
          <select
            name="parentId"
            disabled={isCategory}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="admin-select disabled:opacity-50 text-sm"
          >
            <option value="">{t.noCategory}</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Минуты */}
        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">{t.minutes}</label>
          <input
            name="durationMin"
            type="number"
            min={0}
            step={5}
            placeholder={durPlaceholder}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value || 0))}
            disabled={isCategory}
            className="admin-input disabled:opacity-50 text-sm"
          />
          <p className="mt-1 text-[10px] sm:text-[11px] text-white/40 hidden lg:block">{t.durationHint}</p>
        </div>

        {/* Цена */}
        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">{t.price}</label>
          <input
            name="price"
            inputMode="decimal"
            placeholder={pricePlaceholder}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isCategory}
            className="admin-input disabled:opacity-50 text-sm"
          />
          <p className="mt-1 text-[10px] sm:text-[11px] text-white/40 hidden lg:block">{t.priceHint}</p>
        </div>

        {/* Описание */}
        <div className="sm:col-span-2 lg:col-span-6">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">{t.description}</label>
          <textarea
            name="description"
            className="admin-textarea text-sm"
            rows={2}
            placeholder={t.descriptionPlaceholder}
          />
        </div>

        {/* Активна */}
        <div className="flex items-center gap-2 sm:col-span-1 lg:col-span-3">
          <input type="hidden" name="isActive" value="0" />
          <input 
            id="isActive" 
            name="isActive" 
            type="checkbox" 
            value="1" 
            defaultChecked 
            className="admin-switch" 
          />
          <label htmlFor="isActive" className="text-sm cursor-pointer">{t.active}</label>
        </div>

        {/* Кнопка сохранения */}
        <div className="sm:col-span-1 lg:col-span-3">
          <button className="w-full btn-primary text-sm py-2.5">
            <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.save}
          </button>
        </div>

        {/* Сообщения от серверного экшена */}
        {!state.ok && state.message && (
          <div className="sm:col-span-2 lg:col-span-12 text-xs sm:text-sm text-rose-300/90 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <svg className="w-4 h-4 inline-block mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.message}
          </div>
        )}
        {state.ok && state.message && (
          <div className="sm:col-span-2 lg:col-span-12 text-xs sm:text-sm text-emerald-300/90 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg className="w-4 h-4 inline-block mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {state.message}
          </div>
        )}
      </form>
    </div>
  );
}





//-------работало, делаем адаптацию
// // src/app/admin/services/ServiceCreateForm.tsx
// 'use client';

// import * as React from 'react';
// import { useActionState } from 'react';
// import type { ActionResult } from './actions';

// type ParentOption = { id: string; name: string };

// type Props = {
//   parentOptions: ParentOption[];
//   /** серверный экшен создания */
//   action: (formData: FormData) => Promise<ActionResult>;
// };

// export default function ServiceCreateForm({ parentOptions, action }: Props) {
//   const [kind, setKind] = React.useState<'category' | 'service'>('category');
//   const [parentId, setParentId] = React.useState<string>('');
//   const [durationMin, setDurationMin] = React.useState<number>(0);
//   const [price, setPrice] = React.useState<string>('');

//   const isCategory = kind === 'category';

//   const pricePlaceholder = React.useMemo(() => (isCategory ? '—' : '45'), [isCategory]);
//   const durPlaceholder = React.useMemo(() => (isCategory ? '0' : '60'), [isCategory]);

//   // экшен-редьюсер для формы
//   const [state, formAction] = useActionState(
//     async (_prev: ActionResult, fd: FormData): Promise<ActionResult> => {
//       try {
//         // если это категория — подчистим поля, чтобы на сервер не пришёл мусор
//         if (fd.get('kind') === 'category') {
//           fd.set('parentId', '');
//           fd.set('durationMin', '0');
//           fd.set('price', '');
//         }
//         const res = await action(fd);
//         return res ?? { ok: true, message: 'Готово' };
//       } catch (e) {
//         const msg = e instanceof Error ? e.message : 'Неизвестная ошибка';
//         return { ok: false, message: msg };
//       }
//     },
//     { ok: true } as ActionResult,
//   );

//   return (
//     <form action={formAction} className="grid gap-3 md:gap-4 md:grid-cols-12 items-end">
//       <div className="md:col-span-5">
//         <label className="block text-xs mb-1 opacity-70">Название</label>
//         <input
//           name="name"
//           required
//           className="admin-input"
//           placeholder="Стрижка / Мужская"
//         />
//       </div>

//       <div className="md:col-span-4">
//         <label className="block text-xs mb-1 opacity-70">Тип</label>
//         <select
//           name="kind"
//           value={kind}
//           onChange={(e) => {
//             const v = e.target.value === 'service' ? 'service' : 'category';
//             setKind(v);
//             if (v === 'category') {
//               setParentId('');
//               setDurationMin(0);
//               setPrice('');
//             }
//           }}
//           className="admin-select"
//         >
//           <option value="category">Это категория</option>
//           <option value="service">Это услуга</option>
//         </select>
//       </div>

//       <div className="md:col-span-3">
//         <label className="block text-xs mb-1 opacity-70">Категория (для услуги)</label>
//         <select
//           name="parentId"
//           disabled={isCategory}
//           value={parentId}
//           onChange={(e) => setParentId(e.target.value)}
//           className="admin-select disabled:opacity-50"
//         >
//           <option value="">— без категории —</option>
//           {parentOptions.map((p) => (
//             <option key={p.id} value={p.id}>
//               {p.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="md:col-span-2">
//         <label className="block text-xs mb-1 opacity-70">Минуты</label>
//         <input
//           name="durationMin"
//           type="number"
//           min={0}
//           step={5}
//           placeholder={durPlaceholder}
//           value={durationMin}
//           onChange={(e) => setDurationMin(Number(e.target.value || 0))}
//           disabled={isCategory}
//           className="admin-input disabled:opacity-50"
//         />
//         <p className="mt-1 text-[11px] text-white/40">Длительность услуги в минутах.</p>
//       </div>

//       <div className="md:col-span-2">
//         <label className="block text-xs mb-1 opacity-70">Цена (€)</label>
//         <input
//           name="price"
//           inputMode="decimal"
//           placeholder={pricePlaceholder}
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           disabled={isCategory}
//           className="admin-input disabled:opacity-50"
//         />
//         <p className="mt-1 text-[11px] text-white/40">Например: 35.</p>
//       </div>

//       <div className="md:col-span-6">
//         <label className="block text-xs mb-1 opacity-70">Описание</label>
//         <textarea
//           name="description"
//           className="admin-textarea"
//           rows={2}
//           placeholder="Короткое описание (опционально)"
//         />
//       </div>

//       <div className="flex items-center gap-2 md:col-span-3">
//         <input type="hidden" name="isActive" value="0" />
//         <input id="isActive" name="isActive" type="checkbox" value="1" defaultChecked className="admin-switch" />
//         <label htmlFor="isActive">Активна</label>
//       </div>

//       <div className="md:col-span-3">
//         <button className="w-full btn-primary">Сохранить</button>
//       </div>

//       {/* сообщения от серверного экшена */}
//       {!state.ok && state.message && (
//         <div className="md:col-span-12 text-sm text-rose-300/90">{state.message}</div>
//       )}
//       {state.ok && state.message && (
//         <div className="md:col-span-12 text-sm text-emerald-300/90">{state.message}</div>
//       )}
//     </form>
//   );
// }
