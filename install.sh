#!/bin/bash

set -e

REPO_URL="https://github.com/ahmadfirdaus06/node-app-module-utils.git"
TMP_DIR=".tmp_module_clone"
SCRIPT_NAME=$(basename "$0")

echo "📦 Cloning full module repo..."
rm -rf "$TMP_DIR"
git clone "$REPO_URL" "$TMP_DIR" > /dev/null

echo ""
echo "📦 Scanning for installable modules..."
MODULES=()
i=1

for dir in "$TMP_DIR"/*/; do
  if [ -f "$dir/install.js" ]; then
    MODULE_NAME=$(basename "$dir")
    echo "  $i. $MODULE_NAME"
    MODULES+=("$MODULE_NAME")
    ((i++))
  fi
done

if [ ${#MODULES[@]} -eq 0 ]; then
  echo "❌ No modules with install.js found."
  rm -rf "$TMP_DIR"
  exit 1
fi

echo ""
read -p "Select a module to install (number): " sel
sel=$((sel-1))
MODULE="${MODULES[$sel]}"

if [ -z "$MODULE" ]; then
  echo "❌ Invalid selection."
  rm -rf "$TMP_DIR"
  exit 1
fi

echo ""
read -p "📁 Enter install path relative to current project (e.g. modules/$MODULE): " REL_DEST

CWD=$(pwd)
SRC="$TMP_DIR/$MODULE"
DEST="$CWD/$REL_DEST"

echo ""
echo "📦 Copying module '$MODULE' to '$REL_DEST'..."
mkdir -p "$DEST"
cp -r "$SRC/"* "$DEST"

# Ensure root package.json exists
if [ ! -f "$CWD/package.json" ]; then
  echo ""
  echo "📄 Root package.json not found. Running 'npm init -y'..."
  npm init -y
fi

# Run install.js
echo ""
echo "📦 Installing module dependencies..."
node "$DEST/install.js"

# Cleanup module files
echo ""
echo "🧹 Cleaning up module install files..."
rm -f "$DEST/install.js"
rm -f "$DEST/package.json"
rm -f "$DEST/package-lock.json"
rm -rf "$DEST/node_modules"
rm -rf "$DEST/examples"

# Cleanup cloned repo
rm -rf "$TMP_DIR"

echo ""
echo "✅ Module '$MODULE' installed to './$REL_DEST' and cleaned."
echo "📦 Source: $REPO_URL"
