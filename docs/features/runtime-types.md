# Runtime + Types

Create a translator and generate types from the same source of truth.

## Runtime

```ts
import { createTranslator, loadTranslations } from 'ts-i18n'

const trees = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  sources: ['ts']
})

const trans = createTranslator(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })

trans('home.title')
trans('dynamic.hello', { name: 'Ada' })
```

## Types

```ts
import { generateTypes, generateTypesFromModule } from 'ts-i18n'

await generateTypes(trees, 'dist/i18n/keys.d.ts')
await generateTypesFromModule('./locales/en/index.ts', 'dist/i18n/keys.d.ts')
```

- Union of keys from the base locale
- Typed params and a `TranslatorFor` helper when using `generateTypesFromModule`
