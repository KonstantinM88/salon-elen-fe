// src/app/admin/promotions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createPromotion, deletePromotion, listPromotions } from "./server";

type PromotionForm = {
  title: string;
  percent: number;
  from: string;
  to: string;
  isGlobal: boolean;
  serviceIds: string[];
};

type PromotionRow = PromotionForm & { id: string };

export default function PromotionsAdminPage() {
  const [items, setItems] = useState<PromotionRow[]>([]);
  const [form, setForm] = useState<PromotionForm>({
    title: "",
    percent: 10,
    from: "",
    to: "",
    isGlobal: false,
    serviceIds: [],
  });

  const load = async () => {
    const r = await listPromotions();
    if (r.ok) setItems(r.data as PromotionRow[]);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Акции (скидки)</h1>

      <div className="rounded-2xl p-4 ring-1 ring-black/10 bg-white/70 dark:bg-neutral-800/60">
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded-xl ring-1 ring-black/10 px-3 py-2" placeholder="Название"
                 value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
          <input className="rounded-xl ring-1 ring-black/10 px-3 py-2" placeholder="%"
                 type="number" min={1} max={100}
                 value={form.percent} onChange={(e)=>setForm({...form,percent:Number(e.target.value)})}/>
          <input className="rounded-xl ring-1 ring-black/10 px-3 py-2" placeholder="c YYYY-MM-DD"
                 value={form.from} onChange={(e)=>setForm({...form,from:e.target.value})}/>
          <input className="rounded-xl ring-1 ring-black/10 px-3 py-2" placeholder="по YYYY-MM-DD"
                 value={form.to} onChange={(e)=>setForm({...form,to:e.target.value})}/>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isGlobal}
                   onChange={(e)=>setForm({...form,isGlobal:e.target.checked})}/>
            На все услуги
          </label>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            className="rounded-full bg-black text-white px-4 py-2"
            onClick={async()=>{
              const r = await createPromotion(form);
              if (r.ok) {
                setForm({ title:"", percent:10, from:"", to:"", isGlobal:false, serviceIds:[] });
                void load();
              }
            }}
          >
            Сохранить
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {items.map((p)=> (
          <div key={p.id} className="rounded-xl ring-1 ring-black/10 p-3 flex items-center justify-between bg-white/70 dark:bg-neutral-800/60">
            <div>
              <div className="font-medium">{p.title} — {p.percent}% {p.isGlobal ? "(все услуги)" : ""}</div>
              <div className="text-sm opacity-70">{p.from} — {p.to}</div>
            </div>
            <button className="text-red-600" onClick={async()=>{ await deletePromotion(p.id); void load(); }}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
}
