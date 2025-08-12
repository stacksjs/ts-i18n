import { describe, it, expect, beforeAll } from 'bun:test'
import { loadTranslations } from '../src/loader'
import { createTranslator } from '../src/translator'
import { generateTypes } from '../src/typegen'
import type { TsI18nConfig } from '../src/types'
import { readFile } from 'fs/promises'

const fixtures = new URL('./fixtures/', import.meta.url).pathname
const outputs = new URL('./outputs/', import.meta.url).pathname

const baseConfig: TsI18nConfig = {
  translationsDir: fixtures + 'locales',
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  include: ['**/*.yml', '**/*.yaml', '**/*.ts'],
  verbose: false,
  outDir: outputs,
  typesOutFile: outputs + '/keys.d.ts',
}

describe('ts-i18n loader', () => {
  let trees: Record<string, any>

  beforeAll(async () => {
    trees = await loadTranslations(baseConfig)
  })

  it('loads YAML locales with nested structure', () => {
    expect(Object.keys(trees)).toContain('en')
    expect(Object.keys(trees)).toContain('pt')
    expect(trees.en.home.title).toBe('Home')
    expect(trees.en.user.profile.name).toBe('Name')
  })

  it('loads TS locale files with dynamic values', () => {
    expect(typeof trees.en.dynamic.hello).toBe('function')
    const trans = createTranslator(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })
    const result = trans('dynamic.hello', { name: 'Ada' })
    expect(result).toBe('Hello, Ada')
  })
})

describe('ts-i18n translator', () => {
  it('resolves keys and falls back to fallbackLocale', async () => {
    const trees = await loadTranslations(baseConfig)
    const trans = createTranslator(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })

    // Exists in en
    expect(trans('home.title', 'en')).toBe('Home')

    // Missing in en, present in pt → fallback
    expect(trans('onlyInPt', 'en')).toBe('Apenas em PT')

    // Missing in both → returns key
    expect(trans('missing.key', 'en')).toBe('missing.key')
  })
})

describe('ts-i18n type generation', () => {
  it('generates a union of keys', async () => {
    const trees = await loadTranslations(baseConfig)
    await generateTypes(trees, baseConfig.typesOutFile!)
    const content = await readFile(baseConfig.typesOutFile!, 'utf8')
    expect(content).toContain('export type TranslationKey')
    expect(content).toContain('"home.title"')
  })
})
