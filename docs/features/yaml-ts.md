# YAML + TS

`ts-i18n` loads translations from YAML and TS/JS files.

## YAML

- Strictly nested objects; leaves are strings/numbers/booleans/null
- Examples:

```yaml
# locales/en.yml
home:
  title: Home
user:
  profile:
    name: Name
```

```yaml
# locales/pt.yml
home:
  title: Início
```

## TypeScript / JavaScript

- Export a default object; values may be functions for dynamic messages

```ts
// locales/en/dynamic.ts
import type { Dictionary } from 'ts-i18n'

export default {
  dynamic: {
    hello: ({ name }: { name: string }) => `Hello, ${name}`,
  },
} satisfies Dictionary
```

## Discovery

By default, TS is loaded first for a TypeScript‑first workflow. Control sources explicitly via config or CLI:

```ts
// .config/i18n.config.ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml'],
}
```

```bash
# CLI equivalents
ts-i18n build --ts-only
ts-i18n build --yaml-only
ts-i18n build --sources ts,yaml
```
