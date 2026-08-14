import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDeterministicRecommendations,
  formatGscCtr,
  formatGscPosition,
  validateRecommendationLines,
} from "@/lib/analytics/gsc-insights";
import { selectTopSearchConsoleQueries } from "@/lib/google/search-console";

const metrics = [
  { query: "hairstroke halle", impressions: 120, clicks: 4, ctr: 0.02, position: 11.24 },
  { query: "permanent make up halle", impressions: 120, clicks: 8, ctr: 0.066, position: 8.44 },
  { query: "powder brows halle", impressions: 80, clicks: 1, ctr: 0.0125, position: 23.8 },
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
      "hairstroke halle || unsupported",
    ].join("\n"),
    metrics,
  );

  assert.deepEqual(
    result.map(({ query, action }) => ({ query, action })),
    [
      { query: "permanent make up halle", action: "snippet" },
      { query: "2026 beauty trend", action: "internal_links" },
    ],
  );
});

test("deterministic fallback returns three unique grounded actions", () => {
  const result = buildDeterministicRecommendations(metrics);
  assert.equal(result.length, 3);
  assert.equal(new Set(result.map((item) => item.query)).size, 3);
  assert.ok(result.every((item) => metrics.some((metric) => metric.query === item.query)));
});

test("Russian metric formatting keeps one decimal place", () => {
  assert.match(formatGscPosition(8.44), /^8,4$/);
  assert.match(formatGscCtr(0.044), /^4,4 %$/);
});
