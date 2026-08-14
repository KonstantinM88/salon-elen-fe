import OpenAI from "openai";
import { buildDailySummary, type DailySummaryData } from "@/lib/ai/ai-health";
import {
  buildGscInsights,
  formatGscCtr,
  formatGscInsightsPlainText,
  formatGscInteger,
  formatGscPosition,
  type GscInsights,
} from "@/lib/analytics/gsc-insights";

export const AI_ANALYST_ACTION_PREFIX = "analyst";
export const AI_ANALYST_FORCE_REPLY_MARKER = "Вопрос для AI-аналитика";

export const AI_ANALYST_ACTIONS = [
  "search",
  "traffic",
  "bookings",
  "reviews",
  "local",
  "summary",
  "custom",
] as const;

export type AiAnalystAction = (typeof AI_ANALYST_ACTIONS)[number];

export function isAiAnalystAction(value: string): value is AiAnalystAction {
  return AI_ANALYST_ACTIONS.includes(value as AiAnalystAction);
}

export function buildAiAnalystMenuText(): string {
  return [
    "🧠 AI-аналитик Salon Elen",
    "",
    "Выберите раздел. Аналитик работает только на чтение и использует реальные агрегированные данные.",
    "Если источник не подключён или данных недостаточно, бот сообщит об этом прямо.",
  ].join("\n");
}

export function buildAiAnalystForceReplyText(): string {
  return [
    `✍️ ${AI_ANALYST_FORCE_REPLY_MARKER}`,
    "",
    "Ответьте на это сообщение одним вопросом об агрегированной аналитике сайта, поиске или бронированиях.",
    "Персональные данные клиентов, секреты и команды на изменение данных не принимаются.",
  ].join("\n");
}

function formatTraffic(summary: DailySummaryData): string {
  const sources = summary.trafficSources.length > 0
    ? summary.trafficSources
        .map((source) => `• ${source.label}: ${formatGscInteger(source.visits)} визитов`)
        .join("\n")
    : "• За день источники трафика не зафиксированы";

  return [
    "📈 Трафик и каналы",
    `Дата: ${summary.date}`,
    "",
    `Посещения сайта: ${formatGscInteger(summary.siteVisits)}`,
    `Просмотры страниц: ${formatGscInteger(summary.sitePageviews)}`,
    `Переходы из AI-поиска: ${formatGscInteger(summary.aiReferrals)}`,
    "",
    sources,
    "",
    "Это first-party данные сайта. Они не заменяют отдельный отчёт GA4, если GA4 не подключён как источник Telegram-аналитика.",
  ].join("\n");
}

function formatBookings(summary: DailySummaryData): string {
  const methods = summary.bookingMethods.length > 0
    ? summary.bookingMethods
        .map((method) => `• ${method.label}: ${formatGscInteger(method.count)}`)
        .join("\n")
    : "• Новых записей нет";

  return [
    "📅 Бронирования и конверсия",
    `Дата: ${summary.date}`,
    "",
    `Все новые записи: ${formatGscInteger(summary.appointmentCreations)}`,
    `AI-сессии: ${formatGscInteger(summary.totalSessions)}`,
    `Записи через AI: ${formatGscInteger(summary.completedBookings)}`,
    `Конверсия AI: ${formatGscPosition(summary.conversionRate)} %`,
    "",
    "Способы записи:",
    methods,
    "",
    "Отчёт содержит только агрегаты и не показывает персональные данные гостей.",
  ].join("\n");
}

function formatReviewsUnavailable(): string {
  return [
    "⭐ Отзывы и репутация",
    "",
    "Источник статистики Google Business Profile сейчас не подключён к Telegram-аналитику.",
    "Бот не будет придумывать рейтинг, количество отзывов или динамику. Для этого раздела нужна отдельная read-only интеграция Google Business Profile.",
  ].join("\n");
}

function isLocalQuery(query: string): boolean {
  return /\bhalle\b|saale|in der n[aä]he|n[aä]he|near me|salon elen|permanent[- ]halle/i.test(query);
}

function formatLocalVisibility(insights: GscInsights): string {
  if (insights.report.status !== "ok") {
    return insights.report.status === "not_configured"
      ? "📍 Локальная видимость\n\nSearch Console пока не настроен для серверного отчёта."
      : "📍 Локальная видимость\n\nДанные Search Console временно недоступны.";
  }

  const localQueries = insights.report.rows.filter((metric) => isLocalQuery(metric.query)).slice(0, 10);
  const lines = [
    "📍 Локальная видимость",
    `Период: ${insights.report.startDate} — ${insights.report.endDate}`,
    "",
  ];

  if (localQueries.length === 0) {
    lines.push("В пуле до 250 ведущих GSC-запросов локальные формулировки не найдены.");
  } else {
    localQueries.forEach((metric, index) => {
      lines.push(
        `${index + 1}. ${metric.query} — поз. ${formatGscPosition(metric.position)} · ${formatGscInteger(metric.impressions)} пок. · ${formatGscInteger(metric.clicks)} кл. · CTR ${formatGscCtr(metric.ctr)}`,
      );
    });
  }

  lines.push(
    "",
    "Это видимость permanent-halle.de по локальным запросам в полученном GSC-пуле, а не полный объём локального рынка.",
  );
  return lines.join("\n");
}

function formatGeneralSummary(summary: DailySummaryData, insights: GscInsights): string {
  const searchLine = insights.report.status === "ok"
    ? `Google за ${insights.report.startDate} — ${insights.report.endDate}: ${formatGscInteger(insights.report.totals.impressions)} показов, ${formatGscInteger(insights.report.totals.clicks)} кликов, CTR ${formatGscCtr(insights.report.totals.ctr)}, средняя позиция ${formatGscPosition(insights.report.totals.position)}.`
    : insights.report.status === "not_configured"
      ? "Search Console: серверный источник пока не настроен."
      : "Search Console: данные временно недоступны.";

  return [
    "📋 Общая сводка",
    "",
    `За ${summary.date}: ${formatGscInteger(summary.siteVisits)} посещений сайта, ${formatGscInteger(summary.sitePageviews)} просмотров страниц и ${formatGscInteger(summary.appointmentCreations)} новых записей.`,
    `AI-ассистент: ${formatGscInteger(summary.totalSessions)} сессий, ${formatGscInteger(summary.completedBookings)} записей, конверсия ${formatGscPosition(summary.conversionRate)} %.`,
    searchLine,
    "",
    "Сводка использует два источника: агрегаты приложения и Google Search Console. Персональные данные не включены.",
  ].join("\n");
}

export async function buildAiAnalystButtonResponse(
  action: Exclude<AiAnalystAction, "custom">,
): Promise<string> {
  switch (action) {
    case "search":
      return formatGscInsightsPlainText(await buildGscInsights());
    case "traffic":
      return formatTraffic(await buildDailySummary());
    case "bookings":
      return formatBookings(await buildDailySummary());
    case "reviews":
      return formatReviewsUnavailable();
    case "local":
      return formatLocalVisibility(await buildGscInsights({ includeRecommendations: false }));
    case "summary": {
      const summary = await buildDailySummary();
      const insights = await buildGscInsights({ includeRecommendations: false });
      return formatGeneralSummary(summary, insights);
    }
  }
}

function containsSensitiveOrWriteIntent(question: string): boolean {
  return (
    /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(question) ||
    /\+?\d[\d\s().-]{9,}\d/.test(question) ||
    /\b(api[ _-]?key|access[ _-]?token|private[ _-]?key|секрет|токен|парол|sql|client[ _-]?id|идентификатор клиента)\b/i.test(question) ||
    /\bcm[a-z0-9]{20,}\b/i.test(question) ||
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(question) ||
    /(имя|телефон|e-?mail|почт|сообщени|переписк).{0,18}клиент/i.test(question) ||
    /\b(удали|измени|перенеси|отмени|напиши клиент|отправь клиент|deploy|деплой)\b/i.test(question)
  );
}

function selectCustomSources(question: string): {
  daily: boolean;
  gsc: boolean;
  reviewsOnly: boolean;
} {
  const reviews = /отзыв|репутац|rating|review/i.test(question);
  const gsc = /google|поиск|запрос|показ|клик|ctr|позици|seo|локаль|видимост|halle/i.test(question);
  const daily = /трафик|канал|посещ|просмотр|бронир|запис|конверси|ассистент|сайт/i.test(question);

  if (reviews && !gsc && !daily) {
    return { daily: false, gsc: false, reviewsOnly: true };
  }

  if (!gsc && !daily) {
    return { daily: true, gsc: true, reviewsOnly: false };
  }

  return { daily, gsc, reviewsOnly: false };
}

function dailyContext(summary: DailySummaryData) {
  return {
    date: summary.dateISO,
    siteVisits: summary.siteVisits,
    sitePageviews: summary.sitePageviews,
    aiReferrals: summary.aiReferrals,
    appointmentCreations: summary.appointmentCreations,
    bookingMethods: summary.bookingMethods.map((method) => ({
      label: method.label,
      count: method.count,
    })),
    aiSessions: summary.totalSessions,
    aiBookings: summary.completedBookings,
    aiConversionPercent: summary.conversionRate,
  };
}

function gscContext(insights: GscInsights) {
  return {
    status: insights.report.status,
    startDate: insights.report.startDate,
    endDate: insights.report.endDate,
    totals: insights.report.totals,
    topQueries: insights.topQueries.map((metric) => ({
      query: metric.query,
      impressions: metric.impressions,
      clicks: metric.clicks,
      ctr: metric.ctr,
      averagePosition: metric.position,
    })),
  };
}

async function askOpenAiAnalyst(
  question: string,
  context: Record<string, unknown>,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create(
      {
        model,
        max_completion_tokens: 500,
        messages: [
          {
            role: "system",
            content: [
              "Ты закрытый read-only аналитик Salon Elen в Telegram.",
              "Отвечай кратко по-русски и только по предоставленным агрегатам.",
              "Не придумывай числа, URL, рейтинги, выполненные изменения или гарантии роста.",
              "Не предлагай near-duplicate SEO-страницы; сначала усиливай существующий канонический контент.",
              "Не выполняй действия и не запрашивай персональные данные или секреты.",
              "Учитывай, что GSC impressions не являются общим search volume, а position является средней за период.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({ question, aggregateData: context }),
          },
        ],
      },
      { signal: controller.signal },
    );
    const answer = completion.choices[0]?.message.content?.trim();
    return answer || null;
  } catch (error) {
    console.warn("[Telegram AI Analyst] OpenAI fallback", {
      status: "error",
      model,
      errorType: error instanceof Error ? error.name : "unknown_error",
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function answerAiAnalystQuestion(question: string): Promise<string> {
  const normalizedQuestion = question.trim();
  if (!normalizedQuestion) {
    return "Вопрос пуст. Откройте /ask и ответьте на сообщение ещё раз.";
  }

  if (containsSensitiveOrWriteIntent(normalizedQuestion)) {
    return [
      "AI-аналитик работает только с агрегированными read-only данными.",
      "Он не принимает персональные данные, секреты, SQL и команды на изменение сайта, записей или коммуникаций с клиентами.",
    ].join("\n");
  }

  const sources = selectCustomSources(normalizedQuestion);
  if (sources.reviewsOnly) return formatReviewsUnavailable();

  const context: Record<string, unknown> = {};
  let summary: DailySummaryData | null = null;
  let insights: GscInsights | null = null;

  // DB-backed sources are intentionally resolved sequentially.
  if (sources.daily) {
    summary = await buildDailySummary();
    context.application = dailyContext(summary);
  }
  if (sources.gsc) {
    insights = await buildGscInsights({ includeRecommendations: false });
    context.searchConsole = gscContext(insights);
  }

  const answer = await askOpenAiAnalyst(normalizedQuestion, context);
  if (answer) return answer;

  const fallback = [
    "🧠 AI-анализ временно недоступен. Ниже фактическая сводка без интерпретации модели.",
    "",
  ];
  if (summary) fallback.push(formatGeneralSummary(summary, insights ?? {
    report: {
      status: "not_configured",
      startDate: "",
      endDate: "",
      siteUrl: "",
      rows: [],
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    },
    topQueries: [],
    recommendations: [],
    recommendationSource: "none",
  }));
  else if (insights) fallback.push(formatGscInsightsPlainText(insights));
  else fallback.push("Подходящих подключённых источников данных нет.");

  return fallback.join("\n");
}
