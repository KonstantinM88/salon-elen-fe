import type { SeoLocale } from "@/lib/seo-locale";

export type SeoLandingCategory = "brows" | "lips" | "eyes" | "skin";

export type SeoLandingPageData = {
  slug: string;
  category: SeoLandingCategory;
  title: string;
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroText: string;
  heroImage: string;
  heroImageAlt: string;
  serviceName: string;
  price: string;
  priceCents: number | null;
  duration: string;
  bookingHref: string;
  facts: string[];
  outcomes: string[];
  suitableFor: string[];
  process: Array<{ title: string; text: string }>;
  priceDetails: string[];
  contraindications: string[];
  proof: {
    title: string;
    intro: string;
    beforeLabel: string;
    afterLabel: string;
    beforeImage: string;
    afterImage: string;
    note: string;
  };
  gallery: Array<{
    src: string;
    alt: string;
    label: string;
    mediaType?: "image" | "video";
    poster?: string;
  }>;
  feedback: string[];
  faq: Array<{ question: string; answer: string }>;
  relatedSlugs: string[];
};

type NonGermanSeoLocale = Exclude<SeoLocale, "de">;

type SeoLandingPageTranslation = {
  title: string;
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroText: string;
  heroImageAlt: string;
  serviceName: string;
  price: string;
  duration: string;
  facts: string[];
  outcomes: string[];
  suitableFor: string[];
  process: SeoLandingPageData["process"];
  priceDetails: string[];
  contraindications: string[];
  proof: Omit<SeoLandingPageData["proof"], "beforeImage" | "afterImage">;
  gallery: Array<Pick<SeoLandingPageData["gallery"][number], "alt" | "label">>;
  feedback: string[];
  faq: SeoLandingPageData["faq"];
};

const pmuProcess = [
  {
    title: "Beratung und Hautcheck",
    text: "Wir sprechen ueber Wunsch, Hauttyp, Alltag und ob die Behandlung aktuell sinnvoll ist.",
  },
  {
    title: "Form, Farbe und Vorzeichnung",
    text: "Die Form wird vorgezeichnet und der Farbton ruhig abgestimmt. Pigmentiert wird erst nach Ihrer Freigabe.",
  },
  {
    title: "Praezise Pigmentierung",
    text: "Die Pigmentierung erfolgt Schritt fuer Schritt mit Fokus auf Hygiene, Symmetrie und ein natuerliches Ergebnis.",
  },
  {
    title: "Pflege und Nachbehandlung",
    text: "Sie erhalten klare Pflegehinweise und einen realistischen Plan fuer Heilung, Kontrolle und Auffrischung.",
  },
];

const pmuContraindications = [
  "Schwangerschaft und Stillzeit",
  "akute Entzuendungen, Herpes oder offene Stellen im Behandlungsbereich",
  "frische Botox- oder Filler-Behandlungen im Behandlungsbereich",
  "Blutverduenner, Blutgerinnungsstoerungen oder starke Keloidneigung",
  "nicht eingestellter Diabetes, Fieber oder akute Infekte",
  "bekannte Allergien gegen Pigmente, Pflegeprodukte oder Betaeubung",
  "bei Unsicherheit bitte vor dem Termin aerztlich abklaeren",
];

const skinContraindications = [
  "Schwangerschaft und Stillzeit",
  "akute Entzuendungen, aktive Akne, Herpes oder offene Stellen",
  "frische intensive Peelings, Laserbehandlungen oder Sonnenbrand",
  "Blutverduenner, Blutgerinnungsstoerungen oder starke Keloidneigung",
  "nicht eingestellter Diabetes, Fieber oder akute Infekte",
  "stark gereizte Haut, aktive Rosazea-Schuebe oder Ekzeme",
  "bei Unsicherheit bitte vor dem Termin aerztlich abklaeren",
];

const browFeedback = [
  "Die Brauen wirken gepflegt, ohne angemalt auszusehen.",
  "Die Vorzeichnung gibt Sicherheit, weil man die Form vorher sieht.",
  "Viele Kundinnen schaetzen, morgens schneller fertig zu sein.",
];

const lipFeedback = [
  "Die Lippen wirken frischer, ohne dass es wie Lippenstift aussieht.",
  "Der Farbton wird ruhig abgestimmt und nicht zu hart gewaehlt.",
  "Viele Kundinnen moegen den gepflegten Effekt im Alltag.",
];

const eyeFeedback = [
  "Der Blick wirkt definierter, auch ohne taeglichen Eyeliner.",
  "Die Linie bleibt dezent und wird an die Augenform angepasst.",
  "Viele Kundinnen waehlen diese Behandlung fuer einen wacheren Ausdruck.",
];

export const seoLandingPages = [
  {
    slug: "powder-brows-halle",
    category: "brows",
    title: "Powder Brows in Halle (Saale)",
    eyebrow: "PMU Augenbrauen",
    metaTitle: "Powder Brows Halle - natuerliche PMU Augenbrauen | Salon Elen",
    metaDescription:
      "Powder Brows in Halle (Saale): weiche Puderschattierung, Beratung, Vorzeichnung, Preis 350 EUR und Online-Termin im Salon Elen.",
    keywords: [
      "Powder Brows Halle",
      "Powder Brows Halle Saale",
      "PMU Augenbrauen Halle",
      "Permanent Make-up Augenbrauen Halle",
    ],
    heroText:
      "Weiche, pudrige Augenbrauen fuer einen gepflegten Look ohne harte Kontur. Ideal, wenn die Brauen taeglich definiert wirken sollen, aber trotzdem natuerlich bleiben.",
    heroImage: "/images/gallery/brow_1.webp",
    heroImageAlt: "Powder Brows Ergebnis bei Salon Elen in Halle",
    serviceName: "Powder Brows",
    price: "350 EUR",
    priceCents: 35000,
    duration: "ca. 120 Min.",
    bookingHref: "/booking/services",
    facts: ["Lessingstrasse 37, 06114 Halle", "weicher Puder-Effekt", "inkl. Beratung und Vorzeichnung"],
    outcomes: [
      "gleichmaessig wirkende Augenbrauen ohne taegliches Nachzeichnen",
      "weiche Schattierung statt harter Balkenform",
      "Farbe und Intensitaet passend zu Haut, Haaren und Stil",
      "mehr Ausdruck im Gesicht bei natuerlicher Wirkung",
    ],
    suitableFor: [
      "duenne oder lueckenhafte Brauen",
      "helle Brauen, die mehr Definition brauchen",
      "Kundinnen, die einen gepflegten Alltagslook moechten",
      "alle, die eine sanftere Alternative zu starkem Augenbrauen-Make-up suchen",
    ],
    process: pmuProcess,
    priceDetails: [
      "Powder Brows: 350 EUR",
      "Dauer: ca. 120 Minuten",
      "Auffrischung und Korrektur werden je nach Zeitraum separat besprochen.",
    ],
    contraindications: pmuContraindications,
    proof: {
      title: "Vorher/Nachher und Ergebniswirkung",
      intro:
        "Bei Powder Brows veraendert sich das Ergebnis in der Heilung: frisch ist die Farbe intensiver, danach wird sie weicher und alltagstauglicher.",
      beforeLabel: "Ausgangsform und Planung",
      afterLabel: "weicher Powder-Effekt",
      beforeImage: "/images/gallery/brow_1.webp",
      afterImage: "/images/gallery/brow_2.webp",
      note: "Weitere freigegebene Vorher/Nachher-Beispiele zeigen wir gern in der Beratung.",
    },
    gallery: [
      { src: "/images/seo-pages/Powder_Brows_1.webp", alt: "Powder Brows Formplanung in Halle", label: "Form" },
      {
        src: "/images/seo-pages/Powder_Brows_2.webp",
        alt: "Powder Brows Schattierung in Halle",
        label: "Schattierung",
      },
      {
        src: "/images/seo-pages/Powder_Brows_video_1.webm",
        alt: "PMU Augenbrauen bei Salon Elen",
        label: "PMU",
        mediaType: "video",
        poster: "/images/seo-pages/Powder_Brows_1.webp",
      },
    ],
    feedback: browFeedback,
    faq: [
      {
        question: "Wie natuerlich sehen Powder Brows aus?",
        answer:
          "Die Technik ist auf einen weichen Puder-Effekt ausgelegt. Die Intensitaet wird vorab abgestimmt, damit die Brauen nicht zu hart wirken.",
      },
      {
        question: "Wie lange dauert ein Termin?",
        answer: "Planen Sie fuer Beratung, Vorzeichnung und Pigmentierung etwa 120 Minuten ein.",
      },
      {
        question: "Ist Powder Brows besser als Microblading?",
        answer:
          "Powder Brows wirken pudriger und oft weicher. Microblading bzw. Hairstroke Brows imitiert eher einzelne Haerchen. Welche Technik passt, klaeren wir in der Beratung.",
      },
      {
        question: "Wann kann ich wieder normal arbeiten?",
        answer:
          "In der Regel direkt. Die Brauen wirken anfangs intensiver und brauchen eine ruhige Heilungsphase mit passender Pflege.",
      },
    ],
    relatedSlugs: ["microblading-halle", "permanent-make-up-augenbrauen-halle", "permanent-make-up-in-der-naehe"],
  },
  {
    slug: "microblading-halle",
    category: "brows",
    title: "Microblading in Halle (Saale)",
    eyebrow: "Hairstroke Brows",
    metaTitle: "Microblading Halle - feine Haerchenzeichnung | Salon Elen",
    metaDescription:
      "Microblading/Hairstroke Brows in Halle: feine Haerchenoptik, Beratung, Vorzeichnung, Preis 450 EUR und Terminbuchung bei Salon Elen.",
    keywords: ["Microblading Halle", "Hairstroke Brows Halle", "Haerchenzeichnung Halle", "Augenbrauen PMU Halle"],
    heroText:
      "Feine Haerchenzeichnung fuer Augenbrauen mit sichtbarer Struktur. Die Behandlung passt, wenn die Brauen natuerlich voller wirken sollen und Sie eine detailreiche Form moechten.",
    heroImage: "/images/gallery/brow_2.webp",
    heroImageAlt: "Microblading und Hairstroke Brows in Halle",
    serviceName: "Hairstroke Brows / Microblading",
    price: "450 EUR",
    priceCents: 45000,
    duration: "ca. 120 Min.",
    bookingHref: "/booking/services",
    facts: ["feine Haerchenoptik", "individuelle Formvermessung", "natuerlicher, strukturierter Effekt"],
    outcomes: [
      "sichtbar vollere Brauen mit feiner Struktur",
      "Formausgleich bei Luecken oder asymmetrischen Stellen",
      "mehr Ausdruck, ohne taeglich nachzuzeichnen",
      "individuelle Anpassung an Gesicht und vorhandene Haerchen",
    ],
    suitableFor: [
      "lueckenhafte Brauen mit erhaltener Eigenform",
      "Kundinnen, die eine Haerchenoptik statt Puder-Effekt moechten",
      "helle oder ungleichmaessige Augenbrauen",
      "alle, die eine natuerliche Definition suchen",
    ],
    process: pmuProcess,
    priceDetails: [
      "Hairstroke Brows / Microblading: 450 EUR",
      "Dauer: ca. 120 Minuten",
      "Die passende Technik wird nach Hauttyp und Wunschbild abgestimmt.",
    ],
    contraindications: pmuContraindications,
    proof: {
      title: "Vorher/Nachher und Haerchenwirkung",
      intro:
        "Der wichtigste Schritt ist die Vorzeichnung: Form, Richtung und Dichte muessen zum natuerlichen Brauenwuchs passen.",
      beforeLabel: "natuerliche Ausgangsbraue",
      afterLabel: "feinere Struktur",
      beforeImage: "/images/gallery/brow_1.webp",
      afterImage: "/images/gallery/brow_2.webp",
      note: "Bei sehr fettiger Haut kann eine Powder-Technik manchmal haltbarer wirken. Das klaeren wir vor Ort.",
    },
    gallery: [
      { src: "/images/gallery/brow_2.webp", alt: "Hairstroke Brows in Halle", label: "Haerchen" },
      { src: "/images/gallery/brow_1.webp", alt: "Microblading Beratung Halle", label: "Beratung" },
      { src: "/images/gallery/beauty_3.webp", alt: "Augenbrauen Permanent Make-up Halle", label: "Detail" },
    ],
    feedback: browFeedback,
    faq: [
      {
        question: "Ist Microblading das gleiche wie Hairstroke Brows?",
        answer:
          "Beide Begriffe werden oft fuer eine feine Haerchenoptik verwendet. Im Salon klaeren wir, welche Methode fuer Hauttyp und Zielbild sinnvoll ist.",
      },
      {
        question: "Was kostet Microblading in Halle bei Salon Elen?",
        answer: "Die Hairstroke-Brauenbehandlung liegt bei 450 EUR.",
      },
      {
        question: "Fuer wen ist Microblading nicht ideal?",
        answer:
          "Bei sehr fettiger, stark poriger oder empfindlich reagierender Haut kann eine pudrige Technik besser passen.",
      },
      {
        question: "Wie wird die Form festgelegt?",
        answer:
          "Die Form wird vor der Pigmentierung vermessen und vorgezeichnet. Erst wenn Sie zufrieden sind, beginnt die Behandlung.",
      },
    ],
    relatedSlugs: ["powder-brows-halle", "permanent-make-up-augenbrauen-halle", "permanent-make-up-in-der-naehe"],
  },
  {
    slug: "lippenpigmentierung-halle",
    category: "lips",
    title: "Lippenpigmentierung in Halle (Saale)",
    eyebrow: "PMU Lippen",
    metaTitle: "Lippenpigmentierung Halle - Aquarell Lips & 3D Lips | Salon Elen",
    metaDescription:
      "Lippenpigmentierung in Halle: Aquarell Lips ab 380 EUR, 3D Lips 420 EUR, natuerliche Farbe, Beratung und Online-Termin bei Salon Elen.",
    keywords: ["Lippenpigmentierung Halle", "Aquarell Lips Halle", "PMU Lippen Halle", "Permanent Make-up Lippen Halle"],
    heroText:
      "Frischere Lippenfarbe, weichere Konturen und ein gepflegter Look ohne staendiges Nachschminken. Die Pigmentierung wird so geplant, dass sie zu Ihrem Typ passt.",
    heroImage: "/images/gallery/pmu_2.webp",
    heroImageAlt: "Lippenpigmentierung in Halle bei Salon Elen",
    serviceName: "Lippenpigmentierung",
    price: "ab 380 EUR",
    priceCents: 38000,
    duration: "ca. 120 Min.",
    bookingHref: "/booking/services",
    facts: ["Aquarell Lips ab 380 EUR", "3D Lips 420 EUR", "Farbton nach Typ und Wunsch"],
    outcomes: [
      "frischere Lippenfarbe im Alltag",
      "weichere und harmonischere Lippenkontur",
      "weniger Bedarf an Lippenstift oder Lipliner",
      "natuerlicher Effekt statt harter Kontur",
    ],
    suitableFor: [
      "blasse oder ungleichmaessige Lippenfarbe",
      "Kundinnen, die einen frischen Alltagslook moechten",
      "leichte Asymmetrien in der Lippenkontur",
      "alle, die Lippenstift dezenter ersetzen moechten",
    ],
    process: pmuProcess,
    priceDetails: [
      "Aquarell Lips: 380 EUR",
      "3D Lips: 420 EUR",
      "Welche Variante passt, entscheiden wir nach Wunschfarbe, Lippenform und Intensitaet.",
    ],
    contraindications: pmuContraindications,
    proof: {
      title: "Vorher/Nachher und Farbheilung",
      intro:
        "Lippen wirken direkt nach der Behandlung kraeftiger. Nach der Heilung wird der Farbton weicher und natuerlicher.",
      beforeLabel: "Farb- und Konturcheck",
      afterLabel: "frischer Lippenlook",
      beforeImage: "/images/gallery/pmu_2.webp",
      afterImage: "/images/seo-pages/Lip_Pigmentation_2.webp",
      note: "Bei Neigung zu Lippenherpes sprechen Sie uns bitte vorab an.",
    },
    gallery: [
      { src: "/images/seo-pages/Lippenpigmentierung_1.webp", alt: "Aquarell Lips in Halle", label: "Aquarell" },
      { src: "/images/seo-pages/Lippenpigmentierung_2.webp", alt: "Lippen PMU in Halle", label: "Farbe" },
      {
        src: "/images/seo-pages/Lip_Pigmentation_3.webm",
        alt: "Permanent Make-up Lippen Salon Elen",
        label: "Look",
        mediaType: "video",
        poster: "/images/seo-pages/Lippenpigmentierung_2.webp",
      },
    ],
    feedback: lipFeedback,
    faq: [
      {
        question: "Was ist der Unterschied zwischen Aquarell Lips und 3D Lips?",
        answer:
          "Aquarell Lips wirken besonders weich und frisch. 3D Lips sind etwas intensiver und koennen mehr Volumenwirkung geben.",
      },
      {
        question: "Was kostet Lippenpigmentierung in Halle?",
        answer: "Aquarell Lips kosten 380 EUR, 3D Lips kosten 420 EUR.",
      },
      {
        question: "Sieht Lippenpigmentierung wie Lippenstift aus?",
        answer:
          "Das Ziel ist ein natuerlicher, frischer Farbton. Die Intensitaet wird vorab gemeinsam festgelegt.",
      },
      {
        question: "Was ist bei Herpes wichtig?",
        answer:
          "Wenn Sie zu Lippenherpes neigen, sprechen Sie das bitte vor der Behandlung an, damit der Termin sinnvoll geplant wird.",
      },
    ],
    relatedSlugs: ["permanent-make-up-lippen-halle", "powder-brows-halle", "permanent-make-up-in-der-naehe"],
  },
  {
    slug: "wimpernkranzverdichtung-halle",
    category: "eyes",
    title: "Wimpernkranzverdichtung in Halle (Saale)",
    eyebrow: "PMU Augen",
    metaTitle: "Wimpernkranzverdichtung Halle - dezentes Augen PMU | Salon Elen",
    metaDescription:
      "Wimpernkranzverdichtung in Halle: dezente Betonung der Wimpernlinie ab 130 EUR, Beratung, Pflegehinweise und Online-Termin bei Salon Elen.",
    keywords: ["Wimpernkranzverdichtung Halle", "PMU Augen Halle", "Lash Line Halle", "Permanent Make-up Augen Halle"],
    heroText:
      "Eine feine Pigmentierung zwischen den Wimpern fuer mehr Ausdruck, ohne wie ein harter Eyeliner zu wirken. Dezent, alltagstauglich und passend zur Augenform.",
    heroImage: "/images/gallery/pmu_1.webp",
    heroImageAlt: "Wimpernkranzverdichtung bei Salon Elen in Halle",
    serviceName: "Wimpernkranzverdichtung",
    price: "ab 130 EUR",
    priceCents: 13000,
    duration: "ca. 60-90 Min.",
    bookingHref: "/booking/services",
    facts: ["Wimpernkranz: 130 EUR", "oben + unten: 150 EUR", "dezente Augenbetonung"],
    outcomes: [
      "dichter wirkender Wimpernansatz",
      "definierter Blick ohne taeglichen Eyeliner",
      "sehr natuerliche Wirkung bei geschlossenen und offenen Augen",
      "praktisch fuer Alltag, Urlaub und Sport",
    ],
    suitableFor: [
      "helle oder optisch duenne Wimpernansatzlinien",
      "Kundinnen, die keinen sichtbaren Lidstrich moechten",
      "Kontaktlinsen- oder Brillentraegerinnen nach individueller Absprache",
      "alle, die morgens schneller fertig sein moechten",
    ],
    process: pmuProcess,
    priceDetails: [
      "Wimpernkranz: 130 EUR",
      "Wimpernkranz oben + unten: 150 EUR",
      "Dauer je nach Variante ca. 60 bis 90 Minuten.",
    ],
    contraindications: pmuContraindications,
    proof: {
      title: "Vorher/Nachher und dezente Definition",
      intro:
        "Die Wimpernlinie wird nicht grossflachig geschminkt, sondern fein verdichtet. Dadurch wirkt der Blick klarer, aber nicht ueberladen.",
      beforeLabel: "natuerliche Wimpernlinie",
      afterLabel: "verdichteter Ansatz",
      beforeImage: "/images/gallery/beauty_1.webp",
      afterImage: "/images/seo-pages/Lashline_Enhancement_1.webp",
      note: "Die genaue Intensitaet wird an Augenform, Wimpernfarbe und Wunschbild angepasst.",
    },
    gallery: [
      { src: "/images/seo-pages/Lashline_Enhancement_0.webp", alt: "Wimpernkranz PMU Halle", label: "Wimpernkranz" },
      { src: "/images/seo-pages/Lashline_Enhancement_2.webp", alt: "dezente Augenbetonung Halle", label: "Augen" },
      {
        src: "/images/seo-pages/Lashline_Enhancement_3.webm",
        alt: "Permanent Make-up Augen Halle",
        label: "PMU",
        mediaType: "video",
        poster: "/images/seo-pages/Lashline_Enhancement_2.webp",
      },
    ],
    feedback: eyeFeedback,
    faq: [
      {
        question: "Sieht eine Wimpernkranzverdichtung wie Eyeliner aus?",
        answer:
          "Nein, sie ist dezenter. Pigmentiert wird sehr fein am Wimpernansatz, damit die Wimpern dichter wirken.",
      },
      {
        question: "Was kostet Wimpernkranzverdichtung?",
        answer: "Die dezente Wimpernkranzverdichtung kostet 130 EUR, oben + unten 150 EUR.",
      },
      {
        question: "Ist die Behandlung fuer empfindliche Augen geeignet?",
        answer:
          "Das klaeren wir individuell. Akute Reizungen, Entzuendungen oder Augeninfektionen sind Gruende, den Termin zu verschieben.",
      },
      {
        question: "Wie lange dauert der Termin?",
        answer: "Je nach Variante planen Sie etwa 60 bis 90 Minuten ein.",
      },
    ],
    relatedSlugs: ["lidstrich-permanent-make-up-halle", "permanent-make-up-in-der-naehe", "powder-brows-halle"],
  },
  {
    slug: "permanent-make-up-augenbrauen-halle",
    category: "brows",
    title: "Permanent Make-up Augenbrauen in Halle",
    eyebrow: "Powder Brows und Hairstroke",
    metaTitle: "Permanent Make-up Augenbrauen Halle - Powder & Hairstroke | Salon Elen",
    metaDescription:
      "Permanent Make-up fuer Augenbrauen in Halle: Powder Brows 350 EUR, Hairstroke Brows 450 EUR, Beratung und Vorzeichnung bei Salon Elen.",
    keywords: ["Permanent Make-up Augenbrauen Halle", "PMU Augenbrauen Halle", "Powder Brows Halle", "Microblading Halle"],
    heroText:
      "Augenbrauen-PMU bringt Form, Definition und Alltagserleichterung. Ob weiche Powder Brows oder feine Hairstroke-Technik: die Methode wird nach Haut, Stil und Wunschbild gewaehlt.",
    heroImage: "/images/gallery/brow_1.webp",
    heroImageAlt: "Permanent Make-up Augenbrauen in Halle",
    serviceName: "PMU Augenbrauen",
    price: "ab 350 EUR",
    priceCents: 35000,
    duration: "ca. 120 Min.",
    bookingHref: "/booking/services",
    facts: ["Powder Brows 350 EUR", "Hairstroke Brows 450 EUR", "Beratung zur passenden Technik"],
    outcomes: [
      "mehr Symmetrie und klare Brauenform",
      "natuerliche Definition passend zum Gesicht",
      "weniger Aufwand beim taeglichen Schminken",
      "Technik nach Hauttyp: pudrig oder haerchenartig",
    ],
    suitableFor: [
      "lueckenhafte, helle oder ungleichmaessige Brauen",
      "Kundinnen mit wenig Zeit am Morgen",
      "alle, die eine typgerechte Form statt Trend-Brauen moechten",
      "Kundinnen, die zwischen Powder und Hairstroke unsicher sind",
    ],
    process: pmuProcess,
    priceDetails: [
      "Powder Brows: 350 EUR",
      "Hairstroke Brows: 450 EUR",
      "Die Empfehlung erfolgt nach Hauttyp, vorhandenen Haerchen und gewuenschtem Look.",
    ],
    contraindications: pmuContraindications,
    proof: {
      title: "Vorher/Nachher und Technikvergleich",
      intro:
        "Brauen-PMU ist keine Einheitsform. Die Vorzeichnung entscheidet, ob das Ergebnis weich, strukturiert oder etwas markanter wirkt.",
      beforeLabel: "Ausgangsbraue",
      afterLabel: "geplante Definition",
      beforeImage: "/images/gallery/brow_1.webp",
      afterImage: "/images/seo-pages/Permanent_Make-up_2.webp",
      note: "Powder Brows wirken weicher, Hairstroke Brows strukturierter. Wir beraten zur passenden Variante.",
    },
    gallery: [
      { src: "/images/seo-pages/Permanent_Make-up_Brows_0.webp", alt: "PMU Augenbrauen Halle Powder", label: "Powder" },
      {
        src: "/images/seo-pages/Permanent_Make-up_Brows_1.webp",
        alt: "PMU Augenbrauen Halle Hairstroke",
        label: "Hairstroke",
      },
      {
        src: "/images/seo-pages/Permanent_Make-up_Brows_3.webm",
        alt: "Permanent Make-up Brauen Halle",
        label: "PMU",
        mediaType: "video",
        poster: "/images/seo-pages/Permanent_Make-up_Brows_1.webp",
      },
    ],
    feedback: browFeedback,
    faq: [
      {
        question: "Welche Augenbrauen-PMU Technik passt zu mir?",
        answer:
          "Powder Brows passen oft fuer einen weichen, geschminkten Look. Hairstroke Brows passen, wenn eine feinere Haerchenoptik gewuenscht ist.",
      },
      {
        question: "Was kostet Permanent Make-up fuer Augenbrauen?",
        answer: "Powder Brows kosten 350 EUR, Hairstroke Brows kosten 450 EUR.",
      },
      {
        question: "Kann die Form vorher gesehen werden?",
        answer:
          "Ja. Die Form wird vorgezeichnet und erst nach Ihrer Zustimmung pigmentiert.",
      },
      {
        question: "Wie intensiv ist das Ergebnis direkt danach?",
        answer:
          "Frisch pigmentiert wirkt die Farbe intensiver. In der Heilung wird sie weicher und natuerlicher.",
      },
    ],
    relatedSlugs: ["powder-brows-halle", "microblading-halle", "permanent-make-up-in-der-naehe"],
  },
  {
    slug: "permanent-make-up-lippen-halle",
    category: "lips",
    title: "Permanent Make-up Lippen in Halle",
    eyebrow: "Aquarell Lips und 3D Lips",
    metaTitle: "Permanent Make-up Lippen Halle - Lippen PMU | Salon Elen",
    metaDescription:
      "Permanent Make-up fuer Lippen in Halle: Aquarell Lips 380 EUR, 3D Lips 420 EUR, natuerliche Farbe und Beratung bei Salon Elen.",
    keywords: ["Permanent Make-up Lippen Halle", "PMU Lippen Halle", "Lippenpigmentierung Halle", "Aquarell Lips Halle"],
    heroText:
      "Lippen-PMU verleiht den Lippen mehr Frische, weichere Konturen und eine harmonische Farbe. Die Pigmentierung wird nicht nach Schema, sondern nach Typ und Wunsch geplant.",
    heroImage: "/images/gallery/pmu_3.webp",
    heroImageAlt: "Permanent Make-up Lippen in Halle",
    serviceName: "PMU Lippen",
    price: "ab 380 EUR",
    priceCents: 38000,
    duration: "ca. 120 Min.",
    bookingHref: "/booking/services",
    facts: ["Aquarell Lips 380 EUR", "3D Lips 420 EUR", "natuerliche Farbabstimmung"],
    outcomes: [
      "frischere Farbe ohne staendiges Nachschminken",
      "optisch gepflegtere Lippenkontur",
      "weiche Typanpassung statt harter Linie",
      "mehr Sicherheit bei Alltag, Sport und Urlaub",
    ],
    suitableFor: [
      "blasse Lippen oder ungleichmaessige Lippenfarbe",
      "Kundinnen, die einen natuerlichen Frischeeffekt wollen",
      "leichte Kontur-Unregelmaessigkeiten",
      "alle, die Lippenstift dezenter ersetzen moechten",
    ],
    process: pmuProcess,
    priceDetails: [
      "Aquarell Lips: 380 EUR",
      "3D Lips: 420 EUR",
      "Der Farbton wird nach Lippenfarbe, Hauttyp und Wunschintensitaet abgestimmt.",
    ],
    contraindications: pmuContraindications,
    proof: {
      title: "Vorher/Nachher und natuerlicher Farbverlauf",
      intro:
        "Bei Lippen-PMU zaehlt nicht nur die Farbe, sondern auch die weiche Verteilung. Das Ergebnis soll frisch wirken, nicht maskenhaft.",
      beforeLabel: "natuerliche Lippenfarbe",
      afterLabel: "frischer PMU-Effekt",
      beforeImage: "/images/gallery/pmu_2.webp",
      afterImage: "/images/seo-pages/Permanent_Make-up_Lips_3.webp",
      note: "Die endgueltige Wirkung zeigt sich nach der Heilung. Direkt danach ist die Farbe intensiver.",
    },
    gallery: [
      { src: "/images/seo-pages/Permanent_Make-up_Lips_v0.webp", alt: "Permanent Make-up Lippen Halle Ergebnis", label: "3D Lips" },
      { src: "/images/seo-pages/Permanent_Make-up_Lips_v1.webp", alt: "Aquarell Lips Halle", label: "Aquarell" },
      {
        src: "/images/seo-pages/Permanent_Make-up_Lips_v3.webm",
        alt: "Lippenpigmentierung Salon Elen",
        label: "Farbe",
        mediaType: "video",
        poster: "/images/seo-pages/Permanent_Make-up_Lips_v1.webp",
      },
    ],
    feedback: lipFeedback,
    faq: [
      {
        question: "Ist Lippen-PMU sehr auffaellig?",
        answer:
          "Das muss es nicht sein. Viele Kundinnen waehlen einen weichen Frischeeffekt, der im Alltag natuerlich bleibt.",
      },
      {
        question: "Was kostet Permanent Make-up fuer Lippen?",
        answer: "Aquarell Lips kosten 380 EUR, 3D Lips kosten 420 EUR.",
      },
      {
        question: "Wie wird die Farbe ausgesucht?",
        answer:
          "Wir orientieren uns an Ihrer natuerlichen Lippenfarbe, Hauttyp und Wunschintensitaet.",
      },
      {
        question: "Wann ist Lippen-PMU nicht moeglich?",
        answer:
          "Bei akuten Entzuendungen, offenen Stellen oder aktivem Herpes wird der Termin verschoben.",
      },
    ],
    relatedSlugs: ["lippenpigmentierung-halle", "powder-brows-halle", "permanent-make-up-in-der-naehe"],
  },
  {
    slug: "lidstrich-permanent-make-up-halle",
    category: "eyes",
    title: "Lidstrich Permanent Make-up in Halle",
    eyebrow: "dezenter Lidstrich",
    metaTitle: "Lidstrich Permanent Make-up Halle - PMU Augen | Salon Elen",
    metaDescription:
      "Lidstrich Permanent Make-up in Halle: dezente Augenbetonung, Wimpernkranz ab 130 EUR, Beratung und Termin bei Salon Elen.",
    keywords: ["Lidstrich Permanent Make-up Halle", "PMU Lidstrich Halle", "Permanent Eyeliner Halle", "Wimpernkranz Halle"],
    heroText:
      "Ein feiner Permanent-Lidstrich oder eine Wimpernkranzverdichtung betont die Augen dauerhaft und reduziert den Aufwand beim Schminken. Die Form bleibt bewusst typgerecht.",
    heroImage: "/images/gallery/beauty_1.webp",
    heroImageAlt: "Lidstrich Permanent Make-up in Halle",
    serviceName: "Lidstrich / Wimpernkranz",
    price: "ab 130 EUR",
    priceCents: 13000,
    duration: "ca. 60-90 Min.",
    bookingHref: "/booking/services",
    facts: ["Wimpernkranz 130 EUR", "oben + unten 150 EUR", "typgerechte Augenform"],
    outcomes: [
      "klarerer Blick ohne taeglichen Eyeliner",
      "dezente oder definiertere Linie nach Wunsch",
      "dichter wirkender Wimpernansatz",
      "praktisch fuer Sport, Alltag und Urlaub",
    ],
    suitableFor: [
      "Kundinnen, deren Eyeliner schnell verschmiert",
      "helle oder optisch duenne Wimpernlinien",
      "alle, die eine dauerhafte, aber dezente Augenbetonung wollen",
      "Kundinnen, die zwischen Lidstrich und Wimpernkranz unsicher sind",
    ],
    process: pmuProcess,
    priceDetails: [
      "Wimpernkranz / dezente Linie: ab 130 EUR",
      "Wimpernkranz oben + unten: 150 EUR",
      "Die genaue Variante wird nach Augenform und Wunschintensitaet besprochen.",
    ],
    contraindications: pmuContraindications,
    proof: {
      title: "Vorher/Nachher und Linienwirkung",
      intro:
        "Ein guter PMU-Lidstrich passt zur Augenform. Oft ist eine dezente Verdichtung schoener und langlebig harmonischer als eine harte Linie.",
      beforeLabel: "Augenform und Ansatz",
      afterLabel: "definiertere Linie",
      beforeImage: "/images/gallery/beauty_1.webp",
      afterImage: "/images/seo-pages/Permanent_Eyeliner_0.webp",
      note: "Bei empfindlichen oder aktuell gereizten Augen sollte die Behandlung verschoben werden.",
    },
    gallery: [
      { src: "/images/seo-pages/Permanent_Eyeliner_2.webp", alt: "Lidstrich PMU Halle Beratung", label: "Augenform" },
      { src: "/images/seo-pages/Permanent_Eyeliner_1.webp", alt: "Permanent Lidstrich Halle", label: "Linie" },
      {
        src: "/images/seo-pages/Permanent_Eyeliner_3.webm",
        alt: "PMU Augen Salon Elen",
        label: "Definition",
        mediaType: "video",
        poster: "/images/seo-pages/Permanent_Eyeliner_1.webp",
      },
    ],
    feedback: eyeFeedback,
    faq: [
      {
        question: "Was ist besser: Lidstrich oder Wimpernkranz?",
        answer:
          "Fuer ein sehr natuerliches Ergebnis ist die Wimpernkranzverdichtung oft ideal. Ein Lidstrich wirkt definierter.",
      },
      {
        question: "Was kostet ein Permanent-Lidstrich?",
        answer:
          "Die dezente Wimpernkranzvariante startet bei 130 EUR, oben + unten kostet 150 EUR.",
      },
      {
        question: "Kann der Lidstrich sehr fein bleiben?",
        answer:
          "Ja. Die Linie wird an Ihre Augenform und den gewuenschten Ausdruck angepasst.",
      },
      {
        question: "Wann sollte ich keinen Augen-PMU-Termin machen?",
        answer:
          "Bei Augenentzuendungen, akuten Reizungen, frischen Operationen oder offenen Stellen sollte der Termin verschoben werden.",
      },
    ],
    relatedSlugs: ["wimpernkranzverdichtung-halle", "permanent-make-up-in-der-naehe", "permanent-make-up-augenbrauen-halle"],
  },
  {
    slug: "microneedling-halle",
    category: "skin",
    title: "Microneedling in Halle (Saale)",
    eyebrow: "Hautbild und Glow",
    metaTitle: "Microneedling Halle - Hautbild verfeinern | Salon Elen",
    metaDescription:
      "Microneedling in Halle bei Salon Elen: Beratung, Hautanalyse, Behandlungsplan, Pflegehinweise und Terminbuchung fuer ein frischeres Hautbild.",
    keywords: ["Microneedling Halle", "Microneedling Halle Saale", "Kosmetik Halle Haut", "Hautbild verfeinern Halle"],
    heroText:
      "Microneedling ist eine intensive Behandlung fuer ein frischeres, ebenmaessiger wirkendes Hautbild. Wir planen die Behandlung nach Hautzustand, Ziel und Regenerationszeit.",
    heroImage: "/images/gallery/injection_1.webp",
    heroImageAlt: "Microneedling Behandlung in Halle",
    serviceName: "Microneedling",
    price: "nach Hautbild",
    priceCents: null,
    duration: "je nach Behandlungsplan",
    bookingHref: "/booking/services",
    facts: ["Hautanalyse vorab", "Pflegeplan nach der Behandlung", "Preis nach Areal und Ziel"],
    outcomes: [
      "frischer und glatter wirkendes Hautbild",
      "unterstuetzte Regeneration durch gezielte Stimulation",
      "individueller Plan fuer Gesicht, Zonen und Pflege",
      "gute Kombinationsmoeglichkeit mit regelmaessiger Hautpflege",
    ],
    suitableFor: [
      "muede, fahle oder unruhige Haut",
      "leichte Unebenheiten im Hautbild",
      "Kundinnen, die eine intensive Kosmetikbehandlung suchen",
      "alle, die einen strukturierten Pflegeplan statt Zufallsbehandlung moechten",
    ],
    process: [
      {
        title: "Hautanalyse",
        text: "Wir pruefen Hautzustand, Empfindlichkeit, Ziel und ob Microneedling aktuell sinnvoll ist.",
      },
      {
        title: "Reinigung und Vorbereitung",
        text: "Die Haut wird gruendlich vorbereitet, damit die Behandlung sauber und kontrolliert ablaufen kann.",
      },
      {
        title: "Needling nach Plan",
        text: "Die Behandlung erfolgt zonenweise und wird an Hautreaktion und Ziel angepasst.",
      },
      {
        title: "Beruhigung und Aftercare",
        text: "Danach geht es um Beruhigung, Sonnenschutz, Pflege und einen sinnvollen Abstand zur naechsten Behandlung.",
      },
    ],
    priceDetails: [
      "Preis nach Hautbild, Areal und Behandlungsplan",
      "Aktuelle Preise finden Sie in der Preisliste oder direkt in der Beratung.",
      "Je nach Ziel kann eine Serie sinnvoller sein als ein einzelner Termin.",
    ],
    contraindications: skinContraindications,
    proof: {
      title: "Hautbild, Verlauf und Ergebnis",
      intro:
        "Microneedling ist kein Sofortfilter. Die Haut braucht Regeneration, Pflege und Schutz, damit das Ergebnis ruhig wirken kann.",
      beforeLabel: "Hautanalyse",
      afterLabel: "frischer Glow",
      beforeImage: "/images/gallery/injection_1.webp",
      afterImage: "/images/gallery/injection_2.webp",
      note: "Direkte Sonne und aggressive Pflege sollten nach der Behandlung vermieden werden.",
    },
    gallery: [
      { src: "/images/gallery/injection_1.webp", alt: "Microneedling Hautanalyse Halle", label: "Analyse" },
      { src: "/images/gallery/injection_2.webp", alt: "Microneedling Ergebnis Halle", label: "Glow" },
      {
        src: "/images/seo-pages/Microneedling_3.webm",
        alt: "Kosmetik Hautbehandlung Halle",
        label: "Pflege",
        mediaType: "video",
        poster: "/images/gallery/injection_2.webp",
      },
    ],
    feedback: [
      "Viele Kundinnen schaetzen den frischeren Glow nach der Regeneration.",
      "Die Hautanalyse hilft, die Behandlung nicht zu aggressiv zu planen.",
      "Ein klarer Aftercare-Plan macht den Ablauf deutlich entspannter.",
    ],
    faq: [
      {
        question: "Was bringt Microneedling?",
        answer:
          "Microneedling kann das Hautbild frischer und ebenmaessiger wirken lassen. Wichtig sind Hautanalyse, passende Intensitaet und Pflege danach.",
      },
      {
        question: "Was kostet Microneedling in Halle?",
        answer:
          "Der Preis haengt von Hautbild, Areal und Behandlungsplan ab. Wir klaeren das transparent vor dem Termin bzw. in der Beratung.",
      },
      {
        question: "Bin ich danach sofort gesellschaftsfaehig?",
        answer:
          "Die Haut kann geroetet und empfindlich sein. Planen Sie Regenerationszeit ein und vermeiden Sie Sonne sowie aggressive Pflege.",
      },
      {
        question: "Wie oft braucht man Microneedling?",
        answer:
          "Das haengt vom Hautziel ab. Manchmal reicht ein Frischetermin, bei strukturellen Zielen ist eine Serie sinnvoller.",
      },
    ],
    relatedSlugs: ["permanent-make-up-in-der-naehe", "powder-brows-halle", "lippenpigmentierung-halle"],
  },
] satisfies SeoLandingPageData[];

const pmuProcessTranslations: Record<NonGermanSeoLocale, SeoLandingPageData["process"]> = {
  en: [
    {
      title: "Consultation and skin check",
      text: "We discuss your goal, skin type, daily routine and whether the treatment currently makes sense.",
    },
    {
      title: "Shape, pigment tone and pre-draw",
      text: "The shape is mapped and the color is selected calmly. Pigmentation starts only after your approval.",
    },
    {
      title: "Precise pigmentation",
      text: "The treatment is done step by step with focus on hygiene, symmetry and a natural-looking result.",
    },
    {
      title: "Aftercare and follow-up",
      text: "You receive clear aftercare instructions and a realistic plan for healing, review and refresh appointments.",
    },
  ],
  ru: [
    {
      title: "Консультация и проверка кожи",
      text: "Мы обсуждаем желаемый результат, тип кожи, привычки и подходит ли процедура именно сейчас.",
    },
    {
      title: "Форма, оттенок и эскиз",
      text: "Форма заранее прорисовывается, оттенок спокойно подбирается. Пигментация начинается только после вашего согласия.",
    },
    {
      title: "Аккуратная пигментация",
      text: "Процедура проходит поэтапно с фокусом на гигиену, симметрию и естественный результат.",
    },
    {
      title: "Уход и контроль",
      text: "Вы получаете понятные рекомендации по уходу и реалистичный план заживления, контроля и обновления.",
    },
  ],
};

const skinProcessTranslations: Record<NonGermanSeoLocale, SeoLandingPageData["process"]> = {
  en: [
    {
      title: "Skin analysis",
      text: "We check skin condition, sensitivity, goals and whether microneedling is currently suitable.",
    },
    {
      title: "Cleansing and preparation",
      text: "The skin is prepared thoroughly so the treatment can be clean, controlled and comfortable.",
    },
    {
      title: "Needling by plan",
      text: "The treatment is performed zone by zone and adjusted to your skin response and goal.",
    },
    {
      title: "Calming and aftercare",
      text: "Afterwards we focus on calming, sun protection, care and the right interval before the next session.",
    },
  ],
  ru: [
    {
      title: "Анализ кожи",
      text: "Мы оцениваем состояние кожи, чувствительность, цель и подходит ли microneedling сейчас.",
    },
    {
      title: "Очищение и подготовка",
      text: "Кожа тщательно подготавливается, чтобы процедура прошла чисто, контролируемо и комфортно.",
    },
    {
      title: "Needling по плану",
      text: "Процедура выполняется по зонам и адаптируется к реакции кожи и вашей цели.",
    },
    {
      title: "Успокоение и уход",
      text: "После процедуры важны успокоение кожи, SPF, правильный уход и разумный интервал до следующего сеанса.",
    },
  ],
};

const pmuContraindicationTranslations: Record<NonGermanSeoLocale, string[]> = {
  en: [
    "pregnancy and breastfeeding",
    "acute inflammation, herpes or open skin in the treatment area",
    "recent Botox or filler treatments in the treatment area",
    "blood thinners, clotting disorders or strong keloid tendency",
    "uncontrolled diabetes, fever or acute infections",
    "known allergies to pigments, aftercare products or numbing products",
    "if you are unsure, please clarify medical questions before booking",
  ],
  ru: [
    "беременность и период грудного вскармливания",
    "острые воспаления, герпес или открытые участки кожи в зоне процедуры",
    "недавний Botox или filler в зоне процедуры",
    "препараты для разжижения крови, нарушения свертываемости или выраженная склонность к келоидам",
    "некомпенсированный диабет, температура или острые инфекции",
    "известные аллергии на пигменты, уходовые средства или обезболивание",
    "если есть сомнения, медицинские вопросы лучше уточнить до записи",
  ],
};

const skinContraindicationTranslations: Record<NonGermanSeoLocale, string[]> = {
  en: [
    "pregnancy and breastfeeding",
    "acute inflammation, active acne, herpes or open skin",
    "recent intensive peels, laser treatments or sunburn",
    "blood thinners, clotting disorders or strong keloid tendency",
    "uncontrolled diabetes, fever or acute infections",
    "very irritated skin, active rosacea flare-ups or eczema",
    "if you are unsure, please clarify medical questions before booking",
  ],
  ru: [
    "беременность и период грудного вскармливания",
    "острые воспаления, активное акне, герпес или открытые участки кожи",
    "недавние интенсивные пилинги, лазерные процедуры или солнечный ожог",
    "препараты для разжижения крови, нарушения свертываемости или выраженная склонность к келоидам",
    "некомпенсированный диабет, температура или острые инфекции",
    "сильно раздраженная кожа, активная rosacea или экзема",
    "если есть сомнения, медицинские вопросы лучше уточнить до записи",
  ],
};

const browFeedbackTranslations: Record<NonGermanSeoLocale, string[]> = {
  en: [
    "The brows look groomed without looking painted on.",
    "The pre-draw gives confidence because you see the shape beforehand.",
    "Many clients appreciate getting ready faster in the morning.",
  ],
  ru: [
    "Брови выглядят ухоженно, но не как нарисованные.",
    "Эскиз заранее дает спокойствие, потому что форму видно до процедуры.",
    "Многие клиентки ценят, что утром макияж занимает меньше времени.",
  ],
};

const lipFeedbackTranslations: Record<NonGermanSeoLocale, string[]> = {
  en: [
    "The lips look fresher without looking like lipstick.",
    "The pigment tone is selected calmly and not too harsh.",
    "Many clients like the well-groomed effect in everyday life.",
  ],
  ru: [
    "Губы выглядят свежее, но не как плотная помада.",
    "Оттенок подбирается спокойно и без чрезмерной жесткости.",
    "Многие клиентки любят ухоженный эффект на каждый день.",
  ],
};

const eyeFeedbackTranslations: Record<NonGermanSeoLocale, string[]> = {
  en: [
    "The eyes look more defined, even without daily eyeliner.",
    "The line stays discreet and is adapted to the eye shape.",
    "Many clients choose this treatment for a fresher expression.",
  ],
  ru: [
    "Взгляд выглядит более выразительным даже без ежедневного eyeliner.",
    "Линия остается деликатной и подбирается под форму глаз.",
    "Многие клиентки выбирают процедуру для более свежего выражения лица.",
  ],
};

const skinFeedbackTranslations: Record<NonGermanSeoLocale, string[]> = {
  en: [
    "Many clients appreciate the fresher glow after regeneration.",
    "The skin analysis helps avoid planning the treatment too aggressively.",
    "A clear aftercare plan makes the process noticeably calmer.",
  ],
  ru: [
    "Многие клиентки отмечают более свежий glow после восстановления.",
    "Анализ кожи помогает не планировать процедуру слишком агрессивно.",
    "Понятный план ухода делает весь процесс заметно спокойнее.",
  ],
};

const seoLandingPageTranslations: Record<
  string,
  Partial<Record<NonGermanSeoLocale, SeoLandingPageTranslation>>
> = {
  "powder-brows-halle": {
    en: {
      title: "Powder Brows in Halle (Saale)",
      eyebrow: "PMU brows",
      metaTitle: "Powder Brows Halle - natural PMU brows | Salon Elen",
      metaDescription:
        "Powder Brows in Halle (Saale): soft powder shading, consultation, pre-draw, price 350 EUR and online booking at Salon Elen.",
      keywords: [
        "Powder Brows Halle",
        "Powder Brows Halle Saale",
        "PMU brows Halle",
        "permanent make-up brows Halle",
      ],
      heroText:
        "Soft, powdery brows for a groomed look without a harsh outline. Ideal when your brows should look defined every day but still natural.",
      heroImageAlt: "Powder Brows result at Salon Elen in Halle",
      serviceName: "Powder Brows",
      price: "350 EUR",
      duration: "about 120 min.",
      facts: ["Lessingstrasse 37, 06114 Halle", "soft powder effect", "consultation and pre-draw included"],
      outcomes: [
        "even-looking brows without daily drawing",
        "soft shading instead of a hard block shape",
        "color and intensity matched to skin, hair and style",
        "more expression with a natural-looking finish",
      ],
      suitableFor: [
        "thin or patchy brows",
        "light brows that need more definition",
        "clients who want a groomed everyday look",
        "anyone looking for a softer alternative to strong brow make-up",
      ],
      process: pmuProcessTranslations.en,
      priceDetails: [
        "Powder Brows: 350 EUR",
        "Duration: about 120 minutes",
        "Refresh or correction appointments are discussed separately depending on timing.",
      ],
      contraindications: pmuContraindicationTranslations.en,
      proof: {
        title: "Before/after and result effect",
        intro:
          "With Powder Brows the result changes during healing: fresh pigment looks stronger, then becomes softer and easier to wear every day.",
        beforeLabel: "starting shape and planning",
        afterLabel: "soft powder effect",
        note: "We are happy to show more approved before/after examples during consultation.",
      },
      gallery: [
        { alt: "Powder Brows shape planning in Halle", label: "Shape" },
        { alt: "Powder Brows shading in Halle", label: "Shading" },
        { alt: "PMU brows at Salon Elen", label: "PMU" },
      ],
      feedback: browFeedbackTranslations.en,
      faq: [
        {
          question: "How natural do Powder Brows look?",
          answer:
            "The technique is designed for a soft powder effect. We agree on the intensity beforehand so the brows do not look too harsh.",
        },
        {
          question: "How long does an appointment take?",
          answer: "Please plan about 120 minutes for consultation, pre-draw and pigmentation.",
        },
        {
          question: "Are Powder Brows better than Microblading?",
          answer:
            "Powder Brows look softer and more powdery. Microblading or hairstroke brows imitate fine hairs. We clarify which technique fits you during consultation.",
        },
        {
          question: "Can I work normally afterwards?",
          answer:
            "Usually yes. The brows look more intense at first and need a calm healing phase with suitable aftercare.",
        },
      ],
    },
    ru: {
      title: "Powder Brows в Halle (Saale)",
      eyebrow: "PMU бровей",
      metaTitle: "Powder Brows Halle - естественный PMU бровей | Salon Elen",
      metaDescription:
        "Powder Brows в Halle (Saale): мягкая пудровая растушевка, консультация, эскиз, цена 350 EUR и онлайн-запись в Salon Elen.",
      keywords: [
        "Powder Brows Halle",
        "Powder Brows Halle Saale",
        "PMU бровей Halle",
        "перманентный макияж бровей Halle",
      ],
      heroText:
        "Мягкие пудровые брови для ухоженного вида без жесткой формы. Подходит, если брови должны каждый день выглядеть аккуратно и при этом естественно.",
      heroImageAlt: "Результат Powder Brows в Salon Elen в Halle",
      serviceName: "Powder Brows",
      price: "350 EUR",
      duration: "около 120 мин.",
      facts: ["Lessingstrasse 37, 06114 Halle", "мягкий пудровый эффект", "консультация и эскиз включены"],
      outcomes: [
        "ровно выглядящие брови без ежедневного прорисовывания",
        "мягкая растушевка вместо жесткой формы",
        "цвет и интенсивность подбираются под кожу, волосы и стиль",
        "больше выразительности при естественном результате",
      ],
      suitableFor: [
        "тонкие или редкие брови",
        "светлые брови, которым нужна четкость",
        "клиентки, которые хотят ухоженный образ на каждый день",
        "те, кто ищет мягкую альтернативу яркому макияжу бровей",
      ],
      process: pmuProcessTranslations.ru,
      priceDetails: [
        "Powder Brows: 350 EUR",
        "Длительность: около 120 минут",
        "Обновление или коррекция обсуждаются отдельно в зависимости от срока.",
      ],
      contraindications: pmuContraindicationTranslations.ru,
      proof: {
        title: "До/после и эффект результата",
        intro:
          "Результат Powder Brows меняется во время заживления: сразу цвет ярче, затем он становится мягче и естественнее для повседневной жизни.",
        beforeLabel: "исходная форма и планирование",
        afterLabel: "мягкий powder-эффект",
        note: "Дополнительные согласованные примеры до/после мы можем показать на консультации.",
      },
      gallery: [
        { alt: "Планирование формы Powder Brows в Halle", label: "Форма" },
        { alt: "Растушевка Powder Brows в Halle", label: "Растушевка" },
        { alt: "PMU бровей в Salon Elen", label: "PMU" },
      ],
      feedback: browFeedbackTranslations.ru,
      faq: [
        {
          question: "Насколько естественно выглядят Powder Brows?",
          answer:
            "Техника рассчитана на мягкий пудровый эффект. Интенсивность заранее согласовывается, чтобы брови не выглядели слишком жестко.",
        },
        {
          question: "Сколько длится процедура?",
          answer: "На консультацию, эскиз и пигментацию обычно нужно около 120 минут.",
        },
        {
          question: "Powder Brows лучше, чем Microblading?",
          answer:
            "Powder Brows выглядят мягче и пудровее. Microblading или hairstroke имитирует отдельные волоски. Подходящую технику мы подбираем на консультации.",
        },
        {
          question: "Можно ли сразу работать после процедуры?",
          answer:
            "Обычно да. Сначала брови выглядят ярче, затем им нужен спокойный период заживления и правильный уход.",
        },
      ],
    },
  },
  "microblading-halle": {
    en: {
      title: "Microblading in Halle (Saale)",
      eyebrow: "Hairstroke Brows",
      metaTitle: "Microblading Halle - fine hairstroke brows | Salon Elen",
      metaDescription:
        "Microblading/Hairstroke Brows in Halle: fine hair-like structure, consultation, pre-draw, price 450 EUR and online booking at Salon Elen.",
      keywords: ["Microblading Halle", "Hairstroke Brows Halle", "hair strokes Halle", "brow PMU Halle"],
      heroText:
        "Fine hairstroke work for brows with visible structure. This treatment suits you if your brows should look naturally fuller and carefully shaped.",
      heroImageAlt: "Microblading and Hairstroke Brows in Halle",
      serviceName: "Hairstroke Brows / Microblading",
      price: "450 EUR",
      duration: "about 120 min.",
      facts: ["fine hair-like look", "individual shape mapping", "natural structured effect"],
      outcomes: [
        "visibly fuller brows with fine structure",
        "shape balance for gaps or asymmetry",
        "more expression without daily drawing",
        "individual adjustment to face and existing brow hairs",
      ],
      suitableFor: [
        "patchy brows with a remaining natural shape",
        "clients who prefer hairstrokes over a powder effect",
        "light or uneven eyebrows",
        "anyone looking for natural definition",
      ],
      process: pmuProcessTranslations.en,
      priceDetails: [
        "Hairstroke Brows / Microblading: 450 EUR",
        "Duration: about 120 minutes",
        "The right technique is selected according to skin type and desired look.",
      ],
      contraindications: pmuContraindicationTranslations.en,
      proof: {
        title: "Before/after and hairstroke effect",
        intro:
          "The most important step is the pre-draw: shape, direction and density should fit the natural brow growth.",
        beforeLabel: "natural starting brow",
        afterLabel: "finer structure",
        note: "For very oily skin, a powder technique can sometimes be more durable. We clarify this in person.",
      },
      gallery: [
        { alt: "Hairstroke Brows in Halle", label: "Hairstrokes" },
        { alt: "Microblading consultation in Halle", label: "Consultation" },
        { alt: "Eyebrow permanent make-up in Halle", label: "Detail" },
      ],
      feedback: browFeedbackTranslations.en,
      faq: [
        {
          question: "Is Microblading the same as Hairstroke Brows?",
          answer:
            "Both terms are often used for a fine hair-like look. In the salon we clarify which method suits your skin type and goal.",
        },
        {
          question: "What does Microblading cost at Salon Elen in Halle?",
          answer: "The Hairstroke Brows treatment costs 450 EUR.",
        },
        {
          question: "Who may not be ideal for Microblading?",
          answer:
            "For very oily, large-pored or highly reactive skin, a powder technique can sometimes be the better choice.",
        },
        {
          question: "How is the shape decided?",
          answer:
            "The shape is measured and pre-drawn before pigmentation. Treatment starts only when you are satisfied.",
        },
      ],
    },
    ru: {
      title: "Microblading в Halle (Saale)",
      eyebrow: "Hairstroke Brows",
      metaTitle: "Microblading Halle - тонкая волосковая техника | Salon Elen",
      metaDescription:
        "Microblading/Hairstroke Brows в Halle: тонкая волосковая техника, консультация, эскиз, цена 450 EUR и онлайн-запись в Salon Elen.",
      keywords: ["Microblading Halle", "Hairstroke Brows Halle", "волосковая техника Halle", "PMU бровей Halle"],
      heroText:
        "Тонкая волосковая техника для бровей с видимой структурой. Подходит, если брови должны выглядеть естественно более густыми и аккуратно оформленными.",
      heroImageAlt: "Microblading и Hairstroke Brows в Halle",
      serviceName: "Hairstroke Brows / Microblading",
      price: "450 EUR",
      duration: "около 120 мин.",
      facts: ["тонкий волосковый эффект", "индивидуальная разметка формы", "естественный структурный результат"],
      outcomes: [
        "визуально более густые брови с тонкой структурой",
        "выравнивание формы при пробелах или асимметрии",
        "больше выразительности без ежедневного прорисовывания",
        "адаптация под лицо и собственные волоски",
      ],
      suitableFor: [
        "редкие брови с сохраненной собственной формой",
        "клиентки, которые хотят волосковый эффект вместо пудрового",
        "светлые или неровные брови",
        "те, кто ищет естественную четкость",
      ],
      process: pmuProcessTranslations.ru,
      priceDetails: [
        "Hairstroke Brows / Microblading: 450 EUR",
        "Длительность: около 120 минут",
        "Подходящая техника выбирается по типу кожи и желаемому результату.",
      ],
      contraindications: pmuContraindicationTranslations.ru,
      proof: {
        title: "До/после и волосковый эффект",
        intro:
          "Самый важный этап - эскиз: форма, направление и плотность должны сочетаться с естественным ростом бровей.",
        beforeLabel: "естественная исходная бровь",
        afterLabel: "более тонкая структура",
        note: "При очень жирной коже пудровая техника иногда держится лучше. Это мы уточняем на месте.",
      },
      gallery: [
        { alt: "Hairstroke Brows в Halle", label: "Волосковая техника" },
        { alt: "Консультация Microblading в Halle", label: "Консультация" },
        { alt: "Перманентный макияж бровей в Halle", label: "Деталь" },
      ],
      feedback: browFeedbackTranslations.ru,
      faq: [
        {
          question: "Microblading и Hairstroke Brows - это одно и то же?",
          answer:
            "Оба названия часто используют для тонкого волоскового эффекта. В салоне мы уточняем, какая методика подходит вашему типу кожи и цели.",
        },
        {
          question: "Сколько стоит Microblading в Salon Elen в Halle?",
          answer: "Процедура Hairstroke Brows стоит 450 EUR.",
        },
        {
          question: "Кому Microblading может не подойти?",
          answer:
            "При очень жирной, пористой или сильно реактивной коже иногда лучше подходит пудровая техника.",
        },
        {
          question: "Как определяется форма?",
          answer:
            "Форма измеряется и прорисовывается до пигментации. Процедура начинается только когда вы довольны эскизом.",
        },
      ],
    },
  },
  "lippenpigmentierung-halle": {
    en: {
      title: "Lip Pigmentation in Halle (Saale)",
      eyebrow: "PMU lips",
      metaTitle: "Lip Pigmentation Halle - Aquarelle Lips & 3D Lips | Salon Elen",
      metaDescription:
        "Lip pigmentation in Halle: Aquarelle Lips from 380 EUR, 3D Lips 420 EUR, natural color, consultation and online booking at Salon Elen.",
      keywords: ["Lip pigmentation Halle", "Aquarelle Lips Halle", "PMU lips Halle", "permanent make-up lips Halle"],
      heroText:
        "Fresher lip color, softer contours and a groomed look without constant touch-ups. The pigmentation is planned to match your type.",
      heroImageAlt: "Lip pigmentation at Salon Elen in Halle",
      serviceName: "Lip Pigmentation",
      price: "from 380 EUR",
      duration: "about 120 min.",
      facts: ["Aquarelle Lips from 380 EUR", "3D Lips 420 EUR", "pigment tone matched to type and goal"],
      outcomes: [
        "fresher everyday lip color",
        "softer and more harmonious lip contour",
        "less need for lipstick or lip liner",
        "natural effect instead of a hard outline",
      ],
      suitableFor: [
        "pale or uneven lip color",
        "clients who want a fresh everyday look",
        "slight asymmetry in the lip contour",
        "anyone who wants a softer alternative to lipstick",
      ],
      process: pmuProcessTranslations.en,
      priceDetails: [
        "Aquarelle Lips: 380 EUR",
        "3D Lips: 420 EUR",
        "We choose the suitable option according to desired color, lip shape and intensity.",
      ],
      contraindications: pmuContraindicationTranslations.en,
      proof: {
        title: "Before/after and color healing",
        intro:
          "Lips look stronger directly after treatment. After healing, the color becomes softer and more natural.",
        beforeLabel: "color and contour check",
        afterLabel: "fresh lip look",
        note: "If you tend to get cold sores, please tell us before booking.",
      },
      gallery: [
        { alt: "Aquarelle Lips in Halle", label: "Aquarelle" },
        { alt: "Lip PMU in Halle", label: "Color" },
        { alt: "Permanent make-up lips at Salon Elen", label: "Look" },
      ],
      feedback: lipFeedbackTranslations.en,
      faq: [
        {
          question: "What is the difference between Aquarelle Lips and 3D Lips?",
          answer:
            "Aquarelle Lips look especially soft and fresh. 3D Lips are slightly more intense and can create more visual volume.",
        },
        {
          question: "What does lip pigmentation cost in Halle?",
          answer: "Aquarelle Lips cost 380 EUR, 3D Lips cost 420 EUR.",
        },
        {
          question: "Does lip pigmentation look like lipstick?",
          answer:
            "The goal is a natural, fresh tone. We agree on the intensity together before treatment.",
        },
        {
          question: "What is important with cold sores?",
          answer:
            "If you are prone to cold sores, please mention this before treatment so the appointment can be planned properly.",
        },
      ],
    },
    ru: {
      title: "Пигментация губ в Halle (Saale)",
      eyebrow: "PMU губ",
      metaTitle: "Пигментация губ Halle - Aquarell Lips & 3D Lips | Salon Elen",
      metaDescription:
        "Пигментация губ в Halle: Aquarell Lips от 380 EUR, 3D Lips 420 EUR, естественный цвет, консультация и онлайн-запись в Salon Elen.",
      keywords: ["пигментация губ Halle", "Aquarell Lips Halle", "PMU губ Halle", "перманентный макияж губ Halle"],
      heroText:
        "Более свежий цвет губ, мягкие контуры и ухоженный вид без постоянного подкрашивания. Пигментация планируется так, чтобы подходить вашему типажу.",
      heroImageAlt: "Пигментация губ в Salon Elen в Halle",
      serviceName: "Пигментация губ",
      price: "от 380 EUR",
      duration: "около 120 мин.",
      facts: ["Aquarell Lips от 380 EUR", "3D Lips 420 EUR", "оттенок под типаж и желание"],
      outcomes: [
        "более свежий цвет губ на каждый день",
        "мягкий и гармоничный контур губ",
        "меньше потребности в помаде или карандаше",
        "естественный эффект вместо жесткой линии",
      ],
      suitableFor: [
        "бледный или неравномерный цвет губ",
        "клиентки, которые хотят свежий повседневный образ",
        "легкая асимметрия контура губ",
        "те, кто хочет деликатно заменить помаду",
      ],
      process: pmuProcessTranslations.ru,
      priceDetails: [
        "Aquarell Lips: 380 EUR",
        "3D Lips: 420 EUR",
        "Подходящий вариант выбирается по желаемому оттенку, форме губ и интенсивности.",
      ],
      contraindications: pmuContraindicationTranslations.ru,
      proof: {
        title: "До/после и заживление цвета",
        intro:
          "Сразу после процедуры губы выглядят ярче. После заживления оттенок становится мягче и естественнее.",
        beforeLabel: "проверка цвета и контура",
        afterLabel: "свежий вид губ",
        note: "Если у вас бывает герпес на губах, пожалуйста, скажите об этом заранее.",
      },
      gallery: [
        { alt: "Aquarell Lips в Halle", label: "Aquarell" },
        { alt: "PMU губ в Halle", label: "Цвет" },
        { alt: "Перманентный макияж губ Salon Elen", label: "Образ" },
      ],
      feedback: lipFeedbackTranslations.ru,
      faq: [
        {
          question: "В чем разница между Aquarell Lips и 3D Lips?",
          answer:
            "Aquarell Lips выглядят особенно мягко и свежо. 3D Lips немного интенсивнее и могут дать больше визуального объема.",
        },
        {
          question: "Сколько стоит пигментация губ в Halle?",
          answer: "Aquarell Lips стоят 380 EUR, 3D Lips стоят 420 EUR.",
        },
        {
          question: "Пигментация губ выглядит как помада?",
          answer:
            "Цель - естественный свежий оттенок. Интенсивность мы заранее согласовываем вместе.",
        },
        {
          question: "Что важно при склонности к герпесу?",
          answer:
            "Если у вас бывает герпес на губах, обязательно скажите об этом до процедуры, чтобы правильно спланировать запись.",
        },
      ],
    },
  },
  "wimpernkranzverdichtung-halle": {
    en: {
      title: "Lashline Enhancement in Halle (Saale)",
      eyebrow: "PMU eyes",
      metaTitle: "Lashline Enhancement Halle - discreet eye PMU | Salon Elen",
      metaDescription:
        "Lashline enhancement in Halle: subtle definition of the lash line from 130 EUR, consultation, aftercare guidance and online booking at Salon Elen.",
      keywords: ["Lashline enhancement Halle", "PMU eyes Halle", "lash line Halle", "permanent make-up eyes Halle"],
      heroText:
        "A fine pigmentation between the lashes for more expression without looking like a hard eyeliner. Discreet, wearable and adapted to your eye shape.",
      heroImageAlt: "Lashline enhancement at Salon Elen in Halle",
      serviceName: "Lashline Enhancement",
      price: "from 130 EUR",
      duration: "about 60-90 min.",
      facts: ["lashline 130 EUR", "upper + lower 150 EUR", "subtle eye definition"],
      outcomes: [
        "visually fuller lash base",
        "more defined eyes without daily eyeliner",
        "very natural effect with eyes open or closed",
        "practical for everyday life, holidays and sport",
      ],
      suitableFor: [
        "light or visually sparse lash lines",
        "clients who do not want a visible eyeliner",
        "contact lens or glasses wearers after individual consultation",
        "anyone who wants to get ready faster in the morning",
      ],
      process: pmuProcessTranslations.en,
      priceDetails: [
        "Lashline enhancement: 130 EUR",
        "Upper + lower lashline: 150 EUR",
        "Duration depending on option: about 60 to 90 minutes.",
      ],
      contraindications: pmuContraindicationTranslations.en,
      proof: {
        title: "Before/after and discreet definition",
        intro:
          "The lash line is not filled like heavy make-up. It is enhanced finely at the lash base, so the eyes look clearer without looking overloaded.",
        beforeLabel: "natural lash line",
        afterLabel: "enhanced lash base",
        note: "The exact intensity is adapted to eye shape, lash color and desired result.",
      },
      gallery: [
        { alt: "Lashline PMU in Halle", label: "Lashline" },
        { alt: "Subtle eye definition in Halle", label: "Eyes" },
        { alt: "Permanent make-up eyes in Halle", label: "PMU" },
      ],
      feedback: eyeFeedbackTranslations.en,
      faq: [
        {
          question: "Does lashline enhancement look like eyeliner?",
          answer:
            "No, it is more subtle. The pigment is placed very finely at the lash base so the lashes look denser.",
        },
        {
          question: "What does lashline enhancement cost?",
          answer: "The discreet lashline enhancement costs 130 EUR, upper + lower 150 EUR.",
        },
        {
          question: "Is the treatment suitable for sensitive eyes?",
          answer:
            "We clarify this individually. Acute irritation, inflammation or eye infections are reasons to postpone the appointment.",
        },
        {
          question: "How long does the appointment take?",
          answer: "Depending on the option, please plan about 60 to 90 minutes.",
        },
      ],
    },
    ru: {
      title: "Межресничное пространство в Halle (Saale)",
      eyebrow: "PMU глаз",
      metaTitle: "Межресничка Halle - деликатный PMU глаз | Salon Elen",
      metaDescription:
        "Межресничное пространство в Halle: деликатное подчеркивание линии ресниц от 130 EUR, консультация, уход и онлайн-запись в Salon Elen.",
      keywords: ["межресничка Halle", "PMU глаз Halle", "lash line Halle", "перманентный макияж глаз Halle"],
      heroText:
        "Тонкая пигментация между ресницами для более выразительного взгляда без эффекта жесткого eyeliner. Деликатно, удобно на каждый день и с учетом формы глаз.",
      heroImageAlt: "Межресничка в Salon Elen в Halle",
      serviceName: "Межресничное пространство",
      price: "от 130 EUR",
      duration: "около 60-90 мин.",
      facts: ["межресничка 130 EUR", "верх + низ 150 EUR", "деликатное подчеркивание глаз"],
      outcomes: [
        "визуально более густой ресничный край",
        "выразительный взгляд без ежедневного eyeliner",
        "очень естественный эффект с открытыми и закрытыми глазами",
        "удобно для повседневности, отпуска и спорта",
      ],
      suitableFor: [
        "светлая или визуально редкая линия роста ресниц",
        "клиентки, которые не хотят заметный стрелочный эффект",
        "носительницы линз или очков после индивидуальной консультации",
        "те, кто хочет быстрее собираться утром",
      ],
      process: pmuProcessTranslations.ru,
      priceDetails: [
        "Межресничное пространство: 130 EUR",
        "Верх + низ: 150 EUR",
        "Длительность в зависимости от варианта: около 60-90 минут.",
      ],
      contraindications: pmuContraindicationTranslations.ru,
      proof: {
        title: "До/после и деликатная выразительность",
        intro:
          "Линия ресниц не заполняется как плотный макияж. Пигмент ставится тонко у основания ресниц, поэтому взгляд выглядит четче, но не перегруженно.",
        beforeLabel: "естественная линия ресниц",
        afterLabel: "подчеркнутый ресничный край",
        note: "Точная интенсивность подбирается под форму глаз, цвет ресниц и желаемый результат.",
      },
      gallery: [
        { alt: "PMU межреснички в Halle", label: "Межресничка" },
        { alt: "Деликатное подчеркивание глаз в Halle", label: "Глаза" },
        { alt: "Перманентный макияж глаз в Halle", label: "PMU" },
      ],
      feedback: eyeFeedbackTranslations.ru,
      faq: [
        {
          question: "Межресничка выглядит как eyeliner?",
          answer:
            "Нет, она деликатнее. Пигмент ставится очень тонко у основания ресниц, чтобы ресницы визуально выглядели гуще.",
        },
        {
          question: "Сколько стоит межресничка?",
          answer: "Деликатная межресничка стоит 130 EUR, верх + низ - 150 EUR.",
        },
        {
          question: "Подходит ли процедура для чувствительных глаз?",
          answer:
            "Это уточняется индивидуально. Острые раздражения, воспаления или инфекции глаз - причина перенести запись.",
        },
        {
          question: "Сколько длится процедура?",
          answer: "В зависимости от варианта нужно планировать примерно 60-90 минут.",
        },
      ],
    },
  },
  "permanent-make-up-augenbrauen-halle": {
    en: {
      title: "Permanent Make-up Brows in Halle",
      eyebrow: "Powder Brows and Hairstroke",
      metaTitle: "Permanent Make-up Brows Halle - Powder & Hairstroke | Salon Elen",
      metaDescription:
        "Permanent make-up for brows in Halle: Powder Brows 350 EUR, Hairstroke Brows 450 EUR, consultation and pre-draw at Salon Elen.",
      keywords: ["Permanent make-up brows Halle", "PMU brows Halle", "Powder Brows Halle", "Microblading Halle"],
      heroText:
        "Brow PMU brings shape, definition and an easier daily routine. Whether soft Powder Brows or fine hairstroke technique, the method is chosen according to skin, style and desired result.",
      heroImageAlt: "Permanent make-up brows in Halle",
      serviceName: "PMU brows",
      price: "from 350 EUR",
      duration: "about 120 min.",
      facts: ["Powder Brows 350 EUR", "Hairstroke Brows 450 EUR", "consultation for the right technique"],
      outcomes: [
        "more symmetry and a clear brow shape",
        "natural definition matched to your face",
        "less effort with daily make-up",
        "technique selected by skin type: powdery or hairstroke",
      ],
      suitableFor: [
        "patchy, light or uneven brows",
        "clients with little time in the morning",
        "anyone who wants a type-appropriate shape instead of trend brows",
        "clients unsure between Powder and Hairstroke",
      ],
      process: pmuProcessTranslations.en,
      priceDetails: [
        "Powder Brows: 350 EUR",
        "Hairstroke Brows: 450 EUR",
        "The recommendation depends on skin type, existing hairs and desired look.",
      ],
      contraindications: pmuContraindicationTranslations.en,
      proof: {
        title: "Before/after and technique comparison",
        intro:
          "Brow PMU is not one fixed shape. The pre-draw determines whether the result looks soft, structured or a little more defined.",
        beforeLabel: "starting brow",
        afterLabel: "planned definition",
        note: "Powder Brows look softer, Hairstroke Brows more structured. We advise you on the right option.",
      },
      gallery: [
        { alt: "PMU brows Halle powder technique", label: "Powder" },
        { alt: "PMU brows Halle hairstroke technique", label: "Hairstroke" },
        { alt: "Permanent make-up brows in Halle", label: "PMU" },
      ],
      feedback: browFeedbackTranslations.en,
      faq: [
        {
          question: "Which brow PMU technique suits me?",
          answer:
            "Powder Brows often suit a soft, made-up look. Hairstroke Brows suit clients who want a finer hair-like effect.",
        },
        {
          question: "What does permanent make-up for brows cost?",
          answer: "Powder Brows cost 350 EUR, Hairstroke Brows cost 450 EUR.",
        },
        {
          question: "Can I see the shape beforehand?",
          answer: "Yes. The shape is pre-drawn and only pigmented after your approval.",
        },
        {
          question: "How intense is the result directly afterwards?",
          answer: "Fresh pigment looks more intense. During healing, the color becomes softer and more natural.",
        },
      ],
    },
    ru: {
      title: "Перманентный макияж бровей в Halle",
      eyebrow: "Powder Brows и Hairstroke",
      metaTitle: "Перманентный макияж бровей Halle - Powder & Hairstroke | Salon Elen",
      metaDescription:
        "Перманентный макияж бровей в Halle: Powder Brows 350 EUR, Hairstroke Brows 450 EUR, консультация и эскиз в Salon Elen.",
      keywords: ["перманентный макияж бровей Halle", "PMU бровей Halle", "Powder Brows Halle", "Microblading Halle"],
      heroText:
        "PMU бровей дает форму, четкость и облегчает ежедневный макияж. Мягкие Powder Brows или тонкая Hairstroke-техника подбираются по коже, стилю и желаемому результату.",
      heroImageAlt: "Перманентный макияж бровей в Halle",
      serviceName: "PMU бровей",
      price: "от 350 EUR",
      duration: "около 120 мин.",
      facts: ["Powder Brows 350 EUR", "Hairstroke Brows 450 EUR", "консультация по подходящей технике"],
      outcomes: [
        "больше симметрии и понятная форма бровей",
        "естественная четкость под черты лица",
        "меньше времени на ежедневный макияж",
        "техника по типу кожи: пудровая или волосковая",
      ],
      suitableFor: [
        "редкие, светлые или неравномерные брови",
        "клиентки, у которых мало времени утром",
        "те, кто хочет форму под типаж, а не трендовые брови",
        "клиентки, которые выбирают между Powder и Hairstroke",
      ],
      process: pmuProcessTranslations.ru,
      priceDetails: [
        "Powder Brows: 350 EUR",
        "Hairstroke Brows: 450 EUR",
        "Рекомендация зависит от типа кожи, собственных волосков и желаемого образа.",
      ],
      contraindications: pmuContraindicationTranslations.ru,
      proof: {
        title: "До/после и сравнение техник",
        intro:
          "PMU бровей - это не одна универсальная форма. Эскиз определяет, будет ли результат мягким, структурным или более выразительным.",
        beforeLabel: "исходная бровь",
        afterLabel: "планируемая четкость",
        note: "Powder Brows выглядят мягче, Hairstroke Brows - структурнее. Мы подскажем подходящий вариант.",
      },
      gallery: [
        { alt: "PMU бровей Halle powder-техника", label: "Powder" },
        { alt: "PMU бровей Halle hairstroke-техника", label: "Hairstroke" },
        { alt: "Перманентный макияж бровей в Halle", label: "PMU" },
      ],
      feedback: browFeedbackTranslations.ru,
      faq: [
        {
          question: "Какая техника PMU бровей мне подойдет?",
          answer:
            "Powder Brows часто подходят для мягкого ухоженного эффекта. Hairstroke Brows подходят, если хочется более тонкую волосковую структуру.",
        },
        {
          question: "Сколько стоит перманентный макияж бровей?",
          answer: "Powder Brows стоят 350 EUR, Hairstroke Brows стоят 450 EUR.",
        },
        {
          question: "Можно ли увидеть форму заранее?",
          answer: "Да. Форма прорисовывается заранее и пигментируется только после вашего согласия.",
        },
        {
          question: "Насколько яркий результат сразу после процедуры?",
          answer: "Свежая пигментация выглядит интенсивнее. Во время заживления цвет становится мягче и естественнее.",
        },
      ],
    },
  },
  "permanent-make-up-lippen-halle": {
    en: {
      title: "Permanent Make-up Lips in Halle",
      eyebrow: "Aquarelle Lips and 3D Lips",
      metaTitle: "Permanent Make-up Lips Halle - Lip PMU | Salon Elen",
      metaDescription:
        "Permanent make-up for lips in Halle: Aquarelle Lips 380 EUR, 3D Lips 420 EUR, natural color and consultation at Salon Elen.",
      keywords: ["Permanent make-up lips Halle", "PMU lips Halle", "Lip pigmentation Halle", "Aquarelle Lips Halle"],
      heroText:
        "Lip PMU gives the lips more freshness, softer contours and a harmonious color. The pigmentation is planned by type and goal, not by a fixed template.",
      heroImageAlt: "Permanent make-up lips in Halle",
      serviceName: "PMU lips",
      price: "from 380 EUR",
      duration: "about 120 min.",
      facts: ["Aquarelle Lips 380 EUR", "3D Lips 420 EUR", "natural color selection"],
      outcomes: [
        "fresher color without constant touch-ups",
        "visually more groomed lip contour",
        "soft type matching instead of a hard line",
        "more confidence in everyday life, sport and holidays",
      ],
      suitableFor: [
        "pale lips or uneven lip color",
        "clients who want a natural freshness effect",
        "slight irregularities in the lip contour",
        "anyone who wants a softer replacement for lipstick",
      ],
      process: pmuProcessTranslations.en,
      priceDetails: [
        "Aquarelle Lips: 380 EUR",
        "3D Lips: 420 EUR",
        "The pigment tone is matched to natural lip color, skin type and desired intensity.",
      ],
      contraindications: pmuContraindicationTranslations.en,
      proof: {
        title: "Before/after and natural color gradient",
        intro:
          "With lip PMU, not only the color matters but also the soft distribution. The result should look fresh, not mask-like.",
        beforeLabel: "natural lip color",
        afterLabel: "fresh PMU effect",
        note: "The final look appears after healing. Directly after treatment the color is more intense.",
      },
      gallery: [
        { alt: "Permanent make-up lips Halle result", label: "3D Lips" },
        { alt: "Aquarelle Lips Halle", label: "Aquarelle" },
        { alt: "Lip pigmentation at Salon Elen", label: "Color" },
      ],
      feedback: lipFeedbackTranslations.en,
      faq: [
        {
          question: "Is lip PMU very noticeable?",
          answer:
            "It does not have to be. Many clients choose a soft freshness effect that stays natural in everyday life.",
        },
        {
          question: "What does permanent make-up for lips cost?",
          answer: "Aquarelle Lips cost 380 EUR, 3D Lips cost 420 EUR.",
        },
        {
          question: "How is the color selected?",
          answer:
            "We use your natural lip color, skin type and desired intensity as the starting point.",
        },
        {
          question: "When is lip PMU not possible?",
          answer:
            "With acute inflammation, open skin or active cold sores, the appointment should be postponed.",
        },
      ],
    },
    ru: {
      title: "Перманентный макияж губ в Halle",
      eyebrow: "Aquarell Lips и 3D Lips",
      metaTitle: "Перманентный макияж губ Halle - PMU губ | Salon Elen",
      metaDescription:
        "Перманентный макияж губ в Halle: Aquarell Lips 380 EUR, 3D Lips 420 EUR, естественный цвет и консультация в Salon Elen.",
      keywords: ["перманентный макияж губ Halle", "PMU губ Halle", "пигментация губ Halle", "Aquarell Lips Halle"],
      heroText:
        "PMU губ добавляет свежесть, мягкий контур и гармоничный оттенок. Пигментация планируется под типаж и желание, а не по шаблону.",
      heroImageAlt: "Перманентный макияж губ в Halle",
      serviceName: "PMU губ",
      price: "от 380 EUR",
      duration: "около 120 мин.",
      facts: ["Aquarell Lips 380 EUR", "3D Lips 420 EUR", "естественный подбор цвета"],
      outcomes: [
        "более свежий цвет без постоянного подкрашивания",
        "визуально более ухоженный контур губ",
        "мягкая адаптация под типаж вместо жесткой линии",
        "больше уверенности в повседневности, спорте и отпуске",
      ],
      suitableFor: [
        "бледные губы или неравномерный цвет",
        "клиентки, которые хотят естественный эффект свежести",
        "легкие неровности контура губ",
        "те, кто хочет деликатно заменить помаду",
      ],
      process: pmuProcessTranslations.ru,
      priceDetails: [
        "Aquarell Lips: 380 EUR",
        "3D Lips: 420 EUR",
        "Оттенок подбирается по натуральному цвету губ, типу кожи и желаемой интенсивности.",
      ],
      contraindications: pmuContraindicationTranslations.ru,
      proof: {
        title: "До/после и естественный переход цвета",
        intro:
          "В PMU губ важен не только оттенок, но и мягкое распределение цвета. Результат должен выглядеть свежо, а не маской.",
        beforeLabel: "натуральный цвет губ",
        afterLabel: "свежий PMU-эффект",
        note: "Окончательный вид проявляется после заживления. Сразу после процедуры цвет интенсивнее.",
      },
      gallery: [
        { alt: "Результат перманентного макияжа губ Halle", label: "3D Lips" },
        { alt: "Aquarell Lips Halle", label: "Aquarell" },
        { alt: "Пигментация губ Salon Elen", label: "Цвет" },
      ],
      feedback: lipFeedbackTranslations.ru,
      faq: [
        {
          question: "PMU губ выглядит очень заметно?",
          answer:
            "Не обязательно. Многие клиентки выбирают мягкий эффект свежести, который остается естественным в повседневности.",
        },
        {
          question: "Сколько стоит перманентный макияж губ?",
          answer: "Aquarell Lips стоят 380 EUR, 3D Lips стоят 420 EUR.",
        },
        {
          question: "Как выбирается цвет?",
          answer:
            "Мы ориентируемся на натуральный цвет губ, тип кожи и желаемую интенсивность.",
        },
        {
          question: "Когда PMU губ нельзя делать?",
          answer:
            "При острых воспалениях, открытых участках или активном герпесе запись нужно перенести.",
        },
      ],
    },
  },
  "lidstrich-permanent-make-up-halle": {
    en: {
      title: "Permanent Eyeliner in Halle",
      eyebrow: "discreet eyelid line",
      metaTitle: "Permanent Eyeliner Halle - PMU eyes | Salon Elen",
      metaDescription:
        "Permanent eyeliner in Halle: subtle eye definition, lashline enhancement from 130 EUR, consultation and booking at Salon Elen.",
      keywords: ["Permanent eyeliner Halle", "PMU eyeliner Halle", "Permanent make-up eyes Halle", "Lashline Halle"],
      heroText:
        "A fine permanent eyeliner or lashline enhancement defines the eyes long term and reduces daily make-up effort. The shape stays intentionally type-appropriate.",
      heroImageAlt: "Permanent eyeliner in Halle",
      serviceName: "Eyeliner / Lashline",
      price: "from 130 EUR",
      duration: "about 60-90 min.",
      facts: ["lashline 130 EUR", "upper + lower 150 EUR", "eye shape matched to your type"],
      outcomes: [
        "clearer eyes without daily eyeliner",
        "subtle or more defined line depending on your goal",
        "visually fuller lash base",
        "practical for sport, everyday life and holidays",
      ],
      suitableFor: [
        "clients whose eyeliner smudges quickly",
        "light or visually sparse lash lines",
        "anyone who wants lasting but discreet eye definition",
        "clients unsure between eyeliner and lashline enhancement",
      ],
      process: pmuProcessTranslations.en,
      priceDetails: [
        "Lashline / discreet line: from 130 EUR",
        "Upper + lower lashline: 150 EUR",
        "The exact option is discussed according to eye shape and desired intensity.",
      ],
      contraindications: pmuContraindicationTranslations.en,
      proof: {
        title: "Before/after and line effect",
        intro:
          "Good permanent eyeliner fits the eye shape. Often, a discreet lashline enhancement is more beautiful and ages more harmoniously than a hard line.",
        beforeLabel: "eye shape and lash base",
        afterLabel: "more defined line",
        note: "For sensitive or currently irritated eyes, the treatment should be postponed.",
      },
      gallery: [
        { alt: "Eyeliner PMU consultation in Halle", label: "Eye shape" },
        { alt: "Permanent eyeliner in Halle", label: "Line" },
        { alt: "PMU eyes at Salon Elen", label: "Definition" },
      ],
      feedback: eyeFeedbackTranslations.en,
      faq: [
        {
          question: "Which is better: eyeliner or lashline enhancement?",
          answer:
            "For a very natural result, lashline enhancement is often ideal. A permanent eyeliner looks more defined.",
        },
        {
          question: "What does permanent eyeliner cost?",
          answer: "The discreet lashline option starts at 130 EUR, upper + lower costs 150 EUR.",
        },
        {
          question: "Can the eyeliner stay very fine?",
          answer: "Yes. The line is adapted to your eye shape and desired expression.",
        },
        {
          question: "When should I avoid eye PMU?",
          answer:
            "With eye inflammation, acute irritation, recent eye surgery or open skin, the appointment should be postponed.",
        },
      ],
    },
    ru: {
      title: "Перманентный lidstrich в Halle",
      eyebrow: "деликатная линия века",
      metaTitle: "Перманентный lidstrich Halle - PMU глаз | Salon Elen",
      metaDescription:
        "Перманентный lidstrich в Halle: деликатное подчеркивание глаз, межресничка от 130 EUR, консультация и запись в Salon Elen.",
      keywords: ["перманентный lidstrich Halle", "PMU стрелка Halle", "перманентный макияж глаз Halle", "межресничка Halle"],
      heroText:
        "Тонкий permanent lidstrich или межресничка подчеркивает глаза надолго и уменьшает время на макияж. Форма остается осознанно подобранной под типаж.",
      heroImageAlt: "Перманентный lidstrich в Halle",
      serviceName: "Lidstrich / межресничка",
      price: "от 130 EUR",
      duration: "около 60-90 мин.",
      facts: ["межресничка 130 EUR", "верх + низ 150 EUR", "форма глаз под ваш типаж"],
      outcomes: [
        "более четкий взгляд без ежедневного eyeliner",
        "деликатная или более выразительная линия по желанию",
        "визуально более густой ресничный край",
        "удобно для спорта, повседневности и отпуска",
      ],
      suitableFor: [
        "клиентки, у которых eyeliner быстро размазывается",
        "светлая или визуально редкая линия ресниц",
        "те, кто хочет долговременное, но деликатное подчеркивание глаз",
        "клиентки, которые выбирают между lidstrich и межресничкой",
      ],
      process: pmuProcessTranslations.ru,
      priceDetails: [
        "Межресничка / деликатная линия: от 130 EUR",
        "Верх + низ: 150 EUR",
        "Точный вариант обсуждается по форме глаз и желаемой интенсивности.",
      ],
      contraindications: pmuContraindicationTranslations.ru,
      proof: {
        title: "До/после и эффект линии",
        intro:
          "Хороший PMU lidstrich подходит форме глаз. Часто деликатная межресничка выглядит красивее и гармоничнее со временем, чем жесткая линия.",
        beforeLabel: "форма глаз и ресничный край",
        afterLabel: "более четкая линия",
        note: "При чувствительных или раздраженных глазах процедуру лучше перенести.",
      },
      gallery: [
        { alt: "Консультация PMU lidstrich в Halle", label: "Форма глаз" },
        { alt: "Перманентный lidstrich в Halle", label: "Линия" },
        { alt: "PMU глаз Salon Elen", label: "Выразительность" },
      ],
      feedback: eyeFeedbackTranslations.ru,
      faq: [
        {
          question: "Что лучше: lidstrich или межресничка?",
          answer:
            "Для очень естественного результата часто идеальна межресничка. Lidstrich выглядит более выразительно.",
        },
        {
          question: "Сколько стоит permanent lidstrich?",
          answer: "Деликатная межресничная линия начинается от 130 EUR, верх + низ стоит 150 EUR.",
        },
        {
          question: "Можно ли сделать линию очень тонкой?",
          answer: "Да. Линия адаптируется под форму глаз и желаемую выразительность.",
        },
        {
          question: "Когда не стоит делать PMU глаз?",
          answer:
            "При воспалениях глаз, остром раздражении, недавних операциях или открытых участках запись нужно перенести.",
        },
      ],
    },
  },
  "microneedling-halle": {
    en: {
      title: "Microneedling in Halle (Saale)",
      eyebrow: "skin texture and glow",
      metaTitle: "Microneedling Halle - refine skin texture | Salon Elen",
      metaDescription:
        "Microneedling in Halle at Salon Elen: consultation, skin analysis, treatment plan, aftercare guidance and online booking for a fresher-looking complexion.",
      keywords: ["Microneedling Halle", "Microneedling Halle Saale", "cosmetics Halle skin", "refine skin texture Halle"],
      heroText:
        "Microneedling is an intensive treatment for fresher, more even-looking skin. We plan it according to skin condition, goal and regeneration time.",
      heroImageAlt: "Microneedling treatment in Halle",
      serviceName: "Microneedling",
      price: "by skin goal",
      duration: "depending on treatment plan",
      facts: ["skin analysis beforehand", "aftercare plan after treatment", "price by area and goal"],
      outcomes: [
        "fresher and smoother-looking complexion",
        "supported regeneration through targeted stimulation",
        "individual plan for face, zones and aftercare",
        "good combination with regular skin care",
      ],
      suitableFor: [
        "tired, dull or uneven-looking skin",
        "minor unevenness in skin texture",
        "clients looking for an intensive cosmetic treatment",
        "anyone who wants a structured care plan instead of a random treatment",
      ],
      process: skinProcessTranslations.en,
      priceDetails: [
        "Price depends on skin condition, area and treatment plan",
        "Current prices are available in the price list or directly during consultation.",
        "Depending on the goal, a series can make more sense than a single appointment.",
      ],
      contraindications: skinContraindicationTranslations.en,
      proof: {
        title: "Skin texture, progress and result",
        intro:
          "Microneedling is not an instant filter. The skin needs regeneration, care and protection so the result can look calm and fresh.",
        beforeLabel: "skin analysis",
        afterLabel: "fresh glow",
        note: "Direct sun and aggressive care products should be avoided after treatment.",
      },
      gallery: [
        { alt: "Microneedling skin analysis in Halle", label: "Analysis" },
        { alt: "Microneedling result in Halle", label: "Glow" },
        { alt: "Cosmetic skin treatment in Halle", label: "Care" },
      ],
      feedback: skinFeedbackTranslations.en,
      faq: [
        {
          question: "What can microneedling improve?",
          answer:
            "Microneedling can make the skin look fresher and more even. Skin analysis, suitable intensity and aftercare are important.",
        },
        {
          question: "What does microneedling cost in Halle?",
          answer:
            "The price depends on skin condition, area and treatment plan. We clarify this transparently before or during consultation.",
        },
        {
          question: "Can I go out immediately afterwards?",
          answer:
            "The skin can be red and sensitive. Plan regeneration time and avoid sun as well as aggressive skin care.",
        },
        {
          question: "How often do you need microneedling?",
          answer:
            "That depends on your skin goal. Sometimes one freshness appointment is enough, while structural goals often need a series.",
        },
      ],
    },
    ru: {
      title: "Microneedling в Halle (Saale)",
      eyebrow: "текстура кожи и glow",
      metaTitle: "Microneedling Halle - улучшение текстуры кожи | Salon Elen",
      metaDescription:
        "Microneedling в Halle в Salon Elen: консультация, анализ кожи, план процедуры, рекомендации по уходу и онлайн-запись для более свежего вида кожи.",
      keywords: ["Microneedling Halle", "Microneedling Halle Saale", "косметология Halle кожа", "улучшение текстуры кожи Halle"],
      heroText:
        "Microneedling - интенсивная процедура для более свежего и ровного вида кожи. Мы планируем ее по состоянию кожи, цели и времени восстановления.",
      heroImageAlt: "Процедура Microneedling в Halle",
      serviceName: "Microneedling",
      price: "по состоянию кожи",
      duration: "по плану процедуры",
      facts: ["предварительный анализ кожи", "план ухода после процедуры", "цена по зоне и цели"],
      outcomes: [
        "более свежий и гладкий вид кожи",
        "поддержка восстановления через контролируемую стимуляцию",
        "индивидуальный план для лица, зон и ухода",
        "хорошо сочетается с регулярным домашним уходом",
      ],
      suitableFor: [
        "уставшая, тусклая или неровная кожа",
        "легкие неровности текстуры кожи",
        "клиентки, которые ищут интенсивную косметологическую процедуру",
        "те, кто хочет структурный план ухода вместо случайной процедуры",
      ],
      process: skinProcessTranslations.ru,
      priceDetails: [
        "Цена зависит от состояния кожи, зоны и плана процедуры",
        "Актуальные цены можно посмотреть в прайсе или уточнить на консультации.",
        "В зависимости от цели серия процедур может быть разумнее одного сеанса.",
      ],
      contraindications: skinContraindicationTranslations.ru,
      proof: {
        title: "Текстура кожи, динамика и результат",
        intro:
          "Microneedling - это не мгновенный фильтр. Коже нужны восстановление, уход и защита, чтобы результат выглядел спокойно и свежо.",
        beforeLabel: "анализ кожи",
        afterLabel: "свежий glow",
        note: "После процедуры следует избегать прямого солнца и агрессивного ухода.",
      },
      gallery: [
        { alt: "Анализ кожи перед Microneedling в Halle", label: "Анализ" },
        { alt: "Результат Microneedling в Halle", label: "Glow" },
        { alt: "Косметологическая процедура для кожи в Halle", label: "Уход" },
      ],
      feedback: skinFeedbackTranslations.ru,
      faq: [
        {
          question: "Что дает microneedling?",
          answer:
            "Microneedling может сделать кожу визуально свежее и ровнее. Важны анализ кожи, подходящая интенсивность и уход после процедуры.",
        },
        {
          question: "Сколько стоит microneedling в Halle?",
          answer:
            "Цена зависит от состояния кожи, зоны и плана процедуры. Мы прозрачно уточняем это до записи или на консультации.",
        },
        {
          question: "Можно ли сразу выходить в люди?",
          answer:
            "Кожа может быть красной и чувствительной. Нужно планировать время восстановления и избегать солнца и агрессивного ухода.",
        },
        {
          question: "Как часто нужен microneedling?",
          answer:
            "Это зависит от цели. Иногда достаточно одной процедуры для свежести, а для работы с текстурой чаще нужен курс.",
        },
      ],
    },
  },
};

export function localizeSeoLandingPage(
  page: SeoLandingPageData,
  locale: SeoLocale,
): SeoLandingPageData {
  const translation =
    locale === "de" ? undefined : seoLandingPageTranslations[page.slug]?.[locale];

  if (!translation) return page;

  return {
    ...page,
    ...translation,
    proof: {
      ...page.proof,
      ...translation.proof,
    },
    gallery: page.gallery.map((item, index) => ({
      ...item,
      ...(translation.gallery[index] ?? {}),
    })),
  };
}

export function getSeoLandingPage(slug: string): SeoLandingPageData | undefined {
  return seoLandingPages.find((page) => page.slug === slug);
}

export function getRelatedSeoLandingPages(page: SeoLandingPageData): SeoLandingPageData[] {
  return page.relatedSlugs
    .map((slug) => getSeoLandingPage(slug))
    .filter((item): item is SeoLandingPageData => Boolean(item));
}
