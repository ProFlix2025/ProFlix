#!/bin/bash

# Build script for ProFlix deployment
echo "Building ProFlix..."

# Run the Vite build
npm run build

# Copy static files to the correct location for the server
mkdir -p dist/server
cp -r dist/public dist/server/public

echo "Build complete! Static files copied to dist/server/public"
echo "Ready for deployment to Render or other hosting platforms"