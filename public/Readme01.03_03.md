# Readme01.03_03

Change report since last commit.

- Base commit (short): `5a01e21`
- Generated at: `01.03.2026 14:20:23,90`

## git status --short (relevant files)

```bash
 M src/components/ai/ChatWidget.tsx
 M src/components/ai/VoiceButton.tsx
```

## git diff --name-status HEAD

```bash
M	src/components/ai/ChatWidget.tsx
M	src/components/ai/VoiceButton.tsx
```

## git diff --stat HEAD

```bash
 src/components/ai/ChatWidget.tsx  |  47 ++++++++--
 src/components/ai/VoiceButton.tsx | 184 +++++++++++++++++++++++++++++++++++++-
 2 files changed, 219 insertions(+), 12 deletions(-)
```

## Full diff (tracked files)

```diff
diff --git a/src/components/ai/ChatWidget.tsx b/src/components/ai/ChatWidget.tsx
index b6ddc6f..e87a8e1 100644
--- a/src/components/ai/ChatWidget.tsx
+++ b/src/components/ai/ChatWidget.tsx
@@ -6,7 +6,7 @@ import { motion, AnimatePresence } from 'framer-motion';
 import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
 import { ChatMessage, type Message } from './ChatMessage';
 import { OtpInput } from './OtpInput';
-import { VoiceButton } from './VoiceButton';
+import { VoiceButton, type VoiceMicDebugInfo } from './VoiceButton';
 
 // ─── Config ─────────────────────────────────────────────────────
 
@@ -73,6 +73,8 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [sessionId, setSessionId] = useState(() => generateSessionId());
   const [inputMode, setInputMode] = useState<InputMode>('text');
+  const [showVoiceDebug, setShowVoiceDebug] = useState(false);
+  const [voiceDebugInfo, setVoiceDebugInfo] = useState<VoiceMicDebugInfo | null>(null);
 
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLTextAreaElement>(null);
@@ -103,6 +105,18 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
     }
   }, [isOpen, messages.length, t.welcome]);
 
+  // Debug panel visibility for admins/support:
+  // - always on in /admin
+  // - can be enabled on public pages via ?voiceDebug=1 or localStorage.voice_debug=1
+  useEffect(() => {
+    if (typeof window === 'undefined') return;
+
+    const debugByPath = window.location.pathname.startsWith('/admin');
+    const debugByQuery = new URLSearchParams(window.location.search).get('voiceDebug') === '1';
+    const debugByStorage = window.localStorage.getItem('voice_debug') === '1';
+    setShowVoiceDebug(debugByPath || debugByQuery || debugByStorage);
+  }, []);
+
   const handleNewChat = useCallback(() => {
     setSessionId(generateSessionId());
     setMessages([
@@ -269,6 +283,8 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
 
   const handleVoiceResult = useCallback(
     (result: { transcript: string; text: string; inputMode?: string }) => {
+      setVoiceDebugInfo(null);
+
       // Add user message (transcribed text)
       if (result.transcript) {
         setMessages((prev) => [
@@ -319,6 +335,10 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
     [],
   );
 
+  const handleVoiceDebug = useCallback((info: VoiceMicDebugInfo) => {
+    setVoiceDebugInfo(info);
+  }, []);
+
   // ─── Render ───────────────────────────────────────────────────
 
   return (
@@ -488,13 +508,24 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
 
                     {/* Voice button — shown when input is empty */}
                     {!input.trim() && (
-                      <VoiceButton
-                        onResult={handleVoiceResult}
-                        onError={handleVoiceError}
-                        sessionId={sessionId}
-                        locale={locale}
-                        disabled={isLoading}
-                      />
+                      <div className="flex flex-col items-end gap-1">
+                        <VoiceButton
+                          onResult={handleVoiceResult}
+                          onError={handleVoiceError}
+                          onDebug={handleVoiceDebug}
+                          sessionId={sessionId}
+                          locale={locale}
+                          disabled={isLoading}
+                        />
+                        {showVoiceDebug && voiceDebugInfo && (
+                          <div className="max-w-[250px] rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] leading-4 text-amber-200">
+                            <div>{`voice-debug: ${voiceDebugInfo.code}`}</div>
+                            <div>{`name: ${voiceDebugInfo.errorName || '-'}`}</div>
+                            <div>{`perm: ${voiceDebugInfo.permissionState}`}</div>
+                            <div>{`secure: ${voiceDebugInfo.secureContext ? 'yes' : 'no'}, iframe: ${voiceDebugInfo.inIframe ? 'yes' : 'no'}`}</div>
+                          </div>
+                        )}
+                      </div>
                     )}
 
                     {/* Send button — shown when there's text */}
diff --git a/src/components/ai/VoiceButton.tsx b/src/components/ai/VoiceButton.tsx
index 75056d5..fa47e0a 100644
--- a/src/components/ai/VoiceButton.tsx
+++ b/src/components/ai/VoiceButton.tsx
@@ -9,11 +9,33 @@ import { Mic, Square, Loader2 } from 'lucide-react';
 
 type VoiceState = 'idle' | 'recording' | 'processing';
 
+export type VoiceMicErrorCode =
+  | 'not-allowed'
+  | 'not-found'
+  | 'in-use'
+  | 'insecure-context'
+  | 'unsupported'
+  | 'iframe-blocked'
+  | 'unknown';
+
+export interface VoiceMicDebugInfo {
+  code: VoiceMicErrorCode;
+  errorName: string;
+  errorMessage: string;
+  secureContext: boolean;
+  inIframe: boolean;
+  hasGetUserMedia: boolean;
+  permissionState: 'granted' | 'denied' | 'prompt' | 'unknown';
+  timestamp: string;
+}
+
 interface VoiceButtonProps {
   /** Called with transcribed text + AI response */
   onResult: (result: { transcript: string; text: string; inputMode?: string }) => void;
   /** Called on error */
   onError?: (error: string) => void;
+  /** Optional diagnostics callback (for admin/debug UI) */
+  onDebug?: (info: VoiceMicDebugInfo) => void;
   /** Session ID for the chat */
   sessionId: string;
   /** Current locale */
@@ -30,6 +52,12 @@ const LABELS = {
     stop: 'Aufnahme beenden',
     processing: 'Wird verarbeitet…',
     noMic: 'Kein Mikrofon verfügbar',
+    micDenied: 'Mikrofonzugriff verweigert. Bitte im Browser erlauben.',
+    micNotFound: 'Kein Mikrofon gefunden. Bitte Gerät prüfen.',
+    micInUse: 'Mikrofon wird von einer anderen App verwendet.',
+    micInsecure: 'Mikrofon benötigt HTTPS (oder localhost).',
+    micUnsupported: 'Browser unterstützt keine Audioaufnahme.',
+    micIframeBlocked: 'Mikrofon durch Browser-/Iframe-Richtlinie blockiert.',
     error: 'Spracherkennung fehlgeschlagen',
   },
   ru: {
@@ -37,6 +65,12 @@ const LABELS = {
     stop: 'Остановить запись',
     processing: 'Обработка…',
     noMic: 'Микрофон недоступен',
+    micDenied: 'Доступ к микрофону запрещён. Разрешите его в браузере.',
+    micNotFound: 'Микрофон не найден. Проверьте устройство.',
+    micInUse: 'Микрофон занят другим приложением.',
+    micInsecure: 'Для микрофона нужен HTTPS (или localhost).',
+    micUnsupported: 'Браузер не поддерживает запись аудио.',
+    micIframeBlocked: 'Микрофон заблокирован политикой iframe/сайта.',
     error: 'Ошибка распознавания голоса',
   },
   en: {
@@ -44,10 +78,20 @@ const LABELS = {
     stop: 'Stop recording',
     processing: 'Processing…',
     noMic: 'No microphone available',
+    micDenied: 'Microphone access denied. Please allow it in the browser.',
+    micNotFound: 'No microphone found. Please check your device.',
+    micInUse: 'Microphone is currently used by another application.',
+    micInsecure: 'Microphone requires HTTPS (or localhost).',
+    micUnsupported: 'This browser does not support audio recording.',
+    micIframeBlocked: 'Microphone is blocked by iframe/site policy.',
     error: 'Voice recognition failed',
   },
 } as const;
 
+type VoiceLabels = {
+  [K in keyof (typeof LABELS)['de']]: string;
+};
+
 // ─── Helpers ────────────────────────────────────────────────────
 
 /** Pick the best supported audio MIME type for MediaRecorder */
@@ -66,11 +110,61 @@ function pickMimeType(): string {
   return 'audio/webm'; // fallback
 }
 
+function isLocalhostHost(hostname: string): boolean {
+  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
+}
+
+async function getMicPermissionState(): Promise<
+  'granted' | 'denied' | 'prompt' | 'unknown'
+> {
+  try {
+    if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
+      return 'unknown';
+    }
+    const result = await navigator.permissions.query({
+      name: 'microphone' as PermissionName,
+    });
+    if (result.state === 'granted' || result.state === 'denied' || result.state === 'prompt') {
+      return result.state;
+    }
+    return 'unknown';
+  } catch {
+    return 'unknown';
+  }
+}
+
+function classifyMicError(
+  err: unknown,
+  t: VoiceLabels,
+  inIframe: boolean,
+): { message: string; code: VoiceMicErrorCode } {
+  const error = err as DOMException | undefined;
+  const name = error?.name ?? '';
+
+  if (name === 'NotAllowedError' || name === 'SecurityError') {
+    return {
+      message: inIframe ? t.micIframeBlocked : t.micDenied,
+      code: inIframe ? 'iframe-blocked' : 'not-allowed',
+    };
+  }
+  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
+    return { message: t.micNotFound, code: 'not-found' };
+  }
+  if (name === 'NotReadableError' || name === 'TrackStartError') {
+    return { message: t.micInUse, code: 'in-use' };
+  }
+  if (name === 'OverconstrainedError') {
+    return { message: t.micNotFound, code: 'not-found' };
+  }
+  return { message: t.noMic, code: 'unknown' };
+}
+
 // ─── Component ──────────────────────────────────────────────────
 
 export function VoiceButton({
   onResult,
   onError,
+  onDebug,
   sessionId,
   locale,
   disabled = false,
@@ -148,7 +242,69 @@ export function VoiceButton({
   );
 
   const startRecording = useCallback(async () => {
+    const inIframe = typeof window !== 'undefined' && window.self !== window.top;
+
     try {
+      if (typeof window === 'undefined') {
+        onDebug?.({
+          code: 'unknown',
+          errorName: 'NO_WINDOW',
+          errorMessage: 'window is undefined',
+          secureContext: false,
+          inIframe,
+          hasGetUserMedia: false,
+          permissionState: 'unknown',
+          timestamp: new Date().toISOString(),
+        });
+        onError?.(t.noMic);
+        setState('idle');
+        return;
+      }
+
+      if (
+        !window.isSecureContext &&
+        !isLocalhostHost(window.location.hostname)
+      ) {
+        onDebug?.({
+          code: 'insecure-context',
+          errorName: 'INSECURE_CONTEXT',
+          errorMessage: 'Microphone requires secure context (HTTPS or localhost)',
+          secureContext: window.isSecureContext,
+          inIframe,
+          hasGetUserMedia:
+            typeof navigator !== 'undefined' &&
+            Boolean(navigator.mediaDevices?.getUserMedia),
+          permissionState: await getMicPermissionState(),
+          timestamp: new Date().toISOString(),
+        });
+        onError?.(t.micInsecure);
+        setState('idle');
+        return;
+      }
+
+      if (
+        typeof navigator === 'undefined' ||
+        !navigator.mediaDevices ||
+        !navigator.mediaDevices.getUserMedia ||
+        typeof MediaRecorder === 'undefined'
+      ) {
+        onDebug?.({
+          code: 'unsupported',
+          errorName: 'UNSUPPORTED_API',
+          errorMessage: 'mediaDevices/getUserMedia/MediaRecorder is unavailable',
+          secureContext: window.isSecureContext,
+          inIframe,
+          hasGetUserMedia:
+            typeof navigator !== 'undefined' &&
+            Boolean(navigator.mediaDevices?.getUserMedia),
+          permissionState: await getMicPermissionState(),
+          timestamp: new Date().toISOString(),
+        });
+        onError?.(t.micUnsupported);
+        setState('idle');
+        return;
+      }
+
       const stream = await navigator.mediaDevices.getUserMedia({
         audio: {
           echoCancellation: true,
@@ -200,11 +356,31 @@ export function VoiceButton({
         });
       }, 1000);
     } catch (err) {
-      console.error('[VoiceButton] Mic error:', err);
-      onError?.(t.noMic);
+      const error = err as DOMException | undefined;
+      const errorName = error?.name ?? 'UNKNOWN';
+      const errorMessage = error?.message ?? '';
+      const classified = classifyMicError(err, t, inIframe);
+      const debugInfo: VoiceMicDebugInfo = {
+        code: classified.code,
+        errorName,
+        errorMessage,
+        secureContext:
+          typeof window !== 'undefined' ? window.isSecureContext : false,
+        inIframe,
+        hasGetUserMedia:
+          typeof navigator !== 'undefined' &&
+          Boolean(navigator.mediaDevices?.getUserMedia),
+        permissionState: await getMicPermissionState(),
+        timestamp: new Date().toISOString(),
+      };
+      console.error('[VoiceButton] Mic error:', {
+        ...debugInfo,
+      });
+      onDebug?.(debugInfo);
+      onError?.(classified.message);
       setState('idle');
     }
-  }, [sendAudio, stopRecording, onError, t.noMic]);
+  }, [sendAudio, stopRecording, onError, onDebug, t]);
 
   const handleClick = useCallback(() => {
     if (disabled) return;
@@ -279,4 +455,4 @@ export function VoiceButton({
       </motion.button>
     </div>
   );
-}
\ No newline at end of file
+}
``` 
