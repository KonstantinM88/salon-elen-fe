import type { Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

const REVIEW_PROMPT_KEYS = [
  'review_prompt_1',
  'review_prompt_2',
  'review_prompt_3',
  'review_prompt_4',
  'review_prompt_5',
] as const satisfies readonly MessageKey[];

export function getRandomReviewPrompt(locale: Locale): string {
  const index = Math.floor(Math.random() * REVIEW_PROMPT_KEYS.length);
  const key = REVIEW_PROMPT_KEYS[index] ?? REVIEW_PROMPT_KEYS[0];
  return translate(locale, key);
}
