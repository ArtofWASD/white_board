# UI Library & Components

Фронтенд проекта Whiteboard использует связку Tailwind CSS и компонентов, вдохновленных/использующих библиотеку **shadcn/ui** (построенную на Radix UI).

## Базовая структура и стили

- Компоненты лежат в каталоге `frontend/src/components/ui/`.
- **Слияние классов:** Для композиции Tailwind-классов в компонентах строго применяется утилита `cn` из `src/lib/utils.ts` (оболочка над `clsx` и `tailwind-merge`).
- **Цветовые схемы (Темная тема):**
  - Проект активно поддерживает Next.js Theme Provider.
  - Обязательно учитывайте тёмную тему. Используйте классы вроде `dark:bg-gray-900`, `dark:text-white`, `dark:border-gray-800`.
  - У компонентов есть переменные CSS, встроенные темы (возможность кастомизации под разные бренды/организации).

## Типы UI компонентов

### 1. Кастомные обособленные компоненты (Tailwind-native)

Пример: `Button` (`Button.tsx`)

- Реализованы с различными вариантами (`variant`: primary, outline, ghost, link, destructive).
- Поддерживают разные размеры (`size`: sm, md, lg).
- Кастомизированы под специфический дизайн продукта (например, интересная логика подчеркиваний при ховере, tooltip-и, layout `vertical / horizontal`).
- Если нужен элемент управления, сначала проверяйте наличие кастомного варианта (например, Button, AnimatedLink).

### 2. Примитивы Radix UI (Shadcn)

Пример: `Dialog` (`dialog.tsx`), `Popover` (`popover.tsx`), `Select` (`select.tsx`)

- Данные компоненты строятся на базе `@radix-ui/react-*` пакетов, предоставляющих базовую доступность (A11y), фокус-менеджмент и логику клавиатуры.
- **Анимации:** Они интегрированы с пакетом `tailwindcss-animate`. В стилях компонентов можно встретить `data-[state=open]:animate-in`, `data-[state=closed]:fade-out-0`, `slide-in-from-bottom` и т.д.
- **Использование:** Компонент разбивается на подотделы (Compound Components pattern).
  - Пример использования диалогового окна:
  ```tsx
  <Dialog>
    <DialogTrigger asChild>
      <Button>Open</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Заголовок</DialogTitle>
        <DialogDescription>Описание</DialogDescription>
      </DialogHeader>
      <div>Контент окна</div>
    </DialogContent>
  </Dialog>
  ```
- Для мобильных устройств окна часто адаптируются (Bottom sheet behavior), поэтому обращайте внимание на стили `max-sm:bottom-0 max-sm:w-full`, чтобы всё корректно отображалось на телефонах.

## Касательно новых разработок

1. Не пишите "грязный" CSS или встроенные стили (inline-styles), если задачу можно решить с помощью Tailwind.
2. При создании модальных элементов, селектов или всплывающих окон всегда переиспользуйте существующие UI-примитивы. Не пишите их с нуля.
3. Используйте векторные иконки из библиотеки `lucide-react`.
