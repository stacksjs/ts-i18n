/* eslint-disable no-console */
// Basic usage example of ts-plugin-i18n
import { createTypeScriptI18nPlugin } from '../src/index'

async function basicExample() {
  console.log('🌍 TypeScript Plugin Basic Example')
  console.log('===================================\n')

  // Create and initialize the plugin
  const plugin = await createTypeScriptI18nPlugin({
    // Basic configuration
    translationsDir: 'examples/locales',
    outDir: 'examples/generated-types',

    // Enable smart type generation
    generateSmartTypes: true,
    generateWrappers: true,

    // Support both YAML and TypeScript files
    sources: ['yaml', 'ts'],
    baseLocale: 'en',

    // Enable verbose logging
    verbose: true,

    // Callbacks
    onTypesGenerated: async (results) => {
      console.log(`\n✅ Type Generation Complete!`)
      console.log(`Generated types for ${results.length} locales:\n`)

      for (const result of results) {
        console.log(`📁 ${result.locale}:`)
        console.log(`   Source: ${result.sourceFile}`)
        console.log(`   Output: ${result.outputFile}`)
        console.log(`   Types: ${result.typeCount}`)
        console.log(`   Smart Types: ${result.hasSmartTypes ? '✅' : '❌'}`)
        console.log()
      }
    },

    onError: (error, context) => {
      console.error(`❌ Error in ${context}:`, error.message)
    }
  })

  console.log('🎉 Plugin initialized successfully!')
  console.log('📝 Generated TypeScript types are ready to use')
  console.log('\nNext steps:')
  console.log('1. Import the generated types in your application')
  console.log('2. Use TypedTranslator for full type safety')
  console.log('3. Enjoy autocomplete and compile-time validation!')

  // Cleanup
  await plugin.cleanup()
}

// Run the example
if (import.meta.main) {
  basicExample().catch(console.error)
}

export { basicExample }
