/* eslint-disable no-console */
// Advanced configuration example with all features
import { i18nBunPlugin } from 'bun-plugin-i18n'

export default {
  plugins: [
    i18nBunPlugin({
      // Core settings
      enabled: true,
      translationsDir: 'src/locales',
      outDir: 'dist/translations',
      generateTypes: true,
      typesPath: 'src/types/i18n.d.ts',
      baseModule: './src/locales/en/index.ts', // Advanced type generation
      watch: process.env.NODE_ENV === 'development',
      minify: process.env.NODE_ENV === 'production',
      verbose: process.env.DEBUG === 'true',

      // Translation configuration
      config: {
        defaultLocale: 'en',
        fallbackLocale: ['en-US', 'en'],
        sources: ['ts', 'yaml', 'json']
      },

      // File patterns
      include: ['**/*.{ts,js,yml,yaml,json}'],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/node_modules/**'
      ],

      // Custom transform function
      transform: (value, key, locale) => {
        // Add environment-specific prefixes
        if (process.env.NODE_ENV === 'development' && typeof value === 'string') {
          return `[DEV] ${value}`
        }

        // Format currency based on locale
        if (key.includes('price') && typeof value === 'number') {
          const formatters = {
            'en': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
            'en-GB': new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
            'es': new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }),
            'fr': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }),
            'de': new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
            'ja': new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })
          }
          return formatters[locale]?.format(value) || `${value}`
        }

        // Format dates based on locale
        if (key.includes('date') && value instanceof Date) {
          const formatters = {
            'en': new Intl.DateTimeFormat('en-US'),
            'es': new Intl.DateTimeFormat('es-ES'),
            'fr': new Intl.DateTimeFormat('fr-FR'),
            'de': new Intl.DateTimeFormat('de-DE'),
            'ja': new Intl.DateTimeFormat('ja-JP')
          }
          return formatters[locale]?.format(value) || value.toISOString()
        }

        return value
      },

      // Custom validation function
      validate: (translations, locale) => {
        // Required keys for all locales
        const requiredKeys = [
          'app.title',
          'app.description',
          'navigation.home',
          'navigation.about',
          'navigation.contact',
          'errors.notFound',
          'errors.serverError',
          'common.save',
          'common.cancel',
          'common.loading'
        ]

        // Check for missing required keys
        for (const key of requiredKeys) {
          if (!getNestedValue(translations, key)) {
            return `Missing required key: ${key}`
          }
        }

        // Check for orphaned placeholders
        const flattened = flattenObject(translations)
        for (const [key, value] of Object.entries(flattened)) {
          if (typeof value === 'string') {
            // Check for unmatched placeholder brackets
            const openBrackets = (value.match(/\{/g) || []).length
            const closeBrackets = (value.match(/\}/g) || []).length
            if (openBrackets !== closeBrackets) {
              return `Unmatched placeholder brackets in ${key}: "${value}"`
            }

            // Check for suspicious placeholder patterns
            const suspiciousPatterns = [
              /\{\{[^}]*$/,  // Unclosed double brackets
              /^[^{]*\}\}/,  // Closing brackets without opening
              /\{\s*\}/      // Empty placeholders
            ]

            for (const pattern of suspiciousPatterns) {
              if (pattern.test(value)) {
                return `Suspicious placeholder pattern in ${key}: "${value}"`
              }
            }
          }
        }

        // Locale-specific validations
        if (locale === 'en') {
          // English should have all base keys
          const keyCount = Object.keys(flattened).length
          if (keyCount < 50) {
            return `English locale has too few keys (${keyCount}), expected at least 50`
          }
        } else {
          // Other locales should have at least 70% coverage
          const englishKeys = getEnglishKeyCount()
          const currentKeys = Object.keys(flattened).length
          const coverage = (currentKeys / englishKeys) * 100

          if (coverage < 70) {
            return `Locale ${locale} has insufficient coverage: ${coverage.toFixed(1)}% (${currentKeys}/${englishKeys} keys)`
          }
        }

        return true
      },

      // Build completion callback
      onBuild: async (results) => {
        const totalSize = results.reduce((sum, r) => sum + r.fileSize, 0)
        const totalKeys = results.reduce((sum, r) => sum + r.keyCount, 0)
        const avgKeySize = totalSize / totalKeys

        console.log('\n📊 Translation Build Report')
        console.log('============================')
        console.log(`Total bundle size: ${formatBytes(totalSize)}`)
        console.log(`Total translation keys: ${totalKeys.toLocaleString()}`)
        console.log(`Average key size: ${formatBytes(avgKeySize)}`)
        console.log(`Locales built: ${results.length}`)
        console.log()

        console.log('Per-locale breakdown:')
        for (const result of results.sort((a, b) => b.fileSize - a.fileSize)) {
          const coverage = ((result.keyCount / totalKeys) * 100).toFixed(1)
          console.log(`  ${result.locale.padEnd(6)}: ${formatBytes(result.fileSize).padStart(8)} | ${result.keyCount.toString().padStart(4)} keys (${coverage}%)`)
        }

        // Log warnings for large bundles
        if (totalSize > 1024 * 1024) { // > 1MB
          console.warn(`⚠️  Large translation bundle: ${formatBytes(totalSize)}`)
        }

        // Log warnings for incomplete locales
        const incompleteLocales = results.filter(r => r.keyCount < totalKeys * 0.8)
        if (incompleteLocales.length > 0) {
          console.warn(`⚠️  Incomplete locales detected: ${incompleteLocales.map(r => r.locale).join(', ')}`)
        }

        // Send metrics to monitoring service (if configured)
        if (process.env.METRICS_ENDPOINT) {
          await sendMetrics({
            'i18n.bundle.size': totalSize,
            'i18n.keys.total': totalKeys,
            'i18n.locales.count': results.length,
            'i18n.avg_key_size': avgKeySize
          })
        }
      },

      // File change callback
      onChange: async (changedFiles) => {
        const fileTypes = changedFiles.reduce((acc, file) => {
          const ext = file.split('.').pop()
          acc[ext!] = (acc[ext!] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        console.log(`\n📝 Rebuilding translations (${changedFiles.length} files changed)`)
        console.log(`File types: ${Object.entries(fileTypes).map(([ext, count]) => `${ext}(${count})`).join(', ')}`)

        // Notify development tools
        if (process.env.NODE_ENV === 'development') {
          await notifyDevServer('i18n-rebuild')
        }
      },

      // Error handling callback
      onError: (error, context) => {
        console.error(`\n❌ i18n Plugin Error in ${context}:`)
        console.error(`   ${error.message}`)

        if (process.env.NODE_ENV === 'development') {
          console.error(`   Stack: ${error.stack}`)
        }

        // Send error to monitoring service
        if (process.env.ERROR_REPORTING_URL) {
          sendErrorReport({
            error: error.message,
            context,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
          }).catch(console.error)
        }

        // In production, fail fast
        if (process.env.NODE_ENV === 'production') {
          process.exit(1)
        }
      }
    })
  ]
}

// Helper functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else {
      result[newKey] = value
    }
  }

  return result
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getEnglishKeyCount(): number {
  // This would typically be cached or computed from the actual English translations
  return 100 // placeholder
}

async function sendMetrics(metrics: Record<string, number>): Promise<void> {
  try {
    await fetch(process.env.METRICS_ENDPOINT!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, timestamp: Date.now() })
    })
  } catch (error) {
    console.warn('Failed to send metrics:', error)
  }
}

async function notifyDevServer(event: string): Promise<void> {
  // Implementation would depend on your dev server setup
  console.log(`🔄 Notifying dev server: ${event}`)
}

async function sendErrorReport(report: any): Promise<void> {
  try {
    await fetch(process.env.ERROR_REPORTING_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
  } catch (error) {
    console.warn('Failed to send error report:', error)
  }
}
