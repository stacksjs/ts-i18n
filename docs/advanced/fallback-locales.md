# Fallback locales

`createTranslator` accepts `fallbackLocale` as a string or array. Resolution tries:

1. Explicit `locale` (when you pass `trans(key, 'pt')`)
2. `defaultLocale`
3. `fallbackLocale` (string or each item in array order)

Unknown keys return the key itself. Prefer explicit per-request locale and keep `defaultLocale` stable.
