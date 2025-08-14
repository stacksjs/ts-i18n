# Config

`ts-i18n` exposes two config helpers:

```ts
import { config, defaultConfig } from 'ts-i18n'
```

- `defaultConfig`: built-in defaults
- `config`: resolved at runtime via bunfig from `.config/i18n.config.ts` when present

Defaults:

```ts
export const defaultConfig = {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: undefined,
  include: undefined,
  verbose: false,
  outDir: 'dist/i18n',
  typesOutFile: 'dist/i18n/keys.d.ts',
  sources: ['ts'],
}
```

See also: [Configuration guide](/config).
