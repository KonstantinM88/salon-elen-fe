// src/app/admin/bookings/archived/PermanentDeleteButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Shield, Clock } from 'lucide-react';

type Props = {
  appointmentId: string;
  customerName: string;
};

export default function PermanentDeleteButton({ appointmentId, customerName }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Таймер обратного отсчёта
  const startTimer = (expiryDate: Date) => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) {
        setError('Код истёк. Запросите новый код.');
        setShowOTP(false);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  };

  const handleRequestOTP = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'permanent_delete',
          resourceId: appointmentId,
          resourceType: 'appointment',
          resourceName: customerName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpId(data.otpId);
        setExpiresAt(data.expiresAt);
        setShowConfirm(false);
        setShowOTP(true);
        
        // Запустить таймер
        startTimer(data.expiresAt);
      } else {
        setError(data.error || 'Ошибка при генерации кода');
      }
    } catch (error) {
      console.error('Request OTP failed:', error);
      setError('Ошибка при запросе кода');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyAndDelete = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // 1. Проверить OTP
      const verifyRes = await fetch('/api/admin/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: otpCode,
          action: 'permanent_delete',
          resourceId: appointmentId,
          resourceType: 'appointment',
        }),
      });

      if (!verifyRes.ok) {
        const verifyData = await verifyRes.json();
        setError(verifyData.error || 'Неверный код');
        setIsDeleting(false);
        return;
      }

      // 2. Удалить заявку
      const deleteRes = await fetch(`/api/admin/appointments/${appointmentId}/permanent`, {
        method: 'DELETE',
      });

      if (deleteRes.ok) {
        // Успешное удаление
        router.refresh();
        setShowOTP(false);
      } else {
        const deleteData = await deleteRes.json();
        setError(deleteData.error || 'Ошибка при удалении');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Ошибка при удалении заявки');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setShowOTP(false);
    setOtpCode('');
    setError(null);
    setOtpId(null);
    setExpiresAt(null);
    setTimeLeft(0);
  };

  // Форматирование времени mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Начальное подтверждение
  if (!showConfirm && !showOTP) {
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

  // Диалог подтверждения
  if (showConfirm && !showOTP) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="card-glass card-glass-accent card-glow max-w-md w-full">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/20">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                ⚠ Защита от удаления
              </h2>
            </div>

            <div className="text-gray-300 space-y-3">
              <p>
                Заявка для <span className="text-white font-medium">{customerName}</span> будет удалена навсегда.
              </p>
              <p className="text-red-400 font-medium">
                Это действие необратимо! Все данные будут потеряны.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
                <p className="text-amber-300">
                  🔐 Для подтверждения удаления будет отправлен одноразовый код в Telegram.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRequestOTP}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 transition-all inline-flex items-center justify-center gap-2"
              >
                <Shield className="h-4 w-4" />
                <span>{isGenerating ? 'Отправка...' : 'Отправить код'}</span>
              </button>

              <button
                onClick={handleCancel}
                disabled={isGenerating}
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

  // Диалог ввода OTP
  if (showOTP) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="card-glass card-glass-accent card-glow max-w-md w-full">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/20">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Введите код из Telegram
              </h2>
            </div>

            <div className="text-gray-300 space-y-3">
              <p>
                Код подтверждения отправлен в Telegram.
              </p>
              
              {/* Таймер */}
              {timeLeft > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-300">
                    Код действителен: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                  </span>
                </div>
              )}

              {/* Поле ввода кода */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Код из Telegram (6 цифр)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setOtpCode(value);
                    setError(null);
                  }}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-600 text-white text-center text-2xl font-mono tracking-wider focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleVerifyAndDelete}
                disabled={isDeleting || otpCode.length !== 6}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-400 hover:to-orange-400 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Удаление...' : 'Подтвердить удаление'}
              </button>

              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-all"
              >
                Отмена
              </button>
            </div>

            {/* Можно запросить новый код только если осталось < 4 минут */}
            <button
              onClick={handleRequestOTP}
              disabled={isGenerating || timeLeft > 240}
              className="w-full text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Отправка...' : 'Отправить код повторно'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}






// // src/app/admin/bookings/archived/PermanentDeleteButton.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Trash2 } from 'lucide-react';

// type Props = {
//   appointmentId: string;
//   customerName: string;
// };

// export default function PermanentDeleteButton({ appointmentId, customerName }: Props) {
//   const router = useRouter();
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const handleDelete = async () => {
//     setIsDeleting(true);
//     try {
//       const res = await fetch(`/api/admin/appointments/${appointmentId}/permanent`, {
//         method: 'DELETE',
//       });

//       if (res.ok) {
//         // Успешное удаление
//         router.refresh();
//         setShowConfirm(false);
//       } else {
//         const error = await res.json();
//         console.error('Delete failed:', error);
//         alert(`Ошибка при удалении: ${error.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Delete failed:', error);
//       alert('Ошибка при удалении заявки');
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   if (!showConfirm) {
//     return (
//       <button
//         onClick={() => setShowConfirm(true)}
//         className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-400 hover:to-orange-400 transition-all inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
//       >
//         <Trash2 className="h-4 w-4" />
//         <span>Удалить навсегда</span>
//       </button>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="card-glass card-glass-accent card-glow max-w-md w-full">
//         <div className="p-6 space-y-4">
//           <h2 className="text-xl font-semibold text-white">
//             ⚠ Удалить навсегда?
//           </h2>

//           <div className="text-gray-400 space-y-2">
//             <p>
//               Заявка для <span className="text-white font-medium">{customerName}</span> будет удалена навсегда.
//             </p>
//             <p className="text-red-400 font-medium">
//               Это действие необратимо! Все данные будут потеряны.
//             </p>
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={handleDelete}
//               disabled={isDeleting}
//               className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-400 hover:to-orange-400 transition-all inline-flex items-center justify-center gap-2"
//             >
//               {isDeleting ? 'Удаление...' : 'Удалить'}
//             </button>

//             <button
//               onClick={() => setShowConfirm(false)}
//               disabled={isDeleting}
//               className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-all"
//             >
//               Отмена
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
