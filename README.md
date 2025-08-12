<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# ts-i18n

Fast, Bun-native TypeScript i18n loader with YAML/TS support, runtime translation, and type generation. Framework-agnostic: use it in any template engine or with React/Vue.

## Features

- YAML (.yml/.yaml) and TS/JS translations
- Option A folder structure: `locales/en.yml` or `locales/en/*.yml|.ts`
- Runtime loader with fallback locales
- Dynamic values via functions in TS files
- Optional per-locale JSON output
- Type generation for translation keys
- Zero-interop with frameworks; works in SSR and build steps

## Install

```bash
# bun
bun add ts-i18n

# npm
npm i ts-i18n

# pnpm
dpnm add ts-i18n

# yarn
yarn add ts-i18n
```

## Quick start

```ts
import { createTranslator, loadTranslations } from 'ts-i18n'

const trees = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
})

const trans = createTranslator(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })

trans('home.title') // "Home"
trans('dynamic.hello', { name: 'Ada' }) // "Hello, Ada"
```

### Folder structure (Option A)

```text
locales/
  en.yml
  pt.yml
  en/
    auth.yml
    dynamic.ts
```

- YAML files must be strictly nested objects with string/number/boolean/null leaves.
- TS/JS files should export a default object. Values can be functions for dynamic messages.

`locales/en/dynamic.ts`:

```ts
export default {
  dynamic: {
    hello: ({ name }: { name: string }) => `Hello, ${name}`,
  },
}
```

## Config

`ts-i18n` reads `.config/ts-i18n.config.ts` via bunfig when used through the CLI. You can also pass the config object directly to APIs.

```ts
export interface TsI18nConfig {
  translationsDir: string // e.g. 'locales'
  defaultLocale: string // e.g. 'en'
  fallbackLocale?: string | string[] // e.g. 'pt' or ['pt', 'es']
  include?: string[] // globs relative to translationsDir
  verbose?: boolean
  outDir?: string // where to write per-locale JSON (optional)
  typesOutFile?: string // where to write generated d.ts (optional)
}
```

Sample config:

```ts
// .config/ts-i18n.config.ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  include: ['**/*.yml', '**/*.yaml', '**/*.ts'],
  outDir: 'dist/i18n',
  typesOutFile: 'dist/i18n/keys.d.ts',
}
```

You can scaffold a sample config:

```bash
# generates .config/ts-i18n.config.ts from defaults
npx ts-i18n init
```

## CLI

```bash
# Build per-locale JSON (when outDir is set) and generate types (when typesOutFile is set)
ts-i18n build

# List discovered locales and their top-level namespaces
ts-i18n list

# Check missing keys vs base locale
ts-i18n check

# Create a sample config file
ts-i18n init --out .config/ts-i18n.config.ts
```

## Programmatic API

```ts
import { createTranslator, generateTypes, loadTranslations, writeOutputs } from 'ts-i18n'

const cfg = { translationsDir: 'locales', defaultLocale: 'en', fallbackLocale: 'pt' }
const trees = await loadTranslations(cfg)
const trans = createTranslator(trees, { defaultLocale: cfg.defaultLocale, fallbackLocale: cfg.fallbackLocale })

await writeOutputs(trees, 'dist/i18n')
await generateTypes(trees, 'dist/i18n/keys.d.ts')
```

## Using with template engines

- Use the returned `trans` function directly in your renderer. Example: `{{ trans('user.profile.name') }}`.
- Interpolation is handled by the template engine; for dynamic TS values, pass params: `trans('dynamic.hello', { name: 'Ada' })`.

## Using with React

```tsx
import React, { createContext, useContext } from 'react'
import { createTranslator, loadTranslations } from 'ts-i18n'

const I18nContext = createContext<(k: string, p?: any) => string>(() => '')

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [transFn, setTransFn] = React.useState(() => (k: string) => k)

  React.useEffect(() => {
    (async () => {
      const trees = await loadTranslations({ translationsDir: 'locales', defaultLocale: 'en', fallbackLocale: 'pt' })
      setTransFn(() => createTranslator(trees, { defaultLocale: 'en', fallbackLocale: 'pt' }))
    })()
  }, [])

  return <I18nContext.Provider value={transFn}>{children}</I18nContext.Provider>
}

export function useTrans() {
  return useContext(I18nContext)
}
```

## Using with Vue

```ts
import { createTranslator, loadTranslations } from 'ts-i18n'
import { createApp, inject } from 'vue'

const key = Symbol('i18n')

export async function installI18n(app) {
  const trees = await loadTranslations({ translationsDir: 'locales', defaultLocale: 'en', fallbackLocale: 'pt' })
  const trans = createTranslator(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })
  app.provide(key, trans)
}

export function useTrans() {
  return inject(key)
}
```

## Testing

```bash
bun test
```

## License

MIT — see `LICENSE.md`.
