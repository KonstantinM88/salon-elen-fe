import assert from "node:assert/strict";
import test from "node:test";
import {
  sendTelegramMessage,
  sendTelegramPhoto,
  splitTelegramText,
} from "@/lib/telegram/sender";

test("splitTelegramText preserves text and prefers newline boundaries", () => {
  const text = [
    "first short line",
    "second line is longer",
    "third line",
    "fourth line",
  ].join("\n");
  const parts = splitTelegramText(text, 24);

  assert.ok(parts.length > 1);
  assert.ok(parts.every((part) => part.length <= 24));
  assert.equal(parts.join(""), text);
  assert.ok(parts.slice(0, -1).every((part) => part.endsWith("\n")));
});

test("splitTelegramText hard-splits a line without boundaries", () => {
  const text = "x".repeat(45);
  const parts = splitTelegramText(text, 20);

  assert.deepEqual(parts.map((part) => part.length), [20, 20, 5]);
  assert.equal(parts.join(""), text);
});

test("splitTelegramText rejects invalid limits", () => {
  assert.throws(() => splitTelegramText("text", 4_097));
  assert.throws(() => splitTelegramText("text", 0));
});

test("sendTelegramMessage sends parts in order and markup only on the last part", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const bodies: Array<Record<string, unknown>> = [];
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await sendTelegramMessage({
      chatId: "123",
      text: "x".repeat(8_500),
      replyMarkup: {
        inline_keyboard: [[{ text: "Done", callback_data: "done" }]],
      },
    });

    assert.equal(result.ok, true);
    assert.equal(result.partsSent, 3);
    assert.equal(bodies.length, 3);
    assert.equal("reply_markup" in bodies[0], false);
    assert.equal("reply_markup" in bodies[1], false);
    assert.deepEqual(bodies[2].reply_markup, {
      inline_keyboard: [[{ text: "Done", callback_data: "done" }]],
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalToken;
  }
});

test("sendTelegramMessage stops after a failed part", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  let calls = 0;
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(
      JSON.stringify(calls === 2 ? { ok: false, description: "failed" } : { ok: true }),
      { status: calls === 2 ? 400 : 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const result = await sendTelegramMessage({
      chatId: "123",
      text: "x".repeat(9_000),
    });

    assert.equal(result.ok, false);
    assert.equal(result.partsSent, 1);
    assert.equal(result.totalParts, 3);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalToken;
  }
});

test("sendTelegramPhoto uploads a PNG with its caption", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  let requestUrl = "";
  const requestBodies: FormData[] = [];
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requestUrl = String(input);
    requestBodies.push(init?.body as FormData);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await sendTelegramPhoto({
      chatId: "123",
      photo: Buffer.from([137, 80, 78, 71]),
      caption: "Daily chart",
    });

    assert.equal(result.ok, true);
    assert.match(requestUrl, /sendPhoto$/);
    assert.equal(requestBodies[0]?.get("chat_id"), "123");
    assert.equal(requestBodies[0]?.get("caption"), "Daily chart");
    assert.ok(requestBodies[0]?.get("photo") instanceof Blob);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalToken;
  }
});
