// src/app/admin/bookings/_components/DeleteConfirmDialog.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { SeoLocale } from '@/lib/seo-locale';

type Props = {
  appointmentId: string;
  customerName: string;
  locale: SeoLocale;
};

type DeleteDialogCopy = {
  delete: string;
  deleteQuestion: string;
  moveToArchive: string;
  canRestore: string;
  deleting: string;
  cancel: string;
  deleteFailed: string;
  deleteBookingFailed: string;
  unknownError: string;
};

const DELETE_DIALOG_COPY: Record<SeoLocale, DeleteDialogCopy> = {
  de: {
    delete: 'Loeschen',
    deleteQuestion: 'Buchung loeschen?',
    moveToArchive: 'Die Buchung fuer',
    canRestore: 'wird ins Archiv verschoben. Sie koennen sie spaeter wiederherstellen.',
    deleting: 'Loeschen...',
    cancel: 'Abbrechen',
    deleteFailed: 'Fehler beim Loeschen:',
    deleteBookingFailed: 'Fehler beim Loeschen der Buchung',
    unknownError: 'Unknown error',
  },
  ru: {
    delete: 'Удалить',
    deleteQuestion: 'Удалить заявку?',
    moveToArchive: 'Заявка для',
    canRestore: 'будет перемещена в архив. Вы сможете восстановить её позже.',
    deleting: 'Удаление...',
    cancel: 'Отмена',
    deleteFailed: 'Ошибка при удалении:',
    deleteBookingFailed: 'Ошибка при удалении заявки',
    unknownError: 'Unknown error',
  },
  en: {
    delete: 'Delete',
    deleteQuestion: 'Delete booking?',
    moveToArchive: 'Booking for',
    canRestore: 'will be moved to archive. You can restore it later.',
    deleting: 'Deleting...',
    cancel: 'Cancel',
    deleteFailed: 'Delete failed:',
    deleteBookingFailed: 'Failed to delete booking',
    unknownError: 'Unknown error',
  },
};

export function DeleteConfirmDialog({ appointmentId, customerName, locale }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const t = DELETE_DIALOG_COPY[locale];

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
        alert(`${t.deleteFailed} ${error.error || t.unknownError}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert(t.deleteBookingFailed);
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
        <span>{t.delete}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-glass card-glass-accent card-glow max-w-md w-full">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {t.deleteQuestion}
          </h2>

          <p className="text-gray-400">
            {t.moveToArchive}{' '}
            <span className="text-white font-medium">{customerName}</span>{' '}
            {t.canRestore}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-400 hover:to-orange-400 transition-all inline-flex items-center justify-center gap-2"
            >
              {isDeleting ? t.deleting : t.delete}
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-all"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



