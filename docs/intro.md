<p align="center"><img src="https://github.com/stacksjs/rpx/blob/main/.github/art/cover.jpg?raw=true" alt="Social Card of this repo"></p>

# ts-i18n

Fast, Bun-native TypeScript i18n loader with YAML/TS support, runtime translation, and type generation. Framework-agnostic and easy to adopt.

## Why ts-i18n?

- Works with strict YAML and dynamic TS files
- Simple runtime translator with fallback locales
- Optional JSON outputs for bundlers
- Type-safe keys via generated `d.ts`
- Great performance using Bun and tinyglobby

## Install

```bash
bun add ts-i18n
# or npm i ts-i18n / pnpm add ts-i18n / yarn add ts-i18n
```

## Create your translations

```text
locales/
  en.yml
  pt.yml
  en/
    dynamic.ts
```

`locales/en.yml`:

```yaml
home:
  title: Home
user:
  profile:
    name: Name
```

`locales/en/dynamic.ts`:

```ts
export default {
  dynamic: {
    hello: ({ name }: { name: string }) => `Hello, ${name}`,
  },
}
```

## Use at runtime

```ts
import { createTranslator, loadTranslations } from 'ts-i18n'

const trees = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
})

const trans = createTranslator(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })

trans('home.title') // Home
trans('dynamic.hello', { name: 'Ada' }) // Hello, Ada
```

## Generate outputs and types

```ts
import { generateTypes, writeOutputs } from 'ts-i18n'

await writeOutputs(trees, 'dist/i18n')
await generateTypes(trees, 'dist/i18n/keys.d.ts')
```

Or use the CLI with a `.config/ts-i18n.config.ts`:

```bash
ts-i18n build
```
