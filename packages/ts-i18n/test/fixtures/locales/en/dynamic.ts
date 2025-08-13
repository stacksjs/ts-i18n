import type { Dictionary, TransParams } from '../../../../src/types'

const dict: Dictionary = {
  dynamic: {
    hello: (params?: TransParams): string => `Hello, ${params?.name}`,
  },
}

export default dict
