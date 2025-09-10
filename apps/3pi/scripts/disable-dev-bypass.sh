#!/bin/bash

# Disable development auth bypass
echo "Disabling development auth bypass..."

# Remove the bypass environment variable
if [ -f .env.local ]; then
    # Remove the bypass line from .env.local
    sed -i '' '/NEXT_PUBLIC_BYPASS_AUTH/d' .env.local
    echo "✅ Removed auth bypass from .env.local"
else
    echo "⚠️  No .env.local file found"
fi

echo "🔒 Auth bypass disabled! Restart your dev server to apply changes."
echo "Run: npm run dev"
