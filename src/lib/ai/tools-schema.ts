// src/lib/ai/tools-schema.ts
// OpenAI function-calling tool definitions for the booking assistant.

export type ToolName =
  | 'list_services'
  | 'list_masters_for_services'
  | 'search_availability'
  | 'search_availability_month'
  | 'reserve_slot'
  | 'create_draft'
  | 'start_verification'
  | 'complete_booking';

export interface ToolDefinition {
  type: 'function';
  name: ToolName;
  description: string;
  parameters: Record<string, unknown>;
  strict?: boolean;
}

export const TOOLS: ToolDefinition[] = [
  // ── 1. list_services ──────────────────────────────────────────
  {
    type: 'function',
    name: 'list_services',
    description:
      'Получить полный список активных бронируемых услуг салона с ценами и длительностью, сгруппированных по категориям. При query возвращает все совпадения без искусственного лимита; если совпадений нет — noMatches=true и suggestedAlternatives.',
    parameters: {
      type: 'object',
      properties: {
        locale: {
          type: 'string',
          enum: ['de', 'ru', 'en'],
          description: 'Язык для названий и описаний услуг',
        },
        query: {
          type: 'string',
          description:
            'Необязательный поисковый запрос для фильтрации. Пример: "Maniküre", "ресницы", "nail"',
        },
      },
      required: ['locale'],
      additionalProperties: false,
    },
  },

  // ── 2. list_masters_for_services ──────────────────────────────
  {
    type: 'function',
    name: 'list_masters_for_services',
    description:
      'Получить мастеров, которые могут выполнить ВСЕ выбранные услуги. Вызывай после выбора КОНКРЕТНОЙ бронируемой услуги. Если передана категория/некорректный id, вернет requiresSpecificService=true и error=NO_BOOKABLE_SERVICE_SELECTED.',
    parameters: {
      type: 'object',
      properties: {
        serviceIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Массив ID выбранных услуг',
        },
      },
      required: ['serviceIds'],
      additionalProperties: false,
    },
  },

  // ── 3. search_availability ────────────────────────────────────
  {
    type: 'function',
    name: 'search_availability',
    description:
      'Найти свободные слоты для мастера на конкретный день. ОБЯЗАТЕЛЬНО вызывать перед предложением времени клиенту. НИКОГДА не выдумывать слоты.',
    parameters: {
      type: 'object',
      properties: {
        masterId: { type: 'string', description: 'ID мастера' },
        dateISO: {
          type: 'string',
          description: 'Дата в формате YYYY-MM-DD',
        },
        serviceIds: {
          type: 'array',
          items: { type: 'string' },
          description:
            'ID услуг (суммарная длительность рассчитывается автоматически)',
        },
        preferredTime: {
          type: 'string',
          enum: ['morning', 'afternoon', 'evening', 'any'],
          description:
            'Предпочтение по времени: morning (<12:00), afternoon (12–17), evening (17+), any (все)',
        },
      },
      required: ['masterId', 'dateISO', 'serviceIds'],
      additionalProperties: false,
    },
  },

  // ── 4. search_availability_month ──────────────────────────────
  {
    type: 'function',
    name: 'search_availability_month',
    description:
      'Показать обзор свободных дней за месяц. Используй когда клиент спрашивает "когда есть свободное" без конкретной даты.',
    parameters: {
      type: 'object',
      properties: {
        masterId: { type: 'string', description: 'ID мастера' },
        monthISO: {
          type: 'string',
          description: 'Месяц в формате YYYY-MM',
        },
        serviceIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'ID услуг',
        },
      },
      required: ['masterId', 'monthISO', 'serviceIds'],
      additionalProperties: false,
    },
  },

  // ── 5. reserve_slot ───────────────────────────────────────────
  {
    type: 'function',
    name: 'reserve_slot',
    description:
      'Зарезервировать выбранный слот на 5 минут, пока собираем контактные данные. ОБЯЗАТЕЛЬНО вызвать СРАЗУ после выбора слота клиентом, ДО сбора данных.',
    parameters: {
      type: 'object',
      properties: {
        masterId: { type: 'string' },
        startAt: {
          type: 'string',
          description: 'Начало слота в ISO UTC формате',
        },
        endAt: {
          type: 'string',
          description: 'Конец слота в ISO UTC формате',
        },
        sessionId: {
          type: 'string',
          description: 'UUID сессии AI-чата',
        },
      },
      required: ['masterId', 'startAt', 'endAt', 'sessionId'],
      additionalProperties: false,
    },
  },

  // ── 6. create_draft ───────────────────────────────────────────
  {
    type: 'function',
    name: 'create_draft',
    description:
      'Создать черновик бронирования с контактными данными клиента. Вызывать после reserve_slot и сбора данных.',
    parameters: {
      type: 'object',
      properties: {
        serviceId: { type: 'string', description: 'ID выбранной услуги' },
        masterId: { type: 'string' },
        startAt: { type: 'string', description: 'ISO UTC' },
        endAt: { type: 'string', description: 'ISO UTC' },
        customerName: { type: 'string', description: 'Имя клиента' },
        phone: {
          type: 'string',
          description: 'Телефон в формате +49... (необязательно)',
        },
        email: { type: 'string', description: 'Email клиента' },
        birthDate: {
          type: 'string',
          description: 'Дата рождения YYYY-MM-DD (необязательно)',
        },
        notes: {
          type: 'string',
          description: 'Примечания клиента (необязательно)',
        },
        locale: {
          type: 'string',
          enum: ['de', 'ru', 'en'],
          description: 'Язык клиента для уведомлений',
        },
      },
      required: [
        'serviceId',
        'masterId',
        'startAt',
        'endAt',
        'customerName',
        'email',
        'locale',
      ],
      additionalProperties: false,
    },
  },

  // ── 7. start_verification ─────────────────────────────────────
  {
    type: 'function',
    name: 'start_verification',
    description:
      'Запустить верификацию контакта клиента. Отправляет OTP код на email.',
    parameters: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['email_otp'],
          description: 'Метод верификации (пока только email_otp)',
        },
        draftId: {
          type: 'string',
          description: 'ID черновика бронирования',
        },
        contact: {
          type: 'string',
          description: 'Email адрес клиента',
        },
      },
      required: ['method', 'draftId', 'contact'],
      additionalProperties: false,
    },
  },

  // ── 8. complete_booking ───────────────────────────────────────
  {
    type: 'function',
    name: 'complete_booking',
    description:
      'Завершить бронирование после верификации. Проверяет OTP код и создаёт запись Appointment.',
    parameters: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['email_otp'],
          description: 'Метод верификации',
        },
        draftId: { type: 'string', description: 'ID черновика' },
        code: {
          type: 'string',
          description: '6-значный OTP код от клиента',
        },
      },
      required: ['method', 'draftId', 'code'],
      additionalProperties: false,
    },
  },
];
