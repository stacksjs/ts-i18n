# Fallback Locale Strategies

Fallback locales provide a robust mechanism for handling missing translations, ensuring your application always displays meaningful text to users. `ts-i18n` supports sophisticated fallback chains that can handle complex internationalization scenarios.

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

This comprehensive fallback system ensures your application provides the best possible user experience across all supported locales, gracefully handling missing translations while maintaining functionality and user comprehension.
