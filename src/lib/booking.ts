// src/lib/booking.ts
import type { BookingInput } from "@/app/api/book/route";

export type BookingResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingError";
  }
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  // здесь твои проверки слота, запись в БД и т.п.
  // бросай BookingError при бизнес-ошибках — её поймает роутер
  // пример:
  // if (!slotIsFree) throw new BookingError("Slot is no longer available");

  return { ok: true, id: `bk_${Date.now()}` };
}
