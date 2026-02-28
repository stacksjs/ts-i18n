# Type Generation

ts-i18n generates TypeScript types from your translation files, providing full autocomplete and compile-time safety for translation keys.

## Overview

Type generation creates a type definition file that maps all your translation keys to their expected types, including parameter requirements for dynamic translations.

## Generating Types

### CLI Command

```bash
# Generate types from translation files
bunx ts-i18n generate

# Specify output path
bunx ts-i18n generate --output ./types/i18n.d.ts

# Watch mode for development
bunx ts-i18n generate --watch
```

### Programmatic Generation

```typescript
import { generateTypes } from 'ts-i18n'

await generateTypes({
  localesDir: './lang',
  outputPath: './types/i18n.d.ts',
  defaultLocale: 'en'
})
```

## Generated Types

### Translation Key Types

For this translation structure:

```yaml
# lang/en/common.yml
greeting: Hello
farewell: Goodbye

navigation:
  home: Home
  about: About
  contact: Contact
```

The generator creates:

```typescript
// types/i18n.d.ts
export interface TranslationKeys {
  'common.greeting': string
  'common.farewell': string
  'common.navigation.home': string
  'common.navigation.about': string
  'common.navigation.contact': string
}

export type TranslationKey = keyof TranslationKeys
```

### Parameter Types

For dynamic translations with parameters:

```typescript
// lang/en/messages.ts
export default {
  welcome: (params: { name: string }) => `Welcome, ${params.name}!`,
  itemCount: (params: { count: number }) => `${params.count} items`,
  order: (params: { orderId: string; total: number }) =>
    `Order #${params.orderId}: $${params.total.toFixed(2)}`
}
```

The generator creates parameter types:

```typescript
// types/i18n.d.ts
export interface TranslationParams {
  'messages.welcome': { name: string }
  'messages.itemCount': { count: number }
  'messages.order': { orderId: string; total: number }
}

export type KeysWithParams = keyof TranslationParams
export type KeysWithoutParams = Exclude<TranslationKey, KeysWithParams>
```

## Using Generated Types

### Type-Safe Translator

```typescript
import { createTranslator } from 'ts-i18n'
import type { TranslationKey, TranslationParams } from './types/i18n'

const t = await createTranslator<TranslationKey, TranslationParams>({
  locale: 'en',
  localesDir: './lang'
})

// Autocomplete works!
t('common.greeting')  // string

// TypeScript catches invalid keys
t('invalid.key')  // Error: Argument of type '"invalid.key"' is not assignable

// Required parameters are enforced
t('messages.welcome', { name: 'Alice' })  // OK
t('messages.welcome')  // Error: Expected 2 arguments, but got 1
t('messages.welcome', {})  // Error: Property 'name' is missing
```

### Parameter Inference

The translator function is overloaded to require parameters only when needed:

```typescript
// Keys without parameters - no second argument needed
t('common.greeting')

// Keys with parameters - second argument required
t('messages.welcome', { name: 'Bob' })

// TypeScript infers the correct parameter type
t('messages.order', {
  orderId: '123',  // required string
  total: 99.99    // required number
})
```

## Configuration

### Type Generation Options

```typescript
// i18n.config.ts
export default {
  typeGeneration: {
    // Output file path
    outputPath: './types/i18n.d.ts',

    // Include JSDoc comments from translations
    includeComments: true,

    // Generate strict types (no index signature)
    strictKeys: true,

    // Namespace for generated types
    namespace: 'I18n',

    // Include locale-specific type maps
    includeLocaleTypes: true
  }
}
```

### Strict Mode

Enable strict mode for maximum type safety:

```typescript
// With strictKeys: true
type TranslationKey =
  | 'common.greeting'
  | 'common.farewell'
  // ... all keys explicitly listed

// With strictKeys: false (default)
interface TranslationKeys {
  'common.greeting': string
  'common.farewell': string
  [key: string]: string  // Index signature allows any key
}
```

## IDE Integration

### VS Code

The generated types enable:

- **Autocomplete** - Press `Ctrl+Space` to see all available keys
- **Go to Definition** - Navigate to the translation file
- **Hover Information** - See the translation value and parameters
- **Error Highlighting** - Invalid keys are underlined

### Recommended VS Code Settings

```json
{
  "typescript.suggest.includeCompletionsForImportStatements": true,
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## Watch Mode

During development, use watch mode to regenerate types when translations change:

```bash
bunx ts-i18n generate --watch
```

Or in your config:

```typescript
// i18n.config.ts
export default {
  typeGeneration: {
    watch: process.env.NODE_ENV === 'development'
  }
}
```

## Best Practices

### 1. Commit Generated Types

Include the generated type file in version control:

```gitignore
# .gitignore
# Don't ignore generated types
!types/i18n.d.ts
```

### 2. Regenerate in CI

Add type generation to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Generate i18n types
  run: bunx ts-i18n generate

- name: Type check
  run: bun run typecheck
```

### 3. Use Path Aliases

Configure path aliases for cleaner imports:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@i18n/*": ["./types/i18n.d.ts"]
    }
  }
}
```

### 4. Validate During Build

Ensure types are up-to-date during build:

```typescript
// build.ts
import { generateTypes, validateTypes } from 'ts-i18n'

// Generate fresh types
await generateTypes()

// Validate all translation files match types
await validateTypes({
  strict: true,
  failOnMissing: true
})
```
