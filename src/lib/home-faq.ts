// src/lib/home-faq.ts
// Единый источник FAQ для главной страницы.
// Используется в двух местах:
//   1) src/app/page.tsx — FAQPage JSON-LD (для Google и AI-ассистентов)
//   2) src/components/home-page.tsx — видимая секция FAQ
// ВАЖНО (требование Google): текст в схеме обязан совпадать с видимым текстом.
// Поэтому правки — только в этом файле, оба места обновятся автоматически.
// Факты сверены: цены — src/lib/seo-landing-pages.ts, часы — structured-data.ts.

export type HomeFaqLocale = "de" | "en" | "ru";

export type HomeFaqItem = {
  q: string;
  a: string;
};

export type HomeFaqCopy = {
  eyebrow: string;
  title: string;
  description: string;
  items: HomeFaqItem[];
};

export const HOME_FAQ: Record<HomeFaqLocale, HomeFaqCopy> = {
  de: {
    eyebrow: "FAQ",
    title: "Häufige Fragen",
    description:
      "Die wichtigsten Antworten rund um Permanent Make-up bei Salon Elen in Halle (Saale).",
    items: [
      {
        q: "Was kostet Permanent Make-up bei Salon Elen?",
        a: "Je nach Behandlung zwischen 130 und 450 Euro: Powder Brows 350 €, Hairstroke Brows 450 €, Lippenpigmentierung ab 380 €, Lidstrich und Wimpernkranzverdichtung ab 130 €. Beratung, Hautcheck und Vorzeichnung sind immer im Preis enthalten.",
      },
      {
        q: "Wie lange hält Permanent Make-up?",
        a: "Je nach Hauttyp, Lebensstil und Pflege in der Regel 1 bis 3 Jahre. Das Pigment verblasst danach langsam und gleichmäßig. Eine Auffrischung ist unkompliziert und wird individuell besprochen.",
      },
      {
        q: "Wie läuft die erste Behandlung ab?",
        a: "Jede Behandlung beginnt mit einer persönlichen Beratung und einem Hautcheck. Danach zeichnen wir Form und Farbe vor — pigmentiert wird erst, wenn Sie das Ergebnis freigegeben haben. Die Behandlung selbst dauert je nach Zone und Technik etwa 60 bis 180 Minuten.",
      },
      {
        q: "Wie kann ich einen Termin buchen?",
        a: "Rund um die Uhr online über unsere Terminbuchung auf permanent-halle.de/booking oder telefonisch unter +49 177 899 51 06.",
      },
      {
        q: "Wo befindet sich der Salon und wann ist geöffnet?",
        a: "Salon Elen, Lessingstraße 37, 06114 Halle (Saale) — im Paulusviertel, gut erreichbar aus allen Stadtteilen und dem Saalekreis. Öffnungszeiten: Montag bis Freitag 10–19 Uhr, Samstag 10–16 Uhr, Sonntag geschlossen.",
      },
      {
        q: "In welchen Sprachen werde ich beraten?",
        a: "Wir beraten Sie auf Deutsch, Russisch und Englisch — von der ersten Anfrage bis zur Nachsorge.",
      },
    ],
  },
  en: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    description:
      "The most important answers about permanent make-up at Salon Elen in Halle (Saale).",
    items: [
      {
        q: "How much does permanent make-up cost at Salon Elen?",
        a: "Between 130 and 450 euros depending on the treatment: Powder Brows €350, Hairstroke Brows €450, lip pigmentation from €380, eyeliner and lash line enhancement from €130. Consultation, skin check, and pre-drawing are always included.",
      },
      {
        q: "How long does permanent make-up last?",
        a: "Typically 1 to 3 years, depending on skin type, lifestyle, and aftercare. The pigment then fades slowly and evenly. A refresh is straightforward and discussed individually.",
      },
      {
        q: "What does the first treatment look like?",
        a: "Every treatment starts with a personal consultation and a skin check. We then pre-draw the shape and color — pigmentation only begins after your approval. The treatment itself takes about 60 to 180 minutes depending on the area and technique.",
      },
      {
        q: "How can I book an appointment?",
        a: "Online around the clock via our booking page at permanent-halle.de/booking or by phone at +49 177 899 51 06.",
      },
      {
        q: "Where is the salon located and what are the opening hours?",
        a: "Salon Elen, Lessingstrasse 37, 06114 Halle (Saale) — in the Paulusviertel district, easy to reach from anywhere in the city and the Saalekreis. Opening hours: Monday to Friday 10:00–19:00, Saturday 10:00–16:00, closed on Sunday.",
      },
      {
        q: "In which languages is the consultation available?",
        a: "We advise you in German, Russian, and English — from your first inquiry to aftercare.",
      },
    ],
  },
  ru: {
    eyebrow: "FAQ",
    title: "Частые вопросы",
    description:
      "Главные ответы о перманентном макияже в Salon Elen в Галле (Заале).",
    items: [
      {
        q: "Сколько стоит перманентный макияж в Salon Elen?",
        a: "В зависимости от процедуры — от 130 до 450 евро: Powder Brows 350 €, Hairstroke Brows 450 €, пигментация губ от 380 €, стрелка и межресничное пространство от 130 €. Консультация, проверка кожи и эскиз всегда включены в цену.",
      },
      {
        q: "Сколько держится перманентный макияж?",
        a: "Обычно от 1 до 3 лет — в зависимости от типа кожи, образа жизни и ухода. Затем пигмент постепенно и равномерно светлеет. Обновление проходит проще первичной процедуры и обсуждается индивидуально.",
      },
      {
        q: "Как проходит первая процедура?",
        a: "Каждая процедура начинается с персональной консультации и проверки кожи. Затем мы рисуем эскиз формы и подбираем цвет — пигментация начинается только после вашего одобрения. Сама процедура занимает от 60 до 180 минут в зависимости от зоны и техники.",
      },
      {
        q: "Как записаться?",
        a: "Круглосуточно онлайн через страницу записи permanent-halle.de/booking или по телефону +49 177 899 51 06.",
      },
      {
        q: "Где находится салон и какие часы работы?",
        a: "Salon Elen, Lessingstraße 37, 06114 Halle (Saale) — район Paulusviertel, удобно добираться из любой части города и Заалекрайса. Часы работы: понедельник–пятница 10:00–19:00, суббота 10:00–16:00, воскресенье — выходной.",
      },
      {
        q: "На каких языках проходит консультация?",
        a: "Мы консультируем на немецком, русском и английском — от первого обращения до рекомендаций по уходу.",
      },
    ],
  },
};
