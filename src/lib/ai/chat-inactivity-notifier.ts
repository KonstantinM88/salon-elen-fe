import type { Locale } from '@/i18n/locales';
import { formatInOrgTzDateTime } from '@/lib/orgTime';
import {
  getSession,
  type ChatHistoryEntry,
} from '@/lib/ai/session-store';
import {
  assertTelegramAdminDelivery,
  sendTelegramAdminMessage,
} from '@/lib/telegram/sender';

const DEFAULT_INACTIVITY_DELAY_MS = 120_000;
const STATE_TTL_MS = 35 * 60 * 1000;
const TELEGRAM_CHUNK_LENGTH = 3_600;

interface InactivityNotificationState {
  generation: number;
  locale: Locale;
  transcript: ChatHistoryEntry[];
  seenEntries: WeakSet<ChatHistoryEntry>;
  timer?: ReturnType<typeof setTimeout>;
  cleanupTimer?: ReturnType<typeof setTimeout>;
  lastNotifiedUserMessageAt?: number;
}

declare global {
  // Process-local by design, matching the existing in-memory AI session store.
  var __aiChatInactivityNotificationStates:
    | Map<string, InactivityNotificationState>
    | undefined;
}

function getStateStore(): Map<string, InactivityNotificationState> {
  if (!global.__aiChatInactivityNotificationStates) {
    global.__aiChatInactivityNotificationStates = new Map();
  }

  return global.__aiChatInactivityNotificationStates;
}

function unrefTimer(timer: ReturnType<typeof setTimeout>): void {
  if (typeof timer === 'object' && typeof timer.unref === 'function') {
    timer.unref();
  }
}

function clearTimer(timer?: ReturnType<typeof setTimeout>): void {
  if (timer !== undefined) {
    clearTimeout(timer);
  }
}

function inactivityDelayMs(): number {
  const configured = Number(process.env.AI_CHAT_INACTIVITY_NOTIFY_MS);
  return Number.isFinite(configured) && configured >= 1_000
    ? configured
    : DEFAULT_INACTIVITY_DELAY_MS;
}

function syncTranscript(
  sessionId: string,
  state: InactivityNotificationState,
): void {
  const history = getSession(sessionId)?.context.chatHistory ?? [];

  for (const entry of history) {
    if (state.seenEntries.has(entry)) continue;

    state.seenEntries.add(entry);
    state.transcript.push({ ...entry });
  }
}

function armStateCleanup(
  sessionId: string,
  state: InactivityNotificationState,
): void {
  clearTimer(state.cleanupTimer);

  state.cleanupTimer = setTimeout(() => {
    const current = getStateStore().get(sessionId);
    if (current !== state) return;

    clearTimer(current.timer);
    getStateStore().delete(sessionId);
  }, STATE_TTL_MS);
  unrefTimer(state.cleanupTimer);
}

function latestUserMessageAt(transcript: ChatHistoryEntry[]): number | null {
  for (let index = transcript.length - 1; index >= 0; index -= 1) {
    const entry = transcript[index];
    if (entry.role === 'user') return entry.timestamp;
  }

  return null;
}

function normalizeTranscriptContent(content: string): string {
  return content
    .replace(
      /\[option(?:\s+[^\]]+)?\]\s*([\s\S]*?)\s*\[\/option\]/gi,
      (_match, label: string) => `• ${label.trim()}`,
    )
    .trim();
}

export function formatAiChatInactivityTranscript({
  sessionId,
  locale,
  transcript,
}: {
  sessionId: string;
  locale: Locale;
  transcript: ChatHistoryEntry[];
}): string {
  const visibleTranscript = transcript.filter((entry) => entry.content.trim());
  const firstMessageAt = visibleTranscript[0]?.timestamp ?? Date.now();
  const lastMessageAt =
    visibleTranscript[visibleTranscript.length - 1]?.timestamp ?? firstMessageAt;
  const dialogue = visibleTranscript
    .map((entry) => {
      const author = entry.role === 'user' ? 'Клиент' : 'Elen-AI';
      const icon = entry.role === 'user' ? '👤' : '🤖';
      const time = formatInOrgTzDateTime(new Date(entry.timestamp), 'ru-RU');
      return `${icon} ${author} · ${time}\n${normalizeTranscriptContent(entry.content)}`;
    })
    .join('\n\n');

  return [
    '🔔 AI-чат: клиент не пишет 2 минуты',
    '',
    `Сессия: ${sessionId}`,
    `Язык клиента: ${locale.toUpperCase()}`,
    `Начало диалога: ${formatInOrgTzDateTime(new Date(firstMessageAt), 'ru-RU')}`,
    `Последняя активность: ${formatInOrgTzDateTime(new Date(lastMessageAt), 'ru-RU')}`,
    `Сообщений: ${visibleTranscript.length}`,
    '',
    'Полная переписка:',
    dialogue,
  ].join('\n');
}

export function splitTelegramText(
  text: string,
  maxLength = TELEGRAM_CHUNK_LENGTH,
): string[] {
  if (!text) return [];
  if (!Number.isInteger(maxLength) || maxLength < 100) {
    throw new Error('Telegram chunk length must be an integer of at least 100');
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    const minimumPreferredBreak = Math.floor(maxLength * 0.6);
    const breakCandidates = [
      remaining.lastIndexOf('\n\n', maxLength),
      remaining.lastIndexOf('\n', maxLength),
      remaining.lastIndexOf(' ', maxLength),
    ];
    let breakAt =
      breakCandidates.find((candidate) => candidate >= minimumPreferredBreak) ??
      maxLength;

    const previousCodeUnit = remaining.charCodeAt(breakAt - 1);
    const nextCodeUnit = remaining.charCodeAt(breakAt);
    if (
      previousCodeUnit >= 0xd800 &&
      previousCodeUnit <= 0xdbff &&
      nextCodeUnit >= 0xdc00 &&
      nextCodeUnit <= 0xdfff
    ) {
      breakAt -= 1;
    }

    chunks.push(remaining.slice(0, breakAt).trimEnd());
    remaining = remaining.slice(breakAt).trimStart();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

async function deliverTranscript({
  sessionId,
  generation,
  scheduledUserMessageAt,
}: {
  sessionId: string;
  generation: number;
  scheduledUserMessageAt: number;
}): Promise<void> {
  const state = getStateStore().get(sessionId);
  if (!state || state.generation !== generation) return;

  state.timer = undefined;
  syncTranscript(sessionId, state);

  const currentUserMessageAt = latestUserMessageAt(state.transcript);
  if (
    currentUserMessageAt === null ||
    currentUserMessageAt !== scheduledUserMessageAt ||
    (state.lastNotifiedUserMessageAt ?? 0) >= currentUserMessageAt
  ) {
    return;
  }

  const message = formatAiChatInactivityTranscript({
    sessionId,
    locale: state.locale,
    transcript: state.transcript,
  });
  const chunks = splitTelegramText(message);

  try {
    for (let index = 0; index < chunks.length; index += 1) {
      const part =
        chunks.length > 1
          ? `📄 Часть ${index + 1}/${chunks.length}\n\n${chunks[index]}`
          : chunks[index];
      const results = await sendTelegramAdminMessage(part, {
        disableWebPagePreview: true,
      });
      assertTelegramAdminDelivery(results);
    }

    state.lastNotifiedUserMessageAt = currentUserMessageAt;
    console.log(
      `[AI Chat Inactivity] Transcript sent session=${sessionId.slice(0, 8)}... messages=${state.transcript.length} chunks=${chunks.length}`,
    );
  } catch (error) {
    console.error(
      `[AI Chat Inactivity] Failed to send transcript session=${sessionId.slice(0, 8)}...`,
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Cancels any pending notification as soon as a new client message is accepted.
 * The returned generation must be passed to scheduleAiChatInactivityNotification.
 */
export function beginAiChatInactivityWindow(
  sessionId: string,
  locale: Locale,
): number {
  const store = getStateStore();
  const state = store.get(sessionId) ?? {
    generation: 0,
    locale,
    transcript: [],
    seenEntries: new WeakSet<ChatHistoryEntry>(),
  };

  clearTimer(state.timer);
  state.timer = undefined;
  state.generation += 1;
  state.locale = locale;
  syncTranscript(sessionId, state);
  store.set(sessionId, state);
  armStateCleanup(sessionId, state);

  return state.generation;
}

/** Schedule an admin transcript after 120 seconds from the latest client message. */
export function scheduleAiChatInactivityNotification({
  sessionId,
  generation,
}: {
  sessionId: string;
  generation: number;
}): void {
  const state = getStateStore().get(sessionId);
  if (!state || state.generation !== generation) return;

  syncTranscript(sessionId, state);
  const userMessageAt = latestUserMessageAt(state.transcript);
  if (
    userMessageAt === null ||
    (state.lastNotifiedUserMessageAt ?? 0) >= userMessageAt
  ) {
    return;
  }

  clearTimer(state.timer);
  const remainingDelay = Math.max(
    0,
    inactivityDelayMs() - (Date.now() - userMessageAt),
  );

  state.timer = setTimeout(() => {
    void deliverTranscript({
      sessionId,
      generation,
      scheduledUserMessageAt: userMessageAt,
    });
  }, remainingDelay);
  unrefTimer(state.timer);
  armStateCleanup(sessionId, state);

  console.log(
    `[AI Chat Inactivity] Scheduled session=${sessionId.slice(0, 8)}... delayMs=${remainingDelay}`,
  );
}
