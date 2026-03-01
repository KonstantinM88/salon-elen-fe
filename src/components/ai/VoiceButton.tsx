// src/components/ai/VoiceButton.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────

type VoiceState = 'idle' | 'recording' | 'processing';

interface VoiceButtonProps {
  /** Called with transcribed text + AI response */
  onResult: (result: { transcript: string; text: string; inputMode?: string }) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Session ID for the chat */
  sessionId: string;
  /** Current locale */
  locale: 'de' | 'ru' | 'en';
  /** Whether the chat is currently loading */
  disabled?: boolean;
}

// ─── Labels ─────────────────────────────────────────────────────

const LABELS = {
  de: {
    record: 'Sprachaufnahme starten',
    stop: 'Aufnahme beenden',
    processing: 'Wird verarbeitet…',
    noMic: 'Kein Mikrofon verfügbar',
    error: 'Spracherkennung fehlgeschlagen',
  },
  ru: {
    record: 'Начать запись голоса',
    stop: 'Остановить запись',
    processing: 'Обработка…',
    noMic: 'Микрофон недоступен',
    error: 'Ошибка распознавания голоса',
  },
  en: {
    record: 'Start voice recording',
    stop: 'Stop recording',
    processing: 'Processing…',
    noMic: 'No microphone available',
    error: 'Voice recognition failed',
  },
} as const;

// ─── Helpers ────────────────────────────────────────────────────

/** Pick the best supported audio MIME type for MediaRecorder */
function pickMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'audio/webm'; // fallback
}

// ─── Component ──────────────────────────────────────────────────

export function VoiceButton({
  onResult,
  onError,
  sessionId,
  locale,
  disabled = false,
}: VoiceButtonProps) {
  const t = LABELS[locale] ?? LABELS.de;
  const [state, setState] = useState<VoiceState>('idle');
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  const sendAudio = useCallback(
    async (blob: Blob) => {
      setState('processing');

      try {
        const formData = new FormData();
        // Determine extension from MIME
        const ext = mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm';
        formData.append('audio', blob, `voice.${ext}`);
        formData.append('sessionId', sessionId);
        formData.append('locale', locale);

        const res = await fetch('/api/ai/voice', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        onResult({
          transcript: data.transcript,
          text: data.text,
          inputMode: data.inputMode,
        });
      } catch (err) {
        console.error('[VoiceButton] Error:', err);
        onError?.(t.error);
      } finally {
        setState('idle');
        setDuration(0);
      }
    },
    [sessionId, locale, onResult, onError, t.error],
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      mimeTypeRef.current = pickMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeTypeRef.current,
      });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        chunksRef.current = [];

        // Only send if we have meaningful audio (>0.3s, ~5KB)
        if (blob.size > 5000) {
          sendAudio(blob);
        } else {
          setState('idle');
          setDuration(0);
        }
      };

      recorder.start(250); // collect in 250ms chunks
      setState('recording');
      setDuration(0);

      // Duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => {
          const next = d + 1;
          // Auto-stop at 60 seconds
          if (next >= 60) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('[VoiceButton] Mic error:', err);
      onError?.(t.noMic);
      setState('idle');
    }
  }, [sendAudio, stopRecording, onError, t.noMic]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (state === 'recording') {
      stopRecording();
    } else if (state === 'idle') {
      startRecording();
    }
    // If 'processing', ignore clicks
  }, [disabled, state, stopRecording, startRecording]);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  return (
    <div className="relative flex items-center">
      {/* Duration badge */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="mr-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1"
            style={{ background: 'rgba(239, 68, 68, 0.15)' }}
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs tabular-nums text-red-400">
              {formatDuration(duration)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <motion.button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        whileTap={{ scale: 0.9 }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
        style={{
          background: isRecording
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : isProcessing
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.08)',
          border: isRecording
            ? '1px solid rgba(239, 68, 68, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.1)',
        }}
        title={
          isRecording ? t.stop : isProcessing ? t.processing : t.record
        }
        aria-label={
          isRecording ? t.stop : isProcessing ? t.processing : t.record
        }
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : isRecording ? (
          <Square className="h-3.5 w-3.5 text-white" fill="white" />
        ) : (
          <Mic className="h-4 w-4 text-gray-400" />
        )}
      </motion.button>
    </div>
  );
}