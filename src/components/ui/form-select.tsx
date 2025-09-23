"use client";

import * as RSelect from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { useId, useState } from "react";
import clsx from "clsx";

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  /** name нужен, чтобы значение ушло в FormData */
  name?: string;
  /** подпись над полем (необязательно) */
  label?: string;
  /** плейсхолдер внутри поля */
  placeholder?: string;
  /** список опций */
  options: Option[];
  /** начальное значение */
  defaultValue?: string;
  /** обязательно к выбору */
  required?: boolean;
  /** доп. классы на контейнер */
  className?: string;
};

export default function FormSelect({
  name,
  label,
  placeholder = "Выберите…",
  options,
  defaultValue,
  required,
  className,
}: Props) {
  const id = useId();
  const [value, setValue] = useState<string>(defaultValue ?? "");

  return (
    <div className={clsx("w-full space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm text-gray-600 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* скрытое поле, чтобы значение попало в submit */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
          // если нужно заставить выбрать не-пустое значение
          // pattern=".+"
        />
      )}

      <RSelect.Root
        value={value}
        onValueChange={setValue}
        defaultValue={defaultValue}
      >
        <RSelect.Trigger
          id={id}
          aria-label={label ?? placeholder}
          className={clsx(
            "flex h-11 w-full items-center justify-between",
            "rounded-xl border border-gray-300 dark:border-gray-700",
            "bg-white/95 text-gray-900",
            "dark:bg-slate-900 dark:text-gray-100",
            "px-3 shadow-sm outline-none",
            "data-[placeholder]:text-gray-400",
            "focus-visible:ring-2 focus-visible:ring-sky-400/50"
          )}
        >
          <RSelect.Value placeholder={placeholder} />
          <RSelect.Icon className="ml-2 text-gray-400">
            <ChevronDown size={18} />
          </RSelect.Icon>
        </RSelect.Trigger>

        <RSelect.Portal>
          <RSelect.Content
            className={clsx(
              "z-50 overflow-hidden rounded-xl border",
              "border-gray-200 bg-white shadow-xl",
              "dark:border-gray-800 dark:bg-slate-900"
            )}
            position="popper"
            sideOffset={6}
          >
            <RSelect.Viewport className="max-h-60 min-w-[var(--radix-select-trigger-width)] p-1">
              {options.map((opt) => (
                <RSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={clsx(
                    "flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2",
                    "text-sm text-gray-900 dark:text-gray-100",
                    "data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-slate-800",
                    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
                    "outline-none"
                  )}
                >
                  <RSelect.ItemIndicator className="text-sky-500">
                    <Check size={16} />
                  </RSelect.ItemIndicator>
                  <RSelect.ItemText>{opt.label}</RSelect.ItemText>
                </RSelect.Item>
              ))}
            </RSelect.Viewport>
          </RSelect.Content>
        </RSelect.Portal>
      </RSelect.Root>
    </div>
  );
}
