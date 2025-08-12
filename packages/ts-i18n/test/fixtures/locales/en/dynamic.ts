import type { Dictionary } from '../../../src/types'

export default {
  dynamic: {
    hello: ({ name }: { name: string }) => `Hello, ${name}`,
  },
} satisfies Dictionary
