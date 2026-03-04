import { TESTS, type TestCase, type Expectation } from "./scenarios.js";
import fs from "node:fs";
import path from "node:path";

const API = process.env.AI_API_URL || "https://permanent-halle.de/api/ai/chat";
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TEST_TIMEOUT_MS || 45000);

type JsonResponse = { text?: string; sessionId?: string; inputMode?: string };

type SSEMeta = {
  done?: boolean;
  sessionId?: string;
  messageId?: string;
  inputMode?: string;
  [k: string]: unknown;
};

type SSEEvent =
  | { t: "d"; c: string }
  | { t: "p"; step: string }
  | { t: "hb" }
  | ({ t: "m" } & SSEMeta)
  | { t: "e"; code?: string; category?: string; message?: string; retryable?: boolean };

type RunResult = {
  id: string;
  title: string;
  locale: string;
  mode: "json" | "sse";
  ok: boolean;
  errors: string[];
  ttfdMs?: number;
  totalMs: number;
  bytes?: number;
  textSample?: string;
  meta?: SSEMeta;
};

function now() {
  return Date.now();
}

function sessionId() {
  return `ai-test-${Date.now()}-${Math.floor(Math.random() * 99999)}`;
}

function countOptions(text: string) {
  const m = text.match(/\[option\]/g);
  return m ? m.length : 0;
}

function assertExpectation(
  exp: Expectation,
  ctx: { text: string; meta?: SSEMeta; ttfdMs?: number; totalMs: number },
): string | null {
  const text = ctx.text || "";
  switch (exp.kind) {
    case "containsAny":
      if (!exp.anyOf.some((s) => text.toLowerCase().includes(s.toLowerCase()))) {
        return `Expected text to contain ANY of: ${exp.anyOf.join(", ")}`;
      }
      return null;
    case "containsAll":
      if (!exp.allOf.every((s) => text.toLowerCase().includes(s.toLowerCase()))) {
        return `Expected text to contain ALL of: ${exp.allOf.join(", ")}`;
      }
      return null;
    case "notContainsAny":
      if (exp.anyOf.some((s) => text.toLowerCase().includes(s.toLowerCase()))) {
        return `Expected text NOT to contain any of: ${exp.anyOf.join(", ")}`;
      }
      return null;
    case "regex":
      if (!exp.pattern.test(text)) return `Expected text to match regex: ${exp.pattern}`;
      return null;
    case "optionsAtLeast": {
      const n = countOptions(text);
      if (n < exp.count) return `Expected at least ${exp.count} options, got ${n}`;
      return null;
    }
    case "sseMetaHas":
      if (!ctx.meta) return "Expected SSE meta, got none";
      for (const k of exp.keys) {
        if (!(k in ctx.meta)) return `Expected meta to have key: ${k}`;
      }
      return null;
    case "ttfdMaxMs":
      if (typeof ctx.ttfdMs !== "number") return "No ttfdMs measured";
      if (ctx.ttfdMs > exp.maxMs) return `TTFD too slow: ${ctx.ttfdMs}ms > ${exp.maxMs}ms`;
      return null;
    case "totalMaxMs":
      if (ctx.totalMs > exp.maxMs) return `Total too slow: ${ctx.totalMs}ms > ${exp.maxMs}ms`;
      return null;
    default:
      return `Unknown expectation ${(exp as { kind?: string }).kind}`;
  }
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function postJson(
  test: TestCase,
): Promise<{ text: string; meta?: SSEMeta; ttfdMs?: number; totalMs: number; bytes: number }> {
  const start = now();
  const res = await fetchWithTimeout(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: sessionId(),
      message: test.message,
      locale: test.locale,
      stream: true,
    }),
  });
  const totalMs = now() - start;

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const body = await res.text().catch(() => "");
    throw new Error(`Expected JSON but got ${ct}. Body: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as JsonResponse;
  const text = data.text || "";
  return { text, meta: undefined, ttfdMs: undefined, totalMs, bytes: text.length };
}

async function postSse(
  test: TestCase,
): Promise<{ text: string; meta?: SSEMeta; ttfdMs?: number; totalMs: number; bytes: number }> {
  const start = now();
  const res = await fetchWithTimeout(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({
      sessionId: sessionId(),
      message: test.message,
      locale: test.locale,
      stream: true,
    }),
  });

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/event-stream")) {
    const body = await res.text().catch(() => "");
    throw new Error(`Expected SSE but got ${ct}. Body: ${body.slice(0, 200)}`);
  }
  if (!res.body) {
    throw new Error("Expected SSE body stream, got empty body");
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();

  let buf = "";
  let text = "";
  let meta: SSEMeta | undefined;
  let bytes = 0;
  let ttfdMs: number | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    bytes += value.byteLength;
    buf += dec.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    // Parse frames separated by blank line.
    while (true) {
      const idx = buf.indexOf("\n\n");
      if (idx === -1) break;

      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);

      const lines = frame
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const jsonStr = line.slice(5).trim();
        let evt: SSEEvent | null = null;
        try {
          evt = JSON.parse(jsonStr) as SSEEvent;
        } catch {
          continue;
        }
        if (!evt) continue;

        if (evt.t === "d") {
          if (ttfdMs === undefined) ttfdMs = now() - start;
          text += evt.c;
        } else if (evt.t === "m") {
          meta = evt;
          const totalMs = now() - start;
          return { text, meta, ttfdMs, totalMs, bytes };
        } else if (evt.t === "e") {
          throw new Error(
            `SSE error: ${evt.category || ""} ${evt.code || ""} ${evt.message || ""}`.trim(),
          );
        } else {
          // Ignore p/hb
        }
      }
    }
  }

  const totalMs = now() - start;
  return { text, meta, ttfdMs, totalMs, bytes };
}

function printSummary(results: RunResult[]) {
  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  const failed = total - passed;

  console.log("\n=== AI TEST REPORT ===");
  console.log(`API: ${API}`);
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);

  const worst = results
    .filter((r) => r.ok && typeof r.ttfdMs === "number")
    .sort((a, b) => b.ttfdMs! - a.ttfdMs!)
    .slice(0, 5);

  if (worst.length) {
    console.log("\nSlowest TTFD (top 5):");
    for (const r of worst) console.log(`- ${r.id}: ${r.ttfdMs}ms (${r.title})`);
  }

  if (failed) {
    console.log("\nFailures:");
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`\nFAIL ${r.id} - ${r.title}`);
      for (const e of r.errors) console.log("   -", e);
      if (r.textSample) console.log("   sample:", JSON.stringify(r.textSample));
    }
  }
}

function writeArtifacts(results: RunResult[]) {
  const outDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(outDir, { recursive: true });

  const stamp = Date.now();
  const jsonPath = path.join(outDir, `ai-report.${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({ api: API, results }, null, 2), "utf-8");

  const junitPath = path.join(outDir, `ai-report.${stamp}.junit.xml`);
  fs.writeFileSync(junitPath, toJUnit(results), "utf-8");

  console.log(`\nSaved reports:\n- ${jsonPath}\n- ${junitPath}`);
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toJUnit(results: RunResult[]) {
  const failures = results.filter((r) => !r.ok).length;
  const tests = results.length;
  const time = (results.reduce((a, r) => a + r.totalMs, 0) / 1000).toFixed(3);

  const cases = results
    .map((r) => {
      const t = (r.totalMs / 1000).toFixed(3);
      const name = escapeXml(`${r.id} ${r.title}`);
      if (r.ok) return `<testcase classname="ai" name="${name}" time="${t}" />`;
      const msg = escapeXml(r.errors.join(" | "));
      return `<testcase classname="ai" name="${name}" time="${t}"><failure message="${msg}">${msg}</failure></testcase>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="ai" tests="${tests}" failures="${failures}" time="${time}">
${cases}
</testsuite>`;
}

async function runOne(test: TestCase): Promise<RunResult> {
  const errors: string[] = [];
  const start = now();

  try {
    const r = test.expectMode === "json" ? await postJson(test) : await postSse(test);
    const ctx = { text: r.text, meta: r.meta, ttfdMs: r.ttfdMs, totalMs: r.totalMs };

    for (const exp of test.expectations) {
      const err = assertExpectation(exp, ctx);
      if (err) errors.push(err);
    }

    const ok = errors.length === 0;
    return {
      id: test.id,
      title: test.title,
      locale: test.locale,
      mode: test.expectMode,
      ok,
      errors,
      ttfdMs: r.ttfdMs,
      totalMs: r.totalMs,
      bytes: r.bytes,
      textSample: r.text.slice(0, 200),
      meta: r.meta,
    };
  } catch (e: unknown) {
    errors.push(e instanceof Error ? e.message : String(e));
    return {
      id: test.id,
      title: test.title,
      locale: test.locale,
      mode: test.expectMode,
      ok: false,
      errors,
      totalMs: now() - start,
    };
  }
}

function selectTests() {
  const grep = (process.env.AI_TEST_GREP || "").trim().toLowerCase();
  const limitRaw = process.env.AI_TEST_LIMIT || "";
  const limit = Number(limitRaw);

  let selected = TESTS;

  if (grep) {
    selected = selected.filter((t) =>
      `${t.id} ${t.title} ${t.locale}`.toLowerCase().includes(grep),
    );
  }
  if (Number.isFinite(limit) && limit > 0) {
    selected = selected.slice(0, limit);
  }

  return selected;
}

async function main() {
  const selected = selectTests();

  if (selected.length === 0) {
    console.log("No tests selected. Check AI_TEST_GREP / AI_TEST_LIMIT filters.");
    process.exitCode = 1;
    return;
  }

  console.log(`Running ${selected.length} tests...`);
  const results: RunResult[] = [];

  for (const t of selected) {
    process.stdout.write(`- ${t.id} ... `);
    const r = await runOne(t);
    results.push(r);
    console.log(r.ok ? "OK" : "FAIL");
  }

  printSummary(results);
  writeArtifacts(results);

  const failed = results.some((r) => !r.ok);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e: unknown) => {
  console.error(e);
  process.exitCode = 1;
});
