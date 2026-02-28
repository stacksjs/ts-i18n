# Date & Number Formatting

ts-i18n provides locale-aware formatting for dates, numbers, currencies, and relative time through integration with JavaScript's `Intl` APIs.

## Date Formatting

### Basic Date Formatting

```typescript
// lang/en/dates.ts
export default {
  today: (params: { date: Date }) =>
    params.date.toLocaleDateString('en-US'),

  fullDate: (params: { date: Date }) =>
    params.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),

  shortDate: (params: { date: Date }) =>
    params.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
}
```

Usage:

```typescript
const date = new Date('2024-12-25')

t('dates.today', { date })     // "12/25/2024"
t('dates.fullDate', { date })  // "Wednesday, December 25, 2024"
t('dates.shortDate', { date }) // "Dec 25"
```

### Locale-Aware Dates

Create locale-specific date formatters:

```typescript
// lang/de/dates.ts
export default {
  fullDate: (params: { date: Date }) =>
    params.date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
}

// Usage with German locale
t('dates.fullDate', { date })  // "Mittwoch, 25. Dezember 2024"
```

### Date Format Presets

```typescript
// utils/dateFormats.ts
export const dateFormats = {
  short: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  },
  medium: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  full: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
} as const

// lang/en/dates.ts
import { dateFormats } from '../utils/dateFormats'

export default {
  short: (params: { date: Date }) =>
    params.date.toLocaleDateString('en-US', dateFormats.short),
  medium: (params: { date: Date }) =>
    params.date.toLocaleDateString('en-US', dateFormats.medium),
  long: (params: { date: Date }) =>
    params.date.toLocaleDateString('en-US', dateFormats.long),
  full: (params: { date: Date }) =>
    params.date.toLocaleDateString('en-US', dateFormats.full)
}
```

## Time Formatting

### Basic Time Formatting

```typescript
// lang/en/times.ts
export default {
  time: (params: { date: Date }) =>
    params.date.toLocaleTimeString('en-US'),

  time12h: (params: { date: Date }) =>
    params.date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),

  time24h: (params: { date: Date }) =>
    params.date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
}
```

### DateTime Combined

```typescript
export default {
  datetime: (params: { date: Date }) =>
    params.date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
}

// Result: "Dec 25, 2024, 02:30 PM"
```

## Relative Time

### Using Intl.RelativeTimeFormat

```typescript
// lang/en/relative.ts
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export default {
  relative: (params: { date: Date }) => {
    const now = new Date()
    const diff = params.date.getTime() - now.getTime()
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24))

    if (Math.abs(diffDays) < 1) {
      const diffHours = Math.round(diff / (1000 * 60 * 60))
      if (Math.abs(diffHours) < 1) {
        const diffMinutes = Math.round(diff / (1000 * 60))
        return rtf.format(diffMinutes, 'minute')
      }
      return rtf.format(diffHours, 'hour')
    }
    if (Math.abs(diffDays) < 7) {
      return rtf.format(diffDays, 'day')
    }
    if (Math.abs(diffDays) < 30) {
      return rtf.format(Math.round(diffDays / 7), 'week')
    }
    if (Math.abs(diffDays) < 365) {
      return rtf.format(Math.round(diffDays / 30), 'month')
    }
    return rtf.format(Math.round(diffDays / 365), 'year')
  }
}

// Results:
// "in 5 minutes"
// "3 hours ago"
// "yesterday"
// "in 2 weeks"
// "3 months ago"
```

## Number Formatting

### Basic Number Formatting

```typescript
// lang/en/numbers.ts
export default {
  number: (params: { value: number }) =>
    params.value.toLocaleString('en-US'),

  decimal: (params: { value: number; decimals?: number }) =>
    params.value.toLocaleString('en-US', {
      minimumFractionDigits: params.decimals ?? 2,
      maximumFractionDigits: params.decimals ?? 2
    }),

  compact: (params: { value: number }) =>
    params.value.toLocaleString('en-US', {
      notation: 'compact',
      compactDisplay: 'short'
    })
}

// Usage:
t('numbers.number', { value: 1234567 })        // "1,234,567"
t('numbers.decimal', { value: 1234.5 })        // "1,234.50"
t('numbers.compact', { value: 1234567 })       // "1.2M"
```

### Percentages

```typescript
export default {
  percent: (params: { value: number }) =>
    (params.value / 100).toLocaleString('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }),

  percentChange: (params: { value: number }) => {
    const sign = params.value >= 0 ? '+' : ''
    return `${sign}${(params.value / 100).toLocaleString('en-US', {
      style: 'percent',
      minimumFractionDigits: 1
    })}`
  }
}

// Usage:
t('numbers.percent', { value: 75 })         // "75%"
t('numbers.percent', { value: 33.33 })      // "33.33%"
t('numbers.percentChange', { value: 12.5 }) // "+12.5%"
t('numbers.percentChange', { value: -5 })   // "-5.0%"
```

## Currency Formatting

### Basic Currency

```typescript
// lang/en/currency.ts
export default {
  price: (params: { amount: number; currency?: string }) =>
    params.amount.toLocaleString('en-US', {
      style: 'currency',
      currency: params.currency ?? 'USD'
    }),

  priceRange: (params: { min: number; max: number; currency?: string }) => {
    const fmt = (n: number) => n.toLocaleString('en-US', {
      style: 'currency',
      currency: params.currency ?? 'USD'
    })
    return `${fmt(params.min)} - ${fmt(params.max)}`
  }
}

// Usage:
t('currency.price', { amount: 99.99 })                    // "$99.99"
t('currency.price', { amount: 99.99, currency: 'EUR' })   // "EUR 99.99"
t('currency.priceRange', { min: 10, max: 50 })            // "$10.00 - $50.00"
```

### Multi-Currency Support

```typescript
// lang/en/currency.ts
export default {
  format: (params: { amount: number; currency: string; locale?: string }) => {
    const locale = params.locale ?? 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: params.currency
    }).format(params.amount)
  }
}

// Usage:
t('currency.format', { amount: 1234.56, currency: 'USD' }) // "$1,234.56"
t('currency.format', { amount: 1234.56, currency: 'EUR', locale: 'de-DE' }) // "1.234,56 EUR"
t('currency.format', { amount: 1234.56, currency: 'JPY' }) // "JPY 1,235"
```

## Units Formatting

### Using Intl.NumberFormat with Units

```typescript
export default {
  distance: (params: { value: number; unit: 'kilometer' | 'mile' }) =>
    new Intl.NumberFormat('en-US', {
      style: 'unit',
      unit: params.unit,
      unitDisplay: 'long'
    }).format(params.value),

  speed: (params: { value: number }) =>
    new Intl.NumberFormat('en-US', {
      style: 'unit',
      unit: 'kilometer-per-hour',
      unitDisplay: 'short'
    }).format(params.value),

  fileSize: (params: { bytes: number }) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = params.bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
  }
}

// Usage:
t('units.distance', { value: 5, unit: 'kilometer' }) // "5 kilometers"
t('units.speed', { value: 120 })                      // "120 km/h"
t('units.fileSize', { bytes: 1536000 })               // "1.5 MB"
```

## Best Practices

### 1. Centralize Format Options

```typescript
// utils/formats.ts
export const formats = {
  date: {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  number: {
    decimal: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    integer: { maximumFractionDigits: 0 }
  },
  currency: {
    standard: { style: 'currency', currency: 'USD' }
  }
}
```

### 2. Handle Missing Intl Support

```typescript
function formatDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions): string {
  try {
    return date.toLocaleDateString(locale, options)
  } catch {
    // Fallback for older environments
    return date.toISOString().split('T')[0]
  }
}
```

### 3. Cache Formatters

```typescript
const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}-${JSON.stringify(options)}`
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.NumberFormat(locale, options))
  }
  return formatters.get(key)!
}
```
