/* eslint-disable no-console */
// Advanced features demo showcasing namespace merging, fallbacks, and complex translations
import { createTranslator, loadTranslations } from 'ts-i18n'

async function main() {
  console.log('🚀 Advanced ts-i18n Features Demo')
  console.log('====================================\n')

  // Load translations with mixed sources
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en',
    sources: ['ts', 'yaml'], // Mixed sources
    fallbackLocale: 'en',
    verbose: false,
  })

  console.log('📋 Available locales:', Object.keys(translations))
  console.log('📊 Translation stats:')

  for (const [locale, tree] of Object.entries(translations)) {
    const keyCount = countKeys(tree)
    console.log(`  ${locale}: ${keyCount} keys`)
  }

  // Create translators for demonstration
  const tEn = createTranslator(translations, {
    defaultLocale: 'en',
    fallbackLocale: 'en',
  })

  const tEs = createTranslator(translations, {
    defaultLocale: 'es',
    fallbackLocale: 'en', // Falls back to English for missing keys
  })

  // Demo 1: Namespace Merging
  console.log('\n🗂️  NAMESPACE MERGING DEMO')
  console.log('=============================')
  console.log('Static YAML content merged with dynamic TypeScript functions:\n')

  // Static content from YAML files
  console.log('📄 Static content (from YAML):')
  console.log(`App: ${tEn('app.name')} v${tEn('app.version')}`)
  console.log(`Navigation: ${tEn('navigation.dashboard')}, ${tEn('navigation.projects')}, ${tEn('navigation.team')}`)
  console.log(`Buttons: ${tEn('common.buttons.save')}, ${tEn('common.buttons.cancel')}, ${tEn('common.buttons.delete')}`)

  // Dynamic content from TypeScript files
  console.log('\n🎭 Dynamic content (from TypeScript):')
  console.log('User joined:', tEn('notifications.userJoined', {
    user: 'Chris',
    role: 'admin',
    invitedBy: 'Avery',
  }))

  console.log('Currency formatting:', tEn('formatters.numbers.currency', { amount: 1299.99 }))
  console.log('File size formatting:', tEn('formatters.numbers.fileSize', { bytes: 2048576 }))

  // Demo 2: Fallback Behavior
  console.log('\n🔄 FALLBACK BEHAVIOR DEMO')
  console.log('==========================')
  console.log('Spanish translations with English fallbacks:\n')

  // Keys that exist in Spanish
  console.log('✅ Spanish available:')
  console.log(`App name: ${tEs('app.name')} (ES: same as EN)`)
  console.log(`Save button: ${tEs('common.buttons.save')} (ES: "Guardar")`)
  console.log(`Projects: ${tEs('navigation.projects')} (ES: "Proyectos")`)

  // Keys missing in Spanish - fallback to English
  console.log('\n🔄 Missing in Spanish (fallback to English):')
  console.log(`Help nav: ${tEs('navigation.help')} (fallback)`)
  console.log(`Export button: ${tEs('common.buttons.export')} (fallback)`)
  console.log(`Confirm action: ${tEs('common.actions.confirm')} (fallback)`)

  // Demo 3: Complex Dynamic Functions
  console.log('\n🎭 COMPLEX DYNAMIC FUNCTIONS DEMO')
  console.log('===================================')

  // User management with roles
  console.log('👥 User Management:')
  console.log('English:', tEn('notifications.roleChanged', {
    user: 'Buddy',
    oldRole: 'viewer',
    newRole: 'editor',
    changedBy: 'Chris',
  }))

  console.log('Spanish:', tEs('notifications.roleChanged', {
    user: 'Buddy',
    oldRole: 'viewer',
    newRole: 'editor',
    changedBy: 'Chris',
  }))

  // Project deadline with priority and timing
  console.log('\n📅 Project Deadlines:')
  const scenarios = [
    { days: -2, priority: 'critical' as const, project: 'Mobile App Launch' },
    { days: 0, priority: 'high' as const, project: 'Website Redesign' },
    { days: 1, priority: 'medium' as const, project: 'Documentation Update' },
    { days: 7, priority: 'low' as const, project: 'Code Cleanup' },
  ]

  scenarios.forEach((scenario) => {
    console.log(`${scenario.priority.toUpperCase()}: ${tEn('notifications.projectDeadline', scenario)}`)
  })

  // Complex milestone achievements
  console.log('\n🏆 Milestone Achievements:')
  const milestoneScenarios = [
    { achievedBy: ['Chris'], milestone: 'Beta Release', project: 'TeamFlow Pro' },
    { achievedBy: ['Avery', 'Buddy'], milestone: 'Performance Target', project: 'API Gateway' },
    { achievedBy: ['Chris', 'Avery', 'Buddy', 'Alex'], milestone: '1000 Users', project: 'User Dashboard' },
  ]

  milestoneScenarios.forEach((scenario) => {
    console.log('English:', tEn('notifications.milestone', scenario))
    console.log('Spanish:', tEs('notifications.milestone', scenario))
    console.log()
  })

  // Demo 4: Advanced Formatting
  console.log('\n📊 ADVANCED FORMATTING DEMO')
  console.log('=============================')

  // Date and time formatting
  const now = new Date()
  const pastDate = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
  const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now

  console.log('⏰ Time Formatting:')
  console.log(`Relative time (past): ${tEn('formatters.dates.relative', { date: pastDate })}`)
  console.log(`Relative time (future): ${tEn('formatters.dates.relative', { date: futureDate })}`)
  console.log(`Duration: ${tEn('formatters.dates.duration', { start: pastDate, end: now })}`)

  // Number formatting
  console.log('\n🔢 Number Formatting:')
  console.log(`Large number: ${tEn('formatters.numbers.compact', { value: 1234567 })}`)
  console.log(`Percentage: ${tEn('formatters.numbers.percentage', { value: 85.5 })}`)
  console.log(`File size: ${tEn('formatters.numbers.fileSize', { bytes: 1073741824 })}`)
  console.log(`Currency (EUR): ${tEn('formatters.numbers.currency', { amount: 2499.99, currency: 'EUR' })}`)

  // Text formatting
  console.log('\n📝 Text Formatting:')
  const longText = 'This is a very long text that needs to be truncated for display purposes'
  console.log(`Truncated: ${tEn('formatters.text.truncate', { text: longText, length: 30 })}`)
  console.log(`Initials: ${tEn('formatters.text.initials', { name: 'Christopher Alexander Buddy' })}`)
  console.log(`Capitalized: ${tEn('formatters.text.capitalize', { text: 'hello world', allWords: true })}`)

  // List formatting
  const teamMembers = ['Chris', 'Avery', 'Buddy', 'Alex', 'Jordan']
  console.log(`Team list: ${tEn('formatters.lists.enumeration', { items: teamMembers.slice(0, 3) })}`)
  console.log(`Summary: ${tEn('formatters.lists.summary', { items: teamMembers })}`)

  // Progress formatting
  console.log(`Progress: ${tEn('formatters.progress', { completed: 8, total: 12 })}`)

  // Demo 5: Bulk Operations and Time Tracking
  console.log('\n⏱️  TIME TRACKING & BULK OPERATIONS')
  console.log('=====================================')

  console.log('Time logging:', tEn('notifications.timeLogged', {
    user: 'Avery',
    hours: 6.5,
    project: 'API Development',
    task: 'Authentication endpoints',
  }))

  console.log('Overtime warning:', tEn('notifications.overtime', {
    user: 'Buddy',
    extraHours: 12,
    weekHours: 52,
  }))

  console.log('Bulk task update:', tEn('notifications.bulkTaskUpdate', {
    count: 15,
    action: 'completed',
    author: 'Chris',
  }))

  // Demo 6: System and Data Operations
  console.log('\n🔧 SYSTEM OPERATIONS')
  console.log('=====================')

  console.log('Data export:', tEn('notifications.dataExport', {
    type: 'projects',
    recordCount: 247,
    requestedBy: 'Admin',
  }))

  const maintenanceTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  console.log('Maintenance:', tEn('notifications.systemMaintenance', {
    startTime: maintenanceTime,
    duration: 2,
  }))

  console.log('\n✨ Demo complete! This showcases:')
  console.log('  🗂️  Mixed YAML + TypeScript file loading')
  console.log('  🔄 Intelligent fallback to English for missing Spanish keys')
  console.log('  🎭 Complex parameterized functions with type safety')
  console.log('  📊 Advanced formatting utilities')
  console.log('  🏗️  Namespace merging from different file structures')
  console.log('  🌍 Multi-locale support with graceful degradation')
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

// Handle errors gracefully
main().catch((error) => {
  console.error('❌ Demo failed:', error)
  process.exit(1)
})
