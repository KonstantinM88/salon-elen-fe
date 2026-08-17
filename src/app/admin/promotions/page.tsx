"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BadgePercent,
  CalendarDays,
  Check,
  Clock3,
  Globe2,
  Search,
  Sparkles,
  Tags,
  Trash2,
} from "lucide-react";
import {
  createPromotion,
  deletePromotion,
  listPromotionServices,
  listPromotions,
  type PromotionAdminRow,
  type PromotionServiceGroup,
} from "./server";
import { isSeoLocale, type SeoLocale } from "@/lib/seo-locale";
import { PROMOTION_PERCENT_OPTIONS } from "@/lib/promotion-constants";

type PromotionForm = {
  title: string;
  percent: number;
  from: string;
  to: string;
  isGlobal: boolean;
  serviceIds: string[];
};

type PromotionsCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  createTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  discountLabel: string;
  periodLabel: string;
  fromLabel: string;
  toLabel: string;
  scopeLabel: string;
  selected: string;
  allServices: string;
  allServicesHint: string;
  chooseServices: string;
  searchPlaceholder: string;
  selectCategory: string;
  clearCategory: string;
  save: string;
  saving: string;
  activePromotions: string;
  noPromotions: string;
  active: string;
  scheduled: string;
  expired: string;
  allServicesBadge: string;
  servicesBadge: string;
  remove: string;
  loadError: string;
  preview: string;
  previewHint: string;
  loading: string;
};

const PROMOTIONS_COPY: Record<SeoLocale, PromotionsCopy> = {
  de: {
    eyebrow: "VERKAUFSIMPULS",
    title: "Aktionen steuern",
    subtitle: "Veroeffentlichte Aktionen sind sofort sichtbar; der Rabatt gilt fuer Termine im Aktionszeitraum.",
    createTitle: "Neue Aktion",
    nameLabel: "Name der Aktion",
    namePlaceholder: "z. B. Beauty Week",
    discountLabel: "Rabatt",
    periodLabel: "Aktionszeitraum",
    fromLabel: "Start",
    toLabel: "Ende",
    scopeLabel: "Gueltige Leistungen",
    selected: "ausgewaehlt",
    allServices: "Alle Leistungen",
    allServicesHint: "Der Rabatt gilt automatisch fuer jede aktive Leistung.",
    chooseServices: "Leistungen auswaehlen",
    searchPlaceholder: "Leistung suchen...",
    selectCategory: "Alle waehlen",
    clearCategory: "Auswahl loeschen",
    save: "Aktion veroeffentlichen",
    saving: "Wird gespeichert...",
    activePromotions: "Gespeicherte Aktionen",
    noPromotions: "Noch keine Aktionen angelegt.",
    active: "Aktiv",
    scheduled: "Veroeffentlicht · geplant",
    expired: "Beendet",
    allServicesBadge: "Alle Leistungen",
    servicesBadge: "Leistungen",
    remove: "Loeschen",
    loadError: "Daten konnten nicht geladen werden.",
    preview: "Vorschau",
    previewHint: "Nach der Veroeffentlichung erscheinen Aktionspreis und Terminzeitraum sofort auf den Karten.",
    loading: "Aktionen werden geladen...",
  },
  ru: {
    eyebrow: "СТИМУЛ К ЗАПИСИ",
    title: "Управление акциями",
    subtitle: "Опубликованная акция видна сразу, а скидка применяется к визитам в её период.",
    createTitle: "Новая акция",
    nameLabel: "Название акции",
    namePlaceholder: "Например, Beauty Week",
    discountLabel: "Размер скидки",
    periodLabel: "Период действия",
    fromLabel: "Начало",
    toLabel: "Окончание",
    scopeLabel: "Услуги акции",
    selected: "выбрано",
    allServices: "Все услуги",
    allServicesHint: "Скидка автоматически применяется ко всем активным услугам.",
    chooseServices: "Выбрать услуги",
    searchPlaceholder: "Найти услугу...",
    selectCategory: "Выбрать категорию",
    clearCategory: "Снять выбор",
    save: "Опубликовать акцию",
    saving: "Сохраняем...",
    activePromotions: "Сохранённые акции",
    noPromotions: "Акции пока не созданы.",
    active: "Действует",
    scheduled: "Опубликована · ожидает даты",
    expired: "Завершена",
    allServicesBadge: "Все услуги",
    servicesBadge: "услуг",
    remove: "Удалить",
    loadError: "Не удалось загрузить данные.",
    preview: "Предпросмотр",
    previewHint: "После публикации акционная цена и период визитов сразу появятся в карточках.",
    loading: "Загружаем акции...",
  },
  en: {
    eyebrow: "BOOKING INCENTIVE",
    title: "Promotion management",
    subtitle: "Published offers appear immediately; the discount applies to appointments within the offer period.",
    createTitle: "New promotion",
    nameLabel: "Promotion name",
    namePlaceholder: "For example, Beauty Week",
    discountLabel: "Discount",
    periodLabel: "Promotion period",
    fromLabel: "Start",
    toLabel: "End",
    scopeLabel: "Included services",
    selected: "selected",
    allServices: "All services",
    allServicesHint: "The discount automatically applies to every active service.",
    chooseServices: "Choose services",
    searchPlaceholder: "Search services...",
    selectCategory: "Select category",
    clearCategory: "Clear selection",
    save: "Publish promotion",
    saving: "Saving...",
    activePromotions: "Saved promotions",
    noPromotions: "No promotions have been created yet.",
    active: "Active",
    scheduled: "Published · scheduled",
    expired: "Ended",
    allServicesBadge: "All services",
    servicesBadge: "services",
    remove: "Delete",
    loadError: "Could not load promotion data.",
    preview: "Preview",
    previewHint: "After publication, cards immediately show the promotional price and appointment period.",
    loading: "Loading promotions...",
  },
};

const EMPTY_FORM: PromotionForm = {
  title: "",
  percent: 10,
  from: "",
  to: "",
  isGlobal: false,
  serviceIds: [],
};

function getCookieLocale(): SeoLocale | null {
  if (typeof document === "undefined") return null;
  const part = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith("locale="));
  if (!part) return null;
  const value = decodeURIComponent(part.slice("locale=".length));
  return isSeoLocale(value) ? value : null;
}

function salonTodayISO(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function formatMoney(cents: number | null, locale: SeoLocale): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat(
    locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US",
    { style: "currency", currency: "EUR", maximumFractionDigits: 2 },
  ).format(cents / 100);
}

export default function PromotionsAdminPage() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<SeoLocale>("de");
  const [items, setItems] = useState<PromotionAdminRow[]>([]);
  const [groups, setGroups] = useState<PromotionServiceGroup[]>([]);
  const [form, setForm] = useState<PromotionForm>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const lang = searchParams.get("lang");
    if (isSeoLocale(lang)) setLocale(lang);
    else setLocale(getCookieLocale() ?? "de");
  }, [searchParams]);

  const t = PROMOTIONS_COPY[locale];
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [promotionsResult, servicesResult] = await Promise.all([
        listPromotions(),
        listPromotionServices(locale),
      ]);
      if (promotionsResult.ok && servicesResult.ok) {
        setItems(promotionsResult.data);
        setGroups(servicesResult.data);
      } else {
        setMessage({ type: "error", text: t.loadError });
      }
    } catch (error) {
      console.error("[Promotions Admin] Load failed", error);
      setMessage({ type: "error", text: t.loadError });
    } finally {
      setLoading(false);
    }
  }, [locale, t.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const allServices = useMemo(
    () => groups.flatMap((group) => group.services),
    [groups],
  );
  const serviceById = useMemo(
    () => new Map(allServices.map((service) => [service.id, service])),
    [allServices],
  );
  const selectedSet = useMemo(() => new Set(form.serviceIds), [form.serviceIds]);
  const normalizedSearch = search.trim().toLocaleLowerCase(locale);
  const filteredGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          services: normalizedSearch
            ? group.services.filter((service) =>
                service.title.toLocaleLowerCase(locale).includes(normalizedSearch),
              )
            : group.services,
        }))
        .filter((group) => group.services.length > 0),
    [groups, locale, normalizedSearch],
  );
  const sampleService = form.serviceIds.length > 0
    ? serviceById.get(form.serviceIds[0])
    : allServices.find((service) => service.priceCents != null);
  const samplePromotionPrice = sampleService?.priceCents == null
    ? null
    : Math.round((sampleService.priceCents * (100 - form.percent)) / 100);

  const toggleService = (serviceId: string) => {
    setForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId],
    }));
  };

  const toggleCategory = (group: PromotionServiceGroup) => {
    const groupIds = group.services.map((service) => service.id);
    const allSelected = groupIds.every((id) => selectedSet.has(id));
    setForm((current) => ({
      ...current,
      serviceIds: allSelected
        ? current.serviceIds.filter((id) => !groupIds.includes(id))
        : Array.from(new Set([...current.serviceIds, ...groupIds])),
    }));
  };

  const savePromotion = async () => {
    setSaving(true);
    setMessage(null);
    const result = await createPromotion(form, locale);
    if (result.ok) {
      setForm(EMPTY_FORM);
      setSearch("");
      setMessage({ type: "success", text: t.save });
      await load();
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setSaving(false);
  };

  const today = salonTodayISO();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <header className="border-b border-white/10 pb-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-fuchsia-400">
          <Sparkles className="h-4 w-4" />
          {t.eyebrow}
        </div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">{t.subtitle}</p>
      </header>

      {message && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-white/10 bg-[#0b1020]/85 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/15 text-fuchsia-300">
            <BadgePercent className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold text-white">{t.createTitle}</h2>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/75">{t.nameLabel}</label>
              <input
                value={form.title}
                maxLength={100}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder={t.namePlaceholder}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-400/70 focus:ring-2 focus:ring-fuchsia-500/15"
              />
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/75">
                <BadgePercent className="h-4 w-4 text-fuchsia-300" />
                {t.discountLabel}
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PROMOTION_PERCENT_OPTIONS.map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => setForm({ ...form, percent })}
                    className={`h-10 rounded-lg border text-sm font-bold transition ${
                      form.percent === percent
                        ? "border-fuchsia-300 bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                        : "border-white/10 bg-white/5 text-white/65 hover:border-fuchsia-400/40 hover:text-white"
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/75">
                <CalendarDays className="h-4 w-4 text-sky-300" />
                {t.periodLabel}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-white/50">
                  {t.fromLabel}
                  <input
                    type="date"
                    value={form.from}
                    onChange={(event) => setForm({ ...form, from: event.target.value })}
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-sky-400/70"
                  />
                </label>
                <label className="text-xs text-white/50">
                  {t.toLabel}
                  <input
                    type="date"
                    min={form.from || undefined}
                    value={form.to}
                    onChange={(event) => setForm({ ...form, to: event.target.value })}
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-sky-400/70"
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <Tags className="h-4 w-4 text-emerald-300" />
                  {t.scopeLabel}
                </div>
                <span className="text-xs text-white/45">
                  {form.isGlobal ? allServices.length : form.serviceIds.length} {t.selected}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    isGlobal: !current.isGlobal,
                    serviceIds: !current.isGlobal ? [] : current.serviceIds,
                  }))
                }
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                  form.isGlobal
                    ? "border-emerald-400/60 bg-emerald-500/12"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${form.isGlobal ? "bg-emerald-500 text-white" : "bg-white/5 text-white/45"}`}>
                  {form.isGlobal ? <Check className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{t.allServices}</span>
                  <span className="mt-0.5 block text-xs text-white/45">{t.allServicesHint}</span>
                </span>
              </button>

              {!form.isGlobal && (
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/60"
                    />
                  </div>

                  <div className="max-h-[430px] space-y-5 overflow-y-auto pr-1">
                    {filteredGroups.map((group) => {
                      const groupSelected = group.services.every((service) => selectedSet.has(service.id));
                      return (
                        <div key={group.id}>
                          <div className="mb-2 flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                            <h3 className="text-sm font-semibold text-white">{group.title}</h3>
                            <button
                              type="button"
                              onClick={() => toggleCategory(group)}
                              className="text-xs font-medium text-fuchsia-300 hover:text-fuchsia-200"
                            >
                              {groupSelected ? t.clearCategory : t.selectCategory}
                            </button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {group.services.map((service) => {
                              const checked = selectedSet.has(service.id);
                              return (
                                <button
                                  key={service.id}
                                  type="button"
                                  onClick={() => toggleService(service.id)}
                                  className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                                    checked
                                      ? "border-fuchsia-400/45 bg-fuchsia-500/10"
                                      : "border-white/8 bg-white/[0.025] hover:border-white/20"
                                  }`}
                                >
                                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${checked ? "border-fuchsia-400 bg-fuchsia-500 text-white" : "border-white/20 text-transparent"}`}>
                                    <Check className="h-3.5 w-3.5" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-medium leading-5 text-white/85">{service.title}</span>
                                    <span className="block text-xs text-white/40">{formatMoney(service.priceCents, locale)}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:border-l lg:border-white/10 lg:pl-6">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-lg border border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/15 via-rose-500/10 to-amber-400/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase text-fuchsia-200">{t.preview}</span>
                  <span className="rounded-full bg-fuchsia-500 px-3 py-1 text-sm font-black text-white">-{form.percent}%</span>
                </div>
                <div className="mt-5 text-lg font-semibold text-white">{form.title || t.namePlaceholder}</div>
                {sampleService && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="text-sm text-white/55">{sampleService.title}</div>
                    <div className="mt-2 flex flex-wrap items-end gap-3">
                      <span className="text-sm text-white/40 line-through">{formatMoney(sampleService.priceCents, locale)}</span>
                      <span className="text-3xl font-black text-amber-300">{formatMoney(samplePromotionPrice, locale)}</span>
                    </div>
                  </div>
                )}
                <p className="mt-4 text-xs leading-5 text-white/45">{t.previewHint}</p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => void savePromotion()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 px-5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {saving ? t.saving : t.save}
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">{t.activePromotions}</h2>
          <span className="text-sm text-white/40">{items.length}</span>
        </div>

        {loading ? (
          <div className="rounded-lg border border-white/10 p-8 text-center text-sm text-white/45">{t.loading}</div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{t.noPromotions}</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((promotion) => {
              const status = promotion.to < today ? "expired" : promotion.from > today ? "scheduled" : "active";
              const statusLabel = status === "active" ? t.active : status === "scheduled" ? t.scheduled : t.expired;
              const statusClass = status === "active"
                ? "bg-emerald-500/15 text-emerald-300"
                : status === "scheduled"
                  ? "bg-sky-500/15 text-sky-300"
                  : "bg-white/5 text-white/40";
              const serviceNames = promotion.serviceIds
                .map((id) => serviceById.get(id)?.title)
                .filter(Boolean)
                .join(", ");

              return (
                <article key={promotion.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-fuchsia-500 px-2.5 py-1 text-xs font-black text-white">-{promotion.percent}%</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-white">{promotion.title}</h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                        <Clock3 className="h-3.5 w-3.5" />
                        {promotion.from} — {promotion.to}
                      </div>
                      <div className="mt-2 text-xs leading-5 text-white/45">
                        {promotion.isGlobal
                          ? t.allServicesBadge
                          : `${promotion.serviceIds.length} ${t.servicesBadge}${serviceNames ? `: ${serviceNames}` : ""}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      title={t.remove}
                      onClick={async () => {
                        const result = await deletePromotion(promotion.id, locale);
                        if (result.ok) await load();
                        else setMessage({ type: "error", text: result.error });
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/8 text-red-300 transition hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
