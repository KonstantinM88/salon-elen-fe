// src/components/layout/BookingAnimatedBackground.tsx
import React from "react";

export function BookingAnimatedBackground() {
  return (
    // z-0: фон поверх bg-black родителя, но под контентом (z-10)
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* базовый тёмный градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-black" />

      {/* центральное “солнце” за заголовком */}
      <div className="booking-spotlight" />

      {/* вращающиеся лучи */}
      <div className="booking-rays" />

      {/* световые облака по бокам */}
      <div className="booking-blob-left" />
      <div className="booking-blob-right" />
    </div>
  );
}