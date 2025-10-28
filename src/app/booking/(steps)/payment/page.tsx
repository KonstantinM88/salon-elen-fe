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
      const r = await pay({ method, draftId });
      if (!r.ok) throw new Error(r.error);

      // успех — на страницу успеха
      router.replace("/booking/success");
    } catch (e) {
      const text = e instanceof Error ? e.message : "Не удалось завершить оплату";
      setMsg(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Оплата бронирования</h1>

      <div className="rounded-2xl ring-1 ring-black/10 p-4 bg-white/70 dark:bg-neutral-800/60 space-y-3">
        <div className="text-sm text-white/70">
          Черновик: <b>{draftId || "—"}</b>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="pay"
              checked={method === "cash"}
              onChange={() => setMethod("cash")}
            />
            Наличные в салоне
          </label>

          <label className="flex items-center gap-2 opacity-60">
            <input
              type="radio"
              name="pay"
              disabled
              checked={method === "card"}
              onChange={() => setMethod("card")}
            />
            Банковская карта (скоро)
          </label>

          <label className="flex items-center gap-2 opacity-60">
            <input
              type="radio"
              name="pay"
              disabled
              checked={method === "paypal"}
              onChange={() => setMethod("paypal")}
            />
            PayPal (скоро)
          </label>
        </div>

        {msg && <div className="text-sm text-red-600">{msg}</div>}

        <div className="flex justify-end">
          <button
            onClick={onPay}
            disabled={!draftId || busy}
            className="rounded-full bg-black text-white px-5 py-2 disabled:opacity-50"
          >
            {busy ? "Обрабатываем…" : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
}
