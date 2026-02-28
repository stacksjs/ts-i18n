# Translation Files

ts-i18n supports both YAML and TypeScript translation files, giving you flexibility in how you structure your internationalization content.

## File Formats

### YAML Files

YAML files are ideal for static, simple translations:

```yaml
# locales/en.yml
home:
  title: Welcome to our app
  description: The best application for your needs

auth:
  login: Login
  logout: Logout
  register: Create Account

errors:
  notFound: Page not found
  serverError: Something went wrong
```

```yaml
# locales/es.yml
home:
  title: Bienvenido a nuestra aplicacion
  description: La mejor aplicacion para tus necesidades

auth:
  login: Iniciar sesion
  logout: Cerrar sesion
  register: Crear cuenta

errors:
  notFound: Pagina no encontrada
  serverError: Algo salio mal
```

### TypeScript Files

TypeScript files support dynamic translations with functions:

```typescript
// locales/en/index.ts
import type { Dictionary } from 'ts-i18n'

export default {
  // Static translations
  home: {
    title: 'Welcome',
    subtitle: 'Get started today'
  },

  // Dynamic translations with parameters
  greeting: {
    hello: ({ name }: { name: string }) => `Hello, ${name}!`,
    welcome: ({ user, count }: { user: string; count: number }) =>
      `Welcome back, ${user}! You have ${count} new messages.`
  },

  // Nested structures
  dashboard: {
    stats: {
      users: 'Total Users',
      revenue: 'Total Revenue',
      orders: 'New Orders'
    }
  }
} satisfies Dictionary
```

```typescript
// locales/es/index.ts
import type { Dictionary } from 'ts-i18n'

export default {
  home: {
    title: 'Bienvenido',
    subtitle: 'Comienza hoy'
  },

  greeting: {
    hello: ({ name }: { name: string }) => `Hola, ${name}!`,
    welcome: ({ user, count }: { user: string; count: number }) =>
      `Bienvenido de nuevo, ${user}! Tienes ${count} mensajes nuevos.`
  },

  dashboard: {
    stats: {
      users: 'Usuarios Totales',
      revenue: 'Ingresos Totales',
      orders: 'Nuevos Pedidos'
    }
  }
} satisfies Dictionary
```

## Using the Dictionary Type

The `Dictionary` type ensures your translations are valid:

```typescript
import type { Dictionary } from 'ts-i18n'

// Valid dictionary
const translations = {
  key: 'string value',
  nested: {
    key: 'nested value'
  },
  dynamic: ({ param }: { param: string }) => `Value: ${param}`,
  number: 42,        // Numbers are allowed
  boolean: true      // Booleans are allowed
} satisfies Dictionary

// Invalid - arrays are not allowed at leaves
const invalid = {
  items: ['a', 'b', 'c']  // Error!
} satisfies Dictionary
```

## Dynamic Translations

Dynamic translations use functions to interpolate values:

```typescript
// locales/en/messages.ts
export default {
  // Simple parameter
  hello: ({ name }: { name: string }) => `Hello, ${name}!`,

  // Multiple parameters
  orderStatus: ({ orderId, status }: { orderId: string; status: string }) =>
    `Order #${orderId} is ${status}`,

  // Numeric parameters
  itemCount: ({ count }: { count: number }) =>
    `You have ${count} item${count !== 1 ? 's' : ''} in your cart`,

  // Complex logic
  timeAgo: ({ minutes }: { minutes: number }) => {
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  }
} satisfies Dictionary
```

Using dynamic translations:

```typescript
const t = createTranslator(translations, { defaultLocale: 'en' })

t('hello', { name: 'Alice' })              // "Hello, Alice!"
t('orderStatus', { orderId: '123', status: 'shipped' })
t('itemCount', { count: 5 })               // "You have 5 items in your cart"
t('timeAgo', { minutes: 45 })              // "45 minutes ago"
```

## Mixed YAML and TypeScript

Combine YAML for static strings and TypeScript for dynamic ones:

```yaml
# locales/en/static.yml
buttons:
  submit: Submit
  cancel: Cancel
  save: Save
  delete: Delete

labels:
  email: Email Address
  password: Password
  name: Full Name
```

```typescript
// locales/en/dynamic.ts
export default {
  validation: {
    required: ({ field }: { field: string }) => `${field} is required`,
    minLength: ({ field, min }: { field: string; min: number }) =>
      `${field} must be at least ${min} characters`,
    email: 'Please enter a valid email address'
  },

  notifications: {
    saved: ({ item }: { item: string }) => `${item} has been saved`,
    deleted: ({ item }: { item: string }) => `${item} has been deleted`
  }
} satisfies Dictionary
```

Load both sources:

```typescript
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts', 'yaml']  // Load both formats
})
```

## Namespace Organization

Organize translations by feature or domain:

```
locales/
  en/
    index.ts       # Re-exports all namespaces
    common.ts      # Shared strings
    auth.ts        # Authentication
    dashboard.ts   # Dashboard
    settings.ts    # Settings page
    errors.ts      # Error messages
```

**locales/en/index.ts**:

```typescript
import auth from './auth'
import common from './common'
import dashboard from './dashboard'
import errors from './errors'
import settings from './settings'

export default {
  auth,
  common,
  dashboard,
  errors,
  settings
}
```

**locales/en/auth.ts**:

```typescript
export default {
  login: {
    title: 'Sign In',
    button: 'Sign In',
    forgotPassword: 'Forgot your password?',
    noAccount: "Don't have an account?"
  },
  register: {
    title: 'Create Account',
    button: 'Create Account',
    hasAccount: 'Already have an account?'
  }
}
```

## Configuration Options

### TypeScript Only

```typescript
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['ts']  // Only TypeScript files
})
```

### YAML Only

```typescript
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  sources: ['yaml']  // Only YAML files
})
```

### Specific File Patterns

```typescript
const translations = await loadTranslations({
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: ['**/common.yml', '**/auth.ts']  // Only specific files
})
```

## Best Practices

### 1. Use Consistent Keys

```typescript
// Good: Consistent naming
const good = {
  user: {
    profile: {
      title: 'Profile',
      edit: 'Edit Profile'
    }
  }
}

// Avoid: Inconsistent naming
const avoid = {
  userProfile: 'Profile',      // Flat
  user_edit: 'Edit Profile'    // Different style
}
```

### 2. Group Related Translations

```typescript
// Good: Grouped by feature
const grouped = {
  cart: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
    checkout: 'Proceed to Checkout',
    total: 'Total'
  }
}
```

### 3. Keep Dynamic Logic Simple

```typescript
// Good: Simple interpolation
const simple = {
  greeting: ({ name }: { name: string }) => `Hello, ${name}!`
}

// Avoid: Complex business logic in translations
const complex = {
  price: ({ amount, currency, discount }: any) => {
    // Don't put business logic here
    const discounted = amount * (1 - discount)
    return formatCurrency(discounted, currency)
  }
}
```

### 4. Document Special Parameters

```typescript
/**
 * User-related translations
 * @param name - The user's display name
 * @param count - Number of items (for pluralization)
 */
export default {
  welcome: ({ name }: { name: string }) => `Welcome, ${name}!`,
  items: ({ count }: { count: number }) => `${count} items`
} satisfies Dictionary
```
