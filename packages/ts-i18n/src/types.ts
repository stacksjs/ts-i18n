export interface TsI18nConfig {
  translationsDir: string
  defaultLocale: string
  fallbackLocale?: string | string[]
  include?: string[]
  verbose?: boolean
  outDir?: string
  typesOutFile?: string
}

export interface TransParams {
  [key: string]: string | number
}

export type TranslationValue = string | number | boolean | null | ((params?: TransParams) => string)

export type TranslationTree = {
  [key: string]: TranslationValue | TranslationTree
}

export interface LocaleData {
  locale: string
  messages: TranslationTree
}

export interface BuildResult {
  locales: string[]
  files: string[]
  outputDir: string
}
