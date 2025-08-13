# writeOutputs

```ts
import { writeOutputs } from 'ts-i18n'

await writeOutputs(trees, 'dist/i18n')
// dist/i18n/en.json, dist/i18n/pt.json, ...
```

- Writes one JSON file per locale.
- Functions are stripped from the output.
- Returns an array of written file paths.
