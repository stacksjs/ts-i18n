import type { Dictionary } from '../../../../src/types'

export default {
  home: {
    title: 'Home',
  },
  user: {
    profile: { name: 'Name' },
  },
  dynamic: {
    hello: ({ name }: { name: string }) => `Hello, ${name}`,
  },
} satisfies Dictionary
