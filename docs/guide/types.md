# Type Generation

ts-i18n provides powerful type generation capabilities that give you autocomplete, type checking, and parameter inference for your translations.

## Why Type Generation?

- **Catch typos at compile time** - No more runtime errors from mistyped keys
- **Autocomplete in IDE** - See all available translation keys as you type
- **Parameter type safety** - Ensure dynamic translations receive correct parameters
- **Refactoring support** - Rename keys with confidence

## Basic Type Generation

### From Loaded Translations

Generate types from your loaded translation tree:

```typescript
import { generateTypes, loadTranslations } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml']
})

// Generate types file
await generateTypes(translations, 'dist/i18n/keys.d.ts')
```

This generates a declaration file:

```typescript
// dist/i18n/keys.d.ts
export type TranslationKey =
  | 'home.title'
  | 'home.description'
  | 'auth.login'
  | 'auth.logout'
  | 'greeting.hello'
  // ... all other keys
```

### From TypeScript Module

For the best type inference, generate types directly from your base locale TypeScript file:

```typescript
import { generateTypesFromModule } from 'ts-i18n'

// Generate from your base locale module
await generateTypesFromModule('./locales/en/index.ts', 'dist/i18n/keys.d.ts')
```

This generates more detailed types with parameter inference:

```typescript
// dist/i18n/keys.d.ts
import type base from './locales/en/index'

export type TranslationKey = DotPaths<typeof base>

export type ParamsFor<K extends TranslationKey> = ParamsForKey<typeof base, K>

export type TypedTranslator = <K extends TranslationKey>(
  key: K,
  localeOrParams?: string | ParamsFor<K>,
  maybeParams?: ParamsFor<K>
) => string
```

## Using Generated Types

### Basic Usage

```typescript
import type { TranslationKey, TypedTranslator } from './dist/i18n/keys'
import { createTranslator, loadTranslations } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en'
})

// Option 1: Type annotation
const t: TypedTranslator = createTranslator(translations, {
  defaultLocale: 'en'
})

// Full autocomplete and type checking
t('home.title')              // OK
t('home.tittle')             // Error: typo!
t('nonexistent')             // Error: key doesn't exist
```

### With Parameter Types

```typescript
import type { ParamsFor, TranslationKey, TypedTranslator } from './dist/i18n/keys'

// Given this translation:
// greeting: {
//   hello: ({ name }: { name: string }) => `Hello, ${name}!`
// }

const t: TypedTranslator = createTranslator(translations, {
  defaultLocale: 'en'
})

// Type-safe parameters
t('greeting.hello', { name: 'Alice' })  // OK
t('greeting.hello', { nama: 'Alice' })  // Error: 'nama' not in params
t('greeting.hello', { name: 123 })      // Error: name must be string
t('greeting.hello')                      // Error: params required

// Get parameter type for a specific key
type HelloParams = ParamsFor<'greeting.hello'>
// { name: string }
```

## Generic Translator Type

Use `TranslatorFor<T>` with your base translation type:

```typescript
import type { TranslatorFor } from 'ts-i18n'
import { createTranslator, loadTranslations } from 'ts-i18n'
import base from './locales/en/index'

type Base = typeof base

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en'
})

// Fully typed translator
const t: TranslatorFor<Base> = createTranslator<Base>(translations, {
  defaultLocale: 'en'
})

// Works with all your translation types
t('home.title')
t('greeting.hello', { name: 'Alice' })
```

## CLI Type Generation

Generate types using the CLI:

```bash
# Generate types based on config
ts-i18n build

# Generate types from a specific module
ts-i18n build --types-from ./locales/en/index.ts

# Specify output file
ts-i18n build --types-out dist/i18n/keys.d.ts
```

## Configuration

Configure type generation in your config file:

```typescript
// .config/i18n.config.ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts'],

  // Type generation output
  typesOutFile: 'src/types/i18n.d.ts'
}
```

## Advanced Type Utilities

### DotPaths

Extract all dot-separated paths from a nested object type:

```typescript
import type { DotPaths } from 'ts-i18n'

type Translations = {
  home: {
    title: string
    nested: {
      deep: string
    }
  }
  auth: {
    login: string
  }
}

type Keys = DotPaths<Translations>
// 'home.title' | 'home.nested.deep' | 'auth.login'
```

### PathValue

Get the value type at a specific path:

```typescript
import type { PathValue } from 'ts-i18n'

type Translations = {
  greeting: {
    hello: (params: { name: string }) => string
  }
  static: {
    title: string
  }
}

type HelloValue = PathValue<Translations, 'greeting.hello'>
// (params: { name: string }) => string

type TitleValue = PathValue<Translations, 'static.title'>
// string
```

### ParamsForKey

Extract parameter types from dynamic translations:

```typescript
import type { ParamsForKey } from 'ts-i18n'

type Translations = {
  greeting: {
    hello: (params: { name: string }) => string
    welcome: (params: { user: string; count: number }) => string
  }
}

type HelloParams = ParamsForKey<Translations, 'greeting.hello'>
// { name: string }

type WelcomeParams = ParamsForKey<Translations, 'greeting.welcome'>
// { user: string; count: number }
```

## Integration Patterns

### Create a Typed i18n Module

```typescript
// src/i18n/index.ts
import type { TranslatorFor } from 'ts-i18n'
import { createTranslator, loadTranslations } from 'ts-i18n'
import base from '../locales/en/index'

export type Base = typeof base
export type Translator = TranslatorFor<Base>

let translator: Translator

export async function initI18n(locale = 'en'): Promise<Translator> {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en',
    fallbackLocale: 'en'
  })

  translator = createTranslator<Base>(translations, {
    defaultLocale: locale,
    fallbackLocale: 'en'
  })

  return translator
}

export function t(...args: Parameters<Translator>): string {
  if (!translator) {
    throw new Error('i18n not initialized. Call initI18n() first.')
  }
  return translator(...args)
}

export { translator }
```

### React Hook with Types

```typescript
// src/hooks/useTranslation.ts
import type { TranslatorFor } from 'ts-i18n'
import { useContext } from 'react'
import type { Base } from '../i18n'
import { I18nContext } from '../i18n/context'

export function useTranslation(): TranslatorFor<Base> {
  const t = useContext(I18nContext)
  if (!t) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return t
}
```

### Vue Composable with Types

```typescript
// src/composables/useI18n.ts
import type { TranslatorFor } from 'ts-i18n'
import { inject } from 'vue'
import type { Base } from '../i18n'
import { i18nKey } from '../i18n/symbols'

export function useI18n(): TranslatorFor<Base> {
  const t = inject(i18nKey)
  if (!t) {
    throw new Error('useI18n must be used within i18n plugin')
  }
  return t
}
```

## Troubleshooting

### Types Not Updating

Regenerate types after changing translations:

```bash
ts-i18n build
```

### IDE Not Showing Autocomplete

1. Ensure the types file is included in your `tsconfig.json`:

```json
{
  "include": ["src/**/*", "dist/i18n/keys.d.ts"]
}
```

2. Restart your TypeScript server in the IDE.

### Type Errors with Parameters

Ensure your base locale has all dynamic translations typed correctly:

```typescript
// Good: Explicit parameter types
const good = {
  greeting: ({ name }: { name: string }) => `Hello, ${name}!`
}

// Bad: Implicit any parameters
const bad = {
  greeting: (params) => `Hello, ${params.name}!`  // params is 'any'
}
```
