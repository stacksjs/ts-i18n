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

## Advanced Dynamic Patterns

### Template-Based Message Systems

```typescript
// locales/en/templates.ts
import type { Dictionary } from 'ts-i18n'

interface EmailTemplate {
  subject: string
  body: string
  cta?: string
}

interface NotificationTemplate {
  title: string
  body: string
  icon?: string
  actions?: Array<{ label: string; action: string }>
}

export default {
  email: {
    welcome: ({ user, company }: { user: { name: string; email: string }; company: string }): EmailTemplate => ({
      subject: `Welcome to ${company}, ${user.name}!`,
      body: `
        Hi ${user.name},

        Welcome to ${company}! We're excited to have you on board.

        Your account (${user.email}) is now active and ready to use.

        Best regards,
        The ${company} Team
      `,
      cta: 'Get Started'
    }),

    passwordReset: ({ user, resetLink, expiryHours = 24 }: {
      user: { name: string }
      resetLink: string
      expiryHours?: number
    }): EmailTemplate => ({
      subject: 'Password Reset Request',
      body: `
        Hi ${user.name},

        You requested a password reset. Click the link below to reset your password:

        ${resetLink}

        This link will expire in ${expiryHours} hours.

        If you didn't request this, please ignore this email.
      `,
      cta: 'Reset Password'
    }),

    invoiceReady: ({ user, invoice, amount, dueDate }: {
      user: { name: string; company?: string }
      invoice: { number: string; period: string }
      amount: { value: number; currency: string }
      dueDate: Date
    }): EmailTemplate => ({
      subject: `Invoice ${invoice.number} is ready`,
      body: `
        Hi ${user.name}${user.company ? ` from ${user.company}` : ''},

        Your invoice for ${invoice.period} is ready.

        Invoice: ${invoice.number}
        Amount: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: amount.currency
        }).format(amount.value)}
        Due Date: ${dueDate.toLocaleDateString()}

        Please process payment by the due date to avoid service interruption.
      `,
      cta: 'View Invoice'
    })
  },

  notifications: {
    taskAssignment: ({ task, assignee, assigner, priority, dueDate }: {
      task: { title: string; description?: string }
      assignee: { name: string }
      assigner: { name: string }
      priority: 'low' | 'medium' | 'high' | 'urgent'
      dueDate?: Date
    }): NotificationTemplate => {
      const priorityEmojis = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        urgent: '🔴'
      }

      return {
        title: `New Task Assignment ${priorityEmojis[priority]}`,
        body: `${assigner.name} assigned "${task.title}" to ${assignee.name}${
          dueDate ? ` (due ${dueDate.toLocaleDateString()})` : ''
        }`,
        icon: 'task',
        actions: [
          { label: 'View Task', action: 'view*task' },
          { label: 'Accept', action: 'accept*task' }
        ]
      }
    },

    projectMilestone: ({ project, milestone, team, completionRate }: {
      project: { name: string }
      milestone: { name: string; description?: string }
      team: Array<{ name: string; role: string }>
      completionRate: number
    }): NotificationTemplate => ({
      title: `🎉 Milestone Achieved!`,
      body: `${project.name}: "${milestone.name}" completed by ${team.length} team members (${Math.round(completionRate * 100)}% project completion)`,
      icon: 'milestone',
      actions: [
        { label: 'View Project', action: 'view*project' },
        { label: 'Celebrate', action: 'celebrate' }
      ]
    })
  },

  alerts: {
    systemStatus: ({ service, status, details, affectedUsers, eta }: {
      service: string
      status: 'operational' | 'degraded' | 'partial*outage' | 'major*outage'
      details: string
      affectedUsers?: number
      eta?: Date
    }) => {
      const statusEmojis = {
        operational: '✅',
        degraded: '⚠️',
        partial*outage: '🟡',
        major*outage: '🔴'
      }

      const statusLabels = {
        operational: 'Operational',
        degraded: 'Performance Issues',
        partial*outage: 'Partial Outage',
        major*outage: 'Major Outage'
      }

      return {
        title: `${statusEmojis[status]} ${service} - ${statusLabels[status]}`,
        body: `
          ${details}
          ${affectedUsers ? `\nAffected users: ~${affectedUsers.toLocaleString()}` : ''}
          ${eta ? `\nEstimated resolution: ${eta.toLocaleString()}` : ''}
        `.trim(),
        icon: 'system',
        actions: status === 'operational'
          ? []
          : [
              { label: 'Status Page', action: 'view*status' },
              { label: 'Subscribe to Updates', action: 'subscribe' }
            ]
      }
    }
  }
} satisfies Dictionary
```

### Context-Aware Translation Functions

```typescript
// locales/en/contextual.ts
import type { Dictionary } from 'ts-i18n'

interface UserContext {
  role: 'admin' | 'editor' | 'viewer' | 'guest'
  plan: 'free' | 'pro' | 'enterprise'
  locale: string
  timezone: string
}

interface FeatureContext {
  available: boolean
  requiresUpgrade?: boolean
  betaAccess?: boolean
}

export default {
  permissions: {
    accessDenied: ({ user, resource, action }: {
      user: UserContext
      resource: string
      action: string
    }) => {
      if (user.role === 'guest') {
        return `Please sign in to ${action} ${resource}`
      }

      if (user.plan === 'free' && action === 'create' && resource === 'project') {
        return `Upgrade to Pro to create more projects`
      }

      return `Your ${user.role} role doesn't have permission to ${action} ${resource}`
    },

    featureUnavailable: ({ feature, user }: {
      feature: { name: string; context: FeatureContext }
      user: UserContext
    }) => {
      if (!feature.context.available) {
        return `${feature.name} is currently unavailable`
      }

      if (feature.context.requiresUpgrade) {
        const requiredPlan = user.plan === 'free' ? 'Pro' : 'Enterprise'
        return `${feature.name} requires ${requiredPlan} plan`
      }

      if (feature.context.betaAccess) {
        return `${feature.name} is in beta. Contact support for access.`
      }

      return `${feature.name} is not available for your account`
    }
  },

  onboarding: {
    stepGuide: ({ step, total, user, context }: {
      step: number
      total: number
      user: UserContext
      context: { feature: string; difficulty: 'beginner' | 'intermediate' | 'advanced' }
    }) => {
      const personalizedIntro = {
        admin: 'As an admin, you have full control.',
        editor: 'As an editor, you can modify content.',
        viewer: 'As a viewer, you can explore and review.',
        guest: 'Welcome! Let\'s get you started.'
      }

      const difficultyIndicator = {
        beginner: '🟢 Easy',
        intermediate: '🟡 Medium',
        advanced: '🔴 Advanced'
      }

      return `
        Step ${step} of ${total}: ${context.feature}

        ${personalizedIntro[user.role]}

        Difficulty: ${difficultyIndicator[context.difficulty]}

        ${step === 1 ? 'Let\'s begin your journey!' : `You're ${Math.round((step / total) * 100)}% through!`}
      `.trim()
    }
  },

  commerce: {
    pricingDisplay: ({ price, user, promotional }: {
      price: { amount: number; currency: string; period?: string }
      user: UserContext
      promotional?: { discount: number; validUntil: Date }
    }) => {
      const formatter = new Intl.NumberFormat(user.locale, {
        style: 'currency',
        currency: price.currency
      })

      let basePrice = formatter.format(price.amount)
      if (price.period) {
        basePrice += ` per ${price.period}`
      }

      if (promotional) {
        const discountedAmount = price.amount * (1 - promotional.discount)
        const discountedPrice = formatter.format(discountedAmount)
        const validUntil = new Intl.DateTimeFormat(user.locale, {
          dateStyle: 'medium',
          timeZone: user.timezone
        }).format(promotional.validUntil)

        return `${discountedPrice} ${price.period ? `per ${price.period}` : ''} (${Math.round(promotional.discount * 100)}% off until ${validUntil})`
      }

      return basePrice
    },

    orderSummary: ({ items, user, shipping, tax, total }: {
      items: Array<{ name: string; quantity: number; price: number }>
      user: UserContext
      shipping?: { method: string; cost: number }
      tax: { rate: number; amount: number }
      total: { amount: number; currency: string }
    }) => {
      const formatter = new Intl.NumberFormat(user.locale, {
        style: 'currency',
        currency: total.currency
      })

      const itemList = items.map(item =>
        `${item.quantity}x ${item.name} - ${formatter.format(item.price * item.quantity)}`
      ).join('\n')

      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      return `
        Order Summary:

        ${itemList}

        Subtotal: ${formatter.format(subtotal)}
        ${shipping ? `Shipping (${shipping.method}): ${formatter.format(shipping.cost)}` : ''}
        Tax (${Math.round(tax.rate * 100)}%): ${formatter.format(tax.amount)}

        Total: ${formatter.format(total.amount)}
      `.trim()
    }
  }
} satisfies Dictionary
```

### Advanced Formatting and Localization

```typescript
// locales/en/advanced-formatting.ts
import type { Dictionary } from 'ts-i18n'

// Create reusable formatters with caching
const formatters = {
  currency: new Map<string, Intl.NumberFormat>(),
  number: new Map<string, Intl.NumberFormat>(),
  date: new Map<string, Intl.DateTimeFormat>(),
  list: new Map<string, Intl.ListFormat>(),
  relative: new Map<string, Intl.RelativeTimeFormat>(),
}

function getCurrencyFormatter(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}-${currency}`
  if (!formatters.currency.has(key)) {
    formatters.currency.set(key, new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }))
  }
  return formatters.currency.get(key)!
}

function getDateFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}-${JSON.stringify(options)}`
  if (!formatters.date.has(key)) {
    formatters.date.set(key, new Intl.DateTimeFormat(locale, options))
  }
  return formatters.date.get(key)!
}

function getListFormatter(locale: string, type: 'conjunction' | 'disjunction'): Intl.ListFormat {
  const key = `${locale}-${type}`
  if (!formatters.list.has(key)) {
    formatters.list.set(key, new Intl.ListFormat(locale, { type }))
  }
  return formatters.list.get(key)!
}

function getRelativeTimeFormatter(locale: string): Intl.RelativeTimeFormat {
  if (!formatters.relative.has(locale)) {
    formatters.relative.set(locale, new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }))
  }
  return formatters.relative.get(locale)!
}

export default {
  financial: {
    portfolioSummary: ({ portfolio, user }: {
      portfolio: {
        totalValue: number
        dayChange: number
        dayChangePercent: number
        positions: Array<{
          symbol: string
          name: string
          shares: number
          currentPrice: number
          change: number
          changePercent: number
        }>
      }
      user: { locale: string; currency: string }
    }) => {
      const currencyFormatter = getCurrencyFormatter(user.locale, user.currency)
      const percentFormatter = new Intl.NumberFormat(user.locale, {
        style: 'percent',
        signDisplay: 'always',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

      const changeDirection = portfolio.dayChange >= 0 ? '🟢' : '🔴'
      const topGainer = portfolio.positions.reduce((prev, current) =>
        current.changePercent > prev.changePercent ? current : prev
      )
      const topLoser = portfolio.positions.reduce((prev, current) =>
        current.changePercent < prev.changePercent ? current : prev
      )

      return `
        Portfolio Summary ${changeDirection}

        Total Value: ${currencyFormatter.format(portfolio.totalValue)}
        Day Change: ${currencyFormatter.format(portfolio.dayChange)} (${percentFormatter.format(portfolio.dayChangePercent / 100)})

        Top Performer: ${topGainer.symbol} ${percentFormatter.format(topGainer.changePercent / 100)}
        ${topGainer.changePercent < 0 ? 'Biggest Decline' : 'Worst Performer'}: ${topLoser.symbol} ${percentFormatter.format(topLoser.changePercent / 100)}

        ${portfolio.positions.length} positions tracked
      `.trim()
    },

    transactionHistory: ({ transactions, user, period }: {
      transactions: Array<{
        type: 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal'
        amount: number
        date: Date
        description: string
      }>
      user: { locale: string; currency: string; timezone: string }
      period: { start: Date; end: Date }
    }) => {
      const currencyFormatter = getCurrencyFormatter(user.locale, user.currency)
      const dateFormatter = getDateFormatter(user.locale, {
        dateStyle: 'medium',
        timeZone: user.timezone
      })

      const totalIn = transactions
        .filter(t => ['buy', 'deposit', 'dividend'].includes(t.type))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const totalOut = transactions
        .filter(t => ['sell', 'withdrawal'].includes(t.type))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const netFlow = totalIn - totalOut

      return `
        Transaction Summary
        ${dateFormatter.format(period.start)} - ${dateFormatter.format(period.end)}

        Money In: ${currencyFormatter.format(totalIn)}
        Money Out: ${currencyFormatter.format(totalOut)}
        Net Flow: ${currencyFormatter.format(netFlow)} ${netFlow >= 0 ? '🟢' : '🔴'}

        ${transactions.length} transactions
      `.trim()
    }
  },

  analytics: {
    performanceReport: ({ metrics, user, comparison }: {
      metrics: {
        pageViews: number
        uniqueVisitors: number
        bounceRate: number
        avgSessionDuration: number
        conversionRate: number
        revenue: number
      }
      user: { locale: string; currency: string }
      comparison: {
        period: 'week' | 'month' | 'quarter' | 'year'
        changes: Record<keyof typeof metrics, number>
      }
    }) => {
      const currencyFormatter = getCurrencyFormatter(user.locale, user.currency)
      const percentFormatter = new Intl.NumberFormat(user.locale, {
        style: 'percent',
        signDisplay: 'always',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })
      const numberFormatter = new Intl.NumberFormat(user.locale)

      const formatChange = (value: number) => {
        const formatted = percentFormatter.format(value / 100)
        return value >= 0 ? `🟢 ${formatted}` : `🔴 ${formatted}`
      }

      const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
      }

      return `
        Performance Report

        📊 Traffic
        Page Views: ${numberFormatter.format(metrics.pageViews)} ${formatChange(comparison.changes.pageViews)}
        Unique Visitors: ${numberFormatter.format(metrics.uniqueVisitors)} ${formatChange(comparison.changes.uniqueVisitors)}

        🎯 Engagement
        Bounce Rate: ${(metrics.bounceRate * 100).toFixed(1)}% ${formatChange(comparison.changes.bounceRate)}
        Avg. Session: ${formatDuration(metrics.avgSessionDuration)} ${formatChange(comparison.changes.avgSessionDuration)}

        💰 Conversions
        Conversion Rate: ${(metrics.conversionRate * 100).toFixed(2)}% ${formatChange(comparison.changes.conversionRate)}
        Revenue: ${currencyFormatter.format(metrics.revenue)} ${formatChange(comparison.changes.revenue)}

        Compared to last ${comparison.period}
      `.trim()
    }
  },

  social: {
    activityFeed: ({ activities, user }: {
      activities: Array<{
        type: 'like' | 'comment' | 'share' | 'follow' | 'post'
        actor: { name: string; avatar?: string }
        target?: { type: string; title: string }
        timestamp: Date
        content?: string
      }>
      user: { locale: string; timezone: string }
    }) => {
      const relativeFormatter = getRelativeTimeFormatter(user.locale)

      const formatActivity = (activity: typeof activities[0]) => {
        const now = new Date()
        const diffInMs = activity.timestamp.getTime() - now.getTime()

        let timeUnit: Intl.RelativeTimeFormatUnit = 'minute'
        let timeValue = Math.round(diffInMs / (1000 * 60))

        if (Math.abs(timeValue) >= 60) {
          timeUnit = 'hour'
          timeValue = Math.round(diffInMs / (1000 * 60 * 60))
        }

        if (Math.abs(timeValue) >= 24) {
          timeUnit = 'day'
          timeValue = Math.round(diffInMs / (1000 * 60 * 60 * 24))
        }

        const relativeTime = relativeFormatter.format(timeValue, timeUnit)

        const actionMap = {
          like: `liked ${activity.target?.title}`,
          comment: `commented on ${activity.target?.title}`,
          share: `shared ${activity.target?.title}`,
          follow: `started following you`,
          post: `created a new post`
        }

        return `${activity.actor.name} ${actionMap[activity.type]} ${relativeTime}`
      }

      return activities.slice(0, 5).map(formatActivity).join('\n')
    },

    engagementSummary: ({ engagement, user }: {
      engagement: {
        likes: number
        comments: number
        shares: number
        followers: number
        reach: number
        impressions: number
      }
      user: { locale: string }
    }) => {
      const numberFormatter = new Intl.NumberFormat(user.locale, { notation: 'compact' })

      const engagementRate = ((engagement.likes + engagement.comments + engagement.shares) / engagement.impressions * 100).toFixed(1)

      return `
        📈 Engagement Summary

        👥 Audience: ${numberFormatter.format(engagement.followers)} followers
        👀 Reach: ${numberFormatter.format(engagement.reach)} people
        📱 Impressions: ${numberFormatter.format(engagement.impressions)}

        💙 Likes: ${numberFormatter.format(engagement.likes)}
        💬 Comments: ${numberFormatter.format(engagement.comments)}
        🔄 Shares: ${numberFormatter.format(engagement.shares)}

        📊 Engagement Rate: ${engagementRate}%
      `.trim()
    }
  },

  communication: {
    meetingInvite: ({ meeting, attendees, user }: {
      meeting: {
        title: string
        start: Date
        end: Date
        location?: string
        agenda?: string[]
        recurring?: { frequency: 'daily' | 'weekly' | 'monthly'; until?: Date }
      }
      attendees: Array<{ name: string; email: string; required: boolean }>
      user: { locale: string; timezone: string }
    }) => {
      const dateFormatter = getDateFormatter(user.locale, {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: user.timezone
      })

      const listFormatter = getListFormatter(user.locale, 'conjunction')

      const duration = (meeting.end.getTime() - meeting.start.getTime()) / (1000 * 60)
      const attendeeNames = attendees.map(a => a.name)
      const requiredAttendees = attendees.filter(a => a.required).length
      const optionalAttendees = attendees.length - requiredAttendees

      return `
        📅 Meeting Invitation

        ${meeting.title}

        🕐 When: ${dateFormatter.format(meeting.start)}
        ⏱️ Duration: ${duration} minutes
        ${meeting.location ? `📍 Where: ${meeting.location}` : ''}
        ${meeting.recurring ? `🔄 Recurring: ${meeting.recurring.frequency}${meeting.recurring.until ? ` until ${dateFormatter.format(meeting.recurring.until)}` : ''}` : ''}

        👥 Attendees (${attendees.length}):
        ${requiredAttendees > 0 ? `Required: ${requiredAttendees}` : ''}
        ${optionalAttendees > 0 ? `Optional: ${optionalAttendees}` : ''}
        ${listFormatter.format(attendeeNames.slice(0, 5))}${attendeeNames.length > 5 ? ` and ${attendeeNames.length - 5} more` : ''}

        ${meeting.agenda ? `
        📋 Agenda:
        ${meeting.agenda.map((item, i) => `${i + 1}. ${item}`).join('\n')}
        ` : ''}
      `.trim()
    }
  }
} satisfies Dictionary
```

## Performance Optimization Strategies

### Memoization and Caching

```typescript
// performance-optimized-messages.ts
import type { Dictionary } from 'ts-i18n'

// LRU Cache implementation for expensive computations
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recent)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Cached formatters and computations
const formatterCache = new LRUCache<string, Intl.NumberFormat | Intl.DateTimeFormat>(50)
const computationCache = new LRUCache<string, any>(200)

function getCachedFormatter(
  locale: string,
  type: 'currency' | 'number' | 'date',
  options: any
): Intl.NumberFormat | Intl.DateTimeFormat {
  const key = `${type}-${locale}-${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  
  if (!formatter) {
    if (type === 'currency' || type === 'number') {
      formatter = new Intl.NumberFormat(locale, options)
    } else {
      formatter = new Intl.DateTimeFormat(locale, options)
    }
    formatterCache.set(key, formatter)
  }
  
  return formatter
}

function memoize<T extends (...args: any[]) => any>(fn: T, cacheKeyFn?: (...args: Parameters<T>) => string): T {
  return ((...args: Parameters<T>) => {
    const key = cacheKeyFn ? cacheKeyFn(...args) : JSON.stringify(args)

    let result = computationCache.get(key)
    if (result === undefined) {
      result = fn(...args)
      computationCache.set(key, result)
    }

    return result
  }) as T
}

export default {
  optimized: {
    // Memoized expensive calculations
    complexCalculation: memoize(({ data, user }: {
      data: Array<{ value: number; timestamp: Date }>
      user: { locale: string; timezone: string }
    }) => {
      // Simulate expensive computation
      const processedData = data.map(item => ({
        ...item,
        normalized: Math.log(item.value + 1),
        localTime: new Intl.DateTimeFormat(user.locale, {
          timeZone: user.timezone,
          timeStyle: 'medium'
        }).format(item.timestamp)
      }))

      const average = processedData.reduce((sum, item) => sum + item.normalized, 0) / processedData.length
      const variance = processedData.reduce((sum, item) => sum + Math.pow(item.normalized - average, 2), 0) / processedData.length

      return {
        average: average.toFixed(3),
        variance: variance.toFixed(3),
        count: processedData.length,
        trend: average > 0 ? 'increasing' : 'decreasing'
      }
    }, (params) => `calc-${params.user.locale}-${params.data.length}-${params.data[0]?.timestamp.getTime()}`),

    // Cached formatter usage
    financialReport: ({ transactions, user }: {
      transactions: Array<{ amount: number; date: Date; category: string }>
      user: { locale: string; currency: string; timezone: string }
    }) => {
      const currencyFormatter = getCachedFormatter(user.locale, 'currency', {
        style: 'currency',
        currency: user.currency
      }) as Intl.NumberFormat

      const dateFormatter = getCachedFormatter(user.locale, 'date', {
        dateStyle: 'short',
        timeZone: user.timezone
      }) as Intl.DateTimeFormat

      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
      const categoryTotals = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

      const topCategory = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)[0]

      return `
        Financial Report

        Total: ${currencyFormatter.format(totalAmount)}
        Transactions: ${transactions.length}
        Top Category: ${topCategory[0]} (${currencyFormatter.format(topCategory[1])})
        Period: ${dateFormatter.format(transactions[0]?.date)} - ${dateFormatter.format(transactions[transactions.length - 1]?.date)}
      `.trim()
    },

    // Lazy-loaded complex formatting
    dataVisualization: ({ dataset, user, options }: {
      dataset: Array<{ label: string; value: number; metadata?: Record<string, any> }>
      user: { locale: string; preferences: { chartType: string; precision: number } }
      options: { showPercentages: boolean; groupThreshold: number }
    }) => {
      // Lazy computation with memoization
      const computeStats = memoize((data: typeof dataset) => {
        const total = data.reduce((sum, item) => sum + item.value, 0)
        const sorted = [...data].sort((a, b) => b.value - a.value)
        const significant = sorted.filter(item => item.value >= total * options.groupThreshold)
        const others = sorted.filter(item => item.value < total * options.groupThreshold)

        return { total, significant, others }
      })

      const { total, significant, others } = computeStats(dataset)
      const numberFormatter = getCachedFormatter(user.locale, 'number', {
        minimumFractionDigits: user.preferences.precision,
        maximumFractionDigits: user.preferences.precision
      }) as Intl.NumberFormat

      const formatItem = (item: typeof dataset[0], showPercent = false) => {
        const formatted = numberFormatter.format(item.value)
        const percent = showPercent ? ` (${((item.value / total) * 100).toFixed(1)}%)` : ''
        return `${item.label}: ${formatted}${percent}`
      }

      let result = `Dataset Analysis (${dataset.length} items)\n\n`
      result += `Total: ${numberFormatter.format(total)}\n\n`

      if (significant.length > 0) {
        result += `Top ${significant.length} items:\n`
        result += significant.map(item => formatItem(item, options.showPercentages)).join('\n')
      }

      if (others.length > 0) {
        const othersTotal = others.reduce((sum, item) => sum + item.value, 0)
        result += `\n\nOthers (${others.length} items): ${numberFormatter.format(othersTotal)}`
        if (options.showPercentages) {
          result += ` (${((othersTotal / total) * 100).toFixed(1)}%)`
        }
      }

      return result.trim()
    }
  },

  // Batch processing for multiple items
  batch: {
    userNotifications: ({ notifications, user }: {
      notifications: Array<{
        id: string
        type: 'message' | 'alert' | 'reminder' | 'update'
        title: string
        content: string
        timestamp: Date
        priority: 'low' | 'medium' | 'high'
      }>
      user: { locale: string; timezone: string; preferences: { maxBatch: number } }
    }) => {
      // Group by type and priority for efficient processing
      const grouped = notifications.reduce((acc, notif) => {
        const key = `${notif.type}-${notif.priority}`
        if (!acc[key]) acc[key] = []
        acc[key].push(notif)
        return acc
      }, {} as Record<string, typeof notifications>)

      const priorityOrder = ['high', 'medium', 'low']
      const typeEmojis = { message: '💬', alert: '⚠️', reminder: '⏰', update: '🔄' }

      let result = `Notifications (${notifications.length})\n\n`

      for (const priority of priorityOrder) {
        for (const [type] of Object.entries(typeEmojis)) {
          const key = `${type}-${priority}`
          const items = grouped[key]

          if (items && items.length > 0) {
            result += `${typeEmojis[type as keyof typeof typeEmojis]} ${type.toUpperCase()} - ${priority.toUpperCase()} (${items.length})\n`

            const displayItems = items.slice(0, user.preferences.maxBatch)
            result += displayItems.map(item => `  • ${item.title}`).join('\n')

            if (items.length > user.preferences.maxBatch) {
              result += `\n  ... and ${items.length - user.preferences.maxBatch} more`
            }

            result += '\n\n'
          }
        }
      }

      return result.trim()
    }
  }
} satisfies Dictionary

// Export cache management utilities
export const cacheUtils = {
  clearAll: () => {
    formatterCache.clear()
    computationCache.clear()
  },
  getStats: () => ({
    formatters: formatterCache.size(),
    computations: computationCache.size()
  })
}
```

## Integration with State Management

### Redux Integration

```typescript
// redux-integration.ts
import type { Dictionary } from 'ts-i18n'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface I18nState {
  currentLocale: string
  availableLocales: string[]
  isLoading: boolean
  error: string | null
  translationCache: Record<string, Record<string, any>>
  userPreferences: {
    locale: string
    currency: string
    timezone: string
    dateFormat: string
  }
}

const initialState: I18nState = {
  currentLocale: 'en',
  availableLocales: ['en', 'es', 'fr'],
  isLoading: false,
  error: null,
  translationCache: {},
  userPreferences: {
    locale: 'en',
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'short'
  }
}

const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<string>) => {
      state.currentLocale = action.payload
      state.userPreferences.locale = action.payload
    },
    setUserPreferences: (state, action: PayloadAction<Partial<I18nState['userPreferences']>>) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload }
    },
    loadTranslationsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loadTranslationsSuccess: (state, action: PayloadAction<{ locale: string; translations: any }>) => {
      state.isLoading = false
      state.translationCache[action.payload.locale] = action.payload.translations
    },
    loadTranslationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  setLocale,
  setUserPreferences,
  loadTranslationsStart,
  loadTranslationsSuccess,
  loadTranslationsFailure,
  clearError
} = i18nSlice.actions

export default i18nSlice.reducer

// Redux-aware translation functions
export const reduxTranslations: Dictionary = {
  stateAware: {
    userGreeting: ({ user, state }: {
      user: { name: string; lastLogin?: Date }
      state: I18nState
    }) => {
      const { locale, timezone } = state.userPreferences

      const greeting = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        hour: 'numeric'
      }).format(new Date()).includes('AM') ? 'Good morning' : 'Good evening'

      const lastLoginText = user.lastLogin
        ? new Intl.RelativeTimeFormat(locale).format(
            Math.floor((user.lastLogin.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            'day'
          )
        : 'for the first time'

      return `${greeting}, ${user.name}! Welcome back ${lastLoginText}.`
    },

    localizationStatus: ({ state }: { state: I18nState }) => {
      const currentTranslations = state.translationCache[state.currentLocale]
      const loadedLocales = Object.keys(state.translationCache)

      return `
        🌍 Localization Status

        Current: ${state.currentLocale}
        Available: ${state.availableLocales.join(', ')}
        Loaded: ${loadedLocales.join(', ')}

        Cache: ${currentTranslations ? 'Ready' : 'Loading...'}
        ${state.error ? `Error: ${state.error}` : ''}
      `.trim()
    }
  }
}
```

### React Context Integration

```typescript
// react-context-integration.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { Dictionary } from 'ts-i18n'

interface I18nContextType {
  locale: string
  setLocale: (locale: string) => void
  translate: (key: string, params?: any) => string
  isLoading: boolean
  error: string | null
  userContext: {
    currency: string
    timezone: string
    region: string
  }
}

const I18nContext = createContext<I18nContextType | null>(null)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Context-aware translations
export const contextAwareTranslations: Dictionary = {
  contextual: {
    shoppingCart: ({ items, userContext }: {
      items: Array<{ id: string; name: string; price: number; quantity: number }>
      userContext: I18nContextType['userContext']
    }) => {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const formatter = new Intl.NumberFormat(userContext.region, {
        style: 'currency',
        currency: userContext.currency
      })

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

      return `
        🛒 Shopping Cart

        ${itemCount} ${itemCount === 1 ? 'item' : 'items'}
        Total: ${formatter.format(total)}

        ${items.slice(0, 3).map(item =>
          `${item.quantity}x ${item.name} - ${formatter.format(item.price * item.quantity)}`
        ).join('\n')}
        ${items.length > 3 ? `... and ${items.length - 3} more items` : ''}
      `.trim()
    },

    weatherUpdate: ({ weather, userContext }: {
      weather: {
        temperature: number
        condition: string
        humidity: number
        windSpeed: number
      }
      userContext: I18nContextType['userContext']
    }) => {
      // Temperature unit based on region
      const isMetric = !['US', 'LR', 'MM'].includes(userContext.region)
      const tempUnit = isMetric ? '°C' : '°F'
      const speedUnit = isMetric ? 'km/h' : 'mph'

      const displayTemp = isMetric
        ? weather.temperature
        : (weather.temperature * 9/5) + 32

      const displaySpeed = isMetric
        ? weather.windSpeed
        : weather.windSpeed * 0.621371

      return `
        🌤️ Weather Update

        ${displayTemp.toFixed(1)}${tempUnit} - ${weather.condition}
        Humidity: ${weather.humidity}%
        Wind: ${displaySpeed.toFixed(1)} ${speedUnit}
      `.trim()
    }
  }
}
```

## Testing Dynamic Messages

### Comprehensive Test Suites

```typescript
// dynamic-messages.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Dictionary } from 'ts-i18n'
import { cacheUtils } from './performance-optimized-messages'

describe('Dynamic Messages', () => {
  beforeEach(() => {
    // Clear caches before each test
    cacheUtils.clearAll()
  })

  afterEach(() => {
    // Clean up after each test
    cacheUtils.clearAll()
  })

  describe('Template-based Messages', () => {
    const templates = {} // Import your template translations

    it('should generate correct email templates', () => {
      const result = templates.email.welcome({
        user: { name: 'Chris', email: 'chris@example.com' },
        company: 'TeamFlow'
      })

      expect(result.subject).toBe('Welcome to TeamFlow, Chris!')
      expect(result.body).toContain('chris@example.com')
      expect(result.cta).toBe('Get Started')
    })

    it('should handle missing optional parameters', () => {
      const result = templates.email.passwordReset({
        user: { name: 'Avery' },
        resetLink: 'https://example.com/reset'
      })

      expect(result.body).toContain('24 hours') // Default expiry
    })

    it('should format dates correctly for different locales', () => {
      const invoice = {
        user: { name: 'Buddy', company: 'Test Corp' },
        invoice: { number: 'INV-001', period: 'March 2024' },
        amount: { value: 1234.56, currency: 'EUR' },
        dueDate: new Date('2024-04-15')
      }

      const result = templates.email.invoiceReady(invoice)
      expect(result.body).toContain('€1,234.56')
      expect(result.body).toContain('Buddy from Test Corp')
    })
  })

  describe('Performance Optimization', () => {
    const optimizedTranslations = {} // Import your optimized translations

    it('should cache expensive computations', () => {
      const data = Array.from({ length: 1000 }, (*, i) => ({
        value: Math.random() * 100,
        timestamp: new Date(Date.now() - i * 86400000)
      }))

      const params = { data, user: { locale: 'en', timezone: 'UTC' } }

      // First call
      const start1 = performance.now()
      const result1 = optimizedTranslations.optimized.complexCalculation(params)
      const time1 = performance.now() - start1

      // Second call (should be cached)
      const start2 = performance.now()
      const result2 = optimizedTranslations.optimized.complexCalculation(params)
      const time2 = performance.now() - start2

      expect(result1).toEqual(result2)
      expect(time2).toBeLessThan(time1 * 0.1) // Should be much faster
    })

    it('should handle cache size limits', () => {
      const cache = new (class extends Map {
        maxSize = 5
        set(key: any, value: any) {
          if (this.size >= this.maxSize) {
            const firstKey = this.keys().next().value
            this.delete(firstKey)
          }
          return super.set(key, value)
        }
      })()

      // Fill cache beyond limit
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, `value${i}`)
      }

      expect(cache.size).toBe(5)
      expect(cache.has('key0')).toBe(false) // Should be evicted
      expect(cache.has('key9')).toBe(true) // Should be present
    })
  })

  describe('Localization and Formatting', () => {
    const formattingTranslations = {} // Import your formatting translations

    it('should format currencies correctly for different locales', () => {
      const portfolio = {
        totalValue: 12345.67,
        dayChange: -234.56,
        dayChangePercent: -1.86,
        positions: [
          { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, currentPrice: 150, change: 2.5, changePercent: 1.69 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 5, currentPrice: 2800, change: -15, changePercent: -0.53 }
        ]
      }

      // US locale
      const resultUS = formattingTranslations.financial.portfolioSummary({
        portfolio,
        user: { locale: 'en-US', currency: 'USD' }
      })
      expect(resultUS).toContain('$12,345.67')
      expect(resultUS).toContain('-$234.56')

      // European locale
      const resultEU = formattingTranslations.financial.portfolioSummary({
        portfolio,
        user: { locale: 'de-DE', currency: 'EUR' }
      })
      expect(resultEU).toContain('12.345,67')
    })

    it('should handle relative time formatting', () => {
      const now = new Date()
      const activities = [
        {
          type: 'like' as const,
          actor: { name: 'Chris' },
          target: { type: 'post', title: 'My latest article' },
          timestamp: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
        }
      ]

      const result = formattingTranslations.social.activityFeed({
        activities,
        user: { locale: 'en', timezone: 'UTC' }
      })

      expect(result).toContain('30 minutes ago')
    })

    it('should format lists correctly', () => {
      const meeting = {
        title: 'Team Standup',
        start: new Date('2024-03-15T10:00:00Z'),
        end: new Date('2024-03-15T10:30:00Z'),
        agenda: ['Review yesterday', 'Plan today', 'Blockers discussion']
      }

      const attendees = [
        { name: 'Chris', email: 'chris@example.com', required: true },
        { name: 'Avery', email: 'avery@example.com', required: true },
        { name: 'Buddy', email: 'buddy@example.com', required: false }
      ]

      const result = formattingTranslations.communication.meetingInvite({
        meeting,
        attendees,
        user: { locale: 'en', timezone: 'UTC' }
      })

      expect(result).toContain('Chris, Avery, and Buddy')
      expect(result).toContain('Required: 2')
      expect(result).toContain('Optional: 1')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed parameters gracefully', () => {
      const malformedFunction = ({ data }: { data: any }) => {
        try {
          return `Processed ${data.length} items`
        } catch (error) {
          return 'Error processing data'
        }
      }

      expect(malformedFunction({ data: null })).toBe('Error processing data')
      expect(malformedFunction({ data: 'not-an-array' })).toBe('Error processing data')
      expect(malformedFunction({ data: [1, 2, 3] })).toBe('Processed 3 items')
    })

    it('should validate parameter types', () => {
      const typeSafeFunction = ({ count, name }: { count: number; name: string }) => {
        if (typeof count !== 'number' || typeof name !== 'string') {
          throw new Error('Invalid parameter types')
        }
        return `${name}: ${count}`
      }

      expect(() => typeSafeFunction({ count: '5' as any, name: 'test' })).toThrow('Invalid parameter types')
      expect(() => typeSafeFunction({ count: 5, name: 123 as any })).toThrow('Invalid parameter types')
      expect(typeSafeFunction({ count: 5, name: 'test' })).toBe('test: 5')
    })
  })

  describe('Memory Management', () => {
    it('should not leak memory with repeated calls', () => {
      const heavyFunction = ({ size }: { size: number }) => {
        const data = new Array(size).fill(0).map((*, i) => i)
        return `Generated ${data.length} items`
      }

      // Simulate many calls
      for (let i = 0; i < 100; i++) {
        heavyFunction({ size: 1000 })
      }

      // Check that caches haven't grown excessively
      const stats = cacheUtils.getStats()
      expect(stats.formatters).toBeLessThan(50)
      expect(stats.computations).toBeLessThan(100)
    })
  })
})
```

Dynamic messages provide the flexibility to handle complex translation scenarios while maintaining type safety and performance. They're essential for building truly internationalized applications that feel native to users in different locales.
