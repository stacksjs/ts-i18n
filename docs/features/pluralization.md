# Pluralization

ts-i18n provides flexible pluralization support for handling singular, plural, and special numeric cases across different languages.

## Basic Pluralization

### Simple Singular/Plural

```typescript
// lang/en/items.ts
export default {
  count: (params: { count: number }) => {
    if (params.count === 1) return '1 item'
    return `${params.count} items`
  }
}
```

Usage:

```typescript
t('items.count', { count: 0 })   // "0 items"
t('items.count', { count: 1 })   // "1 item"
t('items.count', { count: 5 })   // "5 items"
```

### YAML with Pluralization Keys

```yaml
# lang/en/messages.yml
items:
  zero: No items
  one: 1 item
  other: "{count} items"

messages:
  zero: No new messages
  one: 1 new message
  few: "{count} new messages"
  other: "{count} new messages"
```

## CLDR Plural Rules

ts-i18n supports CLDR plural categories for proper internationalization:

| Category | Description | Example (English) |
|----------|-------------|-------------------|
| `zero` | Zero items | "No items" |
| `one` | Singular | "1 item" |
| `two` | Dual (some languages) | "2 items" |
| `few` | Few items (some languages) | "3 items" |
| `many` | Many items (some languages) | "1,000,000 items" |
| `other` | Default/plural | "5 items" |

### Language-Specific Examples

#### English (simple)

```typescript
// lang/en/cart.ts
export default {
  items: (params: { count: number }) => {
    if (params.count === 0) return 'Your cart is empty'
    if (params.count === 1) return '1 item in cart'
    return `${params.count} items in cart`
  }
}
```

#### Russian (complex plurals)

```typescript
// lang/ru/cart.ts
export default {
  // Russian has complex plural rules:
  // 1 - singular
  // 2-4 - few
  // 5-20 - many
  // 21 - singular again, etc.
  items: (params: { count: number }) => {
    const n = params.count
    const mod10 = n % 10
    const mod100 = n % 100

    if (mod10 === 1 && mod100 !== 11) {
      return `${n} товар`  // singular
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return `${n} товара`  // few
    }
    return `${n} товаров`  // many
  }
}
```

#### Arabic (dual and complex plurals)

```typescript
// lang/ar/items.ts
export default {
  count: (params: { count: number }) => {
    const n = params.count
    if (n === 0) return 'لا عناصر'      // zero
    if (n === 1) return 'عنصر واحد'      // one
    if (n === 2) return 'عنصران'         // two (dual)
    if (n >= 3 && n <= 10) return `${n} عناصر`  // few
    return `${n} عنصرًا`                 // many/other
  }
}
```

## Plural Helper Functions

ts-i18n provides helper functions for common plural patterns:

```typescript
import { plural, pluralRules } from 'ts-i18n'

// Using the plural helper
const itemCount = plural(count, {
  zero: 'No items',
  one: '1 item',
  other: `${count} items`
})

// Get the CLDR plural category for a locale
const category = pluralRules('en').select(5)  // 'other'
const ruCategory = pluralRules('ru').select(5)  // 'many'
```

### Creating Reusable Plural Functions

```typescript
// utils/plurals.ts
import { pluralRules } from 'ts-i18n'

export function createPluralizer(locale: string) {
  const rules = pluralRules(locale)

  return function pluralize<T>(
    count: number,
    forms: Partial<Record<'zero' | 'one' | 'two' | 'few' | 'many' | 'other', T>>
  ): T {
    const category = rules.select(count)
    return forms[category] ?? forms.other!
  }
}

// Usage
const enPlural = createPluralizer('en')
const ruPlural = createPluralizer('ru')

enPlural(5, { one: '1 item', other: `${5} items` })  // "5 items"
ruPlural(5, { one: 'товар', few: 'товара', many: 'товаров' })  // "товаров"
```

## Ordinal Pluralization

Handle ordinal numbers (1st, 2nd, 3rd, etc.):

```typescript
// lang/en/ordinals.ts
export default {
  position: (params: { n: number }) => {
    const n = params.n
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
  },

  place: (params: { position: number }) => {
    const ordinal = getOrdinal(params.position)
    if (params.position === 1) return `${ordinal} place - Gold!`
    if (params.position === 2) return `${ordinal} place - Silver!`
    if (params.position === 3) return `${ordinal} place - Bronze!`
    return `${ordinal} place`
  }
}
```

## Range Pluralization

Handle ranges of items:

```typescript
// lang/en/range.ts
export default {
  itemRange: (params: { min: number; max: number }) => {
    if (params.min === params.max) {
      return params.min === 1 ? '1 item' : `${params.min} items`
    }
    return `${params.min}-${params.max} items`
  },

  priceRange: (params: { min: number; max: number }) => {
    if (params.min === params.max) {
      return `$${params.min.toFixed(2)}`
    }
    return `$${params.min.toFixed(2)} - $${params.max.toFixed(2)}`
  }
}
```

## Best Practices

### 1. Always Include 'other'

The `other` category is the fallback and should always be provided:

```typescript
// Good
count: (n) => {
  if (n === 0) return 'None'
  if (n === 1) return 'One'
  return `${n} items`  // 'other' fallback
}

// Bad - no fallback
count: (n) => {
  if (n === 0) return 'None'
  if (n === 1) return 'One'
  // What happens with n = 5?
}
```

### 2. Handle Zero Explicitly

Many languages treat zero specially:

```typescript
items: (params: { count: number }) => {
  if (params.count === 0) return 'No items found'
  // ... rest of plural logic
}
```

### 3. Test with Edge Cases

Test your pluralization with:
- 0, 1, 2
- 5, 11, 12, 21, 22
- 100, 101, 111
- Large numbers (1000000)

### 4. Use Native APIs When Possible

For simple cases, use JavaScript's `Intl.PluralRules`:

```typescript
const rules = new Intl.PluralRules('en-US')
rules.select(0)   // 'other'
rules.select(1)   // 'one'
rules.select(2)   // 'other'
```
