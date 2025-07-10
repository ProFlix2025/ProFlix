#!/bin/bash
echo "🚀 Building ProFlix for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run database schema push with updated syntax
echo "🗄️  Pushing database schema..."
npx drizzle-kit push

# Build the project
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"