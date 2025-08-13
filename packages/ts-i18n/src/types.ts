export interface I18nConfig {
  translationsDir: string
  defaultLocale: string
  fallbackLocale?: string | string[]
  include?: string[]
  verbose?: boolean
  outDir?: string
  typesOutFile?: string
}

export interface TransParams {
  [key: string]: string | number
}

export type TranslationValue = string | number | boolean | null | ((params?: TransParams) => string)

export interface TranslationTree {
  [key: string]: TranslationValue | TranslationTree
}

export type Dictionary = TranslationTree

export interface LocaleData {
  locale: string
  messages: TranslationTree
}

export interface BuildResult {
  locales: string[]
  files: string[]
  outputDir: string
}

// =========================
// Advanced type utilities
// =========================

/** Utility to split a string by a delimiter at the type level */
export type Split<S extends string, D extends string> =
  S extends '' ? [] :
    S extends `${infer T}${D}${infer U}`
      ? [T, ...Split<U, D>]
      : [S]

/** Utility to join two path segments with a dot (avoids leading dot) */
export type JoinPath<A extends string, B extends string> = A extends '' ? B : `${A}.${B}`

/** Leaf values considered renderable for translations */
export type RenderableLeaf = string | number | boolean | null | undefined | ((params?: TransParams) => string)

/**
 * Produces a union of dot-separated keys for all leaf values of T.
 * Functions are considered leaves and included as keys.
 */
export type DotPaths<T, P extends string = ''> =
  T extends RenderableLeaf
    ? P
    : T extends Record<string, any>
      ? {
          [K in keyof T & string]:
          T[K] extends RenderableLeaf
            ? JoinPath<P, K>
            : DotPaths<T[K], JoinPath<P, K>>
        }[keyof T & string]
      : never

/** Resolve the value at a dot-separated path K within T */
export type PathValue<T, K extends string> = _PathValue<T, Split<K, '.'>>
type _PathValue<T, Ks extends readonly string[]> =
  Ks extends []
    ? T
    : Ks extends [infer H, ...infer R]
      ? H extends keyof T
        ? R extends string[]
          ? _PathValue<T[H], R>
          : never
        : never
      : never

/** Extract the params object for a given key K (if the leaf is a function) */
export type ParamsForLeaf<V> = V extends (...args: infer A) => any ? (A extends [] ? undefined : A[0]) : never
export type ParamsForKey<T, K extends string> = ParamsForLeaf<PathValue<T, K>>

/** A typed translator for a given base tree shape T */
export type TranslatorFor<T> = <K extends DotPaths<T>>(key: K, localeOrParams?: string | ParamsForKey<T, K>, maybeParams?: ParamsForKey<T, K>) => string
