# AI Assistant — Salon Elen
## Deployment Guide

### 📦 Новые файлы (18 шт.)

```
src/lib/ai/
├── system-prompt.ts          ← Системный промпт (DE/RU/EN, FAQ, правила)
├── tools-schema.ts           ← OpenAI tool definitions (8 tools)
├── tool-executor.ts          ← Диспетчер tool calls
├── session-store.ts          ← Сессии + rate limiting (in-memory)
└── tools/
    ├── list-services.ts      ← Список услуг с переводами
    ├── list-masters.ts       ← Мастера по услугам
    ├── search-availability.ts ← Свободные слоты на день
    ├── search-month.ts       ← Обзор месяца
    ├── reserve-slot.ts       ← Резерв на 5 мин
    ├── create-draft.ts       ← Черновик бронирования
    ├── start-verification.ts ← Отправка OTP
    └── complete-booking.ts   ← Финализация записи

src/lib/booking/
├── availability-service.ts   ← Общая логика (из /api/availability)
└── finalize-booking.ts       ← Общая финализация (из email/confirm)

src/app/api/ai/chat/route.ts  ← POST endpoint с tool-calling loop

src/components/ai/
├── ChatWidget.tsx            ← Плавающий чат-виджет
└── ChatMessage.tsx           ← Компонент сообщения
```

### 🔧 Модифицированные файлы (1 шт.)

- `src/app/layout.tsx` — добавлен import + `<ChatWidget />` после `<SiteFooter />`

### 🚀 Установка

#### 1. Установить зависимость
```bash
npm install openai
```

#### 2. Добавить env переменные
```env
# .env.local
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AI_ASSISTANT_ENABLED=true
AI_MAX_TOOL_ITERATIONS=8
AI_RATE_LIMIT_PER_MINUTE=20
```

#### 3. Скопировать файлы
```bash
# Из папки ai-output скопировать в проект:
cp -r src/lib/ai/ <project>/src/lib/ai/
cp -r src/lib/booking/availability-service.ts <project>/src/lib/booking/
cp -r src/lib/booking/finalize-booking.ts <project>/src/lib/booking/
cp -r src/app/api/ai/ <project>/src/app/api/ai/
cp -r src/components/ai/ <project>/src/components/ai/
```

#### 4. Обновить layout.tsx
Или скопировать из ai-output, или вручную добавить:
```tsx
// Добавить import:
import ChatWidget from "@/components/ai/ChatWidget";

// Добавить после <SiteFooter />:
<ChatWidget locale={initialLocale} />
```

#### 5. Запустить
```bash
npm run dev
```
Виджет появится как золотая кнопка 💬 в правом нижнем углу.

### 📡 API тестирование

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Hallo, welche Leistungen bieten Sie an?",
    "locale": "de"
  }'
```

### ⚙️ Kill Switch

Чтобы отключить AI ассистента без деплоя:
```env
AI_ASSISTANT_ENABLED=false
```

### 🔜 Следующие шаги (Неделя 2-3)

- [ ] SMS верификация (tool + Zadarma/Mobizon)
- [ ] Telegram верификация (tool + existing bot)
- [ ] Голосовой режим (Whisper STT + TTS)
- [ ] Persistent sessions (Redis / Prisma table)
- [ ] Admin dashboard: AI conversation logs
