# ts-i18n CLI Usage Example

This example demonstrates how to create command-line tools using `ts-i18n` for build automation, validation, and development workflows.

## 🛠️ Features

- **CLI Build Script**: Command-line interface with flags and options
- **Help System**: Built-in help and usage documentation
- **Flexible Output**: Configurable output directories and file names
- **Watch Mode**: File watching for development
- **Validation Tools**: Translation completeness checking
- **Verbose Logging**: Detailed build information

## 🚀 Usage

### Basic Build

```bash
bun run build
```

### With Options

```bash
# Verbose output
bun run build -- --verbose

# Custom output directory
bun run build -- --out-dir build/translations

# Minified output
bun run build -- --minify --verbose

# Custom types file location
bun run build -- --types src/types/i18n.d.ts
```

### Watch Mode

```bash
bun run dev
```

### Validation

```bash
bun run validate
```

## 📋 CLI Options

```
🌍 ts-i18n CLI Build Tool

Usage: bun build.ts [options]

Options:
  --verbose, -v     Verbose output
  --watch, -w       Watch for changes
  --minify          Minify JSON output
  --out-dir, -o     Output directory (default: dist/i18n)
  --types, -t       Types file path (default: dist/i18n/types.d.ts)
  --help, -h        Show this help

Examples:
  bun build.ts                           # Basic build
  bun build.ts --verbose                 # Verbose build
  bun build.ts --watch                   # Watch mode
  bun build.ts --out-dir build/i18n      # Custom output
  bun build.ts --minify --verbose        # Minified with logs
```

## 🔧 Integration Examples

### Package.json Scripts

```json
{
  "scripts": {
    "i18n:build": "bun run build.ts",
    "i18n:build:verbose": "bun run build.ts --verbose",
    "i18n:watch": "bun run build.ts --watch",
    "i18n:validate": "bun run validate.ts",
    "prebuild": "npm run i18n:build",
    "dev": "concurrently \"npm run i18n:watch\" \"your-dev-server\""
  }
}
```

### CI/CD Pipeline

```yaml
# GitHub Actions example
- name: Build translations
  run: bun run build.ts --verbose --minify

- name: Validate translations
  run: bun run validate.ts

- name: Check translation completeness
  run: |
    if ! bun run validate.ts | grep -q "100%"; then
      echo "Warning: Translations incomplete"
    fi
```

### Pre-commit Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "🌍 Validating translations..."
if ! bun run validate.ts; then
  echo "❌ Translation validation failed"
  exit 1
fi

echo "🔧 Building translations..."
if ! bun run build.ts; then
  echo "❌ Translation build failed"
  exit 1
fi

echo "✅ Translations validated and built"
```

## 📊 Output Examples

### Basic Build

```bash
$ bun run build
✅ Generated 4 files for 3 locales (127ms)
```

### Verbose Build

```bash
$ bun run build -- --verbose
🌍 ts-i18n CLI Build
===================
Output directory: dist/i18n
Types file: dist/i18n/types.d.ts
Minify: false

📁 Loading translations...
   Found 3 locales: en, es, fr

📄 Generating JSON outputs...
   Created: dist/i18n/en.json
   Created: dist/i18n/es.json
   Created: dist/i18n/fr.json

🔧 Generating TypeScript types...
   Created: dist/i18n/types.d.ts

✅ Build completed successfully!
   Generated 4 files in 127ms
   3 locales processed
```

### Help Output

```bash
$ bun run build -- --help
🌍 ts-i18n CLI Build Tool

Usage: bun build.ts [options]

Options:
  --verbose, -v     Verbose output
  --watch, -w       Watch for changes
  --minify          Minify JSON output
  --out-dir, -o     Output directory (default: dist/i18n)
  --types, -t       Types file path (default: dist/i18n/types.d.ts)
  --help, -h        Show this help
```

## 🎯 Use Cases

This CLI example is perfect for:

- **Build Automation**: Integrate translation building into CI/CD
- **Development Workflow**: Watch mode for instant feedback
- **Quality Assurance**: Automated validation in pre-commit hooks
- **Team Coordination**: Consistent build commands across environments
- **Custom Tooling**: Base for creating your own i18n CLI tools

## 🏗️ Architecture

The CLI tools demonstrate:

1. **Argument Parsing**: Flexible command-line option handling
2. **Error Handling**: Graceful failure with proper exit codes
3. **Progress Reporting**: Informative build progress
4. **File System Operations**: Safe directory and file creation
5. **Validation Logic**: Translation completeness checking
6. **Watch Mode**: File system monitoring for development

This provides a solid foundation for building production-ready i18n tooling!
