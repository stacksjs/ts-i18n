import type { I18nConfig } from '../src/types'
import { beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { loadTranslations } from '../src/loader'
import { writeOutputs } from '../src/output'
import { generateSampleConfig } from '../src/scaffold'
import { createTranslator } from '../src/translator'
import { generateTypes, generateTypesFromModule } from '../src/typegen'

const fixtures = new URL('./fixtures/', import.meta.url).pathname
const outputs = new URL('./outputs/', import.meta.url).pathname

const baseConfig: I18nConfig = {
  translationsDir: `${fixtures}locales`,
  defaultLocale: 'en',
  fallbackLocale: 'pt',
  sources: ['yaml', 'ts'],
  verbose: false,
  outDir: outputs,
  typesOutFile: `${outputs}/keys.d.ts`,
}

describe('ts-i18n loader', () => {
  let trees: Record<string, any>

  beforeAll(async () => {
    trees = await loadTranslations(baseConfig)
  })

  it('loads YAML locales with nested structure', () => {
    expect(Object.keys(trees)).toContain('en')
    expect(Object.keys(trees)).toContain('pt')
    // Validate via translator to avoid type-narrowing issues on nested unions
    const trans = createTranslator<any>(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })
    expect(trans('home.title')).toBe('Home')
    expect(trans('user.profile.name')).toBe('Name')
  })

  it('loads TS locale files with dynamic values', () => {
    const trans = createTranslator<any>(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })
    const result = trans('dynamic.hello', { name: 'Ada' })
    expect(result).toBe('Hello, Ada')
  })
})

describe('ts-i18n translator', () => {
  it('resolves keys with fallback and functions via flattened maps', async () => {
    const trees = await loadTranslations(baseConfig)
    const trans = createTranslator<any>(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })
    expect(trans('home.title')).toBe('Home')
    expect(trans('dynamic.hello', { name: 'Ada' })).toBe('Hello, Ada')
    expect(trans('missing.key')).toBe('missing.key')
  })
})

describe('sources toggles', () => {
  it('supports ts-only sources', async () => {
    const trees = await loadTranslations({ ...baseConfig, sources: ['ts'] })
    expect(Object.keys(trees)).toContain('en')
    const trans = createTranslator<any>(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })
    expect(trans('dynamic.hello', { name: 'Ada' })).toBe('Hello, Ada')
    // YAML keys should not be present
    expect(trans('user.profile.name')).toBe('user.profile.name')
  })

  it('supports yaml-only sources', async () => {
    const trees = await loadTranslations({ ...baseConfig, sources: ['yaml'] })
    expect(Object.keys(trees)).toContain('en')
    const trans = createTranslator<any>(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })
    expect(trans('home.title')).toBe('Home')
    // dynamic TS should not be present
    expect(trans('dynamic.hello', { name: 'Ada' })).toBe('dynamic.hello')
  })
})

describe('ts-i18n outputs and type generation', () => {
  it('writes per-locale JSON outputs and generates key types', async () => {
    await rm(outputs, { recursive: true, force: true })
    await mkdir(outputs, { recursive: true })

    const trees = await loadTranslations(baseConfig)
    const files = await writeOutputs(trees, outputs)
    expect(files.find(f => f.endsWith('/en.json'))).toBeTruthy()
    expect(files.find(f => f.endsWith('/pt.json'))).toBeTruthy()

    const enJson = JSON.parse(await readFile(`${outputs}/en.json`, 'utf8'))
    const ptJson = JSON.parse(await readFile(`${outputs}/pt.json`, 'utf8'))

    expect(enJson.home.title).toBe('Home')
    expect(ptJson.home.title).toBe('Início')
    // dynamic function should be stripped in JSON
    expect(typeof enJson.dynamic?.hello).not.toBe('function')

    await generateTypes(trees, baseConfig.typesOutFile!)
    const content = await readFile(baseConfig.typesOutFile!, 'utf8')
    expect(content).toContain('export type TranslationKey')
  })

  it('generates types from TS module (no tree needed)', async () => {
    await rm(outputs, { recursive: true, force: true })
    await mkdir(outputs, { recursive: true })
    const outFile = `${outputs}/keys.d.ts`
    await generateTypesFromModule(`${fixtures}locales/en/index.ts`, outFile)
    const content = await readFile(outFile, 'utf8')
    expect(content).toContain('export type TranslationKey = DotPaths<Base>')
    expect(content).toContain('export type TypedTranslator = TranslatorFor<Base>')
  })
})

describe('ts-i18n edge cases and errors', () => {
  it('throws when translationsDir is invalid', async () => {
    await expect(() => loadTranslations({ ...baseConfig, translationsDir: '' as any })).toThrow()
  })

  it('throws when no files are found', async () => {
    const emptyDir = join(outputs, 'empty')
    await rm(emptyDir, { recursive: true, force: true })
    await mkdir(emptyDir, { recursive: true })
    await expect(loadTranslations({ ...baseConfig, translationsDir: emptyDir })).rejects.toThrow('No translation files')
  })

  it('throws on invalid YAML content', async () => {
    const badDir = join(outputs, 'bad-yaml')
    await rm(badDir, { recursive: true, force: true })
    await mkdir(badDir, { recursive: true })
    const file = join(badDir, 'en.yml')
    await writeFile(file, 'home:\n  title: "Missing quote\n', 'utf8')
    await expect(loadTranslations({ ...baseConfig, translationsDir: badDir })).rejects.toThrow('Failed to parse YAML')
  })

  it('throws when TS module does not export object', async () => {
    const badDir = join(outputs, 'bad-ts')
    await rm(badDir, { recursive: true, force: true })
    await mkdir(join(badDir, 'en'), { recursive: true })
    const file = join(badDir, 'en', 'bad.ts')
    await writeFile(file, 'export default 42 as any', 'utf8')
    await expect(loadTranslations({ ...baseConfig, translationsDir: badDir })).rejects.toThrow('must export an object')
  })

  it('handles empty YAML as empty object', async () => {
    const emptyYamlDir = join(outputs, 'empty-yaml')
    await rm(emptyYamlDir, { recursive: true, force: true })
    await mkdir(emptyYamlDir, { recursive: true })
    await writeFile(join(emptyYamlDir, 'en.yml'), '', 'utf8')
    const trees = await loadTranslations({ ...baseConfig, translationsDir: emptyYamlDir, sources: ['yaml'] })
    expect(trees.en).toEqual({})
  })

  it('merges nested namespaces from files under locale subdirectories', async () => {
    const nestedDir = join(outputs, 'nested')
    await rm(nestedDir, { recursive: true, force: true })
    await mkdir(join(nestedDir, 'en'), { recursive: true })
    await writeFile(join(nestedDir, 'en', 'home.yml'), 'home:\n  title: Home Sub\n', 'utf8')
    await writeFile(join(nestedDir, 'en.yml'), 'user:\n  age: 30\n', 'utf8')
    const trees = await loadTranslations({ ...baseConfig, translationsDir: nestedDir, sources: ['yaml'] })
    const trans = createTranslator(trees, { defaultLocale: 'en', fallbackLocale: 'pt' })
    expect(trans('home.title')).toBe('Home Sub')
    expect(trans('user.age')).toBe('30')
  })
})

describe('ts-i18n scaffold', () => {
  it('creates a sample config file', async () => {
    const out = join(outputs, 'ts-i18n.config.ts')
    await rm(out, { force: true })
    const file = await generateSampleConfig(baseConfig, out)
    const content = await readFile(file, 'utf8')
    expect(content).toContain('export default')
    expect(content).toContain('translationsDir')
  })
})
