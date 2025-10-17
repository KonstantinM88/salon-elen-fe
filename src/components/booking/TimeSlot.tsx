// src/components/booking/TimeSlot.tsx
"use client";

import React, { JSX } from "react";

export interface TimeSlotProps {
  label: string;       // "13:00—14:00"
  isSelected: boolean;
  onSelect: () => void;
}

export default function TimeSlot({
  label,
  isSelected,
  onSelect,
}: TimeSlotProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-sm transition",
        "cursor-pointer hover:ring-2",
        isSelected ? "ring-2 ring-offset-2" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
