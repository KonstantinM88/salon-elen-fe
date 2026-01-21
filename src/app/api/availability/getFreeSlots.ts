// src/app/api/availability/getFreeSlots.ts
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