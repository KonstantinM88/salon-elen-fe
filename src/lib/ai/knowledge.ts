// lib/ai/knowledge.ts
// Full multilingual knowledge base & copy deck for Permanent Halle (Halle) — Master: Elena
// Languages: DE (default), EN, RU
//
// Notes:
// - Keep medical content non-diagnostic (cosmetic only).
// - Prices must match the current price list.
// - Texts are written in a premium salon receptionist tone.
// - This file is designed to be used either as:
//   (A) a retrieval/RAG source, or
//   (B) injected as a "knowledge system message" using buildKnowledgeSystemMessage().

export type Lang = "DE" | "EN" | "RU";

export const PERMANENT_HALLE = {
  salon: {
    name: "Permanent Halle",
    city: "Halle",
    country: "Germany",
    master: "Elena",
    defaultLang: "DE" as Lang,
    languages: ["DE", "EN", "RU"] as Lang[],
  },

  // ---------------------------
  // PRICES (from your screenshots)
  // ---------------------------
  prices: {
    pmu: {
      brows: {
        powder: 350,
        hairstroke: 450,
      },
      lips: {
        aquarell: 380,
        lips3d: 420,
      },
      lashline: {
        lashline: 130,
        upper_lower: 150,
      },
      corrections_refresh: {
        correction_2_months: 120,
        refresh_12_24_months: 175,
        refresh_24_plus_months: 230,
        small_correction: 39,
      },
    },

    browsLashes: {
      // Brows
      waxing: 22,
      brow_styling: 40, // "Brow correction" in screenshot; we use a friendly label
      brow_lift: 50,
      hybrid_brows: 60,

      // Lashes
      lash_tint: 15,
      lash_lift: 55,

      // Combos (from screenshot)
      combos: {
        lash_lift_plus_brow_classic: 75,
        lash_lift_plus_brow_lift: 120,
        lash_lift_plus_hybrid_brows: 120,
        lash_tint_plus_brow_classic: 45,
      },
    },

    hydrafacial: {
      signature: 140,
      deluxe: 180,
      platinum: 270,
    },
  },

  // ---------------------------
  // GLOBAL STYLE / POLICIES
  // ---------------------------
  policies: {
    domain: [
      "booking appointments",
      "salon services & prices",
      "PMU consultation and aftercare guidance (cosmetic)",
      "brows & lashes services",
      "Hydrafacial",
      "location and opening hours (if provided elsewhere)",
    ],
    medicalBoundary: {
      DE: "Wir führen ausschließlich kosmetische Behandlungen durch und geben keine medizinische Beratung oder Diagnosen.",
      EN: "We provide cosmetic services only and do not give medical advice or diagnoses.",
      RU: "Мы выполняем только косметические процедуры и не даём медицинских рекомендаций и диагнозов.",
    },
    antiHallucination: {
      DE: "Wenn etwas nicht in unseren Infos steht, sage: „Ich kläre das kurz im Salon“ — und biete Termin/Info an. Nicht raten.",
      EN: "If something isn’t in our info, say: “I’ll quickly check with the salon” — don’t guess.",
      RU: "Если информации нет, скажи: «Уточню в салоне» — и предложи запись/консультацию. Не выдумывать.",
    },
    upsellRules: [
      "Max 1 upsell suggestion at a time.",
      "Never repeat after a decline.",
      "Only during consult/select/booking (not complaints).",
      "One sentence + one question.",
    ],
  },

  // ---------------------------
  // UI COPY: MENU / GENERAL
  // ---------------------------
  ui: {
    menu: {
      DE: {
        intro: "Wobei kann ich Ihnen helfen? 🌸",
        items: [
          "📅 Termin buchen",
          "💅 Behandlungen & Preise",
          "📍 Adresse & Öffnungszeiten",
          "❓ Beratung",
        ],
      },
      EN: {
        intro: "How can I help you today? 🌸",
        items: [
          "📅 Book appointment",
          "💅 Treatments & prices",
          "📍 Location & hours",
          "❓ Consultation",
        ],
      },
      RU: {
        intro: "Чем могу помочь? 🌸",
        items: [
          "📅 Записаться",
          "💅 Услуги и цены",
          "📍 Адрес и часы работы",
          "❓ Консультация",
        ],
      },
    },

    greetings: {
      DE: "Willkommen bei Permanent Halle 🌸 Ich helfe Ihnen gern mit Terminen, Behandlungen und Preisen. Wie kann ich Ihnen helfen?",
      EN: "Welcome to Permanent Halle 🌸 I can help with appointments, services and pricing. How can I assist you?",
      RU: "Добро пожаловать в Permanent Halle 🌸 Помогу с записью, услугами и ценами. Чем могу помочь?",
    },

    booking: {
      DE: {
        reserved: "Perfekt 🌸 Ich habe **{date} um {time}** bei Elena für Sie vorgemerkt.",
        confirm_method: "Wie möchten Sie die Terminbestätigung erhalten? 📱 SMS / 💬 Telegram",
        slot_taken: "Dieses Zeitfenster ist leider gerade vergeben 🌿 Hier sind die nächsten verfügbaren Optionen:",
        canceled: "Natürlich 🌿 Ich habe den Termin storniert. Möchten Sie neu buchen oder zurück ins Menü?",
        changed: "Kein Problem 🌸 Ich finde gern eine andere Zeit für Sie. Welcher Tag passt besser?",
      },
      EN: {
        reserved: "Perfect 🌸 I’ve reserved **{date} at {time}** with Elena for you.",
        confirm_method: "How would you like to receive confirmation? 📱 SMS / 💬 Telegram",
        slot_taken: "That slot was just taken 🌿 Here are the next available options:",
        canceled: "Of course 🌿 I cancelled your appointment. Would you like to book a new one or return to the menu?",
        changed: "No problem 🌸 I’ll find another time. Which day works better?",
      },
      RU: {
        reserved: "Отлично 🌸 Я поставила бронь на **{date} в {time}** к Елене.",
        confirm_method: "Как вам удобнее подтвердить запись? 📱 SMS / 💬 Telegram",
        slot_taken: "К сожалению, это время уже занято 🌿 Вот ближайшие доступные варианты:",
        canceled: "Конечно 🌿 Я отменила запись. Хотите записаться заново или вернуться в меню?",
        changed: "Без проблем 🌸 Давайте подберём другое время. Какой день удобнее?",
      },
    },

    out_of_scope: {
      DE: "Ich bin die Assistentin von Permanent Halle 🌸 Ich helfe bei Terminen und Fragen zu unseren Behandlungen. Wobei kann ich unterstützen?",
      EN: "I’m the Permanent Halle salon assistant 🌸 I can help with appointments and treatment questions. How can I assist?",
      RU: "Я ассистент салона Permanent Halle 🌸 Помогаю с записью и вопросами по процедурам. Чем помочь?",
    },
  },

  // ---------------------------
  // SERVICES CATALOG (for routing)
  // ---------------------------
  services: {
    categories: ["PMU", "BROWS_LASHES", "HYDRAFACIAL"] as const,
    pmu: {
      items: [
        { id: "pmu_brows_powder", name: { DE: "Powder Brows", EN: "Powder Brows", RU: "Пудровые брови" } },
        { id: "pmu_brows_hairstroke", name: { DE: "Hairstroke Brows", EN: "Hairstroke Brows", RU: "Волосковая техника" } },
        { id: "pmu_lips_aquarell", name: { DE: "Aquarell Lips", EN: "Aquarelle Lips", RU: "Акварельные губы" } },
        { id: "pmu_lips_3d", name: { DE: "3D Lips", EN: "3D Lips", RU: "3D губы" } },
        { id: "pmu_lashline", name: { DE: "Wimpernkranz", EN: "Lash line", RU: "Межресничка" } },
        { id: "pmu_lashline_upper_lower", name: { DE: "Oben & unten", EN: "Upper & lower", RU: "Верх+низ" } },
      ],
    },
    browsLashes: {
      items: [
        { id: "brows_waxing", name: { DE: "Waxing (Brow)", EN: "Waxing (Brow)", RU: "Воск (брови)" } },
        { id: "brows_styling", name: { DE: "Brow Styling", EN: "Brow styling", RU: "Оформление бровей" } },
        { id: "brows_lift", name: { DE: "Brow Lift", EN: "Brow lift", RU: "Ламинирование бровей" } },
        { id: "brows_hybrid", name: { DE: "Hybrid Brows", EN: "Hybrid brows", RU: "Hybrid brows" } },
        { id: "lashes_tint", name: { DE: "Wimpern färben", EN: "Lash tint", RU: "Окрашивание ресниц" } },
        { id: "lashes_lift", name: { DE: "Lash Lift", EN: "Lash lift", RU: "Ламинирование ресниц" } },
      ],
      combos: [
        { id: "combo_lashlift_browclassic", name: { DE: "Lash Lift + Brow Classic", EN: "Lash lift + brow classic", RU: "Ресницы + брови (классика)" } },
        { id: "combo_lashlift_browlift", name: { DE: "Lash Lift + Brow Lift", EN: "Lash lift + brow lift", RU: "Ламинирование ресниц + бровей" } },
        { id: "combo_lashlift_hybrid", name: { DE: "Lash Lift + Hybrid Brows", EN: "Lash lift + hybrid brows", RU: "Ламинирование ресниц + hybrid brows" } },
        { id: "combo_lashtint_browclassic", name: { DE: "Lash Tint + Brow Classic", EN: "Lash tint + brow classic", RU: "Окрашивание ресниц + брови (классика)" } },
      ],
    },
    hydrafacial: {
      items: [
        { id: "hydrafacial_signature", name: { DE: "Signature Hydrafacial", EN: "Signature Hydrafacial", RU: "Signature Hydrafacial" } },
        { id: "hydrafacial_deluxe", name: { DE: "Deluxe Hydrafacial", EN: "Deluxe Hydrafacial", RU: "Deluxe Hydrafacial" } },
        { id: "hydrafacial_platinum", name: { DE: "Platinum Hydrafacial", EN: "Platinum Hydrafacial", RU: "Platinum Hydrafacial" } },
      ],
    },
  },

  // ---------------------------
  // PMU CONSULTATION FLOWS
  // ---------------------------
  pmu: {
    consultation_start: {
      DE: "Sehr gern 🌸 Ich berate Sie zu Permanent Make-up für Augenbrauen, Lippen oder Wimpernkranz. Was interessiert Sie am meisten?",
      EN: "I’ll be happy to guide you 🌸 Brows, lips or lash line — what are you most interested in?",
      RU: "С радостью подскажу 🌸 Брови, губы или межресничка — что интересует больше всего?",
    },

    diagnostics: {
      brows: {
        DE: [
          "Haben Sie bereits PMU an den Brauen?",
          "Ist Ihre Haut eher trocken oder ölig?",
          "Möchten Sie sehr natürlich oder etwas definierter?",
        ],
        EN: [
          "Do you have previous brow PMU?",
          "Is your skin more dry or oily?",
          "Do you prefer very natural or more defined?",
        ],
        RU: [
          "Есть ли старый перманент на бровях?",
          "Кожа скорее сухая или жирная?",
          "Хотите максимально натурально или выразительнее?",
        ],
      },

      lips: {
        DE: [
          "Wünschen Sie eher natürliche Frische, mehr Farbe oder eine klarere Kontur?",
          "Sind die Lippen aktuell eher trocken/rau?",
        ],
        EN: [
          "Do you prefer natural freshness, more color, or clearer contour?",
          "Are your lips currently dry?",
        ],
        RU: [
          "Вам ближе лёгкая свежесть, более насыщенный цвет или чётче контур?",
          "Губы сейчас скорее сухие?",
        ],
      },

      lashline: {
        DE: [
          "Möchten Sie einen sehr dezenten Wimpernkranz oder oben & unten?",
          "Tragen Sie häufig Make-up oder lieber ganz natürlich?",
        ],
        EN: [
          "Do you want subtle lash line or upper & lower?",
          "Do you wear makeup often or prefer very natural?",
        ],
        RU: [
          "Хотите очень деликатную межресничку или верх+низ?",
          "Часто краситесь или предпочитаете натурально?",
        ],
      },
    },

    recommendations: {
      brows: {
        DE: {
          powder: "Basierend auf Ihren Angaben empfehle ich **Powder Brows** — weich, natürlich geschminkt und sehr harmonisch. Preis: **350 €**.",
          hairstroke: "Wenn Sie eine sichtbarere Härchen-Textur möchten, passen **Hairstroke Brows** sehr gut. Preis: **450 €**.",
        },
        EN: {
          powder: "Based on your answers I recommend **Powder Brows** — soft, naturally defined. Price: **€350**.",
          hairstroke: "If you want more visible hair texture, **Hairstroke Brows** can be ideal. Price: **€450**.",
        },
        RU: {
          powder: "По вашим ответам рекомендую **пудровые брови** — мягкий натуральный эффект. Цена: **350 €**.",
          hairstroke: "Если хотите более заметную текстуру «волосков», подойдут **Hairstroke Brows**. Цена: **450 €**.",
        },
      },

      lips: {
        DE: {
          aquarell: "**Aquarell Lips** geben frische, gleichmäßige Farbe ohne harte Kontur. Preis: **380 €**.",
          lips3d: "**3D Lips** wirken etwas intensiver/voluminöser. Preis: **420 €**.",
        },
        EN: {
          aquarell: "**Aquarelle Lips** add fresh, even color without harsh outline. Price: **€380**.",
          lips3d: "**3D Lips** look a bit more intense/voluminous. Price: **€420**.",
        },
        RU: {
          aquarell: "**Акварельные губы** — мягкий ровный цвет без жёсткого контура. Цена: **380 €**.",
          lips3d: "**3D губы** — эффект более насыщенный/объёмный. Цена: **420 €**.",
        },
      },

      lashline: {
        DE: {
          lashline: "**Wimpernkranz** verdichtet optisch die Wimpern – sehr natürlich. Preis: **130 €**.",
          upper_lower: "**Oben & unten**: etwas definierteres Ergebnis. Preis: **150 €**.",
        },
        EN: {
          lashline: "**Lash line** makes lashes look fuller, very natural. Price: **€130**.",
          upper_lower: "**Upper & lower**: slightly more defined result. Price: **€150**.",
        },
        RU: {
          lashline: "**Межресничка** визуально делает ресницы гуще, очень натурально. Цена: **130 €**.",
          upper_lower: "**Верх+низ**: более выраженный эффект. Цена: **150 €**.",
        },
      },
    },

    faq: {
      // General PMU FAQ
      DE: {
        what_is: "Permanent Make-up ist eine sanfte kosmetische Pigmentierung von Brauen, Lippen oder Lidlinie 🌸",
        duration: "Je nach Hauttyp und Bereich hält PMU meist **1,5–3 Jahre** und wird mit der Zeit sanft heller 🌿",
        pain: "Die Behandlung wird in der Regel gut toleriert 🌿 Wir arbeiten sehr sanft und präzise.",
        natural: "Unser Stil ist sehr natürlich 🌸 Form und Farbe werden individuell abgestimmt.",
        process: "Ablauf: Beratung → Vorzeichnung → Pigmentierung → Pflegehinweise 🌿",
        touch_up: "Eine Nachbehandlung nach ca. **4–8 Wochen** wird meist empfohlen 🌸",
        old_pmu: "Bestehendes PMU kann oft aufgefrischt oder angepasst werden 🌿 Wir beurteilen das individuell.",
        price_hint: "Gern nenne ich den Preis je nach Zone/Technik oder empfehle das passende Paket 🌸",
      },
      EN: {
        what_is: "Permanent make-up is gentle cosmetic pigmentation of brows, lips or lash line 🌸",
        duration: "Typically lasts **1.5–3 years** depending on skin and area, fading softly over time 🌿",
        pain: "Generally well tolerated 🌿 We work gently and precisely.",
        natural: "Our style is very natural 🌸 Shape and color are tailored to you.",
        process: "Process: consultation → pre-drawing → pigmentation → aftercare 🌿",
        touch_up: "A touch-up after about **4–8 weeks** is usually recommended 🌸",
        old_pmu: "Existing PMU can often be refreshed or adjusted 🌿 Assessed individually.",
        price_hint: "I can share exact prices per area/technique or recommend the best option 🌸",
      },
      RU: {
        what_is: "Перманент — это деликатная косметическая пигментация бровей, губ или межреснички 🌸",
        duration: "Обычно держится **1,5–3 года**, со временем мягко светлеет 🌿",
        pain: "Процедура переносится комфортно 🌿 Работа делается деликатно.",
        natural: "Наш стиль максимально натуральный 🌸 Форма и цвет подбираются индивидуально.",
        process: "Этапы: консультация → эскиз → пигментация → рекомендации по уходу 🌿",
        touch_up: "Коррекция обычно через **4–8 недель** 🌸",
        old_pmu: "Старый перманент часто можно обновить/скорректировать 🌿 Оцениваем индивидуально.",
        price_hint: "Могу назвать точную стоимость по зоне/технике или подобрать вариант 🌸",
      },
    },

    healing_1_30: {
      DE: {
        overview: "Die Heilung verläuft schrittweise über ca. **4 Wochen** 🌿 In den ersten Tagen wirkt die Farbe kräftiger, danach weicher und natürlicher.",
        d1_3: "Tage 1–3: Farbe intensiver/definierter 🌿 leichte Empfindlichkeit möglich. Bereich sauber halten und möglichst trocken.",
        d4_7: "Tage 4–7: leichte Schuppung/Erneuerung 🌿 Bitte nicht reiben oder entfernen.",
        d7_14: "Tage 7–14: Farbe wirkt vorübergehend heller 🌿 Pigment stabilisiert sich.",
        d14_30: "Tage 14–30: Ergebnis wird weich und natürlich 🌸 Endfarbe zeigt sich schrittweise.",
        rules: [
          "Nicht kratzen, nicht rubbeln, keine Schüppchen entfernen.",
          "Während der Heilphase Sauna/Solarium/Intensivsonne vermeiden.",
          "Kein Make-up direkt auf der behandelten Stelle in den ersten Tagen.",
          "Bei ungewöhnlichen Reaktionen bitte den Salon kontaktieren.",
        ],
        reassurance: "Veränderungen während der Heilung sind normal 🌸 Das endgültige Ergebnis zeigt sich schrittweise.",
      },
      EN: {
        overview: "Healing takes about **4 weeks** 🌿 Color looks stronger at first, then softens to a natural result.",
        d1_3: "Days 1–3: color appears stronger 🌿 mild sensitivity possible. Keep clean and mostly dry.",
        d4_7: "Days 4–7: light flaking 🌿 do not rub or pick.",
        d7_14: "Days 7–14: temporary fading 🌿 pigment is settling.",
        d14_30: "Days 14–30: result becomes soft and natural 🌸 final color appears gradually.",
        rules: [
          "Do not scratch or pick.",
          "Avoid sauna/tanning/strong sun during healing.",
          "No makeup directly on the treated area initially.",
          "If anything unusual occurs, contact the salon.",
        ],
        reassurance: "Healing changes are normal 🌸 Final results appear gradually.",
      },
      RU: {
        overview: "Заживление занимает около **4 недель** 🌿 Сначала оттенок ярче, затем становится мягче и натуральнее.",
        d1_3: "Дни 1–3: цвет ярче 🌿 возможна лёгкая чувствительность. Держать чисто и максимально сухо.",
        d4_7: "Дни 4–7: лёгкое шелушение 🌿 не тереть и не снимать.",
        d7_14: "Дни 7–14: временное осветление 🌿 пигмент стабилизируется.",
        d14_30: "Дни 14–30: итог проявляется, результат мягкий и натуральный 🌸",
        rules: [
          "Не чесать и не снимать корочки/шелушение.",
          "В период заживления избегать сауны/солярия/сильного солнца.",
          "В первые дни не наносить макияж на зону.",
          "Если что-то необычное — написать/позвонить в салон.",
        ],
        reassurance: "Изменения в процессе заживления нормальны 🌸 Итог проявляется постепенно.",
      },
    },

    preparation: {
      DE: {
        general: [
          "24–48 Stunden vorher: intensive Sonne/Solarium, Sauna und Alkohol möglichst vermeiden.",
          "Am Tag der Behandlung: ausgeruht kommen, normal essen und trinken.",
          "Keine frischen, reizenden Behandlungen/Peelings direkt im Bereich kurz vor dem Termin.",
        ],
        brows: [
          "Brauen bitte nicht kurz vorher färben.",
          "Kein starkes Peeling im Bereich.",
          "Form muss nicht vorbereitet werden – wir stimmen alles vor Ort ab.",
        ],
        lips: [
          "Lippen gut pflegen und befeuchten.",
          "Bei trockenen Stellen vorher sanft pflegen.",
        ],
        eyes: [
          "Ohne Augenreizungen kommen.",
          "Keine frische Wimpernbehandlung direkt davor.",
        ],
      },
      EN: {
        general: [
          "24–48h before: avoid strong sun/tanning, sauna, and alcohol if possible.",
          "On the day: come rested, eat and drink normally.",
          "Avoid fresh irritating peels/treatments on the area right before.",
        ],
        brows: [
          "Avoid tinting brows right before.",
          "No strong peeling on the brow area.",
          "No need to pre-shape — we plan everything together.",
        ],
        lips: [
          "Moisturize lips well.",
          "Gently care for dry areas beforehand.",
        ],
        eyes: [
          "No eye irritation.",
          "Avoid fresh lash treatments right before.",
        ],
      },
      RU: {
        general: [
          "За 24–48 часов: избегать активного солнца/солярия, сауны и алкоголя.",
          "В день процедуры: прийти отдохнувшей, нормально поесть и пить.",
          "Не делать активные пилинги/раздражающие процедуры по зоне накануне.",
        ],
        brows: [
          "Не окрашивать брови накануне.",
          "Не делать сильные пилинги в зоне.",
          "Форму готовить не нужно — всё согласуем на месте.",
        ],
        lips: [
          "Хорошо увлажнять губы.",
          "Если есть сухость — заранее мягкий уход.",
        ],
        eyes: [
          "Без раздражения глаз.",
          "Не делать свежие процедуры ресниц прямо перед PMU.",
        ],
      },
    },

    contraindications_safe: {
      DE: [
        "Wir arbeiten nicht auf gereizter, entzündeter oder verletzter Haut.",
        "Bei akuter Empfindlichkeit im Bereich wird der Termin verschoben.",
        "In bestimmten Situationen beraten wir individuell vor Ort – Sicherheit hat Priorität.",
      ],
      EN: [
        "We don’t perform PMU on irritated, inflamed, or injured skin.",
        "If there’s acute sensitivity, we postpone the appointment.",
        "In some situations we advise individually in person — safety first.",
      ],
      RU: [
        "Мы не выполняем PMU на раздражённой/воспалённой/повреждённой коже.",
        "При выраженной чувствительности процедуру лучше перенести.",
        "В некоторых случаях нужна индивидуальная консультация — безопасность в приоритете.",
      ],
    },

    objections: {
      // Common objections with premium reassurance + next step
      DE: {
        unnatural: "Das verstehen wir gut 🌿 Unser Stil ist sehr natürlich — Ziel ist ein harmonischer, eleganter Effekt. Möchten Sie eher sehr soft oder etwas definierter?",
        not_like: "Form und Farbe werden immer vorab gemeinsam abgestimmt 🌸 Sie sehen die Vorzeichnung und entscheiden in Ruhe. Wollen wir mit einer Beratung starten?",
        pain: "Die Behandlung wird meist gut toleriert 🌿 Wir arbeiten sehr sanft. Möchten Sie lieber Brows, Lippen oder Wimpernkranz?",
        healing_long: "Die Heilung läuft schrittweise über einige Wochen 🌿 Im Alltag sind Sie meist schnell wieder normal unterwegs. Soll ich Ihnen den Ablauf kurz erklären?",
        too_dark: "Direkt danach wirkt die Farbe intensiver 🌿 Nach der Heilung wird sie weicher und natürlicher. Möchten Sie ein sehr dezentes Ergebnis?",
        forever: "PMU verblasst mit der Zeit sanft 🌿 Es ist keine lebenslange Veränderung. Wollen Sie eine Beratung oder direkt einen Termin?",
        expensive: "PMU ist eine präzise, individuelle Arbeit 🌸 Viele sparen täglich Zeit und Make-up. Möchten Sie die Preise für eine bestimmte Zone?",
        cheaper_elsewhere: "Verstehen wir 🌿 Qualität und Natürlichkeit unterscheiden sich stark. Unser Fokus sind harmonische Ergebnisse. Darf ich Ihnen die passende Technik empfehlen?",
      },
      EN: {
        unnatural: "Totally understandable 🌿 Our style is very natural — harmonious and elegant. Do you prefer very soft or more defined?",
        not_like: "We always agree shape and color beforehand 🌸 You see the pre-drawing and decide calmly. Shall we start with a consultation?",
        pain: "Generally well tolerated 🌿 We work gently. Are you interested in brows, lips, or lash line?",
        healing_long: "Healing is gradual over a few weeks 🌿 Daily routine usually resumes quickly. Want a quick healing timeline?",
        too_dark: "Color looks stronger right after 🌿 It softens during healing. Do you prefer a very subtle result?",
        forever: "PMU fades softly over time 🌿 It’s not lifelong. Would you like a consultation or book directly?",
        expensive: "PMU is precise, personalized work 🌸 Many save daily time and makeup. Which area do you want pricing for?",
        cheaper_elsewhere: "We understand 🌿 Quality and naturalness vary widely. Our focus is harmonious results. Want a quick recommendation?",
      },
      RU: {
        unnatural: "Понимаем 🌿 Наш стиль максимально натуральный — гармонично и аккуратно. Вам ближе очень мягко или чуть выразительнее?",
        not_like: "Форма и цвет всегда согласовываются заранее 🌸 Вы видите эскиз и спокойно решаете. Начнём с консультации?",
        pain: "Процедура обычно комфортная 🌿 Работаем деликатно. Что интересует: брови, губы или межресничка?",
        healing_long: "Заживление постепенное, несколько недель 🌿 В обычной жизни обычно быстро комфортно. Рассказать таймлайн?",
        too_dark: "Сразу после процедуры цвет ярче 🌿 Потом становится мягче и светлее. Хотите максимально деликатный эффект?",
        forever: "Перманент со временем мягко светлеет 🌿 Это не пожизненно. Хотите консультацию или сразу записаться?",
        expensive: "Перманент — точная индивидуальная работа 🌸 Экономит время каждый день. Какая зона интересует по цене?",
        cheaper_elsewhere: "Понимаем 🌿 Качество и натуральность сильно отличаются. Мы делаем гармоничный результат. Подобрать технику?",
      },
    },

    prices_dialogue: {
      // Full price dialogue blocks (DE/EN/RU)
      start: {
        DE: "Sehr gern 🌸 Für welche Zone möchten Sie den Preis erfahren: **Brauen**, **Lippen** oder **Wimpernkranz**?",
        EN: "Of course 🌸 Which area would you like pricing for: **brows**, **lips** or **lash line**?",
        RU: "С радостью 🌸 Какая зона интересует по цене: **брови**, **губы** или **межресничка**?",
      },
      brows: {
        DE: "PMU Brauen: **Powder Brows 350 €**, **Hairstroke Brows 450 €** 🌿 Möchten Sie eine Empfehlung passend zu Ihrem Hauttyp?",
        EN: "Brow PMU: **Powder Brows €350**, **Hairstroke Brows €450** 🌿 Would you like a recommendation for your skin type?",
        RU: "Перманент бровей: **пудровые 350 €**, **волосковые 450 €** 🌿 Подобрать вариант под ваш тип кожи?",
      },
      lips: {
        DE: "PMU Lippen: **Aquarell Lips 380 €**, **3D Lips 420 €** 🌿 Möchten Sie eher natürliche Frische oder mehr Farbe?",
        EN: "Lip PMU: **Aquarelle Lips €380**, **3D Lips €420** 🌿 Do you prefer natural freshness or more color?",
        RU: "Перманент губ: **акварель 380 €**, **3D 420 €** 🌿 Вам ближе лёгкая свежесть или более ярко?",
      },
      lashline: {
        DE: "Wimpernkranz: **130 €** • Oben & unten: **150 €** 🌿 Möchten Sie eher sehr dezent oder etwas definierter?",
        EN: "Lash line: **€130** • Upper & lower: **€150** 🌿 Subtle or more defined?",
        RU: "Межресничка: **130 €** • Верх+низ: **150 €** 🌿 Хотите очень деликатно или выразительнее?",
      },
      corrections: {
        DE: "Korrektur/Refresh: **Korrektur (2 Monate) 120 €**, **Refresh 12–24 Monate 175 €**, **Refresh 24+ Monate 230 €**, **kleine Korrektur 39 €**.",
        EN: "Correction/refresh: **2-month touch-up €120**, **12–24 months refresh €175**, **24+ months refresh €230**, **small correction €39**.",
        RU: "Коррекции/обновление: **коррекция (2 месяца) 120 €**, **refresh 12–24 мес 175 €**, **24+ мес 230 €**, **малая коррекция 39 €**.",
      },
    },
  },

  // ---------------------------
  // BROWS & LASHES FAQ + SALES
  // ---------------------------
  browsLashes: {
    overview: {
      DE: "Wir bieten Browlifting, Lashlifting, Styling und Kombis 🌸 Möchten Sie den Preis oder eine Empfehlung?",
      EN: "We offer brow lift, lash lift, styling and combos 🌸 Price or recommendation?",
      RU: "У нас ламинирование бровей/ресниц, оформление и комбинированные процедуры 🌸 Цена или рекомендация?",
    },
    prices: {
      DE: [
        "Waxing: 22 €",
        "Brow Styling: 40 €",
        "Brow Lift: 50 €",
        "Hybrid Brows: 60 €",
        "Lash Tint: 15 €",
        "Lash Lift: 55 €",
        "Kombi: Lash Lift + Brow Classic: 75 €",
        "Kombi: Lash Lift + Brow Lift: 120 €",
        "Kombi: Lash Lift + Hybrid Brows: 120 €",
        "Kombi: Lash Tint + Brow Classic: 45 €",
      ],
      EN: [
        "Waxing: €22",
        "Brow styling: €40",
        "Brow lift: €50",
        "Hybrid brows: €60",
        "Lash tint: €15",
        "Lash lift: €55",
        "Combo: Lash lift + brow classic: €75",
        "Combo: Lash lift + brow lift: €120",
        "Combo: Lash lift + hybrid brows: €120",
        "Combo: Lash tint + brow classic: €45",
      ],
      RU: [
        "Воск (брови): 22 €",
        "Оформление бровей: 40 €",
        "Ламинирование бровей: 50 €",
        "Hybrid brows: 60 €",
        "Окрашивание ресниц: 15 €",
        "Ламинирование ресниц: 55 €",
        "Комбо: ресницы + брови (классика): 75 €",
        "Комбо: ламинирование ресниц + ламинирование бровей: 120 €",
        "Комбо: ламинирование ресниц + hybrid brows: 120 €",
        "Комбо: окрашивание ресниц + брови (классика): 45 €",
      ],
    },
  },

  // ---------------------------
  // HYDRAFACIAL FAQ + SALES
  // ---------------------------
  hydrafacial: {
    overview: {
      DE: "Hydrafacial ist eine tiefenreinigende Pflege für glatte, strahlende Haut 🌸 Möchten Sie Signature, Deluxe oder Platinum?",
      EN: "Hydrafacial is deep cleansing care for smoother, radiant skin 🌸 Signature, Deluxe or Platinum?",
      RU: "Hydrafacial — глубокое очищение и уход для гладкой сияющей кожи 🌸 Signature, Deluxe или Platinum?",
    },
    prices: {
      DE: ["Signature Hydrafacial: 140 €", "Deluxe Hydrafacial: 180 €", "Platinum Hydrafacial: 270 €"],
      EN: ["Signature Hydrafacial: €140", "Deluxe Hydrafacial: €180", "Platinum Hydrafacial: €270"],
      RU: ["Signature Hydrafacial: 140 €", "Deluxe Hydrafacial: 180 €", "Platinum Hydrafacial: 270 €"],
    },
    tiers: {
      signature: {
        duration_min: 60,
        includes: {
          DE: ["Tiefenreinigung", "Säure-Peeling", "Extraktion (Porenreinigung)", "Feuchtigkeitspflege mit Hyaluronsäure"],
          EN: ["Deep cleansing", "Acid peeling", "Extraction (pore cleansing)", "Hydration with hyaluronic acid"],
          RU: ["Глубокое очищение", "Кислотный пилинг", "Экстракция (очищение пор)", "Увлажнение гиалуроновой кислотой"],
        },
        best_for: {
          DE: "Perfekt als regelmäßige Grundpflege alle 4–6 Wochen oder als Einstieg 🌸",
          EN: "Perfect as regular maintenance every 4–6 weeks or as a first treatment 🌸",
          RU: "Идеально как регулярный уход раз в 4–6 недель или для первого знакомства 🌸",
        },
      },
      deluxe: {
        duration_min: 75,
        includes: {
          DE: ["Alles aus Signature", "Intensiveres Peeling", "LED-Lichttherapie (Hauterneuerung)", "Antioxidantien-Booster"],
          EN: ["Everything in Signature", "More intensive peeling", "LED light therapy (skin renewal)", "Antioxidant booster"],
          RU: ["Всё из Signature", "Усиленный пилинг", "LED-терапия (обновление кожи)", "Антиоксидантный бустер"],
        },
        best_for: {
          DE: "Ideal bei müder, fahler Haut die einen sichtbaren Boost braucht 🌿",
          EN: "Ideal for tired, dull skin that needs a visible boost 🌿",
          RU: "Идеально для уставшей, тусклой кожи, которой нужен заметный буст 🌿",
        },
      },
      platinum: {
        duration_min: 90,
        includes: {
          DE: ["Alles aus Deluxe", "Lymphdrainage-Massage", "Premium-Booster-Seren", "Spezial-Maske für maximale Regeneration"],
          EN: ["Everything in Deluxe", "Lymphatic drainage massage", "Premium booster serums", "Special mask for maximum regeneration"],
          RU: ["Всё из Deluxe", "Лимфодренажный массаж", "Премиум бустер-сыворотки", "Специальная маска для максимальной регенерации"],
        },
        best_for: {
          DE: "Die VIP-Verwöhnung: vor Events, Hochzeiten oder als ultimatives Self-Care-Erlebnis ✨",
          EN: "The VIP pampering: before events, weddings, or as the ultimate self-care experience ✨",
          RU: "VIP-процедура: перед мероприятиями, свадьбой или как максимальный self-care ✨",
        },
      },
    },
    faq: {
      DE: {
        how_it_works: "Hydrafacial arbeitet mit patentierter Vortex-Technologie in 3 Schritten: Reinigung, sanfte Extraktion und Befeuchtung 🌿 Komplett schmerzfrei.",
        skin_types: "Geeignet für alle Hauttypen — auch bei empfindlicher oder zu Akne neigender Haut 🌸",
        downtime: "Keine Ausfallzeit! Direkt nach der Behandlung sieht die Haut frisch und strahlend aus ✨",
        frequency: "Für optimale Ergebnisse alle 4–6 Wochen. Als Einzelbehandlung vor Events auch super.",
        with_makeup: "Am besten 24 Stunden nach der Behandlung kein Make-up tragen, damit die Wirkstoffe optimal wirken.",
      },
      EN: {
        how_it_works: "Hydrafacial uses patented Vortex technology in 3 steps: cleansing, gentle extraction, and hydration 🌿 Completely painless.",
        skin_types: "Suitable for all skin types — including sensitive and acne-prone skin 🌸",
        downtime: "Zero downtime! Skin looks fresh and radiant immediately after treatment ✨",
        frequency: "Every 4–6 weeks for optimal results. Also great as a one-off before events.",
        with_makeup: "Best to skip makeup for 24 hours after treatment to let the active ingredients work.",
      },
      RU: {
        how_it_works: "Hydrafacial использует патентованную Vortex-технологию в 3 этапа: очищение, мягкая экстракция и увлажнение 🌿 Полностью безболезненно.",
        skin_types: "Подходит для всех типов кожи — даже чувствительной и проблемной 🌸",
        downtime: "Никакого периода восстановления! Кожа выглядит свежей и сияющей сразу после процедуры ✨",
        frequency: "Для лучших результатов раз в 4–6 недель. Отлично и как разовая процедура перед мероприятием.",
        with_makeup: "Лучше не наносить макияж 24 часа после процедуры, чтобы активные вещества подействовали.",
      },
    },
  },

  // ---------------------------
  // UPSELL MATRIX (texts + triggers)
  // ---------------------------
  upsell: {
    // Common templates: one sentence + one question
    templates: {
      DE: {
        many_clients: "Viele Kundinnen kombinieren {A} mit {B} 🌸 Möchten Sie beides im gleichen Termin?",
        add_on: "Möchten Sie Ihren Termin noch mit {B} ergänzen? 🌸",
      },
      EN: {
        many_clients: "Many clients combine {A} with {B} 🌸 Would you like both in one appointment?",
        add_on: "Would you like to add {B} to your appointment? 🌸",
      },
      RU: {
        many_clients: "Многие клиентки сочетают {A} с {B} 🌸 Хотите совместить в один визит?",
        add_on: "Хотите дополнить запись {B}? 🌸",
      },
    },

    offers: {
      // PMU -> Lashes
      pmu_to_lashes: {
        triggerServices: ["pmu_brows_powder", "pmu_brows_hairstroke", "pmu_lashline", "pmu_lashline_upper_lower"],
        DE: "Viele Kundinnen kombinieren PMU mit **Lash Lift** 🌸 Das öffnet den Blick und wirkt sehr harmonisch. Möchten Sie das ergänzen? (Lash Lift 55 €)",
        EN: "Many clients combine PMU with a **Lash lift** 🌸 It opens the eyes beautifully. Would you like to add it? (Lash lift €55)",
        RU: "Многие клиентки дополняют PMU **ламинированием ресниц** 🌸 Взгляд становится более открытым. Добавить? (55 €)",
      },

      // PMU -> Hydrafacial
      pmu_to_hydra: {
        triggerServices: ["pmu_brows_powder", "pmu_brows_hairstroke", "pmu_lips_aquarell", "pmu_lips_3d", "pmu_lashline", "pmu_lashline_upper_lower"],
        DE: "Für ein besonders frisches Gesamtbild ergänzen viele Kundinnen PMU mit **Hydrafacial** 🌸 Möchten Sie das dazu buchen? (ab 140 €)",
        EN: "For an extra fresh look, many add **Hydrafacial** to PMU 🌸 Would you like to book it too? (from €140)",
        RU: "Для максимально ухоженного эффекта многие добавляют **Hydrafacial** к PMU 🌸 Добавить? (от 140 €)",
      },

      // Lift -> Tint
      lift_to_tint: {
        triggerServices: ["lashes_lift", "brows_lift"],
        DE: "Für ein definierteres Ergebnis wird Lifting oft mit **Färben** kombiniert 🌿 Möchten Sie Färben ergänzen? (15 €)",
        EN: "For more definition, lifting is often combined with **tint** 🌿 Add tint? (€15)",
        RU: "Для более выразительного эффекта ламинирование часто дополняют **окрашиванием** 🌿 Добавить? (15 €)",
      },

      // Lash lift -> Brows
      lash_to_brows: {
        triggerServices: ["lashes_lift"],
        DE: "Für einen besonders harmonischen Look ergänzen viele Kundinnen Lash Lift mit **Brow Styling** 🌸 Möchten Sie das dazu? (40 €)",
        EN: "For a balanced look, many add **brow styling** to lash lift 🌸 Would you like that? (€40)",
        RU: "Для гармоничного результата к ламинированию ресниц часто добавляют **оформление бровей** 🌸 Добавить? (40 €)",
      },

      // Brows/lashes -> Hydrafacial
      eyes_to_hydra: {
        triggerServices: ["lashes_lift", "brows_lift", "brows_styling", "brows_hybrid"],
        DE: "Wenn Sie noch mehr Glow möchten: Viele kombinieren Augen-/Brow-Behandlungen mit **Hydrafacial** 🌸 Möchten Sie das ergänzen? (ab 140 €)",
        EN: "For extra glow: many combine eye/brow treatments with **Hydrafacial** 🌸 Add it? (from €140)",
        RU: "Если хотите больше glow: многие сочетают брови/ресницы с **Hydrafacial** 🌸 Добавить? (от 140 €)",
      },

      // Hydrafacial -> Brows/Lashes
      hydra_to_eyes: {
        triggerServices: ["hydrafacial_signature", "hydrafacial_deluxe", "hydrafacial_platinum"],
        DE: "Für ein rundum gepflegtes Ergebnis ergänzen viele Hydrafacial mit **Brow Styling** oder **Lash Lift** 🌸 Möchten Sie etwas davon dazu buchen?",
        EN: "For a fully polished look, many add **brow styling** or a **lash lift** to Hydrafacial 🌸 Would you like to add one?",
        RU: "Для полного эффекта многие дополняют Hydrafacial **бровями** или **ресницами** 🌸 Добавить?",
      },
    },
  },

  // ---------------------------
  // SERVICE PERSONAS — Who is each service best for
  // ---------------------------
  servicePersonas: {
    powder_brows: {
      DE: "Ideal für: Frauen, die morgens „aufwachen und fertig sein“ möchten. Natürlich, weich, für den Alltag.",
      EN: "Ideal for: Women who want to wake up ready. Natural, soft, for everyday life.",
      RU: "Идеально для: девушек, которые хотят просыпаться уже «с макияжем». Натурально, мягко, на каждый день.",
    },
    hairstroke_brows: {
      DE: "Ideal für: Wer mehr Textur und Natürlichkeit möchte — sichtbare Härchen wie „echte“ Brauen.",
      EN: "Ideal for: Those who want more texture and naturalness — visible strokes like real brows.",
      RU: "Идеально для: тех, кто хочет больше текстуры — видны «волоски» как настоящие брови.",
    },
    aquarell_lips: {
      DE: "Ideal für: Wer frische, natürliche Lippenfarbe möchte — ohne harten Kontur-Effekt.",
      EN: "Ideal for: Those who want fresh, natural lip color — without a harsh outline.",
      RU: "Идеально для: свежий натуральный оттенок губ — без жёсткого контура.",
    },
    lips_3d: {
      DE: "Ideal für: Wer mehr Farbe und etwas Volumeneffekt möchte — für Frauen, die Lippenstift lieben.",
      EN: "Ideal for: Those who want more color and a slight volume effect — for lipstick lovers.",
      RU: "Идеально для: больше цвета и лёгкий эффект объёма — для тех, кто любит яркие губы.",
    },
    lash_lift: {
      DE: "Ideal für: Frauen, die ohne Wimperntusche voller, geschwungener aussehen möchten. Null Aufwand, 6–8 Wochen Haltbarkeit.",
      EN: "Ideal for: Women who want fuller, curled lashes without mascara. Zero maintenance, lasts 6–8 weeks.",
      RU: "Идеально для: тех, кто хочет пышные изогнутые ресницы без туши. Без усилий, держится 6–8 недель.",
    },
    brow_lift: {
      DE: "Ideal für: Widerspenstige Brauen in Form bringen. Wirken voller und gepflegter. 4–6 Wochen Halt.",
      EN: "Ideal for: Taming unruly brows. They look fuller and neater. Lasts 4–6 weeks.",
      RU: "Идеально для: непослушных бровей — ложатся в форму, выглядят пышнее и аккуратнее. Держится 4–6 недель.",
    },
    hydrafacial_signature: {
      DE: "Ideal für: Regelmäßige Pflege, Einstieg in Hydrafacial, oder schnelle Auffrischung zwischen Events.",
      EN: "Ideal for: Regular maintenance, trying Hydrafacial for the first time, or a quick refresh.",
      RU: "Идеально для: регулярного ухода, первого знакомства с Hydrafacial или быстрого освежения.",
    },
    hydrafacial_deluxe: {
      DE: "Ideal für: Müde, fahle Haut die sichtbar aufgeweckt werden soll. Spürbarer Unterschied nach einer Sitzung.",
      EN: "Ideal for: Tired, dull skin that needs a visible wake-up. Noticeable difference after one session.",
      RU: "Идеально для: уставшей тусклой кожи, которую нужно «разбудить». Заметный результат после одной процедуры.",
    },
    hydrafacial_platinum: {
      DE: "Ideal für: Vor Hochzeiten/Events, als Geschenk, oder maximale Verwöhnung. Premium-Erlebnis.",
      EN: "Ideal for: Before weddings/events, as a gift, or maximum pampering. Premium experience.",
      RU: "Идеально для: перед свадьбой/мероприятием, как подарок, или для максимального удовольствия.",
    },
  },

  // ---------------------------
  // OCCASION-BASED RECOMMENDATIONS
  // ---------------------------
  occasions: {
    wedding: {
      DE: {
        timeline: "Hochzeit-Beauty-Plan 💍\n• 6–8 Wochen vorher: PMU (Brauen und/oder Lippen)\n• 4–6 Wochen vorher: PMU-Korrektur\n• 1 Woche vorher: Hydrafacial Platinum + Lash Lift\n• Am Tag: aufwachen und strahlen! ✨",
        tip: "Die meisten Bräute wählen Powder Brows + Aquarell Lips für ein natürlich-perfektes Ergebnis 🌸",
      },
      EN: {
        timeline: "Wedding beauty plan 💍\n• 6–8 weeks before: PMU (brows and/or lips)\n• 4–6 weeks before: PMU touch-up\n• 1 week before: Hydrafacial Platinum + Lash Lift\n• On the day: wake up and glow! ✨",
        tip: "Most brides choose Powder Brows + Aquarelle Lips for a naturally flawless result 🌸",
      },
      RU: {
        timeline: "Бьюти-план к свадьбе 💍\n• 6–8 недель до: PMU (брови и/или губы)\n• 4–6 недель до: коррекция PMU\n• 1 неделя до: Hydrafacial Platinum + Lash Lift\n• В день свадьбы: просыпаетесь уже красивой! ✨",
        tip: "Самый популярный выбор невест — Powder Brows + акварельные губы для идеально-натурального результата 🌸",
      },
    },
    vacation: {
      DE: {
        tip: "Urlaubs-Tipp: PMU mindestens 4 Wochen vorher buchen 🌿 Dann ist alles verheilt und Sie brauchen kein Make-up am Strand, im Pool oder bei Abendessen.",
      },
      EN: {
        tip: "Vacation tip: book PMU at least 4 weeks before your trip 🌿 Everything will be healed and you won't need makeup at the beach, pool, or dinner.",
      },
      RU: {
        tip: "Совет к отпуску: PMU лучше сделать минимум за 4 недели до поездки 🌿 Всё заживёт и не нужно будет думать о макияже на пляже, в бассейне или за ужином.",
      },
    },
    first_time: {
      DE: {
        reassurance: "Wenn es Ihr erstes Mal ist — keine Sorge! 🌸 Wir empfehlen die natürlichste Variante, stimmen alles vorab ab und Sie entscheiden in Ruhe. Aufbauen kann man immer.",
      },
      EN: {
        reassurance: "If it's your first time — don't worry! 🌸 We recommend the most natural option, align everything beforehand, and you decide at your own pace. You can always build on it later.",
      },
      RU: {
        reassurance: "Если это ваш первый перманент — не переживайте! 🌸 Мы рекомендуем самый натуральный вариант, всё согласовываем заранее и вы решаете спокойно. Усилить всегда можно позже.",
      },
    },
    correction: {
      DE: {
        info: "Wenn Ihr PMU verblasst ist oder Sie eine andere Form wünschen — eine Auffrischung/Korrektur ist jederzeit möglich 🌿\nPreise: 2 Monate: 120€ | 12–24M: 175€ | 24M+: 230€ | Klein: 39€",
      },
      EN: {
        info: "If your PMU has faded or you'd like a different shape — a refresh/correction is always possible 🌿\nPrices: 2 months: €120 | 12–24M: €175 | 24M+: €230 | Small: €39",
      },
      RU: {
        info: "Если перманент побледнел или хотите скорректировать форму — обновление/коррекция всегда возможна 🌿\nЦены: до 2 мес: 120€ | 12–24 мес: 175€ | 24+ мес: 230€ | Маленькая: 39€",
      },
    },
  },
} as const;

export type AssistantLocale = 'de' | 'en' | 'ru';

function normalizeLocale(locale?: string): AssistantLocale {
  if (!locale) return 'de';
  const value = locale.toLowerCase();
  if (value === 'ru') return 'ru';
  if (value === 'en') return 'en';
  return 'de';
}

export function localeToLang(locale?: string): Lang {
  const normalized = normalizeLocale(locale);
  if (normalized === 'ru') return 'RU';
  if (normalized === 'en') return 'EN';
  return 'DE';
}

function formatEuro(value: number): string {
  return `${value} €`;
}

export function getKnowledgeMenuOptions(locale?: string): string[] {
  const lang = localeToLang(locale);
  return [...PERMANENT_HALLE.ui.menu[lang].items];
}

export function buildKnowledgeConsultationStartText(locale?: string): string {
  const lang = localeToLang(locale);
  const intro = PERMANENT_HALLE.pmu.consultation_start[lang];

  if (lang === 'RU') {
    return `${intro}\n\n[option] 💄 PMU: брови, губы, межресничка [/option]\n[option] ✨ Брови и ресницы: лифтинг/стайлинг [/option]\n[option] 💧 Hydrafacial: подбор формата [/option]\n[option] 📅 Подобрать время и записаться [/option]`;
  }
  if (lang === 'EN') {
    return `${intro}\n\n[option] 💄 PMU: brows, lips, lash line [/option]\n[option] ✨ Brows & lashes: lifting/styling [/option]\n[option] 💧 Hydrafacial: choose format [/option]\n[option] 📅 Pick time and book [/option]`;
  }
  return `${intro}\n\n[option] 💄 PMU: Augenbrauen, Lippen, Wimpernkranz [/option]\n[option] ✨ Brows & Lashes: Lifting/Styling [/option]\n[option] 💧 Hydrafacial: passendes Paket [/option]\n[option] 📅 Zeit finden und buchen [/option]`;
}

export function isKnowledgeLocationHoursIntent(
  text: string,
  locale?: string,
): boolean {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return false;

  const normalized = normalizeLocale(locale);
  if (normalized === 'ru') {
    return (
      value.includes('адрес') ||
      value.includes('часы работы') ||
      value.includes('где вы находитесь') ||
      value.includes('как добраться') ||
      value.includes('адрес и часы работы')
    );
  }

  if (normalized === 'en') {
    return (
      value.includes('address') ||
      value.includes('location') ||
      value.includes('opening hours') ||
      value.includes('working hours') ||
      value.includes('location and hours')
    );
  }

  return (
    value.includes('adresse') ||
    value.includes('öffnungszeiten') ||
    value.includes('oeffnungszeiten') ||
    value.includes('standort')
  );
}

export function buildKnowledgeLocationHoursText(locale?: string): string {
  const lang = localeToLang(locale);

  if (lang === 'RU') {
    return `Наш салон **Permanent Halle** находится по адресу:
**Lessingstraße 37, 06114 Halle (Saale), Deutschland**.

Часы работы:
• Пн–Пт: **10:00–19:00**
• Сб: **10:00–16:00**
• Вс: **выходной**

[option] ↩️ Назад в главное меню [/option]
[option] 📅 Записаться [/option]`;
  }

  if (lang === 'EN') {
    return `Our salon **Permanent Halle** is located at:
**Lessingstraße 37, 06114 Halle (Saale), Germany**.

Opening hours:
• Mon–Fri: **10:00–19:00**
• Sat: **10:00–16:00**
• Sun: **closed**

[option] ↩️ Back to main menu [/option]
[option] 📅 Book appointment [/option]`;
  }

  return `Unser Salon **Permanent Halle** befindet sich hier:
**Lessingstraße 37, 06114 Halle (Saale), Deutschland**.

Öffnungszeiten:
• Mo–Fr: **10:00–19:00**
• Sa: **10:00–16:00**
• So: **geschlossen**

[option] ↩️ Zum Hauptmenü [/option]
[option] 📅 Termin buchen [/option]`;
}

export function isConsultationIntentByKnowledge(
  text: string,
  locale?: string,
): boolean {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return false;
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    const phrases = [
      'консультац',
      'консультация',
      'консультацию',
      'консультация и подбор',
      'подбор процедуры',
      'подбор услуги',
      'что подойдет',
      'что подойдёт',
      'что выбрать',
      'совет по процедуре',
      'pmu',
    ];
    return phrases.some((p) => value.includes(p));
  }

  if (normalized === 'en') {
    const phrases = [
      'consultation',
      'consult',
      'consultation and guidance',
      'help choose',
      'what suits me',
      'recommend treatment',
      'pmu consultation',
      'pmu',
    ];
    return phrases.some((p) => value.includes(p));
  }

  const phrases = [
    'beratung',
    'beratung und auswahl',
    'konsultation',
    'hilfe bei auswahl',
    'was passt zu mir',
    'empfehlung',
    'pmu beratung',
    'pmu',
  ];
  return phrases.some((p) => value.includes(p));
}

export function buildKnowledgeSystemMessage(locale?: string): string {
  const lang = localeToLang(locale);
  const boundary = PERMANENT_HALLE.policies.medicalBoundary[lang];
  const antiHallucination = PERMANENT_HALLE.policies.antiHallucination[lang];

  const powder = formatEuro(PERMANENT_HALLE.prices.pmu.brows.powder);
  const hairstroke = formatEuro(PERMANENT_HALLE.prices.pmu.brows.hairstroke);
  const aquarell = formatEuro(PERMANENT_HALLE.prices.pmu.lips.aquarell);
  const lips3d = formatEuro(PERMANENT_HALLE.prices.pmu.lips.lips3d);
  const lashline = formatEuro(PERMANENT_HALLE.prices.pmu.lashline.lashline);
  const upperLower = formatEuro(PERMANENT_HALLE.prices.pmu.lashline.upper_lower);
  const lashLift = formatEuro(PERMANENT_HALLE.prices.browsLashes.lash_lift);
  const browLift = formatEuro(PERMANENT_HALLE.prices.browsLashes.brow_lift);
  const hydraSignature = formatEuro(PERMANENT_HALLE.prices.hydrafacial.signature);
  const hydraDeluxe = formatEuro(PERMANENT_HALLE.prices.hydrafacial.deluxe);
  const hydraPlatinum = formatEuro(PERMANENT_HALLE.prices.hydrafacial.platinum);

  return [
    'KNOWLEDGE SOURCE: PERMANENT_HALLE',
    `Salon: ${PERMANENT_HALLE.salon.name}, Master: ${PERMANENT_HALLE.salon.master}, City: ${PERMANENT_HALLE.salon.city}`,
    'Use this knowledge for consultation answers and price anchoring. Prefer tools for final availability/booking.',
    `Medical boundary: ${boundary}`,
    `Anti-hallucination: ${antiHallucination}`,
    'Main PMU prices:',
    `- Powder Brows: ${powder}`,
    `- Hairstroke Brows: ${hairstroke}`,
    `- Aquarell Lips: ${aquarell}`,
    `- 3D Lips: ${lips3d}`,
    `- Lash line: ${lashline}, upper+lower: ${upperLower}`,
    'Brows & lashes:',
    `- Lash lift: ${lashLift}, Brow lift: ${browLift}`,
    'Hydrafacial:',
    `- Signature: ${hydraSignature}, Deluxe: ${hydraDeluxe}, Platinum: ${hydraPlatinum}`,
    'Upsell policy:',
    `- ${PERMANENT_HALLE.policies.upsellRules.join(' | ')}`,
  ].join('\n');
}

export type KnowledgeConsultationTopic = 'pmu' | 'brows_lashes' | 'hydrafacial';
export type KnowledgeConsultationStyle = 'natural' | 'expressive' | 'budget';
export type KnowledgePmuTechnique =
  | 'powder_brows'
  | 'hairstroke_brows'
  | 'aquarell_lips'
  | 'lips_3d'
  | 'lashline'
  | 'upper_lower';
export type KnowledgeHydrafacialGoal = 'signature' | 'deluxe' | 'platinum';

export function detectKnowledgeConsultationTopic(
  text: string,
  locale?: string,
): KnowledgeConsultationTopic | null {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return null;

  if (value.includes('hydra') || value.includes('hydrafacial')) {
    return 'hydrafacial';
  }

  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    if (
      value.includes('pmu') ||
      value.includes('перманент') ||
      value.includes('межреснич')
    ) {
      return 'pmu';
    }
    if (
      value.includes('бров') ||
      value.includes('ресниц') ||
      value.includes('лифтинг') ||
      value.includes('стайлинг')
    ) {
      return 'brows_lashes';
    }
    return null;
  }

  if (normalized === 'en') {
    if (
      value.includes('pmu') ||
      value.includes('permanent') ||
      value.includes('lash line') ||
      value.includes('lashline')
    ) {
      return 'pmu';
    }
    if (
      value.includes('brow') ||
      value.includes('lash') ||
      value.includes('lifting') ||
      value.includes('styling')
    ) {
      return 'brows_lashes';
    }
    return null;
  }

  if (
    value.includes('pmu') ||
    value.includes('permanent') ||
    value.includes('wimpernkranz')
  ) {
    return 'pmu';
  }
  if (
    value.includes('augenbrau') ||
    value.includes('wimper') ||
    value.includes('lifting') ||
    value.includes('styling')
  ) {
    return 'brows_lashes';
  }
  return null;
}

export function buildKnowledgeConsultationTopicText(
  locale: AssistantLocale | undefined,
  topic: KnowledgeConsultationTopic,
): string {
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    if (topic === 'pmu') {
      return 'Отлично, давайте спокойно подберём PMU 🌸 Что интересует больше всего?\n\n[option] Брови — форма и мягкий эффект [/option]\n[option] Губы — свежий оттенок [/option]\n[option] Межресничка — выразительный взгляд [/option]\n[option] ❓ Сначала короткая консультация по заживлению [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    if (topic === 'brows_lashes') {
      return 'Супер, подберём брови/ресницы под ваш запрос 🌸 Какой результат хотите получить?\n\n[option] Максимально натурально [/option]\n[option] Чуть ярче и выразительнее [/option]\n[option] Подобрать вариант по бюджету [/option]\n[option] ❓ Сравнить лифтинг и стайлинг [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    return 'Отличный выбор 🌿 По Hydrafacial подскажу формат под задачу кожи. Что сейчас важнее?\n\n[option] Глубокое очищение и свежесть [/option]\n[option] Больше сияния и ровный тон [/option]\n[option] Максимальный премиум-уход [/option]\n[option] ❓ Чем отличается Signature/Deluxe/Platinum [/option]\n[option] 📅 Подобрать время и записаться [/option]';
  }

  if (normalized === 'en') {
    if (topic === 'pmu') {
      return "Great, let's choose the right PMU option 🌸 What are you most interested in?\n\n[option] Brows — shape and soft definition [/option]\n[option] Lips — fresh color [/option]\n[option] Lash line — expressive look [/option]\n[option] ❓ Quick healing and aftercare consultation [/option]\n[option] 📅 Pick time and book [/option]";
    }
    if (topic === 'brows_lashes') {
      return "Perfect, let's tailor brows/lashes to your goal 🌸 What result do you want?\n\n[option] Very natural look [/option]\n[option] More defined expression [/option]\n[option] Best option by budget [/option]\n[option] ❓ Compare lifting vs styling [/option]\n[option] 📅 Pick time and book [/option]";
    }
    return "Great choice 🌿 I can help choose the right Hydrafacial format. What's your main goal now?\n\n[option] Deep cleanse and freshness [/option]\n[option] More glow and even tone [/option]\n[option] Maximum premium care [/option]\n[option] ❓ Signature vs Deluxe vs Platinum [/option]\n[option] 📅 Pick time and book [/option]";
  }

  if (topic === 'pmu') {
    return 'Sehr gern, wir wählen PMU in Ruhe aus 🌸 Was interessiert Sie am meisten?\n\n[option] Augenbrauen — Form und weicher Effekt [/option]\n[option] Lippen — frischer Farbton [/option]\n[option] Wimpernkranz — ausdrucksvoller Blick [/option]\n[option] ❓ Kurze Beratung zu Heilung und Pflege [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  if (topic === 'brows_lashes') {
    return 'Super, wir wählen Brows/Lashes passend zu Ihrem Wunsch 🌸 Welches Ergebnis möchten Sie?\n\n[option] Sehr natürlich [/option]\n[option] Etwas definierter [/option]\n[option] Passend zum Budget [/option]\n[option] ❓ Lifting vs Styling vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  return 'Sehr gute Wahl 🌿 Für Hydrafacial finde ich das passende Paket. Was ist aktuell wichtiger?\n\n[option] Tiefenreinigung und Frische [/option]\n[option] Mehr Glow und ebenmäßiger Teint [/option]\n[option] Maximaler Premium-Effekt [/option]\n[option] ❓ Unterschied Signature/Deluxe/Platinum [/option]\n[option] 📅 Zeit finden und buchen [/option]';
}

export function detectKnowledgeHydrafacialGoal(
  text: string,
  locale?: string,
): KnowledgeHydrafacialGoal | null {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return null;

  // Keep concrete priced options for catalog-selection fastpath.
  if (/[—–-].*\d{1,4}(?:[.,]\d{1,2})?\s*€/.test(value)) return null;

  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    if (
      value.includes('глубокое очищение и свежесть') ||
      (value.includes('глубок') && value.includes('очищ')) ||
      (value.includes('очищ') && value.includes('свеж'))
    ) {
      return 'signature';
    }
    if (
      value.includes('больше сияния и ровный тон') ||
      value.includes('ровный тон') ||
      value.includes('сияни')
    ) {
      return 'deluxe';
    }
    if (
      value.includes('максимальный премиум-уход') ||
      (value.includes('премиум') && value.includes('уход')) ||
      value.includes('максимальный уход')
    ) {
      return 'platinum';
    }
    return null;
  }

  if (normalized === 'en') {
    if (
      value.includes('deep cleanse and freshness') ||
      (value.includes('deep') && value.includes('cleanse'))
    ) {
      return 'signature';
    }
    if (
      value.includes('more glow and even tone') ||
      value.includes('even tone') ||
      value.includes('more glow')
    ) {
      return 'deluxe';
    }
    if (
      value.includes('maximum premium care') ||
      value.includes('premium care') ||
      value.includes('maximum glow')
    ) {
      return 'platinum';
    }
    return null;
  }

  if (
    value.includes('tiefenreinigung und frische') ||
    (value.includes('tiefenreinigung') && value.includes('frische'))
  ) {
    return 'signature';
  }
  if (
    value.includes('mehr glow und ebenmaßiger teint') ||
    value.includes('mehr glow und ebenmassiger teint') ||
    value.includes('ebenmassiger teint') ||
    value.includes('ebenmaßiger teint')
  ) {
    return 'deluxe';
  }
  if (
    value.includes('maximaler premium-effekt') ||
    value.includes('maximaler premium effekt') ||
    (value.includes('premium') && value.includes('effekt'))
  ) {
    return 'platinum';
  }
  return null;
}

export function buildKnowledgeHydrafacialGoalText(
  locale: AssistantLocale | undefined,
  goal: KnowledgeHydrafacialGoal,
): string {
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    if (goal === 'signature') {
      return 'Отличный выбор 🌿 Для цели «очищение и свежесть» чаще всего подходит **Signature Hydrafacial**.\nЭто базовый и очень комфортный формат: глубокое очищение, мягкая экстракция и увлажнение.\n\n[option] 💧 Signature Hydrafacial — 140 € [/option]\n[option] ✨ Deluxe Hydrafacial — 180 € [/option]\n[option] 👑 Platinum Hydrafacial — 270 € [/option]\n[option] ❓ Чем отличается Signature/Deluxe/Platinum [/option]\n[option] ❓ Подробнее о форматах [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    if (goal === 'deluxe') {
      return 'Отлично 🌸 Для задачи «сияние и ровный тон» обычно выбирают **Deluxe Hydrafacial**.\nОн включает всё из Signature + усиленный пилинг и LED-терапию для более заметного glow-эффекта.\n\n[option] ✨ Deluxe Hydrafacial — 180 € [/option]\n[option] 💧 Signature Hydrafacial — 140 € [/option]\n[option] 👑 Platinum Hydrafacial — 270 € [/option]\n[option] ❓ Чем отличается Signature/Deluxe/Platinum [/option]\n[option] ❓ Подробнее о форматах [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    return 'Супер выбор ✨ Если нужен максимально выраженный результат, лучше всего подходит **Platinum Hydrafacial**.\nЭто самый полный формат: всё из Deluxe + лимфодренаж и премиум-сыворотки.\n\n[option] 👑 Platinum Hydrafacial — 270 € [/option]\n[option] ✨ Deluxe Hydrafacial — 180 € [/option]\n[option] 💧 Signature Hydrafacial — 140 € [/option]\n[option] ❓ Чем отличается Signature/Deluxe/Platinum [/option]\n[option] ❓ Подробнее о форматах [/option]\n[option] 📅 Подобрать время и записаться [/option]';
  }

  if (normalized === 'en') {
    if (goal === 'signature') {
      return 'Great choice 🌿 For a “clean and fresh” goal, **Signature Hydrafacial** is usually the best fit.\nIt is the core format: deep cleanse, gentle extraction, and hydration.\n\n[option] 💧 Signature Hydrafacial — €140 [/option]\n[option] ✨ Deluxe Hydrafacial — €180 [/option]\n[option] 👑 Platinum Hydrafacial — €270 [/option]\n[option] ❓ Signature vs Deluxe vs Platinum [/option]\n[option] ❓ More details about formats [/option]\n[option] 📅 Pick time and book [/option]';
    }
    if (goal === 'deluxe') {
      return 'Perfect 🌸 For “more glow and even tone,” clients usually choose **Deluxe Hydrafacial**.\nIt includes everything in Signature, plus stronger peel and LED therapy for a brighter result.\n\n[option] ✨ Deluxe Hydrafacial — €180 [/option]\n[option] 💧 Signature Hydrafacial — €140 [/option]\n[option] 👑 Platinum Hydrafacial — €270 [/option]\n[option] ❓ Signature vs Deluxe vs Platinum [/option]\n[option] ❓ More details about formats [/option]\n[option] 📅 Pick time and book [/option]';
    }
    return 'Excellent choice ✨ If you want maximum visible effect, **Platinum Hydrafacial** is the strongest option.\nIt includes everything in Deluxe, plus lymphatic drainage and premium serums.\n\n[option] 👑 Platinum Hydrafacial — €270 [/option]\n[option] ✨ Deluxe Hydrafacial — €180 [/option]\n[option] 💧 Signature Hydrafacial — €140 [/option]\n[option] ❓ Signature vs Deluxe vs Platinum [/option]\n[option] ❓ More details about formats [/option]\n[option] 📅 Pick time and book [/option]';
  }

  if (goal === 'signature') {
    return 'Sehr gute Wahl 🌿 Für „Tiefenreinigung und Frische“ passt meist **Signature Hydrafacial** am besten.\nDas ist das Basisformat: gründliche Reinigung, sanfte Extraktion und Feuchtigkeit.\n\n[option] 💧 Signature Hydrafacial — 140 € [/option]\n[option] ✨ Deluxe Hydrafacial — 180 € [/option]\n[option] 👑 Platinum Hydrafacial — 270 € [/option]\n[option] ❓ Unterschied Signature/Deluxe/Platinum [/option]\n[option] ❓ Mehr Details zu den Formaten [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  if (goal === 'deluxe') {
    return 'Perfekt 🌸 Für „mehr Glow und ebenmäßigen Teint“ wird meist **Deluxe Hydrafacial** gewählt.\nEs enthält alles aus Signature plus intensiveres Peeling und LED-Therapie.\n\n[option] ✨ Deluxe Hydrafacial — 180 € [/option]\n[option] 💧 Signature Hydrafacial — 140 € [/option]\n[option] 👑 Platinum Hydrafacial — 270 € [/option]\n[option] ❓ Unterschied Signature/Deluxe/Platinum [/option]\n[option] ❓ Mehr Details zu den Formaten [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  return 'Top Wahl ✨ Für den maximalen Effekt ist **Platinum Hydrafacial** am stärksten.\nDas ist das umfassendste Format: alles aus Deluxe plus Lymphdrainage und Premium-Seren.\n\n[option] 👑 Platinum Hydrafacial — 270 € [/option]\n[option] ✨ Deluxe Hydrafacial — 180 € [/option]\n[option] 💧 Signature Hydrafacial — 140 € [/option]\n[option] ❓ Unterschied Signature/Deluxe/Platinum [/option]\n[option] ❓ Mehr Details zu den Formaten [/option]\n[option] 📅 Zeit finden und buchen [/option]';
}

export function isKnowledgePmuHealingIntent(
  text: string,
  locale?: string,
): boolean {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return false;
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    return (
      value.includes('короткая консультация по заживлению') ||
      value.includes('консультация по заживлению') ||
      value.includes('заживление') ||
      value.includes('заживлен') ||
      value.includes('побочн') ||
      value.includes('осложнен') ||
      value.includes('противопоказ') ||
      value.includes('реакци') ||
      value.includes('безопасно') ||
      value.includes('опасно')
    );
  }

  if (normalized === 'en') {
    return (
      value.includes('quick healing') ||
      value.includes('aftercare consultation') ||
      (value.includes('healing') && value.includes('consultation')) ||
      (value.includes('pmu') && value.includes('aftercare')) ||
      value.includes('side effect') ||
      value.includes('side-effects') ||
      value.includes('adverse effect') ||
      value.includes('contraindication') ||
      value.includes('risk') ||
      value.includes('is it safe')
    );
  }

  return (
    value.includes('kurze beratung zu heilung') ||
    value.includes('heilung und pflege') ||
    (value.includes('heilung') && value.includes('beratung')) ||
    value.includes('nebenwirkung') ||
    value.includes('kontraindikation') ||
    value.includes('risiko') ||
    value.includes('ist es sicher')
  );
}

export function buildKnowledgePmuHealingText(
  locale: AssistantLocale | undefined,
): string {
  const lang = localeToLang(locale);
  const healing = PERMANENT_HALLE.pmu.healing_1_30[lang];
  const rules = healing.rules.map((rule) => `• ${rule}`).join('\n');
  const sideEffects =
    lang === 'RU'
      ? 'Нормальные временные реакции после PMU: лёгкое покраснение/чувствительность и небольшая отёчность в первые дни. Если реакция выраженная или усиливается, лучше сразу написать мастеру.'
      : lang === 'EN'
        ? 'Common temporary PMU reactions: mild redness/sensitivity and slight swelling in the first days. If symptoms are strong or getting worse, contact your master right away.'
        : 'Normale, vorübergehende Reaktionen nach PMU: leichte Rötung/Empfindlichkeit und geringe Schwellung in den ersten Tagen. Wenn die Reaktion stark ist oder zunimmt, bitte sofort der Meisterin schreiben.';

  if (lang === 'RU') {
    return `Коротко по заживлению после PMU 🌸\n\n${healing.d1_3}\n${healing.d4_7}\n${healing.d7_14}\n${healing.d14_30}\n\n${rules}\n\n${sideEffects}\n\n${healing.reassurance}\n\n[option] Брови — форма и мягкий эффект [/option]\n[option] Губы — свежий оттенок [/option]\n[option] Межресничка — выразительный взгляд [/option]\n[option] 📅 Подобрать время и записаться [/option]`;
  }

  if (lang === 'EN') {
    return `Quick PMU healing guide 🌸\n\n${healing.d1_3}\n${healing.d4_7}\n${healing.d7_14}\n${healing.d14_30}\n\n${rules}\n\n${sideEffects}\n\n${healing.reassurance}\n\n[option] Brows — shape and soft definition [/option]\n[option] Lips — fresh color [/option]\n[option] Lash line — expressive look [/option]\n[option] 📅 Pick time and book [/option]`;
  }

  return `Kurzer PMU-Heilungsverlauf 🌸\n\n${healing.d1_3}\n${healing.d4_7}\n${healing.d7_14}\n${healing.d14_30}\n\n${rules}\n\n${sideEffects}\n\n${healing.reassurance}\n\n[option] Augenbrauen — Form und weicher Effekt [/option]\n[option] Lippen — frischer Farbton [/option]\n[option] Wimpernkranz — ausdrucksvoller Blick [/option]\n[option] 📅 Zeit finden und buchen [/option]`;
}

export function detectKnowledgeConsultationStyle(
  text: string,
  locale?: string,
): KnowledgeConsultationStyle | null {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return null;
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    if (value.includes('натурал') || value.includes('мягк') || value.includes('деликат')) {
      return 'natural';
    }
    if (value.includes('ярч') || value.includes('выразит') || value.includes('насыщ')) {
      return 'expressive';
    }
    if (value.includes('бюджет') || value.includes('дешев') || value.includes('цена')) {
      return 'budget';
    }
    return null;
  }

  if (normalized === 'en') {
    if (value.includes('natural') || value.includes('soft') || value.includes('subtle')) {
      return 'natural';
    }
    if (value.includes('expressive') || value.includes('defined') || value.includes('brighter')) {
      return 'expressive';
    }
    if (value.includes('budget') || value.includes('cheaper') || value.includes('price')) {
      return 'budget';
    }
    return null;
  }

  if (value.includes('naturl') || value.includes('weich') || value.includes('dezent')) {
    return 'natural';
  }
  if (value.includes('ausdruck') || value.includes('definiert') || value.includes('intensiv')) {
    return 'expressive';
  }
  if (value.includes('budget') || value.includes('günstig') || value.includes('preis')) {
    return 'budget';
  }
  return null;
}

export function buildKnowledgeConsultationStyleText(
  locale: AssistantLocale | undefined,
  style: KnowledgeConsultationStyle,
): string {
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    if (style === 'natural') {
      return 'Для максимально натурального результата чаще выбирают **Пудровые брови (Powder Brows)** 🌸\n\n[option] 💖 Пудровые брови (Powder Brows) — мягкий эффект, 350 € [/option]\n[option] 🌟 Волосковая техника (Hairstroke Brows) — более детализированный, 450 € [/option]\n[option] ✅ Записаться на Пудровые брови [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    if (style === 'expressive') {
      return 'Для более яркого и выразительного результата подойдут эти варианты 🌸\n\n[option] 💖 Пудровые брови (Powder Brows) — мягкий эффект, 350 € [/option]\n[option] 🌟 Волосковая техника (Hairstroke Brows) — более детализированный, 450 € [/option]\n[option] ✅ Записаться на Волосковую технику [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    return 'Если ориентироваться на бюджет, оптимальный старт — **Пудровые брови (350 €)** 🌿\n\n[option] 💖 Пудровые брови (Powder Brows) — мягкий эффект, 350 € [/option]\n[option] 🌟 Волосковая техника (Hairstroke Brows) — более детализированный, 450 € [/option]\n[option] ✅ Записаться на Пудровые брови [/option]\n[option] 📅 Подобрать время и записаться [/option]';
  }

  if (normalized === 'en') {
    if (style === 'natural') {
      return 'For a very natural look, clients often choose **Powder Brows** 🌸\n\n[option] 💖 Powder Brows — soft effect, €350 [/option]\n[option] 🌟 Hairstroke Brows — more detailed, €450 [/option]\n[option] ✅ Book Powder Brows [/option]\n[option] 📅 Pick time and book [/option]';
    }
    if (style === 'expressive') {
      return 'For a brighter and more defined result, these two options fit best 🌸\n\n[option] 💖 Powder Brows — soft effect, €350 [/option]\n[option] 🌟 Hairstroke Brows — more detailed, €450 [/option]\n[option] ✅ Book Hairstroke Brows [/option]\n[option] 📅 Pick time and book [/option]';
    }
    return 'If budget is key, **Powder Brows €350** is usually the best start 🌿\n\n[option] 💖 Powder Brows — soft effect, €350 [/option]\n[option] 🌟 Hairstroke Brows — more detailed, €450 [/option]\n[option] ✅ Book Powder Brows [/option]\n[option] 📅 Pick time and book [/option]';
  }

  if (style === 'natural') {
    return 'Für ein sehr natürliches Ergebnis wird meist **Powder Brows** gewählt 🌸\n\n[option] 💖 Powder Brows — weicher Effekt, 350 € [/option]\n[option] 🌟 Hairstroke Brows — detaillierter, 450 € [/option]\n[option] ✅ Powder Brows buchen [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  if (style === 'expressive') {
    return 'Für ein ausdrucksstärkeres Ergebnis passen diese zwei Optionen am besten 🌸\n\n[option] 💖 Powder Brows — weicher Effekt, 350 € [/option]\n[option] 🌟 Hairstroke Brows — detaillierter, 450 € [/option]\n[option] ✅ Hairstroke Brows buchen [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  return 'Wenn Budget wichtig ist, ist **Powder Brows 350 €** oft der beste Einstieg 🌿\n\n[option] 💖 Powder Brows — weicher Effekt, 350 € [/option]\n[option] 🌟 Hairstroke Brows — detaillierter, 450 € [/option]\n[option] ✅ Powder Brows buchen [/option]\n[option] 📅 Zeit finden und buchen [/option]';
}

export function buildKnowledgeBrowsLashesStyleText(
  locale: AssistantLocale | undefined,
  style: KnowledgeConsultationStyle,
): string {
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    if (style === 'natural') {
      return 'Для максимально натурального эффекта в Brows/Lashes чаще выбирают мягкие варианты 🌸\n\n[option] ✨ Лифтинг ресниц — 55 € [/option]\n[option] 🌸 Подтяжка бровей — 50 € [/option]\n[option] 💫 Комбо — лифтинг ресниц + классическая коррекция бровей — 75 € [/option]\n[option] ✅ Записаться на Подтяжка бровей [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    if (style === 'expressive') {
      return 'Для более яркого результата в Brows/Lashes подойдут эти варианты 🌸\n\n[option] 🌸 Гибридные брови — 60 € [/option]\n[option] 💫 Комбо — лифтинг ресниц + гибридные брови — 120 € [/option]\n[option] ✨ Лифтинг ресниц — 55 € [/option]\n[option] ✅ Записаться на Гибридные брови [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    return 'Если ориентироваться на бюджет, в Brows/Lashes чаще выбирают базовые форматы 🌿\n\n[option] 🌸 Подтяжка бровей — 50 € [/option]\n[option] ✨ Лифтинг ресниц — 55 € [/option]\n[option] 💫 Комбо — лифтинг ресниц + классическая коррекция бровей — 75 € [/option]\n[option] ✅ Записаться на Подтяжка бровей [/option]\n[option] 📅 Подобрать время и записаться [/option]';
  }

  if (normalized === 'en') {
    if (style === 'natural') {
      return 'For a very natural brows/lashes result, clients usually choose these options 🌸\n\n[option] ✨ Lash Lift — €55 [/option]\n[option] 🌸 Brow Lift — €50 [/option]\n[option] 💫 Combo — Lash Lift + Brow Classic — €75 [/option]\n[option] ✅ Book Brow Lift [/option]\n[option] 📅 Pick time and book [/option]';
    }
    if (style === 'expressive') {
      return 'For a more expressive brows/lashes effect, these options fit best 🌸\n\n[option] 🌸 Hybrid Brows — €60 [/option]\n[option] 💫 Combo — Lash Lift + Hybrid Brows — €120 [/option]\n[option] ✨ Lash Lift — €55 [/option]\n[option] ✅ Book Hybrid Brows [/option]\n[option] 📅 Pick time and book [/option]';
    }
    return 'If budget is key, these brows/lashes formats are usually the best start 🌿\n\n[option] 🌸 Brow Lift — €50 [/option]\n[option] ✨ Lash Lift — €55 [/option]\n[option] 💫 Combo — Lash Lift + Brow Classic — €75 [/option]\n[option] ✅ Book Brow Lift [/option]\n[option] 📅 Pick time and book [/option]';
  }

  if (style === 'natural') {
    return 'Für ein sehr natürliches Brows/Lashes-Ergebnis werden meist diese Optionen gewählt 🌸\n\n[option] ✨ Lash Lift — 55 € [/option]\n[option] 🌸 Brow Lift — 50 € [/option]\n[option] 💫 Kombi — Lash Lift + Brow Classic — 75 € [/option]\n[option] ✅ Brow Lift buchen [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  if (style === 'expressive') {
    return 'Für ein ausdrucksstärkeres Brows/Lashes-Ergebnis passen diese Optionen am besten 🌸\n\n[option] 🌸 Hybrid Brows — 60 € [/option]\n[option] 💫 Kombi — Lash Lift + Hybrid Brows — 120 € [/option]\n[option] ✨ Lash Lift — 55 € [/option]\n[option] ✅ Hybrid Brows buchen [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  return 'Wenn Budget wichtig ist, sind diese Brows/Lashes-Formate meist der beste Einstieg 🌿\n\n[option] 🌸 Brow Lift — 50 € [/option]\n[option] ✨ Lash Lift — 55 € [/option]\n[option] 💫 Kombi — Lash Lift + Brow Classic — 75 € [/option]\n[option] ✅ Brow Lift buchen [/option]\n[option] 📅 Zeit finden und buchen [/option]';
}

export function isKnowledgePmuLipsChoiceIntent(
  text: string,
  locale?: string,
): boolean {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return false;
  const normalized = normalizeLocale(locale);

  // If user already picked concrete lip technique, do not treat as generic lips-choice.
  if (
    value.includes('aquarell') ||
    value.includes('акварел') ||
    value.includes('3d lips') ||
    value.includes('3d губ') ||
    value.includes('3д губ')
  ) {
    return false;
  }

  if (normalized === 'ru') {
    return (
      value.includes('губы — свежий оттенок') ||
      value.includes('губы - свежий оттенок') ||
      value === 'губы' ||
      (value.includes('губ') && value.includes('оттен'))
    );
  }

  if (normalized === 'en') {
    return (
      value.includes('lips — fresh color') ||
      value.includes('lips - fresh color') ||
      value === 'lips' ||
      (value.includes('lip') && value.includes('fresh'))
    );
  }

  return (
    value.includes('lippen — frischer farbton') ||
    value.includes('lippen - frischer farbton') ||
    value === 'lippen' ||
    (value.includes('lipp') && value.includes('frisch'))
  );
}

export function buildKnowledgePmuLipsChoiceText(
  locale: AssistantLocale | undefined,
): string {
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    return 'Для губ чаще выбирают один из этих вариантов 🌸\n\n[option] 💄 Акварельные губы (Aquarell Lips) — свежий оттенок, 380 € [/option]\n[option] 💋 3D губы (3D Lips) — объёмный эффект, 420 € [/option]\n[option] 📅 Подобрать время и записаться [/option]';
  }
  if (normalized === 'en') {
    return 'For lips, clients usually choose one of these options 🌸\n\n[option] 💄 Aquarelle Lips — fresh color, €380 [/option]\n[option] 💋 3D Lips — fuller effect, €420 [/option]\n[option] 📅 Pick time and book [/option]';
  }
  return 'Für Lippen wählen Kundinnen meist eine dieser Optionen 🌸\n\n[option] 💄 Aquarell Lips — frischer Farbton, 380 € [/option]\n[option] 💋 3D Lips — vollerer Effekt, 420 € [/option]\n[option] 📅 Zeit finden und buchen [/option]';
}

export function detectKnowledgePmuTechnique(
  text: string,
  locale?: string,
): KnowledgePmuTechnique | null {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return null;
  const normalized = normalizeLocale(locale);

  const mentionsBrows =
    value.includes('бров') || value.includes('brow') || value.includes('augenbrau');
  const mentionsLips =
    value.includes('губ') || value.includes('lip') || value.includes('lipp');
  const mentionsLashline =
    value.includes('межреснич') || value.includes('lash line') || value.includes('lashline') || value.includes('wimpernkranz');
  const mentionedAreas = [mentionsBrows, mentionsLips, mentionsLashline].filter(Boolean).length;
  const looksLikeTopLevelPmuChoice =
    value.includes('pmu:') ||
    value.includes('pmu :') ||
    value.includes('брови, губы') ||
    value.includes('brows, lips') ||
    value.includes('augenbrauen, lippen');

  // Do not collapse high-level PMU topic choice into a specific technique.
  if (looksLikeTopLevelPmuChoice || mentionedAreas >= 2) return null;

  if (value.includes('powder') || value.includes('пудров')) return 'powder_brows';
  if (value.includes('hairstroke') || value.includes('волосков')) return 'hairstroke_brows';
  if (value.includes('aquarell') || value.includes('акварел')) return 'aquarell_lips';
  if (value.includes('3d lips') || value.includes('3d губ')) return 'lips_3d';

  if (normalized === 'ru') {
    if (
      value.includes('верх+низ') ||
      value.includes('верх + низ') ||
      (value.includes('верх') && value.includes('низ') && (value.includes('межреснич') || value.includes('реснич')))
    ) {
      return 'upper_lower';
    }
    if (value.includes('межреснич')) return 'lashline';
    return null;
  }
  if (normalized === 'en') {
    if (
      value.includes('upper+lower') ||
      value.includes('upper + lower') ||
      (value.includes('upper') && value.includes('lower') && (value.includes('lash') || value.includes('line')))
    ) {
      return 'upper_lower';
    }
    if (value.includes('lash line') || value.includes('lashline')) return 'lashline';
    return null;
  }
  if (
    value.includes('oben+unten') ||
    value.includes('oben + unten') ||
    (value.includes('oben') && value.includes('unten') && value.includes('wimpernkranz'))
  ) {
    return 'upper_lower';
  }
  if (value.includes('wimpernkranz')) return 'lashline';
  return null;
}

export function buildKnowledgePmuTechniqueText(
  locale: AssistantLocale | undefined,
  technique: KnowledgePmuTechnique,
): string {
  const normalized = normalizeLocale(locale);

  const ru: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Пудровые брови (Powder Brows) 🌸 Мягкий пудровый эффект, максимально натурально в повседневности. Цена: **350 €**.\n\n[option] 🌟 Сравнить с Волосковой техникой [/option]\n[option] ❓ Подробнее об услуге [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    hairstroke_brows:
      'Волосковая техника (Hairstroke Brows) 🌸 Более выраженная текстура, эффект «волосков». Цена: **450 €**.\n\n[option] 💖 Сравнить с Пудровыми бровями [/option]\n[option] ❓ Подробнее об услуге [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    aquarell_lips:
      'Акварельные губы (Aquarell Lips) 🌸 Мягкий ровный оттенок без жёсткого контура. Цена: **380 €**.\n\n[option] 💄 Сравнить с 3D губами [/option]\n[option] ❓ Подробнее об услуге [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    lips_3d:
      '3D губы (3D Lips) 🌸 Более насыщенный и объёмный эффект. Цена: **420 €**.\n\n[option] 💋 Сравнить с Акварельными губами [/option]\n[option] ❓ Подробнее об услуге [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    lashline:
      'Межресничка 🌸 Деликатно подчёркивает линию ресниц. Цена: **130 €**.\n\n[option] 👁 Вариант верх+низ (150 €) [/option]\n[option] ❓ Подробнее об услуге [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    upper_lower:
      'Межресничка верх+низ 🌸 Более выраженный результат. Цена: **150 €**.\n\n[option] 👁 Деликатный вариант только межресничка (130 €) [/option]\n[option] ❓ Подробнее об услуге [/option]\n[option] 📅 Подобрать время и записаться [/option]',
  };

  const en: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 Soft, natural powder effect. Price: **€350**.\n\n[option] 🌟 Compare with Hairstroke Brows [/option]\n[option] ❓ More details [/option]\n[option] 📅 Pick time and book [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 More visible hair texture. Price: **€450**.\n\n[option] 💖 Compare with Powder Brows [/option]\n[option] ❓ More details [/option]\n[option] 📅 Pick time and book [/option]',
    aquarell_lips:
      'Aquarelle Lips 🌸 Soft even color without a hard outline. Price: **€380**.\n\n[option] 💄 Compare with 3D Lips [/option]\n[option] ❓ More details [/option]\n[option] 📅 Pick time and book [/option]',
    lips_3d:
      '3D Lips 🌸 More intense, fuller effect. Price: **€420**.\n\n[option] 💋 Compare with Aquarelle Lips [/option]\n[option] ❓ More details [/option]\n[option] 📅 Pick time and book [/option]',
    lashline:
      'Lash line 🌸 Subtle enhancement of lash contour. Price: **€130**.\n\n[option] 👁 Upper + lower option (€150) [/option]\n[option] ❓ More details [/option]\n[option] 📅 Pick time and book [/option]',
    upper_lower:
      'Upper + lower lash line 🌸 More defined result. Price: **€150**.\n\n[option] 👁 Subtle lash line only (€130) [/option]\n[option] ❓ More details [/option]\n[option] 📅 Pick time and book [/option]',
  };

  const de: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 Weicher, natürlicher Puder-Effekt. Preis: **350 €**.\n\n[option] 🌟 Mit Hairstroke Brows vergleichen [/option]\n[option] ❓ Mehr Details [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 Sichtbarere Härchenstruktur. Preis: **450 €**.\n\n[option] 💖 Mit Powder Brows vergleichen [/option]\n[option] ❓ Mehr Details [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    aquarell_lips:
      'Aquarell Lips 🌸 Weicher, gleichmäßiger Ton ohne harte Kontur. Preis: **380 €**.\n\n[option] 💄 Mit 3D Lips vergleichen [/option]\n[option] ❓ Mehr Details [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    lips_3d:
      '3D Lips 🌸 Intensiverer, vollerer Effekt. Preis: **420 €**.\n\n[option] 💋 Mit Aquarell Lips vergleichen [/option]\n[option] ❓ Mehr Details [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    lashline:
      'Wimpernkranz 🌸 Dezente Betonung der Wimpernlinie. Preis: **130 €**.\n\n[option] 👁 Oben + unten (150 €) [/option]\n[option] ❓ Mehr Details [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    upper_lower:
      'Wimpernkranz oben + unten 🌸 Deutlich definierteres Ergebnis. Preis: **150 €**.\n\n[option] 👁 Nur Wimpernkranz (130 €) [/option]\n[option] ❓ Mehr Details [/option]\n[option] 📅 Zeit finden und buchen [/option]',
  };

  if (normalized === 'ru') return ru[technique];
  if (normalized === 'en') return en[technique];
  return de[technique];
}

export function isKnowledgeDetailsIntent(
  text: string,
  _locale?: string,
): boolean {
  const value = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!value) return false;

  return (
    value.includes('подроб') ||
    value.includes('расскажи') ||
    value.includes('детальн') ||
    value.includes('в деталях') ||
    value.includes('больше деталей') ||
    value.includes('more details') ||
    value.includes('tell me more') ||
    value.includes('details') ||
    value.includes('explain') ||
    value.includes('mehr info') ||
    value.includes('mehr details') ||
    value.includes('genauer') ||
    value.includes('erzahl')
  );
}

export function buildKnowledgePmuTechniqueDetailsText(
  locale: AssistantLocale | undefined,
  technique: KnowledgePmuTechnique,
): string {
  const normalized = normalizeLocale(locale);

  const ru: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Пудровые брови (Powder Brows) 🌸 Это мягкое пудровое напыление: брови выглядят оформленно, но без резких границ.\nПодходит, если хотите натуральный ежедневный эффект «уже с макияжем».\nЦена: **350 €**.\n\n[option] 🌟 Сравнить с Волосковой техникой [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    hairstroke_brows:
      'Волосковая техника (Hairstroke Brows) 🌸 Техника с более выраженной «волосковой» текстурой и чёткой прорисовкой.\nПодходит, если хотите более заметный и структурный результат.\nЦена: **450 €**.\n\n[option] 💖 Сравнить с Пудровыми бровями [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    aquarell_lips:
      'Акварельные губы (Aquarell Lips) 🌸 Даёт мягкий, свежий оттенок губ без жёсткого контура.\nИдеально, если нужен деликатный, естественный результат на каждый день.\nЦена: **380 €**.\n\n[option] 💋 Сравнить с 3D губами [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    lips_3d:
      '3D губы (3D Lips) 🌸 Более насыщенный цвет и визуально более объёмный эффект по сравнению с акварельной техникой.\nВыбирают, когда хочется ярче и выразительнее.\nЦена: **420 €**.\n\n[option] 💄 Сравнить с Акварельными губами [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    lashline:
      'Межресничка 🌸 Деликатное заполнение межресничного пространства: взгляд становится выразительнее, но без явной стрелки.\nЦена: **130 €**.\n\n[option] 👁 Вариант верх+низ (150 €) [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    upper_lower:
      'Межресничка верх+низ 🌸 Более заметный результат за счёт проработки обеих линий.\nХорошо, если хотите более выразительный эффект без ежедневной подводки.\nЦена: **150 €**.\n\n[option] 👁 Деликатный вариант только межресничка (130 €) [/option]\n[option] 📅 Подобрать время и записаться [/option]',
  };

  const en: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 A soft powder shading effect: brows look polished without harsh edges.\nBest if you want a natural everyday “wake up ready” look.\nPrice: **€350**.\n\n[option] 🌟 Compare with Hairstroke Brows [/option]\n[option] 📅 Pick time and book [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 A more defined hair-stroke texture with clearer structure.\nBest if you want a more noticeable and sculpted result.\nPrice: **€450**.\n\n[option] 💖 Compare with Powder Brows [/option]\n[option] 📅 Pick time and book [/option]',
    aquarell_lips:
      'Aquarelle Lips 🌸 Soft fresh lip tint without a hard contour line.\nGreat for a subtle, natural everyday result.\nPrice: **€380**.\n\n[option] 💋 Compare with 3D Lips [/option]\n[option] 📅 Pick time and book [/option]',
    lips_3d:
      '3D Lips 🌸 More saturated color with a fuller visual effect compared to Aquarelle Lips.\nBest if you want a brighter, more expressive finish.\nPrice: **€420**.\n\n[option] 💄 Compare with Aquarelle Lips [/option]\n[option] 📅 Pick time and book [/option]',
    lashline:
      'Lash line 🌸 A delicate fill between lashes for a more expressive look without a strong eyeliner effect.\nPrice: **€130**.\n\n[option] 👁 Upper + lower option (€150) [/option]\n[option] 📅 Pick time and book [/option]',
    upper_lower:
      'Upper + lower lash line 🌸 A stronger result by defining both lash lines.\nGreat if you want extra expression without daily eyeliner.\nPrice: **€150**.\n\n[option] 👁 Subtle lash line only (€130) [/option]\n[option] 📅 Pick time and book [/option]',
  };

  const de: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 Weicher Puder-Effekt ohne harte Kanten.\nIdeal, wenn Sie einen natürlichen Alltags-Look möchten.\nPreis: **350 €**.\n\n[option] 🌟 Mit Hairstroke Brows vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 Deutlichere Härchenstruktur mit definierter Form.\nIdeal für ein markanteres, strukturiertes Ergebnis.\nPreis: **450 €**.\n\n[option] 💖 Mit Powder Brows vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    aquarell_lips:
      'Aquarell Lips 🌸 Weicher, frischer Farbton ohne harte Kontur.\nIdeal für ein natürliches Ergebnis im Alltag.\nPreis: **380 €**.\n\n[option] 💋 Mit 3D Lips vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    lips_3d:
      '3D Lips 🌸 Sattere Farbe mit vollerem visuellen Effekt im Vergleich zu Aquarell Lips.\nIdeal, wenn Sie ein ausdrucksstärkeres Ergebnis möchten.\nPreis: **420 €**.\n\n[option] 💄 Mit Aquarell Lips vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    lashline:
      'Wimpernkranz 🌸 Dezente Auffüllung zwischen den Wimpern für mehr Ausdruck ohne harte Linie.\nPreis: **130 €**.\n\n[option] 👁 Oben + unten (150 €) [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    upper_lower:
      'Wimpernkranz oben + unten 🌸 Deutlicheres Ergebnis durch Betonung beider Linien.\nIdeal für mehr Ausdruck ohne tägliches Eyeliner-Make-up.\nPreis: **150 €**.\n\n[option] 👁 Nur Wimpernkranz (130 €) [/option]\n[option] 📅 Zeit finden und buchen [/option]',
  };

  if (normalized === 'ru') return ru[technique];
  if (normalized === 'en') return en[technique];
  return de[technique];
}

export function buildKnowledgePmuTechniqueSafetyText(
  locale: AssistantLocale | undefined,
  technique: KnowledgePmuTechnique,
): string {
  const normalized = normalizeLocale(locale);

  const ru: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 Что важно по реакции кожи:\n• в первые 1-3 дня возможны лёгкое покраснение и чувствительность;\n• цвет в начале выглядит ярче, затем становится мягче после заживления;\n• небольшое шелушение в первую неделю — нормально.\n\nЕсли реакция сильная или нарастает, лучше сразу написать мастеру.\n\n[option] ❓ Подробнее о заживлении PMU [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 Что важно по реакции кожи:\n• в первые 1-3 дня возможны лёгкое покраснение и чувствительность;\n• оттенок поначалу насыщеннее, затем стабилизируется;\n• небольшое шелушение в первую неделю — ожидаемо.\n\nЕсли реакция выраженная или усиливается, лучше сразу связаться с мастером.\n\n[option] ❓ Подробнее о заживлении PMU [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    aquarell_lips:
      'Акварельные губы 🌸 Что важно по реакции кожи:\n• в первые дни возможны отёчность и повышенная сухость губ;\n• оттенок сначала ярче, затем становится мягче после заживления;\n• важно аккуратное увлажнение и соблюдение рекомендаций мастера.\n\nЕсли отёк/дискомфорт выраженные или усиливаются, лучше сразу написать мастеру.\n\n[option] ❓ Подробнее о заживлении PMU [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    lips_3d:
      '3D губы 🌸 Что важно по реакции кожи:\n• в первые дни возможны отёчность и сухость губ;\n• цвет сначала кажется ярче, затем приходит к финальному тону;\n• в период заживления нужен щадящий режим и уход по рекомендациям мастера.\n\nЕсли реакция сильная или нарастает, лучше сразу связаться с мастером.\n\n[option] ❓ Подробнее о заживлении PMU [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    lashline:
      'Межресничка 🌸 Что важно по реакции:\n• в первые 1-2 дня возможны лёгкая чувствительность век и небольшая отёчность;\n• может быть кратковременное ощущение сухости/слезоточивости;\n• оттенок сначала чуть интенсивнее, затем смягчается.\n\nЕсли появляется выраженный дискомфорт или реакция усиливается, лучше сразу написать мастеру.\n\n[option] ❓ Подробнее о заживлении PMU [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    upper_lower:
      'Межресничка верх+низ 🌸 Что важно по реакции:\n• в первые 1-2 дня возможны чувствительность век и небольшая отёчность;\n• кратковременная сухость/слезоточивость допустимы;\n• оттенок в начале выглядит интенсивнее, затем становится мягче.\n\nЕсли реакция выраженная или усиливается, лучше сразу написать мастеру.\n\n[option] ❓ Подробнее о заживлении PMU [/option]\n[option] 📅 Подобрать время и записаться [/option]',
  };

  const en: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 Typical temporary reactions:\n• mild redness/sensitivity in the first 1-3 days;\n• color looks stronger at first, then softens during healing;\n• light flaking in the first week can happen.\n\nIf symptoms are strong or getting worse, contact your master right away.\n\n[option] ❓ More about PMU healing [/option]\n[option] 📅 Pick time and book [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 Typical temporary reactions:\n• mild redness/sensitivity in the first 1-3 days;\n• color appears stronger first, then settles;\n• light flaking in the first week is expected.\n\nIf symptoms become pronounced or worsen, contact your master right away.\n\n[option] ❓ More about PMU healing [/option]\n[option] 📅 Pick time and book [/option]',
    aquarell_lips:
      'Aquarelle Lips 🌸 Typical temporary reactions:\n• possible swelling and dryness in the first days;\n• color looks brighter first, then softens as it heals;\n• gentle aftercare and hydration are important.\n\nIf swelling/discomfort is strong or getting worse, contact your master right away.\n\n[option] ❓ More about PMU healing [/option]\n[option] 📅 Pick time and book [/option]',
    lips_3d:
      '3D Lips 🌸 Typical temporary reactions:\n• possible swelling and dryness in the first days;\n• color may look very intense first, then settle to final tone;\n• follow a gentle aftercare routine.\n\nIf symptoms are strong or getting worse, contact your master right away.\n\n[option] ❓ More about PMU healing [/option]\n[option] 📅 Pick time and book [/option]',
    lashline:
      'Lash line 🌸 Typical temporary reactions:\n• mild eyelid sensitivity and slight swelling for 1-2 days;\n• short-term dryness/watery eyes can happen;\n• pigment may look stronger first, then soften.\n\nIf discomfort is strong or increasing, contact your master right away.\n\n[option] ❓ More about PMU healing [/option]\n[option] 📅 Pick time and book [/option]',
    upper_lower:
      'Upper + lower lash line 🌸 Typical temporary reactions:\n• mild eyelid sensitivity and slight swelling for 1-2 days;\n• short-term dryness/watery eyes can happen;\n• pigment may look stronger first, then soften.\n\nIf symptoms are strong or getting worse, contact your master right away.\n\n[option] ❓ More about PMU healing [/option]\n[option] 📅 Pick time and book [/option]',
  };

  const de: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 Typische vorübergehende Reaktionen:\n• leichte Rötung/Empfindlichkeit in den ersten 1-3 Tagen;\n• Farbe wirkt anfangs kräftiger und wird beim Abheilen weicher;\n• leichte Schuppung in der ersten Woche ist möglich.\n\nWenn die Reaktion stark ist oder zunimmt, bitte sofort der Meisterin schreiben.\n\n[option] ❓ Mehr zur PMU-Heilung [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 Typische vorübergehende Reaktionen:\n• leichte Rötung/Empfindlichkeit in den ersten 1-3 Tagen;\n• Farbe wirkt anfangs kräftiger und stabilisiert sich dann;\n• leichte Schuppung in der ersten Woche ist normal.\n\nWenn die Reaktion deutlich ist oder zunimmt, bitte sofort der Meisterin schreiben.\n\n[option] ❓ Mehr zur PMU-Heilung [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    aquarell_lips:
      'Aquarell Lips 🌸 Typische vorübergehende Reaktionen:\n• in den ersten Tagen sind Schwellung und Trockenheit möglich;\n• die Farbe wirkt zunächst kräftiger und wird beim Abheilen weicher;\n• sanfte Pflege und Feuchtigkeit sind wichtig.\n\nWenn Schwellung/Beschwerden stark sind oder zunehmen, bitte sofort der Meisterin schreiben.\n\n[option] ❓ Mehr zur PMU-Heilung [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    lips_3d:
      '3D Lips 🌸 Typische vorübergehende Reaktionen:\n• in den ersten Tagen sind Schwellung und Trockenheit möglich;\n• die Farbe wirkt zunächst intensiver und pendelt sich dann ein;\n• bitte die Pflegehinweise konsequent beachten.\n\nWenn die Reaktion stark ist oder zunimmt, bitte sofort der Meisterin schreiben.\n\n[option] ❓ Mehr zur PMU-Heilung [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    lashline:
      'Wimpernkranz 🌸 Typische vorübergehende Reaktionen:\n• leichte Lid-Empfindlichkeit und geringe Schwellung für 1-2 Tage;\n• kurzfristig sind Trockenheit/tränende Augen möglich;\n• die Pigmentierung wirkt anfangs etwas stärker.\n\nWenn Beschwerden deutlich sind oder zunehmen, bitte sofort der Meisterin schreiben.\n\n[option] ❓ Mehr zur PMU-Heilung [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    upper_lower:
      'Wimpernkranz oben + unten 🌸 Typische vorübergehende Reaktionen:\n• leichte Lid-Empfindlichkeit und geringe Schwellung für 1-2 Tage;\n• kurzfristig sind Trockenheit/tränende Augen möglich;\n• die Pigmentierung wirkt anfangs etwas stärker.\n\nWenn die Reaktion stark ist oder zunimmt, bitte sofort der Meisterin schreiben.\n\n[option] ❓ Mehr zur PMU-Heilung [/option]\n[option] 📅 Zeit finden und buchen [/option]',
  };

  if (normalized === 'ru') return ru[technique];
  if (normalized === 'en') return en[technique];
  return de[technique];
}

export function buildKnowledgeHydrafacialComparisonText(
  locale: 'de' | 'en' | 'ru' | undefined,
): string {
  const l = locale ?? 'de';

  if (l === 'ru') {
    return `Сравнение форматов Hydrafacial 🌸

**Signature (140 €, ~60 мин)**
Очищение + экстракция + увлажнение. Отличная основа для регулярного ухода.

**Deluxe (180 €, ~75 мин)**
Всё из Signature + усиленный пилинг + LED-терапия. Для уставшей, тусклой кожи.

**Platinum (270 €, ~90 мин)**
Всё из Deluxe + лимфодренаж + премиум-сыворотки. Максимальный glow перед событием.

[option] 💧 Signature Hydrafacial — 140 € [/option]
[option] ✨ Deluxe Hydrafacial — 180 € [/option]
[option] 👑 Platinum Hydrafacial — 270 € [/option]
[option] ❓ Подробнее о форматах [/option]
[option] 📅 Подобрать время и записаться [/option]`;
  }

  if (l === 'en') {
    return `Hydrafacial formats compared 🌸

**Signature (€140, ~60 min)**
Cleansing + extraction + hydration. Great foundation for regular care.

**Deluxe (€180, ~75 min)**
Everything in Signature + intensive peeling + LED therapy. For tired, dull skin.

**Platinum (€270, ~90 min)**
Everything in Deluxe + lymphatic drainage + premium serums. Maximum glow before an event.

[option] 💧 Signature Hydrafacial — €140 [/option]
[option] ✨ Deluxe Hydrafacial — €180 [/option]
[option] 👑 Platinum Hydrafacial — €270 [/option]
[option] ❓ More details about formats [/option]
[option] 📅 Pick time and book [/option]`;
  }

  return `Hydrafacial-Formate im Vergleich 🌸

**Signature (140 €, ~60 Min)**
Reinigung + Extraktion + Feuchtigkeit. Perfekte Basis für regelmäßige Pflege.

**Deluxe (180 €, ~75 Min)**
Alles aus Signature + intensives Peeling + LED-Therapie. Für müde, fahle Haut.

**Platinum (270 €, ~90 Min)**
Alles aus Deluxe + Lymphdrainage + Premium-Seren. Maximaler Glow vor Events.

[option] 💧 Signature Hydrafacial — 140 € [/option]
[option] ✨ Deluxe Hydrafacial — 180 € [/option]
[option] 👑 Platinum Hydrafacial — 270 € [/option]
[option] ❓ Mehr Details zu den Formaten [/option]
[option] 📅 Zeit finden und buchen [/option]`;
}

export function isKnowledgeHydrafacialComparisonIntent(
  text: string,
  _locale?: string,
): boolean {
  const v = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!v) return false;

  if (
    (v.includes('signature') && v.includes('deluxe')) ||
    (v.includes('deluxe') && v.includes('platinum')) ||
    (v.includes('signature') && v.includes('platinum'))
  ) return true;

  if (v.includes('unterschied') && v.includes('hydra')) return true;
  if ((v.includes('отличается') || v.includes('разница') || v.includes('сравни')) && (v.includes('hydra') || v.includes('гидра'))) {
    return true;
  }
  if ((v.includes('compare') || v.includes('difference')) && v.includes('hydra')) return true;

  if (v.includes('unterschied signature') || v.includes('чем отличается signature')) return true;
  if (v.includes('signature vs') || v.includes('signature/deluxe/platinum')) return true;

  return false;
}

export function isKnowledgeHydrafacialDetailsIntent(
  text: string,
  locale?: string,
): boolean {
  const v = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!v) return false;
  if (isKnowledgeDetailsIntent(text, locale)) return true;

  return (
    v.includes('подробнее о форматах') ||
    v.includes('details about formats') ||
    v.includes('details about hydrafacial') ||
    v.includes('mehr details zu den formaten') ||
    (v.includes('подробнее') && (v.includes('hydra') || v.includes('гидра')))
  );
}

export function buildKnowledgeHydrafacialDetailsText(
  locale: 'de' | 'en' | 'ru' | undefined,
): string {
  const l = locale ?? 'de';

  if (l === 'ru') {
    return `Как выбрать формат Hydrafacial 🌸

**Signature (140 €, ~60 мин)**
Если нужен регулярный базовый уход: очищение, экстракция и увлажнение без перегруза.

**Deluxe (180 €, ~75 мин)**
Если кожа выглядит уставшей/тусклой: к базе добавляется усиленный пилинг и LED.

**Platinum (270 €, ~90 мин)**
Если нужен максимум эффекта: добавляется лимфодренаж и премиум-сыворотки.

[option] 💧 Signature Hydrafacial — 140 € [/option]
[option] ✨ Deluxe Hydrafacial — 180 € [/option]
[option] 👑 Platinum Hydrafacial — 270 € [/option]
[option] 📅 Подобрать время и записаться [/option]`;
  }

  if (l === 'en') {
    return `How to choose your Hydrafacial format 🌸

**Signature (€140, ~60 min)**
Best for regular baseline care: cleanse, extraction, hydration.

**Deluxe (€180, ~75 min)**
Best when skin looks tired/dull: adds stronger peel and LED to the base.

**Platinum (€270, ~90 min)**
Best for maximum visible result: adds lymphatic drainage and premium serums.

[option] 💧 Signature Hydrafacial — €140 [/option]
[option] ✨ Deluxe Hydrafacial — €180 [/option]
[option] 👑 Platinum Hydrafacial — €270 [/option]
[option] 📅 Pick time and book [/option]`;
  }

  return `So wählen Sie das passende Hydrafacial-Format 🌸

**Signature (140 €, ~60 Min)**
Ideal als regelmäßige Basis: Reinigung, Extraktion, Feuchtigkeit.

**Deluxe (180 €, ~75 Min)**
Ideal bei müder/fahler Haut: stärkere Exfoliation + LED zusätzlich zur Basis.

**Platinum (270 €, ~90 Min)**
Ideal für maximalen Effekt: zusätzlich Lymphdrainage und Premium-Seren.

[option] 💧 Signature Hydrafacial — 140 € [/option]
[option] ✨ Deluxe Hydrafacial — 180 € [/option]
[option] 👑 Platinum Hydrafacial — 270 € [/option]
[option] 📅 Zeit finden und buchen [/option]`;
}

export function buildKnowledgeBrowsLashesComparisonText(
  locale: 'de' | 'en' | 'ru' | undefined,
): string {
  const l = locale ?? 'de';

  if (l === 'ru') {
    return `Сравнение процедур для бровей и ресниц 🌸

**Ламинирование ресниц (Lash Lift) — 55 €**
Ресницы изогнуты вверх, выглядят длиннее и пышнее. Держится 6–8 недель.

**Ламинирование бровей (Brow Lift) — 50 €**
Волоски ложатся в идеальную форму. Брови выглядят гуще. 4–6 недель.

**Hybrid Brows — 60 €**
Ламинирование + окрашивание для максимального объёма и цвета.

**Комбо-выгода:**
Lash Lift + Brow Classic = **75 €** (вместо 95 € по отдельности) 🌿

[option] ✨ Лифтинг ресниц — 55 € [/option]
[option] 🌸 Подтяжка бровей — 50 € [/option]
[option] 💫 Комбо — лифтинг ресниц + классическая коррекция бровей — 75 € [/option]
[option] ❓ Подробнее о процедурах [/option]
[option] 📅 Подобрать время и записаться [/option]`;
  }

  if (l === 'en') {
    return `Brows & lashes comparison 🌸

**Lash Lift — €55**
Lashes curled upward, look longer and fuller. Lasts 6–8 weeks.

**Brow Lift — €50**
Brow hairs set into perfect shape. Brows look fuller. 4–6 weeks.

**Hybrid Brows — €60**
Lifting + tinting for maximum volume and color.

**Combo deal:**
Lash Lift + Brow Classic = **€75** (instead of €95 separately) 🌿

[option] ✨ Lash Lift — €55 [/option]
[option] 🌸 Brow Lift — €50 [/option]
[option] 💫 Combo: Lash Lift + Brow Classic — €75 [/option]
[option] ❓ More details [/option]
[option] 📅 Pick time and book [/option]`;
  }

  return `Brows & Lashes im Vergleich 🌸

**Lash Lift — 55 €**
Wimpern nach oben geschwungen, wirken länger und voller. 6–8 Wochen Halt.

**Brow Lift — 50 €**
Brauen in perfekte Form gelegt, wirken voller. 4–6 Wochen Halt.

**Hybrid Brows — 60 €**
Lifting + Färbung für maximales Volumen und Farbe.

**Kombi-Vorteil:**
Lash Lift + Brow Classic = **75 €** (statt 95 € einzeln) 🌿

[option] ✨ Lash Lift — 55 € [/option]
[option] 🌸 Brow Lift — 50 € [/option]
[option] 💫 Kombi: Lash Lift + Brow Classic — 75 € [/option]
[option] ❓ Mehr Details [/option]
[option] 📅 Zeit finden und buchen [/option]`;
}

export function isKnowledgeBrowsLashesComparisonIntent(
  text: string,
  _locale?: string,
): boolean {
  const v = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!v) return false;

  if (v.includes('lifting vs styling') || v.includes('lifting und styling')) return true;
  if (v.includes('сравнить лифтинг') || v.includes('лифтинг и стайлинг')) return true;
  if (v.includes('compare lifting') || v.includes('lifting vs')) return true;

  return false;
}

export function isKnowledgeBrowsLashesDetailsIntent(
  text: string,
  locale?: string,
): boolean {
  const v = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!v) return false;
  if (isKnowledgeDetailsIntent(text, locale)) return true;

  return (
    v.includes('подробнее о процедурах') ||
    v.includes('more details') ||
    v.includes('mehr details')
  );
}

export function buildKnowledgeBrowsLashesDetailsText(
  locale: 'de' | 'en' | 'ru' | undefined,
): string {
  const l = locale ?? 'de';

  if (l === 'ru') {
    return `Подробнее по Brows/Lashes 🌸

**Ламинирование ресниц (55 €)**
Делает ресницы визуально длиннее и приподнятыми; эффект обычно 6–8 недель.

**Ламинирование бровей (50 €)**
Фиксирует волоски в аккуратной форме; брови выглядят плотнее, эффект 4–6 недель.

**Комбо Lash Lift + Brow Classic (75 €)**
Удобный вариант, если хотите сразу оформить и взгляд, и брови в один визит.

[option] ✨ Лифтинг ресниц — 55 € [/option]
[option] 🌸 Подтяжка бровей — 50 € [/option]
[option] 💫 Комбо — лифтинг ресниц + классическая коррекция бровей — 75 € [/option]
[option] 📅 Подобрать время и записаться [/option]`;
  }

  if (l === 'en') {
    return `More details on Brows/Lashes 🌸

**Lash Lift (€55)**
Makes lashes look longer and lifted; result usually lasts 6–8 weeks.

**Brow Lift (€50)**
Sets brow hairs in shape; brows look fuller for about 4–6 weeks.

**Combo Lash Lift + Brow Classic (€75)**
Great if you want both eyes and brows refined in one visit.

[option] ✨ Lash Lift — €55 [/option]
[option] 🌸 Brow Lift — €50 [/option]
[option] 💫 Combo: Lash Lift + Brow Classic — €75 [/option]
[option] 📅 Pick time and book [/option]`;
  }

  return `Mehr Details zu Brows/Lashes 🌸

**Lash Lift (55 €)**
Lässt die Wimpern länger und angehoben wirken; Halt meist 6–8 Wochen.

**Brow Lift (50 €)**
Bringt die Brauen in Form; vollerer Look für etwa 4–6 Wochen.

**Kombi Lash Lift + Brow Classic (75 €)**
Praktisch, wenn Sie Wimpern und Brauen in einem Termin auffrischen möchten.

[option] ✨ Lash Lift — 55 € [/option]
[option] 🌸 Brow Lift — 50 € [/option]
[option] 💫 Kombi: Lash Lift + Brow Classic — 75 € [/option]
[option] 📅 Zeit finden und buchen [/option]`;
}

export type KnowledgeOccasion = 'wedding' | 'vacation' | 'first_time' | 'correction';

export function detectKnowledgeOccasion(
  text: string,
  _locale?: string,
): KnowledgeOccasion | null {
  const v = text.toLowerCase().replace(/ё/g, 'е').trim();
  if (!v) return null;

  if (v.includes('hochzeit') || v.includes('braut') || v.includes('свадьб') || v.includes('невест') || v.includes('wedding') || v.includes('bride')) {
    return 'wedding';
  }

  if (v.includes('urlaub') || v.includes('отпуск') || v.includes('vacation') || v.includes('holiday') || v.includes('reise') || v.includes('trip') || v.includes('поездк') || v.includes('море') || v.includes('strand') || v.includes('beach')) {
    return 'vacation';
  }

  if (v.includes('erstes mal') || v.includes('первый раз') || v.includes('first time') || v.includes('noch nie') || v.includes('never had') || v.includes('никогда не делал')) {
    return 'first_time';
  }

  const correctionKeywordRe =
    /(auffrisch|korrektur|коррекци|обновить|обновлен|refresh|touch-?up|verblasst|побледнел|faded)/u;
  const correctionContextRe =
    /(pmu|перманент|перманентн|перман|татуаж|permanent\s*make-?up)/u;
  if (correctionKeywordRe.test(v) && correctionContextRe.test(v)) {
    return 'correction';
  }

  return null;
}

export function buildKnowledgeOccasionText(
  locale: 'de' | 'en' | 'ru' | undefined,
  occasion: KnowledgeOccasion,
): string {
  const l = locale ?? 'de';

  const texts: Record<KnowledgeOccasion, Record<'de' | 'en' | 'ru', string>> = {
    wedding: {
      de: `Wie schön — Glückwunsch! 💍 Hier ist unser Hochzeit-Beauty-Plan:\n\n• 6–8 Wochen vorher: PMU (Brauen und/oder Lippen)\n• 4–6 Wochen vorher: PMU-Korrektur\n• 1 Woche vorher: Hydrafacial Platinum + Lash Lift\n• Am Tag: aufwachen und strahlen! ✨\n\nDie meisten Bräute wählen Powder Brows + Aquarell Lips 🌸\n\n[option] 💄 PMU Brauen für die Hochzeit [/option]\n[option] 💋 PMU Lippen für die Hochzeit [/option]\n[option] ✨ Hydrafacial Platinum [/option]\n[option] 📅 Beratungstermin buchen [/option]`,
      en: `How lovely — congratulations! 💍 Here's our wedding beauty plan:\n\n• 6–8 weeks before: PMU (brows and/or lips)\n• 4–6 weeks before: PMU touch-up\n• 1 week before: Hydrafacial Platinum + Lash Lift\n• On the day: wake up and glow! ✨\n\nMost brides choose Powder Brows + Aquarelle Lips 🌸\n\n[option] 💄 PMU brows for the wedding [/option]\n[option] 💋 PMU lips for the wedding [/option]\n[option] ✨ Hydrafacial Platinum [/option]\n[option] 📅 Book consultation [/option]`,
      ru: `Как приятно — поздравляю! 💍 Вот наш бьюти-план к свадьбе:\n\n• 6–8 недель до: PMU (брови и/или губы)\n• 4–6 недель до: коррекция PMU\n• 1 неделю до: Hydrafacial Platinum + Lash Lift\n• В день свадьбы: просыпаетесь красивой! ✨\n\nСамый популярный выбор невест — Powder Brows + акварельные губы 🌸\n\n[option] 💄 PMU брови к свадьбе [/option]\n[option] 💋 PMU губы к свадьбе [/option]\n[option] ✨ Hydrafacial Platinum [/option]\n[option] 📅 Записаться на консультацию [/option]`,
    },
    vacation: {
      de: `Tolle Idee, sich für den Urlaub vorzubereiten! 🌴\n\nPMU am besten 4–6 Wochen vorher buchen, dann ist alles verheilt. Kein Make-up am Strand, im Pool oder beim Abendessen — einfach genießen 🌸\n\nBesonders beliebt vor dem Urlaub:\n\n[option] 💄 Powder Brows — 350 € [/option]\n[option] 💋 Aquarell Lips — 380 € [/option]\n[option] ✨ Lash Lift — 55 € [/option]\n[option] 📅 Termin finden [/option]`,
      en: `Great idea to prep for vacation! 🌴\n\nBook PMU 4–6 weeks before your trip so everything heals. No makeup at the beach, pool, or dinner — just enjoy 🌸\n\nMost popular before vacation:\n\n[option] 💄 Powder Brows — €350 [/option]\n[option] 💋 Aquarelle Lips — €380 [/option]\n[option] ✨ Lash Lift — €55 [/option]\n[option] 📅 Find appointment [/option]`,
      ru: `Отличная идея подготовиться к отпуску! 🌴\n\nPMU лучше сделать за 4–6 недель до поездки — всё заживёт. Никакого макияжа на пляже, в бассейне или за ужином — просто отдыхайте 🌸\n\nСамое популярное перед отпуском:\n\n[option] 💄 Powder Brows — 350 € [/option]\n[option] 💋 Акварельные губы — 380 € [/option]\n[option] ✨ Lash Lift — 55 € [/option]\n[option] 📅 Подобрать время [/option]`,
    },
    first_time: {
      de: `Wie schön, dass Sie sich informieren! 🌸 Beim ersten Mal empfehlen wir immer die natürlichste Variante.\n\nSo läuft's ab: Wir besprechen alles in Ruhe, zeichnen die Form vor und Sie geben erst dann Ihr OK. Keine Überraschungen!\n\nDie meisten Kundinnen sagen danach: "Warum habe ich das nicht früher gemacht!" 😊\n\n[option] 💄 Powder Brows — natürlichste Variante [/option]\n[option] 💋 Aquarell Lips — sanfte Farbe [/option]\n[option] ✨ Lash Lift — der einfachste Einstieg [/option]\n[option] ❓ Mehr Infos zur Heilung [/option]\n[option] 📅 Beratungstermin buchen [/option]`,
      en: `So nice that you're looking into it! 🌸 For first-timers, we always recommend the most natural option.\n\nHere's how it works: We discuss everything calmly, pre-draw the shape, and you give the OK only when you're happy. No surprises!\n\nMost clients say afterwards: "Why didn't I do this sooner!" 😊\n\n[option] 💄 Powder Brows — most natural option [/option]\n[option] 💋 Aquarelle Lips — soft color [/option]\n[option] ✨ Lash Lift — easiest entry point [/option]\n[option] ❓ More about healing [/option]\n[option] 📅 Book consultation [/option]`,
      ru: `Как здорово, что вы интересуетесь! 🌸 Для первого раза мы всегда рекомендуем максимально натуральный вариант.\n\nКак проходит: обсуждаем всё спокойно, рисуем эскиз и вы даёте «ок» только когда довольны. Никаких сюрпризов!\n\nБольшинство клиенток потом говорят: «Почему я не сделала это раньше!» 😊\n\n[option] 💄 Powder Brows — самый натуральный вариант [/option]\n[option] 💋 Акварельные губы — нежный цвет [/option]\n[option] ✨ Lash Lift — самый простой старт [/option]\n[option] ❓ Подробнее о заживлении [/option]\n[option] 📅 Записаться на консультацию [/option]`,
    },
    correction: {
      de: `Auffrischung oder Korrektur ist jederzeit möglich 🌿\n\nWann war Ihre letzte PMU-Behandlung? Davon hängt der Preis ab:\n\n[option] Vor ca. 2 Monaten — Korrektur 120 € [/option]\n[option] 12–24 Monate her — Auffrischung 175 € [/option]\n[option] Über 24 Monate — Auffrischung 230 € [/option]\n[option] Kleine Korrektur — 39 € [/option]\n[option] 📅 Termin finden [/option]`,
      en: `Refresh or correction is always possible 🌿\n\nWhen was your last PMU treatment? The price depends on that:\n\n[option] About 2 months ago — correction €120 [/option]\n[option] 12–24 months ago — refresh €175 [/option]\n[option] Over 24 months — refresh €230 [/option]\n[option] Small correction — €39 [/option]\n[option] 📅 Find appointment [/option]`,
      ru: `Обновление или коррекция возможны в любое время 🌿\n\nКогда была последняя процедура? От этого зависит цена:\n\n[option] Около 2 месяцев назад — коррекция 120 € [/option]\n[option] 12–24 месяца назад — обновление 175 € [/option]\n[option] Больше 24 месяцев — обновление 230 € [/option]\n[option] Маленькая коррекция — 39 € [/option]\n[option] 📅 Подобрать время [/option]`,
    },
  };

  return texts[occasion][l] ?? texts[occasion].de;
}
