import { test, expect, describe } from 'bun:test'
import { i18nBunPlugin } from '../src/index'

describe('bun-plugin-i18n', () => {
  test('should create plugin with default options', () => {
    const plugin = i18nBunPlugin()

    expect(plugin).toBeDefined()
    expect(plugin.name).toBe('bun-plugin-i18n')
    expect(typeof plugin.setup).toBe('function')
  })

  test('should create plugin with custom options', () => {
    const plugin = i18nBunPlugin({
      enabled: true,
      translationsDir: 'custom/locales',
      outDir: 'custom/dist',
      verbose: true
    })

    expect(plugin).toBeDefined()
    expect(plugin.name).toBe('bun-plugin-i18n')
  })

  test('should handle disabled plugin', () => {
    const plugin = i18nBunPlugin({ enabled: false })

    expect(plugin).toBeDefined()
    expect(plugin.name).toBe('bun-plugin-i18n')
  })

  test('should export types', () => {
    const { i18nBunPlugin } = require('../src/index')
    expect(typeof i18nBunPlugin).toBe('function')
  })
})
