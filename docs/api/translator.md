# createTranslator

```ts
import { createTranslator } from 'ts-i18n'

const trans = createTranslator(trees, {
  defaultLocale: 'en',
  fallbackLocale: 'pt', // string or string[]
})

trans('home.title')
trans('dynamic.welcome', { name: 'Ada' })
```

- Flattens trees to O(1) lookups.
- Lookup order: explicit `locale` (if provided) → `defaultLocale` → `fallbackLocale` (string or array).
- Function leaves are called with params and must return strings.
- When a key is not found, the key itself is returned.
