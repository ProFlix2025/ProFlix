#!/bin/bash

# Render deployment script for ProFlix
echo "🚀 Starting ProFlix build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install drizzle-kit globally for production
echo "🔧 Installing drizzle-kit..."
npm install -g drizzle-kit

# Create database schema directly
echo "🔄 Creating database schema..."
drizzle-kit push || echo "⚠️ Database schema will be created at runtime"

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build complete! ProFlix is ready for deployment."