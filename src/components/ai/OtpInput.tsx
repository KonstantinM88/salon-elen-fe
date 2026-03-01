// src/components/ai/OtpInput.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, RotateCcw } from 'lucide-react';

const CODE_LENGTH = 6;

interface OtpInputProps {
  /** Called when all 6 digits are entered */
  onSubmit: (code: string) => void;
  /** Currently sending the code */
  isLoading?: boolean;
  /** UI locale */
  locale?: 'de' | 'ru' | 'en';
  /** Called when user requests a new code */
  onResend?: () => void;
}

const LABELS = {
  de: {
    title: 'Bestätigungscode',
    hint: 'Geben Sie den 6-stelligen Code ein',
    resend: 'Code erneut senden',
    sending: 'Wird überprüft…',
  },
  ru: {
    title: 'Код подтверждения',
    hint: 'Введите 6-значный код',
    resend: 'Отправить код ещё раз',
    sending: 'Проверяем…',
  },
  en: {
    title: 'Verification code',
    hint: 'Enter the 6-digit code',
    resend: 'Resend code',
    sending: 'Verifying…',
  },
} as const;

export function OtpInput({
  onSubmit,
  isLoading = false,
  locale = 'de',
  onResend,
}: OtpInputProps) {
  const t = LABELS[locale] ?? LABELS.de;
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const submitLockRef = useRef(false);
  const wasLoadingRef = useRef(isLoading);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Focus management
  useEffect(() => {
    if (!isLoading) {
      inputRefs.current[focusIdx]?.focus();
    }
  }, [focusIdx, isLoading]);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      submitLockRef.current = false;
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  const submitCode = useCallback(
    (rawCode: string) => {
      const code = rawCode.replace(/\D/g, '').slice(0, CODE_LENGTH);
      if (code.length !== CODE_LENGTH) return;
      if (isLoading || submitLockRef.current) return;

      submitLockRef.current = true;
      onSubmit(code);
    },
    [isLoading, onSubmit],
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Allow only digits
      const digit = value.replace(/\D/g, '').slice(-1);
      
      setDigits((prev) => {
        const next = [...prev];
        next[index] = digit;
        return next;
      });

      // Move focus forward
      if (digit && index < CODE_LENGTH - 1) {
        setFocusIdx(index + 1);
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        setDigits((prev) => {
          const next = [...prev];
          if (next[index]) {
            // Clear current
            next[index] = '';
          } else if (index > 0) {
            // Move back and clear
            next[index - 1] = '';
            setFocusIdx(index - 1);
          }
          return next;
        });
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        setFocusIdx(index - 1);
      } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
        e.preventDefault();
        setFocusIdx(index + 1);
      } else if (e.key === 'Enter') {
        const code = digits.join('');
        submitCode(code);
      }
    },
    [digits, submitCode],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, CODE_LENGTH);

      if (pasted.length === 0) return;

      const newDigits = Array(CODE_LENGTH).fill('');
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }

      setDigits(newDigits);

      if (pasted.length < CODE_LENGTH) {
        setFocusIdx(Math.min(pasted.length, CODE_LENGTH - 1));
      }
    },
    [],
  );

  const handleResend = useCallback(() => {
    submitLockRef.current = false;
    setDigits(Array(CODE_LENGTH).fill(''));
    setFocusIdx(0);
    onResend?.();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [onResend]);

  useEffect(() => {
    const isComplete = digits.every((d) => d !== '');
    if (!isComplete) {
      if (!isLoading) {
        submitLockRef.current = false;
      }
      return;
    }

    submitCode(digits.join(''));
  }, [digits, isLoading, submitCode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center gap-3 px-3 py-3"
      style={{
        borderTop: '1px solid rgba(255, 215, 0, 0.1)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5 text-yellow-500/70" />
        <span>{t.hint}</span>
      </div>

      {/* Digit inputs */}
      <div className="flex items-center gap-2">
        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
          <div key={i} className="relative">
            {/* Separator dash after 3rd digit */}
            {i === 3 && (
              <div
                className="absolute -left-2 top-1/2 h-px w-2 -translate-y-1/2"
                style={{ background: 'rgba(255, 215, 0, 0.3)' }}
              />
            )}
            <input
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digits[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={() => setFocusIdx(i)}
              disabled={isLoading}
              className="h-11 w-10 rounded-lg text-center text-lg font-semibold outline-none transition-all duration-200 disabled:opacity-40"
              style={{
                background:
                  digits[i]
                    ? 'rgba(255, 215, 0, 0.08)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  focusIdx === i && !isLoading
                    ? '2px solid rgba(255, 215, 0, 0.5)'
                    : digits[i]
                      ? '1px solid rgba(255, 215, 0, 0.25)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFD700',
                caretColor: '#FFD700',
              }}
              aria-label={`${t.title} ${i + 1}`}
            />
          </div>
        ))}
      </div>

      {/* Status / actions */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{t.sending}</span>
          </div>
        ) : (
          onResend && (
            <button
              onClick={handleResend}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:text-yellow-500/80"
            >
              <RotateCcw className="h-3 w-3" />
              {t.resend}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
