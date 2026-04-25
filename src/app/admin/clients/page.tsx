// src/app/admin/clients/page.tsx - FULL FEATURED VERSION 💎
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma, AppointmentStatus } from "@/lib/prisma-client";
import {
  UserPlus,
  Users,
  Cake,
  Search as IconSearch,
  Mail,
  Phone,
  CalendarClock,
  Eye,
  Instagram,
  Facebook,
  Globe,
  UsersRound,
  Sparkles,
  CalendarDays,
  Archive,
  ChevronLeft,
  ChevronRight,
  Crown,
  Filter,
  X,
} from "lucide-react";
import { IconGlow, type GlowTone } from "@/components/admin/IconGlow";
import {
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";

export const dynamic = "force-dynamic";

type SearchParams = SearchParamsPromise;

const CLIENTS_PER_PAGE = 10;
const VIP_THRESHOLD = 5; // 5+ визитов = VIP

type ClientsCopy = {
  title: string;
  subtitle: string;
  archive: string;
  add: string;
  all: string;
  upcomingBirthdays: string;
  vipClients: string;
  filtersSearch: string;
  searchPlaceholder: string;
  byVisits: string;
  allVisits: string;
  noVisits: string;
  newClients: string;
  regularClients: string;
  vipLong: string;
  birthMonth: string;
  allMonths: string;
  onlyVip: string;
  applyFilters: string;
  reset: string;
  found: string;
  page: string;
  of: string;
  vipCount: string;
  notFound: string;
  open: string;
  name: string;
  phone: string;
  birthDate: string;
  source: string;
  visits: string;
  lastVisit: string;
  actions: string;
  noEmail: string;
  noDate: string;
  back: string;
  showMore: string;
  noSource: string;
  friendSource: string;
  jan: string;
  feb: string;
  mar: string;
  apr: string;
  may: string;
  jun: string;
  jul: string;
  aug: string;
  sep: string;
  oct: string;
  nov: string;
  dec: string;
};

const CLIENTS_COPY: Record<SeoLocale, ClientsCopy> = {
  de: {
    title: "Kunden",
    subtitle: "Suche, Filter, Statistik und VIP-Kunden",
    archive: "Archiv",
    add: "Hinzufuegen",
    all: "Alle",
    upcomingBirthdays: "Bevorstehende Geburtstage (30 Tage)",
    vipClients: "VIP Kunden",
    filtersSearch: "Filter und Suche",
    searchPlaceholder: "Suche: Name, Telefon, E-Mail",
    byVisits: "Nach Besuchen",
    allVisits: "Alle",
    noVisits: "Keine Besuche (0)",
    newClients: "Neu (1-3)",
    regularClients: "Stammkunden (4-9)",
    vipLong: "VIP (10+)",
    birthMonth: "Geburtsmonat",
    allMonths: "Alle Monate",
    onlyVip: "Nur VIP",
    applyFilters: "Filter anwenden",
    reset: "Zuruecksetzen",
    found: "Gefunden",
    page: "Seite",
    of: "von",
    vipCount: "VIP Kunden",
    notFound: "Keine Kunden gefunden",
    open: "Oeffnen",
    name: "Name",
    phone: "Telefon",
    birthDate: "Geburtsdatum",
    source: "Quelle",
    visits: "Besuche",
    lastVisit: "Letzter Besuch",
    actions: "Aktionen",
    noEmail: "—",
    noDate: "—",
    back: "Zurueck",
    showMore: "Weiter",
    noSource: "—",
    friendSource: "friends",
    jan: "Januar",
    feb: "Februar",
    mar: "Maerz",
    apr: "April",
    may: "Mai",
    jun: "Juni",
    jul: "Juli",
    aug: "August",
    sep: "September",
    oct: "Oktober",
    nov: "November",
    dec: "Dezember",
  },
  ru: {
    title: "Клиенты",
    subtitle: "Поиск, фильтры, статистика и VIP клиенты",
    archive: "Архив",
    add: "Добавить",
    all: "Все",
    upcomingBirthdays: "Ближайшие ДР (30 дней)",
    vipClients: "VIP клиенты",
    filtersSearch: "Фильтры и поиск",
    searchPlaceholder: "Поиск: имя, телефон, e-mail",
    byVisits: "По визитам",
    allVisits: "Все",
    noVisits: "Без визитов (0)",
    newClients: "Новые (1-3)",
    regularClients: "Постоянные (4-9)",
    vipLong: "VIP (10+)",
    birthMonth: "Месяц ДР",
    allMonths: "Все месяцы",
    onlyVip: "Только VIP",
    applyFilters: "Применить фильтры",
    reset: "Сбросить",
    found: "Найдено",
    page: "Страница",
    of: "из",
    vipCount: "VIP клиентов",
    notFound: "Клиенты не найдены",
    open: "Открыть",
    name: "Имя",
    phone: "Телефон",
    birthDate: "Дата рождения",
    source: "Источник",
    visits: "Визиты",
    lastVisit: "Последний визит",
    actions: "Действия",
    noEmail: "—",
    noDate: "—",
    back: "Назад",
    showMore: "Далее",
    noSource: "—",
    friendSource: "друзья",
    jan: "Январь",
    feb: "Февраль",
    mar: "Март",
    apr: "Апрель",
    may: "Май",
    jun: "Июнь",
    jul: "Июль",
    aug: "Август",
    sep: "Сентябрь",
    oct: "Октябрь",
    nov: "Ноябрь",
    dec: "Декабрь",
  },
  en: {
    title: "Clients",
    subtitle: "Search, filters, stats and VIP clients",
    archive: "Archive",
    add: "Add",
    all: "All",
    upcomingBirthdays: "Upcoming birthdays (30 days)",
    vipClients: "VIP clients",
    filtersSearch: "Filters and search",
    searchPlaceholder: "Search: name, phone, e-mail",
    byVisits: "By visits",
    allVisits: "All",
    noVisits: "No visits (0)",
    newClients: "New (1-3)",
    regularClients: "Regular (4-9)",
    vipLong: "VIP (10+)",
    birthMonth: "Birth month",
    allMonths: "All months",
    onlyVip: "Only VIP",
    applyFilters: "Apply filters",
    reset: "Reset",
    found: "Found",
    page: "Page",
    of: "of",
    vipCount: "VIP clients",
    notFound: "No clients found",
    open: "Open",
    name: "Name",
    phone: "Phone",
    birthDate: "Birth date",
    source: "Source",
    visits: "Visits",
    lastVisit: "Last visit",
    actions: "Actions",
    noEmail: "—",
    noDate: "—",
    back: "Back",
    showMore: "Next",
    noSource: "—",
    friendSource: "friends",
    jan: "January",
    feb: "February",
    mar: "March",
    apr: "April",
    may: "May",
    jun: "June",
    jul: "July",
    aug: "August",
    sep: "September",
    oct: "October",
    nov: "November",
    dec: "December",
  },
};

function localeToIntl(locale: SeoLocale): string {
  if (locale === "ru") return "ru-RU";
  if (locale === "en") return "en-US";
  return "de-DE";
}

function fmtDate(d: Date, intlLocale: string): string {
  return new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function fmtDateTime(d: Date, intlLocale: string): string {
  return new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function nextBirthday(src: Date, from: Date): Date {
  const nb = new Date(from.getFullYear(), src.getMonth(), src.getDate());
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (nb < today) nb.setFullYear(from.getFullYear() + 1);
  return nb;
}

/** Цветной бейдж источника */
function ReferralBadge({
  value,
  t,
}: {
  value: string | null;
  t: ClientsCopy;
}) {
  const v = (value ?? "—").trim().toLowerCase();

  if (v === "instagram") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                       bg-pink-500/10 text-pink-300 border border-pink-400/20">
        <Instagram className="h-3 w-3" />
        <span className="hidden xl:inline">Instagram</span>
      </span>
    );
  }
  if (v === "facebook") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                       bg-blue-500/10 text-blue-300 border border-blue-400/20">
        <Facebook className="h-3 w-3" />
        <span className="hidden xl:inline">Facebook</span>
      </span>
    );
  }
  if (v === "google") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                       bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
        <Globe className="h-3 w-3" />
        <span className="hidden xl:inline">Google</span>
      </span>
    );
  }
  if (v === "friends" || v === "друзья") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                       bg-violet-500/10 text-violet-300 border border-violet-400/20">
        <UsersRound className="h-3 w-3" />
        <span className="hidden xl:inline">{t.friendSource}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                     bg-white/5 text-slate-400 border border-white/10">
      {t.noSource}
    </span>
  );
}

/** VIP Badge */
function VipBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold
                     bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/30
                     shadow-lg shadow-amber-500/20">
      <Crown className="h-3 w-3" />
      <span className="hidden lg:inline">VIP</span>
    </span>
  );
}

export default async function AdminClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = await resolveContentLocale(searchParams);
  const t = CLIENTS_COPY[locale];
  const intlLocale = localeToIntl(locale);
  const sp = await searchParams;
  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const filterRaw = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const visitsRaw = Array.isArray(sp.visits) ? sp.visits[0] : sp.visits;
  const birthMonthRaw = Array.isArray(sp.birthMonth) ? sp.birthMonth[0] : sp.birthMonth;
  const vipRaw = Array.isArray(sp.vip) ? sp.vip[0] : sp.vip;

  const query = (qRaw ?? "").trim();
  const isBirthdayFilter = (filterRaw ?? "") === "birthdays";
  const currentPage = Math.max(1, parseInt(pageRaw ?? "1", 10));
  const visitsFilter = visitsRaw ? parseInt(visitsRaw, 10) : null;
  const birthMonthFilter = birthMonthRaw ? parseInt(birthMonthRaw, 10) : null;
  const isVipFilter = vipRaw === "true";
  const months = [
    t.jan,
    t.feb,
    t.mar,
    t.apr,
    t.may,
    t.jun,
    t.jul,
    t.aug,
    t.sep,
    t.oct,
    t.nov,
    t.dec,
  ];

  // ✅ Базовый фильтр для поиска
  const searchFilter: Prisma.ClientWhereInput | undefined =
    query.length > 0
      ? {
          OR: [
            { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

  // ✅ Комбинируем фильтры: ТОЛЬКО активные клиенты + поиск
  const where: Prisma.ClientWhereInput = {
    deletedAt: null,
    ...searchFilter,
  };

  // ✅ Загружаем только активных клиентов
  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      birthDate: true,
      referral: true,
      createdAt: true,
      _count: {
        select: { 
          appointments: {
            where: {
              deletedAt: null,
            }
          } 
        },
      },
    },
  });

  // ✅ Получаем детальную статистику по визитам
  const ids = clients.map((c) => c.id);
  const countMap = new Map<string, number>();
  const lastVisitMap = new Map<string, Date>();

  if (ids.length > 0) {
    const stats = await prisma.appointment.groupBy({
      by: ["clientId"],
      where: {
        clientId: { in: ids },
        deletedAt: null,
        status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.DONE] },
      },
      _count: { _all: true },
      _max: { startAt: true },
    });

    for (const s of stats) {
      const key = String(s.clientId);
      countMap.set(key, s._count._all);
      if (s._max.startAt) lastVisitMap.set(key, s._max.startAt);
    }
  }

  // ✅ Применяем фильтры
  let filtered = clients;

  // Фильтр по ближайшим ДР
  if (isBirthdayFilter) {
    const today = new Date();
    const horizon = new Date(today);
    horizon.setDate(today.getDate() + 30);
    filtered = filtered.filter((c) => {
      const nb = nextBirthday(c.birthDate, today);
      return nb >= today && nb <= horizon;
    });
  }

  // Фильтр по месяцу рождения
  if (birthMonthFilter !== null && birthMonthFilter >= 1 && birthMonthFilter <= 12) {
    filtered = filtered.filter((c) => c.birthDate.getMonth() + 1 === birthMonthFilter);
  }

  // Фильтр по количеству визитов
  if (visitsFilter !== null) {
    filtered = filtered.filter((c) => {
      const visits = countMap.get(c.id) ?? 0;
      if (visitsFilter === 0) return visits === 0;
      if (visitsFilter === 1) return visits >= 1 && visits <= 3;
      if (visitsFilter === 2) return visits >= 4 && visits <= 9;
      if (visitsFilter === 3) return visits >= 10;
      return true;
    });
  }

  // Фильтр VIP (5+ визитов)
  if (isVipFilter) {
    filtered = filtered.filter((c) => {
      const visits = countMap.get(c.id) ?? 0;
      return visits >= VIP_THRESHOLD;
    });
  }

  // ✅ Пагинация
  const totalClients = filtered.length;
  const totalPages = Math.ceil(totalClients / CLIENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * CLIENTS_PER_PAGE;
  const endIndex = startIndex + CLIENTS_PER_PAGE;
  const paginatedClients = filtered.slice(startIndex, endIndex);

  // ✅ Строим URL для пагинации
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filterRaw) params.set("filter", filterRaw);
    if (visitsRaw) params.set("visits", visitsRaw);
    if (birthMonthRaw) params.set("birthMonth", birthMonthRaw);
    if (vipRaw) params.set("vip", vipRaw);
    params.set("page", page.toString());
    return `/admin/clients?${params.toString()}`;
  };

  // ✅ Активные фильтры
  const hasActiveFilters = query || isBirthdayFilter || visitsFilter !== null || birthMonthFilter !== null || isVipFilter;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO ЗАГОЛОВОК С ГРАДИЕНТОМ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="card-glass card-glass-accent card-glow">
        <div className="gradient-bg-radial" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <IconGlow tone="fuchsia" className="icon-glow-lg">
              <Users className="h-6 w-6 text-fuchsia-200" />
            </IconGlow>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                {t.title}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link
              href="/admin/clients/archived"
              className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
            >
              <Archive className="h-4 w-4" />
              <span>{t.archive}</span>
            </Link>

            <Link
              href="/admin/clients/new"
              className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t.add}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          БЫСТРЫЕ ФИЛЬТРЫ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap gap-2">
        <ChipLink
          active={!isBirthdayFilter && !isVipFilter}
          href="/admin/clients"
          label={t.all}
          icon={<Users className="h-4 w-4" />}
          color="sky"
        />
        <ChipLink
          active={isBirthdayFilter}
          href="/admin/clients?filter=birthdays"
          label={t.upcomingBirthdays}
          icon={<Cake className="h-4 w-4" />}
          color="amber"
        />
        <ChipLink
          active={isVipFilter}
          href="/admin/clients?vip=true"
          label={`${t.vipClients} (${VIP_THRESHOLD}+ ${t.visits.toLowerCase()})`}
          icon={<Crown className="h-4 w-4" />}
          color="amber"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          РАСШИРЕННЫЕ ФИЛЬТРЫ
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="card-glass card-glow">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <IconGlow tone="violet" className="icon-glow-sm">
              <Filter className="h-4 w-4 text-violet-200" />
            </IconGlow>
            <span className="text-white">{t.filtersSearch}</span>
          </div>

          <form action="/admin/clients" method="get" className="space-y-4">
            {/* Сохраняем текущий фильтр */}
            {filterRaw && <input type="hidden" name="filter" value={filterRaw} />}
            
            {/* Поиск по имени/телефону/email */}
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={t.searchPlaceholder}
                className="input-glass w-full pl-10"
              />
            </div>

            {/* Сетка фильтров */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Фильтр по визитам */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">{t.byVisits}</label>
                <select 
                  name="visits" 
                  defaultValue={visitsRaw ?? ""}
                  className="input-glass w-full text-sm"
                >
                  <option value="">{t.allVisits}</option>
                  <option value="0">{t.noVisits}</option>
                  <option value="1">{t.newClients}</option>
                  <option value="2">{t.regularClients}</option>
                  <option value="3">{t.vipLong}</option>
                </select>
              </div>

              {/* Фильтр по месяцу ДР */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">{t.birthMonth}</label>
                <select 
                  name="birthMonth" 
                  defaultValue={birthMonthRaw ?? ""}
                  className="input-glass w-full text-sm"
                >
                  <option value="">{t.allMonths}</option>
                  {months.map((monthLabel, idx) => (
                    <option key={monthLabel} value={idx + 1}>
                      {monthLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* VIP фильтр */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="vip" 
                    value="true"
                    defaultChecked={isVipFilter}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-sm text-slate-300 flex items-center gap-1">
                    <Crown className="h-4 w-4 text-amber-400" />
                    {t.onlyVip}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn-gradient-sky rounded-xl px-6 py-2.5 text-sm hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                {t.applyFilters}
              </button>
              
              {hasActiveFilters && (
                <Link
                  href="/admin/clients"
                  className="btn-glass inline-flex items-center gap-2 text-sm px-4 py-2.5 hover:scale-105 active:scale-95"
                >
                  <X className="h-4 w-4" />
                  {t.reset}
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Статистика */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          {t.found}: <span className="text-white font-medium">{totalClients}</span>
          {totalClients > CLIENTS_PER_PAGE && (
            <>
              {" "}• {t.page} <span className="text-white font-medium">{currentPage}</span> {t.of}{" "}
              <span className="text-white font-medium">{totalPages}</span>
            </>
          )}
        </div>

        {/* VIP счетчик */}
        <div className="text-sm text-slate-400">
          {t.vipCount}: <span className="text-amber-400 font-medium">
            {clients.filter(c => (countMap.get(c.id) ?? 0) >= VIP_THRESHOLD).length}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          МОБИЛЬНЫЕ КАРТОЧКИ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3 md:hidden">
        {paginatedClients.length === 0 ? (
          <div className="card-glass card-glow p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">{t.notFound}</p>
          </div>
        ) : (
          paginatedClients.map((c) => {
            const visits = countMap.get(c.id) ?? 0;
            const last = lastVisitMap.get(c.id);
            const isVip = visits >= VIP_THRESHOLD;

            return (
              <div key={c.id} className="card-glass-hover card-glass-accent card-glow">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <IconGlow tone="fuchsia">
                        <Users className="h-4 w-4 text-fuchsia-400" />
                      </IconGlow>
                      <div className="text-base font-semibold text-white truncate">{c.name}</div>
                      {isVip && <VipBadge />}
                    </div>
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="btn-glass text-xs px-3 py-1.5 inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{t.open}</span>
                    </Link>
                  </div>

                  <div className="space-y-2 text-sm">
                    <InfoLine
                      icon={<Phone className="h-4 w-4 text-emerald-400" />}
                      label={t.phone}
                      value={c.phone}
                      tone="emerald"
                    />
                    
                    {c.email && (
                      <InfoLine
                        icon={<Mail className="h-4 w-4 text-sky-400" />}
                        label="Email"
                        value={c.email}
                        tone="sky"
                      />
                    )}

                    <InfoLine
                      icon={<CalendarDays className="h-4 w-4 text-violet-400" />}
                      label={t.birthDate}
                      value={fmtDate(c.birthDate, intlLocale)}
                      tone="violet"
                    />

                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 mt-0.5">
                        <IconGlow tone="amber">
                          <Sparkles className="h-4 w-4 text-amber-400" />
                        </IconGlow>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-slate-500">{t.source}</div>
                        <div className="mt-1">
                          <ReferralBadge value={c.referral} t={t} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="text-xs text-slate-400">
                      {t.visits}: <span className={`font-semibold ${isVip ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {visits}
                      </span>
                    </div>
                    {last && (
                      <div className="text-xs text-slate-400">
                        {fmtDateTime(last, intlLocale)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP ТАБЛИЦА - ОПТИМИЗИРОВАННАЯ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {paginatedClients.length === 0 ? (
          <div className="card-glass card-glow p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">{t.notFound}</p>
          </div>
        ) : (
          <div className="card-glass-hover card-glow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-3 text-left font-semibold text-slate-300 text-xs">
                      {t.name}
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-slate-300 text-xs">
                      {t.phone}
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-slate-300 text-xs hidden xl:table-cell">
                      E-mail
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-slate-300 text-xs">
                      {t.birthDate}
                    </th>
                    <th className="py-3 px-2 text-center font-semibold text-slate-300 text-xs">
                      {t.source}
                    </th>
                    <th className="py-3 px-2 text-center font-semibold text-slate-300 text-xs">
                      {t.visits}
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-slate-300 text-xs hidden 2xl:table-cell">
                      {t.lastVisit}
                    </th>
                    <th className="py-3 px-2 text-right font-semibold text-slate-300 text-xs">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedClients.map((c) => {
                    const visits = countMap.get(c.id) ?? 0;
                    const last = lastVisitMap.get(c.id) ?? null;
                    const isVip = visits >= VIP_THRESHOLD;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Имя */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <IconGlow tone="fuchsia">
                              <Users className="h-3 w-3 text-fuchsia-400 shrink-0" />
                            </IconGlow>
                            <span className="font-medium text-white text-xs truncate">{c.name}</span>
                            {isVip && <VipBadge />}
                          </div>
                        </td>

                        {/* Телефон */}
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-emerald-400 shrink-0" />
                            <span className="text-slate-200 text-xs whitespace-nowrap">{c.phone}</span>
                          </div>
                        </td>

                        {/* Email - только на xl+ */}
                        <td className="py-2.5 px-2 hidden xl:table-cell">
                          {c.email ? (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Mail className="h-3 w-3 text-sky-400 shrink-0" />
                              <span className="text-slate-200 text-xs truncate max-w-[200px]">{c.email}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">{t.noEmail}</span>
                          )}
                        </td>

                        {/* Дата рождения */}
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3 text-violet-400 shrink-0" />
                            <span className="text-slate-200 text-xs whitespace-nowrap">
                              {fmtDate(c.birthDate, intlLocale)}
                            </span>
                          </div>
                        </td>

                        {/* Как узнали */}
                        <td className="py-2.5 px-2 text-center">
                          <ReferralBadge value={c.referral} t={t} />
                        </td>

                        {/* Визитов */}
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`inline-flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium min-w-[40px]
                                        ${isVip
                                          ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-300 border border-amber-400/30"
                                          : visits > 0
                                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
                                          : "bg-white/5 text-slate-400 border border-white/10"}`}
                          >
                            <span className={`h-1 w-1 rounded-full ${isVip ? "bg-amber-400" : visits > 0 ? "bg-emerald-400" : "bg-slate-400"}`} />
                            {visits}
                          </span>
                        </td>

                        {/* Последний визит - только на 2xl+ */}
                        <td className="py-2.5 px-2 hidden 2xl:table-cell">
                          {last ? (
                            <div className="flex items-center gap-1.5">
                              <CalendarClock className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="text-slate-200 text-xs whitespace-nowrap">
                                {fmtDateTime(last, intlLocale)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">{t.noDate}</span>
                          )}
                        </td>

                        {/* Действия */}
                        <td className="py-2.5 px-2 text-right">
                          <Link
                            href={`/admin/clients/${c.id}`}
                            className="btn-glass text-xs px-2.5 py-1 inline-flex items-center gap-1 hover:scale-105 active:scale-95 whitespace-nowrap"
                          >
                            <Eye className="h-3 w-3 text-sky-300" />
                            <span className="hidden lg:inline">{t.open}</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ПАГИНАЦИЯ
      ═══════════════════════════════════════════════════════════════════ */}
      {totalPages > 1 && (
        <div className="card-glass card-glow">
          <div className="p-4 flex items-center justify-between gap-4">
            <Link
              href={buildPageUrl(Math.max(1, currentPage - 1))}
              className={`btn-glass inline-flex items-center gap-2 text-sm px-4 py-2 
                         ${currentPage === 1 ? 'opacity-50 pointer-events-none' : 'hover:scale-105 active:scale-95'}`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t.back}</span>
            </Link>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum)}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-all
                               ${pageNum === currentPage
                                 ? 'bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-white border border-sky-500/30'
                                 : 'btn-glass hover:scale-105'}`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            <Link
              href={buildPageUrl(Math.min(totalPages, currentPage + 1))}
              className={`btn-glass inline-flex items-center gap-2 text-sm px-4 py-2
                         ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : 'hover:scale-105 active:scale-95'}`}
            >
              <span className="hidden sm:inline">{t.showMore}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function InfoLine({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: GlowTone;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="shrink-0 mt-0.5">
        <IconGlow tone={tone}>
          {icon}
        </IconGlow>
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm text-white break-words">{value}</div>
      </div>
    </div>
  );
}

function ChipLink({
  active,
  href,
  label,
  icon,
  color,
}: {
  active: boolean;
  href: string;
  label: string;
  icon: React.ReactNode;
  color: GlowTone;
}) {
  const baseClass = "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300";
  
  if (active) {
    return (
      <Link
        href={href}
        className={`${baseClass} btn-gradient-${color} shadow-lg`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClass} btn-glass hover:scale-105 active:scale-95`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}






//----------добавляю умные фильтры и VIP клиентов------------
// // src/app/admin/clients/page.tsx - DESKTOP OPTIMIZED VERSION 💎
// import Link from "next/link";
// import { prisma } from "@/lib/prisma";
// import { Prisma, AppointmentStatus } from "@prisma/client";
// import {
//   UserPlus,
//   Users,
//   Cake,
//   Search as IconSearch,
//   Mail,
//   Phone,
//   CalendarClock,
//   Eye,
//   Instagram,
//   Facebook,
//   Globe,
//   UsersRound,
//   Sparkles,
//   CalendarDays,
//   Archive,
// } from "lucide-react";
// import { IconGlow, type GlowTone } from "@/components/admin/IconGlow";

// export const dynamic = "force-dynamic";

// type SearchParams = Promise<{ q?: string | string[]; filter?: string | string[] }>;

// function fmtDate(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// function nextBirthday(src: Date, from: Date): Date {
//   const nb = new Date(from.getFullYear(), src.getMonth(), src.getDate());
//   const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
//   if (nb < today) nb.setFullYear(from.getFullYear() + 1);
//   return nb;
// }

// /** Цветной бейдж «Как узнали» */
// function ReferralBadge({ value }: { value: string | null }) {
//   const v = (value ?? "—").trim().toLowerCase();

//   if (v === "instagram") {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
//                        bg-pink-500/10 text-pink-300 border border-pink-400/20">
//         <Instagram className="h-3 w-3" />
//         <span className="hidden xl:inline">Instagram</span>
//       </span>
//     );
//   }
//   if (v === "facebook") {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
//                        bg-blue-500/10 text-blue-300 border border-blue-400/20">
//         <Facebook className="h-3 w-3" />
//         <span className="hidden xl:inline">Facebook</span>
//       </span>
//     );
//   }
//   if (v === "google") {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
//                        bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
//         <Globe className="h-3 w-3" />
//         <span className="hidden xl:inline">Google</span>
//       </span>
//     );
//   }
//   if (v === "friends" || v === "друзья") {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
//                        bg-violet-500/10 text-violet-300 border border-violet-400/20">
//         <UsersRound className="h-3 w-3" />
//         <span className="hidden xl:inline">Friends</span>
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
//                      bg-white/5 text-slate-400 border border-white/10">
//       —
//     </span>
//   );
// }

// export default async function AdminClientsPage({ searchParams }: { searchParams: SearchParams }) {
//   const sp = await searchParams;
//   const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
//   const filterRaw = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
//   const query = (qRaw ?? "").trim();
//   const isBirthdayFilter = (filterRaw ?? "") === "birthdays";

//   // ✅ Базовый фильтр для поиска
//   const searchFilter: Prisma.ClientWhereInput | undefined =
//     query.length > 0
//       ? {
//           OR: [
//             { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { phone: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
//           ],
//         }
//       : undefined;

//   // ✅ Комбинируем фильтры: ТОЛЬКО активные клиенты + поиск
//   const where: Prisma.ClientWhereInput = {
//     deletedAt: null,
//     ...searchFilter,
//   };

//   // ✅ Загружаем только активных клиентов
//   const clients = await prisma.client.findMany({
//     where,
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       name: true,
//       phone: true,
//       email: true,
//       birthDate: true,
//       referral: true,
//       createdAt: true,
//       _count: {
//         select: { 
//           appointments: {
//             where: {
//               deletedAt: null,
//             }
//           } 
//         },
//       },
//     },
//   });

//   const filtered = (() => {
//     if (!isBirthdayFilter) return clients;
//     const today = new Date();
//     const horizon = new Date(today);
//     horizon.setDate(today.getDate() + 30);
//     return clients.filter((c) => {
//       const nb = nextBirthday(c.birthDate, today);
//       return nb >= today && nb <= horizon;
//     });
//   })();

//   const ids = filtered.map((c) => c.id);
//   const countMap = new Map<string, number>();
//   const lastVisitMap = new Map<string, Date>();

//   if (ids.length > 0) {
//     const stats = await prisma.appointment.groupBy({
//       by: ["clientId"],
//       where: {
//         clientId: { in: ids },
//         deletedAt: null,
//         status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.DONE] },
//       },
//       _count: { _all: true },
//       _max: { startAt: true },
//     });

//     for (const s of stats) {
//       const key = String(s.clientId);
//       countMap.set(key, s._count._all);
//       if (s._max.startAt) lastVisitMap.set(key, s._max.startAt);
//     }
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* ═══════════════════════════════════════════════════════════════════
//           HERO ЗАГОЛОВОК С ГРАДИЕНТОМ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="card-glass card-glass-accent card-glow">
//         <div className="gradient-bg-radial" />

//         <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
//           <div className="flex items-center gap-3">
//             <IconGlow tone="fuchsia" className="icon-glow-lg">
//               <Users className="h-6 w-6 text-fuchsia-200" />
//             </IconGlow>
//             <div>
//               <h1 className="text-xl sm:text-2xl font-semibold text-white">
//                 Клиенты
//               </h1>
//               <p className="text-sm text-slate-400 mt-0.5">
//                 Поиск, ближайшие ДР и история визитов
//               </p>
//             </div>
//           </div>
          
//           <div className="flex gap-2">
//             <Link
//               href="/admin/clients/archived"
//               className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
//             >
//               <Archive className="h-4 w-4" />
//               <span>Архив</span>
//             </Link>

//             <Link
//               href="/admin/clients/new"
//               className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
//             >
//               <UserPlus className="h-4 w-4" />
//               <span>Добавить</span>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           БЫСТРЫЕ ФИЛЬТРЫ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="flex flex-wrap gap-2">
//         <ChipLink
//           active={!isBirthdayFilter}
//           href="/admin/clients"
//           label="Все"
//           icon={<Users className="h-4 w-4" />}
//           color="sky"
//         />
//         <ChipLink
//           active={isBirthdayFilter}
//           href="/admin/clients?filter=birthdays"
//           label="Ближайшие ДР (30 дней)"
//           icon={<Cake className="h-4 w-4" />}
//           color="amber"
//         />
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ПОИСК
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="card-glass card-glow">
//         <div className="p-4 sm:p-6 space-y-4">
//           <div className="flex items-center gap-2 text-sm font-medium">
//             <IconGlow tone="sky" className="icon-glow-sm">
//               <IconSearch className="h-4 w-4 text-sky-200" />
//             </IconGlow>
//             <span className="text-white">Поиск клиентов</span>
//           </div>

//           <form action="/admin/clients" method="get" className="flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1">
//               <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 name="q"
//                 defaultValue={query}
//                 placeholder="Поиск: имя, телефон, e-mail"
//                 className="input-glass w-full pl-10"
//               />
//             </div>
//             {isBirthdayFilter && <input type="hidden" name="filter" value="birthdays" />}
//             <button
//               type="submit"
//               className="btn-gradient-sky rounded-xl px-6 py-2.5 text-sm hover:scale-105 active:scale-95 whitespace-nowrap"
//             >
//               Искать
//             </button>
//           </form>
//         </div>
//       </section>

//       <div className="text-sm text-slate-400">
//         Найдено: <span className="text-white font-medium">{filtered.length}</span>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           МОБИЛЬНЫЕ КАРТОЧКИ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="space-y-3 md:hidden">
//         {filtered.length === 0 ? (
//           <div className="card-glass card-glow p-8 text-center">
//             <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
//             <p className="text-sm text-slate-400">Клиенты не найдены</p>
//           </div>
//         ) : (
//           filtered.map((c) => {
//             const visits = countMap.get(c.id) ?? 0;
//             const last = lastVisitMap.get(c.id);

//             return (
//               <div key={c.id} className="card-glass-hover card-glass-accent card-glow">
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-center justify-between gap-3">
//                     <div className="flex items-center gap-2">
//                       <IconGlow tone="fuchsia">
//                         <Users className="h-4 w-4 text-fuchsia-400" />
//                       </IconGlow>
//                       <div className="text-base font-semibold text-white">{c.name}</div>
//                     </div>
//                     <Link
//                       href={`/admin/clients/${c.id}`}
//                       className="btn-glass text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
//                     >
//                       <Eye className="h-3.5 w-3.5" />
//                       <span>Открыть</span>
//                     </Link>
//                   </div>

//                   <div className="space-y-2 text-sm">
//                     <InfoLine
//                       icon={<Phone className="h-4 w-4 text-emerald-400" />}
//                       label="Телефон"
//                       value={c.phone}
//                       tone="emerald"
//                     />
                    
//                     {c.email && (
//                       <InfoLine
//                         icon={<Mail className="h-4 w-4 text-sky-400" />}
//                         label="Email"
//                         value={c.email}
//                         tone="sky"
//                       />
//                     )}

//                     <InfoLine
//                       icon={<CalendarDays className="h-4 w-4 text-violet-400" />}
//                       label="Дата рождения"
//                       value={fmtDate(c.birthDate)}
//                       tone="violet"
//                     />

//                     <div className="flex items-start gap-2.5">
//                       <span className="shrink-0 mt-0.5">
//                         <IconGlow tone="amber">
//                           <Sparkles className="h-4 w-4 text-amber-400" />
//                         </IconGlow>
//                       </span>
//                       <div className="min-w-0 flex-1">
//                         <div className="text-xs text-slate-500">Как узнали</div>
//                         <div className="mt-1">
//                           <ReferralBadge value={c.referral} />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between pt-3 border-t border-white/10">
//                     <div className="text-xs text-slate-400">
//                       Визитов: <span className="text-emerald-400 font-semibold">{visits}</span>
//                     </div>
//                     {last && (
//                       <div className="text-xs text-slate-400">
//                         {fmtDateTime(last)}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           DESKTOP ТАБЛИЦА - ОПТИМИЗИРОВАННАЯ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="hidden md:block">
//         {filtered.length === 0 ? (
//           <div className="card-glass card-glow p-8 text-center">
//             <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
//             <p className="text-sm text-slate-400">Клиенты не найдены</p>
//           </div>
//         ) : (
//           <div className="card-glass-hover card-glow overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-full">
//                 <thead>
//                   <tr className="border-b border-white/10">
//                     {/* Имя - остается */}
//                     <th className="py-3 px-3 text-left font-semibold text-slate-300 text-xs">
//                       Имя
//                     </th>
//                     {/* Телефон - компактно */}
//                     <th className="py-3 px-2 text-left font-semibold text-slate-300 text-xs">
//                       Телефон
//                     </th>
//                     {/* Email - только на больших экранах */}
//                     <th className="py-3 px-2 text-left font-semibold text-slate-300 text-xs hidden xl:table-cell">
//                       E-mail
//                     </th>
//                     {/* Дата рождения - компактно */}
//                     <th className="py-3 px-2 text-left font-semibold text-slate-300 text-xs">
//                       ДР
//                     </th>
//                     {/* Как узнали - компактно */}
//                     <th className="py-3 px-2 text-center font-semibold text-slate-300 text-xs">
//                       Источник
//                     </th>
//                     {/* Визитов - компактно */}
//                     <th className="py-3 px-2 text-center font-semibold text-slate-300 text-xs">
//                       Визиты
//                     </th>
//                     {/* Последний визит - только на очень больших экранах */}
//                     <th className="py-3 px-2 text-left font-semibold text-slate-300 text-xs hidden 2xl:table-cell">
//                       Последний визит
//                     </th>
//                     {/* Действия - компактно */}
//                     <th className="py-3 px-2 text-right font-semibold text-slate-300 text-xs">
                      
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/5">
//                   {filtered.map((c) => {
//                     const visits = countMap.get(c.id) ?? 0;
//                     const last = lastVisitMap.get(c.id) ?? null;

//                     return (
//                       <tr
//                         key={c.id}
//                         className="hover:bg-white/[0.02] transition-colors"
//                       >
//                         {/* Имя */}
//                         <td className="py-2.5 px-3">
//                           <div className="flex items-center gap-2 min-w-0">
//                             <IconGlow tone="fuchsia">
//                               <Users className="h-3 w-3 text-fuchsia-400 shrink-0" />
//                             </IconGlow>
//                             <span className="font-medium text-white text-xs truncate">{c.name}</span>
//                           </div>
//                         </td>

//                         {/* Телефон */}
//                         <td className="py-2.5 px-2">
//                           <div className="flex items-center gap-1.5">
//                             <Phone className="h-3 w-3 text-emerald-400 shrink-0" />
//                             <span className="text-slate-200 text-xs whitespace-nowrap">{c.phone}</span>
//                           </div>
//                         </td>

//                         {/* Email - только на xl+ */}
//                         <td className="py-2.5 px-2 hidden xl:table-cell">
//                           {c.email ? (
//                             <div className="flex items-center gap-1.5 min-w-0">
//                               <Mail className="h-3 w-3 text-sky-400 shrink-0" />
//                               <span className="text-slate-200 text-xs truncate max-w-[200px]">{c.email}</span>
//                             </div>
//                           ) : (
//                             <span className="text-slate-500 text-xs">—</span>
//                           )}
//                         </td>

//                         {/* Дата рождения */}
//                         <td className="py-2.5 px-2">
//                           <div className="flex items-center gap-1.5">
//                             <CalendarDays className="h-3 w-3 text-violet-400 shrink-0" />
//                             <span className="text-slate-200 text-xs whitespace-nowrap">
//                               {fmtDate(c.birthDate)}
//                             </span>
//                           </div>
//                         </td>

//                         {/* Как узнали */}
//                         <td className="py-2.5 px-2 text-center">
//                           <ReferralBadge value={c.referral} />
//                         </td>

//                         {/* Визитов */}
//                         <td className="py-2.5 px-2 text-center">
//                           <span
//                             className={`inline-flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium min-w-[40px]
//                                         ${visits > 0
//                                           ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
//                                           : "bg-white/5 text-slate-400 border border-white/10"}`}
//                           >
//                             <span className={`h-1 w-1 rounded-full ${visits > 0 ? "bg-emerald-400" : "bg-slate-400"}`} />
//                             {visits}
//                           </span>
//                         </td>

//                         {/* Последний визит - только на 2xl+ */}
//                         <td className="py-2.5 px-2 hidden 2xl:table-cell">
//                           {last ? (
//                             <div className="flex items-center gap-1.5">
//                               <CalendarClock className="h-3 w-3 text-slate-400 shrink-0" />
//                               <span className="text-slate-200 text-xs whitespace-nowrap">
//                                 {fmtDateTime(last)}
//                               </span>
//                             </div>
//                           ) : (
//                             <span className="text-slate-500 text-xs">—</span>
//                           )}
//                         </td>

//                         {/* Действия */}
//                         <td className="py-2.5 px-2 text-right">
//                           <Link
//                             href={`/admin/clients/${c.id}`}
//                             className="btn-glass text-xs px-2.5 py-1 inline-flex items-center gap-1 hover:scale-105 active:scale-95 whitespace-nowrap"
//                           >
//                             <Eye className="h-3 w-3 text-sky-300" />
//                             <span className="hidden lg:inline">Просмотр</span>
//                           </Link>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════ */

// function InfoLine({
//   icon,
//   label,
//   value,
//   tone,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
//   tone?: GlowTone;
// }) {
//   return (
//     <div className="flex items-start gap-2.5">
//       <span className="shrink-0 mt-0.5">
//         <IconGlow tone={tone}>
//           {icon}
//         </IconGlow>
//       </span>
//       <div className="min-w-0 flex-1">
//         <div className="text-xs text-slate-500">{label}</div>
//         <div className="text-sm text-white break-words">{value}</div>
//       </div>
//     </div>
//   );
// }

// function ChipLink({
//   active,
//   href,
//   label,
//   icon,
//   color,
// }: {
//   active: boolean;
//   href: string;
//   label: string;
//   icon: React.ReactNode;
//   color: GlowTone;
// }) {
//   const baseClass = "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300";
  
//   if (active) {
//     return (
//       <Link
//         href={href}
//         className={`${baseClass} btn-gradient-${color} shadow-lg`}
//       >
//         {icon}
//         <span>{label}</span>
//       </Link>
//     );
//   }

//   return (
//     <Link
//       href={href}
//       className={`${baseClass} btn-glass hover:scale-105 active:scale-95`}
//     >
//       {icon}
//       <span>{label}</span>
//     </Link>
//   );
// }







//---------работало до 17.01.26 делаю адаптацию под десктоп
// // src/app/admin/clients/page.tsx - PREMIUM VERSION 💎
// import Link from "next/link";
// import { prisma } from "@/lib/prisma";
// import { Prisma, AppointmentStatus } from "@prisma/client";
// import {
//   UserPlus,
//   Users,
//   Cake,
//   Search as IconSearch,
//   Mail,
//   Phone,
//   CalendarClock,
//   Eye,
//   Instagram,
//   Facebook,
//   Globe,
//   UsersRound,
//   Sparkles,
//   CalendarDays,
//   Archive,
// } from "lucide-react";
// import { IconGlow, type GlowTone } from "@/components/admin/IconGlow";

// export const dynamic = "force-dynamic";

// type SearchParams = Promise<{ q?: string | string[]; filter?: string | string[] }>;

// function fmtDate(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// function nextBirthday(src: Date, from: Date): Date {
//   const nb = new Date(from.getFullYear(), src.getMonth(), src.getDate());
//   const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
//   if (nb < today) nb.setFullYear(from.getFullYear() + 1);
//   return nb;
// }

// /** Цветной бейдж «Как узнали» */
// function ReferralBadge({ value }: { value: string | null }) {
//   const v = (value ?? "—").trim().toLowerCase();

//   if (v === "instagram") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                        bg-pink-500/10 text-pink-300 border border-pink-400/20">
//         <Instagram className="h-3.5 w-3.5" />
//         Instagram
//       </span>
//     );
//   }
//   if (v === "facebook") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                        bg-blue-500/10 text-blue-300 border border-blue-400/20">
//         <Facebook className="h-3.5 w-3.5" />
//         Facebook
//       </span>
//     );
//   }
//   if (v === "google") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                        bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
//         <Globe className="h-3.5 w-3.5" />
//         Google
//       </span>
//     );
//   }
//   if (v === "friends" || v === "друзья") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                        bg-violet-500/10 text-violet-300 border border-violet-400/20">
//         <UsersRound className="h-3.5 w-3.5" />
//         Friends
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                      bg-white/5 text-slate-400 border border-white/10">
//       —
//     </span>
//   );
// }

// export default async function AdminClientsPage({ searchParams }: { searchParams: SearchParams }) {
//   const sp = await searchParams;
//   const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
//   const filterRaw = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
//   const query = (qRaw ?? "").trim();
//   const isBirthdayFilter = (filterRaw ?? "") === "birthdays";

//   // ✅ Базовый фильтр для поиска
//   const searchFilter: Prisma.ClientWhereInput | undefined =
//     query.length > 0
//       ? {
//           OR: [
//             { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { phone: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
//           ],
//         }
//       : undefined;

//   // ✅ Комбинируем фильтры: ТОЛЬКО активные клиенты + поиск
//   const where: Prisma.ClientWhereInput = {
//     deletedAt: null,  // ← ВАЖНО! Только активные клиенты
//     ...searchFilter,
//   };

//   // ✅ Загружаем только активных клиентов
//   const clients = await prisma.client.findMany({
//     where,
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       name: true,
//       phone: true,
//       email: true,
//       birthDate: true,
//       referral: true,
//       createdAt: true,
//       _count: {
//         select: { 
//           appointments: {
//             where: {
//               deletedAt: null,  // ← Считаем только активные заявки
//             }
//           } 
//         },
//       },
//     },
//   });

//   const filtered = (() => {
//     if (!isBirthdayFilter) return clients;
//     const today = new Date();
//     const horizon = new Date(today);
//     horizon.setDate(today.getDate() + 30);
//     return clients.filter((c) => {
//       const nb = nextBirthday(c.birthDate, today);
//       return nb >= today && nb <= horizon;
//     });
//   })();

//   const ids = filtered.map((c) => c.id);
//   const countMap = new Map<string, number>();
//   const lastVisitMap = new Map<string, Date>();

//   if (ids.length > 0) {
//     const stats = await prisma.appointment.groupBy({
//       by: ["clientId"],
//       where: {
//         clientId: { in: ids },
//         deletedAt: null,  // ← Только активные заявки
//         status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.DONE] },
//       },
//       _count: { _all: true },
//       _max: { startAt: true },
//     });

//     for (const s of stats) {
//       const key = String(s.clientId);
//       countMap.set(key, s._count._all);
//       if (s._max.startAt) lastVisitMap.set(key, s._max.startAt);
//     }
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* ═══════════════════════════════════════════════════════════════════
//           HERO ЗАГОЛОВОК С ГРАДИЕНТОМ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="card-glass card-glass-accent card-glow">
//         <div className="gradient-bg-radial" />

//         <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
//           <div className="flex items-center gap-3">
//             <IconGlow tone="fuchsia" className="icon-glow-lg">
//               <Users className="h-6 w-6 text-fuchsia-200" />
//             </IconGlow>
//             <div>
//               <h1 className="text-xl sm:text-2xl font-semibold text-white">
//                 Клиенты
//               </h1>
//               <p className="text-sm text-slate-400 mt-0.5">
//                 Поиск, ближайшие ДР и история визитов
//               </p>
//             </div>
//           </div>
          
//           <div className="flex gap-2">
//             {/* ✅ Кнопка Архив */}
//             <Link
//               href="/admin/clients/archived"
//               className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
//             >
//               <Archive className="h-4 w-4" />
//               <span>Архив</span>
//             </Link>

//             <Link
//               href="/admin/clients/new"
//               className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
//             >
//               <UserPlus className="h-4 w-4" />
//               <span>Добавить</span>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           БЫСТРЫЕ ФИЛЬТРЫ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="flex flex-wrap gap-2">
//         <ChipLink
//           active={!isBirthdayFilter}
//           href="/admin/clients"
//           label="Все"
//           icon={<Users className="h-4 w-4" />}
//           color="sky"
//         />
//         <ChipLink
//           active={isBirthdayFilter}
//           href="/admin/clients?filter=birthdays"
//           label="Ближайшие ДР (30 дней)"
//           icon={<Cake className="h-4 w-4" />}
//           color="amber"
//         />
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ПОИСК
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="card-glass card-glow">
//         <div className="p-4 sm:p-6 space-y-4">
//           <div className="flex items-center gap-2 text-sm font-medium">
//             <IconGlow tone="sky" className="icon-glow-sm">
//               <IconSearch className="h-4 w-4 text-sky-200" />
//             </IconGlow>
//             <span className="text-white">Поиск клиентов</span>
//           </div>

//           <form action="/admin/clients" method="get" className="flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1">
//               <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 name="q"
//                 defaultValue={query}
//                 placeholder="Поиск: имя, телефон, e-mail"
//                 className="input-glass w-full pl-10"
//               />
//             </div>
//             {isBirthdayFilter && <input type="hidden" name="filter" value="birthdays" />}
//             <button
//               type="submit"
//               className="btn-gradient-sky rounded-xl px-6 py-2.5 text-sm hover:scale-105 active:scale-95 whitespace-nowrap"
//             >
//               Искать
//             </button>
//           </form>
//         </div>
//       </section>

//       <div className="text-sm text-slate-400">
//         Найдено: <span className="text-white font-medium">{filtered.length}</span>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           МОБИЛЬНЫЕ КАРТОЧКИ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="space-y-3 md:hidden">
//         {filtered.length === 0 ? (
//           <div className="card-glass card-glow p-8 text-center">
//             <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
//             <p className="text-sm text-slate-400">Клиенты не найдены</p>
//           </div>
//         ) : (
//           filtered.map((c) => {
//             const visits = countMap.get(c.id) ?? 0;
//             const last = lastVisitMap.get(c.id);

//             return (
//               <div key={c.id} className="card-glass-hover card-glass-accent card-glow">
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-center justify-between gap-3">
//                     <div className="flex items-center gap-2">
//                       <IconGlow tone="fuchsia">
//                         <Users className="h-4 w-4 text-fuchsia-400" />
//                       </IconGlow>
//                       <div className="text-base font-semibold text-white">{c.name}</div>
//                     </div>
//                     <Link
//                       href={`/admin/clients/${c.id}`}
//                       className="btn-glass text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
//                     >
//                       <Eye className="h-3.5 w-3.5" />
//                       <span>Открыть</span>
//                     </Link>
//                   </div>

//                   <div className="space-y-2 text-sm">
//                     <InfoLine
//                       icon={<Phone className="h-4 w-4 text-emerald-400" />}
//                       label="Телефон"
//                       value={c.phone}
//                       tone="emerald"
//                     />
                    
//                     {c.email && (
//                       <InfoLine
//                         icon={<Mail className="h-4 w-4 text-sky-400" />}
//                         label="Email"
//                         value={c.email}
//                         tone="sky"
//                       />
//                     )}

//                     <InfoLine
//                       icon={<CalendarDays className="h-4 w-4 text-violet-400" />}
//                       label="Дата рождения"
//                       value={fmtDate(c.birthDate)}
//                       tone="violet"
//                     />

//                     <div className="flex items-start gap-2.5">
//                       <span className="shrink-0 mt-0.5">
//                         <IconGlow tone="amber">
//                           <Sparkles className="h-4 w-4 text-amber-400" />
//                         </IconGlow>
//                       </span>
//                       <div className="min-w-0 flex-1">
//                         <div className="text-xs text-slate-500">Как узнали</div>
//                         <div className="mt-1">
//                           <ReferralBadge value={c.referral} />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between pt-3 border-t border-white/10">
//                     <div className="text-xs text-slate-400">
//                       Визитов: <span className="text-emerald-400 font-semibold">{visits}</span>
//                     </div>
//                     {last && (
//                       <div className="text-xs text-slate-400">
//                         {fmtDateTime(last)}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           DESKTOP ТАБЛИЦА
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="hidden md:block">
//         {filtered.length === 0 ? (
//           <div className="card-glass card-glow p-8 text-center">
//             <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
//             <p className="text-sm text-slate-400">Клиенты не найдены</p>
//           </div>
//         ) : (
//           <div className="card-glass-hover card-glow overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-white/10">
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">Имя</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">Телефон</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">E-mail</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm whitespace-nowrap">Дата рождения</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm whitespace-nowrap">Как узнали</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">Визитов</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm whitespace-nowrap">Последний визит</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">Действия</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/5">
//                   {filtered.map((c) => {
//                     const visits = countMap.get(c.id) ?? 0;
//                     const last = lastVisitMap.get(c.id) ?? null;

//                     return (
//                       <tr
//                         key={c.id}
//                         className="hover:bg-white/[0.02] transition-colors"
//                       >
//                         <td className="py-3 px-4">
//                           <div className="flex items-center gap-2">
//                             <IconGlow tone="fuchsia">
//                               <Users className="h-3.5 w-3.5 text-fuchsia-400" />
//                             </IconGlow>
//                             <span className="font-medium text-white text-sm">{c.name}</span>
//                           </div>
//                         </td>

//                         <td className="py-3 px-4">
//                           <div className="flex items-center gap-2">
//                             <Phone className="h-3.5 w-3.5 text-emerald-400" />
//                             <span className="text-slate-200 text-sm">{c.phone}</span>
//                           </div>
//                         </td>

//                         <td className="py-3 px-4">
//                           {c.email ? (
//                             <div className="flex items-center gap-2">
//                               <Mail className="h-3.5 w-3.5 text-sky-400" />
//                               <span className="text-slate-200 text-sm">{c.email}</span>
//                             </div>
//                           ) : (
//                             <span className="text-slate-500 text-sm">—</span>
//                           )}
//                         </td>

//                         <td className="py-3 px-4">
//                           <div className="flex items-center gap-2">
//                             <CalendarDays className="h-3.5 w-3.5 text-violet-400" />
//                             <span className="text-slate-200 text-sm whitespace-nowrap">{fmtDate(c.birthDate)}</span>
//                           </div>
//                         </td>

//                         <td className="py-3 px-4">
//                           <ReferralBadge value={c.referral} />
//                         </td>

//                         <td className="py-3 px-4">
//                           <span
//                             className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                                         ${visits > 0
//                                           ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
//                                           : "bg-white/5 text-slate-400 border border-white/10"}`}
//                           >
//                             <span className={`h-1.5 w-1.5 rounded-full ${visits > 0 ? "bg-emerald-400" : "bg-slate-400"}`} />
//                             {visits}
//                           </span>
//                         </td>

//                         <td className="py-3 px-4 whitespace-nowrap">
//                           {last ? (
//                             <div className="flex items-center gap-2">
//                               <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
//                               <span className="text-slate-200 text-sm">{fmtDateTime(last)}</span>
//                             </div>
//                           ) : (
//                             <span className="text-slate-500 text-sm">—</span>
//                           )}
//                         </td>

//                         <td className="py-3 px-4">
//                           <Link
//                             href={`/admin/clients/${c.id}`}
//                             className="btn-glass text-xs px-3 py-1.5 inline-flex items-center gap-1.5 hover:scale-105 active:scale-95"
//                           >
//                             <Eye className="h-3.5 w-3.5 text-sky-300" />
//                             <span>Просмотр</span>
//                           </Link>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════ */

// function InfoLine({
//   icon,
//   label,
//   value,
//   tone,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: React.ReactNode;
//   tone?: GlowTone;
// }) {
//   return (
//     <div className="flex items-start gap-2.5">
//       <span className="shrink-0 mt-0.5">
//         {tone ? <IconGlow tone={tone}>{icon}</IconGlow> : icon}
//       </span>
//       <div className="min-w-0 flex-1">
//         <div className="text-xs text-slate-500">{label}</div>
//         <div className="text-slate-200 break-words">{value}</div>
//       </div>
//     </div>
//   );
// }

// function ChipLink({
//   href,
//   label,
//   icon,
//   active,
//   color,
// }: {
//   href: string;
//   label: string;
//   icon: React.ReactNode;
//   active?: boolean;
//   color: 'sky' | 'amber';
// }) {
//   const pal = {
//     sky: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/50' },
//     amber: {
//       bg: 'bg-amber-500/15',
//       text: 'text-amber-300',
//       border: 'border-amber-500/50',
//     },
//   }[color];

//   return (
//     <Link
//       href={href}
//       className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
//                  border transition-all hover:scale-105 active:scale-95 ${
//                    active
//                      ? `${pal.bg} ${pal.text} ${pal.border}`
//                      : 'border-white/10 text-slate-400 hover:bg-white/5'
//                  }`}
//     >
//       {icon}
//       {label}
//     </Link>
//   );
// }




//----------работало до 11.01.26 добавляем кнопку удаления клиента----------
// // src/app/admin/clients/page.tsx - PREMIUM VERSION 💎
// import Link from "next/link";
// import { prisma } from "@/lib/prisma";
// import { Prisma, AppointmentStatus } from "@prisma/client";
// import {
//   UserPlus,
//   Users,
//   Cake,
//   Search as IconSearch,
//   Mail,
//   Phone,
//   CalendarClock,
//   Eye,
//   Instagram,
//   Facebook,
//   Globe,
//   UsersRound,
//   Sparkles,
//   CalendarDays,
// } from "lucide-react";
// import { IconGlow, type GlowTone } from "@/components/admin/IconGlow";

// export const dynamic = "force-dynamic";

// type SearchParams = Promise<{ q?: string | string[]; filter?: string | string[] }>;

// function fmtDate(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// function nextBirthday(src: Date, from: Date): Date {
//   const nb = new Date(from.getFullYear(), src.getMonth(), src.getDate());
//   const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
//   if (nb < today) nb.setFullYear(from.getFullYear() + 1);
//   return nb;
// }

// /** Цветной бейдж «Как узнали» */
// function ReferralBadge({ value }: { value: string | null }) {
//   const v = (value ?? "—").trim().toLowerCase();

//   if (v === "instagram") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                        bg-pink-500/10 text-pink-300 border border-pink-400/20">
//         <Instagram className="h-3.5 w-3.5" />
//         Instagram
//       </span>
//     );
//   }
//   if (v === "facebook") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                        bg-blue-500/10 text-blue-300 border border-blue-400/20">
//         <Facebook className="h-3.5 w-3.5" />
//         Facebook
//       </span>
//     );
//   }
//   if (v === "google") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                        bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
//         <Globe className="h-3.5 w-3.5" />
//         Google
//       </span>
//     );
//   }
//   if (v === "friends" || v === "друзья") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                        bg-violet-500/10 text-violet-300 border border-violet-400/20">
//         <UsersRound className="h-3.5 w-3.5" />
//         Friends
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                      bg-white/5 text-slate-400 border border-white/10">
//       —
//     </span>
//   );
// }

// export default async function AdminClientsPage({ searchParams }: { searchParams: SearchParams }) {
//   const sp = await searchParams;
//   const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
//   const filterRaw = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
//   const query = (qRaw ?? "").trim();
//   const isBirthdayFilter = (filterRaw ?? "") === "birthdays";

//   const where: Prisma.ClientWhereInput | undefined =
//     query.length > 0
//       ? {
//           OR: [
//             { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { phone: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
//           ],
//         }
//       : undefined;


//   // const clients = await prisma.client.findMany({
//   //   where,
//   //   orderBy: { createdAt: "desc" },
//   //   select: {
//   //     id: true,
//   //     name: true,
//   //     phone: true,
//   //     email: true,
//   //     birthDate: true,
//   //     referral: true,
//   //     createdAt: true,
//   //   },
//   // });

//   // ✅ Добавить в Prisma query:
// const clients = await prisma.client.findMany({
//   where: {
//     deletedAt: null,  // ← ВАЖНО! Только активные клиенты
//   },
//   orderBy: { createdAt: "desc" },
//   include: {
//     _count: {
//       select: { 
//         appointments: {
//           where: {
//             deletedAt: null,  // ← Считаем только активные заявки
//           }
//         } 
//       },
//     },
//   },
// });


//   const filtered = (() => {
//     if (!isBirthdayFilter) return clients;
//     const today = new Date();
//     const horizon = new Date(today);
//     horizon.setDate(today.getDate() + 30);
//     return clients.filter((c) => {
//       const nb = nextBirthday(c.birthDate, today);
//       return nb >= today && nb <= horizon;
//     });
//   })();

//   const ids = filtered.map((c) => c.id);
//   const countMap = new Map<string, number>();
//   const lastVisitMap = new Map<string, Date>();

//   if (ids.length > 0) {
//     const stats = await prisma.appointment.groupBy({
//       by: ["clientId"],
//       where: {
//         clientId: { in: ids },
//         status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.DONE] },
//       },
//       _count: { _all: true },
//       _max: { startAt: true },
//     });

//     for (const s of stats) {
//       const key = String(s.clientId);
//       countMap.set(key, s._count._all);
//       if (s._max.startAt) lastVisitMap.set(key, s._max.startAt);
//     }
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* ═══════════════════════════════════════════════════════════════════
//           HERO ЗАГОЛОВОК С ГРАДИЕНТОМ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="card-glass card-glass-accent card-glow">
//         <div className="gradient-bg-radial" />

//         <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
//           <div className="flex items-center gap-3">
//             <IconGlow tone="fuchsia" className="icon-glow-lg">
//               <Users className="h-6 w-6 text-fuchsia-200" />
//             </IconGlow>
//             <div>
//               <h1 className="text-xl sm:text-2xl font-semibold text-white">
//                 Клиенты
//               </h1>
//               <p className="text-sm text-slate-400 mt-0.5">
//                 Поиск, ближайшие ДР и история визитов
//               </p>
//             </div>
//           </div>
          
//           <Link
//             href="/admin/clients/new"
//             className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
//           >
//             <UserPlus className="h-4 w-4" />
//             <span>Добавить</span>
//           </Link>
//         </div>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           БЫСТРЫЕ ФИЛЬТРЫ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="flex flex-wrap gap-2">
//         <ChipLink
//           active={!isBirthdayFilter}
//           href="/admin/clients"
//           label="Все"
//           icon={<Users className="h-4 w-4" />}
//           color="sky"
//         />
//         <ChipLink
//           active={isBirthdayFilter}
//           href="/admin/clients?filter=birthdays"
//           label="Ближайшие ДР (30 дней)"
//           icon={<Cake className="h-4 w-4" />}
//           color="amber"
//         />
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ПОИСК
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="card-glass card-glow">
//         <div className="p-4 sm:p-6 space-y-4">
//           <div className="flex items-center gap-2 text-sm font-medium">
//             <IconGlow tone="sky" className="icon-glow-sm">
//               <IconSearch className="h-4 w-4 text-sky-200" />
//             </IconGlow>
//             <span className="text-white">Поиск клиентов</span>
//           </div>

//           <form action="/admin/clients" method="get" className="flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1">
//               <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 name="q"
//                 defaultValue={query}
//                 placeholder="Поиск: имя, телефон, e-mail"
//                 className="input-glass w-full pl-10"
//               />
//             </div>
//             {isBirthdayFilter && <input type="hidden" name="filter" value="birthdays" />}
//             <button
//               type="submit"
//               className="btn-gradient-sky rounded-xl px-6 py-2.5 text-sm hover:scale-105 active:scale-95 whitespace-nowrap"
//             >
//               Искать
//             </button>
//           </form>
//         </div>
//       </section>

//       <div className="text-sm text-slate-400">
//         Найдено: <span className="text-white font-medium">{filtered.length}</span>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           МОБИЛЬНЫЕ КАРТОЧКИ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="space-y-3 md:hidden">
//         {filtered.length === 0 ? (
//           <div className="card-glass card-glow p-8 text-center">
//             <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
//             <p className="text-sm text-slate-400">Клиенты не найдены</p>
//           </div>
//         ) : (
//           filtered.map((c) => {
//             const visits = countMap.get(c.id) ?? 0;
//             const last = lastVisitMap.get(c.id);

//             return (
//               <div key={c.id} className="card-glass-hover card-glass-accent card-glow">
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-center justify-between gap-3">
//                     <div className="flex items-center gap-2">
//                       <IconGlow tone="fuchsia">
//                         <Users className="h-4 w-4 text-fuchsia-400" />
//                       </IconGlow>
//                       <div className="text-base font-semibold text-white">{c.name}</div>
//                     </div>
//                     <Link
//                       href={`/admin/clients/${c.id}`}
//                       className="btn-glass text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
//                     >
//                       <Eye className="h-3.5 w-3.5" />
//                       <span>Открыть</span>
//                     </Link>
//                   </div>

//                   <div className="space-y-2 text-sm">
//                     <InfoLine
//                       icon={<Phone className="h-4 w-4 text-emerald-400" />}
//                       label="Телефон"
//                       value={c.phone}
//                       tone="emerald"
//                     />
                    
//                     {c.email && (
//                       <InfoLine
//                         icon={<Mail className="h-4 w-4 text-sky-400" />}
//                         label="Email"
//                         value={c.email}
//                         tone="sky"
//                       />
//                     )}

//                     <InfoLine
//                       icon={<CalendarDays className="h-4 w-4 text-violet-400" />}
//                       label="Дата рождения"
//                       value={fmtDate(c.birthDate)}
//                       tone="violet"
//                     />

//                     <div className="flex items-start gap-2.5">
//                       <span className="shrink-0 mt-0.5">
//                         <IconGlow tone="amber">
//                           <Sparkles className="h-4 w-4 text-amber-400" />
//                         </IconGlow>
//                       </span>
//                       <div className="min-w-0 flex-1">
//                         <div className="text-xs text-slate-500">Как узнали</div>
//                         <div className="mt-1">
//                           <ReferralBadge value={c.referral} />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between pt-3 border-t border-white/10">
//                     <div className="text-xs text-slate-400">
//                       Визитов: <span className="text-emerald-400 font-semibold">{visits}</span>
//                     </div>
//                     {last && (
//                       <div className="text-xs text-slate-400">
//                         {fmtDateTime(last)}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           DESKTOP ТАБЛИЦА
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="hidden md:block">
//         {filtered.length === 0 ? (
//           <div className="card-glass card-glow p-8 text-center">
//             <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
//             <p className="text-sm text-slate-400">Клиенты не найдены</p>
//           </div>
//         ) : (
//           <div className="card-glass-hover card-glow overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-white/10">
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">Имя</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">Телефон</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">E-mail</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm whitespace-nowrap">Дата рождения</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm whitespace-nowrap">Как узнали</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">Визитов</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm whitespace-nowrap">Последний визит</th>
//                     <th className="py-3.5 px-4 text-left font-semibold text-slate-300 text-sm">Действия</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/5">
//                   {filtered.map((c) => {
//                     const visits = countMap.get(c.id) ?? 0;
//                     const last = lastVisitMap.get(c.id) ?? null;

//                     return (
//                       <tr
//                         key={c.id}
//                         className="hover:bg-white/[0.02] transition-colors"
//                       >
//                         <td className="py-3 px-4">
//                           <div className="flex items-center gap-2">
//                             <IconGlow tone="fuchsia">
//                               <Users className="h-3.5 w-3.5 text-fuchsia-400" />
//                             </IconGlow>
//                             <span className="font-medium text-white text-sm">{c.name}</span>
//                           </div>
//                         </td>

//                         <td className="py-3 px-4">
//                           <div className="flex items-center gap-2">
//                             <Phone className="h-3.5 w-3.5 text-emerald-400" />
//                             <span className="text-slate-200 text-sm">{c.phone}</span>
//                           </div>
//                         </td>

//                         <td className="py-3 px-4">
//                           {c.email ? (
//                             <div className="flex items-center gap-2">
//                               <Mail className="h-3.5 w-3.5 text-sky-400" />
//                               <span className="text-slate-200 text-sm">{c.email}</span>
//                             </div>
//                           ) : (
//                             <span className="text-slate-500 text-sm">—</span>
//                           )}
//                         </td>

//                         <td className="py-3 px-4">
//                           <div className="flex items-center gap-2">
//                             <CalendarDays className="h-3.5 w-3.5 text-violet-400" />
//                             <span className="text-slate-200 text-sm whitespace-nowrap">{fmtDate(c.birthDate)}</span>
//                           </div>
//                         </td>

//                         <td className="py-3 px-4">
//                           <ReferralBadge value={c.referral} />
//                         </td>

//                         <td className="py-3 px-4">
//                           <span
//                             className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
//                                         ${visits > 0
//                                           ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
//                                           : "bg-white/5 text-slate-400 border border-white/10"}`}
//                           >
//                             <span className={`h-1.5 w-1.5 rounded-full ${visits > 0 ? "bg-emerald-400" : "bg-slate-400"}`} />
//                             {visits}
//                           </span>
//                         </td>

//                         <td className="py-3 px-4 whitespace-nowrap">
//                           {last ? (
//                             <div className="flex items-center gap-2">
//                               <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
//                               <span className="text-slate-200 text-sm">{fmtDateTime(last)}</span>
//                             </div>
//                           ) : (
//                             <span className="text-slate-500 text-sm">—</span>
//                           )}
//                         </td>

//                         <td className="py-3 px-4">
//                           <Link
//                             href={`/admin/clients/${c.id}`}
//                             className="btn-glass text-xs px-3 py-1.5 inline-flex items-center gap-1.5 hover:scale-105 active:scale-95"
//                           >
//                             <Eye className="h-3.5 w-3.5 text-sky-300" />
//                             <span>Просмотр</span>
//                           </Link>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════ */

// function InfoLine({
//   icon,
//   label,
//   value,
//   tone,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: React.ReactNode;
//   tone?: GlowTone;
// }) {
//   return (
//     <div className="flex items-start gap-2.5">
//       <span className="shrink-0 mt-0.5">
//         {tone ? <IconGlow tone={tone}>{icon}</IconGlow> : icon}
//       </span>
//       <div className="min-w-0 flex-1">
//         <div className="text-xs text-slate-500">{label}</div>
//         <div className="text-slate-200 break-words">{value}</div>
//       </div>
//     </div>
//   );
// }

// function ChipLink({
//   href,
//   label,
//   icon,
//   active,
//   color,
// }: {
//   href: string;
//   label: string;
//   icon: React.ReactNode;
//   active?: boolean;
//   color: 'sky' | 'amber';
// }) {
//   const pal = {
//     sky: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/50' },
//     amber: {
//       bg: 'bg-amber-500/15',
//       text: 'text-amber-300',
//       border: 'border-amber-500/50',
//     },
//   }[color];

//   return (
//     <Link
//       href={href}
//       className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
//                  border transition-all hover:scale-105 active:scale-95 ${
//                    active
//                      ? `${pal.bg} ${pal.text} ${pal.border}`
//                      : 'border-white/10 text-slate-400 hover:bg-white/5'
//                  }`}
//     >
//       {icon}
//       {label}
//     </Link>
//   );
// }





//---------работало до 07.01.26 обновляем дизайн и автоматическое добавление клиентов из форм----------
// // src/app/admin/clients/page.tsx
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { Prisma, AppointmentStatus } from "@prisma/client";
// import {
//   UserPlus,
//   Users,
//   Cake,
//   Search as IconSearch,
//   Mail,
//   Phone,
//   CalendarClock,
//   Eye,
//   Instagram,
//   Facebook,
//   Globe,
//   UsersRound,
// } from "lucide-react";

// export const dynamic = "force-dynamic";

// type SearchParams = Promise<{ q?: string | string[]; filter?: string | string[] }>;

// function fmtDate(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// function nextBirthday(src: Date, from: Date): Date {
//   const nb = new Date(from.getFullYear(), src.getMonth(), src.getDate());
//   const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
//   if (nb < today) nb.setFullYear(from.getFullYear() + 1);
//   return nb;
// }

// /** Цветной бейдж «Как узнали» */
// function ReferralBadge({ value }: { value: string | null }) {
//   const v = (value ?? "—").trim().toLowerCase();

//   if (v === "instagram") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-[12px] font-medium
//                        bg-pink-500/15 text-pink-200 ring-1 ring-pink-400/25">
//         <Instagram className="h-3.5 w-3.5" />
//         Instagram
//       </span>
//     );
//   }
//   if (v === "facebook") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-[12px] font-medium
//                        bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/25">
//         <Facebook className="h-3.5 w-3.5" />
//         Facebook
//       </span>
//     );
//   }
//   if (v === "google") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-[12px] font-medium
//                        bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25">
//         <Globe className="h-3.5 w-3.5" />
//         Google
//       </span>
//     );
//   }
//   if (v === "friends" || v === "друзья") {
//     return (
//       <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-[12px] font-medium
//                        bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/25">
//         <UsersRound className="h-3.5 w-3.5" />
//         Friends
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-[12px]
//                      font-medium bg-white/5 text-slate-200 ring-1 ring-white/10">
//       —
//     </span>
//   );
// }

// export default async function AdminClientsPage({ searchParams }: { searchParams: SearchParams }) {
//   const sp = await searchParams;
//   const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
//   const filterRaw = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
//   const query = (qRaw ?? "").trim();
//   const isBirthdayFilter = (filterRaw ?? "") === "birthdays";

//   const where: Prisma.ClientWhereInput | undefined =
//     query.length > 0
//       ? {
//           OR: [
//             { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { phone: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
//           ],
//         }
//       : undefined;

//   const clients = await prisma.client.findMany({
//     where,
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       name: true,
//       phone: true,
//       email: true,
//       birthDate: true,
//       referral: true,
//       createdAt: true,
//     },
//   });

//   const filtered = (() => {
//     if (!isBirthdayFilter) return clients;
//     const today = new Date();
//     const horizon = new Date(today);
//     horizon.setDate(today.getDate() + 30);
//     return clients.filter((c) => {
//       const nb = nextBirthday(c.birthDate, today);
//       return nb >= today && nb <= horizon;
//     });
//   })();

//   const ids = filtered.map((c) => c.id);
//   const countMap = new Map<string, number>();
//   const lastVisitMap = new Map<string, Date>();

//   if (ids.length > 0) {
//     const stats = await prisma.appointment.groupBy({
//       by: ["clientId"],
//       where: {
//         clientId: { in: ids },
//         status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.DONE] },
//       },
//       _count: { _all: true },
//       _max: { startAt: true },
//     });

//     for (const s of stats) {
//       const key = String(s.clientId);
//       countMap.set(key, s._count._all);
//       if (s._max.startAt) lastVisitMap.set(key, s._max.startAt);
//     }
//   }

//   const chipBase =
//     "inline-flex items-center gap-2 rounded-full h-9 px-3 text-sm ring-1 ring-white/10 border border-white/10 bg-slate-900/50 hover:bg-slate-800/60 transition";
//   const chipActive = "bg-gradient-to-r from-fuchsia-600/25 via-violet-600/20 to-sky-600/20 text-white ring-fuchsia-400/30";

//   return (
//     <main className="p-4 sm:p-6 space-y-6">
//       {/* header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Клиенты</h1>
//           <div className="text-sm opacity-70 mt-1">Поиск, ближайшие ДР и история визитов</div>
//         </div>
//         <div className="flex flex-wrap items-center gap-2">
//           <Link
//             href="/admin/clients/new"
//             className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm font-medium text-white
//                        bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
//                        ring-1 ring-white/10 shadow-[0_0_20px_rgba(99,102,241,.35)]
//                        hover:brightness-110 active:scale-[0.98] transition"
//           >
//             <UserPlus className="h-4 w-4" />
//             Добавить
//           </Link>
//           <Link href="/admin/clients" className={`${chipBase} ${!isBirthdayFilter ? chipActive : ""}`}>
//             <Users className="h-4 w-4 text-teal-300" />
//             Все
//           </Link>
//           <Link
//             href="/admin/clients?filter=birthdays"
//             className={`${chipBase} ${isBirthdayFilter ? chipActive : ""}`}
//           >
//             <Cake className="h-4 w-4 text-amber-300" />
//             Ближайшие ДР (30 дней)
//           </Link>
//         </div>
//       </div>

//       {/* search */}
//       <form action="/admin/clients" method="get" className="flex flex-col sm:flex-row gap-2">
//         <label className="relative w-full sm:max-w-[420px]">
//           <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//           <input
//             type="text"
//             name="q"
//             defaultValue={query}
//             placeholder="Поиск: имя, телефон, e-mail"
//             className="w-full rounded-full bg-slate-900/60 border border-white/10 ring-1 ring-white/10
//                        pl-9 pr-3 h-10 text-sm placeholder:text-slate-400 focus:outline-none
//                        focus:bg-slate-900/70 focus:ring-fuchsia-400/30"
//           />
//         </label>
//         {isBirthdayFilter && <input type="hidden" name="filter" value="birthdays" />}
//         <button
//           type="submit"
//           className="inline-flex items-center justify-center rounded-full h-10 px-5 text-sm text-white
//                      bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
//                      ring-1 ring-white/10 shadow-[0_0_16px_rgba(99,102,241,.30)]
//                      hover:brightness-110 active:scale-[0.98] transition"
//         >
//           Искать
//         </button>
//       </form>

//       <div className="text-sm opacity-70">Найдено: <span className="opacity-100">{filtered.length}</span></div>

//       {/* mobile cards */}
//       <div className="grid gap-3 md:hidden">
//         {filtered.length === 0 ? (
//           <div className="rounded-2xl border border-white/10 p-4 opacity-70">Клиенты не найдены.</div>
//         ) : (
//           filtered.map((c) => {
//             const visits = countMap.get(c.id) ?? 0;
//             const last = lastVisitMap.get(c.id);

//             return (
//               <div key={c.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <div className="text-base font-medium">{c.name}</div>
//                   <Link
//                     href={`/admin/clients/${c.id}`}
//                     className="inline-flex items-center gap-2 text-sm rounded-full h-9 px-3
//                                border border-white/10 ring-1 ring-white/10 bg-slate-900/60
//                                hover:bg-slate-800/70 transition"
//                   >
//                     <Eye className="h-4 w-4 text-sky-300" />
//                     Открыть
//                   </Link>
//                 </div>

//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <div className="inline-flex items-center gap-2">
//                     <Phone className="h-4 w-4 text-emerald-300" />
//                     <span className="truncate">{c.phone}</span>
//                   </div>
//                   <div className="inline-flex items-center gap-2">
//                     <Mail className="h-4 w-4 text-violet-300" />
//                     <span className="truncate">{c.email ?? "—"}</span>
//                   </div>
//                   <div className="inline-flex items-center gap-2">
//                     <Cake className="h-4 w-4 text-amber-300" />
//                     <span>{fmtDate(c.birthDate)}</span>
//                   </div>
//                   <div className="inline-flex items-center gap-2">
//                     <CalendarClock className="h-4 w-4 text-cyan-300" />
//                     <span>{visits} виз. • {last ? fmtDateTime(last) : "—"}</span>
//                   </div>
//                 </div>

//                 <div className="text-xs opacity-70">
//                   Как узнали: <span className="opacity-100"><ReferralBadge value={c.referral} /></span>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* TABLE — десктоп */}
//       <div className="hidden md:block rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] bg-slate-950/40">
//         {filtered.length === 0 ? (
//           <div className="p-4 opacity-70">Клиенты не найдены.</div>
//         ) : (
//           <div className="relative overflow-x-auto">
//             <table className="min-w-[980px] w-full text-[13.5px]">
//               <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
//                 <tr className="text-left">
//                   <th className="py-3.5 px-4 font-medium text-slate-300">Имя</th>
//                   <th className="py-3.5 px-4 font-medium text-slate-300">Телефон</th>
//                   <th className="py-3.5 px-4 font-medium text-slate-300">E-mail</th>
//                   <th className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">Дата рождения</th>
//                   <th className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">Как узнали</th>
//                   <th className="py-3.5 px-4 font-medium text-slate-300">Визитов</th>
//                   <th className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">Последний визит</th>
//                   <th className="py-3.5 px-4 font-medium text-slate-300">Действия</th>
//                 </tr>
//               </thead>
//               <tbody className="[&>tr]:border-t [&>tr]:border-white/8">
//                 {filtered.map((c, idx) => {
//                   const visits = countMap.get(c.id) ?? 0;
//                   const last = lastVisitMap.get(c.id) ?? null;

//                   return (
//                     <tr
//                       key={c.id}
//                       className="hover:bg-white/[0.03] transition-colors"
//                     >
//                       <td className="py-3 px-4">
//                         <div className="font-medium text-[14px]">{c.name}</div>
//                       </td>

//                       <td className="py-3 px-4 text-slate-200">{c.phone}</td>

//                       <td className="py-3 px-4 text-slate-200">
//                         {c.email ?? "—"}
//                       </td>

//                       <td className="py-3 px-4 whitespace-nowrap">{fmtDate(c.birthDate)}</td>

//                       <td className="py-3 px-4">
//                         <ReferralBadge value={c.referral} />
//                       </td>

//                       <td className="py-3 px-4">
//                         <span
//                           className={`inline-flex items-center gap-1 rounded-full px-2.5 h-7 text-[12px] ring-1
//                                       ${visits > 0
//                                         ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/25"
//                                         : "bg-white/5 text-slate-200 ring-white/10"}`}
//                         >
//                           <span className={`h-1.5 w-1.5 rounded-full ${visits > 0 ? "bg-emerald-400" : "bg-slate-400"}`} />
//                           {visits}
//                         </span>
//                       </td>

//                       <td className="py-3 px-4 whitespace-nowrap">
//                         {last ? (
//                           <span className="text-slate-200">{fmtDateTime(last)}</span>
//                         ) : (
//                           <span className="opacity-60">—</span>
//                         )}
//                       </td>

//                       <td className="py-3 px-4">
//                         <Link
//                           href={`/admin/clients/${c.id}`}
//                           className="inline-flex items-center gap-2 rounded-full h-9 px-3 text-sm
//                                      border border-white/10 ring-1 ring-white/10 bg-slate-900/60
//                                      hover:bg-slate-800/70 focus-visible:outline-none
//                                      focus-visible:ring-2 focus-visible:ring-fuchsia-400/40 transition"
//                         >
//                           <Eye className="h-4 w-4 text-sky-300" />
//                           Просмотр
//                         </Link>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }



// // src/app/admin/clients/page.tsx
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { Prisma, AppointmentStatus } from "@prisma/client";

// export const dynamic = "force-dynamic";

// type SearchParams =
//   Promise<{ q?: string | string[]; filter?: string | string[] }>;

// function fmtDate(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// function nextBirthday(src: Date, from: Date): Date {
//   const nb = new Date(from.getFullYear(), src.getMonth(), src.getDate());
//   // если в этом году ДР уже прошёл — берем следующий год
//   if (nb < new Date(from.getFullYear(), from.getMonth(), from.getDate())) {
//     nb.setFullYear(from.getFullYear() + 1);
//   }
//   return nb;
// }

// export default async function AdminClientsPage(props: { searchParams: SearchParams }) {
//   // Next 15: searchParams — это Promise
//   const sp = await props.searchParams;
//   const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
//   const filterRaw = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;

//   const query = (qRaw ?? "").trim();
//   const isBirthdayFilter = (filterRaw ?? "") === "birthdays";

//   // 1) Where для поиска
//   const where: Prisma.ClientWhereInput | undefined =
//     query.length > 0
//       ? {
//           OR: [
//             { name:  { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { phone: { contains: query, mode: Prisma.QueryMode.insensitive } },
//             { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
//           ],
//         }
//       : undefined;

//   // 2) Базовые данные клиентов
//   const clients = await prisma.client.findMany({
//     where,
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       name: true,
//       phone: true,
//       email: true,
//       birthDate: true,
//       referral: true,
//       createdAt: true,
//     },
//   });

//   // 2.1) Фильтр «ближайшие именинники 30 дней»
//   const filtered = (() => {
//     if (!isBirthdayFilter) return clients;
//     const today = new Date();
//     const horizon = new Date(today);
//     horizon.setDate(today.getDate() + 30);
//     return clients.filter((c) => {
//       const nb = nextBirthday(c.birthDate, today);
//       return nb >= today && nb <= horizon;
//     });
//   })();

//   // 3) Метрики по визитам: count(CONFIRMED | DONE) + lastVisit
//   const ids = filtered.map((c) => c.id);
//   const countMap = new Map<string, number>();
//   const lastVisitMap = new Map<string, Date>();

//   if (ids.length > 0) {
//     const stats = await prisma.appointment.groupBy({
//       by: ["clientId"], // OK c TS, это верный литерал поля
//       where: {
//         clientId: { in: ids },
//         status: {
//           in: [AppointmentStatus.CONFIRMED, AppointmentStatus.DONE],
//         },
//       },
//       _count: { _all: true },
//       _max: { startAt: true },
//     });

//     for (const s of stats) {
//       // clientId может быть null, но мы группируем по where clientId in ids, поэтому здесь строка
//       const key = String(s.clientId);
//       countMap.set(key, s._count._all);
//       if (s._max.startAt) lastVisitMap.set(key, s._max.startAt);
//     }
//   }

//   return (
//     <main className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">Клиенты</h1>
//         <div className="flex gap-2">
//         <Link href="/admin/clients/new" className="btn btn-primary">Добавить</Link>
//           <Link href="/admin/clients" className="btn">Все</Link>
//           <Link href="/admin/clients?filter=birthdays" className="btn">Ближайшие ДР</Link>
//         </div>
//       </div>

//       {/* Поисковая форма (без client-side JS — простая GET-форма) */}
//       <form className="flex gap-2" action="/admin/clients" method="get">
//         <input
//           type="text"
//           name="q"
//           defaultValue={query}
//           placeholder="Поиск: имя, телефон, e-mail"
//           className="rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700 w-[360px]"
//         />
//         {isBirthdayFilter && <input type="hidden" name="filter" value="birthdays" />}
//         <button className="btn">Искать</button>
//       </form>

//       {filtered.length === 0 ? (
//         <div className="rounded-2xl border p-4 opacity-70">
//           Клиенты не найдены.
//         </div>
//       ) : (
//         <div className="rounded-2xl border overflow-x-auto">
//           <table className="min-w-[960px] w-full text-sm">
//             <thead className="text-left opacity-70">
//               <tr>
//                 <th className="py-2 px-3">Имя</th>
//                 <th className="py-2 px-3">Телефон</th>
//                 <th className="py-2 px-3">E-mail</th>
//                 <th className="py-2 px-3">Дата рождения</th>
//                 <th className="py-2 px-3">Как узнали</th>
//                 <th className="py-2 px-3">Визитов</th>
//                 <th className="py-2 px-3">Последний визит</th>
//                 <th className="py-2 px-3">Действия</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/10">
//               {filtered.map((c) => {
//                 const count = countMap.get(c.id) ?? 0;
//                 const last = lastVisitMap.get(c.id) ?? null;
//                 return (
//                   <tr key={c.id}>
//                     <td className="py-2 px-3">{c.name}</td>
//                     <td className="py-2 px-3">{c.phone}</td>
//                     <td className="py-2 px-3">{c.email ?? "—"}</td>
//                     <td className="py-2 px-3">{fmtDate(c.birthDate)}</td>
//                     <td className="py-2 px-3">{c.referral ?? "—"}</td>
//                     <td className="py-2 px-3">{count}</td>
//                     <td className="py-2 px-3">{last ? fmtDateTime(last) : "—"}</td>
//                     <td className="py-2 px-3">
//                       <Link href={`/admin/clients/${c.id}`} className="btn btn-sm">
//                         Просмотр
//                       </Link>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </main>
//   );
// }
