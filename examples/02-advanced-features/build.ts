import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { generateTypesFromModule, loadTranslations, writeOutputs } from 'ts-i18n'

async function build() {
  console.log('🌍 Building advanced i18n example with Bun...')

  try {
    // Load mixed TypeScript and YAML translations
    const translations = await loadTranslations({
      translationsDir: 'locales',
      defaultLocale: 'en',
      sources: ['ts', 'yaml'], // Mixed sources to showcase flexibility
      fallbackLocale: 'en',
      verbose: true,
    })

    console.log(`📁 Loaded ${Object.keys(translations).length} locales:`, Object.keys(translations))

    // Show namespace structure
    console.log('\n📋 Translation namespaces found:')
    for (const [locale, tree] of Object.entries(translations)) {
      const namespaces = Object.keys(tree as Record<string, unknown>)
      console.log(`  ${locale}: ${namespaces.join(', ')}`)
    }

    // Create output directory
    await mkdir('dist/i18n', { recursive: true })

    // Generate JSON outputs for runtime usage
    const outputFiles = await writeOutputs(translations, 'dist/i18n')
    console.log(`📄 Generated ${outputFiles.length} JSON files`)

    // Generate advanced TypeScript types
    await generateTypesFromModule(
      './locales/en/notifications.ts', // Use notifications as base for complex types
      'dist/i18n/types.d.ts',
    )
    console.log('🔧 Generated advanced TypeScript types with parameter inference')

    // Calculate translation completeness
    const baseKeys = collectKeys(translations.en)
    console.log('\n📊 Translation Completeness:')

    for (const [locale, tree] of Object.entries(translations)) {
      if (locale === 'en')
        continue

      const localeKeys = collectKeys(tree as Record<string, unknown>)
      const completeness = ((localeKeys.length / baseKeys.length) * 100).toFixed(1)
      const missing = baseKeys.length - localeKeys.length

      console.log(`  ${locale}: ${completeness}% complete (${missing} missing keys)`)
    }

    console.log('\n✅ Advanced build complete! Features demonstrated:')
    console.log('  🗂️  Namespace merging (YAML + TypeScript files)')
    console.log('  🔄 Fallback locale behavior (missing translations)')
    console.log('  🎭 Complex dynamic functions with typed parameters')
    console.log('  📝 Mixed file type loading (sources: [\'ts\', \'yaml\'])')
    console.log('  🔧 Advanced type generation with parameter inference')
  }
  catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, fullKey))
    }
    else {
      keys.push(fullKey)
    }
  }

  return keys
}

if (import.meta.url === `file://${process.argv[1]}`) {
  build()
}
