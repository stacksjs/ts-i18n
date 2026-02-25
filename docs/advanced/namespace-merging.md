# Namespace Merging

`ts-i18n` provides powerful namespace merging capabilities that allow you to organize your translations into logical groups while maintaining a cohesive translation tree. This system uses file paths and directory structures to automatically organize your translations into namespaces.

## Understanding Namespace Structure

### File Path to Namespace Mapping

The namespace is determined by the file's location relative to the locale directory:

```text
locales/
├── en.yml                    # → en.*
├── en/
│   ├── home.yml             # → en.home.*
│   ├── auth/
│   │   ├── login.yml        # → en.auth.login.*
│   │   └── signup.ts        # → en.auth.signup.*
│   └── dashboard/
│       ├── index.yml        # → en.dashboard.*
│       ├── projects.ts      # → en.dashboard.projects.*
│       └── team.yml         # → en.dashboard.team.*
```

### Basic Examples

Let's see how Chris might organize his team's project translations:

```yaml
# locales/en.yml - Root level translations
app:
  name: "TeamFlow"
  tagline: "Collaborate with Chris, Avery, and Buddy"

common:
  save: "Save"
  cancel: "Cancel"
  delete: "Delete"
  loading: "Loading..."
```

```yaml
# locales/en/auth.yml - Authentication namespace
title: "Welcome Back"
subtitle: "Sign in to continue to TeamFlow"
form:
  email: "Email Address"
  password: "Password"
  submit: "Sign In"
  forgot: "Forgot Password?"
errors:
  invalidCredentials: "Invalid email or password"
  emailRequired: "Email is required"
```

```typescript
// locales/en/notifications.ts - Dynamic notifications
import type { Dictionary } from 'ts-i18n'

export default {
  welcome: ({ name }: { name: string }) =>
    `Welcome to TeamFlow, ${name}! 🎉`,

  projectUpdate: ({ author, project, action }: {
    author: string
    project: string
    action: 'created' | 'updated' | 'archived'
  }) => {
    const actionMap = {
      created: 'created',
      updated: 'updated',
      archived: 'archived'
    }
    return `${author} ${actionMap[action]} the "${project}" project`
  },

  taskAssigned: ({ task, assignee, assigner }: {
    task: string
    assignee: string
    assigner: string
  }) => `${assigner} assigned "${task}" to ${assignee}`
} satisfies Dictionary
```

### Resulting namespace structure


```typescript
// Accessible as:
t('app.name')                    // "TeamFlow"
t('common.save')                 // "Save"
t('auth.title')                  // "Welcome Back"
t('auth.form.email')             // "Email Address"
t('notifications.welcome', { name: 'Chris' })
t('notifications.projectUpdate', {
  author: 'Buddy',
  project: 'New Feature',
  action: 'created'
})
```

## Advanced Merging Patterns

### Deep Nested Structures

```yaml
# locales/en/dashboard/analytics.yml
title: "Analytics Dashboard"
charts:
  revenue:
    title: "Revenue Overview"
    subtitle: "Monthly revenue trends"
    tooltip: "Click to view details"
  users:
    title: "User Growth"
    subtitle: "Active users over time"
filters:
  timeRange:
    label: "Time Range"
    options:
      week: "Last Week"
      month: "Last Month"
      quarter: "Last Quarter"
      year: "Last Year"
```

```typescript
// locales/en/dashboard/widgets.ts
import type { Dictionary } from 'ts-i18n'

export default {
  projectStatus: ({ completed, total }: { completed: number; total: number }) => {
    const percentage = Math.round((completed / total) * 100)
    return `${completed}/${total} tasks completed (${percentage}%)`
  },

  teamActivity: ({ recentActions }: { recentActions: number }) => {
    if (recentActions === 0) return 'No recent activity'
    if (recentActions === 1) return '1 recent action'
    return `${recentActions} recent actions`
  },

  storageUsage: ({ used, total, unit = 'GB' }: {
    used: number
    total: number
    unit?: string
  }) => `${used}${unit} of ${total}${unit} used`
} satisfies Dictionary
```

### Resulting structure


```typescript
// Accessible as:
t('dashboard.analytics.title')
t('dashboard.analytics.charts.revenue.title')
t('dashboard.analytics.filters.timeRange.options.month')
t('dashboard.widgets.projectStatus', { completed: 8, total: 12 })
t('dashboard.widgets.storageUsage', { used: 2.5, total: 10 })
```

### File Wrapping and Unwrapping

`ts-i18n` automatically unwraps files that export a single key matching their filename:

```yaml
# locales/en/settings.yml
# If this file exports a single "settings" key, it gets unwrapped
settings:
  profile:
    title: "Profile Settings"
    description: "Manage your account information"
  preferences:
    theme: "Theme"
    language: "Language"
    notifications: "Email Notifications"
  security:
    password: "Change Password"
    twoFactor: "Two-Factor Authentication"
```

### Unwrapped result


```typescript
// Becomes: en.settings.profile.title (not en.settings.settings.profile.title)
t('settings.profile.title')
t('settings.preferences.theme')
t('settings.security.password')
```

### Multiple File Merging

Multiple files can contribute to the same namespace:

```yaml
# locales/en/auth/forms.yml
login:
  title: "Sign In"
  emailPlaceholder: "Enter your email"
  passwordPlaceholder: "Enter your password"

signup:
  title: "Create Account"
  confirmPasswordPlaceholder: "Confirm password"
```

```typescript
// locales/en/auth/validation.ts
import type { Dictionary } from 'ts-i18n'

export default {
  login: {
    emailRequired: () => 'Email is required',
    passwordRequired: () => 'Password is required',
    invalidFormat: ({ field }: { field: string }) => `${field} format is invalid`
  },

  signup: {
    passwordTooShort: ({ minLength }: { minLength: number }) =>
      `Password must be at least ${minLength} characters`,
    passwordMismatch: () => 'Passwords do not match',
    emailExists: () => 'An account with this email already exists'
  }
} satisfies Dictionary
```

```yaml
# locales/en/auth/messages.yml
login:
  success: "Welcome back!"
  failed: "Sign in failed. Please try again."

signup:
  success: "Account created successfully!"
  checkEmail: "Please check your email to verify your account"
```

### Merged result


```typescript
// All files merge into the auth namespace
t('auth.forms.login.title')
t('auth.forms.signup.confirmPasswordPlaceholder')
t('auth.validation.login.emailRequired')
t('auth.validation.signup.passwordTooShort', { minLength: 8 })
t('auth.messages.login.success')
t('auth.messages.signup.checkEmail')
```

## Multi-Locale Namespace Consistency

### Maintaining Structure Across Locales

```yaml
# locales/en/team.yml
title: "Team Management"
members:
  title: "Team Members"
  invite: "Invite Member"
  roles:
    admin: "Administrator"
    editor: "Editor"
    viewer: "Viewer"
permissions:
  view: "Can view projects"
  edit: "Can edit projects"
  manage: "Can manage team settings"
```

```yaml
# locales/es/team.yml
title: "Gestión de Equipo"
members:
  title: "Miembros del Equipo"
  invite: "Invitar Miembro"
  roles:
    admin: "Administrador"
    editor: "Editor"
    viewer: "Observador"
permissions:
  view: "Puede ver proyectos"
  edit: "Puede editar proyectos"
  manage: "Puede gestionar configuración del equipo"
```

```yaml
# locales/fr/team.yml
title: "Gestion d'Équipe"
members:
  title: "Membres de l'Équipe"
  invite: "Inviter un Membre"
  roles:
    admin: "Administrateur"
    editor: "Éditeur"
    viewer: "Observateur"
permissions:
  view: "Peut voir les projets"
  edit: "Peut modifier les projets"
  manage: "Peut gérer les paramètres d'équipe"
```

All locales maintain the same namespace structure: `team.title`, `team.members.invite`, `team.roles.admin`, etc.

## Best Practices

### 1. **Organize by Feature, Not UI Structure**

```
✅ Good: Feature-based organization
locales/en/
├── auth/
│   ├── login.yml
│   ├── signup.yml
│   └── recovery.yml
├── dashboard/
│   ├── projects.yml
│   ├── analytics.yml
│   └── settings.yml
└── billing/
    ├── plans.yml
    ├── invoices.yml
    └── payment.yml

❌ Avoid: UI-based organization
locales/en/
├── header.yml
├── sidebar.yml
├── modal.yml
└── footer.yml
```

### 2. **Use Consistent Naming Conventions**

```yaml
# Good: Consistent patterns
user:
  profile:
    title: "Profile"
    edit: "Edit Profile"
    save: "Save Changes"
  settings:
    title: "Settings"
    edit: "Edit Settings"
    save: "Save Settings"

# Consistent action naming
actions:
  create: "Create"
  edit: "Edit"
  delete: "Delete"
  save: "Save"
  cancel: "Cancel"
```

### 3. **Group Related Dynamic Functions**

```typescript
// locales/en/formatters.ts - Grouping related utilities
export default {
  date: {
    relative: ({ date }: { date: Date }) => {
      // Implementation for relative dates
    },
    absolute: ({ date, format }: { date: Date; format: string }) => {
      // Implementation for absolute dates
    }
  },

  number: {
    currency: ({ amount, currency }: { amount: number; currency: string }) => {
      // Currency formatting
    },
    percentage: ({ value, decimals = 1 }: { value: number; decimals?: number }) => {
      // Percentage formatting
    }
  },

  text: {
    truncate: ({ text, length }: { text: string; length: number }) => {
      // Text truncation
    },
    capitalize: ({ text }: { text: string }) => {
      // Capitalization
    }
  }
} satisfies Dictionary
```

### 4. **Handle Namespace Conflicts Gracefully**

When multiple files contribute to the same namespace, later files override earlier ones:

```yaml
# locales/en/common.yml (loaded first)
buttons:
  save: "Save"
  cancel: "Cancel"
```

```yaml
# locales/en/overrides.yml (loaded later)
buttons:
  save: "Save Changes"  # Overrides the previous value
  submit: "Submit"      # Adds new value
```

### 5. **Use Index Files for Namespace Aggregation**

```typescript
// locales/en/dashboard/index.ts - Aggregates dashboard namespace
import projects from './projects'
import analytics from './analytics'
import settings from './settings'

export default {
  title: 'Dashboard',
  welcome: ({ name }: { name: string }) => `Welcome back, ${name}!`,
  ...projects,
  ...analytics,
  ...settings
} satisfies Dictionary
```

### 6. **Validate Namespace Consistency**

Use TypeScript to ensure namespace consistency across locales:

```typescript
// scripts/validate-namespaces.ts
import { loadTranslations } from 'ts-i18n'
import { collectKeys } from 'ts-i18n/utils'

async function validateNamespaces() {
  const translations = await loadTranslations({
    translationsDir: 'locales',
    defaultLocale: 'en'
  })

  const baseKeys = collectKeys(translations.en).sort()

  for (const [locale, tree] of Object.entries(translations)) {
    if (locale === 'en') continue

    const localeKeys = collectKeys(tree).sort()
    const missingKeys = baseKeys.filter(key => !localeKeys.includes(key))

    if (missingKeys.length > 0) {
      console.warn(`Missing keys in ${locale}:`, missingKeys)
    }
  }
}

validateNamespaces()
```

## Troubleshooting Common Issues

### Issue: Unexpected Namespace Structure

**Problem:** Files aren't merging as expected

```yaml
# locales/en/auth.yml
auth:  # ❌ Unnecessary wrapper
  login:
    title: "Sign In"
```

**Solution:** Remove the unnecessary wrapper or use proper file organization

```yaml
# locales/en/auth.yml
login:  # ✅ Will become en.auth.login.*
  title: "Sign In"

# OR move to locales/en/auth/login.yml
title: "Sign In"  # ✅ Will become en.auth.login.title
```

### Issue: Namespace Conflicts

**Problem:** Multiple files trying to define the same namespace path

**Solution:** Use different file names or reorganize structure:

```
❌ Conflict:
locales/en/
├── user.yml          # Defines user.*
└── user/
    └── profile.yml   # Also tries to define user.*

✅ Resolution:
locales/en/
├── user.yml          # Defines user.* (basic info)
└── user/
    └── profile.yml   # Defines user.profile.*
    └── settings.yml  # Defines user.settings.*
```

### Issue: Missing Translation Inheritance

**Problem:** Partial translations in non-default locales

**Solution:** Use fallback locales and validate completeness:

```typescript
const t = createTranslator(translations, {
  defaultLocale: 'es',
  fallbackLocale: ['es', 'en'] // Falls back to English if Spanish missing
})
```

## Production Namespace Strategies

### Microservices and Distributed Teams

For large-scale applications with multiple teams and microservices, sophisticated namespace organization becomes critical:

```typescript
// Multi-service namespace architecture
interface ServiceNamespaces {
  'user-service': {
    auth: Record<string, any>
    profile: Record<string, any>
    preferences: Record<string, any>
  }
  'order-service': {
    cart: Record<string, any>
    checkout: Record<string, any>
    fulfillment: Record<string, any>
  }
  'content-service': {
    cms: Record<string, any>
    blog: Record<string, any>
    media: Record<string, any>
  }
}

// Service-specific translation loading
async function loadServiceTranslations(serviceName: keyof ServiceNamespaces, locale: string) {
  const serviceTranslations = await loadTranslations({
    translationsDir: `services/${serviceName}/locales`,
    defaultLocale: locale,
    include: [
      `**/${locale}/*.yml`,
      `**/${locale}/*.ts`,
      `${locale}.yml`
    ]
  })

  // Transform to namespace the entire service
  return {
    [serviceName]: serviceTranslations[locale]
  }
}

// Aggregate translations from multiple services
class ServiceTranslationAggregator {
  private cache = new Map<string, any>()
  private loadingPromises = new Map<string, Promise<any>>()

  async loadAllServices(locale: string, services: string[] = []): Promise<any> {
    const cacheKey = `${locale}-${services.join(',')}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)
    }

    const loadPromise = this.doLoadAllServices(locale, services)
    this.loadingPromises.set(cacheKey, loadPromise)

    try {
      const result = await loadPromise
      this.cache.set(cacheKey, result)
      this.loadingPromises.delete(cacheKey)
      return result
    } catch (error) {
      this.loadingPromises.delete(cacheKey)
      throw error
    }
  }

  private async doLoadAllServices(locale: string, services: string[]): Promise<any> {
    const servicesToLoad = services.length > 0 ? services : [
      'user-service',
      'order-service',
      'content-service',
      'notification-service',
      'analytics-service'
    ]

    const servicePromises = servicesToLoad.map(service =>
      loadServiceTranslations(service as keyof ServiceNamespaces, locale)
        .catch(error => {
          console.warn(`Failed to load translations for ${service}:`, error)
          return { [service]: {} } // Return empty object for failed services
        })
    )

    const serviceResults = await Promise.all(servicePromises)

    // Merge all service translations
    return serviceResults.reduce((acc, serviceTranslation) => ({
      ...acc,
      ...serviceTranslation
    }), {})
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Usage example
const aggregator = new ServiceTranslationAggregator()

// Load translations for specific services
const userServiceTranslations = await aggregator.loadAllServices('en', ['user-service'])

// Load all service translations
const allTranslations = await aggregator.loadAllServices('en')
```

### Dynamic Namespace Loading

```typescript
// Feature-based dynamic namespace loading
interface FeatureConfig {
  name: string
  enabled: boolean
  beta?: boolean
  dependencies?: string[]
  namespaces: string[]
}

class FeatureBasedNamespaceLoader {
  private featureConfig: Map<string, FeatureConfig> = new Map()
  private loadedNamespaces: Set<string> = new Set()
  private translations: Map<string, any> = new Map()

  constructor(features: FeatureConfig[]) {
    features.forEach(feature => {
      this.featureConfig.set(feature.name, feature)
    })
  }

  async loadFeatureTranslations(
    featureName: string,
    locale: string,
    userContext?: { betaAccess: boolean }
  ): Promise<any> {
    const feature = this.featureConfig.get(featureName)
    if (!feature) {
      throw new Error(`Unknown feature: ${featureName}`)
    }

    // Check if feature is enabled
    if (!feature.enabled) {
      console.warn(`Feature ${featureName} is disabled`)
      return {}
    }

    // Check beta access
    if (feature.beta && !userContext?.betaAccess) {
      console.warn(`Feature ${featureName} requires beta access`)
      return {}
    }

    // Load dependencies first
    if (feature.dependencies) {
      for (const dep of feature.dependencies) {
        await this.loadFeatureTranslations(dep, locale, userContext)
      }
    }

    // Load feature namespaces
    const featureTranslations: any = {}

    for (const namespace of feature.namespaces) {
      const cacheKey = `${namespace}-${locale}`

      if (this.translations.has(cacheKey)) {
        featureTranslations[namespace] = this.translations.get(cacheKey)
        continue
      }

      try {
        const translations = await loadTranslations({
          translationsDir: `features/${featureName}/locales`,
          defaultLocale: locale,
          include: [
            `**/${namespace}/*.yml`,
            `**/${namespace}/*.ts`
          ]
        })

        const namespaceData = translations[locale] || {}
        this.translations.set(cacheKey, namespaceData)
        featureTranslations[namespace] = namespaceData
        this.loadedNamespaces.add(namespace)
      } catch (error) {
        console.error(`Failed to load namespace ${namespace} for feature ${featureName}:`, error)
      }
    }

    return featureTranslations
  }

  async loadAllEnabledFeatures(
    locale: string,
    userContext?: { betaAccess: boolean }
  ): Promise<any> {
    const enabledFeatures = Array.from(this.featureConfig.values())
      .filter(feature => feature.enabled)
      .filter(feature => !feature.beta || userContext?.betaAccess)

    const featurePromises = enabledFeatures.map(feature =>
      this.loadFeatureTranslations(feature.name, locale, userContext)
    )

    const featureResults = await Promise.all(featurePromises)

    // Merge all feature translations
    return featureResults.reduce((acc, featureTranslation) =>
      this.deepMerge(acc, featureTranslation), {})
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  getLoadedNamespaces(): string[] {
    return Array.from(this.loadedNamespaces)
  }

  unloadFeature(featureName: string): void {
    const feature = this.featureConfig.get(featureName)
    if (feature) {
      feature.namespaces.forEach(namespace => {
        this.loadedNamespaces.delete(namespace)
        // Remove from cache
        for (const key of this.translations.keys()) {
          if (key.startsWith(namespace + '-')) {
            this.translations.delete(key)
          }
        }
      })
    }
  }
}

// Configuration example
const featureLoader = new FeatureBasedNamespaceLoader([
  {
    name: 'advanced-analytics',
    enabled: true,
    beta: true,
    namespaces: ['analytics', 'dashboard', 'reports']
  },
  {
    name: 'social-features',
    enabled: true,
    beta: false,
    dependencies: ['user-profiles'],
    namespaces: ['social', 'notifications', 'feed']
  },
  {
    name: 'user-profiles',
    enabled: true,
    beta: false,
    namespaces: ['profiles', 'settings']
  }
])

// Load translations based on user access
const userTranslations = await featureLoader.loadAllEnabledFeatures('en', {
  betaAccess: true
})
```

### Namespace Versioning and Migration

```typescript
// Version-aware namespace loading
interface NamespaceVersion {
  version: string
  deprecated?: boolean
  migrationPath?: string
  compatibilityLayer?: Record<string, string>
}

class VersionedNamespaceManager {
  private versions: Map<string, NamespaceVersion[]> = new Map()
  private activeVersions: Map<string, string> = new Map()
  private migrations: Map<string, (old: any) => any> = new Map()

  registerNamespaceVersions(namespace: string, versions: NamespaceVersion[]): void {
    this.versions.set(namespace, versions.sort((a, b) =>
      this.compareVersions(b.version, a.version) // Newest first
    ))

    // Set latest non-deprecated version as active
    const latestStable = versions.find(v => !v.deprecated)
    if (latestStable) {
      this.activeVersions.set(namespace, latestStable.version)
    }
  }

  registerMigration(fromVersion: string, toVersion: string, migrator: (old: any) => any): void {
    this.migrations.set(`${fromVersion}-${toVersion}`, migrator)
  }

  async loadNamespaceVersion(
    namespace: string,
    locale: string,
    requestedVersion?: string
  ): Promise<any> {
    const versions = this.versions.get(namespace)
    if (!versions) {
      throw new Error(`Unknown namespace: ${namespace}`)
    }

    const targetVersion = requestedVersion || this.activeVersions.get(namespace)
    if (!targetVersion) {
      throw new Error(`No active version set for namespace: ${namespace}`)
    }

    const versionInfo = versions.find(v => v.version === targetVersion)
    if (!versionInfo) {
      throw new Error(`Version ${targetVersion} not found for namespace: ${namespace}`)
    }

    // Load the specific version
    const versionPath = `${namespace}/v${targetVersion}`
    const translations = await loadTranslations({
      translationsDir: 'locales',
      defaultLocale: locale,
      include: [
        `**/${versionPath}/*.yml`,
        `**/${versionPath}/*.ts`
      ]
    })

    let namespaceData = translations[locale] || {}

    // Apply migrations if needed
    if (versionInfo.migrationPath) {
      namespaceData = await this.applyMigrations(
        namespace,
        namespaceData,
        versionInfo.migrationPath,
        targetVersion
      )
    }

    // Apply compatibility layer
    if (versionInfo.compatibilityLayer) {
      namespaceData = this.applyCompatibilityLayer(
        namespaceData,
        versionInfo.compatibilityLayer
      )
    }

    return namespaceData
  }

  private async applyMigrations(
    namespace: string,
    data: any,
    fromVersion: string,
    toVersion: string
  ): Promise<any> {
    const migrationKey = `${fromVersion}-${toVersion}`
    const migrator = this.migrations.get(migrationKey)

    if (migrator) {
      console.log(`Applying migration for ${namespace}: ${fromVersion} → ${toVersion}`)
      return migrator(data)
    }

    // Try to find a migration path through intermediate versions
    const versions = this.versions.get(namespace) || []
    const migrationPath = this.findMigrationPath(fromVersion, toVersion, versions)

    if (migrationPath.length > 0) {
      let currentData = data
      let currentVersion = fromVersion

      for (const nextVersion of migrationPath) {
        const stepMigrator = this.migrations.get(`${currentVersion}-${nextVersion}`)
        if (stepMigrator) {
          currentData = stepMigrator(currentData)
          currentVersion = nextVersion
        }
      }

      return currentData
    }

    console.warn(`No migration path found from ${fromVersion} to ${toVersion}`)
    return data
  }

  private findMigrationPath(
    fromVersion: string,
    toVersion: string,
    versions: NamespaceVersion[]
  ): string[] {
    // Simplified pathfinding - in reality, you'd want a proper graph algorithm
    const versionList = versions.map(v => v.version).sort(this.compareVersions)
    const fromIndex = versionList.indexOf(fromVersion)
    const toIndex = versionList.indexOf(toVersion)

    if (fromIndex === -1 || toIndex === -1) return []

    if (fromIndex < toIndex) {
      return versionList.slice(fromIndex + 1, toIndex + 1)
    } else {
      return versionList.slice(toIndex, fromIndex).reverse()
    }
  }

  private applyCompatibilityLayer(
    data: any,
    compatibilityLayer: Record<string, string>
  ): any {
    const enhanced = { ...data }

    for (const [oldKey, newKey] of Object.entries(compatibilityLayer)) {
      const value = this.getNestedValue(enhanced, newKey)
      if (value !== undefined) {
        this.setNestedValue(enhanced, oldKey, value)
      }
    }

    return enhanced
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0

      if (aPart !== bPart) {
        return aPart - bPart
      }
    }

    return 0
  }

  deprecateVersion(namespace: string, version: string): void {
    const versions = this.versions.get(namespace)
    if (versions) {
      const versionInfo = versions.find(v => v.version === version)
      if (versionInfo) {
        versionInfo.deprecated = true
        console.warn(`Version ${version} of ${namespace} is now deprecated`)
      }
    }
  }

  getNamespaceStatus(namespace: string): {
    activeVersion: string | undefined
    availableVersions: string[]
    deprecatedVersions: string[]
  } {
    const versions = this.versions.get(namespace) || []
    return {
      activeVersion: this.activeVersions.get(namespace),
      availableVersions: versions.map(v => v.version),
      deprecatedVersions: versions.filter(v => v.deprecated).map(v => v.version)
    }
  }
}

// Example usage
const versionManager = new VersionedNamespaceManager()

// Register namespace versions
versionManager.registerNamespaceVersions('user-interface', [
  {
    version: '1.0.0',
    deprecated: true,
    compatibilityLayer: {
      'buttons.submit': 'actions.submit',
      'forms.validation': 'validation.messages'
    }
  },
  {
    version: '1.1.0',
    deprecated: true,
    migrationPath: '1.0.0'
  },
  {
    version: '2.0.0',
    deprecated: false
  }
])

// Register migrations
versionManager.registerMigration('1.0.0', '1.1.0', (oldData) => {
  // Example migration: restructure button texts
  if (oldData.buttons) {
    return {
      ...oldData,
      actions: oldData.buttons,
      buttons: undefined
    }
  }
  return oldData
})

versionManager.registerMigration('1.1.0', '2.0.0', (oldData) => {
  // Example migration: flatten structure
  if (oldData.forms?.inputs) {
    return {
      ...oldData,
      inputs: oldData.forms.inputs,
      forms: { ...oldData.forms, inputs: undefined }
    }
  }
  return oldData
})

// Load specific version
const legacyTranslations = await versionManager.loadNamespaceVersion(
  'user-interface',
  'en',
  '1.0.0'
)

// Load latest version
const currentTranslations = await versionManager.loadNamespaceVersion(
  'user-interface',
  'en'
)
```

### Namespace Analytics and Monitoring

```typescript
// Namespace usage analytics
interface NamespaceMetrics {
  namespace: string
  keyCount: number
  usageCount: number
  lastAccessed: Date
  missingKeys: string[]
  duplicateKeys: string[]
  performance: {
    averageLoadTime: number
    cacheHitRate: number
  }
}

class NamespaceAnalytics {
  private metrics: Map<string, NamespaceMetrics> = new Map()
  private keyUsage: Map<string, number> = new Map()
  private loadTimes: Map<string, number[]> = new Map()
  private cacheStats: Map<string, { hits: number; misses: number }> = new Map()

  recordNamespaceLoad(namespace: string, loadTime: number): void {
    const times = this.loadTimes.get(namespace) || []
    times.push(loadTime)

    // Keep only recent measurements
    if (times.length > 100) {
      times.shift()
    }

    this.loadTimes.set(namespace, times)
    this.updateMetrics(namespace)
  }

  recordKeyUsage(namespace: string, key: string): void {
    const fullKey = `${namespace}.${key}`
    const count = this.keyUsage.get(fullKey) || 0
    this.keyUsage.set(fullKey, count + 1)

    this.updateMetrics(namespace)
  }

  recordCacheEvent(namespace: string, hit: boolean): void {
    const stats = this.cacheStats.get(namespace) || { hits: 0, misses: 0 }
    if (hit) {
      stats.hits++
    } else {
      stats.misses++
    }
    this.cacheStats.set(namespace, stats)

    this.updateMetrics(namespace)
  }

  private updateMetrics(namespace: string): void {
    const metric = this.metrics.get(namespace) || {
      namespace,
      keyCount: 0,
      usageCount: 0,
      lastAccessed: new Date(),
      missingKeys: [],
      duplicateKeys: [],
      performance: {
        averageLoadTime: 0,
        cacheHitRate: 0
      }
    }

    // Update last accessed
    metric.lastAccessed = new Date()

    // Calculate usage count
    const namespaceKeys = Array.from(this.keyUsage.keys())
      .filter(key => key.startsWith(`${namespace}.`))
    metric.usageCount = namespaceKeys.reduce((sum, key) =>
      sum + (this.keyUsage.get(key) || 0), 0)

    // Calculate performance metrics
    const loadTimes = this.loadTimes.get(namespace) || []
    if (loadTimes.length > 0) {
      metric.performance.averageLoadTime =
        loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
    }

    const cacheStats = this.cacheStats.get(namespace)
    if (cacheStats) {
      const total = cacheStats.hits + cacheStats.misses
      metric.performance.cacheHitRate = total > 0 ? cacheStats.hits / total : 0
    }

    this.metrics.set(namespace, metric)
  }

  analyzeNamespace(namespace: string, translations: any): NamespaceMetrics {
    const keys = this.collectAllKeys(translations)
    const metric = this.metrics.get(namespace) || {
      namespace,
      keyCount: 0,
      usageCount: 0,
      lastAccessed: new Date(),
      missingKeys: [],
      duplicateKeys: [],
      performance: {
        averageLoadTime: 0,
        cacheHitRate: 0
      }
    }

    metric.keyCount = keys.length
    metric.duplicateKeys = this.findDuplicateKeys(keys)

    this.metrics.set(namespace, metric)
    return metric
  }

  private collectAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null && typeof value !== 'function') {
        keys.push(...this.collectAllKeys(value, fullKey))
      } else {
        keys.push(fullKey)
      }
    }

    return keys
  }

  private findDuplicateKeys(keys: string[]): string[] {
    const keyCount = new Map<string, number>()
    keys.forEach(key => {
      keyCount.set(key, (keyCount.get(key) || 0) + 1)
    })

    return Array.from(keyCount.entries())
      .filter(([, count]) => count > 1)
      .map(([key]) => key)
  }

  generateReport(): string {
    const allMetrics = Array.from(this.metrics.values())
    const totalUsage = allMetrics.reduce((sum, m) => sum + m.usageCount, 0)
    const avgLoadTime = allMetrics.reduce((sum, m) => sum + m.performance.averageLoadTime, 0) / allMetrics.length
    const avgCacheHitRate = allMetrics.reduce((sum, m) => sum + m.performance.cacheHitRate, 0) / allMetrics.length

    let report = '# Namespace Analytics Report\n\n'

    report += '## Overview\n'
    report += `- Total Namespaces: ${allMetrics.length}\n`
    report += `- Total Key Usage: ${totalUsage}\n`
    report += `- Average Load Time: ${avgLoadTime.toFixed(2)}ms\n`
    report += `- Average Cache Hit Rate: ${(avgCacheHitRate * 100).toFixed(1)}%\n\n`

    report += '## Top Used Namespaces\n'
    const topUsed = allMetrics
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)

    topUsed.forEach(metric => {
      report += `- ${metric.namespace}: ${metric.usageCount} uses, ${metric.keyCount} keys\n`
    })

    report += '\n## Performance Issues\n'
    const slowNamespaces = allMetrics
      .filter(m => m.performance.averageLoadTime > avgLoadTime * 1.5)
      .sort((a, b) => b.performance.averageLoadTime - a.performance.averageLoadTime)

    if (slowNamespaces.length === 0) {
      report += 'No significant performance issues detected.\n'
    } else {
      slowNamespaces.forEach(metric => {
        report += `- ${metric.namespace}: ${metric.performance.averageLoadTime.toFixed(2)}ms load time\n`
      })
    }

    report += '\n## Cache Performance\n'
    const lowCacheHit = allMetrics
      .filter(m => m.performance.cacheHitRate < 0.8)
      .sort((a, b) => a.performance.cacheHitRate - b.performance.cacheHitRate)

    if (lowCacheHit.length === 0) {
      report += 'All namespaces have good cache performance.\n'
    } else {
      lowCacheHit.forEach(metric => {
        report += `- ${metric.namespace}: ${(metric.performance.cacheHitRate * 100).toFixed(1)}% hit rate\n`
      })
    }

    return report
  }

  getNamespaceRecommendations(namespace: string): string[] {
    const metric = this.metrics.get(namespace)
    if (!metric) return ['Namespace not found']

    const recommendations: string[] = []

    if (metric.performance.averageLoadTime > 100) {
      recommendations.push('Consider optimizing load time with caching or smaller chunks')
    }

    if (metric.performance.cacheHitRate < 0.7) {
      recommendations.push('Improve caching strategy for better performance')
    }

    if (metric.duplicateKeys.length > 0) {
      recommendations.push(`Remove ${metric.duplicateKeys.length} duplicate keys`)
    }

    if (metric.usageCount === 0) {
      recommendations.push('Consider removing unused namespace')
    }

    if (metric.keyCount > 1000) {
      recommendations.push('Consider splitting large namespace into smaller ones')
    }

    return recommendations.length > 0 ? recommendations : ['No issues detected']
  }

  exportMetrics(): any {
    return {
      timestamp: new Date().toISOString(),
      namespaces: Object.fromEntries(this.metrics),
      keyUsage: Object.fromEntries(this.keyUsage),
      summary: {
        totalNamespaces: this.metrics.size,
        totalKeys: Array.from(this.keyUsage.keys()).length,
        totalUsage: Array.from(this.keyUsage.values()).reduce((sum, count) => sum + count, 0)
      }
    }
  }
}

// Integration with namespace loading
const analytics = new NamespaceAnalytics()

// Monitored namespace loader
function createMonitoredNamespaceLoader() {
  return new Proxy(loadTranslations, {
    async apply(target, thisArg, args) {
      const startTime = performance.now()

      try {
        const result = await target.apply(thisArg, args)
        const loadTime = performance.now() - startTime

        // Record metrics for each loaded namespace
        Object.keys(result).forEach(locale => {
          analytics.recordNamespaceLoad(locale, loadTime)
          analytics.analyzeNamespace(locale, result[locale])
        })

        return result
      } catch (error) {
        console.error('Failed to load translations:', error)
        throw error
      }
    }
  })
}

// Usage tracking translator
function createAnalyticsTranslator(baseTranslator: any, namespace: string) {
  return new Proxy(baseTranslator, {
    apply(target, thisArg, args) {
      const [key] = args
      analytics.recordKeyUsage(namespace, key)

      return target.apply(thisArg, args)
    }
  })
}
```

## Advanced Troubleshooting

### Namespace Conflict Resolution

```typescript
// Conflict detection and resolution
interface NamespaceConflict {
  type: 'duplicate*key' | 'type*mismatch' | 'override*warning'
  namespace1: string
  namespace2: string
  path: string
  details: string
  severity: 'low' | 'medium' | 'high'
  autoResolvable: boolean
}

class NamespaceConflictResolver {
  private conflicts: NamespaceConflict[] = []
  private resolutionStrategies: Map<string, (conflict: NamespaceConflict, data: any) => any> = new Map()

  constructor() {
    this.setupDefaultStrategies()
  }

  detectConflicts(translations: Record<string, any>): NamespaceConflict[] {
    this.conflicts = []

    const allKeys = new Map<string, Array<{ namespace: string; value: any; type: string }>>()

    // Collect all keys from all namespaces
    for (const [namespace, data] of Object.entries(translations)) {
      this.collectKeysWithMetadata(data, namespace, '', allKeys)
    }

    // Check for conflicts
    for (const [key, instances] of allKeys) {
      if (instances.length > 1) {
        this.analyzeKeyConflict(key, instances)
      }
    }

    return this.conflicts
  }

  private collectKeysWithMetadata(
    obj: any,
    namespace: string,
    prefix: string,
    allKeys: Map<string, Array<{ namespace: string; value: any; type: string }>>
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const valueType = typeof value

      if (valueType === 'object' && value !== null && !Array.isArray(value)) {
        this.collectKeysWithMetadata(value, namespace, fullKey, allKeys)
      } else {
        const instances = allKeys.get(fullKey) || []
        instances.push({ namespace, value, type: valueType })
        allKeys.set(fullKey, instances)
      }
    }
  }

  private analyzeKeyConflict(
    key: string,
    instances: Array<{ namespace: string; value: any; type: string }>
  ): void {
    // Check for type mismatches
    const types = new Set(instances.map(i => i.type))
    if (types.size > 1) {
      this.conflicts.push({
        type: 'type*mismatch',
        namespace1: instances[0].namespace,
        namespace2: instances[1].namespace,
        path: key,
        details: `Type mismatch: ${instances.map(i => `${i.namespace}(${i.type})`).join(' vs ')}`,
        severity: 'high',
        autoResolvable: false
      })
    }

    // Check for different values of same type
    const values = instances.map(i => JSON.stringify(i.value))
    const uniqueValues = new Set(values)

    if (uniqueValues.size > 1) {
      this.conflicts.push({
        type: 'duplicate*key',
        namespace1: instances[0].namespace,
        namespace2: instances[1].namespace,
        path: key,
        details: `Different values: ${instances.map(i => `${i.namespace}: ${JSON.stringify(i.value)}`).join(', ')}`,
        severity: this.calculateSeverity(instances),
        autoResolvable: true
      })
    }
  }

  private calculateSeverity(instances: Array<{ namespace: string; value: any; type: string }>): 'low' | 'medium' | 'high' {
    // Simple heuristic for severity
    if (instances.some(i => i.type === 'function')) return 'high'
    if (instances.length > 2) return 'medium'
    return 'low'
  }

  private setupDefaultStrategies(): void {
    // Strategy: Use first occurrence
    this.resolutionStrategies.set('first*wins', (conflict, data) => {
      console.log(`Resolving conflict at ${conflict.path}: using first occurrence from ${conflict.namespace1}`)
      return data // No modification needed as first value is already present
    })

    // Strategy: Use last occurrence
    this.resolutionStrategies.set('last*wins', (conflict, data) => {
      console.log(`Resolving conflict at ${conflict.path}: using last occurrence from ${conflict.namespace2}`)
      // Implementation would override the value
      return data
    })

    // Strategy: Merge arrays/objects
    this.resolutionStrategies.set('merge', (conflict, data) => {
      console.log(`Resolving conflict at ${conflict.path}: attempting merge`)
      // Implementation would attempt to merge compatible values
      return data
    })

    // Strategy: Namespace prefix
    this.resolutionStrategies.set('namespace*prefix', (conflict, data) => {
      console.log(`Resolving conflict at ${conflict.path}: adding namespace prefixes`)
      // Implementation would rename conflicting keys
      return data
    })
  }

  resolveConflicts(
    translations: Record<string, any>,
    strategy: string = 'first*wins'
  ): Record<string, any> {
    const resolver = this.resolutionStrategies.get(strategy)
    if (!resolver) {
      throw new Error(`Unknown resolution strategy: ${strategy}`)
    }

    const conflicts = this.detectConflicts(translations)
    const autoResolvable = conflicts.filter(c => c.autoResolvable)

    let resolved = { ...translations }

    for (const conflict of autoResolvable) {
      resolved = resolver(conflict, resolved)
    }

    // Report unresolvable conflicts
    const unresolvable = conflicts.filter(c => !c.autoResolvable)
    if (unresolvable.length > 0) {
      console.warn('Unresolvable conflicts detected:', unresolvable)
    }

    return resolved
  }

  generateConflictReport(): string {
    let report = '# Namespace Conflict Report\n\n'

    if (this.conflicts.length === 0) {
      report += 'No conflicts detected.\n'
      return report
    }

    const byType = this.conflicts.reduce((acc, conflict) => {
      acc[conflict.type] = (acc[conflict.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const bySeverity = this.conflicts.reduce((acc, conflict) => {
      acc[conflict.severity] = (acc[conflict.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    report += '## Summary\n'
    report += `Total conflicts: ${this.conflicts.length}\n\n`

    report += '### By Type\n'
    Object.entries(byType).forEach(([type, count]) => {
      report += `- ${type}: ${count}\n`
    })

    report += '\n### By Severity\n'
    Object.entries(bySeverity).forEach(([severity, count]) => {
      report += `- ${severity}: ${count}\n`
    })

    report += '\n## Detailed Conflicts\n'
    this.conflicts.forEach((conflict, index) => {
      report += `\n### Conflict ${index + 1} (${conflict.severity})\n`
      report += `**Type:** ${conflict.type}\n`
      report += `**Path:** ${conflict.path}\n`
      report += `**Namespaces:** ${conflict.namespace1} vs ${conflict.namespace2}\n`
      report += `**Details:** ${conflict.details}\n`
      report += `**Auto-resolvable:** ${conflict.autoResolvable ? 'Yes' : 'No'}\n`
    })

    return report
  }

  addCustomStrategy(name: string, resolver: (conflict: NamespaceConflict, data: any) => any): void {
    this.resolutionStrategies.set(name, resolver)
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.resolutionStrategies.keys())
  }
}

// Usage example
const conflictResolver = new NamespaceConflictResolver()

// Add custom resolution strategy
conflictResolver.addCustomStrategy('priority*namespace', (conflict, data) => {
  const priorityOrder = ['user-service', 'core', 'shared']
  const winningNamespace = priorityOrder.find(ns =>
    ns === conflict.namespace1 || ns === conflict.namespace2
  )
  
  console.log(`Using priority strategy: ${winningNamespace} wins for ${conflict.path}`)
  return data
})

// Detect and resolve conflicts
const conflicts = conflictResolver.detectConflicts(allTranslations)
if (conflicts.length > 0) {
  console.log(conflictResolver.generateConflictReport())
  const resolved = conflictResolver.resolveConflicts(allTranslations, 'priority_namespace')
}
```

This comprehensive namespace merging system allows you to build scalable, maintainable translation structures that grow with your application while keeping everything organized and accessible.
