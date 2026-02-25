# ts-i18n Basic Usage Example

This example demonstrates how to use `ts-i18n` with TypeScript translation files and Bun's static site bundling for a complete type-safe internationalization solution.

## 🌟 Features Demonstrated

- **TypeScript Translation Files**: Full type safety with `satisfies Dictionary`
- **Dynamic Messages**: Functions with parameters for complex translations
- **Multi-locale Support**: English, Spanish, and French translations
- **Browser Integration**: Interactive web demo with language switching
- **Type Generation**: Auto-generated TypeScript types for compile-time safety
- **Bun Bundling**: Uses Bun's HTML bundling for zero-config development

## 📁 Project Structure

```
01-basic-usage/
├── locales/              # Translation files
│   ├── en/index.ts      # English (TypeScript with functions)
│   ├── es/index.ts      # Spanish (TypeScript with functions)
│   └── fr/index.ts      # French (TypeScript with functions)
├── index.html           # Main HTML entry point
├── styles.css           # Styling for the demo
├── browser-app.ts       # Browser-side TypeScript app
├── build.ts             # Build script for i18n assets
├── app.ts               # Node.js demo script
└── server.ts            # Simple Bun server (alternative)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Build Translation Assets

```bash
bun run build
```

This will:

- Load TypeScript translation files
- Generate JSON outputs in `dist/i18n/`
- Create TypeScript types in `dist/i18n/types.d.ts`

### 3. Run the Web Demo

```bash
bun run web
```

This uses Bun's HTML bundling to serve the interactive demo at `<http://localhost:3000>`.

### 4. Run the Node.js Demo

```bash
bun run dev
```

This runs the console demo showing TypeScript usage examples.

## 🎭 Interactive Features

The web demo includes several interactive sections:

### Language Switching

- Use the language selector to switch between English, Spanish, and French
- All content updates dynamically including complex functions

### Dynamic Translations

- **Personal Greeting**: Type your name to see personalized messages
- **Team Introduction**: Add/remove team members to see pluralization
- **Project Updates**: Configure author, action, and project for status updates
- **Task Notifications**: Adjust hours to see different due date formats
- **Member Count**: Change team size to see number formatting

### Type Safety Demo

- View generated TypeScript types
- See how compile-time validation works
- Full autocomplete support in editors

## 📝 Translation Files

### TypeScript Files with Type Safety

```typescript
// locales/en/index.ts
import type { Dictionary } from 'ts-i18n'

export default {
  welcome: {
    personalGreeting: ({ name }: { name: string }) =>
      `Welcome back, ${name}! Ready to collaborate?`,

    teamIntro: ({ members }: { members: string[] }) => {
      if (members.length === 0) return 'No team members yet'
      if (members.length === 1) return `Your team: ${members[0]}`
      // Complex pluralization logic...
    }
  },

  notifications: {
    taskDue: ({ task, hours }: { task: string, hours: number }) => {
      if (hours <= 0) return `"${task}" is overdue! ⚠️`
      if (hours === 1) return `"${task}" is due in 1 hour`
      // Time-based logic...
    }
  }
} satisfies Dictionary
```

### Generated Types

The build process generates comprehensive TypeScript types:

```typescript
// dist/i18n/types.d.ts
export type TranslationKey = DotPaths<Base>
export type ParamsFor<K extends TranslationKey> = ParamsForKey<Base, K>
export type TypedTranslator = TranslatorFor<Base>
```

This provides:

- ✅ Autocomplete for all translation keys
- ✅ Type checking for function parameters
- ✅ Compile-time validation of translations

## 🔧 Usage Patterns

### Browser Usage

```typescript
import { createTranslator } from 'ts-i18n'
import type { TypedTranslator } from './dist/i18n/types'

// Load JSON translations
const response = await fetch('/dist/i18n/en.json')
const translations = await response.json()

// Create typed translator
const t: TypedTranslator = createTranslator({ en: translations }, {
  defaultLocale: 'en'
})

// Use with full type safety
t('welcome.personalGreeting', { name: 'Chris' })
t('notifications.taskDue', { task: 'Review', hours: 6 })
```

### Node.js Usage

```typescript
import { loadTranslations, createTranslator } from 'ts-i18n'

// Load TypeScript files directly
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts']
})

const t = createTranslator(translations, {
  defaultLocale: 'en',
  fallbackLocale: 'en'
})

// Dynamic translations work seamlessly
console.log(t('welcome.teamIntro', { members: ['Chris', 'Avery', 'Buddy'] }))
```

## 🏗️ Build Process

### 1. Translation Loading

- Loads TypeScript files from `locales/` directory
- Supports complex functions with parameters
- Validates structure with `satisfies Dictionary`

### 2. JSON Generation

- Strips functions for browser compatibility
- Creates per-locale JSON files
- Optimized for runtime loading

### 3. Type Generation

- Analyzes base TypeScript module
- Generates dot-notation key types
- Infers parameter types for functions
- Creates typed translator interface

### 4. Bun Bundling

- Bundles HTML, CSS, and TypeScript
- Handles module resolution
- Provides development server
- Supports hot reloading

## 🌍 Localization Features

### Fallback Chains

```typescript
const t = createTranslator(translations, {
  defaultLocale: 'es',
  fallbackLocale: ['es', 'en'] // Spanish -> English fallback
})
```

### Runtime Locale Switching

```typescript
// Switch locale at runtime
t('welcome.title', 'fr') // Force French
t('welcome.personalGreeting', 'es', { name: 'Carlos' }) // Spanish with params
```

### Complex Pluralization

```typescript
// Handles different pluralization rules per language
teamIntro: ({ members }: { members: string[] }) => {
  // English: "John and Jane"
  // Spanish: "Juan y Juana"
  // French: "Jean et Jeanne"
}
```

## 📊 Performance

- **TypeScript Files**: Used during build/development for type safety
- **JSON Files**: Served to browsers for runtime efficiency
- **Lazy Loading**: Only load needed locales
- **Tree Shaking**: Bun removes unused code
- **Caching**: Translation files cached by locale

## 🔥 Development Workflow

1. **Write translations** in TypeScript files with full type safety
2. **Run build** to generate JSON and types
3. **Use Bun's dev server** for instant feedback
4. **Hot reload** updates as you edit translations
5. **Deploy** optimized bundles for production

This example showcases the full power of `ts-i18n` with TypeScript's type system and Bun's modern bundling capabilities!
