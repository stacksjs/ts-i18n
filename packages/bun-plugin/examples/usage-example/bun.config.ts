import { i18nBunPlugin } from 'bun-plugin-i18n'

export default {
  plugins: [
    i18nBunPlugin({
      translationsDir: 'locales',
      outDir: 'dist/i18n',
      generateTypes: true,
      typesPath: 'src/types/i18n.d.ts',
      verbose: true,

      config: {
        defaultLocale: 'en',
        fallbackLocale: 'en',
        sources: ['ts', 'yaml']
      },

      onBuild: (results) => {
        console.log(`✅ Built ${results.length} locales`)
      }
    })
  ]
}
