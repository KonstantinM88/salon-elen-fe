//src/app/admin/clients/archived/RestoreClientButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, AlertTriangle } from 'lucide-react';

type Props = {
  clientId: string;
  clientName: string;
};

type ConflictError = {
  error: 'conflict';
  message: string;
  conflictType: 'phone' | 'email';
  existingClient: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
};

export default function RestoreClientButton({ clientId, clientName }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [conflict, setConflict] = useState<ConflictError | null>(null);

  const handleRestore = async () => {
    setIsLoading(true);
    setConflict(null);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/restore`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.status === 409) {
        // ⚠️ Конфликт - уже есть активный клиент
        setConflict(data as ConflictError);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to restore');
      }

      // ✅ Успешно восстановлено
      router.push('/admin/clients');
      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Ошибка при восстановлении клиента');
      setIsLoading(false);
    }
  };

  // ⚠️ Показываем диалог конфликта
  if (conflict) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-400" size={32} />
            <h2 className="text-xl font-bold text-white">
              Конфликт при восстановлении
            </h2>
          </div>
          
          <p className="text-gray-300 mb-4">
            {conflict.message}
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
            <div className="text-sm text-amber-300 font-medium mb-2">
              Существующий активный клиент:
            </div>
            <div className="text-white">
              {conflict.existingClient.name}
            </div>
            {conflict.conflictType === 'phone' && conflict.existingClient.phone && (
              <div className="text-gray-400 text-sm">
                📱 {conflict.existingClient.phone}
              </div>
            )}
            {conflict.conflictType === 'email' && conflict.existingClient.email && (
              <div className="text-gray-400 text-sm">
                ✉️ {conflict.existingClient.email}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-400 mb-2">
              Возможные решения:
            </div>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Удалите существующего клиента</li>
              <li>Измените {conflict.conflictType === 'phone' ? 'телефон' : 'email'} существующего клиента</li>
              <li>Не восстанавливайте этого клиента</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setConflict(null);
                setShowConfirm(false);
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
            >
              Закрыть
            </button>
            <button
              onClick={() => {
                router.push(`/admin/clients/${conflict.existingClient.id}`);
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              Открыть клиента
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Диалог подтверждения
  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleRestore}
          disabled={isLoading}
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm hover:from-emerald-400 hover:to-green-400 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Восстановление...' : 'Подтвердить'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isLoading}
          className="px-3 py-1 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          Отмена
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-sm hover:border-cyan-400/50 transition-all"
    >
      <RotateCcw size={14} />
      Восстановить
    </button>
  );
}