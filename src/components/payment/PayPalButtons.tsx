// src/components/payment/PayPalButtons.tsx
// ✅ ФИНАЛЬНАЯ ВЕРСИЯ - комбинация работающего старого и нового
'use client';

import React from 'react';
import { 
  PayPalScriptProvider, 
  PayPalButtons as PayPalButtonsSDK,
} from '@paypal/react-paypal-js';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/i18n/useTranslations';

interface PayPalButtonsProps {
  amount: number; // В центах!
  appointmentId: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export default function PayPalButtons({
  amount,
  appointmentId,
  onSuccess,
  onError,
}: PayPalButtonsProps) {
  const t = useTranslations();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center">
        <p className="text-sm text-red-200">
          PayPal configuration error. Please contact support.
        </p>
      </div>
    );
  }

  const initialOptions = {
    clientId: clientId,
    currency: 'EUR',
    intent: 'capture' as const,
  };

  return (
    <div className="space-y-6">
      {/* Сумма к оплате */}
      <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">
            {t("booking_payment_paypal_amount")}
          </span>
          <span className="text-2xl font-bold text-white">
            €{(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 backdrop-blur-xl"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5" />
          <span className="text-sm text-red-200">{error}</span>
        </motion.div>
      )}

      {/* PayPal Buttons */}
      <div className="relative rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
              <p className="mt-2 text-sm text-white">Processing payment...</p>
            </div>
          </div>
        )}

        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtonsSDK
            createOrder={async () => {
              console.log('🟡 [PayPal] Creating order...', { appointmentId, amount });
              setIsProcessing(true);
              setError(null);

              try {
                const response = await fetch('/api/payment/create-paypal-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    appointmentId,
                    amount, // ✅ ВАЖНО: отправляем в центах!
                  }),
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Failed to create PayPal order');
                }

                console.log('✅ [PayPal] Order created:', data.orderId);
                
                // ✅ ВАЖНО: используем orderId (маленькие буквы)
                return data.orderId;
              } catch (error) {
                console.error('❌ [PayPal] Create order error:', error);
                const message = error instanceof Error ? error.message : 'Failed to create order';
                setError(message);
                onError(message);
                throw error;
              } finally {
                setIsProcessing(false);
              }
            }}
            onApprove={async (data) => {
              console.log('🟡 [PayPal] Payment approved, capturing...', data.orderID);
              setIsProcessing(true);
              setError(null);

              try {
                const response = await fetch('/api/payment/capture-paypal-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: data.orderID, // ✅ PayPal SDK возвращает orderID (большие)
                    appointmentId,
                  }),
                });

                const result = await response.json();

                if (!response.ok) {
                  throw new Error(result.error || 'Failed to capture payment');
                }

                console.log('✅ [PayPal] Payment captured:', result.captureId);

                // ✅ Вызываем callback успеха
                onSuccess(data.orderID);
              } catch (error) {
                console.error('❌ [PayPal] Capture error:', error);
                const message = error instanceof Error ? error.message : 'Payment capture failed';
                setError(message);
                onError(message);
              } finally {
                setIsProcessing(false);
              }
            }}
            onError={(err) => {
              console.error('❌ [PayPal] Error:', err);
              const message = 'PayPal payment failed. Please try again.';
              setError(message);
              onError(message);
              setIsProcessing(false);
            }}
            onCancel={() => {
              console.log('🟡 [PayPal] Payment cancelled by user');
              setError('Payment was cancelled');
              setIsProcessing(false);
            }}
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
            }}
          />
        </PayPalScriptProvider>
      </div>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          <span>{t("booking_payment_paypal_secure")}</span>
        </div>
        <div className="h-1 w-1 rounded-full bg-slate-500" />
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          <span>PayPal Protected</span>
        </div>
      </div>

      {/* Info note */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-xl">
        <p className="text-xs text-slate-300 leading-relaxed text-center">
          {t("booking_payment_paypal_note")}
        </p>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-400 leading-relaxed">
        {t("booking_payment_paypal_footer")}
      </p>
    </div>
  );
}




//--------исправляем отклик на оплату--------
// // src/components/payment/PayPalButtons.tsx
// 'use client';

// import React from 'react';
// import { 
//   PayPalScriptProvider, 
//   PayPalButtons as PayPalButtonsSDK,
// } from '@paypal/react-paypal-js';
// import { motion } from 'framer-motion';
// import { ShieldCheck, Lock } from 'lucide-react';
// import { useTranslations } from '@/i18n/useTranslations';

// interface PayPalButtonsProps {
//   amount: number;
//   appointmentId: string;
//   onSuccess: (orderId: string) => void;
//   onError: (error: string) => void;
// }

// export default function PayPalButtons({
//   amount,
//   appointmentId,
//   onSuccess,
//   onError,
// }: PayPalButtonsProps) {
//   const t = useTranslations();

//   const initialOptions = {
//     clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
//     currency: 'EUR',
//     intent: 'capture' as const,
//   };

//   return (
//     <div className="space-y-6">
//       {/* Сумма к оплате */}
//       <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4 backdrop-blur-xl">
//         <div className="flex items-center justify-between">
//           <span className="text-sm font-medium text-slate-300">
//             {t("booking_payment_paypal_amount")}
//           </span>
//           <span className="text-2xl font-bold text-white">
//             €{(amount / 100).toFixed(2)}
//           </span>
//         </div>
//       </div>

//       {/* PayPal Buttons */}
//       <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//         <PayPalScriptProvider options={initialOptions}>
//           <PayPalButtonsSDK
//             createOrder={async () => {
//               try {
//                 const response = await fetch('/api/payment/create-paypal-order', {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify({
//                     appointmentId,
//                     amount,
//                   }),
//                 });

//                 const data = await response.json();

//                 if (!response.ok) {
//                   throw new Error(data.error || 'Failed to create PayPal order');
//                 }

//                 return data.orderId;
//               } catch (error) {
//                 console.error('Error creating PayPal order:', error);
//                 onError(error instanceof Error ? error.message : 'Failed to create order');
//                 throw error;
//               }
//             }}
//             onApprove={async (data) => {
//               try {
//                 const response = await fetch('/api/payment/capture-paypal-order', {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify({
//                     orderId: data.orderID,
//                     appointmentId,
//                   }),
//                 });

//                 const result = await response.json();

//                 if (!response.ok) {
//                   throw new Error(result.error || 'Failed to capture payment');
//                 }

//                 onSuccess(data.orderID);
//               } catch (error) {
//                 console.error('Error capturing PayPal payment:', error);
//                 onError(error instanceof Error ? error.message : 'Payment capture failed');
//               }
//             }}
//             onError={(err) => {
//               console.error('PayPal error:', err);
//               onError('PayPal payment failed. Please try again.');
//             }}
//             style={{
//               layout: 'vertical',
//               color: 'gold',
//               shape: 'rect',
//               label: 'paypal',
//             }}
//           />
//         </PayPalScriptProvider>
//       </div>

//       {/* Security badges */}
//       <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
//         <div className="flex items-center gap-1.5">
//           <Lock className="h-3 w-3" />
//           <span>{t("booking_payment_paypal_secure")}</span>
//         </div>
//         <div className="h-1 w-1 rounded-full bg-slate-500" />
//         <div className="flex items-center gap-1.5">
//           <ShieldCheck className="h-3 w-3" />
//           <span>PayPal Protected</span>
//         </div>
//       </div>

//       {/* Info note */}
//       <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-xl">
//         <p className="text-xs text-slate-300 leading-relaxed text-center">
//           {t("booking_payment_paypal_note")}
//         </p>
//       </div>

//       {/* Footer note */}
//       <p className="text-center text-xs text-slate-400 leading-relaxed">
//         {t("booking_payment_paypal_footer")}
//       </p>
//     </div>
//   );
// }