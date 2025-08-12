export default {
  dynamic: {
    hello: ({ name }: { name: string }) => `Hello, ${name}`,
  },
}
