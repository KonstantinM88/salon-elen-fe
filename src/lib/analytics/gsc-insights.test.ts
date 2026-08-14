import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPopularQueryAnalysis,
  buildDeterministicRecommendations,
  formatGscCtr,
  formatGscInsightsMarkdown,
  formatGscInsightsPlainText,
  formatGscPosition,
  validateRecommendationLines,
} from "@/lib/analytics/gsc-insights";
import { LOCAL_COMPETITOR_PROFILES } from "@/lib/analytics/local-competitors";
import { selectTopSearchConsoleQueries } from "@/lib/google/search-console";

const metrics = [
  { query: "hairstroke halle", impressions: 120, clicks: 4, ctr: 0.02, position: 11.24 },
  { query: "permanent make up halle", impressions: 120, clicks: 8, ctr: 0.066, position: 8.44 },
  { query: "powder brows halle", impressions: 80, clicks: 1, ctr: 0.0125, position: 23.8 },
  { query: "microneedling halle", impressions: 30, clicks: 1, ctr: 0.033, position: 6.5 },
  { query: "2026 beauty trend", impressions: 25, clicks: 0, ctr: 0, position: 31.2 },
];

test("TOP queries sort by impressions, clicks, then better position", () => {
  const result = selectTopSearchConsoleQueries(metrics, 3);
  assert.deepEqual(result.map((metric) => metric.query), [
    "permanent make up halle",
    "hairstroke halle",
    "powder brows halle",
  ]);
});

test("AI recommendation validation accepts only exact unique GSC queries", () => {
  const result = validateRecommendationLines(
    [
      "1. permanent make up halle || snippet",
      "permanent make up halle || content",
      "invented query || monitor",
      "2026 beauty trend || internal_links",
      "hairstroke halle || local_proof",
      "powder brows halle || differentiate",
      "microneedling halle || unsupported",
    ].join("\n"),
    metrics,
  );

  assert.deepEqual(
    result.map(({ query, action }) => ({ query, action })),
    [
      { query: "permanent make up halle", action: "snippet" },
      { query: "2026 beauty trend", action: "internal_links" },
      { query: "hairstroke halle", action: "local_proof" },
      { query: "powder brows halle", action: "differentiate" },
    ],
  );
});

test("deterministic fallback returns five unique grounded actions", () => {
  const result = buildDeterministicRecommendations(metrics);
  assert.equal(result.length, 5);
  assert.equal(new Set(result.map((item) => item.query)).size, 5);
  assert.ok(result.every((item) => metrics.some((metric) => metric.query === item.query)));
});

test("popular query analysis separates leaders, quick wins, and low CTR", () => {
  const result = buildPopularQueryAnalysis(metrics);

  assert.equal(result.leaders[0]?.query, "permanent make up halle");
  assert.ok(result.quickWins.every((metric) => metric.position >= 4 && metric.position <= 20));
  assert.ok(
    result.lowCtrOpportunities.every(
      (metric) => metric.impressions >= 5 && metric.ctr < 0.03,
    ),
  );
});

test("local competitor context contains five unique public profiles", () => {
  assert.equal(LOCAL_COMPETITOR_PROFILES.length, 5);
  assert.equal(
    new Set(LOCAL_COMPETITOR_PROFILES.map((competitor) => competitor.website)).size,
    5,
  );
  assert.ok(
    LOCAL_COMPETITOR_PROFILES.every(
      (competitor) =>
        competitor.address.includes("Halle") &&
        competitor.website.startsWith("https://") &&
        competitor.focus.length > 0,
    ),
  );
});

test("Russian metric formatting keeps one decimal place", () => {
  assert.match(formatGscPosition(8.44), /^8,4$/);
  assert.match(formatGscCtr(0.044), /^4,4 %$/);
});

test("Telegram GSC report gives every query metric its own visual row", () => {
  const insights = {
    report: {
      status: "ok" as const,
      startDate: "2026-08-06",
      endDate: "2026-08-12",
      siteUrl: "https://permanent-halle.de/",
      rows: metrics,
      totals: {
        impressions: 375,
        clicks: 14,
        ctr: 14 / 375,
        position: 12.3,
      },
    },
    topQueries: metrics.slice(0, 1),
    popularQueryAnalysis: buildPopularQueryAnalysis(metrics),
    recommendations: [],
    recommendationSource: "none" as const,
  };

  const markdown = formatGscInsightsMarkdown(insights);
  const plainText = formatGscInsightsPlainText(insights);

  assert.match(markdown, /\*СВОДНЫЕ ПОКАЗАТЕЛИ\*/);
  assert.match(markdown, /\*№ 1 · hairstroke halle\*/);
  assert.match(markdown, /🎯 ПОЗИЦИЯ: \*11,2\*/);
  assert.match(markdown, /👁 ПОКАЗЫ: \*120\*/);
  assert.match(markdown, /👆 КЛИКИ: \*4\*/);
  assert.match(markdown, /📈 CTR: \*2,0 %\*/);
  assert.match(markdown, /🔥 ЛИДЕРЫ ВИДИМОСТИ/);
  assert.match(markdown, /1️⃣ \*permanent make up halle\*/);
  assert.match(
    markdown,
    /👁 Показы: \*120\* · 🎯 Позиция: \*8,4\*\n   📈 CTR: \*6,6 %\*/,
  );
  assert.match(markdown, /────────────\n\n\*🚀 БЫСТРЫЕ ВОЗМОЖНОСТИ\*/);
  assert.match(plainText, /1\. hairstroke halle\n   🎯 ПОЗИЦИЯ: 11,2/);
});
