/* eslint-disable no-console */
import { createTranslator, loadTranslations } from 'ts-i18n'
import type { TypedTranslator } from './dist/i18n/types'

async function main() {
  console.log('🚀 Starting TeamFlow i18n Demo with Bun')

  // Load translations
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en',
    sources: ['ts'],
    fallbackLocale: 'en'
  })

  console.log('📋 Available locales:', Object.keys(translations))

  // Create typed translator
  const t: TypedTranslator = createTranslator(translations, {
    defaultLocale: 'en',
    fallbackLocale: 'en'
  })

  // Demo basic translations
  console.log('\n🌟 Basic Translations:')
  console.log('App Title:', t('app.title'))
  console.log('Tagline:', t('app.tagline'))
  console.log('Welcome:', t('welcome.title'))

  // Demo dynamic translations with parameters
  console.log('\n🎭 Dynamic Translations with Parameters:')

  // Personal greeting with type safety
  console.log('Personal Greeting:', t('welcome.personalGreeting', { name: 'Chris' }))

  // Team introduction with array handling
  const teamMembers = ['Chris', 'Avery', 'Buddy']
  console.log('Team Introduction:', t('welcome.teamIntro', { members: teamMembers }))

  // Project update notification
  console.log('Project Update:', t('notifications.projectUpdate', {
    author: 'Avery',
    project: 'Mobile App',
    action: 'updated'
  }))

  // Task due notifications with different time scenarios
  console.log('Task Due (overdue):', t('notifications.taskDue', { task: 'Code Review', hours: -2 }))
  console.log('Task Due (1 hour):', t('notifications.taskDue', { task: 'Team Meeting', hours: 1 }))
  console.log('Task Due (2 days):', t('notifications.taskDue', { task: 'Project Launch', hours: 48 }))

  // Member count with pluralization
  console.log('Member Count (0):', t('notifications.memberCount', { count: 0 }))
  console.log('Member Count (1):', t('notifications.memberCount', { count: 1 }))
  console.log('Member Count (5):', t('notifications.memberCount', { count: 5 }))

  // Demo different locales
  console.log('\n🌍 Multi-locale Support:')

  // Spanish translations
  const tEs = createTranslator(translations, {
    defaultLocale: 'es',
    fallbackLocale: 'en'
  })

  console.log('Spanish App Title:', tEs('app.title'))
  console.log('Spanish Greeting:', tEs('welcome.personalGreeting', { name: 'Chris' }))
  console.log('Spanish Project Update:', tEs('notifications.projectUpdate', {
    author: 'Buddy',
    project: 'API Documentation',
    action: 'created'
  }))

  // French translations
  const tFr = createTranslator(translations, {
    defaultLocale: 'fr',
    fallbackLocale: 'en'
  })

  console.log('French App Title:', tFr('app.title'))
  console.log('French Team Intro:', tFr('welcome.teamIntro', { members: ['Chris', 'Avery'] }))
  console.log('French Task Due:', tFr('notifications.taskDue', { task: 'Documentation', hours: 6 }))

  // Demo runtime locale switching
  console.log('\n🔄 Runtime Locale Switching:')

  const key = 'welcome.personalGreeting'
  const params = { name: 'Buddy' }

  console.log('English:', t(key, params))
  console.log('Spanish:', t(key, 'es', params))
  console.log('French:', t(key, 'fr', params))

  console.log('\n✨ Demo complete! TypeScript provided full autocomplete and type checking.')
  console.log('🔧 Try editing the translation files in locales/ to see live updates.')
}

// Handle errors gracefully
main().catch((error) => {
  console.error('❌ Demo failed:', error)
  process.exit(1)
})
