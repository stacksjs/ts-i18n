# Dynamic Messages and Parameters

Dynamic messages are TypeScript functions within your translation files that accept parameters and return computed strings. This powerful feature enables complex localization scenarios including pluralization, formatting, conditional logic, and context-aware translations.

## Basic Dynamic Messages

### Simple Parameter Interpolation

```typescript
// locales/en/messages.ts
import type { Dictionary } from 'ts-i18n'

export default {
  greetings: {
    welcome: ({ name }: { name: string }) =>
      `Welcome back, ${name}!`,

    newUser: ({ name, company }: { name: string; company: string }) =>
      `Hello ${name}, welcome to ${company}!`,

    timeBasedGreeting: ({ name, hour }: { name: string; hour: number }) => {
      if (hour < 12) return `Good morning, ${name}!`
      if (hour < 17) return `Good afternoon, ${name}!`
      return `Good evening, ${name}!`
    }
  },

  notifications: {
    taskDue: ({ task, hours }: { task: string; hours: number }) => {
      if (hours <= 0) return `"${task}" is overdue!`
      if (hours === 1) return `"${task}" is due in 1 hour`
      return `"${task}" is due in ${hours} hours`
    }
  }
} satisfies Dictionary
```

### Usage with Type Safety

```typescript
import { createTranslator } from 'ts-i18n'

const t = createTranslator(translations, { defaultLocale: 'en' })

// Simple parameter usage
console.log(t('greetings.welcome', { name: 'Chris' }))
// Output: "Welcome back, Chris!"

// Multiple parameters
console.log(t('greetings.newUser', { name: 'Avery', company: 'TeamFlow' }))
// Output: "Hello Avery, welcome to TeamFlow!"

// Conditional logic
console.log(t('greetings.timeBasedGreeting', { name: 'Buddy', hour: 14 }))
// Output: "Good afternoon, Buddy!"

// Dynamic pluralization
console.log(t('notifications.taskDue', { task: 'Review PR', hours: 0 }))
// Output: "Review PR" is overdue!
```

## Advanced Dynamic Patterns

### Complex Type-Safe Parameters

```typescript
// locales/en/advanced.ts
import type { Dictionary } from 'ts-i18n'

type UserRole = 'admin' | 'editor' | 'viewer'
type Priority = 'low' | 'medium' | 'high' | 'critical'
type Status = 'pending' | 'in-progress' | 'completed' | 'blocked'

export default {
  teamManagement: {
    userJoined: ({ user, role }: { user: string; role: UserRole }) => {
      const roleLabels = {
        admin: 'an administrator',
        editor: 'an editor',
        viewer: 'a viewer'
      }
      return `${user} joined the team as ${roleLabels[role]}`
    },

    roleChanged: ({ user, oldRole, newRole }: {
      user: string;
      oldRole: UserRole;
      newRole: UserRole
    }) => `${user}'s role changed from ${oldRole} to ${newRole}`,

    permissionGranted: ({ user, permission, grantor }: {
      user: string
      permission: string
      grantor: string
    }) => `${grantor} granted "${permission}" permission to ${user}`
  },

  projectManagement: {
    taskStatusUpdate: ({ task, status, assignee }: {
      task: string
      status: Status
      assignee: string
    }) => {
      const statusMessages = {
        pending: `"${task}" is waiting to be started by ${assignee}`,
        'in-progress': `${assignee} is working on "${task}"`,
        completed: `${assignee} completed "${task}"`,
        blocked: `"${task}" is blocked and needs attention from ${assignee}`
      }
      return statusMessages[status]
    },

    priorityAlert: ({ task, priority, deadline }: {
      task: string
      priority: Priority
      deadline: Date
    }) => {
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (priority === 'critical') {
        return `🚨 CRITICAL: "${task}" due in ${daysUntilDeadline} days`
      }
      if (priority === 'high' && daysUntilDeadline <= 3) {
        return `⚠️ HIGH PRIORITY: "${task}" due soon (${daysUntilDeadline} days)`
      }
      if (priority === 'medium' && daysUntilDeadline <= 1) {
        return `📋 "${task}" due ${daysUntilDeadline === 0 ? 'today' : 'tomorrow'}`
      }
      return `📝 "${task}" due in ${daysUntilDeadline} days`
    }
  }
} satisfies Dictionary
```

### Internationalization-Aware Formatting

```typescript
// locales/en/formatters.ts
export default {
  numbers: {
    currency: ({ amount, currency = 'USD', locale = 'en-US' }: {
      amount: number
      currency?: string
      locale?: string
    }) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
      }).format(amount)
    },

    percentage: ({ value, decimals = 1, locale = 'en-US' }: {
      value: number
      decimals?: number
      locale?: string
    }) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100)
    },

    largeNumbers: ({ value, locale = 'en-US' }: {
      value: number
      locale?: string
    }) => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return new Intl.NumberFormat(locale).format(value)
    }
  },

  dates: {
    relative: ({ date, locale = 'en-US' }: {
      date: Date
      locale?: string
    }) => {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      const now = new Date()
      const diffInMs = date.getTime() - now.getTime()
      const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))

      if (Math.abs(diffInDays) < 1) {
        const diffInHours = Math.round(diffInMs / (1000 * 60 * 60))
        if (Math.abs(diffInHours) < 1) {
          const diffInMinutes = Math.round(diffInMs / (1000 * 60))
          return rtf.format(diffInMinutes, 'minute')
        }
        return rtf.format(diffInHours, 'hour')
      }

      return rtf.format(diffInDays, 'day')
    },

    duration: ({ start, end }: { start: Date; end: Date }) => {
      const diffInMs = end.getTime() - start.getTime()
      const hours = Math.floor(diffInMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
      }
      return `${minutes}m`
    }
  },

  text: {
    truncate: ({ text, length, suffix = '...' }: {
      text: string
      length: number
      suffix?: string
    }) => {
      if (text.length <= length) return text
      return text.slice(0, length - suffix.length) + suffix
    },

    pluralize: ({ count, singular, plural }: {
      count: number
      singular: string
      plural?: string
    }) => {
      if (count === 1) return `${count} ${singular}`
      return `${count} ${plural || `${singular}s`}`
    },

    capitalizeWords: ({ text }: { text: string }) => {
      return text.replace(/\b\w/g, char => char.toUpperCase())
    }
  }
} satisfies Dictionary
```

## Multi-Locale Dynamic Messages

### Language-Specific Logic

```typescript
// locales/en/pluralization.ts
export default {
  items: ({ count, item }: { count: number; item: string }) => {
    // English pluralization rules
    if (count === 1) return `${count} ${item}`
    return `${count} ${item}s`
  },

  people: ({ count }: { count: number }) => {
    // English people counting
    if (count === 0) return 'No people'
    if (count === 1) return '1 person'
    return `${count} people`
  }
} satisfies Dictionary

// locales/es/pluralization.ts
export default {
  items: ({ count, item }: { count: number; item: string }) => {
    // Spanish pluralization rules - more complex
    if (count === 1) return `${count} ${item}`

    // Handle Spanish irregular plurals
    const irregularPlurals = {
      'tarea': 'tareas',
      'proyecto': 'proyectos',
      'usuario': 'usuarios'
    }

    const plural = irregularPlurals[item] || `${item}s`
    return `${count} ${plural}`
  },

  people: ({ count }: { count: number }) => {
    // Spanish people counting with gender considerations
    if (count === 0) return 'Ninguna persona'
    if (count === 1) return '1 persona'
    return `${count} personas`
  }
} satisfies Dictionary

// locales/pl/pluralization.ts
export default {
  items: ({ count, item }: { count: number; item: string }) => {
    // Polish has complex pluralization rules
    const mod10 = count % 10
    const mod100 = count % 100

    if (count === 1) return `${count} ${item}`

    // Polish plural forms depend on the number
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return `${count} ${item}y` // Few form
    }

    return `${count} ${item}ów` // Many form
  }
} satisfies Dictionary
```

## Runtime Behavior

### Function Execution

```typescript
// Dynamic messages are executed at translation time
const t = createTranslator(translations, { defaultLocale: 'en' })

// Function is called with parameters
const result = t('formatters.numbers.currency', {
  amount: 1234.56,
  currency: 'EUR',
  locale: 'de-DE'
})
console.log(result) // "1.234,56 €"

// Without parameters (if function accepts optional params)
const greeting = t('greetings.timeBasedGreeting', {
  name: 'Chris',
  hour: new Date().getHours()
})
console.log(greeting) // Time-appropriate greeting
```

### JSON Output Handling

```typescript
import { writeOutputs } from 'ts-i18n'

// When generating JSON outputs, functions are stripped
await writeOutputs(translations, 'dist/i18n')

// Generated JSON files contain only static values:
// dist/i18n/en.json:
// {
//   "static": {
//     "title": "Welcome"
//   }
//   // Dynamic functions are omitted
// }
```

## Best Practices

### 1. **Keep Functions Pure and Deterministic**

```typescript
// ✅ Good: Pure function with predictable output
timeAgo: ({ date }: { date: Date }) => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  return `${diffInHours}h ago`
}

// ❌ Avoid: Functions with side effects
logger: ({ message }: { message: string }) => {
  console.log(message) // Side effect!
  return message
}
```

### 2. **Use Comprehensive Type Definitions**

```typescript
// ✅ Good: Detailed parameter types
taskUpdate: ({
  task,
  assignee,
  status,
  dueDate,
  priority = 'medium'
}: {
  task: string
  assignee: { name: string; role: UserRole }
  status: TaskStatus
  dueDate: Date
  priority?: Priority
}) => {
  // Implementation with full type safety
}

// ❌ Avoid: Loose typing
taskUpdate: (params: any) => {
  // No type safety
}
```

### 3. **Handle Edge Cases Gracefully**

```typescript
// ✅ Good: Defensive programming
formatFileSize: ({ bytes }: { bytes: number }) => {
  if (typeof bytes !== 'number' || bytes < 0) {
    return 'Unknown size'
  }

  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, unitIndex)).toFixed(1)

  return `${size} ${units[unitIndex] || 'XB'}`
}
```

### 4. **Consider Performance for Frequently Called Functions**

```typescript
// ✅ Good: Cache expensive operations
const formatters = new Map()

dateFormatter: ({ date, locale = 'en-US' }: { date: Date; locale?: string }) => {
  const key = locale
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }

  return formatters.get(key).format(date)
}
```

### 5. **Test Dynamic Functions Thoroughly**

```typescript
// test/dynamic-messages.test.ts
import { translations } from '../locales/en/formatters'

describe('Dynamic Message Functions', () => {
  test('currency formatting handles edge cases', () => {
    const formatter = translations.numbers.currency

    expect(formatter({ amount: 0 })).toBe('$0.00')
    expect(formatter({ amount: 1234.56, currency: 'EUR', locale: 'de-DE' }))
      .toBe('1.234,56 €')
    expect(formatter({ amount: -100 })).toBe('-$100.00')
  })

  test('pluralization works correctly', () => {
    const pluralize = translations.text.pluralize

    expect(pluralize({ count: 0, singular: 'item' })).toBe('0 items')
    expect(pluralize({ count: 1, singular: 'item' })).toBe('1 item')
    expect(pluralize({ count: 5, singular: 'item' })).toBe('5 items')
    expect(pluralize({ count: 2, singular: 'person', plural: 'people' }))
      .toBe('2 people')
  })
})
```

Dynamic messages provide the flexibility to handle complex translation scenarios while maintaining type safety and performance. They're essential for building truly internationalized applications that feel native to users in different locales.
