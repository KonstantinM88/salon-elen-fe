# Readme01.03_04

Change report since last commit.

- Base commit (short): `9043758`
- Generated at: `01.03.2026 14:46:40,59`

## git status --short

```bash
 M src/components/ai/ChatWidget.tsx
 M src/components/ai/VoiceButton.tsx
?? public/Readme01.03_04.md
```

## git diff --name-status HEAD

```bash
M	src/components/ai/ChatWidget.tsx
M	src/components/ai/VoiceButton.tsx
```

## git diff --stat HEAD

```bash
 src/components/ai/ChatWidget.tsx  | 72 ++++++++++++++++++++++++++++++---------
 src/components/ai/VoiceButton.tsx | 35 +++++++++++++------
 2 files changed, 80 insertions(+), 27 deletions(-)
```

## Full diff (tracked files)

```diff
diff --git a/src/components/ai/ChatWidget.tsx b/src/components/ai/ChatWidget.tsx
index e87a8e1..d02ac3b 100644
--- a/src/components/ai/ChatWidget.tsx
+++ b/src/components/ai/ChatWidget.tsx
@@ -6,7 +6,12 @@ import { motion, AnimatePresence } from 'framer-motion';
 import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
 import { ChatMessage, type Message } from './ChatMessage';
 import { OtpInput } from './OtpInput';
-import { VoiceButton, type VoiceMicDebugInfo } from './VoiceButton';
+import {
+  VoiceButton,
+  type VoiceButtonHandle,
+  type VoiceMicDebugInfo,
+  type VoiceMicErrorCode,
+} from './VoiceButton';
 
 // ─── Config ─────────────────────────────────────────────────────
 
@@ -50,6 +55,21 @@ const UI_TEXT = {
 
 type SupportedLocale = keyof typeof UI_TEXT;
 
+const MIC_ENABLE_OPTION_TEXT: Record<SupportedLocale, string> = {
+  de: 'Mikrofon aktivieren',
+  ru: 'Включить микрофон',
+  en: 'Enable microphone',
+};
+
+const MIC_ACTIONABLE_ERROR_CODES = new Set<VoiceMicErrorCode>([
+  'not-allowed',
+  'not-found',
+  'in-use',
+  'insecure-context',
+  'unsupported',
+  'iframe-blocked',
+]);
+
 // ─── Types ──────────────────────────────────────────────────────
 
 type InputMode = 'text' | 'otp';
@@ -78,6 +98,7 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
 
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLTextAreaElement>(null);
+  const voiceButtonRef = useRef<VoiceButtonHandle | null>(null);
 
   // Scroll to bottom on new messages
   useEffect(() => {
@@ -208,6 +229,12 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
   const handleOptionClick = useCallback(
     (text: string) => {
       if (isLoading) return;
+
+      if (text.trim().toLowerCase() === MIC_ENABLE_OPTION_TEXT[locale].toLowerCase()) {
+        voiceButtonRef.current?.requestMicAccess();
+        return;
+      }
+
       const userMsg: Message = {
         id: `user-${Date.now()}`,
         role: 'user',
@@ -217,7 +244,7 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
       setMessages((prev) => [...prev, userMsg]);
       sendMessage(text);
     },
-    [isLoading, sendMessage],
+    [isLoading, sendMessage, locale],
   );
 
   const handleSend = useCallback(async () => {
@@ -320,19 +347,31 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
   );
 
   const handleVoiceError = useCallback(
-    (error: string) => {
-      setMessages((prev) => [
-        ...prev,
-        {
-          id: `error-voice-${Date.now()}`,
-          role: 'assistant',
-          content: error,
-          timestamp: new Date(),
-          isError: true,
-        },
-      ]);
+    (error: string, code?: VoiceMicErrorCode) => {
+      const withAction = code ? MIC_ACTIONABLE_ERROR_CODES.has(code) : false;
+      const content = withAction
+        ? `${error}\n\n[option] 🎙 ${MIC_ENABLE_OPTION_TEXT[locale]} [/option]`
+        : error;
+
+      setMessages((prev) => {
+        const last = prev[prev.length - 1];
+        if (last?.role === 'assistant' && last.content === content) {
+          return prev;
+        }
+
+        return [
+          ...prev,
+          {
+            id: `error-voice-${Date.now()}`,
+            role: 'assistant',
+            content,
+            timestamp: new Date(),
+            isError: !withAction,
+          },
+        ];
+      });
     },
-    [],
+    [locale],
   );
 
   const handleVoiceDebug = useCallback((info: VoiceMicDebugInfo) => {
@@ -428,9 +467,7 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
             <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
               {messages.map((msg, idx) => {
                 const isLatestAssistant =
-                  msg.role === 'assistant' &&
-                  !msg.isError &&
-                  idx === messages.length - 1;
+                  msg.role === 'assistant' && idx === messages.length - 1;
 
                 return (
                   <ChatMessage
@@ -510,6 +547,7 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
                     {!input.trim() && (
                       <div className="flex flex-col items-end gap-1">
                         <VoiceButton
+                          ref={voiceButtonRef}
                           onResult={handleVoiceResult}
                           onError={handleVoiceError}
                           onDebug={handleVoiceDebug}
diff --git a/src/components/ai/VoiceButton.tsx b/src/components/ai/VoiceButton.tsx
index fa47e0a..c198bfe 100644
--- a/src/components/ai/VoiceButton.tsx
+++ b/src/components/ai/VoiceButton.tsx
@@ -1,7 +1,7 @@
 // src/components/ai/VoiceButton.tsx
 'use client';
 
-import { useState, useRef, useCallback, useEffect } from 'react';
+import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Mic, Square, Loader2 } from 'lucide-react';
 
@@ -33,7 +33,7 @@ interface VoiceButtonProps {
   /** Called with transcribed text + AI response */
   onResult: (result: { transcript: string; text: string; inputMode?: string }) => void;
   /** Called on error */
-  onError?: (error: string) => void;
+  onError?: (error: string, code?: VoiceMicErrorCode) => void;
   /** Optional diagnostics callback (for admin/debug UI) */
   onDebug?: (info: VoiceMicDebugInfo) => void;
   /** Session ID for the chat */
@@ -44,6 +44,10 @@ interface VoiceButtonProps {
   disabled?: boolean;
 }
 
+export interface VoiceButtonHandle {
+  requestMicAccess: () => void;
+}
+
 // ─── Labels ─────────────────────────────────────────────────────
 
 const LABELS = {
@@ -161,14 +165,14 @@ function classifyMicError(
 
 // ─── Component ──────────────────────────────────────────────────
 
-export function VoiceButton({
+export const VoiceButton = forwardRef<VoiceButtonHandle, VoiceButtonProps>(function VoiceButton({
   onResult,
   onError,
   onDebug,
   sessionId,
   locale,
   disabled = false,
-}: VoiceButtonProps) {
+}: VoiceButtonProps, ref) {
   const t = LABELS[locale] ?? LABELS.de;
   const [state, setState] = useState<VoiceState>('idle');
   const [duration, setDuration] = useState(0);
@@ -232,7 +236,7 @@ export function VoiceButton({
         });
       } catch (err) {
         console.error('[VoiceButton] Error:', err);
-        onError?.(t.error);
+        onError?.(t.error, 'unknown');
       } finally {
         setState('idle');
         setDuration(0);
@@ -256,7 +260,7 @@ export function VoiceButton({
           permissionState: 'unknown',
           timestamp: new Date().toISOString(),
         });
-        onError?.(t.noMic);
+        onError?.(t.noMic, 'unknown');
         setState('idle');
         return;
       }
@@ -277,7 +281,7 @@ export function VoiceButton({
           permissionState: await getMicPermissionState(),
           timestamp: new Date().toISOString(),
         });
-        onError?.(t.micInsecure);
+        onError?.(t.micInsecure, 'insecure-context');
         setState('idle');
         return;
       }
@@ -300,7 +304,7 @@ export function VoiceButton({
           permissionState: await getMicPermissionState(),
           timestamp: new Date().toISOString(),
         });
-        onError?.(t.micUnsupported);
+        onError?.(t.micUnsupported, 'unsupported');
         setState('idle');
         return;
       }
@@ -377,11 +381,22 @@ export function VoiceButton({
         ...debugInfo,
       });
       onDebug?.(debugInfo);
-      onError?.(classified.message);
+      onError?.(classified.message, classified.code);
       setState('idle');
     }
   }, [sendAudio, stopRecording, onError, onDebug, t]);
 
+  useImperativeHandle(
+    ref,
+    () => ({
+      requestMicAccess: () => {
+        if (disabled || state !== 'idle') return;
+        void startRecording();
+      },
+    }),
+    [disabled, state, startRecording],
+  );
+
   const handleClick = useCallback(() => {
     if (disabled) return;
     if (state === 'recording') {
@@ -455,4 +470,4 @@ export function VoiceButton({
       </motion.button>
     </div>
   );
-}
+});
``` 
