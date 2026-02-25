#!/usr/bin/env bun
/* eslint-disable no-console */

import { CLI } from '@stacksjs/clapp'
// import { CAC } from 'cac'
import { version } from '../package.json'
import { config as defaultConfig, defaultConfig as defaultValues } from '../src/config'
import { loadTranslations } from '../src/loader'
import { writeOutputs } from '../src/output'
import { generateSampleConfig } from '../src/scaffold'
import { generateTypes, generateTypesFromModule } from '../src/typegen'
import { collectKeys } from '../src/utils'

const cli = new CLI('ts-i18n')

cli
  .command('build', 'Build i18n output and generate types')
  .option('--sources <sources>', 'Comma-separated sources: ts,yaml')
  .option('--ts-only', 'Use only TS/JS sources')
  .option('--yaml-only', 'Use only YAML sources')
  .option('--types-from <module>', 'Generate .d.ts from base TS module (e.g. ./locales/en/index.ts)')
  .action(async (opts: { sources?: string, tsOnly?: boolean, yamlOnly?: boolean, typesFrom?: string }) => {
    const cfg = { ...defaultConfig }
    if (opts.tsOnly)
      cfg.sources = ['ts']
    else if (opts.yamlOnly)
      cfg.sources = ['yaml']
    else if (opts.sources)
      cfg.sources = opts.sources.split(',').map(s => s.trim()).filter(Boolean) as any

    const trees = await loadTranslations(cfg)
    if (cfg.outDir) {
      const files = await writeOutputs(trees, cfg.outDir)
      console.log(`Wrote ${files.length} files to ${cfg.outDir}`)
    }
    if (opts.typesFrom) {
      await generateTypesFromModule(opts.typesFrom, cfg.typesOutFile ?? 'dist/i18n/keys.d.ts')
    }
    else if (cfg.typesOutFile) {
      await generateTypes(trees, cfg.typesOutFile)
    }
    console.log(`Locales: ${Object.keys(trees).join(', ')}`)
  })

cli
  .command('init', 'Create a sample .config/i18n.config.ts from defaults')
  .option('--out <path>', 'Output file path', { default: '.config/i18n.config.ts' })
  .action(async (opts: { out: string }) => {
    const file = await generateSampleConfig(defaultValues, opts.out)
    console.log(`Created sample config at ${file}`)
  })

cli
  .command('list', 'List discovered locales and files')
  .option('--sources <sources>', 'Comma-separated sources: ts,yaml')
  .option('--ts-only', 'Use only TS/JS sources')
  .option('--yaml-only', 'Use only YAML sources')
  .action(async (opts: { sources?: string, tsOnly?: boolean, yamlOnly?: boolean }) => {
    const cfg = { ...defaultConfig }
    if (opts.tsOnly)
      cfg.sources = ['ts']
    else if (opts.yamlOnly)
      cfg.sources = ['yaml']
    else if (opts.sources)
      cfg.sources = opts.sources.split(',').map(s => s.trim()).filter(Boolean) as any

    const trees = await loadTranslations(cfg)
    for (const [locale, tree] of Object.entries(trees)) {
      const count = Object.keys(tree).length
      console.log(`${locale}: ${count} top-level namespaces`)
    }
  })

cli
  .command('check', 'Validate locales for missing keys vs default locale')
  .option('--sources <sources>', 'Comma-separated sources: ts,yaml')
  .option('--ts-only', 'Use only TS/JS sources')
  .option('--yaml-only', 'Use only YAML sources')
  .action(async (opts: { sources?: string, tsOnly?: boolean, yamlOnly?: boolean }) => {
    const cfg = { ...defaultConfig }
    if (opts.tsOnly)
      cfg.sources = ['ts']
    else if (opts.yamlOnly)
      cfg.sources = ['yaml']
    else if (opts.sources)
      cfg.sources = opts.sources.split(',').map(s => s.trim()).filter(Boolean) as any

    const trees = await loadTranslations(cfg)
    const [base, ...rest] = Object.keys(trees)
    if (!base)
      return console.log('No locales found')

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
