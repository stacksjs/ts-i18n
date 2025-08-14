/* eslint-disable no-console */
import type { TranslationTree } from 'ts-i18n'
import type { TypeGenerationResult, TypeScriptPluginOptions } from './types'
import { existsSync } from 'node:fs'
import { mkdir, watch, writeFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import process from 'node:process'
import { loadTranslations } from 'ts-i18n'
import {
  analyzeYamlStructure,
  capitalizeFirst,
  countKeys,
  findSourceFile,
  findYamlFile,
  generateGlobalNamespaceContent,
  generateTypeScriptDeclarationContent,
  generateUnifiedTypesContent,
  generateWrapperModuleContent,
} from './helpers'

/**
 * TypeScript plugin for ts-i18n that generates smart types for YAML files
 */
export class TypeScriptI18nPlugin {
  private options: Required<TypeScriptPluginOptions>
  private watcher: any = null
  private isGenerating = false

  constructor(options: TypeScriptPluginOptions = {}) {
    this.options = {
      enabled: true,
      translationsDir: 'locales',
      outDir: 'src/types/i18n',
      sources: ['ts', 'yaml'],
      baseLocale: 'en',
      include: [],
      exclude: [],
      generateSmartTypes: true,
      generateWrappers: true,
      watch: process.env.NODE_ENV !== 'production',
      verbose: false,
      typeStrategy: 'hybrid',
      globalNamespace: false,
      namespaceName: 'I18n',
      transformTypeName: (key, locale) => `${key}_${locale}`,
      onTypesGenerated: undefined as any,
      onChange: undefined as any,
      onError: undefined as any,
      ...options,
    }
  }

  private debug(...args: any[]) {
    if (this.options.verbose) {
      console.log('[ts-plugin-i18n]', ...args)
    }
  }

  private error(message: string, err?: Error) {
    console.error('[ts-plugin-i18n] Error:', message)
    if (err && this.options.verbose) {
      console.error(err)
    }
    this.options.onError?.(err || new Error(message), message)
  }

  /**
   * Initialize the plugin and generate types
   */
  async initialize(): Promise<TypeGenerationResult[]> {
    if (!this.options.enabled) {
      this.debug('Plugin is disabled, skipping initialization')
      return []
    }

    this.debug('Initializing TypeScript i18n plugin')

    try {
      const results = await this.generateTypes()

      if (this.options.watch) {
        await this.setupWatcher()
      }

      return results
    }
    catch (err) {
      this.error('Failed to initialize plugin', err as Error)
      throw err
    }
  }

  /**
   * Generate TypeScript types for all translation files
   */
  async generateTypes(): Promise<TypeGenerationResult[]> {
    if (this.isGenerating) {
      this.debug('Type generation already in progress, skipping')
      return []
    }

    this.isGenerating = true
    this.debug('Generating TypeScript types...')

    try {
      const startTime = Date.now()

      // Load all translations
      const translations = await loadTranslations({
        translationsDir: this.options.translationsDir,
        defaultLocale: this.options.baseLocale,
        sources: this.options.sources,
        include: this.options.include,
        verbose: this.options.verbose,
      })

      // Ensure output directory exists
      await mkdir(this.options.outDir, { recursive: true })

      const results: TypeGenerationResult[] = []

      // Generate types for each locale
      for (const [locale, tree] of Object.entries(translations)) {
        this.debug(`Generating types for locale: ${locale}`)

        if (this.options.generateSmartTypes) {
          const yamlResult = await this.generateSmartYamlTypes(locale, tree as TranslationTree)
          if (yamlResult) {
            results.push(yamlResult)
          }
        }

        if (this.options.generateWrappers) {
          const wrapperResult = await this.generateTypeScriptWrappers(locale, tree as TranslationTree)
          if (wrapperResult) {
            results.push(wrapperResult)
          }
        }
      }

      // Generate unified types
      await this.generateUnifiedTypes(translations)

      // Generate global namespace declarations if enabled
      if (this.options.globalNamespace) {
        await this.generateGlobalNamespace(translations)
      }

      const duration = Date.now() - startTime
      this.debug(`Type generation completed in ${duration}ms`)
      this.debug(`Generated types for ${results.length} locales`)

      await this.options.onTypesGenerated?.(results)

      return results
    }
    catch (err) {
      this.error('Failed to generate types', err as Error)
      throw err
    }
    finally {
      this.isGenerating = false
    }
  }

  /**
   * Generate smart TypeScript types for YAML files
   */
  private async generateSmartYamlTypes(locale: string, tree: TranslationTree): Promise<TypeGenerationResult | null> {
    try {
      const yamlFile = findYamlFile(locale, this.options.translationsDir)
      if (!yamlFile) {
        this.debug(`No YAML file found for locale: ${locale}`)
        return null
      }

      this.debug(`Generating smart types for YAML file: ${yamlFile}`)

      // Analyze YAML structure
      const typeDefinitions = analyzeYamlStructure(tree, locale)

      // Generate TypeScript declaration
      const typeContent = generateTypeScriptDeclarationContent(typeDefinitions, locale)

      // Write type file
      const outputFile = join(this.options.outDir, `${locale}.d.ts`)
      await writeFile(outputFile, typeContent)

      // Generate wrapper module for better imports
      if (this.options.generateWrappers) {
        const wrapperContent = generateWrapperModuleContent(locale, yamlFile)
        const wrapperFile = join(this.options.outDir, `${locale}.ts`)
        await writeFile(wrapperFile, wrapperContent)
      }

      return {
        locale,
        sourceFile: yamlFile,
        outputFile,
        typeCount: typeDefinitions.length,
        hasSmartTypes: true,
      }
    }
    catch (err) {
      this.error(`Failed to generate smart types for locale ${locale}`, err as Error)
      return null
    }
  }

  /**
   * Generate TypeScript wrapper modules for better integration
   */
  private async generateTypeScriptWrappers(locale: string, tree: TranslationTree): Promise<TypeGenerationResult | null> {
    try {
      const outputFile = join(this.options.outDir, `${locale}-wrapper.ts`)

      const wrapperContent = [
        `// Auto-generated TypeScript wrapper for ${locale} translations`,
        'import type { TranslatorFor, DotPaths, ParamsForKey } from \'ts-i18n\'',
        `import type { ${capitalizeFirst(locale)}Translations } from './${locale}'`,
        '',
        `export type ${capitalizeFirst(locale)}Keys = DotPaths<${capitalizeFirst(locale)}Translations>`,
        `export type ${capitalizeFirst(locale)}Params<K extends ${capitalizeFirst(locale)}Keys> = ParamsForKey<${capitalizeFirst(locale)}Translations, K>`,
        `export type ${capitalizeFirst(locale)}Translator = TranslatorFor<${capitalizeFirst(locale)}Translations>`,
        '',
        '// Re-export for convenience',
        `export type { ${capitalizeFirst(locale)}Translations }`,
        '',
      ].join('\n')

      await writeFile(outputFile, `${wrapperContent.trim()}\n`)

      return {
        locale,
        sourceFile: findSourceFile(locale, this.options.translationsDir) || '',
        outputFile,
        typeCount: countKeys(tree),
        hasSmartTypes: false,
      }
    }
    catch (err) {
      this.error(`Failed to generate wrapper for locale ${locale}`, err as Error)
      return null
    }
  }

  /**
   * Generate unified types that work across all locales
   */
  private async generateUnifiedTypes(translations: Record<string, TranslationTree>): Promise<void> {
    const locales = Object.keys(translations)
    const content = generateUnifiedTypesContent(locales, this.options.baseLocale)

    const outputFile = join(this.options.outDir, 'index.ts')
    await writeFile(outputFile, content)

    this.debug('Generated unified types at', outputFile)
  }

  /**
   * Generate global namespace declarations for easier access
   */
  private async generateGlobalNamespace(translations: Record<string, TranslationTree>): Promise<void> {
    const locales = Object.keys(translations)
    const content = generateGlobalNamespaceContent(locales, this.options.baseLocale, this.options.namespaceName)

    const outputFile = join(this.options.outDir, 'global.d.ts')
    await writeFile(outputFile, content)

    this.debug('Generated global namespace declarations at', outputFile)
  }

  /**
   * Setup file watcher for automatic regeneration
   */
  private async setupWatcher(): Promise<void> {
    if (!this.options.watch || this.watcher)
      return

    this.debug('Setting up file watcher for translations...')

    try {
      const watchDir = resolve(this.options.translationsDir)
      if (!existsSync(watchDir)) {
        this.debug(`Watch directory ${watchDir} does not exist, skipping watcher setup`)
        return
      }

      this.watcher = watch(watchDir, { recursive: true })

      let debounceTimer: Timer | null = null
      const changedFiles = new Set<string>()

      for await (const event of this.watcher) {
        if (!event.filename)
          continue

        const filePath = join(watchDir, event.filename)
        const ext = extname(filePath)

        // Only watch translation files
        if (!['.ts', '.js', '.yml', '.yaml', '.json'].includes(ext)) {
          continue
        }

        changedFiles.add(filePath)
        this.debug(`File ${event.eventType}: ${filePath}`)

        // Debounce regeneration
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }

        debounceTimer = setTimeout(async () => {
          const files = Array.from(changedFiles)
          changedFiles.clear()

          this.debug(`Regenerating types due to ${files.length} changed files`)
          await this.options.onChange?.(files)

          try {
            await this.generateTypes()
          }
          catch (err) {
            this.error('Watch regeneration failed', err as Error)
          }
        }, 100)
      }
    }
    catch (err) {
      this.error('Failed to setup file watcher', err as Error)
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.debug('Cleaning up TypeScript plugin resources...')

    if (this.watcher) {
      this.watcher.close?.()
      this.watcher = null
    }
  }
}

/**
 * Create and initialize the TypeScript i18n plugin
 */
export async function createTypeScriptI18nPlugin(options?: TypeScriptPluginOptions): Promise<TypeScriptI18nPlugin> {
  const plugin = new TypeScriptI18nPlugin(options)
  await plugin.initialize()
  return plugin
}

// Export types
export type { TypeGenerationResult, TypeScriptPluginOptions } from './types'

// Default export
export default TypeScriptI18nPlugin
