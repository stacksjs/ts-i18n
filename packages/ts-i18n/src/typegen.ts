import type { TranslationTree } from './types'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

function collectKeys(tree: TranslationTree, prefix = ''): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(tree)) {
    const full = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v))
      keys.push(...collectKeys(v as TranslationTree, full))
    else keys.push(full)
  }
  return keys
}

export async function generateTypes(treesByLocale: Record<string, TranslationTree>, outFile: string): Promise<void> {
  const locales = Object.keys(treesByLocale)
  if (locales.length === 0) {
    await mkdir(dirname(outFile), { recursive: true })
    await writeFile(outFile, 'export type TranslationKey = string\n')
    return
  }

  const baseLocale = locales[0]
  const baseTree = treesByLocale[baseLocale]
  const keys = collectKeys(baseTree).sort()
  const union = keys.map(k => JSON.stringify(k)).join(' | ')
  const dts = `export type TranslationKey = ${union}\n`
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, dts)
}
