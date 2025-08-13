import type { Dictionary, TransParams } from '../../../../src/types'

const dict: Dictionary = {
  home: {
    title: 'Home',
  },
  user: {
    profile: { name: 'Name' },
  },
  dynamic: {
    hello: (params?: TransParams): string => `Hello, ${params?.name}`,
  },
}

export default dict
