// Единый источник правды для типов результатов server actions

export type FieldErrors = Record<string, string[]>;

export type ActionFail = {
  ok: false;
  error: string;
  details?: { fieldErrors?: FieldErrors };
};

export type ActionOk = { ok: true; id?: string };

export type ActionResult = ActionOk | ActionFail;
