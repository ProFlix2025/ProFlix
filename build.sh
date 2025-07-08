#!/bin/bash

# Build script for ProFlix deployment
echo "Building ProFlix for Render deployment..."

# Run the Vite build (creates dist/public/)
vite build

# Build the server (creates dist/index.js)
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build complete!"
echo "Frontend built to: dist/public/"
echo "Server built to: dist/index.js"
echo "Ready for Render deployment with 'node dist/index.js'"