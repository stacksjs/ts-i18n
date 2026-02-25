/* eslint-disable no-console */
import type { BunPlugin } from 'bun'
import type { BuildResult, I18nPluginOptions } from './types'
import { existsSync } from 'node:fs'
import { mkdir, stat, watch } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { generateTypes, generateTypesFromModule, loadTranslations, writeOutputs } from 'ts-i18n'

/**
 * Bun plugin for ts-i18n that provides build-time translation processing
 * with watch mode, type generation, and configurable output
 */
function i18nBunPlugin(options: I18nPluginOptions = {}): BunPlugin {
  const {
    enabled = true,
    config = {},
    translationsDir = 'locales',
    outDir = 'dist/i18n',
    generateTypes: shouldGenerateTypes = true,
    typesPath = 'dist/i18n/types.d.ts',
    baseModule,
    watch: shouldWatch = process.env.NODE_ENV !== 'production',
    minify: _minify = process.env.NODE_ENV === 'production',
    verbose = false,
    include,
    exclude,
    transform,
    validate,
    onBuild,
    onChange,
    onError,
  } = options

  const debug = (...args: any[]) => {
    if (verbose) {
      console.log('[bun-plugin-i18n]', ...args)
    }
  }

  const error = (message: string, err?: Error) => {
    console.error('[bun-plugin-i18n] Error:', message)
    if (err && verbose) {
      console.error(err)
    }
    onError?.(err || new Error(message), message)
  }

  let isBuilding = false
  let watcher: any = null

  const buildTranslations = async (): Promise<BuildResult[]> => {
    if (isBuilding) {
      debug('Build already in progress, skipping')
      return []
    }

    isBuilding = true
    debug('Building translations...')

    try {
      const startTime = Date.now()

      // Load translations with plugin configuration
      const loadConfig = {
        translationsDir,
        defaultLocale: config.defaultLocale || 'en',
        fallbackLocale: config.fallbackLocale,
        sources: config.sources || ['ts', 'yaml'],
        include,
        exclude,
        verbose,
        ...config,
      }

      debug('Loading translations with config:', loadConfig)
      const translations = await loadTranslations(loadConfig)

      // Apply transform function if provided
      if (transform) {
        for (const [locale, tree] of Object.entries(translations)) {
          transformTree(tree as Record<string, any>, locale, transform)
        }
      }

      // Validate translations if validator provided
      if (validate) {
        for (const [locale, tree] of Object.entries(translations)) {
          const result = validate(tree as Record<string, any>, locale)
          if (result !== true) {
            throw new Error(`Validation failed for locale ${locale}: ${result}`)
          }
        }
      }

      // Ensure output directory exists
      await mkdir(outDir, { recursive: true })

      // Write JSON outputs
      debug('Writing JSON outputs...')
      const outputFiles = await writeOutputs(translations, outDir)

      // Generate TypeScript types
      if (shouldGenerateTypes) {
        debug('Generating TypeScript types...')
        await mkdir(dirname(typesPath), { recursive: true })

        if (baseModule) {
          // Advanced type generation from base module
          await generateTypesFromModule(baseModule, typesPath)
          debug(`Generated advanced types from ${baseModule}`)
        }
        else {
          // Simple key union type generation
          await generateTypes(translations, typesPath)
          debug('Generated simple union types')
        }
      }

      // Collect build results
      const results: BuildResult[] = await Promise.all(
        outputFiles.map(async (filePath) => {
          const stats = await stat(filePath)
          const locale = relative(outDir, filePath).replace('.json', '')
          const keyCount = countKeys(translations[locale] || {})

          return {
            locale,
            outputPath: filePath,
            keyCount,
            fileSize: stats.size,
          }
        }),
      )

      const duration = Date.now() - startTime
      debug(`Build completed in ${duration}ms`)
      debug(`Generated ${results.length} locale files`)

      // Call build callback
      await onBuild?.(results)

      return results
    }
    catch (err) {
      error('Failed to build translations', err as Error)
      throw err
    }
    finally {
      isBuilding = false
    }
  }

  const setupWatcher = async () => {
    if (!shouldWatch || watcher)
      return

    debug('Setting up file watcher...')

    try {
      const watchDir = resolve(translationsDir)
      if (!existsSync(watchDir)) {
        debug(`Watch directory ${watchDir} does not exist, skipping watcher setup`)
        return
      }

      watcher = watch(watchDir, { recursive: true })

      let debounceTimer: Timer | null = null
      const changedFiles = new Set<string>()

      for await (const event of watcher) {
        if (!event.filename)
          continue

        const filePath = join(watchDir, event.filename)
        const ext = extname(filePath)

        // Only watch translation files
        if (!['.ts', '.js', '.yml', '.yaml', '.json'].includes(ext)) {
          continue
        }

        changedFiles.add(filePath)
        debug(`File ${event.eventType}: ${filePath}`)

        // Debounce rebuilds
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }

        debounceTimer = setTimeout(async () => {
          const files = Array.from(changedFiles)
          changedFiles.clear()

          debug(`Rebuilding due to ${files.length} changed files`)
          await onChange?.(files)

          try {
            await buildTranslations()
          }
          catch (err) {
            error('Watch rebuild failed', err as Error)
          }
        }, 100)
      }
    }
    catch (err) {
      error('Failed to setup file watcher', err as Error)
    }
  }

  const cleanup = async () => {
    debug('Cleaning up plugin resources...')

    if (watcher) {
      watcher.close?.()
      watcher = null
    }
  }

  return {
    name: 'bun-plugin-i18n',
    async setup(build) {
      if (!enabled) {
        debug('Plugin is disabled, skipping setup')
        return
      }

      debug('Setting up ts-i18n plugin')

      // Initial build
      try {
        await buildTranslations()
      }
      catch (err) {
        error('Initial build failed', err as Error)
        // Don't throw - allow the build to continue
      }

      // Setup file watching if enabled
      if (shouldWatch) {
        setupWatcher().catch((err) => {
          error('Failed to setup watcher', err as Error)
        })
      }

      // Hook into translation file resolution
      build.onResolve({ filter: /^virtual:i18n/ }, (args) => {
        debug('Resolving virtual i18n import:', args.path)
        return {
          path: args.path,
          namespace: 'i18n',
        }
      })

      // Provide virtual modules for translation imports
      build.onLoad({ filter: /.*/, namespace: 'i18n' }, async (args) => {
        debug('Loading virtual i18n module:', args.path)

        try {
          const match = args.path.match(/^virtual:i18n\/(.+)$/)
          if (!match) {
            throw new Error(`Invalid virtual i18n path: ${args.path}`)
          }

          const [, path] = match

          if (path === 'config') {
            // Provide build configuration
            return {
              contents: `export default ${JSON.stringify({
                outDir,
                typesPath,
                translationsDir,
                config,
              })}`,
              loader: 'js',
            }
          }
          else if (path.endsWith('.json')) {
            // Provide built translation files
            const locale = path.replace('.json', '')
            const filePath = join(outDir, `${locale}.json`)

            if (existsSync(filePath)) {
              const content = await Bun.file(filePath).text()
              return {
                contents: `export default ${content}`,
                loader: 'js',
              }
            }
          }

          throw new Error(`Virtual i18n module not found: ${path}`)
        }
        catch (err) {
          error(`Failed to load virtual module ${args.path}`, err as Error)
          return {
            contents: 'export default {}',
            loader: 'js',
          }
        }
      })

      // Handle process exit cleanup
      const exitHandler = () => {
        cleanup().catch((err) => {
          console.error('Cleanup failed:', err)
        })
      }

      process.once('SIGINT', exitHandler)
      process.once('SIGTERM', exitHandler)
      process.once('exit', exitHandler)

      debug('Plugin setup complete')
    },
  }
}

// Helper functions
function transformTree(tree: Record<string, any>, locale: string, transform: (value: any, key: string, locale: string) => any, prefix = '') {
  for (const [key, value] of Object.entries(tree)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      transformTree(value, locale, transform, fullKey)
    }
    else {
      tree[key] = transform(value, fullKey, locale)
    }
  }
}

function countKeys(obj: any, depth = 0): number {
  if (depth > 10)
    return 0 // Prevent infinite recursion

  let count = 0
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      count += countKeys(value, depth + 1)
    }
    else if (typeof value === 'string' || typeof value === 'function') {
      count++
    }
  }
  return count
}

export { i18nBunPlugin }
export default i18nBunPlugin
export type { BuildResult, I18nPluginOptions } from './types'
