// src/app/admin/bookings/archived/PermanentDeleteButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

type Props = {
  appointmentId: string;
  customerName: string;
};

export default function PermanentDeleteButton({ appointmentId, customerName }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}/permanent`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Успешное удаление
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
        className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-400 hover:to-orange-400 transition-all inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
      >
        <Trash2 className="h-4 w-4" />
        <span>Удалить навсегда</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-glass card-glass-accent card-glow max-w-md w-full">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            ⚠ Удалить навсегда?
          </h2>

          <div className="text-gray-400 space-y-2">
            <p>
              Заявка для <span className="text-white font-medium">{customerName}</span> будет удалена навсегда.
            </p>
            <p className="text-red-400 font-medium">
              Это действие необратимо! Все данные будут потеряны.
            </p>
          </div>

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