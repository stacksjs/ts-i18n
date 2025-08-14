import type { TranslationTree } from 'ts-i18n'
import type { YamlTypeDefinition } from './types'
import { join, dirname, relative } from 'node:path'
import { existsSync } from 'node:fs'
import process from 'node:process'

/**
 * Helper functions for TypeScript plugin
 */

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function countKeys(tree: any, depth = 0): number {
  if (depth > 10) return 0

  let count = 0
  for (const value of Object.values(tree)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      count += countKeys(value, depth + 1)
    } else {
      count++
    }
  }
  return count
}

export function findYamlFile(locale: string, translationsDir: string): string | null {
  const possiblePaths = [
    join(translationsDir, `${locale}.yml`),
    join(translationsDir, `${locale}.yaml`),
    join(translationsDir, locale, 'index.yml'),
    join(translationsDir, locale, 'index.yaml'),
  ]

  return possiblePaths.find(path => existsSync(path)) || null
}

export function findSourceFile(locale: string, translationsDir: string): string | null {
  const possiblePaths = [
    join(translationsDir, `${locale}.ts`),
    join(translationsDir, `${locale}.js`),
    join(translationsDir, locale, 'index.ts'),
    join(translationsDir, locale, 'index.js'),
  ]

  const yamlFile = findYamlFile(locale, translationsDir)
  if (yamlFile) {
    possiblePaths.push(yamlFile)
  }

  return possiblePaths.find(path => path && existsSync(path)) || null
}

export function inferFunctionParameterType(fn: Function): string {
  // Try to extract parameter types from function string
  const fnString = fn.toString()
  const paramMatch = fnString.match(/\(\s*\{\s*([^}]+)\s*\}/)

  if (paramMatch) {
    const params = paramMatch[1]
      .split(',')
      .map(p => p.trim())
      .map(p => {
        const [name, type] = p.split(':').map(s => s.trim())
        return `${name}: ${type || 'any'}`
      })

    return `{ ${params.join('; ')} }`
  }

  return 'any'
}

export function inferPrimitiveType(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) return 'any[]'
  return 'any'
}

export function generateFunctionExample(fn: Function): string {
  const fnString = fn.toString()
  if (fnString.includes('=>')) {
    return fnString.split('=>')[0].trim() + ' => string'
  }
  return 'function(...args) => string'
}

export function generateInterfaceContent(definitions: YamlTypeDefinition[], interfaceName?: string, depth = 0): string {
  const indent = '  '.repeat(depth)
  const typeName = interfaceName || 'TranslationTree'

  let content = `${indent}export interface ${typeName} {\n`

  for (const def of definitions) {
    const parts = def.key.split('.')
    const propertyName = parts[parts.length - 1]

    if (def.nested && def.nested.length > 0) {
      const nestedInterfaceName = `${capitalizeFirst(propertyName)}Section`
      const nestedContent = generateInterfaceContent(def.nested, nestedInterfaceName, depth + 1)
      content += nestedContent + '\n'
      content += `${indent}  ${propertyName}: ${nestedInterfaceName}\n`
    } else {
      const comment = generatePropertyComment(def, depth + 1)
      content += comment
      content += `${indent}  ${propertyName}: ${def.type}\n`
    }
  }

  content += `${indent}}\n`

  return content
}

export function generatePropertyComment(def: YamlTypeDefinition, depth: number): string {
  const indent = '  '.repeat(depth)

  if (typeof def.value === 'string') {
    return `${indent}/** "${def.value}" */\n`
  } else if (typeof def.value === 'function') {
    const example = generateFunctionExample(def.value)
    return `${indent}/** Function: ${example} */\n`
  } else if (typeof def.value === 'number' || typeof def.value === 'boolean') {
    return `${indent}/** Value: ${def.value} */\n`
  }

  return ''
}

export function generateUnifiedTypesContent(locales: string[], baseLocale: string): string {
  return `
// Auto-generated unified types for ts-i18n
import type { DotPaths, ParamsForKey, TranslatorFor } from 'ts-i18n'

// Base translation tree type (from ${baseLocale} locale)
export type BaseTranslations = typeof import('./${baseLocale}').default

// Core types
export type TranslationKey = DotPaths<BaseTranslations>
export type TranslationParams<K extends TranslationKey> = ParamsForKey<BaseTranslations, K>
export type TypedTranslator = TranslatorFor<BaseTranslations>

// Locale-specific types
${locales.map(locale => `export type { ${capitalizeFirst(locale)}Translations } from './${locale}'`).join('\n')}

// Union of all available locales
export type AvailableLocale = ${locales.map(l => `'${l}'`).join(' | ')}

// Translation tree by locale
export type TranslationsByLocale = {
${locales.map(locale => `  '${locale}': ${capitalizeFirst(locale)}Translations`).join('\n')}
}

// Helper type for locale-aware translation functions
export type LocalizedTranslator<L extends AvailableLocale> = TranslatorFor<TranslationsByLocale[L]>
`.trim() + '\n'
}

export function generateGlobalNamespaceContent(locales: string[], baseLocale: string, namespaceName: string): string {
  return `
// Auto-generated global namespace declarations for ts-i18n
declare global {
  namespace ${namespaceName} {
    // Translation key type
    type Key = import('./index').TranslationKey

    // Typed translator
    type Translator = import('./index').TypedTranslator

    // Available locales
    type Locale = import('./index').AvailableLocale

    // Translation function type
    type TranslateFn<L extends Locale = '${baseLocale}'> = import('./index').LocalizedTranslator<L>

    // Locale-specific translation types
    namespace Locales {
${locales.map(locale => `      type ${capitalizeFirst(locale)} = import('./index').${capitalizeFirst(locale)}Translations`).join('\n')}
    }
  }
}

export {}
`.trim() + '\n'
}

export function generateWrapperModuleContent(locale: string, yamlFile: string): string {
  return `
// Auto-generated wrapper module for ${locale} YAML translations
import type { ${capitalizeFirst(locale)}Translations } from './${locale}'
import { loadTranslations } from 'ts-i18n'

// Load the actual YAML content at runtime
const translations = await loadTranslations({
  translationsDir: '${relative(process.cwd(), dirname(yamlFile))}',
  defaultLocale: '${locale}',
  sources: ['yaml']
})

const localeTranslations = translations['${locale}'] as ${capitalizeFirst(locale)}Translations

export default localeTranslations
export type { ${capitalizeFirst(locale)}Translations }
`.trim() + '\n'
}

export function generateTypeScriptDeclarationContent(definitions: YamlTypeDefinition[], locale: string): string {
  const interfaceName = `${capitalizeFirst(locale)}Translations`
  const interfaceContent = generateInterfaceContent(definitions)

  return `
// Auto-generated TypeScript definitions for ${locale} translations
// This file provides smart types for YAML-based translations

${interfaceContent}

declare const translations: ${interfaceName}
export = translations
export as namespace ${capitalizeFirst(locale)}Translations
`.trim() + '\n'
}

export function analyzeYamlStructure(tree: TranslationTree, locale: string, prefix = ''): YamlTypeDefinition[] {
  const definitions: YamlTypeDefinition[] = []

  for (const [key, value] of Object.entries(tree)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Nested object
      const nested = analyzeYamlStructure(value as TranslationTree, locale, fullKey)
      definitions.push({
        key: fullKey,
        type: 'object',
        value,
        nested,
      })
    } else if (typeof value === 'function') {
      // Function - try to infer parameter types
      const paramType = inferFunctionParameterType(value)
      definitions.push({
        key: fullKey,
        type: `(params: ${paramType}) => string`,
        value,
      })
    } else {
      // Primitive value
      const type = inferPrimitiveType(value)
      definitions.push({
        key: fullKey,
        type,
        value,
      })
    }
  }

  return definitions
}
