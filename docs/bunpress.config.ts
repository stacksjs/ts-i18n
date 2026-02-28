import type { BunpressConfig } from 'bunpress'

const config: BunpressConfig = {
  name: 'ts-i18n',
  description: 'Fast, Bun-native TypeScript i18n loader with YAML/TS support and type generation',
  url: 'https://ts-i18n.stacksjs.org',
  theme: 'docs',

  nav: [
    { text: 'Guide', link: '/guide' },
    { text: 'Translation Files', link: '/translation-files' },
    { text: 'Type Generation', link: '/type-generation' },
    { text: 'Formatting', link: '/formatting' },
    { text: 'CLI', link: '/cli' },
    { text: 'GitHub', link: 'https://github.com/stacksjs/ts-i18n' },
  ],

  sidebar: {
    '/guide/': [
      { text: 'Introduction', link: '/guide' },
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'Translation Files', link: '/guide/translations' },
      { text: 'Type Generation', link: '/guide/types' },
      { text: 'Pluralization', link: '/guide/pluralization' },
    ],
    '/translation-files/': [
      { text: 'Overview', link: '/translation-files' },
      { text: 'YAML Files', link: '/translation-files/yaml' },
      { text: 'TypeScript Files', link: '/translation-files/typescript' },
      { text: 'Dynamic Values', link: '/translation-files/dynamic-values' },
    ],
    '/type-generation/': [
      { text: 'Overview', link: '/type-generation' },
      { text: 'Key Types', link: '/type-generation/key-types' },
      { text: 'Parameter Inference', link: '/type-generation/parameter-inference' },
    ],
    '/formatting/': [
      { text: 'Overview', link: '/formatting' },
      { text: 'Pluralization', link: '/formatting/pluralization' },
      { text: 'Date Formatting', link: '/formatting/dates' },
      { text: 'Number Formatting', link: '/formatting/numbers' },
    ],
    '/cli/': [
      { text: 'Overview', link: '/cli' },
      { text: 'Commands', link: '/cli/commands' },
    ],
    '/features/': [
      { text: 'Overview', link: '/features' },
      { text: 'Lazy Loading', link: '/features/lazy-loading' },
      { text: 'Namespace Support', link: '/features/namespaces' },
      { text: 'ICU MessageFormat', link: '/features/icu' },
      { text: 'Vue Integration', link: '/features/vue' },
    ],
    '/advanced/': [
      { text: 'Overview', link: '/advanced' },
      { text: 'Custom Loaders', link: '/advanced/loaders' },
      { text: 'Caching Strategies', link: '/advanced/caching' },
      { text: 'SSR Support', link: '/advanced/ssr' },
      { text: 'Testing i18n', link: '/advanced/testing' },
    ],
  },

  search: true,
  editLink: {
    pattern: 'https://github.com/stacksjs/ts-i18n/edit/main/docs/:path',
    text: 'Edit this page on GitHub',
  },

  socialLinks: [
    { icon: 'github', link: 'https://github.com/stacksjs/ts-i18n' },
    { icon: 'discord', link: 'https://discord.gg/stacksjs' },
  ],
}

export default config
