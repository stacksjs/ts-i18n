# Usage

You can use `ts-i18n` programmatically or via the CLI.

## Library

```ts
import { createTranslator, generateTypes, loadTranslations, writeOutputs } from 'ts-i18n'

const cfg = {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
}

const trees = await loadTranslations(cfg)
const trans = createTranslator(trees, { defaultLocale: cfg.defaultLocale, fallbackLocale: cfg.fallbackLocale })

trans('home.title')
trans('dynamic.hello', { name: 'Ada' })

await writeOutputs(trees, 'dist/i18n')
await generateTypes(trees, 'dist/i18n/keys.d.ts')
```

## CLI

Create `.config/ts-i18n.config.ts` (or run `ts-i18n init`) and then:

```bash
ts-i18n build
```

Available commands:

- `build`: Load translations; if `outDir` is set, write per-locale JSON; if `typesOutFile` is set, write key types.
- `list`: Print discovered locales and their top-level namespaces count.
- `check`: Detect missing keys vs base locale.
- `init`: Scaffold a sample `.config/ts-i18n.config.ts`.

## Translations format

- YAML: strictly nested; leaves are strings/numbers/booleans/null.
- TS/JS: `export default` an object; values may be functions for dynamic messages.

Example TS file with dynamic value:

```ts
export default {
  dynamic: {
    welcome: ({ name }: { name: string }) => `Welcome, ${name}!`,
  },
}
```
