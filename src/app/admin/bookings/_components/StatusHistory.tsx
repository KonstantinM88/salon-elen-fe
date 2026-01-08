// src/app/admin/bookings/_components/StatusHistory.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { History, Clock, User2, ChevronDown, ChevronUp } from 'lucide-react';
import { AppointmentStatus } from '@prisma/client';
import { getStatusHistory } from '../actions';

interface StatusHistoryProps {
  appointmentId: string;
}

interface StatusLog {
  id: string;
  status: AppointmentStatus;
  previousStatus: AppointmentStatus | null;
  changedAt: Date;
  changedBy: string | null;
  reason: string | null;
}

export function StatusHistory({ appointmentId }: StatusHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await getStatusHistory(appointmentId);
      setLogs(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (isOpen && logs.length === 0) {
      loadHistory();
    }
  }, [isOpen, logs.length, loadHistory]);

  return (
    <div className="border-t border-white/10 mt-3 pt-3">
      {/* Кнопка показать/скрыть */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm text-slate-400 
                 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <History className="h-4 w-4" />
          История изменений
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Контент истории */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[500px] mt-3' : 'max-h-0'
        }`}
      >
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 border-2 border-slate-600 border-t-slate-400 
                          rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && logs.length === 0 && (
          <div className="text-center py-4 text-sm text-slate-500">
            <History className="h-6 w-6 mx-auto mb-2 text-slate-600" />
            <p>История пока пуста</p>
          </div>
        )}

        {!isLoading && logs.length > 0 && (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <StatusLogItem
                key={log.id}
                log={log}
                isFirst={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Встроенная версия истории (для модального окна)
 */
export function StatusHistoryInline({ appointmentId }: StatusHistoryProps) {
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const history = await getStatusHistory(appointmentId);
      setLogs(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block h-6 w-6 border-2 border-slate-600 border-t-slate-400 
                      rounded-full animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-500">
        <History className="h-8 w-8 mx-auto mb-2 text-slate-600" />
        <p>История изменений пуста</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, index) => (
        <StatusLogItem
          key={log.id}
          log={log}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS LOG ITEM COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

function StatusLogItem({ log, isFirst }: { log: StatusLog; isFirst: boolean }) {
  const statusInfo: Record<
    AppointmentStatus,
    { text: string; color: string; bg: string }
  > = {
    PENDING: {
      text: 'Ожидание',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    CONFIRMED: {
      text: 'Подтверждено',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    DONE: {
      text: 'Выполнено',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
    CANCELED: {
      text: 'Отменено',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
  };

  const current = statusInfo[log.status];
  const previous = log.previousStatus ? statusInfo[log.previousStatus] : null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div
      className={`relative pl-6 pb-3 ${
        isFirst
          ? 'border-l-2 border-sky-500/50'
          : 'border-l-2 border-white/10'
      }`}
    >
      {/* Точка timeline */}
      <div
        className={`absolute left-0 top-1 -translate-x-1/2 h-3 w-3 rounded-full ${
          isFirst
            ? 'bg-sky-500 ring-4 ring-sky-500/20'
            : 'bg-slate-600 ring-2 ring-slate-700'
        }`}
      />

      {/* Контент */}
      <div className="space-y-1">
        {/* Статусы */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {previous && (
            <>
              <span className={`${previous.bg} ${previous.color} px-2 py-0.5 rounded-md`}>
                {previous.text}
              </span>
              <span className="text-slate-600">→</span>
            </>
          )}
          <span className={`${current.bg} ${current.color} px-2 py-0.5 rounded-md font-medium`}>
            {current.text}
          </span>
        </div>

        {/* Метаданные */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(log.changedAt)}
          </span>
          <span className="flex items-center gap-1">
            <User2 className="h-3 w-3" />
            {log.changedBy || 'system'}
          </span>
        </div>

        {/* Причина (если есть) */}
        {log.reason && (
          <div className="text-xs text-slate-600 bg-white/5 rounded px-2 py-1 mt-1">
            {log.reason}
          </div>
        )}
      </div>
    </div>
  );
}