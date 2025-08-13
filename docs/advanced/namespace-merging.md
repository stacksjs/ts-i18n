# Namespace merging

Files under a locale directory are merged deeply into that locale tree.

- `locales/en.yml` merges as the entire `en` tree
- `locales/en/home.yml` merges under `en.home`
- `locales/en/dynamic.ts` merges under `en.dynamic`

If a nested file exports an object with a single key equal to its filename (without extension), that top-level wrapper is unwrapped. For example, `locales/en/home.yml` exporting `{ home: { title: 'Home' } }` becomes `en.home.title`.
