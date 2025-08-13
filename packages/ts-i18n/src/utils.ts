import type { TranslationTree } from './types'

export function collectKeys(tree: TranslationTree, prefix = ''): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(tree)) {
    const full = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v))
      keys.push(...collectKeys(v as TranslationTree, full))
    else keys.push(full)
  }
  return keys
}
