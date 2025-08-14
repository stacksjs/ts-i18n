# Namespace Merging

`ts-i18n` provides powerful namespace merging capabilities that allow you to organize your translations into logical groups while maintaining a cohesive translation tree. This system uses file paths and directory structures to automatically organize your translations into namespaces.

## Understanding Namespace Structure

### File Path to Namespace Mapping

The namespace is determined by the file's location relative to the locale directory:

```
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

**Resulting namespace structure:**
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

**Resulting structure:**
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

**Unwrapped result:**
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

**Merged result:**
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

This comprehensive namespace merging system allows you to build scalable, maintainable translation structures that grow with your application while keeping everything organized and accessible.
