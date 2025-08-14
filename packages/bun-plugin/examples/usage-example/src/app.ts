// Example usage of bun-plugin-i18n
import { createTranslator } from 'ts-i18n'

// Import translations using virtual modules
import enTranslations from 'virtual:i18n/en.json'
import esTranslations from 'virtual:i18n/es.json'
import frTranslations from 'virtual:i18n/fr.json'

// Import generated types
import type { TypedTranslator } from '../src/types/i18n'

// Create translation map
const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations
}

// Create typed translator
const t: TypedTranslator = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// Usage examples
console.log('🌍 i18n Plugin Demo')
console.log('===================')

// Basic translations
console.log('App Title:', t('app.title'))
console.log('Welcome Message:', t('welcome.message'))

// Dynamic translations with parameters
console.log('Personal Greeting:', t('welcome.greeting', { name: 'World' }))

// Locale switching
console.log('\nSpanish:')
console.log('App Title:', t('app.title', 'es'))
console.log('Welcome:', t('welcome.greeting', 'es', { name: 'Mundo' }))

console.log('\nFrench:')
console.log('App Title:', t('app.title', 'fr'))
console.log('Welcome:', t('welcome.greeting', 'fr', { name: 'Monde' }))

// Error handling with fallbacks
console.log('\nFallback behavior:')
console.log('Missing key fallback:', t('nonexistent.key'))

export { t, translations }
