// src/app/admin/services/CategoryEditModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Save, Tag, Trash2, X } from 'lucide-react';
import ClientPortal from '@/components/ui/ClientPortal';
import type { ActionResult } from './actions';

type Category = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  isActive: boolean;
};

type Props = {
  category: Category;
  onClose: () => void;
  onUpdate: (formData: FormData) => Promise<ActionResult>;
  onDelete: (formData: FormData) => Promise<ActionResult>;
};

type FormState = {
  name: string;
  description: string;
  isActive: boolean;
};

export default function CategoryEditModal({ category, onClose, onUpdate, onDelete }: Props) {
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
    name: category.name,
    description: category.description ?? '',
    isActive: category.isActive,
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
      fd.set('id', category.id);
      fd.set('kind', 'category');
      fd.set('name', formData.name);
      fd.set('description', formData.description);
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
      fd.set('id', category.id);

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
              'relative w-full max-w-xl',
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
                  'linear-gradient(to right, rgba(251,191,36,0.22), rgba(245,158,11,0.22))',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{
                      background: 'linear-gradient(to bottom right, #fbbf24, #f59e0b)',
                      boxShadow: '0 10px 15px -3px rgba(251,191,36,0.3)',
                    }}
                  >
                    <Tag className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      Редактировать категорию
                    </h2>
                    {category.slug && (
                      <p className="text-xs sm:text-sm mt-1 font-mono text-white/60 truncate">
                        {category.slug}
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
                    Название категории
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10"
                    placeholder="Например: Стрижка"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-white bg-slate-950/40 border border-white/10 outline-none resize-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10"
                    placeholder="Краткое описание категории (опционально)"
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
                      <div className="text-xs text-white/60 mt-0.5">
                        Отображать категорию на сайте
                      </div>
                    </div>
                  </label>
                </div>

                {/* Info */}
                <div className="p-3 rounded-lg border border-blue-400/20 bg-blue-500/10">
                  <p className="text-xs text-blue-200/90">
                    💡 Slug категории генерируется автоматически и не может быть изменен
                  </p>
                </div>

                {/* Delete block */}
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
                        Удалить категорию
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-center text-red-300">
                        Удалить категорию и все её услуги?
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
                        ? 'linear-gradient(to right, #fbbf24, #f59e0b)'
                        : 'rgba(251,191,36,0.30)',
                      boxShadow: '0 10px 15px -3px rgba(251,191,36,0.25)',
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







//--------редактируем отображение кнопки сохранить
// 'use client';

// import { useEffect, useState } from 'react';
// import { Save, X, Loader2, Trash2, Tag } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import type { ActionResult } from './actions';
// import ClientPortal from '@/components/ui/ClientPortal';

// type Category = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   isActive: boolean;
// };

// type Props = {
//   category: Category;
//   onClose: () => void;
//   onUpdate: (formData: FormData) => Promise<ActionResult>;
//   onDelete: (formData: FormData) => Promise<ActionResult>;
// };

// export default function CategoryEditModal({ 
//   category, 
//   onClose,
//   onUpdate,
//   onDelete 
// }: Props) {
//   // Render in a portal to escape glass containers (backdrop-filter)
//   // which otherwise break `position: fixed` overlays.
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
//   const [formData, setFormData] = useState({
//     name: category.name,
//     description: category.description || '',
//     isActive: category.isActive,
//   });

//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   const handleUpdate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const fd = new FormData();
//       fd.set('id', category.id);
//       fd.set('kind', 'category');
//       fd.set('name', formData.name);
//       fd.set('description', formData.description);
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
//     setDeleting(true);
//     setError(null);

//     try {
//       const fd = new FormData();
//       fd.set('id', category.id);

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

//   return (
//     <ClientPortal>
//       <AnimatePresence>
//         <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
//         style={{
//           backgroundColor: 'rgba(0, 0, 0, 0.75)',
//           backdropFilter: 'blur(8px)',
//         }}
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="relative w-full overflow-hidden"
//           style={{
//             maxWidth: '600px',
//             maxHeight: '90vh',
//             display: 'flex',
//             flexDirection: 'column',
//             backgroundColor: '#0f172a',
//             borderRadius: '16px',
//             border: '1px solid rgba(255, 255, 255, 0.1)',
//             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div 
//             className="relative p-4 sm:p-6"
//             style={{
//               borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
//               background: 'linear-gradient(to right, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
//             }}
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div 
//                   className="p-2.5 rounded-xl"
//                   style={{
//                     background: 'linear-gradient(to bottom right, #fbbf24, #f59e0b)',
//                     boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
//                   }}
//                 >
//                   <Tag className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg sm:text-xl font-semibold text-white">
//                     Редактировать категорию
//                   </h2>
//                   <p className="text-xs sm:text-sm mt-1 font-mono" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
//                     {category.slug}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 rounded-lg transition-all hover:bg-white/10"
//                 type="button"
//               >
//                 <X className="h-5 w-5 text-white" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <form onSubmit={handleUpdate}>
//             <div 
//               className="p-4 sm:p-6 space-y-4"
//               style={{
//                 overflowY: 'auto',
//                 overflowX: 'hidden',
//                 flex: '1 1 auto',
//                 minHeight: 0,
//               }}
//             >
//               {/* Name */}
//               <div>
//                 <label 
//                   className="block text-sm font-medium mb-2"
//                   style={{ color: 'rgba(255, 255, 255, 0.9)' }}
//                 >
//                   Название категории
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                   required
//                   placeholder="Например: Стрижка"
//                   style={{
//                     width: '100%',
//                     padding: '12px 16px',
//                     backgroundColor: 'rgba(15, 23, 42, 0.5)',
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     borderRadius: '12px',
//                     color: '#ffffff',
//                     fontSize: '15px',
//                     outline: 'none',
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)';
//                     e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
//                     e.target.style.boxShadow = 'none';
//                   }}
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label 
//                   className="block text-sm font-medium mb-2"
//                   style={{ color: 'rgba(255, 255, 255, 0.9)' }}
//                 >
//                   Описание
//                 </label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//                   placeholder="Краткое описание категории (опционально)"
//                   rows={4}
//                   style={{
//                     width: '100%',
//                     padding: '12px 16px',
//                     backgroundColor: 'rgba(15, 23, 42, 0.5)',
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     borderRadius: '12px',
//                     color: '#ffffff',
//                     fontSize: '15px',
//                     outline: 'none',
//                     resize: 'vertical',
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)';
//                     e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
//                     e.target.style.boxShadow = 'none';
//                   }}
//                 />
//               </div>

//               {/* Active toggle */}
//               <div 
//                 className="p-4 rounded-xl"
//                 style={{
//                   border: '1px solid rgba(255, 255, 255, 0.1)',
//                   backgroundColor: 'rgba(255, 255, 255, 0.02)',
//                 }}
//               >
//                 <label className="flex items-center gap-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={formData.isActive}
//                     onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
//                     className="admin-switch"
//                   />
//                   <div>
//                     <div className="font-medium text-white">Активна</div>
//                     <div className="text-xs text-white/60 mt-0.5">
//                       Отображать категорию на сайте
//                     </div>
//                   </div>
//                 </label>
//               </div>

//               {/* Info */}
//               <div 
//                 className="p-3 rounded-lg"
//                 style={{
//                   backgroundColor: 'rgba(59, 130, 246, 0.1)',
//                   border: '1px solid rgba(59, 130, 246, 0.2)',
//                 }}
//               >
//                 <p className="text-xs" style={{ color: 'rgba(147, 197, 253, 0.9)' }}>
//                   💡 Slug категории генерируется автоматически и не может быть изменен
//                 </p>
//               </div>

//               {/* Error */}
//               {error && (
//                 <div 
//                   className="p-3 rounded-lg"
//                   style={{
//                     backgroundColor: 'rgba(239, 68, 68, 0.1)',
//                     border: '1px solid rgba(239, 68, 68, 0.2)',
//                     color: '#f87171',
//                   }}
//                 >
//                   ⚠️ {error}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div 
//               className="p-4 sm:p-6 space-y-3"
//               style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
//             >
//               {/* Action buttons */}
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   disabled={saving || deleting}
//                   className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
//                   style={{
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     backgroundColor: 'transparent',
//                     color: '#ffffff',
//                   }}
//                 >
//                   Отмена
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving || deleting || !formData.name.trim()}
//                   className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
//                   style={{
//                     background: saving || !formData.name.trim()
//                       ? 'rgba(251, 191, 36, 0.3)' 
//                       : 'linear-gradient(to right, #fbbf24, #f59e0b)',
//                     color: '#ffffff',
//                     boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
//                     cursor: saving || !formData.name.trim() ? 'not-allowed' : 'pointer',
//                     opacity: saving || !formData.name.trim() ? 0.5 : 1,
//                   }}
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     {saving ? (
//                       <>
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         <span>Сохранение...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Save className="h-4 w-4" />
//                         <span>Сохранить</span>
//                       </>
//                     )}
//                   </div>
//                 </button>
//               </div>

//               {/* Delete button */}
//               <div 
//                 className="pt-3"
//                 style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
//               >
//                 {!showDeleteConfirm ? (
//                   <button
//                     type="button"
//                     onClick={() => setShowDeleteConfirm(true)}
//                     disabled={saving || deleting}
//                     className="w-full px-4 py-2.5 rounded-xl font-medium transition-all"
//                     style={{
//                       border: '1px solid rgba(239, 68, 68, 0.3)',
//                       backgroundColor: 'rgba(239, 68, 68, 0.1)',
//                       color: '#f87171',
//                     }}
//                   >
//                     <div className="flex items-center justify-center gap-2">
//                       <Trash2 className="h-4 w-4" />
//                       <span>Удалить категорию</span>
//                     </div>
//                   </button>
//                 ) : (
//                   <div className="space-y-2">
//                     <p className="text-sm text-center text-red-400">
//                       Удалить категорию и все её услуги?
//                     </p>
//                     <div className="flex gap-2">
//                       <button
//                         type="button"
//                         onClick={() => setShowDeleteConfirm(false)}
//                         disabled={deleting}
//                         className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
//                         style={{
//                           border: '1px solid rgba(255, 255, 255, 0.1)',
//                           backgroundColor: 'transparent',
//                           color: '#ffffff',
//                         }}
//                       >
//                         Отмена
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleDelete}
//                         disabled={deleting}
//                         className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
//                         style={{
//                           backgroundColor: '#dc2626',
//                           color: '#ffffff',
//                         }}
//                       >
//                         {deleting ? (
//                           <div className="flex items-center justify-center gap-2">
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                             <span>Удаление...</span>
//                           </div>
//                         ) : (
//                           'Да, удалить'
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </form>
//         </motion.div>
//         </motion.div>
//       </AnimatePresence>
//     </ClientPortal>
//   );
// }





//---------фиксим с гпт--------------
// // src/app/admin/services/CategoryEditModal.tsx
// 'use client';

// import { useState } from 'react';
// import { Save, X, Loader2, Trash2, Tag } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import type { ActionResult } from './actions';

// type Category = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   isActive: boolean;
// };

// type Props = {
//   category: Category;
//   onClose: () => void;
//   onUpdate: (formData: FormData) => Promise<ActionResult>;
//   onDelete: (formData: FormData) => Promise<ActionResult>;
// };

// export default function CategoryEditModal({ 
//   category, 
//   onClose,
//   onUpdate,
//   onDelete 
// }: Props) {
//   const [formData, setFormData] = useState({
//     name: category.name,
//     description: category.description || '',
//     isActive: category.isActive,
//   });

//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   const handleUpdate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const fd = new FormData();
//       fd.set('id', category.id);
//       fd.set('kind', 'category');
//       fd.set('name', formData.name);
//       fd.set('description', formData.description);
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
//     setDeleting(true);
//     setError(null);

//     try {
//       const fd = new FormData();
//       fd.set('id', category.id);

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

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
//         style={{
//           backgroundColor: 'rgba(0, 0, 0, 0.75)',
//           backdropFilter: 'blur(8px)',
//         }}
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="relative w-full overflow-hidden"
//           style={{
//             maxWidth: '600px',
//             maxHeight: '90vh',
//             display: 'flex',
//             flexDirection: 'column',
//             backgroundColor: '#0f172a',
//             borderRadius: '16px',
//             border: '1px solid rgba(255, 255, 255, 0.1)',
//             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div 
//             className="relative p-4 sm:p-6"
//             style={{
//               borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
//               background: 'linear-gradient(to right, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
//             }}
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div 
//                   className="p-2.5 rounded-xl"
//                   style={{
//                     background: 'linear-gradient(to bottom right, #fbbf24, #f59e0b)',
//                     boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
//                   }}
//                 >
//                   <Tag className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg sm:text-xl font-semibold text-white">
//                     Редактировать категорию
//                   </h2>
//                   <p className="text-xs sm:text-sm mt-1 font-mono" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
//                     {category.slug}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 rounded-lg transition-all hover:bg-white/10"
//                 type="button"
//               >
//                 <X className="h-5 w-5 text-white" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <form onSubmit={handleUpdate}>
//             <div 
//               className="p-4 sm:p-6 space-y-4"
//               style={{
//                 overflowY: 'auto',
//                 overflowX: 'hidden',
//                 flex: '1 1 auto',
//                 minHeight: 0,
//               }}
//             >
//               {/* Name */}
//               <div>
//                 <label 
//                   className="block text-sm font-medium mb-2"
//                   style={{ color: 'rgba(255, 255, 255, 0.9)' }}
//                 >
//                   Название категории
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                   required
//                   placeholder="Например: Стрижка"
//                   style={{
//                     width: '100%',
//                     padding: '12px 16px',
//                     backgroundColor: 'rgba(15, 23, 42, 0.5)',
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     borderRadius: '12px',
//                     color: '#ffffff',
//                     fontSize: '15px',
//                     outline: 'none',
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)';
//                     e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
//                     e.target.style.boxShadow = 'none';
//                   }}
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label 
//                   className="block text-sm font-medium mb-2"
//                   style={{ color: 'rgba(255, 255, 255, 0.9)' }}
//                 >
//                   Описание
//                 </label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//                   placeholder="Краткое описание категории (опционально)"
//                   rows={4}
//                   style={{
//                     width: '100%',
//                     padding: '12px 16px',
//                     backgroundColor: 'rgba(15, 23, 42, 0.5)',
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     borderRadius: '12px',
//                     color: '#ffffff',
//                     fontSize: '15px',
//                     outline: 'none',
//                     resize: 'vertical',
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)';
//                     e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
//                     e.target.style.boxShadow = 'none';
//                   }}
//                 />
//               </div>

//               {/* Active toggle */}
//               <div 
//                 className="p-4 rounded-xl"
//                 style={{
//                   border: '1px solid rgba(255, 255, 255, 0.1)',
//                   backgroundColor: 'rgba(255, 255, 255, 0.02)',
//                 }}
//               >
//                 <label className="flex items-center gap-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={formData.isActive}
//                     onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
//                     className="admin-switch"
//                   />
//                   <div>
//                     <div className="font-medium text-white">Активна</div>
//                     <div className="text-xs text-white/60 mt-0.5">
//                       Отображать категорию на сайте
//                     </div>
//                   </div>
//                 </label>
//               </div>

//               {/* Info */}
//               <div 
//                 className="p-3 rounded-lg"
//                 style={{
//                   backgroundColor: 'rgba(59, 130, 246, 0.1)',
//                   border: '1px solid rgba(59, 130, 246, 0.2)',
//                 }}
//               >
//                 <p className="text-xs" style={{ color: 'rgba(147, 197, 253, 0.9)' }}>
//                   💡 Slug категории генерируется автоматически и не может быть изменен
//                 </p>
//               </div>

//               {/* Error */}
//               {error && (
//                 <div 
//                   className="p-3 rounded-lg"
//                   style={{
//                     backgroundColor: 'rgba(239, 68, 68, 0.1)',
//                     border: '1px solid rgba(239, 68, 68, 0.2)',
//                     color: '#f87171',
//                   }}
//                 >
//                   ⚠️ {error}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div 
//               className="p-4 sm:p-6 space-y-3"
//               style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
//             >
//               {/* Action buttons */}
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   disabled={saving || deleting}
//                   className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
//                   style={{
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     backgroundColor: 'transparent',
//                     color: '#ffffff',
//                   }}
//                 >
//                   Отмена
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving || deleting || !formData.name.trim()}
//                   className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
//                   style={{
//                     background: saving || !formData.name.trim()
//                       ? 'rgba(251, 191, 36, 0.3)' 
//                       : 'linear-gradient(to right, #fbbf24, #f59e0b)',
//                     color: '#ffffff',
//                     boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
//                     cursor: saving || !formData.name.trim() ? 'not-allowed' : 'pointer',
//                     opacity: saving || !formData.name.trim() ? 0.5 : 1,
//                   }}
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     {saving ? (
//                       <>
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         <span>Сохранение...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Save className="h-4 w-4" />
//                         <span>Сохранить</span>
//                       </>
//                     )}
//                   </div>
//                 </button>
//               </div>

//               {/* Delete button */}
//               <div 
//                 className="pt-3"
//                 style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
//               >
//                 {!showDeleteConfirm ? (
//                   <button
//                     type="button"
//                     onClick={() => setShowDeleteConfirm(true)}
//                     disabled={saving || deleting}
//                     className="w-full px-4 py-2.5 rounded-xl font-medium transition-all"
//                     style={{
//                       border: '1px solid rgba(239, 68, 68, 0.3)',
//                       backgroundColor: 'rgba(239, 68, 68, 0.1)',
//                       color: '#f87171',
//                     }}
//                   >
//                     <div className="flex items-center justify-center gap-2">
//                       <Trash2 className="h-4 w-4" />
//                       <span>Удалить категорию</span>
//                     </div>
//                   </button>
//                 ) : (
//                   <div className="space-y-2">
//                     <p className="text-sm text-center text-red-400">
//                       Удалить категорию и все её услуги?
//                     </p>
//                     <div className="flex gap-2">
//                       <button
//                         type="button"
//                         onClick={() => setShowDeleteConfirm(false)}
//                         disabled={deleting}
//                         className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
//                         style={{
//                           border: '1px solid rgba(255, 255, 255, 0.1)',
//                           backgroundColor: 'transparent',
//                           color: '#ffffff',
//                         }}
//                       >
//                         Отмена
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleDelete}
//                         disabled={deleting}
//                         className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
//                         style={{
//                           backgroundColor: '#dc2626',
//                           color: '#ffffff',
//                         }}
//                       >
//                         {deleting ? (
//                           <div className="flex items-center justify-center gap-2">
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                             <span>Удаление...</span>
//                           </div>
//                         ) : (
//                           'Да, удалить'
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </form>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
