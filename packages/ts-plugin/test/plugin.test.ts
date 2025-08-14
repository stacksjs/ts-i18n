import { test, expect, describe, beforeEach, afterEach } from 'bun:test'
import { TypeScriptI18nPlugin, createTypeScriptI18nPlugin } from '../src/index'
import { rmdir, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

describe('TypeScriptI18nPlugin', () => {
  const testDir = 'test-output'

  beforeEach(async () => {
    if (existsSync(testDir)) {
      await rmdir(testDir, { recursive: true })
    }
  })

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rmdir(testDir, { recursive: true })
    }
  })

  test('should create plugin with default options', () => {
    const plugin = new TypeScriptI18nPlugin()

    expect(plugin).toBeDefined()
    expect(plugin).toBeInstanceOf(TypeScriptI18nPlugin)
  })

  test('should create plugin with custom options', () => {
    const plugin = new TypeScriptI18nPlugin({
      enabled: true,
      translationsDir: 'custom/locales',
      outDir: 'custom/dist',
      verbose: true,
      generateSmartTypes: true,
      generateWrappers: false
    })

    expect(plugin).toBeDefined()
    expect(plugin).toBeInstanceOf(TypeScriptI18nPlugin)
  })

  test('should handle disabled plugin', async () => {
    const plugin = new TypeScriptI18nPlugin({
      enabled: false,
      outDir: testDir
    })

    const results = await plugin.initialize()
    expect(results).toEqual([])
  })

  test('should export factory function', async () => {
    expect(typeof createTypeScriptI18nPlugin).toBe('function')
  })

  test('should export types', () => {
    const { TypeScriptI18nPlugin } = require('../src/index')
    expect(typeof TypeScriptI18nPlugin).toBe('function')
  })

  test('should handle cleanup', async () => {
    const plugin = new TypeScriptI18nPlugin({
      enabled: false,
      outDir: testDir
    })

    await expect(plugin.cleanup()).resolves.toBeUndefined()
  })
})
