import type { TranslationTree, TsI18nConfig } from './types'
import { readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import fg from 'fast-glob'
import YAML from 'yaml'

async function importTsModule(filePath: string): Promise<Record<string, unknown>> {
  const spec = filePath.startsWith('file://') ? filePath : pathToFileURL(filePath).href
  const mod = await import(spec)
  const candidate = (mod && (mod.default ?? mod.translations ?? mod)) as Record<string, unknown>
  return candidate
}

function deepMerge(target: TranslationTree, source: TranslationTree): TranslationTree {
  const output: TranslationTree = { ...target }
  for (const key of Object.keys(source)) {
    const value = (source as any)[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
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

export async function loadTranslations(config: TsI18nConfig): Promise<Record<string, TranslationTree>> {
  const baseDir = config.translationsDir
  const include = config.include ?? ['**/*.yml', '**/*.yaml', '**/*.ts', '**/*.js']
  const patterns = include.map(p => join(baseDir, p))
  const files = await fg(patterns, { dot: false })

  const localeMap: Record<string, TranslationTree> = {}

  for (const file of files) {
    const ext = extname(file).toLowerCase()
    const isYaml = ext === '.yml' || ext === '.yaml'
    const isTs = ext === '.ts' || ext === '.js'

    let data: Record<string, unknown> | undefined

    if (isYaml) {
      const content = await readFile(file, 'utf8')
      data = YAML.parse(content) as any
    }
    else if (isTs) {
      const mod = await importTsModule(file)
      data = (mod as any).default ?? mod
    }

    if (!data || typeof data !== 'object')
      continue

    const relative = file.replace(`${baseDir}/`, '')
    const segments = relative.split('/')
    let locale = segments[0]
    const rest = segments.slice(1)

    if (rest.length === 0) {
      // Top-level file like en.yml → locale = 'en'
      locale = basename(locale, ext)
    }

    if (!locale)
      continue

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
