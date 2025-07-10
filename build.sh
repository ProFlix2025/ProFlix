#!/bin/bash
echo "🚀 Building ProFlix for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run database schema push
echo "🗄️  Pushing database schema..."
npm run db:push

# Build the project
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"