//src/app/admin/clients/archived/PermanentDeleteButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

type Props = {
  clientId: string;
  clientName: string;
};

export default function PermanentDeleteButton({ clientId, clientName }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/permanent`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка при удалении клиента');
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <div className="text-sm text-red-300">
          ⚠️ Удалить навсегда «{clientName}»?
        </div>
        <div className="text-xs text-gray-400">
          Это действие необратимо! Все данные будут потеряны.
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm hover:from-red-400 hover:to-red-500 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Удаление...' : 'Удалить навсегда'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 text-sm hover:border-red-400/50 transition-all"
    >
      <Trash2 size={14} />
      Удалить навсегда
    </button>
  );
}
