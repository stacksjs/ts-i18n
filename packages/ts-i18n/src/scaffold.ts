import type { TsI18nConfig } from './types'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

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

export async function generateSampleConfig(base: TsI18nConfig, outFile = '.config/ts-i18n.config.ts'): Promise<string> {
  const content = `// ts-i18n configuration sample\n// Update values as needed for your project\n\nexport default ${toTsLiteral(base)}\n`
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, content, 'utf8')
  return outFile
}
