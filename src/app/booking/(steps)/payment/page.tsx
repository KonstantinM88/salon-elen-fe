// src/app/booking/(steps)/payment/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pay } from "../../actions";

export const dynamic = "force-dynamic";

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-white/60">Загрузка оплаты…</div>}>
      <PaymentInner />
    </Suspense>
  );
}

function PaymentInner() {
  const router = useRouter();
  const sp = useSearchParams();

  // из query прилетает черновик
  const draftId = sp.get("draft") ?? "";
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [method, setMethod] = useState<"cash" | "card" | "paypal">("cash");

  const onPay = async () => {
    setMsg(null);
    setBusy(true);
    try {
      if (!draftId) throw new Error("Черновик не найден (draft)");

      // Для карт и PayPal показываем сообщение о разработке
      if (method === "card") {
        setMsg("Оплата картой будет доступна в ближайшее время. Пожалуйста, выберите наличные.");
        setBusy(false);
        return;
      }

      if (method === "paypal") {
        setMsg("Оплата через PayPal будет доступна в ближайшее время. Пожалуйста, выберите наличные.");
        setBusy(false);
        return;
      }

      const r = await pay({ method, draftId });
      if (!r.ok) throw new Error(r.error);

      // успех — на страницу успеха
      router.replace(`/booking/success?draft=${encodeURIComponent(draftId)}`);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Не удалось завершить оплату";
      setMsg(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Оплата</h2>

      <div className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">

        <div className="space-y-3">
          <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 cursor-pointer transition hover:border-indigo-300">
            <input
              type="radio"
              name="pay"
              checked={method === "cash"}
              onChange={() => setMethod("cash")}
              className="size-5"
            />
            <div className="flex-1">
              <div className="font-medium">Наличные в салоне</div>
              <div className="text-sm text-muted-foreground">Оплата при посещении</div>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 cursor-pointer transition hover:border-indigo-300">
            <input
              type="radio"
              name="pay"
              checked={method === "card"}
              onChange={() => setMethod("card")}
              className="size-5"
            />
            <div className="flex-1">
              <div className="font-medium">Банковская карта</div>
              <div className="text-sm text-muted-foreground">Оплата через Stripe (в разработке)</div>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 cursor-pointer transition hover:border-indigo-300">
            <input
              type="radio"
              name="pay"
              checked={method === "paypal"}
              onChange={() => setMethod("paypal")}
              className="size-5"
            />
            <div className="flex-1">
              <div className="font-medium">PayPal</div>
              <div className="text-sm text-muted-foreground">Оплата через PayPal (в разработке)</div>
            </div>
          </label>
        </div>

        {msg && (
          <div className="rounded-lg border border-amber-500 bg-amber-50 dark:bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300 text-sm">
            ℹ️ {msg}
          </div>
        )}

        <button
          onClick={onPay}
          disabled={!draftId || busy}
          className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Обрабатываем…" : "Подтвердить оплату"}
        </button>
      </div>

      {/* Нижняя панель навигации */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Назад
          </button>

          <div className="text-sm text-muted-foreground">
            Шаг 6 из 6
          </div>
        </div>
      </div>
    </div>
  );
}
