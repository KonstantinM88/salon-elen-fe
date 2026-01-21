// src/components/payment/StripePaymentForm.tsx
'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Lock, CreditCard, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/i18n/useTranslations';

interface StripePaymentFormProps {
  amount: number;
  appointmentId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({
  amount,
  appointmentId,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Payment form is not ready. Please wait...');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Валидация формы
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        throw new Error(submitError.message || 'Payment validation failed');
      }

      // Подтверждение оплаты
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/payment/success?appointment=${appointmentId}`,
        },
        redirect: 'if_required',
      });

      // ✅ ВАЖНО: Проверяем paymentIntent ПЕРЕД error
      if (result.paymentIntent) {
        const status = result.paymentIntent.status;
        
        if (status === 'succeeded') {
          // ✅ Оплата успешна
          console.log('✅ Payment successful:', result.paymentIntent.id);
          onSuccess(result.paymentIntent.id);
          return; // ВАЖНО: выходим из функции
        } else if (status === 'processing') {
          // ⏳ Оплата обрабатывается
          console.log('⏳ Payment processing...');
          setErrorMessage('Payment is being processed. Please wait...');
          return;
        } else if (status === 'requires_payment_method') {
          // ❌ Нужен другой способ оплаты
          throw new Error('Payment method declined. Please try another card.');
        }
      }

      // Если есть error И нет paymentIntent - это ошибка
      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      // Неожиданная ситуация
      throw new Error('Payment status is unclear. Please contact support.');

    } catch (err) {
      console.error('Payment error:', err);
      const message = err instanceof Error ? err.message : 'Payment processing failed';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Сумма к оплате */}
      <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">
            {t("booking_payment_stripe_amount")}
          </span>
          <span className="text-2xl font-bold text-white">
            €{(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Element */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'DE',
                }
              }
            }
          }}
        />
      </div>

      {/* Сообщение об ошибке */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 backdrop-blur-xl"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5" />
          <span className="text-sm text-red-200">{errorMessage}</span>
        </motion.div>
      )}

      {/* Кнопка оплаты */}
      <motion.button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        whileHover={{ scale: isProcessing ? 1 : 1.02 }}
        whileTap={{ scale: isProcessing ? 1 : 0.98 }}
        className={`w-full rounded-xl px-6 py-4 text-base font-bold transition-all ${
          isProcessing || !stripe || !elements
            ? 'cursor-not-allowed bg-slate-600 text-slate-400'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Pay €{(amount / 100).toFixed(2)}
          </span>
        )}
      </motion.button>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          <span>Secure Payment</span>
        </div>
        <div className="h-1 w-1 rounded-full bg-slate-500" />
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3 w-3" />
          <span>Powered by Stripe</span>
        </div>
      </div>

      {/* Info note */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-xl">
        <p className="text-xs text-slate-300 text-center leading-relaxed">
          Your payment is secured with 256-bit SSL encryption. We do not store your card details.
        </p>
      </div>
    </form>
  );
}