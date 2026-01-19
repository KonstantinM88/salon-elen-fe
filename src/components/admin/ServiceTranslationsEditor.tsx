// src/components/admin/ServiceTranslationsEditor.tsx
'use client';

import { useState } from 'react';
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n-utils';

type Translation = {
  locale: Locale;
  name: string;
  description: string;
};

type Props = {
  serviceId: string;
  initialTranslations: Translation[];
  onSave: (translations: Translation[]) => Promise<void>;
};

export function ServiceTranslationsEditor({ serviceId, initialTranslations, onSave }: Props) {
  const [activeLocale, setActiveLocale] = useState<Locale>('de');
  const [translations, setTranslations] = useState<Record<Locale, Translation>>(() => {
    // Инициализируем переводы
    const initial: Record<string, Translation> = {};
    
    for (const locale of SUPPORTED_LOCALES) {
      const existing = initialTranslations.find(t => t.locale === locale);
      initial[locale] = existing || {
        locale,
        name: '',
        description: '',
      };
    }
    
    return initial as Record<Locale, Translation>;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверка заполненности переводов
  const getTranslationStatus = (locale: Locale): 'complete' | 'partial' | 'empty' => {
    const t = translations[locale];
    if (!t.name && !t.description) return 'empty';
    if (t.name && t.description) return 'complete';
    return 'partial';
  };

  // Обработчик изменения поля
  const handleChange = (field: 'name' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  };

  // Сохранение
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Проверяем что хотя бы один перевод заполнен
      const hasTranslations = SUPPORTED_LOCALES.some(
        locale => translations[locale].name.trim() !== ''
      );

      if (!hasTranslations) {
        throw new Error('Необходимо заполнить хотя бы одно название');
      }

      // Фильтруем только заполненные переводы
      const validTranslations = SUPPORTED_LOCALES
        .map(locale => translations[locale])
        .filter(t => t.name.trim() !== '');

      await onSave(validTranslations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Табы языков */}
      <div className="flex gap-2 border-b border-white/10">
        {SUPPORTED_LOCALES.map(locale => {
          const status = getTranslationStatus(locale);
          const isActive = activeLocale === locale;

          return (
            <button
              key={locale}
              onClick={() => setActiveLocale(locale)}
              className={`
                relative px-4 py-2 font-medium transition-all
                ${isActive 
                  ? 'text-sky-400 border-b-2 border-sky-400' 
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span>{LOCALE_FLAGS[locale]}</span>
                <span>{LOCALE_NAMES[locale]}</span>
                
                {/* Индикатор статуса */}
                {status === 'complete' && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
                {status === 'partial' && (
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                )}
                {status === 'empty' && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Форма редактирования */}
      <div className="space-y-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        {/* Название */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Название *
          </label>
          <input
            type="text"
            value={translations[activeLocale].name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={`Введите название на ${LOCALE_NAMES[activeLocale].toLowerCase()}`}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg
                     text-white placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500
                     transition-all"
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Описание
          </label>
          <textarea
            value={translations[activeLocale].description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder={`Введите описание на ${LOCALE_NAMES[activeLocale].toLowerCase()}`}
            rows={4}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg
                     text-white placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500
                     transition-all resize-none"
          />
        </div>

        {/* Подсказка */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-blue-400 text-xl">💡</div>
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Совет по переводам:</p>
              <ul className="space-y-1 text-blue-200/80">
                <li>• Заполните хотя бы один язык (обязательно)</li>
                <li>• Клиенты увидят услугу на своём языке</li>
                <li>• Если перевод отсутствует, будет показан на немецком</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Кнопка сохранения */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500
                   text-white font-semibold rounded-lg
                   hover:from-sky-600 hover:to-cyan-600
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all shadow-lg hover:shadow-sky-500/50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Сохранение...
            </span>
          ) : (
            'Сохранить переводы'
          )}
        </button>
      </div>

      {/* Статус переводов */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Статус переводов:</h3>
        <div className="grid grid-cols-3 gap-4">
          {SUPPORTED_LOCALES.map(locale => {
            const status = getTranslationStatus(locale);
            const t = translations[locale];

            return (
              <div
                key={locale}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{LOCALE_FLAGS[locale]}</span>
                    <span className="text-sm font-medium text-gray-300">
                      {LOCALE_NAMES[locale]}
                    </span>
                  </div>
                  {status === 'complete' && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      Готово
                    </span>
                  )}
                  {status === 'partial' && (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      Частично
                    </span>
                  )}
                  {status === 'empty' && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                      Пусто
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    Название: {t.name ? '✅' : '❌'}
                  </div>
                  <div>
                    Описание: {t.description ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}