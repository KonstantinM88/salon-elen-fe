import OpenAI from "openai";
import {
  getSearchConsoleQueryReport,
  selectTopSearchConsoleQueries,
  type SearchConsoleQueryMetric,
  type SearchConsoleQueryReport,
} from "@/lib/google/search-console";
import {
  buildLocalCompetitorAiContext,
  formatLocalCompetitorsMarkdown,
  formatLocalCompetitorsPlainText,
} from "@/lib/analytics/local-competitors";

export const GSC_RECOMMENDATION_ACTIONS = [
  "snippet",
  "content",
  "internal_links",
  "local_proof",
  "differentiate",
  "monitor",
] as const;

export type GscRecommendationAction =
  (typeof GSC_RECOMMENDATION_ACTIONS)[number];

export interface GscRecommendation {
  query: string;
  action: GscRecommendationAction;
  metric: SearchConsoleQueryMetric;
}

export interface PopularQueryAnalysis {
  leaders: SearchConsoleQueryMetric[];
  quickWins: SearchConsoleQueryMetric[];
  lowCtrOpportunities: SearchConsoleQueryMetric[];
}

export interface GscInsights {
  report: SearchConsoleQueryReport;
  topQueries: SearchConsoleQueryMetric[];
  popularQueryAnalysis: PopularQueryAnalysis;
  recommendations: GscRecommendation[];
  recommendationSource: "openai" | "fallback" | "none";
}

const RECOMMENDATION_LIMIT = 5;
const RECOMMENDATION_CANDIDATE_LIMIT = 15;

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
    if (recommendations.length === RECOMMENDATION_LIMIT) break;
  }

  return recommendations;
}

export function buildPopularQueryAnalysis(
  metrics: SearchConsoleQueryMetric[],
): PopularQueryAnalysis {
  const ranked = selectTopSearchConsoleQueries(metrics, 25);

  return {
    leaders: ranked.slice(0, 5),
    quickWins: ranked
      .filter((metric) => metric.position >= 4 && metric.position <= 20)
      .slice(0, 5),
    lowCtrOpportunities: ranked
      .filter(
        (metric) =>
          metric.impressions >= 5 && metric.ctr < 0.03,
      )
      .slice(0, 5),
  };
}

function isLocalSearchQuery(query: string): boolean {
  return /\bhalle\b|saale|in der n[aä]he|n[aä]he|near me|salon elen|permanent[- ]halle/i.test(query);
}

export function buildDeterministicRecommendations(
  metrics: SearchConsoleQueryMetric[],
): GscRecommendation[] {
  const topQueries = selectTopSearchConsoleQueries(
    metrics,
    RECOMMENDATION_CANDIDATE_LIMIT,
  );
  const selected: GscRecommendation[] = [];
  const used = new Set<string>();

  const add = (
    metric: SearchConsoleQueryMetric | undefined,
    action: GscRecommendationAction,
  ) => {
    if (
      !metric ||
      used.has(metric.query) ||
      selected.length >= RECOMMENDATION_LIMIT
    ) return;
    used.add(metric.query);
    selected.push({ query: metric.query, action, metric });
  };
  const findUnused = (
    predicate: (metric: SearchConsoleQueryMetric) => boolean,
  ) => topQueries.find((metric) => !used.has(metric.query) && predicate(metric));

  add(
    findUnused((metric) => metric.position >= 4 && metric.position <= 20),
    "content",
  );
  add(
    findUnused((metric) => metric.impressions > 0 && metric.ctr < 0.03),
    "snippet",
  );
  add(
    findUnused((metric) => isLocalSearchQuery(metric.query)),
    "local_proof",
  );
  add(findUnused((metric) => metric.impressions > 0), "differentiate");
  add(
    findUnused((metric) => metric.impressions > 0 && metric.position > 20),
    "internal_links",
  );
  add(findUnused(() => true), "monitor");

  for (const metric of topQueries) {
    add(metric, metric.ctr < 0.03 ? "snippet" : "content");
  }

  return selected;
}

async function requestOpenAiRecommendations(
  metrics: SearchConsoleQueryMetric[],
  popularQueryAnalysis: PopularQueryAnalysis,
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
    const targetCount = Math.min(RECOMMENDATION_LIMIT, metrics.length);
    const completion = await client.chat.completions.create(
      {
        model,
        max_completion_tokens: 300,
        messages: [
          {
            role: "system",
            content: [
              "You are a read-only local SEO prioritization classifier for Salon Elen in Halle (Saale).",
              `Return exactly ${targetCount} lines and nothing else.`,
              "Each line must be: exact query || action.",
              `Allowed actions: ${GSC_RECOMMENDATION_ACTIONS.join(", ")}.`,
              "Use only exact queries from the provided JSON.",
              "Select unique queries and balance demand leaders, positions 4-20, low CTR, local proof, and differentiation.",
              "Competitor profiles are public positioning context only.",
              "Do not claim competitor rankings, distance, traffic, reviews, quality, missing services, market share, or superiority.",
              "Do not invent metrics, URLs, explanations, completed work, guarantees, or near-duplicate pages.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              searchConsoleQueries: rows,
              popularQuerySignals: {
                leaders: popularQueryAnalysis.leaders.map((item) => item.query),
                quickWins: popularQueryAnalysis.quickWins.map((item) => item.query),
                lowCtrOpportunities: popularQueryAnalysis.lowCtrOpportunities.map(
                  (item) => item.query,
                ),
              },
              localMarket: buildLocalCompetitorAiContext(),
            }),
          },
        ],
      },
      { signal: controller.signal },
    );
    const content = completion.choices[0]?.message.content;
    if (typeof content !== "string") return null;

    const valid = validateRecommendationLines(content, metrics);
    const actionDiversity = new Set(valid.map((item) => item.action)).size;
    const hasLocalStrategy = valid.some(
      (item) => item.action === "local_proof" || item.action === "differentiate",
    );
    return valid.length === targetCount &&
      actionDiversity >= Math.min(3, targetCount) &&
      hasLocalStrategy
      ? valid
      : null;
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
  const popularQueryAnalysis = buildPopularQueryAnalysis(report.rows);

  if (report.status !== "ok" || topQueries.length === 0) {
    return {
      report,
      topQueries,
      popularQueryAnalysis,
      recommendations: [],
      recommendationSource: "none",
    };
  }

  if (options.includeRecommendations === false) {
    return {
      report,
      topQueries,
      popularQueryAnalysis,
      recommendations: [],
      recommendationSource: "none",
    };
  }

  const recommendationCandidates = selectTopSearchConsoleQueries(
    report.rows,
    RECOMMENDATION_CANDIDATE_LIMIT,
  );
  const openAiRecommendations = await requestOpenAiRecommendations(
    recommendationCandidates,
    popularQueryAnalysis,
  );
  if (openAiRecommendations) {
    return {
      report,
      topQueries,
      popularQueryAnalysis,
      recommendations: openAiRecommendations,
      recommendationSource: "openai",
    };
  }

  return {
    report,
    topQueries,
    popularQueryAnalysis,
    recommendations: buildDeterministicRecommendations(recommendationCandidates),
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

function formatGscMetricSummary(
  metric: SearchConsoleQueryMetric,
  index: number,
  markdown: boolean,
): string {
  const position = formatGscPosition(metric.position);
  const impressions = formatGscInteger(metric.impressions);
  const clicks = formatGscInteger(metric.clicks);
  const ctr = formatGscCtr(metric.ctr);

  if (!markdown) {
    return [
      `${index + 1}. ${metric.query}`,
      `   🎯 ПОЗИЦИЯ: ${position}`,
      `   👁 ПОКАЗЫ: ${impressions}`,
      `   👆 КЛИКИ: ${clicks}`,
      `   📈 CTR: ${ctr}`,
    ].join("\n");
  }

  return [
    `*№ ${index + 1} · ${escapeMarkdown(metric.query)}*`,
    `├ 🎯 ПОЗИЦИЯ: *${escapeMarkdown(position)}*`,
    `├ 👁 ПОКАЗЫ: *${escapeMarkdown(impressions)}*`,
    `├ 👆 КЛИКИ: *${escapeMarkdown(clicks)}*`,
    `└ 📈 CTR: *${escapeMarkdown(ctr)}*`,
  ].join("\n");
}

export function formatGscRecommendationText(
  recommendation: GscRecommendation,
): string {
  const metricText = `поз. ${formatGscPosition(recommendation.metric.position)}, ${formatGscInteger(recommendation.metric.impressions)} пок., CTR ${formatGscCtr(recommendation.metric.ctr)}`;

  switch (recommendation.action) {
    case "snippet":
      return `Уточнить title и description под интент запроса; проверить, обещает ли сниппет прямой ответ (${metricText}).`;
    case "content":
      return `Усилить существующую каноническую страницу прямым ответом, доказательствами, FAQ и локальным контекстом (${metricText}).`;
    case "internal_links":
      return `Добавить релевантные внутренние ссылки на существующую каноническую страницу и усилить тематические связи (${metricText}).`;
    case "local_proof":
      return `Усилить локальные доказательства на канонической странице: Halle/Paulusviertel, адрес, маршрут, реальные работы, этапы процедуры и прямую запись (${metricText}).`;
    case "differentiate":
      return `Яснее показать преимущества Salon Elen под этот интент: Hairstroke-экспертизу, консультацию DE/EN/RU, прозрачный процесс и онлайн-запись 24/7 (${metricText}).`;
    case "monitor":
      return `Сохранить релевантность и контролировать недельную динамику без поспешных изменений (${metricText}).`;
  }
}

const ANALYSIS_RANK_MARKERS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"] as const;

function formatAnalysisMetricLines(
  metric: SearchConsoleQueryMetric,
  index: number,
  markdown: boolean,
): string[] {
  const rank = ANALYSIS_RANK_MARKERS[index] ?? `${index + 1}.`;
  const impressions = formatGscInteger(metric.impressions);
  const position = formatGscPosition(metric.position);
  const ctr = formatGscCtr(metric.ctr);

  if (!markdown) {
    return [
      `${rank} ${metric.query}`,
      `   👁 Показы: ${impressions} · 🎯 Позиция: ${position}`,
      `   📈 CTR: ${ctr}`,
    ];
  }

  return [
    `${rank} *${escapeMarkdown(metric.query)}*`,
    `   👁 Показы: *${escapeMarkdown(impressions)}* · 🎯 Позиция: *${escapeMarkdown(position)}*`,
    `   📈 CTR: *${escapeMarkdown(ctr)}*`,
  ];
}

function formatPopularQueryAnalysisLines(
  analysis: PopularQueryAnalysis,
  markdown: boolean,
): string[] {
  const section = (
    label: string,
    description: string,
    metrics: SearchConsoleQueryMetric[],
    emptyText: string,
  ): string[] => {
    const heading = markdown ? `*${label}*` : label;
    if (metrics.length === 0) {
      return [heading, description, "", emptyText];
    }

    const metricLines = metrics.slice(0, 5).flatMap((metric, index) => [
      ...formatAnalysisMetricLines(metric, index, markdown),
      "",
    ]);

    return [heading, description, "", ...metricLines.slice(0, -1)];
  };

  return [
    ...section(
      "🔥 ЛИДЕРЫ ВИДИМОСТИ",
      "Запросы с наибольшим количеством показов:",
      analysis.leaders,
      "данных пока недостаточно",
    ),
    "",
    "────────────",
    "",
    ...section(
      "🚀 БЫСТРЫЕ ВОЗМОЖНОСТИ",
      "Запросы на позициях 4-20, которые можно усилить:",
      analysis.quickWins,
      "подходящих запросов нет",
    ),
    "",
    "────────────",
    "",
    ...section(
      "⚠️ НИЗКИЙ CTR",
      "Есть показы, но пользователи редко переходят:",
      analysis.lowCtrOpportunities,
      "выраженных потерь не найдено",
    ),
  ];
}

export function formatGscInsightsMarkdown(insights: GscInsights): string {
  const { report, topQueries, popularQueryAnalysis, recommendations } = insights;
  const heading = "🔎 *TOP\-10 запросов Google*";

  if (report.status === "not_configured") {
    return `${heading}\n\nSearch Console пока не настроен для серверного отчёта\.`;
  }

  if (report.status === "error") {
    return `${heading}\n\nДанные Search Console временно недоступны\. Основной отчёт продолжает работать\.`;
  }

  const lines = [
    heading,
    `📅 Период GSC: *${escapeMarkdown(report.startDate)} — ${escapeMarkdown(report.endDate)}*`,
    "",
    "*СВОДНЫЕ ПОКАЗАТЕЛИ*",
    `├ 👁 ПОКАЗЫ: *${escapeMarkdown(formatGscInteger(report.totals.impressions))}*`,
    `├ 👆 КЛИКИ: *${escapeMarkdown(formatGscInteger(report.totals.clicks))}*`,
    `├ 📈 CTR: *${escapeMarkdown(formatGscCtr(report.totals.ctr))}*`,
    `└ 🎯 СРЕДНЯЯ ПОЗИЦИЯ: *${escapeMarkdown(formatGscPosition(report.totals.position))}*`,
    "",
    "Рейтинг построен по показам; при равенстве учитываются клики и средняя позиция.",
    "",
  ];

  if (topQueries.length === 0) {
    lines.push("За выбранный период запросов нет\.");
  } else {
    topQueries.forEach((metric, index) => {
      lines.push(formatGscMetricSummary(metric, index, true), "");
    });
  }

  lines.push(
    "",
    "Показы — это спрос, в котором Google показал именно permanent\-halle\.de, а не общий объём поиска по Германии\.",
    "Position — средняя позиция за период, а не фиксированное место сайта сейчас\. Данные GSC поступают с задержкой примерно в 2 дня\.",
    "",
    "📊 *Анализ популярных запросов*",
    ...formatPopularQueryAnalysisLines(popularQueryAnalysis, true),
    "",
    formatLocalCompetitorsMarkdown(),
    "",
    "🧠 *Рекомендации AI*",
  );

  if (recommendations.length === 0) {
    lines.push("Недостаточно данных для рекомендаций\.");
  } else {
    recommendations.forEach((recommendation, index) => {
      lines.push(
        `${index + 1}\. *${escapeMarkdown(recommendation.query)}* — ${escapeMarkdown(formatGscRecommendationText(recommendation))}`,
      );
    });
  }

  return lines.join("\n");
}

export function formatGscInsightsPlainText(insights: GscInsights): string {
  const { report, topQueries, popularQueryAnalysis, recommendations } = insights;
  if (report.status === "not_configured") {
    return "🔎 Поисковые запросы\n\nSearch Console пока не настроен для серверного отчёта.";
  }
  if (report.status === "error") {
    return "🔎 Поисковые запросы\n\nДанные Search Console временно недоступны. Попробуйте позже.";
  }

  const lines = [
    "🔎 TOP-10 запросов Google",
    `Период: ${report.startDate} — ${report.endDate}`,
    "",
    "СВОДНЫЕ ПОКАЗАТЕЛИ",
    `├ 👁 ПОКАЗЫ: ${formatGscInteger(report.totals.impressions)}`,
    `├ 👆 КЛИКИ: ${formatGscInteger(report.totals.clicks)}`,
    `├ 📈 CTR: ${formatGscCtr(report.totals.ctr)}`,
    `└ 🎯 СРЕДНЯЯ ПОЗИЦИЯ: ${formatGscPosition(report.totals.position)}`,
    "",
    "Рейтинг: по показам.",
    "",
  ];

  topQueries.forEach((metric, index) => {
    lines.push(formatGscMetricSummary(metric, index, false), "");
  });

  lines.push(
    "",
    "Это запросы, по которым Google показывал permanent-halle.de, а не общая частотность по Германии. Position — средняя позиция за период. Задержка данных около 2 дней.",
    "",
    "📊 Анализ популярных запросов",
    ...formatPopularQueryAnalysisLines(popularQueryAnalysis, false),
    "",
    formatLocalCompetitorsPlainText(),
    "",
    "🧠 Рекомендации AI",
  );
  recommendations.forEach((recommendation, index) => {
    lines.push(
      `${index + 1}. ${recommendation.query}: ${formatGscRecommendationText(recommendation)}`,
    );
  });

  if (recommendations.length === 0) {
    lines.push("Недостаточно данных для рекомендаций.");
  }

  return lines.join("\n");
}
