const lintableExtensions = new Set([
  '.js',
  '.ts',
  '.json',
  '.yaml',
  '.yml',
  '.md',
])

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

async function main(): Promise<void> {
  const stagedFiles = await commandOutput([
    'git',
    'diff',
    '--cached',
    '--name-only',
    '--diff-filter=ACMR',
  ])

  const lintableFiles = stagedFiles
    .split('\n')
    .map(file => file.trim())
    .filter(Boolean)
    .filter(file => lintableExtensions.has(extensionFor(file)))

  if (lintableFiles.length > 0) {
    await run(['bunx', '--bun', 'pickier', ...lintableFiles, '--fix'])
    await run(['git', 'add', ...lintableFiles])
  }

  await run(['bun', '--bun', 'tsc', '--noEmit'])
}

async function commandOutput(command: string[]): Promise<string> {
  const child = Bun.spawn(command, {
    stderr: 'inherit',
    stdout: 'pipe',
  })

  const output = await new Response(child.stdout).text()
  const exitCode = await child.exited
  if (exitCode !== 0)
    process.exit(exitCode)

  return output
}

async function run(command: string[]): Promise<void> {
  const child = Bun.spawn(command, {
    stderr: 'inherit',
    stdin: 'inherit',
    stdout: 'inherit',
  })

  const exitCode = await child.exited
  if (exitCode !== 0)
    process.exit(exitCode)
}

function extensionFor(file: string): string {
  const index = file.lastIndexOf('.')
  return index === -1 ? '' : file.slice(index)
}
