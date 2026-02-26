// src/components/ai/ChatMessage.tsx
'use client';

import { motion } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

// ─── Component ──────────────────────────────────────────────────

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`mb-3 flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA000)',
          }}
        >
          E
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm text-white'
            : message.isError
              ? 'rounded-tl-sm text-red-300'
              : 'rounded-tl-sm text-gray-200'
        }`}
        style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(0, 212, 255, 0.15) 100%)'
            : message.isError
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(255, 255, 255, 0.05)',
          border: isUser
            ? '1px solid rgba(255, 215, 0, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Render text with line breaks and basic formatting */}
        <MessageContent content={message.content} />
      </div>
    </motion.div>
  );
}

// ─── Content Renderer ───────────────────────────────────────────

function MessageContent({ content }: { content: string }) {
  // Split by double newlines for paragraphs, single for line breaks
  const parts = content.split('\n');

  return (
    <div className="space-y-1">
      {parts.map((line, i) => {
        if (line.trim() === '') {
          return <div key={i} className="h-1" />;
        }

        // Bold text: **text**
        const formatted = line.replace(
          /\*\*(.+?)\*\*/g,
          '<strong class="font-semibold text-white">$1</strong>',
        );

        // Bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div
              key={i}
              className="pl-1"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        }

        // Checkmark confirmations
        if (line.trim().startsWith('✅') || line.trim().startsWith('📅') || line.trim().startsWith('📍')) {
          return (
            <div
              key={i}
              className="font-medium"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        }

        return (
          <div
            key={i}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </div>
  );
}
