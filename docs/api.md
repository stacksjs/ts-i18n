# API Reference

## Module: `ts-i18n`

### Types

```ts
export interface I18nConfig {
  translationsDir: string
  defaultLocale: string
  fallbackLocale?: string | string[]
  include?: string[]
  verbose?: boolean
  outDir?: string
  typesOutFile?: string
  sources?: ('ts' | 'yaml')[]
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

Loads translation files and returns a map of locale to translation tree.

```ts
import { loadTranslations } from 'ts-i18n'

const trees = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  // If include is not set, sources controls globs. TS-first by default.
  sources: ['ts', 'yaml'],
})
```

- If `include` is provided, it is used as-is (globs relative to `translationsDir`).
- Otherwise `sources` controls which file types are loaded:
  - `'ts'` → `**/*.ts`, `**/*.js` (default)
  - `'yaml'` → `**/*.yml`, `**/*.yaml`
- Resolves locale from file path:
  - `locales/en.yml` → `en`
  - `locales/en/home.yml` → merged under `en.home`
  - `locales/en/dynamic.ts` → merged under `en.dynamic`
- YAML must be strictly nested objects with primitive leaves.
- TS files must `export default` an object; values can be functions.

### `createTranslator(locales, { defaultLocale, fallbackLocale })`

Creates a translation function with fallback behavior and O(1) lookups via pre-flattened maps.

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
- Function leaves are invoked with the provided params.
- If key is not found, returns the key (visible missing indicator).

### `writeOutputs(trees, outDir)`

Writes per‑locale JSON files (function values are stripped).

```ts
import { writeOutputs } from 'ts-i18n'
await writeOutputs(trees, 'dist/i18n')
// dist/i18n/en.json, dist/i18n/pt.json, ...
```

### `generateTypes(trees, outFile)`

Generates a union type for translation keys based on the first locale.

```ts
import { generateTypes } from 'ts-i18n'
await generateTypes(trees, 'dist/i18n/keys.d.ts')
// export type TranslationKey = 'home.title' | ...
```

### `generateTypesFromModule(modulePath, outFile)`

Emits a `.d.ts` that references your base TS module and exports strongly-typed helpers.

```ts
import { generateTypesFromModule } from 'ts-i18n'
await generateTypesFromModule('./locales/en/index.ts', 'dist/i18n/keys.d.ts')
// exports: TranslationKey, ParamsFor<K>, TypedTranslator
```

### Authoring helpers

#### `satisfies Dictionary`

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

- `ts-i18n build [--ts-only|--yaml-only|--sources ts,yaml] [--types-from ./locales/en/index.ts]`
- `ts-i18n list [--ts-only|--yaml-only|--sources ts,yaml]`
- `ts-i18n check [--ts-only|--yaml-only|--sources ts,yaml]`
- `ts-i18n init --out .config/ts-i18n.config.ts`

## Security

- TS/JS translation modules and `.config/ts-i18n.config.ts` are executed at build-time; treat them as trusted code.
- Use YAML-only mode for data-only builds where execution is undesired.

## Performance

- Parallel file parsing and pre-flattened maps provide fast startup and O(1) lookups.
- JSON outputs strip function values for minimal payload.
