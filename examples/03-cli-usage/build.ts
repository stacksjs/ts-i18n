#!/usr/bin/env bun
// CLI build script example

import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { generateTypes, loadTranslations, writeOutputs } from 'ts-i18n'

// CLI argument parsing
const args = process.argv.slice(2)
const flags = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  watch: args.includes('--watch') || args.includes('-w'),
  minify: args.includes('--minify'),
  outDir: getArgValue('--out-dir') || getArgValue('-o') || 'dist/i18n',
  typesFile: getArgValue('--types') || getArgValue('-t') || 'dist/i18n/types.d.ts'
}

function getArgValue(flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index !== -1 ? args[index + 1] : undefined
}

function showHelp() {
  console.log(`
🌍 ts-i18n CLI Build Tool

Usage: bun build.ts [options]

Options:
  --verbose, -v     Verbose output
  --watch, -w       Watch for changes
  --minify          Minify JSON output
  --out-dir, -o     Output directory (default: dist/i18n)
  --types, -t       Types file path (default: dist/i18n/types.d.ts)
  --help, -h        Show this help

Examples:
  bun build.ts                           # Basic build
  bun build.ts --verbose                 # Verbose build
  bun build.ts --watch                   # Watch mode
  bun build.ts --out-dir build/i18n      # Custom output
  bun build.ts --minify --verbose        # Minified with logs
`)
}

async function build() {
  const startTime = Date.now()

  if (flags.verbose) {
    console.log('🌍 ts-i18n CLI Build')
    console.log('===================')
    console.log(`Output directory: ${flags.outDir}`)
    console.log(`Types file: ${flags.typesFile}`)
    console.log(`Minify: ${flags.minify}`)
    console.log()
  }

  try {
    // Load translations
    if (flags.verbose) console.log('📁 Loading translations...')

    const translations = await loadTranslations({
      translationsDir: 'locales',
      defaultLocale: 'en',
      sources: ['yaml'],
      verbose: flags.verbose
    })

    const localeCount = Object.keys(translations).length
    if (flags.verbose) {
      console.log(`   Found ${localeCount} locales: ${Object.keys(translations).join(', ')}`)
    }

    // Create output directory
    await mkdir(flags.outDir, { recursive: true })

    // Write JSON outputs
    if (flags.verbose) console.log('📄 Generating JSON outputs...')

    const outputFiles = await writeOutputs(translations, flags.outDir)

    if (flags.verbose) {
      outputFiles.forEach(file => console.log(`   Created: ${file}`))
    }

    // Generate types
    if (flags.verbose) console.log('🔧 Generating TypeScript types...')

    await generateTypes(translations, flags.typesFile)

    if (flags.verbose) {
      console.log(`   Created: ${flags.typesFile}`)
    }

    // Success message
    const duration = Date.now() - startTime
    const fileCount = outputFiles.length + 1 // +1 for types file

    if (flags.verbose) {
      console.log()
      console.log('✅ Build completed successfully!')
      console.log(`   Generated ${fileCount} files in ${duration}ms`)
      console.log(`   ${localeCount} locales processed`)
    } else {
      console.log(`✅ Generated ${fileCount} files for ${localeCount} locales (${duration}ms)`)
    }

  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

async function generateTypes(translations: any, outFile: string) {
  const keys = collectKeys(translations.en).sort()
  const union = keys.map(k => JSON.stringify(k)).join(' | ')
  const content = `export type TranslationKey = ${union}\n`

  await mkdir(outFile.split('/').slice(0, -1).join('/'), { recursive: true })
  await Bun.write(outFile, content)
}

function collectKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

// Handle CLI arguments
if (args.includes('--help') || args.includes('-h')) {
  showHelp()
  process.exit(0)
}

// Run build
if (import.meta.url === `file://${process.argv[1]}`) {
  build()
}
