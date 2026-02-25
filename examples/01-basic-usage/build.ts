/* eslint-disable no-console */
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { generateTypesFromModule, loadTranslations, writeOutputs } from 'ts-i18n'

async function build() {
  console.log('🌍 Building i18n assets with Bun...')

  try {
    // Load TypeScript translations for better type safety
    const translations = await loadTranslations({
      translationsDir: 'locales',
      defaultLocale: 'en',
      sources: ['ts'], // Use TypeScript files for typed experience
      verbose: true,
    })

    console.log(`📁 Loaded ${Object.keys(translations).length} locales:`, Object.keys(translations))

    // Create output directory
    await mkdir('dist/i18n', { recursive: true })

    // Generate JSON outputs for runtime usage
    const outputFiles = await writeOutputs(translations, 'dist/i18n')
    console.log(`📄 Generated ${outputFiles.length} JSON files`)

    // Generate advanced TypeScript types from base module
    await generateTypesFromModule(
      '../../locales/en/index.ts',
      'dist/i18n/types.d.ts',
    )
    console.log('🔧 Generated advanced TypeScript types with parameter inference')

    console.log('✅ Build complete! Your translations are ready to use.')
  }
  catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

async function _generateTypes(translations: any, outFile: string) {
  const keys = collectKeys(translations.en).sort()
  const union = keys.map(k => JSON.stringify(k)).join(' | ')
  const content = `export type TranslationKey = ${union}\n`

  const { writeFile } = await import('node:fs/promises')
  await writeFile(outFile, content)
}

function collectKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value, fullKey))
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
