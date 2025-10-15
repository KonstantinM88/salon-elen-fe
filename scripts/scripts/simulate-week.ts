// scripts/scripts/simulate-week.ts
import '../_env';
import { assertEnv } from '../_env';
assertEnv();

// В Node 18+ fetch глобальный — импортов не требуется.

type Slot = { start: string; end: string };

type DaySummary = {
  dateISO: string;
  tried: number;
  ok: number;
  fail: number;
  notes: string[];
};

type SimSummary = {
  attempts: number;
  success: number;
  failed: number;
  perDay: DaySummary[];
};

function env(k: string, def?: string): string {
  const v = process.env[k] ?? def;
  if (v == null) throw new Error(`ENV ${k} is required`);
  return v;
}

function pick<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

async function getSlots(
  baseUrl: string,
  dateISO: string,
  masterId: string,
  serviceSlug: string
): Promise<Slot[]> {
  const u = new URL('/api/availability', baseUrl);
  u.searchParams.set('serviceSlug', serviceSlug);
  u.searchParams.set('dateISO', dateISO);
  u.searchParams.set('masterId', masterId);

  const res = await fetch(u.toString(), { method: 'GET' });
  if (!res.ok) throw new Error(`availability ${res.status}`);
  const data = (await res.json()) as Slot[] | { slots?: Slot[] };
  // поддержим оба формата (["{start,end}"] или {slots:[...]} )
  const slots: Slot[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { slots?: Slot[] }).slots)
    ? ((data as { slots: Slot[] }).slots)
    : [];
  return slots;
}

type BookingPayload = {
  serviceSlug: string;
  masterId: string;
  startISO: string;
  customerName: string;
  phone?: string;
  email?: string;
  notes?: string;
};

type BookingResponse =
  | { id: string }
  | { ok?: boolean; id?: string; error?: string }
  | Record<string, unknown>;

async function postBooking(baseUrl: string, payload: BookingPayload): Promise<string> {
  const u = new URL('/booking', baseUrl);
  const res = await fetch(u.toString(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`booking ${res.status} ${text}`);
  }

  const data = (await res.json()) as BookingResponse;

  // Строго требуем id
  const id =
    (data as { id?: string }).id ??
    (typeof (data as { ok?: unknown }).ok === 'boolean' ? (data as { id?: string }).id : undefined);

  if (!id) {
    throw new Error(`booking ok, but no id in response: ${JSON.stringify(data)}`);
  }
  return id;
}

function isoRangeDays(startISO: string, endISO: string): string[] {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const days: string[] = [];
  for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const START_ISO = process.argv[2] ?? env('START_ISO', '2025-11-03');
  const END_ISO = process.argv[3] ?? env('END_ISO', '2025-11-07');
  const MASTER_ID = process.argv[4] ?? env('MASTER_ID');
  const SERVICE_SLUG = process.argv[5] ?? env('SERVICE_SLUG', 'manikur-02');

  const BASE_URL = env('BASE_URL', 'http://localhost:3000');
  const MAX_BOOKS_PER_DAY = Number(env('MAX_BOOKS_PER_DAY', '3'));
  const BOOK_PROB = Number(env('BOOK_PROB', '0.6')); // вероятность участвовать в симуляции за день
  const BETWEEN_BOOK_DELAY_MS = Number(env('BETWEEN_BOOK_DELAY_MS', '200')); // мелкая пауза между постами

  // лог параметров
  console.log(
    JSON.stringify(
      {
        params: { START_ISO, END_ISO, MASTER_ID, SERVICE_SLUG, BASE_URL },
      },
      null,
      2,
    ),
  );

  const days = isoRangeDays(START_ISO, END_ISO);
  const summary: SimSummary = {
    attempts: 0,
    success: 0,
    failed: 0,
    perDay: days.map((d) => ({ dateISO: d, tried: 0, ok: 0, fail: 0, notes: [] })),
  };

  for (const day of days) {
    const bucket = summary.perDay.find((x) => x.dateISO === day)!;

    if (Math.random() > BOOK_PROB) {
      bucket.notes.push('skip (no slots or prob)');
      continue;
    }

    const slots = await getSlots(BASE_URL, day, MASTER_ID, SERVICE_SLUG);

    // Чтобы не брать один и тот же слот дважды, перемешаем копию массива
    const shuffled = [...slots].sort(() => Math.random() - 0.5);

    for (const slot of shuffled.slice(0, Math.min(MAX_BOOKS_PER_DAY, shuffled.length))) {
      bucket.tried += 1;
      summary.attempts += 1;

      try {
        const id = await postBooking(BASE_URL, {
          serviceSlug: SERVICE_SLUG,
          masterId: MASTER_ID,
          startISO: slot.start,
          customerName: 'Sim Bot',
          phone: '+1000000000',
          email: 'sim@example.com',
          notes: `auto`,
        });

        bucket.ok += 1;
        summary.success += 1;

        // короткая пауза, чтобы не заспамить сервер
        if (BETWEEN_BOOK_DELAY_MS > 0) {
          await sleep(BETWEEN_BOOK_DELAY_MS);
        }

        // лог успешного id — удобно для отладки
        console.log(JSON.stringify({ booked: { day, start: slot.start, id } }));
      } catch (e) {
        bucket.fail += 1;
        summary.failed += 1;
        const msg = e instanceof Error ? e.message : String(e);
        bucket.notes.push(msg);
      }
    }
  }

  console.log(JSON.stringify({ summary }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
