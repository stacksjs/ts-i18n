import type { I18nConfig, TranslationTree, TranslatorFor, TransParams } from './types'

function flatten(tree: TranslationTree, prefix = ''): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(tree)) {
    const full = prefix ? `${prefix}.${k}` : k
    if (v == null)
      continue
    if (typeof v === 'function' || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[full] = v
    }
    else if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as TranslationTree, full))
    }
  }
  return out
}

function uniquePush(arr: string[], v: string) {
  if (!arr.includes(v))
    arr.push(v)
}

export function createTranslator<TBase = TranslationTree>(
  locales: Record<string, TranslationTree>,
  cfg: Pick<I18nConfig, 'defaultLocale' | 'fallbackLocale'>,
): TranslatorFor<TBase> {
  const defaultLocale = cfg.defaultLocale
  const fallbackLocale = cfg.fallbackLocale

  const flatByLocale: Record<string, Record<string, any>> = {}
  for (const [loc, tree] of Object.entries(locales)) {
    flatByLocale[loc] = flatten(tree)
  }

  function resolve(key: string, locale?: string, params?: TransParams): string | undefined {
    const tryLocales: string[] = []
    if (locale)
      uniquePush(tryLocales, locale)
    uniquePush(tryLocales, defaultLocale)
    if (fallbackLocale) {
      if (Array.isArray(fallbackLocale)) {
        for (const fl of fallbackLocale) uniquePush(tryLocales, fl)
      }
      else {
        uniquePush(tryLocales, fallbackLocale)
      }
    }

    for (const loc of tryLocales) {
      const map = flatByLocale[loc]
      if (!map)
        continue
      const val = map[key]
      if (val == null)
        continue
      if (typeof val === 'function') {
        const fn = val as (params?: TransParams) => string
        return fn(params)
      }
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean')
        return String(val)
      // Non-renderable (object/null) are skipped by flatten
    }

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
