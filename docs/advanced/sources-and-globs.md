# File Discovery: Sources and Glob Patterns

`ts-i18n` provides flexible file discovery mechanisms to locate and load translation files from your project. You can control which files are included through source type configuration or custom glob patterns, enabling fine-grained control over your translation loading strategy.

## Understanding File Discovery

### Default Source-Based Discovery

When no custom patterns are specified, `ts-i18n` uses the `sources` configuration to determine which file types to load:

```typescript
import { loadTranslations } from 'ts-i18n'

// Default: TypeScript only
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts'] // Loads **/*.ts and **/*.js
})

// Both TypeScript and YAML
const mixedTranslations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml'] // Loads TS/JS and YAML files
})

// YAML only
const yamlTranslations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['yaml'] // Loads **/*.yml and **/*.yaml
})
```

### Source Type Mappings

Each source type maps to specific glob patterns:

```typescript
// Source: 'ts'
// Patterns: ['**/*.ts', '**/*.js']

// Source: 'yaml'
// Patterns: ['**/*.yml', '**/*.yaml']
```

### Custom Include Patterns

For precise control, use the `include` parameter to specify exact glob patterns:

```typescript
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: [
    '**/*.yml',           // All YAML files
    '**/*.yaml',          // Alternative YAML extension
    '**/dynamic/*.ts',    // Only TS files in dynamic folders
    '**/static/*.js',     // Only JS files in static folders
    '!**/*.test.*',       // Exclude test files
    '!**/*.d.ts'          // Exclude type declaration files
  ]
})
```

## Advanced Pattern Examples

### Organizing by Feature and File Type

Here's how Chris might organize his team's translations with sophisticated patterns:

```
locales/
├── en/
│   ├── static/
│   │   ├── navigation.yml
│   │   ├── forms.yml
│   │   └── errors.yml
│   ├── dynamic/
│   │   ├── notifications.ts
│   │   ├── formatting.ts
│   │   └── validation.ts
│   ├── experimental/
│   │   ├── ai-features.ts
│   │   └── beta-ui.yml
│   └── legacy/
│       ├── old-messages.yml
│       └── deprecated.ts
├── es/
│   └── ... (same structure)
└── fr/
    └── ... (same structure)
```

#### Production Build (Stable Features Only)

```typescript
const productionTranslations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: [
    '**/static/*.yml',        // All static YAML files
    '**/static/*.yaml',       // Alternative YAML extension
    '**/dynamic/*.ts',        // All dynamic TypeScript files
    '!**/experimental/**',    // Exclude experimental features
    '!**/legacy/**',          // Exclude legacy content
    '!**/*.test.*',           // Exclude test files
    '!**/*.d.ts'             // Exclude type declarations
  ]
})
```

#### Development Build (All Features)

```typescript
const developmentTranslations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: [
    '**/*.yml',              // All YAML files
    '**/*.yaml',             // Alternative YAML extension
    '**/*.ts',               // All TypeScript files
    '**/*.js',               // All JavaScript files
    '!**/*.test.*',          // Exclude test files
    '!**/*.d.ts'             // Exclude type declarations
  ]
})
```

#### Feature Flag-Based Loading

```typescript
function createFeatureAwarePatterns(features: {
  experimental: boolean
  legacy: boolean
  betaUI: boolean
}) {
  const basePatterns = [
    '**/static/*.yml',
    '**/static/*.yaml',
    '**/dynamic/*.ts'
  ]

  const conditionalPatterns = []

  if (features.experimental) {
    conditionalPatterns.push('**/experimental/*.ts', '**/experimental/*.yml')
  }

  if (features.legacy) {
    conditionalPatterns.push('**/legacy/*.yml', '**/legacy/*.ts')
  }

  if (features.betaUI) {
    conditionalPatterns.push('**/beta-ui.yml')
  }

  return [
    ...basePatterns,
    ...conditionalPatterns,
    '!**/*.test.*',
    '!**/*.d.ts'
  ]
}

// Usage
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: createFeatureAwarePatterns({
    experimental: process.env.NODE_ENV === 'development',
    legacy: process.env.INCLUDE_LEGACY === 'true',
    betaUI: process.env.BETA_FEATURES === 'true'
  })
})
```

### Team-Specific File Organization

```typescript
// Load translations by team ownership
const teamPatterns = {
  frontend: [
    '**/ui/*.yml',
    '**/components/*.ts',
    '**/pages/*.yml'
  ],
  backend: [
    '**/api/*.yml',
    '**/errors/*.ts',
    '**/validation/*.ts'
  ],
  marketing: [
    '**/campaigns/*.yml',
    '**/content/*.yml',
    '**/landing/*.yml'
  ],
  support: [
    '**/help/*.yml',
    '**/documentation/*.yml',
    '**/onboarding/*.ts'
  ]
}

// Load translations for specific teams
async function loadTeamTranslations(teams: string[]) {
  const patterns = teams.flatMap(team => teamPatterns[team] || [])

  return loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en',
    include: [
      ...patterns,
      '!**/*.test.*',
      '!**/*.d.ts'
    ]
  })
}

// Usage
const frontendTranslations = await loadTeamTranslations(['frontend', 'marketing'])
const backendTranslations = await loadTeamTranslations(['backend', 'support'])
```

## Performance Optimization Patterns

### Lazy Loading by Namespace

```typescript
async function loadNamespaceTranslations(namespace: string) {
  return loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en',
    include: [
      `**/${namespace}/*.yml`,
      `**/${namespace}/*.yaml`,
      `**/${namespace}/*.ts`,
      `**/${namespace}/*.js`
    ]
  })
}

// Load only authentication-related translations
const authTranslations = await loadNamespaceTranslations('auth')

// Load only dashboard-related translations
const dashboardTranslations = await loadNamespaceTranslations('dashboard')
```

### Environment-Specific Patterns

```typescript
function getEnvironmentPatterns(env: 'development' | 'staging' | 'production') {
  const commonPatterns = [
    '**/common/*.yml',
    '**/shared/*.ts',
    '!**/*.test.*',
    '!**/*.d.ts'
  ]

  const envSpecific = {
    development: [
      '**/*.yml',
      '**/*.yaml',
      '**/*.ts',
      '**/*.js',
      '**/dev-only/**',
      '**/debug/**'
    ],
    staging: [
      '**/production/*.yml',
      '**/production/*.ts',
      '**/staging-only/*.yml',
      '!**/dev-only/**',
      '!**/debug/**'
    ],
    production: [
      '**/production/*.yml',
      '**/production/*.ts',
      '!**/dev-only/**',
      '!**/debug/**',
      '!**/staging-only/**',
      '!**/experimental/**'
    ]
  }

  return [...commonPatterns, ...envSpecific[env]]
}

// Usage
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: getEnvironmentPatterns(process.env.NODE_ENV as any)
})
```

### Locale-Specific Patterns

```typescript
async function loadLocaleSpecificTranslations(targetLocales: string[]) {
  // Only load files for specific locales to reduce memory usage
  const localePatterns = targetLocales.flatMap(locale => [
    `${locale}/**/*.yml`,
    `${locale}/**/*.yaml`,
    `${locale}/**/*.ts`,
    `${locale}/**/*.js`,
    `${locale}.yml`,      // Top-level locale files
    `${locale}.yaml`
  ])

  return loadTranslations({
    translationsDir: 'locales',
    defaultLocale: targetLocales[0],
    include: [
      ...localePatterns,
      '!**/*.test.*',
      '!**/*.d.ts'
    ]
  })
}

// Load only English and Spanish translations
const translations = await loadLocaleSpecificTranslations(['en', 'es'])
```

## Complex Pattern Combinations

### Multi-Tenant Application

```typescript
interface TenantConfig {
  tenantId: string
  enabledFeatures: string[]
  customLocales?: string[]
}

function getTenantPatterns(config: TenantConfig) {
  const basePatterns = [
    '**/shared/*.yml',
    '**/shared/*.ts',
    '**/core/*.yml',
    '**/core/*.ts'
  ]

  // Add tenant-specific patterns
  const tenantPatterns = [
    `**/tenants/${config.tenantId}/*.yml`,
    `**/tenants/${config.tenantId}/*.ts`
  ]

  // Add feature-specific patterns
  const featurePatterns = config.enabledFeatures.flatMap(feature => [
    `**/features/${feature}/*.yml`,
    `**/features/${feature}/*.ts`
  ])

  // Add custom locale patterns if specified
  const localePatterns = config.customLocales
    ? config.customLocales.flatMap(locale => [
        `${locale}/**/*.yml`,
        `${locale}/**/*.ts`,
        `${locale}.yml`
      ])
    : ['**/*.yml', '**/*.ts'] // All locales

  return [
    ...basePatterns,
    ...tenantPatterns,
    ...featurePatterns,
    ...localePatterns,
    '!**/*.test.*',
    '!**/*.d.ts'
  ].filter((pattern, index, array) =>
    array.indexOf(pattern) === index // Remove duplicates
  )
}

// Usage
const tenantTranslations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: getTenantPatterns({
    tenantId: 'acme-corp',
    enabledFeatures: ['advanced-analytics', 'custom-branding', 'api-access'],
    customLocales: ['en', 'es', 'fr']
  })
})
```

### A/B Testing and Variants

```typescript
interface VariantConfig {
  experimentId: string
  variant: 'control' | 'treatment'
  overrides?: string[]
}

function getExperimentPatterns(config: VariantConfig) {
  const basePatterns = [
    '**/base/*.yml',
    '**/base/*.ts',
    '**/shared/*.yml',
    '**/shared/*.ts'
  ]

  const experimentPatterns = [
    `**/experiments/${config.experimentId}/${config.variant}/*.yml`,
    `**/experiments/${config.experimentId}/${config.variant}/*.ts`
  ]

  // Allow specific override patterns
  const overridePatterns = config.overrides?.map(override =>
    `**/overrides/${override}/*.yml`
  ) || []

  return [
    ...basePatterns,
    ...experimentPatterns,
    ...overridePatterns,
    '!**/*.test.*'
  ]
}

// Usage for A/B testing
const controlTranslations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: getExperimentPatterns({
    experimentId: 'new-checkout-flow',
    variant: 'control'
  })
})

const treatmentTranslations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: getExperimentPatterns({
    experimentId: 'new-checkout-flow',
    variant: 'treatment',
    overrides: ['urgent-messaging', 'simplified-copy']
  })
})
```

## Best Practices

### 1. **Use Consistent Naming Conventions**

```typescript
// ✅ Good: Clear, consistent patterns
const patterns = [
  '**/ui/components/*.yml',    // UI component translations
  '**/api/messages/*.ts',      // API response messages
  '**/emails/templates/*.yml', // Email template content
  '**/help/articles/*.yml'     // Help documentation
]

// ❌ Avoid: Inconsistent or unclear patterns
const badPatterns = [
  '**/stuff/*.yml',
  '**/things/*.ts',
  '**/misc/**'
]
```

### 2. **Exclude Unnecessary Files**

```typescript
// Always exclude common non-translation files
const excludePatterns = [
  '!**/*.test.*',           // Test files
  '!**/*.spec.*',           // Spec files
  '!**/*.d.ts',             // Type declarations
  '!**/*.config.*',         // Config files
  '!**/node_modules/**',    // Dependencies
  '!**/.git/**',            // Git files
  '!**/dist/**',            // Build outputs
  '!**/coverage/**'         // Test coverage
]
```

### 3. **Document Your Patterns**

```typescript
// .config/i18n.config.ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: [
    // Core application translations
    '**/core/*.yml',
    '**/core/*.ts',

    // Feature-specific translations
    '**/features/*/translations/*.yml',
    '**/features/*/dynamic/*.ts',

    // Shared utilities and formatters
    '**/shared/formatters/*.ts',
    '**/shared/validators/*.ts',

    // Exclude patterns
    '!**/*.test.*',
    '!**/*.d.ts',
    '!**/temp/**'
  ]
}
```

### 4. **Test Your Patterns**

```typescript
// scripts/test-patterns.ts
import { loadTranslations } from 'ts-i18n'

async function testPatterns(patterns: string[], description: string) {
  console.log(`\n📋 Testing: ${description}`)

  try {
    const translations = await loadTranslations({
      translationsDir: 'locales',
      defaultLocale: 'en',
      include: patterns,
      verbose: true
    })

    const localeCount = Object.keys(translations).length
    const totalKeys = Object.values(translations)
      .reduce((sum, tree) => sum + countKeys(tree), 0)

    console.log(`✅ Loaded ${localeCount} locales with ${totalKeys} total keys`)

    return { success: true, locales: localeCount, keys: totalKeys }
  } catch (error) {
    console.error(`❌ Pattern test failed:`, error.message)
    return { success: false, error: error.message }
  }
}

// Test different pattern configurations
const testSuites = [
  {
    name: 'Production patterns',
    patterns: ['**/production/*.yml', '**/production/*.ts', '!**/*.test.*']
  },
  {
    name: 'Development patterns',
    patterns: ['**/*.yml', '**/*.ts', '!**/*.test.*', '!**/*.d.ts']
  },
  {
    name: 'Feature-specific patterns',
    patterns: ['**/features/auth/*.yml', '**/features/dashboard/*.ts']
  }
]

for (const suite of testSuites) {
  await testPatterns(suite.patterns, suite.name)
}
```

### 5. **Monitor Pattern Performance**

```typescript
// Monitor loading performance for different patterns
async function benchmarkPatterns() {
  const patterns = [
    { name: 'All files', include: ['**/*.yml', '**/*.ts'] },
    { name: 'YAML only', include: ['**/*.yml', '**/*.yaml'] },
    { name: 'Core only', include: ['**/core/*.yml', '**/core/*.ts'] }
  ]

  for (const pattern of patterns) {
    const start = performance.now()

    const translations = await loadTranslations({
      translationsDir: 'locales',
      defaultLocale: 'en',
      include: pattern.include
    })

    const duration = performance.now() - start
    const fileCount = Object.keys(translations).length

    console.log(`${pattern.name}: ${duration.toFixed(2)}ms (${fileCount} files)`)
  }
}
```

This comprehensive file discovery system allows you to precisely control which translation files are loaded, enabling optimized builds for different environments, features, and deployment scenarios while maintaining excellent development experience.
