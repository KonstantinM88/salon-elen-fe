// src/app/api/ai/voice/route.ts
// Voice endpoint: audio → Whisper STT → forward to /api/ai/chat → return transcript + response

import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

// ─── Config ─────────────────────────────────────────────────────

const WHISPER_MODEL = 'whisper-1';

const VALID_EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const VALID_PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/;
const EMAIL_INTENT_RE =
  /\b(email|e-mail|почта|емейл|имейл|майл|gmail|outlook|yahoo|sobaka|собака|точка|dot)\b/iu;
const PHONE_INTENT_RE =
  /\b(телефон|номер|phone|mobile|handy|kontakt|контакт|telegram|телеграм|whatsapp)\b/iu;

const RU_UNITS: Record<string, number> = {
  ноль: 0,
  нуль: 0,
  один: 1,
  одна: 1,
  два: 2,
  две: 2,
  три: 3,
  четыре: 4,
  пять: 5,
  шесть: 6,
  семь: 7,
  восемь: 8,
  девять: 9,
};

const RU_TEENS: Record<string, number> = {
  десять: 10,
  одиннадцать: 11,
  двенадцать: 12,
  тринадцать: 13,
  четырнадцать: 14,
  пятнадцать: 15,
  шестнадцать: 16,
  семнадцать: 17,
  восемнадцать: 18,
  девятнадцать: 19,
};

const RU_TENS: Record<string, number> = {
  двадцать: 20,
  тридцать: 30,
  сорок: 40,
  пятьдесят: 50,
  шестьдесят: 60,
  семьдесят: 70,
  восемьдесят: 80,
  девяносто: 90,
};

const RU_HUNDREDS: Record<string, number> = {
  сто: 100,
  двести: 200,
  триста: 300,
  четыреста: 400,
  пятьсот: 500,
  шестьсот: 600,
  семьсот: 700,
  восемьсот: 800,
  девятьсот: 900,
};

const RU_TO_LATIN_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

function transliterateRu(text: string): string {
  return text.replace(/[а-яё]/giu, (ch) => {
    const lower = ch.toLowerCase();
    return RU_TO_LATIN_MAP[lower] ?? lower;
  });
}

function sanitizeEmailCandidate(candidate: string): string {
  const match = candidate.match(/[\p{L}0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu);
  if (!match) return candidate.trim();

  const value = match[0];
  const parts = value.split('@');
  if (parts.length !== 2) return value;

  const local = transliterateRu(parts[0].toLowerCase())
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/[^a-z0-9._%+-]/g, '');
  const domain = transliterateRu(parts[1].toLowerCase())
    .replace(/\bjmail\b/g, 'gmail')
    .replace(/^\.+/, '')
    .replace(/\.+/g, '.')
    .replace(/\.+$/g, '')
    .replace(/[^a-z0-9.-]/g, '');
  if (!local || !domain) return value;
  return `${local}@${domain}`.toLowerCase();
}

function extractEmailCandidate(text: string): string | null {
  const normalized = text.toLowerCase().replace(/ё/g, 'е');
  const hasEmailIntent =
    EMAIL_INTENT_RE.test(normalized) ||
    normalized.includes('@') ||
    normalized.includes('sobaka') ||
    normalized.includes('собака');
  if (!hasEmailIntent) {
    return null;
  }

  const glued = normalized.match(
    /([\p{L}0-9._%+-]+)(?:sobaka|собака)[\s._-]*([a-z0-9-]+(?:\.[a-z0-9-]+)+)/iu,
  );
  if (glued) {
    return sanitizeEmailCandidate(`${glued[1]}@${glued[2]}`);
  }

  const replaced = normalized
    .replace(/(собака|sobaka)\s*[.,]/giu, '@')
    .replace(/(собака|sobaka)/giu, '@')
    .replace(/\b(точка|dot)\b/giu, '.')
    .replace(/\s*@\s*/g, '@')
    .replace(/\s*\.\s*/g, '.')
    .replace(/@\.{1,}/g, '@');

  const match = replaced.match(/[\p{L}0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/iu);
  if (!match) return null;

  return sanitizeEmailCandidate(match[0]);
}

function isSpokenPhoneToken(token: string): boolean {
  return (
    token in RU_UNITS ||
    token in RU_TEENS ||
    token in RU_TENS ||
    token in RU_HUNDREDS ||
    /^\d+$/.test(token)
  );
}

function parseSpokenPhoneTokens(tokens: string[]): string {
  let out = '';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (/^\d+$/.test(token)) {
      out += token;
      continue;
    }

    const hundred = RU_HUNDREDS[token];
    if (hundred !== undefined) {
      let value = hundred;
      const next = tokens[i + 1];
      if (next) {
        const teen = RU_TEENS[next];
        if (teen !== undefined) {
          value += teen;
          i += 1;
        } else {
          const tens = RU_TENS[next];
          if (tens !== undefined) {
            value += tens;
            i += 1;
            const unitAfterTens = RU_UNITS[tokens[i + 1]];
            if (unitAfterTens !== undefined) {
              value += unitAfterTens;
              i += 1;
            }
          } else {
            const unit = RU_UNITS[next];
            if (unit !== undefined) {
              value += unit;
              i += 1;
            }
          }
        }
      }
      out += String(value);
      continue;
    }

    const teen = RU_TEENS[token];
    if (teen !== undefined) {
      out += String(teen);
      continue;
    }

    const tens = RU_TENS[token];
    if (tens !== undefined) {
      let value = tens;
      const unit = RU_UNITS[tokens[i + 1]];
      if (unit !== undefined) {
        value += unit;
        i += 1;
      }
      out += String(value);
      continue;
    }

    const unit = RU_UNITS[token];
    if (unit !== undefined) {
      out += String(unit);
    }
  }

  return out;
}

function extractSpokenPhone(text: string): string | null {
  const normalized = text.toLowerCase().replace(/ё/g, 'е');
  if (!PHONE_INTENT_RE.test(normalized)) return null;

  const tokens = normalized
    .split(/[^a-zа-я0-9+]+/iu)
    .map((token) => token.trim())
    .filter(Boolean);
  if (tokens.length === 0) return null;

  let bestDigits = '';
  let bestHasPlus = false;

  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i];
    const startsChunk = token === '+' || token === 'плюс' || isSpokenPhoneToken(token);
    if (!startsChunk) {
      i += 1;
      continue;
    }

    let hasPlus = token === '+' || token === 'плюс';
    const chunk: string[] = [];
    if (!hasPlus && isSpokenPhoneToken(token)) {
      chunk.push(token);
    }
    i += 1;

    while (i < tokens.length) {
      const next = tokens[i];
      if (next === '+' || next === 'плюс') {
        hasPlus = true;
        i += 1;
        continue;
      }
      if (!isSpokenPhoneToken(next)) break;
      chunk.push(next);
      i += 1;
    }

    const digits = parseSpokenPhoneTokens(chunk).replace(/\D/g, '');
    if (digits.length > bestDigits.length) {
      bestDigits = digits;
      bestHasPlus = hasPlus;
    }
  }

  if (bestDigits.length < 7) return null;

  if (bestHasPlus) return `+${bestDigits}`;
  if (bestDigits.startsWith('49') || bestDigits.startsWith('38')) return `+${bestDigits}`;
  return bestDigits;
}

/** Map locale to Whisper language hint (ISO 639-1) */
function whisperLanguage(locale: string): string | undefined {
  switch (locale) {
    case 'de':
      return 'de';
    case 'ru':
      return 'ru';
    case 'en':
      return 'en';
    default:
      return undefined; // let Whisper auto-detect
  }
}

function normalizeVoiceTranscript(raw: string, locale: string): string {
  let text = raw.trim();
  if (!text) return text;

  const hasEmailAlready = VALID_EMAIL_RE.test(text);
  const emailCandidate = extractEmailCandidate(text);
  if (emailCandidate && (!hasEmailAlready || !text.toLowerCase().includes(emailCandidate))) {
    text = `${text} ${emailCandidate}`;
  }

  const hasPhoneAlready = VALID_PHONE_RE.test(text);
  const phoneCandidate = extractSpokenPhone(text);
  if (phoneCandidate && !hasPhoneAlready) {
    text = `${text} ${phoneCandidate}`;
  }

  // Minor punctuation cleanup after STT.
  if (locale === 'ru') {
    text = text.replace(/\s{2,}/g, ' ').trim();
  }

  return text;
}

// ─── Handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI not configured (missing OPENAI_API_KEY)' },
      { status: 503 },
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const sessionId = formData.get('sessionId') as string | null;
    const locale = (formData.get('locale') as string | null) ?? 'de';

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'Missing audio file' },
        { status: 400 },
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 },
      );
    }

    // Validate audio size (max 25MB — Whisper limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large (max 25MB)' },
        { status: 413 },
      );
    }

    // ── Step 1: Whisper STT ────────────────────────────────────
    const client = new OpenAI({ apiKey });

    const startSTT = Date.now();

    // Convert Blob → File for OpenAI SDK
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = audioFile instanceof File ? audioFile.name : 'voice.webm';
    const file = await toFile(audioBuffer, fileName, {
      type: audioFile.type || 'audio/webm',
    });

    const transcription = await client.audio.transcriptions.create({
      model: WHISPER_MODEL,
      file,
      language: whisperLanguage(locale),
      response_format: 'text',
    });

    const sttMs = Date.now() - startSTT;
    const transcriptRaw =
      typeof transcription === 'string'
        ? transcription.trim()
        : String(transcription).trim();
    const transcript = normalizeVoiceTranscript(transcriptRaw, locale);

    console.log(
      `[AI Voice] STT ${sttMs}ms locale=${locale} len=${transcript.length} text="${transcript.slice(0, 80)}"`,
    );

    if (!transcript) {
      const emptyMsg =
        locale === 'ru'
          ? 'Не удалось распознать речь. Попробуйте ещё раз.'
          : locale === 'en'
            ? 'Could not recognize speech. Please try again.'
            : 'Sprache konnte nicht erkannt werden. Bitte versuchen Sie es erneut.';

      return NextResponse.json({
        transcript: '',
        text: emptyMsg,
        sessionId,
      });
    }

    // ── Step 2: Forward to chat endpoint ───────────────────────
    const startChat = Date.now();

    // Build absolute URL for internal fetch
    const protocol = req.headers.get('x-forwarded-proto') ?? 'http';
    const host = req.headers.get('host') ?? 'localhost:3000';
    const chatUrl = `${protocol}://${host}/api/ai/chat`;

    const chatRes = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message: transcript,
        locale,
        inputMode: 'voice',
      }),
    });

    const chatMs = Date.now() - startChat;

    if (!chatRes.ok) {
      console.error(`[AI Voice] Chat forwarding failed: ${chatRes.status}`);
      return NextResponse.json(
        { error: 'Chat processing failed', transcript },
        { status: 502 },
      );
    }

    const chatData = await chatRes.json();

    console.log(
      `[AI Voice] Chat ${chatMs}ms total=${sttMs + chatMs}ms`,
    );

    return NextResponse.json({
      transcript,
      text: chatData.text,
      sessionId: chatData.sessionId ?? sessionId,
      inputMode: chatData.inputMode,
      toolCalls: chatData.toolCalls,
    });
  } catch (error) {
    console.error('[AI Voice] Error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `Whisper API error: ${error.status}` },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: 'Internal voice processing error' },
      { status: 500 },
    );
  }
}
