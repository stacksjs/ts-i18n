# Fallback Locale Strategies

Fallback locales provide a robust mechanism for handling missing translations, ensuring your application always displays meaningful text to users. `ts-i18n` supports sophisticated fallback chains that can handle complex internationalization scenarios, from simple single-fallback setups to complex multi-tier regional configurations.

## Basic Fallback Configuration

### Single Fallback Locale

```typescript
import { createTranslator, loadTranslations } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'en' // Simple fallback to English
})

const t = createTranslator(translations, {
  defaultLocale: 'es',      // Spanish as primary
  fallbackLocale: 'en'     // English as fallback
})

// If Spanish translation missing, falls back to English
console.log(t('welcome.title')) // Uses Spanish if available, English otherwise
```

### Multiple Fallback Chain

```typescript
const t = createTranslator(translations, {
  defaultLocale: 'es-MX',  // Mexican Spanish
  fallbackLocale: [        // Fallback chain
    'es',                  // General Spanish
    'en-US',              // US English
    'en'                  // General English
  ]
})
```

## Resolution Order and Logic

When resolving a translation key, `ts-i18n` follows this exact order:

### 1. Explicit Locale (Runtime Override)

```typescript
// Direct locale specification takes highest priority
t('welcome.message', 'fr', { name: 'Chris' })  // Forces French
t('welcome.message', 'de')                     // Forces German

// Even if fallback chain exists, explicit locale is tried first
```

### 2. Default Locale

```typescript
const t = createTranslator(translations, {
  defaultLocale: 'pt-BR'  // Brazilian Portuguese
})

// This will try pt-BR first
t('dashboard.title')
```

### 3. Fallback Chain

```typescript
const t = createTranslator(translations, {
  defaultLocale: 'zh-CN',    // Simplified Chinese
  fallbackLocale: [
    'zh-TW',                 // Traditional Chinese
    'zh',                    // Generic Chinese
    'en'                     // English ultimate fallback
  ]
})

// Resolution order for t('user.profile.title'):
// 1. zh-CN (default)
// 2. zh-TW (first fallback)
// 3. zh (second fallback)
// 4. en (final fallback)
// 5. Return key itself if nothing found
```

## Real-World Examples

### Global Application with Regional Variants

Here's how Chris might configure his team's global application:

```typescript
// For users in different Spanish-speaking regions
function createRegionalTranslator(userLocale: string) {
  const fallbackChain = {
    'es-MX': ['es', 'en'],           // Mexico → Spanish → English
    'es-AR': ['es', 'en'],           // Argentina → Spanish → English
    'es-ES': ['es', 'en'],           // Spain → Spanish → English
    'pt-BR': ['pt', 'es', 'en'],     // Brazil → Portuguese → Spanish → English
    'pt-PT': ['pt', 'es', 'en'],     // Portugal → Portuguese → Spanish → English
    'fr-CA': ['fr', 'en'],           // Quebec → French → English
    'fr-FR': ['fr', 'en']            // France → French → English
  }

  return createTranslator(translations, {
    defaultLocale: userLocale,
    fallbackLocale: fallbackChain[userLocale] || ['en']
  })
}

// Usage examples
const mexicanTranslator = createRegionalTranslator('es-MX')
const brazilianTranslator = createRegionalTranslator('pt-BR')
const quebecTranslator = createRegionalTranslator('fr-CA')
```

## Best Practices

### 1. **Design Fallback Chains Thoughtfully**

```typescript
// ✅ Good: Logical linguistic progression
fallbackLocale: ['pt-BR', 'pt', 'es', 'en']  // Brazilian → Portuguese → Spanish → English

// ❌ Avoid: Unrelated language jumps
fallbackLocale: ['zh-CN', 'de', 'ar', 'en']  // Chinese → German → Arabic → English
```

### 2. **Always Include a Universal Fallback**

```typescript
// ✅ Good: Always end with English (or your universal language)
fallbackLocale: ['es-MX', 'es', 'en']

// ❌ Risky: No universal fallback
fallbackLocale: ['es-MX', 'es']  // What if Spanish is incomplete?
```

### 3. **Use Different Strategies for Different Content Types**

```typescript
// Critical UI elements - prefer functionality
const uiTranslator = createTranslator(translations, {
  defaultLocale: userLocale,
  fallbackLocale: ['en'] // Always show something
})

// Marketing content - prefer quality
const marketingTranslator = createTranslator(translations, {
  defaultLocale: userLocale,
  fallbackLocale: [] // Show key if no quality translation
})
```

### 4. **Monitor Fallback Usage**

```typescript
function createMonitoredTranslator(config: any) {
  const t = createTranslator(translations, config)

  return new Proxy(t, {
    apply(target, thisArg, args) {
      const result = target.apply(thisArg, args)

      // Log when fallbacks are used
      if (result === args[0]) {
        console.warn(`Translation missing: ${args[0]}`)
      }

      return result
    }
  })
}
```

### 5. **Handle Edge Cases Gracefully**

```typescript
// Test your fallback behavior
const t = createTranslator(translations, {
  defaultLocale: 'fictitious-locale',
  fallbackLocale: ['another-missing-locale', 'en']
})

// Should eventually fall back to English or return the key
console.log(t('welcome.title')) // Falls back gracefully
```

## Advanced Fallback Configuration

### Regional Hierarchy Chains

For applications serving multiple regions with shared languages, you can create sophisticated fallback hierarchies:

```typescript
// Complex regional fallback configuration
const regionalFallbacks = {
  // Latin American Spanish variants
  'es-MX': ['es-419', 'es', 'en'],      // Mexico → Latin America → Spanish → English
  'es-CO': ['es-419', 'es', 'en'],      // Colombia → Latin America → Spanish → English
  'es-AR': ['es-419', 'es', 'en'],      // Argentina → Latin America → Spanish → English
  
  // European Spanish variants
  'es-ES': ['es', 'en'],                // Spain → Spanish → English
  
  // Portuguese variants
  'pt-BR': ['pt', 'es', 'en'],          // Brazil → Portuguese → Spanish → English
  'pt-PT': ['pt', 'es', 'en'],          // Portugal → Portuguese → Spanish → English
  
  // French variants
  'fr-CA': ['fr', 'en'],                // Quebec → French → English
  'fr-FR': ['fr', 'en'],                // France → French → English
  'fr-BE': ['fr', 'nl', 'en'],          // Belgium → French → Dutch → English
  
  // English variants
  'en-GB': ['en', 'en-US'],             // British → English → US English
  'en-AU': ['en', 'en-US'],             // Australian → English → US English
  'en-CA': ['en', 'fr', 'en-US'],       // Canadian → English → French → US English
}

function createRegionalTranslator(userLocale: string) {
  const fallbackChain = regionalFallbacks[userLocale] || ['en']
  
  return createTranslator(translations, {
    defaultLocale: userLocale,
    fallbackLocale: fallbackChain
  })
}
```

### Context-Aware Fallback Strategies

Different content types may require different fallback strategies:

```typescript
interface ContentStrategy {
  critical: string[]    // Must always show something
  marketing: string[]   // Prefer quality over coverage
  legal: string[]       // Exact translations required
  technical: string[]   // Technical accuracy matters
}

const contentStrategies: Record<string, ContentStrategy> = {
  'es-MX': {
    critical: ['es', 'en'],                    // Always show something
    marketing: ['es-MX'],                      // Mexico-specific only
    legal: ['es-MX', 'es'],                    // Legal accuracy required
    technical: ['es', 'en']                    // Technical fallback ok
  },
  'fr-CA': {
    critical: ['fr', 'en'],
    marketing: ['fr-CA'],                      // Quebec-specific marketing
    legal: ['fr-CA', 'fr'],                    // French legal requirements
    technical: ['fr', 'en']
  }
}

function createContextualTranslator(locale: string, contentType: keyof ContentStrategy) {
  const strategy = contentStrategies[locale] || {
    critical: ['en'],
    marketing: ['en'],
    legal: ['en'],
    technical: ['en']
  }
  
  return createTranslator(translations, {
    defaultLocale: locale,
    fallbackLocale: strategy[contentType]
  })
}

// Usage examples
const criticalUI = createContextualTranslator('es-MX', 'critical')
const marketingContent = createContextualTranslator('es-MX', 'marketing')
const legalDisclosures = createContextualTranslator('es-MX', 'legal')
```

### Dynamic Fallback Resolution

```typescript
interface UserPreferences {
  primaryLocale: string
  secondaryLocales: string[]
  contentQuality: 'prefer-complete' | 'prefer-accurate' | 'prefer-fast'
  allowMachineTranslation: boolean
}

function createPersonalizedTranslator(prefs: UserPreferences) {
  let fallbackChain: string[] = []
  
  // Start with user's preferred locales
  fallbackChain.push(prefs.primaryLocale, ...prefs.secondaryLocales)
  
  // Add regional variants
  const primaryRegion = prefs.primaryLocale.split('-')[0]
  if (primaryRegion !== prefs.primaryLocale) {
    fallbackChain.push(primaryRegion)
  }
  
  // Add quality-based fallbacks
  switch (prefs.contentQuality) {
    case 'prefer-complete':
      fallbackChain.push('en', 'es', 'fr', 'de') // Major languages
      break
    case 'prefer-accurate':
      // Only closely related languages
      const relatedLanguages = getRelatedLanguages(primaryRegion)
      fallbackChain.push(...relatedLanguages, 'en')
      break
    case 'prefer-fast':
      fallbackChain.push('en') // Fastest path
      break
  }
  
  // Remove duplicates while preserving order
  const uniqueFallbacks = [...new Set(fallbackChain)]
  
  return createTranslator(translations, {
    defaultLocale: prefs.primaryLocale,
    fallbackLocale: uniqueFallbacks.slice(1) // Exclude primary
  })
}

function getRelatedLanguages(language: string): string[] {
  const languageFamilies = {
    'es': ['pt', 'it', 'fr'],              // Romance languages
    'pt': ['es', 'it', 'fr'],
    'fr': ['es', 'pt', 'it'],
    'it': ['es', 'pt', 'fr'],
    'de': ['nl', 'da', 'sv', 'no'],        // Germanic languages
    'nl': ['de', 'da', 'sv', 'no'],
    'sv': ['da', 'no', 'de', 'nl'],
    'da': ['sv', 'no', 'de', 'nl'],
    'no': ['da', 'sv', 'de', 'nl'],
    'ru': ['uk', 'be', 'bg'],              // Slavic languages
    'uk': ['ru', 'be', 'bg'],
    'zh': ['ja', 'ko'],                    // East Asian (partial similarity)
    'ja': ['ko', 'zh'],
    'ar': ['fa', 'ur'],                    // Semitic/related scripts
  }
  
  return languageFamilies[language] || []
}
```

## Production Implementation Patterns

### Async Fallback Loading

```typescript
class AsyncFallbackTranslator {
  private cache = new Map<string, any>()
  private loadingPromises = new Map<string, Promise<any>>()
  
  constructor(
    private baseTranslations: any,
    private fallbackConfig: { defaultLocale: string; fallbackLocale: string[] }
  ) {}
  
  async translate(key: string, locale?: string, params?: any): Promise<string> {
    const targetLocale = locale || this.fallbackConfig.defaultLocale
    const fallbackChain = [targetLocale, ...this.fallbackConfig.fallbackLocale]
    
    for (const currentLocale of fallbackChain) {
      // Check if translation exists in current locale
      const translation = await this.getTranslation(currentLocale, key, params)
      if (translation && translation !== key) {
        return translation
      }
    }
    
    // Return key if no translation found
    return key
  }
  
  private async getTranslation(locale: string, key: string, params?: any): Promise<string | null> {
    // Check cache first
    if (this.cache.has(locale)) {
      const translations = this.cache.get(locale)
      return this.extractTranslation(translations, key, params)
    }
    
    // Check if already loading
    if (this.loadingPromises.has(locale)) {
      const translations = await this.loadingPromises.get(locale)
      return this.extractTranslation(translations, key, params)
    }
    
    // Start loading
    const loadingPromise = this.loadLocaleTranslations(locale)
    this.loadingPromises.set(locale, loadingPromise)
    
    try {
      const translations = await loadingPromise
      this.cache.set(locale, translations)
      this.loadingPromises.delete(locale)
      return this.extractTranslation(translations, key, params)
    } catch (error) {
      this.loadingPromises.delete(locale)
      console.warn(`Failed to load translations for ${locale}:`, error)
      return null
    }
  }
  
  private async loadLocaleTranslations(locale: string): Promise<any> {
    // Implement your loading strategy (CDN, API, etc.)
    try {
      const response = await fetch(`/api/translations/${locale}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      // Fallback to bundled translations
      return this.baseTranslations[locale] || {}
    }
  }
  
  private extractTranslation(translations: any, key: string, params?: any): string | null {
    const keys = key.split('.')
    let current = translations
    
    for (const keyPart of keys) {
      if (current && typeof current === 'object' && keyPart in current) {
        current = current[keyPart]
      } else {
        return null
      }
    }
    
    if (typeof current === 'string') {
      return current
    } else if (typeof current === 'function' && params) {
      try {
        return current(params)
      } catch (error) {
        console.warn(`Error executing translation function for ${key}:`, error)
        return null
      }
    }
    
    return null
  }
  
  // Preload commonly used locales
  async preloadLocales(locales: string[]): Promise<void> {
    const promises = locales.map(locale => this.getTranslation(locale, 'dummy', {}))
    await Promise.allSettled(promises)
  }
  
  // Clear cache to free memory
  clearCache(locales?: string[]): void {
    if (locales) {
      locales.forEach(locale => this.cache.delete(locale))
    } else {
      this.cache.clear()
    }
  }
  
  // Get cache statistics
  getCacheStats(): { size: number; locales: string[] } {
    return {
      size: this.cache.size,
      locales: Array.from(this.cache.keys())
    }
  }
}

// Usage
const asyncTranslator = new AsyncFallbackTranslator(bundledTranslations, {
  defaultLocale: 'en',
  fallbackLocale: ['es', 'fr']
})

// Preload important locales
await asyncTranslator.preloadLocales(['en', 'es'])

// Use in application
const greeting = await asyncTranslator.translate('welcome.message', 'de', { name: 'Chris' })
```

### Enterprise Fallback Management

```typescript
interface EnterpriseConfig {
  regions: string[]
  businessUnits: string[]
  complianceRequirements: Record<string, string[]>
  brandingVariants: Record<string, string[]>
}

class EnterpriseFallbackManager {
  private strategies = new Map<string, string[]>()
  
  constructor(private config: EnterpriseConfig) {
    this.initializeStrategies()
  }
  
  private initializeStrategies(): void {
    // Create strategies for each region/business unit combination
    for (const region of this.config.regions) {
      for (const businessUnit of this.config.businessUnits) {
        const strategyKey = `${region}-${businessUnit}`
        const fallbackChain = this.buildFallbackChain(region, businessUnit)
        this.strategies.set(strategyKey, fallbackChain)
      }
    }
  }
  
  private buildFallbackChain(region: string, businessUnit: string): string[] {
    const chain: string[] = []
    
    // 1. Specific region + business unit
    chain.push(`${region}-${businessUnit}`)
    
    // 2. Regional variant
    chain.push(region)
    
    // 3. Business unit default
    chain.push(businessUnit)
    
    // 4. Compliance requirements
    const compliance = this.config.complianceRequirements[region]
    if (compliance) {
      chain.push(...compliance)
    }
    
    // 5. Branding variants
    const branding = this.config.brandingVariants[businessUnit]
    if (branding) {
      chain.push(...branding)
    }
    
    // 6. Global fallback
    chain.push('global-en')
    
    // Remove duplicates while preserving order
    return [...new Set(chain)]
  }
  
  getFallbackChain(region: string, businessUnit: string): string[] {
    const strategyKey = `${region}-${businessUnit}`
    return this.strategies.get(strategyKey) || ['global-en']
  }
  
  createTranslator(region: string, businessUnit: string): any {
    const fallbackChain = this.getFallbackChain(region, businessUnit)
    
    return createTranslator(translations, {
      defaultLocale: fallbackChain[0],
      fallbackLocale: fallbackChain.slice(1)
    })
  }
  
  // Update strategies at runtime
  updateStrategy(region: string, businessUnit: string, customChain: string[]): void {
    const strategyKey = `${region}-${businessUnit}`
    this.strategies.set(strategyKey, customChain)
  }
  
  // Get all available strategies
  getAllStrategies(): Record<string, string[]> {
    return Object.fromEntries(this.strategies)
  }
}

// Usage
const enterpriseManager = new EnterpriseFallbackManager({
  regions: ['us-east', 'eu-west', 'apac-south'],
  businessUnits: ['retail', 'enterprise', 'government'],
  complianceRequirements: {
    'eu-west': ['gdpr-compliant', 'eu-en'],
    'apac-south': ['local-compliant']
  },
  brandingVariants: {
    'enterprise': ['professional-tone'],
    'government': ['formal-tone', 'accessibility-first']
  }
})

// Create region/business-specific translators
const usRetailTranslator = enterpriseManager.createTranslator('us-east', 'retail')
const euGovTranslator = enterpriseManager.createTranslator('eu-west', 'government')
```

## Performance Optimization

### Lazy Fallback Loading

```typescript
class LazyFallbackLoader {
  private loadedLocales = new Set<string>()
  private translations = new Map<string, any>()
  
  constructor(
    private loaderFunction: (locale: string) => Promise<any>,
    private fallbackChain: string[]
  ) {}
  
  async getTranslation(key: string, preferredLocale: string): Promise<string> {
    // Try each locale in the fallback chain
    for (const locale of [preferredLocale, ...this.fallbackChain]) {
      if (!this.loadedLocales.has(locale)) {
        await this.loadLocale(locale)
      }
      
      const translation = this.extractFromLocale(locale, key)
      if (translation) {
        return translation
      }
    }
    
    return key // Return key if no translation found
  }
  
  private async loadLocale(locale: string): Promise<void> {
    try {
      const translations = await this.loaderFunction(locale)
      this.translations.set(locale, translations)
      this.loadedLocales.add(locale)
    } catch (error) {
      console.warn(`Failed to load locale ${locale}:`, error)
      // Mark as loaded to prevent retry
      this.loadedLocales.add(locale)
    }
  }
  
  private extractFromLocale(locale: string, key: string): string | null {
    const translations = this.translations.get(locale)
    if (!translations) return null
    
    return key.split('.').reduce((obj, keyPart) => {
      return obj && obj[keyPart]
    }, translations) || null
  }
  
  // Preload critical locales
  async preload(locales: string[]): Promise<void> {
    await Promise.all(locales.map(locale => this.loadLocale(locale)))
  }
  
  // Get loading statistics
  getStats(): { loaded: string[]; total: number } {
    return {
      loaded: Array.from(this.loadedLocales),
      total: this.fallbackChain.length + 1
    }
  }
}
```

### Memory-Efficient Fallback Caching

```typescript
interface CacheEntry {
  value: string
  locale: string
  timestamp: number
  accessCount: number
}

class FallbackCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize = 1000
  private ttl = 5 * 60 * 1000 // 5 minutes
  
  get(key: string, locale: string): string | null {
    const cacheKey = `${locale}:${key}`
    const entry = this.cache.get(cacheKey)
    
    if (!entry) return null
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(cacheKey)
      return null
    }
    
    // Update access count
    entry.accessCount++
    return entry.value
  }
  
  set(key: string, locale: string, value: string): void {
    // Ensure cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed()
    }
    
    const cacheKey = `${locale}:${key}`
    this.cache.set(cacheKey, {
      value,
      locale,
      timestamp: Date.now(),
      accessCount: 1
    })
  }
  
  private evictLeastUsed(): void {
    let leastUsedKey = ''
    let leastUsedCount = Infinity
    let oldestTime = Infinity
    
    for (const [key, entry] of this.cache) {
      // Prioritize by access count, then by age
      if (entry.accessCount < leastUsedCount ||
          (entry.accessCount === leastUsedCount && entry.timestamp < oldestTime)) {
        leastUsedKey = key
        leastUsedCount = entry.accessCount
        oldestTime = entry.timestamp
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  getStats(): { size: number; hitRate: number } {
    const entries = Array.from(this.cache.values())
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0)
    const hitRate = entries.length > 0 ? totalAccess / entries.length : 0
    
    return { size: this.cache.size, hitRate }
  }
}
```

## Troubleshooting and Debugging

### Fallback Resolution Debugging

```typescript
class FallbackDebugger {
  private resolutionLog: Array<{
    key: string
    requestedLocale: string
    resolvedLocale: string
    fallbackChain: string[]
    timestamp: number
  }> = []
  
  logResolution(
    key: string,
    requestedLocale: string,
    resolvedLocale: string,
    fallbackChain: string[]
  ): void {
    this.resolutionLog.push({
      key,
      requestedLocale,
      resolvedLocale,
      fallbackChain,
      timestamp: Date.now()
    })
    
    // Keep only recent entries
    if (this.resolutionLog.length > 100) {
      this.resolutionLog.shift()
    }
  }
  
  getMissingTranslations(): Record<string, string[]> {
    const missing: Record<string, string[]> = {}
    
    for (const entry of this.resolutionLog) {
      if (entry.resolvedLocale !== entry.requestedLocale) {
        if (!missing[entry.requestedLocale]) {
          missing[entry.requestedLocale] = []
        }
        missing[entry.requestedLocale].push(entry.key)
      }
    }
    
    return missing
  }
  
  getFallbackUsage(): Record<string, number> {
    const usage: Record<string, number> = {}
    
    for (const entry of this.resolutionLog) {
      const key = `${entry.requestedLocale} → ${entry.resolvedLocale}`
      usage[key] = (usage[key] || 0) + 1
    }
    
    return usage
  }
  
  generateReport(): string {
    const missing = this.getMissingTranslations()
    const usage = this.getFallbackUsage()
    
    let report = '# Fallback Resolution Report\n\n'
    
    report += '## Missing Translations\n\n'
    for (const [locale, keys] of Object.entries(missing)) {
      report += `### ${locale}\n`
      report += keys.slice(0, 10).map(key => `- ${key}`).join('\n')
      if (keys.length > 10) {
        report += `\n... and ${keys.length - 10} more\n`
      }
      report += '\n\n'
    }
    
    report += '## Fallback Usage\n\n'
    for (const [chain, count] of Object.entries(usage)) {
      report += `- ${chain}: ${count} times\n`
    }
    
    return report
  }
}

// Integration with translator
function createDebugTranslator(config: any): any {
  const debugger = new FallbackDebugger()
  const translator = createTranslator(translations, config)
  
  return new Proxy(translator, {
    apply(target, thisArg, args) {
      const [key, localeOrParams, params] = args
      const requestedLocale = typeof localeOrParams === 'string' ? localeOrParams : config.defaultLocale
      
      const result = target.apply(thisArg, args)
      
      // Determine which locale was actually used
      const resolvedLocale = determineResolvedLocale(key, requestedLocale, config)
      
      debugger.logResolution(key, requestedLocale, resolvedLocale, config.fallbackLocale || [])
      
      return result
    }
  })
}
```

## Testing Fallback Strategies

### Comprehensive Fallback Testing

```typescript
describe('Fallback Locale Strategies', () => {
  const testTranslations = {
    'en': {
      common: { save: 'Save', cancel: 'Cancel' },
      dashboard: { title: 'Dashboard' }
    },
    'es': {
      common: { save: 'Guardar' },
      // Missing: cancel, dashboard.title
    },
    'es-MX': {
      common: { save: 'Guardar Cambios' }
      // Missing: cancel, dashboard.title
    }
  }
  
  test('single fallback chain works correctly', () => {
    const t = createTranslator(testTranslations, {
      defaultLocale: 'es-MX',
      fallbackLocale: ['es', 'en']
    })
    
    expect(t('common.save')).toBe('Guardar Cambios')     // From es-MX
    expect(t('common.cancel')).toBe('Cancel')            // Falls back to en
    expect(t('dashboard.title')).toBe('Dashboard')       // Falls back to en
  })
  
  test('complex regional fallback works', () => {
    const t = createTranslator(testTranslations, {
      defaultLocale: 'es-CO',
      fallbackLocale: ['es-419', 'es', 'en']
    })
    
    // Should fall back through the chain
    expect(t('common.save')).toBe('Guardar')     // From es (es-CO and es-419 missing)
    expect(t('common.cancel')).toBe('Cancel')    // From en
  })
  
  test('fallback performance under load', async () => {
    const t = createTranslator(testTranslations, {
      defaultLocale: 'missing-locale',
      fallbackLocale: ['another-missing', 'es', 'en']
    })
    
    const startTime = performance.now()
    
    // Perform many translations
    const promises = Array.from({ length: 1000 }, (_, i) =>
      Promise.resolve(t('common.save'))
    )
    
    await Promise.all(promises)
    
    const duration = performance.now() - startTime
    expect(duration).toBeLessThan(100) // Should be fast
  })
  
  test('fallback with dynamic messages', () => {
    const dynamicTranslations = {
      'en': {
        greetings: {
          welcome: ({ name }: { name: string }) => `Welcome, ${name}!`
        }
      },
      'es': {
        // Missing greetings.welcome
      }
    }
    
    const t = createTranslator(dynamicTranslations, {
      defaultLocale: 'es',
      fallbackLocale: ['en']
    })
    
    expect(t('greetings.welcome', { name: 'Chris' })).toBe('Welcome, Chris!')
  })
})
```

This comprehensive fallback system ensures your application provides the best possible user experience across all supported locales, gracefully handling missing translations while maintaining functionality and user comprehension.
