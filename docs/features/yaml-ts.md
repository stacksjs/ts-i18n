# YAML + TypeScript Integration

`ts-i18n` provides seamless integration between YAML for static content and TypeScript for dynamic translations. This hybrid approach gives you the simplicity of YAML for most translations while leveraging TypeScript's power for complex, parameterized messages.

## YAML Files - Static Content

YAML files are perfect for static translations like labels, titles, and descriptions. They support strict object nesting with leaf values as strings, numbers, booleans, or null.

### Basic Structure

```yaml
# locales/en.yml
app:
  name: "TeamFlow"
  tagline: "Collaborate. Create. Succeed."

navigation:
  home: "Home"
  dashboard: "Dashboard"
  profile: "Profile"
  settings: "Settings"

auth:
  login:
    title: "Welcome Back"
    email: "Email Address"
    password: "Password"
    submit: "Sign In"
    forgot: "Forgot Password?"
  signup:
    title: "Join TeamFlow"
    confirmPassword: "Confirm Password"
    submit: "Create Account"
    terms: "By signing up, you agree to our Terms of Service"

dashboard:
  welcome: "Welcome back, Chris!"
  stats:
    projects: "Projects"
    tasks: "Tasks"
    team: "Team Members"
  actions:
    newProject: "New Project"
    invite: "Invite Team"
```

### Multi-locale Support

```yaml
# locales/es.yml
app:
  name: "TeamFlow"
  tagline: "Colabora. Crea. Triunfa."

navigation:
  home: "Inicio"
  dashboard: "Panel"
  profile: "Perfil"
  settings: "Configuración"

auth:
  login:
    title: "Bienvenido de Vuelta"
    email: "Dirección de Correo"
    password: "Contraseña"
    submit: "Iniciar Sesión"
    forgot: "¿Olvidaste tu Contraseña?"
```

```yaml
# locales/fr.yml
app:
  name: "TeamFlow"
  tagline: "Collaborez. Créez. Réussissez."

navigation:
  home: "Accueil"
  dashboard: "Tableau de bord"
  profile: "Profil"
  settings: "Paramètres"
```

## TypeScript Files - Dynamic Content

TypeScript files excel at dynamic translations that require parameters, computations, or complex logic. They export objects with function values that receive parameters and return strings.

### Basic Dynamic Messages

```typescript
// locales/en/messages.ts
import type { Dictionary } from 'ts-i18n'

export default {
  notifications: {
    welcome: ({ name }: { name: string }) =>
      `Welcome to TeamFlow, ${name}! 🎉`,

    projectCreated: ({ project, author }: { project: string; author: string }) =>
      `${author} created the "${project}" project`,

    taskAssigned: ({ task, assignee, assigner }: {
      task: string;
      assignee: string;
      assigner: string
    }) => `${assigner} assigned "${task}" to ${assignee}`,

    deadline: ({ task, days }: { task: string; days: number }) => {
      if (days === 0) return `"${task}" is due today! ⏰`
      if (days === 1) return `"${task}" is due tomorrow`
      if (days > 0) return `"${task}" is due in ${days} days`
      return `"${task}" was due ${Math.abs(days)} days ago ⚠️`
    }
  },

  time: {
    relative: ({ minutes }: { minutes: number }) => {
      if (minutes < 1) return 'just now'
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    },

    duration: ({ start, end }: { start: Date; end: Date }) => {
      const diff = end.getTime() - start.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) {
        const remainingMinutes = minutes % 60
        return remainingMinutes > 0
          ? `${hours}h ${remainingMinutes}m`
          : `${hours}h`
      }
      return `${minutes}m`
    }
  },

  pluralization: {
    items: ({ count, item }: { count: number; item: string }) => {
      const plural = count === 1 ? item : `${item}s`
      return `${count} ${plural}`
    },

    teamSize: ({ count }: { count: number }) => {
      if (count === 0) return 'No team members'
      if (count === 1) return '1 team member'
      return `${count} team members`
    }
  }
} satisfies Dictionary
```

### Advanced TypeScript Patterns

```typescript
// locales/en/advanced.ts
import type { Dictionary } from 'ts-i18n'

type UserRole = 'admin' | 'editor' | 'viewer'
type NotificationType = 'info' | 'warning' | 'error' | 'success'

export default {
  permissions: {
    roleBasedMessage: ({ role, action }: { role: UserRole; action: string }) => {
      const roleLabels = {
        admin: 'Administrator',
        editor: 'Editor',
        viewer: 'Viewer'
      }
      return `As ${roleLabels[role]}, you can ${action}`
    },

    accessDenied: ({ role, feature }: { role: UserRole; feature: string }) => {
      if (role === 'admin') return `Unexpected error accessing ${feature}`
      if (role === 'editor') return `${feature} requires admin privileges`
      return `${feature} is not available for viewers. Contact Chris or Avery for access.`
    }
  },

  formatting: {
    currency: ({ amount, currency = 'USD' }: { amount: number; currency?: string }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(amount)
    },

    fileSize: ({ bytes }: { bytes: number }) => {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = bytes
      let unitIndex = 0

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }

      return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
    }
  },

  alerts: {
    contextual: ({ type, message, action }: {
      type: NotificationType;
      message: string;
      action?: string
    }) => {
      const icons = { info: 'ℹ️', warning: '⚠️', error: '❌', success: '✅' }
      const base = `${icons[type]} ${message}`
      return action ? `${base} ${action}` : base
    }
  }
} satisfies Dictionary
```

## File Organization Strategies

### Strategy 1: Feature-Based Organization

```
locales/
├── en/
│   ├── auth.yml           # Authentication forms
│   ├── dashboard.yml      # Dashboard static content
│   ├── navigation.yml     # Menu and navigation
│   ├── messages.ts        # Dynamic notifications
│   ├── forms.ts          # Form validation messages
│   └── admin.ts          # Admin-specific dynamic content
├── es/
│   ├── auth.yml
│   ├── dashboard.yml
│   ├── navigation.yml
│   ├── messages.ts
│   ├── forms.ts
│   └── admin.ts
└── fr/
    └── ... (same structure)
```

### Strategy 2: Mixed Flat Structure

```
locales/
├── en.yml              # Core static translations
├── en-dynamic.ts       # All dynamic translations
├── es.yml
├── es-dynamic.ts
├── fr.yml
└── fr-dynamic.ts
```

### Strategy 3: Hybrid Namespace Approach

```
locales/
├── en/
│   ├── index.ts        # Main entry point
│   ├── static.yml      # Static content
│   └── dynamic/
│       ├── notifications.ts
│       ├── validation.ts
│       └── admin.ts
└── es/
    └── ... (same structure)
```

## Source Discovery Configuration

Control which file types to load and in what order:

### Default TypeScript-First

```typescript
// .config/i18n.config.ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts'], // TypeScript only
}
```

### Mixed Sources

```typescript
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml'], // Load both, TS files take precedence
}
```

### Custom File Patterns

```typescript
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: [
    '**/*.yml',           # All YAML files
    '**/*.yaml',          # Alternative YAML extension
    '**/dynamic/*.ts',    # Only TS files in dynamic folders
    '**/index.ts'         # Index files
  ]
}
```

## Best Practices

### 1. **Use YAML for Static Content**
- Labels, titles, descriptions
- Navigation items
- Static form labels
- Help text and tooltips

### 2. **Use TypeScript for Dynamic Content**
- Messages with parameters
- Pluralization logic
- Date/time formatting
- Complex conditional text
- Calculated values

### 3. **Consistent Naming Conventions**
```typescript
// Good: Descriptive parameter names
welcome: ({ userName, companyName }: { userName: string; companyName: string }) =>
  `Welcome to ${companyName}, ${userName}!`

// Better: Include type information in complex cases
userStatus: ({ user, isOnline, lastSeen }: {
  user: { name: string; role: string };
  isOnline: boolean;
  lastSeen?: Date
}) => {
  if (isOnline) return `${user.name} (${user.role}) is online`
  if (lastSeen) return `${user.name} was last seen ${formatRelativeTime(lastSeen)}`
  return `${user.name} hasn't been seen recently`
}
```

### 4. **Type Safety with satisfies**
Always use `satisfies Dictionary` to ensure type safety:

```typescript
import type { Dictionary } from 'ts-i18n'

export default {
  // Your translations here
} satisfies Dictionary // ✅ Type-safe

// ❌ Not type-safe
export default {
  // TypeScript won't validate the structure
}
```

### 5. **Fallback Strategies**
Structure your files so missing translations fall back gracefully:

```typescript
// locales/en/messages.ts (complete)
export default {
  errors: {
    notFound: ({ resource }: { resource: string }) => `${resource} not found`,
    permission: () => 'Access denied',
    network: () => 'Network error occurred'
  }
} satisfies Dictionary

// locales/es/messages.ts (partial - inherits from fallback)
export default {
  errors: {
    notFound: ({ resource }: { resource: string }) => `${resource} no encontrado`,
    // permission and network will fall back to English
  }
} satisfies Dictionary
```

## CLI Usage

Build your translations with different source configurations:

```bash
# TypeScript only
npx ts-i18n build --sources ts

# YAML only
npx ts-i18n build --sources yaml

# Both TypeScript and YAML
npx ts-i18n build --sources ts,yaml

# Verbose output
npx ts-i18n build --sources ts,yaml --verbose

# Custom output directory
npx ts-i18n build --out-dir dist/translations
```
