# ts-plugin-i18n

A comprehensive TypeScript plugin for `ts-i18n` that generates smart types for YAML files and enhances TypeScript integration with automatic type generation, IntelliSense support, and seamless developer experience.

## 🌟 Features

- **🧠 Smart Types for YAML**: Automatically generates TypeScript definitions for YAML translation files
- **📦 Wrapper Modules**: Creates TypeScript wrapper modules for better import experience
- **🔧 Unified Type System**: Generates consolidated types that work across all locales
- **🌍 Global Namespace**: Optional global namespace declarations for easier access
- **👀 Watch Mode**: Automatic regeneration when translation files change
- **⚡ Fast Generation**: Optimized type generation with minimal overhead
- **🎯 Full IntelliSense**: Complete autocomplete and type checking support

## 📦 Installation

```bash
bun add ts-plugin-i18n
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createTypeScriptI18nPlugin } from 'ts-plugin-i18n'

// Initialize the plugin
const plugin = await createTypeScriptI18nPlugin({
  translationsDir: 'locales',
  outDir: 'src/types/i18n',
  generateSmartTypes: true,
  generateWrappers: true
})

// Types are automatically generated!
```

### In Your Application

```typescript
// Import generated types
import type {
  TypedTranslator,
  EnTranslations,
  EsTranslations
} from './src/types/i18n'

import { createTranslator, loadTranslations } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['yaml', 'ts']
})

const t: TypedTranslator = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// Fully typed with autocomplete!
t('app.welcome.title')           // ✅ Valid key
t('user.greeting', { name: 'Chris' })  // ✅ Valid with params
t('invalid.key')                 // ❌ TypeScript error
```

## ⚙️ Configuration Options

```typescript
interface TypeScriptPluginOptions {
  /** Enable or disable the plugin @default true */
  enabled?: boolean

  /** Directory containing translation files @default 'locales' */
  translationsDir?: string

  /** Output directory for generated TypeScript files @default 'src/types/i18n' */
  outDir?: string

  /** Supported source file types @default ['ts', 'yaml'] */
  sources?: SourceKind[]

  /** Base locale to use for type generation @default 'en' */
  baseLocale?: string

  /** Include/exclude patterns for translation files */
  include?: string[]
  exclude?: string[]

  /** Generate smart types for YAML files @default true */
  generateSmartTypes?: boolean

  /** Generate wrapper modules for better imports @default true */
  generateWrappers?: boolean

  /** Watch for changes in translation files @default true in development */
  watch?: boolean

  /** Enable verbose logging @default false */
  verbose?: boolean

  /** Custom type generation strategy @default 'hybrid' */
  typeStrategy?: 'simple' | 'advanced' | 'hybrid'

  /** Generate declaration merging for global namespace @default false */
  globalNamespace?: boolean

  /** Namespace name for global declarations @default 'I18n' */
  namespaceName?: string

  /** Transform function for type names */
  transformTypeName?: (key: string, locale: string) => string

  /** Called after types are generated */
  onTypesGenerated?: (results: TypeGenerationResult[]) => void | Promise<void>

  /** Called when translation files change (watch mode) */
  onChange?: (changedFiles: string[]) => void | Promise<void>

  /** Called on generation errors */
  onError?: (error: Error, context?: string) => void
}
```

## 📋 Examples

### Smart Types for YAML Files

Given a YAML file:

```yaml
# locales/en.yml
app:
  title: "My App"
  description: "Welcome to my application"

user:
  greeting: "Hello, {{name}}!"
  profile:
    name: "Name"
    email: "Email"

navigation:
  home: "Home"
  about: "About"
  contact: "Contact"
```

The plugin generates:

```typescript
// Generated: src/types/i18n/en.d.ts
export interface EnTranslations {
  /** "My App" */
  app: {
    /** "My App" */
    title: string
    /** "Welcome to my application" */
    description: string
  }

  user: {
    /** "Hello, {{name}}!" */
    greeting: string
    profile: {
      /** "Name" */
      name: string
      /** "Email" */
      email: string
    }
  }

  navigation: {
    /** "Home" */
    home: string
    /** "About" */
    about: string
    /** "Contact" */
    contact: string
  }
}
```

### TypeScript Wrapper Modules

```typescript
// Generated: src/types/i18n/en-wrapper.ts
import type { TranslatorFor, DotPaths, ParamsForKey } from 'ts-i18n'
import type { EnTranslations } from './en'

export type EnKeys = DotPaths<EnTranslations>
export type EnParams<K extends EnKeys> = ParamsForKey<EnTranslations, K>
export type EnTranslator = TranslatorFor<EnTranslations>

// Re-export for convenience
export type { EnTranslations }
```

### Unified Type System

```typescript
// Generated: src/types/i18n/index.ts
import type { DotPaths, ParamsForKey, TranslatorFor } from 'ts-i18n'

// Base translation tree type (from en locale)
export type BaseTranslations = typeof import('./en').default

// Core types
export type TranslationKey = DotPaths<BaseTranslations>
export type TranslationParams<K extends TranslationKey> = ParamsForKey<BaseTranslations, K>
export type TypedTranslator = TranslatorFor<BaseTranslations>

// Locale-specific types
export type { EnTranslations } from './en'
export type { EsTranslations } from './es'
export type { FrTranslations } from './fr'

// Union of all available locales
export type AvailableLocale = 'en' | 'es' | 'fr'

// Translation tree by locale
export type TranslationsByLocale = {
  'en': EnTranslations
  'es': EsTranslations
  'fr': FrTranslations
}

// Helper type for locale-aware translation functions
export type LocalizedTranslator<L extends AvailableLocale> = TranslatorFor<TranslationsByLocale[L]>
```

### Advanced Configuration

```typescript
import { createTypeScriptI18nPlugin } from 'ts-plugin-i18n'

const plugin = await createTypeScriptI18nPlugin({
  translationsDir: 'src/locales',
  outDir: 'src/types/i18n',
  sources: ['yaml', 'ts'],
  baseLocale: 'en',

  // Enable smart type generation
  generateSmartTypes: true,
  generateWrappers: true,

  // Watch for changes in development
  watch: process.env.NODE_ENV === 'development',
  verbose: process.env.DEBUG === 'true',

  // Generate global namespace
  globalNamespace: true,
  namespaceName: 'AppI18n',

  // Include/exclude patterns
  include: ['**/*.{yml,yaml,ts}'],
  exclude: ['**/*.test.*', '**/*.spec.*'],

  // Custom type name transformation
  transformTypeName: (key, locale) => `${locale.toUpperCase()}_${key}`,

  // Callbacks
  onTypesGenerated: async (results) => {
    console.log(`✅ Generated types for ${results.length} locales`)
    for (const result of results) {
      console.log(`   ${result.locale}: ${result.typeCount} types (${result.hasSmartTypes ? 'smart' : 'basic'})`)
    }
  },

  onChange: async (changedFiles) => {
    console.log(`📝 Regenerating types due to changes in: ${changedFiles.join(', ')}`)
  },

  onError: (error, context) => {
    console.error(`❌ Type generation error in ${context}:`, error.message)
  }
})
```

### Global Namespace Usage

When `globalNamespace: true` is enabled:

```typescript
// Generated: src/types/i18n/global.d.ts
declare global {
  namespace I18n {
    // Translation key type
    type Key = import('./index').TranslationKey

    // Typed translator
    type Translator = import('./index').TypedTranslator

    // Available locales
    type Locale = import('./index').AvailableLocale

    // Translation function type
    type TranslateFn<L extends Locale = 'en'> = import('./index').LocalizedTranslator<L>

    // Locale-specific translation types
    namespace Locales {
      type En = import('./index').EnTranslations
      type Es = import('./index').EsTranslations
      type Fr = import('./index').FrTranslations
    }
  }
}

export {}
```

Usage in your app:

```typescript
// Now you can use global types without imports!
function createTypedTranslator(): I18n.Translator {
  // Implementation
}

function translateKey(key: I18n.Key): string {
  // Implementation
}

// Locale-specific operations
function processEnglishTranslations(translations: I18n.Locales.En) {
  // Implementation
}
```

### Framework Integration

#### React Hook

```typescript
import { useState, useEffect } from 'react'
import { createTranslator, loadTranslations } from 'ts-i18n'
import type { TypedTranslator, AvailableLocale } from '../types/i18n'

export function useTranslation(locale: AvailableLocale = 'en') {
  const [translator, setTranslator] = useState<TypedTranslator | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTranslator() {
      setLoading(true)
      try {
        const translations = await loadTranslations({
          translationsDir: 'locales',
          defaultLocale: locale,
          sources: ['yaml', 'ts']
        })

        const t = createTranslator(translations, {
          defaultLocale: locale,
          fallbackLocale: 'en'
        })

        setTranslator(t)
      } catch (error) {
        console.error('Failed to load translations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTranslator()
  }, [locale])

  return { t: translator, loading }
}

// Usage in component
function MyComponent() {
  const { t, loading } = useTranslation('en')

  if (loading || !t) return <div>Loading...</div>

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('user.greeting', { name: 'World' })}</p>
    </div>
  )
}
```

#### Vue Composable

```typescript
import { ref, computed } from 'vue'
import { createTranslator } from 'ts-i18n'
import type { TypedTranslator, AvailableLocale } from '../types/i18n'

const currentLocale = ref<AvailableLocale>('en')
const translator = ref<TypedTranslator | null>(null)

export function useI18n() {
  const t = computed(() => translator.value)

  const setLocale = async (locale: AvailableLocale) => {
    currentLocale.value = locale
    // Load and set translator...
  }

  return {
    t,
    locale: currentLocale,
    setLocale
  }
}
```

### Development Workflow

1. **Write YAML translations** with your content
2. **Run the plugin** to generate TypeScript types
3. **Import and use** the generated types in your application
4. **Get full IntelliSense** and compile-time validation
5. **Watch mode** automatically updates types when files change

```bash
# Setup
bun add ts-plugin-i18n

# Generate types (one-time)
bun run generate-i18n-types

# Development with watch mode
bun run dev:i18n-types
```

### Build Integration

```typescript
// scripts/generate-i18n-types.ts
import { createTypeScriptI18nPlugin } from 'ts-plugin-i18n'

async function generateTypes() {
  console.log('🌍 Generating i18n types...')

  await createTypeScriptI18nPlugin({
    translationsDir: 'locales',
    outDir: 'src/types/i18n',
    generateSmartTypes: true,
    generateWrappers: true,
    globalNamespace: true,
    verbose: true
  })

  console.log('✅ i18n types generated successfully!')
}

generateTypes().catch(console.error)
```

### Package.json Scripts

```json
{
  "scripts": {
    "build:i18n": "bun run scripts/generate-i18n-types.ts",
    "dev:i18n": "bun run scripts/generate-i18n-types.ts --watch",
    "prebuild": "bun run build:i18n",
    "predev": "bun run build:i18n"
  }
}
```

## 🔄 Watch Mode

The plugin includes intelligent watch mode that:

- **Monitors translation files** for changes
- **Debounces regeneration** to avoid excessive rebuilds
- **Supports all file types** (YAML, TypeScript, JSON)
- **Provides change callbacks** for custom logic
- **Handles file additions/deletions** gracefully

```typescript
const plugin = await createTypeScriptI18nPlugin({
  watch: true,
  onChange: async (changedFiles) => {
    console.log(`🔄 Detected changes in ${changedFiles.length} files`)

    // Custom logic on file changes
    await notifyDevelopmentServer()
    await validateTranslationCompleteness()
  }
})
```

## 🎯 Type Strategy

Choose the optimal type generation strategy for your needs:

### Simple Strategy
- Generates basic key union types
- Fast generation
- Minimal file size
- Good for simple projects

### Advanced Strategy
- Full parameter type inference
- Complex nested types
- Function signature analysis
- Best for complex projects

### Hybrid Strategy (Default)
- Combines both approaches
- Smart detection of complexity
- Optimal balance of features and performance
- Recommended for most projects

```typescript
const plugin = await createTypeScriptI18nPlugin({
  typeStrategy: 'hybrid' // 'simple' | 'advanced' | 'hybrid'
})
```

## 📊 Performance

- **Fast Generation**: Optimized algorithms for quick type generation
- **Incremental Updates**: Only regenerates changed files in watch mode
- **Memory Efficient**: Minimal memory footprint during generation
- **Scalable**: Handles large translation files efficiently

## 🧪 Testing

```typescript
// Test your typed translations
import { describe, test, expect } from 'bun:test'
import type { TypedTranslator } from '../src/types/i18n'

describe('i18n types', () => {
  test('should provide type safety', () => {
    // This would cause a TypeScript error:
    // t('invalid.key')

    // This is valid:
    // t('app.title')
    // t('user.greeting', { name: 'Test' })

    expect(true).toBe(true) // Types are checked at compile time
  })
})
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE.md) for details.

---

**The TypeScript plugin for ts-i18n provides the ultimate developer experience for internationalization with full type safety, intelligent IntelliSense, and automatic code generation. Say goodbye to typos and runtime errors in your translations!** 🎉
