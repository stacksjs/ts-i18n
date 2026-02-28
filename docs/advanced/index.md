# Advanced Usage

Advanced patterns and customizations for ts-i18n.

## Topics

### Custom Loaders
Create custom translation loaders for various sources.
[Learn more](/advanced/loaders)

### Caching Strategies
Optimize translation loading with caching.
[Learn more](/advanced/caching)

### SSR Support
Server-side rendering with proper locale handling.
[Learn more](/advanced/ssr)

### Testing i18n
Test your internationalized applications.
[Learn more](/advanced/testing)

## Quick Example

```typescript
import { createI18n, defineLoader } from 'ts-i18n'

// Custom loader for API-based translations
const apiLoader = defineLoader({
  async load(locale, namespace) {
    const response = await fetch(`/api/translations/${locale}/${namespace}`)
    return response.json()
  },
  cache: true,
  ttl: 3600,
})

const i18n = createI18n({
  loader: apiLoader,
  lazy: true,
})
```
