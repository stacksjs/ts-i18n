import { CAC } from 'cac'
import { version } from '../package.json'
import { config as defaultConfig } from '../src/config'
import { loadTranslations } from '../src/loader'
import { generateTypes } from '../src/typegen'

const cli = new CAC('ts-i18n')

cli
  .command('build', 'Build i18n output and generate types')
  .action(async () => {
    const cfg = defaultConfig
    const trees = await loadTranslations(cfg)
    if (cfg.typesOutFile) await generateTypes(trees, cfg.typesOutFile)
    console.log(`Locales: ${Object.keys(trees).join(', ')}`)
  })

cli
  .command('list', 'List discovered locales and files')
  .action(async () => {
    const cfg = defaultConfig
    const trees = await loadTranslations(cfg)
    for (const [locale, tree] of Object.entries(trees)) {
      const count = Object.keys(tree).length
      console.log(`${locale}: ${count} top-level namespaces`)
    }
  })

cli
  .command('check', 'Validate locales for missing keys vs default locale')
  .action(async () => {
    const cfg = defaultConfig
    const trees = await loadTranslations(cfg)
    const [base, ...rest] = Object.keys(trees)
    if (!base) return console.log('No locales found')

    const baseTree = trees[base]
    const baseKeys = new Set<string>(collectKeys(baseTree))
    let ok = true

    for (const loc of rest) {
      const keys = new Set<string>(collectKeys(trees[loc]))
      for (const k of baseKeys) {
        if (!keys.has(k)) {
          ok = false
          console.log(`[missing] ${loc}: ${k}`)
        }
      }
    }

    console.log(ok ? 'All good' : 'Issues found')
  })

cli.version(version)
cli.help()
cli.parse()

function collectKeys(tree: any, prefix = ''): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(tree)) {
    const full = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) keys.push(...collectKeys(v as any, full))
    else keys.push(full)
  }
  return keys
}
