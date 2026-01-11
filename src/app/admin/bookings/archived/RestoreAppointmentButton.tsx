// src/app/admin/bookings/archived/RestoreAppointmentButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';

type Props = {
  appointmentId: string;
  customerName: string;
};

export default function RestoreAppointmentButton({ appointmentId, customerName }: Props) {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}/restore`, {
        method: 'POST',
      });

      if (res.ok) {
        // Успешное восстановление
        router.refresh();
        setShowConfirm(false);
      } else {
        const error = await res.json();
        console.error('Restore failed:', error);
        alert(`Ошибка при восстановлении: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Ошибка при восстановлении заявки');
    } finally {
      setIsRestoring(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 transition-all inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Восстановить</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-glass card-glass-accent card-glow max-w-md w-full">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Восстановить заявку?
          </h2>

          <p className="text-gray-400 mb-4">
            Заявка для <span className="text-white font-medium">{customerName}</span> будет восстановлена и снова появится в списке активных заявок.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 transition-all inline-flex items-center justify-center gap-2"
            >
              {isRestoring ? 'Восстановление...' : 'Восстановить'}
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              disabled={isRestoring}
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