import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { createRequire } from 'node:module';
import { NextRequest } from 'next/server';
import { getGiftAssistantFaq, getFootAssistantFaq } from '@/lib/ai/salon-information';

// No .env, real DB, notification or model call: only the real route's
// deterministic responses, with the existing analytics persistence stubbed.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.AI_ASSISTANT_ENABLED = 'true';
process.env.OPENAI_API_KEY = 'test-no-network';
process.env.TELEGRAM_BOT_TOKEN = '';
process.env.TELEGRAM_ADMIN_CHAT_ID = '';
process.env.RESEND_API_KEY = '';
let persistedTurns = 0;
const dbStub = {
  aiChatSession: {
    upsert: async () => ({ funnelStage: 'none', consultationTopics: '' }),
    update: async () => ({}),
  },
  aiChatTurn: { create: async () => { persistedTurns++; return { id: 'stub-turn' }; } },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(dbStub),
};
(globalThis as unknown as { prisma: unknown }).prisma = new Proxy(dbStub, {
  get(target, key) {
    if (!(key in target)) throw new Error(`Unexpected DB model: ${String(key)}`);
    return Reflect.get(target, key);
  },
});
const { POST } = createRequire(import.meta.url)('./route.ts') as {
  POST: (req: NextRequest) => Promise<Response>;
};

test('real chat endpoint answers localized gift and pedicure FAQ and follow-ups without network or business DB', async () => {
  const network = mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request'); });
  try {
    for (const locale of ['de', 'en', 'ru'] as const) {
      const ask = async (message: string, suffix = '') => {
        const response = await POST(new NextRequest('http://localhost/api/ai/chat', {
          method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': `test-${locale}` },
          body: JSON.stringify({ sessionId: `information-${locale}${suffix}`, locale, message }),
        }));
        assert.equal(response.status, 200);
        const body = await response.json();
        assert.equal(typeof body.text, 'string');
        return body.text as string;
      };
      const gift = getGiftAssistantFaq(locale);
      assert.ok((await ask(gift.find(item => item.id === 'amount')!.q)).includes('500'));
      const followUp = { de: 'Welche Designs?', en: 'Which designs?', ru: 'А какие дизайны?' }[locale];
      assert.ok((await ask(followUp)).includes(gift.find(item => item.id === 'design')!.a));
      const foot = getFootAssistantFaq(locale);
      assert.ok((await ask(foot.find(item => item.id === 'preparation')!.q, '-foot'))
        .includes(foot.find(item => item.id === 'preparation')!.a));
      const topic = { de: 'Gutschein FAQ', en: 'Gift voucher questions', ru: 'Сертификат: вопросы и ответы' }[locale];
      assert.ok((await ask(topic)).includes(`[option] ${gift[0].q} [/option]`));
      const price = { de: 'Was kostet ein Gutschein?', en: 'How much is a gift voucher?', ru: 'Сколько стоит подарочный сертификат?' }[locale];
      assert.ok((await ask(price)).includes(gift.find(item => item.id === 'amount')!.a));
      const warning = { de: 'Was kostet Fußpflege bei Diabetes?', en: 'How much is pedicure with diabetes?', ru: 'Сколько стоит педикюр при диабете?' }[locale];
      assert.ok((await ask(warning, '-warning')).includes(foot.find(item => item.id === 'diabetes')!.a));
    }
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(network.mock.callCount(), 0);
    assert.equal(persistedTurns, 18);
  } finally {
    mock.restoreAll();
  }
});
