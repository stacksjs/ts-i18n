// Translation validation script
import { loadTranslations } from 'ts-i18n'

interface ValidationResult {
  locale: string
  completeness: number
  totalKeys: number
  missingKeys: string[]
  extraKeys: string[]
  issues: string[]
}

async function validateTranslations() {
  console.log('🔍 Validating translation completeness and consistency...\n')

  try {
    const translations = await loadTranslations({
      translationsDir: 'locales',
      defaultLocale: 'en',
      sources: ['ts', 'yaml'],
      fallbackLocale: 'en'
    })

    const baseLocale = 'en'
    const baseKeys = collectKeys(translations[baseLocale]).sort()
    const results: ValidationResult[] = []

    console.log(`📋 Base locale (${baseLocale}) has ${baseKeys.length} total keys\n`)

    // Validate each locale
    for (const [locale, tree] of Object.entries(translations)) {
      if (locale === baseLocale) continue

      const localeKeys = collectKeys(tree).sort()
      const missingKeys = baseKeys.filter(key => !localeKeys.includes(key))
      const extraKeys = localeKeys.filter(key => !baseKeys.includes(key))
      const completeness = ((localeKeys.length / baseKeys.length) * 100)

      const issues: string[] = []

      // Check for critical missing keys
      const criticalKeys = baseKeys.filter(key =>
        key.includes('error') ||
        key.includes('warning') ||
        key.includes('critical') ||
        key.startsWith('common.buttons')
      )
      const missingCritical = criticalKeys.filter(key => missingKeys.includes(key))

      if (missingCritical.length > 0) {
        issues.push(`${missingCritical.length} critical keys missing`)
      }

      if (extraKeys.length > 0) {
        issues.push(`${extraKeys.length} unexpected extra keys`)
      }

      if (completeness < 80) {
        issues.push('Below 80% completion threshold')
      }

      results.push({
        locale,
        completeness,
        totalKeys: localeKeys.length,
        missingKeys,
        extraKeys,
        issues
      })
    }

    // Display results
    console.log('📊 VALIDATION RESULTS')
    console.log('=====================\n')

    // Summary table
    console.log('| Locale | Completeness | Keys | Issues |')
    console.log('|--------|-------------|------|--------|')

    for (const result of results) {
      const status = result.completeness >= 90 ? '✅' :
                    result.completeness >= 80 ? '⚠️' : '❌'
      const issueCount = result.issues.length

      console.log(`| ${result.locale.padEnd(6)} | ${result.completeness.toFixed(1).padStart(10)}% | ${result.totalKeys.toString().padStart(4)} | ${status} ${issueCount} |`)
    }

    // Detailed analysis
    console.log('\n📝 DETAILED ANALYSIS')
    console.log('====================\n')

    for (const result of results) {
      console.log(`🌍 ${result.locale.toUpperCase()} (${result.completeness.toFixed(1)}% complete)`)

      if (result.issues.length > 0) {
        console.log('⚠️  Issues:')
        result.issues.forEach(issue => console.log(`   - ${issue}`))
      }

      if (result.missingKeys.length > 0) {
        console.log(`❌ Missing keys (${result.missingKeys.length}):`)
        // Show first 10 missing keys
        const sampleMissing = result.missingKeys.slice(0, 10)
        sampleMissing.forEach(key => console.log(`   - ${key}`))

        if (result.missingKeys.length > 10) {
          console.log(`   ... and ${result.missingKeys.length - 10} more`)
        }
      }

      if (result.extraKeys.length > 0) {
        console.log(`➕ Extra keys (${result.extraKeys.length}):`)
        result.extraKeys.slice(0, 5).forEach(key => console.log(`   - ${key}`))

        if (result.extraKeys.length > 5) {
          console.log(`   ... and ${result.extraKeys.length - 5} more`)
        }
      }

      console.log()
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS')
    console.log('==================\n')

    const lowCompleteness = results.filter(r => r.completeness < 80)
    const withIssues = results.filter(r => r.issues.length > 0)

    if (lowCompleteness.length > 0) {
      console.log('🔧 Low completeness locales:')
      lowCompleteness.forEach(result => {
        console.log(`   - ${result.locale}: Focus on missing keys to reach 80%+ completion`)
      })
      console.log()
    }

    if (withIssues.length > 0) {
      console.log('⚠️  Priority fixes needed:')
      withIssues.forEach(result => {
        if (result.issues.some(i => i.includes('critical'))) {
          console.log(`   - ${result.locale}: Fix critical missing keys first`)
        }
      })
      console.log()
    }

    console.log('🎯 Quality targets:')
    console.log('   - Aim for 90%+ completion on all locales')
    console.log('   - Ensure all critical UI keys are translated')
    console.log('   - Remove extra keys that don\'t exist in base locale')
    console.log('   - Test fallback behavior for missing keys')

    // Overall status
    const avgCompleteness = results.reduce((sum, r) => sum + r.completeness, 0) / results.length
    const allAbove80 = results.every(r => r.completeness >= 80)
    const noIssues = results.every(r => r.issues.length === 0)

    console.log('\n🏆 OVERALL STATUS')
    console.log('=================')
    console.log(`Average completeness: ${avgCompleteness.toFixed(1)}%`)
    console.log(`Quality status: ${allAbove80 && noIssues ? '✅ GOOD' : '⚠️ NEEDS WORK'}`)

    if (allAbove80 && noIssues) {
      console.log('🎉 All locales meet quality standards!')
    }
    else {
      console.log('🔧 Some locales need attention - see recommendations above')
    }

  }
  catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
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
  validateTranslations()
}
