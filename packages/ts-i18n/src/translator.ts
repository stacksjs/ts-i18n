import type { TranslationTree, TransParams, I18nConfig, TranslatorFor } from './types'

function getPath(tree: TranslationTree, path: string): unknown {
  const parts = path.split('.').filter(Boolean)
  let current: any = tree
  for (const part of parts) {
    if (current == null || typeof current !== 'object')
      return undefined
    current = current[part]
  }
  return current
}

export function createTranslator<TBase = TranslationTree>(
  locales: Record<string, TranslationTree>,
  cfg: Pick<I18nConfig, 'defaultLocale' | 'fallbackLocale'>,
): TranslatorFor<TBase> {
  const defaultLocale = cfg.defaultLocale
  const fallbackLocale = cfg.fallbackLocale

  function resolve(key: string, locale?: string, params?: TransParams): string | undefined {
    const tryLocales: string[] = []
    if (locale)
      tryLocales.push(locale)
    else tryLocales.push(defaultLocale)

    if (fallbackLocale) {
      if (Array.isArray(fallbackLocale))
        tryLocales.push(...fallbackLocale)
      else tryLocales.push(fallbackLocale)
    }

    for (const loc of tryLocales) {
      const tree = locales[loc]
      if (!tree)
        continue
      const val = getPath(tree, key)
      if (val == null)
        continue
      if (typeof val === 'function') {
        // Dynamic value support
        const fn = val as (params?: TransParams) => string
        return fn(params)
      }
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean')
        return String(val)
      // Nested object → not renderable
      return undefined
    }

    // If not found, return key as a visible fallback
    return key
  }

  return function trans(key: string, localeOrParams?: string | TransParams, maybeParams?: TransParams): string {
    let locale: string | undefined
    let params: TransParams | undefined
    if (typeof localeOrParams === 'string') {
      locale = localeOrParams
      params = maybeParams
    }
    else {
      params = localeOrParams
    }
    const result = resolve(key, locale, params)
    return result ?? key
  } as unknown as TranslatorFor<TBase>
}
