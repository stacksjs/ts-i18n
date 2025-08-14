import { dts } from 'bun-plugin-dtsx'

await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'browser',
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
