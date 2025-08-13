# Dynamic messages and params

Values may be functions receiving a single params object and returning a string.

```ts
import type { Dictionary } from 'ts-i18n'

export default {
  dynamic: {
    welcome: ({ name }: { name: string }) => `Welcome, ${name}!`,
  },
} satisfies Dictionary
```

- At runtime, functions are invoked with the provided params.
- When writing outputs, functions are stripped from JSON.
