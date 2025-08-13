import type { I18nConfig } from './types'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative } from 'node:path'
import process from 'node:process'

function toTsLiteral(value: unknown): string {
  if (typeof value === 'string')
    return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (value == null)
    return 'undefined'
  if (Array.isArray(value))
    return `[${value.map(v => toTsLiteral(v)).join(', ')}]`
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${JSON.stringify(k)}: ${toTsLiteral(v)}`)
      .join(', ')
    return `{ ${entries} }`
  }
  return 'undefined'
}

function toRelativePath(p?: string): string | undefined {
  if (!p)
    return p
  return isAbsolute(p) ? relative(process.cwd(), p) : p
}

export async function generateSampleConfig(base: I18nConfig, outFile = '.config/ts-i18n.config.ts'): Promise<string> {
  const normalized: I18nConfig = {
    ...base,
    translationsDir: toRelativePath(base.translationsDir)!,
    outDir: toRelativePath(base.outDir),
    typesOutFile: toRelativePath(base.typesOutFile),
  }
  const content = `// ts-i18n configuration sample\n// Update values as needed for your project\n\nexport default ${toTsLiteral(normalized)}\n`
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, content, 'utf8')
  return outFile
}
