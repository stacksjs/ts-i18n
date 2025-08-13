# Type generation

## generateTypes

```ts
import { generateTypes } from 'ts-i18n'
await generateTypes(trees, 'dist/i18n/keys.d.ts')
```

- Emits a union type `TranslationKey` derived from the first locale's keys.

## generateTypesFromModule

```ts
import { generateTypesFromModule } from 'ts-i18n'
await generateTypesFromModule('./locales/en/index.ts', 'dist/i18n/keys.d.ts')
```

- Produces a declaration file that references your base TS module and exports:
  - `TranslationKey` as `DotPaths<Base>`
  - `ParamsFor<K>` for per-key params
  - `TypedTranslator` as `TranslatorFor<Base>`
