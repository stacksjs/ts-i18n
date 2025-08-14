# CLI

`ts-i18n` provides a small CLI. It reads `.config/i18n.config.ts` (via bunfig) when present.

## Install

```bash
bun add -D ts-i18n
# or: npm i -D ts-i18n / pnpm add -D ts-i18n / yarn add -D ts-i18n
```

## Commands

### build

Load translations; optionally write per-locale JSON and type definitions.

```bash
ts-i18n build [--ts-only|--yaml-only|--sources ts,yaml] [--types-from ./locales/en/index.ts]
```

- `--ts-only`: shorthand for `--sources ts`
- `--yaml-only`: shorthand for `--sources yaml`
- `--sources <list>`: comma-separated list from `ts,yaml`
- `--types-from <module>`: generate `.d.ts` by analyzing a TS module exporting your base tree

### list

Print discovered locales and their top-level namespaces count.

```bash
ts-i18n list [--ts-only|--yaml-only|--sources ts,yaml]
```

### check

Detect missing keys vs the base locale.

```bash
ts-i18n check [--ts-only|--yaml-only|--sources ts,yaml]
```

### init

Scaffold a sample `.config/i18n.config.ts` using your current defaults.

```bash
ts-i18n init --out .config/i18n.config.ts
```

## Config file

A typical config:

```ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  outDir: 'dist/i18n',
  typesOutFile: 'dist/i18n/keys.d.ts',
  sources: ['ts', 'yaml'],
}
```

See the full options in the Config and API Reference sections.
