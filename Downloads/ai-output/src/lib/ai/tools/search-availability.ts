// src/lib/ai/tools/search-availability.ts

import {
  getAvailableSlots,
  type PreferredTime,
} from '@/lib/booking/availability-service';

interface Args {
  masterId: string;
  dateISO: string;
  serviceIds: string[];
  preferredTime?: string;
}

export async function searchAvailability(args: Args) {
  const result = await getAvailableSlots({
    masterId: args.masterId,
    dateISO: args.dateISO,
    serviceIds: args.serviceIds,
    preferredTime: (args.preferredTime as PreferredTime) || 'any',
  });

  return {
    slots: result.slots.map((s) => ({
      startAt: s.startAt,
      endAt: s.endAt,
      startMinutes: s.startMinutes,
      endMinutes: s.endMinutes,
      displayTime: s.displayTime,
    })),
    splitRequired: result.splitRequired,
    firstDateISO: result.firstDateISO,
    totalDurationMin: result.totalDurationMin,
    count: result.slots.length,
  };
}
