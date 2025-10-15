// scripts/book-slot.ts
type Slot = { start: string; end: string };

const cfg = {
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
  serviceSlug: process.env.SERVICE_SLUG ?? "manikur-02",
  dateISO: process.env.DATE_ISO ?? "2025-11-04",
  masterId: process.env.MASTER_ID ?? "cmgie5olu0000v6cw5sykjpxs",
  durationMin: Number(process.env.DURATION_MIN ?? 30),
  salonTZ: process.env.SALON_TZ ?? "Europe/Berlin",
  // попробуй реальный телефон в E.164
  customer: {
    name: process.env.C_NAME ?? "Test Curl",
    phone: process.env.C_PHONE ?? "+491234567890",
    email: process.env.C_EMAIL ?? "test@example.com",
    birthDate: process.env.C_BIRTH ?? "1990-01-01",
    source: process.env.C_SOURCE ?? "Google",
    notes: process.env.C_NOTES ?? "auto-book script",
  },
  // если у тебя уже есть API-роут — укажи его здесь, напр. /api/book
  bookPath: process.env.BOOK_PATH ?? "/booking",
};

function minutesInTZ(iso: string, timeZone: string): number {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const hh = Number(parts.find(p => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find(p => p.type === "minute")?.value ?? "0");
  return hh * 60 + mm;
}

async function fetchAvailability(): Promise<Slot[]> {
  const url = new URL("/api/availability", cfg.baseUrl);
  url.searchParams.set("serviceSlug", cfg.serviceSlug);
  url.searchParams.set("dateISO", cfg.dateISO);
  url.searchParams.set("masterId", cfg.masterId);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Availability HTTP ${res.status}`);
  return res.json();
}

async function rawBook(startISO: string) {
  const startMin = minutesInTZ(startISO, cfg.salonTZ);
  const endMin = startMin + cfg.durationMin;

  const body = new URLSearchParams({
    serviceSlug: cfg.serviceSlug,
    dateISO: cfg.dateISO,
    startMin: String(startMin),
    endMin: String(endMin),
    masterId: cfg.masterId,
    name: cfg.customer.name,
    phone: cfg.customer.phone,
    email: cfg.customer.email,
    birthDate: cfg.customer.birthDate,
    source: cfg.customer.source,
    notes: cfg.customer.notes,
  });

  const url = new URL(cfg.bookPath, cfg.baseUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "*/*" },
    body,
  });

  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  const isHTML = ct.includes("text/html") || text.startsWith("<!DOCTYPE html");

  return { status: res.status, contentType: ct, isHTML, preview: text.slice(0, 500), startMin, endMin };
}

(async () => {
  console.log("→ Config:", {
    baseUrl: cfg.baseUrl,
    serviceSlug: cfg.serviceSlug,
    dateISO: cfg.dateISO,
    masterId: cfg.masterId,
    durationMin: cfg.durationMin,
    salonTZ: cfg.salonTZ,
    bookPath: cfg.bookPath,
  });

  const slots = await fetchAvailability();
  if (!slots.length) {
    console.error("Нет свободных слотов на выбранную дату.");
    process.exit(1);
  }

  const first = slots[0];
  console.log("→ Беру первый слот:", first);

  const resp = await rawBook(first.start);
  console.log("→ HTTP:", resp.status, resp.contentType);
  if (resp.isHTML) {
    console.warn("⚠ Получен HTML — вероятно, это страница /booking (Server Actions), а не API.");
    console.log("→ body preview:\n", resp.preview, "\n");
  }

  const after = await fetchAvailability();
  const stillThere = after.some(s => s.start === first.start);
  console.log("→ Слот всё ещё в выдаче:", stillThere);
  console.log("→ Итог:", stillThere ? "❌ Бронь не прошла" : "✅ Забронировано");
})();
