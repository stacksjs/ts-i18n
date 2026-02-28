# Features Overview

ts-i18n provides comprehensive internationalization for TypeScript applications.

## Core Features

### Lazy Loading
Load translations on demand for optimal bundle size.
[Learn more](/features/lazy-loading)

### Namespace Support
Organize translations into logical namespaces.
[Learn more](/features/namespaces)

### ICU MessageFormat
Full support for ICU message formatting standards.
[Learn more](/features/icu)

### Vue Integration
First-class Vue.js integration with composables.
[Learn more](/features/vue)

## Quick Example

```typescript
import { createI18n, t } from 'ts-i18n'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      greeting: 'Hello, {name}!',
      items: '{count, plural, =0 {No items} one {# item} other {# items}}',
    },
  },
})

t('greeting', { name: 'World' }) // "Hello, World!"
t('items', { count: 5 }) // "5 items"
```
