import OpenAI from "openai";
import {
  getSearchConsoleQueryReport,
  selectTopSearchConsoleQueries,
  type SearchConsoleQueryMetric,
  type SearchConsoleQueryReport,
} from "@/lib/google/search-console";

export const GSC_RECOMMENDATION_ACTIONS = [
  "snippet",
  "content",
  "internal_links",
  "monitor",
] as const;

export type GscRecommendationAction =
  (typeof GSC_RECOMMENDATION_ACTIONS)[number];

export interface GscRecommendation {
  query: string;
  action: GscRecommendationAction;
  metric: SearchConsoleQueryMetric;
}

export interface GscInsights {
  report: SearchConsoleQueryReport;
  topQueries: SearchConsoleQueryMetric[];
  recommendations: GscRecommendation[];
  recommendationSource: "openai" | "fallback" | "none";
}

const ruInteger = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const ruDecimal = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function errorType(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") return "timeout";
  if (error instanceof Error) return error.name;
  return "unknown_error";
}

function isRecommendationAction(value: string): value is GscRecommendationAction {
  return GSC_RECOMMENDATION_ACTIONS.includes(value as GscRecommendationAction);
}

export function validateRecommendationLines(
  text: string,
  metrics: SearchConsoleQueryMetric[],
): GscRecommendation[] {
  const byExactQuery = new Map(metrics.map((metric) => [metric.query, metric]));
  const seen = new Set<string>();
  const recommendations: GscRecommendation[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim();
    const separatorIndex = line.lastIndexOf("||");
    if (separatorIndex < 1) continue;

    const query = line.slice(0, separatorIndex).trim();
    const action = line.slice(separatorIndex + 2).trim();
    const metric = byExactQuery.get(query);
    if (!metric || !isRecommendationAction(action) || seen.has(query)) continue;

    seen.add(query);
    recommendations.push({ query, action, metric });
    if (recommendations.length === 3) break;
  }

  return recommendations;
}

export function buildDeterministicRecommendations(
  metrics: SearchConsoleQueryMetric[],
): GscRecommendation[] {
  const topQueries = selectTopSearchConsoleQueries(metrics, 10);
  const selected: GscRecommendation[] = [];
  const used = new Set<string>();

  const add = (
    metric: SearchConsoleQueryMetric | undefined,
    action: GscRecommendationAction,
  ) => {
    if (!metric || used.has(metric.query) || selected.length >= 3) return;
    used.add(metric.query);
    selected.push({ query: metric.query, action, metric });
  };

  add(
    topQueries.find((metric) => metric.position >= 8 && metric.position <= 20),
    "content",
  );
  add(
    topQueries.find((metric) => metric.impressions > 0 && metric.ctr < 0.03),
    "snippet",
  );
  add(
    topQueries.find((metric) => metric.impressions > 0 && metric.position > 20),
    "internal_links",
  );
  add(topQueries[0], "monitor");

  for (const metric of topQueries) {
    add(metric, metric.ctr < 0.03 ? "snippet" : "content");
  }

  return selected;
}

async function requestOpenAiRecommendations(
  metrics: SearchConsoleQueryMetric[],
): Promise<GscRecommendation[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const client = new OpenAI({ apiKey });
    const rows = metrics.map((metric) => ({
      query: metric.query,
      impressions: metric.impressions,
      clicks: metric.clicks,
      ctr: metric.ctr,
      averagePosition: metric.position,
    }));
    const completion = await client.chat.completions.create(
      {
        model,
        max_completion_tokens: 180,
        messages: [
          {
            role: "system",
            content: [
              "You are a read-only SEO prioritization classifier.",
              "Return exactly three lines and nothing else.",
              "Each line must be: exact query || action.",
              `Allowed actions: ${GSC_RECOMMENDATION_ACTIONS.join(", ")}.`,
              "Use only exact queries from the provided JSON.",
              "Do not invent metrics, URLs, explanations, completed work, guarantees, or new pages.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify(rows),
          },
        ],
      },
      { signal: controller.signal },
    );
    const content = completion.choices[0]?.message.content;
    if (typeof content !== "string") return null;

    const valid = validateRecommendationLines(content, metrics);
    return valid.length === Math.min(3, metrics.length) ? valid : null;
  } catch (error) {
    console.warn("[GSC AI] Recommendation fallback", {
      status: "error",
      model,
      errorType: errorType(error),
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildGscInsights(
  options: { includeRecommendations?: boolean } = {},
): Promise<GscInsights> {
  const report = await getSearchConsoleQueryReport();
  const topQueries = selectTopSearchConsoleQueries(report.rows, 10);

  if (report.status !== "ok" || topQueries.length === 0) {
    return {
      report,
      topQueries,
      recommendations: [],
      recommendationSource: "none",
    };
  }

  if (options.includeRecommendations === false) {
    return {
      report,
      topQueries,
      recommendations: [],
      recommendationSource: "none",
    };
  }

  const openAiRecommendations = await requestOpenAiRecommendations(topQueries);
  if (openAiRecommendations) {
    return {
      report,
      topQueries,
      recommendations: openAiRecommendations,
      recommendationSource: "openai",
    };
  }

  return {
    report,
    topQueries,
    recommendations: buildDeterministicRecommendations(topQueries),
    recommendationSource: "fallback",
  };
}

export function formatGscPosition(value: number): string {
  return ruDecimal.format(value);
}

export function formatGscCtr(value: number): string {
  return `${ruDecimal.format(value * 100)} %`;
}

export function formatGscInteger(value: number): string {
  return ruInteger.format(value);
}

function escapeMarkdown(value: string): string {
  return value.replace(/([_*[\]()`\\])/g, "\\$1");
}

function recommendationText(recommendation: GscRecommendation): string {
  const metricText = `поз. ${formatGscPosition(recommendation.metric.position)}, ${formatGscInteger(recommendation.metric.impressions)} пок., CTR ${formatGscCtr(recommendation.metric.ctr)}`;

  switch (recommendation.action) {
    case "snippet":
      return `Уточнить title и description под интент запроса; проверить, обещает ли сниппет прямой ответ (${metricText}).`;
    case "content":
      return `Усилить существующую каноническую страницу прямым ответом, доказательствами, FAQ и локальным контекстом (${metricText}).`;
    case "internal_links":
      return `Добавить релевантные внутренние ссылки на существующую каноническую страницу и усилить тематические связи (${metricText}).`;
    case "monitor":
      return `Сохранить релевантность и контролировать недельную динамику без поспешных изменений (${metricText}).`;
  }
}

export function formatGscInsightsMarkdown(insights: GscInsights): string {
  const { report, topQueries, recommendations } = insights;
  const heading = "🔎 *TOP\-10 запросов Google*";

  if (report.status === "not_configured") {
    return `${heading}\n\nSearch Console пока не настроен для серверного отчёта\.`;
  }

  if (report.status === "error") {
    return `${heading}\n\nДанные Search Console временно недоступны\. Основной отчёт продолжает работать\.`;
  }

  const lines = [
    heading,
    `Период GSC: *${escapeMarkdown(report.startDate)} — ${escapeMarkdown(report.endDate)}*`,
    `Показы: *${formatGscInteger(report.totals.impressions)}* · клики: *${formatGscInteger(report.totals.clicks)}* · CTR: *${escapeMarkdown(formatGscCtr(report.totals.ctr))}* · средняя позиция: *${escapeMarkdown(formatGscPosition(report.totals.position))}*`,
    "Рейтинг построен по показам; при равенстве учитываются клики и средняя позиция.",
    "",
  ];

  if (topQueries.length === 0) {
    lines.push("За выбранный период запросов нет\.");
  } else {
    topQueries.forEach((metric, index) => {
      lines.push(
        `${index + 1}\. ${escapeMarkdown(metric.query)} — поз\. ${escapeMarkdown(formatGscPosition(metric.position))} · ${formatGscInteger(metric.impressions)} пок\. · ${formatGscInteger(metric.clicks)} кл\. · CTR ${escapeMarkdown(formatGscCtr(metric.ctr))}`,
      );
    });
  }

  lines.push(
    "",
    "Показы — это спрос, в котором Google показал именно permanent\-halle\.de, а не общий объём поиска по Германии\.",
    "Position — средняя позиция за период, а не фиксированное место сайта сейчас\. Данные GSC поступают с задержкой примерно в 2 дня\.",
    "",
    "🧠 *Рекомендации AI*",
  );

  if (recommendations.length === 0) {
    lines.push("Недостаточно данных для рекомендаций\.");
  } else {
    recommendations.forEach((recommendation, index) => {
      lines.push(
        `${index + 1}\. *${escapeMarkdown(recommendation.query)}* — ${escapeMarkdown(recommendationText(recommendation))}`,
      );
    });
  }

  return lines.join("\n");
}

export function formatGscInsightsPlainText(insights: GscInsights): string {
  const { report, topQueries, recommendations } = insights;
  if (report.status === "not_configured") {
    return "🔎 Поисковые запросы\n\nSearch Console пока не настроен для серверного отчёта.";
  }
  if (report.status === "error") {
    return "🔎 Поисковые запросы\n\nДанные Search Console временно недоступны. Попробуйте позже.";
  }

  const lines = [
    "🔎 TOP-10 запросов Google",
    `Период: ${report.startDate} — ${report.endDate}`,
    `Показы: ${formatGscInteger(report.totals.impressions)} · клики: ${formatGscInteger(report.totals.clicks)} · CTR: ${formatGscCtr(report.totals.ctr)} · средняя позиция: ${formatGscPosition(report.totals.position)}`,
    "Рейтинг: по показам.",
    "",
  ];

  topQueries.forEach((metric, index) => {
    lines.push(
      `${index + 1}. ${metric.query} — поз. ${formatGscPosition(metric.position)} · ${formatGscInteger(metric.impressions)} пок. · ${formatGscInteger(metric.clicks)} кл. · CTR ${formatGscCtr(metric.ctr)}`,
    );
  });

  lines.push(
    "",
    "Это запросы, по которым Google показывал permanent-halle.de, а не общая частотность по Германии. Position — средняя позиция за период. Задержка данных около 2 дней.",
    "",
    "🧠 Рекомендации",
  );
  recommendations.forEach((recommendation, index) => {
    lines.push(`${index + 1}. ${recommendation.query}: ${recommendationText(recommendation)}`);
  });

  if (recommendations.length === 0) {
    lines.push("Недостаточно данных для рекомендаций.");
  }

  return lines.join("\n");
}
