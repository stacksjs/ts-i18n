# Pluralization

ts-i18n supports pluralization through dynamic translations with functions, giving you full control over how plurals are handled in each language.

## Basic Pluralization

Use dynamic translations with conditional logic for pluralization:

```typescript
// locales/en/index.ts
import type { Dictionary } from 'ts-i18n'

export default {
  items: {
    count: ({ count }: { count: number }) => {
      if (count === 0) return 'No items'
      if (count === 1) return '1 item'
      return `${count} items`
    }
  },

  messages: {
    unread: ({ count }: { count: number }) => {
      if (count === 0) return 'No unread messages'
      if (count === 1) return 'You have 1 unread message'
      return `You have ${count} unread messages`
    }
  }
} satisfies Dictionary
```

Usage:

```typescript
const t = createTranslator(translations, { defaultLocale: 'en' })

t('items.count', { count: 0 })   // "No items"
t('items.count', { count: 1 })   // "1 item"
t('items.count', { count: 5 })   // "5 items"
t('items.count', { count: 100 }) // "100 items"
```

## Multi-Language Pluralization

Different languages have different pluralization rules. Handle them in each locale:

### English (2 forms: singular, plural)

```typescript
// locales/en/index.ts
export default {
  cart: {
    items: ({ count }: { count: number }) =>
      count === 1 ? '1 item in cart' : `${count} items in cart`
  }
}
```

### Russian (3 forms: one, few, many)

```typescript
// locales/ru/index.ts
export default {
  cart: {
    items: ({ count }: { count: number }) => {
      const lastDigit = count % 10
      const lastTwoDigits = count % 100

      // Special cases for 11-14
      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} товаров в корзине`
      }

      // One (1, 21, 31, ...)
      if (lastDigit === 1) {
        return `${count} товар в корзине`
      }

      // Few (2-4, 22-24, 32-34, ...)
      if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} товара в корзине`
      }

      // Many (0, 5-20, 25-30, ...)
      return `${count} товаров в корзине`
    }
  }
}
```

### Arabic (6 forms)

```typescript
// locales/ar/index.ts
export default {
  files: {
    count: ({ count }: { count: number }) => {
      if (count === 0) return 'لا ملفات'
      if (count === 1) return 'ملف واحد'
      if (count === 2) return 'ملفان'
      if (count >= 3 && count <= 10) return `${count} ملفات`
      return `${count} ملف`
    }
  }
}
```

## Pluralization Helper Functions

Create reusable pluralization helpers:

```typescript
// utils/pluralize.ts

// English pluralization
export function pluralizeEn(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

// Russian pluralization
export function pluralizeRu(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return many
  if (lastDigit === 1) return one
  if (lastDigit >= 2 && lastDigit <= 4) return few
  return many
}

// Polish pluralization
export function pluralizePl(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  if (count === 1) return one
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
    return few
  }
  return many
}
```

Using helpers in translations:

```typescript
// locales/en/index.ts
import { pluralizeEn } from '../../utils/pluralize'

export default {
  notifications: {
    count: ({ count }: { count: number }) =>
      `${count} ${pluralizeEn(count, 'notification', 'notifications')}`
  }
}

// locales/ru/index.ts
import { pluralizeRu } from '../../utils/pluralize'

export default {
  notifications: {
    count: ({ count }: { count: number }) =>
      `${count} ${pluralizeRu(count, 'уведомление', 'уведомления', 'уведомлений')}`
  }
}
```

## Ordinal Numbers

Handle ordinal numbers (1st, 2nd, 3rd, etc.):

```typescript
// locales/en/index.ts
export default {
  ranking: {
    position: ({ position }: { position: number }) => {
      const lastDigit = position % 10
      const lastTwoDigits = position % 100

      if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return `${position}th place`
      }

      switch (lastDigit) {
        case 1: return `${position}st place`
        case 2: return `${position}nd place`
        case 3: return `${position}rd place`
        default: return `${position}th place`
      }
    }
  }
}
```

## Complex Pluralization Scenarios

### Multiple Values

```typescript
export default {
  summary: {
    filesAndFolders: ({
      files,
      folders
    }: { files: number; folders: number }) => {
      const fileStr = files === 1 ? '1 file' : `${files} files`
      const folderStr = folders === 1 ? '1 folder' : `${folders} folders`
      return `${fileStr} and ${folderStr}`
    }
  }
}

// Usage
t('summary.filesAndFolders', { files: 3, folders: 1 })
// "3 files and 1 folder"
```

### Time Durations

```typescript
export default {
  duration: {
    relative: ({ hours, minutes }: { hours: number; minutes: number }) => {
      const parts: string[] = []

      if (hours > 0) {
        parts.push(hours === 1 ? '1 hour' : `${hours} hours`)
      }

      if (minutes > 0) {
        parts.push(minutes === 1 ? '1 minute' : `${minutes} minutes`)
      }

      return parts.length > 0 ? parts.join(' and ') : 'less than a minute'
    }
  }
}

// Usage
t('duration.relative', { hours: 2, minutes: 30 })
// "2 hours and 30 minutes"
```

### Conditional Messaging

```typescript
export default {
  cart: {
    status: ({ count, total }: { count: number; total: number }) => {
      if (count === 0) {
        return 'Your cart is empty'
      }

      const itemText = count === 1 ? '1 item' : `${count} items`
      return `${itemText} in your cart ($${total.toFixed(2)})`
    }
  }
}
```

## Using with Intl.PluralRules

For standards-compliant pluralization, use the built-in `Intl.PluralRules`:

```typescript
// utils/intlPluralize.ts

type PluralForms = {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

export function createPluralizer(locale: string) {
  const pluralRules = new Intl.PluralRules(locale)

  return function pluralize(count: number, forms: PluralForms): string {
    const rule = pluralRules.select(count)
    return forms[rule] ?? forms.other
  }
}
```

Using in translations:

```typescript
// locales/en/index.ts
import { createPluralizer } from '../../utils/intlPluralize'

const pluralize = createPluralizer('en')

export default {
  items: {
    count: ({ count }: { count: number }) =>
      pluralize(count, {
        one: `${count} item`,
        other: `${count} items`
      })
  }
}

// locales/ar/index.ts
import { createPluralizer } from '../../utils/intlPluralize'

const pluralize = createPluralizer('ar')

export default {
  items: {
    count: ({ count }: { count: number }) =>
      pluralize(count, {
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: `${count} عناصر`,
        many: `${count} عنصراً`,
        other: `${count} عنصر`
      })
  }
}
```

## Best Practices

### 1. Always Handle Zero

```typescript
// Good: Handles zero case
const good = {
  results: ({ count }: { count: number }) => {
    if (count === 0) return 'No results found'
    return count === 1 ? '1 result found' : `${count} results found`
  }
}
```

### 2. Use Descriptive Keys

```typescript
// Good: Clear what's being pluralized
const good = {
  users: {
    activeCount: ({ count }: { count: number }) => /* ... */,
    onlineCount: ({ count }: { count: number }) => /* ... */
  }
}
```

### 3. Keep Logic Simple

```typescript
// Good: Simple, readable logic
const simple = {
  items: ({ n }: { n: number }) => n === 1 ? '1 item' : `${n} items`
}

// Avoid: Complex nested conditions
const complex = {
  items: ({ n }: { n: number }) =>
    n === 0 ? 'none' : n === 1 ? 'one' : n < 5 ? 'few' : n < 10 ? 'some' : 'many'
}
```

### 4. Test All Cases

```typescript
// Test pluralization in multiple scenarios
test('pluralization', () => {
  expect(t('items.count', { count: 0 })).toBe('No items')
  expect(t('items.count', { count: 1 })).toBe('1 item')
  expect(t('items.count', { count: 2 })).toBe('2 items')
  expect(t('items.count', { count: 100 })).toBe('100 items')
})
```
