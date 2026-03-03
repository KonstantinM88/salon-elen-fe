# Readme03.03_04

Сводка изменений после последнего коммита (`HEAD`).

Дата: 03.03.2026  
Источник: `git diff HEAD`

## Изменённые файлы

1. `src/app/api/ai/chat/route.ts` (modified)

## Полный diff изменений

```diff
diff --git a/src/app/api/ai/chat/route.ts b/src/app/api/ai/chat/route.ts
index 4f6270e..91e6c27 100644
--- a/src/app/api/ai/chat/route.ts
+++ b/src/app/api/ai/chat/route.ts
@@ -2305,6 +2305,18 @@ async function tryHandleCatalogSelectionFastPath(
 ): Promise<ChatResponse | null> {
   const input = normalizeCatalogSelectionInput(message);
   if (!input) return null;
+  const normalizedMessage = normalizeInput(message);
+  const inputTokens = tokenizeNormalized(input);
+  const explicitCatalogPayload =
+    looksLikeServiceOptionPayload(message) || looksLikePricedOptionPayload(message);
+  const hasSelectionVerb = /\b(запис|выб|book|buchen|choose|select|auswahl)\b/u.test(
+    normalizedMessage,
+  );
+  // Prevent accidental service auto-selection from long free-form prompts
+  // (e.g. FAQ/consultation questions) that only weakly overlap with service titles.
+  if (!explicitCatalogPayload && inputTokens.length > 8 && !hasSelectionVerb) {
+    return null;
+  }
   const contextServiceIds = session.context.selectedServiceIds ?? [];
   const isAwaitingMasterChoice =
     contextServiceIds.length > 0 && !session.context.selectedMasterId;
@@ -2495,6 +2507,23 @@ async function tryHandleCatalogSelectionFastPath(
 
   if (!matchedService) return null;
 
+  const matchedServiceNorm = normalizeChoiceText(matchedService.title);
+  const matchedServiceTokens = tokenizeNormalized(matchedServiceNorm);
+  const inputTokenSet = new Set(inputTokens);
+  const overlapCount = matchedServiceTokens.reduce(
+    (acc, token) => (inputTokenSet.has(token) ? acc + 1 : acc),
+    0,
+  );
+  const hasStrongServiceMatch =
+    input === matchedServiceNorm ||
+    input.includes(matchedServiceNorm) ||
+    matchedServiceNorm.includes(input) ||
+    overlapCount >= Math.max(2, Math.ceil(matchedServiceTokens.length / 2));
+
+  if (!explicitCatalogPayload && !hasStrongServiceMatch && inputTokens.length > 4) {
+    return null;
+  }
+
   const startedMasters = Date.now();
   const mastersResult = await listMastersForServices({ serviceIds: [matchedService.id] });
   const mastersDurationMs = Date.now() - startedMasters;
```

## Кратко по смыслу изменений

1. Добавлен ранний guard в `tryHandleCatalogSelectionFastPath`, чтобы длинные свободные сообщения без явного интента выбора услуги не интерпретировались как клик по каталогу.
2. Добавлена проверка «сильного совпадения» между сообщением и названием услуги перед автопереходом к мастеру/слотам.
3. Цель изменений: устранить ложный fastpath-выбор услуги и не блокировать SSE/GPT-ветку для свободных текстовых запросов.

