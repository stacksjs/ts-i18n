# Translation Files

ts-i18n supports both YAML and TypeScript translation files, allowing you to choose the format that best fits your workflow.

## File Structure

Organize your translations by locale in a dedicated directory:

```
lang/
  en/
    common.yml
    errors.yml
    pages.ts
  de/
    common.yml
    errors.yml
    pages.ts
  fr/
    common.yml
    errors.yml
    pages.ts
```

## YAML Files

YAML files provide a clean, readable format for static translations.

### Basic YAML Translations

```yaml
# lang/en/common.yml
greeting: Hello
farewell: Goodbye
welcome: Welcome to our app

navigation:
  home: Home
  about: About
  contact: Contact

buttons:
  submit: Submit
  cancel: Cancel
  save: Save
```

### Nested Keys

```yaml
# lang/en/errors.yml
validation:
  required: This field is required
  email: Please enter a valid email
  minLength: Must be at least {min} characters
  maxLength: Must be no more than {max} characters

server:
  500: An internal error occurred
  404: Page not found
  401: Please log in to continue
```

### Interpolation in YAML

Use curly braces for dynamic values:

```yaml
# lang/en/messages.yml
greeting: Hello, {name}!
items: You have {count} items in your cart
date: Today is {date}

user:
  welcome: Welcome back, {firstName} {lastName}!
  lastLogin: Your last login was on {date}
```

## TypeScript Files

TypeScript files enable dynamic translations with full type safety.

### Basic TypeScript Translations

```typescript
// lang/en/pages.ts
export default {
  home: {
    title: 'Welcome Home',
    description: 'The best place on the web'
  },
  about: {
    title: 'About Us',
    mission: 'Our mission is to build great software'
  }
}
```

### Dynamic Values with Functions

```typescript
// lang/en/dynamic.ts
export default {
  // Simple interpolation
  greeting: (params: { name: string }) =>
    `Hello, ${params.name}!`,

  // Complex formatting
  price: (params: { amount: number; currency: string }) =>
    `${params.currency}${params.amount.toFixed(2)}`,

  // Conditional logic
  itemCount: (params: { count: number }) => {
    if (params.count === 0) return 'No items'
    if (params.count === 1) return '1 item'
    return `${params.count} items`
  },

  // Date formatting
  lastSeen: (params: { date: Date }) =>
    `Last seen on ${params.date.toLocaleDateString()}`
}
```

### Mixed Static and Dynamic

```typescript
// lang/en/notifications.ts
export default {
  // Static strings
  newMessage: 'You have a new message',
  settingsUpdated: 'Your settings have been saved',

  // Dynamic messages
  unreadCount: (params: { count: number }) =>
    `${params.count} unread messages`,

  mentionedBy: (params: { user: string }) =>
    `${params.user} mentioned you in a comment`,

  // Complex message
  orderStatus: (params: { orderId: string; status: string }) =>
    `Order #${params.orderId} is now ${params.status}`
}
```

## Loading Translations

### Configuration

Configure the loader in your i18n config:

```typescript
// i18n.config.ts
export default {
  localesDir: './lang',
  defaultLocale: 'en',
  supportedLocales: ['en', 'de', 'fr', 'es'],
  fallbackLocale: 'en',

  // File options
  fileTypes: ['yml', 'yaml', 'ts'],  // Supported extensions
  parseYaml: true  // Enable YAML parsing
}
```

### Using the Loader

```typescript
import { createTranslator } from 'ts-i18n'

// Load translations for a specific locale
const t = await createTranslator({
  locale: 'en',
  localesDir: './lang'
})

// Use translations
t('common.greeting')              // "Hello"
t('messages.greeting', { name: 'World' })  // "Hello, World!"
```

## Best Practices

### 1. Organize by Feature

Group related translations together:

```
lang/
  en/
    auth/
      login.yml
      register.yml
    dashboard/
      overview.yml
      settings.yml
```

### 2. Use Consistent Keys

Follow a naming convention:

```yaml
# Good - consistent structure
user:
  profile:
    title: Profile
    edit: Edit Profile
    save: Save Changes

# Avoid - inconsistent
userTitle: Profile
editUserProfile: Edit Profile
saveUserChanges: Save Changes
```

### 3. Keep Translations Flat When Possible

Flat structures are easier to maintain:

```yaml
# Preferred for simple cases
button_submit: Submit
button_cancel: Cancel
button_save: Save

# Use nesting for logical grouping
navigation:
  home: Home
  about: About
```

### 4. Document Parameters

For TypeScript files, use clear parameter types:

```typescript
export default {
  /**
   * Formats a welcome message for the user
   * @param name - The user's display name
   * @param count - Number of notifications
   */
  welcomeMessage: (params: {
    name: string
    count: number
  }) => `Welcome ${params.name}! You have ${params.count} new notifications.`
}
```

### 5. Handle Missing Translations

Configure fallbacks for missing keys:

```typescript
const t = await createTranslator({
  locale: 'de',
  fallbackLocale: 'en',  // Use English when German is missing
  onMissingKey: (key) => {
    console.warn(`Missing translation: ${key}`)
    return key  // Return the key itself as fallback
  }
})
```
