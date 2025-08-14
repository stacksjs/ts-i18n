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

// eslint-disable-next-line antfu/no-top-level-await
export const config: I18nConfig = await loadConfig({
  name: 'i18n',
  defaultConfig,
})
