import { loadConfig } from 'bunfig'
import type { TsI18nConfig } from './types'

export const defaultConfig: TsI18nConfig = {
  translationsDir: 'locales',
  defaultLocale: 'en',
  fallbackLocale: undefined,
  include: ['**/*.yml', '**/*.yaml', '**/*.ts', '**/*.js'],
  verbose: false,
  outDir: 'dist/i18n',
  typesOutFile: 'dist/i18n/keys.d.ts',
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: TsI18nConfig = await loadConfig({
  name: 'ts-i18n',
  defaultConfig,
})
