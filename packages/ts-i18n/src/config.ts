/* eslint-disable ts/no-top-level-await */
import type { I18nConfig } from './types'
import { loadConfig } from 'bunfig'

export const defaultConfig: I18nConfig = {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: undefined,
  include: undefined,
  verbose: false,
  outDir: 'dist/i18n',
  typesOutFile: 'dist/i18n/keys.d.ts',
  sources: ['ts'],
}

let _config: I18nConfig | null = null

export async function getConfig(): Promise<I18nConfig> {
  if (!_config) {
    _config = await loadConfig({
      name: 'i18n',
      defaultConfig,
    })
  }
  return _config
}

export const config: I18nConfig = defaultConfig
