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
  onOptionClick?: (text: string) => void;
  isLatest?: boolean;
}

export function ChatMessage({ message, onOptionClick, isLatest }: ChatMessageProps) {
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
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
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
        <MessageContent
          content={message.content}
          onOptionClick={isLatest && !isUser ? onOptionClick : undefined}
        />
      </div>
    </motion.div>
  );
}

// ─── Content Renderer ───────────────────────────────────────────

interface ContentProps {
  content: string;
  onOptionClick?: (text: string) => void;
}

/**
 * Parse [option]...[/option] tags and regular text.
 */
function parseContent(content: string): Array<{ type: 'text'; value: string } | { type: 'option'; value: string }> {
  const parts: Array<{ type: 'text'; value: string } | { type: 'option'; value: string }> = [];
  const regex = /\[option\]\s*(.*?)\s*\[\/option\]/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    // Text before this option
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'option', value: match[1] });
    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return parts;
}

function MessageContent({ content, onOptionClick }: ContentProps) {
  const parts = parseContent(content);

  // Collect options for rendering as a button group
  const hasOptions = parts.some((p) => p.type === 'option');

  if (!hasOptions) {
    // Simple text rendering
    return <TextBlock text={content} />;
  }

  // Mixed: text paragraphs + option buttons
  const textParts: string[] = [];
  const options: string[] = [];

  for (const part of parts) {
    if (part.type === 'text') {
      const cleaned = part.value
        .split('\n')
        // Remove orphan markdown bullets left after stripping [option]...[/option].
        .filter((line) => !/^\s*[-*•]+\s*$/.test(line))
        .join('\n');
      const trimmed = cleaned.trim();
      if (trimmed) textParts.push(trimmed);
    } else {
      options.push(part.value);
    }
  }

  return (
    <div className="space-y-2">
      {/* Text content */}
      {textParts.map((text, i) => (
        <TextBlock key={`t-${i}`} text={text} />
      ))}

      {/* Option buttons */}
      {options.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          {options.map((opt, i) => (
            <button
              key={`o-${i}`}
              onClick={() => onOptionClick?.(stripEmoji(opt))}
              disabled={!onOptionClick}
              className="w-full rounded-lg px-3 py-2 text-left text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-default"
              style={{
                background: onOptionClick
                  ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 212, 255, 0.08) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                color: onOptionClick ? '#FFD700' : '#888',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Strip leading emoji for cleaner message when sending as user input.
 */
function stripEmoji(text: string): string {
  return text.replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u, '').trim();
}

function TextBlock({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.trim() === '') {
          return <div key={i} className="h-1" />;
        }

        // Bold text: **text**
        const formatted = line.replace(
          /\*\*(.+?)\*\*/g,
          '<strong class="font-semibold text-white">$1</strong>',
        );

        // Icon-prefixed lines
        if (/^[✅📅📍💅💄👁🕐]/.test(line.trim())) {
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



// // src/components/ai/ChatMessage.tsx
// 'use client';

// import { motion } from 'framer-motion';

// // ─── Types ──────────────────────────────────────────────────────

// export interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
//   isError?: boolean;
// }

// // ─── Component ──────────────────────────────────────────────────

// interface ChatMessageProps {
//   message: Message;
// }

// export function ChatMessage({ message }: ChatMessageProps) {
//   const isUser = message.role === 'user';

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.2 }}
//       className={`mb-3 flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
//     >
//       {/* Avatar */}
//       {!isUser && (
//         <div
//           className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
//           style={{
//             background: 'linear-gradient(135deg, #FFD700, #FFA000)',
//           }}
//         >
//           E
//         </div>
//       )}

//       {/* Bubble */}
//       <div
//         className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
//           isUser
//             ? 'rounded-tr-sm text-white'
//             : message.isError
//               ? 'rounded-tl-sm text-red-300'
//               : 'rounded-tl-sm text-gray-200'
//         }`}
//         style={{
//           background: isUser
//             ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(0, 212, 255, 0.15) 100%)'
//             : message.isError
//               ? 'rgba(239, 68, 68, 0.1)'
//               : 'rgba(255, 255, 255, 0.05)',
//           border: isUser
//             ? '1px solid rgba(255, 215, 0, 0.15)'
//             : '1px solid rgba(255, 255, 255, 0.05)',
//         }}
//       >
//         {/* Render text with line breaks and basic formatting */}
//         <MessageContent content={message.content} />
//       </div>
//     </motion.div>
//   );
// }

// // ─── Content Renderer ───────────────────────────────────────────

// function MessageContent({ content }: { content: string }) {
//   // Split by double newlines for paragraphs, single for line breaks
//   const parts = content.split('\n');

//   return (
//     <div className="space-y-1">
//       {parts.map((line, i) => {
//         if (line.trim() === '') {
//           return <div key={i} className="h-1" />;
//         }

//         // Bold text: **text**
//         const formatted = line.replace(
//           /\*\*(.+?)\*\*/g,
//           '<strong class="font-semibold text-white">$1</strong>',
//         );

//         // Bullet points
//         if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
//           return (
//             <div
//               key={i}
//               className="pl-1"
//               dangerouslySetInnerHTML={{ __html: formatted }}
//             />
//           );
//         }

//         // Checkmark confirmations
//         if (line.trim().startsWith('✅') || line.trim().startsWith('📅') || line.trim().startsWith('📍')) {
//           return (
//             <div
//               key={i}
//               className="font-medium"
//               dangerouslySetInnerHTML={{ __html: formatted }}
//             />
//           );
//         }

//         return (
//           <div
//             key={i}
//             dangerouslySetInnerHTML={{ __html: formatted }}
//           />
//         );
//       })}
//     </div>
//   );
// }
