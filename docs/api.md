# API Reference

## Module: `ts-i18n`

### Types

```ts
export interface TsI18nConfig {
  translationsDir: string
  defaultLocale: string
  fallbackLocale?: string | string[]
  include?: string[]
  verbose?: boolean
  outDir?: string
  typesOutFile?: string
}

export type TransParams = Record<string, string | number>

export type TranslationValue =
  | string
  | number
  | boolean
  | null
  | ((params?: TransParams) => string)

export interface TranslationTree {
  [key: string]: TranslationValue | TranslationTree
}

export type Dictionary = TranslationTree

export interface LocaleData {
  locale: string
  messages: TranslationTree
}

export interface BuildResult {
  locales: string[]
  files: string[]
  outputDir: string
}
```

### Config exports

```ts
import { config, defaultConfig } from 'ts-i18n'

// defaultConfig: built-in sane defaults
// config: resolved via bunfig from .config/ts-i18n.config.ts (when available)
```

### `loadTranslations(config)`

Loads YAML and TS translation files and returns a map of locale to translation tree.

```ts
import { loadTranslations } from 'ts-i18n'

const trees = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  include: ['**/*.yml', '**/*.yaml', '**/*.ts', '**/*.js'],
})
```

- Resolves locale from file path (Option A structure):
  - `locales/en.yml` → `en`
  - `locales/en/home.yml` → merged under `en.home`
  - `locales/en/dynamic.ts` → merged under `en.dynamic`
- YAML must be strictly nested objects with primitive leaves.
- TS files must `export default` an object; values can be functions.
- Throws descriptive errors on invalid content or parsing issues.

### `createTranslator(locales, { defaultLocale, fallbackLocale })`

Creates a translation function with fallback behavior.

```ts
import { createTranslator } from 'ts-i18n'

const trans = createTranslator(trees, {
  defaultLocale: 'en',
  fallbackLocale: 'pt',
})

trans('home.title')
trans('dynamic.welcome', { name: 'Ada' })
```

- Lookup order: explicit `locale` (if provided) → `defaultLocale` → `fallbackLocale` (string or array).
- If a value is a function, it is invoked with the provided params.
- If key is not found, returns the key (visible missing indicator).

### `writeOutputs(trees, outDir)`

Writes per‑locale JSON files (function values are stripped).

```ts
import { writeOutputs } from 'ts-i18n'
await writeOutputs(trees, 'dist/i18n')
// dist/i18n/en.json, dist/i18n/pt.json, ...
```

### `generateTypes(trees, outFile)`

Generates a union type for translation keys.

```ts
import { generateTypes } from 'ts-i18n'
await generateTypes(trees, 'dist/i18n/keys.d.ts')
// export type TranslationKey = 'home.title' | ...
```

- Uses the first discovered locale as source of keys.
- For stricter guarantees, ensure your default locale contains the superset of keys.

### `generateSampleConfig(base, outFile?)`

Scaffolds a sample `.config/ts-i18n.config.ts` based on a provided base config.

```ts
import { defaultConfig, generateSampleConfig } from 'ts-i18n'
await generateSampleConfig(defaultConfig) // writes .config/ts-i18n.config.ts
```

## Authoring helpers

### `satisfies Dictionary`

Use in TS translation files for editor hints and static checks.

```ts
import type { Dictionary } from 'ts-i18n'

export default {
  home: { title: 'Home' },
  dynamic: {
    welcome: ({ name }: { name: string }) => `Welcome, ${name}!`,
  },
} satisfies Dictionary
```

## CLI

The CLI reads `.config/ts-i18n.config.ts` (via bunfig) when present.

- `ts-i18n build` → loads translations; writes JSON to `outDir` and types to `typesOutFile` (when set)
- `ts-i18n list` → prints locales and number of top‑level namespaces
- `ts-i18n check` → reports missing keys vs base locale (first discovered)
- `ts-i18n init` → scaffolds a sample config (`--out` to customize path)
