import type { SeoLocale } from "@/lib/seo-locale";

export type FootCareGroupKey = "pedicure" | "care" | "specialist" | "mobile";

type FootCareGroupCopy = {
  key: FootCareGroupKey;
  eyebrow: string;
  title: string;
  description: string;
};

export type FootCareLandingCopy = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  breadcrumbHome: string;
  breadcrumbCurrent: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroText: string;
  book: string;
  discover: string;
  route: string;
  heroNote: string;
  facts: Array<{ value: string; label: string }>;
  answerEyebrow: string;
  answerTitle: string;
  answerText: string;
  answerPoints: string[];
  catalogEyebrow: string;
  catalogTitle: string;
  catalogText: string;
  groups: FootCareGroupCopy[];
  durationLabel: string;
  details: string;
  choose: string;
  from: string;
  consultation: string;
  processEyebrow: string;
  processTitle: string;
  processText: string;
  process: Array<{ number: string; title: string; text: string }>;
  mobileEyebrow: string;
  mobileTitle: string;
  mobileText: string;
  mobileFacts: string[];
  qualityEyebrow: string;
  qualityTitle: string;
  qualityText: string;
  qualityCards: Array<{ title: string; text: string }>;
  safetyEyebrow: string;
  safetyTitle: string;
  safetyText: string;
  safetyNote: string;
  localEyebrow: string;
  localTitle: string;
  localText: string;
  addressLabel: string;
  hoursLabel: string;
  languagesLabel: string;
  address: string;
  hours: string;
  languages: string;
  faqEyebrow: string;
  faqTitle: string;
  faq: Array<{ question: string; answer: string }>;
  finalEyebrow: string;
  finalTitle: string;
  finalText: string;
  allServices: string;
};

export const FOOT_CARE_PATH = "/fusspflege-halle";
export const FOOT_CARE_CATEGORY_SLUG = "fu-pflege";
export const FOOT_CARE_IMAGE_BASE_PATH = "/images/services/fusspflege";

const GROUP_SLUGS: Record<FootCareGroupKey, ReadonlySet<string>> = {
  pedicure: new Set([
    "express-pedikuere-nur-naegel",
    "klassische-pedikuere",
    "apparative-pedikuere",
    "intensive-fusspflege",
    "pedikuere-mit-nagellack",
    "pedikuere-mit-uv-gellack",
    "herren-pedikuere",
  ]),
  care: new Set([
    "paraffinbad-fuer-die-fuesse",
    "naegel-kuerzen-und-formen",
    "nagelfalzreinigung",
    "hornhautentfernung",
    "intensive-hornhautentfernung",
    "fersenpflege",
    "feuchtigkeitsspendende-fussmaske",
    "uv-gellack-entfernen-und-nagelpflege",
  ]),
  specialist: new Set([
    "medizinische-fusspflege-komplexbehandlung",
    "medizinische-fusspflege-erhoehter-aufwand",
    "medizinische-nagelbehandlung",
    "medizinische-hornhautbehandlung",
    "huehneraugenbehandlung-pro-stelle",
    "behandlung-eines-eingewachsenen-nagels",
    "rhagadenbehandlung-pro-ferse",
    "abtragen-eines-verdickten-nagels",
    "begleitende-pflege-bei-nagelpilz-pro-nagel",
    "nagelfalztamponade-pro-nagel",
    "nagelkorrektur-mit-klebespange",
    "nagelkorrektur-mit-drahtspange",
    "nagelspangenkontrolle-und-nachregulierung",
    "druckentlastung-und-reibungsschutz",
  ]),
  mobile: new Set([
    "mobile-klassische-fusspflege",
    "mobile-intensive-fusspflege",
    "mobile-fusspflege-mit-nagellack",
    "mobile-fusspflege-mit-uv-gellack",
    "mobile-medizinische-fusspflege",
  ]),
};

export const FOOT_CARE_FROM_PRICE_SLUGS = new Set([
  "medizinische-fusspflege-erhoehter-aufwand",
  "medizinische-nagelbehandlung",
  "medizinische-hornhautbehandlung",
  "huehneraugenbehandlung-pro-stelle",
  "behandlung-eines-eingewachsenen-nagels",
  "rhagadenbehandlung-pro-ferse",
  "abtragen-eines-verdickten-nagels",
  "begleitende-pflege-bei-nagelpilz-pro-nagel",
  "nagelfalztamponade-pro-nagel",
  "nagelkorrektur-mit-klebespange",
  "nagelkorrektur-mit-drahtspange",
  "nagelspangenkontrolle-und-nachregulierung",
  "druckentlastung-und-reibungsschutz",
]);

export function getFootCareGroup(slug: string): FootCareGroupKey {
  for (const [key, slugs] of Object.entries(GROUP_SLUGS)) {
    if (slugs.has(slug)) return key as FootCareGroupKey;
  }
  return "care";
}

const COPY: Record<SeoLocale, FootCareLandingCopy> = {
  de: {
    metaTitle: "Fußpflege Halle: Pediküre & mobile Fußpflege | Salon Elen",
    metaDescription:
      "Professionelle Fußpflege in Halle (Saale): Pediküre, Hornhaut- und Fersenpflege, UV-Gellack sowie mobile Fußpflege. Preise und Online-Termin bei Salon Elen.",
    keywords: [
      "Fußpflege Halle",
      "Fußpflege Halle Saale",
      "Pediküre Halle",
      "kosmetische Fußpflege Halle",
      "Fußpflege Halle Preise",
      "mobile Fußpflege Halle",
      "Fußpflege Hausbesuch Halle",
      "apparative Pediküre Halle",
      "Hornhaut entfernen Halle",
      "Herren Pediküre Halle",
    ],
    breadcrumbHome: "Startseite",
    breadcrumbCurrent: "Fußpflege Halle",
    heroEyebrow: "Fußpflege in Halle (Saale) · Paulusviertel",
    heroTitle: "Schöne Füße.",
    heroAccent: "Leichtes Gefühl.",
    heroText:
      "Professionelle Fußpflege und Pediküre für gepflegte Nägel, glatte Haut und mehr Wohlgefühl — individuell im Salon oder mobil bei Ihnen zu Hause in Halle.",
    book: "Fußpflege buchen",
    discover: "Leistungen & Preise",
    route: "Route zum Salon",
    heroNote: "Online-Termine rund um die Uhr · Beratung auf DE / EN / RU",
    facts: [
      { value: "34", label: "buchbare Fußpflege-Leistungen" },
      { value: "ab 15 €", label: "transparente Einzelpreise" },
      { value: "20–75 Min.", label: "passend zu Ihrem Pflegebedarf" },
      { value: "Salon & mobil", label: "in Halle (Saale)" },
    ],
    answerEyebrow: "Direkte Antwort",
    answerTitle: "Wo finde ich professionelle Fußpflege in Halle?",
    answerText:
      "Salon Elen bietet Fußpflege und Pediküre in der Lessingstraße 37, 06114 Halle (Saale), im Paulusviertel. Zum Angebot gehören klassische und apparative Pediküre, intensive Hornhaut- und Fersenpflege, Nagelpflege, Lack oder UV-Gellack sowie mobile Fußpflege innerhalb von Halle.",
    answerPoints: [
      "klar ausgewiesene Preise und Behandlungszeiten",
      "Online-Buchung 24/7 mit direkter Auswahl der Leistung",
      "persönliche Beratung auf Deutsch, Englisch und Russisch",
    ],
    catalogEyebrow: "Leistungen & aktuelle Preise",
    catalogTitle: "Von der klassischen Pediküre bis zur gezielten Fußpflege",
    catalogText:
      "Wählen Sie nach Pflegeziel: gepflegte Nägel, intensive Hautpflege, spezialisierte Fuß- und Nagelpflege oder einen Hausbesuch. Die Preise werden direkt aus unserem aktuellen Leistungskatalog geladen.",
    groups: [
      {
        key: "pedicure",
        eyebrow: "01 · Klassiker",
        title: "Pediküre & gepflegte Nägel",
        description:
          "Kosmetische Fußpflege, apparative Pediküre und gepflegte Nägel — pur, mit Nagellack oder UV-Gellack.",
      },
      {
        key: "care",
        eyebrow: "02 · Pflegefokus",
        title: "Hornhaut, Fersen & Wellness",
        description:
          "Gezielte Einzelbehandlungen für trockene Haut, beanspruchte Fersen, Nägel und ein angenehm gepflegtes Fußgefühl.",
      },
      {
        key: "specialist",
        eyebrow: "03 · Individuell",
        title: "Spezialisierte Fuß- & Nagelpflege",
        description:
          "Mehr Zeit und ein abgestimmter Behandlungsumfang bei anspruchsvolleren Fuß- oder Nagelthemen.",
      },
      {
        key: "mobile",
        eyebrow: "04 · Hausbesuch",
        title: "Mobile Fußpflege in Halle",
        description:
          "Professionelle Fußpflege bei Ihnen zu Hause; die Anfahrt innerhalb von Halle ist im ausgewiesenen Preis enthalten.",
      },
    ],
    durationLabel: "Dauer",
    details: "Details",
    choose: "Auswählen",
    from: "ab",
    consultation: "Preis nach Aufwand und Befund",
    processEyebrow: "Ihr Termin",
    processTitle: "Ruhig, hygienisch und transparent — Schritt für Schritt",
    processText:
      "Vor dem Start klären wir, welche Pflege zu Ihren Füßen passt. Sie kennen Leistung, Zeit und Preis, bevor die Behandlung beginnt.",
    process: [
      {
        number: "01",
        title: "Kurze Bestandsaufnahme",
        text: "Wir besprechen Ihren Wunsch und sehen uns Haut und Nägel an. Bei ungeklärten Beschwerden empfehlen wir zuerst eine ärztliche Abklärung.",
      },
      {
        number: "02",
        title: "Passende Behandlung",
        text: "Nägel, Nagelfalze, Hornhaut oder Fersen werden passend zur gebuchten Leistung sorgfältig gepflegt.",
      },
      {
        number: "03",
        title: "Finish nach Wunsch",
        text: "Je nach Termin folgt Abschlusspflege, Nagellack, UV-Gellack oder eine ergänzende Wellnesspflege.",
      },
      {
        number: "04",
        title: "Pflege für zu Hause",
        text: "Sie erhalten verständliche Hinweise, damit sich das gepflegte Gefühl möglichst lange hält.",
      },
    ],
    mobileEyebrow: "Mobile Fußpflege Halle",
    mobileTitle: "Gepflegte Füße — ohne den Weg zum Salon",
    mobileText:
      "Wenn der Salonbesuch schwer in den Alltag passt oder Ihre Mobilität eingeschränkt ist, kommt die Fußpflege zu Ihnen. Mobile Termine sind innerhalb von Halle möglich und lassen sich direkt über den Leistungskatalog auswählen.",
    mobileFacts: [
      "Anfahrt innerhalb von Halle inklusive",
      "klassische oder intensive Fußpflege",
      "auf Wunsch Nagellack oder UV-Gellack",
      "klare Dauer und Preise vor der Buchung",
    ],
    qualityEyebrow: "Salon Elen Standard",
    qualityTitle: "Pflege, die Präzision und Wohlgefühl verbindet",
    qualityText:
      "Eine gute Pediküre sieht nicht nur gepflegt aus. Sie fühlt sich angenehm an, ist nachvollziehbar geplant und respektiert die Grenzen kosmetischer Fußpflege.",
    qualityCards: [
      {
        title: "Individuell statt Schema",
        text: "Trockenheit, Hornhaut, Nagelform und gewünschtes Finish bestimmen den passenden Termin.",
      },
      {
        title: "Hygiene mit System",
        text: "Saubere Arbeitsabläufe und sorgfältig vorbereitete Instrumente gehören zu jeder Behandlung.",
      },
      {
        title: "Preise ohne Überraschung",
        text: "Festpreise und Ab-Preise sind im Katalog sichtbar; Mehraufwand wird vor der Behandlung besprochen.",
      },
      {
        title: "Ein Salon, drei Sprachen",
        text: "Beratung ist auf Deutsch, Englisch und Russisch möglich — ruhig und verständlich.",
      },
    ],
    safetyEyebrow: "Gut zu wissen",
    safetyTitle: "Kosmetische Fußpflege ist keine medizinische Diagnose",
    safetyText:
      "Bei akuten Entzündungen, offenen Wunden, starken Schmerzen, unklaren Veränderungen oder einem medizinisch relevanten Risikofuß sollte vor einer Buchung ärztlicher Rat eingeholt werden. Teilen Sie uns relevante Gesundheitsthemen bitte vor dem Termin mit.",
    safetyNote:
      "Die Bezeichnungen und Beschreibungen im Leistungskatalog erklären den angebotenen Pflegeumfang. Sie ersetzen keine Diagnose, ärztliche Behandlung oder individuelle medizinische Beratung.",
    localEyebrow: "Fußpflege im Paulusviertel",
    localTitle: "Zentral in Halle, persönlich erreichbar",
    localText:
      "Salon Elen liegt in der Lessingstraße 37 im Paulusviertel — gut erreichbar aus der Innenstadt, Giebichenstein, Trotha, der Nördlichen Innenstadt und weiteren Stadtteilen von Halle.",
    addressLabel: "Adresse",
    hoursLabel: "Öffnungszeiten",
    languagesLabel: "Beratung",
    address: "Lessingstraße 37 · 06114 Halle (Saale)",
    hours: "Mo–Fr 10:00–19:00 · Sa 10:00–16:00",
    languages: "Deutsch · English · Русский",
    faqEyebrow: "Antworten vor der Buchung",
    faqTitle: "Häufige Fragen zur Fußpflege in Halle",
    faq: [
      {
        question: "Was kostet Fußpflege bei Salon Elen in Halle?",
        answer:
          "Die Express-Pediküre kostet 29 €, die klassische Pediküre 39 €, die apparative Pediküre 45 € und die intensive Fußpflege 55 €. Einzel- und Spezialbehandlungen beginnen je nach Leistung ab 15 €. Maßgeblich sind die aktuell auf dieser Seite angezeigten Preise.",
      },
      {
        question: "Was ist in einer klassischen Pediküre enthalten?",
        answer:
          "Die klassische Pediküre umfasst Nägel kürzen und formen, Nagelhautpflege, Reinigung der Nagelfalze, Entfernung normaler Hornhaut und eine Abschlusspflege. Die Behandlung dauert etwa 40 Minuten.",
      },
      {
        question: "Was ist der Unterschied zwischen kosmetischer und medizinischer Fußpflege?",
        answer:
          "Pediküre und kosmetische Fußpflege konzentrieren sich auf Pflege und Erscheinungsbild gesunder Füße und Nägel. Medizinische Fußpflege berücksichtigt anspruchsvollere Fuß- und Nagelthemen, ersetzt jedoch keine ärztliche Diagnose. Unklare oder akute Beschwerden sollten zuerst ärztlich abgeklärt werden.",
      },
      {
        question: "Gibt es mobile Fußpflege als Hausbesuch in Halle?",
        answer:
          "Ja. Salon Elen bietet mobile klassische und intensive Fußpflege sowie Varianten mit Nagellack oder UV-Gellack innerhalb von Halle an. Die Anfahrt innerhalb von Halle ist im ausgewiesenen Preis enthalten.",
      },
      {
        question: "Kann ich Pediküre mit UV-Gellack buchen?",
        answer:
          "Ja. Die Pediküre mit UV-Gellack dauert etwa 65 Minuten. Auch das Entfernen von UV-Gellack mit anschließender Nagelpflege ist als eigener Termin verfügbar.",
      },
      {
        question: "Bietet Salon Elen auch Herren-Pediküre an?",
        answer:
          "Ja. Die Herren-Pediküre ist als eigener Termin mit etwa 50 Minuten Behandlungszeit buchbar.",
      },
      {
        question: "Kann ich bei Hornhaut, rissigen Fersen oder einem eingewachsenen Nagel buchen?",
        answer:
          "Für Hornhaut, Fersen und ausgewählte Nagelthemen gibt es eigene Leistungen. Bei Entzündung, Wunden, starken Schmerzen oder unklarer Ursache ist vorab eine medizinische Abklärung erforderlich.",
      },
      {
        question: "Wie buche ich einen Termin für Fußpflege?",
        answer:
          "Wählen Sie auf dieser Seite eine Leistung und anschließend online einen freien Termin. Die Online-Buchung ist rund um die Uhr verfügbar. Alternativ erreichen Sie Salon Elen telefonisch unter +49 177 899 51 06.",
      },
      {
        question: "Wo befindet sich Salon Elen?",
        answer:
          "Salon Elen befindet sich in der Lessingstraße 37, 06114 Halle (Saale), im Paulusviertel. Termine sind auf Deutsch, Englisch und Russisch möglich.",
      },
    ],
    finalEyebrow: "Zeit für gepflegte Füße",
    finalTitle: "Finden Sie jetzt die Fußpflege, die zu Ihnen passt.",
    finalText:
      "Wählen Sie Ihre Leistung mit transparentem Preis und reservieren Sie online einen passenden Termin im Salon Elen oder als mobilen Hausbesuch in Halle.",
    allServices: "Alle Salonleistungen",
  },
  en: {
    metaTitle: "Foot Care & Pedicure in Halle | Salon Elen",
    metaDescription:
      "Professional foot care in Halle (Saale): pedicure, callus and heel care, gel polish and mobile home visits. View prices and book Salon Elen online.",
    keywords: [
      "foot care Halle",
      "pedicure Halle",
      "pedicure Halle Saale",
      "foot care prices Halle",
      "mobile foot care Halle",
      "home visit pedicure Halle",
      "gel pedicure Halle",
      "men's pedicure Halle",
    ],
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Foot care Halle",
    heroEyebrow: "Foot care in Halle (Saale) · Paulusviertel",
    heroTitle: "Beautiful feet.",
    heroAccent: "A lighter feeling.",
    heroText:
      "Professional foot care and pedicures for neat nails, smoother skin and everyday comfort — personalised in the salon or at your home in Halle.",
    book: "Book foot care",
    discover: "Services & prices",
    route: "Directions to the salon",
    heroNote: "Online booking around the clock · Advice in DE / EN / RU",
    facts: [
      { value: "34", label: "bookable foot-care services" },
      { value: "from €15", label: "transparent individual prices" },
      { value: "20–75 min", label: "matched to your care needs" },
      { value: "Salon & mobile", label: "within Halle (Saale)" },
    ],
    answerEyebrow: "Direct answer",
    answerTitle: "Where can I find professional foot care in Halle?",
    answerText:
      "Salon Elen offers foot care and pedicures at Lessingstrasse 37, 06114 Halle (Saale), in Paulusviertel. Services include classic and e-file pedicures, intensive callus and heel care, toenail care, polish or gel polish, plus mobile foot care within Halle.",
    answerPoints: [
      "clearly displayed prices and treatment times",
      "24/7 online booking with direct service selection",
      "personal advice in German, English and Russian",
    ],
    catalogEyebrow: "Services & current prices",
    catalogTitle: "From a classic pedicure to focused foot care",
    catalogText:
      "Choose by goal: neat nails, intensive skin care, specialist foot and nail care, or a home visit. Prices are loaded directly from our current service catalogue.",
    groups: [
      {
        key: "pedicure",
        eyebrow: "01 · Classics",
        title: "Pedicures & neat nails",
        description:
          "Cosmetic foot care, e-file pedicures and neat toenails — natural, polished or finished with gel polish.",
      },
      {
        key: "care",
        eyebrow: "02 · Care focus",
        title: "Callus, heels & wellness",
        description:
          "Focused treatments for dry skin, hard-working heels, toenails and a comfortably cared-for feel.",
      },
      {
        key: "specialist",
        eyebrow: "03 · Individual",
        title: "Specialist foot & nail care",
        description:
          "Additional time and a tailored treatment scope for more demanding foot or toenail concerns.",
      },
      {
        key: "mobile",
        eyebrow: "04 · Home visit",
        title: "Mobile foot care in Halle",
        description:
          "Professional foot care in your home; travel within Halle is included in the displayed price.",
      },
    ],
    durationLabel: "Duration",
    details: "Details",
    choose: "Select",
    from: "from",
    consultation: "Price depends on scope and assessment",
    processEyebrow: "Your appointment",
    processTitle: "Calm, hygienic and transparent — step by step",
    processText:
      "Before we begin, we clarify which care suits your feet. You know the service, duration and price before treatment starts.",
    process: [
      {
        number: "01",
        title: "Brief assessment",
        text: "We discuss your goal and look at the skin and toenails. For unexplained concerns, we recommend medical assessment first.",
      },
      {
        number: "02",
        title: "Appropriate treatment",
        text: "Toenails, nail folds, callus or heels are cared for according to the service you booked.",
      },
      {
        number: "03",
        title: "Your preferred finish",
        text: "Depending on the appointment, we finish with care products, nail polish, gel polish or a wellness add-on.",
      },
      {
        number: "04",
        title: "At-home care",
        text: "You receive clear advice to help the freshly cared-for feeling last as long as possible.",
      },
    ],
    mobileEyebrow: "Mobile foot care in Halle",
    mobileTitle: "Cared-for feet — without travelling to the salon",
    mobileText:
      "If a salon visit is difficult to fit into your day or mobility is limited, foot care can come to you. Mobile appointments are available within Halle and can be selected directly in the service catalogue.",
    mobileFacts: [
      "travel within Halle included",
      "classic or intensive foot care",
      "nail polish or gel polish on request",
      "clear duration and price before booking",
    ],
    qualityEyebrow: "The Salon Elen standard",
    qualityTitle: "Care that combines precision and comfort",
    qualityText:
      "A good pedicure does more than look neat. It feels comfortable, follows a clear plan and respects the boundaries of cosmetic foot care.",
    qualityCards: [
      {
        title: "Personal, not standardised",
        text: "Dryness, callus, nail shape and your preferred finish determine the right appointment.",
      },
      {
        title: "Systematic hygiene",
        text: "Clean workflows and carefully prepared instruments are part of every treatment.",
      },
      {
        title: "No price surprises",
        text: "Fixed and starting prices are visible; any extra effort is discussed before treatment.",
      },
      {
        title: "One salon, three languages",
        text: "Advice is available in German, English and Russian — calmly and clearly.",
      },
    ],
    safetyEyebrow: "Good to know",
    safetyTitle: "Cosmetic foot care is not a medical diagnosis",
    safetyText:
      "For acute inflammation, open wounds, severe pain, unexplained changes or a medically relevant high-risk foot, seek medical advice before booking. Please tell us about relevant health conditions before your appointment.",
    safetyNote:
      "Service names and descriptions explain the care offered. They do not replace diagnosis, medical treatment or individual medical advice.",
    localEyebrow: "Foot care in Paulusviertel",
    localTitle: "Central in Halle, personally accessible",
    localText:
      "Salon Elen is at Lessingstrasse 37 in Paulusviertel — easy to reach from the city centre, Giebichenstein, Trotha, Nördliche Innenstadt and other parts of Halle.",
    addressLabel: "Address",
    hoursLabel: "Opening hours",
    languagesLabel: "Advice",
    address: "Lessingstrasse 37 · 06114 Halle (Saale)",
    hours: "Mon–Fri 10:00–19:00 · Sat 10:00–16:00",
    languages: "Deutsch · English · Русский",
    faqEyebrow: "Answers before booking",
    faqTitle: "Frequently asked questions about foot care in Halle",
    faq: [
      {
        question: "How much does foot care cost at Salon Elen in Halle?",
        answer:
          "An express pedicure is €29, a classic pedicure €39, an e-file pedicure €45 and intensive foot care €55. Individual and specialist services start from €15 depending on the treatment. The current prices shown on this page apply.",
      },
      {
        question: "What is included in a classic pedicure?",
        answer:
          "A classic pedicure includes trimming and shaping toenails, cuticle care, cleaning the nail folds, removing normal callus and finishing care. It takes about 40 minutes.",
      },
      {
        question: "What is the difference between cosmetic and medical foot care?",
        answer:
          "Pedicures and cosmetic foot care focus on the care and appearance of healthy feet and nails. Medical foot care addresses more demanding foot and nail concerns but does not replace a medical diagnosis. Unexplained or acute symptoms should first be assessed by a doctor.",
      },
      {
        question: "Do you offer mobile foot care and home visits in Halle?",
        answer:
          "Yes. Salon Elen offers mobile classic and intensive foot care, including options with nail polish or gel polish, within Halle. Travel within Halle is included in the displayed price.",
      },
      {
        question: "Can I book a pedicure with gel polish?",
        answer:
          "Yes. A gel-polish pedicure takes about 65 minutes. Gel polish removal followed by toenail care can also be booked as a separate appointment.",
      },
      {
        question: "Does Salon Elen offer men's pedicures?",
        answer: "Yes. A dedicated men's pedicure can be booked and takes about 50 minutes.",
      },
      {
        question: "Can I book for callus, cracked heels or an ingrown toenail?",
        answer:
          "There are dedicated services for callus, heels and selected nail concerns. Inflammation, wounds, severe pain or an unexplained cause require medical assessment first.",
      },
      {
        question: "How do I book a foot-care appointment?",
        answer:
          "Select a service on this page and choose an available appointment online. Online booking is open around the clock. You can also call Salon Elen on +49 177 899 51 06.",
      },
      {
        question: "Where is Salon Elen located?",
        answer:
          "Salon Elen is at Lessingstrasse 37, 06114 Halle (Saale), in Paulusviertel. Appointments are available in German, English and Russian.",
      },
    ],
    finalEyebrow: "Time for cared-for feet",
    finalTitle: "Find the foot care that fits your needs.",
    finalText:
      "Choose your service with a transparent price and book a suitable appointment at Salon Elen or as a mobile home visit in Halle.",
    allServices: "All salon services",
  },
  ru: {
    metaTitle: "Педикюр и уход за стопами в Галле | Salon Elen",
    metaDescription:
      "Профессиональный педикюр в Галле: уход за стопами, пятками и ногтями, гель-лак и выезд на дом. Актуальные цены и онлайн-запись в Salon Elen.",
    keywords: [
      "педикюр Галле",
      "педикюр в Halle",
      "уход за стопами Галле",
      "аппаратный педикюр Галле",
      "педикюр цены Галле",
      "педикюр на дому Галле",
      "мужской педикюр Галле",
      "педикюр с гель лаком Галле",
    ],
    breadcrumbHome: "Главная",
    breadcrumbCurrent: "Педикюр в Галле",
    heroEyebrow: "Педикюр в Halle (Saale) · Paulusviertel",
    heroTitle: "Красивые стопы.",
    heroAccent: "Ощущение лёгкости.",
    heroText:
      "Профессиональный педикюр и уход за стопами для аккуратных ногтей, гладкой кожи и ежедневного комфорта — в салоне или у вас дома в Галле.",
    book: "Записаться на педикюр",
    discover: "Услуги и цены",
    route: "Маршрут в салон",
    heroNote: "Онлайн-запись круглосуточно · Консультация на DE / EN / RU",
    facts: [
      { value: "34", label: "услуги для стоп и ногтей" },
      { value: "от 15 €", label: "прозрачные цены" },
      { value: "20–75 мин.", label: "под ваш запрос" },
      { value: "Салон и выезд", label: "по Halle (Saale)" },
    ],
    answerEyebrow: "Короткий ответ",
    answerTitle: "Где сделать профессиональный педикюр в Галле?",
    answerText:
      "Salon Elen предлагает педикюр и уход за стопами по адресу Lessingstraße 37, 06114 Halle (Saale), в районе Paulusviertel. Доступны классический и аппаратный педикюр, интенсивный уход за кожей и пятками, обработка ногтей, обычный или гель-лак, а также выездной уход по Галле.",
    answerPoints: [
      "понятные цены и длительность каждой процедуры",
      "онлайн-запись 24/7 с выбором конкретной услуги",
      "консультация на немецком, английском и русском",
    ],
    catalogEyebrow: "Услуги и актуальные цены",
    catalogTitle: "От классического педикюра до специального ухода",
    catalogText:
      "Выберите цель: аккуратные ногти, интенсивный уход за кожей, специализированный уход за стопами и ногтями или выезд на дом. Цены загружаются из актуального каталога Salon Elen.",
    groups: [
      {
        key: "pedicure",
        eyebrow: "01 · Классика",
        title: "Педикюр и аккуратные ногти",
        description:
          "Косметический и аппаратный педикюр — без покрытия, с обычным или UV-гель-лаком.",
      },
      {
        key: "care",
        eyebrow: "02 · Уход",
        title: "Кожа стоп, пятки и wellness",
        description:
          "Отдельные процедуры для сухой кожи, огрубевших участков, пяток, ногтей и ощущения ухоженности.",
      },
      {
        key: "specialist",
        eyebrow: "03 · Индивидуально",
        title: "Специализированный уход",
        description:
          "Больше времени и индивидуальный объём процедуры для сложных запросов по стопам или ногтям.",
      },
      {
        key: "mobile",
        eyebrow: "04 · На дому",
        title: "Выездной педикюр в Галле",
        description:
          "Профессиональный уход у вас дома; выезд в пределах Галле включён в указанную цену.",
      },
    ],
    durationLabel: "Длительность",
    details: "Подробнее",
    choose: "Выбрать",
    from: "от",
    consultation: "Цена зависит от объёма и состояния",
    processEyebrow: "Ваш визит",
    processTitle: "Спокойно, гигиенично и понятно — шаг за шагом",
    processText:
      "До начала мы уточняем, какой уход подходит вашим стопам. Вы заранее знаете процедуру, длительность и цену.",
    process: [
      {
        number: "01",
        title: "Краткая оценка",
        text: "Обсуждаем ваш запрос и осматриваем кожу и ногти. При непонятных симптомах рекомендуем сначала обратиться к врачу.",
      },
      {
        number: "02",
        title: "Подходящая процедура",
        text: "Ногти, ногтевые пазухи, огрубевшая кожа или пятки обрабатываются в рамках выбранной услуги.",
      },
      {
        number: "03",
        title: "Финиш по желанию",
        text: "В зависимости от записи наносится завершающий уход, обычный лак, гель-лак или дополнительная wellness-процедура.",
      },
      {
        number: "04",
        title: "Домашний уход",
        text: "Вы получите понятные рекомендации, чтобы ощущение ухоженности сохранялось как можно дольше.",
      },
    ],
    mobileEyebrow: "Выездной педикюр в Галле",
    mobileTitle: "Ухоженные стопы — без поездки в салон",
    mobileText:
      "Если визит в салон трудно вписать в график или мобильность ограничена, мастер приедет к вам. Выездные процедуры доступны в пределах Галле и выбираются прямо в каталоге услуг.",
    mobileFacts: [
      "выезд в пределах Галле включён",
      "классический или интенсивный уход",
      "обычный или гель-лак по желанию",
      "понятные длительность и цена до записи",
    ],
    qualityEyebrow: "Стандарт Salon Elen",
    qualityTitle: "Уход, объединяющий точность и комфорт",
    qualityText:
      "Хороший педикюр не только выглядит аккуратно. Он комфортен, проходит по понятному плану и учитывает границы косметического ухода.",
    qualityCards: [
      {
        title: "Индивидуально, не по шаблону",
        text: "Сухость, огрубевшая кожа, форма ногтей и желаемое покрытие определяют подходящую процедуру.",
      },
      {
        title: "Системная гигиена",
        text: "Чистые рабочие процессы и тщательно подготовленные инструменты — часть каждой процедуры.",
      },
      {
        title: "Без сюрпризов в цене",
        text: "Фиксированные цены и цены «от» видны заранее; дополнительный объём обсуждается до начала.",
      },
      {
        title: "Один салон — три языка",
        text: "Консультация возможна на немецком, английском и русском — спокойно и понятно.",
      },
    ],
    safetyEyebrow: "Важно знать",
    safetyTitle: "Косметический уход не заменяет медицинскую диагностику",
    safetyText:
      "При остром воспалении, открытых ранах, сильной боли, непонятных изменениях или медицински значимом риске сначала обратитесь к врачу. Пожалуйста, сообщите о важных особенностях здоровья до визита.",
    safetyNote:
      "Названия и описания услуг объясняют предлагаемый объём ухода. Они не заменяют диагностику, врачебное лечение или индивидуальную медицинскую консультацию.",
    localEyebrow: "Педикюр в Paulusviertel",
    localTitle: "В центре Галле и с личным контактом",
    localText:
      "Salon Elen находится по адресу Lessingstraße 37 в Paulusviertel — удобно добираться из центра, Giebichenstein, Trotha, Nördliche Innenstadt и других районов Галле.",
    addressLabel: "Адрес",
    hoursLabel: "Часы работы",
    languagesLabel: "Консультация",
    address: "Lessingstraße 37 · 06114 Halle (Saale)",
    hours: "Пн–Пт 10:00–19:00 · Сб 10:00–16:00",
    languages: "Deutsch · English · Русский",
    faqEyebrow: "Ответы перед записью",
    faqTitle: "Частые вопросы о педикюре в Галле",
    faq: [
      {
        question: "Сколько стоит педикюр в Salon Elen в Галле?",
        answer:
          "Экспресс-педикюр стоит 29 €, классический — 39 €, аппаратный — 45 €, интенсивный уход — 55 €. Отдельные и специализированные процедуры начинаются от 15 €. Актуальны цены, отображаемые на этой странице.",
      },
      {
        question: "Что входит в классический педикюр?",
        answer:
          "Классический педикюр включает укорачивание и придание формы ногтям, уход за кутикулой, очищение ногтевых пазух, удаление обычной огрубевшей кожи и завершающий уход. Длительность — около 40 минут.",
      },
      {
        question: "Чем отличаются косметический и медицинский уход за стопами?",
        answer:
          "Педикюр и косметический уход направлены на внешний вид и состояние здоровых стоп и ногтей. Медицинский уход учитывает более сложные запросы по стопам и ногтям, но не заменяет врачебную диагностику. Острые или непонятные симптомы сначала должен оценить врач.",
      },
      {
        question: "Есть ли выездной педикюр на дому в Галле?",
        answer:
          "Да. Salon Elen предлагает классический и интенсивный выездной уход, а также варианты с обычным и гель-лаком. Выезд в пределах Галле включён в указанную цену.",
      },
      {
        question: "Можно ли записаться на педикюр с гель-лаком?",
        answer:
          "Да. Педикюр с UV-гель-лаком длится около 65 минут. Снятие гель-лака с последующим уходом за ногтями также доступно как отдельная процедура.",
      },
      {
        question: "Есть ли мужской педикюр?",
        answer: "Да. Мужской педикюр доступен как отдельная услуга длительностью около 50 минут.",
      },
      {
        question: "Можно ли записаться при мозолях, трещинах пяток или вросшем ногте?",
        answer:
          "Для огрубевшей кожи, пяток и отдельных проблем ногтей есть специальные услуги. При воспалении, ранах, сильной боли или непонятной причине сначала нужна медицинская консультация.",
      },
      {
        question: "Как записаться на педикюр?",
        answer:
          "Выберите услугу на этой странице, затем свободное время в онлайн-записи. Сервис работает круглосуточно. Также можно позвонить в Salon Elen по номеру +49 177 899 51 06.",
      },
      {
        question: "Где находится Salon Elen?",
        answer:
          "Salon Elen находится по адресу Lessingstraße 37, 06114 Halle (Saale), в районе Paulusviertel. Консультация возможна на немецком, английском и русском.",
      },
    ],
    finalEyebrow: "Время для ухоженных стоп",
    finalTitle: "Найдите уход, который подходит именно вам.",
    finalText:
      "Выберите услугу с прозрачной ценой и запишитесь онлайн на удобное время в Salon Elen или на выездной уход по Галле.",
    allServices: "Все услуги салона",
  },
};

export function getFootCareLandingCopy(locale: SeoLocale): FootCareLandingCopy {
  return COPY[locale] ?? COPY.de;
}
