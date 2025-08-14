import type { BunPlugin } from 'bun'
import type { I18nConfig } from 'ts-i18n'

export interface I18nPluginOptions {
  /**
   * Enable or disable the plugin
   * @default true
   */
  enabled?: boolean

  /**
   * Translation configuration
   */
  config?: Partial<I18nConfig>

  /**
   * Directory containing translation files
   * @default 'locales'
   */
  translationsDir?: string

  /**
   * Output directory for generated files
   * @default 'dist/i18n'
   */
  outDir?: string

  /**
   * Generate TypeScript declaration files
   * @default true
   */
  generateTypes?: boolean

  /**
   * Path for generated TypeScript types
   * @default 'dist/i18n/types.d.ts'
   */
  typesPath?: string

  /**
   * Base module path for advanced type generation
   * @default undefined (uses simple key union)
   */
  baseModule?: string

  /**
   * Watch for changes in translation files
   * @default true in development
   */
  watch?: boolean

  /**
   * Minify JSON output
   * @default false in development, true in production
   */
  minify?: boolean

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean

  /**
   * Include/exclude patterns for translation files
   */
  include?: string[]
  exclude?: string[]

  /**
   * Transform function for translation values
   */
  transform?: (value: any, key: string, locale: string) => any

  /**
   * Validation function for translations
   */
  validate?: (translations: Record<string, any>, locale: string) => boolean | string

  /**
   * Called after translations are built
   */
  onBuild?: (results: BuildResult[]) => void | Promise<void>

  /**
   * Called when translation files change (watch mode)
   */
  onChange?: (changedFiles: string[]) => void | Promise<void>

  /**
   * Called on build errors
   */
  onError?: (error: Error, context?: string) => void
}

export interface BuildResult {
  locale: string
  outputPath: string
  keyCount: number
  fileSize: number
}

export interface PluginBuilder {
  onLoad: (options: any, callback: any) => void
  onResolve: (options: any, callback: any) => void
}

export interface TranslationModule {
  default?: any
  translations?: any
  [key: string]: any
}

export interface WatcherEvent {
  type: 'add' | 'change' | 'unlink'
  path: string
}
