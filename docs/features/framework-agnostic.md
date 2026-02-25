# Framework Integration

`ts-i18n` is completely framework-agnostic, designed to work seamlessly with any JavaScript framework or vanilla applications. Whether you're building with React, Vue, Svelte, Solid, Angular, or server-side templates, `ts-i18n` provides the same powerful translation capabilities.

## Universal Principles

### Core Setup Pattern

Every framework follows the same basic pattern:

1. **Load translations** at build/startup time
2. **Create translator** instance with configuration
3. **Use translator** throughout your application
4. **Optional: Emit JSON** outputs for runtime loading

```typescript
// Common setup for any framework
import { createTranslator, loadTranslations } from 'ts-i18n'

// 1. Load translations (build-time or server startup)
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// 2. Create translator
const t = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// 3. Use anywhere in your app
console.log(t('welcome.title'))
console.log(t('notifications.welcome', { name: 'Chris' }))
```

## React Integration

### Hook-Based Approach

```typescript
// hooks/useTranslation.ts
import { createContext, useContext } from 'react'
import type { TypedTranslator } from '../types/i18n'

const TranslationContext = createContext<TypedTranslator | null>(null)

export function TranslationProvider({
  children,
  translator
}: {
  children: React.ReactNode
  translator: TypedTranslator
}) {
  return (
    <TranslationContext.Provider value={translator}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const t = useContext(TranslationContext)
  if (!t) throw new Error('useTranslation must be used within TranslationProvider')
  return t
}
```

### Component Usage

```tsx
// components/WelcomeMessage.tsx
import { useTranslation } from '../hooks/useTranslation'

export function WelcomeMessage({ userName }: { userName: string }) {
  const t = useTranslation()

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.greeting', { name: userName })}</p>
      <p>{t('welcome.subtitle')}</p>
    </div>
  )
}

// components/TaskList.tsx
export function TaskList({ tasks }: { tasks: Task[] }) {
  const t = useTranslation()

  return (
    <div>
      <h2>{t('dashboard.tasks.title')}</h2>
      {tasks.length === 0 ? (
        <p>{t('dashboard.tasks.empty')}</p>
      ) : (
        <p>{t('dashboard.tasks.count', { count: tasks.length })}</p>
      )}
      {tasks.map(task => (
        <div key={task.id}>
          <span>{task.title}</span>
          <span>{t('dashboard.tasks.dueIn', { days: task.daysUntilDue })}</span>
        </div>
      ))}
    </div>
  )
}
```

### Next.js Setup

```typescript
// app/layout.tsx (App Router)
import { loadTranslations, createTranslator } from 'ts-i18n'
import { TranslationProvider } from '../hooks/useTranslation'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en'
  })

  const translator = createTranslator(translations, {
    defaultLocale: 'en'
  })

  return (
    <html>
      <body>
        <TranslationProvider translator={translator}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  )
}

// pages/_app.tsx (Pages Router)
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { createTranslator } from 'ts-i18n'
import type { TypedTranslator } from '../types/i18n'

export default function App({ Component, pageProps }: AppProps) {
  const [translator, setTranslator] = useState<TypedTranslator | null>(null)

  useEffect(() => {
    // Load translations client-side from JSON
    fetch('/api/translations/en')
      .then(res => res.json())
      .then(translations => {
        const t = createTranslator({ en: translations }, { defaultLocale: 'en' })
        setTranslator(t)
      })
  }, [])

  if (!translator) return <div>Loading...</div>

  return (
    <TranslationProvider translator={translator}>
      <Component {...pageProps} />
    </TranslationProvider>
  )
}
```

## Vue.js Integration

### Composition API

```typescript
// composables/useTranslation.ts
import { inject, provide, type InjectionKey } from 'vue'
import type { TypedTranslator } from '../types/i18n'

const TranslationKey: InjectionKey<TypedTranslator> = Symbol('translation')

export function provideTranslation(translator: TypedTranslator) {
  provide(TranslationKey, translator)
}

export function useTranslation() {
  const t = inject(TranslationKey)
  if (!t) throw new Error('Translation not provided')
  return t
}
```

### Component Usage

```vue
<!-- components/WelcomeMessage.vue -->
<template>
  <div>
    <h1>{{ t('welcome.title') }}</h1>
    <p>{{ t('welcome.greeting', { name: userName }) }}</p>
    <p>{{ t('welcome.subtitle') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../composables/useTranslation'

interface Props {
  userName: string
}

defineProps<Props>()

const t = useTranslation()
</script>
```

### Vue App Setup

```typescript
// main.ts
import { createApp } from 'vue'
import { loadTranslations, createTranslator } from 'ts-i18n'
import { provideTranslation } from './composables/useTranslation'
import App from './App.vue'

async function bootstrap() {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en'
  })

  const translator = createTranslator(translations, {
    defaultLocale: 'en'
  })

  const app = createApp(App)

  app.runWithContext(() => {
    provideTranslation(translator)
  })

  app.mount('#app')
}

bootstrap()
```

## Svelte Integration

### Store-Based Approach

```typescript
// stores/translation.ts
import { writable } from 'svelte/store'
import { createTranslator, loadTranslations } from 'ts-i18n'
import type { TypedTranslator } from '../types/i18n'

export const translator = writable<TypedTranslator | null>(null)

export async function initializeTranslations(locale = 'en') {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: locale,
    fallbackLocale: 'en'
  })

  const t = createTranslator(translations, {
    defaultLocale: locale,
    fallbackLocale: 'en'
  })

  translator.set(t)
  return t
}

// Derived store for convenience
export const t = derived(translator, ($translator) => {
  if (!$translator) {
    throw new Error('Translator not initialized')
  }
  return $translator
})
```

### Component Usage

```svelte
<!-- WelcomeMessage.svelte -->
<script lang="ts">
  import { t } from '../stores/translation'

  export let userName: string
</script>

<div>
  <h1>{$t('welcome.title')}</h1>
  <p>{$t('welcome.greeting', { name: userName })}</p>
  <p>{$t('welcome.subtitle')}</p>
</div>

<!-- TaskList.svelte -->
<script lang="ts">
  import { t } from '../stores/translation'
  import type { Task } from '../types'

  export let tasks: Task[]
</script>

<div>
  <h2>{$t('dashboard.tasks.title')}</h2>
  {#if tasks.length === 0}
    <p>{$t('dashboard.tasks.empty')}</p>
  {:else}
    <p>{$t('dashboard.tasks.count', { count: tasks.length })}</p>
    {#each tasks as task (task.id)}
      <div>
        <span>{task.title}</span>
        <span>{$t('dashboard.tasks.dueIn', { days: task.daysUntilDue })}</span>
      </div>
    {/each}
  {/if}
</div>
```

### App Initialization

```typescript
// app.ts
import App from './App.svelte'
import { initializeTranslations } from './stores/translation'

async function start() {
  await initializeTranslations('en')

  const app = new App({
    target: document.getElementById('app')!
  })

  return app
}

start()
```

## Solid.js Integration

### Context-Based Approach

```typescript
// contexts/TranslationContext.tsx
import { createContext, useContext, type ParentProps } from 'solid-js'
import type { TypedTranslator } from '../types/i18n'

const TranslationContext = createContext<TypedTranslator>()

export function TranslationProvider(props: ParentProps<{ translator: TypedTranslator }>) {
  return (
    <TranslationContext.Provider value={props.translator}>
      {props.children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const t = useContext(TranslationContext)
  if (!t) throw new Error('useTranslation must be used within TranslationProvider')
  return t
}
```

### Component Usage

```tsx
// components/WelcomeMessage.tsx
import { useTranslation } from '../contexts/TranslationContext'

export function WelcomeMessage(props: { userName: string }) {
  const t = useTranslation()

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.greeting', { name: props.userName })}</p>
      <p>{t('welcome.subtitle')}</p>
    </div>
  )
}
```

## Node.js/Express Integration

### Server-Side Setup

```typescript
// server/translations.ts
import { loadTranslations, createTranslator } from 'ts-i18n'
import type { TypedTranslator } from '../types/i18n'

let translators: Record<string, TypedTranslator> = {}

export async function initializeTranslations() {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en',
    fallbackLocale: 'en'
  })

  // Create translators for each locale
  Object.keys(translations).forEach(locale => {
    translators[locale] = createTranslator(translations, {
      defaultLocale: locale,
      fallbackLocale: 'en'
    })
  })

  return translators
}

export function getTranslator(locale: string): TypedTranslator {
  return translators[locale] || translators['en']
}
```

### Middleware Integration

```typescript
// server/middleware/i18n.ts
import type { Request, Response, NextFunction } from 'express'
import { getTranslator } from '../translations'

declare global {
  namespace Express {
    interface Request {
      t: TypedTranslator
    }
  }
}

export function i18nMiddleware(req: Request, res: Response, next: NextFunction) {
  const locale = req.headers['accept-language']?.split(',')[0] || 'en'
  req.t = getTranslator(locale)
  next()
}
```

### Route Usage

```typescript
// routes/api.ts
import { Router } from 'express'

const router = Router()

router.get('/welcome/:name', (req, res) => {
  const { name } = req.params

  res.json({
    title: req.t('welcome.title'),
    greeting: req.t('welcome.greeting', { name }),
    subtitle: req.t('welcome.subtitle')
  })
})

router.get('/dashboard/stats', (req, res) => {
  const stats = getDashboardStats() // Your data logic

  res.json({
    title: req.t('dashboard.title'),
    projectsLabel: req.t('dashboard.stats.projects'),
    tasksLabel: req.t('dashboard.stats.tasks'),
    teamLabel: req.t('dashboard.stats.team'),
    summary: req.t('dashboard.stats.summary', {
      projects: stats.projects,
      tasks: stats.tasks,
      team: stats.team
    })
  })
})

export default router
```

## Static Site Generators

### Astro Integration

```typescript
// src/lib/i18n.ts
import { loadTranslations, createTranslator } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'src/locales',
  defaultLocale: 'en'
})

export const t = createTranslator(translations, {
  defaultLocale: 'en'
})

export function getLocalizedTranslator(locale: string) {
  return createTranslator(translations, {
    defaultLocale: locale,
    fallbackLocale: 'en'
  })
}
```

```astro
---
// src/pages/index.astro
import { t } from '../lib/i18n'
import Layout from '../layouts/Layout.astro'
---

<Layout title={t('app.name')}>
  <main>
    <h1>{t('welcome.title')}</h1>
    <p>{t('welcome.subtitle')}</p>
    <p>{t('team.introduction', {
      members: 'Chris, Avery, and Buddy'
    })}</p>
  </main>
</Layout>
```

### 11ty Integration

```javascript
// .eleventy.js
const { loadTranslations, createTranslator } = require('ts-i18n')

module.exports = function(eleventyConfig) {
  eleventyConfig.addGlobalData('translations', async () => {
    const translations = await loadTranslations({
      translationsDir: 'src/locales',
      defaultLocale: 'en'
    })

    return createTranslator(translations, {
      defaultLocale: 'en'
    })
  })

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  }
}
```

```html
<!-- src/index.njk -->
---
layout: base
title: "{{ translations('app.name') }}"
---

<main>
  <h1>{{ translations('welcome.title') }}</h1>
  <p>{{ translations('welcome.subtitle') }}</p>
  <p>{{ translations('team.introduction', { members: 'Chris, Avery, and Buddy' }) }}</p>
</main>
```

## Best Practices

### 1. **Single Source of Truth**

Initialize translations once at application startup:

```typescript
// ✅ Good: Initialize once
const translations = await loadTranslations(config)
const t = createTranslator(translations, config)

// ❌ Bad: Recreating translator multiple times
function getTranslator() {
  return createTranslator(await loadTranslations(config), config)
}
```

### 2. **Lazy Loading for Large Applications**

Use JSON outputs for client-side lazy loading:

```typescript
// Build step: Generate JSON files
import { writeOutputs } from 'ts-i18n'
await writeOutputs(translations, 'public/locales')

// Runtime: Load as needed
async function loadLocale(locale: string) {
  const response = await fetch(`/locales/${locale}.json`)
  const data = await response.json()
  return createTranslator({ [locale]: data }, { defaultLocale: locale })
}
```

### 3. **Environment-Specific Configuration**

Configure differently for development vs production:

```typescript
const isDev = process.env.NODE_ENV === 'development'

const config = {
  translationsDir: 'locales',
  defaultLocale: 'en',
  verbose: isDev, // More logging in development
  sources: isDev ? ['ts', 'yaml'] : ['ts'] // Include YAML in dev for quick edits
}
```

### 4. **Type Safety Across Framework Boundaries**

Share types between client and server:

```typescript
// types/i18n.d.ts
export * from '../dist/i18n/types'

// Use everywhere
import type { TypedTranslator, TranslationKey } from './types/i18n'
```

### 5. **Fallback Strategies**

Always provide graceful fallbacks:

```typescript
const t = createTranslator(translations, {
  defaultLocale: userPreferredLocale,
  fallbackLocale: [
    userPreferredLocale.split('-')[0], // 'en-US' -> 'en'
    'en' // Ultimate fallback
  ]
})
```

### 6. **Performance Monitoring**

Track translation performance in production:

```typescript
function createMonitoredTranslator(translations: any, config: any) {
  const t = createTranslator(translations, config)

  return new Proxy(t, {
    apply(target, thisArg, args) {
      const start = performance.now()
      const result = target.apply(thisArg, args)
      const duration = performance.now() - start

      if (duration > 10) { // Log slow translations
        console.warn(`Slow translation: ${args[0]} took ${duration}ms`)
      }

      return result
    }
  })
}
```
