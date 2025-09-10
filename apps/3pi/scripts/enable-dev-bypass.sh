#!/bin/bash

# Enable development auth bypass
echo "Enabling development auth bypass..."

# Set environment variable for current session
export NEXT_PUBLIC_BYPASS_AUTH=true

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Development Environment Variables
NODE_ENV=development

# Auth Bypass for Development
NEXT_PUBLIC_BYPASS_AUTH=true

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-$(date +%s)

# Database
DATABASE_URL="file:./dev.db"
EOF
    echo "✅ Created .env.local with auth bypass enabled"
else
    echo "✅ .env.local already exists"
fi

echo "🚀 Auth bypass enabled! Restart your dev server to apply changes."
echo "Run: npm run dev"
