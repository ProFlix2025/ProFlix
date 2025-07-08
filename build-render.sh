#!/bin/bash

# Render-compatible build script
echo "Building ProFlix for Render deployment..."

# Install dependencies
npm install

# Build frontend with npx to ensure vite is found
npx vite build

# Build server with npx to ensure esbuild is found
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build complete!"
echo "Frontend built to: dist/public/"
echo "Server built to: dist/index.js"
echo "Ready for deployment with 'node dist/index.js'"