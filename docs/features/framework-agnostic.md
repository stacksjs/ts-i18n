# Framework-agnostic

`ts-i18n` is framework-agnostic and works across SSR or SPA setups.

- Works with React, Vue, Svelte, Solid, server templates, and more
- Load at build/startup time and reuse the translator
- Emit JSON per locale as needed for lazy loading

Example in React:

```ts
// translator.ts
import { createTranslator } from 'ts-i18n'
import trees from './dist/i18n/en.json'

export const trans = createTranslator({ en: trees }, { defaultLocale: 'en' })
```

Use wherever you render strings, on server or client.
