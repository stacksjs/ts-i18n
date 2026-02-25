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
    experimental: process.env.NODE*ENV === 'development',
    legacy: process.env.INCLUDE*LEGACY === 'true',
    betaUI: process.env.BETA*FEATURES === 'true'
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
  include: getEnvironmentPatterns(process.env.NODE*ENV as any)
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
  '!**/node*modules/**',    // Dependencies
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

## Enterprise-Scale File Discovery

### Advanced Pattern Management

For enterprise applications with complex organizational structures, sophisticated pattern management becomes essential:

```typescript
// Enterprise pattern configuration system
interface PatternConfig {
  name: string
  description: string
  patterns: string[]
  excludes: string[]
  priority: number
  environments: string[]
  teams: string[]
  conditions?: {
    featureFlags?: string[]
    userRoles?: string[]
    deploymentType?: string[]
  }
}

class EnterprisePatternManager {
  private patterns: Map<string, PatternConfig> = new Map()
  private activeConfigs: Set<string> = new Set()
  private cache: Map<string, string[]> = new Map()

  registerPattern(config: PatternConfig): void {
    this.patterns.set(config.name, config)
    console.log(`Registered pattern: ${config.name} (${config.description})`)
  }

  activatePattern(name: string, context?: {
    environment?: string
    team?: string
    featureFlags?: string[]
    userRole?: string
    deploymentType?: string
  }): boolean {
    const config = this.patterns.get(name)
    if (!config) {
      console.warn(`Pattern not found: ${name}`)
      return false
    }

    // Check conditions
    if (config.conditions) {
      if (config.conditions.featureFlags && context?.featureFlags) {
        const hasRequiredFlags = config.conditions.featureFlags.every(flag =>
          context.featureFlags!.includes(flag)
        )
        if (!hasRequiredFlags) {
          console.log(`Pattern ${name} skipped: missing feature flags`)
          return false
        }
      }

      if (config.conditions.userRoles && context?.userRole) {
        if (!config.conditions.userRoles.includes(context.userRole)) {
          console.log(`Pattern ${name} skipped: user role not permitted`)
          return false
        }
      }

      if (config.conditions.deploymentType && context?.deploymentType) {
        if (!config.conditions.deploymentType.includes(context.deploymentType)) {
          console.log(`Pattern ${name} skipped: deployment type not supported`)
          return false
        }
      }
    }

    // Check environment and team constraints
    if (config.environments.length > 0 && context?.environment) {
      if (!config.environments.includes(context.environment)) {
        console.log(`Pattern ${name} skipped: environment not supported`)
        return false
      }
    }

    if (config.teams.length > 0 && context?.team) {
      if (!config.teams.includes(context.team)) {
        console.log(`Pattern ${name} skipped: team not authorized`)
        return false
      }
    }

    this.activeConfigs.add(name)
    this.invalidateCache()
    console.log(`Activated pattern: ${name}`)
    return true
  }

  deactivatePattern(name: string): void {
    this.activeConfigs.delete(name)
    this.invalidateCache()
    console.log(`Deactivated pattern: ${name}`)
  }

  generatePatterns(): string[] {
    const cacheKey = Array.from(this.activeConfigs).sort().join(',')

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // Get active configurations sorted by priority
    const activePatterns = Array.from(this.activeConfigs)
      .map(name => this.patterns.get(name)!)
      .filter(Boolean)
      .sort((a, b) => b.priority - a.priority)

    // Merge patterns and excludes
    const allPatterns: string[] = []
    const allExcludes: string[] = []

    for (const config of activePatterns) {
      allPatterns.push(...config.patterns)
      allExcludes.push(...config.excludes)
    }

    // Remove duplicates while preserving order
    const uniquePatterns = [...new Set(allPatterns)]
    const uniqueExcludes = [...new Set(allExcludes)]

    const finalPatterns = [...uniquePatterns, ...uniqueExcludes.map(exclude => `!${exclude}`)]

    this.cache.set(cacheKey, finalPatterns)
    return finalPatterns
  }

  private invalidateCache(): void {
    this.cache.clear()
  }

  getActivePatterns(): Array<{ name: string; config: PatternConfig }> {
    return Array.from(this.activeConfigs)
      .map(name => ({ name, config: this.patterns.get(name)! }))
      .filter(item => item.config)
      .sort((a, b) => b.config.priority - a.config.priority)
  }

  generateReport(): string {
    const active = this.getActivePatterns()
    const total = this.patterns.size

    let report = '# Pattern Manager Report\n\n'
    report += `## Overview\n`
    report += `- Total registered patterns: ${total}\n`
    report += `- Active patterns: ${active.length}\n\n`

    if (active.length > 0) {
      report += '## Active Patterns\n'
      active.forEach(({ name, config }) => {
        report += `\n### ${name} (Priority: ${config.priority})\n`
        report += `**Description:** ${config.description}\n`
        report += `**Environments:** ${config.environments.join(', ') || 'All'}\n`
        report += `**Teams:** ${config.teams.join(', ') || 'All'}\n`
        report += `**Patterns:** ${config.patterns.length} patterns\n`
        report += `**Excludes:** ${config.excludes.length} excludes\n`
      })

      report += '\n## Generated Patterns\n'
      const patterns = this.generatePatterns()
      patterns.forEach(pattern => {
        report += `- \`${pattern}\`\n`
      })
    }

    return report
  }
}

// Pre-configured enterprise patterns
const enterprisePatterns = new EnterprisePatternManager()

// Core application patterns
enterprisePatterns.registerPattern({
  name: 'core-application',
  description: 'Core application translations required for basic functionality',
  patterns: [
    '**/core/*.yml',
    '**/core/*.ts',
    '**/shared/*.yml',
    '**/common/*.yml'
  ],
  excludes: ['**/test/**', '**/spec/**'],
  priority: 100,
  environments: [],
  teams: []
})

// Feature team patterns
enterprisePatterns.registerPattern({
  name: 'frontend-team',
  description: 'Frontend team translations including UI components and interactions',
  patterns: [
    '**/ui/*.yml',
    '**/components/*.ts',
    '**/pages/*.yml',
    '**/layout/*.yml'
  ],
  excludes: ['**/backend/**', '**/api/**'],
  priority: 80,
  environments: ['development', 'staging', 'production'],
  teams: ['frontend', 'fullstack']
})

enterprisePatterns.registerPattern({
  name: 'backend-team',
  description: 'Backend team translations for API responses and server-side messaging',
  patterns: [
    '**/api/*.yml',
    '**/server/*.ts',
    '**/validation/*.ts',
    '**/errors/*.yml'
  ],
  excludes: ['**/ui/**', '**/components/**'],
  priority: 80,
  environments: ['development', 'staging', 'production'],
  teams: ['backend', 'fullstack']
})

// Feature-specific patterns
enterprisePatterns.registerPattern({
  name: 'premium-features',
  description: 'Premium and paid feature translations',
  patterns: [
    '**/premium/*.yml',
    '**/premium/*.ts',
    '**/billing/*.yml',
    '**/subscription/*.ts'
  ],
  excludes: [],
  priority: 60,
  environments: ['staging', 'production'],
  teams: ['premium', 'billing'],
  conditions: {
    featureFlags: ['premium*enabled'],
    userRoles: ['admin', 'premium*user']
  }
})

enterprisePatterns.registerPattern({
  name: 'experimental-features',
  description: 'Experimental and beta feature translations',
  patterns: [
    '**/experimental/*.yml',
    '**/experimental/*.ts',
    '**/beta/*.yml',
    '**/labs/*.ts'
  ],
  excludes: [],
  priority: 40,
  environments: ['development'],
  teams: ['experimental', 'labs'],
  conditions: {
    featureFlags: ['experimental*enabled'],
    userRoles: ['admin', 'beta*tester']
  }
})

// Compliance and regulatory patterns
enterprisePatterns.registerPattern({
  name: 'gdpr-compliance',
  description: 'GDPR compliance translations for EU deployments',
  patterns: [
    '**/compliance/gdpr/*.yml',
    '**/legal/eu/*.yml',
    '**/privacy/gdpr/*.ts'
  ],
  excludes: [],
  priority: 90,
  environments: ['staging', 'production'],
  teams: ['legal', 'compliance'],
  conditions: {
    deploymentType: ['eu-deployment']
  }
})

// Usage example
const context = {
  environment: 'production',
  team: 'frontend',
  featureFlags: ['premium*enabled'],
  userRole: 'admin',
  deploymentType: 'eu-deployment'
}

// Activate relevant patterns
enterprisePatterns.activatePattern('core-application', context)
enterprisePatterns.activatePattern('frontend-team', context)
enterprisePatterns.activatePattern('premium-features', context)
enterprisePatterns.activatePattern('gdpr-compliance', context)

// Generate final patterns for translation loading
const finalPatterns = enterprisePatterns.generatePatterns()
```

### Intelligent Pattern Optimization

```typescript
// Pattern performance analyzer and optimizer
interface PatternMetrics {
  pattern: string
  filesMatched: number
  loadTime: number
  cacheHitRate: number
  usageFrequency: number
  lastUsed: Date
}

class PatternOptimizer {
  private metrics: Map<string, PatternMetrics> = new Map()
  private optimizationRules: Array<(patterns: string[]) => string[]> = []

  constructor() {
    this.setupDefaultOptimizations()
  }

  recordPatternUsage(pattern: string, filesMatched: number, loadTime: number, fromCache: boolean): void {
    const existing = this.metrics.get(pattern) || {
      pattern,
      filesMatched: 0,
      loadTime: 0,
      cacheHitRate: 0,
      usageFrequency: 0,
      lastUsed: new Date()
    }

    existing.filesMatched = filesMatched
    existing.loadTime = loadTime
    existing.usageFrequency++
    existing.lastUsed = new Date()

    // Update cache hit rate using exponential moving average
    const alpha = 0.1
    existing.cacheHitRate = fromCache
      ? existing.cacheHitRate + alpha * (1 - existing.cacheHitRate)
      : existing.cacheHitRate * (1 - alpha)

    this.metrics.set(pattern, existing)
  }

  optimizePatterns(patterns: string[]): string[] {
    let optimized = [...patterns]

    // Apply optimization rules in sequence
    for (const rule of this.optimizationRules) {
      optimized = rule(optimized)
    }

    return optimized
  }

  private setupDefaultOptimizations(): void {
    // Remove redundant patterns
    this.optimizationRules.push((patterns) => {
      const result: string[] = []
      const seen = new Set<string>()

      for (const pattern of patterns) {
        if (!seen.has(pattern)) {
          result.push(pattern)
          seen.add(pattern)
        }
      }

      return result
    })

    // Merge similar patterns
    this.optimizationRules.push((patterns) => {
      const groups = new Map<string, string[]>()

      patterns.forEach(pattern => {
        // Group patterns by their base directory
        const baseDir = pattern.split('/')[0]
        if (!groups.has(baseDir)) {
          groups.set(baseDir, [])
        }
        groups.get(baseDir)!.push(pattern)
      })

      const result: string[] = []

      for (const [baseDir, groupPatterns] of groups) {
        if (groupPatterns.length > 3) {
          // If many patterns in same directory, use a broader pattern
          result.push(`${baseDir}/**/*.{yml,yaml,ts,js}`)
        } else {
          result.push(...groupPatterns)
        }
      }

      return result
    })

    // Sort by performance metrics
    this.optimizationRules.push((patterns) => {
      return patterns.sort((a, b) => {
        const metricsA = this.metrics.get(a)
        const metricsB = this.metrics.get(b)

        if (!metricsA && !metricsB) return 0
        if (!metricsA) return 1
        if (!metricsB) return -1

        // Prioritize patterns with better cache hit rate and higher usage
        const scoreA = metricsA.cacheHitRate * 0.7 + (metricsA.usageFrequency / 100) * 0.3
        const scoreB = metricsB.cacheHitRate * 0.7 + (metricsB.usageFrequency / 100) * 0.3

        return scoreB - scoreA
      })
    })

    // Remove unused patterns
    this.optimizationRules.push((patterns) => {
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

      return patterns.filter(pattern => {
        const metrics = this.metrics.get(pattern)
        if (!metrics) return true // Keep new patterns

        return metrics.lastUsed > cutoffDate || metrics.usageFrequency > 5
      })
    })
  }

  addOptimizationRule(rule: (patterns: string[]) => string[]): void {
    this.optimizationRules.push(rule)
  }

  getPatternRecommendations(): Array<{ pattern: string; recommendation: string }> {
    const recommendations: Array<{ pattern: string; recommendation: string }> = []

    for (const [pattern, metrics] of this.metrics) {
      if (metrics.loadTime > 1000) {
        recommendations.push({
          pattern,
          recommendation: 'Consider caching or breaking into smaller patterns - high load time'
        })
      }

      if (metrics.cacheHitRate < 0.5) {
        recommendations.push({
          pattern,
          recommendation: 'Pattern has low cache hit rate - consider stability'
        })
      }

      if (metrics.usageFrequency === 0) {
        recommendations.push({
          pattern,
          recommendation: 'Pattern never used - consider removing'
        })
      }

      if (metrics.filesMatched === 0) {
        recommendations.push({
          pattern,
          recommendation: 'Pattern matches no files - check pattern syntax'
        })
      }

      if (metrics.filesMatched > 1000) {
        recommendations.push({
          pattern,
          recommendation: 'Pattern matches many files - consider more specific patterns'
        })
      }
    }

    return recommendations
  }

  generateOptimizationReport(): string {
    const allMetrics = Array.from(this.metrics.values())
    const recommendations = this.getPatternRecommendations()

    let report = '# Pattern Optimization Report\n\n'

    report += '## Performance Summary\n'
    report += `- Total patterns tracked: ${allMetrics.length}\n`
    report += `- Average load time: ${(allMetrics.reduce((sum, m) => sum + m.loadTime, 0) / allMetrics.length).toFixed(2)}ms\n`
    report += `- Average cache hit rate: ${(allMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / allMetrics.length * 100).toFixed(1)}%\n`
    report += `- Total files matched: ${allMetrics.reduce((sum, m) => sum + m.filesMatched, 0)}\n\n`

    if (recommendations.length > 0) {
      report += '## Recommendations\n'
      recommendations.forEach(({ pattern, recommendation }, index) => {
        report += `${index + 1}. **${pattern}**: ${recommendation}\n`
      })
      report += '\n'
    }

    report += '## Top Performing Patterns\n'
    const topPatterns = allMetrics
      .sort((a, b) => (b.cacheHitRate * b.usageFrequency) - (a.cacheHitRate * a.usageFrequency))
      .slice(0, 10)

    topPatterns.forEach((metrics, index) => {
      report += `${index + 1}. \`${metrics.pattern}\` - ${metrics.usageFrequency} uses, ${(metrics.cacheHitRate * 100).toFixed(1)}% cache hit\n`
    })

    return report
  }

  exportMetrics(): Record<string, PatternMetrics> {
    return Object.fromEntries(this.metrics)
  }
}
```

### Advanced Caching Strategies

```typescript
// Sophisticated caching system for pattern-based file discovery
interface CacheEntry {
  patterns: string[]
  files: string[]
  timestamp: number
  hash: string
  metadata: {
    totalSize: number
    fileCount: number
    directories: string[]
  }
}

class PatternCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize = 100
  private ttl = 10 * 60 * 1000 // 10 minutes
  private writeThrough = true
  private hitCount = 0
  private missCount = 0

  constructor(options: {
    maxSize?: number
    ttl?: number
    writeThrough?: boolean
  } = {}) {
    this.maxSize = options.maxSize || 100
    this.ttl = options.ttl || 10 * 60 * 1000
    this.writeThrough = options.writeThrough ?? true
  }

  private generateKey(patterns: string[], baseDir: string): string {
    const sortedPatterns = [...patterns].sort()
    const content = `${baseDir}:${sortedPatterns.join('|')}`
    return this.hash(content)
  }

  private hash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  async get(patterns: string[], baseDir: string): Promise<string[] | null> {
    const key = this.generateKey(patterns, baseDir)
    const entry = this.cache.get(key)

    if (!entry) {
      this.missCount++
      return null
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    // Verify cache is still valid by checking file system if needed
    if (this.writeThrough) {
      const isValid = await this.validateCacheEntry(entry, baseDir)
      if (!isValid) {
        this.cache.delete(key)
        this.missCount++
        return null
      }
    }

    this.hitCount++
    return entry.files
  }

  async set(patterns: string[], baseDir: string, files: string[]): Promise<void> {
    const key = this.generateKey(patterns, baseDir)

    // Calculate metadata
    const metadata = await this.calculateMetadata(files, baseDir)

    const entry: CacheEntry = {
      patterns: [...patterns],
      files: [...files],
      timestamp: Date.now(),
      hash: this.hash(files.join('|')),
      metadata
    }

    // Ensure cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldestEntry()
    }

    this.cache.set(key, entry)
  }

  private async calculateMetadata(files: string[], baseDir: string): Promise<CacheEntry['metadata']> {
    let totalSize = 0
    const directories = new Set<string>()

    for (const file of files) {
      try {
        const fullPath = `${baseDir}/${file}`
        // In a real implementation, you'd use fs.stat
        // const stats = await fs.stat(fullPath)
        // totalSize += stats.size

        // Extract directory
        const dir = file.substring(0, file.lastIndexOf('/'))
        if (dir) directories.add(dir)
      } catch (error) {
        // File might not exist, skip
      }
    }

    return {
      totalSize,
      fileCount: files.length,
      directories: Array.from(directories)
    }
  }

  private async validateCacheEntry(entry: CacheEntry, baseDir: string): Promise<boolean> {
    // In a real implementation, you'd check file modification times
    // For now, we'll use a simple timestamp-based validation
    const maxAge = 5 * 60 * 1000 // 5 minutes
    return Date.now() - entry.timestamp < maxAge
  }

  private evictOldestEntry(): void {
    let oldestKey = ''
    let oldestTime = Infinity

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  invalidate(patterns?: string[], baseDir?: string): void {
    if (patterns && baseDir) {
      const key = this.generateKey(patterns, baseDir)
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  getStats(): {
    size: number
    hitRate: number
    totalRequests: number
    avgFileCount: number
    totalCachedFiles: number
  } {
    const totalRequests = this.hitCount + this.missCount
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0

    const entries = Array.from(this.cache.values())
    const avgFileCount = entries.length > 0
      ? entries.reduce((sum, entry) => sum + entry.files.length, 0) / entries.length
      : 0

    const totalCachedFiles = entries.reduce((sum, entry) => sum + entry.files.length, 0)

    return {
      size: this.cache.size,
      hitRate,
      totalRequests,
      avgFileCount,
      totalCachedFiles
    }
  }

  cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key))
  }

  export(): Record<string, CacheEntry> {
    return Object.fromEntries(this.cache)
  }

  import(data: Record<string, CacheEntry>): void {
    this.cache.clear()
    for (const [key, entry] of Object.entries(data)) {
      this.cache.set(key, entry)
    }
  }
}
```

### Multi-Environment Pattern Management

```typescript
// Environment-specific pattern resolution with inheritance
interface EnvironmentConfig {
  name: string
  inherits?: string[]
  patterns: {
    include: string[]
    exclude: string[]
  }
  overrides: Record<string, string>
  features: {
    enabled: string[]
    disabled: string[]
  }
  performance: {
    maxConcurrency: number
    timeoutMs: number
    retryAttempts: number
  }
}

class EnvironmentPatternManager {
  private environments: Map<string, EnvironmentConfig> = new Map()
  private cache = new PatternCache()
  private optimizer = new PatternOptimizer()
  
  registerEnvironment(config: EnvironmentConfig): void {
    this.environments.set(config.name, config)
  }

  async resolvePatterns(environmentName: string, basePatterns?: string[]): Promise<string[]> {
    const config = this.environments.get(environmentName)
    if (!config) {
      throw new Error(`Unknown environment: ${environmentName}`)
    }

    // Build inherited patterns
    const resolvedPatterns = await this.buildInheritedPatterns(config)

    // Add base patterns if provided
    if (basePatterns) {
      resolvedPatterns.push(...basePatterns)
    }

    // Apply overrides
    const withOverrides = this.applyOverrides(resolvedPatterns, config.overrides)

    // Optimize patterns
    const optimized = this.optimizer.optimizePatterns(withOverrides)

    return optimized
  }

  private async buildInheritedPatterns(config: EnvironmentConfig): Promise<string[]> {
    const patterns: string[] = []

    // Process inheritance chain
    if (config.inherits) {
      for (const parentName of config.inherits) {
        const parentConfig = this.environments.get(parentName)
        if (parentConfig) {
          const parentPatterns = await this.buildInheritedPatterns(parentConfig)
          patterns.push(...parentPatterns)
        }
      }
    }

    // Add own patterns
    patterns.push(...config.patterns.include)

    // Add exclusions
    patterns.push(...config.patterns.exclude.map(pattern => `!${pattern}`))

    return patterns
  }

  private applyOverrides(patterns: string[], overrides: Record<string, string>): string[] {
    return patterns.map(pattern => {
      for (const [search, replace] of Object.entries(overrides)) {
        if (pattern.includes(search)) {
          return pattern.replace(search, replace)
        }
      }
      return pattern
    })
  }

  async loadTranslationsForEnvironment(
    environmentName: string,
    translationsDir: string,
    defaultLocale: string,
    additionalPatterns?: string[]
  ): Promise<any> {
    const config = this.environments.get(environmentName)
    if (!config) {
      throw new Error(`Unknown environment: ${environmentName}`)
    }

    const patterns = await this.resolvePatterns(environmentName, additionalPatterns)

    // Use caching
    const cacheKey = `${environmentName}-${defaultLocale}`
    const cached = await this.cache.get(patterns, translationsDir)

    if (cached) {
      console.log(`Using cached patterns for ${environmentName}`)
      return this.loadFromFileList(cached, translationsDir, defaultLocale)
    }

    // Load with concurrency control
    const startTime = performance.now()

    try {
      const result = await this.loadWithConcurrencyControl(
        translationsDir,
        defaultLocale,
        patterns,
        config.performance
      )

      const loadTime = performance.now() - startTime

      // Record metrics
      this.optimizer.recordPatternUsage(
        patterns.join('|'),
        Object.keys(result).length,
        loadTime,
        false
      )

      // Update cache
      const fileList = this.extractFileList(result)
      await this.cache.set(patterns, translationsDir, fileList)

      return result

    } catch (error) {
      console.error(`Failed to load translations for ${environmentName}:`, error)
      throw error
    }
  }

  private async loadWithConcurrencyControl(
    translationsDir: string,
    defaultLocale: string,
    patterns: string[],
    performance: EnvironmentConfig['performance']
  ): Promise<any> {
    const { loadTranslations } = await import('ts-i18n')

    // Create a promise with timeout
    const loadPromise = loadTranslations({
      translationsDir,
      defaultLocale,
      include: patterns
    })

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Load timeout')), performance.timeoutMs)
    })

    let attempt = 0
    while (attempt < performance.retryAttempts) {
      try {
        return await Promise.race([loadPromise, timeoutPromise])
      } catch (error) {
        attempt++
        if (attempt >= performance.retryAttempts) {
          throw error
        }

        const delay = Math.min(1000 * Math.pow(2, attempt), 10000) // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay))
        console.log(`Retrying translation load (attempt ${attempt + 1}/${performance.retryAttempts})`)
      }
    }
  }

  private loadFromFileList(files: string[], translationsDir: string, defaultLocale: string): Promise<any> {
    // Implementation would load specific files
    // This is a simplified version
    return Promise.resolve({})
  }

  private extractFileList(translations: any): string[] {
    // Implementation would extract the actual file paths used
    // This is a simplified version
    return []
  }

  generateEnvironmentReport(environmentName: string): string {
    const config = this.environments.get(environmentName)
    if (!config) {
      return `Environment ${environmentName} not found.`
    }

    let report = `# Environment Report: ${environmentName}\n\n`

    if (config.inherits) {
      report += `## Inheritance\n`
      report += `Inherits from: ${config.inherits.join(', ')}\n\n`
    }

    report += `## Patterns\n`
    report += `**Include patterns (${config.patterns.include.length}):**\n`
    config.patterns.include.forEach(pattern => {
      report += `- \`${pattern}\`\n`
    })

    if (config.patterns.exclude.length > 0) {
      report += `\n**Exclude patterns (${config.patterns.exclude.length}):**\n`
      config.patterns.exclude.forEach(pattern => {
        report += `- \`${pattern}\`\n`
      })
    }

    if (Object.keys(config.overrides).length > 0) {
      report += `\n## Overrides\n`
      Object.entries(config.overrides).forEach(([search, replace]) => {
        report += `- \`${search}\` → \`${replace}\`\n`
      })
    }

    report += `\n## Features\n`
    report += `**Enabled:** ${config.features.enabled.join(', ') || 'None'}\n`
    report += `**Disabled:** ${config.features.disabled.join(', ') || 'None'}\n`

    report += `\n## Performance Settings\n`
    report += `- Max Concurrency: ${config.performance.maxConcurrency}\n`
    report += `- Timeout: ${config.performance.timeoutMs}ms\n`
    report += `- Retry Attempts: ${config.performance.retryAttempts}\n`

    return report
  }

  listEnvironments(): Array<{ name: string; inherits: string[]; patterns: number }> {
    return Array.from(this.environments.entries()).map(([name, config]) => ({
      name,
      inherits: config.inherits || [],
      patterns: config.patterns.include.length + config.patterns.exclude.length
    }))
  }
}

// Example environment configurations
const envManager = new EnvironmentPatternManager()

// Base environment
envManager.registerEnvironment({
  name: 'base',
  patterns: {
    include: [
      '**/common/*.yml',
      '**/shared/*.yml',
      '**/core/*.ts'
    ],
    exclude: [
      '**/test/**',
      '**/spec/**',
      '**/*.test.*',
      '**/*.spec.*'
    ]
  },
  overrides: {},
  features: {
    enabled: [],
    disabled: []
  },
  performance: {
    maxConcurrency: 5,
    timeoutMs: 30000,
    retryAttempts: 3
  }
})

// Development environment
envManager.registerEnvironment({
  name: 'development',
  inherits: ['base'],
  patterns: {
    include: [
      '**/*.yml',
      '**/*.ts',
      '**/debug/**',
      '**/dev-only/**'
    ],
    exclude: [
      '**/production-only/**'
    ]
  },
  overrides: {
    'production': 'development'
  },
  features: {
    enabled: ['debug', 'dev-tools', 'hot-reload'],
    disabled: []
  },
  performance: {
    maxConcurrency: 10,
    timeoutMs: 60000,
    retryAttempts: 1
  }
})

// Production environment
envManager.registerEnvironment({
  name: 'production',
  inherits: ['base'],
  patterns: {
    include: [
      '**/production/*.yml',
      '**/stable/*.ts',
      '**/optimized/**'
    ],
    exclude: [
      '**/debug/**',
      '**/dev-only/**',
      '**/experimental/**',
      '**/beta/**'
    ]
  },
  overrides: {
    'development': 'production'
  },
  features: {
    enabled: ['minification', 'optimization'],
    disabled: ['debug', 'dev-tools']
  },
  performance: {
    maxConcurrency: 3,
    timeoutMs: 15000,
    retryAttempts: 5
  }
})

// Enterprise environment
envManager.registerEnvironment({
  name: 'enterprise',
  inherits: ['production'],
  patterns: {
    include: [
      '**/enterprise/*.yml',
      '**/compliance/*.ts',
      '**/audit/**'
    ],
    exclude: [
      '**/consumer/**'
    ]
  },
  overrides: {},
  features: {
    enabled: ['audit-logging', 'compliance-mode', 'enterprise-sso'],
    disabled: ['telemetry']
  },
  performance: {
    maxConcurrency: 2,
    timeoutMs: 10000,
    retryAttempts: 3
  }
})

// Usage examples
const prodPatterns = await envManager.resolvePatterns('production')
console.log('Production patterns:', prodPatterns)

const devTranslations = await envManager.loadTranslationsForEnvironment(
  'development',
  'locales',
  'en'
)

console.log(envManager.generateEnvironmentReport('enterprise'))
```

This comprehensive file discovery system allows you to precisely control which translation files are loaded, enabling optimized builds for different environments, features, and deployment scenarios while maintaining excellent development experience.
