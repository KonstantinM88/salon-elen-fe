//-----светлая тема Version 1.0.0-----
// src/components/ai/ChatWidget.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
import { ChatMessage, type Message } from './ChatMessage';
import { OtpInput } from './OtpInput';
import {
  VoiceButton,
  type VoiceButtonHandle,
  type VoiceMicDebugInfo,
  type VoiceMicErrorCode,
} from './VoiceButton';
import { useMobileViewport } from '@/hooks/useMobileViewport';

// ─── Config ─────────────────────────────────────────────────────

const API_URL = '/api/ai/chat';

function generateSessionId(): string {
  return crypto.randomUUID();
}

// ─── Translations ───────────────────────────────────────────────

const UI_TEXT = {
  de: {
    placeholder: 'Ihre Nachricht...',
    welcome: 'Hallo! 👋 Ich bin Elen-AI, Ihr Buchungsassistent. Wie kann ich Ihnen helfen?\n\n[option] 📅 Termin buchen [/option]\n[option] 💬 Beratung & Auswahl [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]',
    autoGreeting:
      '🌸 Möchten Sie einen Termin buchen oder Preise erfahren?\n\n[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]',
    teaserDefault: '🌸 Soll ich Ihnen helfen, schnell einen Termin zu finden?',
    teaserPrices: '🌸 Möchten Sie Preise für PMU, Brows/Lashes oder Hydrafacial?',
    teaserBooking: '🌸 Soll ich Ihnen bei der Terminwahl helfen?',
    error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
    retry: 'Erneut versuchen',
    offline: 'Keine Internetverbindung',
    reconnecting: 'Verbindung wird wiederhergestellt...',
    title: 'Salon Elen',
    subtitle: 'Buchungsassistent',
    newChat: 'Neuer Chat',
  },
  ru: {
    placeholder: 'Ваше сообщение...',
    welcome: 'Привет! 👋 Я Elen-AI, ассистент записи. Чем могу помочь?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💬 Консультация и подбор [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]',
    autoGreeting:
      '🌸 Хотите записаться на приём или узнать цены?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]',
    teaserDefault: '🌸 Хотите, я помогу быстро подобрать удобный термин?',
    teaserPrices: '🌸 Подсказать цены на PMU, брови/ресницы или Hydrafacial?',
    teaserBooking: '🌸 Помочь выбрать дату и время?',
    error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
    rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
    retry: 'Попробовать снова',
    offline: 'Нет подключения к интернету',
    reconnecting: 'Восстанавливаю соединение...',
    title: 'Salon Elen',
    subtitle: 'Ассистент записи',
    newChat: 'Новый чат',
  },
  en: {
    placeholder: 'Your message...',
    welcome: 'Hello! 👋 I\'m Elen-AI, your booking assistant. How can I help?\n\n[option] 📅 Book an appointment [/option]\n[option] 💬 Consultation & guidance [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Location & hours [/option]',
    autoGreeting:
      '🌸 Would you like to book an appointment or check prices?\n\n[option] 📅 Book an appointment [/option]\n[option] 💅 Services & prices [/option]',
    teaserDefault: '🌸 Would you like help finding a suitable appointment?',
    teaserPrices: '🌸 Would you like prices for PMU, brows/lashes or Hydrafacial?',
    teaserBooking: '🌸 Would you like help choosing a time?',
    error: 'Sorry, something went wrong. Please try again.',
    rateLimit: 'Please wait a moment before sending a new message.',
    retry: 'Try again',
    offline: 'No internet connection',
    reconnecting: 'Reconnecting...',
    title: 'Salon Elen',
    subtitle: 'Booking Assistant',
    newChat: 'New Chat',
  },
} as const;

type SupportedLocale = keyof typeof UI_TEXT;

function getStreamProgressLabel(
  locale: SupportedLocale,
  step?: string,
  toolName?: string,
): string | null {
  const key = step || toolName;
  if (!key) return null;

  const labels: Record<SupportedLocale, Record<string, string>> = {
    ru: {
      loading_services: 'Подбираю доступные услуги…',
      loading_masters: 'Проверяю мастеров…',
      searching_slots: 'Ищу свободные слоты…',
      reserving_slot: 'Резервирую выбранный слот…',
      creating_draft: 'Подготавливаю запись…',
      sending_otp: 'Отправляю код подтверждения…',
      confirming_booking: 'Подтверждаю запись…',
    },
    de: {
      loading_services: 'Verfügbare Leistungen werden geladen…',
      loading_masters: 'Verfügbare Meister werden geprüft…',
      searching_slots: 'Freie Zeiten werden gesucht…',
      reserving_slot: 'Der gewählte Slot wird reserviert…',
      creating_draft: 'Buchung wird vorbereitet…',
      sending_otp: 'Bestätigungscode wird gesendet…',
      confirming_booking: 'Buchung wird bestätigt…',
    },
    en: {
      loading_services: 'Loading available services…',
      loading_masters: 'Checking available masters…',
      searching_slots: 'Searching available slots…',
      reserving_slot: 'Reserving your selected slot…',
      creating_draft: 'Preparing booking details…',
      sending_otp: 'Sending verification code…',
      confirming_booking: 'Confirming your booking…',
    },
  };

  return labels[locale][key] ?? null;
}

const MIC_ENABLE_OPTION_TEXT: Record<SupportedLocale, string> = {
  de: 'Mikrofon aktivieren',
  ru: 'Включить микрофон',
  en: 'Enable microphone',
};

const MIC_SETTINGS_HELP_TEXT: Record<SupportedLocale, string> = {
  de:
    'Öffnen Sie die Website-Berechtigungen (Schloss-Symbol in der Adresszeile), erlauben Sie das Mikrofon und laden Sie die Seite neu.',
  ru:
    'Откройте разрешения сайта (значок замка в адресной строке), включите микрофон и обновите страницу.',
  en:
    'Open site permissions (lock icon in the address bar), allow microphone access, then reload the page.',
};

const MIC_ACTIONABLE_ERROR_CODES = new Set<VoiceMicErrorCode>([
  'not-allowed',
  'not-found',
  'in-use',
  'insecure-context',
  'unsupported',
  'iframe-blocked',
]);

const AUTO_GREETING_MIN_MS = 8000;
const AUTO_GREETING_MAX_MS = 12000;
const STREAM_PROGRESS_MIN_UPDATE_MS = 250;

function randomDelayBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveMicSettingsUrl(): string | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;

  const ua = navigator.userAgent.toLowerCase();
  const origin = encodeURIComponent(window.location.origin);

  const isChromium =
    (ua.includes('chrome') || ua.includes('chromium') || ua.includes('edg') || ua.includes('opr')) &&
    !ua.includes('firefox');

  if (isChromium) {
    return `chrome://settings/content/siteDetails?site=${origin}`;
  }
  if (ua.includes('firefox')) {
    return 'about:preferences#privacy';
  }

  return null;
}

function tryOpenMicSettings(): boolean {
  if (typeof window === 'undefined') return false;
  const url = resolveMicSettingsUrl();
  if (!url) return false;

  try {
    window.location.assign(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Types ──────────────────────────────────────────────────────

type InputMode = 'text' | 'otp';

// ─── Component ──────────────────────────────────────────────────

interface ChatWidgetProps {
  locale?: string;
}

export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
  const locale: SupportedLocale =
    propLocale && propLocale in UI_TEXT
      ? (propLocale as SupportedLocale)
      : 'de';
  const t = UI_TEXT[locale];

  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [streamProgress, setStreamProgress] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const { height: vpHeight, keyboardOpen, isMobile } = useMobileViewport();
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [showVoiceDebug, setShowVoiceDebug] = useState(false);
  const [voiceDebugInfo, setVoiceDebugInfo] = useState<VoiceMicDebugInfo | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const voiceButtonRef = useRef<VoiceButtonHandle | null>(null);
  const streamingMsgIdRef = useRef<string | null>(null);
  const teaserTimerRef = useRef<number | null>(null);
  const teaserShownRef = useRef(false);
  const chatAutoGreetingTimerRef = useRef<number | null>(null);
  const chatAutoGreetingShownRef = useRef(false);
  const progressTimerRef = useRef<number | null>(null);
  const pendingProgressRef = useRef<string | null>(null);
  const lastProgressAtRef = useRef(0);
  const lastUserMessageRef = useRef('');

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening (only in text mode)
  useEffect(() => {
    if (isOpen && inputMode === 'text') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, inputMode]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      chatAutoGreetingShownRef.current = false;
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t.welcome,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, t.welcome]);

  // Teaser bubble on the page (6–10s): appears before opening chat, then disappears on interaction.
  useEffect(() => {
    // Clear timer when chat opens
    if (isOpen) {
      setShowTeaser(false);
      if (teaserTimerRef.current !== null) {
        window.clearTimeout(teaserTimerRef.current);
        teaserTimerRef.current = null;
      }
      return;
    }

    // Show only once per page load
    if (teaserShownRef.current) return;

    const delay = randomDelayBetween(6000, 10000);
    teaserTimerRef.current = window.setTimeout(() => {
      if (isOpen) return;
      teaserShownRef.current = true;
      setShowTeaser(true);
      teaserTimerRef.current = null;
    }, delay);

    return () => {
      if (teaserTimerRef.current !== null) {
        window.clearTimeout(teaserTimerRef.current);
        teaserTimerRef.current = null;
      }
    };
  }, [isOpen]);

  // Auto-greeting (8–12s): only when chat is open and user has not sent anything yet.
  useEffect(() => {
    if (!isOpen) {
      if (chatAutoGreetingTimerRef.current !== null) {
        window.clearTimeout(chatAutoGreetingTimerRef.current);
        chatAutoGreetingTimerRef.current = null;
      }
      return;
    }

    const hasUserInteracted = messages.some((msg) => msg.role === 'user');
    const hasOnlyWelcome =
      messages.length === 1 &&
      messages[0]?.role === 'assistant' &&
      messages[0]?.id === 'welcome';

    if (!hasOnlyWelcome || hasUserInteracted || chatAutoGreetingShownRef.current) {
      if (chatAutoGreetingTimerRef.current !== null) {
        window.clearTimeout(chatAutoGreetingTimerRef.current);
        chatAutoGreetingTimerRef.current = null;
      }
      return;
    }

    const delay = randomDelayBetween(AUTO_GREETING_MIN_MS, AUTO_GREETING_MAX_MS);
    chatAutoGreetingTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => {
        const userInteracted = prev.some((msg) => msg.role === 'user');
        const stillOnlyWelcome =
          prev.length === 1 &&
          prev[0]?.role === 'assistant' &&
          prev[0]?.id === 'welcome';

        if (userInteracted || !stillOnlyWelcome || chatAutoGreetingShownRef.current) {
          return prev;
        }

        chatAutoGreetingShownRef.current = true;
        return [
          ...prev,
          {
            id: `auto-greeting-${Date.now()}`,
            role: 'assistant',
            content: t.autoGreeting,
            timestamp: new Date(),
          },
        ];
      });
      chatAutoGreetingTimerRef.current = null;
    }, delay);

    return () => {
      if (chatAutoGreetingTimerRef.current !== null) {
        window.clearTimeout(chatAutoGreetingTimerRef.current);
        chatAutoGreetingTimerRef.current = null;
      }
    };
  }, [isOpen, messages, t.autoGreeting]);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (!isMobile) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent iOS bounce / pull-to-refresh
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10) * -1);
      }
    };
  }, [isOpen, isMobile]);

  // Auto-scroll when keyboard opens
  useEffect(() => {
    if (keyboardOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [keyboardOpen]);

  // Debug panel visibility for admins/support:
  // - always on in /admin
  // - can be enabled on public pages via ?voiceDebug=1 or localStorage.voice_debug=1
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const debugByPath = window.location.pathname.startsWith('/admin');
    const debugByQuery = new URLSearchParams(window.location.search).get('voiceDebug') === '1';
    const debugByStorage = window.localStorage.getItem('voice_debug') === '1';
    setShowVoiceDebug(debugByPath || debugByQuery || debugByStorage);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const setStreamProgressSmooth = useCallback(
    (next: string | null, options?: { immediate?: boolean }) => {
      const immediate = options?.immediate === true || next === null;
      if (immediate) {
        clearProgressTimer();
        pendingProgressRef.current = null;
        lastProgressAtRef.current = Date.now();
        setStreamProgress(next);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastProgressAtRef.current;
      if (elapsed >= STREAM_PROGRESS_MIN_UPDATE_MS) {
        clearProgressTimer();
        pendingProgressRef.current = null;
        lastProgressAtRef.current = now;
        setStreamProgress(next);
        return;
      }

      pendingProgressRef.current = next;
      if (progressTimerRef.current !== null) return;

      progressTimerRef.current = window.setTimeout(() => {
        progressTimerRef.current = null;
        if (pendingProgressRef.current === null) return;

        const pending = pendingProgressRef.current;
        pendingProgressRef.current = null;
        lastProgressAtRef.current = Date.now();
        setStreamProgress(pending);
      }, STREAM_PROGRESS_MIN_UPDATE_MS - elapsed);
    },
    [clearProgressTimer],
  );

  useEffect(
    () => () => {
      clearProgressTimer();
      pendingProgressRef.current = null;
    },
    [clearProgressTimer],
  );

  const handleNewChat = useCallback(() => {
    if (chatAutoGreetingTimerRef.current !== null) {
      window.clearTimeout(chatAutoGreetingTimerRef.current);
      chatAutoGreetingTimerRef.current = null;
    }
    chatAutoGreetingShownRef.current = false;
    setSessionId(generateSessionId());
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: t.welcome,
        timestamp: new Date(),
      },
    ]);
    setInput('');
    setIsLoading(false);
    setStreamProgressSmooth(null, { immediate: true });
    setInputMode('text');
    setDragY(0);
  }, [t.welcome, setStreamProgressSmooth]);

  const handleSSEResponse = useCallback(
    async (res: Response) => {
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('No response body for SSE');
      }

      const decoder = new TextDecoder();
      const msgId = `ai-stream-${Date.now()}`;
      streamingMsgIdRef.current = msgId;
      let accumulated = '';
      let streamBuffer = '';
      let pendingDelta = '';
      let rafId: number | null = null;
      let sawMetaDone = false;
      const SSE_TIMEOUT_MS = 35000;
      let sseTimeoutTimer: number | null = null;
      let timedOut = false;

      const resetSseTimeout = () => {
        if (sseTimeoutTimer !== null) {
          window.clearTimeout(sseTimeoutTimer);
        }
        sseTimeoutTimer = window.setTimeout(() => {
          timedOut = true;
          reader.cancel().catch(() => {});
        }, SSE_TIMEOUT_MS);
      };

      const flushPendingDelta = () => {
        if (!pendingDelta) return;
        accumulated += pendingDelta;
        pendingDelta = '';
        const current = accumulated;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId ? { ...msg, content: current } : msg,
          ),
        );
      };

      const flushPendingDeltaNow = () => {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        flushPendingDelta();
      };

      const scheduleDeltaFlush = () => {
        if (rafId !== null) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          flushPendingDelta();
        });
      };

      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      setIsLoading(false);
      setStreamProgressSmooth(null, { immediate: true });
      resetSseTimeout();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetSseTimeout();

          streamBuffer += decoder.decode(value, { stream: true });

          const lines = streamBuffer.split('\n');
          streamBuffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith(':')) {
              resetSseTimeout();
              continue;
            }
            if (!line.startsWith('data: ')) continue;
            resetSseTimeout();
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr) as {
                t?: string;
                c?: string;
                n?: string;
                step?: string;
                inputMode?: string;
                done?: boolean;
                message?: string;
              };

              switch (event.t) {
                case 'd': {
                  const delta = typeof event.c === 'string' ? event.c : '';
                  if (!delta) break;
                  pendingDelta += delta;
                  scheduleDeltaFlush();
                  break;
                }
                case 'p': {
                  const label = getStreamProgressLabel(
                    locale,
                    typeof event.step === 'string' ? event.step : undefined,
                    typeof event.n === 'string' ? event.n : undefined,
                  );
                  if (label) {
                    setStreamProgressSmooth(label);
                  } else if (typeof event.n === 'string' && event.n) {
                    console.log(`[ChatWidget] Tool: ${event.n}`);
                  }
                  break;
                }
                case 'm': {
                  flushPendingDeltaNow();
                  sawMetaDone = event.done === true;
                  setStreamProgressSmooth(null, { immediate: true });
                  if (event.inputMode === 'otp') {
                    setInputMode('otp');
                  } else if (event.inputMode === 'text') {
                    setInputMode('text');
                  }
                  break;
                }
                case 'e': {
                  flushPendingDeltaNow();
                  setStreamProgressSmooth(null, { immediate: true });
                  const errorText =
                    typeof event.message === 'string' && event.message.trim()
                      ? event.message
                      : t.error;
                  if (!accumulated) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === msgId
                          ? { ...msg, content: errorText, isError: true }
                          : msg,
                      ),
                    );
                  }
                  break;
                }
              }
            } catch {
              // Ignore malformed SSE payload
            }
          }
        }
      } finally {
        if (sseTimeoutTimer !== null) {
          window.clearTimeout(sseTimeoutTimer);
        }
        flushPendingDeltaNow();
        setStreamProgressSmooth(null, { immediate: true });
        reader.releaseLock();
      }

      if (timedOut && !accumulated) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId
              ? {
                  ...msg,
                  content: t.error,
                  isError: true,
                  retryPayload: lastUserMessageRef.current || undefined,
                }
              : msg,
          ),
        );
        return;
      }

      if (!accumulated && !sawMetaDone) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId ? { ...msg, content: t.error, isError: true } : msg,
          ),
        );
      }
    },
    [t.error, locale, setStreamProgressSmooth],
  );

  // ─── Core send logic ─────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      lastUserMessageRef.current = text;

      if (isOffline) {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: t.offline,
            timestamp: new Date(),
            isError: true,
            retryPayload: text,
          },
        ]);
        return;
      }

      setIsLoading(true);
      setStreamProgressSmooth(null, { immediate: true });

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: text,
            locale,
            stream: true,
          }),
        });

        if (res.status === 429) {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: t.rateLimit,
              timestamp: new Date(),
              isError: true,
              retryPayload: text,
            },
          ]);
          return;
        }

        if (!res.ok) {
          try {
            const errData = (await res.json()) as {
              error?: string;
              retryable?: boolean;
            };
            const errText =
              typeof errData.error === 'string' && errData.error.trim()
                ? errData.error
                : t.error;
            const retryable = errData.retryable !== false;

            setMessages((prev) => [
              ...prev,
              {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: errText,
                timestamp: new Date(),
                isError: true,
                retryPayload: retryable ? text : undefined,
              },
            ]);
            return;
          } catch {
            // ignore parse errors and fall through
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/event-stream')) {
          await handleSSEResponse(res);
          return;
        }

        const data = await res.json();
        setStreamProgressSmooth(null, { immediate: true });

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.text,
            timestamp: new Date(),
          },
        ]);

        // Switch input mode based on server response
        if (data.inputMode === 'otp') {
          setInputMode('otp');
        } else if (data.inputMode === 'text' || inputMode === 'otp') {
          setInputMode('text');
        }
      } catch (err) {
        console.error('[ChatWidget] Error:', err);
        setStreamProgressSmooth(null, { immediate: true });
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: t.error,
            timestamp: new Date(),
            isError: true,
            retryPayload: text,
          },
        ]);
      } finally {
        setIsLoading(false);
        setStreamProgressSmooth(null, { immediate: true });
        streamingMsgIdRef.current = null;
      }
    },
    [
      sessionId,
      locale,
      t,
      inputMode,
      handleSSEResponse,
      setStreamProgressSmooth,
      isOffline,
    ],
  );

  const handleRetry = useCallback(
    (retryPayload: string, errorMsgId: string) => {
      if (isLoading || isOffline) return;

      const userMsg: Message = {
        id: `user-retry-${Date.now()}`,
        role: 'user',
        content: retryPayload,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev.filter((msg) => msg.id !== errorMsgId), userMsg]);
      sendMessage(retryPayload);
    },
    [isLoading, isOffline, sendMessage],
  );

  // ─── Text input handlers ──────────────────────────────────────

  const handleOptionClick = useCallback(
    (text: string) => {
      if (isLoading) return;

      if (text.trim().toLowerCase() === MIC_ENABLE_OPTION_TEXT[locale].toLowerCase()) {
        // If browser already stores a hard "denied", open settings directly.
        if (
          voiceDebugInfo?.code === 'not-allowed' &&
          voiceDebugInfo.permissionState === 'denied'
        ) {
          const opened = tryOpenMicSettings();
          if (!opened) {
            setMessages((prev) => [
              ...prev,
              {
                id: `mic-help-${Date.now()}`,
                role: 'assistant',
                content: MIC_SETTINGS_HELP_TEXT[locale],
                timestamp: new Date(),
                isError: false,
              },
            ]);
          }
          return;
        }

        voiceButtonRef.current?.requestMicAccess();
        return;
      }

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      sendMessage(text);
    },
    [isLoading, sendMessage, locale, voiceDebugInfo],
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || isOffline) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    sendMessage(text);
  }, [input, isLoading, isOffline, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── OTP handlers ─────────────────────────────────────────────

  const handleOtpSubmit = useCallback(
    (code: string) => {
      if (isLoading || isOffline) return;
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: code,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      sendMessage(code);
    },
    [isLoading, isOffline, sendMessage],
  );

  const handleOtpResend = useCallback(() => {
    if (isLoading || isOffline) return;
    const resendText =
      locale === 'ru'
        ? 'отправь код ещё раз'
        : locale === 'en'
          ? 'send code again'
          : 'Code erneut senden';

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: resendText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    sendMessage(resendText);
  }, [isLoading, isOffline, locale, sendMessage]);

  // ─── Voice handlers ───────────────────────────────────────────

  const handleVoiceResult = useCallback(
    (result: { transcript: string; text: string; inputMode?: string }) => {
      setVoiceDebugInfo(null);

      // Add user message (transcribed text)
      if (result.transcript) {
        setMessages((prev) => [
          ...prev,
          {
            id: `user-voice-${Date.now()}`,
            role: 'user',
            content: `🎙 ${result.transcript}`,
            timestamp: new Date(),
          },
        ]);
      }

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-voice-${Date.now()}`,
          role: 'assistant',
          content: result.text,
          timestamp: new Date(),
        },
      ]);

      // Update input mode
      if (result.inputMode === 'otp') {
        setInputMode('otp');
      } else if (result.inputMode === 'text') {
        setInputMode('text');
      }
    },
    [],
  );

  const handleVoiceError = useCallback(
    (error: string, code?: VoiceMicErrorCode) => {
      const withAction = code ? MIC_ACTIONABLE_ERROR_CODES.has(code) : false;
      const content = withAction
        ? `${error}\n\n[option] 🎙 ${MIC_ENABLE_OPTION_TEXT[locale]} [/option]`
        : error;

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.content === content) {
          return prev;
        }

        return [
          ...prev,
          {
            id: `error-voice-${Date.now()}`,
            role: 'assistant',
            content,
            timestamp: new Date(),
            isError: !withAction,
          },
        ];
      });
    },
    [locale],
  );

  const handleVoiceDebug = useCallback((info: VoiceMicDebugInfo) => {
    setVoiceDebugInfo(info);
  }, []);

  // ─── Swipe-to-close (mobile) ──────────────────────────────
  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      // Close if dragged >100px down or fast swipe
      if (info.offset.y > 100 || info.velocity.y > 500) {
        setIsOpen(false);
      }
      setDragY(0);
    },
    [],
  );

  // ─── Render ───────────────────────────────────────────────────

  const openChat = useCallback(() => {
    setIsOpen(true);
    setShowTeaser(false);
    teaserShownRef.current = true;
    if (teaserTimerRef.current !== null) {
      window.clearTimeout(teaserTimerRef.current);
      teaserTimerRef.current = null;
    }
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);


  return (
    <>
      {/* ── Floating Button ───────────────────────────────── */}
      <AnimatePresence>

        {!isOpen && showTeaser && (
          <motion.div
            key="chat-teaser"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-6 z-50 max-w-[300px] rounded-2xl border border-pink-200/80 bg-white/85 px-4 py-3 text-sm text-slate-800 shadow-[0_18px_50px_rgba(236,72,153,0.18)] backdrop-blur-md sm:bottom-28 sm:right-6"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2.5 w-2.5 flex-none rounded-full bg-pink-500 shadow-[0_0_18px_rgba(236,72,153,0.35)]" />
              <div className="leading-snug">
                {(() => {
                  const path = typeof window !== 'undefined' ? window.location.pathname : '';
                  if (path.includes('/prices')) return t.teaserPrices;
                  if (path.includes('/booking')) return t.teaserBooking;
                  return t.teaserDefault;
                })()}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={openChat}
                className="rounded-xl bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                {locale === 'de' ? 'Chat öffnen' : locale === 'ru' ? 'Открыть чат' : 'Open chat'}
              </button>
              <button
                type="button"
                onClick={() => setShowTeaser(false)}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                {locale === 'de' ? 'Später' : locale === 'ru' ? 'Позже' : 'Later'}
              </button>
            </div>
          </motion.div>
        )}
        {!isOpen && (
          <motion.button
            key="chat-launcher"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={openChat}
            className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl sm:h-16 sm:w-16"
            style={{
              bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
              right: 'max(1.5rem, env(safe-area-inset-right, 1.5rem))',
              background: 'linear-gradient(135deg, #F472B6 0%, #FDA4AF 45%, #FDE68A 100%)',
              boxShadow: '0 10px 30px rgba(236, 72, 153, 0.25), 0 2px 10px rgba(0,0,0,0.06)',
            }}
            aria-label="Chat öffnen"
          >
            <MessageCircle className="h-6 w-6 text-white sm:h-7 sm:w-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 z-50 flex w-full flex-col sm:bottom-0 sm:right-6 sm:h-[540px] sm:w-[360px] sm:rounded-2xl"
            style={{
              height: isMobile ? `${vpHeight}px` : undefined,
              background: 'linear-gradient(180deg, #FFF7FA 0%, #FDE7F1 55%, #FDF2F8 100%)',
              border: '1px solid rgba(236, 72, 153, 0.22)',
              boxShadow:
                '0 18px 60px rgba(236, 72, 153, 0.18), 0 8px 24px rgba(0, 0, 0, 0.08)',
              paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : undefined,
              paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
            }}
          >
            {/* ── Header ──────────────────────────────────── */}
            <motion.div
              ref={headerRef}
              drag={isMobile ? 'y' : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDrag={(_event, info: { offset: { y: number } }) => setDragY(info.offset.y)}
              onDragEnd={handleDragEnd}
              className="relative flex cursor-grab touch-none items-center justify-between rounded-t-none px-4 py-3 active:cursor-grabbing sm:cursor-default sm:rounded-t-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.14) 0%, rgba(253, 164, 175, 0.18) 45%, rgba(255, 255, 255, 0.55) 100%)',
                borderBottom: '1px solid rgba(236, 72, 153, 0.14)',
              }}
            >
              {/* Drag indicator — mobile only */}
              {isMobile && (
                <div
                  className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full bg-pink-300/60"
                  style={{ opacity: dragY > 0 ? 1 : 0.65 }}
                />
              )}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #F472B6, #FB7185)',
                  }}
                >
                  E
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-600">{t.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-pink-100 hover:text-slate-900"
                  title={t.newChat}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={closeChat}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-pink-100 hover:text-slate-900"
                  aria-label="Chat schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {/* ── Messages ────────────────────────────────── */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 scrollbar-thin text-slate-900"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {messages.map((msg, idx) => {
                const isLatestAssistant =
                  msg.role === 'assistant' && idx === messages.length - 1;

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onOptionClick={isLatestAssistant ? handleOptionClick : undefined}
                    onRetry={handleRetry}
                    retryLabel={t.retry}
                    isLatest={isLatestAssistant}
                  />
                );
              })}

              {isLoading && (
                <div className="mb-3 flex items-start gap-2">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
                    style={{
                      background: 'linear-gradient(135deg, #F472B6, #FB7185)',
                    }}
                  >
                    E
                  </div>
                  <div className="rounded-xl rounded-tl-sm bg-white/70 px-3 py-2 shadow-sm border border-pink-100">
                    <div className="flex gap-1">
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-pink-300" style={{ animationDelay: '0ms' }} />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-pink-300" style={{ animationDelay: '150ms' }} />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-pink-300" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && streamProgress && (
                <div className="mb-3 rounded-lg border border-pink-100 bg-white/70 px-3 py-2 text-[11px] text-slate-600 shadow-sm">
                  {streamProgress}
                </div>
              )}

              {isOffline && (
                <div
                  className="mb-3 rounded-xl px-3 py-2 text-center text-xs font-medium"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(254,243,199,0.95) 0%, rgba(253,230,138,0.9) 100%)',
                    border: '1px solid rgba(234,179,8,0.3)',
                    color: '#92400E',
                  }}
                >
                  {t.offline}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ─────────────────────────────── */}
            <AnimatePresence mode="wait">
              {inputMode === 'otp' ? (
                <OtpInput
                  key="otp-input"
                  onSubmit={handleOtpSubmit}
                  isLoading={isLoading}
                  locale={locale}
                  onResend={handleOtpResend}
                />
              ) : (
                <motion.div
                  key="text-input"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                  style={{
                    borderTop: '1px solid rgba(236, 72, 153, 0.14)',
                    background: 'rgba(255, 255, 255, 0.75)',
                  }}
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.placeholder}
                      rows={1}
                      disabled={isLoading || isOffline}
                      className="flex-1 resize-none rounded-xl border border-pink-200/80 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-pink-400 focus:ring-2 focus:ring-pink-200 disabled:opacity-50"
                      style={{ maxHeight: '100px' }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
                      }}
                    />

                    {/* Voice button — shown when input is empty */}
                    {!input.trim() && (
                      <div className="flex flex-col items-end gap-1">
                        <VoiceButton
                          ref={voiceButtonRef}
                          onResult={handleVoiceResult}
                          onError={handleVoiceError}
                          onDebug={handleVoiceDebug}
                          sessionId={sessionId}
                          locale={locale}
                          disabled={isLoading || isOffline}
                        />
                        {showVoiceDebug && voiceDebugInfo && (
                          <div className="max-w-[250px] rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] leading-4 text-amber-200">
                            <div>{`voice-debug: ${voiceDebugInfo.code}`}</div>
                            <div>{`name: ${voiceDebugInfo.errorName || '-'}`}</div>
                            <div>{`perm: ${voiceDebugInfo.permissionState}`}</div>
                            <div>{`secure: ${voiceDebugInfo.secureContext ? 'yes' : 'no'}, iframe: ${voiceDebugInfo.inIframe ? 'yes' : 'no'}`}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Send button — shown when there's text */}
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading || isOffline}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
                      style={{
                        background:
                          input.trim() && !isLoading && !isOffline
                            ? 'linear-gradient(135deg, #F472B6, #FB7185)'
                            : 'rgba(236, 72, 153, 0.12)',
                        // Hide send button when voice is shown (no text)
                        display: input.trim() ? 'flex' : 'none',
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                      ) : (
                        <Send className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



//--------это уже светлая, V-2
// // src/components/ai/ChatWidget.tsx
// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
// import { ChatMessage, type Message } from './ChatMessage';
// import { OtpInput } from './OtpInput';
// import {
//   VoiceButton,
//   type VoiceButtonHandle,
//   type VoiceMicDebugInfo,
//   type VoiceMicErrorCode,
// } from './VoiceButton';
// import { useMobileViewport } from '@/hooks/useMobileViewport';

// // ─── Config ─────────────────────────────────────────────────────

// const API_URL = '/api/ai/chat';

// function generateSessionId(): string {
//   return crypto.randomUUID();
// }

// // ─── Ultra‑premium theme (light pink) ────────────────────────────

// const THEME = {
//   panelBg:
//     'linear-gradient(180deg, rgba(255,247,250,0.97) 0%, rgba(253,231,241,0.96) 45%, rgba(255,255,255,0.92) 100%)',
//   panelBorder: '1px solid rgba(236,72,153,0.18)',
//   panelShadow: '0 26px 70px rgba(236,72,153,0.18), 0 12px 30px rgba(15,23,42,0.10)',
//   headerBg:
//     'linear-gradient(135deg, rgba(236,72,153,0.14) 0%, rgba(253,164,175,0.18) 45%, rgba(255,255,255,0.62) 100%)',
//   headerBorder: '1px solid rgba(236,72,153,0.12)',
//   accentGradient: 'linear-gradient(135deg, #F8BBD0 0%, #F06292 55%, #EC4899 100%)',
//   accentShadow: '0 18px 44px rgba(236,72,153,0.22)',
//   softText: '#6B3C53',
//   mainText: '#2B1B24',
//   placeholder: '#8A6A79',
// };

// // ─── Translations ───────────────────────────────────────────────

// const UI_TEXT = {
//   de: {
//     placeholder: 'Ihre Nachricht…',
//     welcome:
//       'Hallo! 👋 Ich bin Elen‑AI, Ihr Buchungsassistent. Wie kann ich Ihnen helfen?\n\n[option] 📅 Termin buchen [/option]\n[option] 💬 Beratung & Auswahl [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]',
//     autoGreeting:
//       '🌸 Möchten Sie einen Termin buchen oder Preise erfahren?\n\n[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]',
//     teaserDefault: '🌸 Soll ich Ihnen helfen, schnell einen Termin zu finden?',
//     teaserPrices: '🌸 Möchten Sie Preise für PMU, Brows/Lashes oder Hydrafacial?',
//     teaserBooking: '🌸 Soll ich Ihnen bei der Terminwahl helfen?',
//     error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
//     rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
//     title: 'Salon Elen',
//     subtitle: 'Buchungsassistent',
//     newChat: 'Neuer Chat',
//     openChat: 'Chat öffnen',
//     later: 'Später',
//   },
//   ru: {
//     placeholder: 'Ваше сообщение…',
//     welcome:
//       'Привет! 👋 Я Elen‑AI, ассистент записи. Чем могу помочь?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💬 Консультация и подбор [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]',
//     autoGreeting:
//       '🌸 Хотите записаться на приём или узнать цены?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]',
//     teaserDefault: '🌸 Хотите, я помогу быстро подобрать удобный термин?',
//     teaserPrices: '🌸 Подсказать цены на PMU, брови/ресницы или Hydrafacial?',
//     teaserBooking: '🌸 Помочь выбрать дату и время?',
//     error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
//     rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
//     title: 'Salon Elen',
//     subtitle: 'Ассистент записи',
//     newChat: 'Новый чат',
//     openChat: 'Открыть чат',
//     later: 'Позже',
//   },
//   en: {
//     placeholder: 'Your message…',
//     welcome:
//       "Hello! 👋 I'm Elen‑AI, your booking assistant. How can I help?\n\n[option] 📅 Book an appointment [/option]\n[option] 💬 Consultation & guidance [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Location & hours [/option]",
//     autoGreeting:
//       '🌸 Would you like to book an appointment or check prices?\n\n[option] 📅 Book an appointment [/option]\n[option] 💅 Services & prices [/option]',
//     teaserDefault: '🌸 Would you like help finding a suitable appointment?',
//     teaserPrices: '🌸 Would you like prices for PMU, brows/lashes or Hydrafacial?',
//     teaserBooking: '🌸 Would you like help choosing a time?',
//     error: 'Sorry, something went wrong. Please try again.',
//     rateLimit: 'Please wait a moment before sending a new message.',
//     title: 'Salon Elen',
//     subtitle: 'Booking assistant',
//     newChat: 'New chat',
//     openChat: 'Open chat',
//     later: 'Later',
//   },
// } as const;

// type SupportedLocale = keyof typeof UI_TEXT;

// const MIC_ENABLE_OPTION_TEXT: Record<SupportedLocale, string> = {
//   de: 'Mikrofon aktivieren',
//   ru: 'Включить микрофон',
//   en: 'Enable microphone',
// };

// const MIC_SETTINGS_HELP_TEXT: Record<SupportedLocale, string> = {
//   de:
//     'Öffnen Sie die Website‑Berechtigungen (Schloss‑Symbol in der Adresszeile), erlauben Sie das Mikrofon und laden Sie die Seite neu.',
//   ru:
//     'Откройте разрешения сайта (значок замка в адресной строке), включите микрофон и обновите страницу.',
//   en:
//     'Open site permissions (lock icon in the address bar), allow microphone access, then reload the page.',
// };

// const MIC_ACTIONABLE_ERROR_CODES = new Set<VoiceMicErrorCode>([
//   'not-allowed',
//   'not-found',
//   'in-use',
//   'insecure-context',
//   'unsupported',
//   'iframe-blocked',
// ]);

// const AUTO_GREETING_MIN_MS = 8000;
// const AUTO_GREETING_MAX_MS = 12000;

// function randomDelayBetween(min: number, max: number): number {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function resolveMicSettingsUrl(): string | null {
//   if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;

//   const ua = navigator.userAgent.toLowerCase();
//   const origin = encodeURIComponent(window.location.origin);

//   const isChromium =
//     (ua.includes('chrome') || ua.includes('chromium') || ua.includes('edg') || ua.includes('opr')) &&
//     !ua.includes('firefox');

//   if (isChromium) return `chrome://settings/content/siteDetails?site=${origin}`;
//   if (ua.includes('firefox')) return 'about:preferences#privacy';

//   return null;
// }

// function tryOpenMicSettings(): boolean {
//   if (typeof window === 'undefined') return false;
//   const url = resolveMicSettingsUrl();
//   if (!url) return false;

//   try {
//     window.location.assign(url);
//     return true;
//   } catch {
//     return false;
//   }
// }

// // ─── Types ──────────────────────────────────────────────────────

// type InputMode = 'text' | 'otp';

// // ─── Component ──────────────────────────────────────────────────

// interface ChatWidgetProps {
//   locale?: string;
// }

// export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
//   const locale: SupportedLocale =
//     propLocale && propLocale in UI_TEXT ? (propLocale as SupportedLocale) : 'de';
//   const t = UI_TEXT[locale];

//   const [isOpen, setIsOpen] = useState(false);
//   const [showTeaser, setShowTeaser] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(() => generateSessionId());
//   const [inputMode, setInputMode] = useState<InputMode>('text');

//   const { height: vpHeight, keyboardOpen, isMobile } = useMobileViewport();

//   const panelRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);

//   const [dragY, setDragY] = useState(0);

//   const [showVoiceDebug, setShowVoiceDebug] = useState(false);
//   const [voiceDebugInfo, setVoiceDebugInfo] = useState<VoiceMicDebugInfo | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLTextAreaElement>(null);
//   const voiceButtonRef = useRef<VoiceButtonHandle | null>(null);

//   const teaserTimerRef = useRef<number | null>(null);
//   const teaserShownRef = useRef(false);

//   const chatAutoGreetingTimerRef = useRef<number | null>(null);
//   const chatAutoGreetingShownRef = useRef(false);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Focus input when opening (only in text mode)
//   useEffect(() => {
//     if (isOpen && inputMode === 'text') {
//       setTimeout(() => inputRef.current?.focus(), 280);
//     }
//   }, [isOpen, inputMode]);

//   // Welcome message on first open
//   useEffect(() => {
//     if (isOpen && messages.length === 0) {
//       chatAutoGreetingShownRef.current = false;
//       setMessages([
//         {
//           id: 'welcome',
//           role: 'assistant',
//           content: t.welcome,
//           timestamp: new Date(),
//         },
//       ]);
//     }
//   }, [isOpen, messages.length, t.welcome]);

//   // Teaser bubble on the page (6–10s): appears before opening chat, then disappears on interaction.
//   useEffect(() => {
//     // Persist: do not show again if user interacted in this session.
//     const key = 'ph_chat_interacted';
//     const already = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
//     if (already) {
//       teaserShownRef.current = true;
//       return;
//     }

//     // Clear timer when chat opens
//     if (isOpen) {
//       setShowTeaser(false);
//       if (teaserTimerRef.current !== null) {
//         window.clearTimeout(teaserTimerRef.current);
//         teaserTimerRef.current = null;
//       }
//       return;
//     }

//     // Show only once per page load
//     if (teaserShownRef.current) return;

//     const delay = randomDelayBetween(6000, 10000);
//     teaserTimerRef.current = window.setTimeout(() => {
//       if (isOpen) return;
//       teaserShownRef.current = true;
//       setShowTeaser(true);
//       teaserTimerRef.current = null;
//     }, delay);

//     return () => {
//       if (teaserTimerRef.current !== null) {
//         window.clearTimeout(teaserTimerRef.current);
//         teaserTimerRef.current = null;
//       }
//     };
//   }, [isOpen]);

//   // Auto-greeting (8–12s): only when chat is open and user has not sent anything yet.
//   useEffect(() => {
//     if (!isOpen) {
//       if (chatAutoGreetingTimerRef.current !== null) {
//         window.clearTimeout(chatAutoGreetingTimerRef.current);
//         chatAutoGreetingTimerRef.current = null;
//       }
//       return;
//     }

//     const hasUserInteracted = messages.some((msg) => msg.role === 'user');
//     const hasOnlyWelcome =
//       messages.length === 1 && messages[0]?.role === 'assistant' && messages[0]?.id === 'welcome';

//     if (!hasOnlyWelcome || hasUserInteracted || chatAutoGreetingShownRef.current) {
//       if (chatAutoGreetingTimerRef.current !== null) {
//         window.clearTimeout(chatAutoGreetingTimerRef.current);
//         chatAutoGreetingTimerRef.current = null;
//       }
//       return;
//     }

//     const delay = randomDelayBetween(AUTO_GREETING_MIN_MS, AUTO_GREETING_MAX_MS);
//     chatAutoGreetingTimerRef.current = window.setTimeout(() => {
//       setMessages((prev) => {
//         const userInteractedNow = prev.some((msg) => msg.role === 'user');
//         const stillOnlyWelcome =
//           prev.length === 1 && prev[0]?.role === 'assistant' && prev[0]?.id === 'welcome';

//         if (userInteractedNow || !stillOnlyWelcome || chatAutoGreetingShownRef.current) return prev;

//         chatAutoGreetingShownRef.current = true;
//         return [
//           ...prev,
//           {
//             id: `auto-greeting-${Date.now()}`,
//             role: 'assistant',
//             content: t.autoGreeting,
//             timestamp: new Date(),
//           },
//         ];
//       });
//       chatAutoGreetingTimerRef.current = null;
//     }, delay);

//     return () => {
//       if (chatAutoGreetingTimerRef.current !== null) {
//         window.clearTimeout(chatAutoGreetingTimerRef.current);
//         chatAutoGreetingTimerRef.current = null;
//       }
//     };
//   }, [isOpen, messages, t.autoGreeting]);

//   // Lock body scroll on mobile when chat is open
//   useEffect(() => {
//     if (!isMobile) return;
//     if (isOpen) {
//       const scrollY = window.scrollY;
//       document.body.style.overflow = 'hidden';
//       document.body.style.position = 'fixed';
//       document.body.style.width = '100%';
//       document.body.style.top = `-${scrollY}px`;
//       return () => {
//         const top = document.body.style.top;
//         document.body.style.overflow = '';
//         document.body.style.position = '';
//         document.body.style.width = '';
//         document.body.style.top = '';
//         const restoreY = top ? parseInt(top, 10) * -1 : scrollY;
//         window.scrollTo(0, restoreY);
//       };
//     }
//   }, [isOpen, isMobile]);

//   // Auto-scroll when keyboard opens
//   useEffect(() => {
//     if (keyboardOpen) {
//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 100);
//     }
//   }, [keyboardOpen]);

//   // Debug panel visibility for admins/support:
//   // - always on in /admin
//   // - can be enabled on public pages via ?voiceDebug=1 or localStorage.voice_debug=1
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const debugByPath = window.location.pathname.startsWith('/admin');
//     const debugByQuery = new URLSearchParams(window.location.search).get('voiceDebug') === '1';
//     const debugByStorage = window.localStorage.getItem('voice_debug') === '1';
//     setShowVoiceDebug(debugByPath || debugByQuery || debugByStorage);
//   }, []);

//   const handleNewChat = useCallback(() => {
//     if (chatAutoGreetingTimerRef.current !== null) {
//       window.clearTimeout(chatAutoGreetingTimerRef.current);
//       chatAutoGreetingTimerRef.current = null;
//     }
//     chatAutoGreetingShownRef.current = false;

//     setSessionId(generateSessionId());
//     setMessages([
//       {
//         id: 'welcome',
//         role: 'assistant',
//         content: t.welcome,
//         timestamp: new Date(),
//       },
//     ]);
//     setInput('');
//     setIsLoading(false);
//     setInputMode('text');
//     setDragY(0);
//   }, [t.welcome]);

//   // ─── Core send logic ─────────────────────────────────────────

//   const sendMessage = useCallback(
//     async (text: string) => {
//       setIsLoading(true);

//       try {
//         const res = await fetch(API_URL, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             sessionId,
//             message: text,
//             locale,
//           }),
//         });

//         if (res.status === 429) {
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: `error-${Date.now()}`,
//               role: 'assistant',
//               content: t.rateLimit,
//               timestamp: new Date(),
//             },
//           ]);
//           return;
//         }

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data = await res.json();

//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `ai-${Date.now()}`,
//             role: 'assistant',
//             content: data.text,
//             timestamp: new Date(),
//           },
//         ]);

//         // Switch input mode based on server response
//         if (data.inputMode === 'otp') {
//           setInputMode('otp');
//         } else if (data.inputMode === 'text' || inputMode === 'otp') {
//           setInputMode('text');
//         }
//       } catch (err) {
//         console.error('[ChatWidget] Error:', err);
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `error-${Date.now()}`,
//             role: 'assistant',
//             content: t.error,
//             timestamp: new Date(),
//             isError: true,
//           },
//         ]);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [sessionId, locale, t, inputMode],
//   );

//   // ─── Text input handlers ──────────────────────────────────────

//   const handleOptionClick = useCallback(
//     (text: string) => {
//       if (isLoading) return;

//       if (text.trim().toLowerCase() === MIC_ENABLE_OPTION_TEXT[locale].toLowerCase()) {
//         // If browser already stores a hard "denied", open settings directly.
//         if (voiceDebugInfo?.code === 'not-allowed' && voiceDebugInfo.permissionState === 'denied') {
//           const opened = tryOpenMicSettings();
//           if (!opened) {
//             setMessages((prev) => [
//               ...prev,
//               {
//                 id: `mic-help-${Date.now()}`,
//                 role: 'assistant',
//                 content: MIC_SETTINGS_HELP_TEXT[locale],
//                 timestamp: new Date(),
//                 isError: false,
//               },
//             ]);
//           }
//           return;
//         }

//         voiceButtonRef.current?.requestMicAccess();
//         return;
//       }

//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: text,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(text);
//     },
//     [isLoading, sendMessage, locale, voiceDebugInfo],
//   );

//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || isLoading) return;

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: text,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     sendMessage(text);
//   }, [input, isLoading, sendMessage]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   // ─── OTP handlers ─────────────────────────────────────────────

//   const handleOtpSubmit = useCallback(
//     (code: string) => {
//       if (isLoading) return;
//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: code,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(code);
//     },
//     [isLoading, sendMessage],
//   );

//   const handleOtpResend = useCallback(() => {
//     if (isLoading) return;
//     const resendText = locale === 'ru' ? 'отправь код ещё раз' : locale === 'en' ? 'send code again' : 'Code erneut senden';

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: resendText,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMsg]);
//     sendMessage(resendText);
//   }, [isLoading, locale, sendMessage]);

//   // ─── Voice handlers ───────────────────────────────────────────

//   const handleVoiceResult = useCallback(
//     (result: { transcript: string; text: string; inputMode?: string }) => {
//       setVoiceDebugInfo(null);

//       if (result.transcript) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `user-voice-${Date.now()}`,
//             role: 'user',
//             content: `🎙 ${result.transcript}`,
//             timestamp: new Date(),
//           },
//         ]);
//       }

//       setMessages((prev) => [
//         ...prev,
//         {
//           id: `ai-voice-${Date.now()}`,
//           role: 'assistant',
//           content: result.text,
//           timestamp: new Date(),
//         },
//       ]);

//       if (result.inputMode === 'otp') setInputMode('otp');
//       if (result.inputMode === 'text') setInputMode('text');
//     },
//     [],
//   );

//   const handleVoiceError = useCallback(
//     (error: string, code?: VoiceMicErrorCode) => {
//       const withAction = code ? MIC_ACTIONABLE_ERROR_CODES.has(code) : false;
//       const content = withAction ? `${error}\n\n[option] 🎙 ${MIC_ENABLE_OPTION_TEXT[locale]} [/option]` : error;

//       setMessages((prev) => {
//         const last = prev[prev.length - 1];
//         if (last?.role === 'assistant' && last.content === content) return prev;

//         return [
//           ...prev,
//           {
//             id: `error-voice-${Date.now()}`,
//             role: 'assistant',
//             content,
//             timestamp: new Date(),
//             isError: !withAction,
//           },
//         ];
//       });
//     },
//     [locale],
//   );

//   const handleVoiceDebug = useCallback((info: VoiceMicDebugInfo) => {
//     setVoiceDebugInfo(info);
//   }, []);

//   // ─── Swipe-to-close (mobile) ──────────────────────────────
//   const handleDragEnd = useCallback(
//     (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
//       if (info.offset.y > 100 || info.velocity.y > 500) {
//         setIsOpen(false);
//       }
//       setDragY(0);
//     },
//     [],
//   );

//   // ─── Render helpers ───────────────────────────────────────────

//   const openChat = useCallback(() => {
//     setIsOpen(true);
//     setShowTeaser(false);
//     teaserShownRef.current = true;

//     if (typeof window !== 'undefined') window.sessionStorage.setItem('ph_chat_interacted', '1');

//     if (teaserTimerRef.current !== null) {
//       window.clearTimeout(teaserTimerRef.current);
//       teaserTimerRef.current = null;
//     }
//   }, []);

//   const closeChat = useCallback(() => {
//     setIsOpen(false);
//   }, []);

//   // typing bubble (ultra-premium)
//   const TypingBubble = (
//     <div className="mb-3 flex items-start gap-2">
//       <div
//         className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
//         style={{ background: THEME.accentGradient, boxShadow: '0 10px 22px rgba(236,72,153,0.18)' }}
//       >
//         E
//       </div>
//       <div
//         className="rounded-2xl rounded-tl-sm px-3 py-2"
//         style={{
//           background: 'rgba(255,255,255,0.82)',
//           border: '1px solid rgba(236,72,153,0.14)',
//           boxShadow: '0 10px 22px rgba(15,23,42,0.05)',
//         }}
//       >
//         <div className="flex gap-1">
//           <span className="inline-block h-2 w-2 animate-bounce rounded-full" style={{ background: 'rgba(236,72,153,0.50)', animationDelay: '0ms' }} />
//           <span className="inline-block h-2 w-2 animate-bounce rounded-full" style={{ background: 'rgba(236,72,153,0.50)', animationDelay: '150ms' }} />
//           <span className="inline-block h-2 w-2 animate-bounce rounded-full" style={{ background: 'rgba(236,72,153,0.50)', animationDelay: '300ms' }} />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* ── Teaser bubble (page) ───────────────────────────── */}
//       <AnimatePresence>
//         {!isOpen && showTeaser && (
//           <motion.div
//             key="chat-teaser"
//             initial={{ opacity: 0, y: 10, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.98 }}
//             transition={{ duration: 0.22 }}
//             className="fixed bottom-24 right-6 z-50 max-w-[320px] rounded-2xl px-4 py-3 text-sm backdrop-blur-md sm:bottom-28"
//             style={{
//               background:
//                 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(252,228,236,0.88) 55%, rgba(255,247,250,0.92) 100%)',
//               border: '1px solid rgba(236,72,153,0.18)',
//               boxShadow: '0 18px 50px rgba(236,72,153,0.16), 0 8px 20px rgba(15,23,42,0.08)',
//               color: THEME.mainText,
//             }}
//           >
//             <div className="flex items-start gap-3">
//               <div
//                 className="mt-0.5 h-8 w-8 flex-none rounded-full"
//                 style={{ background: THEME.accentGradient, boxShadow: '0 10px 22px rgba(236,72,153,0.18)' }}
//               />
//               <div className="leading-snug">
//                 <div className="text-[12px] font-semibold" style={{ color: THEME.mainText }}>
//                   Elen‑AI
//                 </div>
//                 <div className="mt-0.5" style={{ color: THEME.softText }}>
//                   {(() => {
//                     const path = typeof window !== 'undefined' ? window.location.pathname : '';
//                     if (path.includes('/prices')) return t.teaserPrices;
//                     if (path.includes('/booking')) return t.teaserBooking;
//                     return t.teaserDefault;
//                   })()}
//                 </div>
//               </div>
//             </div>

//             <div className="mt-2 flex gap-2">
//               <button
//                 type="button"
//                 onClick={openChat}
//                 className="relative overflow-hidden rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-transform active:scale-[0.99]"
//                 style={{
//                   background: THEME.accentGradient,
//                   boxShadow: THEME.accentShadow,
//                 }}
//               >
//                 <span
//                   className="pointer-events-none absolute inset-0 opacity-40"
//                   style={{
//                     background:
//                       'radial-gradient(120px 80px at 20% 10%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)',
//                   }}
//                 />
//                 <span className="relative">{t.openChat}</span>
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setShowTeaser(false)}
//                 className="rounded-xl px-3 py-1.5 text-xs font-medium"
//                 style={{ color: THEME.softText }}
//               >
//                 {t.later}
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Floating Button ───────────────────────────────── */}
//       <AnimatePresence>
//         {!isOpen && (
//           <motion.button
//             key="chat-launcher"
//             initial={{ scale: 0, opacity: 0, y: 10 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0, opacity: 0, y: 10 }}
//             whileHover={{ scale: 1.06 }}
//             whileTap={{ scale: 0.96 }}
//             onClick={openChat}
//             className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full"
//             style={{
//               bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
//               right: 'max(1.5rem, env(safe-area-inset-right, 1.5rem))',
//               background: THEME.accentGradient,
//               border: '1px solid rgba(255,255,255,0.55)',
//               boxShadow: '0 22px 60px rgba(236,72,153,0.30), 0 10px 24px rgba(15,23,42,0.12)',
//             }}
//             aria-label="Open chat"
//           >
//             <span
//               className="pointer-events-none absolute inset-0 rounded-full opacity-50"
//               style={{
//                 background:
//                   'radial-gradient(120px 80px at 20% 10%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)',
//               }}
//             />
//             <MessageCircle className="relative h-6 w-6 text-white" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* ── Chat Panel ────────────────────────────────────── */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             ref={panelRef}
//             initial={{ opacity: 0, y: 20, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.98 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 320 }}
//             className="fixed bottom-0 right-0 z-50 flex w-full flex-col sm:bottom-0 sm:right-6 sm:h-[620px] sm:w-[410px] sm:rounded-[28px]"
//             style={{
//               height: isMobile ? `${vpHeight}px` : undefined,
//               background: THEME.panelBg,
//               border: THEME.panelBorder,
//               boxShadow: THEME.panelShadow,
//               backdropFilter: 'blur(14px)',
//               paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : undefined,
//               paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
//             }}
//           >
//             {/* Header */}
//             <motion.div
//               ref={headerRef}
//               drag={isMobile ? 'y' : false}
//               dragConstraints={{ top: 0, bottom: 0 }}
//               dragElastic={0.2}
//               onDrag={(_event, info: { offset: { y: number } }) => setDragY(info.offset.y)}
//               onDragEnd={handleDragEnd}
//               className="relative flex touch-none items-center justify-between px-4 py-3 sm:px-5"
//               style={{
//                 background: THEME.headerBg,
//                 borderBottom: THEME.headerBorder,
//                 cursor: isMobile ? 'grab' : 'default',
//               }}
//             >
//               {isMobile && (
//                 <div
//                   className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full"
//                   style={{ background: 'rgba(236,72,153,0.30)', opacity: dragY > 0 ? 1 : 0.7 }}
//                 />
//               )}

//               <div className="flex items-center gap-3">
//                 <div
//                   className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
//                   style={{ background: THEME.accentGradient, boxShadow: '0 10px 22px rgba(236,72,153,0.18)' }}
//                 >
//                   E
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold" style={{ color: THEME.mainText }}>
//                     {t.title}
//                   </h3>
//                   <p className="text-xs" style={{ color: THEME.softText }}>
//                     {t.subtitle}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={handleNewChat}
//                   className="rounded-xl p-2 transition-transform active:scale-[0.98]"
//                   title={t.newChat}
//                   style={{
//                     border: '1px solid rgba(236,72,153,0.14)',
//                     background: 'rgba(255,255,255,0.70)',
//                     boxShadow: '0 10px 22px rgba(15,23,42,0.05)',
//                     color: THEME.softText,
//                   }}
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                 </button>

//                 <button
//                   onClick={closeChat}
//                   className="rounded-xl p-2 transition-transform active:scale-[0.98]"
//                   aria-label="Close chat"
//                   style={{
//                     border: '1px solid rgba(236,72,153,0.14)',
//                     background: 'rgba(255,255,255,0.70)',
//                     boxShadow: '0 10px 22px rgba(15,23,42,0.05)',
//                     color: THEME.softText,
//                   }}
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </motion.div>

//             {/* Messages */}
//             <div
//               className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5"
//               style={{ WebkitOverflowScrolling: 'touch' }}
//             >
//               {messages.map((msg, idx) => {
//                 const isLatestAssistant = msg.role === 'assistant' && idx === messages.length - 1;
//                 return (
//                   <ChatMessage
//                     key={msg.id}
//                     message={msg}
//                     onOptionClick={isLatestAssistant ? handleOptionClick : undefined}
//                     isLatest={isLatestAssistant}
//                   />
//                 );
//               })}

//               {isLoading && TypingBubble}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input Area */}
//             <AnimatePresence mode="wait">
//               {inputMode === 'otp' ? (
//                 <OtpInput
//                   key="otp-input"
//                   onSubmit={handleOtpSubmit}
//                   isLoading={isLoading}
//                   locale={locale}
//                   onResend={handleOtpResend}
//                 />
//               ) : (
//                 <motion.div
//                   key="text-input"
//                   initial={{ opacity: 0, y: 8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -8 }}
//                   transition={{ duration: 0.2 }}
//                   className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
//                   style={{
//                     borderTop: '1px solid rgba(236,72,153,0.12)',
//                     background: 'linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(255,247,250,0.86) 100%)',
//                   }}
//                 >
//                   <div className="flex items-end gap-2">
//                     <textarea
//                       ref={inputRef}
//                       value={input}
//                       onChange={(e) => setInput(e.target.value)}
//                       onKeyDown={handleKeyDown}
//                       placeholder={t.placeholder}
//                       rows={1}
//                       disabled={isLoading}
//                       className="flex-1 resize-none rounded-2xl px-3 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
//                       style={{
//                         maxHeight: '100px',
//                         background: 'rgba(255,255,255,0.80)',
//                         border: '1px solid rgba(236,72,153,0.16)',
//                         boxShadow: '0 10px 22px rgba(15,23,42,0.05)',
//                         color: THEME.mainText,
//                       }}
//                       onInput={(e) => {
//                         const el = e.currentTarget;
//                         el.style.height = 'auto';
//                         el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
//                       }}
//                     />

//                     {/* Voice button — shown when input is empty */}
//                     {!input.trim() && (
//                       <div className="flex flex-col items-end gap-1">
//                         <VoiceButton
//                           ref={voiceButtonRef}
//                           onResult={handleVoiceResult}
//                           onError={handleVoiceError}
//                           onDebug={handleVoiceDebug}
//                           sessionId={sessionId}
//                           locale={locale}
//                           disabled={isLoading}
//                         />

//                         {showVoiceDebug && voiceDebugInfo && (
//                           <div
//                             className="max-w-[260px] rounded-xl px-2 py-1 text-[10px] leading-4"
//                             style={{
//                               background: 'rgba(255,255,255,0.70)',
//                               border: '1px solid rgba(236,72,153,0.16)',
//                               color: THEME.softText,
//                             }}
//                           >
//                             <div>{`voice-debug: ${voiceDebugInfo.code}`}</div>
//                             <div>{`name: ${voiceDebugInfo.errorName || '-'}`}</div>
//                             <div>{`perm: ${voiceDebugInfo.permissionState}`}</div>
//                             <div>{`secure: ${voiceDebugInfo.secureContext ? 'yes' : 'no'}, iframe: ${voiceDebugInfo.inIframe ? 'yes' : 'no'}`}</div>
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {/* Send button — shown when there's text */}
//                     <button
//                       onClick={handleSend}
//                       disabled={!input.trim() || isLoading}
//                       className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl transition-transform active:scale-[0.99] disabled:opacity-40"
//                       style={{
//                         background: THEME.accentGradient,
//                         border: '1px solid rgba(236,72,153,0.22)',
//                         boxShadow: '0 18px 40px rgba(236,72,153,0.22)',
//                         display: input.trim() ? 'flex' : 'none',
//                       }}
//                       aria-label="Send"
//                     >
//                       <span
//                         className="pointer-events-none absolute inset-0 opacity-40"
//                         style={{
//                           background:
//                             'radial-gradient(140px 90px at 20% 10%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)',
//                         }}
//                       />
//                       {isLoading ? (
//                         <Loader2 className="relative h-4 w-4 animate-spin text-white" />
//                       ) : (
//                         <Send className="relative h-4 w-4 text-white" />
//                       )}
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }








//----03.03.26 меняю на светлую тему
// // src/components/ai/ChatWidget.tsx
// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
// import { ChatMessage, type Message } from './ChatMessage';
// import { OtpInput } from './OtpInput';
// import {
//   VoiceButton,
//   type VoiceButtonHandle,
//   type VoiceMicDebugInfo,
//   type VoiceMicErrorCode,
// } from './VoiceButton';
// import { useMobileViewport } from '@/hooks/useMobileViewport';

// // ─── Config ─────────────────────────────────────────────────────

// const API_URL = '/api/ai/chat';

// function generateSessionId(): string {
//   return crypto.randomUUID();
// }

// // ─── Translations ───────────────────────────────────────────────

// const UI_TEXT = {
//   de: {
//     placeholder: 'Ihre Nachricht...',
//     welcome: 'Hallo! 👋 Ich bin Elen-AI, Ihr Buchungsassistent. Wie kann ich Ihnen helfen?\n\n[option] 📅 Termin buchen [/option]\n[option] 💬 Beratung & Auswahl [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]',
//     autoGreeting:
//       '🌸 Möchten Sie einen Termin buchen oder Preise erfahren?\n\n[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]',
//     teaserDefault: '🌸 Soll ich Ihnen helfen, schnell einen Termin zu finden?',
//     teaserPrices: '🌸 Möchten Sie Preise für PMU, Brows/Lashes oder Hydrafacial?',
//     teaserBooking: '🌸 Soll ich Ihnen bei der Terminwahl helfen?',
//     error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
//     rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
//     title: 'Salon Elen',
//     subtitle: 'Buchungsassistent',
//     newChat: 'Neuer Chat',
//   },
//   ru: {
//     placeholder: 'Ваше сообщение...',
//     welcome: 'Привет! 👋 Я Elen-AI, ассистент записи. Чем могу помочь?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💬 Консультация и подбор [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]',
//     autoGreeting:
//       '🌸 Хотите записаться на приём или узнать цены?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]',
//     teaserDefault: '🌸 Хотите, я помогу быстро подобрать удобный термин?',
//     teaserPrices: '🌸 Подсказать цены на PMU, брови/ресницы или Hydrafacial?',
//     teaserBooking: '🌸 Помочь выбрать дату и время?',
//     error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
//     rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
//     title: 'Salon Elen',
//     subtitle: 'Ассистент записи',
//     newChat: 'Новый чат',
//   },
//   en: {
//     placeholder: 'Your message...',
//     welcome: 'Hello! 👋 I\'m Elen-AI, your booking assistant. How can I help?\n\n[option] 📅 Book an appointment [/option]\n[option] 💬 Consultation & guidance [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Location & hours [/option]',
//     autoGreeting:
//       '🌸 Would you like to book an appointment or check prices?\n\n[option] 📅 Book an appointment [/option]\n[option] 💅 Services & prices [/option]',
//     teaserDefault: '🌸 Would you like help finding a suitable appointment?',
//     teaserPrices: '🌸 Would you like prices for PMU, brows/lashes or Hydrafacial?',
//     teaserBooking: '🌸 Would you like help choosing a time?',
//     error: 'Sorry, something went wrong. Please try again.',
//     rateLimit: 'Please wait a moment before sending a new message.',
//     title: 'Salon Elen',
//     subtitle: 'Booking Assistant',
//     newChat: 'New Chat',
//   },
// } as const;

// type SupportedLocale = keyof typeof UI_TEXT;

// const MIC_ENABLE_OPTION_TEXT: Record<SupportedLocale, string> = {
//   de: 'Mikrofon aktivieren',
//   ru: 'Включить микрофон',
//   en: 'Enable microphone',
// };

// const MIC_SETTINGS_HELP_TEXT: Record<SupportedLocale, string> = {
//   de:
//     'Öffnen Sie die Website-Berechtigungen (Schloss-Symbol in der Adresszeile), erlauben Sie das Mikrofon und laden Sie die Seite neu.',
//   ru:
//     'Откройте разрешения сайта (значок замка в адресной строке), включите микрофон и обновите страницу.',
//   en:
//     'Open site permissions (lock icon in the address bar), allow microphone access, then reload the page.',
// };

// const MIC_ACTIONABLE_ERROR_CODES = new Set<VoiceMicErrorCode>([
//   'not-allowed',
//   'not-found',
//   'in-use',
//   'insecure-context',
//   'unsupported',
//   'iframe-blocked',
// ]);

// const AUTO_GREETING_MIN_MS = 8000;
// const AUTO_GREETING_MAX_MS = 12000;

// function randomDelayBetween(min: number, max: number): number {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function resolveMicSettingsUrl(): string | null {
//   if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;

//   const ua = navigator.userAgent.toLowerCase();
//   const origin = encodeURIComponent(window.location.origin);

//   const isChromium =
//     (ua.includes('chrome') || ua.includes('chromium') || ua.includes('edg') || ua.includes('opr')) &&
//     !ua.includes('firefox');

//   if (isChromium) {
//     return `chrome://settings/content/siteDetails?site=${origin}`;
//   }
//   if (ua.includes('firefox')) {
//     return 'about:preferences#privacy';
//   }

//   return null;
// }

// function tryOpenMicSettings(): boolean {
//   if (typeof window === 'undefined') return false;
//   const url = resolveMicSettingsUrl();
//   if (!url) return false;

//   try {
//     window.location.assign(url);
//     return true;
//   } catch {
//     return false;
//   }
// }

// // ─── Types ──────────────────────────────────────────────────────

// type InputMode = 'text' | 'otp';

// // ─── Component ──────────────────────────────────────────────────

// interface ChatWidgetProps {
//   locale?: string;
// }

// export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
//   const locale: SupportedLocale =
//     propLocale && propLocale in UI_TEXT
//       ? (propLocale as SupportedLocale)
//       : 'de';
//   const t = UI_TEXT[locale];

//   const [isOpen, setIsOpen] = useState(false);
//   const [showTeaser, setShowTeaser] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(() => generateSessionId());
//   const [inputMode, setInputMode] = useState<InputMode>('text');
//   const { height: vpHeight, keyboardOpen, isMobile } = useMobileViewport();
//   const panelRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);
//   const [dragY, setDragY] = useState(0);
//   const [showVoiceDebug, setShowVoiceDebug] = useState(false);
//   const [voiceDebugInfo, setVoiceDebugInfo] = useState<VoiceMicDebugInfo | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLTextAreaElement>(null);
//   const voiceButtonRef = useRef<VoiceButtonHandle | null>(null);
//   const teaserTimerRef = useRef<number | null>(null);
//   const teaserShownRef = useRef(false);
//   const chatAutoGreetingTimerRef = useRef<number | null>(null);
//   const chatAutoGreetingShownRef = useRef(false);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Focus input when opening (only in text mode)
//   useEffect(() => {
//     if (isOpen && inputMode === 'text') {
//       setTimeout(() => inputRef.current?.focus(), 300);
//     }
//   }, [isOpen, inputMode]);

//   // Welcome message on first open
//   useEffect(() => {
//     if (isOpen && messages.length === 0) {
//       chatAutoGreetingShownRef.current = false;
//       setMessages([
//         {
//           id: 'welcome',
//           role: 'assistant',
//           content: t.welcome,
//           timestamp: new Date(),
//         },
//       ]);
//     }
//   }, [isOpen, messages.length, t.welcome]);

//   // Teaser bubble on the page (6–10s): appears before opening chat, then disappears on interaction.
//   useEffect(() => {
//     // Clear timer when chat opens
//     if (isOpen) {
//       setShowTeaser(false);
//       if (teaserTimerRef.current !== null) {
//         window.clearTimeout(teaserTimerRef.current);
//         teaserTimerRef.current = null;
//       }
//       return;
//     }

//     // Show only once per page load
//     if (teaserShownRef.current) return;

//     const delay = randomDelayBetween(6000, 10000);
//     teaserTimerRef.current = window.setTimeout(() => {
//       if (isOpen) return;
//       teaserShownRef.current = true;
//       setShowTeaser(true);
//       teaserTimerRef.current = null;
//     }, delay);

//     return () => {
//       if (teaserTimerRef.current !== null) {
//         window.clearTimeout(teaserTimerRef.current);
//         teaserTimerRef.current = null;
//       }
//     };
//   }, [isOpen]);

//   // Auto-greeting (8–12s): only when chat is open and user has not sent anything yet.
//   useEffect(() => {
//     if (!isOpen) {
//       if (chatAutoGreetingTimerRef.current !== null) {
//         window.clearTimeout(chatAutoGreetingTimerRef.current);
//         chatAutoGreetingTimerRef.current = null;
//       }
//       return;
//     }

//     const hasUserInteracted = messages.some((msg) => msg.role === 'user');
//     const hasOnlyWelcome =
//       messages.length === 1 &&
//       messages[0]?.role === 'assistant' &&
//       messages[0]?.id === 'welcome';

//     if (!hasOnlyWelcome || hasUserInteracted || chatAutoGreetingShownRef.current) {
//       if (chatAutoGreetingTimerRef.current !== null) {
//         window.clearTimeout(chatAutoGreetingTimerRef.current);
//         chatAutoGreetingTimerRef.current = null;
//       }
//       return;
//     }

//     const delay = randomDelayBetween(AUTO_GREETING_MIN_MS, AUTO_GREETING_MAX_MS);
//     chatAutoGreetingTimerRef.current = window.setTimeout(() => {
//       setMessages((prev) => {
//         const userInteracted = prev.some((msg) => msg.role === 'user');
//         const stillOnlyWelcome =
//           prev.length === 1 &&
//           prev[0]?.role === 'assistant' &&
//           prev[0]?.id === 'welcome';

//         if (userInteracted || !stillOnlyWelcome || chatAutoGreetingShownRef.current) {
//           return prev;
//         }

//         chatAutoGreetingShownRef.current = true;
//         return [
//           ...prev,
//           {
//             id: `auto-greeting-${Date.now()}`,
//             role: 'assistant',
//             content: t.autoGreeting,
//             timestamp: new Date(),
//           },
//         ];
//       });
//       chatAutoGreetingTimerRef.current = null;
//     }, delay);

//     return () => {
//       if (chatAutoGreetingTimerRef.current !== null) {
//         window.clearTimeout(chatAutoGreetingTimerRef.current);
//         chatAutoGreetingTimerRef.current = null;
//       }
//     };
//   }, [isOpen, messages, t.autoGreeting]);

//   // Lock body scroll on mobile when chat is open
//   useEffect(() => {
//     if (!isMobile) return;
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//       // Prevent iOS bounce / pull-to-refresh
//       document.body.style.position = 'fixed';
//       document.body.style.width = '100%';
//       document.body.style.top = `-${window.scrollY}px`;
//     }
//     return () => {
//       const scrollY = document.body.style.top;
//       document.body.style.overflow = '';
//       document.body.style.position = '';
//       document.body.style.width = '';
//       document.body.style.top = '';
//       if (scrollY) {
//         window.scrollTo(0, parseInt(scrollY, 10) * -1);
//       }
//     };
//   }, [isOpen, isMobile]);

//   // Auto-scroll when keyboard opens
//   useEffect(() => {
//     if (keyboardOpen) {
//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 100);
//     }
//   }, [keyboardOpen]);

//   // Debug panel visibility for admins/support:
//   // - always on in /admin
//   // - can be enabled on public pages via ?voiceDebug=1 or localStorage.voice_debug=1
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const debugByPath = window.location.pathname.startsWith('/admin');
//     const debugByQuery = new URLSearchParams(window.location.search).get('voiceDebug') === '1';
//     const debugByStorage = window.localStorage.getItem('voice_debug') === '1';
//     setShowVoiceDebug(debugByPath || debugByQuery || debugByStorage);
//   }, []);

//   const handleNewChat = useCallback(() => {
//     if (chatAutoGreetingTimerRef.current !== null) {
//       window.clearTimeout(chatAutoGreetingTimerRef.current);
//       chatAutoGreetingTimerRef.current = null;
//     }
//     chatAutoGreetingShownRef.current = false;
//     setSessionId(generateSessionId());
//     setMessages([
//       {
//         id: 'welcome',
//         role: 'assistant',
//         content: t.welcome,
//         timestamp: new Date(),
//       },
//     ]);
//     setInput('');
//     setIsLoading(false);
//     setInputMode('text');
//     setDragY(0);
//   }, [t.welcome]);

//   // ─── Core send logic ─────────────────────────────────────────

//   const sendMessage = useCallback(
//     async (text: string) => {
//       setIsLoading(true);

//       try {
//         const res = await fetch(API_URL, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             sessionId,
//             message: text,
//             locale,
//           }),
//         });

//         if (res.status === 429) {
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: `error-${Date.now()}`,
//               role: 'assistant',
//               content: t.rateLimit,
//               timestamp: new Date(),
//             },
//           ]);
//           return;
//         }

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}`);
//         }

//         const data = await res.json();

//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `ai-${Date.now()}`,
//             role: 'assistant',
//             content: data.text,
//             timestamp: new Date(),
//           },
//         ]);

//         // Switch input mode based on server response
//         if (data.inputMode === 'otp') {
//           setInputMode('otp');
//         } else if (data.inputMode === 'text' || inputMode === 'otp') {
//           setInputMode('text');
//         }
//       } catch (err) {
//         console.error('[ChatWidget] Error:', err);
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `error-${Date.now()}`,
//             role: 'assistant',
//             content: t.error,
//             timestamp: new Date(),
//             isError: true,
//           },
//         ]);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [sessionId, locale, t, inputMode],
//   );

//   // ─── Text input handlers ──────────────────────────────────────

//   const handleOptionClick = useCallback(
//     (text: string) => {
//       if (isLoading) return;

//       if (text.trim().toLowerCase() === MIC_ENABLE_OPTION_TEXT[locale].toLowerCase()) {
//         // If browser already stores a hard "denied", open settings directly.
//         if (
//           voiceDebugInfo?.code === 'not-allowed' &&
//           voiceDebugInfo.permissionState === 'denied'
//         ) {
//           const opened = tryOpenMicSettings();
//           if (!opened) {
//             setMessages((prev) => [
//               ...prev,
//               {
//                 id: `mic-help-${Date.now()}`,
//                 role: 'assistant',
//                 content: MIC_SETTINGS_HELP_TEXT[locale],
//                 timestamp: new Date(),
//                 isError: false,
//               },
//             ]);
//           }
//           return;
//         }

//         voiceButtonRef.current?.requestMicAccess();
//         return;
//       }

//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: text,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(text);
//     },
//     [isLoading, sendMessage, locale, voiceDebugInfo],
//   );

//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || isLoading) return;

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: text,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     sendMessage(text);
//   }, [input, isLoading, sendMessage]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   // ─── OTP handlers ─────────────────────────────────────────────

//   const handleOtpSubmit = useCallback(
//     (code: string) => {
//       if (isLoading) return;
//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: code,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(code);
//     },
//     [isLoading, sendMessage],
//   );

//   const handleOtpResend = useCallback(() => {
//     if (isLoading) return;
//     const resendText =
//       locale === 'ru'
//         ? 'отправь код ещё раз'
//         : locale === 'en'
//           ? 'send code again'
//           : 'Code erneut senden';

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: resendText,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMsg]);
//     sendMessage(resendText);
//   }, [isLoading, locale, sendMessage]);

//   // ─── Voice handlers ───────────────────────────────────────────

//   const handleVoiceResult = useCallback(
//     (result: { transcript: string; text: string; inputMode?: string }) => {
//       setVoiceDebugInfo(null);

//       // Add user message (transcribed text)
//       if (result.transcript) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `user-voice-${Date.now()}`,
//             role: 'user',
//             content: `🎙 ${result.transcript}`,
//             timestamp: new Date(),
//           },
//         ]);
//       }

//       // Add AI response
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: `ai-voice-${Date.now()}`,
//           role: 'assistant',
//           content: result.text,
//           timestamp: new Date(),
//         },
//       ]);

//       // Update input mode
//       if (result.inputMode === 'otp') {
//         setInputMode('otp');
//       } else if (result.inputMode === 'text') {
//         setInputMode('text');
//       }
//     },
//     [],
//   );

//   const handleVoiceError = useCallback(
//     (error: string, code?: VoiceMicErrorCode) => {
//       const withAction = code ? MIC_ACTIONABLE_ERROR_CODES.has(code) : false;
//       const content = withAction
//         ? `${error}\n\n[option] 🎙 ${MIC_ENABLE_OPTION_TEXT[locale]} [/option]`
//         : error;

//       setMessages((prev) => {
//         const last = prev[prev.length - 1];
//         if (last?.role === 'assistant' && last.content === content) {
//           return prev;
//         }

//         return [
//           ...prev,
//           {
//             id: `error-voice-${Date.now()}`,
//             role: 'assistant',
//             content,
//             timestamp: new Date(),
//             isError: !withAction,
//           },
//         ];
//       });
//     },
//     [locale],
//   );

//   const handleVoiceDebug = useCallback((info: VoiceMicDebugInfo) => {
//     setVoiceDebugInfo(info);
//   }, []);

//   // ─── Swipe-to-close (mobile) ──────────────────────────────
//   const handleDragEnd = useCallback(
//     (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
//       // Close if dragged >100px down or fast swipe
//       if (info.offset.y > 100 || info.velocity.y > 500) {
//         setIsOpen(false);
//       }
//       setDragY(0);
//     },
//     [],
//   );

//   // ─── Render ───────────────────────────────────────────────────

//   const openChat = useCallback(() => {
//     setIsOpen(true);
//     setShowTeaser(false);
//     teaserShownRef.current = true;
//     if (teaserTimerRef.current !== null) {
//       window.clearTimeout(teaserTimerRef.current);
//       teaserTimerRef.current = null;
//     }
//   }, []);

//   const closeChat = useCallback(() => {
//     setIsOpen(false);
//   }, []);


//   return (
//     <>
//       {/* ── Floating Button ───────────────────────────────── */}
//       <AnimatePresence>

//         {!isOpen && showTeaser && (
//           <motion.div
//             key="chat-teaser"
//             initial={{ opacity: 0, y: 10, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.98 }}
//             transition={{ duration: 0.22 }}
//             className="fixed bottom-24 right-6 z-50 max-w-[280px] rounded-2xl border border-white/15 bg-black/70 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md sm:bottom-28 sm:right-6"
//           >
//             <div className="flex items-start gap-3">
//               <div className="mt-0.5 h-2.5 w-2.5 flex-none rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
//               <div className="leading-snug">
//                 {(() => {
//                   const path = typeof window !== 'undefined' ? window.location.pathname : '';
//                   if (path.includes('/prices')) return t.teaserPrices;
//                   if (path.includes('/booking')) return t.teaserBooking;
//                   return t.teaserDefault;
//                 })()}
//               </div>
//             </div>
//             <div className="mt-2 flex gap-2">
//               <button
//                 type="button"
//                 onClick={openChat}
//                 className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
//               >
//                 {locale === 'de' ? 'Chat öffnen' : locale === 'ru' ? 'Открыть чат' : 'Open chat'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowTeaser(false)}
//                 className="rounded-xl px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white"
//               >
//                 {locale === 'de' ? 'Später' : locale === 'ru' ? 'Позже' : 'Later'}
//               </button>
//             </div>
//           </motion.div>
//         )}
//         {!isOpen && (
//           <motion.button
//             key="chat-launcher"
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0, opacity: 0 }}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={openChat}
//             className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl sm:h-16 sm:w-16"
//             style={{
//               bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
//               right: 'max(1.5rem, env(safe-area-inset-right, 1.5rem))',
//               background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
//               boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
//             }}
//             aria-label="Chat öffnen"
//           >
//             <MessageCircle className="h-6 w-6 text-gray-900 sm:h-7 sm:w-7" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* ── Chat Panel ────────────────────────────────────── */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             ref={panelRef}
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//             className="fixed bottom-0 right-0 z-50 flex w-full flex-col sm:bottom-0 sm:right-6 sm:h-[540px] sm:w-[360px] sm:rounded-2xl"
//             style={{
//               height: isMobile ? `${vpHeight}px` : undefined,
//               background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
//               border: '1px solid rgba(255, 215, 0, 0.15)',
//               boxShadow:
//                 '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.08)',
//               paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : undefined,
//               paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
//             }}
//           >
//             {/* ── Header ──────────────────────────────────── */}
//             <motion.div
//               ref={headerRef}
//               drag={isMobile ? 'y' : false}
//               dragConstraints={{ top: 0, bottom: 0 }}
//               dragElastic={0.2}
//               onDrag={(_event, info: { offset: { y: number } }) => setDragY(info.offset.y)}
//               onDragEnd={handleDragEnd}
//               className="relative flex cursor-grab touch-none items-center justify-between rounded-t-none px-4 py-3 active:cursor-grabbing sm:cursor-default sm:rounded-t-2xl"
//               style={{
//                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
//                 borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
//               }}
//             >
//               {/* Drag indicator — mobile only */}
//               {isMobile && (
//                 <div
//                   className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full bg-white/20"
//                   style={{ opacity: dragY > 0 ? 1 : 0.65 }}
//                 />
//               )}
//               <div className="flex items-center gap-3">
//                 <div
//                   className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-gray-900"
//                   style={{
//                     background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                   }}
//                 >
//                   E
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold text-white">
//                     {t.title}
//                   </h3>
//                   <p className="text-xs text-gray-400">{t.subtitle}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={handleNewChat}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   title={t.newChat}
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={closeChat}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   aria-label="Chat schließen"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </motion.div>

//             {/* ── Messages ────────────────────────────────── */}
//             <div
//               className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 scrollbar-thin"
//               style={{ WebkitOverflowScrolling: 'touch' }}
//             >
//               {messages.map((msg, idx) => {
//                 const isLatestAssistant =
//                   msg.role === 'assistant' && idx === messages.length - 1;

//                 return (
//                   <ChatMessage
//                     key={msg.id}
//                     message={msg}
//                     onOptionClick={isLatestAssistant ? handleOptionClick : undefined}
//                     isLatest={isLatestAssistant}
//                   />
//                 );
//               })}

//               {isLoading && (
//                 <div className="mb-3 flex items-start gap-2">
//                   <div
//                     className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
//                     style={{
//                       background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                     }}
//                   >
//                     E
//                   </div>
//                   <div className="rounded-xl rounded-tl-sm bg-white/5 px-3 py-2">
//                     <div className="flex gap-1">
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* ── Input Area ─────────────────────────────── */}
//             <AnimatePresence mode="wait">
//               {inputMode === 'otp' ? (
//                 <OtpInput
//                   key="otp-input"
//                   onSubmit={handleOtpSubmit}
//                   isLoading={isLoading}
//                   locale={locale}
//                   onResend={handleOtpResend}
//                 />
//               ) : (
//                 <motion.div
//                   key="text-input"
//                   initial={{ opacity: 0, y: 8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -8 }}
//                   transition={{ duration: 0.2 }}
//                   className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
//                   style={{
//                     borderTop: '1px solid rgba(255, 215, 0, 0.1)',
//                     background: 'rgba(255, 255, 255, 0.02)',
//                   }}
//                 >
//                   <div className="flex items-end gap-2">
//                     <textarea
//                       ref={inputRef}
//                       value={input}
//                       onChange={(e) => setInput(e.target.value)}
//                       onKeyDown={handleKeyDown}
//                       placeholder={t.placeholder}
//                       rows={1}
//                       disabled={isLoading}
//                       className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500/40 focus:bg-white/8 disabled:opacity-50"
//                       style={{ maxHeight: '100px' }}
//                       onInput={(e) => {
//                         const el = e.currentTarget;
//                         el.style.height = 'auto';
//                         el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
//                       }}
//                     />

//                     {/* Voice button — shown when input is empty */}
//                     {!input.trim() && (
//                       <div className="flex flex-col items-end gap-1">
//                         <VoiceButton
//                           ref={voiceButtonRef}
//                           onResult={handleVoiceResult}
//                           onError={handleVoiceError}
//                           onDebug={handleVoiceDebug}
//                           sessionId={sessionId}
//                           locale={locale}
//                           disabled={isLoading}
//                         />
//                         {showVoiceDebug && voiceDebugInfo && (
//                           <div className="max-w-[250px] rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] leading-4 text-amber-200">
//                             <div>{`voice-debug: ${voiceDebugInfo.code}`}</div>
//                             <div>{`name: ${voiceDebugInfo.errorName || '-'}`}</div>
//                             <div>{`perm: ${voiceDebugInfo.permissionState}`}</div>
//                             <div>{`secure: ${voiceDebugInfo.secureContext ? 'yes' : 'no'}, iframe: ${voiceDebugInfo.inIframe ? 'yes' : 'no'}`}</div>
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {/* Send button — shown when there's text */}
//                     <button
//                       onClick={handleSend}
//                       disabled={!input.trim() || isLoading}
//                       className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
//                       style={{
//                         background:
//                           input.trim() && !isLoading
//                             ? 'linear-gradient(135deg, #FFD700, #FFA000)'
//                             : 'rgba(255, 255, 255, 0.1)',
//                         // Hide send button when voice is shown (no text)
//                         display: input.trim() ? 'flex' : 'none',
//                       }}
//                     >
//                       {isLoading ? (
//                         <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
//                       ) : (
//                         <Send className="h-4 w-4 text-gray-900" />
//                       )}
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }



//------03.03.26 пробую преммиум стиль
// // src/components/ai/ChatWidget.tsx
// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
// import { ChatMessage, type Message } from './ChatMessage';
// import { OtpInput } from './OtpInput';
// import {
//   VoiceButton,
//   type VoiceButtonHandle,
//   type VoiceMicDebugInfo,
//   type VoiceMicErrorCode,
// } from './VoiceButton';
// import { useMobileViewport } from '@/hooks/useMobileViewport';

// // ─── Config ─────────────────────────────────────────────────────

// const API_URL = '/api/ai/chat';

// function generateSessionId(): string {
//   return crypto.randomUUID();
// }

// // ─── Translations ───────────────────────────────────────────────

// const UI_TEXT = {
//   de: {
//     placeholder: 'Ihre Nachricht...',
//     welcome: 'Hallo! 👋 Ich bin Elen-AI, Ihr Buchungsassistent. Wie kann ich Ihnen helfen?\n\n[option] 📅 Termin buchen [/option]\n[option] 💬 Beratung & Auswahl [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]',
//     autoGreeting:
//       '🌸 Möchten Sie einen Termin buchen oder Preise erfahren?\n\n[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]',
//     error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
//     rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
//     title: 'Salon Elen',
//     subtitle: 'Buchungsassistent',
//     newChat: 'Neuer Chat',
//   },
//   ru: {
//     placeholder: 'Ваше сообщение...',
//     welcome: 'Привет! 👋 Я Elen-AI, ассистент записи. Чем могу помочь?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💬 Консультация и подбор [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]',
//     autoGreeting:
//       '🌸 Хотите записаться на приём или узнать цены?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]',
//     error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
//     rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
//     title: 'Salon Elen',
//     subtitle: 'Ассистент записи',
//     newChat: 'Новый чат',
//   },
//   en: {
//     placeholder: 'Your message...',
//     welcome: 'Hello! 👋 I\'m Elen-AI, your booking assistant. How can I help?\n\n[option] 📅 Book an appointment [/option]\n[option] 💬 Consultation & guidance [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Location & hours [/option]',
//     autoGreeting:
//       '🌸 Would you like to book an appointment or check prices?\n\n[option] 📅 Book an appointment [/option]\n[option] 💅 Services & prices [/option]',
//     error: 'Sorry, something went wrong. Please try again.',
//     rateLimit: 'Please wait a moment before sending a new message.',
//     title: 'Salon Elen',
//     subtitle: 'Booking Assistant',
//     newChat: 'New Chat',
//   },
// } as const;

// type SupportedLocale = keyof typeof UI_TEXT;

// const MIC_ENABLE_OPTION_TEXT: Record<SupportedLocale, string> = {
//   de: 'Mikrofon aktivieren',
//   ru: 'Включить микрофон',
//   en: 'Enable microphone',
// };

// const MIC_SETTINGS_HELP_TEXT: Record<SupportedLocale, string> = {
//   de:
//     'Öffnen Sie die Website-Berechtigungen (Schloss-Symbol in der Adresszeile), erlauben Sie das Mikrofon und laden Sie die Seite neu.',
//   ru:
//     'Откройте разрешения сайта (значок замка в адресной строке), включите микрофон и обновите страницу.',
//   en:
//     'Open site permissions (lock icon in the address bar), allow microphone access, then reload the page.',
// };

// const MIC_ACTIONABLE_ERROR_CODES = new Set<VoiceMicErrorCode>([
//   'not-allowed',
//   'not-found',
//   'in-use',
//   'insecure-context',
//   'unsupported',
//   'iframe-blocked',
// ]);

// const AUTO_GREETING_MIN_MS = 8000;
// const AUTO_GREETING_MAX_MS = 12000;

// function randomDelayBetween(min: number, max: number): number {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function resolveMicSettingsUrl(): string | null {
//   if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;

//   const ua = navigator.userAgent.toLowerCase();
//   const origin = encodeURIComponent(window.location.origin);

//   const isChromium =
//     (ua.includes('chrome') || ua.includes('chromium') || ua.includes('edg') || ua.includes('opr')) &&
//     !ua.includes('firefox');

//   if (isChromium) {
//     return `chrome://settings/content/siteDetails?site=${origin}`;
//   }
//   if (ua.includes('firefox')) {
//     return 'about:preferences#privacy';
//   }

//   return null;
// }

// function tryOpenMicSettings(): boolean {
//   if (typeof window === 'undefined') return false;
//   const url = resolveMicSettingsUrl();
//   if (!url) return false;

//   try {
//     window.location.assign(url);
//     return true;
//   } catch {
//     return false;
//   }
// }

// // ─── Types ──────────────────────────────────────────────────────

// type InputMode = 'text' | 'otp';

// // ─── Component ──────────────────────────────────────────────────

// interface ChatWidgetProps {
//   locale?: string;
// }

// export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
//   const locale: SupportedLocale =
//     propLocale && propLocale in UI_TEXT
//       ? (propLocale as SupportedLocale)
//       : 'de';
//   const t = UI_TEXT[locale];

//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(() => generateSessionId());
//   const [inputMode, setInputMode] = useState<InputMode>('text');
//   const { height: vpHeight, keyboardOpen, isMobile } = useMobileViewport();
//   const panelRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);
//   const [dragY, setDragY] = useState(0);
//   const [showVoiceDebug, setShowVoiceDebug] = useState(false);
//   const [voiceDebugInfo, setVoiceDebugInfo] = useState<VoiceMicDebugInfo | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLTextAreaElement>(null);
//   const voiceButtonRef = useRef<VoiceButtonHandle | null>(null);
//   const autoGreetingTimerRef = useRef<number | null>(null);
//   const autoGreetingShownRef = useRef(false);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Focus input when opening (only in text mode)
//   useEffect(() => {
//     if (isOpen && inputMode === 'text') {
//       setTimeout(() => inputRef.current?.focus(), 300);
//     }
//   }, [isOpen, inputMode]);

//   // Welcome message on first open
//   useEffect(() => {
//     if (isOpen && messages.length === 0) {
//       autoGreetingShownRef.current = false;
//       setMessages([
//         {
//           id: 'welcome',
//           role: 'assistant',
//           content: t.welcome,
//           timestamp: new Date(),
//         },
//       ]);
//     }
//   }, [isOpen, messages.length, t.welcome]);

//   // Auto-greeting (8–12s): only when the chat has just welcomed and user has not interacted yet.
//   useEffect(() => {
//     if (!isOpen) {
//       if (autoGreetingTimerRef.current !== null) {
//         window.clearTimeout(autoGreetingTimerRef.current);
//         autoGreetingTimerRef.current = null;
//       }
//       return;
//     }

//     const hasUserInteracted = messages.some((msg) => msg.role === 'user');
//     const hasOnlyWelcome =
//       messages.length === 1 &&
//       messages[0]?.role === 'assistant' &&
//       messages[0]?.id === 'welcome';

//     if (!hasOnlyWelcome || hasUserInteracted || autoGreetingShownRef.current) {
//       if (autoGreetingTimerRef.current !== null) {
//         window.clearTimeout(autoGreetingTimerRef.current);
//         autoGreetingTimerRef.current = null;
//       }
//       return;
//     }

//     const delay = randomDelayBetween(AUTO_GREETING_MIN_MS, AUTO_GREETING_MAX_MS);
//     autoGreetingTimerRef.current = window.setTimeout(() => {
//       setMessages((prev) => {
//         const userInteracted = prev.some((msg) => msg.role === 'user');
//         if (userInteracted || autoGreetingShownRef.current) {
//           return prev;
//         }

//         autoGreetingShownRef.current = true;
//         return [
//           ...prev,
//           {
//             id: `auto-greeting-${Date.now()}`,
//             role: 'assistant',
//             content: t.autoGreeting,
//             timestamp: new Date(),
//           },
//         ];
//       });
//       autoGreetingTimerRef.current = null;
//     }, delay);

//     return () => {
//       if (autoGreetingTimerRef.current !== null) {
//         window.clearTimeout(autoGreetingTimerRef.current);
//         autoGreetingTimerRef.current = null;
//       }
//     };
//   }, [isOpen, messages, t.autoGreeting]);

//   // Lock body scroll on mobile when chat is open
//   useEffect(() => {
//     if (!isMobile) return;
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//       // Prevent iOS bounce / pull-to-refresh
//       document.body.style.position = 'fixed';
//       document.body.style.width = '100%';
//       document.body.style.top = `-${window.scrollY}px`;
//     }
//     return () => {
//       const scrollY = document.body.style.top;
//       document.body.style.overflow = '';
//       document.body.style.position = '';
//       document.body.style.width = '';
//       document.body.style.top = '';
//       if (scrollY) {
//         window.scrollTo(0, parseInt(scrollY, 10) * -1);
//       }
//     };
//   }, [isOpen, isMobile]);

//   // Auto-scroll when keyboard opens
//   useEffect(() => {
//     if (keyboardOpen) {
//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 100);
//     }
//   }, [keyboardOpen]);

//   // Debug panel visibility for admins/support:
//   // - always on in /admin
//   // - can be enabled on public pages via ?voiceDebug=1 or localStorage.voice_debug=1
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const debugByPath = window.location.pathname.startsWith('/admin');
//     const debugByQuery = new URLSearchParams(window.location.search).get('voiceDebug') === '1';
//     const debugByStorage = window.localStorage.getItem('voice_debug') === '1';
//     setShowVoiceDebug(debugByPath || debugByQuery || debugByStorage);
//   }, []);

//   const handleNewChat = useCallback(() => {
//     if (autoGreetingTimerRef.current !== null) {
//       window.clearTimeout(autoGreetingTimerRef.current);
//       autoGreetingTimerRef.current = null;
//     }
//     autoGreetingShownRef.current = false;
//     setSessionId(generateSessionId());
//     setMessages([
//       {
//         id: 'welcome',
//         role: 'assistant',
//         content: t.welcome,
//         timestamp: new Date(),
//       },
//     ]);
//     setInput('');
//     setIsLoading(false);
//     setInputMode('text');
//     setDragY(0);
//   }, [t.welcome]);

//   // ─── Core send logic ─────────────────────────────────────────

//   const sendMessage = useCallback(
//     async (text: string) => {
//       setIsLoading(true);

//       try {
//         const res = await fetch(API_URL, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             sessionId,
//             message: text,
//             locale,
//           }),
//         });

//         if (res.status === 429) {
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: `error-${Date.now()}`,
//               role: 'assistant',
//               content: t.rateLimit,
//               timestamp: new Date(),
//             },
//           ]);
//           return;
//         }

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}`);
//         }

//         const data = await res.json();

//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `ai-${Date.now()}`,
//             role: 'assistant',
//             content: data.text,
//             timestamp: new Date(),
//           },
//         ]);

//         // Switch input mode based on server response
//         if (data.inputMode === 'otp') {
//           setInputMode('otp');
//         } else if (data.inputMode === 'text' || inputMode === 'otp') {
//           setInputMode('text');
//         }
//       } catch (err) {
//         console.error('[ChatWidget] Error:', err);
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `error-${Date.now()}`,
//             role: 'assistant',
//             content: t.error,
//             timestamp: new Date(),
//             isError: true,
//           },
//         ]);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [sessionId, locale, t, inputMode],
//   );

//   // ─── Text input handlers ──────────────────────────────────────

//   const handleOptionClick = useCallback(
//     (text: string) => {
//       if (isLoading) return;

//       if (text.trim().toLowerCase() === MIC_ENABLE_OPTION_TEXT[locale].toLowerCase()) {
//         // If browser already stores a hard "denied", open settings directly.
//         if (
//           voiceDebugInfo?.code === 'not-allowed' &&
//           voiceDebugInfo.permissionState === 'denied'
//         ) {
//           const opened = tryOpenMicSettings();
//           if (!opened) {
//             setMessages((prev) => [
//               ...prev,
//               {
//                 id: `mic-help-${Date.now()}`,
//                 role: 'assistant',
//                 content: MIC_SETTINGS_HELP_TEXT[locale],
//                 timestamp: new Date(),
//                 isError: false,
//               },
//             ]);
//           }
//           return;
//         }

//         voiceButtonRef.current?.requestMicAccess();
//         return;
//       }

//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: text,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(text);
//     },
//     [isLoading, sendMessage, locale, voiceDebugInfo],
//   );

//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || isLoading) return;

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: text,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     sendMessage(text);
//   }, [input, isLoading, sendMessage]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   // ─── OTP handlers ─────────────────────────────────────────────

//   const handleOtpSubmit = useCallback(
//     (code: string) => {
//       if (isLoading) return;
//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: code,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(code);
//     },
//     [isLoading, sendMessage],
//   );

//   const handleOtpResend = useCallback(() => {
//     if (isLoading) return;
//     const resendText =
//       locale === 'ru'
//         ? 'отправь код ещё раз'
//         : locale === 'en'
//           ? 'send code again'
//           : 'Code erneut senden';

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: resendText,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMsg]);
//     sendMessage(resendText);
//   }, [isLoading, locale, sendMessage]);

//   // ─── Voice handlers ───────────────────────────────────────────

//   const handleVoiceResult = useCallback(
//     (result: { transcript: string; text: string; inputMode?: string }) => {
//       setVoiceDebugInfo(null);

//       // Add user message (transcribed text)
//       if (result.transcript) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `user-voice-${Date.now()}`,
//             role: 'user',
//             content: `🎙 ${result.transcript}`,
//             timestamp: new Date(),
//           },
//         ]);
//       }

//       // Add AI response
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: `ai-voice-${Date.now()}`,
//           role: 'assistant',
//           content: result.text,
//           timestamp: new Date(),
//         },
//       ]);

//       // Update input mode
//       if (result.inputMode === 'otp') {
//         setInputMode('otp');
//       } else if (result.inputMode === 'text') {
//         setInputMode('text');
//       }
//     },
//     [],
//   );

//   const handleVoiceError = useCallback(
//     (error: string, code?: VoiceMicErrorCode) => {
//       const withAction = code ? MIC_ACTIONABLE_ERROR_CODES.has(code) : false;
//       const content = withAction
//         ? `${error}\n\n[option] 🎙 ${MIC_ENABLE_OPTION_TEXT[locale]} [/option]`
//         : error;

//       setMessages((prev) => {
//         const last = prev[prev.length - 1];
//         if (last?.role === 'assistant' && last.content === content) {
//           return prev;
//         }

//         return [
//           ...prev,
//           {
//             id: `error-voice-${Date.now()}`,
//             role: 'assistant',
//             content,
//             timestamp: new Date(),
//             isError: !withAction,
//           },
//         ];
//       });
//     },
//     [locale],
//   );

//   const handleVoiceDebug = useCallback((info: VoiceMicDebugInfo) => {
//     setVoiceDebugInfo(info);
//   }, []);

//   // ─── Swipe-to-close (mobile) ──────────────────────────────
//   const handleDragEnd = useCallback(
//     (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
//       // Close if dragged >100px down or fast swipe
//       if (info.offset.y > 100 || info.velocity.y > 500) {
//         setIsOpen(false);
//       }
//       setDragY(0);
//     },
//     [],
//   );

//   // ─── Render ───────────────────────────────────────────────────

//   return (
//     <>
//       {/* ── Floating Button ───────────────────────────────── */}
//       <AnimatePresence>
//         {!isOpen && (
//           <motion.button
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0, opacity: 0 }}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setIsOpen(true)}
//             className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl sm:h-16 sm:w-16"
//             style={{
//               bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
//               right: 'max(1.5rem, env(safe-area-inset-right, 1.5rem))',
//               background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
//               boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
//             }}
//             aria-label="Chat öffnen"
//           >
//             <MessageCircle className="h-6 w-6 text-gray-900 sm:h-7 sm:w-7" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* ── Chat Panel ────────────────────────────────────── */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             ref={panelRef}
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//             className="fixed bottom-0 right-0 z-50 flex w-full flex-col sm:bottom-0 sm:right-6 sm:h-[540px] sm:w-[360px] sm:rounded-2xl"
//             style={{
//               height: isMobile ? `${vpHeight}px` : undefined,
//               background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
//               border: '1px solid rgba(255, 215, 0, 0.15)',
//               boxShadow:
//                 '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.08)',
//               paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : undefined,
//               paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
//             }}
//           >
//             {/* ── Header ──────────────────────────────────── */}
//             <motion.div
//               ref={headerRef}
//               drag={isMobile ? 'y' : false}
//               dragConstraints={{ top: 0, bottom: 0 }}
//               dragElastic={0.2}
//               onDrag={(_event, info: { offset: { y: number } }) => setDragY(info.offset.y)}
//               onDragEnd={handleDragEnd}
//               className="relative flex cursor-grab touch-none items-center justify-between rounded-t-none px-4 py-3 active:cursor-grabbing sm:cursor-default sm:rounded-t-2xl"
//               style={{
//                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
//                 borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
//               }}
//             >
//               {/* Drag indicator — mobile only */}
//               {isMobile && (
//                 <div
//                   className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full bg-white/20"
//                   style={{ opacity: dragY > 0 ? 1 : 0.65 }}
//                 />
//               )}
//               <div className="flex items-center gap-3">
//                 <div
//                   className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-gray-900"
//                   style={{
//                     background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                   }}
//                 >
//                   E
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold text-white">
//                     {t.title}
//                   </h3>
//                   <p className="text-xs text-gray-400">{t.subtitle}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={handleNewChat}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   title={t.newChat}
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   aria-label="Chat schließen"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </motion.div>

//             {/* ── Messages ────────────────────────────────── */}
//             <div
//               className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 scrollbar-thin"
//               style={{ WebkitOverflowScrolling: 'touch' }}
//             >
//               {messages.map((msg, idx) => {
//                 const isLatestAssistant =
//                   msg.role === 'assistant' && idx === messages.length - 1;

//                 return (
//                   <ChatMessage
//                     key={msg.id}
//                     message={msg}
//                     onOptionClick={isLatestAssistant ? handleOptionClick : undefined}
//                     isLatest={isLatestAssistant}
//                   />
//                 );
//               })}

//               {isLoading && (
//                 <div className="mb-3 flex items-start gap-2">
//                   <div
//                     className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
//                     style={{
//                       background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                     }}
//                   >
//                     E
//                   </div>
//                   <div className="rounded-xl rounded-tl-sm bg-white/5 px-3 py-2">
//                     <div className="flex gap-1">
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* ── Input Area ─────────────────────────────── */}
//             <AnimatePresence mode="wait">
//               {inputMode === 'otp' ? (
//                 <OtpInput
//                   key="otp-input"
//                   onSubmit={handleOtpSubmit}
//                   isLoading={isLoading}
//                   locale={locale}
//                   onResend={handleOtpResend}
//                 />
//               ) : (
//                 <motion.div
//                   key="text-input"
//                   initial={{ opacity: 0, y: 8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -8 }}
//                   transition={{ duration: 0.2 }}
//                   className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
//                   style={{
//                     borderTop: '1px solid rgba(255, 215, 0, 0.1)',
//                     background: 'rgba(255, 255, 255, 0.02)',
//                   }}
//                 >
//                   <div className="flex items-end gap-2">
//                     <textarea
//                       ref={inputRef}
//                       value={input}
//                       onChange={(e) => setInput(e.target.value)}
//                       onKeyDown={handleKeyDown}
//                       placeholder={t.placeholder}
//                       rows={1}
//                       disabled={isLoading}
//                       className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500/40 focus:bg-white/8 disabled:opacity-50"
//                       style={{ maxHeight: '100px' }}
//                       onInput={(e) => {
//                         const el = e.currentTarget;
//                         el.style.height = 'auto';
//                         el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
//                       }}
//                     />

//                     {/* Voice button — shown when input is empty */}
//                     {!input.trim() && (
//                       <div className="flex flex-col items-end gap-1">
//                         <VoiceButton
//                           ref={voiceButtonRef}
//                           onResult={handleVoiceResult}
//                           onError={handleVoiceError}
//                           onDebug={handleVoiceDebug}
//                           sessionId={sessionId}
//                           locale={locale}
//                           disabled={isLoading}
//                         />
//                         {showVoiceDebug && voiceDebugInfo && (
//                           <div className="max-w-[250px] rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] leading-4 text-amber-200">
//                             <div>{`voice-debug: ${voiceDebugInfo.code}`}</div>
//                             <div>{`name: ${voiceDebugInfo.errorName || '-'}`}</div>
//                             <div>{`perm: ${voiceDebugInfo.permissionState}`}</div>
//                             <div>{`secure: ${voiceDebugInfo.secureContext ? 'yes' : 'no'}, iframe: ${voiceDebugInfo.inIframe ? 'yes' : 'no'}`}</div>
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {/* Send button — shown when there's text */}
//                     <button
//                       onClick={handleSend}
//                       disabled={!input.trim() || isLoading}
//                       className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
//                       style={{
//                         background:
//                           input.trim() && !isLoading
//                             ? 'linear-gradient(135deg, #FFD700, #FFA000)'
//                             : 'rgba(255, 255, 255, 0.1)',
//                         // Hide send button when voice is shown (no text)
//                         display: input.trim() ? 'flex' : 'none',
//                       }}
//                     >
//                       {isLoading ? (
//                         <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
//                       ) : (
//                         <Send className="h-4 w-4 text-gray-900" />
//                       )}
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }



//-------01.03.26 добавляем голосовой ввод и подтверждение кода
// // src/components/ai/ChatWidget.tsx
// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
// import { ChatMessage, type Message } from './ChatMessage';
// import { OtpInput } from './OtpInput';

// // ─── Config ─────────────────────────────────────────────────────

// const API_URL = '/api/ai/chat';

// function generateSessionId(): string {
//   return crypto.randomUUID();
// }

// // ─── Translations ───────────────────────────────────────────────

// const UI_TEXT = {
//   de: {
//     placeholder: 'Ihre Nachricht...',
//     welcome: 'Hallo! 👋 Ich bin Elen-AI, Ihr Buchungsassistent. Wie kann ich Ihnen helfen?\n\n[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]',
//     error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
//     rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
//     title: 'Salon Elen',
//     subtitle: 'Buchungsassistent',
//     newChat: 'Neuer Chat',
//   },
//   ru: {
//     placeholder: 'Ваше сообщение...',
//     welcome: 'Привет! 👋 Я Elen-AI, ассистент записи. Чем могу помочь?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]',
//     error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
//     rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
//     title: 'Salon Elen',
//     subtitle: 'Ассистент записи',
//     newChat: 'Новый чат',
//   },
//   en: {
//     placeholder: 'Your message...',
//     welcome: 'Hello! 👋 I\'m Elen-AI, your booking assistant. How can I help?\n\n[option] 📅 Book an appointment [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Location & hours [/option]',
//     error: 'Sorry, something went wrong. Please try again.',
//     rateLimit: 'Please wait a moment before sending a new message.',
//     title: 'Salon Elen',
//     subtitle: 'Booking Assistant',
//     newChat: 'New Chat',
//   },
// } as const;

// type SupportedLocale = keyof typeof UI_TEXT;

// // ─── Types ──────────────────────────────────────────────────────

// type InputMode = 'text' | 'otp';

// // ─── Component ──────────────────────────────────────────────────

// interface ChatWidgetProps {
//   locale?: string;
// }

// export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
//   const locale: SupportedLocale =
//     propLocale && propLocale in UI_TEXT
//       ? (propLocale as SupportedLocale)
//       : 'de';
//   const t = UI_TEXT[locale];

//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(() => generateSessionId());
//   const [inputMode, setInputMode] = useState<InputMode>('text');

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLTextAreaElement>(null);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Focus input when opening
//   useEffect(() => {
//     if (isOpen && inputMode === 'text') {
//       setTimeout(() => inputRef.current?.focus(), 300);
//     }
//   }, [isOpen, inputMode]);

//   // Welcome message on first open
//   useEffect(() => {
//     if (isOpen && messages.length === 0) {
//       setMessages([
//         {
//           id: 'welcome',
//           role: 'assistant',
//           content: t.welcome,
//           timestamp: new Date(),
//         },
//       ]);
//     }
//   }, [isOpen, messages.length, t.welcome]);

//   const handleNewChat = useCallback(() => {
//     setSessionId(generateSessionId());
//     setMessages([
//       {
//         id: 'welcome',
//         role: 'assistant',
//         content: t.welcome,
//         timestamp: new Date(),
//       },
//     ]);
//     setInput('');
//     setIsLoading(false);
//     setInputMode('text');
//   }, [t.welcome]);

//   const sendMessage = useCallback(
//     async (text: string) => {
//       setIsLoading(true);

//       try {
//         const res = await fetch(API_URL, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             sessionId,
//             message: text,
//             locale,
//           }),
//         });

//         if (res.status === 429) {
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: `error-${Date.now()}`,
//               role: 'assistant',
//               content: t.rateLimit,
//               timestamp: new Date(),
//             },
//           ]);
//           return;
//         }

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}`);
//         }

//         const data = await res.json();

//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `ai-${Date.now()}`,
//             role: 'assistant',
//             content: data.text,
//             timestamp: new Date(),
//           },
//         ]);

//         // Switch input mode based on server response
//         if (data.inputMode === 'otp') {
//           setInputMode('otp');
//         } else if (data.inputMode === 'text' || inputMode === 'otp') {
//           // Explicit text mode, or we were in OTP and server didn't say stay in OTP
//           setInputMode('text');
//         }
//       } catch (err) {
//         console.error('[ChatWidget] Error:', err);
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `error-${Date.now()}`,
//             role: 'assistant',
//             content: t.error,
//             timestamp: new Date(),
//             isError: true,
//           },
//         ]);
//         // On error, stay in current mode
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [sessionId, locale, t, inputMode],
//   );

//   const handleOptionClick = useCallback(
//     (text: string) => {
//       if (isLoading) return;
//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: text,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(text);
//     },
//     [isLoading, sendMessage],
//   );

//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || isLoading) return;

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: text,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     sendMessage(text);
//   }, [input, isLoading, sendMessage]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   // ─── OTP handlers ─────────────────────────────────────────────

//   const handleOtpSubmit = useCallback(
//     (code: string) => {
//       if (isLoading) return;
//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: code,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(code);
//     },
//     [isLoading, sendMessage],
//   );

//   const handleOtpResend = useCallback(() => {
//     if (isLoading) return;
//     const resendText =
//       locale === 'ru'
//         ? 'отправь код ещё раз'
//         : locale === 'en'
//           ? 'send code again'
//           : 'Code erneut senden';

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: resendText,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMsg]);
//     sendMessage(resendText);
//   }, [isLoading, locale, sendMessage]);

//   return (
//     <>
//       {/* ── Floating Button ───────────────────────────────── */}
//       <AnimatePresence>
//         {!isOpen && (
//           <motion.button
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0, opacity: 0 }}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setIsOpen(true)}
//             className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl sm:h-16 sm:w-16"
//             style={{
//               background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
//               boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
//             }}
//             aria-label="Chat öffnen"
//           >
//             <MessageCircle className="h-6 w-6 text-gray-900 sm:h-7 sm:w-7" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* ── Chat Panel ────────────────────────────────────── */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//             className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-2xl"
//             style={{
//               background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
//               border: '1px solid rgba(255, 215, 0, 0.15)',
//               boxShadow:
//                 '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.08)',
//             }}
//           >
//             {/* ── Header ──────────────────────────────────── */}
//             <div
//               className="flex items-center justify-between rounded-t-none px-4 py-3 sm:rounded-t-2xl"
//               style={{
//                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
//                 borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
//               }}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-gray-900"
//                   style={{
//                     background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                   }}
//                 >
//                   E
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold text-white">
//                     {t.title}
//                   </h3>
//                   <p className="text-xs text-gray-400">{t.subtitle}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={handleNewChat}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   title={t.newChat}
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   aria-label="Chat schließen"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             {/* ── Messages ────────────────────────────────── */}
//             <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
//               {messages.map((msg, idx) => {
//                 // isLatest = last assistant message in the list
//                 const isLatestAssistant =
//                   msg.role === 'assistant' &&
//                   !msg.isError &&
//                   idx === messages.length - 1;

//                 return (
//                   <ChatMessage
//                     key={msg.id}
//                     message={msg}
//                     onOptionClick={isLatestAssistant ? handleOptionClick : undefined}
//                     isLatest={isLatestAssistant}
//                   />
//                 );
//               })}

//               {isLoading && (
//                 <div className="mb-3 flex items-start gap-2">
//                   <div
//                     className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
//                     style={{
//                       background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                     }}
//                   >
//                     E
//                   </div>
//                   <div className="rounded-xl rounded-tl-sm bg-white/5 px-3 py-2">
//                     <div className="flex gap-1">
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* ── Input Area ─────────────────────────────── */}
//             <AnimatePresence mode="wait">
//               {inputMode === 'otp' ? (
//                 <OtpInput
//                   key="otp-input"
//                   onSubmit={handleOtpSubmit}
//                   isLoading={isLoading}
//                   locale={locale}
//                   onResend={handleOtpResend}
//                 />
//               ) : (
//                 <motion.div
//                   key="text-input"
//                   initial={{ opacity: 0, y: 8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -8 }}
//                   transition={{ duration: 0.2 }}
//                   className="px-3 py-3"
//                   style={{
//                     borderTop: '1px solid rgba(255, 215, 0, 0.1)',
//                     background: 'rgba(255, 255, 255, 0.02)',
//                   }}
//                 >
//                   <div className="flex items-end gap-2">
//                     <textarea
//                       ref={inputRef}
//                       value={input}
//                       onChange={(e) => setInput(e.target.value)}
//                       onKeyDown={handleKeyDown}
//                       placeholder={t.placeholder}
//                       rows={1}
//                       disabled={isLoading}
//                       className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500/40 focus:bg-white/8 disabled:opacity-50"
//                       style={{ maxHeight: '100px' }}
//                       onInput={(e) => {
//                         const el = e.currentTarget;
//                         el.style.height = 'auto';
//                         el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
//                       }}
//                     />
//                     <button
//                       onClick={handleSend}
//                       disabled={!input.trim() || isLoading}
//                       className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
//                       style={{
//                         background:
//                           input.trim() && !isLoading
//                             ? 'linear-gradient(135deg, #FFD700, #FFA000)'
//                             : 'rgba(255, 255, 255, 0.1)',
//                       }}
//                     >
//                       {isLoading ? (
//                         <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
//                       ) : (
//                         <Send className="h-4 w-4 text-gray-900" />
//                       )}
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }



//------01.03.26 форма подтверждения кода
// // src/components/ai/ChatWidget.tsx
// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
// import { ChatMessage, type Message } from './ChatMessage';

// // ─── Config ─────────────────────────────────────────────────────

// const API_URL = '/api/ai/chat';

// function generateSessionId(): string {
//   return crypto.randomUUID();
// }

// // ─── Translations ───────────────────────────────────────────────

// const UI_TEXT = {
//   de: {
//     placeholder: 'Ihre Nachricht...',
//     welcome: 'Hallo! 👋 Ich bin Elen-AI, Ihr Buchungsassistent. Wie kann ich Ihnen helfen?\n\n[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]',
//     error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
//     rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
//     title: 'Salon Elen',
//     subtitle: 'Buchungsassistent',
//     newChat: 'Neuer Chat',
//   },
//   ru: {
//     placeholder: 'Ваше сообщение...',
//     welcome: 'Привет! 👋 Я Elen-AI, ассистент записи. Чем могу помочь?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]',
//     error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
//     rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
//     title: 'Salon Elen',
//     subtitle: 'Ассистент записи',
//     newChat: 'Новый чат',
//   },
//   en: {
//     placeholder: 'Your message...',
//     welcome: 'Hello! 👋 I\'m Elen-AI, your booking assistant. How can I help?\n\n[option] 📅 Book an appointment [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Location & hours [/option]',
//     error: 'Sorry, something went wrong. Please try again.',
//     rateLimit: 'Please wait a moment before sending a new message.',
//     title: 'Salon Elen',
//     subtitle: 'Booking Assistant',
//     newChat: 'New Chat',
//   },
// } as const;

// type SupportedLocale = keyof typeof UI_TEXT;

// // ─── Component ──────────────────────────────────────────────────

// interface ChatWidgetProps {
//   locale?: string;
// }

// export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
//   const locale: SupportedLocale =
//     propLocale && propLocale in UI_TEXT
//       ? (propLocale as SupportedLocale)
//       : 'de';
//   const t = UI_TEXT[locale];

//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(() => generateSessionId());

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLTextAreaElement>(null);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Focus input when opening
//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => inputRef.current?.focus(), 300);
//     }
//   }, [isOpen]);

//   // Welcome message on first open
//   useEffect(() => {
//     if (isOpen && messages.length === 0) {
//       setMessages([
//         {
//           id: 'welcome',
//           role: 'assistant',
//           content: t.welcome,
//           timestamp: new Date(),
//         },
//       ]);
//     }
//   }, [isOpen, messages.length, t.welcome]);

//   const handleNewChat = useCallback(() => {
//     setSessionId(generateSessionId());
//     setMessages([
//       {
//         id: 'welcome',
//         role: 'assistant',
//         content: t.welcome,
//         timestamp: new Date(),
//       },
//     ]);
//     setInput('');
//     setIsLoading(false);
//   }, [t.welcome]);

//   const sendMessage = useCallback(
//     async (text: string) => {
//       setIsLoading(true);

//       try {
//         const res = await fetch(API_URL, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             sessionId,
//             message: text,
//             locale,
//           }),
//         });

//         if (res.status === 429) {
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: `error-${Date.now()}`,
//               role: 'assistant',
//               content: t.rateLimit,
//               timestamp: new Date(),
//             },
//           ]);
//           return;
//         }

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}`);
//         }

//         const data = await res.json();

//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `ai-${Date.now()}`,
//             role: 'assistant',
//             content: data.text,
//             timestamp: new Date(),
//           },
//         ]);
//       } catch (err) {
//         console.error('[ChatWidget] Error:', err);
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `error-${Date.now()}`,
//             role: 'assistant',
//             content: t.error,
//             timestamp: new Date(),
//             isError: true,
//           },
//         ]);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [sessionId, locale, t],
//   );

//   const handleOptionClick = useCallback(
//     (text: string) => {
//       if (isLoading) return;
//       const userMsg: Message = {
//         id: `user-${Date.now()}`,
//         role: 'user',
//         content: text,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       sendMessage(text);
//     },
//     [isLoading, sendMessage],
//   );

//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || isLoading) return;

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: text,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     sendMessage(text);
//   }, [input, isLoading, sendMessage]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   return (
//     <>
//       {/* ── Floating Button ───────────────────────────────── */}
//       <AnimatePresence>
//         {!isOpen && (
//           <motion.button
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0, opacity: 0 }}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setIsOpen(true)}
//             className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl sm:h-16 sm:w-16"
//             style={{
//               background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
//               boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
//             }}
//             aria-label="Chat öffnen"
//           >
//             <MessageCircle className="h-6 w-6 text-gray-900 sm:h-7 sm:w-7" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* ── Chat Panel ────────────────────────────────────── */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//             className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-2xl"
//             style={{
//               background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
//               border: '1px solid rgba(255, 215, 0, 0.15)',
//               boxShadow:
//                 '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.08)',
//             }}
//           >
//             {/* ── Header ──────────────────────────────────── */}
//             <div
//               className="flex items-center justify-between rounded-t-none px-4 py-3 sm:rounded-t-2xl"
//               style={{
//                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
//                 borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
//               }}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-gray-900"
//                   style={{
//                     background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                   }}
//                 >
//                   E
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold text-white">
//                     {t.title}
//                   </h3>
//                   <p className="text-xs text-gray-400">{t.subtitle}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={handleNewChat}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   title={t.newChat}
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   aria-label="Chat schließen"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             {/* ── Messages ────────────────────────────────── */}
//             <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
//               {messages.map((msg, idx) => {
//                 // isLatest = last assistant message in the list
//                 const isLatestAssistant =
//                   msg.role === 'assistant' &&
//                   !msg.isError &&
//                   idx === messages.length - 1;

//                 return (
//                   <ChatMessage
//                     key={msg.id}
//                     message={msg}
//                     onOptionClick={isLatestAssistant ? handleOptionClick : undefined}
//                     isLatest={isLatestAssistant}
//                   />
//                 );
//               })}

//               {isLoading && (
//                 <div className="mb-3 flex items-start gap-2">
//                   <div
//                     className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
//                     style={{
//                       background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                     }}
//                   >
//                     E
//                   </div>
//                   <div className="rounded-xl rounded-tl-sm bg-white/5 px-3 py-2">
//                     <div className="flex gap-1">
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* ── Input ───────────────────────────────────── */}
//             <div
//               className="px-3 py-3"
//               style={{
//                 borderTop: '1px solid rgba(255, 215, 0, 0.1)',
//                 background: 'rgba(255, 255, 255, 0.02)',
//               }}
//             >
//               <div className="flex items-end gap-2">
//                 <textarea
//                   ref={inputRef}
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder={t.placeholder}
//                   rows={1}
//                   disabled={isLoading}
//                   className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500/40 focus:bg-white/8 disabled:opacity-50"
//                   style={{ maxHeight: '100px' }}
//                   onInput={(e) => {
//                     const el = e.currentTarget;
//                     el.style.height = 'auto';
//                     el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
//                   }}
//                 />
//                 <button
//                   onClick={handleSend}
//                   disabled={!input.trim() || isLoading}
//                   className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
//                   style={{
//                     background:
//                       input.trim() && !isLoading
//                         ? 'linear-gradient(135deg, #FFD700, #FFA000)'
//                         : 'rgba(255, 255, 255, 0.1)',
//                   }}
//                 >
//                   {isLoading ? (
//                     <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
//                   ) : (
//                     <Send className="h-4 w-4 text-gray-900" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }




// // src/components/ai/ChatWidget.tsx
// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
// import { ChatMessage, type Message } from './ChatMessage';

// // ─── Config ─────────────────────────────────────────────────────

// const API_URL = '/api/ai/chat';

// function generateSessionId(): string {
//   return crypto.randomUUID();
// }

// // ─── Translations ───────────────────────────────────────────────

// const UI_TEXT = {
//   de: {
//     placeholder: 'Ihre Nachricht...',
//     welcome: 'Hallo! 👋 Ich bin Elen-AI, Ihr Buchungsassistent.\nWie kann ich Ihnen helfen? Sie können:\n\n• Einen Termin buchen 📅\n• Unsere Leistungen & Preise erfahren 💅\n• Fragen zu Anfahrt & Öffnungszeiten stellen 📍',
//     error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
//     rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
//     title: 'Salon Elen',
//     subtitle: 'Buchungsassistent',
//     newChat: 'Neuer Chat',
//   },
//   ru: {
//     placeholder: 'Ваше сообщение...',
//     welcome: 'Привет! 👋 Я Elen-AI, ассистент записи.\nЧем могу помочь? Вы можете:\n\n• Записаться на приём 📅\n• Узнать об услугах и ценах 💅\n• Спросить о расположении и часах работы 📍',
//     error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
//     rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
//     title: 'Salon Elen',
//     subtitle: 'Ассистент записи',
//     newChat: 'Новый чат',
//   },
//   en: {
//     placeholder: 'Your message...',
//     welcome: 'Hello! 👋 I\'m Elen-AI, your booking assistant.\nHow can I help you? You can:\n\n• Book an appointment 📅\n• Learn about our services & prices 💅\n• Ask about location & opening hours 📍',
//     error: 'Sorry, something went wrong. Please try again.',
//     rateLimit: 'Please wait a moment before sending a new message.',
//     title: 'Salon Elen',
//     subtitle: 'Booking Assistant',
//     newChat: 'New Chat',
//   },
// } as const;

// type SupportedLocale = keyof typeof UI_TEXT;

// // ─── Component ──────────────────────────────────────────────────

// interface ChatWidgetProps {
//   locale?: string;
// }

// export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
//   const locale: SupportedLocale =
//     propLocale && propLocale in UI_TEXT
//       ? (propLocale as SupportedLocale)
//       : 'de';
//   const t = UI_TEXT[locale];

//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(() => generateSessionId());

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLTextAreaElement>(null);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Focus input when opening
//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => inputRef.current?.focus(), 300);
//     }
//   }, [isOpen]);

//   // Welcome message on first open
//   useEffect(() => {
//     if (isOpen && messages.length === 0) {
//       setMessages([
//         {
//           id: 'welcome',
//           role: 'assistant',
//           content: t.welcome,
//           timestamp: new Date(),
//         },
//       ]);
//     }
//   }, [isOpen, messages.length, t.welcome]);

//   const handleNewChat = useCallback(() => {
//     setSessionId(generateSessionId());
//     setMessages([
//       {
//         id: 'welcome',
//         role: 'assistant',
//         content: t.welcome,
//         timestamp: new Date(),
//       },
//     ]);
//     setInput('');
//     setIsLoading(false);
//   }, [t.welcome]);

//   const handleSend = useCallback(async () => {
//     const text = input.trim();
//     if (!text || isLoading) return;

//     const userMsg: Message = {
//       id: `user-${Date.now()}`,
//       role: 'user',
//       content: text,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const res = await fetch(API_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           message: text,
//           locale,
//         }),
//       });

//       if (res.status === 429) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: `error-${Date.now()}`,
//             role: 'assistant',
//             content: t.rateLimit,
//             timestamp: new Date(),
//           },
//         ]);
//         return;
//       }

//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status}`);
//       }

//       const data = await res.json();

//       setMessages((prev) => [
//         ...prev,
//         {
//           id: `ai-${Date.now()}`,
//           role: 'assistant',
//           content: data.text,
//           timestamp: new Date(),
//         },
//       ]);
//     } catch (err) {
//       console.error('[ChatWidget] Error:', err);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: `error-${Date.now()}`,
//           role: 'assistant',
//           content: t.error,
//           timestamp: new Date(),
//           isError: true,
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [input, isLoading, sessionId, locale, t]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   return (
//     <>
//       {/* ── Floating Button ───────────────────────────────── */}
//       <AnimatePresence>
//         {!isOpen && (
//           <motion.button
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0, opacity: 0 }}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setIsOpen(true)}
//             className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl sm:h-16 sm:w-16"
//             style={{
//               background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
//               boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
//             }}
//             aria-label="Chat öffnen"
//           >
//             <MessageCircle className="h-6 w-6 text-gray-900 sm:h-7 sm:w-7" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* ── Chat Panel ────────────────────────────────────── */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//             className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-2xl"
//             style={{
//               background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
//               border: '1px solid rgba(255, 215, 0, 0.15)',
//               boxShadow:
//                 '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.08)',
//             }}
//           >
//             {/* ── Header ──────────────────────────────────── */}
//             <div
//               className="flex items-center justify-between rounded-t-none px-4 py-3 sm:rounded-t-2xl"
//               style={{
//                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
//                 borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
//               }}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-gray-900"
//                   style={{
//                     background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                   }}
//                 >
//                   E
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold text-white">
//                     {t.title}
//                   </h3>
//                   <p className="text-xs text-gray-400">{t.subtitle}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={handleNewChat}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   title={t.newChat}
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={() => setIsOpen(false)}
//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
//                   aria-label="Chat schließen"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             {/* ── Messages ────────────────────────────────── */}
//             <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
//               {messages.map((msg) => (
//                 <ChatMessage key={msg.id} message={msg} />
//               ))}

//               {isLoading && (
//                 <div className="mb-3 flex items-start gap-2">
//                   <div
//                     className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
//                     style={{
//                       background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//                     }}
//                   >
//                     E
//                   </div>
//                   <div className="rounded-xl rounded-tl-sm bg-white/5 px-3 py-2">
//                     <div className="flex gap-1">
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* ── Input ───────────────────────────────────── */}
//             <div
//               className="px-3 py-3"
//               style={{
//                 borderTop: '1px solid rgba(255, 215, 0, 0.1)',
//                 background: 'rgba(255, 255, 255, 0.02)',
//               }}
//             >
//               <div className="flex items-end gap-2">
//                 <textarea
//                   ref={inputRef}
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder={t.placeholder}
//                   rows={1}
//                   disabled={isLoading}
//                   className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500/40 focus:bg-white/8 disabled:opacity-50"
//                   style={{ maxHeight: '100px' }}
//                   onInput={(e) => {
//                     const el = e.currentTarget;
//                     el.style.height = 'auto';
//                     el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
//                   }}
//                 />
//                 <button
//                   onClick={handleSend}
//                   disabled={!input.trim() || isLoading}
//                   className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
//                   style={{
//                     background:
//                       input.trim() && !isLoading
//                         ? 'linear-gradient(135deg, #FFD700, #FFA000)'
//                         : 'rgba(255, 255, 255, 0.1)',
//                   }}
//                 >
//                   {isLoading ? (
//                     <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
//                   ) : (
//                     <Send className="h-4 w-4 text-gray-900" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
