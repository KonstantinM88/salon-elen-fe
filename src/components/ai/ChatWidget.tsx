// src/components/ai/ChatWidget.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
import { ChatMessage, type Message } from './ChatMessage';

// ─── Config ─────────────────────────────────────────────────────

const API_URL = '/api/ai/chat';

function generateSessionId(): string {
  return crypto.randomUUID();
}

// ─── Translations ───────────────────────────────────────────────

const UI_TEXT = {
  de: {
    placeholder: 'Ihre Nachricht...',
    welcome: 'Hallo! 👋 Ich bin Elen-AI, Ihr Buchungsassistent. Wie kann ich Ihnen helfen?\n\n[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]',
    error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
    title: 'Salon Elen',
    subtitle: 'Buchungsassistent',
    newChat: 'Neuer Chat',
  },
  ru: {
    placeholder: 'Ваше сообщение...',
    welcome: 'Привет! 👋 Я Elen-AI, ассистент записи. Чем могу помочь?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]',
    error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
    rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
    title: 'Salon Elen',
    subtitle: 'Ассистент записи',
    newChat: 'Новый чат',
  },
  en: {
    placeholder: 'Your message...',
    welcome: 'Hello! 👋 I\'m Elen-AI, your booking assistant. How can I help?\n\n[option] 📅 Book an appointment [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Location & hours [/option]',
    error: 'Sorry, something went wrong. Please try again.',
    rateLimit: 'Please wait a moment before sending a new message.',
    title: 'Salon Elen',
    subtitle: 'Booking Assistant',
    newChat: 'New Chat',
  },
} as const;

type SupportedLocale = keyof typeof UI_TEXT;

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => generateSessionId());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
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

  const handleNewChat = useCallback(() => {
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
  }, [t.welcome]);

  const sendMessage = useCallback(
    async (text: string) => {
      setIsLoading(true);

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: text,
            locale,
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
            },
          ]);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.text,
            timestamp: new Date(),
          },
        ]);
      } catch (err) {
        console.error('[ChatWidget] Error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: t.error,
            timestamp: new Date(),
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, locale, t],
  );

  const handleOptionClick = useCallback(
    (text: string) => {
      if (isLoading) return;
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      sendMessage(text);
    },
    [isLoading, sendMessage],
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    sendMessage(text);
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating Button ───────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl sm:h-16 sm:w-16"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
            }}
            aria-label="Chat öffnen"
          >
            <MessageCircle className="h-6 w-6 text-gray-900 sm:h-7 sm:w-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
              border: '1px solid rgba(255, 215, 0, 0.15)',
              boxShadow:
                '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.08)',
            }}
          >
            {/* ── Header ──────────────────────────────────── */}
            <div
              className="flex items-center justify-between rounded-t-none px-4 py-3 sm:rounded-t-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
                borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-gray-900"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA000)',
                  }}
                >
                  E
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t.title}
                  </h3>
                  <p className="text-xs text-gray-400">{t.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  title={t.newChat}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Chat schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* ── Messages ────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
              {messages.map((msg, idx) => {
                // isLatest = last assistant message in the list
                const isLatestAssistant =
                  msg.role === 'assistant' &&
                  !msg.isError &&
                  idx === messages.length - 1;

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onOptionClick={isLatestAssistant ? handleOptionClick : undefined}
                    isLatest={isLatestAssistant}
                  />
                );
              })}

              {isLoading && (
                <div className="mb-3 flex items-start gap-2">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700, #FFA000)',
                    }}
                  >
                    E
                  </div>
                  <div className="rounded-xl rounded-tl-sm bg-white/5 px-3 py-2">
                    <div className="flex gap-1">
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ───────────────────────────────────── */}
            <div
              className="px-3 py-3"
              style={{
                borderTop: '1px solid rgba(255, 215, 0, 0.1)',
                background: 'rgba(255, 255, 255, 0.02)',
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
                  disabled={isLoading}
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500/40 focus:bg-white/8 disabled:opacity-50"
                  style={{ maxHeight: '100px' }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
                  style={{
                    background:
                      input.trim() && !isLoading
                        ? 'linear-gradient(135deg, #FFD700, #FFA000)'
                        : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <Send className="h-4 w-4 text-gray-900" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}




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
