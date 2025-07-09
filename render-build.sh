#!/bin/bash
set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the frontend
echo "🔨 Building frontend..."
npx vite build

# Build the backend
echo "🔨 Building backend..."
npx esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/server.js --external:@neondatabase/serverless --external:ws --external:drizzle-orm --external:drizzle-zod --external:zod --format=esm --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"

# Copy static files
echo "📋 Copying static files..."
cp -r client/dist/* dist/
cp package.json dist/

echo "✅ Build complete!"