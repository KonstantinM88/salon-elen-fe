// src/app/api/ai/voice/route.ts
// Voice endpoint: audio → Whisper STT → forward to /api/ai/chat → return transcript + response

import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

// ─── Config ─────────────────────────────────────────────────────

const WHISPER_MODEL = 'whisper-1';

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

  // Email obfuscation normalization for RU/EN speech:
  // "name sobaka gmail tochka com" -> "name@gmail.com"
  const hasEmailIntent =
    /\b(email|e-mail|почта|емейл|имейл|майл|gmail|outlook|yahoo|sobaka|собака|точка|dot)\b/iu.test(
      text,
    ) || text.includes('@');

  if (hasEmailIntent) {
    text = text
      .replace(/ё/g, 'е')
      .replace(/(собака|sobaka)\s*[.,]/giu, '@')
      .replace(/\b(собака|sobaka)\b/giu, '@')
      .replace(/\b(точка|dot)\b/giu, '.')
      .replace(/\s*@\s*/g, '@')
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s+/g, '');

    // Handle glued forms: "userSobaka.gmail.com"
    text = text.replace(
      /^([a-z0-9._%+-]+)(?:sobaka|собака)[\s._-]*([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/iu,
      '$1@$2',
    );

    text = text.replace(/@\.{1,}/g, '@');
    if (text.includes('@')) {
      const parts = text.split('@');
      if (parts.length === 2) {
        const local = parts[0].replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
        const domain = parts[1]
          .replace(/^\.+/, '')
          .replace(/\.+/g, '.')
          .replace(/\.+$/g, '');
        if (local && domain) {
          text = `${local}@${domain}`;
        }
      }
    }
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
