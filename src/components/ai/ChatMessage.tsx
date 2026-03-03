//------светлая тема Version 1.0
// // src/components/ai/ChatMessage.tsx
'use client';

import { motion } from 'framer-motion';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (text: string) => void;
  isLatest?: boolean;
}

export function ChatMessage({ message, onOptionClick, isLatest }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`mb-3 flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #F8BBD0 0%, #F06292 55%, #EC4899 100%)',
            boxShadow: '0 10px 22px rgba(236,72,153,0.18)',
          }}
          aria-label="Elena"
          title="Elena"
        >
          E
        </div>
      )}

      <div
        className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser ? 'rounded-tr-md' : 'rounded-tl-md'
        }`}
        style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(249,216,231,0.95) 0%, rgba(244,191,214,0.92) 55%, rgba(252,228,236,0.95) 100%)'
            : message.isError
              ? 'linear-gradient(135deg, rgba(253,236,236,0.95) 0%, rgba(255,245,245,0.95) 100%)'
              : 'rgba(255,255,255,0.92)',
          border: message.isError
            ? '1px solid rgba(244,63,94,0.25)'
            : isUser
              ? '1px solid rgba(236,72,153,0.22)'
              : '1px solid rgba(236,72,153,0.14)',
          boxShadow: isUser
            ? '0 14px 34px rgba(236,72,153,0.12), 0 6px 16px rgba(15,23,42,0.06)'
            : message.isError
              ? '0 10px 24px rgba(244,63,94,0.12)'
              : '0 14px 34px rgba(15,23,42,0.07)',
          color: message.isError ? '#7F1D1D' : '#2B1B24',
        }}
      >
        {/* soft highlight */}
        {!message.isError && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'radial-gradient(120px 80px at 20% 10%, rgba(236,72,153,0.14), rgba(236,72,153,0) 60%), radial-gradient(140px 90px at 90% 20%, rgba(251,113,133,0.12), rgba(251,113,133,0) 60%)',
              opacity: isUser ? 0.45 : 0.25,
            }}
          />
        )}

        <div className="relative">
          <MessageContent
            content={message.content}
            onOptionClick={isLatest && !isUser ? onOptionClick : undefined}
            isError={Boolean(message.isError)}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface ContentProps {
  content: string;
  onOptionClick?: (text: string) => void;
  isError?: boolean;
}

/** Allow only safe internal booking urls for [option url="..."] */
function parseOptionUrl(rawAttrs?: string): string | undefined {
  if (!rawAttrs) return undefined;
  const attrRegex = /([a-zA-Z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const key = match[1].toLowerCase();
    const value = (match[2] ?? match[3] ?? match[4] ?? '').trim();
    if (key === 'url') {
      if (value.startsWith('/booking/')) return value;
      if (/^https?:\/\/[^/]+\/booking\//i.test(value)) return value;
      return undefined;
    }
  }
  return undefined;
}

type ParsedPart =
  | { type: 'text'; value: string }
  | { type: 'option'; value: string; url?: string };

function parseContent(content: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  const regex = /\[option(?:\s+([^\]]+))?\]\s*([\s\S]*?)\s*\[\/option\]/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'option',
      value: match[2],
      url: parseOptionUrl(match[1]),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return parts;
}

function MessageContent({ content, onOptionClick, isError }: ContentProps) {
  const parts = parseContent(content);
  const hasOptions = parts.some((p) => p.type === 'option');

  if (!hasOptions) return <TextBlock text={content} isError={isError} />;

  const textParts: string[] = [];
  const options: Array<{ label: string; url?: string }> = [];

  for (const part of parts) {
    if (part.type === 'text') {
      const cleaned = part.value
        .split('\n')
        .filter((line) => !/^\s*[-*•]+\s*$/.test(line))
        .join('\n')
        .trim();
      if (cleaned) textParts.push(cleaned);
    } else {
      options.push({ label: part.value.trim(), url: part.url });
    }
  }

  return (
    <div className="space-y-2">
      {textParts.map((t, i) => (
        <TextBlock key={i} text={t} isError={isError} />
      ))}

      {options.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          {options.map((opt, i) => {
            const clickable = Boolean(opt.url || onOptionClick);
            return (
              <button
                key={i}
                disabled={!clickable}
                onClick={() => {
                  if (opt.url) {
                    window.location.assign(opt.url);
                    return;
                  }
                  onOptionClick?.(stripEmoji(opt.label));
                }}
                className="group relative w-full overflow-hidden rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-transform active:scale-[0.99] disabled:cursor-default disabled:opacity-60"
                style={{
                  color: clickable ? '#7A1C46' : '#8A6A79',
                  border: '1px solid rgba(236,72,153,0.18)',
                  background: clickable
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(252,228,236,0.75) 45%, rgba(249,216,231,0.85) 100%)'
                    : 'rgba(255,255,255,0.65)',
                  boxShadow: clickable
                    ? '0 10px 22px rgba(236,72,153,0.10), 0 6px 14px rgba(15,23,42,0.05)'
                    : 'none',
                }}
              >
                {/* shimmer */}
                {clickable && (
                  <span
                    className="pointer-events-none absolute -left-24 top-0 h-full w-24 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
                      transform: 'skewX(-20deg)',
                      animation: 'ph-shimmer 1.2s ease-in-out infinite',
                    }}
                  />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @keyframes ph-shimmer {
          0% { transform: translateX(-140px) skewX(-20deg); }
          100% { transform: translateX(520px) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}

function stripEmoji(text: string) {
  return text
    .replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u, '')
    .trim();
}

function TextBlock({ text, isError }: { text: string; isError?: boolean }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-1" />;

        const strongClass = isError ? 'font-semibold text-rose-700' : 'font-semibold text-[#2B1B24]';
        const formatted = line.replace(/\*\*(.+?)\*\*/g, `<strong class="${strongClass}">$1</strong>`);

        const isIconLine = /^[✅📅📍💅💄👁🕐]/.test(line.trim());

        return (
          <div
            key={i}
            className={isIconLine ? 'font-medium' : undefined}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </div>
  );
}




//---------- светлая тема пробую Version 2.0
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
//   onOptionClick?: (text: string) => void;
//   isLatest?: boolean;
// }

// export function ChatMessage({ message, onOptionClick, isLatest }: ChatMessageProps) {
//   const isUser = message.role === 'user';

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.2 }}
//       className={`mb-3 flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
//     >
//       {!isUser && (
//         <div
//           className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
//           style={{
//             background: 'linear-gradient(135deg, #F8BBD0 0%, #F06292 55%, #EC4899 100%)',
//             boxShadow: '0 10px 22px rgba(236,72,153,0.18)',
//           }}
//           aria-label="Elena"
//           title="Elena"
//         >
//           E
//         </div>
//       )}

//       <div
//         className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
//           isUser ? 'rounded-tr-md' : 'rounded-tl-md'
//         }`}
//         style={{
//           background: isUser
//             ? 'linear-gradient(135deg, rgba(249,216,231,0.95) 0%, rgba(244,191,214,0.92) 55%, rgba(252,228,236,0.95) 100%)'
//             : message.isError
//               ? 'linear-gradient(135deg, rgba(253,236,236,0.95) 0%, rgba(255,245,245,0.95) 100%)'
//               : 'rgba(255,255,255,0.92)',
//           border: message.isError
//             ? '1px solid rgba(244,63,94,0.25)'
//             : isUser
//               ? '1px solid rgba(236,72,153,0.22)'
//               : '1px solid rgba(236,72,153,0.14)',
//           boxShadow: isUser
//             ? '0 14px 34px rgba(236,72,153,0.12), 0 6px 16px rgba(15,23,42,0.06)'
//             : message.isError
//               ? '0 10px 24px rgba(244,63,94,0.12)'
//               : '0 14px 34px rgba(15,23,42,0.07)',
//           color: message.isError ? '#7F1D1D' : '#2B1B24',
//         }}
//       >
//         {/* soft highlight */}
//         {!message.isError && (
//           <div
//             className="pointer-events-none absolute inset-0 rounded-2xl"
//             style={{
//               background:
//                 'radial-gradient(120px 80px at 20% 10%, rgba(236,72,153,0.14), rgba(236,72,153,0) 60%), radial-gradient(140px 90px at 90% 20%, rgba(251,113,133,0.12), rgba(251,113,133,0) 60%)',
//               opacity: isUser ? 0.45 : 0.25,
//             }}
//           />
//         )}

//         {/* subtle tail */}
//         <div
//           className="pointer-events-none absolute bottom-1.5 h-3 w-3 rotate-45"
//           style={{
//             background: isUser ? 'rgba(244,191,214,0.90)' : 'rgba(255,255,255,0.92)',
//             borderLeft: isUser ? '1px solid rgba(236,72,153,0.12)' : '1px solid rgba(236,72,153,0.08)',
//             borderBottom: isUser ? '1px solid rgba(236,72,153,0.12)' : '1px solid rgba(236,72,153,0.08)',
//             right: isUser ? '-6px' : undefined,
//             left: !isUser ? '-6px' : undefined,
//           }}
//         />

//         <div className="relative">
//           <MessageContent
//             content={message.content}
//             onOptionClick={isLatest && !isUser ? onOptionClick : undefined}
//             isError={Boolean(message.isError)}
//           />
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// interface ContentProps {
//   content: string;
//   onOptionClick?: (text: string) => void;
//   isError?: boolean;
// }

// /** Allow only safe internal booking urls for [option url="..."] */
// function parseOptionUrl(rawAttrs?: string): string | undefined {
//   if (!rawAttrs) return undefined;
//   const attrRegex = /([a-zA-Z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+))/g;
//   let match: RegExpExecArray | null;
//   while ((match = attrRegex.exec(rawAttrs)) !== null) {
//     const key = match[1].toLowerCase();
//     const value = (match[2] ?? match[3] ?? match[4] ?? '').trim();
//     if (key === 'url') {
//       if (value.startsWith('/booking/')) return value;
//       if (/^https?:\/\/[^/]+\/booking\//i.test(value)) return value;
//       return undefined;
//     }
//   }
//   return undefined;
// }

// type ParsedPart =
//   | { type: 'text'; value: string }
//   | { type: 'option'; value: string; url?: string };

// function parseContent(content: string): ParsedPart[] {
//   const parts: ParsedPart[] = [];
//   const regex = /\[option(?:\s+([^\]]+))?\]\s*([\s\S]*?)\s*\[\/option\]/gi;

//   let lastIndex = 0;
//   let match: RegExpExecArray | null;

//   while ((match = regex.exec(content)) !== null) {
//     if (match.index > lastIndex) {
//       parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
//     }
//     parts.push({
//       type: 'option',
//       value: match[2],
//       url: parseOptionUrl(match[1]),
//     });
//     lastIndex = regex.lastIndex;
//   }

//   if (lastIndex < content.length) {
//     parts.push({ type: 'text', value: content.slice(lastIndex) });
//   }

//   return parts;
// }

// function MessageContent({ content, onOptionClick, isError }: ContentProps) {
//   const parts = parseContent(content);
//   const hasOptions = parts.some((p) => p.type === 'option');

//   if (!hasOptions) return <TextBlock text={content} isError={isError} />;

//   const textParts: string[] = [];
//   const options: Array<{ label: string; url?: string }> = [];

//   for (const part of parts) {
//     if (part.type === 'text') {
//       const cleaned = part.value
//         .split('\n')
//         .filter((line) => !/^\s*[-*•]+\s*$/.test(line))
//         .join('\n')
//         .trim();
//       if (cleaned) textParts.push(cleaned);
//     } else {
//       options.push({ label: part.value.trim(), url: part.url });
//     }
//   }

//   return (
//     <div className="space-y-2">
//       {textParts.map((t, i) => (
//         <TextBlock key={i} text={t} isError={isError} />
//       ))}

//       {options.length > 0 && (
//         <div className="flex flex-col gap-2 pt-1">
//           {options.map((opt, i) => {
//             const clickable = Boolean(opt.url || onOptionClick);
//             return (
//               <button
//                 key={i}
//                 disabled={!clickable}
//                 onClick={() => {
//                   if (opt.url) {
//                     window.location.assign(opt.url);
//                     return;
//                   }
//                   onOptionClick?.(stripEmoji(opt.label));
//                 }}
//                 className="group relative w-full overflow-hidden rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-transform active:scale-[0.99] disabled:cursor-default disabled:opacity-60"
//                 style={{
//                   color: clickable ? '#7A1C46' : '#8A6A79',
//                   border: '1px solid rgba(236,72,153,0.18)',
//                   background: clickable
//                     ? 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(252,228,236,0.75) 45%, rgba(249,216,231,0.88) 100%)'
//                     : 'rgba(255,255,255,0.70)',
//                   boxShadow: clickable
//                     ? '0 10px 22px rgba(236,72,153,0.10), 0 6px 14px rgba(15,23,42,0.05)'
//                     : 'none',
//                 }}
//               >
//                 {/* shimmer */}
//                 {clickable && (
//                   <span
//                     className="pointer-events-none absolute -left-24 top-0 h-full w-24 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
//                     style={{
//                       background:
//                         'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
//                       transform: 'skewX(-20deg)',
//                       animation: 'ph-shimmer 1.2s ease-in-out infinite',
//                     }}
//                   />
//                 )}
//                 {opt.label}
//               </button>
//             );
//           })}
//         </div>
//       )}

//       <style jsx global>{`
//         @keyframes ph-shimmer {
//           0% { transform: translateX(-140px) skewX(-20deg); }
//           100% { transform: translateX(520px) skewX(-20deg); }
//         }
//       `}</style>
//     </div>
//   );
// }

// function stripEmoji(text: string) {
//   return text
//     .replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u, '')
//     .trim();
// }

// function TextBlock({ text, isError }: { text: string; isError?: boolean }) {
//   const lines = text.split('\n');

//   return (
//     <div className="space-y-1.5">
//       {lines.map((line, i) => {
//         if (line.trim() === '') return <div key={i} className="h-1" />;

//         const strongClass = isError ? 'font-semibold text-rose-700' : 'font-semibold text-[#2B1B24]';
//         const formatted = line.replace(/\*\*(.+?)\*\*/g, `<strong class="${strongClass}">$1</strong>`);

//         const isIconLine = /^[✅📅📍💅💄👁🕐]/.test(line.trim());

//         return (
//           <div
//             key={i}
//             className={isIconLine ? 'font-medium' : undefined}
//             dangerouslySetInnerHTML={{ __html: formatted }}
//           />
//         );
//       })}
//     </div>
//   );
// }




//---------меняю под светлую тему
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
//   onOptionClick?: (text: string) => void;
//   isLatest?: boolean;
// }

// export function ChatMessage({ message, onOptionClick, isLatest }: ChatMessageProps) {
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
//         className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
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
//         <MessageContent
//           content={message.content}
//           onOptionClick={isLatest && !isUser ? onOptionClick : undefined}
//         />
//       </div>
//     </motion.div>
//   );
// }

// // ─── Content Renderer ───────────────────────────────────────────

// interface ContentProps {
//   content: string;
//   onOptionClick?: (text: string) => void;
// }

// /**
//  * Parse [option]...[/option] tags (with optional attributes) and regular text.
//  */
// function parseOptionUrl(rawAttrs?: string): string | undefined {
//   if (!rawAttrs) return undefined;

//   const attrRegex = /([a-zA-Z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+))/g;
//   let match: RegExpExecArray | null;
//   let rawUrl: string | undefined;

//   while ((match = attrRegex.exec(rawAttrs)) !== null) {
//     const key = match[1].toLowerCase();
//     const value = (match[2] ?? match[3] ?? match[4] ?? '').trim();
//     if (key === 'url') {
//       rawUrl = value;
//       break;
//     }
//   }

//   if (!rawUrl) return undefined;
//   if (rawUrl.startsWith('/booking/')) return rawUrl;
//   if (/^https?:\/\/[^/]+\/booking\//i.test(rawUrl)) return rawUrl;
//   return undefined;
// }

// type ParsedPart =
//   | { type: 'text'; value: string }
//   | { type: 'option'; value: string; url?: string };

// function parseContent(content: string): ParsedPart[] {
//   const parts: ParsedPart[] = [];
//   const regex = /\[option(?:\s+([^\]]+))?\]\s*([\s\S]*?)\s*\[\/option\]/gi;

//   let lastIndex = 0;
//   let match: RegExpExecArray | null;

//   while ((match = regex.exec(content)) !== null) {
//     // Text before this option
//     if (match.index > lastIndex) {
//       parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
//     }
//     parts.push({
//       type: 'option',
//       value: match[2],
//       url: parseOptionUrl(match[1]),
//     });
//     lastIndex = regex.lastIndex;
//   }

//   // Remaining text
//   if (lastIndex < content.length) {
//     parts.push({ type: 'text', value: content.slice(lastIndex) });
//   }

//   return parts;
// }

// function MessageContent({ content, onOptionClick }: ContentProps) {
//   const parts = parseContent(content);

//   // Collect options for rendering as a button group
//   const hasOptions = parts.some((p) => p.type === 'option');

//   if (!hasOptions) {
//     // Simple text rendering
//     return <TextBlock text={content} />;
//   }

//   // Mixed: text paragraphs + option buttons
//   const textParts: string[] = [];
//   const options: Array<{ label: string; url?: string }> = [];

//   for (const part of parts) {
//     if (part.type === 'text') {
//       const cleaned = part.value
//         .split('\n')
//         // Remove orphan markdown bullets left after stripping [option]...[/option].
//         .filter((line) => !/^\s*[-*•]+\s*$/.test(line))
//         .join('\n');
//       const trimmed = cleaned.trim();
//       if (trimmed) textParts.push(trimmed);
//     } else {
//       options.push({ label: part.value, url: part.url });
//     }
//   }

//   return (
//     <div className="space-y-2">
//       {/* Text content */}
//       {textParts.map((text, i) => (
//         <TextBlock key={`t-${i}`} text={text} />
//       ))}

//       {/* Option buttons */}
//       {options.length > 0 && (
//         <div className="flex flex-col gap-1.5 pt-1">
//           {options.map((opt, i) => {
//             const isClickable = Boolean(opt.url || onOptionClick);
//             return (
//             <button
//               key={`o-${i}`}
//               onClick={() => {
//                 if (opt.url) {
//                   window.location.assign(opt.url);
//                   return;
//                 }
//                 onOptionClick?.(stripEmoji(opt.label));
//               }}
//               disabled={!isClickable}
//               className="w-full rounded-lg px-3 py-2 text-left text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-default"
//               style={{
//                 background: isClickable
//                   ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 212, 255, 0.08) 100%)'
//                   : 'rgba(255, 255, 255, 0.03)',
//                 border: '1px solid rgba(255, 215, 0, 0.2)',
//                 color: isClickable ? '#FFD700' : '#888',
//               }}
//             >
//               {opt.label}
//             </button>
//           );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// /**
//  * Strip leading emoji for cleaner message when sending as user input.
//  */
// function stripEmoji(text: string): string {
//   return text.replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u, '').trim();
// }

// function TextBlock({ text }: { text: string }) {
//   const lines = text.split('\n');

//   return (
//     <div className="space-y-1">
//       {lines.map((line, i) => {
//         if (line.trim() === '') {
//           return <div key={i} className="h-1" />;
//         }

//         // Bold text: **text**
//         const formatted = line.replace(
//           /\*\*(.+?)\*\*/g,
//           '<strong class="font-semibold text-white">$1</strong>',
//         );

//         // Icon-prefixed lines
//         if (/^[✅📅📍💅💄👁🕐]/.test(line.trim())) {
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
