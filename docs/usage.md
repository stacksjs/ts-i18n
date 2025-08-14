# Usage

You can use `ts-i18n` programmatically or via the CLI.

## Library (TS-first)

```ts
import type { DotPaths, ParamsForKey, TranslatorFor } from 'ts-i18n'
import { createTranslator, loadTranslations, writeOutputs } from 'ts-i18n'
import base from './locales/en/index'

type Base = typeof base
type Key = DotPaths<Base>
type Params<K extends Key> = ParamsForKey<Base, K>
type T = TranslatorFor<Base>

const cfg = {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  sources: ['ts'],
}

const trees = await loadTranslations(cfg)
const trans: T = createTranslator<Base>(trees, { defaultLocale: cfg.defaultLocale, fallbackLocale: cfg.fallbackLocale })

trans('home.title')
trans('dynamic.hello', { name: 'Ada' })

await writeOutputs(trees, 'dist/i18n')
```

### Authoring TS files with type safety

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

## CLI

Create `.config/i18n.config.ts` (or run `ts-i18n init`) and then:

```bash
# TS-first
ts-i18n build --ts-only

# YAML-only (data-only path)
ts-i18n build --yaml-only

# Mix sources explicitly
ts-i18n build --sources ts,yaml

# Generate types from a TS base module
ts-i18n build --types-from ./locales/en/index.ts
```

Available commands:

- `build`: Load translations; if `outDir` is set, write per-locale JSON; if `typesOutFile` is set or `--types-from` provided, write types.
- `list`: Print discovered locales and their top-level namespaces count.
- `check`: Detect missing keys vs base locale.
- `init`: Scaffold a sample `.config/i18n.config.ts`.

## Translations format

- YAML: strictly nested; leaves are strings/numbers/booleans/null.
- TS/JS: `export default` an object; values may be functions for dynamic messages.

Example TS file with dynamic value:

```ts
export default {
  dynamic: {
    welcome: ({ name }: { name: string }) => `Welcome, ${name}!`,
  },
} satisfies Dictionary
```
