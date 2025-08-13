import type { TranslationTree, I18nConfig } from './types'
import { readFile } from 'node:fs/promises'
import { basename, extname, join, relative as pathRelative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as tiny from 'tinyglobby'
import YAML from 'yaml'

async function globby(patterns: string[], opts: { dot?: boolean }) {
  const fn: any = (tiny as any).glob
  return fn(patterns, opts) as Promise<string[]>
}

async function importTsModule(filePath: string): Promise<Record<string, unknown>> {
  const spec = filePath.startsWith('file://') ? filePath : pathToFileURL(filePath).href
  const mod = await import(spec)
  const candidate = (mod && (mod.default ?? (mod as any).translations ?? mod)) as Record<string, unknown>
  return candidate
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge(target: TranslationTree, source: TranslationTree): TranslationTree {
  const output: TranslationTree = { ...target }
  for (const key of Object.keys(source)) {
    const value = (source as any)[key]
    if (isPlainObject(value)) {
      const existing = (output[key] && typeof output[key] === 'object') ? (output[key] as TranslationTree) : {}
      output[key] = deepMerge(existing, value as TranslationTree)
    }
    else {
      ;(output as any)[key] = value as any
    }
  }
  return output
}

function setAtPath(obj: TranslationTree, path: string[], value: TranslationTree): void {
  let cursor: TranslationTree = obj
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i]
    if (!cursor[segment] || typeof cursor[segment] !== 'object')
      cursor[segment] = {}
    cursor = cursor[segment] as TranslationTree
  }
  cursor[path[path.length - 1]] = value
}

export async function loadTranslations(config: I18nConfig): Promise<Record<string, TranslationTree>> {
  const baseDir = resolve(config.translationsDir)
  if (!baseDir || typeof baseDir !== 'string')
    throw new Error('ts-i18n: translationsDir must be a non-empty string')

  const include = config.include ?? ['**/*.yml', '**/*.yaml', '**/*.ts', '**/*.js']
  const patterns = include.map(p => join(baseDir, p))
  const matched = await globby(patterns, { dot: false })
  const files = matched.map(f => resolve(f))

  if (!files.length)
    throw new Error(`ts-i18n: No translation files found under ${baseDir}`)

  const localeMap: Record<string, TranslationTree> = {}

  for (const file of files) {
    const ext = extname(file).toLowerCase()
    const isYaml = ext === '.yml' || ext === '.yaml'
    const isTs = ext === '.ts' || ext === '.js'

    let data: unknown

    if (isYaml) {
      try {
        const content = await readFile(file, 'utf8')
        const parsed = YAML.parse(content)
        data = parsed == null ? {} : parsed
      }
      catch (e: any) {
        throw new Error(`ts-i18n: Failed to parse YAML file ${file}: ${e?.message ?? e}`)
      }
    }
    else if (isTs) {
      try {
        const mod = await importTsModule(file)
        data = (mod as any).default ?? mod
      }
      catch (e: any) {
        throw new Error(`ts-i18n: Failed to import TS translation module ${file}: ${e?.message ?? e}`)
      }
    }

    if (!isPlainObject(data)) {
      throw new Error(`ts-i18n: Translation file must export an object. File: ${file}`)
    }

    const relative = pathRelative(baseDir, file)
    const segments = relative.split(sep)
    let locale = segments[0]
    const rest = segments.slice(1)

    if (rest.length === 0) {
      // Top-level file like en.yml → locale = 'en'
      locale = basename(locale, ext)
    }

    if (!locale)
      throw new Error(`ts-i18n: Could not infer locale from file path: ${file}`)

    const namespacePath = rest.length ? rest.join('/') : ''
    const tree = data as TranslationTree

    if (!localeMap[locale])
      localeMap[locale] = {}

    if (!namespacePath) {
      localeMap[locale] = deepMerge(localeMap[locale], tree)
    }
    else {
      const parts = namespacePath
        .replace(ext, '')
        .split('/')
        .filter(Boolean)
      const last = parts[parts.length - 1]
      let valueToSet: TranslationTree = tree
      if (
        tree && typeof tree === 'object' && !Array.isArray(tree)
        && Object.keys(tree).length === 1 && Object.prototype.hasOwnProperty.call(tree, last)
      ) {
        valueToSet = (tree as any)[last] as TranslationTree
      }
      const container: TranslationTree = {}
      setAtPath(container, parts, valueToSet)
      localeMap[locale] = deepMerge(localeMap[locale], container)
    }
  }

  return localeMap
}
