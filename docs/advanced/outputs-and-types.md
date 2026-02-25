# Build Pipeline: Outputs and Type Generation

`ts-i18n` provides comprehensive build pipeline tools for generating JSON outputs and TypeScript types from your translation files. This system enables both development-time type safety and runtime efficiency through optimized output formats.

## JSON Output Generation

### Basic JSON Generation

The `writeOutputs` function generates JSON files from your loaded translations, stripping TypeScript functions for pure data output:

```typescript
import { loadTranslations, writeOutputs } from 'ts-i18n'

// Load all translations
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml']
})

// Generate JSON outputs
const writtenFiles = await writeOutputs(translations, 'dist/i18n')

console.log('Generated files:', writtenFiles)
// [
//   '/project/dist/i18n/en.json',
//   '/project/dist/i18n/es.json',
//   '/project/dist/i18n/fr.json'
// ]
```

### Understanding JSON Transformation

```typescript
// Input: locales/en/mixed.ts
export default {
  static: {
    title: 'Welcome',
    subtitle: 'Getting started'
  },
  dynamic: {
    greeting: ({ name }: { name: string }) => `Hello, ${name}!`,
    count: ({ items }: { items: number }) =>
      `You have ${items} ${items === 1 ? 'item' : 'items'}`
  }
} satisfies Dictionary

// Output: dist/i18n/en.json
{
  "static": {
    "title": "Welcome",
    "subtitle": "Getting started"
  }
  // Note: Dynamic functions are stripped from JSON output
}
```

## TypeScript Type Generation

### Method 1: Simple Key Union Types

For basic type safety with key validation:

```typescript
import { generateTypes, loadTranslations } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en'
})

// Generate simple union type from first locale
await generateTypes(translations, 'types/i18n-keys.d.ts')
```

### Generated output


```typescript
// types/i18n-keys.d.ts
export type TranslationKey =
  | "app.title"
  | "app.subtitle"
  | "navigation.home"
  | "navigation.about"
  | "user.profile.name"
  | "user.profile.email"
  | "notifications.welcome"
  | "notifications.taskDue"
  | "forms.validation.required"
  | "forms.validation.email"
```

### Method 2: Advanced Module-Based Types

For complete type safety including parameter inference:

```typescript
import { generateTypesFromModule } from 'ts-i18n'

// Generate comprehensive types from base module
await generateTypesFromModule(
  './locales/en/index.ts',      // Source module
  './types/i18n-advanced.d.ts' // Output file
)
```

### Base module structure


```typescript
// locales/en/index.ts
import type { Dictionary } from 'ts-i18n'

export default {
  app: {
    title: 'TeamFlow',
    subtitle: 'Collaborate with your team'
  },
  user: {
    greeting: ({ name }: { name: string }) => `Welcome, ${name}!`,
    status: ({ isOnline, lastSeen }: { isOnline: boolean; lastSeen?: Date }) => {
      if (isOnline) return 'Online now'
      if (lastSeen) return `Last seen ${lastSeen.toLocaleDateString()}`
      return 'Status unknown'
    }
  },
  tasks: {
    summary: ({ completed, total }: { completed: number; total: number }) => {
      const percentage = Math.round((completed / total) * 100)
      return `${completed}/${total} tasks completed (${percentage}%)`
    }
  }
} satisfies Dictionary
```

### Generated advanced types


```typescript
// types/i18n-advanced.d.ts
import type { DotPaths, ParamsForKey, TranslatorFor } from 'ts-i18n'
import * as Mod from '../locales/en/index.ts'

type Base = (
  Mod extends { default: infer D } ? D :
  Mod extends { translations: infer T } ? T :
  Mod
) extends infer X ? X : never

export type TranslationKey = DotPaths<Base>
export type ParamsFor<K extends TranslationKey> = ParamsForKey<Base, K>
export type TypedTranslator = TranslatorFor<Base>
```

## Best Practices

### 1. **Separate Build and Runtime Concerns**

```typescript
// ✅ Good: Build-time only
// scripts/build-i18n.ts
import { loadTranslations, writeOutputs } from 'ts-i18n'

// ✅ Good: Runtime only
// app/i18n.ts
import { createTranslator } from 'ts-i18n'
import translations from '../dist/i18n/en.json'
```

### 2. **Use Environment-Specific Builds**

```typescript
// Development: Include all locales and verbose output
const devConfig = {
  translationsDir: 'locales',
  outputDir: 'dist/dev/i18n',
  sources: ['ts', 'yaml'],
  verbose: true
}

// Production: Only needed locales, optimized
const prodConfig = {
  translationsDir: 'locales',
  outputDir: 'dist/prod/i18n',
  sources: ['ts'], // TypeScript only for better optimization
  verbose: false
}
```

### 3. **Validate Translation Completeness**

```typescript
// scripts/validate-translations.ts
import { loadTranslations } from 'ts-i18n'
import { collectKeys } from 'ts-i18n/utils'

async function validateTranslations() {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en'
  })

  const baseKeys = collectKeys(translations.en)
  const results = {}

  for (const [locale, tree] of Object.entries(translations)) {
    const localeKeys = collectKeys(tree)
    const missing = baseKeys.filter(key => !localeKeys.includes(key))

    results[locale] = {
      completeness: ((localeKeys.length / baseKeys.length) * 100).toFixed(1) + '%',
      missing: missing.length,
      missingKeys: missing.slice(0, 5) // Show first 5 missing keys
    }
  }

  console.table(results)
  return results
}
```

### 4. **Integrate with Build Tools**

```typescript
// Package.json scripts
{
  "scripts": {
    "i18n:build": "tsx scripts/build-i18n.ts",
    "i18n:watch": "chokidar 'locales/**/*' -c 'npm run i18n:build'",
    "i18n:validate": "tsx scripts/validate-translations.ts",
    "prebuild": "npm run i18n:build",
    "dev": "concurrently \"npm run i18n:watch\" \"next dev\""
  }
}
```

### 5. **Generate Build Manifests**

```typescript
// Generate manifest for deployment tracking
async function generateBuildManifest(translations: any, outputDir: string) {
  const manifest = {
    buildTime: new Date().toISOString(),
    locales: Object.keys(translations),
    totalKeys: Object.values(translations)
      .reduce((total, tree) => total + countKeys(tree), 0),
    version: process.env.BUILD_VERSION || 'dev'
  }

  await writeFile(
    join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )

  return manifest
}
```

## CI/CD Integration and Automation

### GitHub Actions Integration

```yaml
# .github/workflows/i18n-build.yml
name: i18n Build and Validation

on:
  push:
    branches: [main, develop]
    paths: ['locales/**', 'src/**']
  pull_request:
    paths: ['locales/**', 'src/**']

jobs:
  validate-translations:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Setup Node.js

        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies

        run: npm ci

      - name: Validate translation structure

        run: npm run i18n:validate

      - name: Generate types

        run: npm run i18n:types

      - name: Build translations

        run: npm run i18n:build

      - name: Check for completeness

        run: npm run i18n:check-completeness

      - name: Upload translation artifacts

        uses: actions/upload-artifact@v4
        with:
          name: i18n-dist
          path: dist/i18n/
          retention-days: 7

  type-check:
    needs: validate-translations
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Setup Node.js

        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies

        run: npm ci

      - name: Download translation artifacts

        uses: actions/download-artifact@v4
        with:
          name: i18n-dist
          path: dist/i18n/

      - name: Type check with translations

        run: npm run type-check

      - name: Lint translation usage

        run: npm run lint:i18n-usage

  deploy-translations:
    if: github.ref == 'refs/heads/main'
    needs: [validate-translations, type-check]
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Download translation artifacts

        uses: actions/download-artifact@v4
        with:
          name: i18n-dist
          path: dist/i18n/

      - name: Deploy to CDN

        run: npm run deploy:translations
        env:
          CDN_TOKEN: ${{ secrets.CDN_TOKEN }}
          CDN_BUCKET: ${{ secrets.CDN_BUCKET }}
```

### Advanced Build Scripts

```typescript
// scripts/build-i18n-advanced.ts
import { loadTranslations, writeOutputs, generateTypes } from 'ts-i18n'
import { createHash } from 'crypto'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'

interface BuildConfig {
  environments: Array<{
    name: string
    locales: string[]
    features: string[]
    outputDir: string
    minify: boolean
    generateSourceMaps: boolean
  }>
  cdn: {
    baseUrl: string
    versionPrefix: string
  }
  validation: {
    requireFullCoverage: boolean
    allowedMissingKeys: string[]
    customValidators: Array<(translations: any) => ValidationResult>
  }
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

class AdvancedI18nBuilder {
  constructor(private config: BuildConfig) {}

  async buildAll(): Promise<void> {
    console.log('🚀 Starting advanced i18n build process...')

    // Load base translations
    const allTranslations = await loadTranslations({
      translationsDir: 'locales',
      defaultLocale: 'en',
      sources: ['ts', 'yaml']
    })

    // Validate before building
    await this.validateTranslations(allTranslations)

    // Build for each environment
    for (const env of this.config.environments) {
      await this.buildEnvironment(env, allTranslations)
    }

    // Generate deployment manifest
    await this.generateDeploymentManifest()

    console.log('✅ Build process completed successfully!')
  }

  private async validateTranslations(translations: any): Promise<void> {
    console.log('🔍 Validating translations...')

    const results: ValidationResult[] = []

    // Run built-in validators
    results.push(await this.validateCompleteness(translations))
    results.push(await this.validateTypeConsistency(translations))
    results.push(await this.validateDynamicFunctions(translations))

    // Run custom validators
    for (const validator of this.config.validation.customValidators) {
      results.push(validator(translations))
    }

    // Aggregate results
    const allErrors = results.flatMap(r => r.errors)
    const allWarnings = results.flatMap(r => r.warnings)

    if (allWarnings.length > 0) {
      console.warn('⚠️  Validation warnings:')
      allWarnings.forEach(warning => console.warn(`  - ${warning}`))
    }

    if (allErrors.length > 0) {
      console.error('❌ Validation errors:')
      allErrors.forEach(error => console.error(`  - ${error}`))
      throw new Error(`Translation validation failed with ${allErrors.length} errors`)
    }

    console.log('✅ Translation validation passed')
  }

  private async validateCompleteness(translations: any): Promise<ValidationResult> {
    const baseKeys = this.collectKeys(translations.en)
    const errors: string[] = []
    const warnings: string[] = []

    for (const [locale, tree] of Object.entries(translations)) {
      if (locale === 'en') continue

      const localeKeys = this.collectKeys(tree)
      const missingKeys = baseKeys.filter(key =>
        !localeKeys.includes(key) &&
        !this.config.validation.allowedMissingKeys.includes(key)
      )

      if (missingKeys.length > 0) {
        const message = `Locale ${locale} missing ${missingKeys.length} keys: ${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? '...' : ''}`

        if (this.config.validation.requireFullCoverage) {
          errors.push(message)
        } else {
          warnings.push(message)
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  private async validateTypeConsistency(translations: any): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check that dynamic functions have consistent signatures across locales
    const baseLocale = translations.en

    for (const [locale, tree] of Object.entries(translations)) {
      if (locale === 'en') continue

      this.validateFunctionSignatures(baseLocale, tree as any, locale, '', errors)
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  private validateFunctionSignatures(
    base: any,
    target: any,
    locale: string,
    path: string,
    errors: string[]
  ): void {
    for (const [key, value] of Object.entries(base)) {
      const currentPath = path ? `${path}.${key}` : key

      if (typeof value === 'function' && target[key]) {
        if (typeof target[key] !== 'function') {
          errors.push(`${locale}: ${currentPath} should be a function but is ${typeof target[key]}`)
        }
        // Note: Can't easily validate function parameter signatures at runtime
      } else if (typeof value === 'object' && value !== null && target[key]) {
        this.validateFunctionSignatures(value, target[key], locale, currentPath, errors)
      }
    }
  }

  private async validateDynamicFunctions(translations: any): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Test dynamic functions with sample data
    for (const [locale, tree] of Object.entries(translations)) {
      await this.testDynamicFunctions(tree as any, locale, '', errors, warnings)
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  private async testDynamicFunctions(
    obj: any,
    locale: string,
    path: string,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key

      if (typeof value === 'function') {
        try {
          // Test with sample parameters
          const sampleParams = this.generateSampleParams(value)
          const result = value(sampleParams)

          if (typeof result !== 'string') {
            warnings.push(`${locale}: ${currentPath} function returns ${typeof result}, expected string`)
          }
        } catch (error) {
          errors.push(`${locale}: ${currentPath} function error: ${(error as Error).message}`)
        }
      } else if (typeof value === 'object' && value !== null) {
        await this.testDynamicFunctions(value, locale, currentPath, errors, warnings)
      }
    }
  }

  private generateSampleParams(func: Function): any {
    // Very basic parameter generation - in real implementation,
    // you'd want more sophisticated parameter inference
    const funcStr = func.toString()

    // Look for common parameter patterns
    if (funcStr.includes('name')) return { name: 'Test' }
    if (funcStr.includes('count')) return { count: 1 }
    if (funcStr.includes('date')) return { date: new Date() }
    if (funcStr.includes('amount')) return { amount: 100 }

    return {}
  }

  private async buildEnvironment(
    env: BuildConfig['environments'][0],
    allTranslations: any
  ): Promise<void> {
    console.log(`🔨 Building environment: ${env.name}`)

    // Filter translations for this environment
    const envTranslations = this.filterTranslationsForEnvironment(allTranslations, env)

    // Create output directory
    await mkdir(env.outputDir, { recursive: true })

    // Write JSON outputs
    const outputFiles = await writeOutputs(envTranslations, env.outputDir)

    // Generate types for this environment
    await this.generateEnvironmentTypes(envTranslations, env)

    // Minify if requested
    if (env.minify) {
      await this.minifyOutputs(outputFiles)
    }

    // Generate source maps if requested
    if (env.generateSourceMaps) {
      await this.generateSourceMaps(outputFiles, envTranslations)
    }

    // Generate file hashes for caching
    await this.generateFileHashes(outputFiles, env.outputDir)

    console.log(`✅ Environment ${env.name} built successfully`)
  }

  private filterTranslationsForEnvironment(
    translations: any,
    env: BuildConfig['environments'][0]
  ): any {
    const filtered: any = {}

    for (const locale of env.locales) {
      if (translations[locale]) {
        filtered[locale] = this.filterByFeatures(translations[locale], env.features)
      }
    }

    return filtered
  }

  private filterByFeatures(translations: any, enabledFeatures: string[]): any {
    // Implement feature-based filtering
    // This would depend on how you structure feature-flagged translations
    return translations
  }

  private async generateEnvironmentTypes(
    translations: any,
    env: BuildConfig['environments'][0]
  ): Promise<void> {
    const typesPath = join(env.outputDir, 'types.d.ts')
    await generateTypes(translations, typesPath)

    // Generate environment-specific type augmentations
    const augmentationPath = join(env.outputDir, 'augmentation.d.ts')
    const augmentation = this.generateTypeAugmentation(env)
    await writeFile(augmentationPath, augmentation)
  }

  private generateTypeAugmentation(env: BuildConfig['environments'][0]): string {
    return `
// Auto-generated type augmentation for ${env.name} environment
declare module 'ts-i18n' {
  interface EnvironmentConfig {
    name: '${env.name}'
    locales: ${JSON.stringify(env.locales)}
    features: ${JSON.stringify(env.features)}
  }
}

export {}
`
  }

  private async minifyOutputs(outputFiles: string[]): Promise<void> {
    for (const file of outputFiles) {
      const content = await readFile(file, 'utf-8')
      const minified = JSON.stringify(JSON.parse(content))
      await writeFile(file, minified)
    }
  }

  private async generateSourceMaps(
    outputFiles: string[],
    originalTranslations: any
  ): Promise<void> {
    for (const file of outputFiles) {
      const sourceMap = {
        version: 3,
        file: file.split('/').pop(),
        sources: ['../locales/'],
        names: [],
        mappings: 'AAAA' // Simplified - real implementation would be more complex
      }

      await writeFile(`${file}.map`, JSON.stringify(sourceMap, null, 2))
    }
  }

  private async generateFileHashes(outputFiles: string[], outputDir: string): Promise<void> {
    const hashes: Record<string, string> = {}

    for (const file of outputFiles) {
      const content = await readFile(file, 'utf-8')
      const hash = createHash('sha256').update(content).digest('hex').slice(0, 8)
      const fileName = file.split('/').pop()!
      hashes[fileName] = hash
    }

    await writeFile(
      join(outputDir, 'file-hashes.json'),
      JSON.stringify(hashes, null, 2)
    )
  }

  private async generateDeploymentManifest(): Promise<void> {
    const manifest = {
      buildTime: new Date().toISOString(),
      version: process.env.BUILD_VERSION || 'dev',
      environments: this.config.environments.map(env => ({
        name: env.name,
        locales: env.locales,
        features: env.features,
        outputPath: env.outputDir
      })),
      cdnConfig: this.config.cdn
    }

    await writeFile('dist/deployment-manifest.json', JSON.stringify(manifest, null, 2))
  }

  private collectKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null && typeof value !== 'function') {
        keys.push(...this.collectKeys(value, fullKey))
      } else {
        keys.push(fullKey)
      }
    }

    return keys
  }
}

// Usage
const buildConfig: BuildConfig = {
  environments: [
    {
      name: 'development',
      locales: ['en', 'es', 'fr'],
      features: ['all'],
      outputDir: 'dist/dev/i18n',
      minify: false,
      generateSourceMaps: true
    },
    {
      name: 'staging',
      locales: ['en', 'es', 'fr', 'de'],
      features: ['stable', 'beta'],
      outputDir: 'dist/staging/i18n',
      minify: true,
      generateSourceMaps: true
    },
    {
      name: 'production',
      locales: ['en', 'es', 'fr', 'de', 'pt', 'it'],
      features: ['stable'],
      outputDir: 'dist/prod/i18n',
      minify: true,
      generateSourceMaps: false
    }
  ],
  cdn: {
    baseUrl: 'https://cdn.example.com/i18n',
    versionPrefix: 'v1'
  },
  validation: {
    requireFullCoverage: false,
    allowedMissingKeys: ['dev.debug._', 'internal._'],
    customValidators: []
  }
}

const builder = new AdvancedI18nBuilder(buildConfig)
await builder.buildAll()
```

### Webpack Integration

```typescript
// webpack.i18n.plugin.ts
import { Compiler, WebpackPluginInstance } from 'webpack'
import { loadTranslations, writeOutputs } from 'ts-i18n'
import { join } from 'path'

interface I18nWebpackPluginOptions {
  translationsDir: string
  outputDir: string
  locales?: string[]
  enableHMR?: boolean
  generateTypes?: boolean
}

export class I18nWebpackPlugin implements WebpackPluginInstance {
  constructor(private options: I18nWebpackPluginOptions) {}

  apply(compiler: Compiler): void {
    const pluginName = 'I18nWebpackPlugin'

    // Build translations on initial compile
    compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, callback) => {
      try {
        await this.buildTranslations()
        callback()
      } catch (error) {
        callback(error as Error)
      }
    })

    // Watch for translation file changes in development
    if (this.options.enableHMR && compiler.options.mode === 'development') {
      compiler.hooks.afterCompile.tap(pluginName, (compilation) => {
        const translationFiles = this.getTranslationFilePaths()
        translationFiles.forEach(file => {
          compilation.fileDependencies.add(file)
        })
      })

      compiler.hooks.watchRun.tapAsync(pluginName, async (compiler, callback) => {
        const changedFiles = Array.from(compiler.modifiedFiles || [])
        const translationFilesChanged = changedFiles.some(file =>
          file.includes(this.options.translationsDir)
        )

        if (translationFilesChanged) {
          try {
            await this.buildTranslations()
            console.log('🌍 Translations rebuilt due to file changes')
          } catch (error) {
            console.error('❌ Translation rebuild failed:', error)
          }
        }

        callback()
      })
    }
  }

  private async buildTranslations(): Promise<void> {
    const translations = await loadTranslations({
      translationsDir: this.options.translationsDir,
      defaultLocale: 'en'
    })

    // Filter to specific locales if specified
    const filteredTranslations = this.options.locales
      ? Object.fromEntries(
          Object.entries(translations).filter(([locale]) =>
            this.options.locales!.includes(locale)
          )
        )
      : translations

    await writeOutputs(filteredTranslations, this.options.outputDir)

    if (this.options.generateTypes) {
      const { generateTypes } = await import('ts-i18n')
      await generateTypes(
        filteredTranslations,
        join(this.options.outputDir, 'types.d.ts')
      )
    }
  }

  private getTranslationFilePaths(): string[] {
    // Implementation to get all translation file paths
    // This would use glob or similar to find all files
    return []
  }
}

// webpack.config.js usage
import { I18nWebpackPlugin } from './webpack.i18n.plugin'

export default {
  // ... other config
  plugins: [
    new I18nWebpackPlugin({
      translationsDir: 'locales',
      outputDir: 'dist/i18n',
      locales: ['en', 'es', 'fr'],
      enableHMR: true,
      generateTypes: true
    })
  ]
}
```

### Vite Integration

```typescript
// vite.i18n.plugin.ts
import { Plugin } from 'vite'
import { loadTranslations, writeOutputs } from 'ts-i18n'
import { watch } from 'chokidar'
import { join } from 'path'

interface I18nVitePluginOptions {
  translationsDir: string
  outputDir: string
  locales?: string[]
  watch?: boolean
}

export function i18nPlugin(options: I18nVitePluginOptions): Plugin {
  let watcher: ReturnType<typeof watch> | null = null

  return {
    name: 'vite-i18n-plugin',

    async buildStart() {
      // Build translations at startup
      await buildTranslations()

      // Set up file watching in development
      if (options.watch && this.meta.watchMode) {
        watcher = watch(`${options.translationsDir}/**/_`, {
          ignored: /node_modules/
        })

        watcher.on('change', async (path) => {
          console.log(`🌍 Translation file changed: ${path}`)
          await buildTranslations()

          // Trigger HMR update
          const server = (this as any).server
          if (server) {
            server.ws.send({
              type: 'full-reload'
            })
          }
        })
      }
    },

    async buildEnd() {
      if (watcher) {
        await watcher.close()
        watcher = null
      }
    },

    // Expose translations as virtual modules
    resolveId(id) {
      if (id.startsWith('virtual:i18n/')) {
        return id
      }
    },

    async load(id) {
      if (id.startsWith('virtual:i18n/')) {
        const locale = id.replace('virtual:i18n/', '')
        const translationPath = join(options.outputDir, `${locale}.json`)

        try {
          const { readFile } = await import('fs/promises')
          const content = await readFile(translationPath, 'utf-8')
          return `export default ${content}`
        } catch (error) {
          this.error(`Failed to load translation for locale ${locale}: ${error}`)
        }
      }
    }
  }

  async function buildTranslations() {
    const translations = await loadTranslations({
      translationsDir: options.translationsDir,
      defaultLocale: 'en'
    })

    const filteredTranslations = options.locales
      ? Object.fromEntries(
          Object.entries(translations).filter(([locale]) =>
            options.locales!.includes(locale)
          )
        )
      : translations

    await writeOutputs(filteredTranslations, options.outputDir)
  }
}

// vite.config.ts usage
import { defineConfig } from 'vite'
import { i18nPlugin } from './vite.i18n.plugin'

export default defineConfig({
  plugins: [
    i18nPlugin({
      translationsDir: 'locales',
      outputDir: 'dist/i18n',
      locales: ['en', 'es', 'fr'],
      watch: true
    })
  ]
})
```

### Runtime Type Validation

```typescript
// runtime-validation.ts
import type { TranslationKey, ParamsFor } from './types/i18n-advanced'

interface ValidationConfig {
  strictMode: boolean
  logLevel: 'none' | 'warn' | 'error'
  throwOnError: boolean
}

class RuntimeI18nValidator {
  private config: ValidationConfig
  private keyCache = new Set<string>()

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      strictMode: false,
      logLevel: 'warn',
      throwOnError: false,
      ...config
    }
  }

  validateKey(key: string): key is TranslationKey {
    // In a real implementation, this would check against generated types
    // For now, we'll use a runtime approach
    if (this.keyCache.has(key)) return true

    // Check if key exists in any loaded translation
    const exists = this.checkKeyExists(key)
    if (exists) {
      this.keyCache.add(key)
      return true
    }

    this.handleValidationError(`Invalid translation key: ${key}`)
    return false
  }

  validateParams<K extends TranslationKey>(
    key: K,
    params: any
  ): params is ParamsFor<K> {
    // This would ideally use generated types for validation
    // For now, we'll do basic runtime checks
    const expectedParams = this.getExpectedParams(key)

    if (!expectedParams) return true

    for (const [paramName, paramType] of Object.entries(expectedParams)) {
      if (!(paramName in params)) {
        this.handleValidationError(`Missing required parameter '${paramName}' for key '${key}'`)
        return false
      }

      const actualType = typeof params[paramName]
      if (actualType !== paramType) {
        this.handleValidationError(
          `Parameter '${paramName}' for key '${key}' should be ${paramType}, got ${actualType}`
        )
        return false
      }
    }

    return true
  }

  private checkKeyExists(key: string): boolean {
    // Implementation would check against loaded translations
    // This is a simplified version
    return true
  }

  private getExpectedParams(key: string): Record<string, string> | null {
    // Implementation would extract parameter info from translations
    // This is a simplified version
    return null
  }

  private handleValidationError(message: string): void {
    switch (this.config.logLevel) {
      case 'error':
        console.error(`[i18n] ${message}`)
        break
      case 'warn':
        console.warn(`[i18n] ${message}`)
        break
      case 'none':
        break
    }

    if (this.config.throwOnError) {
      throw new Error(message)
    }
  }
}

// Create typed translator with runtime validation
export function createValidatedTranslator<T>(
  translator: T,
  validationConfig?: Partial<ValidationConfig>
): T {
  const validator = new RuntimeI18nValidator(validationConfig)

  return new Proxy(translator as any, {
    apply(target, thisArg, args) {
      const [key, ...rest] = args

      // Validate key
      if (!validator.validateKey(key)) {
        return key // Return key as fallback
      }

      // Validate params if provided
      const params = rest.find(arg => typeof arg === 'object' && arg !== null)
      if (params && !validator.validateParams(key, params)) {
        return key // Return key as fallback
      }

      return target.apply(thisArg, args)
    }
  })
}
```

### Performance Monitoring and Analytics

```typescript
// performance-monitoring.ts
interface I18nMetrics {
  translationCount: number
  averageResolutionTime: number
  cacheHitRate: number
  fallbackUsage: Record<string, number>
  mostUsedKeys: Array<{ key: string; count: number }>
  errors: Array<{ key: string; error: string; timestamp: number }>
}

class I18nPerformanceMonitor {
  private metrics: I18nMetrics = {
    translationCount: 0,
    averageResolutionTime: 0,
    cacheHitRate: 0,
    fallbackUsage: {},
    mostUsedKeys: [],
    errors: []
  }

  private resolutionTimes: number[] = []
  private keyUsage = new Map<string, number>()
  private cacheHits = 0
  private cacheMisses = 0

  startMeasurement(): () => void {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordResolutionTime(duration)
    }
  }

  recordTranslation(key: string, fromCache: boolean, fallbackUsed?: string): void {
    this.metrics.translationCount++

    // Update key usage
    const currentCount = this.keyUsage.get(key) || 0
    this.keyUsage.set(key, currentCount + 1)

    // Update cache metrics
    if (fromCache) {
      this.cacheHits++
    } else {
      this.cacheMisses++
    }

    // Update fallback usage
    if (fallbackUsed) {
      this.metrics.fallbackUsage[fallbackUsed] =
        (this.metrics.fallbackUsage[fallbackUsed] || 0) + 1
    }

    this.updateMetrics()
  }

  recordError(key: string, error: string): void {
    this.metrics.errors.push({
      key,
      error,
      timestamp: Date.now()
    })

    // Keep only recent errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift()
    }
  }

  private recordResolutionTime(duration: number): void {
    this.resolutionTimes.push(duration)

    // Keep only recent measurements
    if (this.resolutionTimes.length > 1000) {
      this.resolutionTimes.shift()
    }
  }

  private updateMetrics(): void {
    // Update average resolution time
    if (this.resolutionTimes.length > 0) {
      this.metrics.averageResolutionTime =
        this.resolutionTimes.reduce((sum, time) => sum + time, 0) / this.resolutionTimes.length
    }

    // Update cache hit rate
    const totalCacheRequests = this.cacheHits + this.cacheMisses
    if (totalCacheRequests > 0) {
      this.metrics.cacheHitRate = this.cacheHits / totalCacheRequests
    }

    // Update most used keys
    this.metrics.mostUsedKeys = Array.from(this.keyUsage.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }))
  }

  getMetrics(): I18nMetrics {
    return { ...this.metrics }
  }

  generateReport(): string {
    const metrics = this.getMetrics()

    return `
# i18n Performance Report

## Overview

- Total translations: ${metrics.translationCount}
- Average resolution time: ${metrics.averageResolutionTime.toFixed(2)}ms
- Cache hit rate: ${(metrics.cacheHitRate _ 100).toFixed(1)}%

## Most Used Keys
${metrics.mostUsedKeys.map(({ key, count }) => `- ${key}: ${count} times`).join('\n')}

## Fallback Usage
${Object.entries(metrics.fallbackUsage).map(([locale, count]) => `- ${locale}: ${count} times`).join('\n')}

## Recent Errors
${metrics.errors.slice(-5).map(({ key, error }) => `- ${key}: ${error}`).join('\n')}
`
  }

  // Export metrics for external analytics
  exportMetrics(): any {
    return {
      ...this.getMetrics(),
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A'
    }
  }
}

// Create monitored translator
export function createMonitoredTranslator<T>(translator: T): T {
  const monitor = new I18nPerformanceMonitor()
  
  // Expose monitor globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).__i18nMonitor = monitor
  }
  
  return new Proxy(translator as any, {
    apply(target, thisArg, args) {
      const [key] = args
      const stopMeasurement = monitor.startMeasurement()

      try {
        const result = target.apply(thisArg, args)
        stopMeasurement()

        // Determine if cache was used (simplified)
        const fromCache = false // Would need actual cache implementation

        // Determine if fallback was used (simplified)
        const fallbackUsed = undefined // Would need actual fallback detection

        monitor.recordTranslation(key, fromCache, fallbackUsed)

        return result
      } catch (error) {
        stopMeasurement()
        monitor.recordError(key, (error as Error).message)
        throw error
      }
    }
  })
}
```

This build pipeline system ensures efficient development workflows while producing optimized outputs for production deployment, maintaining type safety throughout the entire process.
