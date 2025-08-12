import type { TranslationTree } from './types'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

function stripFunctions(tree: TranslationTree): any {
  if (tree == null || typeof tree !== 'object')
    return tree
  const out: any = Array.isArray(tree) ? [] : {}
  for (const [k, v] of Object.entries(tree)) {
    if (typeof v === 'function')
      continue
    if (v && typeof v === 'object')
      out[k] = stripFunctions(v as TranslationTree)
    else out[k] = v
  }
  return out
}

export async function writeOutputs(treesByLocale: Record<string, TranslationTree>, outDir: string): Promise<string[]> {
  await mkdir(outDir, { recursive: true })
  const written: string[] = []
  for (const [locale, tree] of Object.entries(treesByLocale)) {
    const jsonPath = join(outDir, `${locale}.json`)
    const cleaned = stripFunctions(tree)
    const payload = JSON.stringify(cleaned, null, 2)
    await mkdir(dirname(jsonPath), { recursive: true })
    await writeFile(jsonPath, payload, 'utf8')
    written.push(jsonPath)
  }
  return written
}
