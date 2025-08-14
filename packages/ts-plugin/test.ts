/* eslint-disable no-console */
// Showcase the typed experience that ts-plugin-i18n enables for YAML sources
console.log('🌍 TypeScript Plugin for YAML Smart Types - Concept Demo')
console.log('=========================================================\n')

// Simulate what the TypeScript plugin generates from YAML files
console.log('📄 YAML Source File Example (en.yml):')
console.log('=====================================')

const yamlContent = `
app:
  title: "Smart Types Demo"
  description: "TypeScript types generated from YAML"
  version: "1.0.0"

user:
  greeting: "Hello, \\{\\{name\\}\\}!"
  profile:
    name: "Name"
    email: "Email Address"
    settings: "Settings"

navigation:
  home: "Home"
  about: "About"
  contact: "Contact"

features:
  smartTypes: "Smart Type Generation"
  yamlSupport: "YAML File Support"
  autoComplete: "Full IntelliSense"

messages:
  loading: "Loading..."
  error: "Error: \\{\\{message\\}\\}"
  success: "Success!"

validation:
  required: "This field is required"
  email: "Please enter a valid email"
  minLength: "Minimum \\{\\{min\\}\\} characters"
`

console.log(yamlContent)

console.log('\n🔧 Generated TypeScript Interface:')
console.log('===================================')

const generatedTypes = `
// Auto-generated TypeScript definitions for en translations
// This file provides smart types for YAML-based translations

export interface EnTranslations {
  /** "Smart Types Demo" */
  app: {
    /** "Smart Types Demo" */
    title: string
    /** "TypeScript types generated from YAML" */
    description: string
    /** "1.0.0" */
    version: string
  }

  user: {
    /** "Hello, \\{\\{name\\}\\}!" */
    greeting: string
    profile: {
      /** "Name" */
      name: string
      /** "Email Address" */
      email: string
      /** "Settings" */
      settings: string
    }
  }

  navigation: {
    /** "Home" */
    home: string
    /** "About" */
    about: string
    /** "Contact" */
    contact: string
  }

  features: {
    /** "Smart Type Generation" */
    smartTypes: string
    /** "YAML File Support" */
    yamlSupport: string
    /** "Full IntelliSense" */
    autoComplete: string
  }

  messages: {
    /** "Loading..." */
    loading: string
    /** "Error: \\{\\{message\\}\\}" */
    error: string
    /** "Success!" */
    success: string
  }

  validation: {
    /** "This field is required" */
    required: string
    /** "Please enter a valid email" */
    email: string
    /** "Minimum \\{\\{min\\}\\} characters" */
    minLength: string
  }
}

declare const translations: EnTranslations
export = translations
export as namespace EnTranslations
`

console.log(generatedTypes)

console.log('\n📦 Generated Wrapper Types:')
console.log('============================')

const wrapperTypes = `
// Auto-generated TypeScript wrapper for en translations
import type { TranslatorFor, DotPaths, ParamsForKey } from 'ts-i18n'
import type { EnTranslations } from './en'

export type EnKeys = DotPaths<EnTranslations>
export type EnParams<K extends EnKeys> = ParamsForKey<EnTranslations, K>
export type EnTranslator = TranslatorFor<EnTranslations>

// Re-export for convenience
export type { EnTranslations }
`

console.log(wrapperTypes)

console.log('\n🌍 Unified Types (index.ts):')
console.log('=============================')

const unifiedTypes = `
// Auto-generated unified types for ts-i18n
import type { DotPaths, ParamsForKey, TranslatorFor } from 'ts-i18n'

// Base translation tree type (from en locale)
export type BaseTranslations = typeof import('./en').default

// Core types
export type TranslationKey = DotPaths<BaseTranslations>
export type TranslationParams<K extends TranslationKey> = ParamsForKey<BaseTranslations, K>
export type TypedTranslator = TranslatorFor<BaseTranslations>

// Locale-specific types
export type { EnTranslations } from './en'
export type { EsTranslations } from './es'

// Union of all available locales
export type AvailableLocale = 'en' | 'es'

// Translation tree by locale
export type TranslationsByLocale = {
  'en': EnTranslations
  'es': EsTranslations
}

// Helper type for locale-aware translation functions
export type LocalizedTranslator<L extends AvailableLocale> = TranslatorFor<TranslationsByLocale[L]>
`

console.log(unifiedTypes)

console.log('\n🎯 Usage Examples with Generated Types:')
console.log('=======================================')

const usageExamples = `
// Import the generated types
import type { TypedTranslator, TranslationKey } from './generated-types'
import { createTranslator } from 'ts-i18n'

// Create a typed translator
const t: TypedTranslator = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// ✅ All these have full autocomplete and type checking:

// Basic key access
const appTitle: string = t('app.title')                    // ✅ Valid
const appDesc: string = t('app.description')               // ✅ Valid

// Nested key access
const userName: string = t('user.profile.name')            // ✅ Valid
const userEmail: string = t('user.profile.email')          // ✅ Valid

// Feature keys
const smartTypes: string = t('features.smartTypes')        // ✅ Valid
const yamlSupport: string = t('features.yamlSupport')      // ✅ Valid

// Dynamic parameters (with proper type checking)
const greeting: string = t('user.greeting', { name: 'Chris' })         // ✅ Valid
const errorMsg: string = t('messages.error', { message: 'Network' })   // ✅ Valid
const minLength: string = t('validation.minLength', { min: 8 })        // ✅ Valid

// Locale switching with type safety
const spanishTitle: string = t('app.title', 'es')                      // ✅ Valid
const spanishGreeting: string = t('user.greeting', 'es', { name: 'Carlos' }) // ✅ Valid

// ❌ These would cause TypeScript errors:
// const invalid = t('does.not.exist')              // Error: Key doesn't exist
// const badNested = t('user.profile.invalid')      // Error: Key doesn't exist
// const wrongParam = t('user.greeting', { id: 1 }) // Error: Wrong parameter type
// const missingParam = t('messages.error')         // Error: Missing required parameter

// Type-safe key validation
function isValidKey(key: string): key is TranslationKey {
  // Implementation would check if key exists
  return true
}

// Advanced usage with conditional types
type UserKeys = Extract<TranslationKey, \`user.\${string}\`>
type NavigationKeys = Extract<TranslationKey, \`navigation.\${string}\`>

const userKey: UserKeys = 'user.profile.name'        // ✅ Valid
const navKey: NavigationKeys = 'navigation.home'     // ✅ Valid
`

console.log(usageExamples)

console.log('\n💡 Developer Experience Benefits:')
console.log('==================================')

const benefits = [
  '✅ Full IntelliSense autocomplete for all translation keys',
  '✅ Compile-time validation of translation key usage',
  '✅ Type checking for dynamic parameter requirements',
  '✅ JSDoc comments showing original YAML values',
  '✅ Automatic type generation from YAML files',
  '✅ Same developer experience as TypeScript translation files',
  '✅ Refactoring safety with IDE support',
  '✅ Go-to-definition navigation to YAML sources',
  '✅ Find all references across the codebase',
  '✅ Rename refactoring with TypeScript tooling',
]

benefits.forEach(benefit => console.log(benefit))

console.log('\n🔄 Development Workflow:')
console.log('=========================')

const workflow = `
1. 📝 Content teams write YAML translation files
   - Simple, readable format
   - No TypeScript knowledge required
   - Compatible with translation tools

2. 🔧 TypeScript plugin analyzes YAML structure
   - Generates comprehensive TypeScript interfaces
   - Creates wrapper modules and unified types
   - Preserves original values as JSDoc comments

3. 💻 Developers get full TypeScript experience
   - Import generated types in their code
   - Use TypedTranslator for type-safe translations
   - Get autocomplete, validation, and refactoring

4. 🔁 Watch mode keeps types in sync
   - Automatic regeneration on YAML changes
   - No manual steps required
   - Always up-to-date types

5. 🚀 Production build optimized
   - Types only used at development time
   - Runtime uses optimized JSON
   - No TypeScript overhead in production
`

console.log(workflow)

console.log('\n🎭 Real-world Scenarios:')
console.log('========================')

const scenarios = `
Scenario 1: E-commerce Application
---------------------------------
YAML: product.price: "Price: $\\{\\{amount\\}\\}"
Generated Type: t('product.price', { amount: number }) => string
Usage: t('product.price', { amount: 29.99 })  // ✅ Type-safe

Scenario 2: User Interface Labels
--------------------------------
YAML: buttons.save: "Save Changes"
Generated Type: t('buttons.save') => string
Usage: <button>{t('buttons.save')}</button>  // ✅ Autocomplete

Scenario 3: Form Validation
--------------------------
YAML: validation.minLength: "Must be at least \\{\\{min\\}\\} characters"
Generated Type: t('validation.minLength', { min: number }) => string
Usage: t('validation.minLength', { min: 8 })  // ✅ Parameter validation

Scenario 4: Dynamic Notifications
--------------------------------
YAML: notifications.userJoined: "\\{\\{name\\}\\} joined the team"
Generated Type: t('notifications.userJoined', { name: string }) => string
Usage: t('notifications.userJoined', { name: 'Alice' })  // ✅ Type-safe params
`

console.log(scenarios)

console.log('\n🚀 CONCLUSION')
console.log('=============')

const conclusion = `
The TypeScript plugin for ts-i18n successfully bridges the gap between:

📄 YAML Files (Content Team Friendly)
  ↓ Smart Analysis
🔧 TypeScript Interface Generation
  ↓ Developer Experience
💻 Full Type Safety & IntelliSense

Key Achievements:
✅ Content teams can use familiar YAML format
✅ Developers get TypeScript experience equivalent to .ts files
✅ No runtime overhead - types are build-time only
✅ Automatic synchronization between YAML and types
✅ IDE integration with autocomplete, validation, and refactoring
✅ Seamless fallback behavior across locales

Result: Best of both worlds! 🎉
- YAML for simplicity and translator-friendliness
- TypeScript for developer productivity and safety
- Zero compromises on either side
`

console.log(conclusion)

console.log('\n🎉 TypeScript Plugin Demo Complete!')
console.log('====================================')
console.log('The plugin enables YAML files to provide the same')
console.log('typed experience as TypeScript translation files!')

// Demonstrate the actual plugin API
console.log('\n📚 Plugin API Usage:')
console.log('====================')

const apiUsage = `
import { createTypeScriptI18nPlugin } from 'ts-plugin-i18n'

// Initialize the plugin
const plugin = await createTypeScriptI18nPlugin({
  translationsDir: 'locales',
  outDir: 'src/types/i18n',
  sources: ['yaml'],           // Focus on YAML files
  generateSmartTypes: true,    // Enable smart type generation
  generateWrappers: true,      // Create wrapper modules
  globalNamespace: true,       // Optional global types
  watch: true,                 // Auto-regenerate on changes

  onTypesGenerated: (results) => {
    console.log('Generated types for', results.length, 'locales')
  }
})

// Types are automatically generated and ready to use!
`

console.log(apiUsage)

console.log('\n✨ The typed experience is now available for YAML sources!')
console.log('No more choosing between YAML simplicity and TypeScript safety.')
console.log('You can have both! 🎯')
