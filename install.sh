#!/bin/bash

set -e

# 📍 Use the directory this script is in
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$SCRIPT_DIR"

echo ""
echo "📦 Available modules in '$SOURCE_ROOT':"
MODULES=()
i=1

for dir in "$SOURCE_ROOT"/*/; do
  if [ -f "${dir}install.js" ]; then
    MODULE_NAME=$(basename "$dir")
    echo "  $i. $MODULE_NAME"
    MODULES+=("$MODULE_NAME")
    ((i++))
  fi
done

if [ ${#MODULES[@]} -eq 0 ]; then
  echo "❌ No modules with install.js found."
  exit 1
fi

echo ""
read -p "Select a module to clone (number): " MOD_INDEX
MOD_INDEX=$((MOD_INDEX - 1))
SELECTED_MODULE=${MODULES[$MOD_INDEX]}

if [ -z "$SELECTED_MODULE" ]; then
  echo "❌ Invalid selection."
  exit 1
fi

echo ""
read -p "📁 Enter install path relative to current project (e.g. modules/$SELECTED_MODULE): " REL_DEST_PATH

CWD=$(pwd)
FULL_DEST="$CWD/$REL_DEST_PATH"
FULL_SRC="$SOURCE_ROOT/$SELECTED_MODULE"

echo ""
echo "📦 Copying '$SELECTED_MODULE' to '$REL_DEST_PATH'..."
mkdir -p "$FULL_DEST"
cp -r "$FULL_SRC"/* "$FULL_DEST"

# ✅ Ensure root has package.json
if [ ! -f "$CWD/package.json" ]; then
  echo ""
  echo "📄 Root package.json not found. Running 'npm init -y'..."
  npm init -y
fi

echo ""
echo "📦 Installing dependencies via install.js into root project..."
node "$FULL_DEST/install.js"

echo ""
echo "🧹 Cleaning up module files..."
rm -f "$FULL_DEST/package.json"
rm -f "$FULL_DEST/package-lock.json"
rm -rf "$FULL_DEST/node_modules"
rm -f "$FULL_DEST/install.js"
rm -rf "$FULL_DEST/examples"

echo ""
echo "✅ Done. Module installed to './$REL_DEST_PATH' and cleaned."
