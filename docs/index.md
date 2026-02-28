---
layout: home

hero:
  name: "ts-i18n"
  text: "TypeScript-First i18n"
  tagline: "Fast, Bun-native internationalization with YAML/TS support, runtime translation, and type generation."
  actions:
    - theme: brand
      text: Get Started
      link: /intro
    - theme: alt
      text: API
      link: /api/
    - theme: alt
      text: View on GitHub
      link: https://github.com/stacksjs/ts-i18n

features:
  - title: "YAML & TypeScript Support"
    details: "Author translations in easy-to-read YAML files or type-safe TypeScript with dynamic value functions."

  - title: "Type Generation"
    details: "Generate type definitions for translation keys. Get full autocomplete and compile-time safety."

  - title: "Dynamic Values"
    details: "Support for interpolation and dynamic messages with parameter type inference from TypeScript files."

  - title: "Fallback Locales"
    details: "Configure fallback locales for missing translations. Never show raw keys to users."

  - title: "Runtime Translator"
    details: "Efficient O(1) translation lookups with pre-flattened lookup maps. Blazing fast at runtime."

  - title: "Per-Locale JSON"
    details: "Generate optimized per-locale JSON bundles for production. Perfect for lazy loading."

  - title: "Framework Agnostic"
    details: "Use with any template engine, React, Vue, or vanilla JavaScript. No framework lock-in."

  - title: "CLI Tools"
    details: "Build, check, and validate translations from the command line. Perfect for CI/CD pipelines."

  - title: "TS-First"
    details: "TypeScript-first by default. Enable YAML parsing only when needed for optimal performance."
---

<Home />
