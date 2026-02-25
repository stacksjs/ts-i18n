/* eslint-disable no-console */
/* eslint-disable ts/no-top-level-await */
import { dts } from 'bun-plugin-dtsx'

console.log('🔧 Building bun-plugin-i18n...')

const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'bun',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production' ? 'external' : 'none',
  plugins: [dts()],
  external: ['ts-i18n', 'bun'],
})

if (!result.success) {
  console.error('❌ Build failed:')
  for (const message of result.logs) {
    console.error(message)
  }
  process.exit(1)
}

console.log('✅ Built bun-plugin-i18n successfully')
console.log(`📦 Generated ${result.outputs.length} files:`)
for (const output of result.outputs) {
  const size = (output.size / 1024).toFixed(1)
  console.log(`   ${output.path} (${size} KB)`)
}
