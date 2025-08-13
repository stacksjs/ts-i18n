# Sources and globs

File discovery is controlled by either `include` or `sources`.

- `include: string[]` globs relative to `translationsDir`. If set, used as-is.
- `sources: ('ts'|'yaml')[]` controls default patterns when `include` is not set:
  - `ts` → `**/*.ts`, `**/*.js`
  - `yaml` → `**/*.yml`, `**/*.yaml`

Example:

```ts
export default {
  translationsDir: 'locales',
  defaultLocale: 'en',
  include: ['**/*.yml', '**/*.yaml', '**/*.ts'],
}
```
