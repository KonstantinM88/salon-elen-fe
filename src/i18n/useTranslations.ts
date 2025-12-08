// src/i18n/useTranslations.ts

import { useI18n } from './I18nProvider';
import { translate, type MessageKey } from './messages';

export function useTranslations() {
  const { locale } = useI18n();

  return (key: MessageKey): string => translate(locale, key);
}
