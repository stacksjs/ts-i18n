# ts-i18n Advanced Features Example

This example demonstrates advanced `ts-i18n` capabilities including namespace merging, fallback strategies, mixed file types, and complex dynamic translations.

## 🌟 Advanced Features Demonstrated

- **Mixed File Types**: YAML for static content + TypeScript for dynamic functions
- **Namespace Merging**: Automatic merging from directory structure
- **Fallback Strategies**: Graceful handling of missing translations
- **Complex Functions**: Advanced parameterized translations with type safety
- **Translation Validation**: Completeness checking and quality analysis
- **Advanced Formatting**: Numbers, dates, text, and list utilities

## 📁 Project Structure

```
02-advanced-features/
├── locales/
│   ├── en.yml                 # Core English static content
│   ├── en/
│   │   ├── dashboard.yml      # Dashboard namespace (static)
│   │   ├── notifications.ts   # Notifications namespace (dynamic)
│   │   └── formatters.ts      # Formatting utilities (dynamic)
│   ├── es.yml                 # Spanish static (partial - demos fallbacks)
│   └── es/
│       └── notifications.ts   # Spanish dynamic (partial)
├── build.ts                   # Advanced build script
├── app.ts                     # Comprehensive demo
├── validate.ts                # Translation validation
└── README.md
```

## 🚀 Quick Start

### 1. Install and Build

```bash
bun install
bun run build
```

### 2. Run the Demo

```bash
bun run dev
```

### 3. Validate Translations

```bash
bun run validate
```

## 🗂️ Namespace Merging

### File Organization Strategy

The example uses a sophisticated file organization that demonstrates namespace merging:

```
locales/en.yml          → en.app.*, en.navigation.*, en.common.*
locales/en/dashboard.yml → en.dashboard.*
locales/en/notifications.ts → en.notifications.*
locales/en/formatters.ts → en.formatters.*
```

### YAML Static Content

```yaml
# locales/en.yml
app:
  name: "TeamFlow Pro"
  version: "2.0"

navigation:
  dashboard: "Dashboard"
  projects: "Projects"

common:
  buttons:
    save: "Save"
    cancel: "Cancel"
```

### TypeScript Dynamic Functions

```typescript
// locales/en/notifications.ts
export default {
  userJoined: ({ user, role, invitedBy }: {
    user: string
    role: 'admin' | 'editor' | 'viewer' | 'owner'
    invitedBy: string
  }) => {
    const roleNames = { admin: 'an administrator', ... }
    return `${user} joined as ${roleNames[role]}, invited by ${invitedBy}`
  }
} satisfies Dictionary
```

## 🔄 Fallback Strategies

### Intentional Missing Translations

The Spanish translations are intentionally incomplete to demonstrate fallback behavior:

```typescript
const tEs = createTranslator(translations, {
  defaultLocale: 'es',
  fallbackLocale: 'en' // Falls back to English
})

// Available in Spanish
tEs('common.buttons.save')     // → "Guardar"

// Missing in Spanish, falls back to English
tEs('navigation.help')         // → "Help" (English fallback)
tEs('common.buttons.export')   // → "Export" (English fallback)
```

### Validation Output

The validation script shows exactly what's missing:

```
| Locale | Completeness | Keys | Issues |
|--------|-------------|------|--------|
| es     |       72.3% |  157 | ⚠️ 2   |

❌ Missing keys (43):
   - navigation.help
   - common.buttons.export
   - common.buttons.import
   - common.actions.confirm
   ...
```

## 🎭 Complex Dynamic Functions

### Advanced Parameter Types

```typescript
// Multi-enum parameters
projectStatusChange: ({ project, status, author }: {
  project: string
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'on-hold'
  author: string
}) => { /* implementation */ }

// Complex object parameters
taskAssigned: ({ task, assignee, assigner, dueDate }: {
  task: string
  assignee: string
  assigner: string
  dueDate?: Date  // Optional parameter
}) => { /* implementation */ }
```

### Conditional Logic Examples

```typescript
// Time-based conditionals
projectDeadline: ({ project, days, priority }) => {
  if (days < 0) return `"${project}" is ${Math.abs(days)} days overdue!`
  if (days === 0) return `"${project}" is due today!`
  if (days === 1) return `"${project}" is due tomorrow`
  return `"${project}" is due in ${days} days`
}

// Array handling with pluralization
milestone: ({ achievedBy }) => {
  if (achievedBy.length === 1) return `${achievedBy[0]} achieved...`
  if (achievedBy.length === 2) return `${achievedBy[0]} and ${achievedBy[1]} achieved...`
  return `${achievedBy[0]}, ${achievedBy[1]}, and ${achievedBy.length - 2} others achieved...`
}
```

## 📊 Advanced Formatting Utilities

### Number Formatting

```typescript
// Currency with locale support
formatters.numbers.currency({ amount: 1299.99, currency: 'EUR' })
// → "€1,299.99"

// File sizes
formatters.numbers.fileSize({ bytes: 1073741824 })
// → "1.0 GB"

// Compact numbers
formatters.numbers.compact({ value: 1234567 })
// → "1.2M"
```

### Date and Time

```typescript
// Relative time
formatters.dates.relative({ date: twoHoursAgo })
// → "2h ago"

// Duration between dates
formatters.dates.duration({ start: startTime, end: endTime })
// → "2h 30m"

// Business days calculation
formatters.dates.businessDays({ start: monday, end: friday })
// → "5 business days"
```

### Text Processing

```typescript
// Smart truncation
formatters.text.truncate({ text: longText, length: 30 })
// → "This is a very long text..."

// Name initials
formatters.text.initials({ name: "Christopher Alexander" })
// → "CA"

// List enumeration
formatters.lists.enumeration({ items: ['Chris', 'Avery', 'Buddy'] })
// → "Chris, Avery, and Buddy"
```

## 🔧 Build Process

### Mixed Source Loading

```typescript
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml'], // Load both types
  fallbackLocale: 'en'
})
```

### Advanced Type Generation

```typescript
await generateTypesFromModule(
  './locales/en/notifications.ts', // Complex base module
  'dist/i18n/types.d.ts'
)
```

This generates comprehensive types including:
- Union types for all translation keys
- Parameter type inference for functions
- Typed translator interface

## 🔍 Translation Validation

### Completeness Analysis

The validation script provides detailed analysis:

```bash
bun run validate
```

**Features:**
- **Completeness percentage** for each locale
- **Missing key identification** with critical key flagging
- **Extra key detection** for cleanup
- **Quality recommendations** based on thresholds
- **Issue categorization** (critical vs. minor)

### Quality Metrics

- ✅ **90%+ completion**: Excellent quality
- ⚠️ **80-89% completion**: Good quality, minor gaps
- ❌ **<80% completion**: Needs improvement

### Critical Key Detection

Automatically identifies critical keys that should be prioritized:
- Error messages (`error.*`)
- Warning messages (`warning.*`)
- Common UI buttons (`common.buttons.*`)
- Critical notifications (`critical.*`)

## 🌍 Multi-Locale Scenarios

### Production Deployment

```typescript
// Load only specific locales for production
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml'],
  include: [
    'en/**/*',     // Full English
    'es/**/*',     // Full Spanish
    'fr/**/*'      // Full French
  ]
})
```

### Feature-Specific Loading

```typescript
// Load only specific namespaces
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: [
    '**/notifications.*',  // Only notification translations
    '**/formatters.*'      // Only formatter utilities
  ]
})
```

## 🎯 Use Cases

This advanced example is perfect for:

- **Enterprise Applications**: Complex business logic with rich translations
- **Multi-Tenant Systems**: Different translation sets per tenant
- **Gradual Internationalization**: Start with English, add languages incrementally
- **Quality Assurance**: Systematic validation of translation completeness
- **Development Teams**: Mixed static/dynamic content organization
- **Performance-Critical Apps**: Namespace-based lazy loading

## 🏆 Best Practices Demonstrated

1. **Organize by Feature**: Group related translations together
2. **Use TypeScript for Logic**: Complex functions with type safety
3. **Use YAML for Static Content**: Simple, translatable text
4. **Plan Fallback Strategies**: Graceful degradation for missing keys
5. **Validate Regularly**: Automated completeness checking
6. **Type Everything**: Leverage TypeScript for compile-time safety
7. **Test Edge Cases**: Handle arrays, dates, complex parameters

This example showcases the full power of `ts-i18n` for sophisticated internationalization requirements!
