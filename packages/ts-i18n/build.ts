/* eslint-disable ts/no-top-level-await */
import { dts } from 'bun-plugin-dtsx'

// Target 'bun' (not 'browser') because the config loader imports
// `bunfig`, which transitively pulls in `node:stream/promises`. This
// library is Bun/Node-only — server-side i18n loading from disk has
// no meaningful browser story.
await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'bun',
  plugins: [dts()],
  minify: true,
})

await Bun.build({
  entrypoints: ['bin/cli.ts'],
  outdir: './dist',
  target: 'bun',
  plugins: [dts()],
  minify: true,
})
