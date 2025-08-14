# bun-plugin-i18n

A powerful Bun plugin for `ts-i18n` that provides build-time translation processing, watch mode, type generation, and seamless integration with Bun's bundler.

## 🌟 Features

- **🔥 Build-time Processing**: Automatically processes translation files during build
- **👀 Watch Mode**: Rebuilds translations when files change (development)
- **🔧 Type Generation**: Generates TypeScript types for compile-time safety
- **📦 Virtual Modules**: Access translations through virtual imports
- **🎯 Configurable**: Extensive configuration options
- **⚡ Fast**: Leverages Bun's performance for lightning-fast builds
- **🧩 Flexible**: Support for TypeScript, YAML, and JSON translation files

## 📦 Installation

```bash
bun add bun-plugin-i18n
```

## 🚀 Quick Start

### Basic Usage

```typescript
// bunfig.toml or bun.config.ts
import { i18nBunPlugin } from 'bun-plugin-i18n'

export default {
  plugins: [
    i18nBunPlugin({
      translationsDir: 'locales',
      outDir: 'dist/i18n',
      generateTypes: true
    })
  ]
}
```

### In Your Application

```typescript
// Import generated translations
import enTranslations from 'virtual:i18n/en.json'
import esTranslations from 'virtual:i18n/es.json'
import type { TypedTranslator } from './dist/i18n/types'

import { createTranslator } from 'ts-i18n'

const translations = { en: enTranslations, es: esTranslations }
const t: TypedTranslator = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// Fully typed translations
console.log(t('welcome.greeting', { name: 'World' }))
```

## ⚙️ Configuration Options

```typescript
interface I18nPluginOptions {
  /** Enable or disable the plugin @default true */
  enabled?: boolean

  /** Translation configuration */
  config?: Partial<I18nConfig>

  /** Directory containing translation files @default 'locales' */
  translationsDir?: string

  /** Output directory for generated files @default 'dist/i18n' */
  outDir?: string

  /** Generate TypeScript declaration files @default true */
  generateTypes?: boolean

  /** Path for generated TypeScript types @default 'dist/i18n/types.d.ts' */
  typesPath?: string

  /** Base module path for advanced type generation */
  baseModule?: string

  /** Watch for changes in translation files @default true in development */
  watch?: boolean

  /** Minify JSON output @default false in development, true in production */
  minify?: boolean

  /** Enable verbose logging @default false */
  verbose?: boolean

  /** Include/exclude patterns for translation files */
  include?: string[]
  exclude?: string[]

  /** Transform function for translation values */
  transform?: (value: any, key: string, locale: string) => any

  /** Validation function for translations */
  validate?: (translations: Record<string, any>, locale: string) => boolean | string

  /** Called after translations are built */
  onBuild?: (results: BuildResult[]) => void | Promise<void>

  /** Called when translation files change (watch mode) */
  onChange?: (changedFiles: string[]) => void | Promise<void>

  /** Called on build errors */
  onError?: (error: Error, context?: string) => void
}
```

## 📋 Examples

### Basic Configuration

```typescript
// bun.config.ts
import { i18nBunPlugin } from 'bun-plugin-i18n'

export default {
  plugins: [
    i18nBunPlugin({
      translationsDir: 'src/locales',
      outDir: 'dist/translations',
      verbose: true
    })
  ]
}
```

### Advanced Configuration

```typescript
// bun.config.ts
import { i18nBunPlugin } from 'bun-plugin-i18n'

export default {
  plugins: [
    i18nBunPlugin({
      config: {
        defaultLocale: 'en',
        fallbackLocale: ['en-US', 'en'],
        sources: ['ts', 'yaml']
      },
      baseModule: './src/locales/en/index.ts', // For advanced type generation
      include: ['**/*.{ts,yml,yaml}'],
      exclude: ['**/*.test.*'],

      // Transform translation values
      transform: (value, key, locale) => {
        if (typeof value === 'string' && key.includes('currency')) {
          return locale === 'en' ? `$${value}` : `€${value}`
        }
        return value
      },

      // Validate translations
      validate: (translations, locale) => {
        const requiredKeys = ['app.title', 'app.description']
        for (const key of requiredKeys) {
          if (!getNestedValue(translations, key)) {
            return `Missing required key: ${key}`
          }
        }
        return true
      },

      // Build callback
      onBuild: async (results) => {
        console.log(`✅ Built ${results.length} locales:`)
        for (const result of results) {
          console.log(`   ${result.locale}: ${result.keyCount} keys (${result.fileSize} bytes)`)
        }
      },

      // Watch callback
      onChange: async (changedFiles) => {
        console.log(`📝 Rebuilding due to changes in: ${changedFiles.join(', ')}`)
      },

      // Error callback
      onError: (error, context) => {
        console.error(`❌ i18n Error in ${context}:`, error.message)
      }
    })
  ]
}
```

### Framework Integration

#### React/Next.js

```typescript
// hooks/useTranslation.ts
import { createTranslator } from 'ts-i18n'
import { useState, useEffect } from 'react'
import type { TypedTranslator } from '../dist/i18n/types'

export function useTranslation(locale: string = 'en') {
  const [translator, setTranslator] = useState<TypedTranslator | null>(null)

  useEffect(() => {
    async function loadTranslations() {
      // Dynamic imports with virtual modules
      const translations = await Promise.all([
        import('virtual:i18n/en.json'),
        import('virtual:i18n/es.json'),
        import('virtual:i18n/fr.json')
      ])

      const translationMap = {
        en: translations[0].default,
        es: translations[1].default,
        fr: translations[2].default
      }

      const t = createTranslator(translationMap, {
        defaultLocale: locale,
        fallbackLocale: 'en'
      })

      setTranslator(t)
    }

    loadTranslations()
  }, [locale])

  return translator
}
```

#### Svelte

```typescript
// stores/i18n.ts
import { writable } from 'svelte/store'
import { createTranslator } from 'ts-i18n'
import enTranslations from 'virtual:i18n/en.json'
import esTranslations from 'virtual:i18n/es.json'

const translations = { en: enTranslations, es: esTranslations }

function createI18nStore() {
  const { subscribe, set, update } = writable({
    locale: 'en',
    t: createTranslator(translations, { defaultLocale: 'en' })
  })

  return {
    subscribe,
    setLocale: (locale: string) => {
      update(state => ({
        ...state,
        locale,
        t: createTranslator(translations, { defaultLocale: locale, fallbackLocale: 'en' })
      }))
    }
  }
}

export const i18n = createI18nStore()
```

### Virtual Modules

The plugin provides several virtual modules:

```typescript
// Access built translations
import enTranslations from 'virtual:i18n/en.json'
import esTranslations from 'virtual:i18n/es.json'

// Access plugin configuration
import config from 'virtual:i18n/config'
console.log(config.outDir) // 'dist/i18n'
```

### Custom Transform Example

```typescript
i18nBunPlugin({
  transform: (value, key, locale) => {
    // Add locale prefix to all strings
    if (typeof value === 'string') {
      return `[${locale.toUpperCase()}] ${value}`
    }

    // Transform currency values based on locale
    if (key.includes('price') && typeof value === 'number') {
      const formatters = {
        en: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
        es: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }),
        fr: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
      }
      return formatters[locale]?.format(value) || value
    }

    return value
  }
})
```

### Validation Example

```typescript
i18nBunPlugin({
  validate: (translations, locale) => {
    // Check for required keys
    const requiredKeys = [
      'app.title',
      'app.description',
      'navigation.home',
      'navigation.about',
      'errors.notFound'
    ]

    for (const key of requiredKeys) {
      if (!getNestedValue(translations, key)) {
        return `Missing required key: ${key}`
      }
    }

    // Check for placeholder consistency
    for (const [key, value] of Object.entries(flattenObject(translations))) {
      if (typeof value === 'string') {
        const placeholders = value.match(/\{\{\s*\w+\s*\}\}/g) || []
        if (placeholders.length > 5) {
          return `Too many placeholders in ${key}: ${placeholders.join(', ')}`
        }
      }
    }

    return true
  }
})

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else {
      result[newKey] = value
    }
  }

  return result
}
```

## 🏗️ File Structure

```
project/
├── bun.config.ts          # Plugin configuration
├── locales/               # Translation files
│   ├── en/
│   │   ├── index.ts      # TypeScript translations
│   │   └── ui.yml        # YAML translations
│   ├── es/
│   │   ├── index.ts
│   │   └── ui.yml
│   └── fr.yml            # Single-file locale
├── dist/i18n/            # Generated files
│   ├── en.json           # Built translations
│   ├── es.json
│   ├── fr.json
│   └── types.d.ts        # Generated TypeScript types
└── src/
    └── app.ts            # Your application
```

## 🔄 Watch Mode

In development, the plugin automatically watches for changes in translation files and rebuilds as needed:

```typescript
i18nBunPlugin({
  watch: true, // Default in development
  onChange: async (changedFiles) => {
    console.log(`Rebuilding translations: ${changedFiles.length} files changed`)

    // Custom logic on file changes
    await notifyDevelopmentServer()
  }
})
```

## 🚨 Error Handling

```typescript
i18nBunPlugin({
  onError: (error, context) => {
    // Log to external service
    analytics.track('i18n_build_error', {
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    })

    // Notify team
    if (process.env.NODE_ENV === 'production') {
      slack.notify(`i18n build failed: ${error.message}`)
    }
  }
})
```

## 📊 Performance Monitoring

```typescript
i18nBunPlugin({
  onBuild: async (results) => {
    const totalSize = results.reduce((sum, r) => sum + r.fileSize, 0)
    const totalKeys = results.reduce((sum, r) => sum + r.keyCount, 0)

    console.log(`📊 Translation Stats:`)
    console.log(`   Total size: ${(totalSize / 1024).toFixed(1)} KB`)
    console.log(`   Total keys: ${totalKeys}`)
    console.log(`   Locales: ${results.length}`)

    // Track metrics
    metrics.gauge('i18n.bundle.size', totalSize)
    metrics.gauge('i18n.translation.keys', totalKeys)
    metrics.gauge('i18n.locales.count', results.length)
  }
})
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE.md) for details.
