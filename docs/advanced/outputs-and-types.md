# Build Pipeline: Outputs and Type Generation

`ts-i18n` provides comprehensive build pipeline tools for generating JSON outputs and TypeScript types from your translation files. This system enables both development-time type safety and runtime efficiency through optimized output formats.

## JSON Output Generation

### Basic JSON Generation

The `writeOutputs` function generates JSON files from your loaded translations, stripping TypeScript functions for pure data output:

```typescript
import { loadTranslations, writeOutputs } from 'ts-i18n'

// Load all translations
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml']
})

// Generate JSON outputs
const writtenFiles = await writeOutputs(translations, 'dist/i18n')

console.log('Generated files:', writtenFiles)
// [
//   '/project/dist/i18n/en.json',
//   '/project/dist/i18n/es.json',
//   '/project/dist/i18n/fr.json'
// ]
```

### Understanding JSON Transformation

```typescript
// Input: locales/en/mixed.ts
export default {
  static: {
    title: 'Welcome',
    subtitle: 'Getting started'
  },
  dynamic: {
    greeting: ({ name }: { name: string }) => `Hello, ${name}!`,
    count: ({ items }: { items: number }) =>
      `You have ${items} ${items === 1 ? 'item' : 'items'}`
  }
} satisfies Dictionary

// Output: dist/i18n/en.json
{
  "static": {
    "title": "Welcome",
    "subtitle": "Getting started"
  }
  // Note: Dynamic functions are stripped from JSON output
}
```

## TypeScript Type Generation

### Method 1: Simple Key Union Types

For basic type safety with key validation:

```typescript
import { generateTypes, loadTranslations } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en'
})

// Generate simple union type from first locale
await generateTypes(translations, 'types/i18n-keys.d.ts')
```

**Generated output:**

```typescript
// types/i18n-keys.d.ts
export type TranslationKey =
  | "app.title"
  | "app.subtitle"
  | "navigation.home"
  | "navigation.about"
  | "user.profile.name"
  | "user.profile.email"
  | "notifications.welcome"
  | "notifications.taskDue"
  | "forms.validation.required"
  | "forms.validation.email"
```

### Method 2: Advanced Module-Based Types

For complete type safety including parameter inference:

```typescript
import { generateTypesFromModule } from 'ts-i18n'

// Generate comprehensive types from base module
await generateTypesFromModule(
  './locales/en/index.ts',      // Source module
  './types/i18n-advanced.d.ts' // Output file
)
```

**Base module structure:**

```typescript
// locales/en/index.ts
import type { Dictionary } from 'ts-i18n'

export default {
  app: {
    title: 'TeamFlow',
    subtitle: 'Collaborate with your team'
  },
  user: {
    greeting: ({ name }: { name: string }) => `Welcome, ${name}!`,
    status: ({ isOnline, lastSeen }: { isOnline: boolean; lastSeen?: Date }) => {
      if (isOnline) return 'Online now'
      if (lastSeen) return `Last seen ${lastSeen.toLocaleDateString()}`
      return 'Status unknown'
    }
  },
  tasks: {
    summary: ({ completed, total }: { completed: number; total: number }) => {
      const percentage = Math.round((completed / total) * 100)
      return `${completed}/${total} tasks completed (${percentage}%)`
    }
  }
} satisfies Dictionary
```

**Generated advanced types:**

```typescript
// types/i18n-advanced.d.ts
import type { DotPaths, ParamsForKey, TranslatorFor } from 'ts-i18n'
import * as Mod from '../locales/en/index.ts'

type Base = (
  Mod extends { default: infer D } ? D :
  Mod extends { translations: infer T } ? T :
  Mod
) extends infer X ? X : never

export type TranslationKey = DotPaths<Base>
export type ParamsFor<K extends TranslationKey> = ParamsForKey<Base, K>
export type TypedTranslator = TranslatorFor<Base>
```

## Best Practices

### 1. **Separate Build and Runtime Concerns**

```typescript
// ✅ Good: Build-time only
// scripts/build-i18n.ts
import { loadTranslations, writeOutputs } from 'ts-i18n'

// ✅ Good: Runtime only
// app/i18n.ts
import { createTranslator } from 'ts-i18n'
import translations from '../dist/i18n/en.json'
```

### 2. **Use Environment-Specific Builds**

```typescript
// Development: Include all locales and verbose output
const devConfig = {
  translationsDir: 'locales',
  outputDir: 'dist/dev/i18n',
  sources: ['ts', 'yaml'],
  verbose: true
}

// Production: Only needed locales, optimized
const prodConfig = {
  translationsDir: 'locales',
  outputDir: 'dist/prod/i18n',
  sources: ['ts'], // TypeScript only for better optimization
  verbose: false
}
```

### 3. **Validate Translation Completeness**

```typescript
// scripts/validate-translations.ts
import { loadTranslations } from 'ts-i18n'
import { collectKeys } from 'ts-i18n/utils'

async function validateTranslations() {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en'
  })

  const baseKeys = collectKeys(translations.en)
  const results = {}

  for (const [locale, tree] of Object.entries(translations)) {
    const localeKeys = collectKeys(tree)
    const missing = baseKeys.filter(key => !localeKeys.includes(key))

    results[locale] = {
      completeness: ((localeKeys.length / baseKeys.length) * 100).toFixed(1) + '%',
      missing: missing.length,
      missingKeys: missing.slice(0, 5) // Show first 5 missing keys
    }
  }

  console.table(results)
  return results
}
```

### 4. **Integrate with Build Tools**

```typescript
// Package.json scripts
{
  "scripts": {
    "i18n:build": "tsx scripts/build-i18n.ts",
    "i18n:watch": "chokidar 'locales/**/*' -c 'npm run i18n:build'",
    "i18n:validate": "tsx scripts/validate-translations.ts",
    "prebuild": "npm run i18n:build",
    "dev": "concurrently \"npm run i18n:watch\" \"next dev\""
  }
}
```

### 5. **Generate Build Manifests**

```typescript
// Generate manifest for deployment tracking
async function generateBuildManifest(translations: any, outputDir: string) {
  const manifest = {
    buildTime: new Date().toISOString(),
    locales: Object.keys(translations),
    totalKeys: Object.values(translations)
      .reduce((total, tree) => total + countKeys(tree), 0),
    version: process.env.BUILD_VERSION || 'dev'
  }

  await writeFile(
    join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )

  return manifest
}
```

This build pipeline system ensures efficient development workflows while producing optimized outputs for production deployment, maintaining type safety throughout the entire process.
