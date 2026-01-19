// src/app/admin/services/ServiceCreateForm.tsx
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import type { ActionResult } from './actions';

type ParentOption = { id: string; name: string };

type Props = {
  parentOptions: ParentOption[];
  /** серверный экшен создания */
  action: (formData: FormData) => Promise<ActionResult>;
};

export default function ServiceCreateForm({ parentOptions, action }: Props) {
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
        return res ?? { ok: true, message: 'Готово' };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Неизвестная ошибка';
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
          {isExpanded ? 'Свернуть форму' : 'Добавить категорию или услугу'}
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
        {/* Название - full width on mobile, 5 cols on desktop */}
        <div className="sm:col-span-2 lg:col-span-5">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">Название</label>
          <input
            name="name"
            required
            className="admin-input text-sm"
            placeholder="Стрижка / Мужская"
          />
        </div>

        {/* Тип */}
        <div className="sm:col-span-1 lg:col-span-4">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">Тип</label>
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
            <option value="category">Это категория</option>
            <option value="service">Это услуга</option>
          </select>
        </div>

        {/* Категория (для услуги) */}
        <div className="sm:col-span-1 lg:col-span-3">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">
            <span className="hidden sm:inline">Категория (для услуги)</span>
            <span className="sm:hidden">Категория</span>
          </label>
          <select
            name="parentId"
            disabled={isCategory}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="admin-select disabled:opacity-50 text-sm"
          >
            <option value="">— без категории —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Минуты */}
        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">Минуты</label>
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
          <p className="mt-1 text-[10px] sm:text-[11px] text-white/40 hidden lg:block">Длительность услуги</p>
        </div>

        {/* Цена */}
        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">Цена (€)</label>
          <input
            name="price"
            inputMode="decimal"
            placeholder={pricePlaceholder}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isCategory}
            className="admin-input disabled:opacity-50 text-sm"
          />
          <p className="mt-1 text-[10px] sm:text-[11px] text-white/40 hidden lg:block">Например: 35</p>
        </div>

        {/* Описание */}
        <div className="sm:col-span-2 lg:col-span-6">
          <label className="block text-xs sm:text-sm mb-1 opacity-70">Описание</label>
          <textarea
            name="description"
            className="admin-textarea text-sm"
            rows={2}
            placeholder="Короткое описание (опционально)"
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
          <label htmlFor="isActive" className="text-sm cursor-pointer">Активна</label>
        </div>

        {/* Кнопка сохранения */}
        <div className="sm:col-span-1 lg:col-span-3">
          <button className="w-full btn-primary text-sm py-2.5">
            <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Сохранить
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







//-----------работало при старом удалении категории
// "use client";

// import { useMemo, useState } from "react";

// type ParentOption = { id: string; name: string };

// type Props = {
//   parentOptions: ParentOption[];
//   action: (formData: FormData) => Promise<void>; // server action: createService
// };

// export default function ServiceCreateForm({ parentOptions, action }: Props) {
//   const [kind, setKind] = useState<"category" | "service">("category");
//   const [parentId, setParentId] = useState<string>("");
//   const [durationMin, setDurationMin] = useState<number>(0);
//   const [price, setPrice] = useState<string>("");

//   const isCategory = kind === "category";

//   const pricePlaceholder = useMemo(() => (isCategory ? "—" : "45"), [isCategory]);
//   const durPlaceholder = useMemo(() => (isCategory ? "0" : "60"), [isCategory]);

//   return (
//     <form action={action} className="grid gap-3 md:gap-4 md:grid-cols-12 items-end">
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
//             const v = e.target.value === "service" ? "service" : "category";
//             setKind(v);
//             if (v === "category") {
//               setParentId("");
//               setDurationMin(0);
//               setPrice("");
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
//     </form>
//   );
// }







//--------------пока оставлю пробую улучшить дизайн
// 'use client';

// import { useMemo, useState, ChangeEvent } from 'react';

// type ParentOption = { id: string; name: string };

// type Props = {
//   parentOptions: ParentOption[];
//   action: (formData: FormData) => Promise<void>; // server action: createService
// };

// export default function ServiceCreateForm({ parentOptions, action }: Props) {
//   const [kind, setKind] = useState<'category' | 'service'>('category');
//   const [parentId, setParentId] = useState<string>('');
//   const [durationMin, setDurationMin] = useState<number>(0);
//   const [price, setPrice] = useState<string>('');
//   const isCategory = kind === 'category';

//   const pricePlaceholder = useMemo(() => (isCategory ? '—' : '45'), [isCategory]);
//   const durPlaceholder = useMemo(() => (isCategory ? '0' : '60'), [isCategory]);

//   const onKindChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     const v = e.target.value === 'service' ? 'service' : 'category';
//     setKind(v);
//     if (v === 'category') {
//       setParentId('');
//       setDurationMin(0);
//       setPrice('');
//     }
//   };

//   return (
//     <form action={action} className="grid gap-3 md:gap-4 md:grid-cols-12 items-end">
//       <div className="md:col-span-5">
//         <label className="block text-xs mb-1 opacity-80">Название</label>
//         <input
//           name="name"
//           required
//           className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
//           placeholder="Стрижка / Мужская"
//         />
//       </div>

//       {/* slug на форме убран: он генерируется на сервере */}

//       <div className="md:col-span-4">
//         <label className="block text-xs mb-1 opacity-80">Тип</label>
//         <select
//           name="kind"
//           value={kind}
//           onChange={onKindChange}
//           className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
//         >
//           <option value="category">Это категория</option>
//           <option value="service">Это услуга</option>
//         </select>
//       </div>

//       <div className="md:col-span-3">
//         <label className="block text-xs mb-1 opacity-80">Категория (для услуги)</label>
//         <select
//           name="parentId"
//           disabled={isCategory}
//           value={parentId}
//           onChange={(e) => setParentId(e.target.value)}
//           className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 disabled:opacity-50"
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
//         <label className="block text-xs mb-1 opacity-80">Минуты</label>
//         <input
//           name="durationMin"
//           type="number"
//           min={0}
//           step={5}
//           placeholder={durPlaceholder}
//           value={durationMin}
//           onChange={(e) => setDurationMin(Number(e.target.value || 0))}
//           disabled={isCategory}
//           className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 disabled:opacity-50"
//           aria-describedby="hint-duration"
//         />
//         <p id="hint-duration" className="mt-1 text-[11px] opacity-60">Длительность услуги в минутах.</p>
//       </div>

//       <div className="md:col-span-2">
//         <label className="block text-xs mb-1 opacity-80">Цена (€)</label>
//         <input
//           name="price"
//           inputMode="decimal"
//           placeholder={pricePlaceholder}
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           disabled={isCategory}
//           className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 disabled:opacity-50"
//           aria-describedby="hint-price"
//         />
//         <p id="hint-price" className="mt-1 text-[11px] opacity-60">Например <span className="font-mono">35</span>.</p>
//       </div>

//       <div className="md:col-span-6">
//         <label className="block text-xs mb-1 opacity-80">Описание</label>
//         <textarea
//           name="description"
//           className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
//           rows={2}
//           placeholder="Короткое описание (опционально)"
//         />
//       </div>

//       <div className="flex items-center gap-2 md:col-span-3">
//         <input id="isActive" name="isActive" type="checkbox" defaultChecked className="rounded border-white/20" />
//         <label htmlFor="isActive">Активна</label>
//       </div>

//       <div className="md:col-span-3">
//         <button className="w-full rounded-full px-4 py-2 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 transition">
//           Сохранить
//         </button>
//       </div>
//     </form>
//   );
// }









//----------хорошо но нужно добавить дизайн
// 'use client';

// import { useMemo, useState } from 'react';

// type ParentOption = { id: string; name: string };

// type Props = {
//   parentOptions: ParentOption[];
//   action: (formData: FormData) => Promise<void>; // server action: createService
// };

// export default function ServiceCreateForm({ parentOptions, action }: Props) {
//   const [kind, setKind] = useState<'category' | 'service'>('category');
//   const [parentId, setParentId] = useState<string>('');
//   const [durationMin, setDurationMin] = useState<number>(0);
//   const [price, setPrice] = useState<string>('');
//   const isCategory = kind === 'category';

//   const pricePlaceholder = useMemo(() => (isCategory ? '—' : '45'), [isCategory]);
//   const durPlaceholder = useMemo(() => (isCategory ? '0' : '60'), [isCategory]);

//   return (
//     <form action={action} className="grid gap-3 md:gap-4 md:grid-cols-12 items-end">
//       <div className="md:col-span-5">
//         <label className="block text-xs mb-1 opacity-70">Название</label>
//         <input
//           name="name"
//           required
//           className="w-full rounded-lg border bg-transparent px-3 py-2 border-white/15 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
//           placeholder="Стрижка / Мужская"
//         />
//       </div>

//       <div className="md:col-span-3">
//         <label className="block text-xs mb-1 opacity-70">Slug</label>
//         <input
//           name="slug"
//           className="w-full rounded-lg border bg-transparent px-3 py-2 border-white/15 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
//           placeholder="haircut-men"
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
//           className="w-full rounded-lg border bg-transparent px-3 py-2 border-white/15"
//         >
//           <option value="category">Это категория</option>
//           <option value="service">Это услуга</option>
//         </select>
//       </div>

//       <div className="md:col-span-4">
//         <label className="block text-xs mb-1 opacity-70">Категория (для услуги)</label>
//         <select
//           name="parentId"
//           disabled={isCategory}
//           value={parentId}
//           onChange={(e) => setParentId(e.target.value)}
//           className="w-full rounded-lg border bg-transparent px-3 py-2 border-white/15 disabled:opacity-50"
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
//           className="w-full rounded-lg border bg-transparent px-3 py-2 border-white/15 disabled:opacity-50"
//         />
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
//           className="w-full rounded-lg border bg-transparent px-3 py-2 border-white/15 disabled:opacity-50"
//         />
//       </div>

//       <div className="md:col-span-6">
//         <label className="block text-xs mb-1 opacity-70">Описание</label>
//         <textarea
//           name="description"
//           className="w-full rounded-lg border bg-transparent px-3 py-2 border-white/15"
//           rows={2}
//           placeholder="Короткое описание (опционально)"
//         />
//       </div>

//       <div className="flex items-center gap-2 md:col-span-3">
//         <input type="hidden" name="isActive" value="0" />
//         <input id="isActive" name="isActive" type="checkbox" value="1" defaultChecked className="rounded border-white/20" />
//         <label htmlFor="isActive">Активна</label>
//       </div>

//       <div className="md:col-span-3">
//         <button className="w-full rounded-full px-4 py-2 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 transition">
//           Сохранить
//         </button>
//       </div>
//     </form>
//   );
// }






//-----------почти то что надо
// // src/app/admin/services/ServiceCreateForm.tsx
// "use client";

// import { useMemo, useState } from "react";

// type ParentOption = { id: string; name: string };

// type Props = {
//   parentOptions: ParentOption[];
//   action: (formData: FormData) => Promise<void>; // server action: createService
// };

// export default function ServiceCreateForm({ parentOptions, action }: Props) {
//   const [kind, setKind] = useState<"category" | "service">("category");
//   const [parentId, setParentId] = useState<string>("");
//   const [durationMin, setDurationMin] = useState<number>(0);
//   const [price, setPrice] = useState<string>("");

//   const isCategory = kind === "category";
//   const pricePlaceholder = useMemo(() => (isCategory ? "—" : "45"), [isCategory]);
//   const durPlaceholder = useMemo(() => (isCategory ? "0" : "60"), [isCategory]);

//   return (
//     <form action={action} className="grid gap-3 md:grid-cols-12 items-end">
//       {/* Kind switch */}
//       <div className="md:col-span-3">
//         <label className="block text-sm mb-1">Тип</label>
//         <div className="grid grid-cols-2 rounded-lg border border-white/10 overflow-hidden">
//           <button
//             type="button"
//             onClick={() => {
//               setKind("category");
//               setParentId("");
//               setDurationMin(0);
//               setPrice("");
//             }}
//             className={`px-3 py-2 text-sm transition ${
//               isCategory ? "bg-white/10" : "hover:bg-white/5"
//             }`}
//           >
//             Категория
//           </button>
//           <button
//             type="button"
//             onClick={() => setKind("service")}
//             className={`px-3 py-2 text-sm transition ${
//               !isCategory ? "bg-white/10" : "hover:bg-white/5"
//             }`}
//           >
//             Подуслуга
//           </button>
//         </div>
//         <input type="hidden" name="kind" value={kind} />
//       </div>

//       <div className="md:col-span-4">
//         <label className="block text-sm mb-1">Название</label>
//         <input
//           name="name"
//           required
//           className="w-full rounded-lg border bg-transparent px-3 py-2"
//           placeholder={isCategory ? "Напр.: Парикмахерские услуги" : "Напр.: Мужская стрижка"}
//         />
//       </div>

//       <div className="md:col-span-3">
//         <label className="block text-sm mb-1">Slug</label>
//         <input name="slug" className="w-full rounded-lg border bg-transparent px-3 py-2" placeholder="haircut-men" />
//       </div>

//       <div className="md:col-span-2">
//         <label className="block text-sm mb-1">Активна</label>
//         <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 cursor-pointer select-none">
//           <input id="isActive" name="isActive" type="checkbox" defaultChecked className="rounded" />
//           <span className="text-sm">Да</span>
//         </label>
//       </div>

//       <div className="md:col-span-4">
//         <label className="block text-sm mb-1">Категория (для подуслуги)</label>
//         <select
//           name="parentId"
//           disabled={isCategory}
//           value={parentId}
//           onChange={(e) => setParentId(e.target.value)}
//           className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
//         >
//           <option value="">— без категории —</option>
//           {parentOptions.map((p) => (
//             <option key={p.id} value={p.id}>
//               {p.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="md:col-span-4">
//         <label className="block text-sm mb-1">Минуты</label>
//         <input
//           name="durationMin"
//           type="number"
//           min={0}
//           step={5}
//           placeholder={durPlaceholder}
//           value={durationMin}
//           onChange={(e) => setDurationMin(Number(e.target.value || 0))}
//           disabled={isCategory}
//           className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
//         />
//       </div>

//       <div className="md:col-span-4">
//         <label className="block text-sm mb-1">Цена (€)</label>
//         <input
//           name="price"
//           inputMode="decimal"
//           placeholder={pricePlaceholder}
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           disabled={isCategory}
//           className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
//         />
//       </div>

//       <div className="md:col-span-12">
//         <label className="block text-sm mb-1">Описание</label>
//         <textarea
//           name="description"
//           className="w-full rounded-lg border bg-transparent px-3 py-2"
//           rows={3}
//           placeholder="Короткое описание (опционально)"
//         />
//       </div>

//       <div className="md:col-span-12 flex flex-wrap gap-2">
//         <button className="rounded-full px-4 py-2 border hover:bg-white/10 transition">Сохранить</button>
//         <span className="text-xs opacity-60 self-center">
//           {isCategory ? "Будет создана новая категория" : "Будет создана новая подуслуга"}
//         </span>
//       </div>
//     </form>
//   );
// }






//-------------преведущий дзайн
// 'use client';

// import { useMemo, useState } from 'react';

// type ParentOption = { id: string; name: string };

// type Props = {
//   parentOptions: ParentOption[];
//   action: (formData: FormData) => Promise<void>; // server action: createService
// };

// export default function ServiceCreateForm({ parentOptions, action }: Props) {
//   const [kind, setKind] = useState<'category' | 'service'>('category');
//   const [parentId, setParentId] = useState<string>('');
//   const [durationMin, setDurationMin] = useState<number>(0);
//   const [price, setPrice] = useState<string>('');
//   const isCategory = kind === 'category';

//   const pricePlaceholder = useMemo(() => (isCategory ? '—' : '45'), [isCategory]);
//   const durPlaceholder = useMemo(() => (isCategory ? '0' : '60'), [isCategory]);

//   return (
//     <form action={action} className="grid gap-3 md:grid-cols-6 items-end">
//       <div className="md:col-span-2">
//         <label className="block text-sm mb-1">Название</label>
//         <input name="name" required className="w-full rounded-lg border bg-transparent px-3 py-2" placeholder="Стрижка / Мужская" />
//       </div>
//       <div>
//         <label className="block text-sm mb-1">Slug</label>
//         <input name="slug" className="w-full rounded-lg border bg-transparent px-3 py-2" placeholder="haircut-men" />
//       </div>

//       <div>
//         <label className="block text-sm mb-1">Тип</label>
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
//           className="w-full rounded-lg border bg-transparent px-3 py-2"
//         >
//           <option value="category">Это категория</option>
//           <option value="service">Это услуга</option>
//         </select>
//       </div>

//       <div>
//         <label className="block text-sm mb-1">Категория (для услуги)</label>
//         <select
//           name="parentId"
//           disabled={isCategory}
//           value={parentId}
//           onChange={(e) => setParentId(e.target.value)}
//           className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
//         >
//           <option value="">— без категории —</option>
//           {parentOptions.map((p) => (
//             <option key={p.id} value={p.id}>
//               {p.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-sm mb-1">Минуты</label>
//         <input
//           name="durationMin"
//           type="number"
//           min={0}
//           step={5}
//           placeholder={durPlaceholder}
//           value={durationMin}
//           onChange={(e) => setDurationMin(Number(e.target.value || 0))}
//           disabled={isCategory}
//           className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
//         />
//       </div>

//       <div>
//         <label className="block text-sm mb-1">Цена (€)</label>
//         <input
//           name="price"
//           inputMode="decimal"
//           placeholder={pricePlaceholder}
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           disabled={isCategory}
//           className="w-full rounded-lg border bg-transparent px-3 py-2 disabled:opacity-50"
//         />
//       </div>

//       <div className="md:col-span-6">
//         <label className="block text-sm mb-1">Описание</label>
//         <textarea name="description" className="w-full rounded-lg border bg-transparent px-3 py-2" rows={3} placeholder="Короткое описание (опционально)" />
//       </div>

//       <div className="flex items-center gap-2">
//         <input id="isActive" name="isActive" type="checkbox" defaultChecked className="rounded" />
//         <label htmlFor="isActive">Активна</label>
//       </div>

//       <div className="md:col-span-6">
//         <button className="rounded-full px-4 py-2 border hover:bg-white/10 transition">Сохранить</button>
//       </div>
//     </form>
//   );
// }
