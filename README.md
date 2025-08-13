<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# ts-i18n

Fast, Bun‑native TypeScript i18n loader with YAML/TS support, runtime translation, and type generation. Framework‑agnostic: use it in any template engine or with React/Vue.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Directory Structure](#directory-structure)
- [Configuration](#configuration)
- [Authoring Translations](#authoring-translations)
  - [YAML files](#yaml-files)
  - [TypeScript files (satisfies Dictionary)](#typescript-files-satisfies-dictionary)
- [Runtime API](#runtime-api)
- [CLI](#cli)
- [Type Generation](#type-generation)
- [Per‑locale JSON Output](#per-locale-json-output)
- [Framework Integration](#framework-integration)
  - [Template engines](#template-engines)
  - [React](#react)
  - [Vue](#vue)
- [Error handling](#error-handling)
- [Performance](#performance)
- [Testing](#testing)
- [License](#license)

## Overview

`ts-i18n` focuses on a simple and fast developer experience:

- Keep translations in easy‑to‑read YAML files or in TypeScript with optional dynamic values.
- Load at runtime, generate per‑locale JSON for bundlers if needed, and optionally generate type definitions for key safety.

## Features

- YAML (.yml/.yaml) and TS/JS translations
- Folder structure: `locales/en.yml` or `locales/en/*.yml|.ts`
- Runtime translator with fallback locales
- Dynamic values via functions in TS files
- Per‑locale JSON output (optional)
- Type generation for translation keys
- Framework‑agnostic; works with SSR and build steps

## Installation

```bash
# bun
bun add ts-i18n

# npm
npm i ts-i18n

# pnpm
pnpm add ts-i18n

# yarn
yarn add ts-i18n
```

## Quick Start

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

## Directory Structure

Recommended (Option A):

```text
locales/
  en.yml
  pt.yml
  en/
    auth.yml
    dynamic.ts
```

- YAML files should be strictly nested objects with primitive leaves (string/number/boolean/null).
- TS/JS files should export a default object. Values can be functions for dynamic messages.

## Configuration

`ts-i18n` reads `.config/ts-i18n.config.ts` via bunfig when using the CLI. You can also pass the same options programmatically.

```ts
export interface I18nConfig {
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

Scaffold a sample config:

```bash
# generates .config/ts-i18n.config.ts from defaults
npx ts-i18n init
```

## Authoring Translations

### YAML files

```yaml
# locales/en.yml
home:
  title: Home
user:
  profile:
    name: Name
```

### TypeScript files (satisfies Dictionary)

Use `satisfies Dictionary` for editor hints and static checks.

```ts
// locales/en/app.ts
import type { Dictionary } from 'ts-i18n'

export default {
  home: {
    title: 'Home',
  },
  dynamic: {
    welcome: ({ name }: { name: string }) => `Welcome, ${name}!`,
  },
} satisfies Dictionary
```

## Runtime API

```ts
import { createTranslator, generateTypes, loadTranslations, writeOutputs } from 'ts-i18n'

const cfg = { translationsDir: 'locales', defaultLocale: 'en', fallbackLocale: 'pt' }
const trees = await loadTranslations(cfg)
const trans = createTranslator(trees, { defaultLocale: cfg.defaultLocale, fallbackLocale: cfg.fallbackLocale })

// translate
trans('home.title')
trans('dynamic.welcome', { name: 'Ada' })

// optional outputs
await writeOutputs(trees, 'dist/i18n')
await generateTypes(trees, 'dist/i18n/keys.d.ts')
```

Notes:

- If a key is missing in the active locale, `trans` falls back to `fallbackLocale` (or returns the key if not found).
- Interpolation is handled by your template engine; for dynamic TS values, pass `params` to `trans`.

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

## Type Generation

Generates a union type of keys for DX.

```ts
import { generateTypes } from 'ts-i18n'
await generateTypes(trees, 'dist/i18n/keys.d.ts')
// -> export type TranslationKey = 'home.title' | 'user.profile.name' | ...
```

## Per‑locale JSON Output

Write serializable JSON per locale (function values are stripped).

```ts
import { writeOutputs } from 'ts-i18n'
await writeOutputs(trees, 'dist/i18n')
// -> dist/i18n/en.json, dist/i18n/pt.json, ...
```

## Framework Integration

### Template engines

Use the returned function directly: `{{ trans('user.profile.name') }}`. For dynamic messages: `{{ trans('dynamic.welcome', { name: user.name }) }}`.

### React

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

### Vue

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

## Error handling

The loader throws descriptive errors for common issues:

- Missing or invalid `translationsDir`
- No files found under `translationsDir`
- YAML parse failures (reports file path and message)
- TS module import errors
- Non‑object exports from YAML/TS
- Locale inference failure from file path

## Performance

- Uses `tinyglobby` for fast globbing.
- Minimizes allocations and performs deep merges only when necessary.
- Bun target build for optimal runtime.

## Testing

```bash
bun test
```

High coverage tests validate loader behavior, translator fallback, outputs, type generation, and edge cases.

## License

MIT — see `LICENSE.md`.
