# Types

```ts
export interface I18nConfig {
  translationsDir: string
  defaultLocale: string
  fallbackLocale?: string | string[]
  include?: string[]
  verbose?: boolean
  outDir?: string
  typesOutFile?: string
  sources?: ('ts' | 'yaml')[]
}

export interface TransParams {
  [key: string]: string | number
}

export type TranslationValue =
  | string
  | number
  | boolean
  | null
  | ((params?: TransParams) => string)

export interface TranslationTree {
  [key: string]: TranslationValue | TranslationTree
}

export type Dictionary = TranslationTree

export interface LocaleData {
  locale: string
  messages: TranslationTree
}

export interface BuildResult {
  locales: string[]
  files: string[]
  outputDir: string
}

export type SourceKind = 'ts' | 'yaml'

// Advanced types (excerpt)
export type DotPaths<T> = any
export type ParamsForKey<T, K extends string> = any
export type TranslatorFor<T> = any
```

See source for full definitions.
