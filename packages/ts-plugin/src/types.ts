import type { SourceKind, TranslationTree } from 'ts-i18n'

export interface TypeScriptPluginOptions {
  /**
   * Enable or disable the plugin
   * @default true
   */
  enabled?: boolean

  /**
   * Directory containing translation files
   * @default 'locales'
   */
  translationsDir?: string

  /**
   * Output directory for generated TypeScript files
   * @default 'src/types/i18n'
   */
  outDir?: string

  /**
   * Supported source file types
   * @default ['ts', 'yaml']
   */
  sources?: SourceKind[]

  /**
   * Base locale to use for type generation
   * @default 'en'
   */
  baseLocale?: string

  /**
   * Include/exclude patterns for translation files
   */
  include?: string[]
  exclude?: string[]

  /**
   * Generate smart types for YAML files by creating TypeScript declaration files
   * @default true
   */
  generateSmartTypes?: boolean

  /**
   * Generate wrapper modules for YAML files to provide TypeScript support
   * @default true
   */
  generateWrappers?: boolean

  /**
   * Watch for changes in translation files
   * @default true in development
   */
  watch?: boolean

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean

  /**
   * Custom type generation strategy
   */
  typeStrategy?: 'simple' | 'advanced' | 'hybrid'

  /**
   * Generate declaration merging for global namespace
   * @default false
   */
  globalNamespace?: boolean

  /**
   * Namespace name for global declarations
   * @default 'I18n'
   */
  namespaceName?: string

  /**
   * Transform function for type names
   */
  transformTypeName?: (key: string, locale: string) => string

  /**
   * Called after types are generated
   */
  onTypesGenerated?: (results: TypeGenerationResult[]) => void | Promise<void>

  /**
   * Called when translation files change (watch mode)
   */
  onChange?: (changedFiles: string[]) => void | Promise<void>

  /**
   * Called on generation errors
   */
  onError?: (error: Error, context?: string) => void
}

export interface TypeGenerationResult {
  locale: string
  sourceFile: string
  outputFile: string
  typeCount: number
  hasSmartTypes: boolean
}

export interface YamlTypeDefinition {
  key: string
  type: string
  value: any
  nested?: YamlTypeDefinition[]
}

export interface SmartTypeConfig {
  sourceFile: string
  outputFile: string
  locale: string
  namespace?: string
  exportType: 'default' | 'named' | 'namespace'
}

export interface FileWatcherEvent {
  type: 'add' | 'change' | 'unlink'
  path: string
  isDirectory: boolean
}
