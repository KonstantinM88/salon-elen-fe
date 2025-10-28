// src/lib/types/booking.ts

export type MoneyCents = number & { readonly brand: unique symbol };

// ===== Клиентские состояния визарда =====
export type Basket = {
  serviceIds: string[];          // не более 2-х услуг
  totalMin: number;              // сумма минут
  totalCents: MoneyCents;        // сумма до скидок
  discountCents: MoneyCents;     // общая скидка
  payableCents: MoneyCents;      // к оплате (после скидки)
};

export type Selection = {
  masterId?: string;
  dateISO?: string;  // YYYY-MM-DD (Europe/Berlin)
  startAt?: string;  // ISO UTC
};

export type VerificationChannel = "email" | "google" | "telegram" | "whatsapp";

export type Verification = {
  channel?: VerificationChannel;
  ok?: boolean;
};

// ===== Универсальный контракт server actions =====
export type ActionOk<T = undefined> = T extends undefined
  ? { ok: true }
  : { ok: true; data: T };

export type ActionErr = { ok: false; error: string };

export type ActionResult<T = undefined> = ActionOk<T> | ActionErr;

// ===== DTO =====
export type ServiceDTO = {
  id: string;
  title: string;
  excerpt?: string | null;
  durationMin: number;
  priceCents: MoneyCents;
  categoryId: string;
  categoryName?: string | null;
  isPromo?: boolean;
};

export type CategoryDTO = {
  id: string;
  name: string;
  children: ServiceDTO[];
};

export type ServicesFlat = {
  promotions: ServiceDTO[];
  categories: CategoryDTO[];
  allServices: ServiceDTO[];
  activeGlobalPercent?: number;                     // глобальная акция (если есть)
  servicePercents?: ReadonlyArray<[string, number]>; // точечные скидки по услуге
};

export type MasterDTO = {
  id: string;
  name: string;
  canDoAll: boolean;
  nextFreeDate?: string | null; // например, '21 Oct' (или ISO)
};

export type AvailabilityDTO = {
  firstDateISO: string;  // первый день с доступными слотами
  slots: string[];       // ISO начала слотов внутри выбранного дня
};

export type PromotionBanner = {
  percent: number;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
} | null;
