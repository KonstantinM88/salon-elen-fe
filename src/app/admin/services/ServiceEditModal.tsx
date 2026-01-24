// src/app/admin/services/ServiceEditModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Save, Scissors, Trash2, X, Images } from 'lucide-react';
import Link from 'next/link';
import ClientPortal from '@/components/ui/ClientPortal';
import type { ActionResult } from './actions';

type ParentOption = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  durationMin: number | null;
  priceCents: number | null;
  isActive: boolean;
  parentId: string | null;
  parentName: string;
};

type Props = {
  service: Service;
  parentOptions: ParentOption[];
  onClose: () => void;
  onUpdate: (formData: FormData) => Promise<ActionResult>;
  onDelete: (formData: FormData) => Promise<ActionResult>;
};

type FormState = {
  name: string;
  description: string;
  durationMin: number;
  price: string; // € string
  parentId: string; // '' allowed
  isActive: boolean;
};

export default function ServiceEditModal({
  service,
  parentOptions,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  // ESC + scroll lock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const [formData, setFormData] = useState<FormState>({
    name: service.name,
    description: service.description ?? '',
    durationMin: service.durationMin ?? 0,
    price: ((service.priceCents ?? 0) / 100).toFixed(2),
    parentId: service.parentId ?? '',
    isActive: service.isActive,
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || deleting) return;

    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.set('id', service.id);
      fd.set('kind', 'service');
      fd.set('name', formData.name);
      fd.set('description', formData.description);
      fd.set('durationMin', String(formData.durationMin));
      fd.set('price', formData.price);
      fd.set('parentId', formData.parentId);
      fd.set('isActive', formData.isActive ? '1' : '0');

      const result = await onUpdate(fd);

      if (!result.ok) {
        throw new Error(result.message || 'Ошибка сохранения');
      }

      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (saving || deleting) return;

    setDeleting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.set('id', service.id);

      const result = await onDelete(fd);

      if (!result.ok) {
        throw new Error(result.message || 'Ошибка удаления');
      }

      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const canSave = formData.name.trim().length > 0 && !saving && !deleting;

  return (
    <ClientPortal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-stretch sm:items-center justify-center p-0 sm:p-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={[
              'relative w-full max-w-2xl',
              'bg-slate-900 border border-white/10 shadow-2xl overflow-hidden',
              'flex flex-col min-h-0',
              'rounded-none sm:rounded-2xl',
              // full screen mobile
              'h-[100svh] sm:h-auto sm:max-h-[90svh]',
            ].join(' ')}
          >
            {/* Header */}
            <div
              className="shrink-0 p-4 sm:p-6 border-b border-white/10"
              style={{
                background:
                  'linear-gradient(to right, rgba(99,102,241,0.22), rgba(139,92,246,0.22))',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{
                      background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)',
                      boxShadow: '0 10px 15px -3px rgba(99,102,241,0.3)',
                    }}
                  >
                    <Scissors className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      Редактировать услугу
                    </h2>
                    <p className="text-xs sm:text-sm mt-1 text-white/60 truncate">
                      {service.parentName}
                    </p>
                    {service.slug && (
                      <p className="text-xs mt-0.5 font-mono text-white/40 truncate">
                        {service.slug}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all hover:bg-white/10 shrink-0"
                  type="button"
                  aria-label="Закрыть"
                  title="Закрыть (Esc)"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form: IMPORTANT - flex-col */}
            <form onSubmit={handleUpdate} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable content */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">
                    Название услуги
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="Например: Мужская стрижка"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Категория</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData((p) => ({ ...p, parentId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="">— Без категории —</option>
                    {parentOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration + Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/90">
                      Длительность (мин)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={formData.durationMin}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          durationMin: Number(e.target.value),
                        }))
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/90">Цена (€)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.price}
                      onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                      required
                      className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none resize-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="Краткое описание услуги (опционально)"
                  />
                </div>

                {/* Active */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                      className="admin-switch"
                    />
                    <div>
                      <div className="font-medium text-white">Активна</div>
                      <div className="text-xs text-white/60 mt-0.5">Отображать услугу на сайте</div>
                    </div>
                  </label>
                </div>

                {/* Gallery button */}
                <div className="pt-2">
                  <Link
                    href={`/admin/services/${service.id}/gallery`}
                    className="w-full px-4 py-3 rounded-xl font-medium transition-all border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 flex items-center justify-center gap-2"
                  >
                    <Images className="h-4 w-4" />
                    Галерея работ
                  </Link>
                </div>

                {/* Delete block (inside scrollable content) */}
                <div className="pt-2 border-t border-white/10">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={saving || deleting}
                      className="w-full px-4 py-3 rounded-xl font-medium transition-all border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15 disabled:opacity-50"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Удалить услугу
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-center text-red-300">
                        Удалить услугу безвозвратно?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}
                          className="flex-1 px-4 py-3 rounded-xl font-medium border border-white/10 text-white hover:bg-white/5 disabled:opacity-50"
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex-1 px-4 py-3 rounded-xl font-medium bg-red-600 text-white disabled:opacity-50"
                        >
                          {deleting ? (
                            <span className="inline-flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Удаление...
                            </span>
                          ) : (
                            'Да, удалить'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg border border-red-400/20 bg-red-500/10 text-red-300">
                    ⚠️ {error}
                  </div>
                )}
              </div>

              {/* Footer ALWAYS VISIBLE */}
              <div className="shrink-0 border-t border-white/10 bg-slate-900/80 backdrop-blur p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+16px)]">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving || deleting}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium border border-white/10 text-white hover:bg-white/5 disabled:opacity-50"
                  >
                    Отмена
                  </button>

                  <button
                    type="submit"
                    disabled={!canSave}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-white disabled:opacity-50"
                    style={{
                      background: canSave
                        ? 'linear-gradient(to right, #6366f1, #8b5cf6)'
                        : 'rgba(99,102,241,0.30)',
                      boxShadow: '0 10px 15px -3px rgba(99,102,241,0.25)',
                    }}
                  >
                    {saving ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Сохранение...
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Save className="h-4 w-4" />
                        Сохранить
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ClientPortal>
  );
}






//-------добавляем редактирование фото-------
// // src/app/admin/services/ServiceEditModal.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { Loader2, Save, Scissors, Trash2, X } from 'lucide-react';
// import ClientPortal from '@/components/ui/ClientPortal';
// import type { ActionResult } from './actions';

// type ParentOption = {
//   id: string;
//   name: string;
// };

// type Service = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   durationMin: number | null;
//   priceCents: number | null;
//   isActive: boolean;
//   parentId: string | null;
//   parentName: string;
// };

// type Props = {
//   service: Service;
//   parentOptions: ParentOption[];
//   onClose: () => void;
//   onUpdate: (formData: FormData) => Promise<ActionResult>;
//   onDelete: (formData: FormData) => Promise<ActionResult>;
// };

// type FormState = {
//   name: string;
//   description: string;
//   durationMin: number;
//   price: string; // € string
//   parentId: string; // '' allowed
//   isActive: boolean;
// };

// export default function ServiceEditModal({
//   service,
//   parentOptions,
//   onClose,
//   onUpdate,
//   onDelete,
// }: Props) {
//   // ESC + scroll lock
//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//     };
//     document.addEventListener('keydown', onKeyDown);

//     const prevOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';

//     return () => {
//       document.removeEventListener('keydown', onKeyDown);
//       document.body.style.overflow = prevOverflow;
//     };
//   }, [onClose]);

//   const [formData, setFormData] = useState<FormState>({
//     name: service.name,
//     description: service.description ?? '',
//     durationMin: service.durationMin ?? 0,
//     price: ((service.priceCents ?? 0) / 100).toFixed(2),
//     parentId: service.parentId ?? '',
//     isActive: service.isActive,
//   });

//   const [saving, setSaving] = useState<boolean>(false);
//   const [deleting, setDeleting] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

//   const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (saving || deleting) return;

//     setSaving(true);
//     setError(null);

//     try {
//       const fd = new FormData();
//       fd.set('id', service.id);
//       fd.set('kind', 'service');
//       fd.set('name', formData.name);
//       fd.set('description', formData.description);
//       fd.set('durationMin', String(formData.durationMin));
//       fd.set('price', formData.price);
//       fd.set('parentId', formData.parentId);
//       fd.set('isActive', formData.isActive ? '1' : '0');

//       const result = await onUpdate(fd);

//       if (!result.ok) {
//         throw new Error(result.message || 'Ошибка сохранения');
//       }

//       onClose();
//       window.location.reload();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка сохранения');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (saving || deleting) return;

//     setDeleting(true);
//     setError(null);

//     try {
//       const fd = new FormData();
//       fd.set('id', service.id);

//       const result = await onDelete(fd);

//       if (!result.ok) {
//         throw new Error(result.message || 'Ошибка удаления');
//       }

//       onClose();
//       window.location.reload();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка удаления');
//     } finally {
//       setDeleting(false);
//       setShowDeleteConfirm(false);
//     }
//   };

//   const canSave = formData.name.trim().length > 0 && !saving && !deleting;

//   return (
//     <ClientPortal>
//       <AnimatePresence>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-[100000] flex items-stretch sm:items-center justify-center p-0 sm:p-4"
//           style={{
//             backgroundColor: 'rgba(0,0,0,0.75)',
//             backdropFilter: 'blur(8px)',
//           }}
//           onClick={onClose}
//           aria-modal="true"
//           role="dialog"
//         >
//           <motion.div
//             initial={{ scale: 0.98, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.98, opacity: 0 }}
//             onClick={(e) => e.stopPropagation()}
//             className={[
//               'relative w-full max-w-2xl',
//               'bg-slate-900 border border-white/10 shadow-2xl overflow-hidden',
//               'flex flex-col min-h-0',
//               'rounded-none sm:rounded-2xl',
//               // full screen mobile
//               'h-[100svh] sm:h-auto sm:max-h-[90svh]',
//             ].join(' ')}
//           >
//             {/* Header */}
//             <div
//               className="shrink-0 p-4 sm:p-6 border-b border-white/10"
//               style={{
//                 background:
//                   'linear-gradient(to right, rgba(99,102,241,0.22), rgba(139,92,246,0.22))',
//               }}
//             >
//               <div className="flex items-start justify-between gap-4">
//                 <div className="flex items-center gap-3 min-w-0">
//                   <div
//                     className="p-2.5 rounded-xl shrink-0"
//                     style={{
//                       background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)',
//                       boxShadow: '0 10px 15px -3px rgba(99,102,241,0.3)',
//                     }}
//                   >
//                     <Scissors className="h-5 w-5 text-white" />
//                   </div>

//                   <div className="min-w-0">
//                     <h2 className="text-lg sm:text-xl font-semibold text-white">
//                       Редактировать услугу
//                     </h2>
//                     <p className="text-xs sm:text-sm mt-1 text-white/60 truncate">
//                       {service.parentName}
//                     </p>
//                     {service.slug && (
//                       <p className="text-xs mt-0.5 font-mono text-white/40 truncate">
//                         {service.slug}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <button
//                   onClick={onClose}
//                   className="p-2 rounded-lg transition-all hover:bg-white/10 shrink-0"
//                   type="button"
//                   aria-label="Закрыть"
//                   title="Закрыть (Esc)"
//                 >
//                   <X className="h-5 w-5 text-white" />
//                 </button>
//               </div>
//             </div>

//             {/* Form: IMPORTANT - flex-col */}
//             <form onSubmit={handleUpdate} className="flex flex-col flex-1 min-h-0">
//               {/* Scrollable content */}
//               <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4">
//                 {/* Name */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2 text-white/90">
//                     Название услуги
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
//                     required
//                     className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
//                     placeholder="Например: Мужская стрижка"
//                   />
//                 </div>

//                 {/* Category */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2 text-white/90">Категория</label>
//                   <select
//                     value={formData.parentId}
//                     onChange={(e) => setFormData((p) => ({ ...p, parentId: e.target.value }))}
//                     className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
//                   >
//                     <option value="">— Без категории —</option>
//                     {parentOptions.map((p) => (
//                       <option key={p.id} value={p.id}>
//                         {p.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Duration + Price */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-2 text-white/90">
//                       Длительность (мин)
//                     </label>
//                     <input
//                       type="number"
//                       min={0}
//                       step={5}
//                       value={formData.durationMin}
//                       onChange={(e) =>
//                         setFormData((p) => ({
//                           ...p,
//                           durationMin: Number(e.target.value),
//                         }))
//                       }
//                       required
//                       className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-2 text-white/90">Цена (€)</label>
//                     <input
//                       type="number"
//                       min={0}
//                       step={0.01}
//                       value={formData.price}
//                       onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
//                       required
//                       className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
//                     />
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <label className="block text-sm font-medium mb-2 text-white/90">Описание</label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
//                     rows={4}
//                     className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none resize-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
//                     placeholder="Краткое описание услуги (опционально)"
//                   />
//                 </div>

//                 {/* Active */}
//                 <div className="p-4 rounded-xl border border-white/10 bg-white/5">
//                   <label className="flex items-center gap-3 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={formData.isActive}
//                       onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
//                       className="admin-switch"
//                     />
//                     <div>
//                       <div className="font-medium text-white">Активна</div>
//                       <div className="text-xs text-white/60 mt-0.5">Отображать услугу на сайте</div>
//                     </div>
//                   </label>
//                 </div>

//                 {/* Delete block (inside scrollable content) */}
//                 <div className="pt-2 border-t border-white/10">
//                   {!showDeleteConfirm ? (
//                     <button
//                       type="button"
//                       onClick={() => setShowDeleteConfirm(true)}
//                       disabled={saving || deleting}
//                       className="w-full px-4 py-3 rounded-xl font-medium transition-all border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15 disabled:opacity-50"
//                     >
//                       <span className="inline-flex items-center justify-center gap-2">
//                         <Trash2 className="h-4 w-4" />
//                         Удалить услугу
//                       </span>
//                     </button>
//                   ) : (
//                     <div className="space-y-2">
//                       <p className="text-sm text-center text-red-300">
//                         Удалить услугу безвозвратно?
//                       </p>
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={() => setShowDeleteConfirm(false)}
//                           disabled={deleting}
//                           className="flex-1 px-4 py-3 rounded-xl font-medium border border-white/10 text-white hover:bg-white/5 disabled:opacity-50"
//                         >
//                           Отмена
//                         </button>
//                         <button
//                           type="button"
//                           onClick={handleDelete}
//                           disabled={deleting}
//                           className="flex-1 px-4 py-3 rounded-xl font-medium bg-red-600 text-white disabled:opacity-50"
//                         >
//                           {deleting ? (
//                             <span className="inline-flex items-center justify-center gap-2">
//                               <Loader2 className="h-4 w-4 animate-spin" />
//                               Удаление...
//                             </span>
//                           ) : (
//                             'Да, удалить'
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Error */}
//                 {error && (
//                   <div className="p-3 rounded-lg border border-red-400/20 bg-red-500/10 text-red-300">
//                     ⚠️ {error}
//                   </div>
//                 )}
//               </div>

//               {/* Footer ALWAYS VISIBLE */}
//               <div className="shrink-0 border-t border-white/10 bg-slate-900/80 backdrop-blur p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+16px)]">
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     type="button"
//                     onClick={onClose}
//                     disabled={saving || deleting}
//                     className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium border border-white/10 text-white hover:bg-white/5 disabled:opacity-50"
//                   >
//                     Отмена
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={!canSave}
//                     className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-white disabled:opacity-50"
//                     style={{
//                       background: canSave
//                         ? 'linear-gradient(to right, #6366f1, #8b5cf6)'
//                         : 'rgba(99,102,241,0.30)',
//                       boxShadow: '0 10px 15px -3px rgba(99,102,241,0.25)',
//                     }}
//                   >
//                     {saving ? (
//                       <span className="inline-flex items-center justify-center gap-2">
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         Сохранение...
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center justify-center gap-2">
//                         <Save className="h-4 w-4" />
//                         Сохранить
//                       </span>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </motion.div>
//         </motion.div>
//       </AnimatePresence>
//     </ClientPortal>
//   );
// }