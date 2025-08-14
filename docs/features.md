# Features

`ts-i18n` is a powerful, type-safe internationalization library designed for modern TypeScript projects. It combines the simplicity of YAML with the flexibility of TypeScript functions, providing a complete i18n solution that scales from simple websites to complex applications.

## Core Features

### 🎯 **Type Safety First**
- Auto-generated TypeScript types from your translation keys
- Compile-time validation of translation keys
- Parameter type inference for dynamic messages
- Full IDE autocomplete and refactoring support

### 📁 **Flexible File Organization**
- YAML files for simple static translations
- TypeScript files for dynamic messages with parameters
- Automatic namespace merging from directory structure
- Support for both flat and nested translation files

### 🚀 **Framework Agnostic**
- Works with React, Vue, Svelte, Solid, and any JavaScript framework
- Server-side rendering (SSR) compatible
- Client-side and build-time usage
- Zero framework dependencies

### 🌍 **Smart Locale Management**
- Configurable fallback locale chains
- Per-request locale override support
- Deep merging of translation namespaces
- Locale inheritance and composition

### ⚡ **Performance Optimized**
- Built with Bun for maximum performance
- Lazy loading support via JSON outputs
- Efficient key flattening and lookup
- Minimal runtime overhead

### 🛠 **Developer Experience**
- Intuitive CLI for building and scaffolding
- Hot reloading in development
- Comprehensive error messages
- Easy migration from other i18n libraries

## Quick Example

Here's how Chris might set up translations for his team's project:

```yaml
# locales/en.yml
welcome:
  title: "Welcome to Our App"
  subtitle: "Built by Chris, Avery, and Buddy"
user:
  greeting: "Hello there!"
  profile:
    name: "Name"
    email: "Email Address"
```

```typescript
// locales/en/dynamic.ts
import type { Dictionary } from 'ts-i18n'

export default {
  notifications: {
    welcome: ({ name, count }: { name: string; count: number }) =>
      `Welcome ${name}! You have ${count} new ${count === 1 ? 'message' : 'messages'}.`,
    teamUpdate: ({ author, project }: { author: string; project: string }) =>
      `${author} just updated the ${project} project.`
  },
  admin: {
    userJoined: ({ user, role }: { user: string; role: 'admin' | 'user' | 'viewer' }) =>
      `${user} joined as ${role === 'admin' ? 'an administrator' : `a ${role}`}.`
  }
} satisfies Dictionary
```

```typescript
// app.ts
import { createTranslator, loadTranslations } from 'ts-i18n'

const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

const t = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// Static translations
console.log(t('welcome.title')) // "Welcome to Our App"
console.log(t('user.profile.name')) // "Name"

// Dynamic translations with parameters
console.log(t('notifications.welcome', { name: 'Chris', count: 5 }))
// "Welcome Chris! You have 5 new messages."

console.log(t('admin.userJoined', { user: 'Avery', role: 'admin' }))
// "Avery joined as an administrator."
```

## Best Practices

### 1. **Organize by Feature, Not Language**
```
locales/
├── en/
│   ├── auth.yml          # Authentication messages
│   ├── dashboard.yml     # Dashboard content
│   └── notifications.ts  # Dynamic notification messages
├── es/
│   ├── auth.yml
│   ├── dashboard.yml
│   └── notifications.ts
└── fr/
    ├── auth.yml
    ├── dashboard.yml
    └── notifications.ts
```

### 2. **Use TypeScript for Complex Logic**
```typescript
// For dynamic content that needs computation
export default {
  time: {
    relative: ({ minutes }: { minutes: number }) => {
      if (minutes < 1) return 'just now'
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    }
  }
} satisfies Dictionary
```

### 3. **Leverage Type Generation**
```typescript
// Generate types from your base locale
import { generateTypesFromModule } from 'ts-i18n'

await generateTypesFromModule(
  './locales/en/index.ts',
  './dist/i18n/keys.d.ts'
)

// Now enjoy full type safety
import type { TypedTranslator } from './dist/i18n/keys'
const t: TypedTranslator = createTranslator(...)
```

### 4. **Configure Smart Fallbacks**
```typescript
const config = {
  defaultLocale: 'en',
  fallbackLocale: ['en-US', 'en'], // Try specific, then general
  translationsDir: 'locales'
}
```

## Learn More

Dive deeper into specific features:

- [**YAML + TypeScript**](/features/yaml-ts) - Mixed file format support
- [**Runtime + Types**](/features/runtime-types) - Type generation and runtime usage
- [**Framework Integration**](/features/framework-agnostic) - Using with popular frameworks

Explore advanced topics:

- [**Namespace Merging**](/advanced/namespace-merging) - File organization patterns
- [**Dynamic Messages**](/advanced/dynamic-messages) - Parameter handling and functions
- [**Fallback Strategies**](/advanced/fallback-locales) - Locale resolution chains
- [**Sources & Patterns**](/advanced/sources-and-globs) - File discovery configuration
- [**Build Pipeline**](/advanced/outputs-and-types) - Type generation and JSON outputs
