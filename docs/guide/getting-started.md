# Getting Started

This guide will help you set up ts-i18n for internationalization in your TypeScript or JavaScript project.

## Installation

Install ts-i18n using your preferred package manager:

```bash
# bun
bun add ts-i18n

# npm
npm install ts-i18n

# pnpm
pnpm add ts-i18n

# yarn
yarn add ts-i18n
```

## Quick Start

### 1. Create Translation Files

Create a `locales` directory with your translation files:

```
locales/
  en/
    index.ts
    auth.ts
  es/
    index.ts
    auth.ts
```

**locales/en/index.ts**:

```typescript
import type { Dictionary } from 'ts-i18n'

export default {
  home: {
    title: 'Welcome',
    description: 'Your application description'
  },
  nav: {
    home: 'Home',
    about: 'About',
    contact: 'Contact'
  }
} satisfies Dictionary
```

**locales/es/index.ts**:

```typescript
import type { Dictionary } from 'ts-i18n'

export default {
  home: {
    title: 'Bienvenido',
    description: 'Descripcion de tu aplicacion'
  },
  nav: {
    home: 'Inicio',
    about: 'Acerca de',
    contact: 'Contacto'
  }
} satisfies Dictionary
```

### 2. Load Translations

```typescript
import { loadTranslations, createTranslator } from 'ts-i18n'

// Load all translation files
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'en',
  sources: ['ts']
})

// Create the translator function
const t = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// Use translations
console.log(t('home.title'))        // "Welcome"
console.log(t('nav.home'))          // "Home"
```

### 3. Switch Locales

```typescript
// Translate with specific locale
console.log(t('home.title', 'es'))  // "Bienvenido"
console.log(t('nav.about', 'es'))   // "Acerca de"
```

## Configuration File

Create a configuration file for the CLI and build tools:

**.config/i18n.config.ts**:

```typescript
import type { I18nConfig } from 'ts-i18n'

export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'en',
  sources: ['ts', 'yaml'],
  outDir: 'dist/i18n',
  typesOutFile: 'dist/i18n/keys.d.ts'
} satisfies I18nConfig
```

Generate a sample config:

```bash
npx ts-i18n init
```

## Directory Structures

### Option A: Single files per locale

```
locales/
  en.yml
  es.yml
  fr.yml
```

### Option B: Folders with multiple files

```
locales/
  en/
    index.ts       # Main translations
    auth.ts        # Auth-related
    dashboard.ts   # Dashboard strings
  es/
    index.ts
    auth.ts
    dashboard.ts
```

### Option C: Mixed YAML and TypeScript

```
locales/
  en/
    common.yml     # Static strings in YAML
    dynamic.ts     # Dynamic translations with functions
  es/
    common.yml
    dynamic.ts
```

## Type-Safe Translations

For the best developer experience, use TypeScript with type inference:

```typescript
import type { TranslatorFor } from 'ts-i18n'
import { createTranslator, loadTranslations } from 'ts-i18n'
import base from './locales/en/index'

type Base = typeof base

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts']
})

// Fully typed translator
const t: TranslatorFor<Base> = createTranslator<Base>(translations, {
  defaultLocale: 'en'
})

// Autocomplete and type checking
t('home.title')      // OK
t('home.tittle')     // Type error: typo detected
t('nonexistent.key') // Type error: key doesn't exist
```

## Framework Integration

### With React

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { createTranslator, loadTranslations } from 'ts-i18n'

const I18nContext = createContext<(key: string, params?: any) => string>(() => '')

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState(() => (key: string) => key)

  useEffect(() => {
    (async () => {
      const translations = await loadTranslations({
        translationsDir: 'locales',
        defaultLocale: 'en'
      })
      setT(() => createTranslator(translations, { defaultLocale: 'en' }))
    })()
  }, [])

  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>
}

export function useTrans() {
  return useContext(I18nContext)
}

// Usage in components
function MyComponent() {
  const t = useTrans()
  return <h1>{t('home.title')}</h1>
}
```

### With Vue

```typescript
import { createTranslator, loadTranslations } from 'ts-i18n'
import { createApp, inject, type InjectionKey } from 'vue'

const i18nKey: InjectionKey<(key: string, params?: any) => string> = Symbol('i18n')

export async function installI18n(app: ReturnType<typeof createApp>) {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en'
  })

  const t = createTranslator(translations, { defaultLocale: 'en' })
  app.provide(i18nKey, t)
}

export function useTrans() {
  return inject(i18nKey)!
}
```

```vue
<script setup>
import { useTrans } from './i18n'
const t = useTrans()
</script>

<template>
  <h1>{{ t('home.title') }}</h1>
</template>
```

## Next Steps

- Learn about [Translation Files](/guide/translations) format
- Set up [Type Generation](/guide/types)
- Understand [Pluralization Rules](/guide/pluralization)
