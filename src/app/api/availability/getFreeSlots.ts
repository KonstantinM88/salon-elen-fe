// Серверная версия getFreeSlots — без зависимостей и без any.
// Алгоритм:
// 1) Нормализуем все окна (рабочие/тайм-офф/занято) в миллисекунды.
// 2) Вычитаем из рабочих окон объединённые «запретные» интервалы (busy ⊔ timeOff).
// 3) Идём шагом stepMin и проверяем, что [t, t+duration) полностью лежит в разрешённом окне.
// 4) ВАЖНО: отсекаем прошлое через nowUtcISO ТОЛЬКО если этот now находится в пределах текущего дня.

type Iso = string;

export type WindowUtc = {
  start: Iso; // ISO в UTC
  end: Iso;   // ISO в UTC
};

export type GetFreeSlotsArgs = {
  dayStartUtcISO: Iso;
  dayEndUtcISO: Iso;
  workingWindowsUtc: WindowUtc[];
  timeOffWindowsUtc: WindowUtc[];
  busyWindowsUtc: WindowUtc[];
  durationMin: number;  // длительность услуги в минутах
  stepMin: number;      // шаг дискретизации в минутах
  tz: string;           // орг. TZ (на будущее, сейчас не используем)
  nowUtcISO: Iso;       // «сейчас» (UTC-ISO) — используется только для сегодняшнего дня
};

export type SlotISO = Iso;

/** Главная функция */
export function getFreeSlots(args: GetFreeSlotsArgs): SlotISO[] {
  const {
    dayStartUtcISO,
    dayEndUtcISO,
    workingWindowsUtc,
    timeOffWindowsUtc,
    busyWindowsUtc,
    durationMin,
    stepMin,
    nowUtcISO,
  } = args;

  // ── 0) Вспомогательные преобразования
  const toMs = (iso: Iso) => new Date(iso).getTime();

  const dayStart = toMs(dayStartUtcISO);
  const dayEnd   = toMs(dayEndUtcISO);

  const nowRaw  = new Date(nowUtcISO).getTime();
  // Применяем now для отсечения прошлого ТОЛЬКО если он попадает внутрь рассматриваемого дня.
  const useNow  = nowRaw >= dayStart && nowRaw < dayEnd;
  const stepMs     = stepMin    * 60_000;
  const durationMs = durationMin * 60_000;

  // Нормализуем окна
  const work = normalizeWindows(workingWindowsUtc, dayStart, dayEnd, toMs);
  const busy = normalizeWindows(
    [...busyWindowsUtc, ...timeOffWindowsUtc],
    dayStart,
    dayEnd,
    toMs,
  );

  // Сольём busy в непересекающееся объединение
  const busyUnion = unionIntervals(busy);

  // Вычтем busy из work → получим «разрешённые» окна
  const allowed = subtractMany(work, busyUnion);

  // ── 1) Сгенерируем тайм-слоты
  const slots: SlotISO[] = [];
  for (const [aStart, aEnd] of allowed) {
    // если «сейчас» относится к этому дню — не предлагать прошлое, иначе не трогаем
    const scanStart = useNow ? Math.max(aStart, alignUp(nowRaw, stepMs)) : aStart;

    for (let t = alignUp(scanStart, stepMs); t + durationMs <= aEnd; t += stepMs) {
      slots.push(new Date(t).toISOString());
    }
  }

  return slots;
}

// ────────────────────────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────────────────────────

function alignUp(x: number, step: number) {
  const r = x % step;
  return r === 0 ? x : x + (step - r);
}

/** Приводит ISO-окна к числовым отрезкам [start,end) и ограничивает их днём. */
function normalizeWindows(
  list: WindowUtc[],
  dayStart: number,
  dayEnd: number,
  toMs: (iso: Iso) => number
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (const w of list) {
    const s = Math.max(dayStart, toMs(w.start));
    const e = Math.min(dayEnd,   toMs(w.end));
    if (Number.isFinite(s) && Number.isFinite(e) && e > s) {
      out.push([s, e]);
    }
  }
  out.sort((a, b) => a[0] - b[0]);
  return out;
}

/** Объединение пересекающихся интервалов. */
function unionIntervals(list: Array<[number, number]>): Array<[number, number]> {
  if (list.length <= 1) return list.slice();

  const sorted = list.slice().sort((a, b) => a[0] - b[0]);
  const res: Array<[number, number]> = [];
  let [cs, ce] = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const [s, e] = sorted[i];
    if (s <= ce) {
      ce = Math.max(ce, e);
    } else {
      res.push([cs, ce]);
      [cs, ce] = [s, e];
    }
  }
  res.push([cs, ce]);
  return res;
}

/** Разность «положительных» интервалов и «запрещённых» (union уже сделан). */
function subtractMany(
  positives: Array<[number, number]>,
  negatives: Array<[number, number]>
): Array<[number, number]> {
  if (negatives.length === 0) return positives.slice();

  const out: Array<[number, number]> = [];
  for (const [ps, pe] of positives) {
    let curStart = ps;
    const curEnd = pe;

    for (const [ns, ne] of negatives) {
      if (ne <= curStart || ns >= curEnd) continue;

      if (ns > curStart) out.push([curStart, Math.min(ns, curEnd)]);
      curStart = Math.max(curStart, ne);
      if (curStart >= curEnd) break;
    }

    if (curStart < curEnd) out.push([curStart, curEnd]);
  }
  return out.filter(([s, e]) => e > s);
}






// // src/app/api/availability/getFreeSlots.ts

// export type Iso = string;

// export type WindowUtc = {
//   start: Iso; // ISO-строка UTC начала интервала (включительно)
//   end: Iso;   // ISO-строка UTC конца интервала (исключительно)
// };

// export type GetFreeSlotsArgs = {
//   dayStartUtcISO: Iso;           // UTC-ISO начала дня
//   dayEndUtcISO: Iso;             // UTC-ISO конца дня
//   workingWindowsUtc: WindowUtc[]; // рабочие интервалы мастера в этот день
//   timeOffWindowsUtc: WindowUtc[]; // отпуска/перерывы мастера в этот день
//   busyWindowsUtc: WindowUtc[];    // занятые интервалы (подтверждённые/ожидающие записи)
//   durationMin: number;           // длительность услуги
//   stepMin: number;               // шаг генерации слотов (минуты)
//   tz: string;                    // TZ салона (для логики здесь не нужен, оставлен для совместимости)
//   nowUtcISO?: Iso;               // если передан — отрезаем прошлое (например, для "сегодня")
// };

// export type Slot = {
//   startISO: Iso;
//   endISO: Iso;
// };

// /* ==================== helpers ==================== */

// const toMs = (iso: Iso) => new Date(iso).getTime();
// const toISO = (ms: number) => new Date(ms).toISOString();

// type MsWindow = { s: number; e: number };

// // нормализуем окна: приводим к [s, e), пересекаем с днём, отбрасываем пустые, сортируем
// function normalize(windows: WindowUtc[], day: MsWindow): MsWindow[] {
//   const list = windows
//     .map(w => ({ s: Math.max(toMs(w.start), day.s), e: Math.min(toMs(w.end), day.e) }))
//     .filter(w => Number.isFinite(w.s) && Number.isFinite(w.e) && w.e > w.s)
//     .sort((a, b) => a.s - b.s);

//   // склеиваем пересекающиеся/соприкасающиеся
//   const merged: MsWindow[] = [];
//   for (const w of list) {
//     if (!merged.length || w.s > merged[merged.length - 1].e) {
//       merged.push({ ...w });
//     } else {
//       merged[merged.length - 1].e = Math.max(merged[merged.length - 1].e, w.e);
//     }
//   }
//   return merged;
// }

// // вычесть из allowed список blocked, вернуть «разрешённые» интервалы
// function subtract(allowed: MsWindow[], blocked: MsWindow[]): MsWindow[] {
//   if (!allowed.length || !blocked.length) return allowed.slice();

//   const result: MsWindow[] = [];
//   let bIdx = 0;

//   for (const a of allowed) {
//     let cur: MsWindow[] = [{ ...a }];

//     while (bIdx < blocked.length && blocked[bIdx].e <= a.s) bIdx++;

//     let i = bIdx;
//     for (; i < blocked.length && blocked[i].s < a.e; i++) {
//       const bl = blocked[i];
//       const next: MsWindow[] = [];
//       for (const seg of cur) {
//         // нет пересечения
//         if (bl.e <= seg.s || bl.s >= seg.e) {
//           next.push(seg);
//           continue;
//         }
//         // слева кусок
//         if (bl.s > seg.s) next.push({ s: seg.s, e: Math.max(seg.s, Math.min(bl.s, seg.e)) });
//         // справа кусок
//         if (bl.e < seg.e) next.push({ s: Math.max(seg.s, Math.min(bl.e, seg.e)), e: seg.e });
//       }
//       cur = next;
//       if (!cur.length) break;
//     }

//     for (const seg of cur) if (seg.e > seg.s) result.push(seg);
//   }

//   return result;
// }

// // округление времени вверх к сетке step, относительно dayStart
// function ceilToStep(ms: number, dayStart: number, stepMin: number): number {
//   const stepMs = stepMin * 60000;
//   const delta = ms - dayStart;
//   const k = Math.ceil(delta / stepMs);
//   return dayStart + Math.max(0, k) * stepMs;
// }

// /* ==================== main ==================== */

// export function getFreeSlots(args: GetFreeSlotsArgs): Slot[] {
//   const {
//     dayStartUtcISO,
//     dayEndUtcISO,
//     workingWindowsUtc,
//     timeOffWindowsUtc,
//     busyWindowsUtc,
//     durationMin,
//     stepMin,
//     nowUtcISO,
//   } = args;

//   const day: MsWindow = { s: toMs(dayStartUtcISO), e: toMs(dayEndUtcISO) };
//   const durationMs = Math.max(1, durationMin) * 60000;
//   const step = Math.max(1, stepMin);

//   // 1) нормализуем окна
//   const working = normalize(workingWindowsUtc, day);
//   const breaks = normalize(timeOffWindowsUtc, day);
//   const busy = normalize(busyWindowsUtc, day);

//   // 2) вычитаем перерывы и занятости
//   const afterBreaks = subtract(working, breaks);
//   const freeWindows = subtract(afterBreaks, busy);

//   // 3) режем на слоты с шагом step, учитывая nowUtc (отрезаем прошлое)
//   const nowCut = nowUtcISO ? Math.max(toMs(nowUtcISO), day.s) : day.s;

//   const slots: Slot[] = [];
//   for (const w of freeWindows) {
//     // учитываем текущий момент
//     const startBound = Math.max(w.s, nowCut);
//     // выравниваем по сетке
//     let t = ceilToStep(startBound, day.s, step);

//     while (t + durationMs <= w.e) {
//       slots.push({ startISO: toISO(t), endISO: toISO(t + durationMs) });
//       t += step * 60000;
//     }
//   }

//   return slots;
// }

// export default getFreeSlots;
