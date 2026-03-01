# Readme01.03_05

Change report since last commit.

- Base commit (short): `da3cff7`
- Generated at: `01.03.2026 15:01:02,98`

## git status --short

```bash
 M src/components/ai/ChatWidget.tsx
?? public/Readme01.03_05.md
```

## git diff --name-status HEAD

```bash
M	src/components/ai/ChatWidget.tsx
```

## git diff --stat HEAD

```bash
 src/components/ai/ChatWidget.tsx | 65 +++++++++++++++++++++++++++++++++++++++-
 1 file changed, 64 insertions(+), 1 deletion(-)
```

## Full diff (tracked files)

```diff
diff --git a/src/components/ai/ChatWidget.tsx b/src/components/ai/ChatWidget.tsx
index d02ac3b..fb4d13c 100644
--- a/src/components/ai/ChatWidget.tsx
+++ b/src/components/ai/ChatWidget.tsx
@@ -61,6 +61,15 @@ const MIC_ENABLE_OPTION_TEXT: Record<SupportedLocale, string> = {
   en: 'Enable microphone',
 };
 
+const MIC_SETTINGS_HELP_TEXT: Record<SupportedLocale, string> = {
+  de:
+    'Öffnen Sie die Website-Berechtigungen (Schloss-Symbol in der Adresszeile), erlauben Sie das Mikrofon und laden Sie die Seite neu.',
+  ru:
+    'Откройте разрешения сайта (значок замка в адресной строке), включите микрофон и обновите страницу.',
+  en:
+    'Open site permissions (lock icon in the address bar), allow microphone access, then reload the page.',
+};
+
 const MIC_ACTIONABLE_ERROR_CODES = new Set<VoiceMicErrorCode>([
   'not-allowed',
   'not-found',
@@ -70,6 +79,39 @@ const MIC_ACTIONABLE_ERROR_CODES = new Set<VoiceMicErrorCode>([
   'iframe-blocked',
 ]);
 
+function resolveMicSettingsUrl(): string | null {
+  if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;
+
+  const ua = navigator.userAgent.toLowerCase();
+  const origin = encodeURIComponent(window.location.origin);
+
+  const isChromium =
+    (ua.includes('chrome') || ua.includes('chromium') || ua.includes('edg') || ua.includes('opr')) &&
+    !ua.includes('firefox');
+
+  if (isChromium) {
+    return `chrome://settings/content/siteDetails?site=${origin}`;
+  }
+  if (ua.includes('firefox')) {
+    return 'about:preferences#privacy';
+  }
+
+  return null;
+}
+
+function tryOpenMicSettings(): boolean {
+  if (typeof window === 'undefined') return false;
+  const url = resolveMicSettingsUrl();
+  if (!url) return false;
+
+  try {
+    window.location.assign(url);
+    return true;
+  } catch {
+    return false;
+  }
+}
+
 // ─── Types ──────────────────────────────────────────────────────
 
 type InputMode = 'text' | 'otp';
@@ -231,6 +273,27 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
       if (isLoading) return;
 
       if (text.trim().toLowerCase() === MIC_ENABLE_OPTION_TEXT[locale].toLowerCase()) {
+        // If browser already stores a hard "denied", open settings directly.
+        if (
+          voiceDebugInfo?.code === 'not-allowed' &&
+          voiceDebugInfo.permissionState === 'denied'
+        ) {
+          const opened = tryOpenMicSettings();
+          if (!opened) {
+            setMessages((prev) => [
+              ...prev,
+              {
+                id: `mic-help-${Date.now()}`,
+                role: 'assistant',
+                content: MIC_SETTINGS_HELP_TEXT[locale],
+                timestamp: new Date(),
+                isError: false,
+              },
+            ]);
+          }
+          return;
+        }
+
         voiceButtonRef.current?.requestMicAccess();
         return;
       }
@@ -244,7 +307,7 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
       setMessages((prev) => [...prev, userMsg]);
       sendMessage(text);
     },
-    [isLoading, sendMessage, locale],
+    [isLoading, sendMessage, locale, voiceDebugInfo],
   );
 
   const handleSend = useCallback(async () => {
``` 
