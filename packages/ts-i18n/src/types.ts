export interface I18nConfig {
  translationsDir: string
  defaultLocale: string
  fallbackLocale?: string | string[]
  include?: string[]
  verbose?: boolean
  outDir?: string
  typesOutFile?: string
  sources?: SourceKind[]
}

export interface TransParams {
  [key: string]: string | number
}

export type TranslationValue = string | number | boolean | null | ((_params?: TransParams) => string)

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

/** Utility to join two path segments with a dot (avoids leading dot) */
export type JoinPath<A extends string, B extends string> = A extends '' ? B : `${A}.${B}`

/** Leaf values considered renderable for translations */
export type RenderableLeaf = string | number | boolean | null | undefined | ((_params?: TransParams) => string)

/**
 * Produces a union of dot-separated keys for all leaf values of T.
 * Functions are considered leaves and included as keys.
 */
type PrevDepth = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
type Dec<D extends number> = PrevDepth[D]

export type DotPaths<T, P extends string = '', D extends number = 8> =
  D extends 0
    ? (P extends '' ? never : P)
    : T extends RenderableLeaf
      ? P
      : T extends Record<string, any>
        ? {
            [K in keyof T & string]:
            T[K] extends RenderableLeaf
              ? JoinPath<P, K>
              : DotPaths<T[K], JoinPath<P, K>, Dec<D>>
          }[keyof T & string]
        : never

/** Resolve the value at a dot-separated path K within T */
export type PathValue<T, K extends string, D extends number = 8> =
  D extends 0
    ? never
    : K extends `${infer H}.${infer R}`
      ? H extends keyof T
        ? PathValue<T[H], R, Dec<D>>
        : never
      : K extends keyof T
        ? T[K]
        : never

/** Extract the params object for a given key K (if the leaf is a function) */
export type ParamsForLeaf<V> = V extends (..._args: infer A) => any ? (A extends [] ? undefined : A[0]) : never
export type ParamsForKey<T, K extends string> = ParamsForLeaf<PathValue<T, K>>

/** A typed translator for a given base tree shape T */
export type TranslatorFor<T> = <K extends DotPaths<T>>(_key: K, _localeOrParams?: string | ParamsForKey<T, K>, _maybeParams?: ParamsForKey<T, K>) => string

export type SourceKind = 'ts' | 'yaml'
