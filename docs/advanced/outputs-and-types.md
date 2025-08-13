# Outputs and types

- `writeOutputs` emits per-locale JSON and strips functions.
- `generateTypes` derives a union of keys from the first locale tree.
- `generateTypesFromModule` produces stronger types based on a TS base module, including param inference and a typed translator.

Recommended:

- Keep TS as the base (`sources: ['ts', 'yaml']`) for better type inference.
- Emit JSON for the build pipeline only when needed by the runtime/bundler.
