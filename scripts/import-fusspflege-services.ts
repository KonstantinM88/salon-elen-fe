import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

type Locale = "de" | "en" | "ru";
type PriceKind = "fixed" | "from" | "surcharge" | "free";
type ServiceGroup =
  | "cosmetic"
  | "wellness"
  | "individual"
  | "specialist"
  | "mobile"
  | "addon";

type LocalizedText = Record<Locale, string>;

type FootCareService = {
  slug: string;
  names: LocalizedText;
  durationMin: number;
  priceCents: number;
  priceKind: PriceKind;
  group: ServiceGroup;
  details?: Partial<LocalizedText>;
};

const CATEGORY_SLUG = "fu-pflege";
const CATEGORY_NAME = "Fußpflege";
const SERVICE_IMAGE_BASE_PATH = "/images/services/fusspflege";

const CATEGORY_TRANSLATIONS: Record<Locale, { name: string; description: string }> = {
  de: {
    name: "Fußpflege",
    description:
      "Professionelle Fußpflege im Salon Elen in Halle (Saale): kosmetische Pediküre, intensive Pflege, Spezialbehandlungen, mobile Fußpflege und ausgewählte Zusatzleistungen.",
  },
  en: {
    name: "Foot Care",
    description:
      "Professional foot care at Salon Elen in Halle (Saale): cosmetic pedicures, intensive care, specialist treatments, mobile foot care and selected add-ons.",
  },
  ru: {
    name: "Педикюр и уход за стопами",
    description:
      "Профессиональный уход за стопами в Salon Elen в Галле (Заале): косметический и интенсивный педикюр, специальные процедуры, выездной уход и дополнительные услуги.",
  },
};

const GROUP_DESCRIPTIONS: Record<ServiceGroup, LocalizedText> = {
  cosmetic: {
    de: "Kosmetische Fußpflege im Salon Elen in Halle (Saale).",
    en: "Cosmetic foot care at Salon Elen in Halle (Saale).",
    ru: "Косметический педикюр в Salon Elen в Галле (Заале).",
  },
  wellness: {
    de: "Wellnesspflege für gepflegte und entspannte Füße.",
    en: "Wellness care for well-groomed and relaxed feet.",
    ru: "Wellness-уход для ухоженных и отдохнувших стоп.",
  },
  individual: {
    de: "Gezielte Einzelbehandlung für Füße oder Zehennägel.",
    en: "Focused individual treatment for feet or toenails.",
    ru: "Отдельная процедура для стоп или ногтей на ногах.",
  },
  specialist: {
    de: "Spezialisierte Fuß- und Nagelpflege; der konkrete Umfang richtet sich nach dem Befund.",
    en: "Specialist foot and nail care; the exact scope depends on the assessment.",
    ru: "Специализированный уход за стопами и ногтями; объём процедуры зависит от состояния.",
  },
  mobile: {
    de: "Mobile Fußpflege in Halle (Saale); die Anfahrt innerhalb von Halle ist im Preis enthalten.",
    en: "Mobile foot care in Halle (Saale); travel within Halle is included in the price.",
    ru: "Выездной уход за стопами в Галле (Заале); выезд в пределах Галле включён в цену.",
  },
  addon: {
    de: "Zusatzleistung zu einer Fußpflege; nicht separat online buchbar.",
    en: "Add-on to a foot care treatment; not available as a separate online booking.",
    ru: "Дополнение к процедуре ухода за стопами; отдельно онлайн не бронируется.",
  },
};

const SERVICES: FootCareService[] = [
  {
    slug: "express-pedikuere-nur-naegel",
    names: { de: "Express-Pediküre – nur Nägel", en: "Express Pedicure – Nails Only", ru: "Экспресс-педикюр — только ногти" },
    durationMin: 25,
    priceCents: 2900,
    priceKind: "fixed",
    group: "cosmetic",
  },
  {
    slug: "klassische-pedikuere",
    names: { de: "Klassische Pediküre", en: "Classic Pedicure", ru: "Классический педикюр" },
    durationMin: 40,
    priceCents: 3900,
    priceKind: "fixed",
    group: "cosmetic",
    details: {
      de: "Nägel kürzen und formen, Nagelhautpflege, Reinigung der Nagelfalze, Entfernung normaler Hornhaut und Abschlusspflege.",
      en: "Toenail trimming and shaping, cuticle care, nail-fold cleansing, removal of normal callus and finishing care.",
      ru: "Укорачивание и придание формы ногтям, уход за кутикулой, очищение ногтевых пазух, удаление обычной ороговевшей кожи и завершающий уход.",
    },
  },
  {
    slug: "apparative-pedikuere",
    names: { de: "Apparative Pediküre", en: "E-file Pedicure", ru: "Аппаратный педикюр" },
    durationMin: 45,
    priceCents: 4500,
    priceKind: "fixed",
    group: "cosmetic",
  },
  {
    slug: "intensive-fusspflege",
    names: { de: "Intensive Fußpflege", en: "Intensive Foot Care", ru: "Интенсивный уход за стопами" },
    durationMin: 55,
    priceCents: 5500,
    priceKind: "fixed",
    group: "cosmetic",
    details: {
      de: "Mit zusätzlicher Zeit für sehr trockene und stärker verhornte Haut.",
      en: "With additional time for very dry skin and heavier callus.",
      ru: "С дополнительным временем для очень сухой кожи и выраженного ороговения.",
    },
  },
  {
    slug: "pedikuere-mit-nagellack",
    names: { de: "Pediküre mit Nagellack", en: "Pedicure with Nail Polish", ru: "Педикюр с обычным лаком" },
    durationMin: 55,
    priceCents: 4900,
    priceKind: "fixed",
    group: "cosmetic",
  },
  {
    slug: "pedikuere-mit-uv-gellack",
    names: { de: "Pediküre mit UV-Gellack", en: "Gel Polish Pedicure", ru: "Педикюр с гель-лаком" },
    durationMin: 65,
    priceCents: 5900,
    priceKind: "fixed",
    group: "cosmetic",
  },
  {
    slug: "herren-pedikuere",
    names: { de: "Herren-Pediküre", en: "Men’s Pedicure", ru: "Мужской педикюр" },
    durationMin: 50,
    priceCents: 5500,
    priceKind: "fixed",
    group: "cosmetic",
  },
  {
    slug: "paraffinbad-fuer-die-fuesse",
    names: { de: "Paraffinbad für die Füße", en: "Paraffin Foot Treatment", ru: "Парафиновый уход для стоп" },
    durationMin: 25,
    priceCents: 2500,
    priceKind: "fixed",
    group: "wellness",
  },
  {
    slug: "naegel-kuerzen-und-formen",
    names: { de: "Nägel kürzen und formen", en: "Toenail Trimming and Shaping", ru: "Укорачивание и придание формы ногтям" },
    durationMin: 20,
    priceCents: 2500,
    priceKind: "fixed",
    group: "individual",
  },
  {
    slug: "nagelfalzreinigung",
    names: { de: "Nagelfalzreinigung", en: "Nail Fold Cleaning", ru: "Очищение ногтевых пазух" },
    durationMin: 20,
    priceCents: 2500,
    priceKind: "fixed",
    group: "individual",
  },
  {
    slug: "hornhautentfernung",
    names: { de: "Hornhautentfernung", en: "Callus Removal", ru: "Удаление ороговевшей кожи" },
    durationMin: 30,
    priceCents: 3500,
    priceKind: "fixed",
    group: "individual",
  },
  {
    slug: "intensive-hornhautentfernung",
    names: { de: "Intensive Hornhautentfernung", en: "Intensive Callus Removal", ru: "Интенсивное удаление ороговевшей кожи" },
    durationMin: 45,
    priceCents: 4500,
    priceKind: "fixed",
    group: "individual",
  },
  {
    slug: "fersenpflege",
    names: { de: "Fersenpflege", en: "Heel Care", ru: "Уход за пятками" },
    durationMin: 25,
    priceCents: 2900,
    priceKind: "fixed",
    group: "individual",
  },
  {
    slug: "feuchtigkeitsspendende-fussmaske",
    names: { de: "Feuchtigkeitsspendende Fußmaske", en: "Hydrating Foot Mask", ru: "Увлажняющая маска для стоп" },
    durationMin: 20,
    priceCents: 1500,
    priceKind: "fixed",
    group: "wellness",
  },
  {
    slug: "podologische-komplexbehandlung",
    names: { de: "Podologische Komplexbehandlung", en: "Comprehensive Podiatry Treatment", ru: "Комплексный медицинский педикюр" },
    durationMin: 55,
    priceCents: 6500,
    priceKind: "fixed",
    group: "specialist",
  },
  {
    slug: "podologische-komplexbehandlung-erhoehter-aufwand",
    names: { de: "Podologische Komplexbehandlung – erhöhter Aufwand", en: "Extended Podiatry Treatment", ru: "Медицинский педикюр повышенной сложности" },
    durationMin: 75,
    priceCents: 8500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "podologische-nagelbehandlung",
    names: { de: "Podologische Nagelbehandlung", en: "Podiatric Nail Care", ru: "Подологическая обработка ногтей" },
    durationMin: 30,
    priceCents: 3500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "podologische-hornhautbehandlung",
    names: { de: "Podologische Hornhautbehandlung", en: "Podiatric Callus Treatment", ru: "Подологическая обработка ороговевшей кожи" },
    durationMin: 30,
    priceCents: 3500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "huehneraugenbehandlung-pro-stelle",
    names: { de: "Hühneraugenbehandlung – pro Stelle", en: "Corn Treatment – per Area", ru: "Обработка стержневой мозоли — один участок" },
    durationMin: 20,
    priceCents: 2000,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "behandlung-eines-eingewachsenen-nagels",
    names: { de: "Behandlung eines eingewachsenen Nagels", en: "Ingrown Toenail Care", ru: "Обработка вросшего ногтя" },
    durationMin: 30,
    priceCents: 3500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "rhagadenbehandlung-pro-ferse",
    names: { de: "Rhagadenbehandlung – pro Ferse", en: "Heel Fissure Care – per Heel", ru: "Обработка трещин — одна пятка" },
    durationMin: 25,
    priceCents: 2500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "abtragen-eines-verdickten-nagels",
    names: { de: "Abtragen eines verdickten Nagels", en: "Thickened Toenail Reduction", ru: "Обработка утолщённого ногтя" },
    durationMin: 15,
    priceCents: 1500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "begleitende-pflege-bei-nagelpilz-pro-nagel",
    names: { de: "Begleitende Pflege bei Nagelpilz – pro Nagel", en: "Supportive Care for Fungal Nails – per Nail", ru: "Сопровождающий уход при грибковом поражении — один ноготь" },
    durationMin: 20,
    priceCents: 2000,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "nagelfalztamponade-pro-nagel",
    names: { de: "Nagelfalztamponade – pro Nagel", en: "Nail Fold Packing – per Nail", ru: "Тампонада ногтевого валика — один ноготь" },
    durationMin: 15,
    priceCents: 1000,
    priceKind: "from",
    group: "specialist",
    details: {
      de: "Der angegebene Preis gilt als Zusatzleistung während eines Behandlungstermins; bei separater Buchung gilt der Mindestpreis für einen Einzeltermin.",
      en: "The stated price applies as an add-on during a treatment appointment; a separate booking is charged at the minimum price for an individual appointment.",
      ru: "Указанная цена действует как дополнение во время основной процедуры; при отдельной записи применяется минимальная цена отдельного визита.",
    },
  },
  {
    slug: "nagelkorrektur-mit-klebespange",
    names: { de: "Nagelkorrektur mit Klebespange", en: "Adhesive Nail Brace", ru: "Коррекция ногтя клеевой пластиной" },
    durationMin: 30,
    priceCents: 4500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "nagelkorrektur-mit-drahtspange",
    names: { de: "Nagelkorrektur mit Drahtspange", en: "Wire Nail Brace", ru: "Коррекция ногтя проволочной скобой" },
    durationMin: 45,
    priceCents: 9500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "nagelspangenkontrolle-und-nachregulierung",
    names: { de: "Nagelspangenkontrolle & Nachregulierung", en: "Nail Brace Check and Adjustment", ru: "Контроль и коррекция ногтевой скобы" },
    durationMin: 20,
    priceCents: 2500,
    priceKind: "from",
    group: "specialist",
  },
  {
    slug: "druckentlastung-und-reibungsschutz",
    names: { de: "Druckentlastung & Reibungsschutz", en: "Pressure Relief and Friction Protection", ru: "Разгрузка участка давления и защита от трения" },
    durationMin: 15,
    priceCents: 1500,
    priceKind: "from",
    group: "specialist",
    details: {
      de: "Der angegebene Preis gilt als Zusatzleistung während eines Behandlungstermins; bei separater Buchung gilt der Mindestpreis für einen Einzeltermin.",
      en: "The stated price applies as an add-on during a treatment appointment; a separate booking is charged at the minimum price for an individual appointment.",
      ru: "Указанная цена действует как дополнение во время основной процедуры; при отдельной записи применяется минимальная цена отдельного визита.",
    },
  },
  {
    slug: "mobile-klassische-fusspflege",
    names: { de: "Mobile klassische Fußpflege", en: "Mobile Classic Foot Care", ru: "Классический педикюр на дому" },
    durationMin: 50,
    priceCents: 5500,
    priceKind: "fixed",
    group: "mobile",
  },
  {
    slug: "mobile-intensive-fusspflege",
    names: { de: "Mobile intensive Fußpflege", en: "Mobile Intensive Foot Care", ru: "Интенсивный педикюр на дому" },
    durationMin: 65,
    priceCents: 7000,
    priceKind: "fixed",
    group: "mobile",
  },
  {
    slug: "mobile-fusspflege-mit-nagellack",
    names: { de: "Mobile Fußpflege mit Nagellack", en: "Mobile Pedicure with Nail Polish", ru: "Педикюр с обычным лаком на дому" },
    durationMin: 65,
    priceCents: 6500,
    priceKind: "fixed",
    group: "mobile",
  },
  {
    slug: "mobile-fusspflege-mit-uv-gellack",
    names: { de: "Mobile Fußpflege mit UV-Gellack", en: "Mobile Gel Polish Pedicure", ru: "Педикюр с гель-лаком на дому" },
    durationMin: 75,
    priceCents: 7500,
    priceKind: "fixed",
    group: "mobile",
  },
  {
    slug: "mobile-podologische-komplexbehandlung",
    names: { de: "Mobile podologische Komplexbehandlung", en: "Mobile Comprehensive Podiatry Treatment", ru: "Медицинский педикюр на дому" },
    durationMin: 65,
    priceCents: 8000,
    priceKind: "fixed",
    group: "mobile",
  },
  {
    slug: "mobiler-hausbesuch-weitere-person",
    names: { de: "Mobiler Hausbesuch – weitere Person", en: "Home Visit – Additional Person", ru: "Второй клиент по тому же адресу" },
    durationMin: 0,
    priceCents: 0,
    priceKind: "free",
    group: "addon",
  },
  {
    slug: "nagellack-zusatzleistung",
    names: { de: "Nagellack – Zusatzleistung", en: "Nail Polish – Add-on", ru: "Покрытие обычным лаком — доп. услуга" },
    durationMin: 0,
    priceCents: 1000,
    priceKind: "surcharge",
    group: "addon",
  },
  {
    slug: "uv-gellack-zusatzleistung",
    names: { de: "UV-Gellack – Zusatzleistung", en: "Gel Polish – Add-on", ru: "Покрытие гель-лаком — доп. услуга" },
    durationMin: 0,
    priceCents: 2000,
    priceKind: "surcharge",
    group: "addon",
  },
  {
    slug: "uv-gellack-entfernen-vor-neubehandlung",
    names: { de: "UV-Gellack entfernen – vor Neubehandlung", en: "Gel Polish Removal before New Treatment", ru: "Снятие гель-лака перед новой процедурой" },
    durationMin: 0,
    priceCents: 1000,
    priceKind: "surcharge",
    group: "addon",
  },
  {
    slug: "uv-gellack-entfernen-und-nagelpflege",
    names: { de: "UV-Gellack entfernen & Nagelpflege", en: "Gel Polish Removal and Nail Care", ru: "Снятие гель-лака и уход за ногтями" },
    durationMin: 25,
    priceCents: 2500,
    priceKind: "fixed",
    group: "individual",
  },
];

function formatEuro(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function descriptionFor(service: FootCareService, locale: Locale): string {
  const parts = [GROUP_DESCRIPTIONS[service.group][locale]];
  const details = service.details?.[locale];
  if (details) parts.push(details);

  if (service.priceKind === "from") {
    const price = formatEuro(service.priceCents, locale);
    parts.push(
      locale === "de"
        ? `Preis ab ${price}, abhängig von Zeitaufwand, Befund und Materialverbrauch.`
        : locale === "en"
          ? `Price from ${price}, depending on time, assessment and materials used.`
          : `Цена от ${price}; итоговая стоимость зависит от сложности, состояния и расходных материалов.`,
    );
  } else if (service.priceKind === "surcharge") {
    const price = formatEuro(service.priceCents, locale);
    parts.push(
      locale === "de"
        ? `Aufpreis +${price}.`
        : locale === "en"
          ? `Surcharge +${price}.`
          : `Доплата +${price}.`,
    );
  } else if (service.priceKind === "free") {
    parts.push(
      locale === "de"
        ? "Kein Aufpreis."
        : locale === "en"
          ? "No additional charge."
          : "Без доплаты.",
    );
  }

  return parts.join(" ");
}

function readArg(name: string): string | null {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : null;
}

function coverFor(service: FootCareService): string | null {
  return service.durationMin > 0
    ? `${SERVICE_IMAGE_BASE_PATH}/${service.slug}.webp`
    : null;
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const apply = process.argv.includes("--apply");
  const publish = process.argv.includes("--publish");
  const masterSelector = readArg("master");

  if (publish && !masterSelector) {
    throw new Error("--publish requires --master=<master id or exact name>");
  }

  const { prisma } = await import("../src/lib/prisma");

  try {
    const category = await prisma.service.findFirst({
      where: {
        parentId: null,
        isArchived: false,
        OR: [{ slug: CATEGORY_SLUG }, { name: CATEGORY_NAME }],
      },
      select: { id: true, name: true, slug: true, isActive: true },
    });

    if (!category) {
      throw new Error(`Category ${CATEGORY_NAME} (${CATEGORY_SLUG}) was not found.`);
    }

    const master = masterSelector
      ? await prisma.master.findFirst({
          where: { OR: [{ id: masterSelector }, { name: masterSelector }] },
          select: { id: true, name: true },
        })
      : null;

    if (masterSelector && !master) {
      throw new Error(`Master "${masterSelector}" was not found.`);
    }

    const existing = await prisma.service.findMany({
      where: { slug: { in: SERVICES.map((service) => service.slug) } },
      select: { id: true, slug: true, parentId: true, isActive: true },
    });
    const existingBySlug = new Map(existing.map((service) => [service.slug, service]));
    const conflicts = existing.filter((service) => service.parentId !== category.id);

    if (conflicts.length > 0) {
      throw new Error(
        `Slug conflict outside ${CATEGORY_NAME}: ${conflicts.map((service) => service.slug).join(", ")}`,
      );
    }

    const standalone = SERVICES.filter((service) => service.durationMin > 0);
    const addons = SERVICES.filter((service) => service.durationMin === 0);
    const createdCount = SERVICES.filter((service) => !existingBySlug.has(service.slug)).length;
    const updatedCount = SERVICES.length - createdCount;

    console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);
    console.log(`Category: ${category.name} (${category.slug}, ${category.id})`);
    console.log(`Services: ${SERVICES.length} total; ${standalone.length} standalone; ${addons.length} add-ons`);
    console.log(`Planned: ${createdCount} create; ${updatedCount} update`);
    console.log(`Publication: ${publish ? `active and assigned to ${master?.name}` : "inactive until master assignment"}`);
    console.log(`Covers: ${standalone.length} responsive WebP source images from ${SERVICE_IMAGE_BASE_PATH}`);
    console.log("Excluded because crossed out: French-Pediküre mit UV-Gellack; SPA-Pediküre; SPA-Pediküre mit UV-Gellack; Fußritual; Anti-Aging-Fußbehandlung; Entspannende Fußmassage; Fuß- und Unterschenkelmassage; Fußpeeling; Podologische Erstberatung; Nagelprothetik; Individuelle Silikonorthese; Mobile Nagelpflege; French-Design; Nageldesign; Reparatur eines Zehennagels.");
    console.log("Applied handwritten corrections: Herren-Pediküre = 55 €.");

    if (!apply) return;

    await prisma.$transaction(async (tx) => {
      await tx.service.update({
        where: { id: category.id },
        data: {
          name: CATEGORY_TRANSLATIONS.de.name,
          description: CATEGORY_TRANSLATIONS.de.description,
          isActive: publish,
          isArchived: false,
        },
      });

      for (const locale of ["de", "en", "ru"] as const) {
        const translation = CATEGORY_TRANSLATIONS[locale];
        await tx.serviceTranslation.upsert({
          where: { serviceId_locale: { serviceId: category.id, locale } },
          create: { serviceId: category.id, locale, ...translation },
          update: translation,
        });
      }

      for (const service of SERVICES) {
        const isStandalone = service.durationMin > 0;
        const saved = await tx.service.upsert({
          where: { slug: service.slug },
          create: {
            slug: service.slug,
            name: service.names.de,
            description: descriptionFor(service, "de"),
            durationMin: service.durationMin,
            priceCents: service.priceCents,
            cover: coverFor(service),
            parentId: category.id,
            isActive: publish && isStandalone,
            isArchived: false,
          },
          update: {
            name: service.names.de,
            description: descriptionFor(service, "de"),
            durationMin: service.durationMin,
            priceCents: service.priceCents,
            cover: coverFor(service),
            parentId: category.id,
            isActive: publish && isStandalone,
            isArchived: false,
          },
          select: { id: true },
        });

        for (const locale of ["de", "en", "ru"] as const) {
          const translation = {
            name: service.names[locale],
            description: descriptionFor(service, locale),
          };
          await tx.serviceTranslation.upsert({
            where: { serviceId_locale: { serviceId: saved.id, locale } },
            create: { serviceId: saved.id, locale, ...translation },
            update: translation,
          });
        }

        if (publish && master && isStandalone) {
          await tx.service.update({
            where: { id: saved.id },
            data: { masters: { connect: { id: master.id } } },
          });
        }
      }
    }, { timeout: 120_000 });

    console.log("Import completed successfully.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
