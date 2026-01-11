// src/app/admin/bookings/_components/DeleteConfirmDialog.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

type Props = {
  appointmentId: string;
  customerName: string;
};

export function DeleteConfirmDialog({ appointmentId, customerName }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // ✅ ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЙ ENDPOINT для soft delete
      const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Успешное удаление - обновляем страницу
        router.refresh();
        setShowConfirm(false);
      } else {
        const error = await res.json();
        console.error('Delete failed:', error);
        alert(`Ошибка при удалении: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка при удалении заявки');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded-full text-xs px-3 py-1.5 bg-red-600/90 text-white 
                   hover:bg-red-600 transition-all inline-flex items-center gap-1 
                   hover:scale-105 active:scale-95 border border-red-500/50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Удалить</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-glass card-glass-accent card-glow max-w-md w-full">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Удалить заявку?
          </h2>

          <p className="text-gray-400">
            Заявка для <span className="text-white font-medium">{customerName}</span> будет перемещена в архив.
            Вы сможете восстановить её позже.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-400 hover:to-orange-400 transition-all inline-flex items-center justify-center gap-2"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-all"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



//--------работало до 11.01.26 но удаляло без корзины-------
// // src/app/admin/bookings/_components/DeleteConfirmDialog.tsx
// 'use client';

// import { useState, useTransition } from 'react';
// import { Trash2, AlertTriangle, X } from 'lucide-react';
// import { remove } from '../actions';

// interface DeleteConfirmDialogProps {
//   appointmentId: string;
//   customerName: string;
//   onSuccess?: () => void;
// }

// export function DeleteConfirmDialog({
//   appointmentId,
//   customerName,
//   onSuccess,
// }: DeleteConfirmDialogProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isPending, startTransition] = useTransition();

//   const handleDelete = () => {
//     startTransition(async () => {
//       const result = await remove(appointmentId);
      
//       if (result.ok) {
//         setIsOpen(false);
//         onSuccess?.();
//       } else {
//         alert(result.error || 'Произошла ошибка при удалении');
//       }
//     });
//   };

//   return (
//     <>
//       {/* Кнопка удаления */}
//       <button
//         onClick={() => setIsOpen(true)}
//         className="rounded-full text-xs px-2 py-1 bg-rose-600/90 text-white 
//                  hover:bg-rose-600 transition-all inline-flex items-center gap-1 
//                  hover:scale-105 active:scale-95 border border-rose-500/50
//                  disabled:opacity-50 disabled:cursor-not-allowed"
//         disabled={isPending}
//       >
//         <Trash2 className="h-3.5 w-3.5" />
//         <span className="hidden xl:inline">Удалить</span>
//       </button>

//       {/* Модальное окно подтверждения */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 z-50 flex items-center justify-center p-4"
//           onClick={() => !isPending && setIsOpen(false)}
//         >
//           {/* Backdrop */}
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
//           {/* Dialog */}
//           <div 
//             className="relative w-full max-w-md"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="relative overflow-hidden rounded-2xl border border-white/10 
//                           bg-slate-950/95 shadow-2xl backdrop-blur-sm">
//               {/* Градиентная линия сверху */}
//               <div className="pointer-events-none absolute inset-x-0 -top-px h-px 
//                             bg-gradient-to-r from-rose-500/70 via-orange-500/70 to-rose-500/70 
//                             opacity-60" />
              
//               {/* Контент */}
//               <div className="p-6 space-y-4">
//                 {/* Иконка предупреждения */}
//                 <div className="flex justify-center">
//                   <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/30 
//                                 grid place-items-center">
//                     <AlertTriangle className="h-8 w-8 text-rose-400" />
//                   </div>
//                 </div>

//                 {/* Заголовок */}
//                 <div className="text-center">
//                   <h3 className="text-xl font-semibold text-white mb-2">
//                     Удалить запись?
//                   </h3>
//                   <p className="text-sm text-slate-400">
//                     Вы уверены, что хотите удалить запись для клиента{' '}
//                     <span className="font-medium text-white">{customerName}</span>?
//                   </p>
//                   <p className="text-xs text-rose-400 mt-2">
//                     ⚠️ Это действие нельзя отменить!
//                   </p>
//                 </div>

//                 {/* Кнопки */}
//                 <div className="flex gap-3 pt-2">
//                   <button
//                     onClick={() => setIsOpen(false)}
//                     disabled={isPending}
//                     className="flex-1 px-4 py-2.5 rounded-xl font-medium
//                              bg-white/5 border border-white/10
//                              hover:bg-white/10 hover:border-white/20
//                              transition-all text-white
//                              disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Отмена
//                   </button>
                  
//                   <button
//                     onClick={handleDelete}
//                     disabled={isPending}
//                     className="flex-1 px-4 py-2.5 rounded-xl font-medium
//                              bg-gradient-to-r from-rose-600 to-orange-600
//                              hover:from-rose-500 hover:to-orange-500
//                              text-white transition-all
//                              shadow-[0_0_20px_rgba(244,63,94,0.3)]
//                              disabled:opacity-50 disabled:cursor-not-allowed
//                              inline-flex items-center justify-center gap-2"
//                   >
//                     {isPending ? (
//                       <>
//                         <div className="h-4 w-4 border-2 border-white/30 border-t-white 
//                                       rounded-full animate-spin" />
//                         Удаление...
//                       </>
//                     ) : (
//                       <>
//                         <Trash2 className="h-4 w-4" />
//                         Удалить
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Кнопка закрытия (X) */}
//               <button
//                 onClick={() => !isPending && setIsOpen(false)}
//                 disabled={isPending}
//                 className="absolute top-3 right-3 h-8 w-8 rounded-lg
//                          bg-white/5 hover:bg-white/10 border border-white/10
//                          transition-all grid place-items-center
//                          disabled:opacity-50 disabled:cursor-not-allowed"
//                 aria-label="Закрыть"
//               >
//                 <X className="h-4 w-4 text-slate-400" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// /**
//  * Компактная версия для таблицы
//  */
// export function DeleteConfirmDialogCompact({
//   appointmentId,
//   customerName,
// }: DeleteConfirmDialogProps) {
//   return (
//     <DeleteConfirmDialog
//       appointmentId={appointmentId}
//       customerName={customerName}
//     />
//   );
// }