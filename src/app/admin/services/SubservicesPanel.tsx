// src/app/admin/services/SubservicesPanel.tsx
"use client";

import React, { useMemo, useState } from "react";
import type { ActionResult } from "./actions";
import { TranslationButton } from './ServicesPageClient';
import { ServiceEditButton } from './EditButtons';
import type { SeoLocale } from "@/lib/seo-locale";

type ParentOption = { id: string; name: string };

type Translation = {
  locale: string;
  name: string;
  description: string | null;
};

type Sub = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  durationMin: number | null;
  priceCents: number | null;
  isActive: boolean;
  parentId: string | null;
  parentName: string;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
};

type ViewMode = "cards" | "table";
type SortKey = "name" | "price" | "minutes";

type Props = {
  locale?: SeoLocale;
  parentOptions: ParentOption[];
  subservices: Sub[];
  updateSubservice: (formData: FormData) => Promise<ActionResult>;
  deleteSubservice: (formData: FormData) => Promise<ActionResult>;
};

const INTL_BY_LOCALE: Record<SeoLocale, string> = {
  de: "de-DE",
  ru: "ru-RU",
  en: "en-US",
};

type SubservicesCopy = {
  title: string;
  fromCount: string;
  filters: string;
  cards: string;
  table: string;
  searchPlaceholder: string;
  allCategories: string;
  sortByName: string;
  sortByPrice: string;
  sortByMinutes: string;
  onlyActive: string;
  reset: string;
  nothingFound: string;
  tryChangingFilters: string;
  activeShort: string;
  offShort: string;
  price: string;
  duration: string;
  minutesSuffix: string;
  yes: string;
  no: string;
  nameCol: string;
  categoryCol: string;
  priceCol: string;
  minutesCol: string;
  activeCol: string;
  descriptionCol: string;
};

const SUBSERVICES_COPY: Record<SeoLocale, SubservicesCopy> = {
  de: {
    title: "Unterleistungen",
    fromCount: "von",
    filters: "Filter",
    cards: "Karten",
    table: "Tabelle",
    searchPlaceholder: "Suche nach Name, Beschreibung...",
    allCategories: "Alle Kategorien",
    sortByName: "Sortierung: Name",
    sortByPrice: "Sortierung: Preis",
    sortByMinutes: "Sortierung: Minuten",
    onlyActive: "Nur aktive",
    reset: "Zuruecksetzen",
    nothingFound: "Nichts gefunden",
    tryChangingFilters: "Versuchen Sie, die Filter zu aendern",
    activeShort: "aktiv",
    offShort: "aus",
    price: "Preis",
    duration: "Dauer",
    minutesSuffix: "Min",
    yes: "Ja",
    no: "Nein",
    nameCol: "Name",
    categoryCol: "Kategorie",
    priceCol: "Preis",
    minutesCol: "Min",
    activeCol: "Aktiv",
    descriptionCol: "Beschreibung",
  },
  ru: {
    title: "Подуслуги",
    fromCount: "из",
    filters: "Фильтры",
    cards: "Карточки",
    table: "Таблица",
    searchPlaceholder: "Поиск по названию, описанию…",
    allCategories: "Все категории",
    sortByName: "Сортировка: имя",
    sortByPrice: "Сортировка: цена",
    sortByMinutes: "Сортировка: минуты",
    onlyActive: "Только активные",
    reset: "Сбросить",
    nothingFound: "Ничего не найдено",
    tryChangingFilters: "Попробуйте изменить параметры поиска",
    activeShort: "активна",
    offShort: "выкл",
    price: "Цена",
    duration: "Длительность",
    minutesSuffix: "мин",
    yes: "Да",
    no: "Нет",
    nameCol: "Название",
    categoryCol: "Категория",
    priceCol: "Цена",
    minutesCol: "Мин",
    activeCol: "Активна",
    descriptionCol: "Описание",
  },
  en: {
    title: "Subservices",
    fromCount: "of",
    filters: "Filters",
    cards: "Cards",
    table: "Table",
    searchPlaceholder: "Search by name, description...",
    allCategories: "All categories",
    sortByName: "Sort: name",
    sortByPrice: "Sort: price",
    sortByMinutes: "Sort: minutes",
    onlyActive: "Only active",
    reset: "Reset",
    nothingFound: "Nothing found",
    tryChangingFilters: "Try changing search filters",
    activeShort: "active",
    offShort: "off",
    price: "Price",
    duration: "Duration",
    minutesSuffix: "min",
    yes: "Yes",
    no: "No",
    nameCol: "Name",
    categoryCol: "Category",
    priceCol: "Price",
    minutesCol: "Min",
    activeCol: "Active",
    descriptionCol: "Description",
  },
};

function euro(cents: number | null, locale: SeoLocale): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat(INTL_BY_LOCALE[locale], { style: "currency", currency: "EUR" })
    .format((cents ?? 0) / 100);
}

export default function SubservicesPanel({
  locale = "de",
  parentOptions,
  subservices,
  updateSubservice,
  deleteSubservice,
}: Props) {
  const t = SUBSERVICES_COPY[locale];
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<ViewMode>("cards");
  const [filterParent, setFilterParent] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo<Sub[]>(() => {
    const query = q.trim().toLowerCase();
    const list = subservices.filter((s) => {
      if (onlyActive && !s.isActive) return false;
      if (filterParent !== "all" && s.parentId !== filterParent) return false;
      if (!query) return true;
      const hay = `${s.name} ${s.slug ?? ""} ${s.parentName} ${
        s.description ?? ""
      }`.toLowerCase();
      return hay.includes(query);
    });

    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price") return (a.priceCents ?? 0) - (b.priceCents ?? 0);
      return (a.durationMin ?? 0) - (b.durationMin ?? 0);
    });

    return list;
  }, [subservices, onlyActive, filterParent, q, sort]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (onlyActive) count++;
    if (filterParent !== "all") count++;
    if (sort !== "name") count++;
    return count;
  }, [onlyActive, filterParent, sort]);

  return (
    <section className="admin-section space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-medium">{t.title}</h2>
            <span className="text-xs text-white/50 hidden sm:inline">
              {filtered.length} {t.fromCount} {subservices.length}
            </span>
          </div>
          
          {/* View toggle - always visible */}
          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>{t.filters}</span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-fuchsia-500/30 text-[10px] font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="inline-flex rounded-full border border-white/15 p-0.5 sm:p-1">
              <button
                type="button"
                onClick={() => setView("cards")}
                className={`rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm transition ${
                  view === "cards" ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className="hidden sm:inline">{t.cards}</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setView("table")}
                className={`rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm transition ${
                  view === "table" ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className="hidden sm:inline">{t.table}</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search - always visible */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="admin-input pl-10 text-sm"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition"
            >
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters - Desktop (always visible) / Mobile (collapsible) */}
        <div className={`
          flex flex-wrap items-center gap-2
          md:flex
          ${showFilters ? 'flex' : 'hidden md:flex'}
        `}>
          <select
            value={filterParent}
            onChange={(e) => setFilterParent(e.target.value)}
            className="admin-select text-sm flex-1 sm:flex-none sm:min-w-[160px]"
          >
            <option value="all">{t.allCategories}</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="admin-select text-sm flex-1 sm:flex-none sm:min-w-[160px]"
          >
            <option value="name">{t.sortByName}</option>
            <option value="price">{t.sortByPrice}</option>
            <option value="minutes">{t.sortByMinutes}</option>
          </select>

          <label className="inline-flex select-none items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm cursor-pointer hover:bg-white/5 transition">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="admin-switch"
            />
            <span className="whitespace-nowrap">{t.onlyActive}</span>
          </label>

          {/* Reset filters button */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilterParent("all");
                setSort("name");
                setOnlyActive(false);
                setQ("");
              }}
              className="text-xs text-white/50 hover:text-white/80 transition underline underline-offset-2"
            >
              {t.reset}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {view === "cards" ? (
        <CardsView
          locale={locale}
          items={filtered}
          parentOptions={parentOptions}
          updateSubservice={updateSubservice}
          deleteSubservice={deleteSubservice}
        />
      ) : (
        <TableView
          locale={locale}
          items={filtered}
          parentOptions={parentOptions}
          updateSubservice={updateSubservice}
          deleteSubservice={deleteSubservice}
        />
      )}
    </section>
  );
}

/* =================== CARDS VIEW =================== */

function CardsView(props: {
  locale: SeoLocale;
  items: Sub[];
  parentOptions: ParentOption[];
  updateSubservice: (formData: FormData) => Promise<ActionResult>;
  deleteSubservice: (formData: FormData) => Promise<ActionResult>;
}) {
  const { locale, items, parentOptions, updateSubservice, deleteSubservice } = props;
  const t = SUBSERVICES_COPY[locale];

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 p-6 sm:p-8 text-center text-white/60">
        <svg className="w-12 h-12 mx-auto mb-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">{t.nothingFound}</p>
        <p className="text-xs text-white/40 mt-1">{t.tryChangingFilters}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {items.map((s) => (
        <article 
          key={s.id} 
          className="admin-card p-3 sm:p-4 lg:p-5 space-y-2.5 sm:space-y-3 hover:border-white/20 transition-colors"
          style={{
            background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 sm:gap-3 pb-2.5 sm:pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm sm:text-base font-semibold text-white truncate">{s.name}</div>
              <div className="text-[10px] sm:text-xs text-white/50 mt-0.5 truncate">{s.parentName}</div>
              <div className="text-[10px] sm:text-xs font-mono text-white/40 mt-0.5 truncate">{s.slug}</div>
            </div>
            {s.isActive ? (
              <span className="tag-active flex-shrink-0 text-[10px]">{t.activeShort}</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-1.5 sm:px-2 py-0.5 text-[10px] text-white/60 flex-shrink-0">
                {t.offShort}
              </span>
            )}
          </div>

          {/* Description */}
          {s.description && (
            <p className="text-xs sm:text-sm text-white/70 line-clamp-2">{s.description}</p>
          )}

          {/* Price & Duration */}
          <div 
            className="flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
          >
            <div>
              <div className="text-[10px] sm:text-xs text-white/50">{t.price}</div>
              <div className="text-sm sm:text-base font-semibold text-amber-400">{euro(s.priceCents, locale)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] sm:text-xs text-white/50">{t.duration}</div>
              <div className="text-sm sm:text-base font-semibold text-cyan-400">{s.durationMin ?? 0} {t.minutesSuffix}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
            <TranslationButton service={s} categoryName={s.parentName} locale={locale} />
            <ServiceEditButton
              service={s}
              parentOptions={parentOptions}
              locale={locale}
              onUpdate={updateSubservice}
              onDelete={deleteSubservice}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

/* =================== TABLE VIEW =================== */

function TableView(props: {
  locale: SeoLocale;
  items: Sub[];
  parentOptions: ParentOption[];
  updateSubservice: (formData: FormData) => Promise<ActionResult>;
  deleteSubservice: (formData: FormData) => Promise<ActionResult>;
}) {
  const { locale, items, parentOptions, updateSubservice, deleteSubservice } = props;
  const t = SUBSERVICES_COPY[locale];

  // Mobile cards for table view on small screens
  const MobileTableCards = () => (
    <div className="lg:hidden space-y-3">
      {items.map((s) => (
        <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{s.name}</div>
              <div className="text-xs text-white/50 truncate">{s.parentName}</div>
            </div>
            {s.isActive ? (
              <span className="tag-active text-[10px]">{t.yes}</span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] text-white/60">
                {t.no}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <span className="text-amber-400 font-semibold">{euro(s.priceCents, locale)}</span>
            <span className="text-cyan-400 font-semibold">{s.durationMin ?? 0} {t.minutesSuffix}</span>
          </div>
          
          {s.description && (
            <p className="text-xs text-white/60 line-clamp-1">{s.description}</p>
          )}
          
          <div className="flex flex-wrap gap-1.5 pt-1">
            <TranslationButton service={s} categoryName={s.parentName} locale={locale} />
            <ServiceEditButton
              service={s}
              parentOptions={parentOptions}
              locale={locale}
              onUpdate={updateSubservice}
              onDelete={deleteSubservice}
            />
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="rounded-xl border border-white/10 p-6 text-center text-white/50 text-sm">
          {t.nothingFound}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile version */}
      <MobileTableCards />
      
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium text-white/70">{t.nameCol}</th>
              <th className="px-3 py-2.5 text-left font-medium text-white/70">{t.categoryCol}</th>
              <th className="px-3 py-2.5 text-right font-medium text-white/70">{t.priceCol}</th>
              <th className="px-3 py-2.5 text-right font-medium text-white/70">{t.minutesCol}</th>
              <th className="px-3 py-2.5 text-center font-medium text-white/70">{t.activeCol}</th>
              <th className="px-3 py-2.5 text-left font-medium text-white/70">{t.descriptionCol}</th>
              <th className="px-3 py-2.5 text-right w-[280px]" />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-white/10 hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-3">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs font-mono text-white/40 mt-0.5">{s.slug}</div>
                </td>
                <td className="px-3 py-3 text-white/70">{s.parentName || "—"}</td>
                <td className="px-3 py-3 text-right font-semibold text-amber-400">{euro(s.priceCents, locale)}</td>
                <td className="px-3 py-3 text-right font-semibold text-cyan-400">{s.durationMin ?? 0}</td>
                <td className="px-3 py-3 text-center">
                  {s.isActive ? (
                    <span className="tag-active">{t.yes}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
                      {t.no}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 max-w-[250px]">
                  <span className="block truncate text-white/60">{s.description ?? "—"}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <TranslationButton service={s} categoryName={s.parentName} locale={locale} />
                    <ServiceEditButton
                      service={s}
                      parentOptions={parentOptions}
                      locale={locale}
                      onUpdate={updateSubservice}
                      onDelete={deleteSubservice}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-white/50" colSpan={7}>
                  {t.nothingFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}






//----------всё работало делаем адаптацию
// // src/app/admin/services/SubservicesPanel.tsx


// "use client";

// import React, { useMemo, useState } from "react";
// import type { ActionResult } from "./actions";
// import { TranslationButton } from './ServicesPageClient';
// import { ServiceEditButton } from './EditButtons';

// type ParentOption = { id: string; name: string };

// type Translation = {
//   locale: string;
//   name: string;
//   description: string | null;
// };

// type Sub = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   durationMin: number | null;
//   priceCents: number | null;
//   isActive: boolean;
//   parentId: string | null;
//   parentName: string;
//   createdAt: string;
//   updatedAt: string;
//   translations: Translation[];
// };

// type ViewMode = "cards" | "table";
// type SortKey = "name" | "price" | "minutes";

// type Props = {
//   parentOptions: ParentOption[];
//   subservices: Sub[];
//   updateSubservice: (formData: FormData) => Promise<ActionResult>;
//   deleteSubservice: (formData: FormData) => Promise<ActionResult>;
// };

// function euro(cents: number | null): string {
//   if (cents === null) return "—";
//   return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "EUR" })
//     .format((cents ?? 0) / 100);
// }

// export default function SubservicesPanel({
//   parentOptions,
//   subservices,
//   updateSubservice,
//   deleteSubservice,
// }: Props) {
//   const [q, setQ] = useState("");
//   const [onlyActive, setOnlyActive] = useState(false);
//   const [sort, setSort] = useState<SortKey>("name");
//   const [view, setView] = useState<ViewMode>("cards");
//   const [filterParent, setFilterParent] = useState("all");

//   const filtered = useMemo<Sub[]>(() => {
//     const query = q.trim().toLowerCase();
//     const list = subservices.filter((s) => {
//       if (onlyActive && !s.isActive) return false;
//       if (filterParent !== "all" && s.parentId !== filterParent) return false;
//       if (!query) return true;
//       const hay = `${s.name} ${s.slug ?? ""} ${s.parentName} ${
//         s.description ?? ""
//       }`.toLowerCase();
//       return hay.includes(query);
//     });

//     list.sort((a, b) => {
//       if (sort === "name") return a.name.localeCompare(b.name);
//       if (sort === "price") return (a.priceCents ?? 0) - (b.priceCents ?? 0);
//       return (a.durationMin ?? 0) - (b.durationMin ?? 0);
//     });

//     return list;
//   }, [subservices, onlyActive, filterParent, q, sort]);

//   return (
//     <section className="admin-section space-y-4">
//       <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <h2 className="text-lg font-medium">Подуслуги</h2>

//         <div className="flex flex-wrap items-center gap-2">
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Поиск по названию, описанию…"
//             className="admin-input min-w-[14rem]"
//           />

//           <select
//             value={filterParent}
//             onChange={(e) => setFilterParent(e.target.value)}
//             className="admin-select"
//           >
//             <option value="all">Все категории</option>
//             {parentOptions.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={sort}
//             onChange={(e) => setSort(e.target.value as SortKey)}
//             className="admin-select"
//           >
//             <option value="name">Сортировать: имя</option>
//             <option value="price">Сортировать: цена</option>
//             <option value="minutes">Сортировать: минуты</option>
//           </select>

//           <label className="inline-flex select-none items-center gap-2 rounded-full border border-white/15 px-3 py-2">
//             <input
//               type="checkbox"
//               checked={onlyActive}
//               onChange={(e) => setOnlyActive(e.target.checked)}
//               className="admin-switch"
//             />
//             Только активные
//           </label>

//           <div className="ml-1 inline-flex rounded-full border border-white/15 p-1">
//             <button
//               type="button"
//               onClick={() => setView("cards")}
//               className={`rounded-full px-3 py-1.5 text-sm transition ${
//                 view === "cards" ? "bg-white/10" : "hover:bg-white/5"
//               }`}
//             >
//               Карточки
//             </button>
//             <button
//               type="button"
//               onClick={() => setView("table")}
//               className={`rounded-full px-3 py-1.5 text-sm transition ${
//                 view === "table" ? "bg-white/10" : "hover:bg-white/5"
//               }`}
//             >
//               Таблица
//             </button>
//           </div>
//         </div>
//       </header>

//       {view === "cards" ? (
//         <CardsView
//           items={filtered}
//           parentOptions={parentOptions}
//           updateSubservice={updateSubservice}
//           deleteSubservice={deleteSubservice}
//         />
//       ) : (
//         <TableView
//           items={filtered}
//           parentOptions={parentOptions}
//           updateSubservice={updateSubservice}
//           deleteSubservice={deleteSubservice}
//         />
//       )}
//     </section>
//   );
// }

// /* =================== CARDS VIEW =================== */

// function CardsView(props: {
//   items: Sub[];
//   parentOptions: ParentOption[];
//   updateSubservice: (formData: FormData) => Promise<ActionResult>;
//   deleteSubservice: (formData: FormData) => Promise<ActionResult>;
// }) {
//   const { items, parentOptions, updateSubservice, deleteSubservice } = props;

//   if (items.length === 0) {
//     return (
//       <div className="rounded-xl border border-white/10 p-6 text-center text-white/60">
//         Ничего не найдено
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//       {items.map((s) => (
//         <article 
//           key={s.id} 
//           className="admin-card p-5 space-y-3"
//           style={{
//             background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
//           }}
//         >
//           {/* Header */}
//           <div className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
//             <div className="flex-1">
//               <div className="text-base font-semibold text-white">{s.name}</div>
//               <div className="text-xs text-white/50 mt-0.5">{s.parentName}</div>
//               <div className="text-xs font-mono text-white/40 mt-0.5">{s.slug}</div>
//             </div>
//             {s.isActive ? (
//               <span className="tag-active flex-shrink-0">активна</span>
//             ) : (
//               <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60 flex-shrink-0">
//                 выкл
//               </span>
//             )}
//           </div>

//           {/* Description */}
//           {s.description && (
//             <p className="text-sm text-white/70 line-clamp-2">{s.description}</p>
//           )}

//           {/* Price & Duration */}
//           <div 
//             className="flex items-center justify-between px-3 py-2 rounded-lg"
//             style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
//           >
//             <div>
//               <div className="text-xs text-white/50">Цена</div>
//               <div className="font-semibold text-amber-400">{euro(s.priceCents)}</div>
//             </div>
//             <div className="text-right">
//               <div className="text-xs text-white/50">Длительность</div>
//               <div className="font-semibold text-cyan-400">{s.durationMin ?? 0} мин</div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-2 pt-2">
//             <TranslationButton service={s} categoryName={s.parentName} />
//             <ServiceEditButton
//               service={s}
//               parentOptions={parentOptions}
//               onUpdate={updateSubservice}
//               onDelete={deleteSubservice}
//             />
//           </div>
//         </article>
//       ))}
//     </div>
//   );
// }

// /* =================== TABLE VIEW =================== */

// function TableView(props: {
//   items: Sub[];
//   parentOptions: ParentOption[];
//   updateSubservice: (formData: FormData) => Promise<ActionResult>;
//   deleteSubservice: (formData: FormData) => Promise<ActionResult>;
// }) {
//   const { items, parentOptions, updateSubservice, deleteSubservice } = props;

//   return (
//     <div className="overflow-x-auto rounded-xl border border-white/10">
//       <table className="table">
//         <thead className="thead">
//           <tr>
//             <th className="th">Название</th>
//             <th className="th">Категория</th>
//             <th className="th text-right">Цена</th>
//             <th className="th text-right">Мин</th>
//             <th className="th text-center">Активна</th>
//             <th className="th">Описание</th>
//             <th className="th text-right" style={{ width: 320 }} />
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((s) => (
//             <tr key={s.id} className="row">
//               <td className="td">
//                 <div className="font-medium">{s.name}</div>
//                 <div className="text-xs font-mono text-white/40 mt-0.5">{s.slug}</div>
//               </td>
//               <td className="td">{s.parentName || "—"}</td>
//               <td className="td text-right font-semibold text-amber-400">{euro(s.priceCents)}</td>
//               <td className="td text-right font-semibold text-cyan-400">{s.durationMin ?? 0}</td>
//               <td className="td text-center">
//                 {s.isActive ? (
//                   <span className="tag-active">Да</span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                     Нет
//                   </span>
//                 )}
//               </td>
//               <td className="td max-w-[32rem]">
//                 <span className="block truncate text-white/70">{s.description ?? "—"}</span>
//               </td>
//               <td className="td">
//                 <div className="flex items-center justify-end gap-2">
//                   <TranslationButton service={s} categoryName={s.parentName} />
//                   <ServiceEditButton
//                     service={s}
//                     parentOptions={parentOptions}
//                     onUpdate={updateSubservice}
//                     onDelete={deleteSubservice}
//                   />
//                 </div>
//               </td>
//             </tr>
//           ))}

//           {items.length === 0 && (
//             <tr>
//               <td className="td py-6 text-center text-white/50" colSpan={7}>
//                 Ничего не найдено
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }
