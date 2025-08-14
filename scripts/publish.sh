#!/bin/bash

# Exit on error
set -e

# Enable debug if needed
# set -x

echo "Publishing all packages..."

# Track statistics
total_packages=0
published_packages=0
skipped_packages=0

for dir in packages/*/ ; do
  if [ -d "$dir" ]; then
    package_name=$(basename "$dir")
    package_json="$dir/package.json"
    total_packages=$((total_packages + 1))

    echo "----------------------------------------"
    echo "Processing $package_name..."

    # Determine if package is private (robust, defaults to true on parse failure)
    if command -v jq >/dev/null 2>&1; then
      # Prefer jq when available
      is_private=$(jq -r '.private // false' "$package_json" 2>/dev/null || echo "true")
    elif command -v bun >/dev/null 2>&1; then
      # Use Bun APIs; default to true if parsing fails
      is_private=$(bun --eval "let v='true'; try { const text = await Bun.file('$package_json').text(); const pkg = JSON.parse(text); v = pkg.private === true ? 'true' : 'false'; } catch {} console.log(v);" 2>/dev/null || echo "true")
    else
      # Fallback to grep; not perfect but avoids crashing
      private_check=$(grep -E '"private":\s*true' "$package_json" 2>/dev/null || echo "")
      if [ -n "$private_check" ]; then
        is_private="true"
      else
        is_private="false"
      fi
    fi

    if [ "$is_private" = "true" ]; then
      echo "✓ Skipping $package_name (private package)"
      skipped_packages=$((skipped_packages + 1))
    else
      echo "✓ Publishing $package_name..."
      cd "$dir"
      if bun publish --access public; then
        echo "✓ Successfully published $package_name"
        published_packages=$((published_packages + 1))
      else
        echo "✗ Failed to publish $package_name"
        exit 1
      fi
      cd - > /dev/null  # Suppress the directory change message
    fi

    echo "----------------------------------------"
  fi
done

echo ""
echo "Publishing Summary:"
echo "  Total packages: $total_packages"
echo "  Published: $published_packages"
echo "  Skipped (private): $skipped_packages"
echo ""

if [ $published_packages -gt 0 ]; then
  echo "✓ All public packages published successfully!"
else
  echo "ℹ No packages were published (all packages are private)"
fi
