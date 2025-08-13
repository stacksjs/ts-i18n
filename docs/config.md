# Configuration

`ts-i18n` can be configured via a `.config/ts-i18n.config.ts` file, automatically loaded by the CLI using bunfig. Programmatic usage can pass the same options object directly.

## Options

```ts
export interface I18nConfig {
  translationsDir: string // e.g. 'locales'
  defaultLocale: string // e.g. 'en'
  fallbackLocale?: string | string[] // e.g. 'pt' or ['pt', 'es']
  include?: string[] // globs relative to translationsDir (defaults: yml|yaml|ts|js)
  verbose?: boolean
  outDir?: string // write per-locale JSON to this dir (optional)
  typesOutFile?: string // write generated d.ts to this file (optional)
  sources?: ('ts' | 'yaml')[] // controls discovery when include is not provided; default ['ts']
}
```

## Example

```ts
// .config/ts-i18n.config.ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  include: ['**/*.yml', '**/*.yaml', '**/*.ts'],
  outDir: 'dist/i18n',
  typesOutFile: 'dist/i18n/keys.d.ts',
  sources: ['ts', 'yaml'],
}
```

## Scaffold

Generate a sample config from defaults:

```bash
ts-i18n init
# or customize output
ts-i18n init --out .config/ts-i18n.config.ts
```
