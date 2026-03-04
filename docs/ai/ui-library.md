# UI Library & Components

Фронтенд проекта Whiteboard использует единую систему компонентов на базе **shadcn/ui** и **Radix UI**.

---

## Система тем (CSS-переменные)

Все цвета управляются через CSS-переменные в `src/app/globals.css`. **Никогда не используйте хардкоды** `dark:bg-gray-*` в компонентах — только токены.

### Доступные токены

| Токен                                          | Назначение                              |
| ---------------------------------------------- | --------------------------------------- |
| `--background` / `bg-background`               | Базовый фон страницы/формы              |
| `--card` / `bg-[var(--card)]`                  | Поверхность карточек и диалогов         |
| `--popover` / `bg-[var(--popover)]`            | Выпадающие списки, поповеры             |
| `--input` / `border-input`                     | Граница инпутов                         |
| `--muted` / `bg-muted`                         | Приглушённые фоны (секции, разделители) |
| `--muted-foreground` / `text-muted-foreground` | Вторичный текст                         |
| `--border` / `border-border`                   | Граница элементов                       |
| `--primary` / `bg-primary`                     | Акцентный цвет                          |
| `--accent` / `bg-accent`                       | Hover-подсветка                         |
| `--destructive`                                | Цвет ошибок/удаления                    |

### Значения по умолчанию

| Токен              | Светлая тема | Тёмная тема |
| ------------------ | ------------ | ----------- |
| `--background`     | `#ffffff`    | `#1e2535`   |
| `--card`           | `#ffffff`    | `#253047`   |
| `--popover`        | `#ffffff`    | `#253047`   |
| `--input` (border) | `#e2e8f0`    | `#2d3c56`   |
| `--muted`          | `#f1f5f9`    | `#2d3c56`   |

> [!IMPORTANT]
> Radix UI-компоненты рендерятся в Portal (вне DOM-дерева родителя). Для фона используйте прямую ссылку `bg-[var(--popover)]` вместо утилита `bg-popover`, чтобы гарантировать корректное разрешение CSS-переменной.

---

## Слияние классов

Для композиции классов — утилита `cn` из `src/lib/utils.ts`:

```tsx
import { cn } from "@/lib/utils"
// ...
className={cn("base-class", condition && "conditional-class", className)}
```

---

## Компоненты

Все компоненты в `src/components/ui/`. Все построены на shadcn/cva паттерне.

### Button

```tsx
import { Button } from "@/components/ui/Button"

<Button variant="default">Сохранить</Button>
<Button variant="outline" size="sm">Отмена</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
<Button href="/path">Ссылка-кнопка</Button>
<Button variant="static" size="xl" href="/calendar">Hero-кнопка</Button>
```

**Варианты:** `default` | `outline` | `ghost` | `link` | `static`  
**Размеры:** `sm` | `default` | `md` | `lg` | `xl` | `icon`  
**Доп. пропы:** `href` (рендерит как `<a>`), `asChild` (Radix Slot)

| Размер    | Высота | Padding   | Текст   | Применение              |
| --------- | ------ | --------- | ------- | ----------------------- |
| `sm`      | h-7    | px-3      | text-sm | Компактные действия     |
| `default` | h-10   | px-4 py-2 | text-sm | Стандартная кнопка      |
| `md`      | h-8    | px-5      | text-md | Крупнее sm              |
| `lg`      | h-10   | px-7      | text-lg | Акцентные CTA           |
| `xl`      | h-12   | px-9      | text-xl | Hero / над изображением |
| `icon`    | h-10   | —         | —       | Только иконка           |

> [!NOTE]
> **Вариант `static`** — outline-кнопка с жёстко заданным белым бордером (`border-2 border-white`) и тёмным текстом (`text-gray-900`), которая **не меняется** в зависимости от активной темы. Используйте поверх изображений (hero-секция) или фиксированных тёмных фонов.

> [!IMPORTANT]
> Варианты `primary`, `destructive`, `secondary` **удалены**. Используйте `default`. Проп `tooltip` → нативный `title`. Проп `isIcon` → `size="icon"`.

---

### Input

```tsx
import { Input } from "@/components/ui/Input"

<Input placeholder="Текст..." />
<Input label="Email" type="email" helperText="Подсказка" />
<Input label="Пароль" error="Минимум 8 символов" />
<Input disabled />
```

**Удобные пропы:** `label`, `error`, `helperText` — встроенная обёртка с Label.  
Фон: `bg-background` — берётся из CSS-переменной темы.

---

### Card (Compound Components)

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"

<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Подзаголовок</CardDescription>
  </CardHeader>
  <CardContent>Контент</CardContent>
  <CardFooter className="justify-end gap-2">
    <Button variant="outline">Отмена</Button>
    <Button>Сохранить</Button>
  </CardFooter>
</Card>

// Без внутренних отступов (для full-bleed контента):
<Card noPadding>...</Card>
```

---

### Switch

```tsx
import { Switch } from "@/components/ui/Switch"

<Switch checked={isOn} onChange={(v) => setIsOn(v)} />
<Switch checked={isOn} onChange={(v) => setIsOn(v)} disabled />
```

Построен на `@radix-ui/react-switch`. Использует `data-[state=checked]` для стилизации.

> [!IMPORTANT]
> Prop `onChange` принимает `(checked: boolean) => void`. Не передавайте `setStateFunction` напрямую — оборачивайте в стрелочную функцию: `onChange={(v) => setState(v)}`.

---

### Select (Radix)

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
;<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Выберите..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Вариант A</SelectItem>
    <SelectItem value="b">Вариант B</SelectItem>
  </SelectContent>
</Select>
```

> [!CAUTION]
> **Не передавайте** `className="bg-white ..."` в `SelectContent` — это перебьёт тему. Не указывайте `className` вообще, если не нужна специфическая кастомизация.

---

### Dialog (Radix)

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
;<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Заголовок</DialogTitle>
    </DialogHeader>
    <div>Контент</div>
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Отмена
      </Button>
      <Button>Подтвердить</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

На мобильных автоматически становится bottom sheet (`max-sm:bottom-0 max-sm:rounded-t-xl`).

---

### Прочие Radix компоненты

`Popover`, `HoverCard`, `Checkbox`, `RadioGroup`, `Label`, `Badge` — стандартные shadcn реализации. Документация: [ui.shadcn.com](https://ui.shadcn.com).

---

## Правила для AI-агента

1. **Никогда не использовать** `dark:bg-gray-*` напрямую в компонентах — только CSS-токены (`bg-[var(--card)]`, `text-muted-foreground` и т.д.)
2. **Portal-компоненты** (Select, Popover, Dialog, HoverCard) — использовать `bg-[var(--...)]` вместо Tailwind-утилит для цветов фона
3. **Button** — только варианты `default`, `outline`, `ghost`, `link`, `static`
4. **Switch.onChange** — всегда оборачивать в `(v) => fn(v)`
5. **SelectContent** — не передавать `className` с цветами, тема применяется автоматически
6. **Иконки** — только из `lucide-react`
7. **Новые компоненты** — использовать `cn()`, `forwardRef`, `cva` по shadcn-паттерну
