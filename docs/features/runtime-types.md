# Runtime + Type Generation

`ts-i18n` provides powerful runtime translation capabilities paired with comprehensive TypeScript type generation. This combination ensures both excellent developer experience and runtime safety.

## Runtime Translation System

### Basic Setup

```typescript
import { createTranslator, loadTranslations } from 'ts-i18n'

// Load all translation files
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'es',
  sources: ['ts', 'yaml']
})

// Create translator instance
const t = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'es'
})

// Use in your application
console.log(t('app.welcome')) // "Welcome to TeamFlow"
console.log(t('user.greeting', { name: 'Chris' })) // "Hello, Chris!"
```

### Advanced Runtime Usage

```typescript
// Multi-locale support
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: ['en-US', 'en'], // Fallback chain
  sources: ['ts', 'yaml'],
  verbose: true // Enable detailed logging
})

const t = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: ['en-US', 'en']
})

// Runtime locale switching
function getLocalizedMessage(locale: string, key: string, params?: any) {
  return t(key, locale, params)
}

// Usage examples
console.log(getLocalizedMessage('es', 'welcome.title'))
console.log(getLocalizedMessage('fr', 'notifications.taskDue', { task: 'Review PR', days: 2 }))

// Fallback behavior - if 'fr' doesn't have the key, falls back to 'en'
console.log(getLocalizedMessage('fr', 'rarely.used.key'))
```

### Integration Patterns

```typescript
// React Hook Pattern
import { createContext, useContext } from 'react'
import type { TranslatorFor } from 'ts-i18n'

const TranslationContext = createContext<TranslatorFor<any> | null>(null)

export function useTranslation() {
  const t = useContext(TranslationContext)
  if (!t) throw new Error('useTranslation must be used within TranslationProvider')
  return t
}

export function TranslationProvider({
  children,
  translator
}: {
  children: React.ReactNode
  translator: TranslatorFor<any>
}) {
  return (
    <TranslationContext.Provider value={translator}>
      {children}
    </TranslationContext.Provider>
  )
}

// Server-side rendering setup
export async function getServerSideTranslator(locale: string) {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en',
    fallbackLocale: 'en'
  })

  return createTranslator(translations, {
    defaultLocale: locale,
    fallbackLocale: 'en'
  })
}
```

## Type Generation System

### Method 1: Simple Key Union Generation

Perfect for basic type safety when you want a union of all translation keys:

```typescript
import { generateTypes, loadTranslations } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml']
})

// Generate simple key union
await generateTypes(translations, 'dist/i18n/keys.d.ts')
```

Generated output:

```typescript
// dist/i18n/keys.d.ts
export type TranslationKey =
  | "app.name"
  | "app.tagline"
  | "navigation.home"
  | "navigation.dashboard"
  | "auth.login.title"
  | "auth.login.submit"
  | "notifications.welcome"
  | "notifications.taskDue"
  // ... all your translation keys
```

### Method 2: Advanced Module-Based Type Generation

For complete type safety including parameter inference and typed translators:

```typescript
import { generateTypesFromModule } from 'ts-i18n'

// Generate advanced types from your base TypeScript module
await generateTypesFromModule(
  './locales/en/index.ts',  // Base locale module
  './dist/i18n/types.d.ts' // Output file
)
```

Your base module structure:

```typescript
// locales/en/index.ts
import type { Dictionary } from 'ts-i18n'

export default {
  app: {
    name: 'TeamFlow',
    tagline: 'Collaborate. Create. Succeed.'
  },
  notifications: {
    welcome: ({ name }: { name: string }) => `Welcome, ${name}!`,
    taskDue: ({ task, days }: { task: string; days: number }) =>
      `Task "${task}" is due in ${days} ${days === 1 ? 'day' : 'days'}`,
    teamUpdate: ({ author, action, project }: {
      author: string;
      action: 'created' | 'updated' | 'deleted';
      project: string
    }) => `${author} ${action} project "${project}"`
  },
  forms: {
    validation: {
      required: ({ field }: { field: string }) => `${field} is required`,
      email: () => 'Please enter a valid email address',
      minLength: ({ field, min }: { field: string; min: number }) =>
        `${field} must be at least ${min} characters`
    }
  }
} satisfies Dictionary
```

Generated advanced types:

```typescript
// dist/i18n/types.d.ts
import type { DotPaths, ParamsForKey, TranslatorFor } from 'ts-i18n'
import * as Mod from './locales/en/index.ts'

type Base = (
  Mod extends { default: infer D } ? D :
  Mod extends { translations: infer T } ? T :
  Mod
) extends infer X ? X : never

export type TranslationKey = DotPaths<Base>
export type ParamsFor<K extends TranslationKey> = ParamsForKey<Base, K>
export type TypedTranslator = TranslatorFor<Base>
```

### Using Generated Types

```typescript
import type { TranslationKey, ParamsFor, TypedTranslator } from './dist/i18n/types'

// Fully typed translator
const t: TypedTranslator = createTranslator(translations, config)

// Type-safe key access (autocomplete + validation)
t('app.name') // ✅ Valid
t('app.invalid') // ❌ TypeScript error

// Parameter type inference
t('notifications.welcome', { name: 'Avery' }) // ✅ Valid
t('notifications.welcome', { invalid: 'param' }) // ❌ TypeScript error
t('notifications.taskDue', { task: 'Code review', days: 3 }) // ✅ Valid

// Complex parameter validation
t('notifications.teamUpdate', {
  author: 'Buddy',
  action: 'created', // ✅ Only accepts 'created' | 'updated' | 'deleted'
  project: 'New Feature'
})

// Utility type usage
type WelcomeParams = ParamsFor<'notifications.welcome'> // { name: string }
type ValidationParams = ParamsFor<'forms.validation.minLength'> // { field: string; min: number }

function createNotification<K extends TranslationKey>(
  key: K,
  params: ParamsFor<K>
): string {
  return t(key, params)
}

// Usage with full type safety
const notification = createNotification('notifications.taskDue', {
  task: 'Review documentation',
  days: 2
})
```

## Build-Time Integration

### Configuration for Type Generation

```typescript
// .config/i18n.config.ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'en',
  sources: ['ts', 'yaml'],
  typesOutFile: 'dist/i18n/types.d.ts', // Custom types output
  outDir: 'dist/i18n', // JSON outputs for runtime
  verbose: true
}
```

### CLI Integration

```bash
# Generate types during build
npx ts-i18n build

# Generate only types (no JSON outputs)
npx ts-i18n types

# Watch mode for development
npx ts-i18n build --watch

# Generate from specific base module
npx ts-i18n types --base-module ./locales/en/index.ts
```

### Package.json Scripts

```json
{
  "scripts": {
    "i18n:build": "ts-i18n build",
    "i18n:types": "ts-i18n types",
    "i18n:watch": "ts-i18n build --watch",
    "prebuild": "npm run i18n:build",
    "dev": "concurrently \"npm run i18n:watch\" \"next dev\""
  }
}
```

## Performance Considerations

### Lazy Loading with JSON Outputs

```typescript
// Build-time: generate JSON files
import { writeOutputs } from 'ts-i18n'

await writeOutputs(translations, 'dist/i18n')
// Creates: dist/i18n/en.json, dist/i18n/es.json, etc.

// Runtime: lazy load translations
async function loadLocaleTranslations(locale: string) {
  const response = await fetch(`/i18n/${locale}.json`)
  const translations = await response.json()

  return createTranslator({ [locale]: translations }, {
    defaultLocale: locale,
    fallbackLocale: 'en'
  })
}

// React Suspense pattern
function TranslationLoader({ locale, children }: {
  locale: string
  children: (t: TypedTranslator) => React.ReactNode
}) {
  const [translator, setTranslator] = useState<TypedTranslator | null>(null)

  useEffect(() => {
    loadLocaleTranslations(locale).then(setTranslator)
  }, [locale])

  if (!translator) return <div>Loading translations...</div>

  return <>{children(translator)}</>
}
```

### Memory-Efficient Loading

```typescript
// Load only specific namespaces
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: [
    '**/auth.yml',      // Only auth translations
    '**/dashboard.ts'   // Only dashboard dynamic content
  ]
})

// Namespace-specific translators
const authTranslator = createTranslator(
  pick(translations, locale => locale.auth),
  config
)

const dashboardTranslator = createTranslator(
  pick(translations, locale => locale.dashboard),
  config
)
```

## Best Practices

### 1. **Use Module-Based Type Generation**

Always prefer `generateTypesFromModule` for full type safety:

```typescript
// ✅ Recommended: Full type safety
await generateTypesFromModule('./locales/en/index.ts', './types/i18n.d.ts')

// ❌ Basic: Limited type safety
await generateTypes(translations, './types/i18n.d.ts')
```

### 2. **Organize Base Module Strategically**

Structure your base TypeScript module to export a comprehensive translation tree:

```typescript
// locales/en/index.ts - Base module
import auth from './auth'
import dashboard from './dashboard'
import notifications from './notifications'

export default {
  ...auth,
  ...dashboard,
  ...notifications,
  // Include all translation namespaces
} satisfies Dictionary
```

### 3. **Version Your Translation Types**

Track generated types in version control for team consistency:

```gitignore
# Don't ignore generated types
!dist/i18n/types.d.ts
```

### 4. **Implement Fallback Strategies**

Always configure reasonable fallback chains:

```typescript
const t = createTranslator(translations, {
  defaultLocale: userLocale,
  fallbackLocale: [
    userLocale.split('-')[0], // 'en-US' -> 'en'
    'en'                      // Ultimate fallback
  ]
})
```

### 5. **Test Your Translation Functions**

Since TypeScript functions are part of your translations, test them:

```typescript
// locales/en/**tests**/notifications.test.ts
import notifications from '../notifications'

describe('Notification translations', () => {
  test('taskDue handles singular/plural correctly', () => {
    expect(notifications.taskDue({ task: 'Review', days: 1 }))
      .toBe('Task "Review" is due in 1 day')

    expect(notifications.taskDue({ task: 'Review', days: 3 }))
      .toBe('Task "Review" is due in 3 days')
  })
})
```
