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
      value.includes('заживлен')
    );
  }

  if (normalized === 'en') {
    return (
      value.includes('quick healing') ||
      value.includes('aftercare consultation') ||
      (value.includes('healing') && value.includes('consultation')) ||
      (value.includes('pmu') && value.includes('aftercare'))
    );
  }

  return (
    value.includes('kurze beratung zu heilung') ||
    value.includes('heilung und pflege') ||
    (value.includes('heilung') && value.includes('beratung'))
  );
}

export function buildKnowledgePmuHealingText(
  locale: AssistantLocale | undefined,
): string {
  const lang = localeToLang(locale);
  const healing = PERMANENT_HALLE.pmu.healing_1_30[lang];
  const rules = healing.rules.map((rule) => `• ${rule}`).join('\n');

  if (lang === 'RU') {
    return `Коротко по заживлению после PMU 🌸\n\n${healing.d1_3}\n${healing.d4_7}\n${healing.d7_14}\n${healing.d14_30}\n\n${rules}\n\n${healing.reassurance}\n\n[option] Брови — форма и мягкий эффект [/option]\n[option] Губы — свежий оттенок [/option]\n[option] Межресничка — выразительный взгляд [/option]\n[option] 📅 Подобрать время и записаться [/option]`;
  }

  if (lang === 'EN') {
    return `Quick PMU healing guide 🌸\n\n${healing.d1_3}\n${healing.d4_7}\n${healing.d7_14}\n${healing.d14_30}\n\n${rules}\n\n${healing.reassurance}\n\n[option] Brows — shape and soft definition [/option]\n[option] Lips — fresh color [/option]\n[option] Lash line — expressive look [/option]\n[option] 📅 Pick time and book [/option]`;
  }

  return `Kurzer PMU-Heilungsverlauf 🌸\n\n${healing.d1_3}\n${healing.d4_7}\n${healing.d7_14}\n${healing.d14_30}\n\n${rules}\n\n${healing.reassurance}\n\n[option] Augenbrauen — Form und weicher Effekt [/option]\n[option] Lippen — frischer Farbton [/option]\n[option] Wimpernkranz — ausdrucksvoller Blick [/option]\n[option] 📅 Zeit finden und buchen [/option]`;
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
      return 'Для максимально натурального результата чаще выбирают **Powder Brows** 🌸\n\n[option] 💖 Powder Brows — мягкий эффект, 350 € [/option]\n[option] 🌟 Hairstroke Brows — более детализированный, 450 € [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    if (style === 'expressive') {
      return 'Для более яркого и выразительного результата подойдут эти варианты 🌸\n\n[option] 💖 Powder Brows — мягкий эффект, 350 € [/option]\n[option] 🌟 Hairstroke Brows — более детализированный, 450 € [/option]\n[option] 📅 Подобрать время и записаться [/option]';
    }
    return 'Если ориентироваться на бюджет, оптимальный старт — **Powder Brows 350 €** 🌿\n\n[option] 💖 Powder Brows — мягкий эффект, 350 € [/option]\n[option] 🌟 Hairstroke Brows — более детализированный, 450 € [/option]\n[option] 📅 Подобрать время и записаться [/option]';
  }

  if (normalized === 'en') {
    if (style === 'natural') {
      return 'For a very natural look, clients often choose **Powder Brows** 🌸\n\n[option] 💖 Powder Brows — soft effect, €350 [/option]\n[option] 🌟 Hairstroke Brows — more detailed, €450 [/option]\n[option] 📅 Pick time and book [/option]';
    }
    if (style === 'expressive') {
      return 'For a brighter and more defined result, these two options fit best 🌸\n\n[option] 💖 Powder Brows — soft effect, €350 [/option]\n[option] 🌟 Hairstroke Brows — more detailed, €450 [/option]\n[option] 📅 Pick time and book [/option]';
    }
    return 'If budget is key, **Powder Brows €350** is usually the best start 🌿\n\n[option] 💖 Powder Brows — soft effect, €350 [/option]\n[option] 🌟 Hairstroke Brows — more detailed, €450 [/option]\n[option] 📅 Pick time and book [/option]';
  }

  if (style === 'natural') {
    return 'Für ein sehr natürliches Ergebnis wird meist **Powder Brows** gewählt 🌸\n\n[option] 💖 Powder Brows — weicher Effekt, 350 € [/option]\n[option] 🌟 Hairstroke Brows — detaillierter, 450 € [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  if (style === 'expressive') {
    return 'Für ein ausdrucksstärkeres Ergebnis passen diese zwei Optionen am besten 🌸\n\n[option] 💖 Powder Brows — weicher Effekt, 350 € [/option]\n[option] 🌟 Hairstroke Brows — detaillierter, 450 € [/option]\n[option] 📅 Zeit finden und buchen [/option]';
  }
  return 'Wenn Budget wichtig ist, ist **Powder Brows 350 €** oft der beste Einstieg 🌿\n\n[option] 💖 Powder Brows — weicher Effekt, 350 € [/option]\n[option] 🌟 Hairstroke Brows — detaillierter, 450 € [/option]\n[option] 📅 Zeit finden und buchen [/option]';
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
    return 'Для губ чаще выбирают один из этих вариантов 🌸\n\n[option] 💄 Aquarell Lips — свежий оттенок, 380 € [/option]\n[option] 💋 3D Lips — объёмный эффект, 420 € [/option]\n[option] 📅 Подобрать время и записаться [/option]';
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

  if (value.includes('powder')) return 'powder_brows';
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
      'Powder Brows 🌸 Мягкий пудровый эффект, максимально натурально в повседневности. Цена: **350 €**.\n\n[option] 🌟 Сравнить с Hairstroke Brows [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 Более выраженная текстура, эффект «волосков». Цена: **450 €**.\n\n[option] 💖 Сравнить с Powder Brows [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    aquarell_lips:
      'Aquarell Lips 🌸 Мягкий ровный оттенок без жёсткого контура. Цена: **380 €**.\n\n[option] 💄 Сравнить с 3D Lips [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    lips_3d:
      '3D Lips 🌸 Более насыщенный и объёмный эффект. Цена: **420 €**.\n\n[option] 💋 Сравнить с Aquarell Lips [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    lashline:
      'Межресничка 🌸 Деликатно подчёркивает линию ресниц. Цена: **130 €**.\n\n[option] 👁 Вариант верх+низ (150 €) [/option]\n[option] 📅 Подобрать время и записаться [/option]',
    upper_lower:
      'Межресничка верх+низ 🌸 Более выраженный результат. Цена: **150 €**.\n\n[option] 👁 Деликатный вариант только межресничка (130 €) [/option]\n[option] 📅 Подобрать время и записаться [/option]',
  };

  const en: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 Soft, natural powder effect. Price: **€350**.\n\n[option] 🌟 Compare with Hairstroke Brows [/option]\n[option] 📅 Pick time and book [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 More visible hair texture. Price: **€450**.\n\n[option] 💖 Compare with Powder Brows [/option]\n[option] 📅 Pick time and book [/option]',
    aquarell_lips:
      'Aquarelle Lips 🌸 Soft even color without a hard outline. Price: **€380**.\n\n[option] 💄 Compare with 3D Lips [/option]\n[option] 📅 Pick time and book [/option]',
    lips_3d:
      '3D Lips 🌸 More intense, fuller effect. Price: **€420**.\n\n[option] 💋 Compare with Aquarelle Lips [/option]\n[option] 📅 Pick time and book [/option]',
    lashline:
      'Lash line 🌸 Subtle enhancement of lash contour. Price: **€130**.\n\n[option] 👁 Upper + lower option (€150) [/option]\n[option] 📅 Pick time and book [/option]',
    upper_lower:
      'Upper + lower lash line 🌸 More defined result. Price: **€150**.\n\n[option] 👁 Subtle lash line only (€130) [/option]\n[option] 📅 Pick time and book [/option]',
  };

  const de: Record<KnowledgePmuTechnique, string> = {
    powder_brows:
      'Powder Brows 🌸 Weicher, natürlicher Puder-Effekt. Preis: **350 €**.\n\n[option] 🌟 Mit Hairstroke Brows vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    hairstroke_brows:
      'Hairstroke Brows 🌸 Sichtbarere Härchenstruktur. Preis: **450 €**.\n\n[option] 💖 Mit Powder Brows vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    aquarell_lips:
      'Aquarell Lips 🌸 Weicher, gleichmäßiger Ton ohne harte Kontur. Preis: **380 €**.\n\n[option] 💄 Mit 3D Lips vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    lips_3d:
      '3D Lips 🌸 Intensiverer, vollerer Effekt. Preis: **420 €**.\n\n[option] 💋 Mit Aquarell Lips vergleichen [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    lashline:
      'Wimpernkranz 🌸 Dezente Betonung der Wimpernlinie. Preis: **130 €**.\n\n[option] 👁 Oben + unten (150 €) [/option]\n[option] 📅 Zeit finden und buchen [/option]',
    upper_lower:
      'Wimpernkranz oben + unten 🌸 Deutlich definierteres Ergebnis. Preis: **150 €**.\n\n[option] 👁 Nur Wimpernkranz (130 €) [/option]\n[option] 📅 Zeit finden und buchen [/option]',
  };

  if (normalized === 'ru') return ru[technique];
  if (normalized === 'en') return en[technique];
  return de[technique];
}
