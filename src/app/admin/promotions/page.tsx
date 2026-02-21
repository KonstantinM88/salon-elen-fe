// src/app/admin/promotions/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createPromotion, deletePromotion, listPromotions } from "./server";
import { isSeoLocale, type SeoLocale } from "@/lib/seo-locale";

type PromotionForm = {
  title: string;
  percent: number;
  from: string;
  to: string;
  isGlobal: boolean;
  serviceIds: string[];
};

type PromotionRow = PromotionForm & { id: string };

type PromotionsCopy = {
  title: string;
  titlePlaceholder: string;
  percentPlaceholder: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  allServices: string;
  save: string;
  allServicesBadge: string;
  remove: string;
};

const PROMOTIONS_COPY: Record<SeoLocale, PromotionsCopy> = {
  de: {
    title: "Aktionen (Rabatte)",
    titlePlaceholder: "Titel",
    percentPlaceholder: "%",
    fromPlaceholder: "von YYYY-MM-DD",
    toPlaceholder: "bis YYYY-MM-DD",
    allServices: "Fuer alle Services",
    save: "Speichern",
    allServicesBadge: "(alle Services)",
    remove: "Loeschen",
  },
  ru: {
    title: "Акции (скидки)",
    titlePlaceholder: "Название",
    percentPlaceholder: "%",
    fromPlaceholder: "с YYYY-MM-DD",
    toPlaceholder: "по YYYY-MM-DD",
    allServices: "На все услуги",
    save: "Сохранить",
    allServicesBadge: "(все услуги)",
    remove: "Удалить",
  },
  en: {
    title: "Promotions (discounts)",
    titlePlaceholder: "Title",
    percentPlaceholder: "%",
    fromPlaceholder: "from YYYY-MM-DD",
    toPlaceholder: "to YYYY-MM-DD",
    allServices: "For all services",
    save: "Save",
    allServicesBadge: "(all services)",
    remove: "Delete",
  },
};

function getCookieLocale(): SeoLocale | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith("locale="));
  if (!parts) return null;
  const raw = decodeURIComponent(parts.slice("locale=".length));
  return isSeoLocale(raw) ? raw : null;
}

export default function PromotionsAdminPage() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<SeoLocale>("de");
  const [items, setItems] = useState<PromotionRow[]>([]);
  const [form, setForm] = useState<PromotionForm>({
    title: "",
    percent: 10,
    from: "",
    to: "",
    isGlobal: false,
    serviceIds: [],
  });

  useEffect(() => {
    const lang = searchParams.get("lang");
    if (isSeoLocale(lang)) {
      setLocale(lang);
      return;
    }
    const cookieLocale = getCookieLocale();
    if (cookieLocale) {
      setLocale(cookieLocale);
    } else {
      setLocale("de");
    }
  }, [searchParams]);

  const t = useMemo(() => PROMOTIONS_COPY[locale], [locale]);

  const load = async () => {
    const r = await listPromotions();
    if (r.ok) setItems(r.data as PromotionRow[]);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t.title}</h1>

      <div className="rounded-2xl p-4 ring-1 ring-black/10 bg-white/70 dark:bg-neutral-800/60">
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded-xl ring-1 ring-black/10 px-3 py-2" placeholder={t.titlePlaceholder}
                 value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
          <input className="rounded-xl ring-1 ring-black/10 px-3 py-2" placeholder={t.percentPlaceholder}
                 type="number" min={1} max={100}
                 value={form.percent} onChange={(e)=>setForm({...form,percent:Number(e.target.value)})}/>
          <input className="rounded-xl ring-1 ring-black/10 px-3 py-2" placeholder={t.fromPlaceholder}
                 value={form.from} onChange={(e)=>setForm({...form,from:e.target.value})}/>
          <input className="rounded-xl ring-1 ring-black/10 px-3 py-2" placeholder={t.toPlaceholder}
                 value={form.to} onChange={(e)=>setForm({...form,to:e.target.value})}/>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isGlobal}
                   onChange={(e)=>setForm({...form,isGlobal:e.target.checked})}/>
            {t.allServices}
          </label>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            className="rounded-full bg-black text-white px-4 py-2"
            onClick={async()=>{
              const r = await createPromotion(form, locale);
              if (r.ok) {
                setForm({ title:"", percent:10, from:"", to:"", isGlobal:false, serviceIds:[] });
                void load();
              }
            }}
          >
            {t.save}
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {items.map((p)=> (
          <div key={p.id} className="rounded-xl ring-1 ring-black/10 p-3 flex items-center justify-between bg-white/70 dark:bg-neutral-800/60">
            <div>
              <div className="font-medium">{p.title} — {p.percent}% {p.isGlobal ? t.allServicesBadge : ""}</div>
              <div className="text-sm opacity-70">{p.from} — {p.to}</div>
            </div>
            <button className="text-red-600" onClick={async()=>{ await deletePromotion(p.id); void load(); }}>{t.remove}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
