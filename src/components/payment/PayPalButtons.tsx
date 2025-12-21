// src/components/payment/PayPalButtons.tsx
'use client';

import React from 'react';
import { 
  PayPalScriptProvider, 
  PayPalButtons as PayPalButtonsSDK,
} from '@paypal/react-paypal-js';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';
import { useTranslations } from '@/i18n/useTranslations';

interface PayPalButtonsProps {
  amount: number;
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

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
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

      {/* PayPal Buttons */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtonsSDK
            createOrder={async () => {
              try {
                const response = await fetch('/api/payment/create-paypal-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    appointmentId,
                    amount,
                  }),
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Failed to create PayPal order');
                }

                return data.orderId;
              } catch (error) {
                console.error('Error creating PayPal order:', error);
                onError(error instanceof Error ? error.message : 'Failed to create order');
                throw error;
              }
            }}
            onApprove={async (data) => {
              try {
                const response = await fetch('/api/payment/capture-paypal-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: data.orderID,
                    appointmentId,
                  }),
                });

                const result = await response.json();

                if (!response.ok) {
                  throw new Error(result.error || 'Failed to capture payment');
                }

                onSuccess(data.orderID);
              } catch (error) {
                console.error('Error capturing PayPal payment:', error);
                onError(error instanceof Error ? error.message : 'Payment capture failed');
              }
            }}
            onError={(err) => {
              console.error('PayPal error:', err);
              onError('PayPal payment failed. Please try again.');
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