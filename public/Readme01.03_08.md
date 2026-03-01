# Readme01.03_08

Отчёт по изменениям после последнего коммита (`HEAD`) на текущий момент.

## Изменённые файлы

1. `src/components/ai/ChatWidget.tsx` (modified)
2. `src/hooks/useMobileViewport.ts` (new, untracked)

## Краткая статистика

- По отслеживаемым Git изменениям:
  - `src/components/ai/ChatWidget.tsx`: `+78 / -7`
- Дополнительно добавлен новый файл:
  - `src/hooks/useMobileViewport.ts`

## Детализация

### 1) `src/components/ai/ChatWidget.tsx`

Внедрена мобильная адаптация виджета и донастроен десктопный размер/позиция:

- Добавлен импорт:
  - `useMobileViewport` из `@/hooks/useMobileViewport`.

- Добавлены состояния и ref:
  - `vpHeight`, `keyboardOpen`, `isMobile` (из хука);
  - `panelRef`, `headerRef`;
  - `dragY`.

- Добавлены `useEffect`:
  - блокировка скролла `body` на мобиле при открытом чате;
  - автоскролл вниз при открытии клавиатуры.

- `handleNewChat`:
  - добавлен сброс `dragY`.

- Добавлен `handleDragEnd`:
  - закрытие по свайпу вниз (offset > 100 или velocity > 500);
  - сброс `dragY`.

- Floating button:
  - убраны жёсткие `bottom/right` из class;
  - добавлены safe-area позиции через inline style:
    - `bottom: max(1.5rem, env(safe-area-inset-bottom, 1.5rem))`
    - `right: max(1.5rem, env(safe-area-inset-right, 1.5rem))`

- Панель чата:
  - убран `h-full` из class;
  - добавлен `ref={panelRef}`;
  - на мобиле высота теперь динамическая:
    - `height: isMobile ? \`${vpHeight}px\` : undefined`
  - добавлены safe-area отступы:
    - `paddingTop`, `paddingBottom`.

- Десктоп-компоновка панели сделана компактнее:
  - `sm:h-[600px]` → `sm:h-[540px]`
  - `sm:w-[400px]` → `sm:w-[360px]`
  - позиция: `sm:bottom-0 sm:right-6`

- Header:
  - `div` заменён на `motion.div`;
  - включён drag по оси `y` на мобиле;
  - добавлен индикатор перетаскивания (mobile only).

- Область сообщений:
  - добавлен `overscroll-contain`;
  - добавлен `WebkitOverflowScrolling: 'touch'`.

- Input area:
  - добавлен `pb-[max(0.75rem,env(safe-area-inset-bottom))]`.

### 2) `src/hooks/useMobileViewport.ts` (новый файл)

Добавлен хук для корректной работы на мобильных устройствах:

- Отслеживает:
  - фактическую видимую высоту (`visualViewport.height` с fallback на `innerHeight`);
  - состояние клавиатуры (`keyboardOpen`);
  - признак мобильного экрана (`isMobile`, `<640px`).

- Подписки:
  - `visualViewport.resize`, `visualViewport.scroll`;
  - `window.resize`;
  - `orientationchange` (с отложенным обновлением).

- Возвращает:
  - `{ height, keyboardOpen, isMobile }`.

## Результат

После этих правок виджет:

- корректно ведёт себя при мобильной клавиатуре;
- учитывает safe-area (iPhone notch/home indicator);
- поддерживает закрытие свайпом по хедеру;
- не прокручивает `body` под открытым чатом на мобиле;
- на десктопе отображается компактнее и меньше перекрывает верхние элементы страницы.
