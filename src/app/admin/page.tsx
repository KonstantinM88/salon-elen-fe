// src/app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  Newspaper,
  CalendarDays,
  CalendarCheck2,
  Users2,
  Gift,
  UserCircle2,
  BarChart3,
  Edit3,
  Plus,
  ArrowRight,
  Clock,
  CalendarClock,
  Trophy,
  Award,
  TrendingUp,
  CalendarRange,
  FileEdit,
  CheckCircle2,
  Sparkles,
  UserSquare2,
  Activity,
} from "lucide-react";
import type { ReactNode } from "react";
import QuickBookingButton, {
  type QuickBookingLabels,
} from "@/app/admin/_components/QuickBookingButton";
import { IconGlow } from "@/components/admin/IconGlow";
import {
  isSeoLocale,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";

export const dynamic = "force-dynamic";

const INTL_LOCALE_BY_APP_LOCALE: Record<SeoLocale, string> = {
  de: "de-DE",
  ru: "ru-RU",
  en: "en-US",
};

type AdminCopy = {
  guestFallback: string;
  heroTitle: string;
  todayLabel: string;
  heroSubtitle: string;
  sectionStats: string;
  kpiNews: string;
  kpiPending: string;
  kpiConfirmed: string;
  kpiClients: string;
  sectionQuickLinks: string;
  masters: string;
  mastersDescription: string;
  calendar: string;
  calendarDescription: string;
  statistics: string;
  statisticsDescription: string;
  monitoring: string;
  monitoringDescription: string;
  openCta: string;
  viewCta: string;
  dayToday: string;
  dayTomorrow: string;
  noMaster: string;
  noAppointmentsToday: string;
  noAppointmentsTomorrow: string;
  topMastersTitle: string;
  bookingsLabel: string;
  noCompletedWorks: string;
  freeWindowsTitle: string;
  freeIntervalTitle: string;
  fromLabel: string;
  noFreeWindows: string;
  draftsTitle: string;
  createdLabel: string;
  edit: string;
  noDrafts: string;
  latestPublications: string;
  add: string;
  draftStatus: string;
  publishedStatus: string;
  noPublications: string;
  birthdaysTitle: string;
  all: string;
  birthdayPrefix: string;
  birthdaySuffix: string;
  noBirthdays: string;
  quickBooking: QuickBookingLabels;
};

const ADMIN_COPY: Record<SeoLocale, AdminCopy> = {
  de: {
    guestFallback: "Gast",
    heroTitle: "Admin-Dashboard",
    todayLabel: "Heute",
    heroSubtitle:
      "Leichte Analysen, schnelle Aktionen und Überblick über freie Zeitfenster.",
    sectionStats: "Statistik",
    kpiNews: "Neuigkeiten",
    kpiPending: "Anfragen ausstehend",
    kpiConfirmed: "Bestätigte Anfragen",
    kpiClients: "Kunden",
    sectionQuickLinks: "Schnellzugriffe",
    masters: "Mitarbeiter",
    mastersDescription: "Mitarbeiter, Leistungen, Fotos und Arbeitspläne.",
    calendar: "Kalender",
    calendarDescription: "Salonplan, freie Slots und Ausnahmen nach Datum.",
    statistics: "Statistik",
    statisticsDescription: "Umsatz und Anfragen nach Zeitraum, Mitarbeitern und Leistungen.",
    monitoring: "Monitoring",
    monitoringDescription: "SMS-Guthaben und Registrierungsstatistik der Kunden.",
    openCta: "Öffnen",
    viewCta: "Ansehen",
    dayToday: "Heute",
    dayTomorrow: "Morgen",
    noMaster: "Ohne Mitarbeiter",
    noAppointmentsToday: "Keine Termine für heute",
    noAppointmentsTomorrow: "Keine Termine für morgen",
    topMastersTitle: "Top-Mitarbeiter (30 Tage)",
    bookingsLabel: "Buchungen",
    noCompletedWorks: "Keine abgeschlossenen Leistungen",
    freeWindowsTitle: "Freie Zeitfenster heute",
    freeIntervalTitle: "Freies Zeitfenster",
    fromLabel: "ab",
    noFreeWindows: "Keine freien Zeitfenster - der Tag ist ausgebucht",
    draftsTitle: "Entwürfe News/Angebote",
    createdLabel: "erstellt",
    edit: "Bearbeiten",
    noDrafts: "Keine Entwürfe - alles veröffentlicht",
    latestPublications: "Neueste Veröffentlichungen",
    add: "Hinzufügen",
    draftStatus: "Entwurf",
    publishedStatus: "Veröffentlicht",
    noPublications: "Noch keine Veröffentlichungen",
    birthdaysTitle: "Nächste Geburtstage (30 Tage)",
    all: "Alle",
    birthdayPrefix: "in ",
    birthdaySuffix: " Tagen",
    noBirthdays: "Keine anstehenden Geburtstage",
    quickBooking: {
      trigger: "Schnellbuchung",
      modalTitle: "Schnellbuchung",
      close: "Schließen",
      client: "Kunde",
      clientPlaceholder: "Kundenname",
      phone: "Telefon",
      phonePlaceholder: "+49...",
      emailOptional: "E-Mail (optional)",
      emailPlaceholder: "kunde@mail.com",
      master: "Mitarbeiter",
      service: "Leistung",
      date: "Datum",
      time: "Uhrzeit",
      nearestFree: "Nächste freie Zeiten:",
      useIntervalStartTitle: "Beginn des Zeitfensters einsetzen",
      notesOptional: "Notiz (optional)",
      notesPlaceholder: "Kommentar für den Mitarbeiter...",
      cancel: "Abbrechen",
      submit: "Anfrage erstellen",
    },
  },
  ru: {
    guestFallback: "Гость",
    heroTitle: "Дашборд администратора",
    todayLabel: "Сегодня",
    heroSubtitle: "Лёгкая аналитика, быстрые действия и видимость свободных окон.",
    sectionStats: "Статистика",
    kpiNews: "Новости",
    kpiPending: "Заявки в ожидании",
    kpiConfirmed: "Подтверждённых заявок",
    kpiClients: "Клиенты",
    sectionQuickLinks: "Быстрые ссылки",
    masters: "Мастера",
    mastersDescription: "Мастера, их услуги, фото и рабочие графики.",
    calendar: "Календарь",
    calendarDescription: "График салона, окна и исключения по датам.",
    statistics: "Статистика",
    statisticsDescription: "Касса и заявки по периодам, мастерам и услугам.",
    monitoring: "Мониторинг",
    monitoringDescription: "Баланс SMS и статистика регистраций клиентов.",
    openCta: "Открыть",
    viewCta: "Смотреть",
    dayToday: "Сегодня",
    dayTomorrow: "Завтра",
    noMaster: "Без мастера",
    noAppointmentsToday: "Нет записей на сегодня",
    noAppointmentsTomorrow: "Нет записей на завтра",
    topMastersTitle: "Топ-мастера (30 дней)",
    bookingsLabel: "заказов",
    noCompletedWorks: "Нет выполненных работ",
    freeWindowsTitle: "Свободные окна сегодня",
    freeIntervalTitle: "Свободный интервал",
    fromLabel: "с",
    noFreeWindows: "Свободных окон нет - день заполнен",
    draftsTitle: "Черновики новостей/акций",
    createdLabel: "создано",
    edit: "Редактировать",
    noDrafts: "Черновиков нет - всё опубликовано",
    latestPublications: "Последние публикации",
    add: "Добавить",
    draftStatus: "Черновик",
    publishedStatus: "Опубликовано",
    noPublications: "Пока нет публикаций",
    birthdaysTitle: "Ближайшие именинники (30 дней)",
    all: "Все",
    birthdayPrefix: "через ",
    birthdaySuffix: " дн.",
    noBirthdays: "Нет ближайших дней рождения",
    quickBooking: {
      trigger: "Быстрая запись",
      modalTitle: "Быстрая запись",
      close: "Закрыть",
      client: "Клиент",
      clientPlaceholder: "Имя клиента",
      phone: "Телефон",
      phonePlaceholder: "+380...",
      emailOptional: "Email (необязательно)",
      emailPlaceholder: "client@mail.com",
      master: "Мастер",
      service: "Услуга",
      date: "Дата",
      time: "Время",
      nearestFree: "Ближайшие свободные:",
      useIntervalStartTitle: "Подставить начало интервала",
      notesOptional: "Заметка (необязательно)",
      notesPlaceholder: "Комментарий для мастера…",
      cancel: "Отмена",
      submit: "Создать заявку",
    },
  },
  en: {
    guestFallback: "Guest",
    heroTitle: "Admin Dashboard",
    todayLabel: "Today",
    heroSubtitle: "Light analytics, quick actions and visibility of free slots.",
    sectionStats: "Statistics",
    kpiNews: "News",
    kpiPending: "Pending requests",
    kpiConfirmed: "Confirmed requests",
    kpiClients: "Clients",
    sectionQuickLinks: "Quick links",
    masters: "Masters",
    mastersDescription: "Masters, their services, photos and work schedules.",
    calendar: "Calendar",
    calendarDescription: "Salon schedule, slots and date exceptions.",
    statistics: "Statistics",
    statisticsDescription: "Revenue and requests by period, masters and services.",
    monitoring: "Monitoring",
    monitoringDescription: "SMS balance and client registration stats.",
    openCta: "Open",
    viewCta: "View",
    dayToday: "Today",
    dayTomorrow: "Tomorrow",
    noMaster: "No master",
    noAppointmentsToday: "No appointments for today",
    noAppointmentsTomorrow: "No appointments for tomorrow",
    topMastersTitle: "Top masters (30 days)",
    bookingsLabel: "Bookings",
    noCompletedWorks: "No completed services",
    freeWindowsTitle: "Free slots today",
    freeIntervalTitle: "Free interval",
    fromLabel: "from",
    noFreeWindows: "No free slots - day is fully booked",
    draftsTitle: "News/promo drafts",
    createdLabel: "created",
    edit: "Edit",
    noDrafts: "No drafts - everything is published",
    latestPublications: "Latest publications",
    add: "Add",
    draftStatus: "Draft",
    publishedStatus: "Published",
    noPublications: "No publications yet",
    birthdaysTitle: "Upcoming birthdays (30 days)",
    all: "All",
    birthdayPrefix: "in ",
    birthdaySuffix: " days",
    noBirthdays: "No upcoming birthdays",
    quickBooking: {
      trigger: "Quick booking",
      modalTitle: "Quick booking",
      close: "Close",
      client: "Client",
      clientPlaceholder: "Client name",
      phone: "Phone",
      phonePlaceholder: "+1...",
      emailOptional: "Email (optional)",
      emailPlaceholder: "client@mail.com",
      master: "Master",
      service: "Service",
      date: "Date",
      time: "Time",
      nearestFree: "Nearest free slots:",
      useIntervalStartTitle: "Use interval start",
      notesOptional: "Note (optional)",
      notesPlaceholder: "Comment for the master...",
      cancel: "Cancel",
      submit: "Create request",
    },
  },
};

async function resolveAdminActionLocale(): Promise<SeoLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (isSeoLocale(cookieLocale)) return cookieLocale;
  return "de";
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVER ACTION: Быстрая запись
═══════════════════════════════════════════════════════════════════════════ */

export async function createQuickAppointment(formData: FormData) {
  "use server";
  const locale = await resolveAdminActionLocale();
  const t = ADMIN_COPY[locale];
  const customerName = String(formData.get("customerName") ?? "").trim() || t.guestFallback;
  const phone = String(formData.get("phone") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const email = emailRaw ? emailRaw : null;
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw : null;

  const masterId = String(formData.get("masterId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const date = String(formData.get("date") ?? ""); // YYYY-MM-DD
  const time = String(formData.get("time") ?? ""); // HH:MM

  if (!masterId || !serviceId || !date || !time) {
    redirect("/admin?quick=error");
  }

  const [hh, mm] = time.split(":").map((x) => Number(x));
  const start = new Date(date + "T00:00:00");
  start.setHours(hh, mm ?? 0, 0, 0);

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { durationMin: true },
  });

  const durationMin = service?.durationMin ?? 60;
  const end = new Date(start.getTime() + durationMin * 60_000);

  await prisma.appointment.create({
    data: {
      customerName,
      phone,
      email,
      notes,
      startAt: start,
      endAt: end,
      status: AppointmentStatus.PENDING,
      master: { connect: { id: masterId } },
      service: { connect: { id: serviceId } },
    },
  });

  revalidatePath("/admin");
  redirect("/admin?quick=ok");
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
═══════════════════════════════════════════════════════════════════════════ */

function fmtDate(d: Date, locale: SeoLocale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE_BY_APP_LOCALE[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function fmtTime(d: Date, locale: SeoLocale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE_BY_APP_LOCALE[locale], {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function moneyFromCents(
  cents: number,
  locale: SeoLocale,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat(INTL_LOCALE_BY_APP_LOCALE[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
}

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function addDaysLocal(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function daysUntilBirthday(birthDate: Date, today: Date): number {
  const m = birthDate.getUTCMonth();
  const d = birthDate.getUTCDate();
  const thisYear = new Date(Date.UTC(today.getUTCFullYear(), m, d));
  const next =
    thisYear >= today
      ? thisYear
      : new Date(Date.UTC(today.getUTCFullYear() + 1, m, d));
  return Math.ceil((next.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function weekdayMon0(d: Date): number {
  return (d.getDay() + 6) % 7; // 0=Mon..6=Sun
}

/* ═══════════════════════════════════════════════════════════════════════════
   АДАПТИВНЫЕ UI КОМПОНЕНТЫ
═══════════════════════════════════════════════════════════════════════════ */

function KPICard({
  title,
  value,
  icon,
  tone = "sky",
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  tone?: "sky" | "emerald" | "violet" | "rose";
}) {
  const tones = {
    sky: {
      ring: "ring-sky-400/30",
      icon: "text-sky-400",
      bg: "from-sky-500/10 to-sky-500/0",
    },
    emerald: {
      ring: "ring-emerald-400/30",
      icon: "text-emerald-400",
      bg: "from-emerald-500/10 to-emerald-500/0",
    },
    violet: {
      ring: "ring-violet-400/30",
      icon: "text-violet-300",
      bg: "from-violet-500/10 to-violet-500/0",
    },
    rose: {
      ring: "ring-rose-400/30",
      icon: "text-rose-300",
      bg: "from-rose-500/10 to-rose-500/0",
    },
  }[tone];

  return (
    <div
      className="card-glass card-glow p-4 sm:p-5 transition-all duration-300
                 hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${tones.bg}`} />
      <div className="relative flex items-start gap-3">
        <IconGlow
          tone={tone}
          className={`h-10 w-10 sm:h-12 sm:w-12 ring-2 ${tones.ring} bg-white/5 shrink-0`}
        >
          <span className={tones.icon}>{icon}</span>
        </IconGlow>
        <div className="grow min-w-0">
          <div className="text-xs sm:text-sm opacity-70 mb-1">{title}</div>
          <div className="text-xl sm:text-2xl font-semibold truncate">{value}</div>
        </div>
      </div>
    </div>
  );
}

function LinkCard({
  title,
  description,
  href,
  icon,
  color = "sky",
  cta = "Open",
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  color?: "sky" | "violet" | "emerald" | "amber";
  cta?: string;
}) {
  const map = {
    sky: "bg-sky-600 hover:bg-sky-500",
    violet: "bg-violet-600 hover:bg-violet-500",
    emerald: "bg-emerald-600 hover:bg-emerald-500",
    amber: "bg-amber-600 hover:bg-amber-500",
  }[color];
  const ringMap = {
    sky: "ring-sky-400/30",
    violet: "ring-violet-400/30",
    emerald: "ring-emerald-400/30",
    amber: "ring-amber-400/30",
  }[color];

  return (
    <div
      className="card-glass card-glow p-4 sm:p-5 space-y-3
                 transition-all duration-300 hover:-translate-y-0.5
                 hover:border-white/20"
    >
      <div className="flex items-center gap-3">
        <IconGlow
          tone={color}
          className={`h-10 w-10 ring-2 ${ringMap} bg-white/5 shrink-0`}
        >
          {icon}
        </IconGlow>
        <div className="text-base font-medium truncate">{title}</div>
      </div>
      <p className="text-sm opacity-70 line-clamp-2">{description}</p>
      <Link
        href={href}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm
                   ${map} transition-all hover:scale-105 active:scale-95`}
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveContentLocale(searchParams);
  const t = ADMIN_COPY[locale];
  const now = new Date();
  const today = startOfDayLocal(now);
  const tomorrow = addDaysLocal(today, 1);
  const dayAfterTomorrow = addDaysLocal(today, 2);
  const last30 = addDaysLocal(today, -29);
  const weekday = weekdayMon0(today);

  const [
    articleCount,
    pendingCount,
    confirmedCount,
    clientCount,
    latestArticles,
    clients,
    apptsToday,
    apptsTomorrow,
    doneLast30,
    masters,
    whToday,
    offsToday,
    apptsWholeDay,
    drafts,
    services,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
    prisma.appointment.count({ where: { status: AppointmentStatus.CONFIRMED } }),
    prisma.client.count(),
    prisma.article.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: { id: true, title: true, createdAt: true, publishedAt: true },
    }),
    prisma.client.findMany({ select: { id: true, name: true, birthDate: true } }),

    prisma.appointment.findMany({
      where: {
        startAt: { gte: today, lt: tomorrow },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
      orderBy: { startAt: "asc" },
      take: 8,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        customerName: true,
        master: { select: { id: true, name: true } },
        service: { select: { name: true } },
      },
    }),
    prisma.appointment.findMany({
      where: {
        startAt: { gte: tomorrow, lt: dayAfterTomorrow },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
      orderBy: { startAt: "asc" },
      take: 8,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        customerName: true,
        master: { select: { id: true, name: true } },
        service: { select: { name: true } },
      },
    }),

    prisma.appointment.findMany({
      where: {
        startAt: { gte: last30, lt: dayAfterTomorrow },
        status: AppointmentStatus.DONE,
      },
      select: {
        service: { select: { priceCents: true } },
        master: { select: { id: true, name: true } },
      },
    }),

    prisma.master.findMany({ select: { id: true, name: true } }),
    prisma.masterWorkingHours.findMany({
      where: { weekday },
      select: { masterId: true, isClosed: true, startMinutes: true, endMinutes: true },
    }),
    prisma.masterTimeOff.findMany({
      where: {
        date: new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        ),
      },
      select: { masterId: true, startMinutes: true, endMinutes: true },
    }),
    prisma.appointment.findMany({
      where: {
        startAt: { gte: today, lt: tomorrow },
        status: {
          in: [
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.DONE,
          ],
        },
      },
      select: { masterId: true, startAt: true, endAt: true },
    }),

    prisma.article.findMany({
      where: { publishedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),

    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        durationMin: true,
        parent: { select: { name: true } },
      },
    }),
  ]);

  // Ближайшие ДР
  const upcoming = clients
    .map((c) => ({ ...c, inDays: daysUntilBirthday(c.birthDate, now) }))
    .filter((c) => c.inDays >= 0 && c.inDays <= 30)
    .sort((a, b) => a.inDays - b.inDays)
    .slice(0, 10);

  // ТОП мастера
  type TopRow = { id: string; name: string; cents: number; count: number };
  const byMasterRevenue = new Map<string, TopRow>();
  for (const a of doneLast30) {
    const id = a.master?.id ?? "none";
    const name = a.master?.name ?? t.noMaster;
    const price = a.service?.priceCents ?? 0;
    const row = byMasterRevenue.get(id) ?? { id, name, cents: 0, count: 0 };
    row.cents += price;
    row.count += 1;
    byMasterRevenue.set(id, row);
  }
  const topMasters = [...byMasterRevenue.values()]
    .sort((x, y) => y.cents - x.cents)
    .slice(0, 5);

  // Свободные окна сегодня
  type Interval = { start: number; end: number };
  const whByMaster = new Map(
    whToday.map((w) => [
      w.masterId,
      { isClosed: w.isClosed, start: w.startMinutes, end: w.endMinutes },
    ])
  );
  const offsByMaster = new Map<string, Interval[]>();
  for (const o of offsToday) {
    const arr = offsByMaster.get(o.masterId) ?? [];
    arr.push({ start: o.startMinutes, end: o.endMinutes });
    offsByMaster.set(o.masterId, arr);
  }
  const apptsByMaster = new Map<string, Interval[]>();
  for (const a of apptsWholeDay) {
    if (!a.masterId) continue;
    const s = a.startAt.getHours() * 60 + a.startAt.getMinutes();
    const e = a.endAt.getHours() * 60 + a.endAt.getMinutes();
    const arr = apptsByMaster.get(a.masterId) ?? [];
    arr.push({ start: s, end: e });
    apptsByMaster.set(a.masterId, arr);
  }

  function subtractOne(bases: Interval[], block: Interval): Interval[] {
    const out: Interval[] = [];
    for (const b of bases) {
      if (block.end <= b.start || block.start >= b.end) {
        out.push(b);
        continue;
      }
      if (block.start > b.start)
        out.push({ start: b.start, end: Math.min(block.start, b.end) });
      if (block.end < b.end)
        out.push({ start: Math.max(block.end, b.start), end: b.end });
    }
    return out;
  }

  function subtractMany(bases: Interval[], blocks: Interval[]): Interval[] {
    let res = bases.slice();
    const sorted = blocks.slice().sort((a, b) => a.start - b.start);
    for (const bl of sorted) res = subtractOne(res, bl);
    return res
      .map((i) => ({
        start: Math.max(0, Math.min(1440, i.start)),
        end: Math.max(0, Math.min(1440, i.end)),
      }))
      .filter((i) => i.end - i.start >= 15);
  }

  type FreeCardRow = { id: string; name: string; next?: string; slots: string[] };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const freeRows: FreeCardRow[] = [];

  for (const m of masters) {
    const wh = whByMaster.get(m.id);
    if (!wh || wh.isClosed || wh.start >= wh.end) continue;

    let intervals: Interval[] = [
      { start: Math.max(wh.start, 0), end: Math.min(wh.end, 1440) },
    ];
    const offs = offsByMaster.get(m.id) ?? [];
    intervals = subtractMany(intervals, offs);
    const blocks = apptsByMaster.get(m.id) ?? [];
    intervals = subtractMany(intervals, blocks);
    intervals = intervals
      .map((i) => ({ start: Math.max(i.start, nowMin), end: i.end }))
      .filter((i) => i.end - i.start >= 15);

    if (intervals.length === 0) continue;

    const slots = intervals
      .slice(0, 3)
      .map((i) => `${minutesToHHMM(i.start)}–${minutesToHHMM(i.end)}`);

    freeRows.push({
      id: m.id,
      name: m.name,
      next: minutesToHHMM(intervals[0].start),
      slots,
    });
  }
  freeRows.sort((a, b) => (a.next ?? "99:99").localeCompare(b.next ?? "99:99"));

  // Значения по умолчанию для модалки
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
  const nextHalfHour = (() => {
    const m = now.getMinutes();
    const rounded = m < 30 ? 30 : 60;
    const h = m < 30 ? now.getHours() : now.getHours() + 1;
    return `${String(h % 24).padStart(2, "0")}:${String(rounded % 60).padStart(
      2,
      "0"
    )}`;
  })();

  const masterOpts = masters.map((m) => ({ id: m.id, name: m.name }));
  const serviceOpts = services.map((s) => ({
    id: s.id,
    name: s.parent?.name ? `${s.parent.name} · ${s.name}` : s.name,
    durationMin: s.durationMin ?? 60,
    parentName: s.parent?.name ?? null,
  }));

  return (
    <main className="space-y-6 sm:space-y-8">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO СЕКЦИЯ
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.violet.500/10),transparent_35%),radial-gradient(ellipse_at_bottom_right,theme(colors.sky.500/10),transparent_35%)]" />
        <div className="relative p-4 sm:p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold flex items-center gap-2">
              <span className="truncate">{t.heroTitle}</span>
              <IconGlow tone="violet" className="icon-glow-sm shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-violet-200" />
              </IconGlow>
            </h1>
            <p className="text-xs sm:text-sm opacity-70 mt-1">
              {t.todayLabel}: {fmtDate(now, locale)} · {t.heroSubtitle}
            </p>
          </div>
          <div className="shrink-0">
            <QuickBookingButton
              masters={masterOpts}
              services={serviceOpts}
              defaultDate={todayStr}
              defaultTime={nextHalfHour}
              action={createQuickAppointment}
              hints={freeRows.slice(0, 6)}
              labels={t.quickBooking}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          KPI МЕТРИКИ
      ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">{t.sectionStats}</h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title={t.kpiNews}
            value={articleCount}
            icon={<Newspaper className="h-5 w-5" />}
            tone="violet"
          />
          <KPICard
            title={t.kpiPending}
            value={pendingCount}
            icon={<CalendarDays className="h-5 w-5" />}
            tone="rose"
          />
          <KPICard
            title={t.kpiConfirmed}
            value={confirmedCount}
            icon={<CalendarCheck2 className="h-5 w-5" />}
            tone="emerald"
          />
          <KPICard
            title={t.kpiClients}
            value={clientCount}
            icon={<Users2 className="h-5 w-5" />}
            tone="sky"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          БЫСТРЫЕ ССЫЛКИ
      ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">{t.sectionQuickLinks}</h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <LinkCard
            title={t.masters}
            description={t.mastersDescription}
            href="/admin/masters"
            icon={<UserSquare2 className="h-5 w-5" />}
            color="violet"
            cta={t.openCta}
          />
          <LinkCard
            title={t.calendar}
            description={t.calendarDescription}
            href="/admin/calendar"
            icon={<CalendarDays className="h-5 w-5" />}
            color="sky"
            cta={t.openCta}
          />
          <LinkCard
            title={t.statistics}
            description={t.statisticsDescription}
            href="/admin/stats"
            icon={<BarChart3 className="h-5 w-5" />}
            color="emerald"
            cta={t.viewCta}
          />
          <LinkCard
            title={t.monitoring}
            description={t.monitoringDescription}
            href="/admin/dashboard"
            icon={<Activity className="h-5 w-5" />}
            color="amber"
            cta={t.openCta}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          БЛИЖАЙШИЕ ЗАПИСИ + ТОП МАСТЕРА
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Сегодня */}
        <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-r from-sky-500/5">
            <div className="flex items-center gap-2 min-w-0">
              <IconGlow tone="sky" className="icon-glow-sm shrink-0">
                <Clock className="h-4 w-4 text-sky-200" />
              </IconGlow>
              <h3 className="font-medium text-sm sm:text-base truncate">
                {t.dayToday} • {fmtDate(today, locale)}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {apptsToday.map((a) => (
              <div
                key={a.id}
                className="group p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {a.customerName} • {a.service?.name ?? "—"}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {a.master?.name ?? t.noMaster}
                  </div>
                </div>
                <div className="shrink-0 text-xs sm:text-sm rounded-full px-2 py-1 bg-muted/40">
                  {fmtTime(a.startAt, locale)}—{fmtTime(a.endAt, locale)}
                </div>
              </div>
            ))}
            {apptsToday.length === 0 && (
              <div className="p-4 opacity-60 text-sm">{t.noAppointmentsToday}</div>
            )}
          </div>
        </div>

        {/* Завтра */}
        <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-r from-emerald-500/5">
            <div className="flex items-center gap-2 min-w-0">
              <IconGlow tone="emerald" className="icon-glow-sm shrink-0">
                <CalendarClock className="h-4 w-4 text-emerald-200" />
              </IconGlow>
              <h3 className="font-medium text-sm sm:text-base truncate">
                {t.dayTomorrow} • {fmtDate(tomorrow, locale)}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {apptsTomorrow.map((a) => (
              <div
                key={a.id}
                className="group p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {a.customerName} • {a.service?.name ?? "—"}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {a.master?.name ?? t.noMaster}
                  </div>
                </div>
                <div className="shrink-0 text-xs sm:text-sm rounded-full px-2 py-1 bg-muted/40">
                  {fmtTime(a.startAt, locale)}—{fmtTime(a.endAt, locale)}
                </div>
              </div>
            ))}
            {apptsTomorrow.length === 0 && (
              <div className="p-4 opacity-60 text-sm">{t.noAppointmentsTomorrow}</div>
            )}
          </div>
        </div>

        {/* ТОП мастера */}
        <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-r from-amber-500/5">
            <div className="flex items-center gap-2 min-w-0">
              <IconGlow tone="amber" className="icon-glow-sm shrink-0">
                <Trophy className="h-4 w-4 text-amber-200" />
              </IconGlow>
              <h3 className="font-medium text-sm sm:text-base truncate">
                {t.topMastersTitle}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {topMasters.map((m, idx) => (
              <div
                key={m.id}
                className="group p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-full grid place-items-center bg-muted/40 shrink-0">
                    {idx === 0 ? (
                      <Award className="h-4 w-4 text-amber-400" />
                    ) : (
                      <TrendingUp className="h-4 w-4 opacity-70" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs opacity-70">
                      {t.bookingsLabel}: {m.count}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-xs sm:text-sm rounded-full px-2 py-1 bg-emerald-500/15 text-emerald-400">
                  {moneyFromCents(m.cents, locale)}
                </div>
              </div>
            ))}
            {topMasters.length === 0 && (
              <div className="p-4 opacity-60 text-sm">{t.noCompletedWorks}</div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          СВОБОДНЫЕ ОКНА + ЧЕРНОВИКИ
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Свободные окна */}
        <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
          <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-gradient-to-r from-sky-500/5">
            <IconGlow tone="sky" className="icon-glow-sm shrink-0">
              <CalendarRange className="h-4 w-4 text-sky-200" />
            </IconGlow>
            <h3 className="font-medium text-sm sm:text-base">{t.freeWindowsTitle}</h3>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {freeRows.slice(0, 8).map((r) => (
              <div
                key={r.id}
                className="p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-xs opacity-70 flex flex-wrap gap-1 mt-0.5">
                    {r.slots.map((s, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded-full border text-[11px] ${
                          i === 0
                            ? "border-emerald-400/40 text-emerald-400"
                            : "opacity-80"
                        }`}
                        title={t.freeIntervalTitle}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {r.next && (
                  <div className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t.fromLabel} {r.next}
                  </div>
                )}
              </div>
            ))}
            {freeRows.length === 0 && (
              <div className="p-4 opacity-60 text-sm">{t.noFreeWindows}</div>
            )}
          </div>
        </div>

        {/* Черновики */}
        <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
          <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-gradient-to-r from-violet-500/5">
            <IconGlow tone="violet" className="icon-glow-sm shrink-0">
              <FileEdit className="h-4 w-4 text-violet-200" />
            </IconGlow>
            <h3 className="font-medium text-sm sm:text-base">{t.draftsTitle}</h3>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{d.title}</div>
                  <div className="text-xs opacity-60">
                    {t.createdLabel} {fmtDate(d.createdAt, locale)}
                  </div>
                </div>
                <Link
                  href={`/admin/news/${d.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 
                           hover:bg-muted/40 transition text-sm shrink-0 w-fit"
                >
                  <Edit3 className="h-4 w-4" /> {t.edit}
                </Link>
              </div>
            ))}
            {drafts.length === 0 && (
              <div className="p-4 opacity-60 text-sm">{t.noDrafts}</div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ПУБЛИКАЦИИ & ДНИ РОЖДЕНИЯ
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Публикации */}
        <div>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-base sm:text-lg font-semibold truncate">{t.latestPublications}</h2>
            <Link
              href="/admin/news/new"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm
                       bg-violet-600 hover:bg-violet-500 transition shrink-0"
            >
              <Plus className="h-4 w-4" /> {t.add}
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            {latestArticles.map((a) => {
              const isDraft = !a.publishedAt;
              return (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-white/[0.02] transition"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate text-sm">{a.title}</div>
                    <div className="text-xs opacity-60">
                      {isDraft ? t.draftStatus : t.publishedStatus} •{" "}
                      {fmtDate(a.publishedAt ?? a.createdAt, locale)}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 items-center">
                    {isDraft && (
                      <span className="rounded-full px-2 py-1 text-xs bg-amber-500/15 text-amber-400">
                        {t.draftStatus}
                      </span>
                    )}
                    <Link
                      href={`/admin/news/${a.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 
                               hover:bg-muted/40 transition text-sm"
                    >
                      <Edit3 className="h-4 w-4" /> {t.edit}
                    </Link>
                  </div>
                </div>
              );
            })}
            {latestArticles.length === 0 && (
              <div className="p-4 opacity-70 text-sm">{t.noPublications}</div>
            )}
          </div>
        </div>

        {/* Дни рождения */}
        <div>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-base sm:text-lg font-semibold truncate">{t.birthdaysTitle}</h2>
            <Link
              href="/admin/clients?filter=birthdays"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 
                       hover:bg-muted/40 transition text-sm shrink-0"
            >
              {t.all} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            {upcoming.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 gap-3 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full grid place-items-center bg-muted/40 shrink-0">
                    <UserCircle2 className="h-6 w-6 opacity-70" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate text-sm">{c.name}</div>
                    <div className="text-xs opacity-60 flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" />
                      {t.birthdayPrefix}
                      {c.inDays}
                      {t.birthdaySuffix}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition shrink-0"
                >
                  {t.openCta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="p-4 opacity-70 text-sm">{t.noBirthdays}</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}






//---------добовляем карточку мониторинг------
// // src/app/admin/page.tsx
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { AppointmentStatus } from "@prisma/client";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import {
//   Newspaper,
//   CalendarDays,
//   CalendarCheck2,
//   Users2,
//   Gift,
//   UserCircle2,
//   BarChart3,
//   Edit3,
//   Plus,
//   ArrowRight,
//   Clock,
//   CalendarClock,
//   Trophy,
//   Award,
//   TrendingUp,
//   CalendarRange,
//   FileEdit,
//   CheckCircle2,
//   Sparkles,
//   UserSquare2,
// } from "lucide-react";
// import type { ReactNode } from "react";
// import QuickBookingButton from "@/app/admin/_components/QuickBookingButton";
// import { IconGlow } from "@/components/admin/IconGlow";

// export const dynamic = "force-dynamic";

// /* ═══════════════════════════════════════════════════════════════════════════
//    SERVER ACTION: Быстрая запись
// ═══════════════════════════════════════════════════════════════════════════ */

// export async function createQuickAppointment(formData: FormData) {
//   "use server";
//   const customerName = String(formData.get("customerName") ?? "").trim() || "Гость";
//   const phone = String(formData.get("phone") ?? "").trim();
//   const emailRaw = String(formData.get("email") ?? "").trim();
//   const email = emailRaw ? emailRaw : null;
//   const notesRaw = String(formData.get("notes") ?? "").trim();
//   const notes = notesRaw ? notesRaw : null;

//   const masterId = String(formData.get("masterId") ?? "");
//   const serviceId = String(formData.get("serviceId") ?? "");
//   const date = String(formData.get("date") ?? ""); // YYYY-MM-DD
//   const time = String(formData.get("time") ?? ""); // HH:MM

//   if (!masterId || !serviceId || !date || !time) {
//     redirect("/admin?quick=error");
//   }

//   const [hh, mm] = time.split(":").map((x) => Number(x));
//   const start = new Date(date + "T00:00:00");
//   start.setHours(hh, mm ?? 0, 0, 0);

//   const service = await prisma.service.findUnique({
//     where: { id: serviceId },
//     select: { durationMin: true },
//   });

//   const durationMin = service?.durationMin ?? 60;
//   const end = new Date(start.getTime() + durationMin * 60_000);

//   await prisma.appointment.create({
//     data: {
//       customerName,
//       phone,
//       email,
//       notes,
//       startAt: start,
//       endAt: end,
//       status: AppointmentStatus.PENDING,
//       master: { connect: { id: masterId } },
//       service: { connect: { id: serviceId } },
//     },
//   });

//   revalidatePath("/admin");
//   redirect("/admin?quick=ok");
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════ */

// function fmtDate(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtTime(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// function moneyFromCents(cents: number, currency: string = "EUR"): string {
//   return new Intl.NumberFormat("ru-RU", {
//     style: "currency",
//     currency,
//     maximumFractionDigits: 0,
//   }).format((cents || 0) / 100);
// }

// function startOfDayLocal(d: Date): Date {
//   return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
// }

// function addDaysLocal(d: Date, days: number): Date {
//   const x = new Date(d);
//   x.setDate(x.getDate() + days);
//   return x;
// }

// function daysUntilBirthday(birthDate: Date, today: Date): number {
//   const m = birthDate.getUTCMonth();
//   const d = birthDate.getUTCDate();
//   const thisYear = new Date(Date.UTC(today.getUTCFullYear(), m, d));
//   const next =
//     thisYear >= today
//       ? thisYear
//       : new Date(Date.UTC(today.getUTCFullYear() + 1, m, d));
//   return Math.ceil((next.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
// }

// function minutesToHHMM(mins: number): string {
//   const h = Math.floor(mins / 60);
//   const m = mins % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// }

// function weekdayMon0(d: Date): number {
//   return (d.getDay() + 6) % 7; // 0=Mon..6=Sun
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    АДАПТИВНЫЕ UI КОМПОНЕНТЫ
// ═══════════════════════════════════════════════════════════════════════════ */

// function KPICard({
//   title,
//   value,
//   icon,
//   tone = "sky",
// }: {
//   title: string;
//   value: string | number;
//   icon: ReactNode;
//   tone?: "sky" | "emerald" | "violet" | "rose";
// }) {
//   const tones = {
//     sky: {
//       ring: "ring-sky-400/30",
//       icon: "text-sky-400",
//       bg: "from-sky-500/10 to-sky-500/0",
//     },
//     emerald: {
//       ring: "ring-emerald-400/30",
//       icon: "text-emerald-400",
//       bg: "from-emerald-500/10 to-emerald-500/0",
//     },
//     violet: {
//       ring: "ring-violet-400/30",
//       icon: "text-violet-300",
//       bg: "from-violet-500/10 to-violet-500/0",
//     },
//     rose: {
//       ring: "ring-rose-400/30",
//       icon: "text-rose-300",
//       bg: "from-rose-500/10 to-rose-500/0",
//     },
//   }[tone];

//   return (
//     <div
//       className="card-glass card-glow p-4 sm:p-5 transition-all duration-300
//                  hover:-translate-y-0.5 hover:border-white/20"
//     >
//       <div className={`absolute inset-0 bg-gradient-to-br ${tones.bg}`} />
//       <div className="relative flex items-start gap-3">
//         <IconGlow
//           tone={tone}
//           className={`h-10 w-10 sm:h-12 sm:w-12 ring-2 ${tones.ring} bg-white/5 shrink-0`}
//         >
//           <span className={tones.icon}>{icon}</span>
//         </IconGlow>
//         <div className="grow min-w-0">
//           <div className="text-xs sm:text-sm opacity-70 mb-1">{title}</div>
//           <div className="text-xl sm:text-2xl font-semibold truncate">{value}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function LinkCard({
//   title,
//   description,
//   href,
//   icon,
//   color = "sky",
//   cta = "Открыть",
// }: {
//   title: string;
//   description: string;
//   href: string;
//   icon: ReactNode;
//   color?: "sky" | "violet" | "emerald";
//   cta?: string;
// }) {
//   const map = {
//     sky: "bg-sky-600 hover:bg-sky-500",
//     violet: "bg-violet-600 hover:bg-violet-500",
//     emerald: "bg-emerald-600 hover:bg-emerald-500",
//   }[color];
//   const ringMap = {
//     sky: "ring-sky-400/30",
//     violet: "ring-violet-400/30",
//     emerald: "ring-emerald-400/30",
//   }[color];

//   return (
//     <div
//       className="card-glass card-glow p-4 sm:p-5 space-y-3
//                  transition-all duration-300 hover:-translate-y-0.5
//                  hover:border-white/20"
//     >
//       <div className="flex items-center gap-3">
//         <IconGlow
//           tone={color}
//           className={`h-10 w-10 ring-2 ${ringMap} bg-white/5 shrink-0`}
//         >
//           {icon}
//         </IconGlow>
//         <div className="text-base font-medium truncate">{title}</div>
//       </div>
//       <p className="text-sm opacity-70 line-clamp-2">{description}</p>
//       <Link
//         href={href}
//         className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm
//                    ${map} transition-all hover:scale-105 active:scale-95`}
//       >
//         {cta} <ArrowRight className="h-4 w-4" />
//       </Link>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════ */

// export default async function AdminDashboard() {
//   const now = new Date();
//   const today = startOfDayLocal(now);
//   const tomorrow = addDaysLocal(today, 1);
//   const dayAfterTomorrow = addDaysLocal(today, 2);
//   const last30 = addDaysLocal(today, -29);
//   const weekday = weekdayMon0(today);

//   const [
//     articleCount,
//     pendingCount,
//     confirmedCount,
//     clientCount,
//     latestArticles,
//     clients,
//     apptsToday,
//     apptsTomorrow,
//     doneLast30,
//     masters,
//     whToday,
//     offsToday,
//     apptsWholeDay,
//     drafts,
//     services,
//   ] = await Promise.all([
//     prisma.article.count(),
//     prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
//     prisma.appointment.count({ where: { status: AppointmentStatus.CONFIRMED } }),
//     prisma.client.count(),
//     prisma.article.findMany({
//       orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
//       take: 6,
//       select: { id: true, title: true, createdAt: true, publishedAt: true },
//     }),
//     prisma.client.findMany({ select: { id: true, name: true, birthDate: true } }),

//     prisma.appointment.findMany({
//       where: {
//         startAt: { gte: today, lt: tomorrow },
//         status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
//       },
//       orderBy: { startAt: "asc" },
//       take: 8,
//       select: {
//         id: true,
//         startAt: true,
//         endAt: true,
//         status: true,
//         customerName: true,
//         master: { select: { id: true, name: true } },
//         service: { select: { name: true } },
//       },
//     }),
//     prisma.appointment.findMany({
//       where: {
//         startAt: { gte: tomorrow, lt: dayAfterTomorrow },
//         status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
//       },
//       orderBy: { startAt: "asc" },
//       take: 8,
//       select: {
//         id: true,
//         startAt: true,
//         endAt: true,
//         status: true,
//         customerName: true,
//         master: { select: { id: true, name: true } },
//         service: { select: { name: true } },
//       },
//     }),

//     prisma.appointment.findMany({
//       where: {
//         startAt: { gte: last30, lt: dayAfterTomorrow },
//         status: AppointmentStatus.DONE,
//       },
//       select: {
//         service: { select: { priceCents: true } },
//         master: { select: { id: true, name: true } },
//       },
//     }),

//     prisma.master.findMany({ select: { id: true, name: true } }),
//     prisma.masterWorkingHours.findMany({
//       where: { weekday },
//       select: { masterId: true, isClosed: true, startMinutes: true, endMinutes: true },
//     }),
//     prisma.masterTimeOff.findMany({
//       where: {
//         date: new Date(
//           Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
//         ),
//       },
//       select: { masterId: true, startMinutes: true, endMinutes: true },
//     }),
//     prisma.appointment.findMany({
//       where: {
//         startAt: { gte: today, lt: tomorrow },
//         status: {
//           in: [
//             AppointmentStatus.PENDING,
//             AppointmentStatus.CONFIRMED,
//             AppointmentStatus.DONE,
//           ],
//         },
//       },
//       select: { masterId: true, startAt: true, endAt: true },
//     }),

//     prisma.article.findMany({
//       where: { publishedAt: null },
//       orderBy: { createdAt: "desc" },
//       take: 5,
//       select: { id: true, title: true, createdAt: true },
//     }),

//     prisma.service.findMany({
//       where: { isActive: true },
//       orderBy: [{ parentId: "asc" }, { name: "asc" }],
//       select: {
//         id: true,
//         name: true,
//         durationMin: true,
//         parent: { select: { name: true } },
//       },
//     }),
//   ]);

//   // Ближайшие ДР
//   const upcoming = clients
//     .map((c) => ({ ...c, inDays: daysUntilBirthday(c.birthDate, now) }))
//     .filter((c) => c.inDays >= 0 && c.inDays <= 30)
//     .sort((a, b) => a.inDays - b.inDays)
//     .slice(0, 10);

//   // ТОП мастера
//   type TopRow = { id: string; name: string; cents: number; count: number };
//   const byMasterRevenue = new Map<string, TopRow>();
//   for (const a of doneLast30) {
//     const id = a.master?.id ?? "none";
//     const name = a.master?.name ?? "Без мастера";
//     const price = a.service?.priceCents ?? 0;
//     const row = byMasterRevenue.get(id) ?? { id, name, cents: 0, count: 0 };
//     row.cents += price;
//     row.count += 1;
//     byMasterRevenue.set(id, row);
//   }
//   const topMasters = [...byMasterRevenue.values()]
//     .sort((x, y) => y.cents - x.cents)
//     .slice(0, 5);

//   // Свободные окна сегодня
//   type Interval = { start: number; end: number };
//   const whByMaster = new Map(
//     whToday.map((w) => [
//       w.masterId,
//       { isClosed: w.isClosed, start: w.startMinutes, end: w.endMinutes },
//     ])
//   );
//   const offsByMaster = new Map<string, Interval[]>();
//   for (const o of offsToday) {
//     const arr = offsByMaster.get(o.masterId) ?? [];
//     arr.push({ start: o.startMinutes, end: o.endMinutes });
//     offsByMaster.set(o.masterId, arr);
//   }
//   const apptsByMaster = new Map<string, Interval[]>();
//   for (const a of apptsWholeDay) {
//     if (!a.masterId) continue;
//     const s = a.startAt.getHours() * 60 + a.startAt.getMinutes();
//     const e = a.endAt.getHours() * 60 + a.endAt.getMinutes();
//     const arr = apptsByMaster.get(a.masterId) ?? [];
//     arr.push({ start: s, end: e });
//     apptsByMaster.set(a.masterId, arr);
//   }

//   function subtractOne(bases: Interval[], block: Interval): Interval[] {
//     const out: Interval[] = [];
//     for (const b of bases) {
//       if (block.end <= b.start || block.start >= b.end) {
//         out.push(b);
//         continue;
//       }
//       if (block.start > b.start)
//         out.push({ start: b.start, end: Math.min(block.start, b.end) });
//       if (block.end < b.end)
//         out.push({ start: Math.max(block.end, b.start), end: b.end });
//     }
//     return out;
//   }

//   function subtractMany(bases: Interval[], blocks: Interval[]): Interval[] {
//     let res = bases.slice();
//     const sorted = blocks.slice().sort((a, b) => a.start - b.start);
//     for (const bl of sorted) res = subtractOne(res, bl);
//     return res
//       .map((i) => ({
//         start: Math.max(0, Math.min(1440, i.start)),
//         end: Math.max(0, Math.min(1440, i.end)),
//       }))
//       .filter((i) => i.end - i.start >= 15);
//   }

//   type FreeCardRow = { id: string; name: string; next?: string; slots: string[] };
//   const nowMin = now.getHours() * 60 + now.getMinutes();
//   const freeRows: FreeCardRow[] = [];

//   for (const m of masters) {
//     const wh = whByMaster.get(m.id);
//     if (!wh || wh.isClosed || wh.start >= wh.end) continue;

//     let intervals: Interval[] = [
//       { start: Math.max(wh.start, 0), end: Math.min(wh.end, 1440) },
//     ];
//     const offs = offsByMaster.get(m.id) ?? [];
//     intervals = subtractMany(intervals, offs);
//     const blocks = apptsByMaster.get(m.id) ?? [];
//     intervals = subtractMany(intervals, blocks);
//     intervals = intervals
//       .map((i) => ({ start: Math.max(i.start, nowMin), end: i.end }))
//       .filter((i) => i.end - i.start >= 15);

//     if (intervals.length === 0) continue;

//     const slots = intervals
//       .slice(0, 3)
//       .map((i) => `${minutesToHHMM(i.start)}–${minutesToHHMM(i.end)}`);

//     freeRows.push({
//       id: m.id,
//       name: m.name,
//       next: minutesToHHMM(intervals[0].start),
//       slots,
//     });
//   }
//   freeRows.sort((a, b) => (a.next ?? "99:99").localeCompare(b.next ?? "99:99"));

//   // Значения по умолчанию для модалки
//   const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
//     2,
//     "0"
//   )}-${String(today.getDate()).padStart(2, "0")}`;
//   const nextHalfHour = (() => {
//     const m = now.getMinutes();
//     const rounded = m < 30 ? 30 : 60;
//     const h = m < 30 ? now.getHours() : now.getHours() + 1;
//     return `${String(h % 24).padStart(2, "0")}:${String(rounded % 60).padStart(
//       2,
//       "0"
//     )}`;
//   })();

//   const masterOpts = masters.map((m) => ({ id: m.id, name: m.name }));
//   const serviceOpts = services.map((s) => ({
//     id: s.id,
//     name: s.parent?.name ? `${s.parent.name} · ${s.name}` : s.name,
//     durationMin: s.durationMin ?? 60,
//     parentName: s.parent?.name ?? null,
//   }));

//   return (
//     <main className="space-y-6 sm:space-y-8">
//       {/* ═══════════════════════════════════════════════════════════════════
//           HERO СЕКЦИЯ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5">
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.violet.500/10),transparent_35%),radial-gradient(ellipse_at_bottom_right,theme(colors.sky.500/10),transparent_35%)]" />
//         <div className="relative p-4 sm:p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="min-w-0">
//             <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold flex items-center gap-2">
//               <span className="truncate">Дашборд администратора</span>
//               <IconGlow tone="violet" className="icon-glow-sm shrink-0">
//                 <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-violet-200" />
//               </IconGlow>
//             </h1>
//             <p className="text-xs sm:text-sm opacity-70 mt-1">
//               Сегодня: {fmtDate(now)} · Лёгкая аналитика, быстрые действия и видимость
//               свободных окон.
//             </p>
//           </div>
//           <div className="shrink-0">
//             <QuickBookingButton
//               masters={masterOpts}
//               services={serviceOpts}
//               defaultDate={todayStr}
//               defaultTime={nextHalfHour}
//               action={createQuickAppointment}
//               hints={freeRows.slice(0, 6)}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════════════════════
//           KPI МЕТРИКИ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section>
//         <h2 className="text-lg sm:text-xl font-semibold mb-4">Статистика</h2>
//         <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//           <KPICard
//             title="Новости"
//             value={articleCount}
//             icon={<Newspaper className="h-5 w-5" />}
//             tone="violet"
//           />
//           <KPICard
//             title="Заявки в ожидании"
//             value={pendingCount}
//             icon={<CalendarDays className="h-5 w-5" />}
//             tone="rose"
//           />
//           <KPICard
//             title="Подтверждённых заявок"
//             value={confirmedCount}
//             icon={<CalendarCheck2 className="h-5 w-5" />}
//             tone="emerald"
//           />
//           <KPICard
//             title="Клиенты"
//             value={clientCount}
//             icon={<Users2 className="h-5 w-5" />}
//             tone="sky"
//           />
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════════════════════
//           БЫСТРЫЕ ССЫЛКИ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section>
//         <h2 className="text-lg sm:text-xl font-semibold mb-4">Быстрые ссылки</h2>
//         <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
//           <LinkCard
//             title="Мастера"
//             description="Мастера, их услуги, фото и рабочие графики."
//             href="/admin/masters"
//             icon={<UserSquare2 className="h-5 w-5" />}
//             color="violet"
//           />
//           <LinkCard
//             title="Календарь"
//             description="График салона, окна и исключения по датам."
//             href="/admin/calendar"
//             icon={<CalendarDays className="h-5 w-5" />}
//             color="sky"
//           />
//           <LinkCard
//             title="Статистика"
//             description="Касса и заявки по периодам, мастерам и услугам."
//             href="/admin/stats"
//             icon={<BarChart3 className="h-5 w-5" />}
//             color="emerald"
//             cta="Смотреть"
//           />
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════════════════════
//           БЛИЖАЙШИЕ ЗАПИСИ + ТОП МАСТЕРА
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="grid gap-4 sm:gap-6 lg:grid-cols-3">
//         {/* Сегодня */}
//         <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
//           <div className="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-r from-sky-500/5">
//             <div className="flex items-center gap-2 min-w-0">
//               <IconGlow tone="sky" className="icon-glow-sm shrink-0">
//                 <Clock className="h-4 w-4 text-sky-200" />
//               </IconGlow>
//               <h3 className="font-medium text-sm sm:text-base truncate">
//                 Сегодня • {fmtDate(today)}
//               </h3>
//             </div>
//           </div>
//           <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
//             {apptsToday.map((a) => (
//               <div
//                 key={a.id}
//                 className="group p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
//               >
//                 <div className="min-w-0">
//                   <div className="text-sm font-medium truncate">
//                     {a.customerName} • {a.service?.name ?? "—"}
//                   </div>
//                   <div className="text-xs opacity-70 truncate">
//                     {a.master?.name ?? "Без мастера"}
//                   </div>
//                 </div>
//                 <div className="shrink-0 text-xs sm:text-sm rounded-full px-2 py-1 bg-muted/40">
//                   {fmtTime(a.startAt)}—{fmtTime(a.endAt)}
//                 </div>
//               </div>
//             ))}
//             {apptsToday.length === 0 && (
//               <div className="p-4 opacity-60 text-sm">Нет записей на сегодня</div>
//             )}
//           </div>
//         </div>

//         {/* Завтра */}
//         <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
//           <div className="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-r from-emerald-500/5">
//             <div className="flex items-center gap-2 min-w-0">
//               <IconGlow tone="emerald" className="icon-glow-sm shrink-0">
//                 <CalendarClock className="h-4 w-4 text-emerald-200" />
//               </IconGlow>
//               <h3 className="font-medium text-sm sm:text-base truncate">
//                 Завтра • {fmtDate(tomorrow)}
//               </h3>
//             </div>
//           </div>
//           <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
//             {apptsTomorrow.map((a) => (
//               <div
//                 key={a.id}
//                 className="group p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
//               >
//                 <div className="min-w-0">
//                   <div className="text-sm font-medium truncate">
//                     {a.customerName} • {a.service?.name ?? "—"}
//                   </div>
//                   <div className="text-xs opacity-70 truncate">
//                     {a.master?.name ?? "Без мастера"}
//                   </div>
//                 </div>
//                 <div className="shrink-0 text-xs sm:text-sm rounded-full px-2 py-1 bg-muted/40">
//                   {fmtTime(a.startAt)}—{fmtTime(a.endAt)}
//                 </div>
//               </div>
//             ))}
//             {apptsTomorrow.length === 0 && (
//               <div className="p-4 opacity-60 text-sm">Нет записей на завтра</div>
//             )}
//           </div>
//         </div>

//         {/* ТОП мастера */}
//         <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
//           <div className="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-r from-amber-500/5">
//             <div className="flex items-center gap-2 min-w-0">
//               <IconGlow tone="amber" className="icon-glow-sm shrink-0">
//                 <Trophy className="h-4 w-4 text-amber-200" />
//               </IconGlow>
//               <h3 className="font-medium text-sm sm:text-base truncate">
//                 Топ-мастера (30 дней)
//               </h3>
//             </div>
//           </div>
//           <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
//             {topMasters.map((m, idx) => (
//               <div
//                 key={m.id}
//                 className="group p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
//               >
//                 <div className="flex items-center gap-2 min-w-0">
//                   <div className="h-8 w-8 rounded-full grid place-items-center bg-muted/40 shrink-0">
//                     {idx === 0 ? (
//                       <Award className="h-4 w-4 text-amber-400" />
//                     ) : (
//                       <TrendingUp className="h-4 w-4 opacity-70" />
//                     )}
//                   </div>
//                   <div className="min-w-0">
//                     <div className="text-sm font-medium truncate">{m.name}</div>
//                     <div className="text-xs opacity-70">заказов: {m.count}</div>
//                   </div>
//                 </div>
//                 <div className="shrink-0 text-xs sm:text-sm rounded-full px-2 py-1 bg-emerald-500/15 text-emerald-400">
//                   {moneyFromCents(m.cents)}
//                 </div>
//               </div>
//             ))}
//             {topMasters.length === 0 && (
//               <div className="p-4 opacity-60 text-sm">Нет выполненных работ</div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════════════════════
//           СВОБОДНЫЕ ОКНА + ЧЕРНОВИКИ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
//         {/* Свободные окна */}
//         <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
//           <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-gradient-to-r from-sky-500/5">
//             <IconGlow tone="sky" className="icon-glow-sm shrink-0">
//               <CalendarRange className="h-4 w-4 text-sky-200" />
//             </IconGlow>
//             <h3 className="font-medium text-sm sm:text-base">Свободные окна сегодня</h3>
//           </div>
//           <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
//             {freeRows.slice(0, 8).map((r) => (
//               <div
//                 key={r.id}
//                 className="p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
//               >
//                 <div className="min-w-0">
//                   <div className="text-sm font-medium truncate">{r.name}</div>
//                   <div className="text-xs opacity-70 flex flex-wrap gap-1 mt-0.5">
//                     {r.slots.map((s, i) => (
//                       <span
//                         key={i}
//                         className={`px-2 py-0.5 rounded-full border text-[11px] ${
//                           i === 0
//                             ? "border-emerald-400/40 text-emerald-400"
//                             : "opacity-80"
//                         }`}
//                         title="Свободный интервал"
//                       >
//                         {s}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//                 {r.next && (
//                   <div className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs">
//                     <CheckCircle2 className="h-3.5 w-3.5" />c {r.next}
//                   </div>
//                 )}
//               </div>
//             ))}
//             {freeRows.length === 0 && (
//               <div className="p-4 opacity-60 text-sm">
//                 Свободных окон нет — день заполнен
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Черновики */}
//         <div className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/10">
//           <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-gradient-to-r from-violet-500/5">
//             <IconGlow tone="violet" className="icon-glow-sm shrink-0">
//               <FileEdit className="h-4 w-4 text-violet-200" />
//             </IconGlow>
//             <h3 className="font-medium text-sm sm:text-base">Черновики новостей/акций</h3>
//           </div>
//           <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
//             {drafts.map((d) => (
//               <div
//                 key={d.id}
//                 className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition"
//               >
//                 <div className="min-w-0">
//                   <div className="text-sm font-medium truncate">{d.title}</div>
//                   <div className="text-xs opacity-60">создано {fmtDate(d.createdAt)}</div>
//                 </div>
//                 <Link
//                   href={`/admin/news/${d.id}`}
//                   className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 
//                            hover:bg-muted/40 transition text-sm shrink-0 w-fit"
//                 >
//                   <Edit3 className="h-4 w-4" /> Редактировать
//                 </Link>
//               </div>
//             ))}
//             {drafts.length === 0 && (
//               <div className="p-4 opacity-60 text-sm">
//                 Черновиков нет — всё опубликовано 🎉
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ПУБЛИКАЦИИ & ДНИ РОЖДЕНИЯ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
//         {/* Публикации */}
//         <div>
//           <div className="flex items-center justify-between mb-3 gap-3">
//             <h2 className="text-base sm:text-lg font-semibold truncate">
//               Последние публикации
//             </h2>
//             <Link
//               href="/admin/news/new"
//               className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm
//                        bg-violet-600 hover:bg-violet-500 transition shrink-0"
//             >
//               <Plus className="h-4 w-4" /> Добавить
//             </Link>
//           </div>
//           <div className="rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
//             {latestArticles.map((a) => {
//               const isDraft = !a.publishedAt;
//               return (
//                 <div
//                   key={a.id}
//                   className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-white/[0.02] transition"
//                 >
//                   <div className="min-w-0">
//                     <div className="font-medium truncate text-sm">{a.title}</div>
//                     <div className="text-xs opacity-60">
//                       {isDraft ? "Черновик" : "Опубликовано"} •{" "}
//                       {fmtDate(a.publishedAt ?? a.createdAt)}
//                     </div>
//                   </div>
//                   <div className="flex gap-2 shrink-0 items-center">
//                     {isDraft && (
//                       <span className="rounded-full px-2 py-1 text-xs bg-amber-500/15 text-amber-400">
//                         DRAFT
//                       </span>
//                     )}
//                     <Link
//                       href={`/admin/news/${a.id}`}
//                       className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 
//                                hover:bg-muted/40 transition text-sm"
//                     >
//                       <Edit3 className="h-4 w-4" /> Редактировать
//                     </Link>
//                   </div>
//                 </div>
//               );
//             })}
//             {latestArticles.length === 0 && (
//               <div className="p-4 opacity-70 text-sm">Пока нет публикаций</div>
//             )}
//           </div>
//         </div>

//         {/* Дни рождения */}
//         <div>
//           <div className="flex items-center justify-between mb-3 gap-3">
//             <h2 className="text-base sm:text-lg font-semibold truncate">
//               Ближайшие именинники (30 дней)
//             </h2>
//             <Link
//               href="/admin/clients?filter=birthdays"
//               className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 
//                        hover:bg-muted/40 transition text-sm shrink-0"
//             >
//               Все <ArrowRight className="h-4 w-4" />
//             </Link>
//           </div>
//           <div className="rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
//             {upcoming.map((c) => (
//               <div
//                 key={c.id}
//                 className="flex items-center justify-between p-3 gap-3 hover:bg-white/[0.02] transition"
//               >
//                 <div className="flex items-center gap-3 min-w-0">
//                   <div className="h-10 w-10 rounded-full grid place-items-center bg-muted/40 shrink-0">
//                     <UserCircle2 className="h-6 w-6 opacity-70" />
//                   </div>
//                   <div className="min-w-0">
//                     <div className="font-medium truncate text-sm">{c.name}</div>
//                     <div className="text-xs opacity-60 flex items-center gap-1">
//                       <Gift className="h-3.5 w-3.5" />
//                       через {c.inDays} дн.
//                     </div>
//                   </div>
//                 </div>
//                 <Link
//                   href={`/admin/clients/${c.id}`}
//                   className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition shrink-0"
//                 >
//                   Открыть <ArrowRight className="h-4 w-4" />
//                 </Link>
//               </div>
//             ))}
//             {upcoming.length === 0 && (
//               <div className="p-4 opacity-70 text-sm">Нет ближайших дней рождения</div>
//             )}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
