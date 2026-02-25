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
- [Per-locale JSON Output](#per-locale-json-output)
- [Framework Integration](#framework-integration)
  - [Template engines](#template-engines)
  - [React](#react)
  - [Vue](#vue)
- [Security](#security)
- [Performance](#performance)
- [Testing](#testing)
- [License](#license)

## Overview

`ts-i18n` focuses on a simple and fast developer experience:

- Keep translations in easy‑to‑read YAML files or in TypeScript with optional dynamic values.
- Load at runtime, generate per‑locale JSON for bundlers if needed, and optionally generate type definitions for key safety.

## Features

- YAML (.yml/.yaml) and TS/JS translations
- Folder structure: `locales/en.yml` or `locales/en/*.yml` or `locales/en/*.ts`
- Runtime translator with fallback locales
- Dynamic values via functions in TS files
- Per‑locale JSON output (optional)
- Type generation for translation keys
- Type‑safe keys and parameter inference from TS base locale (optional)
- TS‑first by default; enable YAML as needed

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
import type { TranslatorFor } from 'ts-i18n'
import { createTranslator, loadTranslations } from 'ts-i18n'
import base from './locales/en/index'

type Base = typeof base

const trees = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  sources: ['ts'], // TS-first
})

const trans: TranslatorFor<Base> = createTranslator<Base>(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })

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

`ts-i18n` reads `.config/i18n.config.ts` via bunfig when using the CLI. You can also pass the same options programmatically.

```ts
export interface I18nConfig {
  translationsDir: string // e.g. 'locales'
  defaultLocale: string // e.g. 'en'
  fallbackLocale?: string | string[] // e.g. 'pt' or ['pt', 'es']
  include?: string[] // optional globs relative to translationsDir. If set, overrides sources
  verbose?: boolean
  outDir?: string // where to write per-locale JSON (optional)
  typesOutFile?: string // where to write generated d.ts (optional)
  sources?: ('ts' | 'yaml')[] // default: ['ts']
}
```

Sample config:

```ts
// .config/i18n.config.ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  sources: ['ts', 'yaml'],
  outDir: 'dist/i18n',
  typesOutFile: 'dist/i18n/keys.d.ts',
}
```

Scaffold a sample config:

```bash
# generates .config/i18n.config.ts from defaults
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

const cfg = { translationsDir: 'locales', defaultLocale: 'en', fallbackLocale: 'pt', sources: ['ts'] }
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
# Build per-locale JSON (when outDir is set) and generate types
# TS-only / YAML-only / explicit sources
ts-i18n build --ts-only
ts-i18n build --yaml-only
ts-i18n build --sources ts,yaml

# Generate types from a TS base module (zero parsing required)
ts-i18n build --types-from ./locales/en/index.ts

# List discovered locales and their top-level namespaces
ts-i18n list --sources ts,yaml

# Check missing keys vs base locale
ts-i18n check --sources ts,yaml

# Create a sample config file
ts-i18n init --out .config/i18n.config.ts
```

## Type Generation

Generates a union type of keys for DX.

```ts
import { generateTypes } from 'ts-i18n'
await generateTypes(trees, 'dist/i18n/keys.d.ts')
// -> export type TranslationKey = 'home.title' | 'user.profile.name' | ...
```

If your base locale is authored in TypeScript, you can generate fully typed keys and parameter types inferred from the TS file (including function params for dynamic messages):

```ts
import { generateTypesFromModule } from 'ts-i18n'

// path is resolved by TypeScript at type time; keep it the same path you import from in your app
await generateTypesFromModule('./locales/en/index.ts', 'dist/i18n/keys.d.ts')
```

This emits a declaration file that exports the following types:

```ts
// dist/i18n/keys.d.ts
export type TranslationKey // dot‑path keys inferred from your base TS object
export type ParamsFor<K extends TranslationKey> // parameter type for dynamic function leaves
export type TypedTranslator // a translator type constrained to the inferred keys/params
```

Usage in your app:

```ts
import type { ParamsFor, TranslationKey, TypedTranslator } from './dist/i18n/keys'
import { createTranslator, loadTranslations } from 'ts-i18n'

const trees = await loadTranslations({ translationsDir: 'locales', defaultLocale: 'en' })

// Option A: annotate the returned translator
const trans: TypedTranslator = createTranslator(trees, { defaultLocale: 'en' })

// Option B: use the generic to bind the base type yourself
// import type Base from './locales/en/index'
// const trans = createTranslator<Base>(trees, { defaultLocale: 'en' })

// Auto‑complete on keys, and correct param types per key
trans('home.title')
trans('dynamic.welcome', { name: 'Ada' })
//            ^? ParamsFor<'dynamic.welcome'> → { name: string }
```

## Per-locale JSON Output

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

## Security

- TS/JS translation modules and `.config/i18n.config.ts` execute at build-time. Treat them as trusted code.
- Prefer YAML-only builds for untrusted sources.

## Performance

- Parallel file parsing and pre-flattened lookup maps for O(1) translations.
- JSON outputs strip function values.

## Testing

```bash
bun test
```

High coverage tests validate loader behavior, translator fallback, outputs, type generation, and edge cases.

## License

MIT — see `LICENSE.md`.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/ts-i18n?style=flat-square
[npm-version-href]: https://npmjs.com/package/ts-i18n
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/ts-i18n/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/ts-i18n/actions/workflows/ci.yml
