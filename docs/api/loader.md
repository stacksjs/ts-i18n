# loadTranslations

```ts
import { loadTranslations } from 'ts-i18n'

const trees = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  sources: ['ts', 'yaml'],
})
```

- Discovers files under `translationsDir`.
- If `include` is provided, it is used as-is (globs relative to `translationsDir`).
- Otherwise, `sources` controls patterns:
  - `ts` → `**/*.ts`, `**/*.js`
  - `yaml` → `**/*.yml`, `**/*.yaml`
- Locale is inferred from the top-level folder or filename:
  - `locales/en.yml` → `en`
  - `locales/en/home.yml` → merged under `en.home`
  - `locales/en/dynamic.ts` → merged under `en.dynamic`
- YAML must be strictly nested with primitive leaves.
- TS/JS must export a default object (or `translations`/module export); values can be functions.
