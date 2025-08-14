// Basic configuration example
import { i18nBunPlugin } from 'bun-plugin-i18n'

export default {
  plugins: [
    i18nBunPlugin({
      // Basic settings
      translationsDir: 'locales',
      outDir: 'dist/i18n',
      generateTypes: true,
      verbose: true,

      // Simple configuration
      config: {
        defaultLocale: 'en',
        fallbackLocale: 'en',
        sources: ['ts', 'yaml']
      }
    })
  ]
}
