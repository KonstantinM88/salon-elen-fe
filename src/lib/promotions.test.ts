import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPromotionDateRange,
  calculatePromotionalPriceCents,
  distinctPromotionAnnouncements,
  formatPromotionOrgDate,
  serializePromotionAnnouncements,
  selectBestPromotionForService,
  selectPublishedPromotionForService,
  type ActivePromotionRecord,
  type ActiveServicePromotion,
} from "@/lib/promotions";

const basePromotion: ActivePromotionRecord = {
  id: "promo-10",
  title: "Summer",
  percent: 10,
  from: new Date("2026-08-01T00:00:00.000Z"),
  to: new Date("2026-08-31T23:59:59.999Z"),
  isGlobal: false,
  serviceIds: ["service-a"],
};

test("promotional price rounds to the nearest cent", () => {
  assert.equal(calculatePromotionalPriceCents(35000, 15), 29750);
  assert.equal(calculatePromotionalPriceCents(999, 30), 699);
  assert.throws(() => calculatePromotionalPriceCents(35000, 12));
});

test("highest applicable promotion wins", () => {
  const promotions: ActivePromotionRecord[] = [
    basePromotion,
    { ...basePromotion, id: "global-20", percent: 20, isGlobal: true, serviceIds: [] },
    { ...basePromotion, id: "other-30", percent: 30, serviceIds: ["service-b"] },
  ];

  assert.equal(selectBestPromotionForService("service-a", promotions)?.percent, 20);
  assert.equal(selectBestPromotionForService("service-b", promotions)?.percent, 30);
  assert.equal(selectBestPromotionForService("service-c", promotions)?.percent, 20);
});

test("published catalog prefers a currently active promotion", () => {
  const at = new Date("2026-08-17T10:00:00.000Z");
  const promotions: ActivePromotionRecord[] = [
    {
      ...basePromotion,
      id: "active-10",
      from: new Date("2026-08-16T00:00:00.000Z"),
      to: new Date("2026-08-17T23:59:59.999Z"),
    },
    {
      ...basePromotion,
      id: "upcoming-30",
      percent: 30,
      from: new Date("2026-08-18T00:00:00.000Z"),
      to: new Date("2026-08-18T23:59:59.999Z"),
    },
  ];

  assert.equal(
    selectPublishedPromotionForService("service-a", promotions, at)?.id,
    "active-10",
  );
});

test("published catalog shows the nearest upcoming promotion", () => {
  const at = new Date("2026-08-17T10:00:00.000Z");
  const promotions: ActivePromotionRecord[] = [
    {
      ...basePromotion,
      id: "expired-30",
      percent: 30,
      from: new Date("2026-08-15T00:00:00.000Z"),
      to: new Date("2026-08-16T23:59:59.999Z"),
    },
    {
      ...basePromotion,
      id: "tomorrow-15",
      percent: 15,
      from: new Date("2026-08-18T00:00:00.000Z"),
      to: new Date("2026-08-18T23:59:59.999Z"),
    },
    {
      ...basePromotion,
      id: "next-week-30",
      percent: 30,
      from: new Date("2026-08-24T00:00:00.000Z"),
      to: new Date("2026-08-24T23:59:59.999Z"),
    },
  ];

  assert.equal(
    selectPublishedPromotionForService("service-a", promotions, at)?.id,
    "tomorrow-15",
  );
});

test("promotion date range follows salon-local calendar days", () => {
  const range = buildPromotionDateRange("2026-10-25", "2026-10-25");
  assert.equal(formatPromotionOrgDate(range.from), "2026-10-25");
  assert.equal(formatPromotionOrgDate(range.to), "2026-10-25");
  assert.ok(range.to > range.from);
});

test("promotion announcements are unique and ordered by discount", () => {
  const announcements: ActiveServicePromotion[] = [
    {
      id: "promo-10",
      title: "Ten percent",
      percent: 10,
      from: basePromotion.from,
      to: basePromotion.to,
      isGlobal: false,
    },
    {
      id: "promo-20",
      title: "Twenty percent",
      percent: 20,
      from: basePromotion.from,
      to: basePromotion.to,
      isGlobal: true,
    },
    {
      id: "promo-10",
      title: "Ten percent",
      percent: 10,
      from: basePromotion.from,
      to: basePromotion.to,
      isGlobal: false,
    },
  ];

  assert.deepEqual(
    distinctPromotionAnnouncements(announcements).map((promotion) => promotion.id),
    ["promo-20", "promo-10"],
  );
});

test("promotion announcements serialize dates for the Next.js cache boundary", () => {
  const promotion: ActiveServicePromotion = {
    id: "promo-cache",
    title: "Cached promotion",
    percent: 15,
    from: new Date("2026-08-17T00:00:00.000Z"),
    to: new Date("2026-08-31T21:59:59.999Z"),
    isGlobal: true,
  };

  assert.deepEqual(serializePromotionAnnouncements([promotion]), [
    {
      ...promotion,
      from: "2026-08-17T00:00:00.000Z",
      to: "2026-08-31T21:59:59.999Z",
    },
  ]);
});
